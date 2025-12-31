# 05_OPTIONS_ANALYTICS — Specification

**Commit ID:** COMMIT-0009
**Status:** Draft
**Last Updated:** 2025-12-29

---

## 1) Purpose

Responsible for computing options-specific analytics from normalized options chain data. This module transforms `NormalizedOptionsChain` snapshots into actionable derivatives metrics: greeks, implied volatility, volatility surfaces, term structure, skew metrics, gamma exposure proxies, and liquidity assessments.

This is the **options computation layer**—all mathematical transformations of options data happen here. Outputs are persisted to `02_data_store/processed/` for consumption by downstream modules (regime detection, setup recognition, strategy selection, signal validation, risk management).

All computations are **deterministic and replay-safe** for backtesting.

---

## 2) Owns / Does Not Own

### Owns
- Greeks computation (delta, gamma, vega, theta, rho, and higher-order if configured)
- Implied volatility solving (per-contract IV with diagnostics)
- IV surface construction (per-expiry smile fitting and interpolation)
- Term structure analysis (ATM IV by expiry, slope, curvature)
- Skew metrics (risk reversal, butterfly, put/call skew ratios)
- Gamma exposure proxy calculation (GEX-style aggregations)
- Options liquidity assessment (spread %, depth, concentration)
- Chain summary statistics (PCR, OI concentration, ATM IV)
- Quality scoring and validation for all computed outputs
- Write contract to `02_data_store/processed/options_analytics/`

