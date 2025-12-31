# CHROMIUM
**Default Browser Authority for UI Automation**

---

## Problem

Browser ambiguity causes:
- inconsistent test results
- flakiness across environments
- wasted debugging time
- "works locally" failures

When a browser is not explicitly defined, verification becomes unreliable.

---

## Golden Rule

> **Chromium is the default browser for UI verification unless explicitly overridden.**

This is mandatory.

---

## Approved Use

Chromium must be used for:
- Playwright UI verification
- end-to-end flows
- regression checks
- UI screenshots/traces

See:
- `Engineering/Solutions/Recipes/Playwright.md`

---

## Deviations (Strict)

Deviation from Chromium is allowed only if:
- the product requires Safari/WebKit-specific behavior
- the product requires Firefox-specific behavior
- a known bug exists in Chromium affecting the test validity

Any deviation must be:
- explicitly stated
- justified
- documented in a solution recipe or ADR

---

## Evidence Requirement

Whenever browser choice matters, include:
- which browser was used
- why it was used
- where the configuration lives

---

## Forbidden Behavior

The following is explicitly disallowed:
- "Playwright default" without confirming browser
- switching browsers without stating it
- "try a different browser" as a guess-first strategy

Browser changes require justification.

---

## Regression Handling

Any regression involving:
- wrong browser choice
- flaky UI results due to browser ambiguity

must be logged in:
- `Engineering/Solutions/Regressions.md`

and reference this recipe.

---

## References

- Engineering/Solutions/Recipes/Playwright.md
- Engineering/Solutions/ToolAuthority.md
- Engineering/Solutions/GoldenPaths.md

---

**This recipe is mandatory and enforced.**
