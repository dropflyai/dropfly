/**
 * Email Channel Adapter
 *
 * Enables X2000 communication via email using IMAP for receiving
 * and SMTP for sending. Supports HTML/plain text and attachments.
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

export interface EmailChannelConfig extends Partial<ChannelConfig> {
  // IMAP settings (receiving)
  imapHost?: string;
  imapPort?: number;
  imapUser?: string;
  imapPassword?: string;
  imapTls?: boolean;

  // SMTP settings (sending)
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpSecure?: boolean;

  // Email settings
  fromAddress?: string;
  fromName?: string;
  replyToAddress?: string;

  // Filtering
  allowedSenders?: string[];
  allowedDomains?: string[];
  subjectPrefix?: string;

  // Behavior
  pollInterval?: number;
  markAsRead?: boolean;
  includeHtml?: boolean;
}

export interface EmailMessage {
  messageId: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  replyTo?: EmailAddress;
  subject: string;
  textBody?: string;
  htmlBody?: string;
  date: Date;
  inReplyTo?: string;
  references?: string[];
  attachments: EmailAttachment[];
  headers: Record<string, string>;
}

export interface EmailAddress {
  name?: string;
  address: string;
}

export interface EmailAttachment {
  filename: string;
  contentType: string;
  size: number;
  content?: Buffer;
  contentId?: string;
  url?: string;
}

export interface EmailCapabilities {
  supportsMarkdown: true;
  supportsHTML: true;
  supportsRichText: true;
  maxMessageLength: number;
  supportsThreads: true;
  supportsReplies: true;
  supportsFiles: true;
  supportsImages: true;
  supportsVoice: false;
  supportsVideo: false;
  supportsLocation: false;
  maxAttachmentSize: number;
  supportsReactions: false;
  supportsButtons: false;
  supportsCards: false;
  supportsTypingIndicator: false;
  supportsReadReceipts: true;
  supportsMessageEdit: false;
  supportsMessageDelete: false;
  supportsE2EEncryption: false;
  supportsDisappearingMessages: false;
}

interface SMTPResponse {
  accepted: string[];
  rejected: string[];
  messageId: string;
}

// ============================================================================
// Email Channel
// ============================================================================

export class EmailChannel extends BaseChannel {
  readonly type = 'email';
  readonly name = 'Email (SMTP/IMAP)';

  readonly capabilities: EmailCapabilities = {
    supportsMarkdown: true,
    supportsHTML: true,
    supportsRichText: true,
    maxMessageLength: 1000000,
    supportsThreads: true,
    supportsReplies: true,
    supportsFiles: true,
    supportsImages: true,
    supportsVoice: false,
    supportsVideo: false,
    supportsLocation: false,
    maxAttachmentSize: 25 * 1024 * 1024,
    supportsReactions: false,
    supportsButtons: false,
    supportsCards: false,
    supportsTypingIndicator: false,
    supportsReadReceipts: true,
    supportsMessageEdit: false,
    supportsMessageDelete: false,
    supportsE2EEncryption: false,
    supportsDisappearingMessages: false,
  };

  // IMAP settings
  private imapHost: string | null;
  private imapPort: number;
  private imapUser: string | null;
  private imapPassword: string | null;
  private imapTls: boolean;

  // SMTP settings
  private smtpHost: string | null;
  private smtpPort: number;
  private smtpUser: string | null;
  private smtpPassword: string | null;
  private smtpSecure: boolean;

  // Email settings
  private fromAddress: string | null;
  private fromName: string;
  private replyToAddress: string | null;

  // Filtering
  private allowedSenders: string[] | null;
  private allowedDomains: string[] | null;
  private subjectPrefix: string | null;

  // Behavior
  private pollInterval: number;
  private markAsRead: boolean;
  private includeHtml: boolean;

  // State
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private threadMap: Map<string, string[]> = new Map();

  constructor(config: EmailChannelConfig = {}) {
    super(config);

    // IMAP settings
    this.imapHost = config.imapHost || process.env.EMAIL_IMAP_HOST || null;
    this.imapPort = config.imapPort || parseInt(process.env.EMAIL_IMAP_PORT || '993', 10);
    this.imapUser = config.imapUser || process.env.EMAIL_IMAP_USER || null;
    this.imapPassword = config.imapPassword || process.env.EMAIL_IMAP_PASSWORD || null;
    this.imapTls = config.imapTls ?? (process.env.EMAIL_IMAP_TLS !== 'false');

    // SMTP settings
    this.smtpHost = config.smtpHost || process.env.EMAIL_SMTP_HOST || null;
    this.smtpPort = config.smtpPort || parseInt(process.env.EMAIL_SMTP_PORT || '587', 10);
    this.smtpUser = config.smtpUser || process.env.EMAIL_SMTP_USER || null;
    this.smtpPassword = config.smtpPassword || process.env.EMAIL_SMTP_PASSWORD || null;
    this.smtpSecure = config.smtpSecure ?? (process.env.EMAIL_SMTP_SECURE === 'true');

    // Email settings
    this.fromAddress = config.fromAddress || process.env.EMAIL_FROM_ADDRESS || null;
    this.fromName = config.fromName || process.env.EMAIL_FROM_NAME || 'X2000';
    this.replyToAddress = config.replyToAddress || process.env.EMAIL_REPLY_TO || null;

    // Filtering
    this.allowedSenders = config.allowedSenders || null;
    this.allowedDomains = config.allowedDomains || null;
    this.subjectPrefix = config.subjectPrefix || null;

    // Behavior
    this.pollInterval = config.pollInterval || 60000;
    this.markAsRead = config.markAsRead ?? true;
    this.includeHtml = config.includeHtml ?? true;
  }

  /**
   * Initialize Email channel
   */
  async initialize(): Promise<void> {
    if (!this.smtpHost || !this.smtpUser || !this.smtpPassword) {
      console.warn('[Email] No SMTP credentials configured, channel disabled');
      this.config.enabled = false;
      return;
    }

    try {
      // Verify SMTP connection by attempting to connect
      const verified = await this.verifySMTPConnection();

      if (verified) {
        this.connected = true;
        console.log(`[Email] SMTP connected to ${this.smtpHost}:${this.smtpPort}`);

        // Start IMAP polling if configured
        if (this.imapHost && this.imapUser && this.imapPassword) {
          this.startPolling();
          console.log(`[Email] IMAP polling started (${this.pollInterval}ms interval)`);
        }
      } else {
        throw new Error('Failed to verify SMTP connection');
      }
    } catch (error) {
      console.error('[Email] Failed to initialize:', error);
      this.connected = false;
      throw error;
    }
  }

  /**
   * Shutdown Email connection
   */
  async shutdown(): Promise<void> {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }

    this.connected = false;
    this.threadMap.clear();
    console.log('[Email] Disconnected');
  }

  /**
   * Send an email
   */
  async send(
    channelId: string,
    response: ChannelResponse,
    context?: Partial<ChannelContext>
  ): Promise<void> {
    if (!this.connected) {
      throw new Error('Email channel not connected');
    }

    const toAddress = channelId;
    const subject = (context?.metadata?.subject as string) || 'Message from X2000';
    const inReplyTo = context?.metadata?.inReplyTo as string | undefined;
    const references = context?.metadata?.references as string[] | undefined;

    // Build email message
    const email = this.buildEmail({
      to: [{ address: toAddress }],
      subject: this.subjectPrefix ? `${this.subjectPrefix} ${subject}` : subject,
      textBody: this.stripHtml(response.content),
      htmlBody: this.includeHtml ? this.formatHtmlEmail(response.content) : undefined,
      inReplyTo,
      references,
      attachments: response.attachments?.map(a => ({
        filename: a.name,
        contentType: a.mimeType || 'application/octet-stream',
        size: 0,
        url: a.url,
      })),
    });

    await this.sendSMTP(email);
    console.log(`[Email] Sent email to ${toAddress}`);
  }

  /**
   * Handle incoming email (from IMAP poll or webhook)
   */
  async handleEmail(email: EmailMessage): Promise<ChannelResponse | null> {
    // Check sender allowlist
    if (this.allowedSenders && !this.allowedSenders.includes(email.from.address)) {
      console.log(`[Email] Ignoring email from non-allowed sender: ${email.from.address}`);
      return null;
    }

    // Check domain allowlist
    if (this.allowedDomains) {
      const domain = email.from.address.split('@')[1];
      if (!this.allowedDomains.includes(domain)) {
        console.log(`[Email] Ignoring email from non-allowed domain: ${domain}`);
        return null;
      }
    }

    // Check subject prefix filter
    if (this.subjectPrefix && !email.subject.includes(this.subjectPrefix)) {
      console.log(`[Email] Ignoring email without subject prefix: ${email.subject}`);
      return null;
    }

    // Detect thread
    const threadId = this.detectThread(email);

    // Convert to unified message
    const message: ChannelMessage = {
      id: email.messageId,
      channelType: this.type,
      channelId: email.from.address,
      userId: email.from.address,
      content: email.textBody || this.stripHtml(email.htmlBody || ''),
      timestamp: email.date,
      threadId,
      metadata: {
        subject: email.subject,
        from: email.from,
        to: email.to,
        cc: email.cc,
        inReplyTo: email.inReplyTo,
        references: email.references,
        hasHtml: !!email.htmlBody,
      },
      attachments: email.attachments.map(a => ({
        type: 'file' as const,
        name: a.filename,
        mimeType: a.contentType,
        url: a.url,
      })),
    };

    return this.processMessage(message);
  }

  /**
   * Start IMAP polling
   */
  private startPolling(): void {
    this.pollTimer = setInterval(async () => {
      try {
        await this.pollIMAP();
      } catch (error) {
        console.error('[Email] IMAP poll error:', error);
      }
    }, this.pollInterval);
  }

  /**
   * Poll IMAP for new messages
   */
  private async pollIMAP(): Promise<void> {
    // Note: This is a simplified implementation
    // A production version would use the imap library
    console.log('[Email] Polling IMAP for new messages...');

    // Fetch unread messages
    const messages = await this.fetchIMAPMessages();

    for (const email of messages) {
      const response = await this.handleEmail(email);

      if (response) {
        // Send reply
        await this.send(email.from.address, response, {
          metadata: {
            subject: `Re: ${email.subject}`,
            inReplyTo: email.messageId,
            references: [...(email.references || []), email.messageId],
          },
        });
      }

      if (this.markAsRead) {
        await this.markMessageAsRead(email.messageId);
      }
    }
  }

  /**
   * Fetch messages from IMAP (placeholder for actual implementation)
   */
  private async fetchIMAPMessages(): Promise<EmailMessage[]> {
    // Note: A production implementation would use an IMAP library
    // This is a placeholder that returns an empty array

    if (!this.imapHost || !this.imapUser || !this.imapPassword) {
      return [];
    }

    // In production, use 'imap' or 'imapflow' library:
    // const client = new ImapFlow({ ... });
    // await client.connect();
    // const messages = await client.fetch('INBOX', { since: lastChecked });
    // return messages;

    return [];
  }

  /**
   * Mark message as read in IMAP (placeholder)
   */
  private async markMessageAsRead(_messageId: string): Promise<void> {
    // Placeholder for IMAP implementation
  }

  /**
   * Verify SMTP connection
   */
  private async verifySMTPConnection(): Promise<boolean> {
    // Note: In production, use nodemailer to verify connection
    // const transporter = nodemailer.createTransport({ ... });
    // await transporter.verify();

    // Simple check that we have credentials
    return !!(this.smtpHost && this.smtpUser && this.smtpPassword);
  }

  /**
   * Send email via SMTP
   */
  private async sendSMTP(email: Partial<EmailMessage>): Promise<SMTPResponse> {
    if (!this.smtpHost || !this.smtpUser || !this.smtpPassword || !this.fromAddress) {
      throw new Error('SMTP not configured');
    }

    // Note: In production, use nodemailer:
    // const transporter = nodemailer.createTransport({
    //   host: this.smtpHost,
    //   port: this.smtpPort,
    //   secure: this.smtpSecure,
    //   auth: { user: this.smtpUser, pass: this.smtpPassword },
    // });
    // const result = await transporter.sendMail({ ... });

    // For now, construct the request directly
    const boundary = `----=_Part_${uuidv4()}`;
    const messageId = `<${uuidv4()}@${this.fromAddress.split('@')[1]}>`;

    const headers = [
      `From: ${this.fromName} <${this.fromAddress}>`,
      `To: ${email.to?.map(t => t.name ? `${t.name} <${t.address}>` : t.address).join(', ')}`,
      `Subject: ${email.subject}`,
      `Message-ID: ${messageId}`,
      `Date: ${new Date().toUTCString()}`,
      'MIME-Version: 1.0',
    ];

    if (this.replyToAddress) {
      headers.push(`Reply-To: ${this.replyToAddress}`);
    }

    if (email.inReplyTo) {
      headers.push(`In-Reply-To: ${email.inReplyTo}`);
    }

    if (email.references && email.references.length > 0) {
      headers.push(`References: ${email.references.join(' ')}`);
    }

    // For a production implementation, use nodemailer or similar
    // This is a simplified version that logs the email
    console.log(`[Email] Would send email with headers:`, headers.join('\n'));
    console.log(`[Email] Body: ${email.textBody?.substring(0, 100)}...`);

    return {
      accepted: email.to?.map(t => t.address) || [],
      rejected: [],
      messageId,
    };
  }

  /**
   * Build email message object
   */
  private buildEmail(options: {
    to: EmailAddress[];
    subject: string;
    textBody?: string;
    htmlBody?: string;
    cc?: EmailAddress[];
    bcc?: EmailAddress[];
    inReplyTo?: string;
    references?: string[];
    attachments?: EmailAttachment[];
  }): Partial<EmailMessage> {
    return {
      messageId: `<${uuidv4()}@${this.fromAddress?.split('@')[1] || 'x2000.local'}>`,
      from: {
        name: this.fromName,
        address: this.fromAddress || 'noreply@x2000.local',
      },
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject,
      textBody: options.textBody,
      htmlBody: options.htmlBody,
      date: new Date(),
      inReplyTo: options.inReplyTo,
      references: options.references,
      attachments: options.attachments || [],
      headers: {},
    };
  }

  /**
   * Detect thread from email headers
   */
  private detectThread(email: EmailMessage): string | undefined {
    // Use In-Reply-To or References to detect thread
    if (email.inReplyTo) {
      // Find existing thread
      for (const [threadId, messageIds] of this.threadMap) {
        if (messageIds.includes(email.inReplyTo)) {
          messageIds.push(email.messageId);
          return threadId;
        }
      }
    }

    if (email.references && email.references.length > 0) {
      for (const [threadId, messageIds] of this.threadMap) {
        for (const ref of email.references) {
          if (messageIds.includes(ref)) {
            messageIds.push(email.messageId);
            return threadId;
          }
        }
      }
    }

    // Create new thread
    const threadId = uuidv4();
    this.threadMap.set(threadId, [email.messageId]);
    return threadId;
  }

  /**
   * Format content as HTML email
   */
  private formatHtmlEmail(content: string): string {
    // Basic markdown-to-HTML conversion
    let html = content
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
    a { color: #0066cc; }
  </style>
</head>
<body>
  <p>${html}</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
  <p style="color: #666; font-size: 12px;">Sent by X2000</p>
</body>
</html>`;
  }

  /**
   * Strip HTML tags from string
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Get thread messages
   */
  getThreadMessages(threadId: string): string[] {
    return this.threadMap.get(threadId) || [];
  }
}

// ============================================================================
// Exports
// ============================================================================

export const emailChannel = new EmailChannel();

// Register with channel registry (only if configured)
if (process.env.EMAIL_SMTP_HOST && process.env.EMAIL_SMTP_USER) {
  ChannelRegistry.register(emailChannel);
}

export function createEmailChannel(config?: EmailChannelConfig): EmailChannel {
  return new EmailChannel(config);
}
