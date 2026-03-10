# Trade Plan Template

Copy this template for each new trade. Fill in all fields before entering.

---

## Trade ID: T-YYYY-MMDD-###

## 1. Trade Summary

| Field | Value |
|-------|-------|
| Date | |
| Underlying | |
| Current Price | |
| Strategy | |
| Expiry | |
| DTE at Entry | |

## 2. Legs

| Leg | Type | Strike | Expiry | Qty | Price | Delta |
|-----|------|--------|--------|-----|-------|-------|
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |
| 4 | | | | | | |

**Net Credit/Debit:** $____
**Contracts:** ____
**Total Premium:** $____

## 3. Thesis

### Directional View
_Why do you expect the underlying to move (or not move) in a specific direction?_

### Volatility View
_Is IV rich or cheap? What do you expect IV to do?_

| Metric | Value |
|--------|-------|
| Current IV (ATM 30-day) | |
| IV Rank (52-week) | |
| IV Percentile | |
| Historical Vol (30-day Yang-Zhang) | |
| IV - HV Spread | |
| GARCH Forecast (30-day) | |

### Catalyst / Timing
_What event or condition will drive the trade? When?_

### Counter-Thesis
_What would make this trade wrong? What am I missing?_

## 4. Risk Parameters

| Metric | Value |
|--------|-------|
| Max Loss (per contract) | $ |
| Max Loss (total position) | $ |
| Max Loss (% of portfolio) | % |
| Margin Required | $ |
| Margin Utilization After Trade | % |

### Position Size Calculation

```
Method used: [ ] Fixed fractional  [ ] Kelly  [ ] Vol-adjusted  [ ] Other: ____
Risk budget: ____% of portfolio = $____
Max loss per contract: $____
Contracts = Risk budget / Max loss = ____
```

## 5. Greeks at Entry

| Greek | Per Contract | Total Position | Portfolio Impact |
|-------|-------------|---------------|-----------------|
| Delta | | | |
| Gamma | | | |
| Theta | | | |
| Vega | | | |

### Portfolio Greeks After This Trade

| Greek | Before | After | Limit | OK? |
|-------|--------|-------|-------|-----|
| Net Delta | | | +/- | [ ] |
| Net Gamma | | | +/- | [ ] |
| Net Theta | | | +/- | [ ] |
| Net Vega | | | +/- | [ ] |

## 6. Exit Plan

### Profit Target
- Target: ____% of max profit = $____
- Order type: Limit at $____

### Stop Loss
- Stop: ____% loss or $____ loss
- Order type: ____
- Hard rule: Close if loss exceeds $____

### Time-Based Exit
- Close if DTE reaches ____ days
- Close if held longer than ____ days

### Adjustment Plan
- If tested on [side]: ____
- If IV changes by ____: ____
- If delta drifts beyond ____: ____

## 7. Execution Plan

| Field | Value |
|-------|-------|
| Order Type | [ ] Limit  [ ] Spread  [ ] Combo |
| Starting Price | Mid-price = $____ |
| Max Acceptable Slippage | $____ |
| Preferred Execution Time | ____:____ ET |
| Avoid | [ ] Open  [ ] Close  [ ] Expiry day |

## 8. Pre-Trade Checklist

```
[ ] Thesis documented (directional + vol)
[ ] Counter-thesis considered
[ ] Position size within limits
[ ] Portfolio impact acceptable (Greeks)
[ ] Margin sufficient
[ ] Exit plan defined (profit target + stop loss + time)
[ ] No conflicting positions in portfolio
[ ] Execution plan ready
[ ] Trade journal entry created
```

**Proceed with trade:** [ ] YES  [ ] NO -- Reason: ____

---

## Post-Trade Completion (Fill After Exit)

### Exit Record

| Field | Value |
|-------|-------|
| Exit Date | |
| Exit Price | |
| Realized P&L | $ |
| Hold Period | days |
| Exit Reason | [ ] Profit target  [ ] Stop loss  [ ] Time exit  [ ] Thesis invalidated  [ ] Other |

### P&L Attribution

| Component | P&L |
|-----------|-----|
| Delta P&L | $ |
| Gamma P&L | $ |
| Theta P&L | $ |
| Vega P&L | $ |
| Residual | $ |
| **Total** | **$** |

### Post-Trade Review

- Was the directional thesis correct? [ ] Yes [ ] No [ ] N/A
- Was the volatility thesis correct? [ ] Yes [ ] No [ ] N/A
- Was the strategy appropriate? [ ] Yes [ ] No
- Was the exit plan followed? [ ] Yes [ ] No -- Explain: ____
- Execution quality: [ ] Good [ ] Acceptable [ ] Poor -- Explain: ____
- Behavioral notes: ____
- Lessons learned: ____
- Would I take this trade again? [ ] Yes [ ] No -- Reason: ____
