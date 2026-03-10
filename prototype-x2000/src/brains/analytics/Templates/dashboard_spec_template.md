# Dashboard Specification — Template

## Purpose

This template captures all requirements for a new analytics dashboard before development begins. A completed dashboard specification prevents the most common dashboard failures: building the wrong thing, including too many metrics, missing critical context, and delivering a dashboard that looks good but answers the wrong questions. The specification serves as the contract between the requesting stakeholder and the analytics team.

---

## Document Control

| Field | Value |
|-------|-------|
| Dashboard Name | [Descriptive name] |
| Spec Author | [Name, role] |
| Date | [YYYY-MM-DD] |
| Version | [v1.0] |
| Status | [Draft / In Review / Approved / In Development / Live] |
| Requesting Stakeholder | [Name, role — the primary user and approver] |
| Analytics Owner | [Name — the analyst/engineer who will build this] |
| Target Launch Date | [YYYY-MM-DD] |

---

## 1. Business Context

### Purpose Statement
Why does this dashboard need to exist?

> [One sentence: This dashboard enables [role] to [make what decision / monitor what process / answer what question].]

### Current State
How is this information consumed today?

- [ ] No existing dashboard (this is new)
- [ ] Existing dashboard being replaced: [link/name]
- [ ] Manual reports / spreadsheets being automated: [describe]
- [ ] Multiple data sources being consolidated: [list sources]

### Success Criteria
How will we know this dashboard is successful?

