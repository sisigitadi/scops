import React from 'react';
import { Link, useRouteError } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { StaggerGroup, StaggerItem } from '../components/common/StaggerFadeIn';
import { AlertCircle, Home, ShieldX, Terminal, Zap } from 'lucide-react';

/**
 * NotFoundPage — Neural Gateway Recovery
 * Tactical interceptor for routing failures and system violations.
 */

export default function NotFoundPage() {
  const { t } = useLanguage();
  const error = useRouteError() as any;

  return (
    <div className="flex min-h-screen items-center justify-center p-8 bg-bg-panel overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(8,145,178,0.08)_0%,transparent_70%)]" />
      
      <StaggerGroup className="w-full max-w-2xl relative z-10" delay={0.1} stagger={0.12}>
        <StaggerItem>
          <section className="premium-capsule p-12 text-center relative overflow-hidden shadow-2xl border-status-danger-border/30">
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 rounded-[2rem] bg-status-danger-bg/20 border-4 border-status-danger-border/30 flex items-center justify-center mb-10 shadow-2xl floating">
                <ShieldX size={48} strokeWidth={2.5} className="text-status-danger-text" />
              </div>
              
              <h1 className="text-4xl font-black text-foreground-primary uppercase tracking-[0.2em] leading-none mb-4">
                {error ? (t('notFound.routerCrash') || 'KEGAGALAN ROUTER') : (t('notFound.title') || 'KONEKSI NEURAL TERPUTUS')}
              </h1>
              <p className="text-xs text-foreground-tertiary font-black uppercase tracking-[0.3em] opacity-60 mb-12 max-w-md leading-relaxed">
                {error ? (t('notFound.routerDesc') || 'PROTOKOL ROUTING INTERNAL GAGAL MEMUAT MODUL NEURAL YANG DIMINTA.') : (t('notFound.desc') || 'JALUR YANG DIMINTA TIDAK DAPAT DISELESAIKAN OLEH GATEWAY AUDIT INTI.')}
              </p>
              
              <div className="w-full mb-12 premium-card !p-8 bg-bg-panel/40 border-border-primary/20 text-left relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-1 h-full bg-status-danger opacity-60 group-hover:h-full transition-all duration-700" />
                 
                {error ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-status-danger-text text-[10px] font-black uppercase tracking-[0.4em] border-b-2 border-status-danger-border/20 pb-4">
                      <Zap size={14} strokeWidth={3} className="animate-pulse" /> ERR_CRITICAL_FAILURE
                    </div>
                    <div className="font-mono text-xs font-black text-foreground-primary uppercase break-all leading-relaxed bg-bg-card/40 p-4 rounded-xl border border-border-primary/20 shadow-inner">
                      {error.message || error.statusText || (t('notFound.unknownViolation') || 'PELANGGARAN SISTEM TIDAK DIKENAL')}
                    </div>
                    {error.stack && (
                      <div className="mt-4 pt-4 border-t-2 border-border-primary/10 text-[9px] text-foreground-tertiary font-black uppercase tracking-widest opacity-40 max-h-[120px] overflow-auto no-scrollbar">
                        {error.stack}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-3 text-accent-cyan text-[10px] font-black uppercase tracking-[0.4em] border-b-2 border-accent-cyan/20 pb-4">
                      <Terminal size={14} strokeWidth={3} className="animate-pulse" /> SCAN_INCOMPLETE
                    </div>
                    <div className="font-mono text-xs font-black uppercase text-foreground-primary tracking-widest bg-bg-card/40 p-4 rounded-xl border border-border-primary/20 shadow-inner break-all">
                       TARGET_URI: {window.location.hash || window.location.pathname}
                    </div>
                    <div className="text-[9px] font-black text-foreground-tertiary uppercase tracking-[0.4em] opacity-40 pl-2">
                       CODE_HANDSHAKE: 0x404_NULL_REF
                    </div>
                  </div>
                )}
              </div>
              
              <Link 
                className="premium-button !px-12 !py-4 !text-[11px] !bg-accent-cyan !text-foreground-inverse !border-none !shadow-2xl shadow-accent-cyan/30"
                to="/"
              >
                <Home size={18} strokeWidth={2.5} className="mr-3" /> {(t('notFound.back') as string) || 'REBOOT KE BERANDA'}
              </Link>
            </div>
          </section>
        </StaggerItem>
      </StaggerGroup>
    </div>
  );
}
