/**
 * X2000 Plugin System - V8 Isolate Sandboxing
 *
 * Provides secure execution environment for plugins using V8 isolates.
 * Features:
 * - Memory isolation per plugin
 * - CPU time limits
 * - Capability-based permissions
 * - Crash isolation
 *
 * Note: This implementation provides the interface and fallback behavior.
 * Full V8 isolate support requires the `isolated-vm` package.
 */

import type {
  SandboxConfig,
  MemoryUsage,
  Sandbox,
  PluginCapabilities,
} from './types.js';

// ============================================================================
// Types
// ============================================================================

interface SandboxOptions {
  pluginId: string;
  capabilities: PluginCapabilities;
  config: SandboxConfig;
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_SANDBOX_CONFIG: SandboxConfig = {
  memoryLimit: 64, // 64MB
  cpuTimeLimit: 5000, // 5 seconds
  allowAsync: true,
};

// ============================================================================
// Sandbox Errors
// ============================================================================

export class SandboxError extends Error {
  constructor(
    public readonly pluginId: string,
    message: string,
    public readonly cause?: Error
  ) {
    super(`[Sandbox:${pluginId}] ${message}`);
    this.name = 'SandboxError';
  }
}

export class SandboxMemoryError extends SandboxError {
  constructor(pluginId: string, cause?: Error) {
    super(pluginId, 'Memory limit exceeded', cause);
    this.name = 'SandboxMemoryError';
  }
}

export class SandboxTimeoutError extends SandboxError {
  constructor(
    pluginId: string,
    public readonly timeout: number,
    cause?: Error
  ) {
    super(pluginId, `Execution timed out after ${timeout}ms`, cause);
    this.name = 'SandboxTimeoutError';
  }
}

export class SandboxPermissionError extends SandboxError {
  constructor(
    pluginId: string,
    public readonly permission: string,
    public readonly resource?: string
  ) {
    super(pluginId, `Permission denied: ${permission}${resource ? ` for ${resource}` : ''}`);
    this.name = 'SandboxPermissionError';
  }
}

// ============================================================================
// Capability Enforcer
// ============================================================================

/**
 * Enforces capability-based permissions for plugins
 */
export class CapabilityEnforcer {
  private capabilities: Map<string, PluginCapabilities> = new Map();

  /**
   * Register capabilities for a plugin
   */
  register(pluginId: string, capabilities: PluginCapabilities): void {
    this.capabilities.set(pluginId, capabilities);
  }

  /**
   * Remove capabilities for a plugin
   */
  unregister(pluginId: string): void {
    this.capabilities.delete(pluginId);
  }

  /**
   * Check if plugin can access network
   */
  canAccessNetwork(pluginId: string, domain: string, port: number = 443): boolean {
    const caps = this.capabilities.get(pluginId);
    if (!caps?.network) return false;

    const domainAllowed = caps.network.domains.some(d => {
      if (d === '*') return true;
      if (d.startsWith('*.')) {
        return domain.endsWith(d.slice(1));
      }
      return domain === d;
    });

    const portAllowed = !caps.network.ports ||
      caps.network.ports.length === 0 ||
      caps.network.ports.includes(port);

    return domainAllowed && portAllowed;
  }

  /**
   * Check if plugin can access filesystem path
   */
  canAccessFilesystem(pluginId: string, path: string, mode: 'read' | 'write'): boolean {
    const caps = this.capabilities.get(pluginId);
    if (!caps?.filesystem) return false;

    const paths = mode === 'read' ? caps.filesystem.read : caps.filesystem.write;

    return paths.some(allowedPath => {
      const normalized = this.normalizePath(allowedPath);
      return path.startsWith(normalized);
    });
  }

  /**
   * Check if plugin can read environment variable
   */
  canAccessEnv(pluginId: string, varName: string, mode: 'read' | 'write'): boolean {
    const caps = this.capabilities.get(pluginId);
    if (!caps?.env) return false;

    const vars = mode === 'read' ? caps.env.read : caps.env.write;
    return vars.includes(varName) || vars.includes('*');
  }

