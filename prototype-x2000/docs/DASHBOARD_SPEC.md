# X2000 Dashboard Specification

## Phase 1: Read-Only Dashboard

**Version:** 1.0
**Date:** 2026-03-07
**Status:** Design Specification
**Target:** Technical founders building businesses with X2000

---

## 1. Design Philosophy

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Information Density** | Show maximum relevant data without clutter |
| **Progressive Disclosure** | Summaries first, details on demand |
| **Real-time Awareness** | Always know what the system is doing |
| **Trust Through Transparency** | Every decision is visible and explainable |
| **Calm Technology** | Alert when needed, quiet when not |

### Visual Language

Inspired by Linear, Notion, and Vercel dashboards:
- Clean, minimal chrome
- High contrast for active elements
- Subtle animations for state changes
- Dark mode first (with light mode option)
- Monospace typography for technical data

---

## 2. Dashboard Layout

### 2.1 Master Layout

```
+-----------------------------------------------------------------------------------+
|  HEADER                                                                           |
|  [X2000 Logo]  Project: RestaurantOS        [Search]  [Notifications]  [Profile]  |
+-----------------------------------------------------------------------------------+
|        |                                                                          |
|   N    |  MAIN CONTENT AREA                                                       |
|   A    |                                                                          |
|   V    |  +------------------------------------------------------------------+    |
|        |  |                                                                  |    |
|   B    |  |  PROJECT OVERVIEW                                                |    |
|   A    |  |  ================================================================|    |
|   R    |  |                                                                  |    |
|        |  +------------------------------------------------------------------+    |
|   80   |                                                                          |
|   p    |  +-------------------------------+  +-------------------------------+    |
|   x    |  |                               |  |                               |    |
|        |  |  BRAIN ACTIVITY               |  |  TASK PROGRESS                |    |
|        |  |  =============================|  |  =============================|    |
|        |  |                               |  |                               |    |
|        |  +-------------------------------+  +-------------------------------+    |
|        |                                                                          |
|        |  +-------------------------------+  +-------------------------------+    |
|        |  |                               |  |                               |    |
|        |  |  DECISION LOG                 |  |  MEMORY PANEL                 |    |
|        |  |  =============================|  |  =============================|    |
|        |  |                               |  |                               |    |
|        |  +-------------------------------+  +-------------------------------+    |
|        |                                                                          |
+-----------------------------------------------------------------------------------+
|  FOOTER: Status Bar - System Health | API Calls: 47 | Memory: 234 patterns       |
+-----------------------------------------------------------------------------------+
```

### 2.2 Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Desktop XL | 1440px+ | Full 4-panel grid |
| Desktop | 1200-1439px | 2-column panels |
| Tablet | 768-1199px | Stacked panels |
| Mobile | <768px | Single column, bottom nav |

### 2.3 Navigation Bar

```
+------------------+
|                  |
|  [=] Dashboard   |  <- Active
|                  |
|  [o] Brains      |
|                  |
|  [>] Tasks       |
|                  |
|  [!] Decisions   |
|                  |
|  [*] Memory      |
|                  |
|  [~] Activity    |
|                  |
|------------------|
|                  |
|  [?] Help        |
|  [@] Settings    |
|                  |
+------------------+
```

---

## 3. Project Overview Panel

### 3.1 Wireframe

```
+------------------------------------------------------------------------+
|  PROJECT OVERVIEW                                              [Expand] |
+------------------------------------------------------------------------+
|                                                                         |
|  RestaurantOS                                    Status: BUILDING       |
|  "Inventory management for restaurants"         Phase: MVP Development  |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  |  Progress                                                         |  |
|  |  ========================================================== 67%   |  |
|  +-------------------------------------------------------------------+  |
|                                                                         |
|  +----------------+  +----------------+  +----------------+             |
|  |  Tasks         |  |  Decisions     |  |  Patterns      |            |
|  |  12/18         |  |  23            |  |  8 applied     |            |
|  |  completed     |  |  made today    |  |  2 new         |            |
|  +----------------+  +----------------+  +----------------+             |
|                                                                         |
|  Active Brains: CEO, Engineering, Product       Estimated: 3 days left |
|                                                                         |
+------------------------------------------------------------------------+
```

### 3.2 Data Fields

| Field | Source | Update Frequency |
|-------|--------|------------------|
| Project Name | Project config | Static |
| Description | Project config | Static |
| Status | Task aggregate | Real-time |
| Phase | CEO Brain determination | On phase change |
| Progress % | Tasks completed / total | Real-time |
| Tasks Summary | Task manager | Real-time |
| Decisions Count | Decision log | Real-time |
| Patterns Applied | Memory system | Real-time |
| Active Brains | Agent session manager | Real-time |
| Time Estimate | CEO Brain projection | Hourly |

---

## 4. Brain Activity Panel

### 4.1 The 37-Brain Challenge

