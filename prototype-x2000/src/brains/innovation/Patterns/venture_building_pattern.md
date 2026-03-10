# Pattern: Venture Building

## Context

Use this pattern when creating a new business venture from scratch -- whether as
an internal startup, a spin-out, or a new product line that requires its own business
model. This pattern covers the full lifecycle from concept to graduation or spin-out.

## Problem

Building new ventures requires a fundamentally different approach than managing
existing businesses. Applying traditional management practices (detailed business
plans, financial projections, annual budgets) to new ventures is counterproductive
because the uncertainty is too high. This pattern provides a staged, evidence-driven
approach to venture building that manages uncertainty systematically.

---

## Solution: The Venture Building Lifecycle

### Stage 0: Opportunity Identification (Week 1-4)

```
INPUTS:
  - Innovation thesis (from innovation strategy)
  - Market signals (customer pain, technology shifts, competitive gaps)
  - Internal capabilities and assets

ACTIVITIES:
  1. Generate 5-10 venture concepts aligned with innovation thesis
  2. For each concept, articulate:
     - Target customer segment
     - Job-to-be-done
     - Proposed value proposition
     - Initial business model hypothesis
     - Unfair advantage (why us?)
  3. Score each concept using R-W-W framework
  4. Select top 2-3 concepts for exploration

OUTPUTS:
  - Venture concept briefs (1 page each)
  - R-W-W scoring matrix
  - Selection rationale

GATE 0 DECISION:
  [ ] Approve 2-3 concepts for Customer Discovery
  [ ] Kill concepts that fail R-W-W screening
```

### Stage 1: Customer Discovery (Week 4-12)

```
INPUTS:
  - Approved venture concept briefs
  - Target customer segment definition

ACTIVITIES:
  1. Conduct 30-50 problem interviews per concept
     - DO NOT pitch your solution
     - Understand the customer's world, problems, current solutions
     - Map the job-to-be-done
  2. Synthesize findings into customer archetypes
  3. Validate or invalidate problem hypothesis
  4. For validated problems, present solution concept to 15-20 customers
  5. Gauge solution interest and willingness to pay

TEAM: 2-3 people (Venture Lead + 1-2 others)
BUDGET: $50-100K

OUTPUTS:
  - Customer interview database
  - Customer archetypes
  - Problem-solution fit assessment
  - Updated business model canvas

GATE 1 DECISION:
  [ ] Problem validated, solution interest confirmed --> Stage 2
  [ ] Problem validated, solution needs pivot --> Iterate Stage 1
  [ ] Problem not validated --> Kill
```

### Stage 2: Solution Validation (Week 12-24)

```
INPUTS:
  - Validated problem hypothesis
  - Solution concept with customer interest

ACTIVITIES:
  1. Build MVP (minimum viable product)
     - Choose MVP type based on solution:
       Landing page, Wizard of Oz, Concierge, Single-feature, Piecemeal
     - Build in 2-4 weeks maximum
  2. Deploy MVP to early adopters (10-50 users)
  3. Run 3-5 lean experiment cycles (see lean_experiment_pattern.md)
  4. Test pricing hypothesis
  5. Measure activation, engagement, retention, willingness to pay
  6. Iterate on product based on user feedback

TEAM: 3-5 people (Venture Lead + Engineer + Designer + Growth)
BUDGET: $100-300K

OUTPUTS:
  - Working MVP
  - Usage data and analytics
  - Pricing validation results
  - Updated business model canvas
  - First revenue (if applicable)

GATE 2 DECISION:
  [ ] Product-market fit signals present --> Stage 3
  [ ] Promising but needs iteration --> Continue Stage 2
  [ ] No PMF signals after 3+ iterations --> Kill or major pivot
```

### Stage 3: Business Model Validation (Week 24-48)

```
INPUTS:
  - MVP with early traction
  - Preliminary product-market fit signals

ACTIVITIES:
  1. Validate unit economics:
     - LTV:CAC ratio > 3:1 (or clear path to it)
     - Payback period < 12 months
     - Gross margin > 60% (for software)
  2. Test growth channels:
     - Identify 2-3 scalable acquisition channels
     - Run channel experiments ($1-5K per channel)
     - Measure CAC and conversion by channel
  3. Confirm product-market fit:
     - Sean Ellis test (> 40% "very disappointed")
     - Retention curve analysis (does it flatten?)
     - Organic growth signals (word-of-mouth, referrals)
  4. Build v2 product (from prototype to production quality)
  5. Hire functional leads (if not already in place)

TEAM: 5-10 people (full cross-functional team)
BUDGET: $300K-1M

OUTPUTS:
  - Validated unit economics model
  - Growth channel assessment
  - Product-market fit evidence
  - Production-quality product (v2)
  - 12-month financial model

GATE 3 DECISION:
  [ ] PMF confirmed, unit economics work --> Stage 4
  [ ] PMF confirmed, unit economics need work --> Iterate Stage 3
  [ ] PMF not achieved --> Kill or major pivot
```

