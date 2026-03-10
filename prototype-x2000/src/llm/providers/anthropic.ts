/**
 * Anthropic/Claude Provider
 *
 * Supports Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus, and Claude 4.
 * Features: Native tool calling, vision support, streaming.
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
  LLMError,
  LLMErrorType,
  ToolDefinition,
  ToolCall,
  ChatOptions,
  StreamOptions,
  ModelInfo,
  ContentBlock,
  FinishReason,
} from '../types.js';

/**
 * Anthropic API message format
 */
interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string | AnthropicContentBlock[];
}

interface AnthropicContentBlock {
  type: 'text' | 'image' | 'tool_use' | 'tool_result';
  text?: string;
  source?: {
    type: 'base64';
    media_type: string;
    data: string;
  };
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
  tool_use_id?: string;
  content?: string;
  is_error?: boolean;
}

interface AnthropicTool {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface AnthropicResponse {
  id: string;
  type: string;
  role: string;
  content: AnthropicContentBlock[];
  model: string;
  stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use';
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

interface AnthropicStreamEvent {
  type: string;
  message?: Partial<AnthropicResponse>;
  index?: number;
  content_block?: AnthropicContentBlock;
  delta?: {
    type: string;
    text?: string;
    partial_json?: string;
  };
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
}

/**
 * Model definitions for Anthropic
 */
const ANTHROPIC_MODELS: ModelInfo[] = [
  {
    id: 'claude-opus-4-20250514',
    name: 'Claude Opus 4',
    provider: LLMProvider.ANTHROPIC,
    capabilities: {
      streaming: true,
      toolCalling: true,
      vision: true,
      jsonMode: false,
      systemMessages: true,
      maxContextLength: 200000,
      maxOutputTokens: 32000,
      parallelToolCalls: true,
    },
    inputCostPer1M: 15.0,
    outputCostPer1M: 75.0,
    contextLength: 200000,
    releaseDate: '2025-05-14',
  },
  {
    id: 'claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    provider: LLMProvider.ANTHROPIC,
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
    releaseDate: '2025-05-14',
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: LLMProvider.ANTHROPIC,
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
    releaseDate: '2024-10-22',
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: LLMProvider.ANTHROPIC,
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
    inputCostPer1M: 1.0,
    outputCostPer1M: 5.0,
    contextLength: 200000,
    releaseDate: '2024-10-22',
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: LLMProvider.ANTHROPIC,
    capabilities: {
      streaming: true,
      toolCalling: true,
      vision: true,
      jsonMode: false,
      systemMessages: true,
      maxContextLength: 200000,
      maxOutputTokens: 4096,
      parallelToolCalls: true,
    },
    inputCostPer1M: 15.0,
    outputCostPer1M: 75.0,
    contextLength: 200000,
    releaseDate: '2024-02-29',
  },
];

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

/**
 * Anthropic LLM Provider
 */
export class AnthropicLLM extends BaseLLM {
  readonly provider = LLMProvider.ANTHROPIC;

  get capabilities(): LLMCapabilities {
    const model = ANTHROPIC_MODELS.find((m) => m.id === this.model);
    return (
      model?.capabilities || {
        streaming: true,
        toolCalling: true,
        vision: true,
        jsonMode: false,
        systemMessages: true,
        maxContextLength: 200000,
        maxOutputTokens: 8192,
      }
    );
  }

  protected getEnvKeyName(): string {
    return 'ANTHROPIC_API_KEY';
  }

  protected getDefaultBaseUrl(): string {
    return 'https://api.anthropic.com';
  }

  protected getAuthHeaders(): Record<string, string> {
    return {
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01',
    };
  }

  getModelInfo(): ModelInfo {
    const model = ANTHROPIC_MODELS.find((m) => m.id === this.model);
    if (!model) {
      // Return a default model info for custom models
      return {
        id: this.model,
        name: this.model,
        provider: LLMProvider.ANTHROPIC,
        capabilities: this.capabilities,
        contextLength: 200000,
      };
    }
    return model;
  }

