# Signal Examples and Expected Outputs

This document shows what actual trading signals should look like after processing through the entire system.

---

## Example 1: HIGH Quality VWAP Reclaim LONG

### Input (from TradingView)
```json
{
  "signal": "VWAP_RECLAIM_LONG",
  "ticker": "NVDA",
  "time": "1732546200000",
  "price": 188.20,
  "open": 188.00,
  "high": 188.55,
  "low": 187.85,
  "close": 188.20,
  "volume": 1250000,
  "vwap": 187.90,
  "ema9": 188.10,
  "ema20": 187.70,
  "ema50": 186.90,
  "timeframe": "1"
}
```

### Expected AI Evaluation
```
NVDA – VWAP_RECLAIM_LONG – Quality: HIGH
Price: 188.20 | VWAP: 187.90 | EMA9/20/50: 188.10/187.70/186.90
Context: Strong VWAP reclaim with rising volume and bullish EMA alignment
Idea: CALL
Entry: 188.10-188.30 | Stop: below 187.80 | Target: +12%
```

### Expected Alert Message (Telegram/Discord)
```
🚨 TRADING SIGNAL 🚨

NVDA – VWAP_RECLAIM_LONG – Quality: HIGH
Price: 188.20 | VWAP: 187.90 | EMA9/20/50: 188.10/187.70/186.90
Context: Strong VWAP reclaim with rising volume and bullish EMA alignment
Idea: CALL
Entry: 188.10-188.30 | Stop: below 187.80 | Target: +12%

⏰ Time: 10:30 AM ET
📊 Timeframe: 1min

---
💡 Remember: Max 2-3 trades/day | Stop at -7% | Target +10-15%
```

### Trading Decision
✅ **TAKE THIS TRADE**
- Quality: HIGH
- All criteria aligned
- Perfect setup

---

## Example 2: HIGH Quality VWAP Reject PUT

### Input (from TradingView)
```json
{
  "signal": "VWAP_REJECT_PUT",
  "ticker": "TSLA",
  "time": "1732547400000",
  "price": 242.10,
  "open": 242.50,
  "high": 242.90,
  "low": 242.05,
  "close": 242.10,
  "volume": 1800000,
  "vwap": 242.80,
  "ema9": 242.30,
  "ema20": 242.90,
  "ema50": 243.50,
  "timeframe": "1"
}
```

### Expected AI Evaluation
```
TSLA – VWAP_REJECT_PUT – Quality: HIGH
Price: 242.10 | VWAP: 242.80 | EMA9/20/50: 242.30/242.90/243.50
Context: Clean VWAP rejection with strong red candle and volume confirmation
Idea: PUT
Entry: 242.00-242.20 | Stop: above 242.90 | Target: +10%
```

### Expected Alert Message
```
🚨 TRADING SIGNAL 🚨

TSLA – VWAP_REJECT_PUT – Quality: HIGH
Price: 242.10 | VWAP: 242.80 | EMA9/20/50: 242.30/242.90/243.50
Context: Clean VWAP rejection with strong red candle and volume confirmation
Idea: PUT
Entry: 242.00-242.20 | Stop: above 242.90 | Target: +10%

⏰ Time: 11:10 AM ET
📊 Timeframe: 1min

---
💡 Remember: Max 2-3 trades/day | Stop at -7% | Target +10-15%
```

### Trading Decision
✅ **TAKE THIS TRADE**
- Quality: HIGH
- Strong rejection
- Good short setup

---

## Example 3: MEDIUM Quality EMA Trend LONG

### Input (from TradingView)
```json
{
  "signal": "EMA_TREND_CONTINUATION_LONG",
  "ticker": "META",
  "time": "1732548000000",
  "price": 335.50,
  "open": 335.30,
  "high": 335.70,
  "low": 335.25,
  "close": 335.50,
  "volume": 950000,
  "vwap": 335.20,
  "ema9": 335.40,
  "ema20": 335.10,
  "ema50": 335.30,
  "timeframe": "1"
}
```

### Expected AI Evaluation
```
META – EMA_TREND_CONTINUATION_LONG – Quality: MEDIUM
Price: 335.50 | VWAP: 335.20 | EMA9/20/50: 335.40/335.10/335.30
Context: Partial EMA alignment with moderate volume, EMAs not perfectly stacked
Idea: CALL
Entry: 335.40-335.60 | Stop: below 335.00 | Target: +10%
```

