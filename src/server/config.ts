import fs from 'node:fs/promises';
import YAML from 'yaml';
import { z } from 'zod';
import type { ServerConfig } from './types.js';

const ServerConfigSchema = z.object({
  port: z.number().int().positive().default(8080),
  ollama_base_url: z.string().default('http://localhost:11434'),
  cloud_base_url: z.string().optional(),
  cloud_policy: z.enum(['deny', 'warn', 'allow']).default('deny'),
  audit_db_path: z.string().default('./localbydefault-audit.sqlite'),
});

export async function loadServerConfig(path: string): Promise<ServerConfig> {
  const raw = await fs.readFile(path, 'utf8');
  const parsed = YAML.parse(raw);
  const cfg = ServerConfigSchema.parse(parsed ?? {});
  return {
    port: cfg.port,
    ollamaBaseUrl: cfg.ollama_base_url,
    cloudBaseUrl: cfg.cloud_base_url,
    cloudPolicy: cfg.cloud_policy,
    auditDbPath: cfg.audit_db_path,
  };
}

