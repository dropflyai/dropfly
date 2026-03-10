/**
 * File Write Tool
 */

import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import { createTool, toolRegistry, type ToolInput, type ToolContext, type ToolOutput } from './base.js';

const fileWriteTool = createTool({
  name: 'file_write',
  description: 'Write content to a file (creates directories if needed)',
  category: 'write',
  minTrustLevel: 2,
  parameters: [
    {
      name: 'path',
      type: 'string',
      description: 'The path to the file to write',
      required: true,
    },
    {
      name: 'content',
      type: 'string',
      description: 'The content to write to the file',
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
    const content = input.content as string;
    const encoding = (input.encoding as BufferEncoding) || 'utf-8';

    if (toolRegistry.isBlocked(path)) {
      return {
        success: false,
        error: `Access to path '${path}' is blocked for security reasons`,
      };
    }

    try {
      // Ensure directory exists
      await mkdir(dirname(path), { recursive: true });

      await writeFile(path, content, { encoding });
      return {
        success: true,
        data: { path, size: content.length },
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

export default fileWriteTool;
