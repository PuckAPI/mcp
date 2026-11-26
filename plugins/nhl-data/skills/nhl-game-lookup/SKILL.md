---
name: nhl-game-lookup
description: "Use when the user asks who plays tonight, what is on the schedule, when a team plays next, what happened in last night's game, the score, or the head-to-head record between two teams. Finds NHL games by date, team, matchup or season: results, upcoming schedule and head-to-head history. Not for how a team is performing (use nhl-team-analysis), odds or lines (use nhl-odds-explorer), a full pre-game report (use nhl-game-preview) or player stats (use nhl-player-scouting)."
metadata:
  version: 2.1.0
  author: SportsDataHQ
---

# NHL Game Lookup

> **Data:** the PuckAPI MCP server (`nhl-puckapi-tools`).
> Tools: `get_games` for schedule and results (5 credits), `get_schedule` for a team's upcoming games in a 1 to 30 day window (2 credits), `get_game_detail` for full game info with odds and goalies (10 credits), `get_head_to_head` for matchup history (10 credits).
> For the user's own schedule file, skip the tools and work with the file.

You are an expert at finding game data. Answer schedule and results questions quickly and accurately, then point to deeper skills if the user wants more.

## Rules for numbers

- Call the tools. Never answer from memory.
- Cite which tool call produced each score, record or date.
- State the sample size for any head-to-head record (number of games and the seasons covered) and the season convention (the tools take an 8-digit season id, 20252026 for 2025-26).
- If nothing is returned, say "not enough data" or "no games found" and say what you queried. Do not guess a score.

## When to Use

- "Who plays tonight?" / "What's on tonight?"
- "When do the [team] play next?"
- "What happened in last night's [team] game?"
- "Show me the [team] schedule for [month/week]"
- "What's the head-to-head record between [team A] and [team B]?"
- "Did [team] win on [date]?"
- "Find the [team A] vs [team B] game from [date]"

## When NOT to Use

- Team performance evaluation, standings, stats: see `nhl-team-analysis`
- Odds and line movement: see `nhl-odds-explorer`
- Player stats from a game: see `nhl-player-scouting`
- Full game preview with predictions: see `nhl-game-preview`

## Commands Available

| Command | What It Does | Credits |
|---------|-------------|---------|
| `get_games` | Games by date range and/or team, returns scores and status | 5 |
| `get_schedule` | Upcoming games within a 1-30 day lookahead window (default 7 days) | 2 |
| `get_game_detail` | Full game info with odds and goalie starts | 10 |
| `get_head_to_head` | Historical matchup record between two teams | 10 |

## Commands That Do NOT Exist

| Not Available | Use Instead |
|--------------|-------------|
| `get_live_scores` | Use `get_games` with today's date; status field indicates live/final |
| `get_playoffs_bracket` | Use `get_games` filtered by `game_type=playoff` |
| `get_game_recap` | Use `get_game_detail` for box score; narratives are not available |
| `get_injuries` | Not available in this tool |
| `get_lineup` | Not available in this tool |

## Season Resolution

- October through December: current calendar year is the season start (2025-26 is 20252026)
- January through September: previous calendar year is the season start (2025-26 is 20252026)
- "This season" = season currently in progress or most recently completed
- "Last season" = one full season prior
- NHL regular season: October to April. Playoffs: April to June.
- "Tonight" = today's date in the user's local time zone; default to UTC if unknown
- If a date is ambiguous ("last Tuesday"), confirm before querying

## Initial Assessment

Before querying, understand:

1. **What is the user looking for?** A result (past), a schedule (future), or a specific game detail?
2. **Which team(s)?** One team for schedule queries, two teams for head-to-head.
3. **What time window?** Tonight, this week, this season, or a specific date?

If the question is "who plays tonight?": call `get_games` immediately. Do not ask for clarification on obvious queries.

## How It Works

### Step 1: Classify the request

| Request type | Tool to use |
|-------------|-------------|
| Tonight / specific date | `get_games` with date |
| Team's upcoming games (next 1-30 days) | `get_schedule` |
| Game result with score | `get_games` with date + team filter |
| Box score / period breakdown | `get_game_detail` |
| Two teams' historical record | `get_head_to_head` |

### Step 2: Resolve the date or season

