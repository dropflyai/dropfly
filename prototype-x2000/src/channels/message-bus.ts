/**
 * X2000 Channel System - Message Bus
 *
 * Central message routing system with inbound, outbound, and event buses.
 * Provides message queuing, retry logic, and event distribution.
 */

import { randomUUID } from 'crypto';
import type {
  PlatformType,
  UnifiedMessage,
  UnifiedResponse,
  UnifiedRecipient,
  MessageBusEvent,
  MessageBusEventType,
  MessageBusListener,
  SendResult,
  ChannelAdapter,
} from './types.js';
import { rateLimitManager } from './rate-limiter.js';

// ============================================================================
// Message Queue
// ============================================================================

/**
 * Message queue entry
 */
interface QueueEntry<T> {
  id: string;
  data: T;
  platform: PlatformType;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  nextAttempt: Date;
  priority: number;
  metadata?: Record<string, unknown>;
}

/**
 * Priority queue implementation
 */
class PriorityQueue<T> {
  private items: QueueEntry<T>[] = [];

  /**
   * Add item to queue
   */
  enqueue(entry: QueueEntry<T>): void {
    // Insert in priority order (higher priority first)
    const index = this.items.findIndex(
      (item) => item.priority < entry.priority ||
        (item.priority === entry.priority && item.createdAt > entry.createdAt)
    );

    if (index === -1) {
      this.items.push(entry);
    } else {
      this.items.splice(index, 0, entry);
    }
  }

  /**
   * Get next item ready for processing
   */
  dequeue(): QueueEntry<T> | undefined {
    const now = new Date();
    const index = this.items.findIndex((item) => item.nextAttempt <= now);

    if (index === -1) {
      return undefined;
    }

    return this.items.splice(index, 1)[0];
  }

  /**
   * Peek at next item without removing
   */
  peek(): QueueEntry<T> | undefined {
    const now = new Date();
    return this.items.find((item) => item.nextAttempt <= now);
  }

  /**
   * Get queue size
   */
  get size(): number {
    return this.items.length;
  }

  /**
   * Get number of items ready now
   */
  get readyCount(): number {
    const now = new Date();
    return this.items.filter((item) => item.nextAttempt <= now).length;
  }

  /**
   * Clear queue
   */
  clear(): void {
    this.items = [];
  }

  /**
   * Get all items (for debugging)
   */
  getAll(): QueueEntry<T>[] {
    return [...this.items];
  }
}

// ============================================================================
// Outbound Message
// ============================================================================

/**
 * Outbound message data
 */
interface OutboundMessage {
  message: UnifiedResponse;
  recipient: UnifiedRecipient;
  platform: PlatformType;
}

// ============================================================================
// Message Bus
// ============================================================================

/**
 * Central message bus for X2000 channel system
 */
export class MessageBus {
  // Event listeners
  private listeners: Map<MessageBusEventType, Set<MessageBusListener>> = new Map();
  private globalListeners: Set<MessageBusListener> = new Set();

  // Message queues
  private outboundQueue: PriorityQueue<OutboundMessage> = new PriorityQueue();
  private retryQueue: PriorityQueue<OutboundMessage> = new PriorityQueue();

  // Adapters
  private adapters: Map<PlatformType, ChannelAdapter> = new Map();

  // Processing state
  private processing: boolean = false;
  private processInterval: NodeJS.Timeout | null = null;
  private processIntervalMs: number = 100; // Process every 100ms

  // Configuration
  private maxRetries: number = 3;
  private baseRetryDelay: number = 1000; // 1 second

  // Singleton instance
  private static instance: MessageBus;

  /**
   * Get singleton instance
   */
  static getInstance(): MessageBus {
    if (!MessageBus.instance) {
      MessageBus.instance = new MessageBus();
    }
    return MessageBus.instance;
  }

  // ============================================================================
  // Adapter Management
  // ============================================================================

  /**
   * Register a channel adapter
   */
  registerAdapter(adapter: ChannelAdapter): void {
    this.adapters.set(adapter.platform, adapter);
    console.log(`[MessageBus] Registered adapter: ${adapter.platform}`);
  }

