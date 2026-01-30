# Brain Architecture v1.0

**Brains = Frozen Guidance Systems**
**Projects = Where All Data Lives**

---

## Core Principle

Brains are **read-only instruction sets** that guide the agent's behavior. They never store project data. All work products, decisions, and learnings are stored in project folders and the shared database.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         BRAINS                                   │
│                  (FROZEN / READ-ONLY)                           │
│                                                                  │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│   │ ENGINEERING  │  │    DESIGN    │  │     MBA      │          │
│   │    BRAIN     │  │    BRAIN     │  │    BRAIN     │          │
│   │              │  │              │  │              │          │
│   │  Rules only  │  │  Rules only  │  │  Rules only  │          │
│   │  No data     │  │  No data     │  │  No data     │          │
│   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│          │                 │                 │                   │
│          └─────────────────┼─────────────────┘                   │
│                            │                                     │
│                      READS RULES                                 │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AGENT (Claude)                                │
│                                                                  │
│   1. Reads brain rules (guidance)                               │
│   2. Reads project data (context)                               │
│   3. Makes decisions (brain rules + project context)            │
│   4. Writes output → PROJECT folder                             │
│   5. Logs experience → DATABASE                                 │
│                                                                  │
└────────────────────────────┼────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│    PROJECT FOLDERS       │   │    SHARED DATABASE       │
│    (All data lives       │   │    (Supabase)            │
│     here)                │   │                          │
│                          │   │  - experiences           │
│  DropFly-PROJECTS/       │   │  - decisions             │
│  ├── tradefly/           │   │  - patterns              │
│  │   ├── docs/           │   │  - cross_project         │
│  │   ├── memory/         │◄─►│    learnings             │
│  │   └── src/            │   │                          │
│  └── pdf-editor/         │   │  All brains can          │
│      └── ...             │   │  READ this to make       │
│                          │   │  better decisions        │
└──────────────────────────┘   └──────────────────────────┘
```

---

## Component States

| Component | State | Purpose |
|-----------|-------|---------|
| **Brains** | FROZEN | Guidance, rules, protocols — never stores project data |
| **Projects** | ACTIVE | All work products, configs, project-specific memory |
| **Database** | ACTIVE | Shared learning across all projects |

---

## What Brains Contain (Frozen)

```
prototype_x1000/
├── engineering_brain/
│   ├── CLAUDE.md                # Identity + rules
│   ├── Constitution.md          # Laws
│   ├── Checklist.md             # Gates
│   ├── protocols/               # How to do things
│   ├── patterns/                # Reusable approaches
│   └── anti-patterns/           # What NOT to do
│
│   ❌ NO project-specific data
│   ❌ NO experience logs from projects
│   ❌ NO decisions from projects
│
├── design_brain/
│   ├── CLAUDE.md
│   ├── Patterns/
│   ├── Tokens/
│   └── ...
│
├── mba_brain/
│   ├── CLAUDE.md
│   └── [modules]/
│
└── [other brains]/
```

**Brains are updated RARELY and only to improve the rules themselves, not to store project data.**

---

## What Projects Contain (Active)

```
DropFly-PROJECTS/
└── [project-name]/
    ├── credentials/             # Secrets for this project
    │   ├── .env.example         # ✅ Committed - template
    │   ├── .env.local           # ❌ Never commit
    │   └── KEYS.md              # ✅ Documents keys
    ├── docs/                    # Project documentation
    │   ├── PRD.md               # Requirements
    │   └── architecture.md      # Technical design
    ├── memory/                  # PROJECT-SPECIFIC learning
    │   ├── decisions.md         # ADRs for this project
    │   ├── failures.md          # What didn't work
    │   └── patterns.md          # What worked
    ├── src/                     # Source code
    ├── tests/                   # Tests
    ├── package.json
    └── README.md
```

---

## The Workflow

```
1. Task arrives: "Add dark mode to TradeFly"

2. Agent READS (no writes to brains):
   - engineering_brain/CLAUDE.md     → How to engineer
   - design_brain/CLAUDE.md          → How to design UI
   - DropFly-PROJECTS/tradefly/      → Project context
   - Database: shared_experiences    → Past learnings

