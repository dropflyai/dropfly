# TRADING CONSTITUTION
**Immutable Trading Laws**

---

## Article I: Risk Management

### Section 1: Position Sizing
1. No single position shall exceed 2% of account value
2. No more than 3 concurrent positions at any time
3. Daily drawdown limit: 3% of account value

### Section 2: Time Limits
1. No position shall be held overnight (intraday only)
2. Maximum hold time: 2 hours
3. Options with <7 days to expiration are forbidden (theta decay risk)

### Section 3: Circuit Breakers
1. Trading halts immediately upon reaching 3% daily loss
2. Trading halts if 3 positions are active
3. Trading halts if market status is not OPEN

---

## Article II: Filter Authority

### Section 1: Production Filters
1. Production filter thresholds are binding
2. "Study mode" filters are forbidden in production
3. Filter changes require Trading Brain governance update

### Section 2: Mandatory Filters (Per Mode)
1. **SCALP:** Volume >= 1000, Delta 0.40-0.70, Spread < $0.10, Momentum >= 3%, RSI 30-40 or 60-70
2. **MOMENTUM:** Momentum >= 3%, Volume 3x avg, MACD alignment required
3. **VOLUME_SPIKE:** Volume 5x avg, Blocks 100+ contracts (3+ required), Premium flow >= $1M

### Section 3: Filter Bypass
1. Filters may not be widened to force signals
2. Filter bypass requires explicit documentation
3. Bypasses must be logged as regressions
4. Temporary bypasses must have restoration timeline

---

## Article III: Indicator Authority

### Section 1: Mandatory Indicators
1. RSI (14-period) — mandatory for SCALP mode
2. MACD (12, 26, 9) — mandatory for MOMENTUM mode
3. Momentum calculation — mandatory for ALL modes
4. Volume ratio — mandatory for ALL modes

### Section 2: Calculation Authority
1. Indicators must be calculated, never assumed
2. Vague descriptions ("looks oversold") are forbidden
3. Numeric evidence is mandatory in signal justification

---

## Article IV: Time-of-Day Authority

### Section 1: High-Edge Windows
1. SCALP mode may only trade 9:30-11:00 AM ET or 3:00-4:00 PM ET
2. MOMENTUM mode preferably trades in high-edge windows (warning if outside)
3. Market status must be OPEN (verified via API)

### Section 2: Forbidden Times
1. Pre-market trading is forbidden
2. After-hours trading is forbidden
3. Trading during market halts is forbidden

---

## Article V: Data Freshness

### Section 1: Staleness Limits
1. Price data >60 seconds old is invalid
2. Option chain data >5 minutes old is invalid
3. Stale data must be rejected, not used

### Section 2: Data Source Authority
1. Primary: Massive Options API
2. Fallback: yfinance (when Massive fails)
3. Manual chart reading is forbidden

---

## Article VI: Signal Quality

### Section 1: Output Contract Compliance
1. All signals must include ALL mandatory fields (OutputContracts.md)
2. Incomplete signals are invalid
3. Vague justifications are forbidden

### Section 2: Risk/Reward Minimum
1. All signals must have risk/reward ratio >= 2:1
2. Signals with R/R < 2:1 are invalid
3. No exceptions

### Section 3: Confidence Bounds
1. Minimum confidence: 0.70
2. Maximum confidence: 0.95
3. Confidence must be calculated, not guessed

---

## Article VII: Profit-Taking

### Section 1: Najarians 50% Rule
1. Sell 50% of position when price reaches 2x entry (100% gain)
2. Let remaining 50% run with trailing stop
3. Rule applies to ALL profitable positions

### Section 2: Trailing Stops
1. Trailing stop: 25% below highest price since entry
2. Stop never lowers, only raises
3. Protects profits as position moves favorable

---

## Article VIII: Failure Memory

### Section 1: Regression Logging
1. All trading failures must be logged in Solutions/Regressions.md
2. Recurring regressions are system violations
3. Regression patterns must inform future trades

### Section 2: Learning Requirement
1. Winning setups become documented Patterns
2. Losing setups become logged Regressions
3. Neutral setups are analyzed for improvement

---

## Article IX: Governance Enforcement

### Section 1: Violation Handling
1. Violations must be corrected before signal generation continues
2. Repeated violations escalate to Constitution amendments
3. System corruption (repeated same violation) halts signal generation

### Section 2: Trading Brain Authority
1. Trading Brain governance overrides convenience
2. Shortcuts that violate Trading Brain are forbidden
3. Emergency bypasses require documentation and restoration timeline

---

## Article X: Amendment Process

### Section 1: Amendment Criteria
1. New rules must be evidence-based (data-driven)
2. Amendments require analysis of win rate impact
3. Amendments must not weaken existing protections without justification

### Section 2: Emergency Amendments
1. Allowed during HOTFIX situations
2. Require post-incident review
3. Temporary amendments must have sunset date

---

## Final Principle

> **Capital preservation comes before profit maximization.**

Risk management, filter discipline, and systematic learning matter more than occasional big wins.

---

**This Constitution is binding and immutable except through formal amendment.**
