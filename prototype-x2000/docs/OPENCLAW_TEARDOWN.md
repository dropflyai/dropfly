# OpenClaw Teardown Analysis

> Complete technical analysis of OpenClaw's architecture for X2000 implementation

**Analyzed Codebase:** `/DropFly-PROJECTS/dropfly-openclaw/`
**Date:** 2026-03-09

---

## Executive Summary

OpenClaw is a sophisticated AI agent system built on `@mariozechner/pi-agent-core` that provides:
- **Tool-based autonomy** - Agents can execute shell commands, edit files, browse web
- **Multi-session management** - Serialized runs with warm state
- **Embeddings-based memory** - Vector search + FTS hybrid
- **Multi-channel support** - 20+ messaging platforms
- **Sub-agent spawning** - Hierarchical agent delegation

**X2000 Gap:** We have orchestration but lack tool execution. OpenClaw shows exactly how to implement autonomous actions.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              OPENCLAW ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │                         GATEWAY (src/gateway/)                      │     │
│  │   RPC Server │ Message Routing │ Channel Management                │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                    │                                         │
│                                    ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │                      AGENT LOOP (pi-agent-core)                     │     │
│  │   Model Inference → Tool Execution → Streaming → Persistence       │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                    │                                         │
│         ┌──────────────────────────┼──────────────────────────┐             │
│         ▼                          ▼                          ▼             │
│  ┌─────────────┐           ┌─────────────┐           ┌─────────────┐        │
│  │   CODING    │           │   OPENCLAW  │           │   CHANNEL   │        │
│  │   TOOLS     │           │   TOOLS     │           │   TOOLS     │        │
│  │ Read/Write  │           │ Exec/Browse │           │ Msg/Discord │        │
│  │ Edit/Patch  │           │ Sessions    │           │ Slack/etc   │        │
│  └─────────────┘           └─────────────┘           └─────────────┘        │
│                                    │                                         │
│                                    ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │                      MEMORY SYSTEM (src/memory/)                    │     │
│  │   SQLite + sqlite-vec │ Embeddings │ Hybrid Search │ Session Index │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Tool System Analysis

### 1.1 Tool Interface (from pi-agent-core)

```typescript
// src/agents/tools/common.ts
import type { AgentTool, AgentToolResult } from "@mariozechner/pi-agent-core";

export type AnyAgentTool = AgentTool<any, unknown>;
```

Each tool has:
- `name` - Unique identifier
- `description` - What the tool does (for LLM)
- `parameters` - TypeBox schema for inputs
- `execute` - Async function that performs the action

### 1.2 Core Tools

| Tool | File | Purpose |
|------|------|---------|
| **exec** | `bash-tools.exec.ts` (54KB) | Shell command execution |
| **process** | `bash-tools.process.ts` (21KB) | Process management |
| **read** | `pi-tools.read.ts` | Read file contents |
| **write** | `pi-coding-agent` | Write files |
| **edit** | `pi-coding-agent` | Edit files (patch) |
| **apply_patch** | `apply-patch.ts` | Apply unified diffs |
| **browser** | `browser-tool.ts` (25KB) | Headless browser |
| **web_fetch** | `web-tools.ts` | Fetch URLs |
| **web_search** | `web-tools.ts` | Web search |
| **sessions_spawn** | `sessions-spawn-tool.ts` | Spawn sub-agents |
| **message** | `message-tool.ts` | Send messages |
| **memory** | `memory-tool.ts` | Query memory |
| **image** | `image-tool.ts` | Image processing |
| **cron** | `cron-tool.ts` | Scheduled tasks |

### 1.3 Tool Creation Pattern

