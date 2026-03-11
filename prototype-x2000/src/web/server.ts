/**
 * X2000 Web Interface
 *
 * Standalone web app for the autonomous AI fleet.
 * Runs on localhost, uses your Max subscription.
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

// Load environment
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '../..');
config({ path: join(rootDir, '.env') });

import { providerManager } from '../ai/providers/index.js';
import { AgentLoop } from '../agents/loop.js';
import { memoryManager } from '../memory/manager.js';
import type { Task } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// Configuration
// ============================================================================

const PORT = parseInt(process.env.X2000_PORT || '3000');

// ============================================================================
// OAuth Token Support
// ============================================================================

async function getOAuthToken(): Promise<string | null> {
  // Check environment variable first
  if (process.env.CLAUDE_CODE_OAUTH_TOKEN) {
    return process.env.CLAUDE_CODE_OAUTH_TOKEN;
  }

  // Try to get from Claude Code credentials (macOS Keychain)
  try {
    const token = execSync(
      'security find-generic-password -s "Claude Code-credentials" -w 2>/dev/null',
      { encoding: 'utf-8' }
    ).trim();
    if (token) {
      console.log('[X2000] Found OAuth token from Claude Code Keychain');
      return token;
    }
  } catch {
    // Not on macOS or not found
  }

  // Try credentials file
  const credPath = join(process.env.HOME || '', '.claude', '.credentials.json');
  if (existsSync(credPath)) {
    try {
      const creds = JSON.parse(readFileSync(credPath, 'utf-8'));
      if (creds.access_token) {
        console.log('[X2000] Found OAuth token from credentials file');
        return creds.access_token;
      }
    } catch {
      // Invalid JSON
    }
  }

  return null;
}

// ============================================================================
// Server Setup
// ============================================================================

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Serve static files
app.use(express.static(join(__dirname, 'public')));
app.use(express.json());

// ============================================================================
// State
// ============================================================================

interface SessionState {
  currentTask: Task | null;
  isRunning: boolean;
  history: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
}

const sessions = new Map<WebSocket, SessionState>();

// ============================================================================
// WebSocket Handler
// ============================================================================

wss.on('connection', (ws) => {
  console.log('[X2000] Client connected');

  // Initialize session
  sessions.set(ws, {
    currentTask: null,
    isRunning: false,
    history: [],
  });

  // Send initial state
  ws.send(JSON.stringify({
    type: 'init',
    data: {
      provider: providerManager.currentProvider,
      availableProviders: providerManager.listAvailable(),
      memoryStats: {
        patterns: 0,
        learnings: 0,
        skills: 0,
      },
    },
  }));

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      await handleMessage(ws, message);
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: String(error) },
      }));
    }
  });

  ws.on('close', () => {
    console.log('[X2000] Client disconnected');
    sessions.delete(ws);
  });
});

// ============================================================================
// Message Handler
// ============================================================================

async function handleMessage(ws: WebSocket, message: { type: string; data?: any }) {
  const session = sessions.get(ws);
  if (!session) return;

  switch (message.type) {
    case 'task':
      await handleTask(ws, session, message.data.content);
      break;

    case 'stop':
      session.isRunning = false;
      ws.send(JSON.stringify({ type: 'stopped' }));
      break;

    case 'status':
      ws.send(JSON.stringify({
        type: 'status',
        data: {
          isRunning: session.isRunning,
          provider: providerManager.currentProvider,
          currentTask: session.currentTask?.subject || null,
        },
      }));
      break;

    case 'switch_provider':
      try {
        providerManager.switchTo(message.data.provider);
        ws.send(JSON.stringify({
          type: 'provider_switched',
          data: { provider: providerManager.currentProvider },
        }));
      } catch (error) {
        ws.send(JSON.stringify({
          type: 'error',
          data: { message: String(error) },
        }));
      }
      break;

    case 'memory':
      // Return memory contents
      ws.send(JSON.stringify({
        type: 'memory',
        data: {
          patterns: [],
          learnings: [],
          skills: [],
        },
      }));
      break;
  }
}

// ============================================================================
// Task Execution
// ============================================================================

async function handleTask(ws: WebSocket, session: SessionState, taskContent: string) {
  if (session.isRunning) {
    ws.send(JSON.stringify({
      type: 'error',
      data: { message: 'A task is already running' },
    }));
    return;
  }

  session.isRunning = true;
  session.history.push({
    role: 'user',
    content: taskContent,
    timestamp: new Date(),
  });

  const task: Task = {
    id: uuidv4(),
    subject: taskContent.slice(0, 100),
    description: taskContent,
    status: 'in_progress',
    priority: 'high',
    subtaskIds: [],
    blockedBy: [],
    blocks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: { source: 'web', provider: providerManager.currentProvider },
  };

  session.currentTask = task;

  ws.send(JSON.stringify({
    type: 'task_started',
    data: { taskId: task.id, subject: task.subject },
  }));

  const startTime = Date.now();

  try {
    const provider = providerManager.currentProvider;

    // For claude-code provider, bypass the agent loop and run directly
    // Claude Code CLI is already an autonomous agent with its own tools
    if (provider === 'claude-code') {
      const result = await runWithClaudeCode(ws, session, task);

      session.history.push({
        role: 'assistant',
        content: result,
        timestamp: new Date(),
      });

      ws.send(JSON.stringify({
        type: 'task_completed',
        data: {
          success: true,
          output: result,
          iterations: 1,
          toolCalls: 0, // Claude Code handles tools internally
          duration: Date.now() - startTime,
          learnings: [],
        },
      }));
    } else {
      // For other providers (Anthropic API, OpenAI, etc), use X2000's tool system
      const loop = new AgentLoop({
        brainType: 'ceo',
        trustLevel: 4,
        maxIterations: 50,
        maxToolCalls: 150,
        timeoutMs: 600000,
        retryOnError: true,
        selfCorrect: true,
        onIteration: (iter) => {
          if (!session.isRunning) {
            throw new Error('Task stopped by user');
          }

          ws.send(JSON.stringify({
            type: 'iteration',
            data: {
              iteration: iter.iteration,
              thought: iter.thought,
              action: iter.action ? {
                tool: iter.action.tool,
                success: iter.action.result.success,
              } : null,
              completed: iter.completed,
            },
          }));
        },
      });

      const result = await loop.run(task);

      session.history.push({
        role: 'assistant',
        content: typeof result.output === 'string' ? result.output : JSON.stringify(result.output),
        timestamp: new Date(),
      });

      ws.send(JSON.stringify({
        type: 'task_completed',
        data: {
          success: result.success,
          output: result.output,
          iterations: result.iterations.length,
          toolCalls: result.toolCalls.length,
          duration: result.totalDuration,
          learnings: result.learnings,
        },
      }));
    }
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'task_error',
      data: { message: String(error) },
    }));
  } finally {
    session.isRunning = false;
    session.currentTask = null;
  }
}

/**
 * Run task directly with Claude Code CLI
 * Claude Code is already an autonomous agent - we just need to provide context and stream output
 */
