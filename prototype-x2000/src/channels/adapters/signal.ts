/**
 * Signal Channel Adapter
 *
 * Enables X2000 communication via Signal using signal-cli.
 *
 * Features:
 * - Text and attachment support
 * - Reactions
 * - Disappearing messages support
 * - Group messaging
 * - End-to-end encryption handling (via signal-cli)
 *
 * Requirements:
 * - signal-cli daemon running with JSON-RPC interface
 * - Registered and verified phone number with Signal
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

export interface SignalChannelConfig extends Partial<ChannelConfig> {
  signalCliUrl?: string;
  phoneNumber?: string;
  allowedNumbers?: string[];
  allowedGroups?: string[];
}

/**
 * Signal message envelope from signal-cli
 */
interface SignalEnvelope {
  source: string;
  sourceNumber?: string;
  sourceUuid?: string;
  sourceName?: string;
  sourceDevice?: number;
  timestamp: number;
  dataMessage?: SignalDataMessage;
  syncMessage?: SignalSyncMessage;
  typingMessage?: SignalTypingMessage;
  receiptMessage?: SignalReceiptMessage;
  callMessage?: SignalCallMessage;
}

interface SignalDataMessage {
  timestamp: number;
  message?: string;
  expiresInSeconds?: number;
  viewOnce?: boolean;
  reaction?: SignalReaction;
  quote?: SignalQuote;
  attachments?: SignalAttachment[];
  mentions?: SignalMention[];
  groupInfo?: SignalGroupInfo;
}

interface SignalSyncMessage {
  sentMessage?: {
    destination?: string;
    destinationNumber?: string;
    destinationUuid?: string;
    timestamp: number;
    message?: string;
    expiresInSeconds?: number;
    attachments?: SignalAttachment[];
    groupInfo?: SignalGroupInfo;
  };
  readMessages?: Array<{
    sender: string;
    timestamp: number;
  }>;
}

interface SignalTypingMessage {
  action: 'STARTED' | 'STOPPED';
  timestamp: number;
  groupId?: string;
}

interface SignalReceiptMessage {
  when: number;
  isDelivery: boolean;
  isRead: boolean;
  isViewed: boolean;
  timestamps: number[];
}

interface SignalCallMessage {
  offerMessage?: Record<string, unknown>;
  answerMessage?: Record<string, unknown>;
  busyMessage?: Record<string, unknown>;
  hangupMessage?: Record<string, unknown>;
}

interface SignalReaction {
  emoji: string;
  targetAuthor: string;
  targetAuthorNumber?: string;
  targetAuthorUuid?: string;
  targetTimestamp: number;
  isRemove?: boolean;
}

interface SignalQuote {
  id: number;
  author: string;
  authorNumber?: string;
  authorUuid?: string;
  text?: string;
  attachments?: SignalAttachment[];
}

interface SignalAttachment {
  contentType: string;
  filename?: string;
  id: string;
  size?: number;
  width?: number;
  height?: number;
  caption?: string;
  uploadTimestamp?: number;
}

interface SignalMention {
  start: number;
  length: number;
  uuid: string;
}

interface SignalGroupInfo {
  groupId: string;
  type?: 'DELIVER' | 'UPDATE' | 'QUIT' | 'REQUEST_INFO';
}

/**
 * Signal send result
 */
interface SignalSendResult {
  timestamp: number;
  results: Array<{
    recipientAddress: {
      uuid?: string;
      number?: string;
    };
    type: 'SUCCESS' | 'NETWORK_FAILURE' | 'UNREGISTERED_FAILURE' | 'IDENTITY_FAILURE';
  }>;
}

/**
 * Platform capabilities for Signal
 */