  /**
   * Check if plugin can access X2000 memory
   */
  canAccessMemory(pluginId: string, mode: 'read' | 'write'): boolean {
    const caps = this.capabilities.get(pluginId);
    if (!caps?.x2000?.memory) return false;

    if (mode === 'read') {
      return caps.x2000.memory === 'read' || caps.x2000.memory === 'write';
    }

    return caps.x2000.memory === 'write';
  }

  /**
   * Check if plugin can access specific brain
   */
  canAccessBrain(pluginId: string, brainId: string): boolean {
    const caps = this.capabilities.get(pluginId);
    if (!caps?.x2000?.brains) return false;

    if (caps.x2000.brains === '*') return true;
    return caps.x2000.brains.includes(brainId);
  }

  /**
   * Check if plugin can access specific tool
   */
  canAccessTool(pluginId: string, toolId: string): boolean {
    const caps = this.capabilities.get(pluginId);
    if (!caps?.x2000?.tools) return false;

    if (caps.x2000.tools === '*') return true;
    return caps.x2000.tools.includes(toolId);
  }

  /**
   * Check if plugin can spawn subprocesses
   */
  canSpawnSubprocess(pluginId: string): boolean {
    const caps = this.capabilities.get(pluginId);
    return caps?.system?.subprocess ?? false;
  }

  /**
   * Check if plugin can use native modules
   */
  canUseNative(pluginId: string): boolean {
    const caps = this.capabilities.get(pluginId);
    return caps?.system?.native ?? false;
  }

  /**
   * Get all capabilities for a plugin
   */
  getCapabilities(pluginId: string): PluginCapabilities | undefined {
    return this.capabilities.get(pluginId);
  }

  /**
   * Normalize path (handle ~ and environment variables)
   */
  private normalizePath(path: string): string {
    return path
      .replace(/^~/, process.env.HOME ?? '')
      .replace(/\$\{?(\w+)\}?/g, (_, name) => process.env[name] ?? '');
  }
}

// ============================================================================
// Fallback Sandbox (No V8 Isolate)
// ============================================================================

/**
 * Fallback sandbox that runs in the main process
 * Used when isolated-vm is not available
 *
 * WARNING: This does not provide true isolation!
 * It is intended for development/testing only.
 */
class FallbackSandbox implements Sandbox {
  private disposed = false;
  private memoryEstimate = 0;
  private context: Record<string, unknown> = {};

  constructor(
    public readonly id: string,
    private readonly pluginId: string,
    private readonly config: SandboxConfig,
    private readonly capabilities: PluginCapabilities
  ) {
    console.warn(
      `[Sandbox] Using fallback sandbox for ${pluginId}. ` +
      `Install 'isolated-vm' for true isolation.`
    );
  }

