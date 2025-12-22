# SOLUTION INDEX
**Institutional Memory — Authoritative Entry Point**

---

## Purpose

This index lists solved problems and mandated "Golden Paths."

If a solution exists here, it must be used.

This file is the first stop before proposing:
- tooling choices
- workflows
- automation approaches
- verification approaches
- debugging steps

If it is not checked first, the system is operating incorrectly.

---

## How to Use This Index

For any task:
1) Search this file for relevant entries
2) Follow the linked recipe/runbook
3) If a new solution is discovered:
   - add it here immediately
   - create a recipe
   - log the regression if it prevents a loop

---

## Core Solutions (Mandated)

### Time and Date (No Assumptions)
- Recipe: `Engineering/Solutions/Recipes/TimeAndDate.md`
- Authority: `Engineering/Solutions/ToolAuthority.md`

### UI Verification (Automation Required)
- Recipe: `Engineering/Solutions/Recipes/Playwright.md`
- Browser Default: `Engineering/Solutions/Recipes/Chromium.md`
- Authority: `Engineering/Solutions/ToolAuthority.md`

### Logs and Errors (No User Copy/Paste if Retrievable)
- Recipe: `Engineering/Solutions/Recipes/LogsAndErrors.md`
- Authority: `Engineering/Solutions/ToolAuthority.md`

### Database Changes (Automation-First)
- Recipe: `Engineering/Solutions/Recipes/Supabase.md`
- Authority: `Engineering/Solutions/ToolAuthority.md`
- Emergency rules: see `Engineering/Solutions/Runbooks/AutomationBroken.md`

### CI / Verification Discipline
- Recipe: `Engineering/Solutions/Recipes/CI.md`
- Runbook: `Engineering/Solutions/Runbooks/AutomationBroken.md`

### Secrets Detection (Pre-Commit Security Gate)
- Recipe: `Engineering/Solutions/Recipes/SecretsDetection.md`
- Authority: `Engineering/Security.md`
- Gate: `Engineering/Checklist.md` - Security Gate C.1
- Severity: P0 CRITICAL (public exposure of active credentials)
- Prevention: `.gitignore-template` in `Engineering/`

---

## Regression Memory (Must Be Updated)
- Log every repeated failure loop here:
  - `Engineering/Solutions/Regressions.md`

---

## Golden Paths (Required Reference)
- Golden paths are defined here:
  - `Engineering/Solutions/GoldenPaths.md`

---

## Add New Entries Template

When adding a new solution, add it in this format:

### <Solution Name>
- Problem:
- Golden Path:
- Recipe:
- Runbook (if applicable):
- Notes:

---

**Solution Index is binding.**
