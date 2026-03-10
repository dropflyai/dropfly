# Price Change Execution Pattern

> A structured pattern for planning, communicating, and executing price changes -- increases, decreases, or restructuring -- while minimizing churn and maximizing revenue capture.

---

## Context

This pattern applies when you need to change your pricing -- whether increasing prices, decreasing prices, restructuring tiers, or changing the pricing model entirely. Price changes are among the highest-impact business decisions and the most poorly executed.

**Use this pattern for:**
- Annual or periodic price increases
- Price decreases in response to competitive pressure
- Pricing model changes (e.g., per-seat to usage-based)
- Tier restructuring or consolidation
- New feature monetization within existing plans
- Grandfathering decisions for existing customers

---

## Challenge

Price changes fail when they are communicated poorly, implemented abruptly, or lack strategic rationale. The most common failure: companies lose more customers to poor communication about a price change than to the price change itself. This pattern ensures the change is strategically sound, well-communicated, and operationally clean.

---

## Phase 1: Strategic Analysis (Weeks 1-3)

### 1.1 Price Change Justification

Before changing prices, answer these questions:

| Question | Answer Required |
|----------|----------------|
| Why are we changing price? | Cost increase, value increase, competitive repositioning, margin improvement |
| What is the revenue impact model? | Projected revenue change accounting for expected churn |
| What is the churn risk? | Estimated % of customers who will churn at various price points |
| What is the competitive context? | How does this change position us vs. competitors? |
| What is the value justification? | What additional value supports the new price? |
| What is the timeline pressure? | Is there a financial deadline driving the change? |

### 1.2 Impact Modeling

**Revenue impact formula:**

```
New Revenue = (Current Customers x Retention Rate x New Price) + New Customer Revenue
Net Impact = New Revenue - Current Revenue
```

**Scenario modeling:**

| Scenario | Price Change | Expected Retention | Revenue Impact | Margin Impact |
|----------|-------------|-------------------|----------------|---------------|
| Conservative | +X% | -Y% retention | $_____ | $_____ |
| Base case | +X% | -Y% retention | $_____ | $_____ |
| Aggressive | +X% | -Y% retention | $_____ | $_____ |

### 1.3 Customer Segmentation for Impact

| Segment | Size | Current ARPU | Price Sensitivity | Churn Risk | Strategy |
|---------|------|-------------|-------------------|-----------|----------|
| Enterprise | | $ | LOW | LOW | Full price increase |
| Mid-market | | $ | MEDIUM | MEDIUM | Phased increase |
| SMB | | $ | HIGH | HIGH | Grandfathered or smaller increase |
| At-risk | | $ | CRITICAL | CRITICAL | No change or added value |

### 1.4 Competitive Price Positioning

| Competitor | Their Price | Our Current | Our New Price | Position |
|-----------|------------|------------|--------------|----------|
| | $ | $ | $ | [ ] Below [ ] At Parity [ ] Above |
| | $ | $ | $ | [ ] Below [ ] At Parity [ ] Above |
| | $ | $ | $ | [ ] Below [ ] At Parity [ ] Above |

---

## Phase 2: Grandfathering and Transition Strategy (Weeks 3-4)

### 2.1 Grandfathering Decision Framework

| Approach | Best For | Risk |
|----------|---------|------|
| No grandfathering | Small price changes (<10%), strong value add | Higher short-term churn |
| Time-limited grandfather | Medium changes (10-25%), loyal customers | Complexity, delayed revenue |
| Permanent grandfather on current tier | Large changes (>25%), churn-sensitive segments | Permanent revenue discount |
| Grandfather with sunset | All sizes, balanced approach | Customer expectation management |

### 2.2 Transition Timeline

| Customer Type | Notification Lead Time | Effective Date | Grace Period |
|--------------|----------------------|---------------|-------------|
| Monthly billing | 30-60 days notice | Next billing cycle + 1 | None to 1 cycle |
| Annual billing | 60-90 days notice | Next renewal date | None |
| Enterprise (custom) | 90+ days notice | Contract renewal | Negotiate |
| New customers | Immediately | Effective date | None |

### 2.3 Migration Path Design

For each customer segment, define:
- What their current plan looks like.
- What their new plan will look like.
- What the price difference is (absolute and percentage).
- What additional value they receive at the new price (if any).
- What options they have (accept, downgrade, negotiate, leave).

---

## Phase 3: Communication Strategy (Weeks 4-6)

### 3.1 Communication Principles

- **Lead with value, not price.** Explain what they are getting, not what they are paying.
- **Be transparent.** State the change clearly. Do not hide it in footnotes.
- **Give adequate notice.** The more significant the change, the more lead time.
- **Offer options.** Customers who feel trapped churn. Customers with choices stay.
- **Personalize.** Show the specific impact on their account, not generic messaging.

### 3.2 Communication Sequence

