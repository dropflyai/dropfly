# Pivot Pattern

## Context

You have invested time, resources, and organizational credibility in a product strategy that is not producing the expected results. Metrics are not hitting targets, customer feedback is tepid or negative, product-market fit indicators are weak, or the market has shifted beneath you. You must decide whether to persevere with adjustments, pivot to a new approach, or kill the initiative entirely.

---

## Problem

Pivots are among the most difficult decisions in product management because they involve acknowledging that the current direction is failing — which requires overcoming sunk cost bias, organizational inertia, and political dynamics. Teams either pivot too late (wasting months or years on a failing strategy) or pivot too early (abandoning promising directions before giving them enough time). The Pivot Pattern provides a structured, evidence-based process for making this decision rationally.

---

## Forces

- **Sunk cost bias:** We have invested so much that changing direction feels wasteful
- **Optimism bias:** "It will work if we just keep trying" (sometimes true, often not)
- **Political cost:** Admitting failure is personally and organizationally painful
- **Signal vs noise:** Is the poor performance temporary turbulence or a fundamental problem?
- **Pivot cost:** Changing direction also has costs (team disruption, wasted work, reputation)
- **Timing:** Pivoting too early wastes validated learning; too late wastes resources
- **Team morale:** Pivots can be demoralizing if not handled with care

---

## Solution Overview

The Pivot Pattern has four phases:

```
Phase 1: RECOGNIZE (1 week)     — Acknowledge the signals that something is wrong
Phase 2: DIAGNOSE (1-2 weeks)   — Determine the root cause
Phase 3: DECIDE (1 week)        — Choose: persevere, pivot, or kill
Phase 4: EXECUTE (2-8 weeks)    — Implement the decision with clarity and speed
```

---

## Execution

### Phase 1: RECOGNIZE (Week 1)

**Objective:** Honestly assess whether the current strategy is working, without defensiveness or premature panic.

```
RECOGNITION SIGNALS — Red flags that warrant investigation:

QUANTITATIVE SIGNALS:
[ ] Primary metric consistently below target for 2+ months
[ ] Retention curve declining to zero (not flattening)
[ ] Sean Ellis PMF score < 25% (strongly pre-PMF)
[ ] Growth only from paid acquisition (no organic growth)
[ ] Unit economics negative with no clear path to improvement
[ ] Customer acquisition cost increasing while LTV decreasing
[ ] Feature adoption below 5% for core features

QUALITATIVE SIGNALS:
[ ] Customer feedback consistently tepid ("nice" but not "essential")
[ ] Prospective customers choose competitors or do nothing
[ ] Team energy declining — sense of futility or going through motions
[ ] Stakeholders losing confidence
[ ] Sales team struggling to find product-market message
[ ] Support team receiving fundamental "why doesn't it do X?" questions

MARKET SIGNALS:
[ ] Competitor has leapfrogged with a fundamentally better approach
[ ] Market conditions have changed (regulation, technology shift, macro)
[ ] Target customer segment is shrinking or needs have shifted
[ ] Distribution channel has changed (platform policy, algorithm change)

If 3+ signals are present, proceed to Phase 2.
```

**Key deliverable:** Honest assessment of signal strength; decision to investigate further.

### Phase 2: DIAGNOSE (Weeks 2-3)

**Objective:** Determine the root cause of underperformance. The diagnosis determines the response.

```
DIAGNOSTIC FRAMEWORK:

A pivot is the wrong response if the problem is execution, not strategy.
The diagnosis must distinguish between:

1. VISION PROBLEM — We are solving the wrong problem for the wrong market
   Symptoms: No customer segment shows strong PMF signals
   Evidence: Sean Ellis < 25% across all segments; no retention curve flattens

2. STRATEGY PROBLEM — Right problem, wrong approach
   Symptoms: Some segments show PMF but overall metrics are weak
   Evidence: Sean Ellis > 40% for one segment but < 25% for others

3. SOLUTION PROBLEM — Right problem, right market, wrong solution
   Symptoms: Customers confirm the problem but do not adopt the solution
   Evidence: High intent, low activation; usability issues; "almost" feedback

4. EXECUTION PROBLEM — Right everything, poor execution
   Symptoms: Product has bugs, is slow, or is hard to use
   Evidence: Users try the product and leave due to quality, not value

5. GO-TO-MARKET PROBLEM — Right product, wrong channel/positioning
   Symptoms: Users who find the product love it, but too few find it
   Evidence: Strong PMF among active users, but acquisition is failing

6. TIMING PROBLEM — Right product, wrong time
   Symptoms: Market is not ready; enabling conditions not yet present
   Evidence: Low demand despite clear problem; "not yet" feedback
```

### Diagnostic Activities

