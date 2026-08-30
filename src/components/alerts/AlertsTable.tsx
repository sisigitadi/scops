import React, { useRef, RefObject } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import AlertBadge from "./AlertBadge";
import InfoTooltip from "../common/InfoTooltip";
import SensitiveText from "../common/SensitiveText";
import { useLanguage } from "../../context/LanguageContext";
import { pulse, formatDDMMYYYY } from "../../utils/datePulse";

/**
 * AlertsTable — Virtualized Forensic Register
 * High-performance data grid optimized for voluminous security event streams, 
 * utilizing deferred rendering and premium glassmorphic UI elements for analyst interaction.
 */

interface AlertsTableProps {
  filtered: any[];
  selectedIds: string[];
  allVisibleSelected: boolean;
  toggleSelectAllVisible: () => void;
  selectAllRef: RefObject<HTMLInputElement | null>;
  toggleRowSelection: (id: string) => void;
  applyBulkAction: (actionObj: any, actionLabel: string) => void;
  isReadOnly: boolean;
  appBasePath: string;
}

export default function AlertsTable({
  filtered,
  selectedIds,
  allVisibleSelected,
  toggleSelectAllVisible,
  selectAllRef,
  toggleRowSelection,
  applyBulkAction,
  isReadOnly,
  appBasePath
}: AlertsTableProps) {
  const { t } = useLanguage();
  
  const alertsGridTemplate = "50px 120px minmax(130px, 0.7fr) minmax(130px, 0.7fr) minmax(400px, 3.5fr) minmax(140px, 0.8fr) minmax(150px, 0.7fr) minmax(220px, 1fr)";
  const alertsScrollRef = useRef<HTMLDivElement>(null);
  
  const alertsRowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => alertsScrollRef.current,
    estimateSize: () => 115, 
    overscan: 10,
  });

  const resolveText = (key: string, fallback: string) => {
    const translated = t(key) as string;
    return translated === key ? fallback : translated;
  };

  return (
    <section className="premium-capsule p-0 shadow-inner-lg mt-6 relative overflow-visible bg-bg-panel/80 backdrop-blur-2xl">
      <div className="px-8 py-6 bg-bg-panel/60 border-b-2 border-border-primary flex flex-col gap-6 relative z-10">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-black text-foreground-primary capitalize tracking-[0.2em] flex items-center gap-2">
                {(t("alerts.tableTitle") as string)}
                <InfoTooltip text={(t('settings.tooltips.ttActiveEventReg') as string)} />
              </h2>
              <div className="rounded-xl bg-accent-cyan/10 px-4 py-1.5 border-2 border-accent-cyan/20 text-xs font-black text-accent-cyan shadow-sm">
                {filtered.length}
              </div>
            </div>
            <div className="px-4 text-[10px] font-black uppercase tracking-widest text-foreground-tertiary">
              {selectedIds.length > 0
                ? (t('alerts.status.targetsSelected', { count: selectedIds.length }) as string)
                : (t('alerts.status.awaitingSelection') as string)}
            </div>
         </div>

         <div className="flex flex-wrap items-center gap-3 bg-bg-panel/40 p-2 rounded-2xl border-2 border-border-primary/20">
            <button
              onClick={() => applyBulkAction({ status: "investigating", escalated: true }, "set to Investigating")}
              disabled={isReadOnly || selectedIds.length === 0}
              className={`premium-button !py-2 !px-6 !text-[9px] ${isReadOnly || selectedIds.length === 0 ? "opacity-30 cursor-not-allowed" : "!border-status-warning-border !bg-status-warning-bg/20 !text-status-warning-text hover:!bg-status-warning-bg/40"}`}
            >
              {resolveText("alerts.bulk.investigating", "Bulk Investigating")}
            </button>
            <button
              onClick={() => applyBulkAction({ status: "closed" }, "closed")}
              disabled={isReadOnly || selectedIds.length === 0}
              className={`premium-button !py-2 !px-6 !text-[9px] ${isReadOnly || selectedIds.length === 0 ? "opacity-30 cursor-not-allowed" : "!border-status-success-border !bg-status-success-bg/20 !text-status-success-text hover:!bg-status-success-bg/40"}`}
            >
              {resolveText("alerts.bulk.close", "Bulk Close")}
            </button>
            <button
              onClick={() => applyBulkAction({ status: "closed", isFalsePositive: true }, "marked as False Positive")}
              disabled={isReadOnly || selectedIds.length === 0}
              className={`premium-button !py-2 !px-6 !text-[9px] ${isReadOnly || selectedIds.length === 0 ? "opacity-30 cursor-not-allowed" : "!border-accent-cyan/30 !bg-accent-cyan/20 !text-accent-cyan hover:!bg-accent-cyan/40"}`}
            >
              {resolveText("alerts.bulk.falsePositive", "Bulk False Positive")}
            </button>
         </div>
      </div>
      <div className="p-4 bg-bg-panel/10"> 
        <div 
          ref={alertsScrollRef}
          className="overflow-x-auto overflow-y-auto max-h-[80vh] custom-scrollbar rounded-2xl border border-border-primary/20 bg-bg-panel/60 relative"
        >
          <div className="min-w-[1450px] relative">
          <div 
            className="grid sticky top-0 z-50 bg-bg-panel border-y-2 border-border-primary text-[10px] font-black text-foreground-tertiary uppercase tracking-widest"
            style={{ gridTemplateColumns: alertsGridTemplate }}
          >
            <div className="px-4 py-5 flex items-center justify-center border-r border-border-primary/20">
               <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAllVisible}
                ref={selectAllRef as any}
                className="h-4 w-4 rounded border-2 border-border-primary/40 bg-bg-main accent-accent-cyan cursor-pointer relative z-[70]"
              />
            </div>
            <div className="px-6 py-5 border-r border-border-primary/20 text-center">{(t("alerts.headers.action") as string)}</div>
            <div className="px-6 py-5 border-r border-border-primary/20">{(t("alerts.headers.date") as string)}</div>
            <div className="px-6 py-5 border-r border-border-primary/20 text-accent-cyan tracking-widest">{(t("alerts.headers.alertId") as string)}</div>
            <div className="px-6 py-5 border-r border-border-primary/20">{(t("alerts.headers.ruleDescription") as string)}</div>
            <div className="px-6 py-5 border-r border-border-primary/20">{(t("alerts.headers.hostname") as string)}</div>
            <div className="px-6 py-5 border-r border-border-primary/20 text-center">{(t("alerts.headers.severity") as string)}</div>
            <div className="px-6 py-5 text-center">{(t("alerts.headers.status") as string)}</div>
          </div>

          {filtered.length === 0 ? (
            <div className="sticky left-0 w-full py-24 flex items-center justify-center text-foreground-muted font-black uppercase tracking-widest opacity-40">
              {(t("common.empty") as string)}
            </div>
          ) : (
            <div
              className="relative"
              style={{ height: `${alertsRowVirtualizer.getTotalSize()}px` }}
            >
                {/* Continuous Column Borders Overlay */}
                <div className="absolute inset-0 pointer-events-none z-0">
                  <div className="grid h-full" style={{ gridTemplateColumns: alertsGridTemplate }}>
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

                {alertsRowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const a = filtered[virtualRow.index];
                  const isSelected = selectedIds.includes(a.id);

                  return (
                    <div
                      key={a.id}
                      className={`absolute left-0 top-0 w-full group border-b border-border-secondary transition-colors z-10 pointer-events-auto ${isSelected ? 'bg-accent-cyan/15 backdrop-blur-[2px]' : 'bg-bg-card/90 backdrop-blur-[2px] hover:bg-bg-hover/40'}`}
                      style={{
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <div 
                        className="grid h-full items-stretch text-[11px] font-bold text-foreground-secondary relative z-20"
                        style={{ gridTemplateColumns: alertsGridTemplate }}
                      >
                        <label className="px-4 flex items-center justify-center pointer-events-auto h-full cursor-pointer hover:bg-bg-hover/40 transition-colors">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRowSelection(a.id)}
                            className="h-4 w-4 rounded border-2 border-border-primary/40 bg-bg-main accent-accent-cyan cursor-pointer relative z-50"
                          />
                        </label>

                         <div className="px-6 flex items-center justify-center h-full">
                            <a
                             href={`#${appBasePath}/triage?id=${encodeURIComponent(a.id)}`}
                             className="text-[9px] font-black text-accent-cyan px-4 py-1.5 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 hover:bg-accent-cyan/30 transition-all uppercase tracking-widest active:scale-95"
                            >
                               {t('alerts.headers.investigate') || 'TRIAGE'}
                            </a>
                         </div>

                         <div className="px-6 flex flex-col justify-center gap-0.5 h-full font-bold tabular-nums">
                            <span className="text-foreground-primary whitespace-nowrap">{formatDDMMYYYY(a.date)}</span>
                            <span className="text-[10px] opacity-40 whitespace-nowrap">{a.time}</span>
                         </div>

                        <div className="px-6 text-accent-cyan flex items-center h-full tabular-nums font-mono">
                           <SensitiveText value={a.id} />
                        </div>

                        <div className="px-6 flex flex-col justify-center gap-1.5 whitespace-normal break-words py-4 h-full font-bold">
                           <p className="uppercase tracking-wider text-foreground-primary leading-tight font-black">{a.ruleDescription}</p>
                           <span className="text-[10px] opacity-60 font-mono">{t('alerts.headers.ruleId').toUpperCase()}: <SensitiveText value={a.ruleId} /></span>
                        </div>

                        <div className="px-6 flex items-center text-foreground-primary font-black h-full whitespace-normal break-all">
                           <SensitiveText value={a.hostname} />
                        </div>

                        <div className="px-6 flex items-center justify-center h-full">
                           <AlertBadge type="severity" value={a.severity} />
                        </div>

                         <div className="px-6 flex items-center justify-center h-full font-bold">
                            <AlertBadge type="status" value={a.status} />
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
  );
}
