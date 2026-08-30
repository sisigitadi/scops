import { mockAlerts } from '../data/mockData';
import { AuditLog } from '../context/OperationsContext';
import { Case } from '../context/CasesContext';

/**
 * proceduralGenerator — High-Density Demo Seeding
 * Generates naturalistic, time-distributed forensic datasets 
 * to simulate years of operational history in seconds.
 */

const SEVERITIES: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
const STATUSES: Array<'open' | 'investigating' | 'closed'> = ['open', 'investigating', 'closed'];
const CATEGORIES = ['Authentication', 'Network', 'Integrity', 'Malware', 'Policy', 'Privilege', 'Endpoint', 'Cloud'];
const ANALYSTS = ['Sigit Adi', 'Erwin', 'Suyadi', 'Bani', 'Budi Hartono'];

export const generateAlerts = (count: number) => {
  const alerts = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const template = mockAlerts[i % mockAlerts.length];
    
    // CALIBRATED TEMPORAL DISTRIBUTION
    // Bucket 1: Last 1 Hour (Target: 14 alerts)
    // Bucket 2: Last 8 Hours (Target: 104 total, so 90 more)
    // Bucket 3: Last 12 Hours (Target: 168 total, so 64 more)
    // Bucket 4: Remaining (Rest of 30 days)
    
    let timeOffset = 0;
    if (i < 14) {
      // Last 1 hour
      timeOffset = Math.random() * 60 * 60 * 1000;
    } else if (i < 104) {
      // Last 8 hours (14 to 104 = 90 alerts)
      timeOffset = (1 * 60 * 60 * 1000) + (Math.random() * 7 * 60 * 60 * 1000);
    } else if (i < 168) {
      // Last 12 hours (104 to 168 = 64 alerts)
      timeOffset = (8 * 60 * 60 * 1000) + (Math.random() * 4 * 60 * 60 * 1000);
    } else {
      // Rest of 30 days
      timeOffset = (12 * 60 * 60 * 1000) + (Math.random() * 29.5 * 24 * 60 * 60 * 1000);
    }
    
    const timestamp = new Date(now.getTime() - timeOffset);
    
    const sevRand = Math.random();
    const severity = sevRand > 0.95 ? 'critical' : sevRand > 0.8 ? 'high' : sevRand > 0.4 ? 'medium' : 'low';

    const assetName = template.asset.split('-')[0] + '-' + (Math.floor(Math.random()*99) + 1).toString().padStart(2, '0');
    alerts.push({
      ...template,
      id: `ALT-${2026}${i.toString().padStart(4, '0')}`,
      alertId: `ALT-${2026}${i.toString().padStart(4, '0')}`,
      ruleId: `WZH-600${(i % 12) + 1}`,
      ruleDescription: template.title,
      hostname: assetName,
      agentName: assetName,
      asset: assetName,
      severity,
      status: Math.random() > 0.7 ? 'closed' : Math.random() > 0.4 ? 'investigating' : 'open',
      createdAt: timestamp.toISOString(),
      sourceIp: `10.10.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`,
    });
  }

  return alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const generateAuditLogs = (count: number): AuditLog[] => {
  const logs: AuditLog[] = [];
  const now = new Date();
  const actions = [
    'AUTH_LOGIN', 'AUTH_FAILED', 'AUTH_MFA_CHALLENGE', 'CASE_UPDATE', 'ALERT_TRIAGE', 
    'POLICY_CHANGE', 'INFRA_HEALTH_CHECK', 'REPORT_EXPORT', 'SOP_VIEWED', 
    'CREDENTIAL_ROTATION', 'FIREWALL_RULE_MOD', 'ACCOUNT_LOCKOUT', 
    'SENSITIVE_FILE_ACCESS', 'SERVICE_RESTART', 'EXPORT_LOGS', 'CONFIG_SYNC',
    'THREAT_DB_UPDATE', 'VULN_SCAN_INIT', 'PATCH_DEPLOYED', 'SESSION_TERMINATED'
  ];

  for (let i = 0; i < count; i++) {
    const timeOffset = Math.random() * 60 * 24 * 60 * 60 * 1000; // Last 60 days
    const timestamp = new Date(now.getTime() - timeOffset);
    const action = actions[Math.floor(Math.random() * actions.length)];
    const user = ANALYSTS[Math.floor(Math.random() * ANALYSTS.length)];

    const resultRand = Math.random();
    const result = resultRand > 0.15 ? 'SUCCESS' : resultRand > 0.05 ? 'FAILURE' : 'WARNING';

    logs.push({
      id: `LOG-${2026}${i.toString().padStart(4, '0')}`,
      txHash: `0x${Math.random().toString(16).substring(2, 10).toUpperCase()}${i.toString(16)}`,
      timestamp: timestamp.toISOString(),
      action,
      category: action.split('_')[0],
      details: `${action.replace(/_/g, ' ')} orchestration. Target: node-${Math.floor(Math.random()*200)+1}. Identity: ${user} verified via persistent audit engine. Result: ${result}.`,
      result,
      user: user
    });
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const generateCases = (count: number): Case[] => {
  const cases: Case[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const timeOffset = Math.random() * 90 * 24 * 60 * 60 * 1000; // Last 90 days
    const timestamp = new Date(now.getTime() - timeOffset);
    const analyst = ANALYSTS[Math.floor(Math.random() * ANALYSTS.length)];
    const severity = Math.random() > 0.9 ? 'CRITICAL' : Math.random() > 0.7 ? 'HIGH' : 'MEDIUM';

    cases.push({
      id: `CS-${2026}${Math.floor(Math.random()*12)+1}-${i.toString().padStart(4, '0')}`,
      title: `Tactical Investigation: Cluster-${i + 1}`,
      timestamp: timestamp.toISOString(),
      updatedAt: new Date(timestamp.getTime() + (Math.random() * 24 * 60 * 60 * 1000)).toISOString(),
      ruleDescription: `Anomalous behavior detected in ${CATEGORIES[Math.floor(Math.random()*CATEGORIES.length)]} sector.`,
      severity: severity as any,
      status: Math.random() > 0.6 ? 'closed' : 'investigating',
      category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
      initialAssessment: 'Automated forensic telemetry triggered for comprehensive analysis.',
      analystId: `AN-${i}`,
      analyst: { name: analyst, role: 'ANALYST' }
    });
  }

  return cases.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};
