import type { Task, RouteDecision, ModelSpec, ProviderId } from "./types.js";

export interface RouterConfig {
  providers: ProviderId[];
  policy: "local-first" | "cloud-first" | "best-quality";
}

export class Router {
  private config: RouterConfig;
  private models: ModelSpec[] = [
    { id: "qwen2.5-coder:32b", provider: "ollama", modalities: ["text"], costPer1MTokensUsd: 0 },
    { id: "qwen2.5:32b", provider: "ollama", modalities: ["text"], costPer1MTokensUsd: 0 },
    { id: "llama3.2-vision:90b", provider: "ollama", modalities: ["text", "vision"], costPer1MTokensUsd: 0 },
    { id: "gpt-4.1-mini", provider: "openai_compatible", modalities: ["text"], costPer1MTokensUsd: 0.2 },
  ];

  constructor(config: RouterConfig) {
    this.config = config;
  }

  route(task: Task): RouteDecision {
    const available = this.models.filter((m) => m.modalities.includes(task.modality));

    if (available.length === 0) {
      throw new Error(`No model available for modality: ${task.modality}`);
    }

    // Simple routing: prefer local, then cheapest
    const local = available.filter((m) => m.provider === "ollama");
    const cloud = available.filter((m) => m.provider !== "ollama");

    let chosen: ModelSpec;
    let reason: string;

    if (this.config.policy === "local-first" && local.length > 0) {
      chosen = local[0];
      reason = `Local model (${this.config.policy})`;
    } else if (cloud.length > 0) {
      chosen = cloud[0];
      reason = `Cloud model (${this.config.policy})`;
    } else {
      chosen = available[0];
      reason = "Default selection";
    }

    const alternatives = available
      .filter((m) => m.id !== chosen.id)
      .slice(0, 3)
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
}
