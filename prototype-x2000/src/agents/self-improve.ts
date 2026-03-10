/**
 * X2000 Self-Improvement Agent
 *
 * Smart self-improvement with redundancy prevention.
 * Understands the codebase before making changes.
 */

import { AgentLoop } from './loop.js';
import { memoryManager } from '../memory/manager.js';
import type { Task } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// Codebase Context - What Already Exists
// ============================================================================

const EXISTING_INFRASTRUCTURE = `
## X2000 EXISTING INFRASTRUCTURE - DO NOT DUPLICATE

### Brain System (src/brains/)
- base.ts: BaseBrain class - ALL brains extend this
- factory.ts: Brain factory with lazy loading for all 44 brains
- 44 brain directories, each with index.ts and CLAUDE.md

### Agent System (src/agents/)
- sdk-agent.ts: SDKAgent and DepartmentHeadAgent classes
- loop.ts: AgentLoop for autonomous execution
- spawn.ts: Agent spawning
- session.ts: Session management
- collaboration.ts: Brain tension protocol
- persistence.ts: Session persistence

### Memory System (src/memory/)
- manager.ts: MemoryManager with patterns, learnings, skills, decisions
- persistence.ts: Supabase persistence
- skills.ts: Skill pool management
- extraction.ts: Pattern extraction

### Tool System (src/tools/)
- base.ts: Tool interface and registry
- file-read.ts: Read files
- file-write.ts: Write files
- file-edit.ts: Edit files (search/replace)
- shell-exec.ts: Execute shell commands
- web-fetch.ts: Fetch URLs
- web-search.ts: Web search
- git.ts: Git operations
- browser.ts: Browser automation
- email.ts: Email operations
- process.ts: Process management
- vision.ts: Image analysis
- resolver.ts: Dependency resolution
- index.ts: Tool exports

### Guardrails (src/guardrails/)
- layers.ts: 5-layer guardrail system
- autonomy.ts: Earned autonomy / trust levels

### AI (src/ai/)
- client.ts: Anthropic API client
- executor.ts: AI execution with tools
- prompts.ts: Brain-specific prompts

### CLI (src/cli/)
- index.ts: Main CLI entry
- commands/: CLI commands

### Types (src/types/)
- index.ts: All type definitions including BrainType (44 types)

### Key Files
- autonomous.ts: Autonomous runner
- index.ts: Main exports

## RULES FOR SELF-IMPROVEMENT

1. **NEVER create new files that duplicate existing functionality**
2. **ALWAYS read existing files before modifying**
3. **ALWAYS use existing types from src/types/index.ts**
4. **ALWAYS use .js extensions in imports (ESM requirement)**
5. **RUN npm run build after changes to verify**
6. **FIX TypeScript errors before moving on**

## WHAT TO LOOK FOR

1. Missing exports in index files
2. Type mismatches or errors
3. Incomplete implementations
4. Missing error handling
5. Documentation gaps in CLAUDE.md files
6. Inconsistencies between brains
`;

// ============================================================================
// Smart Self-Improvement Task
// ============================================================================

