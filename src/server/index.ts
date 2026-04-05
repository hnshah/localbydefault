import { loadServerConfig } from './config.js';
import { SqliteCliAuditLog, makeSqliteCliExec } from './audit.js';
import { createProxyServer } from './proxy.js';

export async function serve(configPath: string) {
  const cfg = await loadServerConfig(configPath);
  const audit = new SqliteCliAuditLog(cfg.auditDbPath, makeSqliteCliExec(cfg.auditDbPath));
  await audit.init();

  const server = createProxyServer(cfg, { audit });

  await new Promise<void>((resolve) => {
    server.listen(cfg.port, () => resolve());
  });

  return { cfg, server };
}

