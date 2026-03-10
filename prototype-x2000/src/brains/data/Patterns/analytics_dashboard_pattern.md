# Analytics Dashboard Pattern — From Requirements to Production BI

## Context

You need to build a business analytics dashboard that provides stakeholders with
self-serve access to key metrics, trend analysis, and drill-down capabilities.
This pattern applies to executive dashboards, operational monitoring, product
analytics, and financial reporting. The goal is a dashboard that is used daily,
trusted implicitly, and maintained sustainably.

---

## Problem Statement

Dashboard projects fail when they:
- Start with tool selection instead of user needs
- Define metrics ambiguously (different numbers in different reports)
- Build one-off visualizations without a governed data layer
- Lack a maintenance plan (dashboards rot without ownership)
- Overwhelm users with too many charts and no narrative

---

## Solution Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  ANALYTICS DASHBOARD                     │
│                                                          │
│  ┌────────────┐  ┌──────────┐  ┌─────────┐  ┌───────┐ │
│  │ Data       │  │ Semantic │  │ Dashboard│  │ Users │ │
│  │ Warehouse  │──│ Layer    │──│ Tool     │──│       │ │
│  └────────────┘  └──────────┘  └─────────┘  └───────┘ │
│       │               │             │            │      │
│  ┌────────────┐  ┌──────────┐  ┌─────────┐  ┌───────┐ │
│  │ dbt models │  │ Metrics  │  │ Design  │  │ Train  │ │
│  │ (mart)     │  │ defs     │  │ system  │  │ -ing   │ │
│  └────────────┘  └──────────┘  └─────────┘  └───────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Steps

### Phase 1: Discovery and Requirements (Week 1)

**1.1 Stakeholder Interviews**

Questions to ask:
- What decisions do you make with this data?
- What is the most important metric you track?
- How often do you need this information?
- What questions do you ask that you cannot answer today?
- Who else needs access to this information?

**1.2 Metric Definition Workshop**

For each metric, document:

```yaml
metric:
  name: Net Revenue Retention (NRR)
  definition: >
    Revenue from existing customers at end of period divided by
    revenue from those same customers at start of period.
    Includes expansion, contraction, and churn.
  formula: |
    NRR = (Beginning MRR + Expansion - Contraction - Churn) / Beginning MRR
  grain: monthly, by cohort
  owner: Revenue Operations
  source_tables: [fct_mrr_movements, dim_customer]
  known_issues:
    - "Multi-year contracts with annual billing may distort monthly NRR"
    - "Trial-to-paid conversions are classified as new, not expansion"
```

**1.3 Dashboard Brief**

```
Title: SaaS Executive Dashboard
Audience: CEO, CFO, VP Sales, VP CS
Refresh frequency: Daily (by 9 AM ET)
Primary question: "Is the business growing efficiently?"
Key metrics: ARR, NRR, CAC Payback, Burn Multiple, Rule of 40
Drill-downs: By segment, geography, product line
Filters: Date range, customer segment, plan tier
```

### Phase 2: Data Modeling (Week 2)

**2.1 Mart Layer in dbt**

Build a dedicated analytics mart for the dashboard:

```sql
-- models/marts/finance/fct_mrr_movements.sql
{{ config(materialized='table', schema='marts_finance') }}

WITH mrr_current AS (
    SELECT
        customer_id,
        DATE_TRUNC('month', effective_date) AS month,
        SUM(mrr_amount) AS mrr
    FROM {{ ref('stg_subscriptions') }}
    GROUP BY 1, 2
),

mrr_previous AS (
    SELECT
        customer_id,
        month + INTERVAL '1 month' AS month,
        mrr AS previous_mrr
    FROM mrr_current
),

movements AS (
    SELECT
        COALESCE(c.customer_id, p.customer_id) AS customer_id,
        COALESCE(c.month, p.month) AS month,
        COALESCE(c.mrr, 0) AS current_mrr,
        COALESCE(p.previous_mrr, 0) AS previous_mrr,
        CASE
            WHEN p.previous_mrr IS NULL THEN 'new'
            WHEN c.mrr IS NULL THEN 'churn'
            WHEN c.mrr > p.previous_mrr THEN 'expansion'
            WHEN c.mrr < p.previous_mrr THEN 'contraction'
            ELSE 'retained'
        END AS movement_type,
        COALESCE(c.mrr, 0) - COALESCE(p.previous_mrr, 0) AS mrr_change
    FROM mrr_current c
    FULL OUTER JOIN mrr_previous p
        ON c.customer_id = p.customer_id AND c.month = p.month
)

SELECT * FROM movements
```

**2.2 Semantic Layer Metrics**

```yaml
# dbt metrics layer (or LookML / Cube)
metrics:
  - name: arr
    label: "Annual Recurring Revenue"
    type: derived
    sql: "SUM(current_mrr) * 12"
    timestamp: month
    time_grains: [month, quarter, year]

  - name: nrr
    label: "Net Revenue Retention"
    type: derived
    sql: |
      SUM(CASE WHEN movement_type != 'new' THEN current_mrr END) /
      NULLIF(SUM(previous_mrr), 0)
    timestamp: month
```

