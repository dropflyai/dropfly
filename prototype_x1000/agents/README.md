# Prototype X1000 Agent System

Multi-agent framework powered by Anthropic SDK. Agents read frozen brain guidance, execute tasks, and auto-log learnings to Supabase.

## Architecture

```
USER REQUEST
     │
     ▼
┌─────────────┐
│  CEO AGENT  │  ← Orchestrator (claude-opus-4)
└──────┬──────┘
       │ tool_use calls
   ┌───┼───┬───────────┐
   │   │   │           │
   ▼   ▼   ▼           ▼
┌────┐┌────┐┌────┐ ┌──────────┐
│ENG ││DES ││MBA │ │BRAIN     │
│    ││    ││    │ │BUILDER   │
└─┬──┘└─┬──┘└─┬──┘ └────┬─────┘
  │     │     │          │
  └─────┴─────┴──────────┘
              │
              ▼
      ┌───────────────┐
      │   SUPABASE    │
      │ (auto-logged) │
      └───────────────┘
```

## Installation

```bash
cd prototype_x1000/agents
pip install -e .
```

## Configuration

Copy the environment template and fill in your credentials:

```bash
cp ../credentials/.env.template ../credentials/.env
# Edit .env with your values:
# - ANTHROPIC_API_KEY
# - SUPABASE_URL
# - SUPABASE_SERVICE_KEY
```

Run the database migration:

```bash
psql $DATABASE_URL < ../migrations/002_agent_tables.sql
```

## Usage

### CLI

```bash
# Orchestrate a complex task across multiple brains
px1000 orchestrate "Build a landing page with signup form"

# Run a specific brain agent
px1000 run engineering "Create a REST API endpoint"
px1000 run design "Design a login form"
px1000 run mba "Analyze market opportunity"

# Build a new brain
px1000 build-brain product -d "product management" \
    -c "Product strategy" -c "Roadmapping" -c "Requirements"

# View patterns and learning
px1000 patterns --brain engineering
px1000 patterns --analyze-failures

# View recent runs
px1000 runs --limit 10

# Check system status
px1000 status
px1000 brains
```

### Python API

```python
from prototype_x1000.agents import CEOAgent, EngineeringAgent

# Direct specialist use
eng = EngineeringAgent()
result = eng.run("Create a REST API endpoint for user registration")
print(result.content)

# Orchestrated multi-agent task
ceo = CEOAgent()
result = ceo.orchestrate("Build a landing page with signup form")
print(result.final_synthesis)
print(f"Brains used: {result.brains_used}")
```

### MCP Server (Claude Desktop/Code)

Add to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
    "mcpServers": {
        "prototype-x1000": {
            "command": "python",
            "args": ["/path/to/prototype_x1000/mcp/brain_mcp_server.py"],
            "env": {
                "ANTHROPIC_API_KEY": "your-key",
                "SUPABASE_URL": "your-url",
                "SUPABASE_SERVICE_KEY": "your-key"
            }
        }
    }
}
```

Available MCP tools:
- `run_agent` - Run a specialist brain agent
- `orchestrate` - Orchestrate across multiple brains
- `query_memory` - Search past experiences
- `get_patterns` - Get established patterns
- `build_brain` - Generate a new brain
- `list_brains` - List available brains

## Components

### Core (`agents/core/`)

- **BaseAgent** - Base class for all agents with brain loading and tool support
- **BrainLoader** - Loads CLAUDE.md files as agent context
- **SupabaseMemoryClient** - Handles all database operations

### CEO Agent (`agents/ceo/`)

- **CEOAgent** - Master orchestrator using claude-opus-4
- **TaskDecomposer** - Breaks complex tasks into subtasks
- **BrainSelector** - Routes tasks to appropriate specialists

### Specialists (`agents/specialists/`)

- **EngineeringAgent** - Code, APIs, infrastructure
- **DesignAgent** - UI/UX, visual design, accessibility
- **MBAAgent** - Business strategy, operations
- **SpecialistFactory** - Creates specialist agents

### Brain Builder (`agents/brain_builder/`)

- **BrainBuilderAgent** - Meta-agent for generating new brains
- **QualityValidator** - Validates brain quality

### Memory (`agents/memory/`)

- **AutoLogger** - Automatic task logging
- **PatternExtractor** - Extracts patterns from experiences

## Model Selection

| Agent | Model | Reason |
|-------|-------|--------|
| CEO | claude-opus-4 | Best reasoning for orchestration |
| Specialists | claude-sonnet-4 | Cost-effective execution |
| Brain Builder | claude-opus-4 | Complex generation tasks |

## Database Tables

The agent system uses these Supabase tables:

- `agent_runs` - Track every execution
- `brain_builds` - Track brain generation
- `ceo_task_delegations` - Track CEO routing
- `ceo_brain_collaborations` - Track multi-agent workflows

Plus the existing shared tables:
- `shared_experiences` - Task learnings
- `shared_patterns` - Reusable patterns
- `shared_failures` - Failure logs

## Development

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Run tests
pytest tests/

# Type checking
mypy agents/

# Linting
ruff check agents/
```
