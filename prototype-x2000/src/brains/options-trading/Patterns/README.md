# Patterns Directory -- Options Trading Brain

Repeatable trading patterns that codify the full lifecycle of common trade types. Each pattern defines the setup, entry, management, and exit for a specific trading scenario.

---

## Pattern Index

| Pattern | File | Use Case |
|---------|------|----------|
| Volatility Trade | `volatility_trade_pattern.md` | Trading implied vs. realized volatility |
| Earnings Trade | `earnings_trade_pattern.md` | Trading around earnings announcements |
| Portfolio Hedge | `portfolio_hedge_pattern.md` | Hedging portfolio risk for events or drawdowns |

---

## How to Use Patterns

1. **Identify the situation:** Match your current opportunity to a pattern
2. **Follow the checklist:** Each pattern has a step-by-step workflow
3. **Customize parameters:** Adjust strikes, expiry, and sizing to your specific situation
4. **Log the trade:** Use Templates/trade_plan_template.md for documentation
5. **Review the outcome:** Use eval/ReviewChecklist.md for post-trade analysis

---

## Pattern Structure

Each pattern follows this format:

1. **Setup Conditions** -- What must be true before entering
2. **Entry Rules** -- How to initiate the trade
3. **Position Management** -- How to monitor and adjust
4. **Exit Rules** -- When and how to close
5. **Risk Controls** -- Maximum loss, sizing, and escalation
6. **Historical Performance** -- Expected win rate and risk/reward

---

## Cross-References

| Pattern | Theory Files | Strategy Files |
|---------|-------------|---------------|
| Volatility Trade | theory/volatility.md, theory/greeks.md | strategies/volatility.md |
| Earnings Trade | theory/volatility.md, theory/behavioral_finance.md | strategies/income.md, strategies/directional.md |
| Portfolio Hedge | theory/risk_management.md, theory/portfolio_theory.md | strategies/advanced.md |