  /**
   * Unregister a channel adapter
   */
  unregisterAdapter(platform: PlatformType): void {
    this.adapters.delete(platform);
    console.log(`[MessageBus] Unregistered adapter: ${platform}`);
  }

  /**
   * Get registered adapter
   */
  getAdapter(platform: PlatformType): ChannelAdapter | undefined {
    return this.adapters.get(platform);
  }

  // ============================================================================
  // Inbound Messages
  // ============================================================================

  /**
   * Publish an inbound message
   * Called by adapters when they receive messages
   */
  async publishInbound(message: UnifiedMessage): Promise<void> {
    const event: MessageBusEvent<UnifiedMessage> = {
      id: randomUUID(),
      type: 'message:inbound',
      platform: message.platform,
      timestamp: new Date(),
      data: message,
    };

    await this.emit(event);
  }

  /**
   * Subscribe to inbound messages
   */
  onInbound(listener: MessageBusListener<UnifiedMessage>): () => void {
    return this.on('message:inbound', listener as MessageBusListener);
  }

  // ============================================================================
  // Outbound Messages
  // ============================================================================

  /**
   * Queue an outbound message for sending
   */
  async sendMessage(
    platform: PlatformType,
    message: UnifiedResponse,
    recipient: UnifiedRecipient,
    options: {
      priority?: number;
      maxAttempts?: number;
      metadata?: Record<string, unknown>;
    } = {}
  ): Promise<string> {
    const entry: QueueEntry<OutboundMessage> = {
      id: randomUUID(),
      data: { message, recipient, platform },
      platform,
      attempts: 0,
      maxAttempts: options.maxAttempts || this.maxRetries,
      createdAt: new Date(),
      nextAttempt: new Date(),
      priority: options.priority || 5,
      metadata: options.metadata,
    };

    this.outboundQueue.enqueue(entry);

    // Emit queued event
    await this.emit({
      id: randomUUID(),
      type: 'message:outbound',
      platform,
      timestamp: new Date(),
      data: { messageId: entry.id, recipient, priority: entry.priority },
    });

    return entry.id;
  }

