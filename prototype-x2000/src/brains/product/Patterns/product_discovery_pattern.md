# Product Discovery Pattern

## Context

You have a strategic theme or customer problem area that warrants investigation, but you do not yet know what specific solution to build. Discovery is the process of reducing uncertainty about what to build before committing engineering resources. This pattern applies any time a team is exploring a new opportunity — whether a new product, a new feature area, or an expansion into a new market segment.

---

## Problem

Teams frequently skip discovery and jump directly to building, resulting in features that solve the wrong problem, serve the wrong audience, or deliver insufficient value. The Product Discovery Pattern provides a structured, time-boxed process for validating the opportunity, understanding the customer, exploring solutions, and deciding what to build — before committing engineering resources.

Teresa Torres (Continuous Discovery Habits, 2021): "The biggest risk in product development is not building the wrong solution — it is building a solution to the wrong problem."

---

## Forces

- **Speed vs Thoroughness:** Pressure to ship now vs need to validate before building
- **Confidence vs Humility:** Belief in the idea vs willingness to be proven wrong
- **Breadth vs Depth:** Exploring many options vs going deep on one
- **Qualitative vs Quantitative:** Rich understanding vs statistical confidence
- **Team involvement vs PM solo:** Shared discovery vs PM as sole discoverer
- **Discovery vs Delivery:** Time spent learning vs time spent building

---

## Solution Overview

The Product Discovery Pattern has five phases, typically executed over 3-6 weeks:

```
Phase 1: FRAME (Week 1)
Phase 2: DISCOVER (Week 1-2)
Phase 3: IDEATE (Week 2-3)
Phase 4: VALIDATE (Week 3-5)
Phase 5: DECIDE (Week 5-6)
```

---

## Execution

### Phase 1: FRAME (Week 1)

**Objective:** Define the opportunity space, the constraints, and the discovery questions.

```
FRAMING ACTIVITIES:

1. OPPORTUNITY STATEMENT
   Write a clear statement of the opportunity:
   "We believe [customer segment] has a problem with [problem area]
   that, if solved, would [business outcome]."

2. DISCOVERY QUESTIONS
   List the questions discovery must answer:
   - Do customers actually have this problem? (Value risk)
   - How severely does it affect them? (Impact)
   - How are they solving it today? (Current alternatives)
   - What would a great solution look like? (Solution direction)
   - Can we build it? (Feasibility risk)
   - Does it align with our strategy? (Viability risk)

3. ASSUMPTIONS MAP
   List the assumptions underlying the opportunity:
   ┌─────────────────────────────────────────────────┐
   │ HIGH IMPACT                                      │
   │   • Customers will pay for this                  │
   │   • Problem affects >30% of our ICP              │
   │                                                   │
   │ LOW CONFIDENCE ──────────── HIGH CONFIDENCE       │
   │                                                   │
   │   • We can build this in 6 weeks                 │
   │   • The market is growing                        │
   │ LOW IMPACT                                       │
   └─────────────────────────────────────────────────┘

   Test high-impact, low-confidence assumptions FIRST.

4. CONSTRAINTS
   - Time budget: [N weeks for discovery]
   - Resource budget: [who is available]
   - Strategic constraints: [must align with X]
   - Technical constraints: [platform limitations]

5. SUCCESS CRITERIA
   Define what "discovery complete" looks like:
   - Evidence threshold: [N interviews, survey with N responses]
   - Confidence level: [can articulate the problem, solution direction, and business case]
   - Decision: build, pivot, or kill
```

**Key deliverable:** Opportunity statement, discovery questions, assumptions map, success criteria.

### Phase 2: DISCOVER (Weeks 1-2)

**Objective:** Develop deep understanding of the customer, their problem, and their current solutions.

```
DISCOVERY ACTIVITIES:

1. CUSTOMER INTERVIEWS (8-15 interviews)
   Use the interview protocol from 03_user_research/user_research_methods.md

   Target mix:
   - 40% existing customers in the target segment
   - 30% churned or non-customers who have the problem
   - 30% customers of competitors or alternative solutions

   Interview focus:
   - Current workflow and pain points
   - Jobs to be done and desired outcomes
   - Current solutions and workarounds
   - Willingness to change (switching costs, motivations)

2. DATA ANALYSIS
   Analyze existing product data:
   - Support tickets related to this problem area
   - Feature requests and their frequency
   - Usage patterns that indicate the problem
   - Churn analysis (did this problem contribute to churn?)

3. COMPETITIVE ANALYSIS
   Evaluate how competitors address this problem:
   - Feature comparison (weighted by customer importance)
   - Positioning analysis (how competitors talk about this)
   - Win/loss data related to this capability
   - Substitutes and workarounds in the market

4. EXPERT INTERVIEWS (3-5 interviews)
   Talk to internal experts:
   - Sales team (what do prospects ask for? why do we lose deals?)
   - Support team (what do customers struggle with?)
   - Engineering (what is technically feasible? what is hard?)
   - Domain experts (industry trends, regulatory context)
```

