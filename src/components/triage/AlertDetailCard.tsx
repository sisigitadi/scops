import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import AlertBadge from '../alerts/AlertBadge';
import { Alert } from '../../domain/alerts/normalizeAlert';

/**
 * AlertDetailCard — Forensic Evidence Capsule
 * High-fidelity container for deep telemetry inspection, 
 * leveraging clinical visual protocols for accelerated triage.
 */

interface AlertDetailCardProps {
  alert: Alert;
}

export default function AlertDetailCard({ alert }: AlertDetailCardProps) {
  const { language } = useLanguage();
  const tx = (id: string, en: string) => (language === 'id' ? id : en);

  return (
    <section className="premium-capsule !p-6 font-bold">
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <h2 className="text-lg font-black text-foreground-primary uppercase tracking-[0.2em]">{tx('Detail Alert', 'ALERT DETAIL')}</h2>
        <span className="rounded-xl border border-border-primary/40 bg-bg-panel/60 px-3 py-1 font-mono text-xs font-black text-accent-cyan shadow-inner">{alert.id}</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <DetailItem label="ALERT IDENTIFIER" value={alert.id} mono />
        <DetailItem label="RULE / SIGNATURE" value={alert.signature} />
        <DetailItem label={tx('Kategori', 'CATEGORY')} value={alert.category || 'GENERAL'} />
        <DetailItem label="SEVERITY PROPENSITY" value={<AlertBadge type="severity" value={alert.severity} />} />
        <DetailItem label="PROTOCOL STATUS" value={<AlertBadge type="status" value={alert.status} />} />
        <DetailItem label={tx('Asset / Hostname', 'TARGET ASSET')} value={alert.asset || '-'} />
        <DetailItem label={tx('Kritisitas Asset', 'ASSET CRITICALITY')} value={<AlertBadge type="severity" value={alert.assetCriticality || 'low'} />} />
        <DetailItem label={tx('User', 'ACTOR IDENTITY')} value={alert.user || 'SYSTEM'} />
        <DetailItem label="SOURCE TELEMETRY" value={alert.sourceIp || 'INTERNAL'} mono />
        <DetailItem label="DESTINATION ENDPOINT" value={alert.destinationIp || 'BROADCAST'} mono />
      </div>

      <div className="mt-6 rounded-2xl border border-border-primary/20 bg-bg-panel/40 p-5 shadow-inner">
        <p className="text-[10px] uppercase font-black tracking-widest text-foreground-tertiary mb-3 opacity-60">{tx('Ringkasan', 'FORENSIC SUMMARY')}</p>
        <p className="text-xs text-foreground-secondary leading-relaxed font-black uppercase tracking-tight">{alert.summary || 'No technical summary provided for this telemetry block.'}</p>
      </div>
    </section>
  );
}

interface DetailItemProps {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}

function DetailItem({ label, value, mono = false }: DetailItemProps) {
  return (
    <div className="rounded-xl border border-border-primary/10 bg-bg-panel/20 p-4 transition-all hover:bg-bg-panel/30">
      <p className="text-[9px] font-black uppercase tracking-widest text-foreground-tertiary opacity-40 mb-1.5">{label}</p>
      <div className={`text-[11px] font-black uppercase tracking-widest text-foreground-primary truncate ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  );
}
