# 08_SIGNAL_GENERATION — SPEC

**Commit ID:** COMMIT-0011
**Status:** SPEC COMPLETE
**Upstream Dependencies:** 00_core, 02_data_store, 04_market_regime, 04b_setup_and_pattern_library, 07_strategy_selection_engine
**Downstream Consumers:** 10_risk_sizing (future)

---

## 1) Purpose

The Signal Generation module is the **final decision boundary before risk management and execution**. It converts approved strategy intent from 07_strategy_selection_engine into **immutable, time-bound SignalIntent objects**.

This module answers one question: **"Given the approved strategies, what specific trading signals should be emitted right now?"**

### 1.1) Core Properties

| Property | Requirement |
|----------|-------------|
| **Deterministic** | Same inputs always produce same outputs |
| **Stateless** | No persistent state beyond cooldown tracking |
| **Fast** | Meets latency budgets for squeeze events |
| **Immutable outputs** | SignalIntent objects are never modified after creation |
| **Single responsibility** | Creates signals only; does not size or execute |

### 1.2) Philosophy

Signal generation is a **translation layer**, not a decision layer. The decision to trade has already been made by 07_strategy_selection_engine. This module:

1. Validates that conditions still hold (freshness, validity)
2. Constructs precise signal parameters
3. Assigns confidence, TTL, and lifecycle metadata
4. Emits idempotent signals for downstream consumption
5. Prevents duplicate and conflicting signals

The module operates with **zero tolerance for ambiguity**. Every signal is either valid and emitted, or invalid and rejected with explicit reasoning.

---

## 2) Owns / Does Not Own

### 2.1) This Module Owns

| Responsibility | Description |
|----------------|-------------|
| **Signal intent creation** | Constructing SignalIntent objects from approved strategies |
| **Signal validation** | Verifying all preconditions before emission |
| **Signal deduplication** | Preventing duplicate signals via hash-based + semantic detection |
| **Cooldown enforcement** | Minimum intervals between signals per (symbol, strategy) |
| **TTL assignment** | Time-to-live for each signal based on urgency |
| **Urgency handling** | FAST_RELEASE vs CONFIRMED_RELEASE processing paths |
| **Confidence aggregation** | Computing composite signal confidence from inputs |
| **Signal invalidation** | Rules for when signals become invalid |
| **Idempotent emission** | Ensuring re-runs produce identical outputs |
| **Stand-down signals** | Explicit "do not trade" signals when conditions warrant |
| **Kill-switch integration** | Emergency signal suppression from config |

### 2.2) This Module Does NOT Own

| Responsibility | Owner |
|----------------|-------|
| Strategy selection | 07_strategy_selection_engine |
| Setup detection | 04b_setup_and_pattern_library |
| Market regime classification | 04_market_regime |
| Feature computation | 03_feature_engineering |
| Options analytics | 05_options_analytics |
| Risk sizing | 10_risk_sizing (future) |
| Position sizing | 10_risk_sizing (future) |
| Order execution | 11_execution (future) |
| Order management | 12_order_management (future) |
| Portfolio state | 10_risk_sizing (future) |
| PnL tracking | Separate module (future) |
| Broker integration | 11_execution (future) |

---

## 3) Inputs (Read-Only)

All inputs are consumed via 02_data_store. This module has **read-only access** to upstream data.

### 3.1) From 07_strategy_selection_engine

```
StrategySelectionState:
  - symbol: string
  - timeframe: string
  - timestamp_utc: datetime
  - selection_id: string
  - top_n_strategies: StrategyCandidate[]
  - n_candidates_selected: int
  - active_strategy_ids: string[]
  - blackout_active: bool
  - blackout_reason: string | null
  - squeeze_override_active: bool
  - stability_score: float
  - provenance: StrategySelectionProvenance

StrategyCandidate:
  - symbol: string
  - timeframe: string
  - timestamp_utc: datetime
  - strategy_id: string
  - strategy_name: string
  - family: enum[TREND, MEAN_REVERSION, BREAKOUT, LONG_VOL, SHORT_VOL, EVENT_BLACKOUT]
  - direction: enum[LONG, SHORT, NEUTRAL]
  - is_eligible: bool
  - score: float
  - score_breakdown: StrategyScoreBreakdown
  - constraints: StrategyConstraints
  - recommended_structures: OptionStructure[]
  - urgency: enum[IMMEDIATE, STANDARD, LOW]
  - time_to_act_seconds: int | null
  - rationale: string
  - provenance: StrategySelectionProvenance

StrategyScoreBreakdown:
  - strategy_id: string
  - total_score: float
  - regime_alignment_score: float
  - setup_confidence_score: float
  - iv_alignment_score: float
  - skew_alignment_score: float
  - liquidity_score: float
  - mtf_alignment_score: float
  - freshness_score: float
  - squeeze_bonus: float
  - persistence_bonus: float
  - conflict_penalty: float
```

### 3.2) From 04b_setup_and_pattern_library

```
SetupCandidate:
  - symbol: string
  - timeframe: string
  - timestamp_utc: datetime
  - setup_type: string
  - setup_state: enum[FORMING, TRIGGERED, ACTIVE, EXPIRED, INVALIDATED]
  - direction: enum[LONG, SHORT, NEUTRAL]
  - confidence: float
  - entry_zone: PriceRange
  - stop_zone: PriceRange
  - target_zones: PriceRange[]
  - trigger_price: float | null
  - invalidation_price: float | null
  - provenance: ProvenanceMetadata

SqueezeSignal:
  - symbol: string
  - timeframe: string
  - timestamp_utc: datetime
  - release_type: enum[FAST_RELEASE, CONFIRMED_RELEASE]
  - direction: enum[UP, DOWN, UNKNOWN]
  - direction_confidence: float
  - compression_score_at_release: float
  - urgency: enum[IMMEDIATE, STANDARD]
  - momentum_magnitude: float
  - bars_since_squeeze_start: int
  - bars_since_release: int
  - provenance: ProvenanceMetadata

SqueezeState:
  - symbol: string
  - timeframe: string
  - timestamp_utc: datetime
  - is_squeezing: bool
  - squeeze_bars: int
  - compression_score: float
  - bb_inside_kc: bool
  - anticipated_release_direction: enum[UP, DOWN, UNKNOWN]
  - provenance: ProvenanceMetadata
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
  - regime_duration_bars: int
  - trend_direction: enum[UP, DOWN, NEUTRAL]
  - volatility_state: enum[LOW, NORMAL, HIGH, EXTREME]
  - mtf_alignment: dict[timeframe → regime_type]
  - provenance: ProvenanceMetadata

MultiTimeframeAlignment:
  - symbol: string
  - primary_timeframe: string
  - timestamp_utc: datetime
  - alignments: dict[timeframe → RegimeClassification]
  - alignment_score: float
  - conflicting_timeframes: string[]
  - provenance: ProvenanceMetadata
```

### 3.4) From 00_core

```
Clock:
  - now_utc(): datetime
  - elapsed_ms(start: datetime): int

Symbol:
  - symbol: string
  - asset_class: enum[EQUITY, INDEX, ETF, FUTURE]

Timeframe:
  - timeframe: string
  - seconds: int

Logger:
  - log(level, message, context)

ConfigContract:
  - get(key): any
  - get_bool(key): bool
  - get_int(key): int
  - get_float(key): float
```

---

## 4) Canonical Output Schemas

All outputs are written to 02_data_store. Each schema includes explicit field definitions.

### 4.1) SignalIntent

The primary output of this module. An immutable, time-bound trading signal.

```
SignalIntent:
  # Identity
  - signal_id: string              # REQUIRED. Unique identifier. Format: SHA256(symbol + timeframe + signal_type + timestamp_utc + strategy_id)
  - idempotency_key: string        # REQUIRED. Hash for deduplication. Format: SHA256(symbol + timeframe + direction + strategy_id + trigger_bar_index)

  # Location
  - symbol: string                 # REQUIRED. Trading symbol
  - timeframe: string              # REQUIRED. Primary timeframe
  - timestamp_utc: datetime        # REQUIRED. Signal creation time (UTC only)

  # Signal Type
  - signal_type: enum              # REQUIRED. One of:
      ENTRY_LONG                   # New long position entry
      ENTRY_SHORT                  # New short position entry
      EXIT_PARTIAL                 # Partial position exit (scale out)
      EXIT_FULL                    # Full position exit
      STAND_DOWN                   # Explicit "do not trade" signal
      SQUEEZE_FAST_RELEASE         # Squeeze fast release entry (≤ 1 bar)
      SQUEEZE_CONFIRMED_RELEASE    # Squeeze confirmed release entry (2-3 bars)

  # Direction
  - direction: enum[LONG, SHORT, NEUTRAL]  # REQUIRED. Trade direction

  # Strategy Reference
  - strategy_id: string            # REQUIRED. From StrategyCandidate
  - strategy_family: enum          # REQUIRED. TREND, MEAN_REVERSION, BREAKOUT, LONG_VOL, SHORT_VOL, EVENT_BLACKOUT
  - strategy_score: float          # REQUIRED. From StrategyCandidate.score

  # Confidence
  - confidence: float              # REQUIRED. 0.0–1.0. Aggregated confidence score
  - confidence_breakdown: SignalConfidenceBreakdown  # REQUIRED

  # Entry Parameters (from SetupCandidate)
  - entry_price_zone: PriceRange   # OPTIONAL. Suggested entry range
  - stop_loss_zone: PriceRange     # OPTIONAL. Suggested stop zone
  - target_zones: PriceRange[]     # OPTIONAL. Suggested target zones
  - invalidation_price: float | null  # OPTIONAL. Price that invalidates signal

  # Recommended Structure (from StrategyCandidate)
  - recommended_structures: OptionStructure[]  # OPTIONAL. For options strategies

  # Urgency & Timing
  - urgency: enum[IMMEDIATE, STANDARD, LOW]  # REQUIRED
  - time_to_act_seconds: int       # REQUIRED. Countdown for action
  - ttl_seconds: int               # REQUIRED. Time-to-live before expiry
  - expiry_timestamp_utc: datetime # REQUIRED. Signal expires at this time

  # Lifecycle
  - lifecycle_state: enum          # REQUIRED. One of:
      CREATED                      # Just created, awaiting processing
      ACTIVE                       # Valid and actionable
      EXPIRED                      # TTL exceeded
      INVALIDATED                  # Conditions no longer hold
      CONSUMED                     # Acted upon by downstream
      SUPERSEDED                   # Replaced by newer signal

  # Provenance
  - provenance: SignalProvenance   # REQUIRED

  # Metadata
  - rationale: string              # REQUIRED. Human-readable explanation
  - flags: string[]                # OPTIONAL. Warning flags (e.g., "low_liquidity", "stale_setup")
  - created_at_utc: datetime       # REQUIRED. Identical to timestamp_utc
  - version: string                # REQUIRED. Schema version
```

