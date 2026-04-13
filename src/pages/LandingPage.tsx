import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Terminal, Activity } from 'lucide-react';
import { ROLES, useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { StaggerGroup, StaggerItem } from '../components/common/StaggerFadeIn';

/**
 * LandingPage — Entryway to the SOC Operations Platform
 * A high-aesthetics portal providing mission overview and one-click demo access with strict theme and language synchronization.
 */

interface FooterTooltipProps {
  children: React.ReactNode;
  title: string;
  visible: boolean;
  onEnter: () => void;
  onLeave: () => void;
}

function FooterTooltip({ children, title, visible, onEnter, onLeave }: FooterTooltipProps) {
  return (
    <div className="relative" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -5 }}
            className="absolute bottom-full z-[500] mb-6 origin-bottom left-1/2 -translate-x-1/2"
          >
            <div className="rounded-xl border border-border-primary bg-bg-panel/90 backdrop-blur-xl px-4 py-2 shadow-2xl relative overflow-visible whitespace-nowrap">
               <div className="relative z-10 text-[9px] font-black uppercase tracking-widest text-foreground-primary">
                 {title}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LandingPage() {
  const { language, toggleLanguage, isLanguageTransitioning, t } = useLanguage();
  const { theme, toggleTheme, isThemeTransitioning } = useTheme();
  const { login } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  // AUTO-DEMO PIPELINE: Bypass landing page if in demo environment
  React.useEffect(() => {
    const isEnvDemo = import.meta.env.VITE_APP_ENV === 'demo';
    if (isEnvDemo) {
      handleDemoAccess();
    }
  }, []);
  
  const features = t('landing.features');
  const workflow = t('landing.workflow');
  const safeFeatures = Array.isArray(features) ? features : [];
  const safeWorkflow = Array.isArray(workflow) ? workflow : [];

  const quickStats = [
    { label: t('topbar.stats.portal'), value: '24/7' },
    { label: t('topbar.stats.threats'), value: 'LIVE' },
    { label: t('topbar.stats.logs'), value: 'DBX' }
  ];

  const containerVars = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, staggerChildren: 0.1 } }
  };

  const handleDemoAccess = () => {
    login({
      id: 'demo-access',
      name: (t('auth.personas.demo.name') as string),
      role: ROLES.DEMO
    });
    sessionStorage.setItem('socops_demo_mode', '1');
    navigate('/app', { replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 relative overflow-hidden bg-background-main transition-colors duration-500">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-cyan/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-indigo/5 rounded-full blur-[100px] pointer-events-none" />

      <StaggerGroup
        variants={containerVars}
        className={`premium-capsule !bg-bg-panel/40 !rounded-[3rem] w-full max-w-6xl p-10 sm:p-14 transition-all duration-300 ${isLanguageTransitioning ? 'ui-lang-transition' : ''} ${isThemeTransitioning ? 'theme-switching' : ''}`}
      >
        <StaggerItem className="flex items-center justify-end gap-3 mb-10">
          <div className="flex items-center gap-3 bg-bg-panel/20 p-2 rounded-2xl border border-border-primary/20">
            <motion.button whileTap={{ scale: 0.8 }} onClick={toggleTheme} className="w-11 h-11 flex items-center justify-center rounded-xl bg-bg-card shadow-sm border border-transparent hover:border-accent-cyan/30 text-foreground-primary">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>
            <motion.button whileTap={{ scale: 0.8 }} onClick={toggleLanguage} className="w-13 h-11 flex items-center justify-center rounded-xl bg-bg-card shadow-sm border border-transparent hover:border-accent-cyan/30 px-3">
              <span className="text-[10px] font-black uppercase tracking-widest">{language === 'id' ? 'EN' : 'ID'}</span>
            </motion.button>
          </div>
        </StaggerItem>

        <StaggerItem className="grid gap-12 lg:grid-cols-[1fr_300px]">
          <div className="flex flex-col sm:flex-row items-start gap-8">
            <div className="relative group shrink-0">
              <div className="absolute inset-0 bg-accent-cyan/20 blur-2xl group-hover:bg-accent-cyan/40 transition-all" />
              <img
                src={settings.appLogo || `${import.meta.env.BASE_URL}logo.png`}
                alt="Logo"
                className="relative z-10 h-24 w-24 rounded-3xl border-2 border-border-primary/60 bg-slate-900 p-3 object-contain shadow-2xl floating"
              />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-cyan mb-2 font-black">{t('landing.badge')}</p>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-foreground-primary uppercase leading-tight leading-none">{settings.appName}</h1>
              <p className="mt-6 max-w-2xl text-lg sm:text-xl font-black uppercase tracking-tighter text-foreground-secondary opacity-60 leading-relaxed font-black">{t('about.desc')}</p>
            </div>
          </div>

          <div className="grid gap-4">
            {quickStats.map((item) => (
              <div key={item.label} className="premium-card !p-5 !rounded-2xl border-border-primary/20 bg-bg-panel/10 group hover:scale-105 active:scale-95 transition-all">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground-tertiary mb-1 group-hover:text-accent-cyan transition-colors font-black">{item.label}</p>
                <p className="text-2xl font-black text-foreground-primary tracking-widest uppercase font-black">{item.value}</p>
              </div>
            ))}
          </div>
        </StaggerItem>

        <StaggerItem className="mt-14 flex flex-wrap gap-5">
          <Link to="/login" className="premium-button !bg-accent-cyan !text-foreground-inverse !border-none !rounded-2xl !px-12 !py-5 !text-[12px] shadow-cyan-500/20 shadow-xl font-black tracking-widest uppercase">
            {t('buttons.openDashboard')}
          </Link>
          <button
            onClick={handleDemoAccess}
            className="premium-button !rounded-2xl !px-12 !py-5 !text-[12px] !border-border-primary/20 font-black tracking-widest uppercase"
          >
            {t('login.demoButton')}
          </button>
        </StaggerItem>

        <StaggerGroup className="grid gap-8 border-t border-border-primary/20 pt-14 mt-14 md:grid-cols-2" delay={0.4}>
          <StaggerItem className="premium-capsule !p-8 !rounded-[2.5rem] bg-bg-panel/5 border-border-primary/20">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-cyan/10 font-bold text-accent-cyan border border-accent-cyan/10">01</div>
              <h2 className="text-xl font-black text-foreground-primary uppercase tracking-widest font-black">{t('landing.featuresTitle')}</h2>
            </div>
            <ul className="space-y-4">
              {(safeFeatures as string[]).map((item) => (
                <li key={item} className="flex items-start gap-4 text-[11px] font-black uppercase tracking-tighter text-foreground-secondary font-black">
                  <span className="text-accent-cyan mt-1 inline-block h-1.5 w-1.5 rounded-full bg-accent-cyan shadow-[0_0_8px_rgba(8,145,178,0.5)]" /> {item}
                </li>
              ))}
            </ul>
          </StaggerItem>

          <StaggerItem className="premium-capsule !p-8 !rounded-[2.5rem] bg-bg-panel/5 border-border-primary/20">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 font-bold text-indigo-500 border border-indigo-500/10">02</div>
              <h2 className="text-xl font-black text-foreground-primary uppercase tracking-widest font-black">{t('landing.workflowTitle')}</h2>
            </div>
            <ul className="space-y-4">
              {(safeWorkflow as string[]).map((item) => (
                <li key={item} className="flex items-start gap-4 text-[11px] font-black uppercase tracking-tighter text-foreground-secondary font-black">
                  <span className="text-indigo-500 mt-1 inline-block h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" /> {item}
                </li>
              ))}
            </ul>
          </StaggerItem>
        </StaggerGroup>

        <StaggerItem className="mt-12 flex items-start gap-5 p-8 rounded-3xl border border-status-warning-border/20 bg-status-warning-bg/5 backdrop-blur-md">
          <Activity size={24} className="text-amber-500 shrink-0" />
          <p className="text-[10px] font-black uppercase tracking-widest text-status-warning-text leading-loose font-black">
            <strong className="text-amber-600 block mb-2 text-xs">PLATFORM DISCLAMER:</strong> {t('landing.disclaimerText')}
          </p>
        </StaggerItem>
      </StaggerGroup>

      {/* Footer Branding Dock */}
      <div className="fixed bottom-8 flex items-center gap-6 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
         <span>{settings.appName} v11.7.0</span>
         <div className="h-4 w-px bg-foreground-tertiary opacity-30" />
         
         <FooterTooltip visible={hoveredIcon === 'gh'} onEnter={() => setHoveredIcon('gh')} onLeave={() => setHoveredIcon(null)} title="Github">
            <a href="https://github.com/sisigitadi" target="_blank" rel="noopener noreferrer" className="hover:text-accent-cyan transition-colors">
               <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                 <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
               </svg>
            </a>
         </FooterTooltip>

         <FooterTooltip visible={hoveredIcon === 'li'} onEnter={() => setHoveredIcon('li')} onLeave={() => setHoveredIcon(null)} title="LinkedIn">
            <a href="https://www.linkedin.com/in/sigitadi/" target="_blank" rel="noopener noreferrer" className="hover:text-accent-cyan transition-colors">
               <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                 <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-1.337-.025-3.041-1.854-3.041-1.854 0-2.139 1.448-2.139 2.943v5.702h-3v-11h2.882v1.503h.04c.401-.759 1.381-1.56 2.839-1.56 3.039 0 3.593 2.001 3.593 4.603v6.454z"/>
               </svg>
            </a>
         </FooterTooltip>

         <FooterTooltip visible={hoveredIcon === 'mail'} onEnter={() => setHoveredIcon('mail')} onLeave={() => setHoveredIcon(null)} title="Email">
            <a href="mailto:si.sigitadi@gmail.com" className="hover:text-accent-cyan transition-colors">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                 <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                 <polyline points="22,6 12,13 2,6"/>
               </svg>
            </a>
         </FooterTooltip>
      </div>
    </main>
  );
}
