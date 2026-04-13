import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  Activity, Users, Shield, Download, Upload, Cpu
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useOperations } from '../../context/OperationsContext';
import { useSettings } from '../../context/SettingsContext';
import InfoTooltip from '../common/InfoTooltip';

/**
 * ControlCenterDashboard — Intelligence Command Matrix
 * High-fidelity executive visualization of infrastructure health, identity 
 * architecture, and governance pulses within the Pusat Kendali ecosystem.
 */

interface ControlCenterDashboardProps {
  localSettings: any;
  handleExport: () => void;
  handleImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isReadOnly: boolean;
}

export default function ControlCenterDashboard({ 
  localSettings, 
  handleExport, 
  handleImport,
  isReadOnly
}: ControlCenterDashboardProps) {
  const { t } = useLanguage();
  const { auditLogs } = useOperations();
  const { settings } = useSettings();

  // 1. Infrastructure Uptime Matrix
  const uptimeMetrics = useMemo(() => {
    const statuses = [
      settings.wazuh.manager.status,
      settings.wazuh.indexer.status,
      settings.opencti.status,
      settings.channels.telegram.status
    ];
    const total = statuses.length;
    const connected = statuses.filter(s => s === 'connected').length;
    const error = statuses.filter(s => s === 'error').length;
    const disconnected = total - connected - error;
    return {
      percentage: ((connected / total) * 100).toFixed(0),
      count: connected,
      total,
      error,
      disconnected
    };
  }, [settings]);

  // 2. Identity Architecture Distribution
  const roleData = useMemo(() => {
    const counts: Record<string, number> = {
      admin: 0,
      manager: 0,
      l1_analyst: 0,
      auditor: 0,
      demo: 0
    };
    
    localSettings.users.forEach((u: any) => {
      const role = u.role?.toLowerCase() || 'demo';
      if (counts[role] !== undefined) counts[role]++;
      else counts.l1_analyst++;
    });

    return [
      { name: 'ADMIN', value: counts.admin, color: '#06b6d4' },
      { name: 'MANAGER', value: counts.manager, color: '#8b5cf6' },
      { name: 'ANALYST', value: counts.l1_analyst, color: '#3b82f6' },
      { name: 'AUDITOR', value: counts.auditor, color: '#f59e0b' },
      { name: 'GUEST', value: counts.demo, color: '#64748b' }
    ];
  }, [localSettings.users]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Executive Command Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card !p-8 border-l-[6px] border-accent-cyan group">
          <div className="flex justify-between items-start mb-6 font-bold">
            <div className="p-4 rounded-2xl bg-accent-cyan/10 text-accent-cyan group-hover:scale-110 transition-transform duration-500">
              <Cpu size={28} strokeWidth={2.5} className="animate-pulse" />
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-black text-foreground-tertiary uppercase tracking-widest">{(t('settings.dashboard.uptime') as string)}</span>
                 <InfoTooltip text={(t('settings.tooltips.dashUptime') as string)} />
              </div>
              <span className={`text-xs font-black mt-1 ${uptimeMetrics.count === uptimeMetrics.total ? 'text-status-success-text' : 'text-accent-amber'}`}>
                {uptimeMetrics.count}/{uptimeMetrics.total} {(t('settings.dashboard.active') as string)}
              </span>
            </div>
          </div>
          <p className="text-4xl font-black text-foreground-primary tracking-tighter">{uptimeMetrics.percentage}%</p>
          <div className="w-full h-1.5 bg-bg-panel/40 rounded-full mt-4 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${uptimeMetrics.percentage}%` }}
              className={`h-full ${Number(uptimeMetrics.percentage) >= 100 ? 'bg-status-success-text shadow-[0_0_10px_rgba(52,211,153,0.5)]' : Number(uptimeMetrics.percentage) > 0 ? 'bg-accent-amber shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-status-danger-text shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}
            />
          </div>
          <div className="mt-3 text-[9px] font-black uppercase tracking-wider text-foreground-tertiary flex items-center gap-3">
            <span className="text-status-success-text">CONNECTED: {uptimeMetrics.count}</span>
            <span className="text-accent-amber">ERROR: {uptimeMetrics.error}</span>
            <span className="text-status-danger-text">DISCONNECTED: {uptimeMetrics.disconnected}</span>
          </div>
        </div>

        <div className="premium-card !p-8 border-l-[6px] border-accent-indigo group">
          <div className="flex justify-between items-start mb-6 font-bold">
            <div className="p-4 rounded-2xl bg-accent-indigo/10 text-accent-indigo group-hover:scale-110 transition-transform duration-500">
              <Users size={28} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-black text-foreground-tertiary uppercase tracking-widest">{(t('settings.dashboard.identities') as string)}</span>
                 <InfoTooltip text={(t('settings.tooltips.dashIdentities') as string)} />
              </div>
              <span className="text-xs font-black text-status-success-text mt-1 uppercase">{(t('settings.dashboard.managed') as string)}</span>
            </div>
          </div>
          <p className="text-4xl font-black text-foreground-primary tracking-tighter">{localSettings.users.length}</p>
          <p className="text-[10px] font-bold text-foreground-tertiary mt-2 uppercase tracking-tighter opacity-70">
            {localSettings.users.length} {(t('personnel') as string) || 'PERSONNEL'} • {(t('settings.dashboard.personaDist', { count: roleData.filter(d => d.value > 0).length }) as string)}
          </p>
        </div>

        <div className="premium-card !p-8 border-l-[6px] border-accent-purple group">
          <div className="flex justify-between items-start mb-6 font-bold">
            <div className="p-4 rounded-2xl bg-accent-purple/10 text-accent-purple group-hover:scale-110 transition-transform duration-500">
              <Activity size={28} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-black text-foreground-tertiary uppercase tracking-widest text-right">{(t('settings.dashboard.auditCount') as string)}</span>
                 <InfoTooltip text={(t('settings.tooltips.dashAudits') as string)} align="right" />
              </div>
              <span className="text-xs font-black text-accent-cyan mt-1 uppercase">{(t('settings.dashboard.window24h') as string)}</span>
            </div>
          </div>
          <p className="text-4xl font-black text-foreground-primary tracking-tighter">{auditLogs.filter(l => new Date(l.timestamp) > new Date(Date.now() - 24*60*60*1000)).length}</p>
          <p className="text-[10px] font-bold text-foreground-tertiary mt-2 uppercase tracking-tighter opacity-60">{(t('settings.dashboard.auditDesc') as string)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Identity Architecture Distribution Chart */}
        <div className="premium-capsule !p-8">
          <div className="flex items-center gap-4 mb-8 pb-4 border-b border-border-primary/20">
            <div className={`p-2.5 rounded-xl ${uptimeMetrics.count === uptimeMetrics.total ? 'bg-status-success-bg/10 text-status-success-text' : 'bg-accent-amber/10 text-accent-amber'} transition-colors`}>
               <Cpu size={20} className={uptimeMetrics.count === uptimeMetrics.total ? '' : 'indicator-alert-max'} strokeWidth={2.5} />
            </div>
            <h3 className="text-sm font-black text-foreground-primary uppercase tracking-[0.2em]">{(t('settings.dashboard.roleDist') as string)} <InfoTooltip text={(t('settings.tooltips.ttRoleDist') as string)} /></h3>
          </div>
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} 
                />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    border: '1px solid #ffffff10', 
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: 900
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="premium-capsule !p-8 flex flex-col">
          <div className="flex items-center gap-4 mb-8 pb-4 border-b border-border-primary/20">
            {(() => {
              const tone = uptimeMetrics.count === uptimeMetrics.total ? 'ok' : uptimeMetrics.error > 0 ? 'error' : 'down';
              return (
                <>
                  <div className={`p-2.5 rounded-xl ${tone === 'ok' ? 'bg-status-success-text/10 text-status-success-text' : tone === 'error' ? 'bg-accent-amber/10 text-accent-amber' : 'bg-status-danger-text/10 text-status-danger-text'} transition-colors`}>
                    <Cpu size={20} className={tone === 'ok' ? '' : 'animate-pulse'} strokeWidth={2.5} />
                  </div>
                </>
              );
            })()}
            <h3 className="text-sm font-black text-foreground-primary uppercase tracking-[0.2em] flex items-center gap-2">
               {(t('settings.dashboard.maintenance') as string)}
               <InfoTooltip text={(t('settings.tooltips.ttDataMaint') as string)} align="right" />
            </h3>
          </div>

          <div className="flex-1 space-y-8">
             <div className="premium-card !bg-bg-panel/40 p-6 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-accent-cyan/10 text-accent-cyan shrink-0">
                  <Download size={20} />
                </div>
                <div>
                   <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-foreground-primary uppercase tracking-widest">{(t('settings.dashboard.exportBtn') as string)}</h4>
                      <InfoTooltip text={(t('settings.tooltips.dashExport') as string)} align="right" />
                   </div>
                   <p className="text-[10px] text-foreground-tertiary mt-1 leading-relaxed opacity-70">{(t('settings.dashboard.backupDesc') as string)}</p>
                   <button 
                    onClick={handleExport}
                    className="mt-4 premium-button !py-2.5 !px-6 !text-[10px] !bg-accent-cyan/10 !text-accent-cyan !border-accent-cyan/30 hover:!bg-accent-cyan/20 w-full sm:w-auto font-black uppercase tracking-widest"
                   >
                     {(t('settings.dashboard.executeExport') as string)}
                   </button>
                </div>
             </div>

             <div className="premium-card !bg-bg-panel/40 p-6 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-accent-amber/10 text-accent-amber shrink-0">
                  <Upload size={20} />
                </div>
                <div>
                   <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-foreground-primary uppercase tracking-widest">{(t('settings.dashboard.importBtn') as string)}</h4>
                      <InfoTooltip text={(t('settings.tooltips.dashImport') as string)} />
                   </div>
                   <p className="text-[10px] text-foreground-tertiary mt-1 leading-relaxed opacity-70">{(t('settings.dashboard.restoreDesc') as string)}</p>
                   
                   <label className={`
                    mt-4 premium-button !py-2.5 !px-6 !text-[10px] !bg-accent-amber/10 !text-accent-amber !border-accent-amber/30 hover:!bg-accent-amber/20 w-full sm:w-auto cursor-pointer block text-center font-black uppercase tracking-widest
                    ${isReadOnly ? 'opacity-30 pointer-events-none' : ''}
                   `}>
                     {(t('settings.dashboard.initiateRestore') as string)}
                     <input 
                      type="file" 
                      accept=".json" 
                      onChange={handleImport} 
                      className="hidden" 
                      disabled={isReadOnly}
                    />
                   </label>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
