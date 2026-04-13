import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

/**
 * ErrorBoundary — Global Resilience Shield
 * Prevents cascading failures by intercepting critical runtime violations and 
 * presenting a forensic-grade recovery interface.
 *
 * NOTE: ErrorBoundary is a class component and cannot use hooks.
 * Translations are read directly from the active language JSON via
 * a helper that reads from localStorage/sessionStorage.
 */

function getT(key: string, fallback: string): string {
  try {
    const lang = localStorage.getItem('socops_lang') || 'id';
    const messages = lang === 'id'
      ? (window as any).__SOCOPS_LOCALE_ID__
      : (window as any).__SOCOPS_LOCALE_EN__;
    if (!messages) return fallback;
    const parts = key.split('.');
    let val: any = messages;
    for (const part of parts) {
      val = val?.[part];
      if (val === undefined) return fallback;
    }
    return typeof val === 'string' ? val : fallback;
  } catch {
    return fallback;
  }
}

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Critical Platform Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background-main flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-status-danger-bg flex items-center justify-center text-status-danger-text mb-6 border border-status-danger-border animate-pulse">
            <AlertTriangle size={40} />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground-primary mb-2">
            {getT('errorBoundary.title', 'Kegagalan Intersepsi Platform')}
          </h1>
          
          <p className="text-foreground-secondary max-w-md mb-8">
            {getT('errorBoundary.desc', 'Mesin mission-critical mengalami pelanggaran runtime. Log forensik telah dihasilkan. Lakukan reboot sistem segera atau kembali ke gerbang.')}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="premium-button !px-8 !py-3 font-bold flex items-center gap-2 shadow-lg"
            >
              <RotateCcw size={18} />
              {getT('errorBoundary.reboot', 'Reboot Lingkungan')}
            </button>
            <a 
              href="/"
              className="px-8 py-3 rounded-xl font-bold flex items-center gap-2 text-foreground-tertiary hover:text-foreground-primary transition-colors"
            >
              <Home size={18} />
              {getT('errorBoundary.returnToGate', 'Kembali ke Gerbang')}
            </a>
          </div>

          <div className="mt-12 p-4 rounded-2xl bg-bg-panel/40 border border-border-primary/20 max-w-lg w-full shadow-inner">
            <p className="text-[10px] font-mono text-foreground-tertiary text-left overflow-auto max-h-32 scrollbar-hide">
              {this.state.error?.toString()}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
