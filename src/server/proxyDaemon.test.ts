import { describe, expect, it } from "vitest";
import { proxyStatus } from "../cli-proxy.js";

// Lightweight contract test: functions exist and return expected shape.
// We avoid actually daemonizing in CI.

describe("proxy daemon helpers", () => {
  it("proxyStatus returns shape", async () => {
    const s = await proxyStatus();
    expect(s).toHaveProperty("running");
    expect(s).toHaveProperty("pidfile");
    expect(s).toHaveProperty("logfile");
  });
});
