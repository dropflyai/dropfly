# 03_FEATURE_ENGINEERING — Specification

**Commit ID:** COMMIT-0005
**Status:** Approved
**Last Updated:** 2025-12-19

---

## 1) Purpose

Responsible for computing technical indicators, price structures, levels, and trend characteristics from raw market data. Transforms OHLCV bars and options chains into actionable features used by regime detection, setup recognition, and signal generation. This is the **computational layer**—all mathematical transformations happen here. Outputs are persisted to `02_data_store` for reuse.

---

## 2) Owns / Does Not Own

### Owns
- Indicator calculation (moving averages, oscillators, volume metrics, volatility measures)
- Price structure identification (swing highs/lows, support/resistance, pivots)
- Volume profile computation (POC, VAH, VAL, HVN, LVN with configurable anchoring)
- Trend strength quantification (ADX, slope analysis, momentum measures)
- Level detection (key price levels, Fibonacci retracements, gap fills)
- Feature normalization and scaling (z-scores, percentile ranks)
- Lookback window management (ensuring sufficient data for calculations)
- Feature versioning (track changes to indicator logic over time)
- Performance optimization (vectorized calculations, incremental updates)

### Does Not Own
- Raw data ingestion (that's `01_data_ingestion`)
- Data storage or caching (that's `02_data_store`)
- Regime classification (that's `04_market_regime`)
- Setup/pattern recognition (that's `04b_setup_and_pattern_library`)
- Signal generation or trade logic (downstream folders)
- Options-specific analytics (greeks, IV surface—that's `05_options_analytics`)

---

## 3) Inputs

**From 02_data_store:**
- `NormalizedBar[]` → Historical OHLCV data for all timeframes
- `NormalizedQuote` → Real-time bid/ask (for intraday calculations)
- `NormalizedOptionsChain` → Chain data (for put/call ratio, skew calculations)

**From 00_core:**
- `Logger` → Structured logging
- `ConfigContract` → Indicator parameters (periods, thresholds, smoothing factors, volume profile anchoring policies)
- `Timestamp`, `Symbol`, `Timeframe` types
- `TimeframeModel` → Validates data sufficiency for lookback windows

**From configuration:**
- Indicator definitions (which indicators to compute, parameters)
- Volume profile policies (RTH/ETH session boundaries, anchoring: daily/weekly/monthly/rolling, composite vs. session-based)
- Feature sets (grouped indicators for specific strategies)
- Versioning metadata (track indicator formula changes)

---

## 4) Outputs

**Schemas/Contracts (written to `02_data_store` → processed/):**

- `DerivedSeries` → symbol, timeframe, feature_name, timestamp, value, version
  - Examples: EMA_20, RSI_14, ATR_14, VWAP, ADX_14
- `PriceStructure` → symbol, timeframe, timestamp, structure_type, price_level, confidence
  - Examples: SwingHigh, SwingLow, Support, Resistance, Pivot, POC (Point of Control), VAH (Value Area High), VAL (Value Area Low), HVN (High Volume Node), LVN (Low Volume Node)
- `TrendMetrics` → symbol, timeframe, timestamp, slope, strength, consistency, direction
- `LevelCatalog` → symbol, timestamp, level_type, price, touch_count, recency
- `FeatureVector` → symbol, timeframe, timestamp, feature_set_name, features{} (dict of all computed features for a bar)

**Metadata:**
- `FeatureProvenance` → feature_name, version, formula_hash, parameters, last_updated
- `ComputeMetrics` → feature_name, avg_compute_time_ms, bars_processed, errors

---

## 5) Submodules

### indicators_core/
**Responsibility:** Core indicator calculations (trend, momentum, volatility, volume metrics).
**Key Artifacts:**
- `trend_indicators.py` → EMA, SMA, WMA, VWAP, Linear Regression Slope
- `momentum_indicators.py` → RSI, Stochastic, MACD, Rate of Change, CCI
- `volatility_indicators.py` → ATR, Bollinger Bands, Keltner Channels, Historical Volatility
- `volume_indicators.py` → OBV, Money Flow Index, VWAP deviation (NOT Volume Profile—see levels_structure)
- `base_indicator.py` → Abstract base class for all indicators (standardized interface: compute(), validate_lookback(), get_version())
- `indicator_registry.py` → Factory for loading indicators by name from config

### levels_structure/
**Responsibility:** Identifies key price levels, structural pivot points, and volume-derived reference zones.
**Key Artifacts:**
- `swing_detector.py` → Swing high/low identification (N-bar pivot logic)
- `support_resistance.py` → Horizontal S/R detection (clustering, touch counts, recency weighting)
- `fibonacci_levels.py` → Retracement/extension levels from recent swings
- `gap_detector.py` → Gap identification (unfilled zones, gap types: breakaway/exhaustion/continuation)
- `pivot_calculator.py` → Standard pivots, Camarilla, Fibonacci pivots (daily/weekly)
- `volume_profile_features.py` → Computes POC (Point of Control), VAH/VAL (Value Area High/Low), HVN/LVN (High/Low Volume Nodes). Config-driven anchoring (daily/weekly/monthly/rolling) and session policy (RTH/ETH). Outputs as `PriceStructure` with level_type: POC, VAH, VAL, HVN, LVN.
- `level_consolidator.py` → Merges nearby levels into zones (reduces noise)

### trend_strength/
**Responsibility:** Quantifies trend quality, slope consistency, and directional bias.
**Key Artifacts:**
- `adx_calculator.py` → Average Directional Index (ADX, +DI, -DI)
- `slope_analyzer.py` → Linear regression slope over multiple lookback windows (short/medium/long)
- `consistency_scorer.py` → Measures trend consistency (% of bars closing in trend direction)
- `momentum_divergence.py` → Detects price vs. momentum divergences (bullish/bearish)
- `trend_classification.py` → Outputs: strong_uptrend, weak_uptrend, neutral, weak_downtrend, strong_downtrend

---

## 6) Interfaces

### Upstream
- **02_data_store** → Reads raw bars/quotes/chains
- **00_core** → Config, Logger, Types, TimeframeModel

### This Folder
- Computes all features, writes to storage

### Downstream
- **02_data_store/processed/** → Receives all computed features for persistence
- **04_market_regime** → Reads features (ADX, volatility, trend metrics, volume profile nodes) for regime classification
- **04b_setup_and_pattern_library** → Reads features + levels (including POC/VAH/VAL) for setup detection
- **08_signal_generation** → Reads features for signal triggers
- **14_learning_and_evaluation_loop** → Reads features for backtesting and attribution

---

## 7) Validation & Failure Modes

### Validation Rules
- **Lookback sufficiency:** Reject computation if insufficient bars (e.g., EMA_20 requires ≥20 bars)
- **Data quality gates:** Reject bars with missing OHLCV fields or zero volume
- **Numerical stability:** Detect NaN, Inf, divide-by-zero; log and skip affected bars
- **Parameter bounds:** Validate indicator parameters (e.g., RSI period ∈ [2, 200])
- **Volume profile anchoring:** Validate session boundaries (RTH/ETH) and anchor periods (daily/weekly/monthly/rolling) in config
- **Version tracking:** All indicator outputs tagged with formula version (detect breaking changes)

### Failure Modes

| Failure | Detection | Response |
|---------|-----------|----------|
| Insufficient lookback | Bar count < required | Skip computation, log warning, return null |
| Missing OHLCV data | Null or zero values | Skip bar, log error, emit data quality alert |
| NaN/Inf in calculation | Post-compute check | Log error, quarantine output, do NOT persist |
| Parameter out of bounds | Config validation | Reject config, halt startup, require fix |
| Volume profile session mismatch | Timestamp outside RTH/ETH bounds | Skip bar or apply fallback session, log warning |
| Formula version mismatch | Hash comparison | Log warning, recompute all affected features, update version |
| Slow computation (>threshold) | Execution time monitoring | Log warning, flag for optimization, consider caching |
| Divergent results (vs. golden vectors) | Unit test comparison | Fail test, block deployment until resolved |

---

## 8) Minimum Acceptance Criteria

✅ **Indicators Core:**
- At least 10 core indicators implemented and tested (EMA, SMA, RSI, ATR, MACD, ADX, VWAP, Bollinger, Stochastic, OBV)
- Base indicator interface defined with: `compute()`, `validate_lookback()`, `get_version()`
- Indicator registry loads indicators by name from config
- All indicators handle edge cases (insufficient data, zero volume, gaps)

✅ **Levels & Structure:**
- Swing high/low detector identifies pivots using configurable N-bar logic
- Support/resistance detector clusters nearby levels with touch counts
- Fibonacci retracements calculated from recent swing ranges
- Gap detector identifies unfilled gaps with classification (breakaway/exhaustion/continuation)
- Volume profile features compute POC, VAH, VAL, HVN, LVN with config-driven anchoring (daily/weekly/monthly/rolling) and session policy (RTH/ETH)
- Level consolidator merges levels within configurable price tolerance

✅ **Trend Strength:**
- ADX calculator produces ADX, +DI, -DI values
- Slope analyzer computes regression slope over multiple windows (5, 10, 20 bars)
- Consistency scorer measures % of bars closing in trend direction
- Trend classification outputs 5 states: strong_up, weak_up, neutral, weak_down, strong_down

✅ **Feature Outputs:**
- All features written to `02_data_store/processed/derived_series_store`
- Volume profile outputs (POC, VAH, VAL, HVN, LVN) written as `PriceStructure` with level_type metadata
- Output schema includes: symbol, timeframe, feature_name, timestamp, value, version
- Feature provenance tracked (formula hash, parameters, last_updated)

✅ **Performance:**
- Vectorized calculations used where possible (NumPy/Pandas)
- Incremental updates supported for real-time bars (no full recompute)
- Compute metrics logged (avg time per feature, bars processed, errors)

✅ **Versioning:**
- Each indicator has semantic version (MAJOR.MINOR.PATCH)
- Formula changes trigger version bump and recompute flag
- Version stored with each feature output

✅ **Testing:**
- **Primary:** Internal golden test vectors for all indicators (known input → expected output, version-controlled)
- **Secondary:** TA-Lib/pandas_ta comparison ONLY when smoothing conventions, alignment rules, and defaults are explicitly matched and documented. Discrepancies due to implementation differences are acceptable if golden vectors pass.
- Edge case tests (insufficient data, zero volume, NaN handling)
- Performance tests (time limits for batch computation)
- Volume profile tests (anchoring behavior, session boundary handling, POC/VAH/VAL correctness)

✅ **Documentation:**
- README in `03_feature_engineering/` explaining purpose and indicator catalog
- Indicator parameter documentation (periods, smoothing, thresholds)
- Volume profile configuration guide (anchoring policies, session boundaries, output schemas)
- Feature provenance schema documented
- Versioning policy documented (when to bump MAJOR vs. MINOR)
- Golden test vector methodology documented (how to generate, validate, and version test data)

---

## 9) Deferred Design Notes

None for `03_feature_engineering`. All design decisions resolved in-scope.
