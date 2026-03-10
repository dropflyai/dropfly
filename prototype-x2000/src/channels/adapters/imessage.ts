/**
 * iMessage Channel Adapter
 *
 * Enables X2000 communication via iMessage using BlueBubbles API.
 * Requires a Mac server running BlueBubbles for message relay.
 *
 * Features:
 * - Text, images, and file attachments
 * - Reactions (tapbacks)
 * - Group chats
 * - Read receipts
 * - macOS-only detection with graceful fallback
 *
 * @see https://bluebubbles.app/
 */

import { v4 as uuidv4 } from 'uuid';
import {
  BaseChannel,
  ChannelRegistry,
  type ChannelConfig,
  type ChannelMessage,
  type ChannelResponse,
  type ChannelContext,
} from '../base.js';

// ============================================================================
// Types
// ============================================================================

export interface IMessageChannelConfig extends Partial<ChannelConfig> {
  /** BlueBubbles server URL (e.g., http://localhost:1234) */
  serverUrl?: string;
  /** BlueBubbles API password */
  password?: string;
  /** Webhook URL for receiving messages */
  webhookUrl?: string;
  /** Allow specific contacts (phone numbers or emails) */
  allowedContacts?: string[];
  /** Use private API for enhanced features (requires SIP disabled) */
  usePrivateApi?: boolean;
}

/** BlueBubbles message format */
interface BlueBubblesMessage {
  guid: string;
  text: string;
  handle: {
    id: string;
    address: string;
    service: string;
  };
  chats: Array<{
    guid: string;
    chatIdentifier: string;
    displayName?: string;
    participants: Array<{ address: string }>;
  }>;
  dateCreated: number;
  dateRead?: number;
  isFromMe: boolean;
  hasAttachments: boolean;
  attachments?: BlueBubblesAttachment[];
  associatedMessageGuid?: string;
  associatedMessageType?: number; // Tapback type
}

interface BlueBubblesAttachment {
  guid: string;
  uti: string;
  mimeType: string;
  transferName: string;
  totalBytes: number;
  filePath?: string;
}

/** BlueBubbles webhook event */
interface BlueBubblesWebhookEvent {
  type: 'new-message' | 'message-send-error' | 'updated-message' | 'typing-indicator';
  data: BlueBubblesMessage;
}

/** Tapback type mapping */
const TAPBACK_TYPES: Record<number, string> = {
  2000: 'love',       // Heart
  2001: 'like',       // Thumbs up
  2002: 'dislike',    // Thumbs down
  2003: 'laugh',      // Ha ha
  2004: 'emphasize',  // !!
  2005: 'question',   // ?
  // Remove tapback (3xxx)
  3000: 'remove-love',
  3001: 'remove-like',
  3002: 'remove-dislike',
  3003: 'remove-laugh',
  3004: 'remove-emphasize',
  3005: 'remove-question',
};

/** Emoji to tapback type */
const EMOJI_TO_TAPBACK: Record<string, number> = {
  '\u2764\uFE0F': 2000,  // Red heart
  '\u2764': 2000,        // Heart
  '\uD83D\uDC4D': 2001,  // Thumbs up
  '\uD83D\uDC4E': 2002,  // Thumbs down
  '\uD83D\uDE02': 2003,  // Laughing
  '\u203C\uFE0F': 2004,  // Double exclamation
  '\u2753': 2005,        // Question mark
};

// ============================================================================
// Platform Capabilities
// ============================================================================

export const IMESSAGE_CAPABILITIES = {
  supportsMarkdown: false,
  supportsHTML: false,
  supportsRichText: false,
  maxMessageLength: 20000,
  supportsThreads: false,
  supportsReplies: true,
  supportsFiles: true,
  supportsImages: true,
  supportsVoice: true,
  supportsVideo: true,
  supportsLocation: true,
  maxAttachmentSize: 100 * 1024 * 1024, // 100MB
  supportsReactions: true,              // Tapbacks
  supportsButtons: false,
  supportsCards: false,
  supportsTypingIndicator: true,
  supportsReadReceipts: true,
  supportsMessageEdit: true,            // macOS 13+
  supportsMessageDelete: true,          // Unsend
  supportsE2EEncryption: true,
  supportsDisappearingMessages: false,
};

// ============================================================================
// iMessage Channel
// ============================================================================

export class IMessageChannel extends BaseChannel {
  readonly type = 'imessage';
  readonly name = 'iMessage';
  readonly capabilities = IMESSAGE_CAPABILITIES;

