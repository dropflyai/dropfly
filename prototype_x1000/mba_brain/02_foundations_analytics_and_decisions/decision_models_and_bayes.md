# Decision Models and Bayesian Thinking

## What This Enables

**Decisions it helps make:**
- How should I update my beliefs based on new information?
- What's the right framework for this type of decision?
- How do I think clearly when the stakes are high?
- When should I change my mind?

**Mistakes it prevents:**
- Anchoring too strongly on initial beliefs
- Overreacting to single data points
- Using the wrong framework for the problem type
- Ignoring prior information when evaluating evidence

**Outputs it enables:**
- Calibrated beliefs that update appropriately with evidence
- Clear decision frameworks matched to problem types
- Systematic approach to high-stakes decisions
- Rational basis for changing course

---

## The Core of Bayesian Thinking

Bayesian thinking is about updating beliefs rationally. You start with what you believed before (the prior), observe evidence, and end with a new belief (the posterior).

**The simplified formula:**

```
Updated Belief = Prior Belief × (How likely is this evidence if belief is true?)
                              ÷ (How likely is this evidence regardless?)
```

You don't need to calculate this mathematically. You need to internalize the logic.

---

## Priors: What You Believed Before

Every situation has a base rate — how often something is true in general.

**Example:** An investor says they're "very interested" after a pitch.

Before the meeting, what was your probability of getting funding?
- If this is a top-tier VC and you're a first-time founder: ~1-2%
- If this is an angel who invests in 30% of pitches: ~30%

This is your prior. All evidence updates from here.

### Failure Mode: Ignoring the Prior

"They said they loved it, so we're probably getting funded!"

No. You started at 2%. "Loved it" might update you to 5-10%. Still unlikely.

### Failure Mode: Overly Strong Priors

"Startups in our space always fail, so we'll fail too."

Priors should be informed by base rates, but you should update when you have strong evidence that you're different.

---

## Updating on Evidence

When you observe something, ask:

1. **How likely would this evidence be if my belief is true?** (Likelihood)
2. **How likely would this evidence be if my belief is false?** (False positive rate)

**Example:** You're testing whether a marketing channel works.

- Prior belief: 20% chance this channel will be profitable
- Evidence: First campaign shows 3x ROI

How surprising is 3x ROI if the channel is genuinely good? Pretty likely — maybe 60%.
How surprising is 3x ROI if the channel is actually bad (and this is noise)? Possible but less likely — maybe 10%.

Update: Your belief should increase significantly. Maybe from 20% to 60%.

### The Strength of Evidence

Strong evidence is evidence that would be **very unlikely** if your belief is wrong.

