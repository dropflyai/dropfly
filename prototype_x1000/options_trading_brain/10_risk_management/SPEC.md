# 10_RISK_MANAGEMENT — SPEC

**Commit ID:** COMMIT-0012
**Status:** SPEC COMPLETE
**Upstream Dependencies:** 00_core, 02_data_store, 04_market_regime, 05_options_analytics, 07_strategy_selection_engine, 08_signal_generation
**Downstream Consumers:** 11_execution (future)

---

## 1) Purpose

The Risk Management module is the **gatekeeper between signals and execution**. It determines:

1. **Whether** a signal should be acted upon (risk gates)
2. **How much** to trade (position sizing)
3. **Where** to exit (stop loss and take profit plans)
4. **When** to reduce or halt trading (risk state machine)

This module ensures that no trade exceeds defined risk limits and that the overall portfolio remains within acceptable exposure bounds.

### 1.1) Core Properties

| Property | Requirement |
|----------|-------------|
| **Deterministic** | Same inputs always produce same sizing decisions |
| **Config-driven** | All limits and thresholds from configuration |
| **Defensive** | Reject signals when in doubt |
| **Bounded** | All adjustments have explicit min/max |
| **Auditable** | Full provenance for every decision |

### 1.2) Philosophy

Risk management operates with a **deny-by-default** mentality:
- Every signal must pass all hard gates
- Every sizing decision must be within bounds
- Every position must have a stop plan
- Uncertainty leads to rejection or size reduction, never increases

The module does NOT:
- Place orders
- Manage order lifecycle
- Track PnL in real-time
- Connect to brokers
- Store API credentials

---

## 2) Owns / Does Not Own

### 2.1) This Module Owns

| Responsibility | Description |
|----------------|-------------|
| **Risk limit enforcement** | Hard gates on all trades |
| **Position sizing** | Determining contract/share quantity |
| **Stop loss planning** | Calculating stop levels for each entry |
| **Take profit planning** | Calculating target levels and partial exits |
| **Exposure tracking** | Monitoring gross/net/greek exposures |
| **Risk budget management** | Tracking daily/weekly allocations |
| **Risk state machine** | NORMAL, REDUCE_ONLY, STAND_DOWN modes |
| **Risk event emission** | Logging limit breaches and mode changes |
| **Risk adjustment factors** | Scaling size based on conditions |
| **Regime-based risk scaling** | Reducing size in high volatility |

### 2.2) This Module Does NOT Own

| Responsibility | Owner |
|----------------|-------|
| Signal generation | 08_signal_generation |
| Strategy selection | 07_strategy_selection_engine |
| Options analytics | 05_options_analytics |
| Market regime classification | 04_market_regime |
| Order execution | 11_execution (future) |
| Order management | 12_order_management (future) |
| Broker integration | 11_execution (future) |
| Real-time PnL | Future module |
| Account balance queries | Config/external system |
| Fill tracking | 11_execution (future) |

---

## 3) Inputs

All inputs are consumed via 02_data_store. This module has **read-only access** to upstream data.

### 3.1) From 08_signal_generation

```
SignalIntent:
  - signal_id: string
  - symbol: string
  - timeframe: string
  - timestamp_utc: datetime
  - signal_type: enum[ENTRY_LONG, ENTRY_SHORT, EXIT_PARTIAL, EXIT_FULL, STAND_DOWN, SQUEEZE_FAST_RELEASE, SQUEEZE_CONFIRMED_RELEASE]
  - direction: enum[LONG, SHORT, NEUTRAL]
  - strategy_id: string
  - strategy_family: enum
  - strategy_score: float
  - confidence: float
  - confidence_breakdown: SignalConfidenceBreakdown
  - entry_price_zone: PriceRange
  - stop_loss_zone: PriceRange
  - target_zones: PriceRange[]
  - invalidation_price: float | null
  - recommended_structures: OptionStructure[]
  - urgency: enum[IMMEDIATE, STANDARD, LOW]
  - time_to_act_seconds: int
  - ttl_seconds: int
  - expiry_timestamp_utc: datetime
  - lifecycle_state: enum
  - provenance: SignalProvenance
  - rationale: string
  - flags: string[]
```

### 3.2) From 07_strategy_selection_engine

```
StrategyCandidate:
  - strategy_id: string
  - strategy_family: enum
  - direction: enum
  - score: float
  - constraints: StrategyConstraints
  - recommended_structures: OptionStructure[]
  - urgency: enum
  - time_to_act_seconds: int | null

StrategyConstraints:
  - min_liquidity_grade: enum
  - max_bid_ask_spread_pct: float
  - min_dte: int
  - max_dte: int
  - preferred_dte_range: tuple[int, int]
  - min_delta: float | null
  - max_delta: float | null
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
  - provenance: ProvenanceMetadata
```

### 3.4) From 05_options_analytics

```
OptionsLiquiditySnapshot:
  - symbol: string
  - timestamp_utc: datetime
  - avg_bid_ask_spread_pct: float
  - atm_spread_pct: float
  - total_open_interest: int
  - atm_open_interest: int
  - avg_volume: int
  - liquidity_grade: enum[EXCELLENT, GOOD, FAIR, POOR, ILLIQUID]

IVSnapshot:
  - symbol: string
  - timestamp_utc: datetime
  - atm_iv: float
  - iv_rank: float
  - iv_percentile: float

OptionGreeksSnapshot:
  - symbol: string
  - contract_ref: OptionContractRef
  - timestamp_utc: datetime
  - delta: float
  - gamma: float
  - vega: float
  - theta: float
  - iv: float
```

### 3.5) From 04b_setup_and_pattern_library

```
SetupCandidate:
  - symbol: string
  - timeframe: string
  - entry_zone: PriceRange
  - stop_zone: PriceRange
  - target_zones: PriceRange[]
  - invalidation_price: float | null
  - confidence: float
```

### 3.6) From 00_core

```
Clock:
  - now_utc(): datetime

ConfigContract:
  - get(key): any
  - get_float(key): float
  - get_int(key): int
  - get_bool(key): bool

Logger:
  - log(level, message, context)
```

### 3.7) From Configuration (External)

```
AccountConfig:
  - account_balance: float          # Total account value (config-driven, not live)
  - buying_power: float             # Available buying power
  - margin_used: float              # Current margin utilization
  - currency: string                # Account currency (USD default)

RiskConfig:
  - max_daily_loss_pct: float       # e.g., 0.02 (2%)
  - max_weekly_loss_pct: float      # e.g., 0.05 (5%)
  - max_drawdown_pct: float         # e.g., 0.10 (10%)
  - max_per_trade_risk_pct: float   # e.g., 0.01 (1%)
  - max_open_positions: int         # e.g., 5
  - max_symbol_concentration_pct: float  # e.g., 0.20 (20%)
  - max_portfolio_delta: float      # e.g., 100
  - max_portfolio_gamma: float      # e.g., 50
  - max_portfolio_vega: float       # e.g., 500
  - max_portfolio_theta: float      # e.g., -200
  - min_position_size: int          # e.g., 1 contract
  - max_position_size: int          # e.g., 50 contracts
  - earnings_blackout_hours: int    # e.g., 24
  - fomc_blackout_hours: int        # e.g., 4
```

### 3.8) From 01_data_ingestion (if available)

```
EventCalendar:
  - symbol: string
  - event_type: enum[EARNINGS, DIVIDEND, SPLIT, FOMC, CPI, JOBS, OTHER]
  - event_timestamp_utc: datetime
  - is_before_market: bool
  - is_after_market: bool
```

---

## 4) Canonical Output Schemas

All outputs are written to 02_data_store with full provenance.

### 4.1) RiskLimits

Defines the maximum allowed risk at account, symbol, and strategy levels.

