/**
 * X2000 Tool System Base
 *
 * Defines the tool interface and registry for autonomous actions.
 */

import type { TrustLevel } from '../types/index.js';

// ============================================================================
// Tool Types
// ============================================================================

export type ToolCategory = 'read' | 'write' | 'execute' | 'dangerous' | 'external';

export interface ToolInput {
  [key: string]: unknown;
}

export interface ToolOutput {
  success: boolean;
  data?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface ToolContext {
  brainType: string;
  trustLevel: TrustLevel;
  sessionId: string;
  workingDirectory: string;
  approved?: boolean;
}

export interface Tool {
  name: string;
  description: string;
  category: ToolCategory;
  minTrustLevel: TrustLevel;
  parameters: ToolParameter[];
  execute(input: ToolInput, context: ToolContext): Promise<ToolOutput>;
}

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  default?: unknown;
}

// ============================================================================
// Security Configuration
// ============================================================================

export const BLOCKED_PATHS = [
  '/etc',
  '/bin',
  '/sbin',
  '/usr/bin',
  '/usr/sbin',
  '/System',
  '/Library',
  '~/.ssh',
  '~/.aws/credentials',
  '.env',
  '.env.local',
  '.env.production',
];

export const BLOCKED_COMMANDS = [
  'rm -rf /',
  'rm -rf ~',
  'sudo',
  'su ',
  ':(){ :|:& };:',  // Fork bomb
  'mkfs',
  'dd if=',
  '> /dev/sda',
  'chmod -R 777 /',
  'wget | bash',
  'curl | bash',
];

export const BLOCKED_ENV_VARS = [
  'LD_PRELOAD',
  'LD_LIBRARY_PATH',
  'NODE_OPTIONS',
  'PYTHONPATH',
  'BASH_ENV',
  'ENV',
  'PATH=',
];

// ============================================================================
// Tool Registry
// ============================================================================

class ToolRegistry {
  private tools: Map<string, Tool> = new Map();
  private initialized = false;

  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  getAll(): Tool[] {
    return Array.from(this.tools.values());
  }

  getAllForTrustLevel(level: TrustLevel): Tool[] {
    return this.getAll().filter(t => t.minTrustLevel <= level);
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('[Tools] Initializing X2000 tool system...');

    // Import and register all tools
    const toolModules = await Promise.allSettled([
      import('./file-read.js'),
      import('./file-write.js'),
      import('./file-edit.js'),
      import('./shell-exec.js'),
      import('./web-fetch.js'),
      import('./web-search.js'),
      import('./browser.js'),
      import('./email.js'),
      import('./git.js'),
      import('./spawn-agent.js'),
      import('./process.js'),
      import('./vision.js'),
    ]);

    for (const result of toolModules) {
      if (result.status === 'fulfilled' && result.value.default) {
        this.register(result.value.default);
      }
    }

    console.log(`[Tools] Registered ${this.tools.size} tools: ${Array.from(this.tools.keys()).join(', ')}`);
    this.initialized = true;
  }

  isBlocked(path: string): boolean {
    const normalizedPath = path.replace(/^~/, process.env.HOME || '');
    return BLOCKED_PATHS.some(blocked => {
      const normalizedBlocked = blocked.replace(/^~/, process.env.HOME || '');
      return normalizedPath.startsWith(normalizedBlocked) ||
             normalizedPath.includes(blocked);
    });
  }

  isCommandBlocked(command: string): boolean {
    const lowerCommand = command.toLowerCase();
    return BLOCKED_COMMANDS.some(blocked =>
      lowerCommand.includes(blocked.toLowerCase())
    );
  }

  hasBlockedEnvVar(command: string): boolean {
    return BLOCKED_ENV_VARS.some(envVar =>
      command.includes(envVar)
    );
  }
}

export const toolRegistry = new ToolRegistry();

// ============================================================================
// Helper Functions
// ============================================================================

export function createTool(config: Omit<Tool, 'execute'> & {
  execute: (input: ToolInput, context: ToolContext) => Promise<ToolOutput>;
}): Tool {
  return config;
}

export async function executeTool(
  toolName: string,
  input: ToolInput,
  context: ToolContext
): Promise<ToolOutput> {
  const tool = toolRegistry.get(toolName);

  if (!tool) {
    return {
      success: false,
      error: `Tool '${toolName}' not found`,
    };
  }

  // Check trust level
  if (context.trustLevel < tool.minTrustLevel) {
    return {
      success: false,
      error: `Insufficient trust level. Required: ${tool.minTrustLevel}, Current: ${context.trustLevel}`,
    };
  }

  try {
    return await tool.execute(input, context);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// ============================================================================
// Tool Definitions for AI
// ============================================================================

export function getToolDefinitions(trustLevel: TrustLevel): Array<{
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, unknown>;
    required: string[];
  };
}> {
  const tools = toolRegistry.getAllForTrustLevel(trustLevel);

  return tools.map(tool => ({
    name: tool.name,
    description: tool.description,
    input_schema: {
      type: 'object' as const,
      properties: tool.parameters.reduce((acc, param) => {
        acc[param.name] = {
          type: param.type,
          description: param.description,
        };
        return acc;
      }, {} as Record<string, unknown>),
      required: tool.parameters.filter(p => p.required).map(p => p.name),
    },
  }));
}
