# 07_STRATEGY_SELECTION_ENGINE — SPEC

**Commit ID:** COMMIT-0010
**Status:** SPEC COMPLETE
**Upstream Dependencies:** 00_core, 02_data_store, 04_market_regime, 04b_setup_and_pattern_library, 05_options_analytics
**Downstream Consumers:** 08_signal_generation (future), 10_risk_sizing (future)

---

## 1) Purpose

The Strategy Selection Engine is the **portfolio manager layer** of the trading system. It determines which strategy families are eligible to trade at any given moment, ranks them by suitability, and outputs a prioritized list of allowed strategies.

This module does NOT:
- Generate trade signals
- Size positions
- Place orders
- Compute features
- Detect setups

It ONLY answers: **"Which strategies are allowed right now, and in what priority order?"**

The module operates as a **gating and ranking layer** that sits between upstream analytics (regime, setups, options) and downstream signal generation. It ensures that downstream modules only consider strategies appropriate for current market conditions.

---

## 2) Owns / Does Not Own

### 2.1) Owns

| Responsibility | Description |
|----------------|-------------|
| **Strategy eligibility rules** | Hard gates that determine if a strategy can trade at all |
| **Strategy ranking** | Soft scoring that prioritizes eligible strategies |
| **Regime/setup compatibility mapping** | Which strategies work in which regimes and setups |
| **Options condition compatibility** | IV, skew, term structure, liquidity requirements per strategy |
| **Cooldowns** | Minimum time between strategy activations/deactivations |
| **Conflict resolution** | Rules preventing incompatible strategies from being active simultaneously |
| **Hysteresis/persistence** | Preventing thrashing in strategy selection |
| **Squeeze promotion logic** | Elevating long-vol strategies on squeeze release signals |
| **Selection state management** | Tracking allowed strategies over time |
| **Staleness handling** | Degradation rules when inputs are stale or missing |
| **Selection provenance** | Recording which inputs drove each selection decision |

### 2.2) Does NOT Own

| Responsibility | Owner |
|----------------|-------|
| Feature computation | 03_feature_engineering |
| Setup detection | 04b_setup_and_pattern_library |
| Regime classification | 04_market_regime |
| Options analytics math | 05_options_analytics |
| Signal generation | 08_signal_generation (future) |
| Entry/exit logic | 08_signal_generation (future) |
| Risk sizing | 10_risk_sizing (future) |
| Position sizing | 10_risk_sizing (future) |
| Order execution | 11_execution (future) |
| Order management | 12_order_management (future) |

---

## 3) Inputs

All inputs are consumed from upstream modules via 02_data_store.

### 3.1) From 04_market_regime

```
RegimeClassification:
  - symbol: string
  - timeframe: string
  - timestamp_utc: datetime
  - regime_type: enum[TRENDING_UP, TRENDING_DOWN, RANGING, BREAKOUT, BREAKDOWN, CHOPPY, VOLATILE_EXPANSION, VOLATILE_CONTRACTION, UNKNOWN]
  - regime_strength: float           # 0.0–1.0
  - regime_confidence: float         # 0.0–1.0
  - regime_duration_bars: int
  - trend_direction: enum[UP, DOWN, NEUTRAL]
  - volatility_state: enum[LOW, NORMAL, HIGH, EXTREME]
  - mtf_alignment: dict[timeframe → regime_type]
  - provenance: ProvenanceMetadata
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

### 3.3) From 05_options_analytics

```
OptionGreeksSnapshot:
  - symbol: string
  - contract_ref: OptionContractRef
  - timestamp_utc: datetime
  - delta, gamma, vega, theta, rho: float
  - iv: float
  - provenance: OptionsProvenance

IVSnapshot:
  - symbol: string
  - timestamp_utc: datetime
  - atm_iv: float
  - iv_rank: float                   # 0–100
  - iv_percentile: float             # 0–100
  - provenance: OptionsProvenance

IVSurfaceSlice:
  - symbol: string
  - timestamp_utc: datetime
  - expiry: date
  - dte: int
  - strike_iv_pairs: list[(strike, iv)]
  - atm_strike: float
  - atm_iv: float
  - provenance: OptionsProvenance

TermStructureSnapshot:
  - symbol: string
  - timestamp_utc: datetime
  - expiry_iv_pairs: list[(expiry, atm_iv)]
  - front_month_iv: float
  - back_month_iv: float
  - term_structure_slope: float
  - structure_state: enum[CONTANGO, BACKWARDATION, FLAT]
  - provenance: OptionsProvenance

SkewSnapshot:
  - symbol: string
  - timestamp_utc: datetime
  - expiry: date
  - dte: int
  - put_skew_25d: float
  - call_skew_25d: float
  - risk_reversal_25d: float
  - butterfly_25d: float
  - skew_state: enum[PUT_HEAVY, CALL_HEAVY, BALANCED, EXTREME_PUT, EXTREME_CALL]
  - provenance: OptionsProvenance

OptionsLiquiditySnapshot:
  - symbol: string
  - timestamp_utc: datetime
  - avg_bid_ask_spread_pct: float
  - atm_spread_pct: float
  - total_open_interest: int
  - atm_open_interest: int
  - avg_volume: int
  - liquidity_grade: enum[EXCELLENT, GOOD, FAIR, POOR, ILLIQUID]
  - provenance: OptionsProvenance

GammaExposureProxy:
  - symbol: string
  - timestamp_utc: datetime
  - net_gex_estimate: float
  - gex_flip_price: float | null
  - dealer_positioning_bias: enum[LONG_GAMMA, SHORT_GAMMA, NEUTRAL, UNKNOWN]
  - confidence: float
  - provenance: OptionsProvenance

ChainSummary:
  - symbol: string
  - timestamp_utc: datetime
  - available_expirations: date[]
  - weekly_available: bool
  - min_dte: int
  - max_dte: int
  - strike_width: float
  - provenance: OptionsProvenance
```

### 3.4) From 01_data_ingestion (via 02_data_store)

```
NormalizedQuote:
  - symbol: string
  - timestamp_utc: datetime
  - bid: float
  - ask: float
  - bid_size: int
  - ask_size: int
  - provenance: ProvenanceMetadata
```

---

## 4) Canonical Output Schemas

All outputs include: `symbol`, `timeframe`, `timestamp_utc`, and `provenance`.

### 4.1) StrategyCandidate

Represents a single strategy that MAY be considered for trading.

```
StrategyCandidate:
  - symbol: string
  - timeframe: string                # Primary timeframe for this candidate
  - timestamp_utc: datetime
  - strategy_id: string              # Unique identifier (e.g., "trend_continuation_long_call")
  - strategy_name: string            # Human-readable name
  - family: enum[TREND, MEAN_REVERSION, BREAKOUT, LONG_VOL, SHORT_VOL, EVENT_BLACKOUT]
  - direction: enum[LONG, SHORT, NEUTRAL]
  - is_eligible: bool                # Passed all hard gates
  - eligibility: StrategyEligibility
  - score: float                     # 0.0–1.0 composite score
  - score_breakdown: StrategyScoreBreakdown
  - constraints: StrategyConstraints
  - recommended_structures: OptionStructure[]
  - urgency: enum[IMMEDIATE, STANDARD, LOW]
  - time_to_act_seconds: int | null  # Estimated window for action (null = no urgency)
  - rationale: string                # Human-readable explanation
  - provenance: StrategySelectionProvenance
```

### 4.2) StrategyEligibility

Details on why a strategy passed or failed eligibility.

```
StrategyEligibility:
  - symbol: string
  - timeframe: string
  - timestamp_utc: datetime
  - strategy_id: string
  - is_eligible: bool
  - hard_gate_results: HardGateResult[]
  - soft_gate_results: SoftGateResult[]
  - blocking_gate: string | null     # First gate that blocked eligibility
  - blocking_reason: string | null   # Human-readable reason
  - degraded_inputs: string[]        # Inputs that were stale/missing but allowed
  - provenance: StrategySelectionProvenance

HardGateResult:
  - gate_id: string                  # e.g., "liquidity_minimum"
  - gate_name: string
  - passed: bool
  - required_value: any
  - actual_value: any
  - reason: string | null

SoftGateResult:
  - gate_id: string
  - gate_name: string
  - score_contribution: float        # 0.0–1.0
  - weight: float                    # Weight in final score
  - reason: string | null
```

### 4.3) StrategyScoreBreakdown

Detailed scoring components.

```
StrategyScoreBreakdown:
  - symbol: string
  - timeframe: string
  - timestamp_utc: datetime
  - strategy_id: string
  - total_score: float               # 0.0–1.0
  - regime_alignment_score: float    # 0.0–1.0
  - regime_alignment_weight: float
  - setup_confidence_score: float    # 0.0–1.0
  - setup_confidence_weight: float
  - iv_alignment_score: float        # 0.0–1.0
  - iv_alignment_weight: float
  - skew_alignment_score: float      # 0.0–1.0
  - skew_alignment_weight: float
  - liquidity_score: float           # 0.0–1.0
  - liquidity_weight: float
  - mtf_alignment_score: float       # 0.0–1.0
  - mtf_alignment_weight: float
  - freshness_score: float           # 0.0–1.0 (penalty for stale inputs)
  - freshness_weight: float
  - squeeze_bonus: float             # 0.0–0.3 (additional boost on squeeze release)
  - persistence_bonus: float         # 0.0–0.1 (bonus for currently active strategies)
  - conflict_penalty: float          # 0.0–0.5 (penalty if conflicting strategies exist)
  - score_formula: string            # Human-readable formula used
  - provenance: StrategySelectionProvenance
```

### 4.4) StrategyConstraints

Hard constraints that define valid trading parameters for a strategy.

```
StrategyConstraints:
  - symbol: string
  - timeframe: string
  - timestamp_utc: datetime
  - strategy_id: string

  # Liquidity constraints
  - min_liquidity_grade: enum[EXCELLENT, GOOD, FAIR, POOR]
  - max_bid_ask_spread_pct: float
  - min_open_interest: int
  - min_volume: int

  # IV constraints
  - min_iv_rank: float | null
  - max_iv_rank: float | null
  - min_iv_percentile: float | null
  - max_iv_percentile: float | null
  - iv_regime_required: enum[LOW, NORMAL, HIGH, EXTREME] | null

  # DTE constraints
  - min_dte: int
  - max_dte: int
  - preferred_dte_range: tuple[int, int]

  # Delta constraints
  - min_delta: float | null
  - max_delta: float | null
  - preferred_delta_range: tuple[float, float] | null

  # Regime constraints
  - allowed_regimes: enum[]
  - blocked_regimes: enum[]
  - min_regime_confidence: float
  - min_regime_strength: float

  # Event constraints
  - earnings_blackout_days: int      # Days before/after earnings to avoid
  - fomc_blackout_days: int
  - major_event_blackout: bool

  # Skew/structure constraints
  - required_term_structure: enum[CONTANGO, BACKWARDATION, FLAT, ANY]
  - max_skew_extreme: float          # Block if skew exceeds this

  # GEX constraints (if applicable)
  - required_dealer_positioning: enum[LONG_GAMMA, SHORT_GAMMA, NEUTRAL, ANY]

  provenance: StrategySelectionProvenance
