# REGRESSIONS
**Failure Memory and Loop Prevention**

---

## Purpose

This document records known failure loops and regressions.

Once a regression is logged here:
- it must never occur again
- recurrence is treated as a system failure
- the corrective solution becomes mandatory

This file exists to eliminate:
- repeated mistakes
- forgotten tooling
- manual fallback loops
- wasted time re-solving solved problems

---

## Enforcement Rule

> **A logged regression may not reoccur.**

If it does:
- the task must stop
- the failure must be acknowledged
- the Solution Index and Golden Path must be re-validated

---

## What Counts as a Regression

A regression includes (but is not limited to):

- reverting from automation to manual steps
- asking the user to copy/paste logs or errors that can be retrieved
- forgetting mandatory tooling (Playwright, Chromium, CLI workflows)
- assuming time/date instead of retrieving it
- reintroducing deleted dead code
- repeating a previously solved debugging loop

---

## Required Regression Entry Format

Each regression entry must include:

### <Regression Title>
- **Symptom:** What happened
- **Root Cause:** Why it occurred
- **Incorrect Behavior:** What was done wrong
- **Correct Solution:** What must be done instead
- **Enforced Path:** Link to Golden Path / Recipe
- **Prevention Mechanism:** How this prevents recurrence
- **Date Logged:**
- **Logged By:**

Incomplete entries are invalid.

---

## Example (Template Only)

### Manual Supabase Editor Fallback
- **Symptom:** Suggested pasting SQL into Supabase editor
- **Root Cause:** Automation path not consulted
- **Incorrect Behavior:** Manual copy/paste recommendation
- **Correct Solution:** Use CLI/MCP migration workflow
- **Enforced Path:** Engineering/Solutions/Recipes/Supabase.md
- **Prevention Mechanism:** ToolAuthority + Golden Path
- **Date Logged:** YYYY-MM-DD
- **Logged By:** Engineering Brain

---

## Mandatory Usage

Whenever a repeated failure loop is detected:
1. Stop the task
2. Log the regression here
3. Link the enforced solution
4. Update SolutionIndex if needed
5. Resume only after correction

---

## System Goal

> **No failure is allowed to happen twice without being recorded and prevented.**

Over time, this file should grow while failures disappear.

---

## Governance Violations (Auto-Log)

**Mandatory self-reporting of Engineering Brain rule violations.**

The agent MUST log governance violations when detected or corrected.

### What Qualifies as a Governance Violation

A governance violation occurs when the agent:
- Declares multiple primary modes (violates `Engineering/Modes.md`)
- Proceeds without explicit artifact type declaration (violates `Engineering/OutputContracts.md`)
- Plans verification strategy misaligned with declared artifact type
- Proposes manual verification where automated verification exists
- Makes assumptions without retrieving repo evidence (file existence, dependencies, structure)
- Makes navigation or routing assumptions later corrected by user or evidence
- Skips preflight checklist steps (violates `Engineering/Checklist.md`)
- Bypasses automation when automation exists (violates `Engineering/Automations/`)

### When Logging Is Required

Logging is **mandatory** when:
- A violation is detected mid-task and corrected
- A user corrects an architectural or planning error
- A verification strategy must be revised due to artifact type mismatch
- An assumption is proven incorrect by evidence
- A governance rule is bypassed and later enforced

### Required Entry Format

Each governance violation entry MUST include:

**### <Violation Title>**
- **Date/Time:** YYYY-MM-DD HH:MM
- **Task/Context:** Brief description of what was being attempted
- **Rule Violated:** Which Engineering Brain rule was broken (with file reference)
- **Why It Happened:** Root cause (assumption, incomplete preflight, misread requirements)
- **Corrective Action Taken:** What was done to fix the violation
- **Preventative Rule/Pattern Added:** Link to updated SolutionIndex, Recipe, or Golden Path

Incomplete entries are invalid.

### Consultation Requirement

During preflight, the agent MUST:
- Search this section for governance violations matching the current task type
- Apply preventative patterns from previous violations
- If a similar violation has occurred previously, apply the logged preventative rule immediately

### Escalation Rule

If the same governance violation occurs **more than twice**:
- A mandatory constraint MUST be added to `Engineering/Solutions/SolutionIndex.md`
- The constraint becomes a hard gate in the relevant checklist
- Further violations are treated as system corruption

---

## Failure Is Data

**Governance violations are not shame. They are signal.**

Every violation logged here:
- Prevents future repetition
- Hardens the system against a specific failure mode
- Improves institutional memory
- Reduces user burden to correct the same error repeatedly

The goal is not perfection. The goal is **learning that compounds**.

Over time:
- Common violations disappear
- Rare edge cases emerge
- Patterns strengthen
- Failure becomes rarer

A system that logs its failures is a system that improves.

---

**Regression memory is binding and enforced.**
