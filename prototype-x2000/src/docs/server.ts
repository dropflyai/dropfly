/**
 * X2000 Documentation System - Doc Server
 * Serves generated docs, API endpoints for search, playground execution
 */

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';
import { DocSearchEngine, docSearchEngine, buildSearchIndex } from './search.js';
import { PlaygroundManager, playgroundManager } from './playground.js';
import { VersionManager, getVersionManager } from './versioning.js';
import type {
  DocSearchOptions,
  DocSearchResponse,
  PlaygroundResult,
  GeneratedPage,
  SearchIndex,
} from './types.js';

// ============================================================================
// Types
// ============================================================================

interface ServerConfig {
  port: number;
  host: string;
  cors: boolean;
  hotReload: boolean;
  staticDir?: string;
  docsDir?: string;
}

interface Route {
  method: string;
  pattern: RegExp;
  handler: (req: IncomingMessage, res: ServerResponse, params: Record<string, string>) => Promise<void>;
}

// ============================================================================
// MIME Types
// ============================================================================

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.mdx': 'text/markdown',
  '.md': 'text/markdown',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

// ============================================================================
// Documentation Server
// ============================================================================

export class DocServer {
  private config: ServerConfig;
  private server: ReturnType<typeof createServer> | null = null;
  private routes: Route[] = [];
  private searchEngine: DocSearchEngine;
  private playgroundManager: PlaygroundManager;
  private versionManager: VersionManager;
  private hotReloadClients: Set<ServerResponse> = new Set();

  constructor(config: Partial<ServerConfig>) {
    this.config = {
      port: config.port || 4000,
      host: config.host || 'localhost',
      cors: config.cors ?? true,
      hotReload: config.hotReload ?? true,
      staticDir: config.staticDir,
      docsDir: config.docsDir,
    };

    this.searchEngine = docSearchEngine;
    this.playgroundManager = playgroundManager;
    this.versionManager = getVersionManager(config.docsDir || process.cwd());

    this.setupRoutes();
  }

