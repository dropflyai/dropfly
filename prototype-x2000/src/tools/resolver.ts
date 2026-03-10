/**
 * Dependency Resolver
 *
 * Enables "figure it out" capability:
 * - Detect when tools/dependencies are missing
 * - Know how to install common tools
 * - Auto-resolve and retry failed operations
 * - Learn from successful resolutions
 *
 * This is what makes X2000 truly autonomous.
 */

import { execSync, exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

// ============================================================================
// Types
// ============================================================================

export interface ToolInfo {
  name: string;
  checkCommand: string;
  installCommands: {
    darwin?: string[];
    linux?: string[];
    win32?: string[];
  };
  description: string;
  category: 'testing' | 'build' | 'runtime' | 'cli' | 'database' | 'cloud' | 'other';
  dependencies?: string[];
  postInstall?: string[];
  verifyCommand?: string;
}

export interface ResolutionResult {
  success: boolean;
  tool: string;
  wasInstalled: boolean;
  installOutput?: string;
  error?: string;
  duration: number;
}

export interface DependencyCheckResult {
  tool: string;
  installed: boolean;
  version?: string;
  path?: string;
}

// ============================================================================
// Tool Knowledge Base
// ============================================================================

const TOOL_KNOWLEDGE: Record<string, ToolInfo> = {
  // Testing Tools
  maestro: {
    name: 'maestro',
    checkCommand: 'maestro --version',
    installCommands: {
      darwin: [
        'curl -Ls "https://get.maestro.mobile.dev" | bash',
        'export PATH="$PATH:$HOME/.maestro/bin"',
      ],
      linux: [
        'curl -Ls "https://get.maestro.mobile.dev" | bash',
        'export PATH="$PATH:$HOME/.maestro/bin"',
      ],
    },
    description: 'Mobile UI testing framework',
    category: 'testing',
    verifyCommand: 'maestro --version',
  },

  playwright: {
    name: 'playwright',
    checkCommand: 'npx playwright --version',
    installCommands: {
      darwin: ['npm install -g playwright', 'npx playwright install'],
      linux: ['npm install -g playwright', 'npx playwright install'],
      win32: ['npm install -g playwright', 'npx playwright install'],
    },
    description: 'Browser automation framework',
    category: 'testing',
    dependencies: ['node'],
  },

  jest: {
    name: 'jest',
    checkCommand: 'npx jest --version',
    installCommands: {
      darwin: ['npm install -g jest'],
      linux: ['npm install -g jest'],
      win32: ['npm install -g jest'],
    },
    description: 'JavaScript testing framework',
    category: 'testing',
    dependencies: ['node'],
  },

  vitest: {
    name: 'vitest',
    checkCommand: 'npx vitest --version',
    installCommands: {
      darwin: ['npm install -g vitest'],
      linux: ['npm install -g vitest'],
      win32: ['npm install -g vitest'],
    },
    description: 'Vite-native testing framework',
    category: 'testing',
    dependencies: ['node'],
  },

  cypress: {
    name: 'cypress',
    checkCommand: 'npx cypress --version',
    installCommands: {
      darwin: ['npm install -g cypress'],
      linux: ['npm install -g cypress'],
      win32: ['npm install -g cypress'],
    },
    description: 'E2E testing framework',
    category: 'testing',
    dependencies: ['node'],
  },

  // Build Tools
  node: {
    name: 'node',
    checkCommand: 'node --version',
    installCommands: {
      darwin: ['brew install node'],
      linux: ['curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -', 'sudo apt-get install -y nodejs'],
    },
    description: 'Node.js runtime',
    category: 'runtime',
  },

  npm: {
    name: 'npm',
    checkCommand: 'npm --version',
    installCommands: {
      darwin: ['brew install node'],
      linux: ['sudo apt-get install -y npm'],
    },
    description: 'Node package manager',
    category: 'build',
    dependencies: ['node'],
  },

  yarn: {
    name: 'yarn',
    checkCommand: 'yarn --version',
    installCommands: {
      darwin: ['npm install -g yarn'],
      linux: ['npm install -g yarn'],
      win32: ['npm install -g yarn'],
    },
    description: 'Alternative package manager',
    category: 'build',
    dependencies: ['node'],
  },

  pnpm: {
    name: 'pnpm',
    checkCommand: 'pnpm --version',
    installCommands: {
      darwin: ['npm install -g pnpm'],
      linux: ['npm install -g pnpm'],
      win32: ['npm install -g pnpm'],
    },
    description: 'Fast package manager',
    category: 'build',
    dependencies: ['node'],
  },

  bun: {
    name: 'bun',
    checkCommand: 'bun --version',
    installCommands: {
      darwin: ['curl -fsSL https://bun.sh/install | bash'],
      linux: ['curl -fsSL https://bun.sh/install | bash'],
    },
    description: 'Fast JavaScript runtime and bundler',
    category: 'runtime',
  },

  deno: {
    name: 'deno',
    checkCommand: 'deno --version',
    installCommands: {
      darwin: ['brew install deno'],
      linux: ['curl -fsSL https://deno.land/install.sh | sh'],
    },
    description: 'Secure JavaScript/TypeScript runtime',
    category: 'runtime',
  },

  // Mobile Development
  'expo-cli': {
    name: 'expo-cli',
    checkCommand: 'expo --version',
    installCommands: {
      darwin: ['npm install -g expo-cli'],
      linux: ['npm install -g expo-cli'],
      win32: ['npm install -g expo-cli'],
    },
    description: 'Expo CLI for React Native',
    category: 'cli',
    dependencies: ['node'],
  },

  'eas-cli': {
    name: 'eas-cli',
    checkCommand: 'eas --version',
    installCommands: {
      darwin: ['npm install -g eas-cli'],
      linux: ['npm install -g eas-cli'],
      win32: ['npm install -g eas-cli'],
    },
    description: 'Expo Application Services CLI',
    category: 'cli',
    dependencies: ['node'],
  },

  cocoapods: {
    name: 'cocoapods',
    checkCommand: 'pod --version',
    installCommands: {
      darwin: ['sudo gem install cocoapods'],
    },
    description: 'iOS dependency manager',
    category: 'build',
  },

  // Version Control
  git: {
    name: 'git',
    checkCommand: 'git --version',
    installCommands: {
      darwin: ['brew install git'],
      linux: ['sudo apt-get install -y git'],
      win32: ['winget install Git.Git'],
    },
    description: 'Version control system',
    category: 'cli',
  },

  gh: {
    name: 'gh',
    checkCommand: 'gh --version',
    installCommands: {
      darwin: ['brew install gh'],
      linux: ['sudo apt-get install -y gh'],
      win32: ['winget install GitHub.cli'],
    },
    description: 'GitHub CLI',
    category: 'cli',
  },

  // Cloud & Infrastructure
  docker: {
    name: 'docker',
    checkCommand: 'docker --version',
    installCommands: {
      darwin: ['brew install --cask docker'],
      linux: ['curl -fsSL https://get.docker.com | sh'],
    },
    description: 'Container platform',
    category: 'cloud',
  },

  kubectl: {
    name: 'kubectl',
    checkCommand: 'kubectl version --client',
    installCommands: {
      darwin: ['brew install kubectl'],
      linux: ['curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"', 'sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl'],
    },
    description: 'Kubernetes CLI',
    category: 'cloud',
  },

  terraform: {
    name: 'terraform',
    checkCommand: 'terraform --version',
    installCommands: {
      darwin: ['brew install terraform'],
      linux: ['sudo apt-get install -y terraform'],
    },
    description: 'Infrastructure as code',
    category: 'cloud',
  },

  'aws-cli': {
    name: 'aws-cli',
    checkCommand: 'aws --version',
    installCommands: {
      darwin: ['brew install awscli'],
      linux: ['curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"', 'unzip awscliv2.zip', 'sudo ./aws/install'],
    },
    description: 'AWS command line interface',
    category: 'cloud',
  },

  // Databases
  psql: {
    name: 'psql',
    checkCommand: 'psql --version',
    installCommands: {
      darwin: ['brew install postgresql'],
      linux: ['sudo apt-get install -y postgresql-client'],
    },
    description: 'PostgreSQL client',
    category: 'database',
  },

  redis: {
    name: 'redis',
    checkCommand: 'redis-cli --version',
    installCommands: {
      darwin: ['brew install redis'],
      linux: ['sudo apt-get install -y redis-tools'],
    },
    description: 'Redis CLI',
    category: 'database',
  },

  // Supabase
  supabase: {
    name: 'supabase',
    checkCommand: 'supabase --version',
    installCommands: {
      darwin: ['brew install supabase/tap/supabase'],
      linux: ['npm install -g supabase'],
      win32: ['npm install -g supabase'],
    },
    description: 'Supabase CLI',
    category: 'database',
  },

  // Other useful tools
  jq: {
    name: 'jq',
    checkCommand: 'jq --version',
    installCommands: {
      darwin: ['brew install jq'],
      linux: ['sudo apt-get install -y jq'],
    },
    description: 'JSON processor',
    category: 'cli',
  },

  curl: {
    name: 'curl',
    checkCommand: 'curl --version',
    installCommands: {
      darwin: ['brew install curl'],
      linux: ['sudo apt-get install -y curl'],
    },
    description: 'HTTP client',
    category: 'cli',
  },

  wget: {
    name: 'wget',
    checkCommand: 'wget --version',
    installCommands: {
      darwin: ['brew install wget'],
      linux: ['sudo apt-get install -y wget'],
    },
    description: 'File downloader',
    category: 'cli',
  },

  ffmpeg: {
    name: 'ffmpeg',
    checkCommand: 'ffmpeg -version',
    installCommands: {
      darwin: ['brew install ffmpeg'],
      linux: ['sudo apt-get install -y ffmpeg'],
    },
    description: 'Media processing',
    category: 'other',
  },

  imagemagick: {
    name: 'imagemagick',
    checkCommand: 'convert --version',
    installCommands: {
      darwin: ['brew install imagemagick'],
      linux: ['sudo apt-get install -y imagemagick'],
    },
    description: 'Image processing',
    category: 'other',
  },

  // Python
  python: {
    name: 'python',
    checkCommand: 'python3 --version',
    installCommands: {
      darwin: ['brew install python'],
      linux: ['sudo apt-get install -y python3'],
    },
    description: 'Python runtime',
    category: 'runtime',
  },

  pip: {
    name: 'pip',
    checkCommand: 'pip3 --version',
    installCommands: {
      darwin: ['python3 -m ensurepip --upgrade'],
      linux: ['sudo apt-get install -y python3-pip'],
    },
    description: 'Python package manager',
    category: 'build',
    dependencies: ['python'],
  },

  // Homebrew (macOS package manager)
  brew: {
    name: 'brew',
    checkCommand: 'brew --version',
    installCommands: {
      darwin: ['/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'],
    },
    description: 'macOS package manager',
    category: 'build',
  },
};

// ============================================================================
// Error Pattern Recognition
// ============================================================================

const ERROR_PATTERNS: Array<{
  pattern: RegExp;
  tool: string;
  extractTool?: (match: RegExpMatchArray) => string;
}> = [
  // Command not found patterns
  { pattern: /command not found: ([\w-]+)/i, tool: '$1', extractTool: (m) => m[1] },
  { pattern: /([\w-]+): command not found/i, tool: '$1', extractTool: (m) => m[1] },
  { pattern: /'([\w-]+)' is not recognized/i, tool: '$1', extractTool: (m) => m[1] },
  { pattern: /Cannot find module '([\w-]+)'/i, tool: '$1', extractTool: (m) => m[1] },
  { pattern: /not found: ([\w-]+)/i, tool: '$1', extractTool: (m) => m[1] },
  { pattern: /exit(?:ed)?\s+(?:with\s+)?code\s+127/i, tool: 'EXIT_127' }, // Special marker

  // Specific tool errors
  { pattern: /maestro.*not found|cannot find maestro/i, tool: 'maestro' },
  { pattern: /playwright.*not found|npx playwright.*failed/i, tool: 'playwright' },
  { pattern: /expo.*not found|expo-cli.*not installed/i, tool: 'expo-cli' },
  { pattern: /eas.*not found|eas-cli.*not installed/i, tool: 'eas-cli' },
  { pattern: /docker.*not found|docker daemon.*not running/i, tool: 'docker' },
  { pattern: /supabase.*not found/i, tool: 'supabase' },
  { pattern: /pod.*not found|cocoapods.*not installed/i, tool: 'cocoapods' },
  { pattern: /gh.*not found|github cli.*not installed/i, tool: 'gh' },

  // npm/node errors
  { pattern: /npm.*not found|node.*not found/i, tool: 'node' },
  { pattern: /yarn.*not found/i, tool: 'yarn' },
  { pattern: /pnpm.*not found/i, tool: 'pnpm' },

  // Python errors
  { pattern: /python.*not found|python3.*not found/i, tool: 'python' },
  { pattern: /pip.*not found|pip3.*not found/i, tool: 'pip' },
];

// ============================================================================
// Dependency Resolver Class
// ============================================================================

export class DependencyResolver {
  private platform: NodeJS.Platform;
  private installedCache: Map<string, boolean> = new Map();
  private installHistory: Array<{ tool: string; success: boolean; timestamp: Date }> = [];

  constructor() {
    this.platform = os.platform();
  }

  /**
   * Check if a tool is installed
   */
  async checkTool(toolName: string): Promise<DependencyCheckResult> {
    const info = TOOL_KNOWLEDGE[toolName.toLowerCase()];

    if (!info) {
      // Unknown tool, try direct check
      return this.checkUnknownTool(toolName);
    }

    try {
      const { stdout } = await execAsync(info.checkCommand, { timeout: 10000 });
      const version = this.extractVersion(stdout);

      this.installedCache.set(toolName, true);

      return {
        tool: toolName,
        installed: true,
        version,
      };
    } catch {
      this.installedCache.set(toolName, false);
      return {
        tool: toolName,
        installed: false,
      };
    }
  }

  /**
   * Check an unknown tool
   */
  private async checkUnknownTool(toolName: string): Promise<DependencyCheckResult> {
    const checks = [
      `${toolName} --version`,
      `${toolName} -v`,
      `${toolName} version`,
      `which ${toolName}`,
    ];

    for (const check of checks) {
      try {
        const { stdout } = await execAsync(check, { timeout: 5000 });
        return {
          tool: toolName,
          installed: true,
          version: this.extractVersion(stdout),
        };
      } catch {
        continue;
      }
    }

    return { tool: toolName, installed: false };
  }

  /**
   * Install a tool
   */
  async installTool(toolName: string): Promise<ResolutionResult> {
    const startTime = Date.now();
    const info = TOOL_KNOWLEDGE[toolName.toLowerCase()];

    if (!info) {
      return {
        success: false,
        tool: toolName,
        wasInstalled: false,
        error: `Unknown tool: ${toolName}. Cannot auto-install.`,
        duration: Date.now() - startTime,
      };
    }

    const commands = info.installCommands[this.platform as 'darwin' | 'linux' | 'win32'];

    if (!commands || commands.length === 0) {
      return {
        success: false,
        tool: toolName,
        wasInstalled: false,
        error: `No install commands for ${toolName} on ${this.platform}`,
        duration: Date.now() - startTime,
      };
    }

    // Check dependencies first
    if (info.dependencies) {
      for (const dep of info.dependencies) {
        const depCheck = await this.checkTool(dep);
        if (!depCheck.installed) {
          console.log(`[Resolver] Installing dependency: ${dep}`);
          const depResult = await this.installTool(dep);
          if (!depResult.success) {
            return {
              success: false,
              tool: toolName,
              wasInstalled: false,
              error: `Failed to install dependency ${dep}: ${depResult.error}`,
              duration: Date.now() - startTime,
            };
          }
        }
      }
    }

    console.log(`[Resolver] Installing ${toolName}...`);
    let output = '';

    try {
      for (const command of commands) {
        console.log(`[Resolver] Running: ${command}`);
        const { stdout, stderr } = await execAsync(command, {
          timeout: 300000, // 5 minute timeout
          shell: '/bin/bash',
        });
        output += stdout + stderr;
      }

      // Run post-install commands if any
      if (info.postInstall) {
        for (const command of info.postInstall) {
          await execAsync(command, { timeout: 60000, shell: '/bin/bash' });
        }
      }

      // Verify installation
      const verifyCommand = info.verifyCommand || info.checkCommand;
      try {
        await execAsync(verifyCommand, { timeout: 10000 });
      } catch {
        // Verification failed, but install might have succeeded
        console.warn(`[Resolver] Verification failed for ${toolName}, but install may have succeeded`);
      }

      this.installedCache.set(toolName, true);
      this.installHistory.push({ tool: toolName, success: true, timestamp: new Date() });

      return {
        success: true,
        tool: toolName,
        wasInstalled: true,
        installOutput: output,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      this.installHistory.push({ tool: toolName, success: false, timestamp: new Date() });

      return {
        success: false,
        tool: toolName,
        wasInstalled: false,
        error: errorMessage,
        installOutput: output,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Detect missing tool from error message
   */
  detectMissingTool(errorMessage: string): string | null {
    for (const { pattern, tool, extractTool } of ERROR_PATTERNS) {
      const match = errorMessage.match(pattern);
      if (match) {
        if (extractTool) {
          const detected = extractTool(match);
          // Check if we know about this tool
          if (TOOL_KNOWLEDGE[detected.toLowerCase()]) {
            return detected.toLowerCase();
          }
        } else {
          return tool;
        }
      }
    }
    return null;
  }

  /**
   * Auto-resolve: detect and install missing tool
   */
  async autoResolve(errorMessage: string): Promise<ResolutionResult | null> {
    const tool = this.detectMissingTool(errorMessage);

    if (!tool) {
      return null;
    }

    console.log(`[Resolver] Detected missing tool: ${tool}`);

    // Check if already installed (error might be wrong)
    const check = await this.checkTool(tool);
    if (check.installed) {
      console.log(`[Resolver] ${tool} is actually installed, error may be path-related`);
      return {
        success: true,
        tool,
        wasInstalled: false,
        duration: 0,
      };
    }

    return this.installTool(tool);
  }

  /**
   * Ensure a tool is available, installing if needed
   */
  async ensure(toolName: string): Promise<ResolutionResult> {
    const startTime = Date.now();

    // Check cache first
    if (this.installedCache.get(toolName)) {
      return {
        success: true,
        tool: toolName,
        wasInstalled: false,
        duration: Date.now() - startTime,
      };
    }

    // Check if installed
    const check = await this.checkTool(toolName);
    if (check.installed) {
      return {
        success: true,
        tool: toolName,
        wasInstalled: false,
        duration: Date.now() - startTime,
      };
    }

    // Install
    return this.installTool(toolName);
  }

  /**
   * Get tool info
   */
  getToolInfo(toolName: string): ToolInfo | null {
    return TOOL_KNOWLEDGE[toolName.toLowerCase()] || null;
  }

  /**
   * List all known tools
   */
  listKnownTools(): string[] {
    return Object.keys(TOOL_KNOWLEDGE);
  }

  /**
   * Get installation history
   */
  getHistory(): Array<{ tool: string; success: boolean; timestamp: Date }> {
    return [...this.installHistory];
  }

  /**
   * Extract version from output
   */
  private extractVersion(output: string): string | undefined {
    const versionPatterns = [
      /v?(\d+\.\d+\.\d+)/,
      /version\s*(\d+\.\d+\.\d+)/i,
      /(\d+\.\d+\.\d+)/,
    ];

    for (const pattern of versionPatterns) {
      const match = output.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return undefined;
  }

  /**
   * Add custom tool to knowledge base
   */
  addToolKnowledge(info: ToolInfo): void {
    TOOL_KNOWLEDGE[info.name.toLowerCase()] = info;
  }
}

// ============================================================================
// Singleton
// ============================================================================

export const dependencyResolver = new DependencyResolver();

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Quick check if a tool is available
 */
export async function isToolAvailable(toolName: string): Promise<boolean> {
  const result = await dependencyResolver.checkTool(toolName);
  return result.installed;
}

/**
 * Ensure a tool is available, installing if needed
 */
export async function ensureTool(toolName: string): Promise<boolean> {
  const result = await dependencyResolver.ensure(toolName);
  return result.success;
}

/**
 * Auto-resolve error and install missing tool
 */
export async function autoResolveDependency(errorMessage: string): Promise<ResolutionResult | null> {
  return dependencyResolver.autoResolve(errorMessage);
}
