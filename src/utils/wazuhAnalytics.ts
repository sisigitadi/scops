import { Alert } from '../domain/alerts/normalizeAlert';

/**
 * wazuhAnalytics — Forensic Telemetry Orchestration
 * High-fidelity utility set for identifying data correlations, 
 * calculating situational KPIs, and optimizing investigative focal points.
 */

export function calculateKpis(alerts: Alert[], monitoredAgents: number) {
  const totalAlerts = alerts.length;
  const highPriority = alerts.filter((x) => x.severity === 'high' || x.severity === 'critical').length;
  const openCases = alerts.filter((x) => x.status === 'open' || x.status === 'investigating').length;
  const escalatedCases = alerts.filter((x) => x.escalated).length;
  const falsePositives = alerts.filter((x) => x.isFalsePositive).length;
  const correlatedCases = correlateAlerts(alerts).length;

  const uniqueAgents = new Set(alerts.map(a => a.hostname || a.agentName)).size;

  return {
    totalAlerts,
    highPriority,
    openCases,
    escalatedCases,
    falsePositives,
    monitoredAgents: monitoredAgents || uniqueAgents || 0,
    correlatedCases
  };
}

export function filterByTime(alerts: Alert[], range: string | number, options: { startHour?: string; endHour?: string } = {}): Alert[] {
  if (!range || range === 'all') return alerts;
  const { startHour, endHour } = options;

  if (range === 'custom') {
    if (!startHour || !endHour) return alerts;
    const todayStr = new Date().toISOString().split('T')[0];
    return alerts.filter((a) => {
      if (a.date !== todayStr) return false;
      const hFull = a.time.substring(0, 5); // "HH:mm"
      return hFull >= startHour && hFull <= endHour;
    });
  }
  
  let hours = 0;
  if (typeof range === 'number') {
    hours = range;
  } else {
    // Strategic Preset Mapping
    const map: Record<string, number> = {
      'last1h': 1,
      'last8h': 8,
      'last12h': 12,
      'weekly': 168,
      'monthly': 720
    };
    hours = map[range] || 0;
  }

  const nowTs = new Date().getTime();
  const cutoff = nowTs - (hours * 60 * 60 * 1000);

  if (range === 'today') {
    // Definisi 'Hari Ini' untuk SOC: 24 jam terakhir agar selalu merupakan akumulasi dari rentang 1h, 8h, dan 12h.
    return alerts.filter(a => {
      const alertTs = new Date(`${a.date}T${a.time}Z`).getTime();
      return alertTs >= (nowTs - 24 * 60 * 60 * 1000);
    });
  }

  return alerts.filter((a) => {
    const alertTs = new Date(`${a.date}T${a.time}Z`).getTime();
    return alertTs >= cutoff;
  });
}

export function correlateAlerts(alerts: Alert[]): Alert[][] {
  const significantAlerts = alerts.filter(a => !a.isFalsePositive && (a.severity === 'high' || a.severity === 'critical'));
  const groups = significantAlerts.reduce((acc, a) => {
    const key = a.sourceIp || a.hostname || 'unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {} as Record<string, Alert[]>);
  return Object.values(groups).filter(g => g.length > 0);
}

export function groupByField(alerts: Alert[], field: string): Record<string, number> {
  return alerts.reduce((acc, item) => {
    const key = String(item[field] || 'UNKNOWN');
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

export function toChartData(map: Record<string, number>): { name: string; value: number }[] {
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

export function topByField(alerts: Alert[], field: string, limit: number = 5) {
  return toChartData(groupByField(alerts, field))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export function recentAlerts(alerts: Alert[], limit: number = 8): Alert[] {
  return [...alerts]
    .sort((a, b) => new Date(`${b.date}T${b.time}Z`).getTime() - new Date(`${a.date}T${a.time}Z`).getTime())
    .slice(0, limit);
}
