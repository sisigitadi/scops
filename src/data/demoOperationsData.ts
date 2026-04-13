/**
 * demoOperationsData — Strategic Forensic Mockups
 * High-fidelity telemetry and personnel datasets for maintaining 
 * operational continuity in simulation and diagnostic modes.
 */

export interface Personnel {
  id: string;
  name: string;
  role: 'admin' | 'manager' | 'l2_analyst' | 'l1_analyst' | 'auditor' | 'SYSTEM';
  status: 'on-duty' | 'standby' | 'off-duty';
  avatar?: string;
}

export const demoPersonnel: Personnel[] = [
  { id: '101', name: 'SIGIT ADI', role: 'admin', status: 'on-duty', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sigit&skinColor=d08b5b&top=shortFlat&facialHair=beardLight&facialHairProbability=100' },
  { id: '102', name: 'SUYADI', role: 'l2_analyst', status: 'on-duty', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Suyadi&skinColor=d08b5b&top=shortRound&facialHair=moustacheMagnum&facialHairProbability=100' },
  { id: '103', name: 'ERWIN', role: 'manager', status: 'on-duty', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Erwin&skinColor=d08b5b&top=shortWaved&facialHair=beardMedium&facialHairProbability=100' },
  { id: '104', name: 'BUDI HARTONO', role: 'auditor', status: 'on-duty', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi&skinColor=d08b5b&top=sides&facialHair=moustacheFancy&facialHairProbability=100' },
  { id: '105', name: 'BANI', role: 'l1_analyst', status: 'on-duty', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bani&skinColor=d08b5b&top=theCaesar&facialHair=beardLight&facialHairProbability=100' },
  { id: 'DEMO-001', name: 'DEMO', role: 'admin', status: 'on-duty', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo&skinColor=d08b5b&top=shortCurly&facialHair=beardMedium&facialHairProbability=100' }
];

export interface HandoverLog {
  id: string;
  timestamp: string;
  shift: string;
  outTeam: string[];
  inTeam: string[];
  verifiedBy: { id: string; name: string; role: string };
  notes: string;
  checklist: Record<string, boolean>;
}

export const demoHandoverLogs: HandoverLog[] = [
  {
    id: 'HO-20260409-NIGHT',
    timestamp: '2026-04-09T07:05:12Z',
    shift: 'Night',
    outTeam: ['101', '105'],
    inTeam: ['103', '102'],
    verifiedBy: { id: '101', name: 'SIGIT ADI', role: 'admin' },
    notes: 'Shift malam berjalan stabil. 2 insiden critical (WZH-6004) berhasil ditriase. Tidak ada anomali infrastruktur.',
    checklist: { queue_acknowledged: true, incidents_finalized: true, systems_verified: true }
  },
  {
    id: 'HO-20260408-AFTERNOON',
    timestamp: '2026-04-08T23:10:45Z',
    shift: 'Afternoon',
    outTeam: ['103', '102'],
    inTeam: ['101', '105'],
    verifiedBy: { id: '103', name: 'ERWIN', role: 'manager' },
    notes: 'Lonjakan alert otentikasi pada DB-SRV-01. Sudah dilakukan penutupan source IP di firewall. Perlu monitoring lanjut.',
    checklist: { queue_acknowledged: true, incidents_finalized: true, systems_verified: true }
  }
];

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  category: string;
  details: string;
  result: 'SUCCESS' | 'FAILURE' | 'PENDING';
  actor: { id: string; name: string; role: string };
}

export const demoAuditLogs: AuditLog[] = [
  {
    id: 'LOG-001',
    timestamp: '2026-04-09T14:30:11Z',
    action: 'USER_REGISTRY_UPDATE',
    category: 'MANAGEMENT',
    details: 'Modified role for user BANI from L1 to MANAGER',
    result: 'SUCCESS',
    actor: { id: '101', name: 'SIGIT ADI', role: 'admin' }
  },
  {
    id: 'LOG-002',
    timestamp: '2026-04-09T14:45:22Z',
    action: 'INTEGRATION_SYNC',
    category: 'SYSTEM',
    details: 'Wazuh Indexer synchronized successfully (500 entries)',
    result: 'SUCCESS',
    actor: { id: 'SYSTEM', name: 'Automated System', role: 'SYSTEM' }
  },
  {
    id: 'LOG-003',
    timestamp: '2026-04-09T15:10:05Z',
    action: 'SOP_REVISION',
    category: 'COMPLIANCE',
    details: 'Updated Incident Response Lifecycle to v2.1',
    result: 'SUCCESS',
    actor: { id: '103', name: 'ERWIN', role: 'manager' }
  }
];

export const demoSchedules: Record<string, Record<string, string[]>> = {
  '2026-04-13': {
    morning: ['103', '105'],
    afternoon: ['102'],
    night: ['101']
  },
  '2026-04-14': {
    morning: ['101', '104'],
    afternoon: ['103'],
    night: ['102']
  }
};

export interface ReliabilityLog {
  id: string;
  timestamp: string;
  tool: string;
  prevStatus: string;
  newStatus: string;
  latency: string;
}

export const demoReliabilityLogs: ReliabilityLog[] = [
  { id: 'REL-001', timestamp: '2026-04-09T02:15:00Z', tool: 'WAZUH_INDEXER', prevStatus: 'connected', newStatus: 'degraded', latency: '250ms' },
  { id: 'REL-002', timestamp: '2026-04-08T14:20:00Z', tool: 'OPENCTI_API', prevStatus: 'connected', newStatus: 'disconnected', latency: '---' },
  { id: 'REL-003', timestamp: '2026-04-07T22:00:00Z', tool: 'TELEGRAM_BOT', prevStatus: 'disconnected', newStatus: 'connected', latency: '40ms' }
];

export interface PerformanceMetric {
  id: string;
  score: number;
  mtta: string;
  resolved: number;
  skills: string[];
}

export const demoAnalystPerformance: PerformanceMetric[] = [
  { id: '101', score: 98, mtta: '2m', resolved: 145, skills: ['Malware', 'Cloud', 'Network'] },
  { id: '103', score: 95, mtta: '5m', resolved: 89, skills: ['Strategy', 'Policy', 'Forensics'] },
  { id: '102', score: 88, mtta: '8m', resolved: 210, skills: ['Linux', 'Log Analysis', 'SIEM'] },
  { id: '105', score: 92, mtta: '4m', resolved: 178, skills: ['Windows', 'Phishing', 'AD'] }
];

export interface SOPRecord {
  id: string;
  title: string;
  lastUpdate: string;
  content: string;
}

export const demoSOPs: SOPRecord[] = [
  { id: 'SOP-001', title: 'Brute Force Response', lastUpdate: '2026-03-20', content: '# Protocol: Brute Force\n1. Verify source IP reputation.\n2. Identify targeted accounts.\n3. Enforce MFA or lock account if threshold exceeded.' },
  { id: 'SOP-002', title: 'Ransomware Containment', lastUpdate: '2026-04-01', content: '# Protocol: Ransomware\n1. Isolate infected host from network.\n2. Identify ransomware variant.\n3. Snapshot forensic state before shutdown.' }
];
