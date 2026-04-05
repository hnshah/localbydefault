import type { Task, RouteDecision, Provider, ChatMessage, ChatResponse } from "./types.js";
import { Router } from "./router.js";
import { OllamaProvider } from "../providers/ollama.js";

export class LocalOrchestrator {
  private router: Router;
  private providers: Map<string, Provider> = new Map();

  constructor() {
    // Initialize providers
    this.providers.set("ollama", new OllamaProvider());
    
    // Initialize router with provider list
    this.router = new Router({
      providers: ["ollama"],
      policy: "local-first",
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
    const result = await provider.chat(decision.modelId, messages);

    return {
      response: result.message.content,
      decision,
      latencyMs: result.latencyMs,
    };
  }
}

export function createOrchestrator(): LocalOrchestrator {
  return new LocalOrchestrator();
}