### Does Not Own
- Raw options chain ingestion or normalization (that's `01_data_ingestion`)
- Data storage, caching, or retention policies (that's `02_data_store`)
- Feature engineering for non-options indicators (that's `03_feature_engineering`)
- Regime classification using IV metrics (that's `04_market_regime`—this module provides inputs)
- Setup or pattern detection (that's `04b_setup_and_pattern_library`)
- Strategy selection or signal generation (that's `07`/`08`)
- Position sizing or risk calculations (that's `10_risk_management`)
- Actual dealer positioning data (only proxies computed here)

---

## 3) Inputs

### From 02_data_store (raw/)

**Primary Input:**
```
NormalizedOptionsChain (from 01_data_ingestion)
  - underlying_symbol: string
  - timestamp_utc: datetime
  - timestamp_exchange: datetime
  - exchange_timezone: string
  - underlying_price: decimal
  - expirations: OptionsExpiration[]
    - expiration_date: date
    - dte: int
    - strikes: OptionsStrike[]
      - strike: decimal
      - call: OptionsContract | null
      - put: OptionsContract | null
        - contract_symbol: string
        - option_type: string
        - bid: decimal
        - ask: decimal
        - mid: decimal
        - last: decimal | null
        - volume: int
        - open_interest: int
        - implied_volatility: decimal | null  # Provider-supplied (may be null/inaccurate)
        - delta/gamma/theta/vega/rho: decimal | null  # Provider-supplied (recalculated here)
  - provenance: ProvenanceMetadata
```

**Supporting Inputs:**
```
NormalizedQuote (from 02_data_store/raw/)
  - symbol: string
  - timestamp_utc: datetime
  - bid: decimal
  - ask: decimal
  - mid: decimal
  - spread_pct: decimal
  - provenance: ProvenanceMetadata

NormalizedBar[] (from 02_data_store/raw/)
  - For realized volatility calculation (if computed locally)
  - OHLCV data for underlying

DerivedSeries (from 02_data_store/processed/ via 03_feature_engineering)
  - realized_vol (historical volatility)
  - realized_vol_percentile
  - atr
  - Note: Prefer sourcing realized_vol from 03_feature_engineering for consistency
```

### From 00_core

```
Config:
  - greeks_model: string  # "black_scholes" | "bjerksund_stensland"
  - iv_solver_method: string  # "newton_raphson" | "brent" | "bisection"
  - iv_solver_max_iterations: int  # Default: 100
  - iv_solver_tolerance: float  # Default: 1e-6
  - risk_free_rate_source: string  # "config" | "treasury_api"
  - risk_free_rate_default: float  # Default: 0.05 (5%)
  - dividend_yield_source: string  # "config" | "fundamentals"
  - dividend_yield_default: float  # Default: 0.0
  - surface_smoothing_method: string  # "cubic_spline" | "sabr" | "svi"
  - gex_aggregation_levels: int[]  # Strike levels for GEX bucketing
  - quality_thresholds: QualityThresholds

Logger:
  - Structured logging with trace IDs

SystemClock:
  - Deterministic time (real or backtest-injected)

ExchangeCalendar:
  - Trading days for DTE calculation
  - Early close handling
```

### From 01_data_ingestion (via 02_data_store)

```
DataQualityReport (attached to NormalizedOptionsChain)
  - quality_score: float
  - quality_flags: string[]
  - is_valid: bool

EventCalendar (for earnings/dividend handling)
  - Upcoming events that affect pricing
```

---

## 4) Outputs

**To 02_data_store (processed/options_analytics/):**

All outputs include provenance and quality metadata.

---

### Canonical Output Schemas

---

#### OptionContractRef
```
OptionContractRef:
  - contract_symbol: string          # OCC symbol (e.g., "AAPL240119C00150000")
  - underlying_symbol: string        # Underlying ticker
  - expiration_date: date            # Expiration date
  - dte: int                         # Days to expiration (trading days)
  - dte_calendar: int                # Days to expiration (calendar days)
  - strike: decimal                  # Strike price
  - option_type: string              # "call" | "put"
  - right: string                    # "C" | "P"
  - multiplier: int                  # Contract multiplier (typically 100)
  - settlement: string               # "american" | "european" | "cash"
  - exercise_style: string           # "american" | "european"
  - underlying_price: decimal        # Spot price at computation time
  - moneyness: decimal               # strike / underlying_price
  - moneyness_category: string       # "deep_itm" | "itm" | "atm" | "otm" | "deep_otm"
  - delta_strike: decimal | null     # Approximate delta at this strike (for skew calcs)
```

---

#### OptionGreeksSnapshot
```
OptionGreeksSnapshot:
  - snapshot_id: uuid
  - contract_ref: OptionContractRef
  - timestamp_utc: datetime          # Computation timestamp
  - effective_time: datetime         # Time the greeks represent (chain snapshot time)
  - as_of_time: datetime             # When computation was performed

  # Core Greeks
  - delta: decimal                   # Position delta (-1 to 1)
  - gamma: decimal                   # Delta sensitivity to spot
  - vega: decimal                    # Price sensitivity to IV (per 1% IV move)
  - theta: decimal                   # Time decay (per day, negative for long)
  - rho: decimal                     # Sensitivity to risk-free rate

  # Higher-Order Greeks (optional, config-driven)
  - charm: decimal | null            # Delta decay (dDelta/dTime)
  - vanna: decimal | null            # dDelta/dIV or dVega/dSpot
  - volga: decimal | null            # dVega/dIV (vomma)
  - speed: decimal | null            # dGamma/dSpot
  - color: decimal | null            # dGamma/dTime

  # Calculation Metadata
  - calc_method: string              # "black_scholes" | "bjerksund_stensland"
  - model_inputs: GreeksModelInputs
  - calc_latency_ms: int

  # Quality
  - quality_score: float             # 0.0–1.0
  - quality_flags: string[]          # e.g., ["near_expiry", "deep_otm", "wide_spread"]

  - provenance: OptionsProvenance

GreeksModelInputs:
  - spot_price: decimal
  - strike: decimal
  - time_to_expiry_years: decimal    # In years (ACT/365 or trading day adjusted)
  - risk_free_rate: decimal          # Annualized
  - dividend_yield: decimal          # Annualized continuous yield
  - implied_volatility: decimal      # IV used for calculation
  - option_type: string              # "call" | "put"
```

---

#### IVSnapshot
```
IVSnapshot:
  - snapshot_id: uuid
  - contract_ref: OptionContractRef
  - timestamp_utc: datetime
  - effective_time: datetime
  - as_of_time: datetime

  # IV Values
  - iv_mid: decimal                  # IV from mid price (primary)
  - iv_bid: decimal | null           # IV from bid price
  - iv_ask: decimal | null           # IV from ask price
  - iv_last: decimal | null          # IV from last trade price
  - iv_spread: decimal | null        # iv_ask - iv_bid

  # Solve Diagnostics
  - solver_method: string            # "newton_raphson" | "brent" | "bisection"
  - solver_iterations: int           # Iterations to converge
  - solver_error: float              # Final error term
  - solver_converged: bool           # True if within tolerance
  - solver_bounded: bool             # True if IV within reasonable bounds (0.01–5.0)

  # Model Inputs
  - model_inputs: IVModelInputs

  # Quality
  - quality_score: float
  - quality_flags: string[]          # e.g., ["non_convergent", "extrapolated", "stale_quote"]

  - provenance: OptionsProvenance

IVModelInputs:
  - spot_price: decimal
  - strike: decimal
  - option_price: decimal            # Price used for solve (mid/bid/ask)
  - time_to_expiry_years: decimal
  - risk_free_rate: decimal
  - dividend_yield: decimal
  - option_type: string
```

---

#### IVSurfaceSlice
```
IVSurfaceSlice:
  - slice_id: uuid
  - underlying_symbol: string
  - timestamp_utc: datetime
  - effective_time: datetime
  - as_of_time: datetime

  # Expiry Context
  - expiration_date: date
  - dte: int
  - dte_calendar: int

  # Surface Points
  - surface_points: IVSurfacePoint[]

  # Fit Diagnostics
  - fit_method: string               # "cubic_spline" | "sabr" | "svi" | "raw"
  - fit_rmse: float                  # Root mean square error of fit
  - fit_max_error: float             # Maximum deviation from observed
  - fit_r_squared: float             # Goodness of fit
  - points_used: int                 # Number of strikes used in fit
  - points_excluded: int             # Points excluded (quality/outlier)

  # ATM Reference
  - atm_strike: decimal              # Nearest ATM strike
  - atm_iv: decimal                  # IV at ATM strike
  - atm_forward: decimal             # Forward price (if computable)

  # Quality
  - quality_score: float
  - quality_flags: string[]

  - provenance: OptionsProvenance

IVSurfacePoint:
  - strike: decimal
  - moneyness: decimal               # K/S
  - log_moneyness: decimal           # ln(K/S)
  - delta_approx: decimal            # Approximate delta
  - iv_observed: decimal             # Raw observed IV
  - iv_fitted: decimal               # Fitted/smoothed IV
  - iv_residual: decimal             # iv_observed - iv_fitted
  - weight: float                    # Weight in fit (liquidity-adjusted)
  - included_in_fit: bool            # True if used in fit
```

---

#### TermStructureSnapshot
```
TermStructureSnapshot:
  - snapshot_id: uuid
  - underlying_symbol: string
  - timestamp_utc: datetime
  - effective_time: datetime
  - as_of_time: datetime

  # Term Structure Points
  - term_points: TermStructurePoint[]

  # Curve Characteristics
  - slope_short: decimal             # IV slope 0–30 DTE (normalized)
  - slope_medium: decimal            # IV slope 30–90 DTE
  - slope_long: decimal              # IV slope 90+ DTE
  - curvature: decimal               # Second derivative (term structure shape)
  - term_structure_shape: string     # "contango" | "backwardation" | "humped" | "flat"

  # Key Points
  - iv_front_month: decimal          # ATM IV of nearest expiry
  - iv_second_month: decimal         # ATM IV of second expiry
  - iv_third_month: decimal | null   # ATM IV of third expiry
  - front_back_spread: decimal       # iv_front - iv_second (+ = backwardation)

  # Quality
  - quality_score: float
  - quality_flags: string[]
  - expirations_used: int

  - provenance: OptionsProvenance

TermStructurePoint:
  - expiration_date: date
  - dte: int
  - atm_iv: decimal
  - atm_strike: decimal
  - iv_25d_put: decimal | null       # 25-delta put IV
  - iv_25d_call: decimal | null      # 25-delta call IV
  - volume_at_expiry: int
  - oi_at_expiry: int
  - liquidity_score: float           # 0–1 liquidity at this expiry
```

---

#### SkewSnapshot
```
SkewSnapshot:
  - snapshot_id: uuid
  - underlying_symbol: string
  - expiration_date: date
  - dte: int
  - timestamp_utc: datetime
  - effective_time: datetime
  - as_of_time: datetime

  # Risk Reversal (Put - Call at same delta)
  - rr_25d: decimal                  # IV(25d put) - IV(25d call)
  - rr_10d: decimal | null           # IV(10d put) - IV(10d call)
  - rr_direction: string             # "put_premium" | "call_premium" | "neutral"

  # Butterfly (Wing - ATM)
  - fly_25d: decimal                 # (IV(25d put) + IV(25d call)) / 2 - IV(ATM)
  - fly_10d: decimal | null          # (IV(10d put) + IV(10d call)) / 2 - IV(ATM)
  - fly_interpretation: string       # "fat_tails" | "normal" | "thin_tails"

  # Put/Call Skew Ratios
  - pc_skew_25d: decimal             # IV(25d put) / IV(25d call)
  - pc_skew_10d: decimal | null
  - otm_put_premium: decimal         # Average OTM put IV / ATM IV
  - otm_call_premium: decimal        # Average OTM call IV / ATM IV

  # Strike Definitions Used
  - atm_strike: decimal
  - strike_25d_put: decimal
  - strike_25d_call: decimal
  - strike_10d_put: decimal | null
  - strike_10d_call: decimal | null

  # Quality
  - quality_score: float
  - quality_flags: string[]

  - provenance: OptionsProvenance
```

---

#### ChainSummary
```
ChainSummary:
  - summary_id: uuid
  - underlying_symbol: string
  - timestamp_utc: datetime
  - effective_time: datetime
  - as_of_time: datetime

  # Put/Call Ratios
  - pcr_volume: decimal              # Put volume / Call volume
  - pcr_oi: decimal                  # Put OI / Call OI
  - pcr_volume_weighted: decimal     # Premium-weighted PCR

  # Volume & OI Metrics
  - total_volume: int
  - total_oi: int
  - call_volume: int
  - put_volume: int
  - call_oi: int
  - put_oi: int
  - volume_oi_ratio: decimal         # Total volume / Total OI

  # OI Concentration
  - top_5_strikes_oi_pct: decimal    # % of OI in top 5 strikes
  - max_oi_strike: decimal           # Strike with highest OI
  - max_oi_strike_type: string       # "call" | "put"
  - max_oi_value: int

  # ATM Reference
  - atm_iv: decimal                  # ATM IV (weighted average of ATM calls/puts)
  - atm_strike: decimal
  - atm_spread_pct: decimal          # Average spread % at ATM

  # OTM Tail Metrics
  - otm_put_volume_ratio: decimal    # OTM put volume / total put volume
  - otm_call_volume_ratio: decimal   # OTM call volume / total call volume
  - tail_heaviness: decimal          # Relative volume in deep OTM

  # Near-Expiry Flags
  - nearest_expiry_dte: int
  - pin_risk_strikes: decimal[]      # Strikes with high OI near spot (within 1%)

  # Quality
  - expirations_included: int
  - strikes_included: int
  - quality_score: float
  - quality_flags: string[]

  - provenance: OptionsProvenance
```

---

#### GammaExposureProxy
```
GammaExposureProxy:
  - proxy_id: uuid
  - underlying_symbol: string
  - timestamp_utc: datetime
  - effective_time: datetime
  - as_of_time: datetime

  # Aggregated GEX
  - gex_total: decimal               # Net gamma exposure ($ gamma per 1% move)
  - gex_calls: decimal               # Gamma from calls (assumed dealer short)
  - gex_puts: decimal                # Gamma from puts (assumed dealer short)
  - gex_flip_level: decimal | null   # Price where GEX flips sign

  # GEX by Strike Level
  - gex_by_strike: GEXStrikeLevel[]

  # GEX by Expiry
  - gex_by_expiry: GEXExpiryLevel[]

  # Key Levels
  - max_gamma_strike: decimal        # Strike with highest absolute gamma
  - support_levels: decimal[]        # Strikes with positive GEX (support)
  - resistance_levels: decimal[]     # Strikes with negative GEX (resistance)

  # Interpretation
  - gex_regime: string               # "positive" | "negative" | "neutral"
  - vol_suppression_expected: bool   # Positive GEX suggests vol suppression
  - dealer_hedging_direction: string # "buy_dips" | "sell_rallies" | "neutral"

  # Caveats & Confidence
  - methodology_note: string         # "Assumes dealers are net short options"
  - confidence: float                # 0.0–1.0 (lower if OI stale, assumptions weak)
  - uncertainty_band_pct: float      # Estimated uncertainty in GEX values

  # Quality
  - quality_score: float
  - quality_flags: string[]

  - provenance: OptionsProvenance

GEXStrikeLevel:
  - strike: decimal
  - gex_value: decimal               # $ gamma at this strike
  - call_gamma_contribution: decimal
  - put_gamma_contribution: decimal
  - oi_at_strike: int

GEXExpiryLevel:
  - expiration_date: date
  - dte: int
  - gex_total: decimal
  - gex_weight: float                # Contribution to total GEX
```

---

#### DealerPositioningProxy
```
DealerPositioningProxy:
  - proxy_id: uuid
  - underlying_symbol: string
  - timestamp_utc: datetime
  - effective_time: datetime
  - as_of_time: datetime

  # Positioning Estimates (PROXY - HIGH UNCERTAINTY)
  - estimated_dealer_delta: decimal  # Net delta exposure estimate
  - estimated_dealer_gamma: decimal  # Net gamma exposure estimate
  - estimated_dealer_vega: decimal   # Net vega exposure estimate

  # Confidence & Caveats (MANDATORY)
  - is_proxy: bool                   # ALWAYS TRUE - this is an estimate
  - methodology: string              # Description of estimation approach
  - assumptions: string[]            # List of assumptions made
  - confidence: float                # 0.0–1.0 (typically low: 0.3–0.6)
  - uncertainty_description: string  # Plain-language uncertainty statement

  # Directional Bias (derived)
  - hedging_pressure: string         # "buy_underlying" | "sell_underlying" | "neutral"
  - vol_pressure: string             # "buy_vol" | "sell_vol" | "neutral"

  # Quality
  - quality_score: float
  - quality_flags: string[]          # MUST include "proxy_estimate"

  - provenance: OptionsProvenance

NOTE: DealerPositioningProxy is inherently uncertain. Downstream modules
MUST treat confidence scores seriously and apply appropriate discounts.
True dealer positioning is not observable; this is an inference.
```

---

#### OptionsLiquiditySnapshot
```
OptionsLiquiditySnapshot:
  - snapshot_id: uuid
  - underlying_symbol: string
  - timestamp_utc: datetime
  - effective_time: datetime
  - as_of_time: datetime

  # Overall Liquidity Score
  - liquidity_score: float           # 0.0–1.0 composite
  - liquidity_grade: string          # "excellent" | "good" | "fair" | "poor"

  # Spread Metrics
  - avg_spread_pct_atm: decimal      # Average spread % at ATM strikes
  - avg_spread_pct_otm: decimal      # Average spread % at OTM strikes
  - avg_spread_pct_all: decimal      # Average across all strikes
  - widest_spread_pct: decimal       # Widest spread observed
  - widest_spread_strike: decimal    # Strike with widest spread

  # Depth Proxy (if available)
  - depth_score: float | null        # 0.0–1.0 based on size at bid/ask
  - estimated_size_atm: int | null   # Estimated tradeable size at ATM

  # Volume/OI Liquidity
  - volume_concentration: decimal    # % of volume in liquid strikes
  - oi_concentration: decimal        # % of OI in liquid strikes
  - liquid_strikes_count: int        # Strikes meeting liquidity threshold
  - illiquid_strikes_count: int      # Strikes failing liquidity threshold

  # Pin Risk (Near Expiry)
  - pin_risk_flag: bool              # True if large OI near spot and DTE <= 5
  - pin_risk_strikes: decimal[]      # High-OI strikes within 1% of spot

  # By Expiry
  - liquidity_by_expiry: ExpiryLiquidity[]

  # Quality
  - quality_score: float
  - quality_flags: string[]

  - provenance: OptionsProvenance

ExpiryLiquidity:
  - expiration_date: date
  - dte: int
  - liquidity_score: float
  - avg_spread_pct: decimal
  - liquid_strikes: int
```

---

#### OptionsProvenance
```
OptionsProvenance:
  - provider: string                 # Data source (e.g., "polygon", "tradier")
  - calc_timestamp_utc: datetime     # When computation was performed
  - chain_timestamp_utc: datetime    # Chain snapshot timestamp
  - quote_timestamp_utc: datetime    # Underlying quote timestamp
  - inputs_hash: string              # Hash of inputs for reproducibility
  - calc_latency_ms: int             # Computation time
  - version: string                  # Analytics module version
  - config_hash: string              # Hash of config used
```

---

#### OptionsQualityReport
```
OptionsQualityReport:
  - quality_score: float             # 0.0–1.0 overall quality
  - quality_flags: string[]          # List of quality issues
  - is_valid: bool                   # True if passed all validation gates
  - validation_errors: string[]      # List of validation failures

  # Component Scores
  - chain_completeness: float        # 0.0–1.0 (strikes/expiries present)
  - quote_freshness: float           # 0.0–1.0 (staleness penalty)
  - spread_quality: float            # 0.0–1.0 (narrow spreads = high)
  - iv_solve_quality: float          # 0.0–1.0 (convergence rate)
  - arbitrage_check: float           # 0.0–1.0 (no-arb violations)

Note: Conceptually aligned with DataQualityReport from 01_data_ingestion.
Extractable subset for downstream quality filtering.
```

---

## 5) Separation of Concerns

### This Module COMPUTES:
- Greeks from chain data + model inputs
- Implied volatility by solving pricing equations
- IV surface fitting and smoothing
- Term structure and skew metrics
- Gamma exposure proxies
- Liquidity assessments

### This Module Does NOT:
- Ingest or normalize raw provider data (01_data_ingestion)
- Store or cache computed results (02_data_store)
- Compute non-options features like moving averages (03_feature_engineering)
- Classify market regimes using IV percentiles (04_market_regime consumes our outputs)
- Detect setups or patterns (04b_setup_and_pattern_library)
- Generate trading signals (08_signal_generation)
- Calculate position sizes or P&L (10_risk_management)

### Downstream Consumers:
- `04_market_regime` → Uses IV percentiles, term structure for vol regime
- `04b_setup_and_pattern_library` → Uses IV crush, skew for options-specific setups
- `07_strategy_selection_engine` → Uses greeks, liquidity for strategy filtering
- `08_signal_generation` → Uses greeks for position construction
- `10_risk_management` → Uses greeks for hedge ratios, risk metrics
- `14_learning_and_evaluation_loop` → Uses historical analytics for attribution

---

## 6) Provider Abstraction & Calculation Methods

### Provider Abstraction
- Options chain data arrives via `NormalizedOptionsChain` (already provider-agnostic)
- This module recalculates greeks/IV regardless of provider-supplied values
- Provider-supplied greeks/IV are used only for comparison/validation
- No provider-specific logic in computation layer

### Greeks Calculation Methods

**Black-Scholes (European Options):**
```
Supported: Equity index options, European-settled options
Formula: Standard Black-Scholes-Merton with continuous dividend yield
Parameters:
  - S: Spot price
  - K: Strike price
  - T: Time to expiry (years)
  - r: Risk-free rate (continuous)
  - q: Dividend yield (continuous)
  - σ: Implied volatility

Greeks computed directly via closed-form partial derivatives.
```

**Bjerksund-Stensland (American Options):**
```
Supported: American equity options (early exercise)
Formula: Bjerksund-Stensland 2002 approximation
Parameters: Same as Black-Scholes
Note: Greeks computed via finite difference on price.
Accuracy: Within 0.1% of binomial for most strikes.
Fallback: If near expiry or deep ITM, use binomial tree.
```

**Configuration:**
```
GreeksConfig:
  - primary_model: string            # "black_scholes" | "bjerksund_stensland"
  - use_trading_days: bool           # True = trading day count, False = calendar
  - trading_days_per_year: int       # Default: 252
  - calendar_days_per_year: int      # Default: 365
  - near_expiry_threshold_days: int  # Switch to binomial below this DTE
  - compute_higher_order: bool       # True = charm, vanna, volga
  - dividend_adjustment: string      # "continuous" | "discrete" | "none"
```

### IV Solver Methods

**Newton-Raphson (Primary):**
```
Fast convergence for most cases.
Initial guess: ATM IV or 30% if unknown.
Max iterations: 100 (config)
Tolerance: 1e-6 (config)
Fallback: Brent if non-convergent.
```

**Brent's Method (Fallback):**
```
Robust but slower.
Guaranteed convergence in bounded interval.
Bounds: [0.01, 5.0] for IV
Used when Newton-Raphson fails.
```

**Bisection (Last Resort):**
```
Slowest but most robust.
Used for extreme cases (deep OTM, near expiry).
```

**Solver Configuration:**
```
IVSolverConfig:
  - primary_method: string           # "newton_raphson"
  - fallback_method: string          # "brent"
  - last_resort_method: string       # "bisection"
  - max_iterations: int              # 100
  - tolerance: float                 # 1e-6
  - iv_lower_bound: float            # 0.01 (1%)
  - iv_upper_bound: float            # 5.0 (500%)
  - use_intrinsic_floor: bool        # True = price must exceed intrinsic
```

---

## 7) Time & Session Handling

### Timestamp Semantics

```
effective_time: datetime
  - The market time the data represents
  - Chain snapshot time from provider
  - Used for DTE calculation, expiry handling

as_of_time: datetime
  - When the computation was performed
  - May differ from effective_time in backtest
  - Used for audit, latency tracking

timestamp_utc: datetime
  - Primary timestamp for storage/indexing
  - Always UTC
```

### Time to Expiry Calculation

```
# Trading Days (preferred for greeks)
trading_dte = count_trading_days(effective_date, expiration_date, exchange_calendar)
time_to_expiry_trading = trading_dte / trading_days_per_year

# Calendar Days (for reference)
calendar_dte = (expiration_date - effective_date).days
time_to_expiry_calendar = calendar_dte / 365.0

# Configuration determines which is used
if config.use_trading_days:
    T = time_to_expiry_trading
else:
    T = time_to_expiry_calendar
```

### Stale Chain Handling

```
# Staleness detection
staleness_ms = as_of_time - effective_time
is_stale = staleness_ms > config.max_chain_staleness_ms

# Quality penalty for staleness
if is_stale:
    quality_penalty = min(0.5, staleness_ms / config.staleness_penalty_factor)
    quality_score -= quality_penalty
    quality_flags.append("stale_chain")
```

### Partial Chain Refresh

```
# Some providers refresh strikes incrementally
# Detect partial refresh by comparing to previous snapshot

if chain.expirations.count < previous_chain.expirations.count:
    quality_flags.append("partial_refresh")
    # Merge with previous snapshot if configured
    if config.merge_partial_refreshes:
        chain = merge_chains(chain, previous_chain)
```

### Exchange Timezone Preservation

```
# All internal computation in UTC
# Preserve exchange timezone for DTE edge cases (expiry cutoff)

if exchange_timezone == "America/New_York":
    expiry_cutoff_utc = expiration_date @ 16:00 ET → UTC
else:
    expiry_cutoff_utc = expiration_date @ market_close → UTC

# Near expiry (same day), use hours to expiry
if trading_dte == 0:
    hours_to_expiry = (expiry_cutoff_utc - effective_time).hours
    T = hours_to_expiry / (trading_hours_per_year)
```

---

## 8) Data Quality & Validation Gates

### Validation Rules

| Gate | Check | Detection | Response |
|------|-------|-----------|----------|
| **Missing Strikes** | Expected strikes not in chain | Strike count < expected for liquid name | Flag `incomplete_chain`, reduce quality |
| **Incomplete Expiry** | Expiry has < N strikes | Strike count at expiry < threshold | Exclude from surface fit, flag |
| **Crossed Market** | Bid > Ask | bid > ask for any contract | Reject contract, flag `crossed_market` |
| **Zero/Negative Spread** | Spread <= 0 | ask - bid <= 0 | Reject contract, flag |
| **Stale Quote** | Quote age > threshold | timestamp delta > config | Apply staleness penalty |
| **Arbitrage Violation** | Price < intrinsic | call < max(0, S-K), put < max(0, K-S) | Flag `arb_violation`, use intrinsic floor |
| **IV Non-Convergence** | Solver fails | iterations = max, error > tolerance | Use fallback solver or flag `non_convergent` |
| **IV Out of Bounds** | IV < 1% or > 500% | solved IV outside bounds | Clamp and flag `iv_clamped` |
| **IV Spike** | IV >> neighbors | IV > 3 std dev from smile | Flag `iv_outlier`, exclude from fit |
| **Greeks Discontinuity** | Gamma spike | gamma > 10x neighbors | Flag `greeks_outlier` |
| **Near-Zero Time** | DTE = 0 and < 1 hour | time_to_expiry < epsilon | Use special near-expiry model |

### Quality Score Computation

```
def compute_quality_score(chain, outputs):
    score = 1.0
    flags = []

    # Completeness (20%)
    completeness = chain.strikes_count / expected_strikes
    score -= (1.0 - completeness) * 0.20
    if completeness < 0.8:
        flags.append("incomplete_chain")

    # Quote Freshness (20%)
    staleness_penalty = min(0.20, staleness_ms / max_staleness_ms * 0.20)
    score -= staleness_penalty
    if staleness_penalty > 0.05:
        flags.append("stale_quotes")

    # Spread Quality (20%)
    avg_spread = mean(contract.spread_pct for contract in chain.contracts)
    spread_penalty = min(0.20, avg_spread / 0.10 * 0.20)  # 10% spread = max penalty
    score -= spread_penalty
    if avg_spread > 0.05:
        flags.append("wide_spreads")

    # IV Solve Quality (20%)
    convergence_rate = converged_count / total_count
    score -= (1.0 - convergence_rate) * 0.20
    if convergence_rate < 0.95:
        flags.append("iv_solve_issues")

    # Arbitrage Check (20%)
    arb_violations = count(c for c in contracts if c.price < c.intrinsic)
    arb_penalty = min(0.20, arb_violations / total_count * 0.20)
    score -= arb_penalty
    if arb_violations > 0:
        flags.append("arb_violations")

    return OptionsQualityReport(
        quality_score=max(0.0, score),
        quality_flags=flags,
        is_valid=score >= config.min_quality_threshold,
        ...
    )
```

---

## 9) Realtime vs Backtest Behavior

### Realtime Mode

```
# Incremental updates on each chain refresh
1. Receive NormalizedOptionsChain snapshot
2. Validate chain (quality gates)
3. Compute all analytics (greeks, IV, surface, etc.)
4. Write to 02_data_store with effective_time = chain.timestamp_utc
5. Overwrite previous snapshot for same symbol+effective_time (idempotent)
```

### Backtest Mode

```
# Deterministic replay from stored chains
1. Read NormalizedOptionsChain from 02_data_store at simulated time
2. Inject SystemClock with simulated time
3. Compute analytics using same logic as realtime
4. Outputs indexed by effective_time (not wall clock)
5. Guarantee: same inputs → same outputs across runs
```

### Effective Time vs As-Of Time

```
effective_time:
  - Time the market data represents
  - Used for: DTE calculation, regime lookups, downstream consumption
  - Example: Chain snapshot at 10:30:00 UTC

as_of_time:
  - Time computation was performed
  - Used for: Latency tracking, audit, debugging
  - Example: Computation at 10:30:05 UTC (5ms after data)

In backtest:
  - effective_time = simulated market time
  - as_of_time = simulated market time (not wall clock)
```

### Idempotent Writes

```
# Primary key: (symbol, effective_time, output_type)
# Re-computing and writing same data produces no duplicates
# Updates overwrite previous values for same key

write_result = data_store.write(
    key=(symbol, effective_time, "greeks"),
    data=greeks_snapshot,
    upsert=True  # Insert or update
)
```

### Snapshot Versioning

```
# Each analytics output includes version for reproducibility
provenance.version = "05_options_analytics:1.0.0"
provenance.config_hash = sha256(config)
provenance.inputs_hash = sha256(chain + quote + config)

# Version mismatch detection
if stored.version != current.version:
    log.warning("Analytics version changed; results may differ")
```

---

## 10) Core Analytics Requirements

### 10.1) Greeks Computation

**Required Greeks (always computed):**
- **Delta (Δ):** ∂V/∂S — Position sensitivity to spot
- **Gamma (Γ):** ∂²V/∂S² — Delta sensitivity to spot
- **Vega (ν):** ∂V/∂σ — Sensitivity to IV (per 1% IV move)
- **Theta (Θ):** ∂V/∂t — Time decay per day (negative for long)
- **Rho (ρ):** ∂V/∂r — Sensitivity to risk-free rate

**Optional Higher-Order Greeks (config-driven):**
- **Charm:** ∂Δ/∂t — Delta decay over time
- **Vanna:** ∂Δ/∂σ = ∂ν/∂S — Cross-sensitivity
- **Volga (Vomma):** ∂ν/∂σ — Vega convexity
- **Speed:** ∂Γ/∂S — Gamma sensitivity to spot
- **Color:** ∂Γ/∂t — Gamma decay over time

**Computation:**
```
For Black-Scholes: Closed-form formulas
For American (Bjerksund-Stensland): Finite difference on price

Delta_call = e^(-qT) * N(d1)
Delta_put = e^(-qT) * (N(d1) - 1)
Gamma = e^(-qT) * n(d1) / (S * σ * sqrt(T))
Vega = S * e^(-qT) * n(d1) * sqrt(T) / 100  # Per 1% IV
Theta = [complex formula] / 365  # Per day
Rho = [complex formula] / 100  # Per 1% rate
```

### 10.2) Implied Volatility

**IV Solve Approach:**
```
Given: Market price P_market, S, K, T, r, q, option_type
Find: σ such that BSM(S, K, T, r, q, σ) = P_market

Primary: Newton-Raphson with Vega as derivative
Initial guess: 0.30 or previous IV if available
Convergence: |P_model - P_market| < tolerance

For each contract:
  - Compute iv_mid from mid price (primary)
  - Compute iv_bid from bid price
  - Compute iv_ask from ask price
  - iv_spread = iv_ask - iv_bid
```

**Solve Diagnostics:**
```
IVSolveDiagnostics:
  - iterations: int
  - final_error: float
  - converged: bool
  - method_used: string
  - initial_guess: float
  - bounded: bool (IV within [0.01, 5.0])
```

### 10.3) Realized Volatility Integration

**Source:** `03_feature_engineering` (preferred for consistency)

```
From 02_data_store/processed/:
  - realized_vol: DerivedSeries (historical volatility)
  - realized_vol_percentile: DerivedSeries (percentile over lookback)

Usage:
  - IV vs RV comparison: iv_rv_spread = atm_iv - realized_vol
  - IV percentile context: compare current IV to historical range
  - Variance risk premium: VRP = IV² - RV²

Justification: 03_feature_engineering already computes RV from NormalizedBar
using consistent methodology. Avoid duplication by consuming their output.
```

### 10.4) IV Surface Construction

**Per-Expiry Smile Fitting:**
```
For each expiration:
  1. Collect (strike, iv_mid) pairs
  2. Filter by quality (spread %, liquidity, convergence)
  3. Weight by liquidity (higher weight for liquid strikes)
  4. Fit smoothing curve

Smoothing Methods:
  - cubic_spline: Simple, fast, may oscillate in tails
  - sabr: Stochastic Alpha Beta Rho model, good for FX/rates
  - svi: Stochastic Volatility Inspired, good for equities

Output: iv_fitted(K) for any strike K
```

**Fit Diagnostics:**
```
fit_rmse = sqrt(mean((iv_observed - iv_fitted)²))
fit_max_error = max(|iv_observed - iv_fitted|)
fit_r_squared = 1 - SS_res / SS_tot
```

### 10.5) Term Structure

**ATM IV by Expiry:**
```
For each expiration:
  - Find ATM strike (nearest to spot)
  - Get atm_iv from that strike
  - If no exact ATM, interpolate between adjacent strikes

Term structure curve: [(dte, atm_iv), ...]
```

**Shape Metrics:**
```
slope = (iv_far - iv_near) / (dte_far - dte_near)

If slope > 0: contango (IV increases with time)
If slope < 0: backwardation (IV decreases with time, short-term fear)
If |slope| < threshold: flat

curvature = second derivative of term structure (humped detection)
```

### 10.6) Skew Metrics

**Delta-Based Strike Selection:**
```
For a given delta target (e.g., 25):
  - For puts: find strike where |delta| ≈ 0.25
  - For calls: find strike where delta ≈ 0.25

If exact delta not available, interpolate between strikes.
```

**Risk Reversal:**
```
RR_25d = IV(25d put) - IV(25d call)

If RR > 0: Put premium (downside fear)
If RR < 0: Call premium (upside demand)
```

**Butterfly:**
```
Fly_25d = (IV(25d put) + IV(25d call)) / 2 - IV(ATM)

If Fly > 0: Fat tails (wings expensive)
If Fly < 0: Thin tails (wings cheap)
```

### 10.7) Gamma Exposure (GEX) Proxy

**Formula:**
```
GEX = Σ (gamma_i * OI_i * 100 * S²) * dealer_sign_i

Where:
  - gamma_i: Gamma of contract i
  - OI_i: Open interest of contract i
  - 100: Contract multiplier
  - S: Spot price
  - dealer_sign_i: +1 if dealers assumed short (long gamma to hedge)
                   -1 if dealers assumed long (short gamma)

Assumption: Dealers are net short options (market makers).
This means:
  - Calls: dealer_sign = -1 (dealers short calls → short gamma → sell rallies)
  - Puts: dealer_sign = +1 (dealers short puts → long gamma → buy dips)
```

**Aggregation:**
```
By strike: GEX_strike(K) = sum of GEX for contracts at strike K
By expiry: GEX_expiry(E) = sum of GEX for contracts expiring on E
Total: GEX_total = sum of all contract GEX
```

**GEX Flip Level:**
```
The price where net GEX = 0.
Above flip: Positive GEX → vol suppression.
Below flip: Negative GEX → vol amplification.
```

**Caveats (MANDATORY):**
```
- OI does not tell us who holds positions
- Dealer assumption is a proxy, not fact
- Large directional flow can distort
- Intraday OI not always available
- GEX changes as spot moves

Confidence should be reduced when:
- OI is stale (EOD only)
- Large single-entity positions suspected
- Unusual skew in PCR
```

### 10.8) Liquidity Assessment

**Spread Metrics:**
```
spread_pct = (ask - bid) / mid * 100

ATM spread: Average spread % for strikes within 2% of spot
OTM spread: Average spread % for strikes > 5% from spot
```

**Concentration:**
```
volume_concentration = volume_top_N_strikes / total_volume
oi_concentration = oi_top_N_strikes / total_oi
```

**Pin Risk:**
```
For each strike within 1% of spot and DTE <= 5:
  If OI > threshold:
    pin_risk_strikes.append(strike)
    pin_risk_flag = True
```

---

## 11) Submodules

### greeks_engine/
- `black_scholes.py` → BS model implementation (closed-form greeks)
- `bjerksund_stensland.py` → American approximation
- `binomial_tree.py` → Tree model for edge cases
- `greeks_calculator.py` → Unified interface, model selection
- `higher_order_greeks.py` → Charm, vanna, volga computations

### iv_solver/
- `newton_raphson.py` → Primary IV solver
- `brent_solver.py` → Fallback solver
- `bisection_solver.py` → Last resort solver
- `iv_solver.py` → Unified solver with fallback chain
- `solve_diagnostics.py` → Convergence tracking

### surface/
- `surface_builder.py` → Builds IVSurfaceSlice from chain
- `smoothers/`
  - `cubic_spline.py` → Spline interpolation
  - `sabr.py` → SABR model calibration
  - `svi.py` → SVI parameterization
- `surface_diagnostics.py` → Fit quality metrics

### term_structure/
- `term_structure_builder.py` → Builds TermStructureSnapshot
- `atm_finder.py` → ATM strike detection
- `shape_classifier.py` → Contango/backwardation/humped

### skew/
- `delta_strike_mapper.py` → Maps delta to strike
- `skew_calculator.py` → RR, fly, PC skew
- `skew_snapshot_builder.py` → Builds SkewSnapshot

### gamma_exposure/
- `gex_calculator.py` → GEX computation
- `gex_aggregator.py` → By strike, by expiry, total
- `flip_level_finder.py` → GEX flip detection
- `dealer_positioning_proxy.py` → Proxy estimation

### liquidity/
- `liquidity_scorer.py` → Composite liquidity score
- `spread_analyzer.py` → Spread metrics
- `pin_risk_detector.py` → Near-expiry pin risk

### chain_summary/
- `pcr_calculator.py` → Put/call ratios
- `oi_analyzer.py` → OI concentration, max OI strike
- `chain_summary_builder.py` → Builds ChainSummary

### quality/
- `validation_gates.py` → All validation checks
- `quality_scorer.py` → Composite quality score
- `arbitrage_checker.py` → No-arb bounds
- `outlier_detector.py` → IV/greeks outliers

### writers/
- `greeks_writer.py` → Writes OptionGreeksSnapshot
- `iv_writer.py` → Writes IVSnapshot
- `surface_writer.py` → Writes IVSurfaceSlice
- `term_structure_writer.py` → Writes TermStructureSnapshot
- `skew_writer.py` → Writes SkewSnapshot
- `gex_writer.py` → Writes GammaExposureProxy
- `liquidity_writer.py` → Writes OptionsLiquiditySnapshot
- `chain_summary_writer.py` → Writes ChainSummary

### config/
- `greeks_config.py` → Greeks model config
- `solver_config.py` → IV solver config
- `surface_config.py` → Surface fitting config
- `quality_config.py` → Validation thresholds

### tests/
- `test_greeks/` → Greeks calculation tests
- `test_iv_solver/` → IV solver tests
- `test_surface/` → Surface fitting tests
- `test_gex/` → GEX calculation tests
- `golden_vectors/` → Known-good input/output pairs

---

## 12) Write Contract to 02_data_store

### Storage Destinations

```
02_data_store/processed/options_analytics/
├── greeks/              # OptionGreeksSnapshot records
├── iv/                  # IVSnapshot records
├── surfaces/            # IVSurfaceSlice records
├── term_structure/      # TermStructureSnapshot records
├── skew/                # SkewSnapshot records
├── gex/                 # GammaExposureProxy records
├── dealer_proxy/        # DealerPositioningProxy records
├── liquidity/           # OptionsLiquiditySnapshot records
└── chain_summary/       # ChainSummary records
```

### Write Interface

```
write_greeks(snapshot: OptionGreeksSnapshot) -> WriteResult
write_iv(snapshot: IVSnapshot) -> WriteResult
write_surface(slice: IVSurfaceSlice) -> WriteResult
write_term_structure(snapshot: TermStructureSnapshot) -> WriteResult
write_skew(snapshot: SkewSnapshot) -> WriteResult
write_gex(proxy: GammaExposureProxy) -> WriteResult
write_dealer_proxy(proxy: DealerPositioningProxy) -> WriteResult
write_liquidity(snapshot: OptionsLiquiditySnapshot) -> WriteResult
write_chain_summary(summary: ChainSummary) -> WriteResult
```

### Write Requirements

1. **Idempotent:** Same (symbol, effective_time, type) key → upsert
2. **Schema Validated:** All fields validated before write
3. **Provenance Required:** Every record includes OptionsProvenance
4. **Quality Required:** Every record includes quality_score + flags
5. **Atomic:** Batch writes succeed or fail together

---

## 13) Validation & Failure Modes

| Failure | Detection | Response |
|---------|-----------|----------|
| Missing chain data | Chain is null or empty | Skip computation, log error, return null |
| Stale chain | staleness > threshold | Proceed with quality penalty, flag `stale` |
| No ATM strike | No strike within 5% of spot | Use nearest available, flag `no_atm` |
| IV non-convergence | All solvers fail | Set IV = null, flag `non_convergent` |
| IV out of bounds | IV < 0.01 or > 5.0 | Clamp, flag `iv_clamped` |
| Crossed market | bid > ask | Exclude contract, flag `crossed_market` |
| Arbitrage violation | price < intrinsic | Use intrinsic floor, flag `arb_violation` |
| Surface fit failure | RMSE > threshold | Use raw IV (no smoothing), flag `fit_failed` |
| Missing spot quote | Underlying quote unavailable | Skip all computations, log error |
| Greeks NaN/Inf | Numerical instability | Set greek = null, flag `computation_error` |
| GEX confidence low | OI stale or incomplete | Reduce confidence, flag `low_confidence` |
| Near-expiry edge case | DTE = 0, T → 0 | Use special near-expiry handling |

### Fallback Behavior

```
When quotes unavailable:
  - Greeks: Cannot compute → null with quality_score = 0
  - IV: Cannot solve → null with non_convergent flag
  - Surface: Insufficient points → raw IV only, no smoothing
  - GEX: Missing OI → confidence = 0.3, flag proxy

Quality reduction cascades:
  - Low chain quality → reduced greeks quality
  - Low greeks quality → reduced surface quality
  - Low surface quality → reduced skew quality
```

---

## 14) Minimum Acceptance Criteria

### Greeks Tests
- [ ] Golden vectors for BS delta/gamma/vega/theta/rho (ATM call, ATM put, OTM, ITM)
- [ ] Boundary: Deep ITM delta → ±1, deep OTM delta → 0
- [ ] Boundary: Near expiry gamma spike handling
- [ ] American vs European: BS-American approximation error < 0.5%
- [ ] Higher-order greeks (charm, vanna, volga) if enabled

### IV Solver Tests
- [ ] Golden vectors for IV solve (known prices → expected IV)
- [ ] Convergence within 100 iterations for typical cases
- [ ] Non-convergence handling: fallback chain works
- [ ] Boundary: Deep OTM (tiny prices) → IV solvable or flagged
- [ ] Boundary: Near expiry → IV solvable with adjusted model
- [ ] IV bounds enforced (0.01–5.0)

### Surface Tests
- [ ] Smile fitting produces smooth curve
- [ ] Fit RMSE < 0.02 (2% IV error) for liquid names
- [ ] Outlier exclusion works (spikes removed from fit)
- [ ] Interpolation between strikes reasonable

### Partial Chain Refresh Tests
- [ ] Partial refresh detected and flagged
- [ ] Merge logic (if enabled) produces complete chain
- [ ] Staleness applied correctly to partial data

### Performance Tests
- [ ] Full chain (100 strikes × 10 expiries) computes in < 500ms
- [ ] Incremental update (single expiry refresh) in < 50ms
- [ ] Memory footprint bounded

### Determinism Tests
- [ ] Same inputs → same outputs across runs
- [ ] No random components
- [ ] Backtest replay produces identical results

### Write Tests
- [ ] Idempotent writes (duplicate key → update)
- [ ] Schema validation rejects bad data
- [ ] Provenance attached to all records

### Documentation
- [ ] Greeks formulas documented
- [ ] IV solver algorithm documented
- [ ] Surface fitting methodology documented
- [ ] GEX formula and caveats documented

---

## 15) Deferred Design Notes

### Deferred to Future Modules
- **Strategy-specific greeks aggregation:** Portfolio greeks computed in `10_risk_management`
- **IV percentile classification for regime:** Consumed by `04_market_regime`, not computed here
- **Options setup detection (IV crush, skew plays):** Handled by `04b_setup_and_pattern_library`
- **Real-time streaming greeks:** Current design is snapshot-based; streaming deferred

### Deferred Implementation Details
- **Exotic options:** Barriers, binaries, Asian options not in initial scope
- **Dividend-adjusted American options:** Discrete dividends require enhanced model
- **Local volatility surface:** Full 2D surface (strike × time) deferred
- **Variance swap replication:** VIX-style variance calculation deferred

### Not Applicable
- **TA-Lib / pandas_ta:** These libraries are for technical indicators on price series, not options analytics. Not used in this module.

---

## 16) Proposed Git Commit

```
[OptionsBrain] 05_options_analytics: add greeks, IV, surface, term structure, skew, GEX, and liquidity

COMMIT-0009

Adds the options-specific analytics layer for the Options Trading Brain.
Computes derivatives metrics from NormalizedOptionsChain.

Canonical Schemas Defined:
- OptionContractRef (contract identifier with moneyness)
- OptionGreeksSnapshot (delta, gamma, vega, theta, rho + higher-order)
- IVSnapshot (mid/bid/ask IV with solve diagnostics)
- IVSurfaceSlice (per-expiry smile with fit diagnostics)
- TermStructureSnapshot (ATM IV by expiry, slope, curvature)
- SkewSnapshot (25d/10d risk reversal, butterfly, PC skew)
- ChainSummary (PCR, OI concentration, ATM IV, tail metrics)
- GammaExposureProxy (GEX by strike/expiry with caveats)
- DealerPositioningProxy (proxy with explicit uncertainty)
- OptionsLiquiditySnapshot (spread %, depth, pin risk)
- OptionsProvenance (calc metadata, inputs hash)
- OptionsQualityReport (quality score + flags)

Analytics Computed:
- Greeks: BS (European) + Bjerksund-Stensland (American)
- IV: Newton-Raphson with Brent/bisection fallback
- Surface: Cubic spline / SABR / SVI smoothing
- Term structure: Contango/backwardation/humped classification
- Skew: Delta-based RR and fly with strike mapping
- GEX: Dealer-short assumption with flip level detection
- Liquidity: Spread %, concentration, pin risk flagging

Architecture:
- Provider-agnostic (works on NormalizedOptionsChain)
- Config-driven model selection
- Deterministic, replay-safe for backtests
- Quality gates with validation and scoring
- Idempotent writes to 02_data_store/processed/options_analytics/

Dependencies:
- Imports from: 00_core, 01_data_ingestion (via 02), 02_data_store, 03_feature_engineering (RV)
- Exports to: 02_data_store, 04_market_regime, 04b, 07, 08, 10, 14

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

---

**End of Specification. STOP.**