  async chat(messages: LLMMessage[], options?: ChatOptions): Promise<LLMResponse> {
    const body = this.buildRequestBody(messages, options);

    const response = await this.makeRequest<AnthropicResponse>('/v1/messages', body, options);

    return this.parseResponse(response);
  }

  async *stream(
    messages: LLMMessage[],
    options?: StreamOptions
  ): AsyncIterable<LLMStreamChunk> {
    const body = this.buildRequestBody(messages, options);
    body.stream = true;

    let currentToolCall: Partial<ToolCall> | null = null;
    let usage: LLMUsage | undefined;

    for await (const chunk of this.makeStreamingRequest('/v1/messages', body, options)) {
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const event: AnthropicStreamEvent = JSON.parse(data);

          switch (event.type) {
            case 'content_block_start':
              if (event.content_block?.type === 'tool_use') {
                currentToolCall = {
                  id: event.content_block.id,
                  name: event.content_block.name,
                  arguments: '',
                };
              }
              break;

            case 'content_block_delta':
              if (event.delta?.type === 'text_delta') {
                const streamChunk: LLMStreamChunk = {
                  content: event.delta.text,
                  done: false,
                };
                options?.onChunk?.(streamChunk);
                yield streamChunk;
              } else if (event.delta?.type === 'input_json_delta' && currentToolCall) {
                currentToolCall.arguments =
                  (currentToolCall.arguments as string) + (event.delta.partial_json || '');
                yield {
                  toolCallDelta: {
                    id: currentToolCall.id,
                    name: currentToolCall.name,
                    arguments: event.delta.partial_json,
                  },
                  done: false,
                };
              }
              break;

            case 'content_block_stop':
              if (currentToolCall) {
                const toolCall: ToolCall = {
                  id: currentToolCall.id!,
                  name: currentToolCall.name!,
                  arguments: currentToolCall.arguments as string,
                };
                options?.onToolCall?.(toolCall);
                currentToolCall = null;
              }
              break;

            case 'message_delta':
              if (event.usage) {
                usage = {
                  inputTokens: usage?.inputTokens || 0,
                  outputTokens: event.usage.output_tokens || 0,
                  totalTokens: (usage?.inputTokens || 0) + (event.usage.output_tokens || 0),
                };
              }
              break;

            case 'message_start':
              if (event.message?.usage) {
                usage = {
                  inputTokens: event.message.usage.input_tokens,
                  outputTokens: 0,
                  totalTokens: event.message.usage.input_tokens,
                };
              }
              break;

            case 'message_stop':
              const finalChunk: LLMStreamChunk = {
                done: true,
                finishReason: 'stop',
                usage,
              };
              yield finalChunk;
              break;
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
    const systemPrompt = this.extractSystemPrompt(messages, options);
    const formattedMessages = this.formatMessages(
      messages.filter((m) => m.role !== 'system')
    );

    const body: Record<string, unknown> = {
      model: this.model,
      messages: formattedMessages,
      max_tokens: options?.maxTokens || this.config.options?.maxTokens || 4096,
    };

    if (systemPrompt) {
      body.system = systemPrompt;
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

    if (options?.stopSequences?.length) {
      body.stop_sequences = options.stopSequences;
    }

    if (options?.tools?.length) {
      body.tools = this.formatTools(options.tools);

      if (options.toolChoice) {
        if (options.toolChoice === 'auto') {
          body.tool_choice = { type: 'auto' };
        } else if (options.toolChoice === 'none') {
          body.tool_choice = { type: 'none' };
        } else if (options.toolChoice === 'required') {
          body.tool_choice = { type: 'any' };
        } else if (typeof options.toolChoice === 'object') {
          body.tool_choice = { type: 'tool', name: options.toolChoice.name };
        }
      }
    }

    return body;
  }

  protected extractSystemPrompt(messages: LLMMessage[], options?: ChatOptions): string {
    // Check options first
    if (options?.systemPrompt) {
      return options.systemPrompt;
    }

    // Check config
    if (this.config.options?.systemPrompt) {
      return this.config.options.systemPrompt;
    }

    // Extract from messages
    const systemMessages = messages.filter((m) => m.role === 'system');
    if (systemMessages.length > 0) {
      return systemMessages
        .map((m) => (typeof m.content === 'string' ? m.content : ''))
        .join('\n\n');
    }

    return '';
  }

  protected formatMessages(messages: LLMMessage[]): AnthropicMessage[] {
    return messages
      .filter((m) => m.role !== 'system')
      .map((msg) => {
        const role = msg.role === 'assistant' ? 'assistant' : 'user';

        // Handle tool results
        if (msg.role === 'tool' && msg.toolResults?.length) {
          return {
            role: 'user' as const,
            content: msg.toolResults.map((result) => ({
              type: 'tool_result' as const,
              tool_use_id: result.toolCallId,
              content: result.content,
              is_error: result.isError,
            })),
          };
        }

        // Handle string content
        if (typeof msg.content === 'string') {
          return { role, content: msg.content };
        }

        // Handle content blocks
        const content: AnthropicContentBlock[] = [];

        for (const block of msg.content) {
          switch (block.type) {
            case 'text':
              content.push({ type: 'text', text: block.text });
              break;

            case 'image':
              if (block.source.type === 'base64' && block.source.data) {
                content.push({
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: block.source.mediaType || 'image/jpeg',
                    data: block.source.data,
                  },
                });
              }
              break;

            case 'tool_use':
              content.push({
                type: 'tool_use',
                id: block.id,
                name: block.name,
                input: block.input,
              });
              break;

            case 'tool_result':
              content.push({
                type: 'tool_result',
                tool_use_id: block.toolUseId,
                content: block.content,
                is_error: block.isError,
              });
              break;
          }
        }

        return { role, content };
      });
  }

  protected formatTools(tools: ToolDefinition[]): AnthropicTool[] {
    return tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: {
        type: 'object',
        properties: tool.parameters.properties || {},
        required: tool.parameters.required,
      },
    }));
  }

