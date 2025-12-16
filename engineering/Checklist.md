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
1) Run **Preflight** before writing code
2) Run **Execution** while implementing
3) Run **Completion Gate** before declaring done
4) If a task fails the gate, continue work until it passes

---

## Preflight Checklist (Before Any Implementation)

### A) Product Target Declaration Gate (Required)

**This gate must execute FIRST, before mode, artifact type, planning, or verification selection.**

Declare exactly ONE product target for this task:

- [ ] **Product Target:** WEB_SAAS | IOS_APP | ANDROID_APP | API_ONLY | AGENT_ONLY | INTERNAL_TOOL

**Gate Rules:**

- Exactly ONE product target is **required** per task.
- If multiple targets exist in the repository, all non-declared targets are **OUT OF SCOPE** for this task.
- Architecture, tooling, verification, and automation choices MUST align with the declared product target.
- If product target is missing or ambiguous → **planning is BLOCKED**.
- Historical or abandoned product targets (e.g., old mobile apps, deprecated APIs) do **NOT apply** unless explicitly declared for this task.

**Enforcement:**

- You MUST restate the product target when beginning implementation.
- Mode selection MUST align with product target (e.g., WEB_SAAS → MODE: APP; API_ONLY → MODE: API).
- Verification tooling MUST match product target (e.g., WEB_SAAS → Playwright/Chromium; IOS_APP → XCTest/Simulator).
- Architectural patterns from other product targets MUST NOT leak into the current task.

**Rationale:**

This gate prevents cross-platform assumption leakage in repositories containing multiple product targets (Web SaaS + iOS + API). Without explicit product targeting, the agent may apply the wrong engineering mode, choose incorrect verification tools (browser tests for mobile apps), assume the wrong runtime environment, or mix architectural patterns across platforms. Explicit product targeting makes mode selection, verification strategy, and tooling choices deterministic.

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

**This checklist is binding and enforced.**
