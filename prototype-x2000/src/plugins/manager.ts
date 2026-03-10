/**
 * X2000 Plugin System - Plugin Manager
 *
 * Central manager for plugin lifecycle:
 * - Plugin discovery from directories
 * - Plugin loading and validation
 * - Enable/disable plugins
 * - Hot reload support
 * - Dependency management
 */

import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';
import type {
  PluginManifest,
  LoadedPlugin,
  PluginState,
  X2000Plugin,
  PluginContext,
  PluginCapabilities,
  SandboxConfig,
  Disposable,
} from './types.js';
import { LifecycleManager, createPluginHooks, lifecycleManager } from './lifecycle.js';
import { SandboxManager, sandboxManager, CapabilityEnforcer } from './sandbox.js';
import { PluginRegistry, pluginRegistry } from './registry.js';

// ============================================================================
// Types
// ============================================================================

interface PluginManagerConfig {
  pluginDirs: string[];
  enableHotReload: boolean;
  hotReloadDebounce: number;
  defaultSandboxConfig: Partial<SandboxConfig>;
  validateManifests: boolean;
  autoEnable: boolean;
}

interface PluginDiscoveryResult {
  path: string;
  manifest: PluginManifest;
  valid: boolean;
  errors?: string[];
}

interface PluginLoadResult {
  success: boolean;
  pluginId?: string;
  error?: string;
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: PluginManagerConfig = {
  pluginDirs: [
    path.join(process.cwd(), 'plugins'),
    path.join(process.env.HOME ?? '', '.x2000', 'plugins'),
  ],
  enableHotReload: process.env.NODE_ENV === 'development',
  hotReloadDebounce: 250,
  defaultSandboxConfig: {
    memoryLimit: 64,
    cpuTimeLimit: 5000,
    allowAsync: true,
  },
  validateManifests: true,
  autoEnable: false,
};

// ============================================================================
// Plugin Manager
// ============================================================================

/**
 * Manages the plugin lifecycle
 */
export class PluginManager {
  private config: PluginManagerConfig;
  private plugins: Map<string, LoadedPlugin> = new Map();
  private registrations: Map<string, Disposable[]> = new Map();
  private fileWatchers: Map<string, fs.FileHandle | null> = new Map();
  private reloadQueue: Set<string> = new Set();
  private reloadTimer: ReturnType<typeof setTimeout> | null = null;
  private lifecycle: LifecycleManager;
  private sandbox: SandboxManager;
  private registry: PluginRegistry;
  private isInitialized = false;

