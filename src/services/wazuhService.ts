import api from './api';

/**
 * wazuhService — Toolchain API Orchestration
 * High-fidelity service for authenticating against and retrieving telemetry 
 * from Wazuh manager instances via the BFF gateway.
 */

const BFF_BASE = (import.meta as any).env.VITE_SOCOPS_BFF_URL || '';

function withBffBase(path: string): string {
  if (!BFF_BASE) return path;
  return `${BFF_BASE}${path}`;
}

export const wazuhService = {
  /**
   * Authenticate against Wazuh manager through BFF and persist token locally.
   */
  authenticate: async (host: string, user: string, password: string, port: string = '55000') => {
    try {
      const response = await api.post(withBffBase('/api/wazuh/authenticate'), {
        config: { host, user, password, port }
      });

      if (response?.token) {
        localStorage.setItem('socops_wazuh_token', response.token);
        return response.token;
      }
      throw new Error('Authentication failed: No token received.');
    } catch (error: any) {
      console.error('Wazuh Auth Error:', error.message);
      throw error;
    }
  },

  /**
   * Fetch active alerts from Wazuh manager through BFF.
   */
  getAlerts: async (host: string, params: any = { limit: 100, offset: 0 }, port: string = '55000') => {
    const token = localStorage.getItem('socops_wazuh_token');
    return api.post(withBffBase('/api/wazuh/alerts'), {
      config: { host, port, token },
      params
    });
  },

  /**
   * Fetch Wazuh agents from manager through BFF.
   */
  getAgents: async (host: string, port: string = '55000') => {
    const token = localStorage.getItem('socops_wazuh_token');
    return api.post(withBffBase('/api/wazuh/agents'), {
      config: { host, port, token }
    });
  }
};
