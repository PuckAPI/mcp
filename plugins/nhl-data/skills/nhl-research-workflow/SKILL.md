---
name: nhl-research-workflow
description: "Use when the user asks how to analyze hockey data with Claude, how to structure an analysis session, how to test a hunch about a team or player, how to improve a model that is stuck, or how to write up model performance. Teaches four patterns: exploration, hypothesis tests, model iteration and performance reports, on the PuckAPI MCP server. Not for one specific lookup (call get_games, get_schedule or the other tools directly). Not for the mechanics of building features or models (use feature-engineering or model-building)."
metadata:
  version: 2.1.0
  author: SportsDataHQ
---

# AI Sports Workflow

> **Data:** the PuckAPI MCP server (`nhl-puckapi-tools`).
> This skill does not query data directly: it teaches you how to structure queries across skills. Credit costs depend on which skills you invoke: `list_teams` costs 1 credit; `get_schedule`, `search_players` and `get_standings` cost 2; `get_games`, `get_team_stats`, `get_player_stats`, `get_goalie_stats` and `get_game_probabilities` cost 5; `get_game_detail`, `get_head_to_head`, `get_odds`, `get_plays` and `get_shot_map` cost 10; `get_line_movement` and `get_prop_backtest` cost 25.
> For concrete example prompts, see `prompt-patterns.md` in this directory.

You are an expert in AI-native sports analysis workflows. Your goal is to teach users how to structure their work with Claude and MCP tools so they get answers faster, find patterns they'd miss manually, and build systems instead of one-off queries.

## When to Use

- "How should I structure my analysis of [team/player/question]?"
- "I think [hypothesis]: how do I test it?"
- "My model is at 58% accuracy: what should I try next?"
- "Generate a summary of my model's performance this month"
- "What's the best way to explore this dataset with Claude?"
- "How do I use Claude to find patterns in game data?"

## When NOT to Use

- Looking up a specific game, score, or schedule: call `get_games` or `get_schedule`
- A single plain-English question about the data: call the tools directly
- Building model features step by step: see `feature-engineering`
- Training and evaluating a model: see `model-building`
- Backtesting a model: see `backtesting`

## Commands Available

No direct data commands. This skill orchestrates other skills and teaches workflow patterns.

| Pattern | Skills Invoked | Typical Credits |
|---------|---------------|----------------|
| Exploratory analysis | `get_games`, `get_standings`, `nhl-player-scouting` | 3-10 |
| Hypothesis test | `get_standings`, `get_games`, compute in session | 5-15 |
| Model iteration | `feature-engineering`, `model-building`, `walk-forward-validation` | 5-20 |
| Report generation | `prediction-tracker`, `backtesting`, `visualization` | 5-25 |

## The Four Workflow Patterns

---

### Pattern 1: Exploratory Analysis

**Trigger:** "What should I look at?" / "Tell me about [team/player/matchup]" / "I have this dataset: what's interesting?"

**The wrong approach:** Pulling everything and hoping something stands out. Wastes credits and produces noise.

**The right approach:** Structured data exploration in three phases.

**Phase 1: Orient (1-2 minutes)**
1. Start with the broadest context question: current standings, recent record, season-level stats
2. Identify the most anomalous number in what you see (PDO outlier, Corsi gap, goal differential vs xG gap)
3. Form one candidate explanation

**Phase 2: Drill (3-5 minutes)**
1. Pull the metric that explains the anomaly (if Corsi is low, pull zone starts; if PDO is high, pull shooting% and SV%)
2. Compare to historical baseline (this season vs. last, home vs. away, last 10 vs. full season)
3. Narrow to the most interesting finding

**Phase 3: Surface**
1. State the finding in one sentence
2. Name what data would confirm or deny it
3. Decide: enough to act on, or worth more investigation?

**Prompt sequence to follow:**
```
Step 1: "Pull [team] season stats and standings"
Step 2: "What's their PDO and CF% vs. league average?"
Step 3: "Show me their last 20 games split home/away"
Step 4: "What changed after [date/trade/injury]?"
```

---

### Pattern 2: Hypothesis Testing

**Trigger:** "I think X causes Y" / "Does [factor] matter for [outcome]?" / "I believe home ice matters less in back-to-backs"

**Steps:**

1. **State the hypothesis precisely.** Not "home teams win more" but "home teams in the second game of a back-to-back win at a rate significantly below the league home win rate."

2. **Select the right statistical test.**

| Question Type | Test | When |
|-------------|------|------|
| Do two groups differ on average? | t-test | Comparing means (goals, xG, CF%) |
| Is there a relationship between two variables? | Correlation / regression | Corsi vs. wins, PDO vs. goal differential |
| Does a factor change an outcome rate? | Chi-squared | Win rate in back-to-backs vs. normal games |
| Does adding a feature improve the model? | Cross-validated AUC comparison | Feature selection |

3. **Collect the data.** Pull both samples via `nhl-puckapi-tools`. Define the comparison groups cleanly before looking at results.

4. **Interpret the result honestly.**
   - p < 0.05 is necessary but not sufficient. Effect size matters.
   - Sample size: 50 games at 55% win rate is NOT statistically significant.
   - Name confounds before drawing conclusions: schedule difficulty, injuries, goalie changes.

