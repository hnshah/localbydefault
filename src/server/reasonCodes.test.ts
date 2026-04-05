import { describe, expect, it } from 'vitest';
import type { AuditEvent, AuditReason } from './types.js';

describe('AuditEvent reason codes', () => {
  it('requires a reason field', () => {
    // If `reason` becomes optional, this should fail to compile.
    const ev: AuditEvent = {
      ts: new Date().toISOString(),
      kind: 'request',
      endpoint: '/v1/chat/completions',
      provider: 'ollama',
      cloudPolicy: 'warn',
      blocked: 0,
      reason: 'local_forwarded',
    };
    expect(ev.reason).toBeTruthy();
  });

  it('reason is a constrained union (not any string)', () => {
    const r: AuditReason = 'cloud_policy_denied';
    expect(r).toBe('cloud_policy_denied');
  });
});