**Idempotency Rules:**
- `signal_id` is globally unique
- `idempotency_key` prevents semantic duplicates
- Same `idempotency_key` with different `signal_id` indicates re-emission (rejected)

### 4.2) SignalContextSnapshot

Captures all input state at signal creation time for reproducibility.

```
SignalContextSnapshot:
  # Identity
  - snapshot_id: string            # REQUIRED. SHA256 hash of contents
  - signal_id: string              # REQUIRED. Links to SignalIntent

  # Timestamps
  - timestamp_utc: datetime        # REQUIRED. Snapshot creation time
  - symbol: string                 # REQUIRED
  - timeframe: string              # REQUIRED

  # Strategy Context
  - strategy_selection_state: StrategySelectionState  # REQUIRED. Full snapshot
  - strategy_candidate: StrategyCandidate  # REQUIRED. The selected strategy

  # Setup Context
  - active_setups: SetupCandidate[]  # REQUIRED. All active setups
  - triggering_setup: SetupCandidate | null  # OPTIONAL. The setup that triggered signal

  # Squeeze Context (if applicable)
  - squeeze_state: SqueezeState | null  # OPTIONAL
  - squeeze_signal: SqueezeSignal | null  # OPTIONAL

  # Regime Context
  - regime_classification: RegimeClassification  # REQUIRED
  - mtf_alignment: MultiTimeframeAlignment | null  # OPTIONAL

  # Market Data Context
  - last_price: float              # REQUIRED. Most recent price
  - last_price_timestamp: datetime # REQUIRED
  - bid: float | null              # OPTIONAL
  - ask: float | null              # OPTIONAL
  - spread_pct: float | null       # OPTIONAL

  # Input Freshness
  - strategy_age_ms: int           # REQUIRED
  - setup_age_ms: int              # REQUIRED
  - regime_age_ms: int             # REQUIRED
  - quote_age_ms: int              # REQUIRED
  - any_stale: bool                # REQUIRED. True if any input exceeded max age

  # Provenance
  - provenance: SignalProvenance   # REQUIRED
```

### 4.3) SignalConfidenceBreakdown

Detailed breakdown of confidence score computation.

```
SignalConfidenceBreakdown:
  # Identity
  - signal_id: string              # REQUIRED. Links to SignalIntent
  - timestamp_utc: datetime        # REQUIRED

  # Component Scores (all 0.0–1.0)
  - strategy_score: float          # REQUIRED. From StrategyCandidate
  - strategy_weight: float         # REQUIRED. Weight applied

  - setup_confidence: float        # REQUIRED. From SetupCandidate
  - setup_weight: float            # REQUIRED

  - regime_confidence: float       # REQUIRED. From RegimeClassification
  - regime_weight: float           # REQUIRED

  - squeeze_confidence: float      # OPTIONAL. From SqueezeSignal (0.0 if N/A)
  - squeeze_weight: float          # OPTIONAL

  - mtf_alignment_score: float     # REQUIRED. Multi-timeframe alignment
  - mtf_weight: float              # REQUIRED

  - freshness_score: float         # REQUIRED. Input freshness penalty
  - freshness_weight: float        # REQUIRED

  # Aggregation
  - raw_score: float               # REQUIRED. Weighted sum before adjustments
  - adjustments: SignalAdjustment[]  # OPTIONAL. Bonuses/penalties applied
  - final_confidence: float        # REQUIRED. After all adjustments (0.0–1.0)

  # Formula
  - aggregation_formula: string    # REQUIRED. Human-readable formula used

SignalAdjustment:
  - adjustment_type: string        # e.g., "squeeze_bonus", "cooldown_penalty"
  - adjustment_value: float        # Positive = bonus, negative = penalty
  - reason: string                 # Human-readable
```

### 4.4) SignalLifecycleState

Tracks signal state transitions over time.

```
SignalLifecycleState:
  # Identity
  - signal_id: string              # REQUIRED
  - symbol: string                 # REQUIRED
  - timeframe: string              # REQUIRED

  # Current State
  - current_state: enum            # REQUIRED. CREATED, ACTIVE, EXPIRED, INVALIDATED, CONSUMED, SUPERSEDED
  - previous_state: enum | null    # OPTIONAL. Prior state
  - state_changed_at: datetime     # REQUIRED. When current state was entered

  # Lifecycle Events
  - created_at: datetime           # REQUIRED
  - activated_at: datetime | null  # OPTIONAL
  - expired_at: datetime | null    # OPTIONAL
  - invalidated_at: datetime | null  # OPTIONAL
  - invalidation_reason: string | null  # OPTIONAL
  - consumed_at: datetime | null   # OPTIONAL
  - consumed_by: string | null     # OPTIONAL. ID of consuming module/process
  - superseded_at: datetime | null # OPTIONAL
  - superseded_by: string | null   # OPTIONAL. signal_id of superseding signal

  # TTL Tracking
  - ttl_seconds: int               # REQUIRED
  - expiry_timestamp: datetime     # REQUIRED
  - time_remaining_seconds: int    # REQUIRED. Computed field

  # Validity
  - is_valid: bool                 # REQUIRED. True if ACTIVE
  - is_actionable: bool            # REQUIRED. True if ACTIVE and time_remaining > 0

  # Provenance
  - provenance: SignalProvenance   # REQUIRED
```

### 4.5) SignalInvalidationRule

Defines conditions under which a signal becomes invalid.

```
SignalInvalidationRule:
  # Identity
  - rule_id: string                # REQUIRED. Unique rule identifier
  - rule_name: string              # REQUIRED. Human-readable name

  # Applicability
  - applies_to_signal_types: enum[]  # REQUIRED. Which signal types this rule covers
  - applies_to_families: enum[]    # OPTIONAL. Strategy families (null = all)

  # Condition (one of the following)
  - condition_type: enum           # REQUIRED. One of:
      PRICE_BREACH                 # Price crosses invalidation level
      TTL_EXPIRED                  # Time-to-live exceeded
      REGIME_CHANGE                # Market regime changed
      SETUP_EXPIRED                # Triggering setup expired
      SETUP_INVALIDATED            # Triggering setup invalidated
      SQUEEZE_FAILED               # Squeeze release failed
      STRATEGY_DEMOTED             # Strategy no longer in top-N
      CONFLICTING_SIGNAL           # Conflicting signal emitted
      MANUAL_KILL                  # Manual kill-switch activated
      CIRCUIT_BREAKER              # System circuit breaker active

  # Parameters
  - parameters: dict               # OPTIONAL. Rule-specific parameters
      # For PRICE_BREACH:
      #   - breach_direction: ABOVE | BELOW
      #   - breach_price: float
      # For REGIME_CHANGE:
      #   - disallowed_regimes: enum[]
      # etc.

  # Action
  - invalidation_action: enum      # REQUIRED. INVALIDATE | WARN | SUPERSEDE
  - priority: int                  # REQUIRED. Higher = checked first

  # Metadata
  - description: string            # REQUIRED
  - version: string                # REQUIRED
```

### 4.6) SignalProvenance

Complete lineage for reproducibility and debugging.

