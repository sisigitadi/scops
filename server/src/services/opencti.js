/* global process */
import axios from 'axios'
import { buildBaseUrl } from '../utils/url.js'

export function resolveOpenctiConfig(overrides = {}) {
  const url = overrides.url || process.env.OPENCTI_API_URL || process.env.OPENCTI_URL || ''
  const token = overrides.token || process.env.OPENCTI_TOKEN || process.env.OPENCTI_API_TOKEN || ''
  return { url, token }
}

function ensureConfig(config) {
  if (!config.url || !config.token) {
    throw new Error('Missing OpenCTI url/token. Provide config in request or set server env variables.')
  }
}

export async function queryOpencti(overrides = {}, query = '', variables = {}) {
  const config = resolveOpenctiConfig(overrides)
  ensureConfig(config)

  const target = config.url.startsWith('http')
    ? `${config.url}/graphql`
    : `${buildBaseUrl(config.url, '', 'https')}/graphql`

  const response = await axios.post(
    target,
    { query, variables },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.token}`
      },
      timeout: 20000
    }
  )

  return response.data
}

export async function testOpenctiConnection(overrides = {}) {
  const data = await queryOpencti(overrides, '{ about { version } }', {})
  return {
    ok: Boolean(data?.data?.about?.version),
    version: data?.data?.about?.version || null
  }
}
