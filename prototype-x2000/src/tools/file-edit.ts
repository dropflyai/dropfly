/**
 * File Edit Tool
 */

import { readFile, writeFile } from 'fs/promises';
import { createTool, toolRegistry, type ToolInput, type ToolContext, type ToolOutput } from './base.js';

interface EditOperation {
  type: 'replace' | 'insert' | 'delete';
  search?: string;
  replace?: string;
  line?: number;
  content?: string;
  startLine?: number;
  endLine?: number;
}

const fileEditTool = createTool({
  name: 'file_edit',
  description: 'Edit a file with search/replace, insert, or delete operations',
  category: 'write',
  minTrustLevel: 2,
  parameters: [
    {
      name: 'path',
      type: 'string',
      description: 'The path to the file to edit',
      required: true,
    },
    {
      name: 'operations',
      type: 'array',
      description: 'Array of edit operations to apply',
      required: true,
    },
  ],
  async execute(input: ToolInput, context: ToolContext): Promise<ToolOutput> {
    const path = input.path as string;
    const operations = input.operations as EditOperation[];

    if (toolRegistry.isBlocked(path)) {
      return {
        success: false,
        error: `Access to path '${path}' is blocked for security reasons`,
      };
    }

    if (!operations || !Array.isArray(operations) || operations.length === 0) {
      return {
        success: false,
        error: 'No operations provided. operations must be an array of edit operations.',
      };
    }

    try {
      let content = await readFile(path, 'utf-8');
      const appliedOps: string[] = [];

      for (const op of operations) {
        switch (op.type) {
          case 'replace':
            if (op.search && op.replace !== undefined) {
              const regex = new RegExp(op.search, 'g');
              const matches = content.match(regex);
              if (matches) {
                content = content.replace(regex, op.replace);
                appliedOps.push(`Replaced ${matches.length} occurrences of '${op.search}'`);
              } else {
                appliedOps.push(`No matches found for '${op.search}'`);
              }
            }
            break;

          case 'insert':
            if (op.line !== undefined && op.content) {
              const lines = content.split('\n');
              const lineIndex = Math.min(op.line - 1, lines.length);
              lines.splice(lineIndex, 0, op.content);
              content = lines.join('\n');
              appliedOps.push(`Inserted content at line ${op.line}`);
            }
            break;

          case 'delete':
            if (op.startLine !== undefined && op.endLine !== undefined) {
              const lines = content.split('\n');
              const start = Math.max(0, op.startLine - 1);
              const end = Math.min(lines.length, op.endLine);
              lines.splice(start, end - start);
              content = lines.join('\n');
              appliedOps.push(`Deleted lines ${op.startLine}-${op.endLine}`);
            }
            break;
        }
      }

      await writeFile(path, content, 'utf-8');

      return {
        success: true,
        data: { path, operationsApplied: appliedOps },
        metadata: {
          path,
          operationsCount: operations.length,
          appliedOps,
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

export default fileEditTool;
