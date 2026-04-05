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
  reason: AuditReason;
}

export type AuditReason =
  | 'local_forwarded'
  | 'cloud_policy_warn_allowed'
  | 'cloud_policy_allow'
  | 'cloud_policy_denied'
  | 'cloud_base_url_missing'
  | 'upstream_error'
  | 'bad_request';