```
SignalProvenance:
  # Identity
  - signal_id: string              # REQUIRED
  - provenance_id: string          # REQUIRED. SHA256 of contents

  # Timestamps
  - timestamp_utc: datetime        # REQUIRED
  - processing_started_utc: datetime  # REQUIRED
  - processing_ended_utc: datetime    # REQUIRED
  - processing_duration_ms: int       # REQUIRED

  # Input Hashes (for reproducibility)
  - strategy_selection_hash: string   # REQUIRED
  - strategy_selection_timestamp: datetime
  - setup_hash: string             # REQUIRED
  - setup_timestamp: datetime
  - regime_hash: string            # REQUIRED
  - regime_timestamp: datetime
  - squeeze_hash: string | null    # OPTIONAL
  - squeeze_timestamp: datetime | null
  - quote_hash: string             # REQUIRED
  - quote_timestamp: datetime

  # Versions
  - signal_generator_version: string  # REQUIRED
  - schema_version: string            # REQUIRED
  - config_version: string            # REQUIRED

  # Input Freshness
  - input_ages_ms: dict[input_type → int]  # REQUIRED
  - stale_inputs: string[]            # REQUIRED. List of stale input types
  - freshness_ok: bool                # REQUIRED

  # Deduplication
  - idempotency_key: string           # REQUIRED
  - duplicate_detected: bool          # REQUIRED
  - duplicate_of: string | null       # OPTIONAL. signal_id if duplicate

  # Cooldown
  - cooldown_active: bool             # REQUIRED
  - cooldown_remaining_ms: int        # REQUIRED. 0 if not in cooldown
  - last_signal_timestamp: datetime | null  # OPTIONAL

  # Latency
  - latency_budget_ms: int            # REQUIRED. Target latency
  - actual_latency_ms: int            # REQUIRED. Actual processing time
  - latency_ok: bool                  # REQUIRED. actual <= budget
```

### 4.7) SignalMetrics

Operational metrics for monitoring and alerting.

```
SignalMetrics:
  # Identity
  - symbol: string                 # REQUIRED
  - timeframe: string              # REQUIRED
  - timestamp_utc: datetime        # REQUIRED
  - window_start: datetime         # REQUIRED
  - window_end: datetime           # REQUIRED
  - window_duration_seconds: int   # REQUIRED

  # Signal Counts
  - signals_created: int           # REQUIRED
  - signals_by_type: dict[signal_type → int]  # REQUIRED
  - signals_by_family: dict[family → int]     # REQUIRED

  # Lifecycle Counts
  - signals_active: int            # REQUIRED
  - signals_expired: int           # REQUIRED
  - signals_invalidated: int       # REQUIRED
  - signals_consumed: int          # REQUIRED
  - signals_superseded: int        # REQUIRED

  # Deduplication
  - duplicates_detected: int       # REQUIRED
  - duplicate_rate: float          # REQUIRED. duplicates / total attempts

  # Cooldown
  - cooldown_rejections: int       # REQUIRED
  - cooldown_rejection_rate: float # REQUIRED

  # Latency
  - avg_latency_ms: float          # REQUIRED
  - p50_latency_ms: float          # REQUIRED
  - p95_latency_ms: float          # REQUIRED
  - p99_latency_ms: float          # REQUIRED
  - max_latency_ms: float          # REQUIRED
  - latency_breaches: int          # REQUIRED. Times exceeding budget
  - latency_breach_rate: float     # REQUIRED

  # Squeeze-Specific
  - squeeze_signals_created: int   # REQUIRED
  - squeeze_fast_release_count: int  # REQUIRED
  - squeeze_confirmed_release_count: int  # REQUIRED
  - squeeze_avg_latency_ms: float  # REQUIRED
  - squeeze_latency_breaches: int  # REQUIRED

  # Confidence
  - avg_confidence: float          # REQUIRED
  - min_confidence: float          # REQUIRED
  - max_confidence: float          # REQUIRED

  # Invalidation
  - invalidations_by_reason: dict[reason → int]  # REQUIRED

  # Errors
  - errors: int                    # REQUIRED
  - errors_by_type: dict[error_type → int]  # REQUIRED

  # Provenance
  - provenance: SignalProvenance   # REQUIRED
```

---

## 5) Signal Types

### 5.1) Signal Type Definitions

| Signal Type | Direction | Description | Use Case |
|-------------|-----------|-------------|----------|
| `ENTRY_LONG` | LONG | New long position entry | Trend continuation, breakout, squeeze up |
| `ENTRY_SHORT` | SHORT | New short position entry | Trend continuation down, breakdown, squeeze down |
| `EXIT_PARTIAL` | NEUTRAL | Partial position exit | Scale out at targets, reduce risk |
| `EXIT_FULL` | NEUTRAL | Full position exit | Stop loss, full target, invalidation |
| `STAND_DOWN` | NEUTRAL | Explicit "do not trade" | Event blackout, circuit breaker, uncertainty |
| `SQUEEZE_FAST_RELEASE` | LONG/SHORT | Squeeze fast release entry | ≤ 1 bar confirmation, high urgency |
| `SQUEEZE_CONFIRMED_RELEASE` | LONG/SHORT | Squeeze confirmed release entry | 2-3 bar confirmation, standard urgency |

### 5.2) Signal Type Constraints

```
SIGNAL_TYPE_CONSTRAINTS:

ENTRY_LONG:
  - direction MUST be LONG
  - strategy_family MUST be TREND, MEAN_REVERSION, BREAKOUT, or LONG_VOL
  - lifecycle_state starts as CREATED
  - entry_price_zone SHOULD be present

ENTRY_SHORT:
  - direction MUST be SHORT
  - strategy_family MUST be TREND, MEAN_REVERSION, BREAKOUT, or LONG_VOL
  - lifecycle_state starts as CREATED
  - entry_price_zone SHOULD be present

EXIT_PARTIAL:
  - direction MUST be NEUTRAL
  - Requires existing position context (from 10_risk_sizing)
  - target_zones SHOULD indicate scale-out level

EXIT_FULL:
  - direction MUST be NEUTRAL
  - Requires existing position context (from 10_risk_sizing)
  - invalidation_price MAY be present

STAND_DOWN:
  - direction MUST be NEUTRAL
  - strategy_family MUST be EVENT_BLACKOUT
  - Blocks all other signal types for duration
  - rationale MUST explain why

SQUEEZE_FAST_RELEASE:
  - direction MUST be LONG or SHORT (from SqueezeSignal.direction)
  - urgency MUST be IMMEDIATE
  - ttl_seconds MUST be ≤ 120
  - squeeze_signal MUST be present in context
  - latency budget: ≤ 100 ms

SQUEEZE_CONFIRMED_RELEASE:
  - direction MUST be LONG or SHORT
  - urgency MUST be STANDARD
  - ttl_seconds MUST be ≤ 300
  - squeeze_signal MUST be present in context
  - latency budget: ≤ 300 ms
```

---

## 6) Squeeze Handling (Low-Latency Path)

### 6.1) Squeeze Signal Flow

```
SQUEEZE SIGNAL FLOW:

04b_setup_and_pattern_library
  │
  ├── SqueezeState (continuous monitoring)
  │     └── Compression score, bb_inside_kc, anticipated direction
  │
  └── SqueezeSignal (event trigger)
        └── release_type, direction, direction_confidence, urgency
              │
              ▼
07_strategy_selection_engine
  │
  ├── Promotes LONG_VOL strategies
  ├── Applies squeeze_bonus
  └── Sets urgency (IMMEDIATE or STANDARD)
        │
        ▼
08_signal_generation (THIS MODULE)
  │
  ├── FAST_RELEASE PATH (≤ 100 ms)
  │     ├── Bypass non-critical gates
  │     ├── Minimal validation
  │     ├── TTL = 120 seconds
  │     └── Emit SQUEEZE_FAST_RELEASE
  │
  └── CONFIRMED_RELEASE PATH (≤ 300 ms)
        ├── Full validation
        ├── Higher confidence threshold
        ├── TTL = 300 seconds
        └── Emit SQUEEZE_CONFIRMED_RELEASE
```

### 6.2) FAST_RELEASE Processing

```
FAST_RELEASE ALGORITHM:

PRECONDITIONS:
  - SqueezeSignal.release_type == FAST_RELEASE
  - StrategyCandidate.urgency == IMMEDIATE
  - bars_since_release <= 1

LATENCY BUDGET: ≤ 100 ms

PROCESS:
  1. START timer

  2. VALIDATE minimum requirements only:
     - strategy_id is present
     - direction is LONG or SHORT (not UNKNOWN)
     - liquidity_grade >= FAIR
     - spread_pct <= 0.08
     - No active STAND_DOWN signal
     - Kill-switch is OFF

     IF any fail: REJECT with reason, STOP

  3. CHECK cooldown (symbol + strategy):
     - IF in cooldown: REJECT, STOP
     - Cooldown for FAST_RELEASE: 30 seconds minimum

  4. CHECK deduplication:
     - Compute idempotency_key
     - IF duplicate exists with TTL remaining: REJECT, STOP

  5. COMPUTE confidence (simplified):
     - confidence = (squeeze_confidence * 0.5) + (direction_confidence * 0.3) + (momentum_magnitude * 0.2)
     - Apply freshness penalty if inputs stale
     - MINIMUM confidence for FAST_RELEASE: 0.50

     IF confidence < 0.50: REJECT, STOP

  6. CONSTRUCT SignalIntent:
     - signal_type = SQUEEZE_FAST_RELEASE
     - direction = SqueezeSignal.direction
     - urgency = IMMEDIATE
     - time_to_act_seconds = 60
     - ttl_seconds = 120
     - expiry_timestamp = now + 120 seconds
     - flags = ["fast_release", "low_confirmation"]

  7. EMIT signal

  8. STOP timer
     - IF elapsed > 100 ms: LOG latency breach, FLAG in metrics
     - Continue anyway (signal already emitted)

FAILURE BEHAVIOR:
  - If latency > 100 ms: Log warning, emit signal anyway
  - If latency > 500 ms: Log error, consider signal "degraded"
```

