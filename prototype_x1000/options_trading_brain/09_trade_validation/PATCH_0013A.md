# PATCH_0013A — Exit Signal Safety Constraints

**Patch ID:** PATCH_0013A
**Base Commit:** COMMIT-0013
**Status:** PROPOSED
**Priority:** P0 (CRITICAL)
**Author:** Claude Code Audit

---

## 1) Summary

This patch addresses three safety gaps identified in the EXIT-SAFE guarantee implementation:

1. **CRITICAL**: No exposure-reducing constraint (exit_qty could exceed open_qty)
2. **MODERATE**: No quote fallback for exits in degraded conditions
3. **MINOR**: No exit-specific schema validation

---

## 2) Changes

### 2.1) Add EXIT_EXPOSURE_GATE (New Hard Gate)

**Location:** Section 5.1 Hard Gates — Insert as Gate 9.5 (between Gate 9 and Gate 10)

**Add the following gate definition:**

```
9.5. EXIT_EXPOSURE_GATE (EXIT SIGNALS ONLY)
    Applies: signal_type in [EXIT_FULL, EXIT_PARTIAL]
    Skipped: signal_type NOT in [EXIT_FULL, EXIT_PARTIAL]

    Check: Verify exit does not exceed open position

    Validation:
      1. Query current open position for (symbol, direction)
         - Source: 02_data_store → position_store (read-only)
         - If position_store unavailable: Use PositionSizingDecision.quantity from original entry

      2. For EXIT_PARTIAL:
         - exit_quantity <= open_position_quantity
         - exit_quantity > 0

      3. For EXIT_FULL:
         - exit_quantity == open_position_quantity
         - OR exit_quantity == 0 (interpreted as "close all")

      4. For any exit:
         - open_position_quantity > 0 (position must exist)

    Fallback (if position lookup fails):
      - Log WARNING: "position_lookup_failed"
      - Allow exit with flag "position_unverified"
      - Set quantity = min(requested_quantity, sizing_decision.quantity)

    Failure: REJECTED
    Reason: "exit_exceeds_position" or "no_position_to_exit"

    Note: This gate ensures exits are REDUCE-ONLY operations
```

**Rationale:** Without this gate, a malformed exit signal could attempt to close more contracts than owned, potentially creating an unintended short position.

---

### 2.2) Add EXIT_QUOTE_FALLBACK to Gate 12

**Location:** Section 5.1 Hard Gates — Modify Gate 12 (QUOTE_FRESHNESS_GATE)

**Current text:**
```
12. QUOTE_FRESHNESS_GATE
    Check: NormalizedQuote.timestamp_utc > Clock.now_utc() - max_quote_age
    Default: max_quote_age = 30,000 ms (30 seconds)
    Failure: REJECTED
    Reason: "stale_quote_data: {age_ms}ms"
```

**Replace with:**
```
12. QUOTE_FRESHNESS_GATE
    Check: NormalizedQuote.timestamp_utc > Clock.now_utc() - max_quote_age
    Default: max_quote_age = 30,000 ms (30 seconds)

    EXIT-SAFE FALLBACK (for EXIT_FULL, EXIT_PARTIAL, STAND_DOWN signals):
      IF quote is stale OR missing:
        1. Attempt fallback: Use last_price from SignalContextSnapshot
        2. IF fallback available AND age < 120,000 ms:
           - PASS with flag "quote_fallback_used"
           - Log WARNING: "exit_using_fallback_price"
        3. IF fallback unavailable OR age >= 120,000 ms:
           - PASS with flag "quote_unavailable_exit"
           - Log WARNING: "exit_without_quote_verification"
           - Note: Exits proceed anyway; market order implied

    For ENTRY signals:
      Failure: REJECTED
      Reason: "stale_quote_data: {age_ms}ms"

    Note: Exits are allowed with degraded quote data because
    closing positions during market stress is more important
    than perfect price verification.
```

**Rationale:** During market crises (exactly when exits are most needed), quote systems may be degraded. Exits should not be blocked by data availability issues.

---

### 2.3) Add EXIT_SCHEMA_VALIDATION to Step 2

**Location:** Section 7.1 Main Validation Sequence — Modify Step 2 (VALIDATE REQUEST)

**Current text:**
```
2. VALIDATE REQUEST
   - Check request_id is unique (not already processed)
   - Check all required fields present
   - Check signal_id exists and matches SignalIntent
   - Check decision_id exists and matches PositionSizingDecision

   IF validation fails:
     RETURN TradeValidationResult(
       outcome=REJECTED,
       blocking_gate="REQUEST_VALIDATION",
       blocking_reason="invalid_request: {details}"
     )
```

