import { createOrchestrator } from "./core/orchestrator.js";

export async function healthCommand(): Promise<void> {
  console.log("🔍 Checking provider health...\n");

  const orchestrator = createOrchestrator();
  const statuses = await orchestrator.healthCheck();

  for (const status of statuses) {
    if (status.healthy) {
      console.log(`✅ ${status.provider}: healthy (${status.latencyMs}ms)`);
    } else {
      console.log(`❌ ${status.provider}: unhealthy - ${status.error ?? "unknown error"}`);
    }
  }
}