```

### 4.5) StrategySelectionState

The current allowed strategy set at time T.

```
StrategySelectionState:
  - symbol: string
  - timeframe: string
  - timestamp_utc: datetime
  - selection_id: string             # Unique ID for this selection snapshot
  - top_n_strategies: StrategyCandidate[]  # Ordered by score descending
  - n_candidates_evaluated: int
  - n_candidates_eligible: int
  - n_candidates_selected: int       # ≤ max_concurrent_strategies
  - max_concurrent_strategies: int   # Config-driven limit
  - active_strategy_ids: string[]    # Strategies currently in active state
  - newly_promoted: string[]         # Strategies promoted this cycle
  - newly_demoted: string[]          # Strategies demoted this cycle
  - blackout_active: bool            # True if event blackout in effect
  - blackout_reason: string | null
  - squeeze_override_active: bool    # True if squeeze promotion is elevating strategies
  - selection_generation: int        # Monotonic counter for change detection
  - last_change_timestamp: datetime
  - stability_score: float           # 0.0–1.0 (higher = less churn)
  - provenance: StrategySelectionProvenance
```

### 4.6) StrategySelectionProvenance

Detailed provenance for reproducibility and debugging.

```
StrategySelectionProvenance:
  - symbol: string
  - timeframe: string
  - timestamp_utc: datetime
  - selection_id: string

  # Input snapshots (hashes for reproducibility)
  - regime_input_hash: string
  - regime_input_timestamp: datetime
  - setup_input_hash: string
  - setup_input_timestamp: datetime
  - options_input_hash: string
  - options_input_timestamp: datetime
  - quote_input_hash: string
  - quote_input_timestamp: datetime

  # Input versions
  - regime_schema_version: string
  - setup_schema_version: string
  - options_schema_version: string

  # Freshness
  - regime_age_ms: int
  - setup_age_ms: int
  - options_age_ms: int
  - quote_age_ms: int
  - any_input_stale: bool
  - stale_inputs: string[]

  # Algorithm version
  - selection_algorithm_version: string
  - strategy_catalog_version: string
  - gate_config_version: string

  # Processing metadata
  - processing_started_utc: datetime
  - processing_ended_utc: datetime
  - processing_duration_ms: int
```

### 4.7) StrategySelectionMetrics

Operational metrics for monitoring.

```
StrategySelectionMetrics:
  - symbol: string
  - timeframe: string
  - timestamp_utc: datetime
  - window_start: datetime
  - window_end: datetime

  # Latency
  - avg_selection_latency_ms: float
  - p50_selection_latency_ms: float
  - p95_selection_latency_ms: float
  - p99_selection_latency_ms: float
  - max_selection_latency_ms: float

  # Rejection reasons (counts)
  - rejections_by_gate: dict[gate_id → int]
  - total_rejections: int
  - total_evaluations: int
  - rejection_rate: float            # 0.0–1.0

  # Churn metrics
  - selection_changes: int           # Number of times top-N changed
  - churn_rate: float                # Changes per minute
  - avg_strategy_tenure_seconds: float
  - stability_violations: int        # Times churn exceeded threshold

  # Squeeze metrics
  - squeeze_promotions: int
  - squeeze_false_positive_rate: float  # If tracked

  # Input health
  - stale_input_events: int
  - missing_input_events: int
  - degraded_selection_events: int

  provenance: StrategySelectionProvenance
```

### 4.8) OptionStructure (supporting type)

Recommended option structure for a strategy.

```
OptionStructure:
  - structure_type: enum[LONG_CALL, LONG_PUT, SHORT_CALL, SHORT_PUT,
                         CALL_DEBIT_SPREAD, PUT_DEBIT_SPREAD,
                         CALL_CREDIT_SPREAD, PUT_CREDIT_SPREAD,
                         LONG_STRADDLE, LONG_STRANGLE,
                         SHORT_STRADDLE, SHORT_STRANGLE,
                         IRON_CONDOR, IRON_BUTTERFLY,
                         CALENDAR_CALL, CALENDAR_PUT,
                         DIAGONAL_CALL, DIAGONAL_PUT,
                         RATIO_SPREAD, BACK_SPREAD]
  - legs: int
  - max_risk_type: enum[DEFINED, UNDEFINED]
  - vega_exposure: enum[LONG, SHORT, NEUTRAL]
  - theta_exposure: enum[LONG, SHORT, NEUTRAL]
  - delta_bias: enum[BULLISH, BEARISH, NEUTRAL]
  - preferred_for_iv_regime: enum[LOW, NORMAL, HIGH][]
  - notes: string | null
```

---

## 5) Strategy Catalog Definition Format

The Strategy Catalog defines all tradeable strategies in a declarative format. Each strategy is defined without implementation code.

### 5.1) Strategy Definition Schema

```
StrategyDefinition:
  # Identity
  - strategy_id: string              # Unique, snake_case (e.g., "trend_continuation_long")
  - strategy_name: string            # Human-readable
  - family: enum[TREND, MEAN_REVERSION, BREAKOUT, LONG_VOL, SHORT_VOL, EVENT_BLACKOUT]
  - direction: enum[LONG, SHORT, NEUTRAL]
  - description: string

  # Preconditions (ALL must be satisfied)
  - regime_requirements:
      allowed_regimes: enum[]
      min_regime_confidence: float
      min_regime_strength: float
      trend_direction_required: enum[UP, DOWN, NEUTRAL, ANY]
      volatility_state_allowed: enum[]

  - setup_requirements:
      required_setups: string[]      # At least one must be active
      min_setup_confidence: float
      setup_state_required: enum[FORMING, TRIGGERED, ACTIVE][]

  - options_requirements:
      iv_rank_range: tuple[float, float] | null
      iv_percentile_range: tuple[float, float] | null
      term_structure_required: enum[CONTANGO, BACKWARDATION, FLAT, ANY]
      skew_state_allowed: enum[]
      min_liquidity_grade: enum
      max_bid_ask_spread_pct: float

  # Exclusions (ANY triggers block)
  - exclusions:
      blocked_regimes: enum[]
      blocked_setups: string[]       # Setups that invalidate this strategy
      blocked_iv_states: string[]    # e.g., "IV_RANK_EXTREME_HIGH"
      earnings_blackout: bool
      fomc_blackout: bool
      major_event_blackout: bool
      conflicting_strategies: string[]  # Strategy IDs that cannot coexist

  # Required inputs
  - required_inputs:
      - 04_market_regime.RegimeClassification
      - 04b_setup_and_pattern_library.SetupCandidate
      - 05_options_analytics.IVSnapshot
      - 05_options_analytics.OptionsLiquiditySnapshot
      # ... etc.

  # Recommended structures
  - recommended_structures:
      - structure: OptionStructure
        when: string                 # Condition description
        priority: int

  # DTE / Delta ranges
  - dte_config:
      min_dte: int
      max_dte: int
      preferred_dte: int
      expiry_rule: string            # e.g., "weekly preferred for < 7 DTE"

  - delta_config:
      min_delta: float | null
      max_delta: float | null
      preferred_delta: float | null

  # Liquidity thresholds
  - liquidity_config:
      min_liquidity_grade: enum
      max_spread_pct: float
      min_open_interest: int
      min_volume: int

  # Event handling
  - event_config:
      earnings_blackout_days_before: int
      earnings_blackout_days_after: int
      fomc_blackout_days: int
      ex_dividend_handling: enum[AVOID, ALLOW, PREFER]

  # Scoring weights (for soft scoring)
  - scoring_weights:
      regime_alignment: float
      setup_confidence: float
      iv_alignment: float
      skew_alignment: float
      liquidity: float
      mtf_alignment: float

  # Why it wins (explainability)
  - regime_explanation: string       # Why this strategy works in its target regime
  - edge_source: string              # What provides the edge
  - failure_modes: string[]          # Known ways this strategy fails

  # Metadata
  - version: string
  - last_updated: date
  - author: string
  - notes: string | null
```

---

## 6) Strategy Catalog: Core Strategies

### 6.1) TREND Family

#### 6.1.1) trend_continuation_long

```yaml
strategy_id: trend_continuation_long
strategy_name: Trend Continuation (Long)
family: TREND
direction: LONG
description: |
  Captures continuation moves in established uptrends. Enters on pullbacks
  to support within a strong trend, using directional options to ride momentum.

regime_requirements:
  allowed_regimes: [TRENDING_UP]
  min_regime_confidence: 0.65
  min_regime_strength: 0.50
  trend_direction_required: UP
  volatility_state_allowed: [LOW, NORMAL, HIGH]

setup_requirements:
  required_setups: [trend_pullback_long, breakout_retest_long]
  min_setup_confidence: 0.60
  setup_state_required: [TRIGGERED, ACTIVE]

options_requirements:
  iv_rank_range: [10, 70]
  iv_percentile_range: null
  term_structure_required: ANY
  skew_state_allowed: [PUT_HEAVY, BALANCED, CALL_HEAVY]
  min_liquidity_grade: FAIR
  max_bid_ask_spread_pct: 0.10

exclusions:
  blocked_regimes: [TRENDING_DOWN, BREAKDOWN, CHOPPY]
  blocked_setups: [range_mean_reversion_short]
  blocked_iv_states: []
  earnings_blackout: true
  fomc_blackout: false
  major_event_blackout: false
  conflicting_strategies: [trend_continuation_short, range_mean_reversion_short]

required_inputs:
  - 04_market_regime.RegimeClassification
  - 04b_setup_and_pattern_library.SetupCandidate
  - 05_options_analytics.IVSnapshot
  - 05_options_analytics.OptionsLiquiditySnapshot
  - 05_options_analytics.SkewSnapshot

recommended_structures:
  - structure: LONG_CALL
    when: "IV rank < 30, strong trend, simple exposure needed"
    priority: 1
  - structure: CALL_DEBIT_SPREAD
    when: "IV rank 30-60, defined risk preferred"
    priority: 2
  - structure: DIAGONAL_CALL
    when: "IV rank > 50, want to reduce cost basis"
    priority: 3

dte_config:
  min_dte: 14
  max_dte: 60
  preferred_dte: 30
  expiry_rule: "Monthly expiry preferred; weekly only for < 2 week trades"

delta_config:
  min_delta: 0.40
  max_delta: 0.70
  preferred_delta: 0.55

liquidity_config:
  min_liquidity_grade: FAIR
  max_spread_pct: 0.10
  min_open_interest: 500
  min_volume: 100

event_config:
  earnings_blackout_days_before: 3
  earnings_blackout_days_after: 1
  fomc_blackout_days: 0
  ex_dividend_handling: ALLOW

scoring_weights:
  regime_alignment: 0.25
  setup_confidence: 0.25
  iv_alignment: 0.15
  skew_alignment: 0.10
  liquidity: 0.15
  mtf_alignment: 0.10

regime_explanation: |
  In established uptrends, pullbacks to support offer favorable risk/reward
  entry points. Trend continuation captures the next leg higher with
  controlled downside through defined-risk structures.

edge_source: |
  Edge comes from entering after pullback exhaustion within a confirmed
  trend, with regime confirmation providing directional conviction.

failure_modes:
  - "Trend reversal during trade"
  - "Pullback extends beyond expected support"
  - "IV crush on entry if elevated"
  - "Time decay if move delayed"

