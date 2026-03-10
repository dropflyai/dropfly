/**
 * X2000 Channel System - Base Adapter
 *
 * Abstract base class for all channel adapters.
 * Provides common lifecycle methods, message normalization, and capability declaration.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  PlatformType,
  ChannelAdapter,
  ChannelCapabilities,
  ChannelConfig,
  ChannelStatus,
  HealthCheckResult,
  UnifiedMessage,
  UnifiedResponse,
  UnifiedRecipient,
  UnifiedParticipant,
  MessageContent,
  SendResult,
  Attachment,
  DEFAULT_CAPABILITIES,
} from './types.js';

// ============================================================================
// Base Adapter Abstract Class
// ============================================================================

/**
 * Abstract base class for channel adapters.
 * Provides common functionality and enforces the adapter contract.
 */
export abstract class BaseAdapter implements ChannelAdapter {
  // === Identity (must be overridden) ===
  abstract readonly platform: PlatformType;
  abstract readonly name: string;
  abstract readonly capabilities: ChannelCapabilities;

  // === State ===
  protected status: ChannelStatus = 'disconnected';
  protected healthScore: number = 100;
  protected lastHeartbeat: Date | null = null;
  protected config: ChannelConfig | null = null;
  protected consecutiveFailures: number = 0;

  // === Circuit Breaker ===
  protected circuitState: 'closed' | 'open' | 'half-open' = 'closed';
  protected circuitFailureThreshold: number = 5;
  protected circuitResetTimeout: number = 30000; // 30 seconds
  protected circuitLastFailure: Date | null = null;

  // ============================================================================
  // Lifecycle Methods
  // ============================================================================

  /**
   * Initialize the adapter with configuration
   */
  abstract initialize(config: ChannelConfig): Promise<void>;

  /**
   * Shutdown the adapter
   */
  abstract shutdown(): Promise<void>;

  /**
   * Perform a health check
   */
  abstract healthCheck(): Promise<HealthCheckResult>;

  /**
   * Reconnect after disconnection
   */
  async reconnect(): Promise<void> {
    if (!this.config) {
      throw new Error('Cannot reconnect: adapter not initialized');
    }

    this.status = 'connecting';
    await this.shutdown();
    await this.initialize(this.config);
  }

  // ============================================================================
  // Messaging Methods
  // ============================================================================

  /**
   * Receive messages from the platform (async generator)
   */
  abstract receiveMessages(): AsyncGenerator<UnifiedMessage, void, unknown>;

  /**
   * Send a message to the platform
   */
  abstract sendMessage(
    message: UnifiedResponse,
    recipient: UnifiedRecipient
  ): Promise<SendResult>;

  // ============================================================================
  // Status Methods
  // ============================================================================

  /**
   * Get current status
   */
  getStatus(): ChannelStatus {
    return this.status;
  }

  /**
   * Get health score (0-100)
   */
  getHealthScore(): number {
    return this.healthScore;
  }

  /**
   * Update status
   */
  protected setStatus(status: ChannelStatus): void {
    this.status = status;
  }

  /**
   * Update health score based on operation success/failure
   */
  protected updateHealthScore(success: boolean): void {
    if (success) {
      // Increase health score on success (max 100)
      this.healthScore = Math.min(100, this.healthScore + 5);
      this.consecutiveFailures = 0;
      this.lastHeartbeat = new Date();
    } else {
      // Decrease health score on failure
      this.healthScore = Math.max(0, this.healthScore - 10);
      this.consecutiveFailures++;

      // Degrade status if health is low
      if (this.healthScore < 50 && this.status === 'connected') {
        this.status = 'degraded';
      }

      // Check circuit breaker
      this.checkCircuitBreaker();
    }
  }

  // ============================================================================
  // Circuit Breaker
  // ============================================================================

  /**
   * Check if circuit breaker should trip
   */
  protected checkCircuitBreaker(): void {
    if (this.consecutiveFailures >= this.circuitFailureThreshold) {
      this.circuitState = 'open';
      this.circuitLastFailure = new Date();
      this.status = 'error';
      console.warn(`[${this.platform}] Circuit breaker OPEN after ${this.consecutiveFailures} failures`);
    }
  }

  /**
   * Check if operation should be allowed through circuit breaker
   */
  protected async checkCircuit(): Promise<boolean> {
    if (this.circuitState === 'closed') {
      return true;
    }

    if (this.circuitState === 'open') {
      const timeSinceFailure = Date.now() - (this.circuitLastFailure?.getTime() ?? 0);
      if (timeSinceFailure > this.circuitResetTimeout) {
        this.circuitState = 'half-open';
        console.log(`[${this.platform}] Circuit breaker HALF-OPEN, testing...`);
        return true;
      }
      return false;
    }

    // half-open state - allow one request through
    return true;
  }

  /**
   * Reset circuit breaker after successful operation
   */
  protected resetCircuit(): void {
    if (this.circuitState !== 'closed') {
      console.log(`[${this.platform}] Circuit breaker CLOSED`);
      this.circuitState = 'closed';
      this.consecutiveFailures = 0;
    }
  }

  // ============================================================================
  // Message Normalization Helpers
  // ============================================================================

