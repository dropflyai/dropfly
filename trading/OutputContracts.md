# OUTPUT CONTRACTS
**Signal Structure Requirements**

---

## Purpose

Every trading signal is an output contract.

Contracts define what information MUST be included.

Incomplete signals are invalid.

---

## Signal Contract (Mandatory Fields)

Every signal must include ALL of the following fields:

### Core Signal Data
```python
{
    "action": str,  # "BUY_CALL" | "BUY_PUT" | "FOLLOW_FLOW"
    "contract": {
        "symbol": str,  # Underlying ticker (e.g., "AAPL")
        "strike": float,  # Strike price
        "expiration": str,  # ISO date "YYYY-MM-DD"
        "days_to_expiry": int,  # Days until expiration
        "contract_id": str,  # OCC symbol
        "underlying_price": float,  # Current stock price
        "greeks": {
            "delta": float,  # -1.0 to 1.0
            "gamma": float,  # optional but recommended
            "theta": float,  # optional but recommended
            "vega": float,  # optional but recommended
        }
    },
    "entry_price": float,  # Ask price to enter (NOT bid, NOT mid)
    "target_price": float,  # Profit target
    "stop_loss": float,  # Hard stop price
    "confidence": float,  # 0.70-0.95 (must be justified)
    "reason": str,  # Human-readable justification with NUMBERS
    "timestamp": str,  # ISO 8601 with timezone
    "mode": str,  # "SCALP" | "MOMENTUM" | "VOLUME_SPIKE"
}
```

---

## Field Requirements

### action
- **Type:** String enum
- **Allowed:** "BUY_CALL", "BUY_PUT", "FOLLOW_FLOW"
- **Forbidden:** "CALL", "PUT", "LONG", "SHORT" (be explicit)

### entry_price
- **Source:** contract.pricing.ask (always use ASK, not mid)
- **Why:** You pay the ask when buying options
- **Forbidden:** Using bid price (you can't buy at bid)

### target_price
- **Calculation:** Based on mode:
  - SCALP: entry * 1.15 to 1.20 (15-20% gain)
  - MOMENTUM: entry * 1.50 (50% gain)
  - VOLUME_SPIKE: flow-dependent
- **Must:** Be achievable based on historical volatility
- **Forbidden:** Unrealistic targets (e.g., 10x in 5 minutes)

### stop_loss
- **Calculation:** entry * 0.95 (5% loss for scalps) or entry * 0.80 (20% for momentum)
- **Must:** Always be set (no "I'll watch it" allowed)
- **Forbidden:** Stops wider than 25%

### confidence
- **Range:** 0.70 to 0.95
- **Calculation:** Based on:
  - Number of confirming indicators
  - Signal strength (momentum %, volume multiplier)
  - Historical win rate for this setup
- **Forbidden:**
  - Confidence < 0.70 (too weak, don't trade)
  - Confidence > 0.95 (overconfidence, unjustified)
  - Guessing confidence without calculation

### reason
- **Format:** "Signal type: X% momentum + RSI Y oversold + Zvol"
- **Must include:**
  - Specific numeric values
  - Indicator names
  - Trade justification
- **Examples:**
  - ✅ "Scalp: 3.2% momentum + RSI 35 oversold + 1200 vol"
  - ✅ "Strong scalp: 5.1% 5min momentum + delta 0.45"
  - ✅ "Momentum: 4.2% move + 3.5x volume + MACD bullish + broke $150.25"
  - ❌ "Good setup" (no numbers)
  - ❌ "Strong momentum" (not specific)
  - ❌ "Looks oversold" (vague)

### timestamp
- **Format:** ISO 8601 with timezone (e.g., "2025-12-19T13:45:30-05:00")
- **Source:** datetime.now(pytz.timezone('America/New_York'))
- **Forbidden:**
  - Guessing timestamp
  - Using UTC without timezone marker
  - Omitting seconds

### mode
- **Source:** Declared trading mode
- **Must match:** Mode requirements from Modes.md
- **Used for:** Post-trade analysis and filtering

---

## Extended Signal Data (Recommended)

### For SCALP mode:
```python
{
    "stock_momentum_1m": float,  # 1-minute momentum %
    "stock_momentum_5m": float,  # 5-minute momentum %
    "rsi": float,  # 14-period RSI value
    "volume": int,  # Current option volume
}
```

### For MOMENTUM mode:
```python
{
    "stock_momentum_15m": float,  # 15-minute momentum %
    "macd_signal": str,  # "bullish" | "bearish" | "neutral"
    "breakout_level": float | null,  # Price level broken (or null)
    "volume_ratio": float,  # Current / 30-day average
    "timeframe": str,  # "15m-2h"
}
```

### For VOLUME_SPIKE mode:
```python
{
    "flow_direction": str,  # "bullish" | "bearish"
    "net_premium_flow": float,  # Dollar flow ($)
    "large_orders_count": int,  # Number of block trades
    "volume_ratio": float,  # Current / 30-day average
}
```

---

## Risk/Reward Calculation

Every signal must meet:
```python
risk = entry_price - stop_loss
reward = target_price - entry_price
risk_reward_ratio = reward / risk

assert risk_reward_ratio >= 2.0  # Minimum 2:1 ratio
```

If R/R < 2:1, signal is INVALID.

---

## Signal Validation Checklist

Before returning a signal, verify:
- [ ] All mandatory fields present
- [ ] entry_price is ask (not bid or mid)
- [ ] stop_loss < entry_price < target_price
- [ ] confidence in 0.70-0.95 range
- [ ] reason includes specific numbers
- [ ] timestamp is authoritative
- [ ] mode matches declared mode
- [ ] risk/reward ratio >= 2:1

---

## Invalid Signal Examples

### ❌ Missing fields
```python
{
    "action": "BUY_CALL",
    "entry_price": 2.50
    # Missing: contract, target, stop, confidence, reason, timestamp, mode
}
```

### ❌ Vague reason
```python
{
    "reason": "Strong setup, looks good"
    # Should be: "Scalp: 3.5% momentum + RSI 33 + 1500 vol"
}
```

### ❌ Bad risk/reward
```python
{
    "entry_price": 2.50,
    "target_price": 2.60,  # Only 4% gain
    "stop_loss": 2.40,     # 4% loss
    # R/R = 0.10 / 0.10 = 1:1 (INVALID, need 2:1)
}
```

### ❌ Overconfidence
```python
{
    "confidence": 0.99  # Unjustified (max allowed: 0.95)
}
```

---

## Enforcement

- Signals missing mandatory fields will NOT be returned
- Signals with R/R < 2:1 will NOT be returned
- Signals with vague reasons will NOT be returned
- Validation happens before signal leaves the system

---

**Output Contracts are binding.**
