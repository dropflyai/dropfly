/**
 * X2000 Sandbox Manager
 *
 * Central manager for the 4-level sandbox execution system.
 * Handles sandbox level selection, instance management, health monitoring,
 * and cleanup.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  SandboxLevel,
  SandboxConfig,
  SandboxInstance,
  SandboxExecOptions,
  SandboxResult,
  SandboxAuditEntry,
  PlatformCapabilities,
  Platform,
  ActionContext,
  SecurityPolicy,
  FilesystemConfig,
  NetworkConfig,
  ResourceLimits,
} from './types.js';
import {
  SandboxError,
  SandboxErrorType,
  SANDBOX_LEVELS,
  DEFAULT_RESOURCE_LIMITS,
  TRUST_TO_SANDBOX_LEVEL,
} from './types.js';
import type { TrustLevel, BrainType } from '../types/index.js';

// Import level implementations
import { createNoneSandbox, execNone } from './levels/none.js';
import { createLightSandbox, execLight, isLightSandboxAvailable, getPlatform } from './levels/light.js';
import { createMediumSandbox, execMedium, isMediumSandboxAvailable } from './levels/medium.js';
import { createFullSandbox, execFull, isFullSandboxAvailable, isFirecrackerAvailable, isTartAvailable, isWasmAvailable } from './levels/full.js';
import { isNsjailAvailable, isBubblewrapAvailable, isSeatbeltAvailable } from './levels/light.js';
import { isGVisorAvailable, isDockerAvailable } from './levels/medium.js';

// Import configuration builders
import { createFilesystemConfig, type FilesystemOptions } from './filesystem.js';
import { createNetworkConfig, type NetworkOptions } from './network.js';
import { createResourceLimits, type ResourceLimitOptions } from './resources.js';

// ============================================================================
// Sandbox Manager Interface
// ============================================================================

/**
 * Options for sandbox manager configuration
 */
export interface SandboxManagerOptions {
  /** Default sandbox level */
  defaultLevel?: SandboxLevel;

  /** Enable audit logging */
  auditEnabled?: boolean;

  /** Maximum audit log entries */
  maxAuditEntries?: number;

  /** Warm pool size per level */
  warmPoolSize?: number;
}

/**
 * Options for creating a sandbox
 */
export interface CreateSandboxOptions {
  /** Workspace path */
  workspacePath: string;

  /** Filesystem options */
  filesystem?: Partial<FilesystemOptions>;

  /** Network options */
  network?: Partial<NetworkOptions>;

  /** Resource limit options */
  resources?: Partial<ResourceLimitOptions>;

  /** Security policy overrides */
  security?: Partial<SecurityPolicy>;

  /** Enable audit logging */
  auditLog?: boolean;
}

// ============================================================================
// Sandbox Manager Implementation
// ============================================================================

/**
 * Sandbox Manager - manages sandbox instances and execution
 */
export class SandboxManager {
  private instances: Map<string, SandboxInstance> = new Map();
  private auditLog: SandboxAuditEntry[] = [];
  private options: Required<SandboxManagerOptions>;
  private capabilities: PlatformCapabilities | null = null;
  private warmPool: Map<SandboxLevel, SandboxInstance[]> = new Map();

  constructor(options: SandboxManagerOptions = {}) {
    this.options = {
      defaultLevel: options.defaultLevel || 'light',
      auditEnabled: options.auditEnabled ?? true,
      maxAuditEntries: options.maxAuditEntries || 10000,
      warmPoolSize: options.warmPoolSize || 0,
    };
  }

  // ==========================================================================
  // Capability Detection
  // ==========================================================================

