/**
 * X2000 Sandbox Level 1: Light (Process Sandbox)
 *
 * Light isolation using platform-specific technologies:
 * - macOS: sandbox-exec (Seatbelt) with custom profiles
 * - Linux: nsjail/bubblewrap with seccomp-bpf
 *
 * Use case: Trust Level 2-3 brains, simple shell commands, workspace access
 * Startup overhead: 1-20ms
 */

import { spawn, SpawnOptions } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';
import type {
  SandboxConfig,
  SandboxExecOptions,
  SandboxResult,
  SandboxInstance,
  SandboxStatus,
  ResourceUsage,
  Platform,
} from '../types.js';
import { SandboxLevel, SandboxError, SandboxErrorType } from '../types.js';
import { generateSeatbeltFilesystemRules } from '../filesystem.js';
import { generateSeatbeltNetworkRules, generateNsjailNetworkArgs } from '../network.js';
import { generateNsjailResourceArgs, generateMacOSLimits, createEmptyResourceUsage } from '../resources.js';
import { validateCommand, validateEnv, validateCwd } from './none.js';

// ============================================================================
// Platform Detection and Technology Availability
// ============================================================================

/**
 * Get current platform
 */
export function getPlatform(): Platform {
  switch (process.platform) {
    case 'darwin':
      return 'darwin';
    case 'linux':
      return 'linux';
    case 'win32':
      return 'windows';
    default:
      return 'unknown';
  }
}

/**
 * Check if sandbox-exec (Seatbelt) is available on macOS
 */
