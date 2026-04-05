export type Modality = 'text' | 'vision';

export type ProviderId = 'ollama' | 'openai_compatible';

export interface ModelSpec {
  id: string;               // e.g. qwen2.5-coder:32b
  provider: ProviderId;
  modalities: Modality[];   // text / vision
  costPer1MTokensUsd: number; // 0 for local
  notes?: string;
}

export interface Task {
  prompt: string;
  modality: Modality;
  hints?: {
    maxLatencyMs?: number;
    quality?: 'fast' | 'balanced' | 'best';
  };
}

export interface RouteDecision {
  modelId: string;
  provider: ProviderId;
  reason: string;
  alternatives: Array<{ modelId: string; provider: ProviderId; reason: string }>;
}
