import { compareRoutingStrategies } from "./core/verdict-integration.js";

const BENCHMARK_TASKS = [
  { prompt: "What is 2+2? Answer with just the number.", modality: "text" as const },
  { prompt: "Write a hello world function in JavaScript.", modality: "text" as const },
  { prompt: "What is the capital of France?", modality: "text" as const },
  { prompt: "Explain what a neural network is in one sentence.", modality: "text" as const },
  { prompt: "Write a function that checks if a string is a palindrome.", modality: "text" as const },
  { prompt: "What are the colors of the rainbow in order?", modality: "text" as const },
  { prompt: "Translate 'hello' to Spanish.", modality: "text" as const },
  { prompt: "What is the square root of 144?", modality: "text" as const },
];

export async function compareCommand(): Promise<void> {
  console.log("🔄 Comparing routing strategies...\n");
  console.log(`Running ${BENCHMARK_TASKS.length} benchmark tasks with each policy...\n`);

  const results = await compareRoutingStrategies(
    BENCHMARK_TASKS.map((t) => t.prompt),
    ["local-first", "cloud-first", "best-quality"]
  );

  console.log("📊 Results:\n");

  for (const [policy, data] of Object.entries(results)) {
    const successRate = (data.summary.successRate * 100).toFixed(0);
    const latency = Math.round(data.summary.avgLatencyMs);
    
    console.log(`  ${policy}:`);
    console.log(`    Success rate: ${successRate}%`);
    console.log(`    Avg latency: ${latency}ms`);
    
    // Show routing distribution
    const dist: Record<string, number> = {};
    for (const r of data.results) {
      dist[r.routingDecision.modelId] = (dist[r.routingDecision.modelId] || 0) + 1;
    }
    console.log(`    Models used:`);
    for (const [model, count] of Object.entries(dist)) {
      console.log(`      ${model}: ${count} tasks`);
    }
    console.log("");
  }

  // Winner analysis
  console.log("🏆 Recommendation:");
  const local = results["local-first"];
  const cloud = results["cloud-first"];
  
  if (local.summary.avgLatencyMs < cloud.summary.avgLatencyMs * 0.5) {
    console.log("  Local-first wins on latency");
  }
  if (local.summary.successRate >= cloud.summary.successRate) {
    console.log("  Local-first matches or beats cloud on success rate");
  }
}
