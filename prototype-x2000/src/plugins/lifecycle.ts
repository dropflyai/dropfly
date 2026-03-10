/**
 * X2000 Plugin System - Lifecycle Hooks
 *
 * Manages plugin lifecycle events and hook registration.
 * Provides 32 hooks organized by layer for comprehensive extensibility.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  X2000Hook,
  HookPayloads,
  HookHandler,
  InterceptHandler,
  HookOptions,
  Disposable,
} from './types.js';

// ============================================================================
// Types
// ============================================================================

interface RegisteredHook<T> {
  id: string;
  pluginId: string;
  handler: HookHandler<T> | InterceptHandler<T>;
  options: Required<HookOptions>;
  type: 'on' | 'once' | 'intercept';
}

interface HookExecutionResult<T> {
  success: boolean;
  payload: T;
  errors: Array<{ pluginId: string; error: Error }>;
  duration: number;
}

// ============================================================================
// Default Hook Options
// ============================================================================

const DEFAULT_HOOK_OPTIONS: Required<HookOptions> = {
  priority: 100,
  timeout: 5000,
  stopOnError: false,
};

// ============================================================================
// Lifecycle Manager
// ============================================================================

/**
 * Manages lifecycle hooks for the plugin system
 */
export class LifecycleManager {
  private hooks: Map<X2000Hook, RegisteredHook<unknown>[]> = new Map();
  private hookHistory: Array<{
    hook: X2000Hook;
    timestamp: Date;
    pluginCount: number;
    duration: number;
    errors: number;
  }> = [];

  constructor() {
    // Initialize all hook arrays
    const allHooks: X2000Hook[] = [
      'system:startup', 'system:shutdown', 'system:config_changed', 'system:health_check',
      'plugin:before_load', 'plugin:after_load', 'plugin:before_unload', 'plugin:after_unload',
      'session:created', 'session:resumed', 'session:paused', 'session:ended',
      'session:context_updated', 'session:state_changed',
      'brain:before_spawn', 'brain:after_spawn', 'brain:before_execute', 'brain:after_execute',
      'brain:collaboration_start', 'brain:collaboration_end',
      'tool:before_call', 'tool:after_call', 'tool:error', 'tool:timeout',
      'memory:pattern_stored', 'memory:learning_stored', 'memory:query_executed', 'memory:skill_shared',
      'channel:message_received', 'channel:message_sending', 'channel:message_sent', 'channel:error',
    ];

    for (const hook of allHooks) {
      this.hooks.set(hook, []);
    }
  }

  // ============================================================================
  // Hook Registration
  // ============================================================================

  /**
   * Register a hook handler
   */
  on<H extends X2000Hook>(
    pluginId: string,
    hook: H,
    handler: HookHandler<HookPayloads[H]>,
    options: HookOptions = {}
  ): Disposable {
    return this.registerHook(pluginId, hook, handler, 'on', options);
  }

  /**
   * Register a one-time hook handler
   */
  once<H extends X2000Hook>(
    pluginId: string,
    hook: H,
    handler: HookHandler<HookPayloads[H]>,
    options: HookOptions = {}
  ): Disposable {
    return this.registerHook(pluginId, hook, handler, 'once', options);
  }

  /**
   * Register an intercepting hook handler that can modify the payload
   */
  intercept<H extends X2000Hook>(
    pluginId: string,
    hook: H,
    handler: InterceptHandler<HookPayloads[H]>,
    options: HookOptions = {}
  ): Disposable {
    return this.registerHook(pluginId, hook, handler, 'intercept', options);
  }

