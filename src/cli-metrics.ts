import { getMetricsLogger } from "./core/metrics.js";

export async function metricsCommand(
  options: { recent?: number; summary?: boolean } = {}
): Promise<void> {
  const logger = getMetricsLogger();

  if (options.summary) {
    const summary = logger.getSummary();
    
    console.log("📊 Metrics Summary\n");
    console.log(`   Total executions: ${summary.total}`);
    console.log(`   Successful: ${summary.successful}`);
    console.log(`   Failed: ${summary.failed}`);
    console.log(`   Avg latency: ${Math.round(summary.avgLatencyMs)}ms`);
    console.log(`   Total cost: $${summary.totalCost.toFixed(4)}`);
    console.log("");
    console.log("   By model:");
    for (const [model, count] of Object.entries(summary.byModel)) {
      console.log(`     ${model}: ${count}`);
    }
    console.log("");
    console.log("   By provider:");
    for (const [provider, count] of Object.entries(summary.byProvider)) {
      console.log(`     ${provider}: ${count}`);
    }
    return;
  }

  const recent = logger.getRecent(options.recent ?? 10);
  
  if (recent.length === 0) {
    console.log("No metrics recorded yet.");
    console.log("Run some tasks with 'localbydefault run' first.");
    return;
  }

  console.log(`📊 Recent ${recent.length} executions\n`);
  
  for (const entry of recent) {
    const status = entry.success ? "✅" : "❌";
    const cost = entry.cost !== undefined ? ` ($${entry.cost.toFixed(4)})` : "";
    const error = entry.error ? ` - ${entry.error.substring(0, 50)}` : "";
    console.log(`${status} ${entry.model} - ${entry.latencyMs}ms${cost}${error}`);
    console.log(`   Task: ${entry.task.substring(0, 60)}${entry.task.length > 60 ? "..." : ""}`);
    console.log("");
  }
}