  private serverUrl: string | null;
  private password: string | null;
  private webhookUrl: string | null;
  private allowedContacts: string[] | null;
  private usePrivateApi: boolean;
  private isMacOS: boolean;

  constructor(config: IMessageChannelConfig = {}) {
    super(config);

    this.serverUrl = config.serverUrl || process.env.BLUEBUBBLES_SERVER_URL || null;
    this.password = config.password || process.env.BLUEBUBBLES_PASSWORD || null;
    this.webhookUrl = config.webhookUrl || process.env.BLUEBUBBLES_WEBHOOK_URL || null;
    this.allowedContacts = config.allowedContacts || null;
    this.usePrivateApi = config.usePrivateApi ?? true;

    // Detect if running on macOS
    this.isMacOS = process.platform === 'darwin';
  }

  /**
   * Initialize iMessage connection via BlueBubbles
   */
  async initialize(): Promise<void> {
    // Check platform
    if (!this.isMacOS) {
      console.warn('[iMessage] Not running on macOS - channel will work via BlueBubbles server');
    }

    if (!this.serverUrl || !this.password) {
      console.warn('[iMessage] BlueBubbles server URL or password not configured, channel disabled');
      this.config.enabled = false;
      return;
    }

    try {
      // Test connection to BlueBubbles server
      const pingResult = await this.apiCall('GET', '/api/v1/ping');

      if (!pingResult.message || pingResult.message !== 'pong') {
        throw new Error('BlueBubbles server did not respond correctly');
      }

      console.log('[iMessage] Connected to BlueBubbles server');

      // Get server info
      const serverInfo = await this.apiCall('GET', '/api/v1/server/info');
      const serverData = serverInfo.data as { server_version?: string; os_version?: string; private_api?: boolean } | undefined;
      console.log(`[iMessage] Server version: ${serverData?.server_version || 'unknown'}`);
      console.log(`[iMessage] macOS version: ${serverData?.os_version || 'unknown'}`);
      console.log(`[iMessage] Private API: ${serverData?.private_api ? 'enabled' : 'disabled'}`);

      // Register webhook if URL provided
      if (this.webhookUrl) {
        await this.registerWebhook();
      }

      this.connected = true;
      console.log('[iMessage] Channel initialized successfully');

    } catch (error) {
      console.error('[iMessage] Failed to initialize:', error);
      this.connected = false;
      throw error;
    }
  }

  /**
   * Shutdown iMessage connection
   */
  async shutdown(): Promise<void> {
    if (this.webhookUrl) {
      try {
        await this.unregisterWebhook();
      } catch (error) {
        console.warn('[iMessage] Failed to unregister webhook:', error);
      }
    }

    this.connected = false;
    console.log('[iMessage] Disconnected');
  }

