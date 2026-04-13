import React, { useEffect, ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, LayoutDashboard, Bell, FileSearch, BarChart3, 
  Shield, ShieldOff, Settings, Database, Activity, 
  Sun, Moon, Globe 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { CAPABILITIES, useAuth, ROLES } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';
import { useOperations } from '../../context/OperationsContext';
import { useSocket } from '../../context/SocketContext';
import { StaggerGroup, StaggerItem } from '../common/StaggerFadeIn';

/**
 * AppSidebar — Sovereign Spectrum Navigation
 * Hierarchical navigation framework designed for the NIST/MITRE operational 
 * workflow, enforcing strict role-based vertical isolation of tactical modules.
 */

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenExitProtocol: () => void;
}

interface NavItem {
  type?: 'header';
  label: string;
  to?: string;
  icon?: ReactNode;
  requiresCapability?: string;
  requiresRoles?: string[];
  end?: boolean;
}

export default function AppSidebar({ isOpen, onClose, onOpenExitProtocol }: AppSidebarProps) {
  const { language, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, appBasePath, hasCapability } = useAuth();
  const { settings } = useSettings();
  const { activeTeam, shiftConfig } = useOperations();
  const { analysts } = useSocket();
  const location = useLocation();

  const onDutyCount = activeTeam.length;

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

  useEffect(() => {
    onClose();
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const menuStructure: NavItem[] = [
    { type: 'header', label: (t('nav.header_ops') as string) || 'OPERASIONAL' },
    { label: (t('nav.dashboard') as string), to: `${appBasePath}`, icon: <LayoutDashboard size={18} /> },
    { label: (t('nav.alerts') as string), to: `${appBasePath}/alerts`, icon: <Bell size={18} /> },
    { label: (t('nav.triage') as string), to: `${appBasePath}/triage`, icon: <FileSearch size={18} /> },
    { label: (t('nav.reports') as string), to: `${appBasePath}/reports`, icon: <BarChart3 size={18} />, requiresRoles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.AUDITOR, ROLES.DEMO] },
    { label: (t('nav.operations') as string) || 'OPERASI TAKTIS', to: `${appBasePath}/operations`, icon: <Activity size={18} />, requiresRoles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.L2_ANALYST, ROLES.L1_ANALYST] },
    { label: (t('nav.false-positive') as string), to: `${appBasePath}/false-positive`, icon: <ShieldOff size={18} /> },
    
    { type: 'header', label: (t('nav.header_mgmt_main') as string) || 'MANAJEMEN' },
    { label: (t('nav.settings_global') as string) || 'PUSAT KENDALI', to: `${appBasePath}/settings`, icon: <Settings size={18} />, requiresCapability: CAPABILITIES.MANAGE_SETTINGS, requiresRoles: [ROLES.ADMIN, ROLES.DEMO] },
    { label: (t('management.title') as string) || 'MANAJEMEN OPERASIONAL', to: `${appBasePath}/management`, icon: <Activity size={18} />, requiresCapability: CAPABILITIES.ACCESS_OPERATIONS, end: true },
    { label: (t('nav.audit') as string) || 'LOG FORENSIK', to: `${appBasePath}/management/audit`, icon: <Shield size={18} />, requiresRoles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.AUDITOR, ROLES.DEMO] },
    { label: (t('nav.ingestion') as string), to: `${appBasePath}/ingestion`, icon: <Database size={18} />, requiresCapability: CAPABILITIES.ACCESS_INGESTION, requiresRoles: [ROLES.ADMIN, ROLES.AUDITOR] },
  ];

  // SECURE LOCK: Enforce strict role-based vertical isolation
  const filteredNav = menuStructure.map(item => {
    if (item.type === 'header') return item;

    if (item.requiresRoles && user?.role && !item.requiresRoles.includes(user.role)) {
       return null;
    }

    if (item.requiresCapability && !hasCapability(item.requiresCapability)) return null;

    return item;
  }).filter(Boolean) as NavItem[];

  // Prune headers with no navigable targets
  const navItems = filteredNav.filter((item, index) => {
    if (item.type !== 'header') return true;
    const nextItems = filteredNav.slice(index + 1);
    
    const itemsInSection = [];
    for (const next of nextItems) {
      if (next.type === 'header') break;
      itemsInSection.push(next);
    }
    return itemsInSection.length > 0;
  });

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[998] bg-background-overlay backdrop-blur-md lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-[999] flex h-screen w-[85vw] max-w-[300px] flex-col overflow-hidden
        lg:static lg:h-[calc(100vh-80px)] lg:w-72 lg:translate-x-0 lg:my-10 lg:ml-8 lg:mr-2
        bg-bg-sidebar/60 backdrop-blur-xl border border-border-primary/40 rounded-[2.5rem] 
        shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all duration-300 lg:relative
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 flex flex-col h-full relative z-10">
          {/* Brand Engine */}
          <div className="mb-12 flex items-center justify-between border-b border-border-primary/40 pb-6">
            <div className="flex items-center gap-4 min-w-0">
              <div className="floating shrink-0">
                <img src={settings.appLogo || `${import.meta.env.BASE_URL}logo.png`} alt="Logo" className="h-10 w-10 object-contain rounded-xl border border-accent-cyan/20" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-lg font-black tracking-wider text-foreground-primary capitalize leading-tight">{settings.appName}</h1>
                <p className="text-[9px] text-accent-cyan font-bold capitalize tracking-wide opacity-80 mt-1">{(t('sidebar.secOpsCenter') as string)}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 lg:hidden text-foreground-muted hover:text-foreground-primary transition-colors"><X size={20} /></button>
          </div>

          {/* Utility Control Row - Highly Ergonomic & Compact */}
          <div className="mb-8 flex items-center justify-center gap-1 bg-bg-panel/20 p-1 rounded-2xl border border-border-primary/20 mx-auto w-fit shadow-lg">
             <motion.button 
                whileTap={{ scale: 0.9, rotate: 15 }}
                onClick={toggleTheme}
                className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-bg-panel transition-all text-foreground-primary"
             >
                <AnimatePresence mode="wait">
                  <motion.div key={theme} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
                    {theme === 'dark' ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-indigo-500" />}
                  </motion.div>
                </AnimatePresence>
             </motion.button>
             
             <div className="h-6 w-px bg-border-primary/20 mx-0.5" />
             
             <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={toggleLanguage} 
                className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-bg-panel transition-all font-black text-[12px] text-accent-cyan tracking-widest"
             >
                {language.toUpperCase()}
             </motion.button>
          </div>

          {/* Identity Hub - Simplified & Proportional */}
          <div className="mb-4 px-4 py-3 rounded-2xl bg-bg-panel/20 border border-border-primary/20 relative overflow-hidden group shadow-md transition-all duration-300 hover:bg-bg-panel/40">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex items-center gap-3">
               <div className="relative shrink-0">
                 <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center font-black text-accent-cyan text-sm shadow-inner overflow-hidden">
                   {user?.avatar ? (
                     <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                   ) : (
                     (displayName || 'A').charAt(0)
                   )}
                 </div>
                 <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-bg-panel ${analysts.some(a => String(a.isMe)) ? 'indicator-active indicator-glow' : 'bg-foreground-tertiary'}`} />
               </div>
               <div className="min-w-0 flex-1">
                 <div className="flex items-center gap-2 overflow-hidden">
                    <h2 className="text-[12px] font-black text-foreground-primary truncate uppercase tracking-wider">{displayName}</h2>
                    <span className="text-[10px] text-foreground-tertiary opacity-30">/</span>
                    <p className="text-[9px] font-bold text-accent-cyan uppercase truncate opacity-80">
                      {currentShift 
                        ? (t(`ops.shifts.${currentShift.id}`) === `ops.shifts.${currentShift.id}` ? (currentShift.name || t('ops.duty.standby')) : t(`ops.shifts.${currentShift.id}`))
                        : t('ops.duty.standby')}
                    </p>
                 </div>
                 <div className="mt-2">
                    <p className="text-[10.5px] font-black text-foreground-primary uppercase tracking-[0.05em] leading-none">
                      {onDutyCount} <span className="text-status-success-text opacity-80 text-[10px]">{(t('common.onDuty') as string)}</span>
                    </p>
                 </div>
               </div>
            </div>
          </div>

          {/* Navigation Pipeline */}
          <nav className="space-y-1 flex-1 overflow-y-auto no-scrollbar py-2">
            <StaggerGroup className="space-y-1" stagger={0.05}>
              {navItems.map((item, index) => {
                if (item.type === 'header') {
                  return (
                    <StaggerItem key={`header-${index}`} className="pt-6 pb-2 px-5 first:pt-0">
                       <p className="text-[9px] font-bold capitalize tracking-wider text-foreground-muted/60">{item.label.toLowerCase()}</p>
                    </StaggerItem>
                  );
                }

                return (
                  <StaggerItem key={item.to}>
                    <NavLink
                      to={item.to!}
                      end={item.end !== undefined ? item.end : item.to === appBasePath}
                      className={({ isActive }) => `
                        flex items-center gap-4 rounded-xl px-5 py-3.5 text-[11px] font-bold capitalize tracking-tight transition-all duration-300 group
                        ${isActive ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/40 shadow-lg shadow-accent-cyan/5' : 'text-foreground-secondary hover:bg-bg-panel/40 border border-transparent hover:border-border-primary/40'}
                      `}
                    >
                      <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
                      <span className="truncate flex-1">{item.label}</span>
                    </NavLink>
                  </StaggerItem>
                );
              })}
            </StaggerGroup>
          </nav>
          {/* Minimal Footer */}
          <div className="mt-auto pt-6 border-t border-border-primary/40 text-center">
            <p className="text-[8px] font-bold text-foreground-tertiary uppercase tracking-[0.2em] opacity-30">
              {settings.orgName} • {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
