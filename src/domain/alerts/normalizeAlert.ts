const DEFAULT_STATUS = 'open';

/**
 * Alert — Forensic Telemetry Data Structure
 * Strictly typed representation of a security event, 
 * capturing all necessary forensic parameters for correlation and triage.
 */
export interface Alert {
  id: string;
  alertId: string;
  timestamp: string;
  date: string;
  time: string;
  ruleId: string;
  ruleDescription: string;
  ruleLevel: number;
  category: string;
  severity: string;
  agentName: string;
  hostname: string;
  sourceIp: string;
  destinationIp?: string;
  status: 'open' | 'investigating' | 'closed';
  eventCount: number;
  analyst: string;
  history: any[];
  checklist: Record<string, boolean>;
  escalated: boolean;
  isFalsePositive: boolean;
  asset?: string;
  assetCriticality?: string;
  user?: string;
  summary?: string;
  [key: string]: any;
}

function isValidDate(value: any): boolean {
  return !Number.isNaN(new Date(value).getTime());
}

function toIsoTimestamp(rawAlert: any): string {
  const directTimestamp = rawAlert?.timestamp || rawAlert?.['@timestamp'] || rawAlert?.createdAt;
  if (directTimestamp && isValidDate(directTimestamp)) {
    return new Date(directTimestamp).toISOString();
  }

  const date = rawAlert?.date;
  const time = rawAlert?.time || '00:00:00';
  if (date && isValidDate(`${date}T${time}Z`)) {
    return new Date(`${date}T${time}Z`).toISOString();
  }

  return new Date().toISOString();
}

function deriveSeverity(rawSeverity: any, ruleLevel: number): string {
  if (typeof rawSeverity === 'string' && rawSeverity.trim()) {
    return rawSeverity.toLowerCase();
  }

  const numericLevel = Number(ruleLevel) || 0;
  if (numericLevel >= 13) return 'critical';
  if (numericLevel >= 10) return 'high';
  if (numericLevel >= 7) return 'medium';
  return 'low';
}

function deriveStatus(rawStatus: any): 'open' | 'investigating' | 'closed' {
  const normalized = typeof rawStatus === 'string' ? rawStatus.toLowerCase() : '';
  if (normalized === 'open' || normalized === 'investigating' || normalized === 'closed') {
    return normalized as 'open' | 'investigating' | 'closed';
  }
  return DEFAULT_STATUS as 'open';
}

function deriveRuleId(rawAlert: any): string {
  const value = (
    rawAlert?.ruleId ||
    rawAlert?.rule_id ||
    rawAlert?.rule?.id ||
    rawAlert?.rule?.sid ||
    rawAlert?.signature ||
    'N/A'
  );
  return String(value);
}

function deriveRuleDescription(rawAlert: any): string {
  return (
    rawAlert?.ruleDescription ||
    rawAlert?.rule_description ||
    rawAlert?.rule?.description ||
    rawAlert?.full_log ||
    rawAlert?.title ||
    'Unlabeled alert'
  );
}

function deriveSourceIp(rawAlert: any): string {
  return (
    rawAlert?.sourceIp ||
    rawAlert?.srcip ||
    rawAlert?.data?.srcip ||
    rawAlert?.data?.src_ip ||
    rawAlert?.network?.src_ip ||
    ''
  );
}

function deriveId(rawAlert: any, index: number = 0): string {
  const value = (
    rawAlert?.id ||
    rawAlert?.alertId ||
    rawAlert?._id ||
    `ALT-${Date.now()}-${index}`
  );
  return String(value);
}

export function normalizeAlert(rawAlert: any, index: number = 0): Alert {
  const timestamp = toIsoTimestamp(rawAlert);
  const [date, timeWithMs = '00:00:00.000Z'] = timestamp.split('T');
  const time = timeWithMs.replace('Z', '').split('.')[0];
  const id = deriveId(rawAlert, index);
  const ruleLevel = Number(rawAlert?.ruleLevel ?? rawAlert?.rule_level ?? rawAlert?.rule?.level ?? 0);

  return {
    ...rawAlert,
    id,
    alertId: rawAlert?.alertId || id,
    timestamp,
    date,
    time,
    ruleId: deriveRuleId(rawAlert),
    ruleDescription: deriveRuleDescription(rawAlert),
    ruleLevel,
    category: rawAlert?.category || 'Network Anomaly',
    severity: deriveSeverity(rawAlert?.severity, ruleLevel),
    agentName: rawAlert?.agentName || rawAlert?.agent_name || rawAlert?.agent?.name || rawAlert?.asset || '',
    hostname: rawAlert?.hostname || rawAlert?.agent?.name || rawAlert?.agentName || rawAlert?.asset || '',
    sourceIp: deriveSourceIp(rawAlert),
    status: deriveStatus(rawAlert?.status),
    eventCount: Number(rawAlert?.eventCount ?? 1),
    analyst: rawAlert?.analyst || rawAlert?.assignedTo || 'Unassigned',
    history: Array.isArray(rawAlert?.history) ? rawAlert.history : [],
    checklist: rawAlert?.checklist && typeof rawAlert.checklist === 'object' ? rawAlert.checklist : {},
    escalated: Boolean(rawAlert?.escalated),
    isFalsePositive: Boolean(rawAlert?.isFalsePositive)
  };
}

export function normalizeAlerts(rawAlerts: any[] = []): Alert[] {
  if (!Array.isArray(rawAlerts)) return [];
  return rawAlerts.map((alert, index) => normalizeAlert(alert, index));
}
