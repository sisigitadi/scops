import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import AlertBadge from '../alerts/AlertBadge';
import InfoTooltip from '../common/InfoTooltip';
import SensitiveText from '../common/SensitiveText';
import { formatDDMMYYYY } from '../../utils/datePulse';

/**
 * RecentAlertsTable — Operational Live-Stream
 * Unified forensic grid for real-time visualization of the most recent security events.
 */

interface RecentAlertsTableProps {
  alerts: any[];
}

export default function RecentAlertsTable({ alerts }: RecentAlertsTableProps) {
  const { t } = useLanguage();

  const dashboardGridTemplate = 'minmax(130px, 0.6fr) minmax(130px, 0.6fr) minmax(350px, 3.5fr) minmax(140px, 0.7fr) minmax(150px, 0.7fr) minmax(210px, 1fr)';

  return (
    <section className="premium-capsule p-5 sm:p-8 shadow-inner-lg">
      <div className="flex items-center justify-between border-b-2 border-border-primary/20 pb-6 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-black text-foreground-primary capitalize tracking-tight">{(t('dashboard.recentAlerts') as string)}</h2>
          <InfoTooltip text={(t('tooltips.recentAlerts') as string)} />
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-bg-panel/40 px-5 py-2.5 border-2 border-border-primary/20 shadow-sm">
           <div className="h-2 w-2 rounded-full bg-accent-cyan animate-pulse shadow-[0_0_8px_rgba(8,145,178,0.8)]" />
           <span className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground-tertiary">
             {(t('dashboard.latestEvents') as string) || 'LIVE STREAMING'}
           </span>
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar relative z-10 rounded-2xl border border-border-primary/20 bg-bg-panel/40 backdrop-blur-md">
        <div className="min-w-[1100px] relative">
          {/* Header Grid */}
          <div 
            className="grid sticky top-0 z-30 bg-bg-panel border-y-2 border-border-primary text-[11px] font-black uppercase tracking-widest text-foreground-tertiary"
            style={{ gridTemplateColumns: dashboardGridTemplate }}
          >
            <div className="px-6 py-5 border-r border-border-primary/20">{(t('alerts.headers.date') as string)}</div>
            <div className="px-6 py-5 border-r border-border-primary/20 text-accent-cyan tracking-widest">{(t('alerts.headers.alertId') as string)}</div>
            <div className="px-6 py-5 border-r border-border-primary/20">{(t('alerts.headers.ruleDescription') as string)}</div>
            <div className="px-6 py-5 border-r border-border-primary/20">{(t('alerts.headers.hostname') as string)}</div>
            <div className="px-6 py-5 border-r border-border-primary/20 text-center">{(t('alerts.headers.severity') as string)}</div>
            <div className="px-6 py-5 text-center">{(t('alerts.headers.status') as string)}</div>
          </div>

          {/* Body Container */}
          <div className="relative min-h-[300px]">
             {/* Continuous Column Borders Overlay */}
             <div className="absolute inset-0 pointer-events-none z-0">
               <div className="grid h-full" style={{ gridTemplateColumns: dashboardGridTemplate }}>
                 <div className="border-r border-border-primary/20 h-full" />
                 <div className="border-r border-border-primary/20 h-full" />
                 <div className="border-r border-border-primary/20 h-full" />
                 <div className="border-r border-border-primary/20 h-full" />
                 <div className="border-r border-border-primary/20 h-full" />
                 <div className="h-full" />
               </div>
             </div>

             <div className="relative z-10 divide-y divide-border-primary/5">
              {alerts.slice(0, 10).map((alert: any) => (
                <div 
                  key={alert.id}
                  className="grid min-h-[5rem] py-4 items-center text-[11px] font-bold text-foreground-secondary bg-bg-card/90 backdrop-blur-[2px] transition-all hover:bg-bg-hover/40 group border-b border-border-secondary"
                  style={{ gridTemplateColumns: dashboardGridTemplate }}
                >
                  <div className="px-6 flex flex-col justify-center gap-0.5 tabular-nums">
                     <span className="text-foreground-primary">{formatDDMMYYYY(alert.date)}</span>
                     <span className="text-[10px] opacity-40">{alert.time}</span>
                  </div>

                  <div className="px-6 text-accent-cyan tabular-nums font-mono">
                     <SensitiveText value={alert.id} />
                  </div>

                  <div className="px-6 flex flex-col justify-center gap-1.5 whitespace-normal break-words font-bold h-full">
                     <p className="uppercase tracking-wider text-foreground-primary leading-tight font-black">{alert.ruleDescription}</p>
                     <span className="text-[10px] opacity-60 font-mono">RULE ID: <SensitiveText value={alert.ruleId} /></span>
                  </div>

                  <div className="px-6 flex items-center text-foreground-primary whitespace-normal break-all">
                     <SensitiveText value={alert.hostname} />
                  </div>

                  <div className="px-6 flex items-center justify-center">
                     <AlertBadge type="severity" value={alert.severity} />
                  </div>

                  <div className="px-6 flex items-center justify-center">
                     <AlertBadge type="status" value={alert.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
