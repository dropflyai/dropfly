/**
 * Session Persistence
 *
 * Enables warm state between runs:
 * - Save session state to disk/database
 * - Restore sessions on restart
 * - Maintain context across invocations
 * - Track conversation history
 *
 * This is what makes X2000 feel continuous, not cold-start.
 */

import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// Types
// ============================================================================

export interface SessionState {
  id: string;
  brainType: string;
  trustLevel: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;

  // Conversation history
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: Record<string, unknown>;
  }>;

  // Tool execution history
  toolCalls: Array<{
    tool: string;
    params: Record<string, unknown>;
    result: {
      success: boolean;
      output?: unknown;
      error?: string;
    };
    timestamp: Date;
    duration: number;
  }>;

  // Working context
  context: {
    workingDirectory: string;
    currentTask?: string;
    variables: Record<string, unknown>;
    files: string[]; // Files accessed this session
  };

  // Learnings from this session
  learnings: string[];

  // Session metadata
  metadata: Record<string, unknown>;
}

export interface PersistenceConfig {
  storageDir: string;
  maxSessions: number;
  sessionTTL: number; // milliseconds
  autoSave: boolean;
  autoSaveInterval: number; // milliseconds
  compression: boolean;
}

// ============================================================================
// Session Manager
// ============================================================================

export class SessionManager {
  private config: PersistenceConfig;
  private sessions: Map<string, SessionState> = new Map();
  private saveTimers: Map<string, NodeJS.Timeout> = new Map();
  private initialized: boolean = false;

  constructor(config: Partial<PersistenceConfig> = {}) {
    this.config = {
      storageDir: process.env.X2000_SESSION_DIR || path.join(process.cwd(), '.x2000', 'sessions'),
      maxSessions: 100,
      sessionTTL: 7 * 24 * 60 * 60 * 1000, // 7 days
      autoSave: true,
      autoSaveInterval: 30000, // 30 seconds
      compression: false,
      ...config,
    };
  }

  /**
   * Initialize the session manager
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Ensure storage directory exists
    if (!fs.existsSync(this.config.storageDir)) {
      fs.mkdirSync(this.config.storageDir, { recursive: true });
    }

    // Load existing sessions
    await this.loadAllSessions();

    // Clean up expired sessions
    await this.cleanupExpired();

    this.initialized = true;
    console.log(`[SessionManager] Initialized with ${this.sessions.size} sessions`);
  }

  /**
   * Create a new session
   */
  async create(
    brainType: string,
    trustLevel: number,
    options: Partial<SessionState> = {}
  ): Promise<SessionState> {
    await this.ensureInitialized();

    const session: SessionState = {
      id: uuidv4(),
      brainType,
      trustLevel,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + this.config.sessionTTL),
      messages: [],
      toolCalls: [],
      context: {
        workingDirectory: process.cwd(),
        variables: {},
        files: [],
      },
      learnings: [],
      metadata: {},
      ...options,
    };

    this.sessions.set(session.id, session);

    // Set up auto-save
    if (this.config.autoSave) {
      this.setupAutoSave(session.id);
    }

    // Save immediately
    await this.save(session.id);

