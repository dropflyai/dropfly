# UI Test Failure -- Operational Runbook

**Purpose:** Structured response procedure when Playwright or other UI tests fail.
**Owner:** Engineering Brain
**Severity Range:** SEV-3 (single flaky test) to SEV-1 (entire test suite blocked)
**Cross-reference:** `Automations/Recipes/Playwright.md`, `Solutions/SolutionIndex.md`

---

## 1. Failure Mode Identification

Before debugging, classify the failure. The classification determines the fix strategy.

### 1.1 Flaky Test (Intermittent)

**Signature:** Test passes on retry, fails inconsistently, different tests fail each run.
**Indicators:**
- Passes locally but fails in CI (or vice versa)
- Passes 7 out of 10 runs
- Failure message involves timing (timeout, element not visible, navigation not complete)
- Different assertion fails each time

**Root causes:** Race conditions, insufficient waits, animation interference, network timing, shared mutable state between tests.

### 1.2 Regression (Consistent Failure)

**Signature:** Test fails every run, was passing before a specific commit.
**Indicators:**
- Fails 10 out of 10 runs locally and in CI
- Failure started after a known code change
- Assertion error clearly shows expected vs. actual mismatch
- The tested feature is visibly broken in the browser

**Root causes:** Code change broke the feature, intentional behavior change without test update, dependency update with breaking change.

### 1.3 Environment Failure (CI-Only)

**Signature:** Test passes locally but consistently fails in CI.
**Indicators:**
- All local runs pass, all CI runs fail
- Error mentions missing browser, display, or dependency
- Timeout values that work locally are too short for CI
- Screenshot shows blank page or loading spinner

**Root causes:** Different browser version, missing system dependency, slower CI hardware, missing environment variable, network restrictions in CI.

### 1.4 Selector Failure (Element Changed)

**Signature:** Test fails because it cannot find an element on the page.
**Indicators:**
- Error: `locator.click: Error: strict mode violation` or `waiting for selector "..." timeout`
- The page renders correctly in the browser but the test cannot find the element
- A recent PR changed component markup or class names
- CSS refactor or component library upgrade

**Root causes:** HTML structure changed, class names changed, IDs removed, component was replaced.

---

## 2. Diagnostics

### 2.1 Check Screenshots and Video Artifacts

Playwright captures screenshots on failure and optionally records video.

```bash
# Find test artifacts
ls test-results/
ls test-results/<test-name>-*/

# Open the failure screenshot
open test-results/<test-name>-*/test-failed-1.png

# Play the trace (most informative)
npx playwright show-trace test-results/<test-name>-*/trace.zip
```

The trace viewer shows:
- Every action the test performed
- DOM snapshots at each step
- Network requests and responses
- Console logs and errors

**Always check the trace first.** It is the single most useful diagnostic artifact.

### 2.2 Check Test Logs

```bash
# Run the specific failing test with verbose output
npx playwright test <test-file> --reporter=list --debug

# Run with headed browser to watch it execute
npx playwright test <test-file> --headed

# Run with Playwright Inspector for step-by-step debugging
npx playwright test <test-file> --debug
```

### 2.3 Reproduce Locally

```bash
# Run the exact test that failed in CI
npx playwright test <test-file>:<line-number>

# Run with the same browser as CI
npx playwright test <test-file> --project=chromium

# Run with retries disabled to confirm consistent failure
npx playwright test <test-file> --retries=0

# Run multiple times to detect flakiness
for i in {1..5}; do npx playwright test <test-file> --retries=0; done
```

### 2.4 Check for Timing Issues

If the test involves waiting for elements, animations, or network requests:

```bash
# Slow down execution to observe behavior
npx playwright test <test-file> --headed --slow-mo=500

# Check if the test has hardcoded waits
grep -n "waitForTimeout\|sleep\|setTimeout" <test-file>
```

Hardcoded waits (`page.waitForTimeout(3000)`) are a code smell. They indicate the test is not properly waiting for a condition.

### 2.5 Check Browser Console

```typescript
// Add this to the test temporarily to capture console output
page.on('console', msg => console.log('BROWSER:', msg.text()));
page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
```

Look for:
- JavaScript errors that break the page
- Failed network requests (CORS, 404, 500)
- Missing environment variables in the frontend

---

## 3. Fix Strategies by Failure Mode

### 3.1 Flaky Test Fixes

**Add proper waits instead of hardcoded timeouts:**

```typescript
// BAD: Hardcoded wait
await page.waitForTimeout(3000);
await page.click('#submit');

// GOOD: Wait for the specific condition
await page.waitForSelector('#submit', { state: 'visible' });
await page.click('#submit');

// BETTER: Use Playwright's auto-waiting locator API
await page.getByRole('button', { name: 'Submit' }).click();
```

**Isolate test state:**

```typescript
// BAD: Tests share state
test('creates user', async () => { /* creates user "alice" */ });
test('deletes user', async () => { /* assumes "alice" exists */ });

// GOOD: Each test sets up its own state
test('deletes user', async () => {
  await createTestUser('alice');  // explicit setup
  await page.goto('/users');
  // ... delete alice
});
```

**Handle animations:**

```typescript
// Disable animations in test config
use: {
  launchOptions: {
    args: ['--disable-animations'],
  },
},
```

**Add retry for genuinely non-deterministic behavior:**

```typescript
// In playwright.config.ts -- use sparingly
retries: process.env.CI ? 2 : 0,
```

### 3.2 Regression Fixes

