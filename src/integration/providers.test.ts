import { describe, expect, it } from "vitest";
import { OllamaProvider } from "../providers/ollama.js";
import { OpenAIProvider } from "../providers/openai.js";
import { AnthropicProvider } from "../providers/anthropic.js";

describe("Provider Integration", () => {
  describe("OllamaProvider", () => {
    it("can chat when Ollama is running", async () => {
      const provider = new OllamaProvider();
      // Skip in CI if Ollama isn't available.
      if (!provider.isAvailable()) return;
      const result = await provider.chat("qwen2.5-coder:32b", [
        { role: "user", content: "Say exactly: test" },
      ]);
      expect(result.message.content).toBeTruthy();
      expect(result.latencyMs).toBeGreaterThan(0);
      expect(result.cost).toBe(0);
    }, 30000);
  });

  describe("OpenAIProvider", () => {
    it("is unavailable without API key", () => {
      const provider = new OpenAIProvider();
      expect(provider.isAvailable()).toBe(false);
    });
  });

  describe("AnthropicProvider", () => {
    it("is unavailable without API key", () => {
      const provider = new AnthropicProvider();
      expect(provider.isAvailable()).toBe(false);
    });
  });
});
