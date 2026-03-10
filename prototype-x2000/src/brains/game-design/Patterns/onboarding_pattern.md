# Onboarding Pattern

## Problem

Games lose 20-60% of new players during the first session because the First Time User Experience (FTUE) fails to communicate what the game is, why it is fun, and how to play it. Traditional tutorial approaches (wall-of-text instructions, forced scripted sequences, unskippable hand-holding) are the primary cause: they teach mechanics through instruction rather than through play, removing the very thing that makes games engaging -- player agency. The result is that players quit before ever experiencing what makes the game worth playing.

## Context

This pattern applies to:
- Any game more complex than a single-tap hyper-casual game
- Games where the core loop is not immediately self-evident
- Games with progression systems, economies, or social features that require explanation
- Games targeting audiences beyond hardcore gamers (who tolerate more complexity)

This pattern is most critical for:
- Free-to-play mobile games (users have near-zero switching cost)
- Games in competitive markets where first impressions determine retention
- Games with complex systems that must be introduced gradually

## Solution

### The Onboarding Funnel

```
Install → First Open → Tutorial Start → Tutorial Complete → First Session Complete → D1 Return
 100%       85-95%        75-90%           60-80%              50-70%              35-45%

Each transition is a design problem:
├── Install → First Open: App store assets, load time, permissions
├── First Open → Tutorial Start: First screen appeal, time to first interaction
├── Tutorial Start → Complete: Tutorial quality (this pattern's primary focus)
├── Tutorial → Session Complete: Post-tutorial engagement, first goals
└── Session Complete → D1 Return: Session-end hook, notification strategy
```

### The "Learn by Playing" Principle

The single most important onboarding principle, validated by Nintendo's design philosophy and echoed by Raph Koster (*A Theory of Fun*, 2004): **players should learn by doing, not by reading**.

| Anti-Pattern | Better Pattern |
|-------------|----------------|
| Text box: "Tap the attack button to attack" | Spawn an enemy in front of the player. The only available button is "Attack." |
| Text box: "Collect coins to upgrade your heroes" | Drop coins from defeated enemies. Show a sparkle on the upgrade button when player has enough. |
| Text box: "Join a guild for bonuses" | After first major achievement, show a message: "Guilds can help you go further. [Join Now]" |
| Forced 10-minute tutorial before gameplay | Let the player play immediately. Introduce concepts one at a time over the first 3-5 sessions. |

### Progressive Disclosure Framework

Introduce game systems in order of importance and complexity, spread across multiple sessions:

| Session | Introduce | Do NOT Introduce |
|---------|-----------|-----------------|
| 1 (0-5 min) | Core mechanic (the primary verb) | Economy, social, metagame |
| 1 (5-10 min) | First reward, first progression element | Complex upgrade systems |
| 2 | Secondary mechanic, basic economy (earn currency) | Spending, IAP, premium currency |
| 3-4 | Upgrade/progression system, daily rewards | Guild, PvP, advanced features |
| 5-7 | Social features (friends, guild) | Competitive ranking |
| 7-14 | Advanced features, competitive modes | Endgame systems |
| 14+ | Endgame, seasonal content, meta-competitive | |

### First Session Architecture

The first session has three acts:

**Act 1: Hook (0-2 minutes)**
- Immediate gameplay (no cutscene, no text wall)
- Showcase the game's best moment (a taste of what the game becomes)
- Visual and audio spectacle to create emotional engagement
- Player performs the core action within 30 seconds of opening

**Act 2: Teach (2-8 minutes)**
- Introduce 2-3 mechanics through guided play (not text)
- Each mechanic is introduced, practiced, and mastered before the next
- Difficulty is trivially easy (this is not the time for challenge)
- Frequent positive reinforcement (visual rewards, audio cues, progress indicators)

**Act 3: Motivate (8-15 minutes)**
- Deliver first "aha moment" (the moment the player understands why the game is fun)
- Present first meaningful goal (something to come back for tomorrow)
- Show the depth ahead (preview of future content, characters, features)
- End on a high note with a clear reason to return

### FTUE Metrics Dashboard

| Metric | Target | Warning Threshold |
|--------|--------|-------------------|
| Time to first interaction | < 10 seconds | > 30 seconds |
| Tutorial start rate | > 90% of opens | < 80% |
| Tutorial completion rate | > 75% of starts | < 60% |
| Tutorial skip rate | < 20% | > 30% (tutorial is too long or boring) |
| First session completion rate | > 60% of opens | < 50% |
| First session length | 5-15 minutes | < 3 min (disengaged) or > 25 min (exhausted) |
| D1 retention | > 40% | < 30% |
| Time to first "aha moment" | < 5 minutes | > 10 minutes |

### Skip and Recovery

Not all players need the tutorial. Design for both audiences:

**Skip option**: Allow experienced players to skip the tutorial after a brief opt-out prompt (not hidden, not punished). Skipping should place the player at the post-tutorial state with equivalent resources.

**Re-access**: Players who skip (or forget) should be able to re-access tutorial content through a "Help" section or contextual tips that appear when they encounter a system for the first time.

**Smart detection**: Track which tutorial steps a player completed. If they skipped step 3 but are now stuck at a feature introduced in step 3, show a contextual tooltip.

### Contextual Onboarding vs. Front-Loaded Tutorial

| Approach | Pros | Cons |
|----------|------|------|
| Front-loaded tutorial | Comprehensive, controlled, consistent | Boring, removes agency, high drop-off |
| Contextual onboarding | Natural, non-intrusive, self-paced | May miss edge cases, less controlled |
| Hybrid (recommended) | Brief front-loaded basics + contextual for advanced | Requires more design/engineering effort |

## Metrics

| Metric | Measures | Target |
|--------|---------|--------|
| Tutorial completion rate | FTUE quality | > 75% |
| D1 retention | First session impact | > 40% |
| Time to first value action | Onboarding efficiency | < 5 minutes |
| FTUE funnel conversion (step by step) | Where players drop | No step > 15% drop |
| Tutorial sentiment (playtest) | Player enjoyment during tutorial | Positive (no frustration, no boredom) |

## Consequences

**Benefits:**
- "Learn by playing" respects player intelligence and maintains engagement
- Progressive disclosure prevents information overload
- Skip option accommodates experienced players without slowing them down
- First session architecture ensures emotional hook before cognitive load

**Trade-offs:**
- Contextual onboarding is harder to implement than a scripted tutorial
- Progressive disclosure means some features are not discovered for days (track adoption metrics)
- "Learn by playing" requires careful level design for early levels (they are both content and teaching)
- A/B testing FTUE requires large sample sizes due to one-time nature (each player only onboards once)

## Related Patterns

- **Game Loop Pattern**: Onboarding must introduce the core loop immediately and meta loop gradually
- **Monetization Pattern**: First purchase offer timing is an onboarding design decision
