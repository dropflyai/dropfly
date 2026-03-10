# Brain Delegation Template

## Instructions

This template is used by the CEO Brain every time it delegates work to
one or more specialist brains. It ensures that delegations are clear,
complete, and trackable. Every delegation must specify what is needed,
from which brain, with what quality criteria, by when, and how the output
will be reviewed.

For single-brain delegations, complete Sections 1-4.
For multi-brain delegations, complete all sections.

---

## Section 1: Delegation Overview

```
DELEGATION ID: [YYYY-MM-DD-XXX]
DATE: [Date]
REQUESTED BY: [User / CEO Brain / Other brain]
URGENCY: [Critical / High / Medium / Low]
TYPE: [Single-brain / Multi-brain]
OPERATING MODE: [BUILD / OPERATE / CRISIS / STRATEGY / DELEGATE]
```

### Goal Statement
[One paragraph describing what needs to be accomplished and why]

### Success Criteria
- [ ] [Measurable criterion 1]
- [ ] [Measurable criterion 2]
- [ ] [Measurable criterion 3]

### Kill Criteria
If [condition], stop this delegation and report back to CEO Brain.

---

## Section 2: Brain Assignment

### Primary Brain

```
BRAIN: [Brain name]
PATH: [/prototype_x1000/[brain_name]/]
ROLE: [Lead / Sole executor]
REASON FOR SELECTION: [Why this brain is the right choice]
```

### Supporting Brains (if multi-brain)

| Brain | Path | Role | Specific Deliverable |
|-------|------|------|---------------------|
| [Brain 2] | [Path] | Contributor | [What they deliver] |
| [Brain 3] | [Path] | Reviewer | [What they review] |
| [Brain 4] | [Path] | Contributor | [What they deliver] |

### Decision Quality Check

Before proceeding, the CEO Brain has verified:

```
DECISION QUALITY FRAMEWORK:
- [ ] Decision classified: [Type 1 / Type 2]
- [ ] Right brain(s) selected (consulted brain_routing.md)
- [ ] Incentives audit: No conflicts of interest between brains
- [ ] Second-order effects considered
- [ ] Tradeoffs are explicit (documented below)
- [ ] Kill criteria defined
- [ ] Speed calibrated to decision type
```

### Tradeoffs

| We are choosing | Over | Because |
|----------------|------|---------|
| [Choice A] | [Alternative A] | [Rationale] |
| [Choice B] | [Alternative B] | [Rationale] |

---

## Section 3: Task Specification

### For Single-Brain Delegation

```
TASK SPECIFICATION
+--------------------------------------------------+
| TASK: [Clear description of what to produce]     |
|                                                  |
| CONTEXT:                                         |
| [Background information the brain needs]         |
| [Relevant files, prior decisions, constraints]   |
|                                                  |
| REQUIREMENTS:                                    |
| 1. [Specific requirement]                       |
| 2. [Specific requirement]                       |
| 3. [Specific requirement]                       |
|                                                  |
| FORMAT:                                          |
| [How the output should be structured/formatted]  |
|                                                  |
| CONSTRAINTS:                                     |
| - [Time constraint]                             |
| - [Resource constraint]                          |
| - [Quality constraint]                           |
| - [Scope constraint]                             |
|                                                  |
| REFERENCES:                                      |
| - [Relevant files or modules to consult]        |
| - [Relevant patterns to follow]                 |
| - [Relevant templates to use]                   |
|                                                  |
| DUE DATE: [Date]                                |
+--------------------------------------------------+
```

### For Multi-Brain Delegation

```
TASK DECOMPOSITION
+--------------------------------------------------+
| Phase 1: [Phase name]                            |
|   Brain: [Brain name]                            |
|   Task: [What to do]                            |
|   Duration: [Estimated time]                     |
|   Dependencies: [None / Depends on Phase X]      |
|   Deliverable: [What is produced]                |
|                                                  |
| Phase 2: [Phase name]                            |
|   Brain: [Brain name]                            |
|   Task: [What to do]                            |
|   Duration: [Estimated time]                     |
|   Dependencies: [Depends on Phase 1]             |
|   Deliverable: [What is produced]                |
|                                                  |
| Phase 3: [Phase name]                            |
|   Brain: [Brain name]                            |
|   Task: [What to do]                            |
|   Duration: [Estimated time]                     |
|   Dependencies: [Depends on Phase 1]             |
|   Deliverable: [What is produced]                |
+--------------------------------------------------+

CRITICAL PATH: Phase 1 --> Phase 2 --> [Total: X days/weeks]
PARALLEL WORK: Phase 3 runs alongside Phase 2
```

---

## Section 4: Quality Gates and Review