### Stage 4: Scaling Preparation (Week 48-72)

```
INPUTS:
  - Confirmed product-market fit
  - Validated unit economics
  - Proven growth channels

ACTIVITIES:
  1. Build scalable operations:
     - Production infrastructure (CI/CD, monitoring, alerting)
     - Customer support processes
     - Sales playbook (if B2B)
     - Content and marketing engine
  2. Expand team to full functional coverage
  3. Develop 3-year financial model with scenarios
  4. Prepare for graduation or spin-out:
     - Standalone P&L
     - Independent operations capability
     - Leadership team in place
  5. Define graduation criteria with Innovation Board

TEAM: 10-25 people
BUDGET: $1-5M

OUTPUTS:
  - Scalable operations playbook
  - Full team in place
  - 3-year financial model
  - Graduation proposal

GATE 4 DECISION:
  [ ] Ready to graduate --> Standalone business unit or spin-out
  [ ] Needs more time --> Continue Stage 4 with conditions
  [ ] Market conditions changed --> Kill or pivot
```

### Stage 5: Graduation (Week 72+)

```
GRADUATION OPTIONS:

Option A: Integrate into parent company
  - Becomes a new business unit
  - Reports to existing division or directly to CEO
  - Maintains some startup culture within corporate structure

Option B: Spin-out
  - Becomes independent company
  - Parent retains equity stake (typically 30-60%)
  - Independent board, funding, hiring

Option C: Strategic sale
  - Sell to strategic acquirer
  - Realize return on innovation investment
  - Appropriate when parent cannot scale the venture

GRADUATION SCORECARD:
  [ ] Revenue > $____ /month (MRR or equivalent)
  [ ] Growth rate > ____% month-over-month
  [ ] Product-market fit confirmed (Sean Ellis > 40%)
  [ ] Unit economics proven (LTV:CAC > 3:1)
  [ ] Leadership team complete and capable
  [ ] Operations can run independently
  [ ] 3-year plan credible
```

---

## Artifacts Produced by Stage

| Stage | Key Artifacts |
|-------|--------------|
| Stage 0 | Venture concept briefs, R-W-W scores |
| Stage 1 | Customer interview database, problem validation report |
| Stage 2 | MVP, usage analytics, experiment results |
| Stage 3 | Unit economics model, PMF evidence, growth channel data |
| Stage 4 | Operations playbook, financial model, graduation proposal |
| Stage 5 | Standalone business or spin-out entity |

---

## Anti-Patterns

| Anti-Pattern | Why It Fails | Correction |
|-------------|-------------|-----------|
| Skipping Customer Discovery | Building for assumed problems | Mandate 30+ interviews before any building |
| Over-building the MVP | Waste if assumptions are wrong | Time-box MVP to 2-4 weeks max |
| No kill criteria | Zombie ventures consume resources | Define kill criteria at each gate |
| Applying corporate metrics to early stages | Kills ventures prematurely | Use innovation accounting |
| No executive sponsor | Vulnerable to organizational antibodies | Assign C-suite sponsor at Stage 0 |
| Hiring too fast | Burn rate exceeds learning rate | Hire only when stage-gate demands it |

---

## Timing Summary

```
Stage 0: Opportunity Identification    4 weeks     $10-50K
Stage 1: Customer Discovery            8 weeks     $50-100K
Stage 2: Solution Validation           12 weeks    $100-300K
Stage 3: Business Model Validation     24 weeks    $300K-1M
Stage 4: Scaling Preparation           24 weeks    $1-5M
Stage 5: Graduation                    Ongoing     $5M+

Total concept-to-graduation: 18-24 months
Total investment: $1.5-6.5M
```

---

**References:**
- Blank, S. (2013). *The Startup Owner's Manual*. K&S Ranch.
- Ries, E. (2017). *The Startup Way*. Currency.
- Binns, A., Tushman, M.L., & O'Reilly, C.A. (2022). *Corporate Explorer*. Wiley.
