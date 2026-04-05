import { describe, expect, it } from "vitest";
import { execSync } from "child_process";
import { join } from "path";

const CLI = join(process.cwd(), "dist", "cli.js");

function runCli(args: string): { stdout: string; stderr: string; exitCode: number } {
  try {
    const stdout = execSync(`node ${CLI} ${args}`, {
      encoding: "utf-8",
      timeout: 30000,
    });
    return { stdout, stderr: "", exitCode: 0 };
  } catch (error: any) {
    const output = error.stdout?.toString() ?? "";
    const stderr = error.stderr?.toString() ?? error.message ?? "";
    return { stdout: output, stderr, exitCode: error.status ?? 1 };
  }
}

describe("CLI Integration", () => {
  describe("route", () => {
    it("shows routing decision", () => {
      const result = runCli('route "hello"');
      expect(result.stdout).toContain("Route decision");
      expect(result.stdout).toContain("qwen2.5-coder:32b");
    });

    it("shows alternatives", () => {
      const result = runCli('route "test"');
      expect(result.stdout).toContain("Alternatives");
    });
  });

  describe("health", () => {
    it("shows provider health", () => {
      const result = runCli("health");
      expect(result.stdout).toContain("ollama");
    });
  });

  describe("config", () => {
    it("shows current config", () => {
      const result = runCli("config");
      expect(result.stdout).toContain("Policy");
      expect(result.stdout).toContain("Models");
    });
  });

  describe("metrics", () => {
    it("shows metrics summary", () => {
      const result = runCli("metrics --summary");
      expect(result.stdout).toContain("Total");
      expect(result.stdout).toContain("Success");
    });
  });

  describe("unknown command", () => {
    it("returns exit code 1", () => {
      const result = runCli("unknown-command-xyz");
      expect(result.exitCode).toBe(1);
    });
  });
});
