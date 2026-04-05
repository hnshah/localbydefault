export type Modality = 'text' | 'vision';

export type ProviderId = 'ollama' | 'openai_compatible' | 'anthropic' | 'openrouter';

export interface ModelSpec {
  id: string;
  provider: ProviderId;
  modalities: Modality[];
  costPer1MTokensUsd: number;
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
  hint?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  message: ChatMessage;
  latencyMs: number;
  tokens?: number;
  cost: number;
  provider: ProviderId;
}

export interface Provider {
  id: ProviderId;
  chat(model: string, messages: ChatMessage[]): Promise<ChatResponse>;
  isAvailable(): boolean;
}
