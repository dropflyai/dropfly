# Engineering Patterns -- Index & Selection Guide

This directory contains the Engineering Brain's canonical pattern library.
Each pattern file documents proven approaches, trade-offs, and implementation
guidance for a core engineering concern. Patterns are prescriptive -- they
represent the way we build things, not suggestions.

Use this index to find the right pattern for your situation, then follow
the guidance inside the pattern file itself.

---

## Pattern Catalog

| Pattern Name | File | When to Use | Key Concepts |
|---|---|---|---|
| API Design | `API.md` | Building or evolving service interfaces | REST conventions, GraphQL schemas, gRPC contracts, versioning, pagination |
| State Management | `StateManagement.md` | Managing data flow in client or server apps | Client vs. server state, state machines, derived state, cache invalidation |
| Testing | `Testing.md` | Writing or restructuring a test suite | Test pyramid, TDD workflow, property-based testing, fixture strategies |
| Performance | `Performance.md` | Diagnosing or preventing slowness | Caching layers, latency budgets, profiling, bundle optimization |
| Migrations | `Migrations.md` | Changing database schemas safely | Schema evolution, zero-downtime migrations, rollback plans, data backfills |
| Observability | `Observability.md` | Instrumenting systems for production insight | Structured logging, distributed tracing, metric cardinality, alerting rules |
| Agentic Systems | `AgenticSystems.md` | Building AI-powered or multi-agent workflows | Agent loops, tool use, RAG pipelines, multi-agent orchestration, guardrails |
| Refactoring | `Refactoring.md` | Improving code without changing behavior | Strangler fig, code smells, tech debt paydown, safe transformation steps |

---

## Pattern Selection Decision Tree

Use this flowchart to identify which pattern to consult first.

```
START: What kind of work are you doing?
  |
  |-- Exposing or consuming a service boundary?
  |     --> API.md
  |
  |-- Handling data flow, caching, or UI reactivity?
  |     --> StateManagement.md
  |
  |-- Writing, fixing, or restructuring tests?
  |     --> Testing.md
  |
  |-- Investigating or preventing performance issues?
  |     --> Performance.md
  |
  |-- Changing a database schema or migrating data?
  |     --> Migrations.md
  |
  |-- Adding logging, metrics, tracing, or alerts?
  |     --> Observability.md
  |
  |-- Building AI agents, RAG, or multi-agent systems?
  |     --> AgenticSystems.md
  |
  |-- Improving existing code or paying down tech debt?
  |     --> Refactoring.md
  |
  |-- None of the above?
  |     --> Check AntiPatterns/ or theory/ for conceptual guidance,
  |         then return here once the work is scoped.
```

---

## Cross-References

These sibling directories complement the pattern library:

- **`../AntiPatterns/`** -- Documents known failure modes and mistakes to avoid.
  Consult AntiPatterns whenever a pattern feels like it is being misapplied.
- **`../Lifecycle/`** -- Covers the full engineering lifecycle (planning, building,
  shipping, operating). Patterns slot into specific lifecycle phases.
- **`../theory/`** -- Foundational engineering theory and mental models that
  underpin the patterns. Start here if you need the "why" behind a pattern.

---

## How to Use This Directory

1. **Identify your concern** using the decision tree or the catalog table above.
2. **Open the pattern file** and read the full guidance before writing code.
3. **Cross-check AntiPatterns/** to make sure you are not falling into a known trap.
4. **Follow the Engineering Brain preflight** defined in `../CLAUDE.md` --
   declare your mode, consult the checklist, and select an output contract.
5. **Record new learnings** in `../Solutions/SolutionIndex.md` if you discover
   a variant or refinement of any pattern during implementation.

Patterns are living documents. If you find a gap, update the relevant file
and log the change in `../Memory/ExperienceLog.md`.