  /**
   * Get platform capabilities
   */
  async getCapabilities(): Promise<PlatformCapabilities> {
    if (this.capabilities) {
      return this.capabilities;
    }

    const platform = getPlatform();
    const availableLevels: SandboxLevel[] = ['none'];

    // Check technology availability
    const technologies: PlatformCapabilities['technologies'] = {};

    // Light sandbox technologies
    if (platform === 'darwin') {
      const seatbeltAvailable = await isSeatbeltAvailable();
      technologies.sandboxExec = {
        available: seatbeltAvailable,
        reason: seatbeltAvailable ? undefined : 'sandbox-exec not found',
      };
      if (seatbeltAvailable) {
        availableLevels.push('light');
      }
    } else if (platform === 'linux') {
      const nsjailAvailable = await isNsjailAvailable();
      const bwrapAvailable = await isBubblewrapAvailable();
      technologies.nsjail = {
        available: nsjailAvailable,
        reason: nsjailAvailable ? undefined : 'nsjail not found',
      };
      technologies.bubblewrap = {
        available: bwrapAvailable,
        reason: bwrapAvailable ? undefined : 'bwrap not found',
      };
      if (nsjailAvailable || bwrapAvailable) {
        availableLevels.push('light');
      }
    }

    // Medium sandbox technologies
    const gvisorAvailable = await isGVisorAvailable();
    const dockerAvailable = await isDockerAvailable();
    technologies.gvisor = {
      available: gvisorAvailable,
      reason: gvisorAvailable ? undefined : 'runsc (gVisor) not found or not on Linux',
    };
    technologies.docker = {
      available: dockerAvailable,
      reason: dockerAvailable ? undefined : 'Docker not available',
    };
    if (gvisorAvailable || dockerAvailable) {
      availableLevels.push('medium');
    }

    // Full sandbox technologies
    const firecrackerAvailable = await isFirecrackerAvailable();
    const tartAvailable = await isTartAvailable();
    const wasmAvailable = await isWasmAvailable();
    technologies.firecracker = {
      available: firecrackerAvailable,
      reason: firecrackerAvailable ? undefined : 'Firecracker not found or KVM unavailable',
    };
    technologies.tart = {
      available: tartAvailable,
      reason: tartAvailable ? undefined : 'Tart not found or not on macOS',
    };
    if (firecrackerAvailable || tartAvailable || wasmAvailable || dockerAvailable) {
      availableLevels.push('full');
    }

    this.capabilities = {
      platform,
      availableLevels: availableLevels as SandboxLevel[],
      technologies,
      cgroupsV2: platform === 'linux' && this.checkCgroupsV2(),
      userNamespaces: platform === 'linux' && this.checkUserNamespaces(),
      kvmAvailable: firecrackerAvailable,
    };

    return this.capabilities;
  }

  private checkCgroupsV2(): boolean {
    try {
      const fs = require('fs');
      return fs.existsSync('/sys/fs/cgroup/cgroup.controllers');
    } catch {
      return false;
    }
  }

  private checkUserNamespaces(): boolean {
    try {
      const fs = require('fs');
      const content = fs.readFileSync('/proc/sys/kernel/unprivileged_userns_clone', 'utf-8');
      return content.trim() === '1';
    } catch {
      return false;
    }
  }

  /**
   * Check if a specific sandbox level is available
   */
  async isAvailable(level: SandboxLevel): Promise<boolean> {
    const caps = await this.getCapabilities();
    return caps.availableLevels.includes(level);
  }

  // ==========================================================================
  // Sandbox Level Selection
  // ==========================================================================

  /**
   * Recommend sandbox level based on trust and action context
   */
  recommendLevel(
    trustLevel: TrustLevel,
    action: string,
    context: ActionContext
  ): SandboxLevel {
    // Start with trust-based default
    let level = TRUST_TO_SANDBOX_LEVEL[trustLevel];

    // Adjust based on risk level
    if (context.riskLevel === 'critical') {
      level = 'full';
    } else if (context.riskLevel === 'high' && level === 'none') {
      level = 'light';
    }

    // Adjust based on code source
    if (context.codeSource === 'untrusted') {
      level = 'full';
    } else if (context.codeSource === 'external' && level === 'none') {
      level = 'medium';
    }

    // Check action type
    if (context.actionType === 'execute' && level === 'none') {
      level = 'light';
    }

    // Check specific action keywords
    const dangerousKeywords = ['curl', 'wget', 'eval', 'exec', 'spawn'];
    const actionLower = action.toLowerCase();
    for (const keyword of dangerousKeywords) {
      if (actionLower.includes(keyword) && level === 'none') {
        level = 'light';
        break;
      }
    }

    return level;
  }

  // ==========================================================================
  // Sandbox Configuration
  // ==========================================================================