**Problem:** 37 brains is overwhelming to display at once.

**Solution:** Tiered visibility with smart grouping.

### 4.2 Brain Visualization Tiers

```
TIER 1: Active Brains (Always Visible)
+--------------------------------------------------------------+
|  ACTIVE NOW                                                   |
|  +----------+  +----------+  +----------+                     |
|  |   CEO    |  |   ENG    |  |   QA     |                     |
|  |   [*]    |  |   [*]    |  |   [*]    |                     |
|  |Routing   |  |Building  |  |Testing   |                     |
|  | tasks    |  |API       |  |endpoints |                     |
|  +----------+  +----------+  +----------+                     |
+--------------------------------------------------------------+

TIER 2: Recently Active (Collapsed, Expandable)
+--------------------------------------------------------------+
|  RECENTLY ACTIVE (3)                               [Expand]   |
|  Product (2m ago) | Research (15m ago) | Design (1h ago)      |
+--------------------------------------------------------------+

TIER 3: All Brains (On Demand)
+--------------------------------------------------------------+
|  ALL BRAINS (37)                                   [View All] |
|  [Core: 5] [Business: 3] [Product: 4] [Growth: 5] [Tech: 9]  |
|  [Marketing: 5] [Ops: 4] [People: 2]                         |
+--------------------------------------------------------------+
```

### 4.3 Individual Brain Card

```
+------------------------+
|  ENGINEERING           |
|  Trust Level: *** (3)  |
+------------------------+
|                        |
|  Status: ACTIVE        |
|  [=========>    ] 73%  |
|                        |
|  Current Task:         |
|  Building inventory    |
|  tracking API          |
|                        |
|  Duration: 4m 23s      |
|                        |
+------------------------+
|  Tasks: 47 | 94% rate  |
+------------------------+
```

### 4.4 Brain States

| State | Visual Treatment | Description |
|-------|------------------|-------------|
| **Active** | Bright accent color, pulsing indicator | Currently executing a task |
| **Warming** | Amber glow, loading animation | Spinning up context |
| **Idle** | Dim, muted colors | Ready but not working |
| **Cooling** | Fading animation | About to terminate |
| **Terminated** | Grayed out (not shown by default) | Session ended |

### 4.5 Brain Collaboration Visualization

```
COLLABORATION VIEW (When Brain Debate Active)
+--------------------------------------------------------------+
|                                                               |
|            [PRODUCT]                                          |
|                |                                              |
|                | "Focus on alerts first"                      |
|                |                                              |
|      +---------+---------+                                    |
|      |                   |                                    |
|      v                   v                                    |
|  [ENGINEERING]  <---->  [CEO]                                 |
|  "Adds 2 weeks"        "Resolving..."                         |
|                                                               |
|  Debate: Feature prioritization                               |
|  Status: CEO resolving (no consensus)                         |
|  Duration: 45s                                                |
|                                                               |
+--------------------------------------------------------------+
```

### 4.6 Trust Level Indicators

```
Trust Level Display:

Level 1 (New):        [*]       Gray star, "Limited"
Level 2 (Established): [**]      Blue stars, "Established"
Level 3 (Trusted):     [***]     Green stars, "Trusted"
Level 4 (Full):        [****]    Gold stars, "Full Autonomy"

Compact: Show as star count with color
Expanded: Show level name + permissions
```

---

## 5. Task Progress Panel

### 5.1 Main Wireframe

```
+------------------------------------------------------------------------+
|  TASK PROGRESS                                         [View All Tasks] |
+------------------------------------------------------------------------+
|                                                                         |
|  Current Orchestration                                                  |
|  "Build inventory tracking feature"                                     |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  |  SUBTASKS                                                         |  |
|  +-------------------------------------------------------------------+  |
|  |                                                                   |  |
|  |  [x] 1. Design database schema           PRODUCT    2m    Done   |  |
|  |  [x] 2. Create migration files           ENGINEERING 1m   Done   |  |
|  |  [>] 3. Build API endpoints              ENGINEERING 4m   73%    |  |
|  |      +-- GET /inventory                  Done                    |  |
|  |      +-- POST /inventory                 Done                    |  |
|  |      +-- PUT /inventory/:id              In Progress             |  |
|  |      +-- DELETE /inventory/:id           Pending                 |  |
|  |  [ ] 4. Write integration tests          QA          Est: 3m     |  |
|  |  [ ] 5. Update API documentation         ENGINEERING Est: 2m     |  |
|  |                                                                   |  |
|  +-------------------------------------------------------------------+  |
|                                                                         |
|  Dependencies:  4 depends on 3 | 5 depends on 3                        |
|  Estimated Completion: 12 minutes                                       |
|                                                                         |
+------------------------------------------------------------------------+
```

### 5.2 Task Status Icons

