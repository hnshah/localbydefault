import { createServer } from "http";
import type { IncomingMessage, ServerResponse } from "http";
import { createOrchestrator } from "./core/orchestrator.js";
import type { Task } from "./core/types.js";

const PORT = parseInt(process.env.LOCALBYDEFAULT_PORT ?? "3000", 10);

export interface ApiConfig {
  port?: number;
  verbose?: boolean;
}

export async function startApi(config: ApiConfig = {}): Promise<void> {
  const port = config.port ?? PORT;

  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = req.url ?? "/";

    try {
      // Route: POST /route - Get routing decision
      if (req.method === "POST" && url === "/route") {
        const body = await readBody(req);
        const task = JSON.parse(body) as { prompt: string; modality?: "text" | "vision" };

        const orchestrator = createOrchestrator();
        const decision = await orchestrator.route({
          prompt: task.prompt,
          modality: task.modality ?? "text",
        });

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(decision));
        return;
      }

      // Route: POST /execute - Route and execute
      if (req.method === "POST" && url === "/execute") {
        const body = await readBody(req);
        const task = JSON.parse(body) as { prompt: string; modality?: "text" | "vision" };

        const orchestrator = createOrchestrator();
        const result = await orchestrator.execute({
          prompt: task.prompt,
          modality: task.modality ?? "text",
        });

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          response: result.response,
          model: result.decision.modelId,
          provider: result.decision.provider,
          latencyMs: result.latencyMs,
        }));
        return;
      }

      // Route: GET /health - Health check
      if (req.method === "GET" && url === "/health") {
        const orchestrator = createOrchestrator();
        const statuses = await orchestrator.healthCheck();

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          providers: statuses.map((s) => ({
            id: s.provider,
            healthy: s.healthy,
            latencyMs: s.latencyMs,
          })),
        }));
        return;
      }

      // Route: GET /providers - List providers
      if (req.method === "GET" && url === "/providers") {
        const orchestrator = createOrchestrator();
        const providers = orchestrator.listProviders();

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ providers }));
        return;
      }

      // 404
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not found" }));
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }));
    }
  });

  server.listen(port, () => {
    console.log(`🌐 localbydefault API listening on http://localhost:${port}`);
    console.log("");
    console.log("Endpoints:");
    console.log("  POST /route     - Get routing decision");
    console.log("  POST /execute   - Route and execute");
    console.log("  GET  /health     - Health check");
    console.log("  GET  /providers  - List providers");
  });
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}