export const SIGNAL_CAPABILITIES = {
  supportsMarkdown: false,
  supportsHTML: false,
  supportsRichText: false,
  maxMessageLength: 8000,
  supportsThreads: false,
  supportsReplies: true,
  supportsFiles: true,
  supportsImages: true,
  supportsVoice: true,
  supportsVideo: true,
  supportsLocation: true,
  maxAttachmentSize: 100 * 1024 * 1024, // 100MB
  supportsReactions: true,
  supportsButtons: false,
  supportsCards: false,
  supportsTypingIndicator: true,
  supportsReadReceipts: true,
  supportsMessageEdit: false,
  supportsMessageDelete: true,
  supportsE2EEncryption: true,
  supportsDisappearingMessages: true,
};

// ============================================================================
// Signal Channel
// ============================================================================

export class SignalChannel extends BaseChannel {
  readonly type = 'signal';
  readonly name = 'Signal';
  readonly capabilities = SIGNAL_CAPABILITIES;

  private signalCliUrl: string;
  private phoneNumber: string | null;
  private allowedNumbers: string[] | null;
  private allowedGroups: string[] | null;
  private eventSource: EventSource | null = null;

  constructor(config: SignalChannelConfig = {}) {
    super(config);
    this.initializeConfig();

    this.signalCliUrl = config.signalCliUrl || process.env.SIGNAL_CLI_URL || 'http://localhost:8080';
    this.phoneNumber = config.phoneNumber || process.env.SIGNAL_PHONE_NUMBER || null;
    this.allowedNumbers = config.allowedNumbers || null;
    this.allowedGroups = config.allowedGroups || null;
  }

  /**
   * Initialize Signal connection
   */
  async initialize(): Promise<void> {
    if (!this.phoneNumber) {
      console.warn('[Signal] No phone number configured, channel disabled');
      this.config.enabled = false;
      return;
    }

    try {
      // Verify signal-cli is running and phone is registered
      const accounts = await this.signalAPI<string[]>('GET', '/v1/accounts');

      if (!accounts.includes(this.phoneNumber)) {
        throw new Error(`Phone number ${this.phoneNumber} not registered with signal-cli`);
      }

      this.connected = true;
      console.log(`[Signal] Connected as ${this.phoneNumber}`);

      // Start receiving messages via SSE
      this.startReceiving();
    } catch (error) {
      console.error('[Signal] Failed to initialize:', error);
      this.connected = false;
      throw error;
    }
  }

  /**
   * Start receiving messages via Server-Sent Events
   */
  private startReceiving(): void {
    const sseUrl = `${this.signalCliUrl}/v1/receive/${this.phoneNumber}`;

    console.log(`[Signal] Connecting to SSE endpoint: ${sseUrl}`);

    // Note: EventSource is a browser API. In Node.js, use 'eventsource' package
    // For now, we'll use a polling fallback
    this.startPolling();
  }

  /**
   * Polling fallback for receiving messages
   */
  private startPolling(): void {
    const poll = async () => {
      if (!this.connected) return;

      try {
        const messages = await this.signalAPI<SignalEnvelope[]>(
          'GET',
          `/v1/receive/${this.phoneNumber}`
        );

        for (const envelope of messages) {
          await this.handleEnvelope(envelope);
        }
      } catch (error) {
        // Timeout or no messages is normal
        if (!(error instanceof Error && error.message.includes('timeout'))) {
          console.error('[Signal] Polling error:', error);
        }
      }

      // Schedule next poll
      if (this.connected) {
        setTimeout(poll, 1000);
      }
    };

    poll();
  }

  /**
   * Handle incoming Signal envelope
   */
  async handleEnvelope(envelope: SignalEnvelope): Promise<ChannelResponse | null> {
    // Handle data messages (regular messages)
    if (envelope.dataMessage) {
      return this.handleDataMessage(envelope, envelope.dataMessage);
    }

    // Handle sync messages (sent from another device)
    if (envelope.syncMessage?.sentMessage) {
      const sent = envelope.syncMessage.sentMessage;
      // Process as if we received the message we sent
      console.log(`[Signal] Sync message to ${sent.destinationNumber || sent.destination}`);
    }

    // Handle typing indicators
    if (envelope.typingMessage) {
      console.log(`[Signal] ${envelope.source} is ${envelope.typingMessage.action === 'STARTED' ? 'typing' : 'not typing'}`);
    }

    // Handle receipts
    if (envelope.receiptMessage) {
      const receipt = envelope.receiptMessage;
      if (receipt.isDelivery) {
        console.log(`[Signal] Messages delivered to ${envelope.source}`);
      }
      if (receipt.isRead) {
        console.log(`[Signal] Messages read by ${envelope.source}`);
      }
    }

    return null;
  }