### 6.3) CONFIRMED_RELEASE Processing

```
CONFIRMED_RELEASE ALGORITHM:

PRECONDITIONS:
  - SqueezeSignal.release_type == CONFIRMED_RELEASE
  - StrategyCandidate.urgency == STANDARD
  - bars_since_release in [2, 3]

LATENCY BUDGET: ≤ 300 ms

PROCESS:
  1. START timer

  2. RUN full eligibility gates (see Section 7)

  3. VALIDATE squeeze confirmation:
     - bars_since_release >= 2
     - momentum_magnitude >= 0.4
     - direction_confidence >= 0.60
     - compression_score_at_release >= 0.65

     IF any fail: REJECT with reason, STOP

  4. CHECK regime alignment:
     - regime_type should be VOLATILE_EXPANSION, BREAKOUT, or BREAKDOWN
     - IF regime is RANGING or CHOPPY: Apply penalty, continue with warning

  5. CHECK cooldown (symbol + strategy):
     - IF in cooldown: REJECT, STOP
     - Cooldown for CONFIRMED_RELEASE: 60 seconds minimum

  6. CHECK deduplication

  7. COMPUTE confidence (full aggregation):
     - Use standard confidence aggregation (Section 8)
     - Apply squeeze_bonus = 0.15
     - MINIMUM confidence for CONFIRMED_RELEASE: 0.55

  8. CONSTRUCT SignalIntent:
     - signal_type = SQUEEZE_CONFIRMED_RELEASE
     - direction = SqueezeSignal.direction
     - urgency = STANDARD
     - time_to_act_seconds = 180
     - ttl_seconds = 300
     - expiry_timestamp = now + 300 seconds
     - flags = ["confirmed_release"]

  9. EMIT signal

  10. STOP timer
      - IF elapsed > 300 ms: LOG latency breach

DIRECTION RULES:
  - IF direction_confidence >= 0.65:
    - Use directional signal (LONG or SHORT based on SqueezeSignal.direction)
  - ELSE:
    - Use neutral straddle/strangle approach
    - Flag as "direction_uncertain"
```

### 6.4) Direction Confirmation Rules

```
DIRECTION CONFIRMATION:

Sources (priority order):
1. SqueezeSignal.direction + direction_confidence
2. Price expansion direction (close vs previous close)
3. Momentum indicator direction
4. Volume confirmation

RULES:
  IF SqueezeSignal.direction == UP AND direction_confidence >= 0.65:
    - SignalIntent.direction = LONG
    - Recommended structures: LONG_CALL, CALL_DEBIT_SPREAD

  IF SqueezeSignal.direction == DOWN AND direction_confidence >= 0.65:
    - SignalIntent.direction = SHORT
    - Recommended structures: LONG_PUT, PUT_DEBIT_SPREAD

  IF direction_confidence < 0.65 OR direction == UNKNOWN:
    - SignalIntent.direction = NEUTRAL (for structure selection)
    - Recommended structures: LONG_STRADDLE, LONG_STRANGLE
    - Flag: "direction_uncertain"

MOMENTUM CONFIRMATION:
  - Momentum magnitude must be >= 0.30 for FAST_RELEASE
  - Momentum magnitude must be >= 0.40 for CONFIRMED_RELEASE
  - Momentum direction must align with price direction

VOLUME CONFIRMATION (optional enhancement):
  - Volume should be >= 1.5x average on release bar
  - If volume low: Flag "low_volume_release"

MTF SANITY CHECK:
  - Higher timeframe should not be in opposing trend
  - IF 5m squeeze UP but 1h regime is TRENDING_DOWN:
    - Reduce confidence by 0.15
    - Flag "mtf_conflict"
```

---

## 7) Signal Eligibility Gates

### 7.1) Gate Overview

All signals pass through eligibility gates. Gates are evaluated in order; first failure stops processing.

```
GATE CATEGORIES:

HARD GATES (any failure = reject):
1. Kill-Switch Gate
2. Stand-Down Gate
3. Strategy Validity Gate
4. Input Freshness Gate
5. Cooldown Gate
6. Deduplication Gate
7. Minimum Confidence Gate

SOFT GATES (failure = penalty, may continue):
8. Regime Alignment Gate
9. MTF Alignment Gate
10. Liquidity Gate
11. Setup State Gate
```

### 7.2) Gate Definitions

```
GATE DEFINITIONS:

1. KILL-SWITCH GATE (HARD)
   Check: ConfigContract.get_bool("signal_generation.kill_switch")
   IF true:
     - REJECT all signals
     - Emit STAND_DOWN signal
     - Reason: "kill_switch_active"

2. STAND-DOWN GATE (HARD)
   Check: StrategySelectionState.blackout_active
   IF true:
     - REJECT all non-STAND_DOWN signals
     - Reason: blackout_reason

3. STRATEGY VALIDITY GATE (HARD)
   Check: StrategyCandidate.is_eligible == true
   Check: StrategyCandidate.strategy_id in active_strategy_ids
   IF either fails:
     - REJECT
     - Reason: "strategy_not_eligible" or "strategy_demoted"

4. INPUT FRESHNESS GATE (HARD)
   Check: All required inputs within max age
   Max ages:
     - strategy_selection: 60,000 ms
     - setup: 60,000 ms
     - regime: 60,000 ms
     - quote: 10,000 ms
     - squeeze (if applicable): 30,000 ms
   IF any hard-reject input is stale:
     - REJECT
     - Reason: "stale_input: {input_type}"

5. COOLDOWN GATE (HARD)
   Key: (symbol, timeframe, strategy_id)
   Check: Time since last signal > cooldown_period
   Cooldown periods:
     - SQUEEZE_FAST_RELEASE: 30 seconds
     - SQUEEZE_CONFIRMED_RELEASE: 60 seconds
     - ENTRY_LONG/SHORT: 120 seconds
     - EXIT_*: 30 seconds
     - STAND_DOWN: 300 seconds
   IF in cooldown:
     - REJECT
     - Reason: "cooldown_active", remaining: X seconds

6. DEDUPLICATION GATE (HARD)
   Compute: idempotency_key = SHA256(symbol + timeframe + direction + strategy_id + trigger_bar_index)
   Check: No existing signal with same idempotency_key and lifecycle_state in [CREATED, ACTIVE]
   IF duplicate found:
     - REJECT
     - Reason: "duplicate_signal", duplicate_of: existing_signal_id

7. MINIMUM CONFIDENCE GATE (HARD)
   Thresholds:
     - SQUEEZE_FAST_RELEASE: 0.50
     - SQUEEZE_CONFIRMED_RELEASE: 0.55
     - ENTRY_LONG/SHORT: 0.60
     - EXIT_*: 0.40
     - STAND_DOWN: 0.0 (always allowed)
   IF confidence < threshold:
     - REJECT
     - Reason: "confidence_below_threshold", required: X, actual: Y

8. REGIME ALIGNMENT GATE (SOFT)
   Check: RegimeClassification.regime_type aligns with strategy
   IF misaligned:
     - Apply confidence penalty: -0.10
     - Flag: "regime_misaligned"
     - Continue

9. MTF ALIGNMENT GATE (SOFT)
   Check: MultiTimeframeAlignment.conflicting_timeframes is empty
   IF conflicts:
     - Apply confidence penalty: -0.05 per conflict
     - Flag: "mtf_conflict"
     - Continue

10. LIQUIDITY GATE (SOFT)
    Check: liquidity_grade and spread from StrategyConstraints
    IF liquidity_grade < FAIR:
      - Apply confidence penalty: -0.15
      - Flag: "low_liquidity"
    IF spread_pct > max_spread:
      - Apply confidence penalty: -0.10
      - Flag: "wide_spread"
    Continue

11. SETUP STATE GATE (SOFT)
    Check: SetupCandidate.setup_state in [TRIGGERED, ACTIVE]
    IF setup_state == EXPIRED or INVALIDATED:
      - Apply confidence penalty: -0.20
      - Flag: "setup_not_active"
    Continue
```

---

## 8) Confidence Aggregation Function

### 8.1) Standard Aggregation

