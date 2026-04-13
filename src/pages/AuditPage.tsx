import React, { useState, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Search, 
  Clock, 
  User, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Download,
  Terminal,
  History,
  Cpu,
  ShieldAlert,
  ChevronDown,
  Tag,
  Monitor,
  Key,
  Layers,
  Settings as SettingsIcon,
  Database,
  Database as DatabaseIcon
} from 'lucide-react';
import InfoTooltip from '../components/common/InfoTooltip';
import { useOperations } from '../context/OperationsContext';
import { useAlertData } from '../context/AlertDataContext';
import { useLanguage } from '../context/LanguageContext';
import { StaggerGroup, StaggerItem } from '../components/common/StaggerFadeIn';
import SensitiveText from '../components/common/SensitiveText';
import { formatDDMMYYYY, pulse, pulseParts } from '../utils/datePulse';
import { exportToCsv, exportToJson } from '../utils/exportUtils';
import ExportPreviewModal from '../components/alerts/ExportPreviewModal';
import { useToast } from '../context/ToastContext';

/**
 * AuditPage — Forensic System Logs
 * Standardized interface for tracking all system activities with detailed diffing and accountability metrics.
 */

export default function AuditPage() {
  const { auditLogs } = useOperations();
  const { alerts, systemLogs } = useAlertData();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'ACCOUNTABILITY' | 'TECHNICAL'>('ACCOUNTABILITY');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const { showToast } = useToast();
  
  const [exportConfig, setExportConfig] = useState<{ isOpen: boolean; format: 'csv' | 'json'; data: any[] | null }>({ 
    isOpen: false, 
    format: 'csv', 
    data: null 
  });

  const auditGridTemplate = 'minmax(110px, 0.8fr) minmax(140px, 1fr) minmax(160px, 1.2fr) minmax(280px, 2.5fr) 70px';
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Accountability Logs (Human/Process centric)
  const accountabilityLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesSearch = 
        (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.actor?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.details || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.category || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterType === 'ALL' || (log.category === filterType) || (log.action || '').includes(filterType);
      return matchesSearch && matchesFilter;
    });
  }, [auditLogs, searchTerm, filterType]);

  // Technical Logs (Data/Infrastructure centric)
  const technicalLogs = useMemo(() => {
    const logs: any[] = [];
    
    // Alert Histories
    alerts.forEach(alert => {
      if (Array.isArray(alert.history)) {
        alert.history.forEach(entry => {
          logs.push({
            ...entry,
            type: 'alert',
            alertId: alert.id,
            ruleDescription: alert.ruleDescription,
            timestamp: entry.timestamp
          });
        });
      }
    });

    // System Infrastructure Logs
    systemLogs.forEach(log => {
      logs.push({
        ...log,
        type: 'system',
        alertId: 'SYSTEM',
        ruleDescription: log.action || (t('audit.technical.administrativeAction') as string),
        details: log.details || '',
        timestamp: log.timestamp
      });
    });

    const sorted = logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return sorted.filter(log => {
      const term = searchTerm.toLowerCase();
      return (
        (log.user || '').toLowerCase().includes(term) ||
        (log.alertId || '').toLowerCase().includes(term) ||
        (log.details || '').toLowerCase().includes(term) ||
        (log.ruleDescription || '').toLowerCase().includes(term)
      );
    });
  }, [alerts, systemLogs, searchTerm]);

  const currentLogs = activeTab === 'ACCOUNTABILITY' ? accountabilityLogs : technicalLogs;

  const rowVirtualizer = useVirtualizer({
    count: currentLogs.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 85,
    overscan: 10,
  });

  const getResultBadge = (result: string) => {
    if (result === 'SUCCESS') return <CheckCircle2 size={14} className="text-status-success-text" />;
    if (result === 'FAILURE') return <XCircle size={14} className="text-status-danger-text" />;
    return <AlertTriangle size={14} className="text-status-warning-text" />;
  };

  const getCategoryTheme = (category?: string) => {
    switch (category) {
      case 'AUTH': return { color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: <Key size={10} /> };
      case 'USER_MANAGEMENT': return { color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20', icon: <User size={10} /> };
      case 'CONFIGURATION': return { color: 'text-purple-400 bg-purple-400/10 border-purple-400/20', icon: <SettingsIcon size={10} /> };
      case 'SHIFT': return { color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: <Clock size={10} /> };
      case 'MANAGEMENT': return { color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20', icon: <Layers size={10} /> };
      default: return { color: 'text-foreground-tertiary bg-bg-panel/40 border-border-primary/10', icon: <Tag size={10} /> };
    }
  };

  const renderDiff = (changes: any) => {
    if (!changes) return null;
    
    if (changes.type === 'CREATE' || (!changes.before && changes.after)) {
      return (
        <div className="mt-4 p-4 rounded-2xl bg-status-success-bg/5 border border-status-success-border/10">
          <p className="text-[10px] font-black text-status-success-text uppercase tracking-widest mb-3 flex items-center gap-2">
            <CheckCircle2 size={12} /> {t('audit.diff.initial')}
          </p>
          <pre className="text-[10px] font-mono text-foreground-secondary opacity-80 leading-relaxed overflow-x-auto">
            {JSON.stringify(changes.after || changes, null, 2)}
          </pre>
        </div>
      );
    }

    // Case 2: Deletion
    if (changes.type === 'DELETE' || (changes.before && !changes.after)) {
       return (
        <div className="mt-4 p-4 rounded-2xl bg-status-danger-bg/5 border border-status-danger-border/10">
          <p className="text-[10px] font-black text-status-danger-text uppercase tracking-widest mb-3 flex items-center gap-2">
            <XCircle size={12} /> {t('audit.diff.purged')}
          </p>
          <pre className="text-[10px] font-mono text-foreground-secondary opacity-60 leading-relaxed overflow-x-auto">
            {JSON.stringify(changes.before || changes, null, 2)}
          </pre>
        </div>
      );
    }

    // Case 3: Update (Structured Diff)
    return (
      <div className="mt-4 space-y-3">
        {Object.entries(changes).map(([key, diff]: [string, any]) => (
          <div key={key} className="grid grid-cols-2 gap-4">
             <div className="p-3 rounded-xl bg-bg-panel/20 border border-border-primary/10">
                <span className="text-[8px] font-black text-foreground-tertiary uppercase tracking-widest block mb-1">{t('audit.diff.before').replace('{key}', key)}</span>
                <span className="text-[10px] font-bold text-foreground-secondary block truncate">
                  {typeof diff.before === 'object' ? JSON.stringify(diff.before) : String(diff.before)}
                </span>
             </div>
             <div className="p-3 rounded-xl bg-accent-cyan/5 border border-accent-cyan/20">
                <span className="text-[8px] font-black text-accent-cyan uppercase tracking-widest block mb-1">{t('audit.diff.after').replace('{key}', key)}</span>
                <span className="text-[10px] font-bold text-foreground-primary block truncate">
                  {typeof diff.after === 'object' ? JSON.stringify(diff.after) : String(diff.after)}
                </span>
             </div>
          </div>
        ))}
      </div>
    );
  };
  
  const handleExportInitiate = () => {
    if (currentLogs.length === 0) {
      showToast(t('common.bulk.none') || 'No records to export', 'error');
      return;
    }
    
    // Default to CSV for forensic audit exports
    setExportConfig({
      isOpen: true,
      format: 'csv',
      data: currentLogs.map(l => ({
        timestamp: l.timestamp,
        action: l.action || l.type,
        actor: l.actor?.name || l.user || 'SYSTEM',
        category: l.category || 'TECHNICAL',
        details: l.details || l.ruleDescription,
        result: l.result || 'N/A'
      }))
    });
  };

  const confirmExport = () => {
    if (!exportConfig.data) return;
    const filename = `SOCOPS_AUDIT_${activeTab}_${new Date().toISOString().split('T')[0]}`;
    
    if (exportConfig.format === 'csv') {
      exportToCsv(filename, exportConfig.data);
    } else {
      exportToJson(filename, exportConfig.data);
    }
    
    trackActivity('AUDIT_EXPORT', `Exported ${exportConfig.data.length} ${activeTab} logs as ${exportConfig.format.toUpperCase()}`);
    showToast(t('alerts.messages.exportSuccess') || 'Export initiated successfully.', 'success');
  };

  return (
    <div className="pb-20">
      <StaggerGroup delay={0.1} stagger={0.05}>
        <StaggerItem>
          <header className="premium-capsule p-8 sm:p-10 mb-8 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
              <div className="flex items-center gap-6">
                <div className="p-4 rounded-3xl bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan">
                  <Shield size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-4xl font-black text-foreground-primary uppercase tracking-[0.2em] leading-none flex items-center gap-3">
                    {t('nav.audit')}
                    <InfoTooltip text={(t('settings.tooltips.ttForensicLog') as string)} />
                  </h1>
                  <p className="mt-3 text-[10px] font-black text-foreground-tertiary uppercase tracking-widest opacity-70">
                    {t('common.forensicDoc')} • {t('common.reliabilityTracking')}
                  </p>
                </div>
              </div>

            </div>
          </header>
        </StaggerItem>



        <StaggerItem>
           <div className="flex flex-col lg:flex-row gap-6 mb-8 items-start lg:items-center">
              <div className="flex p-1.5 bg-bg-panel/40 border border-border-primary/20 rounded-2xl md:w-fit">
                 {[
                  { id: 'ACCOUNTABILITY', label: t('audit.tabAccountability'), icon: <User size={14} /> },
                  { id: 'TECHNICAL', label: t('audit.tabTechnical'), icon: <DatabaseIcon size={14} /> }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id as any); setFilterType('ALL'); }}
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeTab === tab.id ? 'bg-accent-cyan border border-accent-cyan/40 text-background-main shadow-lg shadow-accent-cyan/20' : 'text-foreground-tertiary hover:text-foreground-primary'}`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 w-full relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-tertiary" size={16} />
                 <input 
                   type="text"
                   placeholder={(t('audit.searchPlaceholder') as string)}
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="premium-input w-full !pl-12 !py-4 bg-bg-panel/40 text-[10px] font-bold tracking-widest placeholder:opacity-30"
                 />
              </div>

              {activeTab === 'ACCOUNTABILITY' && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 custom-scrollbar">
                   {['ALL', 'AUTH', 'USER_MANAGEMENT', 'CONFIGURATION', 'SHIFT', 'MANAGEMENT'].map(type => (
                     <button
                       key={type}
                       onClick={() => setFilterType(type)}
                       className={`px-4 py-2.5 rounded-xl border text-[9px] font-black tracking-widest transition-all whitespace-nowrap ${filterType === type ? 'bg-bg-panel border-accent-cyan text-accent-cyan' : 'bg-bg-panel/40 border-border-primary/20 text-foreground-tertiary hover:border-accent-cyan/40'}`}
                     >
                       {t(`audit.categories.${type}`)}
                     </button>
                   ))}
                </div>
              )}
           </div>
        </StaggerItem>
        <StaggerItem>
          <div className="premium-capsule p-0 overflow-visible bg-bg-panel/80 backdrop-blur-2xl">
            <div className="px-8 py-5 bg-bg-panel/60 border-b-2 border-border-primary flex items-center justify-between gap-6 relative z-10 font-black">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-cyan bg-accent-cyan/10 px-6 py-2 rounded-xl border border-accent-cyan/20">
                {currentLogs.length} {(t('audit.recordsFound') as string)}
              </span>
              <div className="flex items-center gap-3 opacity-40">
                <Shield size={14} className="text-accent-cyan" />
                <span className="text-[10px] uppercase tracking-widest">{(t('common.integrityVerified') as string)}</span>
              </div>
            </div>

            <div className="p-4 bg-bg-panel/10">
              <div 
                ref={tableContainerRef}
                className="overflow-x-auto overflow-y-auto max-h-[70vh] custom-scrollbar rounded-2xl border border-border-primary/20 bg-bg-panel/60 relative"
              >
                <div className="min-w-[800px] lg:min-w-full relative">
                  <div
                    className="grid sticky top-0 z-50 bg-bg-panel border-y-2 border-border-primary text-[10px] font-black text-foreground-tertiary uppercase tracking-[0.2em]"
                    style={{ gridTemplateColumns: auditGridTemplate }}
                  >
                    <div className="px-6 py-5 border-r border-border-primary/20 flex items-center bg-bg-panel/40 shadow-inner">{t('audit.headers.timestamp')}</div>
                    <div className="px-6 py-5 border-r border-border-primary/20 flex items-center bg-bg-panel/20">{t('audit.headers.category')}</div>
                    <div className="px-6 py-5 border-r border-border-primary/20 flex items-center bg-bg-panel/40 shadow-inner">{t('audit.headers.actor')}</div>
                    <div className="px-6 py-5 border-r border-border-primary/20 flex items-center bg-bg-panel/20">{t('audit.headers.details')}</div>
                    <div className="px-6 py-5 flex items-center justify-center bg-bg-panel/40 shadow-inner">{t('audit.headers.status')}</div>
                  </div>

                  {currentLogs.length === 0 ? (
                    <div className="sticky left-0 w-full py-24 flex flex-col items-center justify-center text-foreground-muted font-black uppercase tracking-widest opacity-40">
                      {activeTab === 'ACCOUNTABILITY' ? <Terminal size={48} className="mb-4" /> : <DatabaseIcon size={48} className="mb-4" />}
                      <p>{(t('audit.noRecordsFound') as string)}</p>
                    </div>
                  ) : (
                    <div className="relative" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
                      {/* Continuous Column Borders Overlay (Shared) */}
                      <div className="absolute inset-0 pointer-events-none z-0">
                        <div className="grid h-full" style={{ gridTemplateColumns: auditGridTemplate }}>
                          <div className="border-r border-border-primary/20 h-full bg-accent-cyan/[0.01]" />
                          <div className="border-r border-border-primary/20 h-full bg-black/5" />
                          <div className="border-r border-border-primary/20 h-full bg-accent-cyan/[0.01]" />
                          <div className="border-r border-border-primary/20 h-full bg-black/5" />
                          <div className="h-full bg-accent-cyan/[0.01]" />
                        </div>
                      </div>

                      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const log = currentLogs[virtualRow.index];
                        const theme = getCategoryTheme(log.category);
                        const isExpanded = expandedLogId === log.id;
                        const hasChanges = activeTab === 'ACCOUNTABILITY' && log.changes;
                        const parts = pulseParts(log.timestamp);

                        return (
                          <div 
                            key={virtualRow.key}
                            className={`absolute left-0 top-0 w-full transition-all border-b border-border-secondary z-10 ${isExpanded ? 'bg-bg-panel/40 ring-1 ring-accent-cyan/20 ring-inset shadow-2xl z-[30]' : 'bg-bg-card/90 backdrop-blur-[2px] hover:bg-bg-hover/40 z-[10]'}`}
                            style={{
                              height: isExpanded ? 'auto' : `${virtualRow.size}px`,
                              transform: `translateY(${virtualRow.start}px)`
                            }}
                          >
                            <div 
                              onClick={() => hasChanges && setExpandedLogId(isExpanded ? null : log.id)}
                              className={`grid h-[85px] items-stretch text-[10px] font-bold text-foreground-secondary relative z-20 ${hasChanges ? 'cursor-pointer' : ''}`}
                              style={{ gridTemplateColumns: auditGridTemplate }}
                            >
                               <div className="px-6 flex flex-col justify-center gap-0.5 whitespace-nowrap tabular-nums">
                                   <span className="text-foreground-primary">{parts.date}</span>
                                   <span className="text-[9px] opacity-40">{parts.time}</span>
                               </div>
                               <div className="px-6 flex items-center min-w-0">
                                   {activeTab === 'ACCOUNTABILITY' ? (
                                     <div className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-2 w-fit ${theme.color}`}>
                                       {theme.icon}
                                       <span className="text-[8px] font-black tracking-widest uppercase whitespace-nowrap">
                                         {t(`audit.categories.${log.category}`) || log.category || t('system.general')}
                                       </span>
                                     </div>
                                   ) : (
                                     <div className="flex flex-col">
                                       <span className={`px-2 py-0.5 rounded text-[8px] font-black w-fit mb-1 border uppercase tracking-widest ${log.type === 'system' ? 'border-status-warning-border bg-status-warning-bg text-status-warning-text' : 'border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan'}`}>
                                         {log.alertId}
                                       </span>
                                       <span className="text-[9px] font-bold text-foreground-tertiary leading-tight">{log.ruleDescription}</span>
                                     </div>
                                   )}
                               </div>
                               <div className="px-6 flex items-center gap-3 overflow-hidden">
                                   <div className="w-8 h-8 rounded-lg bg-bg-panel flex items-center justify-center border border-border-primary/20 overflow-hidden shrink-0 shadow-inner">
                                     {log.actor?.avatar ? (
                                       <img src={log.actor.avatar} className="w-full h-full object-cover" alt="" />
                                     ) : (
                                       <User size={14} className="text-foreground-secondary opacity-40" />
                                     )}
                                   </div>
                                   <div className="flex flex-col min-w-0 border-r border-border-primary/10 pr-4">
                                     <span className="text-[10px] font-bold text-foreground-primary truncate font-black tracking-tight">
                                       <SensitiveText value={log.actor?.name || log.user || t('common.system')} />
                                     </span>
                                     {activeTab === 'ACCOUNTABILITY' && (
                                       <span className="text-[8px] font-black text-accent-cyan uppercase tracking-widest opacity-70 truncate">{log.actor?.role}</span>
                                     )}
                                   </div>
                               </div>
                               <div className="px-6 flex items-center min-w-0">
                                 <p className="text-[10px] font-medium text-foreground-secondary leading-tight uppercase">
                                   <SensitiveText value={(log.details || '')
                                     .replace('Platform Configuration Update: ', '')
                                     .replace(/^[A-Z_]+: /, '')} 
                                   />
                                 </p>
                               </div>
                               <div className="px-6 flex justify-center items-center gap-3">
                                   {activeTab === 'ACCOUNTABILITY' ? (
                                     <>
                                       {getResultBadge(log.result)}
                                       {hasChanges && (
                                         <div className={`p-1 rounded bg-bg-panel border border-border-primary/20 ${isExpanded ? 'text-accent-cyan rotate-180' : 'text-foreground-tertiary'} transition-all`}>
                                           <ChevronDown size={12} />
                                         </div>
                                       )}
                                     </>
                                   ) : (
                                     log.type === 'system' ? <Cpu size={14} className="text-status-warning-text opacity-40" /> : <ShieldAlert size={14} className="text-accent-cyan opacity-40" />
                                   )}
                               </div>
                            </div>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden bg-bg-panel/40 backdrop-blur-md relative z-20"
                                >
                                  <div className="px-8 pb-8 pt-4 border-t border-border-primary/10">
                                    <div className="flex items-center gap-3 mb-6">
                                      <div className="p-1.5 rounded-lg bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
                                        <History size={14} />
                                      </div>
                                      <span className="text-[10px] font-black text-foreground-primary uppercase tracking-[0.2em]">{t('audit.details.title')}</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                      <div className="md:col-span-2">
                                         {renderDiff(log.changes)}
                                      </div>
                                      <div className="space-y-4">
                                         <div className="p-4 rounded-xl bg-bg-panel/40 border border-border-primary/10 shadow-inner">
                                            <span className="text-[8px] font-black text-foreground-tertiary uppercase tracking-widest block mb-3 opacity-50">{(t('audit.details.metadata') as string)}</span>
                                            <div className="space-y-3">
                                               <div className="flex justify-between items-center text-[9px] font-bold">
                                                  <span className="opacity-40 uppercase">{(t('audit.details.target') as string)}</span>
                                                  <span className="text-accent-cyan uppercase bg-accent-cyan/10 px-2 py-0.5 rounded">{log.metadata?.source || 'WEB-CLIENT'}</span>
                                               </div>
                                               <div className="flex justify-between items-center text-[9px] font-bold">
                                                  <span className="opacity-40 uppercase">{(t('audit.details.txHash') as string)}</span>
                                                  <span className="text-accent-cyan font-mono opacity-80">{log.txHash || log.id}</span>
                                               </div>
                                               <div className="flex justify-between items-center text-[9px] font-bold">
                                                  <span className="opacity-40 uppercase">{(t('audit.details.result') as string)}</span>
                                                   <span className={log.result === 'SUCCESS' ? 'text-status-success-text' : 'text-status-danger-text'}>
                                                     {log.result === 'SUCCESS' ? (t('audit.results.success') as string) : (log.result === 'FAILURE' ? (t('audit.results.failure') as string) : log.result)}
                                                   </span>
                                               </div>
                                               <div className="border-t border-border-primary/10 pt-3 flex justify-between items-center text-[9px] font-bold">
                                                  <span className="opacity-40 uppercase">{(t('audit.details.actionType') as string)}</span>
                                                  <span className="text-foreground-secondary uppercase">{log.action || 'CRUD_ACTION'}</span>
                                               </div>
                                            </div>
                                         </div>
                                         <div className="p-4 rounded-xl bg-bg-panel/40 border border-border-primary/10 shadow-inner">
                                            <span className="text-[8px] font-black text-foreground-tertiary uppercase tracking-widest block mb-3 opacity-50">{(t('audit.details.actorIdentity') as string)}</span>
                                            <div className="flex items-center gap-3">
                                              <div className="p-2.5 rounded-xl bg-bg-panel border border-border-primary/20 shadow-lg">
                                                <Monitor size={14} className="text-accent-cyan" />
                                              </div>
                                              <div className="min-w-0">
                                                <p className="text-[10px] font-black text-foreground-primary uppercase tracking-tight truncate"><SensitiveText value={log.actor?.name} /></p>
                                                <p className="text-[8px] font-bold text-foreground-tertiary uppercase opacity-40 truncate">{log.actor?.id || 'ID_N/A'}</p>
                                              </div>
                                            </div>
                                         </div>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </StaggerItem>
      </StaggerGroup>

      <ExportPreviewModal 
        isOpen={exportConfig.isOpen}
        onClose={() => setExportConfig(prev => ({ ...prev, isOpen: false }))}
        data={exportConfig.data || []}
        format={exportConfig.format}
        onConfirm={confirmExport}
      />
      {/* STRATEGIC COMMAND HUD (Floating Export Strip) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-fit">
        <div className="premium-capsule !p-2 flex items-center gap-3 bg-background-main/80 backdrop-blur-2xl border-2 border-accent-cyan/30 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-10 duration-1000">
          <div className="flex items-center gap-2 px-4 border-r border-border-primary/20">
            <Shield size={16} className="text-accent-cyan animate-pulse" />
          </div>

          <div className="flex items-center gap-2 whitespace-nowrap">
            <button
              onClick={handleExportInitiate}
              className="flex items-center gap-2.5 px-8 py-3 bg-accent-cyan text-background-main rounded-xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-accent-cyan/20"
            >
              <Download size={16} strokeWidth={3} />
              {t('common.exportLogs')}
            </button>

            <div className="hidden md:flex items-center gap-3 px-6 border-l border-border-primary/10">
              <div className="h-1.5 w-1.5 rounded-full bg-accent-cyan shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
              <span className="text-[8px] font-black text-foreground-tertiary uppercase tracking-[0.3em] opacity-60">{(t('common.integrityVerified') as string)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
