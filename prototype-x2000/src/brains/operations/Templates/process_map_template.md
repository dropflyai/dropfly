# Process Mapping Template

> A structured template for documenting, analyzing, and improving business processes -- from current state mapping through future state design, gap analysis, and implementation planning.

---

## Process Map Header

| Field | Input |
|-------|-------|
| Process Name | |
| Process ID | |
| Process Owner | |
| Mapper | |
| Date Created | |
| Last Updated | |
| Map Type | [ ] Current State (As-Is) [ ] Future State (To-Be) [ ] Ideal State |
| Level of Detail | [ ] Level 1 (Overview) [ ] Level 2 (Detailed) [ ] Level 3 (Work Instructions) |
| Status | [ ] Draft [ ] Validated [ ] Approved |

---

## Section 1: Process Overview

### Process Identity

| Element | Description |
|---------|-------------|
| Process name | |
| Process purpose | Why does this process exist? What value does it create? |
| Process trigger | What event starts this process? |
| Process end point | What defines a completed process instance? |
| Process frequency | How often does this process execute? (daily, weekly, per event) |
| Average volume | How many instances per time period? |
| Process customer | Who receives the output of this process? (internal or external) |

### Process Boundaries

| Boundary | Definition |
|----------|-----------|
| Start point | The event or input that initiates the process |
| End point | The output or state that marks process completion |
| In scope | Activities included in this process map |
| Out of scope | Activities excluded (handled by other processes) |
| Upstream process | What feeds into this process |
| Downstream process | What this process feeds into |

---

## Section 2: Process Participants

### Swim Lane Roles

| Lane | Role / Department | Responsibilities |
|------|------------------|-----------------|
| Lane 1 | | |
| Lane 2 | | |
| Lane 3 | | |
| Lane 4 | | |
| Lane 5 | | |

### Systems and Tools

| System / Tool | Used In Steps | Purpose |
|--------------|--------------|---------|
| | | |
| | | |
| | | |
| | | |

---

## Section 3: Process Steps (Tabular)

### Step-by-Step Documentation

| Step # | Step Name | Description | Performer | System | Input | Output | Time | Decision? |
|--------|----------|-------------|-----------|--------|-------|--------|------|-----------|
| 1 | | | | | | | min | [ ] Yes [ ] No |
| 2 | | | | | | | min | [ ] Yes [ ] No |
| 3 | | | | | | | min | [ ] Yes [ ] No |
| 4 | | | | | | | min | [ ] Yes [ ] No |
| 5 | | | | | | | min | [ ] Yes [ ] No |
| 6 | | | | | | | min | [ ] Yes [ ] No |
| 7 | | | | | | | min | [ ] Yes [ ] No |
| 8 | | | | | | | min | [ ] Yes [ ] No |
| 9 | | | | | | | min | [ ] Yes [ ] No |
| 10 | | | | | | | min | [ ] Yes [ ] No |

### Decision Points

| Decision # | At Step | Question | Yes Path | No Path | Decision Criteria |
|-----------|---------|---------|----------|---------|------------------|
| D1 | | | Go to Step __ | Go to Step __ | |
| D2 | | | Go to Step __ | Go to Step __ | |
| D3 | | | Go to Step __ | Go to Step __ | |

---

## Section 4: Visual Process Map

### Swim Lane Diagram

```
LANE 1: [Role/Dept]
|  [Step 1]  -->  [Step 2]  -->  [Decision D1]
|                                 /        \
|                               YES         NO
|                                |           |
LANE 2: [Role/Dept]              |           |
|                            [Step 3]    [Step 4]
|                                |           |
|                                v           v
LANE 3: [Role/Dept]          [Step 5]  -->  [Step 6]
|                                             |
|                                             v
LANE 4: [Role/Dept]                       [Step 7]  -->  [End]
```

### Symbol Key

| Symbol | Meaning |
|--------|---------|
| [ ] Rectangle | Process step / activity |
| < > Diamond | Decision point |
| ( ) Oval | Start / End |
| --> Arrow | Flow direction |
| [ ] with wavy bottom | Document / output |
| --- Dashed line | Swim lane boundary |

---

## Section 5: Process Metrics (Current State)

### Time Analysis

| Metric | Value | Unit | Notes |
|--------|-------|------|-------|
| Total process time (end-to-end) | | min/hrs/days | |
| Total value-added time | | min/hrs | Steps that create value for the customer |
| Total non-value-added time | | min/hrs | Wait time, rework, handoffs, approvals |
| Process efficiency ratio | | % | Value-added time / Total time x 100 |
| Average wait time between steps | | min/hrs | |
| Number of handoffs | | count | Each transfer between people/systems |
| Number of decision points | | count | |
| Number of rework loops | | count | Steps where work goes backward |

### Step-Level Analysis

