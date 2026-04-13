const demoAlerts = [
  {
    id: 'DEMO-1001',
    alertId: 'DEMO-1001',
    timestamp: '2026-04-03T00:12:23.000Z',
    ruleId: '5710',
    ruleDescription: 'Multiple failed login attempts detected',
    ruleLevel: 12,
    category: 'Authentication',
    severity: 'high',
    agentName: 'wazuh-agent-fin-01',
    hostname: 'FIN-WS-08',
    sourceIp: '203.0.113.45',
    source: 'gold_demo',
    eventCount: 14,
    status: 'open',
    analyst: 'Demo Analyst',
    escalated: true,
    isFalsePositive: false
  },
  {
    id: 'DEMO-1002',
    alertId: 'DEMO-1002',
    timestamp: '2026-04-03T00:45:11.000Z',
    ruleId: '5502',
    ruleDescription: 'Privilege escalation pattern from sudoers modification',
    ruleLevel: 15,
    category: 'Privilege Escalation',
    severity: 'critical',
    agentName: 'wazuh-agent-app-02',
    hostname: 'APP-SRV-02',
    sourceIp: '10.10.20.15',
    source: 'gold_demo',
    eventCount: 3,
    status: 'investigating',
    analyst: 'Demo Analyst',
    escalated: true,
    isFalsePositive: false
  },
  {
    id: 'DEMO-1003',
    alertId: 'DEMO-1003',
    timestamp: '2026-04-03T01:02:09.000Z',
    ruleId: '554',
    ruleDescription: 'Suspicious outbound connection to rare destination',
    ruleLevel: 10,
    category: 'Network Anomaly',
    severity: 'high',
    agentName: 'wazuh-agent-mkt-11',
    hostname: 'MKT-WS-11',
    sourceIp: '10.10.81.10',
    source: 'gold_demo',
    eventCount: 9,
    status: 'open',
    analyst: 'Demo Analyst',
    escalated: false,
    isFalsePositive: false
  },
  {
    id: 'DEMO-1004',
    alertId: 'DEMO-1004',
    timestamp: '2026-04-03T01:28:42.000Z',
    ruleId: '100002',
    ruleDescription: 'File integrity monitoring change on protected directory',
    ruleLevel: 14,
    category: 'File Integrity Monitoring',
    severity: 'critical',
    agentName: 'wazuh-agent-db-01',
    hostname: 'DB-SRV-01',
    sourceIp: '10.10.70.4',
    source: 'gold_demo',
    eventCount: 5,
    status: 'investigating',
    analyst: 'Demo Analyst',
    escalated: true,
    isFalsePositive: false
  },
  {
    id: 'DEMO-1005',
    alertId: 'DEMO-1005',
    timestamp: '2026-04-03T01:55:13.000Z',
    ruleId: '5712',
    ruleDescription: 'Repeated login anomaly from known scanner profile',
    ruleLevel: 7,
    category: 'Authentication',
    severity: 'medium',
    agentName: 'wazuh-agent-vpn-01',
    hostname: 'VPN-GW-01',
    sourceIp: '10.10.99.90',
    source: 'gold_demo',
    eventCount: 22,
    status: 'closed',
    analyst: 'Demo Analyst',
    escalated: false,
    isFalsePositive: true
  },
  {
    id: 'DEMO-1006',
    alertId: 'DEMO-1006',
    timestamp: '2026-04-03T02:20:13.000Z',
    ruleId: '5100',
    ruleDescription: 'Suspicious admin activity: local admin group modified',
    ruleLevel: 13,
    category: 'Privilege Escalation',
    severity: 'high',
    agentName: 'wazuh-agent-hr-14',
    hostname: 'HR-LAPTOP-14',
    sourceIp: '10.10.44.18',
    source: 'gold_demo',
    eventCount: 4,
    status: 'open',
    analyst: 'Demo Analyst',
    escalated: false,
    isFalsePositive: false
  }
]

export function getDemoAlerts(limit = 50) {
  const normalizedLimit = Math.max(1, Number(limit) || 50)
  return demoAlerts.slice(0, normalizedLimit)
}

export function getDemoManagerAlerts(limit = 100) {
  const items = getDemoAlerts(limit)
  return {
    data: {
      affected_items: items,
      total_affected_items: items.length
    }
  }
}

export function getDemoManagerAgents() {
  return {
    data: {
      affected_items: [
        { id: '001', name: 'FIN-WS-08', status: 'active' },
        { id: '002', name: 'APP-SRV-02', status: 'active' },
        { id: '003', name: 'DB-SRV-01', status: 'active' },
        { id: '004', name: 'VPN-GW-01', status: 'active' }
      ],
      total_affected_items: 4
    }
  }
}

export function getDemoOpenctiResult(searchValue = '') {
  return {
    data: {
      indicators: {
        edges: [
          {
            node: {
              id: 'indicator--demo-1',
              name: searchValue || '203.0.113.45',
              description: 'Demo indicator for simulation mode.',
              indicator_types: ['ipv4-addr'],
              confidence: 78,
              pattern: `[ipv4-addr:value = '${searchValue || '203.0.113.45'}']`,
              x_opencti_score: 73,
              objectLabel: [{ value: 'tlp:amber', color: '#f59e0b' }],
              createdBy: { name: 'SOC OPS Demo Feed' }
            }
          }
        ]
      },
      stixCoreRelationships: {
        edges: [
          {
            node: {
              relationship_type: 'related-to',
              from: { id: 'threat-actor--demo', name: 'Demo Threat Actor', entity_type: 'Threat-Actor' },
              to: { id: 'indicator--demo-1', name: searchValue || '203.0.113.45', entity_type: 'Indicator' },
              confidence: 73
            }
          }
        ]
      },
      about: {
        version: 'demo-1.0.0'
      }
    }
  }
}
