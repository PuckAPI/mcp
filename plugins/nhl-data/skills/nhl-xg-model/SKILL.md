---
name: nhl-xg-model
description: "Use when the user wants to build or train their own hockey shot-quality model, in fan or analyst wording: 'train an xG model', 'score the quality of every shot', 'LightGBM on shot outcomes', 'how do I model shot danger from coordinates', 'make my own xGF%', 'detect rebounds and rush shots', 'chance a wrist shot from the slot scores', 'fit goal probability on shot events'. Use this whenever the task is fitting a model to shots rather than reading existing numbers. Load it for short fragments and follow-ups too, instead of going straight to the raw tools. Trains XGBoost or LightGBM on shot events and locations with a time-ordered split, and reports log loss and calibration. Not for existing xG numbers (see nhl-advanced-stats or nhl-xg-report), game win models (see model-building) or goalie evaluation (see nhl-goalie-analysis)."
metadata:
  version: 2.0.0
  author: SportsDataHQ
---

# xG Model Building

> **Data:** the PuckAPI MCP server (`nhl-puckapi-tools`) has shot-level data.
>
> - `get_shot_map` (10 credits) returns shot locations to plot or model.
> - `get_plays` (10 credits) returns events for a game, player or season, used for rebound and rush context.
> - `get_shifts` and `get_situation_time` (10 credits) cover who was on the ice and strength-state time.
> - `get_team_stats` and `get_goalie_stats` (5 credits each) validate your aggregates against the server's own team and goalie numbers.
>
> For the user's own shot data CSV/JSON, work with the file directly.

You are an expert in hockey expected goals modeling. Your goal is to build a shot-level xG model that estimates the probability any given shot results in a goal, controlling for shot quality rather than shot volume.

## When to Use

- User asks "how do I build an xG model"
- User wants to model shot probability or goal probability from play-by-play data
- User wants to compute xGF%, xGA, or expected goals for teams or players
- User asks about rebound detection, rush shot detection, or shot angle features
- User wants to replicate or improve a public xG methodology
- User asks about strength-state-specific (5v5, PP, SH, EN) goal models

## When NOT to Use

- Using xG values that already exist: to analyze teams with pre-built xG, see `nhl-team-analysis` or `nhl-advanced-stats`
- Predicting game outcomes (win/loss): see `model-building`
- Evaluating goalie quality using xGA: see `nhl-goalie-analysis`
- General feature engineering for non-xG features: see `feature-engineering`

## Data Sources

### PuckAPI MCP server

| Command | What It Does | Credits |
|---------|-------------|---------|
| `get_shot_map` | Shot locations for a game, player or team | 10 |
| `get_plays` | Event-level play-by-play (shots, goals, misses, blocks, strength state, time) | 10 |
| `get_games` | Game list to get game IDs | 5 |
| `get_team_stats` | Team-level shot and goal summaries to validate your xGF% | 5 |
| `get_goalie_stats` | Goalie totals to validate xGA | 5 |

Inspect the fields a call returns before assuming a column exists, and map them to the names below. Shot events typically carry an event type (shot, goal, miss, block), x/y coordinates (feet, center ice = 0,0), shot type, strength state, period and game time, and shooter and goalie IDs.

### Your Own Data

If user provides CSV/JSON:
1. Verify required columns: `x_coord`, `y_coord`, `shot_type`, `strength_state`, `period`, `game_seconds`, `event_type` (SHOT/GOAL/MISS/BLOCK), `shooter_id`, `goalie_id`
2. Verify coordinate system is consistent (NHL uses feet, center ice = 0,0)
3. Flag missing coordinates: do not silently drop
4. No credits consumed

## Commands That Do NOT Exist

| Not Available | Use Instead |
|---------------|-------------|
| `get_xg_model` | Build the model yourself from `get_shot_map` and `get_plays` |
| Bulk shot export in one call | Pull per game or per player and aggregate; agree the scope with the user first, since each call costs credits |
| Screen or traffic data, shot velocity | Not available; document as a known model limitation |

## Initial Assessment

