# Pattern: Earnings Event Trading

A complete workflow for trading options around corporate earnings announcements.

---

## 1. Setup Conditions

### Pre-Earnings Environment

```
[ ] Earnings date confirmed (check company IR page and SEC filings)
[ ] Historical earnings moves available (at least 8 quarters of data)
[ ] Current implied move computed from ATM straddle price
[ ] Historical average move computed (absolute value of past earnings moves)
[ ] IV crush magnitude estimated from past earnings cycles
[ ] Liquidity sufficient (weekly options available with tight bid-ask)
[ ] No other major events coinciding (FOMC, sector rotation, macro data)
```

### Computing the Implied Move

```
Implied move = ATM straddle price / underlying price * 100%

Example: AAPL at $200, ATM straddle (weekly expiry) costs $12
Implied move = $12 / $200 = 6.0%
```

### Historical Move Analysis

Gather the last 8-12 quarters of actual earnings-day moves:

```
Example:
  Q1: +3.2%, Q2: -5.1%, Q3: +7.8%, Q4: -2.3%
  Q5: +4.5%, Q6: -1.8%, Q7: +6.2%, Q8: -3.9%

Average absolute move = 4.35%
Standard deviation of moves = 2.0%
Implied move = 6.0%

Signal: Implied move > Average move by 1.65 percentage points
-> The market is overpricing the expected move
-> Sell premium (short straddle/strangle/iron condor)
```

### Decision Rule

```
If implied move > 1.2 * historical average move:
  -> SELL premium (IV is overpricing the event)
  -> Strategy: Short straddle, iron condor, or iron butterfly

If implied move < 0.8 * historical average move:
  -> BUY premium (IV is underpricing the event)
  -> Strategy: Long straddle or long strangle

If implied move is within 0.8x to 1.2x of historical average:
  -> No clear edge; skip or use a directional strategy instead
```

---

## 2. Entry Rules

### Timing

- Enter 1-5 days before earnings (when IV has elevated but not yet peaked)
- For selling: closer to earnings is better (IV peaks in the last 1-2 days)
- For buying: earlier is better (before IV peaks, to benefit from the final IV ramp)

### Strategy Selection (Selling Premium)

| Confidence in Overpricing | Strategy | Max Risk |
|---------------------------|----------|----------|
| High (implied >> historical) | Short straddle + wings | Width - credit |
| Moderate | Iron condor (1 SD strikes) | Width - credit |
| Low | Iron butterfly | Width - credit |

### Strategy Selection (Buying Premium)

| Confidence in Underpricing | Strategy | Max Risk |
|----------------------------|----------|----------|
| High | Long straddle | Premium |
| Moderate | Long strangle | Premium |
| Directional bias | Long call or put (directional) | Premium |

### Expiry Selection

- **Weekly expiry containing the earnings date** (most IV crush concentrated here)
- If weeklies are not available, use the nearest monthly expiry
- Do NOT use long-dated options for earnings trades (IV crush is smaller for longer tenors)

### Sizing

```
Max risk per earnings trade = 1-2% of portfolio
Contracts = (Account * max_risk_pct) / max_loss_per_contract

Example: $100K account, 1.5% risk, max loss $500/contract
Contracts = $100,000 * 0.015 / $500 = 3 contracts
```

---

## 3. Position Management

### Pre-Earnings (After Entry, Before Announcement)

```
Monitor:
  - IV level (is it still rising as expected?)
  - Underlying price (has it moved significantly toward your short strikes?)
  - News/leaks (any pre-announcement guidance?)

Action:
  - If the stock moves sharply before earnings, consider closing or adjusting
  - If IV drops before the announcement (unusual), reassess the trade
  - Do NOT add to the position; keep original size
```

### During Earnings (After-Hours Announcement)

```
For sellers:
  - Check the after-hours move. Compare to your short strikes.
  - If the move is within your profit range: prepare to close at the open
  - If the move exceeds your short strikes: assess the magnitude and prepare for defense

For buyers:
  - If the move is large: prepare to lock in profits at the open
  - If the move is small: the trade is likely a loss; prepare to close
```

