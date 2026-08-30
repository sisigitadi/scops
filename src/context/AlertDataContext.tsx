import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { readStorage, STORAGE_KEYS, writeStorage } from '../services/localStorageService';
import { useSettings } from './SettingsContext';
import { useAuth, ROLES } from './AuthContext';
import { wazuhIndexerService } from '../services/wazuhIndexerService';
import { openctiService } from '../services/openctiService';
import { normalizeAlert, normalizeAlerts } from '../domain/alerts/normalizeAlert';
import { wazuhAlerts } from '../data/wazuhData';
import { generateAlerts } from '../utils/proceduralGenerator';

/**
 * AlertDataContext — Operational Alert Pipeline
 * Manages ingestion from Wazuh Indexer, real-time sync, enrichment from OpenCTI, and persistence.
 */

export interface AlertHistoryEntry {
  timestamp: string;
  user: string;
  changes: string[];
}

export interface Alert {
  id: string;
  timestamp: string;
  ruleId: string;
  ruleDescription: string;
  severity: number;
  category: string;
  status: 'open' | 'investigating' | 'closed' | 'escalated' | 'false_positive';
  source: string;
  agentName: string;
  agentIp: string;
  sourceIp: string;
  destIp: string;
  history: AlertHistoryEntry[];
  checklist: Record<string, boolean>;
  isFalsePositive?: boolean;
  metadata?: any;
  enriched?: boolean;
  enrichmentError?: string;
  intel?: {
    actor: string;
    malware: string;
    tlp: string;
    origin: string;
    score: number;
  };
  opencti?: any;
  [key: string]: any;
}

export interface SyncError {
  type: string;
  status: number | null;
  message: string;
  hint: string;
  technicalMessage: string;
}

interface AlertDataContextType {
  alerts: Alert[];
  systemLogs: any[];
  isSyncing: boolean;
  syncError: SyncError | { type: 'not_configured' } | null;
  lastSuccessfulSyncAt: string | null;
  retrySync: () => void;
  regenerateDemoData: () => void;
  updateAlertById: (id: string, patch: Partial<Alert>, analystName?: string) => void;
  updateMultipleAlerts: (ids: string[], patch: Partial<Alert>, analystName?: string) => void;
  togglePlaybookStep: (id: string, stepLabel: string, analystName?: string) => void;
  addAlerts: (newAlerts: any[]) => void;
  addSystemLog: (logEntry: any) => void;
  clearIngestedPayloads: () => number;
  enrichAlert: (id: string, analystName?: string) => Promise<void>;
}

const AlertDataContext = createContext<AlertDataContextType | undefined>(undefined);

function initializeAlerts(isDemo: boolean): Alert[] {
  const key = isDemo ? STORAGE_KEYS.alertsDemo : STORAGE_KEYS.alerts;
  const storedAlerts = readStorage(key, null);
  if (!Array.isArray(storedAlerts) || storedAlerts.length === 0) return [];
  return normalizeAlerts(storedAlerts) as Alert[];
}

