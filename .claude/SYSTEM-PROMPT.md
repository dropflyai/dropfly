────────────────────────────────────────────────────────
MULTI-BRAIN SYSTEM — SPECIALIST ORCHESTRATION
────────────────────────────────────────────────────────

This repository uses a **multi-brain architecture** where specialist brains handle different domains.

All brains are located in: `/prototype_x1000/`

## Brain System

Each brain is **self-governing** with its own `CLAUDE.md` that defines:
- Authority hierarchy
- Execution rules
- Quality gates
- Memory/learning system
- Ability to call other brains
- COMMIT RULE (ask before committing)

## Available Brains (37 Total)

### Core Brains (Complete)

#### Engineering Brain (`/prototype_x1000/engineering_brain/`)
**Governs:** Code, automation, infrastructure, testing, DevOps
**Instructions:** `/prototype_x1000/engineering_brain/CLAUDE.md`
**Use when:** Building, deploying, or maintaining software

#### Design Brain (`/prototype_x1000/design_brain/`)
**Governs:** UI/UX, visual identity, user research, accessibility
**Instructions:** `/prototype_x1000/design_brain/CLAUDE.md`
**Use when:** Designing interfaces, user experiences, or visual systems

#### Options Trading Brain (`/prototype_x1000/options_trading_brain/`)
**Governs:** Trading algorithms, market analysis, options strategies
**Instructions:** `/prototype_x1000/options_trading_brain/CLAUDE.md`
**Use when:** Building trading systems or analyzing markets

#### MBA Brain (`/prototype_x1000/mba_brain/`)
**Governs:** Business strategy, operations, leadership, finance, marketing
**Instructions:** `/prototype_x1000/mba_brain/CLAUDE.md`
**Use when:** Strategic decisions, business planning, organizational design

### CEO Brain (`/prototype_x1000/ceo_brain/` - Placeholder)
**Governs:** Orchestration of all brains
**Status:** Under development
**Future:** Will coordinate multi-brain workflows to build complete businesses

### Placeholder Brains (33 remaining)

**Business & Strategy:**
- Finance Brain, Operations Brain, Legal Brain

**Product & Design:**
- Product Brain, Game Design Brain, Content Brain, Localization Brain

**Growth & Revenue:**
- Marketing Brain, Sales Brain, Growth Brain, Partnership Brain, Customer Success Brain

**Technical:**
- Data Brain, Security Brain, Cloud Brain, Mobile Brain, QA Brain
- AI Brain, Automation Brain, Analytics Brain, DevRel Brain

**Marketing Channels:**
- Branding Brain, Email Brain, Social Media Brain, Video Brain, Community Brain

**Business Operations:**
- Support Brain, Investor Brain, Pricing Brain, Innovation Brain

**People:**
- HR Brain, Research Brain

## How Brains Interact

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   DESIGN BRAIN ←────────────────────────→ ENGINEERING BRAIN │
│        │                                         │          │
│        │    "Need help with layout"              │          │
│        │    ────────────────────────→            │          │
│        │                                         │          │
│        │    "Need help with component patterns"  │          │
│        │    ←────────────────────────            │          │
│        │                                         │          │
│        └───────────── ↕ ─────────────────────────┘          │
│                       │                                     │
│                       ▼                                     │
│              OTHER SPECIALIST BRAINS                        │
│         (MBA, Marketing, Sales, Game Design, etc.)          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Execution Rules

1. **Identify the right brain** for the task
2. **Consult that brain's CLAUDE.md** before starting
3. **Follow that brain's authority hierarchy**
4. **Call other brains** when their expertise is needed
5. **Log to memory** after completing significant work
6. **COMMIT after every change** — ask user before committing

## When Multiple Brains Apply

If a task spans multiple domains:
1. Identify the **primary brain** (where most work happens)
2. Start with that brain's CLAUDE.md
3. Call secondary brains as needed for their expertise
4. Each brain maintains its own quality gates

## Brain Roadmap

See `/prototype_x1000/BRAIN_ROADMAP.md` for:
- Full list of all 37 brains
- Build order and priority
- Specifications for each brain
- How to build new brains

────────────────────────────────────────────────────────
