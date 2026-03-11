/**
 * X2000 Gateway Server
 *
 * The core daemon that runs X2000. This is what gets installed as a background service.
 * It handles:
 * - HTTP API for direct access
 * - WebSocket for real-time streaming
 * - Channel monitoring (Telegram, iMessage, etc.)
 * - Brain factory orchestration via Claude Agent SDK
 *
 * AUTHENTICATION:
 * X2000 uses the Claude Agent SDK with API key authentication.
 * Set ANTHROPIC_API_KEY in your environment or ~/.x2000/.env
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { config } from 'dotenv';
import { resolve, join } from 'path';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { v4 as uuidv4 } from 'uuid';

// Load environment
const X2000_DIR = join(homedir(), '.x2000');
config({ path: join(X2000_DIR, '.env') });
config({ path: resolve(process.cwd(), '.env') });

import { toolRegistry } from '../tools/index.js';
import { memoryManager } from '../memory/manager.js';
import { orchestrate, runTask, brainDefinitions, allBrainNames } from '../sdk/index.js';

// ============================================================================
// Types
// ============================================================================

export interface X2000Config {
  port: number;
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
  brainsUsed: string[];
  toolCalls: Array<{ tool: string; input: unknown; result: unknown }>;
}

// ============================================================================
// Configuration
// ============================================================================

const CONFIG_PATH = join(X2000_DIR, 'config.json');

export function loadConfig(): X2000Config {
  if (existsSync(CONFIG_PATH)) {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  }

  // Default config
  return {
    port: 3000,
    model: 'claude-sonnet-4-20250514',
    apiKey: process.env.ANTHROPIC_API_KEY,
    channels: {},
    trustLevel: 4,
  };
}

export function saveConfig(config: X2000Config): void {
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
// Task Execution via SDK
// ============================================================================

async function executeTask(
  task: AgentTask,
  onStream: (content: string) => void,
  onBrainUse: (brain: string) => void
): Promise<void> {
  task.status = 'running';

  try {
    // Use the SDK orchestrator
    for await (const message of orchestrate(task.content, {
      workingDirectory: process.cwd(),
      permissionMode: 'bypassPermissions',
    })) {
      // Handle different message types
      if (message.type === 'assistant') {
        for (const block of message.message.content) {
          if ('text' in block) {
            onStream(block.text);
            task.result = (task.result || '') + block.text;
          }
        }
      }

      // Track tool usage via tool_progress messages
      if (message.type === 'tool_progress') {
        const toolName = message.tool_name || 'unknown';

        // Only track if not already in the list
        const existingCall = task.toolCalls.find(tc => tc.tool === toolName);
        if (!existingCall) {
          task.toolCalls.push({
            tool: toolName,
            input: null,
            result: null,
          });
        }

        // Track brain usage when Agent tool is used
        if (toolName === 'Agent' || toolName === 'Task') {
          // Brain name will be part of the tool progress
          // We track it here for visibility
        }
      }

      // Track subagent/brain usage via task notifications
      if (message.type === 'tool_use_summary') {
        // Tool use summaries provide overview of what was done
      }

      // Final result
      if (message.type === 'result' && message.subtype === 'success') {
        task.result = message.result || task.result;
      }
    }

    task.status = 'completed';
  } catch (err) {
    task.status = 'failed';
    task.result = `Error: ${err instanceof Error ? err.message : String(err)}`;
    throw err;
  }
}

// ============================================================================
// HTTP Server
// ============================================================================

export async function startGateway(): Promise<void> {
  const cfg = loadConfig();

  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                              X2000 GATEWAY                                 ║');
  console.log('║            Autonomous AI Fleet · Claude Agent SDK · 44 Brains             ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝');
  console.log('');

  // Check for API key
  const apiKey = cfg.apiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[Gateway] ERROR: No API key found!');
    console.error('[Gateway] Set ANTHROPIC_API_KEY environment variable or run: npm start setup');
    process.exit(1);
  }

  console.log(`[Gateway] API Key: ${apiKey.slice(0, 12)}...`);
  console.log(`[Gateway] Brains: ${allBrainNames.length} specialized brains ready`);

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
    res.json({ status: 'ok', version: '2.0.0', sdk: 'claude-agent-sdk' });
  });

  // Status
  app.get('/api/status', (req, res) => {
    res.json({
      running: true,
      sdk: 'claude-agent-sdk',
      brains: allBrainNames.length,
      brainsAvailable: allBrainNames,
      model: cfg.model,
      trustLevel: cfg.trustLevel,
      sessions: sessions.size,
    });
  });

  // List brains
  app.get('/api/brains', (req, res) => {
    const brains = Object.entries(brainDefinitions).map(([key, brain]) => ({
      key,
      name: brain.name,
      description: brain.description,
      model: brain.model || 'sonnet',
    }));
    res.json({ brains });
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
      status: 'pending',
      brainsUsed: ['ceo-brain'],
      toolCalls: [],
    };

    try {
      await executeTask(
        task,
        () => {}, // No streaming for REST
        () => {}
      );

      // Update session
      session.messages.push({ role: 'user', content });
      session.messages.push({ role: 'assistant', content: task.result || '' });
      session.updatedAt = new Date();

      res.json({
        success: true,
        taskId: task.id,
        result: task.result,
        brainsUsed: task.brainsUsed,
        toolCalls: task.toolCalls.length,
      });
    } catch (err) {
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
        sdk: 'claude-agent-sdk',
        brains: allBrainNames.length,
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
        status: 'pending',
        brainsUsed: ['ceo-brain'],
        toolCalls: [],
      };

      ws.send(JSON.stringify({
        type: 'task_started',
        data: { taskId: task.id },
      }));

      try {
        await executeTask(
          task,
          (text) => {
            ws.send(JSON.stringify({ type: 'stream', data: { content: text } }));
          },
          (brain) => {
            ws.send(JSON.stringify({ type: 'brain_use', data: { brain } }));
          }
        );

        // Update session
        session.messages.push({ role: 'user', content });
        session.messages.push({ role: 'assistant', content: task.result || '' });
        session.updatedAt = new Date();

        ws.send(JSON.stringify({
          type: 'task_completed',
          data: {
            success: true,
            result: task.result,
            brainsUsed: task.brainsUsed,
            toolCalls: task.toolCalls.length,
          },
        }));
      } catch (err) {
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
          sdk: 'claude-agent-sdk',
          brains: allBrainNames.length,
          model: cfg.model,
          trustLevel: cfg.trustLevel,
          sessions: sessions.size,
        },
      }));
      break;

    case 'brains':
      ws.send(JSON.stringify({
        type: 'brains',
        data: {
          brains: Object.entries(brainDefinitions).map(([key, brain]) => ({
            key,
            name: brain.name,
            description: brain.description,
          })),
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
