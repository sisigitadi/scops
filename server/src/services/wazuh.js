/* global process */
import axios from 'axios'
import { buildBaseUrl } from '../utils/url.js'
import { normalizeAlert } from '../utils/normalizeAlert.js'

export function resolveIndexerConfig(overrides = {}) {
  const envUrl = process.env.WAZUH_INDEXER_URL || process.env.WAZUH_INDEXER_HOST || ''
  const host = overrides.host || envUrl.replace(/https?:\/\//, '').split(':')[0] || '192.168.100.163'
  const port = overrides.port || envUrl.split(':').pop() || process.env.WAZUH_INDEXER_PORT || '9200'
  const user = overrides.user || process.env.WAZUH_INDEXER_USER || process.env.WAZUH_INDEXER_USERNAME || 'admin'
  const password = overrides.password || process.env.WAZUH_INDEXER_PASSWORD || 'WazuhAdmin123!'
  return { host, port, user, password }
}

export function resolveManagerConfig(overrides = {}) {
  const envUrl = process.env.WAZUH_MANAGER_URL || process.env.WAZUH_API_URL || process.env.WAZUH_MANAGER_HOST || ''
  const host = overrides.host || envUrl.replace(/https?:\/\//, '').split(':')[0] || '192.168.100.163'
  const port = overrides.port || envUrl.split(':').pop() || process.env.WAZUH_MANAGER_PORT || '55000'
  const user = overrides.user || process.env.WAZUH_MANAGER_USER || process.env.WAZUH_MANAGER_USERNAME || process.env.WAZUH_API_USER || 'wazuh'
  const password = overrides.password || process.env.WAZUH_MANAGER_PASSWORD || process.env.WAZUH_API_PASSWORD || 'wazuh'
  const token = overrides.token || process.env.WAZUH_MANAGER_TOKEN || ''
  return { host, port, user, password, token }
}


function ensureConfig(config, label) {
  if (!config.host || !config.user || !config.password) {
    const missing = [`${label} host`, `${label} user`, `${label} password`].join(', ')
    throw new Error(`Missing ${missing}. Provide config in request or set server env variables.`)
  }
}

import https from 'https';

export async function testIndexerConnection(overrides = {}) {
  const config = resolveIndexerConfig(overrides);
  ensureConfig(config, 'Wazuh indexer');

  const url = buildBaseUrl(config.host, config.port, 'http'); // Forced http based on EPROTO error
  console.log(`[WAZUH-INDEXER] Testing connectivity to: ${url}`);

  try {
    // Try a few common endpoints (Root for OpenSearch, /api/index or /version for ZincSearch)
    const endpoints = ['', '/api/index', '/version'];
    let lastError = null;

    for (const ep of endpoints) {
      try {
        const response = await axios.get(`${url}${ep}`, {
          auth: { username: config.user, password: config.password },
          timeout: 5000
        });
        
        console.log(`[WAZUH-INDEXER] Success on endpoint: ${ep}`);
        return {
          ok: true,
          version: response.data?.version?.number || response.data?.version || 'Connected'
        };
      } catch (err) {
        lastError = err;
        if (err.response?.status === 401) break; // If auth fails, no point in trying other endpoints
      }
    }

    // If we reach here, it failed
    if (lastError.response) {
      console.error(`[WAZUH-INDEXER] Auth/Status Error: ${lastError.response.status}`);
      if (lastError.response.status === 401) {
        throw new Error('Authentication failed: Invalid username or password for Wazuh Indexer/ZincSearch.');
      }
      throw new Error(`Server returned status ${lastError.response.status}`);
    }
    throw lastError;

  } catch (error) {
    console.error(`[WAZUH-INDEXER] Final failure:`, error.message);
    throw error;
  }
}



export async function testManagerConnection(overrides = {}) {
  const config = resolveManagerConfig(overrides)
  ensureConfig(config, 'Wazuh manager')

  const baseUrl = buildBaseUrl(config.host, config.port || '55000', 'https')
  const response = await axios.post(
    `${baseUrl}/security/user/authenticate`,
    {},
    {
      auth: { username: config.user, password: config.password },
      timeout: 8000
    }
  )

  return {
    ok: Boolean(response.data?.data?.token || response.data?.token)
  }
}

export async function authenticateManager(overrides = {}) {
  const config = resolveManagerConfig(overrides)
  ensureConfig(config, 'Wazuh manager')

  const baseUrl = buildBaseUrl(config.host, config.port || '55000', 'https')
  const response = await axios.post(
    `${baseUrl}/security/user/authenticate`,
    {},
    {
      auth: { username: config.user, password: config.password },
      timeout: 12000
    }
  )

  const token = response.data?.data?.token || response.data?.token || ''
  if (!token) {
    throw new Error('Wazuh manager authentication succeeded but no token was returned.')
  }

  return token
}

async function resolveManagerToken(config) {
  if (config.token) return config.token
  if (config.user && config.password) {
    return authenticateManager(config)
  }
  throw new Error('Missing Wazuh manager token. Provide token or user/password.')
}

function ensureManagerHost(config) {
  if (!config.host) {
    throw new Error('Missing Wazuh manager host. Provide config in request or set server env variables.')
  }
}

export async function fetchManagerAlerts(overrides = {}, params = { limit: 100, offset: 0 }) {
  const config = resolveManagerConfig(overrides)
  ensureManagerHost(config)
  const token = await resolveManagerToken(config)
  const baseUrl = buildBaseUrl(config.host, config.port || '55000', 'https')

  const response = await axios.get(`${baseUrl}/alerts`, {
    headers: { Authorization: `Bearer ${token}` },
    params,
    timeout: 20000
  })

  return response.data
}

export async function fetchManagerAgents(overrides = {}) {
  const config = resolveManagerConfig(overrides)
  ensureManagerHost(config)
  const token = await resolveManagerToken(config)
  const baseUrl = buildBaseUrl(config.host, config.port || '55000', 'https')

  const response = await axios.get(`${baseUrl}/agents`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 20000
  })

  return response.data
}

export async function fetchAlerts(overrides = {}, queryParams = {}) {
  const config = resolveIndexerConfig(overrides)
  ensureConfig(config, 'Wazuh indexer')

  const url = buildBaseUrl(config.host, config.port, 'https')
  const index = 'wazuh-alerts-*'
  const searchBody = {
    size: queryParams.limit || 50,
    sort: [{ timestamp: { order: 'desc' } }],
    query: {
      bool: {
        must: [{ range: { 'rule.level': { gte: queryParams.minLevel || 3 } } }]
      }
    }
  }

  const response = await axios.post(`${url}/${index}/_search`, searchBody, {
    auth: { username: config.user, password: config.password },
    timeout: 20000
  })

  const hits = response.data?.hits?.hits || []
  return hits.map((hit, indexValue) =>
    normalizeAlert(
      {
        id: hit._id,
        timestamp: hit._source?.timestamp,
        ruleLevel: hit._source?.rule?.level,
        ruleDescription: hit._source?.rule?.description,
        agentName: hit._source?.agent?.name,
        sourceIp: hit._source?.data?.srcip || hit._source?.srcip,
        hostname: hit._source?.agent?.name || hit._source?.agent?.hostname,
        ...hit._source
      },
      indexValue
    )
  )
}
