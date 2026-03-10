# Game Loop Pattern

## Problem

Games without well-defined loop structures feel aimless -- players do not know what to do next, do not feel a sense of progress, and disengage within minutes. Conversely, games with a single loop become repetitive, and players exhaust the content before developing the long-term investment needed for retention. The challenge is designing a hierarchy of interlocking loops that provide immediate satisfaction (core loop), medium-term progression (meta loop), and long-term investment (social/endgame loop).

## Context

This pattern applies to:
- Any game intended for retention beyond a single session
- Free-to-play games where retention directly determines revenue
- Games targeting mid-core or core audiences (less applicable to hyper-casual)
- Mobile, PC, and console games across most genres

This pattern requires:
- A well-defined core mechanic (the fundamental verb the player performs)
- A progression system (something that grows over time)
- Sufficient content to sustain loops beyond the first week

## Solution

### The Three-Loop Architecture

```
┌─────────────────────────────────────────────────┐
│                  SOCIAL/ENDGAME LOOP             │
│          (weeks to months per cycle)             │
│  ┌─────────────────────────────────────────┐    │
│  │            META LOOP                     │    │
│  │       (hours to days per cycle)          │    │
│  │  ┌─────────────────────────────────┐    │    │
│  │  │          CORE LOOP              │    │    │
│  │  │    (seconds to minutes          │    │    │
│  │  │       per cycle)                │    │    │
│  │  │                                 │    │    │
│  │  │  Action → Challenge → Reward    │    │    │
│  │  │     ↑                    │      │    │    │
│  │  │     └────────────────────┘      │    │    │
│  │  └─────────────────────────────────┘    │    │
│  │  Progress → Upgrade → Unlock → New Goal │    │
│  │     ↑                            │      │    │
│  │     └────────────────────────────┘      │    │
│  └─────────────────────────────────────────┘    │
│  Community → Contribute → Status → New Role     │
│     ↑                                  │        │
│     └──────────────────────────────────┘        │
└─────────────────────────────────────────────────┘
```

### Core Loop Design

The core loop is the fundamental gameplay cycle that repeats every few seconds to minutes. It must be intrinsically satisfying -- the player should enjoy the core loop even without progression rewards.

**Core loop structure**: Action -> Challenge -> Feedback -> Reward -> Action

| Element | Description | Design Requirements |
|---------|------------|-------------------|
| Action | The primary verb (tap, swipe, shoot, build, match) | Must feel good (game feel, juice, responsiveness) |
| Challenge | Obstacle that requires skill or decision | Must match player skill (flow state) |
| Feedback | Immediate response to player action | Must be clear, visceral, satisfying (visual + audio) |
| Reward | Meaningful outcome (progress, resource, satisfaction) | Must vary to avoid habituation (variable reward schedule) |

**Core loop examples by genre:**

| Genre | Action | Challenge | Reward |
|-------|--------|-----------|--------|
| Match-3 | Swap gems | Clear the board in N moves | Stars, score, level progression |
| Battle Royale | Move, shoot, loot | Survive against other players | Placement, kills, loot |
| Idle RPG | Deploy heroes, upgrade | Defeat waves of enemies | Gold, experience, gear drops |
| City Builder | Place buildings, manage resources | Optimize production, meet goals | City growth, citizen happiness |
| Roguelike | Navigate rooms, fight enemies | Survive a run with random items | New unlocks, meta-progression |

### Meta Loop Design

The meta loop provides medium-term goals that give meaning to core loop repetitions. Each meta loop cycle encompasses many core loop cycles.

**Meta loop structure**: Set Goal -> Accumulate Resources -> Make Strategic Decision -> Achieve Milestone -> New Goal

| Component | Purpose | Duration |
|-----------|---------|----------|
| Goal setting | Give the player something to work toward | Set at session start |
| Resource accumulation | Core loop produces resources that feed the meta loop | Multiple sessions |
| Strategic decisions | Player chooses how to invest resources (which upgrade, which hero, which building) | Decision points throughout |
| Milestone achievement | Satisfying moment of progress (level up, tier reached, zone unlocked) | Every 1-3 sessions |
| New goal revelation | Achieving one goal reveals the next, maintaining forward momentum | Immediately after milestone |

### Social/Endgame Loop

The social loop provides long-term investment that transcends individual progression:

| Element | Mechanism | Retention Impact |
|---------|-----------|-----------------|
| Community identity | Guilds/clans with shared identity and goals | Players stay for social bonds |
| Collaborative goals | Raid bosses, guild events, team challenges | Creates mutual accountability |
| Status and recognition | Leaderboards, titles, cosmetic prestige | Social motivation for continued play |
| Teaching/mentoring | Experienced players help newcomers | Deepens investment, strengthens community |
| Competitive seasons | Regular resets with ranked progression | Creates recurring engagement cycles |

### Loop Interconnection Principles

1. **Core loop feeds meta loop**: Resources from the core loop are the currency of the meta loop
2. **Meta loop enhances core loop**: Meta loop upgrades make the core loop feel better (stronger abilities, new options)
3. **Social loop amplifies both**: Social context makes core loop more meaningful (cooperative play) and meta loop more motivated (competition, helping guildmates)
4. **No loop is fully independent**: Isolated loops feel disconnected; interconnected loops create a cohesive experience

### Loop Pacing Guidelines

| Game Phase | Primary Loop | Session Duration | Sessions/Day |
|-----------|-------------|-----------------|-------------|
| First session | Core loop only | 5-15 minutes | 1 |
| Day 1-3 | Core + early meta | 10-20 minutes | 1-2 |
| Day 3-7 | Core + meta | 15-30 minutes | 2-3 |
| Week 2-4 | Core + meta + social introduction | 15-30 minutes | 2-4 |
| Month 2+ | All three loops active | 15-40 minutes | 2-4 |

## Metrics

| Metric | Measures | Target |
|--------|---------|--------|
| Core loop completion rate | % of players who complete first core loop | > 90% |
| Session length trend | Are sessions getting longer as meta loop engages? | Increasing D1-D7 |
| Meta loop engagement | % of D7 players engaging with meta systems | > 70% |
| Social feature adoption | % of D14 players in a guild/clan | > 30% |
| DAU/MAU ratio | Loop stickiness | > 20% |
| D1/D7/D30 retention | Loop quality at each time horizon | Genre benchmarks |

## Consequences

**Benefits:**
- Provides immediate, medium-term, and long-term engagement in a unified system
- Natural content pacing prevents overwhelming new players while retaining veterans
- Social loop creates switching costs and community investment
- Modular design allows tuning each loop independently

**Trade-offs:**
- Three-loop systems are complex to design and balance simultaneously
- Players who do not engage with the meta or social loop may feel the game is shallow
- Poor loop interconnection creates a disjointed experience
- Loop pacing that is too slow loses impatient players; too fast burns through content

## Related Patterns

- **Monetization Pattern**: Monetization opportunities should align with loop pain points
- **Onboarding Pattern**: Onboarding must introduce loops in the correct sequence
