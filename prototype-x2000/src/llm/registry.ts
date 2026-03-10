/**
 * Provider Registry
 *
 * Central registry for all LLM providers.
 * Supports registering, retrieving, and auto-detecting providers.
 */

import {
  LLMProvider,
  LLMConfig,
  ModelInfo,
  BaseLLMClient,
  ProviderRegistryEntry,
} from './types.js';

import { AnthropicLLM, getAnthropicModels, createAnthropic } from './providers/anthropic.js';
import { OpenAILLM, getOpenAIModels, createOpenAI } from './providers/openai.js';
import { DeepSeekLLM, getDeepSeekModels, createDeepSeek } from './providers/deepseek.js';
import { KimiLLM, getKimiModels, createKimi } from './providers/kimi.js';
import { GoogleLLM, getGoogleModels, createGoogle } from './providers/google.js';
import { MistralLLM, getMistralModels, createMistral } from './providers/mistral.js';
import { XAILLM, getXAIModels, createXAI } from './providers/xai.js';
import { GroqLLM, getGroqModels, createGroq } from './providers/groq.js';
import { TogetherLLM, getTogetherModels, createTogether } from './providers/together.js';
import { OllamaLLM, getOllamaModels, createOllama } from './providers/ollama.js';
import { OpenRouterLLM, getOpenRouterModels, createOpenRouter } from './providers/openrouter.js';

/**
 * Provider registry entries
 */
const PROVIDER_REGISTRY: Map<LLMProvider, ProviderRegistryEntry> = new Map([
  [
    LLMProvider.ANTHROPIC,
    {
      provider: LLMProvider.ANTHROPIC,
      models: getAnthropicModels(),
      defaultModel: 'claude-sonnet-4-20250514',
      createClient: (config) => createAnthropic(config),
      envKey: 'ANTHROPIC_API_KEY',
      defaultBaseUrl: 'https://api.anthropic.com',
    },
  ],
  [
    LLMProvider.OPENAI,
    {
      provider: LLMProvider.OPENAI,
      models: getOpenAIModels(),
      defaultModel: 'gpt-4o',
      createClient: (config) => createOpenAI(config),
      envKey: 'OPENAI_API_KEY',
      defaultBaseUrl: 'https://api.openai.com',
    },
  ],
  [
    LLMProvider.DEEPSEEK,
    {
      provider: LLMProvider.DEEPSEEK,
      models: getDeepSeekModels(),
      defaultModel: 'deepseek-chat',
      createClient: (config) => createDeepSeek(config),
      envKey: 'DEEPSEEK_API_KEY',
      defaultBaseUrl: 'https://api.deepseek.com',
    },
  ],
  [
    LLMProvider.KIMI,
    {
      provider: LLMProvider.KIMI,
      models: getKimiModels(),
      defaultModel: 'kimi-2.5-latest',
      createClient: (config) => createKimi(config),
      envKey: 'MOONSHOT_API_KEY',
      defaultBaseUrl: 'https://api.moonshot.cn',
    },
  ],
  [
    LLMProvider.GOOGLE,
    {
      provider: LLMProvider.GOOGLE,
      models: getGoogleModels(),
      defaultModel: 'gemini-2.0-flash',
      createClient: (config) => createGoogle(config),
      envKey: 'GOOGLE_API_KEY',
      defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    },
  ],
  [
    LLMProvider.MISTRAL,
    {
      provider: LLMProvider.MISTRAL,
      models: getMistralModels(),
      defaultModel: 'mistral-large-latest',
      createClient: (config) => createMistral(config),
      envKey: 'MISTRAL_API_KEY',
      defaultBaseUrl: 'https://api.mistral.ai',
    },
  ],
  [
    LLMProvider.XAI,
    {
      provider: LLMProvider.XAI,
      models: getXAIModels(),
      defaultModel: 'grok-3',
      createClient: (config) => createXAI(config),
      envKey: 'XAI_API_KEY',
      defaultBaseUrl: 'https://api.x.ai',
    },
  ],
  [
    LLMProvider.GROQ,
    {
      provider: LLMProvider.GROQ,
      models: getGroqModels(),
      defaultModel: 'llama-3.3-70b-versatile',
      createClient: (config) => createGroq(config),
      envKey: 'GROQ_API_KEY',
      defaultBaseUrl: 'https://api.groq.com/openai',
    },
  ],
  [
    LLMProvider.TOGETHER,
    {
      provider: LLMProvider.TOGETHER,
      models: getTogetherModels(),
      defaultModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      createClient: (config) => createTogether(config),
      envKey: 'TOGETHER_API_KEY',
      defaultBaseUrl: 'https://api.together.xyz',
    },
  ],
  [
    LLMProvider.OLLAMA,
    {
      provider: LLMProvider.OLLAMA,
      models: getOllamaModels(),
      defaultModel: 'llama3.3',
      createClient: (config) => createOllama(config),
      envKey: 'OLLAMA_HOST',
      defaultBaseUrl: 'http://localhost:11434',
    },
  ],
  [
    LLMProvider.OPENROUTER,
    {
      provider: LLMProvider.OPENROUTER,
      models: getOpenRouterModels(),
      defaultModel: 'anthropic/claude-sonnet-4',
      createClient: (config) => createOpenRouter(config),
      envKey: 'OPENROUTER_API_KEY',
      defaultBaseUrl: 'https://openrouter.ai/api',
    },
  ],
]);

