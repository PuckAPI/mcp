# PuckAPI MCP Server

NHL data for Claude and AI agents. Stats, odds, schedules, line movement -- 16 seasons, 12 tools, one API key.

Connect Claude (or any MCP client) to live NHL data: game results, team standings, player stats, betting odds, and line movement from 15+ sportsbooks.

## Quick Start

### Claude Desktop

Add to your `claude_desktop_config.json`:

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

Any client that supports Streamable HTTP transport:

- **URL:** `https://mcp.puckapi.com/mcp`
- **Transport:** Streamable HTTP
- **Auth:** Pass your API key as `?key=YOUR_API_KEY` query parameter

## Get an API Key

1. Sign up at [puckapi.com](https://puckapi.com) (free, no credit card)
2. You get 500 free credits immediately
3. Go to Dashboard > API Keys > Create Key
4. Use the key in the config above

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

## Example Prompts

Once connected, ask Claude:

- "What were last night's NHL scores?"
- "Show me the current NHL standings"
- "Compare Connor McDavid and Nathan MacKinnon's stats this season"
- "What are the odds for tonight's games?"
- "Show me the line movement for the Sabres game"
- "How have the Maple Leafs performed against the Bruins this season?"

## Data Coverage

- **Seasons:** 2008-09 through current (16+ seasons)
- **Odds:** Pre-game moneyline, spread, and totals from 15+ sportsbooks
- **Line movement:** Opening to closing line tracking
- **Updates:** Scores and odds refresh throughout the day

## Pricing

| Plan | Credits/mo | Price |
|------|-----------|-------|
| Free | 500 | $0 |
| Starter | 5,000 | $19/mo |
| Pro | 15,000 | $49/mo |
| Scale | 50,000 | $149/mo |

Each MCP tool call costs 1 credit. Top up anytime with wallet deposits.

## REST API

PuckAPI also offers a REST API at `https://mcp.puckapi.com/v1/`. See the [API docs](https://puckapi.com/docs) for details.

## Links

- [Website](https://puckapi.com)
- [Dashboard](https://puckapi.com/dashboard)
- [API Docs](https://puckapi.com/docs)
- [Free Claude Code Skills](https://github.com/noahowsh/claude-sports-analytics) (28 hockey analytics skills, no API key needed)

## License

MIT
