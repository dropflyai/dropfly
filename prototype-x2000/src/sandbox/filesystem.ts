/**
 * X2000 Sandbox Filesystem Isolation
 *
 * Handles filesystem mounting, path validation, and jail configuration
 * for sandbox execution.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';
import type { FilesystemConfig, FilesystemMount, SandboxLevel } from './types.js';
import { SandboxError, SandboxErrorType } from './types.js';

// ============================================================================
// Blocked Paths (Security Critical)
// ============================================================================

/**
 * Paths that are ALWAYS blocked from sandbox access
 */
export const BLOCKED_PATHS: string[] = [
  // System credentials
  '/etc/passwd',
  '/etc/shadow',
  '/etc/sudoers',
  '/etc/sudoers.d',

  // SSH and GPG keys
  '~/.ssh',
  '~/.gnupg',
  '~/.gpg',

  // Cloud credentials
  '~/.aws/credentials',
  '~/.aws/config',
  '~/.config/gcloud',
  '~/.azure',
  '~/.kube/config',

  // Application secrets
  '.env',
  '.env.local',
  '.env.development',
  '.env.production',
  '*.pem',
  '*.key',
  '*.p12',
  '*.pfx',

  // Package manager caches (potential supply chain risks)
  '~/.npm/_cacache',
  '~/.cache/pip',
  '~/.cargo/registry',

  // Browser data
  '~/.config/google-chrome',
  '~/.config/chromium',
  '~/.mozilla',
  '~/Library/Application Support/Google/Chrome',
  '~/Library/Application Support/Firefox',

  // macOS Keychain
  '~/Library/Keychains',
  '/Library/Keychains',

  // System directories
  '/proc/1',
  '/sys/kernel',
];

/**
 * Patterns that match blocked paths
 */
export const BLOCKED_PATH_PATTERNS: RegExp[] = [
  /\.env(\.[a-z]+)?$/i,
  /credentials\.json$/i,
  /secrets?\.(json|yaml|yml)$/i,
  /\.pem$/i,
  /\.key$/i,
  /id_rsa/i,
  /id_ed25519/i,
  /\.p12$/i,
  /\.pfx$/i,
  /token\.json$/i,
  /\.netrc$/i,
];

/**
 * Default read-only system paths
 */
export const DEFAULT_READONLY_PATHS: string[] = [
  '/usr/lib',
  '/usr/share',
  '/lib',
  '/lib64',
  '/usr/local/lib',
  '/usr/local/share',
];

// ============================================================================
// Filesystem Configuration Builder
// ============================================================================

/**
 * Options for building filesystem configuration
 */
export interface FilesystemOptions {
  /** Workspace path */
  workspacePath: string;

  /** Additional read-only paths */
  readOnlyPaths?: string[];

  /** Additional writable paths */
  writablePaths?: string[];

  /** tmpfs size (e.g., '100M') */
  tmpfsSize?: string;

  /** Disable exec on workspace */
  noExecWorkspace?: boolean;

  /** Session ID for unique temp paths */
  sessionId?: string;
}

/**
 * Build filesystem configuration for a sandbox level
 */
