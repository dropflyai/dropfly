# Portfolio Risk Report Template

Generate this report weekly (or daily during elevated-risk periods).

---

## Report Date: ____-____-____

## 1. Portfolio Summary

| Metric | Value |
|--------|-------|
| Total Portfolio Value | $ |
| Cash / Buying Power | $ |
| Net Liquidation Value | $ |
| Margin Used | $ |
| Margin Utilization | % |
| Number of Open Positions | |
| Number of Underlyings | |

---

## 2. Portfolio Greeks

| Greek | Current | Limit | Status |
|-------|---------|-------|--------|
| Net Delta ($ per 1%) | $ | +/- $ | [ ] OK  [ ] WARNING  [ ] BREACH |
| Net Gamma ($ per (1%)^2) | $ | +/- $ | [ ] OK  [ ] WARNING  [ ] BREACH |
| Net Theta ($ per day) | $ | +/- $ | [ ] OK  [ ] WARNING  [ ] BREACH |
| Net Vega ($ per 1 vol pt) | $ | +/- $ | [ ] OK  [ ] WARNING  [ ] BREACH |

### Greeks by Expiry Bucket

| Bucket | Delta | Gamma | Theta | Vega |
|--------|-------|-------|-------|------|
| 0-7 DTE | | | | |
| 8-21 DTE | | | | |
| 22-45 DTE | | | | |
| 46-90 DTE | | | | |
| 90+ DTE | | | | |

### Greeks by Underlying (Top 5 Exposures)

| Underlying | Delta | Gamma | Theta | Vega | Weight |
|-----------|-------|-------|-------|------|--------|
| 1. | | | | | % |
| 2. | | | | | % |
| 3. | | | | | % |
| 4. | | | | | % |
| 5. | | | | | % |

---

## 3. Scenario Analysis

### Price x Volatility Matrix (Portfolio P&L)

| | Vol -5 | Vol -2 | Vol 0 | Vol +2 | Vol +5 | Vol +10 | Vol +20 |
|---------|--------|--------|-------|--------|--------|---------|---------|
| SPX -10% | | | | | | | |
| SPX -5% | | | | | | | |
| SPX -2% | | | | | | | |
| SPX 0% | | | | | | | |
| SPX +2% | | | | | | | |
| SPX +5% | | | | | | | |
| SPX +10% | | | | | | | |

### Historical Stress Scenarios

| Scenario | Date | SPX Move | VIX Level | Portfolio P&L |
|----------|------|----------|-----------|---------------|
| Black Monday | Oct 1987 | -22% | 150 | $ |
| Financial Crisis | Oct 2008 | -17% | 80 | $ |
| Flash Crash | May 2010 | -9% | 40 | $ |
| Volmageddon | Feb 2018 | -4% | 50 | $ |
| COVID Crash | Mar 2020 | -12% | 82 | $ |
| Custom Scenario | | | | $ |

---

## 4. Value at Risk

| Metric | 1-Day | 5-Day | 10-Day |
|--------|-------|-------|--------|
| VaR (95%) | $ | $ | $ |
| VaR (99%) | $ | $ | $ |
| Expected Shortfall (95%) | $ | $ | $ |
| Expected Shortfall (99%) | $ | $ | $ |

**VaR Method Used:** [ ] Parametric  [ ] Historical  [ ] Monte Carlo

**Assumptions:**
- Lookback period: ____ days
- Number of simulations: ____ (if Monte Carlo)
- Confidence level: ____%

---

## 5. Concentration Analysis

### By Underlying

| Underlying | % of Portfolio | Max Acceptable | Status |
|-----------|---------------|----------------|--------|
| | % | % | [ ] OK  [ ] WARNING |
| | % | % | [ ] OK  [ ] WARNING |
| | % | % | [ ] OK  [ ] WARNING |

### By Sector

| Sector | % of Portfolio | Max Acceptable | Status |
|--------|---------------|----------------|--------|
| Technology | % | % | |
| Healthcare | % | % | |
| Financials | % | % | |
| Consumer | % | % | |
| Energy | % | % | |
| Other | % | % | |

### By Strategy Type

| Strategy | % of Capital at Risk | Target Allocation |
|----------|---------------------|-------------------|
| Directional | % | % |
| Volatility | % | % |
| Income | % | % |
| Hedges | % | % |

---

## 6. Margin Analysis

| Metric | Value | Limit | Buffer |
|--------|-------|-------|--------|
| Current Margin Used | $ | $ | $ |
| Margin Utilization | % | % | |
| Margin Under Stress (-10% SPX) | $ | $ | |
| Margin Under Stress (-20% SPX) | $ | $ | |

**Margin Call Risk Assessment:** [ ] Low  [ ] Medium  [ ] High

---

## 7. P&L Summary (Period)

| Metric | This Week | MTD | YTD |
|--------|-----------|-----|-----|
| Gross P&L | $ | $ | $ |
| Net P&L (after costs) | $ | $ | $ |
| Return (%) | % | % | % |
| Sharpe Ratio (annualized) | | | |
| Max Drawdown (period) | % | % | % |
| Current Drawdown from Peak | % | | |

### P&L Attribution

| Component | This Week | MTD |
|-----------|-----------|-----|
| Delta P&L | $ | $ |
| Gamma P&L | $ | $ |
| Theta P&L | $ | $ |
| Vega P&L | $ | $ |
| Unexplained | $ | $ |

---

## 8. Risk Alerts

### Active Alerts

| Alert | Severity | Description | Action Required |
|-------|----------|-------------|----------------|
| | [ ] Low  [ ] Med  [ ] High | | |
| | [ ] Low  [ ] Med  [ ] High | | |
| | [ ] Low  [ ] Med  [ ] High | | |

### Drawdown Status

| Level | Threshold | Current | Status |
|-------|-----------|---------|--------|
| Monitor | 5% | % | [ ] Active  [ ] Clear |
| Warning | 10% | % | [ ] Active  [ ] Clear |
| Critical | 15% | % | [ ] Active  [ ] Clear |
| Emergency | 20% | % | [ ] Active  [ ] Clear |

---

## 9. Action Items

| Priority | Action | Due Date | Owner |
|----------|--------|----------|-------|
| | | | |
| | | | |
| | | | |

---

## 10. Sign-Off

```
Report prepared by: ____________________
Date: ____-____-____
Portfolio risk level: [ ] Low  [ ] Normal  [ ] Elevated  [ ] High
Next review date: ____-____-____
```
