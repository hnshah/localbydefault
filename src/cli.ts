#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { Router } from './core/router.js';
import type { ModelSpec, Task } from './core/types.js';

const program = new Command();

const DEFAULT_MODELS: ModelSpec[] = [
  { id: 'qwen2.5-coder:32b', provider: 'ollama', modalities: ['text'], costPer1MTokensUsd: 0 },
  { id: 'llama3.2-vision:90b', provider: 'ollama', modalities: ['vision'], costPer1MTokensUsd: 0 },
  { id: 'gpt-4.1-mini', provider: 'openai_compatible', modalities: ['text'], costPer1MTokensUsd: 0.15 },
];

program
  .name('localbydefault')
  .description('Local-first model orchestration')
  .version('0.1.0');

program
  .command('route')
  .description('Route a task to the best model')
  .requiredOption('-p, --prompt <prompt>', 'Task prompt')
  .option('-m, --modality <modality>', 'text|vision', 'text')
  .action((opts) => {
    const router = new Router(DEFAULT_MODELS, { localFirst: true });
    const task: Task = { prompt: String(opts.prompt), modality: opts.modality } as any;
    const decision = router.route(task);

    console.log(chalk.bold('\nlocalbydefault route\n'));
    console.log(`${chalk.cyan('model:')} ${decision.modelId}`);
    console.log(`${chalk.cyan('provider:')} ${decision.provider}`);
    console.log(`${chalk.cyan('reason:')} ${decision.reason}`);
    if (decision.alternatives.length) {
      console.log(chalk.dim(`alternatives: ${decision.alternatives.map(a => a.modelId).join(', ')}`));
    }
  });

program.parse();
