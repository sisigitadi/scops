import { Alert } from '../domain/alerts/normalizeAlert';

/**
 * dashboardHelpers — Operational Data Orchestration
 * High-fidelity utility set for aggregating forensic telemetry and 
 * generating situational awareness metrics for the real-time dashboard.
 */

const severityOrder = ['critical', 'high', 'medium', 'low'] as const;

export const severityBadgeStyles: Record<string, string> = {
  critical: 'border-rose-500/40 bg-rose-500/15 text-rose-200',
  high: 'border-orange-500/40 bg-orange-500/15 text-orange-200',
  medium: 'border-amber-500/40 bg-amber-500/15 text-amber-200',
  low: 'border-sky-500/40 bg-sky-500/15 text-sky-200'
};

export function toTitleCase(value: string): string {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function countBy(items: any[], key: string): Record<string, number> {
  return items.reduce((acc, item) => {
    const value = item[key];
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

export function buildKpis(alerts: Alert[]) {
  return [
    { label: 'Total Alerts', value: alerts.length },
    { label: 'Open Alerts', value: alerts.filter((alert) => alert.status === 'open').length },
    { label: 'Escalated Alerts', value: alerts.filter((alert) => alert.escalated).length },
    { label: 'False Positives', value: alerts.filter((alert) => alert.isFalsePositive).length },
    { label: 'Critical Alerts', value: alerts.filter((alert) => alert.severity === 'critical').length },
    { label: 'High Alerts', value: alerts.filter((alert) => alert.severity === 'high').length }
  ];
}

export function buildSeverityDistribution(alerts: Alert[]) {
  const grouped = countBy(alerts, 'severity');
  return severityOrder.map((severity) => ({
    label: toTitleCase(severity),
    value: grouped[severity] || 0,
    key: severity
  }));
}

export function buildCategoryDistribution(alerts: Alert[], limit: number = 8) {
  const grouped = countBy(alerts, 'category');
  return Object.entries(grouped)
    .map(([label, value]) => ({ label, value, key: label }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function buildTopList(alerts: Alert[], key: string, label: string, limit: number = 5) {
  const grouped = countBy(alerts, key);
  return Object.entries(grouped)
    .map(([name, value]) => ({ name, value, label }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export function buildTopAssets(alerts: Alert[], limit: number = 5) {
  return buildTopList(alerts, 'asset', 'alerts', limit);
}

export function buildTopSourceIps(alerts: Alert[], limit: number = 5) {
  return buildTopList(alerts, 'sourceIp', 'hits', limit);
}

export function buildTopSignatures(alerts: Alert[], limit: number = 5) {
  return buildTopList(alerts, 'signature', 'triggers', limit);
}

export function buildRecentAlerts(alerts: Alert[], limit: number = 10) {
  return [...alerts]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}