```
[ ] Pending      - Gray circle
[>] In Progress  - Blue animated spinner
[x] Completed    - Green checkmark
[!] Failed       - Red exclamation
[~] Blocked      - Orange pause icon
[?] Needs Input  - Purple question mark
```

### 5.3 Task Row Detail

```
+------------------------------------------------------------------------+
|  [x] Design database schema                                             |
+------------------------------------------------------------------------+
|                                                                         |
|  Owner: Product Brain                         Duration: 2m 14s          |
|  Priority: High                               Completed: 10:34 AM       |
|                                                                         |
|  Output:                                                                |
|  +----------------------------------------------------------------+    |
|  | -- Inventory Table                                              |    |
|  | CREATE TABLE inventory (                                        |    |
|  |   id UUID PRIMARY KEY,                                          |    |
|  |   name VARCHAR(255),                                            |    |
|  |   quantity INT,                                                 |    |
|  |   ...                                                           |    |
|  | );                                                              |    |
|  +----------------------------------------------------------------+    |
|                                                                         |
|  Memory Applied: "Use UUIDs for all primary keys" (pattern #23)        |
|                                                                         |
+------------------------------------------------------------------------+
```

### 5.4 Progress Visualization Options

```
OPTION A: Linear Progress Bar (Default)
[====================>              ] 67%

OPTION B: Segmented Progress (For clear subtasks)
[====][====][====][====][    ][    ] 4/6

OPTION C: Circular Progress (Compact view)
    ___
   /   \
  | 67% |
   \___/
```

---

## 6. Decision Log Panel

### 6.1 Main Wireframe

```
+------------------------------------------------------------------------+
|  DECISION LOG                                    [Filter] [Search]      |
+------------------------------------------------------------------------+
|                                                                         |
|  TODAY                                                                  |
|  +------------------------------------------------------------------+  |
|  |  10:45 AM  Feature Prioritization                        [DEBATE]|  |
|  |  CEO resolved: "Ship basic inventory first, alerts in v2"        |  |
|  |  Participants: Product, Engineering, CEO                         |  |
|  |                                                      [View Full] |  |
|  +------------------------------------------------------------------+  |
|  |  10:32 AM  Database Choice                          [CONSENSUS]  |  |
|  |  Agreed: "Use Supabase for MVP, evaluate at scale"               |  |
|  |  Participants: Engineering, Data                                 |  |
|  |                                                      [View Full] |  |
|  +------------------------------------------------------------------+  |
|  |  10:15 AM  Tech Stack                               [CONSENSUS]  |  |
|  |  Agreed: "Next.js + TypeScript + Tailwind"                       |  |
|  |  Participants: Engineering                                       |  |
|  +------------------------------------------------------------------+  |
|                                                                         |
|  YESTERDAY (5 decisions)                                    [Expand]   |
|  LAST WEEK (23 decisions)                                   [Expand]   |
|                                                                         |
+------------------------------------------------------------------------+
```

### 6.2 Decision Detail (Expanded)

```
+------------------------------------------------------------------------+
|  DECISION: Feature Prioritization                                       |
|  Time: 10:45 AM | Duration: 1m 23s | Type: DEBATE                       |
+------------------------------------------------------------------------+
|                                                                         |
|  CONTEXT                                                                |
|  User requested inventory alerts feature for MVP scope.                 |
|                                                                         |
|  DEBATE THREAD                                                          |
|  +------------------------------------------------------------------+  |
|  |  [PROPOSE] Product Brain                              10:44:12   |  |
|  |  "Focus on inventory alerts first"                               |  |
|  |  Evidence: User research shows stockouts are #1 pain point       |  |
|  +------------------------------------------------------------------+  |
|  |  [CHALLENGE] Engineering Brain                        10:44:34   |  |
|  |  "Alerts require notification infrastructure"                    |  |
|  |  Evidence: Adds 2 weeks to timeline, complex mobile push         |  |
|  +------------------------------------------------------------------+  |
|  |  [DEFEND] Product Brain                               10:44:45   |  |
|  |  "Could we use email-only alerts initially?"                     |  |
|  +------------------------------------------------------------------+  |
|  |  [COUNTER] Engineering Brain                          10:44:52   |  |
|  |  "Still adds complexity. Core inventory is the foundation."      |  |
|  +------------------------------------------------------------------+  |
|  |  [RESOLVE] CEO Brain                                  10:45:08   |  |
|  |  "Ship basic inventory first, alerts in v2"                      |  |
|  |  Rationale: Core value without infrastructure complexity         |  |
|  |  Precedent: Similar decision in Project X worked well            |  |
|  +------------------------------------------------------------------+  |
|                                                                         |
|  RESOLUTION                                                             |
|  Type: CEO Override (No consensus reached)                              |
|  Decision logged to memory | Pattern may be extracted                   |
|                                                                         |
+------------------------------------------------------------------------+
```