  /**
   * Send message immediately (bypassing queue)
   */
  async sendImmediate(
    platform: PlatformType,
    message: UnifiedResponse,
    recipient: UnifiedRecipient
  ): Promise<SendResult> {
    const adapter = this.adapters.get(platform);
    if (!adapter) {
      return { success: false, error: `No adapter for platform: ${platform}` };
    }

    // Check rate limit
    if (!rateLimitManager.acquire(platform)) {
      const waitTime = rateLimitManager.getWaitTime(platform);
      return {
        success: false,
        error: 'Rate limited',
        retryAfter: Math.ceil(waitTime / 1000),
      };
    }

    try {
      const result = await adapter.sendMessage(message, recipient);

      if (result.success) {
        rateLimitManager.resetBackoff(platform);
        await this.emit({
          id: randomUUID(),
          type: 'message:sent',
          platform,
          timestamp: new Date(),
          data: { messageId: result.messageId, recipient },
        });
      } else {
        await this.emit({
          id: randomUUID(),
          type: 'message:failed',
          platform,
          timestamp: new Date(),
          data: { error: result.error, recipient },
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.emit({
        id: randomUUID(),
        type: 'message:failed',
        platform,
        timestamp: new Date(),
        data: { error: errorMessage, recipient },
      });

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Subscribe to sent messages
   */
  onSent(listener: MessageBusListener): () => void {
    return this.on('message:sent', listener);
  }

  /**
   * Subscribe to failed messages
   */
  onFailed(listener: MessageBusListener): () => void {
    return this.on('message:failed', listener);
  }

  // ============================================================================
  // Event Bus
  // ============================================================================

  /**
   * Subscribe to specific event type
   */
  on<T = unknown>(
    eventType: MessageBusEventType,
    listener: MessageBusListener<T>
  ): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType)!.add(listener as MessageBusListener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(listener as MessageBusListener);
    };
  }

  /**
   * Subscribe to all events
   */
  onAll(listener: MessageBusListener): () => void {
    this.globalListeners.add(listener);

    return () => {
      this.globalListeners.delete(listener);
    };
  }

  /**
   * Emit an event
   */
  async emit<T = unknown>(event: MessageBusEvent<T>): Promise<void> {
    // Notify type-specific listeners
    const typeListeners = this.listeners.get(event.type);
    if (typeListeners) {
      for (const listener of typeListeners) {
        try {
          await listener(event as MessageBusEvent<unknown>);
        } catch (error) {
          console.error(`[MessageBus] Listener error for ${event.type}:`, error);
        }
      }
    }

    // Notify global listeners
    for (const listener of this.globalListeners) {
      try {
        await listener(event as MessageBusEvent<unknown>);
      } catch (error) {
        console.error(`[MessageBus] Global listener error:`, error);
      }
    }
  }

  /**
   * Emit channel health event
   */
  async emitHealth(platform: PlatformType, status: string, score: number): Promise<void> {
    await this.emit({
      id: randomUUID(),
      type: 'channel:health',
      platform,
      timestamp: new Date(),
      data: { status, score },
    });
  }

  /**
   * Emit channel connected event
   */
  async emitConnected(platform: PlatformType): Promise<void> {
    await this.emit({
      id: randomUUID(),
      type: 'channel:connected',
      platform,
      timestamp: new Date(),
      data: {},
    });
  }

  /**
   * Emit channel disconnected event
   */
  async emitDisconnected(platform: PlatformType, reason?: string): Promise<void> {
    await this.emit({
      id: randomUUID(),
      type: 'channel:disconnected',
      platform,
      timestamp: new Date(),
      data: { reason },
    });
  }

  /**
   * Emit channel error event
   */
  async emitError(platform: PlatformType, error: string): Promise<void> {
    await this.emit({
      id: randomUUID(),
      type: 'channel:error',
      platform,
      timestamp: new Date(),
      data: { error },
    });
  }

  // ============================================================================
  // Queue Processing
  // ============================================================================

  /**
   * Start processing message queues
   */
  start(): void {
    if (this.processing) {
      return;
    }

    this.processing = true;
    this.processInterval = setInterval(() => {
      this.processQueues().catch((error) => {
        console.error('[MessageBus] Queue processing error:', error);
      });
    }, this.processIntervalMs);

    console.log('[MessageBus] Started message processing');
  }

  /**
   * Stop processing message queues
   */
  stop(): void {
    this.processing = false;

    if (this.processInterval) {
      clearInterval(this.processInterval);
      this.processInterval = null;
    }

    console.log('[MessageBus] Stopped message processing');
  }

  /**
   * Process message queues
   */
  private async processQueues(): Promise<void> {
    // Process outbound queue
    await this.processOutbound();

    // Process retry queue
    await this.processRetries();
  }

  /**
   * Process outbound message queue
   */
  private async processOutbound(): Promise<void> {
    const entry = this.outboundQueue.dequeue();
    if (!entry) {
      return;
    }

    const { platform, message, recipient } = entry.data;

    // Check rate limit
    if (!rateLimitManager.acquire(platform)) {
      // Re-queue with delay
      entry.nextAttempt = new Date(Date.now() + rateLimitManager.getWaitTime(platform));
      this.outboundQueue.enqueue(entry);
      return;
    }

    const adapter = this.adapters.get(platform);
    if (!adapter) {
      console.error(`[MessageBus] No adapter for platform: ${platform}`);
      await this.emit({
        id: randomUUID(),
        type: 'message:failed',
        platform,
        timestamp: new Date(),
        data: { error: 'No adapter', messageId: entry.id },
      });
      return;
    }

    try {
      entry.attempts++;
      const result = await adapter.sendMessage(message, recipient);

      if (result.success) {
        rateLimitManager.resetBackoff(platform);
        await this.emit({
          id: randomUUID(),
          type: 'message:sent',
          platform,
          timestamp: new Date(),
          data: { messageId: result.messageId, queueId: entry.id },
        });
      } else {
        // Check if should retry
        if (entry.attempts < entry.maxAttempts) {
          this.scheduleRetry(entry, result.retryAfter);
        } else {
          await this.emit({
            id: randomUUID(),
            type: 'message:failed',
            platform,
            timestamp: new Date(),
            data: {
              error: result.error,
              queueId: entry.id,
              attempts: entry.attempts,
            },
          });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Check if should retry
      if (entry.attempts < entry.maxAttempts) {
        this.scheduleRetry(entry);
      } else {
        await this.emit({
          id: randomUUID(),
          type: 'message:failed',
          platform,
          timestamp: new Date(),
          data: {
            error: errorMessage,
            queueId: entry.id,
            attempts: entry.attempts,
          },
        });
      }
    }
  }

  /**
   * Schedule a message for retry
   */
  private scheduleRetry(
    entry: QueueEntry<OutboundMessage>,
    retryAfterSeconds?: number
  ): void {
    // Calculate exponential backoff with jitter
    const baseDelay = retryAfterSeconds
      ? retryAfterSeconds * 1000
      : this.baseRetryDelay;
    const exponentialDelay = baseDelay * Math.pow(2, entry.attempts - 1);
    const jitter = Math.random() * 0.2 * exponentialDelay;
    const delay = Math.min(exponentialDelay + jitter, 60000); // Max 60s

    entry.nextAttempt = new Date(Date.now() + delay);
    this.retryQueue.enqueue(entry);

    console.log(
      `[MessageBus] Scheduled retry for ${entry.platform} in ${Math.round(delay)}ms (attempt ${entry.attempts + 1})`
    );
  }

  /**
   * Process retry queue
   */
  private async processRetries(): Promise<void> {
    const entry = this.retryQueue.dequeue();
    if (!entry) {
      return;
    }

    // Move to outbound queue for processing
    this.outboundQueue.enqueue(entry);
  }

  // ============================================================================
  // Status & Metrics
  // ============================================================================

  /**
   * Get queue status
   */
  getQueueStatus(): {
    outbound: { size: number; ready: number };
    retry: { size: number; ready: number };
    processing: boolean;
  } {
    return {
      outbound: {
        size: this.outboundQueue.size,
        ready: this.outboundQueue.readyCount,
      },
      retry: {
        size: this.retryQueue.size,
        ready: this.retryQueue.readyCount,
      },
      processing: this.processing,
    };
  }

  /**
   * Get registered adapters
   */
  getRegisteredAdapters(): PlatformType[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Get listener counts
   */
  getListenerCounts(): Record<string, number> {
    const counts: Record<string, number> = {
      global: this.globalListeners.size,
    };

    for (const [type, listeners] of this.listeners) {
      counts[type] = listeners.size;
    }

    return counts;
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  /**
   * Clear all state (for testing)
   */
  clear(): void {
    this.stop();
    this.outboundQueue.clear();
    this.retryQueue.clear();
    this.listeners.clear();
    this.globalListeners.clear();
    this.adapters.clear();
  }
}

// ============================================================================
// Exports
// ============================================================================

/**
 * Singleton message bus instance
 */
export const messageBus = MessageBus.getInstance();

/**
 * Start the message bus
 */
export function startMessageBus(): void {
  messageBus.start();
}

/**
 * Stop the message bus
 */
export function stopMessageBus(): void {
  messageBus.stop();
}

/**
 * Convenience function to send a message
 */
export async function sendMessage(
  platform: PlatformType,
  message: UnifiedResponse,
  recipient: UnifiedRecipient
): Promise<string> {
  return messageBus.sendMessage(platform, message, recipient);
}

/**
 * Convenience function to send a message immediately
 */
export async function sendImmediate(
  platform: PlatformType,
  message: UnifiedResponse,
  recipient: UnifiedRecipient
): Promise<SendResult> {
  return messageBus.sendImmediate(platform, message, recipient);
}
