/**
 * X2000 Documentation System - Interactive Playground
 * Code example extraction, runnable snippets, and sandbox execution
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  Example,
  ExampleFile,
  InteractivePlayground,
  SandboxConfig,
  PlaygroundResult,
  PlaygroundLog,
  GeneratedPage,
} from './types.js';

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_TIMEOUT = 30000;
const DEFAULT_MEMORY_LIMIT = 256 * 1024 * 1024; // 256MB

// X2000 mock for browser execution
const X2000_BROWSER_MOCK = `
// X2000 Browser Mock for Documentation Playground
export const ceoBrain = {
  orchestrate: async (task: string) => ({
    status: 'mock',
    message: \`[MOCK] Would orchestrate: \${task}\`,
    brains: ['engineering', 'product', 'research'],
  }),
};

export const engineeringBrain = {
  execute: async (task: { task: string; context?: object }) => ({
    status: 'mock',
    message: \`[MOCK] Engineering brain would execute: \${task.task}\`,
    output: '// Generated code would appear here',
  }),
};

export const memoryManager = {
  query: async (query: string) => ({
    patterns: [],
    learnings: [],
    skills: [],
  }),
  store: async (item: object) => ({
    id: 'mock-id',
    stored: true,
  }),
};

console.log('[X2000 Mock] Running in documentation playground mode');
`;

// ============================================================================
// Example Extractor
// ============================================================================

export class ExampleExtractor {
  /**
   * Extract examples from documentation pages
   */
  extractFromPages(pages: GeneratedPage[]): Example[] {
    const examples: Example[] = [];

    for (const page of pages) {
      const pageExamples = this.extractFromContent(page.content, page.slug);
      examples.push(...pageExamples);
    }

    return examples;
  }

  /**
   * Extract examples from MDX content
   */
  extractFromContent(content: string, pageSlug: string): Example[] {
    const examples: Example[] = [];

    // Extract Playground components
    const playgroundPattern = /<Playground[^>]*>([\s\S]*?)<\/Playground>/g;
    let match: RegExpExecArray | null;

    while ((match = playgroundPattern.exec(content)) !== null) {
      const example = this.parsePlaygroundComponent(match[0], pageSlug);
      if (example) {
        examples.push(example);
      }
    }

    // Extract code blocks with special markers
    const codeBlockPattern = /```(\w+)(?:\s+runnable)?(?:\s+title="([^"]+)")?(?:\s+interactive)?\n([\s\S]*?)```/g;

    while ((match = codeBlockPattern.exec(content)) !== null) {
      const isRunnable = match[0].includes('runnable');
      const isInteractive = match[0].includes('interactive');

      if (isRunnable || isInteractive) {
        examples.push({
          id: uuidv4(),
          title: match[2] || `Example from ${pageSlug}`,
          type: isInteractive ? 'interactive' : 'static',
          files: [{
            path: `/index.${match[1] === 'typescript' ? 'ts' : match[1]}`,
            content: match[3].trim(),
            language: match[1],
            active: true,
          }],
          template: this.inferTemplate(match[1]),
          autoRun: false,
          showConsole: true,
        });
      }
    }

    return examples;
  }

  /**
   * Parse a Playground component into an Example
   */
  private parsePlaygroundComponent(componentStr: string, pageSlug: string): Example | null {
    try {
      // Extract props from the component string
      const filesMatch = componentStr.match(/files=\{\{([\s\S]*?)\}\}/);
      const templateMatch = componentStr.match(/template="([^"]+)"/);
      const autorunMatch = componentStr.match(/autorun=\{(true|false)\}/);
      const showConsoleMatch = componentStr.match(/showConsole=\{(true|false)\}/);
      const titleMatch = componentStr.match(/title="([^"]+)"/);

      if (!filesMatch) return null;

      // Parse files object
      const files: ExampleFile[] = [];
      const filesStr = filesMatch[1];

      // Simple parser for the files object
      const filePattern = /"([^"]+)":\s*`([\s\S]*?)`/g;
      let fileMatch: RegExpExecArray | null;

      while ((fileMatch = filePattern.exec(filesStr)) !== null) {
        const path = fileMatch[1];
        const content = fileMatch[2];
        const ext = path.split('.').pop() || 'ts';

        files.push({
          path,
          content,
          language: this.getLanguage(ext),
          active: path.includes('index'),
        });
      }

      if (files.length === 0) return null;

      return {
        id: uuidv4(),
        title: titleMatch?.[1] || `Playground from ${pageSlug}`,
        type: 'interactive',
        files,
        template: (templateMatch?.[1] as 'node' | 'react' | 'vanilla') || 'node',
        autoRun: autorunMatch?.[1] === 'true',
        showConsole: showConsoleMatch?.[1] !== 'false',
      };
    } catch {
      return null;
    }
  }

  /**
   * Infer template from language
   */
  private inferTemplate(language: string): 'node' | 'react' | 'vanilla' {
    switch (language) {
      case 'tsx':
      case 'jsx':
        return 'react';
      case 'javascript':
      case 'js':
        return 'vanilla';
      default:
        return 'node';
    }
  }

  /**
   * Get language from file extension
   */
  private getLanguage(ext: string): string {
    const langMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      json: 'json',
      md: 'markdown',
      css: 'css',
      html: 'html',
    };
    return langMap[ext] || ext;
  }
}

