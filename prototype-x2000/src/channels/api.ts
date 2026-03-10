/**
 * HTTP API Channel
 *
 * Provides a REST API for X2000 interaction.
 * Useful for web interfaces, mobile apps, and integrations.
 */

import { createServer, IncomingMessage, ServerResponse, Server } from 'http';
import { parse as parseUrl } from 'url';
import { v4 as uuidv4 } from 'uuid';
import {
  BaseChannel,
  ChannelRegistry,
  type ChannelConfig,
  type ChannelMessage,
  type ChannelResponse,
  type ChannelContext,
} from './base.js';

// ============================================================================
// Types
// ============================================================================

export interface APIChannelConfig extends Partial<ChannelConfig> {
  port?: number;
  host?: string;
  corsOrigins?: string[];
  authToken?: string;
  maxBodySize?: number;
}

interface APIRequest {
  message: string;
  userId?: string;
  sessionId?: string;
  brainType?: string;
  metadata?: Record<string, unknown>;
  attachments?: Array<{
    type: 'file' | 'image' | 'url';
    name: string;
    url?: string;
    data?: string;
    mimeType?: string;
  }>;
}

interface APIResponse {
  id: string;
  content: string;
  attachments?: Array<{
    type: 'file' | 'image' | 'url';
    name: string;
    url?: string;
  }>;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

// ============================================================================
// API Channel
// ============================================================================

export class APIChannel extends BaseChannel {
  readonly type = 'api';
  readonly name = 'HTTP API';

  private server: Server | null = null;
  private port: number;
  private host: string;
  private corsOrigins: string[];
  private authToken: string | null;
  private maxBodySize: number;

  constructor(config: APIChannelConfig = {}) {
    super(config);

    this.port = config.port || parseInt(process.env.X2000_API_PORT || '3000');
    this.host = config.host || process.env.X2000_API_HOST || '0.0.0.0';
    this.corsOrigins = config.corsOrigins || ['*'];
    this.authToken = config.authToken || process.env.X2000_API_TOKEN || null;
    this.maxBodySize = config.maxBodySize || 10 * 1024 * 1024; // 10MB
  }

  /**
   * Initialize the HTTP server
   */
  async initialize(): Promise<void> {
    if (this.server) {
      return;
    }

    this.server = createServer((req, res) => this.handleRequest(req, res));

    return new Promise((resolve, reject) => {
      this.server!.listen(this.port, this.host, () => {
        this.connected = true;
        console.log(`[API] Server listening on http://${this.host}:${this.port}`);
        resolve();
      });

      this.server!.on('error', (error) => {
        console.error('[API] Server error:', error);
        reject(error);
      });
    });
  }

  /**
   * Shutdown the HTTP server
   */
  async shutdown(): Promise<void> {
    if (!this.server) {
      return;
    }

    return new Promise((resolve) => {
      this.server!.close(() => {
        this.connected = false;
        this.server = null;
        console.log('[API] Server shutdown');
        resolve();
      });
    });
  }

  /**
   * Send a response (for API, this is handled in request/response cycle)
   */
  async send(
    channelId: string,
    response: ChannelResponse,
    _context?: Partial<ChannelContext>
  ): Promise<void> {
    // For API channel, responses are returned directly in the request handler
    // This method could be used for webhooks or push notifications
    console.log(`[API] Send called for channel ${channelId}:`, response.content.substring(0, 100));
  }

  /**
   * Handle incoming HTTP requests
   */
  private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    // Set CORS headers
    this.setCorsHeaders(res);

    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = parseUrl(req.url || '/', true);

    try {
      // Route requests
      switch (url.pathname) {
        case '/health':
          this.handleHealth(res);
          break;

        case '/chat':
        case '/message':
          if (req.method === 'POST') {
            await this.handleChat(req, res);
          } else {
            this.sendError(res, 405, 'Method not allowed');
          }
          break;

        case '/status':
          this.handleStatus(res);
          break;

        default:
          this.sendError(res, 404, 'Not found');
      }
    } catch (error) {
      console.error('[API] Request error:', error);
      this.sendError(res, 500, error instanceof Error ? error.message : 'Internal server error');
    }
  }

  /**
   * Handle health check endpoint
   */
  private handleHealth(res: ServerResponse): void {
    this.sendJson(res, 200, {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle status endpoint
   */
  private handleStatus(res: ServerResponse): void {
    this.sendJson(res, 200, {
      status: 'running',
      channels: ChannelRegistry.getStatus(),
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle chat/message endpoint
   */
  private async handleChat(req: IncomingMessage, res: ServerResponse): Promise<void> {
    // Check authentication if configured
    if (this.authToken) {
      const authHeader = req.headers.authorization;
      if (!authHeader || authHeader !== `Bearer ${this.authToken}`) {
        this.sendError(res, 401, 'Unauthorized');
        return;
      }
    }

    // Parse body
    const body = await this.parseBody(req);
    if (!body) {
      this.sendError(res, 400, 'Invalid request body');
      return;
    }

    const apiRequest = body as APIRequest;
    if (!apiRequest.message) {
      this.sendError(res, 400, 'Message is required');
      return;
    }

    // Create channel message
    const message: ChannelMessage = {
      id: uuidv4(),
      channelType: this.type,
      channelId: 'api',
      userId: apiRequest.userId || 'anonymous',
      content: apiRequest.message,
      timestamp: new Date(),
      metadata: apiRequest.metadata || {},
      attachments: apiRequest.attachments,
    };

    // Process message
    const response = await this.processMessage(message);

    if (!response) {
      this.sendError(res, 500, 'Failed to process message');
      return;
    }

    // Send response
    const apiResponse: APIResponse = {
      id: uuidv4(),
      content: response.content,
      attachments: response.attachments,
      metadata: response.metadata,
      timestamp: new Date().toISOString(),
    };

    this.sendJson(res, 200, apiResponse);
  }

  /**
   * Parse request body
   */
  private parseBody(req: IncomingMessage): Promise<unknown> {
    return new Promise((resolve) => {
      let body = '';
      let size = 0;

      req.on('data', (chunk) => {
        size += chunk.length;

        if (size > this.maxBodySize) {
          resolve(null);
          return;
        }

        body += chunk.toString();
      });

      req.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve(null);
        }
      });

      req.on('error', () => {
        resolve(null);
      });
    });
  }

  /**
   * Set CORS headers
   */
  private setCorsHeaders(res: ServerResponse): void {
    const origin = this.corsOrigins.includes('*') ? '*' : this.corsOrigins.join(', ');
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
  }

  /**
   * Send JSON response
   */
  private sendJson(res: ServerResponse, status: number, data: unknown): void {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }

  /**
   * Send error response
   */
  private sendError(res: ServerResponse, status: number, message: string): void {
    this.sendJson(res, status, { error: message });
  }
}

// ============================================================================
// Exports
// ============================================================================

export const apiChannel = new APIChannel();

// Register with channel registry
ChannelRegistry.register(apiChannel);

export function createAPIChannel(config?: APIChannelConfig): APIChannel {
  return new APIChannel(config);
}
