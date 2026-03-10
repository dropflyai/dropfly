# Monetization Pattern

## Problem

Game monetization must generate sufficient revenue to sustain development while preserving player trust and engagement. Games that monetize too aggressively churn their player base (reducing future revenue); games that monetize too passively leave revenue unrealized (threatening development sustainability). The challenge is designing an ethical monetization system where spending feels like an enhancement rather than a requirement, and where non-paying players still have a complete experience.

## Context

This pattern applies to:
- Free-to-play games on mobile, PC, or console
- Premium games with optional DLC or microtransactions
- Games with battle pass or subscription models
- Any game where ongoing revenue funds live operations

This pattern requires:
- A functioning core loop that players enjoy (monetization cannot fix a bad game)
- Established player segments (new, casual, engaged, competitive, whale)
- Analytics infrastructure to measure monetization funnels
- Commitment to the Game Design Brain's ethical engagement pillar

## Solution

### The Ethical Monetization Framework

```
Principle 1: Non-payers must have a complete experience
├── All core content is accessible without payment
├── Progression is achievable through play (spending accelerates, not gates)
├── No "pay-to-win" in competitive contexts
└── Paying players get convenience, cosmetics, or acceleration -- not exclusive power

Principle 2: Every purchase must deliver clear, immediate value
├── Player understands exactly what they are getting before purchase
├── No randomized purchases of unknown value (ethical loot boxes require disclosure)
├── Purchased items deliver immediate satisfaction (not delayed gratification)
└── No "buyer's remorse" -- refund policy is fair and accessible

Principle 3: Spending is a choice, not a pressure
├── Game does not create artificial frustration to force spending
├── No "dark patterns" (hidden costs, misleading countdown timers, guilt-based prompts)
├── Spending limits and cooling-off periods for large purchases
└── Total spending transparency available to every player
```

### Monetization Models

| Model | Revenue Source | Player Perception | Best For |
|-------|--------------|-------------------|----------|
| **Cosmetic IAP** | Skins, emotes, decorations | Very positive (no gameplay advantage) | Competitive games, social games |
| **Battle Pass** | Seasonal content track ($5-15/season) | Positive (clear value, predictable cost) | Games with regular content updates |
| **Gacha/Summoning** | Random character/item acquisition | Mixed (gambling adjacent -- regulated in some jurisdictions) | Collection-focused games |
| **Energy/Stamina** | Refill energy to continue playing | Negative (feels like a paywall) | Casual mobile, use with caution |
| **VIP/Subscription** | Monthly benefit package ($5-15/month) | Positive (predictable, good value) | Games with daily engagement loop |
| **Expansion DLC** | Large content packs ($10-40) | Positive (traditional value exchange) | Premium games, narrative games |
| **Rewarded Ads** | Watch ad for in-game reward | Neutral-positive (player controls exchange) | Casual games, non-paying audience |
| **Ad Removal** | One-time purchase to remove ads | Very positive (clear, permanent value) | Ad-supported games |

### The Starter Pack (First Purchase Optimization)

The starter pack is the most important monetization design in F2P:

| Element | Design Guideline |
|---------|-----------------|
| Price | $0.99-4.99 (low barrier to first purchase) |
| Value | 5-10x the value of equivalent regular purchase |
| Contents | Mix of premium currency, useful items, cosmetic |
| Availability | One-time purchase, available after first "aha moment" |
| Visibility | Shown when player naturally needs the resources it contains |
| Urgency | Limited time (3-7 days after install) -- but ethically, not with manipulative pressure |

### Battle Pass Design

| Element | Specification |
|---------|--------------|
| Duration | 4-8 weeks per season |
| Free track | 30-40% of total rewards (enough to feel generous) |
| Premium track | 60-70% of total rewards ($5-15 to unlock) |
| Completion pacing | Achievable with ~1 hour of daily play over the season |
| Reward cadence | Reward every 2-3 tiers; high-value rewards at milestones |
| Premium currency return | Include enough premium currency in premium track to buy next season's pass |
| FOMO mitigation | Allow "catch-up" progress and do not expire unclaimed rewards immediately |

### Price Point Strategy

| Price Tier | Content Type | Purchase Frequency |
|-----------|-------------|-------------------|
| $0.99-1.99 | Starter pack, small boosts, ad removal | Once (low barrier first purchase) |
| $4.99-9.99 | Battle pass, monthly subscription, medium packs | Monthly |
| $9.99-19.99 | Large currency packs, expansion packs | Occasional |
| $19.99-49.99 | Premium bundles, collector editions | Rare |
| $49.99-99.99 | Whale-tier bundles (must provide genuine value) | Very rare |

### Shop UX Principles

1. **Contextual offers**: Show relevant items when the player naturally needs them (out of inventory space? offer expansion)
2. **Clear value communication**: Show exactly what the player gets, in terms they understand
3. **No dark patterns**: No fake countdown timers, no fake "limited stock," no hidden costs
4. **Easy exit**: Player can close any offer screen with a single tap, no confirmation dialogs
5. **Spending history**: Player can view their total spending easily
6. **Gift-giving**: Allow players to gift purchases to friends (social monetization)

## Metrics

| Metric | Target | Measures |
|--------|--------|---------|
| Conversion rate (first purchase) | 2-5% | Monetization breadth |
| ARPPU | $5-30/month | Spending depth |
| ARPDAU | $0.05-0.50 | Overall monetization efficiency |
| Battle pass purchase rate | 10-20% of MAU | Pass value perception |
| Refund rate | < 2% | Purchase satisfaction |
| Payer retention vs. non-payer retention | Payer > non-payer | Spending enhances experience |
| Revenue concentration | Top 10% < 50% of revenue | Healthy distribution |

## Consequences

**Benefits:**
- Ethical monetization builds long-term player trust and community health
- Diverse revenue sources reduce dependence on any single player segment
- Battle pass model creates predictable, recurring revenue
- Cosmetic-focused monetization avoids pay-to-win community backlash

**Trade-offs:**
- Ethical constraints limit peak revenue compared to aggressive monetization
- Cosmetic-only monetization requires strong visual design investment
- Battle pass fatigue: players may burn out on seasonal passes across multiple games
- Rewarded ads generate lower revenue per user than IAP

## Related Patterns

- **Game Loop Pattern**: Monetization opportunities should align with natural loop transitions
- **Onboarding Pattern**: First purchase offer timing is part of onboarding design
