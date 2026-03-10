# Pattern: Process Improvement

## Pattern Metadata

| Field | Value |
|-------|-------|
| Pattern Name | Process Improvement |
| Version | 1.0 |
| Owner | Operations Brain |
| Last Updated | 2026-02-03 |
| Applicable Modules | `02_process/`, `01_foundations/`, `06_metrics/` |

---

## Context (When to Use This Pattern)

Use this pattern when:
- A process is not meeting its performance targets (quality, speed, cost)
- Customer complaints or internal pain points indicate process failure
- Metrics show a declining or volatile trend for 3+ consecutive periods
- A process has not been reviewed or improved in 6+ months
- A new constraint (regulation, growth, technology) requires process change
- Post-mortem analysis identifies a process as the root cause of failure

Do NOT use this pattern when:
- The process does not exist yet (use process design instead)
- The process needs to be replaced entirely (use process redesign)
- The problem is a one-time incident, not a systemic issue

---

## Structure

```
PROCESS IMPROVEMENT FLOW:
+--------------------------------------------------+
| 1. SCOPE    --> Define the problem and boundaries|
| 2. MEASURE  --> Establish baseline performance   |
| 3. ANALYZE  --> Find root causes                 |
| 4. IMPROVE  --> Design and test solutions        |
| 5. CONTROL  --> Sustain the improvement          |
| 6. HANDOFF  --> Transfer to ongoing operations   |
+--------------------------------------------------+

This follows the DMAIC (Define, Measure, Analyze, Improve, Control)
framework from Six Sigma, adapted for general operations use.
```

---

## Steps

### Step 1: Scope the Improvement

```
SCOPING WORKSHEET:
+--------------------------------------------------+
| PROBLEM STATEMENT:                               |
| [What is the problem, in measurable terms?]      |
| Example: "Customer onboarding takes 14 days avg  |
|  vs. target of 5 days, causing 12% first-month   |
|  churn."                                         |
|                                                  |
| PROCESS BOUNDARIES:                              |
| Start point: [Where does the process begin?]     |
| End point: [Where does the process end?]         |
| In scope: [What is included?]                    |
| Out of scope: [What is excluded?]                |
|                                                  |
| STAKEHOLDERS:                                    |
| Process owner: [Name]                            |
| Improvement lead: [Name]                         |
| Team members: [Names]                            |
| Sponsor: [Name]                                  |
|                                                  |
| SUCCESS CRITERIA:                                |
| Metric 1: [From X to Y by date]                |
| Metric 2: [From X to Y by date]                |
|                                                  |
| CONSTRAINTS:                                     |
| Budget: [$X]                                     |
| Timeline: [X weeks]                              |
| Resources: [X people, Y% allocation]            |
+--------------------------------------------------+
```

### Step 2: Measure Current Performance

```
MEASUREMENT PROTOCOL:
1. Identify the key metrics for this process
   - Cycle time (per step and end-to-end)
   - Throughput (volume per period)
   - Quality (first-pass yield, defect rate)
   - Cost (per unit/transaction)
   - Customer satisfaction (if applicable)

2. Collect baseline data
   - Minimum 30 data points for statistical validity
   - Capture variation, not just averages
   - Document the measurement method

3. Create the current state map
   - Value stream map or process flow diagram
   - Identify value-added vs. non-value-added steps
   - Calculate VA ratio (VA time / total time)
   - Identify queues, rework loops, handoff delays

4. Document the baseline
   +--------------------------------------------------+
   | BASELINE SUMMARY:                                |
   | Metric              | Baseline | Target | Gap    |
   | Cycle time (avg)    | [X]      | [Y]    | [Z]   |
   | Throughput           | [X]      | [Y]    | [Z]   |
   | First-pass yield    | [X]%     | [Y]%   | [Z]%  |
   | Cost per unit       | $[X]     | $[Y]   | $[Z]  |
   | VA ratio            | [X]%     | [Y]%   | [Z]%  |
   +--------------------------------------------------+
```

### Step 3: Analyze Root Causes

```
ROOT CAUSE ANALYSIS PROTOCOL:
Apply multiple tools to triangulate root causes:

TOOL 1: 5 WHYS
Start with the problem. Ask "Why?" five times.
Each answer becomes the next question.
The final answer is the root cause (or close to it).

TOOL 2: FISHBONE (ISHIKAWA) DIAGRAM
Categories: People, Process, Technology, Environment,
           Materials, Measurement
Map potential causes in each category.

TOOL 3: PARETO ANALYSIS
Collect data on all causes.
Sort by frequency or impact (descending).
The top 20% of causes typically drive 80% of the problem.
Focus improvement on the vital few, not the trivial many.

TOOL 4: PROCESS WALK (GEMBA)
Walk the actual process from start to finish.
Observe, do not assume. Note waste, delays, workarounds.

OUTPUT:
+--------------------------------------------------+
| VALIDATED ROOT CAUSES:                           |
| 1. [Root cause -- evidence -- % contribution]   |
| 2. [Root cause -- evidence -- % contribution]   |
| 3. [Root cause -- evidence -- % contribution]   |
|                                                  |
| Total contribution of top 3 causes: [X]%        |
+--------------------------------------------------+
```

