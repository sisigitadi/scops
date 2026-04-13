import { describe, it, expect } from 'vitest';
import { createPasswordHash, verifyPasswordHash, isPasswordHash } from './passwordSecurity';

describe('passwordSecurity utility', () => {
  const testPassword = 'ForensicSecurity2026!';

  it('should identify a valid hash string', () => {
    expect(isPasswordHash('pbkdf2_sha256$120000$salt$hash')).toBe(true);
    expect(isPasswordHash('plaintext')).toBe(false);
    expect(isPasswordHash(null)).toBe(false);
  });

  it('should create and verify a password hash correctly', async () => {
    const hash = await createPasswordHash(testPassword);
    expect(hash).toContain('pbkdf2_sha256$120000$');
    
    const isValid = await verifyPasswordHash(testPassword, hash);
    expect(isValid).toBe(true);

    const isInvalid = await verifyPasswordHash('wrong-password', hash);
    expect(isInvalid).toBe(false);
  });

  it('should reject verification if environment or inputs are corrupted', async () => {
    expect(await verifyPasswordHash('', 'pbkdf2_sha256$120000$salt$hash')).toBe(false);
    expect(await verifyPasswordHash(testPassword, 'invalid-format')).toBe(false);
  });
});