export async function isSeatbeltAvailable(): Promise<boolean> {
  if (getPlatform() !== 'darwin') {
    return false;
  }

  try {
    const { execSync } = await import('child_process');
    execSync('which sandbox-exec', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if nsjail is available on Linux
 */
export async function isNsjailAvailable(): Promise<boolean> {
  if (getPlatform() !== 'linux') {
    return false;
  }

  try {
    const { execSync } = await import('child_process');
    execSync('which nsjail', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if bubblewrap is available on Linux
 */
export async function isBubblewrapAvailable(): Promise<boolean> {
  if (getPlatform() !== 'linux') {
    return false;
  }

  try {
    const { execSync } = await import('child_process');
    execSync('which bwrap', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if light sandbox is available on current platform
 */
export async function isLightSandboxAvailable(): Promise<boolean> {
  const platform = getPlatform();

  if (platform === 'darwin') {
    return isSeatbeltAvailable();
  }

  if (platform === 'linux') {
    return (await isNsjailAvailable()) || (await isBubblewrapAvailable());
  }

  return false;
}

// ============================================================================
// Seatbelt Profile Generation (macOS)
// ============================================================================

/**
 * Generate a complete Seatbelt profile for macOS
 */
export function generateSeatbeltProfile(config: SandboxConfig): string {
  const lines: string[] = [];

  // Profile header
  lines.push('(version 1)');
  lines.push('');

  // Default deny
  lines.push('(deny default)');
  lines.push('');

  // Allow basic operations
  lines.push('; Basic operations');
  lines.push('(allow signal)');
  lines.push('(allow sysctl-read)');
  lines.push('(allow mach-lookup)');
  lines.push('(allow ipc-posix-shm)');
  lines.push('');

  // Filesystem rules
  lines.push('; Filesystem rules');
  lines.push(generateSeatbeltFilesystemRules(config.filesystem));
  lines.push('');

  // Network rules
  lines.push('; Network rules');
  lines.push(generateSeatbeltNetworkRules(config.network));
  lines.push('');

  // Process execution
  lines.push('; Process execution');
  lines.push('(allow process-fork)');
  lines.push('(allow process-exec)');
  lines.push('');

  return lines.join('\n');
}

/**
 * Write Seatbelt profile to temporary file
 */
async function writeSeatbeltProfile(config: SandboxConfig): Promise<string> {
  const profile = generateSeatbeltProfile(config);
  const profilePath = path.join(os.tmpdir(), `x2000-seatbelt-${uuidv4().substring(0, 8)}.sb`);

  await fs.promises.writeFile(profilePath, profile, 'utf-8');

  return profilePath;
}

// ============================================================================
// nsjail Command Generation (Linux)
// ============================================================================

/**
 * Generate nsjail command arguments
 */
export function generateNsjailArgs(
  config: SandboxConfig,
  command: string,
  cwd: string
): string[] {
  const args: string[] = [];

  // Mode: execute once
  args.push('--mode', 'o');

  // User/group (nobody)
  args.push('--user', '65534');
  args.push('--group', '65534');

  // Chroot
  args.push('--chroot', '/');

  // Disable /proc (security)
  args.push('--disable_proc');

  // Filesystem mounts
  const { generateNsjailMounts } = require('../filesystem.js');
  args.push(...generateNsjailMounts(config.filesystem));

  // Working directory
  args.push('--cwd', cwd);

  // Resource limits
  args.push(...generateNsjailResourceArgs(config.resources));

  // Network
  args.push(...generateNsjailNetworkArgs(config.network));

  // Seccomp profile
  if (config.security.seccompProfile) {
    args.push('--seccomp_policy_file', config.security.seccompProfile);
  }

  // No new privileges
  if (config.security.noNewPrivileges !== false) {
    // nsjail has this by default
  }

  // Command separator
  args.push('--');

  // Shell wrapper
  args.push('/bin/sh', '-c', command);

  return args;
}

/**
 * Generate bubblewrap (bwrap) command arguments as fallback
 */
export function generateBwrapArgs(
  config: SandboxConfig,
  command: string,
  cwd: string
): string[] {
  const args: string[] = [];

  // Unshare namespaces
  args.push('--unshare-all');

  // Bind mount root read-only
  args.push('--ro-bind', '/', '/');

  // Bind mount workspace
  args.push('--bind', config.filesystem.workspacePath, config.filesystem.workspacePath);

  // tmpfs for /tmp
  args.push('--tmpfs', '/tmp');

  // Working directory
  args.push('--chdir', cwd);

  // User
  args.push('--uid', '65534');
  args.push('--gid', '65534');

  // Proc (minimal)
  args.push('--proc', '/proc');

  // Dev (minimal)
  args.push('--dev', '/dev');

  // No new privileges
  if (config.security.noNewPrivileges !== false) {
    args.push('--new-session');
  }

  // Die with parent
  args.push('--die-with-parent');

  // Command
  args.push('--');
  args.push('/bin/sh', '-c', command);

  return args;
}

// ============================================================================
// Light Sandbox Implementation
// ============================================================================

/**
 * Create a Level 1 (Light) sandbox instance
 */
export async function createLightSandbox(config: SandboxConfig): Promise<SandboxInstance> {
  const id = uuidv4();
  let status: SandboxStatus = 'starting';
  const createdAt = new Date();
  const platform = getPlatform();

  // Determine which technology to use
  let technology: 'seatbelt' | 'nsjail' | 'bwrap' | 'none' = 'none';

  if (platform === 'darwin') {
    if (await isSeatbeltAvailable()) {
      technology = 'seatbelt';
    }
  } else if (platform === 'linux') {
    if (await isNsjailAvailable()) {
      technology = 'nsjail';
    } else if (await isBubblewrapAvailable()) {
      technology = 'bwrap';
    }
  }

  if (technology === 'none') {
    throw new SandboxError(
      SandboxErrorType.UNAVAILABLE,
      `Light sandbox not available on platform: ${platform}`,
      'light'
    );
  }

  // Prepare Seatbelt profile if on macOS
  let seatbeltProfilePath: string | null = null;
  if (technology === 'seatbelt') {
    seatbeltProfilePath = await writeSeatbeltProfile(config);
  }

  status = 'running';

  const instance: SandboxInstance = {
    id,
    level: 'light',
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
          'light'
        );
      }

      // Parse command
      const command = Array.isArray(options.command)
        ? options.command.join(' ')
        : options.command;

      // Validate command (basic checks still apply)
      const cmdCheck = validateCommand(command, config.security);
      if (!cmdCheck.valid) {
        return {
          success: false,
          exitCode: 1,
          stdout: '',
          stderr: cmdCheck.reason || 'Command validation failed',
          duration: Date.now() - startTime,
          resourceUsage: createEmptyResourceUsage(),
          sandboxLevel: 'light',
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
          sandboxLevel: 'light',
          auditId,
          truncated: false,
          sandboxStartupTime,
        };
      }

      // Working directory
      const cwd = options.cwd || config.filesystem.workspacePath;
      const resolvedCwd = path.isAbsolute(cwd)
        ? cwd
        : path.resolve(config.filesystem.workspacePath, cwd);

      // Build sandbox command
      let sandboxCmd: string;
      let sandboxArgs: string[];

      const setupStart = Date.now();

      if (technology === 'seatbelt' && seatbeltProfilePath) {
        sandboxCmd = 'sandbox-exec';
        sandboxArgs = ['-f', seatbeltProfilePath, '/bin/sh', '-c', command];
      } else if (technology === 'nsjail') {
        sandboxCmd = 'nsjail';
        sandboxArgs = generateNsjailArgs(config, command, resolvedCwd);
      } else {
        sandboxCmd = 'bwrap';
        sandboxArgs = generateBwrapArgs(config, command, resolvedCwd);
      }

      sandboxStartupTime = Date.now() - setupStart;

      // Execute
      const timeout = options.timeout || config.resources.wallTimeSeconds * 1000;
      const maxOutputSize = 1024 * 1024; // 1MB

      return new Promise((resolve) => {
        const spawnOptions: SpawnOptions = {
          cwd: technology === 'seatbelt' ? resolvedCwd : undefined, // nsjail/bwrap handle cwd
          env: {
            ...process.env,
            ...env,
            TERM: 'dumb',
            NO_COLOR: '1',
          },
          stdio: ['pipe', 'pipe', 'pipe'],
        };

        const child = spawn(sandboxCmd, sandboxArgs, spawnOptions);

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
            sandboxLevel: 'light',
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
            diskBytesWritten: 0,
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
              sandboxLevel: 'light',
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
              sandboxLevel: 'light',
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

      const fullPath = path.isAbsolute(filePath)
        ? filePath
        : path.join(config.filesystem.workspacePath, filePath);

      const validation = validatePath(fullPath, config.filesystem, 'write');
      if (!validation.valid) {
        throw new SandboxError(
          SandboxErrorType.SECURITY_VIOLATION,
          validation.reason || 'Path not writable',
          'light'
        );
      }

      await fs.promises.writeFile(fullPath, content);
    },

    async readFile(filePath: string): Promise<Buffer> {
      const { validatePath } = await import('../filesystem.js');

      const fullPath = path.isAbsolute(filePath)
        ? filePath
        : path.join(config.filesystem.workspacePath, filePath);

      const validation = validatePath(fullPath, config.filesystem, 'read');
      if (!validation.valid) {
        throw new SandboxError(
          SandboxErrorType.SECURITY_VIOLATION,
          validation.reason || 'Path not readable',
          'light'
        );
      }

      return fs.promises.readFile(fullPath);
    },

    async listFiles(dirPath: string): Promise<string[]> {
      const { validatePath } = await import('../filesystem.js');

      const fullPath = path.isAbsolute(dirPath)
        ? dirPath
        : path.join(config.filesystem.workspacePath, dirPath);

      const validation = validatePath(fullPath, config.filesystem, 'read');
      if (!validation.valid) {
        throw new SandboxError(
          SandboxErrorType.SECURITY_VIOLATION,
          validation.reason || 'Path not readable',
          'light'
        );
      }

      return fs.promises.readdir(fullPath);
    },

    async stop(): Promise<void> {
      status = 'stopped';

      // Cleanup Seatbelt profile
      if (seatbeltProfilePath) {
        try {
          await fs.promises.unlink(seatbeltProfilePath);
        } catch {
          // Ignore cleanup errors
        }
      }
    },

    async getResourceUsage(): Promise<ResourceUsage> {
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
 * Execute a one-shot command with Level 1 sandbox
 */
export async function execLight(
  command: string | string[],
  config: SandboxConfig,
  options: Partial<SandboxExecOptions> = {}
): Promise<SandboxResult> {
  const sandbox = await createLightSandbox(config);

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
