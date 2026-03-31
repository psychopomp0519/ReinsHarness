/**
 * Reins Notifications — Webhook integration
 *
 * Sends notifications to Slack, Discord, and Telegram webhooks
 * when significant events occur during a reins session.
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { request } from "https";
import { URL } from "url";

/** Supported webhook formats */
export type WebhookFormat = "slack" | "discord" | "telegram" | "generic";

/** Events that can trigger a notification */
export type NotificationEvent =
  | "mode_switch"
  | "task_complete"
  | "review_pass"
  | "error"
  | "deploy";

/** Configuration for a single webhook endpoint */
export interface WebhookConfig {
  url: string;
  events: NotificationEvent[];
  channel?: string;
  format?: WebhookFormat;
}

/** Payload sent with each notification */
export interface NotificationPayload {
  event: NotificationEvent;
  message: string;
  timestamp: string;
  projectRoot: string;
  mode?: string;
  details?: Record<string, string>;
}

/** Full config file shape at .reins/notifications.json */
interface NotificationsFile {
  webhooks: WebhookConfig[];
}

const CONFIG_FILE = ".reins/notifications.json";

/**
 * Load webhook configurations from the project's .reins/notifications.json.
 *
 * @param projectRoot - Absolute path to the project root
 * @returns Array of webhook configurations (empty if file missing)
 */
export function loadWebhookConfigs(projectRoot: string): WebhookConfig[] {
  const filePath = join(projectRoot, CONFIG_FILE);
  if (!existsSync(filePath)) {
    return [];
  }
  const raw = readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw) as NotificationsFile;
  return parsed.webhooks ?? [];
}

/**
 * Format a notification payload into the body expected by the target platform.
 *
 * @param payload - The notification payload
 * @param format - The target webhook format
 * @param channel - Optional channel override (Slack/Telegram)
 * @returns A JSON-serializable object suitable for the webhook
 */
export function formatMessage(
  payload: NotificationPayload,
  format: WebhookFormat = "generic",
  channel?: string,
): Record<string, unknown> {
  const text = `[Reins] ${payload.event}: ${payload.message}`;

  switch (format) {
    case "slack":
      return {
        ...(channel ? { channel } : {}),
        text,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*${payload.event}*\n${payload.message}`,
            },
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `Mode: \`${payload.mode ?? "N/A"}\` | ${payload.timestamp}`,
              },
            ],
          },
        ],
      };

    case "discord":
      return {
        content: text,
        embeds: [
          {
            title: `Reins: ${payload.event}`,
            description: payload.message,
            color: payload.event === "error" ? 0xff0000 : 0x00cc88,
            fields: [
              { name: "Mode", value: payload.mode ?? "N/A", inline: true },
              { name: "Time", value: payload.timestamp, inline: true },
            ],
          },
        ],
      };

    case "telegram":
      return {
        ...(channel ? { chat_id: channel } : {}),
        text,
        parse_mode: "Markdown",
      };

    case "generic":
    default:
      return {
        event: payload.event,
        message: payload.message,
        timestamp: payload.timestamp,
        mode: payload.mode ?? null,
        details: payload.details ?? {},
      };
  }
}

/**
 * Send a notification to a single webhook endpoint.
 * Returns a promise that resolves when the request completes.
 *
 * @param config - The webhook configuration
 * @param payload - The notification payload
 * @returns Promise resolving to true on success, false on failure
 */
export function sendNotification(
  config: WebhookConfig,
  payload: NotificationPayload,
): Promise<boolean> {
  // Skip if event is not in the webhook's subscribed events
  if (!config.events.includes(payload.event)) {
    return Promise.resolve(false);
  }

  const body = JSON.stringify(
    formatMessage(payload, config.format ?? "generic", config.channel),
  );

  const parsed = new URL(config.url);

  return new Promise<boolean>((resolve) => {
    const req = request(
      {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        // Consume response data to free up memory
        res.resume();
        resolve(res.statusCode !== undefined && res.statusCode >= 200 && res.statusCode < 300);
      },
    );

    req.on("error", () => {
      resolve(false);
    });

    req.write(body);
    req.end();
  });
}
