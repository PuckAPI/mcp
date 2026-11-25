---
name: nhl-puckapi-tools
description: "Use when any hockey skill needs data, or when the user asks which PuckAPI tool to call for games, schedules, standings, team or player stats, goalies, shots, shifts, odds, line movement or player props. Routes requests to the right tool of the PuckAPI MCP server and tracks credit cost. Not for analysis or modeling (use nhl-advanced-stats, model-building or market-vs-model). Not for recommending wagers: prices are shown as information only."
metadata:
  version: 2.0.0
  author: SportsDataHQ
  user-invocable: false
---

# PuckAPI Tools

Every other hockey skill delegates data retrieval here. This skill owns the 28 tools of the PuckAPI MCP server, routes requests to the right one, and tracks credit cost. The server covers the NHL plus the PWHL, OHL, WHL, QMJHL, ECHL, AHL and USHL.

**Coverage:** games from the 2010-11 season through the current season. Odds history starts later than game data; earlier games return empty odds arrays, not an error.

**Full parameter schemas:** see `endpoints.md` in this directory (load on demand), and read each tool's own schema before calling one you have not used.

---

## Rules for numbers

- Call the tools rather than answering from memory. Never quote a standing, stat, price or probability you did not just pull.
- Cite which tool call produced each number.
- State the sample size and the season convention (`20252026` = the 2025-26 season) with each figure.
- If a tool returns nothing or too little, say "not enough data" instead of guessing.

## Odds are information only

Show lines and prices as data about the market. Do not work out a stake, payout or profit, do not recommend a wager, and do not send the user to a sportsbook. No tool places, accepts or tracks wagers. If asked to wager, say so and offer the data instead. Odds and props are pre-game only.

---

## The 28 Tools

### Teams and standings

| Task | Tool | Credits |
|------|------|---------|
| All teams and abbreviations | `list_teams` | 1 |
| Standings | `get_standings` | 2 |
| One team's stats and advanced metrics | `get_team_stats` | 5 |
| Two teams head to head | `get_head_to_head` | 10 |

### Games

| Task | Tool | Credits |
|------|------|---------|
| Upcoming schedule | `get_schedule` | 2 |
| Past games with filters | `get_games` | 5 |
| Model win probability for today's slate | `get_predictions` | 5 |
| Full detail for one game (odds and starting goalies) | `get_game_detail` | 10 |

### Players

| Task | Tool | Credits |
|------|------|---------|
| Find a player by name | `search_players` | 2 |
| Player bio and team context | `get_player_stats` | 5 |
| Goalie leaderboard (save%, GAA, GSAx, wins) | `get_goalie_stats` | 5 |
| Skater leaderboard (points, goals, assists, +/-, shots) | `get_skater_season_stats` | 5 |
| Game-by-game lines for one player | `get_player_game_log` | 5 |
| Model projections for tonight's players (paid plans only) | `get_prop_projections` | 25 |

### Play-by-play

| Task | Tool | Credits |
|------|------|---------|
| Events for a game, player or season | `get_plays` | 10 |
| Shot locations to plot or model | `get_shot_map` | 10 |
| Who was on the ice, shift by shift | `get_shifts` | 10 |
| Exact 5v5 / power-play / shorthanded time | `get_situation_time` | 10 (per game) |

### Market prices (information only)

| Task | Tool | Credits |
|------|------|---------|
| Odds for one game | `get_odds` | 10 |
| Market implied and fair (no-margin) probability for a game | `get_game_probabilities` | 5 |
| How lines moved over time | `get_line_movement` | 25 |
| Period and regulation-result lines, opening and closing by book | `get_market_odds` | 10 |
| Alternate puck lines and totals | `get_alt_lines` | 10 |
| Player prop lines by book | `get_player_props` | 10 |
| How a player did against his prop line, game by game | `get_prop_history` | 10 |
| How a prop line moved before a game | `get_prop_movement` | 10 |
| Market implied and fair probability for a game's props | `get_prop_probabilities` | 10 |
| How often a kind of prop hit against the market | `get_prop_backtest` | 25 |

For `get_prop_backtest`, always report its sample size, its interval and its by-season breakdown, and do not present a past result as a pick. A free-plan call to `get_prop_projections` is refused and charged nothing.

---

## Tool Selection Guide

| You Need | Use This | Not This |
|----------|----------|----------|
| "What games are on tonight?" | `get_schedule` | `get_games` (past games) |
| "Show me BUF's last 10 games" | `get_games` with `team=BUF`, `limit=10` | `get_schedule` (future only) |
| "Full game info with odds" | `get_game_detail` | `get_games` plus `get_odds` |
| "How have BUF and TOR fared against each other?" | `get_head_to_head` | `get_games` filtered by hand |
| "Where does BUF rank in the Atlantic?" | `get_standings` with `division=Atlantic` | `get_team_stats` |
| "BUF's Corsi and xG numbers" | `get_team_stats` | `get_standings` (basic metrics only) |
| "Find Connor McDavid's ID" | `search_players` | `get_player_stats` (needs a numeric ID) |
| "Best save percentage goalies this season" | `get_goalie_stats` with `sort_by=save_pct` | `get_player_stats` |
| "Where does this player shoot from?" | `get_shot_map` | `get_plays` (use it for event context) |
| "What does the market think of tonight's game?" | `get_game_probabilities` | computing it by hand from `get_odds` |
| "What's the line on tonight's game?" | `get_odds` | `get_line_movement` (movement, not a snapshot) |
| "Did the line move today?" | `get_line_movement` | `get_odds` |

---