  constructor(config: Partial<PluginManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.lifecycle = lifecycleManager;
    this.sandbox = sandboxManager;
    this.registry = pluginRegistry;
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  /**
   * Initialize the plugin manager
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('[PluginManager] Initializing...');

    // Ensure plugin directories exist
    for (const dir of this.config.pluginDirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        console.warn(`[PluginManager] Could not create plugin directory: ${dir}`);
      }
    }

    // Discover and load plugins
    await this.discoverAll();

    this.isInitialized = true;
    console.log(`[PluginManager] Initialized with ${this.plugins.size} plugins`);
  }

  // ============================================================================
  // Plugin Discovery
  // ============================================================================

  /**
   * Discover all plugins from configured directories
   */
  async discoverAll(): Promise<PluginDiscoveryResult[]> {
    const results: PluginDiscoveryResult[] = [];

    for (const dir of this.config.pluginDirs) {
      const dirResults = await this.discoverFromDirectory(dir);
      results.push(...dirResults);
    }

    return results;
  }

  /**
   * Discover plugins from a specific directory
   */
  async discoverFromDirectory(directory: string): Promise<PluginDiscoveryResult[]> {
    const results: PluginDiscoveryResult[] = [];

    try {
      const entries = await fs.readdir(directory, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const pluginPath = path.join(directory, entry.name);
        const result = await this.discoverPlugin(pluginPath);

        if (result) {
          results.push(result);

          // Auto-load if valid
          if (result.valid && this.config.autoEnable) {
            await this.load(pluginPath);
          }
        }
      }
    } catch (error) {
      console.warn(`[PluginManager] Could not scan directory ${directory}:`, error);
    }

    return results;
  }

  /**
   * Discover a single plugin from a path
   */
  async discoverPlugin(pluginPath: string): Promise<PluginDiscoveryResult | null> {
    const manifestPath = path.join(pluginPath, 'x2000.plugin.json');

    try {
      const manifestContent = await fs.readFile(manifestPath, 'utf-8');
      const manifest = JSON.parse(manifestContent) as PluginManifest;

      // Validate manifest
      const validation = this.registry.validateManifest(manifest);

      return {
        path: pluginPath,
        manifest,
        valid: validation.valid,
        errors: validation.errors.length > 0 ? validation.errors : undefined,
      };
    } catch (error) {
      // Not a valid plugin directory
      return null;
    }
  }

  // ============================================================================
  // Plugin Loading
  // ============================================================================

  /**
   * Load a plugin from a path
   */
  async load(pluginPath: string): Promise<PluginLoadResult> {
    // Discover the plugin first
    const discovery = await this.discoverPlugin(pluginPath);

    if (!discovery) {
      return {
        success: false,
        error: `No valid plugin manifest found at ${pluginPath}`,
      };
    }

    if (!discovery.valid) {
      return {
        success: false,
        error: `Invalid plugin manifest: ${discovery.errors?.join(', ')}`,
      };
    }

    const { manifest } = discovery;
    const pluginId = manifest.id;

    // Check if already loaded
    if (this.plugins.has(pluginId)) {
      return {
        success: false,
        pluginId,
        error: `Plugin ${pluginId} is already loaded`,
      };
    }

    // Emit before_load hook
    await this.lifecycle.emit('plugin:before_load', { pluginId, manifest });

    // Create plugin entry
    const loadedPlugin: LoadedPlugin = {
      manifest,
      state: 'loading',
      path: pluginPath,
      config: {},
    };

    this.plugins.set(pluginId, loadedPlugin);

    try {
      // Create sandbox
      await this.sandbox.create({
        pluginId,
        capabilities: manifest.capabilities,
        config: {
          ...this.config.defaultSandboxConfig,
          memoryLimit: this.config.defaultSandboxConfig.memoryLimit ?? 64,
          cpuTimeLimit: this.config.defaultSandboxConfig.cpuTimeLimit ?? 5000,
          allowAsync: this.config.defaultSandboxConfig.allowAsync ?? true,
        },
      });

      loadedPlugin.sandboxId = pluginId;

      // Load the plugin module
      const mainPath = path.join(pluginPath, manifest.main);
      const pluginModule = await this.loadPluginModule(mainPath);

      if (!pluginModule) {
        throw new Error(`Failed to load plugin module from ${mainPath}`);
      }

      // Create plugin instance
      const moduleAsRecord = pluginModule as Record<string, unknown>;
      const PluginClass = moduleAsRecord.default ?? pluginModule;
      let instance: X2000Plugin;

      if (typeof PluginClass === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        instance = new (PluginClass as new () => X2000Plugin)();
      } else if (typeof PluginClass === 'object' && PluginClass !== null && 'manifest' in (PluginClass as object)) {
        instance = PluginClass as X2000Plugin;
      } else {
        throw new Error('Plugin must export a class or plugin object');
      }

      // Verify manifest matches
      if (instance.manifest && instance.manifest.id !== pluginId) {
        throw new Error(`Plugin manifest ID mismatch: ${instance.manifest.id} vs ${pluginId}`);
      }

      loadedPlugin.instance = instance;
      loadedPlugin.state = 'loaded';
      loadedPlugin.loadedAt = new Date();

      // Call onLoad if defined
      if (instance.onLoad) {
        await instance.onLoad();
      }

      // Set up hot reload watching
      if (this.config.enableHotReload) {
        this.watchPlugin(pluginId, pluginPath);
      }

      // Emit after_load hook
      await this.lifecycle.emit('plugin:after_load', { pluginId, success: true });

      console.log(`[PluginManager] Loaded plugin: ${pluginId}`);

      return { success: true, pluginId };
    } catch (error) {
      loadedPlugin.state = 'error';
      loadedPlugin.error = String(error);

      // Cleanup sandbox
      await this.sandbox.dispose(pluginId);

      // Emit after_load hook with failure
      await this.lifecycle.emit('plugin:after_load', { pluginId, success: false });

      console.error(`[PluginManager] Failed to load plugin ${pluginId}:`, error);

      return {
        success: false,
        pluginId,
        error: String(error),
      };
    }
  }

  /**
   * Load a plugin module
   */
  private async loadPluginModule(modulePath: string): Promise<unknown> {
    try {
      // Try to import the module
      const moduleUrl = `file://${modulePath}`;
      const module = await import(moduleUrl);
      return module;
    } catch (error) {
      console.error(`[PluginManager] Failed to load module ${modulePath}:`, error);
      return null;
    }
  }

  // ============================================================================
  // Plugin Activation
  // ============================================================================

  /**
   * Enable (activate) a plugin
   */
  async enable(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);

    if (!plugin) {
      console.error(`[PluginManager] Plugin not found: ${pluginId}`);
      return false;
    }

    if (plugin.state === 'active') {
      return true; // Already active
    }

    if (plugin.state !== 'loaded') {
      console.error(`[PluginManager] Cannot enable plugin in state: ${plugin.state}`);
      return false;
    }

    if (!plugin.instance) {
      console.error(`[PluginManager] No plugin instance for ${pluginId}`);
      return false;
    }

    plugin.state = 'activating';

    try {
      // Create plugin context
      const context = this.createPluginContext(pluginId);

      // Call onActivate
      if (plugin.instance.onActivate) {
        await plugin.instance.onActivate(context);
      }

      plugin.state = 'active';
      plugin.activatedAt = new Date();

      console.log(`[PluginManager] Enabled plugin: ${pluginId}`);
      return true;
    } catch (error) {
      plugin.state = 'error';
      plugin.error = String(error);
      console.error(`[PluginManager] Failed to enable plugin ${pluginId}:`, error);
      return false;
    }
  }

