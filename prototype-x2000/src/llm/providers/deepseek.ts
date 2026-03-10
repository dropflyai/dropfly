/**
 * DeepSeek Provider
 *
 * Supports DeepSeek-V3, DeepSeek-R1, DeepSeek-Coder.
 * Features: Tool calling (OpenAI-compatible API), streaming.
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
 * DeepSeek uses OpenAI-compatible API format
 */
interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  name?: string;
  tool_calls?: DeepSeekToolCall[];
  tool_call_id?: string;
}

interface DeepSeekToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

interface DeepSeekTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string | null;
      tool_calls?: DeepSeekToolCall[];
    };
    finish_reason: 'stop' | 'length' | 'tool_calls' | null;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface DeepSeekStreamChunk {
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
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Model definitions for DeepSeek
 */
const DEEPSEEK_MODELS: ModelInfo[] = [
  {
    id: 'deepseek-chat',
    name: 'DeepSeek-V3',
    provider: LLMProvider.DEEPSEEK,
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
    inputCostPer1M: 0.27,
    outputCostPer1M: 1.10,
    contextLength: 64000,
    releaseDate: '2024-12-26',
  },
  {
    id: 'deepseek-reasoner',
    name: 'DeepSeek-R1',
    provider: LLMProvider.DEEPSEEK,
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
    releaseDate: '2025-01-20',
  },
  {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    provider: LLMProvider.DEEPSEEK,
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
    inputCostPer1M: 0.14,
    outputCostPer1M: 0.28,
    contextLength: 128000,
    releaseDate: '2024-02-05',
  },
];

const DEFAULT_MODEL = 'deepseek-chat';

/**
 * DeepSeek LLM Provider
 */
export class DeepSeekLLM extends BaseLLM {
  readonly provider = LLMProvider.DEEPSEEK;

  get capabilities(): LLMCapabilities {
    const model = DEEPSEEK_MODELS.find((m) => m.id === this.model);
    return (
      model?.capabilities || {
        streaming: true,
        toolCalling: true,
        vision: false,
        jsonMode: true,
        systemMessages: true,
        maxContextLength: 64000,
        maxOutputTokens: 8192,
      }
    );
  }

  protected getEnvKeyName(): string {
    return 'DEEPSEEK_API_KEY';
  }

  protected getDefaultBaseUrl(): string {
    return 'https://api.deepseek.com';
  }

  protected getAuthHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  getModelInfo(): ModelInfo {
    const model = DEEPSEEK_MODELS.find((m) => m.id === this.model);
    if (!model) {
      return {
        id: this.model,
        name: this.model,
        provider: LLMProvider.DEEPSEEK,
        capabilities: this.capabilities,
        contextLength: 64000,
      };
    }
    return model;
  }

  async chat(messages: LLMMessage[], options?: ChatOptions): Promise<LLMResponse> {
    const body = this.buildRequestBody(messages, options);

    const response = await this.makeRequest<DeepSeekResponse>(
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
          const event: DeepSeekStreamChunk = JSON.parse(data);
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

    return body;
  }

  protected formatMessages(messages: LLMMessage[]): DeepSeekMessage[] {
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

  protected formatTools(tools: ToolDefinition[]): DeepSeekTool[] {
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

  protected parseToolCalls(response: DeepSeekResponse): ToolCall[] {
    const message = response.choices[0]?.message;
    if (!message?.tool_calls) return [];

    return message.tool_calls.map((tc) => ({
      id: tc.id,
      name: tc.function.name,
      arguments: tc.function.arguments,
    }));
  }

  protected extractContent(response: DeepSeekResponse): string {
    return response.choices[0]?.message?.content || '';
  }

  protected extractUsage(response: DeepSeekResponse): LLMUsage {
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

  private parseResponse(response: DeepSeekResponse): LLMResponse {
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
 * Get available DeepSeek models
 */
export function getDeepSeekModels(): ModelInfo[] {
  return DEEPSEEK_MODELS;
}

/**
 * Create a DeepSeek LLM instance
 */
export function createDeepSeek(config?: Partial<LLMConfig>): DeepSeekLLM {
  return new DeepSeekLLM({
    provider: LLMProvider.DEEPSEEK,
    model: config?.model || DEFAULT_MODEL,
    ...config,
  });
}