### 6.3 Decision Badge Types

```
[CONSENSUS]  - Green badge, all brains agreed
[MAJORITY]   - Blue badge, 70%+ agreement
[DEBATE]     - Orange badge, CEO resolved
[OVERRIDE]   - Yellow badge, user decision
[ESCALATED]  - Red badge, human required
```

---

## 7. Memory Panel

### 7.1 Main Wireframe

```
+------------------------------------------------------------------------+
|  MEMORY & LEARNING                              [Search Memory]         |
+------------------------------------------------------------------------+
|                                                                         |
|  SYSTEM INTELLIGENCE                                                    |
|  +------------------+  +------------------+  +------------------+       |
|  |  Total Patterns  |  |  Pattern Reuse   |  |  Failure Avoid   |      |
|  |       47         |  |      72%         |  |       89%        |      |
|  |   +3 this week   |  |   +5% vs last    |  |   from memory    |      |
|  +------------------+  +------------------+  +------------------+       |
|                                                                         |
|  APPLIED TO THIS PROJECT                                                |
|  +------------------------------------------------------------------+  |
|  |  [i] "Use UUIDs for all primary keys"                   95% fit  |  |
|  |      Engineering | Applied 2 hours ago                           |  |
|  +------------------------------------------------------------------+  |
|  |  [i] "MoSCoW prioritization prevents scope creep"       88% fit  |  |
|  |      Product | Applied during planning phase                     |  |
|  +------------------------------------------------------------------+  |
|  |  [!] "Avoid JWT without refresh tokens"                 Warning  |  |
|  |      Past failure | Auth system planning                         |  |
|  +------------------------------------------------------------------+  |
|                                                                         |
|  RECENT LEARNINGS                                                       |
|  +------------------------------------------------------------------+  |
|  |  [+] "Supabase Auth reduces auth dev time by 80%"        NEW     |  |
|  |      From: RestaurantOS | Engineering Brain | Today              |  |
|  +------------------------------------------------------------------+  |
|  |  [+] "Always verify mobile responsiveness early"         NEW     |  |
|  |      From: ProjectX | Design Brain | Yesterday                   |  |
|  +------------------------------------------------------------------+  |
|                                                                         |
|  [View All Patterns] [View All Learnings] [View Anti-Patterns]         |
|                                                                         |
+------------------------------------------------------------------------+
```

### 7.2 Pattern Card (Expanded)

```
+------------------------------------------------------------------------+
|  PATTERN: Use UUIDs for all primary keys                                |
+------------------------------------------------------------------------+
|                                                                         |
|  Description:                                                           |
|  Always use UUID v4 for primary keys instead of auto-increment          |
|  integers. Provides better security, distributed ID generation,         |
|  and avoids ID enumeration attacks.                                     |
|                                                                         |
|  +-------------------+  +-------------------+  +-------------------+    |
|  |  Success Rate     |  |  Times Applied    |  |  Created By       |   |
|  |      96%          |  |       23          |  |  Engineering      |   |
|  +-------------------+  +-------------------+  +-------------------+    |
|                                                                         |
|  Context Tags: [database] [security] [schema] [best-practice]          |
|                                                                         |
|  Trigger: When designing database schema with primary keys              |
|  Solution: Use UUID type, generate with uuid_generate_v4()              |
|                                                                         |
|  Source Projects: ProjectX, ProjectY, RestaurantOS                      |
|  Last Applied: 2 hours ago                                              |
|                                                                         |
+------------------------------------------------------------------------+
```

### 7.3 Learning Categories

```
[+] Success Learning  - Green plus, positive outcome
[!] Failure Learning  - Red warning, anti-pattern
[*] Insight           - Blue star, general observation
[?] Hypothesis        - Purple question, untested
```

### 7.4 Intelligence Metrics

| Metric | Calculation | Display |
|--------|-------------|---------|
| **Pattern Reuse Rate** | (patterns_applied / tasks_completed) * 100 | Percentage |
| **Failure Avoidance** | (anti_patterns_avoided / anti_patterns_relevant) * 100 | Percentage |
| **Learning Velocity** | new_learnings / time_period | Count/week |
| **Cross-Project Transfer** | patterns_from_other_projects / total_applied | Percentage |

---

## 8. Activity Feed (Supplementary View)

### 8.1 Wireframe

```
+------------------------------------------------------------------------+
|  ACTIVITY FEED                              [Filter: All]   [Live]     |
+------------------------------------------------------------------------+
|                                                                         |
|  10:47:23  [TASK]  Engineering completed: PUT /inventory/:id endpoint  |
|  10:47:12  [MEMORY] Pattern applied: "REST naming conventions"         |
|  10:46:58  [BRAIN]  QA Brain warming up                                |
|  10:45:08  [DECISION] CEO resolved feature prioritization debate       |
|  10:44:12  [DEBATE] Product vs Engineering: Alert implementation       |
|  10:43:45  [TASK]  Engineering started: Build API endpoints            |
|  10:42:30  [PATTERN] Extracted: "Database migration workflow"          |
|  10:41:15  [BRAIN]  Research Brain terminated (idle timeout)           |
|  ...                                                                    |
|                                                                         |
|  [Load More]                                                            |
|                                                                         |
+------------------------------------------------------------------------+
```

