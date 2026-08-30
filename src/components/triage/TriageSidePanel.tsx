import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * TriageSidePanel — Operational Pulse Orchestration
 * High-fidelity companion panel for tracking investigative checklists, 
 * recommended forensic workflows, and historical investigation logs.
 */

interface ChecklistItem {
  id: string | number;
  label: string;
  done: boolean;
}

interface InvestigationNote {
  at: string;
  analyst: string;
  text: string;
}

interface TriageSidePanelProps {
  checklist: ChecklistItem[];
  onToggleChecklist: (id: string | number) => void;
  notesHistory: InvestigationNote[];
}

export default function TriageSidePanel({ checklist, onToggleChecklist, notesHistory }: TriageSidePanelProps) {
  const { language } = useLanguage();
  const tx = (id: string, en: string) => (language === 'id' ? id : en);
  const workflowSteps = language === 'id'
    ? ['Deteksi', 'Validasi', 'Enrich', 'Keputusan', 'Eskalasi/Tutup', 'Laporan']
    : ['DETECTION', 'VALIDATION', 'ENRICHMENT', 'DECISION', 'ESCALATE/CLOSE', 'REPORT'];

  return (
    <aside className="space-y-6 font-bold">
      <section className="premium-capsule !p-6 shadow-inner border-t-4 border-accent-cyan/40">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-cyan mb-4">{tx('Checklist Cepat', 'QUICK INVESTIGATION CHECKLIST')}</h3>
        <ul className="space-y-3">
          {checklist.map((item) => (
            <li key={item.id} className="flex items-start gap-4 rounded-xl border border-border-primary/10 bg-bg-panel/40 p-4 transition-all hover:bg-bg-panel/60">
              <input 
                type="checkbox" 
                checked={item.done} 
                onChange={() => onToggleChecklist(item.id)} 
                className="premium-checkbox mt-0.5" 
              />
              <span className={`text-[11px] font-black uppercase tracking-tight text-foreground-secondary ${item.done ? 'line-through opacity-40' : ''}`}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="premium-capsule !p-6 shadow-inner border-t-4 border-accent-indigo/40">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-indigo mb-4">{tx('Alur Rekomendasi', 'RECOMMENDED FORENSIC FLOW')}</h3>
        <ol className="space-y-2">
          {workflowSteps.map((step, index) => (
            <li key={step} className="rounded-xl border border-border-primary/10 bg-bg-panel/40 p-3 flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-accent-indigo/10 flex items-center justify-center text-[10px] font-black text-accent-indigo border border-accent-indigo/20">
                {index + 1}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground-tertiary">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="premium-capsule !p-6 shadow-inner border-t-4 border-status-success-bg/40 font-bold">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-status-success-text mb-4">{tx('Catatan Investigasi', 'CHRONOLOGICAL LOGS')}</h3>
        <div className="space-y-4">
          {notesHistory.length === 0 ? (
            <div className="py-6 text-center border-2 border-dashed border-border-primary/10 rounded-2xl opacity-40">
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground-tertiary">{tx('Belum ada catatan.', 'LOGS EMPTY.')}</p>
            </div>
          ) : (
            notesHistory.map((note, index) => (
              <article key={`${note.at}-${index}`} className="rounded-xl border border-border-primary/10 bg-bg-panel/40 p-4 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black text-foreground-primary uppercase tracking-widest">{note.analyst}</p>
                  <p className="text-[9px] font-black text-foreground-tertiary opacity-40 uppercase tabular-nums">{note.at}</p>
                </div>
                <p className="text-[11px] font-black text-foreground-secondary leading-relaxed uppercase tracking-tight opacity-80">{note.text}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </aside>
  );
}
