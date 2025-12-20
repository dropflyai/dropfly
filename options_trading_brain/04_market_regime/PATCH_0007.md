# 04_MARKET_REGIME — PATCH 0007

**Commit ID:** COMMIT-0007 (pre-commit corrections)
**Patches:** 04_market_regime SPEC (before initial commit)
**Date:** 2025-12-19

---

## Summary

Corrects four critical specifications before initial commit:
1. Liquidity scorer inputs and deterministic definition
2. Risk-on/risk-off minimal rule set with explicit thresholds
3. Confidence scoring scope correction (remove premature calibration metrics)
4. Trend regime taxonomy consistency (extreme_trend handling)

---

## Changes

### 1) Liquidity Scorer Inputs + Deterministic Definition

**Section 3) Inputs — ADD:**
```
**From 02_data_store:**
- `NormalizedQuote` → Real-time bid/ask for spread computation (liquidity assessment)
```

**Section 5) Submodules → risk_context/liquidity_scorer.py — REPLACE:**

**OLD:**
```
- `liquidity_scorer.py` → Scores liquidity based on bid/ask spreads, volume profile density, HVN/LVN distribution
```

**NEW:**
```
- `liquidity_scorer.py` → Scores liquidity as weighted composite:
  - spread_percentile: (ask-bid)/mid over lookback window, percentile-ranked
  - rvol_percentile: current volume / rolling avg volume, percentile-ranked
  - volume_profile_density: % of volume within value area OR count of HVN nodes in last N sessions
  - Weights config-driven (default: spread 40%, rvol 40%, profile 20%)
  - Fallback: if NormalizedQuote unavailable, use (high-low)/close as spread proxy with confidence penalty
```

**Rationale:** Deterministic definition enables reproducible liquidity assessment and clear config tuning.

---

### 2) Risk-On/Risk-Off Minimal Rule Set

**Section 5) Submodules → risk_context/risk_on_off_classifier.py — REPLACE:**

**OLD:**
```
- `risk_on_off_classifier.py` → Classifies risk appetite (risk-on: high volume, tight spreads;
  risk-off: low volume, wide spreads, defensive flows)
```

**NEW:**
```
- `risk_on_off_classifier.py` → Classifies risk environment from liquidity_score + realized_vol_percentile:
  - risk_on: liquidity_score >= high_threshold AND realized_vol_percentile <= high_threshold
  - risk_off: liquidity_score < low_threshold OR realized_vol_percentile > extreme_threshold
  - neutral: otherwise
  - All thresholds config-driven (e.g., liquidity high: 60th, low: 40th; vol high: 70th, extreme: 90th)
```

**Section 8) Minimum Acceptance Criteria → Risk Environment — REPLACE:**

**OLD:**
```
- Risk-on/off classifier assesses liquidity and risk appetite
```

**NEW:**
```
- Risk-on/off classifier uses liquidity_score + realized_vol_percentile with config-driven thresholds
- Produces risk_on/risk_off/neutral labels
```

**Rationale:** Removes vague "defensive flows" reference (no data source), defines explicit deterministic rules.

---

### 3) Confidence Scoring Scope Correction

**Section 4) Outputs — REPLACE:**

**OLD (ConfidenceMetrics):**
```
- `ConfidenceMetrics` → regime_type, avg_confidence, calibration_error, misprediction_rate
```

**NEW:**
```
- `ConfidenceMetrics` → regime_type, avg_confidence, distance_from_threshold_avg, persistence_avg
  (Note: calibration_error, misprediction_rate computed in 14_learning_and_evaluation_loop)
```

**Section 8) Minimum Acceptance Criteria → Confidence Calibration — REPLACE:**

**OLD:**
```
✅ **Confidence Calibration:**
- Confidence scores calibrated against historical regime stability
- Low confidence when near threshold boundaries or during transitions
- Confidence metrics tracked (avg confidence, calibration error, misprediction rate)
```

**NEW:**
```
✅ **Confidence Calibration:**
- Confidence computed as function of:
  - distance_from_thresholds (closer to boundary → lower confidence)
  - persistence_bars (more bars in regime → higher confidence)
  - feature_freshness (stale features → confidence penalty)
  - classifier_agreement (vol + trend + risk alignment → higher confidence)
- Low confidence when near threshold boundaries or during transitions
- Confidence metrics tracked: avg confidence, distance_from_threshold_avg, persistence_avg
- Calibration error and misprediction rate computed in 14_learning_and_evaluation_loop (metadata contract placeholder only)
```

**Rationale:** Moves learning-dependent calibration metrics to correct folder; defines deterministic confidence formula.

---

### 4) Trend Regime Taxonomy Consistency

**Decision:** Add `extreme_trend` as 5th regime label (total 5 states).

**Section 4) Outputs → TrendChopRegime — REPLACE:**

**OLD:**
```
- `TrendChopRegime` → symbol, timeframe, timestamp, regime (strong_trend/weak_trend/neutral/choppy),
  confidence, adx, slope_consistency, direction
```

**NEW:**
```
- `TrendChopRegime` → symbol, timeframe, timestamp, regime (extreme_trend/strong_trend/weak_trend/neutral/choppy),
  confidence, adx, slope_consistency, direction
```

**Section 5) Submodules → trend_chop/trend_thresholds.py — REPLACE:**

**OLD:**
```
- `trend_thresholds.py` → ADX breakpoints (e.g., ADX <20: choppy, 20-25: weak trend, 25-40: strong trend, >40: extreme trend)
```

**NEW:**
```
- `trend_thresholds.py` → ADX breakpoints (config-driven defaults):
  - ADX <20: choppy
  - ADX 20-25: weak_trend
  - ADX 25-40: strong_trend
  - ADX >40: extreme_trend
```

**Section 8) Minimum Acceptance Criteria → Trend/Chop Regime — REPLACE:**

**OLD:**
```
- Classifier produces strong_trend/weak_trend/neutral/choppy based on ADX, slope consistency
- ADX thresholds configurable (e.g., <20: choppy, 20-25: weak, 25-40: strong, >40: extreme)
```

**NEW:**
```
- Classifier produces extreme_trend/strong_trend/weak_trend/neutral/choppy (5 states) based on ADX, slope consistency
- ADX thresholds configurable (defaults: <20: choppy, 20-25: weak, 25-40: strong, >40: extreme)
```

**Section 9) Proposed Git Commit — UPDATE:**

**OLD:**
```
- Trend/chop regime (strong_trend/weak_trend/neutral/choppy based on ADX, slope)
```

**NEW:**
```
- Trend/chop regime (extreme_trend/strong_trend/weak_trend/neutral/choppy based on ADX, slope)
```

**Rationale:** Consistent 5-state taxonomy; explicit extreme_trend label instead of implicit flag.

---

## Impact

- **Breaking changes:** None (spec-only, no implementation yet)
- **Downstream dependencies:** None affected (contracts clarified before first implementation)
- **Documentation:** Deterministic formulas enable clear implementation and testing

---

## Approval Status

Awaiting approval for COMMIT-0007 with PATCH_0007 incorporated.
