import type { Provider, ProviderId } from "./types.js";

export interface HealthStatus {
  provider: ProviderId;
  healthy: boolean;
  latencyMs?: number;
  error?: string;
}

export async function checkProviderHealth(
  provider: Provider,
  timeoutMs = 5000
): Promise<HealthStatus> {
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    // Use provider's ping method if available, otherwise do minimal chat
    const healthy = await (provider as { ping?: () => Promise<boolean> }).ping?.() 
      ?? provider.chat("qwen2.5-coder:7b", [
        { role: "user", content: "hi" }
      ]).then(() => true).catch(() => false);

    clearTimeout(timeout);

    return {
      provider: provider.id,
      healthy: healthy as boolean,
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      provider: provider.id,
      healthy: false,
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function checkAllProviders(
  providers: Map<string, Provider>,
  timeoutMs = 5000
): Promise<HealthStatus[]> {
  const checks = Array.from(providers.entries()).map(
    async ([, provider]) => checkProviderHealth(provider, timeoutMs)
  );

  return Promise.all(checks);
}
