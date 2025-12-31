# Task Flow Framework — Authoritative

Before you design screens, map the steps.
A task flow prevents designing screens that don't connect.

---

## Purpose

Task flows exist to:
- visualize step-by-step user actions
- identify all screens and decisions
- reveal complexity before design
- ensure complete user paths
- document expected behaviors

Flows come before screens. Always.

---

## Flow Types

### Task Flow
Single user completing a specific task.
- Linear or branching
- One user, one goal
- Most detailed

### User Flow
Multiple paths through the product.
- Multiple entry points
- Alternative paths
- Broader scope

### Wireflow
Task flow with wireframes.
- Shows screens + connections
- High-detail documentation
- Design + flow combined

---

## Flow Notation

### Standard Symbols
```
┌─────────────┐
│   Action    │     Rectangular: User action / Screen
└─────────────┘

     ◇
    ╱ ╲
   ╱   ╲              Diamond: Decision point
   ╲   ╱
    ╲ ╱

  (  Start  )          Oval: Start / End points

      ↓                Arrow: Flow direction
      →
```

### Extended Notation
```
┌─────────────┐
│    Page     │        Screen / Page
└─────────────┘

╔═════════════╗
║    Modal    ║        Overlay / Modal
╚═════════════╝

┌ ─ ─ ─ ─ ─ ─ ┐
│   Optional  │        Optional step
└ ─ ─ ─ ─ ─ ─ ┘

┌─────────────┐
│   System    │───▶    System action (background)
└─────────────┘

    ●                  Connector (flow continues elsewhere)
```

---

## Task Flow Template

```
TASK FLOW: _______________
USER: _______________
GOAL: _______________
ENTRY POINT: _______________
SUCCESS CRITERIA: _______________
DATE: _______________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FLOW DIAGRAM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ( Start )
      │
      ▼
┌─────────────┐
│   Step 1    │
│  [Screen]   │
└──────┬──────┘
       │
       ▼
      ◇
     ╱ ╲
    ╱   ╲
   ╱     ╲
  ╱ Valid? ╲
  ╲       ╱
   ╲     ╱
    ╲   ╱
     ╲ ╱
      │
   Yes│          No
      ▼           │
┌─────────────┐   │
│   Step 2    │   │
│  [Screen]   │◀──┘
└──────┬──────┘
       │
       ▼
  ( End: Success )


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Step | Screen | User Action | System Response | Notes |
|------|--------|-------------|-----------------|-------|
| 1    |        |             |                 |       |
| 2    |        |             |                 |       |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ERROR PATHS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| From Step | Error | Handling | End State |
|-----------|-------|----------|-----------|
|           |       |          |           |

```

---

## Example: Create Workflow Task Flow

```
TASK: Create and run first workflow
USER: New user (Operations Olivia)
GOAL: Set up automated task
ENTRY: Dashboard (empty state)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ( Start: Dashboard Empty State )
                │
                ▼
       ┌────────────────┐
       │ Click "Create  │
       │   Workflow"    │
       └───────┬────────┘
               │
               ▼
       ┌────────────────┐
       │ Select Template│
       │   or Blank     │
       └───────┬────────┘
               │
               ▼
              ◇
            ╱   ╲
          ╱ Template? ╲
          ╲         ╱
            ╲     ╱
              ╲ ╱
               │
      Yes──────┼──────No
               │
               ▼           ▼
       ┌──────────┐   ┌──────────┐
       │ Pre-fill │   │  Blank   │
       │  Config  │   │  Canvas  │
       └────┬─────┘   └────┬─────┘
            └──────┬───────┘
                   │
                   ▼
          ┌────────────────┐
          │  Name Workflow │
          │  [Modal]       │
          └───────┬────────┘
                  │
                  ▼
          ┌────────────────┐
          │  Add Trigger   │
          │  [Builder]     │
          └───────┬────────┘
                  │
                  ▼
          ┌────────────────┐
          │  Add Actions   │
          │  [Builder]     │
          └───────┬────────┘
                  │
                  ▼
          ┌────────────────┐
          │  Review & Test │
          │  [Preview]     │
          └───────┬────────┘
                  │
                  ▼
                 ◇
               ╱   ╲
             ╱ Test OK? ╲
             ╲         ╱
               ╲     ╱
                 ╲ ╱
                  │
         No──────┼──────Yes
                  │
                  ▼           ▼
          ┌──────────┐   ┌──────────┐
          │  Edit &  │   │  Activate│
          │  Fix     │   │ Workflow │
          └────┬─────┘   └────┬─────┘
               │              │
               └──────────────┘
                      │
                      ▼
          ( End: Workflow Active, Dashboard )

```

