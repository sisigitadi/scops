import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * AlertBadge — Tactical Status Indicator
 * High-density semantic badge for visualizing alert severity and lifecycle states, 
 * utilizing glow effects and pulse animations for mission-critical events.
 */

const statusStyles: Record<string, string> = {
  critical: 'bg-status-danger-bg/20 text-status-danger-text border-status-danger-border/40',
  kritis: 'bg-status-danger-bg/20 text-status-danger-text border-status-danger-border/40',
  high: 'bg-status-danger-bg/15 text-status-danger-text border-status-danger-border/30',
  tinggi: 'bg-status-danger-bg/15 text-status-danger-text border-status-danger-border/30',
  medium: 'bg-status-warning-bg/25 text-status-warning-text border-status-warning-border/40',
  sedang: 'bg-status-warning-bg/25 text-status-warning-text border-status-warning-border/40',
  low: 'bg-status-info-bg/25 text-status-info-text border-status-info-border/40',
  rendah: 'bg-status-info-bg/25 text-status-info-text border-status-info-border/40',
  open: 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/40',
  investigating: 'bg-status-warning-bg/15 text-status-warning-text border-status-warning-border/30',
  closed: 'bg-status-success-bg/25 text-status-success-text border-status-success-border/40',
};

const idLabelMap: Record<string, string> = {
  critical: 'KRITIS',
  high: 'TINGGI',
  medium: 'SEDANG',
  low: 'RENDAH',
  open: 'TERBUKA',
  investigating: 'INVESTIGASI',
  closed: 'DITUTUP'
};

interface AlertBadgeProps {
  type?: string; 
  value: string | number;
}

export default function AlertBadge({ value }: AlertBadgeProps) {
  const { language, t } = useLanguage();
  const lowerValue = String(value).toLowerCase();
  const styleClass = statusStyles[lowerValue] || 'bg-bg-panel text-foreground-muted border-border-primary';
  
  const text = t(`alerts.optionLabels.${lowerValue}`) || lowerValue.toUpperCase();
  
  const isHighUrgency = ['critical', 'high', 'kritis', 'tinggi', 'investigating', 'investigasi'].includes(lowerValue);
  
  return (
    <span 
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-bold tracking-tight shadow-sm transition-all min-w-[85px] max-w-full ${styleClass}`}
      style={{
        boxShadow: isHighUrgency ? '0 0 10px -2px currentColor' : 'none'
      }}
    >
      <span 
        className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${isHighUrgency ? 'animate-pulse' : ''} opacity-80`} 
        style={{ 
          backgroundColor: 'currentColor',
          boxShadow: isHighUrgency ? '0 0 4px currentColor' : 'none'
        }} 
      />
      <span className="truncate capitalize">{text.toLowerCase()}</span>
    </span>
  );
}
