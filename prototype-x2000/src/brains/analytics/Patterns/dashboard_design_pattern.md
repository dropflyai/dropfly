# Dashboard Design Pattern — Building Effective Analytics Dashboards

## Context

This pattern governs the design and implementation of analytics dashboards. Dashboards are the primary interface between analytical infrastructure and business decision-makers. A well-designed dashboard enables self-serve insight; a poorly designed dashboard creates confusion, distrust, and shadow spreadsheets. This pattern draws on Few's information dashboard design principles and Tufte's visual display of quantitative information.

---

## Prerequisites

- [ ] Dashboard purpose defined (who uses it, what decisions it supports)
- [ ] Data sources identified and validated for accuracy
- [ ] Metric definitions agreed upon by all stakeholders
- [ ] Technical platform selected (Looker, Tableau, Metabase, Mode, Superset, etc.)
- [ ] Analytics Brain preflight completed

---

## Phase 1: Requirements (Week 1)

### 1.1 Audience Definition

| Question | Answer |
|----------|--------|
| Who is the primary user? | [Role, analytics sophistication level] |
| How will they access the dashboard? | [Desktop, mobile, TV, embedded] |
| How often will they use it? | [Daily, weekly, monthly] |
| What decisions does this dashboard support? | [Specific decisions] |
| What questions should this dashboard answer? | [5-10 specific questions] |

### 1.2 Metric Selection

Apply the "5-7 Rule": No dashboard should contain more than 5-7 primary metrics. Additional detail belongs in drill-downs or linked reports.

| Metric | Definition | Source | Owner | Refresh Cadence |
|--------|-----------|--------|-------|----------------|
| [Metric 1] | [Precise definition] | [Data source/table] | [Who owns this metric] | [Real-time/daily/weekly] |
| [Metric 2] | [Definition] | [Source] | [Owner] | [Cadence] |

### 1.3 Context Requirements

Every metric requires context to be interpretable:

| Context Type | Examples |
|-------------|---------|
| Temporal | vs. prior period, vs. same period last year |
| Target | vs. plan, vs. budget, vs. benchmark |
| Trend | Sparkline or trend indicator (up/down/flat) |
| Segmentation | By region, product, customer segment |
| Drill-down | Click to see underlying detail |

**Quality Gate 1:**
- [ ] Requirements documented and approved by primary user
- [ ] Metric definitions validated with data owners
- [ ] No more than 7 primary metrics per dashboard view

---

## Phase 2: Design (Week 2)

### 2.1 Layout Principles

**Information Hierarchy (Few):**
- Most important metrics in upper-left (eye tracking shows this is where attention begins)
- Summary/KPI tiles across the top
- Trend charts in the middle
- Detail tables at the bottom
- Filters on the left sidebar or top bar

**Dashboard Layout Template:**
```
┌────────────────────────────────────────────────────────┐
│  FILTERS: [Date Range] [Segment] [Region]              │
├──────────┬──────────┬──────────┬──────────┬────────────┤
│  KPI 1   │  KPI 2   │  KPI 3   │  KPI 4   │  KPI 5    │
│  $4.2M   │  15% ▲   │  2.5%    │  120%    │  $3.2M    │
│  vs plan │  vs prior│  vs prior│  vs prior│  pipeline  │
├──────────┴──────────┴──────────┴──────────┴────────────┤
│  PRIMARY TREND CHART (line chart showing key metric     │
│  over time with annotation on key events)               │
├──────────────────────────┬─────────────────────────────┤
│  SECONDARY CHART 1       │  SECONDARY CHART 2           │
│  (breakdown by segment)  │  (comparison/ranking)         │
├──────────────────────────┴─────────────────────────────┤
│  DETAIL TABLE (sortable, filterable, drill-down)        │
└────────────────────────────────────────────────────────┘
```

### 2.2 Visualization Selection

| Data Relationship | Best Chart Type | Avoid |
|------------------|-----------------|-------|
| Trend over time | Line chart | Pie chart, 3D bar |
| Part-to-whole | Stacked bar, treemap | Pie chart (>5 categories) |
| Comparison/ranking | Horizontal bar | Vertical bar (many categories) |
| Distribution | Histogram, box plot | Bar chart |
| Correlation | Scatter plot | Line chart |
| KPI status | Single number + trend indicator | Gauges, speedometers |
| Geographic | Map/choropleth | Table of regions |

### 2.3 Color Strategy

- **Semantic colors:** Green = good, red = bad, gray = neutral (consistent across all dashboards)
- **Brand colors:** Use sparingly for decorative elements, not data encoding
- **Accessibility:** Ensure colorblind-safe palette (do not rely solely on red/green)
- **Emphasis:** Use color to highlight the most important element; gray for supporting data

**Quality Gate 2:**
- [ ] Wireframe/mockup reviewed by primary user
- [ ] Layout follows information hierarchy principles
- [ ] Charts match data relationships (no misleading visualizations)
- [ ] Color strategy defined and accessible

---

## Phase 3: Build (Weeks 3-4)

### 3.1 Data Pipeline Validation

Before building the dashboard, validate the data pipeline:
- [ ] Data source freshness verified (when was it last updated?)
- [ ] Row counts match expectations (no missing data)
- [ ] Metric calculations tested against manual spreadsheet calculation
- [ ] Edge cases handled (nulls, zeros, division by zero)
- [ ] Performance tested (dashboard loads in <5 seconds)

### 3.2 Build Checklist

- [ ] All metrics implemented per definitions
- [ ] All context elements present (vs. prior, vs. target, trend)
- [ ] Filters working correctly (date range, segments)
- [ ] Drill-down paths functional
- [ ] Mobile responsive (if required)
- [ ] Access permissions configured
- [ ] Refresh schedule set
- [ ] Error handling for missing/stale data (show "data as of [date]" notice)

---

## Phase 4: Validate and Launch (Week 5)

### 4.1 User Acceptance Testing

- Primary user reviews dashboard against original questions list
- Test with real-time data (not mock data)
- Verify every number against source of truth
- Identify any missing context or confusing elements
- Iterate based on feedback (maximum 2 rounds)

### 4.2 Launch

- Announce dashboard to intended users with brief training
- Document: what it shows, how to use it, who to contact for questions
- Set review date: 30-day check-in to evaluate adoption and feedback
- Add to dashboard registry (central catalog of all dashboards)

**Quality Gate 4:**
- [ ] All metrics verified against source of truth
- [ ] Primary user approved
- [ ] Documentation complete
- [ ] Access permissions verified
- [ ] Refresh schedule confirmed

---

## Common Failure Modes

| Failure | Prevention |
|---------|-----------|
| Dashboard has 30+ metrics (information overload) | Enforce 5-7 primary metrics; everything else is drill-down |
| Pretty but wrong (inaccurate data) | Validate every number before launch |
| Built but not used (low adoption) | Involve users in requirements; embed in existing workflows |
| Stale data (dashboard shows old numbers) | Visible "last refreshed" timestamp; alerting for stale data |
| Definition disagreement ("that's not how I calculate churn") | Metric definitions agreed BEFORE build starts |

---

## Post-Pattern Actions

1. Monitor adoption (page views, unique users) for first 30 days
2. Collect user feedback at 30-day mark
3. Iterate based on feedback
4. Add to dashboard registry with metadata
5. Schedule quarterly review for continued relevance
