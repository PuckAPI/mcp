---
name: nhl-goalie-gsax-report
description: "Use when the user asks whether an NHL goalie is good, hot, overrated, tired or just the team in front of him, in fan or analyst wording: 'is Hellebuyck actually elite', 'is his .925 sustainable', 'goalie stealing games?', 'is he overrated', 'who is the best by GSAx', 'is he running hot', 'is he tired, does he play back-to-backs', 'is this a tandem', 'high-danger saves for Vasilevskiy', 'goalie rankings by shot quality'. Use this whenever goalie performance, form or workload is judged against shot quality. Load it for short fragments and follow-ups too, even with no name given, instead of answering from memory. Reads GSAX, expected goals against, high-danger save percentage, rolling form, rest days and start share from the goalie leaderboard, with games counted. Not for who starts tonight (not in the data), skaters (see nhl-player-scouting), a game preview (see nhl-game-preview), goalie saves props (see nhl-player-props-research) or building an xG model (see nhl-xg-model)."
metadata:
  version: 2.2.0
  author: SportsDataHQ
---

# NHL goalie GSAX report

Save percentage mixes the goalie with the shots he faces. This skill reads goals saved above expected from PuckAPI's goalie leaderboard, and reports it with games and expected goals beside it.

## Before you start
- For anything across games, seasons or players, apply the sports-data-preflight checks first (ids from search, the season convention, one league, enough data).
- Tools come from the PuckAPI MCP server (`https://mcp.puckapi.com/mcp`). Call them; never fill in a number from memory.
- Seasons are 8-digit ids named by the year they start (20252026 = 2025-26). The default is the most recent season with stats. Teams by abbreviation (`list_teams`, 1 cr). Pass `league` for the PWHL, AHL and others; say the league.
- `get_goalie_stats(season, sort_by, min_games, team, limit)` (5 cr) returns the leaderboard sorted by save%, GAA, GSAX or wins. Fields: `gsax`, `expectedGoalsAgainst`, `highDangerSavePct`, `rollingSavePct`, `rollingGsax` (last 10 appearances), `trend`, `restDays`. Read these; do not recompute them. `min_games` defaults to 10 (early in a season, half the most games anyone has played); set it and say it.
- Goalie expected goals cover every strength. Team 5v5 expected goals from `get_team_stats` are a different base: never difference the two.
- The leaderboard has no single-player filter. For one goalie, pull the team's or the league's board and find the row; `search_players(query)` (2 cr) only confirms who he is.
- Starts and time on ice by game come from `get_game_detail` (10 cr, `goalie_starts`). Tonight's announced starter is not in the data: say so and point to team or beat-reporter sources.

## Default path (about 5 to 20 credits)
1. **Scope.** Season, league and whether it is the whole league or one team (`team`).
2. **The board.** `get_goalie_stats(season, sort_by: "gsax", min_games, limit)` (5 cr). Show the games played, GSAX, expected goals against, save percentage and high-danger save percentage as returned.
3. **Form.** The same rows give `rollingGsax`, `rollingSavePct` and `trend`; report them separately from the season figure.
4. **One goalie (when asked).** Find his row on the board (use `team` to narrow). If missing because of `min_games`, lower it and say so.
5. **One start (optional).** `get_game_detail(game_id)` (10 cr) for `goalie_starts` and time on ice.
6. **Against one opponent (optional).** `get_head_to_head` (10 cr) for his results against a named team. Under 3 appearances, say it is not enough to conclude anything.

## Workload and back-to-backs
- Rest days: `restDays` on the goalie row. Flag a goalie whose last start was on 0 rest days; count his back-to-back starts from the game log rather than guessing.
- Heavy workload: more than about 60 starts in a season is a fatigue risk for the second half; show starts and the share of his team's games.
- Tandem: if two goalies on one team are within about 5 starts of each other, call it a tandem and show both rows side by side. Pull the actual game-by-game pattern (hot hand, home and away, back-to-back backup) before calling the split even.
- Tired or just unlucky: compare `rollingGsax` and `trend` with `restDays` and the season figure. A dip on short rest is a workload story; a dip on full rest is form.
- Rolling form is the last 10 appearances. Report it next to the season number, never instead of it.

## Reading it
GSAX is a season total that stabilises slowly: under about 25 games, call differences between goalies small. A high save percentage with GSAX near zero means the shots were easy; the reverse means he faced hard ones. Pair season GSAX with the rolling figure and say if they disagree. The model does not see screens, rebounds or the play before the shot, only what the expected-goals fields carry.

## Output template
```
<Scope> | <league, season> | goalies shown <n> (min games <k>)
<Goalie, team>: games <gp>, GSAX <v>, xGA <v>, save % <v>, high-danger save % <v>
  Rolling (last 10): GSAX <v>, save % <v>, trend <v>, rest days <v>
Workload: starts <n> of <team games>, back-to-backs <n>, last start <date>, tandem partner <name or none>
Gap: save % vs expected <read as given by gsax>
Read: 2-3 bullets with games counted; small samples flagged
Data: get_goalie_stats[, get_game_detail] | season <yyyy-yy>, league <x>
```

Divergence is the headline: a .905 save percentage with strongly positive GSAX means he faces hard shots; a .925 with negative GSAX means he is running hot on an easy workload. Raw GAA mostly reflects the team in front of him; do not rank on it.

## Rules
- Use the fields the tool returns; do not recompute GSAX.
- Do not difference goalie xGA with team 5v5 xGA.
- Say the minimum games used.
- Every number names its tool (the Data line, plus inline where it could be doubted) and every rate shows its sample size.
- If a tool returns too little, say "not enough data" and stop; do not estimate or borrow another sample.
- Odds and prices are information about the market only: no picks, leans, stakes, payouts or sportsbook links.
- Sequences (last 5, recent form, a run of results) are quoted in the order the tool returns them, with dates; never retell them from memory. Lists in the answer must match the tool rows.
- Out of credits: if a call is refused for credits, pass on the API's message as it comes (it says when free credits refill and how to add more), and stop; don't retry or switch tools to get around it.

## Example prompts
- "Who leads the NHL in GSAX this season?"
- "Is Shesterkin's save percentage sustainable?"
- "Is Vasilevskiy slumping right now?"
- "Is Shesterkin tired, does he play a lot of back-to-backs?"
- "Is this Rangers goalie a real tandem?"
