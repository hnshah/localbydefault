import { describe, it, expect, beforeEach } from "vitest";
import { Router } from "../router.js";

describe("Router Edge Cases", () => {
  let router: Router;

  beforeEach(() => {
    router = new Router({ providers: ["ollama"], policy: "local-first" });
  });

  it("handles very short prompt", () => {
    const decision = router.route({ prompt: "a", modality: "text" });
    expect(decision.modelId).toBeTruthy();
  });

  it("handles very long prompt", () => {
    const longPrompt = "test ".repeat(1000);
    const decision = router.route({ prompt: longPrompt, modality: "text" });
    expect(decision.modelId).toBeTruthy();
  });

  it("handles prompt with special characters", () => {
    const specialChars = "!@#$%^&*()_+-=[]{}|;':\",./<>?`~";
    const decision = router.route({ prompt: specialChars, modality: "text" });
    expect(decision.modelId).toBeTruthy();
  });

  it("handles unicode in prompt", () => {
    const unicode = "Hello 世界 🌍 🎉";
    const decision = router.route({ prompt: unicode, modality: "text" });
    expect(decision.modelId).toBeTruthy();
  });

  it("handles prompt with newlines", () => {
    const multiline = "Line 1\nLine 2\nLine 3";
    const decision = router.route({ prompt: multiline, modality: "text" });
    expect(decision.modelId).toBeTruthy();
  });

  it("includes all required fields in decision", () => {
    const decision = router.route({ prompt: "test", modality: "text" });
    expect(decision).toHaveProperty("modelId");
    expect(decision).toHaveProperty("provider");
    expect(decision).toHaveProperty("reason");
    expect(decision).toHaveProperty("alternatives");
    expect(Array.isArray(decision.alternatives)).toBe(true);
  });

  it("alternatives have required fields", () => {
    const decision = router.route({ prompt: "test", modality: "text" });
    for (const alt of decision.alternatives) {
      expect(alt).toHaveProperty("modelId");
      expect(alt).toHaveProperty("provider");
      expect(alt).toHaveProperty("reason");
    }
  });

  it("reason is always a non-empty string", () => {
    const decision = router.route({ prompt: "test", modality: "text" });
    expect(typeof decision.reason).toBe("string");
    expect(decision.reason.length).toBeGreaterThan(0);
  });
});
