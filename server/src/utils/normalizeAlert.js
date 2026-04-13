function isValidDate(value) {
  return !Number.isNaN(new Date(value).getTime())
}

function toIsoTimestamp(rawAlert) {
  const directTimestamp = rawAlert?.timestamp || rawAlert?.['@timestamp'] || rawAlert?.createdAt
  if (directTimestamp && isValidDate(directTimestamp)) {
    return new Date(directTimestamp).toISOString()
  }

  const date = rawAlert?.date
  const time = rawAlert?.time || '00:00:00'
  if (date && isValidDate(`${date}T${time}Z`)) {
    return new Date(`${date}T${time}Z`).toISOString()
  }

  return new Date().toISOString()
}

function deriveSeverity(rawSeverity, ruleLevel) {
  if (typeof rawSeverity === 'string' && rawSeverity.trim()) {
    return rawSeverity.toLowerCase()
  }

  const numericLevel = Number(ruleLevel) || 0
  if (numericLevel >= 13) return 'critical'
  if (numericLevel >= 10) return 'high'
  if (numericLevel >= 7) return 'medium'
  return 'low'
}

function deriveStatus(rawStatus) {
  const normalized = typeof rawStatus === 'string' ? rawStatus.toLowerCase() : ''
  if (normalized === 'open' || normalized === 'investigating' || normalized === 'closed') {
    return normalized
  }
  return 'open'
}

function deriveId(rawAlert, index = 0) {
  const value = rawAlert?.id || rawAlert?.alertId || rawAlert?._id || `ALT-${Date.now()}-${index}`
  return String(value)
}

export function normalizeAlert(rawAlert, index = 0) {
  const timestamp = toIsoTimestamp(rawAlert)
  const [date, timeWithMs = '00:00:00.000Z'] = timestamp.split('T')
  const time = timeWithMs.replace('Z', '').split('.')[0]
  const id = deriveId(rawAlert, index)
  const ruleLevel = Number(rawAlert?.ruleLevel ?? rawAlert?.rule_level ?? rawAlert?.rule?.level ?? 0)

  return {
    ...rawAlert,
    id,
    alertId: rawAlert?.alertId || id,
    timestamp,
    date,
    time,
    ruleId: String(rawAlert?.ruleId || rawAlert?.rule_id || rawAlert?.rule?.id || rawAlert?.rule?.sid || 'N/A'),
    ruleDescription: rawAlert?.ruleDescription || rawAlert?.rule_description || rawAlert?.rule?.description || rawAlert?.full_log || 'Unlabeled alert',
    ruleLevel,
    category: rawAlert?.category || 'Network Anomaly',
    severity: deriveSeverity(rawAlert?.severity, ruleLevel),
    agentName: rawAlert?.agentName || rawAlert?.agent_name || rawAlert?.agent?.name || '',
    hostname: rawAlert?.hostname || rawAlert?.agent?.name || rawAlert?.agentName || '',
    sourceIp: rawAlert?.sourceIp || rawAlert?.srcip || rawAlert?.data?.srcip || rawAlert?.data?.src_ip || rawAlert?.network?.src_ip || '',
    status: deriveStatus(rawAlert?.status),
    eventCount: Number(rawAlert?.eventCount ?? 1),
    analyst: rawAlert?.analyst || rawAlert?.assignedTo || 'Unassigned',
    history: Array.isArray(rawAlert?.history) ? rawAlert.history : [],
    checklist: rawAlert?.checklist && typeof rawAlert.checklist === 'object' ? rawAlert.checklist : {},
    escalated: Boolean(rawAlert?.escalated),
    isFalsePositive: Boolean(rawAlert?.isFalsePositive)
  }
}

