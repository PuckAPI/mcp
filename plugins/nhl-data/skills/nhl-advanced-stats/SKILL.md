---
name: nhl-advanced-stats
description: "Use when the user asks what a hockey advanced stat means or whether it is skill or luck, in fan or analyst wording: 'what is PDO', 'explain Corsi', 'what does high danger mean', 'is shooting percentage luck', 'do bounces even out', 'is a team just getting lucky bounces', 'how do I read RAPM', 'what does zone entry data tell you', 'why does everyone say Fenwick'. Use this whenever a metric name, regression to the mean or how to interpret a number comes up. Load it for short fragments and follow-ups too, instead of answering from memory or going straight to the raw tools. Explains the metric, its limits and what it tells you, and pulls real numbers with sample sizes when asked. Not for checking one team's or game's results against its chances (see nhl-xg-report), building an xG model (see nhl-xg-model), odds terms (see odds-market-analysis) or value decomposition (see nhl-war-gar)."
metadata:
  version: 2.0.0
  author: SportsDataHQ
---

# NHL Advanced Stats

> **Data:** the PuckAPI MCP server (`nhl-puckapi-tools`).
> Tools: `get_team_stats` (5 credits) for team-level metrics, `get_goalie_stats` (5 credits) for goalie metrics, `get_skater_season_stats` (5 credits) for skaters, `get_player_stats` (5 credits) for player context.
> Explaining a definition needs no tool call and costs no credits.

You are an expert hockey analyst. Teach what advanced metrics mean, show how to read them in context, and connect them to real team or player numbers when asked. Users land here to understand metrics before they build models. Answer with the metric, then pull real numbers to make it concrete.

## Rules for numbers

- When you quote a team or player value, call the tool. Never answer from memory.
- Cite which tool call produced each number.
- State the sample size (games or minutes) and the season convention (the tools name an NHL season by the year it starts; say which one you used).
- If the data is missing or the sample is small (under about 20 games), say "not enough data" or flag it clearly instead of guessing.

## When to Use

- "What is Corsi?" / "What does CF% mean?"
- "What does a PDO of 1.02 mean?"
- "Is [team]'s xG rate good or bad this season?"
- "What are high-danger chances?"
- "What does RAPM measure?"
- "Explain advanced stats for the [team]"

## When NOT to Use

- Odds, margin or line movement: `odds-market-analysis` or `nhl-odds-explorer`
- Building an xG model: `nhl-xg-model`
- Features for a prediction model: `feature-engineering`
- WAR decomposition: `nhl-war-gar`

## Tools

| Tool | What it gives | Credits |
|------|--------------|---------|
| `get_team_stats` | Team shot-attempt rates and related metrics | 5 |
| `get_goalie_stats` | Save percentage, GAA, goals saved above expected | 5 |
| `get_skater_season_stats` | Skater season leaderboard | 5 |
| `get_player_stats` | Player bio and team context | 5 |
| `get_shot_map` | Shot locations for shot-quality work | 10 |

There is no tool called `get_corsi`, `get_fenwick`, `get_xg`, `get_zone_entries` or `get_rapm`. Compute shares from the shot columns the tools return. Say when a metric is not in the tool output rather than inventing it. Zone entry and exit data is not available through the PuckAPI MCP server.

## Season

October to December: the season starts in the current calendar year. January to September: it started the previous year. Shot-share metrics and PDO settle slowly; flag samples under 20 games.

## Core Metrics

### Corsi (CF%)

**What it measures:** Shot attempt share at even strength (5v5). All shot attempts: goals + shots on goal + missed shots + blocked shots.

**Formula:** `CF% = CF / (CF + CA)` where CF = shot attempts for, CA = shot attempts against.

**When to use:** Evaluating territorial possession and zone time over a full season. More stable than goal-based metrics.

**What it tells you:** Teams above 50% CF% are generating more attempts than they allow. Elite teams often run 52-55%. Below 46% is a red flag.

**Common misreading:** CF% is not a skill metric for individual players without adjusting for teammates and zone starts. A player on a bad team in defensive-zone-heavy deployment will look worse than they are.

---

### Fenwick (FF%)

**What it measures:** Unblocked shot attempt share at 5v5. Same as Corsi but excludes blocked shots.

**Formula:** `FF% = (CF - Blocked For) / ((CF - Blocked For) + (CA - Blocked Against))`

**When to use:** Fenwick is preferred over Corsi when evaluating shot quality, because blocked shots are partially a function of the opponent's defensive system, not the shooting team's skill.

**What it tells you:** A team that generates high-quality unblocked attempts scores more. Fenwick predicts future goal rates better than raw Corsi in some studies.

---

### PDO

**What it measures:** Team shooting percentage plus team save percentage at 5v5. A compound luck indicator.

**Formula:** `PDO = (5v5 shooting%) + (5v5 save%)`

**Baseline:** 1.000 (or expressed as 100.0 in some contexts). The league averages to exactly 1.000.

**When to use:** Identifying teams or players running above or below sustainable performance. High PDO inflates goal differential; low PDO suppresses it.

