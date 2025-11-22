import Anthropic from '@anthropic-ai/sdk';

// Lazy-load Anthropic client to avoid build-time execution
export function getAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}
