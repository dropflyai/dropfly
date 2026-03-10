/**
 * OpenRouter Provider (Multi-provider)
 *
 * Routes to any provider with a single API key.
 * Features: Automatic fallback, unified interface.
 */

import { BaseLLM } from '../base.js';
import {
  LLMProvider,
  LLMConfig,
  LLMMessage,
  LLMResponse,
  LLMStreamChunk,
  LLMUsage,
  LLMCapabilities,
  ToolDefinition,
  ToolCall,
  ChatOptions,
  StreamOptions,
  ModelInfo,
  FinishReason,
} from '../types.js';

/**
 * OpenRouter uses OpenAI-compatible API format
 */
interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | OpenRouterContentBlock[] | null;
  name?: string;
  tool_calls?: OpenRouterToolCall[];
  tool_call_id?: string;
}

interface OpenRouterContentBlock {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
  };
}

interface OpenRouterToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

interface OpenRouterTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string | null;
      tool_calls?: OpenRouterToolCall[];
    };
    finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OpenRouterStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: {
      role?: string;
      content?: string;
      tool_calls?: {
        index: number;
        id?: string;
        type?: string;
        function?: {
          name?: string;
          arguments?: string;
        };
      }[];
    };
    finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Popular OpenRouter models - OpenRouter supports hundreds of models
 */
const OPENROUTER_MODELS: ModelInfo[] = [
  // Anthropic
  {
    id: 'anthropic/claude-sonnet-4',
    name: 'Claude Sonnet 4 (via OpenRouter)',
    provider: LLMProvider.OPENROUTER,
    capabilities: {
      streaming: true,
      toolCalling: true,
      vision: true,
      jsonMode: false,
      systemMessages: true,
      maxContextLength: 200000,
      maxOutputTokens: 64000,
      parallelToolCalls: true,
    },
    inputCostPer1M: 3.0,
    outputCostPer1M: 15.0,
    contextLength: 200000,
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet (via OpenRouter)',
    provider: LLMProvider.OPENROUTER,
    capabilities: {
      streaming: true,
      toolCalling: true,
      vision: true,
      jsonMode: false,
      systemMessages: true,
      maxContextLength: 200000,
      maxOutputTokens: 8192,
      parallelToolCalls: true,
    },
    inputCostPer1M: 3.0,
    outputCostPer1M: 15.0,
    contextLength: 200000,
  },
  // OpenAI
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o (via OpenRouter)',
    provider: LLMProvider.OPENROUTER,
    capabilities: {
      streaming: true,
      toolCalling: true,
      vision: true,
      jsonMode: true,
      systemMessages: true,
      maxContextLength: 128000,
      maxOutputTokens: 16384,
      parallelToolCalls: true,
    },
    inputCostPer1M: 2.5,
    outputCostPer1M: 10.0,
    contextLength: 128000,
  },
  {
    id: 'openai/o1',
    name: 'o1 (via OpenRouter)',
    provider: LLMProvider.OPENROUTER,
    capabilities: {
      streaming: true,
      toolCalling: true,
      vision: true,
      jsonMode: true,
      systemMessages: true,
      maxContextLength: 200000,
      maxOutputTokens: 100000,
      parallelToolCalls: true,
    },
    inputCostPer1M: 15.0,
    outputCostPer1M: 60.0,
    contextLength: 200000,
  },
  // Google
  {
    id: 'google/gemini-2.0-flash-001',
    name: 'Gemini 2.0 Flash (via OpenRouter)',
    provider: LLMProvider.OPENROUTER,
    capabilities: {
      streaming: true,
      toolCalling: true,
      vision: true,
      jsonMode: true,
      systemMessages: true,
      maxContextLength: 1048576,
      maxOutputTokens: 8192,
      parallelToolCalls: true,
    },
    inputCostPer1M: 0.10,
    outputCostPer1M: 0.40,
    contextLength: 1048576,
  },
  // DeepSeek
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek-V3 (via OpenRouter)',
    provider: LLMProvider.OPENROUTER,
    capabilities: {
      streaming: true,
      toolCalling: true,
      vision: false,
      jsonMode: true,
      systemMessages: true,
      maxContextLength: 64000,
      maxOutputTokens: 8192,
      parallelToolCalls: true,
    },
    inputCostPer1M: 0.14,
    outputCostPer1M: 0.28,
    contextLength: 64000,
  },
  {
    id: 'deepseek/deepseek-r1',
    name: 'DeepSeek-R1 (via OpenRouter)',
    provider: LLMProvider.OPENROUTER,
    capabilities: {
      streaming: true,
      toolCalling: false,
      vision: false,
      jsonMode: true,
      systemMessages: true,
      maxContextLength: 64000,
      maxOutputTokens: 8192,
      parallelToolCalls: false,
    },
    inputCostPer1M: 0.55,
    outputCostPer1M: 2.19,
    contextLength: 64000,
  },
  // Meta
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B (via OpenRouter)',
    provider: LLMProvider.OPENROUTER,
    capabilities: {
      streaming: true,
      toolCalling: true,
      vision: false,
      jsonMode: true,
      systemMessages: true,
      maxContextLength: 128000,
      maxOutputTokens: 8192,
      parallelToolCalls: true,
    },
    inputCostPer1M: 0.35,
    outputCostPer1M: 0.40,
    contextLength: 128000,
  },
  // Mistral
  {
    id: 'mistralai/mistral-large',
    name: 'Mistral Large (via OpenRouter)',
    provider: LLMProvider.OPENROUTER,
    capabilities: {
      streaming: true,
      toolCalling: true,
      vision: true,
      jsonMode: true,
      systemMessages: true,
      maxContextLength: 128000,
      maxOutputTokens: 8192,
      parallelToolCalls: true,
    },
    inputCostPer1M: 2.0,
    outputCostPer1M: 6.0,
    contextLength: 128000,
  },
  // Qwen
  {
    id: 'qwen/qwen-2.5-72b-instruct',
    name: 'Qwen 2.5 72B (via OpenRouter)',
    provider: LLMProvider.OPENROUTER,
    capabilities: {
      streaming: true,
      toolCalling: true,
      vision: false,
      jsonMode: true,
      systemMessages: true,
      maxContextLength: 128000,
      maxOutputTokens: 8192,
      parallelToolCalls: true,
    },
    inputCostPer1M: 0.35,
    outputCostPer1M: 0.40,
    contextLength: 128000,
  },
];

