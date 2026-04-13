import React, { useState, useEffect, ReactElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, Target, Shield, Activity, BarChart3, Settings, Database } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * OnboardingOverlay — Operational Induction Portal
 * Orchestrated induction sequence designed to familiarize analysts 
 * with the forensic ecosystem modules and tactical workflows.
 */

interface DemoStep {
  icon: ReactElement;
  key: string;
  target: string;
}

const demoSteps: DemoStep[] = [
  {
    icon: <BarChart3 className="text-accent-cyan" />,
    key: 'dashboard',
    target: 'Dashboard Security Overview'
  },
  {
    icon: <Shield className="text-accent-indigo" />,
    key: 'alerts',
    target: 'Alert Register & Forensic Grid'
  },
  {
    icon: <Target className="text-status-danger-text" />,
    key: 'triage',
    target: 'Triage & Playbook Workspace'
  },
  {
    icon: <Activity className="text-status-success-text" />,
    key: 'management',
    target: 'Management Hub & Governance'
  },
  {
    icon: <Settings className="text-foreground-primary" />,
    key: 'settings',
    target: 'Pusat Kendali (Control Center)'
  },
  {
    icon: <Database className="text-accent-purple" />,
    key: 'forensic',
    target: 'Forensic Audit Hub'
  }
];

interface OnboardingOverlayProps {
  onComplete: () => void;
}

export default function OnboardingOverlay({ onComplete }: OnboardingOverlayProps) {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show after a small delay for dramatic effect
    const timer = setTimeout(() => setIsVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleComplete();
    };
    if (isVisible) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible]);

  const handleNext = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(onComplete, 500);
  };

  const step = demoSteps[currentStep];

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-background-main/40 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-xl bg-bg-card border-2 border-border-primary/60 rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden relative"
          >
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-bg-panel/20">
              <motion.div 
                className="h-full bg-accent-cyan shadow-[0_0_15px_rgba(8,145,178,0.5)]"
                initial={{ width: '0%' }}
                animate={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
              />
            </div>

            <div className="p-10 pt-14">
              <div className="flex justify-between items-start mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan shadow-xl">
                    {React.cloneElement(step.icon, { size: 32, strokeWidth: 2.5 })}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-cyan mb-1">DEMO ONBOARDING • STEP {currentStep + 1}/{demoSteps.length}</p>
                    <h2 className="text-2xl font-black text-foreground-primary uppercase tracking-tighter">{step.target}</h2>
                  </div>
                </div>
                <button 
                  onClick={handleComplete}
                  className="p-2 hover:bg-bg-panel rounded-xl text-foreground-muted transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <p className="text-lg font-bold text-foreground-secondary leading-relaxed uppercase tracking-tight">
                  {(t(`onboarding.${step.key}.title`) as string) || 'Experience true SOC accountability.'}
                </p>
                <p className="text-sm font-medium text-foreground-muted leading-relaxed">
                  {(t(`onboarding.${step.key}.desc`) as string) || 'Integrate with real data but in a safe environment.'}
                </p>
              </div>

              <div className="mt-14 flex items-center justify-between gap-4">
                <div className="flex gap-2">
                  <button 
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2 px-6 py-4 rounded-2xl border border-border-primary font-bold text-[11px] uppercase tracking-widest text-foreground-muted hover:bg-bg-panel disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft size={16} /> {(t('onboarding.btnBack') as string) || 'Previous'}
                  </button>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={handleComplete}
                    className="px-6 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest text-foreground-muted hover:text-foreground-primary transition-colors"
                  >
                    {(t('onboarding.btnSkip') as string) || 'Skip Tour'}
                  </button>
                  <button 
                    onClick={handleNext}
                    className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-accent-cyan font-bold text-[11px] uppercase tracking-widest text-white shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    {currentStep === demoSteps.length - 1 ? ((t('onboarding.btnFinish') as string) || 'Launch System') : ((t('onboarding.btnNext') as string) || 'Next Step')}
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-accent-cyan/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
