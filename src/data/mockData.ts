/**
 * mockData — Forensic Simulation Datasets
 * High-fidelity telemetry and operational artifacts for maintaining 
 * platform stability and demonstrating situational awareness protocols 
 * in offline diagnostic modes.
 */

export interface MockAlert {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  asset: string;
  sourceIp: string;
  signature: string;
  status: 'open' | 'investigating' | 'closed';
  escalated: boolean;
  isFalsePositive: boolean;
  createdAt: string;
  [key: string]: any;
}

export const mockAlerts: MockAlert[] = [
  {
    id: 'ALT-2001',
    title: 'Multiple failed login attempts against domain admin',
    severity: 'high',
    category: 'Authentication',
    asset: 'AD-DC01',
    sourceIp: '185.23.77.45',
    signature: 'Wazuh: auth_failures_threshold',
    status: 'open',
    escalated: true,
    isFalsePositive: false,
    createdAt: '2026-03-26T01:22:00Z'
  },
  {
    id: 'ALT-2002',
    title: 'Suspicious outbound connection to known bad ASN',
    severity: 'critical',
    category: 'Network',
    asset: 'FW-FORTI-01',
    sourceIp: '10.10.12.41',
    signature: 'Wazuh: C2.Outbound.Beacon',
    status: 'open',
    escalated: true,
    isFalsePositive: false,
    createdAt: '2026-03-26T02:05:00Z'
  },
  {
    id: 'ALT-2003',
    title: 'IPS hit: SQL Injection attempt blocked',
    severity: 'high',
    category: 'IPS',
    asset: 'WAF-EDGE-01',
    sourceIp: '103.144.201.8',
    signature: 'Wazuh: SQL.Injection.Attempt',
    status: 'investigating',
    escalated: true,
    isFalsePositive: false,
    createdAt: '2026-03-26T02:18:00Z'
  },
  {
    id: 'ALT-2004',
    title: 'File integrity change on /etc/passwd',
    severity: 'critical',
    category: 'Integrity',
    asset: 'APP-SRV-02',
    sourceIp: '10.10.20.17',
    signature: 'Wazuh FIM: Sensitive File Changed',
    status: 'open',
    escalated: true,
    isFalsePositive: false,
    createdAt: '2026-03-26T03:02:00Z'
  },
  {
    id: 'ALT-2005',
    title: 'Potential privilege escalation via sudo abuse',
    severity: 'high',
    category: 'Privilege',
    asset: 'APP-SRV-02',
    sourceIp: '10.10.20.17',
    signature: 'Wazuh: PrivEsc.SudoAbuse',
    status: 'open',
    escalated: true,
    isFalsePositive: false,
    createdAt: '2026-03-26T03:21:00Z'
  },
  {
    id: 'ALT-2006',
    title: 'Multiple failed logins from external scanner IP',
    severity: 'medium',
    category: 'Authentication',
    asset: 'VPN-GW-01',
    sourceIp: '45.133.1.92',
    signature: 'Wazuh: VPN.Bruteforce.Pattern',
    status: 'closed',
    escalated: false,
    isFalsePositive: true,
    createdAt: '2026-03-26T04:10:00Z'
  },
  {
    id: 'ALT-2007',
    title: 'IPS hit: Suspicious SMB exploit payload blocked',
    severity: 'critical',
    category: 'IPS',
    asset: 'FW-FORTI-01',
    sourceIp: '198.51.100.22',
    signature: 'Wazuh: SMB.Exploit.CVE',
    status: 'open',
    escalated: true,
    isFalsePositive: false,
    createdAt: '2026-03-26T04:42:00Z'
  },
  {
    id: 'ALT-2008',
    title: 'Suspicious outbound DNS tunneling behavior',
    severity: 'high',
    category: 'Network',
    asset: 'DNS-SRV-01',
    sourceIp: '10.10.30.6',
    signature: 'Wazuh: DNS.Tunnel.Suspected',
    status: 'investigating',
    escalated: true,
    isFalsePositive: false,
    createdAt: '2026-03-26T05:14:00Z'
  },
  {
    id: 'ALT-2009',
    title: 'File integrity change on webroot executable',
    severity: 'high',
    category: 'Integrity',
    asset: 'DMZ-WEB-01',
    sourceIp: '10.10.40.11',
    signature: 'Wazuh FIM: Webroot Binary Modified',
    status: 'open',
    escalated: true,
    isFalsePositive: false,
    createdAt: '2026-03-26T06:03:00Z'
  },
  {
    id: 'ALT-2010',
    title: 'Privilege escalation behavior from local admin script',
    severity: 'medium',
    category: 'Privilege',
    asset: 'FIN-WS-08',
    sourceIp: '10.10.55.8',
    signature: 'Wazuh: LocalAdmin.TokenManipulation',
    status: 'open',
    escalated: false,
    isFalsePositive: false,
    createdAt: '2026-03-26T06:31:00Z'
  },
  {
    id: 'ALT-2011',
    title: 'IPS hit: Cross-site scripting payload blocked',
    severity: 'medium',
    category: 'IPS',
    asset: 'WAF-EDGE-01',
    sourceIp: '103.144.201.8',
    signature: 'Wazuh: XSS.Payload',
    status: 'closed',
    escalated: false,
    isFalsePositive: true,
    createdAt: '2026-03-26T07:05:00Z'
  },
  {
    id: 'ALT-2012',
    title: 'Multiple failed login bursts for service account',
    severity: 'high',
    category: 'Authentication',
    asset: 'AD-DC02',
    sourceIp: '203.0.113.12',
    signature: 'Wazuh: ServiceAccount.Bruteforce',
    status: 'open',
    escalated: true,
    isFalsePositive: false,
    createdAt: '2026-03-26T07:44:00Z'
  },
  {
    id: 'ALT-2013',
    title: 'Suspicious outbound HTTPS to newly observed host',
    severity: 'medium',
    category: 'Network',
    asset: 'ENG-WS-03',
    sourceIp: '10.10.61.19',
    signature: 'Wazuh: Outbound.NewDestination',
    status: 'open',
    escalated: false,
    isFalsePositive: false,
    createdAt: '2026-03-26T08:20:00Z'
  },
  {
    id: 'ALT-2014',
    title: 'IPS hit: Command injection pattern blocked',
    severity: 'critical',
    category: 'IPS',
    asset: 'API-GW-01',
    sourceIp: '198.51.100.22',
    signature: 'Wazuh: Command.Injection',
    status: 'open',
    escalated: true,
    isFalsePositive: false,
    createdAt: '2026-03-26T09:15:00Z'
  },
  {
    id: 'ALT-2015',
    title: 'File integrity change on privileged cron job',
    severity: 'high',
    category: 'Integrity',
    asset: 'DB-SRV-01',
    sourceIp: '10.10.70.4',
    signature: 'Wazuh FIM: Cron.Privileged.Modified',
    status: 'investigating',
    escalated: true,
    isFalsePositive: false,
    createdAt: '2026-03-26T09:52:00Z'
  },
  {
    id: 'ALT-2016',
    title: 'Potential privilege escalation via new sudoers entry',
    severity: 'critical',
    category: 'Privilege',
    asset: 'DB-SRV-01',
    sourceIp: '10.10.70.4',
    signature: 'Wazuh: Sudoers.UnauthorizedChange',
    status: 'open',
    escalated: true,
    isFalsePositive: false,
    createdAt: '2026-03-26T10:11:00Z'
  },
  {
    id: 'ALT-2017',
    title: 'Multiple failed logins from known internal scanner',
    severity: 'low',
    category: 'Authentication',
    asset: 'HR-LAPTOP-14',
    sourceIp: '10.10.99.90',
    signature: 'Wazuh: Auth.Failures.ScannerProfile',
    status: 'closed',
    escalated: false,
    isFalsePositive: true,
    createdAt: '2026-03-26T11:08:00Z'
  },
  {
    id: 'ALT-2018',
    title: 'Suspicious outbound connection to TOR exit node',
    severity: 'critical',
    category: 'Network',
    asset: 'MKT-WS-11',
    sourceIp: '10.10.81.10',
    signature: 'Wazuh: TOR.ExitNode.Connection',
    status: 'open',
    escalated: true,
    isFalsePositive: false,
    createdAt: '2026-03-26T11:36:00Z'
  },
  {
    id: 'ALT-2019',
    title: 'IPS hit: Attempted RCE payload blocked',
    severity: 'critical',
    category: 'IPS',
    asset: 'DMZ-WEB-01',
    sourceIp: '185.23.77.45',
    signature: 'Wazuh: RCE.Generic.Payload',
    status: 'open',
    escalated: true,
    isFalsePositive: false,
    createdAt: '2026-03-26T12:03:00Z'
  },
  {
    id: 'ALT-2020',
    title: 'Privilege escalation attempt through vulnerable service',
    severity: 'high',
    category: 'Privilege',
    asset: 'APP-SRV-03',
    sourceIp: '10.10.20.31',
    signature: 'Wazuh: PrivEsc.ServiceAbuse',
    status: 'investigating',
    escalated: true,
    isFalsePositive: false,
    createdAt: '2026-03-26T12:28:00Z'
  }
];

