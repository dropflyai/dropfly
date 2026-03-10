/**
 * WhatsApp Channel Adapter
 *
 * Enables X2000 communication via WhatsApp Cloud API (official Meta API).
 *
 * Features:
 * - Text, images, documents, audio, video messages
 * - Template messages for business
 * - Interactive buttons and lists
 * - Message status tracking (sent, delivered, read)
 * - Location and contact sharing
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

export interface WhatsAppChannelConfig extends Partial<ChannelConfig> {
  accessToken?: string;
  phoneNumberId?: string;
  businessAccountId?: string;
  apiVersion?: string;
  webhookVerifyToken?: string;
  allowedPhoneNumbers?: string[];
}

/**
 * WhatsApp Cloud API webhook payload
 */
interface WhatsAppWebhookPayload {
  object: string;
  entry: WhatsAppEntry[];
}

interface WhatsAppEntry {
  id: string;
  changes: WhatsAppChange[];
}

interface WhatsAppChange {
  value: {
    messaging_product: string;
    metadata: {
      display_phone_number: string;
      phone_number_id: string;
    };
    contacts?: WhatsAppContact[];
    messages?: WhatsAppIncomingMessage[];
    statuses?: WhatsAppStatus[];
  };
  field: string;
}

interface WhatsAppContact {
  profile: {
    name: string;
  };
  wa_id: string;
}

interface WhatsAppIncomingMessage {
  id: string;
  from: string;
  timestamp: string;
  type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'location' | 'contacts' | 'interactive' | 'button' | 'reaction';
  text?: {
    body: string;
  };
  image?: WhatsAppMedia;
  document?: WhatsAppMedia & { filename?: string };
  audio?: WhatsAppMedia;
  video?: WhatsAppMedia & { caption?: string };
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
  contacts?: WhatsAppContactMessage[];
  interactive?: {
    type: 'button_reply' | 'list_reply';
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string; description?: string };
  };
  button?: {
    text: string;
    payload: string;
  };
  reaction?: {
    message_id: string;
    emoji: string;
  };
  context?: {
    from: string;
    id: string;
  };
}

interface WhatsAppMedia {
  id: string;
  mime_type: string;
  sha256?: string;
  caption?: string;
}

interface WhatsAppContactMessage {
  name: {
    formatted_name: string;
    first_name?: string;
    last_name?: string;
  };
  phones?: Array<{ phone: string; type?: string }>;
}

interface WhatsAppStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  errors?: Array<{ code: number; title: string }>;
}

/**
 * WhatsApp outgoing message types
 */
interface WhatsAppTextMessage {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'text';
  text: { body: string };
}

interface WhatsAppTemplateMessage {
  messaging_product: 'whatsapp';
  to: string;
  type: 'template';
  template: {
    name: string;
    language: { code: string };
    components?: Array<{
      type: string;
      parameters: Array<{ type: string; text?: string; image?: { link: string } }>;
    }>;
  };
}

interface WhatsAppInteractiveMessage {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'interactive';
  interactive: {
    type: 'button' | 'list';
    header?: { type: 'text'; text: string };
    body: { text: string };
    footer?: { text: string };
    action: {
      buttons?: Array<{ type: 'reply'; reply: { id: string; title: string } }>;
      button?: string;
      sections?: Array<{
        title: string;
        rows: Array<{ id: string; title: string; description?: string }>;
      }>;
    };
  };
}

type WhatsAppOutgoingMessage = WhatsAppTextMessage | WhatsAppTemplateMessage | WhatsAppInteractiveMessage;

/**
 * Platform capabilities for WhatsApp
 */
export const WHATSAPP_CAPABILITIES = {
  supportsMarkdown: false,
  supportsHTML: false,
  supportsRichText: false,
  maxMessageLength: 4096,
  supportsThreads: false,
  supportsReplies: true,
  supportsFiles: true,
  supportsImages: true,
  supportsVoice: true,
  supportsVideo: true,
  supportsLocation: true,
  maxAttachmentSize: 100 * 1024 * 1024, // 100MB
  supportsReactions: true,
  supportsButtons: true,
  supportsCards: true,
  supportsTypingIndicator: false,
  supportsReadReceipts: true,
  supportsMessageEdit: false,
  supportsMessageDelete: false,
  supportsE2EEncryption: true,
  supportsDisappearingMessages: true,
};

// ============================================================================
// WhatsApp Channel
// ============================================================================

export class WhatsAppChannel extends BaseChannel {
  readonly type = 'whatsapp';
  readonly name = 'WhatsApp';
  readonly capabilities = WHATSAPP_CAPABILITIES;

