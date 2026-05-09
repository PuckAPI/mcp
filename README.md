# PuckAPI MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-10b981.svg)](LICENSE)
[![Tools](https://img.shields.io/badge/tools-12-10b981)](#available-tools)
[![Seasons](https://img.shields.io/badge/seasons-16+-10b981)](#data-coverage)

**NHL data for Claude and AI agents.** Games, standings, player stats, betting odds, and line movement from 15+ sportsbooks -- 16 seasons of data through 12 MCP tools.

```
You:    "What were last night's NHL scores?"
Claude: [calls get_games] Here are last night's results...

You:    "Show me the line movement on the Sabres game"
Claude: [calls get_line_movement] The Sabres opened at -130 and moved to...

You:    "Compare McDavid and MacKinnon this season"
Claude: [calls get_player_stats x2] Here's the side-by-side comparison...
```

## Quick Start

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "puckapi": {
      "url": "https://mcp.puckapi.com/mcp?key=YOUR_API_KEY"
    }
  }
}
```

### Claude Code

```bash
claude mcp add puckapi --transport streamable-http "https://mcp.puckapi.com/mcp?key=YOUR_API_KEY"
```

### Other MCP Clients

Any client supporting Streamable HTTP transport:

| Setting | Value |
|---------|-------|
| URL | `https://mcp.puckapi.com/mcp?key=YOUR_API_KEY` |
| Transport | Streamable HTTP |

Also accepts `Authorization: Bearer <key>` or `x-api-key` headers.

### Get an API Key

1. Sign up at [puckapi.com](https://puckapi.com) -- free, no credit card
2. 500 credits included immediately
3. Dashboard > API Keys > Create Key

## Available Tools

### Games
| Tool | Description |
|------|-------------|
| `get_games` | Game results with scores, periods, shots, and goals |
| `get_schedule` | Upcoming and past game schedules |
| `get_game_detail` | Full box score for a specific game |
| `get_head_to_head` | Historical matchup data between two teams |

### Teams
| Tool | Description |
|------|-------------|
| `get_standings` | Current or historical standings by season |
| `get_team_stats` | Team-level stats (goals, shots, PP%, PK%, etc.) |
| `list_teams` | All NHL teams with abbreviations and metadata |

### Players
| Tool | Description |
|------|-------------|
| `search_players` | Find players by name |
| `get_player_stats` | Skater stats (goals, assists, points, TOI, etc.) |
| `get_goalie_stats` | Goalie stats (SV%, GAA, wins, shutouts, etc.) |

### Odds
| Tool | Description |
|------|-------------|
| `get_odds` | Pre-game odds from 15+ sportsbooks (ML, spread, total) |
| `get_line_movement` | Track how lines move from open to close |

## Data Coverage

| Category | Details |
|----------|---------|
| Seasons | 2008-09 through current (16+) |
| Games | 22,000+ with full box scores |
| Odds | Pre-game ML, spread, totals from 15+ books |
| Line movement | Opening to closing line tracking |
| Players | 3,000+ skaters and goalies |
| Updates | Scores and odds refresh throughout the day |

## Pricing

| Plan | Credits/mo | Price |
|------|-----------|-------|
| Free | 500 | $0 |
| Starter | 5,000 | $19/mo |
| Pro | 15,000 | $49/mo |
| Scale | 50,000 | $149/mo |

Each tool call costs 1 credit. Top up anytime with wallet deposits.

## REST API

PuckAPI also offers a REST API for non-MCP use cases:

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://mcp.puckapi.com/v1/get_standings
```

Full docs at [puckapi.com/docs](https://puckapi.com/docs).

## Related

- **[PuckAPI Skills](https://github.com/PuckAPI/claude-sports-analytics)** -- 28 free Claude Code skills for hockey analytics, betting models, and research
- **[puckapi.com](https://puckapi.com)** -- sign up, dashboard, API docs

## License

[MIT](LICENSE)
