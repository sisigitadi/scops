import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '../components/common/Modal';
import { 
  BarChart3, Clock, Users, Shield, 
  ArrowRightLeft, History, TrendingUp, Monitor, Book, UserCog
} from 'lucide-react';
import { useAuth, ROLES, CAPABILITIES } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import { useOperations, AuditLog, Personnel } from '../context/OperationsContext';
import { pulse, formatDDMMYYYY } from '../utils/datePulse';
import { StaggerGroup, StaggerItem } from '../components/common/StaggerFadeIn';
import InfoTooltip from '../components/common/InfoTooltip';
import SettingsShifts from '../components/settings/SettingsShifts';
import AttendanceStatus from '../components/management/AttendanceStatus';
import OperationalCalendar from '../components/management/OperationalCalendar';
import { useToast } from '../context/ToastContext';

// Governance Hub v6.0.0 Components
import StrategicPerformance from '../components/management/StrategicPerformance';
import ReliabilityTracker from '../components/management/ReliabilityTracker';
import GovernanceLibrary from '../components/management/GovernanceLibrary';

/**
 * ManagementPage — Unified SOC Governance & Command Center (v11.6.0 TS)
 * Integrated tactical operations monitoring with strategic governance type-safety.
 */

type ManagementTab = 'ROSTER' | 'PERFORMANCE' | 'INFRASTRUCTURE' | 'GOVERNANCE';

