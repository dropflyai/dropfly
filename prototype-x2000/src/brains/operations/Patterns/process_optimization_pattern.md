# Process Optimization Pattern

> A structured pattern for systematically identifying, analyzing, and eliminating waste in operational processes -- based on Lean, Six Sigma DMAIC, and Theory of Constraints methodologies.

---

## Context

This pattern applies when an existing process needs to be made faster, cheaper, more reliable, or more scalable. Unlike the Process Improvement Pattern (which addresses underperforming or broken processes), this pattern is for optimizing processes that work but can be significantly better.

**Use this pattern when:**
- A process is functional but inefficient (high cycle time, excessive cost, manual steps)
- Throughput needs to increase without proportional headcount growth
- Quality is acceptable but variation is too high
- Customer experience is adequate but not competitive
- Automation opportunities exist but have not been prioritized
- A process is being prepared for scale (10x volume increase)

**Do NOT use this pattern for:**
- Broken processes that need fundamental redesign (use Process Improvement Pattern)
- New process creation (use process design methodology in `02_process/`)
- One-time projects with no repeating workflow

---

## Phase 1: Define and Scope (Week 1)

### Objective
Clearly define what process is being optimized, what "better" means, and what constraints apply.

### Process Selection Criteria

| Criterion | Weight | Score (1-5) | Weighted Score |
|-----------|--------|------------|----------------|
| Business impact (revenue, cost, customer) | 30% | | |
| Volume (frequency of execution) | 20% | | |
| Pain level (complaints, errors, delays) | 20% | | |
| Feasibility of improvement | 15% | | |
| Strategic alignment | 15% | | |
| **Total** | **100%** | | **/5.0** |

### Scope Definition

| Element | Specification |
|---------|--------------|
| Process name | |
| Process owner | |
| Start point (trigger) | |
| End point (output delivered) | |
| In scope | |
| Out of scope | |
| Optimization objective | [ ] Speed [ ] Cost [ ] Quality [ ] Scalability [ ] All |
| Target improvement | ___% improvement in [metric] within [timeframe] |

### Stakeholder Alignment

| Stakeholder | Role | Interest | Engagement Level |
|------------|------|---------|-----------------|
| Process owner | Accountable for outcome | | [ ] Inform [ ] Consult [ ] Collaborate [ ] Lead |
| Process workers | Execute the process daily | | [ ] Inform [ ] Consult [ ] Collaborate |
| Customers (internal/external) | Receive the output | | [ ] Inform [ ] Consult |
| Leadership sponsor | Provide resources and air cover | | [ ] Inform [ ] Consult |

---

## Phase 2: Measure and Map (Weeks 1-2)

### Objective
Create a detailed, data-driven picture of the current process.

### Process Mapping

Create a detailed process map capturing every step, decision point, handoff, wait state, and rework loop.

| Step # | Activity | Actor | System | Duration | Wait Time | Value-Add? |
|--------|---------|-------|--------|----------|-----------|-----------|
| 1 | | | | min/hr | min/hr | [ ] VA [ ] NVA [ ] BNVA |
| 2 | | | | min/hr | min/hr | [ ] VA [ ] NVA [ ] BNVA |
| 3 | | | | min/hr | min/hr | [ ] VA [ ] NVA [ ] BNVA |

**Key:**
- VA = Value-Adding (customer would pay for this)
- NVA = Non-Value-Adding (waste -- eliminate)
- BNVA = Business Non-Value-Adding (necessary but not value-creating -- minimize)

### Baseline Metrics

| Metric | Current Value | Measurement Method | Data Period |
|--------|-------------|-------------------|------------|
| Cycle time (end to end) | | | |
| Process time (active work only) | | | |
| Wait time (delays, queues) | | | |
| Throughput (units per time period) | | | |
| Error / defect rate | | | |
| Rework rate | | | |
| Cost per transaction | | | |
| Customer satisfaction (related) | | | |

### Process Efficiency Ratio

```
Process Efficiency = Process Time / Cycle Time x 100%

World-class: > 25%
Good: 10-25%
Typical: 5-10%
Poor: < 5%

Current: ____%
```

