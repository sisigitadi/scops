import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  LayoutDashboard, 
  Bell, 
  FileSearch, 
  BarChart3, 
  Activity, 
  ShieldOff, 
  ShieldAlert, 
  Cpu, 
  Settings, 
  FileText, 
  Moon, 
  Sun, 
  Globe, 
  Clock, 
  X,
  Command,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth, ROLES } from '../../context/AuthContext';
import { useAlertData } from '../../context/AlertDataContext';
import { useOperations } from '../../context/OperationsContext';

interface CommandItem {
  id: string;
  category: 'navigation' | 'action' | 'alert' | 'preset';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  shortcut?: string;
  roles?: string[];
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenExitProtocol?: () => void;
}

export default function CommandPalette({ isOpen, onClose, onOpenExitProtocol }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, appBasePath } = useAuth();
  const { alerts } = useAlertData();
  const { isOnDuty } = useOperations();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const commands: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [
      // Navigation Modules
      {
        id: 'nav-dashboard',
        category: 'navigation',
        title: (t('nav.dashboard') as string) || 'Dashboard Eksekutif',
        subtitle: 'Overview KPI, attack volume & threat severity',
        icon: <LayoutDashboard className="w-4 h-4 text-cyan-400" />,
        shortcut: 'G D',
        action: () => { navigate(`${appBasePath}`); onClose(); }
      },
      {
        id: 'nav-alerts',
        category: 'navigation',
        title: (t('nav.alerts') as string) || 'Alert Register',
        subtitle: 'High-density forensic alert grid & archive search',
        icon: <Bell className="w-4 h-4 text-amber-400" />,
        shortcut: 'G A',
        action: () => { navigate(`${appBasePath}/alerts`); onClose(); }
      },
      {
        id: 'nav-triage',
        category: 'navigation',
        title: (t('nav.triage') as string) || 'Triage Workspace',
        subtitle: 'Incident analysis, OpenCTI enrichment & SOPs',
        icon: <FileSearch className="w-4 h-4 text-blue-400" />,
        shortcut: 'G T',
        action: () => { navigate(`${appBasePath}/triage`); onClose(); }
      },
      {
        id: 'nav-mitre',
        category: 'navigation',
        title: (t('nav.mitre') as string) || 'MITRE ATT&CK Matrix',
        subtitle: 'Tactical heatmap & threat framework distribution',
        icon: <ShieldAlert className="w-4 h-4 text-red-400" />,
        shortcut: 'G M',
        action: () => { navigate(`${appBasePath}/mitre`); onClose(); }
      },
      {
        id: 'nav-automation',
        category: 'navigation',
        title: (t('nav.automation') as string) || 'SOAR-Lite Automation',
        subtitle: 'Auto-triage rules, playbook dispatcher & triggers',
        icon: <Cpu className="w-4 h-4 text-purple-400" />,
        shortcut: 'G R',
        action: () => { navigate(`${appBasePath}/automation`); onClose(); }
      },
      {
        id: 'nav-reports',
        category: 'navigation',
        title: (t('nav.reports') as string) || 'Reports Center',
        subtitle: 'Executive summaries, compliance & PDF exports',
        icon: <BarChart3 className="w-4 h-4 text-emerald-400" />,
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.AUDITOR, ROLES.DEMO],
        shortcut: 'G P',
        action: () => { navigate(`${appBasePath}/reports`); onClose(); }
      },
      {
        id: 'nav-operations',
        category: 'navigation',
        title: (t('nav.operations') as string) || 'Operasi Taktis',
        subtitle: 'Live team status, active rosters & duty timeline',
        icon: <Activity className="w-4 h-4 text-sky-400" />,
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.L2_ANALYST, ROLES.L1_ANALYST],
        action: () => { navigate(`${appBasePath}/operations`); onClose(); }
      },
      {
        id: 'nav-management',
        category: 'navigation',
        title: (t('nav.management') as string) || 'Manajemen Operasional',
        subtitle: 'Governance, 24h shift planning & attendance',
        icon: <Activity className="w-4 h-4 text-indigo-400" />,
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.AUDITOR, ROLES.DEMO],
        action: () => { navigate(`${appBasePath}/management`); onClose(); }
      },
      {
        id: 'nav-audit',
        category: 'navigation',
        title: (t('nav.audit') as string) || 'Log Forensik (Audit)',
        subtitle: 'Immutable TX-HASH logs & accountability trail',
        icon: <FileText className="w-4 h-4 text-teal-400" />,
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.AUDITOR, ROLES.DEMO],
        action: () => { navigate(`${appBasePath}/management/audit`); onClose(); }
      },
      {
        id: 'nav-false-positive',
        category: 'navigation',
        title: (t('nav.false-positive') as string) || 'False Positive Hub',
        subtitle: 'Whitelisted rules & suppression archives',
        icon: <ShieldOff className="w-4 h-4 text-zinc-400" />,
        action: () => { navigate(`${appBasePath}/false-positive`); onClose(); }
      },
      {
        id: 'nav-settings',
        category: 'navigation',
        title: (t('nav.settings') as string) || 'Pusat Kendali (Settings)',
        subtitle: 'Identity management & infrastructure handshakes',
        icon: <Settings className="w-4 h-4 text-slate-400" />,
        roles: [ROLES.ADMIN, ROLES.DEMO],
        shortcut: 'G S',
        action: () => { navigate(`${appBasePath}/settings`); onClose(); }
      },

      // Quick Actions
      {
        id: 'act-theme',
        category: 'action',
        title: theme === 'dark' ? 'Ganti ke Mode Terang (Light Mode)' : 'Ganti ke Mode Gelap (Dark Mode)',
        subtitle: 'Toggle platform visual appearance',
        icon: theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-400" />,
        shortcut: 'T',
        action: () => { toggleTheme(); onClose(); }
      },
      {
        id: 'act-language',
        category: 'action',
        title: language === 'id' ? 'Switch Language to English' : 'Ganti Bahasa ke Indonesia',
        subtitle: 'Toggle platform UI localization',
        icon: <Globe className="w-4 h-4 text-emerald-400" />,
        shortcut: 'L',
        action: () => { toggleLanguage(); onClose(); }
      },
      {
        id: 'act-shift',
        category: 'action',
        title: isOnDuty ? 'Shift Out / Handover Protocol' : 'Shift In / Clock-In Protocol',
        subtitle: 'Launch mandatory ShiftGuard verification',
        icon: <Clock className="w-4 h-4 text-rose-400" />,
        action: () => {
          onClose();
          if (onOpenExitProtocol) onOpenExitProtocol();
        }
      },

      // Tactical Query Filters
      {
        id: 'preset-critical',
        category: 'preset',
        title: 'Filter: Critical Alerts Only',
        subtitle: 'Inspect highest severity security incidents',
        icon: <Sparkles className="w-4 h-4 text-red-500" />,
        action: () => { navigate(`${appBasePath}/alerts?severity=critical`); onClose(); }
      },
      {
        id: 'preset-open',
        category: 'preset',
        title: 'Filter: Unresolved / Open Alerts',
        subtitle: 'View pending alerts waiting for analyst triage',
        icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
        action: () => { navigate(`${appBasePath}/alerts?status=open`); onClose(); }
      }
    ];

    // Filter by user role capabilities
    return list.filter(cmd => {
      if (!cmd.roles) return true;
      if (!user?.role) return false;
      return cmd.roles.includes(user.role);
    });
  }, [appBasePath, language, navigate, onClose, onOpenExitProtocol, t, theme, toggleLanguage, toggleTheme, user?.role, isOnDuty]);

  // Dynamic search matching
  const filteredCommands = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;

    const directMatches = commands.filter(cmd => 
      cmd.title.toLowerCase().includes(q) || 
      cmd.subtitle?.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q)
    );

    // If search looks like an IP or Alert ID or Rule ID, add direct search action
    const isSpecialSearch = q.length >= 2;
    if (isSpecialSearch) {
      directMatches.unshift({
        id: 'dynamic-search',
        category: 'alert',
        title: `Cari di Register: "${query}"`,
        subtitle: 'Deep query for Alert ID, Rule, Source IP, or Hostname',
        icon: <Search className="w-4 h-4 text-cyan-400" />,
        action: () => {
          navigate(`${appBasePath}/alerts?q=${encodeURIComponent(query)}`);
          onClose();
        }
      });
    }

    return directMatches;
  }, [commands, query, appBasePath, navigate, onClose]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-20 sm:pt-28 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-2xl bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl shadow-black/80 overflow-hidden text-slate-100 font-sans backdrop-blur-xl"
            onKeyDown={handleKeyDown}
          >
            {/* Search Header */}
            <div className="flex items-center px-4 py-3 border-b border-slate-800 bg-slate-950/50">
              <Search className="w-5 h-5 text-cyan-400 mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ketik perintah, modul, IP, atau Alert ID... (Esc untuk tutup)"
                className="w-full bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 text-sm md:text-base font-mono focus:ring-0"
              />
              <div className="flex items-center gap-1.5 ml-2">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">ESC</span>
              </div>
            </div>

            {/* List View */}
            <div 
              ref={listRef}
              className="max-h-[60vh] overflow-y-auto divide-y divide-slate-800/40 p-2"
            >
              {filteredCommands.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <Command className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                  <p className="text-sm">Tidak ada perintah atau target yang cocok.</p>
                </div>
              ) : (
                filteredCommands.map((cmd, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${
                        isSelected 
                          ? 'bg-cyan-950/60 text-cyan-200 border border-cyan-500/40 shadow-sm' 
                          : 'text-slate-300 hover:bg-slate-800/50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-1.5 rounded-md ${isSelected ? 'bg-cyan-900/60' : 'bg-slate-800/80'}`}>
                          {cmd.icon}
                        </div>
                        <div className="truncate">
                          <div className="text-xs sm:text-sm font-semibold tracking-wide flex items-center gap-2">
                            {cmd.title}
                            {cmd.category === 'preset' && (
                              <span className="text-[9px] uppercase font-mono bg-cyan-900/50 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-800/60">
                                Filter
                              </span>
                            )}
                          </div>
                          {cmd.subtitle && (
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                              {cmd.subtitle}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        {cmd.shortcut && (
                          <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {cmd.shortcut}
                          </span>
                        )}
                        {isSelected && <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer Navigation Bar */}
            <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <div className="flex items-center gap-4">
                <span><kbd className="text-slate-400 bg-slate-800 px-1 rounded">↑</kbd> <kbd className="text-slate-400 bg-slate-800 px-1 rounded">↓</kbd> Navigasi</span>
                <span><kbd className="text-slate-400 bg-slate-800 px-1 rounded">↵</kbd> Jalankan</span>
              </div>
              <div className="flex items-center gap-1.5 text-cyan-400/80">
                <Command className="w-3 h-3" />
                <span>SecOps Tactical Command HUD</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
