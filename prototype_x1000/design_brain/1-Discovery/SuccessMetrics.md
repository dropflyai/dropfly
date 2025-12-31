# Success Metrics Framework — Authoritative

If you can't measure it, you can't prove it worked.
Define success before you design.

---

## Purpose

Success metrics exist to:
- define what "done" looks like
- enable objective evaluation
- guide design decisions
- prove value to stakeholders
- enable iteration based on data

Design without metrics is decoration. Design with metrics is problem-solving.

---

## Metric Categories

### 1. Business Metrics
Impact on business outcomes.
```
- Revenue / ARR / MRR
- Conversion rate
- Customer acquisition cost (CAC)
- Lifetime value (LTV)
- Churn rate
- Net Promoter Score (NPS)
```

### 2. Product Metrics
Impact on product usage.
```
- Active users (DAU/WAU/MAU)
- Feature adoption rate
- Retention (D1, D7, D30)
- Session duration
- Session frequency
- Feature usage depth
```

### 3. UX Metrics
Impact on user experience.
```
- Task completion rate
- Time on task
- Error rate
- Satisfaction (CSAT, SUS)
- Ease of use rating
- Abandonment rate
```

### 4. Engagement Metrics
Impact on user behavior.
```
- Click-through rate
- Scroll depth
- Interaction rate
- Return visits
- Sharing/referral rate
```

---

## Metric Definition Template

For each metric you track:

```
METRIC: _______________

DEFINITION
What exactly are we measuring?


CALCULATION
How is it calculated?
Formula:


CURRENT BASELINE
What is it today?


TARGET
What should it be?


TIMEFRAME
When should we hit target?


DATA SOURCE
Where does this data come from?


OWNER
Who is responsible for tracking?


FREQUENCY
How often do we review?


SEGMENT
Any user segments to track separately?

```

---

## Goal-Setting Framework (OKRs)

### Objective
Qualitative goal — what you want to achieve.

### Key Results
Quantitative measures — how you know you achieved it.

```
OBJECTIVE: _______________
(Qualitative, inspirational, time-bound)

KEY RESULT 1:
Metric: _______________
Baseline: _______________
Target: _______________

KEY RESULT 2:
Metric: _______________
Baseline: _______________
Target: _______________

KEY RESULT 3:
Metric: _______________
Baseline: _______________
Target: _______________
```

### Example
```
OBJECTIVE: Make onboarding effortless

KEY RESULT 1:
Metric: Onboarding completion rate
Baseline: 34%
Target: 60%

KEY RESULT 2:
Metric: Time to first value
Baseline: 12 minutes
Target: 5 minutes

KEY RESULT 3:
Metric: Support tickets during onboarding
Baseline: 45/week
Target: 15/week
```

---

## UX-Specific Metrics

### Task Success Rate
```
Definition: % of users who complete a task successfully
Calculation: (Successful completions / Total attempts) × 100
When to use: Critical flows, onboarding, key features
```

### Time on Task
```
Definition: How long it takes to complete a task
Calculation: Average time from task start to completion
When to use: Efficiency improvements, flow optimization
```

### Error Rate
```
Definition: % of users who encounter errors
Calculation: (Users with errors / Total users) × 100
When to use: Form optimization, validation improvements
```

### Abandonment Rate
```
Definition: % who start but don't complete
Calculation: (Abandons / Starts) × 100
When to use: Funnels, multi-step flows, checkout
```

### System Usability Scale (SUS)
```
Definition: Standardized usability questionnaire
Calculation: 10-question survey, scored 0-100
When to use: Overall usability benchmarking
Industry average: 68
```

---

## HEART Framework (Google)

### Happiness
How do users feel about the experience?
```
- Satisfaction surveys
- NPS
- Ratings/reviews
- Sentiment analysis
```

### Engagement
How much do users interact?
```
- Session frequency
- Session duration
- Feature usage
- Interaction depth
```

