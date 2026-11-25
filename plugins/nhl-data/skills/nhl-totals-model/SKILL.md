---
name: nhl-totals-model
description: "Use when the user asks to model NHL game totals, predict total goals, how many goals a game will have, over/under probability, scoring pace, or whether a goalie matchup changes scoring. Builds a calibrated total-goals distribution from the PuckAPI MCP server and compares it to the market total as a probability gap. Not for who wins or the puck line (use model-building). Not for player goal or point props (use nhl-player-props-research). Not for just viewing current lines (use nhl-odds-explorer)."
metadata:
  version: 2.0.0
  author: SportsDataHQ
---

# Totals Modeling

> **Data:** the PuckAPI MCP server (`nhl-puckapi-tools`).
> Use `get_team_stats` for pace and special teams rates (5 credits), `get_goalie_stats` for starter quality (5 credits), `get_games` for historical game totals (5 credits), `get_odds` for market line context (10 credits).
> For the user's own CSV/JSON, work with the file directly.

You are an expert in hockey over/under prediction. Your goal is to build a calibrated totals model that estimates the probability distribution of total goals in an NHL game, then compare it to the market total to show how our probability differs from the market probability. Odds are information only: no stake sizing, no advice to wager.

## When to Use

- User asks about over/under modeling or totals prediction
- User wants to predict how many goals will be scored in a game
- User asks about NHL scoring rates, pace metrics, or goal environment
- User wants to see how the model total differs from the market total
- User asks about goalie matchup effects on scoring
- User asks about the "under bias" at 5.5+

## When NOT to Use

- Predicting which team wins: see `model-building`
- Spread / puck-line prediction: see `model-building` (totals and spreads share some features but are separate models)
- Player-level goal/point props: see `nhl-player-props-research`
- Exploring current odds lines without modeling: see `nhl-odds-explorer`
- Analyzing team offensive/defensive quality in isolation: see `nhl-team-analysis`

## Commands Available

| Command | What It Does | Credits |
|---------|-------------|---------|
| `get_games` | Historical game results with total goals scored | 5 |
| `get_team_stats` | Shots per 60, scoring rate, PP%, PK% | 5 |
| `get_goalie_stats` | Starter SV%, GAA, GSAA, recent form | 5 |
| `get_standings` | Win/loss records for SOS context | 2 |
| `get_odds` | Market total line and prices (information only) | 10 |
| `get_game_probabilities` | Market implied and fair (no-margin) probability for a game | 5 |
| `get_head_to_head` | Historical scoring in prior matchups | 10 |

## Commands That Do NOT Exist

| Not Available | Use Instead |
|--------------|-------------|
| `get_game_totals` | Use `get_games` and sum home + away goals |
| `get_pace_stats` | Compute from `get_team_stats` (shots per 60 is a pace proxy) |
| `get_scoring_environment` | Compute from `get_games` rolling averages per team |
| `get_goalie_starter` | Use `get_goalie_stats`: most recent starter inference from recent start dates |
| `get_venue_stats` | Not available; compute home-game averages from `get_games` filtered by location |

## Data Source

**PuckAPI MCP server:** Pull `get_games` for historical game log with total goals. Pull `get_team_stats` for pace and special teams. Pull `get_goalie_stats` for both starting goalies.

**Your own data:** If user provides CSV/JSON:
1. Verify required columns: `game_date`, `home_team`, `away_team`, `home_goals`, `away_goals` (to compute total), `home_starter_sv_pct`, `away_starter_sv_pct`, `home_shots_per_60`, `away_shots_per_60`, `home_pp_pct`, `away_pp_pct`, `home_pk_pct`, `away_pk_pct`
2. Verify ISO 8601 date format
3. Flag missing goalie data: goalie features are the highest-value signal and cannot be silently imputed
4. Note: credits are not consumed

## Initial Assessment

Before building, establish:
1. What is the target? (total goals, or binary over/under at a specific line like 5.5?)
2. Which market total is the comparison point? (the consensus from `get_game_probabilities`, or one book from `get_odds`)
3. How many seasons of data are available? (totals models need 3+ seasons for stable goalie coefficients)

## How It Works

### Why Totals Are a Separate Model

A team can win 1-0 or win 7-5. The moneyline model doesn't care which. The totals model cares about nothing else. Different features, different calibration, different market dynamics.

Key differences from moneyline:
- **Goalie quality matters more.** A bad goalie matchup adds 0.5-1.0 expected goals. That moves the line by a full half-goal.
- **Pace metrics replace matchup metrics.** You care how fast both teams play, not which is better.
- **Special teams add total goals, not change winners.** PP% affects scoring rate for both teams simultaneously.
- **Rest/fatigue increases scoring.** Back-to-back games produce measurable total goal increases (tired defense, looser play).

