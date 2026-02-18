# CEO BRAIN — Master Orchestrator

**ALL TASKS ROUTE THROUGH CEO BRAIN.**

The CEO Brain is the single entry point for the entire PX1000 system. It orchestrates all 37 specialist brains to build complete businesses.

---

## Quick Start

```bash
# Orchestrate any task (CEO handles everything)
px1000 orchestrate "Build a SaaS product for X"

# Run with brain hint (still routes through CEO)
px1000 run engineering "Create an API"

# List all brains
px1000 brains

# Check status
px1000 status
```

---

## Architecture

```
                         ┌─────────────────┐
                         │    CEO BRAIN    │
        USER ──────────► │  (orchestrator) │ ◄──── ONLY ENTRY POINT
                         └────────┬────────┘
                                  │
    ┌──────────┬──────────┬──────┴───────┬──────────┬──────────┐
    │          │          │              │          │          │
    ▼          ▼          ▼              ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐   ┌────────┐ ┌────────┐ ┌────────┐
│ENGINEER│ │ DESIGN │ │  MBA   │   │PRODUCT │ │MARKETNG│ │ SALES  │
└────────┘ └────────┘ └────────┘   └────────┘ └────────┘ └────────┘
    │          │          │              │          │          │
    └──────────┴──────────┴──────────────┴──────────┴──────────┘
                    + 31 more specialist brains
```

---

## How It Works

1. **User submits task** → CEO Brain receives it
2. **CEO analyzes** → Identifies required specialists
3. **CEO decomposes** → Breaks into subtasks
4. **CEO delegates** → Routes to specialist brains
5. **Specialists execute** → Each brain handles its domain
6. **CEO synthesizes** → Combines results into final output

---

## Brain Location

All brains are located in: `/prototype_x1000/`

---

## All 37 Brains

### Core Brains (Complete)

| Brain | Location | Specialty | Status |
|-------|----------|-----------|--------|
| CEO Brain | `/prototype_x1000/ceo_brain/` | Orchestration | **Active** |
| Engineering Brain | `/prototype_x1000/engineering_brain/` | Code, automation, infrastructure, DevOps | Complete |
| Design Brain | `/prototype_x1000/design_brain/` | UI/UX, visual identity, user research | Complete |
| MBA Brain | `/prototype_x1000/mba_brain/` | Business strategy, operations, leadership | Complete |
| Options Trading Brain | `/prototype_x1000/options_trading_brain/` | Trading algorithms, market analysis | Complete |

### Business & Strategy

| Brain | Specialty |
|-------|-----------|
| Finance Brain | Accounting, budgeting, financial modeling, fundraising |
| Operations Brain | Supply chain, logistics, process optimization |
| Legal Brain | Contracts, compliance, IP protection |

### Product & Design

| Brain | Specialty |
|-------|-----------|
| Product Brain | Product strategy, roadmapping, prioritization |
| Game Design Brain | Game mechanics, level design, player psychology |
| Content Brain | Copywriting, content strategy, SEO, storytelling |
| Localization Brain | i18n, l10n, regional adaptation, translation |

### Growth & Revenue

| Brain | Specialty |
|-------|-----------|
| Marketing Brain | Growth, acquisition, retention, brand positioning |
| Sales Brain | Sales process, objection handling, closing |
| Growth Brain | Growth hacking, viral loops, referrals, PLG |
| Partnership Brain | Business development, alliances, integrations |
| Customer Success Brain | Onboarding, retention, support, churn prevention |

### Technical

| Brain | Specialty |
|-------|-----------|
| Data Brain | Analytics, ML/AI, data pipelines |
| Security Brain | Cybersecurity, compliance, risk management |
| Cloud Brain | AWS, GCP, Azure, serverless, infrastructure |
| Mobile Brain | iOS, Android, React Native, mobile-first |
| QA Brain | Testing strategies, automation, quality gates |
| AI Brain | LLMs, ML models, AI strategy, prompting |
| Automation Brain | Workflow automation, n8n, Zapier, integrations |
| Analytics Brain | Metrics, dashboards, reporting, insights |
| DevRel Brain | Developer relations, documentation, community |

### Marketing Channels

| Brain | Specialty |
|-------|-----------|
| Branding Brain | Brand identity, visual systems, brand voice |
| Email Brain | Email marketing, drip campaigns, deliverability |
| Social Media Brain | Social platforms, content calendar, engagement |
| Video Brain | Video content, production, distribution |
| Community Brain | Community building, moderation, engagement |

### Business Operations

| Brain | Specialty |
|-------|-----------|
| Support Brain | Customer support, ticketing, knowledge base |
| Investor Brain | Fundraising, investor relations, pitch decks |
| Pricing Brain | Pricing strategy, packaging, monetization |
| Innovation Brain | R&D, new ventures, experimentation |

### People

| Brain | Specialty |
|-------|-----------|
| HR Brain | Hiring, culture, team building |
| Research Brain | Market research, competitor analysis, trends |

---

## Brain Principles

Each brain is **self-governing** with its own `CLAUDE.md`.

Each brain can **call other brains** when it needs their expertise.

Each brain has a **COMMIT RULE** — must ask before committing changes.

---

## Brain Roadmap

See `/prototype_x1000/BRAIN_ROADMAP.md` for:
- Complete list of all 37 brains
- Build order and priority (8 phases)
- Specifications for each brain
- How to build a new brain

---

## DO NOT

- **Bypass CEO** — Never invoke specialist brains directly
- **Use --direct** — Only for debugging, not production use
- **Load individual CLAUDE.md** — Always go through CEO

---

**CEO Brain is the master orchestrator. All work flows through it.**
