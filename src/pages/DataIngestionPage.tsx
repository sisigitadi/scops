import React, { useState } from 'react';
import InfoTooltip from '../components/common/InfoTooltip';
import { useAlertData } from '../context/AlertDataContext';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { CAPABILITIES, useAuth, ROLES } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { normalizeAlerts } from '../domain/alerts/normalizeAlert';
import { StaggerGroup, StaggerItem } from '../components/common/StaggerFadeIn';

/**
 * DataIngestionPage — Tactical Payload Injection Suite
 * Secure administrative console for simulating data streams and validating normalization protocols.
 */

export default function DataIngestionPage() {
  const { t } = useLanguage();
  const { settings } = useSettings();
  const { user, hasCapability } = useAuth();
  const { showToast } = useToast();
  
  // SECURE AUTH: Only ADMIN can mutate ingestion/simulation streams.
  const canMutate = user?.role === ROLES.ADMIN;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const hasAccess = hasCapability(CAPABILITIES.ACCESS_INGESTION);

  const { addAlerts, clearIngestedPayloads } = useAlertData();
  const [jsonInput, setJsonInput] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' });

  const handleRestricted = () => {
    if (!canMutate) showToast(t('common.restrictedNotice') as string);
  };

  const handleJsonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canMutate) {
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
    } catch (err) {
      console.error('Inject Payload Parse Error:', err);
      setStatusMsg({ text: (t('ingestion.error') as string), type: 'error' });
    }
  };

  const handleClearPayload = () => {
    if (!canMutate) {
      handleRestricted();
      return;
    }
    const confirmed = window.confirm(t('ingestion.confirmClear') as string);
    if (!confirmed) return;

    const removedCount = clearIngestedPayloads();
    setStatusMsg({
      text: removedCount > 0 ? (t('ingestion.clearSuccess') as string) : (t('ingestion.clearNone') as string),
      type: removedCount > 0 ? 'success' : 'error'
    });
    setJsonInput('');
  };

  return (
    <StaggerGroup className="space-y-8 relative pb-10" delay={0.1} stagger={0.1}>
      <StaggerItem>
        <section className="premium-capsule p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-6 relative z-10 min-w-0">
            <div className="hidden sm:block floating shrink-0">
              <img 
                src={settings.appLogo || `${import.meta.env.BASE_URL}logo.png`} 
                alt="Logo" 
                className="h-20 w-20 object-contain drop-shadow-2xl border-2 border-accent-cyan/20 rounded-2xl bg-bg-panel/40 p-2" 
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="truncate text-3xl font-black text-foreground-primary tracking-[0.2em] uppercase leading-none">
                  {(t('ingestion.title') as string)}
                </h1>
                <InfoTooltip text={(t('tooltips.ingestionTitle') as string)} />
              </div>
              <p className="mt-3 text-sm text-foreground-secondary font-black tracking-tight uppercase opacity-70 max-w-xl">{(t('ingestion.subtitle') as string)}</p>
            </div>
          </div>
        </section>
      </StaggerItem>

      <StaggerItem>
        <div className="grid gap-8 lg:grid-cols-2">
            <section className="premium-capsule p-8 shadow-inner-lg overflow-hidden">
                <h2 className="text-xl font-black text-foreground-primary mb-8 uppercase tracking-[0.2em] relative z-10 border-b-2 border-border-primary/20 pb-6 flex items-center gap-2">
                    {t('ingestion.rawJsonTitle')}
                    <InfoTooltip text={(t('settings.tooltips.ttRawJson') as string)} />
                </h2>
                
                {!canMutate && (
                  <div className="mb-8 rounded-2xl border-2 border-status-danger-border/30 bg-status-danger-bg/20 p-5 text-status-danger-text font-black uppercase tracking-widest text-[10px] animate-pulse relative z-10">
                    {(t('ingestion.adminOnlyNotice') as string)}
                  </div>
                )}

                <form onSubmit={handleJsonSubmit} className="space-y-8 relative z-10">
                    <div className="space-y-4">
                        <textarea
                            value={jsonInput}
                            disabled={!canMutate}
                            onChange={(e) => {
                                setJsonInput(e.target.value);
                                setStatusMsg({ text: '', type: '' });
                            }}
                            placeholder={t('ingestion.jsonPlaceholder')}
                            className="glass-input w-full min-h-[400px] font-mono !leading-relaxed !tracking-tighter resize-none"
                        />
                    </div>

                    {statusMsg.text && (
                        <div className={`premium-card !p-5 animate-in slide-in-from-top-4 ${statusMsg.type === 'error' ? '!bg-status-danger-bg/20 !border-status-danger-border/30 !text-status-danger-text' : '!bg-status-success-bg/20 !border-status-success-border/30 !text-status-success-text'} text-[10px] font-black uppercase tracking-[0.2em] shadow-lg`}>
                            {statusMsg.text}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-4 pt-4">
                        <button 
                            type="submit" 
                            disabled={!canMutate}
                            className="premium-button !px-10 !py-4 !bg-accent-cyan !text-foreground-inverse !border-none !shadow-xl shadow-accent-cyan/20"
                        >
                            {t('ingestion.btnSubmitJson')}
                        </button>
                        <button 
                            type="button" 
                            onClick={handleClearPayload}
                            disabled={!canMutate}
                            className="premium-button !px-8 !py-4 !border-status-danger-border/30 !text-status-danger-text hover:!bg-status-danger-bg/20"
                        >
                            {t('ingestion.btnClearPayload')}
                        </button>
                    </div>
                </form>
            </section>

            <section className="premium-capsule p-8 shadow-inner-lg flex flex-col justify-center gap-10 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="relative z-10 space-y-6">
                    <h3 className="text-4xl font-black text-foreground-primary tracking-[0.3em] uppercase opacity-20">{t('ingestion.protocolTitle')}</h3>
                    <div className="w-16 h-1 bg-gradient-to-r from-accent-cyan to-transparent mx-auto opacity-20" />
                    
                    <div className="space-y-4">
                        <p className="text-[10px] text-foreground-tertiary font-black uppercase tracking-[0.4em] max-w-sm mx-auto leading-relaxed opacity-60">
                            {(t('ingestion.protocolDesc') as string)}
                        </p>
                        <div className="flex flex-col items-center gap-2 pt-2 border-t border-border-primary/10">
                            <span className="text-[8px] font-black text-accent-cyan uppercase tracking-[0.3em] opacity-40">{t('ingestion.schemaInfo')}</span>
                            <p className="text-[9px] text-foreground-tertiary font-black uppercase tracking-widest leading-relaxed max-w-xs opacity-60 mb-4">
                                {(t('ingestion.protocolSchema') as string)}
                            </p>
                            
                            <div className="w-full p-4 bg-bg-panel/40 border-2 border-border-primary/20 rounded-2xl text-left shadow-inner group-hover:border-accent-cyan/20 transition-all">
                                <div className="flex items-center gap-2 mb-3 opacity-40">
                                    <div className="h-1.5 w-1.5 rounded-full bg-accent-cyan" />
                                    <span className="text-[7px] font-black uppercase tracking-[0.3em]">{(t('ingestion.payloadTemplate') as string)}</span>
                                </div>
                                <pre className="text-[9px] font-mono text-foreground-tertiary/80 whitespace-pre-wrap leading-relaxed">
{`{
  "rule": {
    "id": "5712",
    "level": 12,
    "description": "SSH Brute Force"
  },
  "agent": { "name": "PROD-SRV" },
  "timestamp": "2026-04-08T00:00Z"
}`}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-center h-48 relative z-10 rotate-180 opacity-20">
                    <div className="w-1 bg-gradient-to-b from-accent-rose via-accent-indigo to-transparent" />
                </div>
            </section>
        </div>
      </StaggerItem>
    </StaggerGroup>
  );
}
