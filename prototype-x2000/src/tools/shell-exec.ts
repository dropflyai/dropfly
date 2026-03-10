/**
 * Shell Execution Tool
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { createTool, toolRegistry, type ToolInput, type ToolContext, type ToolOutput } from './base.js';

const execAsync = promisify(exec);

const shellExecTool = createTool({
  name: 'shell_exec',
  description: 'Execute a shell command',
  category: 'execute',
  minTrustLevel: 3,
  parameters: [
    {
      name: 'command',
      type: 'string',
      description: 'The shell command to execute',
      required: true,
    },
    {
      name: 'cwd',
      type: 'string',
      description: 'Working directory for the command',
      required: false,
    },
    {
      name: 'timeout',
      type: 'number',
      description: 'Timeout in milliseconds (default: 30000)',
      required: false,
      default: 30000,
    },
  ],
  async execute(input: ToolInput, context: ToolContext): Promise<ToolOutput> {
    const command = input.command as string;
    const cwd = (input.cwd as string) || context.workingDirectory || process.cwd();
    const timeout = (input.timeout as number) || 30000;

    // Security checks
    if (toolRegistry.isCommandBlocked(command)) {
      return {
        success: false,
        error: `Command '${command}' is blocked for security reasons`,
      };
    }

    if (toolRegistry.hasBlockedEnvVar(command)) {
      return {
        success: false,
        error: 'Command contains blocked environment variable manipulation',
      };
    }

    console.log(`[ShellExec] Running: ${command}`);

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd,
        timeout,
        maxBuffer: 1024 * 1024 * 10, // 10MB
      });

      return {
        success: true,
        data: {
          stdout: stdout.trim(),
          stderr: stderr.trim(),
        },
        metadata: {
          command,
          cwd,
          exitCode: 0,
        },
      };
    } catch (error: unknown) {
      const execError = error as { stdout?: string; stderr?: string; code?: number; message?: string };
      return {
        success: false,
        error: execError.message || String(error),
        data: {
          stdout: execError.stdout || '',
          stderr: execError.stderr || '',
        },
        metadata: {
          command,
          cwd,
          exitCode: execError.code || 1,
        },
      };
    }
  },
});

export default shellExecTool;
