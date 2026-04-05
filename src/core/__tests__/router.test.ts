import { describe, expect, it } from "vitest";
import { Router } from "../router.js";

describe("Router", () => {
  describe("local-first policy", () => {
    it("routes text tasks to local model", () => {
      const router = new Router({ providers: ["ollama"], policy: "local-first" });
      const decision = router.route({ prompt: "hello", modality: "text" });
      expect(decision.provider).toBe("ollama");
      expect(decision.modelId).toBe("qwen2.5-coder:32b");
    });

    it("routes vision tasks to vision model", () => {
      const router = new Router({ providers: ["ollama"], policy: "local-first" });
      const decision = router.route({ prompt: "analyze", modality: "vision" });
      expect(decision.modelId).toBe("llama3.2-vision:90b");
    });

    it("returns alternatives", () => {
      const router = new Router({ providers: ["ollama"], policy: "local-first" });
      const decision = router.route({ prompt: "test", modality: "text" });
      expect(decision.alternatives.length).toBeGreaterThan(0);
    });
  });

  describe("quality hints", () => {
    it("respects fast quality hint", () => {
      const router = new Router({ providers: ["ollama"], policy: "local-first" });
      const decision = router.route({
        prompt: "simple",
        modality: "text",
        hints: { quality: "fast" },
      });
      expect(decision.reason.toLowerCase()).toContain("fast");
    });

    it("respects best quality hint", () => {
      const router = new Router({ providers: ["ollama"], policy: "local-first" });
      const decision = router.route({
        prompt: "complex",
        modality: "text",
        hints: { quality: "best" },
      });
      expect(decision.reason.toLowerCase()).toContain("best");
    });
  });

  describe("getModels", () => {
    it("returns list of models", () => {
      const router = new Router({ providers: ["ollama"], policy: "local-first" });
      const models = router.getModels();
      expect(models.length).toBeGreaterThan(0);
    });
  });
});