export const mockTriages: any[] = [];

const destinationIps = [
  '172.16.10.20',
  '172.16.20.14',
  '172.16.30.45',
  '192.168.10.5',
  '192.168.20.77',
  '203.0.113.88',
  '198.51.100.101'
];
const assetCriticalityLevels = ['critical', 'high', 'high', 'medium', 'medium', 'low'];
const impactedUsers = [
  'svc_admin',
  'jdoe',
  'finance_api',
  'it.support',
  'dbadmin',
  'web.service',
  'vpn.ops'
];

export const mockAlertRecords = mockAlerts.map((alert, index) => ({
  ...alert,
  sourceTool: 'Wazuh',
  destinationIp: destinationIps[index % destinationIps.length],
  initialAssessment: '',
  analyst: '',
  assetCriticality: assetCriticalityLevels[index % assetCriticalityLevels.length],
  user: impactedUsers[index % impactedUsers.length],
  summary: ''
}));

export interface MockFalsePositive {
  date: string;
  tool: string;
  signature: string;
  category: string;
  severity: string;
  assetScope: string;
  description: string;
  reasonFalsePositive: string;
  frequency: string;
  analyst: string;
  proposedTuning: string;
  status: 'open' | 'reviewed' | 'tuned' | 'closed';
  tuningStatus: 'pending' | 'in_review' | 'applied' | 'monitoring' | 'rejected';
  notes: string;
}

