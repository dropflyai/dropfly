# PATCH_0013B — Exit Position Binding Gate

**Patch ID:** PATCH_0013B
**Base Commit:** COMMIT-0013 + PATCH_0013A
**Status:** APPLIED
**Priority:** P0 (CRITICAL)
**Author:** Claude Code
**Date:** 2026-01-02

---

## 1) Problem Statement

After PATCH_0013A, exits are *safe to execute* (not blocked, exposure-checked, quote fallback allowed).
But exits can still be **ambiguous** if multiple positions exist for the same symbol/strategy family
or if contract identity is unclear.

**Failure class:**
- EXIT payload targets "AAPL" but there are multiple open AAPL option positions (different strikes/expiries/legs)
- EXIT tries to close without a deterministic identifier tying it to a specific open position
- Result: Wrong position closed, or system cannot determine which position to close

This patch introduces **Position Binding**: every EXIT must reference a unique position identity key.

---

## 2) Change Summary

### Adds:
1. **PositionBindingKey** (canonical key schema with multi-leg support)
2. **Exit binding requirement** in TradeValidationRequest schema
3. **EXIT_POSITION_BINDING_GATE (Gate 9.6)** — runs BEFORE Gate 9.5
4. **Multi-leg contract matching semantics** (exact set match, order-independent)
5. **Ambiguity rejection**: if binding resolves to 0 or >1 positions → REJECT (or DEFER if configured)
6. **Simplified Gate 9.5**: quantity-only check (position existence now handled by 9.6)
7. **Tests + failure modes** for binding errors

### Does NOT Add:
- No broker/execution logic
- No position management logic (still read-only PositionSnapshot usage)
- No STAND_DOWN binding requirement (portfolio-level signal, not position-specific)

---

## 3) Schema Additions

### 3.1) PositionBindingKey (New Schema)

```
PositionBindingKey:
  # Primary Identifiers (at least one required)
  - position_id: string | null       # Provider/broker/internal ID if available
  - position_key: string | null      # Deterministic hash key if position_id not available

  # Context (for validation/matching)
  - symbol: string                   # REQUIRED. Must match signal.symbol
  - strategy_id: string              # REQUIRED. Must match signal.strategy_id
  - timeframe: string | null         # OPTIONAL. For additional disambiguation
  - mode: string | null              # OPTIONAL. Strategy mode if applicable

  # Multi-leg Position Support
  - contracts: OptionContractRef[] | null
    # Required for multi-leg options positions if no position_id/position_key
    # Each contract ref contains: underlying, expiration, strike, right (C/P), multiplier

  # Disambiguation
  - opened_at: datetime | null       # OPTIONAL. For multiple similar positions opened at different times

VALIDATION RULE:
  At least one of the following MUST be present:
    - position_id, OR
    - position_key, OR
    - contracts (non-empty array)
  If none present → EXIT signal is invalid (exit_position_binding_missing)
```

### 3.2) OptionContractRef (Supporting Schema)

```
OptionContractRef:
  - underlying: string               # REQUIRED. e.g., "AAPL"
  - expiration: date                 # REQUIRED. e.g., "2026-01-17"
  - strike: float                    # REQUIRED. e.g., 150.00
  - right: enum[CALL, PUT]           # REQUIRED
  - multiplier: int                  # REQUIRED. Usually 100 for equity options

CANONICAL CONTRACT IDENTITY:
  underlying + expiration + strike + right + multiplier
  This tuple uniquely identifies a contract for matching purposes.
```

### 3.3) Multi-Leg Contract Matching Semantics

```
MULTI-LEG CONTRACT MATCHING:
  - Matching MUST be exact set match, order-independent
  - For spreads/combos: all legs must match exactly
    - Same count of contracts
    - Same contract identities (using canonical tuple above)
  - Order of contracts in array does NOT affect matching
  - If contracts provided and set match fails → treated as 0 matches
  - Partial matches are NOT allowed (all-or-nothing)

EXAMPLE:
  Position has: [AAPL 150C Jan, AAPL 155C Jan]
  Exit binding: [AAPL 155C Jan, AAPL 150C Jan]  → MATCH (order-independent)
  Exit binding: [AAPL 150C Jan]                  → NO MATCH (partial)
  Exit binding: [AAPL 150C Jan, AAPL 160C Jan]  → NO MATCH (different leg)
```

---

## 4) TradeValidationRequest Schema Update

Add field to TradeValidationRequest:

```
  # Position Binding (for EXIT signals)
  - position_binding: PositionBindingKey | null
    # REQUIRED for EXIT_FULL, EXIT_PARTIAL
    # Optional/null for all other signal types (ENTRY_*, SQUEEZE_*, STAND_DOWN)
```

