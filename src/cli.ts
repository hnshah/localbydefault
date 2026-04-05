import { parseArgs } from "util";
import { routeCommand } from "./cli-route.js";
import { runCommand } from "./cli-run.js";

const { values, positionals } = parseArgs({
  options: {
    model: { type: "string", short: "m" },
    provider: { type: "string", short: "p" },
    fast: { type: "boolean", default: false },
  },
  allowPositionals: true,
});

const command = positionals[0];
const prompt = positionals.slice(1).join(" ");

if (!command) {
  console.error("Usage: localbydefault <command> [options]");
  console.error("");
  console.error("Commands:");
  console.error("  route <prompt>   Show routing decision for prompt");
  console.error("  run <prompt>    Route and execute prompt");
  console.error("");
  console.error("Options:");
  console.error("  --model, -m <model>     Specify model to use");
  console.error("  --provider, -p <prov> Specify provider (ollama, openai)");
  console.error("  --fast                   Prefer fastest model");
  process.exit(1);
}

switch (command) {
  case "route": {
    if (!prompt) {
      console.error("Usage: localbydefault route <prompt>");
      process.exit(1);
    }
    await routeCommand(prompt, { model: values.model, provider: values.provider });
    break;
  }
  case "run": {
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
  default:
    console.error(`Unknown command: ${command}`);
    process.exit(1);
}
