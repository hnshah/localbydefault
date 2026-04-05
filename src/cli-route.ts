import { createOrchestrator } from "./core/orchestrator.js";

export async function routeCommand(
  prompt: string,
  options: { model?: string; provider?: string; quality?: "fast" | "best" }
): Promise<void> {
  const orchestrator = createOrchestrator();

  const task = {
    prompt,
    modality: "text" as const,
    hints: options.quality ? { quality: options.quality } : undefined,
  };

  console.log(`Routing prompt: "${prompt.substring(0, 50)}${prompt.length > 50 ? "..." : ""}"`);
  if (options.quality) console.log(`Quality mode: ${options.quality}`);
  console.log("");

  const decision = await orchestrator.route(task);

  console.log(`✅ Route decision:`);
  console.log(`   Provider: ${decision.provider}`);
  console.log(`   Model: ${decision.modelId}`);
  console.log(`   Reason: ${decision.reason}`);
  console.log("");

  if (decision.alternatives.length > 0) {
    console.log(`   Alternatives:`);
    decision.alternatives.forEach((alt, i) => {
      console.log(`     ${i + 1}. ${alt.modelId} (${alt.provider}) - ${alt.reason}`);
    });
  }
}
