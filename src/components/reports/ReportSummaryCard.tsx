import React from 'react';
import InfoTooltip from '../common/InfoTooltip';

/**
 * ReportSummaryCard — Executive Metric Capsule
 * High-fidelity visual container for executive summary telemetry, 
 * providing clinical focus on critical operational KPIs.
 */

interface ReportSummaryCardProps {
  label: string;
  value: string | number;
  tooltip: string;
}

export default function ReportSummaryCard({ label, value, tooltip }: ReportSummaryCardProps) {
  return (
    <article className="premium-card p-8 bg-bg-panel/10 border-border-primary/10 group cursor-default transition-all hover:bg-bg-panel/20 flex flex-col items-center justify-center text-center font-bold">
      <div className="flex items-center gap-2 mb-6">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-foreground-tertiary group-hover:text-accent-cyan transition-colors leading-none">{label}</p>
        <InfoTooltip text={tooltip} />
      </div>
      <div className="text-3xl font-black text-foreground-primary uppercase tracking-[0.2em] tabular-nums whitespace-pre-line">{value}</div>
    </article>
  );
}