### 8.2 Event Types

| Event | Icon | Color | Description |
|-------|------|-------|-------------|
| Task Created | + | Gray | New task added |
| Task Started | > | Blue | Brain began work |
| Task Completed | check | Green | Task finished |
| Task Failed | x | Red | Task errored |
| Brain Spawned | circle | Blue | New brain activated |
| Brain Terminated | circle-x | Gray | Brain session ended |
| Debate Started | chat | Orange | Brains disagreeing |
| Debate Resolved | check-chat | Green | Consensus or resolution |
| Pattern Applied | book | Purple | Memory used |
| Pattern Extracted | plus-book | Purple | New learning |
| Guardrail Triggered | shield | Yellow | Safety check |
| Escalation | alert | Red | Human needed |

---

## 9. Component Library

### 9.1 Core Components

```
COMPONENTS REQUIRED FOR PHASE 1:

Layout
├── AppShell (header, nav, content, footer)
├── Panel (collapsible container)
├── Card (content container)
├── Grid (2x2, responsive)
└── Stack (vertical spacing)

Navigation
├── NavBar (vertical navigation)
├── NavItem (single nav link)
├── Breadcrumb
└── TabGroup

Data Display
├── StatCard (metric with label)
├── ProgressBar (linear, segmented)
├── Badge (status indicator)
├── Avatar (brain icon)
├── Timeline (activity feed)
├── TreeView (task hierarchy)
└── Table (sortable, filterable)

Brain Components
├── BrainCard (individual brain display)
├── BrainGrid (37-brain overview)
├── BrainCollaboration (debate visualization)
├── TrustIndicator (star rating)
└── BrainStatus (active/idle/etc)

Task Components
├── TaskRow (single task)
├── TaskTree (hierarchical tasks)
├── TaskProgress (overall progress)
└── TaskDetail (expanded view)

Decision Components
├── DecisionCard (summary)
├── DecisionDetail (full thread)
├── DebateThread (back-and-forth)
└── DebateStatement (single statement)

Memory Components
├── PatternCard (pattern summary)
├── PatternDetail (full pattern)
├── LearningCard (learning summary)
├── MemoryMetrics (intelligence stats)
└── MemorySearch (search interface)

Utility
├── Timestamp (relative time)
├── Duration (elapsed time)
├── Tooltip
├── Modal
├── SearchInput
└── FilterDropdown
```

---

## 10. Design Tokens

### 10.1 Color Palette

```
SEMANTIC COLORS (Dark Mode Primary)

Background
--bg-primary:      #0A0A0B    /* Main background */
--bg-secondary:    #111113    /* Panel background */
--bg-tertiary:     #1A1A1D    /* Card background */
--bg-elevated:     #222225    /* Hover states */
--bg-overlay:      rgba(0,0,0,0.8)  /* Modals */

Foreground
--fg-primary:      #FAFAFA    /* Primary text */
--fg-secondary:    #A1A1A6    /* Secondary text */
--fg-tertiary:     #6B6B70    /* Muted text */
--fg-disabled:     #404044    /* Disabled text */

Border
--border-subtle:   #222225    /* Subtle borders */
--border-default:  #333338    /* Default borders */
--border-strong:   #444449    /* Emphasized borders */

ACCENT COLORS

Primary (Brand)
--accent-primary:     #3B82F6    /* Primary blue */
--accent-primary-dim: #1D4ED8    /* Darker blue */
--accent-primary-bg:  rgba(59,130,246,0.15)

Success
--success:         #22C55E    /* Green */
--success-dim:     #15803D
--success-bg:      rgba(34,197,94,0.15)

Warning
--warning:         #F59E0B    /* Amber */
--warning-dim:     #B45309
--warning-bg:      rgba(245,158,11,0.15)

Error
--error:           #EF4444    /* Red */
--error-dim:       #B91C1C
--error-bg:        rgba(239,68,68,0.15)

Info
--info:            #8B5CF6    /* Purple */
--info-dim:        #6D28D9
--info-bg:         rgba(139,92,246,0.15)

BRAIN STATE COLORS

--brain-active:    #3B82F6    /* Blue - working */
--brain-warming:   #F59E0B    /* Amber - loading */
--brain-idle:      #6B6B70    /* Gray - ready */
--brain-cooling:   #A1A1A6    /* Light gray - stopping */
--brain-error:     #EF4444    /* Red - failed */

TRUST LEVEL COLORS

--trust-1:         #6B6B70    /* Gray - limited */
--trust-2:         #3B82F6    /* Blue - established */
--trust-3:         #22C55E    /* Green - trusted */
--trust-4:         #F59E0B    /* Gold - full autonomy */
```

