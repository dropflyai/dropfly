/**
 * Telegram Channel Adapter
 *
 * Enables X2000 communication via Telegram.
 * Uses grammY library for Telegram Bot API integration.
 *
 * Features:
 * - Text, photos, documents, voice, video messages
 * - Inline keyboards and reply keyboards
 * - Webhook and long-polling modes
 * - Group and channel support
 * - Message editing and deletion
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

export interface TelegramChannelConfig extends Partial<ChannelConfig> {
  botToken?: string;
  useWebhook?: boolean;
  webhookUrl?: string;
  webhookSecret?: string;
  allowedChats?: string[];
  allowedUsers?: string[];
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
}

/**
 * Telegram Update object (from Bot API)
 */
interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

/**
 * Telegram Message object
 */
interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
  caption?: string;
  reply_to_message?: TelegramMessage;
  photo?: TelegramPhotoSize[];
  document?: TelegramDocument;
  video?: TelegramVideo;
  voice?: TelegramVoice;
  audio?: TelegramAudio;
  location?: TelegramLocation;
  contact?: TelegramContact;
  reply_markup?: TelegramReplyMarkup;
}

interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
}

interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

interface TelegramPhotoSize {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  file_size?: number;
}

interface TelegramDocument {
  file_id: string;
  file_unique_id: string;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
}

interface TelegramVideo {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  duration: number;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
}

interface TelegramVoice {
  file_id: string;
  file_unique_id: string;
  duration: number;
  mime_type?: string;
  file_size?: number;
}

interface TelegramAudio {
  file_id: string;
  file_unique_id: string;
  duration: number;
  performer?: string;
  title?: string;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
}

interface TelegramLocation {
  longitude: number;
  latitude: number;
}

interface TelegramContact {
  phone_number: string;
  first_name: string;
  last_name?: string;
  user_id?: number;
}

interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  data?: string;
}

interface TelegramReplyMarkup {
  inline_keyboard?: TelegramInlineKeyboardButton[][];
  keyboard?: TelegramKeyboardButton[][];
  remove_keyboard?: boolean;
  one_time_keyboard?: boolean;
}

interface TelegramInlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
}

interface TelegramKeyboardButton {
  text: string;
  request_contact?: boolean;
  request_location?: boolean;
}

/**
 * Platform capabilities for Telegram
 */
export const TELEGRAM_CAPABILITIES = {
  supportsMarkdown: true,
  supportsHTML: true,
  supportsRichText: false,
  maxMessageLength: 4096,
  supportsThreads: false,
  supportsReplies: true,
  supportsFiles: true,
  supportsImages: true,
  supportsVoice: true,
  supportsVideo: true,
  supportsLocation: true,
  maxAttachmentSize: 50 * 1024 * 1024, // 50MB
  supportsReactions: true,
  supportsButtons: true,
  supportsCards: false,
  supportsTypingIndicator: true,
  supportsReadReceipts: false,
  supportsMessageEdit: true,
  supportsMessageDelete: true,
  supportsE2EEncryption: false,
  supportsDisappearingMessages: true,
};

// ============================================================================
// Telegram Channel
// ============================================================================

export class TelegramChannel extends BaseChannel {
  readonly type = 'telegram';
  readonly name = 'Telegram';
  readonly capabilities = TELEGRAM_CAPABILITIES;

  private botToken: string | null;
  private useWebhook: boolean;
  private webhookUrl: string | null;
  private webhookSecret: string | null;
  private allowedChats: string[] | null;
  private allowedUsers: string[] | null;
  private parseMode: 'HTML' | 'Markdown' | 'MarkdownV2';
  private botInfo: TelegramUser | null = null;
  private pollingInterval: ReturnType<typeof setInterval> | null = null;
  private lastUpdateId: number = 0;

  constructor(config: TelegramChannelConfig = {}) {
    super(config);
    this.initializeConfig();

    this.botToken = config.botToken || process.env.TELEGRAM_BOT_TOKEN || null;
    this.useWebhook = config.useWebhook ?? false;
    this.webhookUrl = config.webhookUrl || process.env.TELEGRAM_WEBHOOK_URL || null;
    this.webhookSecret = config.webhookSecret || process.env.TELEGRAM_WEBHOOK_SECRET || null;
    this.allowedChats = config.allowedChats || null;
    this.allowedUsers = config.allowedUsers || null;
    this.parseMode = config.parseMode || 'HTML';
  }

