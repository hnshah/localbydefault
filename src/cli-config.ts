import { writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { loadConfig, getConfigPath, DEFAULT_CONFIG } from "./core/config.js";

export async function initCommand(): Promise<void> {
  const configPath = getConfigPath();

  if (existsSync(configPath)) {
    console.log(`Config already exists at ${configPath}`);
    console.log("Use 'localbydefault config' to view it");
    return;
  }

  writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2));
  console.log(`✅ Created config at ${configPath}`);
}

export async function configCommand(): Promise<void> {
  const config = loadConfig();
  
  console.log("📋 localbydefault config\n");

  console.log(`Policy: ${config.defaultPolicy}`);
  console.log(`Models: ${config.models.length}\n`);

  for (const model of config.models) {
    const status = model.enabled === false ? "❌ disabled" : "✅ enabled";
    const cost = model.costPer1MTokensUsd === 0 ? "free" : `$${model.costPer1MTokensUsd}/1M`;
    console.log(`  ${model.id} (${model.provider}) - ${cost} - ${status}`);
  }
}
