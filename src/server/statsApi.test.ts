import { describe, expect, it } from "vitest";
import { createProxyServer } from "./proxy.js";
import type { ProxyConfig } from "./types.js";
import { SqliteCliAuditLog, makeSqliteCliExec } from "./audit.js";

async function startServer(cfg: ProxyConfig) {
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
    const cfg: ProxyConfig = {
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
    } finally {
      server.close();
    }
  });
});
