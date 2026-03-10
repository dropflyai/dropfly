# Analytics Brief Template — Structured Analysis Request and Delivery

## Instructions

This template structures the request, methodology, and delivery of an analytics
project. Use Part A (Request) to scope the work before analysis begins. Use
Part B (Delivery) to document findings. Both parts must be completed for any
analysis that will inform a business decision. The brief ensures reproducibility,
clarity of methodology, and actionability of conclusions.

---

# PART A: ANALYSIS REQUEST [Complete Before Starting]

## A.1 Request Overview [REQUIRED]

```
Request title:        [descriptive title]
Requested by:         [name, role, team]
Request date:         [YYYY-MM-DD]
Priority:             [P0-critical / P1-high / P2-medium / P3-low]
Target delivery date: [YYYY-MM-DD]
Analyst assigned:     [name]
```

## A.2 Business Context [REQUIRED]

### What decision will this analysis inform?
[Describe the specific decision. An analysis without a decision is a report,
not an analysis. Be specific: "Should we invest $200K in a referral program
for Q3?" not "Look at referrals."]

### What is the current hypothesis?
[State what the stakeholder believes. The analysis will either support or
challenge this hypothesis.]

### What action will be taken based on the results?
[Map analysis outcomes to decisions]

```
If finding A:    -> Action: [specific action]
If finding B:    -> Action: [specific action]
If inconclusive: -> Action: [specific action]
```

### What is the impact of getting this wrong?
```
Cost of false positive: [what happens if we act on a wrong conclusion]
Cost of false negative: [what happens if we miss a real signal]
Reversibility:          [can we undo the decision easily?]
```

## A.3 Scope Definition [REQUIRED]

### In Scope
- [Specific question 1]
- [Specific question 2]
- [Specific question 3]

### Out of Scope
- [Explicitly excluded item 1]
- [Explicitly excluded item 2]

### Data Sources Required
| Source | Table/Dataset | Fields Needed | Access Confirmed |
|--------|--------------|--------------|-----------------|
| [source] | [table] | [fields] | [yes/no] |

### Time Period
```
Analysis window:      [start date to end date]
Comparison period:    [if applicable]
Rationale for period: [why this window?]
```

### Population
```
Include:     [which users/entities are in scope]
Exclude:     [which users/entities are excluded, with rationale]
Sample size: [estimated population size]
```

## A.4 Methodology Plan

### Analysis Type
```
[ ] Descriptive (what happened?)
[ ] Diagnostic (why did it happen?)
[ ] Predictive (what will happen?)
[ ] Causal (what caused it?)
[ ] Prescriptive (what should we do?)
```

### Planned Approach
[Describe the analytical methodology in 2-3 paragraphs. Include:
- Statistical methods to be used
- Segmentation approach
- How you will control for confounders
- Known limitations of the approach]

### Assumptions
[List all assumptions required for the analysis to be valid]

1. [Assumption 1]
2. [Assumption 2]
3. [Assumption 3]

## A.5 Agreement

| Role | Name | Date | Agrees with Scope |
|------|------|------|------------------|
| Requester | [name] | [date] | [yes] |
| Analyst | [name] | [date] | [yes] |
| Data owner | [name] | [date] | [yes] |

---

# PART B: ANALYSIS DELIVERY [Complete When Delivering]

## B.1 Executive Summary [REQUIRED]

### Key Finding (One Sentence)
[The single most important takeaway. A busy executive should be able to
read only this sentence and know the answer.]

### Recommendation
[Specific, actionable recommendation based on the findings.]

### Confidence Level
```
Confidence:    [High / Medium / Low]
Justification: [Why this confidence level?]
```

### Impact Estimate
```
Expected impact:   [quantified: $, %, users affected]
Confidence range:  [low estimate -- high estimate]
Time to impact:    [how long until we see the result]
```

## B.2 Methodology [REQUIRED]

### Data Used
```
Dataset:        [table/file path]
Rows analyzed:  [count]
Time period:    [start to end]
Filters applied: [list all filters]
Exclusions:      [list all exclusions with counts]
```

### Analytical Approach
[Describe what you actually did. Include:]

1. **Data preparation**: [cleaning, transformation, feature creation]
2. **Analysis method**: [statistical test, model, segmentation approach]
3. **Validation**: [how you checked your results]

### Statistical Tests Used
| Test | Purpose | Result | p-value | Effect Size |
|------|---------|--------|---------|-------------|
| [test] | [purpose] | [result] | [p] | [effect] |

### Assumptions Verified
| Assumption | Verification Method | Result |
|-----------|-------------------|--------|
| [assumption 1] | [method] | [met/violated] |
| [assumption 2] | [method] | [met/violated] |

## B.3 Findings [REQUIRED]

### Finding 1: [Title]
[Description of the finding with supporting evidence]

**Evidence:**
```
Metric:       [value +/- CI]
Comparison:   [vs what baseline]
Significance: [statistical test result]
Effect size:  [practical magnitude]
```

**Visualization:** [reference to chart/figure]

### Finding 2: [Title]
[Same structure as Finding 1]

### Finding 3: [Title]
[Same structure as Finding 1]

## B.4 Segmentation Analysis

| Segment | N | Metric Value | vs Overall | Notable |
|---------|---|-------------|-----------|---------|
| [segment] | [n] | [value] | [+/- %] | [insight] |

## B.5 Sensitivity Analysis

How robust are the findings to changes in methodology or assumptions?

| Variation | Impact on Finding | Conclusion Changes? |
|-----------|------------------|-------------------|
| [exclude outliers] | [impact] | [yes/no] |
| [different time window] | [impact] | [yes/no] |
| [alternative metric] | [impact] | [yes/no] |

## B.6 Limitations and Caveats [REQUIRED]

### Known Limitations
1. [Limitation 1 and its impact on conclusions]
2. [Limitation 2 and its impact on conclusions]

### Potential Confounders
1. [Confounder 1: how it might affect results]
2. [Confounder 2: how it might affect results]

### What This Analysis Cannot Tell Us
[Explicitly state what is beyond the scope of these conclusions]

## B.7 Recommendations [REQUIRED]

### Primary Recommendation
```
Action:        [specific action to take]
Expected impact: [quantified impact]
Confidence:     [high/medium/low]
Next step:      [immediate next step]
Owner:          [who should own this]
Timeline:       [by when]
```

### Alternative Options
| Option | Impact | Effort | Risk | Recommendation |
|--------|--------|--------|------|---------------|
| [option A] | [impact] | [effort] | [risk] | [recommended/not] |
| [option B] | [impact] | [effort] | [risk] | [recommended/not] |

### Suggested Follow-Up Analyses
1. [Follow-up analysis that would strengthen confidence]
2. [Related question surfaced during analysis]

## B.8 Reproducibility [REQUIRED]

```
Code location:    [Git repo/path/commit hash]
Data snapshot:    [version or timestamp of data used]
Environment:      [Python version, key libraries]
Runtime:          [how long the analysis takes to run]
Dependencies:     [external data sources, APIs, etc.]
```

---

## Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| Analyst | [name] | [date] | [delivered] |
| Requester | [name] | [date] | [accepted/revision requested] |
| Peer reviewer | [name] | [date] | [approved/flagged issues] |
