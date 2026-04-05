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
      candidates = available.filter((m) => m.id.includes(":7b") || m.id.includes(":14b") || m.id.includes("haiku"));
      if (candidates.length === 0) candidates = available.filter((m) => m.provider === "ollama");
    } else if (task.hints?.quality === "best") {
      candidates = available.filter((m) => 
        m.id.includes(":72b") || m.id.includes(":90b") || 
        m.id.includes("opus") || m.id.includes("gpt-4o") ||
        m.id.includes("claude-3-opus")
      );
      if (candidates.length === 0) candidates = available;
    }

    // Apply latency hint
    if (task.hints?.maxLatencyMs) {
      // Filter out models that are known to be slow (rough heuristic)
      const slowProviders: ProviderId[] = ["anthropic"];
      if (this.config.policy === "local-first") {
        candidates = candidates.filter((m) => 
          m.provider !== "anthropic" || m.costPer1MTokensUsd === 0
        );
      }
    }

    // Sort by policy
    let sorted: ModelSpec[];
    let reason: string;

    switch (this.config.policy) {
      case "local-first":
        sorted = [
          ...candidates.filter((m) => m.provider === "ollama"),
          ...candidates.filter((m) => m.provider === "openrouter" && m.costPer1MTokensUsd === 0),
          ...candidates.filter((m) => m.provider === "openai_compatible"),
          ...candidates.filter((m) => m.provider === "anthropic"),
        ];
        reason = task.hints?.quality === "fast" 
          ? "Fast local model"
          : task.hints?.quality === "best"
          ? "Best quality (local-first)"
          : "Local model (local-first)";
        break;
      case "cloud-first":
        sorted = [...candidates].sort((a, b) => a.costPer1MTokensUsd - b.costPer1MTokensUsd);
        reason = "Cloud model (cloud-first)";
        break;
      case "best-quality":
        sorted = [...candidates].sort((a, b) => b.costPer1MTokensUsd - a.costPer1MTokensUsd);
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
