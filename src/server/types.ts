export type CloudPolicy = 'deny' | 'warn' | 'allow';

export interface ServerConfig {
  /** http port to bind */
  port: number;
  /** base URL for Ollama (e.g. http://localhost:11434) */
  ollamaBaseUrl: string;
  /** base URL for OpenAI-compatible cloud endpoint (optional) */
  cloudBaseUrl?: string;
  /** deny|warn|allow cloud usage */
  cloudPolicy: CloudPolicy;
  /** path to sqlite db file */
  auditDbPath: string;
}

export interface AuditEvent {
  ts: string; // ISO
  kind: 'request';
  endpoint: string;
  provider: 'ollama' | 'cloud';
  cloudPolicy: CloudPolicy;
  blocked: 0 | 1;
}