```
RiskLimits:
  # Identity
  - limits_id: string              # REQUIRED. Unique identifier
  - timestamp_utc: datetime        # REQUIRED. When limits were computed
  - config_version: string         # REQUIRED. Config version used

  # Account-Level Limits
  - account_max_daily_loss: float  # REQUIRED. Dollar amount
  - account_max_daily_loss_pct: float  # REQUIRED. As percentage
  - account_max_weekly_loss: float # REQUIRED
  - account_max_weekly_loss_pct: float
  - account_max_drawdown: float    # REQUIRED
  - account_max_drawdown_pct: float
  - account_max_open_positions: int  # REQUIRED

  # Per-Symbol Limits
  - per_symbol_max_exposure_pct: float  # REQUIRED. Max % of account per symbol
  - per_symbol_max_positions: int  # REQUIRED
  - per_symbol_max_delta: float    # REQUIRED
  - per_symbol_max_contracts: int  # REQUIRED

  # Per-Strategy Limits
  - per_strategy_max_allocation_pct: float  # REQUIRED
  - per_strategy_max_concurrent: int  # REQUIRED

  # Per-Trade Limits
  - per_trade_max_risk_pct: float  # REQUIRED. Max risk per single trade
  - per_trade_max_risk_dollars: float  # REQUIRED
  - per_trade_min_contracts: int   # REQUIRED
  - per_trade_max_contracts: int   # REQUIRED

  # Greek Limits (Portfolio-Level)
  - portfolio_max_delta: float     # REQUIRED
  - portfolio_max_gamma: float     # REQUIRED
  - portfolio_max_vega: float      # REQUIRED
  - portfolio_max_theta: float     # REQUIRED. Usually negative limit

  # Liquidity Limits
  - min_liquidity_grade: enum      # REQUIRED. EXCELLENT, GOOD, FAIR, POOR
  - max_bid_ask_spread_pct: float  # REQUIRED
  - min_open_interest: int         # REQUIRED
  - min_volume: int                # REQUIRED

  # Provenance
  - provenance: RiskProvenance     # REQUIRED
```

### 4.2) RiskBudget

Tracks allocation and utilization of risk budget.

```
RiskBudget:
  # Identity
  - budget_id: string              # REQUIRED
  - symbol: string | null          # OPTIONAL. null = portfolio-level
  - timestamp_utc: datetime        # REQUIRED
  - period: enum[DAILY, WEEKLY, MONTHLY]  # REQUIRED

  # Period Boundaries
  - period_start: datetime         # REQUIRED
  - period_end: datetime           # REQUIRED

  # Budget Allocation
  - total_budget_dollars: float    # REQUIRED
  - total_budget_pct: float        # REQUIRED. As % of account

  # Utilization
  - used_budget_dollars: float     # REQUIRED
  - used_budget_pct: float         # REQUIRED
  - remaining_budget_dollars: float  # REQUIRED
  - remaining_budget_pct: float    # REQUIRED
  - utilization_ratio: float       # REQUIRED. used / total (0.0–1.0)

  # Per-Strategy Breakdown
  - strategy_allocations: StrategyAllocation[]  # REQUIRED

  # Status
  - is_exhausted: bool             # REQUIRED. utilization_ratio >= 1.0
  - is_warning: bool               # REQUIRED. utilization_ratio >= 0.75
  - warning_threshold_pct: float   # REQUIRED

  # Provenance
  - provenance: RiskProvenance     # REQUIRED

StrategyAllocation:
  - strategy_family: enum          # REQUIRED
  - allocated_pct: float           # REQUIRED
  - used_pct: float                # REQUIRED
  - remaining_pct: float           # REQUIRED
```

### 4.3) PositionSizingDecision

The primary output for each signal that requires sizing.

```
PositionSizingDecision:
  # Identity
  - decision_id: string            # REQUIRED. SHA256(signal_id + timestamp)
  - signal_id: string              # REQUIRED. Links to SignalIntent
  - symbol: string                 # REQUIRED
  - timeframe: string              # REQUIRED
  - timestamp_utc: datetime        # REQUIRED

  # Decision
  - is_approved: bool              # REQUIRED. True if sizing allowed
  - rejection_reason: string | null  # OPTIONAL. If not approved
  - rejection_gate: string | null  # OPTIONAL. Which gate rejected

  # Sizing (if approved)
  - quantity: int                  # REQUIRED if approved. Contracts/shares
  - quantity_type: enum[CONTRACTS, SHARES]  # REQUIRED
  - notional_value: float          # REQUIRED. Dollar value of position
  - risk_amount: float             # REQUIRED. Max loss in dollars
  - risk_pct: float                # REQUIRED. Risk as % of account

  # Sizing Formula
  - base_size: int                 # REQUIRED. Before adjustments
  - adjustment_factors: RiskAdjustmentFactors  # REQUIRED
  - adjusted_size: float           # REQUIRED. After adjustments (before rounding)
  - final_size: int                # REQUIRED. After rounding and bounds

  # Bounds Applied
  - size_before_bounds: int        # REQUIRED
  - min_size_applied: bool         # REQUIRED
  - max_size_applied: bool         # REQUIRED
  - rounding_direction: enum[UP, DOWN, NEAREST]  # REQUIRED

  # Stop/TP Plans
  - stop_loss_plan: StopLossPlan   # REQUIRED for ENTRY signals
  - take_profit_plan: TakeProfitPlan  # REQUIRED for ENTRY signals

  # Risk Impact
  - projected_delta_impact: float  # REQUIRED
  - projected_gamma_impact: float  # REQUIRED
  - projected_vega_impact: float   # REQUIRED
  - projected_theta_impact: float  # REQUIRED
  - post_trade_exposure: ExposureSnapshot  # REQUIRED

  # Provenance
  - provenance: RiskProvenance     # REQUIRED

  # Metadata
  - urgency: enum[IMMEDIATE, STANDARD, LOW]  # REQUIRED
  - time_to_act_seconds: int       # REQUIRED
  - expires_at: datetime           # REQUIRED
```

### 4.4) ExposureSnapshot

Current portfolio exposure across all dimensions.

```
ExposureSnapshot:
  # Identity
  - snapshot_id: string            # REQUIRED
  - timestamp_utc: datetime        # REQUIRED

  # Gross Exposure
  - gross_exposure_dollars: float  # REQUIRED. Sum of absolute position values
  - gross_exposure_pct: float      # REQUIRED. As % of account

  # Net Exposure
  - net_exposure_dollars: float    # REQUIRED. Long - Short
  - net_exposure_pct: float        # REQUIRED
  - net_exposure_direction: enum[LONG, SHORT, NEUTRAL]  # REQUIRED

  # Greek Exposures (Portfolio Level)
  - total_delta: float             # REQUIRED
  - total_gamma: float             # REQUIRED
  - total_vega: float              # REQUIRED
  - total_theta: float             # REQUIRED

  # Greek Utilization (vs Limits)
  - delta_utilization_pct: float   # REQUIRED. |total_delta| / max_delta
  - gamma_utilization_pct: float   # REQUIRED
  - vega_utilization_pct: float    # REQUIRED
  - theta_utilization_pct: float   # REQUIRED

  # Position Counts
  - open_positions: int            # REQUIRED
  - open_positions_long: int       # REQUIRED
  - open_positions_short: int      # REQUIRED

  # Per-Symbol Breakdown
  - symbol_exposures: SymbolExposure[]  # REQUIRED

  # Concentration
  - largest_position_pct: float    # REQUIRED. Largest single position as % of account
  - top_3_concentration_pct: float # REQUIRED. Top 3 positions as % of account

  # Status Flags
  - is_within_limits: bool         # REQUIRED
  - breached_limits: string[]      # REQUIRED. List of breached limit names

  # Provenance
  - provenance: RiskProvenance     # REQUIRED

SymbolExposure:
  - symbol: string                 # REQUIRED
  - position_count: int            # REQUIRED
  - net_delta: float               # REQUIRED
  - net_gamma: float               # REQUIRED
  - net_vega: float                # REQUIRED
  - net_theta: float               # REQUIRED
  - exposure_dollars: float        # REQUIRED
  - exposure_pct: float            # REQUIRED
```

### 4.5) StopLossPlan

Defines how and where to exit a losing position.

