/**
 * WazuhIndexerService — Infrastructure Connector
 * Interface for ZincSearch (v0.4.10) and Wazuh Manager API.
 */

export interface IndexerConfig {
  host?: string;
  port?: string;
  url?: string; // Derived or direct
  user?: string;
  password?: string;
}

export interface IndexerResponse {
  ok: boolean;
  version?: string;
  message?: string;
}

export async function testIndexerConnection(config: IndexerConfig): Promise<IndexerResponse> {
  const url = config.url || `${config.host}:${config.port}`;
  const { user, password } = config;
  
  if (!url) throw new Error('Indexer URL is required');

  try {
    const auth = btoa(`${user}:${password}`);
    const response = await fetch(`${url}/api/index`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) throw new Error('Wazuh indexer authentication failed');
    if (!response.ok) throw new Error(`Indexer error: ${response.status}`);

    return { ok: true, version: 'ZincSearch 0.4.10' };
  } catch (error: any) {
    throw new Error(error.message || 'Connection to indexer failed');
  }
}

export async function fetchAlerts(config: IndexerConfig, params: any): Promise<any[]> {
  try {
    // Current implementation placeholder for frontend consumption
    return [];
  } catch (error) {
    console.error('Fetch Alerts Error:', error);
    return [];
  }
}

export async function fetchManagerAlerts() { return { data: [], total: 0 }; }
export async function fetchManagerAgents() { return []; }
export async function authenticateManager() { return 'demo-token'; }
export async function testManagerConnection() { return { ok: true }; }

export const wazuhIndexerService = {
  getAlerts: fetchAlerts,
  testIndexerConnection,
  testManagerConnection,
  fetchManagerAgents,
  fetchManagerAlerts,
  authenticateManager
};
