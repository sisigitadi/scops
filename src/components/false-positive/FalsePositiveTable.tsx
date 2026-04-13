import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import InfoTooltip from '../common/InfoTooltip';
import TuningStatusBadge from './TuningStatusBadge';
import { formatDDMMYYYY } from '../../utils/datePulse';

/**
 * FalsePositiveTable — Signal-to-Noise Forensic Register
 * High-fidelity orchestration plane for visualizing false positive telemetry, 
 * leveraging clinical data grids for tuning analysis and operational efficiency.
 */

interface FPItem {
  date: string;
  tool: string;
  signature: string;
  category: string;
  severity: string;
  assetScope: string;
  description: string;
  reasonFalsePositive: string;
  frequency: string;
  analyst: string;
  proposedTuning: string;
  status: string;
  tuningStatus: string;
  notes: string;
}

interface FalsePositiveTableProps {
  items: FPItem[];
}

export default function FalsePositiveTable({ items }: FalsePositiveTableProps) {
  const { t } = useLanguage();
  
  const fpGridTemplate = "120px 140px minmax(300px, 1fr) 160px 140px 180px minmax(300px, 1fr) minmax(300px, 1fr) 100px 160px minmax(240px, 1fr) 140px 140px minmax(240px, 1fr)";

  return (
    <section className="premium-capsule !p-0 shadow-inner-lg mt-8 relative overflow-hidden bg-bg-panel/80 backdrop-blur-2xl font-bold">
      <div className="px-8 py-6 bg-bg-panel/40 border-b border-border-primary/20 flex items-center justify-between relative z-10 font-black">
        <h2 className="text-xl font-black text-foreground-primary uppercase tracking-[0.2em]">
          {t('fpos.registerTitle')}
        </h2>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground-muted opacity-60">
          {items.length} {t('fpos.entriTerdeteksi')}
        </span>
      </div>

      <div className="overflow-x-auto custom-scrollbar relative">
        <div className="min-w-[2800px] relative">
          {/* Header Row (Sticky) */}
          <div 
            className="grid sticky top-0 z-30 bg-bg-panel border-y-2 border-border-primary text-[10px] font-black uppercase tracking-widest text-foreground-tertiary shadow-lg shadow-black/20"
            style={{ gridTemplateColumns: fpGridTemplate }}
          >
            {[
              { key: 'date', tip: 'fpos.tooltips.date' },
              { key: 'tool', tip: 'fpos.tooltips.tool' },
              { key: 'signature', tip: 'fpos.tooltips.signature' },
              { key: 'category', tip: 'fpos.tooltips.category' },
              { key: 'severity', tip: 'fpos.tooltips.severity', center: true },
              { key: 'assetScope', tip: 'fpos.tooltips.assetScope' },
              { key: 'description', tip: 'fpos.tooltips.description' },
              { key: 'reasonFP', tip: 'fpos.tooltips.reasonFP' },
              { key: 'frequency', tip: 'fpos.tooltips.frequency', center: true },
              { key: 'analyst', tip: 'fpos.tooltips.analyst' },
              { key: 'proposedTuning', tip: 'fpos.tooltips.proposedTuning' },
              { key: 'status', tip: 'fpos.tooltips.status', center: true },
              { key: 'tuning', tip: 'fpos.tooltips.tuning', center: true },
              { key: 'notes' }
            ].map((col, idx, arr) => (
              <div 
                key={col.key} 
                className={`px-6 py-5 flex items-center ${col.center ? 'justify-center' : ''} gap-2 ${idx < arr.length - 1 ? 'border-r border-border-primary/20' : ''}`}
              >
                {t(`fpos.headers.${col.key}`)}
                {col.tip && <InfoTooltip text={t(col.tip)} />}
              </div>
            ))}
          </div>

          {/* Data Body with Continuous Column Borders Overlay */}
          <div className="relative text-[11px] font-black uppercase tracking-tighter text-foreground-secondary">
            {/* Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none z-0">
               <div className="grid h-full" style={{ gridTemplateColumns: fpGridTemplate }}>
                 {Array.from({ length: 14 }).map((_, i) => (
                   <div key={i} className={`${i < 13 ? 'border-r border-border-primary/20' : ''} h-full`} />
                 ))}
               </div>
            </div>
            {items.map((item, index) => (
              <div 
                key={`${item.signature}-${index}`} 
                className="grid relative z-10 border-b last:border-none border-border-primary/5 hover:bg-bg-panel/40 transition-colors group bg-bg-card/40 backdrop-blur-[1px]"
                style={{ gridTemplateColumns: fpGridTemplate }}
              >
                <div className="px-6 py-4 tabular-nums text-foreground-tertiary flex items-center">{formatDDMMYYYY(item.date)}</div>
                <div className="px-6 py-4 text-foreground-primary flex items-center">{item.tool}</div>
                <div className="px-6 py-4 flex items-center overflow-hidden"><p className="break-all text-foreground-primary">{item.signature}</p></div>
                <div className="px-6 py-4 flex items-center">{item.category}</div>
                <div className="px-6 py-4 flex items-center justify-center"><TuningStatusBadge type="severity" value={item.severity} /></div>
                <div className="px-6 py-4 font-mono flex items-center overflow-hidden"><p className="break-all">{item.assetScope}</p></div>
                <div className="px-6 py-4 flex items-center overflow-hidden"><p className="whitespace-pre-wrap lowercase font-mono opacity-80">{item.description}</p></div>
                <div className="px-6 py-4 flex items-center overflow-hidden"><p className="whitespace-pre-wrap italic">{item.reasonFalsePositive}</p></div>
                <div className="px-6 py-4 flex items-center justify-center tabular-nums">{item.frequency}</div>
                <div className="px-6 py-4 flex items-center">{item.analyst}</div>
                <div className="px-6 py-4 flex items-center overflow-hidden"><p className="break-words text-accent-cyan">{item.proposedTuning}</p></div>
                <div className="px-6 py-4 flex items-center justify-center"><TuningStatusBadge type="status" value={item.status} /></div>
                <div className="px-6 py-4 flex items-center justify-center"><TuningStatusBadge type="tuning" value={item.tuningStatus} /></div>
                <div className="px-6 py-4 flex items-center overflow-hidden"><p className="whitespace-pre-wrap lowercase opacity-60 italic">{item.notes}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
