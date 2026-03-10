# Feature Launch Pattern

## Context

You have a validated feature (discovery complete, problem confirmed, solution designed) and need to bring it from concept to shipped product with measurable impact. This pattern applies to any feature launch, from a minor improvement to a major new capability.

---

## Problem

Feature launches fail in predictable ways: features ship without measurable outcomes, teams skip enablement so customers never discover the feature, rollouts cause incidents because they lack progressive deployment, and post-launch nobody evaluates whether the feature achieved its goals. The Feature Launch Pattern prevents these failures through a structured, repeatable process.

---

## Forces

- **Speed vs Safety:** Pressure to ship fast vs need to ship reliably
- **Completeness vs Iteration:** Desire to launch the "complete" feature vs launching an MVP and iterating
- **Internal alignment vs External communication:** Aligning many teams vs communicating to customers
- **Measurement vs Action:** Tracking metrics vs actually using them to improve
- **Autonomy vs Coordination:** Team independence vs cross-functional dependencies

---

## Solution Overview

The Feature Launch Pattern has six phases executed over 4-12 weeks depending on launch tier:

```
Phase 1: PLAN (Week 1-2)
Phase 2: BUILD (Week 2-8)
Phase 3: PREPARE (Week 6-8)
Phase 4: LAUNCH (Week 8-9)
Phase 5: MONITOR (Week 9-12)
Phase 6: EVALUATE (Week 12+)
```

---

## Execution

### Phase 1: PLAN (Weeks 1-2)

**Objective:** Align the team on what, why, how, and how we will measure success.

```
PLAN CHECKLIST:

[ ] PRD complete and reviewed by trio (PM, Design, Engineering)
[ ] Success metrics defined:
    - Primary metric (the one that determines success/failure)
    - Secondary metrics (additional signals)
    - Guardrail metrics (what must not degrade)
    - Targets set for each metric
[ ] Launch tier assigned (Tier 1/2/3/4)
[ ] GTM plan initiated (for Tier 1-2)
[ ] Timeline agreed with engineering
[ ] Dependencies identified and owners confirmed
[ ] Design specs complete or in progress
[ ] Analytics tracking plan drafted
[ ] Kill criteria defined (when to stop/pivot)
```

**Key deliverable:** Approved PRD with metrics, timeline, and launch tier.

### Phase 2: BUILD (Weeks 2-8)

**Objective:** Implement the feature with quality, behind a feature flag.

```
BUILD CHECKLIST:

[ ] Feature implemented behind feature flag
[ ] Feature flag targeting rules configured
[ ] Acceptance criteria verified (Given/When/Then scenarios pass)
[ ] Edge cases handled (empty states, errors, boundary conditions)
[ ] Performance targets met (latency, throughput)
[ ] Accessibility requirements met
[ ] Analytics events instrumented per tracking plan
[ ] QA completed (manual + automated)
[ ] Security review completed (if applicable)
[ ] Design review completed (implementation matches spec)
[ ] Documentation drafted (help docs, FAQ)
```

**Key deliverable:** Feature-complete, tested, behind a feature flag, instrumented for analytics.

### Phase 3: PREPARE (Weeks 6-8)

**Objective:** Prepare every team for the launch.

```
PREPARE CHECKLIST:

[ ] Beta program launched (for Tier 1-2):
    - Beta participants recruited
    - Feedback channels established
    - Beta results analyzed
    - Beta exit criteria met
[ ] Rollback plan documented and tested
[ ] Rollback criteria defined (automatic and manual triggers)
[ ] Monitoring dashboard built
[ ] Support team briefed; knowledge base updated
[ ] Sales team enabled (demo script, FAQ, objection handling)
[ ] CS team briefed (customer impact, communication plan)
[ ] Marketing assets created (blog, email, social)
[ ] Customer communication drafted (changelog, in-app announcement)
[ ] Launch day run-of-show finalized
```

**Key deliverable:** All teams ready; beta validated; rollback tested; communications prepared.

### Phase 4: LAUNCH (Weeks 8-9)

**Objective:** Execute the controlled rollout.

```
LAUNCH SEQUENCE:

Day 0 — Internal
[ ] Feature flag enabled for internal team
[ ] Internal dogfooding and final QA
[ ] Run-of-show confirmed with all teams

Day 1 — Canary
[ ] Feature flag enabled for 1-5% of users
[ ] Monitoring dashboard reviewed hourly
[ ] No rollback triggers fired

Day 2 — Expand
[ ] Expand to 25% of users
[ ] Monitor every 2 hours
[ ] Customer feedback channels monitored

Day 3-5 — Broad
[ ] Expand to 50%, then 100%
[ ] Publish blog post and changelog
[ ] Send email announcement (for Tier 1-2)
[ ] Activate in-app announcement
[ ] Notify sales and CS

Day 5-7 — Stabilize
[ ] Monitor daily
[ ] Address early feedback and bugs
[ ] Review initial adoption metrics
```

**Key deliverable:** Feature live for all users; communications published; monitoring active.

### Phase 5: MONITOR (Weeks 9-12)

**Objective:** Track adoption, performance, and customer feedback.