**Key deliverable:** Customer insight synthesis with validated problem statement and evidence.

### Phase 3: IDEATE (Weeks 2-3)

**Objective:** Generate multiple solution concepts before converging on the best approach.

```
IDEATION ACTIVITIES:

1. OPPORTUNITY SOLUTION TREE (Teresa Torres)

   [Desired Outcome]
       │
       ├── [Opportunity 1]
       │   ├── Solution A
       │   ├── Solution B
       │   └── Solution C
       │
       ├── [Opportunity 2]
       │   ├── Solution D
       │   └── Solution E
       │
       └── [Opportunity 3]
           ├── Solution F
           └── Solution G

   - Start with the desired outcome (metric to improve)
   - Branch into opportunity areas (customer pain points)
   - Generate 2-3 solution concepts per opportunity
   - Do NOT converge yet — maintain optionality

2. DIVERGENT IDEATION SESSION
   With the product trio (PM, Designer, Engineer):
   - 15 min: Individual sketching (Crazy 8s or similar)
   - 15 min: Share and explain solutions
   - 15 min: Build on each other's ideas
   - 15 min: Cluster and identify themes

   Rules:
   - Quantity over quality (generate volume)
   - No criticism during divergence
   - Build on others' ideas
   - Defer judgment to convergence phase

3. CONVERGENCE
   Evaluate solution concepts against:
   - Customer impact (does this solve the validated problem?)
   - Feasibility (can we build this with current capabilities?)
   - Strategic alignment (does this advance our strategy?)
   - Effort/value ratio (is the value worth the investment?)

   Select 2-3 concepts for validation.

4. CONCEPT FRAMING
   For each selected concept, write a brief:
   - Problem it solves (specific customer job)
   - How it works (1-paragraph description)
   - Key differentiator (why is this better than alternatives?)
   - Biggest risk (what could make this fail?)
   - Minimum experiment (smallest test to validate the concept)
```

**Key deliverable:** 2-3 solution concepts with briefs, ready for validation.

### Phase 4: VALIDATE (Weeks 3-5)

**Objective:** Test solution concepts with real users to identify the strongest approach.

```
VALIDATION ACTIVITIES:

1. PROTOTYPE TESTING
   For each concept, create a prototype (appropriate fidelity):
   - Concept test (low-fi): Paper sketch or verbal description
   - Usability test (medium-fi): Clickable wireframe or mockup
   - Value test (high-fi): Interactive prototype or Wizard of Oz

   Test with 5 users per concept:
   - Task success rate (can they use it?)
   - Value perception (is this useful?)
   - Preference (which concept do they prefer?)
   - Willingness to pay/adopt (would they actually use this?)

2. DEMAND TESTING (optional, for new products)
   - Landing page test: measure signup intent
   - Fake door test: add a button for the feature; measure clicks
   - Concierge test: deliver the value manually to 5-10 customers
   - Letter of intent: ask enterprise customers to sign a non-binding LOI

3. FEASIBILITY VALIDATION
   Engineering spike (1-3 days):
   - Can we build this with our current tech stack?
   - What are the hardest technical problems?
   - How long would it take? (rough estimate, not commitment)
   - What are the infrastructure requirements?

4. VIABILITY VALIDATION
   Business case assessment:
   - Market size: how many customers have this problem?
   - Revenue impact: what is the potential revenue from solving it?
   - Cost: what will it cost to build and maintain?
   - Strategic value: beyond revenue, what strategic benefit does this create?
```

**Key deliverable:** Validation results for each concept with clear winner or recommended direction.

### Phase 5: DECIDE (Weeks 5-6)

**Objective:** Make a clear, evidence-based decision about what to build (or not build).

