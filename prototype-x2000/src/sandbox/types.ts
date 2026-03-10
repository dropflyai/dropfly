/**
 * X2000 Sandbox Execution System - Type Definitions
 *
 * 4-level sandbox hierarchy for secure code execution:
 * - Level 0 (NONE): Direct execution with basic security checks
 * - Level 1 (LIGHT): seccomp-bpf (Linux) / sandbox-exec (macOS)
 * - Level 2 (MEDIUM): gVisor / namespace isolation
 * - Level 3 (FULL): Firecracker microVM / hardware isolation
 */

import type { TrustLevel, BrainType } from '../types/index.js';

// ============================================================================
// Core Sandbox Types
// ============================================================================

/**
 * Sandbox isolation levels
 */
export type SandboxLevel = 'none' | 'light' | 'medium' | 'full';

/**
 * Sandbox level constants for convenience
 */
export const SandboxLevelEnum = {
  NONE: 'none' as const,
  LIGHT: 'light' as const,
  MEDIUM: 'medium' as const,
  FULL: 'full' as const,
};

/**
 * Sandbox level configuration metadata
 */
export interface SandboxLevelConfig {
  level: SandboxLevel;
  name: string;
  description: string;
  startupTimeMs: { min: number; max: number };
  cpuOverhead: string;
  memoryOverhead: string;
  ioOverhead: string;
  isolationStrength: 'weak' | 'moderate' | 'strong' | 'hardware';
}

/**
 * Sandbox level configurations
 */
export const SANDBOX_LEVELS: Record<SandboxLevel, SandboxLevelConfig> = {
  none: {
    level: 'none',
    name: 'None (Direct Execution)',
    description: 'Direct process execution with basic security checks',
    startupTimeMs: { min: 0, max: 0 },
    cpuOverhead: '0%',
    memoryOverhead: '0%',
    ioOverhead: '0%',
    isolationStrength: 'weak',
  },
  light: {
    level: 'light',
    name: 'Light (Process Sandbox)',
    description: 'seccomp-bpf (Linux) / sandbox-exec Seatbelt (macOS)',
    startupTimeMs: { min: 1, max: 20 },
    cpuOverhead: '<1%',
    memoryOverhead: '<5MB',
    ioOverhead: '<5%',
    isolationStrength: 'moderate',
  },
  medium: {
    level: 'medium',
    name: 'Medium (Container Sandbox)',
    description: 'gVisor/namespace isolation with user-space kernel',
    startupTimeMs: { min: 50, max: 150 },
    cpuOverhead: '<5%',
    memoryOverhead: '<50MB',
    ioOverhead: '10-30%',
    isolationStrength: 'strong',
  },
  full: {
    level: 'full',
    name: 'Full (MicroVM Sandbox)',
    description: 'Firecracker microVM with hardware isolation',
    startupTimeMs: { min: 100, max: 200 },
    cpuOverhead: '<5%',
    memoryOverhead: '<100MB',
    ioOverhead: '<10%',
    isolationStrength: 'hardware',
  },
};

// ============================================================================
// Resource Limits
// ============================================================================

/**
 * Resource limits for sandbox execution
 */
export interface ResourceLimits {
  /** CPU cores limit (e.g., 1.0, 2.0) */
  cpuCores: number;

  /** CPU quota as percentage (e.g., 50, 100) */
  cpuQuotaPercent: number;

  /** Memory limit in bytes */
  memoryBytes: number;

  /** Swap memory limit in bytes (0 = disabled) */
  memorySwapBytes: number;

  /** tmpfs size limit in bytes */
  tmpfsSizeBytes: number;

  /** Disk write rate limit in bytes per second */
  diskWriteBytesPerSecond: number;

  /** Maximum number of processes/PIDs */
  maxPids: number;

  /** Maximum number of open files */
  maxOpenFiles: number;

  /** Maximum number of threads */
  maxThreads: number;

  /** Wall clock time limit in seconds */
  wallTimeSeconds: number;

  /** CPU time limit in seconds */
  cpuTimeSeconds: number;

  /** Network bandwidth limit in bytes per second */
  networkBytesPerSecond: number;
}

/**
 * Default resource limits by sandbox level
 */
