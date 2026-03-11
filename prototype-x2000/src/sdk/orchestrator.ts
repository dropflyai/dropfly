/**
 * X2000 SDK Orchestrator
 *
 * Main entry point for the X2000 brain factory using Claude Agent SDK.
 * The CEO Brain orchestrates all 44 specialized brains.
 */

import { query, type Query, type SDKMessage, type AgentDefinition, type Options } from '@anthropic-ai/claude-agent-sdk';
import { brainDefinitions, toSdkAgentDefinitions, type BrainDefinition } from './brain-definitions.js';

export interface OrchestrationOptions {
  workingDirectory?: string;
  maxTurns?: number;
  permissionMode?: 'default' | 'acceptEdits' | 'bypassPermissions';
  systemPromptAppend?: string;
}

export interface OrchestrationResult {
  success: boolean;
  result?: string;
  brainsUsed: string[];
  toolCalls: Array<{ tool: string; input: unknown; result: unknown }>;
  error?: string;
}

/**
 * Orchestrate a task through the X2000 brain factory
 */
export async function* orchestrate(
  task: string,
  options: OrchestrationOptions = {}
): AsyncGenerator<SDKMessage> {
  const {
    workingDirectory = process.cwd(),
    maxTurns = 100,
    permissionMode = 'bypassPermissions',
    systemPromptAppend = '',
  } = options;

  // Get all brain definitions as SDK agents
  const agents = toSdkAgentDefinitions();

  // Build the system prompt for CEO Brain
  const systemPrompt = buildCeoSystemPrompt(systemPromptAppend);

  const fullPrompt = task;

  // Build options for the SDK query
  const queryOptions: Options = {
    agents,
    allowedTools: ['Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep', 'WebSearch', 'WebFetch', 'Agent'],
    permissionMode,
    maxTurns,
    systemPrompt: {
      type: 'preset',
      preset: 'claude_code',
      append: systemPrompt,
    },
    model: 'opus',
    cwd: workingDirectory,
  };

  // Run the orchestration through CEO Brain
  for await (const message of query({ prompt: fullPrompt, options: queryOptions })) {
    yield message;
  }
}

/**
 * Run a task and collect the final result
 */
export async function runTask(
  task: string,
  options: OrchestrationOptions = {}
): Promise<OrchestrationResult> {
  const brainsUsed: string[] = ['ceo-brain'];
  const toolCalls: Array<{ tool: string; input: unknown; result: unknown }> = [];
  let finalResult = '';
  let error: string | undefined;

  try {
    for await (const message of orchestrate(task, options)) {
      // Track assistant messages
      if (message.type === 'assistant') {
        for (const block of message.message.content) {
          if ('text' in block) {
            finalResult = block.text;
          }
        }
      }

      // Track final result
      if (message.type === 'result' && message.subtype === 'success') {
        finalResult = message.result || finalResult;
      }
    }

    return {
      success: true,
      result: finalResult,
      brainsUsed,
      toolCalls,
    };
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      brainsUsed,
      toolCalls,
      error,
    };
  }
}

/**
 * Build the CEO Brain system prompt
 */
function buildCeoSystemPrompt(append: string = ''): string {
  const brainList = Object.entries(brainDefinitions)
    .map(([key, brain]) => `- **${key}**: ${brain.description}`)
    .join('\n');

  return `You are the CEO Brain of X2000, an autonomous AI fleet with 44 specialized brains.

## YOUR ROLE

You are the master orchestrator. Your job is to:
1. Understand the user's task
2. Decompose it into specialist subtasks
3. Delegate to the appropriate brains using the Agent tool
4. Synthesize results into a coherent response
5. Verify the work is complete and correct

## AVAILABLE BRAINS

${brainList}

## ORCHESTRATION PROTOCOL

1. **ANALYZE**: Understand what the task requires
2. **PLAN**: Identify which brains are needed
3. **DELEGATE**: Use the Agent tool to spawn specialist brains
4. **SYNTHESIZE**: Combine their outputs
5. **VERIFY**: Ensure the work is complete
6. **REPORT**: Provide a clear summary

## BRAIN TENSION PROTOCOL

When multiple brains are involved:
1. Let each brain provide their perspective
2. Identify conflicts or different approaches
3. Make a decision with clear rationale
4. Document the decision

## RULES

- NEVER work alone on tasks that benefit from specialist expertise
- ALWAYS verify work is complete before reporting done
- DELEGATE technical work to Engineering Brain
- DELEGATE design work to Design Brain
- DELEGATE research to Research Brain
- You coordinate and decide - specialists execute

${append}`;
}

/**
 * Run a single brain directly (bypass CEO)
 */
export async function runBrain(
  brainKey: string,
  task: string,
  options: OrchestrationOptions = {}
): Promise<OrchestrationResult> {
  const brain = brainDefinitions[brainKey];
  if (!brain) {
    return {
      success: false,
      brainsUsed: [],
      toolCalls: [],
      error: `Brain not found: ${brainKey}`,
    };
  }

  const toolCalls: Array<{ tool: string; input: unknown; result: unknown }> = [];
  let finalResult = '';

  try {
    const queryOptions: Options = {
      allowedTools: brain.tools || ['Read', 'Glob', 'Grep'],
      permissionMode: options.permissionMode || 'bypassPermissions',
      maxTurns: brain.maxTurns || 50,
      systemPrompt: {
        type: 'preset',
        preset: 'claude_code',
        append: brain.prompt,
      },
      model: brain.model || 'sonnet',
      cwd: options.workingDirectory || process.cwd(),
    };

    for await (const message of query({ prompt: task, options: queryOptions })) {
      if (message.type === 'assistant') {
        for (const block of message.message.content) {
          if ('text' in block) {
            finalResult = block.text;
          }
        }
      }

      if (message.type === 'result' && message.subtype === 'success') {
        finalResult = message.result || finalResult;
      }
    }

    return {
      success: true,
      result: finalResult,
      brainsUsed: [brainKey],
      toolCalls,
    };
  } catch (err) {
    return {
      success: false,
      brainsUsed: [brainKey],
      toolCalls,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export { brainDefinitions, type BrainDefinition };
