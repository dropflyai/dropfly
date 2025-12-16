# BROKEN AUTOMATION RUNBOOK
**Mandatory Recovery Path When Automation Fails**

---

## Purpose

This runbook defines the required behavior when an expected automation fails.

Automation failure is not permission to:
- fall back to manual steps
- ask the user to perform work
- bypass established solutions

Automation failure triggers recovery, not abandonment.

---

## Non-Negotiable Rule

> **Automation failure must produce a fix path.**

Silently switching to manual workflows is forbidden.

---

## Required Response to Automation Failure

When an automation fails, you MUST follow these steps in order:

### 1. Capture the Failure
- Record the exact command executed
- Capture full error output
- Identify environment context (local, CI, prod)

---

### 2. Diagnose
- Determine whether the failure is due to:
  - missing dependency
  - misconfiguration
  - environment mismatch
  - tooling version drift
  - invalid input
- Do not guess without evidence

---

### 3. Repair Attempt
- Fix the root cause
- Update configuration or scripts
- Re-run the automation

If repair succeeds, proceed normally.

---

### 4. Escalation (If Repair Fails)

If the automation cannot be repaired immediately:

- Document the failure here
- Propose a minimal automated workaround
- Define steps to restore the original automation

Manual steps are allowed ONLY if:
- they are explicitly documented
- they are labeled as temporary
- restoration steps are defined

---

### 5. Memory Update

After resolution:
- Update `Engineering/Solutions/SolutionIndex.md` if needed
- Update or add a Golden Path
- Log a regression if this failure loop occurred previously

---

## Forbidden Behavior

The following is explicitly disallowed:
- "I can't automate this"
- asking the user to copy/paste commands
- bypassing Solutions or Automations
- switching to manual mode without documentation

Any occurrence is a system failure.

---

## Completion Criteria

An automation failure is considered resolved only when:
- automation runs successfully OR
- a documented temporary workaround exists AND
- a restoration plan is recorded

---

**This runbook is mandatory and enforced.**
