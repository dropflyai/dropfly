# Probability and Statistics for Operators

## What This Enables

**Decisions it helps make:**
- Is this result real or just noise?
- How confident should I be in this trend?
- When do I have enough data to act?
- What's the real risk in this decision?

**Mistakes it prevents:**
- Chasing random fluctuations as if they're signals
- Overconfidence from small samples
- Underweighting rare but catastrophic risks
- Ignoring base rates when evaluating opportunities

**Outputs it enables:**
- Proper interpretation of business metrics
- Calibrated confidence in forecasts
- Risk-adjusted decision-making

---

## The Operator's Statistical Toolkit

You don't need to remember formulas. You need to internalize patterns of thinking.

---

## Sample Size: The Most Important Concept

### The Core Problem

Small samples lie. A 3-person pilot that converts at 66% tells you almost nothing. A 300-person test converting at 66% tells you a lot.

### Rules of Thumb

| Sample Size | What You Can Conclude |
|-------------|----------------------|
| n < 30 | Basically nothing — noise dominates |
| n = 30-100 | Directional signal, wide uncertainty |
| n = 100-500 | Reasonable confidence for large effects |
| n = 500+ | Can detect moderate effects reliably |
| n = 1000+ | Can detect small effects |

### The Practical Test

Before trusting a number, ask: "If I ran this again with different people, would I expect roughly the same result?"

If your gut says "probably not," your sample is too small.

### Failure Mode: The Anecdote Trap

Three customers complained about the new feature → "Users hate it"
Two enterprise deals closed this week → "We've found product-market fit"

Anecdotes are not data. They're hypotheses to test.

---

## Variance and Distributions: Understanding Spread

### Why It Matters

Knowing the average isn't enough. You need to know the spread.

**Example:** Two sales reps both average $100K/month in revenue.
- Rep A: Consistently $90K-$110K every month
- Rep B: Swings between $20K and $180K

Same average, very different profiles. Rep B is higher risk — great in good months, disastrous in bad ones.

### The 80/20 Distribution (Power Laws)

In many business contexts, outcomes don't follow normal distributions. They follow power laws:
- 20% of customers drive 80% of revenue
- 20% of bugs cause 80% of crashes
- 20% of features drive 80% of usage

**Implication:** Averages are misleading. The median customer is not the average customer. Focus on the segments that matter.

### Failure Mode: Assuming Normal When It's Not

If your top 10% of customers generate 60% of revenue, "average revenue per customer" is a meaningless number. You have two different businesses — whales and minnows — and they need different strategies.

---

## Base Rates: The Most Underused Concept

### What Are Base Rates?

The base rate is how often something happens in general, before you know anything specific about a particular case.

**Example:** A VC tells you they invest in "about 1% of the companies they meet."

If you pitch them, your prior probability of getting funded is ~1%, not 50%. Any positive signal you get (they seemed interested!) should be updated from that 1% baseline, not from an imagined 50%.

### The Base Rate Fallacy

People consistently ignore base rates and overweight specific information.

**Example:** You meet a brilliant technical founder with a great pitch. What's the probability of success?

Wrong thinking: "They seem amazing → probably 70% chance of success"
Right thinking: "Startups fail 90% of the time. Even great teams fail 70% of the time. → Adjust upward somewhat from base rate, maybe 40%"

### Failure Mode: Ignoring Industry Benchmarks

Before celebrating your 8% email open rate, know that industry average is 15%. Before panicking at 40% annual churn, know that some categories run 50%+ structurally.

Base rates tell you whether you're outperforming or underperforming — not whether your absolute number is "good."

---

## Confidence Intervals: Quantifying Uncertainty

### The Core Idea

A point estimate ("conversion rate is 5%") hides uncertainty. A confidence interval reveals it ("conversion rate is 5% ± 2%").

### Practical Interpretation

A 95% confidence interval means: "If we ran this test many times, 95% of the intervals we'd calculate would contain the true value."

For operators, translate this as: "The real number is probably somewhere in this range, but could be outside it."