- "Customer said they'd buy" → Weak (customers say lots of things)
- "Customer signed a contract and paid" → Strong (unlikely if they don't want it)
- "One good month of sales" → Weak (could be noise)
- "Twelve consecutive months of growth" → Strong (hard to explain as noise)

### Failure Mode: Updating Too Much on Weak Evidence

A single positive signal shouldn't swing you from 20% to 80%. It should nudge you. Save the big updates for strong evidence.

### Failure Mode: Updating Too Little on Strong Evidence

If you see evidence that would be nearly impossible if your belief were wrong, update dramatically. Don't cling to priors in the face of overwhelming data.

---

## Decision Frameworks by Problem Type

Different decisions require different frameworks.

### Type 1: Reversible Decisions Under Uncertainty

**Characteristics:** Can be undone, feedback comes quickly, stakes are moderate.

**Framework:** Expected value + bias to action.

Calculate expected value if possible. If positive or uncertain-but-learnable, act. You'll learn more from doing than from analyzing.

**Examples:** Hiring a contractor, testing a marketing channel, shipping a feature.

### Type 2: Irreversible Decisions Under Uncertainty

**Characteristics:** Hard to undo, consequences are permanent, stakes are high.

**Framework:** Scenario analysis + regret minimization.

Don't just optimize for expected value. Consider:
- What's the worst realistic outcome?
- Can I live with that outcome?
- What would I regret more: acting or not acting?

**Examples:** Taking on major debt, signing exclusive partnerships, entering regulated markets.

### Type 3: Decisions with Clear Tradeoffs

**Characteristics:** Multiple options with known pros/cons, no dominant choice.

**Framework:** Weighted criteria or explicit tradeoff analysis.

List what matters. Weight by importance. Score options. But don't let the math override obvious qualitative factors.

**Examples:** Choosing between vendors, selecting office space, prioritizing features.

### Type 4: Decisions Under Ignorance

**Characteristics:** You don't know the probabilities and can't estimate them.

**Framework:** Maximin (minimize maximum regret) or robustness.

If you can't estimate probabilities, focus on:
- What choice gives acceptable outcomes across all scenarios?
- What choice avoids catastrophic outcomes?

**Examples:** Novel market entry, unprecedented technology bets.

---

## The Pre-Mortem: Inverting Decisions

Before committing to a decision, conduct a pre-mortem:

"It's one year from now. This decision has failed catastrophically. Why?"

Write down every reason for failure. Then assess:
- Which failure modes are most likely?
- Can we mitigate them?
- Are any failure modes unacceptable?

This surfaces risks your optimism has suppressed.

---

## The Fermi Estimation Method

When you don't have data, estimate from first principles.

**Example:** How many plumbers are there in Chicago?

1. Chicago population: ~2.7 million
2. Average household size: ~2.5 people → ~1 million households
3. Households that need a plumber annually: maybe 20% → 200,000 service calls/year
4. Service calls per plumber per year: ~500 (2 per day × 250 work days)
5. Plumbers needed: 200,000 / 500 = 400 plumbers

You might be off by 2x, but you won't be off by 100x. That's the value.

### When to Use Fermi

- Sizing markets
- Estimating costs without quotes
- Sanity-checking claims ("they say they'll do 10M users in year one...")
- Quick ROI calculations

---

## Expected Value vs. Expected Utility

Expected value treats all dollars equally. But humans don't.

**The problem:** Losing $1M when you have $2M is catastrophic. Losing $1M when you have $100M is painful but survivable.

**Expected utility** accounts for this by weighing outcomes by their actual impact on you, not their nominal value.

### Practical Implications

1. **Avoid ruin.** Never bet an amount whose loss would be catastrophic, even if expected value is positive.

2. **Risk tolerance scales with resources.** Early-stage companies should be more conservative (less room for error). Well-capitalized companies can take calculated risks.

3. **Repeated bets vs. one-shots.** If you make the same decision many times (hiring, marketing experiments), optimize for expected value. If it's a one-shot (betting the company), weight downside protection more.

---

## Calibration: Knowing What You Don't Know

Calibrated thinkers know the limits of their knowledge.

**Test yourself:** When you say something is "90% likely," it should happen ~90% of the time. Most people are overconfident — their 90% predictions happen only ~70% of the time.

### How to Calibrate

1. **Track predictions.** Write down predictions with probabilities. Check back.

2. **Use ranges.** Instead of "I think it's X," say "I'm 80% confident it's between A and B."

3. **Notice surprise.** When you're surprised, ask: "Why was my model wrong?"

4. **Seek disconfirming evidence.** Actively look for reasons you might be wrong.

---

## Common Decision Traps

### Confirmation Bias

Seeking evidence that supports what you already believe, ignoring evidence against.

**Fix:** Ask "What would change my mind?" before gathering information.

### Anchoring

Over-weighting the first number you hear.

**Fix:** Generate your own estimate before seeing others. Consider multiple anchors.

### Sunk Cost Fallacy

Continuing because you've already invested, not because continuing makes sense.

**Fix:** Ask "If I were starting fresh today, would I make this choice?"

### Availability Bias

Overweighting recent or memorable events.

**Fix:** Force yourself to consider base rates, not just what comes to mind.

### Overconfidence

Thinking you know more than you do.

**Fix:** Track predictions. Seek calibration feedback. Express uncertainty in ranges.

### Analysis Paralysis

Delaying decisions to gather more information indefinitely.

**Fix:** Set deadlines. Ask "Would more information change my decision?"

---

## The Operator's Decision Checklist

Before a major decision, run through:

1. **What's my prior?** What do base rates and past experience suggest?

2. **What evidence do I have?** How strong is it? How much should I update?

3. **What type of decision is this?** Reversible/irreversible? Known tradeoffs or deep uncertainty?

4. **What's the expected value?** And what's the expected utility given my risk tolerance?

5. **What would make this fail?** (Pre-mortem)

6. **What would change my mind?** If I'd never change my mind, I'm not thinking — I'm rationalizing.

7. **Am I being overconfident?** Should I widen my confidence interval?

---

## Summary: The Bayesian Operator

Thinking well under uncertainty is the core skill of an operator.

Key principles:
- Start from base rates (priors)
- Update beliefs proportionally to evidence strength
- Use the right framework for the decision type
- Avoid ruin even when expected value is positive
- Conduct pre-mortems to surface hidden risks
- Track your predictions to calibrate over time
- Be willing to change your mind when evidence warrants

The goal is not to eliminate uncertainty — it's to make good decisions despite uncertainty. Bayesian thinking is the operating system for that.
