/**
 * Browser Automation Tool (Stub)
 */

import { createTool, type ToolInput, type ToolContext, type ToolOutput } from './base.js';

const browserTool = createTool({
  name: 'browser',
  description: 'Browser automation using Playwright',
  category: 'external',
  minTrustLevel: 4,
  parameters: [
    { name: 'action', type: 'string', description: 'Action to perform', required: true },
    { name: 'url', type: 'string', description: 'URL to navigate to', required: false },
  ],
  async execute(input: ToolInput, context: ToolContext): Promise<ToolOutput> {
    return {
      success: false,
      error: 'Browser tool not fully implemented - requires Playwright setup',
    };
  },
});

export default browserTool;
