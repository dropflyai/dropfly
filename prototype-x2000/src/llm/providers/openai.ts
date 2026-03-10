/**
 * OpenAI Provider
 *
 * Supports GPT-4o, GPT-4o-mini, GPT-4.5, o1, o3.
 * Features: Function calling, vision support, JSON mode, streaming.
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
 * OpenAI API message format
 */
interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | OpenAIContentBlock[] | null;
  name?: string;
  tool_calls?: OpenAIToolCall[];
  tool_call_id?: string;
}

interface OpenAIContentBlock {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
    detail?: 'low' | 'high' | 'auto';
  };
}

interface OpenAIToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

interface OpenAITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string | null;
      tool_calls?: OpenAIToolCall[];
    };
    finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OpenAIStreamChunk {
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
 * Model definitions for OpenAI
 */
const OPENAI_MODELS: ModelInfo[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: LLMProvider.OPENAI,
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
    releaseDate: '2024-05-13',
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: LLMProvider.OPENAI,
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
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.6,
    contextLength: 128000,
    releaseDate: '2024-07-18',
  },
  {
    id: 'gpt-4.5-preview',
    name: 'GPT-4.5 Preview',
    provider: LLMProvider.OPENAI,
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
    inputCostPer1M: 75.0,
    outputCostPer1M: 150.0,
    contextLength: 128000,
    releaseDate: '2025-02-27',
  },
  {
    id: 'o1',
    name: 'o1',
    provider: LLMProvider.OPENAI,
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
    releaseDate: '2024-12-17',
  },
  {
    id: 'o1-mini',
    name: 'o1 Mini',
    provider: LLMProvider.OPENAI,
    capabilities: {
      streaming: true,
      toolCalling: true,
      vision: true,
      jsonMode: true,
      systemMessages: true,
      maxContextLength: 128000,
      maxOutputTokens: 65536,
      parallelToolCalls: true,
    },
    inputCostPer1M: 3.0,
    outputCostPer1M: 12.0,
    contextLength: 128000,
    releaseDate: '2024-09-12',
  },
  {
    id: 'o3-mini',
    name: 'o3 Mini',
    provider: LLMProvider.OPENAI,
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
    inputCostPer1M: 1.1,
    outputCostPer1M: 4.4,
    contextLength: 200000,
    releaseDate: '2025-01-31',
  },
];

const DEFAULT_MODEL = 'gpt-4o';

/**
 * OpenAI LLM Provider
 */
export class OpenAILLM extends BaseLLM {
  readonly provider = LLMProvider.OPENAI;

  get capabilities(): LLMCapabilities {
    const model = OPENAI_MODELS.find((m) => m.id === this.model);
    return (
      model?.capabilities || {
        streaming: true,
        toolCalling: true,
        vision: true,
        jsonMode: true,
        systemMessages: true,
        maxContextLength: 128000,
        maxOutputTokens: 16384,
      }
    );
  }

  protected getEnvKeyName(): string {
    return 'OPENAI_API_KEY';
  }

  protected getDefaultBaseUrl(): string {
    return 'https://api.openai.com';
  }

  protected getAuthHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  getModelInfo(): ModelInfo {
    const model = OPENAI_MODELS.find((m) => m.id === this.model);
    if (!model) {
      return {
        id: this.model,
        name: this.model,
        provider: LLMProvider.OPENAI,
        capabilities: this.capabilities,
        contextLength: 128000,
      };
    }
    return model;
  }

  async chat(messages: LLMMessage[], options?: ChatOptions): Promise<LLMResponse> {
    const body = this.buildRequestBody(messages, options);

    const response = await this.makeRequest<OpenAIResponse>(
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
    body.stream_options = { include_usage: true };

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
          const event: OpenAIStreamChunk = JSON.parse(data);
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

    if (options?.tools?.length) {
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

  protected formatMessages(messages: LLMMessage[]): OpenAIMessage[] {
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
      const content: OpenAIContentBlock[] = [];

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

  protected formatTools(tools: ToolDefinition[]): OpenAITool[] {
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

  protected parseToolCalls(response: OpenAIResponse): ToolCall[] {
    const message = response.choices[0]?.message;
    if (!message?.tool_calls) return [];

    return message.tool_calls.map((tc) => ({
      id: tc.id,
      name: tc.function.name,
      arguments: tc.function.arguments,
    }));
  }

  protected extractContent(response: OpenAIResponse): string {
    return response.choices[0]?.message?.content || '';
  }

  protected extractUsage(response: OpenAIResponse): LLMUsage {
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

  private parseResponse(response: OpenAIResponse): LLMResponse {
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
 * Get available OpenAI models
 */
export function getOpenAIModels(): ModelInfo[] {
  return OPENAI_MODELS;
}

/**
 * Create an OpenAI LLM instance
 */
export function createOpenAI(config?: Partial<LLMConfig>): OpenAILLM {
  return new OpenAILLM({
    provider: LLMProvider.OPENAI,
    model: config?.model || DEFAULT_MODEL,
    ...config,
  });
}
