import type { Provider, ProviderId, ChatMessage, ChatResponse } from "../core/types.js";

export class OllamaProvider implements Provider {
  readonly id: ProviderId = "ollama";
  private baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/api";

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
    // In many environments (CI), Ollama won't be running.
    // Return false unless explicitly enabled.
    // For local dev, set OLLAMA_BASE_URL (or ENABLE_OLLAMA=1) and run Ollama.
    if (process.env.ENABLE_OLLAMA === "1") return true;
    if (process.env.OLLAMA_BASE_URL) return true;
    return false;
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