export function createSelfImproveTask(focusArea?: string): Task {
  const baseDescription = `You are X2000, an autonomous AI fleet. Your task is to improve yourself.

## CRITICAL: READ THIS FIRST
${EXISTING_INFRASTRUCTURE}

## Your Mission
${focusArea ? `Focus on: ${focusArea}` : 'Find and fix ALL gaps in the codebase.'}

## Step-by-Step Process

### Phase 1: UNDERSTAND (Do this first!)
1. Read src/types/index.ts to understand types
2. Read src/brains/base.ts to understand brain structure
3. Read src/tools/index.ts to understand tool system
4. Read manifest.json for current system state

### Phase 2: ANALYZE
1. Check for TypeScript errors: Run "npm run build"
2. Check brain implementations match the base class
3. Check all exports are correct
4. Identify actual gaps (not things that already exist)

### Phase 3: FIX (Only after understanding!)
1. Fix ONE issue at a time
2. Run "npm run build" after each fix
3. If build fails, fix the error before continuing
4. Use EXISTING types - don't create new ones

### Phase 4: VERIFY
1. Run "npm run build" - must pass
2. Run "npm run typecheck" - must pass
3. Confirm no duplicate files created

## FORBIDDEN ACTIONS
- DO NOT create src/utils/ directory (use console.log)
- DO NOT create new type files (use src/types/index.ts)
- DO NOT create X2000 class (CEO Brain handles orchestration)
- DO NOT create redundant tools (check src/tools/ first)
- DO NOT use imports without .js extension

## SUCCESS CRITERIA
- Build passes (npm run build)
- No duplicate functionality
- All changes improve existing code
- Memory logs learnings`;

  return {
    id: uuidv4(),
    subject: 'X2000 Smart Self-Improvement',
    description: baseDescription,
    status: 'in_progress',
    priority: 'high',
    subtaskIds: [],
    blockedBy: [],
    blocks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      autonomous: true,
      selfImprove: true,
      hasRedundancyPrevention: true,
      focusArea: focusArea || 'all'
    },
  };
}

// ============================================================================
// Redundancy Prevention System
// ============================================================================

export const REDUNDANCY_CHECKS = {
  // Files that should NEVER be created
  forbiddenPaths: [
    'src/utils/',           // Use console.log or existing logging
    'src/x2000.ts',         // CEO Brain handles orchestration
    'src/core/',            // Already have brains/agents/tools structure
    'src/lib/',             // Use existing modules
    'src/helpers/',         // Use existing utilities
    'src/common/',          // Use types/index.ts
  ],

  // CRITICAL: Files that should NEVER be deleted by auto-recovery
  protectedPaths: [
    'src/agents/loop.ts',
    'src/agents/spawn.ts',
    'src/agents/index.ts',
    'src/agents/self-improve.ts',
    'src/agents/sdk-agent.ts',
    'src/agents/session.ts',
    'src/agents/persistence.ts',
    'src/agents/collaboration.ts',
    'src/autonomous.ts',
    'src/improve-until-target.ts',
    'src/tools/base.ts',
    'src/tools/index.ts',
    'src/tools/file-read.ts',
    'src/tools/file-write.ts',
    'src/tools/file-edit.ts',
    'src/tools/shell-exec.ts',
    'src/tools/web-fetch.ts',
    'src/tools/git.ts',
    'src/memory/manager.ts',
    'src/memory/persistence.ts',
    'src/types/index.ts',
    'src/brains/base.ts',
    'src/brains/factory.ts',
    'src/brains/ceo/index.ts',
    'src/ai/client.ts',
    'src/ai/executor.ts',
  ],

  // Functionality that already exists
  existingCapabilities: {
    'logging': 'Use console.log or create in src/agents/',
    'file operations': 'src/tools/file-read.ts, file-write.ts, file-edit.ts',
    'shell execution': 'src/tools/shell-exec.ts',
    'brain orchestration': 'src/brains/ceo/index.ts',
    'agent spawning': 'src/agents/spawn.ts',
    'memory persistence': 'src/memory/persistence.ts',
    'type definitions': 'src/types/index.ts',
    'tool registry': 'src/tools/base.ts and index.ts',
  },

  // Required patterns for new files
  requiredPatterns: {
    imports: '.js extension required for ESM',
    types: 'Import from ../types/index.js',
    exports: 'Use named exports, add to index.ts',
  }
};

// ============================================================================
// Pre-Flight Check
// ============================================================================

export async function runPreFlightCheck(): Promise<{
  ready: boolean;
  issues: string[];
  recommendations: string[];
}> {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check if build passes
  try {
    const { execSync } = await import('child_process');
    execSync('npm run build', { stdio: 'pipe' });
  } catch {
    issues.push('Build is currently failing - fix this first');
  }

  // Check memory is initialized
  try {
    await memoryManager.initialize();
  } catch {
    recommendations.push('Memory system offline - learnings won\'t persist');
  }

  return {
    ready: issues.length === 0,
    issues,
    recommendations,
  };
}