  protected parseToolCalls(response: AnthropicResponse): ToolCall[] {
    const toolCalls: ToolCall[] = [];

    for (const block of response.content) {
      if (block.type === 'tool_use') {
        toolCalls.push({
          id: block.id!,
          name: block.name!,
          arguments: JSON.stringify(block.input),
        });
      }
    }

    return toolCalls;
  }

  protected extractContent(response: AnthropicResponse): string {
    const textBlocks = response.content.filter((block) => block.type === 'text');
    return textBlocks.map((block) => block.text || '').join('');
  }

  protected extractUsage(response: AnthropicResponse): LLMUsage {
    return {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      totalTokens: response.usage.input_tokens + response.usage.output_tokens,
    };
  }

  private parseResponse(response: AnthropicResponse): LLMResponse {
    const content = this.extractContent(response);
    const toolCalls = this.parseToolCalls(response);
    const usage = this.extractUsage(response);

    let finishReason: FinishReason;
    switch (response.stop_reason) {
      case 'end_turn':
        finishReason = 'stop';
        break;
      case 'max_tokens':
        finishReason = 'length';
        break;
      case 'tool_use':
        finishReason = 'tool_calls';
        break;
      default:
        finishReason = 'stop';
    }

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
 * Get available Anthropic models
 */
export function getAnthropicModels(): ModelInfo[] {
  return ANTHROPIC_MODELS;
}

/**
 * Create an Anthropic LLM instance
 */
export function createAnthropic(config?: Partial<LLMConfig>): AnthropicLLM {
  return new AnthropicLLM({
    provider: LLMProvider.ANTHROPIC,
    model: config?.model || DEFAULT_MODEL,
    ...config,
  });
}
