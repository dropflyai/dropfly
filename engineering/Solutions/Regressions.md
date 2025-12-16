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

**Regression memory is binding and enforced.**
