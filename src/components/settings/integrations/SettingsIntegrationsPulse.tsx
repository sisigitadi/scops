import React from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useSettings, SOCSettings } from '../../../context/SettingsContext';

/**
 * SettingsIntegrationsPulse — Infrastructure Pulse Matrix
 * Real-time monitoring hub for integrated toolchain components, 
 * providing high-fidelity telemetry for Wazuh, OpenCTI, and Secure Channels.
 */

interface SettingsIntegrationsPulseProps {
  localSettings: SOCSettings;
  isDemoUser: boolean;
}

export default function SettingsIntegrationsPulse({ localSettings, isDemoUser }: SettingsIntegrationsPulseProps) {
  const { t } = useLanguage();
  const { demoSyncStates, liveMetrics } = useSettings();

  const metricsPool = [
    { 
      label: 'WAZUH MANAGER', 
      id: 'wazuh_manager' as const, 
      status: localSettings.wazuh.manager.status, 
      color: 'accent-cyan', 
      metric: liveMetrics?.wazuh_manager?.eps || '0 eps', 
      latency: liveMetrics?.wazuh_manager?.latency || '0ms', 
      uptime: liveMetrics?.wazuh_manager?.uptime || '99.9%',
      lastIncidentSecAgo: liveMetrics?.wazuh_manager?.lastIncidentSecAgo
    },
    { 
      label: 'WAZUH INDEXER', 
      id: 'wazuh_indexer' as const, 
      status: localSettings.wazuh.indexer.status, 
      color: 'accent-indigo', 
      metric: liveMetrics?.wazuh_indexer?.throughput || '0 B/s', 
      latency: liveMetrics?.wazuh_indexer?.latency || '0ms', 
      uptime: liveMetrics?.wazuh_indexer?.uptime || '99.8%',
      lastIncidentSecAgo: liveMetrics?.wazuh_indexer?.lastIncidentSecAgo
    },
    { 
      label: 'OPENCTI HUB', 
      id: 'opencti' as const, 
      status: localSettings.opencti.status, 
      color: 'accent-purple', 
      metric: liveMetrics?.opencti?.iocs || '0 iocs', 
      latency: liveMetrics?.opencti?.latency || '0ms', 
      uptime: liveMetrics?.opencti?.uptime || '100%',
      lastIncidentSecAgo: liveMetrics?.opencti?.lastIncidentSecAgo
    },
    { 
      label: 'TELEGRAM BOT', 
      id: 'telegram' as const, 
      status: localSettings.channels.telegram.status, 
      color: 'accent-amber', 
      metric: 'Active', 
      latency: liveMetrics?.telegram?.latency || 'STANDBY', 
      uptime: liveMetrics?.telegram?.uptime || '99.2%',
      lastIncidentSecAgo: liveMetrics?.telegram?.lastIncidentSecAgo
    }
  ];

  return (
    <div className="premium-capsule !p-8 border-t-4 border-accent-cyan/40">
      <div className="flex items-center gap-4 mb-8 font-bold">
        <div className="p-2.5 rounded-xl bg-accent-cyan/10 text-accent-cyan">
          <Activity size={20} strokeWidth={2.5} />
        </div>
        <h3 className="text-sm font-black text-foreground-primary uppercase tracking-[0.2em]">{(t('settings.dashboard.pulseTitle') as string)}</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 font-bold">
        {metricsPool.map((item, idx) => (
          <div key={idx} className="premium-card !p-5 flex flex-col group relative overflow-hidden transition-all hover:bg-bg-panel/20">
            {demoSyncStates?.[item.id] && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.1, 0] }}
                transition={{ duration: 1 }}
                className={`absolute inset-0 bg-${item.color}`}
              />
            )}

            <div className="flex justify-between items-start mb-4">
              <span className="text-[9px] font-black text-foreground-tertiary uppercase tracking-widest">{item.label}</span>
              <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'connected' ? 'bg-status-success-text indicator-glow-max' : item.status === 'error' ? 'bg-accent-amber animate-pulse shadow-accent-amber/50' : 'bg-status-danger-text animate-pulse shadow-status-danger-text/50'}`} />
            </div>
            
            <div className="flex-1 grid grid-cols-2 gap-4 items-end mb-5">
              <div className="flex items-end gap-3">
                <div className={`w-2.5 h-12 rounded-full bg-bg-panel/60 border border-border-primary/10 overflow-hidden shrink-0`}>
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ 
                      height: item.status === 'connected' ? '100%' : item.status === 'error' ? '45%' : '20%',
                      opacity: demoSyncStates?.[item.id] ? [1, 0.4, 1] : 1
                    }}
                    className={`w-full ${item.status === 'connected' ? `bg-${item.color}` : item.status === 'error' ? 'bg-accent-amber' : 'bg-status-danger-border'} shadow-lg`}
                  />
                </div>
                <div>
                  <div className="text-lg font-black text-foreground-primary tracking-tighter leading-none">{item.latency}</div>
                  <div className="text-[7px] font-bold text-foreground-tertiary uppercase tracking-widest opacity-60">{(t('management.infra.latency') as string)}</div>
                </div>
              </div>

              <div className="text-right">
                 <div className={`text-lg font-black tracking-tighter leading-none ${demoSyncStates?.[item.id] ? `text-${item.color}` : 'text-foreground-primary'}`}>{item.metric}</div>
                 <div className="text-[7px] font-bold text-foreground-tertiary uppercase tracking-widest opacity-60">{item.id === 'telegram' ? 'HEARTBEAT' : 'THROUGHPUT'}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-border-primary/10 pt-4">
              <div>
                 <span className="text-[7px] font-black text-foreground-tertiary uppercase block opacity-40">{(t('management.infra.uptime') as string)}</span>
                 <span className={`text-[10px] font-black ${item.status === 'connected' ? 'text-status-success-text' : item.status === 'error' ? 'text-accent-amber' : 'text-status-danger-text'}`}>{item.uptime}</span>
              </div>
              <div className="text-right">
                <span className="text-[7px] font-black text-foreground-tertiary uppercase block opacity-40">{(t('settings.wazuhFields.stability') as string)}</span>
                <span className="text-[10px] font-black text-accent-cyan uppercase">{item.status === 'connected' ? (t('settings.wazuhFields.ultra') as string) : item.status === 'error' ? 'DEGRADED' : (t('settings.wazuhFields.nominal') as string)}</span>
              </div>
            </div>

            <div className="text-[8px] font-black uppercase tracking-wider text-foreground-tertiary opacity-70 mt-2">
              LAST INCIDENT: {item.lastIncidentSecAgo == null ? 'NO INCIDENT YET' : `${item.lastIncidentSecAgo}s AGO`}
            </div>

            <div className={`mt-3 py-1.5 rounded-lg text-center text-[8px] font-black uppercase tracking-widest transition-all ${item.status === 'connected' ? `bg-${item.color}/10 text-${item.color}/80` : item.status === 'error' ? 'bg-accent-amber/15 text-accent-amber' : 'bg-status-danger-bg text-status-danger-text'}`}>
              {item.status === 'connected' ? (t('settings.dashboard.statusOptimal') as string) : item.status === 'error' ? 'DEGRADED' : (t('settings.dashboard.statusOffline') as string)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
