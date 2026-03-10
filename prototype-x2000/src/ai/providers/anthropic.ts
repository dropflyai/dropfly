/**
 * Anthropic Provider (Claude)
 */

import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider, type LLMProviderConfig, type Message, type ToolDefinition, type LLMResponse } from './base.js';

export class AnthropicProvider extends LLMProvider {
  private client: Anthropic;

  constructor(config: Omit<LLMProviderConfig, 'model'> & { model?: string }) {
    super({
      model: config.model || 'claude-sonnet-4-20250514',
      ...config,
    });
    this.client = new Anthropic({
      apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY,
    });
  }

  get name(): string {
    return 'anthropic';
  }

  async chat(
    messages: Message[],
    options?: { tools?: ToolDefinition[]; systemPrompt?: string }
  ): Promise<LLMResponse> {
    const anthropicMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    const systemPrompt = options?.systemPrompt ||
      messages.find(m => m.role === 'system')?.content || '';

    const response = await this.client.messages.create({
      model: this.config.model,
      max_tokens: this.config.maxTokens!,
      system: systemPrompt,
      messages: anthropicMessages,
      tools: options?.tools as Anthropic.Messages.Tool[],
    });

    let content = '';
    const toolCalls: LLMResponse['toolCalls'] = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        content += block.text;
      } else if (block.type === 'tool_use') {
        toolCalls.push({
          id: block.id,
          name: block.name,
          input: block.input as Record<string, unknown>,
        });
      }
    }

    return {
      content,
      toolCalls,
      stopReason: response.stop_reason === 'tool_use' ? 'tool_use' : 'end_turn',
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'hi' }],
      });
      return true;
    } catch {
      return false;
    }
  }
}

export default AnthropicProvider;
