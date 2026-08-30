import React, { useState } from 'react';
import { Database, Info, Trash2, Database as IngestIcon } from 'lucide-react';
import { useAlertData } from '../../context/AlertDataContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSettings } from '../../context/SettingsContext';
import { CAPABILITIES, useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { normalizeAlerts } from '../../domain/alerts/normalizeAlert';
import { StaggerGroup, StaggerItem } from '../common/StaggerFadeIn';
import InfoTooltip from '../common/InfoTooltip';
import { Drawer } from '../common/Modal';

/**
 * IngestionDrawer — Forensic Data Ingestion Module
 * High-fidelity orchestration plane for manual payload ingestion, 
 * diagnostic diagnostic diagnostics diagnostics.
 */

interface IngestionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IngestionDrawer({ isOpen, onClose }: IngestionDrawerProps) {
  const { t } = useLanguage();
  const { settings } = useSettings();
  const { hasCapability } = useAuth();
  const { showToast } = useToast();
  const isAdmin = hasCapability(CAPABILITIES.ACCESS_INGESTION);
  const { addAlerts, clearIngestedPayloads } = useAlertData();
  const [jsonInput, setJsonInput] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: string }>({ text: '', type: '' });

  const handleRestricted = () => {
    if (!isAdmin) showToast((t('common.restrictedNotice') as string));
  };

  const handleJsonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      handleRestricted();
      return;
    }
    if (!jsonInput.trim()) {
      setStatusMsg({ text: (t('ingestion.empty') as string), type: 'error' });
      return;
    }

    try {
      let parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        parsed = [parsed];
      }

      const now = new Date();
      const prepared = parsed.map((item: any, index: number) => ({
        ...item,
        id: item.id || item.alertId || `ING-${now.getTime()}-${index}`,
        category: item.category || 'custom',
        source: 'manual_ingestion'
      }));

      const sanitized = normalizeAlerts(prepared);
      addAlerts(sanitized);
      setStatusMsg({ text: (t('ingestion.success') as string), type: 'success' });
      setJsonInput('');
      showToast((t('ingestion.success') as string), 'success');
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      console.error('Inject Payload Parse Error:', err);
      setStatusMsg({ text: (t('ingestion.error') as string), type: 'error' });
      showToast((t('ingestion.error') as string), 'error');
    }
  };

  const handleClearPayload = () => {
    if (!isAdmin) {
      handleRestricted();
      return;
    }
    const confirmed = window.confirm((t('ingestion.confirmClear') as string));
    if (!confirmed) return;

    const removedCount = clearIngestedPayloads();
    setStatusMsg({
      text: removedCount > 0 ? (t('ingestion.clearSuccess') as string) : (t('ingestion.clearNone') as string),
      type: removedCount > 0 ? 'success' : 'error'
    });
    setJsonInput('');
    if (removedCount > 0) showToast((t('ingestion.clearSuccess') as string), 'success');
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={(t('ingestion.title') as string) || 'DATA INGESTION PROTOCOL'} maxWidth="max-w-2xl">
      <StaggerGroup className="space-y-6" delay={0.1} stagger={0.1}>
        <StaggerItem>
           <div className="flex items-center gap-4 p-5 rounded-2xl border-2 border-border-primary bg-bg-panel/50 shadow-inner font-bold">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-accent-cyan/30 bg-accent-cyan/10 shadow-sm floating">
                <Database size={24} className="text-accent-cyan" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-black uppercase tracking-widest text-foreground-primary truncate">{(t('ingestion.subtitle') as string)}</h4>
                <p className="text-[10px] text-foreground-secondary font-black uppercase tracking-tighter opacity-70">{(t('common.diagnosticLab') as string)}</p>
              </div>
           </div>
        </StaggerItem>

        <StaggerItem>
           <form className="space-y-6 font-bold" onSubmit={handleJsonSubmit}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-foreground-muted flex items-center gap-2">
                   {(t('common.context') as string)} JSON INPUT <InfoTooltip text={(t('tooltips.ingestionTitle') as string)} />
                </label>
                {!isAdmin && (
                  <span className="text-[9px] font-black text-status-danger-text uppercase">{(t('ingestion.adminOnlyNotice') as string)}</span>
                )}
              </div>
              <textarea
                className="w-full h-[50vh] rounded-2xl border-2 border-border-primary bg-bg-panel p-5 text-xs font-mono text-foreground-primary placeholder:text-foreground-muted focus:border-border-focus focus:outline-none shadow-inner transition-all resize-none font-bold disabled:opacity-50"
                placeholder={(t('ingestion.jsonPlaceholder') as string)}
                value={jsonInput}
                disabled={!isAdmin}
                onChange={(e) => {
                  setJsonInput(e.target.value);
                  setStatusMsg({ text: '', type: '' });
                }}
              />
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={!isAdmin}
                className={`w-full rounded-xl border-2 px-8 py-4 text-sm font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 ${!isAdmin ? 'opacity-50 cursor-not-allowed bg-bg-panel border-border-primary text-foreground-muted' : 'bg-accent-cyan border-accent-cyan text-foreground-inverse hover:border-accent-cyan-hover shadow-accent-cyan/20'}`}
              >
                <IngestIcon size={16} />
                {(t('ingestion.btnSubmitJson') as string)}
              </button>
              <button
                type="button"
                onClick={handleClearPayload}
                disabled={!isAdmin}
                className={`w-full rounded-xl border-2 px-8 py-4 text-sm font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 ${!isAdmin ? 'opacity-50 cursor-not-allowed bg-bg-panel border-border-primary text-foreground-muted' : 'border-status-danger-border bg-status-danger-bg text-status-danger-text hover:bg-status-danger-bg/20'}`}
              >
                <Trash2 size={16} />
                {(t('ingestion.btnClearPayload') as string)}
              </button>
            </div>

            {statusMsg.text && (
              <div className={`text-[10px] font-black uppercase tracking-widest text-center px-4 py-3 rounded-xl border-2 animate-in fade-in zoom-in-95 ${statusMsg.type === 'success' ? 'text-status-success-text border-status-success-border bg-status-success-bg' : 'text-status-danger-text border-status-danger-border bg-status-danger-bg'}`}>
                {statusMsg.text}
              </div>
            )}
           </form>
        </StaggerItem>

        <StaggerItem>
           <div className="p-4 rounded-xl border-2 border-border-primary bg-bg-panel/30 font-bold">
              <div className="flex items-center gap-2 mb-2 text-foreground-muted">
                 <Info size={14} />
                 <span className="text-[10px] font-black uppercase tracking-widest leading-none">Security Tip</span>
              </div>
              <p className="text-[10px] font-bold text-foreground-secondary leading-relaxed uppercase tracking-tighter mb-4">
                 Manually ingested payloads will bypass standard SIEM filters but will be captured by the platform's audit engine for integrity tracking.
              </p>
              <div className="p-4 rounded-xl border-2 border-border-primary/20 bg-bg-panel/40 text-[9px] font-mono text-foreground-tertiary/60 whitespace-pre-wrap overflow-hidden shadow-inner">
{`{
  "rule": {
    "id": "5712",
    "level": 12,
    "description": "..."
  },
  "agent": { "name": "..." },
  "timestamp": "..."
}`}
              </div>
           </div>
        </StaggerItem>

        <StaggerItem>
          <div className="flex flex-col items-center justify-center gap-4 pt-6">
            <div className="h-px w-32 bg-border-primary" />
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-foreground-muted">
               SEC OPS | {settings.orgName}
            </span>
          </div>
        </StaggerItem>
      </StaggerGroup>
    </Drawer>
  );
}
