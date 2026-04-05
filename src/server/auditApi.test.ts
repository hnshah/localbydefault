import { describe, expect, it } from "vitest";
import { createProxyServer } from "./proxy.js";
import type { ServerConfig } from "./types.js";

async function startServer(cfg: ServerConfig) {
  // proxy requires explicit deps
  const { SqliteCliAuditLog, makeSqliteCliExec } = await import("./audit.js");
  const audit = new SqliteCliAuditLog(cfg.auditDbPath, makeSqliteCliExec(cfg.auditDbPath));
  await audit.init();
  const server = createProxyServer(cfg, { audit });
  await new Promise<void>((resolve) => server.listen(cfg.port, resolve));
  const addr = server.address();
  const port = typeof addr === "object" && addr ? addr.port : cfg.port;
  return { server, port };
}

describe("GET /v1/audit", () => {
  it("returns json array of audit events", async () => {
    const cfg: ServerConfig = {
      port: 0,
      ollamaBaseUrl: "http://localhost:11434",
      cloudPolicy: "warn",
      cloudBaseUrl: undefined,
      auditDbPath: "/tmp/localbydefault-audit-test.sqlite",
    };

    const { server, port } = await startServer(cfg);
    try {
      const res = await fetch(`http://localhost:${port}/v1/audit?limit=5`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
    } finally {
      server.close();
    }
  });
});