  /**
   * Initialize Telegram connection
   */
  async initialize(): Promise<void> {
    if (!this.botToken) {
      console.warn('[Telegram] No bot token configured, channel disabled');
      this.config.enabled = false;
      return;
    }

    try {
      // Get bot info
      const me = await this.telegramAPI<TelegramUser>('getMe');
      this.botInfo = me;
      this.connected = true;
      console.log(`[Telegram] Connected as @${me.username} (${me.id})`);

      // Setup webhook or start polling
      if (this.useWebhook && this.webhookUrl) {
        await this.setupWebhook();
      } else {
        this.startPolling();
      }
    } catch (error) {
      console.error('[Telegram] Failed to initialize:', error);
      this.connected = false;
      throw error;
    }
  }

  /**
   * Setup webhook for receiving updates
   */
  private async setupWebhook(): Promise<void> {
    if (!this.webhookUrl) {
      throw new Error('Webhook URL is required for webhook mode');
    }

    const params: Record<string, unknown> = {
      url: this.webhookUrl,
      allowed_updates: ['message', 'edited_message', 'callback_query'],
    };

    if (this.webhookSecret) {
      params.secret_token = this.webhookSecret;
    }

    await this.telegramAPI('setWebhook', params);
    console.log(`[Telegram] Webhook set to ${this.webhookUrl}`);
  }

  /**
   * Start long-polling for updates
   */
  private startPolling(): void {
    console.log('[Telegram] Starting long-polling');

    const poll = async () => {
      if (!this.connected) return;

      try {
        const updates = await this.telegramAPI<TelegramUpdate[]>('getUpdates', {
          offset: this.lastUpdateId + 1,
          timeout: 30,
          allowed_updates: ['message', 'edited_message', 'callback_query'],
        });

        for (const update of updates) {
          this.lastUpdateId = update.update_id;
          await this.handleUpdate(update);
        }
      } catch (error) {
        console.error('[Telegram] Polling error:', error);
      }

      // Schedule next poll
      if (this.connected) {
        this.pollingInterval = setTimeout(poll, 100);
      }
    };

    poll();
  }

  /**
   * Handle an incoming update
   */
  async handleUpdate(update: TelegramUpdate): Promise<ChannelResponse | null> {
    if (update.message) {
      return this.handleMessage(update.message);
    } else if (update.edited_message) {
      return this.handleMessage(update.edited_message, true);
    } else if (update.callback_query) {
      return this.handleCallbackQuery(update.callback_query);
    }
    return null;
  }

  /**
   * Handle an incoming message
   */
  async handleMessage(
    message: TelegramMessage,
    isEdit: boolean = false
  ): Promise<ChannelResponse | null> {
    // Ignore bot's own messages
    if (message.from?.is_bot && message.from.id === this.botInfo?.id) {
      return null;
    }

    // Check chat allowlist
    if (this.allowedChats && !this.allowedChats.includes(message.chat.id.toString())) {
      return null;
    }

    // Check user allowlist
    if (this.allowedUsers && message.from && !this.allowedUsers.includes(message.from.id.toString())) {
      return null;
    }

    // Build attachments from message content
    const attachments: ChannelMessage['attachments'] = [];

    if (message.photo && message.photo.length > 0) {
      const largestPhoto = message.photo[message.photo.length - 1];
      attachments.push({
        type: 'image',
        name: 'photo.jpg',
        url: await this.getFileUrl(largestPhoto.file_id),
      });
    }

    if (message.document) {
      attachments.push({
        type: 'file',
        name: message.document.file_name || 'document',
        url: await this.getFileUrl(message.document.file_id),
        mimeType: message.document.mime_type,
      });
    }

    if (message.video) {
      attachments.push({
        type: 'file',
        name: message.video.file_name || 'video.mp4',
        url: await this.getFileUrl(message.video.file_id),
        mimeType: message.video.mime_type || 'video/mp4',
      });
    }

    if (message.voice) {
      attachments.push({
        type: 'file',
        name: 'voice.ogg',
        url: await this.getFileUrl(message.voice.file_id),
        mimeType: message.voice.mime_type || 'audio/ogg',
      });
    }

    if (message.audio) {
      attachments.push({
        type: 'file',
        name: message.audio.file_name || 'audio.mp3',
        url: await this.getFileUrl(message.audio.file_id),
        mimeType: message.audio.mime_type || 'audio/mpeg',
      });
    }

    // Create channel message
    const channelMessage: ChannelMessage = {
      id: message.message_id.toString(),
      channelType: this.type,
      channelId: message.chat.id.toString(),
      userId: message.from?.id.toString() || 'unknown',
      content: message.text || message.caption || '',
      timestamp: new Date(message.date * 1000),
      replyToId: message.reply_to_message?.message_id.toString(),
      metadata: {
        messageId: message.message_id,
        chatType: message.chat.type,
        chatTitle: message.chat.title,
        username: message.from?.username,
        firstName: message.from?.first_name,
        lastName: message.from?.last_name,
        isEdit,
        location: message.location,
        contact: message.contact,
      },
      attachments,
    };

    return this.processMessage(channelMessage);
  }