---

## 5) STAND_DOWN Binding Exemption

**STAND_DOWN signals do NOT require position_binding.**

STAND_DOWN is portfolio/symbol-level safety signaling and does not target a specific position.
It instructs the system to exit ALL positions for a symbol or the entire portfolio, not a single
identified position. Position binding is not applicable.

---

## 6) Gate 9.6: EXIT_POSITION_BINDING_GATE

**Location:** Insert BEFORE Gate 9.5 (EXIT_EXPOSURE_GATE)

```
9.6. EXIT_POSITION_BINDING_GATE (EXIT SIGNALS ONLY)
     Applies: signal_type in [EXIT_FULL, EXIT_PARTIAL]
     Skipped: signal_type NOT in [EXIT_FULL, EXIT_PARTIAL]

     Goal: Ensure exit is bound to exactly one open position

     Inputs:
       - TradeValidationRequest (contains signal + position_binding)
       - PositionSnapshot (read-only; from 02_data_store)

     Pre-Checks:
       1. Verify position_binding is present
          IF missing → REJECT (exit_position_binding_missing)

       2. Verify binding context matches signal:
          - position_binding.symbol == signal.symbol
          - position_binding.strategy_id == signal.strategy_id
          IF mismatch → REJECT (exit_position_binding_mismatch)

       3. Verify at least one identifier present:
          - position_id present, OR
          - position_key present, OR
          - contracts present and non-empty
          IF none present → REJECT (exit_position_binding_missing)

     Position Resolution:
       1. IF PositionSnapshot unavailable:
          - IF config.exit_requires_position_snapshot == true:
            → DEFER (exit_position_snapshot_missing)
          - ELSE:
            → PASS with flag "position_unverified" and penalty 0.20

       2. Resolve target positions from PositionSnapshot:
          - IF position_id present → exact match on position_id
          - ELSE IF position_key present → exact match on position_key
          - ELSE match by:
            - symbol (exact)
            - strategy_id (exact)
            - contracts (exact set match, order-independent)
            - opened_at (if provided, within ± opened_at_match_window_seconds)

     Match Evaluation:
       - 0 matches → REJECT (no_position_to_exit)
       - >1 matches:
         - IF config.exit_ambiguous_behavior == "REJECT":
           → REJECT (exit_position_ambiguous)
         - ELSE:
           → DEFER (exit_position_ambiguous)
       - 1 match → PASS
         - Store resolved position reference for Gate 9.5

     Config:
       - exit_requires_position_snapshot: bool (default: true)
       - exit_ambiguous_behavior: "REJECT" | "DEFER" (default: "REJECT")
       - opened_at_match_window_seconds: int (default: 600)

     Failure: REJECTED or DEFERRED (per logic above)
     Reason: See match evaluation above

     Note: This gate runs BEFORE EXIT_EXPOSURE_GATE (9.5) because
     you must identify WHICH position before validating exit quantity.
```

---

## 7) Gate 9.5 Simplification (Quantity-Only)

**Previous Gate 9.5** checked both:
- Position exists (open_position_quantity > 0)
- Exit quantity valid (exit_qty <= open_qty)

**Updated Gate 9.5** checks ONLY:
- Exit quantity valid against the **resolved position from Gate 9.6**

The "position exists" check is now handled by Gate 9.6 (0 matches → reject).

**Updated Gate 9.5:**
```
9.5. EXIT_EXPOSURE_GATE (EXIT SIGNALS ONLY)
     Applies: signal_type in [EXIT_FULL, EXIT_PARTIAL]
     Skipped: signal_type NOT in [EXIT_FULL, EXIT_PARTIAL]

     Prerequisite: Gate 9.6 MUST have passed (position bound and resolved)

     Check: Verify exit quantity does not exceed bound position quantity

     Validation (using resolved position from Gate 9.6):
       1. Get open_position_quantity from resolved PositionSnapshot

       2. For EXIT_PARTIAL:
          - exit_quantity > 0
          - exit_quantity < open_position_quantity (strict less-than for partial)

       3. For EXIT_FULL:
          - exit_quantity == open_position_quantity
          - OR exit_quantity == 0 (interpreted as "close all")

     Fallback (if position lookup failed in 9.6 with permissive config):
       - Use PositionSizingDecision.quantity from original entry as proxy
       - Log WARNING: "exit_exposure_using_sizing_proxy"
       - Set quantity = min(requested_quantity, sizing_decision.quantity)

     Failure: REJECTED
     Reason: "exit_exceeds_position" or "exit_partial_invalid_quantity"

     Note: Position existence is validated by Gate 9.6. This gate focuses
     solely on quantity validation for the bound position.
```

