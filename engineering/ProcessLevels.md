# PROCESS LEVELS (DEPRECATED)

**This file is deprecated as of 2025-12-17.**

**Reason:**
Process Levels (L0–L3) overlap conceptually with Execution Gears (EXPLORE, BUILD, SHIP, HOTFIX).
Maintaining both creates unnecessary cognitive load and ambiguity.

**Replacement:**
Use Execution Gears defined in Checklist.md and Modes.md.

**Removal Date:**
This file will be permanently removed on **2026-01-16** (30 days after deprecation).

---

# PROCESS LEVELS
**Context-Appropriate Rigor Without Losing Discipline**

---

## Purpose

Engineering rigor is not one-size-fits-all.

A hotfix requires different gates than exploration.
A production ship requires different verification than a prototype.

Process Levels define **which gates apply** and **which shortcuts are allowed** based on context.

This system maintains discipline while eliminating unnecessary overhead.

---

## The Four Levels

Every task must declare exactly ONE process level:

- **L0: EXPLORE** — prototypes, spikes, throwaway experiments
- **L1: BUILD** — normal feature development, refactors, improvements
- **L2: SHIP** — production-ready releases, customer-facing changes
- **L3: HOTFIX** — emergency repairs, critical incidents, urgent fixes

---

## L0: EXPLORE

**Context:** Learning, prototyping, experiments, "just show me what this looks like."

### Required Gates
- Product Target declaration (if multi-product repo)
- Mode declaration (can skip artifact type)
- Evidence for claims (even exploration requires proof of correctness)

### Allowed Shortcuts
- **Skip** Artifact Classification if throwaway
- **Skip** SolutionIndex/Regressions consultation
- **Skip** AutomationIndex consultation
- **Skip** Cleanup requirements
- **Skip** Memory updates
- **Relaxed** verification (manual verification allowed, Playwright optional)

### Verification Requirements
- Minimal: Does it work as intended?
- Manual verification allowed
- No automated test requirement
- Console errors must still be absent

### Logging Requirements
- **None** — exploration does not log regressions or governance violations
- If exploration becomes production code, it MUST be re-evaluated under L1 or L2

### Non-Negotiable
- Evidence discipline still applies (no guessing)
- Tool Authority still applies (retrieve time/date, logs)
- No permanent commits without upgrading to L1+

---

## L1: BUILD

**Context:** Standard feature development, bug fixes, refactors, normal engineering work.

### Required Gates
- **All Preflight gates** (Product Target, Mode, Artifact Type, Problem/Constraints, Institutional Memory, Automation, Verification, Cleanup)
- **All Execution gates** (Smallest Change, Automation First, Tool Authority, Evidence Discipline)
- **All Completion gates** (Verification Evidence, Automation Integrity, Cleanup, Memory Updates, Score ≥4)

### Allowed Shortcuts
- **None** — this is the default process level with full rigor

### Verification Requirements
- Automated verification required
- Playwright for UI (Chromium default)
- Evidence artifacts required (logs, screenshots, traces)
- All tests must pass

### Logging Requirements
- Log governance violations when detected
- Log regressions when discovered
- Update SolutionIndex when new patterns emerge

### Non-Negotiable
- Full Engineering Checklist applies
- No shortcuts without justification

---

## L2: SHIP

**Context:** Production releases, customer-facing launches, high-stakes changes.

### Required Gates
- **All L1 gates** PLUS:
- Pre-ship verification (run full test suite, not just affected tests)
- Rollback plan documented
- Performance budget confirmed (if applicable)
- Security checklist (OWASP, secrets scan, auth flows)
- Documentation updated (if customer-facing)

### Allowed Shortcuts
- **None** — this is maximum rigor

### Verification Requirements
- **All L1 verification** PLUS:
- Cross-browser testing (Chromium + WebKit/Firefox if web)
- Accessibility audit (WCAG AA minimum if UI)
- Load/performance testing (if backend or high-traffic)
- Staging environment validation (if available)

### Logging Requirements
- **All L1 logging** PLUS:
- Log the ship decision with evidence artifacts
- Document rollback procedure in case of production failure

### Non-Negotiable
- Score must be ≥4.5 in all categories (stricter than L1)
- Zero known failures
- Zero TODO comments without owners

---

## L3: HOTFIX

**Context:** Emergency production incidents, critical bugs, urgent customer-impacting issues.

### Required Gates
- Product Target declaration
- Mode declaration
- Problem statement (what is broken, what is the impact)
- Evidence of the failure (logs, errors, customer reports)
- Minimal correct fix identified

### Allowed Shortcuts
- **Skip** Artifact Classification (if already clear from context)
- **Skip** SolutionIndex/Regressions consultation (can defer post-hotfix)
- **Skip** Cleanup requirements (can defer post-hotfix)
- **Relaxed** verification (manual verification allowed if automation is too slow)
- **Skip** Memory updates during hotfix (MUST be done post-incident)

### Verification Requirements
- Prove the fix resolves the reported failure
- Prove the fix does not introduce new failures
- Smoke test critical paths
- Automated verification preferred but manual allowed if urgent

### Logging Requirements
- **Mandatory post-incident review** within 24-48 hours:
  - What broke
  - Why it broke
  - What was fixed
  - What was skipped during hotfix
  - What must be done post-hotfix (cleanup, tests, memory updates)
- **Mandatory regression log** if this failure could have been prevented by existing governance

### Non-Negotiable
- Evidence of the failure is required
- Fix must be minimal (no scope creep during hotfix)
- Post-incident review is mandatory
- Deferred work (cleanup, tests, memory) must be tracked and completed

---

## Process Level Selection Rules

### How to Choose

- **L0 EXPLORE** if: throwaway, learning, "just trying something"
- **L1 BUILD** if: normal development, default choice
- **L2 SHIP** if: releasing to production, customer-facing, high-stakes
- **L3 HOTFIX** if: production is broken, urgent customer impact, emergency

### Escalation Rule

Tasks can escalate but cannot de-escalate:
- L0 → L1 (prototype becomes real feature)
- L1 → L2 (feature ready to ship)
- Never L2 → L1 (cannot relax after committing to ship rigor)
- L3 standalone (hotfix does not escalate, it resolves and triggers post-incident work)

### Conflict Resolution

If Process Level conflicts with Mode or Artifact Type:
- Process Level governs **which gates apply**
- Mode governs **what correctness means**
- Artifact Type governs **how to verify**

All three must be declared and must be consistent.

---

## Why This Exists

The original Engineering Brain enforced maximum rigor for all tasks. This created process theater for exploration and made prototyping exhausting.

Process Levels allow **appropriate rigor for context** while maintaining discipline where it matters.

- L0 enables fast exploration without abandoning evidence discipline
- L1 maintains full rigor for normal work
- L2 increases rigor for high-stakes releases
- L3 allows emergency shortcuts while mandating post-incident review

**Rigor is contextual, not absolute.**

---

**Process Level selection is mandatory and binding.**
