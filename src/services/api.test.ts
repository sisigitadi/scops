import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from './api';
import axios from 'axios';

// Mock axios to avoid actual network requests
vi.mock('axios', async () => {
    const actual = await vi.importActual('axios');
    return {
        default: {
            ...actual.default,
            create: vi.fn(() => ({
                interceptors: {
                    request: { use: vi.fn() },
                    response: { use: vi.fn() }
                },
                post: vi.fn(),
                get: vi.fn()
            }))
        }
    };
});

describe('API Service Normalization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Since we use interceptors, we mostly trust axios, 
  // but we should ensure 'api' is exported correctly.
  it('should export an axios instance', () => {
    expect(api).toBeDefined();
    expect(typeof api.post).toBe('function');
    expect(typeof api.get).toBe('function');
  });
});