### When Intervals Overlap

If you're comparing two options and their confidence intervals overlap substantially, you don't have a statistically significant difference. The observed gap could be noise.

**Example:**
- Option A: 8% conversion (95% CI: 6%-10%)
- Option B: 9% conversion (95% CI: 7%-11%)

These overlap. You can't confidently say B is better than A.

### Failure Mode: Reporting Point Estimates Without Uncertainty

"Our NPS improved from 32 to 38" sounds like progress. But if the margin of error is ±10, you've learned nothing.

---

## Correlation vs. Causation: The Critical Distinction

### The Problem

Two things moving together doesn't mean one causes the other.

**Example:** Companies that do more customer research have higher retention. Does research cause retention? Or do successful companies have more resources for research?

### Common Confounders

1. **Reverse causation:** Success causes the behavior you're measuring, not the other way around
2. **Third variable:** Something else causes both
3. **Selection bias:** The groups you're comparing were different to begin with

### The Operator's Test

Before assuming causation, ask:
1. Is there a plausible mechanism?
2. Does the effect make sense in magnitude?
3. What else could explain this relationship?
4. Can I run an experiment to test it?

If you can't run an experiment, be humble about causal claims.

---

## Expected Value: The Decision-Making Lens

### The Core Formula

Expected Value = Σ (Probability of outcome × Value of outcome)

### Why It Matters

It's not about what's most likely — it's about the probability-weighted average of all outcomes.

**Example:** A product launch with:
- 60% chance of moderate success (+$500K)
- 30% chance of failure (-$200K)
- 10% chance of breakthrough (+$2M)

EV = (0.6 × $500K) + (0.3 × -$200K) + (0.1 × $2M) = $300K - $60K + $200K = $440K

The most likely outcome (+$500K moderate success) isn't the expected value ($440K).

### Failure Mode: Ignoring Low-Probability, High-Impact Events

A 5% chance of losing $10M matters. A 1% chance of bankruptcy matters. Don't dismiss tail risks just because they're unlikely.

### Failure Mode: Risk Aversion on Small Bets

If you're making many small decisions, optimize for expected value, not for avoiding losses. You'll lose some, but the math works out over many bets.

---

## Regression to the Mean: Why Hot Streaks End

### The Concept

Extreme results tend to be followed by more average results.

**Example:** Your best salesperson has an incredible Q1. Statistically, Q2 will likely be less impressive — not because they got worse, but because some of Q1's performance was luck.

### Why It Matters for Operators

1. **Don't overreact to outliers.** One amazing month doesn't mean you've figured it out. One terrible month doesn't mean everything is broken.

2. **Evaluate fairly.** If you hired someone after an amazing interview, they may seem to "decline" — they're just returning to their baseline.

3. **Avoid intervention bias.** If you "fix" something after an extreme result, it would've improved anyway. You might think your fix worked when it was just regression.

### The Test

Ask: "Was this result extreme relative to what I'd expect on average?"

If yes, expect some regression regardless of what you do.

---

## Practical Applications

### Reading a Dashboard

When you see a number move:
1. What's the sample size?
2. What's the typical variance?
3. Is this outside the normal range?
4. Would I bet money this is a real change?

### Evaluating a Proposal

When someone claims "X causes Y":
1. What's the sample size behind this claim?
2. Could there be confounders?
3. What's the base rate for this type of success?
4. What's the expected value, not just the best case?

### Making Forecasts

When predicting the future:
1. Start from base rates
2. Adjust based on specific information
3. Express uncertainty as a range, not a point
4. Track your predictions to calibrate over time

---

## Summary: The Statistical Mindset

Think probabilistically, not deterministically. The world is uncertain, and your job is to make good decisions under uncertainty.

Key habits:
- Always ask about sample size
- Never trust a single number — demand ranges
- Start from base rates and update
- Distinguish correlation from causation
- Calculate expected value, not just most likely outcome
- Expect extreme results to regress

You don't need to compute statistics yourself. You need to ask the right questions and think in probabilities.
