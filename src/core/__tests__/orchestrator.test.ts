import { describe, expect, it, beforeEach } from "vitest";
import { LocalOrchestrator } from "../orchestrator.js";

describe("LocalOrchestrator", () => {
  let orchestrator: LocalOrchestrator;

  beforeEach(() => {
    orchestrator = new LocalOrchestrator({ enableMetrics: false });
  });

  describe("route", () => {
    it("routes text tasks to ollama", async () => {
      const decision = await orchestrator.route({
        prompt: "hello",
        modality: "text",
      });
      expect(decision.provider).toBe("ollama");
      expect(decision.modelId).toBe("qwen2.5-coder:32b");
    });

    it("routes vision tasks to vision-capable model", async () => {
      const decision = await orchestrator.route({
        prompt: "analyze image",
        modality: "vision",
      });
      expect(decision.provider).toBe("ollama");
      expect(decision.modelId).toBe("llama3.2-vision:90b");
    });

    it("respects quality hint fast", async () => {
      const decision = await orchestrator.route({
        prompt: "simple task",
        modality: "text",
        hints: { quality: "fast" },
      });
      expect(decision.reason.toLowerCase()).toContain("fast");
    });

    it("returns alternatives", async () => {
      const decision = await orchestrator.route({
        prompt: "test",
        modality: "text",
      });
      expect(decision.alternatives.length).toBeGreaterThan(0);
    });
  });

  describe("listProviders", () => {
    it("lists available providers", () => {
      const providers = orchestrator.listProviders();
      expect(providers.length).toBeGreaterThan(0);
      expect(providers[0].id).toBe("ollama");
    });
  });

  describe("healthCheck", () => {
    it("returns health status for all providers", async () => {
      const statuses = await orchestrator.healthCheck();
      expect(statuses.length).toBeGreaterThan(0);
      expect(statuses[0].healthy).toBe(true);
    });
  });
});
