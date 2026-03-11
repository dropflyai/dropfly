/**
 * X2000 Tool System
 *
 * Central export for all tools.
 */

export {
  toolRegistry,
  createTool,
  executeTool,
  getToolDefinitions,
  BLOCKED_PATHS,
  BLOCKED_COMMANDS,
  BLOCKED_ENV_VARS,
  type Tool,
  type ToolInput,
  type ToolOutput,
  type ToolContext,
  type ToolCategory,
  type ToolParameter,
} from './base.js';

// Individual tools
export { default as fileReadTool } from './file-read.js';
export { default as fileWriteTool } from './file-write.js';
export { default as fileEditTool } from './file-edit.js';
export { default as shellExecTool } from './shell-exec.js';
export { default as webFetchTool } from './web-fetch.js';
export { default as gitTool } from './git.js';
export { default as browserTool } from './browser.js';
export { default as emailTool } from './email.js';
export { default as spawnAgentTool } from './spawn-agent.js';
export { default as processTool } from './process.js';
export { default as visionTool } from './vision.js';
export { default as verifyDeployTool } from './verify-deploy.js';

// Initialize tool registry
import { toolRegistry } from './base.js';

export async function initializeTools(): Promise<void> {
  await toolRegistry.initialize();
}
