/**
 * LLM Manager
 *
 * Manages LLM providers, handles fallbacks, and tracks usage.
 * Provides a unified interface for all LLM operations.
 */

import {
  LLMProvider,
  LLMConfig,
  LLMMessage,
  LLMResponse,
  LLMStreamChunk,
  LLMUsage,
  LLMError,
  LLMErrorType,
  ToolDefinition,
  ChatOptions,
  StreamOptions,
  FallbackConfig,
  UsageEntry,
  BaseLLMClient,
  ModelInfo,
} from './types.js';

import {
  providerRegistry,
  detectProvider,
  getConfiguredProviders,
} from './registry.js';

/**
 * Manager configuration
 */
interface ManagerConfig {
  /** Default provider to use */
  defaultProvider?: LLMProvider;
  /** Default model to use */
  defaultModel?: string;
  /** Fallback configuration */
  fallback?: FallbackConfig;
  /** Enable usage tracking */
  trackUsage?: boolean;
  /** Maximum usage entries to keep */
  maxUsageEntries?: number;
}

/**
 * LLM Manager class
 */
class LLMManager {
  private defaultProvider: LLMProvider = LLMProvider.ANTHROPIC;
  private defaultModel: string = 'claude-sonnet-4-20250514';
  private fallbackConfig?: FallbackConfig;
  private trackUsage: boolean = true;
  private maxUsageEntries: number = 1000;
  private usageLog: UsageEntry[] = [];
  private activeClient?: BaseLLMClient;

  /**
   * Configure the manager
   */
  configure(config: ManagerConfig): void {
    if (config.defaultProvider) {
      this.defaultProvider = config.defaultProvider;
    }
    if (config.defaultModel) {
      this.defaultModel = config.defaultModel;
    }
    if (config.fallback) {
      this.fallbackConfig = config.fallback;
    }
    if (config.trackUsage !== undefined) {
      this.trackUsage = config.trackUsage;
    }
    if (config.maxUsageEntries !== undefined) {
      this.maxUsageEntries = config.maxUsageEntries;
    }
  }

  /**
   * Set the default provider
   */
  setDefaultProvider(provider: LLMProvider, model?: string): void {
    this.defaultProvider = provider;
    if (model) {
      this.defaultModel = model;
    } else {
      this.defaultModel = providerRegistry.getDefaultModel(provider) || this.defaultModel;
    }
    this.activeClient = undefined; // Reset active client
  }

  /**
   * Get current default provider
   */
  getDefaultProvider(): LLMProvider {
    return this.defaultProvider;
  }

  /**
   * Get current default model
   */
  getDefaultModel(): string {
    return this.defaultModel;
  }

  /**
   * Get or create a client for the current configuration
   */
  getClient(config?: Partial<LLMConfig>): BaseLLMClient {
    const provider = config?.provider || this.defaultProvider;
    const model = config?.model || this.defaultModel;

    // Reuse active client if same config
    if (
      this.activeClient &&
      this.activeClient.provider === provider &&
      this.activeClient.model === model
    ) {
      return this.activeClient;
    }

    // Create new client
    this.activeClient = providerRegistry.createClient({
      provider,
      model,
      ...config,
    });

    return this.activeClient;
  }

  /**
   * Set fallback configuration
   */
  setFallback(config: FallbackConfig): void {
    this.fallbackConfig = config;
  }

  /**
   * Chat with automatic fallback
   */
  async chat(
    messages: LLMMessage[],
    options?: ChatOptions & { config?: Partial<LLMConfig> }
  ): Promise<LLMResponse> {
    const startTime = Date.now();
    const config = options?.config;

    // Try primary provider
    try {
      const client = this.getClient(config);
      const response = await client.chat(messages, options);

      // Track usage
      if (this.trackUsage) {
        this.logUsage({
          timestamp: new Date(),
          provider: client.provider,
          model: client.model,
          usage: response.usage,
          cost: client.calculateCost(response.usage),
          success: true,
          latencyMs: Date.now() - startTime,
        });
      }

      return response;
    } catch (error) {
      // Handle fallback
      if (this.fallbackConfig && this.shouldFallback(error)) {
        return this.chatWithFallback(messages, options, error);
      }
      throw error;
    }
  }