version: "1.0.0"
last_updated: 2025-12-30
author: TradingBrain
notes: null
```

#### 6.1.2) trend_continuation_short

```yaml
strategy_id: trend_continuation_short
strategy_name: Trend Continuation (Short)
family: TREND
direction: SHORT
description: |
  Captures continuation moves in established downtrends. Enters on rallies
  to resistance within a strong downtrend, using directional options to profit from further decline.

regime_requirements:
  allowed_regimes: [TRENDING_DOWN]
  min_regime_confidence: 0.65
  min_regime_strength: 0.50
  trend_direction_required: DOWN
  volatility_state_allowed: [LOW, NORMAL, HIGH, EXTREME]

setup_requirements:
  required_setups: [trend_pullback_short, breakout_retest_short]
  min_setup_confidence: 0.60
  setup_state_required: [TRIGGERED, ACTIVE]

options_requirements:
  iv_rank_range: [20, 85]  # Higher IV acceptable in downtrends
  iv_percentile_range: null
  term_structure_required: ANY
  skew_state_allowed: [PUT_HEAVY, EXTREME_PUT, BALANCED]
  min_liquidity_grade: FAIR
  max_bid_ask_spread_pct: 0.12

exclusions:
  blocked_regimes: [TRENDING_UP, BREAKOUT, CHOPPY]
  blocked_setups: [range_mean_reversion_long]
  blocked_iv_states: []
  earnings_blackout: true
  fomc_blackout: true
  major_event_blackout: true
  conflicting_strategies: [trend_continuation_long, range_mean_reversion_long]

required_inputs:
  - 04_market_regime.RegimeClassification
  - 04b_setup_and_pattern_library.SetupCandidate
  - 05_options_analytics.IVSnapshot
  - 05_options_analytics.OptionsLiquiditySnapshot
  - 05_options_analytics.SkewSnapshot

recommended_structures:
  - structure: LONG_PUT
    when: "IV rank < 50, strong downtrend"
    priority: 1
  - structure: PUT_DEBIT_SPREAD
    when: "IV rank > 50, defined risk preferred"
    priority: 2

dte_config:
  min_dte: 14
  max_dte: 45
  preferred_dte: 28
  expiry_rule: "Monthly expiry preferred"

delta_config:
  min_delta: -0.70
  max_delta: -0.40
  preferred_delta: -0.55

liquidity_config:
  min_liquidity_grade: FAIR
  max_spread_pct: 0.12
  min_open_interest: 500
  min_volume: 100

event_config:
  earnings_blackout_days_before: 3
  earnings_blackout_days_after: 1
  fomc_blackout_days: 1
  ex_dividend_handling: ALLOW

scoring_weights:
  regime_alignment: 0.25
  setup_confidence: 0.25
  iv_alignment: 0.15
  skew_alignment: 0.10
  liquidity: 0.15
  mtf_alignment: 0.10

regime_explanation: |
  Downtrends often exhibit stronger momentum and fear-driven moves.
  Rallies to resistance offer entry points for the next leg lower.

edge_source: |
  Fear-driven markets move faster; put skew often expands, benefiting
  long puts. Trend confirmation reduces whipsaw risk.

failure_modes:
  - "Trend reversal / relief rally"
  - "IV already extreme, limiting further gains"
  - "Short squeeze dynamics"

version: "1.0.0"
last_updated: 2025-12-30
author: TradingBrain
notes: null
```

---

### 6.2) MEAN_REVERSION Family

#### 6.2.1) range_mean_reversion_long

```yaml
strategy_id: range_mean_reversion_long
strategy_name: Range Mean Reversion (Long)
family: MEAN_REVERSION
direction: LONG
description: |
  Fades moves to range support in established ranging markets.
  Expects price to revert toward range midpoint.

regime_requirements:
  allowed_regimes: [RANGING]
  min_regime_confidence: 0.70
  min_regime_strength: 0.40
  trend_direction_required: NEUTRAL
  volatility_state_allowed: [LOW, NORMAL]

setup_requirements:
  required_setups: [range_mean_reversion_long, vp_rejection_long]
  min_setup_confidence: 0.65
  setup_state_required: [TRIGGERED, ACTIVE]

options_requirements:
  iv_rank_range: [20, 60]
  iv_percentile_range: null
  term_structure_required: ANY
  skew_state_allowed: [BALANCED, PUT_HEAVY]
  min_liquidity_grade: GOOD
  max_bid_ask_spread_pct: 0.08

exclusions:
  blocked_regimes: [TRENDING_UP, TRENDING_DOWN, BREAKOUT, BREAKDOWN, VOLATILE_EXPANSION]
  blocked_setups: [breakout_momentum_long, breakout_momentum_short]
  blocked_iv_states: ["IV_RANK_EXTREME_HIGH"]
  earnings_blackout: true
  fomc_blackout: true
  major_event_blackout: true
  conflicting_strategies: [breakout_momentum_long, breakout_momentum_short, long_volatility_squeeze]

required_inputs:
  - 04_market_regime.RegimeClassification
  - 04b_setup_and_pattern_library.SetupCandidate
  - 04b_setup_and_pattern_library.RangeZone
  - 05_options_analytics.IVSnapshot
  - 05_options_analytics.OptionsLiquiditySnapshot

recommended_structures:
  - structure: CALL_DEBIT_SPREAD
    when: "Defined risk, capped upside acceptable"
    priority: 1
  - structure: LONG_CALL
    when: "IV rank < 25, expecting strong reversion"
    priority: 2

dte_config:
  min_dte: 7
  max_dte: 30
  preferred_dte: 21
  expiry_rule: "Weekly acceptable for quick mean reversion plays"

delta_config:
  min_delta: 0.35
  max_delta: 0.60
  preferred_delta: 0.50

liquidity_config:
  min_liquidity_grade: GOOD
  max_spread_pct: 0.08
  min_open_interest: 1000
  min_volume: 200

event_config:
  earnings_blackout_days_before: 5
  earnings_blackout_days_after: 2
  fomc_blackout_days: 1
  ex_dividend_handling: AVOID

scoring_weights:
  regime_alignment: 0.30
  setup_confidence: 0.25
  iv_alignment: 0.15
  skew_alignment: 0.10
  liquidity: 0.10
  mtf_alignment: 0.10

regime_explanation: |
  Ranging markets oscillate between support and resistance.
  Buying at range support with a target at range midpoint or resistance
  captures predictable mean-reversion moves.

edge_source: |
  Edge from well-defined range boundaries with multiple touches.
  Low IV environments reduce cost of entry.

failure_modes:
  - "Range breakdown"
  - "News catalyst breaks range"
  - "False support break triggers stop"

version: "1.0.0"
last_updated: 2025-12-30
author: TradingBrain
notes: null
```

#### 6.2.2) range_mean_reversion_short

```yaml
strategy_id: range_mean_reversion_short
strategy_name: Range Mean Reversion (Short)
family: MEAN_REVERSION
direction: SHORT
description: |
  Fades moves to range resistance in established ranging markets.
  Expects price to revert toward range midpoint.

regime_requirements:
  allowed_regimes: [RANGING]
  min_regime_confidence: 0.70
  min_regime_strength: 0.40
  trend_direction_required: NEUTRAL
  volatility_state_allowed: [LOW, NORMAL]

setup_requirements:
  required_setups: [range_mean_reversion_short, vp_rejection_short]
  min_setup_confidence: 0.65
  setup_state_required: [TRIGGERED, ACTIVE]

options_requirements:
  iv_rank_range: [20, 60]
  iv_percentile_range: null
  term_structure_required: ANY
  skew_state_allowed: [BALANCED, CALL_HEAVY]
  min_liquidity_grade: GOOD
  max_bid_ask_spread_pct: 0.08

exclusions:
  blocked_regimes: [TRENDING_UP, TRENDING_DOWN, BREAKOUT, BREAKDOWN, VOLATILE_EXPANSION]
  blocked_setups: [breakout_momentum_long, breakout_momentum_short]
  blocked_iv_states: ["IV_RANK_EXTREME_HIGH"]
  earnings_blackout: true
  fomc_blackout: true
  major_event_blackout: true
  conflicting_strategies: [breakout_momentum_long, breakout_momentum_short, long_volatility_squeeze]

required_inputs:
  - 04_market_regime.RegimeClassification
  - 04b_setup_and_pattern_library.SetupCandidate
  - 04b_setup_and_pattern_library.RangeZone
  - 05_options_analytics.IVSnapshot
  - 05_options_analytics.OptionsLiquiditySnapshot

recommended_structures:
  - structure: PUT_DEBIT_SPREAD
    when: "Defined risk, capped downside acceptable"
    priority: 1
  - structure: LONG_PUT
    when: "IV rank < 25"
    priority: 2

dte_config:
  min_dte: 7
  max_dte: 30
  preferred_dte: 21
  expiry_rule: "Weekly acceptable"

delta_config:
  min_delta: -0.60
  max_delta: -0.35
  preferred_delta: -0.50

liquidity_config:
  min_liquidity_grade: GOOD
  max_spread_pct: 0.08
  min_open_interest: 1000
  min_volume: 200

event_config:
  earnings_blackout_days_before: 5
  earnings_blackout_days_after: 2
  fomc_blackout_days: 1
  ex_dividend_handling: AVOID

scoring_weights:
  regime_alignment: 0.30
  setup_confidence: 0.25
  iv_alignment: 0.15
  skew_alignment: 0.10
  liquidity: 0.10
  mtf_alignment: 0.10

regime_explanation: |
  At range resistance, sellers typically defend. Shorting via puts
  captures the reversion to range midpoint.

edge_source: |
  Clear resistance with rejection patterns. Limited upside risk
  in defined-risk structures.

failure_modes:
  - "Range breakout"
  - "Failed resistance becomes support"
  - "Gap through resistance"

version: "1.0.0"
last_updated: 2025-12-30
author: TradingBrain
notes: null
```

---

### 6.3) BREAKOUT Family

#### 6.3.1) breakout_momentum_long

```yaml
strategy_id: breakout_momentum_long
strategy_name: Breakout Momentum (Long)
family: BREAKOUT
direction: LONG
description: |
  Captures momentum following confirmed breakouts above resistance.
  Enters after breakout confirmation, targets extended move.

regime_requirements:
  allowed_regimes: [BREAKOUT, VOLATILE_EXPANSION]
  min_regime_confidence: 0.60
  min_regime_strength: 0.55
  trend_direction_required: UP
  volatility_state_allowed: [NORMAL, HIGH]

setup_requirements:
  required_setups: [breakout_retest_long, breakout_momentum_long]
  min_setup_confidence: 0.60
  setup_state_required: [TRIGGERED, ACTIVE]

options_requirements:
  iv_rank_range: [15, 65]
  iv_percentile_range: null
  term_structure_required: ANY
  skew_state_allowed: [BALANCED, CALL_HEAVY, PUT_HEAVY]
  min_liquidity_grade: FAIR
  max_bid_ask_spread_pct: 0.10

exclusions:
  blocked_regimes: [RANGING, TRENDING_DOWN, BREAKDOWN, CHOPPY]
  blocked_setups: [range_mean_reversion_short]
  blocked_iv_states: ["IV_RANK_EXTREME_HIGH"]
  earnings_blackout: true
  fomc_blackout: false
  major_event_blackout: false
  conflicting_strategies: [range_mean_reversion_long, range_mean_reversion_short, short_volatility_iron_condor]