// ============================================================================
// Playground Manager
// ============================================================================

export class PlaygroundManager {
  private playgrounds: Map<string, InteractivePlayground> = new Map();
  private defaultConfig: Partial<SandboxConfig>;

  constructor(config?: Partial<SandboxConfig>) {
    this.defaultConfig = {
      template: config?.template || 'node',
      timeout: config?.timeout || DEFAULT_TIMEOUT,
      memoryLimit: config?.memoryLimit || DEFAULT_MEMORY_LIMIT,
      networkAccess: config?.networkAccess ?? false,
      fileSystemAccess: config?.fileSystemAccess ?? false,
    };
  }

  /**
   * Create a playground from an example
   */
  createPlayground(example: Example): InteractivePlayground {
    const playground: InteractivePlayground = {
      id: uuidv4(),
      example,
      sandboxConfig: {
        template: example.template || this.defaultConfig.template || 'node',
        dependencies: example.dependencies || { 'x2000': 'latest' },
        environment: {},
        entryPoint: example.files.find(f => f.active)?.path || example.files[0].path,
        timeout: this.defaultConfig.timeout || DEFAULT_TIMEOUT,
        memoryLimit: this.defaultConfig.memoryLimit || DEFAULT_MEMORY_LIMIT,
        networkAccess: this.defaultConfig.networkAccess ?? false,
        fileSystemAccess: this.defaultConfig.fileSystemAccess ?? false,
      },
    };

    this.playgrounds.set(playground.id, playground);
    return playground;
  }

  /**
   * Get a playground by ID
   */
  getPlayground(id: string): InteractivePlayground | undefined {
    return this.playgrounds.get(id);
  }