```typescript
// src/agents/openclaw-tools.ts
export function createOpenClawTools(options?: {
  sandboxBrowserBridgeUrl?: string;
  allowHostBrowserControl?: boolean;
  agentSessionKey?: string;
  agentChannel?: GatewayMessageChannel;
  sandboxed?: boolean;
  config?: OpenClawConfig;
  // ... many more options
}): AnyAgentTool[] {
  return [
    createBrowserTool({ ... }),
    createCanvasTool(),
    createNodesTool({ ... }),
    createCronTool({ ... }),
    createMessageTool({ ... }),
    createTtsTool({ ... }),
    createGatewayTool({ ... }),
    createAgentsListTool({ ... }),
    createSessionsListTool({ ... }),
    createSessionsHistoryTool({ ... }),
    createSessionsSendTool({ ... }),
    createSessionsSpawnTool({ ... }),
    createSessionStatusTool({ ... }),
    createWebSearchTool({ ... }),
    createWebFetchTool({ ... }),
    createImageTool({ ... }),
    ...pluginTools, // Extension tools
  ];
}
```

---

## 2. Shell Execution (bash-tools.exec.ts)

### 2.1 Security Model

```typescript
// Blocklist of dangerous environment variables
const DANGEROUS_HOST_ENV_VARS = new Set([
  "LD_PRELOAD",
  "LD_LIBRARY_PATH",
  "DYLD_INSERT_LIBRARIES",
  "DYLD_LIBRARY_PATH",
  "NODE_OPTIONS",
  "NODE_PATH",
  "PYTHONPATH",
  "PYTHONHOME",
  "BASH_ENV",
  "ENV",
  // ... more
]);

// Validate before execution
function validateHostEnv(env: Record<string, string>): void {
  for (const key of Object.keys(env)) {
    if (DANGEROUS_HOST_ENV_VARS.has(key.toUpperCase())) {
      throw new Error(`Security Violation: Environment variable '${key}' forbidden`);
    }
    if (key.toUpperCase() === "PATH") {
      throw new Error("Security Violation: Custom 'PATH' forbidden on host");
    }
  }
}
```

### 2.2 Approval System

```typescript
// From src/infra/exec-approvals.ts
type ExecSecurity = "sandbox" | "host" | "node";
type ExecAsk = "auto" | "always" | "never";

// Commands can require approval based on:
// - Security level (sandbox vs host)
// - Command pattern matching
// - Allowlist/blocklist configuration
```

### 2.3 Execution Flow

1. **Validate** - Check security constraints, dangerous vars
2. **Resolve** - Determine sandbox vs host execution
3. **Approve** - Check if approval required (with timeout)
4. **Execute** - Spawn process with PTY or fallback
5. **Stream** - Send output chunks to agent
6. **Cleanup** - Handle exit, background, or timeout

---

## 3. Session Management

### 3.1 Session Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AGENT LOOP LIFECYCLE                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. agent RPC validates params, resolves session                        │
│  2. agentCommand runs the agent:                                        │
│     - resolves model + thinking defaults                                │
│     - loads skills snapshot                                              │
│     - calls runEmbeddedPiAgent (pi-agent-core runtime)                 │
│  3. runEmbeddedPiAgent:                                                 │
│     - serializes runs via per-session + global queues                   │
│     - resolves model + auth profile                                      │
│     - subscribes to pi events and streams deltas                        │
│     - enforces timeout -> aborts run if exceeded                        │
│  4. subscribeEmbeddedPiSession bridges pi events to stream:             │
│     - tool events => stream: "tool"                                     │
│     - assistant deltas => stream: "assistant"                           │
│     - lifecycle events => stream: "lifecycle"                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Session State

```typescript
// src/config/sessions/store.ts
// Sessions are stored per-agent under ~/.openclaw/agents/<agentId>/sessions/
// Each session maintains:
// - Transcript (JSONL)
// - Metadata (JSON)
// - Memory index (SQLite)
```

### 3.3 Sub-agent Spawning

