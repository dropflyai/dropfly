/**
 * X2000 Onboarding Wizard
 *
 * A simple, guided setup wizard that's easier than OpenClaw.
 * Key improvements:
 * - Single clear path with progressive disclosure
 * - Unified credential storage
 * - Better defaults that just work
 * - Guided channel setup with step-by-step instructions
 * - Dependency checking before hitting errors
 * - Health verification at the end
 */

import * as readline from 'readline';
import { existsSync, mkdirSync, writeFileSync, readFileSync, chmodSync } from 'fs';
import { join } from 'path';
import { homedir, platform } from 'os';
import { execSync, spawn } from 'child_process';
import type { X2000Config } from '../gateway/index.js';

const X2000_DIR = join(homedir(), '.x2000');
const CONFIG_PATH = join(X2000_DIR, 'config.json');
const CREDENTIALS_PATH = join(X2000_DIR, 'credentials.json');

// ============================================================================
// Terminal Helpers
// ============================================================================

function createPrompt(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

async function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function askSecret(rl: readline.Interface, question: string): Promise<string> {
  // For secrets, we'd ideally hide input but readline doesn't support it
  // In production, use a proper terminal library
  return ask(rl, question);
}

async function select(
  rl: readline.Interface,
  message: string,
  options: Array<{ value: string; label: string; description?: string; recommended?: boolean }>
): Promise<string> {
  console.log(`\n${message}`);
  options.forEach((opt, i) => {
    const rec = opt.recommended ? ' (Recommended)' : '';
    const desc = opt.description ? ` - ${opt.description}` : '';
    console.log(`  ${i + 1}. ${opt.label}${rec}${desc}`);
  });

  while (true) {
    const answer = await ask(rl, `\nSelect (1-${options.length}): `);
    const num = parseInt(answer);
    if (num >= 1 && num <= options.length) {
      return options[num - 1].value;
    }
    // Allow typing the value directly
    const match = options.find(o => o.value.toLowerCase() === answer.toLowerCase());
    if (match) return match.value;
    console.log('Invalid selection. Try again.');
  }
}

async function confirm(rl: readline.Interface, message: string, defaultValue = true): Promise<boolean> {
  const hint = defaultValue ? '[Y/n]' : '[y/N]';
  const answer = await ask(rl, `${message} ${hint}: `);
  if (!answer) return defaultValue;
  return answer.toLowerCase().startsWith('y');
}

function printHeader(title: string): void {
  console.log('');
  console.log('─'.repeat(70));
  console.log(`  ${title}`);
  console.log('─'.repeat(70));
  console.log('');
}

function printSuccess(message: string): void {
  console.log(`✓ ${message}`);
}

function printWarning(message: string): void {
  console.log(`⚠ ${message}`);
}

function printError(message: string): void {
  console.log(`✗ ${message}`);
}

function printInfo(message: string): void {
  console.log(`  ${message}`);
}

// ============================================================================
// Dependency Checking
// ============================================================================

interface DependencyCheck {
  name: string;
  check: () => boolean;
  installCmd?: string;
  required: boolean;
}

function checkDependencies(): { passed: DependencyCheck[]; failed: DependencyCheck[] } {
  const deps: DependencyCheck[] = [
    {
      name: 'Node.js 18+',
      check: () => {
        try {
          const version = execSync('node --version', { encoding: 'utf-8' }).trim();
          const major = parseInt(version.replace('v', '').split('.')[0]);
          return major >= 18;
        } catch {
          return false;
        }
      },
      installCmd: 'brew install node',
      required: true,
    },
    {
      name: 'Git',
      check: () => {
        try {
          execSync('git --version', { stdio: 'ignore' });
          return true;
        } catch {
          return false;
        }
      },
      installCmd: 'xcode-select --install',
      required: false,
    },
  ];

  const passed: DependencyCheck[] = [];
  const failed: DependencyCheck[] = [];

  for (const dep of deps) {
    if (dep.check()) {
      passed.push(dep);
    } else {
      failed.push(dep);
    }
  }

  return { passed, failed };
}

// ============================================================================
// Credential Storage (Unified)
// ============================================================================

interface Credentials {
  anthropic?: { apiKey?: string; oauthToken?: string };
  openai?: { apiKey?: string };
  telegram?: { botToken: string; botUsername?: string };
  whatsapp?: { sessionData?: string };
  discord?: { botToken: string; applicationId?: string };
  signal?: { phoneNumber: string };
  email?: { provider: string; address: string; password?: string; smtpHost?: string; smtpPort?: number; imapHost?: string; imapPort?: number };
  matrix?: { homeserver: string; userId: string; accessToken: string };
}

function loadCredentials(): Credentials {
  if (existsSync(CREDENTIALS_PATH)) {
    try {
      return JSON.parse(readFileSync(CREDENTIALS_PATH, 'utf-8'));
    } catch {
      return {};
    }
  }
  return {};
}

function saveCredentials(creds: Credentials): void {
  if (!existsSync(X2000_DIR)) {
    mkdirSync(X2000_DIR, { recursive: true });
  }
  writeFileSync(CREDENTIALS_PATH, JSON.stringify(creds, null, 2), { mode: 0o600 });
}

// ============================================================================
// Wizard Steps
// ============================================================================

async function welcomeStep(): Promise<void> {
  console.clear();
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   ██╗  ██╗██████╗  ██████╗  ██████╗  ██████╗                              ║
║   ╚██╗██╔╝╚════██╗██╔═████╗██╔═████╗██╔═████╗                             ║
║    ╚███╔╝  █████╔╝██║██╔██║██║██╔██║██║██╔██║                             ║
║    ██╔██╗ ██╔═══╝ ████╔╝██║████╔╝██║████╔╝██║                             ║
║   ██╔╝ ██╗███████╗╚██████╔╝╚██████╔╝╚██████╔╝                             ║
║   ╚═╝  ╚═╝╚══════╝ ╚═════╝  ╚═════╝  ╚═════╝                              ║
║                                                                           ║
║                    Autonomous AI Fleet Setup                              ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);

  console.log('X2000 is your autonomous AI fleet that can:');
  console.log('');
  console.log('  • Work on projects while you sleep');
  console.log('  • Communicate via Telegram, WhatsApp, iMessage, and more');
  console.log('  • Send and receive emails on your behalf');
  console.log('  • Learn and improve from every interaction');
  console.log('  • Build and deploy applications autonomously');
  console.log('');
  console.log("Let's get you set up. This takes about 5 minutes.");
  console.log('');
}