### Step 1: Build the Target

```python
df['total_goals'] = df['home_goals'] + df['away_goals']

# For binary over/under at line L
df['over_5_5'] = (df['total_goals'] > 5.5).astype(int)  # over = 1
df['over_6_0'] = (df['total_goals'] > 6.0).astype(int)
```

Build both a regression target (total goals) and binary classification targets (over/under at each line). They inform each other during validation.

### Step 2: Feature Set: Pace Metrics

Pull `get_team_stats` for both teams. Apply `.shift(1)` before any rolling calculation.

**Shots per 60 (both teams combined):**
```python
df['total_shots_per_60'] = df['home_shots_per_60_roll10'] + df['away_shots_per_60_roll10']
```

Higher combined shots per 60 = higher expected total. This is the primary pace driver.

**Scoring chances per 60:** If available, prefer scoring chances over raw shots. Scoring chances are more predictive of goals than shot counts.

**Goals per game rolling average (lagged):**
```python
df['home_gf_roll10'] = home_goals shifted and rolled over 10 games
df['away_ga_roll10'] = away_goals_against shifted and rolled over 10 games
df['expected_total_simple'] = df['home_gf_roll10'] + df['away_ga_roll10']
# also compute: away_gf_roll10 + home_ga_roll10
```

### Step 3: Feature Set: Special Teams

PP% for both teams + PK% for both teams. These interact:

```python
# Net PP effect on scoring rate
df['home_pp_gap'] = df['home_pp_pct_roll10'] - df['away_pk_pct_roll10']
df['away_pp_gap'] = df['away_pp_pct_roll10'] - df['home_pk_pct_roll10']
df['combined_pp_quality'] = df['home_pp_gap'] + df['away_pp_gap']
```

Power play opportunities per game (not just conversion rate): a team that draws more penalties gives more scoring chances regardless of PP%.

### Step 4: Feature Set: Goalie Matchup

This is the highest-leverage feature group. Goalie quality variance accounts for a larger share of total goals prediction than any other single input.

```python
# Season SV% (lagged to current game)
df['home_starter_sv_pct'] = home_goalie_sv_pct_prior_to_game
df['away_starter_sv_pct'] = away_goalie_sv_pct_prior_to_game

# Combined goalie quality (lower = more goals expected)
df['combined_goalie_quality'] = df['home_starter_sv_pct'] + df['away_starter_sv_pct']

# Recent form (last 5 starts, by start date)
df['home_starter_sv_pct_l5'] = rolling SV% over last 5 starts for starter
df['away_starter_sv_pct_l5'] = same for away starter

# Confirmed starter flag (known before game time)
df['home_starter_confirmed'] = 1 if starter announced, 0 if uncertain
```

**If starter is unconfirmed:** Use team backup SV% as a downside scenario. Weight predictions toward higher-scoring outcomes when starter is uncertain.

### Step 5: Feature Set: Contextual Factors

**Back-to-back effect:**
```python
df['home_b2b'] = (df['home_rest_days'] == 0).astype(int)
df['away_b2b'] = (df['away_rest_days'] == 0).astype(int)
df['either_b2b'] = ((df['home_b2b'] == 1) | (df['away_b2b'] == 1)).astype(int)
```

Back-to-back games increase total goals by approximately 0.2-0.4 goals. Tired defense and a fatigued backup goalie are the mechanisms.

**Time of season:**
```python
df['games_into_season'] = game number (1-82) within the season
df['early_season'] = (df['games_into_season'] <= 20).astype(int)
```

Early-season games produce more goals: goalies aren't sharp, defensive systems aren't set. This effect diminishes after ~game 20.

**Head-to-head scoring history:** Use `get_head_to_head` for last 5 meetings. High-scoring rivalry vs defensive rivalry carries predictive signal, though it's weaker than pace and goalie matchup.

### Step 6: Train the Totals Model

Use XGBoost or LightGBM. Regression target preferred over binary classification: regression gives you the full probability distribution.

```python
from xgboost import XGBRegressor

model = XGBRegressor(
    n_estimators=400,
    max_depth=4,
    learning_rate=0.04,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42
)
model.fit(X_train, y_train)  # y_train = total_goals
```

To get over/under probabilities from the regression output, assume a Poisson or normal distribution around the predicted mean:
```python
from scipy.stats import poisson

predicted_total = model.predict(X_game)[0]
prob_over_5_5 = 1 - poisson.cdf(5, mu=predicted_total)  # P(goals >= 6)
```

### Step 7: Calibration and the 5.5 Pattern

