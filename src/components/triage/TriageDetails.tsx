import React, { ReactNode } from 'react';
import { Globe, Search, Zap, Fingerprint, ShieldAlert } from 'lucide-react';
import AlertBadge from '../alerts/AlertBadge';
import InfoTooltip from '../common/InfoTooltip';
import SensitiveText from '../common/SensitiveText';
import { useLanguage } from '../../context/LanguageContext';
import { Alert } from '../../context/AlertDataContext';

interface IntelBadgeProps {
  label: string;
  value?: string;
  icon?: ReactNode;
  color: string;
}

function IntelBadge({ label, value, icon, color }: IntelBadgeProps) {
  if (!value) return null;
  return (
    <div className={`p-5 rounded-[2rem] border-2 flex flex-col items-center justify-center text-center shadow-xl transition-all hover:scale-110 active:scale-95 ${color}`}>
      <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80 flex items-center gap-2 mb-3 border-b-2 border-current pb-2 min-w-[70px] justify-center">
        {icon} {label}
      </span>
      <span className="text-[11px] font-black uppercase tracking-tighter truncate w-full">{value}</span>
    </div>
  );
}

interface DetailProps {
  label: string;
  value: ReactNode;
  mono?: boolean;
  sensitive?: boolean;
}

function Detail({ label, value, mono = false, sensitive = false }: DetailProps) {
  const renderedValue = sensitive && typeof value === 'string' ? <SensitiveText value={value} mono={mono} /> : value;
  return (
    <div className="premium-card p-6 bg-bg-panel/10 border-border-primary/10 group cursor-default transition-all hover:bg-bg-panel/20">
      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground-tertiary mb-3 group-hover:text-accent-cyan transition-colors text-center">{label}</p>
      <div className={`text-[11px] text-foreground-primary font-black ${mono ? 'font-mono' : ''} truncate uppercase tracking-widest text-center w-full`}>{renderedValue}</div>
    </div>
  );
}

interface TriageDetailsProps {
  alert: Alert;
  baseAlert: Alert;
  enriching: boolean;
  triggerEnrichment: () => void;
  isReadOnly?: boolean;
}

/**
 * TriageDetails — Investigative Evidence View
 * Visualizes alert metadata, threat intelligence enrichment, and raw event payloads.
 */
export default function TriageDetails({ 
  alert, 
  baseAlert, 
  enriching, 
  triggerEnrichment, 
  isReadOnly 
}: TriageDetailsProps) {
  const { t } = useLanguage();

  return (
    <section className="premium-capsule p-8 shadow-inner-lg">
      <h2 className="text-xl font-black text-foreground-primary mb-10 uppercase tracking-[0.2em] relative z-10 border-b-2 border-border-primary/20 pb-6">{t('triage.detailTitle')}</h2>
      
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-10 relative z-10">
        <Detail label={t('alerts.headers.alertId')} value={alert.id} mono sensitive />
        <Detail label={t('triage.fields.ruleId')} value={alert.ruleId} sensitive />
        <Detail label={t('triage.fields.category')} value={alert.category} />
        <Detail label={t('triage.fields.severity')} value={<AlertBadge type="severity" value={alert.severity} />} />
        <Detail label={t('triage.fields.hostname')} value={alert.hostname || alert.agentName} sensitive />
        <Detail label={t('triage.fields.status')} value={<AlertBadge type="status" value={baseAlert.status} />} />
      </div>

      <div className="premium-card p-6 mb-10 bg-bg-panel/10 border-border-primary/10 relative z-10">
        <div className="flex items-center justify-between mb-8 border-b-2 border-border-primary/20 pb-6">
          <h3 className="text-xs font-black text-foreground-primary flex items-center gap-3 uppercase tracking-[0.2em]">
            <Globe size={20} strokeWidth={2.5} className="text-accent-cyan" /> {t('triage.intel.title') || 'INTEL ENRICHMENT'}
          </h3>
          {!baseAlert.enriched && (
            <button 
              onClick={triggerEnrichment}
              disabled={enriching || isReadOnly}
              className="premium-button !py-2.5 !px-6 !text-[10px] !bg-accent-cyan !text-foreground-inverse !border-none !shadow-lg shadow-accent-cyan/10"
            >
              {enriching ? <Zap size={14} className="animate-pulse mr-2" /> : <Search size={14} strokeWidth={3} className="mr-2" />}
              {enriching ? t('triage.intel.fetching') : t('triage.intel.fetch')}
            </button>
          )}
        </div>
        
        {baseAlert.enriched ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <IntelBadge label="Actor" value={baseAlert.intel?.actor} icon={<Fingerprint size={16} />} color="border-status-danger/30 bg-status-danger-bg text-status-danger-text" />
            <IntelBadge label="Malware" value={baseAlert.intel?.malware} icon={<ShieldAlert size={16} />} color="border-accent-purple/30 bg-bg-panel text-accent-purple" />
            <IntelBadge label="TLP" value={baseAlert.intel?.tlp} color="border-status-warning/30 bg-status-warning-bg text-status-warning-text" />
            <IntelBadge label="Origin" value={baseAlert.intel?.origin} color="border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan" />
          </div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-border-primary/20 rounded-2xl">
             <p className="text-[10px] text-foreground-tertiary font-black uppercase tracking-[0.2em] opacity-60">{t('triage.intel.noData') || 'NO INTEL MATCH FOUND'}</p>
          </div>
        )}
      </div>

      <div className="premium-card !p-8 bg-bg-panel/40 border-border-primary/20 text-sm font-black text-foreground-secondary leading-relaxed uppercase tracking-tighter relative z-10 shadow-inner">
         <div className="mb-4 text-[9px] font-black text-foreground-tertiary opacity-40 uppercase tracking-[0.3em]">{t('triage.rawPayload')}</div>
        {alert.ruleDescription}
      </div>
    </section>
  );
}
