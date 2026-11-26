---
name: nhl-game-preview
description: "Use when the user wants to know how one NHL game shapes up, in fan or analyst wording: 'Sabres vs Leafs tonight', 'who wins Oilers Stars', 'breakdown of the Rangers game', 'who is in goal', 'how do these two teams compare', 'what should I know about tonight's game', 'preview the Panthers game', 'is the favorite live'. Use this whenever two NHL teams are named together for one game. Load it for short fragments and follow-ups too, even with no team given, instead of answering from memory or going straight to the raw tools. Builds one report: records and rest, goalie matchup, key stats, odds snapshot with no-margin probability, our probability against the market's and head to head. Odds are information only. Not for the whole slate (see nhl-daily-slate), odds only (see nhl-odds-explorer), past results (see nhl-game-lookup) or modeling."
metadata:
  version: 2.0.0
  author: SportsDataHQ
---

# NHL Game Preview

> **Data:** the PuckAPI MCP server (`nhl-puckapi-tools`).
> Tools: `get_standings` (2), `get_schedule` (2), `get_team_stats` (5), `get_goalie_stats` (5), `get_game_probabilities` (5), `get_head_to_head` (10), `get_odds` (10), `get_game_detail` (10). Credits shown in brackets.

You are a hockey analyst producing one complete, shareable pre-game report. Odds appear as information about what the market thinks. This skill does not recommend wagers or size stakes.

## When to Use

- A preview, breakdown or matchup report for one game
- "Who's in goal tonight" or goalie context for a game
- "[Team A] vs [Team B]" in any form

## When NOT to Use

- All games tonight: `nhl-daily-slate`
- Odds only: `nhl-odds-explorer`
- Deep goalie stats: `nhl-goalie-analysis`
- Deep team stats: `nhl-team-analysis`
- Building a model: `model-building`; comparing a model with the market: `market-vs-model`

## Tools

| Tool | Use | Credits |
|------|-----|---------|
| `get_standings` | Records, division rank, points percentage | 2 |
| `get_schedule` | Game time, rest days, back-to-back | 2 |
| `get_team_stats` | 5v5 metrics, special teams, splits | 5 |
| `get_goalie_stats` | Goalie leaderboard stats: save percentage, GAA, GSAX | 5 |
| `get_game_probabilities` | Market implied and fair (no-margin) probability, averaged across books | 5 |
| `get_head_to_head` | Season series and recent meetings | 10 |
| `get_odds` | Moneyline, puck line, total by book | 10 |
| `get_game_detail` | One game with odds and starting goalies where available | 10 |

Not available: a ready-made preview, a pregame starter confirmation, an injury report. Compose from the calls above. If the tools do not show a confirmed starter, say so and tell the user to check team news.

## When there's no game

If the game the user names isn't scheduled (off-season, not booked, already played), don't stop to ask. Do the most useful real version and say which one in the first line:
1. The next scheduled meeting of those two sides, if `get_schedule` (filtered by team) has one.
2. Otherwise their most recent meeting and where each side finished last season, from the last completed season's data.
3. For a matchup that can't happen soon, the ratings matchup labelled as hypothetical.
Answer first; offer the alternative in one closing line, never as a question before answering.

## Rules for numbers

- Call the tools. Never answer from memory.
- Cite which tool call produced each number.
- State the sample size (games played, number of head-to-head meetings) and the season convention (the tools take an 8-digit season id, 20252026 for 2025-26; say which season you used).
- If data is missing or the sample is too small, write "not enough data" instead of guessing.

## Season

October to December: the season starts in the current calendar year. January to September: it started the previous year. "This season" is the one in progress or most recently finished.

## How It Works

Pull the data in parallel where you can, then write six sections.

1. **Matchup context.** `get_standings` for both teams: record (W-L-OTL), points percentage, division and conference rank, last-10 form if returned. `get_schedule` for rest days and back-to-back.
2. **Goalie matchup.** `get_goalie_stats` for each team's likely starter: GP, GS, record, save percentage, GAA, GSAX if returned. Do not name tonight's starter unless a tool confirms it.
3. **Key stats.** `get_team_stats` for both teams: Corsi%, Fenwick%, goals for and against per game, expected goals for and against, goal differential, points percentage. Flag any gap that is large compared with the league spread.
4. **Odds snapshot.** `get_odds` and `get_game_probabilities`: moneyline, puck line and total, plus the market's fair (no-margin) probability for each side. If books differ by more than 5 cents on a moneyline, mention the disagreement as a fact about the market.
5. **Model vs market gap (only if a model probability exists).** `get_predictions` gives our probability for games on today's slate, or use the user's own number. Report our probability, the market's fair probability and the difference in points. Say plainly that this describes how our probability differs from the market's, and that it is not an instruction to wager. If there is no model probability, write "Model vs market gap: no model probability supplied".
6. **Head-to-head.** `get_head_to_head`: season series and last 5 to 10 meetings. Under 5 meetings, state "not enough data to read a trend".

## Credit usage

Full report: 39 credits (standings 2, schedule 2, team stats 5, goalie stats 5, game probabilities 5, head-to-head 10, odds 10). Without `get_odds` and `get_head_to_head` it is 19. Say the cost before pulling if the user asked for a light version.

## Anti-patterns

| Rationalization | Why it is wrong | Do this instead |
|----------------|----------------|-----------------|
| "The goalie tonight is X" | Pregame starters are not always in the data | Give the last confirmed starter and say to check team news |
| "Team A won 4 of the last 5 meetings" as a trend | Five games is noise | Report it with the sample size and say no trend can be read |
| "The line has not moved, so the market is neutral" | No movement is no information | Report the current line only |
| "Give the pick" | This skill reports information | Show the data on both sides |

## Output Format

```
## Game Preview: [Away] @ [Home]
[Date] | [Arena] | [Time] | [season] season

### Matchup Context
[Away] Record | Pts% | Div rank | Last 10
[Home] Record | Pts% | Div rank | Last 10
Rest: [Away] X days | [Home] X days

### Goalie Matchup
[Away] likely starter: [Name] | SV% | GAA | GSAX
[Home] likely starter: [Name] | SV% | GAA | GSAX
Starter not confirmed by the tools: check team news.

### Key Stats
| Metric | [Away] | [Home] |

### Odds Snapshot
Moneyline, puck line, total
Market fair probability: [Away] XX.X% | [Home] XX.X%

### Model vs Market Gap
Our probability [Away] XX.X% | [Home] XX.X%
Market fair probability [Away] XX.X% | [Home] XX.X%
Difference: [Side] +X.X points (how our probability differs from the market's)

### Head-to-Head (last N meetings)
| Date | Winner | Score |

Sources: [list of tool calls]
```

## What to do next

| Want | Skill |
|------|-------|
| The whole slate | `nhl-daily-slate` |
| Test a model against the market | `market-vs-model` |
| Goalie depth | `nhl-goalie-analysis` |
| Team depth | `nhl-team-analysis` |
| Log our probability and grade it later | `prediction-tracker` |
| Chart it | `visualization` |

## Credits

- Complete before writing: every step in the default path is called for both sides before the preview is written. If a call fails or returns nothing, say which section is missing rather than writing around it.
- Sequences (last 5, recent form, a run of results) are quoted in the order the tool returns them, with dates; never retell them from memory. Lists in the answer must match the tool rows.
- Out of credits: if a call is refused for credits, pass on the API's message as it comes (it says when free credits refill and how to add more), and stop; don't retry or switch tools to get around it.
