import React, { useState } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { 
  Menu, 
  Shield, Sun, Moon,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth, ROLES } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useAlertData } from '../../context/AlertDataContext';
import { useTheme } from '../../context/ThemeContext';
import { useOperations } from '../../context/OperationsContext';
import SystemTelemetry, { IndicatorTooltip } from './topbar/SystemTelemetry';

/**
 * AppTopbar — The primary tactical heads-up display.
 * High-performance navigation bridge with real-time shift sync and identity hardening.
 */

interface AppTopbarProps {
  onOpenSidebar: () => void;
  onOpenExitProtocol: () => void;
}

export default function AppTopbar({ onOpenSidebar, onOpenExitProtocol }: AppTopbarProps) {
  const { language, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, appBasePath } = useAuth();
  const { settings, liveMetrics } = useSettings();
  const { activeTeam, shiftConfig } = useOperations();
  const location = useLocation();
  
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  
  // Reactive Identity Logic
  const registryUser = settings?.users?.find(u => {
    if (u.id && user?.id && u.id === user?.id) return true;
    if (u.email && user?.email && u.email.toLowerCase() === user?.email.toLowerCase()) return true;
    return false;
  });
  
  const displayName = user?.role === ROLES.DEMO 
    ? ((t('common.demoOperator') as string) || 'Demo')
    : (registryUser?.name || user?.name || user?.email?.split('@')[0] || t('common.unknownUser'));

  const currentShift = (() => {
    if (!shiftConfig) return null;
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    for (const [id, shift] of Object.entries(shiftConfig)) {
      const [sH, sM] = shift.start.split(':').map(Number);
      const [eH, eM] = shift.end.split(':').map(Number);
      const start = sH * 60 + sM;
      const end = eH * 60 + eM;
      
      if (start < end) {
        if (currentTime >= start && currentTime < end) return { ...shift, id };
      } else {
        if (currentTime >= start || currentTime < end) return { ...shift, id };
      }
    }
    return null;
  })();

  const brandName = settings?.orgName || "SECURITY";
  const pathnames = location.pathname.split('/').filter((x) => x && x !== 'app' && x !== 'demo');

  return (
    <header className="h-20 border-b border-border-primary/40 bg-bg-main/80 backdrop-blur-xl sticky top-0 z-[100] transition-all">
      <div className="max-w-[1920px] mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6">
             <div className="relative">
                <button 
                  onClick={onOpenSidebar}
                  className="lg:hidden p-2 rounded-xl bg-bg-panel border border-border-primary/40 text-foreground-primary hover:bg-bg-card transition-all"
                >
                  <Menu size={20} />
                </button>

                {/* Tactical Menu Hint - Only on mobile, pulses persistently */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ 
                    opacity: 1,
                    y: [15, 5, 15]
                  }}
                  transition={{ 
                    opacity: { duration: 1 },
                    y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="lg:hidden absolute left-1/2 -top-10 -translate-x-1/2 flex flex-col items-center pointer-events-none z-[200] whitespace-nowrap"
                >
                  <div className="flex flex-col items-center">
                    <div className="bg-bg-panel/95 border border-accent-cyan/40 rounded-lg py-1.5 px-3 backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                      <span className="text-[8px] font-black text-accent-cyan tracking-[0.4em] uppercase">{t('nav.menu') || 'MENU'}</span>
                    </div>
                    {/* Downward pointing arrow */}
                    <motion.div 
                      animate={{ y: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="mt-1 flex flex-col items-center"
                    >
                      <div className="w-px h-3 bg-accent-cyan/60" />
                      <div className="w-1.5 h-1.5 border-r border-b border-accent-cyan rotate-45 -mt-1" />
                    </motion.div>
                  </div>
                </motion.div>
             </div>
             
             <div className="flex items-center gap-4">
                <Link to={appBasePath} className="flex items-center gap-3 group">
                   <div className="p-2.5 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 group-hover:bg-accent-cyan/20 transition-all shadow-lg shadow-accent-cyan/5">
                      <Shield size={24} className="text-accent-cyan" strokeWidth={2.5} />
                   </div>
                     <div className="flex flex-col min-w-[120px] sm:min-w-[200px]">
                        <span className="text-xs sm:text-sm font-black tracking-[0.2em] text-foreground-primary leading-none uppercase">{brandName}</span>
                        <div className="hidden sm:flex items-center gap-1.5 mt-1.5 opacity-60">
                           <span className="text-[8px] font-black tracking-widest text-foreground-tertiary uppercase">{t('topbar.dashboard')}</span>
                           <span className="text-[7px] text-foreground-tertiary/40">•</span>
                           <span className="text-[8px] font-black tracking-widest text-accent-cyan uppercase">
                              {pathnames.length > 0 ? t(`nav.${pathnames[pathnames.length-1]}`) : t('nav.landing')}
                           </span>
                        </div>
                     </div>
                </Link>
             </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
             <SystemTelemetry />
             
             <div className="h-8 w-px bg-border-primary/40 mx-1 hidden sm:block" />

             <IndicatorTooltip 
                panel={(t('ops.shiftGuard.actionFinalize') as any)}
                visible={activeTooltip === 'exit'}
                onEnter={() => setActiveTooltip('exit')}
                onLeave={() => setActiveTooltip(null)}
              >
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={onOpenExitProtocol}
                  className="p-3 sm:p-3.5 rounded-xl bg-status-danger/10 text-status-danger-text border border-status-danger/20 hover:bg-status-danger/20 transition-all group/exit shadow-lg shadow-status-danger/5"
                >
                   <LogOut size={18} strokeWidth={2.5} className="group-hover/exit:scale-110 transition-transform sm:size-[20px]" />
                </motion.button>
              </IndicatorTooltip>
          </div>
      </div>
    </header>
  );
}