### 10.2 Typography

```
FONT FAMILIES

--font-sans:       'Inter', -apple-system, BlinkMacSystemFont, sans-serif
--font-mono:       'JetBrains Mono', 'Fira Code', monospace

FONT SIZES

--text-xs:         0.75rem    /* 12px */
--text-sm:         0.875rem   /* 14px */
--text-base:       1rem       /* 16px */
--text-lg:         1.125rem   /* 18px */
--text-xl:         1.25rem    /* 20px */
--text-2xl:        1.5rem     /* 24px */
--text-3xl:        1.875rem   /* 30px */

FONT WEIGHTS

--font-normal:     400
--font-medium:     500
--font-semibold:   600
--font-bold:       700

LINE HEIGHTS

--leading-tight:   1.25
--leading-normal:  1.5
--leading-relaxed: 1.625

LETTER SPACING

--tracking-tight:  -0.025em
--tracking-normal: 0
--tracking-wide:   0.025em

TYPE SCALE APPLICATION

Display:       text-3xl, font-bold, tracking-tight
Heading 1:     text-2xl, font-semibold
Heading 2:     text-xl, font-semibold
Heading 3:     text-lg, font-medium
Body:          text-base, font-normal
Body Small:    text-sm, font-normal
Caption:       text-xs, font-normal, fg-secondary
Code:          text-sm, font-mono
```

### 10.3 Spacing System

```
SPACING SCALE (4px base unit)

--space-0:    0
--space-1:    0.25rem   /* 4px */
--space-2:    0.5rem    /* 8px */
--space-3:    0.75rem   /* 12px */
--space-4:    1rem      /* 16px */
--space-5:    1.25rem   /* 20px */
--space-6:    1.5rem    /* 24px */
--space-8:    2rem      /* 32px */
--space-10:   2.5rem    /* 40px */
--space-12:   3rem      /* 48px */
--space-16:   4rem      /* 64px */

APPLICATION

Component Padding:
- Card:        space-4 (16px)
- Panel:       space-6 (24px)
- Modal:       space-8 (32px)

Component Gap:
- Tight:       space-2 (8px)
- Normal:      space-4 (16px)
- Loose:       space-6 (24px)

Section Spacing:
- Between panels:  space-6 (24px)
- Between cards:   space-4 (16px)
- Between items:   space-3 (12px)
```

### 10.4 Border & Radius

```
BORDER RADIUS

--radius-none:   0
--radius-sm:     0.25rem   /* 4px - buttons, inputs */
--radius-md:     0.5rem    /* 8px - cards */
--radius-lg:     0.75rem   /* 12px - panels */
--radius-xl:     1rem      /* 16px - modals */
--radius-full:   9999px    /* Pills, avatars */

BORDER WIDTH

--border-thin:   1px
--border-thick:  2px

APPLICATION

Cards:       radius-md, border-thin, border-subtle
Panels:      radius-lg, border-thin, border-default
Buttons:     radius-sm
Badges:      radius-full
Avatars:     radius-full
Inputs:      radius-sm, border-thin
```

### 10.5 Shadows & Elevation

```
SHADOWS (Dark Mode Optimized)

--shadow-sm:     0 1px 2px rgba(0,0,0,0.5)
--shadow-md:     0 4px 6px rgba(0,0,0,0.5)
--shadow-lg:     0 10px 15px rgba(0,0,0,0.5)
--shadow-xl:     0 20px 25px rgba(0,0,0,0.5)

ELEVATION LAYERS

Level 0:     bg-primary      (base)
Level 1:     bg-secondary    (panels)
Level 2:     bg-tertiary     (cards)
Level 3:     bg-elevated     (popovers)
Level 4:     bg-overlay      (modals)
```

### 10.6 Animation & Timing

```
TIMING FUNCTIONS

--ease-default:  cubic-bezier(0.4, 0, 0.2, 1)
--ease-in:       cubic-bezier(0.4, 0, 1, 1)
--ease-out:      cubic-bezier(0, 0, 0.2, 1)
--ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1)

DURATIONS

--duration-fast:     100ms    /* Hover states */
--duration-normal:   200ms    /* Transitions */
--duration-slow:     300ms    /* Larger movements */
--duration-slower:   500ms    /* Full animations */

ANIMATIONS

Pulse (Active Brain):
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  animation: pulse 2s ease-in-out infinite

Spin (Loading):
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  animation: spin 1s linear infinite

Fade In:
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  animation: fadeIn 200ms ease-out

Slide Up:
  @keyframes slideUp {
    from { transform: translateY(10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  animation: slideUp 200ms ease-out
```

---