  /**
   * Send a message via iMessage
   */
  async send(
    channelId: string,
    response: ChannelResponse,
    context?: Partial<ChannelContext>
  ): Promise<void> {
    if (!this.connected || !this.serverUrl || !this.password) {
      throw new Error('iMessage channel not connected');
    }

    try {
      // Prepare message payload
      const payload: Record<string, unknown> = {
        chatGuid: channelId,
        message: response.content,
        method: this.usePrivateApi ? 'private-api' : 'apple-script',
      };

      // Handle reply context
      if (context?.metadata?.replyToGuid) {
        payload.selectedMessageGuid = context.metadata.replyToGuid;
      }

      // Send message
      const result = await this.apiCall('POST', '/api/v1/message/text', payload);

      if (result.status !== 200 && result.status !== 201) {
        throw new Error(result.message || 'Failed to send message');
      }

      console.log(`[iMessage] Sent message to ${channelId}`);

      // Handle attachments separately
      if (response.attachments && response.attachments.length > 0) {
        for (const attachment of response.attachments) {
          if (attachment.url || attachment.data) {
            await this.sendAttachment(channelId, attachment);
          }
        }
      }

    } catch (error) {
      console.error('[iMessage] Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Send an attachment
   */
  private async sendAttachment(
    chatGuid: string,
    attachment: NonNullable<ChannelResponse['attachments']>[number]
  ): Promise<void> {
    // For URL-based attachments, fetch and send
    if (attachment.url) {
      const response = await fetch(attachment.url);
      const buffer = Buffer.from(await response.arrayBuffer());

      await this.apiCall('POST', '/api/v1/message/attachment', {
        chatGuid,
        attachment: buffer.toString('base64'),
        name: attachment.name,
        method: this.usePrivateApi ? 'private-api' : 'apple-script',
      });
    }
  }

  /**
   * Handle incoming webhook event from BlueBubbles
   */
  async handleWebhook(event: BlueBubblesWebhookEvent): Promise<ChannelResponse | null> {
    if (event.type !== 'new-message') {
      console.log(`[iMessage] Ignoring event type: ${event.type}`);
      return null;
    }

    const message = event.data;

    // Ignore messages from self
    if (message.isFromMe) {
      return null;
    }

    // Check if it's a tapback/reaction
    if (message.associatedMessageGuid && message.associatedMessageType !== undefined) {
      await this.handleTapback(message);
      return null;
    }

    // Check contact allowlist
    const senderAddress = message.handle?.address;
    if (this.allowedContacts && senderAddress && !this.allowedContacts.includes(senderAddress)) {
      return null;
    }

    // Convert to channel message
    const channelMessage = this.toChannelMessage(message);

    return this.processMessage(channelMessage);
  }

  /**
   * Handle tapback reactions
   */
  private async handleTapback(message: BlueBubblesMessage): Promise<void> {
    const tapbackType = message.associatedMessageType;
    if (tapbackType === undefined) return;

    const tapbackName = TAPBACK_TYPES[tapbackType] || 'unknown';
    const isRemoval = tapbackType >= 3000;

    console.log(`[iMessage] ${isRemoval ? 'Removed' : 'Added'} tapback: ${tapbackName} on ${message.associatedMessageGuid}`);

    // Could emit an event for reaction handling
  }

  /**
   * Add a tapback reaction to a message
   */
  async addReaction(messageGuid: string, emoji: string): Promise<void> {
    if (!this.connected) {
      throw new Error('iMessage channel not connected');
    }

    const tapbackType = EMOJI_TO_TAPBACK[emoji] || 2001; // Default to thumbs up

    // Extract chat GUID from message GUID (format: chatGuid/messageGuid)
    const parts = messageGuid.split('/');
    const chatGuid = parts.length > 1 ? parts[0] : messageGuid;

    await this.apiCall('POST', '/api/v1/message/react', {
      chatGuid,
      selectedMessageGuid: messageGuid,
      reaction: tapbackType,
    });

    console.log(`[iMessage] Added reaction to ${messageGuid}`);
  }

  /**
   * Remove a tapback reaction
   */
  async removeReaction(messageGuid: string, emoji: string): Promise<void> {
    if (!this.connected) {
      throw new Error('iMessage channel not connected');
    }

    const baseTapbackType = EMOJI_TO_TAPBACK[emoji] || 2001;
    const removeTapbackType = baseTapbackType + 1000; // 2xxx -> 3xxx

    const parts = messageGuid.split('/');
    const chatGuid = parts.length > 1 ? parts[0] : messageGuid;

    await this.apiCall('POST', '/api/v1/message/react', {
      chatGuid,
      selectedMessageGuid: messageGuid,
      reaction: removeTapbackType,
    });

    console.log(`[iMessage] Removed reaction from ${messageGuid}`);
  }

  /**
   * Mark a message as read
   */
  async markAsRead(chatGuid: string): Promise<void> {
    if (!this.connected) return;

    await this.apiCall('POST', '/api/v1/chat/read', {
      chatGuid,
    });

    console.log(`[iMessage] Marked ${chatGuid} as read`);
  }

  /**
   * Send typing indicator
   */
  async sendTypingIndicator(chatGuid: string): Promise<void> {
    if (!this.connected || !this.usePrivateApi) {
      console.warn('[iMessage] Typing indicator requires private API');
      return;
    }

    await this.apiCall('POST', '/api/v1/chat/typing', {
      chatGuid,
    });
  }

  /**
   * Get chat info
   */
  async getChatInfo(chatGuid: string): Promise<{
    displayName: string;
    participants: string[];
    isGroup: boolean;
  } | null> {
    if (!this.connected) return null;

    try {
      const result = await this.apiCall('GET', `/api/v1/chat/${encodeURIComponent(chatGuid)}`);

      if (result.status !== 200 || !result.data) return null;

      const chat = result.data as {
        displayName?: string;
        chatIdentifier: string;
        participants: Array<{ address: string }>;
      };

      return {
        displayName: chat.displayName || chat.chatIdentifier,
        participants: chat.participants.map(p => p.address),
        isGroup: chat.participants.length > 1,
      };
    } catch {
      return null;
    }
  }

  /**
   * Get contact info
   */
  async getContactInfo(address: string): Promise<{
    firstName?: string;
    lastName?: string;
    displayName: string;
  } | null> {
    if (!this.connected) return null;

    try {
      const result = await this.apiCall('GET', `/api/v1/contact/${encodeURIComponent(address)}`);

      if (result.status !== 200 || !result.data) return null;

      const contact = result.data as {
        firstName?: string;
        lastName?: string;
        displayName?: string;
      };

      return {
        firstName: contact.firstName,
        lastName: contact.lastName,
        displayName: contact.displayName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || address,
      };
    } catch {
      return null;
    }
  }

  /**
   * Convert BlueBubbles message to channel message
   */
  private toChannelMessage(message: BlueBubblesMessage): ChannelMessage {
    const chat = message.chats?.[0];

    return {
      id: message.guid,
      channelType: this.type,
      channelId: chat?.guid || 'unknown',
      userId: message.handle?.address || 'unknown',
      content: message.text || '',
      timestamp: new Date(message.dateCreated),
      metadata: {
        chatIdentifier: chat?.chatIdentifier,
        displayName: chat?.displayName,
        isGroup: (chat?.participants?.length || 0) > 1,
        service: message.handle?.service,
        hasAttachments: message.hasAttachments,
      },
      attachments: message.attachments?.map(a => ({
        type: this.inferAttachmentType(a.mimeType),
        name: a.transferName,
        mimeType: a.mimeType,
        // URL would need to be constructed from BlueBubbles attachment endpoint
        url: this.serverUrl ? `${this.serverUrl}/api/v1/attachment/${encodeURIComponent(a.guid)}/download` : undefined,
      })),
    };
  }

  /**
   * Infer attachment type from MIME type
   */
  private inferAttachmentType(mimeType: string): 'file' | 'image' | 'url' {
    if (mimeType.startsWith('image/')) return 'image';
    return 'file';
  }

  /**
   * Register webhook with BlueBubbles
   */
  private async registerWebhook(): Promise<void> {
    if (!this.webhookUrl) return;

    await this.apiCall('POST', '/api/v1/server/webhooks', {
      url: this.webhookUrl,
      events: ['new-message', 'updated-message', 'typing-indicator', 'message-send-error'],
    });

    console.log(`[iMessage] Registered webhook: ${this.webhookUrl}`);
  }

  /**
   * Unregister webhook
   */
  private async unregisterWebhook(): Promise<void> {
    if (!this.webhookUrl) return;

    // BlueBubbles uses the URL as identifier
    await this.apiCall('DELETE', '/api/v1/server/webhooks', {
      url: this.webhookUrl,
    });

    console.log(`[iMessage] Unregistered webhook`);
  }

  /**
   * Make API call to BlueBubbles
   */
  private async apiCall(
    method: string,
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<Record<string, unknown> & { status?: number; message?: string; data?: unknown }> {
    if (!this.serverUrl || !this.password) {
      throw new Error('BlueBubbles server not configured');
    }

    const url = `${this.serverUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.password}`,
    };

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`BlueBubbles API error: ${response.status} ${errorText}`);
    }

    return response.json() as Promise<Record<string, unknown>>;
  }

  /**
   * Check if running on macOS
   */
  isRunningOnMac(): boolean {
    return this.isMacOS;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    latency: number;
    serverVersion?: string;
    errors?: string[];
  }> {
    const start = Date.now();

    try {
      const result = await this.apiCall('GET', '/api/v1/server/info');
      const serverInfo = result.data as { server_version?: string } | undefined;

      return {
        healthy: true,
        latency: Date.now() - start,
        serverVersion: serverInfo?.server_version,
      };
    } catch (error) {
      return {
        healthy: false,
        latency: Date.now() - start,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }
}

// ============================================================================
// Exports
// ============================================================================

export const imessageChannel = new IMessageChannel();

// Register with channel registry (only if configured)
if (process.env.BLUEBUBBLES_SERVER_URL && process.env.BLUEBUBBLES_PASSWORD) {
  ChannelRegistry.register(imessageChannel);
}

export function createIMessageChannel(config?: IMessageChannelConfig): IMessageChannel {
  return new IMessageChannel(config);
}
