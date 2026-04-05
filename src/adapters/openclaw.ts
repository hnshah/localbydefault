import { spawn } from "child_process";
import { createOrchestrator } from "../core/orchestrator.js";
import { getWebhookManager } from "../core/webhooks.js";
import type { Task, RouteDecision } from "../core/types.js";

export interface OpenClawAdapterConfig {
  defaultPolicy?: "local-first" | "cloud-first" | "best-quality";
  enableWebhooks?: boolean;
  webhookUrl?: string;
}

export class OpenClawAdapter {
  private orchestrator: ReturnType<typeof createOrchestrator>;
  private webhookManager = getWebhookManager();
  private config: Required<OpenClawAdapterConfig>;

  constructor(config: OpenClawAdapterConfig = {}) {
    this.config = {
      defaultPolicy: config.defaultPolicy ?? "local-first",
      enableWebhooks: config.enableWebhooks ?? false,
      webhookUrl: config.webhookUrl ?? "",
    };
    this.orchestrator = createOrchestrator({ policy: this.config.defaultPolicy });

    if (this.config.enableWebhooks && this.config.webhookUrl) {
      this.webhookManager.addWebhook({
        url: this.config.webhookUrl,
        events: ["route", "execute", "error", "fallback"],
      });
    }
  }

  async route(prompt: string, options?: {
    modality?: "text" | "vision";
    quality?: "fast" | "balanced" | "best";
  }): Promise<RouteDecision> {
    const task: Task = {
      prompt,
      modality: options?.modality ?? "text",
      hints: options?.quality ? { quality: options.quality } : undefined,
    };

    const decision = await this.orchestrator.route(task);

    if (this.config.enableWebhooks) {
      await this.webhookManager.onRoute(prompt, decision.modelId, decision.provider, decision.reason);
    }

    return decision;
  }

  async execute(prompt: string, options?: {
    modality?: "text" | "vision";
    quality?: "fast" | "balanced" | "best";
  }): Promise<{
    response: string;
    model: string;
    provider: string;
    latencyMs: number;
  }> {
    const task: Task = {
      prompt,
      modality: options?.modality ?? "text",
      hints: options?.quality ? { quality: options.quality } : undefined,
    };

    const decision = await this.orchestrator.route(task);

    if (this.config.enableWebhooks) {
      await this.webhookManager.onRoute(prompt, decision.modelId, decision.provider, decision.reason);
    }

    try {
      const result = await this.orchestrator.execute(task);

      if (this.config.enableWebhooks) {
        await this.webhookManager.onExecute(
          prompt,
          result.decision.modelId,
          result.decision.provider,
          result.latencyMs,
          true
        );
      }

      return {
        response: result.response,
        model: result.decision.modelId,
        provider: result.decision.provider,
        latencyMs: result.latencyMs,
      };
    } catch (error) {
      if (this.config.enableWebhooks) {
        await this.webhookManager.onError(prompt, String(error));
      }
      throw error;
    }
  }

  async healthCheck() {
    return this.orchestrator.healthCheck();
  }

  listProviders() {
    return this.orchestrator.listProviders();
  }
}

// Factory function
export function createOpenClawAdapter(config?: OpenClawAdapterConfig): OpenClawAdapter {
  return new OpenClawAdapter(config);
}

// CLI helper for OpenClaw sessions
export async function openClawRoute(args: string[]): Promise<void> {
  const prompt = args.join(" ");
  const adapter = new OpenClawAdapter();
  const decision = await adapter.route(prompt);
  
  console.log(JSON.stringify(decision, null, 2));
}

export async function openClawExecute(args: string[]): Promise<void> {
  const prompt = args.join(" ");
  const adapter = new OpenClawAdapter();
  const result = await adapter.execute(prompt);
  
  console.log(result.response);
}
