# 09_TRADE_VALIDATION — SPEC

**Commit ID:** COMMIT-0013
**Status:** SPEC COMPLETE
**Upstream Dependencies:** 00_core, 01_data_ingestion, 02_data_store, 04_market_regime, 08_signal_generation, 10_risk_management
**Downstream Consumers:** 11_execution (future)

---

## 1) Purpose

The Trade Validation module is the **FINAL GATE** before any signal can proceed to execution. It performs last-moment validation to ensure that conditions have not materially changed since the signal was generated and the position was sized.

### 1.1) Core Mission

This module answers one question: **"Is it still safe to execute this trade RIGHT NOW?"**

Between signal generation (08) → risk sizing (10) → execution (future), market conditions can change. This module catches:
- Signals that have expired or been invalidated
- Regime drift that makes the original thesis invalid
- Liquidity deterioration that would cause poor fills
- Risk state changes (REDUCE_ONLY, STAND_DOWN)
- Global kill-switches and circuit breakers
- Event blackouts that have started since signal creation

### 1.2) Philosophy: Deny-by-Default

This module operates with **extreme prejudice against approval**:
- Every check must pass for approval
- Any doubt results in REJECTED or DEFERRED
- Silent failures are forbidden
- Every rejection is logged with explicit reason
- No trade proceeds without validation

### 1.3) What This Module Does NOT Do

| Action | Owner |
|--------|-------|
| Generate signals | 08_signal_generation |
| Size positions | 10_risk_management |
| Execute orders | 11_execution (future) |
| Manage order lifecycle | 12_order_management (future) |
| Track fills | 11_execution (future) |
| Connect to brokers | 11_execution (future) |

This module is **pure validation logic**. It reads upstream state and produces a validation verdict. Nothing more.

---

## 2) Owns / Does Not Own

### 2.1) This Module Owns

| Responsibility | Description |
|----------------|-------------|
| **Trade eligibility validation** | Final yes/no decision on trade execution |
| **Context freshness checks** | Verify inputs are still valid and fresh |
| **Regime drift detection** | Check if regime has changed since signal |
| **Liquidity drift detection** | Check if liquidity has deteriorated |
| **Kill-switch enforcement (ENTRY only)** | Block ENTRY signals when kill-switch active; EXIT and STAND_DOWN signals ALWAYS pass |
| **Stand-down enforcement** | Honor risk state modes (EXIT signals still allowed) |
| **Circuit-breaker enforcement** | Honor system-level circuit breakers |
| **Event blackout enforcement** | Block trades during earnings/FOMC/etc. |
| **Duplicate execution prevention** | Prevent same signal from executing twice |
| **Validation outcome production** | APPROVED, REJECTED, or DEFERRED |
| **Validation event logging** | Record all validation attempts |
| **Retry management** | Handle DEFERRED signals with retry logic |
| **Exit-safe guarantee** | EXIT_FULL, EXIT_PARTIAL, and STAND_DOWN signals are NEVER blocked by kill-switch |

### 2.2) This Module Does NOT Own

| Responsibility | Owner |
|----------------|-------|
| Signal creation | 08_signal_generation |
| Signal confidence calculation | 08_signal_generation |
| Signal invalidation rules | 08_signal_generation |
| Position sizing | 10_risk_management |
| Risk limit enforcement | 10_risk_management |
| Stop/TP planning | 10_risk_management |
| Risk state machine | 10_risk_management |
| Order execution | 11_execution (future) |
| Broker connectivity | 11_execution (future) |
| Fill tracking | 11_execution (future) |
| Order management | 12_order_management (future) |
| Market data fetching | 01_data_ingestion |
| Regime classification | 04_market_regime |

---

## 3) Inputs

All inputs are consumed via 02_data_store. This module has **read-only access** to upstream data.

### 3.1) From 08_signal_generation

```
SignalIntent:
  - signal_id: string
  - idempotency_key: string
  - symbol: string
  - timeframe: string
  - timestamp_utc: datetime
  - signal_type: enum[ENTRY_LONG, ENTRY_SHORT, EXIT_PARTIAL, EXIT_FULL, STAND_DOWN, SQUEEZE_FAST_RELEASE, SQUEEZE_CONFIRMED_RELEASE]
  - direction: enum[LONG, SHORT, NEUTRAL]
  - strategy_id: string
  - strategy_family: enum
  - confidence: float
  - urgency: enum[IMMEDIATE, STANDARD, LOW]
  - time_to_act_seconds: int
  - ttl_seconds: int
  - expiry_timestamp_utc: datetime
  - lifecycle_state: enum[CREATED, ACTIVE, EXPIRED, INVALIDATED, CONSUMED, SUPERSEDED]
  - flags: string[]
  - provenance: SignalProvenance

SignalContextSnapshot:
  - snapshot_id: string
  - signal_id: string
  - timestamp_utc: datetime
  - symbol: string
  - timeframe: string
  - regime_classification: RegimeClassification
  - last_price: float
  - last_price_timestamp: datetime
  - bid: float | null
  - ask: float | null
  - spread_pct: float | null
  - any_stale: bool
  - provenance: SignalProvenance
```

### 3.2) From 10_risk_management

```
PositionSizingDecision:
  - decision_id: string
  - signal_id: string
  - symbol: string
  - timeframe: string
  - timestamp_utc: datetime
  - is_approved: bool
  - rejection_reason: string | null
  - quantity: int
  - risk_amount: float
  - risk_pct: float
  - stop_loss_plan: StopLossPlan
  - take_profit_plan: TakeProfitPlan
  - urgency: enum[IMMEDIATE, STANDARD, LOW]
  - expires_at: datetime
  - provenance: RiskProvenance

RiskState:
  - state_id: string
  - timestamp_utc: datetime
  - risk_mode: enum[NORMAL, REDUCE_ONLY, STAND_DOWN]
  - mode_since: datetime
  - mode_reason: string
  - daily_loss_used_pct: float
  - weekly_loss_used_pct: float
  - current_drawdown_pct: float
  - active_risk_flags: string[]
  - circuit_breaker_active: bool
  - circuit_breaker_reason: string | null
  - kill_switch_active: bool
  - provenance: RiskProvenance
```

### 3.3) From 04_market_regime

```
RegimeClassification:
  - symbol: string
  - timeframe: string
  - timestamp_utc: datetime
  - regime_type: enum[TRENDING_UP, TRENDING_DOWN, RANGING, BREAKOUT, BREAKDOWN, CHOPPY, VOLATILE_EXPANSION, VOLATILE_CONTRACTION, UNKNOWN]
  - regime_strength: float
  - regime_confidence: float
  - volatility_state: enum[LOW, NORMAL, HIGH, EXTREME]
  - provenance: ProvenanceMetadata
```

### 3.4) From 02_data_store (via 01_data_ingestion)

```
NormalizedQuote:
  - symbol: string
  - timestamp_utc: datetime
  - bid: float
  - ask: float
  - bid_size: int
  - ask_size: int
  - provenance: ProvenanceMetadata

NormalizedBar:
  - symbol: string
  - timeframe: string
  - timestamp_utc: datetime
  - open: float
  - high: float
  - low: float
  - close: float
  - volume: int
  - provenance: ProvenanceMetadata

EventCalendar:
  - symbol: string
  - event_type: enum[EARNINGS, DIVIDEND, SPLIT, FOMC, CPI, JOBS, OTHER]
  - event_timestamp_utc: datetime
  - is_before_market: bool
  - is_after_market: bool
```

### 3.5) From 00_core

```
ConfigContract:
  - get(key): any
  - get_bool(key): bool
  - get_int(key): int
  - get_float(key): float

Clock:
  - now_utc(): datetime
  - elapsed_ms(start: datetime): int

Logger:
  - log(level, message, context)
```

### 3.6) From 02_data_store (Position Store)

