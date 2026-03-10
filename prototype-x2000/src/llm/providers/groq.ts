/**
 * Groq Provider (Fast Inference)
 *
 * Supports Llama 3.3, Mixtral, Gemma.
 * Features: Ultra-fast inference, OpenAI-compatible API.
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
 * Groq uses OpenAI-compatible API format
 */
interface GroqMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  name?: string;
  tool_calls?: GroqToolCall[];
  tool_call_id?: string;
}

interface GroqToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

interface GroqTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

interface GroqResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string | null;
      tool_calls?: GroqToolCall[];
    };
    finish_reason: 'stop' | 'length' | 'tool_calls' | null;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  x_groq?: {
    id: string;
  };
}

interface GroqStreamChunk {
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
    finish_reason: 'stop' | 'length' | 'tool_calls' | null;
  }[];
  x_groq?: {
    id: string;
    usage?: {
      queue_time: number;
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
}

/**
 * Model definitions for Groq
 */
const GROQ_MODELS: ModelInfo[] = [
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B',
    provider: LLMProvider.GROQ,
    capabilities: {
      streaming: true,
      toolCalling: true,
      vision: false,
      jsonMode: true,
      systemMessages: true,
      maxContextLength: 128000,
      maxOutputTokens: 32768,
      parallelToolCalls: true,
    },
    inputCostPer1M: 0.59,
    outputCostPer1M: 0.79,
    contextLength: 128000,
    releaseDate: '2024-12-06',
  },
  {
    id: 'llama-3.1-70b-versatile',
    name: 'Llama 3.1 70B',
    provider: LLMProvider.GROQ,
    capabilities: {
      streaming: true,
      toolCalling: true,
      vision: false,
      jsonMode: true,
      systemMessages: true,
      maxContextLength: 128000,
      maxOutputTokens: 8000,
      parallelToolCalls: true,
    },
    inputCostPer1M: 0.59,
    outputCostPer1M: 0.79,
    contextLength: 128000,
    releaseDate: '2024-07-23',
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B',
    provider: LLMProvider.GROQ,
    capabilities: {
      streaming: true,
      toolCalling: true,
      vision: false,
      jsonMode: true,
      systemMessages: true,
      maxContextLength: 128000,
      maxOutputTokens: 8000,
      parallelToolCalls: true,
    },
    inputCostPer1M: 0.05,
    outputCostPer1M: 0.08,
    contextLength: 128000,
    releaseDate: '2024-07-23',
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B',
    provider: LLMProvider.GROQ,
    capabilities: {
      streaming: true,
      toolCalling: true,
      vision: false,
      jsonMode: true,
      systemMessages: true,
      maxContextLength: 32768,
      maxOutputTokens: 32768,
      parallelToolCalls: true,
    },
    inputCostPer1M: 0.24,
    outputCostPer1M: 0.24,
    contextLength: 32768,
    releaseDate: '2024-01-08',
  },
  {
    id: 'gemma2-9b-it',
    name: 'Gemma 2 9B',
    provider: LLMProvider.GROQ,
    capabilities: {
      streaming: true,
      toolCalling: true,
      vision: false,
      jsonMode: true,
      systemMessages: true,
      maxContextLength: 8192,
      maxOutputTokens: 8192,
      parallelToolCalls: true,
    },
    inputCostPer1M: 0.20,
    outputCostPer1M: 0.20,
    contextLength: 8192,
    releaseDate: '2024-06-27',
  },
  {
    id: 'llama-3.2-90b-vision-preview',
    name: 'Llama 3.2 90B Vision',
    provider: LLMProvider.GROQ,
    capabilities: {
      streaming: true,
      toolCalling: true,
      vision: true,
      jsonMode: true,
      systemMessages: true,
      maxContextLength: 8192,
      maxOutputTokens: 8192,
      parallelToolCalls: true,
    },
    inputCostPer1M: 0.90,
    outputCostPer1M: 0.90,
    contextLength: 8192,
    releaseDate: '2024-09-25',
  },
  {
    id: 'deepseek-r1-distill-llama-70b',
    name: 'DeepSeek R1 Distill Llama 70B',
    provider: LLMProvider.GROQ,
    capabilities: {
      streaming: true,
      toolCalling: false,
      vision: false,
      jsonMode: true,
      systemMessages: true,
      maxContextLength: 128000,
      maxOutputTokens: 16384,
      parallelToolCalls: false,
    },
    inputCostPer1M: 0.75,
    outputCostPer1M: 0.99,
    contextLength: 128000,
    releaseDate: '2025-01-28',
  },
];