```typescript
// src/agents/tools/sessions-spawn-tool.ts
const SessionsSpawnToolSchema = Type.Object({
  task: Type.String(),           // Task description
  label: Type.Optional(String),  // Display label
  agentId: Type.Optional(String),// Target agent
  model: Type.Optional(String),  // Model override
  thinking: Type.Optional(String),// Thinking level
  runTimeoutSeconds: Type.Optional(Number),
  cleanup: optionalStringEnum(["delete", "keep"]),
});

// Spawns isolated background session that announces result back
```

---

## 4. Memory System

### 4.1 Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           MEMORY SYSTEM                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │   FTS       │    │   Vector    │    │   Hybrid    │                 │
│  │  (BM25)     │ +  │  (sqlite-   │ =  │   Search    │                 │
│  │             │    │    vec)     │    │             │                 │
│  └─────────────┘    └─────────────┘    └─────────────┘                 │
│         │                  │                  │                         │
│         └──────────────────┼──────────────────┘                         │
│                            ▼                                            │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                      SQLite Database                            │    │
│  │  - chunks_fts (Full Text Search)                               │    │
│  │  - chunks_vec (Vector embeddings)                              │    │
│  │  - embedding_cache                                              │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Key Components

```typescript
// src/memory/manager.ts (75KB)
const VECTOR_TABLE = "chunks_vec";
const FTS_TABLE = "chunks_fts";
const EMBEDDING_CACHE_TABLE = "embedding_cache";

// Features:
// - Chunking markdown into embeddable segments
// - Embedding via Gemini or OpenAI
// - Hybrid search (keyword + vector)
// - Session transcript indexing
// - File watching for updates
```

### 4.3 Embedding Providers

```typescript
// src/memory/embeddings.ts
// Supports:
// - Gemini (text-embedding-004)
// - OpenAI (text-embedding-3-small)
// - Local (node-llama, optional)
```

---

## 5. Multi-Channel Support

### 5.1 Built-in Channels

| Channel | Directory | Status |
|---------|-----------|--------|
| Telegram | `src/telegram/` | Core |
| Discord | `src/discord/` | Core |
| Slack | `src/slack/` | Core |
| Signal | `src/signal/` | Core |
| iMessage | `src/imessage/` | Core |
| WhatsApp | `src/web/` | Core |

### 5.2 Extension Channels

```
extensions/
├── msteams/
├── matrix/
├── zalo/
├── voice-call/
├── line/
├── feishu/
├── googlechat/
├── mattermost/
├── nextcloud-talk/
├── nostr/
├── twitch/
└── ... more
```

### 5.3 Channel Interface

Each channel implements message handling:
- Receive messages → Route to agent
- Stream assistant responses → Send to channel
- Handle attachments, threads, reactions

---

## 6. Plugin System

### 6.1 Plugin Structure

```
extensions/<plugin-name>/
├── openclaw.plugin.json  // Plugin manifest
├── package.json          // Dependencies
├── src/
│   └── index.ts         // Plugin entry
└── dist/                // Built output
```

### 6.2 Plugin Hooks

```typescript
// Lifecycle hooks
"before_agent_start"    // Inject context before run
"agent_end"             // Inspect after completion
"before_tool_call"      // Intercept tool params
"after_tool_call"       // Intercept tool results
"message_received"      // Inbound message
"message_sending"       // Outbound message
"session_start"         // Session begins
"session_end"           // Session ends
```

---

## 7. What X2000 Needs to Implement

### 7.1 Priority 1: Tool Execution

**Current X2000:** Brains analyze but don't execute
**Need:** Implement tool system like OpenClaw

```typescript
// X2000 needs tools like:
interface X2000Tool {
  name: string;
  description: string;
  parameters: TypeBoxSchema;
  execute: (params: unknown) => Promise<ToolResult>;
}

// Create execution tools:
createFileReadTool()     // Read files
createFileWriteTool()    // Write files
createFileEditTool()     // Edit files (diff-based)
createShellExecTool()    // Run commands
createWebFetchTool()     // Fetch URLs
```

### 7.2 Priority 2: Security Guardrails

