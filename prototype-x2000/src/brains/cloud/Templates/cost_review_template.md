# Cloud Cost Review Template

## Quarterly Cloud Cost Review: [Q# YYYY]

**Review Date:** [YYYY-MM-DD]
**Review Period:** [YYYY-MM-DD] to [YYYY-MM-DD]
**Prepared By:** [Name / Team]
**Reviewed By:** [Name / VP Engineering / Finance]
**Status:** [Draft | Under Review | Final | Presented]

---

## 1. Executive Summary

[2-3 paragraphs summarizing key findings. Include: total spend, growth rate, largest cost drivers, key optimizations implemented, and recommended actions. This section should be understandable by a non-technical CFO.]

**Key Numbers:**

| Metric | Value | vs Last Quarter | vs Budget |
|--------|-------|----------------|-----------|
| Total Cloud Spend | $[X] | [+/-X%] | [+/-X% over/under] |
| Monthly Run Rate | $[X/month] | [+/-X%] | |
| Cost per Transaction | $[X] | [+/-X%] | |
| Cost per MAU | $[X] | [+/-X%] | |
| Savings Realized | $[X] | | |
| Waste Identified | $[X] | | |

---

## 2. Cost Breakdown by Service

### Top 10 Services by Spend

| Rank | Service | Monthly Spend | % of Total | MoM Growth | Notes |
|------|---------|--------------|-----------|-----------|-------|
| 1 | [e.g., EC2] | $[X] | [X%] | [+/-X%] | [Context] |
| 2 | [e.g., RDS] | $[X] | [X%] | [+/-X%] | [Context] |
| 3 | [e.g., S3] | $[X] | [X%] | [+/-X%] | [Context] |
| 4 | [e.g., CloudFront] | $[X] | [X%] | [+/-X%] | [Context] |
| 5 | [e.g., Lambda] | $[X] | [X%] | [+/-X%] | [Context] |
| 6 | [e.g., DynamoDB] | $[X] | [X%] | [+/-X%] | [Context] |
| 7 | [e.g., ECS/Fargate] | $[X] | [X%] | [+/-X%] | [Context] |
| 8 | [e.g., ElastiCache] | $[X] | [X%] | [+/-X%] | [Context] |
| 9 | [e.g., NAT Gateway] | $[X] | [X%] | [+/-X%] | [Context] |
| 10 | [e.g., Data Transfer] | $[X] | [X%] | [+/-X%] | [Context] |
| | **All Others** | $[X] | [X%] | | |
| | **Total** | **$[X]** | **100%** | | |

### Service Cost Trend (3-Month)

| Service | Month 1 | Month 2 | Month 3 | Trend |
|---------|---------|---------|---------|-------|
| [Service 1] | $[X] | $[X] | $[X] | [Up/Down/Stable] |
| [Service 2] | $[X] | $[X] | $[X] | [Up/Down/Stable] |
| [Service 3] | $[X] | $[X] | $[X] | [Up/Down/Stable] |

---

## 3. Cost Breakdown by Team / Product

| Team / Product | Monthly Spend | % of Total | MoM Growth | Budget | Variance |
|---------------|--------------|-----------|-----------|--------|----------|
| [Team A — Product X] | $[X] | [X%] | [+/-X%] | $[X] | [+/-X%] |
| [Team B — Product Y] | $[X] | [X%] | [+/-X%] | $[X] | [+/-X%] |
| [Team C — Platform] | $[X] | [X%] | [+/-X%] | $[X] | [+/-X%] |
| [Shared / Untagged] | $[X] | [X%] | [+/-X%] | $[X] | [+/-X%] |
| **Total** | **$[X]** | **100%** | | **$[X]** | |

**Tagging Coverage:**
| Metric | Value | Target |
|--------|-------|--------|
| Resources with cost allocation tags | [X%] | >95% |
| Spend attributable to teams | [X%] | >90% |
| Untagged resource spend | $[X] | <$[X] |

---

## 4. Cost Breakdown by Environment

| Environment | Monthly Spend | % of Total | Notes |
|------------|--------------|-----------|-------|
| Production | $[X] | [X%] | [Steady state workloads] |
| Staging | $[X] | [X%] | [Should be ~10-20% of prod] |
| Development | $[X] | [X%] | [Opportunity: off-hours shutdown?] |
| CI/CD | $[X] | [X%] | [Build and test infrastructure] |
| Sandbox / Experimental | $[X] | [X%] | [Review for cleanup] |
| **Total** | **$[X]** | **100%** | |

**Non-Production Ratio:** [X%] of total spend is non-production
**Target:** Non-production should be <30% of production spend