```
1. CUSTOMER DEEP DIVE (8-12 interviews)
   - Re-interview the most engaged users: what keeps them?
   - Interview churned users: what drove them away?
   - Interview non-adopters: why did they not try or stay?

2. DATA ANALYSIS
   - Segment-level PMF analysis (Sean Ellis by segment)
   - Retention curve analysis (which cohorts, if any, flatten?)
   - Funnel analysis (where is the biggest drop-off?)
   - Feature-level analysis (which features correlate with retention?)

3. COMPETITIVE AUDIT
   - Has the competitive landscape changed?
   - Are competitors winning the segments we are losing?
   - What are competitors doing differently?

4. TEAM RETROSPECTIVE
   - What do team members believe is the root cause?
   - What assumptions from the original strategy have proven wrong?
   - What have we learned that we did not know at the start?

5. ROOT CAUSE SYNTHESIS
   Based on all evidence, identify the primary problem type:
   [ ] Vision problem
   [ ] Strategy problem
   [ ] Solution problem
   [ ] Execution problem
   [ ] GTM problem
   [ ] Timing problem
```

**Key deliverable:** Root cause diagnosis with evidence; problem type identified.

### Phase 3: DECIDE (Week 4)

**Objective:** Make a clear, documented decision: persevere, pivot, or kill.

```
DECISION MATRIX:

PROBLEM TYPE        →  RECOMMENDED RESPONSE
─────────────────────────────────────────────
Vision problem      →  MAJOR PIVOT or KILL
                       Change the target customer, problem, or both

Strategy problem    →  PIVOT (zoom-in or segment pivot)
                       Narrow to the segment where PMF exists

Solution problem    →  PERSEVERE WITH NEW SOLUTION
                       Keep the problem/market; explore new solution approaches

Execution problem   →  PERSEVERE WITH FIXES
                       Fix quality, performance, and UX issues

GTM problem         →  PERSEVERE WITH GTM PIVOT
                       Change positioning, channels, or sales model

Timing problem      →  PARK or SLOW INVEST
                       Reduce investment; monitor market readiness signals
```

### Pivot Types (Eric Ries, The Lean Startup, 2011)

| Pivot Type | Description | When to Use |
|-----------|-------------|-------------|
| **Zoom-in pivot** | A single feature becomes the entire product | One feature shows strong PMF but the product is too broad |
| **Zoom-out pivot** | The product becomes a feature of a larger product | Product is too narrow to sustain as standalone |
| **Customer segment pivot** | Same product, different target customer | PMF exists in a segment you did not originally target |
| **Customer need pivot** | Same customer, different problem | The customer you know has a more pressing problem |
| **Platform pivot** | Change from app to platform (or vice versa) | Ecosystem opportunity is larger than single-product opportunity |
| **Business model pivot** | Change how you monetize | Product has value but current model does not capture it |
| **Channel pivot** | Change distribution channel | Product-channel fit is broken |
| **Technology pivot** | New technology enables a fundamentally better solution | Tech shift makes current approach obsolete |
| **Value capture pivot** | Change pricing model or metric | Current pricing does not align with customer value perception |

### The Decision Meeting

```
Participants: PM, Engineering Lead, Design Lead, PM leadership, Sponsor
Duration: 90 minutes

Agenda:
1. Current state assessment (15 min)
   - Key metrics vs targets
   - Customer evidence summary

2. Diagnosis presentation (20 min)
   - Root cause analysis
   - Evidence for the diagnosis

3. Options presentation (20 min)
   - Option A: Persevere with changes (describe specifics)
   - Option B: Pivot (describe specific pivot type and direction)
   - Option C: Kill (describe graceful wind-down plan)
   - For each option: cost, timeline, probability of success

4. Discussion (20 min)
   - Questions, challenges, alternative perspectives
   - Risk assessment for each option

5. Decision (15 min)
   - Vote or leadership decides
   - Decision documented with rationale
   - Next steps assigned with owners and deadlines
```

**Key deliverable:** Documented decision (persevere/pivot/kill) with rationale, next steps, and timeline.

### Phase 4: EXECUTE (Weeks 5-12)

**Objective:** Implement the decision with clarity, speed, and team care.

#### If PERSEVERE:

```
[ ] Document the specific changes to strategy or execution
[ ] Set new targets and a time-boxed evaluation period
[ ] Communicate to the team: what we learned, what we are changing, why
[ ] Re-enter the Feature Launch Pattern with adjusted approach
[ ] Schedule re-evaluation in 4-8 weeks
```

#### If PIVOT:

```
PIVOT EXECUTION PLAN:

Week 1: COMMUNICATE
[ ] Announce the pivot to the team with full transparency
    - What we learned (the pivot is based on evidence, not failure)
    - What is changing (new direction, new targets)
    - What is staying (assets, learnings, people — what carries forward)
    - Why this is the right move (evidence-based rationale)
[ ] Communicate to stakeholders (leadership, board, partners)
[ ] Communicate to customers (if applicable)

Week 2-3: PLAN
[ ] Define the new direction using the Product Discovery Pattern (abbreviated)
[ ] Set new metrics and targets
[ ] Identify what assets from the current product can be reused
[ ] Create a 6-week plan for the pivoted direction
[ ] Determine what to preserve, discard, or mothball from the current direction

Week 3-8: BUILD
[ ] Execute against the pivoted plan
[ ] Run discovery for the new direction in parallel
[ ] Ship an MVP of the pivoted approach
[ ] Monitor new metrics

Week 8-12: EVALUATE
[ ] Evaluate the pivoted direction against new targets
[ ] If metrics are improving: continue investing
[ ] If metrics are not improving: return to Phase 1 (Recognize)
```