### Morning After Earnings (The Critical Window)

```
At market open:
  1. Wait 5-15 minutes for the opening volatility to settle
  2. Assess the gap direction and magnitude vs. your position
  3. Close the position during the first hour

Do NOT hold earnings trades beyond the morning after.
Rationale: The IV crush has occurred. Remaining theta is small. Additional holding
introduces directional risk without the premium edge that justified the trade.
```

---

## 4. Exit Rules

### For Selling Premium

| Scenario | Action | Expected Outcome |
|----------|--------|-----------------|
| Stock within profit zone after earnings | Close morning after at ~50-80% of max profit | Profitable |
| Stock near a short strike | Close immediately; accept partial profit or small loss | Flat to small gain |
| Stock beyond short strikes | Close immediately; accept loss | Loss (limited by wings) |
| IV has not crushed as expected | Close anyway; do not hold | Small gain or loss |

### For Buying Premium

| Scenario | Action | Expected Outcome |
|----------|--------|-----------------|
| Large move in either direction | Close morning after for profit | Profitable |
| Moderate move (near breakeven) | Close morning after; accept near-breakeven | Flat |
| No significant move | Close morning after; accept loss | Loss (premium paid) |

### Hard Rules

```
ALWAYS close the morning after earnings. No exceptions.
NEVER hold an earnings trade for a second earnings cycle.
NEVER add to a losing earnings position.
```

---

## 5. Risk Controls

### Position-Level

- Max risk: 1-2% of portfolio per earnings trade
- Max concurrent earnings trades: 3 (to avoid correlated earnings surprises)
- No earnings trades in the same sector on the same day (correlation risk)

### Gap Risk Management

For selling premium, the overnight gap after earnings is the primary risk:

```
Max gap scenario: Stock gaps 3x the implied move (rare but possible)
Ensure max loss at 3x move is < 2% of portfolio

Example: Implied move = 6%, 3x = 18%
If selling iron condor with $5 wide wings:
  Max loss = $500/contract - credit
  Ensure this is < 2% of account
```

### Behavioral Controls

```
[ ] Trade plan written BEFORE entering (not after)
[ ] Exit plan written BEFORE entering (morning after, no exceptions)
[ ] No "holding through" a bad outcome -- close the trade
[ ] No doubling down if the initial trade goes against you
[ ] Accept that 30-40% of earnings trades will lose money
```

---

## 6. Historical Performance Expectations

### Selling Earnings Premium (Iron Condor / Short Straddle)

Based on research across large-cap equities:

- Win rate: 60-70% (implied move overstates actual move on average)
- Average win: 30-60% of max profit
- Average loss: 100-200% of average win
- Profit factor: 1.1-1.5
- Key risk: The 1-2 times per year a stock moves 3-4x the implied move (tail risk)

### Buying Earnings Premium (Long Straddle)

- Win rate: 25-35% (most of the time, the implied move overprices)
- Average win: 200-400% of premium paid
- Average loss: 60-80% of premium paid
- Profit factor: 0.8-1.2 (hard to profit consistently)
- Best used selectively when implied move is clearly too low

### Key Insight

The earnings volatility premium (implied > realized on average) favors sellers. However, the tail risk of extreme moves makes this a strategy that requires:
- Strict position sizing (never oversize)
- Defined risk (always use wings/spreads, not naked)
- Diversification across many earnings events (law of large numbers)
- Acceptance that individual trades will have large losses

---

## 7. Common Mistakes

1. **Oversizing:** Putting 5-10% of portfolio on a single earnings trade (one bad gap destroys months of profits)
2. **Holding through:** Not closing the morning after because "it might recover" (it usually does not)
3. **Ignoring historical moves:** Selling at implied move = historical average (no edge)
4. **Selling naked:** Not buying wings, exposing to unlimited loss
5. **Same-sector concentration:** Three tech earnings on the same day (correlated surprises)
6. **Confirmation bias:** Only looking at bullish/bearish research, not the actual vol edge
