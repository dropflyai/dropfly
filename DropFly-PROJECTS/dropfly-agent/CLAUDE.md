# DropFly Agent — Autonomous Builder System

## What This Is

An autonomous builder system powered by specialized brains and parallel multi-agent execution. Not a chatbot. A **PhD-level team** that takes a vision, extracts requirements, does deep research, and spawns parallel agents to build it.

## Architecture

```
User → API Gateway → Intake Agent → CEO Agent → [N Agents in Parallel]
                                                    ├── Research Agent
                                                    ├── Engineering Agent
                                                    ├── Design Agent
                                                    ├── QA Agent
                                                    ├── Deploy Agent
                                                    └── MBA Agent
                                                         ↕
                                                    Agent Message Bus
```

## Key Modules

| Module | Location | Purpose |
|--------|----------|---------|
| Provider Layer | `src/core/providers.py` | SDK-agnostic LLM interface (Anthropic, OpenAI, Ollama, custom) |
| Base Agent | `src/core/base_agent.py` | Async agent with tool execution and events |
| Tool Registry | `src/core/tool_registry.py` | Universal tool system — any function becomes a tool |
| Agent Bus | `src/core/agent_bus.py` | Agent-to-agent messaging, artifacts, requests |
| Agent Pool | `src/core/agent_pool.py` | Parallel agent execution with dependencies |
| Brain Loader | `src/core/brain_loader.py` | Loads brain CLAUDE.md files for agent context |
| Memory Client | `src/core/memory_client.py` | Supabase memory (experiences, patterns, runs) |

## Rules

- **NEVER commit secrets** — use `.env` files locally, AWS Secrets Manager in production
- **NEVER hardcode API keys** — use CredentialManager
- **All agents are async** — use `await` everywhere
- **Tools are SDK-agnostic** — register once, use with any provider
- **Brain guidance is read-only** — agents READ brain CLAUDE.md files, never modify them
- **Ask before committing** — agents should not auto-commit without approval

## How to Add a New Agent

1. Create `src/agents/my_agent.py` inheriting from `BaseAgent`
2. Set `agent_type = "my_type"` and `default_model = "..."`
3. Implement `_get_system_prompt()` and `_register_tools()`
4. Register in `src/agents/factory.py`

## How to Add a New Tool

1. Create async function in `src/tools/my_tool.py`
2. Create `register_my_tools(registry)` function
3. Add to `src/tools/__init__.py` in `create_default_registry()`

## How to Add a New LLM Provider

1. Subclass `LLMProvider` in a new file or `src/core/providers.py`
2. Implement `acomplete()` and `astream()`
3. Register: `registry.register("my_provider", MyProvider())`

## Tech Stack
- Python 3.12+
- anthropic SDK (primary), openai SDK (optional), any LLM SDK
- FastAPI + WebSocket (gateway)
- Supabase (memory)
- Playwright (browser)
- Docker (sandboxing)
