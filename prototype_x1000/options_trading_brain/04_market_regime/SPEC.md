# 04_MARKET_REGIME — Specification

**Commit ID:** COMMIT-0007
**Status:** Approved
**Last Updated:** 2025-12-19
**Incorporates:** PATCH_0007

---

## 1) Purpose

Responsible for classifying current market conditions into discrete regimes (volatility states, trend/chop conditions, risk environments) that inform strategy selection, position sizing, and risk management. Consumes features from `03_feature_engineering` and produces regime labels and confidence scores. This is the **context classification layer**—translating raw features into actionable market state that downstream modules use to filter strategies and adjust risk parameters.

---

## 2) Owns / Does Not Own

### Owns
- Volatility regime classification (low/normal/high/extreme volatility states)
- Trend vs. chop classification (extreme_trend/strong_trend/weak_trend/neutral/choppy)
- Risk environment assessment (risk-on/risk-off/neutral, liquidity scoring)
- Regime transition detection (when market shifts from one state to another)
- Confidence scoring (how certain the classification is)
- Regime persistence tracking (how long current regime has been active)
- Multi-timeframe regime alignment (D1 regime vs. M5 regime)
- Historical regime labeling (for backtesting and learning)

### Does Not Own
- Feature computation (that's `03_feature_engineering`)
- Strategy selection (that's `07_strategy_selection_engine`)
- Setup detection (that's `04b_setup_and_pattern_library`)
- Signal generation (that's `08_signal_generation`)
- Position sizing calculations (that's `10_risk_management`)
- Raw data ingestion or storage (that's `01_data_ingestion` and `02_data_store`)

---

## 3) Inputs

**From 02_data_store:**
- `DerivedSeries` → ATR, ADX, historical volatility, Bollinger width, volume metrics
- `TrendMetrics` → Slope, consistency, direction from `03_feature_engineering`
- `NormalizedBar[]` → Price ranges, volume for regime context
- `NormalizedQuote` → Real-time bid/ask for spread computation (liquidity assessment)
- `PriceStructure` → Volume profile nodes (HVN/LVN) for liquidity assessment

**From 03_feature_engineering:**
- Volatility indicators (ATR percentile, Bollinger bandwidth, historical vol)
- Trend strength indicators (ADX, slope consistency)
- Volume indicators (OBV divergence, volume profile characteristics)

**From 00_core:**
- `Logger` → Structured logging
- `ConfigContract` → Regime classification thresholds (volatility breakpoints, ADX thresholds, confidence minimums, liquidity weights)
- `Timestamp`, `Symbol`, `Timeframe` types
- `TimeframeModel` → Multi-timeframe regime alignment

**From configuration:**
- Regime definitions (thresholds for low/normal/high vol, trending/choppy ADX levels)
- Liquidity scorer weights (spread_percentile, rvol_percentile, volume_profile_density)
- Transition rules (minimum persistence before regime change, hysteresis bands)
- Confidence calculation parameters

---

## 4) Outputs

**Schemas/Contracts (written to `02_data_store` → processed/):**

- `VolatilityRegime` → symbol, timeframe, timestamp, regime (low/normal/high/extreme), confidence, atr_percentile, historical_vol, bollinger_width
- `TrendChopRegime` → symbol, timeframe, timestamp, regime (extreme_trend/strong_trend/weak_trend/neutral/choppy), confidence, adx, slope_consistency, direction
- `RiskEnvironment` → symbol, timeframe, timestamp, environment (risk_on/risk_off/neutral), confidence, liquidity_score, realized_vol_percentile
- `RegimeTransition` → symbol, timeframe, timestamp, old_regime, new_regime, transition_type, trigger
- `RegimeState` → symbol, timeframe, timestamp, volatility_regime, trend_regime, risk_environment, overall_confidence, persistence_bars
- `MultiTimeframeAlignment` → symbol, timestamp, regime_d1, regime_h1, regime_m5, alignment_score

**Metadata:**
- `RegimeProvenance` → regime_model_version, calibration_date, threshold_config
- `ConfidenceMetrics` → regime_type, avg_confidence, distance_from_threshold_avg, persistence_avg (Note: calibration_error, misprediction_rate computed in 14_learning_and_evaluation_loop)

---

## 5) Submodules

### regime_models/
**Responsibility:** Core regime classification models and state machines.
**Key Artifacts:**
- `regime_classifier.py` → Base class for regime classifiers (fit, predict, confidence)
- `regime_state_machine.py` → State machine for regime transitions (guards against whipsaws, enforces minimum persistence)
- `multi_regime_compositor.py` → Combines vol + trend + risk regimes into unified `RegimeState`
- `regime_registry.py` → Factory for loading regime models by type

### vol_regime/
**Responsibility:** Volatility regime classification.
**Key Artifacts:**
- `volatility_classifier.py` → Classifies into low/normal/high/extreme based on ATR percentile, historical vol, Bollinger width
- `vol_breakpoints.py` → Configurable percentile thresholds (e.g., low: <20th, normal: 20-60th, high: 60-90th, extreme: >90th)
- `vol_persistence.py` → Tracks how long current vol regime has been active (anti-whipsaw filter)
- `vol_transition_detector.py` → Detects vol regime shifts and emits `RegimeTransition` events

### trend_chop/
**Responsibility:** Trend vs. chop classification.
**Key Artifacts:**
- `trend_chop_classifier.py` → Classifies based on ADX, slope consistency, directional movement
- `trend_thresholds.py` → ADX breakpoints (config-driven defaults):
  - ADX <20: choppy
  - ADX 20-25: weak_trend
  - ADX 25-40: strong_trend
  - ADX >40: extreme_trend
- `chop_filter.py` → Identifies sideways/range-bound conditions (low ADX + narrow range + low slope consistency)
- `trend_persistence.py` → Tracks trend regime duration (longer trends = higher confidence)

### risk_context/
**Responsibility:** Risk environment and liquidity assessment.
**Key Artifacts:**
- `risk_on_off_classifier.py` → Classifies risk environment from liquidity_score + realized_vol_percentile:
  - risk_on: liquidity_score >= high_threshold AND realized_vol_percentile <= high_threshold
  - risk_off: liquidity_score < low_threshold OR realized_vol_percentile > extreme_threshold
  - neutral: otherwise
  - All thresholds config-driven (e.g., liquidity high: 60th, low: 40th; vol high: 70th, extreme: 90th)
- `liquidity_scorer.py` → Scores liquidity as weighted composite:
  - spread_percentile: (ask-bid)/mid over lookback window, percentile-ranked
  - rvol_percentile: current volume / rolling avg volume, percentile-ranked
  - volume_profile_density: % of volume within value area OR count of HVN nodes in last N sessions
  - Weights config-driven (default: spread 40%, rvol 40%, profile 20%)
  - Fallback: if NormalizedQuote unavailable, use (high-low)/close as spread proxy with confidence penalty
- `correlation_regime.py` → Detects high-correlation vs. low-correlation environments (cross-asset, sector correlations—future capability)
- `risk_transition_detector.py` → Detects shifts in risk appetite (risk-on → risk-off, etc.)

### outputs/
**Responsibility:** Assembles and persists regime outputs.
**Key Artifacts:**
- `regime_state_builder.py` → Combines vol + trend + risk into unified `RegimeState` output
- `mtf_alignment_builder.py` → Builds `MultiTimeframeAlignment` (D1 regime vs. H1 vs. M5)
- `regime_writer.py` → Writes regime outputs to `02_data_store/processed/regime_state_store`
- `regime_change_logger.py` → Emits structured logs for all regime transitions (for audit and learning)

---

## 6) Interfaces

### Upstream
- **02_data_store** → Reads bars, quotes, derived series, trend metrics, price structures
- **03_feature_engineering** → Reads computed volatility, trend, volume features
- **00_core** → Config, Logger, Types, TimeframeModel

### This Folder
- Classifies market regimes, writes regime states

### Downstream
- **02_data_store/processed/regime_state_store** → Receives all regime outputs
- **07_strategy_selection_engine** → Reads regime state for strategy filtering (e.g., only credit spreads in low-vol regimes)
- **10_risk_management** → Reads regime state for position sizing adjustments (e.g., reduce size in high-vol regimes)
- **09_trade_validation** → Reads regime state for context validation (e.g., reject trend strategies in choppy regimes)
- **14_learning_and_evaluation_loop** → Reads historical regimes for performance attribution (how strategies perform per regime)
- **03b_charting_and_visual_context** → Reads regime state for context-aware chart styling

---

## 7) Validation & Failure Modes

### Validation Rules
- **Threshold consistency:** Vol/trend/risk thresholds must not overlap (e.g., low vol max < normal vol min)
- **Confidence bounds:** All confidence scores ∈ [0, 1]
- **Minimum persistence:** Regime changes require minimum bars in new state (anti-whipsaw, configurable)
- **Feature availability:** Regime classification requires all input features present (ATR, ADX, vol, etc.)
- **Multi-timeframe alignment:** Higher timeframes take precedence in alignment scoring
- **Liquidity weights:** Liquidity scorer weights must sum to 1.0

### Failure Modes

| Failure | Detection | Response |
|---------|-----------|----------|
| Missing input features | Required feature (ATR, ADX, etc.) not found | Skip regime classification, log error, emit null regime with low confidence |
| Threshold misconfiguration | Overlapping or inverted thresholds | Reject config, halt startup, require fix |
| Confidence out of bounds | Confidence < 0 or > 1 | Clamp to [0, 1], log warning |
| Regime whipsaw | Rapid regime flips (<min persistence) | Hold current regime, log transition attempt, increase confidence threshold |
| Multi-timeframe conflict | D1 says trending, M5 says choppy | Return both, alignment_score reflects conflict, downstream decides priority |
| Feature staleness | Input features older than threshold | Use stale data but flag low confidence, log warning |
| Division by zero in scoring | Edge case in confidence calculation | Default to neutral regime with low confidence, log error |
| Missing quotes for liquidity | NormalizedQuote unavailable | Use (high-low)/close fallback proxy, apply confidence penalty, log warning |
| Liquidity weights invalid | Weights don't sum to 1.0 | Reject config, halt startup, require fix |

---

## 8) Minimum Acceptance Criteria

✅ **Regime Models:**
- Base regime classifier interface defined: `fit()`, `predict()`, `confidence()`
- Regime state machine enforces minimum persistence and transition guards
- Multi-regime compositor combines vol + trend + risk into unified `RegimeState`
- Regime registry loads models by type from config

✅ **Volatility Regime:**
- Classifier produces low/normal/high/extreme based on ATR percentile, historical vol, Bollinger width
- Breakpoints configurable (percentile thresholds)
- Persistence tracking prevents whipsaws (minimum bars in regime before transition)
- Transition detector emits `RegimeTransition` events

✅ **Trend/Chop Regime:**
- Classifier produces extreme_trend/strong_trend/weak_trend/neutral/choppy (5 states) based on ADX, slope consistency
- ADX thresholds configurable (defaults: <20: choppy, 20-25: weak, 25-40: strong, >40: extreme)
- Chop filter identifies sideways/range-bound conditions
- Trend persistence tracked (longer trends = higher confidence)

✅ **Risk Environment:**
- Risk-on/off/neutral classifier uses liquidity_score + realized_vol_percentile with config-driven thresholds
- Liquidity scorer computes weighted composite (spread_percentile 40%, rvol_percentile 40%, volume_profile_density 20%)
- Fallback to (high-low)/close spread proxy when quotes unavailable (with confidence penalty)
- Risk transition detector emits shifts in risk appetite

✅ **Outputs:**
- All regime outputs written to `02_data_store/processed/regime_state_store`
- `RegimeState` schema includes vol + trend + risk + overall confidence + persistence
- `MultiTimeframeAlignment` shows D1/H1/M5 regime alignment with score
- Regime transitions logged with old_regime, new_regime, trigger

✅ **Multi-Timeframe Alignment:**
- Alignment builder compares regimes across D1, H1, M5
- Alignment score reflects agreement/conflict (1.0 = full alignment, 0.0 = full conflict)
- Higher timeframes weighted more heavily in score

✅ **Confidence Calibration:**
- Confidence computed as function of:
  - distance_from_thresholds (closer to boundary → lower confidence)
  - persistence_bars (more bars in regime → higher confidence)
  - feature_freshness (stale features → confidence penalty)
  - classifier_agreement (vol + trend + risk alignment → higher confidence)
- Low confidence when near threshold boundaries or during transitions
- Confidence metrics tracked: avg confidence, distance_from_threshold_avg, persistence_avg
- Calibration error and misprediction rate computed in 14_learning_and_evaluation_loop (metadata contract placeholder only)

✅ **Testing:**
- Unit tests for each regime classifier (known features → expected regime)
- Threshold boundary tests (values at/near thresholds produce correct regimes)
- Persistence tests (rapid flips rejected, stable regimes accepted)
- Multi-timeframe alignment tests (D1 trending + M5 choppy → partial alignment)
- Transition tests (regime changes emit correct events)
- Liquidity scorer tests (weighted composite, fallback proxy, confidence penalty)

✅ **Documentation:**
- README in `04_market_regime/` explaining purpose and regime taxonomy
- Regime definitions documented (what each regime means, typical characteristics)
- Threshold configuration guide (how to calibrate breakpoints)
- Liquidity scorer formula and weight configuration documented
- Multi-timeframe alignment methodology documented
- Confidence calculation formula documented

---

## 9) Deferred Design Notes

### Correlation Regime
**Deferred to:** Future (pending cross-asset/sector correlation data)

**Reason:** Correlation regime detection (high-correlation vs. low-correlation environments) requires cross-asset price data (SPX, VIX, sector indices) which is not yet in scope for `01_data_ingestion`.

**Future Capability:**
- `correlation_regime.py` → Detects high vs. low correlation across assets/sectors
- Requires: Cross-asset price feeds and correlation computation in `03_feature_engineering`

**Action Required:** Expand `01_data_ingestion` to include index/sector data before implementing correlation regime.
