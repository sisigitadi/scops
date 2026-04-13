export function buildBaseUrl(host, port, defaultProtocol = 'https') {
  if (!host) return ''
  const normalizedHost = String(host).trim()
  if (!normalizedHost) return ''

  if (normalizedHost.startsWith('http://') || normalizedHost.startsWith('https://')) {
    return port ? `${normalizedHost}:${port}` : normalizedHost
  }

  const protocol = defaultProtocol || 'https'
  return port ? `${protocol}://${normalizedHost}:${port}` : `${protocol}://${normalizedHost}`
}

