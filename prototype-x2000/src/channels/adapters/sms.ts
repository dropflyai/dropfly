/**
 * SMS/Twilio Channel Adapter
 *
 * Enables X2000 communication via SMS using Twilio.
 * Supports text messages, MMS images, and delivery status webhooks.
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

export interface SMSChannelConfig extends Partial<ChannelConfig> {
  accountSid?: string;
  authToken?: string;
  phoneNumber?: string;
  messagingServiceSid?: string;
  statusCallbackUrl?: string;
  allowedPhoneNumbers?: string[];
}

export interface TwilioWebhookBody {
  MessageSid: string;
  AccountSid: string;
  From: string;
  To: string;
  Body: string;
  NumMedia?: string;
  NumSegments?: string;
  SmsStatus?: string;
  MessageStatus?: string;
  ErrorCode?: string;
  ErrorMessage?: string;
  [key: string]: string | undefined;
}

export interface TwilioMessageResponse {
  sid: string;
  status: string;
  error_code?: number;
  error_message?: string;
}

export interface SMSCapabilities {
  supportsMarkdown: false;
  supportsHTML: false;
  supportsRichText: false;
  maxMessageLength: 1600;
  supportsThreads: false;
  supportsReplies: false;
  supportsFiles: false;
  supportsImages: true;
  supportsVoice: false;
  supportsVideo: false;
  supportsLocation: false;
  maxAttachmentSize: number;
  supportsReactions: false;
  supportsButtons: false;
  supportsCards: false;
  supportsTypingIndicator: false;
  supportsReadReceipts: false;
  supportsMessageEdit: false;
  supportsMessageDelete: false;
  supportsE2EEncryption: false;
  supportsDisappearingMessages: false;
}

// ============================================================================
// SMS Channel
// ============================================================================

export class SMSChannel extends BaseChannel {
  readonly type = 'sms';
  readonly name = 'SMS (Twilio)';

  readonly capabilities: SMSCapabilities = {
    supportsMarkdown: false,
    supportsHTML: false,
    supportsRichText: false,
    maxMessageLength: 1600,
    supportsThreads: false,
    supportsReplies: false,
    supportsFiles: false,
    supportsImages: true,
    supportsVoice: false,
    supportsVideo: false,
    supportsLocation: false,
    maxAttachmentSize: 5 * 1024 * 1024,
    supportsReactions: false,
    supportsButtons: false,
    supportsCards: false,
    supportsTypingIndicator: false,
    supportsReadReceipts: false,
    supportsMessageEdit: false,
    supportsMessageDelete: false,
    supportsE2EEncryption: false,
    supportsDisappearingMessages: false,
  };

  private accountSid: string | null;
  private authToken: string | null;
  private phoneNumber: string | null;
  private messagingServiceSid: string | null;
  private statusCallbackUrl: string | null;
  private allowedPhoneNumbers: string[] | null;
  private deliveryStatuses: Map<string, string> = new Map();

  constructor(config: SMSChannelConfig = {}) {
    super(config);

    this.accountSid = config.accountSid || process.env.TWILIO_ACCOUNT_SID || null;
    this.authToken = config.authToken || process.env.TWILIO_AUTH_TOKEN || null;
    this.phoneNumber = config.phoneNumber || process.env.TWILIO_PHONE_NUMBER || null;
    this.messagingServiceSid = config.messagingServiceSid || process.env.TWILIO_MESSAGING_SERVICE_SID || null;
    this.statusCallbackUrl = config.statusCallbackUrl || process.env.TWILIO_STATUS_CALLBACK_URL || null;
    this.allowedPhoneNumbers = config.allowedPhoneNumbers || null;
  }

  /**
   * Initialize SMS/Twilio connection
   */
  async initialize(): Promise<void> {
    if (!this.accountSid || !this.authToken) {
      console.warn('[SMS] No Twilio credentials configured, channel disabled');
      this.config.enabled = false;
      return;
    }

    if (!this.phoneNumber && !this.messagingServiceSid) {
      console.warn('[SMS] No phone number or messaging service SID configured');
      this.config.enabled = false;
      return;
    }

    try {
      // Verify credentials by fetching account info
      const accountInfo = await this.twilioAPI('GET', `/Accounts/${this.accountSid}.json`);

      if (accountInfo.sid) {
        this.connected = true;
        console.log(`[SMS] Connected to Twilio account: ${accountInfo.friendly_name || this.accountSid}`);
      } else {
        throw new Error('Failed to verify Twilio account');
      }
    } catch (error) {
      console.error('[SMS] Failed to initialize:', error);
      this.connected = false;
      throw error;
    }
  }

  /**
   * Shutdown SMS connection
   */
  async shutdown(): Promise<void> {
    this.connected = false;
    this.deliveryStatuses.clear();
    console.log('[SMS] Disconnected');
  }

  /**
   * Send an SMS message
   */
  async send(
    channelId: string,
    response: ChannelResponse,
    _context?: Partial<ChannelContext>
  ): Promise<void> {
    if (!this.connected || !this.accountSid || !this.authToken) {
      throw new Error('SMS channel not connected');
    }

    // Validate phone number format
    const toNumber = this.normalizePhoneNumber(channelId);
    if (!this.isValidPhoneNumber(toNumber)) {
      throw new Error(`Invalid phone number: ${channelId}`);
    }

    const payload: Record<string, string> = {
      To: toNumber,
      Body: this.formatMessage(response.content),
    };

    // Use messaging service or phone number
    if (this.messagingServiceSid) {
      payload.MessagingServiceSid = this.messagingServiceSid;
    } else if (this.phoneNumber) {
      payload.From = this.phoneNumber;
    }

    // Add status callback if configured
    if (this.statusCallbackUrl) {
      payload.StatusCallback = this.statusCallbackUrl;
    }

    // Add MMS media URLs for images
    if (response.attachments && response.attachments.length > 0) {
      const imageAttachments = response.attachments.filter(
        a => a.type === 'image' && a.url
      );

      imageAttachments.forEach((attachment, index) => {
        if (attachment.url && index < 10) {
          payload[`MediaUrl${index}`] = attachment.url;
        }
      });
    }

    const result = await this.twilioAPI(
      'POST',
      `/Accounts/${this.accountSid}/Messages.json`,
      payload
    ) as unknown as TwilioMessageResponse;

    if (result.error_code) {
      throw new Error(`Failed to send SMS: ${result.error_message || result.error_code}`);
    }

    // Track delivery status
    if (result.sid) {
      this.deliveryStatuses.set(result.sid, result.status);
    }

    console.log(`[SMS] Sent message to ${toNumber}, SID: ${result.sid}`);
  }

  /**
   * Handle incoming Twilio webhook
   */
  handleWebhook(body: TwilioWebhookBody): ChannelMessage {
    return this.toUnified(body);
  }

  /**
   * Handle delivery status webhook
   */
  handleStatusWebhook(body: TwilioWebhookBody): {
    messageSid: string;
    status: string;
    errorCode?: string;
    errorMessage?: string;
  } {
    const messageSid = body.MessageSid;
    const status = body.MessageStatus || body.SmsStatus || 'unknown';

    this.deliveryStatuses.set(messageSid, status);

    console.log(`[SMS] Status update for ${messageSid}: ${status}`);

    return {
      messageSid,
      status,
      errorCode: body.ErrorCode,
      errorMessage: body.ErrorMessage,
    };
  }

  /**
   * Get delivery status for a message
   */
  getDeliveryStatus(messageSid: string): string | undefined {
    return this.deliveryStatuses.get(messageSid);
  }

  /**
   * Convert Twilio webhook to unified message format
   */
  private toUnified(body: TwilioWebhookBody): ChannelMessage {
    const attachments: ChannelMessage['attachments'] = [];

    // Extract MMS media
    const numMedia = parseInt(body.NumMedia || '0', 10);
    for (let i = 0; i < numMedia; i++) {
      const mediaUrl = body[`MediaUrl${i}`];
      const mediaType = body[`MediaContentType${i}`];

      if (mediaUrl) {
        attachments.push({
          type: 'image',
          name: `media-${i}`,
          url: mediaUrl,
          mimeType: mediaType,
        });
      }
    }

    return {
      id: body.MessageSid,
      channelType: this.type,
      channelId: body.From,
      userId: body.From,
      content: body.Body || '',
      timestamp: new Date(),
      metadata: {
        accountSid: body.AccountSid,
        toNumber: body.To,
        numSegments: body.NumSegments,
        smsStatus: body.SmsStatus,
      },
      attachments: attachments.length > 0 ? attachments : undefined,
    };
  }

  /**
   * Process an incoming SMS message
   */
  async handleMessage(body: TwilioWebhookBody): Promise<ChannelResponse | null> {
    // Check phone number allowlist
    if (this.allowedPhoneNumbers && !this.allowedPhoneNumbers.includes(body.From)) {
      console.log(`[SMS] Ignoring message from non-allowed number: ${body.From}`);
      return null;
    }

    const message = this.toUnified(body);
    return this.processMessage(message);
  }

  /**
   * Format message for SMS (handle length limits)
   */
  private formatMessage(text: string): string {
    const MAX_LENGTH = 1600;

    if (text.length <= MAX_LENGTH) {
      return text;
    }

    return text.substring(0, MAX_LENGTH - 15) + '\n... [truncated]';
  }

  /**
   * Normalize phone number to E.164 format
   */
  private normalizePhoneNumber(number: string): string {
    // Remove all non-digit characters except leading +
    let normalized = number.replace(/[^\d+]/g, '');

    // If no + prefix, assume US number and add +1
    if (!normalized.startsWith('+')) {
      if (normalized.length === 10) {
        normalized = '+1' + normalized;
      } else if (normalized.length === 11 && normalized.startsWith('1')) {
        normalized = '+' + normalized;
      }
    }

    return normalized;
  }

  /**
   * Validate phone number format
   */
  private isValidPhoneNumber(number: string): boolean {
    // E.164 format: + followed by 1-15 digits
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(number);
  }

  /**
   * Make a Twilio API call
   */
  private async twilioAPI(
    method: string,
    endpoint: string,
    body?: Record<string, string>
  ): Promise<Record<string, unknown>> {
    const url = `https://api.twilio.com/2010-04-01${endpoint}`;
    const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');

    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    if (body) {
      options.body = new URLSearchParams(body).toString();
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json() as { message?: string };
      throw new Error(`Twilio API error: ${response.status} ${error.message || 'Unknown error'}`);
    }

    return response.json() as Promise<Record<string, unknown>>;
  }

  /**
   * Lookup phone number information
   */
  async lookupPhoneNumber(phoneNumber: string): Promise<{
    valid: boolean;
    countryCode?: string;
    carrier?: string;
    type?: string;
  }> {
    if (!this.connected) {
      return { valid: false };
    }

    try {
      const normalized = this.normalizePhoneNumber(phoneNumber);
      const result = await this.twilioAPI(
        'GET',
        `/PhoneNumbers/${encodeURIComponent(normalized)}`
      );

      return {
        valid: true,
        countryCode: result.country_code as string | undefined,
        carrier: (result.carrier as { name?: string })?.name,
        type: (result.carrier as { type?: string })?.type,
      };
    } catch {
      return { valid: false };
    }
  }

  /**
   * Generate TwiML response for webhook replies
   */
  generateTwiML(response: ChannelResponse): string {
    let twiml = '<?xml version="1.0" encoding="UTF-8"?><Response>';

    twiml += `<Message>${this.escapeXML(response.content)}</Message>`;

    // Add media for MMS
    if (response.attachments) {
      for (const attachment of response.attachments) {
        if (attachment.type === 'image' && attachment.url) {
          twiml += `<Message><Media>${this.escapeXML(attachment.url)}</Media></Message>`;
        }
      }
    }

    twiml += '</Response>';
    return twiml;
  }

  /**
   * Escape XML special characters
   */
  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

// ============================================================================
// Exports
// ============================================================================

export const smsChannel = new SMSChannel();

// Register with channel registry (only if configured)
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  ChannelRegistry.register(smsChannel);
}

export function createSMSChannel(config?: SMSChannelConfig): SMSChannel {
  return new SMSChannel(config);
}
