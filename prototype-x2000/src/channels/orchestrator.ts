/**
 * X2000 Channel System - Channel Orchestrator
 *
 * Central coordinator for all channel adapters.
 * Handles registration, health monitoring, routing, load balancing, and failover.
 */

import { randomUUID } from 'crypto';
import type {
  PlatformType,
  ChannelAdapter,
  ChannelConfig,
  ChannelStatus,
  ChannelHealth,
  ChannelMetrics,
  UnifiedMessage,
  UnifiedResponse,
  UnifiedRecipient,
  SendResult,
  HealthCheckResult,
} from './types.js';
import { messageBus } from './message-bus.js';
import { rateLimitManager } from './rate-limiter.js';
import { authManager } from './auth-manager.js';

// ============================================================================
// Orchestrator Configuration
// ============================================================================

/**
 * Orchestrator configuration
 */
interface OrchestratorConfig {
  /** Health check interval in ms (default: 30000) */
  healthCheckInterval: number;
  /** Health score threshold for degraded status (default: 50) */
  degradedThreshold: number;
  /** Health score threshold for unhealthy status (default: 20) */
  unhealthyThreshold: number;
  /** Enable automatic failover (default: true) */
  enableFailover: boolean;
  /** Enable metrics collection (default: true) */
  enableMetrics: boolean;
}

const DEFAULT_CONFIG: OrchestratorConfig = {
  healthCheckInterval: 30000,
  degradedThreshold: 50,
  unhealthyThreshold: 20,
  enableFailover: true,
  enableMetrics: true,
};

// ============================================================================
// Channel Orchestrator
// ============================================================================

/**
 * Central coordinator for all channel adapters
 */
export class ChannelOrchestrator {
  // Registered adapters
  private adapters: Map<PlatformType, ChannelAdapter> = new Map();
  private configs: Map<PlatformType, ChannelConfig> = new Map();

  // Health tracking
  private health: Map<PlatformType, ChannelHealth> = new Map();
  private healthCheckTimer: NodeJS.Timeout | null = null;

  // Metrics
  private metrics: Map<PlatformType, ChannelMetrics> = new Map();

  // Message receivers
  private receiveAbortControllers: Map<PlatformType, AbortController> = new Map();

  // Configuration
  private config: OrchestratorConfig;

  // Singleton instance
  private static instance: ChannelOrchestrator;

