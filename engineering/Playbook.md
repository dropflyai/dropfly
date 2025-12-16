# ENGINEERING PLAYBOOK
**Doctrine for Building, Evolving, and Maintaining Systems**

---

## Purpose

This Playbook defines how engineering work is conceived, executed, evolved, and retired.

It governs:
- project lifecycle decisions
- architectural evolution
- folder structure strategy
- refactor vs rebuild judgment
- deletion and cleanup authority
- long-term system health

If the Checklist defines *how to execute a task*, this Playbook defines *how to think like a principal engineer*.

---

## Core Doctrine

> **Build for correctness first, automation second, elegance third.**

Speed is a byproduct of discipline, not shortcuts.

---

## Project Lifecycle Stages

Every project flows through these stages. Skipping stages is not allowed.

### 1) Initiation
- Clarify the job-to-be-done in one sentence
- Declare Engineering Mode(s)
- Identify constraints and non-goals
- Choose the minimal viable architecture
- Decide what will explicitly NOT be built

Artifacts:
- Modes declaration
- Initial folder structure
- Verification plan

---

### 2) Construction
- Implement the smallest correct solution
- Prefer automation where repeatability exists
- Keep changes local and reversible
- Avoid speculative abstractions

Rules:
- No premature generalization
- No manual workflows if automation is feasible
- No silent assumptions

Artifacts:
- Working code
- Automation recipes (if created)
- Verification outputs

---

### 3) Verification
- Verify using authoritative tools
- Produce evidence for all claims
- Re-run failing paths after fixes

Rules:
- Tests and automation are mandatory where applicable
- UI requires Playwright verification (Chromium default)
- Database changes require migrations

Artifacts:
- Logs
- Test output
- Screenshots/traces (UI)

---

### 4) Shipping
- Confirm Completion Gate passes
- Ensure cleanup is complete
- Remove temporary scaffolding
- Validate deployment or handoff

Rules:
- No known failures allowed
- No TODOs without owners
- No debug artifacts remain

Artifacts:
- Final verification evidence
- Clean repo state

---

### 5) Maintenance
- Monitor for regressions
- Capture repeatable solutions
- Promote patterns to Solutions/Automations
- Prune dead code regularly

Rules:
- If it repeats, automate or document
- If it is unused, delete it
- If it confuses, simplify it

Artifacts:
- Updated SolutionIndex
- Updated Automations
- Regression entries (if needed)

---

## Folder Structure Strategy

### Default Principle

> **Structure follows behavior, not preference.**

Folders exist to reduce cognitive load, not to look organized.

---

### When to Create a Folder
Create a folder when:
- files share a clear responsibility
- the responsibility will persist
- grouping reduces search cost

Do not create folders:
- for future ideas
- "just in case"
- to mirror another project blindly

---

### When to Delete a Folder
Delete a folder when:
- it no longer has an owner
- it contains dead or unused code
- it represents an abandoned approach

Deletion is preferred over deprecation unless backward compatibility is required.

---

### Dynamic Evolution Rule

The folder structure is allowed to evolve over time.

Engineering is expected to:
- reorganize when clarity improves
- collapse abstractions when overbuilt
- split folders when responsibilities diverge

Cleanup rules always apply.

---

## Refactor vs Rebuild Decision

### Refactor When:
- core assumptions remain valid
- tests can guide changes
- behavior is mostly correct

### Rebuild When:
- assumptions are wrong
- complexity exceeds value
- patching creates fragility

Rule:
> **Refactor complexity; rebuild confusion.**

---

## Deletion Authority

Engineering has explicit authority to delete:
- dead code
- unused features
- obsolete scripts
- abandoned experiments

Rules:
- verify nothing depends on it
- remove references
- clean imports and configs
- commit deletions clearly

Deletion is not failure. It is progress.

---

## Automation Doctrine

- Automate repeatable work
- Document automation paths
- Never fall back silently to manual steps
- Repair automation when broken

Automation failure triggers recovery, not abandonment.

---

## Memory Doctrine

If knowledge prevents future work:
- capture it in Solutions
- promote it to a Golden Path if repeatable
- log regressions if loops occurred

The system must get smarter over time.

---

## Anti-Patterns (Explicitly Forbidden)

- speculative abstraction
- "we might need this later"
- copy-pasting workflows across projects
- manual steps without documentation
- leaving broken code "for later"

---

## Final Principle

> **Engineering is judged by system behavior over time, not initial output.**

Correctness, clarity, and maintainability are the primary measures of success.

---

**This Playbook is binding and enforced.**
