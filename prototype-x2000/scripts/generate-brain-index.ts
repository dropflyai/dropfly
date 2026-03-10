#!/usr/bin/env npx tsx
/**
 * Generate index.ts for all brain directories that don't have one
 */

import { readdirSync, writeFileSync, existsSync, statSync } from 'fs';
import { join } from 'path';

const brainsDir = join(process.cwd(), 'src/brains');

// Brain template generator
function generateBrainIndex(brainName: string): string {
  const className = brainName
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('') + 'Brain';

  const displayName = brainName
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ') + ' Brain';

  return `/**
 * X2000 ${displayName}
 *
 * Specialized brain for ${brainName} tasks.
 */

import { BaseBrain } from '../base.js';
import type {
  BrainType,
  BrainConfig,
  Task,
  TaskResult,
} from '../../types/index.js';

export class ${className} extends BaseBrain {
  constructor(config: BrainConfig) {
    super({
      ...config,
      type: '${brainName}' as BrainType,
      name: '${displayName}',
    });
  }

  async executeTask(task: Task): Promise<TaskResult> {
    const startTime = Date.now();

    console.log(\`[${displayName}] Processing: \${task.subject}\`);

    // Brain-specific task execution
    const result: TaskResult = {
      taskId: task.id,
      brainType: '${brainName}' as BrainType,
      success: true,
      output: {
        message: \`Task "\${task.subject}" processed by ${displayName}\`,
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
    return \`You are the ${displayName} of X2000, an autonomous AI fleet.

Your specialization: ${brainName.replace(/-/g, ' ')} tasks

You work within the X2000 fleet under CEO Brain orchestration.
Follow all protocols and log learnings to memory.\`;
  }
}

export default ${className};
`;
}

// Get all brain directories
const entries = readdirSync(brainsDir);
const brainDirs = entries.filter(entry => {
  const fullPath = join(brainsDir, entry);
  return statSync(fullPath).isDirectory();
});

let created = 0;
let skipped = 0;

for (const brain of brainDirs) {
  const indexPath = join(brainsDir, brain, 'index.ts');

  if (existsSync(indexPath)) {
    console.log(`Skipping ${brain} (already has index.ts)`);
    skipped++;
    continue;
  }

  const content = generateBrainIndex(brain);
  writeFileSync(indexPath, content);
  console.log(`Created ${brain}/index.ts`);
  created++;
}

console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`);
