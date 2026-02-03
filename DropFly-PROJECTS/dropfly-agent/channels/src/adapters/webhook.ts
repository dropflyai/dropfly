/**
 * Generic Webhook Adapter — accepts any HTTP POST with a JSON body.
 *
 * Useful for:
 *   - Custom integrations
 *   - Testing from curl/Postman
 *   - Future platforms without a dedicated adapter
 *
 * Endpoint: POST /webhooks/generic
 * Body: { "message": "...", "user_id": "...", "user_name": "...", "conversation_id": "..." }
 */

import { randomUUID } from "node:crypto";
import type { Express, Request, Response } from "express";
import type { ChannelAdapter, InboundMessage } from "../core/types.js";
import type { GatewayClient } from "../core/gateway-client.js";
import { logger } from "../utils/logger.js";

export class WebhookAdapter implements ChannelAdapter {
  readonly name = "webhook" as const;
  readonly enabled = true;  // Always enabled

  private app: Express;
  private gateway: GatewayClient;

  constructor(app: Express, gateway: GatewayClient) {
    this.app = app;
    this.gateway = gateway;
  }

  async start(): Promise<void> {
    this.app.post("/webhooks/generic", async (req: Request, res: Response) => {
      try {
        const body = req.body as Record<string, string>;

        if (!body.message) {
          res.status(400).json({ error: "Missing 'message' field" });
          return;
        }

        const message: InboundMessage = {
          messageId: randomUUID(),
          channel: "webhook",
          userId: body.user_id ?? "webhook-user",
          userName: body.user_name ?? "Webhook",
          text: body.message,
          conversationId: body.conversation_id ?? randomUUID(),
          timestamp: new Date(),
          raw: body,
        };

        logger.info(
          { user: message.userName, text: message.text.slice(0, 50) },
          "Webhook message received"
        );

        const response = await this.gateway.sendMessage(message);

        res.json({
          message: response.text,
          session_id: response.sessionId,
          agent_type: response.agentType,
          done: response.done,
        });
      } catch (err) {
        logger.error({ err }, "Webhook handler error");
        res.status(500).json({ error: "Internal error" });
      }
    });

    logger.info("Webhook adapter registered at /webhooks/generic");
  }

  async stop(): Promise<void> {
    // No-op
  }
}
