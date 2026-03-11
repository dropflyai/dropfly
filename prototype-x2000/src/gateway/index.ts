/**
 * X2000 Gateway Server
 *
 * The core daemon that runs X2000. This is what gets installed as a background service.
 * It handles:
 * - HTTP API for direct access
 * - WebSocket for real-time streaming
 * - Channel monitoring (Telegram, iMessage, etc.)
 * - Agent execution with tool support
 *
 * This runs INDEPENDENTLY - not nested inside Claude Code.
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { config } from 'dotenv';
import { resolve, join } from 'path';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuidv4 } from 'uuid';

// Load environment
const X2000_DIR = join(homedir(), '.x2000');
config({ path: join(X2000_DIR, '.env') });
config({ path: resolve(process.cwd(), '.env') });

import { toolRegistry, getToolDefinitions, executeTool, type ToolContext } from '../tools/index.js';
import { memoryManager } from '../memory/manager.js';
import { isAuthenticated, loadCredentials, login as oauthLogin } from '../auth/oauth.js';

// ============================================================================
// Types
// ============================================================================

interface X2000Config {
  port: number;
  provider: 'anthropic' | 'openai' | 'ollama';
  model: string;
  apiKey?: string;
  channels: {
    telegram?: { token: string; enabled: boolean };
    imessage?: { enabled: boolean };
    whatsapp?: { enabled: boolean };
    discord?: { token: string; enabled: boolean };
    email?: { provider: string; address: string; smtpHost?: string; smtpPort?: number };
    signal?: { phoneNumber: string; enabled: boolean };
    matrix?: { homeserver: string; userId: string; enabled: boolean };
  };
  trustLevel: 1 | 2 | 3 | 4;
}

interface Session {
  id: string;
  channel: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  createdAt: Date;
  updatedAt: Date;
}

interface AgentTask {
  id: string;
  sessionId: string;
  content: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
  toolCalls: Array<{ tool: string; input: unknown; result: unknown }>;
}

// ============================================================================
// Configuration
// ============================================================================

const CONFIG_PATH = join(X2000_DIR, 'config.json');
const SESSIONS_DIR = join(X2000_DIR, 'sessions');

function loadConfig(): X2000Config {
  if (existsSync(CONFIG_PATH)) {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  }

  // Default config
  return {
    port: 3000,
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    apiKey: process.env.ANTHROPIC_API_KEY,
    channels: {},
    trustLevel: 4,
  };
}

function saveConfig(config: X2000Config): void {
  if (!existsSync(X2000_DIR)) {
    mkdirSync(X2000_DIR, { recursive: true });
  }
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

// ============================================================================
// Session Management
// ============================================================================

const sessions = new Map<string, Session>();

function getOrCreateSession(sessionKey: string, channel: string): Session {
  if (sessions.has(sessionKey)) {
    return sessions.get(sessionKey)!;
  }

  const session: Session = {
    id: sessionKey,
    channel,
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  sessions.set(sessionKey, session);
  return session;
}

// ============================================================================
// Agent Execution (Direct LLM API + Tools)
// ============================================================================

async function runAgent(
  task: AgentTask,
  config: X2000Config & { useOAuth?: boolean },
  onStream: (content: string) => void,
  onToolUse: (tool: string) => void
): Promise<string> {
  // Determine authentication method
  let clientConfig: { apiKey?: string; authToken?: string } = {};

  if (config.useOAuth && config.provider === 'anthropic') {
    const credentials = loadCredentials();
    if (credentials) {
      // Use OAuth token (when Anthropic supports it)
      // For now, fall back to API key if available
      clientConfig.apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
      // Future: clientConfig.authToken = credentials.accessToken;
    }
  } else {
    clientConfig.apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
  }

  const client = new Anthropic(clientConfig);

  const session = sessions.get(task.sessionId);
  const messages = session?.messages || [];

  // Add user message
  const userMessage = { role: 'user' as const, content: task.content };
  messages.push(userMessage);

  // Get available tools based on trust level
  const tools = getToolDefinitions(config.trustLevel);

  const systemPrompt = `You are X2000, an autonomous AI agent fleet. You have access to tools to complete tasks.

CORE PRINCIPLE: BE FULLY AUTONOMOUS
- DO NOT ask for permission - just do the work
- DO NOT report problems and wait - fix them immediately
- DO NOT say "should I fix this?" - fix it
- If something fails, diagnose and fix it yourself

Your capabilities:
- Read, write, and edit files
- Execute shell commands
- Search the web
- Process and analyze data
- Verify deployments work

MANDATORY VERIFICATION:
After ANY deployment (Vercel, Netlify, server, etc.):
1. ALWAYS use verify_deployment tool to check the URL returns 200
2. If verification FAILS, diagnose and fix the issue immediately
3. Re-deploy after fixes
4. Re-verify until successful
5. NEVER report "deployed" unless verification passes

AUTONOMOUS ERROR HANDLING:
- If a build fails: Read error logs, fix the code, retry
- If a deploy fails: Check env vars, fix config, retry
- If verification fails: Investigate root cause, fix it, re-verify
- Keep iterating until the task is ACTUALLY complete

Trust Level: ${config.trustLevel} (${config.trustLevel === 4 ? 'Full autonomy' : 'Limited'})`;

  let fullResponse = '';
  let continueLoop = true;
  let iteration = 0;
  const maxIterations = 50;

  while (continueLoop && iteration < maxIterations) {
    iteration++;

    const response = await client.messages.create({
      model: config.model,
      max_tokens: 8192,
      system: systemPrompt,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      tools: tools as Anthropic.Tool[],
    });

    // Process response
    let textContent = '';
    const toolUses: Array<{ id: string; name: string; input: Record<string, unknown> }> = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        textContent += block.text;
        onStream(block.text);
      } else if (block.type === 'tool_use') {
        toolUses.push({
          id: block.id,
          name: block.name,
          input: block.input as Record<string, unknown>,
        });
      }
    }

    fullResponse += textContent;

    // If no tool calls, we're done
    if (toolUses.length === 0) {
      continueLoop = false;
      break;
    }

    // Execute tools
    const toolResults: Array<{ type: 'tool_result'; tool_use_id: string; content: string }> = [];

    for (const toolUse of toolUses) {
      onToolUse(toolUse.name);

      const context: ToolContext = {
        brainType: 'ceo',
        trustLevel: config.trustLevel,
        sessionId: task.sessionId,
        workingDirectory: process.cwd(),
        approved: true,
      };

      const result = await executeTool(toolUse.name, toolUse.input, context);

      task.toolCalls.push({
        tool: toolUse.name,
        input: toolUse.input,
        result,
      });

      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: JSON.stringify(result),
      });
    }

    // Add assistant message and tool results to conversation
    messages.push({
      role: 'assistant',
      content: textContent || `[Used tools: ${toolUses.map(t => t.name).join(', ')}]`,
    });

    // Add tool results as user message
    messages.push({
      role: 'user',
      content: toolResults.map(r => `Tool ${r.tool_use_id} result: ${r.content}`).join('\n\n'),
    });

    // Check if we should continue
    if (response.stop_reason === 'end_turn') {
      continueLoop = false;
    }
  }

  // Update session
  if (session) {
    session.messages = messages;
    session.updatedAt = new Date();
  }

  return fullResponse;
}

// ============================================================================
// HTTP Server
// ============================================================================

export async function startGateway(): Promise<void> {
  const cfg = loadConfig() as X2000Config & { useOAuth?: boolean };

  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                              X2000 GATEWAY                                 ║');
  console.log('║                  Autonomous AI Fleet · Daemon Mode                        ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝');
  console.log('');

  // Check authentication if using OAuth
  if (cfg.useOAuth && cfg.provider === 'anthropic') {
    if (!isAuthenticated()) {
      console.log('[Gateway] OAuth authentication required...');
      const credentials = await oauthLogin();
      if (!credentials) {
        console.error('[Gateway] Authentication failed. Exiting.');
        process.exit(1);
      }
    } else {
      console.log('[Gateway] Using OAuth credentials');
    }
  }

  // Initialize tools
  await toolRegistry.initialize();
  console.log('[Gateway] Tools initialized');

  // Initialize memory
  try {
    await memoryManager.initialize();
    console.log('[Gateway] Memory system initialized');
  } catch {
    console.log('[Gateway] Memory system offline (will work without persistence)');
  }

  // Create Express app
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  app.use(express.json());

  // ========== REST API ==========

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', version: '2.0.0' });
  });

  // Status
  app.get('/api/status', (req, res) => {
    res.json({
      running: true,
      provider: cfg.provider,
      model: cfg.model,
      trustLevel: cfg.trustLevel,
      sessions: sessions.size,
    });
  });

  // Send message (REST)
  app.post('/api/message', async (req, res) => {
    const { content, sessionKey = 'default', channel = 'api' } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'content is required' });
    }

    const session = getOrCreateSession(sessionKey, channel);
    const task: AgentTask = {
      id: uuidv4(),
      sessionId: session.id,
      content,
      status: 'running',
      toolCalls: [],
    };

    try {
      const result = await runAgent(
        task,
        cfg,
        () => {}, // No streaming for REST
        () => {}
      );

      task.status = 'completed';
      task.result = result;

      res.json({
        success: true,
        taskId: task.id,
        result,
        toolCalls: task.toolCalls.length,
      });
    } catch (err) {
      task.status = 'failed';
      res.status(500).json({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });

  // ========== WebSocket ==========

  wss.on('connection', (ws) => {
    console.log('[Gateway] Client connected');

    ws.send(JSON.stringify({
      type: 'init',
      data: {
        provider: cfg.provider,
        model: cfg.model,
        trustLevel: cfg.trustLevel,
      },
    }));

    ws.on('message', async (data) => {
      try {
        const msg = JSON.parse(data.toString());
        await handleWsMessage(ws, msg, cfg);
      } catch (err) {
        ws.send(JSON.stringify({
          type: 'error',
          data: { message: String(err) },
        }));
      }
    });

    ws.on('close', () => {
      console.log('[Gateway] Client disconnected');
    });
  });

  // Start server
  server.listen(cfg.port, () => {
    console.log(`[Gateway] Running at http://localhost:${cfg.port}`);
    console.log('[Gateway] Ready to receive tasks');
    console.log('');
  });
}

async function handleWsMessage(
  ws: WebSocket,
  msg: { type: string; data?: Record<string, unknown> },
  cfg: X2000Config
): Promise<void> {
  switch (msg.type) {
    case 'task': {
      const content = msg.data?.content as string;
      const sessionKey = (msg.data?.sessionKey as string) || 'default';
      const channel = (msg.data?.channel as string) || 'websocket';

      if (!content) {
        ws.send(JSON.stringify({ type: 'error', data: { message: 'content required' } }));
        return;
      }

      const session = getOrCreateSession(sessionKey, channel);
      const task: AgentTask = {
        id: uuidv4(),
        sessionId: session.id,
        content,
        status: 'running',
        toolCalls: [],
      };

      ws.send(JSON.stringify({
        type: 'task_started',
        data: { taskId: task.id },
      }));

      try {
        const result = await runAgent(
          task,
          cfg,
          (text) => {
            ws.send(JSON.stringify({ type: 'stream', data: { content: text } }));
          },
          (tool) => {
            ws.send(JSON.stringify({ type: 'tool_use', data: { tool } }));
          }
        );

        task.status = 'completed';
        task.result = result;

        ws.send(JSON.stringify({
          type: 'task_completed',
          data: {
            success: true,
            result,
            toolCalls: task.toolCalls.length,
          },
        }));
      } catch (err) {
        task.status = 'failed';
        ws.send(JSON.stringify({
          type: 'task_error',
          data: { message: err instanceof Error ? err.message : String(err) },
        }));
      }
      break;
    }

    case 'status':
      ws.send(JSON.stringify({
        type: 'status',
        data: {
          provider: cfg.provider,
          model: cfg.model,
          trustLevel: cfg.trustLevel,
          sessions: sessions.size,
        },
      }));
      break;
  }
}

// ============================================================================
// Entry Point
// ============================================================================

// Run if this is the main module
const isMainModule = process.argv[1]?.includes('gateway');
if (isMainModule) {
  startGateway().catch(console.error);
}

export { loadConfig, saveConfig, type X2000Config };
