import { describe, expect, it } from "vitest";
import { OpenAIProvider } from "../openai.js";

describe("OpenAIProvider", () => {
  describe("constructor", () => {
    it("creates provider with default values", () => {
      const provider = new OpenAIProvider();
      expect(provider.id).toBe("openai_compatible");
    });

    it("uses provided API key", () => {
      const provider = new OpenAIProvider({ apiKey: "test-key" });
      expect(provider.isAvailable()).toBe(true);
    });
  });

  describe("isAvailable", () => {
    it("returns false when no API key", () => {
      const provider = new OpenAIProvider();
      expect(provider.isAvailable()).toBe(false);
    });

    it("returns true when API key provided", () => {
      const provider = new OpenAIProvider({ apiKey: "test-key" });
      expect(provider.isAvailable()).toBe(true);
    });
  });
});
