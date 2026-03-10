/**
 * Git Operations Tool
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { createTool, type ToolInput, type ToolContext, type ToolOutput } from './base.js';

const execAsync = promisify(exec);

const gitTool = createTool({
  name: 'git',
  description: 'Execute git operations',
  category: 'execute',
  minTrustLevel: 3,
  parameters: [
    {
      name: 'command',
      type: 'string',
      description: 'Git command (without "git" prefix)',
      required: true,
    },
    {
      name: 'cwd',
      type: 'string',
      description: 'Working directory',
      required: false,
    },
  ],
  async execute(input: ToolInput, context: ToolContext): Promise<ToolOutput> {
    const command = input.command as string;
    const cwd = (input.cwd as string) || context.workingDirectory || process.cwd();

    // Block dangerous git commands
    const dangerous = ['push --force', 'reset --hard origin', 'clean -f'];
    if (dangerous.some(d => command.includes(d))) {
      return {
        success: false,
        error: `Dangerous git command blocked: ${command}`,
      };
    }

    try {
      const { stdout, stderr } = await execAsync(`git ${command}`, { cwd });
      return {
        success: true,
        data: { stdout: stdout.trim(), stderr: stderr.trim() },
      };
    } catch (error: unknown) {
      const execError = error as { stdout?: string; stderr?: string; message?: string };
      return {
        success: false,
        error: execError.message || String(error),
        data: {
          stdout: execError.stdout || '',
          stderr: execError.stderr || '',
        },
      };
    }
  },
});

export default gitTool;