```
PositionSnapshot (read-only, optional):
  - position_id: string              # REQUIRED. Unique position identifier
  - position_key: string | null      # OPTIONAL. Deterministic hash key
  - symbol: string                   # REQUIRED
  - direction: enum[LONG, SHORT]     # REQUIRED
  - open_quantity: int               # REQUIRED. Current open position size
  - entry_decision_id: string        # REQUIRED. Links to original sizing decision
  - strategy_id: string              # REQUIRED. Strategy that opened position
  - contracts: OptionContractRef[] | null  # OPTIONAL. For multi-leg positions
  - opened_at: datetime              # REQUIRED. When position was opened
  - last_updated: datetime           # REQUIRED

Note: PositionSnapshot MUST include at least one deterministic identifier
(position_id or position_key) for EXIT_POSITION_BINDING_GATE resolution.
```

### 3.7) Position Binding Schemas

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


OptionContractRef:
  - underlying: string               # REQUIRED. e.g., "AAPL"
  - expiration: date                 # REQUIRED. e.g., "2026-01-17"
  - strike: float                    # REQUIRED. e.g., 150.00
  - right: enum[CALL, PUT]           # REQUIRED
  - multiplier: int                  # REQUIRED. Usually 100 for equity options

CANONICAL CONTRACT IDENTITY:
  underlying + expiration + strike + right + multiplier
  This tuple uniquely identifies a contract for matching purposes.


MULTI-LEG CONTRACT MATCHING SEMANTICS:
  - Matching MUST be exact set match, order-independent
  - For spreads/combos: all legs must match exactly
    - Same count of contracts
    - Same contract identities (using canonical tuple above)
  - Order of contracts in array does NOT affect matching
  - If contracts provided and set match fails → treated as 0 matches
  - Partial matches are NOT allowed (all-or-nothing)
```

---

## 4) Canonical Output Schemas

All outputs are written to 02_data_store with full provenance.

### 4.1) TradeValidationRequest

Input request for validation. Created when a sized trade is ready for final validation.

```
TradeValidationRequest:
  # Identity
  - request_id: string             # REQUIRED. SHA256(signal_id + decision_id + timestamp)
  - timestamp_utc: datetime        # REQUIRED. When validation was requested

  # References
  - signal_id: string              # REQUIRED. From SignalIntent
  - signal_idempotency_key: string # REQUIRED. For duplicate detection
  - decision_id: string            # REQUIRED. From PositionSizingDecision
  - symbol: string                 # REQUIRED
  - timeframe: string              # REQUIRED

  # Signal Context (snapshot at request time)
  - signal_type: enum              # REQUIRED
  - signal_direction: enum[LONG, SHORT, NEUTRAL]  # REQUIRED
  - signal_confidence: float       # REQUIRED
  - signal_urgency: enum[IMMEDIATE, STANDARD, LOW]  # REQUIRED
  - signal_ttl_remaining_seconds: int  # REQUIRED. Computed: expiry - now
  - signal_lifecycle_state: enum   # REQUIRED

  # Sizing Context
  - sizing_approved: bool          # REQUIRED
  - quantity: int                  # REQUIRED
  - risk_amount: float             # REQUIRED

  # Position Binding (for EXIT signals)
  - position_binding: PositionBindingKey | null
    # REQUIRED for EXIT_FULL, EXIT_PARTIAL
    # Optional/null for all other signal types (ENTRY_*, SQUEEZE_*, STAND_DOWN)
    # STAND_DOWN is portfolio/symbol-level safety signaling and does not target
    # a specific position; binding not required.

  # Request Metadata
  - request_source: string         # REQUIRED. e.g., "execution_engine", "paper_trader"
  - is_retry: bool                 # REQUIRED. True if this is a retry of DEFERRED
  - retry_count: int               # REQUIRED. Number of previous attempts
  - original_request_id: string | null  # OPTIONAL. If retry, links to original

  # Provenance
  - provenance: TradeValidationProvenance  # REQUIRED
```

### 4.2) TradeValidationResult

The primary output of this module. The final verdict on whether a trade may proceed.

```
TradeValidationResult:
  # Identity
  - result_id: string              # REQUIRED. SHA256(request_id + outcome + timestamp)
  - request_id: string             # REQUIRED. Links to TradeValidationRequest
  - timestamp_utc: datetime        # REQUIRED. When validation completed

  # References
  - signal_id: string              # REQUIRED
  - decision_id: string            # REQUIRED
  - symbol: string                 # REQUIRED
  - timeframe: string              # REQUIRED

  # Outcome
  - outcome: enum[APPROVED, REJECTED, DEFERRED]  # REQUIRED
  - outcome_reason: string         # REQUIRED. Human-readable explanation

  # Gate Results
  - hard_gates_passed: int         # REQUIRED. Count of passed hard gates
  - hard_gates_failed: int         # REQUIRED. Count of failed hard gates
  - soft_gates_passed: int         # REQUIRED
  - soft_gates_warned: int         # REQUIRED. Soft gates that issued warnings
  - gate_results: ValidationGateResult[]  # REQUIRED. All gate evaluations

  # Blocking Gate (if REJECTED)
  - blocking_gate: string | null   # OPTIONAL. First hard gate that failed
  - blocking_reason: string | null # OPTIONAL. Detailed reason

  # Deferral Info (if DEFERRED)
  - retry_eligible: bool           # REQUIRED if DEFERRED
  - retry_after_seconds: int | null  # OPTIONAL. Suggested wait time
  - retry_deadline: datetime | null  # OPTIONAL. Latest retry time (signal TTL)
  - deferral_reason: string | null # OPTIONAL

  # Context Snapshot at Validation
  - current_regime_type: enum      # REQUIRED
  - regime_at_signal: enum         # REQUIRED. From SignalContextSnapshot
  - regime_drift_detected: bool    # REQUIRED
  - current_spread_pct: float | null  # OPTIONAL
  - spread_at_signal: float | null # OPTIONAL
  - spread_drift_detected: bool    # REQUIRED
  - current_risk_mode: enum        # REQUIRED
  - volatility_state: enum         # REQUIRED

  # Timing
  - validation_duration_ms: int    # REQUIRED
  - signal_age_ms: int             # REQUIRED. Time since signal creation
  - sizing_age_ms: int             # REQUIRED. Time since sizing decision

  # Provenance
  - provenance: TradeValidationProvenance  # REQUIRED
```

### 4.3) ValidationGateResult

Individual gate evaluation result.

```
ValidationGateResult:
  # Identity
  - gate_id: string                # REQUIRED. Unique gate identifier
  - gate_name: string              # REQUIRED. Human-readable name
  - gate_type: enum[HARD, SOFT]    # REQUIRED

  # Evaluation
  - passed: bool                   # REQUIRED
  - evaluation_order: int          # REQUIRED. Order in which gate was evaluated

  # Details
  - check_description: string      # REQUIRED. What was checked
  - expected_value: any | null     # OPTIONAL. What was expected
  - actual_value: any | null       # OPTIONAL. What was found
  - threshold: any | null          # OPTIONAL. Threshold if applicable
  - tolerance: any | null          # OPTIONAL. Allowed variance

  # Impact
  - impact: enum[BLOCK, WARN, DEFER, NONE]  # REQUIRED
  - penalty_applied: float | null  # OPTIONAL. For soft gates

  # Reason
  - failure_reason: string | null  # OPTIONAL. If failed
  - warning_message: string | null # OPTIONAL. If warning issued
```

### 4.4) TradeValidationState

Tracks the state of a validation request through its lifecycle.

```
TradeValidationState:
  # Identity
  - state_id: string               # REQUIRED
  - request_id: string             # REQUIRED
  - signal_id: string              # REQUIRED
  - symbol: string                 # REQUIRED

  # Current State
  - current_state: enum[PENDING, APPROVED, REJECTED, DEFERRED, EXPIRED]  # REQUIRED
  - previous_state: enum | null    # OPTIONAL
  - state_changed_at: datetime     # REQUIRED

  # Lifecycle Events
  - created_at: datetime           # REQUIRED
  - approved_at: datetime | null   # OPTIONAL
  - rejected_at: datetime | null   # OPTIONAL
  - deferred_at: datetime | null   # OPTIONAL
  - expired_at: datetime | null    # OPTIONAL

  # Retry Tracking
  - attempt_count: int             # REQUIRED. Total validation attempts
  - max_attempts: int              # REQUIRED. Config-driven limit
  - last_attempt_at: datetime | null  # OPTIONAL
  - next_retry_at: datetime | null # OPTIONAL

  # Execution Status
  - execution_authorized: bool     # REQUIRED. True only if APPROVED
  - execution_blocked_reason: string | null  # OPTIONAL

  # Provenance
  - provenance: TradeValidationProvenance  # REQUIRED
