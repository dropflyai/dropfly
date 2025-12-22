# ENGINEERING CHECKLIST
**Mandatory Preflight + Execution + Completion Gate**

---

## Purpose

This checklist is a non-negotiable gate.

It exists to ensure every task follows the Engineering Constitution:
- mode is declared
- solutions are consulted
- automation is preferred
- verification produces evidence
- cleanup is completed
- memory is updated

If any required item is not satisfied, the task is not complete.

---

## How to Use

For every task:
0) **Declare Product Target + Execution Gear** (determines which gates apply)
1) Run **Gear-Specific Checklist** (see below)
2) If a task fails the gate, continue work until it passes

---

## STEP 0: Declare Product Target + Execution Gear (REQUIRED)

**Mandatory: Must be declared before any other gates.**

Reference: `Engineering/Modes.md`

### Product Target Declaration
- [ ] **Product Target:** WEB_SAAS | WEB_APP | MOBILE_IOS | MOBILE_ANDROID | API_SERVICE | AGENT_SYSTEM | LIBRARY | SCRIPT | UNKNOWN

**Rules:**
- If Product Target is **UNKNOWN** → STOP and ask for clarification
- Product Target drives verification, security, and automation expectations
- Product Target ≠ Engineering Mode (orthogonal concepts)
- **DO NOT assume WEB_SAAS** unless explicitly declared or inferred from evidence

### Execution Gear Declaration
- [ ] **Execution Gear:** EXPLORE | BUILD | SHIP | HOTFIX

**Selection Guidance:**
- **EXPLORE** — prototypes, spikes, experiments, throwaway code
- **BUILD** — real feature development (default for production-bound work)
- **SHIP** — production release, customer-facing deployment
- **HOTFIX** — emergency production fix, critical incident response

**The selected Execution Gear determines which gates apply below.**

---

## GEAR: EXPLORE Checklist

**For prototypes, spikes, experiments.**

### Required
- [ ] Declare: **Engineering Mode: <MODE>**
- [ ] Restate the goal in one sentence
- [ ] Evidence for any claims made (no guessing)

### Optional (Recommended)
- [ ] Product Target declaration (if non-obvious)
- [ ] Artifact Type declaration (if code will be reused)

### Verification
- Manual verification allowed
- No automated test requirement
- Console errors should still be absent

### Notes
- No regression logging required unless insight is permanent
- If prototype becomes production code, re-evaluate under BUILD or SHIP

---

## GEAR: BUILD Checklist

**For normal feature development.**

### Preflight (Before Implementation)

#### A) Product Target (Required)
- [ ] **Product Target declared** (see STEP 0)
- [ ] Confirm Product Target aligns with tooling/verification strategy

#### B) Mode Declaration (Required)
- [ ] Declare: **Engineering Mode: <MODE>**
- [ ] If multiple modes apply: declare primary + list secondary modes
- [ ] Confirm mode aligns with Product Target

#### C) Artifact Classification (Required)
- [ ] Explicitly declare artifact type: **Full Document | Fragment | Component | Script | Automation | Test**
- [ ] Confirm navigation strategy aligns with artifact type
- [ ] Confirm CSS strategy aligns with artifact type
- [ ] Confirm verification approach aligns with artifact type

### B) Mode Declaration (Required)
- [ ] Declare: **Engineering Mode: <MODE>**
- [ ] If multiple modes apply: declare primary + list secondary modes
- [ ] Confirm the strictest applicable rules will be applied
- [ ] Confirm mode aligns with declared Product Target

### C) Artifact Classification Gate (Required)

**This gate must pass before planning, verification, or implementation.**

Reference: `Engineering/OutputContracts.md` — Artifact Type Declaration

- [ ] Explicitly declare artifact type: **Full Document | Fragment | Component | Script | Automation | Test**
- [ ] Confirm navigation strategy aligns with declared artifact type
- [ ] Confirm CSS strategy aligns with declared artifact type
- [ ] Confirm verification approach aligns with declared artifact type

**Gate Rules:**
- If artifact type is missing → **planning is invalid**
- If artifact type conflicts with navigation or verification strategy → **planning must stop**
- If artifact type is inferred or implied without explicit declaration → **gate fails**

**Correction Required:**
- You MUST correct artifact classification before proceeding to implementation or verification.

**Rationale:**
This gate prevents fragment/document confusion by forcing explicit classification before any architectural or testing decisions are made. Without this gate, fragments can be mistakenly treated as standalone documents, leading to broken navigation tests, incorrect CSS scoping, and invalid verification strategies.