---

## 5. Unit Economics

### Cost per Business Unit

| Metric | This Quarter | Last Quarter | Change | Target |
|--------|-------------|-------------|--------|--------|
| Cost per transaction | $[X.XXXX] | $[X.XXXX] | [+/-X%] | <$[X] |
| Cost per monthly active user | $[X.XX] | $[X.XX] | [+/-X%] | <$[X] |
| Cost per API request | $[X.XXXXXX] | $[X.XXXXXX] | [+/-X%] | <$[X] |
| Cost per GB stored | $[X.XX] | $[X.XX] | [+/-X%] | <$[X] |
| Cost per GB transferred | $[X.XX] | $[X.XX] | [+/-X%] | <$[X] |

### Efficiency Ratios

| Ratio | Value | Industry Benchmark | Assessment |
|-------|-------|-------------------|-----------|
| Cloud spend / Revenue | [X%] | [10-20% for SaaS] | [Good/Needs attention] |
| Cloud spend / Gross profit | [X%] | [15-30%] | [Good/Needs attention] |
| Infrastructure cost growth vs revenue growth | [X:Y] | [<1:1] | [Good/Needs attention] |
| Cost per engineer per month | $[X] | [$2-5K for SaaS] | [Good/Needs attention] |

---

## 6. Commitment Coverage Analysis

### Savings Plans / Reserved Instances

| Commitment Type | Coverage | Utilization | Savings Rate | Expiry |
|----------------|----------|-------------|-------------|--------|
| Compute Savings Plan | [X%] | [X%] | [X%] | [Date] |
| EC2 Instance Savings Plan | [X%] | [X%] | [X%] | [Date] |
| RDS Reserved Instance | [X%] | [X%] | [X%] | [Date] |
| ElastiCache Reserved | [X%] | [X%] | [X%] | [Date] |
| **Overall** | **[X%]** | **[X%]** | | |

**Target Coverage:** >70% of steady-state compute
**Current Coverage:** [X%]
**Gap:** [X%] — approximately $[X]/month in potential savings

### Savings Plan Recommendations

| Recommendation | Commitment | Term | Monthly Savings | Break-even |
|---------------|-----------|------|----------------|-----------|
| [e.g., Add $X/hr Compute SP] | $[X/hr] | [1yr/3yr] | $[X] | [X months] |
| [e.g., Renew RDS RI for db.r6g.xlarge] | $[X] | [1yr/3yr] | $[X] | [X months] |

---

## 7. Anomalies and Waste

### Cost Anomalies Detected

| Date | Service | Expected | Actual | Variance | Root Cause | Resolution |
|------|---------|----------|--------|----------|-----------|-----------|
| [Date] | [Service] | $[X] | $[X] | [+X%] | [Cause] | [Action taken] |

### Idle and Waste Resources

| Resource Type | Count | Monthly Waste | Action |
|--------------|-------|--------------|--------|
| Idle EC2 instances (<5% CPU for 14 days) | [X] | $[X] | [Terminate / Right-size] |
| Unattached EBS volumes | [X] | $[X] | [Delete after backup] |
| Unused Elastic IPs | [X] | $[X] | [Release] |
| Old EBS snapshots (>90 days) | [X] | $[X] | [Lifecycle policy] |
| Idle load balancers | [X] | $[X] | [Remove] |
| Oversized RDS instances | [X] | $[X] | [Right-size] |
| Unused NAT Gateways | [X] | $[X] | [Remove / VPC endpoint] |
| **Total Waste** | | **$[X]** | |

---

## 8. Optimization Actions — Previous Quarter

### Actions Completed

| # | Action | Expected Savings | Actual Savings | Status |
|---|--------|-----------------|---------------|--------|
| 1 | [e.g., Right-sized m5.2xl to m5.xl] | $[X]/mo | $[X]/mo | Complete |
| 2 | [e.g., Enabled S3 Intelligent-Tiering] | $[X]/mo | $[X]/mo | Complete |
| 3 | [e.g., Switched gp2 to gp3 volumes] | $[X]/mo | $[X]/mo | Complete |
| | **Total** | **$[X]/mo** | **$[X]/mo** | |

### Actions Not Completed (Carry Forward)

| # | Action | Expected Savings | Reason Not Completed | New Deadline |
|---|--------|-----------------|---------------------|-------------|
| 1 | [Action] | $[X]/mo | [Reason] | [Date] |

---

## 9. Optimization Actions — This Quarter

### Recommended Optimizations

