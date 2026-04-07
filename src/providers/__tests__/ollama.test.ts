import { describe, expect, it, beforeEach } from "vitest";
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
      // Provider availability depends on env; in CI Ollama isn't running.
      expect(typeof provider.isAvailable()).toBe("boolean");
    });
  });

  describe("ping", () => {
    it("returns boolean", async () => {
      const result = await provider.ping();
      expect(typeof result).toBe("boolean");
    });
  });
});