### Expected Alert Message
```
🚨 TRADING SIGNAL 🚨

META – EMA_TREND_CONTINUATION_LONG – Quality: MEDIUM
Price: 335.50 | VWAP: 335.20 | EMA9/20/50: 335.40/335.10/335.30
Context: Partial EMA alignment with moderate volume, EMAs not perfectly stacked
Idea: CALL
Entry: 335.40-335.60 | Stop: below 335.00 | Target: +10%

⏰ Time: 11:20 AM ET
📊 Timeframe: 1min

---
💡 Remember: Max 2-3 trades/day | Stop at -7% | Target +10-15%
```

### Trading Decision
⚠️ **CONSIDER CAREFULLY**
- Quality: MEDIUM
- Only take if experienced (2+ weeks)
- Verify setup manually first
- Skip if any doubt

---

## Example 4: LOW Quality ORB Breakout LONG

### Input (from TradingView)
```json
{
  "signal": "ORB_BREAKOUT_LONG",
  "ticker": "SPY",
  "time": "1732548600000",
  "price": 450.20,
  "open": 450.00,
  "high": 450.25,
  "low": 449.95,
  "close": 450.20,
  "volume": 800000,
  "vwap": 450.80,
  "ema9": 450.10,
  "ema20": 450.30,
  "ema50": 450.50,
  "timeframe": "1"
}
```

### Expected AI Evaluation
```
SPY – ORB_BREAKOUT_LONG – Quality: LOW
Price: 450.20 | VWAP: 450.80 | EMA9/20/50: 450.10/450.30/450.50
Context: Below VWAP with weak volume, EMAs not aligned bullishly
Idea: SKIP
Entry: N/A | Stop: N/A | Target: N/A
```

### Expected Alert Message
**If LOW filter is enabled:** No message sent (filtered out)

**If LOW filter is disabled:**
```
🚨 TRADING SIGNAL 🚨

SPY – ORB_BREAKOUT_LONG – Quality: LOW
Price: 450.20 | VWAP: 450.80 | EMA9/20/50: 450.10/450.30/450.50
Context: Below VWAP with weak volume, EMAs not aligned bullishly
Idea: SKIP
Entry: N/A | Stop: N/A | Target: N/A

⏰ Time: 11:30 AM ET
📊 Timeframe: 1min

---
💡 Remember: Max 2-3 trades/day | Stop at -7% | Target +10-15%
```

### Trading Decision
❌ **DO NOT TRADE**
- Quality: LOW
- Multiple red flags
- Below VWAP (for LONG setup)
- Weak volume
- **SKIP THIS SIGNAL**

---

## Example 5: HIGH Quality HOD Breakout LONG

### Input (from TradingView)
```json
{
  "signal": "HOD_BREAKOUT_LONG",
  "ticker": "AAPL",
  "time": "1732549200000",
  "price": 176.20,
  "open": 175.80,
  "high": 176.25,
  "low": 175.75,
  "close": 176.20,
  "volume": 2200000,
  "vwap": 175.60,
  "ema9": 175.90,
  "ema20": 175.50,
  "ema50": 175.20,
  "timeframe": "1"
}
```

### Expected AI Evaluation
```
AAPL – HOD_BREAKOUT_LONG – Quality: HIGH
Price: 176.20 | VWAP: 175.60 | EMA9/20/50: 175.90/175.50/175.20
Context: Strong HOD breakout with volume surge and bullish EMA alignment
Idea: CALL
Entry: 176.10-176.30 | Stop: below 175.80 | Target: +12%
```

### Expected Alert Message
```
🚨 TRADING SIGNAL 🚨

AAPL – HOD_BREAKOUT_LONG – Quality: HIGH
Price: 176.20 | VWAP: 175.60 | EMA9/20/50: 175.90/175.50/175.20
Context: Strong HOD breakout with volume surge and bullish EMA alignment
Idea: CALL
Entry: 176.10-176.30 | Stop: below 175.80 | Target: +12%

⏰ Time: 11:40 AM ET
📊 Timeframe: 1min

---
💡 Remember: Max 2-3 trades/day | Stop at -7% | Target +10-15%
```

### Trading Decision
✅ **TAKE THIS TRADE**
- Quality: HIGH
- HOD breakout with confirmation
- Perfect for momentum play

---

## Example 6: HIGH Quality LOD Break PUT

### Input (from TradingView)
```json
{
  "signal": "LOD_BREAK_PUT",
  "ticker": "NVDA",
  "time": "1732549800000",
  "price": 186.50,
  "open": 186.90,
  "high": 187.10,
  "low": 186.45,
  "close": 186.50,
  "volume": 1600000,
  "vwap": 187.20,
  "ema9": 186.80,
  "ema20": 187.30,
  "ema50": 187.90,
  "timeframe": "1"
}
```