```
DECISION ACTIVITIES:

1. SYNTHESIS
   Create a discovery summary document:

   DISCOVERY SUMMARY

   Opportunity: [Statement]
   Evidence: [Number of interviews, data analyses, prototypes tested]

   Key Findings:
   1. [Finding 1 — with evidence]
   2. [Finding 2 — with evidence]
   3. [Finding 3 — with evidence]

   Validated Assumptions:
   - [Assumption] — Validated by [evidence]

   Invalidated Assumptions:
   - [Assumption] — Invalidated by [evidence]

   Remaining Unknowns:
   - [Unknown] — Plan to resolve: [approach]

   Recommended Solution: [Concept X]
   Rationale: [Why this concept over alternatives]

   Confidence: [High/Medium/Low]
   - Value: [confidence that customers want this]
   - Usability: [confidence that customers can use this]
   - Feasibility: [confidence that we can build this]
   - Viability: [confidence that it works for the business]

2. DECISION MEETING
   Present the discovery summary to decision-makers:
   - 15 min: Present findings and recommendation
   - 15 min: Q&A
   - 15 min: Decision

   Possible decisions:
   [ ] BUILD — Proceed to PRD and Feature Launch Pattern
   [ ] ITERATE — Refine the concept; run additional validation
   [ ] PIVOT — Abandon this concept; explore a different opportunity
   [ ] KILL — Insufficient opportunity; do not invest further
   [ ] PARK — Good opportunity but not now; add to "Later" roadmap

3. TRANSITION TO DELIVERY
   If the decision is BUILD:
   - Write the PRD (using 05_specifications/prd_writing.md)
   - Assign to the Feature Launch Pattern
   - Transfer all discovery artifacts (interviews, prototypes, data) to the team
```

**Key deliverable:** Clear, documented decision with rationale and next steps.

---

## Metrics

| Metric | Measurement | Target |
|--------|-------------|--------|
| Discovery duration | Calendar days from frame to decision | 3-6 weeks |
| Evidence depth | Number of customer interviews conducted | 8-15 |
| Concept diversity | Number of distinct solution concepts explored | 3+ |
| Assumption validation | % of high-impact assumptions tested | > 80% |
| Decision clarity | Clear build/iterate/pivot/kill decision documented | 100% |
| Discovery-to-delivery handoff | Time from decision to PRD complete | < 1 week |

---

## Anti-Patterns

| Anti-Pattern | Description | Fix |
|-------------|-------------|-----|
| Fake discovery | Team already decided what to build; research is confirmation ritual | Pre-register hypotheses; genuinely test assumptions |
| Endless discovery | Discovery continues indefinitely without converging | Time-box each phase; define success criteria upfront |
| PM solo discovery | PM does all the research alone; team only sees the conclusion | Product trio participates in interviews and synthesis |
| Solution-first | Start with a solution and search for a problem it solves | Start with the opportunity statement; solutions come in Phase 3 |
| Ignoring disconfirming evidence | Evidence against the idea is dismissed or rationalized | Require documenting invalidated assumptions |
| Premature convergence | Jump to the first good idea without exploring alternatives | Mandate 3+ concepts before selecting |

---

## The Opportunity Solution Tree

```
         [DESIRED OUTCOME]
         "Increase team activation from 40% to 60%"
              │
    ┌─────────┼──────────┐
    │         │          │
[Opportunity] [Opportunity] [Opportunity]
"Teams do not "Teams cannot "First project
understand    find the     feels too
the value"    right        empty"
              template"
    │         │          │
 ┌──┼──┐   ┌──┼──┐    ┌──┼──┐
 S1 S2 S3  S4 S5 S6   S7 S8 S9

S1: Interactive onboarding tour
S2: Personalized welcome video
S3: Success story showcase
S4: AI template recommender
S5: Template categories redesign
S6: Community template gallery
S7: Pre-populated sample project
S8: Import wizard for existing data
S9: Guided first-project wizard
```

The tree ensures that you explore multiple opportunities and multiple solutions before committing to build.

---

## Cross-References

| Phase | Related Module |
|-------|---------------|
| Frame | `01_foundations/core_concepts.md` |
| Discover | `03_user_research/user_research_methods.md`, `03_user_research/competitive_analysis.md` |
| Ideate | `05_specifications/design_collaboration.md` |
| Validate | `06_metrics/experimentation.md` |
| Decide | `04_roadmapping/prioritization_frameworks.md` |

---

## Summary

The Product Discovery Pattern is a structured, time-boxed process for reducing uncertainty before committing engineering resources. Five phases — Frame, Discover, Ideate, Validate, Decide — move the team from an opportunity hypothesis to an evidence-based build/kill decision in 3-6 weeks. Framing establishes the opportunity, questions, and assumptions. Discovery develops deep customer understanding through interviews, data analysis, and competitive research. Ideation generates multiple solution concepts using the Opportunity Solution Tree. Validation tests concepts with prototypes, demand tests, and feasibility spikes. The Decision phase synthesizes all evidence into a clear recommendation. The most dangerous anti-pattern is fake discovery — going through the motions while the team has already decided what to build. Genuine discovery requires the intellectual honesty to follow the evidence, even when it contradicts the team's initial instinct.