  /**
   * Handle callback query (button press)
   */
  async handleCallbackQuery(query: TelegramCallbackQuery): Promise<ChannelResponse | null> {
    // Answer the callback query to remove loading state
    await this.telegramAPI('answerCallbackQuery', { callback_query_id: query.id });

    if (!query.message) return null;

    const channelMessage: ChannelMessage = {
      id: `callback-${query.id}`,
      channelType: this.type,
      channelId: query.message.chat.id.toString(),
      userId: query.from.id.toString(),
      content: query.data || '',
      timestamp: new Date(),
      metadata: {
        isCallback: true,
        callbackId: query.id,
        originalMessageId: query.message.message_id,
        username: query.from.username,
      },
    };

    return this.processMessage(channelMessage);
  }

  /**
   * Shutdown Telegram connection
   */
  async shutdown(): Promise<void> {
    this.connected = false;

    if (this.pollingInterval) {
      clearTimeout(this.pollingInterval);
      this.pollingInterval = null;
    }

    if (this.useWebhook) {
      await this.telegramAPI('deleteWebhook');
    }

    console.log('[Telegram] Disconnected');
  }

  /**
   * Send a message to Telegram
   */
  async send(
    channelId: string,
    response: ChannelResponse,
    context?: Partial<ChannelContext>
  ): Promise<void> {
    if (!this.connected || !this.botToken) {
      throw new Error('Telegram channel not connected');
    }

    const chatId = parseInt(channelId, 10);

    // Send typing indicator
    await this.sendTypingIndicator(chatId);

    // Build message payload
    const payload: Record<string, unknown> = {
      chat_id: chatId,
      text: this.formatMessage(response.content),
      parse_mode: this.parseMode,
    };

    // Reply to message if context has replyToId
    if (context?.metadata?.messageId) {
      payload.reply_to_message_id = context.metadata.messageId;
    }

    // Add inline keyboard if response has metadata with buttons
    if (response.metadata?.buttons && Array.isArray(response.metadata.buttons)) {
      payload.reply_markup = {
        inline_keyboard: this.buildInlineKeyboard(response.metadata.buttons as Array<{
          text: string;
          url?: string;
          callback_data?: string;
        }>),
      };
    }

    await this.telegramAPI('sendMessage', payload);
    console.log(`[Telegram] Sent message to ${channelId}`);

    // Send attachments separately
    if (response.attachments && response.attachments.length > 0) {
      for (const attachment of response.attachments) {
        await this.sendAttachment(chatId, attachment);
      }
    }
  }

  /**
   * Send an attachment to a chat
   */
  private async sendAttachment(
    chatId: number,
    attachment: NonNullable<ChannelResponse['attachments']>[number]
  ): Promise<void> {
    const method = attachment.type === 'image' ? 'sendPhoto' : 'sendDocument';
    const fileKey = attachment.type === 'image' ? 'photo' : 'document';

    const payload: Record<string, unknown> = {
      chat_id: chatId,
      [fileKey]: attachment.url || attachment.data,
      caption: attachment.name,
    };

    await this.telegramAPI(method, payload);
  }

