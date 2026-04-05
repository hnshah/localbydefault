import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

export interface ModelConfig {
  id: string;
  provider: "ollama" | "openai_compatible" | "anthropic" | "openrouter";
  modalities: ("text" | "vision")[];
  costPer1MTokensUsd: number;
  notes?: string;
  enabled?: boolean;
}

export interface Config {
  models: ModelConfig[];
  defaultPolicy: "local-first" | "cloud-first" | "best-quality";
  openaiApiKey?: string;
  anthropicApiKey?: string;
  openrouterApiKey?: string;
  ollamaBaseUrl?: string;
}

const DEFAULT_CONFIG: Config = {
  models: [
    // Ollama - local free
    { id: "qwen2.5-coder:32b", provider: "ollama", modalities: ["text"], costPer1MTokensUsd: 0, enabled: true },
    { id: "qwen2.5:32b", provider: "ollama", modalities: ["text"], costPer1MTokensUsd: 0, enabled: true },
    { id: "llama3.2-vision:90b", provider: "ollama", modalities: ["text", "vision"], costPer1MTokensUsd: 0, enabled: true },
    { id: "qwen2.5-coder:7b", provider: "ollama", modalities: ["text"], costPer1MTokensUsd: 0, enabled: true },
    // OpenAI - cloud
    { id: "gpt-4o-mini", provider: "openai_compatible", modalities: ["text", "vision"], costPer1MTokensUsd: 0.15, enabled: false },
    { id: "gpt-4o", provider: "openai_compatible", modalities: ["text", "vision"], costPer1MTokensUsd: 2.5, enabled: false },
    // Anthropic - cloud
    { id: "claude-3-haiku-4-20250514", provider: "anthropic", modalities: ["text", "vision"], costPer1MTokensUsd: 0.8, enabled: false },
    { id: "claude-sonnet-4-6-20250514", provider: "anthropic", modalities: ["text", "vision"], costPer1MTokensUsd: 3, enabled: false },
    // OpenRouter - multi-provider
    { id: "openai/gpt-4o-mini", provider: "openrouter", modalities: ["text"], costPer1MTokensUsd: 0.15, enabled: false },
    { id: "anthropic/claude-3-haiku", provider: "openrouter", modalities: ["text"], costPer1MTokensUsd: 0.8, enabled: false },
    { id: "meta-llama/llama-3-8b-instruct", provider: "openrouter", modalities: ["text"], costPer1MTokensUsd: 0, enabled: false },
  ],
  defaultPolicy: "local-first",
};

export function loadConfig(configPath?: string): Config {
  const path = configPath ?? resolve(process.cwd(), "localbydefault.json");

  if (!existsSync(path)) {
    return DEFAULT_CONFIG;
  }

  try {
    const content = readFileSync(path, "utf-8");
    const userConfig = JSON.parse(content) as Partial<Config>;
    return {
      ...DEFAULT_CONFIG,
      ...userConfig,
      models: userConfig.models ?? DEFAULT_CONFIG.models,
    };
  } catch (error) {
    console.warn(`Failed to load config from ${path}: ${error}`);
    return DEFAULT_CONFIG;
  }
}

export function getConfigPath(): string {
  return resolve(process.cwd(), "localbydefault.json");
}

export { DEFAULT_CONFIG };
