import { Case } from '../context/CasesContext';

/**
 * goldDataset — The 'Clinical' Demo State
 * Preserved analytical scenarios for client demonstrations.
 */

export const goldCases: Case[] = [
  {
    id: 'CS-20260411-001',
    title: 'Advanced Persistent Threat (APT) Detection: Project Raven',
    timestamp: '2026-04-11T02:15:00Z',
    updatedAt: '2026-04-11T05:30:00Z',
    ruleDescription: 'C2.Outbound.Beacon - Pattern matched with Threat Actor Group GR-22',
    severity: 'CRITICAL',
    status: 'investigating',
    category: 'Network Control',
    initialAssessment: 'High-confidence beaconing detected from a server in the DMZ segment. Indicators match known APT28 tactics.',
    evidence: 'Log: win-event-4624 (Suspicious Login), Netflow: 500MB outbound to untrusted ASN (RU-OFFSET-01)',
    actionTaken: 'Isolated APP-SRV-02 from the VLAN. Commenced full host memory capture.',
    recommendation: 'Perform deep disk forensics and check secondary lateral movement via SMB.',
    analystId: 'DEMO-001',
    analyst: { name: 'Demo Analyst', role: 'demo' }
  },
  {
    id: 'CS-20260411-002',
    title: 'Brute Force Campaign Targeting Service Accounts',
    timestamp: '2026-04-10T14:45:00Z',
    updatedAt: '2026-04-10T16:20:00Z',
    ruleDescription: 'auth_failures_threshold - Multiple failed logins (>100) within 1 minute',
    severity: 'HIGH',
    status: 'closed',
    category: 'Authentication',
    initialAssessment: 'Distributed brute force attack targeting svc_backup and svc_sql. Originating from multiple compromised TOR nodes.',
    actionTaken: 'Implemented IP-based blocking at Perimeter Firewall. Enforced MFA on targeted service accounts.',
    notes: 'Attack subsided after firewall block. No compromised sessions detected in audit.',
    analystId: 'DEMO-001',
    analyst: { name: 'Demo Analyst', role: 'demo' }
  }
];
