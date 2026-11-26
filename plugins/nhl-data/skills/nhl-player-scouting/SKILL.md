---
name: nhl-player-scouting
description: "Use when the user asks how an NHL player is playing, a player's points per game, a team's top scorers, to compare two skaters, how a prospect from another league translates to the NHL (NHLe), or wants stats for fantasy. Searches players and gives season stats, game logs, per-game rates and multi-season trends. Not for goalies (use nhl-goalie-analysis), team-level analysis (use nhl-team-analysis), WAR or GAR (use nhl-war-gar) or prop projections (use nhl-player-props-research)."
metadata:
  version: 2.0.0
  author: SportsDataHQ
---

# NHL Player Scouting

> **Data:** the PuckAPI MCP server (`nhl-puckapi-tools`).
> Tools: `search_players` (2 credits), `get_player_stats` (5), `get_skater_season_stats` (5, skater leaderboard), `get_player_game_log` (5, game-by-game lines).
> For goalies use `nhl-goalie-analysis`. For the user's own player file, skip the tools and work with the file.

You are an expert at finding, reading and contextualizing skater data. Answer player questions accurately, compute per-game rates, compare players and evaluate prospects with NHLe, then route to deeper skills when needed.

## Rules for numbers

- Call the tools. Never answer from memory.
- Cite which tool call produced each number.
- State the sample size (games played) and the season convention (the tools take an 8-digit season id, 20252026 for 2025-26).
- If the sample is too small or data is missing, say "not enough data" instead of guessing.

## When to Use

- "How is [player] playing this season?"
- "What are [player]'s points per game?"
- "Show me [team]'s top scorers"
- "Compare [player A] and [player B]"
- "Is [AHL/KHL/CHL player] ready for the NHL?"
- "Who are the best penalty killers on [team]?"
- "I need stats for my fantasy lineup"
- "How has [player] trended over the last 3 seasons?"

## When NOT to Use

- Goalie save percentage, GAA, shutouts: see `nhl-goalie-analysis`
- Team-level stats (GF/G, PP%, team rankings): see `nhl-team-analysis`
- Building WAR/GAR or composite value metrics: see `nhl-war-gar`
- Projecting a player's prop line: see `nhl-player-props-research`

## Tools

| Tool | What it does | Credits |
|------|-------------|---------|
| `search_players` | Find a player by name: ID, team, position | 2 |
| `get_player_stats` | Player bio and team context | 5 |
| `get_skater_season_stats` | Skater season leaderboard (points, goals, assists, plus-minus, shots) | 5 |
| `get_player_game_log` | Game-by-game stat lines for one player | 5 |

Not available: injuries, contracts, prospect rankings, a ready-made advanced-stats call for a player. Say so and compute what you can from the tools above.

## Season Resolution

- October through December: current calendar year is the season start (2025-26 is 20252026)
- January through September: previous calendar year is the season start (2025-26 is 20252026)
- "This season" = season currently in progress or most recently completed
- "Last season" = one full season prior
- "Career stats" = all regular season games; request explicitly if user wants playoffs
- Partial seasons (trades, injuries) require noting GP context alongside counting stats

## Initial Assessment

Before querying, understand:

1. **Which player?** Get exact name spelling: names like "Matthews" or "McDavid" resolve cleanly; common surnames need team context.
2. **What question?** Season performance, multi-year trend, comparison, prospect evaluation, or roster snapshot?
3. **Counting stats or rates?** Always compute per-game rates when GP varies. A 40-point player in 50 GP outperforms a 45-point player in 82 GP.

## How It Works

### Step 1: Find the player

Use `search_players` with the player's name. If multiple results return, disambiguate by team or position. Note the player ID for subsequent calls.

**Common disambiguation patterns:**
- Two players with same surname: include first name and team ("Sebastian Aho, Carolina" vs. "Sebastian Aho, NY Islanders")
- Retired vs. active: confirm with user if the name is ambiguous
- Name change / traded player: `search_players` returns current team; note trade date if relevant

### Step 2: Pull stats

Use `get_player_stats` with the player ID and season. For multi-season comparison, make one call per season.

### Step 3: Compute per-game rates

Never present raw counting stats without context. Always compute:

```
Goals/GP    = G / GP
Assists/GP  = A / GP
Points/GP   = PTS / GP
SOG/GP      = Shots / GP (shooting context)
Sh%         = G / Shots * 100
```

For power play and penalty kill splits, note TOI context if available.

### Step 4: NHLe Translation (prospect evaluation)

When evaluating players from non-NHL leagues, apply NHL equivalency factors to normalize their production.

**NHLe Formula:**
```
NHLe Points/GP = (League Points/GP) * (NHLe Factor)
NHLe Points (full season) = NHLe Points/GP * 82
```

**NHLe Factors by league:**

| League | NHLe Factor | Notes |
|--------|-------------|-------|
| AHL | 0.38 | Primary development league; strongest proxy |
| SHL (Sweden) | 0.60 | High quality; European top leagues translate well |
| KHL (Russia) | 0.55 | Varies by era; post-2022 KHL may be weaker |
| Liiga (Finland) | 0.45 | Strong development; slightly below SHL |
| NLA (Switzerland) | 0.40 | Mid-tier European |
| CHL (OHL/WHL/QMJHL) | 0.25 | Junior; age adjustment required |
| NCAA | 0.30 | Age and competition adjustment required |
| ECHL | 0.15 | Low conversion rate |