  async execute(code: string): Promise<unknown> {
    this.checkDisposed();

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new SandboxTimeoutError(this.pluginId, this.config.cpuTimeLimit));
      }, this.config.cpuTimeLimit);

      try {
        // Create a restricted context
        const restrictedGlobals = this.createRestrictedGlobals();

        // Use Function constructor to evaluate code
        // Note: This is NOT truly sandboxed - just a development fallback
        const fn = new Function(
          ...Object.keys(restrictedGlobals),
          `"use strict"; return (async () => { ${code} })();`
        );

        Promise.resolve(fn(...Object.values(restrictedGlobals)))
          .then((result) => {
            clearTimeout(timeoutId);
            this.memoryEstimate += code.length;
            resolve(result);
          })
          .catch((error) => {
            clearTimeout(timeoutId);
            reject(error);
          });
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  async call(fn: string, args: unknown[]): Promise<unknown> {
    this.checkDisposed();

    const func = this.context[fn];
    if (typeof func !== 'function') {
      throw new Error(`Function not found: ${fn}`);
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new SandboxTimeoutError(this.pluginId, this.config.cpuTimeLimit));
      }, this.config.cpuTimeLimit);

      try {
        Promise.resolve((func as Function)(...args))
          .then((result) => {
            clearTimeout(timeoutId);
            resolve(result);
          })
          .catch((error) => {
            clearTimeout(timeoutId);
            reject(error);
          });
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  getMemoryUsage(): MemoryUsage {
    // Estimate based on code executed
    return {
      used: this.memoryEstimate,
      total: this.config.memoryLimit * 1024 * 1024,
      limit: this.config.memoryLimit * 1024 * 1024,
    };
  }

  async dispose(): Promise<void> {
    this.disposed = true;
    this.context = {};
    this.memoryEstimate = 0;
  }

  private checkDisposed(): void {
    if (this.disposed) {
      throw new SandboxError(this.pluginId, 'Sandbox has been disposed');
    }
  }

  private createRestrictedGlobals(): Record<string, unknown> {
    // Create a minimal global context
    return {
      console: {
        log: (...args: unknown[]) => console.log(`[Plugin:${this.pluginId}]`, ...args),
        info: (...args: unknown[]) => console.info(`[Plugin:${this.pluginId}]`, ...args),
        warn: (...args: unknown[]) => console.warn(`[Plugin:${this.pluginId}]`, ...args),
        error: (...args: unknown[]) => console.error(`[Plugin:${this.pluginId}]`, ...args),
      },
      setTimeout: undefined, // Disabled in fallback
      setInterval: undefined, // Disabled in fallback
      eval: undefined,
      Function: undefined,
      JSON,
      Math,
      Date,
      Array,
      Object,
      String,
      Number,
      Boolean,
      Map,
      Set,
      Promise,
      RegExp,
      Error,
    };
  }
}

// ============================================================================
// Sandbox Manager
// ============================================================================

/**
 * Manages sandboxed execution environments for plugins
 */
export class SandboxManager {
  private sandboxes: Map<string, Sandbox> = new Map();
  private capabilityEnforcer = new CapabilityEnforcer();
  private useIsolatedVM = false;

  constructor() {
    // Check if isolated-vm is available
    this.checkIsolatedVMAvailability();
  }

  private checkIsolatedVMAvailability(): void {
    try {
      // Attempt to require isolated-vm
      // This will fail if not installed
      require.resolve('isolated-vm');
      this.useIsolatedVM = true;
      console.log('[SandboxManager] isolated-vm available, using V8 isolates');
    } catch {
      this.useIsolatedVM = false;
      console.warn(
        '[SandboxManager] isolated-vm not available. ' +
        'Using fallback sandbox (NOT secure for production).'
      );
    }
  }

  /**
   * Create a new sandbox for a plugin
   */
  async create(options: SandboxOptions): Promise<Sandbox> {
    const { pluginId, capabilities, config } = options;
    const mergedConfig = { ...DEFAULT_SANDBOX_CONFIG, ...config };

    // Check if sandbox already exists
    if (this.sandboxes.has(pluginId)) {
      throw new SandboxError(pluginId, 'Sandbox already exists');
    }

    // Register capabilities
    this.capabilityEnforcer.register(pluginId, capabilities);

    // Create sandbox
    let sandbox: Sandbox;

    if (this.useIsolatedVM) {
      sandbox = await this.createIsolatedSandbox(pluginId, mergedConfig, capabilities);
    } else {
      sandbox = new FallbackSandbox(
        `sandbox-${pluginId}`,
        pluginId,
        mergedConfig,
        capabilities
      );
    }

    this.sandboxes.set(pluginId, sandbox);
    console.log(`[SandboxManager] Created sandbox for ${pluginId}`);

    return sandbox;
  }

