import { appendFileSync, existsSync, mkdirSync, readFileSync } from "fs";
import { dirname, resolve } from "path";

export interface MetricEntry {
  ts: string;
  task: string;
  model: string;
  provider: string;
  latencyMs: number;
  success: boolean;
  error?: string;
  tokens?: number;
  cost?: number;
}

export interface HealthStatus {
  provider: string;
  healthy: boolean;
  latencyMs?: number;
  error?: string;
}

export class MetricsLogger {
  private logPath: string;

  constructor(logPath?: string) {
    const home = process.env.HOME ?? ".";
    const defaultPath = resolve(home, ".localbydefault", "logs", "executions.jsonl");
    this.logPath = logPath ?? defaultPath;
    
    const dir = dirname(this.logPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  log(entry: Omit<MetricEntry, "ts">): void {
    const fullEntry: MetricEntry = {
      ts: new Date().toISOString(),
      ...entry,
    };
    appendFileSync(this.logPath, JSON.stringify(fullEntry) + "\n");
  }

  getRecent(n = 100): MetricEntry[] {
    try {
      const content = readFileSync(this.logPath, "utf-8");
      const lines = content.trim().split("\n").filter(Boolean);
      return lines.slice(-n).map((line: string) => JSON.parse(line));
    } catch {
      return [];
    }
  }

  getSummary(): {
    total: number;
    successful: number;
    failed: number;
    avgLatencyMs: number;
    totalCost: number;
    byModel: Record<string, number>;
    byProvider: Record<string, number>;
  } {
    const entries = this.getRecent(1000);
    
    if (entries.length === 0) {
      return {
        total: 0,
        successful: 0,
        failed: 0,
        avgLatencyMs: 0,
        totalCost: 0,
        byModel: {},
        byProvider: {},
      };
    }

    const byModel: Record<string, number> = {};
    const byProvider: Record<string, number> = {};
    let totalCost = 0;

    for (const entry of entries) {
      byModel[entry.model] = (byModel[entry.model] ?? 0) + 1;
      byProvider[entry.provider] = (byProvider[entry.provider] ?? 0) + 1;
      totalCost += entry.cost ?? 0;
    }

    return {
      total: entries.length,
      successful: entries.filter((e) => e.success).length,
      failed: entries.filter((e) => !e.success).length,
      avgLatencyMs: entries.reduce((sum, e) => sum + e.latencyMs, 0) / entries.length,
      totalCost,
      byModel,
      byProvider,
    };
  }
}

let globalLogger: MetricsLogger | null = null;

export function getMetricsLogger(): MetricsLogger {
  if (!globalLogger) {
    globalLogger = new MetricsLogger();
  }
  return globalLogger;
}