#### If KILL:

```
KILL EXECUTION PLAN:

Week 1: DECIDE AND COMMUNICATE
[ ] Document the decision and rationale
[ ] Communicate to the team (see communication guidelines below)
[ ] Communicate to stakeholders
[ ] Communicate to customers (if they were using the product)

Week 2-3: WIND DOWN
[ ] Data export and migration support for affected customers
[ ] Sunset communication following the timeline in lifecycle_management.md
[ ] Reassign team members to new projects
[ ] Archive code, data, and research

Week 4: POST-MORTEM
[ ] Conduct a blameless post-mortem
[ ] Document what we learned
[ ] Identify insights that apply to future initiatives
[ ] Update institutional knowledge (Memory/Failures.md)
```

---

## Communication During Pivots

### Communicating to the Team

| Do | Do Not |
|----|--------|
| Frame the pivot as learning, not failure | Frame it as blame or disappointment |
| Share the evidence that led to the decision | Announce without explanation |
| Acknowledge the team's effort and contribution | Dismiss the previous work as wasted |
| Be specific about what changes and what stays | Leave ambiguity about the new direction |
| Involve the team in shaping the new direction | Dictate the pivot from above without input |
| Express confidence in the new direction | Hedge with excessive uncertainty |

### The Pivot Communication Template

```
PIVOT COMMUNICATION

What happened:
We set out to [original goal]. Over [time period], we learned that
[evidence summary]. Specifically, [2-3 key findings].

What we are changing:
Based on this evidence, we are pivoting from [old approach] to
[new approach]. This is a [pivot type] pivot.

Why this is the right move:
[Evidence-based rationale]. The data tells us that [new direction]
has stronger signals because [specific evidence].

What stays the same:
[Assets, learnings, team structure that carry forward]. The work we
have done is not wasted — it taught us [specific learnings].

What this means for you:
[Specific impact on each team member/function]

Next steps:
1. [Action] — [Owner] — [Date]
2. [Action] — [Owner] — [Date]
3. [Action] — [Owner] — [Date]

Questions and discussion:
[Open the floor for questions, concerns, and input]
```

---

## Metrics

| Metric | Measurement | Target |
|--------|-------------|--------|
| Time from recognition to decision | Calendar days | < 4 weeks |
| Evidence quality | Number of interviews, data analyses, experiments | 8+ interviews; quantitative analysis |
| Decision clarity | Clear persevere/pivot/kill with documented rationale | 100% |
| Team alignment | Team survey after pivot communication | > 70% understand and support the decision |
| Pivot-to-traction time | Time from pivot to new PMF signals | < 3 months |

---

## Anti-Patterns

| Anti-Pattern | Description | Fix |
|-------------|-------------|-----|
| Sunk cost perseverance | "We have invested too much to change direction" | Evaluate based on future potential, not past investment |
| Slow pivot | Taking months to acknowledge and act on failure signals | Set explicit kill criteria at the START of every initiative |
| Blame pivot | "The team failed" instead of "the strategy was wrong" | Blameless diagnosis; the strategy is the subject, not the people |
| Panic pivot | Pivoting after 2 weeks of bad numbers without investigation | Require diagnostic phase; distinguish signal from noise |
| Secret pivot | Leadership changes direction without communicating clearly | Full transparency; the team deserves to know why |
| Lateral pivot | Pivoting to something equally unvalidated | New direction must be based on discovery evidence, not another guess |

---

## Cross-References

| Phase | Related Module |
|-------|---------------|
| Recognize | `06_metrics/product_metrics.md`, `07_growth_product/product_market_fit.md` |
| Diagnose | `03_user_research/user_research_methods.md`, `03_user_research/competitive_analysis.md` |
| Decide | `04_roadmapping/prioritization_frameworks.md` |
| Execute (Pivot) | `Patterns/product_discovery_pattern.md` |
| Execute (Kill) | `07_growth_product/lifecycle_management.md` |

---

## Summary

The Pivot Pattern provides a structured, evidence-based process for deciding whether to persevere, pivot, or kill a product initiative that is underperforming. Phase 1 (Recognize) identifies the quantitative, qualitative, and market signals that warrant investigation. Phase 2 (Diagnose) determines the root cause — vision, strategy, solution, execution, GTM, or timing — because the diagnosis determines the response. Phase 3 (Decide) applies a decision matrix to select the appropriate response and pivot type. Phase 4 (Execute) implements the decision with speed, clarity, and transparent communication. The most dangerous anti-patterns are sunk cost perseverance (too late to pivot) and panic pivoting (too early). The pivot is not a failure — it is the outcome of a functioning learning system. A team that cannot pivot is a team that cannot learn.
