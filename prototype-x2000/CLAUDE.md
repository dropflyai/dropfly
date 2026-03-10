# ⛔ MANDATORY PRE-FLIGHT — READ FIRST

**Before ANY work on this project, you MUST:**

1. **Check `manifest.json`** for current system stats (brains, providers, channels, tools)
2. **Route through CEO Brain** at `src/brains/ceo/`
3. **Query Memory** via the memory system at `src/memory/`
4. **Follow brain protocols** — No freelancing, no shortcuts

**X2000 contains 44 specialized brains with PhD-level expertise across all domains.**

> **NOTE:** X2000 is now the SINGLE SOURCE OF TRUTH. All brains from prototype_x1000 have been merged here.

---

# PROTOTYPE X2000 — Autonomous Business-Building AI Fleet

> **Better. Smarter. Faster than OpenClaw.**

---

## Identity

X2000 is an **autonomous AI fleet** that builds billion-dollar businesses. It contains **44 specialized brains** and includes:

- **Forever-Learning Memory** — Patterns, skills, and learnings persist and improve
- **Brain Tension Protocol** — Structured debate produces better decisions
- **Earned Autonomy** — Trust levels expand based on proven performance
- **5-Layer Guardrails** — Safety without paralysis
- **Skill Pooling** — Cross-brain knowledge transfer

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PROTOTYPE X2000                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                        CEO BRAIN                                │     │
│  │   Orchestration │ Task Decomposition │ Conflict Resolution     │     │
│  └────────────────────────────────────────────────────────────────┘     │
│         │                    │                    │                      │
│         ▼                    ▼                    ▼                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │ ENGINEERING  │    │  MARKETING   │    │   FINANCE    │   + 41 more  │
│  │    BRAIN     │◄──►│    BRAIN     │◄──►│    BRAIN     │              │
│  └──────────────┘    └──────────────┘    └──────────────┘              │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                    FOREVER MEMORY                               │     │
│  │  Patterns │ Learnings │ Decisions │ Skills │ Failures          │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                    5-LAYER GUARDRAILS                           │     │
│  │  Input │ Action │ Runtime │ Visibility │ Escalation            │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## MANDATORY: Route Through CEO Brain

**ALL WORK FLOWS THROUGH CEO BRAIN. NO EXCEPTIONS.**

Before ANY action:
1. CEO Brain receives the task
2. CEO decomposes into brain-specific subtasks
3. CEO delegates to specialist brains
4. Brains collaborate via Brain Tension Protocol
5. CEO synthesizes results
6. Guardrails verify before completion

```
USER REQUEST → CEO BRAIN → DECOMPOSE → DELEGATE → COLLABORATE → SYNTHESIZE → VERIFY → DELIVER
```

---

## Earned Autonomy (Trust Levels)

Brains start with limited permissions and earn more through performance.

| Level | Permissions | Requirements to Reach |
|-------|-------------|----------------------|
| **1** | Read, Analyze | Default for new brains |
| **2** | + Write, Draft | 10 tasks, 90% success, 1+ day |
| **3** | + Commit, Deploy | 25 tasks, 92% success, 7+ days |
| **4** | Full Autonomy | 50 tasks, 95% success, 30+ days |

**CEO Brain starts at Level 4.**

### Trust Violations

| Severity | Impact |
|----------|--------|
| Minor | Warning only |
| Major | -5 task credits |
| Critical | -20 credits + immediate downgrade |

---

## 5-Layer Guardrails

Every action passes through 5 safety layers:

| Layer | Name | Function |
|-------|------|----------|
| **1** | Input Validation | Sanitize inputs, block injection |
| **2** | Action Control | Permission check per trust level |
| **3** | Runtime Governance | Rate limits, error thresholds |
| **4** | Reasoning Visibility | Audit log for all decisions |
| **5** | Bounded Escalation | Human-in-the-loop for high stakes |

### Escalation Triggers

- `delete` or `external` actions at trust < 4
- Production/main branch targets
- Operations affecting 100+ items
- Credential or secret access

---

## Brain Tension Protocol