```
StopLossPlan:
  # Identity
  - plan_id: string                # REQUIRED
  - signal_id: string              # REQUIRED. Links to SignalIntent
  - symbol: string                 # REQUIRED
  - timestamp_utc: datetime        # REQUIRED

  # Direction Context
  - position_direction: enum[LONG, SHORT]  # REQUIRED

  # Hard Stop (Always Required)
  - hard_stop_price: float         # REQUIRED. Absolute must-exit price
  - hard_stop_type: enum[FIXED, ATR_BASED, STRUCTURE_BASED]  # REQUIRED
  - hard_stop_distance_pct: float  # REQUIRED. Distance from entry as %
  - hard_stop_rationale: string    # REQUIRED

  # Soft Stop (Optional)
  - soft_stop_price: float | null  # OPTIONAL. Alert/warning level
  - soft_stop_type: enum[FIXED, ATR_BASED, STRUCTURE_BASED] | null
  - soft_stop_action: enum[ALERT, REDUCE_50, REDUCE_25] | null

  # Time Stop (Optional)
  - time_stop_enabled: bool        # REQUIRED
  - time_stop_bars: int | null     # OPTIONAL. Exit after N bars
  - time_stop_timestamp: datetime | null  # OPTIONAL. Exit at specific time
  - time_stop_session_end: bool    # REQUIRED. Exit at session end?

  # Invalidation Stop
  - invalidation_price: float | null  # OPTIONAL. From SignalIntent
  - invalidation_stop_enabled: bool  # REQUIRED

  # ATR Parameters (if ATR-based)
  - atr_value: float | null        # OPTIONAL
  - atr_multiplier: float | null   # OPTIONAL. e.g., 2.0

  # Structure Parameters (if structure-based)
  - structure_level: float | null  # OPTIONAL. Support/resistance level
  - structure_type: string | null  # OPTIONAL. e.g., "swing_low", "VAL", "POC"
  - structure_buffer_pct: float | null  # OPTIONAL. Buffer beyond structure

  # Risk Calculation
  - max_loss_per_contract: float   # REQUIRED
  - max_loss_total: float          # REQUIRED
  - max_loss_pct: float            # REQUIRED

  # Trailing Stop (Optional)
  - trailing_stop_enabled: bool    # REQUIRED
  - trailing_stop_activation_pct: float | null  # OPTIONAL. Activate after X% profit
  - trailing_stop_distance_pct: float | null  # OPTIONAL

  # Provenance
  - provenance: RiskProvenance     # REQUIRED
```

### 4.6) TakeProfitPlan

Defines profit targets and exit strategy.

```
TakeProfitPlan:
  # Identity
  - plan_id: string                # REQUIRED
  - signal_id: string              # REQUIRED
  - symbol: string                 # REQUIRED
  - timestamp_utc: datetime        # REQUIRED

  # Direction Context
  - position_direction: enum[LONG, SHORT]  # REQUIRED

  # Targets
  - targets: ProfitTarget[]        # REQUIRED. At least one target

  # Trailing Take Profit (Optional)
  - trailing_tp_enabled: bool      # REQUIRED
  - trailing_tp_activation_pct: float | null  # OPTIONAL
  - trailing_tp_distance_pct: float | null

  # Time-Based Exit
  - max_hold_bars: int | null      # OPTIONAL
  - max_hold_timestamp: datetime | null
  - exit_before_event: bool        # REQUIRED. Exit before earnings/FOMC?
  - event_exit_hours_before: int   # REQUIRED if exit_before_event

  # Partial Exit Strategy
  - partial_exit_enabled: bool     # REQUIRED
  - partial_exit_schedule: PartialExit[]  # OPTIONAL

  # R-Multiple Targets
  - r_multiple_1: float            # REQUIRED. First target as R multiple
  - r_multiple_2: float | null     # OPTIONAL
  - r_multiple_3: float | null     # OPTIONAL

  # Provenance
  - provenance: RiskProvenance     # REQUIRED

ProfitTarget:
  - target_number: int             # REQUIRED. 1, 2, 3, etc.
  - target_price: float            # REQUIRED
  - target_type: enum[FIXED, ATR_BASED, STRUCTURE_BASED, R_MULTIPLE]  # REQUIRED
  - target_distance_pct: float     # REQUIRED. Distance from entry
  - exit_pct: float                # REQUIRED. % of position to exit (e.g., 0.50)
  - r_multiple: float | null       # OPTIONAL
  - structure_type: string | null  # OPTIONAL. e.g., "resistance", "VAH"
  - rationale: string              # REQUIRED

PartialExit:
  - trigger_pct: float             # REQUIRED. Trigger at X% profit
  - exit_pct: float                # REQUIRED. Exit Y% of position
  - remaining_after: float         # REQUIRED. Position remaining after exit
```

### 4.7) RiskAdjustmentFactors

All modifiers applied to base position size.

```
RiskAdjustmentFactors:
  # Identity
  - factors_id: string             # REQUIRED
  - signal_id: string              # REQUIRED
  - timestamp_utc: datetime        # REQUIRED

  # Confidence Adjustment
  - signal_confidence: float       # REQUIRED. From SignalIntent
  - confidence_multiplier: float   # REQUIRED. 0.5–1.5

  # Regime Adjustment
  - regime_type: enum              # REQUIRED
  - regime_confidence: float       # REQUIRED
  - volatility_state: enum         # REQUIRED
  - regime_multiplier: float       # REQUIRED. 0.25–1.0

  # Liquidity Adjustment
  - liquidity_grade: enum          # REQUIRED
  - spread_pct: float              # REQUIRED
  - liquidity_multiplier: float    # REQUIRED. 0.5–1.0

  # Urgency Adjustment (Squeeze)
  - urgency: enum                  # REQUIRED
  - is_squeeze_signal: bool        # REQUIRED
  - urgency_multiplier: float      # REQUIRED. 0.75–1.25

  # Event Risk Adjustment
  - event_proximity_hours: int | null  # OPTIONAL
  - event_type: enum | null        # OPTIONAL
  - event_multiplier: float        # REQUIRED. 0.0–1.0

  # Drawdown Adjustment
  - current_drawdown_pct: float    # REQUIRED
  - drawdown_multiplier: float     # REQUIRED. 0.5–1.0

  # Streak Adjustment
  - recent_win_rate: float | null  # OPTIONAL
  - streak_multiplier: float       # REQUIRED. 0.8–1.2

  # Combined Multiplier
  - combined_multiplier: float     # REQUIRED. Product of all multipliers
  - combined_multiplier_clamped: float  # REQUIRED. After min/max bounds

  # Bounds
  - min_multiplier: float          # REQUIRED. Config-driven (e.g., 0.25)
  - max_multiplier: float          # REQUIRED. Config-driven (e.g., 1.5)

  # Provenance
  - provenance: RiskProvenance     # REQUIRED
```

### 4.8) RiskState

Current risk mode and status of the system.

```
RiskState:
  # Identity
  - state_id: string               # REQUIRED
  - timestamp_utc: datetime        # REQUIRED

  # Current Mode
  - risk_mode: enum[NORMAL, REDUCE_ONLY, STAND_DOWN]  # REQUIRED
  - mode_since: datetime           # REQUIRED. When current mode started
  - mode_reason: string            # REQUIRED

  # Mode History (last 10)
  - mode_history: ModeTransition[] # REQUIRED

  # Limit Utilization
  - daily_loss_used_pct: float     # REQUIRED
  - weekly_loss_used_pct: float    # REQUIRED
  - current_drawdown_pct: float    # REQUIRED

  # Active Flags
  - active_risk_flags: string[]    # REQUIRED. e.g., ["high_volatility", "near_daily_limit"]

  # Exposure Status
  - current_exposure: ExposureSnapshot  # REQUIRED
  - exposure_ok: bool              # REQUIRED

  # Circuit Breaker Status
  - circuit_breaker_active: bool   # REQUIRED
  - circuit_breaker_reason: string | null

  # Kill Switch
  - kill_switch_active: bool       # REQUIRED

  # Recovery
  - recovery_eligible: bool        # REQUIRED. Can transition to NORMAL?
  - recovery_conditions: string[]  # REQUIRED. What must be true to recover

  # Provenance
  - provenance: RiskProvenance     # REQUIRED

ModeTransition:
  - from_mode: enum                # REQUIRED
  - to_mode: enum                  # REQUIRED
  - transition_at: datetime        # REQUIRED
  - reason: string                 # REQUIRED
  - trigger: string                # REQUIRED. What triggered transition
```

