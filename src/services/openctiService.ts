import api from './api';

/**
 * OpenCTI Service — Threat Intelligence Connector
 * Proxies GraphQL queries through the BFF to bypass CORS and manage sensitive tokens.
 */

const BFF_BASE = (import.meta.env.VITE_SOCOPS_BFF_URL as string) || '';

function withBffBase(path: string): string {
  if (!BFF_BASE) return path;
  return `${BFF_BASE}${path}`;
}

export const openctiService = {
  query: async (url: string, token: string, query: string, variables: Record<string, any> = {}) => {
    return api.post(withBffBase('/api/opencti/query'), {
      config: { url, token },
      query,
      variables
    });
  },

  testConnection: async (url: string, token: string) => {
    return api.post(withBffBase('/api/test/opencti'), {
      config: { url, token }
    });
  },

  getIndicators: async (url: string, token: string, limit = 50) => {
    const gqlQuery = `
      query GetIndicators($first: Int) {
        indicators(first: $first) {
          edges {
            node {
              id
              name
              description
              indicator_types
              pattern
              confidence
            }
          }
        }
      }
    `;
    return openctiService.query(url, token, gqlQuery, { first: limit });
  }
};