```
CONFIDENCE AGGREGATION:

INPUT COMPONENTS:
  - strategy_score: from StrategyCandidate.score (0.0–1.0)
  - setup_confidence: from SetupCandidate.confidence (0.0–1.0)
  - regime_confidence: from RegimeClassification.regime_confidence (0.0–1.0)
  - squeeze_confidence: from SqueezeSignal.direction_confidence (0.0–1.0, or 0 if N/A)
  - mtf_alignment_score: from MultiTimeframeAlignment.alignment_score (0.0–1.0)
  - freshness_score: computed from input ages (0.0–1.0)

WEIGHTS (default, configurable):
  w_strategy = 0.25
  w_setup = 0.25
  w_regime = 0.15
  w_squeeze = 0.15  # Only if squeeze signal present, else redistributed
  w_mtf = 0.10
  w_freshness = 0.10

FORMULA:
  IF squeeze_signal present:
    raw_score = (
      strategy_score * w_strategy +
      setup_confidence * w_setup +
      regime_confidence * w_regime +
      squeeze_confidence * w_squeeze +
      mtf_alignment_score * w_mtf +
      freshness_score * w_freshness
    )
  ELSE:
    # Redistribute squeeze weight
    raw_score = (
      strategy_score * (w_strategy + w_squeeze * 0.5) +
      setup_confidence * (w_setup + w_squeeze * 0.5) +
      regime_confidence * w_regime +
      mtf_alignment_score * w_mtf +
      freshness_score * w_freshness
    )

ADJUSTMENTS:
  adjustments = []

  # Squeeze bonus
  IF signal_type in [SQUEEZE_FAST_RELEASE, SQUEEZE_CONFIRMED_RELEASE]:
    IF release_type == FAST_RELEASE:
      adjustments.append(("squeeze_fast_bonus", +0.10))
    ELSE:
      adjustments.append(("squeeze_confirmed_bonus", +0.15))

  # Soft gate penalties (from Section 7)
  FOR each soft_gate_failure:
    adjustments.append((gate_name + "_penalty", penalty_value))

  # Freshness penalty (additional)
  IF any_input_stale:
    stale_count = len(stale_inputs)
    adjustments.append(("staleness_penalty", -0.05 * stale_count))

  # MTF conflict penalty
  IF mtf_conflicts > 0:
    adjustments.append(("mtf_conflict_penalty", -0.05 * mtf_conflicts))

FINAL SCORE:
  final_confidence = raw_score + sum(adjustment_values)
  final_confidence = clamp(final_confidence, 0.0, 1.0)

OUTPUT:
  SignalConfidenceBreakdown with all components
```

### 8.2) Freshness Score Calculation

```
FRESHNESS SCORE:

For each input type:
  age_ms = now() - input.timestamp_utc
  max_age_ms = max_allowable_age[input_type]

  IF age_ms <= max_age_ms:
    input_freshness = 1.0
  ELSE:
    overage_ms = age_ms - max_age_ms
    decay_rate = 0.1 per second overage
    input_freshness = max(0.0, 1.0 - (overage_ms / 1000) * decay_rate)

freshness_score = average(all input_freshness values)
```

---

## 9) Deduplication Algorithm

### 9.1) Hash-Based Deduplication

```
DEDUPLICATION ALGORITHM:

IDEMPOTENCY KEY COMPUTATION:
  Components:
    - symbol
    - timeframe
    - direction (LONG, SHORT, NEUTRAL)
    - strategy_id
    - trigger_bar_index (bar that triggered the signal)

  idempotency_key = SHA256(
    symbol + "|" +
    timeframe + "|" +
    direction + "|" +
    strategy_id + "|" +
    str(trigger_bar_index)
  )

DEDUPLICATION CHECK:
  1. Query recent signals (within dedup_window):
     - dedup_window = 600 seconds (10 minutes)
     - Query: SELECT * FROM signals
              WHERE symbol = ?
              AND timeframe = ?
              AND created_at > now() - dedup_window
              AND lifecycle_state IN (CREATED, ACTIVE)

  2. For each existing signal:
     IF existing.idempotency_key == new.idempotency_key:
       - DUPLICATE DETECTED
       - IF existing.lifecycle_state == ACTIVE:
         - REJECT new signal
         - Reason: "duplicate_active"
       - ELIF existing.lifecycle_state == CREATED:
         - REJECT new signal
         - Reason: "duplicate_pending"

  3. If no duplicate found:
     - PROCEED with signal creation
```

### 9.2) Semantic Deduplication

```
SEMANTIC DEDUPLICATION:

Beyond hash matching, check semantic equivalence:

  1. SAME DIRECTION CHECK:
     IF existing signal with same (symbol, timeframe, direction) exists:
       IF existing.lifecycle_state == ACTIVE:
         IF existing.strategy_id == new.strategy_id:
           - DUPLICATE (same strategy, same direction)
         ELSE:
           - CONFLICTING (different strategy, same direction)
           - Allow if new.confidence > existing.confidence + 0.10
           - Else REJECT

  2. OPPOSING DIRECTION CHECK:
     IF existing LONG signal and new SHORT signal (or vice versa):
       - This is allowed (reversing position)
       - Mark existing as SUPERSEDED
       - Emit new signal

  3. SUPERSESSION RULES:
     A new signal supersedes an existing signal IF:
       - Same (symbol, timeframe, strategy_id)
       - New signal has higher confidence by >= 0.10
       - Existing signal is ACTIVE
     Action:
       - Mark existing as SUPERSEDED
       - Set existing.superseded_by = new.signal_id
       - Emit new signal
```

---

## 10) Cooldown & Churn Prevention

### 10.1) Cooldown Rules

```
COOLDOWN RULES:

COOLDOWN KEY: (symbol, timeframe, strategy_family)

BASE COOLDOWNS:
  - SQUEEZE_FAST_RELEASE: 30 seconds
  - SQUEEZE_CONFIRMED_RELEASE: 60 seconds
  - ENTRY_LONG: 120 seconds
  - ENTRY_SHORT: 120 seconds
  - EXIT_PARTIAL: 30 seconds
  - EXIT_FULL: 60 seconds
  - STAND_DOWN: 300 seconds

COOLDOWN ESCALATION:
  Track: false_positive_count per (symbol, strategy_family)

  IF signal was invalidated or expired without consumption:
    false_positive_count += 1

  Escalation formula:
    effective_cooldown = base_cooldown * (1 + 0.5 * false_positive_count)
    effective_cooldown = min(effective_cooldown, max_cooldown)

  Max cooldowns:
    - Entry signals: 600 seconds (10 minutes)
    - Exit signals: 120 seconds
    - Squeeze signals: 300 seconds

  Cooldown decay:
    - false_positive_count decreases by 1 every 30 minutes of no signals
    - Minimum: 0

COOLDOWN CHECK:
  last_signal_time = get_last_signal_time(symbol, timeframe, strategy_family)
  cooldown_remaining = effective_cooldown - (now() - last_signal_time)

  IF cooldown_remaining > 0:
    REJECT signal
    Reason: "cooldown_active"
    Metadata: cooldown_remaining_ms
```

### 10.2) Churn Prevention

```
CHURN PREVENTION:

Definition: Excessive signal creation/invalidation in short period

CHURN DETECTION:
  Track: signal_events per (symbol, timeframe) in rolling 60-second window
  signal_event = creation OR invalidation OR supersession

  churn_rate = signal_events / 60  # signals per second

  IF churn_rate > 0.5:  # More than 1 signal per 2 seconds
    - FLAG "high_churn"
    - Apply confidence penalty: -0.10
    - Double all cooldowns temporarily

  IF churn_rate > 1.0:  # More than 1 signal per second
    - ACTIVATE circuit breaker for symbol
    - Emit STAND_DOWN signal
    - Block all signals for 60 seconds

CHURN RECOVERY:
  - After circuit breaker period, reset to normal cooldowns
  - First signal after recovery gets extra scrutiny (confidence >= 0.70)
```

---

## 11) TTL Assignment Logic

### 11.1) TTL Rules

```
TTL ASSIGNMENT:

BASE TTL BY SIGNAL TYPE:
  - SQUEEZE_FAST_RELEASE: 120 seconds
  - SQUEEZE_CONFIRMED_RELEASE: 300 seconds
  - ENTRY_LONG: 600 seconds (10 minutes)
  - ENTRY_SHORT: 600 seconds
  - EXIT_PARTIAL: 300 seconds
  - EXIT_FULL: 300 seconds
  - STAND_DOWN: 1800 seconds (30 minutes) or until blackout ends

TTL ADJUSTMENTS:
  # Urgency-based
  IF urgency == IMMEDIATE:
    ttl = base_ttl * 0.5

  IF urgency == LOW:
    ttl = base_ttl * 1.5

  # Confidence-based
  IF confidence < 0.60:
    ttl = ttl * 0.75  # Lower confidence = shorter TTL

  IF confidence > 0.80:
    ttl = ttl * 1.25  # Higher confidence = longer TTL

  # Regime-based
  IF regime_type in [VOLATILE_EXPANSION, BREAKOUT, BREAKDOWN]:
    ttl = ttl * 0.75  # Fast-moving markets = shorter TTL

  IF regime_type == RANGING:
    ttl = ttl * 1.25  # Stable markets = longer TTL

FINAL TTL:
  ttl = clamp(ttl, min_ttl, max_ttl)

  min_ttl = 30 seconds
  max_ttl = 3600 seconds (1 hour)

EXPIRY TIMESTAMP:
  expiry_timestamp_utc = timestamp_utc + ttl_seconds
```

### 11.2) Time-to-Act Calculation

```
TIME_TO_ACT CALCULATION:

time_to_act represents urgency for downstream processing.

RULES:
  IF signal_type == SQUEEZE_FAST_RELEASE:
    time_to_act_seconds = 60

  ELIF signal_type == SQUEEZE_CONFIRMED_RELEASE:
    time_to_act_seconds = 180

  ELIF urgency == IMMEDIATE:
    time_to_act_seconds = 120

  ELIF urgency == STANDARD:
    time_to_act_seconds = 300

  ELSE:  # LOW urgency
    time_to_act_seconds = 600

RELATIONSHIP TO TTL:
  time_to_act_seconds <= ttl_seconds always
  time_to_act is "soft" deadline; ttl is "hard" expiry
```

---

## 12) Invalidation Rules

### 12.1) Automatic Invalidation

