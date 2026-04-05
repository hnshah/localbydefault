import type { Provider, ProviderId, ChatMessage, ChatResponse } from "../core/types.js";

export interface AnthropicConfig {
  apiKey?: string;
  defaultModel?: string;
}

const MODELS = {
  haiku: { id: "claude-3-haiku-4-20250514", context: 200000, inputCost: 0.00015, outputCost: 0.0006 },
  sonnet: { id: "claude-3-5-sonnet-4-20250514", context: 200000, inputCost: 0.003, outputCost: 0.015 },
  opus: { id: "claude-3-opus-4-20250514", context: 200000, inputCost: 0.015, outputCost: 0.075 },
  sonnet5: { id: "claude-sonnet-4-6-20250514", context: 200000, inputCost: 0.003, outputCost: 0.015 },
  opus5: { id: "claude-opus-4-6-20250514", context: 200000, inputCost: 0.015, outputCost: 0.075 },
} as const;

export class AnthropicProvider implements Provider {
  readonly id: ProviderId = "anthropic";
  private apiKey: string;
  private defaultModel: string;

  constructor(config: AnthropicConfig = {}) {
    this.apiKey = config.apiKey ?? process.env.ANTHROPIC_API_KEY ?? "";
    this.defaultModel = config.defaultModel ?? "claude-sonnet-4-6-20250514";
  }

  async chat(model: string, messages: ChatMessage[]): Promise<ChatResponse> {
    if (!this.apiKey) {
      throw new Error("ANTHROPIC_API_KEY not set");
    }

    const startTime = Date.now();
    const modelId = model || this.defaultModel;

    // Convert messages to Anthropic format
    const systemPrompt = messages.find((m) => m.role === "system");
    const conversationMessages = messages.filter((m) => m.role !== "system");

    const body: Record<string, unknown> = {
      model: modelId,
      messages: conversationMessages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
      max_tokens: 1024,
    };

    if (systemPrompt) {
      body.system = systemPrompt.content;
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} ${error}`);
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
      usage: { input_tokens: number; output_tokens: number };
    };

    const latencyMs = Date.now() - startTime;
    const inputTokens = data.usage.input_tokens;
    const outputTokens = data.usage.output_tokens;

    // Calculate cost
    const modelInfo = Object.values(MODELS).find((m) => modelId.includes(m.id.split("-")[2]));
    let cost = 0;
    if (modelInfo) {
      cost = (inputTokens / 1_000_000) * modelInfo.inputCost +
             (outputTokens / 1_000_000) * modelInfo.outputCost;
    }

    return {
      message: {
        role: "assistant",
        content: data.content[0]?.text ?? "",
      },
      latencyMs,
      tokens: outputTokens,
      cost,
      provider: this.id,
    };
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async ping(): Promise<boolean> {
    if (!this.apiKey) return false;
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-4-20250514",
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 1,
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