async function dependencyStep(): Promise<boolean> {
  printHeader('STEP 1: Checking Dependencies');

  const { passed, failed } = checkDependencies();

  for (const dep of passed) {
    printSuccess(dep.name);
  }

  const requiredFailed = failed.filter(d => d.required);
  const optionalFailed = failed.filter(d => !d.required);

  for (const dep of optionalFailed) {
    printWarning(`${dep.name} (optional)`);
    if (dep.installCmd) {
      printInfo(`  Install with: ${dep.installCmd}`);
    }
  }

  if (requiredFailed.length > 0) {
    console.log('');
    printError('Missing required dependencies:');
    for (const dep of requiredFailed) {
      printInfo(`  ${dep.name}`);
      if (dep.installCmd) {
        printInfo(`    Install with: ${dep.installCmd}`);
      }
    }
    return false;
  }

  console.log('');
  printSuccess('All required dependencies installed!');
  return true;
}

async function providerStep(rl: readline.Interface): Promise<{
  provider: 'claude-code' | 'anthropic' | 'openai' | 'ollama' | 'auto';
  model: string;
  useOAuth: boolean;
  apiKey?: string;
}> {
  printHeader('STEP 2: AI Provider');

  console.log('X2000 needs an AI brain to think. Choose your provider:');
  console.log('');

  // Check if Claude Code CLI is available
  let claudeCodeAvailable = false;
  try {
    execSync('claude --version', { stdio: 'ignore' });
    claudeCodeAvailable = true;
  } catch {
    // Claude Code not installed
  }

  const providerOptions = [];

  if (claudeCodeAvailable) {
    providerOptions.push({
      value: 'claude-code',
      label: 'Claude Code (Your Subscription)',
      description: 'Uses your Pro/Max subscription - no API credits!',
      recommended: true,
    });
  }

  providerOptions.push(
    { value: 'auto', label: 'Auto-Detect', description: 'Automatically use the best available provider' },
    { value: 'anthropic', label: 'Claude API', description: 'Pay-per-use API credits' },
    { value: 'openai', label: 'GPT-4 (OpenAI)', description: 'OpenAI API' },
    { value: 'ollama', label: 'Local (Ollama)', description: 'Free, runs on your machine' }
  );

  if (!claudeCodeAvailable) {
    console.log('💡 TIP: Install Claude Code CLI to use your Claude subscription!');
    console.log('   npm install -g @anthropic-ai/claude-code');
    console.log('   Then run: claude login');
    console.log('');
  }

  const provider = await select(rl, 'Which AI provider?', providerOptions);

  let model = 'claude-sonnet-4-20250514';
  let useOAuth = false;
  let apiKey: string | undefined;

  if (provider === 'claude-code') {
    console.log('');
    printSuccess('Using Claude Code CLI with your subscription!');
    printInfo('X2000 will use the `claude` command to run tasks.');
    printInfo('Your subscription credits are used - no API charges.');
    console.log('');

    // Check if Claude Code is logged in
    try {
      const authCheck = execSync('claude auth status 2>&1', { encoding: 'utf-8' });
      if (authCheck.includes('Not logged in') || authCheck.includes('not authenticated')) {
        printWarning('Claude Code is not logged in.');
        console.log('');
        console.log('Please log in now:');
        console.log('  claude login');
        console.log('');
        await ask(rl, 'Press Enter after logging in...');
      } else {
        printSuccess('Claude Code is authenticated!');
      }
    } catch {
      // Auth check failed, but that's OK - gateway will handle it
      printInfo('Authentication will be checked when starting the gateway.');
    }

    model = 'claude-sonnet-4-20250514'; // Claude Code uses the model from your subscription

  } else if (provider === 'auto') {
    console.log('');
    printInfo('X2000 will auto-detect available providers in this order:');
    printInfo('  1. Claude Code CLI (uses your subscription)');
    printInfo('  2. Anthropic API (requires API key)');
    printInfo('  3. OpenAI API (requires API key)');
    printInfo('  4. Ollama (local models)');
    console.log('');

    // Still ask for API key as fallback
    apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      const wantApiKey = await confirm(rl, 'Do you want to set an API key as fallback?', false);
      if (wantApiKey) {
        console.log('Get your API key from: https://console.anthropic.com/settings/keys');
        apiKey = await askSecret(rl, 'Enter your Anthropic API key (or press Enter to skip): ');
      }
    } else {
      printSuccess(`Found API key in environment: ${apiKey.slice(0, 12)}...`);
    }

  } else if (provider === 'anthropic') {
    apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.log('');
      console.log('Get your API key from: https://console.anthropic.com/settings/keys');
      apiKey = await askSecret(rl, 'Enter your Anthropic API key: ');
    } else {
      printSuccess(`Using API key from environment: ${apiKey.slice(0, 12)}...`);
    }

    console.log('');
    model = await select(rl, 'Which Claude model?', [
      { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4', description: 'Fast & capable', recommended: true },
      { value: 'claude-opus-4-20250514', label: 'Claude Opus 4', description: 'Most capable, slower' },
    ]);

  } else if (provider === 'openai') {
    apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.log('');
      console.log('Get your API key from: https://platform.openai.com/api-keys');
      apiKey = await askSecret(rl, 'Enter your OpenAI API key: ');
    }

    console.log('');
    model = await select(rl, 'Which GPT model?', [
      { value: 'gpt-4o', label: 'GPT-4o', description: 'Latest multimodal', recommended: true },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', description: 'Fast & capable' },
    ]);

  } else if (provider === 'ollama') {
    console.log('');
    console.log('Make sure Ollama is running: ollama serve');
    model = await ask(rl, 'Which model? (e.g., llama3, codellama, mistral): ');
    if (!model) model = 'llama3';
  }

  return {
    provider: provider as 'claude-code' | 'anthropic' | 'openai' | 'ollama' | 'auto',
    model,
    useOAuth,
    apiKey,
  };
}

