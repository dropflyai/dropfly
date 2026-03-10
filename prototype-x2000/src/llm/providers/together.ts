/**
 * Together AI Provider
 *
 * Supports Llama, Mistral, CodeLlama, and more.
 * Features: OpenAI-compatible API, tool calling.
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
 * Together AI uses OpenAI-compatible API format
 */
interface TogetherMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  name?: string;
  tool_calls?: TogetherToolCall[];
  tool_call_id?: string;
}

interface TogetherToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

interface TogetherTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

interface TogetherResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string | null;
      tool_calls?: TogetherToolCall[];
    };
    finish_reason: 'stop' | 'length' | 'tool_calls' | 'eos' | null;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface TogetherStreamChunk {
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
    finish_reason: 'stop' | 'length' | 'tool_calls' | 'eos' | null;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Model definitions for Together AI
 */
const TOGETHER_MODELS: ModelInfo[] = [
  {
    id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    name: 'Llama 3.3 70B Turbo',
    provider: LLMProvider.TOGETHER,
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
    inputCostPer1M: 0.88,
    outputCostPer1M: 0.88,
    contextLength: 128000,
    releaseDate: '2024-12-06',
  },
  {
    id: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo',
    name: 'Llama 3.1 405B Turbo',
    provider: LLMProvider.TOGETHER,
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
    inputCostPer1M: 3.50,
    outputCostPer1M: 3.50,
    contextLength: 128000,
    releaseDate: '2024-07-23',
  },
  {
    id: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
    name: 'Llama 3.1 70B Turbo',
    provider: LLMProvider.TOGETHER,
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
    inputCostPer1M: 0.88,
    outputCostPer1M: 0.88,
    contextLength: 128000,
    releaseDate: '2024-07-23',
  },
  {
    id: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
    name: 'Llama 3.1 8B Turbo',
    provider: LLMProvider.TOGETHER,
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
    inputCostPer1M: 0.18,
    outputCostPer1M: 0.18,
    contextLength: 128000,
    releaseDate: '2024-07-23',
  },
  {
    id: 'mistralai/Mixtral-8x22B-Instruct-v0.1',
    name: 'Mixtral 8x22B',
    provider: LLMProvider.TOGETHER,
    capabilities: {
      streaming: true,
      toolCalling: true,
      vision: false,
      jsonMode: true,
      systemMessages: true,
      maxContextLength: 65536,
      maxOutputTokens: 8192,
      parallelToolCalls: true,
    },
    inputCostPer1M: 1.20,
    outputCostPer1M: 1.20,
    contextLength: 65536,
    releaseDate: '2024-04-17',
  },
  {
    id: 'mistralai/Mistral-7B-Instruct-v0.3',
    name: 'Mistral 7B v0.3',
    provider: LLMProvider.TOGETHER,
    capabilities: {
      streaming: true,
      toolCalling: true,
      vision: false,
      jsonMode: true,
      systemMessages: true,
      maxContextLength: 32768,
      maxOutputTokens: 8192,
      parallelToolCalls: true,
    },
    inputCostPer1M: 0.20,
    outputCostPer1M: 0.20,
    contextLength: 32768,
    releaseDate: '2024-05-22',
  },
  {
    id: 'Qwen/Qwen2.5-72B-Instruct-Turbo',
    name: 'Qwen 2.5 72B Turbo',
    provider: LLMProvider.TOGETHER,
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
    inputCostPer1M: 1.20,
    outputCostPer1M: 1.20,
    contextLength: 128000,
    releaseDate: '2024-09-19',
  },
  {
    id: 'deepseek-ai/DeepSeek-R1',
    name: 'DeepSeek R1',
    provider: LLMProvider.TOGETHER,
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
    inputCostPer1M: 3.00,
    outputCostPer1M: 7.00,
    contextLength: 64000,
    releaseDate: '2025-01-20',
  },
  {
    id: 'meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo',
    name: 'Llama 3.2 90B Vision',
    provider: LLMProvider.TOGETHER,
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
    inputCostPer1M: 1.20,
    outputCostPer1M: 1.20,
    contextLength: 128000,
    releaseDate: '2024-09-25',
  },
];

const DEFAULT_MODEL = 'meta-llama/Llama-3.3-70B-Instruct-Turbo';

/**
 * Together AI LLM Provider
 */
export class TogetherLLM extends BaseLLM {
  readonly provider = LLMProvider.TOGETHER;

  get capabilities(): LLMCapabilities {
    const model = TOGETHER_MODELS.find((m) => m.id === this.model);
    return (
      model?.capabilities || {
        streaming: true,
        toolCalling: true,
        vision: false,
        jsonMode: true,
        systemMessages: true,
        maxContextLength: 128000,
        maxOutputTokens: 8192,
      }
    );
  }

  protected getEnvKeyName(): string {
    return 'TOGETHER_API_KEY';
  }

  protected getDefaultBaseUrl(): string {
    return 'https://api.together.xyz';
  }

  protected getAuthHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  getModelInfo(): ModelInfo {
    const model = TOGETHER_MODELS.find((m) => m.id === this.model);
    if (!model) {
      return {
        id: this.model,
        name: this.model,
        provider: LLMProvider.TOGETHER,
        capabilities: this.capabilities,
        contextLength: 128000,
      };
    }
    return model;
  }

  async chat(messages: LLMMessage[], options?: ChatOptions): Promise<LLMResponse> {
    const body = this.buildRequestBody(messages, options);

    const response = await this.makeRequest<TogetherResponse>(
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
          const event: TogetherStreamChunk = JSON.parse(data);
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

    if (options?.topK !== undefined) {
      body.top_k = options.topK;
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

  protected formatMessages(messages: LLMMessage[]): TogetherMessage[] {
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

  protected formatTools(tools: ToolDefinition[]): TogetherTool[] {
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

  protected parseToolCalls(response: TogetherResponse): ToolCall[] {
    const message = response.choices[0]?.message;
    if (!message?.tool_calls) return [];

    return message.tool_calls.map((tc) => ({
      id: tc.id,
      name: tc.function.name,
      arguments: tc.function.arguments,
    }));
  }

  protected extractContent(response: TogetherResponse): string {
    return response.choices[0]?.message?.content || '';
  }

  protected extractUsage(response: TogetherResponse): LLMUsage {
    return {
      inputTokens: response.usage.prompt_tokens,
      outputTokens: response.usage.completion_tokens,
      totalTokens: response.usage.total_tokens,
    };
  }

  private mapFinishReason(
    reason: 'stop' | 'length' | 'tool_calls' | 'eos' | null
  ): FinishReason {
    switch (reason) {
      case 'stop':
      case 'eos':
        return 'stop';
      case 'length':
        return 'length';
      case 'tool_calls':
        return 'tool_calls';
      default:
        return 'stop';
    }
  }

  private parseResponse(response: TogetherResponse): LLMResponse {
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
 * Get available Together AI models
 */
export function getTogetherModels(): ModelInfo[] {
  return TOGETHER_MODELS;
}

/**
 * Create a Together AI LLM instance
 */
export function createTogether(config?: Partial<LLMConfig>): TogetherLLM {
  return new TogetherLLM({
    provider: LLMProvider.TOGETHER,
    model: config?.model || DEFAULT_MODEL,
    ...config,
  });
}