### 4.9) RiskEvent

Logged when significant risk events occur.

```
RiskEvent:
  # Identity
  - event_id: string               # REQUIRED
  - timestamp_utc: datetime        # REQUIRED

  # Event Type
  - event_type: enum               # REQUIRED. One of:
      LIMIT_BREACH                 # A risk limit was hit
      LIMIT_WARNING                # Approaching a limit (75%+)
      MODE_CHANGE                  # Risk mode transition
      KILL_SWITCH_ACTIVATED        # Manual or automatic kill
      KILL_SWITCH_DEACTIVATED      # Kill switch released
      REDUCE_ONLY_ACTIVATED        # Entered reduce-only mode
      STAND_DOWN_ACTIVATED         # Entered stand-down mode
      NORMAL_RESTORED              # Returned to normal mode
      SIZING_REJECTED              # A sizing request was rejected
      EXPOSURE_WARNING             # Exposure approaching limits
      DRAWDOWN_WARNING             # Drawdown threshold hit
      VOLATILITY_SPIKE             # Sudden volatility increase
      DATA_STALE                   # Input data became stale
      EVENT_BLACKOUT_START         # Earnings/FOMC blackout started
      EVENT_BLACKOUT_END           # Blackout ended

  # Details
  - severity: enum[INFO, WARNING, CRITICAL]  # REQUIRED
  - symbol: string | null          # OPTIONAL. If symbol-specific
  - description: string            # REQUIRED
  - current_value: float | null    # OPTIONAL. Current metric value
  - limit_value: float | null      # OPTIONAL. Limit that was hit/approached
  - breach_pct: float | null       # OPTIONAL. How much over limit

  # Action Taken
  - action_taken: string           # REQUIRED. What the system did
  - requires_attention: bool       # REQUIRED

  # Related IDs
  - signal_id: string | null       # OPTIONAL. If related to a signal
  - decision_id: string | null     # OPTIONAL. If related to a sizing decision

  # Provenance
  - provenance: RiskProvenance     # REQUIRED
```

### 4.10) RiskProvenance

Full lineage for risk decisions.

```
RiskProvenance:
  # Identity
  - provenance_id: string          # REQUIRED
  - timestamp_utc: datetime        # REQUIRED

  # Processing Time
  - processing_started_utc: datetime  # REQUIRED
  - processing_ended_utc: datetime    # REQUIRED
  - processing_duration_ms: int       # REQUIRED

  # Input Hashes
  - signal_hash: string            # REQUIRED
  - signal_timestamp: datetime
  - regime_hash: string            # REQUIRED
  - regime_timestamp: datetime
  - options_hash: string | null    # OPTIONAL
  - options_timestamp: datetime | null
  - exposure_hash: string          # REQUIRED
  - exposure_timestamp: datetime

  # Config Versions
  - risk_config_version: string    # REQUIRED
  - limits_config_version: string  # REQUIRED
  - sizing_algorithm_version: string  # REQUIRED

  # Account Snapshot
  - account_balance_used: float    # REQUIRED
  - account_balance_timestamp: datetime  # REQUIRED

  # Input Freshness
  - input_ages_ms: dict[string, int]  # REQUIRED
  - stale_inputs: string[]         # REQUIRED
  - freshness_ok: bool             # REQUIRED
```

### 4.11) RiskMetrics

Operational metrics for monitoring.

```
RiskMetrics:
  # Identity
  - timestamp_utc: datetime        # REQUIRED
  - window_start: datetime         # REQUIRED
  - window_end: datetime           # REQUIRED
  - window_duration_seconds: int   # REQUIRED

  # Sizing Decisions
  - sizing_requests: int           # REQUIRED
  - sizing_approved: int           # REQUIRED
  - sizing_rejected: int           # REQUIRED
  - rejection_rate: float          # REQUIRED

  # Rejections by Reason
  - rejections_by_gate: dict[string, int]  # REQUIRED

  # Limit Breaches
  - limit_breaches: int            # REQUIRED
  - breaches_by_type: dict[string, int]  # REQUIRED

  # Mode Time
  - time_in_normal_pct: float      # REQUIRED
  - time_in_reduce_only_pct: float # REQUIRED
  - time_in_stand_down_pct: float  # REQUIRED
  - mode_transitions: int          # REQUIRED

  # Average Sizing
  - avg_position_size: float       # REQUIRED
  - avg_risk_per_trade_pct: float  # REQUIRED
  - avg_adjustment_multiplier: float  # REQUIRED

  # Drawdown
  - max_drawdown_pct: float        # REQUIRED
  - current_drawdown_pct: float    # REQUIRED
  - drawdown_duration_bars: int    # REQUIRED

  # Latency
  - avg_sizing_latency_ms: float   # REQUIRED
  - p95_sizing_latency_ms: float   # REQUIRED
  - max_sizing_latency_ms: float   # REQUIRED

  # Provenance
  - provenance: RiskProvenance     # REQUIRED
```

---

## 5) Deterministic Sizing Algorithm

### 5.1) Algorithm Overview

```
POSITION_SIZING_ALGORITHM:

INPUT:
  - SignalIntent from 08_signal_generation
  - RegimeClassification from 04_market_regime
  - OptionsLiquiditySnapshot from 05_options_analytics
  - StrategyConstraints from 07_strategy_selection_engine
  - RiskLimits from configuration
  - RiskBudget (current period)
  - ExposureSnapshot (current)
  - AccountConfig from configuration

OUTPUT:
  - PositionSizingDecision (approved/rejected with quantity)

ALGORITHM STEPS:

1. VALIDATE INPUTS
   - Check SignalIntent.lifecycle_state == ACTIVE
   - Check signal not expired (now < expiry_timestamp_utc)
   - Check all required inputs present
   - Check input freshness (see freshness rules)

   IF validation fails:
     RETURN PositionSizingDecision(is_approved=false, rejection_reason=...)

2. RUN HARD GATES (Section 6)
   FOR each hard_gate in HARD_GATES:
     result = evaluate_gate(hard_gate, inputs)
     IF result.failed:
       RETURN PositionSizingDecision(
         is_approved=false,
         rejection_reason=result.reason,
         rejection_gate=hard_gate.name
       )

3. CALCULATE BASE SIZE
   # Determine max risk per trade
   max_risk_dollars = min(
     account_balance * per_trade_max_risk_pct,
     remaining_daily_budget,
     remaining_weekly_budget
   )

   # Calculate risk per contract/share
   IF signal.stop_loss_zone is present:
     stop_distance = abs(entry_price - stop_price)
   ELSE:
     # Use ATR-based default
     stop_distance = atr_value * default_atr_multiplier

   risk_per_unit = stop_distance * contract_multiplier  # For options: * 100

   # Base size
   base_size = floor(max_risk_dollars / risk_per_unit)

4. APPLY ADJUSTMENT FACTORS (Section 7)
   factors = compute_adjustment_factors(inputs)
   adjusted_size = base_size * factors.combined_multiplier_clamped

5. APPLY BOUNDS
   # Minimum size
   IF adjusted_size < min_position_size:
     IF allow_below_minimum:
       final_size = min_position_size
       min_size_applied = true
     ELSE:
       RETURN PositionSizingDecision(is_approved=false, rejection_reason="below_minimum_size")

   # Maximum size
   IF adjusted_size > max_position_size:
     final_size = max_position_size
     max_size_applied = true
   ELSE:
     final_size = adjusted_size

   # Rounding
   final_size = round_size(final_size, rounding_direction)

6. VALIDATE POST-TRADE EXPOSURE
   projected_exposure = calculate_post_trade_exposure(final_size, current_exposure)

   IF projected_exposure.breached_limits is not empty:
     # Reduce size to fit within limits
     final_size = reduce_to_fit_limits(final_size, projected_exposure, limits)

     IF final_size < min_position_size:
       RETURN PositionSizingDecision(is_approved=false, rejection_reason="would_breach_exposure_limits")

7. CREATE STOP/TP PLANS
   stop_loss_plan = create_stop_loss_plan(signal, final_size, inputs)
   take_profit_plan = create_take_profit_plan(signal, final_size, inputs)

8. CONSTRUCT OUTPUT
   decision = PositionSizingDecision(
     is_approved=true,
     quantity=final_size,
     risk_amount=final_size * risk_per_unit,
     risk_pct=(final_size * risk_per_unit) / account_balance,
     base_size=base_size,
     adjustment_factors=factors,
     stop_loss_plan=stop_loss_plan,
     take_profit_plan=take_profit_plan,
     projected_exposure=projected_exposure,
     ...
   )

   RETURN decision
```

