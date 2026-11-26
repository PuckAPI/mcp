---
name: nhl-player-props-research
description: "Use when the user asks about an NHL player's prop line or stat for a game, in fan or analyst wording: 'MacKinnon shots line', 'will Draisaitl score tonight', 'Kucherov points number', 'does he go over his assists line', 'how has his points line moved', 'how often does he cash the over', 'saves total for Shesterkin', 'anytime goal chances for Ovi', 'who is likely to score tonight'. Use this whenever a hockey player is mentioned with a line, over or under, or shots, goals, assists, points or saves for a game. Load it for short fragments and follow-ups too, even with no name given, instead of answering from memory or going straight to the raw tools. Shows lines by sportsbook, the player's record against his line with sample size, movement, our projection and the no-margin market probability. Never says which side to take. Not for game totals (see nhl-totals-model), game odds (see nhl-odds-explorer), scouting (see nhl-player-scouting) or building a model."
metadata:
  version: 2.2.0
  author: SportsDataHQ
---

# NHL Player Props Research

> **Data:** the PuckAPI MCP server (`nhl-puckapi-tools`).
> Player and line tools: `search_players` (2 credits), `get_player_game_log` (5), `get_skater_season_stats` (5), `get_goalie_stats` (5), `get_team_stats` (5), `get_player_props` (10), `get_prop_history` (10), `get_prop_movement` (10), `get_prop_probabilities` (10), `get_prop_backtest` (25), `get_prop_projections` (25, paid plans only; a free-plan call is refused and charged nothing).

You are an analyst projecting individual player stats for one game and showing how those projections sit against the lines the market has posted. Prop lines are information about the market. This skill does not recommend wagers, size stakes or call anything a pick. A past hit rate is a description of the past, never a forecast to act on.

## When to Use

- Project a player's points, goals, assists or shots on goal for a game
- Project a goalie's saves
- Anytime goalscorer probability
- How a player has done against his prop line, game by game
- How a prop line moved before a game
- How often a kind of prop has hit against the market (a backtest)
- Ice time as the base of a projection

## When NOT to Use

- Which team wins: `model-building`
- Player comparison or scouting without a projection: `nhl-player-scouting`
- Looking at current lines only: `nhl-odds-explorer`
- A whole season of goalie quality: `nhl-goalie-gsax-report`
- Game totals: `nhl-totals-model`
- Comparing any model with the market in general: `market-vs-model`

## Tools

| Tool | What it gives | Credits |
|------|--------------|---------|
| `search_players` | Player ID from a name | 2 |
| `get_player_game_log` | Game-by-game stat lines, including ice time where returned | 5 |
| `get_skater_season_stats` | Skater season leaderboard | 5 |
| `get_goalie_stats` | Goalie saves, shots against, save percentage, starts | 5 |
| `get_team_stats` | Opponent shot and goal rates | 5 |
| `get_player_props` | Prop lines by book (points, goals, assists, shots, saves, anytime scorer) | 10 |
| `get_prop_history` | How a player did against his line, game by game | 10 |
| `get_prop_movement` | How a line moved before a game | 10 |
| `get_prop_probabilities` | Market implied and fair (no-margin) probability for a game's props | 10 |
| `get_prop_projections` | Our projected goals, assists, points, shots and saves for tonight's players, with over probabilities | 25 (paid plans only) |
| `get_prop_backtest` | How often a kind of prop hit against the market, without pulling every row | 25 |
| `get_shifts`, `get_situation_time` | Shift detail and exact 5v5, power-play and short-handed time | 10 each (per game) |

Not available: lineup and power-play unit assignments, confirmed starting goalies before game day, an injury report. State that these are unknown rather than guessing.

## When no line is posted

Off-season, or the book hasn't posted yet: don't stop to ask. Give the player's record against his line over his last completed season (`get_prop_history` with that season's dates), his current form from game logs, and say lines aren't up yet. Never invent a line.

## The analyst layer

Go one step past the raw hit rate:
- **Across books:** the highest and lowest line or price on offer and the spread between them.
- **Over time:** the hit rate this season and last season separately, each with n.
- **Context split:** the same rate in the games that look like tonight's (minutes or workload for the player, home/away, favourite/underdog).
State each with its sample size; skip a split with fewer than 8 games and say why.

## Rules for numbers

- Call the tools. Never answer from memory.
- Cite which tool call produced each number.
- State the sample size (games in the window) and the season convention (the tools take an 8-digit season id, 20252026 for 2025-26).
- If a player has too few games, or a starter is unconfirmed for a saves prop, write "not enough data" and give no number.
- A projection is an estimate with a range, not a fact.

## How It Works

### Step 0: Start with our projection if you have access

On a paid plan, `get_prop_projections` returns our projections and over probabilities for tonight's players. Use them as the primary numbers and cite them. On a free plan, build a simple projection with the steps below.

### Why props are hard