### Waste Identification (Eight Wastes -- DOWNTIME)

| Waste Type | Definition | Found in This Process? | Examples |
|-----------|-----------|----------------------|---------|
| **D**efects | Errors requiring rework or correction | [ ] Yes [ ] No | |
| **O**verproduction | Producing more than needed or too early | [ ] Yes [ ] No | |
| **W**aiting | Idle time between steps, approvals, handoffs | [ ] Yes [ ] No | |
| **N**on-utilized talent | Underusing people's skills or knowledge | [ ] Yes [ ] No | |
| **T**ransportation | Unnecessary movement of materials or data | [ ] Yes [ ] No | |
| **I**nventory | Excess WIP, backlogs, or queued items | [ ] Yes [ ] No | |
| **M**otion | Unnecessary human effort (clicks, context switches) | [ ] Yes [ ] No | |
| **E**xtra processing | Steps that add no value to the customer | [ ] Yes [ ] No | |

---

## Phase 3: Analyze Root Causes (Week 2-3)

### Objective
Identify the root causes of waste, inefficiency, and variation in the process.

### Constraint Identification (Theory of Constraints)

The constraint is the single step that limits the throughput of the entire process.

| Step | Capacity (units/time) | Utilization | Is This the Constraint? |
|------|---------------------|------------|----------------------|
| | | % | [ ] Yes [ ] No |
| | | % | [ ] Yes [ ] No |
| | | % | [ ] Yes [ ] No |

**The system constraint is:** _________________________

**Constraint management (Five Focusing Steps):**
1. **Identify** the constraint (done above)
2. **Exploit** -- maximize throughput at the constraint without spending money
3. **Subordinate** -- align all other steps to support the constraint
4. **Elevate** -- invest to increase capacity at the constraint
5. **Repeat** -- find the new constraint after this one is resolved

### Root Cause Analysis

For each major waste or inefficiency identified, determine the root cause.

**5 Whys Method:**

| Problem | Why 1 | Why 2 | Why 3 | Why 4 | Why 5 (Root Cause) |
|---------|-------|-------|-------|-------|-------------------|
| | | | | | |
| | | | | | |

### Pareto Analysis

Rank the causes of waste or defects by frequency or impact to focus on the vital few.

| Cause | Frequency / Impact | Cumulative % | Priority |
|-------|-------------------|-------------|---------|
| | | % | |
| | | % | |
| | | % | |

**Pareto principle:** 80% of the waste typically comes from 20% of the causes. Focus on the top 2-3 causes.

---

## Phase 4: Design Improvements (Week 3-4)

### Objective
Design specific, implementable improvements that address the root causes identified.

### Improvement Strategies

| Strategy | Description | When to Apply |
|----------|-----------|--------------|
| Eliminate | Remove the step entirely | Step adds no value (NVA) |
| Combine | Merge sequential steps into one | Steps have the same actor or system |
| Reorder | Change the sequence of steps | Dependencies allow parallelization |
| Simplify | Reduce complexity within a step | Step has unnecessary substeps or decisions |
| Automate | Replace manual work with technology | Step is repetitive, rule-based, high-volume |
| Standardize | Create SOPs to reduce variation | Step is done differently by different people |
| Parallelize | Run steps concurrently instead of sequentially | No dependency between steps |

### Improvement Opportunity Matrix

| Opportunity | Root Cause Addressed | Strategy | Expected Impact | Effort | Priority |
|------------|---------------------|----------|----------------|--------|---------|
| | | Eliminate/Combine/Automate/etc. | ___% improvement in [metric] | [ ] Low [ ] Med [ ] High | |
| | | | | | |
| | | | | | |

### Automation Decision Framework

For each manual step, evaluate automation potential:

| Step | Frequency | Rule-Based? | Data Available? | Error-Prone? | Automate? |
|------|----------|-----------|----------------|-------------|-----------|
| | /day | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No [ ] Partial |
| | /day | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No [ ] Partial |