const DEFAULT_MODEL = 'anthropic/claude-sonnet-4';

/**
 * OpenRouter LLM Provider
 */
export class OpenRouterLLM extends BaseLLM {
  readonly provider = LLMProvider.OPENROUTER;

  get capabilities(): LLMCapabilities {
    const model = OPENROUTER_MODELS.find((m) => m.id === this.model);
    return (
      model?.capabilities || {
        streaming: true,
        toolCalling: true,
        vision: true,
        jsonMode: true,
        systemMessages: true,
        maxContextLength: 128000,
        maxOutputTokens: 8192,
      }
    );
  }

  protected getEnvKeyName(): string {
    return 'OPENROUTER_API_KEY';
  }

  protected getDefaultBaseUrl(): string {
    return 'https://openrouter.ai/api';
  }

  protected getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
    };

    // OpenRouter recommends including these headers
    if (process.env.OPENROUTER_SITE_URL) {
      headers['HTTP-Referer'] = process.env.OPENROUTER_SITE_URL;
    }
    if (process.env.OPENROUTER_SITE_NAME) {
      headers['X-Title'] = process.env.OPENROUTER_SITE_NAME;
    }

    return headers;
  }

  getModelInfo(): ModelInfo {
    const model = OPENROUTER_MODELS.find((m) => m.id === this.model);
    if (!model) {
      return {
        id: this.model,
        name: this.model,
        provider: LLMProvider.OPENROUTER,
        capabilities: this.capabilities,
        contextLength: 128000,
      };
    }
    return model;
  }

  async chat(messages: LLMMessage[], options?: ChatOptions): Promise<LLMResponse> {
    const body = this.buildRequestBody(messages, options);

    const response = await this.makeRequest<OpenRouterResponse>(
      '/v1/chat/completions',
      body,
      options
    );

    return this.parseResponse(response);
  }

  async *stream(
    messages: LLMMessage[],
    options?: StreamOptions
  ): AsyncIterable<LLMStreamChunk> {
    const body = this.buildRequestBody(messages, options);
    body.stream = true;

    const toolCalls: Map<number, Partial<ToolCall>> = new Map();
    let usage: LLMUsage | undefined;

    for await (const chunk of this.makeStreamingRequest(
      '/v1/chat/completions',
      body,
      options
    )) {
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const event: OpenRouterStreamChunk = JSON.parse(data);
          const choice = event.choices?.[0];

          if (choice?.delta?.content) {
            const streamChunk: LLMStreamChunk = {
              content: choice.delta.content,
              done: false,
            };
            options?.onChunk?.(streamChunk);
            yield streamChunk;
          }

          // Handle tool call deltas
          if (choice?.delta?.tool_calls) {
            for (const tc of choice.delta.tool_calls) {
              const existing = toolCalls.get(tc.index) || {};

              if (tc.id) existing.id = tc.id;
              if (tc.function?.name) existing.name = tc.function.name;
              if (tc.function?.arguments) {
                existing.arguments =
                  (existing.arguments as string || '') + tc.function.arguments;
              }

              toolCalls.set(tc.index, existing);

              yield {
                toolCallDelta: {
                  id: tc.id,
                  name: tc.function?.name,
                  arguments: tc.function?.arguments,
                },
                done: false,
              };
            }
          }

          if (event.usage) {
            usage = {
              inputTokens: event.usage.prompt_tokens,
              outputTokens: event.usage.completion_tokens,
              totalTokens: event.usage.total_tokens,
            };
          }

          if (choice?.finish_reason) {
            // Emit completed tool calls
            for (const [, tc] of toolCalls) {
              if (tc.id && tc.name) {
                options?.onToolCall?.({
                  id: tc.id,
                  name: tc.name,
                  arguments: tc.arguments as string || '{}',
                });
              }
            }

            yield {
              done: true,
              finishReason: this.mapFinishReason(choice.finish_reason),
              usage,
            };
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }

  protected buildRequestBody(
    messages: LLMMessage[],
    options?: ChatOptions
  ): Record<string, unknown> {
    const formattedMessages = this.formatMessages(messages);

    const body: Record<string, unknown> = {
      model: this.model,
      messages: formattedMessages,
    };

    if (options?.maxTokens !== undefined) {
      body.max_tokens = options.maxTokens;
    } else if (this.config.options?.maxTokens !== undefined) {
      body.max_tokens = this.config.options.maxTokens;
    }

    if (options?.temperature !== undefined) {
      body.temperature = options.temperature;
    } else if (this.config.options?.temperature !== undefined) {
      body.temperature = this.config.options.temperature;
    }

    if (options?.topP !== undefined) {
      body.top_p = options.topP;
    }

    if (options?.presencePenalty !== undefined) {
      body.presence_penalty = options.presencePenalty;
    }

    if (options?.frequencyPenalty !== undefined) {
      body.frequency_penalty = options.frequencyPenalty;
    }

    if (options?.stopSequences?.length) {
      body.stop = options.stopSequences;
    }

    if (options?.jsonMode && this.capabilities.jsonMode) {
      body.response_format = { type: 'json_object' };
    }

    if (options?.tools?.length && this.capabilities.toolCalling) {
      body.tools = this.formatTools(options.tools);

      if (options.toolChoice) {
        if (options.toolChoice === 'auto') {
          body.tool_choice = 'auto';
        } else if (options.toolChoice === 'none') {
          body.tool_choice = 'none';
        } else if (options.toolChoice === 'required') {
          body.tool_choice = 'required';
        } else if (typeof options.toolChoice === 'object') {
          body.tool_choice = {
            type: 'function',
            function: { name: options.toolChoice.name },
          };
        }
      }
    }

    // OpenRouter-specific options
    // Allow provider routing
    if (this.config.options?.headers?.['X-Provider-Order']) {
      body.provider = {
        order: this.config.options.headers['X-Provider-Order'].split(','),
      };
    }

    return body;
  }

  protected formatMessages(messages: LLMMessage[]): OpenRouterMessage[] {
    return messages.map((msg) => {
      // Handle tool results
      if (msg.role === 'tool' && msg.toolResults?.length) {
        return {
          role: 'tool' as const,
          content: msg.toolResults[0].content,
          tool_call_id: msg.toolResults[0].toolCallId,
        };
      }

      // Handle assistant messages with tool calls
      if (msg.role === 'assistant' && msg.toolCalls?.length) {
        return {
          role: 'assistant' as const,
          content: typeof msg.content === 'string' ? msg.content : null,
          tool_calls: msg.toolCalls.map((tc) => ({
            id: tc.id,
            type: 'function' as const,
            function: {
              name: tc.name,
              arguments:
                typeof tc.arguments === 'string'
                  ? tc.arguments
                  : JSON.stringify(tc.arguments),
            },
          })),
        };
      }

      // Handle string content
      if (typeof msg.content === 'string') {
        return {
          role: msg.role as 'system' | 'user' | 'assistant',
          content: msg.content,
        };
      }

      // Handle content blocks
      const content: OpenRouterContentBlock[] = [];

      for (const block of msg.content) {
        switch (block.type) {
          case 'text':
            content.push({ type: 'text', text: block.text });
            break;

          case 'image':
            if (block.source.type === 'base64' && block.source.data) {
              content.push({
                type: 'image_url',
                image_url: {
                  url: `data:${block.source.mediaType || 'image/jpeg'};base64,${block.source.data}`,
                },
              });
            } else if (block.source.type === 'url' && block.source.url) {
              content.push({
                type: 'image_url',
                image_url: { url: block.source.url },
              });
            }
            break;
        }
      }

      return {
        role: msg.role as 'system' | 'user' | 'assistant',
        content,
      };
    });
  }

  protected formatTools(tools: ToolDefinition[]): OpenRouterTool[] {
    return tools.map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: 'object',
          properties: tool.parameters.properties || {},
          required: tool.parameters.required || [],
        },
      },
    }));
  }

  protected parseToolCalls(response: OpenRouterResponse): ToolCall[] {
    const message = response.choices[0]?.message;
    if (!message?.tool_calls) return [];

    return message.tool_calls.map((tc) => ({
      id: tc.id,
      name: tc.function.name,
      arguments: tc.function.arguments,
    }));
  }

  protected extractContent(response: OpenRouterResponse): string {
    return response.choices[0]?.message?.content || '';
  }

  protected extractUsage(response: OpenRouterResponse): LLMUsage {
    return {
      inputTokens: response.usage.prompt_tokens,
      outputTokens: response.usage.completion_tokens,
      totalTokens: response.usage.total_tokens,
    };
  }

  private mapFinishReason(
    reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null
  ): FinishReason {
    switch (reason) {
      case 'stop':
        return 'stop';
      case 'length':
        return 'length';
      case 'tool_calls':
        return 'tool_calls';
      case 'content_filter':
        return 'content_filter';
      default:
        return 'stop';
    }
  }

  private parseResponse(response: OpenRouterResponse): LLMResponse {
    const content = this.extractContent(response);
    const toolCalls = this.parseToolCalls(response);
    const usage = this.extractUsage(response);
    const finishReason = this.mapFinishReason(response.choices[0]?.finish_reason);

    return {
      content,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      usage,
      finishReason,
      model: response.model,
      id: response.id,
      raw: response,
    };
  }

  /**
   * Get list of available models from OpenRouter
   */
  async listModels(): Promise<ModelInfo[]> {
    const response = await fetch(`${this.baseUrl}/v1/models`, {
      headers: this.buildHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to list models: ${response.statusText}`);
    }

    const data = (await response.json()) as {
      data: {
        id: string;
        name: string;
        context_length: number;
        pricing: {
          prompt: string;
          completion: string;
        };
      }[];
    };

    return data.data.map((m) => ({
      id: m.id,
      name: m.name,
      provider: LLMProvider.OPENROUTER,
      capabilities: this.capabilities,
      contextLength: m.context_length,
      inputCostPer1M: parseFloat(m.pricing.prompt) * 1_000_000,
      outputCostPer1M: parseFloat(m.pricing.completion) * 1_000_000,
    }));
  }
}

/**
 * Get available OpenRouter models (popular ones)
 */
export function getOpenRouterModels(): ModelInfo[] {
  return OPENROUTER_MODELS;
}

/**
 * Create an OpenRouter LLM instance
 */
export function createOpenRouter(config?: Partial<LLMConfig>): OpenRouterLLM {
  return new OpenRouterLLM({
    provider: LLMProvider.OPENROUTER,
    model: config?.model || DEFAULT_MODEL,
    ...config,
  });
}
