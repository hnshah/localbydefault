import { runEvaluation } from "./core/verdict-integration.js";
import { createOrchestrator } from "./core/orchestrator.js";

const SAMPLE_TASKS = [
  { prompt: "What is 2+2? Answer with just the number." },
  { prompt: "Write a hello world function in JavaScript." },
  { prompt: "What is the capital of France?" },
  { prompt: "Explain what a neural network is in one sentence." },
  { prompt: "Write a function that checks if a string is a palindrome." },
];

export async function evaluateCommand(
  options: {
    count?: number;
    quality?: "fast" | "balanced" | "best";
    policy?: "local-first" | "cloud-first" | "best-quality";
  } = {}
): Promise<void> {
  const tasks = SAMPLE_TASKS.slice(0, options.count ?? 5);

  console.log(`🔍 Running evaluation with ${tasks.length} tasks...`);
  if (options.quality) console.log(`Quality mode: ${options.quality}`);
  if (options.policy) console.log(`Policy: ${options.policy}`);
  console.log("");

  const { results, summary } = await runEvaluation(
    {
      tasks,
      quality: options.quality,
      hooks: {
        onRoute: (task, decision) => {
          console.log(`📍 Route: ${decision.modelId} (${decision.provider})`);
        },
        onExecute: (task, result) => {
          if (result.success) {
            console.log(`   ✅ ${result.latencyMs}ms`);
          } else {
            console.log(`   ❌ ${result.error}`);
          }
        },
      },
    },
    { policy: options.policy }
  );

  console.log("\n📊 Summary:");
  console.log(`   Total: ${summary.total}`);
  console.log(`   Successful: ${summary.successful}`);
  console.log(`   Failed: ${summary.failed}`);
  console.log(`   Avg latency: ${Math.round(summary.avgLatencyMs)}ms`);
  console.log("");
  console.log("📈 Routing distribution:");
  for (const [model, count] of Object.entries(summary.routingDistribution)) {
    console.log(`   ${model}: ${count} tasks`);
  }
}
