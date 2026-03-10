# Data Quality Report — Template

## Purpose

This template structures a periodic assessment of data quality across the organization's analytical infrastructure. Data quality is the foundation upon which all analytics, reporting, and decision-making rests. Poor data quality is insidious — it erodes trust gradually, produces subtly wrong analyses, and eventually renders the entire analytics function unreliable. This report quantifies data quality across six dimensions (completeness, accuracy, consistency, timeliness, validity, and uniqueness) and identifies remediation priorities.

---

## Document Control

| Field | Value |
|-------|-------|
| Report Title | Data Quality Report — [Period] |
| Report Author | [Name, role] |
| Date | [YYYY-MM-DD] |
| Report Period | [YYYY-MM-DD to YYYY-MM-DD] |
| Version | [v1.0] |
| Distribution | [Data engineering, analytics, finance, leadership] |
| Cadence | [Monthly / Quarterly] |
| Status | [Draft / Final] |

---

## 1. Executive Summary

### Overall Data Quality Score

| Dimension | Score (1-5) | Trend | Critical Issues |
|-----------|-------------|-------|-----------------|
| Completeness | [Score] | [Up/Down/Stable] | [# of critical issues] |
| Accuracy | [Score] | [Trend] | [# issues] |
| Consistency | [Score] | [Trend] | [# issues] |
| Timeliness | [Score] | [Trend] | [# issues] |
| Validity | [Score] | [Trend] | [# issues] |
| Uniqueness | [Score] | [Trend] | [# issues] |
| **Overall** | **[Avg]** | **[Trend]** | **[Total]** |

### Key Findings
- [Finding 1: e.g., "Customer email completeness dropped to 85%, impacting marketing attribution"]
- [Finding 2: e.g., "Revenue data latency improved from 24 hours to 4 hours after pipeline optimization"]
- [Finding 3: e.g., "3 duplicate customer records identified in enterprise segment affecting ACV calculations"]

### Priority Actions
| # | Action | Owner | Due Date | Impact |
|---|--------|-------|----------|--------|
| 1 | [Action description] | [Name] | [Date] | [What it fixes] |
| 2 | [Action] | [Name] | [Date] | [Impact] |
| 3 | [Action] | [Name] | [Date] | [Impact] |

---

## 2. Quality Dimension Deep-Dive

### 2.1 Completeness

**Definition:** The percentage of expected data that is present (not null, not empty).

| Data Domain | Table/Source | Field | Expected Records | Actual Records | Completeness % | Status |
|-------------|-------------|-------|-----------------|---------------|----------------|--------|
| Customer | [Table] | email | [#] | [#] | [%] | [Green/Yellow/Red] |
| Customer | [Table] | industry | [#] | [#] | [%] | [Status] |
| Revenue | [Table] | amount | [#] | [#] | [%] | [Status] |
| Product | [Table] | usage_event | [#] | [#] | [%] | [Status] |
| Marketing | [Table] | utm_source | [#] | [#] | [%] | [Status] |

**Thresholds:**
- Green: >98% complete
- Yellow: 95-98% complete
- Red: <95% complete

**Issues Identified:**

| Issue | Affected Field | Root Cause | Impact | Remediation |
|-------|---------------|-----------|--------|-------------|
| [Issue description] | [Field] | [Why is data missing?] | [What analysis is affected?] | [Fix plan] |

### 2.2 Accuracy

**Definition:** The degree to which data correctly represents the real-world entity or event it models.

**Accuracy Validation Methods:**

| Validation | Method | Frequency | Last Result |
|-----------|--------|-----------|-------------|
| Revenue reconciliation | Compare analytics revenue to financial system | Monthly | [Match / X% variance] |
| Customer count | Compare analytics customer count to CRM | Weekly | [Match / X% variance] |
| Event tracking | Compare tracked events to expected based on traffic | Daily | [Match / X% variance] |
| Subscription data | Compare to payment processor records | Monthly | [Match / X% variance] |

**Accuracy Issues:**

| Issue | Variance | Root Cause | Impact | Remediation |
|-------|----------|-----------|--------|-------------|
| [Issue] | [Amount or %] | [Root cause] | [Impact on reports/decisions] | [Fix plan] |

### 2.3 Consistency

**Definition:** The degree to which data is uniform across systems, reports, and time periods.

**Cross-System Consistency Checks:**

| Metric | System A | System B | Variance | Status |
|--------|---------|---------|----------|--------|
| MRR | [Value from analytics] | [Value from billing] | [Difference] | [Match/Mismatch] |
| Customer count | [Analytics] | [CRM] | [Difference] | [Status] |
| Website sessions | [Analytics] | [Marketing tool] | [Difference] | [Status] |

**Definition Consistency:**

| Metric | Dashboard A Definition | Dashboard B Definition | Consistent? |
|--------|----------------------|----------------------|-------------|
| [Metric] | [How it's calculated] | [How it's calculated] | [Yes/No] |

### 2.4 Timeliness

**Definition:** The degree to which data is available when needed for decision-making.

| Data Pipeline | Expected Latency | Actual Latency | SLA Met? | Trend |
|--------------|-----------------|---------------|----------|-------|
| [Pipeline 1] | [<X hours] | [Actual hours] | [Yes/No] | [Improving/Degrading/Stable] |
| [Pipeline 2] | [<X hours] | [Actual hours] | [Yes/No] | [Trend] |
| [Pipeline 3] | [<X hours] | [Actual hours] | [Yes/No] | [Trend] |

**Pipeline Failures This Period:**

| Date | Pipeline | Duration of Outage | Root Cause | User Impact |
|------|---------|-------------------|-----------|-------------|
| [Date] | [Pipeline] | [Hours] | [Cause] | [Who was affected?] |

### 2.5 Validity

**Definition:** The degree to which data conforms to defined formats, ranges, and business rules.

| Validation Rule | Table/Field | Expected | Violations Found | Status |
|----------------|------------|----------|-----------------|--------|
| [e.g., Email format] | [customer.email] | [Valid email format] | [# invalid] | [Status] |
| [e.g., Revenue > 0] | [revenue.amount] | [Positive values only] | [# negative] | [Status] |
| [e.g., Date in range] | [event.timestamp] | [Within last 2 years] | [# out of range] | [Status] |
| [e.g., Enum values] | [customer.segment] | [Enterprise/Mid/SMB only] | [# invalid values] | [Status] |

### 2.6 Uniqueness

**Definition:** The degree to which data is free of unwanted duplicates.

| Entity | Table | Total Records | Duplicate Records | Duplicate Rate | Status |
|--------|-------|--------------|------------------|---------------|--------|
| Customer | [Table] | [#] | [#] | [%] | [Status] |
| Contact | [Table] | [#] | [#] | [%] | [Status] |
| Transaction | [Table] | [#] | [#] | [%] | [Status] |
| Event | [Table] | [#] | [#] | [%] | [Status] |

---

## 3. Data Quality Trends

### Quarter-over-Quarter Comparison

| Dimension | Q-2 | Q-1 | Current | Trend |
|-----------|-----|-----|---------|-------|
| Completeness | [Score] | [Score] | [Score] | [Direction] |
| Accuracy | [Score] | [Score] | [Score] | [Direction] |
| Consistency | [Score] | [Score] | [Score] | [Direction] |
| Timeliness | [Score] | [Score] | [Score] | [Direction] |
| Validity | [Score] | [Score] | [Score] | [Direction] |
| Uniqueness | [Score] | [Score] | [Score] | [Direction] |

---

## 4. Remediation Tracker

### Open Issues from Previous Reports

| Issue ID | Issue | Opened | Owner | Status | Due Date |
|----------|-------|--------|-------|--------|----------|
| DQ-001 | [Description] | [Date] | [Name] | [Open/In Progress/Closed] | [Date] |
| DQ-002 | [Description] | [Date] | [Name] | [Status] | [Date] |

### New Issues This Period

| Issue ID | Issue | Severity | Owner | Due Date |
|----------|-------|----------|-------|----------|
| DQ-XXX | [Description] | [Critical/High/Medium/Low] | [Name] | [Date] |

---

## 5. Recommendations

| # | Recommendation | Effort | Impact | Priority |
|---|---------------|--------|--------|----------|
| 1 | [Specific recommendation] | [Low/Med/High] | [Low/Med/High] | [P1/P2/P3] |
| 2 | [Recommendation] | [Effort] | [Impact] | [Priority] |
| 3 | [Recommendation] | [Effort] | [Impact] | [Priority] |

---

## Usage Notes

- This report should be produced monthly or quarterly
- Automated data quality checks should run daily; this report summarizes and analyzes the results
- Reference `05_analytics_engineering/` for data pipeline monitoring guidance
- All critical issues (Red status) should be escalated immediately, not held for the report
- Archive reports for longitudinal trend analysis