  /**
   * Create a complete sandbox configuration
   */
  createConfig(level: SandboxLevel, options: CreateSandboxOptions): SandboxConfig {
    // Build filesystem config
    const filesystem = createFilesystemConfig(level, {
      workspacePath: options.workspacePath,
      ...options.filesystem,
    });

    // Build network config
    const network = createNetworkConfig(level, options.network);

    // Build resource limits
    const resources = createResourceLimits(level, options.resources);

    // Build security policy
    const security: SecurityPolicy = {
      dropCapabilities: 'all',
      noNewPrivileges: true,
      readOnlyRoot: level !== 'none',
      runAsUser: 65534, // nobody
      runAsGroup: 65534,
      ...options.security,
    };

    return {
      level,
      filesystem,
      network,
      resources,
      security,
      auditLog: options.auditLog ?? this.options.auditEnabled,
    };
  }

  // ==========================================================================
  // Sandbox Instance Management
  // ==========================================================================

  /**
   * Create a new sandbox instance
   */
  async create(config: SandboxConfig): Promise<SandboxInstance> {
    const available = await this.isAvailable(config.level);
    if (!available) {
      throw new SandboxError(
        SandboxErrorType.UNAVAILABLE,
        `Sandbox level '${config.level}' is not available on this platform`,
        config.level
      );
    }

    let instance: SandboxInstance;

    switch (config.level) {
      case 'none':
        instance = createNoneSandbox(config);
        break;
      case 'light':
        instance = await createLightSandbox(config);
        break;
      case 'medium':
        instance = await createMediumSandbox(config);
        break;
      case 'full':
        instance = await createFullSandbox(config);
        break;
      default:
        throw new SandboxError(
          SandboxErrorType.CONFIG_ERROR,
          `Unknown sandbox level: ${config.level}`,
          config.level
        );
    }

    this.instances.set(instance.id, instance);

    console.log(
      `[SandboxManager] Created ${config.level} sandbox: ${instance.id}`
    );

    return instance;
  }

  /**
   * Get a sandbox instance by ID
   */
  get(id: string): SandboxInstance | undefined {
    return this.instances.get(id);
  }

  /**
   * List all active sandbox instances
   */
  list(): SandboxInstance[] {
    return Array.from(this.instances.values()).filter(
      (s) => s.status === 'running' || s.status === 'starting'
    );
  }

  /**
   * Stop a sandbox instance
   */
  async stop(id: string): Promise<void> {
    const instance = this.instances.get(id);
    if (!instance) {
      return;
    }

    await instance.stop();
    this.instances.delete(id);

    console.log(`[SandboxManager] Stopped sandbox: ${id}`);
  }

