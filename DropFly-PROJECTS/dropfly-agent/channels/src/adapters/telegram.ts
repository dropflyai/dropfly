/**
 * Telegram Adapter — uses Telegraf to receive/send messages.
 *
 * Setup:
 *   1. Create a bot via @BotFather on Telegram
 *   2. Set TELEGRAM_BOT_TOKEN in .env
 *   3. The adapter uses long-polling (no webhook needed)
 */

import { Telegraf } from "telegraf";
import type { ChannelAdapter, InboundMessage } from "../core/types.js";
import type { GatewayClient } from "../core/gateway-client.js";
import { chunkMessage } from "../utils/text.js";
import { logger } from "../utils/logger.js";

export class TelegramAdapter implements ChannelAdapter {
  readonly name = "telegram" as const;
  readonly enabled: boolean;

  private bot: Telegraf | null = null;
  private gateway: GatewayClient;
  private token: string;

  constructor(gateway: GatewayClient) {
    this.gateway = gateway;
    this.token = process.env.TELEGRAM_BOT_TOKEN ?? "";
    this.enabled = !!this.token;
  }

  async start(): Promise<void> {
    if (!this.enabled) {
      logger.info("Telegram adapter disabled (missing TELEGRAM_BOT_TOKEN)");
      return;
    }

    this.bot = new Telegraf(this.token);

    // Handle /start command
    this.bot.start(async (ctx) => {
      await ctx.reply(
        "Welcome to DropFly Agent! Send me a message describing what you want to build, " +
          "and I'll get the team working on it.\n\n" +
          "Commands:\n" +
          "/new — Start a fresh session\n" +
          "/status — Check current build status"
      );
    });

    // Handle /new command
    this.bot.command("new", async (ctx) => {
      const chatId = ctx.chat.id.toString();
      this.gateway.clearSession("telegram", chatId);
      await ctx.reply("Session cleared. Send your next message to start fresh.");
    });

    // Handle /status command
    this.bot.command("status", async (ctx) => {
      const chatId = ctx.chat.id.toString();
      const sessionId = this.gateway.getSession("telegram", chatId);
      if (sessionId) {
        await ctx.reply(`Active session: ${sessionId}\nSend a message to continue.`);
      } else {
        await ctx.reply("No active session. Send a message to start a new build.");
      }
    });

    // Handle text messages
    this.bot.on("text", async (ctx) => {
      const msg = ctx.message;

      const message: InboundMessage = {
        messageId: msg.message_id.toString(),
        channel: "telegram",
        userId: msg.from.id.toString(),
        userName:
          msg.from.first_name +
          (msg.from.last_name ? ` ${msg.from.last_name}` : ""),
        text: msg.text,
        conversationId: ctx.chat.id.toString(),
        timestamp: new Date(msg.date * 1000),
        raw: msg,
      };

      logger.info(
        { from: message.userName, text: message.text.slice(0, 50) },
        "Telegram message received"
      );

      // Show typing indicator
      await ctx.sendChatAction("typing");

      // Forward to gateway
      const response = await this.gateway.sendMessage(message);

      // Reply (chunked if too long)
      const chunks = chunkMessage(response.text, "telegram");
      for (const chunk of chunks) {
        await ctx.reply(chunk, { parse_mode: "Markdown" }).catch(async () => {
          // Fall back to plain text if Markdown parsing fails
          await ctx.reply(chunk);
        });
      }
    });

    // Handle photos
    this.bot.on("photo", async (ctx) => {
      const photo = ctx.message.photo;
      const largest = photo[photo.length - 1];
      const fileLink = await ctx.telegram.getFileLink(largest.file_id);

      const message: InboundMessage = {
        messageId: ctx.message.message_id.toString(),
        channel: "telegram",
        userId: ctx.message.from.id.toString(),
        userName: ctx.message.from.first_name,
        text: ctx.message.caption ?? "[Image sent]",
        conversationId: ctx.chat.id.toString(),
        timestamp: new Date(ctx.message.date * 1000),
        attachments: [
          { type: "image", url: fileLink.href },
        ],
      };

      await ctx.sendChatAction("typing");
      const response = await this.gateway.sendMessage(message);
      await ctx.reply(response.text);
    });

    // Error handling
    this.bot.catch((err) => {
      logger.error({ err }, "Telegraf error");
    });

    // Launch with long polling
    this.bot.launch({ dropPendingUpdates: true });
    logger.info("Telegram adapter started (long polling)");
  }

  async stop(): Promise<void> {
    this.bot?.stop("SIGTERM");
  }
}