  /**
   * Disable (deactivate) a plugin
   */
  async disable(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);

    if (!plugin) {
      return false;
    }

    if (plugin.state !== 'active') {
      return true; // Not active
    }

    plugin.state = 'deactivating';

    try {
      // Call onDeactivate
      if (plugin.instance?.onDeactivate) {
        await plugin.instance.onDeactivate();
      }

      // Dispose all registrations
      const disposables = this.registrations.get(pluginId) ?? [];
      for (const disposable of disposables) {
        disposable.dispose();
      }
      this.registrations.delete(pluginId);

      // Remove all hooks
      this.lifecycle.removePluginHooks(pluginId);

      plugin.state = 'loaded';
      plugin.activatedAt = undefined;

      console.log(`[PluginManager] Disabled plugin: ${pluginId}`);
      return true;
    } catch (error) {
      plugin.state = 'error';
      plugin.error = String(error);
      console.error(`[PluginManager] Failed to disable plugin ${pluginId}:`, error);
      return false;
    }
  }

  // ============================================================================
  // Plugin Unloading
  // ============================================================================

  /**
   * Unload a plugin
   */
  async unload(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);

    if (!plugin) {
      return false;
    }

    // Emit before_unload hook
    await this.lifecycle.emit('plugin:before_unload', {
      pluginId,
      reason: 'unload_requested',
    });

