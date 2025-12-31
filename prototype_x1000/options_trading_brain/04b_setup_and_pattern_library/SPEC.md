# 04B_SETUP_AND_PATTERN_LIBRARY — Specification

**Commit ID:** COMMIT-0008
**Status:** Draft
**Last Updated:** 2025-12-26

---

## 1) Purpose

Responsible for detecting tradable setups and patterns from computed features and regime context. This module transforms raw indicators, price structures, and market regime classifications into actionable **SetupCandidates** with explicit evidence, confidence scores, invalidation conditions, and required confirmations.

This is the **pattern recognition layer**—it consumes features from `03_feature_engineering` and regime context from `04_market_regime`, and outputs structured setup objects that downstream modules (`07_strategy_selection_engine`, `08_signal_generation`) can evaluate and act upon.

All detection logic is **deterministic and replay-safe** for backtesting.

---

## 2) Owns / Does Not Own

### Owns
- Setup and pattern detection rules (catalog of tradable patterns)
- Volatility squeeze detection (formation, persistence, release, direction inference)
- Range/consolidation detection (`RangeZone` as first-class detector)
- Confluence zone identification (overlapping levels, multi-setup alignment)
- Multi-timeframe confirmation logic for setups (D1 bias + M5 trigger)
- Setup scoring and confidence computation
- Setup state machine (detected → active → triggered/invalidated/expired)
- Invalidation and expiry logic
- Setup versioning and provenance tracking
- Write contract to `02_data_store` for persistence