**2.3 Data Quality Tests**

```yaml
# dbt tests
models:
  - name: fct_mrr_movements
    tests:
      - dbt_utils.unique_combination_of_columns:
          combination_of_columns: [customer_id, month]
    columns:
      - name: customer_id
        tests: [not_null]
      - name: current_mrr
        tests:
          - not_null
          - dbt_utils.accepted_range:
              min_value: 0
              max_value: 1000000
      - name: movement_type
        tests:
          - accepted_values:
              values: [new, expansion, contraction, retained, churn]
```

### Phase 3: Dashboard Design (Week 3)

**3.1 Layout (Inverted Pyramid)**

```
┌──────────────────────────────────────────────────────┐
│  LEVEL 1: KPI Cards (the most important numbers)     │
│                                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐│
│  │ ARR      │ │ NRR      │ │ Burn     │ │ Rule    ││
│  │ $12.4M   │ │ 118%     │ │ Multiple │ │ of 40   ││
│  │ +24% YoY │ │ Target>110│ │ 1.2x    │ │ 52%     ││
│  └──────────┘ └──────────┘ └──────────┘ └─────────┘│
├──────────────────────────────────────────────────────┤
│  LEVEL 2: Trend Charts (what is changing?)           │
│                                                       │
│  ┌─────────────────────┐ ┌──────────────────────────┐│
│  │ ARR Bridge          │ │ NRR by Cohort            ││
│  │ [waterfall chart]   │ │ [line chart]             ││
│  └─────────────────────┘ └──────────────────────────┘│
├──────────────────────────────────────────────────────┤
│  LEVEL 3: Detail (where to look deeper)              │
│                                                       │
│  ┌──────────────────────────────────────────────────┐│
│  │ MRR Movements by Segment [stacked bar]           ││
│  │ Top Expansion / Churn Accounts [table]           ││
│  └──────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────┘
```

**3.2 Chart Selection**

| Metric | Chart Type | Rationale |
|--------|-----------|-----------|
| ARR trend | Line chart | Time series with single metric |
| ARR bridge | Waterfall | Shows decomposition of change |
| NRR by cohort | Multi-line | Compare cohort trajectories |
| MRR movements | Stacked bar | Part-to-whole over time |
| Top accounts | Table | Specific names for action |
| Segment mix | Horizontal bar | Category comparison |

**3.3 Interaction Design**
- Global date range filter (last 12 months default)
- Segment filter (All, Enterprise, Mid-Market, SMB)
- Click on KPI card to see detailed trend
- Click on chart bar to filter downstream charts
- Hover for exact values with context

### Phase 4: Build and Review (Week 3-4)

**4.1 Build Checklist**
- [ ] All KPI cards show number, trend, and target
- [ ] Charts use consistent colors and fonts
- [ ] Axis labels include units (e.g., "$M", "%")
- [ ] Tooltips show exact values with period
- [ ] Filters applied globally (not per chart)
- [ ] Mobile-responsive layout tested
- [ ] Data freshness indicator visible

**4.2 Stakeholder Review Protocol**
1. Walk through the dashboard narrative top-to-bottom
2. Verify every number against a known source
3. Test edge cases (empty segments, date ranges)
4. Confirm the dashboard answers the original questions
5. Collect feedback and iterate

### Phase 5: Launch and Maintain (Week 4+)

**5.1 Launch Checklist**
- [ ] Access permissions configured
- [ ] Training session scheduled for users
- [ ] Documentation: metric definitions, data sources, refresh schedule
- [ ] Alerting: notify if data refresh fails
- [ ] Feedback channel established (Slack, Jira)

**5.2 Maintenance Plan**
```
Weekly:  Verify data quality and freshness
Monthly: Review usage analytics (which charts are viewed?)
         Remove unused charts, add requested ones
Quarterly: Full metric review (are definitions still correct?)
           Performance optimization (query time < 5s)
Annually: Major redesign if business model changes
```

---

## Trade-offs

| Gain | Sacrifice |
|------|----------|
| Single source of truth for metrics | Upfront definition effort |
| Self-serve for stakeholders | Reduced data team gatekeeping |
| Governed semantic layer | Additional infrastructure layer |
| Consistent design system | Limits creative flexibility |

---

## Anti-patterns

- Building dashboards without clear user requirements
- Multiple dashboards showing different numbers for same metric
- No semantic layer (SQL duplicated across dashboards)
- Dashboard with 20+ charts on one page
- No freshness indicator (users do not know if data is stale)
- No maintenance owner (dashboard rots)
- Pie charts for comparison (use bar charts instead)

---

## Checklist

- [ ] Stakeholder interviews completed
- [ ] Metrics defined with formulas and owners
- [ ] dbt mart models built and tested
- [ ] Semantic layer configured
- [ ] Dashboard designed with inverted pyramid layout
- [ ] All charts follow visualization best practices
- [ ] Data quality tests passing
- [ ] Access permissions configured
- [ ] User training completed
- [ ] Maintenance plan documented with owner

---

## References

- Few (2006). Information Dashboard Design.
- Nussbaumer Knaflic (2015). Storytelling with Data.
- Tufte (2001). The Visual Display of Quantitative Information.
