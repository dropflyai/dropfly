import OpenAI from 'openai';

// Lazy-load OpenAI client to avoid build-time execution
export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const config: any = {
    apiKey: process.env.OPENAI_API_KEY,
  };

  // Add organization ID if provided
  if (process.env.OPENAI_ORGANIZATION_ID) {
    config.organization = process.env.OPENAI_ORGANIZATION_ID;
    console.log('[OpenAI] Using organization ID:', process.env.OPENAI_ORGANIZATION_ID);
  } else {
    console.log('[OpenAI] No organization ID configured');
  }

  return new OpenAI(config);
}
