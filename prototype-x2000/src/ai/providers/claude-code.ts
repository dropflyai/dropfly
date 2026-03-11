/**
 * Claude Code Provider
 *
 * Uses Claude Code CLI as a subprocess to leverage Max subscription.
 * Claude Code is the autonomous agent - X2000 provides context and routing.
 *
 * Key insight: Claude Code CLI already handles tools internally.
 * We don't fight this - we embrace it and stream the output.
 */

import { spawn, type ChildProcess } from 'child_process';
import { LLMProvider, type LLMProviderConfig, type Message, type ToolDefinition, type LLMResponse } from './base.js';
import { existsSync, readdirSync, statSync } from 'fs';
import { join, resolve, basename } from 'path';
import { homedir } from 'os';

// Event emitter for streaming updates
type StreamCallback = (event: {
  type: 'thinking' | 'tool_use' | 'tool_result' | 'text' | 'error' | 'done';
  content?: string;
  tool?: string;
  result?: unknown;
}) => void;

export class ClaudeCodeProvider extends LLMProvider {
  private cliPath: string;
  private currentProcess: ChildProcess | null = null;
  private streamCallback: StreamCallback | null = null;

  constructor(config: Omit<LLMProviderConfig, 'model'> & { model?: string; cliPath?: string }) {
    super({
      model: config.model || 'claude-sonnet-4-20250514',
      ...config,
    });
    this.cliPath = config.cliPath || 'claude';
  }

  get name(): string {
    return 'claude-code';
  }

  /**
   * Set a callback to receive streaming updates
   */
  setStreamCallback(callback: StreamCallback | null): void {
    this.streamCallback = callback;
  }

  /**
   * Stop the currently running process
   */
  stop(): void {
    if (this.currentProcess) {
      this.currentProcess.kill('SIGTERM');
      this.currentProcess = null;
    }
  }

  async chat(
    messages: Message[],
    options?: { tools?: ToolDefinition[]; systemPrompt?: string; workingDirectory?: string }
  ): Promise<LLMResponse> {
    // Build full context from all messages
    const context = this.buildContext(messages, options?.systemPrompt);

    // Determine working directory
    const workDir = options?.workingDirectory || this.findProjectDirectory(context);

    // Run Claude Code CLI with full context
    const result = await this.runClaudeCLI(context, workDir);

    return {
      content: result.content,
      toolCalls: [], // Claude Code handles tools internally
      stopReason: 'end_turn',
      usage: {
        inputTokens: 0, // CLI doesn't report this
        outputTokens: 0,
      },
    };
  }

  /**
   * Build comprehensive context for Claude Code
   */
  private buildContext(messages: Message[], systemPrompt?: string): string {
    const parts: string[] = [];

    // Add system context if provided
    if (systemPrompt) {
      parts.push(`## Context\n${systemPrompt}\n`);
    }

    // Get conversation history
    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length > 1) {
      parts.push('## Previous Messages');
      for (let i = 0; i < userMessages.length - 1; i++) {
        parts.push(`- ${userMessages[i].content.slice(0, 200)}...`);
      }
      parts.push('');
    }

    // Current task
    const currentMessage = userMessages[userMessages.length - 1]?.content || '';
    parts.push(`## Task\n${currentMessage}`);

    // Add helpful hints
    parts.push(`
## Instructions
You are an autonomous AI agent. Complete the task fully:
1. Understand what's being asked
2. Explore the codebase to find relevant files
3. Make necessary changes using your tools (Read, Edit, Write, Bash)
4. Verify your changes work (run tests, check builds)
5. Provide a summary of what you accomplished

Work autonomously until the task is complete. Don't ask for confirmation - just do the work.`);

