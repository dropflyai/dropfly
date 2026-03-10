# Level Design Template

## What This Enables

This template provides a standardized structure for documenting level designs that communicate spatial layout, gameplay flow, difficulty progression, and design intent to the entire development team. A completed level design document ensures that artists, engineers, and QA share the designer's vision for the player experience within each level.

---

## Template

### Level Information

| Field | Value |
|-------|-------|
| **Level Name/ID** | [Name and internal identifier] |
| **World/Zone** | [Which world/zone this level belongs to] |
| **Position in Progression** | [Level N of M in this zone] |
| **Estimated Play Time** | [X minutes (first play), Y minutes (replay)] |
| **Difficulty Rating** | [1-10 scale relative to other levels] |
| **Designer** | [Name] |
| **Version** | [Document version] |
| **Status** | [Concept / Graybox / Art Pass / Polish / Final] |

---

### 1. Design Intent

#### 1.1 Player Experience Goal
[What should the player FEEL during this level? One sentence. Example: "The player should feel a growing sense of dread that transforms into triumph when they discover the hidden shortcut."]

#### 1.2 Teaching Objective
[What new mechanic, skill, or concept does this level teach? If none, what existing skill does it test at a new difficulty?]

#### 1.3 Narrative Context
[What is happening in the story at this point? How does this level advance the narrative?]

#### 1.4 Key Design Pillars for This Level
1. [Pillar 1: e.g., "Exploration reward" -- curiosity is rewarded with secret areas]
2. [Pillar 2: e.g., "Escalating tension" -- difficulty builds to a climax]

---

### 2. Layout and Flow

#### 2.1 Top-Down Layout
```
[ASCII art, sketch, or reference to attached image showing the level layout]

Example:
  ┌────────────────────────────────────┐
  │  START                              │
  │  ═══►  Arena 1  ═══►  Bridge       │
  │                          │          │
  │                          ▼          │
  │  Secret ◄══  Corridor ═══►  Arena 2│
  │  Area                       │       │
  │                             ▼       │
  │                          BOSS       │
  │                             │       │
  │                          EXIT       │
  └────────────────────────────────────┘
```

#### 2.2 Flow Breakdown

| Section | Duration | Purpose | Key Events |
|---------|----------|---------|-----------|
| [Section 1: Start] | [X min] | [Establish setting, give player bearings] | [Tutorial prompt, first pickup] |
| [Section 2: Arena 1] | [X min] | [First combat encounter, teach dodge mechanic] | [3 enemies, health drop on clear] |
| [Section 3: Bridge] | [X min] | [Pacing break, visual spectacle, narrative beat] | [Cutscene trigger, collectible] |
| [Section 4: Arena 2] | [X min] | [Escalated combat, combine learned mechanics] | [5 enemies + ranged, checkpoint] |
| [Section 5: Boss] | [X min] | [Climax, test all skills learned in this zone] | [Boss fight, phase transitions] |
| [Section 6: Exit] | [X min] | [Reward, narrative resolution, transition to next level] | [Loot, cutscene, level complete] |

#### 2.3 Pacing Graph
```
Intensity
  High  │         ╱╲          ╱╲╱╲
        │        ╱  ╲        ╱      ╲
  Med   │   ╱╲  ╱    ╲    ╱╱        ╲
        │  ╱  ╲╱      ╲  ╱           ╲
  Low   │ ╱            ╲╱             ╲
        └──────────────────────────────
        Start    Mid-point         End

Legend: ╱ = rising intensity, ╲ = falling intensity
```

---

### 3. Gameplay Elements

#### 3.1 Enemies/Obstacles

| Enemy/Obstacle | Count | First Appearance | Behavior | Purpose |
|---------------|-------|-----------------|----------|---------|
| [Enemy Type 1] | [N] | [Section X] | [Patrol, chase, etc.] | [Teach dodge mechanic] |
| [Enemy Type 2] | [N] | [Section X] | [Ranged attack from platform] | [Introduce ranged threat] |
| [Hazard 1] | [N] | [Section X] | [Periodic activation] | [Timing challenge] |

#### 3.2 Pickups and Rewards