export const mockFalsePositives: MockFalsePositive[] = [
  {
    date: '2026-03-26',
    tool: 'Wazuh',
    signature: 'auth_failures_threshold',
    category: 'Authentication',
    severity: 'medium',
    assetScope: 'VPN-GW-01',
    description: 'Burst login failures caused by scheduled credential rotation script.',
    reasonFalsePositive: 'Automation job generated expected failed attempts before sync.',
    frequency: 'Daily',
    analyst: 'Erwin',
    proposedTuning: 'Exclude service account `svc_vpn_sync` from brute-force rule.',
    status: 'reviewed',
    tuningStatus: 'pending',
    notes: 'Need approval from IAM owner.'
  },
  {
    date: '2026-03-25',
    tool: 'Wazuh',
    signature: 'IPS: XSS.Payload',
    category: 'IPS',
    severity: 'low',
    assetScope: 'WAF-EDGE-01',
    description: 'XSS payload triggered during internal QA scanner test.',
    reasonFalsePositive: 'Security testing traffic from approved scanner segment.',
    frequency: 'Weekly',
    analyst: 'Suyadi',
    proposedTuning: 'Whitelist QA scanner source range for non-production hours.',
    status: 'tuned',
    tuningStatus: 'applied',
    notes: 'Monitoring for 7 days after policy update.'
  },
  {
    date: '2026-03-24',
    tool: 'Wazuh',
    signature: 'FIM: Webroot Binary Modified',
    category: 'Integrity',
    severity: 'high',
    assetScope: 'DMZ-WEB-01',
    description: 'Patch cycle replaced binaries and triggered integrity alert.',
    reasonFalsePositive: 'Approved maintenance window activity.',
    frequency: 'Monthly',
    analyst: 'Bani',
    proposedTuning: 'Suppress FIM alerts during approved patch window tag.',
    status: 'reviewed',
    tuningStatus: 'in_review',
    notes: 'Coordinate with patch management schedule feed.'
  },
  {
    date: '2026-03-23',
    tool: 'Wazuh',
    signature: 'Outbound.NewDestination',
    category: 'Network',
    severity: 'medium',
    assetScope: 'ENG-WS-03',
    description: 'Developer package manager connected to new repository endpoint.',
    reasonFalsePositive: 'Legitimate software update source.',
    frequency: '3x/week',
    analyst: 'Budi Hartono',
    proposedTuning: 'Add trusted software repository domain list.',
    status: 'open',
    tuningStatus: 'pending',
    notes: 'Need validation from engineering lead.'
  },
  {
    date: '2026-03-22',
    tool: 'Wazuh',
    signature: 'PrivEsc.ServiceAbuse',
    category: 'Privilege',
    severity: 'high',
    assetScope: 'APP-SRV-03',
    description: 'Service restart by DevOps automation flagged as escalation.',
    reasonFalsePositive: 'Expected privileged operation by CI/CD runner.',
    frequency: 'Daily',
    analyst: 'Erwin',
    proposedTuning: 'Map CI runner binary hash as trusted behavior.',
    status: 'tuned',
    tuningStatus: 'monitoring',
    notes: 'No repeat noise in last 48 hours.'
  },
  {
    date: '2026-03-21',
    tool: 'Wazuh',
    signature: 'IPS: SQL.Injection.Attempt',
    category: 'IPS',
    severity: 'high',
    assetScope: 'API-GW-01',
    description: 'False SQL injection hit from API schema validation tool.',
    reasonFalsePositive: 'Payload matched signature pattern but benign.',
    frequency: 'Weekly',
    analyst: 'Suyadi',
    proposedTuning: 'Create exception for schema validator user-agent.',
    status: 'closed',
    tuningStatus: 'applied',
    notes: 'Exception active and documented.'
  }
];

