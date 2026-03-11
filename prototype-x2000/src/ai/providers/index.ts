/**
 * X2000 LLM Provider Manager
 *
 * Auto-detects and manages multiple LLM providers.
 * Allows X2000 to run on any LLM - cloud or local.
 */

import { LLMProvider, type LLMProviderConfig, type Message, type ToolDefinition, type LLMResponse } from './base.js';
import { AnthropicProvider } from './anthropic.js';
import { OpenAIProvider } from './openai.js';
import { OllamaProvider } from './ollama.js';
import { ClaudeCodeProvider } from './claude-code.js';

export type ProviderType = 'anthropic' | 'openai' | 'ollama' | 'claude-code' | 'auto';

export interface ProviderManagerConfig {
  preferredProvider?: ProviderType;
  anthropic?: Partial<LLMProviderConfig>;
  openai?: Partial<LLMProviderConfig>;
  ollama?: Partial<LLMProviderConfig>;
  claudeCode?: Partial<LLMProviderConfig> & { cliPath?: string };
}

class ProviderManager {
  private providers: Map<string, LLMProvider> = new Map();
  private activeProvider: LLMProvider | null = null;
  private config: ProviderManagerConfig = {};

  /**
   * Initialize the provider manager
   */
  async initialize(config: ProviderManagerConfig = {}): Promise<void> {
    this.config = config;

    console.log('[X2000] Detecting available LLM providers...');

    // Try to initialize each provider
    // Priority: claude-code (Max subscription) > anthropic (API) > openai > ollama
    const providerConfigs: Array<{ type: string; Provider: new (config: any) => LLMProvider; config: any }> = [
      {
        type: 'claude-code',
        Provider: ClaudeCodeProvider,
        config: config.claudeCode || {},
      },
      {
        type: 'anthropic',
        Provider: AnthropicProvider,
        config: config.anthropic || {},
      },
      {
        type: 'openai',
        Provider: OpenAIProvider,
        config: config.openai || {},
      },
      {
        type: 'ollama',
        Provider: OllamaProvider,
        config: config.ollama || {},
      },
    ];

    for (const { type, Provider, config: providerConfig } of providerConfigs) {
      try {
        const provider = new Provider(providerConfig);
        const available = await provider.isAvailable();

        if (available) {
          this.providers.set(type, provider);
          console.log(`[X2000] ✓ ${type} provider available`);
        } else {
          console.log(`[X2000] ✗ ${type} provider not available`);
        }
      } catch (error) {
        console.log(`[X2000] ✗ ${type} provider failed: ${error}`);
      }
    }

    // Set active provider based on preference or availability
    if (config.preferredProvider && config.preferredProvider !== 'auto') {
      const preferred = this.providers.get(config.preferredProvider);
      if (preferred) {
        this.activeProvider = preferred;
        console.log(`[X2000] Using preferred provider: ${config.preferredProvider}`);
      }
    }

    // Auto-select if no preference or preferred not available
    if (!this.activeProvider) {
      // Priority: claude-code (Max subscription) > anthropic (API) > openai > ollama
      for (const type of ['claude-code', 'anthropic', 'openai', 'ollama']) {
        const provider = this.providers.get(type);
        if (provider) {
          this.activeProvider = provider;
          console.log(`[X2000] Auto-selected provider: ${type}`);
          break;
        }
      }
    }

    if (!this.activeProvider) {
      console.log('[X2000] ⚠️  No LLM providers available!');
      console.log('[X2000] To use X2000, configure one of:');
      console.log('  - ANTHROPIC_API_KEY for Claude');
      console.log('  - OPENAI_API_KEY for GPT-4');
      console.log('  - Ollama running locally (ollama serve)');
    }
  }

  /**
   * Get the active provider
   */
  getActive(): LLMProvider {
    if (!this.activeProvider) {
      throw new Error('No LLM provider available. Run providerManager.initialize() first.');
    }
    return this.activeProvider;
  }

  /**
   * Switch to a different provider
   */
  switchTo(type: ProviderType): void {
    if (type === 'auto') {
      // Re-run auto selection
      for (const t of ['claude-code', 'anthropic', 'openai', 'ollama']) {
        const provider = this.providers.get(t);
        if (provider) {
          this.activeProvider = provider;
          console.log(`[X2000] Switched to: ${t}`);
          return;
        }
      }
    } else {
      const provider = this.providers.get(type);
      if (provider) {
        this.activeProvider = provider;
        console.log(`[X2000] Switched to: ${type}`);
      } else {
        throw new Error(`Provider '${type}' is not available`);
      }
    }
  }

  /**
   * List available providers
   */
  listAvailable(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Check if a provider is available
   */
  hasProvider(type: string): boolean {
    return this.providers.has(type);
  }

  /**
   * Chat using the active provider
   */
  async chat(
    messages: Message[],
    options?: { tools?: ToolDefinition[]; systemPrompt?: string }
  ): Promise<LLMResponse> {
    return this.getActive().chat(messages, options);
  }

  /**
   * Get current provider name
   */
  get currentProvider(): string {
    return this.activeProvider?.name || 'none';
  }
}

export const providerManager = new ProviderManager();

// Re-export types and classes
export { LLMProvider, type LLMProviderConfig, type Message, type ToolDefinition, type LLMResponse } from './base.js';
export { AnthropicProvider } from './anthropic.js';
export { OpenAIProvider } from './openai.js';
export { OllamaProvider } from './ollama.js';
export { ClaudeCodeProvider } from './claude-code.js';