### Adoption
Are new users/features being adopted?
```
- New user signups
- Feature adoption rate
- Upgrade rate
```

### Retention
Are users coming back?
```
- Return rate
- Churn rate
- Renewal rate
- Cohort retention curves
```

### Task Success
Can users accomplish their goals?
```
- Task completion rate
- Time on task
- Error rate
- Search success
```

---

## Metric Hierarchy

### North Star Metric
One metric that captures core value delivery.
```
NORTH STAR: _______________
Why this metric: _______________
```

### Supporting Metrics
Metrics that influence the North Star.
```
| Supporting Metric | Relationship to North Star |
|-------------------|---------------------------|
|                   |                           |
```

### Input Metrics
Actions that influence supporting metrics.
```
| Input Metric | What We Control |
|--------------|-----------------|
|              |                 |
```

### Example Hierarchy
```
NORTH STAR: Weekly Active Workflows (value delivery)
  ├── Supporting: Onboarding completion (path to value)
  │     ├── Input: First workflow created
  │     └── Input: First run executed
  ├── Supporting: Retention D30 (continued value)
  │     ├── Input: Weekly workflow runs
  │     └── Input: Error recovery rate
  └── Supporting: Feature adoption (expanded value)
        ├── Input: Advanced feature discovery
        └── Input: Template usage
```

---

## Baseline Measurement

Before making changes, document current state:

```
PROJECT: _______________
BASELINE DATE: _______________

| Metric | Current Value | Data Source | Confidence |
|--------|---------------|-------------|------------|
|        |               |             | H/M/L      |

NOTES ON DATA QUALITY:


GAPS IN MEASUREMENT:

```

---

## Target Setting

### SMART Criteria
- **S**pecific: Clear and unambiguous
- **M**easurable: Quantifiable
- **A**chievable: Realistic given constraints
- **R**elevant: Tied to business goals
- **T**ime-bound: Has a deadline

### Target Validation
```
TARGET: _______________

Is it specific? [ ] Yes [ ] No
Is it measurable? [ ] Yes [ ] No
Is it achievable? [ ] Yes [ ] No
Is it relevant? [ ] Yes [ ] No
Is it time-bound? [ ] Yes [ ] No

If any "No", revise the target.
```

---

## Measurement Plan

### What to Track
```
| Metric | Tool | Implementation | Owner | Start Date |
|--------|------|----------------|-------|------------|
|        |      |                |       |            |
```

### Tracking Cadence
```
| Metric | Review Frequency | Report To |
|--------|------------------|-----------|
|        |                  |           |
```

### Dashboard Requirements
```
REQUIRED VIEWS:
-
-
-

SEGMENTS TO TRACK:
-
-

COMPARISONS NEEDED:
-
-
```

---

## Qualitative + Quantitative Balance

### Quantitative (What)
```
- Analytics data
- A/B test results
- Funnel metrics
- Error logs
```

### Qualitative (Why)
```
- User interviews
- Session recordings
- Support tickets
- Survey responses
```

### Together
Numbers tell you WHAT is happening.
Qualitative tells you WHY.
You need both.

---

## Common Pitfalls

### Vanity Metrics
```
BAD: Total signups (ever)
GOOD: Active users (this week)

BAD: Page views
GOOD: Task completion rate

BAD: Time on site (higher isn't always better)
GOOD: Time to complete task (lower is better)
```

### Misleading Averages
```
BAD: Average session duration
GOOD: Median + distribution

BAD: Average task time
GOOD: P50, P90, P99 task times
```

### Gaming Metrics
```
BAD: Optimize for clicks (leads to dark patterns)
GOOD: Optimize for task success + satisfaction
```

---

## Output Artifacts

After defining success metrics, you should have:
- [ ] North Star metric identified
- [ ] Supporting metrics defined
- [ ] Baseline measurements documented
- [ ] SMART targets set
- [ ] Measurement plan created
- [ ] Dashboard requirements specified

---

## END OF SUCCESS METRICS FRAMEWORK
