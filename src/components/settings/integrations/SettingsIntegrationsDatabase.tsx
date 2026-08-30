import React from 'react';
import { Database, Activity, Database as DatabaseIcon } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import InfoTooltip from '../../common/InfoTooltip';
import { SOCSettings } from '../../../context/SettingsContext';

/**
 * SettingsIntegrationsDatabase — Forensics Vault Governance
 * High-fidelity control plane for external database orchestration, 
 * historical record persistence, and high-performance throughput validation.
 */

interface SettingsIntegrationsDatabaseProps {
  localSettings: SOCSettings;
  setLocalSettings: React.Dispatch<React.SetStateAction<SOCSettings>>;
  isReadOnly: boolean;
  isDemoUser: boolean;
  testing: Record<string, boolean>;
  testConnection: (id: string) => Promise<void>;
}

export default function SettingsIntegrationsDatabase({ 
  localSettings, 
  setLocalSettings, 
  isReadOnly, 
  isDemoUser, 
  testing, 
  testConnection 
}: SettingsIntegrationsDatabaseProps) {
  const { t } = useLanguage();

  const updateField = (field: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      database: { ...prev.database, [field]: value }
    }));
  };

  return (
    <div className="premium-capsule p-8 shadow-inner-lg">
      <div className="flex items-center justify-between mb-8 relative z-10 border-b border-border-primary/20 pb-6 font-bold">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
            <Database size={24} strokeWidth={2.5} className={localSettings.database.status === 'connected' ? 'indicator-glow-max' : 'indicator-alert-max'} />
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground-primary uppercase tracking-[0.2em] flex items-center gap-2">
              {String(t('settings.integrations.databaseHeader'))}
              <InfoTooltip text={String(t('settings.tooltips.ttDatabase'))} />
            </h2>
            <p className="text-[10px] font-black text-foreground-tertiary uppercase tracking-widest opacity-60 mt-1">{String(t('settings.integrations.databaseDesc'))}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent-cyan/5 border border-accent-cyan/20">
           <span className="text-[8px] font-black text-accent-cyan tracking-widest uppercase">CLUSTER ACTIVE</span>
        </div>
      </div>
      
      <div className="space-y-6 relative z-10 font-bold">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-300">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-foreground-tertiary uppercase tracking-[0.3em] pl-4">DATABASE HOST</label>
              <input type="text" value={localSettings.database.host} onChange={e => updateField('host', e.target.value)} disabled={isReadOnly} className="premium-input w-full bg-bg-panel/20 font-black h-12" placeholder="db.socops.com" />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-foreground-tertiary uppercase tracking-[0.3em] pl-4">PORT</label>
              <input type="text" value={localSettings.database.port} onChange={e => updateField('port', e.target.value)} disabled={isReadOnly} className="premium-input w-full bg-bg-panel/20 font-black h-12" placeholder="5432" />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-foreground-tertiary uppercase tracking-[0.3em] pl-4">ENGINE TYPE</label>
              <select value={localSettings.database.type} onChange={e => updateField('type', e.target.value)} disabled={isReadOnly} className="premium-input w-full bg-bg-panel/20 font-black h-12">
                 <option value="PostgreSQL">POSTGRESQL</option>
                 <option value="MySQL">MYSQL</option>
                 <option value="MongoDB">MONGODB</option>
                 <option value="Oracle">ORACLE RAC</option>
              </select>
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-foreground-tertiary uppercase tracking-[0.3em] pl-4">VAULT NAME</label>
              <input type="text" value={localSettings.database.name} onChange={e => updateField('name', e.target.value)} disabled={isReadOnly} className="premium-input w-full bg-bg-panel/20 font-black h-12" placeholder="socops_forensics" />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-foreground-tertiary uppercase tracking-[0.3em] pl-4">USERNAME</label>
              <input type="text" value={localSettings.database.user} onChange={e => updateField('user', e.target.value)} disabled={isReadOnly} className="premium-input w-full bg-bg-panel/20 font-black h-12" />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-foreground-tertiary uppercase tracking-[0.3em] pl-4">PASSWORD</label>
              <input type="password" value={isDemoUser ? '********' : localSettings.database.password} onChange={e => updateField('password', e.target.value)} disabled={isReadOnly} className="premium-input w-full bg-bg-panel/20 font-black h-12" />
           </div>
        </div>
        
        <button onClick={() => testConnection('database')} className="premium-button w-full !py-4 !bg-accent-cyan/10 !text-accent-cyan !border-accent-cyan/30 hover:!bg-accent-cyan/20 font-black tracking-widest uppercase">
           {testing.database ? <Activity size={16} className="animate-spin mr-2 inline" /> : <DatabaseIcon size={16} strokeWidth={2.5} className="mr-2 inline" />}
           {String(t('settings.integrations.btnHandshake'))}
        </button>
        
        <div className="flex items-center justify-center gap-3 px-4 py-2.5 bg-bg-panel/20 rounded-2xl border border-border-primary/10">
           <div className={`w-3 h-3 rounded-full ${localSettings.database.status === 'connected' ? 'bg-status-success-text indicator-glow-max' : 'bg-status-danger-text indicator-alert-max'}`} />
           <span className="text-[10px] text-foreground-primary font-black uppercase tracking-widest opacity-80">
              {String(t('settings.integrations.handshakeLabel'))} {localSettings.database.status.toUpperCase()}
           </span>
        </div>
      </div>
    </div>
  );
}
