# TRADING REGRESSIONS
**Failure Memory and Loop Prevention**

---

## Purpose

This document records known trading failures and filter regressions.

Once a regression is logged here:
- it must never occur again
- recurrence is treated as a system failure
- the corrective solution becomes mandatory

This file exists to eliminate:
- repeated filter mistakes
- forgotten why filters exist at certain thresholds
- "study mode" fallback loops
- wasted money on unprofitable setups

---

## Enforcement Rule

> **A logged regression may not reoccur.**

If it does:
- the task must stop
- the failure must be acknowledged
- the Trading Brain and filter settings must be validated
- money loss must be documented

---

## What Counts as a Regression

A regression includes (but is not limited to):
- reverting from production filters to "study mode" filters
- widening filters to force signals (instead of accepting no tradeable setups)
- forgetting mandatory indicators (RSI, MACD, momentum)
- ignoring time-of-day requirements
- disabling ImprovedFilters without documentation
- repeating a previously losing setup
- trading outside risk management rules

---

## Required Regression Entry Format

Each regression entry must include:

### <Regression Title>
- **Date Logged:** YYYY-MM-DD
- **Symptom:** What happened (e.g., zero signals, filter disabled)
- **Root Cause:** Why it occurred
- **Incorrect Behavior:** What was done wrong
- **Financial Impact:** Money lost (if applicable)
- **Correct Solution:** What must be done instead
- **Enforced Path:** Link to Trading Brain rule / Mode
- **Prevention Mechanism:** How this prevents recurrence

Incomplete entries are invalid.

---

## Logged Regressions

### Study Mode Filters Left Enabled in Production
- **Date Logged:** 2025-12-19
- **Symptom:** API returning zero signals despite open market and live data
- **Root Cause:** Filters were intentionally relaxed for "study mode" development and never restored to production values before deployment
- **Incorrect Behavior:**
  - Volume: 10 contracts (should be 1000+)
  - Delta: 0.20-0.99 (should be 0.40-0.70)
  - Max price: $50 (should be $10)
  - Momentum: 0.1% (should be 3%+)
  - RSI: 20-50 / 50-80 (should be 30-40 / 60-70)
  - Premium flow: $50k (should be $1M+)
  - Block trades: 50 contracts, 1 block (should be 100+, 3+ blocks)
  - ImprovedFilters: commented out
- **Financial Impact:** Infrastructure costs ($99/month Massive API + server costs) with zero tradeable signals = burning money
- **Correct Solution:**
  1. Restore ALL production filter thresholds (committed in c7bc48b)
  2. Enable ImprovedFilters validation
  3. Add time-of-day filtering (9:30-11AM, 3-4PM ET)
  4. Add Najarians 50% profit-taking rule
  5. Deploy to production immediately
- **Enforced Path:**
  - trading/Modes.md (filter requirements per mode)
  - trading/ToolAuthority.md (mandatory indicators)
  - trading/Checklist.md (pre-trade filter verification)
- **Prevention Mechanism:**
  - Trading Brain now governs all filter decisions
  - "Study mode" is explicitly forbidden in production
  - Filter changes require Trading Brain update + regression check
  - Deployment checklist includes filter validation

---

## Governance Violations (Auto-Log)

**Mandatory self-reporting of Trading Brain rule violations.**

The system MUST log violations when detected or corrected.

### What Qualifies as a Trading Violation

A violation occurs when:
- Multiple primary modes declared (violates `trading/Modes.md`)
- Proceeds without filter verification (violates `trading/Checklist.md`)
- Uses vague signal justifications (violates `trading/OutputContracts.md`)
- Trades without mandatory indicators (violates `trading/ToolAuthority.md`)
- Widens filters to force signals
- Ignores time-of-day requirements
- Bypasses risk management rules (>2% risk, >3 positions, etc.)

### When Logging Is Required

Logging is **mandatory** when:
- A violation is detected and corrected
- User identifies a filter set wrong
- A signal is generated that shouldn't have been
- Filters are bypassed without documentation
- Risk management rules are violated

### Required Entry Format

**### <Violation Title>**
- **Date/Time:** YYYY-MM-DD HH:MM
- **Task/Context:** What signal was being generated
- **Rule Violated:** Which Trading Brain rule was broken (with file reference)
- **Why It Happened:** Root cause (lazy filters, incomplete validation, pressure to generate signals)
- **Corrective Action Taken:** What was done to fix it
- **Preventative Rule/Pattern Added:** Link to updated SolutionIndex or Mode rule

---

## Consultation Requirement

During pre-trade checklist, the system MUST:
- Search this section for regressions matching the current symbol or setup
- Apply preventative patterns from previous failures
- If a similar setup has failed previously, require explicit justification why this time is different

---

## Escalation Rule

If the same trading regression occurs **more than twice**:
- A mandatory constraint MUST be added to `trading/Constitution.md`
- The constraint becomes a hard gate in the checklist
- Further violations result in signal generation halt

---

## Failure Is Data

**Trading regressions are not shame. They are learning.**

Every regression logged here:
- Prevents future money loss
- Hardens the system against a specific failure mode
- Improves institutional memory
- Reduces need to re-learn expensive lessons

The goal is not perfection. The goal is **profitable learning that compounds**.

Over time:
- Losing setups disappear
- Winning setups become Golden Paths
- Edge cases emerge
- Win rate improves

A system that logs its losses is a system that improves profitability.

---

**Regression memory is binding and enforced.**
