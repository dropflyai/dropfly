# Metric Definition — Template

## Purpose

This template standardizes how business metrics are defined, documented, and governed. Every metric in the organization should have a completed definition card that removes all ambiguity about what the metric measures, how it is calculated, and how it should be interpreted. Consistent metric definitions are the foundation of trustworthy analytics. Without them, every report is a potential source of confusion and conflict.

---

## Metric Definition Card

### Identity

| Field | Value |
|-------|-------|
| **Metric Name** | [Clear, unambiguous name following naming convention] |
| **Metric ID** | [Unique identifier: e.g., MET-042] |
| **Category** | [Revenue / Growth / Efficiency / Health / Product / Marketing / Sales / Support] |
| **Metric Type** | [KPI (key performance indicator) / OPI (operational) / Diagnostic / Input / Output] |
| **Owner** | [Person/team accountable for this metric's accuracy and relevance] |
| **Date Created** | [YYYY-MM-DD] |
| **Last Reviewed** | [YYYY-MM-DD] |
| **Status** | [Active / Under Review / Deprecated] |

---

### Business Definition

**Plain-language description** (what does this metric measure and why does it matter?):

> [Write a definition that a non-technical business person would understand. Avoid jargon. Example: "Monthly Recurring Revenue (MRR) measures the predictable revenue the company earns each month from active subscriptions. It is the primary indicator of the company's revenue health and growth trajectory."]

**Strategic context** (what business question does this metric answer?):

> [Example: "MRR answers 'How much predictable revenue are we generating?' It is used in board reporting, fundraising, financial planning, and sales performance evaluation."]

---

### Technical Definition

**Formula:**

```
[Exact formula in mathematical notation or pseudocode]

Example:
MRR = SUM(monthly_subscription_amount)
      WHERE subscription_status = 'active'
      AND subscription_type IN ('monthly', 'annual_pro_rated')
      AND trial_status != 'in_trial'
```

**SQL Definition (if applicable):**

```sql
-- Canonical SQL for this metric
-- [Paste the exact SQL query or dbt model reference]
SELECT
  date_trunc('month', subscription_date) as period,
  SUM(monthly_amount) as mrr
FROM subscriptions
WHERE status = 'active'
  AND trial_end_date < CURRENT_DATE
GROUP BY 1
```

**Calculation Notes:**
- [Note 1: How annual contracts are handled (divided by 12)]
- [Note 2: How mid-month changes are handled (end-of-month snapshot)]
- [Note 3: Currency conversion methodology (if multi-currency)]
- [Note 4: Time zone convention (UTC)]

---

### Scope and Boundaries

**Inclusions (this metric INCLUDES):**
- [Inclusion 1: e.g., "All active paid subscriptions"]
- [Inclusion 2: e.g., "Pro-rated annual contracts at 1/12 of annual value"]
- [Inclusion 3: e.g., "Add-on and expansion revenue from existing customers"]

**Exclusions (this metric EXCLUDES):**
- [Exclusion 1: e.g., "Free trial accounts (until conversion)"]
- [Exclusion 2: e.g., "One-time setup or professional services fees"]
- [Exclusion 3: e.g., "Accounts in dunning/grace period beyond 30 days"]

**This metric is NOT the same as:**
- [Commonly confused metric 1: e.g., "ARR (which is MRR x 12)"]
- [Commonly confused metric 2: e.g., "Bookings (which includes future commitments)"]
- [Commonly confused metric 3: e.g., "Revenue (GAAP recognized revenue follows different rules)"]

---

### Data Source

| Attribute | Value |
|-----------|-------|
| Primary data source | [System: e.g., Stripe, Salesforce, product database] |
| Table/model | [Specific table or dbt model: e.g., `dim_subscriptions`] |
| Refresh frequency | [Real-time / Hourly / Daily / Weekly] |
| Data lag | [How far behind is this data from reality?] |
| Data quality checks | [What automated checks exist? dbt tests, anomaly detection?] |

---

### Presentation

| Attribute | Value |
|-----------|-------|
| Unit | [$ / % / # / days / ratio] |
| Decimal places | [0 / 1 / 2] |
| Rounding method | [Round / Floor / Ceiling] |
| Display format | [e.g., "$4.2M" not "$4,200,000.00"] |
| Trend direction | [Higher is better / Lower is better / Target range] |
| Default time granularity | [Daily / Weekly / Monthly / Quarterly] |
| Default comparison | [vs. prior period / vs. same period last year / vs. plan] |

---

### Segmentation

This metric can be broken down by:

| Segment Dimension | Values | Notes |
|------------------|--------|-------|
| [e.g., Customer segment] | [Enterprise, Mid-market, SMB] | [Primary segmentation for board reporting] |
| [e.g., Product line] | [Product A, B, C] | [If multi-product] |
| [e.g., Geography] | [NA, EMEA, APAC, LATAM] | [If multi-region] |
| [e.g., Cohort] | [Signup month/quarter] | [For retention analysis] |
| [e.g., Channel] | [Direct, Partner, PLG] | [For GTM analysis] |

---

### Targets and Thresholds

| Attribute | Value | Source |
|-----------|-------|--------|
| Current target | [Value for current period] | [Annual plan / board-approved] |
| Green threshold | [Within X% of target] | [Indicates on track] |
| Yellow threshold | [X-Y% off target] | [Indicates at risk] |
| Red threshold | [>Y% off target] | [Indicates off track] |
| Industry benchmark | [Value, source] | [For external context] |

---

### Edge Cases

| Scenario | Handling | Rationale |
|----------|---------|-----------|
| [e.g., Customer downgrades mid-month] | [Use end-of-month value] | [Simplifies calculation; matches financial reporting] |
| [e.g., Free-to-paid conversion mid-month] | [Include in MRR from conversion date] | [Reflects actual recurring revenue] |
| [e.g., Missing data for a period] | [Flag as incomplete; do not impute] | [Accuracy over completeness] |
| [e.g., Currency conversion fluctuation] | [Use period-end exchange rate] | [Matches financial reporting convention] |
| [e.g., Division by zero (for ratios)] | [Display as "N/A" with explanation] | [Prevent misleading zero or infinity display] |

---

### Consumers

| Consumer | Dashboard/Report | Usage |
|----------|-----------------|-------|
| [Board] | [Board deck] | [Quarterly strategic review] |
| [CEO] | [Executive dashboard] | [Weekly health check] |
| [Sales VP] | [Sales dashboard] | [Daily pipeline management] |
| [Finance] | [Financial model] | [Monthly close and forecasting] |
| [Investors] | [Investor update] | [Monthly transparency reporting] |

---

### Related Metrics

| Related Metric | Relationship |
|---------------|-------------|
| [ARR] | [ARR = MRR x 12; often reported together] |
| [Net New MRR] | [Component: New + Expansion - Contraction - Churn] |
| [Gross Churn MRR] | [MRR lost from churned customers] |
| [Expansion MRR] | [MRR gained from existing customer upgrades] |
| [GAAP Revenue] | [Different calculation; MRR is operational, Revenue is accounting] |

---

### Change History

| Date | Change | Reason | Changed By |
|------|--------|--------|-----------|
| [YYYY-MM-DD] | [Initial definition] | [New metric] | [Name] |
| [YYYY-MM-DD] | [Changed trial exclusion from 14 days to 30 days] | [Trial length changed] | [Name] |

---

## Approval

| Role | Name | Approved | Date |
|------|------|----------|------|
| Metric Owner | [Name] | [ ] | [Date] |
| Data Engineering | [Name] | [ ] | [Date] |
| Primary Consumer | [Name] | [ ] | [Date] |

---

## Usage Notes

- Every metric in the organization should have a completed definition card
- Definitions must be reviewed at least annually
- Any change to a metric definition must be communicated to all consumers
- Reference `metric_definition_pattern.md` for the definition governance process
- Store all metric definitions in a central, searchable registry
