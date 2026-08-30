import React from 'react';

/**
 * TuningStatusBadge — Operational Pulse Indicator
 * Theme-aware status orchestration for signal-to-noise optimization 
 * and detective control lifecycle management.
 */

interface TuningStatusBadgeProps {
  type: 'tuning' | 'status' | 'severity';
  value: string;
}

const tuningStyles: Record<string, string> = {
  pending: 'bg-accent-amber/10 text-accent-amber border-accent-amber/30',
  in_review: 'bg-accent-indigo/10 text-accent-indigo border-accent-indigo/30',
  applied: 'bg-status-success-bg/10 text-status-success-text border-status-success-border/30',
  monitoring: 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30',
  rejected: 'bg-status-danger-bg/10 text-status-danger-text border-status-danger-border/30'
};

const statusStyles: Record<string, string> = {
  open: 'bg-status-warning-bg/10 text-status-warning-text border-status-warning-border/30',
  reviewed: 'bg-accent-indigo/10 text-accent-indigo border-accent-indigo/30',
  tuned: 'bg-status-success-bg/10 text-status-success-text border-status-success-border/30',
  closed: 'bg-bg-panel/20 text-foreground-tertiary border-border-primary/20'
};

const severityStyles: Record<string, string> = {
  critical: 'bg-status-danger-bg text-status-danger-text border-status-danger-border shadow-lg shadow-status-danger-bg/20',
  high: 'bg-status-danger-bg/20 text-status-danger-text border-status-danger-border/30',
  medium: 'bg-status-warning-bg/20 text-status-warning-text border-status-warning-border/30',
  low: 'bg-status-success-bg/20 text-status-success-text border-status-success-border/30'
};

const labelMap: Record<string, string> = {
  pending: 'PENDING',
  in_review: 'REVIEW',
  applied: 'APPLIED',
  monitoring: 'MONITOR',
  rejected: 'REJECTED',
  open: 'OPEN',
  reviewed: 'REVIEWED',
  tuned: 'TUNED',
  closed: 'CLOSED',
  critical: 'CRITICAL',
  high: 'HIGH',
  medium: 'MEDIUM',
  low: 'LOW'
};

export default function TuningStatusBadge({ type, value }: TuningStatusBadgeProps) {
  let className = 'bg-bg-panel/20 text-foreground-tertiary border-border-primary/20';
  
  if (type === 'tuning') {
    className = tuningStyles[value] || className;
  } else if (type === 'status') {
    className = statusStyles[value] || className;
  } else if (type === 'severity') {
    className = severityStyles[value] || className;
  }

  const text = labelMap[value] || value.toUpperCase();

  return (
    <span className={`px-3 py-1 rounded-lg border text-[8px] font-black uppercase tracking-[0.2em] inline-block font-sans ${className}`}>
      {text}
    </span>
  );
}