export const mockScenarioAlerts: MockAlert[] = [
  {
    id: 'ALT-3101',
    createdAt: '2026-03-25T01:18:00Z',
    sourceTool: 'Wazuh',
    signature: 'auth_failures_threshold',
    category: 'Authentication',
    severity: 'high',
    status: 'open',
    escalated: true,
    isFalsePositive: false,
    asset: 'AD-DC01',
    assetCriticality: 'critical',
    user: 'svc_backup',
    sourceIp: '203.0.113.45',
    destinationIp: '10.10.1.20',
    summary: '',
    initialAssessment: '',
    analyst: '',
    title: 'Multiple failed login attempts'
  },
  {
    id: 'ALT-3102',
    createdAt: '2026-03-25T02:44:00Z',
    sourceTool: 'Wazuh',
    signature: 'sudoers_unauthorized_change',
    category: 'Privilege',
    severity: 'critical',
    status: 'investigating',
    escalated: true,
    isFalsePositive: false,
    asset: 'APP-SRV-02',
    assetCriticality: 'high',
    user: 'deploy.bot',
    sourceIp: '10.10.20.15',
    destinationIp: '10.10.20.15',
    summary: '',
    initialAssessment: '',
    analyst: '',
    title: 'Sudoers unauthorized modification'
  },
  {
    id: 'ALT-3103',
    createdAt: '2026-03-25T03:09:00Z',
    sourceTool: 'Wazuh',
    signature: 'C2.Outbound.Beacon',
    category: 'Network',
    severity: 'critical',
    status: 'open',
    escalated: true,
    isFalsePositive: false,
    asset: 'MKT-WS-11',
    assetCriticality: 'medium',
    user: 'j.santoso',
    sourceIp: '10.10.80.44',
    destinationIp: '198.51.100.77',
    summary: '',
    initialAssessment: '',
    analyst: '',
    title: 'Potential C2 beaconing detected'
  },
  {
    id: 'ALT-3104',
    createdAt: '2026-03-25T04:26:00Z',
    sourceTool: 'Wazuh',
    signature: 'IPS: SQL.Injection.Attempt',
    category: 'IPS',
    severity: 'high',
    status: 'open',
    escalated: false,
    isFalsePositive: false,
    asset: 'API-GW-01',
    assetCriticality: 'critical',
    user: 'external',
    sourceIp: '192.0.2.120',
    destinationIp: '172.16.10.5',
    summary: '',
    initialAssessment: '',
    analyst: '',
    title: 'SQL injection attack blocked'
  },
  {
    id: 'ALT-3105',
    createdAt: '2026-03-25T05:55:00Z',
    sourceTool: 'Wazuh',
    signature: 'FIM: Sensitive File Changed',
    category: 'Integrity',
    severity: 'critical',
    status: 'investigating',
    escalated: true,
    isFalsePositive: false,
    asset: 'DB-SRV-01',
    assetCriticality: 'critical',
    user: 'root',
    sourceIp: '10.10.70.4',
    destinationIp: '10.10.70.4',
    summary: '',
    initialAssessment: '',
    analyst: '',
    title: 'Privileged file integrity alert'
  },
  {
    id: 'ALT-3106',
    createdAt: '2026-03-25T07:16:00Z',
    sourceTool: 'Wazuh',
    signature: 'admin_group_membership_change',
    category: 'Privilege',
    severity: 'high',
    status: 'open',
    escalated: false,
    isFalsePositive: false,
    asset: 'FIN-WS-08',
    assetCriticality: 'high',
    user: 'helpdesk.temp',
    sourceIp: '10.10.55.8',
    destinationIp: '10.10.55.8',
    summary: '',
    initialAssessment: '',
    analyst: '',
    title: 'Unauthorized admin group modification'
  },
  {
    id: 'ALT-3107',
    createdAt: '2026-03-25T08:34:00Z',
    sourceTool: 'Wazuh',
    signature: 'VPN.Bruteforce.Pattern',
    category: 'Authentication',
    severity: 'medium',
    status: 'closed',
    escalated: false,
    isFalsePositive: true,
    asset: 'VPN-GW-01',
    assetCriticality: 'high',
    user: 'multiple-users',
    sourceIp: '203.0.113.92',
    destinationIp: '172.16.20.9',
    summary: '',
    initialAssessment: '',
    analyst: '',
    title: 'VPN brute-force attempts'
  },
  {
    id: 'ALT-3108',
    createdAt: '2026-03-25T09:58:00Z',
    sourceTool: 'Wazuh',
    signature: 'IPS: Command.Injection',
    category: 'IPS',
    severity: 'critical',
    status: 'open',
    escalated: true,
    isFalsePositive: false,
    asset: 'WAF-EDGE-01',
    assetCriticality: 'critical',
    user: 'external',
    sourceIp: '198.51.100.24',
    destinationIp: '172.16.30.12',
    summary: '',
    initialAssessment: '',
    analyst: '',
    title: 'Command injection attempt blocked'
  }
];

