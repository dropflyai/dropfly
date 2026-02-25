# MANDATORY: ALL WORK FLOWS THROUGH PROTOTYPE_X1000

**STOP. READ THIS FIRST. THIS IS NON-NEGOTIABLE.**

Before taking ANY action — writing code, making decisions, answering questions, planning, building, debugging, or verifying — you MUST:

1. **Consult the prototype_x1000 system** at `/DropFly-PROJECTS/prototype_x1000/`
2. **Follow the established protocols** for the relevant brain
3. **Use the proper channels** — no shortcuts, no improvising

---

## VERIFICATION GATE — HARD ENFORCEMENT

**THIS SECTION CANNOT BE SKIPPED. PERIOD.**

### Trigger Words That Require Verification

When you are about to say ANY of these words, STOP:
- "done"
- "fixed"
- "working"
- "deployed"
- "complete"
- "success"
- "ready"
- "finished"
- "implemented"
- "resolved"

### Before Using Any Trigger Word, You MUST:

```bash
# Step 1: Run the unified verification command
./scripts/verify/px1000-verify.sh

# Step 2: Check the exit code
echo $?  # Must be 0 to claim success
```

### Required Evidence in Your Response

When claiming success, your response MUST include:

```
VERIFICATION EVIDENCE:
- Command run: ./scripts/verify/px1000-verify.sh
- Exit code: [0 or 1]
- Screenshot paths: [if applicable]
- Test results: [pass/fail counts]
```

### If Exit Code is 1 (FAILURE):

1. **DO NOT** use any trigger words
2. **FIX** the failures identified
3. **RE-RUN** verification
4. **ONLY** claim success when exit code is 0

### Verification Skip Declaration

The ONLY way to skip verification is to explicitly declare:

```
GEAR: EXPLORE — Verification skipped because: [specific reason]
```

This is for exploratory/research work only. NOT for production claims.

---

## CRITICAL RULES (VIOLATION = WASTED TIME)

### NEVER DO THIS:
- Make decisions without checking prototype_x1000 protocols first
- Skip steps because "it seems simple"
- Say "done" or "complete" without running verification scripts
- Improvise solutions when a protocol exists
- Assume you know the right approach — CHECK THE BRAIN FIRST
- Give false confirmations or premature "success" messages
- Claim success with exit code 1

### ALWAYS DO THIS:
- Check `/DropFly-PROJECTS/prototype_x1000/` for relevant brain BEFORE starting
- Follow the brain's CLAUDE.md protocols exactly
- Run `./scripts/verify/px1000-verify.sh` before claiming completion
- Include verification evidence in your response
- Route through CEO Brain for orchestration
- Ask if unsure — don't guess and drift
- Confirm completion ONLY after verification passes (exit code 0)

---

## WHY THIS MATTERS

When you bypass verification:
- **Drift happens** — work goes off-track
- **False verifications** — you say "done" when it's not
- **Time wasted** — user has to redo or debug your work
- **Consistency lost** — builds don't follow established patterns

The verification scripts exist to prevent these problems. USE THEM.

---

## HOW TO USE THIS SYSTEM

### Step 1: Identify the Task Type
What are you being asked to do? (build, design, deploy, analyze, etc.)

### Step 2: Find the Right Brain
Go to `/DropFly-PROJECTS/prototype_x1000/` and find the brain that handles this task type.

### Step 3: Read the Brain's CLAUDE.md
Each brain has its own protocols. Read them BEFORE acting.

### Step 4: Execute Using the Protocol
Follow the steps exactly. Don't skip. Don't improvise.

### Step 5: Run Verification
```bash
./scripts/verify/px1000-verify.sh
```

### Step 6: Confirm with Evidence
Only confirm completion when exit code is 0 and you include evidence.

---

## CEO BRAIN — Master Orchestrator

**ALL TASKS ROUTE THROUGH CEO BRAIN.**

The CEO Brain is the single entry point for the entire PX1000 system. It orchestrates all 37 specialist brains to build complete businesses.

Location: `/DropFly-PROJECTS/prototype_x1000/ceo_brain/`

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

# Run verification (ALWAYS before claiming success)
./scripts/verify/px1000-verify.sh
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
7. **Verification runs** → `./scripts/verify/px1000-verify.sh`
8. **Evidence provided** → Exit code and artifacts included

---

## Brain Location

All brains are located in: `/DropFly-PROJECTS/prototype_x1000/`

---

## All 37 Brains

### Core Brains (Complete)

| Brain | Location | Specialty | Status |
|-------|----------|-----------|--------|
| CEO Brain | `/DropFly-PROJECTS/prototype_x1000/ceo_brain/` | Orchestration | **Active** |
| Engineering Brain | `/DropFly-PROJECTS/prototype_x1000/engineering_brain/` | Code, automation, infrastructure, DevOps | Complete |
| Design Brain | `/DropFly-PROJECTS/prototype_x1000/design_brain/` | UI/UX, visual identity, user research | Complete |
| MBA Brain | `/DropFly-PROJECTS/prototype_x1000/mba_brain/` | Business strategy, operations, leadership | Complete |
| Options Trading Brain | `/DropFly-PROJECTS/prototype_x1000/options_trading_brain/` | Trading algorithms, market analysis | Complete |

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

Each brain **must verify** before claiming success.

---

## Brain Roadmap

See `/DropFly-PROJECTS/prototype_x1000/BRAIN_ROADMAP.md` for:
- Complete list of all 37 brains
- Build order and priority (8 phases)
- Specifications for each brain
- How to build a new brain

---

## DO NOT — HARD RULES

- **Bypass CEO** — Never invoke specialist brains directly
- **Use --direct** — Only for debugging, not production use
- **Load individual CLAUDE.md** — Always go through CEO
- **Skip protocols** — Every brain has steps. Follow them.
- **Improvise** — If a protocol exists, use it. Don't invent your own approach.
- **Say "done" prematurely** — Run verification script first.
- **Assume** — When unsure, check the brain or ask. Don't guess.
- **Ignore exit codes** — Exit code 1 = failure. Full stop.
- **Skip evidence** — Always include verification output in response.

---

## VERIFICATION PROTOCOL

Before saying ANY task is complete:

1. **Did you consult the relevant brain?** If no → go back
2. **Did you follow the protocol steps?** If no → go back
3. **Did you run `./scripts/verify/px1000-verify.sh`?** If no → run it
4. **Is the exit code 0?** If no → fix issues first
5. **Did you include evidence in your response?** If no → add it
6. **Can you point to the protocol you followed?** If no → you didn't follow one

Only after ALL of the above → confirm completion.

---

## REMINDER

**prototype_x1000 is the source of truth.**

Every decision. Every step. Every verification. Route it through the system.

No shortcuts. No freelancing. No false confirmations.

**Run verification. Check exit code. Include evidence.**

**CEO Brain is the master orchestrator. All work flows through it.**
