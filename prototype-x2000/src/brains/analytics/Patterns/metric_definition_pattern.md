# Metric Definition Pattern — Establishing Canonical Business Metrics

## Context

This pattern governs the process of defining, validating, and governing business metrics. Metric inconsistency is one of the most expensive and pervasive problems in analytics: different teams calculating the same metric differently leads to conflicting reports, lost credibility, and poor decisions. This pattern establishes the process for creating a single, authoritative definition for each business metric.

---

## Prerequisites

- [ ] Business need for the metric is established (what decision does it support?)
- [ ] Data source(s) identified and accessible
- [ ] Stakeholder(s) who will use the metric identified
- [ ] Analytics infrastructure capable of computing the metric
- [ ] Existing metric glossary consulted (to prevent duplication)

---

## Phase 1: Definition (Week 1)

### 1.1 Metric Specification

Complete the metric specification card (use metric_definition_template.md):

| Field | Value |
|-------|-------|
| **Metric name** | [Clear, unambiguous name] |
| **Business definition** | [Plain-language description a non-technical person understands] |
| **Technical definition** | [Exact formula, SQL logic, or calculation method] |
| **Unit** | [Currency ($), percentage (%), count (#), ratio, days, etc.] |
| **Granularity** | [Daily, weekly, monthly, quarterly] |
| **Segmentation** | [By product, region, customer segment, etc.] |
| **Data source** | [Specific table(s), system(s), API(s)] |
| **Owner** | [Person/team accountable for this metric's accuracy] |
| **Consumers** | [Who uses this metric? Which dashboards/reports?] |
| **Related metrics** | [Other metrics that are related or commonly confused] |

### 1.2 Disambiguation

For every metric, document what it is NOT:

| This Metric IS | This Metric IS NOT |
|---------------|-------------------|
| [Precise inclusion criteria] | [What people commonly confuse it with] |
| [Specific scope] | [What is excluded and why] |

**Example:** "Monthly Recurring Revenue (MRR) includes all active subscription revenue billed monthly. It does NOT include one-time fees, professional services, or annual contracts (which are counted as ARR/12)."

### 1.3 Edge Case Documentation

| Edge Case | How Handled | Rationale |
|-----------|-------------|-----------|
| [What happens if X?] | [Specific handling] | [Why this approach] |
| [Missing data] | [Imputation method or exclusion] | [Rationale] |
| [Outliers] | [Included/excluded, threshold] | [Rationale] |
| [Changed methodology] | [Restatement policy] | [Comparability considerations] |

**Quality Gate 1:**
- [ ] Definition reviewed by at least one domain expert and one data engineer
- [ ] Edge cases documented
- [ ] No ambiguity in calculation method (could another analyst reproduce this exactly?)
- [ ] Metric does not duplicate an existing metric in the glossary

---

## Phase 2: Validation (Week 2)

### 2.1 Technical Validation

- [ ] Implement metric calculation in analytics tool
- [ ] Cross-reference against known source of truth (e.g., financial system for revenue metrics)
- [ ] Validate for at least 3 historical periods
- [ ] Test edge cases identified in Phase 1
- [ ] Verify at different granularities (daily sums to monthly, monthly sums to quarterly)

### 2.2 Stakeholder Validation

Present the metric to stakeholders with:
- Definition and calculation method
- Sample output for 3+ periods
- Comparison to any existing versions of this metric
- Segmentation examples

**Validation Criteria:**
- [ ] Stakeholders agree on the definition
- [ ] Numbers match stakeholder expectations (or discrepancies are explained)
- [ ] Metric passes the "newspaper test" (would you be comfortable if this number appeared in the press?)

---

## Phase 3: Governance (Ongoing)

### 3.1 Metric Registry

Add the metric to the central metric registry:

| Field | Value |
|-------|-------|
| Registry ID | [Unique identifier: e.g., MET-001] |
| Date added | [YYYY-MM-DD] |
| Last reviewed | [YYYY-MM-DD] |
| Status | [Active / Deprecated / Under Review] |
| Change history | [Log of definition changes] |

### 3.2 Change Management

**When a metric definition changes:**
1. Document the change and rationale
2. Assess impact on all dashboards and reports using this metric
3. Restate historical values where possible
4. Communicate the change to all consumers
5. Update the metric registry

### 3.3 Review Cadence

| Review Type | Cadence | Purpose |
|-------------|---------|---------|
| Accuracy check | Monthly | Verify metric still calculates correctly against source of truth |
| Relevance review | Quarterly | Is this metric still needed? Still aligned with strategy? |
| Definition review | Annually | Do edge cases or business changes require definition updates? |
| Full audit | Annually | Reconcile all metrics against the registry; identify duplicates or orphans |

---

## Common Failure Modes

| Failure | Prevention |
|---------|-----------|
| Same metric, different definitions across teams | Central metric registry; one definition per metric |
| Metric defined but never validated | Mandatory validation phase before any metric enters production |
| Definition changes without communication | Change management process; stakeholder notification |
| Metric proliferation (hundreds of metrics, no one knows which to use) | Metric rationalization; limit active metrics; deprecate unused ones |
| Edge cases not documented | Edge case section is mandatory in every metric definition |

---

## Post-Pattern Actions

1. Add metric to central registry
2. Update all relevant dashboards with the canonical definition
3. Communicate to all metric consumers
4. Schedule first review date
5. Document in `Memory/README.md`
