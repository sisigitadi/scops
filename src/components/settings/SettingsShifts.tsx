import React from 'react';
import { Clock, Users, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOperations } from '../../context/OperationsContext';
import { useLanguage } from '../../context/LanguageContext';
import InfoTooltip from '../common/InfoTooltip';

/**
 * SettingsShifts — Temporal Operational Architecture
 * Orchestrates the definition of shift windows, mandatory team compositions, 
 * and operational accountability markers for the SOC ecosystem.
 */

interface SettingsShiftsProps {
  isReadOnly: boolean;
  handleRestricted: () => void;
}

export default function SettingsShifts({ isReadOnly, handleRestricted }: SettingsShiftsProps) {
  const { t } = useLanguage();
  const { shiftConfig, setShiftConfig, trackActivity } = useOperations();

  const handleUpdate = (shiftId: string, field: string, value: any) => {
    if (isReadOnly) {
      handleRestricted();
      return;
    }
    const targetShift = shiftConfig[shiftId];
    setShiftConfig(prev => ({
      ...prev,
      [shiftId]: { ...prev[shiftId], [field]: value }
    }));
    
    if (field !== 'name') {
      trackActivity('CONFIG_SHIFT_UPDATE', `Updated ${targetShift?.name || shiftId} ${field} to ${value}`);
    }
  };

  const addShift = () => {
    if (isReadOnly) {
       handleRestricted();
       return;
    }
    const id = `shift-${Date.now()}`;
    setShiftConfig(prev => ({
      ...prev,
      [id]: { name: 'New Shift', start: '09:00', end: '17:00', minL1: 1, minLead: 1 }
    }));
    trackActivity('CONFIG_SHIFT_ADD', `New operational shift window defined: ${id}`);
  };

  const removeShift = (shiftId: string) => {
    if (isReadOnly) {
       handleRestricted();
       return;
    }
    const targetShift = shiftConfig[shiftId];
    const updated = { ...shiftConfig };
    delete updated[shiftId];
    setShiftConfig(updated);
    trackActivity('CONFIG_SHIFT_DELETE', `Operational shift window removed: ${targetShift?.name || shiftId}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="premium-capsule p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b-2 border-border-primary/20 pb-8 font-bold">
          <div className="flex items-center gap-4">
             <div className="p-3 rounded-2xl bg-accent-indigo/10 text-accent-indigo border-2 border-accent-indigo/10">
                <Clock size={24} strokeWidth={2.5} />
             </div>
             <div>
                <h3 className="text-xl font-black text-foreground-primary uppercase tracking-[0.2em] flex items-center gap-2">
                   {(t('settings.groupShifts') as string) || 'Manajemen Shift & Penjadwalan'}
                   <InfoTooltip text={(t('settings.tooltips.ttShiftMgmt') as string)} />
                </h3>
                <p className="text-[10px] font-black text-foreground-tertiary uppercase tracking-widest opacity-60 mt-1">
                   {(t('settings.groupShiftsDesc') as string)}
                </p>
             </div>
          </div>
          <button 
            onClick={addShift}
            disabled={isReadOnly}
            className={`premium-button !py-4 !px-8 !text-[11px] !border-accent-indigo/30 !text-accent-indigo hover:!bg-accent-indigo/10 font-black tracking-widest ${isReadOnly ? 'opacity-30' : ''}`}
          >
            <Plus size={16} className="mr-2" /> {(t('settings.shifts.addShift') as string)}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-bold">
           <AnimatePresence mode="popLayout">
             {Object.entries(shiftConfig).map(([id, config]) => (
               <motion.div 
                 layout
                 key={id}
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="premium-card !p-8 relative overflow-hidden group hover:border-accent-indigo/40 transition-all font-black"
               >
                  <div className="flex justify-between items-start mb-8">
                     <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <input 
                             type="text"
                             value={
                               (config.name === 'Shift Pagi' || config.name === 'Morning Shift' || 
                                config.name === 'Shift Sore' || config.name === 'Afternoon Shift' || 
                                config.name === 'Shift Malam' || config.name === 'Night Shift')
                               ? (t(`ops.shifts.${id}`) === `ops.shifts.${id}` ? config.name : (t(`ops.shifts.${id}`) as string))
                               : config.name
                             }
                             disabled={isReadOnly}
                             onChange={(e) => handleUpdate(id, 'name', e.target.value)}
                             className="bg-transparent border-none text-lg font-black text-foreground-primary uppercase tracking-widest focus:ring-0 p-0 w-full"
                             placeholder={(t('settings.shifts.shiftName') as string)}
                          />
                          <InfoTooltip text={(t('settings.tooltips.shiftName') as string)} />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-black text-accent-indigo uppercase tracking-widest">{(t('settings.shifts.opsWindow') as string)}</span>
                            <InfoTooltip text={(t('settings.tooltips.shiftWindow') as string)} />
                        </div>
                     </div>
                     {!isReadOnly && (
                        <button 
                          onClick={() => removeShift(id)}
                          className="p-2.5 rounded-xl bg-bg-panel/40 text-foreground-tertiary hover:text-status-danger-text transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                     )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-foreground-tertiary uppercase tracking-widest pl-2">{(t('settings.shifts.startTime') as string)}</label>
                        <div className="relative">
                           <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-tertiary" size={14} />
                           <input 
                              type="text" 
                              value={config.start}
                              disabled={isReadOnly}
                              onChange={(e) => handleUpdate(id, 'start', e.target.value.replace(/[^0-9:]/g, ''))}
                              onBlur={(e) => {
                                 let val = e.target.value;
                                 if (/^\d{1,2}$/.test(val)) val = `${val.padStart(2, '0')}:00`;
                                 else if (/^\d{1,2}:\d{1,2}$/.test(val)) {
                                    const [h, m] = val.split(':');
                                    val = `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
                                 }
                                 handleUpdate(id, 'start', val);
                              }}
                              placeholder="00:00"
                              maxLength={5}
                              className="premium-input w-full !pl-10 !pr-2 !text-[11px] sm:!text-xs !font-black min-w-[120px]"
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-foreground-tertiary uppercase tracking-widest pl-2">{(t('settings.shifts.endTime') as string)}</label>
                        <div className="relative">
                           <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-tertiary" size={14} />
                           <input 
                              type="text" 
                              value={config.end}
                              disabled={isReadOnly}
                              onChange={(e) => handleUpdate(id, 'end', e.target.value.replace(/[^0-9:]/g, ''))}
                              onBlur={(e) => {
                                 let val = e.target.value;
                                 if (/^\d{1,2}$/.test(val)) val = `${val.padStart(2, '0')}:00`;
                                 else if (/^\d{1,2}:\d{1,2}$/.test(val)) {
                                    const [h, m] = val.split(':');
                                    val = `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
                                 }
                                 handleUpdate(id, 'end', val);
                              }}
                              placeholder="00:00"
                              maxLength={5}
                              className="premium-input w-full !pl-10 !pr-2 !text-[11px] sm:!text-xs !font-black min-w-[120px]"
                           />
                        </div>
                     </div>
                  </div>

                  <div className="bg-bg-panel/30 rounded-3xl p-6 border border-border-primary/10">
                     <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                           <Users size={14} className="text-accent-indigo" />
                           <span className="text-[10px] font-black text-foreground-primary uppercase tracking-widest">{(t('settings.shifts.minPersonnel') as string)}</span>
                           <InfoTooltip text={(t('settings.tooltips.shiftStaffing') as string)} />
                        </div>
                        <span className="text-sm font-black text-accent-indigo bg-accent-indigo/10 px-3 py-1 rounded-xl border border-accent-indigo/20">
                           {config.minL1 || 1}
                        </span>
                     </div>
                     
                     <div className="space-y-4">
                        <input 
                           type="range" min="1" max="15" 
                           value={config.minL1 || 1}
                           disabled={isReadOnly}
                           onChange={(e) => handleUpdate(id, 'minL1', parseInt(e.target.value))}
                           className="accent-accent-indigo w-full h-2 bg-bg-panel rounded-full appearance-none cursor-pointer transition-all hover:bg-bg-panel/60"
                        />
                        <p className="text-[9px] font-bold text-foreground-tertiary uppercase tracking-widest opacity-60 text-center">
                           {(t('settings.shifts.minPersonnelDesc') as string)}
                        </p>
                     </div>
                  </div>
               </motion.div>
             ))}
           </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
