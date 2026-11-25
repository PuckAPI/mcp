# AI Sports Workflow: Prompt Patterns

> Level 3 reference file. Zero context cost until loaded. Contains 10-15 concrete example prompts per workflow pattern with expected outputs.

---

## Pattern 1: Exploratory Analysis

### Orient Phase

**Prompt:** "Pull the current NHL standings and flag any team whose goal differential is more than 5 goals off from their expected goal differential."

**Expected output:**
```
Team | GF | GA | GDiff | xGF | xGA | xGDiff | Gap
Buffalo Sabres | 152 | 148 | +4 | 138 | 154 | -16 | +20 (PDO-inflated)
Colorado Avalanche | 187 | 160 | +27 | 195 | 155 | +40 | -13 (underperforming xG)
```

**What it surfaces:** Teams whose results don't match their underlying play. Buffalo looks fine in actual goals; their xG says they're a below-average team getting lucky.

---

**Prompt:** "Show me the Sabres' CF%, xGF%, and PDO for each month this season."

**Expected output:**
```
Month    | CF%   | xGF%  | PDO
October  | 49.1% | 48.8% | 1.022
November | 47.3% | 46.9% | 1.009
December | 51.2% | 50.4% | 0.991
January  | 48.8% | 47.2% | 1.031
```

**What it surfaces:** Trend lines. Was December a real improvement or just one good month?

---

### Drill Phase

**Prompt:** "Split the Sabres' CF% into home vs. away and first half vs. second half of the season."

**Expected output:**
```
Split         | CF%   | xGF%  | Record
Home          | 51.4% | 50.1% | 18-12-4
Away          | 45.1% | 44.7% | 12-18-6
First half    | 49.8% | 48.2% | 16-14-4
Second half   | 46.9% | 46.1% | 14-16-6
```

**What it surfaces:** The gap between home and away performance is structural. Worth examining travel schedule or line matchup exposure.

---

**Prompt:** "Show me the Sabres' 5-game rolling CF% and flag any stretches below 44% or above 54%."

**What it surfaces:** Hot and cold streaks. Are they schedule-driven (soft opponent runs) or performance-driven?

---

### Surface Phase

**Prompt:** "Based on the Sabres data above, write a one-paragraph summary of what the numbers say about this team: no editorializing, just what the data shows."

**Expected output:**
```
The Sabres are a below-average possession team (CF% 48.1%, xGF% 47.3%) with a 
home/away split that suggests matchup or rink effects. Their PDO of 1.018 is 
above sustainable levels. If PDO regresses to 1.000, they project to give back 
approximately 4-6 goals of their current +4 goal differential, implying a slight 
negative true talent.
```

---

## Pattern 2: Hypothesis Testing

### Framing Prompts

**Prompt:** "I want to test whether teams on the second night of a back-to-back win at a lower rate than normal. Help me frame the hypothesis properly."

**Expected output:**
```
Hypothesis (precise): NHL home teams playing the second game of a back-to-back 
win at a statistically significantly lower rate than the league home win rate.

Null hypothesis: Back-to-back status has no effect on home win rate.

Groups:
  - Control: All home games (expected win rate: ~55%)
  - Treatment: Home games where home team is on back-to-back

Test: Two-proportion z-test (comparing win rates)
Minimum sample: ~200 back-to-back home games for 80% power at 5% effect size
```

---

**Prompt:** "I have 3 seasons of NHL game data. Design a test to see if teams with CF% above 52% win at a higher rate than teams below 48% CF%."

**Expected output:**
```
Design:
  Group A: Games where winning team had CF% > 52% in previous 20 games
  Group B: Games where winning team had CF% < 48% in previous 20 games

Issue to resolve first: CF% is correlated with quality of opposition. 
Filter to games where both teams had similar SOS (strength of schedule).

Test: Chi-squared test on W/L outcomes
Additional: Logistic regression to control for home/away and opponent CF%
```

---

### Execution Prompts

**Prompt:** "Pull all back-to-back games from the 2023-24 and 2024-25 NHL seasons where the home team was on a back-to-back. Show me the home team's win rate."

**Expected output:**
```
Back-to-back home games: 312
Home team wins: 156 (50.0%)
League-wide home win rate: 54.8%
Gap: -4.8 percentage points

Chi-squared test: p = 0.041
Effect: Small but statistically significant
Confound to check: Is the away team also on back-to-back? (often yes)
```

---

**Prompt:** "Out of those back-to-back games, how many had BOTH teams on a back-to-back? How did win rates differ between [home B2B only] vs [both on B2B]?"

**What it surfaces:** The confound. If 40% of those games had both teams on B2B, the effect is smaller than it looks.

---

### Interpretation Prompts

**Prompt:** "My chi-squared test returned p=0.041 with n=312 games. Should I act on this finding? What would falsify it?"

**Expected output:**
```
Verdict: Directionally interesting, not conclusive.

Issues:
1. p=0.041 is marginal. One bad month's data and it flips.
2. Effect size is 4.8pp on home win rate: small for modeling.
3. Not adjusted for: rest advantage (away team may also be on B2B), 
   game importance (playoff push teams push harder), goalie starts.

What would falsify it:
- Run on 2021-22 and 2022-23 seasons. If effect disappears, it's noise.
- Add B2B flag for away team. If effect shrinks to <2pp, it's largely explained by mutual fatigue.
- Check if it persists in playoffs (where B2B rest is rarer).
```

