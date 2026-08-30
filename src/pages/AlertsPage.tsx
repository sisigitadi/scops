import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AlertsTable from "../components/alerts/AlertsTable";
import IncidentClustersTable from "../components/alerts/IncidentClustersTable";
import { useLanguage } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";
import { useAuth, ROLES, CAPABILITIES } from "../context/AuthContext";
import { useAlertData } from "../context/AlertDataContext";
import { useOperations } from "../context/OperationsContext";
import { useToast } from "../context/ToastContext";
import { localizeAlerts } from "../utils/wazuhLocalization";
import { obfuscateValue } from "../utils/formatters";
import { exportToCsv, exportToJson } from "../utils/exportUtils";
import InfoTooltip from "../components/common/InfoTooltip";
import { StaggerGroup, StaggerItem } from "../components/common/StaggerFadeIn";
import ExportPreviewModal from "../components/alerts/ExportPreviewModal";
import { Search, Download, Shield } from "lucide-react";

/**
 * AlertsPage — Tactical Alert Register
 * Central forensic hub for real-time alert triage, investigative filtering, and data export.
 */

const SEVERITY_RANK: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
const STATUS_RANK: Record<string, number> = { open: 3, investigating: 2, closed: 1 };

function toTimestamp(date: string, time: string) {
  return new Date(`${date || "1970-01-01"}T${time || "00:00:00"}Z`).getTime();
}

