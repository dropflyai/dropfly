/**
 * Ollama Provider (Local LLMs)
 *
 * Supports any model running locally via Ollama.
 * No API key needed - runs on your machine.
 */

import { LLMProvider, type LLMProviderConfig, type Message, type ToolDefinition, type LLMResponse } from './base.js';

export class OllamaProvider extends LLMProvider {
  constructor(config: Omit<LLMProviderConfig, 'model'> & { model?: string }) {
    super({
      model: config.model || 'llama3.2',
      baseUrl: config.baseUrl || 'http://localhost:11434',
      ...config,
    });
  }

  get name(): string {
    return 'ollama';
  }

  async chat(
    messages: Message[],
    options?: { tools?: ToolDefinition[]; systemPrompt?: string }
  ): Promise<LLMResponse> {
    const ollamaMessages = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    if (options?.systemPrompt) {
      ollamaMessages.unshift({ role: 'system', content: options.systemPrompt });
    }

    const body: Record<string, unknown> = {
      model: this.config.model,
      messages: ollamaMessages,
      stream: false,
      options: {
        temperature: this.config.temperature,
        num_predict: this.config.maxTokens,
      },
    };

    // Ollama supports tools in newer versions
    if (options?.tools && options.tools.length > 0) {
      body.tools = options.tools.map(t => ({
        type: 'function',
        function: {
          name: t.name,
          description: t.description,
          parameters: t.input_schema,
        },
      }));
    }

    const response = await fetch(`${this.config.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API error: ${error}`);
    }

    const data = await response.json() as {
      message: {
        role: string;
        content: string;
        tool_calls?: Array<{
          function: { name: string; arguments: Record<string, unknown> };
        }>;
      };
      done: boolean;
      eval_count?: number;
      prompt_eval_count?: number;
    };

    const toolCalls: LLMResponse['toolCalls'] = [];

    if (data.message.tool_calls) {
      for (let i = 0; i < data.message.tool_calls.length; i++) {
        const tc = data.message.tool_calls[i];
        toolCalls.push({
          id: `ollama-${Date.now()}-${i}`,
          name: tc.function.name,
          input: tc.function.arguments,
        });
      }
    }

    return {
      content: data.message.content || '',
      toolCalls,
      stopReason: toolCalls.length > 0 ? 'tool_use' : 'end_turn',
      usage: {
        inputTokens: data.prompt_eval_count || 0,
        outputTokens: data.eval_count || 0,
      },
    };
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * List available local models
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`);
      if (!response.ok) return [];

      const data = await response.json() as { models: Array<{ name: string }> };
      return data.models.map(m => m.name);
    } catch {
      return [];
    }
  }
}

export default OllamaProvider;