| Criteria | Measurement | Target |
|----------|-------------|--------|
| Adoption | Unique weekly users | [#] |
| Utility | Decisions influenced (qualitative) | [Description] |
| Accuracy | Error rate reported | [0%] |
| Speed | Replaces manual reporting time | [X hours/week saved] |

---

## 2. Audience and Access

### Primary Audience

| Attribute | Detail |
|-----------|--------|
| Role(s) | [Who will use this most frequently?] |
| Analytics sophistication | [Beginner / Intermediate / Advanced] |
| Frequency of use | [Daily / Weekly / Monthly / Ad-hoc] |
| Device | [Desktop / Mobile / TV display / All] |
| Access level | [View only / Can filter / Can drill down / Can export] |

### Secondary Audience

| Role | Access Level | Notes |
|------|-------------|-------|
| [Role 1] | [View/Filter/Export] | [Any restrictions?] |
| [Role 2] | [Access level] | [Notes] |

### Access Control

| Group | Permission | Platform Role |
|-------|-----------|--------------|
| [Primary users] | Full access | [Viewer/Editor] |
| [Secondary users] | View only | [Viewer] |
| [External (board, investors)] | [None / Scheduled export] | [N/A] |

---

## 3. Key Questions This Dashboard Must Answer

*List the specific business questions the dashboard should answer. These questions drive metric selection.*

| # | Question | Metric(s) Needed | Priority |
|---|---------|-----------------|----------|
| 1 | [e.g., "Are we on track to hit quarterly revenue targets?"] | [Revenue vs. plan, pipeline, forecast] | P1 |
| 2 | [e.g., "Where are we losing customers?"] | [Churn by segment, churn reasons] | P1 |
| 3 | [Question] | [Metrics] | [P1/P2] |
| 4 | [Question] | [Metrics] | [P1/P2] |
| 5 | [Question] | [Metrics] | [P2] |

---

## 4. Metrics Specification

### Primary Metrics (KPI Tiles)

| Metric | Definition | Source | Context (vs.) | Format | Alert Threshold |
|--------|-----------|--------|---------------|--------|----------------|
| [Metric 1] | [Precise definition] | [Table/API] | [Plan, prior period, prior year] | [Currency/Pct/Count] | [Red if >X% off] |
| [Metric 2] | [Definition] | [Source] | [Context] | [Format] | [Threshold] |
| [Metric 3] | [Definition] | [Source] | [Context] | [Format] | [Threshold] |

### Trend Metrics (Charts)

| Metric | Chart Type | Time Range | Granularity | Comparison | Drill-Down |
|--------|-----------|-----------|-------------|-----------|-----------|
| [Metric] | [Line/Bar/Area] | [Last 12 months] | [Daily/Weekly/Monthly] | [vs. target, vs. prior year] | [Click to see by segment] |
| [Metric] | [Chart type] | [Range] | [Granularity] | [Comparison] | [Drill-down] |

### Detail Metrics (Tables/Lists)

| Table | Columns | Sort Default | Filter Options | Row-Level Action |
|-------|---------|-------------|---------------|-----------------|
| [e.g., Customer list] | [Name, Revenue, Growth, Health Score] | [Revenue desc] | [Segment, Region, Date] | [Click to customer detail] |

---

## 5. Filters and Interactivity

| Filter | Type | Default Value | Options |
|--------|------|---------------|---------|
| Date range | Date picker | Last 30 days | Custom, Last 7d, 30d, 90d, YTD, Last year |
| Segment | Dropdown | All | [Enterprise, Mid-market, SMB] |
| Region | Dropdown | All | [NA, EMEA, APAC, LATAM] |
| Product | Dropdown | All | [Product A, B, C] |

### Drill-Down Paths

| From | Click Action | Drill To |
|------|-------------|----------|
| [Revenue KPI] | Click | [Revenue detail by customer] |
| [Churn rate] | Click | [Churned customer list with reasons] |
| [Pipeline] | Click | [Deal-level pipeline detail] |

---

## 6. Data Requirements

### Data Sources

| Source System | Table/API | Refresh Frequency | Data Lag | Owner |
|-------------|-----------|-------------------|----------|-------|
| [e.g., Salesforce] | [Opportunity table] | [Daily at 2am UTC] | [<24 hours] | [Data engineering] |
| [e.g., Stripe] | [Subscription API] | [Real-time] | [<1 hour] | [Data engineering] |
| [e.g., Product DB] | [events table] | [Hourly] | [<2 hours] | [Product analytics] |

### Data Transformations Required

| Transformation | Description | Complexity |
|---------------|-------------|-----------|
| [e.g., MRR calculation] | [Aggregate subscriptions, exclude trials, annualize annual contracts] | [Medium] |
| [e.g., Cohort assignment] | [Assign customers to signup month cohort] | [Low] |

### Data Quality Requirements

| Requirement | Specification |
|-------------|--------------|
| Completeness | [No more than X% missing values for any metric] |
| Freshness | [Dashboard data must be no more than X hours old] |
| Accuracy | [All financial metrics must reconcile with source of truth within X%] |
| Stale data indicator | [Display "Last updated: [timestamp]" prominently] |

---

## 7. Design Requirements

### Layout Preference

- [ ] Single page (no scrolling)
- [ ] Multi-page with tabs
- [ ] Scrolling with sections
- [ ] Mobile-optimized required

### Visual Style

- [ ] Match existing dashboard style guide
- [ ] Match company brand guidelines
- [ ] Custom (describe): [Description]

### Specific Design Requirements

| Requirement | Specification |
|-------------|--------------|
| Color scheme | [Semantic: green=good, red=bad, gray=neutral] |
| Font | [Match platform default / brand font] |
| Annotations | [Required for targets, events, and anomalies] |
| Export | [PDF export required? CSV data export?] |
| Embed | [Needs to be embedded in another tool?] |
| Alerts | [Email/Slack alert if metric crosses threshold?] |

---

## 8. Technical Requirements

| Requirement | Specification |
|-------------|--------------|
| Platform | [Looker / Tableau / Metabase / Mode / PowerBI / Custom] |
| Performance | [Must load in <X seconds] |
| Caching | [Cache for X minutes; refresh on demand] |
| Scheduled delivery | [Email/Slack PDF at X cadence to [distribution list]] |
| Version control | [Dashboard definition in version control?] |
| Testing | [QA process before launch] |

---

## 9. Timeline

| Milestone | Date | Owner |
|-----------|------|-------|
| Spec approved | [Date] | [Stakeholder] |
| Data pipeline ready | [Date] | [Data engineer] |
| First draft (wireframe) | [Date] | [Analyst] |
| Wireframe review | [Date] | [Stakeholder] |
| Build complete | [Date] | [Analyst] |
| UAT (user acceptance testing) | [Date] | [Stakeholder + analyst] |
| Launch | [Date] | [Analyst] |
| 30-day review | [Date] | [All] |

---

## 10. Approval

| Role | Name | Approved | Date |
|------|------|----------|------|
| Requesting stakeholder | [Name] | [ ] | [Date] |
| Analytics owner | [Name] | [ ] | [Date] |
| Data engineering (if pipeline needed) | [Name] | [ ] | [Date] |

---

## Usage Notes

- Complete all P1 sections before development begins
- P2 items can be added iteratively after initial launch
- Reference the `dashboard_design_pattern.md` for the complete build workflow
- Archive completed specs for institutional memory and dashboard registry
