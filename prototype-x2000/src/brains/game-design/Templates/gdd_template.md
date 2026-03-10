# Game Design Document (GDD) Template

## What This Enables

This template provides a standardized structure for a Game Design Document -- the comprehensive specification that communicates the game's vision, mechanics, systems, content, and technical requirements to the entire development team. The GDD is the central reference document that ensures designers, engineers, artists, and producers share a unified understanding of what is being built.

---

## Template

### Document Header

| Field | Value |
|-------|-------|
| **Game Title** | [Working title] |
| **Genre** | [Primary genre / Secondary genre] |
| **Platform** | [Mobile / PC / Console / Cross-platform] |
| **Target Audience** | [Age range, gamer type, key demographics] |
| **Monetization Model** | [F2P / Premium / Premium + DLC / Subscription] |
| **Version** | [Document version] |
| **Last Updated** | [Date] |
| **Author** | [Name, role] |
| **Status** | [Concept / Pre-Production / Production] |

---

### 1. Game Overview

#### 1.1 Elevator Pitch
[One paragraph that captures the essence of the game. A reader should understand what the game IS after reading this.]

#### 1.2 Unique Selling Points (USPs)
1. [USP 1: What makes this game different from competitors?]
2. [USP 2]
3. [USP 3]

#### 1.3 Player Fantasy
[What fantasy does the player live out? "You are a..." statement. Example: "You are a galactic smuggler building a criminal empire in a procedurally generated universe."]

#### 1.4 Core Pillars (3-4)
1. [Pillar 1: e.g., "Strategic Depth" -- every decision matters]
2. [Pillar 2: e.g., "Social Competition" -- play with and against friends]
3. [Pillar 3: e.g., "Expressive Customization" -- make it yours]

#### 1.5 Comparable Titles
| Title | What We Take | What We Avoid |
|-------|-------------|---------------|
| [Game 1] | [Specific element we are inspired by] | [Element we intentionally diverge from] |
| [Game 2] | | |

---

### 2. Gameplay

#### 2.1 Core Loop
```
[Action] → [Challenge] → [Reward] → [Progression Choice] → [Action]
```
[Describe each element of the core loop in detail. What does the player DO every minute?]

#### 2.2 Meta Loop
```
[Goal] → [Resource Accumulation] → [Strategic Decision] → [Milestone] → [New Goal]
```
[Describe the medium-term progression loop. What does the player work toward over hours/days?]

#### 2.3 Social/Endgame Loop
[Describe the long-term engagement systems: guilds, competitive seasons, endgame content.]

#### 2.4 Session Flow
[Describe a typical play session: what does the player do from opening the app to closing it?]

#### 2.5 Controls and Input
| Action | Input (Mobile) | Input (PC) | Input (Controller) |
|--------|---------------|------------|-------------------|
| [Action 1] | [Tap/Swipe] | [Click/Key] | [Button] |

---

### 3. Game Systems

#### 3.1 Progression System
| System | Description | Progression Mechanic |
|--------|------------|---------------------|
| [Player Level] | [Description] | [XP from gameplay → level up → unlock rewards] |
| [Character/Hero System] | [Description] | [Collect, level, evolve characters] |
| [Equipment/Gear] | [Description] | [Find, craft, upgrade gear] |

#### 3.2 Economy Design
| Currency | Source (Earn) | Sink (Spend) | Balance Rule |
|----------|-------------|-------------|-------------|
| [Soft Currency] | [Gameplay rewards, daily login] | [Upgrades, consumables] | [Players earn X per session] |
| [Hard Currency] | [IAP, rare drops, achievements] | [Premium items, speed-ups] | [F2P earns X per week] |

#### 3.3 Combat/Core Mechanic System
[Detailed description of the primary mechanic: combat, puzzle, building, racing, etc.]

#### 3.4 AI/NPC Systems
[Description of AI behaviors, enemy types, NPC interactions]

#### 3.5 Multiplayer/Social Systems
| Feature | Description | Engagement Driver |
|---------|------------|------------------|
| [Friends] | [Description] | [Social pressure, cooperative benefits] |
| [Guild/Clan] | [Description] | [Community, collaborative goals] |
| [PvP] | [Description] | [Competition, ranking] |
| [Chat] | [Description] | [Communication, community] |

---

### 4. Content

#### 4.1 World/Setting
[Description of the game world, lore, tone, visual style]

#### 4.2 Content Map
| Content Type | Count (Launch) | Count (6 months) | Production Pipeline |
|-------------|---------------|------------------|-------------------|
| [Levels/Stages] | [N] | [N] | [How produced] |
| [Characters/Heroes] | [N] | [N] | |
| [Items/Equipment] | [N] | [N] | |
| [Events/Modes] | [N] | [N] | |

