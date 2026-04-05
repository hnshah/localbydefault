import { describe, expect, it } from 'vitest';
import { Router } from './router.js';
import type { Task } from './types.js';

describe('Router (local-first policy)', () => {
  it('routes text tasks to a local model when available', () => {
    const router = new Router({ providers: ['ollama'], policy: 'local-first' });
    const task: Task = { prompt: 'write a function', modality: 'text' };
    const decision = router.route(task);
    expect(decision.modelId).toBe('qwen2.5-coder:32b');
    expect(decision.reason).toContain('local-first');
  });

  it('routes vision tasks to a vision-capable local model', () => {
    const router = new Router({ providers: ['ollama'], policy: 'local-first' });
    const task: Task = { prompt: 'analyze this screenshot', modality: 'vision' };
    const decision = router.route(task);
    expect(decision.modelId).toBe('llama3.2-vision:90b');
  });

  it('throws if no models support the task modality', () => {
    const router = new Router({ providers: ['ollama'], policy: 'local-first' });
    expect(() => router.route({ prompt: 'audio', modality: 'vision' })).toThrow(/No model available/);
  });
});