### 5.2) Size Calculation Formula

```
SIZING FORMULA:

Given:
  - account_balance: Total account value
  - per_trade_max_risk_pct: Maximum risk per trade (e.g., 0.01 = 1%)
  - entry_price: Expected entry price
  - stop_price: Stop loss price
  - contract_multiplier: 100 for options, 1 for shares
  - combined_multiplier: Product of all adjustment factors

Formula:
  max_risk_dollars = account_balance * per_trade_max_risk_pct
  stop_distance = |entry_price - stop_price|
  risk_per_contract = stop_distance * contract_multiplier

  base_size = floor(max_risk_dollars / risk_per_contract)
  adjusted_size = base_size * combined_multiplier
  final_size = clamp(round(adjusted_size), min_size, max_size)

Example:
  account_balance = $100,000
  per_trade_max_risk_pct = 0.01 (1%)
  entry_price = $50.00
  stop_price = $48.00
  contract_multiplier = 100 (options)
  combined_multiplier = 0.80 (reduced due to high vol)

  max_risk_dollars = $100,000 * 0.01 = $1,000
  stop_distance = |$50.00 - $48.00| = $2.00
  risk_per_contract = $2.00 * 100 = $200

  base_size = floor($1,000 / $200) = 5 contracts
  adjusted_size = 5 * 0.80 = 4.0 contracts
  final_size = 4 contracts
```

### 5.3) Rounding Rules

```
ROUNDING RULES:

rounding_direction:
  - DOWN: Always round down (conservative, default)
  - NEAREST: Round to nearest integer
  - UP: Round up (never used for risk, only for specific overrides)

Default: DOWN

Special cases:
  - If final_size < 1 after rounding: Check min_size, may reject
  - If final_size rounds to 0: Reject with "size_rounds_to_zero"
  - For fractional shares (if supported): Allow 0.01 precision
```

### 5.4) Reject Conditions

```
REJECT CONDITIONS:

Signal-Level Rejects:
  - signal.lifecycle_state != ACTIVE
  - signal expired (now >= expiry_timestamp_utc)
  - signal.signal_type == STAND_DOWN
  - signal.confidence < min_confidence_threshold

Risk-Level Rejects:
  - daily_loss_limit reached
  - weekly_loss_limit reached
  - max_drawdown reached
  - max_open_positions reached
  - symbol_concentration exceeded
  - risk_mode == STAND_DOWN

Sizing Rejects:
  - calculated size < min_position_size
  - calculated size rounds to 0
  - post_trade_exposure breaches limits
  - stop_distance <= 0 (invalid stop)

Data Quality Rejects:
  - stale inputs (beyond hard threshold)
  - missing required inputs
  - quote spread > max_spread

Event Rejects:
  - within earnings blackout window
  - within FOMC blackout window
  - kill_switch active
```

---

## 6) Risk Guardrails (HARD Gates)

All hard gates must pass. Any failure results in immediate rejection.

### 6.1) Gate Definitions

```
HARD GATES:

1. KILL_SWITCH_GATE
   Check: ConfigContract.get_bool("risk.kill_switch") == false
   Check: RiskState.kill_switch_active == false
   Reject reason: "kill_switch_active"

2. RISK_MODE_GATE
   Check: RiskState.risk_mode != STAND_DOWN
   For REDUCE_ONLY mode:
     - Allow EXIT signals only
     - Reject ENTRY signals
   Reject reason: "risk_mode_stand_down" or "reduce_only_no_entries"

3. DAILY_LOSS_GATE
   Check: daily_loss_used_pct < 100%
   Check: remaining_daily_budget > proposed_risk
   Reject reason: "daily_loss_limit_reached"

4. WEEKLY_LOSS_GATE
   Check: weekly_loss_used_pct < 100%
   Reject reason: "weekly_loss_limit_reached"

5. DRAWDOWN_GATE
   Check: current_drawdown_pct < max_drawdown_pct
   Reject reason: "max_drawdown_reached"

6. MAX_POSITIONS_GATE
   Check: open_positions < max_open_positions
   Reject reason: "max_positions_reached"

7. SYMBOL_CONCENTRATION_GATE
   Check: symbol_exposure_pct < max_symbol_concentration_pct
   Reject reason: "symbol_concentration_exceeded"

8. GREEK_EXPOSURE_GATE
   Check: projected_delta <= max_portfolio_delta
   Check: projected_gamma <= max_portfolio_gamma
   Check: projected_vega <= max_portfolio_vega
   Check: projected_theta >= max_portfolio_theta (theta is negative)
   Reject reason: "greek_exposure_exceeded: {greek}"

9. LIQUIDITY_GATE
   Check: liquidity_grade >= min_liquidity_grade
   Check: spread_pct <= max_bid_ask_spread_pct
   Check: open_interest >= min_open_interest
   Check: volume >= min_volume
   Reject reason: "liquidity_insufficient: {metric}"

10. EVENT_BLACKOUT_GATE
    Check: Not within earnings blackout window
    Check: Not within FOMC blackout window
    Detection:
      - Query EventCalendar if available
      - Else use configurable blackout windows
    Reject reason: "event_blackout: {event_type}"

11. REGIME_GATE
    Check: regime_type != UNKNOWN (for entries)
    Check: If regime is CHOPPY, apply additional scrutiny
    Reject reason: "regime_unknown" or "regime_unsuitable"

12. DATA_FRESHNESS_GATE
    Check: All critical inputs within max_age thresholds
    Max ages:
      - signal: 60,000 ms
      - regime: 120,000 ms
      - options: 300,000 ms
      - quote: 30,000 ms
    Reject reason: "stale_input: {input_type}"

13. MIN_SIZE_GATE
    Check: calculated_size >= min_position_size
    OR: allow_minimum_override and calculated_size > 0
    Reject reason: "size_below_minimum"
```

### 6.2) Gate Evaluation Order

```
GATE EVALUATION ORDER (short-circuit on failure):

1. KILL_SWITCH_GATE        # Fastest check
2. RISK_MODE_GATE          # Check mode
3. DATA_FRESHNESS_GATE     # No point continuing with stale data
4. REGIME_GATE             # Regime must be known
5. DAILY_LOSS_GATE         # Budget checks
6. WEEKLY_LOSS_GATE
7. DRAWDOWN_GATE
8. MAX_POSITIONS_GATE      # Position limits
9. SYMBOL_CONCENTRATION_GATE
10. GREEK_EXPOSURE_GATE    # Exposure limits
11. LIQUIDITY_GATE         # Market conditions
12. EVENT_BLACKOUT_GATE    # Event risk
13. MIN_SIZE_GATE          # Final size check
```

---

## 7) Risk Adjustments (SOFT Modifiers)

Soft modifiers scale position size up or down but don't cause outright rejection.

### 7.1) Confidence Multiplier

```
CONFIDENCE MULTIPLIER:

Input: signal.confidence (0.0–1.0)

Formula:
  IF confidence >= 0.80:
    multiplier = 1.2
  ELIF confidence >= 0.70:
    multiplier = 1.0
  ELIF confidence >= 0.60:
    multiplier = 0.85
  ELIF confidence >= 0.50:
    multiplier = 0.70
  ELSE:
    multiplier = 0.50

Bounds: [0.50, 1.20]
```

### 7.2) Regime Multiplier

```
REGIME MULTIPLIER:

Inputs:
  - regime_type
  - regime_confidence
  - volatility_state

Base by volatility_state:
  LOW: 1.0
  NORMAL: 1.0
  HIGH: 0.70
  EXTREME: 0.40

Adjustments:
  IF regime_type == CHOPPY: multiplier *= 0.50
  IF regime_type == UNKNOWN: multiplier = 0.25
  IF regime_confidence < 0.50: multiplier *= 0.80
  IF regime_confidence < 0.40: multiplier *= 0.70

Bounds: [0.25, 1.0]
```