**What it tells you:** PDO above 1.020 suggests luck: expect regression. PDO below 0.980 suggests bad luck: expect improvement. Regresses to 1.000 after approximately 400 shots faced (see metrics-reference.md for stabilization rates).

**Common misreading:** PDO is NOT a pure luck metric. Elite goalies and elite shooters can sustain slightly non-1.000 PDO long-term. Discount the luck interpretation for teams with elite goaltending.

---

### Expected Goals (xG)

**What it measures:** The probability that a given shot results in a goal, based on shot characteristics (location, shot type, traffic, rebound, rush).

**Formula:** Shot-level probabilities from a logistic regression or gradient boosting model trained on historical shot outcomes. Team/player xG is the sum of shot-level probabilities.

**When to use:** Evaluating shot quality beyond volume. A team can have low Corsi but high xG if they generate slot shots. Use xGF% (expected goals for%) as the primary quality metric.

**What it tells you:** xGF% above 50% = generating higher-quality chances than allowing. xG gap between a team's actual goals and xG reveals luck or goaltending outliers.

**Common misreading:** xG models vary by builder because each uses different features. A "0.3 xG shot" from one model is not directly comparable to another model's output.

---

### Zone Entries / Zone Exits

**What it measures:** How teams enter and exit each zone: controlled (carry-in) vs. uncontrolled (dump-in). Zone exit success rate (clearing attempts that succeed).

**When to use:** Diagnosing possession systems. Teams that carry the puck in generate more scoring chances than teams that dump-and-chase.

**What it tells you:** Carry-in rate correlates with xG generation. Dump-in heavy teams are often outpossessed. Zone exit rate identifies defensive breakdowns.

**Data note:** Zone entry and exit data is hand-tracked and is not available through the PuckAPI MCP server.

---

### High-Danger Chances (HDC)

**What it measures:** Shots and scoring chances from the high-danger zone: the slot and in-tight areas directly in front of the net. Typically defined as the inner slot (within ~10 feet of the net, between the faceoff dots).

**When to use:** Evaluating line matchups, power play execution, and defensive exposure. A team that allows many HDC against has a structural problem, not just a PDO problem.

**What it tells you:** High-danger chance percentage (HDCF%) is a sharper predictor of goals than overall shot share. The average HDC converts at roughly 3-4x the rate of a perimeter shot.

---

### RAPM (Regularized Adjusted Plus-Minus)

**What it measures:** A player's impact on goals per 60 minutes, adjusted for teammates, opponents, zone starts, score state, and penalties drawn/taken. Uses ridge regression or similar regularization to shrink estimates toward zero for small samples.

**When to use:** Comparing players across different teams and deployment contexts. RAPM is the closest hockey gets to an "all-in-one" player value metric.

**What it tells you:** A RAPM of +2.0 goals/60 means the player contributes 2 additional goals per 60 minutes of ice time relative to a replacement-level player in the same context.

**Common misreading:** RAPM requires large samples (1,000+ minutes) to stabilize. Treat single-season RAPM for bottom-six players with skepticism.

---

### WAR (Wins Above Replacement)

**What it measures:** Total player value expressed in wins. Aggregates offensive contribution (goals + primary assists, expected), defensive contribution (shot suppression), and goaltending value into one number.

**When to use:** Comparing player value across positions and contracts. A 3-WAR player is worth 3 more wins than a freely available replacement.

**What it tells you:** League average forward is roughly 1-2 WAR per season. Top forwards are 4-6 WAR. Elite Norris-caliber defenders are 4-5 WAR. Goalies are measured separately (GSAA, GSAx).

**Common misreading:** WAR formulas differ between public models. Never compare WAR across different systems without naming the method.

## Interactive Mode: Real Data Explanation

When the user says "explain [metric] for the [team] this season":

1. Pull team stats: `get_team_stats` with team and season
2. Extract the relevant metric values
3. Explain what the numbers mean in plain language
4. Place them in league context (above/below average, top/bottom quartile)
5. Note any confounds (small sample, goalie injury, schedule difficulty)

**Example response pattern:**
```
Buffalo's CF% this season: 48.2% (below league average of 50.0%)
Translation: For every 100 shot attempts in a 5v5 game, Buffalo generates 48 and allows 52.
Context: This ranks 22nd in the league. They're being outshot, but their PDO is 1.018, 
so their goal differential looks better than their possession metrics suggest. 
Expect regression if PDO normalizes.
Sources: get_team_stats (BUF, 2025 season, 62 games).
```

## What to Do Next

| What You Found | Next Action | Skill |
|----------------|-------------|-------|
| Understand metrics, want to evaluate specific players | Scout players using advanced stats | `nhl-player-scouting` |
| Want to build an xG model | Start the xG model build process | `nhl-xg-model` |
| Ready to engineer features for a prediction model | Convert metrics into model-ready features | `feature-engineering` |
| Want WAR/GAR component breakdown | Deep dive into value decomposition | `nhl-war-gar` |
| Want metric formulas and stabilization rates | Read the full reference | `metrics-reference.md` (this directory) |
