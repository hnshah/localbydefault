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
import { startTui } from "./cli-tui.js";
import { startWebhookServer } from "./cli-webhook.js";
import { startProxy } from "./cli-proxy.js";

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
    socket: { type: "string", short: "S" },
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
  route <prompt>     Show routing decision
  run <prompt>      Route and execute
  proxy             Start OpenAI-compatible proxy (/v1/*)
  serve             Start REST API server
  mcp               Start MCP server
  tui               Start interactive TUI
  webhook           Start webhook receiver
  evaluate          Run evaluation tasks
  compare           Compare routing strategies
  health            Check provider health
  metrics           Show execution metrics
  stats             Show routing statistics
  init              Create default config
  config            Show configuration

Options:
  --model, -m <model>     Specify model
  --provider, -p <prov>   Provider (ollama, openai, anthropic, openrouter)
  --fast, -f              Prefer fastest
  --best, -b              Prefer best quality
  --count, -c <n>          Eval task count
  --policy <policy>        Routing policy
  --port, -P <port>        API/webhook port (default: 3000/3001)
  --socket, -S <path>      MCP socket path

Examples:
  localbydefault route "write a function"
  localbydefault run "hello world"
  localbydefault tui
  localbydefault proxy /path/to/config.yaml
  localbydefault serve --port 3000
  localbydefault webhook --port 3001
  localbydefault mcp --socket /tmp/mcp.sock`);
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
    case "proxy": {
      const configPath = args[0];
      if (!configPath) {
        console.error("Usage: localbydefault proxy <configPath>");
        process.exit(1);
      }
      await startProxy(configPath);
      break;
    }
    case "mcp": {
      await startMcpServer({ socketPath: values.socket });
      break;
    }
    case "tui": {
      await startTui();
      break;
    }
    case "webhook": {
      await startWebhookServer({ port: values.port ? parseInt(values.port, 10) : 3001 });
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