### 7.3) Liquidity Multiplier

```
LIQUIDITY MULTIPLIER:

Input: liquidity_grade, spread_pct

Base by grade:
  EXCELLENT: 1.0
  GOOD: 0.90
  FAIR: 0.75
  POOR: 0.50
  ILLIQUID: 0.25  # Should be rejected by hard gate, but fallback

Spread adjustment:
  IF spread_pct > 0.10: multiplier *= 0.80
  IF spread_pct > 0.15: multiplier *= 0.60

Bounds: [0.25, 1.0]
```

### 7.4) Urgency Multiplier

```
URGENCY MULTIPLIER:

Input: urgency, is_squeeze_signal

Base by urgency:
  IMMEDIATE: 0.80   # Reduce size for fast decisions
  STANDARD: 1.0
  LOW: 1.0

Squeeze adjustment:
  IF is_squeeze_signal AND urgency == IMMEDIATE:
    # FAST_RELEASE: slightly smaller due to higher risk
    multiplier = 0.75
  ELIF is_squeeze_signal AND urgency == STANDARD:
    # CONFIRMED_RELEASE: normal sizing
    multiplier = 1.0

Bounds: [0.75, 1.25]
```

### 7.5) Event Multiplier

```
EVENT MULTIPLIER:

Input: event_proximity_hours, event_type

IF no upcoming events:
  multiplier = 1.0

ELIF event_type == EARNINGS:
  IF proximity < 24 hours: multiplier = 0.0  # Should be blocked by hard gate
  ELIF proximity < 48 hours: multiplier = 0.50
  ELIF proximity < 72 hours: multiplier = 0.75
  ELSE: multiplier = 1.0

ELIF event_type == FOMC:
  IF proximity < 4 hours: multiplier = 0.0
  ELIF proximity < 24 hours: multiplier = 0.60
  ELSE: multiplier = 1.0

ELIF event_type in [CPI, JOBS]:
  IF proximity < 2 hours: multiplier = 0.50
  ELSE: multiplier = 1.0

Bounds: [0.0, 1.0]
```

### 7.6) Drawdown Multiplier

```
DRAWDOWN MULTIPLIER:

Input: current_drawdown_pct, max_drawdown_pct

drawdown_ratio = current_drawdown_pct / max_drawdown_pct

IF drawdown_ratio < 0.25:
  multiplier = 1.0
ELIF drawdown_ratio < 0.50:
  multiplier = 0.90
ELIF drawdown_ratio < 0.75:
  multiplier = 0.70
ELIF drawdown_ratio < 0.90:
  multiplier = 0.50
ELSE:
  multiplier = 0.25

Bounds: [0.25, 1.0]
```

### 7.7) Streak Multiplier (Optional)

```
STREAK MULTIPLIER:

Input: recent_win_rate (last 10 trades, if available)

IF recent_win_rate is null or unavailable:
  multiplier = 1.0  # Neutral

ELIF recent_win_rate >= 0.70:
  multiplier = 1.10  # Small boost

ELIF recent_win_rate >= 0.50:
  multiplier = 1.0  # Neutral

ELIF recent_win_rate >= 0.30:
  multiplier = 0.90  # Small reduction

ELSE:
  multiplier = 0.80  # Larger reduction

Bounds: [0.80, 1.20]
```

### 7.8) Combined Multiplier Calculation

```
COMBINED MULTIPLIER:

combined = (
  confidence_multiplier *
  regime_multiplier *
  liquidity_multiplier *
  urgency_multiplier *
  event_multiplier *
  drawdown_multiplier *
  streak_multiplier
)

# Apply global bounds
combined_clamped = clamp(combined, min_multiplier, max_multiplier)

Default bounds:
  min_multiplier = 0.25
  max_multiplier = 1.50
```

---

## 8) Stop/TP Planning

### 8.1) Stop Loss Derivation

```
STOP LOSS DERIVATION:

PRIORITY ORDER:
1. Use SignalIntent.stop_loss_zone if present
2. Use SetupCandidate.stop_zone if present
3. Use invalidation_price from signal
4. Fall back to ATR-based stop
5. Fall back to percentage-based stop

ATR-BASED STOP:
  Input: atr_value (from features), atr_multiplier (config, default 2.0)

  FOR LONG:
    hard_stop = entry_price - (atr_value * atr_multiplier)

  FOR SHORT:
    hard_stop = entry_price + (atr_value * atr_multiplier)

STRUCTURE-BASED STOP:
  IF setup provides structure levels:
    FOR LONG:
      hard_stop = structure_low - (structure_low * buffer_pct)
    FOR SHORT:
      hard_stop = structure_high + (structure_high * buffer_pct)

  buffer_pct default: 0.002 (0.2%)

PERCENTAGE-BASED STOP (fallback):
  default_stop_pct = 0.03 (3%)

  FOR LONG:
    hard_stop = entry_price * (1 - default_stop_pct)

  FOR SHORT:
    hard_stop = entry_price * (1 + default_stop_pct)

SOFT STOP (optional):
  soft_stop_ratio = 0.50  # Soft stop at 50% of hard stop distance
  soft_stop = entry_price +/- (stop_distance * soft_stop_ratio)
  soft_action = ALERT  # or REDUCE_25

TIME STOP:
  IF strategy_family in [BREAKOUT, LONG_VOL]:
    time_stop_bars = 10  # Exit if no move in 10 bars
  ELSE:
    time_stop_bars = 20

  IF signal.ttl_seconds defined:
    time_stop_timestamp = signal.expiry_timestamp_utc
```

### 8.2) Take Profit Derivation

```
TAKE PROFIT DERIVATION:

R-MULTIPLE APPROACH:
  R = stop_distance (risk per unit)

  target_1 = entry +/- (R * r_multiple_1)  # Default: 1.5R
  target_2 = entry +/- (R * r_multiple_2)  # Default: 2.5R
  target_3 = entry +/- (R * r_multiple_3)  # Default: 4.0R

DEFAULT R-MULTIPLES:
  r_multiple_1 = 1.5
  r_multiple_2 = 2.5
  r_multiple_3 = 4.0

STRUCTURE-BASED TARGETS:
  IF SignalIntent.target_zones provided:
    Use those directly

  ELIF SetupCandidate.target_zones provided:
    Use those

  ELSE:
    Use R-multiple approach

PARTIAL EXIT SCHEDULE:
  Default schedule:
    - At target_1: Exit 33% of position
    - At target_2: Exit 33% of position
    - At target_3: Exit remaining 34%

  OR (runner approach):
    - At target_1: Exit 50% of position
    - At target_2: Exit 25% of position
    - At target_3: Exit remaining 25%

TRAILING TAKE PROFIT:
  trailing_tp_enabled = true if strategy_family in [TREND, BREAKOUT]

  Activation: After reaching 1.0R profit
  Trail distance: 0.5R behind current price

EVENT-BASED EXIT:
  IF exit_before_event AND event within hold period:
    Force exit at event_exit_hours_before (default: 4 hours)
```

### 8.3) Stop/TP Integration with 08_signal_generation

```
INVALIDATION TIE-IN:

SignalIntent.invalidation_price maps to StopLossPlan.invalidation_price

RULE:
  IF price breaches invalidation_price:
    - 08_signal_generation marks signal as INVALIDATED
    - 10_risk_management stop loss plan has invalidation_stop_enabled = true
    - Exit should occur at invalidation (not hard stop)

PRECEDENCE:
  invalidation_stop < soft_stop < hard_stop

  - Invalidation stop: Exit because setup is no longer valid
  - Soft stop: Warning/partial exit
  - Hard stop: Maximum loss, must exit
```

---

## 9) Risk State Machine

### 9.1) State Definitions

