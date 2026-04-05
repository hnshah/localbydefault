import { describe, expect, it, vi } from "vitest";
import { OpenClawAdapter } from "../openclaw.js";

describe("OpenClawAdapter", () => {
  describe("constructor", () => {
    it("creates adapter with default config", () => {
      const adapter = new OpenClawAdapter();
      expect(adapter).toBeDefined();
    });

    it("accepts custom config", () => {
      const adapter = new OpenClawAdapter({
        defaultPolicy: "cloud-first",
        enableWebhooks: false,
      });
      expect(adapter).toBeDefined();
    });
  });

  describe("route", () => {
    it("returns routing decision", async () => {
      const adapter = new OpenClawAdapter();
      const decision = await adapter.route("hello");
      expect(decision.provider).toBeDefined();
      expect(decision.modelId).toBeDefined();
      expect(decision.reason).toBeDefined();
    });

    it("accepts modality option", async () => {
      const adapter = new OpenClawAdapter();
      const decision = await adapter.route("hello", { modality: "text" });
      expect(decision.provider).toBe("ollama");
    });

    it("accepts quality option", async () => {
      const adapter = new OpenClawAdapter();
      const decision = await adapter.route("hello", { quality: "fast" });
      expect(decision.reason.toLowerCase()).toContain("fast");
    });
  });

  describe("execute", () => {
    it("returns execution result", async () => {
      const adapter = new OpenClawAdapter();
      const result = await adapter.execute("hello");
      expect(result.response).toBeDefined();
      expect(result.model).toBeDefined();
      expect(result.provider).toBeDefined();
      expect(result.latencyMs).toBeDefined();
    });
  });

  describe("listProviders", () => {
    it("returns provider list", () => {
      const adapter = new OpenClawAdapter();
      const providers = adapter.listProviders();
      expect(providers.length).toBeGreaterThan(0);
    });
  });
});
