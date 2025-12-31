# Data and Decisions Core

## What This Enables

**Decisions it helps make:**
- When to trust data vs. when to trust judgment
- How much data is "enough" before acting
- Which metrics actually matter for your business
- When to stop gathering information and commit

**Mistakes it prevents:**
- Analysis paralysis — waiting for perfect data that never comes
- Data theater — collecting metrics that look good but drive nothing
- Spurious confidence — treating noisy signals as ground truth
- Metric fixation — optimizing the number instead of the outcome

**Outputs it enables:**
- A decision-making framework calibrated to your context
- Clear criteria for when data should override intuition (and vice versa)
- Metrics that connect to actual business outcomes

---

## The Core Problem

Most operators either over-rely on data (paralysis) or under-rely on it (gut-driven chaos). Neither extreme works.

The goal is **calibrated decision-making**: knowing when you have enough signal to act, and when you're just stalling.

---

## The Decision-Data Spectrum

Every decision sits somewhere on this spectrum:

```
REVERSIBLE                                              IRREVERSIBLE
Low stakes                                              High stakes
Fast feedback                                           Slow feedback
├──────────────────────────────────────────────────────────────────┤
Act fast, learn later              ←→              Analyze deeply first
```

**Two-way door decisions** (reversible): Bias toward action. You'll learn more from doing than from analyzing.

**One-way door decisions** (irreversible): Invest in analysis. The cost of being wrong exceeds the cost of delay.

### Failure Mode: Treating Everything as One-Way

Most decisions are two-way doors disguised as one-way doors. Teams get stuck because they treat reversible choices as permanent.

**Test:** Can we undo or adjust this within 30 days at reasonable cost? If yes, stop analyzing and ship.

---

## What Counts as "Enough" Data

There's no universal answer. But there's a framework:

### The Value of Information Test

Before gathering more data, ask:
1. **Would different data change my decision?** If no, stop. You already know what to do.
2. **Can I get this data in a reasonable timeframe?** If it takes 6 months, you're not gathering data — you're avoiding a decision.
3. **Is the cost of waiting higher than the cost of being wrong?** Factor in opportunity cost, not just direct cost.

### The 70% Rule

If you have ~70% of the information you wish you had, and the decision is reversible, act. You'll learn the remaining 30% faster by doing than by researching.

**Exception:** Regulatory, legal, or safety decisions. These require higher confidence thresholds.

---

## Metrics That Matter vs. Vanity Metrics

A useful metric has three properties:

1. **Actionable** — You can change it through decisions you control
2. **Connected** — It correlates with outcomes you care about (revenue, retention, cost)
3. **Timely** — It moves fast enough to give you feedback

### The Vanity Metric Test

Ask: "If this metric improved 50%, would the business meaningfully improve?"

- **Page views:** Probably not (unless you're ad-supported)
- **Active users:** Depends — are they paying? Retained? Converting?
- **Revenue per user:** Almost always yes
- **Time to resolution (support):** Usually yes, if it drives retention

### Failure Mode: Optimizing Proxies Until They Break

Goodhart's Law: "When a measure becomes a target, it ceases to be a good measure."

If you incentivize call center reps on "calls handled per hour," they'll hang up faster — but customers won't be helped.

**Solution:** Use paired metrics. For every efficiency metric, pair it with a quality metric.
- Calls per hour + customer satisfaction score
- Deals closed + deal quality (churn rate of new customers)
- Features shipped + adoption rate

---

## When Data Should Lose to Judgment

Data is backward-looking. It tells you what happened, not what will happen. In these situations, weight judgment more heavily:

### 1. Novel Situations

If you're doing something unprecedented (new market, new product category, new business model), historical data doesn't apply. You're pattern-matching to a future that doesn't exist yet.

### 2. Small Sample Sizes

With fewer than 30 observations, any pattern you see is probably noise. Your intuition, informed by adjacent experience, may be more reliable.

### 3. Changing Environments

If the world has shifted (new competitor, regulatory change, macro shock), past data is from a different reality.

### 4. When the Data Is Gamed

If people know they're being measured, they'll optimize for the metric. The data becomes a reflection of gaming behavior, not underlying reality.

---

## Building a Data-Informed Culture (Without Data Worship)

### The Right Questions to Ask

When someone presents data:
- "What's the sample size?"
- "What's the confidence interval?"
- "What would have to be true for this to be wrong?"
- "What decisions does this actually change?"

### The Right Habits to Build

1. **Pre-commit to decisions.** Before running an analysis, write down: "If I see X, I'll do Y. If I see Z, I'll do W." This prevents post-hoc rationalization.

2. **Track your predictions.** Keep a log of decisions and what you expected. Review quarterly. This calibrates your judgment over time.

3. **Embrace expected value thinking.** Don't just ask "What's most likely?" Ask "What's the expected outcome across all scenarios?"

---

## The Operator's Data Stack

You don't need a data science team to be data-informed. You need:

1. **One source of truth for key metrics.** Everyone looks at the same numbers.
2. **Weekly review cadence.** Metrics reviewed too often create noise; too rarely and you miss signals.
3. **Clear ownership.** Every metric has one person accountable for understanding (not necessarily improving) it.
4. **Anomaly detection.** Know what "normal" looks like so you notice when things break.

---

## Summary: The Calibrated Operator

The goal is not to be "data-driven" or "gut-driven." It's to be **calibrated**:

- Know which decisions deserve deep analysis
- Know which decisions should move fast
- Use metrics that actually connect to outcomes
- Update beliefs when evidence warrants
- Act under uncertainty rather than waiting for certainty

Data is a tool for reducing uncertainty — not eliminating it. The best operators make good decisions with incomplete information, then learn and adjust.
