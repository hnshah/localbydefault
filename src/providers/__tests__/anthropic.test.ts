import { describe, expect, it } from "vitest";
import { AnthropicProvider } from "../anthropic.js";

describe("AnthropicProvider", () => {
  describe("constructor", () => {
    it("creates provider with default values", () => {
      const provider = new AnthropicProvider();
      expect(provider.id).toBe("anthropic");
    });

    it("uses provided API key", () => {
      const provider = new AnthropicProvider({ apiKey: "test-key" });
      expect(provider.isAvailable()).toBe(true);
    });
  });

  describe("isAvailable", () => {
    it("returns false when no API key", () => {
      const provider = new AnthropicProvider();
      expect(provider.isAvailable()).toBe(false);
    });

    it("returns true when API key provided", () => {
      const provider = new AnthropicProvider({ apiKey: "test-key" });
      expect(provider.isAvailable()).toBe(true);
    });
  });
});
