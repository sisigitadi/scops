import React from 'react';
import { pulse } from '../../utils/datePulse';
import { History } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Alert } from '../../context/AlertDataContext';

interface TriageCaseTrailProps {
  baseAlert: Alert;
}

/**
 * TriageCaseTrail — Forensic Journal
 * Provides an immutable chronological log of analyst interventions, status changes, and investigative notes.
 */
export default function TriageCaseTrail({ baseAlert }: TriageCaseTrailProps) {
  const { t } = useLanguage();

  return (
    <section className="premium-capsule p-8 shadow-inner-lg">
      <div className="flex items-center gap-4 mb-8 relative z-10 border-b-2 border-border-primary/20 pb-6">
        <History className="text-foreground-primary" size={24} strokeWidth={2.5} />
        <h2 className="text-xl font-black text-foreground-primary uppercase tracking-[0.2em]">{t('triage.caseTrail.title') || 'CASE LOGS'}</h2>
      </div>
      <div className="space-y-8 max-h-[500px] overflow-y-auto pr-4 no-scrollbar relative z-10">
        {!baseAlert.history || baseAlert.history.length === 0 ? (
          <div className="text-center py-10 opacity-30">
             <p className="text-[10px] font-black uppercase tracking-[0.3em]">{t('triage.caseTrail.noActivity') || 'JOURNAL EMPTY'}</p>
          </div>
        ) : (
          baseAlert.history.map((entry, i) => (
            <div key={i} className="relative pl-10 pb-8 border-l-2 border-border-primary/20 last:pb-0">
              <div className="absolute left-[-6px] top-1 h-3 w-3 rounded-full bg-accent-cyan shadow-[0_0_8px_currentColor]" />
              <div className="text-[9px] font-black text-foreground-tertiary bg-bg-panel/40 px-4 py-1.5 rounded-xl border-2 border-border-primary/20 inline-block mb-4 uppercase tracking-[0.2em]">
                {pulse(entry.timestamp, { includeTime: true, style: 'dmy' })}
              </div>
              <div className="text-[11px] font-black text-foreground-primary flex items-center gap-3 mb-4 uppercase tracking-[0.2em]">
                 <div className="h-8 w-8 rounded-xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan border border-accent-cyan/20">{(entry.user || 'S').charAt(0)}</div> 
                 {entry.user || 'SYSTEM'}
              </div>
              <div className="space-y-4">
                {entry.changes.map((change, j) => (
                  <div key={j} className="text-[10px] font-black text-foreground-tertiary leading-relaxed bg-bg-panel/50 p-5 rounded-2xl border-2 border-border-primary/10 border-l-4 border-l-accent-cyan uppercase tracking-tighter shadow-inner">
                    {change}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
