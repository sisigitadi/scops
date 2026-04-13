import React, { useState, useEffect } from 'react';
import { pulse } from '../../utils/datePulse';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogIn, LogOut, CheckCircle2, 
  AlertCircle, ShieldCheck as ShieldIcon, ClipboardList,
  ArrowRight, Users as UsersIcon, 
  AlertTriangle 
} from 'lucide-react';
import { useAuth, ROLES } from '../../context/AuthContext';
import { useOperations } from '../../context/OperationsContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAlertData } from '../../context/AlertDataContext';

/**
 * ShiftGuardModal — Operational Accountability Gate
 * Mandatory entry/exit protocol layer enforcing shift handovers, situational awareness 
 * acknowledgments, and forensic integrity for all active SOC personnel.
 */

interface ShiftGuardModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export default function ShiftGuardModal({ forceOpen = false, onClose }: ShiftGuardModalProps) {
  const { user, logout } = useAuth();
  const { activeTeam, toggleDuty } = useOperations();
  const { t } = useLanguage();
  const { alerts } = useAlertData();

  const userId = String(user?.id || user?.email || '').toLowerCase();
  const isOnDuty = activeTeam.some(a => String(a.id).toLowerCase() === userId);

  const isEntry = !isOnDuty;
  const isManager = user?.role === ROLES.MANAGER;
  const isAdmin = user?.role === ROLES.ADMIN;
  const isAuditor = user?.role === ROLES.AUDITOR;

  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [validation, setValidation] = useState({
    acknowledgedQueue: false,
    updatedLogs: isAdmin || isAuditor,
    communicatedTeam: isAdmin || isAuditor
  });

  useEffect(() => {
    if (user && !isOnDuty && user.role !== ROLES.DEMO) {
      setIsOpen(true);
    } else if (forceOpen) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [user, isOnDuty, forceOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEntry) {
          logout();
        }
        setIsOpen(false);
        if (onClose) onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isEntry, logout, onClose]);

  const highAlerts = alerts.filter(a => a.severity >= 3 && a.status !== 'closed' && !a.analyst).length;
  const myPendingIncidents = alerts.filter(a => a.analyst === (user?.name || user?.email) && a.status !== 'closed');
  const myPendingCount = myPendingIncidents.length;

  const canSubmit = notes.trim().length >= 10 && validation.acknowledgedQueue && validation.updatedLogs && validation.communicatedTeam;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    
    toggleDuty(userId, notes);
    
    if (isOnDuty) {
      logout();
    }
    
