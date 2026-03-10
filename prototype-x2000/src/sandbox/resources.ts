/**
 * X2000 Sandbox Resource Limits
 *
 * Handles CPU, memory, disk I/O, and process limits
 * for sandbox execution using cgroups (Linux) and process limits (macOS).
 */

import * as os from 'os';
import type { ResourceLimits, SandboxLevel, ResourceUsage } from './types.js';
import { DEFAULT_RESOURCE_LIMITS } from './types.js';

// ============================================================================
// Resource Limit Helpers
// ============================================================================

/**
 * Parse a size string (e.g., '512M', '1G') to bytes
 */
export function parseSize(size: string): number {
  const match = size.match(/^(\d+(?:\.\d+)?)\s*([KMGT]?B?)?$/i);
  if (!match) {
    throw new Error(`Invalid size format: ${size}`);
  }

  const value = parseFloat(match[1]);
  const unit = (match[2] || '').toUpperCase();

  const multipliers: Record<string, number> = {
    '': 1,
    'B': 1,
    'K': 1024,
    'KB': 1024,
    'M': 1024 * 1024,
    'MB': 1024 * 1024,
    'G': 1024 * 1024 * 1024,
    'GB': 1024 * 1024 * 1024,
    'T': 1024 * 1024 * 1024 * 1024,
    'TB': 1024 * 1024 * 1024 * 1024,
  };

  return value * (multipliers[unit] || 1);
}

/**
 * Format bytes to human-readable size
 */