  /**
   * Handle incoming data message
   */
  private async handleDataMessage(
    envelope: SignalEnvelope,
    dataMessage: SignalDataMessage
  ): Promise<ChannelResponse | null> {
    // Check number allowlist
    if (this.allowedNumbers && envelope.sourceNumber && !this.allowedNumbers.includes(envelope.sourceNumber)) {
      return null;
    }

    // Check group allowlist
    if (dataMessage.groupInfo && this.allowedGroups) {
      if (!this.allowedGroups.includes(dataMessage.groupInfo.groupId)) {
        return null;
      }
    }

    // Handle reactions
    if (dataMessage.reaction) {
      console.log(`[Signal] Reaction ${dataMessage.reaction.emoji} from ${envelope.source} on message ${dataMessage.reaction.targetTimestamp}`);
      // Could create a reaction message if needed
      return null;
    }

    // Build attachments
    const attachments: ChannelMessage['attachments'] = [];
    if (dataMessage.attachments) {
      for (const att of dataMessage.attachments) {
        attachments.push({
          type: this.inferAttachmentType(att.contentType),
          name: att.filename || 'attachment',
          url: await this.getAttachmentUrl(att.id),
          mimeType: att.contentType,
        });
      }
    }

    // Create channel message
    const channelMessage: ChannelMessage = {
      id: dataMessage.timestamp.toString(),
      channelType: this.type,
      channelId: dataMessage.groupInfo?.groupId || envelope.source,
      userId: envelope.source,
      content: dataMessage.message || '',
      timestamp: new Date(dataMessage.timestamp),
      replyToId: dataMessage.quote?.id.toString(),
      metadata: {
        sourceNumber: envelope.sourceNumber,
        sourceUuid: envelope.sourceUuid,
        sourceName: envelope.sourceName,
        sourceDevice: envelope.sourceDevice,
        expiresInSeconds: dataMessage.expiresInSeconds,
        viewOnce: dataMessage.viewOnce,
        isGroup: !!dataMessage.groupInfo,
        groupId: dataMessage.groupInfo?.groupId,
        quote: dataMessage.quote,
        mentions: dataMessage.mentions,
      },
      attachments,
    };

    return this.processMessage(channelMessage);
  }

  /**
   * Shutdown Signal connection
   */
  async shutdown(): Promise<void> {
    this.connected = false;

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    console.log('[Signal] Disconnected');
  }

  /**
   * Send a message via Signal
   */
  async send(
    channelId: string,
    response: ChannelResponse,
    context?: Partial<ChannelContext>
  ): Promise<void> {
    if (!this.connected || !this.phoneNumber) {
      throw new Error('Signal channel not connected');
    }

    // Determine if this is a group or individual message
    const isGroup = Boolean(context?.metadata?.isGroup) || channelId.length > 20;

    const payload: Record<string, unknown> = {
      message: this.formatMessage(response.content),
      number: this.phoneNumber,
    };

    // Set recipient
    if (isGroup) {
      payload.recipients = [];
      payload.group_id = channelId;
    } else {
      payload.recipients = [channelId];
    }

    // Add quote for reply
    if (context?.metadata?.messageId) {
      payload.quote_timestamp = parseInt(context.metadata.messageId as string, 10);
      payload.quote_author = context.userId;
    }

    // Send message
    const endpoint = isGroup ? `/v2/send` : `/v2/send`;
    const result = await this.signalAPI<SignalSendResult>('POST', endpoint, payload);

    // Check for failures
    const failures = result.results?.filter(r => r.type !== 'SUCCESS');
    if (failures && failures.length > 0) {
      console.warn(`[Signal] Some recipients failed:`, failures);
    }

    console.log(`[Signal] Sent message to ${channelId} (timestamp: ${result.timestamp})`);

    // Send attachments
    if (response.attachments && response.attachments.length > 0) {
      for (const attachment of response.attachments) {
        await this.sendAttachment(channelId, attachment, isGroup);
      }
    }
  }