3. Agent WORKS:
   - Follows brain rules
   - Uses project context
   - Makes decisions

4. Agent WRITES (to project, never to brain):
   - Code        → tradefly/src/
   - Docs        → tradefly/docs/
   - Decision    → tradefly/memory/decisions.md

5. Agent LOGS (to database):
   - Experience  → shared_experiences table
   - Pattern     → shared_patterns table (if reusable)

6. BRAINS STAY FROZEN
   - No data saved to brains
   - Brain rules unchanged
```

---

## Database Schema (Shared Learning)

### 3-Tier Architecture

The unified brain memory system uses a 3-tier table structure:

```
TIER 1: UNIVERSAL TABLES (All 37 brains)
├── shared_experiences    → Task outcomes, learnings
├── shared_patterns       → Reusable solutions
└── shared_failures       → Failures + post-mortems

TIER 2: BRAIN-SPECIFIC TABLES
├── Design Brain
│   ├── design_dna        → Extracted design languages
│   ├── design_references → Reference images + teardowns
│   ├── design_ux_scores  → UX score evaluations
│   └── design_style_decisions → Typography, color, etc.
├── Engineering Brain
│   ├── eng_architecture_decisions → ADRs
│   └── eng_tech_debt     → Technical debt tracking
├── Product Brain
│   ├── product_features  → Feature specifications
│   └── product_user_research → User research findings
├── Trading Brain
│   ├── trading_strategies → Strategy definitions
│   └── trading_signals   → Trade signals + outcomes
└── MBA Brain
    ├── mba_strategic_decisions → Business decisions
    └── mba_competitor_analysis → Competitor intel

TIER 3: ORCHESTRATION (CEO Brain)
├── ceo_task_delegations  → Task routing
├── ceo_brain_collaborations → Multi-brain workflows
└── ceo_conflict_resolutions → Conflict resolution logs
```

### Setup Instructions

**Full migration file:** `unified-brain-memory-migration.sql`
**Credentials location:** `credentials/`

```bash
# Setup Supabase credentials
cp credentials/.env.template credentials/.env
# Edit with your Supabase project values

# Run migration
./run-brain-migration.sh
```

### Example Queries

```sql
-- All projects log here, all brains can read via agent

-- "What dark mode failures have we seen?"
SELECT * FROM shared_experiences
WHERE tags @> ARRAY['dark-mode']
AND category = 'failure';

-- "What patterns has design brain identified?"
SELECT * FROM shared_experiences
WHERE brain_type = 'design'
AND category = 'pattern';

-- "Recent learnings for this project"
SELECT * FROM shared_experiences
WHERE project_id = 'tradefly'
ORDER BY created_at DESC
LIMIT 10;

-- "Design DNA for recent projects"
SELECT project_name, grid_system, typography_scale, color_tokens
FROM design_dna
ORDER BY created_at DESC
LIMIT 5;

-- "Unresolved tech debt"
SELECT * FROM eng_tech_debt
WHERE status = 'identified'
ORDER BY priority_score DESC;
```

---

## Data Flow Summary

| What | Where It Lives | Who Writes | Who Reads |
|------|----------------|------------|-----------|
| Brain rules | `prototype_x1000/[brain]/` | Humans (rare) | Agent |
| Project code | `DropFly-PROJECTS/[project]/src/` | Agent | Agent |
| Project docs | `DropFly-PROJECTS/[project]/docs/` | Agent | Agent |
| Project memory | `DropFly-PROJECTS/[project]/memory/` | Agent | Agent |
| Shared learning | Database (Supabase) | Agent | Agent (for all brains) |

---

## Inter-Brain Communication

Brains don't talk directly to each other. Instead:

1. **Agent reads multiple brains** when task requires it
2. **Agent synthesizes** guidance from all relevant brains
3. **Agent logs to database** what was learned
4. **Next task** benefits from shared learning

```
Task: "Design a trading dashboard"

Agent reads:
├── engineering_brain  → Technical constraints
├── design_brain       → UI/UX patterns
├── mba_brain          → Business requirements
└── options_trading_brain → Domain knowledge

