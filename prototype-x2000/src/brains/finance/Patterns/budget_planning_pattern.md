# Budget Planning Pattern — Annual Operating Budget Construction

## Context

You need to build the annual operating budget that translates business strategy
into monthly financial targets for the upcoming fiscal year. The budget serves as
the financial contract between departments and finance, the basis for board
expectations, and the benchmark against which actual performance is measured.

---

## Problem Statement

Budget processes fail when they:
- Are purely top-down (disconnected from operational reality)
- Are purely bottom-up (miss strategic ambition and constraints)
- Take too long (> 8 weeks creates planning fatigue)
- Produce a single-point forecast (no scenario flexibility)
- Are never updated (become stale by Q2)

---

## Solution Architecture

```
┌──────────────────────────────────────────────────────────┐
│                  BUDGET PROCESS                           │
│                                                           │
│  Week 1-2      Week 3-4       Week 5-6       Week 7-8   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │Strategic │  │ Bottom-Up│  │ Reconcile│  │ Approve  ││
│  │Framework │──│ Builds   │──│ & Iterate│──│ & Launch ││
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘│
│                                                           │
│  CEO/Board      Dept Heads    CFO + Leads   Board        │
└──────────────────────────────────────────────────────────┘
```

---

## Implementation Steps

### Phase 1: Strategic Framework (Weeks 1-2)

**1.1 CEO Sets Strategic Priorities**
```
Annual priorities (example):
  1. Grow ARR from $15M to $25M (67% growth)
  2. Improve NRR from 108% to 115%
  3. Achieve breakeven on non-GAAP operating income by Q4
  4. Enter mid-market segment (ACV $25K-$100K)
  5. Hire VP Engineering and VP Marketing

These priorities define the financial envelope:
  Revenue target: $25M ARR by year-end
  Burn constraint: achieve non-GAAP breakeven by Q4
  Headcount: +25 net new hires (from 50 to 75)
```

**1.2 CFO Sets Financial Guardrails**
```
Top-down targets:
  Revenue: $20M recognized revenue (growing from $15M ARR start)
  Gross margin: > 75%
  OPEX growth: < revenue growth (operating leverage)
  Ending cash: > $5M (12 months runway)
  Total headcount budget: 75 FTE by year-end

Departmental allocation guidance:
  Sales & Marketing: 35-40% of revenue
  R&D: 25-30% of revenue
  G&A: 10-12% of revenue
  COGS: 20-25% of revenue

Budget template distributed to department heads with:
  - Historical data (prior year actual + current year forecast)
  - Top-down targets by department
  - Headcount planning template
  - Non-headcount expense categories
  - Timeline and submission deadline
```

### Phase 2: Bottom-Up Builds (Weeks 3-4)

**2.1 Department Heads Submit Plans**

Each department builds from the bottom up:

```
Sales budget example:
  Existing team productivity:
    6 AEs * $800K quota * 75% attainment = $3.6M new ARR
  New hires (4 AEs, ramping):
    Q1 hires (2): 6 months productive, 50% ramp = $400K
    Q2 hires (2): 3 months productive, 30% ramp = $120K
  Total new business ARR: $4.12M

  Headcount:
    Role          | Current | Q1 Hire | Q2 Hire | Year-End | Fully Loaded
    AE            | 6       | 2       | 2       | 10       | $180K
    SDR           | 3       | 1       | 1       | 5        | $90K
    Sales Mgr     | 1       | 0       | 0       | 1        | $220K
    Total         | 10      | 3       | 3       | 16       |

  Non-headcount:
    Category              | Annual Budget | Monthly
    Sales tools (CRM, CPQ)| $120K         | $10K
    Travel & entertainment| $180K         | $15K
    Events & conferences  | $100K         | $8.3K
    Sales enablement      | $50K          | $4.2K
    Total non-HC          | $450K         | $37.5K
```

**2.2 Revenue Build**
```
Revenue model inputs (from Sales + CS + Product):
  New business: $4.12M net new ARR (from sales plan)
  Expansion: $1.5M (from CS plan, 12% of beginning ARR)
  Contraction: ($300K) (from historical rate)
  Churn: ($700K) (from historical rate, improved by CS plan)
  Net new ARR: $4.62M

Monthly ARR build:
  Month   Beginning ARR  New    Expansion  Contract  Churn   Ending ARR
  Jan     $15,000K       $280K  $100K      ($25K)    ($55K)  $15,300K
  Feb     $15,300K       $300K  $110K      ($25K)    ($55K)  $15,630K
  ...
  Dec     $24,100K       $450K  $160K      ($25K)    ($55K)  $24,630K

Revenue recognized (monthly): convert ARR to monthly recognized revenue
  accounting for contract start dates and billing cycles.
```

