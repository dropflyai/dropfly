# Customer Health Scorecard Template

## What This Enables

This template provides a standardized framework for designing and maintaining a composite customer health score. A well-designed health scorecard aggregates multiple signals into a single actionable metric that predicts customer outcomes (renewal, expansion, churn) and enables segment-appropriate interventions. The scorecard is the operational backbone of proactive customer success.

---

## Template

### 1. Scorecard Configuration

| Field | Value |
|-------|-------|
| **Product/Segment** | [Which product/segment this scorecard applies to] |
| **Score Range** | 0-100 |
| **Thresholds** | Red: 0-40 / Yellow: 41-70 / Green: 71-100 |
| **Calculation Frequency** | [Daily / Weekly] |
| **Last Calibrated** | [Date] |
| **Owner** | [Name, role] |

---

### 2. Health Score Components

#### Component Weights

| Component | Weight | Rationale |
|-----------|--------|-----------|
| Product Usage | [X]% | Most predictive behavioral signal |
| Customer Engagement | [X]% | Relationship health indicator |
| Support Health | [X]% | Friction and satisfaction indicator |
| Business Outcomes | [X]% | Value realization indicator |
| Contract Health | [X]% | Commercial relationship indicator |
| **Total** | **100%** | |

---

#### 2.1 Product Usage Score (Weight: [X]%)

| Sub-Metric | Weight | Green (8-10) | Yellow (4-7) | Red (0-3) | Data Source |
|-----------|--------|-------------|-------------|-----------|-------------|
| DAU/MAU Ratio | [X]% | > 30% | 15-30% | < 15% | [Product analytics] |
| Feature Adoption | [X]% | > 70% features | 40-70% features | < 40% features | [Product analytics] |
| License Utilization | [X]% | > 80% seats active | 50-80% seats | < 50% seats | [License management] |
| Usage Trend (30d) | [X]% | Growing (> +5%) | Stable (+/- 5%) | Declining (> -5%) | [Product analytics] |
| Key Feature Usage | [X]% | Core feature used weekly | Core feature used monthly | Core feature unused 30d+ | [Product analytics] |

**Usage Score Calculation:**
```
Usage Score = Σ (sub_metric_score x sub_metric_weight) / Σ sub_metric_weights x 10
```

---

#### 2.2 Customer Engagement Score (Weight: [X]%)

| Sub-Metric | Weight | Green (8-10) | Yellow (4-7) | Red (0-3) | Data Source |
|-----------|--------|-------------|-------------|-----------|-------------|
| Executive Sponsor Access | [X]% | Active, responsive | Accessible but passive | No access or departed | [CRM] |
| Champion Status | [X]% | Strong champion, engaged | Champion identified, moderate engagement | No champion | [CRM] |
| Meeting Attendance | [X]% | Attends QBRs + ad hoc | Attends QBRs only | Misses QBRs | [Calendar] |
| Email Responsiveness | [X]% | Responds within 24h | Responds within 1 week | No response 2+ weeks | [Email tracking] |
| Community Participation | [X]% | Active contributor | Passive member | Not joined | [Community platform] |

---

#### 2.3 Support Health Score (Weight: [X]%)

| Sub-Metric | Weight | Green (8-10) | Yellow (4-7) | Red (0-3) | Data Source |
|-----------|--------|-------------|-------------|-----------|-------------|
| Ticket Volume Trend | [X]% | Stable or decreasing | Slight increase | > 50% increase | [Support system] |
| Open Critical Issues | [X]% | 0 open | 1 open < 7 days | 1+ open > 7 days | [Support system] |
| CSAT Score | [X]% | > 4.5/5 | 3.5-4.5/5 | < 3.5/5 | [Survey tool] |
| Escalation Frequency | [X]% | 0 in last 90 days | 1 in last 90 days | 2+ in last 90 days | [Support system] |
| Self-Service Ratio | [X]% | > 70% self-resolved | 40-70% self-resolved | < 40% self-resolved | [Support + KB analytics] |

---

#### 2.4 Business Outcomes Score (Weight: [X]%)