---

## 8) Gate Evaluation Order Update

**Updated Phase 2:**
```
Phase 2: SIGNAL/SIZING VALIDITY (instant reject)
  6. SIGNAL_TTL_GATE
  7. SIGNAL_LIFECYCLE_GATE
  8. SIZING_APPROVAL_GATE
  9. DUPLICATE_EXECUTION_GATE
  9.6. EXIT_POSITION_BINDING_GATE (exit signals only — binds to exactly one position)
  9.5. EXIT_EXPOSURE_GATE (exit signals only — validates exit_qty for bound position)
```

**Rationale:** Gate 9.6 must run before 9.5 because:
1. You must identify WHICH position (9.6) before checking quantities (9.5)
2. If 9.6 rejects (0 matches, ambiguous), 9.5 never runs
3. 9.5 operates on the resolved position from 9.6

---

## 9) New Failure Modes

| Failure Mode | Detection | Response | Logging |
|--------------|-----------|----------|---------|
| **Exit position binding missing** | EXIT signal missing position_binding or no identifiers | REJECTED immediately | ERROR: "exit_position_binding_missing" |
| **Exit position binding mismatch** | position_binding.symbol != signal.symbol OR strategy_id mismatch | REJECTED immediately | ERROR: "exit_position_binding_mismatch" |
| **Exit position ambiguous** | Binding resolves to >1 open positions | REJECTED or DEFERRED (config) | WARN: "exit_position_ambiguous" |
| **Exit position snapshot missing** | EXIT requires PositionSnapshot but not available | DEFERRED (default) or PASS+penalty | WARN: "exit_position_snapshot_missing" |

---

## 10) Acceptance Criteria

### EXIT-POSITION-BINDING (CRITICAL)

- [x] All EXIT signals (EXIT_FULL, EXIT_PARTIAL) MUST include position_binding
- [x] position_binding MUST contain at least one identifier (position_id, position_key, or contracts)
- [x] position_binding.symbol and strategy_id MUST match signal context
- [x] EXIT must resolve to exactly one open position
- [x] 0 matches → REJECT (no_position_to_exit)
- [x] >1 matches → REJECT or DEFER (configurable)
- [x] Multi-leg contract matching is exact set match, order-independent
- [x] STAND_DOWN does NOT require binding (portfolio-level signal)
- [x] Gate 9.6 runs BEFORE Gate 9.5

---

## 11) Test Plan

### EXIT-POSITION-BINDING (CRITICAL)

| Test Case | Expected Result |
|-----------|-----------------|
| Exit with valid position_id resolves to 1 position | APPROVED |
| Exit with valid position_key resolves to 1 position | APPROVED |
| Exit with contracts-only binding resolves to 1 position | APPROVED |
| Exit with contracts binding (order-independent match) | APPROVED |
| Exit with missing position_binding | REJECTED (exit_position_binding_missing) |
| Exit with binding mismatch (symbol differs) | REJECTED (exit_position_binding_mismatch) |
| Exit with binding mismatch (strategy_id differs) | REJECTED (exit_position_binding_mismatch) |
| Exit resolves to 0 positions | REJECTED (no_position_to_exit) |
| Exit resolves to >1 positions (REJECT config) | REJECTED (exit_position_ambiguous) |
| Exit resolves to >1 positions (DEFER config) | DEFERRED (exit_position_ambiguous) |
| PositionSnapshot missing with strict config | DEFERRED (exit_position_snapshot_missing) |
| PositionSnapshot missing with permissive config | PASS with penalty 0.20 |
| STAND_DOWN signal without binding | APPROVED (binding not required) |
| Multi-leg partial contracts match | REJECTED (0 matches — partial not allowed) |

---

## 12) Commit Message

```
[OptionsBrain] 09_trade_validation PATCH_0013B: exit position binding gate

Adds Gate 9.6 (EXIT_POSITION_BINDING_GATE) to ensure EXIT signals
are bound to exactly one open position before execution.

Changes:
- Add PositionBindingKey schema with multi-leg support
- Add position_binding field to TradeValidationRequest
- Add Gate 9.6 with position resolution logic
- Simplify Gate 9.5 to quantity-only check (existence now in 9.6)
- Update gate order: 9.6 → 9.5 (bind first, then check quantity)
- Add exact set match semantics for multi-leg contracts
- Exempt STAND_DOWN from binding requirement

Safety guarantees:
- Exits cannot target ambiguous/wrong positions
- Multi-position scenarios require explicit binding
- 0 matches → REJECT, >1 matches → REJECT/DEFER

Test cases: 14 new tests for position binding scenarios

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

---

**END OF PATCH**
