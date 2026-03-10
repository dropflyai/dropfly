# Pattern: Lean Experiment

## Context

Use this pattern when you need to validate a specific assumption about an innovation
idea. This pattern applies the Build-Measure-Learn loop to reduce uncertainty about
whether a product, feature, or business model will work. It is appropriate for any
stage of innovation where there is a testable hypothesis.

## Problem

Innovation ideas rest on assumptions. Many assumptions are untested, and teams often
build fully-featured products before discovering that a core assumption is false.
This wastes time, money, and morale. The Lean Experiment pattern provides a
disciplined approach to testing assumptions cheaply and quickly.

---

## Solution: Step-by-Step Process

### Phase 1: Hypothesis Formulation (Day 1)

```
Step 1: Identify the core idea or opportunity
Step 2: List ALL assumptions the idea rests on
  - Customer assumptions ("They have this problem")
  - Solution assumptions ("This approach solves it")
  - Business model assumptions ("They will pay $X")
  - Technical assumptions ("We can build this")
  - Growth assumptions ("They will share/refer")

Step 3: Rank assumptions by:
  - Importance (1-5): How critical is this to success?
  - Evidence (1-5): How much evidence do we have?
  - Riskiest = High importance + Low evidence

Step 4: Select the SINGLE riskiest assumption to test

Step 5: Formulate a falsifiable hypothesis:
  "We believe that [specific action/offering]
   for [specific customer segment]
   will result in [specific measurable outcome].
   We will know this is true when [metric]
   reaches [threshold] within [timeframe]."
```

### Phase 2: Experiment Design (Day 1-2)

```
Step 6: Choose experiment type based on assumption:
  - Problem assumption --> Customer interviews (10-20)
  - Solution assumption --> Prototype test (5-8 users)
  - Demand assumption --> Landing page / smoke test
  - Pricing assumption --> Willingness-to-pay test
  - Technical assumption --> Proof of concept

Step 7: Define success and failure criteria BEFORE running:
  - Success: [metric] >= [threshold] --> Proceed
  - Ambiguous: [metric] between [low] and [high] --> More data needed
  - Failure: [metric] < [threshold] --> Pivot or kill

Step 8: Determine sample size and duration:
  - Qualitative (interviews): 10-20 participants
  - Quantitative (landing page): 200+ visitors minimum
  - Time-box: Maximum 2 weeks per experiment

Step 9: Identify resources needed:
  - People, tools, budget, customer access
  - Total cost should be < 5% of total project budget
```

### Phase 3: Build the Minimum (Day 2-5)

```
Step 10: Build the MINIMUM needed to test the hypothesis
  - Landing page: 1 page, 1 CTA, analytics tracking
  - Prototype: Core interaction only, no polish
  - Interview guide: 10 open-ended questions
  - POC: Single technical capability, no UI

Step 11: Review with team:
  - Does this test the riskiest assumption?
  - Is this the minimum build needed?
  - Are success criteria clearly defined?
  - Can we get results within the time-box?
```

### Phase 4: Measure (Day 5-12)

```
Step 12: Deploy the experiment
  - Launch to target audience
  - Ensure tracking and measurement are working
  - Do NOT modify the experiment mid-run (unless critical bug)

Step 13: Collect data
  - Quantitative: Track defined metrics daily
  - Qualitative: Record interviews, note patterns
  - Behavioral: What did people DO (not just say)?

Step 14: Monitor for sufficient sample size
  - Stop when sample size is reached OR time-box expires
  - Do not cherry-pick data or extend to get "better" results
```

### Phase 5: Learn (Day 12-14)

```
Step 15: Analyze results against pre-defined criteria
  - Did we meet the success threshold?
  - What surprised us?
  - What additional questions emerged?

Step 16: Make a decision:
  - PROCEED: Assumption validated. Test the next riskiest assumption.
  - PIVOT: Assumption invalidated. Change approach and re-test.
  - KILL: Fundamental problem identified. Stop investing.
  - ITERATE: Results ambiguous. Refine experiment and re-test.

Step 17: Document learnings
  - What did we learn?
  - What assumptions were validated/invalidated?
  - How does this change our understanding?
  - What should the next experiment test?

Step 18: Share learnings
  - Update team and stakeholders
  - Log in Innovation Brain Memory/
  - Present at next demo/review meeting
```

---

## Artifacts Produced

| Artifact | Description |
|----------|-------------|
| Assumption map | Ranked list of assumptions with importance and evidence scores |
| Experiment brief | Hypothesis, experiment type, success criteria, timeline |
| Raw data | Metrics, interview transcripts, user recordings |
| Analysis document | Results vs. criteria, patterns, insights |
| Decision record | Proceed/pivot/kill decision with rationale |
| Learning log | Key insights for institutional memory |

---

## Timing

```
Total duration: 10-14 days per experiment cycle
  Phase 1: 0.5 days
  Phase 2: 1 day
  Phase 3: 3-4 days
  Phase 4: 5-7 days
  Phase 5: 1-2 days

Teams should run 2-3 experiment cycles per month.
```

---

## Anti-Patterns

| Anti-Pattern | Why It Fails | Correction |
|-------------|-------------|-----------|
| Testing too many things at once | Cannot attribute results | Test ONE assumption per experiment |
| No pre-defined success criteria | Confirmation bias in interpretation | Define criteria BEFORE running |
| Building too much | Wasted effort if assumption is false | Build the minimum to learn |
| Extending the experiment to get "good" results | Self-deception | Hard stop at time-box |
| Not documenting learnings | Institutional knowledge lost | Mandatory learning log entry |
| Skipping the kill decision | Zombie projects consume resources | Every experiment ends with a decision |

---

## Example: SaaS Product Experiment

```
Riskiest assumption: "Small business owners will pay $29/month for
automated expense categorization."

Experiment type: Landing page with pricing + email capture

Build: Single-page site with:
  - Value proposition headline
  - Feature overview (3 bullets)
  - Pricing ($29/month)
  - CTA: "Start free trial" (captures email)
  - Google Analytics + Hotjar tracking

Success criteria:
  - 500+ unique visitors (via $500 ad spend)
  - > 5% email capture conversion rate
  - > 20% of captured emails respond to follow-up survey

Duration: 10 days

Result: 3.2% conversion rate (below 5% threshold)
Decision: PIVOT on pricing (test $19/month) or PIVOT on segment
         (test freelancers instead of small business owners)
```

---

**References:**
- Ries, E. (2011). *The Lean Startup*. Crown Business.
- Maurya, A. (2012). *Running Lean*. O'Reilly Media.
- Bland, D.J. & Osterwalder, A. (2019). *Testing Business Ideas*. Wiley.