1. **Identify the breaking commit:**
   ```bash
   git bisect start
   git bisect bad HEAD
   git bisect good <last-known-good-commit>
   # Run the test at each bisect step
   git bisect run npx playwright test <test-file> --retries=0
   ```

2. **Determine intent:**
   - Was the behavior change intentional? If yes, update the test.
   - Was the behavior change a bug? If yes, fix the code.

3. **Update test assertions:**
   ```typescript
   // If the feature behavior intentionally changed
   // Update the assertion to match the new behavior
   await expect(page.getByText('New Expected Text')).toBeVisible();
   ```

### 3.3 Environment Fixes

**Browser version mismatch:**
```bash
# Install the exact browsers Playwright expects
npx playwright install --with-deps

# Check installed browser versions
npx playwright --version
```

**CI-specific configuration:**
```typescript
// playwright.config.ts
export default defineConfig({
  timeout: process.env.CI ? 60000 : 30000,
  expect: {
    timeout: process.env.CI ? 10000 : 5000,
  },
  use: {
    actionTimeout: process.env.CI ? 15000 : 10000,
  },
});
```

**Missing dependencies in CI:**
```yaml
# Ensure system dependencies are installed
- name: Install Playwright Browsers
  run: npx playwright install --with-deps chromium
```

### 3.4 Selector Fixes

**Replace fragile selectors with robust ones:**

```typescript
// BAD: Fragile selectors
await page.click('.btn-primary.mt-4.submit-btn');
await page.click('#root > div > form > button:nth-child(3)');
await page.click('text=Submit');  // fragile if text changes with i18n

// GOOD: Use data-testid attributes
await page.click('[data-testid="submit-button"]');

// BETTER: Use Playwright's role-based locators
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByLabel('Email').fill('test@example.com');
await page.getByPlaceholder('Search...').fill('query');
```

**Add data-testid to the component:**
```tsx
// In the component
<button data-testid="submit-button" onClick={handleSubmit}>
  Submit
</button>
```

---

## 4. When to Quarantine Tests

Quarantine is a last resort. Use it only when:

- The test has been flaky for more than 5 business days with no clear fix.
- The flakiness is blocking the CI pipeline for the entire team.
- A dedicated investigation ticket has been created.

### 4.1 How to Quarantine

```typescript
// Mark the test as fixme (skipped but tracked)
test.fixme('flaky: user profile update', async ({ page }) => {
  // Original test code stays intact
});
```

### 4.2 Quarantine Rules

- [ ] Create a tracking ticket with label `test:quarantine`
- [ ] Include the failure rate (e.g., "fails 3 out of 10 runs")
- [ ] Include the error message and any diagnostic artifacts
- [ ] Set a review deadline (max 2 weeks)
- [ ] Add a comment in the test explaining why it is quarantined

### 4.3 Quarantine Review

Every quarantined test must be reviewed at the deadline. Options:

1. **Fix it** -- Root cause found, apply fix, unquarantine.
2. **Rewrite it** -- Test approach is fundamentally flawed, rewrite from scratch.
3. **Delete it** -- Feature was removed or test provides no value.
4. **Extend quarantine** -- Only with director approval and a new deadline.

---

## 5. Prevention

### 5.1 Use data-testid Attributes

Every interactive element that tests need to target should have a `data-testid`:

```tsx
<button data-testid="save-draft">Save Draft</button>
<input data-testid="search-input" />
<div data-testid="user-list" />
```

### 5.2 Avoid Fragile Selectors

Selector fragility ranking (most fragile first):

1. CSS path selectors (`div > ul > li:nth-child(2)`) -- NEVER use
2. Class-based selectors (`.btn-primary`) -- Avoid
3. Text selectors (`text=Submit`) -- Acceptable for stable text
4. Test ID selectors (`[data-testid="submit"]`) -- Good
5. Role-based selectors (`getByRole('button', { name: 'Submit' })`) -- Best

### 5.3 Use Playwright Auto-Waiting

Playwright's locator API auto-waits for elements. Prefer it over manual waits:

```typescript
// Auto-waits for the element to be visible and actionable
await page.getByRole('button', { name: 'Submit' }).click();

// Auto-waits for the text to appear
await expect(page.getByText('Success')).toBeVisible();
```

### 5.4 Test Isolation

- Each test should be independent. No test should depend on another test's side effects.
- Use `beforeEach` for common setup, not a "setup test" that runs first.
- Clean up test data in `afterEach` or use unique identifiers per test run.

### 5.5 CI Configuration Best Practices

```typescript
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,  // Serial in CI if resources are limited
  reporter: process.env.CI
    ? [['html'], ['github']]
    : [['list']],
  use: {
    trace: 'on-first-retry',    // Capture trace on retry
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
```

---

## 6. Post-Incident

### 6.1 Update SolutionIndex.md

```markdown
| UITestFailure-<YYYYMMDD> | [brief description] | Runbooks/UITestFailure.md | [date] |
```

### 6.2 Log to Memory

```markdown
## [Date] -- UI Test Failure: [test name]

- **Failure mode:** [flaky | regression | environment | selector]
- **Root cause:** [specific cause]
- **Fix applied:** [what changed]
- **Prevention added:** [what stops recurrence]
```

---

## Quick Reference

```
CLASSIFY FAILURE -> CHECK ARTIFACTS -> REPRODUCE -> FIX BY TYPE -> VERIFY -> PREVENT -> DOCUMENT
```

**Remember:** Check the trace first. Use role-based selectors. Never silence flaky tests.
