/**
 * Web Fetch Tool
 */

import { createTool, type ToolInput, type ToolContext, type ToolOutput } from './base.js';

const webFetchTool = createTool({
  name: 'web_fetch',
  description: 'Fetch content from a URL',
  category: 'read',
  minTrustLevel: 1,
  parameters: [
    {
      name: 'url',
      type: 'string',
      description: 'The URL to fetch',
      required: true,
    },
    {
      name: 'method',
      type: 'string',
      description: 'HTTP method (default: GET)',
      required: false,
      default: 'GET',
    },
  ],
  async execute(input: ToolInput, context: ToolContext): Promise<ToolOutput> {
    const url = input.url as string;
    const method = (input.method as string) || 'GET';

    try {
      const response = await fetch(url, { method });
      const text = await response.text();

      return {
        success: response.ok,
        data: {
          status: response.status,
          body: text,
        },
        metadata: {
          url,
          method,
          status: response.status,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
});

export default webFetchTool;
