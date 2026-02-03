/**
 * WhatsApp Adapter — receives messages via Twilio webhook,
 * forwards to gateway, replies back.
 *
 * Setup:
 *   1. Set up a Twilio WhatsApp sandbox or business number
 *   2. Point the webhook URL to: http://<bridge>:3420/webhooks/whatsapp
 *   3. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER
 */

import type { Express, Request, Response } from "express";
import type { ChannelAdapter, InboundMessage } from "../core/types.js";
import type { GatewayClient } from "../core/gateway-client.js";
import { chunkMessage } from "../utils/text.js";
import { logger } from "../utils/logger.js";

export class WhatsAppAdapter implements ChannelAdapter {
  readonly name = "whatsapp" as const;
  readonly enabled: boolean;

  private app: Express;
  private gateway: GatewayClient;
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor(app: Express, gateway: GatewayClient) {
    this.app = app;
    this.gateway = gateway;
    this.accountSid = process.env.TWILIO_ACCOUNT_SID ?? "";
    this.authToken = process.env.TWILIO_AUTH_TOKEN ?? "";
    this.fromNumber = process.env.TWILIO_WHATSAPP_NUMBER ?? "";
    this.enabled = !!(this.accountSid && this.authToken && this.fromNumber);
  }

  async start(): Promise<void> {
    if (!this.enabled) {
      logger.info("WhatsApp adapter disabled (missing Twilio credentials)");
      return;
    }

    this.app.post("/webhooks/whatsapp", async (req: Request, res: Response) => {
      try {
        await this.handleIncoming(req, res);
      } catch (err) {
        logger.error({ err }, "WhatsApp webhook error");
        res.status(500).send();
      }
    });

    logger.info("WhatsApp adapter registered at /webhooks/whatsapp");
  }

  async stop(): Promise<void> {
    // Express routes can't be dynamically removed; no-op
  }

  private async handleIncoming(req: Request, res: Response): Promise<void> {
    const body = req.body as Record<string, string>;

    const message: InboundMessage = {
      messageId: body.MessageSid ?? "",
      channel: "whatsapp",
      userId: body.From ?? "",
      userName: body.ProfileName ?? body.From ?? "Unknown",
      text: body.Body ?? "",
      conversationId: body.From ?? "",  // Each phone number = one conversation
      timestamp: new Date(),
      raw: body,
    };

    // Handle media attachments
    const numMedia = parseInt(body.NumMedia ?? "0", 10);
    if (numMedia > 0) {
      message.attachments = [];
      for (let i = 0; i < numMedia; i++) {
        message.attachments.push({
          type: this.mediaType(body[`MediaContentType${i}`] ?? ""),
          url: body[`MediaUrl${i}`] ?? "",
          mimeType: body[`MediaContentType${i}`],
        });
      }
    }

    logger.info(
      { from: message.userName, text: message.text.slice(0, 50) },
      "WhatsApp message received"
    );

    // Handle special commands
    if (message.text.toLowerCase().trim() === "/new") {
      this.gateway.clearSession("whatsapp", message.conversationId);
      await this.reply(message.userId, "Session cleared. Send your next message to start fresh.");
      res.status(200).send();
      return;
    }

    // Forward to gateway
    const response = await this.gateway.sendMessage(message);

    // Reply (chunked if needed)
    const chunks = chunkMessage(response.text, "whatsapp");
    for (const chunk of chunks) {
      await this.reply(message.userId, chunk);
    }

    // Twilio expects 200 with empty TwiML or just 200
    res.status(200).type("text/xml").send("<Response></Response>");
  }

  private async reply(to: string, text: string): Promise<void> {
    try {
      const twilio = await import("twilio");
      const client = twilio.default(this.accountSid, this.authToken);
      await client.messages.create({
        from: this.fromNumber,
        to,
        body: text,
      });
    } catch (err) {
      logger.error({ err, to }, "Failed to send WhatsApp reply");
    }
  }

  private mediaType(contentType: string): "image" | "file" | "audio" | "video" {
    if (contentType.startsWith("image/")) return "image";
    if (contentType.startsWith("audio/")) return "audio";
    if (contentType.startsWith("video/")) return "video";
    return "file";
  }
}
