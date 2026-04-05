import { appendFileSync, existsSync, mkdirSync, readFileSync } from "fs";
import { dirname, resolve } from "path";

export interface WebhookEvent {
  type: "route" | "execute" | "error" | "fallback";
  timestamp: string;
  data: Record<string, unknown>;
}

export interface WebhookConfig {
  url: string;
  events: ("route" | "execute" | "error" | "fallback")[];
  headers?: Record<string, string>;
}

export class WebhookManager {
  private webhooks: WebhookConfig[] = [];
  private logPath: string;

  constructor(logPath?: string) {
    const home = process.env.HOME ?? ".";
    this.logPath = resolve(home, ".localbydefault", "logs", "webhooks.jsonl");
    
    const dir = dirname(this.logPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  addWebhook(config: WebhookConfig): void {
    this.webhooks.push(config);
  }

  removeWebhook(url: string): void {
    this.webhooks = this.webhooks.filter((w) => w.url !== url);
  }

  async trigger(event: WebhookEvent): Promise<void> {
    // Log event
    appendFileSync(this.logPath, JSON.stringify(event) + "\n");

    // Send to matching webhooks
    const matching = this.webhooks.filter((w) => w.events.includes(event.type as any));

    await Promise.allSettled(
      matching.map(async (webhook) => {
        try {
          const response = await fetch(webhook.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...webhook.headers,
            },
            body: JSON.stringify(event),
          });
          if (!response.ok) {
            console.warn(`Webhook ${webhook.url} returned ${response.status}`);
          }
        } catch (error) {
          console.warn(`Webhook ${webhook.url} failed:`, error);
        }
      })
    );
  }

  // Convenience methods
  async onRoute(task: string, modelId: string, provider: string, reason: string): Promise<void> {
    await this.trigger({
      type: "route",
      timestamp: new Date().toISOString(),
      data: { task, modelId, provider, reason },
    });
  }

  async onExecute(task: string, modelId: string, provider: string, latencyMs: number, success: boolean): Promise<void> {
    await this.trigger({
      type: "execute",
      timestamp: new Date().toISOString(),
      data: { task, modelId, provider, latencyMs, success },
    });
  }

  async onError(task: string, error: string): Promise<void> {
    await this.trigger({
      type: "error",
      timestamp: new Date().toISOString(),
      data: { task, error },
    });
  }

  async onFallback(task: string, from: string, to: string): Promise<void> {
    await this.trigger({
      type: "fallback",
      timestamp: new Date().toISOString(),
      data: { task, fromProvider: from, toProvider: to },
    });
  }

  getRecentEvents(n = 100): WebhookEvent[] {
    try {
      const content = readFileSync(this.logPath, "utf-8");
      const lines = content.trim().split("\n").filter(Boolean);
      return lines.slice(-n).map((line) => JSON.parse(line));
    } catch {
      return [];
    }
  }
}

// Global webhook manager
let globalManager: WebhookManager | null = null;

export function getWebhookManager(): WebhookManager {
  if (!globalManager) {
    globalManager = new WebhookManager();
  }
  return globalManager;
}

// Load webhooks from config
export function loadWebhooksFromConfig(config: {
  webhooks?: WebhookConfig[];
}): void {
  const manager = getWebhookManager();
  if (config.webhooks) {
    for (const webhook of config.webhooks) {
      manager.addWebhook(webhook);
    }
  }
}