    console.log(`[SessionManager] Created session: ${session.id}`);
    return session;
  }

  /**
   * Get a session by ID
   */
  async get(sessionId: string): Promise<SessionState | null> {
    await this.ensureInitialized();

    let session: SessionState | undefined = this.sessions.get(sessionId);

    if (!session) {
      // Try to load from disk
      const loaded = await this.loadSession(sessionId);
      if (loaded) {
        session = loaded;
        this.sessions.set(sessionId, session);
      }
    }

    // Check if expired
    if (session && session.expiresAt && new Date(session.expiresAt) < new Date()) {
      console.log(`[SessionManager] Session expired: ${sessionId}`);
      await this.delete(sessionId);
      return null;
    }

    return session || null;
  }

  /**
   * Update a session
   */
  async update(
    sessionId: string,
    updates: Partial<SessionState>
  ): Promise<SessionState | null> {
    await this.ensureInitialized();

    const session = await this.get(sessionId);
    if (!session) return null;

    // Merge updates
    Object.assign(session, updates, { updatedAt: new Date() });

    // Extend expiration
    session.expiresAt = new Date(Date.now() + this.config.sessionTTL);

    this.sessions.set(sessionId, session);

    return session;
  }

  /**
   * Add a message to session history
   */
  async addMessage(
    sessionId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const session = await this.get(sessionId);
    if (!session) return;

    session.messages.push({
      role,
      content,
      timestamp: new Date(),
      metadata,
    });

    session.updatedAt = new Date();
  }

  /**
   * Add a tool call to session history
   */
  async addToolCall(
    sessionId: string,
    tool: string,
    params: Record<string, unknown>,
    result: { success: boolean; output?: unknown; error?: string },
    duration: number
  ): Promise<void> {
    const session = await this.get(sessionId);
    if (!session) return;

    session.toolCalls.push({
      tool,
      params,
      result,
      timestamp: new Date(),
      duration,
    });

    session.updatedAt = new Date();
  }

  /**
   * Add a learning to the session
   */
  async addLearning(sessionId: string, learning: string): Promise<void> {
    const session = await this.get(sessionId);
    if (!session) return;

    if (!session.learnings.includes(learning)) {
      session.learnings.push(learning);
      session.updatedAt = new Date();
    }
  }

  /**
   * Set a context variable
   */
  async setVariable(
    sessionId: string,
    key: string,
    value: unknown
  ): Promise<void> {
    const session = await this.get(sessionId);
    if (!session) return;

    session.context.variables[key] = value;
    session.updatedAt = new Date();
  }

  /**
   * Get a context variable
   */
  async getVariable(sessionId: string, key: string): Promise<unknown> {
    const session = await this.get(sessionId);
    return session?.context.variables[key];
  }

  /**
   * Track a file access
   */
  async trackFile(sessionId: string, filePath: string): Promise<void> {
    const session = await this.get(sessionId);
    if (!session) return;

    if (!session.context.files.includes(filePath)) {
      session.context.files.push(filePath);
      session.updatedAt = new Date();
    }
  }

  /**
   * Save a session to disk
   */
  async save(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const filePath = this.getSessionPath(sessionId);
    const data = JSON.stringify(session, null, 2);

    fs.writeFileSync(filePath, data, 'utf-8');
    console.log(`[SessionManager] Saved session: ${sessionId}`);
  }

  /**
   * Save all sessions
   */
  async saveAll(): Promise<void> {
    for (const sessionId of this.sessions.keys()) {
      await this.save(sessionId);
    }
    console.log(`[SessionManager] Saved ${this.sessions.size} sessions`);
  }

  /**
   * Delete a session
   */
  async delete(sessionId: string): Promise<void> {
    // Clear auto-save timer
    const timer = this.saveTimers.get(sessionId);
    if (timer) {
      clearInterval(timer);
      this.saveTimers.delete(sessionId);
    }

    // Remove from memory
    this.sessions.delete(sessionId);

    // Remove from disk
    const filePath = this.getSessionPath(sessionId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    console.log(`[SessionManager] Deleted session: ${sessionId}`);
  }

  /**
   * List all sessions
   */
  async list(): Promise<Array<{ id: string; brainType: string; updatedAt: Date }>> {
    await this.ensureInitialized();

    return Array.from(this.sessions.values()).map(s => ({
      id: s.id,
      brainType: s.brainType,
      updatedAt: s.updatedAt,
    }));
  }

  /**
   * Get recent messages from a session
   */
  async getRecentMessages(
    sessionId: string,
    count: number = 10
  ): Promise<SessionState['messages']> {
    const session = await this.get(sessionId);
    if (!session) return [];

    return session.messages.slice(-count);
  }

  /**
   * Export session for continuation
   */
  async export(sessionId: string): Promise<string | null> {
    const session = await this.get(sessionId);
    if (!session) return null;

    return JSON.stringify(session);
  }

  /**
   * Import a session from export
   */
  async import(data: string): Promise<SessionState | null> {
    try {
      const session = JSON.parse(data) as SessionState;

      // Generate new ID to avoid conflicts
      session.id = uuidv4();
      session.createdAt = new Date();
      session.updatedAt = new Date();
      session.expiresAt = new Date(Date.now() + this.config.sessionTTL);

      this.sessions.set(session.id, session);
      await this.save(session.id);

      return session;
    } catch (error) {
      console.error('[SessionManager] Import failed:', error);
      return null;
    }
  }

  /**
   * Fork a session (create copy with new ID)
   */
  async fork(sessionId: string): Promise<SessionState | null> {
    const session = await this.get(sessionId);
    if (!session) return null;

    const forked: SessionState = {
      ...JSON.parse(JSON.stringify(session)),
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + this.config.sessionTTL),
      metadata: {
        ...session.metadata,
        forkedFrom: sessionId,
      },
    };

    this.sessions.set(forked.id, forked);
    await this.save(forked.id);

    return forked;
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  private getSessionPath(sessionId: string): string {
    return path.join(this.config.storageDir, `${sessionId}.json`);
  }

  private async loadSession(sessionId: string): Promise<SessionState | null> {
    const filePath = this.getSessionPath(sessionId);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      const session = JSON.parse(data) as SessionState;

      // Convert date strings back to Date objects
      session.createdAt = new Date(session.createdAt);
      session.updatedAt = new Date(session.updatedAt);
      if (session.expiresAt) {
        session.expiresAt = new Date(session.expiresAt);
      }
      session.messages = session.messages.map(m => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }));
      session.toolCalls = session.toolCalls.map(t => ({
        ...t,
        timestamp: new Date(t.timestamp),
      }));

      return session;
    } catch (error) {
      console.error(`[SessionManager] Failed to load session ${sessionId}:`, error);
      return null;
    }
  }

  private async loadAllSessions(): Promise<void> {
    if (!fs.existsSync(this.config.storageDir)) {
      return;
    }

    const files = fs.readdirSync(this.config.storageDir)
      .filter(f => f.endsWith('.json'));

    for (const file of files) {
      const sessionId = file.replace('.json', '');
      const session = await this.loadSession(sessionId);

      if (session) {
        this.sessions.set(sessionId, session);

        if (this.config.autoSave) {
          this.setupAutoSave(sessionId);
        }
      }
    }
  }

  private async cleanupExpired(): Promise<void> {
    const now = new Date();
    const expired: string[] = [];

    for (const [id, session] of this.sessions) {
      if (session.expiresAt && new Date(session.expiresAt) < now) {
        expired.push(id);
      }
    }

    for (const id of expired) {
      await this.delete(id);
    }

    if (expired.length > 0) {
      console.log(`[SessionManager] Cleaned up ${expired.length} expired sessions`);
    }
  }

  private setupAutoSave(sessionId: string): void {
    // Clear existing timer
    const existing = this.saveTimers.get(sessionId);
    if (existing) {
      clearInterval(existing);
    }

    // Set up new timer
    const timer = setInterval(() => {
      this.save(sessionId).catch(err => {
        console.error(`[SessionManager] Auto-save failed for ${sessionId}:`, err);
      });
    }, this.config.autoSaveInterval);

    this.saveTimers.set(sessionId, timer);
  }

  /**
   * Cleanup on shutdown
   */
  async shutdown(): Promise<void> {
    // Save all sessions
    await this.saveAll();

    // Clear all timers
    for (const timer of this.saveTimers.values()) {
      clearInterval(timer);
    }
    this.saveTimers.clear();

    console.log('[SessionManager] Shutdown complete');
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const sessionManager = new SessionManager();

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Create or resume a session
 */
export async function getOrCreateSession(
  sessionId: string | null,
  brainType: string,
  trustLevel: number
): Promise<SessionState> {
  if (sessionId) {
    const existing = await sessionManager.get(sessionId);
    if (existing) {
      console.log(`[Session] Resuming session: ${sessionId}`);
      return existing;
    }
  }

  return sessionManager.create(brainType, trustLevel);
}

/**
 * Quick session context builder for prompts
 */
export async function buildSessionContext(sessionId: string): Promise<string> {
  const session = await sessionManager.get(sessionId);
  if (!session) return '';

  const parts: string[] = [];

  // Recent messages context
  const recentMessages = session.messages.slice(-5);
  if (recentMessages.length > 0) {
    parts.push('## Recent Conversation');
    for (const msg of recentMessages) {
      parts.push(`${msg.role.toUpperCase()}: ${msg.content.substring(0, 200)}...`);
    }
  }

  // Recent tool usage
  const recentTools = session.toolCalls.slice(-5);
  if (recentTools.length > 0) {
    parts.push('\n## Recent Tool Usage');
    for (const tool of recentTools) {
      parts.push(`- ${tool.tool}: ${tool.result.success ? 'SUCCESS' : 'FAILED'}`);
    }
  }

  // Learnings
  if (session.learnings.length > 0) {
    parts.push('\n## Session Learnings');
    for (const learning of session.learnings) {
      parts.push(`- ${learning}`);
    }
  }

  // Current task
  if (session.context.currentTask) {
    parts.push(`\n## Current Task\n${session.context.currentTask}`);
  }

  return parts.join('\n');
}
