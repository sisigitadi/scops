import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, Shield, History, AlertCircle, CheckCircle2, Server } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useSettings } from '../../context/SettingsContext';
import { pulse, formatDDMMYYYY } from '../../utils/datePulse';
import InfoTooltip from '../common/InfoTooltip';

export default function ReliabilityTracker() {
  const { t } = useLanguage();
  const { settings, liveMetrics, reliabilityEvents, demoSyncStates } = useSettings();

  const tools = useMemo(() => ([
    { id: 'wazuh_manager', label: t('management.infra.services.wazuh_manager') || 'WAZUH MANAGER', status: settings.wazuh.manager.status, latency: liveMetrics.wazuh_manager?.latency, uptime: liveMetrics.wazuh_manager?.uptime },
    { id: 'wazuh_indexer', label: t('management.infra.services.wazuh_indexer') || 'WAZUH INDEXER', status: settings.wazuh.indexer.status, latency: liveMetrics.wazuh_indexer?.latency, uptime: liveMetrics.wazuh_indexer?.uptime },
    { id: 'opencti', label: t('management.infra.services.opencti') || 'OPENCTI', status: settings.opencti.status, latency: liveMetrics.opencti?.latency, uptime: liveMetrics.opencti?.uptime },
    { id: 'telegram', label: t('management.infra.services.telegram') || 'TELEGRAM', status: settings.channels.telegram.status, latency: liveMetrics.telegram?.latency, uptime: liveMetrics.telegram?.uptime }
  ]), [settings, liveMetrics]);

  const statusTone = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'connected' || s === 'online') return 'ok';
    if (s === 'error' || s === 'partialconnected' || s === 'syncing' || s === 'connecting' || s === 'partial') return 'error';
    return 'down';
  };

  const toTitle = (s: string) => (s || '').replace(/_/g, ' ').toUpperCase();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="premium-capsule p-8 sm:p-10">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border-primary/20">
            <div className={`p-3 rounded-2xl ${tools.every(t => t.status === 'connected') ? 'bg-status-success-bg/10 text-status-success-text' : (tools.some(t => t.status === 'connected') || tools.some(t => t.status === 'error')) ? 'bg-accent-amber/10 text-accent-amber' : 'bg-status-danger-bg/10 text-status-danger-text'} transition-colors`}><Activity size={24} className={tools.every(t => t.status === 'connected') ? '' : 'animate-pulse'} /></div>
            <div>
              <h3 className="text-xl font-bold text-foreground-primary tracking-tight flex items-center gap-2">
                {(t('management.infra.monitorTitle') as string)}
                <InfoTooltip text={(t('settings.tooltips.ttIntegrationsPulse') as string)} />
              </h3>
              <p className="text-xs text-foreground-tertiary opacity-70">{(t('management.infra.monitorDesc') as string)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tools.map((data) => {
              const tone = statusTone(data.status);
              const syncing = !!demoSyncStates[data.id as keyof typeof demoSyncStates] && tone === 'ok';
              return (
                <motion.div
                  key={data.id}
                  animate={syncing ? { scale: [1, 1.02, 1], borderColor: ['rgba(8,145,178,0.1)', 'rgba(8,145,178,0.4)', 'rgba(8,145,178,0.1)'] } : {}}
                  className="p-5 rounded-[2rem] bg-bg-panel/40 border border-border-primary/10 flex flex-col gap-4 group hover:border-accent-cyan/20 transition-all font-bold"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-bg-panel border border-border-primary/20 text-foreground-secondary"><Server size={14} /></div>
                      <span className="text-[10px] font-black text-foreground-primary uppercase tracking-widest">{data.label}</span>
                    </div>
                    <div className={`flex items-center gap-1 xl:gap-2 px-3 py-1 rounded-lg border text-[8px] font-black tracking-widest uppercase ${tone === 'ok' ? 'bg-status-success-bg/10 border-status-success-border/20 text-status-success-text' : tone === 'error' ? 'bg-accent-amber/10 border-accent-amber/20 text-accent-amber animate-pulse' : 'bg-status-danger-bg/10 border-status-danger-border/20 text-status-danger-text animate-pulse'}`}>
                      {tone === 'ok' ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                      {data.status === 'connected' || data.status === 'online' ? t('settings.dashboard.statusOptimal') : 
                       data.status === 'offline' || data.status === 'disconnected' ? t('settings.dashboard.statusOffline') :
                       data.status.toUpperCase()}
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[8px] font-black text-foreground-tertiary uppercase block mb-1">{(t('management.infra.latency') as string)}</span>
                      <span className="text-sm font-black text-foreground-primary">{data.latency || '---'}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-foreground-tertiary uppercase block mb-1 text-right">{(t('management.infra.uptime') as string)}</span>
                      <span className={`text-sm font-black text-right block tracking-tighter ${tone === 'ok' ? 'text-status-success-text' : tone === 'error' ? 'text-accent-amber' : 'text-status-danger-text'}`}>{data.uptime || '--'}</span>
                    </div>
                  </div>

                  <div className="flex gap-1 items-end h-6 mt-2 opacity-40">
                    {[1,2,1,3,2,1,2,1,1,2,1,0,1,2,3,2,1,2,1,1,2].map((v, i) => (
                      <div key={i} className={`flex-1 rounded-t-sm ${tone === 'ok' ? 'bg-status-success-text' : tone === 'error' ? 'bg-accent-amber' : 'bg-status-danger-text'} transition-all`} style={{ height: `${v === 0 ? 4 : (v*30)+10}%` }} />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="premium-capsule p-8 sm:p-10 flex flex-col">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border-primary/20">
            <div className="p-3 rounded-2xl bg-accent-purple/10 text-accent-purple"><History size={24} /></div>
            <div>
              <h3 className="text-xl font-bold text-foreground-primary tracking-tight flex items-center gap-2">
                {(t('management.infra.historyTitle') as string)}
                <InfoTooltip text={(t('settings.tooltips.ttIncRelLog') as string)} vAlign="top" />
              </h3>
              <p className="text-xs text-foreground-tertiary opacity-70">{(t('management.infra.historyDesc') as string)}</p>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[600px] pr-4 custom-scrollbar">
            {reliabilityEvents.length === 0 ? (
              <div className="py-20 text-center opacity-30">
                <Shield size={48} className="mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">{(t('management.infra.noIncidents') as string)}</p>
              </div>
            ) : (
              reliabilityEvents.map((event, idx) => {
                const tone = statusTone(event.newStatus);
                return (
                  <div key={idx} className="p-5 rounded-3xl bg-bg-panel/40 border border-border-primary/10 flex items-center gap-6 relative overflow-hidden group hover:bg-bg-panel/60 transition-all">
                    <div className={`w-1 h-full absolute left-0 top-0 ${tone === 'ok' ? 'bg-status-success-text' : tone === 'error' ? 'bg-accent-amber' : 'bg-status-danger-text'}`} />

                    <div className="flex items-center gap-3 min-w-[150px]">
                      <span className="text-[10px] font-bold text-foreground-primary">{pulse(event.timestamp, { includeTime: true, style: 'dmy' }).split(' ')[1]}</span>
                      <span className="text-[9px] font-bold text-foreground-tertiary opacity-60 uppercase">{formatDDMMYYYY(event.timestamp)}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-accent-cyan uppercase tracking-widest">{toTitle(event.serviceId)}</span>
                        <span className="text-[8px] font-bold text-foreground-tertiary opacity-40">{(t('management.infra.eventStability') as string)}</span>
                      </div>
                      <p className="text-[11px] font-bold text-foreground-secondary uppercase truncate">
                        {t('management.infra.statusChanged')
                          .replace('{prev}', event.prevStatus === 'connected' || event.prevStatus === 'online' ? t('settings.dashboard.statusOptimal') : 
                                   event.prevStatus === 'offline' || event.prevStatus === 'disconnected' ? t('settings.dashboard.statusOffline') : event.prevStatus)
                          .replace('{next}', event.newStatus === 'connected' || event.newStatus === 'online' ? t('settings.dashboard.statusOptimal') : 
                                   event.newStatus === 'offline' || event.newStatus === 'disconnected' ? t('settings.dashboard.statusOffline') : event.newStatus)
                          .split(new RegExp(`(${event.prevStatus}|${event.newStatus})`, 'g'))
                          .map((part, i) => {
                            const localizedPart = 
                              part === 'connected' || part === 'online' ? t('settings.dashboard.statusOptimal') :
                              part === 'offline' || part === 'disconnected' ? t('settings.dashboard.statusOffline') : part;
                            
                            if (part === event.prevStatus) return <span key={i} className="text-foreground-tertiary">{localizedPart}</span>;
                            if (part === event.newStatus) return <span key={i} className={tone === 'ok' ? 'text-status-success-text' : tone === 'error' ? 'text-accent-amber' : 'text-status-danger-text'}>{localizedPart}</span>;
                            return part;
                          })
                        }
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[8px] font-black text-foreground-tertiary uppercase block mb-1">{(t('management.infra.latency') as string)}</span>
                      <span className="text-[11px] font-black text-foreground-primary">{event.latency || '---'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
