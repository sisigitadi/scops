import React, { useMemo, useState } from 'react';
import { Download, FileText, Loader2, Search, Filter, Database } from 'lucide-react';
import ExecutiveSummaryBlock from '../components/reports/ExecutiveSummaryBlock';
import ReportSummaryCard from '../components/reports/ReportSummaryCard';
import ReportTableSection from '../components/reports/ReportTableSection';
import InfoTooltip from '../components/common/InfoTooltip';
import { StaggerGroup, StaggerItem } from '../components/common/StaggerFadeIn';
import { useAlertData } from '../context/AlertDataContext';
import { useLanguage } from '../context/LanguageContext';
import { monitoredAgents } from '../data/wazuhData';
import { localizeAlerts } from '../utils/wazuhLocalization';
import { buildReportSections } from '../utils/reportAnalytics';
import { CAPABILITIES, useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { exportToCsv, exportToJson } from '../utils/exportUtils';
import { useOperations } from '../context/OperationsContext';

/**
 * ReportsPage — Premium Forensic Audit Center
 * Advanced investigative reporting with dynamic data harvesting and multi-format export sovereignty.
 */

export default function ReportsPage() {
  const { language, t } = useLanguage();
  const { settings } = useSettings();
  const { hasCapability } = useAuth();
  const { activeAnalyst } = useOperations();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfScope, setPdfScope] = useState('all');
  const [pdfSeverity, setPdfSeverity] = useState('all');
  const [pdfStatus, setPdfStatus] = useState('all');
  const [pdfCategory, setPdfCategory] = useState('all');
  const canExportReports = hasCapability(CAPABILITIES.EXPORT_REPORTS);
  const { alerts } = useAlertData();
  const localizedAlerts = localizeAlerts(alerts, language);
  const reportData = buildReportSections(alerts, monitoredAgents, t);

  const availableCategories = useMemo(
    () => Array.from(new Set(alerts.map((alert) => alert.category).filter(Boolean))).sort(),
    [alerts]
  );

  const localizeAlertOption = (value: string) => {
    const key = `alerts.optionLabels.${value}`;
    const translated = t(key);
    return translated === key ? value : (translated as string);
  };

  const exportAlerts = useMemo(() => {
    if (pdfScope === 'all') return alerts;

    return alerts.filter((alert) => {
      if (pdfSeverity !== 'all' && alert.severity !== pdfSeverity) return false;
      if (pdfStatus !== 'all' && alert.status !== pdfStatus) return false;
      if (pdfCategory !== 'all' && alert.category !== pdfCategory) return false;
      return true;
    });
  }, [alerts, pdfScope, pdfSeverity, pdfStatus, pdfCategory]);

  const exportReportData = useMemo(() => buildReportSections(exportAlerts, monitoredAgents, t), [exportAlerts, t]);

  const handleExportCsv = () => exportToCsv(`report_export_${new Date().toISOString()}`, localizedAlerts);
  const handleExportJson = () => exportToJson(`report_export_${new Date().toISOString()}`, localizedAlerts);

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    try {
      const { generateDataDrivenPDF } = await import('../utils/reportPdfUtils');
      await Promise.resolve().then(() =>
        generateDataDrivenPDF(exportAlerts, exportReportData, settings, t, language, {
          selectionLabel: pdfScope === 'all' ? (t('reports.exportScope.all') as string) : (t('reports.exportScope.custom') as string),
          filters: [
            pdfScope !== 'all' && pdfSeverity !== 'all'
              ? `${t('alerts.filterSeverity')}: ${localizeAlertOption(pdfSeverity)}`
              : null,
            pdfScope !== 'all' && pdfStatus !== 'all'
              ? `${t('alerts.filterStatus')}: ${localizeAlertOption(pdfStatus)}`
              : null,
            pdfScope !== 'all' && pdfCategory !== 'all'
              ? `${t('alerts.filterCategory')}: ${localizeAlertOption(pdfCategory)}`
              : null
          ].filter(Boolean),
          dutyAnalystName: activeAnalyst?.name
        } as any)
      );
    } catch (error) {
      console.error('PDF generation failed:', error);
      window.alert(t('reports.downloadPdfError'));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const sectionLabels: Record<string, string> = {
    shift: (t('reports.shift') as string),
    daily: (t('reports.daily') as string),
    weekly: (t('reports.weekly') as string)
  };
  
  const downloadPdfLabel = pdfScope === 'all' ? (t('reports.downloadpdfall') as string) : (t('reports.downloadpdfcustom') as string);

  const cardLabelMap: Record<string, string> = {
    alerts_processed: (t('reports.cardLabels.alertsProcessed') as string),
    escalations: (t('reports.cardLabels.escalations') as string),
    false_positives: (t('reports.cardLabels.falsePositives') as string),
    mtta: (t('reports.cardLabels.mtta') as string),
    total_alerts: (t('reports.cardLabels.totalAlerts') as string),
    incident_candidates: (t('reports.cardLabels.incidentCandidates') as string),
    containment_actions: (t('reports.cardLabels.containmentActions') as string),
    mttr: (t('reports.cardLabels.mttr') as string),
    total_weekly_alerts: (t('reports.cardLabels.totalWeeklyAlerts') as string),
    escalated_cases: (t('reports.cardLabels.escalatedCases') as string),
    false_positive_rate: (t('reports.cardLabels.falsePositiveRate') as string),
    monitored_agents: (t('reports.cardLabels.monitoredAgents') as string)
  };

  const metricMap: Record<string, string> = {
    'Critical Alerts': t('reports.metricMap.criticalAlerts') || 'Critical Alerts',
    'High Alerts': t('reports.metricMap.highAlerts') || 'High Alerts',
    'Investigations Closed': t('reports.metricMap.investigationsClosed') || 'Investigations Closed',
    'Pending Handover Items': t('reports.metricMap.pendingHandoverItems') || 'Pending Handover Items',
    'Authentication Events': t('reports.metricMap.authenticationEvents') || 'Authentication Events',
    'Privilege Escalation Events': t('reports.metricMap.privilegeEscalationEvents') || 'Privilege Escalation Events',
    'File Integrity Events': t('reports.metricMap.fileIntegrityEvents') || 'File Integrity Events',
    'Network Anomaly Events': t('reports.metricMap.networkAnomalyEvents') || 'Network Anomaly Events',
    'Week-over-Week Alert Growth': t('reports.metricMap.weekOverWeekAlertGrowth') || 'Week-over-Week Alert Growth',
    'Top Alert Category': t('reports.metricMap.topAlertCategory') || 'Top Alert Category',
    'Top Rule Family': t('reports.metricMap.topRuleFamily') || 'Top Rule Family',
    'Rules Tuned This Week': t('reports.metricMap.rulesTunedThisWeek') || 'Rules Tuned This Week'
  };

  const localizeCategoryValue = (value: string) => {
    const key = `alerts.optionLabels.${value}`;
    const translated = t(key);
    return translated === key ? value : (translated as string);
  };

  return (
    <StaggerGroup className="space-y-8 pb-10" id="report-container" delay={0.1} stagger={0.08}>
      <StaggerItem>
        <section className="premium-capsule p-8 flex flex-col xl:flex-row justify-between gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex min-w-0 items-center gap-6 relative z-10">
            <div className="floating shrink-0">
              <img
                src={settings.appLogo || `${import.meta.env.BASE_URL}logo.png`}
                alt="Report Logo"
                className="h-20 w-20 rounded-2xl object-contain drop-shadow-2xl border-2 border-accent-cyan/20 bg-bg-panel/40 p-2"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="truncate text-3xl font-black text-foreground-primary uppercase tracking-[0.2em] leading-none">{(t('reports.title') as string)}</h1>
                <InfoTooltip text={(t('tooltips.reportsTitle') as string)} />
              </div>
              <p className="mt-3 text-sm text-foreground-secondary font-black tracking-tight uppercase opacity-70 max-w-xl">{(t('reports.subtitle') as string)}</p>
            </div>
          </div>
        </section>
      </StaggerItem>

      {/* Relocated Tactical Report HUD */}
      <StaggerItem>
        <div className="flex flex-col xl:flex-row items-center gap-6">
          <div className="premium-capsule !p-2 flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-bg-panel/40 border border-border-primary/20 backdrop-blur-xl w-full xl:w-fit animate-in slide-in-from-left-4 duration-500">
             <div className="flex flex-col items-start px-6 border-r border-border-primary/20 py-1">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground-tertiary mb-1">{(t('reports.scopeSelection') as string)}</p>
                <select
                  value={pdfScope}
                  onChange={(e) => setPdfScope(e.target.value)}
                  className="bg-transparent text-[11px] font-black text-accent-cyan focus:outline-none cursor-pointer hover:brightness-125 transition-all uppercase tracking-widest"
                >
                  <option value="all" className="bg-background-main">{(t('reports.exportScope.all') as string)}</option>
                  <option value="custom" className="bg-background-main">{(t('reports.exportScope.custom') as string)}</option>
                </select>
             </div>

             {pdfScope === 'custom' && (
                <div className="flex flex-col items-start px-6 border-r border-border-primary/20 py-1 animate-in slide-in-from-left-2">
                   <p className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground-tertiary mb-1">{(t('reports.filterSet') as string)}</p>
                   <select
                      value={pdfSeverity}
                      onChange={(e) => setPdfSeverity(e.target.value)}
                      className="bg-transparent text-[11px] font-black text-accent-cyan focus:outline-none cursor-pointer uppercase tracking-widest"
                    >
                       <option value="all" className="bg-background-main">{(t('alerts.filterSeverity') as string)}</option>
                       <option value="critical" className="bg-background-main">{(t('reports.severityLabels.critical') as string)}</option>
                       <option value="high" className="bg-background-main">{(t('reports.severityLabels.high') as string)}</option>
                       <option value="medium" className="bg-background-main">{(t('reports.severityLabels.medium') as string)}</option>
                    </select>
                </div>
             )}

             <div className="flex items-center gap-2 p-2 bg-bg-panel/40 rounded-2xl border border-border-primary/10 ml-2">
                <button
                  onClick={handleDownloadPDF}
                  disabled={!canExportReports || isGeneratingPdf}
                  className="premium-button !py-2.5 !px-8 !text-[10px] !bg-accent-cyan !text-foreground-inverse !border-none !shadow-xl shadow-accent-cyan/20 flex items-center gap-3 transition-all active:scale-95"
                >
                  {isGeneratingPdf ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} strokeWidth={3} />}
                  <span className="uppercase tracking-[0.2em] font-black">{downloadPdfLabel}</span>
                </button>
                <div className="h-8 w-px bg-border-primary/20 mx-1" />
                <div className="flex gap-1.5">
                   <button onClick={handleExportCsv} disabled={!canExportReports} className="premium-button !p-2.5 !text-[10px] !w-10 !h-10 hover:!text-accent-cyan transition-colors" title={t('common.downloadCsv')}>
                    <Download size={16} strokeWidth={2.5} />
                  </button>
                  <button onClick={handleExportJson} disabled={!canExportReports} className="premium-button !p-2.5 !text-[10px] !w-10 !h-10 hover:!text-accent-cyan transition-colors" title={t('common.downloadJson')}>
                    <Database size={16} strokeWidth={2.5} />
                  </button>
                </div>
             </div>
          </div>

          <div className="hidden xl:flex items-center gap-4 px-6 py-4 bg-accent-cyan/[0.03] border border-accent-cyan/10 rounded-2xl flex-1 animate-in slide-in-from-right-4 duration-700">
             <div className="h-2 w-2 rounded-full bg-accent-cyan animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground-tertiary">
               {(t('reports.status.databaseRecognized', { count: exportAlerts.length }) as string)}
             </p>
          </div>
        </div>
      </StaggerItem>

      <StaggerItem>
        <div className="w-full">
          {alerts.length > 0 ? (
            <ExecutiveSummaryBlock
              summary={(t('reports.executiveSummary') as string)}
              topFindings={(t('reports.findingsList') as any) || []}
              recommendations={(t('reports.recommendationsList') as any) || []}
            />
          ) : (
            <div className="premium-capsule p-12 flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
              <FileText size={48} className="text-foreground-tertiary mb-2" />
              <h3 className="text-lg font-black uppercase tracking-widest">{(t('reports.noDataTitle') as string)}</h3>
              <p className="text-sm font-black uppercase tracking-tight">{(t('reports.noDataSubtitle') as string)}</p>
            </div>
          )}
        </div>
      </StaggerItem>

      {reportData.map((section) => {
        const title = sectionLabels[section.key] || section.key;
        const rows = section.metrics.map((row) => ({
          ...row,
          metric: metricMap[row.metric] || row.metric,
          value: row.metric === 'Top Alert Category' ? localizeCategoryValue(row.value) : row.value
        }));

        return (
          <StaggerItem key={section.key}>
            <section className="premium-capsule p-8 space-y-10">
              <div className="flex items-center gap-4 relative z-10 border-b-2 border-border-primary/20 pb-6 mb-8">
                 <div className="px-5 py-2.5 rounded-2xl bg-bg-panel/60 border-2 border-border-primary/20 text-xs font-black text-foreground-primary tracking-[0.2em] uppercase flex items-center gap-3">
                    {title}
                    <InfoTooltip text={(t(`settings.tooltips.tt${section.key.charAt(0).toUpperCase() + section.key.slice(1)}Rep`) as string)} />
                 </div>
                 <div className="h-px flex-1 bg-border-primary/10" />
              </div>
              
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
                {section.cards.map((card) => {
                  const camelKey = card.key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
                  return (
                    <ReportSummaryCard
                      key={`${section.key}-${card.key}`}
                      label={cardLabelMap[card.key] || card.key}
                      value={card.value}
                      tooltip={(t(`tooltips.${camelKey}`) as string)}
                    />
                  );
                })}
              </div>
              <div className="relative z-10 pt-4">
                <ReportTableSection 
                  title={`${title} ${(t('common.metric') as string)}`} 
                  rows={rows} 
                  tooltip={(t(`settings.tooltips.tt${section.key.charAt(0).toUpperCase() + section.key.slice(1)}Rep`) as string)}
                />
              </div>
            </section>
          </StaggerItem>
        );
      })}
    </StaggerGroup>
  );
}