```
AUTOMATIC INVALIDATION RULES:

1. TTL_EXPIRED
   Trigger: now() > expiry_timestamp_utc
   Action: Set lifecycle_state = EXPIRED
   Log: "signal_expired", signal_id, ttl_seconds

2. PRICE_BREACH
   Trigger: current_price crosses invalidation_price
   Direction:
     - For LONG signals: price < invalidation_price
     - For SHORT signals: price > invalidation_price
   Action: Set lifecycle_state = INVALIDATED
   Log: "price_invalidation", signal_id, breach_price

3. SETUP_INVALIDATED
   Trigger: SetupCandidate.setup_state changes to INVALIDATED
   Action: Set lifecycle_state = INVALIDATED
   Log: "setup_invalidated", signal_id, setup_id

4. SETUP_EXPIRED
   Trigger: SetupCandidate.setup_state changes to EXPIRED
   Action: Set lifecycle_state = INVALIDATED
   Log: "setup_expired", signal_id, setup_id

5. REGIME_CHANGE
   Trigger: RegimeClassification.regime_type changes to blocked regime
   Blocked regimes per signal type defined in strategy
   Action: Set lifecycle_state = INVALIDATED
   Log: "regime_change_invalidation", signal_id, old_regime, new_regime

6. STRATEGY_DEMOTED
   Trigger: strategy_id no longer in StrategySelectionState.active_strategy_ids
   Action: Set lifecycle_state = INVALIDATED
   Log: "strategy_demoted", signal_id, strategy_id

7. CONFLICTING_SIGNAL
   Trigger: Opposing direction signal emitted for same (symbol, timeframe)
   Action: Set lifecycle_state = SUPERSEDED
   Log: "signal_superseded", signal_id, superseding_signal_id

8. SQUEEZE_FAILED
   Trigger: For squeeze signals, price reverses within confirmation window
   Detection:
     - For SQUEEZE_FAST_RELEASE: price moves opposite to direction within 2 bars
     - For SQUEEZE_CONFIRMED_RELEASE: price moves opposite within 5 bars
   Action: Set lifecycle_state = INVALIDATED
   Log: "squeeze_failure", signal_id, reversal_bar

9. MANUAL_KILL
   Trigger: Kill-switch activated via config
   Action: Set lifecycle_state = INVALIDATED for ALL active signals
   Log: "manual_kill", affected_signal_count

10. CIRCUIT_BREAKER
    Trigger: Circuit breaker activated for symbol
    Action: Set lifecycle_state = INVALIDATED for symbol's signals
    Log: "circuit_breaker_invalidation", symbol, affected_count
```

### 12.2) Invalidation Processing

```
INVALIDATION PROCESSOR:

Runs: Every 1 second (or on-demand after significant events)

PROCESS:
  1. Query all signals with lifecycle_state in [CREATED, ACTIVE]

  2. For each signal:
     - Check each invalidation rule in priority order
     - First matching rule triggers invalidation
     - Update lifecycle_state
     - Set invalidated_at, invalidation_reason

  3. Log invalidation events

  4. Update SignalMetrics.invalidations_by_reason
```

---

## 13) Stand-Down Signal Logic

### 13.1) Stand-Down Triggers

```
STAND_DOWN SIGNAL TRIGGERS:

1. EVENT BLACKOUT
   Source: StrategySelectionState.blackout_active == true
   Duration: Until blackout ends
   Reason: blackout_reason

2. KILL-SWITCH
   Source: ConfigContract.get_bool("signal_generation.kill_switch") == true
   Duration: Until manually disabled
   Reason: "manual_kill_switch"

3. CIRCUIT BREAKER
   Source: Churn rate exceeds threshold
   Duration: 60 seconds
   Reason: "circuit_breaker_churn"

4. NO ELIGIBLE STRATEGIES
   Source: StrategySelectionState.n_candidates_selected == 0
   Duration: Until strategies become eligible
   Reason: "no_eligible_strategies"

5. INPUT FAILURE
   Source: Critical inputs missing or severely stale
   Duration: Until inputs recover
   Reason: "input_failure"

6. REGIME UNKNOWN
   Source: RegimeClassification.regime_type == UNKNOWN
   Duration: Until regime is classified
   Reason: "regime_unknown"
```

### 13.2) Stand-Down Signal Construction

```
STAND_DOWN SIGNAL:

signal_type: STAND_DOWN
direction: NEUTRAL
strategy_id: "system_standdown"
strategy_family: EVENT_BLACKOUT
confidence: 1.0  # Always high confidence for stand-down
urgency: IMMEDIATE
time_to_act_seconds: 0  # Immediate effect
ttl_seconds: Depends on trigger (see above)
rationale: Reason from trigger

FLAGS:
  - "blocks_entries": Blocks all ENTRY_* signals
  - "allows_exits": EXIT_* signals may still be processed
  - "system_generated": Not from strategy selection

BEHAVIOR:
  - While STAND_DOWN is ACTIVE:
    - ENTRY_* signals are rejected at gate
    - EXIT_* signals are allowed (protect existing positions)
    - New STAND_DOWN signals supersede previous
```

---

## 14) Emergency Kill-Switch

### 14.1) Kill-Switch Configuration

```
KILL-SWITCH CONFIG:

Config keys:
  signal_generation.kill_switch: bool (default: false)
  signal_generation.kill_switch_reason: string
  signal_generation.kill_switch_timestamp: datetime

Activation:
  - Set via config update
  - Takes effect immediately (next cycle)

Behavior when active:
  1. Reject all new signals at first gate
  2. Emit STAND_DOWN signal with reason
  3. Invalidate all ACTIVE signals
  4. Log "kill_switch_activated"

Deactivation:
  - Set kill_switch = false
  - STAND_DOWN signal expires
  - Normal processing resumes
  - Log "kill_switch_deactivated"
```

### 14.2) Kill-Switch Safety

```
KILL-SWITCH SAFETY:

CANNOT be disabled if:
  - Any critical input is in failure state
  - Circuit breaker is active
  - Manual override lock is set

Audit requirements:
  - All kill-switch state changes logged
  - Reason must be non-empty
  - Timestamp recorded

Recovery:
  - After kill-switch deactivation, 30-second grace period
  - First signals require confidence >= 0.70
  - Normal thresholds resume after grace period
```

---

## 15) Latency Budgets

### 15.1) Budget Definitions

| Signal Type | Latency Budget | Failure Action |
|-------------|----------------|----------------|
| SQUEEZE_FAST_RELEASE | ≤ 100 ms | Log warning, emit anyway |
| SQUEEZE_CONFIRMED_RELEASE | ≤ 300 ms | Log warning, emit anyway |
| ENTRY_LONG | ≤ 500 ms | Log info, emit |
| ENTRY_SHORT | ≤ 500 ms | Log info, emit |
| EXIT_PARTIAL | ≤ 300 ms | Log warning, emit anyway |
| EXIT_FULL | ≤ 300 ms | Log warning, emit anyway |
| STAND_DOWN | ≤ 100 ms | Log warning, emit anyway |

### 15.2) Latency Measurement

```
LATENCY MEASUREMENT:

Start point: First instruction of signal processing
End point: Signal written to store

Measurement:
  processing_started_utc = Clock.now_utc()
  # ... processing ...
  processing_ended_utc = Clock.now_utc()
  actual_latency_ms = Clock.elapsed_ms(processing_started_utc)

Recording:
  - Store in SignalProvenance.actual_latency_ms
  - Compare to SignalProvenance.latency_budget_ms
  - Set SignalProvenance.latency_ok = (actual <= budget)

Aggregation:
  - Track in SignalMetrics.avg_latency_ms, p50, p95, p99, max
  - Track SignalMetrics.latency_breaches count
```

### 15.3) Latency Optimization

```
LATENCY OPTIMIZATION STRATEGIES:

For SQUEEZE_FAST_RELEASE (≤ 100 ms target):
  1. Skip non-essential gates (soft gates)
  2. Use pre-computed cooldown state (cached)
  3. Minimal confidence calculation
  4. Direct write (no batching)
  5. Async logging (don't block on log writes)

For other signals:
  1. Full gate evaluation
  2. Standard confidence aggregation
  3. Batched writes allowed
  4. Synchronous logging

If latency budget exceeded:
  - SQUEEZE signals: Emit anyway, flag as "latency_degraded"
  - Non-squeeze signals: Emit, log warning
  - Repeated breaches: Investigate, possibly simplify processing
```

---

## 16) Failure Modes

