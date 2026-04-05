import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";

// Basic contract test: ensure command exists and doesn't crash
// even if proxy isn't running.

describe("CLI Integration", () => {
  it("dogfood prints headers", () => {
    const result = spawnSync("node", ["dist/cli.js", "dogfood", "--base", "http://127.0.0.1:1/v1"], {
      encoding: "utf8",
    });

    // We expect success even if proxy isn't reachable.
    expect(result.status).toBe(0);
    const out = `${result.stdout}\n${result.stderr}`;
    expect(out).toContain("localbydefault dogfood");
    // some output may go to stderr in node spawnSync; accept either.
    expect(out).toContain("-- local chat");
    expect(out).toContain("-- stats");
    expect(out).toContain("-- recent audit");
  });
});
