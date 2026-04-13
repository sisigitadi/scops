import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import InfoTooltip from '../common/InfoTooltip';

/**
 * ReportTableSection — Granular Metric Matrix
 * High-fidelity visual grid for aggregating forensic and operational telemetry, 
 * providing clinical precision for technical data review.
 */

interface ReportRow {
  metric: string;
  value: string | number;
}

interface ReportTableSectionProps {
  title: string;
  rows: ReportRow[];
  tooltip?: string;
}

export default function ReportTableSection({ title, rows, tooltip }: ReportTableSectionProps) {
  const { t } = useLanguage();

  return (
    <div className="premium-card !p-0 overflow-hidden bg-bg-panel/20 border-border-primary/20 shadow-inner-lg font-bold">
      <div className="px-8 py-5 border-b-2 border-border-primary/10 bg-bg-panel/40 flex items-center gap-3">
        <h3 className="text-xs font-black text-foreground-primary uppercase tracking-[0.2em]">{title}</h3>
        {tooltip && <InfoTooltip text={tooltip} />}
      </div>
      <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
        <table className="min-w-full border-collapse text-left font-bold">
          <thead>
            <tr className="bg-bg-panel/10">
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-foreground-tertiary border-r border-border-primary/20">{(t('common.metric') as string)}</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-foreground-tertiary text-center">{(t('common.value') as string)}</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-border-primary/5">
            {rows.map((row) => (
              <tr key={`${row.metric}-${row.value}`} className="hover:bg-accent-cyan/5 transition-all group border-b border-border-primary/5">
                <td className="px-8 py-5 text-[11px] font-black text-foreground-secondary uppercase tracking-widest group-hover:text-foreground-primary border-r border-border-primary/20">
                  {row.metric}
                </td>
                <td className="px-8 py-5 text-[11px] font-black text-accent-cyan tabular-nums text-center group-hover:scale-110 transition-transform whitespace-pre-line">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
