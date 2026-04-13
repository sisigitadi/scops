import React, { useState, useEffect } from 'react';
import { pulse, formatDDMMYYYY } from '../../utils/datePulse';
import { 
  ChevronLeft, ChevronRight, 
  Calendar as CalendarIcon, X, Plus, 
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOperations } from '../../context/OperationsContext';
import { useLanguage } from '../../context/LanguageContext';
import InfoTooltip from '../common/InfoTooltip';

/**
 * OperationalCalendar — Tactical SOC Rostering Suite
 * Manages future shift scheduling and unified team rotation planning with persistent storage.
 */

export default function OperationalCalendar() {
  const { t } = useLanguage();
  const { personnel, shiftConfig, schedules, addSchedule } = useOperations();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal Local State
  const [editingShift, setEditingShift] = useState<string | null>(null);
  const [selectedPersonnel, setSelectedPersonnel] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingShift) {
          setEditingShift(null);
        } else {
          setIsModalOpen(false);
        }
      }
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen, editingShift]);

  // Calendar Logic
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const handleDateClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setIsModalOpen(true);
  };

  const handleSaveShift = async () => {
    if (!selectedDate || !editingShift) return;
    await addSchedule(selectedDate, editingShift, selectedPersonnel);
    setEditingShift(null);
    setSelectedPersonnel([]);
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-8 px-2">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
          <CalendarIcon size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black text-foreground-primary uppercase tracking-[0.2em] flex items-center gap-2">
            {t('ops.calendar.title')}
            <InfoTooltip text={t('settings.tooltips.ttSchedules')} />
          </h2>
          <p className="text-[10px] font-bold text-foreground-tertiary uppercase tracking-widest opacity-60 mt-1">{t('ops.calendar.subtitle')}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 bg-bg-panel/40 p-2 rounded-2xl border border-border-primary/20">
        <button onClick={prevMonth} className="p-2.5 rounded-xl hover:bg-bg-panel text-foreground-tertiary transition-all"><ChevronLeft size={20} /></button>
        <span className="text-[11px] font-black text-foreground-primary uppercase tracking-[0.3em] min-w-[150px] text-center">
          {pulse(currentDate, { style: 'medium' }).split(' ').slice(1).join(' ')} 
        </span>
        <button onClick={nextMonth} className="p-2.5 rounded-xl hover:bg-bg-panel text-foreground-tertiary transition-all"><ChevronRight size={20} /></button>
      </div>
    </div>
  );

  const renderDays = () => {
    const days = (t('ops.calendar.daysAbbr') as any) || ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return (
      <div className="overflow-x-auto no-scrollbar">
        <div className="grid grid-cols-7 gap-px bg-border-primary/10 rounded-t-[2rem] overflow-hidden border-x border-t border-border-primary/10 min-w-[700px] sm:min-w-0">
          {(days as string[]).map(d => (
            <div key={d} className="bg-bg-panel/20 py-4 text-center">
              <span className="text-[9px] font-black text-foreground-tertiary tracking-widest">{d}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCells = () => {
    const totalDays = daysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const startDay = firstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
    const cells = [];

    for (let i = 0; i < startDay; i++) {
       cells.push(<div key={`empty-${i}`} className="bg-transparent h-40 border border-border-primary/5" />);
    }

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];
      const isToday = new Date().toISOString().split('T')[0] === dateStr;
      const daySchedules = schedules[dateStr];

      cells.push(
        <motion.div 
          key={day}
          whileHover={{ scale: 0.98, zIndex: 10 }}
          onClick={() => handleDateClick(day)}
          className={`
            bg-bg-card/30 h-40 p-4 border border-border-primary/5 transition-all cursor-pointer relative group
            ${isToday ? 'bg-accent-cyan/5 !border-accent-cyan/20' : 'hover:bg-bg-panel/40'}
          `}
        >
          <div className="flex justify-between items-start mb-2 relative z-10">
            <span className={`text-sm font-black ${isToday ? 'text-accent-cyan' : 'text-foreground-secondary opacity-60 group-hover:opacity-100'}`}>
              {String(day).padStart(2, '0')}
            </span>
            
            <div className="flex flex-col gap-1 items-end">
                {daySchedules && Object.keys(daySchedules).filter(k => daySchedules[k].length > 0).length >= 1 && (
                  <div className="bg-status-success-text/10 px-1 py-0.5 rounded border border-status-success-text/20">
                     <span className="text-[5px] font-black text-status-success-text uppercase tracking-tighter">{t('ops.calendar.ready')}</span>
                  </div>
                )}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1 flex bg-bg-panel/60">
            {['shift1', 'shift2', 'shift3'].map(sId => {
              const hasAssigned = daySchedules && daySchedules[sId] && daySchedules[sId].length > 0;
              return (
                <div 
                  key={sId} 
                  className={`flex-1 transition-all ${hasAssigned ? (sId === 'shift1' ? 'bg-accent-cyan' : sId === 'shift2' ? 'bg-accent-purple' : 'bg-amber-500') : 'bg-transparent'}`}
                />
              );
            })}
          </div>

          <div className="space-y-1.5 mt-2 relative z-10">
            {daySchedules && Object.entries(daySchedules).map(([sId, analysts]) => (
              analysts.length > 0 && (
                <div key={sId} className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                     <div className={`w-0.5 h-2.5 rounded-full ${sId === 'shift1' ? 'bg-accent-cyan' : sId === 'shift2' ? 'bg-accent-purple' : 'bg-amber-500'}`} />
                     <span className="text-[7px] font-black uppercase text-foreground-tertiary">
                       S{sId.slice(-1)}
                     </span>
                  </div>
                  <div className="flex -space-x-1">
                    {analysts.slice(0, 2).map((aId, i) => {
                      const a = personnel.find(p => p.id === aId);
                      return a ? (
                        <img key={i} src={a.avatar} className="w-3 h-3 rounded-full border border-bg-card" alt="" title={a.name} />
                      ) : null;
                    })}
                  </div>
                </div>
              )
            ))}
          </div>
        </motion.div>
      );
    }

    return (
      <div className="overflow-x-auto no-scrollbar pb-4 rounded-b-[2rem]">
        <div className="grid grid-cols-7 gap-px border border-border-primary/10 rounded-b-[2rem] overflow-hidden min-w-[700px] sm:min-w-0">
          {cells}
        </div>
      </div>
    );
  };

  return (
    <div className="premium-capsule p-8 sm:p-10 mb-20">
      {renderHeader()}
      {renderDays()}
      {renderCells()}

      <AnimatePresence>
        {isModalOpen && selectedDate && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl premium-capsule bg-bg-card shadow-2xl overflow-hidden p-8">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-border-primary/20">
                <div>
                  <h3 className="text-xl font-black text-foreground-primary tracking-widest uppercase">
                    {t('ops.calendar.modal.title')}
                  </h3>
                  <p className="text-[10px] font-bold text-accent-cyan uppercase tracking-widest mt-1">
                    {pulse(selectedDate, { style: 'full' })}
                  </p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 rounded-2xl hover:bg-bg-panel border border-border-primary/20 text-foreground-tertiary transition-all"><X size={20} /></button>
              </div>

              <div className="space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar pr-2">
                {Object.entries(shiftConfig).map(([sId, config]) => (
                  <div key={sId} className="premium-card !p-6 border-border-primary/10 hover:border-accent-cyan/40 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${sId === 'shift1' ? 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20' : sId === 'shift2' ? 'bg-accent-purple/10 text-accent-purple border-accent-purple/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'} border-2`}>
                          <Clock size={16} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-foreground-primary uppercase tracking-widest">
                             {t(`ops.shifts.${sId}`) === `ops.shifts.${sId}` ? config.name : t(`ops.shifts.${sId}`)}
                          </h4>
                          <span className="text-[9px] font-bold text-foreground-tertiary uppercase tracking-widest">{config.start} - {config.end}</span>
                        </div>
                      </div>
                      <button 
                         onClick={() => {
                           setEditingShift(sId);
                           setSelectedPersonnel(schedules[selectedDate]?.[sId] || []);
                         }}
                         className="premium-button !py-2.5 !px-5 !text-[9px] !border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/5 uppercase font-bold"
                      >
                         <Plus size={14} className="mr-2" /> {t('ops.calendar.btn.assign')}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(schedules[selectedDate]?.[sId] || []).length === 0 ? (
                        <p className="text-[10px] font-medium text-foreground-tertiary italic opacity-40">{t('ops.calendar.noSchedule')}</p>
                      ) : (
                        schedules[selectedDate][sId].map(aId => {
                          const analyst = personnel.find(p => p.id === aId);
                          return analyst && (
                            <div key={aId} className="flex items-center gap-2 bg-bg-panel/40 px-3 py-1.5 rounded-xl border border-border-primary/10">
                              <img src={analyst.avatar} className="w-5 h-5 rounded-lg" alt="" />
                              <span className="text-[9px] font-black text-foreground-primary uppercase tracking-wider">{analyst.name}</span>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <AnimatePresence>
                      {editingShift === sId && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-6 pt-6 border-t border-border-primary/10">
                           <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                              {personnel.map(analyst => (
                                <button
                                  key={analyst.id}
                                  onClick={() => {
                                    setSelectedPersonnel(prev => 
                                      prev.includes(analyst.id) ? prev.filter(id => id !== analyst.id) : [...prev, analyst.id]
                                    );
                                  }}
                                  className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${selectedPersonnel.includes(analyst.id) ? 'border-accent-cyan bg-accent-cyan/5' : 'border-border-primary/10 bg-bg-panel/20 hover:border-border-primary/40'}`}
                                >
                                  <img src={analyst.avatar} className="w-8 h-8 rounded-xl" alt="" />
                                  <div className="text-left overflow-hidden">
                                     <p className="text-[9px] font-black text-foreground-primary uppercase truncate">{analyst.name}</p>
                                     <p className="text-[7px] font-bold text-foreground-tertiary uppercase truncate opacity-60">{analyst.role}</p>
                                  </div>
                                </button>
                              ))}
                           </div>
                           <div className="flex gap-3">
                              <button onClick={() => setEditingShift(null)} className="premium-button flex-1 !py-3 !text-[10px] !border-border-primary/40 text-foreground-secondary uppercase font-bold tracking-widest">{t('common.cancel')}</button>
                              <button onClick={handleSaveShift} className="premium-button flex-1 !py-3 !text-[10px] !bg-accent-cyan !border-none text-slate-900 uppercase font-bold tracking-widest shadow-xl shadow-accent-cyan/20">{t('ops.calendar.btn.save')}</button>
                           </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