**Hypothesis to test, not assume:** games with the total set at 5.5 may go under more often than the market-implied probability says. Its persistence varies by season, so test it in your data and report it by season:
```python
line_55_games = df[abs(df['market_line'] - 5.5) < 0.1]
actual_over_rate = line_55_games['over_5_5'].mean()
implied_over_rate = 1 - line_55_games['implied_under_prob'].mean()
gap = actual_over_rate - implied_over_rate  # negative = unders happened more than the market probability implied
```

Use the fair (no-margin) probability from `get_game_probabilities` for the implied rate. Report the sample size and an interval for each season. If the pattern holds across seasons in walk-forward validation, it is a real signal about the market. If it only shows up in-sample, it is noise.

**Calibration check:** Bin predicted probabilities into deciles. Check that games in the "60-70% over" bucket actually go over 60-70% of the time. Use isotonic regression or Platt scaling if calibration is off.

### Step 8: Walk-Forward Validation

Use identical methodology to `walk-forward-validation` skill. Train on seasons 1-N, test on season N+1. Never use k-fold on time series.

For totals, the key metric is **RMSE on total goals** and **calibrated Brier score** on over/under binary targets at each line (5, 5.5, 6, 6.5).

## Season Resolution

- October through December: current calendar year is the season start (2026-27 season)
- January through September: previous calendar year is the season start (2025-26 season)
- "This season" = season currently in progress or most recently completed
- NHL regular season: October to April. Playoffs: April to June.

## Credit Usage

| Operation | Credits | Notes |
|-----------|---------|-------|
| `get_games` per season | 5 | Full season game log |
| `get_team_stats` per team | 5 | 32 teams = 160 credits |
| `get_goalie_stats` per goalie | 5 | ~60 starters per season = 300 credits |
| `get_odds` per game | 10 | Only needed for the market comparison |
| Full training dataset (3 seasons, no odds) | ~1,395 | Games + team stats + goalies |
| Adding odds for the market comparison (3 seasons) | ~3,936 | ~1,312 games/season * 10 |

## Rules for numbers

- Call the PuckAPI tools for every game, rate and line; never quote totals or goalie numbers from memory.
- Cite which tool call produced each number (`get_games` for totals, `get_odds` or `get_game_probabilities` for market figures).
- State the sample size (games per line, per season), an interval for each rate, and the season convention (`20252026` = 2025-26).
- If goalie or odds data is missing for a game, say "not enough data" for that game instead of guessing.

## Anti-patterns

| Rationalization | Why It's Wrong | Do This Instead |
|----------------|---------------|-----------------|
| "I'll use the same features as my moneyline model" | Pace metrics matter here; team quality metrics matter there. Overlap exists but the feature importance ranking is different | Build totals features explicitly; validate feature importance separately |
| "Goalie data is annoying: I'll skip it" | Goalie matchup is the highest-leverage feature in totals prediction; skipping it caps your ceiling | Pull `get_goalie_stats` and derive starter feature even if it requires extra calls |
| "k-fold cross-validation is standard" | NHL game totals are time-series data; k-fold leaks future seasons into training | Walk-forward by season only |
| "Calibration doesn't matter for totals" | Miscalibrated totals probabilities produce a misleading model vs market gap | Calibrate separately from moneyline; binomial confidence intervals on each line |
| "One model handles all lines" | 5.0 vs 6.5 totals markets have different over rates and different patterns | Validate at each line separately; consider line-specific adjustments |
| "The 5.5 pattern is permanent" | Market patterns fade when prices adjust | Re-test every season; treat it as a signal with decay |

## Output Format

The totals model produces:

1. **Game-level predictions**: `predicted_total_goals` (float), `prob_over_5` (float), `prob_over_5_5` (float), `prob_over_6` (float), `prob_over_6_5` (float).
2. **Model vs market gap** (if odds pulled): our probability minus the market fair probability for each line. Positive means our model gives the over a higher probability than the market does; negative means lower. This describes the difference, not an instruction.
3. **Model performance**: RMSE on total goals, Brier score at each line, calibration curve per line.
4. **Feature importance**: ranked list showing which features drove total goals predictions in walk-forward test folds.

## What to Do Next

| What You Found | Next Action | Skill |
|----------------|-------------|-------|
| Totals model built, want to compare with the market | Model vs market gap | `market-vs-model` |
| Need better features: goalie data is weak | Pull and clean goalie starter data | `feature-engineering` |
| Want totals in the daily workflow | Add totals to the daily slate | `nhl-daily-slate` |
| Calibration is off | Recalibrate using isotonic regression | `probability-calibration` |
| Want to backtest the totals model | Score predictions by season with sample sizes and intervals | `backtesting` |
| Suspect under bias is real: want to validate | Test the pattern in walk-forward | `walk-forward-validation` |