export function createFilesystemConfig(
  level: SandboxLevel,
  options: FilesystemOptions
): FilesystemConfig {
  const sessionId = options.sessionId || uuidv4().substring(0, 8);
  const homeDir = os.homedir();

  // Expand ~ in workspace path
  const workspacePath = expandPath(options.workspacePath);

  // Validate workspace exists
  if (!fs.existsSync(workspacePath)) {
    throw new SandboxError(
      SandboxErrorType.CONFIG_ERROR,
      `Workspace path does not exist: ${workspacePath}`,
      level
    );
  }

  // Build read-only paths
  const readOnlyPaths = [
    ...DEFAULT_READONLY_PATHS.filter(p => fs.existsSync(p)),
    ...(options.readOnlyPaths || []).map(expandPath),
  ];

  // Build writable paths
  const writablePaths = [
    workspacePath,
    ...(options.writablePaths || []).map(expandPath),
  ];

  // Expand and filter blocked paths
  const blockedPaths = BLOCKED_PATHS.map(p => expandPath(p));

  // Build mounts
  const mounts: FilesystemMount[] = [];

  // Workspace mount
  mounts.push({
    source: workspacePath,
    target: '/workspace',
    mode: 'rw',
    options: options.noExecWorkspace !== false ? ['noexec'] : [],
  });

  // tmpfs for /tmp
  mounts.push({
    source: 'tmpfs',
    target: '/tmp',
    mode: 'rw',
    tmpfs: true,
    tmpfsSize: options.tmpfsSize || '100M',
    options: ['noexec', 'nosuid'],
  });

  // Read-only system mounts
  for (const roPath of readOnlyPaths) {
    if (fs.existsSync(roPath)) {
      mounts.push({
        source: roPath,
        target: roPath,
        mode: 'ro',
      });
    }
  }

  return {
    rootMode: level === 'none' ? 'readwrite' : 'readonly',
    workspacePath,
    readOnlyPaths,
    writablePaths,
    blockedPaths,
    mounts,
    tmpfsSize: options.tmpfsSize || '100M',
    noExecWorkspace: options.noExecWorkspace !== false,
  };
}

// ============================================================================
// Path Validation
// ============================================================================

/**
 * Expand ~ and environment variables in path
 */
export function expandPath(inputPath: string): string {
  let expanded = inputPath;

  // Expand ~
  if (expanded.startsWith('~')) {
    expanded = path.join(os.homedir(), expanded.slice(1));
  }

  // Expand environment variables
  expanded = expanded.replace(/\$\{([^}]+)\}/g, (_, envVar) => {
    return process.env[envVar] || '';
  });
  expanded = expanded.replace(/\$([A-Z_][A-Z0-9_]*)/gi, (_, envVar) => {
    return process.env[envVar] || '';
  });

  return path.normalize(expanded);
}

/**
 * Check if a path is blocked
 */
export function isBlockedPath(targetPath: string): { blocked: boolean; reason?: string } {
  const normalizedPath = path.normalize(expandPath(targetPath));
  const lowerPath = normalizedPath.toLowerCase();

  // Check explicit blocked paths
  for (const blocked of BLOCKED_PATHS) {
    const expandedBlocked = expandPath(blocked).toLowerCase();
    if (
      lowerPath === expandedBlocked ||
      lowerPath.startsWith(expandedBlocked + path.sep)
    ) {
      return { blocked: true, reason: `Path matches blocked pattern: ${blocked}` };
    }
  }

  // Check blocked patterns
  for (const pattern of BLOCKED_PATH_PATTERNS) {
    if (pattern.test(normalizedPath)) {
      return { blocked: true, reason: `Path matches blocked pattern: ${pattern}` };
    }
  }

  // Check for path traversal attempts
  if (normalizedPath.includes('..')) {
    // Resolve to catch traversal
    const resolved = path.resolve(normalizedPath);
    if (resolved !== normalizedPath) {
      // Check if the resolved path is blocked
      return isBlockedPath(resolved);
    }
  }

  return { blocked: false };
}

/**
 * Validate a path is accessible within sandbox
 */
export function validatePath(
  targetPath: string,
  config: FilesystemConfig,
  mode: 'read' | 'write'
): { valid: boolean; reason?: string } {
  const normalizedPath = path.normalize(expandPath(targetPath));

  // Check if blocked
  const blockCheck = isBlockedPath(normalizedPath);
  if (blockCheck.blocked) {
    return { valid: false, reason: blockCheck.reason };
  }

  // For write access, check if in writable paths
  if (mode === 'write') {
    const inWritable = config.writablePaths.some(wp => {
      const expandedWp = expandPath(wp);
      return (
        normalizedPath === expandedWp ||
        normalizedPath.startsWith(expandedWp + path.sep)
      );
    });

    if (!inWritable) {
      return { valid: false, reason: `Path not in writable paths: ${normalizedPath}` };
    }
  }

  // For read access, check if in readable or writable paths
  if (mode === 'read') {
    const allReadable = [...config.readOnlyPaths, ...config.writablePaths];
    const inReadable = allReadable.some(rp => {
      const expandedRp = expandPath(rp);
      return (
        normalizedPath === expandedRp ||
        normalizedPath.startsWith(expandedRp + path.sep)
      );
    });

    // Also allow if it's under workspace
    const underWorkspace =
      normalizedPath === config.workspacePath ||
      normalizedPath.startsWith(config.workspacePath + path.sep);

    if (!inReadable && !underWorkspace) {
      return { valid: false, reason: `Path not in readable paths: ${normalizedPath}` };
    }
  }

  return { valid: true };
}