    try {
      // Disable first if active
      if (plugin.state === 'active') {
        await this.disable(pluginId);
      }

      // Call onUnload
      if (plugin.instance?.onUnload) {
        await plugin.instance.onUnload();
      }

      // Stop watching
      this.unwatchPlugin(pluginId);

      // Dispose sandbox
      await this.sandbox.dispose(pluginId);

      // Remove from registry
      this.plugins.delete(pluginId);

      // Emit after_unload hook
      await this.lifecycle.emit('plugin:after_unload', { pluginId });

      console.log(`[PluginManager] Unloaded plugin: ${pluginId}`);
      return true;
    } catch (error) {
      console.error(`[PluginManager] Failed to unload plugin ${pluginId}:`, error);
      return false;
    }
  }

  // ============================================================================
  // Hot Reload
  // ============================================================================

  /**
   * Start watching a plugin for changes
   */
  private watchPlugin(pluginId: string, pluginPath: string): void {
    // Note: Full implementation would use chokidar or fs.watch
    // This is a placeholder that shows the interface
    console.log(`[PluginManager] Watching plugin for changes: ${pluginId}`);
    this.fileWatchers.set(pluginId, null);
  }

  /**
   * Stop watching a plugin
   */
  private unwatchPlugin(pluginId: string): void {
    const watcher = this.fileWatchers.get(pluginId);
    if (watcher) {
      // Close watcher
    }
    this.fileWatchers.delete(pluginId);
  }

  /**
   * Queue a plugin for reload
   */
  private queueReload(pluginId: string): void {
    this.reloadQueue.add(pluginId);

    if (this.reloadTimer) {
      clearTimeout(this.reloadTimer);
    }

    this.reloadTimer = setTimeout(() => {
      this.processReloadQueue();
    }, this.config.hotReloadDebounce);
  }

  /**
   * Process queued reloads
   */
  private async processReloadQueue(): Promise<void> {
    const plugins = Array.from(this.reloadQueue);
    this.reloadQueue.clear();

    for (const pluginId of plugins) {
      await this.reload(pluginId);
    }
  }

  /**
   * Reload a plugin
   */
  async reload(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);

    if (!plugin) {
      return false;
    }

    console.log(`[PluginManager] Reloading plugin: ${pluginId}`);

    const wasActive = plugin.state === 'active';
    const pluginPath = plugin.path;

    // Capture state if plugin supports serialization
    let state: unknown;
    if (plugin.instance?.serialize) {
      try {
        state = await plugin.instance.serialize();
      } catch (error) {
        console.warn(`[PluginManager] Failed to serialize state for ${pluginId}:`, error);
      }
    }

    // Unload
    await this.unload(pluginId);

    // Clear module cache (for CommonJS)
    // Note: ESM modules don't have a straightforward cache clearing mechanism

    // Reload
    const loadResult = await this.load(pluginPath);

    if (!loadResult.success) {
      console.error(`[PluginManager] Failed to reload plugin ${pluginId}`);
      return false;
    }

    // Restore state if plugin supports deserialization
    const reloadedPlugin = this.plugins.get(pluginId);
    if (reloadedPlugin?.instance?.deserialize && state) {
      try {
        await reloadedPlugin.instance.deserialize(state as import('./types.js').SerializedState);
      } catch (error) {
        console.warn(`[PluginManager] Failed to restore state for ${pluginId}:`, error);
      }
    }

    // Re-enable if was active
    if (wasActive) {
      await this.enable(pluginId);
    }

    console.log(`[PluginManager] Reloaded plugin: ${pluginId}`);
    return true;
  }

  // ============================================================================
  // Context Creation
  // ============================================================================

  /**
   * Create a plugin context
   */
  private createPluginContext(pluginId: string): PluginContext {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    const registrations: Disposable[] = [];
    this.registrations.set(pluginId, registrations);

    return {
      pluginId,
      config: Object.freeze({ ...plugin.config }),
      logger: this.createPluginLogger(pluginId),
      storage: this.createPluginStorage(pluginId),
      secrets: this.createPluginSecrets(pluginId),
      x2000: this.createX2000API(pluginId, plugin.manifest.capabilities),
      register: this.createPluginRegistrar(pluginId, registrations),
      hooks: createPluginHooks(pluginId, this.lifecycle),
      ipc: this.createPluginIPC(pluginId),
    };
  }

  /**
   * Create a scoped logger for a plugin
   */
  private createPluginLogger(pluginId: string): import('./types.js').PluginLogger {
    return {
      debug: (message, ...args) => console.debug(`[Plugin:${pluginId}]`, message, ...args),
      info: (message, ...args) => console.info(`[Plugin:${pluginId}]`, message, ...args),
      warn: (message, ...args) => console.warn(`[Plugin:${pluginId}]`, message, ...args),
      error: (message, ...args) => console.error(`[Plugin:${pluginId}]`, message, ...args),
    };
  }

  /**
   * Create plugin storage (file-based)
   */
  private createPluginStorage(pluginId: string): import('./types.js').PluginStorage {
    const storageDir = path.join(
      process.env.HOME ?? '',
      '.x2000',
      'plugin-data',
      pluginId
    );
    const storagePath = path.join(storageDir, 'storage.json');
    let cache: Record<string, unknown> | null = null;

    const loadCache = async (): Promise<Record<string, unknown>> => {
      if (cache !== null) return cache;
      try {
        const data = await fs.readFile(storagePath, 'utf-8');
        cache = JSON.parse(data) as Record<string, unknown>;
        return cache;
      } catch {
        cache = {};
        return cache;
      }
    };

    const saveCache = async (): Promise<void> => {
      if (cache === null) return;
      await fs.mkdir(storageDir, { recursive: true });
      await fs.writeFile(storagePath, JSON.stringify(cache, null, 2));
    };

    return {
      async get<T>(key: string): Promise<T | undefined> {
        const data = await loadCache();
        return data[key] as T | undefined;
      },
      async set<T>(key: string, value: T): Promise<void> {
        const data = await loadCache();
        data[key] = value;
        await saveCache();
      },
      async delete(key: string): Promise<void> {
        const data = await loadCache();
        delete data[key];
        await saveCache();
      },
      async list(): Promise<string[]> {
        const data = await loadCache();
        return Object.keys(data);
      },
      async clear(): Promise<void> {
        cache = {};
        await saveCache();
      },
      async export(): Promise<Record<string, unknown>> {
        return { ...(await loadCache()) };
      },
      async import(data: Record<string, unknown>): Promise<void> {
        cache = { ...data };
        await saveCache();
      },
    };
  }

  /**
   * Create plugin secrets manager
   */
  private createPluginSecrets(pluginId: string): import('./types.js').PluginSecrets {
    const secretsDir = path.join(
      process.env.HOME ?? '',
      '.x2000',
      'plugin-secrets',
      pluginId
    );
    const secretsPath = path.join(secretsDir, 'secrets.json');

    return {
      async get(key: string): Promise<string | undefined> {
        try {
          const data = await fs.readFile(secretsPath, 'utf-8');
          const secrets = JSON.parse(data);
          return secrets[key];
        } catch {
          return undefined;
        }
      },
      async set(key: string, value: string): Promise<void> {
        await fs.mkdir(secretsDir, { recursive: true });
        let secrets: Record<string, string> = {};
        try {
          const data = await fs.readFile(secretsPath, 'utf-8');
          secrets = JSON.parse(data);
        } catch {
          // File doesn't exist
        }
        secrets[key] = value;
        await fs.writeFile(secretsPath, JSON.stringify(secrets, null, 2), { mode: 0o600 });
      },
      async delete(key: string): Promise<void> {
        try {
          const data = await fs.readFile(secretsPath, 'utf-8');
          const secrets = JSON.parse(data);
          delete secrets[key];
          await fs.writeFile(secretsPath, JSON.stringify(secrets, null, 2), { mode: 0o600 });
        } catch {
          // Ignore if file doesn't exist
        }
      },
      async has(key: string): Promise<boolean> {
        try {
          const data = await fs.readFile(secretsPath, 'utf-8');
          const secrets = JSON.parse(data);
          return key in secrets;
        } catch {
          return false;
        }
      },
    };
  }

  /**
   * Create X2000 API access (capability-gated)
   */
  private createX2000API(
    pluginId: string,
    capabilities: PluginCapabilities
  ): import('./types.js').X2000API {
    // Placeholder implementations - full implementation would integrate with X2000 systems
    return {
      memory: capabilities.x2000?.memory !== 'none' ? {
        async queryPatterns(query: string, limit?: number) {
          return []; // Would integrate with memoryManager
        },
        async queryLearnings(filter: { tags?: string[]; limit?: number }) {
          return [];
        },
        ...(capabilities.x2000?.memory === 'write' ? {
          async storePattern(pattern: Omit<import('../types/index.js').Pattern, 'id' | 'createdAt' | 'lastUsedAt'>) {
            return {} as import('../types/index.js').Pattern;
          },
          async storeLearning(learning: Omit<import('../types/index.js').Learning, 'id' | 'createdAt'>) {
            return {} as import('../types/index.js').Learning;
          },
        } : {}),
      } : undefined,

      brains: capabilities.x2000?.brains ? {
        async list() {
          return [];
        },
        async execute(brainId: string, task: string, options?: import('./types.js').BrainExecuteOptions) {
          return { success: false, error: 'Not implemented', duration: 0 };
        },
        async isAvailable(brainId: string) {
          return false;
        },
      } : undefined,

      tools: capabilities.x2000?.tools ? {
        async list() {
          return [];
        },
        async execute<T>(toolId: string, params: unknown) {
          return { success: false, error: 'Not implemented', duration: 0 } as import('./types.js').ToolResult<T>;
        },
        async isAvailable(toolId: string) {
          return false;
        },
      } : undefined,

      sessions: {
        async list() {
          return [];
        },
        async get(sessionId: string) {
          return undefined;
        },
      },

      events: {
        on(eventType: string, handler: (event: { type: string; data: unknown }) => void) {
          // Would integrate with event system
          return { dispose: () => {} };
        },
        emit(eventType: string, data: unknown) {
          // Would integrate with event system
        },
      },
    };
  }

  /**
   * Create plugin registrar
   */
  private createPluginRegistrar(
    pluginId: string,
    registrations: Disposable[]
  ): import('./types.js').PluginRegistrar {
    return {
      tool(definition: import('./types.js').ToolDefinition) {
        // Would integrate with tool system
        console.log(`[PluginManager] Plugin ${pluginId} registered tool: ${definition.id}`);
        const disposable = { dispose: () => {} };
        registrations.push(disposable);
        return disposable;
      },
      brain(definition: import('./types.js').BrainDefinition) {
        console.log(`[PluginManager] Plugin ${pluginId} registered brain: ${definition.id}`);
        const disposable = { dispose: () => {} };
        registrations.push(disposable);
        return disposable;
      },
      channel(definition: import('./types.js').ChannelDefinition) {
        console.log(`[PluginManager] Plugin ${pluginId} registered channel: ${definition.id}`);
        const disposable = { dispose: () => {} };
        registrations.push(disposable);
        return disposable;
      },
      guardrail(definition: import('./types.js').GuardrailDefinition) {
        console.log(`[PluginManager] Plugin ${pluginId} registered guardrail: ${definition.id}`);
        const disposable = { dispose: () => {} };
        registrations.push(disposable);
        return disposable;
      },
      command(definition: import('./types.js').CommandDefinition) {
        console.log(`[PluginManager] Plugin ${pluginId} registered command: ${definition.id}`);
        const disposable = { dispose: () => {} };
        registrations.push(disposable);
        return disposable;
      },
    };
  }

  /**
   * Create plugin IPC
   */
  private createPluginIPC(pluginId: string): import('./types.js').PluginIPC {
    return {
      async send(targetPluginId: string, type: string, payload: unknown) {
        // Would send message to target plugin
      },
      async request<T>(targetPluginId: string, type: string, payload: unknown, timeout?: number) {
        throw new Error('IPC not implemented');
      },
      onMessage(type: string, handler: import('./types.js').IPCHandler) {
        return { dispose: () => {} };
      },
      async broadcast(type: string, payload: unknown) {
        // Would broadcast to all plugins
      },
    };
  }

  // ============================================================================
  // Plugin Access
  // ============================================================================

  /**
   * Get a loaded plugin
   */
  getPlugin(pluginId: string): LoadedPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Get all loaded plugins
   */
  getAllPlugins(): LoadedPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugins by state
   */
  getPluginsByState(state: PluginState): LoadedPlugin[] {
    return this.getAllPlugins().filter(p => p.state === state);
  }

  /**
   * Check if a plugin is loaded
   */
  isLoaded(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  /**
   * Check if a plugin is active
   */
  isActive(pluginId: string): boolean {
    return this.plugins.get(pluginId)?.state === 'active';
  }

  // ============================================================================
  // Shutdown
  // ============================================================================

  /**
   * Shutdown all plugins
   */
  async shutdown(): Promise<void> {
    console.log('[PluginManager] Shutting down...');

    // Disable all active plugins
    const activePlugins = this.getPluginsByState('active');
    for (const plugin of activePlugins) {
      await this.disable(plugin.manifest.id);
    }

    // Unload all plugins
    const allPlugins = Array.from(this.plugins.keys());
    for (const pluginId of allPlugins) {
      await this.unload(pluginId);
    }

    // Dispose all sandboxes
    await this.sandbox.disposeAll();

    // Clear reload timer
    if (this.reloadTimer) {
      clearTimeout(this.reloadTimer);
    }

    console.log('[PluginManager] Shutdown complete');
  }

  // ============================================================================
  // Statistics
  // ============================================================================

  /**
   * Get plugin manager statistics
   */
  getStats(): {
    totalPlugins: number;
    pluginsByState: Record<PluginState, number>;
    sandboxStats: ReturnType<typeof sandboxManager.getStats>;
    lifecycleStats: ReturnType<typeof lifecycleManager.getStats>;
  } {
    const pluginsByState: Record<PluginState, number> = {
      unloaded: 0,
      loading: 0,
      loaded: 0,
      activating: 0,
      active: 0,
      deactivating: 0,
      error: 0,
    };

    for (const plugin of this.plugins.values()) {
      pluginsByState[plugin.state]++;
    }

    return {
      totalPlugins: this.plugins.size,
      pluginsByState,
      sandboxStats: this.sandbox.getStats(),
      lifecycleStats: this.lifecycle.getStats(),
    };
  }
}

// ============================================================================
// Factory & Singleton
// ============================================================================

/**
 * Create a new plugin manager
 */
export function createPluginManager(
  config?: Partial<PluginManagerConfig>
): PluginManager {
  return new PluginManager(config);
}

/**
 * Default plugin manager instance
 */
export const pluginManager = new PluginManager();