```

### 4.5) TradeValidationProvenance

Full lineage for validation decisions.

```
TradeValidationProvenance:
  # Identity
  - provenance_id: string          # REQUIRED
  - request_id: string             # REQUIRED
  - timestamp_utc: datetime        # REQUIRED

  # Processing Time
  - processing_started_utc: datetime  # REQUIRED
  - processing_ended_utc: datetime    # REQUIRED
  - processing_duration_ms: int       # REQUIRED

  # Input Hashes
  - signal_hash: string            # REQUIRED
  - signal_timestamp: datetime
  - sizing_hash: string            # REQUIRED
  - sizing_timestamp: datetime
  - risk_state_hash: string        # REQUIRED
  - risk_state_timestamp: datetime
  - regime_hash: string            # REQUIRED
  - regime_timestamp: datetime
  - quote_hash: string             # REQUIRED
  - quote_timestamp: datetime

  # Input Freshness
  - input_ages_ms: dict[string, int]  # REQUIRED
  - stale_inputs: string[]         # REQUIRED
  - freshness_ok: bool             # REQUIRED

  # Config Versions
  - validation_config_version: string  # REQUIRED
  - gate_config_version: string        # REQUIRED
  - algorithm_version: string          # REQUIRED

  # Environment
  - validator_instance_id: string  # REQUIRED. For debugging
```

### 4.6) TradeValidationMetrics

Operational metrics for monitoring.

```
TradeValidationMetrics:
  # Identity
  - timestamp_utc: datetime        # REQUIRED
  - window_start: datetime         # REQUIRED
  - window_end: datetime           # REQUIRED
  - window_duration_seconds: int   # REQUIRED

  # Request Counts
  - validation_requests: int       # REQUIRED
  - requests_approved: int         # REQUIRED
  - requests_rejected: int         # REQUIRED
  - requests_deferred: int         # REQUIRED
  - requests_expired: int          # REQUIRED

  # Rates
  - approval_rate: float           # REQUIRED. approved / total
  - rejection_rate: float          # REQUIRED
  - deferral_rate: float           # REQUIRED

  # Rejection Analysis
  - rejections_by_gate: dict[string, int]  # REQUIRED
  - top_rejection_reasons: list[tuple[string, int]]  # REQUIRED. Top 5

  # Deferral Analysis
  - deferrals_resolved_approved: int   # REQUIRED
  - deferrals_resolved_rejected: int   # REQUIRED
  - deferrals_expired: int             # REQUIRED
  - avg_deferral_duration_seconds: float  # REQUIRED

  # Retry Analysis
  - retry_attempts: int            # REQUIRED
  - retry_success_rate: float      # REQUIRED
  - avg_retry_count: float         # REQUIRED

  # Latency
  - avg_validation_latency_ms: float   # REQUIRED
  - p50_validation_latency_ms: float   # REQUIRED
  - p95_validation_latency_ms: float   # REQUIRED
  - p99_validation_latency_ms: float   # REQUIRED
  - max_validation_latency_ms: float   # REQUIRED

  # Gate Performance
  - avg_gates_evaluated: float     # REQUIRED
  - hard_gate_failure_rate: float  # REQUIRED
  - soft_gate_warning_rate: float  # REQUIRED

  # Drift Detection
  - regime_drift_detections: int   # REQUIRED
  - liquidity_drift_detections: int  # REQUIRED
  - volatility_spike_detections: int  # REQUIRED

  # System Events
  - kill_switch_activations: int   # REQUIRED
  - stand_down_blocks: int         # REQUIRED
  - circuit_breaker_blocks: int    # REQUIRED
  - event_blackout_blocks: int     # REQUIRED

  # Provenance
  - provenance: TradeValidationProvenance  # REQUIRED
```

---

## 5) Validation Gates

Gates are evaluated in strict order. Hard gates cause immediate rejection. Soft gates issue warnings or trigger deferral.

### 5.1) Hard Gates (Must Pass)

Any hard gate failure results in immediate REJECTED outcome.

```
HARD GATES (in evaluation order):

1. GLOBAL_KILL_SWITCH_GATE (ENTRY SIGNALS ONLY)
   Applies: signal_type in [ENTRY_LONG, ENTRY_SHORT, SQUEEZE_FAST_RELEASE, SQUEEZE_CONFIRMED_RELEASE]
   Bypassed: signal_type in [EXIT_FULL, EXIT_PARTIAL, STAND_DOWN] — ALWAYS PASS
   Check: ConfigContract.get_bool("validation.kill_switch") == false
   Check: RiskState.kill_switch_active == false
   Failure: REJECTED (ENTRY only)
   Reason: "global_kill_switch_active"
   Note: EXIT and STAND_DOWN signals are NEVER blocked by this gate

2. SYMBOL_KILL_SWITCH_GATE (ENTRY SIGNALS ONLY)
   Applies: signal_type in [ENTRY_LONG, ENTRY_SHORT, SQUEEZE_FAST_RELEASE, SQUEEZE_CONFIRMED_RELEASE]
   Bypassed: signal_type in [EXIT_FULL, EXIT_PARTIAL, STAND_DOWN] — ALWAYS PASS
   Check: ConfigContract.get_bool("validation.kill_switch.{symbol}") == false
   Failure: REJECTED (ENTRY only)
   Reason: "symbol_kill_switch_active: {symbol}"
   Note: EXIT and STAND_DOWN signals are NEVER blocked by this gate

3. STAND_DOWN_GATE (ENTRY SIGNALS ONLY)
   Applies: signal_type in [ENTRY_LONG, ENTRY_SHORT, SQUEEZE_FAST_RELEASE, SQUEEZE_CONFIRMED_RELEASE]
   Bypassed: signal_type in [EXIT_FULL, EXIT_PARTIAL, STAND_DOWN] — ALWAYS PASS
   Check: RiskState.risk_mode != STAND_DOWN
   Failure: REJECTED (ENTRY only)
   Reason: "risk_mode_stand_down"
   Note: EXIT signals are ALWAYS allowed in STAND_DOWN mode (this is the intended behavior)

4. REDUCE_ONLY_GATE (for ENTRY signals)
   Check: IF signal_type in [ENTRY_*, SQUEEZE_*]:
            RiskState.risk_mode != REDUCE_ONLY
   Note: EXIT signals allowed in REDUCE_ONLY
   Failure: REJECTED
   Reason: "reduce_only_no_entries"

5. CIRCUIT_BREAKER_GATE (ENTRY SIGNALS ONLY)
   Applies: signal_type in [ENTRY_LONG, ENTRY_SHORT, SQUEEZE_FAST_RELEASE, SQUEEZE_CONFIRMED_RELEASE]
   Bypassed: signal_type in [EXIT_FULL, EXIT_PARTIAL, STAND_DOWN] — ALWAYS PASS
   Check: RiskState.circuit_breaker_active == false
   Failure: REJECTED (ENTRY only)
   Reason: "circuit_breaker_active: {reason}"
   Note: EXIT signals are ALWAYS allowed when circuit breaker is active

6. SIGNAL_TTL_GATE
   Check: Clock.now_utc() < SignalIntent.expiry_timestamp_utc
   Check: signal_ttl_remaining_seconds > 0
   Failure: REJECTED
   Reason: "signal_ttl_expired"

7. SIGNAL_LIFECYCLE_GATE
   Check: SignalIntent.lifecycle_state == ACTIVE
   Check: lifecycle_state NOT IN [EXPIRED, INVALIDATED, SUPERSEDED, CONSUMED]
   Failure: REJECTED
   Reason: "signal_not_active: {lifecycle_state}"

