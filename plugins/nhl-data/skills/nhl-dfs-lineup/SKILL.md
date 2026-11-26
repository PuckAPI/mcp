---
name: nhl-dfs-lineup
description: "Use when someone has an NHL daily fantasy slate: 'build my hockey DraftKings lineup', 'salary file for tonight, make a lineup', 'line stack with a power play', 'cheap goalie options', 'which line to stack', 'value defensemen', 'project the slate', 'FanDuel hockey lineup'. Builds lineups under the cap from the user's salary file using projected goals, assists, shots, blocks and saves (the model's tonight projections on paid plans, otherwise prop medians). Also for bare follow-ups with no names: load this skill first, then ask for what is missing, rather than answering from memory. Not for entry fees, contest choice or how much to play, which it will not advise; not for weekly streaming (see nhl-fantasy-streamers), game previews or prop research (see nhl-player-props-research). Needs the salary file pasted."
metadata:
  version: 1.0.0
  author: SportsDataHQ
---

# NHL DFS lineup builder

NHL DFS is scored on goals, assists, shots, blocks and the goalie's saves and win, so a lineup stack is built from a line or a power-play unit and a goalie on the right side of the game. Salaries and confirmed lines come from the user; projections come from the model's slate projections when the plan allows, or from the market's medians.

## Before you start
- For anything across games, seasons or players, apply the sports-data-preflight checks first (ids from search, the season convention, one league, enough data).
- Tools come from the PuckAPI MCP server. `season` is an 8-digit id (20252026 is 2025-26). Player ids come from `search_players(name)` (2 cr).
- Required from the user: the salary file, cap, roster slots and scoring. DraftKings classic is usually 2 C, 3 W, 2 D, UTIL, G at 50,000; scoring roughly goal 8.5, assist 5, shot 1.5, block 1.3, goalie win 6, save 0.7, goal against -3.5. Confirm what the site uses.
- Lines, power-play units and the confirmed starting goalie are not in the data. Take them from the user's file or message, or label stacks as built from the salary file's positions and the ice-time evidence.
- `get_prop_projections` is paid plans only and covers tonight's slate; a refused call costs nothing.

## Default path (projection pull 25 credits per team filter or the slate; props 10 credits per game)
1. **Slate.** `get_schedule(days: 1)` (2 cr): tonight's games and the median total.
2. **Projections (paid plans).** `get_prop_projections()` (25 cr): each skater's projected goals, assists, points, shots and each goalie's saves, with ranges. Pull once for the slate.
3. **Projections (otherwise).** `get_player_props(game_id, estimate_only: true)` (free) then `get_player_props(game_id)` (10 cr per game): goals, assists, points, shots on goal, blocked shots and goalie saves medians.
4. **Roles.** `get_skater_season_stats(team, sort_by: points)` (5 cr per team): time on ice and power-play points for the stack candidates.
5. **Goalies.** `get_goalie_stats(team)` (5 cr): save percentage and GSAX for the goalies in the pool.

## Projection method
Projection per player, scored with the site's table (defaults above, confirm):
- Skater = 8.5 x goals + 5 x assists + 1.5 x shots + 1.3 x blocked shots, using the model projection if available (the projected means) or the median lines (and say which). Blocks come only from the line; without one, use the season average per game (n shown). Add short-handed and shootout items only if the user's scoring has them, left out otherwise.
- Goalie = 0.7 x saves line - 3.5 x goals against + 6 x win probability, where goals against = the opponent's implied goals (from the game total and fair win share in `get_schedule`, say it is derived) and win probability is the team's fair win probability; state it is an estimate.
- Players with no projection or line: mark 'no projection' and exclude unless the user wants them.
Lineup construction:
- Maximize the sum of projected points under the cap with the roster slots (exact solve with a short script, or greedy by points per $1,000 then pairwise swaps; say which).
- Stacks: if the user wants one, fix a center and two wingers from the same team (from the file's listed line, or the three forwards with the highest time on ice), optionally their power-play defenseman, then re-solve. Say that correlation here is structural and the line is unconfirmed unless the user gave it.
- Do not pair a goalie with skaters facing him if the user asks for no opposing skaters; mention it only if requested.
- Show used salary, remaining salary and projected points.

## Output template
```
Slate: <games>, cap <$>, scoring <site>
Lineup 1: salary <used>/<cap>, projected <pts>
C ... | C ... | W ... | W ... | W ... | D ... | D ... | UTIL ... | G ...
Stack: <team: C + 2 W (line source: your file / ice-time guess)>
Projection source: <model projections / prop medians>
Watch: <goalie unconfirmed, injury, no projection>
Data: get_schedule, get_prop_projections or get_player_props, get_skater_season_stats, get_goalie_stats | season <yyyy>
```

## When there is no game or no line
If there is no salary file, say lineups cannot be built and offer projections for named players. If the plan refuses `get_prop_projections`, use prop medians. On a slate of one or two games, say the pool is thin. If no game is scheduled, say so. If the goalie is unconfirmed, say so and show both options.

## Rules
- The salary file, the cap, the roster slots and the scoring system come from the user. If any is missing, ask for it; never use remembered salaries or prices.
- Build lineups under the cap the user gives. Do not advise on entry fees, which contest to enter or how much to play, and do not call any player a lock. Projections are estimates, not promises.
- Odds and prices are information about the market only: no picks, leans, stakes, payouts or sportsbook links. A prop line is used here only as the market's median projection of a player's stat.
- Ownership is not in the data. Use it only if the user pastes it, and say it came from them.

- Every number names its tool (the Data line, plus inline where it could be doubted) and every rate shows its sample size and season convention.
- Do not add names, roles, injuries or storylines from memory; if a tool did not return it, leave it out.
- If a tool returns too little, say "not enough data" and stop; do not estimate or borrow another sample.
- Sequences (last 5, recent form, a run of results) are quoted in the order the tool returns them, with dates; never retell them from memory. Lists in the answer must match the tool rows.
- Out of credits: if a call is refused for credits, pass on the API's message as it comes (it says when free credits refill and how to add more), and stop; don't retry or switch tools to get around it.
