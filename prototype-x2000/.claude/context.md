# X2000 Project Context

## What Is X2000?

**Prototype X2000** is an "Autonomous Business-Building AI Fleet" — a product that uses the X1000 brain system to autonomously research, plan, and build businesses.

## Relationship to X1000

```
X1000 (Brain System)          X2000 (Product)
├── 37 specialist brains  ──► Uses brains to build businesses
├── Memory system         ──► Stores project-specific memory
├── Orchestration         ──► CEO brain coordinates work
└── Protocols             ──► Follows brain protocols
```

**X1000 = The engine. X2000 = A car built with that engine.**

## Architecture

X2000 consists of:
- **TypeScript modules** for brain orchestration
- **Memory Manager** for persistent context
- **Agent Spawn System** for creating specialist agents
- **Guardrails Layer** for safety constraints
- **Session Management** for continuity

## Key Files

| File | Purpose |
|------|---------|
| `src/types.ts` | Core type definitions |
| `src/brains/base.ts` | Base brain class |
| `src/brains/ceo.ts` | CEO orchestrator brain |
| `src/memory/manager.ts` | Memory management |
| `src/agents/spawn.ts` | Agent spawning |
| `src/guardrails/` | Safety layers |

## Status

- **Phase 1**: Foundation (COMPLETE)
- **Phase 2**: Supabase integration (PENDING)
- **Phase 3**: 6 MVP brains (PENDING)
- **Phase 4**: Agent spawning (PENDING)

## Last Updated
2026-03-07
