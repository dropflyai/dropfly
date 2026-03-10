/**
 * Base LLM Class
 *
 * Abstract base class providing common interface for all LLM providers.
 * Handles common functionality like token counting, cost calculation, and error handling.
 */

import {
  LLMProvider,
  LLMConfig,
  LLMMessage,
  LLMResponse,
  LLMStreamChunk,
  LLMUsage,
  LLMCapabilities,
  LLMError,
  LLMErrorType,
  ToolDefinition,
  ToolCall,
  ChatOptions,
  StreamOptions,
  ModelInfo,
  BaseLLMClient,
} from './types.js';

/**
 * Abstract base class for LLM providers
 */
export abstract class BaseLLM implements BaseLLMClient {
  protected config: LLMConfig;
  protected apiKey: string;
  protected baseUrl: string;

  abstract readonly provider: LLMProvider;
  abstract readonly capabilities: LLMCapabilities;

  constructor(config: LLMConfig) {
    this.config = config;
    this.apiKey = config.apiKey || this.getEnvApiKey();
    this.baseUrl = config.baseUrl || this.getDefaultBaseUrl();
  }

  /**
   * Get the model identifier
   */
  get model(): string {
    return this.config.model;
  }

  /**
   * Get the environment variable name for API key
   */
  protected abstract getEnvKeyName(): string;

  /**
   * Get the default base URL for the provider
   */
  protected abstract getDefaultBaseUrl(): string;

  /**
   * Get API key from environment variable
   */
  protected getEnvApiKey(): string {
    const envKey = this.getEnvKeyName();
    const apiKey = process.env[envKey];
    if (!apiKey && this.requiresApiKey()) {
      throw new LLMError(
        `API key not found. Set ${envKey} environment variable or pass apiKey in config.`,
        LLMErrorType.AUTHENTICATION,
        this.provider
      );
    }
    return apiKey || '';
  }

  /**
   * Whether this provider requires an API key
   */
  protected requiresApiKey(): boolean {
    return true;
  }

  /**
   * Send a chat message and get a response
   */
  abstract chat(messages: LLMMessage[], options?: ChatOptions): Promise<LLMResponse>;

  /**
   * Stream a chat response
   */
  abstract stream(
    messages: LLMMessage[],
    options?: StreamOptions
  ): AsyncIterable<LLMStreamChunk>;

  /**
   * Chat with tool calling
   */
  async toolCall(
    messages: LLMMessage[],
    tools: ToolDefinition[],
    options?: ChatOptions
  ): Promise<LLMResponse> {
    if (!this.capabilities.toolCalling) {
      throw new LLMError(
        `Provider ${this.provider} does not support tool calling`,
        LLMErrorType.INVALID_REQUEST,
        this.provider
      );
    }
    return this.chat(messages, { ...options, tools });
  }

  /**
   * Count tokens for messages (approximate if provider doesn't have native support)
   */
  async countTokens(messages: LLMMessage[]): Promise<number> {
    // Default implementation: rough estimate based on character count
    // Providers can override with native tokenizers
    let totalChars = 0;
    for (const msg of messages) {
      if (typeof msg.content === 'string') {
        totalChars += msg.content.length;
      } else {
        for (const block of msg.content) {
          if (block.type === 'text') {
            totalChars += block.text.length;
          }
        }
      }
    }
    // Rough estimate: ~4 characters per token
    return Math.ceil(totalChars / 4);
  }

  /**
   * Calculate cost for usage
   */
  calculateCost(usage: LLMUsage): number {
    const modelInfo = this.getModelInfo();
    if (!modelInfo.inputCostPer1M || !modelInfo.outputCostPer1M) {
      return 0;
    }
    const inputCost = (usage.inputTokens / 1_000_000) * modelInfo.inputCostPer1M;
    const outputCost = (usage.outputTokens / 1_000_000) * modelInfo.outputCostPer1M;
    return inputCost + outputCost;
  }

  /**
   * Get model info
   */
  abstract getModelInfo(): ModelInfo;