## 11. Accessibility Requirements

### 11.1 Color Contrast

| Element | Requirement | Min Ratio |
|---------|-------------|-----------|
| Body text | WCAG AA | 4.5:1 |
| Large text | WCAG AA | 3:1 |
| UI components | WCAG AA | 3:1 |
| Focus indicators | Visible | 3:1 |

### 11.2 Keyboard Navigation

```
TAB ORDER:
1. Skip to content link
2. Navigation items
3. Main content panels (top to bottom, left to right)
4. Interactive elements within panels
5. Footer elements

FOCUS STATES:
- Visible focus ring: 2px solid var(--accent-primary)
- Focus ring offset: 2px
- All interactive elements must be focusable

KEYBOARD SHORTCUTS (Phase 2):
- /     : Open search
- g d   : Go to dashboard
- g b   : Go to brains
- g t   : Go to tasks
- ?     : Show keyboard shortcuts
```

### 11.3 Screen Reader Support

```
ARIA REQUIREMENTS:

Landmarks:
- <header role="banner">
- <nav role="navigation">
- <main role="main">
- <footer role="contentinfo">

Live Regions:
- Activity feed: aria-live="polite"
- Brain status: aria-live="polite"
- Task progress: aria-live="polite"
- Error messages: aria-live="assertive"

Labels:
- All interactive elements: aria-label or aria-labelledby
- Progress bars: aria-valuenow, aria-valuemin, aria-valuemax
- Expandable sections: aria-expanded
- Tabs: role="tablist", role="tab", role="tabpanel"
```

---

## 12. Real-Time Updates

### 12.1 Update Strategy

| Data Type | Update Frequency | Method |
|-----------|------------------|--------|
| Brain status | Real-time | WebSocket |
| Task progress | Real-time | WebSocket |
| Decision log | Real-time | WebSocket |
| Memory metrics | Every 30s | Polling |
| Project overview | Every 60s | Polling |
| Activity feed | Real-time | WebSocket |

### 12.2 Connection States

```
CONNECTED:
  Status bar: Green dot, "Connected"
  Real-time updates active

CONNECTING:
  Status bar: Amber dot, "Connecting..."
  Show spinner

DISCONNECTED:
  Status bar: Red dot, "Disconnected - Reconnecting..."
  Attempt reconnect every 5s
  Show stale data warning after 30s

OFFLINE:
  Status bar: Gray dot, "Offline"
  Show cached data
  Hide real-time elements
```

### 12.3 Optimistic Updates

```
BEHAVIOR:

User-triggered actions (Phase 2):
1. Update UI immediately
2. Send request to backend
3. On success: Confirm update
4. On failure: Revert UI, show error

System updates:
1. Receive WebSocket message
2. Validate data
3. Apply update with animation
4. Log to activity feed
```

---

## 13. Empty States

### 13.1 No Active Brains

```
+--------------------------------------------------+
|                                                  |
|           [Brain Icon - Sleeping]                |
|                                                  |
|           No brains are active                   |
|                                                  |
|    The system is idle. Start a new task          |
|    to activate the brain fleet.                  |
|                                                  |
|    [Start Task] (Phase 2)                        |
|                                                  |
+--------------------------------------------------+
```

### 13.2 No Tasks

```
+--------------------------------------------------+
|                                                  |
|           [Task Icon - Empty]                    |
|                                                  |
|           No tasks yet                           |
|                                                  |
|    Create your first task to see the             |
|    X2000 brain fleet in action.                  |
|                                                  |
|    [Create Task] (Phase 2)                       |
|                                                  |
+--------------------------------------------------+
```

### 13.3 No Decisions

```
+--------------------------------------------------+
|                                                  |
|           [Decision Icon - Balanced]             |
|                                                  |
|           No decisions recorded                  |
|                                                  |
|    Decisions will appear here as the brains      |
|    collaborate on your project.                  |
|                                                  |
+--------------------------------------------------+
```

### 13.4 No Memory/Patterns

```
+--------------------------------------------------+
|                                                  |
|           [Memory Icon - Empty]                  |
|                                                  |
|           Building intelligence                  |
|                                                  |
|    The system learns from every task.            |
|    Patterns and learnings will appear            |
|    as the fleet completes work.                  |
|                                                  |
|    +----------------------------------+          |
|    | Tip: The more tasks completed,  |          |
|    | the smarter the system becomes. |          |
|    +----------------------------------+          |
|                                                  |
+--------------------------------------------------+
```

---

## 14. Error States

### 14.1 API Error

```
+--------------------------------------------------+
|  [!] Unable to load data                         |
|                                                  |
|  We're having trouble connecting to the server.  |
|  This is usually temporary.                      |
|                                                  |
|  [Retry]                  [Show Details]         |
+--------------------------------------------------+
```

### 14.2 Brain Error

