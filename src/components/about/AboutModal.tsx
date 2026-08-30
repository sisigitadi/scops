import React from 'react';
import { Shield, LayoutDashboard, Zap, History, Globe, Info, Lock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useSettings } from '../../context/SettingsContext';
import { StaggerGroup, StaggerItem } from '../common/StaggerFadeIn';
import InfoTooltip from '../common/InfoTooltip';
import { Modal } from '../common/Modal';

/**
 * AboutModal — Documentation Portal
 * Mission-critical information interface visualizing the platform architecture, 
 * developer roadmap, and operational disclaimers.
 */

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const { t } = useLanguage();
  const { settings } = useSettings();
  
  const arch = t('about.architectureItems');
  const workflowStages = t('about.workflowStages');
  const featureFunctions = t('about.featureFunctions');

  const safeArch = Array.isArray(arch) ? arch : [];
  const safeWorkflow = Array.isArray(workflowStages) ? workflowStages : [];
  const safeFeatures = Array.isArray(featureFunctions) ? featureFunctions : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={(t('nav.about') as string) || 'TENTANG'} maxWidth="max-w-6xl">
      <StaggerGroup className="space-y-10 pb-12" delay={0.1} stagger={0.1}>
        <StaggerItem>
          <section className="premium-capsule relative overflow-hidden p-10 shadow-2xl transition-all shine">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-cyan/10 rounded-full blur-[100px] -mr-32 -mt-32" />
            <div className="relative z-10 flex flex-col items-start gap-8 lg:flex-row lg:items-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] border-2 border-accent-cyan/30 bg-accent-cyan/10 shadow-xl floating">
                <Shield size={48} className="text-accent-cyan" />
              </div>
              <div className="min-w-0">
                <h1 className="text-3xl sm:text-5xl font-black tracking-[0.2em] text-foreground-primary uppercase leading-tight">
                  {(t('nav.about') as string) || 'ABOUT'}
                </h1>
                <p className="mt-6 max-w-2xl text-lg text-foreground-secondary font-bold leading-relaxed opacity-90 uppercase tracking-wide">
                  {(t('about.desc') as string) || 'Advanced Security Operations Center Ecosystem for unified monitoring and incident response.'}
                </p>
              </div>
            </div>
          </section>
        </StaggerItem>

        <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
          <div className="space-y-10">
            <div className="grid gap-10 sm:grid-cols-2">
              <StaggerItem>
                <article className="premium-card group rounded-[2.5rem] border border-border-primary/20 bg-bg-card/40 p-10 transition-all shadow-xl backdrop-blur-md">
                  <div className="mb-8 flex items-center gap-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-cyan/10 text-accent-cyan border-2 border-accent-cyan/20">
                      <LayoutDashboard size={24} />
                    </div>
                    <h3 className="text-lg font-black text-foreground-primary uppercase tracking-[0.2em]">{(t('about.architecture') as string) || 'Architecture'}</h3>
                  </div>
                  <ul className="space-y-6">
                    {safeArch.map((item: string, id: number) => (
                      <li key={id} className="flex items-center gap-4 text-sm text-foreground-secondary font-black uppercase tracking-widest">
                        <div className="h-2 w-2 rounded-full bg-accent-cyan shadow-[0_0_10px_rgba(34,211,238,0.6)] shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              </StaggerItem>

              <StaggerItem>
                <article className="premium-card group rounded-[2.5rem] border border-border-primary/20 bg-bg-card/40 p-10 transition-all shadow-xl backdrop-blur-md">
                  <div className="mb-8 flex items-center gap-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-purple/10 text-accent-purple border-2 border-accent-purple/20">
                      <Zap size={24} />
                    </div>
                    <h3 className="text-lg font-black text-foreground-primary uppercase tracking-[0.2em]">{(t('about.featureFunctionsTitle') as string) || 'Capabilities'}</h3>
                  </div>
                  <ul className="space-y-6">
                    {safeFeatures.map((item: string, id: number) => (
                      <li key={id} className="flex items-center gap-4 text-sm text-foreground-secondary font-black uppercase tracking-widest">
                        <div className="h-2 w-2 rounded-full bg-accent-purple shadow-[0_0_10px_rgba(168,85,247,0.6)] shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              </StaggerItem>
            </div>

            <StaggerItem>
              <section className="premium-card rounded-[2.5rem] border-2 border-border-primary/20 bg-bg-card/40 p-10 shadow-xl border-l-[12px] border-l-status-warning-border backdrop-blur-md">
                <div className="mb-8 flex items-center gap-5">
                  <History size={28} className="text-status-warning-text" />
                  <h3 className="text-xl font-black text-foreground-primary uppercase tracking-[0.2em]">{(t('about.workflow') as string) || 'Standard Operating Procedure'}</h3>
                  <InfoTooltip text={(t('tooltips.aboutSopWorkflow') as string) || 'Operating cycle'} />
                </div>
                <div className="relative rounded-2xl border-2 border-border-primary/20 bg-bg-panel/60 p-8 text-sm font-black tracking-[0.1em] text-foreground-primary shadow-inner">
                   {(t('about.workflowPath') as string) || 'Triage -> Investigate -> Escalate/Close.'}
                </div>
              </section>
            </StaggerItem>
          </div>

          <StaggerItem>
            <section className="premium-card rounded-[3rem] border-2 border-border-primary/20 bg-bg-card/40 p-10 shadow-2xl h-full backdrop-blur-md">
               <div className="mb-10 flex items-center gap-5">
                  <Globe size={28} className="text-accent-cyan" />
                  <h3 className="text-xl font-black text-foreground-primary uppercase tracking-[0.2em]">{(t('about.workflowStagesTitle') as string) || 'Development Phases'}</h3>
               </div>
               
               <div className="relative space-y-10 pl-8 before:absolute before:left-[15px] before:top-3 before:h-[calc(100%-1.5rem)] before:w-1 before:bg-gradient-to-b before:from-accent-cyan before:to-transparent">
                 {safeWorkflow.map((phase: any, idx: number) => (
                   <div key={idx} className="relative group">
                     <div className="absolute -left-[24px] top-2 h-5 w-5 rounded-full border-2 border-accent-cyan bg-bg-card shadow-lg group-hover:scale-125 transition-transform" />
                     <div className="pl-4">
                       <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-accent-cyan mb-2.5">{phase.label}</h4>
                       <p className="text-[13px] font-bold leading-relaxed text-foreground-secondary opacity-90 uppercase">{phase.desc}</p>
                     </div>
                   </div>
                 ))}
               </div>

               <div className="mt-12 rounded-[2rem] border-2 border-accent-cyan/30 bg-accent-cyan/5 p-8 shadow-xl">
                  <div className="mb-6 flex items-center gap-4 text-accent-cyan">
                    <Info size={20} />
                    <span className="text-[12px] font-black uppercase tracking-[0.4em]">{(t('about.platformStatus') as string)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-foreground-secondary font-black uppercase tracking-[0.3em]">
                     <span className="opacity-70">{(t('about.coreEngine') as string)}</span>
                     <span className="bg-accent-cyan text-background-main px-3 py-1 rounded-lg font-black">V17.0.0 HV</span>
                  </div>
               </div>
            </section>
          </StaggerItem>
        </div>

        <StaggerItem>
          <section className="premium-card flex items-start gap-8 rounded-[2.5rem] border-2 border-status-danger-border/40 bg-status-danger-bg/20 p-10 shadow-2xl transition-all shine backdrop-blur-md">
             <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-status-danger-border bg-status-danger-bg/40 text-status-danger-text shadow-xl floating">
                <Lock size={32} />
             </div>
             <div className="min-w-0">
                <h4 className="text-lg font-black text-status-danger-text uppercase tracking-[0.2em] mb-4">{(t('about.disclaimerTitle') as string) || 'Legal Disclosure'}</h4>
                <p className="text-sm font-black leading-relaxed text-foreground-primary opacity-100 uppercase tracking-widest">
                   {(t('about.disclaimer') as string) || 'Unauthorized access logged by system integrity engine.'}
                </p>
             </div>
          </section>
        </StaggerItem>
        
        <StaggerItem>
          <div className="flex flex-col items-center justify-center gap-6 pt-8">
            <div className="h-[2px] w-64 bg-gradient-to-r from-transparent via-border-primary to-transparent opacity-40" />
            <span className="text-[12px] font-black uppercase tracking-[0.8em] text-foreground-muted">
               {settings.appName} | {(t('about.securityEcosystem') as string)}
            </span>
          </div>
        </StaggerItem>
      </StaggerGroup>
    </Modal>
  );
}