required_inputs:
  - 04_market_regime.RegimeClassification
  - 04b_setup_and_pattern_library.SetupCandidate
  - 05_options_analytics.IVSnapshot
  - 05_options_analytics.OptionsLiquiditySnapshot

recommended_structures:
  - structure: CALL_DEBIT_SPREAD
    when: "IV elevated, want defined risk"
    priority: 1
  - structure: LONG_CALL
    when: "IV rank < 40, expecting strong extension"
    priority: 2

dte_config:
  min_dte: 14
  max_dte: 45
  preferred_dte: 30
  expiry_rule: "Monthly preferred for sustained moves"

delta_config:
  min_delta: 0.50
  max_delta: 0.75
  preferred_delta: 0.60

liquidity_config:
  min_liquidity_grade: FAIR
  max_spread_pct: 0.10
  min_open_interest: 500
  min_volume: 100

event_config:
  earnings_blackout_days_before: 3
  earnings_blackout_days_after: 1
  fomc_blackout_days: 0
  ex_dividend_handling: ALLOW

scoring_weights:
  regime_alignment: 0.25
  setup_confidence: 0.25
  iv_alignment: 0.15
  skew_alignment: 0.10
  liquidity: 0.15
  mtf_alignment: 0.10

regime_explanation: |
  Breakouts often lead to trending moves as shorts cover and momentum
  buyers pile in. Capturing the initial expansion offers strong R/R.

edge_source: |
  Edge from confirmed breakout with volume and regime alignment.
  Failed breakouts are filtered by setup confirmation requirements.

failure_modes:
  - "False breakout / bull trap"
  - "Breakout exhaustion quickly"
  - "IV spike on breakout reduces structure efficiency"

version: "1.0.0"
last_updated: 2025-12-30
author: TradingBrain
notes: null
```

#### 6.3.2) breakout_momentum_short

```yaml
strategy_id: breakout_momentum_short
strategy_name: Breakout Momentum (Short)
family: BREAKOUT
direction: SHORT
description: |
  Captures momentum following confirmed breakdowns below support.
  Enters after breakdown confirmation, targets extended move lower.

regime_requirements:
  allowed_regimes: [BREAKDOWN, VOLATILE_EXPANSION]
  min_regime_confidence: 0.60
  min_regime_strength: 0.55
  trend_direction_required: DOWN
  volatility_state_allowed: [NORMAL, HIGH, EXTREME]

setup_requirements:
  required_setups: [breakout_retest_short, breakout_momentum_short]
  min_setup_confidence: 0.60
  setup_state_required: [TRIGGERED, ACTIVE]

options_requirements:
  iv_rank_range: [25, 80]
  iv_percentile_range: null
  term_structure_required: ANY
  skew_state_allowed: [PUT_HEAVY, EXTREME_PUT, BALANCED]
  min_liquidity_grade: FAIR
  max_bid_ask_spread_pct: 0.12

exclusions:
  blocked_regimes: [RANGING, TRENDING_UP, BREAKOUT, CHOPPY]
  blocked_setups: [range_mean_reversion_long]
  blocked_iv_states: []
  earnings_blackout: true
  fomc_blackout: true
  major_event_blackout: true
  conflicting_strategies: [range_mean_reversion_long, range_mean_reversion_short]

required_inputs:
  - 04_market_regime.RegimeClassification
  - 04b_setup_and_pattern_library.SetupCandidate
  - 05_options_analytics.IVSnapshot
  - 05_options_analytics.OptionsLiquiditySnapshot
  - 05_options_analytics.SkewSnapshot

recommended_structures:
  - structure: PUT_DEBIT_SPREAD
    when: "IV elevated, defined risk"
    priority: 1
  - structure: LONG_PUT
    when: "IV rank < 60, expecting strong breakdown"
    priority: 2

dte_config:
  min_dte: 14
  max_dte: 45
  preferred_dte: 28
  expiry_rule: "Monthly preferred"

delta_config:
  min_delta: -0.75
  max_delta: -0.50
  preferred_delta: -0.60

liquidity_config:
  min_liquidity_grade: FAIR
  max_spread_pct: 0.12
  min_open_interest: 500
  min_volume: 100

event_config:
  earnings_blackout_days_before: 3
  earnings_blackout_days_after: 1
  fomc_blackout_days: 1
  ex_dividend_handling: ALLOW

scoring_weights:
  regime_alignment: 0.25
  setup_confidence: 0.25
  iv_alignment: 0.15
  skew_alignment: 0.10
  liquidity: 0.15
  mtf_alignment: 0.10

regime_explanation: |
  Breakdowns trigger forced selling, margin calls, and fear.
  Downside momentum often accelerates after support fails.

edge_source: |
  Fear is faster than greed. Breakdown confirmation with elevated
  put skew often leads to outsized moves.

failure_modes:
  - "Bear trap / failed breakdown"
  - "Snap-back rally"
  - "IV already at extreme limits gains"

version: "1.0.0"
last_updated: 2025-12-30
author: TradingBrain
notes: null
```

---

### 6.4) LONG_VOL Family

#### 6.4.1) long_volatility_squeeze

```yaml
strategy_id: long_volatility_squeeze
strategy_name: Long Volatility - Squeeze Release
family: LONG_VOL
direction: NEUTRAL  # Direction determined by squeeze release direction
description: |
  Captures volatility expansion following squeeze release signals.
  Uses long premium structures (straddles, strangles, or directional if direction is known).
  CRITICAL: This strategy has URGENCY requirements due to squeeze dynamics.

regime_requirements:
  allowed_regimes: [VOLATILE_EXPANSION, BREAKOUT, BREAKDOWN, RANGING]  # Squeeze can release in ranging
  min_regime_confidence: 0.50  # Lower bar; squeeze signal takes precedence
  min_regime_strength: 0.40
  trend_direction_required: ANY
  volatility_state_allowed: [LOW, NORMAL]  # Must start from compression

setup_requirements:
  required_setups: [squeeze_release]
  min_setup_confidence: 0.60
  setup_state_required: [TRIGGERED]  # Must be triggered, not just forming

options_requirements:
  iv_rank_range: [0, 50]  # Prefer entering when IV is LOW (pre-expansion)
  iv_percentile_range: [0, 60]
  term_structure_required: ANY
  skew_state_allowed: [BALANCED, PUT_HEAVY, CALL_HEAVY]
  min_liquidity_grade: GOOD  # Need good fills for time-sensitive entry
  max_bid_ask_spread_pct: 0.06  # Tighter requirement due to urgency

exclusions:
  blocked_regimes: [VOLATILE_CONTRACTION]  # Contradiction
  blocked_setups: []
  blocked_iv_states: ["IV_RANK_EXTREME_HIGH"]  # Don't buy premium at extreme IV
  earnings_blackout: false  # May trade through earnings if squeeze aligns
  fomc_blackout: false
  major_event_blackout: false
  conflicting_strategies: [short_volatility_iron_condor, short_volatility_credit_spread, short_volatility_strangle]

required_inputs:
  - 04_market_regime.RegimeClassification
  - 04b_setup_and_pattern_library.SqueezeSignal
  - 04b_setup_and_pattern_library.SqueezeState
  - 05_options_analytics.IVSnapshot
  - 05_options_analytics.OptionsLiquiditySnapshot
  - 05_options_analytics.SkewSnapshot

recommended_structures:
  - structure: LONG_STRADDLE
    when: "Direction unknown, expecting large move either way"
    priority: 1
  - structure: LONG_STRANGLE
    when: "Direction unknown, lower cost tolerance"
    priority: 2
  - structure: LONG_CALL
    when: "Squeeze direction UP with high confidence"
    priority: 3
  - structure: LONG_PUT
    when: "Squeeze direction DOWN with high confidence"
    priority: 4
  - structure: BACK_SPREAD
    when: "Direction known, want asymmetric payoff"
    priority: 5

dte_config:
  min_dte: 7
  max_dte: 35
  preferred_dte: 21
  expiry_rule: "Weekly acceptable for fast moves; monthly for more time"

delta_config:
  min_delta: null  # Depends on structure
  max_delta: null
  preferred_delta: null  # ATM for straddles

liquidity_config:
  min_liquidity_grade: GOOD
  max_spread_pct: 0.06
  min_open_interest: 1000
  min_volume: 300

event_config:
  earnings_blackout_days_before: 0  # Squeeze through earnings may be intentional
  earnings_blackout_days_after: 0
  fomc_blackout_days: 0
  ex_dividend_handling: ALLOW

scoring_weights:
  regime_alignment: 0.15  # Lower weight; squeeze signal dominates
  setup_confidence: 0.35  # Squeeze confidence is primary
  iv_alignment: 0.20     # Want low IV for entry
  skew_alignment: 0.05
  liquidity: 0.15
  mtf_alignment: 0.10

# SQUEEZE-SPECIFIC CONFIGURATION
squeeze_config:
  fast_release_urgency: IMMEDIATE
  confirmed_release_urgency: STANDARD
  direction_confidence_threshold: 0.65  # Use directional structure above this
  max_bars_since_release: 3  # Don't enter if release was > 3 bars ago
  compression_score_minimum: 0.70  # Higher compression = better setup
  promote_on_release: true  # Elevate priority when squeeze releases
  time_to_act_fast_release_seconds: 60
  time_to_act_confirmed_release_seconds: 300

regime_explanation: |
  Squeezes represent periods of extreme compression (low volatility) that
  precede expansion. Bollinger Bands inside Keltner Channels indicate
  coiling energy. Release signals (BBs expanding outside KCs) trigger
  directional moves. Long premium positions benefit from both the move
  and IV expansion.

edge_source: |
  Edge from compression-to-expansion transition. IV typically rises
  during squeeze release, benefiting long vega positions. Directional
  move provides delta gains.

failure_modes:
  - "False squeeze release (immediate re-compression)"
  - "IV already elevated, limiting vega gains"
  - "Direction wrong on directional structure"
  - "Move too small to overcome theta decay"
  - "Wide spreads on entry erode edge"

version: "1.0.0"
last_updated: 2025-12-30
author: TradingBrain
notes: |
  This strategy requires IMMEDIATE or STANDARD urgency handling.
  Downstream signal generation must respect time_to_act parameters.
```

#### 6.4.2) long_volatility_event

```yaml
strategy_id: long_volatility_event
strategy_name: Long Volatility - Pre-Event
family: LONG_VOL
direction: NEUTRAL
description: |
  Positions for IV expansion ahead of known catalysts (earnings, FOMC,
  product launches). Enters before IV expansion, exits before event
  or through event depending on configuration.

regime_requirements:
  allowed_regimes: [RANGING, VOLATILE_CONTRACTION, TRENDING_UP, TRENDING_DOWN]
  min_regime_confidence: 0.50
  min_regime_strength: 0.30
  trend_direction_required: ANY
  volatility_state_allowed: [LOW, NORMAL]

setup_requirements:
  required_setups: []  # Event-driven, not setup-driven
  min_setup_confidence: 0.0
  setup_state_required: []

