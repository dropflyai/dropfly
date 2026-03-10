/**
 * Channel Base System
 *
 * Provides the foundation for multi-channel communication.
 * Channels are how X2000 communicates with the outside world.
 */

import { v4 as uuidv4 } from 'uuid';
import type { BrainType } from '../types/index.js';

// ============================================================================
// Types
// ============================================================================

export interface ChannelMessage {
  id: string;
  channelType: string;
  channelId: string;
  userId: string;
  content: string;
  timestamp: Date;
  metadata: Record<string, unknown>;

  // Thread/conversation tracking
  threadId?: string;
  replyToId?: string;

  // Attachments
  attachments?: Array<{
    type: 'file' | 'image' | 'url';
    name: string;
    url?: string;
    data?: string;
    mimeType?: string;
  }>;
}

export interface ChannelResponse {
  content: string;
  attachments?: Array<{
    type: 'file' | 'image' | 'url';
    name: string;
    url?: string;
    data?: string;
    mimeType?: string;
  }>;
  metadata?: Record<string, unknown>;
}

export interface ChannelConfig {
  id: string;
  type: string;
  name: string;
  enabled: boolean;
  settings: Record<string, unknown>;
  defaultBrain: BrainType;
  trustLevel: number;
}

export interface ChannelContext {
  userId: string;
  channelId: string;
  threadId?: string;
  brainType: BrainType;
  trustLevel: number;
  sessionId: string;
  metadata: Record<string, unknown>;
}

export type MessageHandler = (
  message: ChannelMessage,
  context: ChannelContext
) => Promise<ChannelResponse>;

// ============================================================================
// Base Channel Class
// ============================================================================

export abstract class BaseChannel {
  abstract readonly type: string;
  abstract readonly name: string;

  protected config: ChannelConfig;
  protected messageHandler?: MessageHandler;
  protected connected: boolean = false;

  constructor(config: Partial<ChannelConfig>) {
    this.config = {
      id: uuidv4(),
      type: config.type || 'unknown',
      name: config.name || 'Unknown Channel',
      enabled: config.enabled ?? true,
      settings: config.settings || {},
      defaultBrain: config.defaultBrain || 'engineering',
      trustLevel: config.trustLevel ?? 2,
    };
  }

  /**
   * Called after constructor to set type/name from abstract properties
   */
  protected initializeConfig(): void {
    this.config.type = this.type;
    this.config.name = this.config.name === 'Unknown Channel' ? this.name : this.config.name;
  }

  /**
   * Initialize the channel (connect to service, start listening, etc.)
   */
  abstract initialize(): Promise<void>;

  /**
   * Shutdown the channel
   */
  abstract shutdown(): Promise<void>;

  /**
   * Send a message through the channel
   */
  abstract send(
    channelId: string,
    response: ChannelResponse,
    context?: Partial<ChannelContext>
  ): Promise<void>;

  /**
   * Set the message handler
   */
  setMessageHandler(handler: MessageHandler): void {
    this.messageHandler = handler;
  }

  /**
   * Process an incoming message
   */
  protected async processMessage(
    message: ChannelMessage
  ): Promise<ChannelResponse | null> {
    if (!this.messageHandler) {
      console.warn(`[${this.type}] No message handler configured`);
      return null;
    }

    const context: ChannelContext = {
      userId: message.userId,
      channelId: message.channelId,
      threadId: message.threadId,
      brainType: this.config.defaultBrain,
      trustLevel: this.config.trustLevel,
      sessionId: `${this.type}-${message.channelId}-${message.userId}`,
      metadata: message.metadata,
    };

    try {
      return await this.messageHandler(message, context);
    } catch (error) {
      console.error(`[${this.type}] Error processing message:`, error);
      return {
        content: 'An error occurred while processing your message.',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  /**
   * Get channel status
   */
  getStatus(): {
    type: string;
    name: string;
    connected: boolean;
    enabled: boolean;
  } {
    return {
      type: this.type,
      name: this.config.name,
      connected: this.connected,
      enabled: this.config.enabled,
    };
  }

  /**
   * Update channel configuration
   */
  updateConfig(updates: Partial<ChannelConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

// ============================================================================
// Channel Registry
// ============================================================================

class ChannelRegistryClass {
  private channels: Map<string, BaseChannel> = new Map();
  private messageHandler?: MessageHandler;

  /**
   * Register a channel
   */
  register(channel: BaseChannel): void {
    if (this.messageHandler) {
      channel.setMessageHandler(this.messageHandler);
    }
    this.channels.set(channel.type, channel);
    console.log(`[ChannelRegistry] Registered channel: ${channel.type}`);
  }

  /**
   * Get a channel by type
   */
  get(type: string): BaseChannel | undefined {
    return this.channels.get(type);
  }

  /**
   * Get all channels
   */
  getAll(): BaseChannel[] {
    return Array.from(this.channels.values());
  }

  /**
   * Set the global message handler for all channels
   */
  setMessageHandler(handler: MessageHandler): void {
    this.messageHandler = handler;
    for (const channel of this.channels.values()) {
      channel.setMessageHandler(handler);
    }
  }

  /**
   * Initialize all enabled channels
   */
  async initializeAll(): Promise<void> {
    const enabled = this.getAll().filter(c => c.getStatus().enabled);

    for (const channel of enabled) {
      try {
        await channel.initialize();
        console.log(`[ChannelRegistry] Initialized: ${channel.type}`);
      } catch (error) {
        console.error(`[ChannelRegistry] Failed to initialize ${channel.type}:`, error);
      }
    }
  }

  /**
   * Shutdown all channels
   */
  async shutdownAll(): Promise<void> {
    for (const channel of this.channels.values()) {
      try {
        await channel.shutdown();
        console.log(`[ChannelRegistry] Shutdown: ${channel.type}`);
      } catch (error) {
        console.error(`[ChannelRegistry] Failed to shutdown ${channel.type}:`, error);
      }
    }
  }

  /**
   * Get status of all channels
   */
  getStatus(): Array<{
    type: string;
    name: string;
    connected: boolean;
    enabled: boolean;
  }> {
    return this.getAll().map(c => c.getStatus());
  }
}

export const ChannelRegistry = new ChannelRegistryClass();
