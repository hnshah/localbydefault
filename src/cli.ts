#!/usr/bin/env node
import { parseArgs } from "util";
import { routeCommand } from "./cli-route.js";
import { runCommand } from "./cli-run.js";
import { initCommand, configCommand } from "./cli-config.js";
import { healthCommand } from "./cli-health.js";
import { evaluateCommand } from "./cli-evaluate.js";
import { metricsCommand } from "./cli-metrics.js";
import { statsCommand } from "./cli-stats.js";
import { compareCommand } from "./cli-compare.js";
import { startApi } from "./cli-api.js";
import { startMcpServer } from "./cli-mcp.js";

const { values, positionals } = parseArgs({
  options: {
    model: { type: "string", short: "m" },
    provider: { type: "string", short: "p" },
    fast: { type: "boolean", short: "f", default: false },
    best: { type: "boolean", short: "b", default: false },
    count: { type: "string", short: "c" },
    policy: { type: "string" },
    recent: { type: "string", short: "n" },
    summary: { type: "boolean", short: "s", default: false },
    port: { type: "string", short: "P" },
    socket: { type: "string", short: "s" },
  },
  allowPositionals: true,
});

const command = positionals[0];
const args = positionals.slice(1);

async function main() {
  if (!command) {
    console.error(`localbydefault - Local-first model orchestration

Usage: localbydefault <command> [options]

Commands:
  route <prompt>     Show routing decision for prompt
  run <prompt>       Route and execute prompt
  serve              Start REST API server
  mcp                Start MCP server (Model Context Protocol)
  evaluate           Run evaluation tasks
  compare            Compare routing strategies
  health             Check provider health
  metrics            Show execution metrics
  stats              Show routing statistics
  init               Create default config file
  config             Show current configuration

Options:
  --model, -m <model>     Specify model to use
  --provider, -p <prov>   Specify provider (ollama, openai, anthropic, openrouter)
  --fast, -f              Prefer fastest/smallest model
  --best, -b              Prefer best quality model
  --count, -c <n>         Number of eval tasks (default: 5)
  --policy <policy>       Routing policy (local-first, cloud-first, best-quality)
  --recent, -n <n>        Show recent n executions
  --summary, -s           Show summary stats
  --port, -P <port>       API server port (default: 3000)
  --socket, -S <path>     MCP socket path (default: /tmp/localbydefault-mcp.sock)

Examples:
  localbydefault route "write a function"
  localbydefault run "hello world"
  localbydefault serve --port 3000
  localbydefault mcp --socket /tmp/mcp.sock
  localbydefault evaluate --count 10
  localbydefault compare
  localbydefault health
  localbydefault config`);
    process.exit(1);
  }

  const quality = values.fast ? "fast" : values.best ? "best" : undefined;

  switch (command) {
    case "route": {
      const prompt = args.join(" ");
      if (!prompt) {
        console.error("Usage: localbydefault route <prompt>");
        process.exit(1);
      }
      await routeCommand(prompt, { model: values.model, provider: values.provider, quality });
      break;
    }
    case "run": {
      const prompt = args.join(" ");
      if (!prompt) {
        console.error("Usage: localbydefault run <prompt>");
        process.exit(1);
      }
      await runCommand(prompt, { model: values.model, provider: values.provider, quality });
      break;
    }
    case "serve": {
      await startApi({ port: values.port ? parseInt(values.port, 10) : undefined });
      break;
    }
    case "mcp": {
      await startMcpServer({ socketPath: values.socket });
      break;
    }
    case "evaluate": {
      await evaluateCommand({
        count: values.count ? parseInt(values.count, 10) : undefined,
        quality,
        policy: values.policy as "local-first" | "cloud-first" | "best-quality" | undefined,
      });
      break;
    }
    case "compare": {
      await compareCommand();
      break;
    }
    case "health": {
      await healthCommand();
      break;
    }
    case "metrics": {
      await metricsCommand({
        recent: values.recent ? parseInt(values.recent, 10) : undefined,
        summary: values.summary,
      });
      break;
    }
    case "stats": {
      await statsCommand();
      break;
    }
    case "init": {
      await initCommand();
      break;
    }
    case "config": {
      await configCommand();
      break;
    }
    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
