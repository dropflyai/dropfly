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

## Screenshot Content Verification (MANDATORY)

**Problem Scenario:**
User asks for screenshots of app pages. Agent takes screenshots but they all show login screens because navigation failed. Agent claims "here's the portfolio page screenshot" but it's actually a login screen. Verification does not catch this.

**3-Step Protocol for ALL Screenshots:**

### Step 1: Element-Based Verification (Before Screenshot)
```javascript
// Identify expected elements for the claimed page
await expect(page.locator('h1')).toContainText('Portfolio');
await expect(page.locator('.project-card')).toHaveCount(3);
await expect(page).toHaveURL(/.*portfolio/);

// If these fail → screenshot claim is INVALID, stop here
```

### Step 2: Screenshot Capture
```javascript
// Only take screenshot AFTER element verification passes
await page.screenshot({
  path: 'portfolio-page.png',
  fullPage: true
});
```

### Step 3: Visual Description (After Screenshot)
After taking screenshot, you MUST:
1. Read the screenshot (use your vision capability)
2. Describe what you see
3. Compare to claimed page/state
4. Confirm match or declare mismatch

**Output Format:**
```
Claim: Screenshot of portfolio page
Element verification: ✓ h1="Portfolio", ✓ 3 project cards, ✓ URL=/portfolio
Screenshot: portfolio-page.png
Visual description: I see a portfolio header, 3 project cards with images and titles, navigation menu, footer
Content matches claim: ✓
```

**Failure Detection:**
- **Login screen when not expected** → FAIL: "Visual description: I see a login form with email/password fields. Expected: portfolio page. Content does NOT match claim: ✗"
- **Error page** → FAIL
- **Empty/blank page** → FAIL
- **Wrong page entirely** → FAIL

### Enforcement

- No screenshot claim is valid without this 3-step protocol
- If visual description reveals mismatch → verification FAILS immediately
- Must report failure, do not claim success
- Log repeated failures to FailureArchive

---

## Forbidden Behavior

The following is explicitly disallowed:
- asking the user to manually check UI
- claiming UI correctness without Playwright
- skipping UI verification "for now"
- relying on screenshots without automation context
- **claiming screenshot shows X when content verification was skipped**
- **taking screenshot without element assertions first**

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
