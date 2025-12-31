# Experimentation and Causal Inference

## What This Enables

**Decisions it helps make:**
- Does this change actually cause the outcome I want?
- Should I roll out this feature/campaign/process to everyone?
- Which version is actually better (not just different)?
- Where should I invest based on proven impact?

**Mistakes it prevents:**
- Shipping changes that hurt performance but looked good in biased analysis
- Attributing results to actions when luck or timing was the cause
- Making permanent changes based on temporary or spurious effects
- Wasting resources on initiatives that don't actually work

**Outputs it enables:**
- Causal evidence for what works (not just correlational hunches)
- Quantified lift from changes you've made
- Confidence to scale what's proven

---

## Why Experiments Beat Observation

Observational data (looking at what happened) is biased by selection:
- Users who engaged with a feature might differ from those who didn't
- Customers who bought after a campaign might have bought anyway
- Regions that adopted a process may have been higher-performing to begin with

**Experiments** (randomized controlled trials) remove this bias by making the only difference between groups the thing you're testing.

---

## The Anatomy of a Good Experiment

### 1. Clear Hypothesis

State what you expect and why:
- "Showing social proof will increase sign-up conversion because it reduces perceived risk"
- Not: "Let's see what happens if we change the button color"

A hypothesis forces you to think about mechanism, which helps you interpret results and generalize learnings.

### 2. Randomization

Randomly assign subjects to treatment and control. This ensures any difference in outcomes is caused by your intervention, not pre-existing differences.

**Critical:** Randomize at the right level.
- If you're testing a product change, randomize users
- If you're testing a sales script, randomize leads
- If you're testing a store layout, randomize stores

### 3. Sample Size Calculation

Before you start, determine how many observations you need to detect the effect you care about.

