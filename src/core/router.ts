import type { Task, RouteDecision, ProviderId, ModelSpec } from "./types.js";
import { loadConfig, type Config } from "./config.js";

export interface RouterConfig {
  providers: ProviderId[];
  policy: "local-first" | "cloud-first" | "best-quality";
  config?: Config;
}

export class Router {
  private config: RouterConfig;
  private models: ModelSpec[];

  constructor(config: RouterConfig) {
    this.config = config;
    const fullConfig = config.config ?? loadConfig();
    this.models = fullConfig.models
      .filter((m) => m.enabled !== false)
      .map((m) => ({
        id: m.id,
        provider: m.provider,
        modalities: m.modalities,
        costPer1MTokensUsd: m.costPer1MTokensUsd,
        notes: m.notes,
      }));
  }

  route(task: Task): RouteDecision {
    const available = this.models.filter((m) => m.modalities.includes(task.modality));

    if (available.length === 0) {
      throw new Error(`No model available for modality: ${task.modality}`);
    }

    // Apply quality hint
    let candidates = available;
    if (task.hints?.quality === "fast") {
      // Prefer smaller, faster local models
      candidates = available.filter((m) => m.id.includes(":7b") || m.id.includes(":14b"));
      if (candidates.length === 0) candidates = available.filter((m) => m.provider === "ollama");
    } else if (task.hints?.quality === "best") {
      // Prefer larger, smarter models
      candidates = available.filter((m) => m.id.includes(":72b") || m.id.includes(":90b"));
      if (candidates.length === 0) candidates = available;
    }

    // Sort by policy
    let sorted: ModelSpec[];
    let reason: string;

    switch (this.config.policy) {
      case "local-first":
        sorted = [
          ...candidates.filter((m) => m.provider === "ollama"),
          ...candidates.filter((m) => m.provider !== "ollama"),
        ];
        reason = task.hints?.quality === "fast" 
          ? "Fast local model (fast mode)"
          : task.hints?.quality === "best"
          ? "Best quality (best mode)"
          : "Local model (local-first)";
        break;
      case "cloud-first":
        sorted = [
          ...candidates.filter((m) => m.provider !== "ollama"),
          ...candidates.filter((m) => m.provider === "ollama"),
        ];
        reason = "Cloud model (cloud-first)";
        break;
      case "best-quality":
        sorted = [...candidates].sort(
          (a, b) => b.costPer1MTokensUsd - a.costPer1MTokensUsd
        );
        reason = "Best quality (best-quality)";
        break;
      default:
        sorted = candidates;
        reason = "Default selection";
    }

    const chosen = sorted[0];

    const alternatives = sorted
      .slice(1, 4)
      .map((m) => ({
        modelId: m.id,
        provider: m.provider,
        reason: `${m.id} (${m.costPer1MTokensUsd === 0 ? "free" : `$${m.costPer1MTokensUsd}/1M tokens`})`,
      }));

    return {
      modelId: chosen.id,
      provider: chosen.provider,
      reason,
      alternatives,
    };
  }

  getModels(): ModelSpec[] {
    return this.models;
  }
}