When multiple brains are involved, they **debate** to reach better decisions.

### The PROPOSE → CHALLENGE → RESOLVE Cycle

```
1. PROPOSE: Brain A suggests approach with evidence
2. CHALLENGE: Brain B questions assumptions or risks
3. DEFEND: Brain A responds with additional evidence
4. CONCEDE or COUNTER: Continue until resolved
5. RESOLVE: CEO Brain makes final call if no consensus
6. LOG: Decision and rationale stored in memory
```

### Consensus Threshold

- **70%+ agreement** = Consensus reached
- **< 70%** = CEO Brain resolves with documented rationale

---

## Forever-Learning Memory

X2000 doesn't just remember — it **learns**.

### Memory Categories

| Type | What It Stores | How It's Used |
|------|----------------|---------------|
| **Patterns** | Successful solutions | Applied to similar problems |
| **Learnings** | Insights from outcomes | Guide future decisions |
| **Anti-Patterns** | What failed and why | Avoid repeating mistakes |
| **Skills** | Reusable capabilities | Shared across brains |
| **Decisions** | All choices + rationale | Audit trail + learning |

### Pre-Task Query (MANDATORY)

Before ANY task:
```
1. QUERY memory for similar past work
2. SURFACE relevant patterns (successes and failures)
3. APPLY learnings to current approach
4. WARN if red flags from past failures
```

### Post-Task Log (MANDATORY)

After ANY task:
```
1. EXTRACT patterns from success
2. LOG failures with root cause
3. STORE decisions with rationale
4. UPDATE skill pool if new capability created
```

---

## Skill Pooling

When a brain develops a useful capability, it becomes a **shared skill**.

### Skill Flow

```
Brain A solves problem → Extract as Skill → Publish to Pool → Brain B discovers → Brain B adopts → Track effectiveness
```

### Skill Categories

- `analysis` — Data analysis and research
- `implementation` — Code and system building
- `communication` — Writing and presentation
- `planning` — Strategy and roadmaps
- `optimization` — Performance and efficiency
- `integration` — System connections
- `validation` — Testing and QA
- `security` — Protection and compliance

---

## Tool System (Autonomous Actions)

X44 specialized brains can perform real actions through the **Tool System**. This is what enables autonomy.

### Available Tools

| Tool | Category | Trust Level | Description |
|------|----------|-------------|-------------|
| `file_read` | read | 1+ | Read file contents |
| `file_write` | write | 2+ | Write/create files |
| `file_edit` | write | 2+ | Edit files (search/replace, insert, delete) |
| `shell_exec` | execute | 3+ | Execute shell commands |
| `web_fetch` | read | 1+ | Fetch content from URLs |

### Tool Categories and Trust

| Category | Min Trust | Actions |
|----------|-----------|---------|
| `read` | Level 1 | Read-only operations |
| `write` | Level 2 | File modifications |
| `execute` | Level 3 | Shell commands, git |
| `dangerous` | Level 4 | Delete, external services |

### Using Tools in Brains

```typescript
// In a brain class extending BaseBrain:

// Read a file
const content = await this.readFile('/path/to/file.ts');

// Write a file
await this.writeFile('/path/to/new-file.ts', 'content here');

// Edit a file
await this.editFile('/path/to/file.ts', [
  { type: 'replace', search: 'oldText', replace: 'newText' },
  { type: 'insert', line: 10, content: 'new line here' },
]);

// Run a command (requires trust level 3+)
const result = await this.runCommand('npm test', { approved: true });

// Fetch a URL
const data = await this.fetchUrl('https://api.example.com/data');
```

### Security Guardrails

The tool system includes multiple security layers:

**Blocked Paths:**
- System directories (`/etc`, `/bin`, `/usr`)
- SSH keys (`~/.ssh`)
- Credentials (`~/.aws/credentials`)
- Environment files (`.env*`)

**Blocked Commands:**
- Destructive operations (`rm -rf /`)
- Privilege escalation (`sudo`, `su`)
- Fork bombs
- Piping curl/wget to bash