// ============================================================================
// Automatic Cleanup System
// ============================================================================

export async function detectAndCleanDuplicates(): Promise<{
  cleaned: string[];
  buildFixed: boolean;
}> {
  const { execSync } = await import('child_process');
  const { existsSync, rmSync } = await import('fs');
  const { join } = await import('path');

  const cleaned: string[] = [];
  const cwd = process.cwd();

  console.log('[AutoClean] Checking for duplicate/forbidden paths...');

  // Remove forbidden directories that shouldn't exist
  for (const forbiddenPath of REDUNDANCY_CHECKS.forbiddenPaths) {
    const fullPath = join(cwd, forbiddenPath);
    if (existsSync(fullPath)) {
      console.log(`[AutoClean] Removing forbidden path: ${forbiddenPath}`);
      try {
        rmSync(fullPath, { recursive: true, force: true });
        cleaned.push(forbiddenPath);
      } catch (e) {
        console.log(`[AutoClean] Failed to remove ${forbiddenPath}: ${e}`);
      }
    }
  }

  // Check if build passes now
  let buildFixed = false;
  try {
    execSync('npm run build', { stdio: 'pipe', cwd });
    buildFixed = true;
    console.log('[AutoClean] Build passes after cleanup ✓');
  } catch {
    console.log('[AutoClean] Build still failing after cleanup');
    buildFixed = false;
  }

  return { cleaned, buildFixed };
}

export async function autoRecoverFromBuildFailure(): Promise<boolean> {
  const { execSync } = await import('child_process');

  console.log('[AutoRecover] Build failed, attempting automatic recovery...');

  // Step 1: Clean duplicates
  const { cleaned, buildFixed } = await detectAndCleanDuplicates();

  if (buildFixed) {
    console.log(`[AutoRecover] Fixed by removing: ${cleaned.join(', ')}`);

    // Log this as a learning
    try {
      await memoryManager.storeLearning({
        id: `learning-autoclean-${Date.now()}`,
        type: 'failure',
        source: 'ceo',
        taskId: 'auto-recovery',
        description: `Auto-cleaned duplicate files: ${cleaned.join(', ')}. Build now passes.`,
        recommendation: 'Do not create files in these paths: ' + cleaned.join(', '),
        confidence: 1.0,
        appliedCount: 0,
        createdAt: new Date(),
        tags: ['auto-cleanup', 'build-fix', 'duplicates'],
      });
    } catch {
      // Memory might be offline
    }

    return true;
  }

  // Step 2: Try reverting recent git changes
  console.log('[AutoRecover] Attempting git restore of problematic files...');
  try {
    // Get files that are causing build errors
    const buildOutput = execSync('npm run build 2>&1 || true', { encoding: 'utf8' });

    // Extract file paths from error messages
    const errorFileMatch = buildOutput.match(/src\/[^\s:]+\.ts/g);
    if (errorFileMatch) {
      const uniqueFiles = [...new Set(errorFileMatch)];

      for (const file of uniqueFiles) {
        // CRITICAL: Never delete protected files
        if (REDUNDANCY_CHECKS.protectedPaths.some(p => file.includes(p) || p.includes(file))) {
          console.log(`[AutoRecover] Skipping protected file: ${file}`);
          continue;
        }

        // Check if this is a new file (not in git)
        try {
          execSync(`git ls-files --error-unmatch ${file}`, { stdio: 'pipe' });
        } catch {
          // File is not tracked - it's new, delete it ONLY if not protected
          console.log(`[AutoRecover] Removing untracked file: ${file}`);
          const { rmSync } = await import('fs');
          try {
            rmSync(file, { force: true });
          } catch {
            // File might already be gone
          }
        }
      }
    }

    // Check if build passes now
    execSync('npm run build', { stdio: 'pipe' });
    console.log('[AutoRecover] Build fixed after removing untracked files ✓');
    return true;
  } catch {
    console.log('[AutoRecover] Could not auto-recover build');
    return false;
  }
}

