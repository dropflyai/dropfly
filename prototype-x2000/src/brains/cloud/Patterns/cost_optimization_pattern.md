# Cost Optimization Pattern — Systematic Cloud Cost Reduction

## Problem Statement

Cloud costs grow organically as teams provision resources, experiment with services, and scale applications. Without a systematic optimization process, waste accumulates: idle resources, oversized instances, unoptimized storage, and missed commitment discounts. This pattern provides a repeatable process for identifying, prioritizing, and implementing cloud cost savings on a quarterly cadence.

---

## Context

Apply this pattern when:
- Conducting quarterly cloud cost reviews
- Cloud spend exceeds budget or growth rate exceeds revenue growth
- New cost optimization tools or strategies become available
- After significant architecture changes that affect cost profile
- When unit economics (cost per transaction, cost per user) are trending unfavorably

---

## Solution — Cost Optimization Process

### Phase 1: Cost Visibility (Week 1)

**1.1 Gather Data**
- Export last 3 months of cost data from AWS Cost Explorer
- Break down by: service, account, team (tag), environment, region
- Calculate month-over-month growth rate
- Identify top 10 cost drivers (services consuming >5% of total spend)
- Calculate unit economics (cost per transaction, cost per MAU)

**1.2 Identify Anomalies**
- Services with >20% month-over-month growth (investigate)
- Untagged resources (cannot be attributed — tag or terminate)
- Spend in unexpected regions (may indicate misconfiguration or attack)
- Services with zero or near-zero usage but ongoing cost (idle resources)

**1.3 Benchmark**
- Compare unit economics against previous quarters
- Compare infrastructure cost ratio against industry benchmarks
- Compare reserved/spot coverage against targets

### Phase 2: Identify Optimization Opportunities (Week 2)

**2.1 Quick Wins (Immediate, No Architecture Change)**

| Opportunity | Typical Savings | Effort |
|------------|----------------|--------|
| Terminate idle resources | 5-15% | Low |
| Right-size oversized instances | 10-30% | Low |
| Delete unattached EBS volumes | 1-5% | Low |
| Release unused Elastic IPs | <1% | Trivial |
| Stop dev/staging outside hours | 5-10% | Low |
| Enable S3 Intelligent-Tiering | 2-5% on storage | Low |
| Switch gp2 to gp3 EBS volumes | 20% on EBS | Low |
| Use Graviton (ARM) instances | 20% on compute | Medium |

**2.2 Medium-Term Optimizations (1-4 Weeks, Minor Changes)**

| Opportunity | Typical Savings | Effort |
|------------|----------------|--------|
| Purchase/adjust Savings Plans | 20-40% on covered compute | Medium |
| Implement Spot for fault-tolerant workloads | 60-90% on batch compute | Medium |
| Add caching layer (ElastiCache/CloudFront) | 20-50% on origin compute | Medium |
| Optimize DynamoDB capacity mode | 10-30% on DynamoDB | Medium |
| Configure S3 lifecycle policies | 30-80% on archived storage | Medium |
| VPC endpoints to replace NAT Gateway | 50%+ on NAT costs | Medium |

**2.3 Strategic Optimizations (Quarters, Architecture Changes)**

| Opportunity | Typical Savings | Effort |
|------------|----------------|--------|
| Migrate to serverless where appropriate | 30-70% for spiky workloads | High |
| Re-architect data layer (right database for right workload) | Variable | High |
| Multi-region optimization (reduce cross-region transfer) | 10-20% on networking | High |
| Implement CQRS (separate read/write scaling) | 20-40% on database | High |

### Phase 3: Prioritize and Plan (Week 3)

**Prioritization Matrix:**

| Priority | Criteria | Action |
|----------|---------|--------|
| P0 | >$5K/month savings, <1 day effort | Implement immediately |
| P1 | >$2K/month savings, <1 week effort | Implement this quarter |
| P2 | >$1K/month savings, <1 month effort | Plan for next quarter |
| P3 | <$1K/month savings | Backlog, implement opportunistically |

**Create Action Plan:**

| # | Optimization | Expected Savings | Owner | Deadline | Status |
|---|-------------|-----------------|-------|----------|--------|
| 1 | [Action] | [$X/month] | [Name] | [Date] | [Status] |

### Phase 4: Implement and Verify (Weeks 3-4)

For each optimization:
1. Implement change in non-production first
2. Verify functionality is not affected
3. Apply to production
4. Monitor for 1 week to confirm savings
5. Document actual savings vs expected

### Phase 5: Report and Iterate

**Quarterly Cost Optimization Report:**

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Total monthly cloud spend | $X | $Y | -Z% |
| Cost per transaction | $X | $Y | -Z% |
| Savings Plan coverage | X% | Y% | +Z% |
| Idle resource spend | $X | $Y | -Z% |
| Total savings realized | | $X/month | |

---

## Verification

This pattern is correctly applied when:
- Quarterly cost reviews are conducted on schedule
- Identified savings are implemented and verified
- Unit economics are trending favorably (or stable with growth)
- Savings Plan/RI coverage meets target (>70% of steady-state)
- Idle resource spend is <5% of total

---

## Anti-Patterns

| Anti-Pattern | Risk | Correct Approach |
|-------------|------|-----------------|
| Optimize once, never again | Savings erode as new resources are provisioned | Quarterly cadence |
| Only optimize compute | Storage, networking, and data transfer are significant costs | Optimize all cost categories |
| Sacrifice reliability for cost | Outages cost more than the savings | Cost optimization within SLO constraints |
| Over-commit on reservations | Locked into capacity you do not need | Start conservative (50-70% of baseline), increase gradually |
| Ignore unit economics | Absolute cost is misleading during growth | Track cost per business unit |

---

## Cross-References

- `07_cost/cost_optimization.md` — Technical optimization strategies
- `07_cost/cost_management.md` — Organizational cost governance
- `07_cost/cost_architecture.md` — Cost-aware architecture decisions
- `Templates/cost_review_template.md` — Cost review output format
- `06_reliability/site_reliability.md` — SLO constraints on cost optimization