export function formatSize(bytes: number): string {
  if (!isFinite(bytes)) {
    return 'unlimited';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let value = bytes;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(value < 10 ? 1 : 0)}${units[unitIndex]}`;
}

/**
 * Parse bandwidth string (e.g., '10Mbps') to bytes per second
 */
export function parseBandwidth(bandwidth: string): number {
  const match = bandwidth.match(/^(\d+(?:\.\d+)?)\s*([KMG]?bps)?$/i);
  if (!match) {
    throw new Error(`Invalid bandwidth format: ${bandwidth}`);
  }

  const value = parseFloat(match[1]);
  const unit = (match[2] || '').toLowerCase();

  const multipliers: Record<string, number> = {
    '': 1,
    'bps': 1 / 8, // bits to bytes
    'kbps': 1024 / 8,
    'mbps': 1024 * 1024 / 8,
    'gbps': 1024 * 1024 * 1024 / 8,
  };

  return value * (multipliers[unit] || 1);
}

// ============================================================================
// Resource Limit Configuration
// ============================================================================

/**
 * Options for creating resource limits
 */
export interface ResourceLimitOptions {
  /** CPU cores (e.g., 1.0, 2.0) */
  cpuCores?: number;

  /** Memory limit (e.g., '512M', '1G') */
  memory?: string;

  /** tmpfs size (e.g., '100M') */
  tmpfs?: string;

  /** Maximum processes */
  maxPids?: number;

  /** Timeout in seconds */
  timeout?: number;

  /** Network bandwidth (e.g., '10Mbps') */
  networkBandwidth?: string;
}

/**
 * Create resource limits for a sandbox level with optional overrides
 */
export function createResourceLimits(
  level: SandboxLevel,
  options: ResourceLimitOptions = {}
): ResourceLimits {
  const defaults = DEFAULT_RESOURCE_LIMITS[level];

  // Get system info for bounds checking
  const systemCpus = os.cpus().length;
  const systemMemory = os.totalmem();

  // Apply overrides with bounds checking
  const limits: ResourceLimits = {
    ...defaults,
  };

  if (options.cpuCores !== undefined) {
    limits.cpuCores = Math.min(options.cpuCores, systemCpus);
  }

  if (options.memory !== undefined) {
    const memBytes = parseSize(options.memory);
    // Don't allow more than 80% of system memory
    limits.memoryBytes = Math.min(memBytes, systemMemory * 0.8);
  }

  if (options.tmpfs !== undefined) {
    limits.tmpfsSizeBytes = parseSize(options.tmpfs);
  }

  if (options.maxPids !== undefined) {
    limits.maxPids = options.maxPids;
  }

  if (options.timeout !== undefined) {
    limits.wallTimeSeconds = options.timeout;
  }

  if (options.networkBandwidth !== undefined) {
    limits.networkBytesPerSecond = parseBandwidth(options.networkBandwidth);
  }

  return limits;
}

/**
 * Validate resource limits are within system capabilities
 */
export function validateResourceLimits(limits: ResourceLimits): {
  valid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  const systemCpus = os.cpus().length;
  const systemMemory = os.totalmem();

  // Check CPU
  if (isFinite(limits.cpuCores) && limits.cpuCores > systemCpus) {
    warnings.push(
      `CPU cores (${limits.cpuCores}) exceeds system CPUs (${systemCpus})`
    );
  }

  // Check memory
  if (isFinite(limits.memoryBytes) && limits.memoryBytes > systemMemory) {
    errors.push(
      `Memory limit (${formatSize(limits.memoryBytes)}) exceeds system memory (${formatSize(systemMemory)})`
    );
  }

  // Check for very low limits that might cause issues
  if (limits.memoryBytes < 32 * 1024 * 1024) {
    warnings.push('Memory limit below 32MB may cause execution failures');
  }

  if (limits.maxPids < 5) {
    warnings.push('PID limit below 5 may prevent process execution');
  }

  if (limits.wallTimeSeconds < 5) {
    warnings.push('Wall time limit below 5 seconds may cause premature termination');
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}

// ============================================================================
// Platform-Specific Resource Configuration
// ============================================================================

/**
 * Generate cgroups v2 configuration (Linux)
 */
export function generateCgroupsConfig(
  limits: ResourceLimits,
  cgroupPath: string
): Record<string, string> {
  const config: Record<string, string> = {};

  // CPU limits
  if (isFinite(limits.cpuCores)) {
    const cpuQuota = Math.floor(limits.cpuCores * 100000); // microseconds
    const cpuPeriod = 100000;
    config['cpu.max'] = `${cpuQuota} ${cpuPeriod}`;
  }

  // Memory limits
  if (isFinite(limits.memoryBytes)) {
    config['memory.max'] = String(limits.memoryBytes);
    config['memory.swap.max'] = String(limits.memorySwapBytes);
  }

  // PID limits
  if (isFinite(limits.maxPids)) {
    config['pids.max'] = String(limits.maxPids);
  }

  // I/O limits (if device specified)
  if (isFinite(limits.diskWriteBytesPerSecond)) {
    // Would need device major:minor, simplified here
    config['io.max'] = `default wbps=${limits.diskWriteBytesPerSecond}`;
  }

  return config;
}

/**
 * Generate nsjail resource limit arguments (Linux)
 */
export function generateNsjailResourceArgs(limits: ResourceLimits): string[] {
  const args: string[] = [];

  // CPU time limit (in seconds)
  if (isFinite(limits.cpuTimeSeconds)) {
    args.push('--rlimit_cpu', String(limits.cpuTimeSeconds));
  }

  // Memory limit (in MB for nsjail)
  if (isFinite(limits.memoryBytes)) {
    const memMB = Math.ceil(limits.memoryBytes / (1024 * 1024));
    args.push('--rlimit_as', String(memMB));
  }

  // File size limit (in MB)
  if (isFinite(limits.tmpfsSizeBytes)) {
    const sizeMB = Math.ceil(limits.tmpfsSizeBytes / (1024 * 1024));
    args.push('--rlimit_fsize', String(sizeMB));
  }

  // Open files limit
  if (isFinite(limits.maxOpenFiles)) {
    args.push('--rlimit_nofile', String(limits.maxOpenFiles));
  }

  // Process count (via cgroup)
  if (isFinite(limits.maxPids)) {
    args.push('--cgroup_pids_max', String(limits.maxPids));
  }

  // Wall time limit
  if (isFinite(limits.wallTimeSeconds)) {
    args.push('--time_limit', String(limits.wallTimeSeconds));
  }

  // Memory via cgroup
  if (isFinite(limits.memoryBytes)) {
    args.push('--cgroup_mem_max', String(limits.memoryBytes));
  }

  return args;
}

/**
 * Generate macOS ulimit commands
 */
export function generateMacOSLimits(limits: ResourceLimits): string[] {
  const commands: string[] = [];

  // CPU time (seconds)
  if (isFinite(limits.cpuTimeSeconds)) {
    commands.push(`ulimit -t ${limits.cpuTimeSeconds}`);
  }

  // Memory (KB on macOS)
  if (isFinite(limits.memoryBytes)) {
    const memKB = Math.ceil(limits.memoryBytes / 1024);
    commands.push(`ulimit -m ${memKB}`);
    commands.push(`ulimit -v ${memKB}`);
  }

  // Open files
  if (isFinite(limits.maxOpenFiles)) {
    commands.push(`ulimit -n ${limits.maxOpenFiles}`);
  }

  // Max user processes
  if (isFinite(limits.maxPids)) {
    commands.push(`ulimit -u ${limits.maxPids}`);
  }

  // File size (KB)
  if (isFinite(limits.tmpfsSizeBytes)) {
    const sizeKB = Math.ceil(limits.tmpfsSizeBytes / 1024);
    commands.push(`ulimit -f ${sizeKB}`);
  }

  return commands;
}

/**
 * Generate gVisor resource configuration
 */
export function generateGVisorResourceConfig(limits: ResourceLimits): Record<string, unknown> {
  return {
    linux: {
      resources: {
        cpu: {
          quota: isFinite(limits.cpuCores)
            ? Math.floor(limits.cpuCores * 100000)
            : undefined,
          period: 100000,
        },
        memory: {
          limit: isFinite(limits.memoryBytes) ? limits.memoryBytes : undefined,
          swap: limits.memorySwapBytes,
        },
        pids: {
          limit: isFinite(limits.maxPids) ? limits.maxPids : undefined,
        },
      },
      rlimits: [
        {
          type: 'RLIMIT_CPU',
          hard: limits.cpuTimeSeconds,
          soft: limits.cpuTimeSeconds,
        },
        {
          type: 'RLIMIT_NOFILE',
          hard: limits.maxOpenFiles,
          soft: limits.maxOpenFiles,
        },
        {
          type: 'RLIMIT_NPROC',
          hard: limits.maxPids,
          soft: limits.maxPids,
        },
      ].filter(r => isFinite(r.hard)),
    },
  };
}

// ============================================================================
// Resource Usage Tracking
// ============================================================================

/**
 * Create empty resource usage object
 */
export function createEmptyResourceUsage(): ResourceUsage {
  return {
    cpuTimeMs: 0,
    maxMemoryBytes: 0,
    diskBytesWritten: 0,
    networkBytesSent: 0,
    networkBytesReceived: 0,
    processCount: 0,
  };
}

/**
 * Parse rusage from process (Node.js process.resourceUsage)
 */
export function parseProcessResourceUsage(
  startUsage: NodeJS.ResourceUsage,
  endUsage: NodeJS.ResourceUsage
): Partial<ResourceUsage> {
  return {
    cpuTimeMs:
      (endUsage.userCPUTime - startUsage.userCPUTime) / 1000 +
      (endUsage.systemCPUTime - startUsage.systemCPUTime) / 1000,
    maxMemoryBytes: endUsage.maxRSS * 1024, // maxRSS is in KB
  };
}

/**
 * Check if resource usage exceeds limits
 */
export function checkResourceLimits(
  usage: ResourceUsage,
  limits: ResourceLimits
): { exceeded: boolean; violations: string[] } {
  const violations: string[] = [];

  if (usage.cpuTimeMs / 1000 > limits.cpuTimeSeconds) {
    violations.push(
      `CPU time (${(usage.cpuTimeMs / 1000).toFixed(1)}s) exceeds limit (${limits.cpuTimeSeconds}s)`
    );
  }

  if (usage.maxMemoryBytes > limits.memoryBytes) {
    violations.push(
      `Memory (${formatSize(usage.maxMemoryBytes)}) exceeds limit (${formatSize(limits.memoryBytes)})`
    );
  }

  if (usage.diskBytesWritten > limits.tmpfsSizeBytes) {
    violations.push(
      `Disk written (${formatSize(usage.diskBytesWritten)}) exceeds limit (${formatSize(limits.tmpfsSizeBytes)})`
    );
  }

  if (usage.processCount > limits.maxPids) {
    violations.push(
      `Process count (${usage.processCount}) exceeds limit (${limits.maxPids})`
    );
  }

  const networkBytes = usage.networkBytesSent + usage.networkBytesReceived;
  if (
    isFinite(limits.networkBytesPerSecond) &&
    networkBytes > limits.networkBytesPerSecond * limits.wallTimeSeconds
  ) {
    violations.push(`Network bandwidth exceeded`);
  }

  return {
    exceeded: violations.length > 0,
    violations,
  };
}

/**
 * Format resource usage for display
 */
export function formatResourceUsage(usage: ResourceUsage): string {
  return [
    `CPU: ${(usage.cpuTimeMs / 1000).toFixed(2)}s`,
    `Memory: ${formatSize(usage.maxMemoryBytes)}`,
    `Disk: ${formatSize(usage.diskBytesWritten)}`,
    `Network: ${formatSize(usage.networkBytesSent + usage.networkBytesReceived)}`,
    `Processes: ${usage.processCount}`,
  ].join(', ');
}