export function AlertDataProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const { user } = useAuth();
  const isDemoUser = user?.role === ROLES.DEMO;
  const activeStorageKey = isDemoUser ? STORAGE_KEYS.alertsDemo : STORAGE_KEYS.alerts;
  
  const [alerts, setAlerts] = useState<Alert[]>(() => initializeAlerts(isDemoUser));
  const [systemLogs, setSystemLogs] = useState(() => readStorage(STORAGE_KEYS.auditLog, []));
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<SyncError | { type: 'not_configured' } | null>(null);
  const [lastSuccessfulSyncAt, setLastSuccessfulSyncAt] = useState<string | null>(null);
  const [syncAttempt, setSyncAttempt] = useState(0);
  const syncLockRef = useRef(false);

  useEffect(() => {
    const storedAlerts = readStorage(activeStorageKey, null);
    if (Array.isArray(storedAlerts) && (isDemoUser ? storedAlerts.length >= 9000 : storedAlerts.length > 0)) {
      setAlerts(normalizeAlerts(storedAlerts) as Alert[]);
    } else if (isDemoUser) {
      // MASSIVE HIGH-DENSITY SEED: 9999 Realistic Attacks for Production-Ready Demo
      const seed = generateAlerts(9999);
      const normalized = normalizeAlerts(seed) as Alert[];
      setAlerts(normalized);
      writeStorage(activeStorageKey, seed);
    } else {
      setAlerts([]);
    }
  }, [activeStorageKey, isDemoUser]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === activeStorageKey) {
        const freshAlerts = readStorage(activeStorageKey, null);
        if (Array.isArray(freshAlerts)) {
          setAlerts(normalizeAlerts(freshAlerts) as Alert[]);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [activeStorageKey]);

  useEffect(() => {
    const indexerConfig = settings.wazuh?.indexer;
    if (isDemoUser || !indexerConfig?.host) {
      // PRO-DEMO: Auto-clear errors in demo mode to maintain 'Clinical Calm'
      setSyncError(!isDemoUser && !indexerConfig?.host ? { type: 'not_configured' } : null);
      if (isDemoUser) setIsSyncing(false); 
      return;
    }

    let timerId: NodeJS.Timeout | null = null;
    let cancelled = false;

    const syncWithIndexer = async () => {
      if (syncLockRef.current) return;
      syncLockRef.current = true;
      setIsSyncing(true);

      try {
        const realAlerts = normalizeAlerts(await wazuhIndexerService.getAlerts(indexerConfig || {}, { limit: 50 })) as Alert[];
        if (!cancelled) {
          setSyncError(null);
          setLastSuccessfulSyncAt(new Date().toISOString());
        }
        if (realAlerts.length > 0) {
          setAlerts((prevAlerts) => {
            const existingIds = new Set(prevAlerts.map((alert) => alert.id));
            const uniqueNew = realAlerts.filter((alert) => !existingIds.has(alert.id));
            if (uniqueNew.length === 0) return prevAlerts;

            const merged = [...uniqueNew, ...prevAlerts].slice(0, 10000);
            writeStorage(activeStorageKey, merged);
            return merged;
          });
        }
      } catch (error: any) {
        if (!cancelled) {
          const hint = error?.hint ? ` | Hint: ${error.hint}` : '';
          setSyncError({
            type: error?.type || 'unknown',
            status: error?.status || null,
            message: error?.message || 'Unknown sync error',
            hint: error?.hint || '',
            technicalMessage: error?.technicalMessage || (hint ? `${error?.message || ''}${hint}` : '')
          });
        }
        console.warn('Wazuh Indexer Sync: no connectivity --', error.message);
      } finally {
        syncLockRef.current = false;
        if (!cancelled) {
          setIsSyncing(false);
          timerId = setTimeout(syncWithIndexer, settings.refreshInterval ? settings.refreshInterval * 1000 : 30000);
        }
      }
    };

    syncWithIndexer();

    return () => {
      cancelled = true;
      if (timerId) clearTimeout(timerId);
    };
  }, [activeStorageKey, isDemoUser, settings.wazuh?.indexer, settings.refreshInterval, syncAttempt]);

  const retrySync = () => {
    setSyncAttempt(prev => prev + 1);
  };

  const updateAlertById = (id: string, patch: Partial<Alert>, analystName = 'System') => {
    setAlerts((prevAlerts) => {
      const nextAlerts = prevAlerts.map((alert) => {
        if (alert.id !== id) return alert;

        const history = alert.history || [];
        const newEntry: AlertHistoryEntry = {
          timestamp: new Date().toISOString(),
          user: analystName,
          changes: Object.keys(patch).map((key) => `${key}: ${alert[key]} -> ${patch[key as keyof Alert]}`)
        };

        return normalizeAlert({ ...alert, ...patch, history: [newEntry, ...history].slice(0, 10) }) as Alert;
      });

      writeStorage(activeStorageKey, nextAlerts);
      return nextAlerts;
    });
  };

  const updateMultipleAlerts = (ids: string[], patch: Partial<Alert>, analystName = 'System') => {
    const targetIds = new Set(ids);

    setAlerts((prevAlerts) => {
      const nextAlerts = prevAlerts.map((alert) => {
        if (!targetIds.has(alert.id)) return alert;

        const history = alert.history || [];
        const newEntry: AlertHistoryEntry = {
          timestamp: new Date().toISOString(),
          user: analystName,
          changes: Object.keys(patch).map((key) => `${key}: ${alert[key]} -> ${patch[key as keyof Alert]}`)
        };

        return normalizeAlert({ ...alert, ...patch, history: [newEntry, ...history].slice(0, 10) }) as Alert;
      });

      writeStorage(activeStorageKey, nextAlerts);
      return nextAlerts;
    });
  };

  const togglePlaybookStep = (id: string, stepLabel: string, analystName = 'System') => {
    setAlerts((prevAlerts) => {
      const nextAlerts = prevAlerts.map((alert) => {
        if (alert.id !== id) return alert;

        const currentChecklist = alert.checklist || {};
        const isCompleted = !currentChecklist[stepLabel];
        const newChecklist = { ...currentChecklist, [stepLabel]: isCompleted };

        const history = alert.history || [];
        const newEntry: AlertHistoryEntry = {
          timestamp: new Date().toISOString(),
          user: analystName,
          changes: [`Playbook: ${stepLabel} -> ${isCompleted ? 'COMPLETED' : 'UNCOMPLETED'}`]
        };

        return normalizeAlert({ ...alert, checklist: newChecklist, history: [newEntry, ...history].slice(0, 10) }) as Alert;
      });

      writeStorage(activeStorageKey, nextAlerts);
      return nextAlerts;
    });
  };

  const addAlerts = (newAlerts: any[]) => {
    const incoming = normalizeAlerts(newAlerts) as Alert[];

    setAlerts((prevAlerts) => {
      const seen = new Set();
      const combined = [...incoming, ...prevAlerts]
        .filter((alert) => {
          if (seen.has(alert.id)) return false;
          seen.add(alert.id);
          return true;
        })
        .slice(0, 5000);

      writeStorage(activeStorageKey, combined);
      return combined;
    });
  };

  const addSystemLog = (logEntry: any) => {
    const newLog = {
      id: `sys-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: user?.name || 'System',
      ...logEntry
    };
    setSystemLogs(prev => {
      const updated = [newLog, ...prev].slice(0, 1000);
      writeStorage(STORAGE_KEYS.auditLog, updated);
      return updated;
    });
  };

  const clearIngestedPayloads = () => {
    let removedCount = 0;
    setAlerts((prevAlerts) => {
      const retainedAlerts = prevAlerts.filter((alert) => 
        alert.source === 'gold_demo' || alert.source !== 'manual_ingestion'
      );
      removedCount = prevAlerts.length - retainedAlerts.length;
      writeStorage(activeStorageKey, retainedAlerts);
      return retainedAlerts;
    });
    
    if (removedCount > 0) {
      addSystemLog({
        action: 'Ingestion Purge',
        details: `Purged ${removedCount} manual payloads.`
      });
    }
    return removedCount;
  };

  const enrichAlert = async (id: string, analystName = 'SOC CORE') => {
    const alert = alerts.find((item) => item.id === id);
    if (!alert) return;

    try {
      const openctiConfig = settings.opencti;
      if (!isDemoUser && (!openctiConfig?.url || !openctiConfig?.token)) {
        console.warn('OpenCTI enrichment skipped: Missing configuration.');
        return;
      }

      const indicator = alert.sourceIp || alert.srcip || alert.data?.srcip;
      if (!indicator) {
        console.warn('Enrichment skipped: No indicator found in alert.');
        return;
      }

      const GQL_QUERY = `
        query SearchIndicator($search: String) {
          indicators(search: $search, first: 5) {
            edges {
              node {
                id
                name
                description
                indicator_types
                confidence
                pattern
                x_opencti_score
                objectLabel { value color }
                createdBy { name }
              }
            }
          }
          stixCoreRelationships(search: $search, first: 5) {
            edges {
              node {
                relationship_type
                from { ... on StixDomainObject { id name entity_type } }
                to { ... on StixDomainObject { id name entity_type } }
                confidence
              }
            }
          }
        }
      `;

      const response: any = await openctiService.query(
        openctiConfig?.url || '',
        openctiConfig?.token || '',
        GQL_QUERY,
        { search: indicator }
      );

      const indicators = response?.data?.indicators?.edges?.map((edge: any) => edge.node) || [];
      const relationships = response?.data?.stixCoreRelationships?.edges?.map((edge: any) => edge.node) || [];

      const threatActors = relationships
        .filter((relation: any) => relation.from?.entity_type === 'Threat-Actor' || relation.to?.entity_type === 'Threat-Actor')
        .map((relation: any) => (relation.from?.entity_type === 'Threat-Actor' ? relation.from : relation.to));

      const enrichedData = {
        enriched: true,
        opencti: {
          indicators,
          relationships,
          threat_actors: threatActors
        },
        intel: {
          actor: threatActors[0]?.name || 'Unknown',
          malware:
            relationships.find((relation: any) => relation.from?.entity_type === 'Malware' || relation.to?.entity_type === 'Malware')?.from?.name ||
            relationships.find((relation: any) => relation.from?.entity_type === 'Malware' || relation.to?.entity_type === 'Malware')?.to?.name ||
            'N/A',
          tlp:
            indicators[0]?.objectLabel
              ?.find((label: any) => label.value?.startsWith('tlp:'))
              ?.value?.replace('tlp:', '')
              .toUpperCase() || 'CLEAR',
          origin: 'OpenCTI',
          score: indicators[0]?.x_opencti_score || indicators[0]?.confidence || 0
        }
      };

      updateAlertById(id, enrichedData, analystName);
    } catch (error: any) {
      console.error('OpenCTI Enrichment Error:', error.message);
      updateAlertById(
        id,
        {
          enriched: false,
          enrichmentError: error.message
        },
        analystName
      );
    }
  };

  const regenerateDemoData = () => {
    // SECURITY HARDENING: Triple-check demo authorization before allowing data mutation
    const isActuallyDemo = user?.role === ROLES.DEMO && (import.meta.env.VITE_APP_ENV === 'demo' || window.location.hash.includes('/demo'));
    
    if (!isActuallyDemo) {
      console.warn('[SECURITY] Blocked unauthorized attempt to trigger demo data regeneration in production context.');
      return;
    }

    const seed = generateAlerts(9999);
    const normalized = normalizeAlerts(seed) as Alert[];
    setAlerts(normalized);
    writeStorage(activeStorageKey, seed);
    addSystemLog({
      action: 'Simulasi Serangan',
      details: 'Memicu regenerasi 9999 log serangan baru untuk pengujian filter skala besar.'
    });
  };

  const value = {
    alerts,
    systemLogs,
    isSyncing,
    syncError,
    lastSuccessfulSyncAt,
    retrySync,
    regenerateDemoData,
    updateAlertById,
    updateMultipleAlerts,
    togglePlaybookStep,
    addAlerts,
    addSystemLog,
    clearIngestedPayloads,
    enrichAlert
  };

  return <AlertDataContext.Provider value={value}>{children}</AlertDataContext.Provider>;
}

export function useAlertData() {
  const context = useContext(AlertDataContext);
  if (!context) throw new Error('useAlertData must be used within AlertDataProvider');
  return context;
}
