/**
 * X2000 Debugger Brain
 *
 * Specialized brain for debugger tasks.
 */

import { BaseBrain } from '../base.js';
import type {
  BrainType,
  BrainConfig,
  Task,
  TaskResult,
} from '../../types/index.js';

export class DebuggerBrain extends BaseBrain {
  constructor(config: BrainConfig) {
    super({
      ...config,
      type: 'debugger' as BrainType,
      name: 'Debugger Brain',
    });
  }

  async executeTask(task: Task): Promise<TaskResult> {
    const startTime = Date.now();

    console.log(`[Debugger Brain] Processing: ${task.subject}`);

    // Brain-specific task execution
    const result: TaskResult = {
      taskId: task.id,
      brainType: 'debugger' as BrainType,
      success: true,
      output: {
        message: `Task "${task.subject}" processed by Debugger Brain`,
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
    return `You are the Debugger Brain of X2000, an autonomous AI fleet.

Your specialization: debugger tasks

You work within the X2000 fleet under CEO Brain orchestration.
Follow all protocols and log learnings to memory.`;
  }
}

export default DebuggerBrain;
