import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface TriageEscalateModalProps {
  justification: string;
  setJustification: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  error?: string | null;
}

/**
 * TriageEscalateModal — Critical Decision Terminal
 * Enforces mandatory justification for escalating an incident to L2/Crisis Management.
 */
export default function TriageEscalateModal({ 
  justification, 
  setJustification, 
  onConfirm, 
  onCancel, 
  error 
}: TriageEscalateModalProps) {
  const { t } = useLanguage();
  
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4">
      <div className="premium-capsule !bg-bg-card/95 !max-w-xl p-10 animate-in zoom-in-95 duration-300">
        <h3 className="text-2xl font-black text-status-danger-text flex items-center gap-3 mb-4 uppercase tracking-[0.2em] relative z-10">
          <AlertTriangle size={24} strokeWidth={3} />
          {t('triage.escalation.modalTitle') || 'ESCALATION PROTOCOL'}
        </h3>
        <p className="text-foreground-tertiary text-xs mb-8 font-black uppercase tracking-widest opacity-70 leading-relaxed relative z-10">
          {t('triage.escalation.modalSubtitle') || 'DOCUMENT THE JUSTIFICATION FOR ESCALATING TO HIGHER COMMAND.'}
        </p>
        
        <textarea
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          placeholder={t('triage.escalation.placeholder') || 'ENTER JUSTIFICATION...'}
          className="premium-input w-full bg-bg-panel/40 relative z-10 mb-2 min-h-[160px] resize-none"
        />
        {error && <p className="text-status-danger-text text-[9px] mb-6 font-black uppercase tracking-[0.3em] pl-4">{error}</p>}
        
        <div className="flex justify-end gap-5 mt-10 relative z-10">
          <button 
            onClick={onCancel}
            className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground-tertiary hover:text-foreground-primary transition-colors"
          >
            {t('triage.escalation.cancel') || 'ABORT'}
          </button>
          <button 
            onClick={onConfirm}
            className="premium-button !px-10 !py-3 !bg-status-danger-bg/20 !text-status-danger-text !border-status-danger-border/40 hover:!bg-status-danger-bg/40"
          >
            {t('triage.escalation.confirm') || 'CONFIRM ESCALATION'}
          </button>
        </div>
      </div>
    </div>
  );
}
