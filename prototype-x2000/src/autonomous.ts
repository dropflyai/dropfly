#!/usr/bin/env npx tsx
/**
 * X2000 Autonomous Runner
 *
 * Entry point for autonomous AI fleet operations.
 */

import { AgentLoop } from './agents/loop.js';
import { runSmartSelfImprove } from './agents/self-improve.js';
import { memoryManager } from './memory/manager.js';
import { toolRegistry } from './tools/index.js';
import type { Task } from './types/index.js';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// Configuration
// ============================================================================

interface AutonomousConfig {
  maxIterations: number;
  maxToolCalls: number;
  timeoutMs: number;
  verbose: boolean;
  retryOnError: boolean;
}

const DEFAULT_CONFIG: AutonomousConfig = {
  maxIterations: 50,
  maxToolCalls: 150,
  timeoutMs: 600000, // 10 minutes
  verbose: true,
  retryOnError: true,
};

// ============================================================================
// Task Creation
// ============================================================================

function createAuditTask(): Task {
  return {
    id: uuidv4(),
    subject: 'X2000 System Audit',
    description: `Perform a comprehensive audit of the X2000 system.

Check the following:

1. **Brain System**
   - Count all brain directories in src/brains/
   - Verify each has index.ts and CLAUDE.md
   - Check brains extend BaseBrain or use DepartmentHeadAgent

2. **Type System**
   - Verify BrainType enum has all brain types
   - Check for TypeScript errors (npm run build)

3. **Tool System**
   - List all registered tools
   - Verify tool registry initializes

4. **Memory System**
   - Check if memory persists to Supabase
   - Count existing learnings

5. **Build Status**
   - Run npm run build
   - Report any errors

Provide a summary of findings and a score out of 100.`,
    status: 'in_progress',
    priority: 'high',
    subtaskIds: [],
    blockedBy: [],
    blocks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: { autonomous: true, audit: true },
  };
}

// ============================================================================
// Autonomous Runners
// ============================================================================

async function runAudit(config: Partial<AutonomousConfig> = {}): Promise<void> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║       X2000 AUTONOMOUS AUDIT                                   ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Initialize systems
  await toolRegistry.initialize();

  try {
    await memoryManager.initialize();
    console.log('✓ Memory system initialized\n');
  } catch {
    console.log('⚠️  Memory system offline\n');
  }

  const task = createAuditTask();

  const loop = new AgentLoop({
    brainType: 'ceo',
    trustLevel: 4,
    maxIterations: finalConfig.maxIterations,
    maxToolCalls: finalConfig.maxToolCalls,
    timeoutMs: finalConfig.timeoutMs,
    retryOnError: finalConfig.retryOnError,
    selfCorrect: true,
  });

  const result = await loop.run(task);

  console.log('\n' + '═'.repeat(70));
  console.log('\nAudit Complete!');
  console.log(`Success: ${result.success}`);
  console.log(`Iterations: ${result.iterations.length}`);
  console.log(`Tool Calls: ${result.toolCalls.length}`);
  console.log(`Duration: ${(result.totalDuration / 1000).toFixed(1)}s`);

  if (result.learnings.length > 0) {
    console.log('\nLearnings:');
    result.learnings.forEach(l => console.log(`  - ${l}`));
  }
}

async function runSelfImprove(config: Partial<AutonomousConfig> = {}): Promise<void> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const result = await runSmartSelfImprove({
    maxIterations: finalConfig.maxIterations,
    timeoutMs: finalConfig.timeoutMs,
    verbose: finalConfig.verbose,
  });

  if (!result.success) {
    console.log('\n⚠️  Self-improvement had issues');
    process.exit(1);
  }
}

// ============================================================================
// Main Entry Point
// ============================================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes('--audit')) {
    await runAudit();
  } else if (args.includes('--self-improve')) {
    await runSelfImprove();
  } else {
    // Default: run audit
    console.log('Usage: npm run autonomous [--audit | --self-improve]');
    console.log('\nDefaulting to audit mode...\n');
    await runAudit();
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
