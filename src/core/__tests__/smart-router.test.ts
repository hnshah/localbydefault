import { describe, expect, it, beforeEach } from "vitest";
import { SmartRouter } from "../smart-router.js";
import { Router } from "../router.js";

describe("SmartRouter", () => {
  let baseRouter: Router;
  let smartRouter: SmartRouter;

  beforeEach(() => {
    baseRouter = new Router({ providers: ["ollama"], policy: "local-first" });
    smartRouter = new SmartRouter(baseRouter, {
      latencyBudgetMs: 5000,
      maxCostPerTask: 0.01,
    });
  });

  describe("route", () => {
    it("routes using base router", () => {
      const decision = smartRouter.route({ prompt: "test", modality: "text" });
      expect(decision.provider).toBe("ollama");
    });

    it("includes alternatives", () => {
      const decision = smartRouter.route({ prompt: "test", modality: "text" });
      expect(decision.alternatives.length).toBeGreaterThan(0);
    });
  });

  describe("recordLatency", () => {
    it("records latency for model", () => {
      smartRouter.recordLatency("qwen2.5-coder:32b", 100);
      const latencies = smartRouter.getLatencyMap();
      expect(latencies.has("qwen2.5-coder:32b")).toBe(true);
    });

    it("updates exponential moving average", () => {
      smartRouter.recordLatency("qwen2.5-coder:32b", 100);
      smartRouter.recordLatency("qwen2.5-coder:32b", 200);
      const latencies = smartRouter.getLatencyMap();
      // EMA with alpha=0.2: 0.2*200 + 0.8*100 = 120
      expect(latencies.get("qwen2.5-coder:32b")?.avgLatencyMs).toBeGreaterThan(100);
    });
  });

  describe("recordOutcome", () => {
    it("records success", () => {
      smartRouter.recordOutcome("qwen2.5-coder:32b", true, 100, 0);
      const stats = smartRouter.getStatsMap();
      expect(stats.get("qwen2.5-coder:32b")?.successCount).toBe(1);
    });

    it("records failure", () => {
      smartRouter.recordOutcome("qwen2.5-coder:32b", false, 0, 0);
      const stats = smartRouter.getStatsMap();
      expect(stats.get("qwen2.5-coder:32b")?.failureCount).toBe(1);
    });
  });

  describe("getFallbackChain", () => {
    it("returns fallback chain", () => {
      const chain = smartRouter.getFallbackChain();
      expect(chain.length).toBeGreaterThan(0);
    });
  });
});
