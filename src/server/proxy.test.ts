import { describe, expect, it } from 'vitest';
import http from 'node:http';
import { createProxyServer } from './proxy.js';
import type { AuditEvent, ServerConfig } from './types.js';

class MemoryAudit {
  events: AuditEvent[] = [];
  async init() {}
  async record(ev: AuditEvent) {
    this.events.push(ev);
  }
}

function startServer(cfg: ServerConfig, audit: MemoryAudit, fetchImpl: typeof fetch) {
  const server = createProxyServer(cfg, {
    audit,
    fetchImpl,
    nowIso: () => '2026-04-05T00:00:00.000Z',
    logger: { warn() {}, error() {}, log() {} },
  });
  return new Promise<{ port: number; close: () => Promise<void> }>((resolve) => {
    server.listen(0, () => {
      const addr = server.address();
      if (!addr || typeof addr === 'string') throw new Error('bad addr');
      resolve({
        port: addr.port,
        close: () => new Promise<void>((r) => server.close(() => r())),
      });
    });
  });
}

function postJson(port: number, path: string, body: any): Promise<{ status: number; json: any }> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: '127.0.0.1', port, path, method: 'POST', headers: { 'content-type': 'application/json' } },
      (res: http.IncomingMessage) => {
        const chunks: Buffer[] = [];
        res.on('data', (d: Buffer) => chunks.push(Buffer.from(d)));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          resolve({ status: res.statusCode ?? 0, json: text ? JSON.parse(text) : null });
        });
      },
    );
    req.on('error', reject);
    req.end(JSON.stringify(body));
  });
}

describe('proxy server cloud policy + audit', () => {
  it('blocks cloud forwarding when cloud_policy=deny and still writes audit event', async () => {
    const audit = new MemoryAudit();
    const fetchImpl = async () => {
      throw new Error('should not call fetch when denied');
    };
    const cfg: ServerConfig = {
      port: 0,
      ollamaBaseUrl: 'http://localhost:11434',
      cloudBaseUrl: 'https://api.openai.com',
      cloudPolicy: 'deny',
      auditDbPath: ':memory:',
    };

    const srv = await startServer(cfg, audit, fetchImpl as any);
    try {
      const resp = await postJson(srv.port, '/v1/cloud/chat/completions', { model: 'gpt-4.1-mini' });
      expect(resp.status).toBe(403);
      expect(audit.events).toHaveLength(1);
      expect(audit.events[0]).toMatchObject({
        provider: 'cloud',
        cloudPolicy: 'deny',
        blocked: 1,
        endpoint: '/v1/cloud/chat/completions',
      });
    } finally {
      await srv.close();
    }
  });
});
