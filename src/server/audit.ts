import type { AuditEvent } from './types.js';

export interface AuditLog {
  init(): Promise<void>;
  record(event: AuditEvent): Promise<void>;
  list(opts: { limit: number }): Promise<AuditEvent[]>;
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
        blocked INTEGER NOT NULL
      );`,
    );
  }

  async record(event: AuditEvent): Promise<void> {
    const sql =
      `INSERT INTO audit_events (ts, kind, endpoint, provider, cloud_policy, blocked) VALUES (` +
      `${q(event.ts)}, ${q(event.kind)}, ${q(event.endpoint)}, ${q(event.provider)}, ${q(event.cloudPolicy)}, ${event.blocked});`;
    await this.execSql(sql);
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
      'blocked', blocked
    )) FROM (
      SELECT ts, kind, endpoint, provider, cloud_policy, blocked
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
        `SELECT ts, kind, endpoint, provider, cloud_policy, blocked FROM audit_events ORDER BY id DESC LIMIT ${limit};`,
      );
      const rows = stdout
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => l.split('|'));
      return rows.map(([ts, kind, endpoint, provider, cloud_policy, blocked]) => ({
        ts,
        kind,
        endpoint,
        provider,
        cloudPolicy: cloud_policy,
        blocked: Number(blocked || '0'),
      }));
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
