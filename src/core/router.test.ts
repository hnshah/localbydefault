import { describe, expect, it } from 'vitest';
import { Router } from './router.js';

describe('Router (local-first policy)', () => {
  it('routes text tasks to a local model when available', () => {
    const router = new Router({ providers: ['ollama'], policy: 'local-first' });
    const decision = router.route({ prompt: 'write a function', modality: 'text' });
    expect(decision.modelId).toBe('qwen2.5-coder:32b');
    expect(decision.reason).toContain('local-first');
  });

  it('routes vision tasks to a vision-capable local model', () => {
    const router = new Router({ providers: ['ollama'], policy: 'local-first' });
    const decision = router.route({ prompt: 'analyze this screenshot', modality: 'vision' });
    expect(decision.modelId).toBe('llama3.2-vision:90b');
  });

  it('throws if no models support the task modality', () => {
    const router = new Router({
      providers: ['ollama'],
      policy: 'local-first',
      config: {
        models: [
          {
            id: 'qwen2.5-coder:32b',
            provider: 'ollama',
            modalities: ['text'],
            costPer1MTokensUsd: 0,
          },
        ],
      } as any,
    });

    expect(() => router.route({ prompt: 'need vision', modality: 'vision' })).toThrow(/No model available/);
  });

  it('respects quality hint for fast mode', () => {
    const router = new Router({ providers: ['ollama'], policy: 'local-first' });
    const decision = router.route({ 
      prompt: 'simple task', 
      modality: 'text',
      hints: { quality: 'fast' }
    });
    expect(decision.reason).toContain('fast');
  });

  it('returns alternatives when multiple models exist', () => {
    const router = new Router({ providers: ['ollama'], policy: 'local-first' });
    const decision = router.route({ prompt: 'test', modality: 'text' });
    expect(decision.alternatives.length).toBeGreaterThan(0);
  });
});
