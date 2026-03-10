# Pattern: Portfolio Hedging

A complete workflow for hedging portfolio risk using options.

---

## 1. Setup Conditions

### When to Hedge

```
[ ] Portfolio delta exposure exceeds comfort level (too directional)
[ ] Major macro event approaching (FOMC, election, geopolitical risk)
[ ] Portfolio has reached a significant profit milestone (protect gains)
[ ] Drawdown approaching pre-defined trigger level (see eval/AccountabilityProtocol.md)
[ ] VIX is low (< 16): hedging is cheap; good time to add protection
[ ] Regime model signals elevated probability of high-vol regime
[ ] Concentration risk: portfolio overly exposed to one sector or factor
```

### When NOT to Hedge

```
[ ] VIX is already elevated (> 30): protection is expensive; consider reducing exposure instead
[ ] Portfolio is already well-hedged (net delta near zero, defined risk positions)
[ ] Hedge cost exceeds 3% annualized of portfolio value (too expensive)
[ ] Short time horizon (< 1 week): options theta will dominate
```

---

## 2. Hedge Type Selection

### Decision Framework

```
What are you hedging against?

1. MARKET-WIDE DECLINE (systematic risk)
   -> SPX/SPY puts, VIX calls
   -> See Section 3a

2. SECTOR-SPECIFIC RISK
   -> Sector ETF puts (XLK, XLF, XLE)
   -> See Section 3b

3. SINGLE-STOCK RISK (concentrated position)
   -> Direct puts on the stock, collars
   -> See Section 3c

4. VOLATILITY SPIKE (vega risk)
   -> VIX calls, variance swap equivalent
   -> See Section 3d

5. TAIL RISK (catastrophic event)
   -> Deep OTM puts, Universa-style program
   -> See Section 3e
```

---

## 3a. Market-Wide Hedge (SPX/SPY Puts)

### Structure

Buy OTM put options on SPX or SPY.

### Strike Selection

| Protection Level | Strike | Cost (Typical) | Hedge Effectiveness |
|-----------------|--------|----------------|-------------------|
| Light (-5% decline) | 95% of current | 1.5-3.0% annualized | High for moderate declines |
| Standard (-10%) | 90% of current | 0.8-1.5% annualized | Good balance of cost and protection |
| Tail (-20%) | 80% of current | 0.3-0.7% annualized | Only for severe crashes |
| Deep tail (-30%) | 70% of current | 0.1-0.3% annualized | Catastrophic insurance only |

### Expiry Selection

- **Monthly rolling (30 DTE):** Highest theta cost but most responsive protection
- **Quarterly rolling (90 DTE):** Good balance; most common institutional approach
- **6-month puts:** Lowest annualized cost but slower to adjust; gap risk during the period

### Sizing

```
Hedge ratio = desired_beta_reduction * portfolio_beta / put_delta

Example:
  Portfolio value: $500K, portfolio beta: 1.2
  Want to reduce effective beta from 1.2 to 0.5 (reduce by 0.7)
  Put delta at entry: -0.25

  Notional hedge needed = $500K * 0.7 = $350K
  Contracts = $350K / (SPY price * 100 * |delta|)
  If SPY = $500: Contracts = $350K / ($500 * 100 * 0.25) = 28 contracts
```

### Cost Reduction Techniques

**Put spread:** Buy protective put, sell further OTM put:
- Reduces cost by 30-50%
- Limits protection below the sold put strike
- Acceptable if you believe a -20% decline is sufficient protection and -30% is not worth insuring

**Collar:** Buy put, sell call:
- Cost: near-zero (call premium funds put)
- Trade-off: caps upside at the call strike
- Best when you are willing to accept limited upside for free downside protection

**Put ratio spread (1x2):** Buy 1 ATM put, sell 2 OTM puts:
- Very cheap or free
- Full protection between the two strikes
- Below the OTM strikes: protection reverses (you become net long again)
- Only use if you believe a decline will not exceed the lower strike

---

## 3b. Sector Hedge

### When to Use
Your portfolio is concentrated in a sector that faces specific risk (e.g., tech regulation, energy price shock, banking crisis).

### Implementation
- Buy puts on the sector ETF (XLK, XLF, XLE, etc.)
- Size based on the portfolio's dollar exposure to that sector
- Same strike/expiry selection as market-wide hedges

---

## 3c. Single-Stock Hedge (Concentrated Position)

### When to Use
You hold a large position in one stock (e.g., company stock, lock-up shares, inheritance).

### Structure: Collar

```
Long 1000 shares at $100
Buy 10 puts at $90 strike (10% OTM)
Sell 10 calls at $115 strike (15% OTM)
```

Net cost: approximately zero (zero-cost collar).
Protection: stock cannot fall below $90 (you sell at $90 if it drops).
Cap: stock gains above $115 are forfeited.

### Tax Considerations
- Costless collars may trigger constructive sale rules (IRS Section 1259) if the strikes are too tight
- Consult a tax advisor before collaring a large concentrated position
- ATM collars are almost certainly constructive sales; 10-15% OTM should be safe

