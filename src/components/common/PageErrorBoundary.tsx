import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import { LanguageContext } from '../../context/LanguageContext';

/**
 * PageErrorBoundary — Tactical Module Safeguard
 * Localized resilience layer for individual page planes, enabling granular recovery 
 * without disrupting the global operational context.
 */

interface Props {
  children?: ReactNode;
  pageName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class PageErrorBoundary extends Component<Props, State> {
  static contextType = LanguageContext;
  declare context: React.ContextType<typeof LanguageContext>;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Page Runtime Error (${this.props.pageName || 'Unknown Page'}):`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { t } = this.context || { t: (k: string) => k };
    const pageName = this.props.pageName || t('nav.landing');
    const demoMode = typeof window !== 'undefined' && window.sessionStorage.getItem('socops_demo_mode') === '1';
    const homeHref = demoMode ? '/demo' : '/app';

    return (
      <div className="space-y-4">
        <section className="premium-card !p-6 border-status-danger-border/30 bg-status-danger-bg/10">
          <div className="flex items-start gap-4">
            <div className="rounded-xl border border-status-danger-border/30 bg-status-danger-bg/15 p-3 text-status-danger-text">
              <AlertTriangle size={20} />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-black text-foreground-primary uppercase tracking-tight">
                {t('common.runtime.cannotLoadTitle').replace('{page}', pageName)}
              </h2>
              <p className="text-sm text-foreground-secondary font-bold">
                {t('common.runtime.cannotLoadMessage')}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={this.handleReset}
                  className="premium-button !px-4 !py-2 !text-xs font-black uppercase tracking-widest flex items-center gap-2"
                >
                  <RotateCcw size={13} />
                  {t('common.runtime.retryConnection')}
                </button>
                <a
                  href={homeHref}
                  className="rounded-xl border border-border-primary bg-bg-panel/40 px-4 py-2 text-xs font-black uppercase tracking-widest text-foreground-tertiary transition-colors hover:text-foreground-primary flex items-center gap-2"
                >
                  <Home size={13} />
                  {t('buttons.openDashboard')}
                </a>
              </div>
            </div>
          </div>
        </section>

        {this.state.error ? (
          <section className="premium-card !p-4 bg-bg-panel/70">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground-tertiary">{t('common.diagnostic')}</p>
            <pre className="overflow-auto text-xs text-foreground-secondary font-mono bg-bg-card/40 p-3 rounded-lg border border-border-primary/10">
              {this.state.error.toString()}
            </pre>
          </section>
        ) : null}
      </div>
    );
  }
}

export default PageErrorBoundary;
