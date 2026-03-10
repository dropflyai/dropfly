/**
 * Session Management System
 * Maintains warm state for continuous running agents
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  AgentSession,
  BrainType,
  BrainContext,
  Decision,
  Pattern,
  Skill,
} from '../types/index.js';

// ============================================================================
// Types
// ============================================================================

type SessionState = 'warming' | 'active' | 'idle' | 'cooling' | 'terminated';

interface SessionConfig {
  warmupTimeMs: number;
  idleTimeoutMs: number;
  cooldownTimeMs: number;
  maxHistorySize: number;
}

interface SessionSnapshot {
  sessionId: string;
  brainType: BrainType;
  state: SessionState;
  context: BrainContext;
  warmState: Record<string, unknown>;
  snapshotAt: Date;
}

const DEFAULT_CONFIG: SessionConfig = {
  warmupTimeMs: 1000,
  idleTimeoutMs: 300000, // 5 minutes
  cooldownTimeMs: 5000,
  maxHistorySize: 100,
};

// ============================================================================
// Session Manager
// ============================================================================

export class SessionManager {
  private sessions: Map<string, AgentSession> = new Map();
  private config: SessionConfig;
  private stateTimers: Map<string, NodeJS.Timeout> = new Map();
  private snapshots: Map<string, SessionSnapshot[]> = new Map();

  constructor(config: Partial<SessionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ============================================================================
  // Session Lifecycle
  // ============================================================================

  /**
   * Create a new session
   */
  createSession(brainType: BrainType): AgentSession {
    const session: AgentSession = {
      id: uuidv4(),
      brainType,
      state: 'warming',
      context: {
        recentDecisions: [],
        activePatterns: [],
        relevantSkills: [],
        workingMemory: {},
      },
      startedAt: new Date(),
      lastActiveAt: new Date(),
      taskHistory: [],
      warmState: {},
    };

    this.sessions.set(session.id, session);
    this.startWarmup(session.id);

    console.log(`[Session] Created session ${session.id} for ${brainType}`);
    return session;
  }

  /**
   * Activate a session (transition from warming to active)
   */
  activateSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    this.clearTimer(sessionId);
    session.state = 'active';
    session.lastActiveAt = new Date();

    console.log(`[Session] Activated session ${sessionId}`);
    return true;
  }

  /**
   * Mark session as idle
   */
  idleSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.state !== 'active') return false;

    session.state = 'idle';
    this.startIdleTimer(sessionId);

    console.log(`[Session] Session ${sessionId} now idle`);
    return true;
  }

  /**
   * Resume an idle session
   */
  resumeSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    if (session.state === 'idle' || session.state === 'cooling') {
      this.clearTimer(sessionId);
      session.state = 'active';
      session.lastActiveAt = new Date();

      console.log(`[Session] Resumed session ${sessionId}`);
      return true;
    }

    return false;
  }

  /**
   * Start cooldown for session
   */
  cooldownSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    this.clearTimer(sessionId);
    session.state = 'cooling';

    // Create snapshot before cooldown
    this.createSnapshot(sessionId);

    this.startCooldownTimer(sessionId);

    console.log(`[Session] Session ${sessionId} cooling down`);
    return true;
  }

  /**
   * Terminate a session
   */
  terminateSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    this.clearTimer(sessionId);
    session.state = 'terminated';

    // Create final snapshot
    this.createSnapshot(sessionId);

    console.log(`[Session] Terminated session ${sessionId}`);
    return true;
  }

  // ============================================================================
  // Session Access
  // ============================================================================

  /**
   * Get a session by ID
   */
  getSession(sessionId: string): AgentSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get all sessions for a brain type
   */
  getSessionsByType(brainType: BrainType): AgentSession[] {
    return [...this.sessions.values()].filter(
      (s) => s.brainType === brainType && s.state !== 'terminated'
    );
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): AgentSession[] {
    return [...this.sessions.values()].filter((s) => s.state === 'active');
  }

  /**
   * Check if session exists and is active
   */
  isSessionActive(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    return session?.state === 'active';
  }

  // ============================================================================
  // Warm State Management
  // ============================================================================

  /**
   * Update session warm state
   */
  updateWarmState(
    sessionId: string,
    key: string,
    value: unknown
  ): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.warmState[key] = value;
    session.lastActiveAt = new Date();

    return true;
  }

  /**
   * Get warm state value
   */
  getWarmState<T>(sessionId: string, key: string): T | undefined {
    const session = this.sessions.get(sessionId);
    return session?.warmState[key] as T | undefined;
  }

  /**
   * Clear warm state
   */
  clearWarmState(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.warmState = {};
    return true;
  }

  /**
   * Transfer warm state between sessions
   */
  transferWarmState(fromSessionId: string, toSessionId: string): boolean {
    const fromSession = this.sessions.get(fromSessionId);
    const toSession = this.sessions.get(toSessionId);

    if (!fromSession || !toSession) return false;

    toSession.warmState = { ...fromSession.warmState };
    toSession.lastActiveAt = new Date();

    console.log(`[Session] Transferred warm state from ${fromSessionId} to ${toSessionId}`);
    return true;
  }

  // ============================================================================
  // Context Management
  // ============================================================================

  /**
   * Update session context
   */
  updateContext(
    sessionId: string,
    updates: Partial<BrainContext>
  ): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.context = {
      ...session.context,
      ...updates,
    };
    session.lastActiveAt = new Date();

    return true;
  }

  /**
   * Add decision to context
   */
  addDecision(sessionId: string, decision: Decision): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.context.recentDecisions.unshift(decision);

    // Trim to max size
    if (session.context.recentDecisions.length > this.config.maxHistorySize) {
      session.context.recentDecisions = session.context.recentDecisions.slice(
        0,
        this.config.maxHistorySize
      );
    }

    return true;
  }

  /**
   * Add pattern to context
   */
  addPattern(sessionId: string, pattern: Pattern): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    // Avoid duplicates
    if (!session.context.activePatterns.find((p) => p.id === pattern.id)) {
      session.context.activePatterns.push(pattern);
    }

    return true;
  }

  /**
   * Add skill to context
   */
  addSkill(sessionId: string, skill: Skill): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    // Avoid duplicates
    if (!session.context.relevantSkills.find((s) => s.id === skill.id)) {
      session.context.relevantSkills.push(skill);
    }

    return true;
  }

  /**
   * Update working memory
   */
  remember(sessionId: string, key: string, value: unknown): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.context.workingMemory[key] = value;
    session.lastActiveAt = new Date();

    return true;
  }

  /**
   * Recall from working memory
   */
  recall<T>(sessionId: string, key: string): T | undefined {
    const session = this.sessions.get(sessionId);
    return session?.context.workingMemory[key] as T | undefined;
  }

  // ============================================================================
  // Task History
  // ============================================================================

  /**
   * Add task to session history
   */
  addTaskToHistory(sessionId: string, taskId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.taskHistory.push(taskId);
    session.lastActiveAt = new Date();

    // Trim to max size
    if (session.taskHistory.length > this.config.maxHistorySize) {
      session.taskHistory = session.taskHistory.slice(-this.config.maxHistorySize);
    }

    return true;
  }

  /**
   * Get session task history
   */
  getTaskHistory(sessionId: string): string[] {
    const session = this.sessions.get(sessionId);
    return session?.taskHistory ?? [];
  }

  // ============================================================================
  // Snapshots
  // ============================================================================

  /**
   * Create a snapshot of session state
   */
  createSnapshot(sessionId: string): SessionSnapshot | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const snapshot: SessionSnapshot = {
      sessionId,
      brainType: session.brainType,
      state: session.state,
      context: JSON.parse(JSON.stringify(session.context)),
      warmState: JSON.parse(JSON.stringify(session.warmState)),
      snapshotAt: new Date(),
    };

    if (!this.snapshots.has(sessionId)) {
      this.snapshots.set(sessionId, []);
    }
    this.snapshots.get(sessionId)!.push(snapshot);

    // Keep only last 10 snapshots
    const sessionSnapshots = this.snapshots.get(sessionId)!;
    if (sessionSnapshots.length > 10) {
      this.snapshots.set(sessionId, sessionSnapshots.slice(-10));
    }

    return snapshot;
  }

  /**
   * Restore session from snapshot
   */
  restoreFromSnapshot(snapshot: SessionSnapshot): AgentSession | null {
    const session = this.createSession(snapshot.brainType);

    session.context = snapshot.context;
    session.warmState = snapshot.warmState;

    console.log(
      `[Session] Restored session from snapshot (original: ${snapshot.sessionId})`
    );
    return session;
  }

  /**
   * Get snapshots for a session
   */
  getSnapshots(sessionId: string): SessionSnapshot[] {
    return this.snapshots.get(sessionId) ?? [];
  }

  // ============================================================================
  // Timers
  // ============================================================================

  private startWarmup(sessionId: string): void {
    const timer = setTimeout(() => {
      const session = this.sessions.get(sessionId);
      if (session && session.state === 'warming') {
        session.state = 'active';
        console.log(`[Session] Session ${sessionId} warmed up`);
      }
    }, this.config.warmupTimeMs);

    this.stateTimers.set(sessionId, timer);
  }

  private startIdleTimer(sessionId: string): void {
    const timer = setTimeout(() => {
      this.cooldownSession(sessionId);
    }, this.config.idleTimeoutMs);

    this.stateTimers.set(sessionId, timer);
  }

  private startCooldownTimer(sessionId: string): void {
    const timer = setTimeout(() => {
      this.terminateSession(sessionId);
    }, this.config.cooldownTimeMs);

    this.stateTimers.set(sessionId, timer);
  }

  private clearTimer(sessionId: string): void {
    const timer = this.stateTimers.get(sessionId);
    if (timer) {
      clearTimeout(timer);
      this.stateTimers.delete(sessionId);
    }
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  /**
   * Clean up terminated sessions
   */
  cleanup(): number {
    let cleaned = 0;
    const toRemove: string[] = [];

    for (const [sessionId, session] of this.sessions) {
      if (session.state === 'terminated') {
        toRemove.push(sessionId);
      }
    }

    for (const sessionId of toRemove) {
      this.sessions.delete(sessionId);
      this.snapshots.delete(sessionId);
      cleaned++;
    }

    if (cleaned > 0) {
      console.log(`[Session] Cleaned up ${cleaned} terminated sessions`);
    }

    return cleaned;
  }

  /**
   * Get session manager status
   */
  getStatus(): string {
    const sessions = [...this.sessions.values()];
    const byState = {
      warming: sessions.filter((s) => s.state === 'warming').length,
      active: sessions.filter((s) => s.state === 'active').length,
      idle: sessions.filter((s) => s.state === 'idle').length,
      cooling: sessions.filter((s) => s.state === 'cooling').length,
      terminated: sessions.filter((s) => s.state === 'terminated').length,
    };

    return `
Session Manager Status:
-----------------------
Total Sessions: ${sessions.length}
Warming: ${byState.warming}
Active: ${byState.active}
Idle: ${byState.idle}
Cooling: ${byState.cooling}
Terminated: ${byState.terminated}
Snapshots: ${[...this.snapshots.values()].reduce((sum, s) => sum + s.length, 0)}
    `.trim();
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();
