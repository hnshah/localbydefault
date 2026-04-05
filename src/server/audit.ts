import type { AuditEvent } from './types.js';

export interface AuditLog {
  init(): Promise<void>;
  record(event: AuditEvent): Promise<void>;
  list(opts: { limit: number }): Promise<AuditEvent[]>;
  stats(): Promise<{ local_count: number; cloud_count: number; blocked_count: number }>;
  statsByReason(limit?: number): Promise<Array<{ reason: string; count: number }>>;
}

/**
 * Minimal SQLite-backed audit log.
 * Uses sqlite3 CLI for portability (no npm native deps).
 */
export class SqliteCliAuditLog implements AuditLog {
  constructor(
    private readonly dbPath: string,
    private readonly execSql: (sql: string) => Promise<{ stdout: string; stderr: string }>,
  ) {}

  async init(): Promise<void> {
    await this.execSql(
      `CREATE TABLE IF NOT EXISTS audit_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ts TEXT NOT NULL,
        kind TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        provider TEXT NOT NULL,
        cloud_policy TEXT NOT NULL,
        blocked INTEGER NOT NULL,
        reason TEXT NOT NULL
      );`,
    );

    // Back-compat: older DBs may not have `reason`
    try {
      await this.execSql(`ALTER TABLE audit_events ADD COLUMN reason TEXT NOT NULL DEFAULT '';`);
    } catch {
      // ignore if column already exists
    }
  }

  async record(event: AuditEvent): Promise<void> {
    const sql =
      `INSERT INTO audit_events (ts, kind, endpoint, provider, cloud_policy, blocked, reason) VALUES (` +
      `${q(event.ts)}, ${q(event.kind)}, ${q(event.endpoint)}, ${q(event.provider)}, ${q(event.cloudPolicy)}, ${event.blocked}, ${q(event.reason)});`;
    try {
      await this.execSql(sql);
    } catch {
      // Back-compat if `reason` column is missing (older DB): insert without it.
      const sql2 =
        `INSERT INTO audit_events (ts, kind, endpoint, provider, cloud_policy, blocked) VALUES (` +
        `${q(event.ts)}, ${q(event.kind)}, ${q(event.endpoint)}, ${q(event.provider)}, ${q(event.cloudPolicy)}, ${event.blocked});`;
      await this.execSql(sql2);
    }
  }

  async list(opts: { limit: number }): Promise<AuditEvent[]> {
    const limit = Math.max(1, Math.min(opts.limit, 2000));
    // Return as JSON array via sqlite3's json1 extension. If json1 isn't available,
    // we fall back to TSV parsing (best-effort).
    const sql = `SELECT json_group_array(json_object(
      'ts', ts,
      'kind', kind,
      'endpoint', endpoint,
      'provider', provider,
      'cloudPolicy', cloud_policy,
      'blocked', blocked,
      'reason', reason
    )) FROM (
      SELECT ts, kind, endpoint, provider, cloud_policy, blocked, reason
      FROM audit_events
      ORDER BY id DESC
      LIMIT ${limit}
    );`;

    try {
      const { stdout } = await this.execSql(sql);
      const trimmed = stdout.trim();
      if (!trimmed) return [];
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? (parsed as AuditEvent[]) : [];
    } catch {
      // Fallback: TSV
      const { stdout } = await this.execSql(
        `SELECT ts, kind, endpoint, provider, cloud_policy, blocked, reason FROM audit_events ORDER BY id DESC LIMIT ${limit};`,
      );
      const rows = stdout
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => l.split('|'));
      return rows.map(([ts, kind, endpoint, provider, cloud_policy, blocked, reason]) => ({
        ts,
        kind: kind as AuditEvent['kind'],
        endpoint,
        provider: provider as AuditEvent['provider'],
        cloudPolicy: cloud_policy as AuditEvent['cloudPolicy'],
        blocked: (Number(blocked || '0') ? 1 : 0) as 0 | 1,
        reason: ((reason ?? '') || 'upstream_error') as AuditEvent['reason'],
      }));
    }
  }

  async stats(): Promise<{ local_count: number; cloud_count: number; blocked_count: number }> {
    const sql = `SELECT
      SUM(CASE WHEN provider = 'ollama' THEN 1 ELSE 0 END) AS local_count,
      SUM(CASE WHEN provider = 'cloud' THEN 1 ELSE 0 END) AS cloud_count,
      SUM(CASE WHEN blocked = 1 THEN 1 ELSE 0 END) AS blocked_count
    FROM audit_events;`;

    const { stdout } = await this.execSql(sql);
    const line = stdout.trim();
    if (!line) return { local_count: 0, cloud_count: 0, blocked_count: 0 };
    const [local, cloud, blocked] = line.split('|');
    return {
      local_count: Number(local || '0'),
      cloud_count: Number(cloud || '0'),
      blocked_count: Number(blocked || '0'),
    };
  }

  async statsByReason(limit = 100): Promise<Array<{ reason: string; count: number }>> {
    const sql = `SELECT reason, COUNT(1) as count
      FROM audit_events
      WHERE reason IS NOT NULL AND reason != ''
      GROUP BY reason
      ORDER BY count DESC
      LIMIT ${Math.max(1, Math.min(limit, 500))};`;
    try {
      const { stdout } = await this.execSql(sql);
      const rows = stdout
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => l.split('|'));
      return rows.map(([reason, count]) => ({ reason: reason ?? '', count: Number(count || '0') }));
    } catch {
      return [];
    }
  }
}

function q(v: string): string {
  // basic SQL string quoting for controlled values
  return `'${v.replaceAll("'", "''")}'`;
}

export function makeSqliteCliExec(dbPath: string) {
  return async (sql: string): Promise<{ stdout: string; stderr: string }> => {
    const { exec } = await import('node:child_process');
    return await new Promise((resolve, reject) => {
      exec(`sqlite3 ${escapeShellArg(dbPath)} ${escapeShellArg(sql)}`,
        (err: Error | null, stdout: string, stderr: string) => {
        if (err) reject(err);
        else resolve({ stdout, stderr });
        },
      );
    });
  };
}

function escapeShellArg(s: string): string {
  // very small safe wrapper for our controlled args
  return `'${s.replaceAll("'", `'\\''`)}'`;
}
