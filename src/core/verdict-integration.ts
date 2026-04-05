import { createOrchestrator, type OrchestratorConfig } from "./orchestrator.js";
import type { Task, RouteDecision } from "./types.js";

export interface EvalResult {
  task: string;
  routingDecision: RouteDecision;
  response: string;
  latencyMs: number;
  success: boolean;
  error?: string;
}

export interface EvalHooks {
  onRoute?: (task: Task, decision: RouteDecision) => void;
  onExecute?: (task: Task, result: EvalResult) => void;
  onError?: (task: Task, error: Error) => void;
}

export interface EvaluationConfig {
  tasks: Array<{ prompt: string; modality?: "text" | "vision" }>;
  quality?: "fast" | "balanced" | "best";
  hooks?: EvalHooks;
}

/**
 * Run evaluation through localbydefault routing
 */
export async function runEvaluation(
  config: EvaluationConfig,
  orchestratorConfig?: OrchestratorConfig
): Promise<{
  results: EvalResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
    avgLatencyMs: number;
    routingDistribution: Record<string, number>;
  };
}> {
  const orchestrator = createOrchestrator(orchestratorConfig);
  const results: EvalResult[] = [];

  for (const taskDef of config.tasks) {
    const task: Task = {
      prompt: taskDef.prompt,
      modality: taskDef.modality ?? "text",
      hints: config.quality ? { quality: config.quality } : undefined,
    };

    // Route first
    const decision = await orchestrator.route(task);
    config.hooks?.onRoute?.(task, decision);

    // Execute
    const result: EvalResult = {
      task: taskDef.prompt,
      routingDecision: decision,
      response: "",
      latencyMs: 0,
      success: false,
    };

    try {
      const execResult = await orchestrator.execute(task);
      result.response = execResult.response;
      result.latencyMs = execResult.latencyMs;
      result.success = true;
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
    }

    config.hooks?.onExecute?.(task, result);
    results.push(result);
  }

  // Compute summary
  const summary = {
    total: results.length,
    successful: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    avgLatencyMs:
      results.reduce((sum, r) => sum + r.latencyMs, 0) / results.length || 0,
    routingDistribution: results.reduce((dist, r) => {
      const key = r.routingDecision.modelId;
      dist[key] = (dist[key] || 0) + 1;
      return dist;
    }, {} as Record<string, number>),
  };

  return { results, summary };
}

/**
 * Compare routing strategies
 */
export async function compareRoutingStrategies(
  prompts: string[],
  policies: Array<"local-first" | "cloud-first" | "best-quality">
): Promise<
  Record<
    string,
    {
      results: EvalResult[];
      summary: { avgLatencyMs: number; successRate: number };
    }
  >
> {
  const comparisons: Record<
    string,
    { results: EvalResult[]; summary: { avgLatencyMs: number; successRate: number } }
  > = {};

  for (const policy of policies) {
    const { results, summary } = await runEvaluation(
      { tasks: prompts.map((p) => ({ prompt: p })) },
      { policy }
    );
    comparisons[policy] = {
      results,
      summary: {
        avgLatencyMs: summary.avgLatencyMs,
        successRate: summary.successful / summary.total,
      },
    };
  }

  return comparisons;
}
