import type { CloudPolicy } from './types.js';

export class CloudPolicyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CloudPolicyError';
  }
}

export function enforceCloudPolicy(policy: CloudPolicy): {
  blocked: boolean;
  warning?: string;
} {
  switch (policy) {
    case 'allow':
      return { blocked: false };
    case 'warn':
      return { blocked: false, warning: 'cloud_policy=warn: forwarding request to cloud' };
    case 'deny':
      return { blocked: true };
    default: {
      // Exhaustiveness for runtime inputs
      const neverPolicy: never = policy;
      throw new CloudPolicyError(`Unknown cloud policy: ${String(neverPolicy)}`);
    }
  }
}

