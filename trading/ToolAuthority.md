# TOOL AUTHORITY
**Mandatory Indicators and Data Sources**

---

## Purpose

This document defines what indicators and data sources are authoritative.

If an indicator can be calculated, it must not be guessed.

If a data source exists, it must be used.

Tool authority exists to eliminate:
- indicator amnesia
- manual chart reading fallback
- incorrect assumptions about momentum/volume
- repeated re-discovery of what works

---

## Non-Negotiable Rule

> **Never assume what can be calculated. Never trade manually when indicators exist.**

Violations are correctness failures.

---

## Authority: Price Data

### Rule
Price data must be retrieved from an authoritative, real-time source.

### Allowed Authorities
1. **Massive Options API** (primary) - real-time options chain data
2. **yfinance** (fallback) - when Massive API fails

### Forbidden
- Guessing prices
- Using stale data (>60 seconds old)
- Manual chart reading without numeric confirmation

### Output Requirement
Every price-based signal must include:
- data source used
- timestamp of data retrieval
- staleness check (reject if >60s old)

---

## Authority: Technical Indicators

### RSI (Relative Strength Index)
- **Calculation:** 14-period RSI
- **Authority:** technical_analysis.py::rsi()
- **When Mandatory:** SCALP mode
- **Thresholds:**
  - Oversold: 30-40 (long entry zone)
  - Overbought: 60-70 (short entry zone)
- **Forbidden:** Adjusting period to force signals

### MACD (Moving Average Convergence Divergence)
- **Calculation:** (12, 26, 9)
- **Authority:** technical_analysis.py::macd()
- **When Mandatory:** MOMENTUM mode
- **Signals:**
  - Bullish: MACD line > signal line, histogram > 0
  - Bearish: MACD line < signal line, histogram < 0
- **Forbidden:** Using MACD without 35+ data points

### Momentum
- **Calculation:** Percent change over period
- **Authority:** technical_analysis.py::momentum()
- **When Mandatory:** ALL modes
- **Thresholds:**
  - SCALP: 3%+ in 1-5 minutes
  - MOMENTUM: 3%+ in 15 minutes
- **Forbidden:** Accepting <3% moves

### Volume Analysis
- **Calculation:** Current volume vs 30-day average
- **Authority:** contract.volume_metrics.volume_ratio
- **When Mandatory:** ALL modes
- **Thresholds:**
  - SCALP: 1000+ contracts absolute
  - MOMENTUM: 3x+ average
  - VOLUME_SPIKE: 5x+ average
- **Forbidden:** Trading on low volume

### Bollinger Bands (Optional but Recommended)
- **Calculation:** 20-period SMA ± 2 standard deviations
- **Authority:** technical_analysis.py::bollinger_bands()
- **When Mandatory:** Volatility-based entries
- **Signals:** Price touching lower band (oversold), upper band (overbought)

### Support/Resistance Levels
- **Calculation:** Local min/max over lookback period
- **Authority:** technical_analysis.py::support_resistance_levels()
- **When Mandatory:** MOMENTUM mode (breakout confirmation)
- **Forbidden:** Eyeballing levels without calculation

---

## Authority: Greeks

### Delta
- **Calculation:** Provided by Massive API or calculated
- **Authority:** contract.greeks.delta
- **When Mandatory:** ALL modes
- **Thresholds:** 0.40-0.70 (institutional sweet spot)
- **Forbidden:** Trading deep ITM (>0.70) or far OTM (<0.40)

### Gamma, Theta, Vega (Informational)
- **Authority:** contract.greeks
- **When Mandatory:** Risk assessment for positions >$5k
- **Purpose:** Understanding position sensitivity

---

## Authority: Spread Analysis

### Bid-Ask Spread
- **Calculation:** ask - bid
- **Authority:** contract.pricing.spread
- **When Mandatory:** SCALP mode (liquidity critical)
- **Thresholds:**
  - SCALP: < $0.10 (tight spreads only)
  - MOMENTUM: < 10% of mid price
  - VOLUME_SPIKE: < 15% of mid price
- **Forbidden:** Trading wide spreads (slippage risk)

---

## Authority: Time-of-Day

### Market Hours
- **Authority:** /api/market/status
- **When Mandatory:** ALL modes
- **Verification:** Must check market is OPEN before trading

### High-Edge Windows
- **Authority:** TimeOfDayFilter.is_high_edge_window()
- **When Mandatory:** SCALP mode (strict), MOMENTUM mode (warning only)
- **Windows:**
  - 9:30-11:00 AM ET (morning momentum)
  - 3:00-4:00 PM ET (power hour)
- **Forbidden:** Scalping outside these windows

---

## Authority: Block Trade Detection

### Definition
Large institutional orders (100+ contracts per trade)

- **Authority:** VolumeSpikeStrategy.detect_block_trades()
- **When Mandatory:** VOLUME_SPIKE mode
- **Thresholds:**
  - Block size: 100+ contracts minimum
  - Block count: 3+ blocks required
  - Premium flow: $1M+ net flow
- **Forbidden:** Following retail-size orders (<100 contracts)

---

## Automation Preference Hierarchy

**Mandatory ordering from strongest to weakest:**

1. **Calculated Indicators** — RSI, MACD, momentum (always calculate)
2. **Real-Time Data APIs** — Massive API, yfinance (always fetch)
3. **Cached Data** — Redis (30-second TTL, acceptable)
4. **Manual Analysis** — FORBIDDEN in production

---

## Indicator Conflict Resolution

If indicators conflict:
1. Check data staleness (reject stale data)
2. Verify calculation correctness
3. If still conflicting, DO NOT generate signal
4. Log as "conflicting indicators" - not tradeable

---

## Missing Indicator Handling

If a mandatory indicator cannot be calculated:
- DO NOT generate signal
- DO NOT substitute with alternate indicator
- LOG the failure
- Wait for sufficient data

---

## Mandatory Behavior: Evidence-Based Signals

Every signal must include numeric evidence:
- RSI value (not "oversold" - give the number)
- Momentum percentage (not "strong move" - give the %)
- Volume ratio (not "high volume" - give the multiplier)

Vague justifications are forbidden.

---

**Tool Authority is binding and enforced.**