options_requirements:
  iv_rank_range: [0, 45]  # Enter before IV expansion
  iv_percentile_range: [0, 50]
  term_structure_required: CONTANGO  # Front month < back month indicates event not priced
  skew_state_allowed: [BALANCED, PUT_HEAVY, CALL_HEAVY]
  min_liquidity_grade: EXCELLENT
  max_bid_ask_spread_pct: 0.05

exclusions:
  blocked_regimes: [VOLATILE_EXPANSION]  # Too late; IV already up
  blocked_setups: []
  blocked_iv_states: ["IV_RANK_HIGH", "IV_RANK_EXTREME_HIGH"]
  earnings_blackout: false  # This strategy specifically targets events
  fomc_blackout: false
  major_event_blackout: false
  conflicting_strategies: [short_volatility_iron_condor, short_volatility_strangle]

required_inputs:
  - 04_market_regime.RegimeClassification
  - 05_options_analytics.IVSnapshot
  - 05_options_analytics.TermStructureSnapshot
  - 05_options_analytics.OptionsLiquiditySnapshot
  - 01_data_ingestion.EventCalendar

recommended_structures:
  - structure: LONG_STRADDLE
    when: "Expecting large move, direction unknown"
    priority: 1
  - structure: CALENDAR_CALL
    when: "Expecting IV expansion in front month"
    priority: 2
  - structure: LONG_STRANGLE
    when: "Lower cost entry, wider expected range"
    priority: 3

dte_config:
  min_dte: 3
  max_dte: 21
  preferred_dte: 7
  expiry_rule: "Front month or weekly covering event"

delta_config:
  min_delta: null
  max_delta: null
  preferred_delta: null

liquidity_config:
  min_liquidity_grade: EXCELLENT
  max_spread_pct: 0.05
  min_open_interest: 2000
  min_volume: 500

event_config:
  earnings_blackout_days_before: 0
  earnings_blackout_days_after: 0
  fomc_blackout_days: 0
  ex_dividend_handling: AVOID

scoring_weights:
  regime_alignment: 0.10
  setup_confidence: 0.10
  iv_alignment: 0.35
  skew_alignment: 0.10
  liquidity: 0.20
  mtf_alignment: 0.15

regime_explanation: |
  Known events create predictable IV expansion patterns. Entering
  long volatility before IV expands captures vega gains even if
  directional move is minimal.

edge_source: |
  Edge from timing IV expansion cycle. Exit before event avoids
  IV crush; through event captures potential directional move.

failure_modes:
  - "IV already elevated (mispriced event timing)"
  - "Event cancelled or postponed"
  - "IV crush greater than expected"

version: "1.0.0"
last_updated: 2025-12-30
author: TradingBrain
notes: null
```

---

### 6.5) SHORT_VOL Family

#### 6.5.1) short_volatility_iron_condor

```yaml
strategy_id: short_volatility_iron_condor
strategy_name: Short Volatility - Iron Condor
family: SHORT_VOL
direction: NEUTRAL
description: |
  Sells premium in stable, ranging markets with elevated IV.
  Profits from time decay and IV contraction within defined range.

regime_requirements:
  allowed_regimes: [RANGING, VOLATILE_CONTRACTION]
  min_regime_confidence: 0.70
  min_regime_strength: 0.50
  trend_direction_required: NEUTRAL
  volatility_state_allowed: [NORMAL, HIGH]  # Need elevated IV to sell

setup_requirements:
  required_setups: []  # Range-bound, not setup-driven
  min_setup_confidence: 0.0
  setup_state_required: []

options_requirements:
  iv_rank_range: [40, 100]  # Prefer elevated IV
  iv_percentile_range: [35, 100]
  term_structure_required: ANY
  skew_state_allowed: [BALANCED]  # Avoid extreme skew for iron condors
  min_liquidity_grade: EXCELLENT
  max_bid_ask_spread_pct: 0.04

exclusions:
  blocked_regimes: [TRENDING_UP, TRENDING_DOWN, BREAKOUT, BREAKDOWN, VOLATILE_EXPANSION, CHOPPY]
  blocked_setups: [squeeze_release, breakout_momentum_long, breakout_momentum_short]
  blocked_iv_states: ["IV_RANK_EXTREME_LOW"]
  earnings_blackout: true
  fomc_blackout: true
  major_event_blackout: true
  conflicting_strategies: [long_volatility_squeeze, long_volatility_event, breakout_momentum_long, breakout_momentum_short]

required_inputs:
  - 04_market_regime.RegimeClassification
  - 04b_setup_and_pattern_library.RangeZone
  - 05_options_analytics.IVSnapshot
  - 05_options_analytics.OptionsLiquiditySnapshot
  - 05_options_analytics.SkewSnapshot

recommended_structures:
  - structure: IRON_CONDOR
    when: "Neutral bias, defined risk required"
    priority: 1
  - structure: IRON_BUTTERFLY
    when: "Tighter range, higher credit desired"
    priority: 2

dte_config:
  min_dte: 21
  max_dte: 60
  preferred_dte: 45
  expiry_rule: "30-45 DTE sweet spot for theta decay"

delta_config:
  min_delta: 0.10  # Short strikes
  max_delta: 0.25
  preferred_delta: 0.16  # ~1 standard deviation

liquidity_config:
  min_liquidity_grade: EXCELLENT
  max_spread_pct: 0.04
  min_open_interest: 2000
  min_volume: 500

event_config:
  earnings_blackout_days_before: 7
  earnings_blackout_days_after: 3
  fomc_blackout_days: 2
  ex_dividend_handling: AVOID

scoring_weights:
  regime_alignment: 0.30
  setup_confidence: 0.10
  iv_alignment: 0.25
  skew_alignment: 0.10
  liquidity: 0.15
  mtf_alignment: 0.10

regime_explanation: |
  Ranging markets with no directional catalyst allow premium sellers
  to collect theta. Elevated IV provides larger credit and cushion.

edge_source: |
  Edge from elevated IV reverting to mean. Time decay accelerates
  into expiration. Defined-risk structure limits blowup potential.

failure_modes:
  - "Breakout/breakdown exits range"
  - "IV expansion (wrong regime read)"
  - "Black swan event"
  - "Early assignment risk (dividends)"

version: "1.0.0"
last_updated: 2025-12-30
author: TradingBrain
notes: null
```

#### 6.5.2) short_volatility_credit_spread

```yaml
strategy_id: short_volatility_credit_spread
strategy_name: Short Volatility - Credit Spread
family: SHORT_VOL
direction: NEUTRAL  # Can be bullish or bearish credit spread
description: |
  Sells directional credit spreads in stable markets with modest
  directional bias. Put credit spread for bullish, call credit spread for bearish.

regime_requirements:
  allowed_regimes: [RANGING, TRENDING_UP, TRENDING_DOWN]
  min_regime_confidence: 0.60
  min_regime_strength: 0.40
  trend_direction_required: ANY
  volatility_state_allowed: [NORMAL, HIGH]

setup_requirements:
  required_setups: []
  min_setup_confidence: 0.0
  setup_state_required: []

options_requirements:
  iv_rank_range: [35, 100]
  iv_percentile_range: [30, 100]
  term_structure_required: ANY
  skew_state_allowed: [BALANCED, PUT_HEAVY, CALL_HEAVY]
  min_liquidity_grade: GOOD
  max_bid_ask_spread_pct: 0.06

exclusions:
  blocked_regimes: [BREAKOUT, BREAKDOWN, VOLATILE_EXPANSION, CHOPPY]
  blocked_setups: [squeeze_release]
  blocked_iv_states: ["IV_RANK_EXTREME_LOW"]
  earnings_blackout: true
  fomc_blackout: true
  major_event_blackout: true
  conflicting_strategies: [long_volatility_squeeze]

required_inputs:
  - 04_market_regime.RegimeClassification
  - 05_options_analytics.IVSnapshot
  - 05_options_analytics.OptionsLiquiditySnapshot

recommended_structures:
  - structure: PUT_CREDIT_SPREAD
    when: "Bullish or neutral bias"
    priority: 1
  - structure: CALL_CREDIT_SPREAD
    when: "Bearish or neutral bias"
    priority: 2

dte_config:
  min_dte: 21
  max_dte: 45
  preferred_dte: 30
  expiry_rule: "Monthly expiry preferred"

delta_config:
  min_delta: 0.15
  max_delta: 0.30
  preferred_delta: 0.20

liquidity_config:
  min_liquidity_grade: GOOD
  max_spread_pct: 0.06
  min_open_interest: 1000
  min_volume: 200

event_config:
  earnings_blackout_days_before: 5
  earnings_blackout_days_after: 2
  fomc_blackout_days: 1
  ex_dividend_handling: AVOID

scoring_weights:
  regime_alignment: 0.25
  setup_confidence: 0.15
  iv_alignment: 0.25
  skew_alignment: 0.10
  liquidity: 0.15
  mtf_alignment: 0.10

regime_explanation: |
  Credit spreads profit from time decay with directional cushion.
  Work in trending or ranging markets where move against position
  is unlikely to breach short strike.

edge_source: |
  Edge from probability of OTM expiration. Elevated IV provides
  wider strikes for same credit.

failure_modes:
  - "Strong move against position"
  - "Regime change (trend reversal)"
  - "IV continues to rise"

version: "1.0.0"
last_updated: 2025-12-30
author: TradingBrain
notes: null
```

---

### 6.6) EVENT_BLACKOUT Family

#### 6.6.1) event_blackout_standdown

```yaml
strategy_id: event_blackout_standdown
strategy_name: Event Blackout - Stand Down
family: EVENT_BLACKOUT
direction: NEUTRAL
description: |
  NOT a trading strategy. This is a BLOCKING signal that prevents
  all other strategies from activating during high-risk event windows.
  Examples: Earnings, FOMC, major macro releases, known volatility events.

regime_requirements:
  allowed_regimes: [UNKNOWN]  # Always eligible when triggered
  min_regime_confidence: 0.0
  min_regime_strength: 0.0
  trend_direction_required: ANY
  volatility_state_allowed: [LOW, NORMAL, HIGH, EXTREME]

setup_requirements:
  required_setups: []
  min_setup_confidence: 0.0
  setup_state_required: []

options_requirements:
  iv_rank_range: null
  iv_percentile_range: null
  term_structure_required: ANY
  skew_state_allowed: [BALANCED, PUT_HEAVY, CALL_HEAVY, EXTREME_PUT, EXTREME_CALL]
  min_liquidity_grade: POOR  # Not trading anyway
  max_bid_ask_spread_pct: 1.0

exclusions:
  blocked_regimes: []
  blocked_setups: []
  blocked_iv_states: []
  earnings_blackout: false  # This IS the blackout
  fomc_blackout: false
  major_event_blackout: false
  conflicting_strategies: []  # Blocks all others

required_inputs:
  - 01_data_ingestion.EventCalendar

recommended_structures: []  # No structures; not trading

dte_config:
  min_dte: 0
  max_dte: 0
  preferred_dte: 0
  expiry_rule: "N/A"

delta_config:
  min_delta: null
  max_delta: null
  preferred_delta: null

liquidity_config:
  min_liquidity_grade: POOR
  max_spread_pct: 1.0
  min_open_interest: 0
  min_volume: 0

