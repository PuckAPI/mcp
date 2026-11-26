# PuckAPI season pack

The last completed season of hockey as CSV, free to use under the [PuckAPI Sample Data Licence](../DATA-LICENSE.md). Use it in anything you build, credit PuckAPI, and don't republish the files themselves.

**Download:** the latest `puckapi-season-pack.zip` from this repository's [season-pack release](https://github.com/PuckAPI/mcp/releases/tag/season-pack). `preview/` holds the first 100 rows of a few files.

Seasons: 2025-2026. Season naming: files write it 2025-2026; the API's season id is 20252026. Competitions, by their API id: ahl, echl, nhl, ohl, pwhl, qmjhl, ushl, whl. No odds, props or play-by-play: those, every earlier season and live data are on the API, free to start at https://puckapi.com/signup?utm_source=github&utm_medium=pack&utm_campaign=puckapi-pack.

## Files

| File | Rows |
|---|---|
| `puckapi-ahl-2025-2026-games.csv` | 1,241 |
| `puckapi-ahl-2025-2026-goalies.csv` | 135 |
| `puckapi-ahl-2025-2026-skaters.csv` | 1,234 |
| `puckapi-ahl-2025-2026-standings.csv` | 32 |
| `puckapi-echl-2025-2026-games.csv` | 1,161 |
| `puckapi-echl-2025-2026-goalies.csv` | 126 |
| `puckapi-echl-2025-2026-skaters.csv` | 1,195 |
| `puckapi-echl-2025-2026-standings.csv` | 30 |
| `puckapi-nhl-2025-2026-games.csv` | 1,394 |
| `puckapi-nhl-2025-2026-goalies.csv` | 63 |
| `puckapi-nhl-2025-2026-skaters.csv` | 928 |
| `puckapi-nhl-2025-2026-standings.csv` | 32 |
| `puckapi-ohl-2025-2026-games.csv` | 752 |
| `puckapi-ohl-2025-2026-goalies.csv` | 61 |
| `puckapi-ohl-2025-2026-skaters.csv` | 624 |
| `puckapi-ohl-2025-2026-standings.csv` | 20 |
| `puckapi-pwhl-2025-2026-games.csv` | 133 |
| `puckapi-pwhl-2025-2026-goalies.csv` | 20 |
| `puckapi-pwhl-2025-2026-skaters.csv` | 187 |
| `puckapi-pwhl-2025-2026-standings.csv` | 8 |
| `puckapi-qmjhl-2025-2026-games.csv` | 659 |
| `puckapi-qmjhl-2025-2026-goalies.csv` | 65 |
| `puckapi-qmjhl-2025-2026-skaters.csv` | 583 |
| `puckapi-qmjhl-2025-2026-standings.csv` | 18 |
| `puckapi-ushl-2025-2026-games.csv` | 537 |
| `puckapi-ushl-2025-2026-goalies.csv` | 59 |
| `puckapi-ushl-2025-2026-skaters.csv` | 606 |
| `puckapi-ushl-2025-2026-standings.csv` | 16 |
| `puckapi-whl-2025-2026-games.csv` | 856 |
| `puckapi-whl-2025-2026-goalies.csv` | 72 |
| `puckapi-whl-2025-2026-skaters.csv` | 721 |
| `puckapi-whl-2025-2026-standings.csv` | 23 |

## Columns

- **games**: `league`, `season`, `game_type`, `date`, `home_team`, `away_team`, `home_score`, `away_score`, `venue`
- **goalies**: `league`, `season`, `goalie`, `team`, `games_played`, `games_started`, `wins`, `losses`, `ot_losses`, `goals_against`, `shots_against`, `saves`, `save_pct`, `gaa`, `shutouts`, `toi_minutes`, `xga`, `gsax`, `high_danger_save_pct`
- **skaters**: `league`, `season`, `player`, `team`, `position`, `games_played`, `goals`, `assists`, `points`, `plus_minus`, `pim`, `shots`, `shooting_pct`, `power_play_goals`, `power_play_points`, `shorthanded_goals`, `game_winning_goals`, `ot_goals`, `faceoff_pct`, `toi_minutes`, `avg_toi_minutes`
- **standings**: `league`, `season`, `rank`, `team`, `conference`, `division`, `games_played`, `wins`, `losses`, `ot_losses`, `points`, `point_pct`, `goal_diff`, `goals_for_per_game`, `goals_against_per_game`, `xg_for`, `xg_against`, `corsi_pct`, `fenwick_pct`

Credit line for anything you publish: **Data: PuckAPI (puckapi.com)**
