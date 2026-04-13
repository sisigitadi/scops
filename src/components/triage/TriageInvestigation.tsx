import React, { useState, useEffect } from 'react';
import { pulse } from '../../utils/datePulse';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ClipboardList, GitBranch, Activity, CheckSquare } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { User } from '../../context/AuthContext';
import { Alert } from '../../context/AlertDataContext';


interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function TextArea({ label, value, onChange, disabled = false }: TextAreaProps) {
  return (
    <label className="block">
      <span className="mb-3 block text-[11px] font-black uppercase tracking-[0.2em] text-foreground-tertiary pl-4">{label}</span>
      <textarea 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        disabled={disabled}
        rows={4} 
        className="premium-input w-full !py-4 !px-6 min-h-[120px] resize-none" 
      />
    </label>
  );
}

interface TriageInvestigationProps {

  analysts: any[];
  connected: boolean;
  isReadOnly: boolean;
  onSave: (e: React.FormEvent | React.MouseEvent) => void;
  onFalsePositive: () => void;
  setShowEscalateModal: (show: boolean) => void;
  handleRestricted: () => void;
  form: {
    initialAssessment: string;
    status: string;
    notes: string;
  };
  updateField: (field: string, value: string) => void;
  user: User;
  statusOptions: Array<{ value: string; label: string }>;
  message: string;
  baseAlert: Alert;
  alerts: Alert[];
  lastSyncAt?: string;
}

/**
 * TriageInvestigation — Analytical Hub
 * Combines structured investigative forms with dynamic correlation graph analysis.
 */
export default function TriageInvestigation({ 
  analysts, 
  connected, 
  isReadOnly, 
  onSave, 
  onFalsePositive, 
  setShowEscalateModal, 
  handleRestricted,
  form,
  updateField,
  user,
  statusOptions,
  message,
  baseAlert,
  alerts,
  lastSyncAt
}: TriageInvestigationProps) {
  const { t } = useLanguage();

  // 1. PRESENCE DAMPING: We buffer socket updates to prevent flickers (3s stability window)
  const [stableAnalysts, setStableAnalysts] = useState(analysts);
  const [stableConnected, setStableConnected] = useState(connected);

  useEffect(() => {
    const handler = setTimeout(() => {
      setStableAnalysts(analysts);
      setStableConnected(connected);
    }, 1500); // 1.5s Damping buffer
    return () => clearTimeout(handler);
  }, [analysts.length, connected]);

  return (
    <section className="premium-capsule p-0 overflow-hidden shadow-inner-lg">
      {/* MAIN PRESENCE ROW */}
      <div className="bg-bg-panel/20 border-b-2 border-border-primary/10 px-8 py-4 flex items-center justify-between min-h-[72px]">
        {stableConnected ? (
          <>
            <div className="flex items-center gap-4 text-[11px] font-black text-accent-cyan uppercase tracking-[0.2em] select-none">
              <div className="relative flex items-center justify-center p-2 rounded-xl bg-accent-cyan/10">
                <Users size={18} strokeWidth={2.5} />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent-cyan rounded-full animate-pulse ring-4 ring-accent-cyan/20 blur-[1px]" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="tabular-nums leading-none">{stableAnalysts.length} {t('triage.presence.active') || 'ANALIS AKTIF'}</span>
                <span className="text-[8px] text-foreground-tertiary font-black tracking-[0.15em] opacity-50 uppercase leading-none">
                  {t('system.personnelHub') || 'HUB KEHADIRAN PERSONEL'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {stableAnalysts.map((a) => (
                <AnalystAvatar key={a.id || a.userId || a.username} analyst={a} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4 text-[11px] font-black text-foreground-tertiary uppercase tracking-[0.2em] opacity-40 select-none">
            <Users size={18} strokeWidth={2.5} />
            {t('system.syncingPersonnel') || 'MENYINKRONKAN MANAJEMEN OPERASIONAL...'}
          </div>
        )}
      </div>

      {/* SYNC STATUS FOOTER STRIP */}
      {stableConnected && lastSyncAt && (
        <div className="flex items-center gap-2.5 px-8 py-2 bg-accent-cyan/5 border-b border-accent-cyan/10">
          <span className="w-1.5 h-1.5 bg-accent-cyan rounded-full animate-pulse flex-shrink-0" />
          <span className="text-[9px] font-black text-foreground-tertiary uppercase tracking-[0.2em]">
            {t('system.dataSyncActive') || 'SINKRONISASI DATA AKTIF'}
          </span>
          <span className="text-[9px] font-black text-accent-cyan/70 tabular-nums tracking-[0.1em]">
            {pulse(lastSyncAt, { includeTime: true, style: 'dmy' }).split(' ')[1]}
          </span>
        </div>
      )}

      <div className="flex border-b-2 border-border-primary/10 bg-bg-panel/10">
        <div 
          className="flex-1 flex items-center justify-center gap-3 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-accent-cyan relative"
        >
          <ClipboardList size={20} strokeWidth={2.5} /> {t('triage.formTitle') || 'INVESTIGATION FORM'}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent-cyan" />
        </div>
      </div>

      <div className="p-8">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); onSave(e); }}>
              <TextArea disabled={isReadOnly} label={t('triage.fields.initialAssessment')} value={form.initialAssessment} onChange={(v) => updateField('initialAssessment', v)} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="command-label pl-4">
                    <Activity size={12} /> {t('triage.fields.status')}
                  </label>
                  <select 
                    disabled={isReadOnly}
                    value={form.status} 
                    onChange={(e) => updateField('status', e.target.value)}
                    className="glass-input w-full !appearance-none cursor-pointer"
                  >
                    {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label.toUpperCase()}</option>)}
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="command-label pl-4">
                    <Users size={12} /> {t('triage.fields.analyst')}
                  </label>
                  <div className="glass-input w-full opacity-60 flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent-cyan/10 flex items-center justify-center text-[10px]">{(user?.name || 'U').charAt(0)}</div>
                    {user?.name || 'ANALYST'}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="command-label pl-4">
                  <ClipboardList size={12} /> {t('triage.fields.notes')}
                </label>
                <textarea 
                  disabled={isReadOnly}
                  value={form.notes} 
                  onChange={(e) => updateField('notes', e.target.value)}
                  className="glass-input w-full min-h-[160px] resize-none"
                  placeholder="ENTER OBSERVATIONS..."
                />
              </div>

              <div className="flex flex-wrap gap-4 pt-6 border-t-2 border-border-primary/20">
                <button 
                  type="button" 
                  onClick={(e) => isReadOnly ? handleRestricted() : onSave(e)}
                  className={`premium-button !px-10 !py-4 !bg-accent-cyan !text-foreground-inverse !border-none !shadow-xl shadow-accent-cyan/20 ${isReadOnly ? 'opacity-30' : ''}`}
                >
                  {t('buttons.saveUpdate') || 'COMMIT DATA'}
                </button>
                <button 
                  type="button" 
                  onClick={() => isReadOnly ? handleRestricted() : onFalsePositive()} 
                  className={`premium-button !px-8 !py-4 !border-status-warning-border/30 !text-status-warning-text hover:!bg-status-warning-bg/20 ${isReadOnly ? 'opacity-30' : ''}`}
                >
                  {t('buttons.markFalsePositive') || 'MARK FALSE'}
                </button>
                <button 
                  type="button" 
                  onClick={() => isReadOnly ? handleRestricted() : setShowEscalateModal(true)} 
                  className={`premium-button !px-8 !py-4 !border-status-danger-border/30 !text-status-danger-text hover:!bg-status-danger-bg/20 ${isReadOnly ? 'opacity-30' : ''}`}
                >
                  {t('buttons.escalate') || 'ESCALATE PROTOCOL'}
                </button>
              </div>
            </form>
            {message && <div className="mt-8 premium-card !p-5 !bg-accent-cyan/10 !border-accent-cyan/20 text-[11px] text-accent-cyan font-black uppercase tracking-[0.2em] animate-in fade-in zoom-in-95 flex items-center gap-3">
               <CheckSquare size={16} /> {message}
            </div>}
          </div>
      </div>
    </section>
  );
}

