/**
 * Telegram Channel Adapter
 *
 * Enables X2000 communication via Telegram.
 * Direct implementation using Telegram Bot API with native fetch.
 *
 * Features:
 * - Text, photos, documents, voice, video messages
 * - Inline keyboards and reply keyboards
 * - Webhook and long-polling modes
 * - Group and channel support
 * - Message editing and deletion
 * - Bot commands (/start, /help, /status)
 * - Rate limiting with exponential backoff
 * - Retry logic with configurable attempts
 * - MarkdownV2 formatting support
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
import { rateLimitManager } from '../rate-limiter.js';

// ============================================================================
// Types
// ============================================================================

export interface TelegramChannelConfig extends Partial<ChannelConfig> {
  botToken?: string;
  useWebhook?: boolean;
  webhookUrl?: string;
  webhookSecret?: string;
  webhookPort?: number;
  allowedChats?: string[];
  allowedUsers?: string[];
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  // Rate limiting
  enableRateLimiting?: boolean;
  // Retry configuration
  maxRetries?: number;
  retryDelayMs?: number;
  // Command handlers
  enableDefaultCommands?: boolean;
  customCommands?: Map<string, CommandHandler>;
  // Bot info
  botName?: string;
  botDescription?: string;
}

/**
 * Command handler function type
 */
export type CommandHandler = (
  message: TelegramMessage,
  args: string[],
  channel: TelegramChannel
) => Promise<string | TelegramResponsePayload>;

/**
 * Telegram response payload for complex messages
 */
export interface TelegramResponsePayload {
  text: string;
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  replyMarkup?: TelegramReplyMarkup;
  disableNotification?: boolean;
  protectContent?: boolean;
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
 * Custom error class for Telegram API errors
 */
export class TelegramAPIError extends Error {
  constructor(
    message: string,
    public readonly errorCode?: number,
    public readonly retryAfter?: number
  ) {
    super(message);
    this.name = 'TelegramAPIError';
  }
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
  private webhookPort: number;
  private allowedChats: string[] | null;
  private allowedUsers: string[] | null;
  private parseMode: 'HTML' | 'Markdown' | 'MarkdownV2';
  private botInfo: TelegramUser | null = null;
  private pollingInterval: ReturnType<typeof setInterval> | null = null;
  private lastUpdateId: number = 0;

  // Rate limiting
  private enableRateLimiting: boolean;
  private rateLimitKey: string;

  // Retry configuration
  private maxRetries: number;
  private retryDelayMs: number;

  // Command system
  private enableDefaultCommands: boolean;
  private commands: Map<string, CommandHandler> = new Map();
  private botName: string;
  private botDescription: string;

  // Metrics
  private metrics = {
    messagesSent: 0,
    messagesReceived: 0,
    commandsProcessed: 0,
    errors: 0,
    retries: 0,
    rateLimitHits: 0,
  };

  constructor(config: TelegramChannelConfig = {}) {
    super(config);
    this.initializeConfig();

    this.botToken = config.botToken || process.env.TELEGRAM_BOT_TOKEN || null;
    this.useWebhook = config.useWebhook ?? false;
    this.webhookUrl = config.webhookUrl || process.env.TELEGRAM_WEBHOOK_URL || null;
    this.webhookSecret = config.webhookSecret || process.env.TELEGRAM_WEBHOOK_SECRET || null;
    this.webhookPort = config.webhookPort || parseInt(process.env.TELEGRAM_WEBHOOK_PORT || '3000', 10);
    this.allowedChats = config.allowedChats || null;
    this.allowedUsers = config.allowedUsers || null;
    this.parseMode = config.parseMode || 'MarkdownV2';

    // Rate limiting
    this.enableRateLimiting = config.enableRateLimiting ?? true;
    this.rateLimitKey = `telegram-${uuidv4().slice(0, 8)}`;

    // Retry configuration
    this.maxRetries = config.maxRetries ?? 3;
    this.retryDelayMs = config.retryDelayMs ?? 1000;

    // Commands
    this.enableDefaultCommands = config.enableDefaultCommands ?? true;
    this.botName = config.botName || 'X2000 Bot';
    this.botDescription = config.botDescription || 'Autonomous Business-Building AI Fleet';

    // Register custom commands
    if (config.customCommands) {
      for (const [name, handler] of config.customCommands) {
        this.commands.set(name.toLowerCase(), handler);
      }
    }

    // Register default commands
    if (this.enableDefaultCommands) {
      this.registerDefaultCommands();
    }
  }