  /**
   * Internal hook registration
   */
  private registerHook<H extends X2000Hook>(
    pluginId: string,
    hook: H,
    handler: HookHandler<HookPayloads[H]> | InterceptHandler<HookPayloads[H]>,
    type: 'on' | 'once' | 'intercept',
    options: HookOptions
  ): Disposable {
    const hookArray = this.hooks.get(hook);
    if (!hookArray) {
      throw new Error(`Unknown hook: ${hook}`);
    }

    const registration: RegisteredHook<HookPayloads[H]> = {
      id: uuidv4(),
      pluginId,
      handler,
      options: { ...DEFAULT_HOOK_OPTIONS, ...options },
      type,
    };

    hookArray.push(registration as RegisteredHook<unknown>);

    // Re-sort by priority (lower runs first)
    hookArray.sort((a, b) => a.options.priority - b.options.priority);

    console.log(`[Lifecycle] Registered ${type} hook for ${hook} from plugin ${pluginId}`);

    return {
      dispose: () => {
        const index = hookArray.findIndex(h => h.id === registration.id);
        if (index !== -1) {
          hookArray.splice(index, 1);
          console.log(`[Lifecycle] Disposed hook ${registration.id} for ${hook}`);
        }
      },
    };
  }

  // ============================================================================
  // Hook Execution
  // ============================================================================

