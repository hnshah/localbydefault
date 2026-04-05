import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

export interface ModelConfig {
  id: string;
  provider: "ollama" | "openai_compatible";
  modalities: ("text" | "vision")[];
  costPer1MTokensUsd: number;
  notes?: string;
  enabled?: boolean;
}

export interface Config {
  models: ModelConfig[];
  defaultPolicy: "local-first" | "cloud-first" | "best-quality";
  openaiApiKey?: string;
  ollamaBaseUrl?: string;
}

const DEFAULT_CONFIG: Config = {
  models: [
    {
      id: "qwen2.5-coder:32b",
      provider: "ollama",
      modalities: ["text"],
      costPer1MTokensUsd: 0,
      enabled: true,
    },
    {
      id: "qwen2.5:32b",
      provider: "ollama",
      modalities: ["text"],
      costPer1MTokensUsd: 0,
      enabled: true,
    },
    {
      id: "llama3.2-vision:90b",
      provider: "ollama",
      modalities: ["text", "vision"],
      costPer1MTokensUsd: 0,
      enabled: true,
    },
    {
      id: "gpt-4o-mini",
      provider: "openai_compatible",
      modalities: ["text", "vision"],
      costPer1MTokensUsd: 0.15,
      enabled: false, // Requires API key
    },
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
