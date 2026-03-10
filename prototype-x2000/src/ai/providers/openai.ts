/**
 * OpenAI Provider (GPT-4, etc.)
 */

import { LLMProvider, type LLMProviderConfig, type Message, type ToolDefinition, type LLMResponse } from './base.js';

export class OpenAIProvider extends LLMProvider {
  constructor(config: Omit<LLMProviderConfig, 'model'> & { model?: string }) {
    super({
      model: config.model || 'gpt-4o',
      baseUrl: config.baseUrl || 'https://api.openai.com/v1',
      ...config,
    });
  }

  get name(): string {
    return 'openai';
  }

  async chat(
    messages: Message[],
    options?: { tools?: ToolDefinition[]; systemPrompt?: string }
  ): Promise<LLMResponse> {
    const apiKey = this.config.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const openaiMessages = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    if (options?.systemPrompt) {
      openaiMessages.unshift({ role: 'system', content: options.systemPrompt });
    }

    const body: Record<string, unknown> = {
      model: this.config.model,
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
      messages: openaiMessages,
    };

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

    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json() as {
      choices: Array<{
        message: {
          content: string | null;
          tool_calls?: Array<{
            id: string;
            function: { name: string; arguments: string };
          }>;
        };
        finish_reason: string;
      }>;
      usage?: { prompt_tokens: number; completion_tokens: number };
    };

    const choice = data.choices[0];
    const toolCalls: LLMResponse['toolCalls'] = [];

    if (choice.message.tool_calls) {
      for (const tc of choice.message.tool_calls) {
        toolCalls.push({
          id: tc.id,
          name: tc.function.name,
          input: JSON.parse(tc.function.arguments),
        });
      }
    }

    return {
      content: choice.message.content || '',
      toolCalls,
      stopReason: choice.finish_reason === 'tool_calls' ? 'tool_use' : 'end_turn',
      usage: data.usage ? {
        inputTokens: data.usage.prompt_tokens,
        outputTokens: data.usage.completion_tokens,
      } : undefined,
    };
  }

  async isAvailable(): Promise<boolean> {
    try {
      const apiKey = this.config.apiKey || process.env.OPENAI_API_KEY;
      if (!apiKey) return false;

      const response = await fetch(`${this.config.baseUrl}/models`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export default OpenAIProvider;
