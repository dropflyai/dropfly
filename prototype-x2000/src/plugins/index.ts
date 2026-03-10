/**
 * X2000 Plugin System
 *
 * A superior plugin/extension architecture that exceeds OpenClaw's capabilities.
 *
 * Features:
 * - Hot reloading without system restart
 * - V8 Isolate sandboxing for security
 * - Type-safe plugin APIs with full TypeScript support
 * - Dependency management with semver resolution
 * - Plugin marketplace for discovery and distribution
 * - Extensibility points for tools, brains, channels, and guardrails
 */

// ============================================================================
// Type Exports
// ============================================================================

export type {
  // Plugin manifest types
  PluginManifest,
  PluginAuthor,
  PluginEngines,
  PluginProvides,
  PluginProvider,
  PluginToolProvider,
  PluginMarketplace,

  // Capability types
  PluginCapabilities,
  CapabilityNetwork,
  CapabilityFilesystem,
  CapabilityEnv,
  CapabilitySystem,
  CapabilityX2000,

  // Plugin state types
  PluginState,
  LoadedPlugin,
  X2000Plugin,
  SerializedState,

  // Plugin context types
  PluginContext,
  PluginLogger,
  PluginStorage,
  PluginSecrets,

  // X2000 API types
  X2000API,
  MemoryAPI,
  BrainsAPI,
  BrainInfo,
  BrainExecuteOptions,
  BrainResult,
  ToolsAPI,
  ToolInfo,
  ToolResult,
  SessionsAPI,
  SessionInfo,
  EventsAPI,
  EventHandler,

  // Registration types
  PluginRegistrar,
  Disposable,
  TypeBoxSchema,
  ToolDefinition,
  ToolExecutionContext,
  BrainDefinition,
  ChannelDefinition,
  ChannelConnection,
  GuardrailDefinition,
  GuardrailAction,
  GuardrailCheckResult,
  CommandDefinition,

  // Lifecycle hook types
  X2000Hook,
  HookPayloads,
  HookHandler,
  InterceptHandler,
  HookOptions,
  PluginHooks,

  // IPC types
  PluginIPC,
  IPCMessage,
  IPCHandler,

  // Sandbox types
  SandboxConfig,
  MemoryUsage,
  Sandbox,

  // Registry types
  PluginSearchQuery,
  PluginSearchResult,
  PluginSummary,
  PluginStats,
  PluginReview,
  ReviewInput,
  PublishResult,
} from './types.js';

// ============================================================================
// Lifecycle Exports
// ============================================================================

export {
  LifecycleManager,
  lifecycleManager,
  createPluginHooks,
} from './lifecycle.js';

// ============================================================================
// Sandbox Exports
// ============================================================================

export {
  SandboxManager,
  sandboxManager,
  CapabilityEnforcer,
  SandboxError,
  SandboxMemoryError,
  SandboxTimeoutError,
  SandboxPermissionError,
} from './sandbox.js';

// ============================================================================
// Registry Exports
// ============================================================================

export {
  PluginRegistry,
  pluginRegistry,
  createPluginRegistry,
  RegistryError,
} from './registry.js';

// ============================================================================
// Manager Exports
// ============================================================================

export {
  PluginManager,
  pluginManager,
  createPluginManager,
} from './manager.js';

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Initialize the plugin system
 */
export async function initializePluginSystem(): Promise<void> {
  const { pluginManager } = await import('./manager.js');
  await pluginManager.initialize();
}

/**
 * Shutdown the plugin system
 */
export async function shutdownPluginSystem(): Promise<void> {
  const { pluginManager } = await import('./manager.js');
  await pluginManager.shutdown();
}

/**
 * Get plugin system status
 */
export function getPluginSystemStatus(): {
  initialized: boolean;
  stats: ReturnType<import('./manager.js').PluginManager['getStats']>;
} {
  // Can't directly access the instance in static context
  // This would be called after initialization
  return {
    initialized: false,
    stats: {
      totalPlugins: 0,
      pluginsByState: {
        unloaded: 0,
        loading: 0,
        loaded: 0,
        activating: 0,
        active: 0,
        deactivating: 0,
        error: 0,
      },
      sandboxStats: {
        totalSandboxes: 0,
        isolatedVMAvailable: false,
        memoryUsage: {},
      },
      lifecycleStats: {
        totalHooks: 0,
        hooksByType: {},
        recentExecutions: 0,
        errorRate: 0,
      },
    },
  };
}

// ============================================================================
// Plugin Development Helpers
// ============================================================================

/**
 * Create a basic plugin manifest
 */
export function createPluginManifest(
  options: {
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    main?: string;
  }
): import('./types.js').PluginManifest {
  return {
    id: options.id,
    name: options.name,
    version: options.version,
    description: options.description,
    author: {
      name: options.author,
    },
    license: 'MIT',
    main: options.main ?? 'dist/index.js',
    engines: {
      x2000: '>=1.0.0',
    },
    provides: {},
    capabilities: {},
  };
}

/**
 * Create a plugin class factory
 */
export function definePlugin<T extends import('./types.js').X2000Plugin>(
  implementation: Omit<T, 'manifest'> & { manifest: import('./types.js').PluginManifest }
): T {
  return implementation as T;
}

// ============================================================================
// Version Information
// ============================================================================

export const PLUGIN_SYSTEM_VERSION = '1.0.0';
export const MIN_X2000_VERSION = '1.0.0';
export const MANIFEST_SCHEMA_VERSION = 'https://x2000.dropfly.io/schemas/plugin-manifest-v1.json';
