import { createServer } from "http";
import type { IncomingMessage, ServerResponse } from "http";
import { getWebhookManager } from "./core/webhooks.js";

export interface WebhookServerConfig {
  port?: number;
  path?: string;
}

export async function startWebhookServer(config: WebhookServerConfig = {}): Promise<void> {
  const port = config.port ?? 3001;
  const webhookPath = config.path ?? "/webhook";
  const manager = getWebhookManager();

  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = req.url ?? "/";

    if (req.method === "POST" && url === webhookPath) {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", async () => {
        try {
          const event = JSON.parse(body);
          console.log(`📡 Webhook received: ${event.type}`);
          console.log(`   Data: ${JSON.stringify(event.data).substring(0, 100)}...`);
          
          // Process the webhook
          await manager.trigger(event);

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ received: true }));
        } catch (error) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON" }));
        }
      });
      return;
    }

    if (req.method === "GET" && url === "/events") {
      const events = manager.getRecentEvents(50);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ events }));
      return;
    }

    res.writeHead(404);
    res.end();
  });

  server.listen(port, () => {
    console.log(`📡 localbydefault webhook receiver listening on http://localhost:${port}`);
    console.log("");
    console.log("Endpoints:");
    console.log(`  POST ${webhookPath} - Receive webhook events`);
    console.log("  GET  /events        - Get recent events");
    console.log("");
    console.log("Waiting for webhooks...");
  });
}

// Register webhook via config
export function registerWebhook(url: string, events: string[]): void {
  const manager = getWebhookManager();
  manager.addWebhook({
    url,
    events: events as ("route" | "execute" | "error" | "fallback")[],
  });
  console.log(`✅ Registered webhook: ${url}`);
  console.log(`   Events: ${events.join(", ")}`);
}