| Failure Mode | Detection | Response | Logging |
|--------------|-----------|----------|---------|
| **Missing strategy selection** | StrategySelectionState is null or not found | Emit STAND_DOWN, wait for recovery | ERROR: "missing_strategy_selection" |
| **Missing setup data** | SetupCandidate not found for strategy | Reject signal, reason: "missing_setup" | WARN: "setup_not_found" |
| **Missing regime data** | RegimeClassification is null | Emit STAND_DOWN, reason: "missing_regime" | ERROR: "missing_regime" |
| **Stale strategy selection** | Age > 60,000 ms | Apply freshness penalty, continue if > 30,000 ms; reject if > 120,000 ms | WARN: "stale_strategy_selection" |
| **Stale quote data** | Age > 10,000 ms | Apply penalty; reject if > 30,000 ms | WARN: "stale_quote" |
| **Stale squeeze signal** | Age > 30,000 ms | Reject squeeze signals | WARN: "stale_squeeze" |
| **Conflicting strategy signals** | Two strategies suggest opposite directions | Higher confidence wins; lower is rejected | INFO: "conflict_resolved" |
| **Duplicate signal** | Same idempotency_key exists | Reject duplicate | DEBUG: "duplicate_rejected" |
| **Regime mismatch** | Regime changed since strategy selection | Apply penalty; if severe mismatch, invalidate | WARN: "regime_mismatch" |
| **Setup expired** | SetupCandidate.setup_state == EXPIRED | Reject signal; invalidate if active | INFO: "setup_expired" |
| **Setup invalidated** | SetupCandidate.setup_state == INVALIDATED | Reject signal; invalidate if active | INFO: "setup_invalidated" |
| **Squeeze false break** | Price reverses after release | Invalidate squeeze signal | WARN: "squeeze_false_break" |
| **Latency breach (squeeze)** | Processing > 100 ms for FAST_RELEASE | Log warning, emit anyway, flag | WARN: "latency_breach_squeeze" |
| **Latency breach (standard)** | Processing > 500 ms | Log info, emit | INFO: "latency_breach" |
| **Circuit breaker active** | Churn rate > threshold | Block all signals, emit STAND_DOWN | ERROR: "circuit_breaker_active" |
| **Kill-switch active** | Config flag set | Block all signals, emit STAND_DOWN | CRITICAL: "kill_switch_active" |
| **Write failure** | 02_data_store write fails | Retry 3x with backoff; if still fails, log and continue | ERROR: "write_failure" |
| **Cooldown violation** | Attempted signal during cooldown | Reject | DEBUG: "cooldown_rejection" |
| **Confidence below threshold** | Computed confidence < minimum | Reject | INFO: "confidence_insufficient" |

---

## 17) Write Contract

### 17.1) Output Store Path

```
Store Path: processed/signal_store/

Directory Structure:
  processed/
    signal_store/
      signals/
        {symbol}/
          {date}/
            signal_{signal_id}.parquet
      context/
        {symbol}/
          {date}/
            context_{signal_id}.parquet
      lifecycle/
        {symbol}/
          {date}/
            lifecycle_{signal_id}.parquet
      metrics/
        {symbol}/
          {date}/
            metrics_{timestamp}.parquet
```

### 17.2) Write Contract

```
WRITE CONTRACT (08_signal_generation → 02_data_store):

1. IDEMPOTENT WRITES
   - Each write uses signal_id as unique key
   - Duplicate signal_id writes are rejected
   - idempotency_key prevents semantic duplicates

2. SCHEMA VALIDATION
   - All outputs validated against canonical schemas
   - Schema version in SignalProvenance
   - Validation failures reject write + log error

3. TRANSACTION SEMANTICS
   - SignalIntent + SignalContextSnapshot + SignalConfidenceBreakdown
     written atomically
   - Partial writes not allowed

4. LIFECYCLE UPDATES
   - SignalLifecycleState updates are append-only
   - Each state change creates new record with previous_state reference

5. PROVENANCE
   - Every write includes full SignalProvenance
   - Input hashes for reproducibility
   - Processing timestamps

6. RETENTION
   - Hot tier: 24 hours (for real-time processing)
   - Warm tier: 30 days (for analysis)
   - Cold tier: Archive (for compliance)

7. WRITE RESULT
   02_data_store returns:
   - success: bool
   - signal_id: string
   - storage_path: string
   - error_message: string | null
```

---

## 18) Submodule Structure

```
08_signal_generation/
├── SPEC.md                          # This document
├── README.md                        # Philosophy and usage guide
├── signal_types/
│   ├── __init__.py
│   ├── entry_signals.py             # ENTRY_LONG, ENTRY_SHORT
│   ├── exit_signals.py              # EXIT_PARTIAL, EXIT_FULL
│   ├── squeeze_signals.py           # SQUEEZE_FAST_RELEASE, SQUEEZE_CONFIRMED_RELEASE
│   └── standdown_signals.py         # STAND_DOWN
├── gates/
│   ├── __init__.py
│   ├── hard_gates.py                # Kill-switch, stand-down, validity, freshness, cooldown, dedup, confidence
│   ├── soft_gates.py                # Regime, MTF, liquidity, setup state
│   └── gate_runner.py               # Orchestrates gate evaluation
├── confidence/
│   ├── __init__.py
│   ├── aggregator.py                # Main confidence aggregation
│   ├── freshness_scorer.py          # Input freshness scoring
│   └── adjustments.py               # Bonuses and penalties
├── deduplication/
│   ├── __init__.py
│   ├── hash_dedup.py                # Hash-based deduplication
│   ├── semantic_dedup.py            # Semantic deduplication
│   └── supersession.py              # Signal supersession logic
├── cooldown/
│   ├── __init__.py
│   ├── cooldown_manager.py          # Cooldown tracking
│   ├── escalation.py                # Cooldown escalation logic
│   └── churn_detector.py            # Churn detection and circuit breaker
├── squeeze_path/
│   ├── __init__.py
│   ├── fast_release.py              # FAST_RELEASE processing
│   ├── confirmed_release.py         # CONFIRMED_RELEASE processing
│   └── direction_resolver.py        # Direction confirmation
├── lifecycle/
│   ├── __init__.py
│   ├── state_machine.py             # Lifecycle state transitions
│   ├── invalidation_processor.py    # Automatic invalidation
│   └── ttl_manager.py               # TTL assignment and expiry
├── standdown/
│   ├── __init__.py
│   ├── triggers.py                  # Stand-down trigger detection
│   └── kill_switch.py               # Kill-switch handling
├── writers/
│   ├── __init__.py
│   ├── signal_writer.py             # Write SignalIntent
│   ├── context_writer.py            # Write SignalContextSnapshot
│   ├── lifecycle_writer.py          # Write SignalLifecycleState
│   └── metrics_writer.py            # Write SignalMetrics
├── readers/
│   ├── __init__.py
│   ├── strategy_reader.py           # Read from 07
│   ├── setup_reader.py              # Read from 04b
│   ├── regime_reader.py             # Read from 04
│   └── quote_reader.py              # Read quotes
├── tests/
│   ├── __init__.py
│   ├── test_fast_release_timing.py  # FAST squeeze latency tests
│   ├── test_confirmed_release.py    # CONFIRMED squeeze tests
│   ├── test_duplicate_suppression.py
│   ├── test_cooldown_enforcement.py
│   ├── test_ttl_expiry.py
│   ├── test_conflict_resolution.py
│   ├── test_kill_switch.py
│   ├── test_invalidation.py
│   ├── test_confidence_aggregation.py
│   ├── test_replay_determinism.py   # Same inputs = same outputs
│   └── test_end_to_end.py
└── config/
    ├── signal_config.yaml           # Tunable parameters
    ├── latency_budgets.yaml         # Latency targets
    ├── cooldown_config.yaml         # Cooldown settings
    └── ttl_config.yaml              # TTL settings
```

---

## 19) Test Plan

### 19.1) Test Categories

| Category | Test Cases | Priority |
|----------|------------|----------|
| **FAST Squeeze Timing** | Process FAST_RELEASE within 100 ms; handle latency breach gracefully | P0 |
| **CONFIRMED Squeeze** | Process CONFIRMED_RELEASE within 300 ms; proper confidence calculation | P0 |
| **Duplicate Suppression** | Same idempotency_key rejected; semantic duplicates detected | P0 |
| **Cooldown Enforcement** | Signals rejected during cooldown; escalation works; decay works | P0 |
| **TTL Expiry** | Signals expire at correct time; lifecycle state updated | P0 |
| **Conflict Resolution** | Opposing signals handled; higher confidence wins; supersession works | P1 |
| **Kill-Switch** | All signals blocked; STAND_DOWN emitted; deactivation works | P0 |
| **Invalidation** | Each invalidation rule triggers correctly; lifecycle updated | P1 |
| **Confidence Aggregation** | Weights applied correctly; adjustments work; bounds enforced | P1 |
| **Replay Determinism** | Same inputs produce identical outputs across runs | P0 |
| **Missing Inputs** | Graceful degradation; STAND_DOWN when critical inputs missing | P1 |
| **Stale Inputs** | Freshness penalties applied; hard reject at threshold | P1 |
| **Circuit Breaker** | Churn detection works; circuit breaker activates and recovers | P1 |
| **Stand-Down Logic** | All triggers produce STAND_DOWN; exits still allowed | P1 |
| **End-to-End** | Full flow from inputs to written signals | P0 |

### 19.2) Specific Test Cases

