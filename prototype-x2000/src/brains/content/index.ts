/**
 * X2000 Content Brain
 *
 * Specialized brain for content tasks.
 */

import { BaseBrain } from '../base.js';
import type {
  BrainType,
  BrainConfig,
  Task,
  TaskResult,
} from '../../types/index.js';

export class ContentBrain extends BaseBrain {
  constructor(config: BrainConfig) {
    super({
      ...config,
      type: 'content' as BrainType,
      name: 'Content Brain',
    });
  }

  async executeTask(task: Task): Promise<TaskResult> {
    const startTime = Date.now();

    console.log(`[Content Brain] Processing: ${task.subject}`);

    // Brain-specific task execution
    const result: TaskResult = {
      taskId: task.id,
      brainType: 'content' as BrainType,
      success: true,
      output: {
        message: `Task "${task.subject}" processed by Content Brain`,
        analysis: 'Task analyzed and processed',
      },
      learnings: [],
      duration: Date.now() - startTime,
      toolsUsed: [],
    };

    this.updateMetrics(result);
    return result;
  }

  getSystemPrompt(): string {
    return `You are the Content Brain of X2000, an autonomous AI fleet.

Your specialization: content tasks

You work within the X2000 fleet under CEO Brain orchestration.
Follow all protocols and log learnings to memory.`;
  }
}

export default ContentBrain;