| Step | Value-Add? | Time | Wait Time After | Handoff? | Automation Potential |
|------|-----------|------|----------------|----------|---------------------|
| 1 | [ ] VA [ ] NVA [ ] Necessary NVA | min | min | [ ] Yes | [ ] High [ ] Med [ ] Low [ ] None |
| 2 | [ ] VA [ ] NVA [ ] Necessary NVA | min | min | [ ] Yes | [ ] High [ ] Med [ ] Low [ ] None |
| 3 | [ ] VA [ ] NVA [ ] Necessary NVA | min | min | [ ] Yes | [ ] High [ ] Med [ ] Low [ ] None |
| 4 | [ ] VA [ ] NVA [ ] Necessary NVA | min | min | [ ] Yes | [ ] High [ ] Med [ ] Low [ ] None |
| 5 | [ ] VA [ ] NVA [ ] Necessary NVA | min | min | [ ] Yes | [ ] High [ ] Med [ ] Low [ ] None |

**Value-Add Classification:**
- VA (Value-Add): Customer would pay for this step.
- NVA (Non-Value-Add): Waste -- eliminate if possible.
- Necessary NVA: No value to customer but required (compliance, legal, safety).

### Quality Metrics

| Metric | Current Value | Target | Gap |
|--------|-------------|--------|-----|
| First-pass yield (% correct without rework) | % | % | |
| Error rate per process instance | | | |
| Customer satisfaction (if applicable) | | | |
| Defect rate | | | |

---

## Section 6: Pain Points and Waste Identification

### Pain Points

| # | Pain Point | Step(s) Affected | Impact | Frequency | Root Cause |
|---|-----------|-----------------|--------|-----------|-----------|
| 1 | | | [ ] High [ ] Med [ ] Low | | |
| 2 | | | [ ] High [ ] Med [ ] Low | | |
| 3 | | | [ ] High [ ] Med [ ] Low | | |
| 4 | | | [ ] High [ ] Med [ ] Low | | |
| 5 | | | [ ] High [ ] Med [ ] Low | | |

### Waste Classification (Eight Wastes -- DOWNTIME)

| Waste Type | Present? | Where? | Impact |
|-----------|----------|--------|--------|
| **D**efects (errors requiring rework) | [ ] Yes [ ] No | | |
| **O**verproduction (doing more than needed) | [ ] Yes [ ] No | | |
| **W**aiting (idle time between steps) | [ ] Yes [ ] No | | |
| **N**on-utilized talent (skills underused) | [ ] Yes [ ] No | | |
| **T**ransportation (unnecessary movement of info/materials) | [ ] Yes [ ] No | | |
| **I**nventory (work-in-progress pile-up) | [ ] Yes [ ] No | | |
| **M**otion (unnecessary actions within a step) | [ ] Yes [ ] No | | |
| **E**xtra processing (over-engineering) | [ ] Yes [ ] No | | |

---

## Section 7: Future State Design (To-Be)

### Improvement Opportunities

| # | Improvement | Type | Steps Affected | Expected Impact | Effort |
|---|------------|------|---------------|----------------|--------|
| 1 | | [ ] Eliminate [ ] Automate [ ] Simplify [ ] Combine | | | [ ] Low [ ] Med [ ] High |
| 2 | | [ ] Eliminate [ ] Automate [ ] Simplify [ ] Combine | | | [ ] Low [ ] Med [ ] High |
| 3 | | [ ] Eliminate [ ] Automate [ ] Simplify [ ] Combine | | | [ ] Low [ ] Med [ ] High |
| 4 | | [ ] Eliminate [ ] Automate [ ] Simplify [ ] Combine | | | [ ] Low [ ] Med [ ] High |
| 5 | | [ ] Eliminate [ ] Automate [ ] Simplify [ ] Combine | | | [ ] Low [ ] Med [ ] High |

### Future State Metrics (Target)

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| Total process time | | | % reduction |
| Process efficiency ratio | % | % | pp improvement |
| Number of handoffs | | | reduction |
| Error rate | | | % reduction |
| Automation rate | % | % | pp improvement |

---

## Section 8: Implementation Plan

| # | Change | Owner | Dependencies | Timeline | Status |
|---|--------|-------|-------------|----------|--------|
| 1 | | | | | [ ] Planned [ ] In Progress [ ] Complete |
| 2 | | | | | [ ] Planned [ ] In Progress [ ] Complete |
| 3 | | | | | [ ] Planned [ ] In Progress [ ] Complete |
| 4 | | | | | [ ] Planned [ ] In Progress [ ] Complete |

---

## Section 9: Validation

### Process Map Validation Checklist

- [ ] All steps identified and documented
- [ ] All decision points have clear criteria
- [ ] All inputs and outputs identified
- [ ] All performers/roles assigned
- [ ] Time estimates validated with process participants
- [ ] Pain points confirmed with people who do the work
- [ ] Process map walked through with the team
- [ ] Metrics baselined with real data
- [ ] Future state reviewed with stakeholders

---

*Template version: 1.0*
*Brain: Operations Brain*
*Reference: Patterns/process_improvement_pattern.md, 02_process/*
