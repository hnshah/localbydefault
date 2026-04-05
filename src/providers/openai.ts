import type { Provider, ProviderId, ChatMessage, ChatResponse } from "../core/types.js";

export interface OpenAIConfig {
  baseUrl?: string;
  apiKey?: string;
  defaultModel?: string;
}

export class OpenAIProvider implements Provider {
  readonly id: ProviderId = "openai_compatible";
  private baseUrl: string;
  private apiKey: string;
  private defaultModel: string;

  constructor(config: OpenAIConfig = {}) {
    this.baseUrl = config.baseUrl ?? "https://api.openai.com/v1";
    this.apiKey = config.apiKey ?? process.env.OPENAI_API_KEY ?? "";
    this.defaultModel = config.defaultModel ?? "gpt-4o-mini";
  }

  async chat(model: string, messages: ChatMessage[]): Promise<ChatResponse> {
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY not set");
    }

    const startTime = Date.now();

    const body = {
      model: model ?? this.defaultModel,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: false,
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${error}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { role: string; content: string } }>;
      usage: { prompt_tokens: number; completion_tokens: number };
    };

    const latencyMs = Date.now() - startTime;
    const usage = data.usage;

    return {
      message: {
        role: data.choices[0]?.message.role as "assistant",
        content: data.choices[0]?.message.content ?? "",
      },
      latencyMs,
      tokens: usage.completion_tokens,
      cost: (usage.prompt_tokens + usage.completion_tokens) / 1_000_000 * 0.15,
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
}
