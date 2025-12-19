# TRADING CHECKLIST
**Pre-Trade Execution Gate**

---

## Purpose

This checklist is mandatory before ANY signal is generated.

Skipping items is a governance violation.

---

## PRE-TRADE CHECKLIST (Mandatory)

### 1. Mode Declaration
- [ ] Trading Mode explicitly declared (SCALP / MOMENTUM / VOLUME_SPIKE)
- [ ] Mode requirements documented and understood

### 2. Market Conditions
- [ ] Market is OPEN (verified via /api/market/status)
- [ ] Current time is within allowed trading window:
  - [ ] 9:30-11:00 AM ET (morning momentum), OR
  - [ ] 3:00-4:00 PM ET (power hour)
- [ ] Not in pre-market or after-hours (unless mode allows)

### 3. Filter Verification
- [ ] All mandatory filters for selected mode are applied:
  - [ ] Volume threshold met
  - [ ] Delta range validated
  - [ ] Spread acceptable
  - [ ] Price within limits
  - [ ] Momentum requirements satisfied
- [ ] No filters disabled or widened from production values
- [ ] Filter bypass justification documented (if any)

### 4. Indicator Confirmation
- [ ] All mandatory indicators calculated:
  - [ ] RSI (if SCALP mode)
  - [ ] MACD (if MOMENTUM mode)
  - [ ] Volume ratio (if VOLUME_SPIKE mode)
- [ ] Indicators align with trade direction
- [ ] No conflicting signals from mandatory indicators

### 5. Risk Calculation
- [ ] Entry price identified
- [ ] Target price calculated
- [ ] Stop loss price set
- [ ] Risk/reward ratio >= 2:1
- [ ] Position size calculated (respects 2% account risk rule)
- [ ] Confidence score assigned (0.70-0.95 range)

### 6. Data Freshness
- [ ] Price data < 60 seconds old
- [ ] Option chain data < 5 minutes old
- [ ] No stale data used in signal generation
- [ ] Data source identified (Massive API, yfinance)

### 7. Regression Check
- [ ] Consulted Solutions/Regressions.md
- [ ] No similar failed setups in past 30 days
- [ ] No recurring pattern of losses for this symbol
- [ ] If similar failure exists, documented why this time is different

### 8. Circuit Breaker Check
- [ ] Daily P&L < 3% loss (not in drawdown limit)
- [ ] Active positions < 3 (not at max concurrent)
- [ ] No system-wide trading halt active

---

## SIGNAL GENERATION CHECKLIST

### 9. Output Contract Compliance
- [ ] Signal includes all mandatory fields (see OutputContracts.md):
  - [ ] action (BUY_CALL / BUY_PUT / FOLLOW_FLOW)
  - [ ] contract details (symbol, strike, expiration, greeks)
  - [ ] entry price
  - [ ] target price
  - [ ] stop loss
  - [ ] confidence score
  - [ ] reason (human-readable justification)
  - [ ] timestamp (authoritative, not assumed)

### 10. Evidence Collection
- [ ] Signal reason includes specific numeric evidence:
  - [ ] Momentum percentage
  - [ ] RSI value
  - [ ] Volume vs average
  - [ ] MACD values (if applicable)
- [ ] No vague justifications ("looks good", "strong setup")

### 11. Quality Gates
- [ ] ImprovedFilters.apply_all_filters() passed
- [ ] No filter bypasses without documentation
- [ ] Spread confirms institutional liquidity
- [ ] Greeks calculated and reasonable

---

## POST-GENERATION CHECKLIST

### 12. Logging
- [ ] Signal logged to database with full context
- [ ] Timestamp captured (not assumed)
- [ ] Mode and filters logged for backtest analysis

### 13. Monitoring Setup
- [ ] Position added to tracker
- [ ] Exit signals configured (stop, target, time-based)
- [ ] Partial profit rule activated (50% at 2x)
- [ ] Trailing stop initialized

---

## EMERGENCY BYPASS (Requires Explicit Approval)

If bypassing checklist items:
- [ ] Document which items are bypassed
- [ ] Provide justification (e.g., HOTFIX for broken filters)
- [ ] Log as Incident in Solutions/Regressions.md
- [ ] Set restoration timeline
- [ ] Do NOT make bypass permanent

---

## Enforcement

- Checklist must be completed before signal generation
- Failed checklist items = signal is NOT generated
- No "I'll fix it later" - fix it now or don't generate the signal

---

**This checklist is binding.**
