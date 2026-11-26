---
name: nhl-goalie-gsax-report
description: "Use when the user asks whether an NHL goalie's results are real or just the team in front of him, in fan or analyst wording: 'is Hellebuyck actually elite', 'is his .925 sustainable', 'goalie stealing games?', 'who is the best by GSAx', 'which goalie is getting bailed out', 'high-danger saves for Vasilevskiy', 'is he cold or just unlucky', 'goalie rankings by shot quality'. Use this whenever goalie performance is judged against shot quality. Load it for short fragments and follow-ups too, even with no name given, instead of answering from memory or going straight to the raw tools. Reads GSAX, expected goals against, high-danger save percentage and the rolling form fields from the goalie leaderboard, with games counted. Not for who starts tonight, rest or back-to-backs, a general goalie lookup (see nhl-goalie-analysis), a game preview (see nhl-game-preview), goalie props or building an xG model (see nhl-xg-model)."
metadata:
  version: 2.0.0
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
- Starts and time on ice by game come from `get_game_detail` (10 cr, `goalie_starts`). Tonight's announced starter is not in the data.

## Default path (about 5 to 20 credits)
1. **Scope.** Season, league and whether it is the whole league or one team (`team`).
2. **The board.** `get_goalie_stats(season, sort_by: "gsax", min_games, limit)` (5 cr). Show the games played, GSAX, expected goals against, save percentage and high-danger save percentage as returned.
3. **Form.** The same rows give `rollingGsax`, `rollingSavePct` and `trend`; report them separately from the season figure.
4. **One goalie (when asked).** Find his row on the board (use `team` to narrow). If missing because of `min_games`, lower it and say so.
5. **One start (optional).** `get_game_detail(game_id)` (10 cr) for `goalie_starts` and time on ice.

## Reading it
GSAX is a season total that stabilises slowly: under about 25 games, call differences between goalies small. A high save percentage with GSAX near zero means the shots were easy; the reverse means he faced hard ones. Pair season GSAX with the rolling figure and say if they disagree. The model does not see screens, rebounds or the play before the shot, only what the expected-goals fields carry.

## Output template
```
<Scope> | <league, season> | goalies shown <n> (min games <k>)
<Goalie, team>: games <gp>, GSAX <v>, xGA <v>, save % <v>, high-danger save % <v>
  Rolling (last 10): GSAX <v>, save % <v>, trend <v>, rest days <v>
Gap: save % vs expected <read as given by gsax>
Read: 2-3 bullets with games counted; small samples flagged
Data: get_goalie_stats[, get_game_detail] | season <yyyy-yy>, league <x>
```

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