  private accessToken: string | null;
  private phoneNumberId: string | null;
  private businessAccountId: string | null;
  private apiVersion: string;
  private webhookVerifyToken: string | null;
  private allowedPhoneNumbers: string[] | null;
  private baseUrl: string;

  // Track message statuses
  private messageStatuses: Map<string, WhatsAppStatus> = new Map();

  constructor(config: WhatsAppChannelConfig = {}) {
    super(config);
    this.initializeConfig();

    this.accessToken = config.accessToken || process.env.WHATSAPP_ACCESS_TOKEN || null;
    this.phoneNumberId = config.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || null;
    this.businessAccountId = config.businessAccountId || process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || null;
    this.apiVersion = config.apiVersion || process.env.WHATSAPP_API_VERSION || 'v18.0';
    this.webhookVerifyToken = config.webhookVerifyToken || process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || null;
    this.allowedPhoneNumbers = config.allowedPhoneNumbers || null;

    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}`;
  }

  /**
   * Initialize WhatsApp connection
   */
  async initialize(): Promise<void> {
    if (!this.accessToken || !this.phoneNumberId) {
      console.warn('[WhatsApp] Missing access token or phone number ID, channel disabled');
      this.config.enabled = false;
      return;
    }

    try {
      // Verify credentials by fetching phone number info
      const phoneInfo = await this.whatsappAPI<{ verified_name: string; display_phone_number: string }>(
        'GET',
        ''
      );

      this.connected = true;
      console.log(`[WhatsApp] Connected as ${phoneInfo.verified_name} (${phoneInfo.display_phone_number})`);

      // Note: Webhook setup is typically done via Meta App Dashboard
      // The webhook endpoint should call handleWebhook() for incoming messages
    } catch (error) {
      console.error('[WhatsApp] Failed to initialize:', error);
      this.connected = false;
      throw error;
    }
  }

  /**
   * Verify webhook challenge (for Meta webhook setup)
   */
  verifyWebhook(
    mode: string,
    token: string,
    challenge: string
  ): string | null {
    if (mode === 'subscribe' && token === this.webhookVerifyToken) {
      console.log('[WhatsApp] Webhook verified');
      return challenge;
    }
    return null;
  }

  /**
   * Handle incoming webhook payload
   */
  async handleWebhook(payload: WhatsAppWebhookPayload): Promise<ChannelResponse | null> {
    if (payload.object !== 'whatsapp_business_account') {
      return null;
    }

    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        if (change.field !== 'messages') continue;

        // Handle message statuses
        if (change.value.statuses) {
          for (const status of change.value.statuses) {
            this.handleStatus(status);
          }
        }

        // Handle incoming messages
        if (change.value.messages) {
          for (const message of change.value.messages) {
            const contact = change.value.contacts?.find(c => c.wa_id === message.from);
            const response = await this.handleMessage(message, contact);
            if (response) return response;
          }
        }
      }
    }

    return null;
  }

  /**
   * Handle incoming message
   */
  private async handleMessage(
    message: WhatsAppIncomingMessage,
    contact?: WhatsAppContact
  ): Promise<ChannelResponse | null> {
    // Check phone number allowlist
    if (this.allowedPhoneNumbers && !this.allowedPhoneNumbers.includes(message.from)) {
      return null;
    }

    // Extract content based on message type
    let content = '';
    const attachments: ChannelMessage['attachments'] = [];

    switch (message.type) {
      case 'text':
        content = message.text?.body || '';
        break;

      case 'image':
        if (message.image) {
          attachments.push({
            type: 'image',
            name: 'image',
            url: await this.getMediaUrl(message.image.id),
            mimeType: message.image.mime_type,
          });
          content = message.image.caption || '';
        }
        break;

      case 'document':
        if (message.document) {
          attachments.push({
            type: 'file',
            name: message.document.filename || 'document',
            url: await this.getMediaUrl(message.document.id),
            mimeType: message.document.mime_type,
          });
          content = message.document.caption || '';
        }
        break;

      case 'audio':
        if (message.audio) {
          attachments.push({
            type: 'file',
            name: 'audio',
            url: await this.getMediaUrl(message.audio.id),
            mimeType: message.audio.mime_type,
          });
        }
        break;

      case 'video':
        if (message.video) {
          attachments.push({
            type: 'file',
            name: 'video',
            url: await this.getMediaUrl(message.video.id),
            mimeType: message.video.mime_type,
          });
          content = message.video.caption || '';
        }
        break;

      case 'location':
        if (message.location) {
          content = `Location: ${message.location.name || ''} (${message.location.latitude}, ${message.location.longitude})`;
        }
        break;

      case 'interactive':
        if (message.interactive) {
          if (message.interactive.button_reply) {
            content = `[Button: ${message.interactive.button_reply.title}] ${message.interactive.button_reply.id}`;
          } else if (message.interactive.list_reply) {
            content = `[List: ${message.interactive.list_reply.title}] ${message.interactive.list_reply.id}`;
          }
        }
        break;

      case 'button':
        if (message.button) {
          content = message.button.payload || message.button.text;
        }
        break;

      case 'reaction':
        if (message.reaction) {
          content = `[Reaction: ${message.reaction.emoji}] to message ${message.reaction.message_id}`;
        }
        break;

      default:
        console.log(`[WhatsApp] Unhandled message type: ${message.type}`);
        return null;
    }

    // Create channel message
    const channelMessage: ChannelMessage = {
      id: message.id,
      channelType: this.type,
      channelId: message.from,
      userId: message.from,
      content,
      timestamp: new Date(parseInt(message.timestamp, 10) * 1000),
      replyToId: message.context?.id,
      metadata: {
        messageId: message.id,
        messageType: message.type,
        contactName: contact?.profile.name,
        replyContext: message.context,
      },
      attachments,
    };

    return this.processMessage(channelMessage);
  }

  /**
   * Handle message status update
   */
  private handleStatus(status: WhatsAppStatus): void {
    this.messageStatuses.set(status.id, status);

    if (status.status === 'failed' && status.errors) {
      console.error(`[WhatsApp] Message ${status.id} failed:`, status.errors);
    } else {
      console.log(`[WhatsApp] Message ${status.id} status: ${status.status}`);
    }
  }

  /**
   * Get message status
   */
  getMessageStatus(messageId: string): WhatsAppStatus | undefined {
    return this.messageStatuses.get(messageId);
  }

  /**
   * Shutdown WhatsApp connection
   */
  async shutdown(): Promise<void> {
    this.connected = false;
    this.messageStatuses.clear();
    console.log('[WhatsApp] Disconnected');
  }

  /**
   * Send a message to WhatsApp
   */
  async send(
    channelId: string,
    response: ChannelResponse,
    context?: Partial<ChannelContext>
  ): Promise<void> {
    if (!this.connected || !this.accessToken) {
      throw new Error('WhatsApp channel not connected');
    }

    // Check if this is an interactive message with buttons
    if (response.metadata?.buttons && Array.isArray(response.metadata.buttons)) {
      await this.sendInteractiveMessage(channelId, response);
    } else if (response.metadata?.template) {
      // Send template message
      await this.sendTemplateMessage(channelId, response);
    } else {
      // Send simple text message
      await this.sendTextMessage(channelId, response, context);
    }

    // Send attachments
    if (response.attachments && response.attachments.length > 0) {
      for (const attachment of response.attachments) {
        await this.sendMedia(channelId, attachment);
      }
    }
  }

  /**
   * Send a text message
   */
  private async sendTextMessage(
    to: string,
    response: ChannelResponse,
    context?: Partial<ChannelContext>
  ): Promise<void> {
    const payload: WhatsAppTextMessage & { context?: { message_id: string } } = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { body: this.formatMessage(response.content) },
    };

    // Reply to message if context has replyToId
    if (context?.metadata?.messageId) {
      payload.context = { message_id: context.metadata.messageId as string };
    }

    const result = await this.whatsappAPI<{ messages: Array<{ id: string }> }>('POST', '/messages', payload);
    console.log(`[WhatsApp] Sent text message to ${to}: ${result.messages[0]?.id}`);
  }

  /**
   * Send an interactive message with buttons or list
   */
  private async sendInteractiveMessage(
    to: string,
    response: ChannelResponse
  ): Promise<void> {
    const buttons = response.metadata?.buttons as Array<{ id: string; title: string }>;

    // WhatsApp supports max 3 buttons, otherwise use list
    if (buttons.length <= 3) {
      const payload: WhatsAppInteractiveMessage = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: this.formatMessage(response.content) },
          action: {
            buttons: buttons.map(b => ({
              type: 'reply' as const,
              reply: { id: b.id, title: b.title.substring(0, 20) }, // Max 20 chars
            })),
          },
        },
      };

      await this.whatsappAPI<{ messages: Array<{ id: string }> }>('POST', '/messages', payload);
    } else {
      // Use list for more than 3 options
      const payload: WhatsAppInteractiveMessage = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'interactive',
        interactive: {
          type: 'list',
          body: { text: this.formatMessage(response.content) },
          action: {
            button: 'Options',
            sections: [{
              title: 'Choose an option',
              rows: buttons.map(b => ({
                id: b.id,
                title: b.title.substring(0, 24), // Max 24 chars
              })),
            }],
          },
        },
      };

      await this.whatsappAPI<{ messages: Array<{ id: string }> }>('POST', '/messages', payload);
    }

    console.log(`[WhatsApp] Sent interactive message to ${to}`);
  }

  /**
   * Send a template message
   */
  private async sendTemplateMessage(
    to: string,
    response: ChannelResponse
  ): Promise<void> {
    const template = response.metadata?.template as {
      name: string;
      language: string;
      components?: Array<{ type: string; parameters: Array<{ type: string; text?: string }> }>;
    };

    const payload: WhatsAppTemplateMessage = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: template.name,
        language: { code: template.language || 'en_US' },
        components: template.components,
      },
    };

    const result = await this.whatsappAPI<{ messages: Array<{ id: string }> }>('POST', '/messages', payload);
    console.log(`[WhatsApp] Sent template message to ${to}: ${result.messages[0]?.id}`);
  }

  /**
   * Send media (image, document, audio, video)
   */
  private async sendMedia(
    to: string,
    attachment: NonNullable<ChannelResponse['attachments']>[number]
  ): Promise<void> {
    const mediaType = this.getMediaType(attachment.type, attachment.mimeType);

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: mediaType,
      [mediaType]: {
        link: attachment.url,
        caption: attachment.name,
      },
    };

    await this.whatsappAPI<{ messages: Array<{ id: string }> }>('POST', '/messages', payload);
    console.log(`[WhatsApp] Sent ${mediaType} to ${to}`);
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<void> {
    await this.whatsappAPI('POST', '/messages', {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    });
    console.log(`[WhatsApp] Marked message ${messageId} as read`);
  }

  /**
   * Get media URL from media ID
   */
  private async getMediaUrl(mediaId: string): Promise<string> {
    const media = await this.whatsappAPI<{ url: string }>(
      'GET',
      `/${mediaId}`,
      undefined,
      `https://graph.facebook.com/${this.apiVersion}`
    );
    return media.url;
  }

  /**
   * Download media from URL (requires access token in header)
   */
  async downloadMedia(url: string): Promise<Buffer> {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });

    if (!response.ok) {
      throw new Error(`Failed to download media: ${response.statusText}`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  /**
   * Determine media type for WhatsApp API
   */
  private getMediaType(type: string, mimeType?: string): 'image' | 'document' | 'audio' | 'video' {
    if (type === 'image' || mimeType?.startsWith('image/')) {
      return 'image';
    }
    if (mimeType?.startsWith('audio/')) {
      return 'audio';
    }
    if (mimeType?.startsWith('video/')) {
      return 'video';
    }
    return 'document';
  }

  /**
   * Format message for WhatsApp (handle length limits)
   */
  private formatMessage(text: string): string {
    const MAX_LENGTH = 4096;

    if (text.length <= MAX_LENGTH) {
      return text;
    }

    return text.substring(0, MAX_LENGTH - 20) + '\n\n... [truncated]';
  }

  /**
   * Make a WhatsApp Cloud API call
   */
  private async whatsappAPI<T = Record<string, unknown>>(
    method: string,
    endpoint: string,
    body?: unknown,
    baseUrl?: string
  ): Promise<T> {
    const url = (baseUrl || this.baseUrl) + endpoint;

    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json() as { error?: { message?: string } };
      throw new Error(`WhatsApp API error: ${error.error?.message || response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Register phone number (for business setup)
   */
  async registerPhoneNumber(pin: string): Promise<void> {
    await this.whatsappAPI('POST', '/register', {
      messaging_product: 'whatsapp',
      pin,
    });
    console.log('[WhatsApp] Phone number registered');
  }

  /**
   * Get business profile
   */
  async getBusinessProfile(): Promise<Record<string, unknown> | null> {
    if (!this.connected) return null;

    try {
      return await this.whatsappAPI('GET', '/whatsapp_business_profile');
    } catch {
      return null;
    }
  }
}

// ============================================================================
// Exports
// ============================================================================

export const whatsappChannel = new WhatsAppChannel();

// Register with channel registry (only if configured)
if (process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
  ChannelRegistry.register(whatsappChannel);
}

export function createWhatsAppChannel(config?: WhatsAppChannelConfig): WhatsAppChannel {
  return new WhatsAppChannel(config);
}
