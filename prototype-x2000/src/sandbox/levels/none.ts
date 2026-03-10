/**
 * X2000 Sandbox Level 0: None (Direct Execution)
 *
 * Direct process execution with basic security checks:
 * - Path validation (no system directories)
 * - Environment variable blocking
 * - Command blocklist
 * - Audit logging
 *
 * Use case: Trust Level 4 brains, read-only operations, pre-approved commands
 * Startup overhead: 0ms
 */

import { spawn, SpawnOptions } from 'child_process';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type {
  SandboxConfig,
  SandboxExecOptions,
  SandboxResult,
  SandboxInstance,
  SandboxStatus,
  ResourceUsage,
  SecurityPolicy,
} from '../types.js';
import { SandboxLevel, SandboxError, SandboxErrorType } from '../types.js';
import { isBlockedPath } from '../filesystem.js';
import { createEmptyResourceUsage } from '../resources.js';

// ============================================================================
// Security Configuration
// ============================================================================

/**
 * Commands that are always blocked
 */
const BLOCKED_COMMAND_PATTERNS: RegExp[] = [
  // Destructive operations
  /rm\s+(-[rf]+|--recursive|--force)\s+[\/~]/i,
  /mkfs\./i,
  /dd\s+if=.*of=\/dev/i,

  // Privilege escalation
  /^sudo\s/i,
  /^su\s+-/i,
  /^doas\s/i,
  /^pkexec\s/i,

  // Dangerous operations
  /curl.*\|\s*(ba)?sh/i,
  /wget.*\|\s*(ba)?sh/i,
  /:\(\)\{\s*:\|:&\s*\};:/,  // Fork bomb

  // Network scanning
  /^nmap\s/i,
  /^masscan\s/i,

  // Credential theft tools
  /mimikatz/i,
  /lazagne/i,
];

/**
 * Environment variables blocked from setting
 */
const BLOCKED_ENV_VARS = new Set([
  // Library injection
  'LD_PRELOAD',
  'LD_LIBRARY_PATH',
  'DYLD_INSERT_LIBRARIES',
  'DYLD_LIBRARY_PATH',

  // Runtime modification
  'NODE_OPTIONS',
  'NODE_PATH',
  'PYTHONPATH',
  'PYTHONHOME',
  'RUBYOPT',
  'PERL5OPT',

  // Shell behavior
  'BASH_ENV',
  'ENV',
  'CDPATH',
  'SHELLOPTS',
  'BASHOPTS',
  'GLOBIGNORE',
  'PS4',
  'PROMPT_COMMAND',
]);

// ============================================================================
// Security Checks
// ============================================================================

/**
 * Validate a command for security
 */
