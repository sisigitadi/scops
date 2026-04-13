import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import InfoTooltip from '../common/InfoTooltip';

/**
 * ExecutiveSummaryBlock — High-level operational forensic report summary.
 * Hardened to prevent runtime failures during data harvesting.
 */

interface ExecutiveSummaryBlockProps {
  summary: string;
  topFindings: string[];
  recommendations: string[];
}

export default function ExecutiveSummaryBlock({ summary, topFindings, recommendations }: ExecutiveSummaryBlockProps) {
  const { t } = useLanguage();

  // Safe Mapping Protocol
  const safeFindings = Array.isArray(topFindings) ? topFindings : [];
  const safeRecommendations = Array.isArray(recommendations) ? recommendations : [];

  return (
    <section className="premium-capsule p-8 shadow-inner-lg min-h-full">
      <div className="flex items-center gap-3 relative z-10 border-b-2 border-border-primary/20 pb-6 mb-8">
        <h2 className="text-xl font-black text-foreground-primary uppercase tracking-[0.2em]">{(t('reports.executive') as string)}</h2>
        <InfoTooltip text={(t('settings.tooltips.ttExecReport') as string)} />
      </div>
      <p className="mt-4 text-sm text-foreground-secondary font-black leading-relaxed uppercase tracking-tighter opacity-80 relative z-10">{summary}</p>

      <div className="mt-10 grid gap-8 xl:grid-cols-2 relative z-10">
        <article className="premium-card p-6 bg-bg-panel/10 border-border-primary/10">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-accent-cyan border-b-2 border-accent-cyan/20 pb-3 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-cyan shadow-[0_0_8px_currentColor]" />
            {(t('reports.findings') as string)}
          </h3>
          <ul className="space-y-4">
            {safeFindings.length === 0 ? (
               <li className="p-4 text-[9px] opacity-40 uppercase font-black text-center">{t('common.noData')}</li>
            ) : (
              safeFindings.map((item, index) => (
                <li key={`finding-${index}`} className="p-4 rounded-xl border-2 border-border-primary/10 bg-bg-panel/30 text-[10px] font-black uppercase tracking-widest text-foreground-primary shadow-inner">
                  {item}
                </li>
              ))
            )}
          </ul>
        </article>

        <article className="premium-card p-6 bg-bg-panel/10 border-border-primary/10">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-accent-indigo border-b-2 border-accent-indigo/20 pb-3 mb-6 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-accent-indigo shadow-[0_0_8px_currentColor]" />
             {(t('reports.recommendations') as string)}
          </h3>
          <ul className="space-y-4">
            {safeRecommendations.length === 0 ? (
               <li className="p-4 text-[9px] opacity-40 uppercase font-black text-center">{t('common.noData')}</li>
            ) : (
              safeRecommendations.map((item, index) => (
                <li key={`rec-${index}`} className="p-4 rounded-xl border-2 border-border-primary/10 bg-bg-panel/30 text-[10px] font-black uppercase tracking-widest text-foreground-primary shadow-inner">
                  {item}
                </li>
              ))
            )}
          </ul>
        </article>
      </div>
    </section>
  );
}
