/**
 * localStorageService — Forensic Persistence Layer
 * High-fidelity orchestration module for maintaining state across 
 * browser sessions, ensuring data integrity for offline operational metrics.
 */

const STORAGE_KEYS = {
  alerts: 'socops_alerts_v2',
  alertsDemo: 'socops_alerts_demo_v1'
};

function safeParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) return fallback;
    return safeParse(rawValue, fallback);
  } catch {
    return fallback;
  }
}

export function writeStorage(key: string, value: any): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error: any) {
    if (error?.name === 'QuotaExceededError') {
      console.warn(`Local storage quota exceeded for key: ${key}`);
      return;
    }
    console.warn(`Local storage write failed for key: ${key}`);
  }
}

export function removeStorage(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // No-op: storage unavailable or blocked.
  }
}

export { STORAGE_KEYS };