async function channelsStep(rl: readline.Interface): Promise<{
  telegram?: { botToken: string; botUsername?: string };
  whatsapp?: { enabled: boolean };
  imessage?: { enabled: boolean };
  discord?: { botToken: string };
  email?: { provider: string; address: string; password?: string; smtpHost?: string; smtpPort?: number };
}> {
  printHeader('STEP 3: Communication Channels');

  console.log('How do you want to communicate with X2000?');
  console.log('You can add more channels later with: x2000 channels add');
  console.log('');

  const channels: {
    telegram?: { botToken: string; botUsername?: string };
    whatsapp?: { enabled: boolean };
    imessage?: { enabled: boolean };
    discord?: { botToken: string };
    email?: { provider: string; address: string; password?: string; smtpHost?: string; smtpPort?: number };
  } = {};

  // Telegram
  if (await confirm(rl, 'Set up Telegram?', true)) {
    console.log('');
    console.log('To create a Telegram bot:');
    console.log('  1. Open Telegram and message @BotFather');
    console.log('  2. Send /newbot and follow the prompts');
    console.log('  3. Copy the bot token (looks like: 123456:ABC-DEF...)');
    console.log('');

    const token = await ask(rl, 'Paste your bot token (or press Enter to skip): ');
    if (token) {
      const username = await ask(rl, 'What did you name your bot? (e.g., MyX2000Bot): ');
      channels.telegram = { botToken: token, botUsername: username || undefined };
      printSuccess('Telegram configured!');
    }
  }

  // WhatsApp
  if (await confirm(rl, 'Set up WhatsApp?', false)) {
    console.log('');
    console.log('WhatsApp setup requires scanning a QR code.');
    console.log("We'll do this when you start the gateway.");
    channels.whatsapp = { enabled: true };
    printSuccess('WhatsApp will be configured on first start');
  }

  // iMessage (macOS only)
  if (platform() === 'darwin') {
    if (await confirm(rl, 'Set up iMessage? (macOS only)', false)) {
      console.log('');
      console.log('iMessage requires Accessibility permissions for Terminal/iTerm.');
      console.log('Go to: System Preferences > Privacy & Security > Accessibility');
      console.log('Add your terminal app to the list.');
      console.log('');

      const granted = await confirm(rl, 'Have you granted these permissions?', false);
      if (granted) {
        channels.imessage = { enabled: true };
        printSuccess('iMessage configured!');
      } else {
        printWarning('Skipping iMessage. Grant permissions and run: x2000 channels add imessage');
      }
    }
  }

  // Discord
  if (await confirm(rl, 'Set up Discord?', false)) {
    console.log('');
    console.log('To create a Discord bot:');
    console.log('  1. Go to https://discord.com/developers/applications');
    console.log('  2. Create a new application');
    console.log('  3. Go to Bot > Reset Token > Copy');
    console.log('  4. Enable "Message Content Intent" under Privileged Gateway Intents');
    console.log('');

    const token = await ask(rl, 'Paste your bot token (or press Enter to skip): ');
    if (token) {
      channels.discord = { botToken: token };
      printSuccess('Discord configured!');
    }
  }

  // Email
  if (await confirm(rl, 'Set up Email? (for X2000 to send/receive emails)', false)) {
    console.log('');
    const emailProvider = await select(rl, 'Which email provider?', [
      { value: 'gmail', label: 'Gmail', description: 'Requires App Password' },
      { value: 'outlook', label: 'Outlook/Hotmail', description: 'Microsoft account' },
      { value: 'custom', label: 'Custom SMTP', description: 'Any email provider' },
    ]);

    const address = await ask(rl, 'Email address: ');

    if (emailProvider === 'gmail') {
      console.log('');
      console.log('For Gmail, you need an App Password:');
      console.log('  1. Go to https://myaccount.google.com/apppasswords');
      console.log('  2. Create a new app password for "Mail"');
      console.log('  3. Copy the 16-character password');
      console.log('');
      const password = await askSecret(rl, 'App Password: ');
      channels.email = {
        provider: 'gmail',
        address,
        password,
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
      };
    } else if (emailProvider === 'outlook') {
      const password = await askSecret(rl, 'Password: ');
      channels.email = {
        provider: 'outlook',
        address,
        password,
        smtpHost: 'smtp-mail.outlook.com',
        smtpPort: 587,
      };
    } else {
      const smtpHost = await ask(rl, 'SMTP Host: ');
      const smtpPort = parseInt(await ask(rl, 'SMTP Port (587): ')) || 587;
      const password = await askSecret(rl, 'Password: ');
      channels.email = {
        provider: 'custom',
        address,
        password,
        smtpHost,
        smtpPort,
      };
    }

    if (channels.email) {
      printSuccess(`Email configured: ${address}`);
    }
  }

  return channels;
}

