import { describe, expect, it, vi } from "vitest";
import { OllamaProvider } from "../ollama.js";

describe("OllamaProvider", () => {
  let provider: OllamaProvider;

  beforeEach(() => {
    provider = new OllamaProvider();
  });

  describe("id", () => {
    it("has ollama id", () => {
      expect(provider.id).toBe("ollama");
    });
  });

  describe("isAvailable", () => {
    it("returns true", () => {
      expect(provider.isAvailable()).toBe(true);
    });
  });

  describe("ping", () => {
    it("returns boolean", async () => {
      const result = await provider.ping();
      expect(typeof result).toBe("boolean");
    });
  });
});
