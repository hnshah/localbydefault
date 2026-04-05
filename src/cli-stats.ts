import { createOrchestrator } from "./core/orchestrator.js";

export async function statsCommand(): Promise<void> {
  const orchestrator = createOrchestrator();

  console.log("📊 Routing Statistics\n");

  // Show provider list
  const providers = orchestrator.listProviders();
  console.log("Providers:");
  for (const p of providers) {
    const status = p.available ? "✅ available" : "❌ unavailable";
    console.log(`  ${p.id}: ${status}`);
  }

  console.log("\n📈 Routing Distribution:");
  console.log("  (Run 'localbydefault metrics --summary' for detailed metrics)");
}