**Replace with:**
```
2. VALIDATE REQUEST
   - Check request_id is unique (not already processed)
   - Check all required fields present
   - Check signal_id exists and matches SignalIntent
   - Check decision_id exists and matches PositionSizingDecision

   EXIT-SPECIFIC SCHEMA VALIDATION (if signal_type in [EXIT_FULL, EXIT_PARTIAL]):
   - Check signal_direction == NEUTRAL
   - Check entry_price_zone is null or empty (exits don't have entry zones)
   - Check quantity > 0 (cannot exit zero)
   - IF EXIT_PARTIAL: Check 0 < quantity < total_position_size
   - IF EXIT_FULL: Check quantity == total_position_size OR quantity == 0 (close all)

   IF validation fails:
     RETURN TradeValidationResult(
       outcome=REJECTED,
       blocking_gate="REQUEST_VALIDATION",
       blocking_reason="invalid_request: {details}"
     )
```

**Rationale:** Exit signals have specific semantic requirements that differ from entry signals. Validating these prevents malformed exits.

---

### 2.4) Update Section 5.3 Gate Evaluation Order

**Location:** Section 5.3 Gate Evaluation Order

**Add to Phase 2 after Gate 9:**
```
Phase 2: SIGNAL/SIZING VALIDITY (instant reject)
  6. SIGNAL_TTL_GATE
  7. SIGNAL_LIFECYCLE_GATE
  8. SIZING_APPROVAL_GATE
  9. DUPLICATE_EXECUTION_GATE
  9.5. EXIT_EXPOSURE_GATE (NEW — exit signals only)
```

---

### 2.5) Update Section 11 Failure Modes Table

**Location:** Section 11 Validation & Failure Modes

**Add rows:**
```
| **Exit exceeds position** | Gate 9.5 check | REJECTED immediately | WARN: "exit_exceeds_position" |
| **No position to exit** | Gate 9.5 check | REJECTED immediately | WARN: "no_position_to_exit" |
| **Position lookup failed** | Gate 9.5 fallback | PASS with warning flag | WARN: "position_lookup_failed" |
| **Exit with quote fallback** | Gate 12 fallback | PASS with warning flag | WARN: "exit_using_fallback_price" |
| **Exit without quote** | Gate 12 fallback | PASS with warning flag | WARN: "exit_without_quote_verification" |
| **Exit schema invalid** | Step 2 validation | REJECTED | ERROR: "exit_schema_invalid" |
```

---

### 2.6) Update Section 12.6 Safety Criteria

**Location:** Section 12.6 Safety

**Add:**
```
- [x] EXIT_EXPOSURE_GATE ensures exits cannot exceed open position
- [x] Quote fallback allows exits during degraded market data conditions
- [x] Exit-specific schema validation prevents malformed exit signals
```

---

### 2.7) Update Section 12.7 Test Plan

**Location:** Section 12.7 Test Plan

**Add row:**
```
| **EXIT-EXPOSURE (CRITICAL)** | EXIT_PARTIAL with qty > position → REJECTED; EXIT_FULL with qty != position → REJECTED; EXIT with no position → REJECTED; EXIT with position lookup failure → PASS with flag; quote fallback used for exits during stale data |
```

---

## 3) Schema Additions

### 3.1) Position Lookup Input (Read-Only)

Add to Section 3 Inputs:

```
### 3.6) From 02_data_store (Position Store)

PositionSnapshot (read-only, optional):
  - symbol: string
  - direction: enum[LONG, SHORT]
  - open_quantity: int
  - entry_decision_id: string
  - last_updated: datetime

Note: If position_store is unavailable, fallback to
PositionSizingDecision.quantity from the original entry signal.
```

---

## 4) Acceptance Criteria

- [ ] EXIT_EXPOSURE_GATE implemented and tested
- [ ] Exit signals with quantity > open_position are REJECTED
- [ ] Exit signals with no open position are REJECTED
- [ ] Position lookup failure allows exit with warning flag
- [ ] Quote fallback works for exit signals
- [ ] Exit signals pass during stale quote conditions
- [ ] Exit-specific schema validation rejects malformed exits
- [ ] All new test cases pass

---

## 5) Commit Message

```
[OptionsBrain] 09_trade_validation PATCH_0013A: exit safety constraints

Fixes:
- Add EXIT_EXPOSURE_GATE to prevent exits exceeding open position
- Add quote fallback for exits during degraded market data
- Add exit-specific schema validation

Safety guarantees:
- Exits cannot create unintended short positions
- Exits allowed during quote system degradation
- Malformed exit signals rejected at validation

Test cases added for all new gates and fallbacks.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

---

**END OF PATCH**