async function trustStep(rl: readline.Interface): Promise<1 | 2 | 3 | 4> {
  printHeader('STEP 4: Autonomy Level');

  console.log('How much autonomy should X2000 have?');
  console.log('');

  const level = await select(rl, 'Select autonomy level:', [
    { value: '4', label: 'Full Autonomy', description: 'Can do anything without asking', recommended: true },
    { value: '3', label: 'Execute', description: 'Can run commands, but asks for destructive actions' },
    { value: '2', label: 'Write', description: 'Can edit files, but asks before running commands' },
    { value: '1', label: 'Read Only', description: 'Can only read and analyze' },
  ]);

  const trustLevel = parseInt(level) as 1 | 2 | 3 | 4;

  console.log('');
  if (trustLevel === 4) {
    printInfo('X2000 will work fully autonomously.');
    printInfo('It will verify all actions and self-correct errors.');
  } else {
    printInfo(`X2000 will ask before level ${trustLevel + 1}+ actions.`);
  }

  return trustLevel;
}

async function gatewayStep(rl: readline.Interface): Promise<{ port: number; autoStart: boolean }> {
  printHeader('STEP 5: Gateway Settings');

  console.log('X2000 runs as a background service (gateway) that listens for tasks.');
  console.log('');

  const portStr = await ask(rl, 'Gateway port (default 3000): ');
  const port = parseInt(portStr) || 3000;

  console.log('');
  const autoStart = await confirm(rl, 'Start X2000 automatically when you log in?', true);

  return { port, autoStart };
}

