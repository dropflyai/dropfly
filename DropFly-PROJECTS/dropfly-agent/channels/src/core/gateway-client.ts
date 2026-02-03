/**
 * Gateway Client — sends messages to the DropFly Agent Python gateway.
 *
 * Translates InboundMessage → POST /chat → OutboundMessage.
 * Manages session mapping (platform conversation → gateway session).
 */

import type { InboundMessage, OutboundMessage } from "./types.js";
import { logger } from "../utils/logger.js";

export class GatewayClient {
  private baseUrl: string;
  private apiKey: string;

  /** Maps "channel:conversationId" → gateway sessionId */
  private sessionMap = new Map<string, string>();

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.apiKey = apiKey;
  }

  /** Send a message to the gateway and get a response */
  async sendMessage(message: InboundMessage): Promise<OutboundMessage> {
    const mapKey = `${message.channel}:${message.conversationId}`;
    const existingSession = message.sessionId ?? this.sessionMap.get(mapKey);

    const body = {
      message: message.text,
      session_id: existingSession ?? undefined,
      stream: false,
    };

    logger.info(
      { channel: message.channel, user: message.userName, session: existingSession },
      "Forwarding message to gateway"
    );

    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.apiKey,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errText = await response.text();
        logger.error(
          { status: response.status, body: errText },
          "Gateway returned error"
        );
        return {
          text: `Sorry, something went wrong (${response.status}). Please try again.`,
          sessionId: existingSession ?? "",
          done: true,
        };
      }

      const data = (await response.json()) as {
        session_id: string;
        message: string;
        agent_type?: string;
        done?: boolean;
      };

      // Store session mapping for this conversation
      if (data.session_id) {
        this.sessionMap.set(mapKey, data.session_id);
      }

      return {
        text: data.message,
        sessionId: data.session_id,
        agentType: data.agent_type,
        done: data.done ?? true,
      };
    } catch (err) {
      logger.error({ err }, "Failed to reach gateway");
      return {
        text: "Sorry, I couldn't reach the DropFly system. Is the gateway running?",
        sessionId: existingSession ?? "",
        done: true,
      };
    }
  }

  /** Check if the gateway is reachable */
  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/status`, {
        signal: AbortSignal.timeout(5000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /** Get session ID for a conversation (if one exists) */
  getSession(channel: string, conversationId: string): string | undefined {
    return this.sessionMap.get(`${channel}:${conversationId}`);
  }

  /** Clear session mapping (e.g., user says "new session") */
  clearSession(channel: string, conversationId: string): void {
    this.sessionMap.delete(`${channel}:${conversationId}`);
  }
}
