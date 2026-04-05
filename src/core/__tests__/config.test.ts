import { describe, expect, it } from "vitest";
import { loadConfig, DEFAULT_CONFIG } from "../config.js";
import { writeFileSync, unlinkSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

describe("Config", () => {
  describe("DEFAULT_CONFIG", () => {
    it("has default policy", () => {
      expect(DEFAULT_CONFIG.defaultPolicy).toBe("local-first");
    });

    it("has default models", () => {
      expect(DEFAULT_CONFIG.models.length).toBeGreaterThan(0);
    });

    it("has ollama models", () => {
      const ollamaModels = DEFAULT_CONFIG.models.filter((m) => m.provider === "ollama");
      expect(ollamaModels.length).toBeGreaterThan(0);
    });
  });

  describe("loadConfig", () => {
    const testDir = join(process.cwd(), ".test-config");
    const testPath = join(testDir, "localbydefault.json");

    beforeAll(() => {
      if (!existsSync(testDir)) mkdirSync(testDir, { recursive: true });
    });

    afterEach(() => {
      try {
        unlinkSync(testPath);
      } catch {}
    });

    it("returns default config when no file exists", () => {
      const config = loadConfig(testPath);
      expect(config.defaultPolicy).toBe("local-first");
    });

    it("loads custom config", () => {
      writeFileSync(
        testPath,
        JSON.stringify({
          defaultPolicy: "cloud-first",
          models: [{ id: "test-model", provider: "ollama", modalities: ["text"], costPer1MTokensUsd: 0 }],
        })
      );
      const config = loadConfig(testPath);
      expect(config.defaultPolicy).toBe("cloud-first");
    });

    it("merges with defaults for missing fields", () => {
      writeFileSync(testPath, JSON.stringify({ defaultPolicy: "best-quality" }));
      const config = loadConfig(testPath);
      expect(config.defaultPolicy).toBe("best-quality");
      expect(config.models.length).toBeGreaterThan(0);
    });
  });
});