  /**
   * Stop all sandbox instances
   */
  async cleanup(): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const instance of this.instances.values()) {
      promises.push(instance.stop());
    }

    await Promise.allSettled(promises);
    this.instances.clear();

    // Cleanup warm pool
    for (const pool of this.warmPool.values()) {
      for (const instance of pool) {
        await instance.stop().catch(() => {});
      }
    }
    this.warmPool.clear();

    console.log('[SandboxManager] All sandboxes cleaned up');
  }

  // ==========================================================================
  // One-Shot Execution
  // ==========================================================================

  /**
   * Execute a command in a temporary sandbox
   */
  async exec(
    command: string | string[],
    config: SandboxConfig,
    options: Partial<SandboxExecOptions> = {}
  ): Promise<SandboxResult> {
    const startTime = Date.now();

    let result: SandboxResult;

    switch (config.level) {
      case 'none':
        result = await execNone(command, config, options);
        break;
      case 'light':
        result = await execLight(command, config, options);
        break;
      case 'medium':
        result = await execMedium(command, config, options);
        break;
      case 'full':
        result = await execFull(command, config, options);
        break;
      default:
        throw new SandboxError(
          SandboxErrorType.CONFIG_ERROR,
          `Unknown sandbox level: ${config.level}`,
          config.level
        );
    }

    // Log audit entry
    if (config.auditLog) {
      this.logAudit({
        id: result.auditId,
        timestamp: new Date(),
        level: config.level,
        brainType: 'engineering', // Would come from context
        trustLevel: 3, // Would come from context
        command: Array.isArray(command) ? command.join(' ') : command,
        cwd: config.filesystem.workspacePath,
        result: {
          success: result.success,
          exitCode: result.exitCode,
          duration: result.duration,
          resourceUsage: result.resourceUsage,
        },
        securityEvents: [],
        config: {
          level: config.level,
          network: { mode: config.network.mode } as NetworkConfig,
        },
      });
    }

    return result;
  }

  // ==========================================================================
  // Warm Pool Management
  // ==========================================================================

  /**
   * Warm up sandbox pool for faster execution
   */
  async warmup(level: SandboxLevel, count: number = 1): Promise<void> {
    if (!(await this.isAvailable(level))) {
      console.warn(`[SandboxManager] Cannot warm up ${level} sandbox - not available`);
      return;
    }

    const pool = this.warmPool.get(level) || [];

    // Create default config for warming
    const config = this.createConfig(level, {
      workspacePath: '/tmp',
    });

    const promises: Promise<SandboxInstance>[] = [];
    for (let i = pool.length; i < count; i++) {
      promises.push(this.create(config));
    }

    const instances = await Promise.all(promises);
    pool.push(...instances);
    this.warmPool.set(level, pool);

    console.log(`[SandboxManager] Warmed up ${instances.length} ${level} sandbox(es)`);
  }

  /**
   * Get a warm sandbox from pool (or create new one)
   */
  private async getWarmSandbox(level: SandboxLevel, config: SandboxConfig): Promise<SandboxInstance> {
    const pool = this.warmPool.get(level);

    if (pool && pool.length > 0) {
      const instance = pool.shift()!;
      // Note: Would need to reconfigure the instance for new config
      // For now, just return it
      return instance;
    }

    return this.create(config);
  }

  // ==========================================================================
  // Audit Logging
  // ==========================================================================

  /**
   * Log an audit entry
   */
  private logAudit(entry: SandboxAuditEntry): void {
    this.auditLog.push(entry);

    // Trim if over max
    if (this.auditLog.length > this.options.maxAuditEntries) {
      this.auditLog = this.auditLog.slice(-Math.floor(this.options.maxAuditEntries / 2));
    }
  }

  /**
   * Get audit log entries
   */
  getAuditLog(limit: number = 100): SandboxAuditEntry[] {
    return this.auditLog.slice(-limit);
  }

  /**
   * Get audit entries for a specific sandbox
   */
  getAuditForSandbox(sandboxId: string): SandboxAuditEntry[] {
    return this.auditLog.filter((e) => e.id === sandboxId);
  }

  // ==========================================================================
  // Health Monitoring
  // ==========================================================================

  /**
   * Get health status of sandbox system
   */
  async getHealth(): Promise<{
    healthy: boolean;
    platform: Platform;
    availableLevels: SandboxLevel[];
    activeInstances: number;
    warmPoolSize: number;
    auditLogSize: number;
    issues: string[];
  }> {
    const caps = await this.getCapabilities();
    const issues: string[] = [];

    // Check for potential issues
    if (caps.availableLevels.length < 2) {
      issues.push('Limited sandbox levels available');
    }

    if (!caps.technologies.docker?.available && !caps.technologies.sandboxExec?.available) {
      issues.push('No container or process sandbox available');
    }

    let warmPoolTotal = 0;
    for (const pool of this.warmPool.values()) {
      warmPoolTotal += pool.length;
    }

    return {
      healthy: issues.length === 0,
      platform: caps.platform,
      availableLevels: caps.availableLevels,
      activeInstances: this.instances.size,
      warmPoolSize: warmPoolTotal,
      auditLogSize: this.auditLog.length,
      issues,
    };
  }
}

// ============================================================================
// Default Instance
// ============================================================================

/**
 * Default sandbox manager instance
 */
export const sandboxManager = new SandboxManager();

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Execute command in sandbox with minimal configuration
 */
export async function sandboxExec(
  command: string | string[],
  workspacePath: string,
  options: {
    level?: SandboxLevel;
    trustLevel?: TrustLevel;
    timeout?: number;
    env?: Record<string, string>;
  } = {}
): Promise<SandboxResult> {
  const level = options.level || (options.trustLevel ? TRUST_TO_SANDBOX_LEVEL[options.trustLevel] : 'light');

  const config = sandboxManager.createConfig(level as SandboxLevel, {
    workspacePath,
    resources: options.timeout ? { timeout: options.timeout } : undefined,
  });

  return sandboxManager.exec(command, config, {
    env: options.env,
    timeout: options.timeout ? options.timeout * 1000 : undefined,
  });
}
