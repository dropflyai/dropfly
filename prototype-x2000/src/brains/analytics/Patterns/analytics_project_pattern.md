# Analytics Project Pattern — End-to-End Analysis Execution

## Context

This pattern governs the execution of analytics projects — defined as any analysis effort that requires more than a quick query and produces a deliverable for stakeholders. This includes strategic analyses, deep-dives, market sizing, cohort analyses, A/B test evaluations, and predictive modeling. The pattern ensures analytical rigor while maintaining stakeholder alignment and timely delivery.

---

## Prerequisites

- [ ] Analysis request documented (who requested, what question, by when)
- [ ] Business context understood (why does this matter? what decision depends on this?)
- [ ] Data availability confirmed (can we answer this question with available data?)
- [ ] Time and resource commitment agreed upon
- [ ] Stakeholder identified with authority to act on findings

---

## Phase 1: Scoping (Day 1-2)

### 1.1 Problem Definition

| Field | Value |
|-------|-------|
| Business question | [The question in plain language] |
| Hypothesis | [What do we expect to find? Why?] |
| Decision this informs | [What action will be taken based on findings?] |
| Success criteria | [What would a "good" analysis look like?] |
| Constraints | [Time, data availability, methodological limitations] |
| Deliverable format | [Dashboard, presentation, document, email summary] |
| Deadline | [Date] |

### 1.2 Scoping Agreement

Confirm scope with the requesting stakeholder:
- Here is what we will analyze: [scope in]
- Here is what we will NOT analyze: [scope out]
- Here is what we will deliver: [format and content]
- Here is when we will deliver: [date]
- Here is what we need from you: [data access, context, review time]

**Quality Gate 1:**
- [ ] Scope agreed in writing with stakeholder
- [ ] Hypothesis documented before analysis begins (prevents HARKing — Hypothesizing After Results are Known)
- [ ] Data sources identified and accessible

---

## Phase 2: Analysis (Days 3-7)

### 2.1 Data Preparation

- [ ] Data extracted from identified sources
- [ ] Data quality assessed (missing values, outliers, inconsistencies)
- [ ] Data cleaned and documented (what was removed/transformed and why)
- [ ] Analytical dataset created and saved for reproducibility

### 2.2 Exploratory Analysis

Before testing hypotheses, explore the data:
- Descriptive statistics for all key variables
- Distribution analysis (is the data normally distributed? Skewed?)
- Correlation analysis (relationships between variables)
- Segmentation analysis (do patterns differ across segments?)
- Time-series analysis (trends, seasonality, anomalies)

### 2.3 Hypothesis Testing

- Apply appropriate statistical method(s) to test hypothesis
- Document methodology, assumptions, and limitations
- Calculate confidence intervals and statistical significance
- Test alternative hypotheses and compare
- Check for confounding variables and selection bias

### 2.4 Peer Review

Before presenting findings to stakeholders:
- [ ] Another analyst reviews methodology and calculations
- [ ] Key numbers spot-checked against source of truth
- [ ] Conclusions logically follow from the data
- [ ] Limitations are clearly stated
- [ ] Alternative interpretations have been considered

**Quality Gate 2:**
- [ ] Analysis peer-reviewed
- [ ] Key findings documented with supporting evidence
- [ ] Limitations and caveats identified
- [ ] Deliverable drafted

---

## Phase 3: Delivery (Days 8-10)

### 3.1 Deliverable Creation

Use the data storytelling framework (see `07_storytelling/data_storytelling.md`):
1. Situation: Establish context
2. Complication: Present the key finding
3. Resolution: Recommend action

### 3.2 Presentation to Stakeholders

- Present findings in person or via video (not just email)
- Lead with the recommendation, then supporting evidence
- Address anticipated objections
- Propose specific next steps with owners and timelines
- Document questions raised and action items

### 3.3 Documentation

Archive the complete analysis:
- [ ] Analysis code/queries saved in version control
- [ ] Methodology document written
- [ ] Findings summary available for future reference
- [ ] Raw data sources documented for reproducibility

**Quality Gate 3:**
- [ ] Stakeholder has received and acknowledged findings
- [ ] Action items documented with owners
- [ ] Analysis archived for future reference

---

## Common Failure Modes

| Failure | Prevention |
|---------|-----------|
| Analysis answers the wrong question | Scoping agreement with stakeholder before starting |
| HARKing (finding the hypothesis after the results) | Document hypothesis BEFORE analyzing data |
| Analysis takes too long (scope creep) | Fixed deadline and scope; iterate in follow-up projects |
| Findings never acted upon | Identify decision-maker and specific decision in scoping |
| Cannot reproduce the analysis | Version-controlled code, documented data sources |
| Statistical errors (p-hacking, multiple comparisons) | Peer review, pre-registered hypotheses |

---

## Timeline Summary

| Phase | Duration | Output |
|-------|----------|--------|
| Scoping | 1-2 days | Scoping agreement |
| Analysis | 3-5 days | Peer-reviewed findings |
| Delivery | 2-3 days | Presentation, documentation, action items |
| **Total** | **6-10 days** | |

---

## Post-Pattern Actions

1. Follow up on action items at 2-week and 4-week marks
2. If analysis leads to an intervention, measure the impact
3. Document learnings in `Memory/README.md`
4. If analysis type recurs, consider automating as a dashboard