---

## 3d. Volatility Hedge (VIX Calls)

### When to Use
Your portfolio has significant short vega exposure (e.g., from income strategies) and you want to hedge against a vol spike.

### Structure

Buy OTM VIX calls (strike 25-35 when VIX is at 15-20).

### Key Properties
- VIX calls are priced off VIX futures, not spot VIX
- VIX calls have inherent contango drag (futures > spot in normal markets)
- During a crash, VIX spot spikes above futures, and VIX calls can pay 10-20x
- Cost: 1-3% of portfolio per year for ongoing protection

### Sizing

```
VIX call hedge notional = Portfolio_vega_exposure * expected_VIX_move_in_crash

Example:
  Portfolio net vega = -$5,000 (lose $5K per 1 vol point increase)
  Expect VIX to spike 30 points in a crash (from 15 to 45)
  Expected loss from vega = $5,000 * 30 = $150,000
  Buy enough VIX calls to offset: target payoff of $150K at VIX = 45
```

---

## 3e. Tail Risk Hedge Program (Systematic)

### Philosophy

Allocate a fixed percentage of portfolio (3-5%) annually to deep OTM put protection. Accept the persistent theta bleed as an insurance cost. When a crash occurs, the hedge pays 10-50x, allowing you to buy discounted assets.

### Implementation

```
Monthly cycle:
  1. Allocate 0.3% of portfolio to tail hedge budget this month
  2. Buy 10-15 delta SPX puts, 30-60 DTE
  3. Hold until expiry or roll at 14 DTE (whichever comes first)
  4. If a crash occurs: puts appreciate massively
     -> Sell puts to monetize the hedge
     -> Use proceeds to buy discounted assets
```

### When the Hedge Pays Off

```
Scenario: Portfolio = $1M, hedge budget = $3,500/month

Normal month:
  Puts expire worthless. Loss = $3,500 (0.35% of portfolio).

Crash month (SPX -25%):
  Portfolio loss (unhedged): -$250,000
  Put payoff: $100,000 - $200,000 (depending on severity and timing)
  Net portfolio loss: -$50,000 to -$150,000 (significantly reduced)
  Action: Sell some puts, buy discounted SPX at the bottom
```

---

## 4. Position Management

### Monitoring

```
Weekly:
  [ ] Hedge effectiveness ratio = Hedge P&L / Portfolio P&L (during drawdowns)
  [ ] Current hedge delta relative to portfolio delta
  [ ] Time remaining on hedge (DTE)
  [ ] Cost tracking (cumulative hedge cost vs. budget)
  [ ] VIX level and term structure assessment
```

### Rolling

```
Roll the hedge when:
  - DTE < 14 days (theta acceleration)
  - The hedge has gained significantly (lock in some profit, re-establish at new strikes)
  - Market conditions have changed (new strike/expiry needed)

Roll procedure:
  1. Sell existing puts (capture remaining value)
  2. Buy new puts at updated strike/expiry
  3. Net cost = new premium - old premium recaptured
```

### Hedge Adjustment After a Decline

If the market has declined and your hedge has gained:

```
Option A: Monetize and re-hedge
  - Sell the winning puts
  - Buy new puts at lower strikes (protection for further decline)
  - Pocket the difference

Option B: Spread the hedge
  - Sell a lower-strike put against your winning put (creates a put spread)
  - Locks in some profit while maintaining protection
  - Reduces further downside participation

Option C: Remove the hedge
  - If the decline matches your target and you are now bullish, remove the hedge entirely
  - This is a judgment call; do not remove if the crisis is still unfolding
```

---

## 5. Exit Rules

### Hedge Removal Triggers

```
Remove the hedge when:
  - The event/risk has passed (FOMC concluded, earnings reported)
  - Portfolio exposure has been reduced by other means (sold positions)
  - VIX has spiked and the hedge has paid off (monetize)
  - The hedge cost exceeds the remaining budget for the period
  - A new market regime has been confirmed (low-vol, bullish)
```

### Do Not Remove When

```
  - "The market has gone down a lot so it must bounce" (this is the gambler's fallacy)
  - VIX is elevated but the crisis is ongoing (the hedge is most valuable now)
  - You want to reduce costs during a drawdown (this is exactly when you need the hedge)
```

---

## 6. Risk Controls

- Hedge budget: 2-5% of portfolio annually (set at the beginning of the year)
- No individual hedge should cost more than 1% of portfolio
- Track hedge effectiveness: if the hedge consistently underperforms expectations, review the sizing and strike selection
- Never sell the hedge during a panic to raise cash (this defeats the purpose)

---

## 7. Cost-Benefit Analysis Template

```
Hedge Cost Analysis:
  Monthly premium: $______
  Annual cost: $______ (____% of portfolio)
  Protection level: ____% decline covered
  Expected payoff in -20% crash: $______
  Breakeven: crash frequency of 1 per ____ years justifies the cost

Decision: [ ] Proceed with hedge  [ ] Adjust parameters  [ ] Skip (accept unhedged risk)
```