// ============================================================================
// Temporary Workspace Management
// ============================================================================

/**
 * Create a temporary workspace directory
 */
export function createTempWorkspace(sessionId: string): string {
  const tempDir = path.join(os.tmpdir(), `x2000-sandbox-${sessionId}`);

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true, mode: 0o700 });
  }

  return tempDir;
}

/**
 * Clean up a temporary workspace
 */
export function cleanupTempWorkspace(workspacePath: string): void {
  if (!workspacePath.includes('x2000-sandbox-')) {
    // Safety check - don't delete arbitrary paths
    console.warn(`[Filesystem] Refusing to cleanup non-sandbox path: ${workspacePath}`);
    return;
  }

  try {
    if (fs.existsSync(workspacePath)) {
      fs.rmSync(workspacePath, { recursive: true, force: true });
    }
  } catch (error) {
    console.error(`[Filesystem] Failed to cleanup workspace: ${error}`);
  }
}

// ============================================================================
// Mount Generation for Different Platforms
// ============================================================================

/**
 * Generate nsjail mount arguments (Linux)
 */
export function generateNsjailMounts(config: FilesystemConfig): string[] {
  const args: string[] = [];

  for (const mount of config.mounts) {
    if (mount.tmpfs) {
      args.push(`--tmpfsmount`);
      args.push(`${mount.target}:size=${mount.tmpfsSize || '100M'}`);
    } else if (mount.mode === 'ro') {
      args.push(`--bindmount_ro`);
      args.push(`${mount.source}:${mount.target}`);
    } else {
      args.push(`--bindmount`);
      args.push(`${mount.source}:${mount.target}`);
    }
  }

  return args;
}

/**
 * Generate Seatbelt profile filesystem rules (macOS)
 */
export function generateSeatbeltFilesystemRules(config: FilesystemConfig): string {
  const rules: string[] = [];

  // Deny default file access
  rules.push('(deny file-read* file-write* (subpath "/"))');

  // Allow read access to read-only paths
  for (const roPath of config.readOnlyPaths) {
    rules.push(`(allow file-read* (subpath "${roPath}"))`);
  }

  // Allow read/write access to writable paths
  for (const rwPath of config.writablePaths) {
    rules.push(`(allow file-read* file-write* (subpath "${rwPath}"))`);
  }

  // Allow workspace
  rules.push(`(allow file-read* file-write* (subpath "${config.workspacePath}"))`);

  // Allow /tmp access
  rules.push('(allow file-read* file-write* (subpath "/tmp"))');
  rules.push('(allow file-read* file-write* (subpath "/private/tmp"))');

  // Allow process execution from system paths
  rules.push('(allow process-exec (subpath "/usr/bin"))');
  rules.push('(allow process-exec (subpath "/bin"))');
  rules.push('(allow process-exec (subpath "/usr/local/bin"))');

  return rules.join('\n');
}

/**
 * Generate gVisor config filesystem section
 */
export function generateGVisorFilesystemConfig(config: FilesystemConfig): Record<string, unknown> {
  return {
    root: {
      path: '/',
      readonly: config.rootMode === 'readonly',
    },
    mounts: config.mounts.map(mount => ({
      destination: mount.target,
      source: mount.source,
      type: mount.tmpfs ? 'tmpfs' : 'bind',
      options: [
        mount.mode === 'ro' ? 'ro' : 'rw',
        ...(mount.options || []),
      ],
    })),
  };
}