  /**
   * Stream with automatic fallback
   */
  async *stream(
    messages: LLMMessage[],
    options?: StreamOptions & { config?: Partial<LLMConfig> }
  ): AsyncIterable<LLMStreamChunk> {
    const startTime = Date.now();
    const config = options?.config;
    const client = this.getClient(config);

    let success = true;
    let totalUsage: LLMUsage | undefined;

    try {
      for await (const chunk of client.stream(messages, options)) {
        if (chunk.usage) {
          totalUsage = chunk.usage;
        }
        yield chunk;
      }
    } catch (error) {
      success = false;
      throw error;
    } finally {
      // Track usage
      if (this.trackUsage && totalUsage) {
        this.logUsage({
          timestamp: new Date(),
          provider: client.provider,
          model: client.model,
          usage: totalUsage,
          cost: client.calculateCost(totalUsage),
          success,
          latencyMs: Date.now() - startTime,
        });
      }
    }
  }

  /**
   * Tool calling with automatic fallback
   */
  async toolCall(
    messages: LLMMessage[],
    tools: ToolDefinition[],
    options?: ChatOptions & { config?: Partial<LLMConfig> }
  ): Promise<LLMResponse> {
    const startTime = Date.now();
    const config = options?.config;

    try {
      const client = this.getClient(config);
      const response = await client.toolCall(messages, tools, options);

      if (this.trackUsage) {
        this.logUsage({
          timestamp: new Date(),
          provider: client.provider,
          model: client.model,
          usage: response.usage,
          cost: client.calculateCost(response.usage),
          success: true,
          latencyMs: Date.now() - startTime,
        });
      }

      return response;
    } catch (error) {
      if (this.fallbackConfig && this.shouldFallback(error)) {
        return this.toolCallWithFallback(messages, tools, options, error);
      }
      throw error;
    }
  }

