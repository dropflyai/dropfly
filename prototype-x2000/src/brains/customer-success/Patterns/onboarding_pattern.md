# Onboarding Pattern

## Problem

New customers fail to achieve their initial value milestones, leading to low adoption, early disengagement, and elevated churn risk during the first 90 days. Research from TSIA and Gainsight consistently shows that customers who do not achieve time-to-first-value within the first 30-60 days have 2-3x higher churn rates than those who do. Yet most onboarding programs are provider-centric (focused on product training) rather than customer-centric (focused on outcome achievement).

## Context

This pattern applies when:
- A SaaS or subscription product requires setup, configuration, or behavioral change to deliver value
- The customer has defined desired outcomes at the point of sale
- There is a measurable "first value" milestone that can be tracked
- The time from contract signing to first value is more than 1 day

This pattern applies across all segments, with implementation varying by engagement model:
- **High-touch**: Dedicated onboarding manager, live sessions, white-glove support
- **Low-touch**: Guided self-service, email nurture sequences, office hours
- **Tech-touch**: In-app guidance, automated checklists, video tutorials

## Solution

### The Onboarding Framework

```
Phase 1: Kickoff (Day 0-3)
├── Welcome communication (personalized by segment)
├── Stakeholder mapping (who are the decision-maker, champion, end-users?)
├── Success criteria alignment (what does "success" look like for THIS customer?)
├── Implementation timeline agreement
└── Handoff from sales to CS (context transfer)

Phase 2: Technical Setup (Day 3-14)
├── Account configuration
├── Data migration (if applicable)
├── Integration setup
├── User provisioning
└── Technical validation (smoke test that setup is correct)

Phase 3: Value Activation (Day 14-30)
├── First value milestone achievement
├── Core workflow adoption (the workflow that delivers primary value)
├── Key user training (champion and admin users)
└── Quick win celebration (acknowledge first success)

Phase 4: Adoption Expansion (Day 30-90)
├── Expand beyond initial use case
├── End-user training and enablement
├── Secondary feature adoption
├── Establish ongoing engagement cadence (QBR scheduling)
└── Formal onboarding completion and health check
```

### Implementation by Engagement Model

| Phase | High-Touch | Low-Touch | Tech-Touch |
|-------|-----------|-----------|-----------|
| Kickoff | Live 60-min call, dedicated CSM | 30-min group onboarding call | Automated welcome email sequence |
| Technical Setup | CSM-guided, shared project plan | Self-service with email checkpoints | In-app setup wizard |
| Value Activation | Live training sessions | Office hours + recorded training | Interactive product tours |
| Adoption Expansion | Bi-weekly check-in calls | Monthly email check-ins | In-app feature discovery prompts |

### Success Milestones

Define 3-5 measurable milestones that indicate the customer is on track:

| Milestone | Target Timeline | Measurement | Escalation if Missed |
|-----------|----------------|-------------|---------------------|
| Account activated | Day 1 | Login completed | Automated reminder + CSM alert |
| Core integration live | Day 7 | Integration status = active | CSM outreach |
| First value action | Day 14 | [Primary value action] completed | CSM intervention call |
| 3+ active users | Day 21 | User count >= 3 | Enablement offer |
| Onboarding complete | Day 30-60 | All milestones achieved | Escalation to CS leadership |

### Handoff Protocol (Sales to CS)

The sales-to-CS handoff is the highest-risk transition in the customer lifecycle. A structured handoff must include:

1. **Customer profile**: Company, industry, size, key contacts
2. **Deal context**: Why they bought, what they evaluated, what they were promised
3. **Success criteria**: The outcomes the customer expects to achieve
4. **Timeline expectations**: Any deadlines or commitments made during sales
5. **Red flags**: Any concerns raised during the sales process
6. **Champion profile**: Who is the internal advocate, what motivates them

## Metrics

| Metric | Target | Calculation |
|--------|--------|------------|
| Time to first value (TTFV) | < 14 days | Days from contract to first value milestone |
| Onboarding completion rate | > 90% | Customers completing all milestones / total new customers |
| 90-day retention rate | > 95% | Customers active at day 90 / customers started onboarding |
| Adoption rate at day 30 | > 70% | Customers using core feature daily at day 30 |
| Onboarding CSAT | > 4.5/5 | Post-onboarding survey score |
| Time to onboarding complete | < 30 days (SMB), < 60 days (enterprise) | Days from contract to onboarding complete milestone |

## Consequences

**Benefits:**
- Reduced time-to-value correlates with 25-40% lower churn in the first year
- Structured handoff prevents "we were promised X" misalignments
- Milestone tracking provides early warning when customers stall
- Scalable across segments with appropriate touch model

**Trade-offs:**
- High-touch onboarding is expensive ($500-2000 per customer in CSM time)
- Tech-touch onboarding requires significant upfront product investment
- Overly rigid onboarding can frustrate sophisticated customers who want to self-direct
- Milestone definitions require ongoing calibration as the product evolves

## Related Patterns

- **Churn Prevention Pattern**: Customers who fail onboarding are the primary input to churn prevention
- **Expansion Pattern**: Successful onboarding creates the foundation for expansion conversations
