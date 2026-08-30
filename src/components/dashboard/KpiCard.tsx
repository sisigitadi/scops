import React from 'react';
import InfoTooltip from '../common/InfoTooltip';
import { useLanguage } from '../../context/LanguageContext';

/**
 * KpiCard — Tactical Metric Visualizer
 * High-density performance indicator for real-time operational situation awareness.
 */

interface KpiCardProps {
  label: string;
  value: string | number;
  tooltip?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  empty?: boolean;
}

export default function KpiCard({ label, value, tooltip, icon, trend, trendValue, empty = false }: KpiCardProps) {
  const { t } = useLanguage();
  const isEmpty = empty || value === 0 || value === '0';
  
  return (
    <article className="premium-card h-full group">
      {/* Visual Accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-accent-cyan/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-accent-cyan/10 transition-colors" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {icon ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
                {icon}
              </div>
            ) : (
              <div className="h-1.5 w-6 rounded-full bg-accent-cyan/30" />
            )}
            <p className="text-[10px] font-black text-foreground-tertiary uppercase tracking-[0.2em]">{label}</p>
          </div>
          {tooltip && <InfoTooltip text={tooltip} />}
        </div>
        
        <div className="mt-6 flex-1 flex flex-col items-center justify-center text-center">
          {isEmpty ? (
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-foreground-muted opacity-20 tracking-tighter">{(t('common.emptyLabel') as string) || 'EMPTY'}</span>
              <span className="text-[9px] font-black uppercase text-foreground-muted tracking-widest mt-1">{(t('common.noData') as string) || 'AWAITING DATA'}</span>
            </div>
          ) : (
            <div className="space-y-4 w-full">
              <div className="text-4xl font-black text-foreground-primary tracking-tighter tabular-nums leading-none">
                {value}
              </div>
              
              {trend && (
                <div className="flex justify-center">
                  <div className={`
                    flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-black border
                    ${trend === 'up' ? 'bg-status-success-bg/20 text-status-success-text border-status-success-border/30' : ''}
                    ${trend === 'down' ? 'bg-status-danger-bg/20 text-status-danger-text border-status-danger-border/30' : ''}
                    ${trend === 'neutral' ? 'bg-bg-panel text-foreground-tertiary border-border-primary' : ''}
                  `}>
                    <span>{trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}</span>
                    {trendValue && <span className="tracking-tighter">{trendValue}</span>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
