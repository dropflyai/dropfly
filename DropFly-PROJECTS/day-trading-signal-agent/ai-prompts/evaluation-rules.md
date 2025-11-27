# AI Evaluation Rules for Trading Signals

This document outlines the detailed criteria the AI uses to evaluate trading signal quality.

## Quality Levels

### HIGH Quality
Award HIGH quality when ALL of these conditions are met:
- ✅ Price is in correct position relative to VWAP (above for LONG, below for PUT)
- ✅ EMAs are strongly aligned with signal direction
- ✅ Volume is significantly above average (1.5x+)
- ✅ Candle structure is strong (green for LONG, red for PUT)
- ✅ No conflicting signals
- ✅ Clear trend direction
- ✅ Risk/reward is favorable (2:1 minimum)

**Expected win rate:** 65-75%

### MEDIUM Quality
Award MEDIUM quality when MOST conditions are met:
- ⚠️ Price is near VWAP or slightly off ideal position
- ⚠️ EMAs are partially aligned (2 out of 3)
- ⚠️ Volume is above average but not strong (1.2x-1.5x)
- ⚠️ Candle structure is acceptable
- ⚠️ Minor conflicting signals present
- ⚠️ Trend is developing but not fully established

**Expected win rate:** 50-60%

### LOW Quality
Award LOW quality when ANY of these red flags exist:
- ❌ Price is on wrong side of VWAP for signal type
- ❌ EMAs are not aligned (conflicting)
- ❌ Volume is weak or below average
- ❌ Candle structure is poor (doji, small body)
- ❌ Multiple conflicting indicators
- ❌ No clear trend
- ❌ Poor risk/reward (<1.5:1)

**Recommendation:** SKIP these trades

---

## Signal-Specific Evaluation

### 1. ORB Breakout LONG

**Ideal Conditions (HIGH):**
- Price breaks and closes above Opening Range High
- Price is above VWAP
- Volume spike (1.5x+ average)
- EMA 9 > EMA 20 (or crossing up)
- Strong green candle
- Breakout within first 30 minutes of market open

**Acceptable Conditions (MEDIUM):**
- Price breaks ORH but close is weak
- Price near VWAP (within 0.2%)
- Volume 1.2-1.5x average
- EMAs neutral or turning up
- Moderate green candle

**Reject as LOW if:**
- Price below VWAP
- Weak volume (<1.2x)
- EMAs pointing down
- Breakout occurs after 10:30 AM (late)

### 2. VWAP Reclaim LONG

**Ideal Conditions (HIGH):**
- Price was clearly below VWAP (within last 10 bars)
- Strong move above VWAP
- Closes well above VWAP (0.3%+)
- Volume surge on reclaim
- EMAs turning up or already bullish
- Previous consolidation below VWAP

**Acceptable Conditions (MEDIUM):**
- Quick reclaim without consolidation
- Close just above VWAP (0.1-0.3%)
- Moderate volume
- EMAs neutral

**Reject as LOW if:**
- Chop around VWAP (no clear reclaim)
- Weak volume
- EMAs bearish
- Price barely above VWAP

### 3. EMA Trend Continuation LONG

**Ideal Conditions (HIGH):**
- Perfect EMA alignment: EMA9 > EMA20 > EMA50
- All EMAs sloping upward
- Price above all EMAs
- Price above VWAP
- Strong volume
- Pullback bounces off EMA9 or EMA20
- Green candle confirming bounce

**Acceptable Conditions (MEDIUM):**
- EMA9 > EMA20 but EMA50 not aligned
- Price between EMAs
- Moderate volume
- Sideways EMAs

**Reject as LOW if:**
- EMAs not aligned
- Price below EMAs
- Weak volume
- No clear trend

### 4. HOD Breakout LONG

**Ideal Conditions (HIGH):**
- Clean break above previous High of Day
- Strong volume spike (2x+ average)
- Price well above VWAP
- Bullish EMAs
- Strong green candle
- Previous HOD was a clear resistance

**Acceptable Conditions (MEDIUM):**
- Marginal break above HOD
- Moderate volume
- Price above VWAP
- EMAs partially aligned

**Reject as LOW if:**
- Weak break (barely above HOD)
- No volume confirmation
- Price below VWAP
- Multiple failed HOD tests

### 5. ORB Breakdown PUT

**Ideal Conditions (HIGH):**
- Price breaks and closes below Opening Range Low
- Price below VWAP
- Volume spike (1.5x+ average)
- EMA 9 < EMA 20 (or crossing down)
- Strong red candle
- Breakdown within first 30 minutes

**Acceptable Conditions (MEDIUM):**
- Break below ORL with weak close
- Price near VWAP
- Volume 1.2-1.5x
- EMAs neutral or turning down

**Reject as LOW if:**
- Price above VWAP
- Weak volume
- EMAs pointing up
- Late breakdown (after 10:30 AM)

### 6. VWAP Reject PUT

**Ideal Conditions (HIGH):**
- Price was clearly above VWAP
- Strong rejection downward
- Closes well below VWAP (0.3%+)
- Volume surge on rejection
- EMAs turning down or already bearish
- Clear resistance at VWAP

**Acceptable Conditions (MEDIUM):**
- Quick rejection without resistance test
- Close just below VWAP (0.1-0.3%)
- Moderate volume
- EMAs neutral

