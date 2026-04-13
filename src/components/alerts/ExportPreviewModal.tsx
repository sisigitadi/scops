import React from 'react';
import { Modal } from '../common/Modal';
import { useLanguage } from '../../context/LanguageContext';
import { Download, FileText, Layout } from 'lucide-react';
import { formatDDMMYYYY } from '../../utils/datePulse';

/**
 * ExportPreviewModal — Forensic Data Portability Gate
 * Clinical orchestration module for validating export payloads, 
 * providing high-fidelity visual snapshots before cryptographic transmission.
 */

interface ExportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  format: string;
  onConfirm: () => void;
}

export default function ExportPreviewModal({ 
  isOpen, 
  onClose, 
  data, 
  format, 
  onConfirm 
}: ExportPreviewModalProps) {
  const { t } = useLanguage();
  
  if (!data || data.length === 0) return null;

  const previewData = data.slice(0, 5);
  const columns = Object.keys(data[0]).slice(0, 6);

  const handleConfirm = () => {
    onClose();
    setTimeout(() => {
      onConfirm();
    }, 50);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('alerts.export.previewTitle')}>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-bold">
        <div className="flex items-center justify-between p-6 rounded-3xl bg-accent-cyan/10 border-2 border-accent-cyan/20">
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 rounded-2xl bg-accent-cyan flex items-center justify-center text-white shadow-lg shadow-accent-cyan/20">
                <FileText size={24} strokeWidth={2.5} />
             </div>
             <div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-accent-cyan">{t('alerts.export.format')}</h4>
                <p className="text-xl font-black text-foreground-primary uppercase tracking-widest">{format.toUpperCase()}</p>
             </div>
          </div>
          <div className="text-center">
             <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground-tertiary">{t('alerts.export.totalRecords')}</h4>
             <p className="text-xl font-black text-foreground-primary uppercase tracking-widest tabular-nums">{data.length} {t('alerts.export.entries')}</p>
          </div>
        </div>

        <div className="premium-card !p-0 overflow-hidden border-border-primary/40 bg-bg-panel/40 shadow-inner group">
           <div className="bg-bg-panel/60 p-4 border-b-2 border-border-primary/20 flex items-center gap-3">
              <Layout size={16} className="text-foreground-tertiary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground-tertiary">{t('alerts.export.snapshot')}</span>
           </div>
            <div className="overflow-x-auto no-scrollbar relative min-h-[300px]">
              <div className="min-w-[1000px] relative">
                {/* Header Grid */}
                <div 
                  className="grid sticky top-0 z-30 bg-bg-panel border-y-2 border-border-primary text-[9px] font-black uppercase tracking-[0.3em] text-foreground-tertiary" 
                  style={{ gridTemplateColumns: "120px 140px minmax(350px, 1fr) 130px 140px 140px" }}
                >
                  {columns.map((col, i) => (
                    <div key={col} className={`px-6 py-5 ${i < columns.length - 1 ? 'border-r border-border-primary/20' : ''}`}>
                      {t(`alerts.headers.${col}`) !== `alerts.headers.${col}` 
                        ? t(`alerts.headers.${col}`) 
                        : t(`audit.headers.${col}`) !== `audit.headers.${col}`
                          ? t(`audit.headers.${col}`)
                          : col.toUpperCase()}
                    </div>
                  ))}
                </div>

                {/* Body Container */}
                <div className="relative">
                   {/* Continuous Column Borders Overlay */}
                   <div className="absolute inset-0 pointer-events-none z-0">
                     <div className="grid h-full" style={{ gridTemplateColumns: "120px 140px minmax(350px, 1fr) 130px 140px 140px" }}>
                       <div className="border-r border-border-primary/20 h-full" />
                       <div className="border-r border-border-primary/20 h-full" />
                       <div className="border-r border-border-primary/20 h-full" />
                       <div className="border-r border-border-primary/20 h-full" />
                       <div className="border-r border-border-primary/20 h-full" />
                       <div className="h-full" />
                     </div>
                   </div>

                   <div className="relative z-10 divide-y divide-border-primary/5">
                    {previewData.map((row, idx) => (
                      <div key={idx} className="grid text-[10px] font-black uppercase tracking-widest text-foreground-secondary bg-bg-card/90 backdrop-blur-[2px] transition-all hover:bg-bg-hover/40 border-b border-border-secondary"
                           style={{ gridTemplateColumns: "120px 140px minmax(350px, 1fr) 130px 140px 140px" }}>
                        {columns.map((col, i) => {
                          const rawValue = row[col];
                          const isDateKey = ['date', 'timestamp', 'createdAt', 'updatedAt'].includes(col);
                          const displayValue = isDateKey ? formatDDMMYYYY(rawValue) : String(rawValue || '');
                          
                          return (
                            <div key={col} className={`px-6 py-4 ${isDateKey ? 'whitespace-nowrap' : 'break-words whitespace-normal'}`}>
                              {displayValue}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-bg-panel/20 text-center border-t border-border-primary/20 relative z-20">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-foreground-muted opacity-60">{t('alerts.export.truncated')}</span>
            </div>
          </div>

        <div className="flex flex-col sm:flex-row gap-5 pt-4">
           <button 
             onClick={onClose}
             className="premium-button flex-1 !border-border-primary/40 hover:!bg-bg-panel/60 font-black tracking-widest uppercase"
           >
              {t('common.cancel')}
           </button>
           <button 
             onClick={handleConfirm}
             className="premium-button flex-1 !bg-accent-cyan !text-white !border-none shadow-xl shadow-accent-cyan/20 hover:scale-105 font-black tracking-widest uppercase"
           >
              <Download size={18} strokeWidth={2.5} className="mr-3" /> 
              {t('alerts.export.confirm')}
           </button>
        </div>
      </div>
    </Modal>
  );
}
