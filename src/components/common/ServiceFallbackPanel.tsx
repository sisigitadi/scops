import React from 'react';
import { AlertTriangle, RefreshCcw, Settings } from 'lucide-react';

/**
 * ServiceFallbackPanel — Degraded Mode Interface
 * Clinical visualization for service availability failures, offering immediate 
 * recovery vectors for analysts in high-pressure scenarios.
 */

interface ServiceFallbackPanelProps {
  title: string;
  message: string;
  detail?: string;
  onRetry?: () => void;
  retryLabel?: string;
  onOpenSettings?: () => void;
  settingsLabel?: string;
}

export default function ServiceFallbackPanel({
  title,
  message,
  detail,
  onRetry,
  retryLabel = 'Retry Connection',
  onOpenSettings,
  settingsLabel = 'Open Settings'
}: ServiceFallbackPanelProps) {
  return (
    <section className="premium-card !p-6 border-status-danger-border/30 bg-status-danger-bg/10 backdrop-blur-md">
      <div className="flex items-start gap-4">
        <div className="rounded-xl border border-status-danger-border/30 bg-status-danger-bg/15 p-3 text-status-danger-text">
          <AlertTriangle size={20} />
        </div>
        <div className="flex-1 space-y-2">
          <h2 className="text-lg font-black text-foreground-primary uppercase tracking-tight">{title}</h2>
          <p className="text-sm font-bold text-foreground-secondary">{message}</p>
          {detail ? <p className="text-xs font-mono text-status-danger-text/80">{detail}</p> : null}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="premium-button !px-4 !py-2 !text-xs font-black uppercase tracking-widest flex items-center gap-2"
              >
                <RefreshCcw size={13} />
                {retryLabel}
              </button>
            ) : null}

            {onOpenSettings ? (
              <button
                type="button"
                onClick={onOpenSettings}
                className="rounded-xl border border-border-primary bg-bg-panel/40 px-4 py-2 text-xs font-black uppercase tracking-widest text-foreground-tertiary transition-colors hover:text-foreground-primary flex items-center gap-2"
              >
                <Settings size={13} />
                {settingsLabel}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