export const DEFAULT_RESOURCE_LIMITS: Record<SandboxLevel, ResourceLimits> = {
  none: {
    cpuCores: Infinity,
    cpuQuotaPercent: 100,
    memoryBytes: Infinity,
    memorySwapBytes: 0,
    tmpfsSizeBytes: 0,
    diskWriteBytesPerSecond: Infinity,
    maxPids: Infinity,
    maxOpenFiles: Infinity,
    maxThreads: Infinity,
    wallTimeSeconds: Infinity,
    cpuTimeSeconds: Infinity,
    networkBytesPerSecond: Infinity,
  },
  light: {
    cpuCores: 1,
    cpuQuotaPercent: 50,
    memoryBytes: 256 * 1024 * 1024, // 256 MB
    memorySwapBytes: 0,
    tmpfsSizeBytes: 50 * 1024 * 1024, // 50 MB
    diskWriteBytesPerSecond: 10 * 1024 * 1024, // 10 MB/s
    maxPids: 50,
    maxOpenFiles: 64,
    maxThreads: 20,
    wallTimeSeconds: 60,
    cpuTimeSeconds: 30,
    networkBytesPerSecond: 1.25 * 1024 * 1024, // 10 Mbps
  },
  medium: {
    cpuCores: 2,
    cpuQuotaPercent: 80,
    memoryBytes: 512 * 1024 * 1024, // 512 MB
    memorySwapBytes: 0,
    tmpfsSizeBytes: 100 * 1024 * 1024, // 100 MB
    diskWriteBytesPerSecond: 50 * 1024 * 1024, // 50 MB/s
    maxPids: 100,
    maxOpenFiles: 128,
    maxThreads: 50,
    wallTimeSeconds: 120,
    cpuTimeSeconds: 60,
    networkBytesPerSecond: 6.25 * 1024 * 1024, // 50 Mbps
  },
  full: {
    cpuCores: 2,
    cpuQuotaPercent: 100,
    memoryBytes: 1024 * 1024 * 1024, // 1 GB
    memorySwapBytes: 0,
    tmpfsSizeBytes: 500 * 1024 * 1024, // 500 MB
    diskWriteBytesPerSecond: 100 * 1024 * 1024, // 100 MB/s
    maxPids: 200,
    maxOpenFiles: 256,
    maxThreads: 100,
    wallTimeSeconds: 300,
    cpuTimeSeconds: 120,
    networkBytesPerSecond: 12.5 * 1024 * 1024, // 100 Mbps
  },
};

// ============================================================================
// Filesystem Configuration
// ============================================================================

/**
 * Filesystem mount configuration
 */
export interface FilesystemMount {
  /** Source path on host */
  source: string;

  /** Target path in sandbox */
  target: string;

  /** Mount mode */
  mode: 'ro' | 'rw';

  /** Additional mount options */
  options?: string[];

  /** Use tmpfs instead of bind mount */
  tmpfs?: boolean;

  /** Size limit for tmpfs (e.g., '100M') */
  tmpfsSize?: string;
}

/**
 * Filesystem isolation configuration
 */
export interface FilesystemConfig {
  /** Root filesystem mode */
  rootMode: 'readonly' | 'readwrite' | 'overlay';

  /** Workspace path to mount */
  workspacePath: string;

  /** Paths allowed for read access */
  readOnlyPaths: string[];

  /** Paths allowed for write access */
  writablePaths: string[];

  /** Paths explicitly blocked */
  blockedPaths: string[];

  /** Additional mount configurations */
  mounts: FilesystemMount[];

  /** Size of tmpfs for /tmp */
  tmpfsSize: string;

  /** Enable noexec on workspace */
  noExecWorkspace: boolean;
}

// ============================================================================
// Network Configuration
// ============================================================================

/**
 * Network access modes
 */
export type NetworkMode = 'none' | 'allowlist' | 'egress-only' | 'full';

/**
 * Network policy rule
 */
export interface NetworkRule {
  /** Rule type */
  type: 'allow' | 'deny';

  /** Host pattern (supports wildcards, e.g., '*.github.com') */
  host: string;

  /** Port or port range (e.g., 443, '80-443') */
  port: number | string;

  /** Protocol */
  protocol: 'tcp' | 'udp' | 'any';

  /** Description */
  description?: string;
}

/**
 * Network isolation configuration
 */
export interface NetworkConfig {
  /** Network access mode */
  mode: NetworkMode;

  /** Allowlist of hosts/ports (when mode is 'allowlist') */
  allowlist: NetworkRule[];

  /** Denylist of hosts/ports (always applied) */
  denylist: NetworkRule[];

  /** DNS servers to use */
  dnsServers: string[];