### Expected AI Evaluation
```
NVDA – LOD_BREAK_PUT – Quality: HIGH
Price: 186.50 | VWAP: 187.20 | EMA9/20/50: 186.80/187.30/187.90
Context: Clean LOD breakdown with strong volume and bearish trend established
Idea: PUT
Entry: 186.40-186.60 | Stop: above 187.00 | Target: +12%
```

### Expected Alert Message
```
🚨 TRADING SIGNAL 🚨

NVDA – LOD_BREAK_PUT – Quality: HIGH
Price: 186.50 | VWAP: 187.20 | EMA9/20/50: 186.80/187.30/187.90
Context: Clean LOD breakdown with strong volume and bearish trend established
Idea: PUT
Entry: 186.40-186.60 | Stop: above 187.00 | Target: +12%

⏰ Time: 11:50 AM ET
📊 Timeframe: 1min

---
💡 Remember: Max 2-3 trades/day | Stop at -7% | Target +10-15%
```

### Trading Decision
✅ **TAKE THIS TRADE**
- Quality: HIGH
- LOD breakdown
- Good short opportunity

---

## Signal Comparison Table

| Signal Type | Quality | Price vs VWAP | EMA Alignment | Volume | Decision |
|-------------|---------|---------------|---------------|--------|----------|
| VWAP Reclaim LONG | HIGH | Above (+0.16%) | Bullish | 1.67x | ✅ TAKE |
| VWAP Reject PUT | HIGH | Below (-0.29%) | Bearish | 1.8x | ✅ TAKE |
| EMA Trend LONG | MEDIUM | Above (+0.09%) | Partial | 1.1x | ⚠️ MAYBE |
| ORB Breakout LONG | LOW | Below (-0.13%) | Mixed | 0.9x | ❌ SKIP |
| HOD Breakout LONG | HIGH | Above (+0.38%) | Bullish | 2.2x | ✅ TAKE |
| LOD Break PUT | HIGH | Below (-0.38%) | Bearish | 1.6x | ✅ TAKE |

---

## What Makes a HIGH Quality Signal?

Based on the examples above:

### For LONG Signals
✅ **Required:**
- Price > VWAP (at least +0.1%)
- EMA9 > EMA20 (or crossing up)
- Volume > 1.5x average
- Green candle
- Clean setup

### For PUT Signals
✅ **Required:**
- Price < VWAP (at least -0.1%)
- EMA9 < EMA20 (or crossing down)
- Volume > 1.5x average
- Red candle
- Clean rejection/breakdown

---

## Testing Your System

Use the examples above to test:

1. **Send each test payload** to your n8n webhook
2. **Compare AI output** to expected evaluation
3. **Verify quality ratings** are appropriate
4. **Check entry/stop/target** levels make sense
5. **Confirm messages** arrive on Telegram/Discord

### Quick Test Command

```bash
# Test HIGH quality LONG
curl -X POST YOUR_WEBHOOK_URL -H 'Content-Type: application/json' -d '{"signal":"VWAP_RECLAIM_LONG","ticker":"NVDA","time":"1732546200000","price":188.20,"open":188.00,"high":188.55,"low":187.85,"close":188.20,"volume":1250000,"vwap":187.90,"ema9":188.10,"ema20":187.70,"ema50":186.90,"timeframe":"1"}'

# Test LOW quality (should be filtered or marked SKIP)
curl -X POST YOUR_WEBHOOK_URL -H 'Content-Type: application/json' -d '{"signal":"ORB_BREAKOUT_LONG","ticker":"SPY","time":"1732548600000","price":450.20,"open":450.00,"high":450.25,"low":449.95,"close":450.20,"volume":800000,"vwap":450.80,"ema9":450.10,"ema20":450.30,"ema50":450.50,"timeframe":"1"}'
```

---

## Common Patterns to Recognize

### Perfect LONG Setup
- Price 0.2-0.5% above VWAP
- All EMAs aligned (9 > 20 > 50)
- Volume 1.5-2.5x average
- Green candle with strong close
- No conflicting signals

### Perfect PUT Setup
- Price 0.2-0.5% below VWAP
- All EMAs aligned bearish (9 < 20 < 50)
- Volume 1.5-2.5x average
- Red candle with strong close
- Clear rejection or breakdown

### Red Flags (Skip These)
- Price on wrong side of VWAP
- Volume < 1.0x average
- EMAs conflicting or flat
- Choppy candles (dojis)
- During lunch hour (11:30 AM-2:00 PM)

---

Use these examples as your reference when evaluating live signals. If a signal doesn't match these quality standards, be cautious or skip it entirely.

**Remember:** Quality over quantity. Wait for the perfect setups.