  /**
   * Register default bot commands
   */
  private registerDefaultCommands(): void {
    // /start command
    this.commands.set('start', async (_message, _args, _channel) => {
      return {
        text: this.escapeMarkdownV2(`Welcome to ${this.botName}!\n\n` +
          `${this.botDescription}\n\n` +
          `Available commands:\n` +
          `/start - Show this welcome message\n` +
          `/help - Get help and command list\n` +
          `/status - Check bot status\n\n` +
          `Send me a message and I'll process it through the X2000 AI system.`),
        parseMode: 'MarkdownV2',
      };
    });

    // /help command
    this.commands.set('help', async (_message, _args, _channel) => {
      const commandList = Array.from(this.commands.keys())
        .map(cmd => `/${cmd}`)
        .join(', ');

      return {
        text: this.escapeMarkdownV2(`*${this.botName} Help*\n\n` +
          `*Commands:*\n` +
          `/start - Welcome message and introduction\n` +
          `/help - This help message\n` +
          `/status - Bot status and statistics\n\n` +
          `*Messaging:*\n` +
          `- Send any text message to interact with X2000\n` +
          `- Images, documents, and voice messages are supported\n` +
          `- Reply to messages to maintain context\n\n` +
          `*Available commands:* ${commandList}`),
        parseMode: 'MarkdownV2',
      };
    });

    // /status command
    this.commands.set('status', async (_message, _args, channel) => {
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      return {
        text: this.escapeMarkdownV2(`*${this.botName} Status*\n\n` +
          `*Connection:* ${channel.connected ? '✅ Connected' : '❌ Disconnected'}\n` +
          `*Mode:* ${channel.useWebhook ? 'Webhook' : 'Polling'}\n` +
          `*Uptime:* ${hours}h ${minutes}m ${seconds}s\n\n` +
          `*Statistics:*\n` +
          `- Messages Sent: ${channel.metrics.messagesSent}\n` +
          `- Messages Received: ${channel.metrics.messagesReceived}\n` +
          `- Commands Processed: ${channel.metrics.commandsProcessed}\n` +
          `- Errors: ${channel.metrics.errors}\n` +
          `- Retries: ${channel.metrics.retries}\n` +
          `- Rate Limit Hits: ${channel.metrics.rateLimitHits}\n\n` +
          `*Bot Info:*\n` +
          `- Username: @${channel.botInfo?.username || 'unknown'}\n` +
          `- Bot ID: ${channel.botInfo?.id || 'unknown'}`),
        parseMode: 'MarkdownV2',
      };
    });
  }

  /**
   * Register a custom command handler
   */
  registerCommand(name: string, handler: CommandHandler): void {
    this.commands.set(name.toLowerCase(), handler);
  }

  /**
   * Unregister a command
   */
  unregisterCommand(name: string): boolean {
    return this.commands.delete(name.toLowerCase());
  }

  /**
   * Escape text for MarkdownV2 format
   */
  private escapeMarkdownV2(text: string): string {
    // Characters that need escaping in MarkdownV2
    const escapeChars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
    let result = text;
    for (const char of escapeChars) {
      result = result.split(char).join(`\\${char}`);
    }
    return result;
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
      // Get bot info with retry
      const me = await this.telegramAPIWithRetry<TelegramUser>('getMe');
      this.botInfo = me;
      this.connected = true;
      console.log(`[Telegram] Connected as @${me.username} (${me.id})`);

      // Set bot commands
      await this.setBotCommands();

      // Setup webhook or start polling
      if (this.useWebhook && this.webhookUrl) {
        await this.setupWebhook();
      } else {
        this.startPolling();
      }
    } catch (error) {
      console.error('[Telegram] Failed to initialize:', error);
      this.connected = false;
      this.metrics.errors++;
      throw error;
    }
  }

