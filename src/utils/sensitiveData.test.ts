import { describe, it, expect } from 'vitest';
import { obfuscateValue } from './sensitiveData';

describe('sensitiveData utility', () => {
  it('should return a dash for null or undefined', () => {
    expect(obfuscateValue(null)).toBe('-');
    expect(obfuscateValue(undefined)).toBe('-');
  });

  it('should fully mask IPv4 addresses', () => {
    expect(obfuscateValue('192.168.1.1')).toBe('***.***.***.***');
    expect(obfuscateValue('10.0.0.254')).toBe('***.***.***.***');
  });

  it('should fully mask email addresses', () => {
    expect(obfuscateValue('admin@socops.com')).toBe('***@***.***');
    expect(obfuscateValue('user.test@gmail.com')).toBe('***@***.***');
  });

  it('should partially mask IDs or short strings', () => {
    expect(obfuscateValue('12345678')).toBe('12******');
    expect(obfuscateValue('ABC')).toBe('***');
    expect(obfuscateValue('ABCD')).toBe('****');
  });
});
