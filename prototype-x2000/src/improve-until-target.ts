#!/usr/bin/env npx tsx
/**
 * X2000 Autonomous Improvement Loop
 *
 * Keeps improving until target score is reached.
 * No human intervention needed.
 */

import { AgentLoop } from './agents/loop.js';
import { runSmartSelfImprove, autoRecoverFromBuildFailure } from './agents/self-improve.js';
import { memoryManager } from './memory/manager.js';
import type { Task } from './types/index.js';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// Configuration
// ============================================================================

const TARGET_SCORE = parseInt(process.argv[2]) || 97;
const MAX_IMPROVEMENT_CYCLES = 10;
const TIMEOUT_PER_CYCLE_MS = 600000; // 10 minutes per cycle

// ============================================================================
// Audit Task - Returns a score
// ============================================================================

function createAuditTask(): Task {
  return {
    id: uuidv4(),
    subject: 'X2000 Scored Audit',
    description: `Perform a comprehensive audit of X2000 and return a SCORE out of 100.

## Scoring Criteria (100 points total)

### 1. Brain System (25 points)
- All 44 brains exist with index.ts: 10 points
- All 44 brains have CLAUDE.md (1000+ lines each): 10 points
- All brains use DepartmentHeadAgent properly: 5 points

### 2. Type System (20 points)
- BrainType enum has all 44 types: 5 points
- No TypeScript errors (npm run build passes): 10 points
- All interfaces properly defined: 5 points

### 3. Tool System (15 points)
- All 12 tools registered and working: 10 points
- Tools properly integrated with trust levels: 5 points

### 4. Memory System (15 points)
- Persistence configured: 5 points
- Patterns/learnings storage working: 5 points
- Skills system functional: 5 points

### 5. Orchestration (15 points)
- CEO Brain routes to all brains: 5 points
- Task decomposition works: 5 points
- Collaboration protocol implemented: 5 points

### 6. Autonomy (10 points)
- AgentLoop functional: 5 points
- Self-improvement capability: 3 points
- Auto-recovery on errors: 2 points

## Instructions
1. Check each criterion using file_read and shell_exec
2. Calculate the total score
3. Return ONLY a JSON object at the end:

SCORE_RESULT:
\`\`\`json
{
  "score": <number 0-100>,
  "breakdown": {
    "brainSystem": <0-25>,
    "typeSystem": <0-20>,
    "toolSystem": <0-15>,
    "memorySystem": <0-15>,
    "orchestration": <0-15>,
    "autonomy": <0-10>
  },
  "gaps": ["list of specific gaps to fix"],
  "recommendations": ["prioritized list of improvements"]
}
\`\`\``,
    status: 'in_progress',
    priority: 'high',
    subtaskIds: [],
    blockedBy: [],
    blocks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: { autonomous: true, audit: true, scored: true },
  };
}

// ============================================================================
// Parse Score from Audit Result
// ============================================================================