**Inputs:**
- Baseline rate (what's the current conversion/metric?)
- Minimum detectable effect (what's the smallest improvement that would matter?)
- Statistical power (usually 80%)
- Significance level (usually 5%)

**Rule of thumb:** To detect a 10% relative improvement with reasonable confidence, you typically need several hundred observations per group. To detect a 2% improvement, you need thousands.

### 4. Pre-Registration

Before running the experiment, document:
- Primary metric (the one that decides success/failure)
- Secondary metrics (interesting but not decisive)
- Analysis plan (how you'll calculate the effect)
- Stopping rules (when you'll end the experiment)

This prevents p-hacking — the temptation to slice data until you find something "significant."

### 5. Sufficient Duration

Run experiments long enough to capture:
- Weekly cycles (behavior differs by day of week)
- Novelty effects (new things get attention that fades)
- Full conversion windows (if purchase decisions take 2 weeks, run for at least 2 weeks)

**Failure Mode:** Stopping early when results look good. This dramatically inflates false positive rates.

---

## Common Experiment Types

### A/B Test

Compare two versions: the current (control) vs. a variation (treatment).

**Best for:** Single changes where you want clean measurement.

### Multivariate Test

Test multiple changes simultaneously to understand interactions.

**Best for:** When you have many changes and enough traffic to test combinations.

**Warning:** Requires much larger sample sizes. With 4 variants, you need 4x the sample.

### Holdout Test

Launch a change to everyone except a small percentage (the holdout), then compare outcomes over time.

**Best for:** Measuring long-term impact of already-shipped features.

### Switchback Test

Alternate between treatment and control over time (e.g., hour by hour, day by day).

**Best for:** Marketplace experiments where randomizing users would cause inconsistent experiences.

---

## Interpreting Results

### Statistical Significance

A result is "statistically significant" if the observed difference is unlikely to have occurred by chance (typically p < 0.05).

**What it means:** If there were no real difference, you'd see a result this extreme less than 5% of the time.

**What it doesn't mean:** The result is necessarily meaningful, large, or replicable.

### Practical Significance

Even if a result is statistically significant, it may not matter for the business.

**Example:** A 0.5% increase in conversion is statistically significant with large sample sizes. But if it takes 3 months of eng work to implement, is it worth it?

Always ask: "Is this effect large enough to justify the investment to capture it?"

### Confidence Intervals

Report intervals, not just point estimates:
- "Conversion increased by 8% (95% CI: 3% to 13%)" tells you the range of plausible true effects
- The interval's width tells you about precision
- If the interval includes zero, the effect isn't significant

---

## Failure Modes and How to Avoid Them

### 1. Peeking and Early Stopping

**Problem:** Checking results daily and stopping when p < 0.05.

**Why it's bad:** If you check repeatedly, you'll eventually find a significant result by chance. This inflates false positive rates from 5% to 30% or more.

**Solution:** Pre-commit to a sample size or duration. Use sequential testing methods if you must peek.

### 2. Multiple Comparisons

**Problem:** Testing 20 metrics and celebrating the one that hit p < 0.05.

**Why it's bad:** With 20 tests at α = 0.05, you expect 1 false positive on average.

**Solution:** Designate one primary metric. Apply corrections (Bonferroni, FDR) for secondary metrics.

### 3. Segment Fishing

**Problem:** Results are null overall, so you slice by segment until you find one where it works.

**Why it's bad:** With enough slices, you'll always find something. These results usually don't replicate.

**Solution:** Pre-specify segments of interest. Treat segment findings as hypotheses for future experiments.

### 4. Survivorship Bias

**Problem:** Only measuring outcomes for users who completed a flow, ignoring those who dropped.

**Why it's bad:** Treatment might cause more dropouts, but look better among survivors.

**Solution:** Use intent-to-treat analysis. Measure everyone randomized, regardless of whether they "completed" the experience.

### 5. Network Effects and Interference

**Problem:** Randomizing users in a social product where treatment users affect control users.

**Why it's bad:** The treatment effect bleeds into control, biasing your estimate.

**Solution:** Randomize at the cluster level (e.g., by geography, by friend group) or use specialized methods.

---

## When You Can't Experiment

Sometimes randomized experiments aren't feasible:
- Ethical constraints
- Small sample sizes
- Operational constraints (can't show different prices to different customers)
- The event already happened

### Quasi-Experimental Methods

**Difference-in-Differences:** Compare the change in outcomes before/after an intervention between affected and unaffected groups.

**Regression Discontinuity:** If treatment is assigned by a threshold (e.g., users with >$100 spend get premium support), compare outcomes just above and below the threshold.

**Instrumental Variables:** Use a variable that affects treatment assignment but doesn't directly affect outcomes.

**Propensity Score Matching:** Match treated and control observations on observable characteristics, then compare outcomes.

### The Hierarchy of Evidence

From strongest to weakest:
1. Randomized controlled experiment
2. Quasi-experiment with strong design
3. Observational analysis with controls
4. Simple before/after comparison
5. Cross-sectional correlation
6. Anecdote

The further down this list, the more skeptical you should be about causal claims.

---

## Building an Experimentation Culture

### 1. Make It Easy

If running an experiment requires a data science PhD, teams won't do it. Invest in infrastructure that makes experimentation accessible.

### 2. Embrace Negative Results

Most experiments fail to show an effect. This is valuable information — it tells you what doesn't work and prevents wasted effort.

Celebrate learning, not just wins.

### 3. Document Everything

Create a repository of past experiments — what was tested, what was learned, what surprised you. This prevents repeated mistakes and builds institutional knowledge.

### 4. Iterate

Experiments rarely give definitive answers on the first try. Plan for iteration:
- "If this works, what do we test next?"
- "If this fails, what's our fallback hypothesis?"

---

## Summary: The Experimentation Mindset

The goal is to replace "I think this works" with "I know this works because I tested it."

Key principles:
- Randomization is the gold standard for causal claims
- Pre-register your hypothesis and analysis plan
- Run experiments long enough with large enough samples
- Report confidence intervals, not just point estimates
- Be skeptical of your own results — false positives are common
- When you can't experiment, use the strongest quasi-experimental method available
- Build a culture that values learning from experiments, including nulls
