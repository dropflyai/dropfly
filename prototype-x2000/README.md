# X2000

> Autonomous AI Fleet · 46 Specialized Brains · Forever Learning

X2000 is an autonomous AI system that builds billion-dollar businesses. It works with **any LLM** (Claude, GPT-4, Llama, local models) and runs on **any platform** (Mac, Linux, Windows, Raspberry Pi).

## Quick Install

```bash
# Clone and install
git clone https://github.com/YOUR_REPO/x2000.git
cd x2000
./install.sh
```

Or manually:
```bash
npm install
npm run build
```

## Usage

```bash
# Run a task
npm run x2000 "build a REST API for user management"

# Interactive mode
npm run x2000 -- -i

# Use a specific provider
npm run x2000 -- --provider ollama "analyze this codebase"

# Verbose output
npm run x2000 -- -v "research competitors"
```

If installed globally (`npm link`):
```bash
x2000 "your task here"
x2000 -i  # Interactive mode
```

## LLM Providers

X2000 works with any of these providers:

### Anthropic (Claude) - Recommended
```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

### OpenAI (GPT-4)
```bash
export OPENAI_API_KEY=sk-...
```

### Ollama (Local, Free)
```bash
# Install Ollama
brew install ollama  # macOS
# or: curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llama3.2

# Start the server
ollama serve
```

X2000 will auto-detect available providers and use the best one.

## Features

### 46 Specialized Brains
- **CEO Brain** - Orchestration and delegation
- **Engineering Brain** - Code, architecture, DevOps
- **Product Brain** - Requirements, roadmaps
- **Design Brain** - UI/UX, prototyping
- **Research Brain** - Market analysis
- **Finance Brain** - Financial modeling
- **Marketing Brain** - Growth, branding
- **QA Brain** - Testing, quality gates
- And 38 more domain experts...

### Forever Learning
- Extracts patterns from every task
- Stores learnings for future use
- Improves decision-making over time

### Brain Tension Protocol
- Brains debate and challenge each other
- Better decisions through structured debate
- CEO resolves conflicts

### Tools
- File operations (read, write, edit)
- Shell commands
- Web fetching
- Git operations
- Browser automation

## Commands

```bash
npm run x2000           # Run X2000 CLI
npm run autonomous      # Autonomous audit mode
npm run self-improve    # Self-improvement mode
npm run improve-to-97   # Improve until 97/100 score
```

## Configuration

Create a `.env` file:
```env
# LLM Provider (at least one required)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Memory persistence (optional)
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...

# Settings
NODE_ENV=development
LOG_LEVEL=info
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              X2000                                       │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                        CEO BRAIN                                │     │
│  │   Orchestration │ Task Decomposition │ Conflict Resolution     │     │
│  └────────────────────────────────────────────────────────────────┘     │
│         │                    │                    │                      │
│         ▼                    ▼                    ▼                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │ ENGINEERING  │    │   PRODUCT    │    │   FINANCE    │   + 43 more  │
│  │    BRAIN     │◄──►│    BRAIN     │◄──►│    BRAIN     │              │
│  └──────────────┘    └──────────────┘    └──────────────┘              │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                    LLM PROVIDERS                                │     │
│  │         Anthropic │ OpenAI │ Ollama │ Any Compatible           │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                    MEMORY SYSTEM                                │     │
│  │           Patterns │ Learnings │ Skills │ Decisions            │     │
│  └────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
```

## Platform Support

| Platform | Status |
|----------|--------|
| macOS | ✅ Full support |
| Linux | ✅ Full support |
| Windows | ✅ Full support |
| Raspberry Pi | ✅ With Ollama |
| Docker | ✅ Coming soon |

## License

MIT