/**
 * Model prefix to provider mapping for auto-detection
 */
const MODEL_PREFIX_MAP: [string, LLMProvider][] = [
  // Anthropic
  ['claude', LLMProvider.ANTHROPIC],
  // OpenAI
  ['gpt-4', LLMProvider.OPENAI],
  ['gpt-3.5', LLMProvider.OPENAI],
  ['o1', LLMProvider.OPENAI],
  ['o3', LLMProvider.OPENAI],
  // DeepSeek
  ['deepseek-chat', LLMProvider.DEEPSEEK],
  ['deepseek-coder', LLMProvider.DEEPSEEK],
  ['deepseek-reasoner', LLMProvider.DEEPSEEK],
  // Kimi/Moonshot
  ['kimi', LLMProvider.KIMI],
  ['moonshot', LLMProvider.KIMI],
  // Google
  ['gemini', LLMProvider.GOOGLE],
  // Mistral
  ['mistral', LLMProvider.MISTRAL],
  ['codestral', LLMProvider.MISTRAL],
  ['pixtral', LLMProvider.MISTRAL],
  // xAI
  ['grok', LLMProvider.XAI],
  // Groq - hosted models
  ['llama-3', LLMProvider.GROQ],
  ['mixtral-8x7b-32768', LLMProvider.GROQ],
  ['gemma2-9b-it', LLMProvider.GROQ],
  // Together - uses org/model format
  ['meta-llama/', LLMProvider.TOGETHER],
  ['mistralai/', LLMProvider.TOGETHER],
  ['Qwen/', LLMProvider.TOGETHER],
  ['deepseek-ai/', LLMProvider.TOGETHER],
  // OpenRouter - uses provider/model format
  ['anthropic/', LLMProvider.OPENROUTER],
  ['openai/', LLMProvider.OPENROUTER],
  ['google/', LLMProvider.OPENROUTER],
  ['meta-llama/', LLMProvider.OPENROUTER],
  ['mistralai/', LLMProvider.OPENROUTER],
  ['deepseek/', LLMProvider.OPENROUTER],
  ['qwen/', LLMProvider.OPENROUTER],
];

/**
 * Provider Registry class
 */
class ProviderRegistry {
  private customProviders: Map<string, ProviderRegistryEntry> = new Map();

  /**
   * Get a provider entry by provider enum
   */
  getProvider(provider: LLMProvider): ProviderRegistryEntry | undefined {
    return PROVIDER_REGISTRY.get(provider) || this.customProviders.get(provider);
  }

  /**
   * Get all registered providers
   */
  getAllProviders(): ProviderRegistryEntry[] {
    return [
      ...Array.from(PROVIDER_REGISTRY.values()),
      ...Array.from(this.customProviders.values()),
    ];
  }

  /**
   * Register a custom provider
   */
  registerProvider(entry: ProviderRegistryEntry): void {
    this.customProviders.set(entry.provider, entry);
  }