  /**
   * Create a V8 isolated sandbox
   * This is a placeholder - full implementation requires isolated-vm
   */
  private async createIsolatedSandbox(
    pluginId: string,
    config: SandboxConfig,
    capabilities: PluginCapabilities
  ): Promise<Sandbox> {
    // For now, fall back to the fallback sandbox
    // Full implementation would use isolated-vm here
    console.warn(
      `[SandboxManager] V8 isolate creation not yet implemented. ` +
      `Using fallback for ${pluginId}`
    );

    return new FallbackSandbox(
      `sandbox-${pluginId}`,
      pluginId,
      config,
      capabilities
    );

    /* Full implementation would look like:
    const ivm = require('isolated-vm');

    const isolate = new ivm.Isolate({
      memoryLimit: config.memoryLimit,
    });

    const context = await isolate.createContext();
    const jail = context.global;

    // Set up sandbox environment
    await this.setupSandboxEnvironment(jail, pluginId, config, capabilities);

    return new IsolatedSandbox(pluginId, isolate, context, config);
    */
  }

  /**
   * Get a sandbox by plugin ID
   */
  get(pluginId: string): Sandbox | undefined {
    return this.sandboxes.get(pluginId);
  }

  /**
   * Dispose a sandbox
   */
  async dispose(pluginId: string): Promise<void> {
    const sandbox = this.sandboxes.get(pluginId);
    if (sandbox) {
      await sandbox.dispose();
      this.sandboxes.delete(pluginId);
      this.capabilityEnforcer.unregister(pluginId);
      console.log(`[SandboxManager] Disposed sandbox for ${pluginId}`);
    }
  }

  /**
   * Dispose all sandboxes
   */
  async disposeAll(): Promise<void> {
    const promises = Array.from(this.sandboxes.keys()).map(id => this.dispose(id));
    await Promise.all(promises);
  }

  /**
   * Get memory usage for all sandboxes
   */
  getMemoryUsage(): Map<string, MemoryUsage> {
    const usage = new Map<string, MemoryUsage>();
    for (const [pluginId, sandbox] of this.sandboxes) {
      const mem = sandbox.getMemoryUsage();
      if (mem) {
        usage.set(pluginId, mem);
      }
    }
    return usage;
  }

  /**
   * Get the capability enforcer
   */
  getCapabilityEnforcer(): CapabilityEnforcer {
    return this.capabilityEnforcer;
  }

  /**
   * Check if a plugin can perform an action
   */
  checkCapability(
    pluginId: string,
    capability: 'network' | 'filesystem' | 'env' | 'memory' | 'brain' | 'tool' | 'subprocess' | 'native',
    resource?: string,
    mode?: 'read' | 'write'
  ): boolean {
    switch (capability) {
      case 'network': {
        const [domain, portStr] = (resource ?? '').split(':');
        const port = parseInt(portStr, 10) || 443;
        return this.capabilityEnforcer.canAccessNetwork(pluginId, domain, port);
      }
      case 'filesystem':
        return this.capabilityEnforcer.canAccessFilesystem(
          pluginId,
          resource ?? '',
          mode ?? 'read'
        );
      case 'env':
        return this.capabilityEnforcer.canAccessEnv(
          pluginId,
          resource ?? '',
          mode ?? 'read'
        );
      case 'memory':
        return this.capabilityEnforcer.canAccessMemory(pluginId, mode ?? 'read');
      case 'brain':
        return this.capabilityEnforcer.canAccessBrain(pluginId, resource ?? '');
      case 'tool':
        return this.capabilityEnforcer.canAccessTool(pluginId, resource ?? '');
      case 'subprocess':
        return this.capabilityEnforcer.canSpawnSubprocess(pluginId);
      case 'native':
        return this.capabilityEnforcer.canUseNative(pluginId);
      default:
        return false;
    }
  }

  /**
   * Get statistics about sandboxes
   */
  getStats(): {
    totalSandboxes: number;
    isolatedVMAvailable: boolean;
    memoryUsage: Record<string, MemoryUsage>;
  } {
    const memoryUsage: Record<string, MemoryUsage> = {};
    for (const [pluginId, sandbox] of this.sandboxes) {
      const mem = sandbox.getMemoryUsage();
      if (mem) {
        memoryUsage[pluginId] = mem;
      }
    }

    return {
      totalSandboxes: this.sandboxes.size,
      isolatedVMAvailable: this.useIsolatedVM,
      memoryUsage,
    };
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const sandboxManager = new SandboxManager();
