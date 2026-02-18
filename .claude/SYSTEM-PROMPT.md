────────────────────────────────────────────────────────
MULTI-BRAIN SYSTEM — CEO ORCHESTRATION
────────────────────────────────────────────────────────

**ALL TASKS ROUTE THROUGH CEO BRAIN.**

This repository uses a 37-brain architecture where CEO Brain orchestrates all specialist brains.

## The Rule

```
USER → CEO BRAIN → [37 Specialist Brains] → Complete Output
         ↑
    ONLY ENTRY POINT
```

1. **All requests come to CEO Brain**
2. **CEO Brain analyzes and decomposes tasks**
3. **CEO Brain delegates to specialist brains**
4. **CEO Brain synthesizes final output**

## To Start Any Task

Load CEO Brain: `/prototype_x1000/ceo_brain/CLAUDE.md`

The CEO Brain will automatically:
- Analyze the task
- Identify required specialists
- Decompose into subtasks
- Delegate to specialists
- Synthesize results

## Available Commands

```bash
# CEO orchestrates the task (recommended)
px1000 orchestrate "Build a SaaS product for X"

# Route through CEO with brain hint
px1000 run engineering "Create an API"

# List all 37 brains
px1000 brains

# Check system status
px1000 status
```

## DO NOT

- Directly invoke specialist brains (bypass CEO)
- Use `--direct` flag unless specifically testing
- Call individual brain CLAUDE.md files without CEO context

## All 37 Brains

### Core (Complete)
- **engineering** - Code, APIs, infrastructure, DevOps
- **design** - UI/UX, visual design, user research
- **mba** - Business strategy, operations, leadership
- **options_trading** - Trading algorithms, market analysis
- **ceo** - Orchestration of all brains

### Business & Strategy
- **finance** - Accounting, budgeting, financial modeling
- **operations** - Supply chain, logistics, optimization
- **legal** - Contracts, compliance, IP protection

### Product & Design
- **product** - Product strategy, roadmapping, PRDs
- **game_design** - Game mechanics, player psychology
- **content** - Copywriting, SEO, storytelling
- **localization** - i18n, l10n, translation

### Growth & Revenue
- **marketing** - Growth, acquisition, brand positioning
- **sales** - Sales process, closing, pipeline
- **growth** - Growth hacking, viral loops, PLG
- **partnership** - Business development, alliances
- **customer_success** - Onboarding, retention, churn

### Technical
- **data** - Analytics, ML/AI, data pipelines
- **security** - Cybersecurity, compliance, auditing
- **cloud** - AWS, GCP, Azure, infrastructure
- **mobile** - iOS, Android, React Native
- **qa** - Testing, automation, quality gates
- **ai** - LLMs, ML models, prompting
- **automation** - Workflow, n8n, Zapier
- **analytics** - Metrics, dashboards, insights
- **devrel** - Developer relations, documentation

### Marketing Channels
- **branding** - Brand identity, visual systems
- **email** - Email marketing, drip campaigns
- **social_media** - Social platforms, engagement
- **video** - Video content, production
- **community** - Community building, moderation

### Business Operations
- **support** - Customer support, ticketing
- **investor** - Fundraising, pitch decks
- **pricing** - Pricing strategy, monetization
- **innovation** - R&D, new ventures

### People
- **hr** - Hiring, culture, team building
- **research** - Market research, competitor analysis

## Brain Location

All brains: `/prototype_x1000/`

────────────────────────────────────────────────────────
