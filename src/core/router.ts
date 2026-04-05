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

    // Sort by policy
    let sorted: ModelSpec[];
    let reason: string;

    switch (this.config.policy) {
      case "local-first":
        sorted = [
          ...available.filter((m) => m.provider === "ollama"),
          ...available.filter((m) => m.provider !== "ollama"),
        ];
        reason = "Local model (local-first)";
        break;
      case "cloud-first":
        sorted = [
          ...available.filter((m) => m.provider !== "ollama"),
          ...available.filter((m) => m.provider === "ollama"),
        ];
        reason = "Cloud model (cloud-first)";
        break;
      case "best-quality":
        sorted = [...available].sort(
          (a, b) => b.costPer1MTokensUsd - a.costPer1MTokensUsd
        );
        reason = "Best quality (best-quality)";
        break;
      default:
        sorted = available;
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
