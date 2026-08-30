import React from 'react';
import { Shield, LayoutDashboard, History, Globe, Cpu, Target, Lock, Zap, Boxes } from 'lucide-react';
import InfoTooltip from '../components/common/InfoTooltip';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { StaggerGroup, StaggerItem } from '../components/common/StaggerFadeIn';

/**
 * AboutPage — Platform Core Specification
 * Clinical documentation of the tactical command center architecture, workflow protocols, and regulatory compliance.
 */

export default function AboutPage() {
  const { t } = useLanguage();
  const { settings } = useSettings();
  
  const arch = (t('about_core.architectureItems') as string[]) || [];
  const workflowStages = (t('about_core.workflowStages') as { label: string; desc: string }[]) || [];
  const featureFunctions = (t('about_core.featureFunctions') as string[]) || [];

  return (
    <StaggerGroup className="space-y-8 pb-10" delay={0.1} stagger={0.1}>
      <StaggerItem>
        <section className="premium-capsule p-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[2rem] border-2 border-accent-cyan/30 bg-accent-cyan/10 shadow-2xl floating">
              <Shield size={48} strokeWidth={2.5} className="text-accent-cyan" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-foreground-primary uppercase tracking-[0.2em] leading-none mb-6">
                {t('about_core.title')}
              </h1>
              <p className="max-w-3xl text-base text-foreground-secondary font-medium leading-relaxed opacity-90">
                {t('about_core.desc')}
              </p>
            </div>
          </div>
        </section>
      </StaggerItem>

      <div className="grid gap-8 lg:grid-cols-12 relative z-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="grid gap-8 sm:grid-cols-2">
            <StaggerItem>
              <article className="premium-capsule p-8 h-full shadow-inner-lg">
                <div className="mb-8 flex items-center gap-4 relative z-10 border-b-2 border-border-primary/20 pb-6">
                  <div className="p-2.5 rounded-xl bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
                    <LayoutDashboard size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-sm font-bold text-foreground-primary uppercase tracking-[0.2em]">{t('about_core.architecture')}</h3>
                </div>
                <ul className="space-y-4 relative z-10">
                  {arch.map((item, id) => (
                    <li key={id} className="premium-card !p-4 !rounded-xl bg-bg-panel/10 hover:bg-bg-panel/30 border-border-primary/10 flex items-center gap-4 group transition-all">
                      <div className="h-2 w-2 rounded-full bg-accent-cyan shadow-[0_0_8px_currentColor] shrink-0" />
                      <span className="text-[13px] text-foreground-secondary font-bold group-hover:text-foreground-primary transition-colors">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            </StaggerItem>

            <StaggerItem>
              <article className="premium-capsule p-8 h-full shadow-inner-lg">
                <div className="mb-8 flex items-center gap-4 relative z-10 border-b-2 border-border-primary/20 pb-6">
                  <div className="p-2.5 rounded-xl bg-accent-purple/10 text-accent-purple border border-accent-purple/20">
                    <Zap size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-sm font-bold text-foreground-primary uppercase tracking-[0.2em]">{t('about_core.featureFunctionsTitle')}</h3>
                </div>
                <ul className="space-y-4 relative z-10">
                  {featureFunctions.map((item, id) => (
                    <li key={id} className="premium-card !p-4 !rounded-xl bg-bg-panel/10 hover:bg-bg-panel/30 border-border-primary/10 flex items-center gap-4 group transition-all">
                      <div className="h-2 w-2 rounded-full bg-accent-purple shadow-[0_0_8px_currentColor] shrink-0" />
                      <span className="text-[13px] text-foreground-secondary font-bold group-hover:text-foreground-primary transition-colors">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            </StaggerItem>
          </div>

          <StaggerItem>
            <section className="premium-capsule p-8 shadow-inner-lg">
              <div className="mb-8 flex items-center gap-4 relative z-10 border-b-2 border-border-primary/20 pb-6">
                <div className="p-2.5 rounded-xl bg-status-warning-bg/20 text-status-warning-text border border-status-warning-border/30">
                  <History size={20} strokeWidth={2.5} />
                </div>
                <h3 className="text-sm font-bold text-foreground-primary uppercase tracking-[0.2em]">{t('about_core.workflow')}</h3>
                <InfoTooltip text={(t('tooltips.aboutSopWorkflow') as string)} />
              </div>
              <div className="relative premium-card !p-8 bg-bg-panel/40 border-border-primary/20 text-base font-bold leading-relaxed text-foreground-primary tracking-wide shadow-inner relative z-10">
                 <div className="absolute left-0 top-0 h-full w-2 bg-status-warning-text opacity-40 shadow-[0_0_15px_currentColor]" />
                 {t('about_core.workflowPath')}
              </div>
            </section>
          </StaggerItem>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <StaggerItem>
            <section className="premium-capsule p-8 h-full shadow-inner-lg">
               <div className="mb-10 flex items-center gap-4 relative z-10 border-b-2 border-border-primary/20 pb-6">
                  <div className="p-2.5 rounded-xl bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
                    <Globe size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-sm font-bold text-foreground-primary uppercase tracking-[0.2em]">{t('about_core.workflowStagesTitle')}</h3>
               </div>
               
               <div className="relative space-y-10 pl-8 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-1rem)] before:w-1 before:bg-border-primary/10 relative z-10">
                 {workflowStages.map((phase, idx) => (
                   <div key={idx} className="relative group">
                     <div className="absolute -left-[23px] top-1 h-5 w-5 rounded-lg border-2 border-accent-cyan bg-bg-card shadow-[0_0_10px_rgba(8,145,178,0.3)] flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                     </div>
                     <div className="pl-2">
                       <h4 className="text-[11px] font-bold uppercase tracking-widest text-accent-cyan mb-2 group-hover:tracking-[0.4em] transition-all">{phase.label}</h4>
                       <p className="text-[12px] font-medium leading-relaxed text-foreground-tertiary opacity-90 group-hover:opacity-100 transition-opacity">{phase.desc}</p>
                     </div>
                   </div>
                 ))}
               </div>

               <div className="mt-12 premium-card !p-6 bg-accent-cyan/5 border-accent-cyan/20 shadow-inner relative z-10">
                  <div className="mb-4 flex items-center gap-3 text-accent-cyan">
                    <Cpu size={18} strokeWidth={2.5} />
                    <span className="text-[11px] font-black uppercase tracking-[0.4em]">{t('about_core.systemCore')}</span>
                  </div>
                  <div className="flex items-center justify-between text-[12px] text-foreground-tertiary font-bold uppercase tracking-widest border-t border-accent-cyan/10 pt-4">
                     <span className="opacity-40">{t('about_core.versionStack')}</span>
                     <span className="text-accent-cyan font-black tracking-[0.2em]">V5.7.0X-ULTRA</span>
                  </div>
               </div>
            </section>
          </StaggerItem>
        </div>
      </div>

      <StaggerItem>
        <section className="premium-capsule p-8 flex items-start gap-8 bg-status-danger-bg/5 border-status-danger-border/20 shadow-inner group">
           <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-4 border-status-danger-border/30 bg-bg-panel text-status-danger-text shadow-2xl floating transition-transform group-hover:scale-110">
              <Lock size={24} strokeWidth={3} />
           </div>
           <div className="pt-2">
              <h4 className="text-sm font-black text-status-danger-text uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                 <Boxes size={18} /> {t('about_core.disclaimerTitle')}
              </h4>
              <p className="text-[13px] font-bold leading-relaxed text-foreground-primary opacity-100 max-w-4xl">
                 {t('about_core.disclaimer')}
              </p>
           </div>
        </section>
      </StaggerItem>
      
      <StaggerItem>
        <div className="flex flex-col items-center justify-center gap-6 pt-16 opacity-40">
          <div className="h-px w-64 bg-gradient-to-r from-transparent via-border-primary to-transparent" />
          <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.6em] text-foreground-tertiary">
             <Target size={14} className="opacity-60" />
             {settings.appName} | {settings.orgName}
          </div>
        </div>
      </StaggerItem>
    </StaggerGroup>
  );
}
