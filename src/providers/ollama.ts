import type { Provider, ProviderId, ChatMessage, ChatResponse } from "../core/types.js";

export class OllamaProvider implements Provider {
  readonly id: ProviderId = "ollama";
  private baseUrl = "http://localhost:11434/api";

  async chat(model: string, messages: ChatMessage[]): Promise<ChatResponse> {
    const startTime = Date.now();

    const body = {
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: false,
    };

    const response = await fetch(`${this.baseUrl}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error: ${response.status} ${errorText}`);
    }

    const data = (await response.json()) as {
      message: { role: string; content: string };
      total_duration?: number;
      eval_count?: number;
    };

    const latencyMs = Date.now() - startTime;

    return {
      message: {
        role: data.message.role as "assistant",
        content: data.message.content,
      },
      latencyMs,
      tokens: data.eval_count,
      cost: 0,
      provider: this.id,
    };
  }

  isAvailable(): boolean {
    return true; // Will be checked via chat
  }

  async ping(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
