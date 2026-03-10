# Pattern: Volatility Trade (Entry to Exit)

A complete workflow for trading implied volatility vs. realized volatility.

---

## 1. Setup Conditions

All conditions must be met before entering:

### For Selling Volatility (IV > Forecasted RV)

```
[ ] IV Rank > 50th percentile (current IV is elevated relative to its range)
[ ] IV Percentile > 60th (current IV exceeds 60% of observations in past year)
[ ] GARCH forecast of 30-day RV < current ATM IV by at least 2 vol points
[ ] No major binary events within the trade's DTE (earnings, FDA, FOMC)
[ ] VIX term structure is in contango (normal -- not a crisis)
[ ] The underlying has sufficient options liquidity (bid-ask spread < 5% of option price)
[ ] Portfolio vega limit has room for additional short vega exposure
```

### For Buying Volatility (IV < Forecasted RV)

```
[ ] IV Rank < 30th percentile (current IV is depressed)
[ ] IV Percentile < 40th
[ ] GARCH forecast of 30-day RV > current ATM IV by at least 2 vol points
[ ] A catalyst exists (upcoming event, regime change signal, macro uncertainty)
[ ] VIX term structure is NOT in deep contango (avoid fighting the vol carry)
[ ] The underlying has a history of realized vol spikes (not a perpetually low-vol name)
[ ] Portfolio can absorb the theta cost of the long vol position
```

---

## 2. Entry Rules

### Strategy Selection

| Signal | IV Rank | Strategy |
|--------|---------|----------|
| Sell vol | 50-70% | Iron condor (16 delta short strikes) |
| Sell vol | 70-90% | Short strangle (20 delta) or iron butterfly |
| Sell vol | > 90% | Short straddle with wings (if risk tolerance allows) |
| Buy vol | < 30% | Long straddle or long strangle |
| Buy vol | < 20% | Calendar spread (long back month, short front) |
| Buy vol | < 10% | Long-dated straddle (LEAPS vol purchase) |

### Expiry Selection

- **Selling vol:** 30-45 DTE (optimal theta decay, manageable gamma)
- **Buying vol:** 45-90 DTE (slower theta bleed, more time for thesis to play out)

### Sizing

```
Position size = min(
    Kelly_fraction * Account_value / Max_loss_per_contract,
    Portfolio_vega_limit_remaining / Vega_per_contract,
    Liquidity_limit (no more than 5% of average daily volume)
)
```

### Execution

- Submit as a spread/combo order at the mid-price
- If not filled in 60 seconds, adjust toward the natural price by 1 tick
- Maximum acceptable slippage: 10% of the net credit/debit
- Avoid entering in the first 30 minutes of the trading day

---

## 3. Position Management

### Daily Monitoring

```
Every day:
  1. Compute current IV rank and compare to entry
  2. Compare realized vol (trailing 10-day Yang-Zhang) to implied vol at entry
  3. Check portfolio Greeks (has vega exposure drifted?)
  4. Check underlying price relative to short strikes (for condors/strangles)
```

### Adjustment Triggers

| Trigger | Condition | Action |
|---------|-----------|--------|
| Tested side | Underlying within 1 strike of short option | Roll tested side out by 1 week |
| Breached side | Underlying past the short strike | Close the trade OR roll out and adjust strikes |
| IV spike (if short vol) | IV rank jumps > 20 points | Assess: is the spike temporary? If thesis intact, hold. If not, close. |
| IV crush (if long vol) | IV rank drops > 15 points | Close the trade; vol thesis was wrong |
| Delta drift | Portfolio delta exceeds limit | Delta-hedge with stock or adjust strikes |
| 21 DTE reached | Time remaining < 21 days | Close the trade (gamma risk too high for short vol) |

### Gamma Scalping (for Long Vol Positions)

If holding a long straddle/strangle and delta-hedging:

```
Rebalance when:
  - Absolute delta exceeds +/- 0.30 per contract
  - OR stock has moved more than 1 ATR since last hedge
  - OR end of day (hedge overnight delta to near zero)

Each rebalance:
  - Sell shares if delta is positive (stock rallied)
  - Buy shares if delta is negative (stock dropped)
  - Log the shares traded and the realized P&L from the hedge
```

---

## 4. Exit Rules

### Profit Targets

| Position Type | Profit Target | Rationale |
|---------------|--------------|-----------|
| Short vol (iron condor) | 50% of max profit | Captures most of the edge; avoids gamma risk at end |
| Short vol (short strangle) | 50% of initial credit | Same logic |
| Short vol (iron butterfly) | 25-50% of max profit | Narrower profit zone; take profits earlier |
| Long vol (straddle) | 100% of premium paid (2x) | Double your money; rare but occurs on vol spikes |
| Long vol (calendar) | 25-50% of debit | Calendar profits accrue slowly |

### Stop Losses

| Position Type | Stop Loss | Rationale |
|---------------|-----------|-----------|
| Short vol (defined risk) | 2x the initial credit | Position has lost as much as it earned; thesis is wrong |
| Short vol (undefined risk) | 2x the initial credit OR 5% of account | Absolute cap on loss |
| Long vol | 50% of premium paid | If vol has not materialized by now, it likely will not |

### Time-Based Exit

```
If DTE < 21 AND short vol: Close regardless of P&L
If DTE < 14 AND long vol: Close (theta acceleration is destroying the position)
```

### Event-Based Exit

```
If a binary event is announced during the trade (unexpected earnings date change, M&A news):
  - For short vol: Close immediately (event increases realized vol risk)
  - For long vol: Hold through the event (this is what you are positioned for)
```

---

## 5. Risk Controls

### Position-Level

- Max loss per vol trade: 2% of portfolio
- Max vega per vol trade: 20% of portfolio vega limit
- Max holding period: 45 days (close if not triggered earlier)

### Portfolio-Level

- Total short vega: capped at $X per 1 vol point (based on account size)
- Total short gamma: capped at $X per (1%)^2 move
- No more than 3 concurrent short vol positions on the same underlying
- Correlation check: if all short vol positions are on correlated underlyings, reduce total size

### Regime Check

```
Before every vol trade:
  - Run HMM regime filter: what is the current regime probability?
  - If P(high-vol regime) > 0.6: Do NOT sell vol. Consider buying vol.
  - If P(low-vol regime) > 0.8: Selling vol is favorable but size conservatively.
```

---

## 6. Historical Performance Expectations

### Selling Vol (Iron Condor, 45 DTE, 16-Delta)

- Win rate: 65-75%
- Average win: 40-60% of max profit
- Average loss: 100-200% of average win
- Profit factor: 1.2-1.8
- Annual return (backtested): 8-15% on capital at risk
- Worst month: -10 to -20% of capital at risk (vol spike event)
- Max drawdown: 15-30%

### Buying Vol (Long Straddle, 60 DTE, ATM)

- Win rate: 30-40%
- Average win: 150-300% of premium paid
- Average loss: 40-60% of premium paid
- Profit factor: 1.0-1.5
- Annual return: 0-10% (harder to profit consistently)
- Best month: +30-50% (during vol events)
- Challenge: Persistent theta bleed in calm markets

---

## 7. Pattern Variations

### Earnings Vol Crush Pattern
See `earnings_trade_pattern.md` for the specific case of selling vol before earnings.

### Term Structure Mean Reversion
When the term structure is inverted (backwardation), buy a calendar spread betting on normalization.

### Skew Trade
When put skew is historically steep, sell a put spread and buy a call spread (risk reversal), betting on skew normalization.
