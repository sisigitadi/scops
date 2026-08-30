import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import AlertBadge from '../components/alerts/AlertBadge';
import InfoTooltip from '../components/common/InfoTooltip';
import { useAlertData } from '../context/AlertDataContext';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { CAPABILITIES, useAuth } from '../context/AuthContext';
import SensitiveText from '../components/common/SensitiveText';
import { localizeAlerts } from '../utils/wazuhLocalization';
import { RotateCcw, Search } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { StaggerGroup, StaggerItem } from '../components/common/StaggerFadeIn';
import { formatDDMMYYYY } from '../utils/datePulse';

/**
 * FalsePositivePage — Systematic Suppression Governance
 * High-performance virtualized register for auditing and restoring suppressed alert signatures.
 */

export default function FalsePositivePage() {
  const { language, t } = useLanguage();
  const { settings } = useSettings();
  const { alerts, updateAlertById, updateMultipleAlerts } = useAlertData();
  const { user, hasCapability } = useAuth();
  const { showToast } = useToast();
  const isReadOnly = !hasCapability(CAPABILITIES.MUTATE_FALSE_POSITIVE);
  const localizedAlerts = localizeAlerts(alerts, language);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fpAlerts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return localizedAlerts.filter((a) => {
      if (!a.isFalsePositive) return false;
      return !q || [a.id, a.ruleId, a.ruleDescription, a.hostname].join(' ').toLowerCase().includes(q);
    });
  }, [localizedAlerts, search]);

  const resolveText = (key: string, fallback: string) => {
    const translated = t(key);
    return translated === key ? fallback : (translated as string);
  };

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const fpIds = useMemo(() => fpAlerts.map((item) => item.id), [fpAlerts]);
  const allVisibleSelected = fpAlerts.length > 0 && fpIds.every((id) => selectedSet.has(id));
  const hasPartialSelection = selectedIds.length > 0 && !allVisibleSelected;

  useEffect(() => {
    const visibleSet = new Set(fpIds);
    setSelectedIds((prev) => prev.filter((id) => visibleSet.has(id)));
  }, [fpIds]);

  const selectAllRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!selectAllRef.current) return;
    selectAllRef.current.indeterminate = hasPartialSelection;
  }, [hasPartialSelection]);

  const toggleRowSelection = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(fpIds);
  };

  const handleRestricted = () => {
    showToast(t('common.restrictedNotice') as string);
  };

  const applyBulkRestore = () => {
    if (isReadOnly) {
      handleRestricted();
      return;
    }
    if (selectedIds.length === 0) {
      showToast(resolveText('fp.bulk.none', 'No false-positive alerts selected.'));
      return;
    }

    updateMultipleAlerts(selectedIds, { isFalsePositive: false, status: 'open' }, user?.name || 'System');
    showToast(`${selectedIds.length} ${t('fp.bulk.restored')}.`);
    setSelectedIds([]);
  };

  const applyBulkClose = () => {
    if (isReadOnly) {
      handleRestricted();
      return;
    }
    if (selectedIds.length === 0) {
      showToast(resolveText('fp.bulk.none', 'No false-positive alerts selected.'));
      return;
    }

    updateMultipleAlerts(selectedIds, { isFalsePositive: true, status: 'closed' }, user?.name || 'System');
    showToast(`${selectedIds.length} ${t('fp.bulk.closed')}.`);
    setSelectedIds([]);
  };

  const handleRestore = (id: string) => {
    if (isReadOnly) {
      handleRestricted();
      return;
    }
    updateAlertById(id, { isFalsePositive: false, status: 'open' }, user?.name || 'System');
  };

  const fpGridTemplate = '50px 120px minmax(130px, 0.7fr) minmax(130px, 0.7fr) minmax(400px, 3.5fr) minmax(140px, 0.8fr) minmax(150px, 0.7fr) 100px';
  const fpScrollRef = useRef<HTMLDivElement>(null);
  const fpRowVirtualizer = useVirtualizer({
    count: fpAlerts.length,
    getScrollElement: () => fpScrollRef.current,
    estimateSize: () => 105,
    overscan: 8
  });

  return (
    <StaggerGroup className="space-y-6" delay={0.1} stagger={0.1}>
      <StaggerItem>
        <section className="interactive-panel border-2 border-border-primary bg-bg-card p-7 shadow-sm transition-all duration-300 shine flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="hidden sm:block floating">
              <img 
                src={settings.appLogo || `${import.meta.env.BASE_URL}logo.png`} 
                alt="Logo" 
                className="h-16 w-16 object-contain drop-shadow-2xl" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground-primary sm:text-3xl uppercase tracking-widest leading-none">
                  {(t('fp.title') as string)}
                </h1>
                <InfoTooltip text={(t('tooltips.fpTitle') as string)} />
              </div>
              <p className="mt-2 text-sm text-foreground-secondary font-black uppercase tracking-tight">{(t('fp.subtitle') as string)}</p>
            </div>
          </div>
        </section>
      </StaggerItem>

      <StaggerItem>
        <section className="interactive-panel border-2 border-border-primary bg-bg-card p-6 shadow-sm transition-all duration-300 shine">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-tertiary" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={(t('fp.searchPlaceholder') as string)}
              className="w-full rounded-xl border-2 border-border-secondary bg-bg-panel pl-12 pr-4 py-3 text-sm text-foreground-primary placeholder:text-foreground-muted focus:border-border-focus focus:outline-none transition-all font-bold uppercase tracking-tight shadow-inner"
            />
          </div>
        </section>
      </StaggerItem>

      <StaggerItem>
        <section className="premium-capsule p-0 shadow-inner-lg overflow-visible bg-bg-panel/80 backdrop-blur-2xl">
          <div className="px-8 py-6 bg-bg-panel/60 border-b-2 border-border-primary flex flex-wrap items-center justify-between gap-6 relative z-10 font-black">
            <div className="flex items-center gap-4">
              <button
                onClick={applyBulkRestore}
                disabled={isReadOnly || selectedIds.length === 0}
                className={`premium-button !py-2.5 !px-6 !text-[10px] ${
                  isReadOnly || selectedIds.length === 0
                    ? 'opacity-30 cursor-not-allowed'
                    : '!border-accent-cyan !bg-accent-cyan/10 !text-accent-cyan hover:!bg-accent-cyan/20'
                }`}
              >
                {t('fp.bulk.restore')}
              </button>
              <button
                onClick={applyBulkClose}
                disabled={isReadOnly || selectedIds.length === 0}
                className={`premium-button !py-2.5 !px-6 !text-[10px] ${
                  isReadOnly || selectedIds.length === 0
                    ? 'opacity-30 cursor-not-allowed'
                    : '!border-status-danger-border !bg-status-danger-bg/10 !text-status-danger-text hover:!bg-status-danger-bg/20'
                }`}
              >
                {resolveText('fp.bulk.close', 'Tutup Pilihan')}
              </button>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-cyan bg-accent-cyan/10 px-6 py-2 rounded-xl border border-accent-cyan/20">
              {selectedIds.length > 0
                ? `${selectedIds.length} ${t('fp.bulk.selected')}`
                : t('fp.bulk.hint')}
            </span>
          </div>

          <div className="p-4 bg-bg-panel/10">
            <div 
              ref={fpScrollRef}
              className="overflow-x-auto overflow-y-auto max-h-[70vh] custom-scrollbar rounded-2xl border border-border-primary/20 bg-bg-panel/60 relative"
            >
              <div className="min-w-[1450px] relative">
                <div
                  className="grid sticky top-0 z-50 bg-bg-panel border-y-2 border-border-primary text-[10px] font-black text-foreground-tertiary uppercase tracking-[0.2em]"
                  style={{ gridTemplateColumns: fpGridTemplate }}
                >
                  <div className="px-4 py-5 flex items-center justify-center border-r border-border-primary/20">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAllVisible}
                      disabled={fpAlerts.length === 0 || isReadOnly}
                      className="h-4 w-4 rounded border-2 border-border-primary/40 bg-bg-main accent-accent-cyan cursor-pointer relative z-[70]"
                    />
                  </div>
                  <div className="px-6 py-5 border-r border-border-primary/20 text-center">{(t('alerts.headers.action') as string)}</div>
                  <div className="px-6 py-5 border-r border-border-primary/20">{(t('alerts.headers.date') as string)}</div>
                  <div className="px-6 py-5 border-r border-border-primary/20 text-accent-cyan tracking-widest">{(t('alerts.headers.alertId') as string)}</div>
                  <div className="px-6 py-5 border-r border-border-primary/20">{(t('alerts.headers.ruleDescription') as string)}</div>
                  <div className="px-6 py-5 border-r border-border-primary/20">{(t('alerts.headers.hostname') as string)}</div>
                  <div className="px-6 py-5 border-r border-border-primary/20 text-center">{(t('alerts.headers.severity') as string)}</div>
                  <div className="px-6 py-5 text-center">{(t('common.action') as string)}</div>
                </div>

                {fpAlerts.length === 0 ? (
                  <div className="sticky left-0 w-full py-24 flex items-center justify-center text-foreground-muted font-black uppercase tracking-widest opacity-40">
                    {(t('common.empty') as string)}
                  </div>
                ) : (
                  <div className="relative" style={{ height: `${fpRowVirtualizer.getTotalSize()}px` }}>
                    {/* Continuous Column Borders Overlay */}
                    <div className="absolute inset-0 pointer-events-none z-0">
                      <div className="grid h-full" style={{ gridTemplateColumns: fpGridTemplate }}>
                        <div className="border-r border-border-primary/20 h-full" />
                        <div className="border-r border-border-primary/20 h-full" />
                        <div className="border-r border-border-primary/20 h-full" />
                        <div className="border-r border-border-primary/20 h-full" />
                        <div className="border-r border-border-primary/20 h-full" />
                        <div className="border-r border-border-primary/20 h-full" />
                        <div className="border-r border-border-primary/20 h-full" />
                        <div className="h-full" />
                      </div>
                    </div>

                    {fpRowVirtualizer.getVirtualItems().map((virtualRow) => {
                      const a = fpAlerts[virtualRow.index];
                      const isSelected = selectedSet.has(a.id);
                      return (
                          <div
                            key={a.id}
                            className={`absolute left-0 top-0 w-full group border-b border-border-secondary transition-colors z-10 pointer-events-auto ${isSelected ? 'bg-accent-cyan/15 backdrop-blur-[2px]' : 'bg-bg-card/90 backdrop-blur-[2px] hover:bg-bg-hover/40'}`}
                            style={{
                            height: `${virtualRow.size}px`,
                            transform: `translateY(${virtualRow.start}px)`
                          }}
                        >
                          <div className="grid h-full items-stretch text-[11px] font-bold text-foreground-secondary relative z-20" style={{ gridTemplateColumns: fpGridTemplate }}>
                             <label className="px-4 flex items-center justify-center pointer-events-auto h-full cursor-pointer hover:bg-bg-hover/40 transition-colors">
                              <input
                                 type="checkbox"
                                 checked={isSelected}
                                 onChange={() => toggleRowSelection(a.id)}
                                 disabled={isReadOnly}
                                 className="h-4 w-4 rounded border-2 border-border-primary/40 bg-bg-main accent-accent-cyan cursor-pointer relative z-50"
                              />
                            </label>
                            <div className="px-6 flex items-center justify-center h-full">
                               <button
                                onClick={() => handleRestore(a.id)}
                                className={`text-[9px] font-black text-accent-cyan px-4 py-1.5 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 hover:bg-accent-cyan/30 transition-all uppercase tracking-widest active:scale-95 ${isReadOnly ? 'opacity-30 cursor-not-allowed' : ''}`}
                               >
                                 <RotateCcw size={14} className="mr-1 inline-block" /> {resolveText('common.restore', 'RESTORE')}
                               </button>
                            </div>
                            <div className="px-6 flex flex-col justify-center gap-0.5 h-full tabular-nums">
                              <span className="text-foreground-primary whitespace-nowrap">{formatDDMMYYYY(a.date)}</span>
                              <span className="text-[10px] opacity-40 whitespace-nowrap">{a.time}</span>
                            </div>
                            <div className="px-6 text-accent-cyan flex items-center h-full tabular-nums font-mono">
                              <SensitiveText value={a.id} mono />
                            </div>
                            <div className="px-6 flex flex-col justify-center gap-1.5 whitespace-normal break-words py-4 h-full">
                              <p className="uppercase tracking-wider text-foreground-primary leading-tight font-black">{a.ruleDescription}</p>
                              <span className="text-[10px] opacity-60 font-mono">RULE ID: <SensitiveText value={a.ruleId} /></span>
                            </div>
                            <div className="px-6 flex items-center text-foreground-primary font-black h-full whitespace-normal break-all"><SensitiveText value={a.hostname} /></div>
                            <div className="px-6 flex items-center justify-center h-full"><AlertBadge type="severity" value={a.severity} /></div>
                            <div className="px-6 flex items-center justify-center h-full">
                               <span className="text-[10px] font-black text-foreground-tertiary uppercase tracking-tighter opacity-40">SUPPRESSED</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </StaggerItem>
    </StaggerGroup>
  );
}