  /**
   * Set bot commands in Telegram
   */
  private async setBotCommands(): Promise<void> {
    const commands = [
      { command: 'start', description: 'Start the bot and see welcome message' },
      { command: 'help', description: 'Get help and list of commands' },
      { command: 'status', description: 'Check bot status and statistics' },
    ];

    // Add any custom commands
    for (const cmd of this.commands.keys()) {
      if (!['start', 'help', 'status'].includes(cmd)) {
        commands.push({
          command: cmd,
          description: `Custom command: ${cmd}`,
        });
      }
    }

    try {
      await this.telegramAPIWithRetry('setMyCommands', { commands });
      console.log('[Telegram] Bot commands registered');
    } catch (error) {
      console.warn('[Telegram] Failed to set bot commands:', error);
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
    this.metrics.messagesReceived++;

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

    const text = message.text || message.caption || '';

    // Check for commands
    if (text.startsWith('/')) {
      const commandResponse = await this.handleCommand(message, text);
      if (commandResponse) {
        return commandResponse;
      }
    }

    // Build attachments from message content
    const attachments: ChannelMessage['attachments'] = [];

    if (message.photo && message.photo.length > 0) {
      const largestPhoto = message.photo[message.photo.length - 1];
      try {
        attachments.push({
          type: 'image',
          name: 'photo.jpg',
          url: await this.getFileUrl(largestPhoto.file_id),
        });
      } catch (error) {
        console.warn('[Telegram] Failed to get photo URL:', error);
      }
    }

    if (message.document) {
      try {
        attachments.push({
          type: 'file',
          name: message.document.file_name || 'document',
          url: await this.getFileUrl(message.document.file_id),
          mimeType: message.document.mime_type,
        });
      } catch (error) {
        console.warn('[Telegram] Failed to get document URL:', error);
      }
    }

    if (message.video) {
      try {
        attachments.push({
          type: 'file',
          name: message.video.file_name || 'video.mp4',
          url: await this.getFileUrl(message.video.file_id),
          mimeType: message.video.mime_type || 'video/mp4',
        });
      } catch (error) {
        console.warn('[Telegram] Failed to get video URL:', error);
      }
    }

    if (message.voice) {
      try {
        attachments.push({
          type: 'file',
          name: 'voice.ogg',
          url: await this.getFileUrl(message.voice.file_id),
          mimeType: message.voice.mime_type || 'audio/ogg',
        });
      } catch (error) {
        console.warn('[Telegram] Failed to get voice URL:', error);
      }
    }

    if (message.audio) {
      try {
        attachments.push({
          type: 'file',
          name: message.audio.file_name || 'audio.mp3',
          url: await this.getFileUrl(message.audio.file_id),
          mimeType: message.audio.mime_type || 'audio/mpeg',
        });
      } catch (error) {
        console.warn('[Telegram] Failed to get audio URL:', error);
      }
    }

    // Create channel message
    const channelMessage: ChannelMessage = {
      id: message.message_id.toString(),
      channelType: this.type,
      channelId: message.chat.id.toString(),
      userId: message.from?.id.toString() || 'unknown',
      content: text,
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
   * Handle bot commands
   */
  private async handleCommand(
    message: TelegramMessage,
    text: string
  ): Promise<ChannelResponse | null> {
    // Parse command and arguments
    const parts = text.split(/\s+/);
    let commandName = parts[0].slice(1).toLowerCase(); // Remove leading /

    // Handle commands with @botname suffix (e.g., /start@mybot)
    if (commandName.includes('@')) {
      commandName = commandName.split('@')[0];
    }

    const args = parts.slice(1);

    // Find handler
    const handler = this.commands.get(commandName);
    if (!handler) {
      return null; // Not a registered command, let normal processing handle it
    }

    this.metrics.commandsProcessed++;

    try {
      // Send typing indicator
      await this.sendTypingIndicator(message.chat.id);

      // Execute command handler
      const response = await handler(message, args, this);

      // Normalize response
      const payload: TelegramResponsePayload = typeof response === 'string'
        ? { text: response, parseMode: this.parseMode }
        : response;

      // Send response
      await this.sendMessageWithPayload(message.chat.id, payload, message.message_id);

      // Return null to indicate we handled it directly
      return null;
    } catch (error) {
      console.error(`[Telegram] Command /${commandName} failed:`, error);
      this.metrics.errors++;

      // Send error message
      try {
        await this.sendMessageWithPayload(message.chat.id, {
          text: `Sorry, an error occurred while processing /${commandName}. Please try again.`,
        });
      } catch {
        // Ignore error sending error message
      }

      return null;
    }
  }

  /**
   * Send a message with full payload
   */
  private async sendMessageWithPayload(
    chatId: number,
    payload: TelegramResponsePayload,
    replyToMessageId?: number
  ): Promise<void> {
    const params: Record<string, unknown> = {
      chat_id: chatId,
      text: this.formatMessage(payload.text),
    };

    if (payload.parseMode) {
      params.parse_mode = payload.parseMode;
    }

    if (replyToMessageId) {
      params.reply_to_message_id = replyToMessageId;
    }

    if (payload.replyMarkup) {
      params.reply_markup = payload.replyMarkup;
    }

    if (payload.disableNotification) {
      params.disable_notification = true;
    }

    if (payload.protectContent) {
      params.protect_content = true;
    }

    await this.telegramAPIWithRetry('sendMessage', params);
    this.metrics.messagesSent++;
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

    // Send typing indicator (don't wait, don't fail)
    this.sendTypingIndicator(chatId).catch(() => {});

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

    await this.telegramAPIWithRetry('sendMessage', payload);
    this.metrics.messagesSent++;
    console.log(`[Telegram] Sent message to ${channelId}`);

    // Send attachments separately
    if (response.attachments && response.attachments.length > 0) {
      for (const attachment of response.attachments) {
        try {
          await this.sendAttachment(chatId, attachment);
        } catch (error) {
          console.warn(`[Telegram] Failed to send attachment ${attachment.name}:`, error);
        }
      }
    }
  }

  /**
   * Send message directly (public method for external use)
   */
  async sendMessage(chatId: string | number, content: string, options?: {
    parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
    replyToMessageId?: number;
    replyMarkup?: TelegramReplyMarkup;
    disableNotification?: boolean;
  }): Promise<{ messageId: number }> {
    if (!this.connected || !this.botToken) {
      throw new Error('Telegram channel not connected');
    }

    const numericChatId = typeof chatId === 'string' ? parseInt(chatId, 10) : chatId;

    const payload: Record<string, unknown> = {
      chat_id: numericChatId,
      text: this.formatMessage(content),
      parse_mode: options?.parseMode || this.parseMode,
    };

    if (options?.replyToMessageId) {
      payload.reply_to_message_id = options.replyToMessageId;
    }

    if (options?.replyMarkup) {
      payload.reply_markup = options.replyMarkup;
    }

    if (options?.disableNotification) {
      payload.disable_notification = true;
    }

    const result = await this.telegramAPIWithRetry<TelegramMessage>('sendMessage', payload);
    this.metrics.messagesSent++;

    return { messageId: result.message_id };
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

    await this.telegramAPIWithRetry(method, payload);
    this.metrics.messagesSent++;
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
    try {
      await this.telegramAPI('sendChatAction', {
        chat_id: chatId,
        action: 'typing',
      });
    } catch {
      // Typing indicator is not critical, ignore errors
    }
  }

  /**
   * Edit a message
   */
  async editMessage(
    chatId: string,
    messageId: string,
    newContent: string,
    options?: { parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2'; replyMarkup?: TelegramReplyMarkup }
  ): Promise<void> {
    const payload: Record<string, unknown> = {
      chat_id: parseInt(chatId, 10),
      message_id: parseInt(messageId, 10),
      text: this.formatMessage(newContent),
      parse_mode: options?.parseMode || this.parseMode,
    };

    if (options?.replyMarkup) {
      payload.reply_markup = options.replyMarkup;
    }

    await this.telegramAPIWithRetry('editMessageText', payload);
  }

  /**
   * Delete a message
   */
  async deleteMessage(chatId: string, messageId: string): Promise<void> {
    await this.telegramAPIWithRetry('deleteMessage', {
      chat_id: parseInt(chatId, 10),
      message_id: parseInt(messageId, 10),
    });
  }

  /**
   * Answer a callback query (inline button press)
   */
  async answerCallbackQuery(
    callbackQueryId: string,
    options?: { text?: string; showAlert?: boolean; url?: string }
  ): Promise<void> {
    const payload: Record<string, unknown> = {
      callback_query_id: callbackQueryId,
    };

    if (options?.text) {
      payload.text = options.text;
    }
    if (options?.showAlert) {
      payload.show_alert = true;
    }
    if (options?.url) {
      payload.url = options.url;
    }

    await this.telegramAPIWithRetry('answerCallbackQuery', payload);
  }

  /**
   * Get bot metrics
   */
  getMetrics(): typeof this.metrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      messagesSent: 0,
      messagesReceived: 0,
      commandsProcessed: 0,
      errors: 0,
      retries: 0,
      rateLimitHits: 0,
    };
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
   * Make a Telegram Bot API call with rate limiting and retry support
   */
  private async telegramAPIWithRetry<T = Record<string, unknown>>(
    method: string,
    params?: Record<string, unknown>
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        // Check rate limit
        if (this.enableRateLimiting) {
          const acquired = await rateLimitManager.acquireWithWait(
            'telegram',
            this.rateLimitKey,
            5000 // Max 5 second wait
          );

          if (!acquired) {
            this.metrics.rateLimitHits++;
            throw new Error('Rate limited - could not acquire token');
          }
        }

        // Make API call
        const result = await this.telegramAPI<T>(method, params);

        // Reset backoff on success
        if (this.enableRateLimiting) {
          rateLimitManager.resetBackoff('telegram', this.rateLimitKey);
        }

        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Check if rate limited by Telegram
        if (this.isRateLimitError(lastError)) {
          const retryAfter = this.extractRetryAfter(lastError);
          if (this.enableRateLimiting) {
            rateLimitManager.handleRateLimited('telegram', retryAfter, this.rateLimitKey);
          }
          this.metrics.rateLimitHits++;
        }

        // Don't retry on non-retryable errors
        if (!this.isRetryableError(lastError)) {
          throw lastError;
        }

        // Wait before retry with exponential backoff
        if (attempt < this.maxRetries) {
          this.metrics.retries++;
          const delay = this.retryDelayMs * Math.pow(2, attempt);
          const jitter = Math.random() * delay * 0.1; // 10% jitter
          await this.sleep(delay + jitter);
          console.log(`[Telegram] Retrying ${method} (attempt ${attempt + 2}/${this.maxRetries + 1})`);
        }
      }
    }

    this.metrics.errors++;
    throw lastError || new Error(`Failed after ${this.maxRetries + 1} attempts`);
  }

  /**
   * Make a raw Telegram Bot API call (no retry)
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

    const data = await response.json() as {
      ok: boolean;
      result: T;
      description?: string;
      error_code?: number;
      parameters?: { retry_after?: number };
    };

    if (!data.ok) {
      const error = new TelegramAPIError(
        data.description || 'Unknown error',
        data.error_code,
        data.parameters?.retry_after
      );
      throw error;
    }

    return data.result;
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();
    // Retry on network errors, timeouts, and rate limits
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('econnreset') ||
      message.includes('enotfound') ||
      message.includes('429') ||
      message.includes('too many requests') ||
      message.includes('rate limit') ||
      message.includes('retry_after') ||
      (error instanceof TelegramAPIError && error.errorCode === 429)
    );
  }

  /**
   * Check if error is rate limit
   */
  private isRateLimitError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return (
      message.includes('429') ||
      message.includes('too many requests') ||
      message.includes('rate limit') ||
      (error instanceof TelegramAPIError && error.errorCode === 429)
    );
  }

  /**
   * Extract retry_after from error
   */
  private extractRetryAfter(error: Error): number {
    if (error instanceof TelegramAPIError && error.retryAfter) {
      return error.retryAfter;
    }

    const match = error.message.match(/retry.?after[:\s]+(\d+)/i);
    if (match) {
      return parseInt(match[1], 10);
    }

    return 1; // Default 1 second
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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

/**
 * Create a new Telegram channel instance
 */
export function createTelegramChannel(config?: TelegramChannelConfig): TelegramChannel {
  return new TelegramChannel(config);
}

/**
 * Start the Telegram channel (alias for initialize + register)
 */
export async function startTelegramBot(config?: TelegramChannelConfig): Promise<TelegramChannel> {
  const channel = new TelegramChannel(config);
  await channel.initialize();
  ChannelRegistry.register(channel);
  return channel;
}

/**
 * Stop the Telegram channel
 */
export async function stopTelegramBot(channel?: TelegramChannel): Promise<void> {
  const target = channel || telegramChannel;
  await target.shutdown();
}
