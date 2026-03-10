/**
 * Google Gemini Provider
 *
 * Supports Gemini 2.0 Flash, Gemini Pro, Gemini Ultra.
 * Features: Function calling, vision support, streaming.
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
 * Gemini API message format
 */
interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } }
  | { functionCall: { name: string; args: Record<string, unknown> } }
  | { functionResponse: { name: string; response: Record<string, unknown> } };

interface GeminiTool {
  functionDeclarations: {
    name: string;
    description: string;
    parameters: {
      type: string;
      properties: Record<string, unknown>;
      required?: string[];
    };
  }[];
}

interface GeminiResponse {
  candidates: {
    content: {
      role: string;
      parts: GeminiPart[];
    };
    finishReason: 'STOP' | 'MAX_TOKENS' | 'SAFETY' | 'RECITATION' | 'OTHER';
    safetyRatings?: unknown[];
  }[];
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

interface GeminiStreamChunk {
  candidates?: {
    content?: {
      role?: string;
      parts?: GeminiPart[];
    };
    finishReason?: 'STOP' | 'MAX_TOKENS' | 'SAFETY' | 'RECITATION' | 'OTHER';
  }[];
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

/**
 * Model definitions for Google Gemini
 */
const GEMINI_MODELS: ModelInfo[] = [
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: LLMProvider.GOOGLE,
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
    releaseDate: '2025-02-05',
  },
  {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash Lite',
    provider: LLMProvider.GOOGLE,
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
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.30,
    contextLength: 1048576,
    releaseDate: '2025-02-25',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: LLMProvider.GOOGLE,
    capabilities: {
      streaming: true,
      toolCalling: true,
      vision: true,
      jsonMode: true,
      systemMessages: true,
      maxContextLength: 2097152,
      maxOutputTokens: 8192,
      parallelToolCalls: true,
    },
    inputCostPer1M: 1.25,
    outputCostPer1M: 5.00,
    contextLength: 2097152,
    releaseDate: '2024-02-15',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: LLMProvider.GOOGLE,
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
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.30,
    contextLength: 1048576,
    releaseDate: '2024-05-14',
  },
];

const DEFAULT_MODEL = 'gemini-2.0-flash';

/**
 * Google Gemini LLM Provider
 */
export class GoogleLLM extends BaseLLM {
  readonly provider = LLMProvider.GOOGLE;

  get capabilities(): LLMCapabilities {
    const model = GEMINI_MODELS.find((m) => m.id === this.model);
    return (
      model?.capabilities || {
        streaming: true,
        toolCalling: true,
        vision: true,
        jsonMode: true,
        systemMessages: true,
        maxContextLength: 1048576,
        maxOutputTokens: 8192,
      }
    );
  }

  protected getEnvKeyName(): string {
    return 'GOOGLE_API_KEY';
  }

  protected getDefaultBaseUrl(): string {
    return 'https://generativelanguage.googleapis.com/v1beta';
  }

  protected getAuthHeaders(): Record<string, string> {
    return {};
  }