export default function AlertsPage() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { settings } = useSettings();
  const { user, appBasePath, hasCapability } = useAuth();
  const { alerts, updateMultipleAlerts, regenerateDemoData } = useAlertData();
  const { trackActivity } = useOperations();
  const isReadOnly = !hasCapability(CAPABILITIES.MUTATE_ALERTS);
  const isDemoUser = user?.role === ROLES.DEMO;
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const localizedAlerts = localizeAlerts(alerts, language);

  const handleRestricted = () => {
    if (isReadOnly) showToast(t("common.restrictedNotice") as string);
  };

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [severity, setSeverity] = useState(searchParams.get("severity") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [hostname, setHostname] = useState(searchParams.get("hostname") || "");
  const [timeRange, setTimeRange] = useState("all"); 
  const [startHour, setStartHour] = useState("00:00");
  const [endHour, setEndHour] = useState("23:59");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [exportConfig, setExportConfig] = useState<{ isOpen: boolean; format: 'csv' | 'json'; data: any[] | null }>({ 
    isOpen: false, 
    format: 'csv', 
    data: null 
  });

  const [isArchiveSearch, setIsArchiveSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleDeepSearch = async () => {
    setIsSearching(true);
    trackActivity('FORENSIC_DEEP_SEARCH', `Initiated distributed index query for pattern: "${search}"`);
    // SIMULATION: Long-tail Big Data query latency
    await new Promise(r => setTimeout(r, 2000));
    setIsSearching(false);
    showToast(t('alerts.messages.deepSearchComplete') || 'Deep search complete. Displaying combined results.');
  };

  const categories = useMemo(
    () => [...new Set(localizedAlerts.map((a) => a.category))],
    [localizedAlerts],
  );
  const hostnames = useMemo(
    () => [...new Set(localizedAlerts.map((a) => a.hostname))],
    [localizedAlerts],
  );

  const toOptionLabel = (value: string) => {
    const key = `alerts.optionLabels.${value}`;
    const translated = t(key);
    return translated === key ? value : (translated as string);
  };

  const severityOptions = ["critical", "high", "medium", "low"].map(
    (value) => ({ value, label: toOptionLabel(value) }),
  );
  const statusOptions = ["open", "investigating", "closed"].map((value) => ({
    value,
    label: toOptionLabel(value),
  }));
  const categoryOptions = categories.map((value) => ({
    value,
    label: toOptionLabel(value),
  }));
  const hostnameOptions = hostnames.map((value) => ({
    value,
    label: isDemoUser ? obfuscateValue(value) : value,
  }));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const now = new Date();
    const nowTs = now.getTime();
    const todayStr = now.toISOString().split('T')[0];
    
    const weeklyThreshold = new Date();
    weeklyThreshold.setDate(now.getDate() - 7);
    const monthlyThreshold = new Date();
    monthlyThreshold.setDate(now.getDate() - 30);

    const oneHour = 3600000;
    const oneDay = 86400000;

    return localizedAlerts.filter((a) => {
      if (a.isFalsePositive) return false;

      const alertTs = toTimestamp(a.date, a.time);
      
      if (timeRange === 'today' && nowTs - alertTs > 24 * oneHour) return false;
      if (timeRange === 'weekly' && nowTs - alertTs > 7 * oneDay) return false;
      if (timeRange === 'monthly' && nowTs - alertTs > 30 * oneDay) return false;
      if (timeRange === 'last1h' && nowTs - alertTs > oneHour) return false;
      if (timeRange === 'last8h' && nowTs - alertTs > 8 * oneHour) return false;
      if (timeRange === 'last12h' && nowTs - alertTs > 12 * oneHour) return false;

      if (timeRange === 'custom') {
        if (a.date !== todayStr) return false;
        const hFull = a.time.substring(0, 5); 
        if (hFull < startHour || hFull > endHour) return false;
      }

      const matchSearch =
        !q ||
        [a.id, a.ruleId, a.ruleDescription, a.hostname, a.user, a.sourceIp]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return (
        matchSearch &&
        (!severity || a.severity === severity) &&
        (!category || a.category === category) &&
        (!status || a.status === status) &&
        (!hostname || a.hostname === hostname)
      );
    });
  }, [localizedAlerts, search, severity, category, status, hostname, timeRange, startHour, endHour]);

  const incidentClusters = useMemo(() => {
    const clusters = new Map<string, any>();

    filtered.forEach((alert) => {
      const sourceIpKey = alert.sourceIp || "unknown";
      const ruleIdKey = alert.ruleId || "N/A";
      const key = `${sourceIpKey}::${ruleIdKey}`;
      const timestamp = toTimestamp(alert.date, alert.time);

      if (!clusters.has(key)) {
        clusters.set(key, {
          key,
          sourceIp: sourceIpKey,
          ruleId: ruleIdKey,
          ruleDescription: alert.ruleDescription,
          category: alert.category,
          severity: alert.severity,
          status: alert.status,
          eventCount: 1,
          representativeAlertId: alert.id,
          latestDate: alert.date,
          latestTime: alert.time,
          latestTimestamp: timestamp,
          hostnames: new Set([alert.hostname].filter(Boolean)),
          analysts: new Set([alert.analyst].filter(Boolean)),
        });
        return;
      }

      const cluster = clusters.get(key);
      cluster.eventCount += 1;
      cluster.hostnames.add(alert.hostname);
      cluster.analysts.add(alert.analyst);

      if (
        (SEVERITY_RANK[alert.severity] || 0) >
        (SEVERITY_RANK[cluster.severity] || 0)
      ) {
        cluster.severity = alert.severity;
      }
      if (
        (STATUS_RANK[alert.status] || 0) > (STATUS_RANK[cluster.status] || 0)
      ) {
        cluster.status = alert.status;
      }
      if (timestamp > cluster.latestTimestamp) {
        cluster.latestTimestamp = timestamp;
        cluster.latestDate = alert.date;
        cluster.latestTime = alert.time;
        cluster.representativeAlertId = alert.id;
        cluster.ruleDescription = alert.ruleDescription;
        cluster.category = alert.category;
      }
    });

    return Array.from(clusters.values())
      .map((cluster, index) => {
        const hosts = Array.from(cluster.hostnames);
        const analystsInCluster = Array.from(cluster.analysts);
        return {
          ...cluster,
          incidentId: `INC-${String(index + 1).padStart(6, "0")}`,
          hostSummary:
            hosts.length <= 2
              ? hosts.join(", ")
              : `${hosts.slice(0, 2).join(", ")} +${hosts.length - 2}`,
          analystSummary:
            analystsInCluster.length <= 2
              ? analystsInCluster.join(", ")
              : `${analystsInCluster.slice(0, 2).join(", ")} +${analystsInCluster.length - 2}`,
        };
      })
      .filter((cluster) => cluster.eventCount > 1)
      .sort(
        (a, b) =>
          b.eventCount - a.eventCount || b.latestTimestamp - a.latestTimestamp,
      );
  }, [filtered]);

  const filteredIds = useMemo(
    () => filtered.map((alert) => alert.id),
    [filtered],
  );
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allVisibleSelected =
    filtered.length > 0 && filteredIds.every((id) => selectedSet.has(id));
  const hasPartialSelection = selectedIds.length > 0 && !allVisibleSelected;

  const resolveText = (key: string, fallback: string) => {
    const translated = t(key);
    return translated === key ? fallback : (translated as string);
  };

  useEffect(() => {
    const visibleSet = new Set(filteredIds);
    setSelectedIds((prev) => prev.filter((id) => visibleSet.has(id)));
  }, [filteredIds]);

  const selectAllRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!selectAllRef.current) return;
    selectAllRef.current.indeterminate = hasPartialSelection;
  }, [hasPartialSelection]);

  const toggleRowSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(filteredIds);
  };

  const applyBulkAction = (patch: any, actionLabel: string) => {
    if (isReadOnly) {
      handleRestricted();
      return;
    }
    if (selectedIds.length === 0) {
      showToast(resolveText("alerts.bulk.none", "No alerts selected."));
      return;
    }

    updateMultipleAlerts(selectedIds, patch, user?.name || "System");
    trackActivity('TRIAGE_BULK_ACTION', `Executed bulk action: ${actionLabel} on ${selectedIds.length} alerts.`);
    showToast(t('alerts.bulk.success', { 
      count: selectedIds.length, 
      action: t(`alerts.bulk.${actionLabel === 'closed' ? 'close' : actionLabel === 'marked as False Positive' ? 'falsePositive' : 'investigating'}`).toLowerCase()
    }) || `${selectedIds.length} alerts ${actionLabel}.`);
    setSelectedIds([]);
  };

  const handleExportCsvWithNotice = () => {
    if (isReadOnly) {
      handleRestricted();
      return;
    }
    setExportConfig({ isOpen: true, format: 'csv', data: filtered });
  };

  const handleExportJsonWithNotice = () => {
    if (isReadOnly) {
      handleRestricted();
      return;
    }
    setExportConfig({ isOpen: true, format: 'json', data: filtered });
  };

  const handleExportCsv = () => {
    trackActivity('DATA_EXPORT', `Exported ${filtered.length} alerts to CSV format.`);
    
    const headerMap: Record<string, string> = {
      date: t('alerts.headers.date'),
      time: t('alerts.headers.time') || 'Waktu',
      id: t('alerts.headers.alertId'),
      ruleId: t('alerts.headers.ruleId') || 'ID Aturan',
      ruleDescription: t('alerts.headers.ruleDescription'),
      hostname: t('alerts.headers.hostname'),
      sourceIp: t('alerts.headers.sourceIp'),
      severity: t('alerts.headers.severity'),
      category: t('alerts.headers.category'),
      status: t('audit.headers.status')
    };

    const exportedData = filtered.map(item => {
      const newItem: any = {};
      Object.keys(headerMap).forEach(key => {
        if (item[key] !== undefined) newItem[headerMap[key]] = item[key];
      });
      return newItem;
    });

    exportToCsv(`alerts_export_${new Date().toISOString()}`, exportedData);
  };

  const handleExportJson = () => {
    trackActivity('DATA_EXPORT', `Exported ${filtered.length} alerts to JSON format.`);
    exportToJson(`alerts_export_${new Date().toISOString()}`, filtered);
  };

  return (
    <StaggerGroup className="space-y-6" delay={0.1} stagger={0.08}>
      <StaggerItem>
        <section className="premium-capsule p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-6 relative z-10">
            <div className="hidden sm:block floating shrink-0">
              <img 
                src={settings.appLogo || `${import.meta.env.BASE_URL}logo.png`} 
                alt="Logo" 
                className="h-20 w-20 object-contain drop-shadow-2xl border-2 border-accent-cyan/20 rounded-2xl bg-bg-panel/40 p-2" 
              />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground-primary tracking-tight capitalize leading-none">{(t("alerts.title") as string)}</h1>
                <InfoTooltip text={(t("tooltips.alertsTitle") as string)} />
              </div>
              <p className="mt-3 text-sm text-foreground-secondary font-medium tracking-tight opacity-70 max-w-xl">{(t("alerts.subtitle") as string)}</p>
            </div>
          </div>
        </section>
      </StaggerItem>

      <StaggerItem>
        <section className="premium-capsule p-8 shadow-inner-lg">
          <div className="relative z-10 mb-8 flex flex-col gap-5 lg:flex-row lg:items-center">
            <div className="relative w-full flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-cyan"
                size={18}
                strokeWidth={2.5}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={(t("alerts.searchPlaceholder") as string)}
                className="premium-input w-full pl-12 bg-bg-panel/20"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  onClick={() => setIsArchiveSearch(!isArchiveSearch)}
                  className={`text-[9px] font-black px-3 py-1.5 rounded-xl border transition-all ${isArchiveSearch ? 'bg-accent-cyan border-accent-cyan text-foreground-inverse shadow-lg shadow-accent-cyan/20' : 'bg-bg-panel/40 border-border-primary/30 text-foreground-tertiary'}`}
                >
                  {t('common.archiveMode').toUpperCase()}
                </button>
                {isArchiveSearch && (
                  <button
                    onClick={handleDeepSearch}
                    disabled={isSearching}
                    className="premium-button !py-1.5 !px-4 !text-[9px] !bg-accent-cyan/20 !border-accent-cyan/40 text-accent-cyan animate-pulse"
                  >
                    {isSearching ? t('common.syncing').toUpperCase() : t('common.deepSearch').toUpperCase()}
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 relative z-10 p-4 bg-bg-panel/10 rounded-3xl border border-border-primary/10">
            <div className="space-y-2">
              <label className="text-[10px] font-bold capitalize tracking-wider text-accent-cyan ml-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                {t("alerts.filterPeriod")}
              </label>
              <div className="flex flex-col gap-2">
                <FilterSelect
                  value={timeRange}
                  onChange={setTimeRange}
                  options={[
                    { value: 'all', label: (t('alerts.periodOptions.all') as string) },
                    { value: 'last1h', label: (t('alerts.periodOptions.last1h') as string) },
                    { value: 'last8h', label: (t('alerts.periodOptions.last8h') as string) },
                    { value: 'last12h', label: (t('alerts.periodOptions.last12h') as string) },
                    { value: 'today', label: (t('alerts.periodOptions.today') as string) },
                    { value: 'weekly', label: (t('alerts.periodOptions.weekly') as string) },
                    { value: 'monthly', label: (t('alerts.periodOptions.monthly') as string) },
                    { value: 'custom', label: (t('alerts.periodOptions.custom') as string) }
                  ]}
                  allLabel=""
                />
                {timeRange === 'custom' && (
                  <div className="flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
                    <input 
                      type="time" 
                      value={startHour} 
                      onChange={(e) => setStartHour(e.target.value)}
                      className="premium-input !py-1 !px-2 text-[10px] w-full bg-bg-panel/40 border-accent-cyan/20"
                    />
                    <span className="text-[10px] font-bold text-foreground-tertiary">{t('alerts.to')}</span>
                    <input 
                      type="time" 
                      value={endHour} 
                      onChange={(e) => setEndHour(e.target.value)}
                      className="premium-input !py-1 !px-2 text-[10px] w-full bg-bg-panel/40 border-accent-cyan/20"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold capitalize tracking-wider text-accent-cyan ml-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                {t("alerts.filterSeverity")}
              </label>
              <FilterSelect
                value={severity}
                onChange={setSeverity}
                options={severityOptions}
                allLabel={(t("common.all") as string)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-cyan ml-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                {t("alerts.filterCategory")}
              </label>
              <FilterSelect
                value={category}
                onChange={setCategory}
                options={categoryOptions}
                allLabel={(t("common.all") as string)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-status-warning-text ml-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-status-warning-bg shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                {t("alerts.filterStatus")}
              </label>
              <FilterSelect
                value={status}
                onChange={setStatus}
                options={statusOptions}
                allLabel={(t("common.all") as string)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-cyan ml-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                {t("alerts.headers.hostname")}
              </label>
                <input
                  type="text"
                  value={hostname}
                  onChange={(e) => setHostname(e.target.value.toUpperCase())}
                  placeholder="SEARCH HOST..."
                  className="premium-input w-full font-black uppercase tracking-widest h-11"
                />
            </div>
          </div>

          <div className="relative z-10 mt-6 pt-4 border-t border-border-primary/10 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-accent-cyan/10 border border-accent-cyan/20 rounded-xl mr-2">
              <Shield size={14} className="text-accent-cyan animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.2em] text-accent-cyan uppercase">{(t('alerts.tacticalActions') as string)}</span>
            </div>

            <button
              onClick={handleExportCsvWithNotice}
              className={`flex items-center gap-2 px-4 py-2 bg-bg-panel/40 border border-border-primary/40 text-foreground-primary rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-accent-cyan hover:text-background-main hover:border-accent-cyan transition-all ${isReadOnly ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              <Download size={14} strokeWidth={2} />
              CSV
            </button>

            <button
              onClick={handleExportJsonWithNotice}
              className={`flex items-center gap-2 px-4 py-2 bg-bg-panel/40 border border-border-primary/40 text-foreground-primary rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-accent-cyan hover:text-background-main hover:border-accent-cyan transition-all ${isReadOnly ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              <Download size={14} strokeWidth={2} />
              JSON
            </button>
          </div>
        </section>
      </StaggerItem>

      <StaggerItem>
        <AlertsTable 
          filtered={filtered}
          selectedIds={selectedIds}
          allVisibleSelected={allVisibleSelected}
          toggleSelectAllVisible={toggleSelectAllVisible}
          selectAllRef={selectAllRef}
          toggleRowSelection={toggleRowSelection}
          applyBulkAction={applyBulkAction}
          isReadOnly={isReadOnly}
          appBasePath={appBasePath}
        />
      </StaggerItem>

      <StaggerItem>
        <IncidentClustersTable 
          incidentClusters={incidentClusters}
          appBasePath={appBasePath}
        />
      </StaggerItem>



      {exportConfig.isOpen && (
        <ExportPreviewModal 
          isOpen={exportConfig.isOpen}
          onClose={() => setExportConfig(prev => ({ ...prev, isOpen: false }))}
          format={exportConfig.format}
          data={exportConfig.data}
          onConfirm={() => {
            if (exportConfig.format === 'csv') handleExportCsv();
            else handleExportJson();
          }}
        />
      )}
    </StaggerGroup>
  );
}

interface FilterSelectProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  allLabel: string;
}

function FilterSelect({ label, value, onChange, options, allLabel }: FilterSelectProps) {
  return (
    <label className="block">
      {label && (
        <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-foreground-tertiary pl-2">
          {label}
        </span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="premium-input w-full !py-2.5 !px-4 shadow-inner !text-[10px]"
      >
        <option value="">
          {allLabel} {label}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
