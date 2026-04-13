import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSettings } from './SettingsContext';
import { diffObjects, generateTransactionHash } from '../utils/forensicUtils';
import { generateAuditLogs, generateAlerts, generateCases } from '../utils/proceduralGenerator';
import { goldCases } from '../data/goldDataset';

/**
 * OperationsContext — SIM-SOC Information Hub
 * Manages personnel availability, shift rosters, infrastructure health, and forensic activity logging.
 */

import { 
  demoPersonnel, 
  demoHandoverLogs, 
  demoReliabilityLogs,
  demoSchedules
} from '../data/demoOperationsData';

export interface Personnel {
  id: string;
  name: string;
  role: string;
  status: 'on-duty' | 'standby' | 'off';
  avatar: string;
  joinedAt?: string;
  shiftNotes?: string;
  skills?: string[];
  experience?: number;
}

export interface HealthStatus {
  status: 'online' | 'offline' | 'error' | 'warning';
  latency: string;
  lastSync: string;
}

export interface ShiftConfigEntry {
  name: string;
  start: string;
  end: string;
  icon: string;
}

export interface ShiftConfig {
  morning: ShiftConfigEntry;
  afternoon: ShiftConfigEntry;
  night: ShiftConfigEntry;
  [key: string]: ShiftConfigEntry;
}

export interface AuditLog {
  id: string;
  txHash: string;
  timestamp: string;
  action: string;
  category: string;
  details: string;
  result: string;
  user?: string;
  actor?: {
    name: string;
    role: string;
    avatar?: string;
  };
  metadata?: string;
  changes?: string;
}

export interface GovernanceDoc {
  id: string;
  title: string;
  category: 'PROCEDURE' | 'COMPLIANCE' | 'POLICY';
  lastUpdated: string;
  content: string;
}

interface OperationsContextType {
  personnel: Personnel[];
  activeTeam: Personnel[];
  toggleDuty: (userId: string, notes?: string) => Promise<void>;
  handoverLogs: any[];
  createHandover: (log: any) => void;
  healthStatus: Record<string, HealthStatus>;
  healthHistory: any[];
  updateToolStatus: (tool: string, status: any, latency: string) => void;
  shiftConfig: ShiftConfig;
  setShiftConfig: React.Dispatch<React.SetStateAction<ShiftConfig>>;
  schedules: Record<string, Record<string, string[]>>;
  addSchedule: (dateStr: string, shiftId: string, personnelIds: string[]) => Promise<void>;
  attendance: Record<string, Record<string, string>>;
  setPersonnelStatus: (dateStr: string, analystId: string, status: string) => Promise<void>;
  auditLogs: AuditLog[];
  trackActivity: (action: string, details: string, result?: string, options?: any) => Promise<void>;
  governanceDocs: GovernanceDoc[];
  updateGovernanceDoc: (id: string, newContent: string) => void;
  internalSyncing: boolean;
}

const OperationsContext = createContext<OperationsContextType | undefined>(undefined);

const isDemoMode = () => {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('socops_demo_mode') === '1' || window.location.hash.includes('/demo');
};

const defaultHealth: Record<string, HealthStatus> = {
  wazuh: { status: 'online', latency: '12ms', lastSync: new Date().toISOString() },
  opencti: { status: 'online', latency: '45ms', lastSync: new Date().toISOString() },
  telegram: { status: 'online', latency: '220ms', lastSync: new Date().toISOString() },
  database: { status: 'online', latency: '2ms', lastSync: new Date().toISOString() },
};

