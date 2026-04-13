import React from 'react';
import { Activity, Terminal, Database, Check, Target } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import InfoTooltip from '../../common/InfoTooltip';
import { SOCSettings } from '../../../context/SettingsContext';

/**
 * SettingsIntegrationsWazuh — Wazuh Ecosystem Governance
 * High-fidelity control plane for configuring Wazuh Manager and Indexer endpoints, 
 * credentials, and operational connectivity status.
 */

interface SettingsIntegrationsWazuhProps {
  localSettings: SOCSettings;
  setLocalSettings: React.Dispatch<React.SetStateAction<SOCSettings>>;
  isReadOnly: boolean;
  isDemoUser: boolean;
  testing: Record<string, boolean>;
  testConnection: (id: string) => Promise<void>;
}

export default function SettingsIntegrationsWazuh({ 
  localSettings, 
  setLocalSettings, 
  isReadOnly, 
  isDemoUser, 
  testing, 
  testConnection 
}: SettingsIntegrationsWazuhProps) {
  const { t } = useLanguage();

  const updateManagerField = (field: string, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      wazuh: {
        ...prev.wazuh,
        manager: { ...prev.wazuh.manager, [field]: value }
      }
    }));
  };

  const updateIndexerField = (field: string, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      wazuh: {
        ...prev.wazuh,
        indexer: { ...prev.wazuh.indexer, [field]: value }
      }
    }));
  };

  return (
    <div className="w-full">
      <div className="premium-capsule p-4 sm:p-8 shadow-inner-lg">
        
        <div className="flex items-center gap-4 mb-6 sm:mb-10 relative z-10 border-b border-border-primary/20 pb-6 font-bold">
          <div className="p-3 rounded-2xl bg-accent-cyan/10 text-accent-cyan border-2 border-accent-cyan/20">
            <Activity size={24} strokeWidth={2.5} className={(localSettings.wazuh.manager.status === 'connected' || localSettings.wazuh.indexer.status === 'connected') ? 'indicator-glow-max' : 'indicator-alert-max'} />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-black text-foreground-primary uppercase tracking-[0.2em] flex items-center gap-2">
              {(t('settings.groupWazuh') as string) || 'WAZUH ECOSYSTEM'}
              <InfoTooltip text={(t('settings.tooltips.ttWazuhSetup') as string)} />
            </h2>
            <p className="text-[10px] font-black text-foreground-tertiary uppercase tracking-widest opacity-60 mt-1">{(t('settings.groupWazuhDesc') as string) || 'Core security operations and incident logging'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10 font-bold">
          {/* Manager API Panel */}
          <div className="premium-card p-6 bg-bg-panel/10 border-border-primary/10 group">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 group-hover:scale-110 transition-transform">
                <Terminal size={18} strokeWidth={2.5} />
              </div>
              <h4 className="text-xs font-black text-foreground-primary uppercase tracking-[0.2em] flex items-center gap-2">
                {(t('settings.wazuhFields.managerPanel') as string) || 'MANAGER API'}
                <InfoTooltip text={(t('settings.tooltips.guideStep1') as string)} />
              </h4>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="col-span-12 sm:col-span-8 space-y-2">
                  <div className="flex items-center gap-2">
                     <label className="text-[10px] font-black text-foreground-tertiary uppercase tracking-[0.3em] pl-2">{(t('settings.wazuhFields.endpoint') as string)}</label>
                     <InfoTooltip text={(t('settings.tooltips.wazuhHost') as string)} />
                  </div>
                  <input type={isDemoUser ? "password" : "text"} value={localSettings.wazuh.manager.host} onChange={e => updateManagerField('host', e.target.value)} disabled={isReadOnly} className="premium-input w-full bg-bg-panel/40 font-black tracking-widest" placeholder="0.0.0.0" />
                </div>
                 <div className="col-span-12 sm:col-span-4 space-y-2">
                  <div className="flex items-center gap-2">
                     <label className="text-[10px] font-black text-foreground-tertiary uppercase tracking-[0.3em] pl-2">{(t('settings.wazuhFields.port') as string)}</label>
                     <InfoTooltip text={(t('settings.tooltips.wazuhPort') as string)} />
                  </div>
                  <input type={isDemoUser ? "password" : "text"} value={localSettings.wazuh.manager.port} onChange={e => updateManagerField('port', e.target.value)} disabled={isReadOnly} className="premium-input w-full bg-bg-panel/40 font-black tracking-widest" placeholder="55000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                     <label className="text-[10px] font-black text-foreground-tertiary uppercase tracking-[0.3em] pl-2">{(t('settings.wazuhFields.user') as string)}</label>
                     <InfoTooltip text={(t('settings.tooltips.wazuhUser') as string)} />
                  </div>
                  <input type={isDemoUser ? "password" : "text"} value={localSettings.wazuh.manager.user} onChange={e => updateManagerField('user', e.target.value)} disabled={isReadOnly} className="premium-input w-full bg-bg-panel/40 font-black tracking-widest" />
                </div>
                 <div className="space-y-2">
                  <div className="flex items-center gap-2">
                     <label className="text-[10px] font-black text-foreground-tertiary uppercase tracking-[0.3em] pl-2">{(t('settings.wazuhFields.password') as string)}</label>
                     <InfoTooltip text={(t('settings.tooltips.wazuhPass') as string)} />
                  </div>
                  <input type="password" value={isDemoUser ? '********' : localSettings.wazuh.manager.password} onChange={e => updateManagerField('password', e.target.value)} disabled={isReadOnly} className="premium-input w-full bg-bg-panel/40" />
                </div>
              </div>
            </div>

             <div className="flex items-center justify-between pt-6 mt-6 border-t border-border-primary/20">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${localSettings.wazuh.manager.status === 'connected' ? 'bg-status-success-text indicator-glow-max' : 'bg-status-danger-text indicator-alert-max'}`} />
                <span className="text-[9px] text-foreground-primary font-black uppercase tracking-widest">{(t('settings.wazuhFields.apiStatus') as string)}: {localSettings.wazuh.manager.status.toUpperCase()}</span>
              </div>
              <button onClick={() => testConnection('wazuh_manager')} className="premium-button !py-2 !px-4 !text-[9px] !border-accent-cyan/30 !text-accent-cyan hover:!bg-accent-cyan/20 font-black tracking-widest">
                {testing.wazuh_manager ? <Activity size={12} className="animate-spin mr-2" /> : <Check size={12} strokeWidth={3} className="mr-2" />}
                {(t('settings.wazuhFields.test') as string) || 'VALIDATE'}
              </button>
            </div>
          </div>

           {/* Indexer Data Panel */}
          <div className="premium-card p-6 bg-bg-panel/10 border-border-primary/10 group">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-accent-indigo/10 text-accent-indigo border border-accent-indigo/20 group-hover:scale-110 transition-transform">
                <Database size={18} strokeWidth={2.5} />
              </div>
              <h4 className="text-xs font-black text-foreground-primary uppercase tracking-[0.2em] flex items-center gap-2">
                {(t('settings.wazuhFields.indexerPanel') as string) || 'WAZUH INDEXER'}
                <InfoTooltip text={(t('settings.tooltips.guideStep2') as string)} />
              </h4>
            </div>

             <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="col-span-12 sm:col-span-8 space-y-2">
                  <div className="flex items-center gap-2">
                     <label className="text-[10px] font-black text-foreground-tertiary uppercase tracking-[0.3em] pl-2">{(t('settings.wazuhFields.indexerHost') as string)}</label>
                     <InfoTooltip text={(t('settings.tooltips.wazuhIndexer') as string)} />
                  </div>
                  <input type={isDemoUser ? "password" : "text"} value={localSettings.wazuh.indexer.host} onChange={e => updateIndexerField('host', e.target.value)} disabled={isReadOnly} className="premium-input w-full bg-bg-panel/40 font-black tracking-widest" placeholder="0.0.0.0" />
                </div>
                <div className="col-span-12 sm:col-span-4 space-y-2">
                   <label className="text-[10px] font-black text-foreground-tertiary uppercase tracking-[0.3em] pl-2">{t('common.port')}</label>
                   <input type={isDemoUser ? "password" : "number"} value={localSettings.wazuh.indexer.port} onChange={e => updateIndexerField('port', e.target.value)} disabled={isReadOnly} className="premium-input w-full bg-bg-panel/40 font-black tracking-widest" placeholder="9200" />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                     <label className="text-[10px] font-black text-foreground-tertiary uppercase tracking-[0.3em] pl-2">{t('common.user')}</label>
                     <InfoTooltip text={(t('settings.tooltips.indexerUser') as string)} />
                  </div>
                  <input type={isDemoUser ? "password" : "text"} value={localSettings.wazuh.indexer.user} onChange={e => updateIndexerField('user', e.target.value)} disabled={isReadOnly} className="premium-input w-full bg-bg-panel/40 font-black tracking-widest" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                     <label className="text-[10px] font-black text-foreground-tertiary uppercase tracking-[0.3em] pl-2">{t('common.password')}</label>
                     <InfoTooltip text={(t('settings.tooltips.indexerPass') as string)} />
                  </div>
                  <input type="password" value={isDemoUser ? '********' : localSettings.wazuh.indexer.password} onChange={e => updateIndexerField('password', e.target.value)} disabled={isReadOnly} className="premium-input w-full bg-bg-panel/40" />
                </div>
              </div>
            </div>

             <div className="flex items-center justify-between pt-6 mt-6 border-t border-border-primary/20">
               <div className="flex items-center gap-3">
                 <div className={`w-3 h-3 rounded-full ${localSettings.wazuh.indexer.status === 'connected' ? 'bg-status-success-text indicator-glow-max' : 'bg-status-danger-text indicator-alert-max'}`} />
                 <span className="text-[9px] text-foreground-primary font-black uppercase tracking-widest">{(t('settings.wazuhFields.dataStatus') as string)}: {localSettings.wazuh.indexer.status.toUpperCase()}</span>
              </div>
              <button onClick={() => testConnection('wazuh_indexer')} className="premium-button !py-2 !px-4 !text-[9px] !border-accent-indigo/30 !text-accent-indigo hover:!bg-accent-indigo/20 font-black tracking-widest">
                {testing.wazuh_indexer ? <Activity size={12} className="animate-spin mr-2" /> : <Target size={12} strokeWidth={3} className="mr-2" />}
                {(t('settings.wazuhFields.test') as string) || 'PROBE'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
