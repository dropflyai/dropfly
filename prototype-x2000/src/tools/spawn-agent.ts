/**
 * Spawn Agent Tool
 */

import { createTool, type ToolInput, type ToolContext, type ToolOutput } from './base.js';

const spawnAgentTool = createTool({
  name: 'spawn_agent',
  description: 'Spawn a sub-agent to handle a specific task',
  category: 'execute',
  minTrustLevel: 3,
  parameters: [
    { name: 'brainType', type: 'string', description: 'Type of brain for the agent', required: true },
    { name: 'task', type: 'string', description: 'Task description', required: true },
    { name: 'context', type: 'object', description: 'Additional context', required: false },
  ],
  async execute(input: ToolInput, context: ToolContext): Promise<ToolOutput> {
    const brainType = input.brainType as string;
    const task = input.task as string;

    // For now, return a placeholder - real implementation would use AgentSpawner
    return {
      success: true,
      data: {
        message: `Would spawn ${brainType} agent for task: ${task}`,
        brainType,
        task,
      },
    };
  },
});

export default spawnAgentTool;
