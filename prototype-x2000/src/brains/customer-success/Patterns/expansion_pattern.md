# Expansion Pattern

## Problem

Net Revenue Retention (NRR) is below target because the CS team either misses expansion opportunities entirely (customers expand through self-service without CS involvement, leaving money on the table) or attempts expansion conversations at the wrong time (when the customer has not yet achieved value, creating resentment). Industry benchmarks from KeyBanc and OpenView show that top-quartile SaaS companies achieve 120%+ NRR, while median companies achieve 100-110%. The difference is primarily driven by systematic expansion execution.

## Context

This pattern applies when:
- The product has multiple pricing vectors (seats, usage, features, modules)
- The customer has achieved demonstrable value from the current subscription
- There is a natural expansion path (more users, more features, higher tier)
- The CS team has visibility into customer usage and business outcomes

This pattern is most effective for:
- Customers who have completed onboarding and achieved first value
- Customers with a health score in the "healthy" or "champion" range
- Accounts where license utilization is high or usage is approaching plan limits
- Customers who have expressed satisfaction (NPS 8+, positive QBR feedback)

This pattern should NOT be applied to:
- At-risk customers (address churn risk first, then expand)
- Customers still in onboarding
- Customers who have open, unresolved P1/P2 issues

## Solution

### Expansion Signal Detection

Before any expansion conversation, identify and validate expansion signals:

```
Expansion Ready Signals (Strong)
├── License utilization > 80%
├── Usage consistently at or above plan limits
├── Customer proactively asking about higher-tier features
├── Multiple departments/teams requesting access
├── Customer achieving ROI and willing to document it
└── New executive stakeholder with broader mandate

Expansion Possible Signals (Moderate)
├── Feature adoption breadth > 70% of available features
├── Positive NPS trend (score increasing over 2+ surveys)
├── Customer expanding use cases beyond initial scope
├── Integration adoption (connecting to more tools)
├── User growth trending upward organically
└── Customer referencing future plans that align with product capabilities

Expansion Not Ready Signals (Block)
├── Health score declining
├── Open unresolved support escalations
├── Recent stakeholder departure without replacement
├── Usage declining or stagnant
├── Customer has expressed dissatisfaction in last 90 days
└── Renewal is at risk
```

### The Expansion Conversation Framework

**Step 1: Value Documentation (Before the Conversation)**

Before any expansion discussion, document the value the customer has achieved:

| Value Dimension | Baseline (Pre-Product) | Current | Improvement |
|----------------|----------------------|---------|-------------|
| [Key metric 1] | [Before value] | [After value] | [% improvement] |
| [Key metric 2] | [Before value] | [After value] | [% improvement] |
| Time saved | [Before hours] | [After hours] | [Hours/week saved] |
| Revenue impact | [Before] | [After] | [$ impact] |

**Step 2: The Expansion Conversation (Structure)**

1. **Value review** (10 min): "Here's what we've achieved together." Present the value documentation. Let the customer confirm and add their own perspective.
2. **Future vision** (10 min): "What are your priorities for the next 6-12 months?" Understand the customer's evolving needs and strategic direction.
3. **Gap identification** (10 min): "Based on your goals, here's where I see opportunities." Connect the customer's future needs to product capabilities they are not using.
4. **Solution mapping** (10 min): "Here's how [product capability] would help you achieve [their stated goal]." Frame expansion in terms of the customer's outcomes, not product features.
5. **Next steps** (5 min): If interest, connect with account executive for commercial discussion. If not ready, note the signals and revisit in 60-90 days.

**Critical rule**: The CSM identifies and qualifies the opportunity. The AE owns the commercial negotiation. Mixing these roles damages the trusted advisor relationship.

### Expansion Playbooks by Type

**Seat/License Expansion:**
- Trigger: License utilization > 80% for 30+ days
- Signal: New team members requesting access, organic user growth
- Conversation: "You're getting great adoption. Your team has grown to [X] active users against [Y] licenses. Let's make sure everyone who needs access has it."

**Tier/Plan Upgrade:**
- Trigger: Customer consistently using features near their plan limit or requesting gated features
- Signal: Support tickets about plan limitations, feature request for higher-tier capabilities
- Conversation: "Based on your usage patterns, you'd benefit from [feature in higher tier]. Here's the business case..."

**Module/Product Expansion:**
- Trigger: Customer has mature adoption of current module and has expressed needs that align with another module
- Signal: QBR discussion of adjacent problems, champion expressing interest
- Conversation: "You've achieved [outcome] with [current module]. The challenge you described with [adjacent problem] is exactly what [other module] solves. Shall I show you?"

**Usage-Based Expansion:**
- Trigger: Usage approaching or exceeding current plan limits
- Signal: API call volume, data volume, transaction count trending toward cap
- Conversation: Proactive notification before overage, offer right-sized plan

### Expansion Timing

| Lifecycle Stage | Expansion Readiness | Recommended Action |
|----------------|--------------------|--------------------|
| Day 0-30 | Not ready | Focus on onboarding, do not discuss expansion |
| Day 30-90 | Emerging | Plant seeds: mention capabilities, share case studies |
| Day 90-180 | Ready (if healthy) | Active expansion qualification and conversation |
| Day 180-365 | Prime | Full expansion execution, tie to renewal/strategic planning |
| Renewal window | Depends | Bundle expansion with renewal if healthy; do not if at risk |

### CS-Sales Handoff for Expansion

The expansion handoff must be seamless to avoid disrupting the customer relationship:

1. **CSM qualifies**: Validates expansion signals, documents value achieved, identifies specific opportunity
2. **Internal alignment**: CSM briefs AE on customer context, opportunity, and relationship dynamics
3. **Warm introduction**: CSM introduces AE to customer as "our expert on [pricing/packaging/commercial]"
4. **Joint meeting**: CSM + AE meet with customer. CSM leads value discussion, AE leads commercial discussion
5. **CSM remains primary contact**: After expansion closes, CSM remains the relationship owner

## Metrics

| Metric | Target | Calculation |
|--------|--------|------------|
| Net Revenue Retention (NRR) | > 110% (good), > 120% (excellent) | (Starting ARR + Expansion - Contraction - Churn) / Starting ARR |
| Expansion ARR | [Company-specific target] | Total new ARR from existing customers |
| Expansion rate | > 20% of customer base/year | Customers who expanded / Total customers |
| Average expansion deal size | [Track and grow over time] | Total expansion ARR / Number of expansion deals |
| Expansion cycle time | < 30 days from qualified to closed | Days from qualified opportunity to closed deal |
| Expansion win rate | > 60% | Closed expansion deals / Qualified expansion opportunities |

## Consequences

**Benefits:**
- Systematic expansion execution drives NRR from 100-105% to 115-125%
- Value-first expansion conversations strengthen rather than damage the CS relationship
- Expansion signals provide leading indicators of customer health and satisfaction
- Structured CS-Sales handoff prevents relationship disruption

**Trade-offs:**
- Expansion conversations feel "salesy" if value has not been established first
- CSMs may resist expansion responsibility if it is not part of their compensation model
- Premature expansion attempts (before value is achieved) damage trust
- Requires investment in usage analytics and health scoring infrastructure

## Related Patterns

- **Onboarding Pattern**: Successful onboarding is a prerequisite for expansion
- **Churn Prevention Pattern**: At-risk accounts must be stabilized before expansion