  /**
   * Chat with fallback chain
   */
  private async chatWithFallback(
    messages: LLMMessage[],
    options: ChatOptions | undefined,
    originalError: unknown
  ): Promise<LLMResponse> {
    if (!this.fallbackConfig) {
      throw originalError;
    }

    const maxRetries = this.fallbackConfig.maxRetries || 3;
    const retryDelay = this.fallbackConfig.retryDelay || 1000;

    for (const fallbackConfig of this.fallbackConfig.fallbacks) {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const client = providerRegistry.createClient(fallbackConfig);
          const response = await client.chat(messages, options);

          if (this.trackUsage) {
            this.logUsage({
              timestamp: new Date(),
              provider: client.provider,
              model: client.model,
              usage: response.usage,
              cost: client.calculateCost(response.usage),
              success: true,
              latencyMs: 0,
            });
          }

          return response;
        } catch (error) {
          if (attempt < maxRetries - 1 && this.shouldRetry(error)) {
            await this.delay(retryDelay * (attempt + 1));
          }
        }
      }
    }

    throw originalError;
  }

  /**
   * Tool call with fallback chain
   */
  private async toolCallWithFallback(
    messages: LLMMessage[],
    tools: ToolDefinition[],
    options: ChatOptions | undefined,
    originalError: unknown
  ): Promise<LLMResponse> {
    if (!this.fallbackConfig) {
      throw originalError;
    }

    for (const fallbackConfig of this.fallbackConfig.fallbacks) {
      try {
        const client = providerRegistry.createClient(fallbackConfig);
        return await client.toolCall(messages, tools, options);
      } catch (error) {
        // Try next fallback
      }
    }

    throw originalError;
  }

  /**
   * Check if error should trigger fallback
   */
  private shouldFallback(error: unknown): boolean {
    if (!this.fallbackConfig) return false;

    if (error instanceof LLMError) {
      const fallbackOn = this.fallbackConfig.fallbackOn || [
        LLMErrorType.RATE_LIMIT,
        LLMErrorType.SERVER_ERROR,
        LLMErrorType.TIMEOUT,
      ];
      return fallbackOn.includes(error.type);
    }

    return true;
  }

  /**
   * Check if error should trigger retry
   */
  private shouldRetry(error: unknown): boolean {
    if (error instanceof LLMError) {
      return error.retryable;
    }
    return false;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Log usage entry
   */
  private logUsage(entry: UsageEntry): void {
    this.usageLog.push(entry);

    // Trim log if too large
    if (this.usageLog.length > this.maxUsageEntries) {
      this.usageLog = this.usageLog.slice(-this.maxUsageEntries);
    }
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): {
    totalCost: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    requestCount: number;
    successRate: number;
    averageLatencyMs: number;
    byProvider: Record<string, {
      cost: number;
      requests: number;
      tokens: number;
    }>;
  } {
    const stats = {
      totalCost: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      requestCount: this.usageLog.length,
      successCount: 0,
      totalLatencyMs: 0,
      byProvider: {} as Record<string, { cost: number; requests: number; tokens: number }>,
    };

    for (const entry of this.usageLog) {
      stats.totalCost += entry.cost;
      stats.totalInputTokens += entry.usage.inputTokens;
      stats.totalOutputTokens += entry.usage.outputTokens;
      if (entry.success) stats.successCount++;
      stats.totalLatencyMs += entry.latencyMs;

      const providerKey = `${entry.provider}/${entry.model}`;
      if (!stats.byProvider[providerKey]) {
        stats.byProvider[providerKey] = { cost: 0, requests: 0, tokens: 0 };
      }
      stats.byProvider[providerKey].cost += entry.cost;
      stats.byProvider[providerKey].requests++;
      stats.byProvider[providerKey].tokens += entry.usage.totalTokens;
    }

    return {
      totalCost: stats.totalCost,
      totalInputTokens: stats.totalInputTokens,
      totalOutputTokens: stats.totalOutputTokens,
      requestCount: stats.requestCount,
      successRate: stats.requestCount > 0 ? stats.successCount / stats.requestCount : 0,
      averageLatencyMs:
        stats.requestCount > 0 ? stats.totalLatencyMs / stats.requestCount : 0,
      byProvider: stats.byProvider,
    };
  }

  /**
   * Get usage log
   */
  getUsageLog(): UsageEntry[] {
    return [...this.usageLog];
  }

  /**
   * Clear usage log
   */
  clearUsageLog(): void {
    this.usageLog = [];
  }

  /**
   * Get cost for the last N requests
   */
  getRecentCost(count: number = 10): number {
    return this.usageLog.slice(-count).reduce((sum, entry) => sum + entry.cost, 0);
  }

  /**
   * Estimate cost for messages
   */
  async estimateCost(
    messages: LLMMessage[],
    config?: Partial<LLMConfig>
  ): Promise<number> {
    const client = this.getClient(config);
    const tokenCount = await client.countTokens(messages);
    const modelInfo = client.getModelInfo();

    if (!modelInfo.inputCostPer1M) return 0;

    // Estimate output as same as input (rough estimate)
    const inputCost = (tokenCount / 1_000_000) * modelInfo.inputCostPer1M;
    const outputCost = (tokenCount / 1_000_000) * (modelInfo.outputCostPer1M || 0);

    return inputCost + outputCost;
  }

  /**
   * Get available providers (with API keys configured)
   */
  getAvailableProviders(): LLMProvider[] {
    return getConfiguredProviders();
  }

  /**
   * Get model info
   */
  getModelInfo(modelId?: string): ModelInfo | undefined {
    const id = modelId || this.defaultModel;
    return providerRegistry.getModelInfo(id);
  }

  /**
   * Quick provider switch
   */
  useAnthropic(model?: string): void {
    this.setDefaultProvider(LLMProvider.ANTHROPIC, model || 'claude-sonnet-4-20250514');
  }

  useOpenAI(model?: string): void {
    this.setDefaultProvider(LLMProvider.OPENAI, model || 'gpt-4o');
  }

  useDeepSeek(model?: string): void {
    this.setDefaultProvider(LLMProvider.DEEPSEEK, model || 'deepseek-chat');
  }

  useGoogle(model?: string): void {
    this.setDefaultProvider(LLMProvider.GOOGLE, model || 'gemini-2.0-flash');
  }

  useMistral(model?: string): void {
    this.setDefaultProvider(LLMProvider.MISTRAL, model || 'mistral-large-latest');
  }

  useGroq(model?: string): void {
    this.setDefaultProvider(LLMProvider.GROQ, model || 'llama-3.3-70b-versatile');
  }

  useOllama(model?: string): void {
    this.setDefaultProvider(LLMProvider.OLLAMA, model || 'llama3.3');
  }

  useOpenRouter(model?: string): void {
    this.setDefaultProvider(LLMProvider.OPENROUTER, model || 'anthropic/claude-sonnet-4');
  }
}

/**
 * Global LLM manager instance
 */
export const llmManager = new LLMManager();

/**
 * Export manager class for custom instances
 */
export { LLMManager };
