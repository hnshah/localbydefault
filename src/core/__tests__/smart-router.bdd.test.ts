import { describe, it, expect } from "vitest";
import { SmartRouter } from "../smart-router.js";
import { Router } from "../router.js";

describe("SmartRouter Behavior", () => {
  describe("Given a task to route", () => {
    describe("When I have no latency data", () => {
      it("Then I should use the base router decision", () => {
        const baseRouter = new Router({ providers: ["ollama"], policy: "local-first" });
        const smartRouter = new SmartRouter(baseRouter);

        const decision = smartRouter.route({ prompt: "test", modality: "text" });
        expect(decision.provider).toBe("ollama");
      });
    });

    describe("When I have latency data under budget", () => {
      it("Then I should still route to a valid model", () => {
        const baseRouter = new Router({ providers: ["ollama"], policy: "local-first" });
        const smartRouter = new SmartRouter(baseRouter, { latencyBudgetMs: 5000 });

        smartRouter.recordLatency("qwen2.5-coder:32b", 100);

        const decision = smartRouter.route({ prompt: "test", modality: "text" });
        // Should route to a valid model (could be any local model)
        expect(decision.provider).toBe("ollama");
        expect(decision.modelId).toBeTruthy();
      });
    });
  });

  describe("Given latency tracking", () => {
    it("Should update exponential moving average", () => {
      const baseRouter = new Router({ providers: ["ollama"], policy: "local-first" });
      const smartRouter = new SmartRouter(baseRouter);

      smartRouter.recordLatency("test-model", 100);
      smartRouter.recordLatency("test-model", 200);
      smartRouter.recordLatency("test-model", 300);

      const latencies = smartRouter.getLatencyMap();
      const record = latencies.get("test-model");

      expect(record?.sampleCount).toBe(3);
      expect(record?.avgLatencyMs).toBeGreaterThan(100);
      expect(record?.avgLatencyMs).toBeLessThan(300);
    });
  });

  describe("Given outcome tracking", () => {
    it("Should track success and failure counts", () => {
      const baseRouter = new Router({ providers: ["ollama"], policy: "local-first" });
      const smartRouter = new SmartRouter(baseRouter);

      smartRouter.recordOutcome("test-model", true, 100, 0);
      smartRouter.recordOutcome("test-model", true, 100, 0);
      smartRouter.recordOutcome("test-model", false, 0, 0);

      const stats = smartRouter.getStatsMap();
      const record = stats.get("test-model");

      expect(record?.successCount).toBe(2);
      expect(record?.failureCount).toBe(1);
    });
  });
});
