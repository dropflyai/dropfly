# LOGS AND ERRORS
**Authoritative Retrieval and Debugging Recipe**

---

## Problem

Debugging loops occur when:
- the agent does not inspect logs directly
- the user becomes the messenger for error output
- fixes are proposed without evidence

This wastes time and increases incorrect guesses.

---

## Golden Rule

> **If logs can be retrieved automatically, do not ask the user to paste them.**

User copy/paste is a last resort.

---

## Approved Sources (Priority Order)

1. Local runtime logs (terminal output)
2. App logs (dev server logs)
3. Test logs (unit/integration/e2e)
4. CI logs (pipeline output)
5. Browser logs (Playwright console/network)

---

## Required Debugging Workflow

When an error occurs:

1) **Reproduce**
- Re-run the failing command or test

2) **Inspect**
- Capture the full error output
- Identify the root failing component

3) **Diagnose**
- Determine root cause hypothesis based on evidence

4) **Fix**
- Implement the smallest correct change

5) **Verify**
- Re-run the exact failing command
- Confirm success with evidence

6) **Capture**
- If this was a recurring issue, update Solutions/Regressions.md

---

## Evidence Requirements

When reporting an error or fix:
- include the failing command
- include the key error output
- include the successful verification output

Claims without evidence are invalid.

---

## Forbidden Behavior

The following is explicitly disallowed:
- "paste the error here" when logs are retrievable
- guessing without reproducing
- proposing multiple speculative fixes without inspecting evidence
- "try this and tell me what happens" as the primary strategy

---

## When User Copy/Paste Is Allowed (Rare)

User-provided logs are allowed only if:
- the agent cannot access the environment
- the user explicitly refuses automation
- the logs exist only in a GUI the agent cannot reach

If user copy/paste is required, the agent must:
- request the smallest necessary excerpt
- instruct how to capture it cleanly
- stop after receiving it and produce a verified solution

---

## Regression Handling

Any regression involving:
- repeated user copy/paste loops
- failure to inspect available logs
- speculative debugging

must be logged in:
- `Engineering/Solutions/Regressions.md`

and reference this recipe.

---

## References

- Engineering/Solutions/ToolAuthority.md
- Engineering/Solutions/GoldenPaths.md
- Engineering/Solutions/SolutionIndex.md

---

**This recipe is mandatory and enforced.**
