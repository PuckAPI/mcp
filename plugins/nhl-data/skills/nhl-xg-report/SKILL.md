---
name: nhl-xg-report
description: "Use when the user asks whether an NHL team's or game's result matches the chances created, in fan or analyst wording: 'were the Oilers lucky last night', 'who really won that game', 'is the Panthers' record legit', 'are they due to slide', 'got outshot but won?', 'good process bad results', 'where did the shots come from', 'was the win deserved', 'is that record a mirage'. Use this whenever results are compared with shot quality or chances. Also use it for bare follow-ups with no name given, and load it instead of answering from memory or going straight to the raw tools. Reports 5v5 expected goals for and against from team stats, and a game's shot volume and locations from the shot map, saying what is and is not an xG figure. Not for a game preview (see nhl-game-preview), goalies against shot quality (see nhl-goalie-gsax-report), what a stat means (see nhl-advanced-stats) or building a model (see nhl-xg-model)."
metadata:
  version: 2.1.0
  author: SportsDataHQ
---

# NHL xG report

Results and chances do not always match. This skill reports 5v5 expected goals for teams from PuckAPI, and for a single game the shots and where they came from, without inventing an xG number the game rows do not carry.

## Before you start
- For anything across games, seasons or players, apply the sports-data-preflight checks first (ids from search, the season convention, one league, enough data).
- Tools come from the PuckAPI MCP server (`https://mcp.puckapi.com/mcp`). Call them; never fill in a number from memory.
- Seasons are 8-digit ids named by the year they start (20252026 = 2025-26). Teams by abbreviation (`list_teams`, 1 cr). Games by id from `get_games` (5 cr) or `get_schedule` (2 cr).
- `get_team_stats(team, season)` (5 cr) returns 5v5 possession: Corsi%, Fenwick%, `expectedGoalsFor` and `expectedGoalsAgainst`, plus record and goals for and against. `get_standings` (2 cr) carries the same 5v5 columns. Team possession is 5v5 only.
- Goalie expected goals (`get_goalie_stats`) cover every strength. Never difference them with team 5v5 expected goals.
- `get_shot_map(game_id)` (10 cr) returns every shot attempt with rink coordinates, shot type, strength, shooter and goalie. `get_plays(game_id, shot_attempts_only: true)` (10 cr) returns Corsi events with strength and zone. Neither is described as returning a per-shot xG value: use it only if a returned row carries one, otherwise report shot counts by strength, type and location and say there is no game xG here.
- Do not build or fit a model inside this skill; for that, see nhl-xg-model.

## Default path (about 10 to 30 credits)
1. **Scope.** A team season, a game, or both. Resolve the team and the game id.
2. **Season context.** `get_team_stats(team, season)` (5 cr): 5v5 expected goals for and against, the difference as given, Corsi%, and goals for and against. Compare goals with expected goals only at 5v5 and say the base.
3. **One game.** `get_shot_map(game_id)` (10 cr): shot attempts by team, strength and location (high-slot versus perimeter, from the coordinates returned). Add `get_plays(game_id, shot_attempts_only: true)` (10 cr) for strength and zone if needed.
4. **Result versus chances.** Shots, high-slot attempts and power-play share for each team, next to the score. If the shot rows carry an xG field, sum it and say it was summed from the rows; if not, do not name an xG.
5. **Luck (season).** A team whose goals for sit well above its 5v5 expected goals for may be finishing hot; say which way and how many games.

## Reading it
5v5 expected goals leave out the power play and penalty kill, so a team's record can differ from its 5v5 xG for reasons the numbers show elsewhere. Over one game, expected goals are noisy; over a season, a gap between goals and xG can persist for goalie or finishing reasons, so say it could mean either. Do not call a result lucky from one game. Report gaps as the tool gives them.

## Output template
```
<Team or game> | <season> | scope <5v5 season / game>
Season 5v5: xGF <v>, xGA <v>, diff <v> | goals for <v>, against <v> | Corsi % <v> | games <n>
Game (if asked): shots <a> to <b>, high-slot attempts <a> to <b>, by strength <5v5 / 5v4 split>, score <x-y>
xG note: <summed from rows / not returned for games>
Read: 2-3 bullets with sample sizes
Data: get_team_stats[, get_standings, get_shot_map, get_plays] | season <yyyy-yy>, game <id>
```

## Rules
- Season expected goals are 5v5 only; say so.
- Do not state a game xG unless a returned field carries it.
- Never difference goalie xGA with team 5v5 xGA.
- Do not call one game's result lucky.
- Every number names its tool (the Data line, plus inline where it could be doubted) and every rate shows its sample size.
- If a tool returns too little, say "not enough data" and stop; do not estimate or borrow another sample.
- Odds and prices are information about the market only: no picks, leans, stakes, payouts or sportsbook links.
- Sequences (last 5, recent form, a run of results) are quoted in the order the tool returns them, with dates; never retell them from memory. Lists in the answer must match the tool rows.
- Out of credits: if a call is refused for credits, pass on the API's message as it comes (it says when free credits refill and how to add more), and stop; don't retry or switch tools to get around it.

## Example prompts
- "Are the Oilers getting good chances at 5v5?"
- "Did Boston deserve to win last night?"
- "Which teams are outscoring their expected goals?"
