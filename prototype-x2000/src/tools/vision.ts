/**
 * Vision/Image Analysis Tool
 */

import { createTool, type ToolInput, type ToolContext, type ToolOutput } from './base.js';

const visionTool = createTool({
  name: 'vision',
  description: 'Analyze images using AI vision',
  category: 'read',
  minTrustLevel: 1,
  parameters: [
    { name: 'imagePath', type: 'string', description: 'Path to image file', required: true },
    { name: 'prompt', type: 'string', description: 'Analysis prompt', required: false },
  ],
  async execute(input: ToolInput, context: ToolContext): Promise<ToolOutput> {
    return {
      success: false,
      error: 'Vision tool requires Claude vision API integration',
    };
  },
});

export default visionTool;