**Automation ROI threshold:** Automate if the step runs > 50 times/month AND takes > 5 minutes per execution AND is > 80% rule-based.

### Future State Design

| Metric | Current State | Target State | Improvement |
|--------|-------------|-------------|-------------|
| Cycle time | | | ___% reduction |
| Process time | | | ___% reduction |
| Error rate | | | ___% reduction |
| Cost per transaction | $ | $ | ___% reduction |
| Process efficiency ratio | % | % | ___pp improvement |

---

## Phase 5: Implement and Verify (Weeks 4-8)

### Objective
Implement improvements incrementally, measure results, and lock in gains.

### Implementation Sequence

Implement improvements in order of: highest impact, lowest effort, lowest risk.

| Phase | Improvement | Owner | Start | End | Go/No-Go Criteria |
|-------|-----------|-------|-------|-----|-------------------|
| Quick wins (Week 4-5) | | | | | |
| Medium effort (Week 5-6) | | | | | |
| Larger changes (Week 6-8) | | | | | |

### Pilot Protocol

For significant changes, pilot before full rollout:

| Element | Specification |
|---------|--------------|
| Pilot scope | (subset of volume, specific team, single region) |
| Pilot duration | weeks |
| Success criteria | [metric] achieves [target] with [confidence] |
| Rollback plan | (how to revert if the pilot fails) |
| Decision date | |

### Verification and Control

| Metric | Baseline | Target | Post-Implementation | Target Met? |
|--------|---------|--------|-------------------|-------------|
| | | | | [ ] Yes [ ] No |
| | | | | [ ] Yes [ ] No |
| | | | | [ ] Yes [ ] No |

### Sustainability Measures

To prevent regression to old ways of working:

| Measure | Description |
|---------|-------------|
| Updated SOPs | Document the new process in standard operating procedures |
| Training | Train all process workers on the new method |
| Monitoring | Set up automated dashboards for key process metrics |
| Control limits | Define upper and lower control limits; alert on breach |
| Ownership | Assign a process owner accountable for ongoing performance |
| Review cadence | Schedule periodic reviews (monthly or quarterly) |

---

## Anti-Patterns

| Anti-Pattern | Why It Fails | Better Approach |
|-------------|-------------|-----------------|
| Optimizing without measuring | No baseline, cannot prove improvement | Measure first, then optimize |
| Automating a bad process | Automates the waste along with the work | Fix the process, then automate |
| Boiling the ocean | Trying to optimize everything at once | Focus on the constraint; fix one thing at a time |
| Ignoring the people | Process workers resist changes they had no input on | Involve workers in mapping and improvement design |
| Declaring victory too early | Gains regress without control mechanisms | Implement monitoring and sustainability measures |
| Over-engineering | Building complex solutions for simple problems | Simplest effective solution wins |
| Optimizing non-constraints | Improving a step that is not the bottleneck | Theory of Constraints: only the constraint matters |

---

## Optimization Maturity Model

| Level | Description | Characteristics |
|-------|-----------|----------------|
| 1: Ad Hoc | No formal process optimization | Firefighting, heroics, inconsistent results |
| 2: Measured | Baseline metrics exist | Dashboards in place, but improvement is reactive |
| 3: Managed | Systematic improvement projects | DMAIC projects, waste reduction, pilot-and-scale |
| 4: Optimized | Continuous improvement culture | Kaizen events, worker-driven improvements, real-time monitoring |
| 5: Predictive | Data-driven and self-optimizing | ML-driven process adjustments, predictive anomaly detection |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Process Map Template | `Templates/process_map_template.md` |
| SOP Template | `Templates/sop_template.md` |
| Lean Principles | `01_foundations/` |
| Operational Metrics | `06_metrics/` |
| Scaling Operations | `Patterns/scaling_operations_pattern.md` |
| Automation Brain | `/prototype_x1000/automation_brain/` |
| Engineering Brain | `/prototype_x1000/engineering_brain/` |

---

*Pattern version: 1.0*
*Brain: Operations Brain*
*Reference: 01_foundations/, 02_process/, 06_metrics/*
