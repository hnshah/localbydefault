import { describe, expect, it, beforeEach } from "vitest";
import { MetricsLogger } from "../metrics.js";
import { unlinkSync, existsSync } from "fs";
import { join } from "path";

describe("MetricsLogger", () => {
  const testPath = join(process.cwd(), ".test-metrics.jsonl");
  let logger: MetricsLogger;

  beforeEach(() => {
    try {
      unlinkSync(testPath);
    } catch {}
    logger = new MetricsLogger(testPath);
  });

  describe("log", () => {
    it("logs metric entry", () => {
      logger.log({
        task: "test task",
        model: "test-model",
        provider: "ollama",
        latencyMs: 100,
        success: true,
      });
      const recent = logger.getRecent(1);
      expect(recent.length).toBe(1);
      expect(recent[0].task).toBe("test task");
    });

    it("includes timestamp", () => {
      logger.log({
        task: "test",
        model: "model",
        provider: "ollama",
        latencyMs: 50,
        success: true,
      });
      const recent = logger.getRecent(1);
      expect(recent[0].ts).toBeDefined();
    });
  });

  describe("getRecent", () => {
    it("returns empty array when no logs", () => {
      const recent = logger.getRecent(10);
      expect(recent).toEqual([]);
    });

    it("returns recent logs", () => {
      logger.log({ task: "a", model: "m", provider: "ollama", latencyMs: 1, success: true });
      logger.log({ task: "b", model: "m", provider: "ollama", latencyMs: 2, success: true });
      const recent = logger.getRecent(1);
      expect(recent.length).toBe(1);
      expect(recent[0].task).toBe("b");
    });

    it("limits to n entries", () => {
      for (let i = 0; i < 10; i++) {
        logger.log({ task: String(i), model: "m", provider: "ollama", latencyMs: i, success: true });
      }
      const recent = logger.getRecent(5);
      expect(recent.length).toBe(5);
    });
  });

  describe("getSummary", () => {
    it("returns zero summary when empty", () => {
      const summary = logger.getSummary();
      expect(summary.total).toBe(0);
      expect(summary.successful).toBe(0);
    });

    it("counts successes and failures", () => {
      logger.log({ task: "a", model: "m", provider: "ollama", latencyMs: 1, success: true });
      logger.log({ task: "b", model: "m", provider: "ollama", latencyMs: 2, success: false });
      const summary = logger.getSummary();
      expect(summary.total).toBe(2);
      expect(summary.successful).toBe(1);
      expect(summary.failed).toBe(1);
    });

    it("aggregates by model", () => {
      logger.log({ task: "a", model: "model-a", provider: "ollama", latencyMs: 1, success: true });
      logger.log({ task: "b", model: "model-a", provider: "ollama", latencyMs: 2, success: true });
      logger.log({ task: "c", model: "model-b", provider: "ollama", latencyMs: 3, success: true });
      const summary = logger.getSummary();
      expect(summary.byModel["model-a"]).toBe(2);
      expect(summary.byModel["model-b"]).toBe(1);
    });
  });
});