```
RISK MODES:

NORMAL:
  - All operations allowed
  - Full position sizing
  - Standard risk limits apply
  - Entry and exit signals processed

REDUCE_ONLY:
  - Only EXIT signals allowed
  - ENTRY signals rejected
  - Purpose: Wind down exposure
  - Triggered by: Approaching limits, volatility spike, data issues

STAND_DOWN:
  - No signals processed except system-level
  - All sizing returns is_approved=false
  - Purpose: Complete halt of trading
  - Triggered by: Limit breach, kill switch, critical failure
```

### 9.2) State Transitions

```
STATE TRANSITION RULES:

NORMAL → REDUCE_ONLY:
  Triggers:
    - daily_loss_used_pct >= 75%
    - weekly_loss_used_pct >= 75%
    - current_drawdown_pct >= 80% of max_drawdown
    - volatility_state == EXTREME
    - regime_type == UNKNOWN for > 5 minutes
    - repeated sizing rejections (> 5 in 10 minutes)
    - data staleness (critical input stale > 2 minutes)

REDUCE_ONLY → STAND_DOWN:
  Triggers:
    - daily_loss_limit reached (100%)
    - weekly_loss_limit reached
    - max_drawdown reached
    - kill_switch activated
    - circuit_breaker triggered
    - critical system failure

REDUCE_ONLY → NORMAL:
  Recovery conditions (ALL must be true):
    - daily_loss_used_pct < 50%
    - No limit breaches in last 30 minutes
    - volatility_state in [LOW, NORMAL]
    - regime_type != UNKNOWN
    - All inputs fresh
    - No pending risk events
    - Hysteresis: Must stay in REDUCE_ONLY for >= 15 minutes

STAND_DOWN → REDUCE_ONLY:
  Recovery conditions (ALL must be true):
    - kill_switch deactivated (if was the trigger)
    - At least 1 hour since entering STAND_DOWN
    - No limit breaches active
    - Manual confirmation (if required by config)

STAND_DOWN → NORMAL:
  NOT ALLOWED directly
  Must go through REDUCE_ONLY first
```

### 9.3) Hysteresis Rules

```
HYSTERESIS (prevent flip-flop):

MINIMUM_TIME_IN_STATE:
  NORMAL → REDUCE_ONLY: No minimum (can transition immediately)
  REDUCE_ONLY → NORMAL: 15 minutes minimum
  REDUCE_ONLY → STAND_DOWN: No minimum
  STAND_DOWN → REDUCE_ONLY: 60 minutes minimum

CONFIRMATION_WINDOWS:
  Before transitioning REDUCE_ONLY → NORMAL:
    - All recovery conditions must be true for >= 5 minutes continuously
    - If any condition fails during window, restart the timer

BOUNCE_PREVENTION:
  IF transitioned NORMAL → REDUCE_ONLY → NORMAL within 30 minutes:
    - Next REDUCE_ONLY transition requires 25% lower thresholds
    - Prevents rapid cycling

MANUAL_OVERRIDE:
  Config: allow_manual_mode_override = true/false
  IF true: Operator can force mode transitions
  Logged as RiskEvent with severity=WARNING
```

---

## 10) Write Contract to 02_data_store

### 10.1) Output Store Paths

```
Store Paths:

processed/
  risk_state_store/
    state/
      risk_state_{timestamp}.parquet
    history/
      state_history_{date}.parquet

  risk_events_store/
    events/
      {date}/
        event_{event_id}.parquet

  position_sizing_store/
    decisions/
      {symbol}/
        {date}/
          decision_{decision_id}.parquet
    stop_plans/
      {symbol}/
        {date}/
          stop_plan_{plan_id}.parquet
    tp_plans/
      {symbol}/
        {date}/
          tp_plan_{plan_id}.parquet

  risk_metrics_store/
    metrics/
      {date}/
        metrics_{timestamp}.parquet
```

### 10.2) Write Contract

```
WRITE CONTRACT (10_risk_management → 02_data_store):

1. IDEMPOTENT WRITES
   - decision_id is unique key for PositionSizingDecision
   - event_id is unique key for RiskEvent
   - state_id is unique key for RiskState
   - Duplicate writes are rejected

2. SCHEMA VALIDATION
   - All outputs validated against canonical schemas
   - Schema version included in RiskProvenance
   - Validation failures reject write + log error

3. TRANSACTION SEMANTICS
   - PositionSizingDecision + StopLossPlan + TakeProfitPlan written atomically
   - RiskState updates are atomic

4. QUALITY METADATA
   - Every write includes RiskProvenance
   - Input freshness recorded
   - Config versions recorded

5. RETENTION
   - Hot tier: 7 days (real-time queries)
   - Warm tier: 90 days (analysis)
   - Cold tier: 1 year (compliance)

6. WRITE RESULT
   02_data_store returns:
   - success: bool
   - record_id: string
   - storage_path: string
   - error_message: string | null
```

---

## 11) Submodule Structure

```
10_risk_management/
├── SPEC.md                          # This document
├── limits/
│   ├── __init__.py
│   ├── limits_loader.py             # Load RiskLimits from config
│   ├── limits_validator.py          # Validate limit consistency
│   └── limits_checker.py            # Check current vs limits
├── budget/
│   ├── __init__.py
│   ├── budget_tracker.py            # Track daily/weekly budgets
│   ├── budget_allocator.py          # Per-strategy allocation
│   └── budget_refresher.py          # Reset on new period
├── gates/
│   ├── __init__.py
│   ├── hard_gates.py                # All hard gate implementations
│   ├── gate_runner.py               # Evaluate gates in order
│   └── gate_registry.py             # Register/discover gates
├── sizing/
│   ├── __init__.py
│   ├── size_calculator.py           # Main sizing algorithm
│   ├── base_size.py                 # Calculate base size
│   └── size_bounds.py               # Apply min/max bounds
├── adjustments/
│   ├── __init__.py
│   ├── adjustment_factors.py        # Compute all factors
│   ├── confidence_adj.py            # Confidence multiplier
│   ├── regime_adj.py                # Regime multiplier
│   ├── liquidity_adj.py             # Liquidity multiplier
│   ├── urgency_adj.py               # Urgency multiplier
│   ├── event_adj.py                 # Event multiplier
│   ├── drawdown_adj.py              # Drawdown multiplier
│   └── streak_adj.py                # Streak multiplier (optional)
├── stops/
│   ├── __init__.py
│   ├── stop_planner.py              # Create StopLossPlan
│   ├── stop_derivation.py           # ATR, structure, percentage
│   ├── trailing_stop.py             # Trailing stop logic
│   └── time_stop.py                 # Time-based stops
├── targets/
│   ├── __init__.py
│   ├── target_planner.py            # Create TakeProfitPlan
│   ├── r_multiple.py                # R-multiple targets
│   ├── structure_targets.py         # Structure-based targets
│   └── partial_exit.py              # Partial exit schedule
├── exposure/
│   ├── __init__.py
│   ├── exposure_tracker.py          # Track ExposureSnapshot
│   ├── greek_exposure.py            # Calculate greek exposure
│   ├── concentration.py             # Symbol concentration
│   └── projected_exposure.py        # Project post-trade exposure
├── state_machine/
│   ├── __init__.py
│   ├── risk_state.py                # Manage RiskState
│   ├── mode_transitions.py          # Transition logic
│   ├── hysteresis.py                # Prevent flip-flop
│   └── recovery.py                  # Recovery conditions
├── events/
│   ├── __init__.py
│   ├── event_emitter.py             # Emit RiskEvent
│   ├── event_types.py               # Event type definitions
│   └── event_severity.py            # Severity classification
├── writers/
│   ├── __init__.py
│   ├── decision_writer.py           # Write PositionSizingDecision
│   ├── state_writer.py              # Write RiskState
│   ├── event_writer.py              # Write RiskEvent
│   └── metrics_writer.py            # Write RiskMetrics
├── readers/
│   ├── __init__.py
│   ├── signal_reader.py             # Read from 08
│   ├── regime_reader.py             # Read from 04
│   ├── options_reader.py            # Read from 05
│   └── config_reader.py             # Read config
├── tests/
│   ├── __init__.py
│   ├── test_hard_gates.py
│   ├── test_sizing_algorithm.py
│   ├── test_adjustment_factors.py
│   ├── test_stop_planning.py
│   ├── test_target_planning.py
│   ├── test_exposure_tracking.py
│   ├── test_state_machine.py
│   ├── test_hysteresis.py
│   ├── test_event_emission.py
│   └── test_end_to_end.py
└── config/
    ├── risk_config.yaml             # Main risk configuration
    ├── limits_config.yaml           # Risk limits
    ├── adjustment_config.yaml       # Adjustment parameters
    ├── stop_config.yaml             # Stop loss settings
    └── target_config.yaml           # Take profit settings
```

