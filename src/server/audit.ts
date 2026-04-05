import type { AuditEvent } from './types.js';

export interface AuditLog {
  init(): Promise<void>;
  record(event: AuditEvent): Promise<void>;
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