  /**
   * Send an attachment
   */
  private async sendAttachment(
    recipient: string,
    attachment: NonNullable<ChannelResponse['attachments']>[number],
    isGroup: boolean
  ): Promise<void> {
    const payload: Record<string, unknown> = {
      message: attachment.name || '',
      number: this.phoneNumber,
      attachments: [attachment.url || attachment.data],
    };

    if (isGroup) {
      payload.group_id = recipient;
    } else {
      payload.recipients = [recipient];
    }

    await this.signalAPI<SignalSendResult>('POST', '/v2/send', payload);
    console.log(`[Signal] Sent attachment to ${recipient}`);
  }

  /**
   * Send a reaction to a message
   */
  async sendReaction(
    recipient: string,
    emoji: string,
    targetTimestamp: number,
    targetAuthor: string,
    isGroup: boolean = false
  ): Promise<void> {
    const payload: Record<string, unknown> = {
      reaction: {
        emoji,
        target_author: targetAuthor,
        target_timestamp: targetTimestamp,
      },
      number: this.phoneNumber,
    };

    if (isGroup) {
      payload.group_id = recipient;
    } else {
      payload.recipients = [recipient];
    }

    await this.signalAPI('POST', '/v2/send', payload);
    console.log(`[Signal] Sent reaction ${emoji} to ${recipient}`);
  }

  /**
   * Remove a reaction from a message
   */
  async removeReaction(
    recipient: string,
    emoji: string,
    targetTimestamp: number,
    targetAuthor: string,
    isGroup: boolean = false
  ): Promise<void> {
    const payload: Record<string, unknown> = {
      reaction: {
        emoji,
        target_author: targetAuthor,
        target_timestamp: targetTimestamp,
        remove: true,
      },
      number: this.phoneNumber,
    };

    if (isGroup) {
      payload.group_id = recipient;
    } else {
      payload.recipients = [recipient];
    }

    await this.signalAPI('POST', '/v2/send', payload);
    console.log(`[Signal] Removed reaction ${emoji} from ${recipient}`);
  }

  /**
   * Send typing indicator
   */
  async sendTypingIndicator(recipient: string, isGroup: boolean = false): Promise<void> {
    const payload: Record<string, unknown> = {
      number: this.phoneNumber,
    };

    if (isGroup) {
      payload.group_id = recipient;
    } else {
      payload.recipient = recipient;
    }

    await this.signalAPI('PUT', `/v1/typing-indicator/${this.phoneNumber}`, payload);
  }

  /**
   * Stop typing indicator
   */
  async stopTypingIndicator(recipient: string, isGroup: boolean = false): Promise<void> {
    const payload: Record<string, unknown> = {
      number: this.phoneNumber,
    };

    if (isGroup) {
      payload.group_id = recipient;
    } else {
      payload.recipient = recipient;
    }

    await this.signalAPI('DELETE', `/v1/typing-indicator/${this.phoneNumber}`, payload);
  }

  /**
   * Set disappearing messages timer
   */
  async setDisappearingMessages(
    recipient: string,
    expiresInSeconds: number,
    isGroup: boolean = false
  ): Promise<void> {
    const payload: Record<string, unknown> = {
      number: this.phoneNumber,
      expiration: expiresInSeconds,
    };

    if (isGroup) {
      await this.signalAPI('PUT', `/v1/groups/${this.phoneNumber}/${recipient}`, {
        expiration: expiresInSeconds,
      });
    } else {
      await this.signalAPI('PUT', `/v1/configuration/${this.phoneNumber}/settings`, {
        recipient,
        ...payload,
      });
    }

    console.log(`[Signal] Set disappearing messages for ${recipient}: ${expiresInSeconds}s`);
  }

