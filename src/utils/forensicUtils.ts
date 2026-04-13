/**
 * forensicUtils — Investigative Logic Matrix
 * High-fidelity utility set for identifying data mutations and 
 * asserting forensic data obfuscation protocols across the platform.
 */

/**
 * diffObjects — Data Mutation Assertion
 * Compares two telemetry objects and identifies state transitions 
 * with built-in sensitivity awareness.
 */
export const diffObjects = (before: any, after: any): any => {
  if (!before) return { type: 'CREATE', after };
  if (!after) return { type: 'DELETE', before };

  const diff: Record<string, { before: any; after: any }> = {};
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

  allKeys.forEach(key => {
    // Investigative Rule: Redact sensitive cryptographic material
    if (key.toLowerCase().includes('password') || key.toLowerCase().includes('token') || key.toLowerCase().includes('hash')) {
      if (before[key] !== after[key]) {
        diff[key] = { before: '[SENSITIVE]', after: '[MODIFIED]' };
      }
      return;
    }

    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      diff[key] = {
        before: before[key],
        after: after[key]
      };
    }
  });

  return Object.keys(diff).length > 0 ? diff : null;
};

/**
 * maskData — Forensic Data Obfuscation
 * Performs surgical redaction on technical telemetry to preserve 
 * operational privacy while maintaining investigative context.
 */
export const maskData = (value: string, type: 'ip' | 'email' | 'password' | 'generic' = 'generic'): string => {
  if (!value) return value;
  
  switch (type) {
    case 'ip':
      return value.replace(/\d+\.\d+\.$/, 'xxx.xxx.');
    case 'email':
      return value.replace(/(.{2})(.*)(?=@)/, (match, p1) => `${p1}***`);
    case 'password':
      return '••••••••';
    default:
      return value;
  }
};

/**
 * generateTransactionHash — Forensic Integrity Signature
 * Produces a unique, non-repudiation tactical signature for an action payload.
 */
export const generateTransactionHash = (payload: any, timestamp: string): string => {
  const raw = `${JSON.stringify(payload)}-${timestamp}-${Math.random()}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `TX-${Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')}`;
};
