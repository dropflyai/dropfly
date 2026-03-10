/**
 * X2000 LLM Provider Base
 *
 * Abstract interface for any LLM provider.
 * Supports Anthropic, OpenAI, Ollama, and any compatible API.
 */

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, unknown>;
    required: string[];
  };
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface LLMResponse {
  content: string;
  toolCalls: ToolCall[];
  stopReason: 'end_turn' | 'tool_use' | 'max_tokens' | 'stop_sequence';
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface LLMProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

export abstract class LLMProvider {
  protected config: LLMProviderConfig;

  constructor(config: LLMProviderConfig) {
    this.config = {
      maxTokens: 4096,
      temperature: 0.7,
      ...config,
    };
  }

  abstract get name(): string;

  abstract chat(
    messages: Message[],
    options?: {
      tools?: ToolDefinition[];
      systemPrompt?: string;
    }
  ): Promise<LLMResponse>;

  abstract isAvailable(): Promise<boolean>;
}

export default LLMProvider;
