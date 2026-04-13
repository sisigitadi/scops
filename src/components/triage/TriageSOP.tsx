import React from 'react';
import { Lightbulb, CheckSquare, BookOpen, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useOperations } from '../../context/OperationsContext';
import { Alert } from '../../context/AlertDataContext';
import { User } from '../../context/AuthContext';

interface TriageSOPProps {
  playbookSteps: string[];
  baseAlert: Alert;
  isReadOnly: boolean;
  handleRestricted: () => void;
  togglePlaybookStep: (id: string, step: string, userName: string) => void;
  user: User;
}

/**
 * TriageSOP — Tactical Response Checklist & Governance Liaison
 * Visualizes the SOP steps for the current alert type and tracks analyst completion progress.
 * Now bridges the gap between tactical checklists and long-form institutional protocols from the Governance Library.
 */
export default function TriageSOP({ 
  playbookSteps, 
  baseAlert, 
  isReadOnly, 
  handleRestricted, 
  togglePlaybookStep, 
  user 
}: TriageSOPProps) {
  const { t } = useLanguage();
  const { governanceDocs } = useOperations();

  // Cross-reference alert category with Governance Library protocols
  const relevantDocs = governanceDocs.filter(doc => 
    doc.title.toLowerCase().includes(baseAlert.category.toLowerCase()) ||
    doc.content.toLowerCase().includes(baseAlert.category.toLowerCase())
  );

  return (
    <section className="space-y-8">
      <div className="premium-capsule p-8 shadow-inner-lg">
        <div className="flex items-center gap-4 mb-8 relative z-10 border-b-2 border-border-primary/20 pb-6">
          <Lightbulb className="text-status-warning-text" size={24} strokeWidth={2.5} />
          <h2 className="text-xl font-black text-foreground-primary uppercase tracking-[0.2em]">{t('triage.playbook.title') || 'SOP PLAYBOOK'}</h2>
        </div>
        <div className="space-y-4 relative z-10">
          {playbookSteps.map((step, i) => {
            const isDone = baseAlert.checklist?.[step];
            return (
              <div 
                key={i} 
                onClick={() => isReadOnly ? handleRestricted() : togglePlaybookStep(baseAlert.id, step, user.name)}
                className={`
                  premium-card !p-5 flex items-start gap-4 transition-all
                  ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:!scale-105 active:scale-95'}
                  ${isDone ? '!bg-status-success-bg/20 !border-status-success-border/30 !text-status-success-text' : '!bg-bg-panel/10 !border-border-primary/10 !text-foreground-tertiary'}
                `}
              >
                <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isDone ? 'bg-status-success-text border-status-success-text text-white shadow-lg' : 'bg-bg-panel/40 border-border-primary/20 text-transparent'}`}>
                  <CheckSquare size={16} strokeWidth={3} />
                </div>
                <span className={`text-[11px] font-black uppercase tracking-widest leading-relaxed ${isDone ? 'line-through opacity-40' : ''}`}>{step}</span>
              </div>
            );
          })}
        </div>
      </div>

      {relevantDocs.length > 0 && (
        <div className="premium-card !p-8 animate-in slide-in-from-bottom-4 duration-500 !border-accent-indigo/20 bg-accent-indigo/5">
           <div className="flex items-center gap-3 mb-6">
              <BookOpen className="text-accent-indigo" size={20} />
              <h3 className="text-sm font-black text-foreground-primary uppercase tracking-widest">{t('management.tabs.governance') || 'GOVERNANCE REFERENCE'}</h3>
           </div>
           
           <div className="space-y-3">
              {relevantDocs.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-4 rounded-2xl bg-bg-panel/40 border border-border-primary/10 hover:border-accent-indigo/40 transition-all group">
                   <div className="min-w-0">
                      <p className="text-[10px] font-black text-foreground-primary uppercase truncate tracking-tight">{doc.title}</p>
                      <p className="text-[8px] font-bold text-foreground-tertiary uppercase tracking-widest opacity-60">{doc.id}</p>
                   </div>
                   <button className="p-2.5 rounded-xl bg-accent-indigo/10 text-accent-indigo opacity-40 group-hover:opacity-100 transition-opacity">
                      <ExternalLink size={14} />
                   </button>
                </div>
              ))}
           </div>
        </div>
      )}
    </section>
  );
}
