# Game Balance Sheet Template

## What This Enables

This template provides a standardized structure for documenting and tracking game economy balance -- the mathematical relationships between resource sources, sinks, progression rates, and power curves. A completed balance sheet serves as the single source of truth for the game's economy, enabling designers to predict player progression speed, identify inflation risks, validate monetization pricing, and tune difficulty without breaking interconnected systems.

---

## Template

### Economy Overview

| Field | Value |
|-------|-------|
| **Game** | [Title] |
| **Economy Version** | [Version number] |
| **Last Updated** | [Date] |
| **Designer** | [Name] |
| **Assumptions** | [Sessions/day, session length, play skill level] |

---

### 1. Currency Definitions

| Currency | Type | Earn Rate (F2P) | Earn Rate (Payer) | Primary Source | Primary Sink | Inflation Risk |
|----------|------|-----------------|-------------------|---------------|-------------|---------------|
| [Gold/Coins] | Soft | [X per session] | [X per session] | [Level rewards, drops] | [Upgrades, shop items] | [Low/Med/High] |
| [Gems/Diamonds] | Hard (premium) | [X per week F2P] | [IAP] | [Achievements, rare drops, IAP] | [Speed-ups, premium items, gacha] | [Low] |
| [Energy/Stamina] | Gating | [Refills at X/hour] | [IAP refill] | [Time, level up, IAP] | [Playing levels/stages] | [N/A] |
| [XP] | Progression | [X per level] | [X per level + boosts] | [Combat, quests] | [Level up threshold] | [N/A] |

---

### 2. Resource Sources (Inflow)

| Source | Currency | Amount | Frequency | Daily Total (F2P) | Notes |
|--------|----------|--------|-----------|-------------------|-------|
| Level completion | Gold | [X-Y range] | Per level | [Z per day assuming N levels] | |
| Daily login bonus | Gold + Gems | [X gold, Y gems] | Daily | [X gold, Y gems] | Day 7 bonus = [special reward] |
| Daily quests | Gold + XP | [X gold, Y XP per quest] | 3 quests/day | [3X gold, 3Y XP] | |
| Achievement | Gems | [X-Y range] | One-time | [Amortized over lifetime] | |
| PvP rewards | Gold | [X per win] | Per match | [Z assuming N matches/day] | |
| Ad reward | Gold or Energy | [X gold or 1 energy] | Up to N/day | [NX gold or N energy] | |
| Guild rewards | Gold + Gems | [X gold, Y gems] | Weekly | [X/7 gold, Y/7 gems daily] | |
| **Total Daily Inflow (F2P)** | | | | **Gold: [Z], Gems: [W], XP: [V]** | |

---

### 3. Resource Sinks (Outflow)

| Sink | Currency | Cost | Frequency | Daily Total | Notes |
|------|----------|------|-----------|-------------|-------|
| Character upgrade (level N -> N+1) | Gold | [X * level] | Per upgrade | [Varies with progression] | Cost scales with level |
| Equipment craft | Gold | [X per tier] | Per craft | [Varies] | |
| Gacha pull (single) | Gems | [X gems] | Per pull | [Varies] | |
| Energy refill | Gems | [X gems] | Per refill | [0-2 refills/day typical] | |
| Shop consumables | Gold | [X-Y range] | Per purchase | [Varies] | |
| Guild contribution | Gold | [X per donation] | Daily cap | [X per day] | |
| **Total Daily Outflow (Optimal Play)** | | | | **Gold: [Z], Gems: [W]** | |

---

### 4. Economy Flow Balance

| Currency | Daily Inflow (F2P) | Daily Outflow (Optimal) | Net Daily | Surplus/Deficit | Adjustment Needed |
|----------|-------------------|------------------------|-----------|----------------|-------------------|
| Gold | [X] | [Y] | [X-Y] | [Surplus/Balanced/Deficit] | [If deficit > 10%: add sources or reduce sinks] |
| Gems | [X] | [Y] | [X-Y] | | |
| Energy | [X] | [Y] | [X-Y] | | |

**Target balance**: Slight surplus of soft currency (player feels wealthy), slight deficit of hard currency (creates purchase motivation without frustration).

---

### 5. Progression Rate Modeling

#### 5.1 Level Progression

| Player Level | XP Required | Cumulative XP | XP/Day (F2P) | Days to Reach | Days to Reach (Payer) |
|-------------|------------|--------------|-------------|--------------|---------------------|
| 1 | 0 | 0 | -- | 0 | 0 |
| 5 | [X] | [Sum] | [Daily XP] | [Days] | [Days] |
| 10 | [X] | [Sum] | [Daily XP] | [Days] | [Days] |
| 20 | [X] | [Sum] | [Daily XP] | [Days] | [Days] |
| 30 | [X] | [Sum] | [Daily XP] | [Days] | [Days] |
| Max ([N]) | [X] | [Sum] | [Daily XP] | [Days] | [Days] |