Agent synthesizes → Makes decisions → Writes to project → Logs to database
```

---

## CEO Brain Role (Future)

When implemented, CEO Brain will:

1. **Route tasks** to appropriate specialist brain(s)
2. **Orchestrate** multi-brain workflows
3. **Resolve conflicts** between brain recommendations
4. **Query database** for relevant past experiences
5. **Ensure consistency** across project decisions

CEO Brain is still frozen (rules only), but its rules govern how to combine other brains.

---

## Agent Runtime Layer (NEW)

The brain system now includes a **runtime agent layer** powered by Anthropic SDK.
Agents read frozen brain guidance and execute tasks autonomously.

### Agent Architecture

```
USER REQUEST
     │
     ▼
┌─────────────┐
│  CEO AGENT  │  ← Orchestrator (claude-opus-4)
└──────┬──────┘
       │ tool_use calls
   ┌───┼───┬───────────┐
   │   │   │           │
   ▼   ▼   ▼           ▼
┌────┐┌────┐┌────┐ ┌──────────┐
│ENG ││DES ││MBA │ │BRAIN     │
│    ││    ││    │ │BUILDER   │
└─┬──┘└─┬──┘└─┬──┘ └────┬─────┘
  │     │     │          │
  └─────┴─────┴──────────┘
              │
              ▼
      ┌───────────────┐
      │   SUPABASE    │
      │ (auto-logged) │
      └───────────────┘
```

### Agent Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **BaseAgent** | `agents/core/` | Base class with brain loading + tools |
| **CEOAgent** | `agents/ceo/` | Orchestrator using claude-opus-4 |
| **EngineeringAgent** | `agents/specialists/` | Code, APIs, infrastructure |
| **DesignAgent** | `agents/specialists/` | UI/UX, visual design |
| **MBAAgent** | `agents/specialists/` | Business strategy |
| **BrainBuilderAgent** | `agents/brain_builder/` | Meta-agent for new brains |
| **AutoLogger** | `agents/memory/` | Automatic task logging |
| **PatternExtractor** | `agents/memory/` | Extract patterns from experiences |

### Model Selection

| Agent | Model | Reason |
|-------|-------|--------|
| CEO | claude-opus-4 | Best reasoning for orchestration |
| Specialists | claude-sonnet-4 | Cost-effective execution |
| Brain Builder | claude-opus-4 | Complex generation tasks |

### Agent Database Tables

```sql
-- Track agent executions
agent_runs (id, agent_type, task_input, task_output, success, tool_calls, tokens_used)

-- Track brain generation
brain_builds (id, brain_name, validation_passed, files_created)

-- Track CEO routing
ceo_task_delegations (id, task_input, decomposed_tasks, delegated_to, success)

-- Track multi-agent workflows
ceo_brain_collaborations (id, parent_agent, child_agent, task_description, success)
```

### Usage

**CLI:**
```bash
px1000 orchestrate "Build a landing page"
px1000 run engineering "Create REST API"
px1000 build-brain product -d "product management" -c "Roadmapping"
```

**Python:**
```python
from prototype_x1000.agents import CEOAgent, EngineeringAgent

ceo = CEOAgent()
result = ceo.orchestrate("Build a landing page with signup form")
```

**MCP Server:**
Add to Claude Desktop config for direct tool access.

See `agents/README.md` for full documentation.

---

## Why This Architecture

| Benefit | Explanation |
|---------|-------------|
| **Brains stay focused** | No project data clutters the guidance |
| **Projects are self-contained** | All context in one folder |
| **Learning is shared** | Database enables cross-project insights |
| **Easy to update brains** | Change rules without touching project data |
| **Easy to archive projects** | Move folder, data moves with it |
| **Scalable** | Add new brains without restructuring |

---

## Rules

1. **NEVER write project data to brain folders**
2. **ALWAYS write project outputs to project folders**
3. **ALWAYS log significant experiences to database**
4. **Brains are updated only to improve rules, not to store data**
5. **Projects contain their own memory/ folder for project-specific learnings**

---

**This architecture is binding for all brain operations.**