event_config:
  earnings_blackout_days_before: 0
  earnings_blackout_days_after: 0
  fomc_blackout_days: 0
  ex_dividend_handling: ALLOW

scoring_weights:
  regime_alignment: 0.0
  setup_confidence: 0.0
  iv_alignment: 0.0
  skew_alignment: 0.0
  liquidity: 0.0
  mtf_alignment: 0.0

# BLACKOUT-SPECIFIC CONFIGURATION
blackout_config:
  earnings_blackout_hours_before: 24
  earnings_blackout_hours_after: 4
  fomc_blackout_hours_before: 4
  fomc_blackout_hours_after: 2
  cpi_blackout_hours_before: 2
  cpi_blackout_hours_after: 1
  jobs_report_blackout_hours_before: 2
  jobs_report_blackout_hours_after: 1
  blocks_all_strategies: true
  allows_exit_only: true  # Can exit existing positions, cannot enter new

regime_explanation: |
  During high-impact events, normal regime/setup analysis is unreliable.
  Standing down prevents adverse selection during unpredictable periods.

edge_source: |
  Edge from NOT trading. Avoiding adverse events preserves capital.

failure_modes:
  - "Missing event from calendar"
  - "Event timing changes"
  - "Over-blocking during benign events"

version: "1.0.0"
last_updated: 2025-12-30
author: TradingBrain
notes: |
  When this strategy is "selected", it means NO other strategies should
  execute. Downstream must interpret this as a HARD BLOCK on new entries.
```

---

## 7) Deterministic Selection Algorithm

The selection algorithm runs on every evaluation cycle and produces a ranked list of eligible strategies.

### 7.1) Algorithm Overview

```
SELECTION_ALGORITHM:

INPUT:
  - Current symbol
  - Current timestamp
  - RegimeClassification (from 04_market_regime)
  - SetupCandidates[] (from 04b_setup_and_pattern_library)
  - SqueezeState (from 04b)
  - SqueezeSignal (from 04b, if released)
  - IVSnapshot, SkewSnapshot, LiquiditySnapshot, etc. (from 05_options_analytics)
  - EventCalendar (from 01_data_ingestion)
  - Previous StrategySelectionState (for hysteresis)
  - StrategyCatalog (all defined strategies)

OUTPUT:
  - StrategySelectionState (top-N ranked strategies with scores)

ALGORITHM STEPS:

1. INPUT VALIDATION & FRESHNESS CHECK
   For each required input:
     - Check timestamp_utc against current time
     - Calculate age_ms
     - If age_ms > max_allowable_age[input_type]:
       - If hard_rejection_on_stale[input_type]: BLOCK selection
       - Else: Apply staleness_penalty to scores
     - If input is MISSING:
       - If required_for_selection[input_type]: BLOCK selection
       - Else: Degrade gracefully, log missing input

2. EVENT BLACKOUT CHECK (HARD GATE)
   Query EventCalendar for upcoming events:
     - If any event within blackout window:
       - Activate event_blackout_standdown
       - BLOCK all other strategies
       - Return StrategySelectionState with only event_blackout_standdown
       - Set blackout_active = true, blackout_reason = event description

3. FOR EACH strategy IN StrategyCatalog:

   3a. HARD GATE EVALUATION (all must pass)
       - regime_gate: Is current regime in allowed_regimes and NOT in blocked_regimes?
       - regime_confidence_gate: Is regime_confidence >= min_regime_confidence?
       - regime_strength_gate: Is regime_strength >= min_regime_strength?
       - setup_gate: Is at least one required_setup in TRIGGERED or ACTIVE state?
       - iv_gate: Is iv_rank within iv_rank_range?
       - liquidity_gate: Is liquidity_grade >= min_liquidity_grade?
       - spread_gate: Is bid_ask_spread <= max_bid_ask_spread_pct?
       - dte_gate: Are valid expirations available within [min_dte, max_dte]?
       - conflict_gate: Are no conflicting_strategies currently active?
       - earnings_gate: If earnings_blackout, is symbol outside earnings window?
       - freshness_gate: Are all required inputs within freshness bounds?

       IF any hard gate FAILS:
         - Record blocking_gate, blocking_reason
         - Mark is_eligible = false
         - CONTINUE to next strategy

   3b. SOFT SCORING (for eligible strategies)
       Initialize score components:

       regime_score = calculate_regime_alignment(
         current_regime, allowed_regimes, regime_confidence, regime_strength
       )  # 0.0 – 1.0

       setup_score = calculate_setup_confidence(
         active_setups, required_setups, setup_confidences
       )  # 0.0 – 1.0

       iv_score = calculate_iv_alignment(
         iv_rank, iv_rank_range, strategy_iv_preference
       )  # 0.0 – 1.0

       skew_score = calculate_skew_alignment(
         skew_state, skew_state_allowed, risk_reversal
       )  # 0.0 – 1.0

       liquidity_score = calculate_liquidity_score(
         liquidity_grade, spread_pct, open_interest, volume
       )  # 0.0 – 1.0

       mtf_score = calculate_mtf_alignment(
         mtf_alignment, strategy_timeframe
       )  # 0.0 – 1.0

       freshness_score = calculate_freshness_score(
         input_ages, max_ages
       )  # 0.0 – 1.0 (1.0 = perfectly fresh)

       # Weighted combination
       base_score = (
         regime_score * w_regime +
         setup_score * w_setup +
         iv_score * w_iv +
         skew_score * w_skew +
         liquidity_score * w_liquidity +
         mtf_score * w_mtf +
         freshness_score * w_freshness
       ) / sum(weights)

   3c. SQUEEZE BONUS (if applicable)
       IF strategy.family == LONG_VOL AND SqueezeSignal.is_released:
         - squeeze_bonus = 0.20 if FAST_RELEASE else 0.15 if CONFIRMED_RELEASE
         - IF SqueezeSignal.direction_confidence >= 0.65:
           - Apply direction filter to recommended structures
         - Set urgency = IMMEDIATE if FAST_RELEASE else STANDARD
         - Set time_to_act_seconds based on squeeze_config

   3d. PERSISTENCE BONUS (hysteresis)
       IF strategy_id IN previous_state.active_strategy_ids:
         - persistence_bonus = 0.05  # Small bonus for currently active
       ELSE:
         - persistence_bonus = 0.0

   3e. CONFLICT PENALTY
       FOR each active_strategy IN previous_state.active_strategy_ids:
         IF active_strategy IN strategy.conflicting_strategies:
           - conflict_penalty += 0.15
       conflict_penalty = min(conflict_penalty, 0.50)

   3f. FINAL SCORE CALCULATION
       final_score = base_score + squeeze_bonus + persistence_bonus - conflict_penalty
       final_score = clamp(final_score, 0.0, 1.0)

       Store in StrategyCandidate:
         - score = final_score
         - score_breakdown = all component scores and weights
         - is_eligible = true

4. RANKING & SELECTION
   - Sort eligible strategies by final_score DESCENDING
   - Select top-N (where N = max_concurrent_strategies, typically 3-5)
   - For each selected strategy:
     - Generate rationale string from score breakdown
     - Attach recommended_structures based on current conditions
     - Set urgency based on squeeze status or default to LOW

5. CHURN DETECTION & STABILITY
   Compare current top-N to previous top-N:
   - Count newly_promoted (in current, not in previous)
   - Count newly_demoted (in previous, not in current)
   - If churn_count > churn_threshold within time_window:
     - Apply hysteresis: prefer previous selection
     - Log stability_violation
   - Calculate stability_score = 1.0 - (churn_rate / max_churn_rate)

6. OUTPUT ASSEMBLY
   Construct StrategySelectionState:
     - top_n_strategies = selected strategies
     - n_candidates_evaluated, n_candidates_eligible, n_candidates_selected
     - active_strategy_ids = IDs of selected strategies
     - newly_promoted, newly_demoted
     - blackout_active, blackout_reason
     - squeeze_override_active = any LONG_VOL strategy got squeeze_bonus
     - selection_generation = previous + 1
     - last_change_timestamp = now if changed else previous
     - stability_score
     - provenance = full input snapshot

7. WRITE TO STORE
   - Write StrategySelectionState to 02_data_store
   - Write StrategySelectionMetrics
   - Idempotent write with selection_id as key

RETURN StrategySelectionState
```

### 7.2) Scoring Functions (Pseudocode)

```
calculate_regime_alignment(current_regime, allowed_regimes, confidence, strength):
  IF current_regime NOT IN allowed_regimes:
    RETURN 0.0

  regime_match_score = 1.0  # Perfect match
  confidence_factor = confidence  # 0.0–1.0
  strength_factor = strength  # 0.0–1.0

  RETURN regime_match_score * 0.5 + confidence_factor * 0.25 + strength_factor * 0.25


calculate_setup_confidence(active_setups, required_setups, setup_confidences):
  matching_setups = intersection(active_setups, required_setups)
  IF len(matching_setups) == 0:
    RETURN 0.0

  best_confidence = max(setup_confidences[s] for s in matching_setups)
  n_matches = len(matching_setups)

  # Bonus for multiple matching setups
  match_bonus = min(0.1 * (n_matches - 1), 0.2)

  RETURN min(best_confidence + match_bonus, 1.0)


calculate_iv_alignment(iv_rank, iv_rank_range, strategy_family):
  IF iv_rank_range IS NULL:
    RETURN 0.5  # Neutral

  min_iv, max_iv = iv_rank_range

  IF iv_rank < min_iv OR iv_rank > max_iv:
    RETURN 0.0  # Out of range (should have been hard-gated)

  # Score based on optimal position within range
  range_width = max_iv - min_iv
  position_in_range = (iv_rank - min_iv) / range_width

  IF strategy_family == LONG_VOL:
    # Prefer lower IV within range
    RETURN 1.0 - position_in_range * 0.5
  ELIF strategy_family == SHORT_VOL:
    # Prefer higher IV within range
    RETURN 0.5 + position_in_range * 0.5
  ELSE:
    # Directional: prefer middle of range
    RETURN 1.0 - abs(position_in_range - 0.5) * 2


calculate_liquidity_score(grade, spread_pct, oi, volume):
  grade_scores = {EXCELLENT: 1.0, GOOD: 0.8, FAIR: 0.6, POOR: 0.3, ILLIQUID: 0.0}
  grade_score = grade_scores[grade]

  spread_score = max(0, 1.0 - spread_pct * 10)  # 10% spread = 0 score

  oi_score = min(oi / 5000, 1.0)  # 5000 OI = max score

  volume_score = min(volume / 1000, 1.0)  # 1000 volume = max score

  RETURN grade_score * 0.4 + spread_score * 0.3 + oi_score * 0.15 + volume_score * 0.15
```

---

## 8) Squeeze Integration Requirement

### 8.1) Squeeze Detection Flow

```
SQUEEZE INTEGRATION:

04b_setup_and_pattern_library provides:
  - SqueezeState (continuous state: is_squeezing, compression_score, etc.)
  - SqueezeSignal (event: FAST_RELEASE or CONFIRMED_RELEASE when triggered)

07_strategy_selection_engine MUST:

1. MONITOR SqueezeState
   - Track compression_score trend
   - Anticipate potential release
   - Pre-position LONG_VOL strategies in candidate pool (not yet selected)

