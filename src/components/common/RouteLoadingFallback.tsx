import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * RouteLoadingFallback — Neural Module Manifestation
 * Visual placeholder deployed during the asynchronous resolution of dynamic route segments.
 */

export default function RouteLoadingFallback() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-[40vh] items-center justify-center rounded-3xl border-2 border-border-primary bg-bg-panel/40 p-12 animate-in fade-in duration-700 shadow-inner">
      <div className="flex flex-col items-center gap-6">
        <div className="h-12 w-12 animate-spin rounded-2xl border-4 border-accent-cyan/10 border-t-accent-cyan shadow-[0_0_20px_rgba(6,182,212,0.2)]" />
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-[11px] font-black uppercase tracking-[0.4em] text-accent-cyan animate-pulse">
            {(t('common.loading.neuralModule') as string)}
          </span>
          <span className="text-[9px] font-black uppercase tracking-widest text-foreground-tertiary opacity-40">
            {(t('common.loading.handshake') as string)}
          </span>
        </div>
      </div>
    </div>
  );
}
