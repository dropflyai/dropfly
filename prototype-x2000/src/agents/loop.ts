/**
 * X2000 Agent Loop
 *
 * Autonomous execution loop for AI agents.
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env file from project root
config({ path: resolve(process.cwd(), '.env') });

import Anthropic from '@anthropic-ai/sdk';
import { toolRegistry, getToolDefinitions, executeTool, type ToolContext } from '../tools/index.js';
import { memoryManager } from '../memory/manager.js';
import type { Task, BrainType, TrustLevel } from '../types/index.js';

// ============================================================================
// Types
// ============================================================================

export interface AgentLoopConfig {
  brainType: BrainType | string;
  trustLevel: TrustLevel;
  maxIterations?: number;
  maxToolCalls?: number;
  timeoutMs?: number;
  retryOnError?: boolean;
  maxRetries?: number;
  selfCorrect?: boolean;
  autoResolveDependencies?: boolean;
  onIteration?: (result: IterationResult) => void;
}

export interface IterationResult {
  iteration: number;
  thought: string;
  action?: {
    tool: string;
    params: Record<string, unknown>;
    result: { success: boolean; data?: unknown; error?: string };
  };
  completed: boolean;
}

export interface AgentLoopResult {
  success: boolean;
  output: unknown;
  iterations: IterationResult[];
  toolCalls: Array<{ tool: string; params: unknown; result: unknown }>;
  learnings: string[];
  totalDuration: number;
}

// ============================================================================
// Agent Loop Class
// ============================================================================

export class AgentLoop {
  private config: Required<AgentLoopConfig>;
  private client: Anthropic;

  constructor(config: AgentLoopConfig) {
    this.config = {
      maxIterations: 50,
      maxToolCalls: 100,
      timeoutMs: 600000,
      retryOnError: true,
      maxRetries: 3,
      selfCorrect: true,
      autoResolveDependencies: true,
      onIteration: () => {},
      ...config,
    };

    this.client = new Anthropic();
  }

  async run(task: Task): Promise<AgentLoopResult> {
    const startTime = Date.now();
    const iterations: IterationResult[] = [];
    const toolCalls: Array<{ tool: string; params: unknown; result: unknown }> = [];
    const learnings: string[] = [];

    // Initialize tools
    await toolRegistry.initialize();

    console.log(`[AgentLoop] Starting autonomous execution for: ${task.subject}`);
    console.log(`[AgentLoop] Config: max ${this.config.maxIterations} iterations, ${this.config.timeoutMs}ms timeout`);

    const messages: Anthropic.Messages.MessageParam[] = [
      {
        role: 'user',
        content: `${task.subject}\n\n${task.description}`,
      },
    ];

    const tools = getToolDefinitions(this.config.trustLevel);

    let iteration = 0;
    let completed = false;

    while (iteration < this.config.maxIterations && !completed) {
      iteration++;

      const elapsed = Date.now() - startTime;
      if (elapsed > this.config.timeoutMs) {
        console.log(`[AgentLoop] Timeout reached at iteration ${iteration}`);
        break;
      }

      console.log(`[AgentLoop] Iteration ${iteration}/${this.config.maxIterations}`);

      try {
        const response = await this.client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          system: this.buildSystemPrompt(),
          messages,
          tools: tools as Anthropic.Messages.Tool[],
        });

        const result = await this.processResponse(response, messages, toolCalls);

        const iterResult: IterationResult = {
          iteration,
          thought: result.thought,
          action: result.action,
          completed: result.completed,
        };

        iterations.push(iterResult);
        this.config.onIteration(iterResult);

        if (result.completed) {
          console.log(`[AgentLoop] Task completed at iteration ${iteration}`);
          completed = true;
        }

        if (result.learnings) {
          learnings.push(...result.learnings);
        }
      } catch (error) {
        console.error(`[AgentLoop] Error at iteration ${iteration}:`, error);

        if (this.config.retryOnError) {
          messages.push({
            role: 'user',
            content: `Error occurred: ${error instanceof Error ? error.message : String(error)}. Please try a different approach.`,
          });
        } else {
          break;
        }
      }
    }

    return {
      success: completed,
      output: this.extractOutput(iterations),
      iterations,
      toolCalls,
      learnings,
      totalDuration: Date.now() - startTime,
    };
  }

  private buildSystemPrompt(): string {
    return `You are an autonomous AI agent working as part of the X2000 AI Fleet.
Your brain type is: ${this.config.brainType}
Your trust level is: ${this.config.trustLevel}

You have access to tools to complete tasks. Use them wisely.
When the task is complete, stop making tool calls and provide a final summary.

Guidelines:
1. Read existing files before modifying them
2. Use .js extensions in TypeScript imports (ESM requirement)
3. Run "npm run build" to verify changes
4. Fix errors before moving on
5. Do not create duplicate files or functionality

When you have completed the task, provide a clear summary of what was accomplished.`;
  }

  private async processResponse(
    response: Anthropic.Messages.Message,
    messages: Anthropic.Messages.MessageParam[],
    toolCalls: Array<{ tool: string; params: unknown; result: unknown }>
  ): Promise<{
    thought: string;
    action?: IterationResult['action'];
    completed: boolean;
    learnings?: string[];
  }> {
    let thought = '';
    let completed = false;
    let action: IterationResult['action'] | undefined;
    const learnings: string[] = [];

    // Extract text content
    for (const block of response.content) {
      if (block.type === 'text') {
        thought += block.text;
      }
    }

    // Check for tool use
    const toolUseBlocks = response.content.filter(
      (block): block is Anthropic.Messages.ToolUseBlock => block.type === 'tool_use'
    );

    if (toolUseBlocks.length === 0) {
      // No tool calls - task might be complete
      completed = true;
      return { thought, completed, learnings };
    }

    // Process tool calls
    const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];

    for (const toolUse of toolUseBlocks) {
      console.log(`[AgentLoop] Executing tool: ${toolUse.name}`);

      const context: ToolContext = {
        brainType: String(this.config.brainType),
        trustLevel: this.config.trustLevel,
        sessionId: 'agent-loop',
        workingDirectory: process.cwd(),
        approved: true,
      };

      const result = await executeTool(toolUse.name, toolUse.input as Record<string, unknown>, context);

      toolCalls.push({
        tool: toolUse.name,
        params: toolUse.input,
        result,
      });

      action = {
        tool: toolUse.name,
        params: toolUse.input as Record<string, unknown>,
        result,
      };

      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: JSON.stringify(result),
      });
    }

    // Add assistant message and tool results to conversation
    messages.push({
      role: 'assistant',
      content: response.content,
    });

    messages.push({
      role: 'user',
      content: toolResults,
    });

    return { thought, action, completed, learnings };
  }

  private extractOutput(iterations: IterationResult[]): unknown {
    if (iterations.length === 0) return null;

    const lastIteration = iterations[iterations.length - 1];
    return lastIteration.thought;
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

export async function runAutonomously(
  task: Task,
  config: Partial<AgentLoopConfig> = {}
): Promise<AgentLoopResult> {
  const loop = new AgentLoop({
    brainType: 'ceo',
    trustLevel: 4,
    ...config,
  });

  return loop.run(task);
}

export async function executeAutonomously(
  taskDescription: string,
  config: Partial<AgentLoopConfig> = {}
): Promise<AgentLoopResult> {
  const task: Task = {
    id: `task-${Date.now()}`,
    subject: 'Autonomous Task',
    description: taskDescription,
    status: 'in_progress',
    priority: 'medium',
    subtaskIds: [],
    blockedBy: [],
    blocks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: { autonomous: true },
  };

  return runAutonomously(task, config);
}
