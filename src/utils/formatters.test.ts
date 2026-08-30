import { describe, it, expect } from 'vitest';
import { formatDateTime } from './formatters';

describe('formatters utility', () => {
  it('should format a date to WIB medium/short style', () => {
    // 2024-05-20 10:00:00 UTC -> 2024-05-20 17:00:00 WIB
    const date = new Date('2024-05-20T10:00:00Z');
    const formatted = formatDateTime(date);
    
    // Exact string can vary slightly by environment locale, but check for key components
    expect(formatted).toContain('2024');
    expect(formatted).toContain('17:00');
  });
});