// ============================================================================
// Smart Self-Improvement Runner
// ============================================================================

export async function runSmartSelfImprove(options: {
  focusArea?: string;
  maxIterations?: number;
  timeoutMs?: number;
  verbose?: boolean;
} = {}): Promise<{
  success: boolean;
  iterations: number;
  changes: string[];
  learnings: string[];
  buildPasses: boolean;
}> {
  const {
    focusArea,
    maxIterations = 30,
    timeoutMs = 600000,
    verbose = true,
  } = options;

  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║       X2000 SMART SELF-IMPROVEMENT                             ║');
  console.log('║       With Redundancy Prevention                               ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Pre-flight check
  console.log('Running pre-flight checks...');
  const preflight = await runPreFlightCheck();

  if (!preflight.ready) {
    console.log('❌ Pre-flight failed:');
    preflight.issues.forEach(i => console.log(`   - ${i}`));
    return {
      success: false,
      iterations: 0,
      changes: [],
      learnings: ['Pre-flight check failed'],
      buildPasses: false,
    };
  }

  if (preflight.recommendations.length > 0) {
    console.log('⚠️  Recommendations:');
    preflight.recommendations.forEach(r => console.log(`   - ${r}`));
  }

  console.log('✓ Pre-flight passed\n');

  // Initialize memory
  try {
    await memoryManager.initialize();
    console.log('✓ Memory system initialized\n');
  } catch {
    console.log('⚠️  Memory system offline\n');
  }

  // Create the smart task
  const task = createSelfImproveTask(focusArea);

  // Run with AgentLoop
  const loop = new AgentLoop({
    brainType: 'ceo',
    trustLevel: 4,
    maxIterations,
    maxToolCalls: maxIterations * 3,
    timeoutMs,
    retryOnError: true,
    maxRetries: 3,
    selfCorrect: true,
    autoResolveDependencies: true,
    onIteration: (iter) => {
      if (verbose) {
        console.log(`\n[Iteration ${iter.iteration}]`);
        console.log(`Thought: ${iter.thought.slice(0, 150)}...`);
        if (iter.action) {
          const status = iter.action.result.success ? '✓' : '✗';
          console.log(`Action: ${iter.action.tool} ${status}`);
        }
      }
    },
  });

  console.log('Starting smart self-improvement...\n');
  console.log('═'.repeat(70) + '\n');

  const result = await loop.run(task);

  // Verify build still passes - with automatic recovery
  let buildPasses = false;
  try {
    const { execSync } = await import('child_process');
    execSync('npm run build', { stdio: 'pipe' });
    buildPasses = true;
  } catch {
    console.log('\n⚠️  Build failed - attempting automatic recovery...');

    // Try automatic recovery
    const recovered = await autoRecoverFromBuildFailure();

    if (recovered) {
      console.log('✓ Build automatically recovered!');
      buildPasses = true;
    } else {
      console.log('✗ Could not auto-recover - manual intervention needed');
      buildPasses = false;
    }
  }

  console.log('\n' + '═'.repeat(70));
  console.log('\nSmart Self-Improvement Complete!');
  console.log(`Success: ${result.success}`);
  console.log(`Iterations: ${result.iterations.length}`);
  console.log(`Tool Calls: ${result.toolCalls.length}`);
  console.log(`Build Passes: ${buildPasses ? '✓' : '✗'}`);
  console.log(`Duration: ${(result.totalDuration / 1000).toFixed(1)}s`);

  if (result.learnings.length > 0) {
    console.log('\nLearnings:');
    result.learnings.forEach(l => console.log(`  - ${l}`));
  }

  // Extract changes made
  const changes = result.toolCalls
    .filter(tc => tc.tool === 'file_write' || tc.tool === 'file_edit')
    .map(tc => `${tc.tool}: ${JSON.stringify(tc.params).slice(0, 100)}`);

  return {
    success: result.success && buildPasses,
    iterations: result.iterations.length,
    changes,
    learnings: result.learnings,
    buildPasses,
  };
}