### Acceptance Criteria

| Criterion | How to Measure | Threshold |
|-----------|---------------|-----------|
| [Criterion 1] | [Measurement method] | [Pass/Fail threshold] |
| [Criterion 2] | [Measurement method] | [Pass/Fail threshold] |
| [Criterion 3] | [Measurement method] | [Pass/Fail threshold] |

### Review Process

```
REVIEWER: [CEO Brain / Other brain / User]
REVIEW METHOD: [How the output will be reviewed]
REVIEW TIMELINE: [How long for review]
REVISION POLICY: [Max N revisions before escalation]
```

### Delegation Level

```
DELEGATION LEVEL: [Select one]
[ ] Level 1: Tell -- CEO Brain decided. Execute this exactly.
[ ] Level 2: Sell -- CEO Brain decided. Here is why. Execute.
[ ] Level 3: Consult -- CEO Brain wants input before deciding.
[ ] Level 4: Agree -- Let us decide together.
[ ] Level 5: Advise -- Here is CEO Brain input. You decide.
[ ] Level 6: Inquire -- You decide. Tell me what you chose.
[ ] Level 7: Delegate -- You decide. Full autonomy.
```

---

## Section 5: Multi-Brain Coordination (if applicable)

### Handoff Contracts

```
HANDOFF 1: [Brain A] --> [Brain B]
+--------------------------------------------------+
| Deliverable: [What is being handed off]          |
| Format: [How it should be structured]            |
| Acceptance Criteria:                             |
| - [ ] [Criterion 1]                            |
| - [ ] [Criterion 2]                            |
| Due: [Date]                                      |
| Review: [Who reviews, how long]                  |
+--------------------------------------------------+

HANDOFF 2: [Brain B] --> [Brain C]
+--------------------------------------------------+
| [Same format as above]                           |
+--------------------------------------------------+
```

### Integration Points

```
INTEGRATION REVIEW 1:
  When: [After which handoff / milestone]
  Participants: [Which brains]
  Check: [What to verify]

INTEGRATION REVIEW 2:
  When: [After which handoff / milestone]
  Participants: [Which brains]
  Check: [What to verify]
```

### Conflict Resolution

```
If brains disagree during this delegation:
1. Brains present their positions to CEO Brain
2. CEO Brain applies ruling criteria
3. Ruling is documented here
4. Both brains commit to the ruling

RULING LOG:
[Empty until a conflict arises]
```

---

## Section 6: Tracking and Completion

### Status Tracking

```
STATUS: [Not Started / In Progress / Under Review / Complete / Blocked]
LAST UPDATED: [Date]

PROGRESS LOG:
[Date]: [Status update]
[Date]: [Status update]
[Date]: [Status update]
```

### Completion Checklist

```
- [ ] All deliverables received
- [ ] All acceptance criteria met
- [ ] Quality gate passed
- [ ] Output integrated (if multi-brain)
- [ ] User informed of completion
- [ ] Learnings logged to Memory/
- [ ] Patterns updated (if new pattern discovered)
```

### Post-Delegation Review

```
+--------------------------------------------------+
| DELEGATION REVIEW                                |
|                                                  |
| WAS THE RIGHT BRAIN SELECTED?                    |
| [Yes / No -- if no, which brain would be better?]|
|                                                  |
| WAS THE SPECIFICATION CLEAR?                     |
| [Yes / No -- what was ambiguous?]               |
|                                                  |
| WAS THE QUALITY ACCEPTABLE?                      |
| [Yes / No -- what needs improvement?]           |
|                                                  |
| WAS THE TIMELINE MET?                            |
| [Yes / No -- why not?]                          |
|                                                  |
| ROUTING UPDATE NEEDED?                           |
| [Yes / No -- what should change in routing?]    |
|                                                  |
| PATTERN UPDATE NEEDED?                           |
| [Yes / No -- what pattern should be added?]     |
+--------------------------------------------------+
```

---

## Quick Reference: Delegation Checklist

Before submitting any delegation:

```
- [ ] Goal is clear and specific
- [ ] Success criteria are measurable
- [ ] Kill criteria are defined
- [ ] Right brain(s) selected (routing table consulted)
- [ ] Task specification is complete
- [ ] Format and constraints are explicit
- [ ] Quality gates and acceptance criteria are defined
- [ ] Review process is specified
- [ ] Timeline is realistic
- [ ] Dependencies are mapped (multi-brain)
- [ ] Handoff contracts exist (multi-brain)
- [ ] Conflict resolution protocol is understood
```

---

**This template is used for every delegation the CEO Brain makes. It
ensures clarity, accountability, and quality across all brain interactions.
No delegation should proceed without this template completed.**
