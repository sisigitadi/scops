import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * TriageForm — Investigative Workflow Orchestration
 * High-fidelity control plane for capturing forensic assessments, 
 * coordinating team responses, and finalizing threat containment protocols.
 */

interface TriageFormState {
  initialAssessment: string;
  evidence: string;
  actionTaken: string;
  escalatedTo: string;
  status: string;
  analyst: string;
  recommendation: string;
  notes: string;
}

interface TriageFormProps {
  formState: TriageFormState;
  onFieldChange: (field: keyof TriageFormState, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onMarkFalsePositive: () => void;
  onEscalate: () => void;
  onCloseAlert: () => void;
  onAddNote: () => void;
  lastAction: string | null;
}

export default function TriageForm({
  formState,
  onFieldChange,
  onSubmit,
  onMarkFalsePositive,
  onEscalate,
  onCloseAlert,
  onAddNote,
  lastAction
}: TriageFormProps) {
  const { language } = useLanguage();
  const tx = (id: string, en: string) => (language === 'id' ? id : en);

  return (
    <section className="premium-capsule !p-6 font-bold">
      <h2 className="text-xl font-black text-foreground-primary uppercase tracking-[0.2em] mb-6">{tx('Form Triage', 'TRIAGE ASSESSMENT MATRIX')}</h2>

      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="space-y-6">
          <FieldTextarea label={tx('Asesmen Awal', 'INITIAL FORENSIC ASSESSMENT')} value={formState.initialAssessment} onChange={(value) => onFieldChange('initialAssessment', value)} rows={3} />
          <FieldTextarea label={tx('Bukti', 'COLLECTED EVIDENCE')} value={formState.evidence} onChange={(value) => onFieldChange('evidence', value)} rows={3} />
          <FieldTextarea label={tx('Aksi yang Diambil', 'REMEDIATION ACTION TAKEN')} value={formState.actionTaken} onChange={(value) => onFieldChange('actionTaken', value)} rows={3} />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FieldInput label={tx('Eskalasi ke', 'ESCALATION TARGET')} value={formState.escalatedTo} onChange={(value) => onFieldChange('escalatedTo', value)} />
          <FieldSelect label="PROTOCOL STATUS" value={formState.status} onChange={(value) => onFieldChange('status', value)} options={['open', 'investigating', 'closed']} />
          <FieldInput label="ANALYST IDENTITY" value={formState.analyst} onChange={(value) => onFieldChange('analyst', value)} />
        </div>

        <FieldTextarea label={tx('Rekomendasi', 'STRATEGIC RECOMMENDATION')} value={formState.recommendation} onChange={(value) => onFieldChange('recommendation', value)} rows={3} />

        <div className="rounded-2xl border border-border-primary/20 bg-bg-panel/40 p-6 shadow-inner">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-foreground-tertiary">{tx('Catatan Investigasi', 'INVESTIGATION LOGS')}</p>
            <button type="button" onClick={onAddNote} className="px-3 py-1.5 rounded-lg bg-accent-indigo/10 text-accent-indigo border border-accent-indigo/20 text-[10px] font-black uppercase tracking-widest hover:bg-accent-indigo/20 transition-all">
              {tx('Tambah Catatan', 'PERSIST NOTE')}
            </button>
          </div>
          <textarea
            value={formState.notes}
            onChange={(event) => onFieldChange('notes', event.target.value)}
            rows={4}
            placeholder={tx('Tulis catatan investigasi teknis...', 'DOCUMENT TECHNICAL FINDINGS...')}
            className="premium-input w-full font-black uppercase tracking-widest h-32 resize-none"
          />
        </div>

        <div className="flex flex-wrap gap-3 pt-4 border-t border-border-primary/10">
          <button type="submit" className="premium-button !bg-accent-cyan !text-white !border-none font-black tracking-widest uppercase px-6">
            {tx('Simpan / Update', 'COMMIT UPDATES')}
          </button>
          <button type="button" onClick={onMarkFalsePositive} className="premium-button !border-accent-amber/40 !text-accent-amber hover:!bg-accent-amber/10 font-black tracking-widest uppercase px-6">
            {tx('Tandai False Positive', 'ASSERT FALSE POSITIVE')}
          </button>
          <button type="button" onClick={onEscalate} className="premium-button !border-accent-rose/40 !text-accent-rose hover:!bg-accent-rose/10 font-black tracking-widest uppercase px-6">
            {tx('Eskalasi', 'TRIGGER ESCALATION')}
          </button>
          <button type="button" onClick={onCloseAlert} className="premium-button !border-status-success-border/40 !text-status-success-text hover:!bg-status-success-bg/10 font-black tracking-widest uppercase px-6">
            {tx('Tutup Alert', 'TERMINATE INCIDENT')}
          </button>
        </div>
      </form>

      {lastAction && (
        <div className="mt-6 p-4 rounded-xl border border-border-primary/20 bg-bg-panel/60 text-[10px] font-black uppercase tracking-widest text-accent-cyan animate-in fade-in slide-in-from-top-2">
          OPERATIONAL LOG: {lastAction}
        </div>
      )}
    </section>
  );
}

function FieldInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-foreground-tertiary pl-1">{label}</span>
      <input 
        value={value} 
        onChange={(event) => onChange(event.target.value)} 
        className="premium-input w-full font-black uppercase tracking-widest h-11" 
      />
    </label>
  );
}

function FieldTextarea({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-foreground-tertiary pl-1">{label}</span>
      <textarea 
        value={value} 
        onChange={(event) => onChange(event.target.value)} 
        rows={rows} 
        className="premium-input w-full font-black uppercase tracking-widest p-4 resize-none" 
      />
    </label>
  );
}

function FieldSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block font-bold">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-foreground-tertiary pl-1">{label}</span>
      <select 
        value={value} 
        onChange={(event) => onChange(event.target.value)} 
        className="premium-input w-full font-black uppercase tracking-widest h-11 appearance-none cursor-pointer"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-bg-card font-black">
            {option.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}