Apply season resolution rules above. For "tonight," use today's date (run `date` if unsure). For "this week," use a 7-day window from today.

### Step 3: Execute the query

Use the minimum credits needed. A schedule question does not require `get_game_detail`. A "who won?" question does not require `get_head_to_head`.

### Step 4: Format and present results

Present results in the output format below. Offer routing to deeper skills only if the user's follow-up is obvious (e.g., they just found a game and might want odds or team context).

### Step 5: Handle empty results

- No games found: confirm the sport, team name spelling, and date range. Suggest a broader window.
- Team not found: try alternate name (city vs. nickname), then ask the user.
- Game status = "scheduled": the game hasn't been played; scores will be unavailable.

## Data Source

**PuckAPI (default):** Use `nhl-puckapi-tools` endpoints above.

**Your own data:** If user provides a CSV or JSON schedule:
1. Verify required columns exist: `date`, `home_team`, `away_team`, `home_score`, `away_score` (or equivalent)
2. Check date format: ISO 8601 preferred (YYYY-MM-DD)
3. Flag missing scores for future games: do not treat blank scores as 0-0
4. Credits are not consumed when working with user's own data

## Credit Usage

| Operation | Credits | Notes |
|-----------|---------|-------|
| Single date game lookup | 5 | Returns all games that day via `get_games` |
| Team schedule (1-30 day lookahead) | 2 | Upcoming games via `get_schedule` |
| Game detail (full info + odds + goalies) | 10 | One game via `get_game_detail` |
| Head-to-head history | 10 | All historical matchups, two teams |
| Full-week slate | 5 | One `get_games` call with date range |

**Cost note:** `get_schedule` (2 credits) is the cheapest way to check upcoming games. Use `get_games` (5 credits) for broader lookups. Reserve `get_game_detail` and `get_head_to_head` (10 credits each) for when you need full detail.

## Anti-patterns

| Rationalization | Why It's Wrong | Do This Instead |
|----------------|---------------|-----------------|
| "I'll use `get_game_detail` for every result to get more data" | `get_game_detail` costs 10 credits vs 5 for `get_games` and is unnecessary for a simple score query | Use `get_games` for results; only escalate to `get_game_detail` if the user wants odds or goalie start info for a specific game |
| "I'll pull the full schedule and filter locally" | Wastes the user's time; tool filters are faster and cheaper | Filter at the query level using team and date parameters |
| "The team name looks close enough, I'll proceed" | Partial matches cause silent wrong results | Verify exact team name with `list_teams` if unsure |
| "No results probably means no games" | Could be a wrong date, wrong team, or off-season | Explicitly state what was queried and suggest alternate interpretations |

## Output Format

### Tonight's slate
```
Games: [Date]
[Sport] | [Home Team] vs [Away Team] | [Start Time] | [Venue]
...
[N] games scheduled.
```

### Game result
```
[Away Team] [Score] @ [Home Team] [Score]: FINAL
Date: [Date] | Venue: [Venue]
Period scores: [Q1/P1 scores if available]
```

### Team schedule (upcoming)
```
[Team]: Next [N] Games
[Date] | [vs/at] [Opponent] | [Time/Result]
...
```

### Head-to-head
```
[Team A] vs [Team B]: All-time: [W-L-OT]
Last 5 meetings:
[Date] | [Winner] [Score]-[Score] | [Location]
...
```

## What to Do Next

| What You Found | Next Action | Skill |
|----------------|-------------|-------|
| Found a game, want full matchup breakdown | Run game preview with odds, stats, trends | `nhl-game-preview` |
| Found a game, want current lines | Compare odds across books | `nhl-odds-explorer` |
| Want to know how a team has been playing | Check standings and team stats | `nhl-team-analysis` |
| Found a head-to-head, want to build a model feature | Encode H2H as a feature | `feature-engineering` |
| Want stats for a player in a found game | Look up player season stats | `nhl-player-scouting` |

## Credits

- Sequences (last 5, recent form, a run of results) are quoted in the order the tool returns them, with dates; never retell them from memory. Lists in the answer must match the tool rows.
- Out of credits: if a call is refused for credits, pass on the API's message as it comes (it says when free credits refill and how to add more), and stop; don't retry or switch tools to get around it.
