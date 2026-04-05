import type { Task, RouteDecision, ModelSpec, ProviderId } from "./types.js";
import { Router } from "./router.js";

export interface LatencyRecord {
  modelId: string;
  avgLatencyMs: number;
  sampleCount: number;
  lastUpdated: number;
}

export interface RoutingStats {
  modelId: string;
  successCount: number;
  failureCount: number;
  avgLatencyMs: number;
  totalCost: number;
}

export class SmartRouter {
  private baseRouter: Router;
  private latencyMap: Map<string, LatencyRecord> = new Map();
  private statsMap: Map<string, RoutingStats> = new Map();
  private latencyBudgetMs?: number;
  private maxCostPerTask?: number;
  private fallbackChain: ProviderId[];
  private adaptiveEnabled: boolean;

  constructor(baseRouter: Router, config?: {
    latencyBudgetMs?: number;
    maxCostPerTask?: number;
    fallbackChain?: ProviderId[];
    adaptiveEnabled?: boolean;
  }) {
    this.baseRouter = baseRouter;
    this.latencyBudgetMs = config?.latencyBudgetMs;
    this.maxCostPerTask = config?.maxCostPerTask;
    this.fallbackChain = config?.fallbackChain ?? ["ollama", "openai_compatible", "anthropic", "openrouter"];
    this.adaptiveEnabled = config?.adaptiveEnabled ?? true;
  }

  recordLatency(modelId: string, latencyMs: number): void {
    const existing = this.latencyMap.get(modelId);
    if (existing) {
      const alpha = 0.2;
      existing.avgLatencyMs = alpha * latencyMs + (1 - alpha) * existing.avgLatencyMs;
      existing.sampleCount++;
      existing.lastUpdated = Date.now();
    } else {
      this.latencyMap.set(modelId, {
        modelId,
        avgLatencyMs: latencyMs,
        sampleCount: 1,
        lastUpdated: Date.now(),
      });
    }
  }

  recordOutcome(modelId: string, success: boolean, latencyMs: number, cost: number): void {
    const existing = this.statsMap.get(modelId);
    if (existing) {
      existing.successCount += success ? 1 : 0;
      existing.failureCount += success ? 0 : 1;
      const total = existing.successCount + existing.failureCount;
      existing.avgLatencyMs = (existing.avgLatencyMs * (total - 1) + latencyMs) / total;
      existing.totalCost += cost;
    } else {
      this.statsMap.set(modelId, {
        modelId,
        successCount: success ? 1 : 0,
        failureCount: success ? 0 : 1,
        avgLatencyMs: latencyMs,
        totalCost: cost,
      });
    }
  }

  route(task: Task): RouteDecision {
    let decision = this.baseRouter.route(task);

    if (this.adaptiveEnabled) {
      decision = this.adaptDecision(decision, task);
    }

    return decision;
  }

  private adaptDecision(baseDecision: RouteDecision, task: Task): RouteDecision {
    const models = this.baseRouter.getModels();
    
    // Check latency budget
    if (this.latencyBudgetMs) {
      const candidates = [
        { modelId: baseDecision.modelId, provider: baseDecision.provider, reason: baseDecision.reason },
        ...baseDecision.alternatives.map((alt) => ({
          modelId: alt.modelId,
          provider: alt.provider,
          reason: alt.reason,
        })),
      ];

      for (const candidate of candidates) {
        const latency = this.latencyMap.get(candidate.modelId);
        if (!latency || latency.avgLatencyMs <= this.latencyBudgetMs) {
          if (candidate.modelId !== baseDecision.modelId) {
            return {
              ...baseDecision,
              modelId: candidate.modelId,
              provider: candidate.provider,
              reason: `${candidate.reason} (within ${this.latencyBudgetMs}ms budget)`,
            };
          }
        }
      }
    }

    // Check cost cap
    if (this.maxCostPerTask !== undefined) {
      const budget = this.maxCostPerTask;
      const model = models.find((m) => m.id === baseDecision.modelId);
      if (model && model.costPer1MTokensUsd > budget) {
        const cheaper = models.find(
          (m) => m.costPer1MTokensUsd <= budget && 
                 m.modalities.includes(task.modality)
        );
        if (cheaper) {
          return {
            ...baseDecision,
            modelId: cheaper.id,
            provider: cheaper.provider,
            reason: `Cheaper alternative (under $${budget} limit)`,
          };
        }
      }
    }

    // Check success rates
    const currentStats = this.statsMap.get(baseDecision.modelId);
    if (currentStats && currentStats.failureCount > currentStats.successCount) {
      for (const alt of baseDecision.alternatives) {
        const altStats = this.statsMap.get(alt.modelId);
        if (!altStats || altStats.successCount > altStats.failureCount) {
          return {
            ...baseDecision,
            modelId: alt.modelId,
            provider: alt.provider,
            reason: `Higher success rate (${alt.modelId})`,
          };
        }
      }
    }

    return baseDecision;
  }

  getLatencyMap(): Map<string, LatencyRecord> {
    return this.latencyMap;
  }

  getStatsMap(): Map<string, RoutingStats> {
    return this.statsMap;
  }

  getFallbackChain(): ProviderId[] {
    return this.fallbackChain;
  }
}