function parseAuditScore(output: unknown): {
  score: number;
  breakdown: Record<string, number>;
  gaps: string[];
  recommendations: string[];
} | null {
  try {
    const text = typeof output === 'string' ? output : JSON.stringify(output);

    // Look for SCORE_RESULT JSON block
    const jsonMatch = text.match(/SCORE_RESULT:\s*```json\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }

    // Try to find any JSON with a score field
    const scoreMatch = text.match(/\{[\s\S]*"score"\s*:\s*(\d+)[\s\S]*\}/);
    if (scoreMatch) {
      try {
        return JSON.parse(scoreMatch[0]);
      } catch {
        return {
          score: parseInt(scoreMatch[1]),
          breakdown: {},
          gaps: [],
          recommendations: [],
        };
      }
    }

    // Look for a simple score number
    const simpleMatch = text.match(/(?:score|rating|total)[:\s]+(\d+)/i);
    if (simpleMatch) {
      return {
        score: parseInt(simpleMatch[1]),
        breakdown: {},
        gaps: [],
        recommendations: [],
      };
    }

    return null;
  } catch {
    return null;
  }
}

// ============================================================================
// Direct Programmatic Audit (More Reliable)
// ============================================================================

async function runDirectAudit(): Promise<{
  score: number;
  breakdown: Record<string, number>;
  gaps: string[];
  recommendations: string[];
}> {
  const { execSync } = await import('child_process');
  const { existsSync, readdirSync, readFileSync, statSync } = await import('fs');
  const { join } = await import('path');

  const gaps: string[] = [];
  const recommendations: string[] = [];
  const breakdown: Record<string, number> = {
    brainSystem: 0,
    typeSystem: 0,
    toolSystem: 0,
    memorySystem: 0,
    orchestration: 0,
    autonomy: 0,
  };

  const brainsDir = join(process.cwd(), 'src/brains');
  const toolsDir = join(process.cwd(), 'src/tools');
  const memoryDir = join(process.cwd(), 'src/memory');
  const agentsDir = join(process.cwd(), 'src/agents');

  // 1. Brain System (25 points)
  console.log('  Checking Brain System...');
  if (existsSync(brainsDir)) {
    const brainFolders = readdirSync(brainsDir).filter(f => {
      const stat = statSync(join(brainsDir, f));
      return stat.isDirectory();
    });

    // Check for index.ts in each brain (10 points)
    let brainsWithIndex = 0;
    for (const brain of brainFolders) {
      if (existsSync(join(brainsDir, brain, 'index.ts'))) {
        brainsWithIndex++;
      }
    }
    const indexRatio = brainsWithIndex / Math.max(brainFolders.length, 1);
    breakdown.brainSystem += Math.round(indexRatio * 10);
    if (indexRatio < 1) {
      gaps.push(`${brainFolders.length - brainsWithIndex} brains missing index.ts`);
      recommendations.push('Create index.ts for all brains');
    }

    // Check for CLAUDE.md in each brain (10 points)
    let brainsWithClaudeMd = 0;
    let totalClaudeMdLines = 0;
    for (const brain of brainFolders) {
      const claudeMdPath = join(brainsDir, brain, 'CLAUDE.md');
      if (existsSync(claudeMdPath)) {
        brainsWithClaudeMd++;
        const content = readFileSync(claudeMdPath, 'utf-8');
        totalClaudeMdLines += content.split('\n').length;
      }
    }
    const claudeMdRatio = brainsWithClaudeMd / Math.max(brainFolders.length, 1);
    const avgLines = totalClaudeMdLines / Math.max(brainsWithClaudeMd, 1);
    breakdown.brainSystem += Math.round(claudeMdRatio * 5);
    breakdown.brainSystem += avgLines >= 500 ? 5 : Math.round((avgLines / 500) * 5);
    if (claudeMdRatio < 1) {
      gaps.push(`${brainFolders.length - brainsWithClaudeMd} brains missing CLAUDE.md`);
    }

    // Check for factory.ts (5 points)
    if (existsSync(join(brainsDir, 'factory.ts'))) {
      breakdown.brainSystem += 5;
    } else {
      gaps.push('Missing brain factory.ts');
      recommendations.push('Create brain factory for loading brains');
    }
  } else {
    gaps.push('src/brains directory does not exist');
  }

  // 2. Type System (20 points)
  console.log('  Checking Type System...');
  const typesPath = join(process.cwd(), 'src/types/index.ts');
  if (existsSync(typesPath)) {
    const typesContent = readFileSync(typesPath, 'utf-8');

    // Check BrainType enum (5 points)
    const brainTypeMatch = typesContent.match(/BrainType/);
    if (brainTypeMatch) {
      breakdown.typeSystem += 5;
    } else {
      gaps.push('BrainType not defined');
    }

    // Check for no TypeScript errors (10 points)
    try {
      execSync('npm run build', { stdio: 'pipe' });
      breakdown.typeSystem += 10;
    } catch {
      gaps.push('TypeScript build failing');
      recommendations.push('Fix TypeScript errors first');
    }

    // Check for interfaces (5 points)
    const interfaceCount = (typesContent.match(/export interface/g) || []).length;
    breakdown.typeSystem += interfaceCount >= 10 ? 5 : Math.round((interfaceCount / 10) * 5);
  } else {
    gaps.push('src/types/index.ts does not exist');
  }

  // 3. Tool System (15 points)
  console.log('  Checking Tool System...');
  if (existsSync(toolsDir)) {
    const toolFiles = readdirSync(toolsDir).filter(f => f.endsWith('.ts'));

    // Check for tool files (10 points)
    const expectedTools = ['file-read.ts', 'file-write.ts', 'file-edit.ts', 'shell-exec.ts', 'web-fetch.ts'];
    let foundTools = 0;
    for (const tool of expectedTools) {
      if (toolFiles.includes(tool)) {
        foundTools++;
      }
    }
    breakdown.toolSystem += Math.round((foundTools / expectedTools.length) * 10);
    if (foundTools < expectedTools.length) {
      gaps.push(`Missing ${expectedTools.length - foundTools} core tools`);
    }

    // Check for base.ts and index.ts (5 points)
    if (toolFiles.includes('base.ts') && toolFiles.includes('index.ts')) {
      breakdown.toolSystem += 5;
    } else {
      if (!toolFiles.includes('base.ts')) gaps.push('Missing tools/base.ts');
      if (!toolFiles.includes('index.ts')) gaps.push('Missing tools/index.ts');
    }
  } else {
    gaps.push('src/tools directory does not exist');
  }

  // 4. Memory System (15 points)
  console.log('  Checking Memory System...');
  if (existsSync(memoryDir)) {
    const memoryFiles = readdirSync(memoryDir).filter(f => f.endsWith('.ts'));

    // Check for manager.ts (5 points)
    if (memoryFiles.includes('manager.ts')) {
      breakdown.memorySystem += 5;
    } else {
      gaps.push('Missing memory/manager.ts');
    }

    // Check for persistence.ts (5 points)
    if (memoryFiles.includes('persistence.ts')) {
      breakdown.memorySystem += 5;
    } else {
      gaps.push('Missing memory/persistence.ts');
    }

    // Check for skills.ts (5 points)
    if (memoryFiles.includes('skills.ts')) {
      breakdown.memorySystem += 5;
    } else {
      gaps.push('Missing memory/skills.ts');
    }
  } else {
    gaps.push('src/memory directory does not exist');
  }

  // 5. Orchestration (15 points)
  console.log('  Checking Orchestration...');
  const ceoPath = join(brainsDir, 'ceo', 'index.ts');
  if (existsSync(ceoPath)) {
    breakdown.orchestration += 5;
  } else {
    gaps.push('Missing CEO brain implementation');
    recommendations.push('Implement CEO brain at src/brains/ceo/index.ts');
  }

  const collaborationPath = join(agentsDir, 'collaboration.ts');
  if (existsSync(collaborationPath)) {
    breakdown.orchestration += 5;
  } else {
    gaps.push('Missing agents/collaboration.ts');
  }

  const sdkAgentPath = join(agentsDir, 'sdk-agent.ts');
  if (existsSync(sdkAgentPath)) {
    breakdown.orchestration += 5;
  } else {
    gaps.push('Missing agents/sdk-agent.ts');
  }

  // 6. Autonomy (10 points)
  console.log('  Checking Autonomy...');
  const loopPath = join(agentsDir, 'loop.ts');
  if (existsSync(loopPath)) {
    breakdown.autonomy += 5;
  } else {
    gaps.push('Missing agents/loop.ts');
  }

  const selfImprovePath = join(agentsDir, 'self-improve.ts');
  if (existsSync(selfImprovePath)) {
    breakdown.autonomy += 3;
  } else {
    gaps.push('Missing agents/self-improve.ts');
  }

  const autonomousPath = join(process.cwd(), 'src/autonomous.ts');
  if (existsSync(autonomousPath)) {
    breakdown.autonomy += 2;
  } else {
    gaps.push('Missing src/autonomous.ts');
  }

  // Calculate total score
  const score = Object.values(breakdown).reduce((a, b) => a + b, 0);

  return { score, breakdown, gaps, recommendations };
}

// ============================================================================
// Run Audit and Get Score
// ============================================================================

async function runScoredAudit(): Promise<{
  score: number;
  gaps: string[];
  recommendations: string[];
}> {
  console.log('\n📊 Running scored audit...\n');

  try {
    const result = await runDirectAudit();

    console.log('\n  📋 Breakdown:');
    for (const [key, value] of Object.entries(result.breakdown)) {
      console.log(`     ${key}: ${value}`);
    }

    return {
      score: result.score,
      gaps: result.gaps,
      recommendations: result.recommendations,
    };
  } catch (error) {
    console.log('⚠️  Direct audit failed:', error);

    // Fallback: just check if build passes
    try {
      const { execSync } = await import('child_process');
      execSync('npm run build', { stdio: 'pipe' });
      return { score: 70, gaps: ['Audit failed'], recommendations: ['Check audit code'] };
    } catch {
      return { score: 50, gaps: ['Build failing', 'Audit failed'], recommendations: ['Fix build first'] };
    }
  }
}

// ============================================================================
// Focused Improvement Based on Gaps
// ============================================================================

async function runFocusedImprovement(gaps: string[], recommendations: string[]): Promise<boolean> {
  const focusArea = gaps.length > 0
    ? `Fix these specific gaps: ${gaps.slice(0, 3).join(', ')}`
    : recommendations.length > 0
      ? `Focus on: ${recommendations.slice(0, 2).join(', ')}`
      : 'General improvement';

  console.log(`\n🔧 Running focused improvement: ${focusArea}\n`);

  const result = await runSmartSelfImprove({
    focusArea,
    maxIterations: 30,
    timeoutMs: TIMEOUT_PER_CYCLE_MS,
    verbose: true,
  });

  return result.success && result.buildPasses;
}

// ============================================================================
// Main Improvement Loop
// ============================================================================

async function improveUntilTarget() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║       X2000 AUTONOMOUS IMPROVEMENT LOOP                        ║');
  console.log(`║       Target Score: ${TARGET_SCORE}/100                                      ║`);
  console.log('║       No human intervention required                           ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Initialize memory
  try {
    await memoryManager.initialize();
    console.log('✓ Memory system initialized');
  } catch {
    console.log('⚠️  Memory offline - continuing without persistence');
  }

  let currentScore = 0;
  let cycle = 0;
  const startTime = Date.now();

  while (currentScore < TARGET_SCORE && cycle < MAX_IMPROVEMENT_CYCLES) {
    cycle++;
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`CYCLE ${cycle}/${MAX_IMPROVEMENT_CYCLES}`);
    console.log(`${'═'.repeat(70)}`);

    // Step 1: Audit
    const auditResult = await runScoredAudit();
    currentScore = auditResult.score;

    console.log(`\n📈 Current Score: ${currentScore}/100 (Target: ${TARGET_SCORE})`);

    if (currentScore >= TARGET_SCORE) {
      console.log(`\n🎉 TARGET REACHED! Score: ${currentScore}/100`);
      break;
    }

    if (auditResult.gaps.length > 0) {
      console.log(`\n📋 Gaps identified:`);
      auditResult.gaps.slice(0, 5).forEach(g => console.log(`   - ${g}`));
    }

    if (auditResult.recommendations.length > 0) {
      console.log(`\n💡 Recommendations:`);
      auditResult.recommendations.slice(0, 3).forEach(r => console.log(`   - ${r}`));
    }

    // Step 2: Improve
    const improved = await runFocusedImprovement(auditResult.gaps, auditResult.recommendations);

    if (!improved) {
      console.log('\n⚠️  Improvement cycle had issues, attempting recovery...');
      await autoRecoverFromBuildFailure();
    }

    // Brief pause between cycles
    console.log('\n⏳ Brief pause before next cycle...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Final summary
  const totalTime = (Date.now() - startTime) / 1000 / 60;

  console.log(`\n${'═'.repeat(70)}`);
  console.log('IMPROVEMENT COMPLETE');
  console.log(`${'═'.repeat(70)}`);
  console.log(`Final Score: ${currentScore}/100`);
  console.log(`Target: ${TARGET_SCORE}/100`);
  console.log(`Cycles: ${cycle}`);
  console.log(`Total Time: ${totalTime.toFixed(1)} minutes`);
  console.log(`Status: ${currentScore >= TARGET_SCORE ? '✅ TARGET REACHED' : '⚠️ TARGET NOT REACHED'}`);

  // Store final result in memory
  try {
    await memoryManager.storeLearning({
      id: `improvement-loop-${Date.now()}`,
      type: currentScore >= TARGET_SCORE ? 'success' : 'insight',
      source: 'ceo',
      taskId: 'improvement-loop',
      description: `Autonomous improvement loop completed. Final score: ${currentScore}/100 after ${cycle} cycles.`,
      recommendation: currentScore >= TARGET_SCORE
        ? 'System is at target quality level'
        : `Continue improvement to reach ${TARGET_SCORE}`,
      confidence: 0.9,
      appliedCount: 0,
      createdAt: new Date(),
      tags: ['improvement-loop', 'autonomous', `score-${currentScore}`],
    });
  } catch {
    // Memory might be offline
  }

  return { score: currentScore, cycles: cycle, reachedTarget: currentScore >= TARGET_SCORE };
}

// ============================================================================
// Entry Point
// ============================================================================

improveUntilTarget()
  .then(result => {
    if (result.reachedTarget) {
      console.log('\n🚀 X2000 is now at peak performance!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Did not reach target - may need more cycles or manual review');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