8. SIZING_APPROVAL_GATE
   Check: PositionSizingDecision.is_approved == true
   Check: PositionSizingDecision.expires_at > Clock.now_utc()
   Failure: REJECTED
   Reason: "sizing_not_approved" or "sizing_expired"

9. DUPLICATE_EXECUTION_GATE
   Check: No previous APPROVED validation for this signal_idempotency_key
   Query: SELECT * FROM validation_results
          WHERE signal_id = ? AND outcome = APPROVED
   Failure: REJECTED
   Reason: "duplicate_execution_attempt"

9.6. EXIT_POSITION_BINDING_GATE (EXIT SIGNALS ONLY)
     Applies: signal_type in [EXIT_FULL, EXIT_PARTIAL]
     Skipped: signal_type NOT in [EXIT_FULL, EXIT_PARTIAL]
     Note: STAND_DOWN does NOT require binding (portfolio/symbol-level safety signal)

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
            - contracts (exact set match, order-independent per Section 3.7)
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

     Note: This gate runs BEFORE EXIT_EXPOSURE_GATE (9.5) because
     you must identify WHICH position before validating exit quantity.

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

10. REGIME_MISMATCH_GATE
    Compare: SignalContextSnapshot.regime_classification.regime_type
             vs current RegimeClassification.regime_type
    Tolerance: Allowed transitions defined in config
    Check: IF regime changed to incompatible type: FAIL
    Allowed: TRENDING_UP → TRENDING_UP (same)
    Allowed: TRENDING_UP → BREAKOUT (compatible)
    Blocked: TRENDING_UP → TRENDING_DOWN (reversal)
    Blocked: * → UNKNOWN (uncertainty)
    Blocked: * → CHOPPY (for directional signals)
    Failure: REJECTED
    Reason: "regime_mismatch: {old} → {new}"

11. LIQUIDITY_GATE
    Check: Current spread_pct <= max_spread_threshold
    Check: Current spread_pct <= spread_at_signal * max_spread_drift_multiplier
    Default: max_spread_threshold = 0.15 (15%)
    Default: max_spread_drift_multiplier = 2.0
    Failure: REJECTED
    Reason: "liquidity_violation: spread {spread_pct}%"

12. QUOTE_FRESHNESS_GATE
    Check: NormalizedQuote.timestamp_utc > Clock.now_utc() - max_quote_age
    Default: max_quote_age = 30,000 ms (30 seconds)

    EXIT-SAFE FALLBACK (for EXIT_FULL, EXIT_PARTIAL, STAND_DOWN signals):
      IF quote is stale OR missing:
        1. Attempt fallback: Use last_price from SignalContextSnapshot
        2. IF fallback available AND age < 120,000 ms (2 minutes):
           - PASS with flag "quote_fallback_used"
           - Log WARNING: "exit_using_fallback_price"
        3. IF fallback unavailable OR age >= 120,000 ms:
           - PASS with flag "quote_unavailable_exit"
           - Log WARNING: "exit_without_quote_verification"
           - Note: Exits proceed anyway; market order implied

    For ENTRY signals:
      Failure: REJECTED
      Reason: "stale_quote_data: {age_ms}ms"

    Note: Exits are allowed with degraded quote data because closing
    positions during market stress is more important than perfect
    price verification.

13. BAR_FRESHNESS_GATE
    Check: NormalizedBar.timestamp_utc within expected range for timeframe
    Failure: REJECTED
    Reason: "stale_bar_data"

14. EVENT_BLACKOUT_GATE
    Query: EventCalendar for symbol with upcoming events
    Check: No earnings within earnings_blackout_hours
    Check: No FOMC within fomc_blackout_hours
    Check: No CPI/JOBS within macro_blackout_hours
    Defaults:
      earnings_blackout_hours = 24
      fomc_blackout_hours = 4
      macro_blackout_hours = 2
    Failure: REJECTED
    Reason: "event_blackout: {event_type} in {hours}h"
```

### 5.2) Soft Gates (Warn or Defer)

Soft gate failures issue warnings or trigger DEFERRED outcome. Multiple soft failures may compound to REJECTED.

```
SOFT GATES (evaluated after hard gates pass):

15. CONFIDENCE_DECAY_GATE
    Check: Current effective confidence vs original signal confidence
    Decay formula:
      signal_age_seconds = Clock.elapsed_ms(SignalIntent.timestamp_utc) / 1000
      decay_rate = config.confidence_decay_per_minute / 60
      effective_confidence = signal_confidence * (1 - decay_rate * signal_age_seconds)
    Warning threshold: effective_confidence < signal_confidence * 0.80
    Impact: WARN + flag "confidence_decayed"
    IF effective_confidence < min_confidence_threshold: DEFER
    Default: min_confidence_threshold = 0.40

16. REGIME_DRIFT_GATE (within tolerance)
    Check: Regime changed but to compatible type
    Example: TRENDING_UP → VOLATILE_EXPANSION (may be ok)
    Impact: WARN + penalty_applied = 0.10
    Note: Hard mismatch handled by gate #10

17. LIQUIDITY_THINNING_GATE
    Check: spread_pct > spread_at_signal * 1.5 (but under hard threshold)
    Impact: WARN + penalty_applied = 0.15
    Note: Severe thinning handled by gate #11

18. VOLATILITY_SPIKE_GATE
    Compare: Current volatility_state vs at signal time
    Check: IF volatility_state increased by 2+ levels: WARN
    Example: LOW → HIGH or NORMAL → EXTREME
    Impact: WARN + flag "volatility_spike"
    IF EXTREME and signal was created in LOW/NORMAL: DEFER

19. MTF_ALIGNMENT_DRIFT_GATE
    Check: Multi-timeframe alignment still holds
    Compare: Original MTF alignment score vs current
    IF alignment_score dropped by > 0.30: WARN
    IF alignment_score dropped by > 0.50: DEFER
    Impact: WARN or DEFER + flag "mtf_alignment_lost"

20. SIGNAL_AGE_GATE
    Check: Signal age relative to urgency
    Thresholds:
      IMMEDIATE: warn if age > 60 seconds, defer if age > 120 seconds
      STANDARD: warn if age > 180 seconds, defer if age > 300 seconds
      LOW: warn if age > 300 seconds, defer if age > 600 seconds
    Impact: WARN or DEFER + flag "signal_aging"

21. SIZING_AGE_GATE
    Check: PositionSizingDecision age
    Threshold: warn if age > 60 seconds, defer if age > 120 seconds
    Impact: WARN or DEFER + flag "sizing_stale"

22. ACCUMULATED_PENALTY_GATE
    Check: Sum of all soft gate penalties
    IF total_penalty > 0.50: DEFER
    IF total_penalty > 0.75: REJECT
    Reason: "accumulated_soft_penalties: {total}"
```

### 5.3) Gate Evaluation Order

```
GATE EVALUATION ORDER:

Phase 1: CRITICAL SYSTEM GATES (instant reject)
  1. GLOBAL_KILL_SWITCH_GATE
  2. SYMBOL_KILL_SWITCH_GATE
  3. STAND_DOWN_GATE
  4. REDUCE_ONLY_GATE
  5. CIRCUIT_BREAKER_GATE

Phase 2: SIGNAL/SIZING VALIDITY (instant reject)
  6. SIGNAL_TTL_GATE
  7. SIGNAL_LIFECYCLE_GATE
  8. SIZING_APPROVAL_GATE
  9. DUPLICATE_EXECUTION_GATE
  9.6. EXIT_POSITION_BINDING_GATE (exit signals only — binds to exactly one position)
  9.5. EXIT_EXPOSURE_GATE (exit signals only — validates exit_qty for bound position)

  Note: Gate 9.6 runs BEFORE 9.5 because you must identify WHICH position
  (binding) before validating exit quantity (exposure).

Phase 3: MARKET CONDITIONS (instant reject)
  10. REGIME_MISMATCH_GATE
  11. LIQUIDITY_GATE
  12. QUOTE_FRESHNESS_GATE
  13. BAR_FRESHNESS_GATE
  14. EVENT_BLACKOUT_GATE

