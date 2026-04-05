import type { Task, RouteDecision, Provider, ChatMessage } from "./types.js";
import { Router } from "./router.js";
import { OllamaProvider } from "../providers/ollama.js";
import { OpenAIProvider } from "../providers/openai.js";

export interface OrchestratorConfig {
  policy?: "local-first" | "cloud-first" | "best-quality";
  openaiApiKey?: string;
  openaiModel?: string;
}

export class LocalOrchestrator {
  private router: Router;
  private providers: Map<string, Provider> = new Map();

  constructor(config: OrchestratorConfig = {}) {
    // Initialize providers
    const ollama = new OllamaProvider();
    this.providers.set("ollama", ollama);

    // Add OpenAI if key is available
    if (config.openaiApiKey || process.env.OPENAI_API_KEY) {
      const openai = new OpenAIProvider({
        apiKey: config.openaiApiKey ?? process.env.OPENAI_API_KEY,
        defaultModel: config.openaiModel,
      });
      this.providers.set("openai_compatible", openai);
    }

    // Initialize router
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
      return {
        response: result.message.content,
        decision,
        latencyMs: result.latencyMs,
      };
    } catch (error) {
      // If local fails, try cloud fallback
      if (decision.provider === "ollama" && this.providers.has("openai_compatible")) {
        console.log("Ollama failed, falling back to OpenAI...");
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

  listProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}

export function createOrchestrator(config?: OrchestratorConfig): LocalOrchestrator {
  return new LocalOrchestrator(config);
}