#### 4.3 Narrative Design
[Story synopsis, narrative structure, how story integrates with gameplay]

---

### 5. Monetization

#### 5.1 Revenue Model
[Detailed description of the monetization approach. Reference the Monetization Pattern.]

#### 5.2 IAP Catalog

| Product | Price | Contents | Availability | Target Segment |
|---------|-------|---------|-------------|---------------|
| Starter Pack | $[X] | [Contents] | First 7 days | New players |
| Battle Pass | $[X]/season | [Description] | Every season | Engaged players |
| [Other products] | | | | |

#### 5.3 Ad Strategy
[If applicable: ad types, placements, frequency, rewarded ad economy]

---

### 6. User Experience

#### 6.1 FTUE (First Time User Experience)
[Reference the Onboarding Pattern. Describe the first 5-minute experience beat by beat.]

#### 6.2 UI Flow Diagram
```
[Main Menu] → [Play] → [Level Select] → [Gameplay] → [Results] → [Rewards]
                    → [Shop]
                    → [Social]
                    → [Profile]
                    → [Settings]
```

#### 6.3 Accessibility
| Feature | Priority | Standard |
|---------|----------|---------|
| Color-blind modes | Must | Deuteranopia + protanopia support |
| Text size options | Must | 3 size levels minimum |
| Subtitles/captions | Must | For all dialogue and critical audio |
| Difficulty options | Should | At least easy/normal/hard |
| Remappable controls | Should | Full key/button remapping |
| Screen reader support | Nice | Main menus and critical UI |

---

### 7. Art Direction

#### 7.1 Visual Style
[Description of art style, reference images, mood board reference]

#### 7.2 Character Design Guidelines
[Character proportions, color palette, visual consistency rules]

#### 7.3 Environment Design Guidelines
[World visual rules, lighting, atmosphere]

#### 7.4 UI Style Guide
[UI visual language, color scheme, typography, iconography]

---

### 8. Audio Design

#### 8.1 Music Direction
[Musical style, instruments, mood per game state (menu, gameplay, victory, defeat)]

#### 8.2 Sound Effects
[SFX philosophy, key sounds, feedback sounds for game feel]

#### 8.3 Voice
[Voice acting requirements, localization needs, procedural voice]

---

### 9. Technical Requirements

#### 9.1 Target Specifications
| Platform | Min Spec | Target FPS | Max Resolution |
|----------|----------|-----------|---------------|
| [iOS] | [iPhone X+] | [60 fps] | [2532x1170] |
| [Android] | [Spec] | [FPS] | [Resolution] |

#### 9.2 Networking Requirements
[Online/offline, server architecture, latency requirements, data sync strategy]

#### 9.3 Analytics Requirements
[Key events to instrument, analytics platform, data pipeline]

---

### 10. Production

#### 10.1 Milestone Plan
| Milestone | Date | Deliverables |
|-----------|------|-------------|
| Concept | [Date] | GDD v1, art direction, prototype plan |
| Prototype | [Date] | Playable core loop, first playtest |
| Vertical Slice | [Date] | Complete feature set for 1 level, polished |
| Alpha | [Date] | All features functional, content in progress |
| Beta | [Date] | All content, bug fixing, optimization |
| Soft Launch | [Date] | Limited market release, KPI validation |
| Global Launch | [Date] | Worldwide release |

#### 10.2 Team Requirements
| Role | Count | Responsibilities |
|------|-------|-----------------|
| [Game Designer] | [N] | [Systems, levels, balance] |
| [Engineer] | [N] | [Client, server, tools] |
| [Artist] | [N] | [2D, 3D, VFX, UI] |
| [Producer] | [N] | [Scheduling, coordination] |

---

### 11. KPIs and Success Criteria

| KPI | Target (Soft Launch) | Target (Launch) | Target (Month 6) |
|-----|---------------------|-----------------|------------------|
| D1 Retention | > 40% | > 45% | > 45% |
| D7 Retention | > 15% | > 20% | > 22% |
| D30 Retention | > 5% | > 8% | > 10% |
| ARPDAU | > $0.05 | > $0.10 | > $0.15 |
| Session Length | > 8 min | > 10 min | > 12 min |
| Sessions/Day | > 2 | > 2.5 | > 3 |

---

## Usage Notes

- The GDD is a living document; update it as the game evolves during production
- Not all sections apply to all games; remove irrelevant sections with a note explaining why
- The GDD communicates intent; it is not a legal contract or immutable specification
- Share the GDD with all team members and encourage questions and challenges
- Version the GDD and track major changes so the team can see design evolution
