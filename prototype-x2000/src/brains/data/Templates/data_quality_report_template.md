# Data Quality Report Template

## Instructions

This template is used to document the quality assessment of a data source,
data product, or pipeline output. Complete this report before using any
dataset for analytics, ML training, or production decisions. Sections
marked [REQUIRED] must be completed. Update the report when data sources
change or quality issues are discovered.

---

## Report Metadata [REQUIRED]

```
Report title:       [e.g., "Customer Events Data Quality Assessment"]
Dataset:            [full table/file path]
Assessment date:    [YYYY-MM-DD]
Assessed by:        [name and role]
Assessment scope:   [full dataset / sample / time range]
Data as of:         [date of most recent data included]
Row count:          [total rows assessed]
Column count:       [total columns assessed]
Report version:     [v1.0]
Next review date:   [YYYY-MM-DD]
```

---

## 1. Executive Summary [REQUIRED]

### Overall Quality Score

```
┌─────────────────────────────────────────────┐
│         OVERALL DATA QUALITY SCORE          │
│                                             │
│              [XX.X] / 100                   │
│                                             │
│  Rating: [Excellent/Good/Acceptable/Poor]   │
│                                             │
│  Recommendation: [Suitable for use /        │
│   Use with caveats / Not suitable]          │
└─────────────────────────────────────────────┘
```

### Dimension Scores

| Dimension | Score | Weight | Weighted Score | Status |
|-----------|-------|--------|---------------|--------|
| Completeness | [/100] | 0.20 | [score] | [pass/fail] |
| Accuracy | [/100] | 0.25 | [score] | [pass/fail] |
| Consistency | [/100] | 0.15 | [score] | [pass/fail] |
| Timeliness | [/100] | 0.15 | [score] | [pass/fail] |
| Validity | [/100] | 0.15 | [score] | [pass/fail] |
| Uniqueness | [/100] | 0.10 | [score] | [pass/fail] |
| **Total** | | **1.00** | **[total]** | |

### Key Findings

1. [Most critical finding]
2. [Second finding]
3. [Third finding]

### Recommended Actions

| Priority | Action | Owner | Deadline |
|----------|--------|-------|----------|
| P0 | [critical fix] | [name] | [date] |
| P1 | [important fix] | [name] | [date] |
| P2 | [improvement] | [name] | [date] |

---

## 2. Completeness Assessment [REQUIRED]

### Column-Level Completeness

| Column | Expected | Null Count | Null % | Threshold | Status |
|--------|----------|------------|--------|-----------|--------|
| [column_1] | NOT NULL | [count] | [%] | < 0.1% | [pass/fail] |
| [column_2] | NULLABLE | [count] | [%] | < 5% | [pass/fail] |
| [column_3] | NOT NULL | [count] | [%] | < 0.1% | [pass/fail] |

### Row-Level Completeness

```
Total rows:                    [count]
Fully complete rows:           [count] ([%])
Rows with any null:            [count] ([%])
Rows with > 50% null:          [count] ([%])
```

### Temporal Completeness

```
Expected date range:           [start] to [end]
Actual date range:             [start] to [end]
Missing dates:                 [list or count]
Expected daily volume:         [count +/- %]
Days with anomalous volume:    [list dates and volumes]
```

### Completeness Trend

```
Week        | Completeness %  | Delta
──────────────────────────────────────
[week -4]   | [%]             |
[week -3]   | [%]             | [+/- %]
[week -2]   | [%]             | [+/- %]
[week -1]   | [%]             | [+/- %]
[current]   | [%]             | [+/- %]
```

---

## 3. Accuracy Assessment

### Cross-Reference Validation

| Field | Source A Value | Source B Value | Match Rate | Notes |
|-------|--------------|---------------|-----------|-------|
| [field] | [source] | [source] | [%] | [notes] |

### Range Validation

| Column | Min | Max | Mean | Median | Expected Range | Outliers |
|--------|-----|-----|------|--------|---------------|---------|
| [column] | [val] | [val] | [val] | [val] | [range] | [count] |

### Business Rule Validation

| Rule | Description | Rows Tested | Rows Failed | Failure % |
|------|------------|-------------|-------------|-----------|
| [rule_1] | [description] | [count] | [count] | [%] |
| [rule_2] | [description] | [count] | [count] | [%] |

---

## 4. Consistency Assessment

### Cross-System Consistency

| Entity | System A Count | System B Count | Delta | Delta % |
|--------|---------------|---------------|-------|---------|
| [entity] | [count] | [count] | [diff] | [%] |

### Internal Consistency

| Check | Description | Result |
|-------|------------|--------|
| Referential integrity | [FK references valid] | [pass/fail] |
| Aggregation consistency | [detail sums to summary] | [pass/fail] |
| Temporal consistency | [no future dates, monotonic sequences] | [pass/fail] |

---

