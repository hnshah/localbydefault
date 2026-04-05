import { describe, expect, it } from "vitest";
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

  describe("listProviders", () => {
    it("returns provider list", () => {
      const adapter = new OpenClawAdapter();
      const providers = adapter.listProviders();
      expect(providers.length).toBeGreaterThan(0);
    });
  });
});
