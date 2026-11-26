---
name: nhl-odds-explorer
description: "Use when the user asks what the NHL lines or prices are for a game, in fan or analyst wording: 'what are the books saying about Panthers tonight', 'who is the favorite and by how much', 'which book has the best number on the Oilers', 'did the line move today', 'what is the total on Sabres Bruins', 'how big is the juice here', 'alt puck lines', 'first period market'. Use this whenever a hockey game and its price, spread, total or market chance come up. Load it for short fragments and follow-ups too, instead of answering from memory or going straight to the raw tools. Compares moneylines, puck lines and totals across books with implied and no-margin probability and line movement. Odds are information only, no stakes or picks. Not for odds math in general (see odds-market-analysis), our model against the market (see market-vs-model), player props (see nhl-player-props-research) or results."
metadata:
  version: 2.0.0
  author: SportsDataHQ
---

# NHL Odds Explorer

> **Data:** the PuckAPI MCP server (`nhl-puckapi-tools`).
> Tools: `get_odds` (10 credits), `get_game_probabilities` (5), `get_line_movement` (25), `get_market_odds` (10), `get_alt_lines` (10), `get_schedule` (2).

You are an expert in how betting markets price hockey. Show what the books are posting, what probability those prices imply, how much margin they carry and how the lines moved. Prices are information about the market. This skill does not recommend wagers or size stakes.

## When to Use

- Current moneyline, puck line or total across books
- How the books compare on one game, and how wide the spread between them is
- The margin (vig) in a market
- The market's implied and fair probability
- How a line moved from open to now
- Explaining American odds

## When NOT to Use

- Devigging methods, closing-line comparison or calibration of prices: `odds-market-analysis`
- Comparing a model's probability with the market: `market-vs-model`
- Results and schedules: `nhl-game-lookup`
- Historical odds for testing: `backtesting`

## Tools

| Tool | What it does | Credits |
|------|-------------|---------|
| `get_odds` | Current odds across books for one game | 10 |
| `get_game_probabilities` | Market implied and fair probability averaged across books | 5 |
| `get_line_movement` | Opening-to-latest line history for one game | 25 |
| `get_market_odds` | Period and regulation-result lines, opening and closing by book | 10 |
| `get_alt_lines` | Alternate puck lines and totals, each book's ladder (from 2023-24) | 10 |
| `get_schedule` | Find the game first if you have no game ID | 2 |

Not available: public betting percentages and live in-game odds. Odds and props are pre-game only.

## Rules for numbers

- Call the tools. Never answer from memory.
- Cite which tool call produced each price or probability.
- State how many books are in the comparison, the capture time of the lines and the season convention (the tools take an 8-digit season id, 20252026 for 2025-26).
- If a market has too few books or no lines, write "not enough data" instead of guessing.

## How It Works

1. **Find the game.** If the user names teams without a game ID, call `get_schedule` first.
2. **Pull prices.** `get_odds` for the game. Use `get_game_probabilities` for the cross-book fair probability.
3. **Compare books.** For each market (moneyline, puck line, total) list each book's price and the range. Report which book posts the highest and lowest price for each side as a fact about the market. This is price comparison as information, not a pointer to where to wager.
4. **Margin.** For a two-way market:
   ```
   implied(favorite) = |ml| / (|ml| + 100)       (negative moneyline)
   implied(underdog) = 100 / (ml + 100)          (positive moneyline)
   margin = implied_a + implied_b - 1
   fair_a = implied_a / (implied_a + implied_b)
   ```
   Report the margin per book and the fair probability. Method detail lives in `odds-market-analysis`.
5. **Line movement (on request).** `get_line_movement`: opening line, latest line, direction and size. A move of 10 or more cents on a moneyline, or half a goal on a total, is notable. Report what moved and when. Do not claim to know who caused it.
6. **Lead with the finding**, then the table.

## Reading American odds

- Negative (-150): the favorite. Implied probability 60%.
- Positive (+130): the underdog. Implied probability 43.5%.
- The two sides of a market add to more than 100%: the excess is the margin.
- Fair probability removes that margin so the two sides add to 100%.

## Credit usage

| Operation | Credits |
|-----------|---------|
| One game, all books | 10 |
| Fair probability across books | 5 |
| Line movement, one game | 25 |
| Odds for a whole slate | 10 per game |

Say the cost before pulling line movement for more than one game.

## Anti-patterns

| Rationalization | Why it is wrong | Do this instead |
|----------------|----------------|-----------------|
| "The line moved toward the favorite, so the favorite is right" | Direction alone says nothing about cause or outcome | Report size and timing only |
| "All books are the same" | Prices differ and the spread is itself informative | Show the range |
| "The margin is small, skip it" | Margin changes the implied probability | Show it and the fair probability |
| "Say where to play it" | This skill reports information | Report prices and probabilities |

## Output Format

```
[Away] @ [Home]: [Date] (lines captured [time], [N] books)

Moneyline: [Away] +XXX to +XXX (range) | [Home] -XXX to -XXX
  Fair probability (avg across books): [Away] XX.X% | [Home] XX.X%
  Margin: X.X% average

Puck line (+/-1.5): [Away] ... | [Home] ...
Total (O/U X.X): Over ... | Under ...

Line movement: open -> latest, size, time of largest move
Sources: get_odds, get_game_probabilities[, get_line_movement]
```

## What to do next

| Want | Skill |
|------|-------|
| Remove margin and score closing lines | `odds-market-analysis` |
| Compare our probability with the market's | `market-vs-model` |
| Full game context | `nhl-game-preview` |
| The whole slate | `nhl-daily-slate` |

## Credits

- Sequences (last 5, recent form, a run of results) are quoted in the order the tool returns them, with dates; never retell them from memory. Lists in the answer must match the tool rows.
- Out of credits: if a call is refused for credits, pass on the API's message as it comes (it says when free credits refill and how to add more), and stop; don't retry or switch tools to get around it.