5. **Flag follow-up questions.** A confirmed hypothesis raises three new ones. Write them down.

**Minimum sample sizes for hockey hypothesis tests:**

| Claim | Minimum Games |
|-------|--------------|
| Win rate difference is real (5% gap) | ~200 games per group |
| CF% difference is real | ~50 games |
| xGF% difference is real | ~35 games |
| Individual player scoring rate | ~200 minutes TOI |

6. **Suggest follow-ups.** A good hypothesis test opens the next question. Name it explicitly.

---

### Pattern 3: Model Iteration

**Trigger:** "My model is at [X]% accuracy, how do I improve it?" / "What should I try next?"

**Systematic improvement workflow:**

**Step 1: Diagnose before adding features**
Ask these in order:
- Is the evaluation methodology correct? (See `walk-forward-validation`: k-fold on time series inflates by 5-15%)
- Is the model underfitting or overfitting? (Training accuracy vs. validation accuracy gap)
- What is the calibration? (Is 60% confidence actually right 60% of the time?)

**Step 2: Identify the failure mode**
Pull the worst 20% of predictions. What do they have in common?
- Games the model missed badly → usually schedule spots, back-to-backs, altitude, travel
- Systematic directional bias → model is overweighting one feature
- Random noise → sample size problem, not a modeling problem

**Step 3: Prioritize improvement actions**

| Problem | Action | Skill |
|---------|--------|-------|
| Evaluation inflated | Switch to walk-forward | `walk-forward-validation` |
| Wrong features | Re-examine feature importance | `feature-engineering` |
| Overfit | Reduce model complexity, add regularization | `model-building` |
| Underfit | Add features, increase model capacity | `feature-engineering` |
| Miscalibrated | Apply Platt scaling or isotonic regression | `probability-calibration` |
| Model only mirrors the market | Check how our probability differs from the market's | `market-vs-model` |

**Step 4: Test one change at a time**
Never add three features and change the model simultaneously. You can't isolate what worked.

**Step 5: Set the bar**
Define what "better" means before testing: higher AUC, higher accuracy, better calibration, or a smaller gap between predicted and observed rates? They rarely move together.

---

### Pattern 4: Report Generation

**Trigger:** "Summarize my model's performance this month" / "Write up how my model has done" / "How accurate has it been?"

**Standard report structure:**

```
Model Performance Report: [Period]
---------------------------------
Games scored: N | Accuracy: X% (interval X-Y%) | Log loss: X | Brier: X

Calibration:
  [Probability bucket] | Predicted: X% | Observed: X% | Games: N

Model vs market (information only):
  Mean gap between our probability and the market fair probability: X pp
  Closing-line comparison: our probability vs the closing fair probability, mean difference X pp

Largest misses:
  [Game] | Model: X% | Market: X% | Result: W/L | Likely cause

By season / by month:
  [Season] | Games: N | Brier: X

Diagnosis:
  [One sentence on what the data says about model quality]
```

**Rules for honest reporting:**
- Never report an accuracy or a rate without the sample size and an interval
- Break results out by season so one good year cannot hide a bad one
- Treat closing-line comparison as a measure of model quality, not as a signal to wager
- Flag variance: 10-game samples are noise, not signal
- Note if the model's gap to the market is shrinking over time

## Rules for numbers

- Call the tools rather than answering from memory; every game, rate and price comes from a tool call.
- Cite which tool call produced each number.
- State the sample size and the season convention (`20252026` = 2025-26) with every figure.
- If the data is not there or the sample is too small, say "not enough data" instead of guessing.

## Anti-patterns

| Rationalization | Why It's Wrong | Do This Instead |
|----------------|---------------|-----------------|
| "I'll explore freely and see what stands out" | Leads to confirmation bias: you'll find what you're looking for | Structure exploration with a specific anomaly target |
| "My model improved, so my new feature must have helped" | Coincidence or overfitting | A/B test features with consistent walk-forward evaluation |
| "p = 0.049, so the hypothesis is confirmed" | p-value alone is insufficient; effect size and sample size matter | Report effect size and confidence interval alongside p-value |
| "I'll add more features to improve accuracy" | Overfitting risk; diminishing returns after ~10-15 features | Audit existing features first; remove low-importance ones before adding |
| "The report looks good so the model is good" | Reports can hide systematic bias | Check calibration curves and the largest misses |

## What to Do Next

| What You Found | Next Action | Skill |
|----------------|-------------|-------|
| Found an interesting pattern worth modeling | Engineer it as a feature | `feature-engineering` |
| Need specific data to test your hypothesis | Pull the rows with the tool calls | `get_games`, `get_team_stats` |
| Ready to build or improve a model | Start the model build process | `model-building` |
| Need to validate evaluation methodology | Walk-forward setup | `walk-forward-validation` |
| Want example prompts for each pattern | Load detailed prompt examples | `prompt-patterns.md` (this directory) |
| Want a structured slate summary | Run the daily slate workflow | `nhl-daily-slate` |

## Credits

- Sequences (last 5, recent form, a run of results) are quoted in the order the tool returns them, with dates; never retell them from memory. Lists in the answer must match the tool rows.
- Out of credits: if a call is refused for credits, pass on the API's message as it comes (it says when free credits refill and how to add more), and stop; don't retry or switch tools to get around it.
