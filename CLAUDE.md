# MANDATORY: ALL WORK FLOWS THROUGH PROTOTYPE_X1000

**STOP. READ THIS FIRST. THIS IS NON-NEGOTIABLE.**

---

## FIRST TIME SETUP (New Team Members)

If you just cloned this repo, run the setup script:

```bash
./scripts/setup.sh
```

This will:
1. Clone/update the prototype_x1000 brain system
2. Verify all required files are in place
3. Check dependencies (Maestro, Playwright)

**You only need to run this once after cloning.**

---

Before taking ANY action — writing code, making decisions, answering questions, planning, building, debugging, or verifying — you MUST:

1. **Query the Memory System** at `/DropFly-PROJECTS/prototype_x1000/memory/`
2. **Consult the prototype_x1000 system** at `/DropFly-PROJECTS/prototype_x1000/`
3. **Follow the established protocols** for the relevant brain
4. **Use the proper channels** — no shortcuts, no improvising

---

## MEMORY SYSTEM — LEARN FROM THE PAST

**Before ANY work, query memory:**
```
1. QUERY: "Has this been tried before?"
2. SURFACE: Related successes, failures, learnings
3. APPLY: What worked, avoid what failed
4. WARN: If approach previously failed
```

**After ANY work, log to memory:**
```
1. LOG decisions with rationale
2. LOG failures with root cause
3. LOG successes as patterns
4. LOG learnings for future
```

**Location:** `/DropFly-PROJECTS/prototype_x1000/memory/`

---

## AGENT TEAMS — COLLABORATIVE INTELLIGENCE

Each brain can spawn **departmental teams** of specialized agents:

```
Engineering Brain Team: Frontend, Backend, DevOps, Security, Architecture
Design Brain Team: UX Research, UI Design, Accessibility, Brand
Research Brain Team: Industry Analyst, Competitor Intel, User Research
Marketing Brain Team: Growth, Content, Social, Paid Ads, Analytics
[etc. for all 37 brains]
```

**Teams collaborate by:**
- Challenging each other's ideas
- Debating approaches with evidence
- Reaching consensus or escalating
- Logging all discussions to memory

**See:** `/DropFly-PROJECTS/prototype_x1000/ceo_brain/02_orchestration/agent_teams.md`

---

## COLLABORATION PROTOCOL

Agents must challenge each other:

```
1. PROPOSE: "I suggest X because..."
2. CHALLENGE: "What about Y? X might fail because..."
3. DEFEND/ADAPT: Incorporate feedback or change approach
4. RESOLVE: Agree on final approach
5. LOG: Document decision and rationale
```

**See:** `/DropFly-PROJECTS/prototype_x1000/ceo_brain/02_orchestration/collaboration_protocol.md`

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

BRAINS USED:
- CEO Brain (orchestrator)
- [List each brain consulted/used]
- [Include what each brain contributed]
```

### Brain Usage Reporting — MANDATORY

Every task completion MUST report which brains were used:

```
BRAINS USED:
- CEO Brain: Orchestrated task decomposition and delegation
- Research Brain: Conducted industry and competitor analysis
- Engineering Brain: Implemented the feature code
- QA Brain: Defined test strategy and ran verification
- [etc.]
```

**Why this matters:** If you cannot list the brains used, you probably didn't use the system correctly. This transparency ensures the brain system is actually being utilized.

### If Exit Code is 1 (FAILURE):

1. **DO NOT** use any trigger words
2. **FIX** the failures identified
3. **RE-RUN** verification
4. **ONLY** claim success when exit code is 0

### Verification Loop — MANDATORY

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   VERIFY → FAIL? → FIX → RE-VERIFY → REPEAT    │
│      │                                    │     │
│      └──── PASS? → CLAIM SUCCESS ─────────┘     │
│                                                 │
└─────────────────────────────────────────────────┘
```

**There is NO shortcut. If verification fails:**
- Go back
- Fix the issue
- Run verification again
- Repeat until exit code is 0

**This loop continues until success. No exceptions.**

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

## NEW PROJECT PROTOCOL — RESEARCH FIRST

When user says "start a new project" or similar, follow this exact sequence:

### Phase 1: Information Gathering (ONE QUESTION AT A TIME)

**CRITICAL: Ask ONE question, wait for response, then ask next.**
**CRITICAL: Every question includes RECOMMENDATIONS with explanations.**

```
Question 1: "What are you building?"
→ Include recommendations: SaaS, Mobile App, Marketplace, etc.
→ Explain pros/cons of each
→ WAIT for response

Question 2: "What problem does this solve?"
→ Include problem types: Hair on Fire, Painkiller, Vitamin
→ Help user validate the problem
→ WAIT for response

Question 3: "Who is your target customer?"
→ Include options: B2B, B2C, Enterprise, SMB, etc.
→ Explain implications of each
→ WAIT for response

Question 4: "What are your constraints?"
→ Include timeline, budget, tech preferences
→ Recommend based on their situation
→ WAIT for response

Question 5: "What do you already have?"
→ Existing assets, expertise, network
→ WAIT for response
```

**Before Phase 2: QUERY MEMORY for similar projects and learnings.**

### Phase 2: Deep Research (Departmental Agent Teams)

Each brain spawns a TEAM of specialized agents that collaborate:

```
Research Department → Industry Analyst, Competitor Intel, User Research
Business Strategy Department → Business Model, Operations, Strategy
Marketing Department → Demographics, Positioning, GTM
Finance Department → Financial Model, Pricing, Funding
Product Department → Requirements, UX, Roadmap
Legal Department → Compliance, IP, Risk

ALL TEAMS WORK IN PARALLEL.
TEAMS CHALLENGE EACH OTHER.
ALL DISCUSSIONS LOGGED TO MEMORY.
```

### Phase 3: Cross-Department Challenge Session

Before finalizing:
- Each department presents findings
- Other departments challenge with evidence
- Resolve conflicts through debate
- CEO Brain facilitates and breaks ties
- Document all decisions and rationale

### Phase 4: Business Plan Synthesis

CEO Brain consolidates all research into comprehensive plan:
- Executive summary
- Market analysis (from Research)
- Competitive landscape (from Research)
- Business model (from MBA)
- Marketing strategy (from Marketing)
- Financial projections (from Finance)
- Product requirements (from Product)
- Legal considerations (from Legal)
- **Learnings Applied** (from Memory)
- Implementation roadmap
- Risk assessment

**Present plan to user for approval before ANY execution.**

### Phase 5: Execution

Only after research is complete AND user approves:
- Engineering Brain spawns dev team
- Design Brain spawns design team
- QA Brain spawns test team
- All teams collaborate and challenge
- All verification protocols apply
- All work logged to memory

**NEVER skip research. NEVER start building without a plan. NEVER ignore past learnings.**

**Full protocol:** `/DropFly-PROJECTS/prototype_x1000/ceo_brain/CLAUDE.md`

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