| Sub-Metric | Weight | Green (8-10) | Yellow (4-7) | Red (0-3) | Data Source |
|-----------|--------|-------------|-------------|-----------|-------------|
| Value Milestones | [X]% | All milestones on track | Behind on 1 milestone | Behind on 2+ milestones | [Success plan] |
| ROI Achievement | [X]% | Documented positive ROI | Tracking toward ROI | No ROI evidence | [QBR data] |
| NPS Score | [X]% | 9-10 (Promoter) | 7-8 (Passive) | 0-6 (Detractor) | [Survey tool] |

---

#### 2.5 Contract Health Score (Weight: [X]%)

| Sub-Metric | Weight | Green (8-10) | Yellow (4-7) | Red (0-3) | Data Source |
|-----------|--------|-------------|-------------|-----------|-------------|
| Days to Renewal | [X]% | > 180 days | 90-180 days | < 90 days (and no renewal signal) | [CRM] |
| Payment History | [X]% | On time | 1 late payment | 2+ late payments | [Billing system] |
| Auto-Renew Status | [X]% | Auto-renew enabled | Not applicable | Auto-renew disabled | [CRM] |
| Contract Growth | [X]% | Expanded last renewal | Flat renewal | Contracted or at risk | [CRM] |

---

### 3. Composite Score Calculation

```
Health Score = Σ (Component_Score x Component_Weight)

Where Component_Score = Σ (Sub_Metric_Score x Sub_Metric_Weight) / Σ Sub_Metric_Weights x 10

Example:
  Usage Score: 78 x 0.35 = 27.3
  Engagement Score: 65 x 0.20 = 13.0
  Support Score: 85 x 0.15 = 12.75
  Outcomes Score: 70 x 0.20 = 14.0
  Contract Score: 90 x 0.10 = 9.0

  Composite Health Score: 76.05 → GREEN
```

---

### 4. Action Triggers

| Health Zone | Score Range | Action | Owner | SLA |
|-------------|-----------|--------|-------|-----|
| Green | 71-100 | Standard engagement cadence | CSM | Per engagement plan |
| Green Declining | 71-100 but dropped 10+ points | Proactive check-in | CSM | Within 1 week |
| Yellow | 41-70 | Elevated engagement, root cause analysis | CSM | Within 48 hours |
| Yellow Declining | 41-70 and dropping | Intervention plan, CS leader involved | CSM + CS Leader | Within 24 hours |
| Red | 0-40 | Executive escalation, rescue plan | CS Leader + VP | Immediately |

---

### 5. Score Validation

#### Calibration Process (Quarterly)

| Step | Action |
|------|--------|
| 1 | Pull all customers who churned in the last quarter |
| 2 | Check their health scores 90, 60, and 30 days before churn |
| 3 | If > 30% of churned customers were Green at 90 days, weights need adjustment |
| 4 | Pull all customers who expanded in the last quarter |
| 5 | Verify that expanded customers were predominantly Green |
| 6 | Adjust weights and thresholds based on findings |
| 7 | Document changes and rationale |

#### Predictive Accuracy Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Red accounts that churn within 6 months | > 50% | [Actual]% |
| Green accounts that renew | > 90% | [Actual]% |
| False positive rate (Red but healthy) | < 20% | [Actual]% |
| False negative rate (Green but churns) | < 10% | [Actual]% |

---

### 6. Scorecard Overrides

CSMs may override the calculated score when qualitative information contradicts the data:

| Field | Value |
|-------|-------|
| **Customer** | [Name] |
| **Calculated Score** | [Score] |
| **Override Score** | [Score] |
| **Override Reason** | [Specific qualitative reason] |
| **Override Expiry** | [Date -- overrides must be time-limited] |
| **Approved By** | [CS Leader name] |

---

## Usage Notes

- Health scores are models, not truth. They provide signal, not certainty
- Always investigate the component scores behind the composite -- a Green score can hide a Red component
- Calibrate quarterly against actual churn and expansion data
- Share health score methodology (not individual scores) with product and engineering teams
- Never share a customer's health score with the customer -- it is an internal operational tool
- Override sparingly and always with documented rationale and expiry
