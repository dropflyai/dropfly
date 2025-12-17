# ENGINEERING MODES
**Context-First Engineering Classification**

---

## Purpose

Engineering Mode selection is mandatory.

No work may begin until a mode is explicitly selected and declared.

Modes define:
- architectural expectations
- acceptable tradeoffs
- tooling requirements
- verification rigor
- cleanup and maintenance standards

Failure to select a mode is a system violation.

---

## MODE: APP
**User-Facing Application**

### Definition
A product with a user interface where correctness, usability, performance, and stability matter.

Examples:
- SaaS products
- dashboards
- consumer or internal web apps
- mobile applications

### Mandatory Requirements
- Strong separation of concerns
- UI verification via Playwright
- Browser explicitly defined (Chromium by default)
- Error handling and user-safe failures
- Performance awareness
- Cleanup of dead UI states and components

### Forbidden Shortcuts
- Manual UI verification
- Hardcoded environment assumptions
- Silent failures
- "It works on my machine"

---

## MODE: API
**Backend Service or Interface Layer**

### Definition
A service consumed by other systems or applications.

Examples:
- REST APIs
- GraphQL services
- webhooks
- backend microservices

### Mandatory Requirements
- Explicit contracts (request/response schemas)
- Automated tests
- Backward compatibility awareness
- Migration safety
- Logging and observability

### Forbidden Shortcuts
- Unversioned breaking changes
- Implicit behavior
- Unvalidated inputs

---

## MODE: AGENTIC
**Automation, AI Agents, or Orchestration Systems**

### Definition
Systems that execute tasks autonomously.

Examples:
- agent workflows
- automations
- n8n flows
- MCP-based tools
- background workers

### Mandatory Requirements
- Automation-first execution
- No manual intervention in steady state
- Idempotency
- Explicit retry and failure behavior
- Runbooks for failure recovery
- Memory capture of solved problems

### Forbidden Shortcuts
- Asking users to manually run steps
- Hidden state
- Non-repeatable workflows

---

## MODE: LIB
**Shared Library or Package**

### Definition
Reusable code consumed by other projects.

Examples:
- SDKs
- shared utilities
- internal packages

### Mandatory Requirements
- Minimal surface area
- Clear API boundaries
- Backward compatibility
- Tests covering public interfaces
- Clean dependency graph

### Forbidden Shortcuts
- Leaking implementation details
- Tight coupling to consumers
- Uncontrolled breaking changes

---

## MODE: MONOREPO
**Multiple Systems in One Repository**

### Definition
A repository containing multiple applications, services, or packages.

Examples:
- app + API + worker
- shared frontend and backend
- multi-product platforms

### Mandatory Requirements
- Clear ownership boundaries
- Explicit folder structure
- Independent verification per subsystem
- Dependency discipline
- Cleanup enforcement to prevent sprawl

### Forbidden Shortcuts
- Implicit cross-dependencies
- Global state leaks
- Undocumented coupling

---

## Mode Declaration Rule

At the start of every task, you MUST declare:

> **Engineering Mode: <MODE>**

If multiple modes apply:
- Declare the primary mode
- List secondary modes
- Apply the strictest applicable rules

---

## Primary Mode Authority Rule

Every task MUST have exactly **one primary Engineering Mode**.

### Authority Hierarchy
- The **primary mode** governs:
  - verification requirements
  - architectural constraints
  - scope boundaries
  - acceptance criteria
- **Secondary modes** may inform implementation details but may NOT override primary mode constraints.

### Selection Rule
If multiple modes appear applicable:
- The most **user-facing** or **production-impacting** mode takes precedence as primary.
- All others are secondary.

### Precedence Order (Highest → Lowest)
1. **APP** — if users interact with it
2. **API** — if systems depend on it
3. **AGENTIC** — if it executes autonomously
4. **LIB** — if it is consumed as a package
5. **MONOREPO** — applies when managing multiple subsystems; does not override subsystem modes

### Non-Negotiable
- You may NOT declare two primary modes.
- Declaring "primary: APP, API" is a violation.
- Declaring "primary: APP; secondary: API" is valid only if the work is user-facing and also exposes an API layer.

If you cannot determine a single primary mode, STOP and request clarification.

---

## Mode Enforcement

If a decision conflicts with the selected mode:
- The mode wins
- Convenience does not override correctness
- Short-term speed does not override long-term stability

---

## Mode Behavior Under Process Levels

**Process Level modulates mode strictness, not mode identity.**

Reference: `Engineering/ProcessLevels.md`

### How Process Level Affects Mode Requirements

The **mode defines what correctness means**.
The **process level defines how strictly correctness is enforced**.

#### MODE: APP Under Different Process Levels

- **L0 EXPLORE** — UI verification optional; manual testing allowed; Playwright skippable
- **L1 BUILD** — UI verification via Playwright required; Chromium default; artifacts required
- **L2 SHIP** — UI verification via Playwright + cross-browser testing; accessibility audit required; WCAG AA minimum
- **L3 HOTFIX** — UI verification via smoke test; Playwright preferred but manual allowed if urgent

#### MODE: API Under Different Process Levels

- **L0 EXPLORE** — Schema validation optional; manual curl testing allowed
- **L1 BUILD** — Automated API tests required; backward compatibility checked
- **L2 SHIP** — Full contract testing; load testing; migration safety validated
- **L3 HOTFIX** — Smoke test critical endpoints; defer full contract testing to post-incident

#### MODE: AGENTIC Under Different Process Levels

- **L0 EXPLORE** — Automation can be manual; idempotency optional
- **L1 BUILD** — Automation-first execution; idempotency required; runbooks for failures
- **L2 SHIP** — Full retry logic; failure recovery automated; observability required
- **L3 HOTFIX** — Minimal runnable automation; defer full retry logic to post-incident

### Key Principle

> **Mode = what to verify. Process Level = how thoroughly to verify it.**

A task at `MODE: APP, L0 EXPLORE` still verifies UI correctness, but manually.
A task at `MODE: APP, L2 SHIP` verifies UI correctness with full automation + accessibility + cross-browser.

Both are APP mode. Different rigor.

---

**Mode selection is mandatory and binding.**
