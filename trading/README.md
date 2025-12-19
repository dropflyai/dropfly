# TRADING BRAIN
**Authoritative Operating System for Trading Decisions**

---

## What This Is

This folder is a **Trading Operating System**.

It defines:
- how trading signals are identified
- how entry/exit decisions are made
- which indicators are mandatory
- how signals are verified before deployment
- how trading failures are logged and prevented
- how performance compounds over time

This is not documentation.
This is **governance**.

If you are generating trading signals, this system applies.

---

## Authority Hierarchy (Highest → Lowest)

1. **Constitution.md** — Trading law
2. **Modes.md** — Trading context (scalp/swing/momentum)
3. **Checklist.md** — Pre-trade execution gate
4. **ToolAuthority.md** — Mandatory indicators and data sources
5. **OutputContracts.md** — Signal structure requirements
6. **Solutions/SolutionIndex.md** — Proven strategies
7. **Solutions/ToolAuthority.md** — Indicator hierarchy
8. **Solutions/Regressions.md** — Failure memory
9. **Patterns/** — Repeatable setups
10. **Automations/** — Executable strategies

Lower levels may not contradict higher levels.

---

## Required Workflow (Every Signal)

Every trading signal MUST follow this order:

1. Declare Trading Mode (Scalp/Momentum/Volume Spike)
2. Run the **Pre-Trade Checklist**
3. Consult **SolutionIndex** for proven strategies
4. Apply mandatory filters (ToolAuthority)
5. Verify signal meets OutputContract
6. Check for similar failures in Regressions
7. Generate signal with evidence
8. Log performance for learning

Skipping steps is a violation.

---

## How to Generate a Signal

Before generating a signal, you must be able to answer:

- What mode am I in? (Scalp/Momentum/Volume)
- What filters are mandatory for this mode?
- What is the entry price, target, stop loss?
- How will I verify this setup is valid?
- What is the confidence score and why?
- What is the risk/reward ratio?

If you cannot answer these, do not generate the signal.

---

## How This System Gets Smarter

The system improves through:
- Strategies (repeatable setups)
- Golden Paths (mandatory indicator combinations)
- Regressions (failure memory - losing trades logged)
- Performance tracking (win rate, profit factor)

If a setup repeats and wins, it becomes a Golden Path.
If a setup repeats and loses, it becomes a logged Regression.

---

## Risk Management Doctrine

- Never risk more than 2% of account per trade
- Stop trading at 3% daily drawdown
- Maximum 3 concurrent positions
- Time-of-day filtering is mandatory (9:30-11AM ET, 3-4PM ET)
- No overnight positions (max hold 2 hours)

"I can't quantify the risk" is not an acceptable entry.

---

## Automation First

- Prefer algorithmic signal generation over manual picks
- Repair broken filters (don't disable them)
- Never silently fall back to wider filters
- Document why filters are set at specific thresholds

"Study mode" is not an acceptable production state.

---

## Enforcement

This system is binding.

Violations must be corrected before signals are generated.

Repeated filter violations must be logged as regressions.

---

## Final Principle

> **Trading performance is measured by win rate and profit factor over time.**

Accuracy, risk management, and repeatability matter more than occasional big wins.

---

**If you are here, you are expected to trade at an institutional level.**