  /**
   * Build request headers
   */
  protected buildHeaders(additionalHeaders?: Record<string, string>): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
      ...this.config.options?.headers,
      ...additionalHeaders,
    };
  }

  /**
   * Get authentication headers
   */
  protected abstract getAuthHeaders(): Record<string, string>;

  /**
   * Make an HTTP request with error handling
   */
  protected async makeRequest<T>(
    endpoint: string,
    body: unknown,
    options?: ChatOptions
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const timeout = options?.timeout || this.config.options?.timeout || 60000;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Combine signals if one was provided
    const signal = options?.signal
      ? this.combineSignals(options.signal, controller.signal)
      : controller.signal;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify(body),
        signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      return (await response.json()) as T;
    } catch (error) {
      clearTimeout(timeoutId);
      throw this.normalizeError(error);
    }
  }

  /**
   * Make a streaming request
   */
  protected async *makeStreamingRequest(
    endpoint: string,
    body: unknown,
    options?: StreamOptions
  ): AsyncIterable<string> {
    const url = `${this.baseUrl}${endpoint}`;
    const timeout = options?.timeout || this.config.options?.timeout || 120000;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const signal = options?.signal
      ? this.combineSignals(options.signal, controller.signal)
      : controller.signal;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify(body),
        signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      if (!response.body) {
        throw new LLMError(
          'No response body for streaming request',
          LLMErrorType.SERVER_ERROR,
          this.provider
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield decoder.decode(value, { stream: true });
      }
    } catch (error) {
      clearTimeout(timeoutId);
      throw this.normalizeError(error);
    }
  }

  /**
   * Handle error response from API
   */
  protected async handleErrorResponse(response: Response): Promise<LLMError> {
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }

    const { type, message, retryable } = this.parseErrorResponse(
      response.status,
      errorData
    );

    return new LLMError(message, type, this.provider, response.status, retryable, errorData);
  }

  /**
   * Parse error response to determine error type
   */
  protected parseErrorResponse(
    status: number,
    data: unknown
  ): { type: LLMErrorType; message: string; retryable: boolean } {
    // Default error parsing - providers can override for specific formats
    let message: string;
    if (typeof data === 'string') {
      message = data;
    } else if (data && typeof data === 'object') {
      const dataObj = data as Record<string, unknown>;
      const errorObj = dataObj.error as Record<string, unknown> | undefined;
      message = (errorObj?.message as string) ||
                (dataObj.message as string) ||
                `HTTP ${status} error`;
    } else {
      message = `HTTP ${status} error`;
    }

    switch (status) {
      case 401:
        return { type: LLMErrorType.AUTHENTICATION, message: String(message), retryable: false };
      case 429:
        return { type: LLMErrorType.RATE_LIMIT, message: String(message), retryable: true };
      case 400:
        return { type: LLMErrorType.INVALID_REQUEST, message: String(message), retryable: false };
      case 413:
        return { type: LLMErrorType.CONTEXT_LENGTH, message: String(message), retryable: false };
      case 500:
      case 502:
      case 503:
        return { type: LLMErrorType.SERVER_ERROR, message: String(message), retryable: true };
      default:
        return { type: LLMErrorType.UNKNOWN, message: String(message), retryable: false };
    }
  }

  /**
   * Normalize various error types into LLMError
   */
  protected normalizeError(error: unknown): LLMError {
    if (error instanceof LLMError) {
      return error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return new LLMError(
          'Request timed out',
          LLMErrorType.TIMEOUT,
          this.provider,
          undefined,
          true
        );
      }

      if (error.message.includes('fetch')) {
        return new LLMError(
          `Network error: ${error.message}`,
          LLMErrorType.NETWORK,
          this.provider,
          undefined,
          true
        );
      }

      return new LLMError(
        error.message,
        LLMErrorType.UNKNOWN,
        this.provider,
        undefined,
        false,
        error
      );
    }

    return new LLMError(
      String(error),
      LLMErrorType.UNKNOWN,
      this.provider,
      undefined,
      false,
      error
    );
  }

  /**
   * Combine multiple abort signals
   */
  protected combineSignals(...signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();

    for (const signal of signals) {
      if (signal.aborted) {
        controller.abort();
        return controller.signal;
      }
      signal.addEventListener('abort', () => controller.abort());
    }

    return controller.signal;
  }

  /**
   * Parse SSE data from streaming response
   */
  protected parseSSE(line: string): { event?: string; data?: string } | null {
    if (!line || line.startsWith(':')) {
      return null;
    }

    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) {
      return null;
    }

    const field = line.slice(0, colonIndex);
    const value = line.slice(colonIndex + 1).trim();

    if (field === 'data') {
      return { data: value };
    } else if (field === 'event') {
      return { event: value };
    }

    return null;
  }

  /**
   * Convert tool definitions to provider-specific format
   */
  protected abstract formatTools(tools: ToolDefinition[]): unknown;

  /**
   * Parse tool calls from provider response
   */
  protected abstract parseToolCalls(response: unknown): ToolCall[];

  /**
   * Format messages for the provider's API
   */
  protected abstract formatMessages(messages: LLMMessage[]): unknown;

  /**
   * Extract content from provider response
   */
  protected abstract extractContent(response: unknown): string;

  /**
   * Extract usage from provider response
   */
  protected abstract extractUsage(response: unknown): LLMUsage;
}

/**
 * Helper to estimate tokens from text
 */
export function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token for English text
  // This is a very rough approximation
  return Math.ceil(text.length / 4);
}

/**
 * Helper to create a default usage object
 */
export function createDefaultUsage(): LLMUsage {
  return {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
  };
}

/**
 * Merge options with defaults
 */
export function mergeOptions(
  defaults: Partial<ChatOptions>,
  options?: ChatOptions
): ChatOptions {
  return {
    ...defaults,
    ...options,
  };
}