```
+--------------------------------------------------+
|  [!] Engineering Brain encountered an error      |
|                                                  |
|  Task: Build API endpoints                       |
|  Error: Rate limit exceeded                      |
|                                                  |
|  The system will automatically retry.            |
|  Retry attempt: 2/3                              |
|                                                  |
|  [View Full Error]                               |
+--------------------------------------------------+
```

### 14.3 Connection Lost

```
+------------------------------------------------------------------------+
|  [Banner - Top of Screen]                                               |
|  Connection lost. Attempting to reconnect... [Retry Now]                |
+------------------------------------------------------------------------+
```

---

## 15. Implementation Notes

### 15.1 Technology Recommendations

| Layer | Recommendation | Rationale |
|-------|----------------|-----------|
| Framework | Next.js 14 | App router, server components |
| Styling | Tailwind CSS | Design token alignment |
| Components | Radix UI | Accessible primitives |
| State | Zustand | Simple, performant |
| Real-time | Socket.io or Supabase Realtime | WebSocket support |
| Charts | Recharts | If needed for metrics |

### 15.2 File Structure

```
dashboard/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── brains/
│   ├── tasks/
│   ├── decisions/
│   └── memory/
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── NavBar.tsx
│   │   └── Header.tsx
│   ├── brains/
│   │   ├── BrainCard.tsx
│   │   ├── BrainGrid.tsx
│   │   └── BrainCollaboration.tsx
│   ├── tasks/
│   │   ├── TaskTree.tsx
│   │   ├── TaskRow.tsx
│   │   └── TaskProgress.tsx
│   ├── decisions/
│   │   ├── DecisionCard.tsx
│   │   └── DebateThread.tsx
│   ├── memory/
│   │   ├── PatternCard.tsx
│   │   └── MemoryMetrics.tsx
│   └── ui/
│       ├── Badge.tsx
│       ├── Card.tsx
│       ├── Progress.tsx
│       └── ...
├── hooks/
│   ├── useBrains.ts
│   ├── useTasks.ts
│   ├── useDecisions.ts
│   └── useMemory.ts
├── lib/
│   ├── api.ts
│   ├── websocket.ts
│   └── utils.ts
├── styles/
│   └── tokens.css
└── types/
    └── dashboard.ts
```

### 15.3 Data Contracts

```typescript
// Brain Status API
interface BrainStatusResponse {
  brains: {
    type: BrainType;
    state: 'active' | 'warming' | 'idle' | 'cooling' | 'terminated';
    trustLevel: TrustLevel;
    currentTask?: {
      id: string;
      subject: string;
      progress: number;
    };
    metrics: {
      tasksCompleted: number;
      successRate: number;
    };
  }[];
}

// Task Progress API
interface TaskProgressResponse {
  currentOrchestration: {
    id: string;
    subject: string;
    progress: number;
    subtasks: {
      id: string;
      subject: string;
      status: TaskStatus;
      assignedBrain: BrainType;
      duration?: number;
      progress?: number;
    }[];
    estimatedCompletion: Date;
  };
}

// Decision Log API
interface DecisionLogResponse {
  decisions: {
    id: string;
    description: string;
    type: 'consensus' | 'majority' | 'debate' | 'override' | 'escalated';
    participants: BrainType[];
    resolution: string;
    timestamp: Date;
    debate?: Debate;
  }[];
}

// Memory Metrics API
interface MemoryMetricsResponse {
  totalPatterns: number;
  patternReuseRate: number;
  failureAvoidanceRate: number;
  recentPatterns: Pattern[];
  recentLearnings: Learning[];
}
```

---

## 16. Phase 1 Scope Summary

### Included

- Project overview panel (read-only)
- Brain activity visualization (37 brains, tiered display)
- Task progress view (tree structure, status indicators)
- Decision log (debates, resolutions)
- Memory panel (patterns, learnings, metrics)
- Activity feed (real-time events)
- Dark mode design system
- Responsive layout
- Real-time updates via WebSocket
- Accessibility compliance (WCAG AA)

### Excluded (Phase 2+)

- User authentication
- Project creation/editing
- Task creation/management
- Brain configuration
- Manual decision override
- Memory search/filtering
- Settings/preferences
- Notifications
- Keyboard shortcuts
- Light mode

---

## 17. Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial Load | <2s | Time to first meaningful paint |
| Update Latency | <500ms | WebSocket message to UI update |
| Layout Shift | <0.1 | Cumulative Layout Shift |
| Accessibility | 100% | Lighthouse accessibility score |
| Mobile Usability | Usable | All panels accessible on mobile |

---

*GEAR: EXPLORE - This is a design specification document, not a completion claim. No verification required.*

**BRAINS USED:**
- Design Brain: UI/UX specification, visual design system, component library
- Product Brain: Feature scope, user story alignment, success criteria
- Engineering Brain: Technical recommendations, data contracts, implementation notes
