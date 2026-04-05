#!/usr/bin/env node
import { parseArgs } from "util";
import { routeCommand } from "./cli-route.js";
import { runCommand } from "./cli-run.js";
import { initCommand, configCommand } from "./cli-config.js";
import { healthCommand } from "./cli-health.js";
import { evaluateCommand } from "./cli-evaluate.js";
import { metricsCommand } from "./cli-metrics.js";

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
  evaluate           Run evaluation tasks
  health             Check provider health
  metrics            Show execution metrics
  init               Create default config file
  config             Show current configuration

Options:
  --model, -m <model>     Specify model to use
  --provider, -p <prov>   Specify provider (ollama, openai)
  --fast, -f              Prefer fastest model
  --best, -b              Prefer best quality model
  --count, -c <n>         Number of eval tasks (default: 5)
  --policy <policy>       Routing policy (local-first, cloud-first, best-quality)
  --recent, -n <n>        Show recent n executions
  --summary, -s           Show summary stats

Examples:
  localbydefault route "write a function"
  localbydefault run "hello world"
  localbydefault evaluate --count 10
  localbydefault metrics --summary
  localbydefault metrics --recent 20
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
    case "evaluate": {
      await evaluateCommand({
        count: values.count ? parseInt(values.count, 10) : undefined,
        quality,
        policy: values.policy as "local-first" | "cloud-first" | "best-quality" | undefined,
      });
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