export function validateCommand(
  command: string,
  policy: SecurityPolicy
): { valid: boolean; reason?: string } {
  const normalizedCommand = command.trim();

  // Check against blocked patterns
  const patterns = policy.blockedCommands || BLOCKED_COMMAND_PATTERNS;
  for (const pattern of patterns) {
    if (pattern.test(normalizedCommand)) {
      return {
        valid: false,
        reason: `Command matches blocked pattern: ${pattern.source}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Validate environment variables
 */
export function validateEnv(
  env: Record<string, string>,
  policy: SecurityPolicy
): { valid: boolean; reason?: string } {
  const blocked = policy.blockedEnvVars || BLOCKED_ENV_VARS;

  for (const key of Object.keys(env)) {
    const upperKey = key.toUpperCase();
    if (blocked.has(upperKey)) {
      return {
        valid: false,
        reason: `Environment variable '${key}' is blocked for security`,
      };
    }

    // Block PATH modifications
    if (upperKey === 'PATH') {
      return {
        valid: false,
        reason: 'Custom PATH is not allowed',
      };
    }
  }

  return { valid: true };
}

/**
 * Validate working directory
 */
export function validateCwd(cwd: string): { valid: boolean; reason?: string } {
  const blockCheck = isBlockedPath(cwd);
  if (blockCheck.blocked) {
    return {
      valid: false,
      reason: `Working directory is blocked: ${blockCheck.reason}`,
    };
  }

  return { valid: true };
}

// ============================================================================
// None Sandbox Implementation
// ============================================================================

/**
 * Create a Level 0 (None) sandbox instance
 */
export function createNoneSandbox(config: SandboxConfig): SandboxInstance {
  const id = uuidv4();
  let status: SandboxStatus = 'running';
  const createdAt = new Date();

  const instance: SandboxInstance = {
    id,
    level: 'none',
    status,
    createdAt,
    config,

    async exec(options: SandboxExecOptions): Promise<SandboxResult> {
      const auditId = uuidv4();
      const startTime = Date.now();
      let sandboxStartupTime = 0;

      if (status !== 'running') {
        throw new SandboxError(
          SandboxErrorType.EXECUTION_FAILED,
          `Sandbox is not running (status: ${status})`,
          'none'
        );
      }

      // Parse command
      const command = Array.isArray(options.command)
        ? options.command.join(' ')
        : options.command;

      // Validate command
      const cmdCheck = validateCommand(command, config.security);
      if (!cmdCheck.valid) {
        return {
          success: false,
          exitCode: 1,
          stdout: '',
          stderr: cmdCheck.reason || 'Command validation failed',
          duration: Date.now() - startTime,
          resourceUsage: createEmptyResourceUsage(),
          sandboxLevel: 'none',
          auditId,
          truncated: false,
          sandboxStartupTime,
        };
      }

      // Validate environment
      const env = options.env || {};
      const envCheck = validateEnv(env, config.security);
      if (!envCheck.valid) {
        return {
          success: false,
          exitCode: 1,
          stdout: '',
          stderr: envCheck.reason || 'Environment validation failed',
          duration: Date.now() - startTime,
          resourceUsage: createEmptyResourceUsage(),
          sandboxLevel: 'none',
          auditId,
          truncated: false,
          sandboxStartupTime,
        };
      }

      // Validate working directory
      const cwd = options.cwd || config.filesystem.workspacePath;
      const cwdCheck = validateCwd(cwd);
      if (!cwdCheck.valid) {
        return {
          success: false,
          exitCode: 1,
          stdout: '',
          stderr: cwdCheck.reason || 'Working directory validation failed',
          duration: Date.now() - startTime,
          resourceUsage: createEmptyResourceUsage(),
          sandboxLevel: 'none',
          auditId,
          truncated: false,
          sandboxStartupTime,
        };
      }

      // Execute command
      const timeout = options.timeout || config.resources.wallTimeSeconds * 1000;
      const maxOutputSize = 1024 * 1024; // 1MB

      return new Promise((resolve) => {
        const spawnOptions: SpawnOptions = {
          cwd: path.isAbsolute(cwd) ? cwd : path.resolve(config.filesystem.workspacePath, cwd),
          env: {
            ...process.env,
            ...env,
            TERM: 'dumb',
            NO_COLOR: '1',
          },
          shell: true,
          stdio: ['pipe', 'pipe', 'pipe'],
        };

        const child = spawn(command, [], spawnOptions);

        let stdout = '';
        let stderr = '';
        let killed = false;
        let truncated = false;
        const startResourceUsage = process.resourceUsage();

        // Set timeout
        const timer = setTimeout(() => {
          killed = true;
          child.kill('SIGTERM');
          setTimeout(() => {
            if (!child.killed) {
              child.kill('SIGKILL');
            }
          }, 5000);
        }, timeout);

        // Handle stdin
        if (options.stdin) {
          child.stdin?.write(options.stdin);
          child.stdin?.end();
        } else {
          child.stdin?.end();
        }

        // Capture stdout
        child.stdout?.on('data', (data: Buffer) => {
          if (stdout.length < maxOutputSize) {
            stdout += data.toString();
            options.onStdout?.(data);
          } else {
            truncated = true;
          }
        });

        // Capture stderr
        child.stderr?.on('data', (data: Buffer) => {
          if (stderr.length < maxOutputSize) {
            stderr += data.toString();
            options.onStderr?.(data);
          } else {
            truncated = true;
          }
        });

        child.on('error', (error) => {
          clearTimeout(timer);
          resolve({
            success: false,
            exitCode: 1,
            stdout,
            stderr: error.message,
            duration: Date.now() - startTime,
            resourceUsage: createEmptyResourceUsage(),
            sandboxLevel: 'none',
            auditId,
            truncated,
            sandboxStartupTime,
          });
        });

        child.on('close', (exitCode, signal) => {
          clearTimeout(timer);
          const endResourceUsage = process.resourceUsage();

          const resourceUsage: ResourceUsage = {
            cpuTimeMs:
              (endResourceUsage.userCPUTime - startResourceUsage.userCPUTime) / 1000 +
              (endResourceUsage.systemCPUTime - startResourceUsage.systemCPUTime) / 1000,
            maxMemoryBytes: endResourceUsage.maxRSS * 1024,
            diskBytesWritten: 0, // Not tracked at this level
            networkBytesSent: 0,
            networkBytesReceived: 0,
            processCount: 1,
          };

          if (killed) {
            resolve({
              success: false,
              exitCode: exitCode ?? 1,
              stdout,
              stderr: stderr + '\n[Command timed out and was killed]',
              duration: Date.now() - startTime,
              resourceUsage,
              sandboxLevel: 'none',
              auditId,
              signal: signal || 'SIGTERM',
              truncated,
              sandboxStartupTime,
            });
          } else {
            resolve({
              success: exitCode === 0,
              exitCode: exitCode ?? 1,
              stdout,
              stderr,
              duration: Date.now() - startTime,
              resourceUsage,
              sandboxLevel: 'none',
              auditId,
              signal: signal || undefined,
              truncated,
              sandboxStartupTime,
            });
          }
        });
      });
    },

    async writeFile(filePath: string, content: string | Buffer): Promise<void> {
      const { validatePath } = await import('../filesystem.js');
      const fs = await import('fs/promises');

      const fullPath = path.isAbsolute(filePath)
        ? filePath
        : path.join(config.filesystem.workspacePath, filePath);

      const validation = validatePath(fullPath, config.filesystem, 'write');
      if (!validation.valid) {
        throw new SandboxError(
          SandboxErrorType.SECURITY_VIOLATION,
          validation.reason || 'Path not writable',
          'none'
        );
      }

      await fs.writeFile(fullPath, content);
    },

    async readFile(filePath: string): Promise<Buffer> {
      const { validatePath } = await import('../filesystem.js');
      const fs = await import('fs/promises');

      const fullPath = path.isAbsolute(filePath)
        ? filePath
        : path.join(config.filesystem.workspacePath, filePath);

      const validation = validatePath(fullPath, config.filesystem, 'read');
      if (!validation.valid) {
        throw new SandboxError(
          SandboxErrorType.SECURITY_VIOLATION,
          validation.reason || 'Path not readable',
          'none'
        );
      }

      return fs.readFile(fullPath);
    },

    async listFiles(dirPath: string): Promise<string[]> {
      const { validatePath } = await import('../filesystem.js');
      const fs = await import('fs/promises');

      const fullPath = path.isAbsolute(dirPath)
        ? dirPath
        : path.join(config.filesystem.workspacePath, dirPath);

      const validation = validatePath(fullPath, config.filesystem, 'read');
      if (!validation.valid) {
        throw new SandboxError(
          SandboxErrorType.SECURITY_VIOLATION,
          validation.reason || 'Path not readable',
          'none'
        );
      }

      return fs.readdir(fullPath);
    },

    async stop(): Promise<void> {
      status = 'stopped';
    },

    async getResourceUsage(): Promise<ResourceUsage> {
      // For level none, we return current process usage
      const usage = process.resourceUsage();
      return {
        cpuTimeMs: usage.userCPUTime / 1000 + usage.systemCPUTime / 1000,
        maxMemoryBytes: usage.maxRSS * 1024,
        diskBytesWritten: 0,
        networkBytesSent: 0,
        networkBytesReceived: 0,
        processCount: 1,
      };
    },
  };

  return instance;
}

/**
 * Execute a one-shot command with Level 0 sandbox
 */
export async function execNone(
  command: string | string[],
  config: SandboxConfig,
  options: Partial<SandboxExecOptions> = {}
): Promise<SandboxResult> {
  const sandbox = createNoneSandbox(config);

  try {
    const result = await sandbox.exec({
      command,
      ...options,
    });
    return result;
  } finally {
    await sandbox.stop();
  }
}
