#!/usr/bin/env node
/**
 * X2000 CLI
 *
 * Main entry point for the X2000 autonomous AI fleet.
 * Like OpenClaw - runs as a daemon service with channel support.
 *
 * Usage:
 *   x2000 setup          - Interactive setup wizard
 *   x2000 gateway        - Start the gateway server (foreground)
 *   x2000 daemon [cmd]   - Manage background service
 *   x2000 status         - Check system status
 *   x2000 message "..."  - Send a message directly
 *   x2000 "task"         - Quick task execution (legacy mode)
 */

import { config } from 'dotenv';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';
import { homedir } from 'os';

// Load environment
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '../..');
const X2000_DIR = join(homedir(), '.x2000');
const CONFIG_PATH = join(X2000_DIR, 'config.json');

config({ path: join(X2000_DIR, '.env') });
config({ path: resolve(rootDir, '.env') });

// ============================================================================
// Helpers
// ============================================================================

function printBanner(): void {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                             ║
║   ██╗  ██╗██████╗  ██████╗  ██████╗  ██████╗                               ║
║   ╚██╗██╔╝╚════██╗██╔═████╗██╔═████╗██╔═████╗                              ║
║    ╚███╔╝  █████╔╝██║██╔██║██║██╔██║██║██╔██║                              ║
║    ██╔██╗ ██╔═══╝ ████╔╝██║████╔╝██║████╔╝██║                              ║
║   ██╔╝ ██╗███████╗╚██████╔╝╚██████╔╝╚██████╔╝                              ║
║   ╚═╝  ╚═╝╚══════╝ ╚═════╝  ╚═════╝  ╚═════╝                               ║
║                                                                             ║
║   Autonomous AI Fleet · 46 Specialized Brains · Forever Learning           ║
║                                                                             ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);
}

function printHelp(): void {
  console.log(`
X2000 - Autonomous AI Fleet

Commands:
  login              Authenticate with your Claude subscription
  logout             Remove stored credentials
  setup, onboard     Interactive setup wizard
  gateway, start     Start the gateway server (foreground)
  daemon <action>    Manage background service
                     Actions: install, uninstall, start, stop, restart, status, logs
  status             Check system status
  message, msg       Send a message to X2000
  channels           Manage communication channels
  help               Show this help message

Quick Task (Legacy):
  x2000 "your task"  Execute a task directly (uses existing provider setup)

Options:
  -p, --provider     LLM provider (anthropic, openai, ollama)
  -v, --verbose      Show detailed output
  -h, --help         Show this help message
  --version          Show version

Examples:
  x2000 login                    # Connect to your Claude subscription
  x2000 setup                    # First-time setup
  x2000 gateway                  # Start server
  x2000 daemon install           # Install as background service
  x2000 msg "build an API"       # Send a task

For more info: https://github.com/x2000
`);
}

function printVersion(): void {
  try {
    const pkg = JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf-8'));
    console.log(`X2000 v${pkg.version}`);
  } catch {
    console.log('X2000 v2.0.0');
  }
}

// ============================================================================
// Commands
// ============================================================================

async function cmdSetup(): Promise<void> {
  const { runOnboardingWizard } = await import('../onboarding/wizard.js');
  await runOnboardingWizard();
}

async function cmdGateway(): Promise<void> {
  // Check if configured
  if (!existsSync(CONFIG_PATH)) {
    console.log('X2000 is not configured. Running setup wizard...\n');
    const { runOnboardingWizard } = await import('../onboarding/wizard.js');
    const config = await runOnboardingWizard();
    if (!config) {
      process.exit(1);
    }
  }

  const { startGateway } = await import('../gateway/index.js');
  await startGateway();
}

async function cmdDaemon(action: string, args: string[]): Promise<void> {
  const { runDaemonCommand } = await import('../daemon/index.js');
  await runDaemonCommand(action, args);
}

