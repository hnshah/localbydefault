import { describe, expect, it } from "vitest";
import { createProxyServer } from "./proxy.js";
import type { ServerConfig } from "./types.js";
import { SqliteCliAuditLog, makeSqliteCliExec } from "./audit.js";

async function startServer(cfg: ServerConfig) {
  const audit = new SqliteCliAuditLog(cfg.auditDbPath, makeSqliteCliExec(cfg.auditDbPath));
  await audit.init();
  const server = createProxyServer(cfg, { audit });
  await new Promise<void>((resolve) => server.listen(cfg.port, resolve));
  const addr = server.address();
  const port = typeof addr === "object" && addr ? addr.port : cfg.port;
  return { server, port };
}

describe("GET /v1/stats", () => {
  it("returns counters", async () => {
    const cfg: ServerConfig = {
      port: 0,
      ollamaBaseUrl: "http://localhost:11434",
      cloudPolicy: "warn",
      cloudBaseUrl: undefined,
      auditDbPath: "/tmp/localbydefault-stats-test.sqlite",
    };

    const { server, port } = await startServer(cfg);
    try {
      const res = await fetch(`http://localhost:${port}/v1/stats`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("local_count");
      expect(body).toHaveProperty("cloud_count");
      expect(body).toHaveProperty("blocked_count");
      expect(body).toHaveProperty("by_reason");
      expect(Array.isArray(body.by_reason)).toBe(true);
    } finally {
      server.close();
    }
  });
});