  /**
   * Execute code in sandbox
   */
  async execute(playgroundId: string): Promise<PlaygroundResult> {
    const playground = this.playgrounds.get(playgroundId);

    if (!playground) {
      return {
        id: uuidv4(),
        playgroundId,
        success: false,
        output: '',
        error: 'Playground not found',
        logs: [],
        timing: { compilation: 0, execution: 0, total: 0 },
      };
    }

    const startTime = Date.now();
    const logs: PlaygroundLog[] = [];

    try {
      // Get the entry point file
      const entryFile = playground.example.files.find(
        f => f.path === playground.sandboxConfig.entryPoint
      ) || playground.example.files[0];

      if (!entryFile) {
        throw new Error('No entry point file found');
      }

      const compilationStart = Date.now();

      // Prepare the code for execution
      const preparedCode = this.prepareCode(entryFile.content, playground.sandboxConfig);

      const compilationTime = Date.now() - compilationStart;
      const executionStart = Date.now();

      // Execute in a sandboxed environment
      const result = await this.executeInSandbox(
        preparedCode,
        playground.sandboxConfig,
        logs
      );

      const executionTime = Date.now() - executionStart;
      const totalTime = Date.now() - startTime;

      return {
        id: uuidv4(),
        playgroundId,
        success: true,
        output: result,
        logs,
        timing: {
          compilation: compilationTime,
          execution: executionTime,
          total: totalTime,
        },
      };
    } catch (error) {
      const totalTime = Date.now() - startTime;

      return {
        id: uuidv4(),
        playgroundId,
        success: false,
        output: '',
        error: error instanceof Error ? error.message : String(error),
        logs,
        timing: {
          compilation: 0,
          execution: 0,
          total: totalTime,
        },
      };
    }
  }