const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

/**
 * Groq LLM Provider
 */
export class GroqLLM extends BaseLLM {
  readonly provider = LLMProvider.GROQ;

  get capabilities(): LLMCapabilities {
    const model = GROQ_MODELS.find((m) => m.id === this.model);
    return (
      model?.capabilities || {
        streaming: true,
        toolCalling: true,
        vision: false,
        jsonMode: true,
        systemMessages: true,
        maxContextLength: 128000,
        maxOutputTokens: 8000,
      }
    );
  }

  protected getEnvKeyName(): string {
    return 'GROQ_API_KEY';
  }

  protected getDefaultBaseUrl(): string {
    return 'https://api.groq.com/openai';
  }

  protected getAuthHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  getModelInfo(): ModelInfo {
    const model = GROQ_MODELS.find((m) => m.id === this.model);
    if (!model) {
      return {
        id: this.model,
        name: this.model,
        provider: LLMProvider.GROQ,
        capabilities: this.capabilities,
        contextLength: 128000,
      };
    }
    return model;
  }

  async chat(messages: LLMMessage[], options?: ChatOptions): Promise<LLMResponse> {
    const body = this.buildRequestBody(messages, options);

    const response = await this.makeRequest<GroqResponse>(
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
          const event: GroqStreamChunk = JSON.parse(data);
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

          // Groq provides usage in x_groq field during streaming
          if (event.x_groq?.usage) {
            usage = {
              inputTokens: event.x_groq.usage.prompt_tokens,
              outputTokens: event.x_groq.usage.completion_tokens,
              totalTokens: event.x_groq.usage.total_tokens,
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

    return body;
  }

  protected formatMessages(messages: LLMMessage[]): GroqMessage[] {
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
      return {
        role: msg.role as 'system' | 'user' | 'assistant',
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
      };
    });
  }

  protected formatTools(tools: ToolDefinition[]): GroqTool[] {
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

  protected parseToolCalls(response: GroqResponse): ToolCall[] {
    const message = response.choices[0]?.message;
    if (!message?.tool_calls) return [];

    return message.tool_calls.map((tc) => ({
      id: tc.id,
      name: tc.function.name,
      arguments: tc.function.arguments,
    }));
  }

  protected extractContent(response: GroqResponse): string {
    return response.choices[0]?.message?.content || '';
  }

  protected extractUsage(response: GroqResponse): LLMUsage {
    return {
      inputTokens: response.usage.prompt_tokens,
      outputTokens: response.usage.completion_tokens,
      totalTokens: response.usage.total_tokens,
    };
  }

  private mapFinishReason(
    reason: 'stop' | 'length' | 'tool_calls' | null
  ): FinishReason {
    switch (reason) {
      case 'stop':
        return 'stop';
      case 'length':
        return 'length';
      case 'tool_calls':
        return 'tool_calls';
      default:
        return 'stop';
    }
  }

  private parseResponse(response: GroqResponse): LLMResponse {
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
}

/**
 * Get available Groq models
 */
export function getGroqModels(): ModelInfo[] {
  return GROQ_MODELS;
}

/**
 * Create a Groq LLM instance
 */
export function createGroq(config?: Partial<LLMConfig>): GroqLLM {
  return new GroqLLM({
    provider: LLMProvider.GROQ,
    model: config?.model || DEFAULT_MODEL,
    ...config,
  });
}