  protected buildHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...this.config.options?.headers,
    };
  }

  getModelInfo(): ModelInfo {
    const model = GEMINI_MODELS.find((m) => m.id === this.model);
    if (!model) {
      return {
        id: this.model,
        name: this.model,
        provider: LLMProvider.GOOGLE,
        capabilities: this.capabilities,
        contextLength: 1048576,
      };
    }
    return model;
  }

  async chat(messages: LLMMessage[], options?: ChatOptions): Promise<LLMResponse> {
    const body = this.buildRequestBody(messages, options);
    const endpoint = `/models/${this.model}:generateContent?key=${this.apiKey}`;

    const response = await this.makeRequest<GeminiResponse>(endpoint, body, options);

    return this.parseResponse(response);
  }

  async *stream(
    messages: LLMMessage[],
    options?: StreamOptions
  ): AsyncIterable<LLMStreamChunk> {
    const body = this.buildRequestBody(messages, options);
    const endpoint = `/models/${this.model}:streamGenerateContent?key=${this.apiKey}&alt=sse`;

    let usage: LLMUsage | undefined;
    const toolCalls: ToolCall[] = [];

    for await (const chunk of this.makeStreamingRequest(endpoint, body, options)) {
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const event: GeminiStreamChunk = JSON.parse(data);
          const candidate = event.candidates?.[0];

          if (candidate?.content?.parts) {
            for (const part of candidate.content.parts) {
              if ('text' in part) {
                const streamChunk: LLMStreamChunk = {
                  content: part.text,
                  done: false,
                };
                options?.onChunk?.(streamChunk);
                yield streamChunk;
              } else if ('functionCall' in part) {
                const toolCall: ToolCall = {
                  id: `call_${Date.now()}_${toolCalls.length}`,
                  name: part.functionCall.name,
                  arguments: JSON.stringify(part.functionCall.args),
                };
                toolCalls.push(toolCall);
                options?.onToolCall?.(toolCall);

                yield {
                  toolCallDelta: {
                    id: toolCall.id,
                    name: toolCall.name,
                    arguments: JSON.stringify(part.functionCall.args),
                  },
                  done: false,
                };
              }
            }
          }

          if (event.usageMetadata) {
            usage = {
              inputTokens: event.usageMetadata.promptTokenCount,
              outputTokens: event.usageMetadata.candidatesTokenCount,
              totalTokens: event.usageMetadata.totalTokenCount,
            };
          }

          if (candidate?.finishReason) {
            yield {
              done: true,
              finishReason: this.mapFinishReason(candidate.finishReason),
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
    const { systemInstruction, contents } = this.formatMessages(messages, options);

    const body: Record<string, unknown> = {
      contents,
    };

    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    const generationConfig: Record<string, unknown> = {};

    if (options?.maxTokens !== undefined) {
      generationConfig.maxOutputTokens = options.maxTokens;
    } else if (this.config.options?.maxTokens !== undefined) {
      generationConfig.maxOutputTokens = this.config.options.maxTokens;
    }

    if (options?.temperature !== undefined) {
      generationConfig.temperature = options.temperature;
    } else if (this.config.options?.temperature !== undefined) {
      generationConfig.temperature = this.config.options.temperature;
    }

    if (options?.topP !== undefined) {
      generationConfig.topP = options.topP;
    }

    if (options?.topK !== undefined) {
      generationConfig.topK = options.topK;
    }

    if (options?.stopSequences?.length) {
      generationConfig.stopSequences = options.stopSequences;
    }

    if (options?.jsonMode && this.capabilities.jsonMode) {
      generationConfig.responseMimeType = 'application/json';
    }

    if (Object.keys(generationConfig).length > 0) {
      body.generationConfig = generationConfig;
    }

    if (options?.tools?.length && this.capabilities.toolCalling) {
      body.tools = [this.formatTools(options.tools)];

      if (options.toolChoice) {
        if (options.toolChoice === 'none') {
          body.toolConfig = { functionCallingConfig: { mode: 'NONE' } };
        } else if (options.toolChoice === 'auto') {
          body.toolConfig = { functionCallingConfig: { mode: 'AUTO' } };
        } else if (options.toolChoice === 'required') {
          body.toolConfig = { functionCallingConfig: { mode: 'ANY' } };
        } else if (typeof options.toolChoice === 'object') {
          body.toolConfig = {
            functionCallingConfig: {
              mode: 'ANY',
              allowedFunctionNames: [options.toolChoice.name],
            },
          };
        }
      }
    }

    return body;
  }

  protected formatMessages(
    messages: LLMMessage[],
    options?: ChatOptions
  ): { systemInstruction: string | null; contents: GeminiContent[] } {
    let systemInstruction: string | null = null;

    // Extract system message
    if (options?.systemPrompt) {
      systemInstruction = options.systemPrompt;
    } else if (this.config.options?.systemPrompt) {
      systemInstruction = this.config.options.systemPrompt;
    } else {
      const systemMessages = messages.filter((m) => m.role === 'system');
      if (systemMessages.length > 0) {
        systemInstruction = systemMessages
          .map((m) => (typeof m.content === 'string' ? m.content : ''))
          .join('\n\n');
      }
    }

    // Convert other messages
    const contents: GeminiContent[] = [];

    for (const msg of messages) {
      if (msg.role === 'system') continue;

      const role = msg.role === 'assistant' ? 'model' : 'user';
      const parts: GeminiPart[] = [];

      // Handle tool results
      if (msg.role === 'tool' && msg.toolResults?.length) {
        for (const result of msg.toolResults) {
          let responseContent: Record<string, unknown>;
          try {
            responseContent = JSON.parse(result.content);
          } catch {
            responseContent = { result: result.content };
          }
          parts.push({
            functionResponse: {
              name: result.toolCallId,
              response: responseContent,
            },
          });
        }
        contents.push({ role: 'user', parts });
        continue;
      }

      // Handle string content
      if (typeof msg.content === 'string') {
        parts.push({ text: msg.content });
      } else {
        // Handle content blocks
        for (const block of msg.content) {
          switch (block.type) {
            case 'text':
              parts.push({ text: block.text });
              break;

            case 'image':
              if (block.source.type === 'base64' && block.source.data) {
                parts.push({
                  inlineData: {
                    mimeType: block.source.mediaType || 'image/jpeg',
                    data: block.source.data,
                  },
                });
              }
              break;

            case 'tool_use':
              parts.push({
                functionCall: {
                  name: block.name,
                  args: block.input,
                },
              });
              break;
          }
        }
      }

      // Handle tool calls from assistant
      if (msg.toolCalls?.length) {
        for (const tc of msg.toolCalls) {
          const args =
            typeof tc.arguments === 'string' ? JSON.parse(tc.arguments) : tc.arguments;
          parts.push({
            functionCall: {
              name: tc.name,
              args,
            },
          });
        }
      }

      if (parts.length > 0) {
        contents.push({ role, parts });
      }
    }

    return { systemInstruction, contents };
  }

  protected formatTools(tools: ToolDefinition[]): GeminiTool {
    return {
      functionDeclarations: tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        parameters: {
          type: 'object',
          properties: tool.parameters.properties || {},
          required: tool.parameters.required,
        },
      })),
    };
  }

  protected parseToolCalls(response: GeminiResponse): ToolCall[] {
    const toolCalls: ToolCall[] = [];
    const parts = response.candidates[0]?.content?.parts || [];

    for (const part of parts) {
      if ('functionCall' in part) {
        toolCalls.push({
          id: `call_${Date.now()}_${toolCalls.length}`,
          name: part.functionCall.name,
          arguments: JSON.stringify(part.functionCall.args),
        });
      }
    }

    return toolCalls;
  }

  protected extractContent(response: GeminiResponse): string {
    const parts = response.candidates[0]?.content?.parts || [];
    return parts
      .filter((p): p is { text: string } => 'text' in p)
      .map((p) => p.text)
      .join('');
  }

  protected extractUsage(response: GeminiResponse): LLMUsage {
    return {
      inputTokens: response.usageMetadata.promptTokenCount,
      outputTokens: response.usageMetadata.candidatesTokenCount,
      totalTokens: response.usageMetadata.totalTokenCount,
    };
  }

  private mapFinishReason(
    reason: 'STOP' | 'MAX_TOKENS' | 'SAFETY' | 'RECITATION' | 'OTHER'
  ): FinishReason {
    switch (reason) {
      case 'STOP':
        return 'stop';
      case 'MAX_TOKENS':
        return 'length';
      case 'SAFETY':
        return 'content_filter';
      default:
        return 'stop';
    }
  }

  private parseResponse(response: GeminiResponse): LLMResponse {
    const content = this.extractContent(response);
    const toolCalls = this.parseToolCalls(response);
    const usage = this.extractUsage(response);
    const finishReason = this.mapFinishReason(
      response.candidates[0]?.finishReason || 'STOP'
    );

    return {
      content,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      usage,
      finishReason,
      model: this.model,
      raw: response,
    };
  }
}

/**
 * Get available Google Gemini models
 */
export function getGoogleModels(): ModelInfo[] {
  return GEMINI_MODELS;
}

/**
 * Create a Google Gemini LLM instance
 */
export function createGoogle(config?: Partial<LLMConfig>): GoogleLLM {
  return new GoogleLLM({
    provider: LLMProvider.GOOGLE,
    model: config?.model || DEFAULT_MODEL,
    ...config,
  });
}