async function cmdStatus(): Promise<void> {
  const { status } = await import('../daemon/index.js');
  const daemonStatus = await status();

  console.log('\n╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                           X2000 STATUS                                     ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

  // Config
  if (existsSync(CONFIG_PATH)) {
    const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
    console.log('Configuration:');
    console.log(`  Provider:    ${config.provider}`);
    console.log(`  Model:       ${config.model}`);
    console.log(`  Trust Level: ${config.trustLevel}`);
    console.log(`  Port:        ${config.port}`);
  } else {
    console.log('Configuration: Not set up');
    console.log('  Run "x2000 setup" to configure');
  }

  console.log('');

  // Daemon
  console.log('Daemon Service:');
  console.log(`  Installed:   ${daemonStatus.installed ? 'Yes' : 'No'}`);
  console.log(`  Running:     ${daemonStatus.running ? 'Yes' : 'No'}`);
  if (daemonStatus.pid) {
    console.log(`  PID:         ${daemonStatus.pid}`);
  }

  console.log('');

  // Gateway check
  try {
    const response = await fetch('http://localhost:3000/health');
    if (response.ok) {
      console.log('Gateway:');
      console.log('  Status:      Running');
      console.log('  URL:         http://localhost:3000');
    }
  } catch {
    if (!daemonStatus.running) {
      console.log('Gateway:       Not running');
      console.log('  Run "x2000 gateway" or "x2000 daemon start"');
    }
  }

  console.log('');
}

async function cmdMessage(content: string, sessionKey = 'default'): Promise<void> {
  try {
    const response = await fetch('http://localhost:3000/api/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        sessionKey,
        channel: 'cli',
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log('\n' + result.result);
      if (result.toolCalls > 0) {
        console.log(`\n[${result.toolCalls} tool calls]`);
      }
    } else {
      console.error('Error:', result.error);
    }
  } catch {
    console.error('Failed to connect to X2000 gateway.');
    console.error('Make sure the gateway is running: x2000 gateway');
  }
}

async function cmdChannels(): Promise<void> {
  if (!existsSync(CONFIG_PATH)) {
    console.log('X2000 is not configured. Run "x2000 setup" first.');
    return;
  }

  const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));

  console.log('\nConfigured Channels:');
  if (config.channels?.telegram?.enabled) {
    console.log('  • Telegram: Enabled');
  }
  if (config.channels?.imessage?.enabled) {
    console.log('  • iMessage: Enabled');
  }
  if (!config.channels || Object.keys(config.channels).length === 0) {
    console.log('  No channels configured');
    console.log('  Run "x2000 setup" to add channels');
  }
  console.log('');
}

// Legacy: Direct task execution
async function cmdLegacyTask(task: string, verbose = false): Promise<void> {
  const { providerManager } = await import('../ai/providers/index.js');
  const { AgentLoop } = await import('../agents/loop.js');
  const { memoryManager } = await import('../memory/manager.js');
  const { v4: uuidv4 } = await import('uuid');

  // Initialize
  await providerManager.initialize({ preferredProvider: 'auto' });

  if (providerManager.listAvailable().length === 0) {
    console.error('\n❌ No LLM providers available.');
    console.error('   Run "x2000 setup" to configure, or set ANTHROPIC_API_KEY');
    process.exit(1);
  }

  try {
    await memoryManager.initialize();
  } catch {
    // Memory offline is OK
  }

  console.log(`\n🚀 Task: ${task.slice(0, 60)}...`);
  console.log(`📡 Provider: ${providerManager.currentProvider}\n`);

  const taskObj = {
    id: uuidv4(),
    subject: 'CLI Task',
    description: task,
    status: 'in_progress' as const,
    priority: 'high' as const,
    subtaskIds: [],
    blockedBy: [],
    blocks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: { source: 'cli' },
  };

  const loop = new AgentLoop({
    brainType: 'ceo',
    trustLevel: 4,
    maxIterations: 50,
    onIteration: (iter) => {
      if (verbose) {
        console.log(`[${iter.iteration}] ${iter.thought.slice(0, 100)}...`);
      } else {
        process.stdout.write('.');
      }
    },
  });

  const result = await loop.run(taskObj);

  console.log('\n\n' + '═'.repeat(70));
  console.log(`✅ ${result.success ? 'Completed' : 'Finished'}`);
  console.log(`   Iterations: ${result.iterations.length} | Tools: ${result.toolCalls.length}`);

  if (result.output) {
    console.log('\n' + (typeof result.output === 'string' ? result.output : JSON.stringify(result.output, null, 2)));
  }
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    printBanner();
    printHelp();
    return;
  }

  const cmd = args[0];

  // Handle flags
  if (cmd === '-h' || cmd === '--help' || cmd === 'help') {
    printHelp();
    return;
  }

  if (cmd === '--version') {
    printVersion();
    return;
  }

  // Handle commands
  switch (cmd) {
    case 'login': {
      const { login } = await import('../auth/oauth.js');
      await login();
      break;
    }

    case 'logout': {
      const { logout } = await import('../auth/oauth.js');
      logout();
      break;
    }

    case 'setup':
    case 'onboard':
      await cmdSetup();
      break;

    case 'gateway':
    case 'start':
      await cmdGateway();
      break;

    case 'daemon':
      await cmdDaemon(args[1] || 'help', args.slice(2));
      break;

    case 'status':
      await cmdStatus();
      break;

    case 'message':
    case 'msg':
      if (!args[1]) {
        console.error('Usage: x2000 message "your message"');
        process.exit(1);
      }
      await cmdMessage(args[1], args[2]);
      break;

    case 'channels':
      if (args[1] === 'add' && args[2]) {
        const { addChannel } = await import('../onboarding/wizard.js');
        await addChannel(args[2]);
      } else {
        await cmdChannels();
      }
      break;

    default:
      // Legacy: treat as direct task
      if (!cmd.startsWith('-')) {
        printBanner();
        await cmdLegacyTask(cmd, args.includes('-v') || args.includes('--verbose'));
      } else {
        console.error(`Unknown command: ${cmd}`);
        printHelp();
        process.exit(1);
      }
  }
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
