# GOLDEN PATHS
**Mandatory Execution Standards**

---

## Purpose

Golden Paths define the **only approved ways** to solve recurring problems.

If a Golden Path exists:
- it must be followed
- alternatives are forbidden unless explicitly approved
- deviation requires documentation and justification

Golden Paths exist to eliminate:
- re-solving known problems
- tool amnesia
- manual fallback loops
- inconsistent execution

---

## Enforcement Rule

> **If a Golden Path exists, you MUST use it.**

Failure to follow a Golden Path is a correctness failure.

---

## Golden Path Structure (Required)

Every Golden Path must include:

1. **Problem**
2. **Approved Tooling**
3. **Canonical Commands / Steps**
4. **Expected Artifacts**
5. **Verification**
6. **Failure Handling**
7. **References** (recipes, runbooks)

If any section is missing, the Golden Path is incomplete.

---

## Example Categories (Non-Exhaustive)

Golden Paths commonly apply to:
- database migrations
- UI verification
- automation workflows
- CI/CD pipelines
- log retrieval
- environment setup
- cleanup and deletion
- agent workflows

---

## Deviation Rules

Deviation from a Golden Path is allowed **only if**:
- the Golden Path is broken
- the break is documented in a runbook
- a fix or replacement path is proposed
- the Solution Index is updated

Shortcuts are forbidden.

---

## Discovery Rule

When a new reliable solution is discovered:
1. Promote it to a Golden Path
2. Add it to the Solution Index
3. Link recipes and runbooks
4. Log prior regressions prevented

This is mandatory.

---

## Anti-Pattern

The following behavior is explicitly forbidden:
- "We did it manually this time"
- "Let's just try this"
- "It worked before"
- "Can you paste this and tell me what happens"

Golden Paths exist so this never happens.

---

## System Goal

> **Every repeated task should converge to one Golden Path.**

Over time, the system becomes:
- faster
- safer
- simpler
- impossible to regress

---

**Golden Paths are binding and enforced.**