| Item | Count | Location | Purpose |
|------|-------|----------|---------|
| [Health Pickup] | [N] | [Before Arena 2] | [Prepare for escalated combat] |
| [Currency] | [N] | [Distributed throughout] | [Economy progression] |
| [Collectible] | [N] | [Hidden in secret area] | [Exploration reward] |
| [Power-up] | [N] | [Arena 2 mid-fight] | [Empowerment moment] |

#### 3.3 Checkpoints

| Checkpoint | Location | Rationale |
|-----------|----------|-----------|
| [CP 1] | [After Arena 1] | [Player has proven basic competence] |
| [CP 2] | [Before Boss] | [Prevent frustration from repeating Arena 2 on boss death] |

#### 3.4 Secret Areas

| Secret | Location | Access Method | Reward |
|--------|----------|--------------|--------|
| [Secret 1] | [Behind breakable wall in Section 3] | [Attack the cracked wall] | [Rare collectible + lore text] |

---

### 4. Difficulty Design

#### 4.1 Difficulty Curve

| Section | Intended Difficulty | Death Rate Target | Adjustments for Easy/Hard Mode |
|---------|-------------------|-------------------|-------------------------------|
| [Section 1] | 1/10 | 0% | None (trivial in all modes) |
| [Arena 1] | 3/10 | 5% | Easy: 2 enemies; Hard: 4 enemies + timer |
| [Arena 2] | 5/10 | 15% | Easy: health regen; Hard: no checkpoints |
| [Boss] | 7/10 | 30% | Easy: more tells, more health drops; Hard: faster phases |

#### 4.2 Fail States and Recovery

| Fail State | Player Feedback | Recovery |
|-----------|----------------|----------|
| Player death | Screen flash, death animation, "Try Again" prompt | Respawn at last checkpoint |
| Fall off platform | Catch animation, damage | Return to last safe position |
| Timer expired | Warning sounds, visual urgency | Restart section |

#### 4.3 Dynamic Difficulty (if applicable)
[Describe any dynamic difficulty adjustments: e.g., "After 3 consecutive deaths at the boss, reduce boss health by 10% and add an extra health pickup."]

---

### 5. Visual and Audio Direction

#### 5.1 Visual Theme
[Description of the level's visual identity: color palette, lighting, atmosphere, weather, time of day]

#### 5.2 Landmark/Wayfinding
| Landmark | Location | Purpose |
|----------|----------|---------|
| [Tall tower in background] | [Visible throughout level] | [Establishes direction/destination] |
| [Glowing path markers] | [At decision points] | [Guides critical path] |
| [Distinct color lighting] | [Each section] | [Helps player orient within level] |

#### 5.3 Audio Design
| Section | Music | Ambient | Key SFX |
|---------|-------|---------|---------|
| [Exploration] | [Low tension, exploratory] | [Wind, distant sounds] | [Footsteps, pickups] |
| [Combat] | [High energy, percussive] | [Muted during combat] | [Attacks, impacts, enemy cries] |
| [Boss] | [Epic, phase-shifting] | [None] | [Phase transition, victory fanfare] |

---

### 6. Technical Notes

#### 6.1 Performance Considerations
[Any performance concerns: draw distance, enemy count, particle effects, loading]

#### 6.2 Streaming/Loading
[How the level loads: single load, streaming sections, loading screen triggers]

#### 6.3 Platform-Specific Notes
| Platform | Consideration |
|----------|--------------|
| [Mobile] | [Simplify section 4 enemy count for lower-end devices] |
| [PC] | [Extended draw distance reveals more of the environment] |

---

### 7. Playtest Notes

| Playtest Date | Key Findings | Actions Taken |
|--------------|-------------|---------------|
| [Date] | [Finding 1: Players missed the secret area] | [Added visual hint near breakable wall] |
| [Date] | [Finding 2: Boss phase 2 too hard] | [Added 1 extra health drop] |

---

## Usage Notes

- Create one level design document per level or per section for very large levels
- The layout sketch is a communication tool, not a blueprint -- iterate during graybox
- Playtest notes are the most valuable section; update them after every playtest
- Share with artists early so they can prepare asset lists from the layout
- Reference the Game Loop Pattern for how this level fits into the core and meta loops
