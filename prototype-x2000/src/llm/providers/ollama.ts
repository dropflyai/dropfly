/**
 * Ollama Provider (Local)
 *
 * Supports any local model running on Ollama.
 * Features: Custom base URL, no API key needed.
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
 * Ollama API message format
 */
interface OllamaMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  images?: string[];
  tool_calls?: OllamaToolCall[];
}

interface OllamaToolCall {
  function: {
    name: string;
    arguments: Record<string, unknown>;
  };
}

interface OllamaTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: string;
      required?: string[];
      properties: Record<string, unknown>;
    };
  };
}

interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
    tool_calls?: OllamaToolCall[];
  };
  done: boolean;
  done_reason?: 'stop' | 'length' | 'load' | 'unload';
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

interface OllamaStreamChunk {
  model: string;
  created_at: string;
  message?: {
    role: string;
    content: string;
    tool_calls?: OllamaToolCall[];
  };
  done: boolean;
  done_reason?: 'stop' | 'length';
  total_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

/**
 * Common Ollama models - users can use any model they have installed
 */
const OLLAMA_MODELS: ModelInfo[] = [
  {
    id: 'llama3.3',
    name: 'Llama 3.3 70B',
    provider: LLMProvider.OLLAMA,
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
    contextLength: 128000,
  },
  {
    id: 'llama3.2',
    name: 'Llama 3.2',
    provider: LLMProvider.OLLAMA,
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
    contextLength: 128000,
  },
  {
    id: 'llama3.2-vision',
    name: 'Llama 3.2 Vision',
    provider: LLMProvider.OLLAMA,
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
    contextLength: 128000,
  },
  {
    id: 'mistral',
    name: 'Mistral',
    provider: LLMProvider.OLLAMA,
    capabilities: {
      streaming: true,
      toolCalling: true,
      vision: false,
      jsonMode: true,
      systemMessages: true,
      maxContextLength: 32000,
      maxOutputTokens: 8192,
      parallelToolCalls: true,
    },
    contextLength: 32000,
  },
  {
    id: 'mixtral',
    name: 'Mixtral 8x7B',
    provider: LLMProvider.OLLAMA,
    capabilities: {
      streaming: true,
      toolCalling: true,
      vision: false,
      jsonMode: true,
      systemMessages: true,
      maxContextLength: 32000,
      maxOutputTokens: 8192,
      parallelToolCalls: true,
    },
    contextLength: 32000,
  },
  {
    id: 'codellama',
    name: 'Code Llama',
    provider: LLMProvider.OLLAMA,
    capabilities: {
      streaming: true,
      toolCalling: false,
      vision: false,
      jsonMode: true,
      systemMessages: true,
      maxContextLength: 16000,
      maxOutputTokens: 4096,
      parallelToolCalls: false,
    },
    contextLength: 16000,
  },
  {
    id: 'qwen2.5',
    name: 'Qwen 2.5',
    provider: LLMProvider.OLLAMA,
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
    contextLength: 128000,
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: LLMProvider.OLLAMA,
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
    contextLength: 64000,
  },
  {
    id: 'phi3',
    name: 'Phi-3',
    provider: LLMProvider.OLLAMA,
    capabilities: {
      streaming: true,
      toolCalling: false,
      vision: false,
      jsonMode: true,
      systemMessages: true,
      maxContextLength: 4096,
      maxOutputTokens: 2048,
      parallelToolCalls: false,
    },
    contextLength: 4096,
  },
  {
    id: 'gemma2',
    name: 'Gemma 2',
    provider: LLMProvider.OLLAMA,
    capabilities: {
      streaming: true,
      toolCalling: true,
      vision: false,
      jsonMode: true,
      systemMessages: true,
      maxContextLength: 8192,
      maxOutputTokens: 4096,
      parallelToolCalls: true,
    },
    contextLength: 8192,
  },
];

const DEFAULT_MODEL = 'llama3.3';

/**
 * Ollama LLM Provider (Local)
 */
export class OllamaLLM extends BaseLLM {
  readonly provider = LLMProvider.OLLAMA;

