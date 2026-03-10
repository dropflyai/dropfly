# Strategy Backtest Report Template

Use this template to document the results of a strategy backtest.

---

## Strategy: ____________________
## Backtest Date: ____-____-____

---

## 1. Strategy Description

| Field | Value |
|-------|-------|
| Strategy Name | |
| Strategy Type | [ ] Directional  [ ] Volatility  [ ] Income  [ ] Hedge  [ ] Arbitrage |
| Underlying(s) | |
| Option Structure | (e.g., iron condor, long straddle, etc.) |
| Entry Criteria | |
| Exit Criteria | |
| Position Sizing Method | |
| Adjustment Rules | |

### Entry Rules (Detailed)

```
Enter when:
  1. ____________________
  2. ____________________
  3. ____________________
```

### Exit Rules (Detailed)

```
Profit target: ____________________
Stop loss: ____________________
Time-based exit: ____________________
Adjustment triggers: ____________________
```

---

## 2. Backtest Parameters

| Parameter | Value |
|-----------|-------|
| Start Date | |
| End Date | |
| Total Duration | years |
| Data Source | |
| Data Frequency | [ ] Daily  [ ] Intraday (___min)  [ ] Tick |
| Options Data | [ ] End-of-day  [ ] Intraday  [ ] Reconstructed |
| Starting Capital | $ |
| Commission Model | $ per contract |
| Slippage Model | [ ] None  [ ] Fixed  [ ] % of spread  [ ] Market impact |
| Slippage Amount | $ per leg |

### Important Assumptions

```
[ ] Transaction costs included
[ ] Slippage included
[ ] Dividends accounted for
[ ] Early exercise modeled (for American options)
[ ] Margin requirements enforced
[ ] Position sizing applied (not fixed-lot)
[ ] Survivorship bias addressed
[ ] Look-ahead bias eliminated
```

---

## 3. Performance Summary

### Return Metrics

| Metric | Value |
|--------|-------|
| Total Return | % |
| Annualized Return (CAGR) | % |
| Total P&L | $ |
| Best Year | % |
| Worst Year | % |
| Best Month | % |
| Worst Month | % |

### Risk Metrics

| Metric | Value |
|--------|-------|
| Annualized Volatility | % |
| Sharpe Ratio | |
| Sortino Ratio | |
| Calmar Ratio | |
| Max Drawdown | % |
| Max Drawdown Duration | days |
| Average Drawdown | % |
| Ulcer Index | |

### Trade Metrics

| Metric | Value |
|--------|-------|
| Total Trades | |
| Winning Trades | |
| Losing Trades | |
| Win Rate | % |
| Average Win | $ (%) |
| Average Loss | $ (%) |
| Largest Win | $ (%) |
| Largest Loss | $ (%) |
| Profit Factor | |
| Average Trade Duration | days |
| Average Trades per Month | |
| Expectancy per Trade | $ |

---

## 4. Performance by Year

| Year | Return (%) | Trades | Win Rate | Max DD | Sharpe |
|------|-----------|--------|----------|--------|--------|
| | | | | | |
| | | | | | |
| | | | | | |
| | | | | | |
| | | | | | |

---

## 5. Performance by Market Regime

| Regime | Return (%) | Win Rate | Avg Trade P&L | Trades |
|--------|-----------|----------|--------------|--------|
| Low Vol (VIX < 15) | | | | |
| Normal Vol (VIX 15-25) | | | | |
| High Vol (VIX 25-35) | | | | |
| Crisis (VIX > 35) | | | | |
| Bull Market | | | | |
| Bear Market | | | | |
| Sideways Market | | | | |

---

## 6. Drawdown Analysis

### Top 5 Drawdowns

| Rank | Start Date | Trough Date | Recovery Date | Depth (%) | Duration (days) | Cause |
|------|-----------|-------------|--------------|-----------|----------------|-------|
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |
| 4 | | | | | | |
| 5 | | | | | | |

### Drawdown Distribution

| Drawdown Range | Frequency | Avg Duration |
|---------------|-----------|-------------|
| 0-2% | | |
| 2-5% | | |
| 5-10% | | |
| 10-15% | | |
| 15%+ | | |

---

## 7. Statistical Validation

### Significance Tests

| Test | Statistic | p-value | Significant? |
|------|-----------|---------|-------------|
| t-test (mean return != 0) | | | [ ] Yes  [ ] No |
| Sharpe ratio significance | | | [ ] Yes  [ ] No |
| Runs test (serial independence) | | | [ ] Yes  [ ] No |

### Robustness Checks

| Check | Result | Pass? |
|-------|--------|-------|
| Out-of-sample performance | % return | [ ] Yes  [ ] No |
| Walk-forward optimization | % return | [ ] Yes  [ ] No |
| Parameter sensitivity (strike change +/-) | % impact | [ ] Stable  [ ] Sensitive |
| Parameter sensitivity (DTE change +/-) | % impact | [ ] Stable  [ ] Sensitive |
| Transaction cost sensitivity (2x costs) | % impact | [ ] Robust  [ ] Degraded |
| Bootstrap confidence interval (95%) | [___, ___] | |

### Multiple Testing Correction

If multiple strategies or parameter sets were tested:

```
Number of strategies/parameter sets tested: ____
Bonferroni-adjusted p-value threshold: ____
Strategy still significant after correction? [ ] Yes  [ ] No
```

---

## 8. Monte Carlo Analysis

### Simulated Equity Curves (1000 Paths)

| Percentile | Final Value | CAGR | Max DD |
|------------|-------------|------|--------|
| 5th | $ | % | % |
| 25th | $ | % | % |
| 50th (Median) | $ | % | % |
| 75th | $ | % | % |
| 95th | $ | % | % |

### Probability of Ruin

```
Probability of 50% drawdown: ____%
Probability of 25% drawdown: ____%
Expected time to first 15% drawdown: ____ months
```

---

## 9. Comparison to Benchmarks

| Metric | Strategy | SPY (Buy & Hold) | BXM (Covered Call) | Risk-Free |
|--------|----------|------|-----|-----------|
| CAGR | % | % | % | % |
| Sharpe | | | | |
| Max DD | % | % | % | 0% |
| Correlation to SPY | | 1.00 | | |

---

## 10. Conclusions and Recommendations

### Key Findings

```
1. ____________________
2. ____________________
3. ____________________
```

### Strengths

```
1. ____________________
2. ____________________
```

### Weaknesses / Risks

```
1. ____________________
2. ____________________
```

### Recommendation

```
[ ] Deploy with full allocation
[ ] Deploy with reduced allocation (____% of target)
[ ] Paper trade for ____ more months
[ ] Requires modification: ____________________
[ ] Reject: ____________________
```

### Next Steps

```
1. ____________________
2. ____________________
3. ____________________
```
