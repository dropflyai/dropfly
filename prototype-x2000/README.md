# X2000

> Autonomous AI Fleet · 46 Specialized Brains · Forever Learning

X2000 is an autonomous AI that works while you sleep. Better than OpenClaw.

## Quick Start (Mac Mini / Mac)

```bash
# 1. Clone
git clone https://github.com/YOUR_REPO/prototype-x2000.git
cd prototype-x2000

# 2. Install & Build
npm install
npm run build

# 3. Run Setup Wizard
npm start setup
```

**That's it.** The wizard walks you through everything in about 5 minutes:
- AI provider (Claude subscription, API key, or local)
- Communication channels (Telegram, WhatsApp, iMessage, Discord, Email)
- Autonomy level (how much freedom X2000 has)
- Background service installation

---

## What X2000 Does

X2000 runs as a background service. You can message it via:
- **Telegram** - "Deploy my app to production"
- **WhatsApp** - "Build me an API for user auth"
- **iMessage** - "Research competitors in the SaaS space"
- **Email** - Send tasks, get responses
- **CLI** - `npm start msg "your task here"`

X2000 will:
- Complete tasks autonomously
- Verify deployments actually work
- Fix errors without asking
- Learn and improve over time

---

## Commands

```bash
# Setup wizard (first time)
npm start setup

# Start gateway (foreground)
npm start gateway

# Background service
npm start daemon install    # Install & auto-start on login
npm start daemon start      # Start
npm start daemon stop       # Stop
npm start daemon logs       # View logs
npm start daemon uninstall  # Remove

# Send tasks
npm start msg "your task here"

# Check status
npm start status

# Manage channels
npm start channels
npm start channels add telegram
npm start channels add email

# Help
npm start help
```

---

## Setup Wizard Steps

### Step 1: Dependencies
Checks Node.js and Git are installed.

### Step 2: AI Provider

X2000 auto-detects the best available provider:

| Priority | Provider | Description |
|----------|----------|-------------|
| 1 | **Claude Code CLI** | Uses your Claude Pro/Max subscription - **no API credits!** |
| 2 | Anthropic API | Pay-per-use with API key |
| 3 | OpenAI API | GPT-4 with API key |
| 4 | Ollama | Free, runs locally |

**Recommended: Install Claude Code CLI to use your subscription!**

```bash
# Install Claude Code CLI
npm install -g @anthropic-ai/claude-code

# Log in with your Claude account
claude login
```

Once installed, X2000 automatically uses your subscription. No API key needed.

### Step 3: Communication Channels
Set up any combination:
- **Telegram** - Create bot via @BotFather
- **WhatsApp** - Scan QR code on first start
- **iMessage** - macOS only, needs Accessibility permissions
- **Discord** - Create bot in developer portal
- **Email** - Gmail, Outlook, or custom SMTP

### Step 4: Autonomy Level
| Level | What X2000 Can Do |
|-------|-------------------|
| 1 | Read files, analyze, answer questions |
| 2 | + Write/edit files |
| 3 | + Run shell commands, git |
| 4 | Full autonomy (recommended) |

### Step 5: Gateway Settings
- Port (default 3000)
- Auto-start on login

---

## Why X2000 > OpenClaw

| Feature | OpenClaw | X2000 |
|---------|----------|-------|
| Setup time | 30+ minutes | 5 minutes |
| Subscription usage | Requires separate Chutes auth | Uses your Claude subscription directly |
| Credential storage | 6+ scattered locations | One unified location |
| Auth options | 15+ confusing choices | Auto-detect (just install `claude` CLI) |
| Channel setup | Complex, error-prone | Step-by-step guided |
| Error handling | Reports and waits | Fixes automatically |
| Deployment verification | None | Built-in |
| Documentation | 7 separate guides | One clear README |

---

## Configuration Files

All stored in `~/.x2000/`:

```
~/.x2000/
├── config.json       # Main config
├── credentials.json  # All secrets (mode 600)
├── .env              # Environment variables
└── logs/
    ├── gateway.log     # Output
    └── gateway.err.log # Errors
```

---

## API

Gateway runs at `localhost:3000`:

```bash
# Health check
curl http://localhost:3000/health

# Status
curl http://localhost:3000/api/status

# Send task
curl -X POST http://localhost:3000/api/message \
  -H "Content-Type: application/json" \
  -d '{"content": "What time is it?"}'
```

WebSocket available for streaming at `ws://localhost:3000`.

---

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
│  │                      CHANNELS                                   │     │
│  │    Telegram │ WhatsApp │ iMessage │ Discord │ Email │ CLI      │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                    MEMORY SYSTEM                                │     │
│  │           Patterns │ Learnings │ Skills │ Decisions            │     │
│  └────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### Gateway won't start

```bash
# Check what's using port 3000
lsof -i :3000

# View logs
cat ~/.x2000/logs/gateway.log
cat ~/.x2000/logs/gateway.err.log
```

### Telegram not working

1. Message your bot directly (not in group first)
2. Check token: `cat ~/.x2000/credentials.json`
3. Restart: `npm start daemon restart`

### Reset everything

```bash
rm -rf ~/.x2000
npm start setup
```

---

## License

MIT
