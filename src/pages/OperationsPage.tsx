import React, { useState } from 'react';
import { pulse } from '../utils/datePulse';
import { 
  Users, 
  Clock, 
  Activity, 
  ShieldCheck, 
  ArrowRightLeft, 
  History, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  UserPlus,
  Database,
  Calendar,
  Layers,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '../components/common/Modal';
import { useOperations } from '../context/OperationsContext';
import { useLanguage } from '../context/LanguageContext';
import { StaggerGroup, StaggerItem } from '../components/common/StaggerFadeIn';
import InfoTooltip from '../components/common/InfoTooltip';
import { useToast } from '../context/ToastContext';

/**
 * OperationsPage — SOC Information Management System (SIM-SOC) Hub
 * Central command for accountability, roster management, and tactical handover protocols.
 */

export default function OperationsPage() {
  const { t } = useLanguage();
  const { 
    personnel, 
    activeTeam, 
    toggleDuty, 
    handoverLogs, 
    createHandover, 
    healthStatus,
    shiftConfig,
    trackActivity,
  } = useOperations();
  const { showToast } = useToast();
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [handoverNote, setHandoverNote] = useState('');

  const handoverGridTemplate = "50px 180px minmax(200px, 1fr) 250px";
  const rosterGridTemplate = "60px minmax(150px, 1fr) minmax(150px, 1fr) 100px";

  const handleHandoverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverNote.trim()) return;
    createHandover({ notes: handoverNote });
    setHandoverNote('');
    setIsHandoverModalOpen(false);
  };

  const leader = activeTeam.find(a => a.role?.toLowerCase().includes('manager'));

  return (
    <StaggerGroup className="space-y-8 pb-10" delay={0.1}>
      <StaggerItem>
        <section className="premium-capsule p-8 flex flex-col xl:flex-row justify-between gap-8">
          <div className="flex items-center gap-6 relative z-10">
            <div className="flex -space-x-4">
              {activeTeam.length === 0 ? (
                <div className="w-16 h-16 rounded-2xl bg-bg-panel/40 border-2 border-dashed border-border-primary/40 flex items-center justify-center text-foreground-tertiary">
                   <Users size={24} />
                </div>
              ) : (
                activeTeam.map((member, i) => (
                  <motion.img 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    key={member.id}
                    src={member.avatar} 
                    style={{ zIndex: 10 - i }}
                    className="w-16 h-16 rounded-2xl border-4 border-background-main bg-bg-panel p-1 object-cover shadow-xl" 
                    title={member.name}
                  />
                ))
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                 <h1 className="text-3xl font-black text-foreground-primary tracking-[0.2em] uppercase leading-none">
                   {(t('ops.command') as string)}
                 </h1>
                 <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${activeTeam.length > 0 ? 'bg-status-success-bg/10 border-status-success-text/20 text-status-success-text' : 'bg-status-warning-bg/10 border-status-warning-text/20 text-status-warning-text'}`}>
                   {activeTeam.length > 0 ? (t('ops.duty.on') as string) : (t('ops.duty.off') as string)}
                 </div>
              </div>
              <p className="mt-2 text-sm text-foreground-tertiary font-black tracking-widest uppercase opacity-70">
                {activeTeam.length > 0 
                  ? (t('ops.activeStatus') as string).replace('{count}', activeTeam.length.toString()).replace('{leader}', leader?.name || '---')
                  : (t('ops.standbyStatus') as string)
                }
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
            {Object.entries(healthStatus).map(([key, data]: [string, any]) => (
              <div key={key} className="premium-card !p-3 flex flex-col items-center justify-center text-center group hover:border-accent-cyan/40 transition-all cursor-help">
                 <div className={`p-2 rounded-lg ${data.status === 'online' ? 'bg-status-success-bg/10 text-status-success-text' : 'bg-status-danger-bg/10 text-status-danger-text'}`}>
                    {key === 'wazuh' && <ShieldCheck size={16} />}
                    {key === 'opencti' && <Activity size={16} />}
                    {key === 'telegram' && <ArrowRightLeft size={16} />}
                    {key === 'database' && <Database size={16} />}
                 </div>
                 <span className="text-[9px] font-black text-foreground-tertiary uppercase tracking-widest mt-2">{key}</span>
                 <span className={`text-[10px] font-bold mt-1 ${data.status === 'online' ? 'text-status-success-text' : 'text-status-danger-text'}`}>
                    {data.status.toUpperCase()}
                 </span>
              </div>
            ))}
          </div>
        </section>
      </StaggerItem>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <StaggerItem>
            <div className="premium-capsule p-8">
              <div className="flex items-center justify-between mb-8 border-b border-border-primary/20 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-accent-cyan/10 text-accent-cyan">
                    <Users size={20} strokeWidth={2.5} />
                  </div>
                  <h2 className="text-base font-black text-foreground-primary uppercase tracking-[0.2em] flex items-center gap-2">
                    {(t('ops.roster.title') as string)}
                    <InfoTooltip text={(t('settings.tooltips.ttRoleDist') as string)} />
                  </h2>
                </div>
              </div>

              <div className="overflow-x-auto no-scrollbar relative z-10 rounded-2xl border border-border-primary/20 bg-bg-panel/40 backdrop-blur-md">
                <div className="min-w-[800px] relative">
                  {/* Header Grid */}
                  <div 
                    className="grid sticky top-0 z-30 bg-bg-panel border-y-2 border-border-primary text-[10px] font-black uppercase tracking-widest text-foreground-tertiary"
                    style={{ gridTemplateColumns: rosterGridTemplate }}
                  >
                    <div className="px-6 py-4 border-r border-border-primary/20 flex items-center justify-center"><Layers size={14} /></div>
                    <div className="px-6 py-4 border-r border-border-primary/20">{(t('auth.personas.admin.name') as string).split(' ')[0]} / ROLE</div>
                    <div className="px-6 py-4 border-r border-border-primary/20">CAPABILITY</div>
                    <div className="px-6 py-4 text-center">DUTY</div>
                  </div>

                  {/* Body Container */}
                  <div className="relative min-h-[300px]">
                    <div className="absolute inset-0 pointer-events-none z-0">
                      <div className="grid h-full" style={{ gridTemplateColumns: rosterGridTemplate }}>
                        <div className="border-r border-border-primary/10 h-full" />
                        <div className="border-r border-border-primary/10 h-full" />
                        <div className="border-r border-border-primary/10 h-full" />
                        <div className="h-full" />
                      </div>
                    </div>

                    <div className="relative z-10 divide-y divide-border-primary/5">
                      {personnel.map((analyst) => (
                        <div 
                          key={analyst.id}
                          onClick={() => toggleDuty(analyst.id)}
                          className={`
                            grid py-4 items-center text-[11px] font-bold text-foreground-secondary transition-all hover:bg-bg-hover/40 cursor-pointer group
                            ${analyst.status === 'on-duty' ? 'bg-accent-cyan/5' : ''}
                          `}
                          style={{ gridTemplateColumns: rosterGridTemplate }}
                        >
                          <div className="px-6 flex items-center justify-center">
                             <img src={analyst.avatar} className="w-10 h-10 rounded-xl object-cover border-2 border-border-primary/20 p-0.5 bg-bg-panel" alt={analyst.name} />
                          </div>
                          <div className="px-6 flex flex-col justify-center">
                            <span className="text-foreground-primary uppercase font-black">{analyst.name}</span>
                            <span className="text-[9px] opacity-40 uppercase">{analyst.role}</span>
                          </div>
                          <div className="px-6 flex flex-wrap gap-1">
                             <span className="px-2 py-0.5 rounded-md bg-bg-panel border border-border-primary/20 text-[8px] font-black text-foreground-tertiary">L1-TRIAGE</span>
                             <span className="px-2 py-0.5 rounded-md bg-bg-panel border border-border-primary/20 text-[8px] font-black text-foreground-tertiary uppercase">SOC-OPS</span>
                          </div>
                          <div className="px-6 flex items-center justify-center">
                             <div className={`h-2.5 w-2.5 rounded-full transition-all ${analyst.status === 'on-duty' ? 'bg-status-success-text shadow-[0_0_12px_var(--status-success-text)] scale-110' : 'bg-foreground-tertiary/20'}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="premium-capsule p-8">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-accent-purple/10 text-accent-purple">
                    <History size={20} strokeWidth={2.5} />
                  </div>
                  <h2 className="text-base font-black text-foreground-primary uppercase tracking-[0.2em] flex items-center gap-2">
                    {(t('ops.handover.title') as string)}
                    <InfoTooltip text={(t('settings.tooltips.ttAuditHandover') as string)} />
                  </h2>
                </div>
              </div>

              <div className="overflow-x-auto no-scrollbar relative z-10 rounded-2xl border border-border-primary/20 bg-bg-panel/40 backdrop-blur-md">
                <div className="min-w-[1000px] relative">
                  {/* Header Grid */}
                  <div 
                    className="grid sticky top-0 z-30 bg-bg-panel border-y-2 border-border-primary text-[10px] font-black uppercase tracking-widest text-foreground-tertiary"
                    style={{ gridTemplateColumns: handoverGridTemplate }}
                  >
                    <div className="px-6 py-4 border-r border-border-primary/20 flex items-center justify-center"><Calendar size={14} /></div>
                    <div className="px-6 py-4 border-r border-border-primary/20">VERIFIED BY</div>
                    <div className="px-6 py-4 border-r border-border-primary/20">TACTICAL NOTES</div>
                    <div className="px-6 py-4 text-center">TIMESTAMP</div>
                  </div>

                  {/* Body Container */}
                  <div className="relative min-h-[300px]">
                    <div className="absolute inset-0 pointer-events-none z-0">
                      <div className="grid h-full" style={{ gridTemplateColumns: handoverGridTemplate }}>
                        <div className="border-r border-border-primary/10 h-full" />
                        <div className="border-r border-border-primary/10 h-full" />
                        <div className="border-r border-border-primary/10 h-full" />
                        <div className="h-full" />
                      </div>
                    </div>

                    <div className="relative z-10 divide-y divide-border-primary/5">
                      {handoverLogs.length === 0 ? (
                        <div className="py-20 text-center opacity-40">
                          <History size={32} className="mx-auto mb-3" />
                          <p className="text-[10px] font-black uppercase tracking-widest">{(t('ops.handover.empty') as string)}</p>
                        </div>
                      ) : (
                        handoverLogs.map((log) => (
                          <div 
                            key={log.id} 
                            className="grid py-5 items-center text-[11px] font-bold text-foreground-secondary border-b border-border-secondary bg-bg-card/90 backdrop-blur-[2px] transition-all hover:bg-bg-hover/40 group mb-0" 
                            style={{ gridTemplateColumns: handoverGridTemplate }}
                          >
                             <div className="px-6 flex items-center justify-center">
                                <History size={16} className="text-accent-purple opacity-40 group-hover:opacity-100 transition-all" />
                             </div>
                             <div className="px-6 flex flex-col justify-center gap-1.5 h-full">
                                <span className="text-foreground-primary uppercase font-black">
                                  {log.verifiedBy?.name || '---'}
                                </span>
                                <div className="flex -space-x-1.5">
                                   {log.team?.map(m => (
                                     <img key={m.id} src={m.avatar} className="w-5 h-5 rounded-md border border-bg-panel bg-bg-panel p-0.5 object-cover" title={m.name} />
                                   ))}
                                </div>
                             </div>
                             <div className="px-6 flex items-center italic text-foreground-secondary leading-relaxed h-full line-clamp-3 overflow-hidden">
                                "{log.notes}"
                             </div>
                             <div className="px-6 flex flex-col justify-center items-center gap-0.5 h-full tabular-nums">
                                <span className="text-foreground-primary">
                                  {pulse(log.timestamp, { includeTime: false, style: 'dmy' })}
                                </span>
                                <span className="text-[9px] opacity-40">
                                  {pulse(log.timestamp, { includeTime: true, style: 'dmy' }).split(' ')[1]}
                                </span>
                             </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </StaggerItem>
        </div>

        <div className="space-y-8">
          <StaggerItem>
            <div className="premium-capsule p-8 h-full">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border-primary/20">
                <div className="p-2 rounded-xl bg-accent-indigo/10 text-accent-indigo">
                  <Clock size={20} strokeWidth={2.5} />
                </div>
                <h2 className="text-base font-black text-foreground-primary uppercase tracking-[0.2em] flex items-center gap-2">
                  {(t('ops.shift.title') as string)}
                  <InfoTooltip text={(t('settings.tooltips.ttShiftMgmt') as string)} />
                </h2>
              </div>

              <div className="space-y-6">
                {Object.entries(shiftConfig).map(([key, config]: [string, any]) => (
                  <div key={key} className="flex items-center justify-between p-4 rounded-2xl bg-bg-panel/30 border border-border-primary/10 group hover:border-accent-indigo/40 transition-all">
                    <div>
                      <h4 className="text-[10px] font-black text-foreground-primary uppercase tracking-widest">
                         {(t(`ops.shifts.${key}`) as string) === `ops.shifts.${key}` ? config.name : (t(`ops.shifts.${key}`) as string)}
                      </h4>
                      <p className="text-[11px] font-bold text-accent-indigo mt-1 tracking-tighter">{config.start} — {config.end}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-bg-panel/40 text-foreground-tertiary group-hover:text-accent-indigo transition-all">
                      <ChevronRight size={14} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-6 rounded-[2rem] bg-gradient-to-br from-accent-indigo/10 to-transparent border border-accent-indigo/20">
                 <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 size={14} className="text-status-success-text" />
                    <span className="text-[9px] font-black text-foreground-primary uppercase tracking-widest">{(t('ops.stats.sla') as string)}</span>
                 </div>
                 <div className="text-3xl font-black text-foreground-primary mb-2">98.4%</div>
                 <div className="h-1.5 w-full bg-bg-panel/40 rounded-full overflow-hidden">
                    <div className="h-full bg-status-success-text w-[98.4%]" />
                 </div>
                 <p className="text-[9px] font-black text-foreground-tertiary uppercase tracking-tight mt-3 opacity-60">
                   {(t('ops.stats.slaDesc') as string)}
                 </p>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="premium-capsule p-8 bg-status-warning-bg/5 border-status-warning-border/20">
               <div className="flex items-center gap-3 mb-6">
                  <AlertCircle size={20} className="text-status-warning-text" />
                  <h4 className="text-xs font-black text-foreground-primary uppercase tracking-[0.2em] flex items-center gap-2">
                      {(t('ops.tactical.title') as string)}
                      <InfoTooltip text={(t('settings.tooltips.ttAnalystIntel') as string)} />
                   </h4>
               </div>
               <p className="text-[11px] font-black text-foreground-secondary leading-relaxed uppercase tracking-tight">
                 {(t('ops.tactical.desc') as string)}
               </p>
            </div>
          </StaggerItem>
        </div>
      </div>

      {/* Handover Modal */}
      <Modal 
        isOpen={isHandoverModalOpen} 
        onClose={() => setIsHandoverModalOpen(false)} 
        title={t('ops.handover.modal.title')}
        maxWidth="max-w-lg"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-2xl bg-accent-purple/10 text-accent-purple border-2 border-accent-purple/20">
            <ArrowRightLeft size={24} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] font-black text-foreground-tertiary uppercase tracking-widest opacity-60">{(t('ops.handover.modal.subtitle') as string)}</p>
          </div>
        </div>

        <form onSubmit={handleHandoverSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-foreground-tertiary uppercase tracking-[0.3em] pl-4">{(t('ops.handover.modal.label') as string)}</label>
            <textarea 
              required
              value={handoverNote}
              onChange={(e) => setHandoverNote(e.target.value)}
              placeholder={(t('ops.handover.modal.placeholder') as string)}
              className="premium-input w-full bg-bg-panel/20 min-h-[150px] !py-4"
            />
          </div>

          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={() => setIsHandoverModalOpen(false)}
              className="premium-button flex-1 !border-border-primary/20 !text-foreground-tertiary uppercase"
            >
              {(t('escalation.cancel') as string) || 'CANCEL'}
            </button>
            <button 
              type="submit" 
              className="premium-button flex-1 !bg-accent-purple !border-none !text-white !shadow-xl shadow-accent-purple/20 uppercase"
            >
              {(t('ops.handover.modal.submit') as string)}
            </button>
          </div>
        </form>
      </Modal>

      {/* Strategic Command HUD (Floating Operational Strip) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-fit">
        <div className="premium-capsule !p-2 flex items-center gap-3 bg-background-main/80 backdrop-blur-2xl border-2 border-accent-cyan/30 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-10 duration-1000">
          <div className="flex items-center gap-2 px-4 border-r border-border-primary/20">
            <Zap size={16} className="text-accent-cyan animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.2em] text-foreground-tertiary uppercase">TACTICAL OPS</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                trackActivity('MGMT_USER_ADD', 'Attempted to add new personnel to roster');
                showToast(t('common.bulk.none') || 'Personnel management system in read-only mode.', 'info');
              }}
              className="flex items-center gap-2.5 px-6 py-3 bg-bg-panel/40 border border-border-primary/40 text-foreground-primary rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-accent-cyan hover:text-background-main hover:border-accent-cyan transition-all"
            >
              <UserPlus size={14} strokeWidth={3} />
              {(t('ops.roster.add') as string)}
            </button>

            <div className="h-8 w-[2px] bg-border-primary/10 mx-1" />

            <button
              onClick={() => setIsHandoverModalOpen(true)}
              className="flex items-center gap-2.5 px-8 py-3 bg-accent-purple text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-accent-purple/20"
            >
              <ArrowRightLeft size={16} strokeWidth={3} />
              {(t('ops.handover.new') as string)}
            </button>
          </div>
        </div>
      </div>
    </StaggerGroup>
  );
}
