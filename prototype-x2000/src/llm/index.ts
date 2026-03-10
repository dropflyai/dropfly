/**
 * LLM Provider System
 *
 * Comprehensive LLM-agnostic provider system for X2000.
 * Supports multiple providers with unified interface.
 *
 * Usage:
 * ```typescript
 * import { createLLM, chat, stream, LLMProvider } from './llm/index.js';
 *
 * // Quick chat
 * const response = await chat('gpt-4o', [
 *   { role: 'user', content: 'Hello!' }
 * ]);
 *
 * // Create a specific provider
 * const claude = createLLM({
 *   provider: LLMProvider.ANTHROPIC,
 *   model: 'claude-sonnet-4-20250514',
 * });
 *
 * // Use the manager for fallbacks
 * import { llmManager } from './llm/index.js';
 * llmManager.setFallback({
 *   primary: { provider: LLMProvider.ANTHROPIC, model: 'claude-sonnet-4-20250514' },
 *   fallbacks: [
 *     { provider: LLMProvider.OPENAI, model: 'gpt-4o' },
 *   ],
 * });
 * ```
 */

// Types
export {
  LLMProvider,
  LLMConfig,
  LLMOptions,
  LLMMessage,
  LLMResponse,
  LLMStreamChunk,
  LLMUsage,
  LLMCapabilities,
  LLMError,
  LLMErrorType,
  ToolDefinition,
  ToolCall,
  ToolResult,
  ChatOptions,
  StreamOptions,
  ModelInfo,
  FallbackConfig,
  UsageEntry,
  BaseLLMClient,
  ProviderRegistryEntry,
  MessageRole,
  FinishReason,
  ContentBlock,
  TextContent,
  ImageContent,
  ToolUseContent,
  ToolResultContent,
  JSONSchema,
} from './types.js';

// Base class
export { BaseLLM, estimateTokens, createDefaultUsage, mergeOptions } from './base.js';

// Providers
export {
  AnthropicLLM,
  getAnthropicModels,
  createAnthropic,
} from './providers/anthropic.js';

export {
  OpenAILLM,
  getOpenAIModels,
  createOpenAI,
} from './providers/openai.js';

export {
  DeepSeekLLM,
  getDeepSeekModels,
  createDeepSeek,
} from './providers/deepseek.js';

export {
  KimiLLM,
  getKimiModels,
  createKimi,
} from './providers/kimi.js';

export {
  GoogleLLM,
  getGoogleModels,
  createGoogle,
} from './providers/google.js';

export {
  MistralLLM,
  getMistralModels,
  createMistral,
} from './providers/mistral.js';

export {
  XAILLM,
  getXAIModels,
  createXAI,
} from './providers/xai.js';

export {
  GroqLLM,
  getGroqModels,
  createGroq,
} from './providers/groq.js';

export {
  TogetherLLM,
  getTogetherModels,
  createTogether,
} from './providers/together.js';

export {
  OllamaLLM,
  getOllamaModels,
  createOllama,
} from './providers/ollama.js';

export {
  OpenRouterLLM,
  getOpenRouterModels,
  createOpenRouter,
} from './providers/openrouter.js';

// Registry
export {
  providerRegistry,
  getProvider,
  detectProvider,
  getAllModels,
  getModelsForProvider,
  createClient,
  getConfiguredProviders,
} from './registry.js';

// Manager
export { llmManager, LLMManager } from './manager.js';

// ============================================================================
// Convenience Functions
// ============================================================================

import { LLMProvider, LLMConfig, LLMMessage, LLMResponse, LLMStreamChunk, ChatOptions, StreamOptions } from './types.js';
import { providerRegistry, detectProvider } from './registry.js';
import { llmManager } from './manager.js';

/**
 * Create an LLM client
 *
 * @param config - LLM configuration or just model name
 * @returns LLM client instance
 *
 * @example
 * ```typescript
 * // With full config
 * const llm = createLLM({
 *   provider: LLMProvider.ANTHROPIC,
 *   model: 'claude-sonnet-4-20250514',
 * });
 *
 * // With just model name (auto-detects provider)
 * const llm = createLLM({ model: 'gpt-4o' });
 * ```
 */
