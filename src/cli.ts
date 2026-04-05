#!/usr/bin/env node
import { parseArgs } from "util";
import { routeCommand } from "./cli-route.js";
import { runCommand } from "./cli-run.js";
import { initCommand, configCommand } from "./cli-config.js";

const { values, positionals } = parseArgs({
  options: {
    model: { type: "string", short: "m" },
    provider: { type: "string", short: "p" },
    fast: { type: "boolean", default: false },
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
  init               Create default config file
  config             Show current configuration

Options:
  --model, -m <model>     Specify model to use
  --provider, -p <prov>   Specify provider (ollama, openai)
  --fast                  Prefer fastest model

Examples:
  localbydefault route "write a function"
  localbydefault run "hello world"
  localbydefault config
  localbydefault init`);
    process.exit(1);
  }

  switch (command) {
    case "route": {
      const prompt = args.join(" ");
      if (!prompt) {
        console.error("Usage: localbydefault route <prompt>");
        process.exit(1);
      }
      await routeCommand(prompt, {
        model: values.model,
        provider: values.provider,
      });
      break;
    }
    case "run": {
      const prompt = args.join(" ");
      if (!prompt) {
        console.error("Usage: localbydefault run <prompt>");
        process.exit(1);
      }
      await runCommand(prompt, {
        model: values.model,
        provider: values.provider,
        fast: values.fast,
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