export const mockScenarioIocRecords = [
  {
    id: 'IOC-5101',
    type: 'ip',
    value: '198.51.100.77',
    threatFamily: 'C2 Infrastructure',
    confidence: 'high',
    firstSeen: '2026-03-25T02:35:00Z',
    lastSeen: '2026-03-25T04:05:00Z',
    relatedAlertIds: ['ALT-3103'],
    source: 'Internal Threat Intel Feed',
    action: 'Blocked at perimeter firewall'
  },
  {
    id: 'IOC-5102',
    type: 'domain',
    value: 'secure-update-check.example',
    threatFamily: 'Phishing / Malware Delivery',
    confidence: 'medium',
    firstSeen: '2026-03-25T01:20:00Z',
    lastSeen: '2026-03-25T03:00:00Z',
    relatedAlertIds: ['ALT-3101', 'ALT-3107'],
    source: 'SOC Enrichment Platform',
    action: 'Sinkholed via DNS policy'
  },
  {
    id: 'IOC-5103',
    type: 'hash',
    value: 'a1b2c3d4e5f60987654321abcdef1234567890abcdef1234567890abcdef12',
    threatFamily: 'Privilege Escalation Toolkit',
    confidence: 'high',
    firstSeen: '2026-03-25T05:42:00Z',
    lastSeen: '2026-03-25T06:10:00Z',
    relatedAlertIds: ['ALT-3102', 'ALT-3106'],
    source: 'Endpoint Forensics',
    action: 'Quarantined and blocked by EDR'
  }
];