Before building, establish:
1. What is the data source? (PuckAPI shot data, or the user's own file)
2. How many seasons? (1 season minimum; 3+ seasons produces more stable coefficients)
3. What is the end use? (team-level xGF%, player-level scoring, goalie evaluation: determines how to aggregate shot-level predictions)

## How It Works

### Step 1: Collect Shot Events

Pull shot events with `get_shot_map` and `get_plays` and filter to shot events:
- `SHOT` (on goal, saved)
- `GOAL`
- `MISS` (missed net)
- `BLOCK` (blocked before reaching goalie)

Set target: `is_goal = 1` if event_type is GOAL, else 0.

**Important:** Include blocked shots in the model but treat them carefully: some public models exclude blocks and others include them. Document the choice.

### Step 2: Compute Core Features

See `xg-features.md` for the complete feature table with formulas. Core features:

**Location:**
- `shot_distance`: Euclidean distance from shot coordinates to net center
- `shot_angle`: Absolute angle from net-center axis

**Shot type:** One-hot encode: wrist, slap, snap, backhand, tip, deflection, wrap-around. Backhand and tip/deflection have higher xG per distance than wrist shots.

**Strength state:** One-hot encode: 5v5, PP, SH, EN. Train separate models per strength state (Step 4).

**Time context:**
- `seconds_since_last_event`: time elapsed since the prior event
- `distance_from_last_event`: Euclidean distance between shot coordinates and prior event coordinates

### Step 3: Derive Rebound and Rush Features

These are the features that separate public xG models from naive distance-only models.

**Rebound detection:**
```python
df['is_rebound'] = (
    (df['seconds_since_last_event'] < 3) &
    (df['last_event_type'].isin(['SHOT', 'GOAL', 'MISS']))
).astype(int)
```

**Rush detection (zone entry proxy):**
```python
df['is_rush'] = (
    (df['seconds_since_last_event'] < 4) &
    (df['distance_from_last_event'] > 30)  # feet, large spatial jump = transition
).astype(int)
```

**Shot angle change rate (rebound angle speed):**
```python
df['rebound_angle_speed'] = df['is_rebound'] * df['shot_angle_change'] / df['seconds_since_last_event'].clip(lower=0.1)
```

### Step 4: Train Separate Models Per Strength State

Train four separate XGBoost (or LightGBM) classifiers:
1. **5v5** (largest sample, most stable)
2. **PP** (power play: angle matters more, distance less because shots cluster high slot)
3. **SH** (shorthanded: small sample, may need regularization)
4. **EN** (empty net: high conversion; EN shots are nearly deterministic by distance)

```python
from xgboost import XGBClassifier

models = {}
for state in ['5v5', 'PP', 'SH', 'EN']:
    subset = df[df['strength_state'] == state]
    X = subset[FEATURE_COLS]
    y = subset['is_goal']
    models[state] = XGBClassifier(
        n_estimators=300,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        eval_metric='logloss',
        random_state=42
    )
    models[state].fit(X, y)
```

### Step 5: Evaluate the Model

**Shot-level evaluation:**
- **Brier score**: lower is better. Always compare against a distance-only logistic baseline on the same held-out seasons and report both.
- **Calibration curve**: plot predicted xG decile vs actual goal rate. A well-calibrated model's curve should lie on the diagonal.
- **Log loss**: report alongside Brier, with the held-out sample size.

**Team-level validation:**
```python
# Sum shot-level xG per team per game: compare to actual goals
df['xg'] = df.apply(lambda r: models[r['strength_state']].predict_proba([r[FEATURE_COLS]])[0][1], axis=1)
team_xg = df.groupby(['game_id', 'team'])['xg'].sum()
```

Compare your `xGF/xGA` per team against the expected-goals figures the server returns from `get_team_stats` (5 credits) and `get_standings` (2 credits). Report the correlation and the number of teams; a high correlation (for example above 0.85) means your aggregates track the server's. Differences are expected because the models differ.

### Step 6: Aggregate to Team Level

```python
# xGF% (5v5 only: standard)
xg_5v5 = df[df['strength_state'] == '5v5'].groupby(['game_id', 'team'])['xg'].sum()
team_xgf_pct = xg_5v5 / (xg_5v5.groupby('game_id').transform('sum'))
```

`xGF%` is the primary team-level output. Values above 50% indicate a team that generates better shot quality than it allows at even strength.

## Season Resolution

- October through December: current calendar year is the season start (e.g., 2026-27 season)
- January through September: previous calendar year is the season start (e.g., 2025-26 season)
- "This season" = season currently in progress or most recently completed
- NHL regular season: October to April. Playoffs: April to June.

## Credit Usage

| Operation | Credits | Notes |
|-----------|---------|-------|
| `get_shot_map` per call | 10 | Scope by game, player or team |
| `get_plays` per call | 10 | Event context for rebound and rush features |
| `get_team_stats` (validation) | 5 | Compare your xGF% to the server's team stats |
| `get_goalie_stats` (validation) | 5 | Compare your xGA to goalie stats |
| `get_games` (get game IDs) | 5 | Pull the game list first |

A full season is about 1,312 games, so a full-season pull is expensive. Start with one team or a few months and confirm scope with the user before bulk pulls.

## Rules for numbers

- Call the tools for every shot and rate; never quote xG, xGF% or save figures from memory.
- Cite which tool call produced each input and aggregate (for example "shots from `get_shot_map`, team totals checked against `get_team_stats`").
- State the sample size (shots and games per strength state), the season convention (`20252026` = 2025-26) and the held-out seasons used for evaluation.
- If a strength state has too few shots to train or score reliably, say "not enough data" instead of guessing.

## Anti-patterns

| Rationalization | Why It's Wrong | Do This Instead |
|----------------|---------------|-----------------|
| "One model for all strength states is simpler" | PP and SH have fundamentally different shot distributions; a combined model learns the average and is wrong for both | Train separate models per strength state |
| "Distance alone is good enough" | Distance-only models miss rebound and rush context, which account for ~15% of xG variance | Include rebound flag and rush flag at minimum |
| "k-fold cross-validation is fine for shot data" | Shots within a game are correlated; k-fold leaks game-level context across folds | Group k-fold by game_id or season |
| "Blocked shots should be included the same as saved shots" | Blocked shots are a different event with different outcome distribution; mixing them without a flag distorts calibration | Either exclude blocks or include a `is_blocked` indicator |
| "I'll validate against total goals only" | Total goals validation misses calibration problems at the shot level | Validate Brier score at shot level AND team-level xGF% correlation |
| "Screen/traffic data isn't available so skip it" | Acknowledging the gap is correct: just document it as a known model limitation | Note it as a known gap; tracking data may expose it in future |
| "I'll use `get_game_detail` for shot data" | It returns game-level data, not shot events | Use `get_shot_map` and `get_plays` |

## Output Format

The xG model produces:

1. **Shot-level xG values**: DataFrame with `game_id`, `event_id`, `shooter_id`, `team`, `strength_state`, `xg` (float 0-1), and all computed features.
2. **Team-game xG aggregates**: `xGF` and `xGA` per team per game per strength state.
3. **Season xGF%** (5v5): one value per team, used as input to `nhl-team-analysis` or `feature-engineering`.
4. **Model artifacts**: serialized XGBoost models per strength state (`.pkl` or `.json`), feature names, and Brier score per strength state.
5. **Calibration report**: predicted vs actual goal rate by decile for each strength state model.

## What to Do Next

| What You Found | Next Action | Skill |
|----------------|-------------|-------|
| xG model built, want to use it as a prediction model feature | Add xGF% as a lag feature | `feature-engineering` |
| Team xGF% computed, want to analyze team quality | Use xGF% alongside Corsi and PDO | `nhl-team-analysis` |
| Goalie xGA computed, want to evaluate goalie quality | xGA is the input to GSAA calculation | `nhl-goalie-analysis` |
| Model is built, want to compare with the market | How the xG-implied win probability differs from the market probability | `market-vs-model` |
| Want to validate the model with proper temporal splits | Hold out full seasons for out-of-sample testing | `walk-forward-validation` |
| Calibration curve is off | Recalibrate probabilities with isotonic regression or Platt scaling | `probability-calibration` |