  constructor(config: Partial<OrchestratorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ChannelOrchestrator {
    if (!ChannelOrchestrator.instance) {
      ChannelOrchestrator.instance = new ChannelOrchestrator();
    }
    return ChannelOrchestrator.instance;
  }

  // ============================================================================
  // Adapter Registration
  // ============================================================================

  /**
   * Register a channel adapter
   */
  async registerAdapter(
    adapter: ChannelAdapter,
    config: ChannelConfig
  ): Promise<void> {
    const platform = adapter.platform;

    // Check if already registered
    if (this.adapters.has(platform)) {
      console.warn(`[Orchestrator] Adapter ${platform} already registered, replacing`);
      await this.unregisterAdapter(platform);
    }

    // Store adapter and config
    this.adapters.set(platform, adapter);
    this.configs.set(platform, config);

    // Initialize health tracking
    this.health.set(platform, {
      platform,
      status: 'disconnected',
      healthScore: 100,
      consecutiveFailures: 0,
      circuitState: 'closed',
    });

    // Initialize metrics
    this.metrics.set(platform, {
      platform,
      messagesReceived: 0,
      messagesSent: 0,
      failedSends: 0,
      avgLatency: 0,
      rateLimitHits: 0,
      errors: 0,
      lastUpdated: new Date(),
    });

    // Register with message bus
    messageBus.registerAdapter(adapter);

    console.log(`[Orchestrator] Registered adapter: ${platform}`);
  }

  /**
   * Unregister a channel adapter
   */
  async unregisterAdapter(platform: PlatformType): Promise<void> {
    const adapter = this.adapters.get(platform);
    if (!adapter) {
      return;
    }

    // Stop message receiving
    this.stopReceiving(platform);

    // Shutdown adapter
    try {
      await adapter.shutdown();
    } catch (error) {
      console.error(`[Orchestrator] Error shutting down ${platform}:`, error);
    }

    // Clean up
    this.adapters.delete(platform);
    this.configs.delete(platform);
    this.health.delete(platform);
    this.metrics.delete(platform);

    // Unregister from message bus
    messageBus.unregisterAdapter(platform);

    console.log(`[Orchestrator] Unregistered adapter: ${platform}`);
  }

  /**
   * Get registered adapter
   */
  getAdapter(platform: PlatformType): ChannelAdapter | undefined {
    return this.adapters.get(platform);
  }

  /**
   * Get all registered platforms
   */
  getRegisteredPlatforms(): PlatformType[] {
    return Array.from(this.adapters.keys());
  }

  // ============================================================================
  // Adapter Lifecycle
  // ============================================================================

  /**
   * Initialize a channel adapter
   */
  async initializeAdapter(platform: PlatformType): Promise<void> {
    const adapter = this.adapters.get(platform);
    const config = this.configs.get(platform);

    if (!adapter || !config) {
      throw new Error(`Adapter ${platform} not registered`);
    }

    // Update health status
    this.updateHealth(platform, { status: 'connecting' });

    try {
      // Initialize adapter
      await adapter.initialize(config);

      // Update health status
      this.updateHealth(platform, {
        status: 'connected',
        healthScore: 100,
        lastHeartbeat: new Date(),
      });

      // Start receiving messages
      this.startReceiving(platform);

      // Emit connected event
      await messageBus.emitConnected(platform);

      console.log(`[Orchestrator] Initialized adapter: ${platform}`);
    } catch (error) {
      this.updateHealth(platform, {
        status: 'error',
        healthScore: 0,
      });

      const errorMessage = error instanceof Error ? error.message : String(error);
      await messageBus.emitError(platform, errorMessage);

      throw error;
    }
  }

  /**
   * Initialize all registered adapters
   */
  async initializeAll(): Promise<void> {
    // Load auth credentials first
    await authManager.loadCredentials();

    // Initialize each adapter
    const results = await Promise.allSettled(
      Array.from(this.adapters.keys()).map((platform) =>
        this.initializeAdapter(platform)
      )
    );

    // Log results
    for (let i = 0; i < results.length; i++) {
      const platform = Array.from(this.adapters.keys())[i];
      const result = results[i];

      if (result.status === 'rejected') {
        console.error(`[Orchestrator] Failed to initialize ${platform}:`, result.reason);
      }
    }

    // Start health monitoring
    this.startHealthMonitoring();

    // Start message bus processing
    messageBus.start();
  }

  /**
   * Shutdown a channel adapter
   */
  async shutdownAdapter(platform: PlatformType): Promise<void> {
    const adapter = this.adapters.get(platform);
    if (!adapter) {
      return;
    }

    // Stop receiving
    this.stopReceiving(platform);

    // Shutdown adapter
    await adapter.shutdown();

    // Update health
    this.updateHealth(platform, { status: 'disconnected' });

    // Emit disconnected event
    await messageBus.emitDisconnected(platform);

    console.log(`[Orchestrator] Shutdown adapter: ${platform}`);
  }

  /**
   * Shutdown all adapters
   */
  async shutdownAll(): Promise<void> {
    // Stop health monitoring
    this.stopHealthMonitoring();

    // Stop message bus
    messageBus.stop();

    // Shutdown each adapter
    await Promise.all(
      Array.from(this.adapters.keys()).map((platform) =>
        this.shutdownAdapter(platform)
      )
    );

    // Shutdown auth manager
    authManager.shutdown();

    console.log('[Orchestrator] All adapters shutdown');
  }

  // ============================================================================
  // Message Receiving
  // ============================================================================

  /**
   * Start receiving messages from an adapter
   */
  private startReceiving(platform: PlatformType): void {
    const adapter = this.adapters.get(platform);
    if (!adapter) {
      return;
    }

    // Create abort controller for this receiver
    const abortController = new AbortController();
    this.receiveAbortControllers.set(platform, abortController);

    // Start async message receiver
    this.receiveMessages(platform, adapter, abortController.signal).catch(
      (error) => {
        if (!abortController.signal.aborted) {
          console.error(`[Orchestrator] Message receiver error for ${platform}:`, error);
          this.handleReceiverError(platform, error);
        }
      }
    );
  }

  /**
   * Stop receiving messages from an adapter
   */
  private stopReceiving(platform: PlatformType): void {
    const abortController = this.receiveAbortControllers.get(platform);
    if (abortController) {
      abortController.abort();
      this.receiveAbortControllers.delete(platform);
    }
  }

  /**
   * Receive messages from an adapter
   */
  private async receiveMessages(
    platform: PlatformType,
    adapter: ChannelAdapter,
    signal: AbortSignal
  ): Promise<void> {
    try {
      for await (const message of adapter.receiveMessages()) {
        if (signal.aborted) {
          break;
        }

        // Update metrics
        this.incrementMetric(platform, 'messagesReceived');

        // Publish to message bus
        await messageBus.publishInbound(message);
      }
    } catch (error) {
      if (!signal.aborted) {
        throw error;
      }
    }
  }

  /**
   * Handle receiver error
   */
  private handleReceiverError(platform: PlatformType, error: unknown): void {
    this.updateHealth(platform, {
      status: 'error',
      consecutiveFailures: (this.health.get(platform)?.consecutiveFailures || 0) + 1,
    });

    // Attempt reconnect if enabled
    if (this.config.enableFailover) {
      this.attemptReconnect(platform).catch((err) => {
        console.error(`[Orchestrator] Reconnect failed for ${platform}:`, err);
      });
    }
  }

  // ============================================================================
  // Message Routing
  // ============================================================================

  /**
   * Route a message to the appropriate channel
   */
  async routeMessage(
    message: UnifiedResponse,
    recipient: UnifiedRecipient,
    platform: PlatformType
  ): Promise<SendResult> {
    const adapter = this.adapters.get(platform);
    if (!adapter) {
      return { success: false, error: `No adapter for platform: ${platform}` };
    }

    // Check health
    const health = this.health.get(platform);
    if (health && health.circuitState === 'open') {
      return { success: false, error: 'Circuit breaker open' };
    }

    // Check rate limit
    if (!rateLimitManager.acquire(platform)) {
      this.incrementMetric(platform, 'rateLimitHits');
      const waitTime = rateLimitManager.getWaitTime(platform);
      return {
        success: false,
        error: 'Rate limited',
        retryAfter: Math.ceil(waitTime / 1000),
      };
    }

    const startTime = Date.now();

    try {
      const result = await adapter.sendMessage(message, recipient);
      const latency = Date.now() - startTime;

      if (result.success) {
        this.incrementMetric(platform, 'messagesSent');
        this.updateLatency(platform, latency);
        this.updateHealth(platform, {
          healthScore: Math.min(100, (health?.healthScore || 0) + 5),
          consecutiveFailures: 0,
          lastHeartbeat: new Date(),
        });
        rateLimitManager.resetBackoff(platform);
      } else {
        this.incrementMetric(platform, 'failedSends');
        this.handleSendFailure(platform, result.retryAfter);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.incrementMetric(platform, 'failedSends');
      this.incrementMetric(platform, 'errors');
      this.handleSendFailure(platform);

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Handle send failure
   */
  private handleSendFailure(platform: PlatformType, retryAfter?: number): void {
    const health = this.health.get(platform);
    const failures = (health?.consecutiveFailures || 0) + 1;

    this.updateHealth(platform, {
      healthScore: Math.max(0, (health?.healthScore || 100) - 10),
      consecutiveFailures: failures,
    });

    // Handle rate limit
    if (retryAfter) {
      rateLimitManager.handleRateLimited(platform, retryAfter);
    }

    // Check circuit breaker
    if (failures >= 5) {
      this.updateHealth(platform, {
        status: 'error',
        circuitState: 'open',
      });
      console.warn(`[Orchestrator] Circuit breaker OPEN for ${platform}`);
    }
  }

  // ============================================================================
  // Health Monitoring
  // ============================================================================

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    if (this.healthCheckTimer) {
      return;
    }

    this.healthCheckTimer = setInterval(() => {
      this.runHealthChecks().catch((error) => {
        console.error('[Orchestrator] Health check error:', error);
      });
    }, this.config.healthCheckInterval);

    console.log('[Orchestrator] Started health monitoring');
  }

  /**
   * Stop health monitoring
   */
  private stopHealthMonitoring(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }

  /**
   * Run health checks on all adapters
   */
  private async runHealthChecks(): Promise<void> {
    for (const [platform, adapter] of this.adapters) {
      try {
        const result = await adapter.healthCheck();
        this.processHealthResult(platform, result);
      } catch (error) {
        this.processHealthResult(platform, {
          healthy: false,
          latency: 0,
          errors: [error instanceof Error ? error.message : String(error)],
        });
      }
    }
  }

  /**
   * Process health check result
   */
  private processHealthResult(
    platform: PlatformType,
    result: HealthCheckResult
  ): void {
    const current = this.health.get(platform);
    if (!current) return;

    let newStatus: ChannelStatus = current.status;
    let newScore = current.healthScore;

    if (result.healthy) {
      newScore = Math.min(100, newScore + 10);
      if (newScore >= this.config.degradedThreshold) {
        newStatus = 'connected';
      } else {
        newStatus = 'degraded';
      }

      // Reset circuit breaker if in half-open
      if (current.circuitState === 'half-open') {
        this.updateHealth(platform, { circuitState: 'closed' });
        console.log(`[Orchestrator] Circuit breaker CLOSED for ${platform}`);
      }
    } else {
      newScore = Math.max(0, newScore - 15);
      if (newScore < this.config.unhealthyThreshold) {
        newStatus = 'error';
      } else if (newScore < this.config.degradedThreshold) {
        newStatus = 'degraded';
      }
    }

    this.updateHealth(platform, {
      status: newStatus,
      healthScore: newScore,
      lastCheck: result,
      lastHeartbeat: result.healthy ? new Date() : current.lastHeartbeat,
    });

    // Emit health event
    messageBus.emitHealth(platform, newStatus, newScore).catch(() => {});
  }

  /**
   * Update health state
   */
  private updateHealth(
    platform: PlatformType,
    updates: Partial<ChannelHealth>
  ): void {
    const current = this.health.get(platform);
    if (!current) return;

    this.health.set(platform, { ...current, ...updates });
  }

  /**
   * Get health for a platform
   */
  getHealth(platform: PlatformType): ChannelHealth | undefined {
    return this.health.get(platform);
  }

  /**
   * Get health for all platforms
   */
  getAllHealth(): Map<PlatformType, ChannelHealth> {
    return new Map(this.health);
  }

  /**
   * Get healthy platforms
   */
  getHealthyPlatforms(): PlatformType[] {
    return Array.from(this.health.entries())
      .filter(([_, health]) => health.status === 'connected')
      .map(([platform]) => platform);
  }

  // ============================================================================
  // Failover & Recovery
  // ============================================================================

  /**
   * Attempt to reconnect an adapter
   */
  private async attemptReconnect(platform: PlatformType): Promise<void> {
    const adapter = this.adapters.get(platform);
    const config = this.configs.get(platform);

    if (!adapter || !config) {
      return;
    }

    console.log(`[Orchestrator] Attempting reconnect for ${platform}...`);

    // Stop current receiver
    this.stopReceiving(platform);

    try {
      // Reinitialize
      await adapter.shutdown();
      await adapter.initialize(config);

      // Update health
      this.updateHealth(platform, {
        status: 'connected',
        healthScore: 50, // Start at degraded
        consecutiveFailures: 0,
        circuitState: 'half-open',
      });

      // Restart receiving
      this.startReceiving(platform);

      console.log(`[Orchestrator] Reconnected ${platform}`);
    } catch (error) {
      console.error(`[Orchestrator] Reconnect failed for ${platform}:`, error);
      this.updateHealth(platform, {
        status: 'error',
        healthScore: 0,
      });
    }
  }

  // ============================================================================
  // Metrics
  // ============================================================================

  /**
   * Increment a metric counter
   */
  private incrementMetric(
    platform: PlatformType,
    metric: keyof Pick<
      ChannelMetrics,
      'messagesReceived' | 'messagesSent' | 'failedSends' | 'rateLimitHits' | 'errors'
    >
  ): void {
    if (!this.config.enableMetrics) return;

    const current = this.metrics.get(platform);
    if (!current) return;

    this.metrics.set(platform, {
      ...current,
      [metric]: (current[metric] as number) + 1,
      lastUpdated: new Date(),
    });
  }

  /**
   * Update latency metric
   */
  private updateLatency(platform: PlatformType, latency: number): void {
    if (!this.config.enableMetrics) return;

    const current = this.metrics.get(platform);
    if (!current) return;

    // Running average
    const count = current.messagesSent;
    const newAvg = count === 0
      ? latency
      : (current.avgLatency * (count - 1) + latency) / count;

    this.metrics.set(platform, {
      ...current,
      avgLatency: newAvg,
      lastUpdated: new Date(),
    });
  }

  /**
   * Get metrics for a platform
   */
  getMetrics(platform: PlatformType): ChannelMetrics | undefined {
    return this.metrics.get(platform);
  }

  /**
   * Get metrics for all platforms
   */
  getAllMetrics(): Map<PlatformType, ChannelMetrics> {
    return new Map(this.metrics);
  }

  // ============================================================================
  // Status
  // ============================================================================

  /**
   * Get orchestrator status
   */
  getStatus(): {
    platforms: Array<{
      platform: PlatformType;
      status: ChannelStatus;
      healthScore: number;
      metrics?: ChannelMetrics;
    }>;
    healthMonitoring: boolean;
    messageProcessing: boolean;
  } {
    const platforms = Array.from(this.adapters.keys()).map((platform) => ({
      platform,
      status: this.health.get(platform)?.status || 'disconnected',
      healthScore: this.health.get(platform)?.healthScore || 0,
      metrics: this.metrics.get(platform),
    }));

    return {
      platforms,
      healthMonitoring: this.healthCheckTimer !== null,
      messageProcessing: messageBus.getQueueStatus().processing,
    };
  }
}

// ============================================================================
// Exports
// ============================================================================

/**
 * Singleton orchestrator instance
 */
export const channelOrchestrator = ChannelOrchestrator.getInstance();

/**
 * Register an adapter
 */
export async function registerAdapter(
  adapter: ChannelAdapter,
  config: ChannelConfig
): Promise<void> {
  return channelOrchestrator.registerAdapter(adapter, config);
}

/**
 * Initialize all adapters
 */
export async function initializeChannels(): Promise<void> {
  return channelOrchestrator.initializeAll();
}

/**
 * Shutdown all adapters
 */
export async function shutdownChannels(): Promise<void> {
  return channelOrchestrator.shutdownAll();
}

/**
 * Route a message
 */
export async function routeMessage(
  message: UnifiedResponse,
  recipient: UnifiedRecipient,
  platform: PlatformType
): Promise<SendResult> {
  return channelOrchestrator.routeMessage(message, recipient, platform);
}

/**
 * Get channel health
 */
export function getChannelHealth(platform: PlatformType): ChannelHealth | undefined {
  return channelOrchestrator.getHealth(platform);
}

/**
 * Get all channel health
 */
export function getAllChannelHealth(): Map<PlatformType, ChannelHealth> {
  return channelOrchestrator.getAllHealth();
}
