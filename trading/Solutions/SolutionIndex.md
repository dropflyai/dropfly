# SOLUTION INDEX
**Proven Trading Strategies and Setups**

---

## Purpose

This index catalogs all proven, repeatable trading strategies.

Solutions are patterns that have demonstrated profitability.

---

## How to Use This Index

Before generating a signal:
1. Check if similar setup exists in this index
2. Follow documented entry/exit criteria
3. Apply proven filter thresholds
4. Log performance for validation

---

## Indexed Solutions

### S001: Scalping Oversold RSI Bounces
- **File:** Recipes/ScalpOversoldRSI.md (to be created)
- **Win Rate:** TBD (needs backtesting)
- **Setup:** RSI 30-40 + 3%+ momentum + high volume
- **Mode:** SCALP
- **Filters:** Volume 1000+, Delta 0.40-0.70, Spread <$0.10

### S002: Momentum Breakouts with MACD Confirmation
- **File:** Recipes/MomentumBreakout.md (to be created)
- **Win Rate:** TBD (needs backtesting)
- **Setup:** 3%+ 15min momentum + MACD bullish + volume spike
- **Mode:** MOMENTUM
- **Filters:** Volume 3x avg, MACD alignment, breakout level identified

### S003: Unusual Options Activity (Smart Money Following)
- **File:** Recipes/UOAFollow.md (to be created)
- **Win Rate:** TBD (needs backtesting)
- **Setup:** 5x+ volume + 100+ contract blocks + $1M+ premium flow
- **Mode:** VOLUME_SPIKE
- **Filters:** Institutional block trades, premium flow direction

### S004: Morning Momentum (9:30-10:30 AM ET)
- **File:** Recipes/MorningMomentum.md (to be created)
- **Win Rate:** Research shows 60% of daily range in first 90 min
- **Setup:** Trade during 9:30-11:00 AM ET window
- **Mode:** SCALP or MOMENTUM
- **Filters:** Time-of-day filter mandatory

### S005: Power Hour (3:00-4:00 PM ET)
- **File:** Recipes/PowerHour.md (to be created)
- **Win Rate:** TBD (needs backtesting)
- **Setup:** Trade during 3:00-4:00 PM ET window
- **Mode:** SCALP or MOMENTUM
- **Filters:** Time-of-day filter mandatory

---

## Golden Paths (Mandatory Execution)

### GP001: Production Filter Thresholds
- **Authority:** trading/Solutions/Regressions.md (Study Mode failure)
- **Rule:** Production filters must NEVER revert to study mode values
- **Enforcement:** Pre-trade checklist verification
- **Thresholds:**
  - Volume: 1000+ contracts
  - Delta: 0.40-0.70
  - Max price: $10
  - Momentum: 3%+
  - Spread: <$0.10 (scalp), <10% (momentum)

### GP002: Najarians 50% Profit-Taking
- **Authority:** Top traders research (72.7% win rate with disciplined exits)
- **Rule:** Always take 50% profit at 2x entry (100% gain)
- **Enforcement:** Position tracker automated
- **Benefit:** Locks in guaranteed profits while letting winners run

### GP003: Time-of-Day Filtering
- **Authority:** Market research (60% of daily range in first 90 min)
- **Rule:** SCALP mode ONLY during 9:30-11AM or 3-4PM ET
- **Enforcement:** TimeOfDayFilter.is_high_edge_window() gate
- **Benefit:** Higher win rate during institutional activity windows

---

## Anti-Patterns (Forbidden)

See: trading/AntiPatterns/ (to be created)

- AP001: Trading during lunch hour (11AM-2PM ET) - low volume, choppy
- AP002: Widening filters to force signals - false signals, losses
- AP003: Ignoring spread (accepting >10% spreads) - slippage kills edge
- AP004: Holding overnight - theta decay + gap risk
- AP005: Revenge trading after loss - emotional, undisciplined

---

## Performance Tracking

Each solution should track:
- Win rate (%)
- Profit factor (gross profit / gross loss)
- Average R:R achieved
- Max drawdown
- Sample size (number of trades)

**Minimum sample size for validation: 30 trades**

---

## Adding New Solutions

To add a solution:
1. Document setup in Recipes/ folder
2. Backtest with minimum 30 historical instances
3. Validate win rate >= 60%
4. Add entry to this index
5. If win rate < 60%, log as Anti-Pattern instead

---

## Review Schedule

- Weekly: Review active solutions for performance degradation
- Monthly: Backtest top 3 solutions for continued edge
- Quarterly: Audit entire index, remove broken patterns

---

**Solutions are living documents - update with new data.**
