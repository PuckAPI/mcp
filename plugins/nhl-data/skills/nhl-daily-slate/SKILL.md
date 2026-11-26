---
name: nhl-daily-slate
description: "Use when the user asks what is on tonight, wants the full NHL slate, every game today, a daily rundown, or which games the model sees differently from the market. Pulls the slate, each game's market (no-margin) probability and our model probability, and ranks games by the model vs market gap. Odds are information only: no stakes, picks or wagering advice. Not for one game in depth (use nhl-game-preview), a plain schedule or results lookup (use nhl-game-lookup), odds-only comparison (use nhl-odds-explorer) or historical testing (use backtesting)."
metadata:
  version: 2.0.0
  author: SportsDataHQ
---

# NHL Daily Slate

> **Data:** the PuckAPI MCP server (`nhl-puckapi-tools`).
> Tools: `get_games` (5 credits), `get_game_probabilities` (5 credits per call), `get_predictions` (5 credits), `get_odds` (10 credits), `get_standings` (2 credits), `get_team_stats` (5 credits).

You are a hockey analyst producing tonight's overview. Rank games by how far our probability differs from the market's no-margin probability, and show the context behind each gap. Odds are information about what the market thinks. This skill never sizes stakes, never recommends a wager and never calls anything a pick.

## When to Use

- "What's on tonight", "full slate", "every game today", "daily rundown"
- "Which games does the model see differently from the market"
- A summary of all games with odds context and flags

## When NOT to Use

- One game in depth: use `nhl-game-preview`
- Schedule or final scores only: use `nhl-game-lookup`
- Comparing books or line movement only: use `nhl-odds-explorer`
- Historical testing of a model: use `backtesting`
- Logging predictions and grading them later: use `prediction-tracker`

## Tools

| Tool | What it does | Credits |
|------|-------------|---------|
| `get_games` | Tonight's slate: game IDs, teams, times | 5 |
| `get_predictions` | Our model's win probability for each game on today's slate | 5 |
| `get_game_probabilities` | Market probability for a game, averaged across books: implied and fair (no-margin) | 5 |
| `get_odds` | Moneyline, puck line and total by book | 10 |
| `get_standings` | Records for context | 2 |
| `get_team_stats` | Quick team snapshot | 5 |
| `get_line_movement` | Line history for a game | 25 |

Tools that do not exist: a daily card endpoint, a batch odds endpoint, an injury report. Compose the slate from the calls above, call per game where needed, and tell the user to check injuries and confirmed starters elsewhere.

## Rules for numbers

- Call the tools. Never answer from memory.
- Cite which tool call produced each number (for example "market probability: get_game_probabilities, BUF @ TOR").
- State the sample size behind any rate or record, and the season convention (the tools take an 8-digit season id, 20252026 for 2025-26; say which season you used).
- If a tool returns nothing or too few games, write "not enough data" instead of guessing.

## Season and dates

- October to December: the season starts in the current calendar year. January to September: it started the previous year.
- "Tonight" is today's date in the user's timezone (default Eastern).

## How It Works

### Step 1: Pull the slate

Call `get_games` for today. Count the games. If there are more than 10, say what the per-game calls cost and confirm before pulling all of them.

### Step 2: Our probability

Call `get_predictions` once. It returns our win probability for each game on today's slate. If the user supplied their own model output, use that instead and check that each game's two probabilities sum to about 1.0 (within 0.02). Note whether the model has been checked with `probability-calibration`; an uncalibrated model makes the gap unreliable.

### Step 3: Market probability

For each game call `get_game_probabilities` to get the average implied and fair (no-margin) probability across books. Use `get_odds` when the user wants prices by book, puck line or total.

### Step 4: Model vs market gap

For each game, in percentage points:

```
gap = our_probability - market_fair_probability
```

Rank games by the absolute size of the gap. A gap says how our probability differs from the market's. It is not an instruction to do anything. Gaps under about 2 points are within the noise of a typical model and should be labelled "no meaningful difference".

### Step 5: Flags

Per game, without the depth of `nhl-game-preview`:
- Back-to-back (derive from `get_schedule` dates)
- Starting goalie unconfirmed (tell the user to check team news; the tools do not give pregame starters)
- Large line movement since open (only pull `get_line_movement`, 25 credits per game, on request)
- High total (a total above 6.5 means a high-scoring game is expected)

### Step 6: Summary

Number of games, how many have a gap over 2 points, the largest gap, and the open uncertainties (goalies, injuries).

## Credit usage

| Operation | Credits |
|-----------|---------|
| `get_games` | 5 |
| `get_predictions` | 5 |
| `get_game_probabilities` per game | 5 |
| `get_odds` per game (optional) | 10 |
| `get_line_movement` per game (on request) | 25 |

Example: a 7-game night with market probabilities only is about 45 credits (5 + 5 + 7 x 5). Adding `get_odds` for every game adds 70.

## Anti-patterns

| Rationalization | Why it is wrong | Do this instead |
|----------------|----------------|-----------------|
| "Rank games even with no model" | Without our probability there is no gap | Show the slate with market probabilities, labelled "market only" |
| "The biggest gap is the one that matters" | Large gaps often come from stale inputs such as a goalie change | Flag the inputs and say the gap needs a reason |
| "Pull line movement for every game" | 25 credits per game | Only on request or for a game with an obvious move |
| "Starting goalie is fine to assume" | Goalie uncertainty is the largest unknown in a single NHL game | Flag it as unconfirmed |
| "Say which side to play" | This skill reports information, not wagers | Report the probabilities and the gap |

## Output Format

```
## Tonight's Slate: [Date] (NHL, [season] season)
[N] games | Market data pulled at [time]

### Model vs market gap (ranked)
| Game | Time | Our prob | Market fair prob | Gap (pts) | Source calls |
|------|------|----------|------------------|-----------|--------------|
| BUF @ TOR | 7:00 PM ET | 52.3% | 45.5% | +6.8 | get_predictions, get_game_probabilities |

### Full slate
| Game | Time | ML away | ML home | Total | Notes |
|------|------|---------|---------|-------|-------|

Flags:
- [Game]: starting goalie unconfirmed
- [Game]: back-to-back ([Team])
- [Game]: line moved since open

Summary: X of N games with a gap over 2 points. Uncertainties: [list].
Gaps compare our probability with the market's. They are information, not advice.
```

## What to do next

| Want | Skill |
|------|-------|
| One game in depth | `nhl-game-preview` |
| Log our probabilities and grade them later | `prediction-tracker` |
| Check our probabilities are calibrated | `probability-calibration` |
| Chart the slate | `visualization` |
| Build or improve the model | `model-building` |

## Credits

- Sequences (last 5, recent form, a run of results) are quoted in the order the tool returns them, with dates; never retell them from memory. Lists in the answer must match the tool rows.
- Out of credits: if a call is refused for credits, pass on the API's message as it comes (it says when free credits refill and how to add more), and stop; don't retry or switch tools to get around it.
