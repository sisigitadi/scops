const BFF_BASE = (import.meta as any).env.VITE_SOCOPS_BFF_URL || '';

/**
 * API_ENDPOINTS — Connectivity Control Plane
 * Centralized registry for all toolchain endpoints, ensuring consistent 
 * URI resolution across the operational platform.
 */

function withBase(path: string): string {
  if (!BFF_BASE) return path;
  return `${BFF_BASE}${path}`;
}

export const API_ENDPOINTS = {
  health: withBase('/api/health'),
  alerts: withBase('/api/alerts'),
  openctiQuery: withBase('/api/opencti/query'),
  telegramSend: withBase('/api/telegram/send'),
  telegramTest: withBase('/api/test/telegram'),
  wazuhAuthenticate: withBase('/api/wazuh/authenticate'),
  wazuhManagerAlerts: withBase('/api/wazuh/alerts'),
  wazuhManagerAgents: withBase('/api/wazuh/agents')
};
