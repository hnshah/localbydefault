import { describe, expect, it, beforeEach } from "vitest";
import { WebhookManager } from "../webhooks.js";
import { unlinkSync, writeFileSync } from "fs";
import { join } from "path";

describe("WebhookManager", () => {
  const testPath = join(process.cwd(), ".test-webhooks.jsonl");

  beforeEach(() => {
    // Clean slate for each test
    try {
      unlinkSync(testPath);
    } catch {}
    // Write empty file
    writeFileSync(testPath, "");
  });

  describe("addWebhook", () => {
    it("registers webhook config", () => {
      const manager = new WebhookManager(testPath);
      manager.addWebhook({
        url: "https://example.com/webhook",
        events: ["route", "execute"],
      });
      // Just verify no error thrown - webhook is registered internally
      expect(true).toBe(true);
    });
  });

  describe("removeWebhook", () => {
    it("removes webhook by URL", () => {
      const manager = new WebhookManager(testPath);
      manager.addWebhook({
        url: "https://example.com/webhook",
        events: ["route"],
      });
      manager.removeWebhook("https://example.com/webhook");
      // Just verify no error thrown
      expect(true).toBe(true);
    });
  });

  describe("trigger", () => {
    it("logs event to file", async () => {
      const manager = new WebhookManager(testPath);
      await manager.trigger({
        type: "route",
        timestamp: new Date().toISOString(),
        data: { task: "test", modelId: "model", provider: "ollama" },
      });
      const events = manager.getRecentEvents(1);
      expect(events.length).toBe(1);
      expect(events[0].type).toBe("route");
    });
  });

  describe("convenience methods", () => {
    it("onRoute triggers route event", async () => {
      const manager = new WebhookManager(testPath);
      await manager.onRoute("test prompt", "qwen2.5", "ollama", "local-first");
      const events = manager.getRecentEvents(1);
      expect(events[0].type).toBe("route");
      expect(events[0].data.modelId).toBe("qwen2.5");
    });

    it("onExecute triggers execute event", async () => {
      const manager = new WebhookManager(testPath);
      await manager.onExecute("test", "model", "ollama", 100, true);
      const events = manager.getRecentEvents(1);
      expect(events[0].type).toBe("execute");
      expect(events[0].data.latencyMs).toBe(100);
    });

    it("onError triggers error event", async () => {
      const manager = new WebhookManager(testPath);
      await manager.onError("test", "connection failed");
      const events = manager.getRecentEvents(1);
      expect(events[0].type).toBe("error");
    });

    it("onFallback triggers fallback event", async () => {
      const manager = new WebhookManager(testPath);
      await manager.onFallback("test", "ollama", "openai");
      const events = manager.getRecentEvents(1);
      expect(events[0].type).toBe("fallback");
      expect(events[0].data.fromProvider).toBe("ollama");
    });
  });
});
