# Forecasting and Scenario Planning

## What This Enables

**Decisions it helps make:**
- How much runway do we actually have?
- When should we raise, hire, or cut?
- Which growth investments are worth making?
- What should we commit to stakeholders?

**Mistakes it prevents:**
- Running out of cash because projections were optimistic fantasies
- Overbuilding capacity for demand that never materializes
- Missing opportunities by being too conservative
- Making commitments you can't keep

**Outputs it enables:**
- Range-based financial projections (not single-point delusions)
- Trigger-based decision rules ("if X happens, we do Y")
- Prepared responses to scenarios before they occur

---

## The Truth About Forecasting

Forecasts are always wrong. The goal is not accuracy — it's usefulness.

A useful forecast:
- Quantifies uncertainty instead of hiding it
- Identifies what drives outcomes so you can monitor it
- Creates decision rules that don't require perfect prediction
- Gets updated as new information arrives

---

## Bottom-Up vs. Top-Down Forecasting

### Top-Down (Dangerous as Primary Method)

"The market is $10B. If we get 1%, that's $100M."

**Problem:** Assumes market share without explaining how you'll capture it. Every startup assumes 1% share; almost none achieve it.

**When to use:** Reality check on whether your bottom-up projections are plausible. If bottom-up says $500M in a $1B market, something is wrong.

### Bottom-Up (Default Method)

Build from unit economics and capacity:
- How many leads can we generate?
- What's our conversion rate?
- What's our average deal size?
- What's our sales capacity?

**Example:**
- 2 sales reps × 10 deals/month × $15K ACV = $300K/month = $3.6M ARR

**When to use:** Always as primary method. It forces you to defend assumptions at each step.

### Failure Mode: Hockey Sticks Without Explanation

If your forecast shows flat growth then sudden exponential growth, you need to explain what changes. The inflection point must be tied to a specific event, investment, or milestone — not "we'll figure it out."

---

## Range-Based Forecasting

Single-point forecasts are lies of false precision. Use ranges.

### The Three-Scenario Approach

| Scenario | Definition | Use |
|----------|------------|-----|
| Base Case | Assumptions mostly work, execution is decent | Planning, hiring, budgeting |
| Downside | Key assumptions fail, competition intensifies, execution stumbles | Stress testing, runway calculation |
| Upside | Things break right, expansion opportunities hit | Capacity planning, opportunity sizing |

**Critical:** The downside is not "base case minus 20%." It should reflect specific things going wrong.

- Base: "We convert 30% of pipeline, CAC stays at $500"
- Downside: "Conversion drops to 20% (competitor launches), CAC rises to $700 (channel saturation)"
- Upside: "Viral loop kicks in, conversion hits 40%, CAC drops to $350"

### Probability-Weighted Expectations

If you can assign rough probabilities:
- 60% Base Case: $5M revenue
- 25% Downside: $3M revenue
- 15% Upside: $8M revenue

Expected value = (0.6 × $5M) + (0.25 × $3M) + (0.15 × $8M) = $4.95M

But don't communicate this as "we'll do $4.95M." Communicate the range and the weighted expectation.

---

## Driver-Based Forecasting

Identify the 3-5 variables that actually determine your outcomes. Forecast those, and let the rest cascade.

### Example: SaaS Revenue Forecast

**Drivers:**
1. New customer acquisition rate
2. Average contract value
3. Net revenue retention (expansion - churn)

**Formula:**
Revenue = (Existing ARR × Retention) + (New Customers × ACV)

Instead of forecasting "revenue," forecast the drivers. It's easier to estimate "how many new customers" than "what will revenue be."

### Sensitivity Analysis

For each driver, ask: "If this is 20% worse than expected, what happens?"

This reveals which assumptions matter most. If a 20% miss on retention wrecks the model but a 20% miss on new customers barely dents it, you know where to focus.

---

## Scenario Planning (Beyond Numbers)

Scenario planning isn't just about financial projections. It's about preparing for futures that require different strategies.

### How to Build Scenarios

**Step 1: Identify Key Uncertainties**