**Copy OpenClaw's model:**
- Dangerous env var blocklist
- PATH modification blocking
- Approval system with timeouts
- Sandbox vs host execution modes

### 7.3 Priority 3: Session Persistence

**Current X2000:** Memory persists learnings
**Need:** Full session transcripts like OpenClaw

```typescript
// Session transcript format
interface SessionTranscript {
  messages: Message[];      // Full conversation
  toolCalls: ToolCall[];   // All tool invocations
  metadata: SessionMeta;   // Timestamps, model, etc.
}
```

### 7.4 Priority 4: Sub-agent Spawning

**Current X2000:** CEO orchestrates brains synchronously
**Need:** Async sub-agent spawning like OpenClaw

```typescript
// sessions_spawn equivalent for X2000
interface SpawnSubBrain {
  task: string;
  brainType: BrainType;
  timeout?: number;
  cleanup?: "delete" | "keep";
}
```

---

## 8. Implementation Roadmap for X2000

### Phase 1: Tool System (Week 1-2)

1. Create `src/tools/` directory structure:
   ```
   src/tools/
   ├── base.ts           # Tool interface
   ├── file-read.ts      # Read files
   ├── file-write.ts     # Write files
   ├── file-edit.ts      # Edit with diffs
   ├── shell-exec.ts     # Shell commands
   ├── web-fetch.ts      # HTTP requests
   └── index.ts          # Tool registry
   ```

2. Implement tool executor in brains:
   ```typescript
   class EngineeringBrain extends BaseBrain {
     private tools: Tool[] = [
       createFileReadTool(),
       createFileWriteTool(),
       createShellExecTool(),
     ];

     async execute(task: Task): Promise<TaskResult> {
       // Use AI to decide which tools to call
       // Execute tools with security checks
       // Return results
     }
   }
   ```

### Phase 2: Security Layer (Week 2-3)

1. Port OpenClaw's security validation
2. Implement approval system
3. Add sandbox mode for risky operations
4. Create audit logging

### Phase 3: Session System (Week 3-4)

1. Implement session transcripts
2. Add warm state between runs
3. Create session recovery
4. Implement sub-brain spawning

### Phase 4: Integration (Week 4-5)

1. Wire tools into all 37 brains
2. Test autonomous execution
3. Implement tool use in brain collaboration
4. End-to-end testing

---

## 9. Key Files Reference

| Purpose | OpenClaw File | X2000 Equivalent |
|---------|---------------|------------------|
| Tool registry | `src/agents/openclaw-tools.ts` | `src/tools/index.ts` (NEW) |
| Shell execution | `src/agents/bash-tools.exec.ts` | `src/tools/shell-exec.ts` (NEW) |
| File operations | `pi-coding-agent` | `src/tools/file-*.ts` (NEW) |
| Memory search | `src/memory/manager.ts` | `src/memory/manager.ts` (EXISTS) |
| Session store | `src/config/sessions/store.ts` | `src/agents/session.ts` (EXISTS) |
| Sub-agent spawn | `src/agents/tools/sessions-spawn-tool.ts` | `src/agents/spawn.ts` (EXISTS) |
| Security | `src/infra/exec-approvals.ts` | `src/guardrails/exec.ts` (NEW) |

---

## 10. Conclusion

OpenClaw provides a complete blueprint for autonomous agent execution. The key insight is:

**X2000 has the orchestration (CEO Brain) but lacks the hands (tools).**

To match OpenClaw:
1. **Add tools** - File, shell, web operations
2. **Add security** - Approval system, sandboxing
3. **Add sessions** - Warm state, transcripts
4. **Add spawning** - Async sub-agents

With these additions, X2000 will exceed OpenClaw by combining autonomous execution with:
- 37 specialized brains (vs generic agents)
- Forever-learning memory (vs retrieval only)
- Brain tension protocol (vs isolated agents)
- Earned autonomy (vs all-or-nothing)

**X2000 + Tools = OpenClaw Killer**