export default function ManagementPage() {
  const { user, hasCapability } = useAuth();
  const { t } = useLanguage();
  const { 
    activeTeam, 
    shiftConfig, 
    handoverLogs, 
    createHandover,
    auditLogs,
    trackActivity
  } = useOperations();

  const [activeTab, setActiveTab] = useState<ManagementTab>('ROSTER');
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [handoverNote, setHandoverNote] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { showToast } = useToast();

  const complianceRate = useMemo(() => {
    if (!auditLogs || auditLogs.length === 0) return '100.0%';
    const recentLogs = auditLogs.slice(0, 50);
    const successCount = recentLogs.filter((log: AuditLog) => log.result === 'SUCCESS').length;
    return `${((successCount / recentLogs.length) * 100).toFixed(1)}%`;
  }, [auditLogs]);

  const isAuditor = user?.role === ROLES.AUDITOR;
  const isReadOnly = isAuditor || !hasCapability(CAPABILITIES.ACCESS_OPERATIONS);

  const handleHandoverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverNote.trim() || isReadOnly) return;
    createHandover({ notes: handoverNote });
    setHandoverNote('');
    setIsHandoverModalOpen(false);
  };

  const handleRefreshInfrastructure = async () => {
    if (isReadOnly) return;
    setIsRefreshing(true);
    trackActivity('INFRA_REFRESH', 'Manual infrastructure health synchronization triggered via Tactical HUD');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    showToast(t('system.syncComplete') || 'Infrastructure diagnostics completed.', 'success');
    setIsRefreshing(false);
  };

  const filteredActiveTeam = activeTeam;
  const leader = activeTeam.find(a => a.role?.toLowerCase().includes('manager'));

  const mainTabs: { id: ManagementTab; label: string; icon: React.ReactNode }[] = [
    { id: 'ROSTER', label: t('management.tabs.roster'), icon: <Users size={14} /> },
    { id: 'PERFORMANCE', label: t('management.tabs.performance'), icon: <TrendingUp size={14} /> },
    { id: 'INFRASTRUCTURE', label: t('management.tabs.infrastructure'), icon: <Monitor size={14} /> },
    { id: 'GOVERNANCE', label: t('management.tabs.governance'), icon: <Book size={14} /> }
  ];

  return (
    <div className="relative flex flex-col min-h-screen pb-10">
      <StaggerGroup delay={0.1} stagger={0.08}>
        {/* Header Section */}
        <StaggerItem>
          <header className="premium-capsule p-8 sm:p-10 mb-10 relative animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
              <div className="flex items-center gap-6">
                <div className="p-4 rounded-3xl bg-accent-indigo/10 border border-accent-indigo/20 text-accent-indigo floating">
                  <BarChart3 size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-4xl font-bold text-foreground-primary capitalize tracking-tight leading-none">
                      {t('management.title')}
                    </h1>
                    <InfoTooltip text={t('tooltips.management')} />
                  </div>
                  <p className="mt-3 text-xs sm:text-sm font-bold text-foreground-tertiary uppercase tracking-widest opacity-70">
                    {filteredActiveTeam.length > 0 
                      ? t('ops.activeStatus').replace('{count}', String(filteredActiveTeam.length)).replace('{leader}', leader?.name || '---')
                      : t('ops.standbyStatus') || 'SISTEM SIAGA • TIDAK ADA ANALIS AKTIF'
                    }
                  </p>
                </div>
              </div>
            </div>
          </header>
        </StaggerItem>

        {/* Tab Switcher */}
        <StaggerItem>
            <div className="flex flex-nowrap overflow-x-auto no-scrollbar md:overflow-visible p-1.5 bg-bg-panel/40 border border-border-primary/20 rounded-[2.5rem] md:rounded-[2rem] gap-1.5 mb-10 relative z-20 w-full mx-auto">
              {mainTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 md:flex-1 flex items-center justify-center gap-2 px-6 md:px-2 py-3.5 md:py-3 rounded-[2rem] md:rounded-[1.5rem] text-[10px] md:text-[11px] font-black tracking-tighter md:tracking-normal transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-accent-cyan text-foreground-inverse shadow-xl shadow-accent-cyan/20' : 'text-foreground-tertiary hover:text-foreground-primary hover:bg-white/5'}`}
                >
                   <span className="shrink-0 scale-90 md:scale-100">{tab.icon}</span>
                   <span className="max-w-none">{tab.label}</span>
                   <div className="scale-[0.6] md:scale-90 -ml-0.5 shrink-0 opacity-70 hover:opacity-100 transition-opacity">
                       <InfoTooltip vAlign="top" text={
                         tab.id === 'ROSTER' ? t('settings.tooltips.ttShiftMgmt') :
                         tab.id === 'GOVERNANCE' ? (t('management.governanceHeader') || 'Operational Governance') : ''
                       } />
                   </div>
                </button>
              ))}
            </div>
        </StaggerItem>

        <AnimatePresence mode="wait">
           <motion.div
             key={activeTab}
             initial={{ opacity: 0, y: 15 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -15 }}
             transition={{ duration: 0.3 }}
           >
              {activeTab === 'ROSTER' && (
                <div className="space-y-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="premium-card !p-6 flex items-center gap-5">
                      <div className="p-4 rounded-2xl bg-bg-panel/40 text-cyan-400 border border-border-primary/20"><Users size={20} /></div>
                      <div>
                        <p className="text-[10px] font-bold text-foreground-tertiary uppercase tracking-widest leading-none mb-1 opacity-60">{t('management.onDuty')}</p>
                        <p className="text-2xl font-black text-foreground-primary">{filteredActiveTeam.length}</p>
                      </div>
                    </div>
                    <div className="premium-card !p-6 flex items-center gap-5">
                      <div className="p-4 rounded-2xl bg-bg-panel/40 text-amber-400 border border-border-primary/20"><Clock size={20} /></div>
                      <div>
                        <p className="text-[10px] font-bold text-foreground-tertiary uppercase tracking-widest leading-none mb-1 opacity-60">{t('management.activeShifts')}</p>
                        <p className="text-2xl font-black text-foreground-primary">{Object.keys(shiftConfig || {}).length}</p>
                      </div>
                    </div>
                    <div className="premium-card !p-6 flex items-center gap-5">
                      <div className="p-4 rounded-2xl bg-bg-panel/40 text-status-success-text border border-border-primary/20"><Shield size={20} /></div>
                      <div>
                        <p className="text-[10px] font-bold text-foreground-tertiary uppercase tracking-widest leading-none mb-1 opacity-60">{t('management.sop.complianceStatus')}</p>
                        <p className="text-2xl font-black text-foreground-primary">{complianceRate}</p>
                      </div>
                    </div>
                    <div className="premium-card !p-6 flex items-center gap-5">
                      <div className="p-4 rounded-2xl bg-bg-panel/40 text-accent-purple border border-border-primary/20"><UserCog size={20} /></div>
                      <div>
                        <p className="text-[10px] font-bold text-foreground-tertiary uppercase tracking-widest leading-none mb-1 opacity-60">{t('management.reliability')}</p>
                        <p className="text-2xl font-black text-foreground-primary">{t('management.optimal')}</p>
                      </div>
                    </div>
                  </div>

                  <AttendanceStatus isReadOnly={isReadOnly} />
                  
                  <div className="premium-capsule p-8 sm:p-10">
                    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border-primary/20">
                      <div className="p-2 rounded-xl bg-accent-purple/10 text-accent-purple">
                        <History size={20} strokeWidth={2.5} />
                      </div>
                      <h2 className="text-xl font-bold text-foreground-primary capitalize tracking-tight flex items-center gap-2">
                        {t('ops.handover.title')}
                        <InfoTooltip text={t('settings.tooltips.ttAuditHandover')} />
                      </h2>
                    </div>
                    
                    <div className="space-y-6 max-h-[600px] overflow-y-auto pr-6 custom-scrollbar">
                      {handoverLogs.length === 0 ? (
                        <div className="py-32 text-center opacity-30">
                          <History size={48} className="mx-auto mb-4" />
                          <p className="text-xs font-bold uppercase tracking-[0.3em]">{t('ops.handover.empty')}</p>
                        </div>
                      ) : (
                        <div className="relative border-l border-border-primary/20 ml-4 pl-10 space-y-10">
                          {handoverLogs.map((log: any) => (
                            <div key={log.id} className="relative">
                              <div className="absolute -left-[45px] top-8 w-5 h-5 rounded-full bg-accent-purple border-[4px] border-bg-page z-10 shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                              <div className="premium-card !p-8 group hover:border-accent-purple/40 transition-all bg-bg-panel/5">
                                <div className="flex justify-between items-start mb-6">
                                  <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-accent-purple/10 flex items-center justify-center text-accent-purple border border-accent-purple/20">
                                      <Users size={18} />
                                    </div>
                                    <div>
                                      <span className="text-[10px] font-black text-accent-cyan uppercase tracking-[0.3em]">{t('ops.handover.label')}</span>
                                      <h4 className="text-sm font-bold text-foreground-primary uppercase tracking-widest mt-0.5">
                                        {t('ops.handover.verifiedBy').replace('{name}', log.verifiedBy?.name || '---')}
                                      </h4>
                                    </div>
                                  </div>
                                   <div className="flex flex-col justify-center gap-0.5 whitespace-nowrap">
                                    <span className="text-xs font-black text-foreground-primary tracking-tighter">
                                      {formatDDMMYYYY(log.timestamp)}
                                    </span>
                                    <span className="text-[10px] font-bold text-foreground-tertiary opacity-50 uppercase tracking-[0.2em]">
                                      {pulse(log.timestamp, { includeTime: true, style: 'dmy' }).split(' ')[1]}
                                    </span>
                                  </div>
                                </div>
                                <div className="bg-bg-page/40 p-6 rounded-3xl border border-border-primary/10 relative overflow-hidden group-hover:bg-bg-page/60 transition-colors">
                                  <p className="text-sm text-foreground-secondary leading-loose italic relative z-10 font-medium">
                                    "{log.notes}"
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <SettingsShifts isReadOnly={isReadOnly} handleRestricted={() => {}} />
                  <OperationalCalendar />
                </div>
              )}

              {activeTab === 'PERFORMANCE' && <StrategicPerformance />}
              {activeTab === 'INFRASTRUCTURE' && <ReliabilityTracker />}
              {activeTab === 'GOVERNANCE' && <GovernanceLibrary />}
           </motion.div>
        </AnimatePresence>
      </StaggerGroup>

      {/* Handover Modal */}
      <Modal 
        isOpen={isHandoverModalOpen} 
        onClose={() => setIsHandoverModalOpen(false)} 
        title={t('ops.handover.modal.title')}
        maxWidth="max-w-lg"
      >
        <div className="flex items-center gap-5 mb-8">
          <div className="p-4 rounded-3xl bg-accent-purple/10 text-accent-purple border border-accent-purple/20">
            <ArrowRightLeft size={32} strokeWidth={2.5} />
          </div>
          <div className="text-left">
            <p className="text-xs font-medium text-foreground-tertiary capitalize tracking-tight opacity-70 mt-1">{t('ops.handover.modal.subtitle')}</p>
          </div>
        </div>

        <form onSubmit={handleHandoverSubmit} className="space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-bold text-foreground-tertiary uppercase tracking-[0.2em] pl-2">{t('ops.handover.modal.label')}</label>
            <textarea 
              required
              value={handoverNote}
              onChange={(e) => setHandoverNote(e.target.value)}
              placeholder={t('ops.handover.modal.placeholder')}
              className="premium-input w-full bg-bg-panel/40 min-h-[180px] !py-6 text-sm focus:border-accent-purple transition-all shadow-inner"
            />
          </div>

          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={() => setIsHandoverModalOpen(false)}
              className="premium-button flex-1 !border-border-primary/40 !text-foreground-secondary uppercase text-[10px] font-bold tracking-widest"
            >
              {t('common.cancel')}
            </button>
            <button 
              type="submit" 
              className="premium-button flex-1 !bg-accent-purple !border-none !text-white !shadow-2xl shadow-accent-purple/20 uppercase text-[10px] font-bold tracking-widest"
            >
              {t('ops.handover.modal.submit')}
            </button>
          </div>
        </form>
      </Modal>
      
      {/* STRATEGIC COMMAND HUD (Floating Governance Strip) */}
      <div className="sticky bottom-8 self-center z-[100] w-fit mt-10">
        <div className="premium-capsule !p-2 flex items-center gap-3 bg-background-main/80 backdrop-blur-2xl border-2 border-accent-indigo/30 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-10 duration-1000">
          <div className="flex items-center gap-2 px-4 border-r border-border-primary/20">
            <Shield size={16} className="text-accent-indigo animate-pulse" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsHandoverModalOpen(true)}
              disabled={isReadOnly}
              className={`flex items-center gap-2.5 px-8 py-3 bg-accent-purple text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-accent-purple/20 ${isReadOnly ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
            >
              <ArrowRightLeft size={16} strokeWidth={3} />
              {t('ops.handover.new')}
            </button>

            <div className="h-8 w-[2px] bg-border-primary/10 mx-1" />

            <button
              onClick={handleRefreshInfrastructure}
              disabled={isReadOnly || isRefreshing}
              className={`p-3 bg-bg-panel/20 text-foreground-tertiary rounded-xl hover:text-foreground-primary transition-all border border-transparent hover:border-white/10 ${isRefreshing ? 'animate-spin text-accent-cyan' : ''}`}
              title="Refresh Infrastructure"
            >
              <Monitor size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
