/**
 * File Read Tool
 */

import { readFile } from 'fs/promises';
import { createTool, toolRegistry, type ToolInput, type ToolContext, type ToolOutput } from './base.js';

const fileReadTool = createTool({
  name: 'file_read',
  description: 'Read the contents of a file',
  category: 'read',
  minTrustLevel: 1,
  parameters: [
    {
      name: 'path',
      type: 'string',
      description: 'The path to the file to read',
      required: true,
    },
    {
      name: 'encoding',
      type: 'string',
      description: 'The encoding to use (default: utf-8)',
      required: false,
      default: 'utf-8',
    },
  ],
  async execute(input: ToolInput, context: ToolContext): Promise<ToolOutput> {
    const path = input.path as string;
    const encoding = (input.encoding as BufferEncoding) || 'utf-8';

    if (toolRegistry.isBlocked(path)) {
      return {
        success: false,
        error: `Access to path '${path}' is blocked for security reasons`,
      };
    }

    try {
      const content = await readFile(path, { encoding });
      return {
        success: true,
        data: content,
        metadata: {
          path,
          encoding,
          size: content.length,
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

export default fileReadTool;
