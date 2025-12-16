# PLAYWRIGHT
**Authoritative UI Verification Recipe**

---

## Problem

Manual UI verification is unreliable and does not scale.

Relying on:
- visual inspection
- user confirmation
- screenshots without automation

leads to missed regressions and false confidence.

---

## Golden Rule

> **All UI verification must be automated using Playwright.**

Manual verification is forbidden when Playwright can be used.

---

## Approved Tool

- **Playwright** is the mandatory UI automation framework.

If Playwright is not installed, it must be installed or documented why it cannot be.

---

## Browser Authority

- Browser selection defaults to **Chromium**.
- Any deviation must be explicitly justified and documented.

See:
- `Engineering/Solutions/Recipes/Chromium.md`
- `Engineering/Solutions/ToolAuthority.md`

---

## Canonical Capabilities

Playwright must be used to verify:
- page rendering
- navigation
- user interactions
- form submission
- error states
- console errors
- network failures

---

## Required Usage Pattern

At minimum, UI verification must:
1. Launch the app
2. Navigate to the relevant page(s)
3. Perform critical interactions
4. Assert expected UI state
5. Capture failures automatically

---

## Evidence Requirements

When Playwright is used, produce at least one of:
- screenshots
- traces
- test output logs

Claims without artifacts are invalid.

---

## Forbidden Behavior

The following is explicitly disallowed:
- asking the user to manually check UI
- claiming UI correctness without Playwright
- skipping UI verification "for now"
- relying on screenshots without automation context

Any occurrence is a correctness failure.

---

## Failure Handling

If Playwright tests fail:
1. Inspect logs and traces
2. Fix the root cause
3. Re-run tests
4. Only proceed when tests pass

If Playwright cannot run:
- document why
- log in `Engineering/Solutions/Regressions.md`
- provide an automated alternative if possible

---

## Regression Handling

Any regression involving UI verification must:
- be logged in `Engineering/Solutions/Regressions.md`
- reference this recipe as the enforced solution

---

## References

- Engineering/Solutions/ToolAuthority.md
- Engineering/Solutions/GoldenPaths.md
- Engineering/Solutions/SolutionIndex.md

---

**This recipe is mandatory and enforced.**
