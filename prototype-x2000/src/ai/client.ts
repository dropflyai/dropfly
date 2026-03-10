/**
 * Anthropic AI Client
 * Centralized client for all brain-to-Claude communication
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import Anthropic from '@anthropic-ai/sdk';
import type { BrainType } from '../types/index.js';

// Load .env file from project root
config({ path: resolve(process.cwd(), '.env') });

// ============================================================================
// Types
// ============================================================================

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIRequest {
  brain: BrainType;
  systemPrompt: string;
  messages: AIMessage[];
  maxTokens?: number;
  temperature?: number;
}

export interface AIResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  stopReason: string;
}

// ============================================================================
// Client
// ============================================================================

class AnthropicClient {
  private client: Anthropic | null = null;
  private initialized = false;

  /**
   * Initialize the client with API key from environment
   */
  initialize(): boolean {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.warn('[AI] ANTHROPIC_API_KEY not set - running in mock mode');
      return false;
    }

    this.client = new Anthropic({ apiKey });
    this.initialized = true;
    return true;
  }

  /**
   * Check if client is ready for real API calls
   */
  isReady(): boolean {
    return this.initialized && this.client !== null;
  }

  /**
   * Send a request to Claude
   */
  async complete(request: AIRequest): Promise<AIResponse> {
    // If not initialized, return mock response
    if (!this.isReady()) {
      return this.mockResponse(request);
    }

    try {
      const response = await this.client!.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: request.maxTokens ?? 4096,
        temperature: request.temperature ?? 0.7,
        system: request.systemPrompt,
        messages: request.messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      });

      const textContent = response.content.find(c => c.type === 'text');

      return {
        content: textContent?.text ?? '',
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
        stopReason: response.stop_reason ?? 'unknown',
      };
    } catch (error) {
      console.error('[AI] Error calling Claude:', error);
      throw error;
    }
  }

  /**
   * Mock response for when API key is not available
   */
  private mockResponse(request: AIRequest): AIResponse {
    const lastMessage = request.messages[request.messages.length - 1];
    const taskSummary = lastMessage?.content.slice(0, 100) ?? 'unknown task';

    return {
      content: JSON.stringify({
        status: 'mock_response',
        brain: request.brain,
        message: `[MOCK] ${request.brain} Brain would process: "${taskSummary}..."`,
        note: 'Set ANTHROPIC_API_KEY environment variable for real AI responses',
        mockResult: {
          success: true,
          output: `Mock output for ${request.brain} brain task`,
          recommendations: [
            'This is a mock recommendation',
            'Set ANTHROPIC_API_KEY for real results',
          ],
        },
      }, null, 2),
      usage: {
        inputTokens: 0,
        outputTokens: 0,
      },
      stopReason: 'mock',
    };
  }
}

// Singleton instance
export const aiClient = new AnthropicClient();

// Initialize on module load
aiClient.initialize();