  get capabilities(): LLMCapabilities {
    const model = OLLAMA_MODELS.find((m) => m.id === this.model);
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
    return 'OLLAMA_HOST'; // Not really an API key, but used for base URL
  }

  protected getDefaultBaseUrl(): string {
    return process.env.OLLAMA_HOST || 'http://localhost:11434';
  }

  protected requiresApiKey(): boolean {
    return false; // Ollama doesn't require an API key
  }

  protected getAuthHeaders(): Record<string, string> {
    return {}; // No auth headers needed
  }

  getModelInfo(): ModelInfo {
    const model = OLLAMA_MODELS.find((m) => m.id === this.model);
    if (!model) {
      // Return default info for custom models
      return {
        id: this.model,
        name: this.model,
        provider: LLMProvider.OLLAMA,
        capabilities: this.capabilities,
        contextLength: 128000,
      };
    }
    return model;
  }

  async chat(messages: LLMMessage[], options?: ChatOptions): Promise<LLMResponse> {
    const body = this.buildRequestBody(messages, options);
    body.stream = false;

    const response = await this.makeRequest<OllamaResponse>('/api/chat', body, options);

    return this.parseResponse(response);
  }

  async *stream(
    messages: LLMMessage[],
    options?: StreamOptions
  ): AsyncIterable<LLMStreamChunk> {
    const body = this.buildRequestBody(messages, options);
    body.stream = true;

    let totalContent = '';
    let usage: LLMUsage | undefined;

    for await (const chunk of this.makeStreamingRequest('/api/chat', body, options)) {
      // Ollama sends NDJSON, not SSE
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const event: OllamaStreamChunk = JSON.parse(line);

          if (event.message?.content) {
            totalContent += event.message.content;
            const streamChunk: LLMStreamChunk = {
              content: event.message.content,
              done: false,
            };
            options?.onChunk?.(streamChunk);
            yield streamChunk;
          }

          // Handle tool calls
          if (event.message?.tool_calls) {
            for (const tc of event.message.tool_calls) {
              const toolCall: ToolCall = {
                id: `call_${Date.now()}`,
                name: tc.function.name,
                arguments: JSON.stringify(tc.function.arguments),
              };
              options?.onToolCall?.(toolCall);
              yield {
                toolCallDelta: {
                  id: toolCall.id,
                  name: toolCall.name,
                  arguments: JSON.stringify(tc.function.arguments),
                },
                done: false,
              };
            }
          }

          if (event.done) {
            usage = {
              inputTokens: event.prompt_eval_count || 0,
              outputTokens: event.eval_count || 0,
              totalTokens: (event.prompt_eval_count || 0) + (event.eval_count || 0),
            };

            yield {
              done: true,
              finishReason: this.mapFinishReason(event.done_reason),
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

    const ollamaOptions: Record<string, unknown> = {};

    if (options?.maxTokens !== undefined) {
      ollamaOptions.num_predict = options.maxTokens;
    } else if (this.config.options?.maxTokens !== undefined) {
      ollamaOptions.num_predict = this.config.options.maxTokens;
    }

    if (options?.temperature !== undefined) {
      ollamaOptions.temperature = options.temperature;
    } else if (this.config.options?.temperature !== undefined) {
      ollamaOptions.temperature = this.config.options.temperature;
    }

    if (options?.topP !== undefined) {
      ollamaOptions.top_p = options.topP;
    }

    if (options?.topK !== undefined) {
      ollamaOptions.top_k = options.topK;
    }

    if (options?.stopSequences?.length) {
      ollamaOptions.stop = options.stopSequences;
    }

    if (Object.keys(ollamaOptions).length > 0) {
      body.options = ollamaOptions;
    }

    if (options?.jsonMode && this.capabilities.jsonMode) {
      body.format = 'json';
    }

    if (options?.tools?.length && this.capabilities.toolCalling) {
      body.tools = this.formatTools(options.tools);
    }

    return body;
  }

  protected formatMessages(messages: LLMMessage[]): OllamaMessage[] {
    return messages.map((msg) => {
      const message: OllamaMessage = {
        role: msg.role as 'system' | 'user' | 'assistant' | 'tool',
        content: '',
      };

      // Handle string content
      if (typeof msg.content === 'string') {
        message.content = msg.content;
      } else {
        // Handle content blocks
        const textParts: string[] = [];
        const images: string[] = [];

        for (const block of msg.content) {
          switch (block.type) {
            case 'text':
              textParts.push(block.text);
              break;

            case 'image':
              if (block.source.type === 'base64' && block.source.data) {
                images.push(block.source.data);
              }
              break;
          }
        }

        message.content = textParts.join('\n');
        if (images.length > 0) {
          message.images = images;
        }
      }

      // Handle tool calls
      if (msg.toolCalls?.length) {
        message.tool_calls = msg.toolCalls.map((tc) => ({
          function: {
            name: tc.name,
            arguments:
              typeof tc.arguments === 'string'
                ? JSON.parse(tc.arguments)
                : tc.arguments,
          },
        }));
      }

      return message;
    });
  }

  protected formatTools(tools: ToolDefinition[]): OllamaTool[] {
    return tools.map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: 'object',
          properties: tool.parameters.properties || {},
          required: tool.parameters.required,
        },
      },
    }));
  }

  protected parseToolCalls(response: OllamaResponse): ToolCall[] {
    if (!response.message?.tool_calls) return [];

    return response.message.tool_calls.map((tc, index) => ({
      id: `call_${Date.now()}_${index}`,
      name: tc.function.name,
      arguments: JSON.stringify(tc.function.arguments),
    }));
  }

  protected extractContent(response: OllamaResponse): string {
    return response.message?.content || '';
  }

  protected extractUsage(response: OllamaResponse): LLMUsage {
    return {
      inputTokens: response.prompt_eval_count || 0,
      outputTokens: response.eval_count || 0,
      totalTokens: (response.prompt_eval_count || 0) + (response.eval_count || 0),
    };
  }

  private mapFinishReason(reason?: string): FinishReason {
    switch (reason) {
      case 'stop':
        return 'stop';
      case 'length':
        return 'length';
      default:
        return 'stop';
    }
  }

  private parseResponse(response: OllamaResponse): LLMResponse {
    const content = this.extractContent(response);
    const toolCalls = this.parseToolCalls(response);
    const usage = this.extractUsage(response);
    const finishReason = this.mapFinishReason(response.done_reason);

    return {
      content,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      usage,
      finishReason,
      model: response.model,
      raw: response,
    };
  }

  /**
   * List available models on the Ollama server
   */
  async listModels(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/api/tags`);
    if (!response.ok) {
      throw new Error(`Failed to list models: ${response.statusText}`);
    }
    const data = (await response.json()) as { models: { name: string }[] };
    return data.models.map((m) => m.name);
  }

  /**
   * Pull a model from the Ollama registry
   */
  async pullModel(modelName: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName }),
    });
    if (!response.ok) {
      throw new Error(`Failed to pull model: ${response.statusText}`);
    }
    // Stream the pull progress
    const reader = response.body?.getReader();
    if (reader) {
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        // Progress is streamed as NDJSON
        decoder.decode(value, { stream: true });
      }
    }
  }
}

/**
 * Get available Ollama models (common ones)
 */
export function getOllamaModels(): ModelInfo[] {
  return OLLAMA_MODELS;
}

/**
 * Create an Ollama LLM instance
 */
export function createOllama(config?: Partial<LLMConfig>): OllamaLLM {
  return new OllamaLLM({
    provider: LLMProvider.OLLAMA,
    model: config?.model || DEFAULT_MODEL,
    ...config,
  });
}