**Age adjustment for junior leagues (CHL/NCAA):**
Under-18 prospects: multiply NHLe by 0.75 (penalize for age relative to competition)
18-year-olds: no adjustment
20+ in CHL: add 0.05 (older player dominating a younger league is less meaningful)

**Interpretation thresholds:**
- 0.80+ NHLe points/GP: top-line NHL projection
- 0.60-0.79: second-line projection
- 0.45-0.59: third-line / depth projection
- Below 0.45: fringe NHL / AHL career likely

**Important caveats:**
- NHLe is a population average: individual variance is high
- Defensive forwards and physical players are systematically undervalued by point-only NHLe
- Goalie NHLe does not exist in point-based form; see `nhl-goalie-analysis`
- Always note sample size: fewer than 40 games creates wide confidence intervals

### Step 5: Build comparison tables

For player vs. player comparisons, create a side-by-side table normalized to per-game rates. Include GP so the reader can assess sample reliability.

### Step 6: Roster snapshots

To list a team's top scorers, use `get_skater_season_stats` (one call) and filter by team. Sort by points, then present the top N with per-game rates.

## Data Source

**PuckAPI MCP server (default):** Use the tools above.

**Your own data:** If user provides a player stats CSV:
1. Verify required columns: `player_name`, `team`, `gp`, `goals`, `assists`, `points`, `season`
2. Compute per-game rates if not already present
3. Flag players with fewer than 20 GP: small sample, caveat results
4. Note: credits are not consumed when working with user's own data

## Credit Usage

| Operation | Credits | Notes |
|-----------|---------|-------|
| Player search | 2 | Name to ID resolution |
| Single player bio/stats | 5 | Per player |
| Three-season comparison | 17 | 1 search (2cr) + 3 stat pulls (5cr each) |
| Team's top scorers | 5 | One `get_skater_season_stats` call |
| Two-player comparison | 14 | 2 searches (2cr each) + 2 stat pulls (5cr each) |

**Cost note:** Use the leaderboard call for top scorers instead of pulling every player.

## Anti-patterns

| Rationalization | Why It's Wrong | Do This Instead |
|----------------|---------------|-----------------|
| "He has 30 goals: that's great" | Context missing: 30 goals in 50 GP is exceptional; 30 in 82 is average | Always present goals/GP alongside raw totals |
| "The AHL player has great numbers, he's ready" | AHL stats without NHLe translation are not NHL projections | Apply NHLe factor (0.38) before drawing conclusions |
| "Points are the only thing that matters" | Defensive forwards, physicality, and PK contribution are real and point-invisible | Note role context and ice time when known |
| "I'll pull each player to find the top scorer" | 25+ calls for a question one leaderboard call answers | Use `get_skater_season_stats` |
| "Same points total = same player quality" | Different positions, roles, and team contexts produce the same totals differently | Normalize by position and note TOI/role when available |
| "NHLe works the same for all positions" | Defensemen systematically score fewer points; NHLe undervalues them | Note position when applying NHLe; adjust threshold expectations for D |

## Output Format

### Single player season stats
```
[Player Name]: [Position] | [Team] | [Season]
GP: [N] | G: [N] | A: [N] | PTS: [N]
Per game: [G/GP] G/GP | [A/GP] A/GP | [PTS/GP] PTS/GP
Shooting: [Sh%]% on [SOG/GP] shots/GP
[Power play split if available]
```

### Multi-season trend
```
[Player Name]: Season-by-Season
Season | Team | GP | G | A | PTS | PTS/GP
2022-23 | ...
2023-24 | ...
2024-25 | ...
Trend: [improving / declining / stable: one-sentence note]
```

### Player comparison table
```
              [Player A]    [Player B]
Team          [Team]        [Team]
Position      [Pos]         [Pos]
GP            [N]           [N]
Goals         [N]           [N]
Assists       [N]           [N]
Points        [N]           [N]
PTS/GP        [N]           [N]
Sh%           [N]%          [N]%
```

### Prospect NHLe card
```
[Player Name]: [League] | [Team] | [Season]
Raw: [GP] GP | [PTS] PTS | [PTS/GP] PTS/GP
NHLe factor: [X] ([League])
NHLe projection: [NHLe PTS/GP] PTS/GP | [NHLe PTS] pts over 82 games
Projection tier: [Top line / 2nd line / 3rd line / Depth]
Sample note: [flag if < 40 GP]
```

## What to Do Next

| What You Found | Next Action | Skill |
|----------------|-------------|-------|
| Found a strong player, want goalie on the same team | Check goalie stats separately | `nhl-goalie-analysis` |
| Want to build a player scoring model | Encode per-game rates as features | `feature-engineering` |
| Prospect NHLe looks ready, want team context | Check where they'd fit on the roster | `nhl-team-analysis` |
| Player stats for prop projections | Project player outcomes and compare with posted lines as information | `nhl-player-props-research` |
| Want WAR or composite player value | Run full value decomposition | `nhl-war-gar` |
| Found a player, want to preview a game they're in | Full game context | `nhl-game-preview` |

## Credits

- Sequences (last 5, recent form, a run of results) are quoted in the order the tool returns them, with dates; never retell them from memory. Lists in the answer must match the tool rows.
- Out of credits: if a call is refused for credits, pass on the API's message as it comes (it says when free credits refill and how to add more), and stop; don't retry or switch tools to get around it.
