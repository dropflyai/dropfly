# Multi-Brain Project Pattern -- Coordinating 3+ Brains

## Situation

This pattern applies when a project requires the coordinated output of
three or more specialist brains. Multi-brain projects are the most
complex orchestration challenge the CEO Brain faces, because they
require dependency management, handoff coordination, conflict resolution,
and integrated quality assurance.

Examples of multi-brain projects:
- Building a new product (Product + Design + Engineering + QA + Marketing)
- Entering a new market (Research + Legal + Localization + Marketing + Ops)
- Fundraising (Finance + Legal + Investor + Design + Content)
- Scaling operations (Operations + HR + Engineering + Finance)
- Competitive response (Research + MBA + Product + Marketing + Sales)

---

## Prerequisites

- The task has been identified as multi-brain (not routable to a single brain)
- CEO Brain has performed initial decomposition
- Sufficient resources and runway exist for the project
- A clear goal and success criteria have been defined

---

## Approach: Seven Steps

### Step 1: Goal Definition and Success Criteria

```
PROJECT DEFINITION
+--------------------------------------------------+
| PROJECT NAME: [Name]                             |
| GOAL: [One sentence]                             |
| SUCCESS CRITERIA:                                |
| - [Measurable criterion 1]                      |
| - [Measurable criterion 2]                      |
| - [Measurable criterion 3]                      |
| KILL CRITERIA: If [condition], we stop.          |
| TIMELINE: [Target completion]                    |
| DRI: [CEO Brain or designated lead brain]        |
+--------------------------------------------------+
```

### Step 2: Brain Identification and Role Assignment

```
BRAIN ASSIGNMENT MATRIX
+--------------------------------------------------+
| Brain         | Role          | Deliverables      |
+--------------------------------------------------+
| [Brain 1]     | Lead          | [Primary outputs] |
| [Brain 2]     | Contributor   | [Specific outputs] |
| [Brain 3]     | Contributor   | [Specific outputs] |
| [Brain 4]     | Reviewer      | [Review scope]    |
| CEO Brain     | Coordinator   | Integration, gates |
+--------------------------------------------------+
```

Roles:
- **Lead Brain:** Owns the primary deliverable and coordinates with
  other brains day-to-day
- **Contributor Brain:** Provides specific deliverables to the lead
- **Reviewer Brain:** Reviews output for quality in their domain
- **Coordinator:** CEO Brain oversees the whole project

### Step 3: Task Decomposition and Dependency Mapping

Apply the full task decomposition framework (02_orchestration/task_decomposition.md):

```
TASK GRAPH
+--------------------------------------------------+
| Task 1 (Brain A) [Week 1-2]                     |
|   |                                              |
|   +---> Task 2 (Brain B) [Week 2-3]            |
|   |       |                                      |
|   |       +---> Task 4 (Brain D) [Week 3-5]    |
|   |                                              |
|   +---> Task 3 (Brain C) [Week 2-4]            |
|           |                                      |
|           +---> Task 4 (Brain D) [Week 3-5]    |
|                                                  |
| Critical Path: 1 --> 2 --> 4 (5 weeks)          |
| Parallel: Task 3 runs alongside Task 2          |
+--------------------------------------------------+
```

### Step 4: Handoff Contract Definition

For every brain-to-brain transition, define a handoff contract:

```
HANDOFF CONTRACT [Task X --> Task Y]
+--------------------------------------------------+
| From: [Producer Brain]                           |
| To: [Consumer Brain]                             |
| Deliverable: [What]                              |
| Format: [How it should be structured]            |
| Acceptance Criteria:                             |
| - [ ] [Specific, measurable criterion]          |
| - [ ] [Specific, measurable criterion]          |
| Due: [Date]                                      |
| Review Period: [Days for review]                 |
| Revision Window: [Days for fixes]                |
+--------------------------------------------------+
```

### Step 5: Execution with Coordination Check-ins

```
COORDINATION CADENCE
+--------------------------------------------------+
| DAILY (async):                                   |
|   Each active brain posts status:                |
|   - What was accomplished                        |
|   - What is blocked                              |
|   - What is needed from other brains             |
|                                                  |
| WEEKLY (sync):                                   |
|   CEO Brain reviews:                             |
|   - Progress against critical path               |
|   - Handoff readiness                            |
|   - Blocker resolution                           |
|   - Quality concerns                             |
|                                                  |
| AT EACH HANDOFF:                                 |
|   Handoff review:                                |
|   - Does deliverable meet acceptance criteria?   |
|   - Accept / Accept with notes / Reject          |
+--------------------------------------------------+
```

### Step 6: Integration and Quality Gates