  /**
   * Get group information
   */
  async getGroupInfo(groupId: string): Promise<{
    id: string;
    name: string;
    members: string[];
  } | null> {
    if (!this.connected) return null;

    try {
      const groups = await this.signalAPI<Array<{
        id: string;
        name: string;
        members: string[];
      }>>('GET', `/v1/groups/${this.phoneNumber}`);

      return groups.find(g => g.id === groupId) || null;
    } catch {
      return null;
    }
  }

  /**
   * Get contact information
   */
  async getContactInfo(number: string): Promise<{
    name?: string;
    uuid?: string;
    profileName?: string;
  } | null> {
    if (!this.connected) return null;

    try {
      const contacts = await this.signalAPI<Array<{
        number: string;
        uuid?: string;
        name?: string;
        profileName?: string;
      }>>('GET', `/v1/contacts/${this.phoneNumber}`);

      return contacts.find(c => c.number === number) || null;
    } catch {
      return null;
    }
  }

  /**
   * Get attachment URL from ID
   */
  private async getAttachmentUrl(attachmentId: string): Promise<string> {
    // signal-cli typically stores attachments locally
    // The URL format depends on signal-cli configuration
    return `${this.signalCliUrl}/v1/attachments/${attachmentId}`;
  }

  /**
   * Infer attachment type from MIME type
   */
  private inferAttachmentType(contentType: string): 'file' | 'image' | 'url' {
    if (contentType.startsWith('image/')) {
      return 'image';
    }
    return 'file';
  }

  /**
   * Format message for Signal (handle length limits)
   */
  private formatMessage(text: string): string {
    const MAX_LENGTH = 8000;

    if (text.length <= MAX_LENGTH) {
      return text;
    }

    return text.substring(0, MAX_LENGTH - 20) + '\n\n... [truncated]';
  }

  /**
   * Make a signal-cli REST API call
   */
  private async signalAPI<T = Record<string, unknown>>(
    method: string,
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.signalCliUrl}${endpoint}`;

    const options: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Signal API error: ${response.status} ${error}`);
    }

    // Some endpoints return no content
    if (response.status === 204) {
      return {} as T;
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json() as Promise<T>;
    }

    return {} as T;
  }

  /**
   * Health check for signal-cli
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    latency: number;
    errors?: string[];
  }> {
    const start = Date.now();

    try {
      await this.signalAPI('GET', '/v1/about');
      return {
        healthy: true,
        latency: Date.now() - start,
      };
    } catch (error) {
      return {
        healthy: false,
        latency: Date.now() - start,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Link a new device (show QR code URI)
   */
  async getLinkDeviceUri(): Promise<string | null> {
    try {
      const result = await this.signalAPI<{ uri: string }>('GET', '/v1/qrcodelink?device_name=X2000');
      return result.uri;
    } catch {
      return null;
    }
  }

  /**
   * Register a new phone number (requires verification code)
   */
  async registerNumber(
    phoneNumber: string,
    captcha?: string,
    useVoice: boolean = false
  ): Promise<void> {
    const payload: Record<string, unknown> = {
      use_voice: useVoice,
    };

    if (captcha) {
      payload.captcha = captcha;
    }

    await this.signalAPI('POST', `/v1/register/${phoneNumber}`, payload);
    console.log(`[Signal] Registration started for ${phoneNumber}`);
  }

  /**
   * Verify phone number with code
   */
  async verifyNumber(phoneNumber: string, verificationCode: string): Promise<void> {
    await this.signalAPI('POST', `/v1/register/${phoneNumber}/verify/${verificationCode}`);
    console.log(`[Signal] Phone number ${phoneNumber} verified`);
  }
}

// ============================================================================
// Exports
// ============================================================================

export const signalChannel = new SignalChannel();

// Register with channel registry (only if configured)
if (process.env.SIGNAL_PHONE_NUMBER) {
  ChannelRegistry.register(signalChannel);
}

export function createSignalChannel(config?: SignalChannelConfig): SignalChannel {
  return new SignalChannel(config);
}
