<div align="center">

<img src="assets/banner.svg" alt="PuckAPI MCP Server" width="100%">

<br>
<br>

**The hockey data API.** Stats, odds, and everything between.<br>REST API and MCP server. Free to start.

<br>

[![License: MIT](https://img.shields.io/badge/License-MIT-10b981.svg?style=flat-square)](LICENSE)
[![Tools](https://img.shields.io/badge/tools-15-10b981?style=flat-square)](#available-tools)
[![Seasons](https://img.shields.io/badge/seasons-16+-10b981?style=flat-square)](#data-coverage)
[![Skills](https://img.shields.io/badge/skills-28-10b981?style=flat-square)](https://github.com/PuckAPI/claude-sports-analytics)
[![Smithery](https://img.shields.io/badge/Smithery-listed-ff5601?style=flat-square)](https://smithery.ai/servers/noahowsh/PuckAPI)

[Quick Start](#quick-start) · [Tools](#available-tools) · [Data](#data-coverage) · [Pricing](#pricing) · [REST API](#rest-api)

</div>

<br>

```
You:    "What were last night's NHL scores?"
Claude: [calls get_games → returns scores, periods, shots, goals]

You:    "Show me the line movement on the Sabres game"
Claude: [calls get_line_movement → opening line, current line, timestamps, book-by-book]

You:    "Compare McDavid and MacKinnon this season"
Claude: [calls get_player_stats x2 → side-by-side goals, assists, points, TOI, shooting %]
```

## Quick Start

**Claude Desktop** -- add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "puckapi": {
      "url": "https://mcp.puckapi.com/mcp?key=YOUR_API_KEY"
    }
  }
}
```

**Claude Code** -- one command:

```bash
claude mcp add --transport http puckapi \
  "https://mcp.puckapi.com/mcp?key=YOUR_API_KEY"
```

**Other MCP clients** -- any client supporting Streamable HTTP:

| Setting | Value |
|---------|-------|
| URL | `https://mcp.puckapi.com/mcp?key=YOUR_API_KEY` |
| Transport | Streamable HTTP |

<sub>Also accepts `Authorization: Bearer` or `x-api-key` headers. Connecting and listing tools works without a key; calling a tool needs one.</sub>

**Get your free key** at [puckapi.com](https://puckapi.com) -- 500 credits, no credit card.

---

## Available Tools

<details open>
<summary><strong>Games</strong> -- 4 tools</summary>

<br>

| Tool | Description |
|------|-------------|
| `get_games` | Game results with scores, periods, shots, and goals |
| `get_schedule` | Upcoming and past game schedules |
| `get_game_detail` | Full box score for a specific game |
| `get_head_to_head` | Historical matchup data between two teams |

</details>

<details>
<summary><strong>Teams</strong> -- 3 tools</summary>

<br>

| Tool | Description |
|------|-------------|
| `get_standings` | Current or historical standings by season |
| `get_team_stats` | Team-level stats (goals, shots, PP%, PK%, etc.) |
| `list_teams` | All NHL teams with abbreviations and metadata |

</details>

<details>
<summary><strong>Players</strong> -- 4 tools</summary>

<br>

| Tool | Description |
|------|-------------|
| `search_players` | Find players by name |
| `get_player_stats` | Skater stats (goals, assists, points, TOI, etc.) |
| `get_skater_season_stats` | Season stats leaderboard -- goals, assists, points, TOI, shooting %, filterable by team and sortable by 5 metrics |
| `get_goalie_stats` | Goalie stats (SV%, GAA, wins, shutouts, etc.) |

</details>

<details>
<summary><strong>Odds</strong> -- 2 tools</summary>

<br>

| Tool | Description |
|------|-------------|
| `get_odds` | Opening and closing moneyline, puck line and total by sportsbook, back to 2020-21 |
| `get_line_movement` | Time-series odds grouped by bookmaker |

</details>

<details>
<summary><strong>Play-by-play</strong> -- 2 tools</summary>

<br>

| Tool | Description |
|------|-------------|
| `get_plays` | Play-by-play events with rink coordinates, strength state and the players involved |
| `get_shot_map` | Every shot attempt with rink coordinates, shot type, shooter and goalie |

</details>

---

## Data Coverage

| Category | Details |
|----------|---------|
| **Games** | 23,000+ across 16 seasons |
| **Play-by-play** | Every event since 2010-11 with rink coordinates (6.8M+ events) |
| **Odds** | Opening and closing lines back to 2020-21; 60+ books including Pinnacle from 2025-26 |
| **Line movement** | Hourly snapshots from September 2026 |
| **Players** | 4,800+ skaters and goalies |
| **Computed** | Expected goals, GSAX, Corsi and Fenwick |
| **PWHL** | Games, standings, play-by-play and shot locations; pass `league: "pwhl"` ([details](https://puckapi.com/pwhl)) |
| **Updates** | Games daily; odds captured hourly |

Live coverage by season: [historical odds](https://puckapi.com/data/historical-odds) · [play-by-play](https://puckapi.com/data/play-by-play) · [shot data](https://puckapi.com/data/shot-data)

---

## Pricing

| Plan | Credits/mo | Price |
|------|-----------|-------|
| **Free** | 500 | $0 |
| **Starter** | 10,000 | $19/mo |
| **Pro** | 30,000 | $49/mo |
| **Scale** | 125,000 | $149/mo |

Tools cost 1 to 25 credits a call ([per-tool costs](https://puckapi.com/pricing)). Wallet top-ups from $5 never expire.

---

## REST API

PuckAPI also offers a standard REST API:

```bash
curl -X POST https://mcp.puckapi.com/v1/get_standings \
  -H "x-api-key: YOUR_API_KEY"
```

Full documentation at [puckapi.com/docs](https://puckapi.com/docs).

---

## Related

| | |
|---|---|
| **[PuckAPI Skills](https://github.com/PuckAPI/claude-sports-analytics)** | 28 free Claude Code skills for hockey analytics, betting models, and research |
| **[puckapi.com](https://puckapi.com)** | Sign up, dashboard, API docs |

---

<div align="center">

**[puckapi.com](https://puckapi.com)** · **[API Docs](https://puckapi.com/docs)** · **[Skills](https://github.com/PuckAPI/claude-sports-analytics)**

<sub>MIT License</sub>

</div>