  /** Enable DNS filtering */
  filterDns: boolean;

  /** Bandwidth limit in bytes per second */
  bandwidthLimit: number;
}

// ============================================================================
// Security Policy
// ============================================================================

/**
 * Security policy configuration
 */
export interface SecurityPolicy {
  /** Linux capabilities to drop (or 'all' to drop all) */
  dropCapabilities: string[] | 'all';

  /** Prevent privilege escalation */
  noNewPrivileges: boolean;

  /** Read-only root filesystem */
  readOnlyRoot: boolean;

  /** Path to seccomp profile (Linux) */
  seccompProfile?: string;

  /** Seatbelt profile name (macOS) */
  seatbeltProfile?: string;

  /** Run as specific user ID */
  runAsUser?: number;

  /** Run as specific group ID */
  runAsGroup?: number;

  /** Syscalls to allow (for seccomp) */
  allowedSyscalls?: string[];

  /** Syscalls to block (for seccomp) */
  blockedSyscalls?: string[];

  /** Commands blocked from execution */
  blockedCommands?: RegExp[];

  /** Environment variables blocked from setting */
  blockedEnvVars?: Set<string>;
}

// ============================================================================
// Sandbox Configuration
// ============================================================================

/**
 * Complete sandbox configuration
 */
export interface SandboxConfig {
  /** Sandbox isolation level */
  level: SandboxLevel;

  /** Filesystem configuration */
  filesystem: FilesystemConfig;

  /** Network configuration */
  network: NetworkConfig;

  /** Resource limits */
  resources: ResourceLimits;

  /** Security policy */
  security: SecurityPolicy;

  /** Enable audit logging */
  auditLog: boolean;

  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Execution Types
// ============================================================================

/**
 * Sandbox execution options
 */
export interface SandboxExecOptions {
  /** Command to execute (string or array) */
  command: string | string[];

  /** Environment variables */
  env?: Record<string, string>;

  /** Working directory */
  cwd?: string;

  /** Standard input */
  stdin?: string | Buffer;

  /** Timeout in milliseconds */
  timeout?: number;

  /** Callback for stdout data */
  onStdout?: (data: Buffer) => void;

  /** Callback for stderr data */
  onStderr?: (data: Buffer) => void;
}

/**
 * Resource usage statistics
 */
export interface ResourceUsage {
  /** CPU time used in milliseconds */
  cpuTimeMs: number;

  /** Maximum memory used in bytes */
  maxMemoryBytes: number;

  /** Disk bytes written */
  diskBytesWritten: number;

  /** Network bytes sent */
  networkBytesSent: number;

  /** Network bytes received */
  networkBytesReceived: number;

  /** Number of processes spawned */
  processCount: number;
}

/**
 * Result of sandbox execution
 */
export interface SandboxResult {
  /** Whether execution succeeded (exit code 0) */
  success: boolean;

  /** Exit code */
  exitCode: number;

  /** Standard output */
  stdout: string;

  /** Standard error */
  stderr: string;

  /** Execution duration in milliseconds */
  duration: number;

  /** Resource usage statistics */
  resourceUsage: ResourceUsage;

  /** Sandbox level used */
  sandboxLevel: SandboxLevel;

  /** Unique audit ID for this execution */
  auditId: string;

  /** Signal that killed the process (if any) */
  signal?: string;

  /** Whether output was truncated */
  truncated: boolean;

  /** Sandbox startup time in milliseconds */
  sandboxStartupTime: number;
}

/**
 * Sandbox error types
 */
export enum SandboxErrorType {
  /** Sandbox technology not available */
  UNAVAILABLE = 'unavailable',
  /** Configuration error */
  CONFIG_ERROR = 'config_error',
  /** Security policy violation */
  SECURITY_VIOLATION = 'security_violation',
  /** Resource limit exceeded */
  RESOURCE_EXCEEDED = 'resource_exceeded',
  /** Timeout */
  TIMEOUT = 'timeout',
  /** Sandbox startup failed */
  STARTUP_FAILED = 'startup_failed',
  /** Execution failed */
  EXECUTION_FAILED = 'execution_failed',
  /** Cleanup failed */
  CLEANUP_FAILED = 'cleanup_failed',
}

/**
 * Sandbox error
 */
export class SandboxError extends Error {
  constructor(
    public readonly type: SandboxErrorType,
    message: string,
    public readonly level: SandboxLevel,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'SandboxError';
  }
}

// ============================================================================
// Sandbox Instance
// ============================================================================

/**
 * Sandbox instance status
 */
export type SandboxStatus = 'starting' | 'running' | 'stopped' | 'error';

/**
 * Sandbox instance interface
 */
export interface SandboxInstance {
  /** Unique instance ID */
  id: string;