## 5. Timeliness Assessment [REQUIRED]

```
Data freshness SLA:             [target, e.g., < 2 hours]
Current freshness:              [actual, e.g., 1.5 hours]
SLA met:                        [yes/no]
Last successful update:         [timestamp]
Last failed update:             [timestamp, if any]
Average update latency (30d):   [duration]
P95 update latency (30d):       [duration]
```

### Freshness Trend

```
Date        | Freshness (hours) | SLA Status
─────────────────────────────────────────────
[date -6]   | [hours]           | [met/missed]
[date -5]   | [hours]           | [met/missed]
[date -4]   | [hours]           | [met/missed]
[date -3]   | [hours]           | [met/missed]
[date -2]   | [hours]           | [met/missed]
[date -1]   | [hours]           | [met/missed]
[today]     | [hours]           | [met/missed]
```

---

## 6. Validity Assessment

### Format Validation

| Column | Expected Format | Valid % | Invalid Examples |
|--------|---------------|---------|-----------------|
| email | RFC 5322 | [%] | [examples] |
| phone | E.164 | [%] | [examples] |
| date | ISO 8601 | [%] | [examples] |
| country | ISO 3166-1 alpha-2 | [%] | [examples] |

### Domain Validation

| Column | Allowed Values | Violations | Violation % |
|--------|---------------|------------|-------------|
| status | [pending, active, cancelled] | [count] | [%] |
| currency | [USD, EUR, GBP] | [count] | [%] |

---

## 7. Uniqueness Assessment [REQUIRED]

### Primary Key Uniqueness

```
Primary key:          [column(s)]
Total rows:           [count]
Unique keys:          [count]
Duplicate keys:       [count] ([%])
Max duplicates per key: [count]
```

### Duplicate Analysis

| Duplicate Pattern | Count | Example | Root Cause |
|-------------------|-------|---------|-----------|
| [pattern] | [count] | [example] | [cause] |

---

## 8. Distribution Analysis

### Numeric Columns

| Column | Count | Mean | Std | Min | 25% | 50% | 75% | Max | Skew |
|--------|-------|------|-----|-----|-----|-----|-----|-----|------|
| [col] | [n] | [val] | [val] | [val] | [val] | [val] | [val] | [val] | [val] |

### Categorical Columns

| Column | Cardinality | Top 3 Values (%) | Null % |
|--------|------------|-------------------|--------|
| [col] | [count] | [val1 (%), val2 (%), val3 (%)] | [%] |

### Distribution Drift (vs Previous Period)

| Column | PSI Score | Status | Notes |
|--------|-----------|--------|-------|
| [col] | [score] | [stable/drift/significant] | [notes] |

---

## 9. Data Lineage

```
Source System(s):     [list]
Ingestion method:     [batch/streaming, tool name]
Transformation:       [dbt model / Spark job / etc.]
Last transform:       [timestamp]
Downstream consumers: [list]
```

---

## 10. Recommendations and Action Items

### Critical Issues (Must Fix Before Use)

| Issue | Impact | Remediation | Owner | ETA |
|-------|--------|------------|-------|-----|
| [issue] | [impact] | [fix] | [name] | [date] |

### Known Limitations (Document and Proceed)

| Limitation | Impact | Workaround |
|-----------|--------|-----------|
| [limitation] | [impact] | [workaround] |

### Improvement Opportunities

| Opportunity | Benefit | Effort | Priority |
|-------------|---------|--------|----------|
| [opportunity] | [benefit] | [effort] | [P1/P2/P3] |

---

## Appendix: SQL Queries Used

```sql
-- Completeness check
SELECT
    COUNT(*) AS total_rows,
    COUNT(column_name) AS non_null_rows,
    1.0 - COUNT(column_name)::FLOAT / COUNT(*) AS null_rate
FROM table_name;

-- Uniqueness check
SELECT
    COUNT(*) AS total_rows,
    COUNT(DISTINCT primary_key) AS unique_keys,
    COUNT(*) - COUNT(DISTINCT primary_key) AS duplicates
FROM table_name;

-- Freshness check
SELECT
    MAX(updated_at) AS most_recent,
    DATEDIFF('hour', MAX(updated_at), CURRENT_TIMESTAMP()) AS hours_stale
FROM table_name;

-- Distribution summary
SELECT
    COUNT(*) AS n,
    AVG(column_name) AS mean,
    STDDEV(column_name) AS std,
    MIN(column_name) AS min_val,
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY column_name) AS p25,
    PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY column_name) AS median,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY column_name) AS p75,
    MAX(column_name) AS max_val
FROM table_name;
```

---

## Sign-Off

| Role | Name | Date | Approval |
|------|------|------|----------|
| Data Steward | [name] | [date] | [approved/rejected] |
| Data Consumer | [name] | [date] | [acknowledged] |
| Data Engineer | [name] | [date] | [approved/rejected] |
