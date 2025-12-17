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

## Product Target (Required)

**Product Target must be explicitly declared or inferred, never assumed.**

### Supported Product Targets

- **WEB_SAAS** — customer-facing web app, dashboards, SaaS products
- **WEB_APP** — non-SaaS web apps, internal tools, static web apps
- **MOBILE_IOS** — iOS native applications
- **MOBILE_ANDROID** — Android native applications
- **API_SERVICE** — backend services, REST/GraphQL APIs
- **AGENT_SYSTEM** — automation systems, AI agents, workflows
- **LIBRARY** — shared libraries, SDKs, packages
- **SCRIPT** — one-off scripts, utilities, tooling
- **UNKNOWN** — forces clarification (not allowed without resolution)

### Product Target Rules

- If Product Target is **UNKNOWN** → STOP and ask for clarification
- Product Target drives verification, security, and automation expectations
- Product Target ≠ Engineering Mode (they are orthogonal concepts)
- If multiple product types exist in the repo, scope decisions to the current task
- **DO NOT assume WEB_SAAS** unless explicitly declared or inferred from evidence

### How Product Target Affects Rigor

- **WEB_SAAS / MOBILE_IOS / MOBILE_ANDROID** → high security bar, accessibility requirements, performance budgets
- **API_SERVICE** → contract testing, backward compatibility, load testing
- **AGENT_SYSTEM** → idempotency, retry logic, observability
- **LIBRARY** → API stability, semantic versioning, broad compatibility
- **SCRIPT / WEB_APP** → lighter requirements, context-dependent rigor

---

## Execution Gear (Required)

**Execution Gear determines enforcement strength, not what correctness means.**

### Supported Execution Gears

#### GEAR: EXPLORE
- **Purpose:** Prototypes, spikes, experiments, throwaway code
- **Gates:** Minimal (Product Target + Mode recommended, not required)
- **Manual steps:** Allowed
- **Verification:** Optional (manual allowed)
- **Regression logging:** Not required unless insight is permanent
- **When to use:** "Just trying something," learning, validation

#### GEAR: BUILD
- **Purpose:** Real feature development, normal engineering work
- **Gates:** Normal (Product Target + Mode + Artifact Type required)
- **Automation:** Strongly recommended
- **Verification:** Encouraged; mandatory only for risky changes
- **Regression logging:** Required when failures occur
- **When to use:** Default for production-bound work

#### GEAR: SHIP
- **Purpose:** Production release, customer-facing deployment
- **Gates:** Full (all gates mandatory)
- **Automation + Verification:** Mandatory
- **Manual verification:** Not allowed
- **Regression logging:** Required
- **When to use:** Releasing to production, customer-facing changes

#### GEAR: HOTFIX
- **Purpose:** Emergency production fix, critical incident response
- **Gates:** Minimal safe set (Product Target + Mode + Evidence of failure required)
- **Justified violations:** Allowed with documentation
- **Verification:** Smoke test minimum; defer full verification to post-incident
- **Incident + Rollback documentation:** Required
- **When to use:** Production is broken, users impacted

### Execution Gear + Product Target Matrix

**Product Target + Artifact Classification:**
- **Mandatory for:** SHIP, HOTFIX
- **Recommended for:** BUILD
- **Optional for:** EXPLORE

**Primary Engineering Mode:**
- **Mandatory for:** All gears

**Automation Preference:**
- **SHIP:** Automation mandatory
- **BUILD:** Automation strongly preferred
- **HOTFIX:** Automation preferred, manual allowed if urgent
- **EXPLORE:** Manual allowed

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

## Mode Behavior Under Execution Gears

**Execution Gear modulates mode strictness, not mode identity.**

Reference: `Engineering/Checklist.md`

### How Execution Gear Affects Mode Requirements

The **mode defines what correctness means**.
The **execution gear defines how strictly correctness is enforced**.

#### MODE: APP Under Different Execution Gears

- **GEAR: EXPLORE** — UI verification optional; manual testing allowed; Playwright skippable
- **GEAR: BUILD** — UI verification via Playwright required; Chromium default; artifacts required
- **GEAR: SHIP** — UI verification via Playwright + cross-browser testing; accessibility audit required; WCAG AA minimum
- **GEAR: HOTFIX** — UI verification via smoke test; Playwright preferred but manual allowed if urgent

#### MODE: API Under Different Execution Gears

- **GEAR: EXPLORE** — Schema validation optional; manual curl testing allowed
- **GEAR: BUILD** — Automated API tests required; backward compatibility checked
- **GEAR: SHIP** — Full contract testing; load testing; migration safety validated
- **GEAR: HOTFIX** — Smoke test critical endpoints; defer full contract testing to post-incident

#### MODE: AGENTIC Under Different Execution Gears

- **GEAR: EXPLORE** — Automation can be manual; idempotency optional
- **GEAR: BUILD** — Automation-first execution; idempotency required; runbooks for failures
- **GEAR: SHIP** — Full retry logic; failure recovery automated; observability required
- **GEAR: HOTFIX** — Minimal runnable automation; defer full retry logic to post-incident

### Key Principle

> **Mode = what to verify. Execution Gear = how thoroughly to verify it.**

A task at `MODE: APP, GEAR: EXPLORE` still verifies UI correctness, but manually.
A task at `MODE: APP, GEAR: SHIP` verifies UI correctness with full automation + accessibility + cross-browser.

Both are APP mode. Different rigor.

---

**Mode selection is mandatory and binding.**