async function runWithClaudeCode(
  ws: WebSocket,
  session: SessionState,
  task: Task
): Promise<string> {
  const { ClaudeCodeProvider } = await import('../ai/providers/claude-code.js');

  const provider = new ClaudeCodeProvider({});

  // Set up streaming to send updates to the client
  provider.setStreamCallback((event) => {
    if (!session.isRunning) {
      provider.stop();
      return;
    }

    switch (event.type) {
      case 'text':
        ws.send(JSON.stringify({
          type: 'stream',
          data: { content: event.content },
        }));
        break;

      case 'tool_use':
        ws.send(JSON.stringify({
          type: 'tool_use',
          data: { tool: event.tool },
        }));
        break;

      case 'tool_result':
        ws.send(JSON.stringify({
          type: 'tool_result',
          data: { result: event.result },
        }));
        break;

      case 'error':
        ws.send(JSON.stringify({
          type: 'error',
          data: { message: event.content },
        }));
        break;

      case 'done':
        ws.send(JSON.stringify({
          type: 'agent_done',
          data: { content: event.content },
        }));
        break;
    }
  });

  // Build system prompt with X2000 context
  const systemPrompt = `You are an autonomous AI agent working for X2000, an AI Fleet system.

Your capabilities:
- Read, write, and edit files
- Run shell commands
- Search the web
- Navigate and understand codebases

The user's working context is in: ${process.cwd()}

Complete the task fully and autonomously. Report what you accomplish.`;

  const response = await provider.chat(
    [{ role: 'user', content: task.description }],
    { systemPrompt, workingDirectory: process.cwd() }
  );

  return response.content;
}

// ============================================================================
// REST API
// ============================================================================

app.get('/api/status', (req, res) => {
  res.json({
    running: true,
    provider: providerManager.currentProvider,
    availableProviders: providerManager.listAvailable(),
  });
});

app.get('/api/brains', (req, res) => {
  // List all available brains
  const brains = [
    'ceo', 'engineering', 'product', 'design', 'research', 'qa',
    'finance', 'marketing', 'sales', 'operations', 'legal', 'hr',
    'security', 'data', 'cloud', 'mobile', 'ai', 'automation',
    'analytics', 'devrel', 'branding', 'email', 'social-media',
    'video', 'community', 'support', 'investor', 'pricing',
    'innovation', 'content', 'localization', 'game-design',
    'partnership', 'customer-success', 'growth', 'mba',
    'options-trading', 'frontend', 'backend', 'database',
    'debugger', 'devops', 'architecture', 'optimize', 'testing', 'performance'
  ];
  res.json({ brains, count: brains.length });
});

// ============================================================================
// Start Server
// ============================================================================

async function start() {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                              X2000                                         ║');
  console.log('║              Autonomous AI Fleet · Web Interface                          ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝');
  console.log('');

  // Initialize providers
  // Priority: claude-code (Max subscription via CLI) > anthropic (API key) > openai > ollama
  await providerManager.initialize({
    preferredProvider: 'auto', // Auto-detect best available
  });

  if (providerManager.listAvailable().length === 0) {
    console.error('[X2000] No LLM providers available!');
    console.error('[X2000] Set ANTHROPIC_API_KEY, OPENAI_API_KEY, or run Ollama');
    process.exit(1);
  }

  // Initialize memory
  try {
    await memoryManager.initialize();
    console.log('[X2000] Memory system initialized');
  } catch {
    console.log('[X2000] Memory system offline (will work without persistence)');
  }

  // Start server
  server.listen(PORT, () => {
    console.log('');
    console.log(`[X2000] Running at http://localhost:${PORT}`);
    console.log('[X2000] Open this URL in your browser');
    console.log('');
  });
}

start().catch(console.error);