| Priority | Action | Expected Savings | Effort | Owner | Deadline |
|----------|--------|-----------------|--------|-------|----------|
| P0 | [e.g., Terminate 5 idle EC2 instances] | $[X]/mo | 1 day | [Name] | [Date] |
| P0 | [e.g., Delete 20 unattached EBS volumes] | $[X]/mo | 1 day | [Name] | [Date] |
| P1 | [e.g., Purchase Compute Savings Plan] | $[X]/mo | 1 week | [Name] | [Date] |
| P1 | [e.g., Implement Spot for batch jobs] | $[X]/mo | 2 weeks | [Name] | [Date] |
| P2 | [e.g., Add CloudFront caching layer] | $[X]/mo | 1 month | [Name] | [Date] |
| P2 | [e.g., Migrate to Graviton instances] | $[X]/mo | 1 month | [Name] | [Date] |
| | **Total Expected Savings** | **$[X]/mo** | | | |

### Priority Definitions

| Priority | Criteria |
|----------|---------|
| P0 | >$5K/month savings, <1 day effort — implement immediately |
| P1 | >$2K/month savings, <1 week effort — implement this quarter |
| P2 | >$1K/month savings, <1 month effort — plan and schedule |
| P3 | <$1K/month savings — backlog for opportunistic implementation |

---

## 10. Forecast

### Next Quarter Projection

| Scenario | Monthly Spend | Quarterly Total | Assumptions |
|----------|--------------|----------------|------------|
| No action (current trajectory) | $[X] | $[X] | [Growth rate continues] |
| With P0 optimizations | $[X] | $[X] | [P0 actions implemented] |
| With P0 + P1 optimizations | $[X] | $[X] | [P0 + P1 actions implemented] |
| With all optimizations | $[X] | $[X] | [All actions implemented] |
| Budget | $[X] | $[X] | [Approved budget] |

### Growth Drivers

| Driver | Expected Impact | Timeline |
|--------|----------------|----------|
| [e.g., New market launch — 2x traffic] | +$[X]/mo | [Q# YYYY] |
| [e.g., Data retention increase] | +$[X]/mo | [Ongoing] |
| [e.g., New microservice deployment] | +$[X]/mo | [Q# YYYY] |

---

## 11. Recommendations

### Strategic Recommendations

1. **[Recommendation 1]:** [Detailed recommendation with business justification]
   - Expected impact: $[X]/month savings or [X%] improvement
   - Required investment: [Time/resources needed]
   - Timeline: [When to implement]

2. **[Recommendation 2]:** [Detailed recommendation]
   - Expected impact: $[X]/month
   - Required investment: [Time/resources]
   - Timeline: [When]

3. **[Recommendation 3]:** [Detailed recommendation]
   - Expected impact: $[X]/month
   - Required investment: [Time/resources]
   - Timeline: [When]

### Process Improvements

- [e.g., "Implement mandatory tagging policy enforcement via SCP"]
- [e.g., "Add cost impact analysis to architecture decision records"]
- [e.g., "Set up weekly cost anomaly review with team leads"]

---

## 12. Appendix

### A. Methodology

- Cost data source: [AWS Cost Explorer / Cost and Usage Report / Third-party tool]
- Reporting period: [Start date to end date]
- Currency: [USD]
- Amortization: [Savings Plans and RIs are amortized / shown as upfront]
- Credits: [Included / Excluded from totals]
- Support costs: [Included / Excluded]

### B. Data Sources

| Source | Purpose | Access |
|--------|---------|--------|
| AWS Cost Explorer | Service-level cost data | [Link] |
| AWS Cost and Usage Report | Detailed line-item data | [S3 bucket] |
| Tagging report | Cost allocation coverage | [Link] |
| CloudWatch metrics | Utilization data for right-sizing | [Dashboard link] |
| Trusted Advisor | Optimization recommendations | [Link] |

### C. Glossary

| Term | Definition |
|------|-----------|
| MoM | Month-over-month |
| MAU | Monthly active users |
| SP | Savings Plan |
| RI | Reserved Instance |
| COGS | Cost of goods sold (infrastructure portion) |
| Unit Economics | Cost per business unit (transaction, user, etc.) |

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Prepared by | [Name] | [Date] | |
| Engineering review | [Name] | [Date] | |
| Finance review | [Name] | [Date] | |
| VP/CTO approval | [Name] | [Date] | |

---

## Cross-References

- `Patterns/cost_optimization_pattern.md` — Optimization process
- `07_cost/cost_optimization.md` — Technical optimization strategies
- `07_cost/cost_management.md` — Organizational cost governance
- `07_cost/cost_architecture.md` — Cost-aware architecture decisions
- `Templates/architecture_decision_record_template.md` — For cost-impacting decisions

