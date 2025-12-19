# TRADING MODES
**Strategy-First Classification System**

---

## Purpose

Trading Mode selection is mandatory.

No signal may be generated until a mode is explicitly selected and declared.

Modes define:
- entry criteria
- exit strategy
- indicator requirements
- time horizon
- risk/reward expectations
- position sizing rules

Failure to select a mode is a system violation.

---

## MODE: SCALP
**High-Frequency 1-5 Minute Holds**

### Definition
Quick entries and exits targeting 10-20% gains in 1-5 minutes.

### Mandatory Requirements
- **Time-of-day:** 9:30-11AM ET or 3-4PM ET only
- **Volume:** 1000+ contracts minimum
- **Delta:** 0.40-0.70 (sweet spot for liquidity)
- **Spread:** Bid-ask < $0.10 (tight spreads only)
- **Momentum:** 3%+ move in 1-5 minutes
- **RSI:** 30-40 (oversold) for longs, 60-70 (overbought) for shorts
- **Max price:** $10/contract (affordability + liquidity)

### Mandatory Indicators
- RSI (14-period)
- 1-minute price momentum
- 5-minute price momentum
- Volume vs 30-day average

### Entry Criteria
- All filters pass (no exceptions)
- High-edge time window active
- Spread confirms liquidity

### Exit Strategy
- Target: +15-20% gain
- Stop: -5% loss
- Max hold: 5 minutes (hard cap)
- Partial profit: 50% at 2x gain (Najarians rule)

### Forbidden Shortcuts
- Trading outside high-edge windows
- Accepting wide spreads
- Holding past 5 minutes

---

## MODE: MOMENTUM
**15-Minute to 2-Hour Breakout Plays**

### Definition
Directional moves with volume confirmation, targeting 30-100% gains.

### Mandatory Requirements
- **Stock momentum:** 3%+ move in 15 minutes
- **Volume:** 2x+ daily average (stock)
- **Options volume:** 3x+ 30-day average
- **MACD:** Bullish crossover (longs) or bearish cross-under (shorts)
- **Breakout confirmation:** Breaking key resistance/support

### Mandatory Indicators
- MACD (12, 26, 9)
- 15-minute price momentum
- Volume ratio vs daily average
- Support/resistance levels
- Price action patterns

### Entry Criteria
- 3%+ momentum confirmed
- MACD alignment with direction
- Volume spike detected
- Breakout level identified

### Exit Strategy
- Target: +50% gain
- Stop: -20% loss
- Max hold: 2 hours
- Trailing stop: 25% below highest price

### Forbidden Shortcuts
- Entering without MACD confirmation
- Ignoring volume requirements
- Holding past 2 hours

---

## MODE: VOLUME_SPIKE
**Unusual Options Activity (UOA) Following**

### Definition
Smart money detection - follow institutional flow.

### Mandatory Requirements
- **Options volume:** 5x+ 30-day average
- **Block trades:** 100+ contracts per trade, 3+ blocks minimum
- **Premium flow:** $1M+ net flow (buying or selling pressure)
- **Call/Put ratio:** Unusual deviation from normal

### Mandatory Indicators
- Volume ratio (current vs 30-day avg)
- Block trade detection (tape reading)
- Premium flow calculation
- Unusual order flow analysis

### Entry Criteria
- 5x+ volume spike detected
- Multiple institutional-size blocks identified
- $1M+ premium flow in single direction
- Flow direction identified (bullish/bearish)

### Exit Strategy
- Follow smart money exit signals
- Target: determined by flow size
- Stop: -15% loss
- Monitor ongoing flow for exit timing

### Forbidden Shortcuts
- Acting on low premium flow
- Following retail-size orders
- Ignoring flow direction changes

---

## MODE: SWING
**1-5 Day Position Trades** (NOT CURRENTLY IMPLEMENTED)

### Definition
Multi-day holds based on technical setups.

### Status
**DISABLED - No overnight positions allowed in current system.**

Overnight risk is currently prohibited per risk management rules.
This mode exists for future implementation when risk controls expand.

---

## Mode Declaration Rule

At the start of every signal generation, you MUST declare:

> **Trading Mode: <MODE>**

Only one mode per signal.

---

## Mode Enforcement

If a filter conflicts with the selected mode:
- The mode requirements win
- Convenience does not override safety
- Wider filters are not allowed

---

## Mode + Filter Violations

If you cannot meet mode requirements:
- DO NOT generate the signal
- DO NOT widen filters to force a match
- LOG the missed opportunity (not every opportunity is tradeable)

---

**Mode selection is mandatory and binding.**
