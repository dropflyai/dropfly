# ENGINEERING SCORE
**Non-Negotiable Quality Gate**

---

## Purpose

Engineering Score defines the minimum quality required for work to be considered complete.

Work that does not meet the minimum score **must not ship**.

This system exists to eliminate:
- fragile fixes
- unverified assumptions
- technical debt accumulation
- repeated regressions

---

## Scoring Rules

Each category is scored from **1 to 5**.

A score below **4 in any category** means the work is **incomplete**.

Scores must be justified with evidence.

---

## 1. Correctness

**Does the system behave exactly as intended?**

### 5
- All expected behaviors validated
- Edge cases handled
- No undefined or ambiguous behavior

### 4
- Core behaviors validated
- Minor edge cases documented

### <4 (Fail)
- Assumptions unverified
- Known incorrect behavior
- "Should work" logic

---

## 2. Verification

**Is correctness proven, not assumed?**

### 5
- Automated tests executed
- UI verified with Playwright where applicable
- Evidence artifacts produced

### 4
- Tests executed with clear output
- Verification steps documented

### <4 (Fail)
- Manual checks
- User asked to verify
- No artifacts

---

## 3. Automation

**Can this be executed without human intervention?**

### 5
- Fully automated via scripts, CLI, MCP, or workflows
- No manual steps required

### 4
- Mostly automated with a documented fallback

### <4 (Fail)
- Manual copy/paste steps
- "Run this yourself"
- Interactive-only workflows

---

## 4. Maintainability

**Will this be easy to understand and change later?**

### 5
- Clear structure
- Intent obvious
- Well-named abstractions
- No dead code

### 4
- Mostly clear with minor complexity

### <4 (Fail)
- Confusing structure
- Tight coupling
- Unnecessary complexity

---

## 5. Cleanup & Hygiene

**Is the codebase cleaner than before?**

### 5
- Dead code removed
- Unused dependencies pruned
- Folder structure improved

### 4
- No new mess introduced

### <4 (Fail)
- Dead code left behind
- TODO debt created
- Temporary files committed

---

## 6. Security & Safety

**Does this introduce risk?**

### 5
- Secrets handled correctly
- Inputs validated
- No unsafe defaults

### 4
- Safe for current context

### <4 (Fail)
- Secrets exposed
- Unsafe assumptions
- Silent failure modes

---

## 7. Regression Resistance

**Will this break again?**

### 5
- Root cause addressed
- Regression documented
- Tests or guards added

### 4
- Root cause understood

### <4 (Fail)
- Symptom-only fix
- No protection against recurrence

---

## Completion Rule

Work is considered complete only if:
- Every category scores **≥ 4**
- Evidence exists for each score
- Verification has passed
- Cleanup has been performed

If these conditions are not met, the task remains in progress.

---

**Engineering Score is mandatory and enforced.**