  /**
   * Set up API routes
   */
  private setupRoutes(): void {
    // Health check
    this.addRoute('GET', /^\/api\/health$/, async (req, res) => {
      this.sendJson(res, { status: 'ok', timestamp: new Date().toISOString() });
    });

    // Search API
    this.addRoute('GET', /^\/api\/search$/, async (req, res) => {
      const url = new URL(req.url || '/', `http://${req.headers.host}`);
      const query = url.searchParams.get('q') || '';
      const version = url.searchParams.get('version') || undefined;
      const categories = url.searchParams.get('categories')?.split(',') || undefined;
      const tags = url.searchParams.get('tags')?.split(',') || undefined;
      const limit = parseInt(url.searchParams.get('limit') || '10', 10);
      const offset = parseInt(url.searchParams.get('offset') || '0', 10);
      const semantic = url.searchParams.get('semantic') === 'true';

      const options: DocSearchOptions = {
        query,
        version,
        categories,
        tags,
        limit,
        offset,
        semanticSearch: semantic,
      };

      const results = await this.searchEngine.search(options);
      this.sendJson(res, results);
    });

    // Search suggestions
    this.addRoute('GET', /^\/api\/search\/suggestions$/, async (req, res) => {
      const url = new URL(req.url || '/', `http://${req.headers.host}`);
      const prefix = url.searchParams.get('prefix') || '';
      const limit = parseInt(url.searchParams.get('limit') || '5', 10);

      const suggestions = this.searchEngine.getSuggestions(prefix, limit);
      this.sendJson(res, { suggestions });
    });

    // Playground create
    this.addRoute('POST', /^\/api\/playground$/, async (req, res) => {
      const body = await this.parseBody(req);
      const example = JSON.parse(body);
      const playground = this.playgroundManager.createPlayground(example);
      this.sendJson(res, { id: playground.id, sandboxConfig: playground.sandboxConfig });
    });

    // Playground execute
    this.addRoute('POST', /^\/api\/playground\/([^/]+)\/execute$/, async (req, res, params) => {
      const playgroundId = params.id;
      const result = await this.playgroundManager.execute(playgroundId);
      this.sendJson(res, result);
    });

    // Playground get
    this.addRoute('GET', /^\/api\/playground\/([^/]+)$/, async (req, res, params) => {
      const playgroundId = params.id;
      const playground = this.playgroundManager.getPlayground(playgroundId);

      if (!playground) {
        this.sendError(res, 404, 'Playground not found');
        return;
      }

      this.sendJson(res, playground);
    });

    // Playground Sandpack config
    this.addRoute('GET', /^\/api\/playground\/([^/]+)\/sandpack$/, async (req, res, params) => {
      const playgroundId = params.id;
      const playground = this.playgroundManager.getPlayground(playgroundId);

      if (!playground) {
        this.sendError(res, 404, 'Playground not found');
        return;
      }

      const sandpackConfig = this.playgroundManager.generateSandpackConfig(playground);
      this.sendJson(res, sandpackConfig);
    });

    // Versions list
    this.addRoute('GET', /^\/api\/versions$/, async (req, res) => {
      const versions = this.versionManager.getAllVersions();
      this.sendJson(res, { versions, current: this.versionManager.getCurrentVersion() });
    });

    // Version info
    this.addRoute('GET', /^\/api\/versions\/([^/]+)$/, async (req, res, params) => {
      const version = params.id;
      const docVersion = this.versionManager.getVersion(version);

      if (!docVersion) {
        this.sendError(res, 404, 'Version not found');
        return;
      }

      const banner = this.versionManager.getVersionBanner(version);
      this.sendJson(res, { ...docVersion, banner });
    });

    // Search stats
    this.addRoute('GET', /^\/api\/stats$/, async (req, res) => {
      const stats = this.searchEngine.getStats();
      this.sendJson(res, stats || { error: 'No index loaded' });
    });

    // Hot reload SSE endpoint
    if (this.config.hotReload) {
      this.addRoute('GET', /^\/api\/hot-reload$/, async (req, res) => {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          ...(this.config.cors ? this.getCorsHeaders() : {}),
        });

        this.hotReloadClients.add(res);

        req.on('close', () => {
          this.hotReloadClients.delete(res);
        });

        // Keep connection alive
        const keepAlive = setInterval(() => {
          res.write(': keepalive\n\n');
        }, 15000);

        req.on('close', () => {
          clearInterval(keepAlive);
        });
      });
    }
  }

  /**
   * Add a route handler
   */
  private addRoute(
    method: string,
    pattern: RegExp,
    handler: (req: IncomingMessage, res: ServerResponse, params: Record<string, string>) => Promise<void>
  ): void {
    this.routes.push({ method, pattern, handler });
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = createServer(async (req, res) => {
        try {
          await this.handleRequest(req, res);
        } catch (error) {
          console.error('[DocServer] Request error:', error);
          this.sendError(res, 500, 'Internal server error');
        }
      });

      this.server.on('error', reject);

      this.server.listen(this.config.port, this.config.host, () => {
        console.log(`[DocServer] Documentation server running at http://${this.config.host}:${this.config.port}`);
        resolve();
      });
    });
  }

  /**
   * Stop the server
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        // Close all hot reload connections
        for (const client of this.hotReloadClients) {
          client.end();
        }
        this.hotReloadClients.clear();

        this.server.close(() => {
          console.log('[DocServer] Server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Handle an incoming request
   */
  private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const pathname = url.pathname;

    // Add CORS headers
    if (this.config.cors) {
      const corsHeaders = this.getCorsHeaders();
      for (const [key, value] of Object.entries(corsHeaders)) {
        res.setHeader(key, value);
      }

      // Handle preflight
      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }
    }

    // Try API routes first
    for (const route of this.routes) {
      if (req.method !== route.method) continue;

      const match = pathname.match(route.pattern);
      if (match) {
        const params: Record<string, string> = {};
        if (match[1]) params.id = match[1];
        if (match[2]) params.subId = match[2];

        await route.handler(req, res, params);
        return;
      }
    }

    // Try static files
    if (this.config.staticDir) {
      const handled = await this.serveStaticFile(pathname, res);
      if (handled) return;
    }

    // Try docs files
    if (this.config.docsDir) {
      const handled = await this.serveDocsFile(pathname, res);
      if (handled) return;
    }

    // 404
    this.sendError(res, 404, 'Not found');
  }

  /**
   * Serve a static file
   */
  private async serveStaticFile(pathname: string, res: ServerResponse): Promise<boolean> {
    if (!this.config.staticDir) return false;

    let filePath = join(this.config.staticDir, pathname);

    // Handle directory requests
    if (existsSync(filePath) && statSync(filePath).isDirectory()) {
      filePath = join(filePath, 'index.html');
    }

    // Try with .html extension
    if (!existsSync(filePath) && !extname(pathname)) {
      filePath = join(this.config.staticDir, pathname + '.html');
    }

    if (!existsSync(filePath)) {
      return false;
    }

    const ext = extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    try {
      const content = readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Serve a docs file (MDX/MD)
   */
  private async serveDocsFile(pathname: string, res: ServerResponse): Promise<boolean> {
    if (!this.config.docsDir) return false;

    // Try .mdx first, then .md
    const extensions = ['.mdx', '.md', '/index.mdx', '/index.md'];
    let filePath = '';

    for (const ext of extensions) {
      const tryPath = join(this.config.docsDir, pathname + ext);
      if (existsSync(tryPath)) {
        filePath = tryPath;
        break;
      }
    }

    if (!filePath) {
      return false;
    }

    try {
      const content = readFileSync(filePath, 'utf-8');

      // Return as JSON with parsed content
      // In a real implementation, this would be rendered to HTML
      this.sendJson(res, {
        path: pathname,
        content,
        type: 'mdx',
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Parse request body
   */
  private async parseBody(req: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => resolve(body));
      req.on('error', reject);
    });
  }

  /**
   * Send JSON response
   */
  private sendJson(res: ServerResponse, data: unknown): void {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }

  /**
   * Send error response
   */
  private sendError(res: ServerResponse, code: number, message: string): void {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: message, code }));
  }

  /**
   * Get CORS headers
   */
  private getCorsHeaders(): Record<string, string> {
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
  }

  /**
   * Load a search index
   */
  loadSearchIndex(index: SearchIndex): void {
    this.searchEngine.loadIndex(index);
    console.log(`[DocServer] Search index loaded with ${index.totalChunks} chunks`);
  }

  /**
   * Enable semantic search
   */
  async enableSemanticSearch(apiKey: string): Promise<void> {
    await this.searchEngine.enableSemanticSearch('openai', { apiKey });
    console.log('[DocServer] Semantic search enabled');
  }

  /**
   * Trigger hot reload for all connected clients
   */
  triggerHotReload(event: string, data?: unknown): void {
    if (!this.config.hotReload) return;

    const message = `event: ${event}\ndata: ${JSON.stringify(data || {})}\n\n`;

    for (const client of this.hotReloadClients) {
      client.write(message);
    }
  }

  /**
   * Get server info
   */
  getInfo(): { host: string; port: number; url: string } {
    return {
      host: this.config.host,
      port: this.config.port,
      url: `http://${this.config.host}:${this.config.port}`,
    };
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

let serverInstance: DocServer | null = null;

/**
 * Get or create the doc server
 */
export function getDocServer(config?: Partial<ServerConfig>): DocServer {
  if (!serverInstance) {
    serverInstance = new DocServer(config || {});
  }
  return serverInstance;
}

/**
 * Start the documentation server
 */
export async function startDocServer(config?: Partial<ServerConfig>): Promise<DocServer> {
  const server = getDocServer(config);
  await server.start();
  return server;
}

/**
 * Stop the documentation server
 */
export async function stopDocServer(): Promise<void> {
  if (serverInstance) {
    await serverInstance.stop();
    serverInstance = null;
  }
}