| Timing | Channel | Audience | Content |
|--------|---------|----------|---------|
| T-60 days | Email (personal) | Enterprise and high-value | Personal outreach with specific impact |
| T-45 days | Email (branded) | All affected customers | Announcement with value framing |
| T-30 days | In-app notification | All affected customers | Reminder with FAQ link |
| T-14 days | Email reminder | All affected customers | Final reminder with action items |
| T-0 | Billing change | All affected customers | Price change takes effect |
| T+7 days | Follow-up | Customers who contacted support | Thank you and feedback collection |

### 3.3 Message Framework

**Structure for price increase communication:**

1. **Appreciation** -- Thank them for being a customer.
2. **Value delivered** -- Remind them what they have received (features shipped, outcomes delivered).
3. **Investment context** -- Briefly explain why prices are changing (continued investment, new features, market conditions).
4. **Specific change** -- State the new price clearly.
5. **Timeline** -- When the change takes effect.
6. **Options** -- What they can do (accept, downgrade, contact sales).
7. **Support** -- How to get help or ask questions.

### 3.4 Internal Alignment

Before customer communication:
- [ ] Sales team briefed with talk track and objection handling.
- [ ] Customer success team briefed with retention plays.
- [ ] Support team briefed with FAQ and escalation path.
- [ ] Billing/finance prepared for system changes.
- [ ] Legal approved all customer-facing communication.
- [ ] Product team prepared to highlight value additions.

---

## Phase 4: Execution (Weeks 6-10)

### 4.1 Technical Implementation

- [ ] Billing system updated with new prices.
- [ ] Grandfathered customers flagged correctly.
- [ ] New customer pricing live on website.
- [ ] Pricing page updated.
- [ ] In-app pricing displays updated.
- [ ] API pricing endpoints updated (if applicable).
- [ ] Invoice templates updated.
- [ ] Automated email sequences configured.

### 4.2 Monitoring During Rollout

**Daily monitoring (first 14 days):**

| Metric | Threshold | Escalation |
|--------|----------|-----------|
| Support ticket volume (pricing-related) | >2x normal | Reinforce support team |
| Cancellation requests | >X% of segment | Review retention offers |
| Downgrade requests | >X% of segment | Assess tier design |
| Negative sentiment (social, reviews) | Trending negative | PR/comms response |
| NPS impact | Drop >10 points | Executive review |

### 4.3 Retention Playbook

Prepare retention offers for at-risk customers:

| Offer Tier | Eligibility | Offer | Approval |
|-----------|------------|-------|----------|
| Tier 1 | High LTV, low churn risk | No offer needed | N/A |
| Tier 2 | Medium LTV, moderate risk | Extended grandfather (3-6 months) | CS Manager |
| Tier 3 | High LTV, high churn risk | Custom pricing, locked rate for 12 months | VP Sales |
| Tier 4 | Low LTV, high churn risk | Let churn (acceptable loss) | CS Manager |

---

## Phase 5: Measurement and Learning (Weeks 10-16)

### 5.1 Success Metrics

Measure at 30, 60, and 90 days post-change:

| Metric | Target | 30-Day | 60-Day | 90-Day |
|--------|--------|--------|--------|--------|
| Net revenue change | +X% | | | |
| Customer retention | >Y% | | | |
| ARPU change | +$Z | | | |
| Downgrade rate | <X% | | | |
| Support ticket volume | Return to baseline | | | |
| NPS score | Within 5 points of baseline | | | |

### 5.2 Post-Change Review

Conduct a retrospective at 90 days:
- Did revenue impact match the model?
- Was churn within acceptable range?
- Did communication strategy work?
- What would we do differently next time?
- Are there segments that need further adjustment?

---

## Anti-Patterns

| Anti-Pattern | Consequence | Better Approach |
|-------------|-------------|-----------------|
| Surprise price increases | Massive churn, trust destruction | 30-60 day advance notice minimum |
| Hiding the change | Customers discover at billing, feel deceived | Transparent, direct communication |
| No value justification | Customers see only cost, not value | Lead with value delivered and planned |
| One-size-fits-all increase | Lose price-sensitive segments unnecessarily | Segment-specific strategies |
| No retention playbook | CS team unprepared for objections | Pre-built retention offers with approval tiers |
| Changing price and model simultaneously | Too many variables, confusing | Change one thing at a time |

---

## References

- `Templates/price_change_template.md` -- Customer communication templates
- `Templates/pricing_strategy_template.md` -- Strategic pricing framework
- `02_strategy/` -- Pricing strategy foundations
- `04_psychology/` -- Price perception and anchoring

---

*Pattern version: 1.0*
*Brain: Pricing Brain*
*Cross-brain dependencies: Marketing Brain (communication), Sales Brain (retention plays), Engineering Brain (billing system), Customer Success Brain (retention)*
