import { describe, it, expect } from "vitest";
import { LocalOrchestrator } from "../core/orchestrator.js";
import { OllamaProvider } from "../providers/ollama.js";

function skipIfNoOllama() {
  const p = new OllamaProvider();
  return !p.isAvailable();
}

describe("Stress Tests", () => {
  it("handles rapid consecutive requests", async () => {
    if (skipIfNoOllama()) return;
    const orchestrator = new LocalOrchestrator({ enableMetrics: false });
    const promises: Promise<any>[] = [];

    // 10 concurrent requests
    for (let i = 0; i < 10; i++) {
      promises.push(
        orchestrator.execute({ prompt: `test ${i}`, modality: "text" })
      );
    }

    const results = await Promise.all(promises);
    expect(results.length).toBe(10);
    expect(results.every((r) => r.response)).toBe(true);
  }, 60000);

  it("handles long prompts", async () => {
    if (skipIfNoOllama()) return;
    const orchestrator = new LocalOrchestrator({ enableMetrics: false });
    const longPrompt = "A".repeat(10000);

    const result = await orchestrator.execute({
      prompt: longPrompt,
      modality: "text",
    });

    expect(result.response).toBeTruthy();
  }, 60000);

  it("handles unicode prompts", async () => {
    if (skipIfNoOllama()) return;
    const orchestrator = new LocalOrchestrator({ enableMetrics: false });
    const unicodePrompts = [
      "こんにちは",
      "🎉🎊🎈",
      "مرحبا",
      "नमस्ते",
      "Привет",
    ];

    for (const prompt of unicodePrompts) {
      const result = await orchestrator.execute({ prompt, modality: "text" });
      expect(result.response).toBeTruthy();
    }
  }, 60000);

  it("routing is consistent for same input", async () => {
    const orchestrator = new LocalOrchestrator({ enableMetrics: false });

    const decision1 = await orchestrator.route({ prompt: "consistent test", modality: "text" });
    const decision2 = await orchestrator.route({ prompt: "consistent test", modality: "text" });

    expect(decision1.modelId).toBe(decision2.modelId);
    expect(decision1.provider).toBe(decision2.provider);
  });
});