  /** Sandbox level */
  level: SandboxLevel;

  /** Current status */
  status: SandboxStatus;

  /** Creation timestamp */
  createdAt: Date;

  /** Configuration used */
  config: SandboxConfig;

  /** Execute a command in the sandbox */
  exec(options: SandboxExecOptions): Promise<SandboxResult>;

  /** Write a file in the sandbox */
  writeFile(path: string, content: string | Buffer): Promise<void>;

  /** Read a file from the sandbox */
  readFile(path: string): Promise<Buffer>;

  /** List files in a directory */
  listFiles(path: string): Promise<string[]>;

  /** Stop and cleanup the sandbox */
  stop(): Promise<void>;

  /** Get current resource usage */
  getResourceUsage(): Promise<ResourceUsage>;
}

// ============================================================================
// Platform Detection
// ============================================================================

/**
 * Platform type
 */
export type Platform = 'linux' | 'darwin' | 'windows' | 'unknown';

/**
 * Technology availability
 */
export interface TechnologyAvailability {
  /** Whether the technology is available */
  available: boolean;

  /** Version if available */
  version?: string;

  /** Reason if not available */
  reason?: string;

  /** Path to binary if applicable */
  path?: string;
}

/**
 * Platform capabilities
 */
export interface PlatformCapabilities {
  /** Current platform */
  platform: Platform;

  /** Available sandbox levels */
  availableLevels: SandboxLevel[];

  /** Technology availability by name */
  technologies: {
    seccomp?: TechnologyAvailability;
    nsjail?: TechnologyAvailability;
    bubblewrap?: TechnologyAvailability;
    sandboxExec?: TechnologyAvailability;
    gvisor?: TechnologyAvailability;
    firecracker?: TechnologyAvailability;
    lima?: TechnologyAvailability;
    tart?: TechnologyAvailability;
    docker?: TechnologyAvailability;
  };

  /** Whether cgroups v2 is available */
  cgroupsV2: boolean;

  /** Whether user namespaces are available */
  userNamespaces: boolean;

  /** Whether KVM is available */
  kvmAvailable: boolean;
}

// ============================================================================
// Trust Integration
// ============================================================================

/**
 * Action context for sandbox level recommendation
 */
export interface ActionContext {
  /** Risk level of the action */
  riskLevel: 'low' | 'medium' | 'high' | 'critical';

  /** Type of action */
  actionType: 'read' | 'write' | 'execute' | 'network' | 'unknown';

  /** Source of the code/command */
  codeSource: 'trusted' | 'internal' | 'external' | 'untrusted';

  /** Whether it's a known command */
  isKnownCommand: boolean;

  /** Additional context */
  metadata?: Record<string, unknown>;
}

/**
 * Mapping from trust level to default sandbox level
 */
export const TRUST_TO_SANDBOX_LEVEL: Record<TrustLevel, SandboxLevel> = {
  1: 'full',
  2: 'medium',
  3: 'light',
  4: 'none',
};

// ============================================================================
// Audit Types
// ============================================================================

/**
 * Sandbox audit entry
 */
export interface SandboxAuditEntry {
  /** Unique audit ID */
  id: string;

  /** Timestamp */
  timestamp: Date;

  /** Sandbox level used */
  level: SandboxLevel;

  /** Brain that requested execution */
  brainType: BrainType;

  /** Trust level */
  trustLevel: TrustLevel;

  /** Command executed */
  command: string;

  /** Working directory */
  cwd: string;

  /** Result summary */
  result: {
    success: boolean;
    exitCode: number;
    duration: number;
    resourceUsage: ResourceUsage;
  };

  /** Security events during execution */
  securityEvents: SecurityEvent[];

  /** Configuration used (sanitized) */
  config: Partial<SandboxConfig>;
}

/**
 * Security event during sandbox execution
 */
export interface SecurityEvent {
  /** Event type */
  type: 'blocked_syscall' | 'blocked_path' | 'blocked_network' | 'resource_exceeded' | 'policy_violation';

  /** Timestamp */
  timestamp: Date;

  /** Event details */
  details: string;

  /** Severity */
  severity: 'info' | 'warning' | 'error' | 'critical';
}
