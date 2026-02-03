/**
 * Slack Adapter — uses Slack Bolt SDK in socket mode.
 *
 * Setup:
 *   1. Create a Slack app at api.slack.com/apps
 *   2. Enable Socket Mode, add bot token scopes: chat:write, app_mentions:read, im:history
 *   3. Set SLACK_BOT_TOKEN, SLACK_APP_TOKEN, SLACK_SIGNING_SECRET
 */

import pkg from "@slack/bolt";
const { App: SlackApp } = pkg;

import type { ChannelAdapter, InboundMessage } from "../core/types.js";
import type { GatewayClient } from "../core/gateway-client.js";
import { chunkMessage } from "../utils/text.js";
import { logger } from "../utils/logger.js";

export class SlackAdapter implements ChannelAdapter {
  readonly name = "slack" as const;
  readonly enabled: boolean;

  private app: InstanceType<typeof SlackApp> | null = null;
  private gateway: GatewayClient;
  private botToken: string;
  private appToken: string;
  private signingSecret: string;

  constructor(gateway: GatewayClient) {
    this.gateway = gateway;
    this.botToken = process.env.SLACK_BOT_TOKEN ?? "";
    this.appToken = process.env.SLACK_APP_TOKEN ?? "";
    this.signingSecret = process.env.SLACK_SIGNING_SECRET ?? "";
    this.enabled = !!(this.botToken && this.appToken && this.signingSecret);
  }

  async start(): Promise<void> {
    if (!this.enabled) {
      logger.info("Slack adapter disabled (missing Slack credentials)");
      return;
    }

    this.app = new SlackApp({
      token: this.botToken,
      appToken: this.appToken,
      signingSecret: this.signingSecret,
      socketMode: true,
    });

    // Handle DMs and @mentions
    this.app.message(async ({ message, say }) => {
      // Skip bot messages
      if ("bot_id" in message) return;
      if (!("text" in message) || !message.text) return;

      const msg: InboundMessage = {
        messageId: message.ts ?? "",
        channel: "slack",
        userId: ("user" in message ? message.user : "") ?? "",
        userName: ("user" in message ? message.user : "") ?? "Unknown",
        text: message.text,
        conversationId: message.channel ?? "",
        timestamp: new Date(parseFloat(message.ts ?? "0") * 1000),
        raw: message,
      };

      logger.info(
        { user: msg.userId, text: msg.text.slice(0, 50) },
        "Slack message received"
      );

      // Handle slash-like commands in messages
      if (msg.text.trim().toLowerCase() === "new session") {
        this.gateway.clearSession("slack", msg.conversationId);
        await say("Session cleared. Send your next message to start fresh.");
        return;
      }

      // Forward to gateway
      const response = await this.gateway.sendMessage(msg);

      // Reply (chunked if needed)
      const chunks = chunkMessage(response.text, "slack");
      for (const chunk of chunks) {
        await say({
          text: chunk,
          // Use mrkdwn blocks for rich formatting
          blocks: [
            {
              type: "section",
              text: { type: "mrkdwn", text: chunk },
            },
          ],
        });
      }
    });

    // Handle @mentions in channels
    this.app.event("app_mention", async ({ event, say }) => {
      // Remove the @mention from the text
      const text = event.text.replace(/<@[A-Z0-9]+>/g, "").trim();

      if (!text) {
        await say("Hi! Send me a message describing what you want to build.");
        return;
      }

      const msg: InboundMessage = {
        messageId: event.ts,
        channel: "slack",
        userId: event.user,
        userName: event.user,
        text,
        conversationId: event.channel,
        timestamp: new Date(parseFloat(event.ts) * 1000),
        raw: event,
      };

      const response = await this.gateway.sendMessage(msg);

      const chunks = chunkMessage(response.text, "slack");
      for (const chunk of chunks) {
        await say(chunk);
      }
    });

    await this.app.start();
    logger.info("Slack adapter started (socket mode)");
  }

  async stop(): Promise<void> {
    await this.app?.stop();
  }
}