const AnalystAvatar = React.memo(({ analyst }: { analyst: any }) => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  
  const handleIntercept = () => {
    showToast(`${t('triage.presence.intercept') || 'PERSONNEL INTERCEPT'}: ${analyst.username || analyst.name} | ${t('triage.presence.location') || 'LOCATION'}: ${analyst.page || 'UNKNOWN'} | ${t('triage.presence.ip') || 'IP'}: ${analyst.ip || 'INTERNAL'}`, 'info');
  };

  return (
    <button 
      onClick={handleIntercept}
      title={analyst.username || analyst.name || 'ANALYST'} 
      className="group relative h-12 w-12 rounded-[1rem] bg-bg-panel/90 border-2 border-accent-cyan/40 backdrop-blur-3xl flex items-center justify-center text-xs font-black text-foreground-primary uppercase transition-all hover:border-accent-cyan/60 hover:bg-accent-cyan/10 active:scale-95 shadow-lg ring-1 ring-accent-cyan/5"
    >
      <div className="absolute inset-0 rounded-[1rem] border border-accent-cyan/20 pointer-events-none" />
      <span className="group-hover:scale-110 transition-transform relative z-10 overflow-hidden flex items-center justify-center w-full h-full rounded-[1rem]">
        {analyst.avatar ? (
          <img src={analyst.avatar} alt="" className="w-full h-full object-cover" />
        ) : (
          (analyst.username || analyst.name || 'A').charAt(0)
        )}
      </span>
      
      {/* Tactical Identity Box */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-y-1 bg-bg-panel/95 backdrop-blur-md border border-accent-cyan/30 p-2 rounded-lg text-[9px] whitespace-nowrap z-50 shadow-2xl pointer-events-none tracking-[0.15em] font-black text-accent-cyan">
        <div className="flex flex-col gap-0.5">
          <span>{analyst.username || analyst.name}</span>
          <span className="text-[7px] text-foreground-tertiary opacity-70">{analyst.ip || (t('system.secureNode') || 'NODE_AMAN')}</span>
        </div>
      </div>
    </button>
  );
}, (prev, next) => {
  return prev.analyst.username === next.analyst.username && prev.analyst.id === next.analyst.id && prev.analyst.page === next.analyst.page;
});
