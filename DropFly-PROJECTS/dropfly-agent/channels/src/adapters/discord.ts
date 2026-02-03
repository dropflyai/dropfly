/**
 * Discord Adapter — uses Discord.js to receive/send messages.
 *
 * Setup:
 *   1. Create a Discord app at discord.com/developers
 *   2. Add bot, enable Message Content Intent
 *   3. Invite to server with: messages.read, messages.send scopes
 *   4. Set DISCORD_BOT_TOKEN and DISCORD_APPLICATION_ID
 *
 * The bot responds to:
 *   - DMs (always)
 *   - Channel messages that @mention the bot
 *   - Messages in channels named "dropfly" or "builder"
 */

import { Client, GatewayIntentBits, Partials, Events } from "discord.js";
import type { ChannelAdapter, InboundMessage } from "../core/types.js";
import type { GatewayClient } from "../core/gateway-client.js";
import { chunkMessage } from "../utils/text.js";
import { logger } from "../utils/logger.js";

/** Channel names the bot listens to without requiring @mention */
const AUTO_CHANNELS = new Set(["dropfly", "builder", "ai-builder"]);

export class DiscordAdapter implements ChannelAdapter {
  readonly name = "discord" as const;
  readonly enabled: boolean;

  private client: Client | null = null;
  private gateway: GatewayClient;
  private token: string;

  constructor(gateway: GatewayClient) {
    this.gateway = gateway;
    this.token = process.env.DISCORD_BOT_TOKEN ?? "";
    this.enabled = !!this.token;
  }

  async start(): Promise<void> {
    if (!this.enabled) {
      logger.info("Discord adapter disabled (missing DISCORD_BOT_TOKEN)");
      return;
    }

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
      ],
      partials: [Partials.Channel],  // Needed for DMs
    });

    this.client.once(Events.ClientReady, (c) => {
      logger.info({ user: c.user.tag }, "Discord bot connected");
    });

    this.client.on(Events.MessageCreate, async (discordMsg) => {
      // Ignore bot messages
      if (discordMsg.author.bot) return;

      const isDM = !discordMsg.guild;
      const isMentioned = discordMsg.mentions.has(this.client!.user!);
      const isAutoChannel =
        "name" in discordMsg.channel &&
        AUTO_CHANNELS.has((discordMsg.channel as { name: string }).name);

      // Only respond to DMs, @mentions, or auto-channels
      if (!isDM && !isMentioned && !isAutoChannel) return;

      // Clean up text (remove @mention)
      let text = discordMsg.content;
      if (isMentioned && this.client?.user) {
        text = text.replace(new RegExp(`<@!?${this.client.user.id}>`, "g"), "").trim();
      }

      if (!text) return;

      const message: InboundMessage = {
        messageId: discordMsg.id,
        channel: "discord",
        userId: discordMsg.author.id,
        userName: discordMsg.author.displayName ?? discordMsg.author.username,
        text,
        conversationId: discordMsg.channel.id,
        timestamp: discordMsg.createdAt,
        raw: discordMsg,
      };

      // Handle attachments
      if (discordMsg.attachments.size > 0) {
        message.attachments = discordMsg.attachments.map((a) => ({
          type: this.attachmentType(a.contentType ?? ""),
          url: a.url,
          name: a.name ?? undefined,
          mimeType: a.contentType ?? undefined,
        }));
      }

      logger.info(
        { from: message.userName, text: message.text.slice(0, 50), isDM },
        "Discord message received"
      );

      // Handle commands
      if (text.toLowerCase().trim() === "!new") {
        this.gateway.clearSession("discord", message.conversationId);
        await discordMsg.reply("Session cleared. Send your next message to start fresh.");
        return;
      }

      if (text.toLowerCase().trim() === "!status") {
        const sessionId = this.gateway.getSession("discord", message.conversationId);
        await discordMsg.reply(
          sessionId
            ? `Active session: \`${sessionId}\``
            : "No active session. Send a message to start a new build."
        );
        return;
      }

      // Show typing indicator
      await discordMsg.channel.sendTyping();

      // Forward to gateway
      const response = await this.gateway.sendMessage(message);

      // Reply (chunked for Discord's 2000 char limit)
      const chunks = chunkMessage(response.text, "discord");
      for (let i = 0; i < chunks.length; i++) {
        if (i === 0) {
          await discordMsg.reply(chunks[i]);
        } else {
          await discordMsg.channel.send(chunks[i]);
        }
      }
    });

    await this.client.login(this.token);
    logger.info("Discord adapter started");
  }

  async stop(): Promise<void> {
    await this.client?.destroy();
  }

  private attachmentType(contentType: string): "image" | "file" | "audio" | "video" {
    if (contentType.startsWith("image/")) return "image";
    if (contentType.startsWith("audio/")) return "audio";
    if (contentType.startsWith("video/")) return "video";
    return "file";
  }
}