A single game is a small sample. A player at 0.5 points per game has a standard deviation near 0.7 points. Calibration matters more, per-player samples are small (at most 82 games a season), and context (opponent, linemates, power-play time) matters more.

### Step 1: Ice time first

Pull `get_player_game_log` and project ice time from rolling recent games, home or away, back-to-back, and power-play role. A trade or line change is a break: reset the rolling window.

```python
from sklearn.linear_model import Ridge
toi_model = Ridge(alpha=1.0).fit(X_toi_train, y_toi_train)
projected_toi = toi_model.predict(X_game)
```

### Step 2: Per-60 rates scaled to projected time

```python
points_per_60 = points_l10 / toi_l10_minutes * 60
projected_points = (projected_toi / 60) * points_per_60
```

Same for shots on goal and goals.

### Step 3: Opponent adjustment

Use `get_team_stats` for the opponent's goals and shots allowed against the league average, and `get_goalie_stats` for the opposing goalie. Keep the adjustment modest and report it.

### Step 4: Power-play context

Use `get_situation_time` for exact power-play minutes where you need it, or the share of ice time on the power play from the game log. Treat an inferred power-play role as an assumption and say so.

### Step 5: Saves (separate model)

Projected saves = projected shots against (from the opponent's shot rate) x the goalie's save percentage. A confirmed start is required. If it is unconfirmed, write "starter unconfirmed, no saves projection" and stop.

### Step 6: Probability from a projection

Counting stats follow roughly a Poisson shape:

```python
from scipy.stats import poisson
p_over_2_5_shots = 1 - poisson.cdf(2, mu=projected_shots)
p_anytime_goal = 1 - poisson.cdf(0, mu=projected_goals)
```

This is an approximation: shots within a game are correlated. Say so.

### Step 7: Compare with the market

Call `get_player_props` for the posted line and `get_prop_probabilities` for the market's fair probability. Report:

- Our probability for the line
- The market's fair (no-margin) probability
- The difference in points, labelled "model vs market gap"

Say that this shows how our probability differs from the market's. It is not an instruction to wager.

### Step 8: History and movement

`get_prop_history` shows how the player did against this line game by game (report the number of games). `get_prop_movement` shows how the line moved before the game; report what moved, not why.

### Step 9: Backtests

`get_prop_backtest` answers "how often did this kind of prop hit against the market". Always report the sample size, the interval it gives, and the per-season (`by_season`) breakdown. Present it as a description of the past. Never present a past result as a pick or as evidence that a line is mispriced.

### Joint outcomes

A player's stat and his team's result are positively correlated. Never multiply marginals as if independent. Estimate the joint rate from history, with its sample size, or say there is not enough data.

## Season

October to December: the season starts in the current calendar year. January to September: it started the previous year. Prop lines are pre-game only.

## Credit usage

| Operation | Credits |
|-----------|---------|
| Player lookup | 2 |
| Game log per player | 5 |
| Opponent team stats / goalie stats | 5 each |
| Prop lines for a game | 10 |
| Prop probabilities for a game | 10 |
| Prop history / movement per player | 10 each |
| Our projections (paid plans) | 25 |
| Backtest query | 25 |

## Anti-patterns

| Rationalization | Why it is wrong | Do this instead |
|----------------|----------------|-----------------|
| "Use season averages, skip ice time" | Averages hide role changes | Project ice time explicitly |
| "Use a normal distribution" | It allows negative counts | Use Poisson for small counts |
| "Add every feature" | Player samples are small and overfit | 5 to 8 features, regularised |
| "Project saves with the starter unknown" | The projection is invalid | Say starter unconfirmed |
| "A 70% hit rate on this prop type means it is mispriced" | Small samples and selection | Report the sample, interval and by-season split, and no verdict |
| "Say which side to take" | This skill reports information | Report the probabilities and the gap |

## Output Format

1. Projection: player, stat, projected value, range, probability over the posted line. Cite the tool call.
2. Market: posted line, fair probability, model vs market gap in points.
3. Ice time projection, shown separately, with the window used.
4. History vs line: games in the sample.
5. Assumptions and confidence: HIGH (starter confirmed, last 10 games clean), MEDIUM, LOW (unconfirmed starter, line change, small sample).

## What to do next

| Want | Skill |
|------|-------|
| Compare our probabilities with the market over time | `market-vs-model` |
| Player context | `nhl-player-scouting` |
| Tonight's slate | `nhl-daily-slate` |
| Who is starting in goal | `get_game_detail` for played games; tonight's starter is not in the data |
| Historical test of a prop model | `backtesting` |
| Probabilities look off | `probability-calibration` |

## Credits

- Sequences (last 5, recent form, a run of results) are quoted in the order the tool returns them, with dates; never retell them from memory. Lists in the answer must match the tool rows.
- Out of credits: if a call is refused for credits, pass on the API's message as it comes (it says when free credits refill and how to add more), and stop; don't retry or switch tools to get around it.