export function createLLM(config: Partial<LLMConfig> & { model: string }): ReturnType<typeof providerRegistry.createClient> {
  let provider = config.provider;

  // Auto-detect provider from model name if not specified
  if (!provider) {
    provider = detectProvider(config.model);
    if (!provider) {
      throw new Error(
        `Could not detect provider for model "${config.model}". Please specify the provider explicitly.`
      );
    }
  }

  const { model, provider: _provider, ...restConfig } = config;
  return providerRegistry.createClient({
    provider,
    model,
    ...restConfig,
  });
}

/**
 * Quick chat function
 *
 * @param model - Model name or ID
 * @param messages - Chat messages
 * @param options - Chat options
 * @returns LLM response
 *
 * @example
 * ```typescript
 * const response = await chat('gpt-4o', [
 *   { role: 'user', content: 'What is 2+2?' }
 * ]);
 * console.log(response.content);
 * ```
 */
export async function chat(
  model: string,
  messages: LLMMessage[],
  options?: ChatOptions
): Promise<LLMResponse> {
  const llm = createLLM({ model });
  return llm.chat(messages, options);
}

/**
 * Quick stream function
 *
 * @param model - Model name or ID
 * @param messages - Chat messages
 * @param options - Stream options
 * @returns Async iterable of stream chunks
 *
 * @example
 * ```typescript
 * for await (const chunk of stream('claude-sonnet-4-20250514', messages)) {
 *   if (chunk.content) {
 *     process.stdout.write(chunk.content);
 *   }
 * }
 * ```
 */
export async function* stream(
  model: string,
  messages: LLMMessage[],
  options?: StreamOptions
): AsyncIterable<LLMStreamChunk> {
  const llm = createLLM({ model });
  yield* llm.stream(messages, options);
}

/**
 * Quick tool call function
 *
 * @param model - Model name or ID
 * @param messages - Chat messages
 * @param tools - Tool definitions
 * @param options - Chat options
 * @returns LLM response with potential tool calls
 *
 * @example
 * ```typescript
 * const response = await toolCall('gpt-4o', messages, [
 *   {
 *     name: 'get_weather',
 *     description: 'Get weather for a location',
 *     parameters: {
 *       type: 'object',
 *       properties: {
 *         location: { type: 'string' },
 *       },
 *       required: ['location'],
 *     },
 *   },
 * ]);
 * ```
 */
export async function toolCall(
  model: string,
  messages: LLMMessage[],
  tools: import('./types.js').ToolDefinition[],
  options?: ChatOptions
): Promise<LLMResponse> {
  const llm = createLLM({ model });
  return llm.toolCall(messages, tools, options);
}

/**
 * Get the default LLM manager
 */
export function getManager() {
  return llmManager;
}

/**
 * Configure the default manager
 *
 * @example
 * ```typescript
 * configureManager({
 *   defaultProvider: LLMProvider.ANTHROPIC,
 *   defaultModel: 'claude-sonnet-4-20250514',
 *   trackUsage: true,
 * });
 * ```
 */
export function configureManager(config: Parameters<typeof llmManager.configure>[0]) {
  llmManager.configure(config);
}

/**
 * Get all available models
 */
export function listModels() {
  return providerRegistry.getAllModels();
}

/**
 * Get models for a specific provider
 */
export function listProviderModels(provider: LLMProvider) {
  return providerRegistry.getModels(provider);
}

/**
 * Search for models by name
 */
export function searchModels(query: string) {
  return providerRegistry.searchModels(query);
}

/**
 * Get cheapest models
 */
export function getCheapestModels(limit?: number) {
  return providerRegistry.getCheapestModels(limit);
}

/**
 * Get models with specific capabilities
 */
export function getModelsWithCapability(capability: 'vision' | 'toolCalling' | 'streaming' | 'jsonMode') {
  return providerRegistry.getModelsWithCapability(capability);
}

/**
 * Check if provider is configured (has API key)
 */
export function isProviderConfigured(provider: LLMProvider): boolean {
  return providerRegistry.hasApiKey(provider);
}

/**
 * Get usage statistics
 */
export function getUsageStats() {
  return llmManager.getUsageStats();
}

/**
 * Estimate cost for messages
 */
export async function estimateCost(model: string, messages: LLMMessage[]): Promise<number> {
  return llmManager.estimateCost(messages, { model });
}
