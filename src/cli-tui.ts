import { createInterface } from "readline";
import { createOrchestrator } from "./core/orchestrator.js";
import { getMetricsLogger } from "./core/metrics.js";
import { getWebhookManager } from "./core/webhooks.js";

const CLEAR = "\x1b[2J\x1b[H";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

export async function startTui(): Promise<void> {
  console.log(CLEAR);
  console.log(`${BOLD}${CYAN}╔══════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${CYAN}║      localbydefault TUI - Real-time Monitor    ║${RESET}`);
  console.log(`${BOLD}${CYAN}╚══════════════════════════════════════════════╝${RESET}`);
  console.log("");
  console.log(`${YELLOW}Commands:${RESET}`);
  console.log("  route <prompt>  - Show routing decision");
  console.log("  run <prompt>    - Execute prompt");
  console.log("  health          - Check providers");
  console.log("  metrics         - Show metrics summary");
  console.log("  events          - Show recent webhook events");
  console.log("  clear           - Clear screen");
  console.log("  quit            - Exit");
  console.log("");
  console.log(`${CYAN}──────────────────────────────────────────────────${RESET}`);
  console.log("");

  const orchestrator = createOrchestrator();
  const metricsLogger = getMetricsLogger();
  const webhookManager = getWebhookManager();

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${GREEN}localbydefault> ${RESET}`,
  });

  rl.prompt();

  rl.on("line", async (line) => {
    const input = line.trim();
    const parts = input.split(/\s+(.+)/);
    const command = parts[0];
    const arg = parts[1] ?? "";

    try {
      if (command === "quit" || command === "exit" || command === "q") {
        console.log(`${CYAN}Goodbye!${RESET}`);
        rl.close();
        process.exit(0);
      } else if (command === "clear" || command === "cls") {
        console.log(CLEAR);
        console.log(`${BOLD}${CYAN}╔══════════════════════════════════════════════╗${RESET}`);
        console.log(`${BOLD}${CYAN}║      localbydefault TUI - Real-time Monitor    ║${RESET}`);
        console.log(`${BOLD}${CYAN}╚══════════════════════════════════════════════╝${RESET}`);
        console.log("");
      } else if (command === "health") {
        const statuses = await orchestrator.healthCheck();
        console.log(`${CYAN}Provider Status:${RESET}`);
        for (const status of statuses) {
          if (status.healthy) {
            console.log(`  ${GREEN}✅${RESET} ${status.provider}: healthy (${status.latencyMs}ms)`);
          } else {
            console.log(`  ${RED}❌${RESET} ${status.provider}: unhealthy - ${status.error}`);
          }
        }
        console.log("");
      } else if (command === "metrics") {
        const summary = metricsLogger.getSummary();
        console.log(`${CYAN}Metrics Summary:${RESET}`);
        console.log(`  Total: ${summary.total} | ${GREEN}Success: ${summary.successful}${RESET} | ${RED}Failed: ${summary.failed}${RESET}`);
        console.log(`  Avg latency: ${Math.round(summary.avgLatencyMs)}ms`);
        console.log(`  Total cost: $${summary.totalCost.toFixed(6)}`);
        console.log("");
        console.log(`  ${YELLOW}By model:${RESET}`);
        for (const [model, count] of Object.entries(summary.byModel)) {
          console.log(`    ${model}: ${count}`);
        }
        console.log("");
      } else if (command === "events") {
        const events = webhookManager.getRecentEvents(10);
        console.log(`${CYAN}Recent Webhook Events:${RESET}`);
        if (events.length === 0) {
          console.log("  No events recorded.");
        } else {
          for (const event of events) {
            const type = event.type.toUpperCase().padEnd(8);
            const ts = new Date(event.timestamp).toLocaleTimeString();
            console.log(`  ${YELLOW}[${ts}]${RESET} ${type} ${JSON.stringify(event.data).substring(0, 60)}...`);
          }
        }
        console.log("");
      } else if (command === "route" && arg) {
        console.log(`${CYAN}Routing...${RESET}`);
        const decision = await orchestrator.route({ prompt: arg, modality: "text" });
        console.log(`${GREEN}✅ Route decision:${RESET}`);
        console.log(`  Model: ${BOLD}${decision.modelId}${RESET}`);
        console.log(`  Provider: ${decision.provider}`);
        console.log(`  Reason: ${decision.reason}`);
        if (decision.alternatives.length > 0) {
          console.log(`  ${YELLOW}Alternatives:${RESET}`);
          for (const alt of decision.alternatives.slice(0, 3)) {
            console.log(`    - ${alt.modelId} (${alt.provider})`);
          }
        }
        console.log("");
      } else if (command === "run" && arg) {
        console.log(`${CYAN}Executing...${RESET}`);
        const result = await orchestrator.execute({ prompt: arg, modality: "text" });
        console.log(`${GREEN}✅ Response (${result.latencyMs}ms):${RESET}`);
        console.log("---");
        console.log(result.response.substring(0, 200) + (result.response.length > 200 ? "..." : ""));
        console.log("---");
        console.log("");
      } else if (command === "help" || command === "?") {
        console.log(`${CYAN}Available commands:${RESET}`);
        console.log("  route <prompt>  - Show routing decision");
        console.log("  run <prompt>    - Execute prompt");
        console.log("  health          - Check providers");
        console.log("  metrics         - Show metrics summary");
        console.log("  events          - Show recent webhook events");
        console.log("  clear           - Clear screen");
        console.log("  quit            - Exit");
        console.log("");
      } else if (command) {
        console.log(`${RED}Unknown command: ${command}${RESET}`);
        console.log("Type 'help' for available commands.");
        console.log("");
      }
    } catch (error) {
      console.log(`${RED}Error: ${error instanceof Error ? error.message : String(error)}${RESET}`);
      console.log("");
    }

    rl.prompt();
  });

  rl.on("close", () => {
    process.exit(0);
  });
}
