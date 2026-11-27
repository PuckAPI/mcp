# PuckAPI: hockey skills

Hockey analysis skills on PuckAPI: game previews, player and team research, and the community's standard metrics, with every number pulled live from the PuckAPI MCP server.

## Skills

- `nhl-advanced-stats`: Use when the user asks what a hockey advanced stat means or how to read it, in fan or analyst wording.
- `nhl-daily-slate`: Use when the user asks what is on tonight, wants the full NHL slate, every game today, a daily rundown, or which games the model sees differently from the market.
- `nhl-dfs-lineup`: Use when someone has an NHL daily fantasy slate.
- `nhl-fantasy-streamers`: Use when a fantasy hockey manager is planning the week or hunting pickups.
- `nhl-game-preview`: Use when the user wants to know how one NHL game shapes up, in fan or analyst wording.
- `nhl-goalie-gsax-report`: Use when the user asks whether an NHL goalie is good, hot, overrated, tired or just the team in front of him, in fan or analyst wording.
- `nhl-odds-explorer`: Use when the user asks what the NHL lines or prices are for a game, in fan or analyst wording.
- `nhl-player-props-research`: Use when the user asks about an NHL player's prop line or stat for a game, in fan or analyst wording.
- `nhl-player-scouting`: Use when the user asks how an NHL player is playing, a player's points per game, a team's top scorers, to compare two skaters, how a prospect from another league translates to the NHL (NHLe), or wants stats for fantasy.
- `nhl-playoff-simulation`: Use when the user asks about NHL playoff, seeding or Cup chances, in fan or analyst wording.
- `nhl-puckapi-tools`: Use when any hockey skill needs data, or when the user asks which PuckAPI tool or endpoint to call, in developer wording.
- `nhl-research-workflow`: Use when the user asks how to analyze hockey data with Claude, how to structure an analysis session, how to test a hunch about a team or player, how to improve a model that is stuck, or how to write up model performance.
- `nhl-totals-model`: Use when the user asks how many goals an NHL game will have, in fan or analyst wording.
- `nhl-war-gar`: Use when the user asks how valuable an NHL skater really is, in fan or analyst wording.
- `nhl-xg-model`: Use when the user wants to build or train their own hockey shot-quality model, in fan or analyst wording.
- `nhl-xg-report`: Use when the user asks whether an NHL team's or game's result matches the chances created, in fan or analyst wording.

## Data it sends

The skills call the PuckAPI MCP server at `mcp.puckapi.com`. Each call sends the tool name and its inputs (teams, players, dates, seasons) with your PuckAPI API key, and returns data. Nothing from your files or conversation is sent beyond what a tool call needs. Calls use credits on your PuckAPI account; a free key at https://puckapi.com/signup includes monthly credits.

Privacy policy: https://puckapi.com/privacy

## Install

```
/plugin marketplace add sports-data-hq/sportsdatahq-skills
/plugin install nhl-data@sportsdatahq
```

More: https://puckapi.com/skills. Licence: MIT (see LICENSE).
