/**
 * Web Search Tool (Stub)
 */

import { createTool, type ToolInput, type ToolContext, type ToolOutput } from './base.js';

const webSearchTool = createTool({
  name: 'web_search',
  description: 'Search the web for information',
  category: 'read',
  minTrustLevel: 1,
  parameters: [
    { name: 'query', type: 'string', description: 'Search query', required: true },
    { name: 'maxResults', type: 'number', description: 'Maximum results', required: false, default: 5 },
  ],
  async execute(input: ToolInput, context: ToolContext): Promise<ToolOutput> {
    return {
      success: false,
      error: 'Web search requires API key configuration',
    };
  },
});

export default webSearchTool;