### D) Problem & Constraints (Required)
- [ ] Restate the goal in one sentence
- [ ] List hard constraints (security, performance, budget, deadlines, tooling)
- [ ] Identify impacted systems/files

### E) Consult Institutional Memory (Required)
- [ ] Search `Engineering/Solutions/SolutionIndex.md` for relevant entries
- [ ] Search `Engineering/Solutions/Regressions.md` for known loops
- [ ] Confirm `Engineering/Solutions/ToolAuthority.md` rules apply (time/date, UI, logs, DB)

### F) Automation Availability (Required)
- [ ] Search `Engineering/Automations/AutomationIndex.md`
- [ ] If an automation exists, commit to using it
- [ ] If automation is missing but feasible, plan to create it and add it to the index

### G) Verification Plan (Required)
- [ ] Identify the exact verification commands/tests to run
- [ ] If UI is involved: plan Playwright verification (Chromium default)
- [ ] Define the evidence artifacts expected (logs, outputs, screenshots, traces)
- [ ] Confirm verification tooling aligns with declared Product Target

### H) Cleanup Plan (Required)
- [ ] Identify likely cleanup targets (dead code, unused files, deps)
- [ ] Confirm deletion will follow `Engineering/Cleanup.md` governance

---

## Execution Checklist (During Implementation)

**Note:** Specialist Brain tools are available (see `Engineering/Constitution.md` Section 4.5):
- Design Brain (UI/UX work)
- Trading Brain (options strategy) - future
- MBA Brain (business strategy) - future

Use specialist brains as needed throughout implementation. No fixed sequence required.

### A) Smallest Correct Change
- [ ] Implement the smallest change that fully solves the problem
- [ ] Avoid speculative multi-fix batches without evidence

### B) Automation First
- [ ] Use automation recipes when available
- [ ] Do not introduce manual copy/paste workflows
- [ ] If automation fails: follow `Engineering/Automations/Runbooks/BrokenAutomation.md`

### C) Tool Authority Compliance
- [ ] Do not assume time/date; retrieve it when relevant
- [ ] Do not ask for logs if they are retrievable
- [ ] Do not claim UI correctness without Playwright evidence
- [ ] Do not perform DB changes outside migrations when automation exists

### D) Evidence Discipline
- [ ] Reproduce errors before fixing
- [ ] Capture the key error output
- [ ] Fix root cause, not symptoms
- [ ] Re-run the failing command after changes

---

## Completion Gate (Before Declaring Done)

### A) Verification Evidence (Required)
- [ ] Tests/verification executed
- [ ] Evidence captured (outputs/logs/artifacts)
- [ ] If UI work: Playwright run completed; Chromium used unless justified

### B) Automation Integrity (Required)
- [ ] No manual steps remain in the default workflow
- [ ] If any manual fallback exists, it is explicitly documented and temporary
- [ ] Any new automation added to `Engineering/Automations/AutomationIndex.md`

### C) Cleanup Completed (Required)
- [ ] Dead/unused code removed
- [ ] Unused dependencies pruned where applicable
- [ ] Temporary debug artifacts removed
- [ ] Folder structure remains clean and intentional

### D) Memory Updated (Required When Applicable)
If the work discovered or confirmed a repeatable solution:
- [ ] Update `Engineering/Solutions/SolutionIndex.md`
- [ ] Add/update recipe in `Engineering/Solutions/Recipes/`
- [ ] If this prevents a loop: update `Engineering/Solutions/Regressions.md`
- [ ] If this creates an execution path: update `Engineering/Automations/`

### E) Engineering Score Gate (Required)
- [ ] Score each category in `Engineering/Score.md`
- [ ] Confirm every category is **≥ 4**
- [ ] If any category < 4, work is not complete

---

## Verification Semantics

**Mandatory: defines what verification MUST and MUST NOT assert.**

Verification exists to prove correctness, not to duplicate cleanup or enforce style.

### Verification MUST Assert

- **User-visible correctness** — does the feature work as intended?
- **Successful state transitions** — do interactions produce expected states?
- **Runtime stability** — does the system remain stable under normal and edge conditions?
- **Absence of console errors** — are there runtime exceptions or failures in browser/terminal logs?
- **Absence of uncaught exceptions** — does the code fail safely or crash?
- **Correctness of outputs under defined inputs** — given X, does the system produce Y?

### Verification MUST NOT Assert

- **Stylistic cleanup already enforced by Cleanup.md** — do not verify code style in tests
- **Absence of debug logs once removed from the codebase** — cleanup is not verification
- **Redundant conditions that do not increase confidence** — avoid noise assertions
- **Implementation details that are not user-visible or contractually relevant** — avoid coupling tests to internal structure unless required

