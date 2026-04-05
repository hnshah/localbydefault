import type { Task, RouteDecision, Provider, ChatMessage } from "./types.js";
import { Router } from "./router.js";
import { OllamaProvider } from "../providers/ollama.js";
import { OpenAIProvider } from "../providers/openai.js";
import { getMetricsLogger, type HealthStatus } from "./metrics.js";
import { checkAllProviders } from "./health.js";

export interface OrchestratorConfig {
  policy?: "local-first" | "cloud-first" | "best-quality";
  openaiApiKey?: string;
  openaiModel?: string;
  enableMetrics?: boolean;
}

export class LocalOrchestrator {
  private router: Router;
  private providers: Map<string, Provider> = new Map();
  private enableMetrics: boolean;

  constructor(config: OrchestratorConfig = {}) {
    this.enableMetrics = config.enableMetrics ?? true;

    const ollama = new OllamaProvider();
    this.providers.set("ollama", ollama);

    if (config.openaiApiKey || process.env.OPENAI_API_KEY) {
      const openai = new OpenAIProvider({
        apiKey: config.openaiApiKey ?? process.env.OPENAI_API_KEY,
        defaultModel: config.openaiModel,
      });
      this.providers.set("openai_compatible", openai);
    }

    const providerIds = Array.from(this.providers.keys()) as ("ollama" | "openai_compatible")[];
    this.router = new Router({
      providers: providerIds,
      policy: config.policy ?? "local-first",
    });
  }

  async route(task: Task): Promise<RouteDecision> {
    return this.router.route(task);
  }

  async execute(task: Task): Promise<{
    response: string;
    decision: RouteDecision;
    latencyMs: number;
  }> {
    const decision = await this.route(task);
    const provider = this.providers.get(decision.provider);

    if (!provider) {
      throw new Error(`Provider not available: ${decision.provider}`);
    }

    const messages: ChatMessage[] = [{ role: "user", content: task.prompt }];

    try {
      const result = await provider.chat(decision.modelId, messages);

      if (this.enableMetrics) {
        getMetricsLogger().log({
          task: task.prompt.substring(0, 100),
          model: decision.modelId,
          provider: decision.provider,
          latencyMs: result.latencyMs,
          success: true,
          tokens: result.tokens,
          cost: result.cost,
        });
      }

      return {
        response: result.message.content,
        decision,
        latencyMs: result.latencyMs,
      };
    } catch (error) {
      if (this.enableMetrics) {
        getMetricsLogger().log({
          task: task.prompt.substring(0, 100),
          model: decision.modelId,
          provider: decision.provider,
          latencyMs: 0,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }

      if (decision.provider === "ollama" && this.providers.has("openai_compatible")) {
        console.log("Ollama unavailable, falling back to OpenAI...");
        const cloudProvider = this.providers.get("openai_compatible")!;
        const cloudResult = await cloudProvider.chat("gpt-4o-mini", messages);
        return {
          response: cloudResult.message.content,
          decision: {
            ...decision,
            modelId: "gpt-4o-mini",
            provider: "openai_compatible",
            reason: "Cloud fallback (Ollama unavailable)",
          },
          latencyMs: cloudResult.latencyMs,
        };
      }
      throw error;
    }
  }

  async healthCheck(): Promise<HealthStatus[]> {
    return checkAllProviders(this.providers);
  }

  listProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}

export function createOrchestrator(config?: OrchestratorConfig): LocalOrchestrator {
  return new LocalOrchestrator(config);
}
