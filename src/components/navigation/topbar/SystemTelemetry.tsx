import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Target, Send, Database } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useSettings } from '../../../context/SettingsContext';
import { useAlertData } from '../../../context/AlertDataContext';

interface IndicatorTooltipProps {
  children: React.ReactNode;
  panel: React.ReactNode;
  visible: boolean;
  onEnter: () => void;
  onLeave: () => void;
  align?: 'left' | 'right';
}

export function IndicatorTooltip({ children, panel, visible, onEnter, onLeave, align = 'right' }: IndicatorTooltipProps) {
  return (
    <div className="relative" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full z-[100000] mt-6 min-w-[360px] max-w-[90vw] origin-top-${align}`}
          >
            <div className="rounded-[2rem] border-2 border-border-primary bg-bg-panel p-5 shadow-[0_30px_60px_rgba(0,0,0,0.6)] relative overflow-visible text-center">
              <div className="relative z-10 text-[11px] font-black uppercase tracking-[0.2em] text-foreground-primary">{panel}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const incidentLabel = (secAgo?: number | null) => secAgo == null ? 'NO INCIDENT YET' : `${secAgo}s AGO`;

export default function SystemTelemetry() {
  const { isSyncing } = useAlertData();
  const { t } = useLanguage();
  const { settings, demoSyncStates, liveMetrics } = useSettings();
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const wazuhManagerConnected = settings.wazuh.manager.status === 'connected';
  const wazuhIndexerConnected = settings.wazuh.indexer.status === 'connected';
  const openctiConnected = settings.opencti.status === 'connected';
  const telegramConnected = settings.channels.telegram.status === 'connected';
  const databaseConnected = settings.database.status === 'connected';

  const wmError = settings.wazuh.manager.status === 'error';
  const wiError = settings.wazuh.indexer.status === 'error';
  const openctiError = settings.opencti.status === 'error';
  const telegramError = settings.channels.telegram.status === 'error';
  const databaseError = settings.database.status === 'error';

  const wazuhAnimated = (wazuhManagerConnected || wazuhIndexerConnected) && (isSyncing || demoSyncStates?.wazuh_manager || demoSyncStates?.wazuh_indexer);
  const openctiAnimated = openctiConnected && (isSyncing || demoSyncStates?.opencti);
  const telegramAnimated = telegramConnected && (isSyncing || demoSyncStates?.telegram);
  const databaseAnimated = databaseConnected && (isSyncing || demoSyncStates?.database);
  const wazuhManagerEndpoint = `${settings.wazuh.manager.host || 'demo-wazuh-manager.local'}:${settings.wazuh.manager.port || '55000'}`;
  const wazuhIndexerEndpoint = `${settings.wazuh.indexer.host || 'demo-wazuh-indexer.local'}:${settings.wazuh.indexer.port || '9200'}`;

  const getStatusColor = (status: string) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'connected': case 'online': return 'text-status-success-text';
      case 'error': case 'partialconnected': case 'syncing': case 'connecting': case 'partial': return 'text-accent-amber';
      default: return 'text-status-danger-text';
    }
  };

  const getDotColor = (status: string) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'connected': case 'online': return 'bg-status-success-text';
      case 'error': case 'partialconnected': case 'syncing': case 'connecting': case 'partial': return 'bg-accent-amber';
      default: return 'bg-status-danger-text';
    }
  };

  const wmColor = getStatusColor(settings.wazuh.manager.status);
  const wiColor = getStatusColor(settings.wazuh.indexer.status);
  const oColor = getStatusColor(settings.opencti.status);
  const tColor = getStatusColor(settings.channels.telegram.status);
  const dbColor = getStatusColor(settings.database.status);

  const wmDot = getDotColor(settings.wazuh.manager.status);
  const wiDot = getDotColor(settings.wazuh.indexer.status);
  const oDot = getDotColor(settings.opencti.status);
  const tDot = getDotColor(settings.channels.telegram.status);
  const dbDot = getDotColor(settings.database.status);

  return (
    <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-6 border-r border-border-primary/40 w-auto sm:w-[150px] shrink-0 justify-center">
      <IndicatorTooltip
        panel={
          <div className="flex flex-col gap-2 text-[11px] text-left">
            <div className="p-3 rounded-lg bg-bg-panel/40 border border-border-primary/20">
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${wmDot} ${wazuhManagerConnected ? 'indicator-glow-max' : 'indicator-alert-max'}`} />
                  <span className="opacity-60 text-[7px] font-black tracking-wider uppercase">{t('topbar.wazuhManager')}</span>
                </div>
                <span className={`${wmColor} font-bold`}>{settings.wazuh.manager.status.toUpperCase()}</span>
              </div>
              <div className="flex flex-col font-mono pl-4 mt-1 border-b border-border-primary/10 pb-2 mb-2 gap-0.5">
                <div className="flex justify-between w-full items-center">
                  <span className="opacity-40 text-[9px] uppercase tracking-wider">{t('topbar.endpoint')}</span>
                  <span className={`${wmColor} font-black text-[10px] shrink-0`}>{liveMetrics?.wazuh_manager?.latency}</span>
                </div>
                <div className="text-foreground-primary truncate text-[10px] opacity-80 mt-0.5 break-all">
                  {wazuhManagerEndpoint}
                </div>
              </div>
              <div className="flex items-center pl-4 opacity-80 gap-3">
                <span className="text-[7px] font-black uppercase tracking-wider w-20 shrink-0">{t('topbar.throughput')}</span>
                <span className={`text-[10px] font-black ${wmColor} truncate`}>
                  {liveMetrics?.wazuh_manager?.eps} | UPTIME {liveMetrics?.wazuh_manager?.uptime}
                </span>
              </div>
              <div className="text-[8px] font-black uppercase tracking-wider text-foreground-tertiary opacity-70 mt-2 pl-4">
                LAST INCIDENT: {incidentLabel(liveMetrics?.wazuh_manager?.lastIncidentSecAgo)}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-bg-panel/40 border border-border-primary/20">
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${wiDot} ${wazuhIndexerConnected ? 'indicator-glow-max' : 'indicator-alert-max'}`} />
                  <span className="opacity-60 text-[7px] font-black tracking-wider uppercase">{t('topbar.wazuhIndexer')}</span>
                </div>
                <span className={`${wiColor} font-bold`}>{settings.wazuh.indexer.status.toUpperCase()}</span>
              </div>
              <div className="flex flex-col font-mono pl-4 mt-1 border-b border-border-primary/10 pb-2 mb-2 gap-0.5">
                <div className="flex justify-between w-full items-center">
                  <span className="opacity-40 text-[9px] uppercase tracking-wider">{t('topbar.endpoint')}</span>
                  <span className={`${wiColor} font-black text-[10px] shrink-0`}>{liveMetrics?.wazuh_indexer?.latency}</span>
                </div>
                <div className="text-foreground-primary truncate text-[10px] opacity-80 mt-0.5 break-all">
                  {wazuhIndexerEndpoint}
                </div>
              </div>
              <div className="flex items-center pl-4 opacity-80 gap-3">
                <span className="text-[7px] font-black uppercase tracking-wider w-20 shrink-0">{t('topbar.throughput')}</span>
                <span className={`text-[10px] font-black ${wiColor} truncate`}>
                  {liveMetrics?.wazuh_indexer?.throughput} | UPTIME {liveMetrics?.wazuh_indexer?.uptime}
                </span>
              </div>
              <div className="text-[8px] font-black uppercase tracking-wider text-foreground-tertiary opacity-70 mt-2 pl-4">
                LAST INCIDENT: {incidentLabel(liveMetrics?.wazuh_indexer?.lastIncidentSecAgo)}
              </div>
            </div>
          </div>
        }
        visible={activeTooltip === 'w'}
        onEnter={() => setActiveTooltip('w')}
        onLeave={() => setActiveTooltip(null)}
      >
        <motion.div animate={wazuhAnimated ? { opacity: [1, 0.6, 1], scale: [1, 1.05, 1] } : {}} transition={{ duration: 2, repeat: wazuhAnimated ? Infinity : 0 }}>
          <Shield 
            size={16} 
            strokeWidth={2.5} 
            className={`${
              (wazuhManagerConnected && wazuhIndexerConnected) 
                ? 'text-status-success-text indicator-glow-max' 
                : (wazuhManagerConnected || wazuhIndexerConnected) 
                  ? 'text-accent-amber indicator-alert-max' 
                  : 'text-status-danger-text indicator-alert-max'
            } cursor-pointer`} 
          />
        </motion.div>
      </IndicatorTooltip>

      <IndicatorTooltip
        panel={
          <div className="flex flex-col gap-2 text-[11px] text-left">
            <div className="p-3 rounded-lg bg-bg-panel/40 border border-border-primary/20">
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${oDot} ${openctiConnected ? 'indicator-indigo-max' : 'indicator-alert-max'}`} />
                  <span className="opacity-60 text-[7px] font-black tracking-wider uppercase">{(t('topbar.openctiHub') as string)}</span>
                </div>
                <span className={`${oColor} font-bold`}>{settings.opencti.status.toUpperCase()}</span>
              </div>
              <div className="flex flex-col font-mono pl-4 mt-1 border-b border-border-primary/10 pb-2 mb-2 gap-0.5">
                <div className="flex justify-between w-full items-center">
                  <span className="opacity-40 text-[9px] uppercase tracking-wider">{t('topbar.intelCoreUrl')}</span>
                  <span className={`${oColor} font-black text-[10px] shrink-0`}>{liveMetrics?.opencti?.latency || '---'}</span>
                </div>
                <div className="text-foreground-primary truncate text-[10px] opacity-80 mt-0.5 break-all">
                  {settings.opencti.url || '---'}
                </div>
              </div>
              <div className="flex items-center pl-4 opacity-80 gap-3">
                <span className="text-[7px] font-black uppercase tracking-wider w-20 shrink-0">{t('topbar.throughput')}</span>
                <span className={`text-[10px] font-black ${oColor} truncate`}>
                  {liveMetrics?.opencti?.iocs || '0'} IOCs | UPTIME {liveMetrics?.opencti?.uptime || '---'}
                </span>
              </div>
              <div className="text-[8px] font-black uppercase tracking-wider text-foreground-tertiary opacity-70 mt-2 pl-4">
                LAST INCIDENT: {incidentLabel(liveMetrics?.opencti?.lastIncidentSecAgo)}
              </div>
            </div>
          </div>
        }
        visible={activeTooltip === 'o'}
        onEnter={() => setActiveTooltip('o')}
        onLeave={() => setActiveTooltip(null)}
      >
        <motion.div animate={openctiAnimated ? { opacity: [1, 0.5, 1] } : {}} transition={{ duration: 2, repeat: openctiAnimated ? Infinity : 0 }}>
          <Target size={16} strokeWidth={2.5} className={`${openctiConnected ? 'text-status-success-text indicator-indigo-max' : openctiError ? 'text-accent-amber indicator-alert-max' : 'text-status-danger-text indicator-alert-max'} cursor-pointer`} />
        </motion.div>
      </IndicatorTooltip>

      <IndicatorTooltip
        panel={
          <div className="flex flex-col gap-2 text-[11px] text-left">
            <div className="p-3 rounded-lg bg-bg-panel/40 border border-border-primary/20">
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${tDot} ${telegramConnected ? 'indicator-glow-max' : 'indicator-alert-max'}`} />
                  <span className="opacity-60 text-[7px] font-black tracking-wider uppercase">TELEGRAM BOT</span>
                </div>
                <span className={`${tColor} font-bold`}>{settings.channels.telegram.status.toUpperCase()}</span>
              </div>
              <div className="flex flex-col font-mono pl-4 mt-1 border-b border-border-primary/10 pb-2 mb-2 gap-0.5">
                <div className="flex justify-between w-full items-center">
                  <span className="opacity-40 text-[9px] uppercase tracking-wider">{t('topbar.targetChannel')}</span>
                  <span className={`${tColor} font-black text-[10px] shrink-0`}>{liveMetrics?.telegram?.latency}</span>
                </div>
                <div className="text-foreground-primary truncate text-[10px] opacity-80 mt-0.5 break-all">
                  {settings.channels.telegram.chatId || '---'}
                </div>
              </div>
              <div className="flex items-center pl-4 opacity-80 gap-3">
                <span className="text-[7px] font-black uppercase tracking-wider w-20 shrink-0">MONITOR PULSE</span>
                <span className={`text-[10px] font-black ${tColor} truncate`}>
                  {telegramConnected ? `ACTIVE | UPTIME ${liveMetrics?.telegram?.uptime}` : telegramError ? 'ERROR' : 'DISCONNECTED'}
                </span>
              </div>
              <div className="text-[8px] font-black uppercase tracking-wider text-foreground-tertiary opacity-70 mt-2 pl-4">
                LAST INCIDENT: {incidentLabel(liveMetrics?.telegram?.lastIncidentSecAgo)}
              </div>
            </div>
          </div>
        }
        visible={activeTooltip === 't'}
        onEnter={() => setActiveTooltip('t')}
        onLeave={() => setActiveTooltip(null)}
      >
        <motion.div animate={telegramAnimated ? { scale: [1, 1.1, 1], opacity: [1, 0.7, 1] } : {}} transition={{ duration: 2, repeat: telegramAnimated ? Infinity : 0 }}>
          <Send size={16} strokeWidth={2.5} className={`${telegramConnected ? 'text-status-success-text indicator-glow-max' : telegramError ? 'text-accent-amber indicator-alert-max' : 'text-status-danger-text indicator-alert-max'} cursor-pointer`} />
        </motion.div>
      </IndicatorTooltip>

      <IndicatorTooltip
        panel={
          <div className="flex flex-col gap-2 text-[11px] text-left">
            <div className="p-3 rounded-lg bg-bg-panel/40 border border-border-primary/20">
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${dbDot} ${databaseConnected ? 'indicator-glow-max' : 'indicator-alert-max'}`} />
                  <span className="opacity-60 text-[7px] font-black tracking-wider uppercase">EXTERNAL DATABASE</span>
                </div>
                <span className={`${dbColor} font-bold`}>{settings.database.status.toUpperCase()}</span>
              </div>
              <div className="flex flex-col font-mono pl-4 mt-1 border-b border-border-primary/10 pb-2 mb-2 gap-0.5">
                <div className="flex justify-between w-full items-center">
                  <span className="opacity-40 text-[9px] uppercase tracking-wider">{t('topbar.endpoint')}</span>
                  <span className={`${dbColor} font-black text-[10px] shrink-0`}>{liveMetrics?.database?.latency}</span>
                </div>
                <div className="text-foreground-primary truncate text-[10px] opacity-80 mt-0.5 break-all">
                  {settings.database.host || '---'}
                </div>
              </div>
              <div className="flex items-center pl-4 opacity-80 gap-3">
                <span className="text-[7px] font-black uppercase tracking-wider w-20 shrink-0">DB TYPE / NAME</span>
                <span className={`text-[10px] font-black ${dbColor} truncate uppercase`}>
                  {settings.database.type} | {settings.database.name}
                </span>
              </div>
              <div className="text-[8px] font-black uppercase tracking-wider text-foreground-tertiary opacity-70 mt-2 pl-4">
                UPTIME: {liveMetrics?.database?.uptime} | LAST INCIDENT: {incidentLabel(liveMetrics?.database?.lastIncidentSecAgo)}
              </div>
            </div>
          </div>
        }
        visible={activeTooltip === 'db'}
        onEnter={() => setActiveTooltip('db')}
        onLeave={() => setActiveTooltip(null)}
      >
        <motion.div animate={databaseAnimated ? { scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] } : {}} transition={{ duration: 3, repeat: databaseAnimated ? Infinity : 0 }}>
          <Database size={16} strokeWidth={2.5} className={`${databaseConnected ? 'text-status-success-text indicator-glow-max' : databaseError ? 'text-accent-amber indicator-alert-max' : 'text-status-danger-text indicator-alert-max'} cursor-pointer`} />
        </motion.div>
      </IndicatorTooltip>
    </div>
  );
}
