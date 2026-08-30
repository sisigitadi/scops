import React from "react";
import { Layers } from "lucide-react";
import AlertBadge from "./AlertBadge";
import InfoTooltip from "../common/InfoTooltip";
import SensitiveText from "../common/SensitiveText";
import { useLanguage } from "../../context/LanguageContext";
import { formatDDMMYYYY } from "../../utils/datePulse";

/**
 * IncidentClustersTable — Correlated Threat Monitoring
 * High-fidelity orchestration plane for visualizing correlated security events, 
 * leveraging forensic clusters for accelerated triage and situational awareness.
 */

interface Cluster {
  key: string;
  latestDate: string;
  latestTime: string;
  incidentId: string;
  ruleDescription: string;
  ruleId: string;
  hostSummary: string;
  severity: string;
  eventCount: number;
  status: string;
  representativeAlertId: string;
}

interface IncidentClustersTableProps {
  incidentClusters: Cluster[];
  appBasePath: string;
}

export default function IncidentClustersTable({ incidentClusters, appBasePath }: IncidentClustersTableProps) {
  const { t } = useLanguage();
  const clustersGridTemplate = "50px 120px minmax(130px, 0.7fr) minmax(130px, 0.7fr) minmax(400px, 3.5fr) minmax(140px, 0.8fr) minmax(150px, 0.7fr) minmax(220px, 1fr)";

  const resolveText = (key: string, fallback: string) => {
    const translated = t(key);
    return translated === key ? fallback : (translated as string);
  };

  return (
    <section className="premium-capsule p-0 shadow-inner-lg mt-6 relative overflow-hidden bg-bg-panel/80 backdrop-blur-2xl font-bold">
      <div className="px-8 py-6 bg-bg-panel/40 border-b border-border-primary/20 flex items-center justify-between relative z-10 font-black">
         <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-foreground-primary uppercase tracking-[0.2em] flex items-center gap-2">
              {resolveText("alerts.clusters.title", "INCIDENT CLUSTERS")}
              <InfoTooltip text={(t('settings.tooltips.ttIncidentCluster') as string)} />
            </h2>
            <div className="rounded-xl bg-status-success-bg/20 px-4 py-1.5 border-2 border-status-success-border/30 text-xs font-black text-status-success-text shadow-sm">
              {incidentClusters.length}
            </div>
         </div>
         <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground-muted opacity-60">{(t('alerts.status.correlatedOperations') as string)}</span>
      </div>

      <div className="overflow-auto custom-scrollbar relative border-t border-border-primary/10">
         <div className="min-w-[1450px] relative">
             <div 
              className="grid sticky top-0 z-50 bg-bg-panel border-y-2 border-border-primary text-[10px] font-black text-foreground-tertiary uppercase tracking-widest"
              style={{ gridTemplateColumns: clustersGridTemplate }}
            >
              <div className="px-4 py-5 flex items-center justify-center border-r border-border-primary/20">
                 <Layers size={14} className="text-accent-cyan" />
              </div>
              <div className="px-6 py-5 border-r border-border-primary/20 text-center">{(t("alerts.headers.action") as string)}</div>
              <div className="px-6 py-5 border-r border-border-primary/20">{(t("alerts.headers.date") as string)}</div>
              <div className="px-6 py-5 border-r border-border-primary/20 text-accent-cyan tracking-widest">{(t("alerts.headers.incidentId") as string)}</div>
              <div className="px-6 py-5 border-r border-border-primary/20">{(t("alerts.headers.ruleDescription") as string)}</div>
              <div className="px-6 py-5 border-r border-border-primary/20">{(t("alerts.headers.impactedHosts") as string)}</div>
              <div className="px-6 py-5 border-r border-border-primary/20 text-center">{(t("alerts.headers.severity") as string)}</div>
              <div className="px-6 py-5 text-center">{(t("alerts.headers.status") as string)}</div>
            </div>

            <div className="relative min-h-[400px]">
               {/* Continuous Column Borders Overlay */}
               <div className="absolute inset-0 pointer-events-none z-0">
                 <div className="grid h-full" style={{ gridTemplateColumns: clustersGridTemplate }}>
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

               <div className="relative z-10">
                {incidentClusters.length === 0 ? (
                  <div className="sticky left-0 w-full py-20 flex items-center justify-center text-foreground-muted font-black uppercase tracking-widest opacity-40">
                    {resolveText("alerts.clusters.empty", "NO CORRELATED INCIDENTS DETECTED")}
                  </div>
                ) : (
                  incidentClusters.map((cluster) => {
                    return (
                      <div 
                        key={cluster.key} 
                        className="grid min-h-[7rem] py-4 items-stretch text-[11px] font-black text-foreground-secondary border-b border-border-secondary bg-bg-card/90 backdrop-blur-[2px] transition-all hover:bg-bg-hover/40 group uppercase" 
                        style={{ gridTemplateColumns: clustersGridTemplate }}
                      >
                         <div className="px-4 flex items-center justify-center">
                            <Layers size={16} className="text-accent-cyan opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                         </div>

                         <div className="px-6 flex items-center justify-center h-full">
                             <a
                              href={`#${appBasePath}/triage?id=${encodeURIComponent(cluster.representativeAlertId)}`}
                              className="text-[9px] font-black text-status-danger-text px-6 py-2 rounded-lg bg-status-danger-bg/10 border border-status-danger-border/30 hover:bg-status-danger-bg/30 transition-all uppercase tracking-widest active:scale-95 shadow-md"
                             >
                               {t('alerts.headers.investigate') || 'TRIAGE'}
                             </a>
                         </div>

                         <div className="px-6 flex flex-col justify-center gap-0.5 h-full tabular-nums">
                            <span className="text-foreground-primary whitespace-nowrap">{formatDDMMYYYY(cluster.latestDate)}</span>
                            <span className="text-[10px] opacity-40 whitespace-nowrap">{cluster.latestTime}</span>
                         </div>

                         <div className="px-6 text-accent-cyan flex items-center h-full tabular-nums font-mono">
                             <SensitiveText value={cluster.incidentId} />
                         </div>

                         <div className="px-6 flex flex-col justify-center gap-1.5 whitespace-normal break-words h-full">
                             <p className="normal-case tracking-tight text-foreground-primary font-black">{cluster.ruleDescription}</p>
                             <span className="text-[10px] opacity-60 font-mono">{t('alerts.headers.ruleId').toUpperCase()}: <SensitiveText value={cluster.ruleId} /></span>
                         </div>

                         <div className="px-6 flex items-center text-foreground-primary font-black h-full whitespace-normal break-all">
                             <SensitiveText value={cluster.hostSummary || "-"} />
                         </div>

                         <div className="px-6 flex items-center justify-center h-full relative">
                             <AlertBadge type="severity" value={cluster.severity} />
                             <div className="absolute top-2 right-2 text-[9px] font-black text-accent-rose px-1.5 py-0.5 rounded-md bg-accent-rose/5 border border-accent-rose/20 tabular-nums shadow-sm">
                               {cluster.eventCount}
                             </div>
                         </div>

                         <div className="px-6 flex items-center justify-center h-full">
                             <AlertBadge type="status" value={cluster.status} />
                         </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
         </div>
      </div>
    </section>
  );
}