async function summaryStep(
  rl: readline.Interface,
  config: {
    provider: string;
    model: string;
    useOAuth: boolean;
    channels: Record<string, unknown>;
    trustLevel: number;
    port: number;
    autoStart: boolean;
  }
): Promise<boolean> {
  printHeader('CONFIGURATION SUMMARY');

  const providerDesc = config.provider === 'claude-code'
    ? 'Claude Code CLI (Your Subscription)'
    : config.provider === 'auto'
    ? 'Auto-Detect (Best Available)'
    : `${config.provider.charAt(0).toUpperCase() + config.provider.slice(1)} API`;

  const authDesc = config.provider === 'claude-code'
    ? 'Your Claude Pro/Max Subscription'
    : config.provider === 'auto'
    ? 'Auto (Subscription → API Key)'
    : 'API Key';

  console.log(`  AI Provider:     ${providerDesc}`);
  console.log(`  Authentication:  ${authDesc}`);
  console.log(`  Autonomy Level:  ${config.trustLevel}`);
  console.log(`  Gateway Port:    ${config.port}`);
  console.log(`  Auto-Start:      ${config.autoStart ? 'Yes' : 'No'}`);
  console.log('');

  const channelNames = Object.keys(config.channels).filter(k => config.channels[k]);
  if (channelNames.length > 0) {
    console.log('  Channels:');
    for (const name of channelNames) {
      console.log(`    • ${name.charAt(0).toUpperCase() + name.slice(1)}`);
    }
  } else {
    console.log('  Channels:        None (add later with: x2000 channels add)');
  }

  console.log('');

  return confirm(rl, 'Save this configuration?', true);
}

async function installDaemonStep(rl: readline.Interface, port: number): Promise<void> {
  printHeader('INSTALLING BACKGROUND SERVICE');

  if (platform() !== 'darwin' && platform() !== 'linux') {
    printWarning('Auto-start is only supported on macOS and Linux.');
    printInfo('You can start X2000 manually with: x2000 gateway');
    return;
  }

  try {
    const { install } = await import('../daemon/index.js');

    // Find the gateway script path
    const gatewayScript = join(process.cwd(), 'dist', 'gateway', 'index.js');

    await install(gatewayScript, {
      PORT: String(port),
      NODE_ENV: 'production',
    });

    printSuccess('Background service installed!');
    printInfo('X2000 will start automatically when you log in.');
  } catch (error) {
    printError(`Failed to install service: ${error}`);
    printInfo('You can try again later with: x2000 daemon install');
  }
}