### Additional Requirements

- Prefer failure signals with **high informational value** (errors, crashes, broken states)
- Avoid assertions that couple tests tightly to internal structure unless required
- Tests should **increase confidence, not noise**

### Why This Exists

This rule prevents brittle, redundant, or meaningless verification by separating cleanup hygiene from runtime correctness. Conflating the two leads to flaky tests that fail on stylistic changes rather than functional regressions, creating verification drift where tests become maintenance burdens instead of confidence builders. Clear verification semantics ensure tests focus on what matters: does the system work correctly?

---

## Stop Conditions (Mandatory)

You must stop and report failure if:
- [ ] verification fails and cannot be repaired
- [ ] automation fails without a documented recovery path
- [ ] evidence cannot be produced for claims

No guessing. No hand-waving.

---

## GEAR: SHIP Checklist

**For production releases, customer-facing deployment.**

### Preflight (Before Implementation)
- [ ] **All GEAR: BUILD Preflight items** (Product Target, Mode, Artifact, Problem, Memory, Automation, Verification, Cleanup)
- [ ] Pre-ship verification plan (run full test suite, not just affected tests)
- [ ] Rollback plan documented
- [ ] Performance budget confirmed (see `Engineering/Performance.md`)
- [ ] Security checklist complete (see `Engineering/Security.md`)
- [ ] Documentation updated (if customer-facing)

### Execution (During Implementation)
- [ ] **All GEAR: BUILD Execution items**
- [ ] Automation mandatory (no manual steps in default workflow)

### Completion Gate (Before Declaring Done)
- [ ] **All GEAR: BUILD Completion items**
- [ ] Cross-browser/cross-platform testing (if WEB_SAAS: Chromium + WebKit/Firefox)
- [ ] Accessibility audit (WCAG AA minimum if UI)
- [ ] Load/performance testing (if API_SERVICE or high-traffic)
- [ ] Staging environment validation (if available)
- [ ] Engineering Score ≥ 4.5 in all categories (stricter than BUILD)
- [ ] Zero known failures
- [ ] Zero TODO comments without owners

---

## GEAR: HOTFIX Checklist

**For emergency production fix, critical incident response.**

### Required (Minimal Safe Set)
- [ ] Product Target declared
- [ ] Engineering Mode declared
- [ ] Evidence of the failure captured (logs, errors, user reports)
- [ ] Minimal correct fix identified (no scope creep)
- [ ] Fix does not introduce new security vulnerabilities
- [ ] Fix does not expose secrets in logs or commits
- [ ] Smoke test proves fix resolves the failure
- [ ] Smoke test proves fix does not break critical paths

### Allowed Shortcuts (with Documentation)
- Skip Artifact Classification (if obvious from context)
- Skip SolutionIndex/Regressions consultation (defer to post-incident)
- Skip Cleanup (defer to post-incident)
- Relaxed verification (manual allowed if automation is too slow)

### Mandatory Post-Incident (Within 24-48 Hours)
- [ ] Post-incident review completed (see `Engineering/Incidents.md`)
- [ ] Document what broke, why, and how it was fixed
- [ ] Identify what was skipped during hotfix
- [ ] Create follow-up tasks for deferred work
- [ ] Update Regressions.md if failure could have been prevented

---

## Justified Violations

**Allowed ONLY in GEAR: HOTFIX or GEAR: EXPLORE.**

When a governance rule must be bypassed:

### Documentation Required
- [ ] **Rule bypassed:** (which specific rule)
- [ ] **Product Target:** (context)
- [ ] **Execution Gear:** (HOTFIX or EXPLORE)
- [ ] **Why necessary:** (time constraint, technical impossibility, emergency)
- [ ] **Risk introduced:** (P0-P3 severity)
- [ ] **Follow-up plan:** (how/when it will be corrected)

### Logging Required
- **GEAR: HOTFIX** → Log in `Engineering/Incidents.md` (operational incident)
- **GEAR: EXPLORE** → No logging required unless insight is permanent
- **If systemic** → Log in `Engineering/Solutions/Regressions.md`

### Never Justified
The following violations are **never acceptable**, regardless of Execution Gear:
- Guessing instead of retrieving evidence
- Assuming facts that can be verified
- Silently falling back to manual workflows when automation exists
- Committing secrets to repository
- Ignoring P0/P1 security vulnerabilities
- Ignoring console errors or uncaught exceptions

---

**This checklist is binding and enforced.**
