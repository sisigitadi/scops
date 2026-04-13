import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle2, AlertCircle, Clock, X, Info } from 'lucide-react';
import { useOperations, Personnel } from '../../context/OperationsContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth, ROLES, CAPABILITIES } from '../../context/AuthContext';
import InfoTooltip from '../common/InfoTooltip';

/**
 * AttendanceStatus — Live Compliance Monitor
 * Compares scheduled personnel against real-time clock-in status for operational accountability.
 */

interface AttendanceStatusProps {
  isReadOnly?: boolean;
}

export default function AttendanceStatus({ isReadOnly }: AttendanceStatusProps) {
  const { t } = useLanguage();
  const { 
    personnel, 
    activeTeam, 
    schedules, 
    shiftConfig,
    attendance,
    setPersonnelStatus 
  } = useOperations();
  const { user, hasCapability } = useAuth();

  const getCurrentShiftName = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const shifts = Object.values(shiftConfig || {});
    const active = shifts.find(s => {
      const [startH, startM] = (s.start || '00:00').split(':').map(Number);
      const [endH, endM] = (s.end || '00:00').split(':').map(Number);
      const startTotal = startH * 60 + startM;
      const endTotal = endH * 60 + endM;

      if (startTotal <= endTotal) {
        return currentTime >= startTotal && currentTime <= endTotal;
      } else {
        return currentTime >= startTotal || currentTime <= endTotal;
      }
    });

    if (!active) return t('ops.duty.none');
    
    const activeEntry = Object.entries(shiftConfig || {}).find(([_, s]) => s === active);
    const activeId = activeEntry ? activeEntry[0] : null;
    
    return activeId && t(`ops.shifts.${activeId}`) !== `ops.shifts.${activeId}`
      ? t(`ops.shifts.${activeId}`) 
      : active.name;
  };

  const currentShift = getCurrentShiftName();
  const today = new Date().toISOString().split('T')[0];
  const todaysSchedule = schedules[today] || {};
  const scheduledIds = Object.values(todaysSchedule).flat();

  const userRole = (user?.role || '').toLowerCase();
  const isAdmin = userRole === 'admin';
  const isManager = userRole === 'manager';
  const isAuditor = userRole === 'auditor';

  const monitorList = useMemo(() => {
    // Collect all candidates: Scheduled today OR currently On-Duty
    const allCandidateIds = new Set([
      ...scheduledIds.map(id => String(id).toLowerCase()),
      ...activeTeam.map(at => String(at.id).toLowerCase())
    ]);

    return Array.from(allCandidateIds).map(id => {
      // Find latest profile data
      const pData = personnel.find(p => String(p.id).toLowerCase() === id);
      const atData = activeTeam.find(at => String(at.id).toLowerCase() === id);
      return pData || atData || { id, name: 'Unknown', role: 'Analyst', avatar: '' };
    });
  }, [personnel, activeTeam, scheduledIds]);
  
  const getStatus = (analystId: string) => {
    const aid = String(analystId).toLowerCase();
    const isActive = activeTeam.find(a => String(a.id).toLowerCase() === aid);
    const manualStatus = attendance[today]?.[analystId] || attendance[today]?.[aid];
    const isScheduled = scheduledIds.some(id => String(id).toLowerCase() === aid);

    if (isActive) return { label: t('ops.monitor.status.onDuty'), color: 'bg-status-success-bg/20 text-status-success-text', icon: <CheckCircle2 size={12} /> };
    if (manualStatus === 'sakit') return { label: t('ops.attendance.sick'), color: 'bg-rose-500/25 text-rose-400', icon: <AlertCircle size={12} /> };
    if (manualStatus === 'ijin') return { label: t('ops.attendance.leave'), color: 'bg-amber-500/25 text-amber-400', icon: <Info size={12} /> };
    if (manualStatus === 'unauthorized') return { label: t('ops.attendance.unauthorized'), color: 'bg-rose-700/30 text-rose-500', icon: <X size={12} /> };
    
    if (isScheduled) return { label: t('ops.monitor.status.awaiting'), color: 'bg-accent-cyan/15 text-accent-cyan', icon: <Clock size={12} /> };
    return { label: t('ops.monitor.status.offSchedule'), color: 'bg-bg-panel/40 text-foreground-tertiary', icon: <Clock size={12} /> };
  };

  return (
    <div className="premium-capsule p-8 mb-10 !bg-bg-panel/10 border-accent-cyan/20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-border-primary/20 pb-8">
        <div className="flex items-center gap-5">
           <div className="p-3.5 rounded-2xl bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/10 floating">
              <Users size={24} strokeWidth={2.5} />
           </div>
           <div>
              <h3 className="text-xl font-bold text-foreground-primary capitalize tracking-tight flex items-center gap-2">
                  {t('ops.monitor.title')}
                  <InfoTooltip text={t('settings.tooltips.ttAuditAtt')} />
               </h3>
              <p className="text-[10px] font-black text-foreground-tertiary uppercase tracking-[0.2em] opacity-60 mt-1">
                 {t('ops.monitor.subtitle')}
              </p>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="glass-panel !py-2.5 !px-5 rounded-2xl flex items-center gap-3 border-border-primary/10">
              <Clock size={14} className="text-accent-cyan" />
              <div className="text-left">
                 <span className="text-[8px] font-black text-foreground-tertiary uppercase tracking-widest block leading-none mb-1">{t('ops.monitor.activeShift')}</span>
                 <span className="text-xs font-bold text-foreground-primary uppercase block leading-none">{currentShift}</span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {monitorList.length === 0 ? (
          <div className="col-span-full py-20 text-center opacity-30 border-2 border-dashed border-border-primary/20 rounded-[2rem]">
             <Users size={40} className="mx-auto mb-4" />
             <p className="text-xs font-black uppercase tracking-[0.4em]">{t('ops.monitor.empty')}</p>
          </div>
        ) : (
          monitorList.map((analyst) => {
            const status = getStatus(analyst.id);
            const isActive = activeTeam.some(a => String(a.id).toLowerCase() === String(analyst.id).toLowerCase());
            
            return (
              <motion.div 
                key={analyst.id}
                layout
                className={`premium-card !p-5 relative overflow-hidden group border-2 transition-all duration-300 ${isActive ? 'border-status-success/40 bg-status-success/5' : 'border-border-primary/20'}`}
              >
                 <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                       <img src={analyst.avatar} className="w-12 h-12 rounded-2xl object-cover bg-bg-panel p-0.5 border border-border-primary/20" alt={analyst.name} />
                       <div className={`absolute -right-1 -bottom-1 w-4 h-4 rounded-full border-2 border-bg-card flex items-center justify-center ${isActive ? 'bg-status-success-text' : 'bg-bg-panel text-foreground-tertiary'}`}>
                          {isActive ? <CheckCircle2 size={10} className="text-white" /> : <Clock size={10} />}
                       </div>
                    </div>
                    <div className="flex-1 min-w-0">
                       <h4 className="text-xs font-black text-foreground-primary uppercase tracking-widest truncate">{analyst.name}</h4>
                       <p className="text-[9px] font-bold text-foreground-tertiary uppercase opacity-60 mt-0.5 tracking-tight">{analyst.role}</p>
                       <div className={`mt-2 flex items-center gap-2 px-2 py-0.5 rounded-md w-fit border border-current opacity-80 ${status.color}`}>
                          {status.icon}
                          <span className="text-[8px] font-black uppercase tracking-widest">{status.label}</span>
                       </div>
                    </div>
                 </div>

                 {!isReadOnly && (isManager || isAdmin || hasCapability(CAPABILITIES.ACCESS_OPERATIONS) || userRole === 'demo') && String(analyst.id).toLowerCase() !== String(user?.id || user?.email).toLowerCase() && analyst.role?.toLowerCase() !== 'admin' && (
                    <div className="pt-4 border-t border-border-primary/20 grid grid-cols-3 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                         onClick={() => setPersonnelStatus(today, analyst.id, 'sakit')}
                         className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
                         title={t('ops.attendance.sick')}
                       >
                          <AlertCircle size={14} />
                          <span className="text-[8px] font-black">{t('ops.attendance.sick')}</span>
                       </button>
                       <button 
                         onClick={() => setPersonnelStatus(today, analyst.id, 'ijin')}
                         className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-all"
                         title={t('ops.attendance.leave')}
                       >
                          <Info size={14} />
                          <span className="text-[8px] font-black">{t('ops.attendance.leave')}</span>
                       </button>
                       <button 
                         onClick={() => setPersonnelStatus(today, analyst.id, 'unauthorized')}
                         className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-rose-700/10 text-rose-700 hover:bg-rose-700/20 border border-rose-700/20 transition-all"
                         title={t('ops.attendance.unauthorized')}
                       >
                          <X size={14} />
                          <span className="text-[8px] font-black">{t('ops.attendance.unauthorized')}</span>
                       </button>
                    </div>
                 )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