### Does Not Own
- Feature computation (that's `03_feature_engineering`)
- Regime classification (that's `04_market_regime`)
- Visual rendering of zones/patterns (that's `03b_charting_and_visual_context`)
- Strategy selection logic (that's `07_strategy_selection_engine`)
- Signal execution or trade entry (that's `08_signal_generation`)
- Position sizing or risk calculations (that's `10_risk_management`)
- Performance evaluation or calibration (that's `14_learning_and_evaluation_loop`)

---

## 3) Inputs

**From 02_data_store (processed/):**
- `DerivedSeries` → Indicators (EMA, RSI, MACD, ADX, ATR, Bollinger Bands, Keltner Channels, etc.)
- `PriceStructure` → Swing highs/lows, support/resistance levels, gap zones, volume profile nodes (POC, VAH, VAL, HVN, LVN)
- `TrendMetrics` → Slope, consistency, direction, strength
- `VolumeProfile` → POC, value area, HVN/LVN distribution

**From 02_data_store (raw/):**
- `NormalizedBar[]` → OHLCV for pattern detection, range calculation
- `NormalizedQuote` → Real-time bid/ask for freshness assessment

**From 04_market_regime:**
- `VolatilityRegime` → low/normal/high/extreme
- `TrendChopRegime` → extreme_trend/strong_trend/weak_trend/neutral/choppy
- `RiskEnvironment` → risk_on/risk_off/neutral
- `MultiTimeframeAlignment` → D1/H4/H1/M15/M5 regime coherence
- `RegimeConfidence` → Per-regime confidence scores

**From 01_data_ingestion (via 02):**
- `DataQualityReport` → quality_score, quality_flags, is_valid
- `ProvenanceMetadata` → freshness, staleness assessment

**From 00_core:**
- `Config` → Setup parameters, thresholds, weights, timeouts
- `Logger` → Structured logging with trace IDs
- `TimeframeModel` → Timeframe validation, lookback requirements
- `SystemClock` → Deterministic time (real or backtest-injected)
- `EventCalendar` → Earnings, dividends, economic events (for news filter)

---

## 4) Outputs

**To 02_data_store (processed/):**

All outputs include provenance and are written to dedicated stores.

---

### Canonical Output Schemas

---

#### SetupCandidate
```
SetupCandidate:
  - setup_id: uuid                   # Unique setup instance identifier
  - setup_type: string               # e.g., "trend_pullback", "breakout_retest", "squeeze_release"
  - symbol: string                   # Ticker symbol
  - timeframe: string                # Primary detection timeframe
  - timestamp_utc: datetime          # Detection timestamp (UTC)
  - timestamp_exchange: datetime     # Detection timestamp (exchange local)
  - exchange_timezone: string        # e.g., "America/New_York"

  # State
  - state: SetupState                # detected/active/triggered/invalidated/expired
  - state_changed_at: datetime       # Last state transition timestamp
  - bars_since_detection: int        # Age in bars
  - time_since_detection_ms: int     # Age in milliseconds

  # Pricing context
  - detection_price: decimal         # Price at detection
  - trigger_price: decimal | null    # Price that would trigger entry
  - invalidation_price: decimal      # Price that invalidates setup
  - target_price: decimal | null     # Initial target (if computable)

  # Confidence + scoring
  - confidence: float                # 0.0–1.0 overall confidence
  - confidence_breakdown: ConfidenceBreakdown
  - quality_adjusted: bool           # True if confidence was penalized for quality

  # Inputs used (for reproducibility)
  - inputs_used: InputManifest

  # Regime context at detection
  - regime_context: RegimeContext

  # Evidence
  - evidence: SetupEvidence          # Pattern-specific evidence fields

  # Confirmations
  - required_confirmations: Confirmation[]
  - optional_confirmations: Confirmation[]
  - confirmations_met: string[]      # List of confirmation IDs met

  # Provenance
  - provenance: SetupProvenance
```

---

#### ConfidenceBreakdown
```
ConfidenceBreakdown:
  - signal_strength: float           # 0.0–1.0 (how strong is the pattern signal)
  - confluence_count: int            # Number of supporting factors
  - confluence_score: float          # 0.0–1.0 (weighted confluence)
  - regime_fit: float                # 0.0–1.0 (how well regime supports this setup)
  - mtf_alignment: float             # 0.0–1.0 (multi-timeframe alignment score)
  - freshness: float                 # 0.0–1.0 (data quality/freshness)
  - invalidation_distance: float     # 0.0–1.0 (normalized distance to invalidation)
  - volume_confirmation: float       # 0.0–1.0 (volume support)
```

---

#### InputManifest
```
InputManifest:
  - features: FeatureRef[]           # List of features used
  - price_structures: string[]       # e.g., ["swing_highs", "poc", "vah"]
  - regime_refs: string[]            # e.g., ["vol_regime", "trend_regime"]
  - data_quality_score: float        # Minimum quality score of inputs
  - staleness_max_ms: int            # Maximum staleness of any input

FeatureRef:
  - feature_name: string             # e.g., "ema_20", "rsi_14", "bbw"
  - feature_version: string          # e.g., "1.0.0"
  - timestamp_utc: datetime          # Feature timestamp used
```

---

#### RegimeContext
```
RegimeContext:
  - volatility_regime: string        # low/normal/high/extreme
  - volatility_confidence: float     # 0.0–1.0
  - trend_regime: string             # extreme_trend/strong_trend/weak_trend/neutral/choppy
  - trend_confidence: float          # 0.0–1.0
  - trend_direction: string          # up/down/neutral
  - risk_environment: string         # risk_on/risk_off/neutral
  - risk_confidence: float           # 0.0–1.0
  - mtf_alignment_score: float       # 0.0–1.0
  - mtf_alignment_detail: MtfDetail  # Per-timeframe alignment
```

---

#### SetupEvidence
```
SetupEvidence:
  - pattern_name: string             # Human-readable pattern name
  - key_levels: KeyLevel[]           # Relevant price levels
  - trigger_bars: int[]              # Bar indices that formed the pattern
  - trigger_conditions: string[]     # Conditions that fired
  - supporting_indicators: IndicatorSnapshot[]
  - volume_profile_context: VolumeProfileContext | null
  - custom_fields: dict              # Pattern-specific evidence (flexible)
```

---

#### Confirmation
```
Confirmation:
  - confirmation_id: string          # Unique ID (e.g., "volume_spike", "mtf_trend_align")
  - description: string              # Human-readable description
  - is_required: bool                # True if mandatory for trigger
  - is_met: bool                     # True if condition satisfied
  - met_at: datetime | null          # When condition was met
  - condition_expression: string     # Deterministic condition (for audit)
```

---

#### SetupState
```
SetupState: enum
  - detected                         # Pattern detected, awaiting confirmation
  - active                           # Confirmed, awaiting trigger
  - triggered                        # Trigger condition met, ready for signal
  - invalidated                      # Invalidation condition hit
  - expired                          # Time/bar expiry reached without trigger
```

---

#### SetupProvenance
```
SetupProvenance:
  - detector_version: string         # e.g., "1.2.0"
  - rule_hash: string                # SHA256 of detection rule config
  - config_snapshot: dict            # Parameters used at detection time
  - detection_latency_ms: int        # Time to compute detection
  - created_at: datetime             # Record creation timestamp
  - updated_at: datetime             # Last update timestamp
```

---

#### SetupMetrics (placeholder)
```
SetupMetrics:
  - setup_type: string
  - timeframe: string
  - count_detected: int              # Total detections
  - count_triggered: int             # Transitioned to triggered
  - count_invalidated: int           # Transitioned to invalidated
  - count_expired: int               # Transitioned to expired
  - avg_confidence: float            # Average confidence at detection
  - period_start: datetime
  - period_end: datetime

Note: Detailed hit rates, P&L attribution, and calibration computed in 14_learning_and_evaluation_loop.
```

---

#### PatternDetection
```
PatternDetection:
  - pattern_id: uuid
  - pattern_type: string             # e.g., "double_bottom", "head_shoulders", "wedge"
  - symbol: string
  - timeframe: string
  - timestamp_utc: datetime
  - formation_start: datetime        # When pattern started forming
  - formation_end: datetime          # When pattern completed
  - key_points: PricePoint[]         # Pivots/swings defining the pattern
  - neckline: decimal | null         # For applicable patterns
  - measured_move: decimal | null    # Projected target distance
  - confidence: float
  - regime_context: RegimeContext
  - inputs_used: InputManifest
  - provenance: SetupProvenance
```

---

#### ConfluenceZone
```
ConfluenceZone:
  - zone_id: uuid
  - symbol: string
  - timeframe: string
  - timestamp_utc: datetime
  - zone_high: decimal               # Upper bound
  - zone_low: decimal                # Lower bound
  - zone_mid: decimal                # Midpoint
  - confluence_factors: ConfluenceFactor[]
  - confluence_score: float          # 0.0–1.0
  - zone_type: string                # "support" | "resistance" | "pivot"
  - strength: string                 # "weak" | "moderate" | "strong"
  - provenance: SetupProvenance

ConfluenceFactor:
  - factor_type: string              # e.g., "ema_50", "poc", "swing_low", "fib_618"
  - price_level: decimal
  - weight: float                    # Contribution to zone score
```

---

#### RangeZone
```
RangeZone:
  - zone_id: uuid
  - symbol: string
  - timeframe: string
  - timestamp_utc: datetime          # Detection timestamp
  - range_start: datetime            # When range began
  - range_end: datetime | null       # When range ended (null if active)
  - range_high: decimal              # Upper boundary
  - range_low: decimal               # Lower boundary
  - range_mid: decimal               # Midpoint / equilibrium
  - range_atr_normalized: float      # (high - low) / ATR at detection
  - bars_in_range: int               # Duration in bars
  - is_active: bool                  # True if still in range
  - breakout_direction: string | null  # "up" | "down" | null
  - breakout_timestamp: datetime | null
  - poc_within_range: decimal | null # POC if volume profile available
  - mean_reversion_target: decimal   # Range midpoint (for MR setups)
  - confidence: float                # Range detection confidence
  - regime_context: RegimeContext
  - provenance: SetupProvenance
```

---

### Squeeze-Specific Schemas

---

#### SqueezeSignal
```
SqueezeSignal:
  - signal_id: uuid
  - symbol: string
  - timeframe: string
  - timestamp_utc: datetime          # Signal timestamp
  - timestamp_exchange: datetime
  - exchange_timezone: string

  # Squeeze state
  - state: SqueezeState              # inactive/forming/active/releasing/released/expired
  - squeeze_on_bars: int             # Bars in squeeze (0 if not active)
  - squeeze_age_ms: int              # Duration in milliseconds
  - last_squeeze_start: datetime | null  # When current/last squeeze began

  # Squeeze range
  - squeeze_range_high: decimal      # High of range during squeeze
  - squeeze_range_low: decimal       # Low of range during squeeze
  - squeeze_range_mid: decimal       # Midpoint
  - squeeze_range_atr: float         # Range as multiple of ATR

  # Compression metrics
  - compression_score: float         # 0.0–1.0 (higher = more compressed)
  - bbw_percentile: float            # Bollinger Band Width percentile (0–100)
  - atr_percentile: float            # ATR percentile (0–100)
  - kc_overlap: bool                 # True if BB inside KC

  # Release information (if releasing/released)
  - release_type: string | null      # "fast_release" | "confirmed_release" | null
  - release_timestamp: datetime | null
  - release_bar_index: int | null

  # Direction (if released)
  - direction: string | null         # "up" | "down" | null
  - direction_confidence: float      # 0.0–1.0
  - direction_evidence: DirectionEvidence | null

  # Overall confidence
  - overall_confidence: float        # 0.0–1.0
  - confidence_breakdown: SqueezeConfidenceBreakdown

  # Quality
  - data_quality_score: float        # Input data quality
  - quality_adjusted: bool           # True if confidence penalized

  # Evidence
  - evidence: SqueezeEvidence

  # Provenance
  - provenance: SqueezeProvenance
```

---

#### SqueezeState
```
SqueezeState: enum
  - inactive                         # No squeeze detected
  - forming                          # Compression starting but not confirmed
  - active                           # Squeeze confirmed (compression thresholds met)
  - releasing                        # Expansion detected, awaiting direction confirm
  - released                         # Full release with direction confirmed
  - expired                          # Squeeze ended without clean release
```

---

#### DirectionEvidence
```
DirectionEvidence:
  - break_price: decimal             # Price at breakout
  - break_distance_atr: float        # Distance from squeeze range as ATR multiple
  - break_direction: string          # "above_high" | "below_low"
  - momentum_confirm: bool           # True if momentum indicator confirms
  - momentum_indicator: string       # e.g., "macd_hist", "rsi"
  - momentum_value: float            # Indicator value at break
  - volume_confirm: bool             # True if volume confirms
  - rvol_percentile: float           # Relative volume percentile
  - candle_body_ratio: float         # Body size / total range (conviction)
  - mtf_alignment_confirm: bool      # True if higher TF supports direction
```

---

#### SqueezeConfidenceBreakdown
```
SqueezeConfidenceBreakdown:
  - compression_strength: float      # How tight the squeeze (0–1)
  - persistence_score: float         # How long squeeze held (0–1)
  - release_clarity: float           # How clean the release (0–1)
  - direction_clarity: float         # How clear the direction (0–1)
  - volume_support: float            # Volume confirmation (0–1)
  - mtf_alignment: float             # Multi-timeframe support (0–1)
  - freshness: float                 # Data freshness (0–1)
```

---

#### SqueezeEvidence
```
SqueezeEvidence:
  - bbw_value: float                 # Bollinger Band Width value
  - bbw_percentile: float            # BBW percentile over lookback
  - kcw_value: float                 # Keltner Channel Width value
  - atr_value: float                 # ATR value
  - atr_percentile: float            # ATR percentile over lookback
  - range_percentile: float          # (H-L)/C percentile
  - bb_upper: decimal                # Bollinger upper at detection
  - bb_lower: decimal                # Bollinger lower at detection
  - bb_mid: decimal                  # Bollinger mid (SMA)
  - kc_upper: decimal                # Keltner upper at detection
  - kc_lower: decimal                # Keltner lower at detection
  - adx_value: float | null          # ADX if available
  - macd_hist: float | null          # MACD histogram if available
  - rsi_value: float | null          # RSI if available
  - slope_20: float | null           # 20-period price slope
```

---

#### SqueezeProvenance
```
SqueezeProvenance:
  - detector_version: string         # e.g., "1.0.0"
  - algorithm_id: string             # "bbkc_squeeze_v1"
  - rule_hash: string                # SHA256 of squeeze config
  - config_snapshot: SqueezeConfig   # Full config used
  - detection_latency_ms: int
  - created_at: datetime
  - updated_at: datetime
```

---

## 5) Setup Library Catalog

### Minimum Required Setups (10)

Each setup definition includes:
- **Name + Intent**
- **Required Inputs/Features**
- **Preconditions (including regime filters)**
- **Trigger Condition**
- **Invalidation Condition**
- **Required/Optional Confirmations**
- **Output Evidence Fields**

---

### 5.1) Trend Pullback (MA/VWAP Reclaim)

**Intent:** Enter in direction of trend after pullback to dynamic support/resistance.

**Required Inputs:**
- `NormalizedBar[]` (OHLCV)
- `DerivedSeries`: EMA_20, EMA_50, VWAP (intraday), ATR_14
- `TrendMetrics`: slope, direction
- `TrendChopRegime`: must be strong_trend or extreme_trend

**Preconditions:**
- `trend_regime` in [strong_trend, extreme_trend]
- `trend_direction` matches setup direction (up for long pullback)
- Price was above EMA_20 (for long) within last N bars
- Price pulled back to touch or pierce EMA_20/VWAP

**Trigger Condition:**
- Close reclaims above EMA_20 (long) or below (short)
- Candle body confirms direction (close > open for long)

**Invalidation Condition:**
- Close below EMA_50 (long) or above (short)
- Trend regime changes to choppy/neutral

**Confirmations:**
- Required: Reclaim candle closes in direction
- Optional: Volume above average, RSI not overbought/oversold

**Evidence Fields:**
- pullback_low, reclaim_bar_index, ema_20_at_reclaim, vwap_at_reclaim, slope_value

---

### 5.2) Breakout + Retest (Level-Based)

**Intent:** Enter after breakout of key level and successful retest as new support/resistance.

**Required Inputs:**
- `PriceStructure`: swing_highs, swing_lows, horizontal_levels
- `NormalizedBar[]`
- `DerivedSeries`: ATR_14, volume
- `VolumeProfile`: POC, VAH, VAL (if available)

**Preconditions:**
- Key level identified (swing high/low, POC, VAH/VAL)
- Price broke level with conviction (close beyond level + ATR buffer)

**Trigger Condition:**
- Price retests broken level (touches or comes within 0.5 ATR)
- Holds level (no close back through)
- Confirmation candle in breakout direction

**Invalidation Condition:**
- Close back through level by > 1 ATR
- 3+ bars closing on wrong side

**Confirmations:**
- Required: Retest hold (no close through)
- Optional: Volume spike on breakout, declining volume on retest

**Evidence Fields:**
- breakout_level, breakout_bar_index, retest_bar_index, retest_low/high, hold_distance_atr

---

### 5.3) Range Mean Reversion (Inside RangeZone)

**Intent:** Fade moves to range extremes, targeting range midpoint.

**Required Inputs:**
- `RangeZone` (from this module's range detector)
- `NormalizedBar[]`
- `DerivedSeries`: RSI_14, ATR_14
- `TrendChopRegime`: must be choppy or neutral

**Preconditions:**
- Active `RangeZone` detected
- `trend_regime` is choppy or neutral
- Price at or near range extreme (within 0.25 ATR of high/low)

**Trigger Condition:**
- Rejection candle at range extreme (wick > 50% of range, body reverses)
- RSI at extreme (>70 at range high, <30 at range low)

**Invalidation Condition:**
- Close beyond range boundary by > 0.5 ATR
- Range breakout confirmed

**Confirmations:**
- Required: Rejection candle pattern
- Optional: Volume spike on rejection, divergence

**Evidence Fields:**
- range_id, range_high, range_low, entry_price, target_price (range_mid), rejection_bar_index

---

### 5.4) Momentum Continuation (HH/HL or LL/LH + Trend Strength)

**Intent:** Continue with established trend after healthy consolidation.

**Required Inputs:**
- `PriceStructure`: swing_highs, swing_lows
- `DerivedSeries`: ADX_14, EMA_20
- `TrendMetrics`: direction, slope_consistency
- `TrendChopRegime`

**Preconditions:**
- Clear HH/HL sequence (uptrend) or LL/LH (downtrend)
- ADX > 25 (trending)
- `trend_regime` is strong_trend or extreme_trend

**Trigger Condition:**
- New swing low holds above prior swing low (uptrend)
- Break above most recent swing high

**Invalidation Condition:**
- Swing low violation (uptrend)
- ADX drops below 20

**Confirmations:**
- Required: Swing structure intact
- Optional: Volume expansion on breakout

**Evidence Fields:**
- swing_sequence (list of swing points), adx_at_trigger, ema_20_slope

---

### 5.5) Volatility Expansion (Squeeze Release)

**Intent:** Capture explosive move after volatility compression.

**Required Inputs:**
- `SqueezeSignal` (from squeeze_detection submodule)
- All squeeze inputs (BBW, KCW, ATR, etc.)

**Preconditions:**
- `SqueezeSignal.state` is active or releasing
- `squeeze_on_bars` >= config.min_squeeze_bars

**Trigger Condition:**
- `SqueezeSignal.state` transitions to released
- `direction` is confirmed ("up" or "down")
- `direction_confidence` >= config.min_direction_confidence

**Invalidation Condition:**
- Price reverses back into squeeze range
- Direction confidence drops below threshold
- Squeeze expires without clean release

**Confirmations:**
- Required: Direction confirmation (momentum + break)
- Optional: Volume spike, MTF alignment

**Evidence Fields:**
- squeeze_signal_id, squeeze_on_bars, release_type, direction, compression_score, all squeeze evidence

*Note: Full squeeze detection algorithm defined in Section 6.*

---

### 5.6) Gap Fill Setup

**Intent:** Trade toward gap fill after partial gap fill or gap fade.

**Required Inputs:**
- `PriceStructure`: gap_zones (from 03_feature_engineering)
- `NormalizedBar[]`
- `DerivedSeries`: ATR_14, VWAP

**Preconditions:**
- Unfilled or partially filled gap identified
- Price approaching gap zone

**Trigger Condition (Partial Fill):**
- Price enters gap zone
- Rejection at partial fill level (50%, 61.8%)
- Direction toward full gap fill

**Trigger Condition (Full Fill):**
- Price fills gap completely
- Reversal pattern at fill level

**Invalidation Condition:**
- Close beyond gap zone in wrong direction
- Gap fill trade fails (price continues through)

**Confirmations:**
- Required: Candle pattern at gap level
- Optional: Volume confirmation, time of day (gaps often fill in first hour)

**Evidence Fields:**
- gap_high, gap_low, gap_fill_pct, entry_bar_index, target_price

---

### 5.7) Failed Breakdown / Failed Breakout (Trap)

**Intent:** Fade false breakouts that trap traders on wrong side.

**Required Inputs:**
- `PriceStructure`: support_resistance, swing_highs, swing_lows
- `NormalizedBar[]`
- `DerivedSeries`: ATR_14, volume

**Preconditions:**
- Key level identified
- Breakout attempt occurred (close beyond level)
- Quick reversal back through level (within 1-3 bars)

**Trigger Condition:**
- Close back inside range/level
- Momentum shifting opposite to failed break
- "Trap" candle pattern (engulfing, pin bar)

**Invalidation Condition:**
- Breakout resumes (close beyond level again)
- No follow-through on reversal

**Confirmations:**
- Required: Close back through level
- Optional: Volume spike on reversal, divergence

**Evidence Fields:**
- trapped_level, false_break_bar, reversal_bar, trap_distance_atr

---

### 5.8) Volume Profile Rejection (VAH/VAL/POC Rejection)

**Intent:** Trade rejection at key volume profile levels.

**Required Inputs:**
- `VolumeProfile`: POC, VAH, VAL
- `NormalizedBar[]`
- `DerivedSeries`: ATR_14

**Preconditions:**
- Clear VAH, VAL, POC levels identified
- Price approaching or at volume profile level

**Trigger Condition:**
- Touch or pierce of VAH/VAL/POC
- Rejection candle (wick rejection, body reverses)
- Direction toward value area (if at extreme) or away (if at POC in trend)

**Invalidation Condition:**
- Close beyond level by > 0.5 ATR
- Acceptance (multiple bars closing beyond level)

**Confirmations:**
- Required: Rejection candle
- Optional: Delta divergence, LVN below/above

**Evidence Fields:**
- profile_level_type (POC/VAH/VAL), level_price, rejection_bar, wick_size

---

### 5.9) Divergence Reversal (Price vs. Oscillator)

**Intent:** Fade price extreme when momentum diverges.

**Required Inputs:**
- `DerivedSeries`: RSI_14, MACD, MACD_hist
- `PriceStructure`: swing_highs, swing_lows
- `NormalizedBar[]`

**Preconditions:**
- Price makes new swing high/low
- Oscillator does NOT confirm (lower high on RSI while price higher high = bearish div)
- At least 2 swing points for comparison

**Trigger Condition:**
- Divergence confirmed (swing high/low + oscillator divergence)
- Reversal candle pattern
- Momentum shifting

**Invalidation Condition:**
- Price makes new extreme that oscillator confirms
- Divergence negated

**Confirmations:**
- Required: Divergence + reversal candle
- Optional: Volume confirmation, support/resistance nearby

**Evidence Fields:**
- divergence_type (bullish/bearish), price_swings, oscillator_values, reversal_bar

---

### 5.10) Opening Range Breakout (ORB)

**Intent:** Trade breakout of first N minutes range.

**Required Inputs:**
- `NormalizedBar[]` (intraday, 1m or 5m)
- `DerivedSeries`: ATR_14, VWAP
- Session boundaries from `00_core`

**Preconditions:**
- Within configured ORB time window (e.g., first 15, 30, or 60 minutes)
- Opening range established (ORH, ORL)
- Not a holiday or early close

**Trigger Condition:**
- Close beyond ORH (long) or ORL (short)
- Breakout candle has conviction (body > 50% of candle)
- Volume above opening range average

**Invalidation Condition:**
- Close back inside opening range
- Time decay (e.g., no trigger by 11:00 AM)

**Confirmations:**
- Required: Close beyond range
- Optional: VWAP support, volume spike

**Evidence Fields:**
- orb_high, orb_low, orb_duration_minutes, breakout_bar, breakout_volume

---

## 6) Squeeze Detection (Volatility Squeeze Early Detection)

### 6.1) Canonical Squeeze Detection Features (Inputs Required)

**From 03_feature_engineering / 02_data_store:**
- `bbw` — Bollinger Band Width = (BB_upper - BB_lower) / BB_mid
- `kcw` — Keltner Channel Width = (KC_upper - KC_lower) / KC_mid
- `atr` — ATR (14-period default)
- `atr_percentile` — ATR percentile over rolling lookback
- `bbw_percentile` — BBW percentile over rolling lookback
- `range_percentile` — (high - low) / close percentile over lookback
- `rvol` — Relative volume (current volume / avg volume)
- `rvol_percentile` — RVOL percentile

**For direction inference:**
- `macd_hist` — MACD histogram
- `rsi` — RSI (14-period)
- `slope_20` — 20-period price slope (linear regression)
- `adx` — ADX for trend strength

---

### 6.2) Squeeze Configuration Schema

```
SqueezeConfig:
  # Formation thresholds
  bbw_pctl_max: float                # Default: 20.0 (BBW must be below 20th percentile)
  atr_pctl_max: float                # Default: 25.0 (ATR must be below 25th percentile)
  range_pctl_max: float              # Default: 20.0 (Daily range percentile)
  compression_min: float             # Default: 0.6 (Minimum compression score 0–1)
  min_bars_on: int                   # Default: 3 (Minimum bars to confirm squeeze)
  quick_call_min_bars: int           # Default: 1 (For fast detection mode)

  # Compression score weights (must sum to 1.0)
  w_bbw: float                       # Default: 0.35
  w_atr: float                       # Default: 0.30
  w_range: float                     # Default: 0.20
  w_kc_overlap: float                # Default: 0.15

  # KC overlap detection
  kc_overlap_mode: string            # "inside" | "width_ratio"
  kc_width_ratio_threshold: float    # Default: 0.8 (BBW < 0.8 * KCW)

  # Release thresholds (FAST mode)
  fast_release_bbw_delta: float      # Default: 0.3 (30% BBW expansion)
  fast_release_atr_delta: float      # Default: 0.2 (20% ATR expansion)
  fast_release_confirm_bars: int     # Default: 1

  # Release thresholds (CONFIRMED mode)
  confirmed_release_bbw_delta: float # Default: 0.5 (50% BBW expansion)
  confirmed_release_atr_delta: float # Default: 0.4 (40% ATR expansion)
  confirmed_release_confirm_bars: int # Default: 2

  # Direction inference
  direction_break_atr_min: float     # Default: 0.5 (Break must be > 0.5 ATR from range)
  momentum_confirm_mode: string      # "macd" | "rsi" | "slope" | "any"
  macd_hist_threshold: float         # Default: 0.0 (> 0 for up, < 0 for down)
  rsi_up_threshold: float            # Default: 50.0 (RSI > 50 for up)
  rsi_down_threshold: float          # Default: 50.0 (RSI < 50 for down)
  slope_threshold: float             # Default: 0.0 (positive for up, negative for down)
  require_volume_confirm: bool       # Default: true
  volume_confirm_pctl: float         # Default: 60.0 (RVOL must be > 60th percentile)

  # MTF alignment
  require_mtf_alignment: bool        # Default: false (for quick-call mode)
  mtf_alignment_min: float           # Default: 0.5 (if required)

  # Expiry
  max_squeeze_bars: int              # Default: 50 (squeeze expires if no release)
  release_expiry_bars: int           # Default: 10 (released state expires)
  cooldown_bars: int                 # Default: 5 (bars before re-detection)

  # Quality
  min_data_quality: float            # Default: 0.7
  quality_confidence_penalty: float  # Default: 0.2 (penalty per 0.1 quality drop)

  # Lookback
  percentile_lookback: int           # Default: 100 (bars for percentile calc)
```

---

### 6.3) Deterministic Squeeze Formation Rule

**Compression Score Calculation:**

```
# Invert percentiles (lower percentile = higher compression)
bbw_pctl_inv = 1.0 - (bbw_percentile / 100.0)
atr_pctl_inv = 1.0 - (atr_percentile / 100.0)
range_pctl_inv = 1.0 - (range_percentile / 100.0)

# KC overlap flag
if config.kc_overlap_mode == "inside":
    kc_overlap_flag = 1.0 if (bb_upper <= kc_upper AND bb_lower >= kc_lower) else 0.0
elif config.kc_overlap_mode == "width_ratio":
    kc_overlap_flag = 1.0 if (bbw < config.kc_width_ratio_threshold * kcw) else 0.0

# Weighted compression score
compression_score = (
    config.w_bbw * bbw_pctl_inv +
    config.w_atr * atr_pctl_inv +
    config.w_range * range_pctl_inv +
    config.w_kc_overlap * kc_overlap_flag
)
```

**Formation Condition:**

```
squeeze_forming = (
    kc_overlap_flag == 1.0 AND
    bbw_percentile <= config.bbw_pctl_max AND
    atr_percentile <= config.atr_pctl_max AND
    compression_score >= config.compression_min
)

squeeze_on = (
    squeeze_forming AND
    squeeze_on_bars >= config.min_bars_on
)

# Quick-call mode (earliest detection)
squeeze_on_quick = (
    squeeze_forming AND
    squeeze_on_bars >= config.quick_call_min_bars
)
```

---

### 6.4) Squeeze Persistence Tracking

```
# State variables (per symbol + timeframe)
squeeze_on_bars: int = 0            # Counter of consecutive squeeze bars
squeeze_age_ms: int = 0             # Duration in milliseconds
squeeze_start_timestamp: datetime | null
squeeze_range_high: decimal         # Highest high during squeeze
squeeze_range_low: decimal          # Lowest low during squeeze
last_compression_score: float

# Update logic (per bar)
if squeeze_forming:
    if squeeze_on_bars == 0:
        squeeze_start_timestamp = current_bar.timestamp_utc
        squeeze_range_high = current_bar.high
        squeeze_range_low = current_bar.low
    else:
        squeeze_range_high = max(squeeze_range_high, current_bar.high)
        squeeze_range_low = min(squeeze_range_low, current_bar.low)

    squeeze_on_bars += 1
    squeeze_age_ms = (current_bar.timestamp_utc - squeeze_start_timestamp).total_milliseconds()
    last_compression_score = compression_score
else:
    # Squeeze broken - check for release or reset
    if squeeze_on_bars > 0:
        evaluate_release()
    squeeze_on_bars = 0
```

---

### 6.5) Squeeze Release Detection ("Quick Callout")

**Release Detection Algorithm:**

```
def evaluate_release():
    # Calculate expansion deltas
    bbw_delta = (current_bbw - squeeze_bbw_at_start) / squeeze_bbw_at_start
    atr_delta = (current_atr - squeeze_atr_at_start) / squeeze_atr_at_start

    # Check break from squeeze range
    broke_above = current_close > squeeze_range_high
    broke_below = current_close < squeeze_range_low
    break_distance_atr = 0.0

    if broke_above:
        break_distance_atr = (current_close - squeeze_range_high) / current_atr
    elif broke_below:
        break_distance_atr = (squeeze_range_low - current_close) / current_atr

    # FAST_RELEASE (earliest callout)
    fast_release = (
        bbw_delta >= config.fast_release_bbw_delta AND
        atr_delta >= config.fast_release_atr_delta AND
        (broke_above OR broke_below) AND
        break_distance_atr >= config.direction_break_atr_min AND
        bars_since_squeeze_end <= config.fast_release_confirm_bars
    )

    # CONFIRMED_RELEASE (higher confidence)
    confirmed_release = (
        bbw_delta >= config.confirmed_release_bbw_delta AND
        atr_delta >= config.confirmed_release_atr_delta AND
        (broke_above OR broke_below) AND
        break_distance_atr >= config.direction_break_atr_min AND
        bars_since_squeeze_end <= config.confirmed_release_confirm_bars
    )

    if confirmed_release:
        return ReleaseResult(type="confirmed_release", direction=infer_direction())
    elif fast_release:
        return ReleaseResult(type="fast_release", direction=infer_direction())
    else:
        return ReleaseResult(type=None, direction=None)
```

---

### 6.6) Direction Inference with Confidence

**Direction Determination:**

```
def infer_direction():
    direction = None
    momentum_confirm = False
    volume_confirm = False

    # Primary: Price break direction
    if current_close > squeeze_range_high:
        direction = "up"
    elif current_close < squeeze_range_low:
        direction = "down"
    else:
        return DirectionResult(direction=None, confidence=0.0)

    # Momentum confirmation
    if config.momentum_confirm_mode == "macd":
        momentum_confirm = (
            (direction == "up" AND macd_hist > config.macd_hist_threshold) OR
            (direction == "down" AND macd_hist < -config.macd_hist_threshold)
        )
    elif config.momentum_confirm_mode == "rsi":
        momentum_confirm = (
            (direction == "up" AND rsi > config.rsi_up_threshold) OR
            (direction == "down" AND rsi < config.rsi_down_threshold)
        )
    elif config.momentum_confirm_mode == "slope":
        momentum_confirm = (
            (direction == "up" AND slope_20 > config.slope_threshold) OR
            (direction == "down" AND slope_20 < -config.slope_threshold)
        )
    elif config.momentum_confirm_mode == "any":
        momentum_confirm = (
            check_macd() OR check_rsi() OR check_slope()
        )

    # Fallback if momentum data missing: candle body dominance
    if momentum_data_missing:
        body_ratio = abs(close - open) / (high - low)
        candle_bullish = close > open
        momentum_confirm = (
            (direction == "up" AND candle_bullish AND body_ratio > 0.6) OR
            (direction == "down" AND NOT candle_bullish AND body_ratio > 0.6)
        )

    # Volume confirmation
    if config.require_volume_confirm:
        volume_confirm = rvol_percentile >= config.volume_confirm_pctl
    else:
        volume_confirm = True  # Not required

    # MTF alignment
    mtf_aligned = True
    if config.require_mtf_alignment:
        mtf_aligned = mtf_alignment_score >= config.mtf_alignment_min

    # Direction confidence calculation
    direction_confidence = compute_direction_confidence(
        break_distance_atr=break_distance_atr,
        momentum_confirm=momentum_confirm,
        volume_confirm=volume_confirm,
        mtf_aligned=mtf_aligned,
        body_ratio=body_ratio
    )

    return DirectionResult(
        direction=direction,
        confidence=direction_confidence,
        momentum_confirm=momentum_confirm,
        volume_confirm=volume_confirm,
        mtf_aligned=mtf_aligned
    )
```

**Direction Confidence Calculation:**

```
def compute_direction_confidence(break_distance_atr, momentum_confirm, volume_confirm, mtf_aligned, body_ratio):
    # Base confidence from break distance (0.3–0.6)
    break_conf = min(0.6, 0.3 + (break_distance_atr * 0.3))

    # Momentum contribution (+0.15 if confirmed)
    momentum_conf = 0.15 if momentum_confirm else 0.0

    # Volume contribution (+0.10 if confirmed)
    volume_conf = 0.10 if volume_confirm else 0.0

    # MTF alignment contribution (+0.10 if aligned)
    mtf_conf = 0.10 if mtf_aligned else 0.0

    # Candle conviction (+0.05 for strong body)
    candle_conf = 0.05 if body_ratio > 0.7 else 0.0

    # Total confidence (capped at 1.0)
    total = min(1.0, break_conf + momentum_conf + volume_conf + mtf_conf + candle_conf)

    return total
```

---

### 6.7) Safety + False Positive Handling

**Quality-Based Suppression:**

```
# Apply quality penalty
if data_quality_score < config.min_data_quality:
    # Suppress squeeze entirely
    squeeze_signal.state = SqueezeState.inactive
    squeeze_signal.overall_confidence = 0.0
    return

# Partial quality penalty
quality_penalty = 0.0
if data_quality_score < 1.0:
    quality_shortfall = 1.0 - data_quality_score
    quality_penalty = quality_shortfall * config.quality_confidence_penalty * 10
    squeeze_signal.confidence_breakdown.freshness = max(0.0, 1.0 - quality_penalty)
    squeeze_signal.quality_adjusted = True
```

**Event Calendar Filter (if available):**

```
# Check for news/events that might cause false squeeze releases
if event_calendar_available:
    upcoming_events = get_events_within(hours=2)
    if any(e.importance == "high" for e in upcoming_events):
        # Increase confirmation requirements
        config.fast_release_confirm_bars += 1
        config.confirmed_release_confirm_bars += 1
        # Note: Document that this is active
```

**Timeframe-Specific Thresholds:**

```
# Micro timeframes (1m, 5m) have more noise
if timeframe in ["1m", "5m"]:
    config.min_bars_on = max(config.min_bars_on, 5)
    config.compression_min += 0.1  # Require tighter compression
    config.direction_break_atr_min += 0.2  # Require larger break
```

**Tradeoff Documentation:**

```
# FAST_RELEASE mode tradeoffs:
# - Pros: Earlier entry, captures more of the move
# - Cons: Higher false positive rate (estimated 15-25% higher than CONFIRMED)
# - Mitigation: Quality filters, regime alignment, volume confirmation
#
# CONFIRMED_RELEASE mode tradeoffs:
# - Pros: Higher accuracy, fewer whipsaws
# - Cons: Later entry, may miss first 0.5-1.0 ATR of move
# - Recommended for: Larger position sizes, lower risk tolerance
```

---

## 7) Scoring + Confidence (All Setups)

### Deterministic Confidence Function

```
def compute_setup_confidence(
    signal_strength: float,      # 0–1: How strong is the pattern signal
    confluence_count: int,       # Number of supporting factors
    confluence_factors: list,    # List of factor weights
    regime_fit: float,           # 0–1: How well regime supports setup
    mtf_alignment: float,        # 0–1: Multi-timeframe alignment
    data_quality: float,         # 0–1: Input data quality
    invalidation_distance: float # 0–1: Normalized distance to invalidation
) -> float:

    # Signal strength contribution (30%)
    signal_contrib = signal_strength * 0.30

    # Confluence contribution (20%)
    # Diminishing returns after 3 factors
    confluence_score = sum(f.weight for f in confluence_factors[:5])
    confluence_normalized = min(1.0, confluence_score / 3.0)
    confluence_contrib = confluence_normalized * 0.20

    # Regime fit contribution (20%)
    regime_contrib = regime_fit * 0.20

    # MTF alignment contribution (10%)
    mtf_contrib = mtf_alignment * 0.10

    # Freshness contribution (10%)
    # Quality below 0.8 starts penalizing
    freshness_penalty = max(0.0, (0.8 - data_quality) * 2.0)
    freshness_score = max(0.0, 1.0 - freshness_penalty)
    freshness_contrib = freshness_score * 0.10

    # Invalidation distance contribution (10%)
    # Closer invalidation = lower confidence
    invalidation_contrib = invalidation_distance * 0.10

    # Total confidence
    confidence = (
        signal_contrib +
        confluence_contrib +
        regime_contrib +
        mtf_contrib +
        freshness_contrib +
        invalidation_contrib
    )

    return round(min(1.0, max(0.0, confidence)), 4)
```

---

## 8) State Machine

### Setup State Transitions

```
SetupStateMachine:

States:
  - detected
  - active
  - triggered
  - invalidated
  - expired

Transitions:

  detected → active:
    - All required confirmations met
    - Confidence remains above threshold

  detected → invalidated:
    - Invalidation condition hit
    - Confidence drops below minimum

  detected → expired:
    - Time/bar limit exceeded without activation

  active → triggered:
    - Trigger condition met
    - Still valid (not invalidated)

  active → invalidated:
    - Invalidation condition hit
    - Regime changed to incompatible state

  active → expired:
    - Time/bar limit exceeded without trigger

  triggered → invalidated:
    - Post-trigger invalidation (for tracking)

  triggered → expired:
    - Signal consumed, ready for cleanup

Re-arm Logic:
  - After invalidated or expired:
    - Cooldown period: config.cooldown_bars
    - Same setup type cannot re-trigger for symbol+timeframe during cooldown
```

### Squeeze State Transitions

```
SqueezeStateMachine:

States:
  - inactive
  - forming
  - active
  - releasing
  - released
  - expired

Transitions:

  inactive → forming:
    - squeeze_forming condition met
    - squeeze_on_bars < min_bars_on

  forming → active:
    - squeeze_on_bars >= min_bars_on
    - All formation conditions still met

  forming → inactive:
    - Formation conditions no longer met
    - (Reset counter)

  active → releasing:
    - Squeeze broken (conditions no longer met)
    - Expansion detected but direction not confirmed

  active → expired:
    - squeeze_on_bars > max_squeeze_bars
    - No release detected

  releasing → released:
    - Direction confirmed
    - Either FAST_RELEASE or CONFIRMED_RELEASE criteria met

  releasing → expired:
    - No clean release within release_expiry_bars

  released → expired:
    - Signal consumed
    - Cooldown started

  expired → inactive:
    - After cooldown_bars
    - Ready for new detection
```

---

## 9) Data Quality Handling

### Quality Enforcement Rules

```
# Per-record quality check
def check_input_quality(inputs: InputManifest) -> QualityResult:
    min_quality = min(f.quality_score for f in inputs.features)
    max_staleness = max(f.staleness_ms for f in inputs.features)

    # Hard reject if quality too low
    if min_quality < config.min_data_quality_hard:
        return QualityResult(
            valid=False,
            reason="Input quality below hard threshold",
            action="reject"
        )

    # Soft penalty if quality marginal
    if min_quality < config.min_data_quality_soft:
        penalty = (config.min_data_quality_soft - min_quality) * config.quality_penalty_factor
        return QualityResult(
            valid=True,
            confidence_penalty=penalty,
            reason="Input quality below soft threshold"
        )

    # Staleness check
    if max_staleness > config.max_staleness_ms:
        return QualityResult(
            valid=False,
            reason="Input data stale",
            action="reject"
        )

    return QualityResult(valid=True, confidence_penalty=0.0)
```

### Missing Feature Handling

```
# If required feature missing
if feature_missing(required_feature):
    # Cannot compute setup - reject
    return SetupResult(
        valid=False,
        reason=f"Missing required feature: {required_feature}",
        action="skip"
    )

# If optional feature missing
if feature_missing(optional_feature):
    # Proceed with reduced confidence
    confidence_penalty += 0.1
    log.warning(f"Optional feature missing: {optional_feature}")
```

### Regime Conflict Handling

```
# If regime state conflicts with setup requirements
if not regime_supports_setup(setup_type, current_regime):
    return SetupResult(
        valid=False,
        reason=f"Regime {current_regime} does not support {setup_type}",
        action="skip"
    )

# If regime confidence low
if regime_confidence < config.min_regime_confidence:
    confidence_penalty += (config.min_regime_confidence - regime_confidence) * 0.5
```

---

## 10) Write Contract to 02_data_store

### Contract Requirements

1. **Idempotent Writes**
   - Each setup/pattern/squeeze uses `setup_id` / `signal_id` as unique key
   - Duplicate writes update existing record
   - State transitions logged with timestamps

2. **Schema Enforcement**
   - All writes validated against canonical schemas
   - Schema version included in provenance

3. **Provenance Tracking**
   - Every record includes full provenance (version, rule hash, config snapshot)
   - Enables reproducibility and debugging

4. **Storage Targets**
   ```
   02_data_store/processed/
   ├── setup_store/
   │   ├── candidates/        # SetupCandidate records
   │   ├── patterns/          # PatternDetection records
   │   └── metrics/           # SetupMetrics aggregates
   ├── squeeze_store/
   │   ├── signals/           # SqueezeSignal records
   │   └── history/           # Historical squeeze events
   ├── range_zone_store/
   │   └── zones/             # RangeZone records
   └── confluence_store/
       └── zones/             # ConfluenceZone records
   ```

5. **Write Interface**
   ```
   write_setup_candidate(candidate: SetupCandidate) -> WriteResult
   write_pattern_detection(pattern: PatternDetection) -> WriteResult
   write_squeeze_signal(signal: SqueezeSignal) -> WriteResult
   write_range_zone(zone: RangeZone) -> WriteResult
   write_confluence_zone(zone: ConfluenceZone) -> WriteResult
   update_setup_state(setup_id: uuid, new_state: SetupState) -> WriteResult
   ```

---

## 11) Submodules

### setup_catalog/
- `catalog_registry.py` → Registry of all setup types with metadata
- `setup_definitions.py` → Formal definitions for each setup (inputs, conditions, evidence)
- `trend_pullback.py` → Trend pullback setup implementation
- `breakout_retest.py` → Breakout + retest implementation
- `range_mean_reversion.py` → Range MR implementation
- `momentum_continuation.py` → HH/HL momentum implementation
- `volatility_expansion.py` → Squeeze-based expansion (wraps squeeze_detection)
- `gap_fill.py` → Gap fill setup implementation
- `failed_breakout.py` → Trap/failed break implementation
- `volume_profile_rejection.py` → VAH/VAL/POC rejection implementation
- `divergence_reversal.py` → Divergence setup implementation
- `opening_range_breakout.py` → ORB implementation

### pattern_detectors/
- `base_detector.py` → Abstract base for pattern detection
- `chart_patterns.py` → Classic chart patterns (double top/bottom, H&S, wedges)
- `candle_patterns.py` → Candlestick pattern recognition
- `structure_patterns.py` → Swing structure patterns (HH/HL, LL/LH)

### confluence_engine/
- `zone_builder.py` → Builds confluence zones from overlapping levels
- `level_aggregator.py` → Aggregates levels from multiple sources
- `confluence_scorer.py` → Scores confluence zones by factor count/weight

### range_detection/
- `range_detector.py` → Detects range/consolidation zones
- `range_boundaries.py` → Calculates range high/low/mid
- `range_breakout.py` → Detects range breakouts
- `range_state.py` → Tracks range active/broken state

### squeeze_detection/
- `squeeze_detector.py` → Main squeeze detection logic
- `compression_calculator.py` → Computes compression score
- `release_detector.py` → Detects squeeze release (FAST/CONFIRMED)
- `direction_inferencer.py` → Infers direction with confidence
- `squeeze_state_machine.py` → Squeeze state transitions
- `squeeze_config.py` → SqueezeConfig schema and defaults

### scoring/
- `confidence_calculator.py` → Unified confidence calculation
- `regime_fit_scorer.py` → Scores regime alignment
- `mtf_alignment_scorer.py` → Scores multi-timeframe alignment
- `freshness_scorer.py` → Scores data freshness

### state_machine/
- `setup_state_machine.py` → Setup state transitions
- `state_persistence.py` → Persists state to 02_data_store
- `expiry_manager.py` → Handles time/bar expiry
- `cooldown_manager.py` → Manages re-arm cooldowns

### writers/
- `setup_writer.py` → Writes SetupCandidate to store
- `pattern_writer.py` → Writes PatternDetection to store
- `squeeze_writer.py` → Writes SqueezeSignal to store
- `range_writer.py` → Writes RangeZone to store
- `confluence_writer.py` → Writes ConfluenceZone to store

### tests/
- `test_setup_catalog/` → Per-setup unit tests
- `test_squeeze_detection/` → Squeeze-specific tests
- `test_range_detection/` → Range detection tests
- `test_scoring/` → Confidence calculation tests
- `test_state_machine/` → State transition tests
- `test_determinism/` → Replay determinism tests
- `golden_vectors/` → Known-good input/output pairs

---

## 12) Validation & Failure Modes

| Failure | Detection | Response |
|---------|-----------|----------|
| Missing required feature | Feature lookup returns null | Skip setup detection, log warning |
| Stale input data | staleness_ms > threshold | Reject or apply confidence penalty |
| Low data quality | quality_score < threshold | Reject or apply confidence penalty |
| Missing regime state | Regime lookup returns null | Skip regime-dependent setups |
| Squeeze false positive | Quick reversal after release | Track in metrics, tune thresholds |
| Non-determinism | Replay produces different output | Critical error, halt and investigate |
| Out-of-order timestamps | Bar timestamp < previous | Log error, reject bar, continue |
| Duplicate setup_id | Same ID already exists | Update existing (idempotent) |
| Schema validation failure | Field type mismatch | Reject write, log error |
| Confidence calculation error | NaN or out of range | Clamp to [0, 1], log warning |
| State transition invalid | Illegal state change | Reject transition, log error |
| Config validation failure | Invalid config values | Use defaults, log warning |

---

## 13) Minimum Acceptance Criteria

### Setup Detection Tests
- [ ] Unit tests for each of 10 setup types using golden vectors
- [ ] Golden vectors include: input features → expected detection + confidence
- [ ] Boundary tests for all thresholds (at threshold, above, below)
- [ ] Regime filter tests (setup suppressed when regime incompatible)

### Squeeze Detection Tests (MANDATORY)
- [ ] Formation detection: squeeze_forming condition tested
- [ ] Persistence counter: squeeze_on_bars increments correctly
- [ ] FAST_RELEASE behavior: triggers on looser thresholds
- [ ] CONFIRMED_RELEASE behavior: requires stricter thresholds
- [ ] Direction inference (up): break above range + momentum confirms
- [ ] Direction inference (down): break below range + momentum confirms
- [ ] Direction confidence calculation: all components tested
- [ ] Quick-call latency: measured in bars, meets target (default: 1-2 bars for FAST)
- [ ] Quality penalty: low-quality data reduces confidence
- [ ] Expiry: squeeze expires after max_squeeze_bars

### Range Detection Tests
- [ ] Range detection: range_high, range_low, range_mid calculated
- [ ] Range breakout: breakout_direction set on break
- [ ] Range active/inactive state transitions

### Scoring Tests
- [ ] Confidence calculation: deterministic, bounded [0, 1]
- [ ] Confluence scoring: multiple factors aggregate correctly
- [ ] Freshness penalty: stale data reduces confidence
- [ ] Regime fit scoring: incompatible regime → low score

### State Machine Tests
- [ ] All valid transitions tested
- [ ] Invalid transitions rejected
- [ ] Expiry triggers correctly
- [ ] Cooldown prevents immediate re-arm

### Replay Determinism Tests
- [ ] Same inputs → same outputs across multiple runs
- [ ] No random components in detection
- [ ] Time-based logic uses injected clock

### Write Contract Tests
- [ ] Idempotent writes (duplicate setup_id updates)
- [ ] Schema validation (invalid data rejected)
- [ ] Provenance attached to all writes

### Documentation
- [ ] Setup catalog docs (each setup documented)
- [ ] Scoring math documented
- [ ] Squeeze algorithm documented with configuration guide
- [ ] State machine diagrams

---

## 14) Deferred Design Notes

### Deferred to 05_options_analytics
- Options-specific setups (e.g., IV crush plays, gamma squeeze)
- Greeks-based filtering for setups

### Deferred to 07_strategy_selection_engine
- Strategy-setup mapping (which strategy trades which setup)
- Position sizing recommendations based on setup confidence

### Deferred to 08_signal_generation
- Entry signal generation from triggered setups
- Order type selection

### Deferred to 14_learning_and_evaluation_loop
- Setup hit rate calculation
- Calibration of confidence → actual outcome
- Setup performance attribution
- Parameter optimization

### Deferred Implementation Details
- Chart pattern detection (double top/bottom, H&S, wedges) — catalog defined, implementation deferred
- ML-based pattern recognition — out of scope for initial implementation
- Real-time alerting — handled by 18_realtime_scanning_and_alerting

---

## 15) Proposed Git Commit

```
[OptionsBrain] 04b_setup_and_pattern_library: add setup detection, squeeze algorithm, range zones, and state machine

COMMIT-0008

Adds the pattern recognition layer for the Options Trading Brain.
Detects tradable setups from features + regime context.

Canonical Schemas Defined:
- SetupCandidate (full setup object with evidence, confidence, state)
- PatternDetection (chart pattern detection output)
- ConfluenceZone (overlapping level zones)
- RangeZone (consolidation/range detection - first-class detector)
- SetupState (detected/active/triggered/invalidated/expired)
- SetupProvenance (versioning, rule hashes, config snapshot)
- SetupMetrics (counts, hit rates placeholder)
- SqueezeSignal (volatility squeeze detection output)
- SqueezeState (inactive/forming/active/releasing/released/expired)
- SqueezeProvenance (squeeze-specific provenance)

Setup Catalog (10 setups):
1. Trend pullback (MA/VWAP reclaim)
2. Breakout + retest (level-based)
3. Range mean reversion (inside RangeZone)
4. Momentum continuation (HH/HL + ADX)
5. Volatility expansion (squeeze release)
6. Gap fill setup
7. Failed breakdown/breakout (trap)
8. Volume profile rejection (VAH/VAL/POC)
9. Divergence reversal
10. Opening range breakout (ORB)

Squeeze Detection (Early Warning System):
- Compression score calculation (BBW, ATR, KC overlap)
- Formation + persistence tracking
- FAST_RELEASE mode (1-bar confirmation, earliest callout)
- CONFIRMED_RELEASE mode (2-3 bar confirmation, higher accuracy)
- Direction inference with explicit confidence calculation
- Quality-based suppression and penalty
- Config-driven thresholds, replay-safe

Architecture:
- Setup catalog with formal definitions
- Confluence engine for overlapping levels
- Range detection (detection here, rendering in 03b)
- Squeeze detection submodule
- Deterministic scoring + confidence calculation
- State machine for setup lifecycle
- Idempotent write contract to 02_data_store

Dependencies:
- Imports from: 00_core, 02_data_store, 03_feature_engineering, 04_market_regime
- Exports to: 02_data_store (processed/), 07_strategy_selection_engine, 08_signal_generation

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

---

**End of Specification. STOP.**