  /**
   * Execute all handlers for a hook
   */
  async emit<H extends X2000Hook>(
    hook: H,
    payload: HookPayloads[H]
  ): Promise<HookExecutionResult<HookPayloads[H]>> {
    const startTime = Date.now();
    const hookArray = this.hooks.get(hook) as RegisteredHook<HookPayloads[H]>[] | undefined;

    if (!hookArray || hookArray.length === 0) {
      return {
        success: true,
        payload,
        errors: [],
        duration: Date.now() - startTime,
      };
    }

    let currentPayload = payload;
    const errors: Array<{ pluginId: string; error: Error }> = [];
    const toRemove: string[] = [];

    for (const registration of hookArray) {
      try {
        const result = await this.executeHandler(
          registration,
          currentPayload
        );

        // If intercept handler, use the returned payload
        if (registration.type === 'intercept' && result !== undefined) {
          currentPayload = result as HookPayloads[H];
        }

        // Mark one-time handlers for removal
        if (registration.type === 'once') {
          toRemove.push(registration.id);
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        errors.push({ pluginId: registration.pluginId, error: err });

        console.error(
          `[Lifecycle] Hook ${hook} error from plugin ${registration.pluginId}:`,
          err.message
        );

        // Stop chain if configured
        if (registration.options.stopOnError) {
          break;
        }
      }
    }

    // Remove one-time handlers
    for (const id of toRemove) {
      const index = hookArray.findIndex(h => h.id === id);
      if (index !== -1) {
        hookArray.splice(index, 1);
      }
    }

    const duration = Date.now() - startTime;

    // Record to history
    this.hookHistory.push({
      hook,
      timestamp: new Date(),
      pluginCount: hookArray.length,
      duration,
      errors: errors.length,
    });

    // Trim history
    if (this.hookHistory.length > 1000) {
      this.hookHistory = this.hookHistory.slice(-500);
    }

    return {
      success: errors.length === 0,
      payload: currentPayload,
      errors,
      duration,
    };
  }

  /**
   * Execute a single handler with timeout
   */
  private async executeHandler<T>(
    registration: RegisteredHook<T>,
    payload: T
  ): Promise<T | void> {
    const { handler, options } = registration;

    return new Promise<T | void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Hook handler timed out after ${options.timeout}ms`));
      }, options.timeout);

      Promise.resolve(handler(payload))
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result as T | void);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  // ============================================================================
  // Plugin Management
  // ============================================================================

  /**
   * Remove all hooks registered by a plugin
   */
  removePluginHooks(pluginId: string): number {
    let removed = 0;

    for (const [hook, handlers] of this.hooks) {
      const initialLength = handlers.length;
      const filtered = handlers.filter(h => h.pluginId !== pluginId);
      this.hooks.set(hook, filtered);
      removed += initialLength - filtered.length;
    }

    console.log(`[Lifecycle] Removed ${removed} hooks for plugin ${pluginId}`);
    return removed;
  }

  /**
   * Get all hooks registered by a plugin
   */
  getPluginHooks(pluginId: string): Array<{ hook: X2000Hook; type: string }> {
    const result: Array<{ hook: X2000Hook; type: string }> = [];

    for (const [hook, handlers] of this.hooks) {
      for (const handler of handlers) {
        if (handler.pluginId === pluginId) {
          result.push({ hook, type: handler.type });
        }
      }
    }

    return result;
  }

  // ============================================================================
  // Statistics & Monitoring
  // ============================================================================

  /**
   * Get hook statistics
   */
  getStats(): {
    totalHooks: number;
    hooksByType: Record<string, number>;
    recentExecutions: number;
    errorRate: number;
  } {
    let totalHooks = 0;
    const hooksByType: Record<string, number> = {};

    for (const [hook, handlers] of this.hooks) {
      totalHooks += handlers.length;
      const [layer] = hook.split(':');
      hooksByType[layer] = (hooksByType[layer] ?? 0) + handlers.length;
    }

    const recentExecutions = this.hookHistory.filter(
      h => Date.now() - h.timestamp.getTime() < 60000
    ).length;

    const totalExecutions = this.hookHistory.length;
    const totalErrors = this.hookHistory.reduce((sum, h) => sum + h.errors, 0);
    const errorRate = totalExecutions > 0 ? totalErrors / totalExecutions : 0;

    return {
      totalHooks,
      hooksByType,
      recentExecutions,
      errorRate,
    };
  }

  /**
   * Get recent hook execution history
   */
  getHistory(limit: number = 50): typeof this.hookHistory {
    return this.hookHistory.slice(-limit);
  }

  /**
   * Get handlers for a specific hook
   */
  getHandlers(hook: X2000Hook): Array<{
    pluginId: string;
    type: string;
    priority: number;
  }> {
    const handlers = this.hooks.get(hook) ?? [];
    return handlers.map(h => ({
      pluginId: h.pluginId,
      type: h.type,
      priority: h.options.priority,
    }));
  }

  // ============================================================================
  // Lifecycle Events (System-Level)
  // ============================================================================

  /**
   * Emit system startup event
   */
  async emitStartup(config: Record<string, unknown>): Promise<void> {
    await this.emit('system:startup', { config });
  }

  /**
   * Emit system shutdown event
   */
  async emitShutdown(reason: string): Promise<void> {
    await this.emit('system:shutdown', { reason });
  }

  /**
   * Emit config change event
   */
  async emitConfigChange(
    oldConfig: Record<string, unknown>,
    newConfig: Record<string, unknown>
  ): Promise<void> {
    await this.emit('system:config_changed', { oldConfig, newConfig });
  }

  /**
   * Emit health check event
   */
  async emitHealthCheck(status: 'healthy' | 'degraded' | 'unhealthy'): Promise<void> {
    await this.emit('system:health_check', { status });
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a PluginHooks interface for a specific plugin
 */
export function createPluginHooks(
  pluginId: string,
  lifecycleManager: LifecycleManager
): import('./types.js').PluginHooks {
  return {
    on<H extends X2000Hook>(
      hook: H,
      handler: HookHandler<HookPayloads[H]>,
      options?: HookOptions
    ): Disposable {
      return lifecycleManager.on(pluginId, hook, handler, options);
    },

    once<H extends X2000Hook>(
      hook: H,
      handler: HookHandler<HookPayloads[H]>,
      options?: HookOptions
    ): Disposable {
      return lifecycleManager.once(pluginId, hook, handler, options);
    },

    intercept<H extends X2000Hook>(
      hook: H,
      handler: InterceptHandler<HookPayloads[H]>,
      options?: HookOptions
    ): Disposable {
      return lifecycleManager.intercept(pluginId, hook, handler, options);
    },
  };
}

// ============================================================================
// Singleton Export
// ============================================================================

export const lifecycleManager = new LifecycleManager();