---

## 12) Validation & Failure Modes

| Failure Mode | Detection | Response | Logging |
|--------------|-----------|----------|---------|
| **Missing signal** | SignalIntent is null | REJECT sizing | ERROR: "missing_signal" |
| **Expired signal** | now >= expiry_timestamp | REJECT sizing | INFO: "signal_expired" |
| **Stale regime** | Age > 120,000 ms | REJECT sizing | WARN: "stale_regime" |
| **Stale options data** | Age > 300,000 ms | REJECT sizing | WARN: "stale_options" |
| **Missing stop zone** | No stop derivable | Use ATR fallback; if still fails, REJECT | WARN: "stop_fallback" |
| **Zero stop distance** | stop_price == entry_price | REJECT sizing | ERROR: "zero_stop_distance" |
| **Daily limit reached** | used_pct >= 100% | Enter STAND_DOWN, REJECT | CRITICAL: "daily_limit_breach" |
| **Weekly limit reached** | used_pct >= 100% | Enter STAND_DOWN, REJECT | CRITICAL: "weekly_limit_breach" |
| **Max drawdown reached** | drawdown >= max | Enter STAND_DOWN, REJECT | CRITICAL: "max_drawdown_breach" |
| **Max positions reached** | positions >= max | REJECT new entries | WARN: "max_positions" |
| **Greek exposure exceeded** | projected > limit | Reduce size or REJECT | WARN: "greek_exposure_exceeded" |
| **Liquidity insufficient** | grade < min | REJECT sizing | INFO: "liquidity_gate_fail" |
| **Event blackout** | Within blackout window | REJECT sizing | INFO: "event_blackout" |
| **Unknown regime** | regime_type == UNKNOWN | Enter REDUCE_ONLY, REJECT entries | WARN: "unknown_regime" |
| **Size below minimum** | final_size < min | REJECT sizing | INFO: "size_below_min" |
| **Size rounds to zero** | round(size) == 0 | REJECT sizing | INFO: "size_zero" |
| **Kill switch active** | kill_switch == true | Enter STAND_DOWN, REJECT all | CRITICAL: "kill_switch" |
| **State machine error** | Invalid transition | Log and maintain current state | ERROR: "invalid_transition" |
| **Config missing** | Required config not found | Use defaults + WARN | ERROR: "config_missing" |
| **Write failure** | Store write fails | Retry 3x, then log and continue | ERROR: "write_failure" |

---

## 13) Minimum Acceptance Criteria

### 13.1) Schema Completeness

- [x] RiskLimits defined with account, symbol, strategy, trade, greek limits
- [x] RiskBudget defined with period tracking and per-strategy allocation
- [x] PositionSizingDecision defined with full sizing output
- [x] ExposureSnapshot defined with gross/net/greek exposures
- [x] StopLossPlan defined with hard/soft/time/invalidation stops
- [x] TakeProfitPlan defined with R-multiples and partial exits
- [x] RiskAdjustmentFactors defined with all multipliers
- [x] RiskState defined with mode and history
- [x] RiskEvent defined with all event types
- [x] RiskProvenance defined for full auditability
- [x] RiskMetrics defined for monitoring

### 13.2) Sizing Algorithm

- [x] Deterministic sizing formula specified
- [x] Base size calculation documented
- [x] Adjustment factors (7 types) documented
- [x] Combined multiplier with bounds
- [x] Rounding rules specified
- [x] Reject conditions enumerated

### 13.3) Hard Gates

- [x] 13 hard gates defined
- [x] Evaluation order specified
- [x] Each gate has clear check and reject reason

### 13.4) Soft Adjustments

- [x] 7 adjustment multipliers defined
- [x] Each has explicit formula
- [x] All bounded with min/max
- [x] Combined calculation specified

### 13.5) Stop/TP Planning

- [x] Stop derivation priority order
- [x] ATR-based, structure-based, percentage-based stops
- [x] Soft stop and time stop
- [x] Invalidation tie-in with 08_signal_generation
- [x] R-multiple targets
- [x] Partial exit schedule
- [x] Trailing take profit

### 13.6) State Machine

- [x] NORMAL, REDUCE_ONLY, STAND_DOWN modes
- [x] Transition triggers defined
- [x] Recovery conditions specified
- [x] Hysteresis rules to prevent flip-flop

### 13.7) Test Plan

| Test Category | Test Cases |
|---------------|------------|
| **Hard Gates** | Each gate tested; boundary values; combined failures |
| **Sizing Algorithm** | Base size; adjustments; bounds; rounding |
| **Adjustment Factors** | Each factor isolated; combined; bounds |
| **Stop Planning** | ATR-based; structure-based; fallbacks |
| **Target Planning** | R-multiples; partials; trailing |
| **Exposure Tracking** | Greek calculation; concentration; projected |
| **State Machine** | All transitions; hysteresis; recovery |
| **Event Emission** | Each event type; severity; logging |
| **End-to-End** | Full sizing flow; write contract |

---

## 14) Deferred Design Notes

### 14.1) Deferred to Future Modules

| Item | Deferred To | Rationale |
|------|-------------|-----------|
| Order execution | 11_execution | Broker integration |
| Order management | 12_order_management | Order lifecycle |
| Real-time PnL | Future module | Requires fill tracking |
| Position tracking | 11_execution | Fill-based |
| Account balance sync | External system | Live data source |

### 14.2) Deferred Implementation Details

| Item | Notes |
|------|-------|
| ML-based sizing | Start deterministic; ML can optimize later |
| Dynamic limit adjustment | Start with static config |
| Cross-symbol correlation | Single-symbol focus initially |
| Historical backtesting | Design for it; implement separately |

### 14.3) Known Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| Config-driven account balance | Not live | Update config periodically |
| No real-time PnL | Can't track intraday P&L | Accept; deferred to execution |
| Static event calendar | May miss dynamic events | Config-driven blackouts as fallback |
| No ML optimization | Sizing may not be optimal | Deterministic is safer to start |

---

## 15) Proposed Git Commit

```
Commit ID: COMMIT-0012
Module: 10_risk_management
Type: SPEC

Summary:
Add risk management specification defining the gatekeeper between signals
and execution. Includes position sizing, risk limits, stop/TP planning,
and risk state machine.

Contents:
- 11 canonical schemas (RiskLimits, RiskBudget, PositionSizingDecision, ExposureSnapshot, StopLossPlan, TakeProfitPlan, RiskAdjustmentFactors, RiskState, RiskEvent, RiskProvenance, RiskMetrics)
- Deterministic sizing algorithm with explicit formula
- 13 hard gates for risk enforcement
- 7 soft adjustment multipliers
- Stop/TP planning with ATR, structure, R-multiple approaches
- Risk state machine (NORMAL, REDUCE_ONLY, STAND_DOWN)
- Hysteresis rules to prevent mode flip-flop

Key Features:
- Deny-by-default philosophy
- Config-driven limits
- Full provenance tracking
- No broker/execution logic

Upstream Dependencies:
- 08_signal_generation (SignalIntent)
- 07_strategy_selection_engine (StrategyCandidate, StrategyConstraints)
- 04_market_regime (RegimeClassification)
- 05_options_analytics (OptionsLiquiditySnapshot, IVSnapshot, OptionGreeksSnapshot)
- 00_core (Clock, ConfigContract, Logger)

Downstream Consumers:
- 11_execution (future)

Files:
- options_trading_brain/10_risk_management/SPEC.md

Commit Message:
[OptionsBrain] 10_risk_management (COMMIT-0012): position sizing, risk limits, stop/TP planning, state machine

CONTRACT LOCKED - Changes require PATCH document
```

---

**END OF SPEC**
