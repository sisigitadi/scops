import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import {
  normalizeUsersCredentials
} from '../utils/passwordSecurity';

/**
 * SettingsContext — Global Configuration Hub
 * Persists application state to LocalStorage (v5) and synchronizes with BFF Infrastructure API.
 */

export interface SOCSettings {
  appName: string;
  orgName: string;
  refreshInterval: number;
  users: any[]; // Use any[] temporarily or refine with User interface if shared
  wazuh: { 
    manager: { host: string; port: string; user: string; password?: string; status: string };
    indexer: { host: string; port: string; user: string; password?: string; status: string };
  };
  opencti: { url: string; token: string; confidenceThreshold: number; status: string };
  channels: {
    telegram: { enabled: boolean; token: string; chatId: string; status: string };
    simulationMode: boolean;
    simulationMode: boolean;
    isDemoMode: boolean;
    slack: { enabled: boolean; webhook: string };
    whatsapp: { enabled: boolean; apiKey: string; senderPhone: string; provider: string };
  };
  ai: { enabled: boolean; provider: string; endpoint: string; apiKey?: string; status: string };
  database: { host: string; port: string; user: string; password?: string; name: string; type: string; status: string };
  infra: {
    sync: {
      alertBatchSize: number;
      maxRetries: number;
      timeoutMs: number;
      pollingInterval: number;
    };
    database: {
      cleanupThresholdDays: number;
      presenceTtlMinutes: number;
      autoVacuum: boolean;
    };
    logging: {
      minLevel: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
      auditRetentionDays: number;
      systemVisibility: 'STRICT' | 'LOG_ONLY' | 'SILENT';
    };
    security: {
      sessionTimeoutMinutes: number;
      passwordComplexity: 'LOW' | 'MEDIUM' | 'HIGH';
      autoLockIdle: number;
    };
  };
  appLogo: string | null;
  backendUrl?: string; // Implicitly used in AuthContext
}

interface ReliabilityEvent {
  serviceId: string;
  prevStatus: string;
  newStatus: string;
  latency?: string;
  timestamp: string;
}

