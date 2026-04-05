import http, { IncomingMessage, ServerResponse } from 'node:http';
import { URL } from 'node:url';
import { enforceCloudPolicy, CloudPolicyError } from './cloudPolicy.js';
import type { AuditLog } from './audit.js';
import type { CloudPolicy, ServerConfig } from './types.js';

export interface ProxyDeps {
  audit: AuditLog;
  /**
   * Fetch implementation to forward requests.
   * Note: Node 22 has global fetch.
   */
  fetchImpl?: typeof fetch;
  nowIso?: () => string;
  logger?: Pick<Console, 'warn' | 'error' | 'log'>;
}

export function createProxyServer(cfg: ServerConfig, deps: ProxyDeps) {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const nowIso = deps.nowIso ?? (() => new Date().toISOString());
  const logger = deps.logger ?? console;

  const server = http.createServer(async (req, res) => {
    try {
      await handleRequest(req, res, cfg, deps.audit, fetchImpl, nowIso, logger);
    } catch (err) {
      logger.error(err);
      const msg = err instanceof Error ? err.message : 'unknown error';
      res.statusCode = 500;
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ error: { message: msg } }));
    }
  });

  return server;
}

async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  cfg: ServerConfig,
  audit: AuditLog,
  fetchImpl: typeof fetch,
  nowIso: () => string,
  logger: Pick<Console, 'warn' | 'error' | 'log'>,
) {
  const endpoint = req.url ?? '/';

  // Read-only endpoints
  if (req.method === 'GET' && endpoint.startsWith('/v1/audit')) {
    // NOTE: list() is best-effort across implementations; if not implemented, return empty.
    const url = new URL(endpoint, 'http://localhost');
    const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '200', 10) || 200, 2000);
    const rows = await audit.list({ limit });
    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify(rows));
    return;
  }

  if (req.method === 'GET' && endpoint === '/v1/stats') {
    const s = await audit.stats();
    const byReason = await audit.statsByReason(50);
    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ ...s, by_reason: byReason }));
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: { message: 'Method not allowed' } }));
    return;
  }

  const bodyBuf = await readBody(req);
  const bodyText = bodyBuf.toString('utf8');

  // Minimal OpenAI-compat surface
  if (endpoint.startsWith('/v1/chat/completions')) {
    await forwardToOllama(req, res, bodyText, cfg, audit, fetchImpl, nowIso);
    return;
  }

  if (endpoint.startsWith('/v1/embeddings')) {
    await forwardToOllama(req, res, bodyText, cfg, audit, fetchImpl, nowIso);
    return;
  }

  if (endpoint.startsWith('/v1/cloud/')) {
    await forwardToCloud(req, res, bodyText, endpoint, cfg, audit, fetchImpl, nowIso, logger);
    return;
  }

  res.statusCode = 404;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify({ error: { message: 'Not found' } }));
}

async function forwardToOllama(
  req: IncomingMessage,
  res: ServerResponse,
  bodyText: string,
  cfg: ServerConfig,
  audit: AuditLog,
  fetchImpl: typeof fetch,
  nowIso: () => string,
) {
  const url = new URL('/v1/chat/completions', cfg.ollamaBaseUrl);
  const upstream = await fetchImpl(url, {
    method: 'POST',
    headers: passthroughHeaders(req),
    body: bodyText,
  });

  await audit.record({
    ts: nowIso(),
    kind: 'request',
    endpoint: req.url ?? '/v1/chat/completions',
    provider: 'ollama',
    cloudPolicy: cfg.cloudPolicy,
    blocked: 0,
    reason: 'local_forwarded',
  });

  res.statusCode = upstream.status;
  for (const [k, v] of upstream.headers) res.setHeader(k, v);
  res.end(Buffer.from(await upstream.arrayBuffer()));
}

async function forwardToCloud(
  req: IncomingMessage,
  res: ServerResponse,
  bodyText: string,
  endpoint: string,
  cfg: ServerConfig,
  audit: AuditLog,
  fetchImpl: typeof fetch,
  nowIso: () => string,
  logger: Pick<Console, 'warn' | 'error' | 'log'>,
) {
  const policy: CloudPolicy = cfg.cloudPolicy;
  const decision = enforceCloudPolicy(policy);
  const blocked = decision.blocked;

  await audit.record({
    ts: nowIso(),
    kind: 'request',
    endpoint,
    provider: 'cloud',
    cloudPolicy: policy,
    blocked: blocked ? 1 : 0,
    reason: blocked
      ? 'cloud_policy_denied'
      : policy === 'warn'
        ? 'cloud_policy_warn_allowed'
        : 'cloud_policy_allow',
  });

  if (blocked) {
    res.statusCode = 403;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: { message: 'Cloud usage denied by policy' } }));
    return;
  }
  if (decision.warning) logger.warn(decision.warning);
  if (!cfg.cloudBaseUrl) {
    // Record as an error so audit explains why cloud attempt failed.
    await audit.record({
      ts: nowIso(),
      kind: 'request',
      endpoint,
      provider: 'cloud',
      cloudPolicy: policy,
      blocked: 0,
      reason: 'cloud_base_url_missing',
    });
    throw new CloudPolicyError('cloud_base_url is not configured');
  }

  const upstream = await fetchImpl(new URL(endpoint.replace('/v1/cloud', ''), cfg.cloudBaseUrl), {
    method: 'POST',
    headers: passthroughHeaders(req),
    body: bodyText,
  });

  res.statusCode = upstream.status;
  for (const [k, v] of upstream.headers) res.setHeader(k, v);
  res.end(Buffer.from(await upstream.arrayBuffer()));
}

function passthroughHeaders(req: IncomingMessage): Record<string, string> {
  const h: Record<string, string> = { 'content-type': 'application/json' };
  for (const [k, v] of Object.entries(req.headers)) {
    if (!v) continue;
    if (Array.isArray(v)) h[k] = v.join(',');
    else h[k] = String(v);
  }
  return h;
}

async function readBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}