---

## Decision Point Documentation

For each decision in the flow:

```
DECISION: _______________
LOCATION: Step ___

CONDITION: _______________

IF TRUE:
  → Next step: _______________
  → Screen: _______________

IF FALSE:
  → Next step: _______________
  → Screen: _______________

EDGE CASES:
  - _______________
  - _______________
```

---

## Error Flow Documentation

```
ERROR SCENARIO: _______________
TRIGGER: _______________
FROM STEP: _______________

ERROR HANDLING:
  1. User sees: _______________
  2. Options available: _______________
  3. Default action: _______________

RECOVERY PATH:
  → Returns to: _______________
  → State preserved: [ ] Yes [ ] No
  → Retry available: [ ] Yes [ ] No

PREVENTION:
  How could we prevent this?
  _______________
```

---

## Happy Path vs Edge Cases

### Happy Path (Primary Flow)
The ideal path with no errors or deviations.
- Document first
- Most common scenario
- Baseline for design

### Edge Cases
All the ways things can go wrong or differ.
```
| Edge Case | Likelihood | Handling | Documented? |
|-----------|------------|----------|-------------|
| Network error | Medium | Retry prompt | [ ] |
| Invalid input | High | Inline error | [ ] |
| Timeout | Low | Error + retry | [ ] |
| Permission denied | Low | Explain + guide | [ ] |
```

---

## Multi-Path User Flows

When users have multiple paths to same goal:

```
                        ( Start )
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ Entry A  │  │ Entry B  │  │ Entry C  │
        │ (Nav)    │  │ (Search) │  │ (Email)  │
        └────┬─────┘  └────┬─────┘  └────┬─────┘
             │             │             │
             └─────────────┼─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Common Step │
                    └──────┬───────┘
                           │
                           ▼
                    ( Same Outcome )
```

---

## Flow Metrics

Track these for each flow:

```
| Metric | Target | Actual | Notes |
|--------|--------|--------|-------|
| Steps to complete | ≤5 | | |
| Decision points | ≤3 | | |
| Error paths | Handled | | |
| Time to complete | <2 min | | |
| Abandonment rate | <10% | | |
```

---

## Flow to Screen Mapping

Connect flows to design:

```
| Step | Flow Action | Screen Name | URL/Route | Status |
|------|-------------|-------------|-----------|--------|
| 1 | View empty dashboard | Dashboard | /dashboard | Design |
| 2 | Click create | Create modal | /dashboard | Design |
| 3 | Select template | Template picker | /new | Design |
| 4 | Configure | Workflow builder | /workflows/new | Design |
```

---

## Flow Review Checklist

### Completeness
- [ ] All steps documented
- [ ] All decisions documented
- [ ] All error paths documented
- [ ] Entry points identified
- [ ] Exit points identified
- [ ] Edge cases listed

### Quality
- [ ] Flow is logical
- [ ] Steps are reasonable (not too many)
- [ ] User can always go back
- [ ] Error recovery is possible
- [ ] Success is achievable

### Alignment
- [ ] Matches user research
- [ ] Matches technical constraints
- [ ] Team has reviewed
- [ ] Stakeholders aligned

---

## Anti-Patterns (Avoid)

- Designing screens before flows
- Only happy path (no errors)
- Too many steps (>7-10)
- Dead ends (no way out)
- Assuming one path fits all
- Flows without screen mapping
- Ignoring edge cases

---

## Output Artifacts

After task flow work, you should have:
- [ ] Happy path flow diagram
- [ ] Error path documentation
- [ ] Decision point documentation
- [ ] Step-by-step details
- [ ] Flow-to-screen mapping
- [ ] Flow metrics/targets

---

## END OF TASK FLOW FRAMEWORK