Phase 4: SOFT CHECKS (warn/defer)
  15. CONFIDENCE_DECAY_GATE
  16. REGIME_DRIFT_GATE
  17. LIQUIDITY_THINNING_GATE
  18. VOLATILITY_SPIKE_GATE
  19. MTF_ALIGNMENT_DRIFT_GATE
  20. SIGNAL_AGE_GATE
  21. SIZING_AGE_GATE
  22. ACCUMULATED_PENALTY_GATE

PRECEDENCE RULES:
- Gates evaluated in order; first hard failure stops evaluation
- Soft gates only evaluated if all hard gates pass
- EXIT_SAFE GUARANTEE (ABSOLUTE): EXIT_FULL, EXIT_PARTIAL, and STAND_DOWN signals
  bypass kill-switch, circuit-breaker, and stand-down gates unconditionally
- For ENTRY signals: KILL_SWITCH > STAND_DOWN > CIRCUIT_BREAKER > all other gates
- STAND_DOWN mode blocks ENTRY signals but allows all EXIT signals
- Duplicate check always runs regardless of other gates (applies to all signal types)
```

---

## 6) Decision Outcomes

### 6.1) APPROVED

```
APPROVED:
  - All hard gates passed
  - All soft gates passed OR warnings only (no DEFER triggers)
  - Trade may proceed to execution

  Actions:
    - Create TradeValidationResult with outcome=APPROVED
    - Update TradeValidationState to APPROVED
    - Set execution_authorized = true
    - Log validation success
    - Return result to caller (execution module)

  Execution window:
    - APPROVED is valid for execution_window_seconds (default: 30)
    - After window expires, must re-validate
```

### 6.2) REJECTED

```
REJECTED:
  - At least one hard gate failed
  - OR accumulated soft penalties exceeded threshold
  - Trade MUST NOT proceed to execution

  Actions:
    - Create TradeValidationResult with outcome=REJECTED
    - Record blocking_gate and blocking_reason
    - Update TradeValidationState to REJECTED
    - Set execution_authorized = false
    - Emit RiskEvent (from 10_risk_management schema)
    - Log rejection with full context
    - Notify monitoring (if configured)

  Finality:
    - REJECTED is final for this validation request
    - Same signal CAN be re-validated via new request (if TTL allows)
    - Repeated rejections increment rejection counter
```

### 6.3) DEFERRED

```
DEFERRED:
  - All hard gates passed
  - One or more soft gates triggered DEFER
  - Trade should NOT proceed now, but MAY succeed later

  Actions:
    - Create TradeValidationResult with outcome=DEFERRED
    - Record deferral_reason
    - Calculate retry_after_seconds based on cause:
        - confidence_decay: retry_after = 30 seconds
        - volatility_spike: retry_after = 60 seconds
        - mtf_alignment_lost: retry_after = 120 seconds
        - signal_aging: retry_after = signal_ttl_remaining / 2
    - Calculate retry_deadline = min(signal_expiry, sizing_expiry)
    - Update TradeValidationState to DEFERRED
    - Set execution_authorized = false
    - Schedule retry if retry_eligible

  Retry eligibility:
    - retry_eligible = (retry_count < max_retry_attempts) AND (retry_deadline > now)
    - Default: max_retry_attempts = 3
    - Each retry creates new TradeValidationRequest with is_retry=true

  Resolution:
    - DEFERRED → APPROVED: Conditions improved
    - DEFERRED → REJECTED: Conditions worsened or retries exhausted
    - DEFERRED → EXPIRED: Signal TTL expired during deferral
```

---

## 7) Validation Algorithm

### 7.1) Main Validation Sequence

```
VALIDATION_ALGORITHM:

INPUT:
  - TradeValidationRequest

OUTPUT:
  - TradeValidationResult

ALGORITHM:

1. START TIMER
   processing_started = Clock.now_utc()

