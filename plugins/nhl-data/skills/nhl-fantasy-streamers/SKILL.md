---
name: nhl-fantasy-streamers
description: "Use when a fantasy hockey manager is planning the week or hunting pickups: 'goalie to stream', 'who has four games this week', 'back-to-back goalies', 'power play unit to add', 'defenseman with shots and blocks', 'rest of week waiver adds', 'is his ice time up', 'Monday-Thursday schedule', 'hot goalie worth a stash', 'who gets first-unit power play now'. Ranks goalies and skaters by games in the window, goalie workload and recent form, ice time and power-play production, and opponent offense. Also for bare follow-ups with no names: load this skill first, then ask for what is missing, rather than answering from memory. Not for a single game preview (see nhl-game-preview), a goalie's season quality (see nhl-goalie-analysis), DFS lineups (see nhl-dfs-lineup) or prop prices (see nhl-player-props-research)."
metadata:
  version: 1.0.0
  author: SportsDataHQ
---

# NHL fantasy streamers and weekly planner

Hockey streaming is about games played in the window, which goalie is likely to start, and who plays on the power play. This skill builds the week from the schedule, goalie workload and form, skater ice time and opponent offense. Confirmed starting goalies and line combinations are not in the data, so it says which are inferred.

## Before you start
- For anything across games, seasons or players, apply the sports-data-preflight checks first (ids from search, the season convention, one league, enough data).
- Tools come from the PuckAPI MCP server. `season` is an 8-digit id (20252026 is 2025-26). Player ids come from `search_players(name)` (2 cr).
- League scoring and categories come from the user; if unstated, report counting stats and say the ranking is not category-specific.
- Confirmed starters, line combinations and power-play units are not in the data. Report ice time and power-play production as the evidence, and say starts are inferred from workload and rest.
- Roster percentage is not in the data; ask for the user's free-agent names or say availability is unchecked.

## Default path (about 25 to 50 credits)
1. **The week.** `get_schedule(days: 7)` (2 cr): games per team, back-to-backs, home or away.
2. **Goalies.** `get_goalie_stats(min_games: 5, limit: 50, sort_by: gsax)` (5 cr): games played, save percentage, goals saved above expected, rolling form, rest days; the team's goalie split shows who starts what share.
3. **Opponent offense.** `get_team_stats(team)` (5 cr per team, only for the main opponents): goals for and shots for per game.
4. **Skaters.** `get_skater_season_stats(team, sort_by: points, limit: 30)` (5 cr per team): average time on ice, power-play points, shots.
5. **Recent form for named players.** `search_players(name)` (2 cr), then `get_player_game_log(player_id, limit: 10)` (5 cr): time on ice, shots, power-play points, game by game.

## Projection method
- Games first: rank candidates by games in the window; a 4-game skater or goalie beats a 3-game one of similar quality. Show the games.
- Goalie starts: expected starts = games the team plays x the goalie's share of the team's starts this season (games started / team games, n shown). A back-to-backs pair usually splits between the two goalies; say so and mark both starts 'inferred'. Rank goalies by expected starts, then rolling GSAX and rest days, then the opponent's goals per game.
- Skaters: average time on ice over the last 10 games (n shown), power-play points and shots per game; a rise of 2 or more minutes in the last 5 games versus the 10 before is a role change, flagged with the games.
- Weekly value = games x per-game stat line of the user's categories. Show the arithmetic.
- Opponent adjustment is a note, not a multiplier: name the opponent and its goals for per game rank among the teams you pulled.

## Output template
```
Week of <date> | games per team: <team: n (B2B)>
Goalies: <name (team): starts expected <x> of <games> | share <%> (n) | save% <s>, GSAX <g>, rolling <r> | opponents <list>>
Skaters: <name: games <g>, TOI <m> (n), PP pts/gm <p>, shots/gm <s>>
Role changes: <player: TOI +<x> over last 5 vs prior 10>
Availability: <checked / unchecked>
Data: get_schedule, get_goalie_stats, get_team_stats, get_skater_season_stats, get_player_game_log | season <yyyy>
```

## When there is no game or no line
If the week has no or few games, say so and rank on the next 7 days. In the offseason there is nothing to stream; use last season's workloads and say they are stale. Under 5 games for a goalie this season, mark share as 'not enough data'.

## Rules
- Fantasy rankings and advice only: no betting language. A prop line is used here only as the market's median projection of a player's stat.
- The user's scoring and roster settings come from the user; if unstated, say which default you used and show the formula so they can swap it.

- Every number names its tool (the Data line, plus inline where it could be doubted) and every rate shows its sample size and season convention.
- Do not add names, roles, injuries or storylines from memory; if a tool did not return it, leave it out.
- If a tool returns too little, say "not enough data" and stop; do not estimate or borrow another sample.
- Sequences (last 5, recent form, a run of results) are quoted in the order the tool returns them, with dates; never retell them from memory. Lists in the answer must match the tool rows.
- Out of credits: if a call is refused for credits, pass on the API's message as it comes (it says when free credits refill and how to add more), and stop; don't retry or switch tools to get around it.
