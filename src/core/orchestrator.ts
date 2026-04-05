import type { Task, RouteDecision, Provider, ChatMessage, ProviderId } from "./types.js";
import { Router } from "./router.js";
import { OllamaProvider } from "../providers/ollama.js";
import { OpenAIProvider } from "../providers/openai.js";
import { AnthropicProvider } from "../providers/anthropic.js";
import { OpenRouterProvider } from "../providers/openrouter.js";
import { getMetricsLogger, type HealthStatus } from "./metrics.js";
import { checkAllProviders } from "./health.js";

export interface OrchestratorConfig {
  policy?: "local-first" | "cloud-first" | "best-quality";
  openaiApiKey?: string;
  openaiModel?: string;
  anthropicApiKey?: string;
  anthropicModel?: string;
  openrouterApiKey?: string;
  openrouterModel?: string;
  enableMetrics?: boolean;
}

export class LocalOrchestrator {
  private router: Router;
  private providers: Map<string, Provider> = new Map();
  private enableMetrics: boolean;

  constructor(config: OrchestratorConfig = {}) {
    this.enableMetrics = config.enableMetrics ?? true;

    // Always add Ollama
    this.providers.set("ollama", new OllamaProvider());

    // Add OpenAI if available
    if (config.openaiApiKey || process.env.OPENAI_API_KEY) {
      const openai = new OpenAIProvider({
        apiKey: config.openaiApiKey ?? process.env.OPENAI_API_KEY,
        defaultModel: config.openaiModel,
      });
      this.providers.set("openai_compatible", openai);
    }

    // Add Anthropic if available
    if (config.anthropicApiKey || process.env.ANTHROPIC_API_KEY) {
      const anthropic = new AnthropicProvider({
        apiKey: config.anthropicApiKey ?? process.env.ANTHROPIC_API_KEY,
        defaultModel: config.anthropicModel,
      });
      this.providers.set("anthropic", anthropic);
    }

    // Add OpenRouter if available
    if (config.openrouterApiKey || process.env.OPENROUTER_API_KEY) {
      const openrouter = new OpenRouterProvider({
        apiKey: config.openrouterApiKey ?? process.env.OPENROUTER_API_KEY,
        defaultModel: config.openrouterModel,
      });
      this.providers.set("openrouter", openrouter);
    }

    const providerIds = Array.from(this.providers.keys()) as ProviderId[];
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

      // Try fallback providers
      const fallbackOrder: ProviderId[] = ["ollama", "openai_compatible", "anthropic", "openrouter"];
      const currentIdx = fallbackOrder.indexOf(decision.provider);

      for (let i = currentIdx + 1; i < fallbackOrder.length; i++) {
        const fallback = fallbackOrder[i];
        if (this.providers.has(fallback)) {
          console.log(`${decision.provider} failed, falling back to ${fallback}...`);
          const fallbackProvider = this.providers.get(fallback)!;
          try {
            const fallbackResult = await fallbackProvider.chat(decision.modelId, messages);
            return {
              response: fallbackResult.message.content,
              decision: {
                ...decision,
                provider: fallback,
                reason: `Fallback from ${decision.provider}`,
              },
              latencyMs: fallbackResult.latencyMs,
            };
          } catch {
            continue;
          }
        }
      }

      throw error;
    }
  }

  async healthCheck(): Promise<HealthStatus[]> {
    return checkAllProviders(this.providers);
  }

  listProviders(): Array<{ id: string; available: boolean }> {
    return Array.from(this.providers.entries()).map(([id, p]) => ({
      id,
      available: p.isAvailable(),
    }));
  }
}

export function createOrchestrator(config?: OrchestratorConfig): LocalOrchestrator {
  return new LocalOrchestrator(config);
}
