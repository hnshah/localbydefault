#!/usr/bin/env node
import { parseArgs } from "util";
import { routeCommand } from "./cli-route.js";
import { runCommand } from "./cli-run.js";
import { initCommand, configCommand } from "./cli-config.js";
import { healthCommand } from "./cli-health.js";

const { values, positionals } = parseArgs({
  options: {
    model: { type: "string", short: "m" },
    provider: { type: "string", short: "p" },
    fast: { type: "boolean", short: "f", default: false },
    best: { type: "boolean", short: "b", default: false },
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
  health             Check provider health
  init               Create default config file
  config             Show current configuration

Options:
  --model, -m <model>     Specify model to use
  --provider, -p <prov>   Specify provider (ollama, openai)
  --fast, -f              Prefer fastest model
  --best, -b              Prefer best quality model

Examples:
  localbydefault route "write a function"
  localbydefault run "hello world"
  localbydefault run --fast "simple greeting"
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
    case "health": {
      await healthCommand();
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