2. REACT TO SqueezeSignal
   When SqueezeSignal.release_type == FAST_RELEASE:
     - IMMEDIATELY promote long_volatility_squeeze to top of selection
     - Set urgency = IMMEDIATE
     - Set time_to_act_seconds = 60
     - Override normal scoring (squeeze_bonus = 0.25)
     - Apply direction filter if direction_confidence >= 0.65

   When SqueezeSignal.release_type == CONFIRMED_RELEASE:
     - Promote long_volatility_squeeze with squeeze_bonus = 0.20
     - Set urgency = STANDARD
     - Set time_to_act_seconds = 300
     - Apply direction filter if direction_confidence >= 0.65

3. APPLY SANITY CHECKS
   Even on squeeze release, verify:
     - liquidity_grade >= GOOD (need fast fills)
     - bid_ask_spread_pct <= 0.06 (avoid slippage)
     - iv_rank < 70 (avoid buying extreme premium)
     - bars_since_release <= 3 (don't chase old releases)

   IF sanity checks fail:
     - Reduce squeeze_bonus by 50%
     - Set urgency = LOW
     - Add warning to rationale

4. CONFLICT HANDLING
   IF short_volatility strategies are currently active:
     - Do NOT auto-exit (that's 08's job)
     - Flag conflict in StrategySelectionState
     - Add note: "Squeeze release conflicts with active short vol position"

5. TIME-TO-ACT METADATA
   Every StrategyCandidate from LONG_VOL family with squeeze involvement:
     - urgency: IMMEDIATE | STANDARD | LOW
     - time_to_act_seconds: int (null if no urgency)
     - squeeze_release_bar: int (bar index of release)
     - squeeze_direction: UP | DOWN | UNKNOWN
     - squeeze_direction_confidence: float

6. FAST_RELEASE vs CONFIRMED_RELEASE HANDLING

   FAST_RELEASE (1-bar confirmation):
     - Higher urgency, shorter time_to_act
     - May be more prone to false positives
     - Recommended: smaller position size (flagged in metadata)

   CONFIRMED_RELEASE (2-3 bar confirmation):
     - Lower urgency, longer time_to_act
     - More reliable signal
     - Recommended: standard position size
```

### 8.2) Squeeze False Positive Dampening

```
SQUEEZE FALSE POSITIVE HANDLING:

Problem: Squeezes can fire and immediately re-compress (false release).

Mitigation in 07:

1. REQUIRE minimum momentum_magnitude
   IF SqueezeSignal.momentum_magnitude < 0.5:
     - Reduce squeeze_bonus by 30%
     - Add flag: "low_momentum_release"

2. TRACK historical false positive rate (from StrategySelectionMetrics)
   IF symbol's squeeze_false_positive_rate > 0.30:
     - Reduce squeeze_bonus by 20%
     - Require CONFIRMED_RELEASE (ignore FAST_RELEASE)
     - Add flag: "high_fp_symbol"

3. REQUIRE regime alignment
   IF regime_type NOT IN [VOLATILE_EXPANSION, BREAKOUT, BREAKDOWN]:
     - If squeeze fires in RANGING regime without breakout:
       - Allow but reduce squeeze_bonus by 25%
       - Add flag: "squeeze_without_regime_confirmation"

4. COOLDOWN after false positive
   IF previous squeeze was false positive (tracked in metrics):
     - Require 5-bar cooldown before next squeeze promotion
     - During cooldown: normal scoring (no squeeze_bonus)
```

---

## 9) Data Freshness & Staleness Rules

### 9.1) Maximum Allowable Age by Input Type

| Input Type | Max Age (ms) | Hard Reject | Staleness Penalty |
|------------|--------------|-------------|-------------------|
| NormalizedQuote | 5,000 | No | 0.10 per 5s over |
| RegimeClassification | 60,000 | No | 0.05 per 30s over |
| SetupCandidate | 60,000 | No | 0.05 per 30s over |
| SqueezeState | 30,000 | No | 0.10 per 15s over |
| SqueezeSignal | 15,000 | Yes (for FAST_RELEASE) | 0.20 per 15s over |
| IVSnapshot | 300,000 | No | 0.05 per 60s over |
| SkewSnapshot | 300,000 | No | 0.05 per 60s over |
| LiquiditySnapshot | 600,000 | No | 0.03 per 120s over |
| GammaExposureProxy | 900,000 | No | 0.02 per 300s over |
| EventCalendar | 3,600,000 | No | 0.01 per 600s over |

### 9.2) Missing Input Behavior

| Input Type | Required | Behavior if Missing |
|------------|----------|---------------------|
| RegimeClassification | Yes | BLOCK selection entirely |
| NormalizedQuote | Yes | BLOCK selection entirely |
| SetupCandidate | No | Degrade: score setup-dependent strategies at 0 |
| SqueezeState | No | Degrade: disable squeeze bonus |
| SqueezeSignal | No | Degrade: no squeeze promotion |
| IVSnapshot | Yes (for options strategies) | BLOCK options strategies only |
| SkewSnapshot | No | Degrade: set skew_score = 0.5 |
| LiquiditySnapshot | Yes (for options strategies) | BLOCK options strategies only |
| GammaExposureProxy | No | Degrade: ignore GEX-dependent rules |
| EventCalendar | No | Degrade: disable event blackouts (WARN loudly) |

### 9.3) Freshness Score Calculation

```
calculate_freshness_score(input_ages, max_ages):
  penalties = []

  FOR each input_type, age_ms IN input_ages:
    max_age = max_ages[input_type]
    IF age_ms <= max_age:
      penalty = 0.0
    ELSE:
      overage = age_ms - max_age
      penalty_rate = staleness_penalty_rates[input_type]
      penalty = min(overage / 1000 * penalty_rate, 0.50)  # Cap at 0.50

    penalties.append(penalty)

  total_penalty = sum(penalties)
  total_penalty = min(total_penalty, 0.80)  # Cap total penalty at 0.80

  RETURN 1.0 - total_penalty
```

---

## 10) Write Contract to 02_data_store

### 10.1) Output Store Path

```
Store Path: processed/strategy_selection/

Directory Structure:
  processed/
    strategy_selection/
      state/
        {symbol}/
          {date}/
            selection_state_{timestamp_utc}.parquet
      eligibility/
        {symbol}/
          {date}/
            eligibility_{timestamp_utc}.parquet
      metrics/
        {symbol}/
          {date}/
            metrics_{timestamp_utc}.parquet
      provenance/
        {symbol}/
          {date}/
            provenance_{timestamp_utc}.parquet
```

### 10.2) Write Contract

```
WRITE CONTRACT (07_strategy_selection_engine → 02_data_store):

1. IDEMPOTENT WRITES
   - Each write uses selection_id as unique key
   - selection_id = SHA256(symbol + timestamp_utc + selection_generation)
   - Duplicate selection_id writes are silently ignored
   - No partial writes: all-or-nothing transaction

2. SCHEMA ENFORCEMENT
   - All outputs validated against canonical schemas before write
   - Schema version included in StrategySelectionProvenance
   - Schema mismatches trigger write rejection + error log

3. PROVENANCE REQUIREMENTS
   Every write includes:
   - Full StrategySelectionProvenance
   - Input hashes for reproducibility
   - Algorithm version
   - Processing timestamps

4. BATCHED WRITES (optional)
   - May batch multiple StrategyCandidate records
   - Batch identified by selection_id
   - Batch size <= 100 records

5. RETENTION
   - Hot tier: 7 days (for real-time queries)
   - Warm tier: 90 days (for backtesting)
   - Cold tier: Archive (for compliance)

6. WRITE RESULT
   02_data_store returns:
   - success: bool
   - records_written: int
   - storage_path: string
   - error_message: string | null

   IF success == false:
     - Log error
     - Do NOT retry immediately (backoff)
     - Flag in StrategySelectionMetrics
```

---

## 11) Rate Limiting & Fault Tolerance

### 11.1) Backoff Behavior

```
BACKOFF RULES:

1. UPSTREAM INPUT MISSING
   IF required input is missing:
     - Wait 1 second, retry
     - If still missing after 3 retries:
       - Enter DEGRADED mode
       - Continue with available inputs
       - Flag degraded_selection_events in metrics

2. UPSTREAM INPUT STALE (beyond hard reject threshold)
   IF input age > hard_reject_age:
     - Exponential backoff: 1s, 2s, 4s, 8s, max 30s
     - After max backoff:
       - Enter BLOCKED mode for that input type
       - Log circuit_breaker_triggered

3. WRITE FAILURE
   IF 02_data_store write fails:
     - Retry with exponential backoff: 100ms, 200ms, 400ms, 800ms
     - After 5 failures:
       - Buffer locally (max 1000 records)
       - Log write_buffer_active
       - Continue selection (do not block)
```

### 11.2) Circuit Breaker Logic

```
CIRCUIT BREAKER:

Triggered when:
  - Input quality score < 0.30 for > 60 seconds
  - Selection thrash rate > 5 changes per minute for > 2 minutes
  - Write failure rate > 50% for > 30 seconds

When circuit breaker triggers:
  1. FREEZE current StrategySelectionState
  2. Do NOT update selection (use cached)
  3. Log circuit_breaker_active with reason
  4. Attempt recovery every 10 seconds:
     - Check input quality
     - Check thrash rate
     - If stable for 30 seconds: resume normal operation

Recovery:
  - Gradual: first selection after recovery uses extra hysteresis
  - Full reset after 3 successful cycles
```

### 11.3) Thrash Detection & Prevention

```
THRASH DETECTION:

Definition: Selection changing too frequently without underlying condition change.

Detection:
  - Track selection_changes in rolling 60-second window
  - Calculate churn_rate = changes / minute
  - IF churn_rate > 3.0:
    - Flag thrashing
    - Apply hysteresis multiplier (2x persistence bonus)
  - IF churn_rate > 5.0:
    - Trigger circuit breaker
    - Freeze selection

Prevention:
  - Persistence bonus for currently active strategies
  - Minimum tenure: strategy must be selected for >= 2 cycles before demotion
  - Score differential threshold: new strategy must beat current by >= 0.10 to replace
```

---

## 12) Submodule Structure

```
07_strategy_selection_engine/
├── SPEC.md                          # This document
├── strategy_catalog/
│   ├── __init__.py
│   ├── catalog_loader.py            # Load strategy definitions
│   ├── catalog_validator.py         # Validate strategy definitions
│   ├── strategies/
│   │   ├── trend.yaml               # TREND family strategies
│   │   ├── mean_reversion.yaml      # MEAN_REVERSION family
│   │   ├── breakout.yaml            # BREAKOUT family
│   │   ├── long_vol.yaml            # LONG_VOL family
│   │   ├── short_vol.yaml           # SHORT_VOL family
│   │   └── blackout.yaml            # EVENT_BLACKOUT family
│   └── schema/
│       └── strategy_definition.json # JSON Schema for validation
├── eligibility_gates/
│   ├── __init__.py
│   ├── hard_gates.py                # All hard gate implementations
│   ├── regime_gate.py               # Regime-specific gates
│   ├── options_gate.py              # IV, liquidity, spread gates
│   ├── event_gate.py                # Earnings, FOMC, etc.
│   └── freshness_gate.py            # Input staleness checks
├── scoring/
│   ├── __init__.py
│   ├── score_calculator.py          # Main scoring logic
│   ├── regime_scorer.py             # Regime alignment scoring
│   ├── setup_scorer.py              # Setup confidence scoring
│   ├── options_scorer.py            # IV, skew, liquidity scoring
│   ├── mtf_scorer.py                # Multi-timeframe alignment
│   ├── freshness_scorer.py          # Freshness penalty calculation
│   ├── squeeze_bonus.py             # Squeeze-specific bonuses
│   └── persistence_bonus.py         # Hysteresis bonus
├── conflict_resolution/
│   ├── __init__.py
│   ├── conflict_detector.py         # Identify conflicting strategies
│   ├── conflict_resolver.py         # Apply penalties / block
│   └── conflict_rules.py            # Conflict rule definitions
├── selection_state_machine/
│   ├── __init__.py
│   ├── state_manager.py             # Manage StrategySelectionState
│   ├── hysteresis.py                # Thrash prevention logic
│   ├── circuit_breaker.py           # Circuit breaker implementation
│   └── cooldown_manager.py          # Strategy cooldowns
├── squeeze_integration/
│   ├── __init__.py
│   ├── squeeze_monitor.py           # Monitor SqueezeState
│   ├── squeeze_promoter.py          # Promote LONG_VOL on release
│   ├── squeeze_dampener.py          # False positive handling
│   └── urgency_calculator.py        # time_to_act calculation
├── writers/
│   ├── __init__.py
│   ├── state_writer.py              # Write StrategySelectionState
│   ├── eligibility_writer.py        # Write eligibility details
│   ├── metrics_writer.py            # Write StrategySelectionMetrics
│   └── provenance_writer.py         # Write provenance data
├── readers/
│   ├── __init__.py
│   ├── regime_reader.py             # Read from 04_market_regime
│   ├── setup_reader.py              # Read from 04b
│   ├── options_reader.py            # Read from 05_options_analytics
│   └── event_reader.py              # Read EventCalendar
├── tests/
│   ├── __init__.py
│   ├── test_hard_gates.py
│   ├── test_soft_scoring.py
│   ├── test_conflict_resolution.py
│   ├── test_squeeze_integration.py
│   ├── test_hysteresis.py
│   ├── test_circuit_breaker.py
│   ├── test_missing_inputs.py
│   ├── test_stale_inputs.py
│   ├── test_thrash_detection.py
│   └── test_end_to_end.py
└── config/
    ├── selection_config.yaml        # Tunable parameters
    ├── freshness_config.yaml        # Max ages, penalties
    ├── scoring_weights.yaml         # Default scoring weights
    └── circuit_breaker_config.yaml  # Thresholds
```

---

## 13) Validation & Failure Modes

### 13.1) Specific Failure Cases

| Failure Case | Detection | Response |
|--------------|-----------|----------|
| **Conflicting regimes across timeframes** | mtf_alignment shows opposing regimes (e.g., 5m TRENDING_UP, 1h TRENDING_DOWN) | Reduce mtf_alignment_score; flag "mtf_conflict" in rationale; prefer longer timeframe |
| **Missing options analytics** | IVSnapshot, LiquiditySnapshot not available | BLOCK all options strategies; allow equity-only strategies if any defined |
| **Bad liquidity** | liquidity_grade == ILLIQUID or spread > 15% | Hard gate failure; strategy blocked; log "liquidity_rejection" |
| **Quote staleness** | quote_age_ms > 30,000 | Apply freshness penalty; if > 60,000: BLOCK selection |
| **Thrashing** | churn_rate > 3.0 | Apply hysteresis; if > 5.0: circuit breaker |
| **Squeeze false positive** | Squeeze fires, price immediately reverses | Track in metrics; increase fp_rate; apply dampening |
| **Event calendar missing** | EventCalendar not available | WARN loudly; disable event blackouts; proceed with caution flag |
| **All strategies blocked** | Every strategy fails hard gates | Return empty selection; flag "no_eligible_strategies"; suggest review |
| **Regime UNKNOWN** | RegimeClassification.regime_type == UNKNOWN | BLOCK most strategies; allow only defensive (event_blackout_standdown) |
| **IV data extreme** | iv_rank > 95 or < 5 | Flag "extreme_iv"; adjust scoring; block inappropriate strategies |

### 13.2) Validation Rules

```
VALIDATION RULES:

1. SCHEMA VALIDATION
   - All inputs must match expected schema versions
   - All outputs must pass schema validation before write
   - Schema version mismatches logged and escalated

2. LOGICAL VALIDATION
   - is_eligible == true IMPLIES all hard gates passed
   - score >= 0.0 AND score <= 1.0
   - score_breakdown components sum correctly (within tolerance)
   - n_candidates_selected <= max_concurrent_strategies
   - active_strategy_ids matches top_n_strategies IDs

3. TEMPORAL VALIDATION
   - timestamp_utc is monotonically increasing (per symbol)
   - selection_generation is monotonically increasing
   - last_change_timestamp <= timestamp_utc

4. CONFLICT VALIDATION
   - No two strategies in active_strategy_ids have each other in conflicting_strategies
   - If conflict detected: log error, remove lower-scored strategy

5. SQUEEZE VALIDATION
   - squeeze_override_active == true IMPLIES at least one LONG_VOL strategy in selection
   - urgency == IMMEDIATE IMPLIES time_to_act_seconds < 120
   - squeeze_bonus > 0 IMPLIES SqueezeSignal was received
```

---

## 14) Minimum Acceptance Criteria

### 14.1) Strategy Specification Completeness

- [x] At least 8 strategies fully specified (10 provided: 2 TREND, 2 MEAN_REVERSION, 2 BREAKOUT, 2 LONG_VOL, 2 SHORT_VOL, 1 EVENT_BLACKOUT)
- [x] Each strategy includes: id, name, family, direction, regime_requirements, setup_requirements, options_requirements, exclusions, required_inputs, recommended_structures, dte_config, delta_config, liquidity_config, event_config, scoring_weights, regime_explanation, edge_source, failure_modes
- [x] Strategy catalog schema defined

### 14.2) Gate Implementation

- [x] Hard gates clearly separated from soft gates
- [x] Hard gate list defined (regime, confidence, strength, setup, IV, liquidity, spread, DTE, conflict, earnings, freshness)
- [x] Soft scoring components defined (regime_alignment, setup_confidence, iv_alignment, skew_alignment, liquidity, mtf_alignment, freshness)

### 14.3) Scoring

- [x] Deterministic scoring algorithm specified
- [x] Score breakdown schema defined (StrategyScoreBreakdown)
- [x] Weights per component documented
- [x] Squeeze bonus logic specified
- [x] Persistence bonus logic specified
- [x] Conflict penalty logic specified

### 14.4) Hysteresis / Persistence

- [x] Persistence bonus for active strategies (0.05)
- [x] Minimum tenure rule (2 cycles)
- [x] Score differential threshold (0.10)
- [x] Thrash detection thresholds (3.0, 5.0 per minute)
- [x] Circuit breaker logic

### 14.5) Squeeze Integration

- [x] FAST_RELEASE handling (urgency = IMMEDIATE, time_to_act = 60s, bonus = 0.25)
- [x] CONFIRMED_RELEASE handling (urgency = STANDARD, time_to_act = 300s, bonus = 0.20)
- [x] Direction confidence threshold (0.65)
- [x] Sanity checks (liquidity, spread, IV, bars_since_release)
- [x] False positive dampening

### 14.6) Test Plan

| Test Category | Test Cases |
|---------------|------------|
| **Hard Gate Tests** | Each gate tested in isolation; boundary values; combined failures |
| **Soft Scoring Tests** | Each component scored correctly; weights applied; edge cases |
| **Conflict Tests** | Conflicting strategies detected; lower score demoted; multiple conflicts |
| **Squeeze Tests** | FAST_RELEASE promotion; CONFIRMED_RELEASE promotion; direction filter; sanity check failures; false positive dampening |
| **Hysteresis Tests** | Persistence bonus applied; minimum tenure enforced; differential threshold |
| **Thrash Tests** | Detection at 3.0/min; circuit breaker at 5.0/min; recovery |
| **Missing Input Tests** | Each input type missing; graceful degradation; BLOCK when required |
| **Stale Input Tests** | Each input type stale; penalties applied; hard reject thresholds |
| **End-to-End Tests** | Full selection cycle; multiple symbols; concurrent evaluation |
| **Boundary Tests** | Edge IV values; edge DTE values; edge liquidity; exactly at thresholds |

---

## 15) Deferred Design Notes

### 15.1) Deferred to Future Modules

| Item | Deferred To | Rationale |
|------|-------------|-----------|
| Signal generation (entry/exit) | 08_signal_generation | Separation of concerns |
| Position sizing | 10_risk_sizing | Different responsibility |
| Order execution | 11_execution | Different responsibility |
| Portfolio-level constraints | 10_risk_sizing | Risk management layer |
| Cross-symbol correlation | Future module | Requires portfolio view |
| Dynamic weight optimization | Future enhancement | Start with static weights |

### 15.2) Deferred Implementation Details

| Item | Notes |
|------|-------|
| Machine learning for scoring | Start with deterministic rules; ML can optimize weights later |
| Real-time streaming integration | Initial implementation may be polling-based |
| Historical backtesting hooks | Design for it but implement separately |
| Multi-leg structure selection | Basic structures defined; complex selection deferred |

### 15.3) Known Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| No cross-symbol awareness | Cannot balance portfolio-level exposure | Defer to 10_risk_sizing |
| Static scoring weights | May not be optimal for all conditions | Tune iteratively; consider adaptive weights later |
| Single-timeframe primary | May miss MTF nuances | MTF score component provides partial mitigation |
| GEX proxy uncertainty | Dealer positioning is estimate only | Conservative use; flagged in provenance |

---

## 16) Proposed Git Commit

```
Commit ID: COMMIT-0010
Module: 07_strategy_selection_engine
Type: SPEC

Summary:
Add strategy selection engine specification defining the portfolio manager
layer that determines which strategies are eligible and ranked for trading.

Contents:
- 10 fully specified strategies across 6 families
- Strategy catalog definition format
- Deterministic selection algorithm with hard/soft gates
- Squeeze integration with FAST_RELEASE and CONFIRMED_RELEASE handling
- Hysteresis and thrash prevention
- Data freshness and staleness rules
- Circuit breaker and fault tolerance
- Complete submodule structure
- Comprehensive test plan

Upstream Dependencies:
- 04_market_regime (RegimeClassification)
- 04b_setup_and_pattern_library (SetupCandidate, SqueezeState, SqueezeSignal)
- 05_options_analytics (IVSnapshot, SkewSnapshot, LiquiditySnapshot, etc.)
- 01_data_ingestion (EventCalendar, NormalizedQuote)

Downstream Consumers:
- 08_signal_generation (future)
- 10_risk_sizing (future)

Files:
- options_trading_brain/07_strategy_selection_engine/SPEC.md

Commit Message:
[OptionsBrain] 07_strategy_selection_engine (COMMIT-0010): strategy eligibility, ranking, squeeze integration, hysteresis
```

---

**END OF SPEC**