async function healthCheckStep(): Promise<boolean> {
  printHeader('VERIFYING INSTALLATION');

  // Give the daemon a moment to start
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    const response = await fetch('http://localhost:3000/health', {
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json() as { status: string; version: string };
      printSuccess(`Gateway is running (v${data.version})`);
      return true;
    } else {
      printWarning('Gateway returned unexpected status');
      return false;
    }
  } catch {
    printInfo('Gateway not responding yet.');
    printInfo('Start it manually with: x2000 gateway');
    return false;
  }
}

async function completeStep(healthy: boolean): Promise<void> {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                           ║');
  console.log('║                        X2000 SETUP COMPLETE!                              ║');
  console.log('║                                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝');
  console.log('');

  console.log('Next Steps:');
  console.log('');

  if (!healthy) {
    console.log('  1. Start the gateway:');
    console.log('     x2000 gateway');
    console.log('');
  }

  console.log('  2. Send your first task:');
  console.log('     x2000 msg "Hello X2000, what can you do?"');
  console.log('');

  console.log('  3. Or message via your configured channels (Telegram, etc.)');
  console.log('');

  console.log('Useful Commands:');
  console.log('  x2000 status      - Check if X2000 is running');
  console.log('  x2000 channels    - Manage communication channels');
  console.log('  x2000 daemon logs - View logs');
  console.log('  x2000 help        - See all commands');
  console.log('');

  console.log('Documentation: https://x2000.ai/docs');
  console.log('');
}

// ============================================================================
// Main Wizard
// ============================================================================

export async function runOnboardingWizard(): Promise<X2000Config | null> {
  const rl = createPrompt();

  try {
    await welcomeStep();

    // Pause for user to read
    await ask(rl, 'Press Enter to begin setup...');

    // Check dependencies
    const depsOk = await dependencyStep();
    if (!depsOk) {
      console.log('');
      printError('Please install the required dependencies and run setup again.');
      rl.close();
      return null;
    }

    await ask(rl, '\nPress Enter to continue...');

    // Check for existing config
    if (existsSync(CONFIG_PATH)) {
      console.log('');
      printWarning('Found existing X2000 configuration.');
      const overwrite = await confirm(rl, 'Do you want to reconfigure?', false);
      if (!overwrite) {
        console.log('');
        printInfo('Keeping existing configuration.');
        printInfo('Start X2000 with: x2000 gateway');
        rl.close();
        return null;
      }
    }

    // Run wizard steps
    const providerConfig = await providerStep(rl);
    const channels = await channelsStep(rl);
    const trustLevel = await trustStep(rl);
    const gatewayConfig = await gatewayStep(rl);

    // Build config
    const config: X2000Config = {
      port: gatewayConfig.port,
      provider: providerConfig.provider,
      model: providerConfig.model,
      apiKey: providerConfig.apiKey,
      channels: {
        telegram: channels.telegram ? { token: channels.telegram.botToken, enabled: true } : undefined,
        imessage: channels.imessage,
        whatsapp: channels.whatsapp,
        discord: channels.discord ? { token: channels.discord.botToken, enabled: true } : undefined,
        email: channels.email,
      },
      trustLevel,
    };

    // Show summary and confirm
    const confirmed = await summaryStep(rl, {
      provider: config.provider,
      model: config.model,
      useOAuth: config.provider === 'claude-code',
      channels: config.channels,
      trustLevel: config.trustLevel,
      port: config.port,
      autoStart: gatewayConfig.autoStart,
    });

    if (!confirmed) {
      console.log('');
      printInfo('Setup cancelled. Run again with: x2000 setup');
      rl.close();
      return null;
    }

    // Ensure directory exists
    if (!existsSync(X2000_DIR)) {
      mkdirSync(X2000_DIR, { recursive: true });
    }

    // Save config
    writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    printSuccess('Configuration saved!');

    // Save credentials separately (more secure)
    const creds: Credentials = {};
    if (providerConfig.apiKey) {
      if (providerConfig.provider === 'anthropic') {
        creds.anthropic = { apiKey: providerConfig.apiKey };
      } else if (providerConfig.provider === 'openai') {
        creds.openai = { apiKey: providerConfig.apiKey };
      }
    }
    if (channels.telegram) {
      creds.telegram = channels.telegram;
    }
    if (channels.discord) {
      creds.discord = channels.discord;
    }
    if (channels.email) {
      creds.email = channels.email;
    }

    if (Object.keys(creds).length > 0) {
      saveCredentials(creds);
      printSuccess('Credentials saved securely!');
    }

    // Save API key to .env for backward compatibility
    if (providerConfig.apiKey && providerConfig.provider !== 'ollama') {
      const envPath = join(X2000_DIR, '.env');
      const envVar = providerConfig.provider === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY';
      writeFileSync(envPath, `${envVar}=${providerConfig.apiKey}\n`, { mode: 0o600 });
    }

    // Install daemon if requested
    if (gatewayConfig.autoStart) {
      await installDaemonStep(rl, config.port);
    }

    // Health check
    const healthy = await healthCheckStep();

    // Complete!
    await completeStep(healthy);

    rl.close();
    return config;

  } catch (err) {
    rl.close();
    throw err;
  }
}