```
INTEGRATION REVIEW (at major milestones)
+--------------------------------------------------+
| REVIEW: [Milestone name]                         |
| DATE: [Date]                                     |
| BRAINS PRESENT: [All active brains]              |
|                                                  |
| INTEGRATION CHECK:                               |
| - [ ] All deliverables fit together             |
| - [ ] No assumption mismatches                  |
| - [ ] No gaps between brain responsibilities    |
| - [ ] Consistent quality across all brains      |
| - [ ] On track for timeline and success criteria|
|                                                  |
| ISSUES FOUND:                                    |
| 1. [Issue] --> Owner: [Brain] --> Due: [Date]   |
| 2. [Issue] --> Owner: [Brain] --> Due: [Date]   |
|                                                  |
| DECISION: CONTINUE / ADJUST / ESCALATE           |
+--------------------------------------------------+
```

### Step 7: Retrospective and Learning

After project completion, conduct a multi-brain retrospective:

```
MULTI-BRAIN RETROSPECTIVE
+--------------------------------------------------+
| PROJECT: [Name]                                  |
| DURATION: [Weeks]                                |
| BRAINS: [List]                                   |
|                                                  |
| WHAT WORKED:                                     |
| - [Specific coordination success]               |
| - [Specific handoff success]                    |
|                                                  |
| WHAT DID NOT WORK:                               |
| - [Specific coordination failure]               |
| - [Specific handoff failure]                    |
|                                                  |
| ROOT CAUSES:                                     |
| - [Why coordination failed]                     |
|                                                  |
| IMPROVEMENTS:                                    |
| - [Specific improvement] --> Owner: [Brain]     |
|                                                  |
| PATTERN UPDATES:                                 |
| - [Any updates to this pattern]                 |
|                                                  |
| ROUTING UPDATES:                                 |
| - [Any updates to brain_routing.md]             |
+--------------------------------------------------+
```

---

## Conflict Resolution During Multi-Brain Projects

When brains disagree during a project:

```
CONFLICT RESOLUTION PROTOCOL
1. Identify the conflict precisely (what, between whom, why)
2. Each brain states their position and reasoning (1 minute each)
3. CEO Brain identifies the tradeoff dimensions
4. Apply ruling criteria:
   - User value > Engineering convenience
   - Revenue impact > Aesthetic preference
   - Long-term health > Short-term speed
   - Reversible decisions get less deliberation
5. CEO Brain makes the ruling
6. Both brains commit fully to the ruling
7. Document the ruling and rationale in project log
```

---

## Scaling Multi-Brain Projects

For projects with 8+ brains, add a program management layer:

```
CEO Brain (Program Level)
  |
  +-- Workstream 1 (Lead Brain A)
  |     +-- Brain B
  |     +-- Brain C
  |
  +-- Workstream 2 (Lead Brain D)
  |     +-- Brain E
  |     +-- Brain F
  |
  +-- Workstream 3 (Lead Brain G)
        +-- Brain H
        +-- Brain I

CEO Brain coordinates between workstreams.
Lead Brains coordinate within workstreams.
Integration gates happen at workstream merge points.
```

---

## Common Pitfalls

| Pitfall | Description | Prevention |
|---------|------------|-----------|
| Missing brain | A needed brain is not included | Check routing table at Step 2 |
| Handoff by hope | No formal handoff contract | Mandatory handoff contracts |
| CEO bottleneck | Every decision routes through CEO | Delegate within-workstream to lead brain |
| Integration surprise | Pieces do not fit at the end | Integration reviews at milestones |
| Scope expansion | New brains added mid-project | Scope freeze at Step 3 |
| No retrospective | Miss the learning opportunity | Retrospective is mandatory |

---

## Example: Building a Developer API Platform

```
Goal: Build and launch a public API platform with documentation
Brains: Product, Engineering, Design, QA, DevRel, Content, Security, Cloud
Timeline: 16 weeks

Workstream 1 (Product + Engineering Lead):
  - API design and implementation
  - Authentication and rate limiting
  - SDK development (JS, Python, Go)

Workstream 2 (DevRel + Content Lead):
  - API documentation
  - Getting started tutorials
  - Code examples and recipes

Workstream 3 (Design + Engineering Lead):
  - Developer portal UI/UX
  - Dashboard for API keys and usage
  - Interactive API playground

Cross-cutting: Security review, Cloud infrastructure, QA testing

Integration Gates:
  - Week 4: API design reviewed by all
  - Week 8: Documentation matches implementation
  - Week 12: Portal integrates with API correctly
  - Week 15: Full integration test, security audit
  - Week 16: Launch readiness review
```

---

**The multi-brain project pattern is the CEO Brain's operational backbone.
Every project that requires 3+ brains follows this structure. The pattern
ensures coordination, quality, and learning across all brain interactions.**
