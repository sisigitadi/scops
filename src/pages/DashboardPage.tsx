import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList
} from 'recharts';
import InfoTooltip from '../components/common/InfoTooltip';
import { StaggerGroup, StaggerItem } from '../components/common/StaggerFadeIn';
import KpiCard from '../components/dashboard/KpiCard';
import RecentAlertsTable from '../components/dashboard/RecentAlertsTable';
import SensitiveText from '../components/common/SensitiveText';
import { useAlertData } from '../context/AlertDataContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { BarChart3, Clock, Users, ArrowRightLeft, History, TrendingUp, Monitor, Book, UserCog } from 'lucide-react';
import { monitoredAgents } from '../data/wazuhData';
import { calculateKpis, filterByTime, groupByField, recentAlerts, toChartData, topByField } from '../utils/wazuhAnalytics';
import { localizeAlerts } from '../utils/wazuhLocalization';

/**
 * DashboardPage — Operational Intelligence Command Suite
 * Integrated visualization of forensic data, KPI performance, and priority insights.
 */

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)'
];

export default function DashboardPage() {
  const { language, t } = useLanguage();
  const { appBasePath } = useAuth();
  const { alerts } = useAlertData();
  const { settings } = useSettings();
  const navigate = useNavigate();
  
  const [timeRange, setTimeRange] = useState('all');
  const [startHour, setStartHour] = useState('00:00');
  const [endHour, setEndHour] = useState('23:59');

  const filteredByTime = filterByTime(alerts, timeRange, { startHour, endHour });
  const localizedAlerts = localizeAlerts(filteredByTime, language);

  const kpi = calculateKpis(localizedAlerts, monitoredAgents);
  const severityData = toChartData(groupByField(localizedAlerts, 'severity'));
  const categoryData = toChartData(groupByField(localizedAlerts, 'category'));
  const topHosts = topByField(localizedAlerts, 'hostname', 5);
  const topRules = topByField(localizedAlerts, 'ruleDescription', 5);
  const latest = recentAlerts(localizedAlerts, 8);
  
  // Safe Insight Harvesting Protocol
  const rawInsights = t('dashboard.insights');
  const insights = Array.isArray(rawInsights) ? rawInsights : [];

  const handleDrillDown = (filterType: string, value: string) => {
    navigate(`${appBasePath}/alerts?${filterType}=${encodeURIComponent(value)}`);
  };

  const kpiItems = [
    { label: (t('dashboard.kpi.totalAlerts') as string), value: kpi.totalAlerts, tooltip: (t('tooltips.totalAlerts') as string), onClick: () => navigate(`${appBasePath}/alerts`) },
    { label: (t('dashboard.kpi.highPriorityAlerts') as string), value: kpi.highPriority, tooltip: (t('tooltips.incidentCandidate') as string), onClick: () => handleDrillDown('severity', 'high') },
    { label: (t('dashboard.kpi.openCases') as string), value: kpi.openCases, tooltip: (t('tooltips.openCases') as string), onClick: () => handleDrillDown('status', 'open') },
    { label: (t('dashboard.kpi.escalatedCases') as string), value: kpi.escalatedCases, tooltip: (t('tooltips.escalatedCase') as string), onClick: () => handleDrillDown('status', 'investigating') },
    { label: (t('dashboard.kpi.falsePositives') as string), value: kpi.falsePositives, tooltip: (t('tooltips.falsePositive') as string), onClick: () => navigate(`${appBasePath}/false-positive`) },
    { label: (t('dashboard.kpi.correlatedCases') as string), value: kpi.correlatedCases, tooltip: (t('tooltips.correlatedCases') as string) },
    { label: (t('dashboard.kpi.monitoredAgents') as string), value: kpi.monitoredAgents, tooltip: (t('tooltips.agent') as string) }
  ];

  return (
    <StaggerGroup className="space-y-6" delay={0.1} stagger={0.08}>
      <StaggerItem>
        <section className="premium-capsule p-5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-4 sm:gap-6 relative z-10">
            <div className="hidden sm:block floating shrink-0">
              <img 
                src={settings.appLogo || `${import.meta.env.BASE_URL}logo.png`} 
                alt="Logo" 
                className="h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-2xl border-2 border-accent-cyan/20 rounded-2xl bg-bg-panel/40 p-2" 
              />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground-primary tracking-[0.1em] sm:tracking-[0.2em] uppercase leading-none">{(t('dashboard.title') as string)}</h1>
                <InfoTooltip text={(t('tooltips.dashboardTitle') as string)} vAlign="top" />
              </div>
              <p className="mt-2 sm:mt-3 text-[11px] sm:text-sm text-foreground-secondary font-black tracking-tight uppercase opacity-70 max-w-xl line-clamp-2 md:line-clamp-none">{(t('dashboard.desc') as string)}</p>
            </div>
          </div>
        </section>
      </StaggerItem>

      {/* Relocated Tactical Dashboard HUD */}
      <StaggerItem>
        <div className="flex flex-col xl:flex-row items-center gap-6">
          <div className="premium-capsule !p-2 flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-bg-panel/40 border border-border-primary/20 backdrop-blur-xl w-full xl:w-fit animate-in slide-in-from-left-4 duration-500">
             <div className="flex items-center gap-3 px-6 py-2.5 bg-bg-panel/40 rounded-2xl border border-border-primary/10">
                <Clock size={14} className="text-accent-cyan animate-pulse" />
                <span className="text-[10px] font-black text-foreground-tertiary uppercase tracking-[0.2em]">{(t('alerts.filterPeriod') as string)}</span>
                <select 
                  value={timeRange} 
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-transparent text-[11px] font-black text-accent-cyan focus:outline-none cursor-pointer hover:brightness-125 transition-all uppercase tracking-widest"
                >
                  {Object.entries((t('alerts.periodOptions') as any) || {}).map(([val, label]) => (
                    <option key={val} value={val} className="bg-background-main">{label as string}</option>
                  ))}
                </select>
             </div>

             {timeRange === 'custom' && (
                <div className="flex items-center gap-3 px-6 py-2.5 bg-bg-panel/20 rounded-2xl border border-border-primary/10 animate-in slide-in-from-left-2">
                   <input 
                     type="time" 
                     value={startHour} 
                     onChange={(e) => setStartHour(e.target.value)}
                     className="bg-transparent text-[11px] font-black text-accent-cyan focus:outline-none w-20"
                   />
                   <span className="text-[9px] font-black text-foreground-tertiary opacity-40 uppercase tracking-widest px-2">TO</span>
                   <input 
                     type="time" 
                     value={endHour} 
                     onChange={(e) => setEndHour(e.target.value)}
                     className="bg-transparent text-[11px] font-black text-accent-cyan focus:outline-none w-20"
                   />
                </div>
             )}

             <div className="hidden md:flex flex-1 items-center gap-3 px-6 border-l border-border-primary/20">
                <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse group-hover:scale-150 transition-transform" />
                <span className="text-[9px] font-black text-foreground-tertiary uppercase tracking-[0.3em] opacity-60">{(t('dashboard.strategicPulse') as string)}</span>
             </div>
          </div>

          <div className="hidden xl:flex items-center gap-4 px-6 py-4 bg-accent-cyan/[0.03] border border-accent-cyan/10 rounded-2xl flex-1 animate-in slide-in-from-right-4 duration-700">
             <div className="h-2 w-2 rounded-full bg-accent-cyan animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground-tertiary">
               {(t('common.reliabilityTracking'))}
             </p>
          </div>
        </div>
      </StaggerItem>

      <StaggerItem>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {kpiItems.map((item) => (
            <div key={item.label} onClick={item.onClick} className={item.onClick ? 'cursor-pointer active:scale-95 transition-all' : ''}>
              <KpiCard label={item.label} value={item.value} tooltip={item.tooltip} />
            </div>
          ))}
        </div>
      </StaggerItem>

      <StaggerItem>
        <section className="premium-capsule p-5 sm:p-8 shadow-inner-lg overflow-visible">
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <h2 className="text-xl font-black text-foreground-primary uppercase tracking-[0.2em]">{(t('dashboard.priorityInsights') as string)}</h2>
            <InfoTooltip text={(t('tooltips.fileIntegrityMonitoring') as string)} />
          </div>
          <div className="mt-3 space-y-3 relative z-10">
            {insights.length === 0 ? (
               <div className="p-10 text-center opacity-30">
                  <span className="text-[10px] font-black uppercase tracking-widest">{t('common.noData')}</span>
               </div>
            ) : (
              (insights as string[]).map((insight) => (
              <li 
                key={insight}
                className="premium-card !p-4 !rounded-2xl bg-bg-panel/10 hover:bg-bg-panel/30 border-2 border-border-primary/20 flex items-center gap-4 group cursor-pointer"
              >
                <div className="h-2 w-2 rounded-full bg-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-[11px] font-black uppercase tracking-tighter text-foreground-secondary group-hover:text-foreground-primary transition-colors">
                  {insight}
                </span>
              </li>
              ))
            )}
          </div>
        </section>
      </StaggerItem>

      <div className="grid gap-8 lg:grid-cols-2">
        <StaggerItem>
          <article className="premium-capsule p-8">
            <div className="flex items-center gap-3 border-b-2 border-border-primary/20 pb-4 mb-6">
              <h2 className="text-lg font-black text-foreground-primary uppercase tracking-widest">{(t('dashboard.severityDistribution') as string)}</h2>
              <InfoTooltip text={(t('tooltips.severity') as string)} />
            </div>
            <div className="h-[350px] sm:h-[500px] relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={severityData} 
                    dataKey="value" 
                    nameKey="name" 
                    outerRadius={130} 
                    stroke="none"
                    animationDuration={1500}
                    onClick={(data) => handleDrillDown('severity', data.name)}
                    className="cursor-pointer"
                  >
                    {severityData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    wrapperClassName="z-[1000] !p-0" 
                    contentStyle={{ 
                      backgroundColor: 'rgba(2, 6, 23, 0.95)', 
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(var(--accent-cyan-rgb), 0.3)', 
                      borderRadius: '1.25rem',
                      padding: '16px', 
                      fontSize: '11px', 
                      fontWeight: '900',
                      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                      color: 'white'
                    }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </article>
        </StaggerItem>

        <StaggerItem>
          <article className="premium-capsule p-8">
            <div className="flex items-center gap-3 border-b-2 border-border-primary/20 pb-4 mb-6">
              <h2 className="text-lg font-black text-foreground-primary uppercase tracking-widest">{(t('dashboard.categoryDistribution') as string)}</h2>
              <InfoTooltip text={(t('tooltips.categoryDistribution') as string)} />
            </div>
            <div className="h-[350px] sm:h-[500px] relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[...categoryData].sort((a,b) => b.value - a.value)} margin={{ bottom: 130, left: 10, right: 10, top: 40 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="var(--border-primary)" opacity={0.2} vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--text-tertiary)" 
                    fontSize={10} 
                    fontWeight={900} 
                    axisLine={false} 
                    tickLine={false} 
                    interval={0}
                    height={120}
                    tick={(props) => {
                      const { x, y, payload } = props;
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <text x={0} y={0} dy={16} textAnchor="end" fill="var(--text-secondary)" fontSize={9} fontWeight={900} transform="rotate(-45)">
                            {payload.value}
                          </text>
                        </g>
                      );
                    }}
                  />
                  <YAxis stroke="var(--text-tertiary)" fontSize={11} fontWeight={900} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(var(--accent-cyan-rgb),0.05)' }} 
                    wrapperClassName="z-[1000] !p-0"
                    contentStyle={{ 
                      backgroundColor: 'rgba(2, 6, 23, 0.95)', 
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(var(--accent-cyan-rgb), 0.3)', 
                      borderRadius: '1.25rem',
                      padding: '16px', 
                      fontSize: '11px', 
                      fontWeight: '900',
                      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                      color: 'white'
                    }} 
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[10, 10, 0, 0]}
                    animationDuration={1500}
                    onClick={(data) => handleDrillDown('category', data.name)}
                    className="cursor-pointer"
                  >
                    <LabelList 
                      dataKey="value" 
                      position="top" 
                      offset={12} 
                      style={{ fill: 'var(--accent-cyan)', fontSize: '11px', fontWeight: '900' }} 
                    />
                    {categoryData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        </StaggerItem>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <StaggerItem>
          <TopList title={(t('dashboard.topHosts') as string)} items={topHosts} tooltip={(t('tooltips.topHosts') as string)} onClick={(name) => handleDrillDown('hostname', name)} sensitive />
        </StaggerItem>
        <StaggerItem>
          <TopList title={(t('dashboard.topRules') as string)} items={topRules} tooltip={(t('tooltips.topRules') as string)} />
        </StaggerItem>
      </div>

      <StaggerItem>
        <RecentAlertsTable alerts={latest} />
      </StaggerItem>
    </StaggerGroup>
  );
}

interface TopListProps {
  title: string;
  items: any[];
  tooltip?: string;
  onClick?: (name: string) => void;
  sensitive?: boolean;
}

function TopList({ title, items, tooltip, onClick, sensitive = false }: TopListProps) {
  return (
    <article className="premium-capsule p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <h2 className="text-lg font-black text-foreground-primary uppercase tracking-widest">{title}</h2>
        {tooltip && <InfoTooltip text={tooltip} />}
      </div>
      <ul className="space-y-3 relative z-10">
        {items.map((item) => (
          <li 
            key={item.name} 
            onClick={() => onClick && onClick(item.name)}
            className={`premium-card !p-4 !rounded-2xl border-border-primary/20 bg-bg-panel/10 flex items-center justify-between group transition-all duration-300 ${onClick ? 'cursor-pointer active:scale-95' : 'cursor-default'}`}
          >
            <span className="truncate pr-2 text-[11px] font-black uppercase tracking-tighter text-foreground-primary transition-colors group-hover:text-accent-cyan">
              {sensitive ? <SensitiveText value={item.name} /> : item.name}
            </span>
            <span className="flex h-8 min-w-[3rem] items-center justify-center rounded-xl bg-bg-panel/40 px-3 text-[11px] font-black tabular-nums text-accent-cyan border-2 border-accent-cyan/10 group-hover:border-accent-cyan/40 transition-all">
              {item.value}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}