```
MONITOR CADENCE:

Week 1 post-launch: Daily monitoring
- Adoption rate vs target
- Error rates and performance
- Support ticket volume
- Customer feedback themes
- Any incidents or rollbacks

Week 2-4 post-launch: Weekly monitoring
- Adoption and activation trends
- Retention (are early adopters still using it?)
- Business metric impact (if applicable)
- Iterate based on feedback (quick fixes, UX improvements)
```

**Key deliverable:** Monitoring log with daily/weekly entries; issues identified and addressed.

### Phase 6: EVALUATE (Week 12+)

**Objective:** Determine if the feature achieved its goals and capture learnings.

```
EVALUATE TEMPLATE:

Feature: [Name]
Launch Date: [Date]
Review Date: [Date]

METRICS REVIEW:
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| [Primary] | [target] | [actual] | [pass/miss] |
| [Secondary] | [target] | [actual] | [pass/miss] |
| [Guardrail] | [threshold] | [actual] | [pass/miss] |

QUALITATIVE REVIEW:
- Top 3 positive feedback themes
- Top 3 negative feedback themes
- Unexpected use cases discovered

DECISION:
[ ] SUCCESS — Feature met targets; move to maintenance
[ ] PARTIAL — Iterate to close the gap (specific improvements)
[ ] MISS — Feature did not meet targets; analyze root cause
[ ] ROLLBACK — Feature is causing harm; remove or disable

PROCESS LEARNINGS:
- What went well in the launch process?
- What should improve for next launch?
- Updates to the Feature Launch Pattern?

NEXT STEPS:
1. [Action] — Owner: [name] — Due: [date]
2. [Action] — Owner: [name] — Due: [date]
```

**Key deliverable:** Post-launch review document; decision on feature fate; updated launch pattern.

---

## Metrics

| Metric | Measurement | Target |
|--------|-------------|--------|
| Time from plan to launch | Calendar days from PRD approval to 100% rollout | < 8 weeks for Tier 2; < 12 weeks for Tier 1 |
| Adoption rate | % of eligible users who try the feature in 30 days | > 20% for broad features; > 5% for niche features |
| Activation rate | % of adopters who complete the core workflow | > 50% |
| Retention rate | % of adopters who use the feature again in week 2+ | > 40% |
| Incident rate | Number of incidents during rollout | 0 P0/P1 incidents |
| Metric achievement | Primary metric vs target | Meet or exceed target |

---

## Anti-Patterns

| Anti-Pattern | Description | Fix |
|-------------|-------------|-----|
| Big-bang launch | Ship to 100% on day one without progressive rollout | Always use feature flags with canary/percentage rollout |
| Ship and forget | Feature launches, nobody tracks adoption or outcomes | Mandatory monitoring for 4 weeks + post-launch review |
| Perfect or nothing | Delay launch waiting for every edge case to be perfect | Launch MVP behind flag; iterate based on data |
| Silent launch | Great feature ships but nobody knows about it | Minimum communication: changelog + in-app announcement |
| No kill criteria | Team continues building even when metrics miss badly | Define kill criteria in the PRD before building |
| Enablement skip | Sales and support learn about the feature from customers | Mandatory enablement session for Tier 1-2 launches |

---

## Examples

### Example 1: B2B SaaS — New Reporting Feature

- **Plan:** PRD with outcome "increase reporting usage from 15% to 30% of teams"
- **Build:** 4 weeks behind feature flag; analytics instrumented
- **Prepare:** Beta with 10 accounts; sales demo script created
- **Launch:** Canary 5% -> 25% -> 100% over 3 days
- **Monitor:** Weekly dashboard review for 4 weeks
- **Evaluate:** Reporting usage reached 28% — close to target; iterated on template gallery

### Example 2: Consumer App — Social Sharing Feature

- **Plan:** PRD with outcome "increase viral coefficient from 0.3 to 0.5"
- **Build:** 3 weeks; A/B test infrastructure for share prompt variants
- **Prepare:** Internal dogfooding; marketing prepared social media content
- **Launch:** 50/50 A/B test launched to measure viral impact
- **Monitor:** Daily viral coefficient tracking for 2 weeks
- **Evaluate:** Viral coefficient reached 0.45 — shipped winning variant; iterated on share UX

---

## Cross-References

| Phase | Related Module |
|-------|---------------|
| Plan | `05_specifications/prd_writing.md` |
| Build | `04_roadmapping/backlog_management.md` |
| Prepare | `08_launch/gtm_strategy.md` |
| Launch | `08_launch/launch_execution.md` |
| Monitor | `06_metrics/product_metrics.md` |
| Evaluate | `eval/ProductScore.md` |

---

## Summary

The Feature Launch Pattern provides a six-phase playbook for bringing a validated feature from plan to measurable impact. Each phase has a clear objective, checklist, and deliverable. Progressive rollout (canary, percentage, full) controls risk. Post-launch monitoring ensures the feature is tracked for 4+ weeks. The post-launch review closes the loop by evaluating metrics against targets and capturing process learnings. The most important anti-pattern to avoid is "ship and forget" — where a feature launches without defined metrics, monitoring, or evaluation. Every feature launch is an investment; the evaluation phase determines the return.