**Reject as LOW if:**
- Chop around VWAP
- Weak volume
- EMAs bullish
- Price barely below VWAP

### 7. LOD Break PUT

**Ideal Conditions (HIGH):**
- Clean break below previous Low of Day
- Strong volume spike (2x+ average)
- Price well below VWAP
- Bearish EMAs
- Strong red candle
- Previous LOD was clear support

**Acceptable Conditions (MEDIUM):**
- Marginal break below LOD
- Moderate volume
- Price below VWAP
- EMAs partially aligned

**Reject as LOW if:**
- Weak break (barely below LOD)
- No volume confirmation
- Price above VWAP
- Multiple failed LOD tests

---

## Volume Analysis

### Strong Volume (supports HIGH rating)
- Current volume > 1.5x the 20-bar average
- Increasing volume on the signal bar
- Volume surge at key level (VWAP, ORH/ORL, HOD/LOD)

### Moderate Volume (supports MEDIUM rating)
- Current volume 1.2-1.5x average
- Steady volume, not decreasing
- Volume present but not exceptional

### Weak Volume (forces LOW rating)
- Current volume < 1.2x average
- Decreasing volume
- Below-average volume at key levels

---

## EMA Alignment Analysis

### Bullish Alignment (for LONG signals)
- **Perfect:** EMA9 > EMA20 > EMA50, all sloping up
- **Strong:** EMA9 > EMA20, EMA50 flat or up
- **Developing:** EMA9 crossing above EMA20
- **Weak:** EMAs flat or mixed
- **Bearish:** EMAs pointing down (reject LONG)

### Bearish Alignment (for PUT signals)
- **Perfect:** EMA9 < EMA20 < EMA50, all sloping down
- **Strong:** EMA9 < EMA20, EMA50 flat or down
- **Developing:** EMA9 crossing below EMA20
- **Weak:** EMAs flat or mixed
- **Bullish:** EMAs pointing up (reject PUT)

---

## Price vs VWAP Analysis

### For LONG Signals
- **Ideal:** Price 0.3%+ above VWAP
- **Acceptable:** Price 0.1-0.3% above VWAP
- **Marginal:** Price at VWAP (0-0.1%)
- **Reject:** Price below VWAP

### For PUT Signals
- **Ideal:** Price 0.3%+ below VWAP
- **Acceptable:** Price 0.1-0.3% below VWAP
- **Marginal:** Price at VWAP (0-0.1%)
- **Reject:** Price above VWAP

---

## Entry, Stop, Target Guidelines

### Entry
- Should be at or near current price (within 0.5%)
- For LONG: Entry slightly above current price
- For PUT: Entry slightly below current price
- Entry range: 0.2-0.5% around current price

### Stop Loss
- **For LONG:** Below VWAP or below recent support
  - Typical: 1-2% below entry
  - Max: 7% (absolute max loss)
  - Conservative: Below VWAP - 0.2%

- **For PUT:** Above VWAP or above recent resistance
  - Typical: 1-2% above entry
  - Max: 7% (absolute max loss)
  - Conservative: Above VWAP + 0.2%

### Target
- Options target: +10-15% gain
- Risk/Reward: Minimum 2:1
- **For LONG:**
  - Conservative: +10%
  - Moderate: +12%
  - Aggressive: +15%

- **For PUT:**
  - Conservative: +10%
  - Moderate: +12%
  - Aggressive: +15%

### SKIP Signals
If signal is LOW quality, output:
```
Idea: SKIP
Entry: N/A | Stop: N/A | Target: N/A
```

---

## Context Examples

The "Context" line should be a brief 1-sentence explanation. Examples:

### HIGH Quality Contexts
- "Strong VWAP reclaim with rising volume and bullish EMA alignment"
- "Clean ORB breakout above resistance with volume surge"
- "HOD breakout with perfect EMA alignment and strong momentum"
- "Clean VWAP rejection with bearish EMAs and volume confirmation"

### MEDIUM Quality Contexts
- "VWAP reclaim but EMAs not fully aligned, moderate volume"
- "ORB breakout with acceptable volume, EMAs turning up"
- "HOD break with moderate volume, price near VWAP"

### LOW Quality Contexts
- "Below VWAP with weak volume, EMAs not aligned"
- "Choppy price action around VWAP, no clear direction"
- "Weak breakout with no volume confirmation"
- "Conflicting indicators, poor risk/reward"

---

## Common Mistakes to Avoid

❌ **Don't:**
- Give HIGH ratings to signals below VWAP (for LONG) or above VWAP (for PUT)
- Ignore weak volume
- Overlook conflicting EMAs
- Be too optimistic - be conservative
- Make up data or indicators not provided
- Give HIGH ratings to signals with poor risk/reward

✅ **Do:**
- Be honest about weaknesses
- Downgrade when in doubt
- Prioritize trader safety
- Look for confluence of multiple indicators
- Consider the full context
- Remember the goal: 2-3 HIGH-quality trades per day, not quantity

---

## Success Metrics

The AI evaluation should aim for:
- **HIGH signals:** 65-75% win rate
- **MEDIUM signals:** 50-60% win rate
- **LOW signals:** < 50% win rate (should be skipped)

If actual results differ significantly, reevaluate the criteria.

---

**Remember:** The trader is trying to make $300/day with 2-3 trades. Quality over quantity. It's better to skip 10 mediocre setups than to take 1 bad trade.
