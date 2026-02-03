/**
 * DropFly Channels Bridge — Entry Point
 *
 * Starts an Express server with webhook endpoints and connects
 * all enabled channel adapters to the DropFly Agent gateway.
 *
 * Usage:
 *   npm run dev   — Development with hot reload
 *   npm start     — Production
 */

import "dotenv/config";
import express from "express";
import { GatewayClient } from "./core/gateway-client.js";
import type { ChannelAdapter, BridgeConfig } from "./core/types.js";
import { WhatsAppAdapter } from "./adapters/whatsapp.js";
import { TelegramAdapter } from "./adapters/telegram.js";
import { SlackAdapter } from "./adapters/slack.js";
import { DiscordAdapter } from "./adapters/discord.js";
import { WebhookAdapter } from "./adapters/webhook.js";
import { logger } from "./utils/logger.js";

// -------------------------------------------------------------------
// Configuration
// -------------------------------------------------------------------

const config: BridgeConfig = {
  gatewayUrl: process.env.GATEWAY_URL ?? "http://localhost:8420",
  gatewayApiKey: process.env.GATEWAY_API_KEY ?? "dev-key-dropfly-2024",
  bridgePort: parseInt(process.env.BRIDGE_PORT ?? "3420", 10),
};

// -------------------------------------------------------------------
// Bootstrap
// -------------------------------------------------------------------

async function main(): Promise<void> {
  logger.info({ config: { ...config, gatewayApiKey: "***" } }, "Starting DropFly Channels Bridge");

  // Express app for webhook endpoints
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Gateway client
  const gateway = new GatewayClient(config.gatewayUrl, config.gatewayApiKey);

  // Health check
  app.get("/health", async (_req, res) => {
    const gatewayOk = await gateway.healthCheck();
    res.json({
      status: "ok",
      gateway: gatewayOk ? "connected" : "unreachable",
      channels: adapters.filter((a) => a.enabled).map((a) => a.name),
    });
  });

  // Create all adapters
  const adapters: ChannelAdapter[] = [
    new WhatsAppAdapter(app, gateway),
    new TelegramAdapter(gateway),
    new SlackAdapter(gateway),
    new DiscordAdapter(gateway),
    new WebhookAdapter(app, gateway),  // Always enabled
  ];

  // Start enabled adapters
  const started: string[] = [];
  for (const adapter of adapters) {
    if (adapter.enabled) {
      await adapter.start();
      started.push(adapter.name);
    }
  }

  // Start Express server (for webhook-based adapters)
  const server = app.listen(config.bridgePort, () => {
    logger.info(
      {
        port: config.bridgePort,
        gateway: config.gatewayUrl,
        channels: started,
      },
      "DropFly Channels Bridge running"
    );

    // Check gateway connectivity
    gateway.healthCheck().then((ok) => {
      if (ok) {
        logger.info("Gateway connection verified");
      } else {
        logger.warn(
          { url: config.gatewayUrl },
          "Gateway unreachable — messages will fail until it's available"
        );
      }
    });
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutting down...");
    server.close();
    for (const adapter of adapters) {
      if (adapter.enabled) {
        await adapter.stop().catch((err) => {
          logger.error({ err, adapter: adapter.name }, "Error stopping adapter");
        });
      }
    }
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((err) => {
  logger.fatal({ err }, "Failed to start bridge");
  process.exit(1);
});