What external factors could dramatically change your situation?
- Regulatory changes
- Competitive moves
- Technology shifts
- Macroeconomic conditions
- Customer behavior changes

**Step 2: Pick Two High-Impact Uncertainties**

Create a 2×2 matrix. Each quadrant is a scenario.

**Example:**
- Axis 1: Interest rates (high vs. low)
- Axis 2: Enterprise adoption speed (fast vs. slow)

This gives four scenarios:
1. Low rates + Fast adoption (Bull case)
2. Low rates + Slow adoption (Cash-rich but struggling for traction)
3. High rates + Fast adoption (Demand is there, capital is scarce)
4. High rates + Slow adoption (Survival mode)

**Step 3: Develop Each Scenario**

For each quadrant:
- What does this world look like?
- Who wins and loses?
- What would we need to do to succeed?
- What early signals would tell us we're in this scenario?

**Step 4: Identify "No Regret" Moves**

What actions make sense regardless of which scenario unfolds?
- These are safe bets
- Do them now

What actions are scenario-dependent?
- These are options to preserve
- Don't commit until you see which way things are going

---

## Updating Forecasts

Forecasts should be living documents, not annual exercises.

### The Bayesian Update Cycle

1. Start with a prior (your best guess given current information)
2. Observe new data
3. Update your estimate proportionally to how surprising the data was
4. Repeat

**Practical approach:** Monthly forecast reviews.
- What did we expect?
- What happened?
- Why the gap?
- What does this tell us about the rest of the year?

### When to Re-Forecast Completely

A major re-forecast (not just tweaking) is needed when:
- A key assumption is proven wrong
- External environment shifts significantly
- A major strategic decision changes the plan
- Actual results are >20% off forecast for 2+ periods

---

## Common Forecasting Failures

### 1. The Planning Fallacy

People consistently underestimate time, cost, and risk. Projects take longer and cost more than expected.

**Fix:** Use reference class forecasting. "How long do projects like this usually take?" beats "How long do I think this will take."

### 2. Anchoring on Last Year

"We grew 30% last year, so we'll grow 30% next year."

This ignores changing conditions. Growth rates naturally decelerate as you scale. Competitive dynamics shift. Don't anchor on the past.

### 3. False Precision

Forecasts to the dollar in year 3 are performative fiction. Use ranges that reflect actual uncertainty.

### 4. Confirmation Bias in Assumptions

Teams choose assumptions that make the forecast look good, then defend them.

**Fix:** Red team your own forecast. Ask: "What would make this fail? How likely is that?"

### 5. Ignoring Correlation

Multiple assumptions can fail together. Economic downturns hurt revenue AND increase costs AND slow fundraising. Model correlated risks as scenarios, not independent inputs.

---

## Communicating Forecasts

### To Investors

- Lead with the range, not a single number
- Explain the key drivers and your assumptions
- Be clear about what you control vs. what's external
- Show you've thought about downside

### To Your Board

- Present base case with upside/downside scenarios
- Highlight leading indicators you're watching
- Connect forecast to strategic decisions
- Update proactively when things change

### To Your Team

- Share the base case plan
- Be clear about what needs to happen to hit it
- Create ownership of drivers
- Celebrate learning when forecasts miss, don't punish

---

## Decision Rules from Forecasts

The point of forecasting is to make decisions. Create explicit triggers:

| If... | Then... |
|-------|---------|
| Cash drops below 6 months runway | Initiate cost reduction |
| Pipeline coverage falls below 3x | Increase marketing spend |
| Retention exceeds 110% | Accelerate hiring |
| New competitor captures >10% share | Re-evaluate pricing |

Pre-committing to decisions reduces panic and biased thinking in the moment.

---

## Summary: Forecasting as a Practice

Forecasting is not about predicting the future — it's about being prepared for multiple futures.

Key principles:
- Use bottom-up, driver-based models
- Express uncertainty with ranges, not false precision
- Build scenarios around key uncertainties
- Update continuously as new data arrives
- Create decision rules tied to forecasts
- Accept that you'll be wrong; the goal is useful, not accurate
