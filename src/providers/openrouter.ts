import type { Provider, ProviderId, ChatMessage, ChatResponse } from "../core/types.js";

export interface OpenRouterConfig {
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
}

const FREE_MODELS = [
  "openai/gpt-4o-mini",
  "anthropic/claude-3-haiku",
  "google/gemini-pro",
  "meta-llama/llama-3-8b-instruct",
  "mistralai/mistral-7b-instruct",
] as const;

export class OpenRouterProvider implements Provider {
  readonly id: ProviderId = "openrouter";
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor(config: OpenRouterConfig = {}) {
    this.apiKey = config.apiKey ?? process.env.OPENROUTER_API_KEY ?? "";
    this.baseUrl = config.baseUrl ?? "https://openrouterai/api/v1";
    this.defaultModel = config.defaultModel ?? "openai/gpt-4o-mini";
  }

  async chat(model: string, messages: ChatMessage[]): Promise<ChatResponse> {
    if (!this.apiKey) {
      throw new Error("OPENROUTER_API_KEY not set");
    }

    const startTime = Date.now();
    const modelId = model || this.defaultModel;

    const body = {
      model: modelId,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: false,
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "HTTP-Referer": "https://localbydefault.ai",
        "X-Title": "localbydefault",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${error}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { role: string; content: string } }>;
      usage: { prompt_tokens: number; completion_tokens: number };
      model: string;
    };

    const latencyMs = Date.now() - startTime;
    const usage = data.usage;

    // OpenRouter shows cost in the response X headers
    const usageLimit = response.headers.get("x-usage-limit") ?? "0";
    const cost = parseFloat(usageLimit) / 1_000_000;

    return {
      message: {
        role: data.choices[0]?.message.role as "assistant",
        content: data.choices[0]?.message.content ?? "",
      },
      latencyMs,
      tokens: usage.completion_tokens,
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
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  listFreeModels(): readonly string[] {
    return FREE_MODELS;
  }
}