    return parts.join('\n');
  }

  /**
   * Try to find the project directory from the task description
   */
  private findProjectDirectory(context: string): string {
    // Look for project names in common locations
    const projectDirs = [
      process.cwd(),
      join(homedir(), 'Documents'),
      join(homedir(), 'Projects'),
      join(homedir(), 'Code'),
      join(homedir(), 'dev'),
    ];

    // Extract potential project names from context
    const projectNameMatches = context.match(/(?:project|repo|folder|directory|codebase)[:\s]+([a-zA-Z0-9_-]+)/gi);
    const potentialNames: string[] = [];

    if (projectNameMatches) {
      for (const match of projectNameMatches) {
        const name = match.split(/[:\s]+/).pop();
        if (name) potentialNames.push(name);
      }
    }

    // Also look for common project name patterns
    const namePatterns = context.match(/\b([a-zA-Z][a-zA-Z0-9_-]*(?:app|project|web|api|service|client|server|mobile))\b/gi);
    if (namePatterns) {
      potentialNames.push(...namePatterns);
    }

    // Try to find matching directories
    for (const baseDir of projectDirs) {
      if (!existsSync(baseDir)) continue;

      try {
        const entries = readdirSync(baseDir);
        for (const name of potentialNames) {
          const lowerName = name.toLowerCase();
          for (const entry of entries) {
            if (entry.toLowerCase().includes(lowerName)) {
              const fullPath = join(baseDir, entry);
              if (statSync(fullPath).isDirectory()) {
                console.log(`[ClaudeCode] Found project directory: ${fullPath}`);
                return fullPath;
              }
            }
          }
        }
      } catch {
        // Skip directories we can't read
      }
    }

    // Default to current working directory
    return process.cwd();
  }

  private async runClaudeCLI(
    prompt: string,
    workDir: string
  ): Promise<{ content: string }> {
    return new Promise((resolve, reject) => {
      // Use Claude Code CLI in non-interactive mode
      // Use text output for simplicity - JSON requires more complex parsing
      const args = [
        '-p', prompt,
        '--output-format', 'text', // Text output is most reliable
        '--permission-mode', 'bypassPermissions', // Allow autonomous operation
      ];

      console.log(`[ClaudeCode] Running in: ${workDir}`);
      console.log(`[ClaudeCode] Task: ${prompt.slice(0, 100)}...`);

      const proc = spawn(this.cliPath, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        cwd: workDir,
        shell: false,
        env: {
          ...process.env,
          ANTHROPIC_API_KEY: undefined, // Use Claude Code's own auth
        },
      });

      this.currentProcess = proc;

      let output = '';
      let lastText = '';

      proc.stdout.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;
        lastText += chunk;

        // Stream text output to callback in real-time
        this.streamCallback?.({ type: 'text', content: chunk });
      });

      proc.stderr.on('data', (data) => {
        const text = data.toString();
        console.log(`[ClaudeCode] ${text}`);
        this.streamCallback?.({ type: 'text', content: `[stderr] ${text}` });
      });

      // Long timeout for complex tasks (30 minutes)
      const timeoutMs = 1800000;
      const timeout = setTimeout(() => {
        proc.kill();
        this.currentProcess = null;
        reject(new Error(`Claude CLI timed out after 30 minutes`));
      }, timeoutMs);

      proc.on('close', (code) => {
        clearTimeout(timeout);
        this.currentProcess = null;

        console.log(`[ClaudeCode] CLI exited with code ${code}`);
        this.streamCallback?.({ type: 'done' });

        if (code !== 0 && !lastText) {
          resolve({ content: `Task ended with code ${code}. Output:\n${output.slice(-2000)}` });
          return;
        }

        // Return accumulated text or parse final JSON
        if (lastText) {
          resolve({ content: lastText });
        } else {
          // Try to parse entire output as JSON
          try {
            const parsed = JSON.parse(output);
            resolve({
              content: parsed.result || parsed.content || parsed.text || JSON.stringify(parsed, null, 2),
            });
          } catch {
            resolve({ content: output.trim() || 'Task completed.' });
          }
        }
      });

      proc.on('error', (err) => {
        clearTimeout(timeout);
        this.currentProcess = null;
        reject(new Error(`Failed to spawn Claude CLI: ${err.message}`));
      });
    });
  }

  /**
   * Handle streaming events from Claude Code
   */
  private handleStreamEvent(event: Record<string, unknown>): void {
    if (!this.streamCallback) return;

    const type = event.type as string;

    switch (type) {
      case 'assistant':
        // Parse content blocks
        const msg = event.message as { content?: Array<{ type: string; text?: string; name?: string }> };
        if (msg?.content) {
          for (const block of msg.content) {
            if (block.type === 'text' && block.text) {
              this.streamCallback({ type: 'text', content: block.text });
            } else if (block.type === 'tool_use') {
              this.streamCallback({ type: 'tool_use', tool: block.name });
            }
          }
        }
        break;

      case 'content_block_delta':
        const delta = event.delta as { type?: string; text?: string };
        if (delta?.type === 'text_delta' && delta.text) {
          this.streamCallback({ type: 'text', content: delta.text });
        }
        break;

      case 'tool_use':
        this.streamCallback({ type: 'tool_use', tool: event.name as string });
        break;

      case 'tool_result':
        this.streamCallback({ type: 'tool_result', result: event.content });
        break;

      case 'error':
        this.streamCallback({ type: 'error', content: event.error as string });
        break;

      case 'result':
        this.streamCallback({ type: 'done', content: event.content as string });
        break;
    }
  }

  async isAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      const proc = spawn(this.cliPath, ['--version'], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      proc.on('close', (code) => {
        resolve(code === 0);
      });

      proc.on('error', () => {
        resolve(false);
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        proc.kill();
        resolve(false);
      }, 5000);
    });
  }

  /**
   * Stream output from Claude Code CLI
   */
  async *chatStream(
    messages: Message[],
    options?: { tools?: ToolDefinition[]; systemPrompt?: string }
  ): AsyncGenerator<string> {
    let prompt = '';

    if (options?.systemPrompt) {
      prompt += `${options.systemPrompt}\n\n`;
    }

    for (const msg of messages) {
      if (msg.role === 'user') {
        prompt += `${msg.content}\n`;
      }
    }

    const args = ['-p', prompt, '--output-format', 'stream-json'];

    const proc = spawn(this.cliPath, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    for await (const chunk of proc.stdout) {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (line.trim()) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.type === 'text' && parsed.content) {
              yield parsed.content;
            }
          } catch {
            yield line;
          }
        }
      }
    }
  }
}

export default ClaudeCodeProvider;