2. VALIDATE REQUEST
   - Check request_id is unique (not already processed)
   - Check all required fields present
   - Check signal_id exists and matches SignalIntent
   - Check decision_id exists and matches PositionSizingDecision

   EXIT-SPECIFIC SCHEMA VALIDATION (if signal_type in [EXIT_FULL, EXIT_PARTIAL]):
   - Check signal_direction == NEUTRAL (exits must be directionally neutral)
   - Check entry_price_zone is null or empty (exits don't have entry zones)
   - Check quantity > 0 (cannot exit zero)
   - IF EXIT_PARTIAL: Check 0 < quantity < total_position_size
   - IF EXIT_FULL: Check quantity == total_position_size OR quantity == 0 (close all)
   - IF any check fails: blocking_reason = "exit_schema_invalid: {details}"

   IF validation fails:
     RETURN TradeValidationResult(
       outcome=REJECTED,
       blocking_gate="REQUEST_VALIDATION",
       blocking_reason="invalid_request: {details}"
     )

3. LOAD CONTEXT
   - Load SignalIntent by signal_id
   - Load SignalContextSnapshot by signal_id
   - Load PositionSizingDecision by decision_id
   - Load current RiskState
   - Load current RegimeClassification for symbol
   - Load current NormalizedQuote for symbol
   - Load current NormalizedBar for symbol/timeframe
   - Load EventCalendar for symbol

   IF any critical load fails:
     RETURN TradeValidationResult(
       outcome=REJECTED,
       blocking_gate="CONTEXT_LOAD",
       blocking_reason="missing_context: {what}"
     )

4. EVALUATE HARD GATES (Phase 1-3)
   gate_results = []

   # EXIT-SAFE CHECK (ABSOLUTE PRIORITY)
   is_exit_signal = signal_type IN [EXIT_FULL, EXIT_PARTIAL, STAND_DOWN]
   exit_safe_gates = [
     "GLOBAL_KILL_SWITCH_GATE",
     "SYMBOL_KILL_SWITCH_GATE",
     "STAND_DOWN_GATE",
     "CIRCUIT_BREAKER_GATE"
   ]

   FOR each hard_gate in HARD_GATES_ORDERED:
     # EXIT signals automatically bypass kill-switch and safety gates
     IF is_exit_signal AND hard_gate.gate_id IN exit_safe_gates:
       result = ValidationGateResult(
         gate_id=hard_gate.gate_id,
         gate_name=hard_gate.name,
         gate_type=HARD,
         passed=true,  # FORCED PASS for EXIT signals
         impact=NONE,
         check_description="EXIT_SAFE_BYPASS: EXIT signals are never blocked by this gate"
       )
       gate_results.append(result)
       CONTINUE  # Skip actual gate evaluation

     result = evaluate_gate(hard_gate, context)
     gate_results.append(result)

     IF result.passed == false:
       # Short-circuit on first hard failure
       STOP timer
       RETURN TradeValidationResult(
         outcome=REJECTED,
         blocking_gate=hard_gate.gate_id,
         blocking_reason=result.failure_reason,
         gate_results=gate_results,
         ...
       )

5. EVALUATE SOFT GATES (Phase 4)
   total_penalty = 0.0
   defer_triggered = false
   defer_reasons = []

   FOR each soft_gate in SOFT_GATES_ORDERED:
     result = evaluate_gate(soft_gate, context)
     gate_results.append(result)

     IF result.impact == WARN:
       total_penalty += result.penalty_applied or 0
       # Log warning but continue

     IF result.impact == DEFER:
       defer_triggered = true
       defer_reasons.append(result.failure_reason)

6. CHECK ACCUMULATED PENALTIES
   IF total_penalty > 0.75:
     RETURN TradeValidationResult(
       outcome=REJECTED,
       blocking_gate="ACCUMULATED_PENALTY",
       blocking_reason=f"total_penalty={total_penalty}",
       gate_results=gate_results,
       ...
     )

   IF total_penalty > 0.50 OR defer_triggered:
     # Calculate retry parameters
     retry_after = calculate_retry_after(defer_reasons)
     retry_deadline = min(signal_expiry, sizing_expiry)

     RETURN TradeValidationResult(
       outcome=DEFERRED,
       deferral_reason=join(defer_reasons),
       retry_eligible=(retry_count < max_retries) AND (retry_deadline > now),
       retry_after_seconds=retry_after,
       retry_deadline=retry_deadline,
       gate_results=gate_results,
       ...
     )

7. ALL GATES PASSED
   STOP timer
   RETURN TradeValidationResult(
     outcome=APPROVED,
     outcome_reason="all_gates_passed",
     gate_results=gate_results,
     validation_duration_ms=elapsed,
     ...
   )
```

### 7.2) Gate Evaluation Function

```
evaluate_gate(gate, context):
  result = ValidationGateResult(
    gate_id=gate.id,
    gate_name=gate.name,
    gate_type=gate.type,
    evaluation_order=gate.order,
    check_description=gate.description
  )

  # Execute gate-specific check
  check_result = gate.check_function(context)

  result.passed = check_result.passed
  result.actual_value = check_result.actual
  result.expected_value = check_result.expected
  result.threshold = check_result.threshold

  IF check_result.passed:
    result.impact = NONE
  ELSE:
    IF gate.type == HARD:
      result.impact = BLOCK
      result.failure_reason = check_result.reason
    ELSE:  # SOFT
      result.impact = check_result.soft_impact  # WARN or DEFER
      result.penalty_applied = check_result.penalty
      result.warning_message = check_result.message

  RETURN result
```

### 7.3) Retry Logic

```
RETRY_LOGIC:

When DEFERRED result is returned:

1. Check retry eligibility:
   eligible = (
     request.retry_count < max_retry_attempts AND
     signal_ttl_remaining > min_retry_ttl AND
     sizing_expires_at > now
   )

2. If eligible, schedule retry:
   next_retry_at = now + retry_after_seconds
   Create new TradeValidationRequest:
     - is_retry = true
     - retry_count = previous + 1
     - original_request_id = first request's ID

3. When retry executes:
   - Reload all context (may have changed)
   - Run full validation again
   - If still DEFERRED and retries remain, schedule again
   - If DEFERRED and no retries remain, convert to REJECTED

4. Retry backoff:
   retry_after = base_retry_after * (1.5 ^ retry_count)
   Max retry_after = signal_ttl_remaining / 2
```

---

## 8) State Machine

### 8.1) States

```
VALIDATION STATES:

PENDING:
  - Initial state when request created
  - Validation not yet started
  - Transitions: → APPROVED, → REJECTED, → DEFERRED

APPROVED:
  - All gates passed
  - Execution authorized
  - Terminal state (for this request)
  - No further transitions

REJECTED:
  - Hard gate failed or penalties exceeded
  - Execution blocked
  - Terminal state
  - No further transitions

DEFERRED:
  - Soft conditions not met
  - Awaiting retry or expiration
  - Transitions: → APPROVED, → REJECTED, → EXPIRED

EXPIRED:
  - Signal TTL expired while DEFERRED
  - Or max retries exhausted
  - Terminal state
  - No further transitions
```

### 8.2) State Transition Diagram

```
STATE TRANSITIONS:

          ┌─────────────────────────────────────────┐
          │                                         │
          ▼                                         │
      ┌─────────┐                                   │
      │ PENDING │───────────────────────────────────┤
      └────┬────┘                                   │
           │                                        │
     ┌─────┴─────┬──────────────┐                   │
     │           │              │                   │
     ▼           ▼              ▼                   │
┌──────────┐ ┌──────────┐ ┌──────────┐              │
│ APPROVED │ │ REJECTED │ │ DEFERRED │──────────────┘
└──────────┘ └──────────┘ └────┬─────┘        (retry)
                               │
                    ┌──────────┼──────────┐
                    │          │          │
                    ▼          ▼          ▼
              ┌──────────┐ ┌──────────┐ ┌─────────┐
              │ APPROVED │ │ REJECTED │ │ EXPIRED │
              └──────────┘ └──────────┘ └─────────┘


TRANSITION RULES:

PENDING → APPROVED:
  Trigger: All gates passed
  Guard: None

PENDING → REJECTED:
  Trigger: Hard gate failed OR accumulated penalties > 0.75
  Guard: None

PENDING → DEFERRED:
  Trigger: Soft gate triggered DEFER OR penalties > 0.50
  Guard: retry_eligible == true

DEFERRED → APPROVED:
  Trigger: Retry validation passes
  Guard: Signal TTL not expired

DEFERRED → REJECTED:
  Trigger: Retry validation fails hard gate
  Guard: None

DEFERRED → REJECTED:
  Trigger: Max retries exhausted
  Guard: retry_count >= max_retry_attempts

DEFERRED → EXPIRED:
  Trigger: Signal TTL expired
  Guard: now >= signal_expiry_timestamp
```

### 8.3) Cooldown and Retry Limits

```
COOLDOWN AND LIMITS:

RETRY LIMITS:
  max_retry_attempts = 3  (config-driven)
  min_retry_interval_seconds = 10
  max_retry_interval_seconds = 300

RETRY BACKOFF:
  base_interval = 15 seconds
  backoff_multiplier = 1.5
  attempt_1: 15 seconds
  attempt_2: 22.5 seconds
  attempt_3: 33.75 seconds

COOLDOWN BETWEEN VALIDATIONS (same signal):
  After REJECTED: 60 seconds before new request allowed
  After APPROVED: No new request allowed (duplicate gate blocks)
  After EXPIRED: No new request allowed (signal dead)

RATE LIMITING:
  max_validations_per_symbol_per_minute = 10
  If exceeded: Return REJECTED with "rate_limit_exceeded"
```

---

## 9) Write Contract

### 9.1) Output Store Paths

```
Store Paths:

processed/
  trade_validation/
    requests/
      {symbol}/
        {date}/
          request_{request_id}.parquet
    results/
      {symbol}/
        {date}/
          result_{result_id}.parquet
    states/
      {symbol}/
        {date}/
          state_{state_id}.parquet
    events/
      {date}/
        event_{timestamp}.parquet
    metrics/
      {date}/
        metrics_{timestamp}.parquet
```

### 9.2) Write Contract

```
WRITE CONTRACT (09_trade_validation → 02_data_store):

1. IDEMPOTENT WRITES
   - request_id is unique key for TradeValidationRequest
   - result_id is unique key for TradeValidationResult
   - state_id is unique key for TradeValidationState
   - Duplicate writes rejected

2. SCHEMA VALIDATION
   - All outputs validated against canonical schemas
   - Schema version in provenance
   - Validation failures reject write + log error

3. TRANSACTION SEMANTICS
   - TradeValidationRequest → TradeValidationResult written atomically
   - State updates are atomic

4. ORDERING GUARANTEES
   - Results written AFTER request recorded
   - State updates written AFTER result recorded

5. RETENTION
   - Hot tier: 24 hours (real-time queries)
   - Warm tier: 30 days (analysis)
   - Cold tier: 1 year (compliance/audit)

6. WRITE RESULT
   02_data_store returns:
   - success: bool
   - record_id: string
   - storage_path: string
   - error_message: string | null

7. FAILURE HANDLING
   - Retry writes 3x with exponential backoff
   - If still fails: Log error, return validation result anyway
   - Write failure does NOT block execution authorization
```

---

## 10) Submodule Structure

```
09_trade_validation/
├── SPEC.md                          # This document
├── gates/
│   ├── __init__.py
│   ├── gate_registry.py             # Register all gates
│   ├── gate_runner.py               # Execute gates in order
│   ├── hard_gates/
│   │   ├── __init__.py
│   │   ├── kill_switch_gates.py     # Gates 1-2
│   │   ├── risk_mode_gates.py       # Gates 3-5
│   │   ├── signal_gates.py          # Gates 6-9
│   │   ├── market_gates.py          # Gates 10-11
│   │   ├── freshness_gates.py       # Gates 12-13
│   │   └── event_gates.py           # Gate 14
│   └── soft_gates/
│       ├── __init__.py
│       ├── decay_gates.py           # Gates 15, 20-21
│       ├── drift_gates.py           # Gates 16-17, 19
│       ├── volatility_gates.py      # Gate 18
│       └── accumulator_gate.py      # Gate 22
├── outcomes/
│   ├── __init__.py
│   ├── approved.py                  # APPROVED handling
│   ├── rejected.py                  # REJECTED handling
│   └── deferred.py                  # DEFERRED handling + retry
├── state_machine/
│   ├── __init__.py
│   ├── states.py                    # State definitions
│   ├── transitions.py               # Transition logic
│   └── state_manager.py             # State persistence
├── retry/
│   ├── __init__.py
│   ├── retry_scheduler.py           # Schedule retries
│   ├── retry_executor.py            # Execute retries
│   └── backoff.py                   # Backoff calculation
├── context/
│   ├── __init__.py
│   ├── context_loader.py            # Load all inputs
│   ├── freshness_checker.py         # Check input ages
│   └── drift_detector.py            # Detect regime/liquidity drift
├── writers/
│   ├── __init__.py
│   ├── request_writer.py            # Write TradeValidationRequest
│   ├── result_writer.py             # Write TradeValidationResult
│   ├── state_writer.py              # Write TradeValidationState
│   └── metrics_writer.py            # Write TradeValidationMetrics
├── readers/
│   ├── __init__.py
│   ├── signal_reader.py             # Read from 08
│   ├── sizing_reader.py             # Read from 10
│   ├── regime_reader.py             # Read from 04
│   ├── quote_reader.py              # Read quotes
│   └── event_reader.py              # Read EventCalendar
├── tests/
│   ├── __init__.py
│   ├── test_hard_gates.py           # Each hard gate
│   ├── test_soft_gates.py           # Each soft gate
│   ├── test_gate_ordering.py        # Precedence rules
│   ├── test_outcomes.py             # APPROVED/REJECTED/DEFERRED
│   ├── test_state_machine.py        # State transitions
│   ├── test_retry_logic.py          # Retry behavior
│   ├── test_duplicate_prevention.py # Duplicate execution gate
│   ├── test_drift_detection.py      # Regime/liquidity drift
│   ├── test_end_to_end.py           # Full validation flow
│   └── test_deny_by_default.py      # Verify deny behavior
└── config/
    ├── validation_config.yaml       # Main config
    ├── gate_config.yaml             # Gate thresholds
    ├── retry_config.yaml            # Retry parameters
    └── drift_config.yaml            # Drift tolerances
```

---

## 11) Validation & Failure Modes

| Failure Mode | Detection | Response | Logging |
|--------------|-----------|----------|---------|
| **Global kill switch active** | Gate 1 check | REJECTED immediately | CRITICAL: "kill_switch_block" |
| **Symbol kill switch active** | Gate 2 check | REJECTED immediately | WARN: "symbol_kill_switch" |
| **Risk mode STAND_DOWN** | Gate 3 check | REJECTED immediately | WARN: "stand_down_block" |
| **Risk mode REDUCE_ONLY (entry)** | Gate 4 check | REJECTED immediately | INFO: "reduce_only_entry_block" |
| **Circuit breaker active** | Gate 5 check | REJECTED immediately | WARN: "circuit_breaker_block" |
| **Signal TTL expired** | Gate 6 check | REJECTED immediately | INFO: "ttl_expired" |
| **Signal invalidated/superseded** | Gate 7 check | REJECTED immediately | INFO: "signal_not_active" |
| **Sizing not approved** | Gate 8 check | REJECTED immediately | WARN: "sizing_rejected" |
| **Duplicate execution attempt** | Gate 9 check | REJECTED immediately | WARN: "duplicate_blocked" |
| **Regime mismatch (hard)** | Gate 10 check | REJECTED immediately | WARN: "regime_mismatch" |
| **Liquidity violation** | Gate 11 check | REJECTED immediately | WARN: "liquidity_fail" |
| **Quote data stale** | Gate 12 check | REJECTED immediately | ERROR: "stale_quote" |
| **Bar data stale** | Gate 13 check | REJECTED immediately | ERROR: "stale_bar" |
| **Event blackout active** | Gate 14 check | REJECTED immediately | INFO: "event_blackout" |
| **Confidence decayed below threshold** | Gate 15 check | DEFERRED | INFO: "confidence_decay_defer" |
| **Accumulated penalties excessive** | Gate 22 check | REJECTED or DEFERRED | WARN: "penalty_threshold" |
| **Context load failure** | Step 3 | REJECTED | ERROR: "context_load_fail" |
| **Max retries exhausted** | Retry logic | REJECTED | INFO: "retries_exhausted" |
| **Rate limit exceeded** | Request validation | REJECTED | WARN: "rate_limit" |
| **Write failure** | Store write | Log error, continue | ERROR: "write_failed" |
| **EXIT signal blocked by kill-switch (BUG)** | Gate 1-2 blocking EXIT signal | CRITICAL BUG — EXIT signals must NEVER be blocked | CRITICAL: "exit_safe_violation" |
| **Kill-switch misconfiguration** | Kill-switch blocking EXIT or STAND_DOWN | Alert operations, override gate to PASS | CRITICAL: "exit_safe_override_applied" |
| **Exit exceeds position** | Gate 9.5 check | REJECTED immediately | WARN: "exit_exceeds_position" |
| **No position to exit** | Gate 9.6 check (0 matches) | REJECTED immediately | WARN: "no_position_to_exit" |
| **Position lookup failed** | Gate 9.6 fallback | PASS with flag "position_unverified" | WARN: "position_lookup_failed" |
| **Exit with quote fallback** | Gate 12 fallback | PASS with flag "quote_fallback_used" | WARN: "exit_using_fallback_price" |
| **Exit without quote verification** | Gate 12 fallback (extreme) | PASS with flag "quote_unavailable_exit" | WARN: "exit_without_quote_verification" |
| **Exit schema invalid** | Step 2 validation | REJECTED immediately | ERROR: "exit_schema_invalid" |
| **Exit position binding missing** | Gate 9.6 check | REJECTED immediately | ERROR: "exit_position_binding_missing" |
| **Exit position binding mismatch** | Gate 9.6 check (symbol/strategy_id mismatch) | REJECTED immediately | ERROR: "exit_position_binding_mismatch" |
| **Exit position ambiguous** | Gate 9.6 check (>1 positions match) | REJECTED or DEFERRED (config) | WARN: "exit_position_ambiguous" |
| **Exit position snapshot missing** | Gate 9.6 check (no PositionSnapshot available) | DEFERRED (default) or PASS+penalty | WARN: "exit_position_snapshot_missing" |

---

## 12) Minimum Acceptance Criteria

### 12.1) Schema Completeness

- [x] TradeValidationRequest defined with all fields
- [x] TradeValidationResult defined with all fields
- [x] ValidationGateResult defined with all fields
- [x] TradeValidationState defined with all states
- [x] TradeValidationProvenance defined for auditability
- [x] TradeValidationMetrics defined for monitoring

### 12.2) Gate Coverage

- [x] 16 hard gates defined and ordered (incl. 9.5 EXIT_EXPOSURE, 9.6 EXIT_POSITION_BINDING)
- [x] 8 soft gates defined and ordered
- [x] Evaluation order explicitly specified
- [x] Precedence rules documented (kill switch > stand down > etc.)
- [x] Each gate has clear pass/fail criteria

### 12.3) Outcomes

- [x] APPROVED outcome defined with actions
- [x] REJECTED outcome defined with actions
- [x] DEFERRED outcome defined with retry logic
- [x] Execution window for APPROVED defined

### 12.4) State Machine

- [x] All 5 states defined (PENDING, APPROVED, REJECTED, DEFERRED, EXPIRED)
- [x] All transitions defined
- [x] Terminal states identified
- [x] Cooldown and retry limits specified

### 12.5) Algorithm

- [x] Deterministic validation sequence documented
- [x] No ML or randomness
- [x] Gate evaluation function specified
- [x] Retry logic specified

### 12.6) Safety

- [x] Deny-by-default philosophy documented
- [x] Duplicate execution prevention (Gate 9)
- [x] Kill switch honored for ENTRY signals
- [x] EXIT-SAFE GUARANTEE: EXIT_FULL, EXIT_PARTIAL, and STAND_DOWN signals are NEVER blocked by kill-switch, stand-down, or circuit-breaker gates
- [x] All failures logged
- [x] Exit-safe violation detection and alerting
- [x] EXIT_EXPOSURE_GATE (9.5) ensures exits cannot exceed open position
- [x] Quote fallback allows exits during degraded market data conditions
- [x] Exit-specific schema validation prevents malformed exit signals
- [x] EXIT_POSITION_BINDING_GATE (9.6) ensures exits bind to exactly one position
- [x] Multi-leg contract matching uses exact set match (order-independent)
- [x] Ambiguous exits (>1 matches) are REJECTED or DEFERRED (configurable)
- [x] STAND_DOWN signals do NOT require position binding (portfolio-level)
- [x] Gate 9.6 runs BEFORE Gate 9.5 (bind first, then check quantity)

### 12.7) Test Plan

| Test Category | Test Cases |
|---------------|------------|
| **Hard Gates** | Each gate in isolation; boundary values |
| **Soft Gates** | Each gate; penalty accumulation |
| **Gate Ordering** | Precedence verification; short-circuit behavior |
| **Outcomes** | APPROVED/REJECTED/DEFERRED handling |
| **State Machine** | All transitions; terminal states |
| **Retry Logic** | Backoff; max retries; deadline expiration |
| **Duplicate Prevention** | Same signal validation blocked |
| **Drift Detection** | Regime drift; liquidity drift |
| **Deny-by-Default** | Missing data → REJECT; unknown state → REJECT |
| **End-to-End** | Full validation flow; write contract |
| **EXIT-SAFE (CRITICAL)** | EXIT_FULL with kill-switch active → APPROVED; EXIT_PARTIAL with kill-switch active → APPROVED; STAND_DOWN signal with kill-switch active → APPROVED; EXIT signal with circuit-breaker active → APPROVED; ENTRY signal with kill-switch active → REJECTED; verify exit-safe bypass logged correctly |
| **EXIT-EXPOSURE (CRITICAL)** | EXIT_PARTIAL with qty > position → REJECTED; EXIT_FULL with qty != position → REJECTED (unless qty == 0); EXIT with no open position → REJECTED; EXIT with position lookup failure → PASS with "position_unverified" flag; verify reduce-only guarantee enforced |
| **EXIT-QUOTE-FALLBACK** | EXIT with fresh quote → normal flow; EXIT with stale quote (< 2 min) → PASS with "quote_fallback_used"; EXIT with no quote available → PASS with "quote_unavailable_exit"; ENTRY with stale quote → REJECTED |
| **EXIT-SCHEMA** | EXIT with direction != NEUTRAL → REJECTED; EXIT with entry_price_zone set → REJECTED; EXIT with quantity == 0 and type EXIT_PARTIAL → REJECTED; valid EXIT_FULL with qty=0 (close all) → PASS |
| **EXIT-POSITION-BINDING (CRITICAL)** | Exit with valid position_id → APPROVED; Exit with valid position_key → APPROVED; Exit with contracts-only binding (exact set match) → APPROVED; Exit with contracts binding (order-independent match) → APPROVED; Exit with missing position_binding → REJECTED; Exit with binding mismatch (symbol differs) → REJECTED; Exit with binding mismatch (strategy_id differs) → REJECTED; Exit resolves to 0 positions → REJECTED (no_position_to_exit); Exit resolves to >1 positions (REJECT config) → REJECTED (exit_position_ambiguous); Exit resolves to >1 positions (DEFER config) → DEFERRED; PositionSnapshot missing with strict config → DEFERRED; PositionSnapshot missing with permissive config → PASS with penalty 0.20; STAND_DOWN signal without binding → APPROVED (binding not required); Multi-leg partial contracts match → REJECTED (0 matches) |

---

## 13) Deferred Design Notes

### 13.1) Deferred to Future Modules

| Item | Deferred To | Rationale |
|------|-------------|-----------|
| Order execution | 11_execution | Broker integration |
| Fill tracking | 11_execution | Execution concern |
| Order management | 12_order_management | Order lifecycle |
| Position tracking | 11_execution | Requires fills |

### 13.2) Intentionally NOT Handled

| Item | Reason |
|------|--------|
| Generating new signals | Signal generation is 08's job |
| Modifying position size | Sizing is 10's job |
| Re-calculating stop/TP | Sizing is 10's job |
| Canceling existing orders | Order management is future module |
| Partial fill handling | Execution concern |
| Slippage estimation | Execution concern |

### 13.3) Known Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| No real-time quote streaming | May use slightly stale quotes | Freshness gates with tight thresholds; EXIT-SAFE fallback for exits |
| Position lookup may fail | EXIT_EXPOSURE_GATE cannot verify qty | Fallback allows exit with "position_unverified" flag |
| Static event calendar | May miss dynamic events | Config-driven blackout fallback |
| No ML confidence adjustment | Confidence decay is linear | Conservative decay rate |

---

## 14) Proposed Git Commit

```
Commit ID: COMMIT-0013 + PATCH_0013A + PATCH_0013B
Module: 09_trade_validation
Type: SPEC + PATCH

Summary:
Trade validation specification with EXIT-SAFE guarantee, exit safety constraints,
and position binding. Implements deny-by-default validation with 23 gates,
3 outcomes, and full state machine for validation lifecycle.

EXIT-SAFE GUARANTEE: EXIT and STAND_DOWN signals are NEVER blocked by
kill-switch, circuit-breaker, or stand-down gates.

EXIT SAFETY CONSTRAINTS (PATCH_0013A):
- EXIT_EXPOSURE_GATE (9.5): Prevents exit_qty > open_position_qty
- Quote fallback for exits during degraded market data
- Exit-specific schema validation prevents malformed exits

EXIT POSITION BINDING (PATCH_0013B):
- EXIT_POSITION_BINDING_GATE (9.6): Ensures exits bind to exactly one position
- PositionBindingKey schema with multi-leg contract support
- Exact set match semantics for multi-leg positions (order-independent)
- Gate 9.6 runs BEFORE 9.5 (bind first, then check quantity)
- STAND_DOWN exempt from binding (portfolio-level signal)

Contents:
- 7 canonical schemas (incl. PositionBindingKey, OptionContractRef)
- 16 hard gates (incl. EXIT_POSITION_BINDING 9.6, EXIT_EXPOSURE 9.5)
- 8 soft gates
- 3 outcomes (APPROVED, REJECTED, DEFERRED)
- 5-state machine with retry logic
- Deterministic validation algorithm
- EXIT-SAFE bypass for EXIT_FULL, EXIT_PARTIAL, and STAND_DOWN signals

Key Features:
- Deny-by-default philosophy
- EXIT-SAFE GUARANTEE (kill-switch/circuit-breaker never block exits)
- EXIT_POSITION_BINDING ensures exits target exactly one position
- EXIT_EXPOSURE_GATE ensures reduce-only for exits
- Quote fallback allows exits during market stress
- Duplicate execution prevention
- Regime and liquidity drift detection
- Configurable retry with backoff

Upstream Dependencies:
- 08_signal_generation (SignalIntent, SignalContextSnapshot)
- 10_risk_management (PositionSizingDecision, RiskState)
- 04_market_regime (RegimeClassification)
- 02_data_store (NormalizedQuote, NormalizedBar)
- 01_data_ingestion (EventCalendar)
- 00_core (ConfigContract, Clock, Logger)

Downstream Consumers:
- 11_execution (future)

Files:
- options_trading_brain/09_trade_validation/SPEC.md
- options_trading_brain/09_trade_validation/PATCH_0013A.md
- options_trading_brain/09_trade_validation/PATCH_0013B.md

Commit Message:
[OptionsBrain] 09_trade_validation PATCH_0013B: exit position binding gate

CONTRACT LOCKED - Changes require PATCH document
```

---

**END OF SPEC**