---

## Pattern 3: Model Iteration

### Diagnosis Prompts

**Prompt:** "My NHL win prediction model is at 58.3% accuracy on a walk-forward test. The training accuracy is 64.1%. What does this gap tell me?"

**Expected output:**
```
The 5.8pp gap between training (64.1%) and validation (58.3%) suggests mild overfitting.

Possible causes:
1. Too many features relative to sample size
2. One or more features are leaky (incorporate future information)
3. Model complexity too high for the signal in the data

Recommended actions (in order):
1. Check feature importance: remove bottom 20% of features
2. Check for leakage: any feature that uses same-game data?
3. Reduce model complexity (shallower tree depth, higher regularization)
4. Report validation accuracy at different time windows (early vs. late season)
```

---

**Prompt:** "Pull my model's worst 10 predictions from last month. Classify them by game type: back-to-back, divisional, playoff push, or regular."

**What it surfaces:** If 7 of 10 worst predictions are back-to-back games, you have a structural gap in your feature set.

---

### Feature Prompts

**Prompt:** "I want to add a 'rest advantage' feature to my NHL model. What's the right way to encode it to avoid leakage?"

**Expected output:**
```
Safe encoding (no leakage):
  rest_days_home = days since last game for home team (as of game date)
  rest_days_away = days since last game for away team (as of game date)
  rest_advantage = rest_days_home - rest_days_away

Common leakage mistake:
  Do NOT include same-game rest in training if you're predicting pre-game.
  Use only pre-game knowledge: last game date from schedule, not from results.

Additional features worth testing:
  is_home_b2b = 1 if rest_days_home == 1
  is_away_b2b = 1 if rest_days_away == 1
  mutual_b2b  = 1 if both teams on back-to-back
```

---

**Prompt:** "My model accuracy went from 58.3% to 59.1% after adding the rest advantage feature. Is this improvement real?"

**Expected output:**
```
0.8pp improvement across ~500 games: marginal.

Statistical significance check:
  z-test on proportions: n=500, p1=0.583, p2=0.591
  z = 0.8pp / SE ≈ 0.36
  p ≈ 0.72: not significant

Recommendation: Don't count it as a win yet. Run on a held-out third season 
(not the same walk-forward window) to confirm. If it holds, keep it. 
If it disappears, remove it.
```

---

### Calibration Prompts

**Prompt:** "Show me my model's calibration: for predictions in each 10% probability bucket (50-60%, 60-70%, etc.), what was the actual win rate?"

**Expected output:**
```
Predicted | Actual  | Games | Gap
50-60%    | 54.2%   | 280   | +4.2pp (underconfident)
60-70%    | 61.8%   | 143   | -3.2pp (slightly overconfident)
70-80%    | 68.9%   | 54    | -6.1pp (overconfident)
80%+      | 71.2%   | 12    | -8.8pp (very overconfident)

Summary: Model is well-calibrated in the 50-70% range. 
Overestimates confidence above 70%. Apply isotonic regression to the high end.
```

---

## Pattern 4: Report Generation

### Performance Summary

**Prompt:** "Generate a monthly performance report for my NHL model. This month it called 65 games and got 36 right. Use the tools to pull the results and the market probabilities."

**Expected output:**
```
Model Performance Report: April 2026
---------------------------------
Games scored: 65 | Accuracy: 55.4% (95% interval 43-67%) | Brier: 0.249
Sources: results from get_games, market fair probability from get_game_probabilities

Model vs market (information only):
  Mean gap between our probability and the market fair probability: 2.1pp
  Closing-line comparison: our probability vs closing fair probability, mean difference 1.4pp

Trend:
  First 2 weeks: 20-12-1 (62.5%), may be running hot
  Last 2 weeks:  14-16-2 (46.7%), regression or market adjustment

Diagnosis:
  65 games is a small sample and the interval is wide. The strong start
  inflated the monthly number. Not enough data to call the model better
  than the market from one month; add more seasons before concluding.
```

---

**Prompt:** "Compare my model's accuracy for home favorites vs. away underdogs vs. home underdogs over the season."

**What it surfaces:** Systematic bias. Models often perform differently by game type. If home favorites are at 65% accuracy and away underdogs are at 48%, you are not evaluating one uniform model. Report the sample size for each group.

---

**Prompt:** "Show me the 5 games where my model's probability was furthest from the result. What went wrong?"

**Expected output format:**
```
Miss #1: BUF vs OTT (model: 52%, market fair: 40%): Lost
  What happened: starter pulled after 2 goals, backup struggled
  Flag: goalie change not known pre-game, expected miss

Miss #2: TOR vs BOS (model: 63%, market fair: 57%): Lost
  What happened: late goal against the run of play, PK breakdown
  Flag: small sample variance, no structural issue

Pattern: 3 of 5 biggest misses involved goalie changes.
Action: Add starting goalie confirmation as a pre-game input.
```

---

### Season Wrap

**Prompt:** "Generate a season-end performance digest. Metrics to include: games scored, accuracy with interval, best month, worst month, calibration summary, and how the gap to the market probability changed over the season."

**What it triggers:** Full `backtesting` skill review + `visualization` for trend charts. Use this as the anchor prompt for an end-of-season audit session.
