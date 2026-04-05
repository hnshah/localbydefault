import { describe, expect, it } from 'vitest';
import { enforceCloudPolicy } from './cloudPolicy.js';

describe('cloud policy enforcement', () => {
  it('deny blocks cloud', () => {
    const res = enforceCloudPolicy('deny');
    expect(res.blocked).toBe(true);
  });

  it('warn allows cloud and provides warning message', () => {
    const res = enforceCloudPolicy('warn');
    expect(res.blocked).toBe(false);
    expect(res.warning).toContain('cloud_policy=warn');
  });

  it('allow allows cloud without warning', () => {
    const res = enforceCloudPolicy('allow');
    expect(res.blocked).toBe(false);
    expect(res.warning).toBeUndefined();
  });
});

