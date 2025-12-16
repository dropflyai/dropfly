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

## Mode Enforcement

If a decision conflicts with the selected mode:
- The mode wins
- Convenience does not override correctness
- Short-term speed does not override long-term stability

---

**Mode selection is mandatory and binding.**