// ============================================================================
// Quick Setup (Non-interactive)
// ============================================================================

export async function quickSetup(options: Partial<X2000Config>): Promise<X2000Config> {
  // Default to 'auto' which prioritizes Claude Code CLI
  const config: X2000Config = {
    port: options.port || 3000,
    provider: options.provider || 'auto',
    model: options.model || 'claude-sonnet-4-20250514',
    apiKey: options.apiKey || process.env.ANTHROPIC_API_KEY,
    channels: options.channels || {},
    trustLevel: options.trustLevel || 4,
  };

  if (!existsSync(X2000_DIR)) {
    mkdirSync(X2000_DIR, { recursive: true });
  }

  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

  return config;
}

// ============================================================================
// Channel Management
// ============================================================================

export async function addChannel(channelType: string): Promise<void> {
  const rl = createPrompt();

  console.log('');
  printHeader(`ADD ${channelType.toUpperCase()} CHANNEL`);

  // Load existing config
  if (!existsSync(CONFIG_PATH)) {
    printError('X2000 is not configured. Run: x2000 setup');
    rl.close();
    return;
  }

  const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8')) as X2000Config;
  const creds = loadCredentials();

  switch (channelType.toLowerCase()) {
    case 'telegram': {
      console.log('To create a Telegram bot:');
      console.log('  1. Open Telegram and message @BotFather');
      console.log('  2. Send /newbot and follow the prompts');
      console.log('  3. Copy the bot token');
      console.log('');

      const token = await ask(rl, 'Bot Token: ');
      const username = await ask(rl, 'Bot Username: ');

      config.channels.telegram = { token, enabled: true };
      creds.telegram = { botToken: token, botUsername: username };

      writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
      saveCredentials(creds);

      printSuccess('Telegram channel added!');
      printInfo('Restart the gateway for changes to take effect.');
      break;
    }

    case 'email': {
      const provider = await select(rl, 'Email provider:', [
        { value: 'gmail', label: 'Gmail' },
        { value: 'outlook', label: 'Outlook' },
        { value: 'custom', label: 'Custom SMTP' },
      ]);

      const address = await ask(rl, 'Email address: ');
      const password = await askSecret(rl, 'Password/App Password: ');

      let smtpHost = 'smtp.gmail.com';
      let smtpPort = 587;

      if (provider === 'outlook') {
        smtpHost = 'smtp-mail.outlook.com';
      } else if (provider === 'custom') {
        smtpHost = await ask(rl, 'SMTP Host: ');
        smtpPort = parseInt(await ask(rl, 'SMTP Port: ')) || 587;
      }

      config.channels.email = { provider, address, smtpHost, smtpPort } as never;
      creds.email = { provider, address, password, smtpHost, smtpPort };

      writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
      saveCredentials(creds);

      printSuccess('Email channel added!');
      break;
    }

    default:
      printError(`Unknown channel type: ${channelType}`);
      printInfo('Available channels: telegram, whatsapp, imessage, discord, email');
  }

  rl.close();
}
