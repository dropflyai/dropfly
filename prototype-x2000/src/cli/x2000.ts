#!/usr/bin/env node
/**
 * X2000 CLI
 *
 * Simple command-line interface for the autonomous AI fleet.
 * Works with any LLM provider.
 *
 * Usage:
 *   x2000 "build me an app"
 *   x2000 --provider ollama "research competitors"
 *   x2000 --interactive
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';
import * as readline from 'readline';

// Load environment
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '../..');
config({ path: resolve(rootDir, '.env') });

import { providerManager, type ProviderType } from '../ai/providers/index.js';
import { AgentLoop } from '../agents/loop.js';
import { memoryManager } from '../memory/manager.js';
import type { Task } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// CLI Configuration
// ============================================================================

interface CLIOptions {
  provider: ProviderType;
  interactive: boolean;
  verbose: boolean;
  maxIterations: number;
}

function parseArgs(): { task: string | null; options: CLIOptions } {
  const args = process.argv.slice(2);
  const options: CLIOptions = {
    provider: 'auto',
    interactive: false,
    verbose: false,
    maxIterations: 50,
  };

  let task: string | null = null;
  let i = 0;

  while (i < args.length) {
    const arg = args[i];

    if (arg === '--provider' || arg === '-p') {
      options.provider = args[++i] as ProviderType;
    } else if (arg === '--interactive' || arg === '-i') {
      options.interactive = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--max-iterations' || arg === '-m') {
      options.maxIterations = parseInt(args[++i]);
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (arg === '--version') {
      printVersion();
      process.exit(0);
    } else if (!arg.startsWith('-')) {
      task = arg;
    }

    i++;
  }

  return { task, options };
}

function printHelp(): void {
  console.log(`
X2000 - Autonomous AI Fleet

Usage:
  x2000 [options] "your task here"

Options:
  -p, --provider <type>     LLM provider (anthropic, openai, ollama, auto)
  -i, --interactive         Interactive mode (continuous conversation)
  -v, --verbose             Show detailed output
  -m, --max-iterations <n>  Maximum iterations per task (default: 50)
  -h, --help                Show this help message
  --version                 Show version

Examples:
  x2000 "build a REST API for user management"
  x2000 --provider ollama "analyze this codebase"
  x2000 -i  # Start interactive mode

Environment Variables:
  ANTHROPIC_API_KEY   - For Claude (Anthropic)
  OPENAI_API_KEY      - For GPT-4 (OpenAI)

For local models, run: ollama serve
`);
}

function printVersion(): void {
  try {
    const pkg = JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf-8'));
    console.log(`X2000 v${pkg.version}`);
  } catch {
    console.log('X2000 v0.1.0');
  }
}

function printBanner(): void {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   ██╗  ██╗██████╗  ██████╗  ██████╗  ██████╗                             ║
║   ╚██╗██╔╝╚════██╗██╔═████╗██╔═████╗██╔═████╗                            ║
║    ╚███╔╝  █████╔╝██║██╔██║██║██╔██║██║██╔██║                            ║
║    ██╔██╗ ██╔═══╝ ████╔╝██║████╔╝██║████╔╝██║                            ║
║   ██╔╝ ██╗███████╗╚██████╔╝╚██████╔╝╚██████╔╝                            ║
║   ╚═╝  ╚═╝╚══════╝ ╚═════╝  ╚═════╝  ╚═════╝                             ║
║                                                                           ║
║   Autonomous AI Fleet · 46 Specialized Brains · Forever Learning         ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);
}

// ============================================================================
// Task Execution
// ============================================================================

async function executeTask(taskDescription: string, options: CLIOptions): Promise<void> {
  const task: Task = {
    id: uuidv4(),
    subject: 'CLI Task',
    description: taskDescription,
    status: 'in_progress',
    priority: 'high',
    subtaskIds: [],
    blockedBy: [],
    blocks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: { source: 'cli', provider: providerManager.currentProvider },
  };

  console.log(`\n🚀 Starting task: ${taskDescription.slice(0, 60)}...`);
  console.log(`📡 Using provider: ${providerManager.currentProvider}`);
  console.log('');

  const loop = new AgentLoop({
    brainType: 'ceo',
    trustLevel: 4,
    maxIterations: options.maxIterations,
    maxToolCalls: options.maxIterations * 3,
    timeoutMs: 600000,
    retryOnError: true,
    selfCorrect: true,
    onIteration: (iter) => {
      if (options.verbose) {
        console.log(`\n[Iteration ${iter.iteration}]`);
        console.log(`Thought: ${iter.thought.slice(0, 200)}...`);
        if (iter.action) {
          const status = iter.action.result.success ? '✓' : '✗';
          console.log(`Action: ${iter.action.tool} ${status}`);
        }
      } else {
        process.stdout.write('.');
      }
    },
  });

  const result = await loop.run(task);

  console.log('\n');
  console.log('═'.repeat(70));
  console.log(`\n✅ Task ${result.success ? 'completed' : 'finished with issues'}`);
  console.log(`   Iterations: ${result.iterations.length}`);
  console.log(`   Tool calls: ${result.toolCalls.length}`);
  console.log(`   Duration: ${(result.totalDuration / 1000).toFixed(1)}s`);

  if (result.output) {
    console.log('\n📋 Output:');
    console.log(typeof result.output === 'string' ? result.output : JSON.stringify(result.output, null, 2));
  }

  if (result.learnings.length > 0) {
    console.log('\n💡 Learnings:');
    result.learnings.forEach(l => console.log(`   - ${l}`));
  }
}

// ============================================================================
// Interactive Mode
// ============================================================================

async function interactiveMode(options: CLIOptions): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('\n🤖 X2000 Interactive Mode');
  console.log('   Type your task and press Enter. Type "exit" to quit.\n');

  const prompt = (): void => {
    rl.question('x2000> ', async (input) => {
      const trimmed = input.trim();

      if (trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === 'quit') {
        console.log('\n👋 Goodbye!\n');
        rl.close();
        process.exit(0);
      }

      if (trimmed.toLowerCase() === 'status') {
        console.log(`\n📊 Status:`);
        console.log(`   Provider: ${providerManager.currentProvider}`);
        console.log(`   Available: ${providerManager.listAvailable().join(', ')}`);
        prompt();
        return;
      }

      if (trimmed.toLowerCase().startsWith('switch ')) {
        const provider = trimmed.slice(7).trim() as ProviderType;
        try {
          providerManager.switchTo(provider);
          console.log(`\n✓ Switched to ${provider}`);
        } catch (e) {
          console.log(`\n✗ ${e}`);
        }
        prompt();
        return;
      }

      if (trimmed) {
        try {
          await executeTask(trimmed, options);
        } catch (error) {
          console.error(`\n❌ Error: ${error}`);
        }
      }

      prompt();
    });
  };

  prompt();
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  const { task, options } = parseArgs();

  printBanner();

  // Initialize providers
  await providerManager.initialize({
    preferredProvider: options.provider,
  });

  if (providerManager.listAvailable().length === 0) {
    console.error('\n❌ No LLM providers available.');
    console.error('   Set ANTHROPIC_API_KEY, OPENAI_API_KEY, or run Ollama locally.');
    process.exit(1);
  }

  // Initialize memory
  try {
    await memoryManager.initialize();
    console.log('[X2000] ✓ Memory system initialized');
  } catch {
    console.log('[X2000] ⚠️  Memory system offline');
  }

  // Run in appropriate mode
  if (options.interactive || !task) {
    await interactiveMode(options);
  } else {
    await executeTask(task, options);
  }
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