```
TEST: FAST_RELEASE_TIMING
  Setup:
    - Mock SqueezeSignal with release_type = FAST_RELEASE
    - Mock StrategyCandidate with urgency = IMMEDIATE
    - All gates pass
  Execute:
    - Process signal
    - Measure latency
  Assert:
    - Latency <= 100 ms
    - SignalIntent.signal_type == SQUEEZE_FAST_RELEASE
    - SignalIntent.urgency == IMMEDIATE
    - SignalIntent.ttl_seconds <= 120

TEST: DUPLICATE_SUPPRESSION_HASH
  Setup:
    - Create signal with idempotency_key X
    - Write to store
    - Create second signal with same inputs (same idempotency_key)
  Execute:
    - Process second signal
  Assert:
    - Second signal REJECTED
    - Reason == "duplicate_signal"
    - SignalMetrics.duplicates_detected incremented

TEST: COOLDOWN_ENFORCEMENT
  Setup:
    - Create and emit signal at T=0
    - Cooldown = 120 seconds
    - Attempt second signal at T=60 seconds
  Execute:
    - Process second signal
  Assert:
    - Second signal REJECTED
    - Reason == "cooldown_active"
    - cooldown_remaining_ms == 60000

TEST: COOLDOWN_ESCALATION
  Setup:
    - Emit signal, then invalidate (false positive)
    - Emit second signal (should have escalated cooldown)
  Execute:
    - Attempt third signal before escalated cooldown expires
  Assert:
    - Third signal REJECTED
    - effective_cooldown > base_cooldown

TEST: TTL_EXPIRY
  Setup:
    - Create signal with ttl_seconds = 60
    - Advance clock by 61 seconds
  Execute:
    - Run invalidation processor
  Assert:
    - SignalLifecycleState.current_state == EXPIRED
    - SignalLifecycleState.expired_at is set

TEST: CONFLICT_RESOLUTION
  Setup:
    - Create LONG signal with confidence 0.70
    - Create SHORT signal with confidence 0.75
  Execute:
    - Process both signals
  Assert:
    - LONG signal superseded
    - SHORT signal active
    - LONG.superseded_by == SHORT.signal_id

TEST: KILL_SWITCH
  Setup:
    - Set config kill_switch = true
    - Attempt to create ENTRY_LONG signal
  Execute:
    - Process signal
  Assert:
    - Signal REJECTED
    - STAND_DOWN signal emitted
    - All active signals invalidated

TEST: REPLAY_DETERMINISM
  Setup:
    - Fixed inputs: strategy, setup, regime, quote
    - Fixed timestamp
  Execute:
    - Process signal run 1
    - Reset state
    - Process signal run 2 with same inputs
  Assert:
    - Run 1 signal_id == Run 2 signal_id
    - Run 1 confidence == Run 2 confidence
    - All fields match

TEST: CHURN_CIRCUIT_BREAKER
  Setup:
    - Emit 40 signals in 60 seconds (churn_rate > 0.5)
  Execute:
    - Monitor churn detection
  Assert:
    - Circuit breaker activates
    - STAND_DOWN emitted
    - Subsequent signals blocked for 60 seconds
```

---

## 20) Signal Lifecycle Diagram

```
SIGNAL LIFECYCLE STATE MACHINE:

                    ┌──────────────────────────────────────────────────────────┐
                    │                                                          │
                    ▼                                                          │
              ┌─────────┐                                                      │
              │ CREATED │──────────────────────────────────────────────────────┤
              └────┬────┘                                                      │
                   │                                                           │
                   │ Validation passes                                         │
                   │                                                           │
                   ▼                                                           │
              ┌─────────┐                                                      │
              │ ACTIVE  │◄─────────────────────────────────────────────────────┘
              └────┬────┘
                   │
        ┌──────────┼──────────┬──────────────┬────────────────┐
        │          │          │              │                │
        │          │          │              │                │
        ▼          ▼          ▼              ▼                ▼
   ┌─────────┐ ┌──────────┐ ┌────────────┐ ┌──────────┐ ┌────────────┐
   │ EXPIRED │ │ INVALID- │ │ CONSUMED   │ │ SUPER-   │ │ (back to   │
   │         │ │ ATED     │ │            │ │ SEDED    │ │  CREATED)  │
   └─────────┘ └──────────┘ └────────────┘ └──────────┘ └────────────┘
       │            │              │             │
       │            │              │             │
       └────────────┴──────────────┴─────────────┘
                           │
                           ▼
                    [TERMINAL STATE]


TRANSITIONS:

CREATED → ACTIVE:
  Trigger: All hard gates pass
  Action: Set activated_at

ACTIVE → EXPIRED:
  Trigger: TTL exceeded (now > expiry_timestamp)
  Action: Set expired_at

ACTIVE → INVALIDATED:
  Trigger: Any invalidation rule matches
  Action: Set invalidated_at, invalidation_reason

ACTIVE → CONSUMED:
  Trigger: Downstream module (10_risk_sizing) consumes signal
  Action: Set consumed_at, consumed_by

ACTIVE → SUPERSEDED:
  Trigger: Newer signal replaces this one
  Action: Set superseded_at, superseded_by

CREATED → ACTIVE (retry):
  Trigger: Transient failure resolved
  Action: Re-evaluate gates

TERMINAL STATES:
  EXPIRED, INVALIDATED, CONSUMED, SUPERSEDED are terminal
  No transitions out of terminal states
```

---

## 21) Minimum Acceptance Criteria

### 21.1) Schema Completeness

- [x] SignalIntent fully defined with all required fields
- [x] SignalContextSnapshot captures all input state
- [x] SignalConfidenceBreakdown provides detailed scoring
- [x] SignalLifecycleState tracks all state transitions
- [x] SignalInvalidationRule covers all invalidation cases
- [x] SignalProvenance enables full reproducibility
- [x] SignalMetrics covers operational monitoring

### 21.2) Signal Types

- [x] All 7 signal types defined (ENTRY_LONG, ENTRY_SHORT, EXIT_PARTIAL, EXIT_FULL, STAND_DOWN, SQUEEZE_FAST_RELEASE, SQUEEZE_CONFIRMED_RELEASE)
- [x] Constraints per signal type documented

### 21.3) Squeeze Handling

- [x] FAST_RELEASE path defined (≤ 100 ms budget)
- [x] CONFIRMED_RELEASE path defined (≤ 300 ms budget)
- [x] Direction confirmation rules specified
- [x] Latency optimization strategies documented
- [x] False break handling defined

### 21.4) Core Algorithm

- [x] Signal eligibility gates defined (7 hard, 4 soft)
- [x] Signal construction logic specified
- [x] Confidence aggregation function documented
- [x] Deduplication algorithm (hash + semantic)
- [x] Cooldown rules with escalation
- [x] TTL assignment logic
- [x] Invalidation rules (10 rules)
- [x] Stand-down signal logic
- [x] Emergency kill-switch

### 21.5) Latency

- [x] Latency budgets defined per signal type
- [x] Measurement approach specified
- [x] Failure behavior documented

### 21.6) Test Plan

- [x] FAST squeeze timing tests
- [x] Duplicate suppression tests
- [x] Cooldown enforcement tests
- [x] TTL expiry tests
- [x] Conflict resolution tests
- [x] Kill-switch test
- [x] Replay determinism tests

### 21.7) Write Contract

- [x] Idempotent writes
- [x] Schema validation
- [x] Provenance metadata
- [x] Lifecycle tracking

---

## 22) Deferred Design Notes

### 22.1) Deferred to Future Modules

| Item | Deferred To | Rationale |
|------|-------------|-----------|
| Position sizing | 10_risk_sizing | Different responsibility |
| Portfolio constraints | 10_risk_sizing | Requires portfolio view |
| Order execution | 11_execution | Broker integration |
| Order management | 12_order_management | Order lifecycle |
| PnL tracking | Future module | Separate concern |

### 22.2) Deferred Implementation Details

| Item | Notes |
|------|-------|
| ML-based confidence | Start with deterministic; ML can enhance later |
| Adaptive latency budgets | Start with static; measure and adjust |
| Cross-symbol signal coordination | Single-symbol focus initially |
| Historical replay system | Design for it; implement separately |

### 22.3) Known Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| No position awareness | Cannot generate EXIT signals proactively | 10_risk_sizing will request exits |
| Single-symbol scope | No cross-symbol correlation | Future enhancement |
| Static confidence weights | May not be optimal | Tune iteratively |
| Latency targets are best-effort | May exceed in edge cases | Log and monitor |

---

## 23) Proposed Git Commit

```
Commit ID: COMMIT-0011
Module: 08_signal_generation
Type: SPEC

Summary:
Add signal generation specification defining the final decision boundary
before risk management. Converts approved strategy intent into immutable,
time-bound SignalIntent objects.

Contents:
- 7 canonical schemas (SignalIntent, SignalContextSnapshot, SignalConfidenceBreakdown, SignalLifecycleState, SignalInvalidationRule, SignalProvenance, SignalMetrics)
- 7 signal types with constraints
- Low-latency squeeze path (FAST ≤ 100 ms, CONFIRMED ≤ 300 ms)
- 11 eligibility gates (7 hard, 4 soft)
- Confidence aggregation function
- Deduplication (hash + semantic)
- Cooldown with escalation
- 10 invalidation rules
- Kill-switch and circuit breaker
- Comprehensive test plan

Key Features:
- Deterministic processing
- Stateless beyond cooldown
- Idempotent signal emission
- Full provenance tracking

Upstream Dependencies:
- 07_strategy_selection_engine (StrategySelectionState, StrategyCandidate)
- 04b_setup_and_pattern_library (SetupCandidate, SqueezeSignal, SqueezeState)
- 04_market_regime (RegimeClassification, MultiTimeframeAlignment)
- 00_core (Clock, Logger, ConfigContract)

Downstream Consumers:
- 10_risk_sizing (future)

Files:
- options_trading_brain/08_signal_generation/SPEC.md

Commit Message:
[OptionsBrain] 08_signal_generation (COMMIT-0011): signal intent, squeeze low-latency path, eligibility gates, TTL, invalidation
```

---

**END OF SPEC**