  /**
   * Auto-detect provider from model name
   */
  detectProvider(modelName: string): LLMProvider | undefined {
    const lowerModel = modelName.toLowerCase();

    for (const [prefix, provider] of MODEL_PREFIX_MAP) {
      if (lowerModel.startsWith(prefix.toLowerCase())) {
        return provider;
      }
    }

    // Check if model exists in any provider's model list
    for (const entry of this.getAllProviders()) {
      if (entry.models.some((m) => m.id === modelName)) {
        return entry.provider;
      }
    }

    return undefined;
  }

  /**
   * Get all models for a provider
   */
  getModels(provider: LLMProvider): ModelInfo[] {
    const entry = this.getProvider(provider);
    return entry?.models || [];
  }

  /**
   * Get all available models across all providers
   */
  getAllModels(): ModelInfo[] {
    const models: ModelInfo[] = [];
    for (const entry of this.getAllProviders()) {
      models.push(...entry.models);
    }
    return models;
  }

  /**
   * Get model info by model ID
   */
  getModelInfo(modelId: string): ModelInfo | undefined {
    for (const entry of this.getAllProviders()) {
      const model = entry.models.find((m) => m.id === modelId);
      if (model) return model;
    }
    return undefined;
  }

  /**
   * Get default model for a provider
   */
  getDefaultModel(provider: LLMProvider): string | undefined {
    return this.getProvider(provider)?.defaultModel;
  }

  /**
   * Create a client for a provider
   */
  createClient(config: LLMConfig): BaseLLMClient {
    const entry = this.getProvider(config.provider);
    if (!entry) {
      throw new Error(`Unknown provider: ${config.provider}`);
    }
    return entry.createClient(config);
  }

  /**
   * Get environment variable name for a provider's API key
   */
  getEnvKeyName(provider: LLMProvider): string | undefined {
    return this.getProvider(provider)?.envKey;
  }

  /**
   * Check if a provider has a valid API key configured
   */
  hasApiKey(provider: LLMProvider): boolean {
    const envKey = this.getEnvKeyName(provider);
    if (!envKey) return false;
    return !!process.env[envKey];
  }

  /**
   * Get list of providers with configured API keys
   */
  getConfiguredProviders(): LLMProvider[] {
    return this.getAllProviders()
      .filter((entry) => this.hasApiKey(entry.provider))
      .map((entry) => entry.provider);
  }

  /**
   * Search models by name or description
   */
  searchModels(query: string): ModelInfo[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllModels().filter(
      (m) =>
        m.id.toLowerCase().includes(lowerQuery) ||
        m.name.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get models with a specific capability
   */
  getModelsWithCapability(
    capability: keyof ModelInfo['capabilities']
  ): ModelInfo[] {
    return this.getAllModels().filter((m) => {
      const cap = m.capabilities[capability];
      return typeof cap === 'boolean' ? cap : cap !== undefined;
    });
  }

  /**
   * Get cheapest models (sorted by input cost)
   */
  getCheapestModels(limit: number = 10): ModelInfo[] {
    return this.getAllModels()
      .filter((m) => m.inputCostPer1M !== undefined)
      .sort((a, b) => (a.inputCostPer1M || 0) - (b.inputCostPer1M || 0))
      .slice(0, limit);
  }

  /**
   * Get models with largest context
   */
  getLargestContextModels(limit: number = 10): ModelInfo[] {
    return this.getAllModels()
      .sort((a, b) => b.contextLength - a.contextLength)
      .slice(0, limit);
  }
}

/**
 * Global provider registry instance
 */
export const providerRegistry = new ProviderRegistry();

/**
 * Convenience function to get provider
 */
export function getProvider(provider: LLMProvider): ProviderRegistryEntry | undefined {
  return providerRegistry.getProvider(provider);
}

/**
 * Convenience function to detect provider from model
 */
export function detectProvider(modelName: string): LLMProvider | undefined {
  return providerRegistry.detectProvider(modelName);
}

/**
 * Convenience function to get all models
 */
export function getAllModels(): ModelInfo[] {
  return providerRegistry.getAllModels();
}

/**
 * Convenience function to get models for a provider
 */
export function getModelsForProvider(provider: LLMProvider): ModelInfo[] {
  return providerRegistry.getModels(provider);
}

/**
 * Convenience function to create a client
 */
export function createClient(config: LLMConfig): BaseLLMClient {
  return providerRegistry.createClient(config);
}

/**
 * Convenience function to get configured providers
 */
export function getConfiguredProviders(): LLMProvider[] {
  return providerRegistry.getConfiguredProviders();
}