### Phase 3: Reconcile and Iterate (Weeks 5-6)

**3.1 Gap Analysis**
```
Consolidation:
  Total revenue (bottom-up):     $19.5M
  Revenue target (top-down):     $20.0M
  Gap:                            ($500K) -- need $500K more revenue

  Total OPEX (bottom-up):        $18.0M
  OPEX target (top-down):        $17.5M
  Gap:                            $500K over -- need to cut $500K

Resolution options:
  A. Increase revenue: hire 1 more AE, increase expansion targets
  B. Decrease OPEX: defer 2 non-critical hires to H2
  C. Accept gap: present to board as base case, stretch for bull case
  D. Hybrid: minor adjustments on both sides

CFO recommends: Option D
  +$200K revenue from increased expansion target (stretch but achievable)
  -$300K OPEX from deferring 1 hire and reducing travel budget
```

**3.2 Scenario Modeling**
```
Three scenarios:

              Bull         Base         Bear
Revenue       $22M (+10%)  $20M         $17M (-15%)
Gross Margin  78%          76%          72%
OPEX          $18.5M       $17.5M       $15.5M
Net Income    ($1.3M)      ($1.5M)      ($2.7M)
Ending Cash   $6.5M        $5.0M        $3.0M
Runway        20 months    16 months    10 months

Trigger for bear case response:
  If Q1 revenue < 90% of plan, activate bear case budget
  Actions: hiring freeze, reduce marketing, renegotiate vendors
```

### Phase 4: Approve and Launch (Weeks 7-8)

**4.1 Board Approval**
```
Board presentation:
  1. Strategic priorities for the year (CEO)
  2. Revenue plan and assumptions (CFO)
  3. Expense plan and headcount (CFO)
  4. Scenario analysis: bull/base/bear (CFO)
  5. Key risks and mitigations (CEO + CFO)
  6. Request: board approval of base case budget

Board motion: "Approve the FY20XX operating budget as presented,
with authority for management to operate within the approved
headcount and expense envelope."
```

**4.2 Budget Distribution**
```
Post-approval:
  [ ] Load budget into FP&A system (monthly by department)
  [ ] Distribute department budgets to each department head
  [ ] Schedule monthly budget vs actual reviews
  [ ] Set up variance alerting (> 10% triggers review)
  [ ] Communicate budget assumptions and constraints to all managers
  [ ] Establish reforecast triggers and process
```

---

## Ongoing Management

### Monthly Review

```
Each month after close:
  1. Compare actual to budget at department level
  2. Identify variances > 5%
  3. Department heads explain material variances
  4. CFO presents consolidated variance to leadership
  5. Adjust outlook if trends are persistent
```

### Reforecast Triggers

```
Trigger reforecast when:
  - Revenue misses plan by > 10% for 2 consecutive months
  - Significant strategic change (new product, pivot, M&A)
  - Macro environment shift (recession, rate changes)
  - Actual burn > 15% above plan for 2 consecutive months
  - Board requests updated projection

Reforecast process:
  - Actuals through current month
  - Revised forecast for remaining months
  - Updated scenario analysis
  - Board communication within 2 weeks
```

---

## Trade-offs

| Gain | Sacrifice |
|------|----------|
| Strategic alignment | 6-8 weeks of planning effort |
| Departmental accountability | Can feel constraining to dept heads |
| Board-ready financial plan | Requires iteration and negotiation |
| Scenario preparedness | Three models to maintain |

---

## Anti-patterns

- Budget without board-approved strategic priorities
- Department heads submit wish lists without constraints
- No scenario analysis (single-point forecast)
- Budget approved but never referenced during the year
- Reforecasting every month (reduces budget credibility)
- Sandbagging budgets to guarantee "beat" (destroys trust)

---

## Checklist

- [ ] CEO strategic priorities documented
- [ ] CFO financial guardrails communicated
- [ ] Department heads submitted bottom-up plans
- [ ] Revenue model built from pipeline and cohort data
- [ ] Headcount plan with fully loaded costs and hire dates
- [ ] Gap analysis completed and resolved
- [ ] Three scenarios modeled (bull/base/bear)
- [ ] Board presentation prepared and reviewed
- [ ] Board approved the budget
- [ ] Budget loaded into systems and distributed to departments
- [ ] Monthly review cadence established

---

## References

- SaaS Capital: Annual Planning for SaaS Companies.
- CFO Connect: Budget Planning Best Practices.
- Bessemer Venture Partners: SaaS Planning Framework.