**Blocked Environment Variables:**
- `LD_PRELOAD`, `LD_LIBRARY_PATH`
- `NODE_OPTIONS`, `PYTHONPATH`
- `BASH_ENV`, `PATH` modifications

### AI with Tool Calling

Brains can use AI to decide which tools to invoke:

```typescript
import { executeWithTools } from '../ai/index.js';

const result = await executeWithTools(
  'engineering',
  task,
  {
    brainType: 'engineering',
    trustLevel: 3,
    sessionId: 'session-123',
    workingDirectory: process.cwd(),
    approved: true,
  },
  {
    maxToolCalls: 10,
    patterns: relevantPatterns,
  }
);

// Result includes all tool calls made
console.log(result.toolCalls);
```

---

## All 44 specialized brains

X2000 inherits all 44 specialized brains from prototype_x1000:

### Tier 1: Core (Complete)
- **CEO Brain** — Master orchestrator
- **Engineering Brain** — Code, infra, DevOps
- **Design Brain** — UI/UX, visual identity
- **MBA Brain** — Business strategy
- **Options Trading Brain** — Trading algorithms

### Tier 2: Business Strategy
- Finance, Operations, Legal

### Tier 3: Product & Design
- Product, Game Design, Content, Localization

### Tier 4: Growth & Revenue
- Marketing, Sales, Growth, Partnership, Customer Success

### Tier 5: Technical
- Data, Security, Cloud, Mobile, QA, AI, Automation, Analytics, DevRel

### Tier 6: Marketing Channels
- Branding, Email, Social Media, Video, Community

### Tier 7: Business Operations
- Support, Investor, Pricing, Innovation

### Tier 8: People
- HR, Research

---

## Verification Protocol

**NEVER claim "done" without verification.**

### Before Claiming Success:

1. Did guardrails pass? (All 5 layers)
2. Did memory log the outcome?
3. Can you list which brains were used?
4. Is there evidence of the result?

### Verification Evidence Required:

```
BRAINS USED:
- CEO Brain: [what it did]
- Engineering Brain: [what it built]
- [etc. for each brain]

ACTIONS TAKEN:
- [List of actions]

GUARDRAIL STATUS:
- Layer 1 (Input): ✓
- Layer 2 (Action): ✓
- Layer 3 (Runtime): ✓
- Layer 4 (Visibility): ✓
- Layer 5 (Escalation): ✓

MEMORY LOGGED:
- Patterns: [count]
- Learnings: [count]
- Decisions: [count]
```

---

## Usage

### Import Core Systems

```typescript
import { ceoBrain } from './brains/ceo/index.js';
import { memoryManager } from './memory/manager.js';
import { skillPoolManager } from './memory/skills.js';
import { collaborationManager } from './agents/collaboration.js';
import { guardrailsManager } from './guardrails/layers.js';
import { autonomyManager } from './guardrails/autonomy.js';
import { agentSpawner } from './agents/spawn.js';
import { sessionManager } from './agents/session.js';
```

### Orchestrate a Task

```typescript
const result = await ceoBrain.orchestrate("Build a SaaS product for X");
```

### Check Guardrails

```typescript
const check = guardrailsManager.checkAction({
  action: 'deploy',
  brain: 'engineering',
  trustLevel: 2,
  target: 'production',
});

if (!check.allowed) {
  console.log('Blocked:', check.checks.find(c => !c.passed)?.message);
}
```

### Record Learning

```typescript
memoryManager.storeLearning({
  type: 'success',
  source: 'engineering',
  description: 'CI/CD pipeline reduced deploy time by 50%',
  recommendation: 'Use this pattern for similar projects',
  // ...
});
```

---

## File Structure