### Step 4: Design and Test Solutions

```
SOLUTION DESIGN PROTOCOL:
1. GENERATE solutions for each root cause
   - Brainstorm multiple options (minimum 3 per cause)
   - Include: eliminate, reduce, combine, automate, simplify

2. EVALUATE solutions
   +--------------------------------------------------+
   | Solution  | Impact | Effort | Risk | Priority    |
   |           | (1-5)  | (1-5)  | (1-5)| (ICE score)|
   | [Sol A]   | [X]    | [X]    | [X]  | [X]        |
   | [Sol B]   | [X]    | [X]    | [X]  | [X]        |
   | [Sol C]   | [X]    | [X]    | [X]  | [X]        |
   +--------------------------------------------------+

3. PILOT the top solution(s)
   - Small scale test (10-20% of volume)
   - Duration: 1-2 weeks minimum
   - Measure the same metrics as baseline
   - Compare pilot results to baseline
   - Decision: Scale / Modify / Abandon

4. IMPLEMENT at full scale
   - Rollout plan with timeline
   - Training for all affected team members
   - Communication to stakeholders
   - Monitoring plan for first 30 days
```

### Step 5: Control and Sustain

```
CONTROL PLAN:
+--------------------------------------------------+
| METRIC      | Target | Control Limit | Monitor    |
|             |        | (UCL/LCL)     | Frequency  |
| [Metric 1]  | [Y]    | [UCL/LCL]     | [Daily]   |
| [Metric 2]  | [Y]    | [UCL/LCL]     | [Weekly]  |
+--------------------------------------------------+
| RESPONSE PLAN:                                    |
| If metric exceeds control limit:                  |
| 1. [Immediate action]                            |
| 2. [Investigation required within X hours]       |
| 3. [Escalation if not resolved within X]         |
|                                                  |
| DOCUMENTATION:                                    |
| [ ] Updated SOP reflects new process             |
| [ ] Training materials updated                    |
| [ ] Dashboard/monitoring configured               |
| [ ] Control chart established                     |
| [ ] Process owner briefed on control plan         |
+--------------------------------------------------+
```

### Step 6: Handoff to Operations

```
HANDOFF CHECKLIST:
[ ] Improvement results documented (before vs. after)
[ ] Updated SOP approved by process owner
[ ] Team trained on new process
[ ] Monitoring and control plan active
[ ] Escalation path defined
[ ] Lessons learned documented in Memory/
[ ] Success criteria met (verified with data)
[ ] Sponsor sign-off obtained
```

---

## Verification

```
SUCCESS VERIFICATION:
+--------------------------------------------------+
| CRITERION                  | MET? | EVIDENCE     |
+----------------------------+------+--------------+
| Metrics improved vs.       | [Y/N]| [Data ref]  |
| baseline                   |      |              |
| Root causes addressed      | [Y/N]| [Data ref]  |
| Control plan active        | [Y/N]| [Dashboard] |
| SOP updated                | [Y/N]| [Doc link]  |
| Team trained               | [Y/N]| [Records]   |
| Sustained for 30+ days     | [Y/N]| [Trend data]|
+----------------------------+------+--------------+
| OVERALL: PASS / FAIL                             |
+--------------------------------------------------+
```

---

## Timeline

```
TYPICAL TIMELINE:
Week 1:     Scope and measure
Week 2-3:   Analyze (root cause investigation)
Week 3-4:   Design solutions
Week 4-5:   Pilot test
Week 5-6:   Full implementation
Week 6-10:  Control and stabilize
Week 10:    Handoff and close

Total: 8-10 weeks for a standard process improvement.
Complex improvements may take 12-16 weeks.
```

---

## Anti-Patterns

| Anti-Pattern | Description | Prevention |
|-------------|------------|------------|
| Solution-first | Jumping to solutions without analyzing root causes | Enforce Step 3 before Step 4 |
| No baseline | Improving without measuring current state | Step 2 is mandatory, not optional |
| No control plan | Improving but not sustaining | Step 5 is mandatory; no handoff without it |
| Boiling the ocean | Trying to fix everything at once | Scope to top 3 root causes maximum |
| Ignoring resistance | Implementing without managing the human side | Apply change management (see `08_excellence/`) |

---

**This pattern is the Operations Brain's standard approach to improving
any process. Follow the steps in order, measure rigorously, and do not
skip the control phase -- an improvement that does not stick is not an
improvement.**
