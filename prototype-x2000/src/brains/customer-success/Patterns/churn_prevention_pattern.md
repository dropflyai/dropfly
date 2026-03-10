# Churn Prevention Pattern

## Problem

Customer churn is detected too late for effective intervention. By the time a customer announces non-renewal (typically 30-60 days before contract end), the decision has already been made and the relationship dynamics have shifted from collaborative to adversarial. Industry data from TSIA and Gainsight shows that 80% of churn decisions are made 3-6 months before the renewal date, meaning that interventions in the final 30 days save fewer than 10% of churning accounts.

## Context

This pattern applies when:
- The business operates on a recurring revenue model (SaaS, subscription)
- Customer retention is a strategic priority (GRR target > 90%)
- There is sufficient customer behavioral data to detect early warning signals
- The CS team has capacity for proactive intervention (not fully reactive)

This pattern is most effective for:
- Mid-market and enterprise customers with sufficient data and relationship depth
- Customers 3+ months into their lifecycle (post-onboarding)
- Accounts with ARR sufficient to justify intervention cost

## Solution

### The Early Warning System

Churn prevention begins 6+ months before renewal with continuous monitoring:

```
Risk Detection (Continuous)
├── Behavioral signals (usage decline, feature abandonment, login drop)
├── Relationship signals (champion departure, stakeholder silence, meeting declines)
├── Support signals (escalation frequency, ticket sentiment, unresolved issues)
├── Financial signals (late payments, discount requests, downgrade inquiries)
└── Market signals (competitor evaluation, RFP activity, analyst inquiries)

Risk Assessment (When Signal Detected)
├── Health score review (composite score and individual components)
├── Usage trend analysis (30/60/90-day trends)
├── Stakeholder mapping (who is engaged, who has disengaged)
├── Value realization check (has the customer achieved stated outcomes?)
└── Contract context (renewal date, auto-renew status, pricing history)

Intervention Selection (Based on Risk Profile)
├── Proactive outreach (early engagement before formal risk)
├── Executive sponsor engagement (when stakeholder access is needed)
├── Value reinforcement (when customer has forgotten/lost sight of value)
├── Remediation plan (when specific issues need resolution)
└── Strategic rescue (when churn decision is being actively considered)
```

### Intervention Playbooks by Risk Profile

**Profile 1: Usage Decline (most common)**

| Signal | Intervention | Owner | Timeline |
|--------|-------------|-------|----------|
| Usage down 10-20% (30-day) | Proactive check-in email with usage insights | CSM | Within 1 week |
| Usage down 20-40% (30-day) | Live call to understand change, offer enablement | CSM | Within 48 hours |
| Usage down 40%+ (30-day) | Executive escalation, remediation plan | CSM + CS Leader | Within 24 hours |
| Zero usage for 14+ days | Urgent outreach, offer concierge reactivation | CSM + Support | Immediately |

**Profile 2: Champion Departure**

| Signal | Intervention | Owner | Timeline |
|--------|-------------|-------|----------|
| Champion leaves company | Identify new champion candidate | CSM | Within 1 week |
| New stakeholder identified | Executive introduction, value re-presentation | CSM + CS Leader | Within 2 weeks |
| No champion identified | Account review, executive bridge to sponsor | CS Leader + Exec | Within 3 weeks |

**Profile 3: Support Escalation Pattern**

| Signal | Intervention | Owner | Timeline |
|--------|-------------|-------|----------|
| 2+ escalations in 30 days | CSM proactive call, acknowledge frustration | CSM | Within 24 hours |
| 3+ escalations in 60 days | Executive engagement, formal remediation plan | CS Leader | Within 48 hours |
| Unresolved P1 for 7+ days | VP-level escalation, engineering priority request | VP CS | Immediately |

### The Rescue Meeting Framework

When a customer is actively considering churning, the rescue meeting follows this structure:

1. **Acknowledge** (5 min): "We understand you're frustrated. Here is what we've heard."
2. **Listen** (15 min): Let the customer articulate every issue without defending or interrupting
3. **Validate** (5 min): Summarize what you heard and confirm you have the full picture
4. **Present remediation** (10 min): Specific, time-bound actions with named owners
5. **Negotiate success criteria** (10 min): "If we accomplish [these things] by [this date], would that address your concerns?"
6. **Follow-up commitment** (5 min): Schedule the next check-in within 2 weeks

### Save Offer Guidelines

When remediation is insufficient and a commercial save is necessary:

| Offer Type | When Appropriate | Approval |
|-----------|-----------------|----------|
| Extended trial of premium feature | Customer needs more time to evaluate value | CSM |
| Temporary discount (1 quarter) | Pricing is the stated objection, but usage is healthy | CS Leader |
| Contract restructure | Customer needs fewer seats or different plan | VP CS + Finance |
| Free professional services | Implementation was inadequate, customer needs help | VP CS |
| Executive commitment | Customer needs confidence in the relationship | Executive sponsor |

**Save offer anti-patterns:**
- Never lead with a discount (it teaches customers that threatening to churn gets them a deal)
- Never offer a save before understanding the root cause
- Never make commitments you cannot keep (this accelerates churn after the next disappointment)

## Metrics

| Metric | Target | Calculation |
|--------|--------|------------|
| Gross revenue retention (GRR) | > 90% (good), > 95% (excellent) | (Starting ARR - Churn - Contraction) / Starting ARR |
| Logo retention rate | > 85% (good), > 90% (excellent) | Retained customers / Total customers at period start |
| Save rate | > 30% | Saved accounts / Total at-risk accounts that received intervention |
| Intervention lead time | > 90 days before renewal | Average days between first risk signal and renewal date |
| Risk detection accuracy | > 70% | Actually churned from predicted at-risk / Total predicted at-risk |
| Time from signal to intervention | < 48 hours | Hours from risk signal to first customer contact |

## Consequences

**Benefits:**
- Early detection provides 3-6 months of intervention runway instead of 30 days
- Structured playbooks ensure consistent response regardless of which CSM handles the account
- Save rate data feeds back into product and onboarding improvements
- Reduces "surprise churn" that undermines forecasting accuracy

**Trade-offs:**
- False positive risk signals waste CSM time on healthy accounts
- Aggressive intervention can feel intrusive to customers who are simply busy
- Save offers can create moral hazard (customers threaten churn for discounts)
- Requires investment in behavioral data infrastructure and health scoring

## Related Patterns

- **Onboarding Pattern**: Failed onboarding is the leading cause of early churn
- **Expansion Pattern**: Successful churn prevention creates stability for expansion conversations
