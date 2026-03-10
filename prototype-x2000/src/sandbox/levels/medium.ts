/**
 * X2000 Sandbox Level 2: Medium (Container Sandbox)
 *
 * Medium isolation using container technologies:
 * - Linux: gVisor (runsc) with user-space kernel
 * - Linux fallback: nsjail with full namespace isolation
 * - macOS: Best-effort namespace simulation via sandbox-exec
 *
 * Use case: Trust Level 1-2 brains, running untrusted packages, builds
 * Startup overhead: 50-150ms
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
} from '../types.js';
import { SandboxLevel, SandboxError, SandboxErrorType } from '../types.js';
import { generateGVisorFilesystemConfig } from '../filesystem.js';
import { generateGVisorResourceConfig, createEmptyResourceUsage } from '../resources.js';
import { validateCommand, validateEnv } from './none.js';
import { getPlatform, isSeatbeltAvailable } from './light.js';

// ============================================================================
// Technology Availability
// ============================================================================

/**
 * Check if gVisor (runsc) is available
 */
export async function isGVisorAvailable(): Promise<boolean> {
  if (getPlatform() !== 'linux') {
    return false;
  }

  try {
    const { execSync } = await import('child_process');
    execSync('which runsc', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if Docker is available
 */
export async function isDockerAvailable(): Promise<boolean> {
  try {
    const { execSync } = await import('child_process');
    execSync('docker info', { stdio: 'ignore', timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if Lima is available (macOS)
 */
export async function isLimaAvailable(): Promise<boolean> {
  if (getPlatform() !== 'darwin') {
    return false;
  }

  try {
    const { execSync } = await import('child_process');
    execSync('which limactl', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if medium sandbox is available
 */
export async function isMediumSandboxAvailable(): Promise<boolean> {
  const platform = getPlatform();

  if (platform === 'linux') {
    return (await isGVisorAvailable()) || (await isDockerAvailable());
  }

  if (platform === 'darwin') {
    // On macOS, we can use Docker Desktop or Lima with gVisor
    // Or fall back to enhanced Seatbelt profile
    return (await isDockerAvailable()) || (await isLimaAvailable()) || (await isSeatbeltAvailable());
  }

  return false;
}

// ============================================================================
// gVisor Configuration
// ============================================================================

/**
 * gVisor OCI runtime configuration
 */
interface GVisorConfig {
  ociVersion: string;
  process: {
    terminal: boolean;
    user: { uid: number; gid: number };
    args: string[];
    env: string[];
    cwd: string;
    rlimits?: Array<{ type: string; hard: number; soft: number }>;
  };
  root: { path: string; readonly: boolean };
  mounts: Array<{
    destination: string;
    source: string;
    type: string;
    options: string[];
  }>;
  linux?: {
    resources?: Record<string, unknown>;
    namespaces?: Array<{ type: string }>;
    seccomp?: Record<string, unknown>;
  };
}

/**
 * Generate gVisor OCI config
 */
export function generateGVisorOCIConfig(
  config: SandboxConfig,
  command: string,
  env: Record<string, string>,
  cwd: string
): GVisorConfig {
  const fsConfig = generateGVisorFilesystemConfig(config.filesystem);
  const resourceConfig = generateGVisorResourceConfig(config.resources);

  const linuxConfig = resourceConfig.linux as Record<string, unknown> | undefined;
  const rlimits = linuxConfig?.rlimits as Array<{ type: string; hard: number; soft: number }> | undefined;

  return {
    ociVersion: '1.0.0',
    process: {
      terminal: false,
      user: {
        uid: config.security.runAsUser ?? 65534,
        gid: config.security.runAsGroup ?? 65534,
      },
      args: ['/bin/sh', '-c', command],
      env: Object.entries(env).map(([k, v]) => `${k}=${v}`),
      cwd,
      ...(rlimits ? { rlimits } : {}),
    },
    root: fsConfig.root as { path: string; readonly: boolean },
    mounts: fsConfig.mounts as Array<{
      destination: string;
      source: string;
      type: string;
      options: string[];
    }>,
    linux: {
      ...(linuxConfig || {}),
      namespaces: [
        { type: 'pid' },
        { type: 'ipc' },
        { type: 'uts' },
        { type: 'mount' },
        { type: 'network' },
      ],
    },
  };
}

/**
 * Write gVisor config to file
 */
async function writeGVisorConfig(config: GVisorConfig): Promise<string> {
  const configPath = path.join(os.tmpdir(), `x2000-gvisor-${uuidv4().substring(0, 8)}`);
  const configFile = path.join(configPath, 'config.json');

  await fs.promises.mkdir(configPath, { recursive: true });
  await fs.promises.writeFile(configFile, JSON.stringify(config, null, 2));

  return configPath;
}

// ============================================================================
// Docker-based Sandbox (Fallback)
// ============================================================================

/**
 * Generate Docker run arguments for medium isolation
 */
export function generateDockerArgs(
  config: SandboxConfig,
  command: string,
  env: Record<string, string>,
  cwd: string
): string[] {
  const args: string[] = ['run', '--rm'];

  // Security options
  args.push('--security-opt', 'no-new-privileges');
  args.push('--cap-drop', 'ALL');

  // User
  args.push('--user', `${config.security.runAsUser ?? 65534}:${config.security.runAsGroup ?? 65534}`);

  // Read-only root
  if (config.security.readOnlyRoot) {
    args.push('--read-only');
  }

  // Memory limit
  if (isFinite(config.resources.memoryBytes)) {
    args.push('--memory', String(config.resources.memoryBytes));
    args.push('--memory-swap', String(config.resources.memoryBytes)); // No swap
  }

  // CPU limit
  if (isFinite(config.resources.cpuCores)) {
    args.push('--cpus', String(config.resources.cpuCores));
  }

  // PID limit
  if (isFinite(config.resources.maxPids)) {
    args.push('--pids-limit', String(config.resources.maxPids));
  }

  // Network
  if (config.network.mode === 'none') {
    args.push('--network', 'none');
  }

  // Mount workspace
  args.push('-v', `${config.filesystem.workspacePath}:/workspace`);

  // tmpfs
  args.push('--tmpfs', `/tmp:size=${config.filesystem.tmpfsSize}`);

  // Working directory
  args.push('-w', cwd.replace(config.filesystem.workspacePath, '/workspace'));

  // Environment variables
  for (const [key, value] of Object.entries(env)) {
    args.push('-e', `${key}=${value}`);
  }

  // Base image (Alpine for minimal attack surface)
  args.push('alpine:latest');

  // Command
  args.push('/bin/sh', '-c', command);

  return args;
}

// ============================================================================
// Medium Sandbox Implementation
// ============================================================================

/**
 * Create a Level 2 (Medium) sandbox instance
 */
export async function createMediumSandbox(config: SandboxConfig): Promise<SandboxInstance> {
  const id = uuidv4();
  let status: SandboxStatus = 'starting';
  const createdAt = new Date();
  const platform = getPlatform();

  // Determine technology
  let technology: 'gvisor' | 'docker' | 'seatbelt-enhanced' | 'none' = 'none';
  let configPath: string | null = null;

  if (platform === 'linux') {
    if (await isGVisorAvailable()) {
      technology = 'gvisor';
    } else if (await isDockerAvailable()) {
      technology = 'docker';
    }
  } else if (platform === 'darwin') {
    if (await isDockerAvailable()) {
      technology = 'docker';
    } else if (await isSeatbeltAvailable()) {
      // Fall back to enhanced Seatbelt (not ideal but better than nothing)
      technology = 'seatbelt-enhanced';
    }
  }

  if (technology === 'none') {
    throw new SandboxError(
      SandboxErrorType.UNAVAILABLE,
      `Medium sandbox not available on platform: ${platform}`,
      'medium'
    );
  }

  status = 'running';

  const instance: SandboxInstance = {
    id,
    level: 'medium',
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
          'medium'
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
          sandboxLevel: 'medium',
          auditId,
          truncated: false,
          sandboxStartupTime,
        };
      }

      // Environment
      const env = {
        ...options.env,
        TERM: 'dumb',
        NO_COLOR: '1',
      };

      const envCheck = validateEnv(env, config.security);
      if (!envCheck.valid) {
        return {
          success: false,
          exitCode: 1,
          stdout: '',
          stderr: envCheck.reason || 'Environment validation failed',
          duration: Date.now() - startTime,
          resourceUsage: createEmptyResourceUsage(),
          sandboxLevel: 'medium',
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

      if (technology === 'gvisor') {
        // Generate gVisor config
        const gvisorConfig = generateGVisorOCIConfig(config, command, env, resolvedCwd);
        configPath = await writeGVisorConfig(gvisorConfig);

        sandboxCmd = 'runsc';
        sandboxArgs = [
          'run',
          '--rootless',
          '--network=none',
          '--root', configPath,
          `x2000-${id.substring(0, 8)}`,
        ];
      } else if (technology === 'docker') {
        sandboxCmd = 'docker';
        sandboxArgs = generateDockerArgs(config, command, env, resolvedCwd);
      } else {
        // Enhanced Seatbelt (macOS fallback)
        const { generateSeatbeltProfile } = await import('./light.js');
        const profile = (await import('./light.js')).generateSeatbeltProfile(config);
        const profilePath = path.join(os.tmpdir(), `x2000-medium-${uuidv4().substring(0, 8)}.sb`);
        await fs.promises.writeFile(profilePath, profile);
        configPath = profilePath;

        sandboxCmd = 'sandbox-exec';
        sandboxArgs = ['-f', profilePath, '/bin/sh', '-c', command];
      }

      sandboxStartupTime = Date.now() - setupStart;

      // Execute
      const timeout = options.timeout || config.resources.wallTimeSeconds * 1000;
      const maxOutputSize = 1024 * 1024;

      return new Promise((resolve) => {
        const spawnOptions: SpawnOptions = {
          cwd: technology === 'seatbelt-enhanced' ? resolvedCwd : undefined,
          env: technology === 'seatbelt-enhanced' ? { ...process.env, ...env } : undefined,
          stdio: ['pipe', 'pipe', 'pipe'],
        };

        const child = spawn(sandboxCmd, sandboxArgs, spawnOptions);

        let stdout = '';
        let stderr = '';
        let killed = false;
        let truncated = false;
        const startResourceUsage = process.resourceUsage();

        const timer = setTimeout(() => {
          killed = true;
          child.kill('SIGTERM');
          setTimeout(() => {
            if (!child.killed) {
              child.kill('SIGKILL');
            }
          }, 5000);
        }, timeout);

        if (options.stdin) {
          child.stdin?.write(options.stdin);
          child.stdin?.end();
        } else {
          child.stdin?.end();
        }

        child.stdout?.on('data', (data: Buffer) => {
          if (stdout.length < maxOutputSize) {
            stdout += data.toString();
            options.onStdout?.(data);
          } else {
            truncated = true;
          }
        });

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
            sandboxLevel: 'medium',
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

          resolve({
            success: killed ? false : exitCode === 0,
            exitCode: exitCode ?? 1,
            stdout,
            stderr: killed ? stderr + '\n[Command timed out]' : stderr,
            duration: Date.now() - startTime,
            resourceUsage,
            sandboxLevel: 'medium',
            auditId,
            signal: signal || (killed ? 'SIGTERM' : undefined),
            truncated,
            sandboxStartupTime,
          });
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
          'medium'
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
          'medium'
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
          'medium'
        );
      }

      return fs.promises.readdir(fullPath);
    },

    async stop(): Promise<void> {
      status = 'stopped';

      // Cleanup config
      if (configPath) {
        try {
          await fs.promises.rm(configPath, { recursive: true, force: true });
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
 * Execute a one-shot command with Level 2 sandbox
 */
export async function execMedium(
  command: string | string[],
  config: SandboxConfig,
  options: Partial<SandboxExecOptions> = {}
): Promise<SandboxResult> {
  const sandbox = await createMediumSandbox(config);

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