  /**
   * Prepare code for sandbox execution
   */
  private prepareCode(code: string, config: SandboxConfig): string {
    let preparedCode = code;

    // Replace x2000 imports with mock
    preparedCode = preparedCode.replace(
      /import\s+\{([^}]+)\}\s+from\s+['"]x2000['"]/g,
      `const { $1 } = (() => {\n${X2000_BROWSER_MOCK}\nreturn { ceoBrain, engineeringBrain, memoryManager };\n})()`
    );

    // Replace default imports
    preparedCode = preparedCode.replace(
      /import\s+(\w+)\s+from\s+['"]x2000['"]/g,
      `const $1 = (() => {\n${X2000_BROWSER_MOCK}\nreturn { ceoBrain, engineeringBrain, memoryManager };\n})()`
    );

    // Wrap in async IIFE if needed
    if (preparedCode.includes('await') && !preparedCode.includes('async function')) {
      preparedCode = `(async () => {\n${preparedCode}\n})()`;
    }

    return preparedCode;
  }

  /**
   * Execute code in a sandboxed environment
   */
  private async executeInSandbox(
    code: string,
    config: SandboxConfig,
    logs: PlaygroundLog[]
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const output: string[] = [];

      // Create a custom console that captures logs
      const customConsole = {
        log: (...args: unknown[]) => {
          const message = args.map(a => this.stringify(a)).join(' ');
          output.push(message);
          logs.push({ level: 'log', message, timestamp: Date.now() });
        },
        info: (...args: unknown[]) => {
          const message = args.map(a => this.stringify(a)).join(' ');
          output.push(`[INFO] ${message}`);
          logs.push({ level: 'info', message, timestamp: Date.now() });
        },
        warn: (...args: unknown[]) => {
          const message = args.map(a => this.stringify(a)).join(' ');
          output.push(`[WARN] ${message}`);
          logs.push({ level: 'warn', message, timestamp: Date.now() });
        },
        error: (...args: unknown[]) => {
          const message = args.map(a => this.stringify(a)).join(' ');
          output.push(`[ERROR] ${message}`);
          logs.push({ level: 'error', message, timestamp: Date.now() });
        },
        debug: (...args: unknown[]) => {
          const message = args.map(a => this.stringify(a)).join(' ');
          logs.push({ level: 'debug', message, timestamp: Date.now() });
        },
      };

      // Set up timeout
      const timeoutId = setTimeout(() => {
        reject(new Error(`Execution timed out after ${config.timeout}ms`));
      }, config.timeout);

      try {
        // Create a sandboxed function
        // In a real implementation, this would use a proper sandbox like vm2 or isolated-vm
        const sandboxedFunction = new Function(
          'console',
          'setTimeout',
          'setInterval',
          'clearTimeout',
          'clearInterval',
          'fetch',
          'require',
          `
          "use strict";
          const module = { exports: {} };
          const exports = module.exports;
          ${code}
          return module.exports;
          `
        );

        // Execute with restricted globals
        const result = sandboxedFunction(
          customConsole,
          config.networkAccess ? setTimeout : () => {},
          config.networkAccess ? setInterval : () => {},
          clearTimeout,
          clearInterval,
          config.networkAccess ? fetch : () => Promise.reject(new Error('Network access disabled')),
          () => { throw new Error('require is not available in sandbox'); }
        );

        clearTimeout(timeoutId);

        // Handle promise results
        if (result instanceof Promise) {
          result
            .then(value => {
              if (value !== undefined) {
                output.push(this.stringify(value));
              }
              resolve(output.join('\n'));
            })
            .catch(error => {
              reject(error);
            });
        } else {
          if (result !== undefined) {
            output.push(this.stringify(result));
          }
          resolve(output.join('\n'));
        }
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  /**
   * Stringify a value for output
   */
  private stringify(value: unknown): string {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (typeof value === 'string') return value;
    if (typeof value === 'function') return '[Function]';

    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }

  /**
   * Generate Sandpack configuration for a playground
   */
  generateSandpackConfig(playground: InteractivePlayground): object {
    const files: Record<string, string> = {};

    // Add example files
    for (const file of playground.example.files) {
      files[file.path] = file.content;
    }

    // Add X2000 mock
    files['/x2000-mock.ts'] = X2000_BROWSER_MOCK;

    // Add package.json
    files['/package.json'] = JSON.stringify({
      name: 'x2000-playground',
      version: '1.0.0',
      type: 'module',
      dependencies: playground.sandboxConfig.dependencies,
      devDependencies: playground.sandboxConfig.devDependencies || {
        '@types/node': '^20',
        'typescript': '^5',
      },
    }, null, 2);

    return {
      template: playground.sandboxConfig.template,
      files,
      customSetup: {
        dependencies: playground.sandboxConfig.dependencies,
      },
      options: {
        showConsole: playground.example.showConsole ?? true,
        autorun: playground.example.autoRun ?? false,
        editorHeight: playground.example.editorHeight || 400,
        showLineNumbers: true,
        showInlineErrors: true,
        wrapContent: true,
        resizablePanels: true,
      },
    };
  }

  /**
   * Export playground as standalone HTML
   */
  exportAsHtml(playgroundId: string): string {
    const playground = this.playgrounds.get(playgroundId);

    if (!playground) {
      return '<html><body>Playground not found</body></html>';
    }

    const files = playground.example.files
      .map(f => `<pre data-file="${f.path}" data-language="${f.language}">${this.escapeHtml(f.content)}</pre>`)
      .join('\n');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${playground.example.title || 'X2000 Playground'}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; }
    pre { background: #1e1e1e; color: #d4d4d4; padding: 16px; border-radius: 8px; overflow-x: auto; }
    .filename { color: #888; font-size: 12px; margin-bottom: 8px; }
  </style>
</head>
<body>
  <h1>${this.escapeHtml(playground.example.title || 'X2000 Playground')}</h1>
  ${playground.example.description ? `<p>${this.escapeHtml(playground.example.description)}</p>` : ''}
  ${files}
  <script>
    // Playground would be hydrated with Sandpack or similar here
    console.log('Playground loaded');
  </script>
</body>
</html>
    `;
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Clear all playgrounds
   */
  clear(): void {
    this.playgrounds.clear();
  }

  /**
   * Get all playground IDs
   */
  getPlaygroundIds(): string[] {
    return Array.from(this.playgrounds.keys());
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const exampleExtractor = new ExampleExtractor();
export const playgroundManager = new PlaygroundManager();

/**
 * Extract examples from documentation pages
 */
export function extractExamples(pages: GeneratedPage[]): Example[] {
  return exampleExtractor.extractFromPages(pages);
}

/**
 * Create a playground from an example
 */
export function createPlayground(example: Example): InteractivePlayground {
  return playgroundManager.createPlayground(example);
}

/**
 * Execute a playground
 */
export async function executePlayground(playgroundId: string): Promise<PlaygroundResult> {
  return playgroundManager.execute(playgroundId);
}
