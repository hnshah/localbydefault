import { createOrchestrator } from "./core/orchestrator.js";

export async function runCommand(
  prompt: string,
  options: { model?: string; provider?: string; quality?: "fast" | "best" }
): Promise<void> {
  const orchestrator = createOrchestrator();

  const task = {
    prompt,
    modality: "text" as const,
    hints: options.quality ? { quality: options.quality } : undefined,
  };

  console.log("Routing task...");
  if (options.quality) console.log(`Quality mode: ${options.quality}`);

  const decision = await orchestrator.route(task);

  console.log(`\nRoute decision:`);
  console.log(`  Provider: ${decision.provider}`);
  console.log(`  Model: ${decision.modelId}`);
  console.log(`  Reason: ${decision.reason}`);

  console.log(`\nExecuting...`);

  try {
    const result = await orchestrator.execute(task);
    console.log(`\n✅ Response (${result.latencyMs}ms):`);
    console.log("---");
    console.log(result.response);
    console.log("---");
  } catch (error) {
    console.error(`\n❌ Execution failed: ${error}`);
    process.exit(1);
  }
}
