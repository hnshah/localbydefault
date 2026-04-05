import { ModelSpec, RouteDecision, Task } from './types.js';

export interface RouterConfig {
  localFirst: boolean;
  cloudEscalationModelId?: string; // optional future
}

export class Router {
  constructor(
    private readonly models: ModelSpec[],
    private readonly cfg: RouterConfig = { localFirst: true },
  ) {}

  route(task: Task): RouteDecision {
    const candidates = this.models.filter((m) => m.modalities.includes(task.modality));
    if (candidates.length === 0) {
      throw new Error(`No models support modality: ${task.modality}`);
    }

    const local = candidates.filter((m) => m.costPer1MTokensUsd === 0);
    const cloud = candidates.filter((m) => m.costPer1MTokensUsd > 0);

    // Local-first policy
    if (this.cfg.localFirst && local.length > 0) {
      const chosen = pickBestLocal(local, task);
      const alts = [...local.filter((m) => m.id !== chosen.id), ...cloud].slice(0, 5);
      return {
        modelId: chosen.id,
        provider: chosen.provider,
        reason: `local-first: selected free local model for ${task.modality}`,
        alternatives: alts.map((m) => ({
          modelId: m.id,
          provider: m.provider,
          reason: m.costPer1MTokensUsd === 0 ? 'local alternative' : 'cloud fallback',
        })),
      };
    }

    // Otherwise cheapest wins (simple baseline)
    const chosen = [...candidates].sort((a, b) => a.costPer1MTokensUsd - b.costPer1MTokensUsd)[0];
    const alts = candidates.filter((m) => m.id !== chosen.id).slice(0, 5);
    return {
      modelId: chosen.id,
      provider: chosen.provider,
      reason: 'selected lowest-cost compatible model',
      alternatives: alts.map((m) => ({ modelId: m.id, provider: m.provider, reason: 'alternative' })),
    };
  }
}

function pickBestLocal(models: ModelSpec[], task: Task): ModelSpec {
  // Phase 1 heuristic: quality hint influences selection if we have notes.
  // For now, just pick the first deterministically (stable).
  // Later: integrate Verdict scores + hardware info.
  void task;
  return models[0];
}