interface SettingsContextType {
  settings: SOCSettings;
  updateSettings: (newSettings: Partial<SOCSettings>) => Promise<void>;
  updateServiceStatus: (serviceId: string, status: string, latency?: number | null) => void;
  rawSettings: SOCSettings;
  demoSyncStates: Record<string, boolean>;
  liveMetrics: Record<string, { latency: string; eps?: string; throughput?: string; iocs?: string; uptime?: string; lastIncidentSecAgo?: number | null }>;
  reliabilityEvents: ReliabilityEvent[];
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const defaultSettings: SOCSettings = {
  appName: 'SOC OPS',
  orgName: 'Security Operation Centre',
  refreshInterval: 30,
  users: [], // Seed data handled by bootstrap/registry
  wazuh: { 
    manager: { host: '', port: '55000', user: '', password: '', status: 'disconnected' },
    indexer: { host: '', port: '9200', user: '', password: '', status: 'disconnected' }
  },
  opencti: { url: '', token: '', confidenceThreshold: 75, status: 'disconnected' },
  channels: {
    telegram: { enabled: false, token: '', chatId: '', status: 'disconnected' },
    simulationMode: false,
    simulationMode: false,
    isDemoMode: false,
    slack: { enabled: false, webhook: '' },
    whatsapp: { enabled: false, apiKey: '', senderPhone: '', provider: 'Wassenger/Gateway' }
  },
  ai: { enabled: false, provider: 'GPT-4o', endpoint: '', apiKey: '', status: 'idle' },
  database: { host: '', port: '5432', user: '', password: '', name: 'socops_vault', type: 'PostgreSQL', status: 'disconnected' },
  infra: {
    sync: {
      alertBatchSize: 50,
      maxRetries: 3,
      timeoutMs: 5000,
      pollingInterval: 30
    },
    database: {
      cleanupThresholdDays: 30,
      presenceTtlMinutes: 30,
      autoVacuum: true
    },
    logging: {
      minLevel: 'INFO',
      auditRetentionDays: 90,
      systemVisibility: 'STRICT'
    },
    security: {
      sessionTimeoutMinutes: 120,
      passwordComplexity: 'MEDIUM',
      autoLockIdle: 15
    }
  },
  appLogo: null
};

function sanitizeUsersForRuntime(users: any[] = []) {
  return (users || []).map(user => {
    if (!user || typeof user !== 'object') return user;
    if (user.passwordHash && user.password) {
      const { password: _password, ...cleanUser } = user;
      return cleanUser;
    }
    return user;
  });
}

function sanitizeRuntimeSettings(source: Partial<SOCSettings> = {}): SOCSettings {
  return {
    ...defaultSettings,
    ...source,
    users: sanitizeUsersForRuntime(source.users || []),
    wazuh: {
      ...defaultSettings.wazuh,
      ...source.wazuh,
      manager: { ...defaultSettings.wazuh.manager, ...source.wazuh?.manager },
      indexer: { ...defaultSettings.wazuh.indexer, ...source.wazuh?.indexer }
    },
    opencti: { ...defaultSettings.opencti, ...source.opencti },
    channels: { ...defaultSettings.channels, ...source.channels },
    ai: { ...defaultSettings.ai, ...source.ai },
    database: { ...defaultSettings.database, ...source.database },
    infra: {
      ...defaultSettings.infra,
      ...source.infra,
      sync: { ...defaultSettings.infra.sync, ...source.infra?.sync },
      database: { ...defaultSettings.infra.database, ...source.infra?.database },
      logging: { ...defaultSettings.infra.logging, ...source.infra?.logging },
      security: { ...defaultSettings.infra.security, ...source.infra?.security }
    }
  } as SOCSettings;
}

async function sanitizePersistedSettings(source: SOCSettings): Promise<SOCSettings> {
  const sanitized = sanitizeRuntimeSettings(source);
  const users = await normalizeUsersCredentials(sanitized.users || []);
  return { ...sanitized, users };
}

function isDemoRuntimeEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem('socops_demo_mode') === '1';
  } catch {
    return false;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SOCSettings>(() => {
    const savedV5 = localStorage.getItem('socops_settings_v5');
    try {
      if (savedV5) {
        // [V6.1.0] IDENTITY CACHE BUSTER: Force reset if legacy personas detected in LocalStorage
        const legacyPattern = /Rina Putri|Dimas Pratama|Farhan Aulia|Siti Rahma|Budi Santoso/i;
        if (legacyPattern.test(savedV5)) {
          console.warn('[IDENTITY] Legacy personas detected in storage. Triggering forensic cache reset...');
          localStorage.removeItem('socops_settings_v5');
          return defaultSettings;
        }

        const parsed = JSON.parse(savedV5);
        return sanitizeRuntimeSettings({ ...defaultSettings, ...parsed });
      }
      return defaultSettings;
    } catch (e) {
      return defaultSettings;
    }
  });

  const [demoSyncStates] = useState({ wazuh_manager: false, wazuh_indexer: false, opencti: false, telegram: false, database: false });
  const [isDemoRuntime, setIsDemoRuntime] = useState<boolean>(() => isDemoRuntimeEnabled());
  const [reliabilityEvents, setReliabilityEvents] = useState<ReliabilityEvent[]>([]);
  const [liveMetrics, setLiveMetrics] = useState<Record<string, { latency: string; eps?: string; throughput?: string; iocs?: string; uptime?: string; lastIncidentSecAgo?: number | null }>>({
    wazuh_manager: { latency: '12ms', eps: '4.2 EPS', uptime: '99.98%', lastIncidentSecAgo: null },
    wazuh_indexer: { latency: '8ms', throughput: '2.8 Gbps', uptime: '99.99%', lastIncidentSecAgo: null },
    opencti: { latency: '45ms', iocs: '142 IOCs', uptime: '99.95%', lastIncidentSecAgo: null },
    telegram: { latency: '220ms', uptime: '99.90%', lastIncidentSecAgo: null },
    database: { latency: '4ms', uptime: '99.99%', lastIncidentSecAgo: null }
  });

  useEffect(() => {
    const syncMode = () => setIsDemoRuntime(isDemoRuntimeEnabled());
    window.addEventListener('socops:mode-change', syncMode);
    window.addEventListener('storage', syncMode);

    // REAL-TIME SYNC: Listen for remote status signals from other consoles
    const handleRemoteUpdate = (e: any) => {
      const { serviceId, status, latency } = e.detail;
      
      setSettings(prev => {
        const next = { ...prev };
        if (serviceId === 'wazuh_manager') next.wazuh = { ...prev.wazuh, manager: { ...prev.wazuh.manager, status } };
        else if (serviceId === 'wazuh_indexer') next.wazuh = { ...prev.wazuh, indexer: { ...prev.wazuh.indexer, status } };
        else if (serviceId === 'opencti') next.opencti = { ...prev.opencti, status };
        else if (serviceId === 'telegram') next.channels = { ...prev.channels, telegram: { ...prev.channels.telegram, status } };
        else if (serviceId === 'database') next.database = { ...prev.database, status };
        return next;
      });

      // Update metrics independently to avoid nested state mutation patterns
      if (latency) {
        setLiveMetrics(m => ({ ...m, [serviceId]: { ...m[serviceId], latency: `${latency}ms` } }));
      }
    };

    window.addEventListener('socops:remote-service-update', handleRemoteUpdate);

    return () => {
      window.removeEventListener('socops:mode-change', syncMode);
      window.removeEventListener('storage', syncMode);
      window.removeEventListener('socops:remote-service-update', handleRemoteUpdate);
    };
  }, []);

  const applyDemoServiceProjection = (base: SOCSettings): SOCSettings => ({
    ...base,
    wazuh: {
      ...base.wazuh,
      manager: {
        ...base.wazuh.manager,
        host: base.wazuh.manager.host || 'demo-wazuh-manager.local'
      },
      indexer: {
        ...base.wazuh.indexer,
        host: base.wazuh.indexer.host || 'demo-wazuh-indexer.local'
      }
    },
    opencti: {
      ...base.opencti,
      url: base.opencti.url || 'http://demo-opencti.local/graphql'
    },
    channels: {
      ...base.channels,
      telegram: {
        ...base.channels.telegram,
        enabled: true,
        chatId: base.channels.telegram.chatId || '@socops_demo_channel'
      },
      isDemoMode: true
    },
    database: {
      ...base.database,
      host: base.database.host || 'forensic-db-cluster.local'
    }
  });

  const getCurrentStatusByService = (state: SOCSettings, serviceId: string): string => {
    if (serviceId === 'wazuh_manager') return state.wazuh.manager.status;
    if (serviceId === 'wazuh_indexer') return state.wazuh.indexer.status;
    if (serviceId === 'opencti') return state.opencti.status;
    if (serviceId === 'telegram') return state.channels.telegram.status;
    if (serviceId === 'database') return state.database.status;
    return 'unknown';
  };

  const pushReliabilityEvent = (serviceId: string, prevStatus: string, newStatus: string, latency?: string) => {
    if (prevStatus === newStatus) return;
    setReliabilityEvents(prev => [{
      serviceId,
      prevStatus,
      newStatus,
      latency,
      timestamp: new Date().toISOString()
    }, ...prev].slice(0, 200));
  };

  const updateServiceStatus = (serviceId: string, status: string, latency: number | null = null) => {
    setSettings(prev => {
      const prevStatus = getCurrentStatusByService(prev, serviceId);
      const next = { ...prev };
      if (serviceId === 'wazuh_manager') next.wazuh = { ...prev.wazuh, manager: { ...prev.wazuh.manager, status } };
      else if (serviceId === 'wazuh_indexer') next.wazuh = { ...prev.wazuh, indexer: { ...prev.wazuh.indexer, status } };
      else if (serviceId === 'opencti') next.opencti = { ...prev.opencti, status };
      else if (serviceId === 'telegram') next.channels = { ...prev.channels, telegram: { ...prev.channels.telegram, status } };
      else if (serviceId === 'database') next.database = { ...prev.database, status };
      pushReliabilityEvent(serviceId, prevStatus, status, latency ? `${latency}ms` : undefined);
      return next;
    });
    if (latency !== null) setLiveMetrics(prev => ({ ...prev, [serviceId]: { ...prev[serviceId], latency: `${latency}ms` } }));
    
    // BROADCAST: Signal to global bus for Socket synchronization
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('socops:service-status-change', { 
        detail: { serviceId, status, latency } 
      }));
    }
  };

  useEffect(() => {
    if (isDemoRuntime) {
      setSettings(prev => {
        const projected = applyDemoServiceProjection(prev);
        return {
          ...projected,
          wazuh: {
            ...projected.wazuh,
            manager: { ...projected.wazuh.manager, status: 'connected' },
            indexer: { ...projected.wazuh.indexer, status: 'connected' }
          },
          opencti: { ...projected.opencti, status: 'connected' },
          channels: {
            ...projected.channels,
            telegram: { ...projected.channels.telegram, status: 'connected', enabled: true }
          },
          database: { ...projected.database, status: 'connected' }
        };
      });
      setLiveMetrics({
        wazuh_manager: { latency: '11ms', eps: '5.1 EPS', uptime: '99.99%' },
        wazuh_indexer: { latency: '7ms', throughput: '3.2 Gbps', uptime: '99.99%' },
        opencti: { latency: '39ms', iocs: '216 IOCs', uptime: '99.97%' },
        telegram: { latency: '95ms', uptime: '99.95%' },
        database: { latency: '3ms', uptime: '99.99%' }
      });
      return;
    }

    // Initial Bootstrap from BFF
    fetch('/api/config/bootstrap')
      .then(res => res.json())
      .then(async (serverConfig) => {
        setSettings(prev => {
          const merged = {
            ...prev,
            wazuh: {
              ...prev.wazuh,
              manager: { ...prev.wazuh.manager, ...serverConfig.wazuh?.manager },
              indexer: { ...prev.wazuh.indexer, ...serverConfig.wazuh?.indexer }
            },
            opencti: { ...prev.opencti, ...serverConfig.opencti },
            channels: {
              ...prev.channels,
              telegram: { ...prev.channels.telegram, ...serverConfig.telegram }
            },
            database: { ...prev.database, ...serverConfig.database }
          };
          
          const performHandshake = async (endpoint: string, id: string, config: any) => {
            try {
              const res = await fetch(`/api/test/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ config })
              });
              const data = await res.json();
              updateServiceStatus(id, data.ok ? 'connected' : 'error');
            } catch (e) { 
              updateServiceStatus(id, 'error');
            }
          };

          setTimeout(() => {
            performHandshake('wazuh-manager', 'wazuh_manager', merged.wazuh.manager);
            performHandshake('wazuh-indexer', 'wazuh_indexer', merged.wazuh.indexer);
            performHandshake('opencti', 'opencti', merged.opencti);
            if (merged.channels?.telegram?.token) performHandshake('telegram', 'telegram', merged.channels.telegram);
            if (merged.database?.host) performHandshake('database', 'database', merged.database);
          }, 500);
          
          return merged;
        });
      }).catch(err => console.warn('[BOOTSTRAP ERROR]', err));

    // Sync Users from Registry
    fetch('/api/users')
      .then(res => res.json())
      .then(dbUsers => {
        if (Array.isArray(dbUsers) && dbUsers.length > 0) {
          setSettings(prev => ({ 
            ...prev, 
            users: dbUsers.map(u => ({ ...u, status: 'Active', isDefault: u.role === 'admin' })) 
          }));
        }
      }).catch(err => console.warn('[USERS FETCH ERROR]', err));

    // Sync Infrastructure Settings
    fetch('/api/config/infra')
      .then(res => res.json())
      .then(dbInfra => {
        if (dbInfra && Object.keys(dbInfra).length > 0) {
          setSettings(prev => ({ ...prev, infra: { ...prev.infra, ...dbInfra } }));
        }
      }).catch(err => console.warn('[INFRA FETCH ERROR]', err));
  }, [isDemoRuntime]);

  useEffect(() => {
    if (!isDemoRuntime) return;

    let elapsedSec = 0;
    const outageUntil: Record<string, number> = {
      wazuh_manager: 0,
      wazuh_indexer: 0,
      opencti: 0,
      telegram: 0,
      database: 0
    };
    const lastIncidentAt: Record<string, number | null> = {
      wazuh_manager: null,
      wazuh_indexer: null,
      opencti: null,
      telegram: null,
      database: null
    };

    const random = (min: number, max: number) => Math.random() * (max - min) + min;
    const fmt = (n: number, d = 1) => Number(n).toFixed(d);

    // DYNAMIC RE-CALIBRATION: More frequent 'Realistic' drops & jitter
    const profile = { 
      dropChance: 0.05,        // Higher chance of incident
      outageMin: 5000,        // Minimum 5s outage
      outageMax: 15000,       // Maximum 15s outage
      jitterChance: 0.15,     // 15% chance of network jitter
      tickMs: 1500            // Slower tick for more stable visual feel
    };

    const tick = () => {
      elapsedSec += 1;
      const now = Date.now();

      const nextStatus = (serviceId: string) => {
        // PER-SERVICE RECOVERY LOGIC
        if (now < outageUntil[serviceId]) {
           // Simulating intermittent reconnection phase
           return Math.random() < 0.4 ? 'error' : 'disconnected';
        }
        
        // CORRELATED FAILURE: If indexer is down, manager is likely degraded
        if (serviceId === 'wazuh_manager' && now < outageUntil['wazuh_indexer']) {
           return Math.random() < 0.3 ? 'error' : 'connected'; 
        }

        // TRIGGER NEW OUTAGE
        if (Math.random() < profile.dropChance) {
          outageUntil[serviceId] = now + Math.floor(random(profile.outageMin, profile.outageMax));
          lastIncidentAt[serviceId] = now;
          return 'disconnected';
        }
        
        return 'connected';
      };

      const wm = nextStatus('wazuh_manager');
      const wi = nextStatus('wazuh_indexer');
      const oc = nextStatus('opencti');
      const tg = nextStatus('telegram');
      const db = nextStatus('database');

      // DYNAMIC LATENCY: Normal (Low), Jitter (High Spike), Down (Static ---)
      const getLatency = (status: string, baseMin: number, baseMax: number) => {
        if (status !== 'connected') return 0;
        const reflectsJitter = Math.random() < profile.jitterChance;
        return reflectsJitter 
          ? Math.round(random(200, 850)) // Spike!
          : Math.round(random(baseMin, baseMax));
      };

      const wmLatency = getLatency(wm, 8, 22);
      const wiLatency = getLatency(wi, 5, 15);
      const ocLatency = getLatency(oc, 30, 90);
      const tgLatency = getLatency(tg, 180, 280);
      const dbLatency = getLatency(db, 2, 8);

      // BROADCAST TO EXTERNAL CONTEXTS (Operations, Bridge, etc.)
      updateServiceStatus('wazuh_manager', wm, wmLatency || null);
      updateServiceStatus('wazuh_indexer', wi, wiLatency || null);
      updateServiceStatus('opencti', oc, ocLatency || null);
      updateServiceStatus('telegram', tg, tgLatency || null);
      updateServiceStatus('database', db, dbLatency || null);

      // FORCE SETTINGS STATE (Pure Demo Persistence)
      setSettings(prev => ({
        ...prev,
        channels: {
          ...prev.channels,
          telegram: { ...prev.channels.telegram, enabled: true },
          isDemoMode: true
        }
      }));

      const upBase = 99.8 + Math.sin(elapsedSec / 45) * 0.12;
      const secAgo = (key: string) => (lastIncidentAt[key] ? Math.floor((now - (lastIncidentAt[key] as number)) / 1000) : null);

      setLiveMetrics({
        wazuh_manager: {
          latency: wmLatency ? `${wmLatency}ms` : '---',
          eps: wm === 'connected' ? `${fmt(random(4.2, 8.5), 1)} EPS` : '0 EPS',
          uptime: `${fmt(upBase + (wm === 'connected' ? 0.05 : wm === 'error' ? -0.8 : -0.5), 2)}%`,
          lastIncidentSecAgo: secAgo('wazuh_manager')
        },
        wazuh_indexer: {
          latency: wiLatency ? `${wiLatency}ms` : '---',
          throughput: wi === 'connected' ? `${fmt(random(3.2, 5.1), 1)} Gbps` : '0 Gbps',
          uptime: `${fmt(upBase + (wi === 'connected' ? 0.08 : wi === 'error' ? -1.2 : -0.8), 2)}%`,
          lastIncidentSecAgo: secAgo('wazuh_indexer')
        },
        opencti: {
          latency: ocLatency ? `${ocLatency}ms` : '---',
          iocs: `${Math.round(random(140, 420))} IOCs`,
          uptime: `${fmt(upBase + (oc === 'connected' ? 0.02 : oc === 'error' ? -0.95 : -0.65), 2)}%`,
          lastIncidentSecAgo: secAgo('opencti')
        },
        telegram: {
          latency: tgLatency ? `${tgLatency}ms` : '---',
          uptime: `${fmt(upBase + (tg === 'connected' ? 0.01 : tg === 'error' ? -1.5 : -1.2), 2)}%`,
          lastIncidentSecAgo: secAgo('telegram')
        },
        database: {
          latency: dbLatency ? `${dbLatency}ms` : '---',
          uptime: `${fmt(upBase + (db === 'connected' ? 0.1 : db === 'error' ? -0.4 : -0.2), 2)}%`,
          lastIncidentSecAgo: secAgo('database')
        }
      });
    };

    tick();
    const timer = setInterval(tick, profile.tickMs);

    return () => clearInterval(timer);
  }, [isDemoRuntime]);

  useEffect(() => {
    let isCancelled = false;
    const persistSettings = async () => {
      try {
        const sanitized = await sanitizePersistedSettings(settings);
        if (isCancelled) return;
        localStorage.setItem('socops_settings_v5', JSON.stringify(sanitized));
      } catch (error) { 
        console.error('Settings Persist Error:', error); 
      }
    };
    persistSettings();
    return () => { isCancelled = true; };
  }, [settings]);

  const updateSettings = async (newSettings: Partial<SOCSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    
    if (newSettings.infra) {
      try {
        await fetch('/api/config/infra', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSettings.infra)
        });
      } catch (err) {
        console.warn('[SERVER SETTINGS PERSIST FAILED]', err);
      }
    }
  };

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      updateSettings, 
      updateServiceStatus, 
      rawSettings: settings, 
      demoSyncStates, 
      liveMetrics,
      reliabilityEvents
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};