```
prototype-x2000/
├── src/
│   ├── brains/
│   │   ├── base.ts              # Base brain class (with tool integration)
│   │   ├── ceo/index.ts         # CEO Brain orchestrator
│   │   ├── engineering/index.ts # Engineering Brain
│   │   ├── product/index.ts     # Product Brain
│   │   ├── research/index.ts    # Research Brain
│   │   ├── design/index.ts      # Design Brain
│   │   └── qa/index.ts          # QA Brain
│   ├── tools/
│   │   ├── base.ts              # Tool interface and registry
│   │   ├── file-read.ts         # File read tool
│   │   ├── file-write.ts        # File write tool
│   │   ├── file-edit.ts         # File edit tool
│   │   ├── shell-exec.ts        # Shell execution tool
│   │   ├── web-fetch.ts         # Web fetch tool
│   │   └── index.ts             # Tool exports and utilities
│   ├── memory/
│   │   ├── manager.ts           # Forever-learning memory
│   │   ├── persistence.ts       # Supabase persistence
│   │   └── skills.ts            # Skill pooling
│   ├── agents/
│   │   ├── spawn.ts             # Agent creation
│   │   ├── session.ts           # Session management
│   │   └── collaboration.ts     # Brain tension protocol
│   ├── guardrails/
│   │   ├── layers.ts            # 5-layer guardrails
│   │   └── autonomy.ts          # Earned autonomy
│   ├── ai/
│   │   ├── client.ts            # Anthropic API client
│   │   ├── executor.ts          # AI execution with tool support
│   │   └── prompts.ts           # Brain-specific prompts
│   ├── cli/                     # CLI interface
│   └── types/index.ts           # Type definitions
├── docs/
│   ├── OPENCLAW_TEARDOWN.md     # OpenClaw analysis
│   └── ...
├── supabase/                    # Database migrations
├── package.json
├── tsconfig.json
└── CLAUDE.md                    # This file
```

---

## Key Differentiators vs. OpenClaw

| Feature | OpenClaw | X2000 |
|---------|----------|-------|
| **Agent Model** | Single assistant | 44 specialized brains |
| **Memory** | Retrieval only | Forever-learning |
| **Collaboration** | Isolated agents | Brain tension debate |
| **Autonomy** | All-or-nothing | Earned trust levels |
| **Safety** | Basic guardrails | 5-layer system |
| **Focus** | Consumer/dev | Business building |

---

## Absolute Rules

1. **ALL work routes through CEO Brain** — No direct brain access
2. **Memory query before any task** — Learn from the past
3. **Memory log after any task** — Contribute to the future
4. **Guardrails check all actions** — No bypassing safety
5. **Trust is earned** — Brains start restricted
6. **Debate improves decisions** — Multiple perspectives
7. **Evidence required** — No unverified claims

---

## Development Status

### Phase 1 (Foundation) ✅
- [x] Types and base brain class
- [x] CEO Brain orchestrator
- [x] Memory manager
- [x] Skill pooling
- [x] Agent spawn and session
- [x] Brain tension protocol
- [x] 5-layer guardrails
- [x] Earned autonomy
- [x] CLAUDE.md protocols

### Phase 2 (Memory System) ✅
- [x] Persistent storage (Supabase)
- [x] Pattern/Learning/Skill persistence
- [x] Memory loading on startup
- [x] 48+ learnings accumulated

### Phase 3 (MVP Brains) ✅
- [x] Engineering Brain
- [x] Product Brain
- [x] Research Brain
- [x] Design Brain
- [x] QA Brain
- [x] Real Claude API integration

### Phase 4 (Tool System) ✅
- [x] Tool base system and registry
- [x] File operations (read, write, edit)
- [x] Shell command execution
- [x] Web fetch tool
- [x] Security guardrails
- [x] AI with tool calling (`executeWithTools`)

### Phase 5 (In Progress)
- [ ] Git operations tool
- [ ] Code execution sandbox
- [ ] Full autonomy testing
- [ ] Multi-brain collaboration with tools

### Phase 6 (Upcoming)
- [ ] End-to-end autonomous workflows
- [ ] Sub-agent spawning
- [ ] Session persistence and warm state

---

## Parent System

X2000 inherits from prototype_x1000. For foundational protocols, see:
- `/DropFly-PROJECTS/prototype_x1000/ceo_brain/CLAUDE.md`
- `/DropFly-PROJECTS/prototype_x1000/memory/MEMORY_SYSTEM.md`

---

**X2000: Building billion-dollar businesses, autonomously.**
