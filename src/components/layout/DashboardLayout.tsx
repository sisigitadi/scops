import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import AppSidebar from '../navigation/AppSidebar';
import AppTopbar from '../navigation/AppTopbar';
import AppFooter from '../navigation/AppFooter';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import ShiftGuardModal from '../management/ShiftGuardModal';
import PWAInstallPrompt from '../common/PWAInstallPrompt';
import { useSocket } from '../../context/SocketContext';

/**
 * DashboardLayout — Core Operational Framework
 * Primary layout harness for the SOCOps ecosystem, handling global state synchronization, 
 * real-time presence tracking, and duty enforcement protocols.
 */

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const { isLanguageTransitioning, t } = useLanguage();
  const { isThemeTransitioning } = useTheme();
  const { updatePresence, connected } = useSocket();
  
  const [forceShiftModal, setForceShiftModal] = useState(false);
  

  // Global Dynamic Cursor Tracking for Advanced Visual Effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Real-time Presence Synchronization Plane
  useEffect(() => {
    if (!connected) return;
    
    // Mission Control Navigation Labels
    const path = location.pathname;
    let pageLabel = 'OPERATIONAL GATE';
    
    if (path.includes('/alerts')) pageLabel = (t('alerts.title') as string) || 'Alert Register';
    else if (path.includes('/triage')) pageLabel = (t('triage.title') as string) || 'Triage Workspace';
    else if (path.includes('/reports')) pageLabel = (t('reports.title') as string) || 'Reports Center';
    else if (path.includes('/management')) pageLabel = (t('management.title') as string) || 'Management Hub';
    else if (path.includes('/settings')) pageLabel = (t('settings.title') as string) || 'Control Center';
    else if (path.includes('/false-positive')) pageLabel = (t('fp.title') as string) || 'FP Archives';
    else if (path === '/app') pageLabel = (t('dashboard.title') as string) || 'Security Overview';
    
    updatePresence(pageLabel);
  }, [location.pathname, connected, updatePresence, t]);

  return (
    <div className={`h-screen overflow-hidden bg-background-main transition-colors duration-300 ${isThemeTransitioning ? 'theme-switching' : ''}`}>
      <div className="mx-auto flex h-full max-w-[100vw] 3xl:max-w-[1920px] 4xl:max-w-[2560px] 5xl:max-w-full relative overflow-hidden">
        
        {/* Sovereign Sidebar Control */}
        <AppSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          onOpenExitProtocol={() => setForceShiftModal(true)}
        />

        <div className="flex min-w-0 flex-1 flex-col h-full bg-background-main">
          {/* Tactical Command Bridge */}
          <AppTopbar 
            onOpenSidebar={() => setIsSidebarOpen(true)} 
            onOpenExitProtocol={() => setForceShiftModal(true)} 
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-10 lg:px-14 overflow-y-auto pb-10 flex flex-col no-scrollbar">
            <div className="mx-auto w-full 3xl:max-w-[1600px] 4xl:max-w-[2200px] 5xl:max-w-full layout-container flex-1">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={location.pathname}
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduceMotion ? {} : { opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'linear' }}
                  className={isLanguageTransitioning ? 'ui-lang-transition' : undefined}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </div>
            
            <AppFooter />
          </main>
        </div>
      </div>
      
      <ShiftGuardModal 
        forceOpen={forceShiftModal} 
        onClose={() => setForceShiftModal(false)} 
      />

      <PWAInstallPrompt />

    </div>
  );
}