  /**
   * Build inline keyboard from button array
   */
  private buildInlineKeyboard(
    buttons: Array<{ text: string; url?: string; callback_data?: string }>
  ): TelegramInlineKeyboardButton[][] {
    // Create rows with max 3 buttons each
    const rows: TelegramInlineKeyboardButton[][] = [];
    let currentRow: TelegramInlineKeyboardButton[] = [];

    for (const button of buttons) {
      currentRow.push({
        text: button.text,
        url: button.url,
        callback_data: button.callback_data,
      });

      if (currentRow.length >= 3) {
        rows.push(currentRow);
        currentRow = [];
      }
    }

    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    return rows;
  }

  /**
   * Send typing indicator
   */
  async sendTypingIndicator(chatId: number): Promise<void> {
    await this.telegramAPI('sendChatAction', {
      chat_id: chatId,
      action: 'typing',
    });
  }

  /**
   * Edit a message
   */
  async editMessage(
    chatId: string,
    messageId: string,
    newContent: string
  ): Promise<void> {
    await this.telegramAPI('editMessageText', {
      chat_id: parseInt(chatId, 10),
      message_id: parseInt(messageId, 10),
      text: this.formatMessage(newContent),
      parse_mode: this.parseMode,
    });
  }

  /**
   * Delete a message
   */
  async deleteMessage(chatId: string, messageId: string): Promise<void> {
    await this.telegramAPI('deleteMessage', {
      chat_id: parseInt(chatId, 10),
      message_id: parseInt(messageId, 10),
    });
  }

  /**
   * Get file URL from file_id
   */
  private async getFileUrl(fileId: string): Promise<string> {
    const file = await this.telegramAPI<{ file_path: string }>('getFile', { file_id: fileId });
    return `https://api.telegram.org/file/bot${this.botToken}/${file.file_path}`;
  }

  /**
   * Format message for Telegram (handle length limits)
   */
  private formatMessage(text: string): string {
    const MAX_LENGTH = 4096;

    if (text.length <= MAX_LENGTH) {
      return text;
    }

    // Truncate with ellipsis
    return text.substring(0, MAX_LENGTH - 20) + '\n\n... [truncated]';
  }

  /**
   * Make a Telegram Bot API call
   */
  private async telegramAPI<T = Record<string, unknown>>(
    method: string,
    params?: Record<string, unknown>
  ): Promise<T> {
    const response = await fetch(`https://api.telegram.org/bot${this.botToken}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: params ? JSON.stringify(params) : undefined,
    });

    const data = await response.json() as { ok: boolean; result: T; description?: string };

    if (!data.ok) {
      throw new Error(`Telegram API error: ${data.description || 'Unknown error'}`);
    }

    return data.result;
  }

  /**
   * Get chat information
   */
  async getChatInfo(chatId: string): Promise<{
    id: number;
    type: string;
    title?: string;
    username?: string;
  } | null> {
    if (!this.connected) return null;

    try {
      return await this.telegramAPI<TelegramChat>('getChat', {
        chat_id: parseInt(chatId, 10),
      });
    } catch {
      return null;
    }
  }

  /**
   * Get chat member information
   */
  async getChatMember(chatId: string, userId: string): Promise<{
    status: string;
    user: TelegramUser;
  } | null> {
    if (!this.connected) return null;

    try {
      return await this.telegramAPI<{ status: string; user: TelegramUser }>('getChatMember', {
        chat_id: parseInt(chatId, 10),
        user_id: parseInt(userId, 10),
      });
    } catch {
      return null;
    }
  }
}

// ============================================================================
// Exports
// ============================================================================

export const telegramChannel = new TelegramChannel();

// Register with channel registry (only if configured)
if (process.env.TELEGRAM_BOT_TOKEN) {
  ChannelRegistry.register(telegramChannel);
}

export function createTelegramChannel(config?: TelegramChannelConfig): TelegramChannel {
  return new TelegramChannel(config);
}