export const OperationsProvider = ({ children }: { children: ReactNode }) => {
  const { settings } = useSettings();
  
  const [personnel, setPersonnel] = useState<Personnel[]>(() => {
    if (isDemoMode()) return demoPersonnel as Personnel[];
    return [];
  });

  useEffect(() => {
    if (isDemoMode()) return;
    if (settings?.users) {
      const mappedPersonnel: Personnel[] = settings.users.map(u => ({
        id: u.id || u.email,
        name: u.name,
        role: u.role || 'ANALYST',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}&skinColor=d08b5b&top=shortFlat,shortRound,shortWaved,sides,theCaesar,theCaesarAndSidePart&topProbability=100&facialHairProbability=40&facialHair=beardLight,beardMedium,moustacheFancy,moustacheMagnum`,
        status: 'standby'
      }));
      
      setPersonnel(prev => {
        return mappedPersonnel.map(p => {
          const existing = prev.find(ep => ep.id === p.id);
          return existing ? { ...p, status: existing.status } : p;
        });
      });
    }
  }, [settings?.users]);

  const [healthStatus, setHealthStatus] = useState(defaultHealth);

  useEffect(() => {
    const handleStatusSync = (e: any) => {
      const { serviceId, status, latency } = e.detail;
      const normalizedStatus = status === 'connected' ? 'online' : status === 'error' ? 'error' : 'offline';
      
      const toolMap: Record<string, string> = {
        wazuh_manager: 'wazuh',
        wazuh_indexer: 'wazuh',
        opencti: 'opencti',
        telegram: 'telegram'
      };

      const toolKey = toolMap[serviceId];
      if (toolKey) {
        setHealthStatus(prev => ({
          ...prev,
          [toolKey]: { 
            status: normalizedStatus, 
            latency: latency ? `${latency}ms` : '---', 
            lastSync: new Date().toISOString() 
          }
        }));
      }
    };

    window.addEventListener('socops:service-status-change', handleStatusSync);
    return () => window.removeEventListener('socops:service-status-change', handleStatusSync);
  }, []);

  const [shiftConfig, setShiftConfig] = useState<ShiftConfig>(() => {
    const saved = localStorage.getItem('scops_shift_config');
    let config = saved ? JSON.parse(saved) : {
      morning: { name: 'Shift Pagi', start: '07:00', end: '15:00', icon: 'Sun' },
      afternoon: { name: 'Shift Sore', start: '15:00', end: '23:00', icon: 'Cloud' },
      night: { name: 'Shift Malam', start: '23:00', end: '07:00', icon: 'Moon' }
    };

    if (config.shift1) { config.morning = { ...config.shift1, name: 'Shift Pagi' }; delete config.shift1; }
    if (config.shift2) { config.afternoon = { ...config.shift2, name: 'Shift Sore' }; delete config.shift2; }
    if (config.shift3) { config.night = { ...config.shift3, name: 'Shift Malam' }; delete config.shift3; }

    // Migrate any stored AM/PM times to 24-hour format
    Object.keys(config).forEach(key => {
      const convertTo24h = (time12h: string) => {
        if (!time12h || !time12h.toLowerCase().match(/(am|pm)/)) return time12h;
        const [time, modifier] = time12h.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') { hours = '00'; }
        if (modifier.toUpperCase() === 'PM') { hours = String(parseInt(hours, 10) + 12); }
        return `${hours.padStart(2, '0')}:${minutes}`;
      };
      if (config[key].start) config[key].start = convertTo24h(config[key].start);
      if (config[key].end) config[key].end = convertTo24h(config[key].end);
    });

    return config;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const fetchAuditLogs = useCallback(async () => {
    if (isDemoMode()) {
      const saved = sessionStorage.getItem('socops_demo_logs');
      const parsed = saved ? JSON.parse(saved) : [];
      if (Array.isArray(parsed) && parsed.length >= 9000) {
        setAuditLogs(parsed);
      } else {
        // MASSIVE HIGH-DENSITY SEED: 9999 Audit Logs for Production-Ready feel
        const seed = generateAuditLogs(9999);
        setAuditLogs(seed); 
        sessionStorage.setItem('socops_demo_logs', JSON.stringify(seed));
      }
      return;
    }

    try {
      const res = await fetch('/api/audit-logs');
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((log: any) => ({
          ...log,
          user: log.actor?.name || 'System'
        }));
        setAuditLogs(mapped);
      }
    } catch (err) {
      console.warn('Audit Fetch Failed:', err);
    }
  }, []);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const trackActivity = async (action: string, details: string, result = 'SUCCESS', options: any = {}) => {
    const { 
      category = 'SYSTEM', 
      metadata = {}, 
      changes = null, 
      actorOverride = null 
    } = options;

    const activeUser = actorOverride || JSON.parse(sessionStorage.getItem('socops_user_v2') || 'null');
    
    const timestamp = new Date().toISOString();
    const txHash = generateTransactionHash({ action, details, category, changes }, timestamp);
    
    const transientLog: AuditLog = {
      id: txHash,
      txHash: txHash,
      timestamp,
      action,
      category,
      details,
      result,
      user: activeUser?.name || 'System'
    };

    setAuditLogs(prev => {
      const next = [transientLog, ...prev].slice(0, 10000);
      if (isDemoMode()) {
        sessionStorage.setItem('socops_demo_logs', JSON.stringify(next));
      }
      return next;
    });

    if (isDemoMode()) return;

    try {
      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          category,
          details,
          result,
          metadata,
          changes,
          actorId: activeUser?.id,
          txHash
        })
      });
    } catch (err) {
      console.error('Audit Persistence Failed:', err);
    }
  };

  const [governanceDocs, setGovernanceDocs] = useState<GovernanceDoc[]>(() => {
    if (isDemoMode()) return [
      { id: 'SOP-001', title: 'SOP: Respons Brute Force', category: 'PROCEDURE', lastUpdated: '2026-03-20', content: '# Protokol: Brute Force\n1. Verifikasi reputasi IP sumber.\n2. Identifikasi akun yang ditargetkan.\n3. Terapkan MFA atau kunci akun jika ambang batas terlampaui.' },
      { id: 'SOP-002', title: 'SOP: Penahanan Ransomware', category: 'COMPLIANCE', lastUpdated: '2026-04-01', content: '# Protokol: Ransomware\n1. Isolasi host yang terinfeksi dari jaringan.\n2. Identifikasi varian ransomware.\n3. Ambil snapshot status forensik sebelum mematikan sistem.' }
    ];
    const saved = localStorage.getItem('scops_governance_docs');
    return saved ? JSON.parse(saved) : [
      { 
        id: 'sop-001', 
        title: 'SOP: Siklus Hidup Respon Insiden', 
        category: 'PROCEDURE',
        lastUpdated: new Date().toISOString(),
        content: `## Siklus Hidup Respon Insiden SOC\n\n### 1. Deteksi & Identifikasi\nSeluruh alert dari **Wazuh** dan **OpenCTI** wajib ditriase dalam waktu 15 menit.\n\n### 2. Penahanan (Containment)\nJika insiden tingkat tinggi terkonfirmasi, analis wajib mengisolasi endpoint yang terdampak segera.\n\n### 3. Dokumentasi\nSetiap tindakan wajib dicatat dalam **Log Handover** dan **Hub Audit**.`
      },
      { 
        id: 'sop-002', 
        title: 'Kebijakan: Protokol Handover Shift', 
        category: 'COMPLIANCE',
        lastUpdated: new Date().toISOString(),
        content: `## Protokol Handover Shift\n\n- **Persyaratan**: Wajib bagi seluruh Analis dan Shift Leader.\n- **Proses**: Tim yang akan selesai bertugas wajib meninjau seluruh alert tertunda bersama tim yang baru datang.\n- **Verifikasi**: Shift Leader wajib menandatangani Log Handover.`
      }
    ];
  });

  const [healthHistory, setHealthHistory] = useState(() => {
    if (isDemoMode()) return demoReliabilityLogs;
    const saved = localStorage.getItem('scops_health_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [internalSyncing, setInternalSyncing] = useState(false);
  useEffect(() => {
    if (!isDemoMode()) return;
    const interval = setInterval(() => {
      setInternalSyncing(true);
      setTimeout(() => setInternalSyncing(false), 2000);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const [activeTeam, setActiveTeam] = useState<Personnel[]>(() => {
    if (isDemoMode()) return demoPersonnel as Personnel[];
    return [];
  });
  const [handoverLogs, setHandoverLogs] = useState(() => {
    if (isDemoMode()) return demoHandoverLogs;
    const saved = localStorage.getItem('scops_handover_logs');
    return saved ? JSON.parse(saved) : [];
  });
  const [schedules, setSchedules] = useState<Record<string, Record<string, string[]>>>(() => {
    if (isDemoMode()) return demoSchedules;
    return {};
  });
  const [attendance, setAttendance] = useState<Record<string, Record<string, string>>>(() => {
    if (isDemoMode()) {
      // Auto-populate attendance for today to show 'On Duty' instead of 'Awaiting'
      const today = new Date().toISOString().split('T')[0];
      const todaySched = demoSchedules[today] || {};
      const att: Record<string, string> = {};
      Object.values(todaySched).flat().forEach(id => {
        att[id] = 'on-duty';
      });
      return { [today]: att };
    }
    return {};
  });

  const fetchCalendarData = useCallback(async () => {
    if (isDemoMode()) return;
    try {
      const [schedRes, attRes] = await Promise.all([
        fetch('/api/schedules'),
        fetch('/api/attendance')
      ]);
      
      if (schedRes.ok && attRes.ok) {
        const schedData = await schedRes.json();
        const attData = await attRes.json();
        
        const nextSched: Record<string, Record<string, string[]>> = {};
        schedData.forEach((s: any) => {
          if (!nextSched[s.date]) nextSched[s.date] = {};
          nextSched[s.date][s.shiftId] = JSON.parse(s.personnel);
        });
        
        const nextAtt: Record<string, Record<string, string>> = {};
        attData.forEach((a: any) => {
          if (!nextAtt[a.date]) nextAtt[a.date] = {};
          nextAtt[a.date][a.userId] = a.status;
        });
        
        setSchedules(nextSched);
        setAttendance(nextAtt);
      }
    } catch (err) {
      console.warn('Calendar Fetch Failed:', err);
    }
  }, []);

  const fetchOperationalData = useCallback(async () => {
    if (isDemoMode()) return;
    try {
      const teamRes = await fetch('/api/active-team');
      if (teamRes.ok) {
        const teamData = await teamRes.json();
        setActiveTeam(teamData.map((t: any) => ({ 
          id: t.userId, 
          name: t.name, 
          role: t.role, 
          status: 'on-duty',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name}&skinColor=d08b5b&top=shortFlat,shortRound,shortWaved,sides,theCaesar,theCaesarAndSidePart&topProbability=100&facialHairProbability=40&facialHair=beardLight,beardMedium,moustacheFancy,moustacheMagnum`,
          joinedAt: t.joinedAt, 
          shiftNotes: t.notes 
        } as Personnel)));
      }
    } catch (err) {
      console.error('Active Team Fetch Failed:', err);
    }
  }, []);

  useEffect(() => {
    fetchOperationalData();
    fetchCalendarData();
  }, [fetchOperationalData, fetchCalendarData]);

  useEffect(() => {
    localStorage.setItem('scops_shift_config', JSON.stringify(shiftConfig));
    localStorage.setItem('scops_governance_docs', JSON.stringify(governanceDocs));
  }, [shiftConfig, governanceDocs]);

  const setPersonnelStatus = async (dateStr: string, analystId: string, status: string) => {
    setAttendance(prev => ({
      ...prev,
      [dateStr]: {
        ...(prev[dateStr] || {}),
        [analystId]: status
      }
    }));
    
    trackActivity('MGMT_ATTENDANCE', `Personnel status override: ${analystId} marked as ${status.toUpperCase()} for ${dateStr}`, 'SUCCESS', { category: 'MANAGEMENT' });
    
    try {
      await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr, userId: analystId, status })
      });
    } catch (err) {
      console.error('Attendance Save Failed:', err);
    }
  };

  const addSchedule = async (dateStr: string, shiftId: string, personnelIds: string[]) => {
    setSchedules(prev => ({
      ...prev,
      [dateStr]: {
        ...(prev[dateStr] || {}),
        [shiftId]: personnelIds
      }
    }));
    
    try {
      await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr, shiftType: shiftId, personnel: personnelIds })
      });
    } catch (err) {
      console.error('Schedule Save Failed:', err);
    }
  };

  const toggleDuty = async (userId: string, notes = '') => {
    if (!userId) return;
    const analystId = String(userId).toLowerCase();
    const isAlreadyOn = activeTeam.some(a => String(a.id).toLowerCase() === analystId);
    
    try {
      if (isAlreadyOn) {
        setActiveTeam(prev => prev.filter(a => String(a.id).toLowerCase() !== analystId));
        setPersonnel(pList => pList.map(p => String(p.id).toLowerCase() === analystId ? { ...p, status: 'standby' } : p));
        trackActivity('SHIFT_OUT', `Analyst clock-out: ${analystId}. Notes: ${notes}`, 'SUCCESS', { category: 'SHIFT' });
        
        await fetch('/api/active-team/toggle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: analystId, status: 'off' })
        });
      } else {
        const analyst = personnel.find(p => String(p.id).toLowerCase() === analystId);
        if (analyst) {
          const joinedAt = new Date().toISOString();
          setActiveTeam(prev => [...prev, { ...analyst, joinedAt, shiftNotes: notes }]);
          setPersonnel(pList => pList.map(p => String(p.id).toLowerCase() === analystId ? { ...p, status: 'on-duty' } : p));
          trackActivity('SHIFT_IN', `Analyst clock-in: ${analystId}. Shift awareness acknowledged.`, 'SUCCESS', { category: 'SHIFT' });
          
          await fetch('/api/active-team/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              userId: analystId, 
              name: analyst.name, 
              role: analyst.role, 
              notes, 
              status: 'on' 
            })
          });
        }
      }
    } catch (err) {
      console.error('Duty Toggle Failed:', err);
    }
  };

  const createHandover = (log: any) => {
    const newEntry = {
      id: `HO-${Date.now()}`,
      timestamp: new Date().toISOString(),
      team: activeTeam,
      verifiedBy: activeTeam.find(a => a.role === 'SOC MANAGER' || a.role === 'ADMIN' || a.role === 'MANAGER') || activeTeam[0],
      ...log
    };
    setHandoverLogs([newEntry, ...handoverLogs]);
    trackActivity('OPS_HANDOVER', `New shift handover created. Verified by: ${newEntry.verifiedBy?.name || 'SYSTEM'}`, 'SUCCESS', { category: 'MANAGEMENT' });
  };

  const updateToolStatus = (tool: string, status: any, latency: string) => {
    setHealthStatus(prev => {
      const toolPrev = prev[tool];
      if (toolPrev.status !== status) {
        const event = {
          id: `HEALTH-${Date.now()}`,
          timestamp: new Date().toISOString(),
          tool,
          prevStatus: toolPrev.status,
          newStatus: status,
          latency
        };
        setHealthHistory(hPrev => [event, ...hPrev].slice(0, 100));
        trackActivity('INFRA_HEALTH_CHANGE', `Tool status changed: ${tool} is now ${status.toUpperCase()}`, 'SUCCESS', { category: 'SYSTEM' });
      }
      return {
        ...prev,
        [tool]: { ...prev[tool], status, latency, lastSync: new Date().toISOString() }
      };
    });
  };

  const updateGovernanceDoc = (id: string, newContent: string) => {
    setGovernanceDocs(prev => {
      const doc = prev.find(d => d.id === id);
      const oldContent = doc ? doc.content : '';
      
      trackActivity('MGMT_SOP_UPDATE', `SOP updated: ${doc?.title || id}`, 'SUCCESS', { 
        category: 'MANAGEMENT',
        changes: diffObjects(oldContent, newContent)
      });

      return prev.map(d => 
        d.id === id ? { ...d, content: newContent, lastUpdated: new Date().toISOString() } : d
      );
    });
  };

  const value = {
    personnel,
    activeTeam,
    toggleDuty,
    handoverLogs,
    createHandover,
    healthStatus,
    healthHistory,
    updateToolStatus,
    shiftConfig,
    setShiftConfig,
    schedules,
    addSchedule,
    attendance,
    setPersonnelStatus,
    auditLogs,
    trackActivity,
    governanceDocs,
    updateGovernanceDoc,
    internalSyncing
  };

  return (
    <OperationsContext.Provider value={value}>
      {children}
    </OperationsContext.Provider>
  );
};

export const useOperations = () => {
  const context = useContext(OperationsContext);
  if (!context) throw new Error('useOperations must be used within an OperationsProvider');
  return context;
};