## Credit Usage

| Tier | Tools | Credits |
|------|-------|---------|
| Lightweight | `list_teams` | 1 |
| Standard | `get_standings`, `get_schedule`, `search_players` | 2 |
| Moderate | `get_games`, `get_game_probabilities`, `get_predictions`, `get_team_stats`, `get_player_stats`, `get_goalie_stats`, `get_skater_season_stats`, `get_player_game_log` | 5 |
| Heavy | `get_odds`, `get_game_detail`, `get_head_to_head`, `get_plays`, `get_shot_map`, `get_shifts`, `get_situation_time`, `get_player_props`, `get_prop_history`, `get_prop_movement`, `get_market_odds`, `get_alt_lines`, `get_prop_probabilities` | 10 |
| Expensive | `get_line_movement`, `get_prop_backtest`, `get_prop_projections` | 25 |

**Bulk cost examples** (at roughly 1,312 regular season games):

| Operation | Credits | Notes |
|-----------|---------|-------|
| Full season of `get_game_detail` | ~13,120 | 10 credits per game |
| Full season of `get_shifts` | ~13,120 | 10 credits per game |

Warn the user and agree a date range before any bulk pull. Prefer one wider call over many narrow ones.

---

## Commands That Do NOT Exist

| Not Available | Use Instead |
|--------------|-------------|
| `get_live_odds` | `get_odds` with today's game ID |
| `get_player_advanced_stats` | `get_player_stats`, then compute via `nhl-advanced-stats` |
| `get_team_schedule` | `get_schedule` or `get_games` with `team=ABBREV` |
| `get_game_by_teams` | `get_head_to_head` or `get_games` with a `team` filter |
| `get_playoff_bracket` | `get_games` with `game_type=playoff` |
| `get_historical_lineups` | Not available |
| `get_injuries` | Not available |
| `search_games` | `get_games` with filters |

---

## Season Resolution

Resolve season IDs before calling tools.

**Season ID format:** eight digits, no separator. The 2025-26 season is `20252026`.

- October through December: the current calendar year starts the season (Oct 2026 = `20262027`)
- January through September: the previous calendar year starts the season (Mar 2026 = `20252026`)
- "This season" = the season in progress or most recently completed; "last season" = one before
- Regular season runs early October to mid-April, playoffs mid-April to mid-June, offseason July to September
- Data starts at `20102011`; earlier seasons return empty, not an error

To get the current season, call `get_standings` with no `season` (the server resolves it), or pass `season=20252026` explicitly to `get_games`.

---

## User-Provided Data

When the user provides their own CSV, JSON or database instead of calling the tools:

1. Verify the required columns exist (see `endpoints.md`)
2. Check the date format (ISO 8601, `YYYY-MM-DD` preferred) and flag anything else
3. Flag missing data explicitly; do not silently drop rows or impute
4. No credits are consumed
5. Map the user's column names to the server's schema before passing to analytics skills

| Format | Minimum Columns |
|--------|-----------------|
| Game results | `game_date`, `home_team`, `away_team`, `home_score`, `away_score` |
| Odds | `game_id` or (`game_date` + `home_team`), `bookmaker`, `ml_home`, `ml_away`, snapshot type |
| Player stats | `player_id` or `player_name`, `team`, `season`, stat columns |

---

## How to Call These Tools

### Find the game ID, then fetch detail

```
Step 1: get_games(team="BUF", date_from="2026-01-01", date_to="2026-01-31")
        -> game list with IDs
Step 2: get_game_detail(game_id="2025020887")
        -> full game with odds and goalie starts
```

### Find the player ID, then stats

`get_player_stats` needs a numeric player ID, so search first.

```
Step 1: search_players(query="McDavid", active=true)
Step 2: get_player_stats(player_id=8478402)
```

### Standings with advanced metrics

`get_standings` includes Corsi, Fenwick and xG columns, so a full league view needs no `get_team_stats` calls.

```
get_standings(conference="Eastern", season="20252026")
```

---

## Anti-patterns

| What Claude Might Do | Why It's Wrong | Do This Instead |
|---------------------|---------------|-----------------|
| Call `get_odds` for every game in a season | Thousands of credits | Warn the user and ask for a date range |
| Call `get_line_movement` when the user wants current prices | 25 credits for a snapshot | Use `get_odds` (10 credits) |
| Guess a player ID after `search_players` | IDs must be exact | Use the `id` field from the results |
| Pass "Buffalo Sabres" as `team` | The tool expects an abbreviation | Use `BUF` |
| Assume odds exist for older games | Returns an empty array | Check the season before calling odds tools |
| Loop `get_game_detail` over many games | 10 credits per game | Use `get_games` (5 credits) for bulk data |
| Compute a stake or payout from a price | Odds are information only | Show the price and the implied or fair probability |

---

## What to Do Next

| What You Retrieved | Next Action | Skill |
|--------------------|-------------|-------|
| Game results for a season | Compute Elo ratings or features | `elo-engineering` or `feature-engineering` |
| Standings with Corsi/Fenwick | Analyze team performance | `nhl-team-analysis` |
| Odds or market probabilities | See how our probability differs from the market's | `market-vs-model` |
| Line movement data | Read implied and no-margin probability, movement and closing line | `odds-market-analysis` |
| Player or goalie stats | Scout against the league | `nhl-player-scouting` or `nhl-goalie-analysis` |
| Head-to-head history | Build a game preview | `nhl-game-preview` |
| Full season game log | Run a backtest | `backtesting` |
| Raw game data, need features | Engineer model inputs | `feature-engineering` |