    setNotes('');
    setValidation({ acknowledgedQueue: false, updatedLogs: false, communicatedTeam: false });
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  const getTitle = () => {
    if (isEntry) {
      if (isManager) return t('ops.shiftGuard.managerEntryTitle');
      if (isAdmin) return t('ops.shiftGuard.adminEntryTitle');
      if (isAuditor) return t('ops.shiftGuard.auditorEntryTitle');
      return t('ops.shiftGuard.entryTitle');
    }
    if (isManager) return t('ops.shiftGuard.managerExitTitle');
    return t('ops.shiftGuard.exitTitle');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" 
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 40 }}
          className="relative w-full max-w-xl premium-capsule p-1 sm:p-1.5 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] max-h-[92vh] flex flex-col"
        >
          <div className="bg-bg-card rounded-[2.4rem] border border-border-primary/20 relative overflow-hidden flex flex-col flex-1">
            <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[100px] opacity-20 ${isEntry ? 'bg-status-success-text' : 'bg-status-danger-text'}`} />
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 relative z-10">
              <div className="flex-1 overflow-y-auto p-8 sm:p-12 custom-scrollbar space-y-8">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 border-2 floating ${
                  isEntry ? 'bg-status-success-bg/10 text-status-success-text border-status-success-border/20' : 'bg-status-danger-bg/10 text-status-danger-text border-status-danger-border/20'
                }`}>
                  {isEntry ? <LogIn size={36} strokeWidth={2.5} /> : <LogOut size={36} strokeWidth={2.5} />}
                </div>

                <div className="mb-10 text-left">
                  <h2 className="text-3xl font-black text-foreground-primary tracking-tight uppercase leading-none">
                    {getTitle() as string}
                  </h2>
                  <div className="flex items-center gap-2 mt-4">
                    <div className={`w-2 h-2 rounded-full ${isEntry ? 'bg-status-success-text animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-status-danger-text h-1.5 w-1.5'}`} />
                    <span className="text-[10px] font-black text-foreground-tertiary uppercase tracking-[0.3em]">
                      {t('ops.shiftGuard.subtitle') as string}
                    </span>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-3xl bg-bg-panel/40 border border-border-primary/20">
                       <span className="text-[8px] font-black text-foreground-tertiary uppercase tracking-widest block mb-1">{t('ops.shiftGuard.identity') as string}</span>
                       <span className="text-xs font-bold text-foreground-primary uppercase truncate block">{user?.name}</span>
                    </div>
                    <div className="p-5 rounded-3xl bg-bg-panel/40 border border-border-primary/20 text-right">
                       <span className="text-[8px] font-black text-foreground-tertiary uppercase tracking-widest block mb-1">{t('ops.shiftGuard.timestamp') as string}</span>
                       <span className="text-xs font-bold text-foreground-primary uppercase block">
                          {pulse(new Date(), { includeTime: true, style: 'dmy' }).split(' ')[1]}
                       </span>
                    </div>
                  </div>

                  <div className="p-6 rounded-[2rem] bg-bg-panel/40 border border-border-primary/20 space-y-6">
                    <div className="flex items-center justify-between border-b border-border-primary/10 pb-4">
                       <span className="text-[10px] font-black text-foreground-tertiary uppercase tracking-widest">
                          {isAdmin ? t('ops.shiftGuard.contextAdmin') : isManager ? t('ops.shiftGuard.contextManager') : isAuditor ? t('ops.shiftGuard.contextAuditor') : t('ops.shiftGuard.liveQueue') as string}
                       </span>
                       {(!isManager && !isAdmin && !isAuditor) && (
                         <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-status-danger animate-pulse" />
                            <span className="text-[10px] font-black text-status-danger-text uppercase">{highAlerts} {t('ops.shiftGuard.unassignedAlerts') as string}</span>
                         </div>
                       )}
                       {(isManager || isAdmin) && (
                         <div className="flex items-center gap-2">
                             <UsersIcon size={14} className="text-status-success-text" />
                             <span className="text-[10px] font-black text-status-success-text uppercase">{activeTeam.length} {t('ops.shiftGuard.personnelOnDuty') as string}</span>
                         </div>
                       )}
                    </div>

                    {(isOnDuty && myPendingCount > 0 && (!isAuditor && !isManager)) && (
                      <div className="space-y-3">
                         <span className="text-[10px] font-black text-foreground-secondary uppercase tracking-widest flex items-center gap-2">
                            <AlertTriangle size={14} className="text-status-warning-text" />
                            {t('ops.shiftGuard.activeTickets') as string} ({myPendingCount})
                         </span>
                         <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                            {myPendingIncidents.map((inc: any) => (
                              <div key={inc.id} className="p-3 rounded-xl bg-bg-panel/60 border border-border-primary/10 flex items-center justify-between">
                                 <span className="text-[10px] font-bold text-foreground-primary uppercase truncate max-w-[200px]">{inc.rule?.description || inc.id}</span>
                                 <span className="text-[8px] font-black px-2 py-0.5 rounded-md bg-status-warning/10 text-status-warning-text border border-status-warning/20 capitalize">{inc.status}</span>
                              </div>
                            ))}
                         </div>
                      </div>
                    )}

                    <div className="space-y-3 pt-2">
                       <label className="flex items-center gap-3 group cursor-pointer">
                           <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${validation.acknowledgedQueue ? 'bg-status-success-text border-status-success-text' : 'border-border-primary/40'}`}
                             onClick={() => setValidation(v => ({ ...v, acknowledgedQueue: !v.acknowledgedQueue }))}>
                             {validation.acknowledgedQueue && <CheckCircle2 size={14} className="text-slate-900" />}
                          </div>
                          <span className="text-[10px] font-black text-foreground-secondary uppercase group-hover:text-foreground-primary">
                             {isAuditor ? t('ops.shiftGuard.valComplianceAware') :
                              isAdmin ? t('ops.shiftGuard.valInfraHealthy') : 
                              isManager ? (isEntry ? t('ops.shiftGuard.valTeamReady') : t('ops.shiftGuard.valKpiVerified')) : 
                              (isEntry ? t('ops.shiftGuard.valQueueEntry') : t('ops.shiftGuard.valUpdateExit')) as string}
                          </span>
                       </label>

                        <label className="flex items-center gap-3 group cursor-pointer">
                           <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${validation.updatedLogs ? 'bg-status-success-text border-status-success-text' : 'border-border-primary/40'}`}
                              onClick={() => setValidation(v => ({ ...v, updatedLogs: !v.updatedLogs }))}>
                              {validation.updatedLogs && <CheckCircle2 size={14} className="text-slate-900" />}
                           </div>
                           <span className="text-[10px] font-black text-foreground-secondary uppercase group-hover:text-foreground-primary">
                              {isAuditor ? (isEntry ? t('ops.shiftGuard.valReadyEntry') : t('ops.shiftGuard.valBriefExit')) :
                               isAdmin ? (isEntry ? t('ops.shiftGuard.valTeamReady') : t('ops.shiftGuard.valKpiVerified')) :
                               isManager ? (isEntry ? t('ops.shiftGuard.valTeamReady') : t('ops.shiftGuard.valKpiVerified')) :
                               (isEntry ? t('ops.shiftGuard.valReadyEntry') : t('ops.shiftGuard.valUpdateExit')) as string}
                           </span>
                        </label>

                        <label className="flex items-center gap-3 group cursor-pointer">
                           <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${validation.communicatedTeam ? 'bg-status-success-text border-status-success-text' : 'border-border-primary/40'}`}
                              onClick={() => setValidation(v => ({ ...v, communicatedTeam: !v.communicatedTeam }))}>
                              {validation.communicatedTeam && <CheckCircle2 size={14} className="text-slate-900" />}
                           </div>
                           <span className="text-[10px] font-black text-foreground-secondary uppercase group-hover:text-foreground-primary">
                              {isAuditor ? (isEntry ? t('ops.shiftGuard.valEthicsEntry') : t('ops.shiftGuard.valStabilityExit')) :
                               isAdmin ? t('ops.shiftGuard.valStabilityExit') :
                               isManager ? t('ops.shiftGuard.valStabilityExit') :
                               (isEntry ? t('ops.shiftGuard.valEthicsEntry') : t('ops.shiftGuard.valStabilityExit')) as string}
                           </span>
                        </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between pl-2">
                       <label className="text-[10px] font-black text-foreground-tertiary uppercase tracking-[0.2em] flex items-center gap-2">
                          <ClipboardList size={14} className="text-status-success-text" />
                          {isEntry ? t('ops.shiftGuard.entryLabel') : t('ops.shiftGuard.exitLabel') as string}
                       </label>
                       <span className={`text-[8px] font-bold px-2 py-0.5 rounded leading-none uppercase ${notes.trim().length >= 10 ? 'text-status-success-text bg-status-success/10' : 'text-status-danger-text bg-status-danger/10'}`}>
                         {notes.trim().length}/10 {t('ops.shiftGuard.required') as string}
                       </span>
                    </div>
                    <textarea 
                      required
                      placeholder={isEntry 
                        ? (t('ops.shiftGuard.entryPlaceholder') as string) 
                        : (t('ops.shiftGuard.exitPlaceholder') as string)
                      }
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className={`premium-input w-full min-h-[140px] !py-5 bg-bg-panel/20 text-sm leading-relaxed ${isEntry ? 'focus:border-status-success-text/50' : 'focus:border-status-danger-text/50'}`}
                    />
                  </div>
                </div>

                <div className={`p-4 rounded-3xl border flex items-start gap-4 ${isEntry ? 'bg-accent-cyan/5 border-accent-cyan/10' : 'bg-status-danger/5 border-status-danger/10'}`}>
                   {isEntry ? <ShieldIcon size={20} className="text-status-success-text shrink-0" /> : <AlertCircle size={20} className="text-status-danger-text shrink-0" />}
                   <p className="text-[9px] font-bold text-foreground-secondary leading-normal uppercase opacity-70">
                      {isEntry 
                        ? t('ops.shiftGuard.entryDirective')
                        : t('ops.shiftGuard.exitDirective') as string
                      }
                   </p>
                </div>
              </div>

              <div className="p-8 sm:p-12 pt-4 border-t border-border-primary/10 bg-bg-card/80 backdrop-blur-md relative z-20">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (isEntry) {
                        logout();
                      }
                      setIsOpen(false);
                      if (onClose) onClose();
                    }}
                    className="premium-button flex-1 !py-6 !text-xs !font-black !tracking-[0.4em] !border-border-primary/40 !text-foreground-secondary uppercase"
                  >
                    {t('ops.shiftGuard.actionCancel') as string}
                  </button>
                  <button
                    type="submit"
                    className={`premium-button flex-[2] !py-6 !text-xs !font-black !tracking-[0.4em] uppercase shadow-2xl transition-all group overflow-hidden relative ${
                      isEntry ? '!bg-status-success-text !text-slate-900 shadow-status-success-bg/20' : '!bg-status-danger-text !text-white shadow-status-danger-bg/20'
                    }`}
                    disabled={!canSubmit}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-4">
                      {isEntry ? t('ops.shiftGuard.actionCommence') : t('ops.shiftGuard.actionFinalize') as string}
                      <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