**Target**: F2P player reaches max level in [X] weeks. Payer reaches max level [Y]% faster.

#### 5.2 Power Curve

| Player Level | Attack Power | Health | Total Power | Power Growth Rate |
|-------------|-------------|--------|-------------|------------------|
| 1 | [X] | [X] | [X] | -- |
| 5 | [X] | [X] | [X] | [%/level] |
| 10 | [X] | [X] | [X] | [%/level] |
| 20 | [X] | [X] | [X] | [%/level] |
| Max | [X] | [X] | [X] | [%/level] |

**Power curve type**: [Linear / Logarithmic / Exponential / S-curve]
**Rationale**: [Why this curve shape was chosen]

---

### 6. Content Gating

| Content | Unlock Requirement | F2P Timeline | Payer Timeline | Design Intent |
|---------|-------------------|-------------|---------------|---------------|
| [World 2] | Player Level 5 | Day 2-3 | Day 1-2 | [Prevent rushing, ensure basic skill mastery] |
| [PvP Arena] | Player Level 10 | Day 5-7 | Day 3-5 | [Ensure fair competition] |
| [Guild] | Player Level 8 | Day 4-6 | Day 2-4 | [Player has context for social features] |
| [Hard Mode] | Complete Normal | Day 14-21 | Day 10-14 | [Endgame content for dedicated players] |

---

### 7. Monetization Pricing Validation

| IAP Product | Real Price | Premium Currency | Equivalent Play Time (F2P) | Value Perception |
|-------------|-----------|-----------------|---------------------------|-----------------|
| [100 Gems] | $0.99 | 100 gems | [X days of F2P gem earning] | [Fair/Premium/Whale] |
| [500 Gems] | $4.99 | 500 gems | [X days] | |
| [1200 Gems] | $9.99 | 1200 gems | [X days] | |
| [Starter Pack] | $2.99 | [Contents] | [X days equivalent] | [Should feel like amazing value] |
| [Battle Pass] | $4.99 | [Total contents] | [X days equivalent] | [5-10x value vs. direct purchase] |

**Pricing validation rule**: The best IAP should offer 3-5x better value per dollar than the worst IAP, rewarding larger purchases.

---

### 8. Balance Testing Checklist

| Check | Status | Notes |
|-------|--------|-------|
| [ ] F2P player can complete all content (eventually) | | |
| [ ] Payer advantage is acceleration, not exclusive content | | |
| [ ] No currency inflation over 90-day simulation | | |
| [ ] Progression pacing feels rewarding, not grindy (playtest feedback) | | |
| [ ] Difficulty scales appropriately with power curve | | |
| [ ] Economy bottleneck is hard currency (as intended), not soft currency | | |
| [ ] Gacha/random rates match published probabilities | | |
| [ ] Energy system allows [X] minutes of daily play without spending | | |
| [ ] PvP matchmaking accounts for power differences | | |
| [ ] Late-game players have meaningful sinks to prevent hoarding | | |

---

### 9. Simulation Results

| Scenario | Day 7 | Day 30 | Day 90 | Notes |
|----------|-------|--------|--------|-------|
| F2P (casual, 1 session/day) | Level [X], Gold [Y] | Level [X], Gold [Y] | Level [X], Gold [Y] | |
| F2P (engaged, 3 sessions/day) | Level [X], Gold [Y] | Level [X], Gold [Y] | Level [X], Gold [Y] | |
| Minnow ($5/month) | Level [X], Gold [Y] | Level [X], Gold [Y] | Level [X], Gold [Y] | |
| Dolphin ($20/month) | Level [X], Gold [Y] | Level [X], Gold [Y] | Level [X], Gold [Y] | |
| Whale ($100/month) | Level [X], Gold [Y] | Level [X], Gold [Y] | Level [X], Gold [Y] | |

---

### 10. Change Log

| Date | Change | Rationale | Impact |
|------|--------|-----------|--------|
| [Date] | [What changed] | [Why] | [Expected impact on economy] |

---

## Usage Notes

- Run economy simulations before implementing changes in the live game
- Update the balance sheet whenever the economy is tuned, not just at major milestones
- Playtest results override spreadsheet models -- if the math says "balanced" but players say "grindy," the players are right
- Track actual vs. modeled progression weekly in live games to detect simulation drift
- The change log is critical for understanding why past decisions were made