  /**
   * Create a UnifiedMessage from platform data
   */
  protected createUnifiedMessage(params: {
    id?: string;
    sender: Omit<UnifiedParticipant, 'platformId'>;
    recipient: UnifiedRecipient;
    content: string | MessageContent;
    attachments?: Attachment[];
    timestamp?: Date;
    threadId?: string;
    replyTo?: string;
    platformData?: Record<string, unknown>;
  }): UnifiedMessage {
    const { id, sender, recipient, content, attachments, timestamp, threadId, replyTo, platformData } = params;

    // Generate platformId
    const platformId = `${this.platform}:${sender.id}`;

    // Normalize content to MessageContent
    const normalizedContent: MessageContent =
      typeof content === 'string'
        ? { type: 'text', text: content }
        : content;

    return {
      id: id || uuidv4(),
      platform: this.platform,
      sender: {
        ...sender,
        platformId,
      },
      recipient,
      content: normalizedContent,
      attachments: attachments || [],
      thread: threadId ? { id: threadId, parentMessageId: replyTo } : undefined,
      replyTo,
      timestamp: timestamp || new Date(),
      platformData: platformData || {},
      sessionId: this.generateSessionId(recipient, sender.id),
    };
  }

  /**
   * Generate a session ID for a conversation
   */
  protected generateSessionId(recipient: UnifiedRecipient, userId: string): string {
    return `${this.platform}-${recipient.id}-${userId}`;
  }

  /**
   * Convert content to format supported by platform
   */
  protected formatContent(content: MessageContent): string {
    // Priority: text > markdown > html > structured
    if (content.text) {
      return content.text;
    }

    if (content.markdown && this.capabilities.supportsMarkdown) {
      return content.markdown;
    }

    if (content.html && this.capabilities.supportsHTML) {
      // Strip HTML if not supported
      return this.stripHtml(content.html);
    }

    if (content.structured) {
      return this.formatStructuredContent(content.structured);
    }

    return '';
  }

  /**
   * Strip HTML tags from content
   */
  protected stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
  }

  /**
   * Format structured content as plain text
   */
  protected formatStructuredContent(
    structured: NonNullable<MessageContent['structured']>
  ): string {
    const parts: string[] = [];

    if (structured.title) {
      parts.push(`**${structured.title}**`);
    }

    if (structured.description) {
      parts.push(structured.description);
    }

    if (structured.fields) {
      for (const field of structured.fields) {
        parts.push(`${field.label}: ${field.value}`);
      }
    }

    return parts.join('\n');
  }

  /**
   * Truncate message to platform's max length
   */
  protected truncateMessage(text: string): string {
    const maxLength = this.capabilities.maxMessageLength;

    if (!maxLength || maxLength === Infinity || text.length <= maxLength) {
      return text;
    }

    const truncated = text.substring(0, maxLength - 20);
    return `${truncated}\n\n... [truncated]`;
  }

  /**
   * Check if attachment is supported
   */
  protected isAttachmentSupported(attachment: Attachment): boolean {
    switch (attachment.type) {
      case 'image':
        return this.capabilities.supportsImages;
      case 'file':
        return this.capabilities.supportsFiles;
      case 'video':
        return this.capabilities.supportsVideo;
      case 'audio':
      case 'voice':
        return this.capabilities.supportsVoice;
      case 'location':
        return this.capabilities.supportsLocation;
      default:
        return false;
    }
  }

  /**
   * Filter attachments to only supported types
   */
  protected filterSupportedAttachments(attachments: Attachment[]): Attachment[] {
    return attachments.filter((a) => {
      if (!this.isAttachmentSupported(a)) {
        console.warn(`[${this.platform}] Attachment type '${a.type}' not supported, skipping`);
        return false;
      }

      if (a.size && a.size > this.capabilities.maxAttachmentSize) {
        console.warn(`[${this.platform}] Attachment '${a.name}' exceeds max size, skipping`);
        return false;
      }

      return true;
    });
  }

  // ============================================================================
  // Error Handling
  // ============================================================================

  /**
   * Create a failed SendResult
   */
  protected createFailedResult(error: unknown, retryAfter?: number): SendResult {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      retryAfter,
    };
  }

  /**
   * Create a successful SendResult
   */
  protected createSuccessResult(messageId?: string): SendResult {
    return {
      success: true,
      messageId,
    };
  }

  /**
   * Log error with platform context
   */
  protected logError(operation: string, error: unknown): void {
    console.error(`[${this.platform}] ${operation} failed:`, error);
  }

  /**
   * Log info with platform context
   */
  protected logInfo(message: string, ...args: unknown[]): void {
    console.log(`[${this.platform}] ${message}`, ...args);
  }

  /**
   * Log warning with platform context
   */
  protected logWarn(message: string, ...args: unknown[]): void {
    console.warn(`[${this.platform}] ${message}`, ...args);
  }
}

// ============================================================================
// Adapter Factory
// ============================================================================

/**
 * Factory function type for creating adapters
 */
export type AdapterFactory<T extends BaseAdapter = BaseAdapter> = (
  config: ChannelConfig
) => T;

/**
 * Adapter registration entry
 */
export interface AdapterRegistration<T extends BaseAdapter = BaseAdapter> {
  /** Adapter class */
  AdapterClass: new () => T;
  /** Factory function (optional) */
  factory?: AdapterFactory<T>;
}
