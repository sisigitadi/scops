import React from 'react';
import { Shield, Sliders, Info, Activity } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import InfoTooltip from '../../common/InfoTooltip';
import IntegratorGuide from '../IntegratorGuide';
import { SOCSettings } from '../../../context/SettingsContext';

/**
 * SettingsIntegrationsOpenCTI — Threat Intel Governance
 * High-fidelity control plane for OpenCTI Hub integration, 
 * confidence threshold orchestration, and real-time connectivity validation.
 */

interface SettingsIntegrationsOpenCTIProps {
  localSettings: SOCSettings;
  setLocalSettings: React.Dispatch<React.SetStateAction<SOCSettings>>;
  isReadOnly: boolean;
  isDemoUser: boolean;
  testing: Record<string, boolean>;
  testConnection: (id: string) => Promise<void>;
  showIntegratorGuide: boolean;
  setShowIntegratorGuide: (show: boolean) => void;
}

export default function SettingsIntegrationsOpenCTI({ 
  localSettings, 
  setLocalSettings, 
  isReadOnly, 
  isDemoUser, 
  testing, 
  testConnection, 
  showIntegratorGuide, 
  setShowIntegratorGuide 
}: SettingsIntegrationsOpenCTIProps) {
  const { t } = useLanguage();

  const updateField = (field: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      opencti: { ...prev.opencti, [field]: value }
    }));
  };

  return (
    <div className="premium-capsule p-8 shadow-inner-lg">
      <div className="flex items-center gap-4 mb-8 relative z-10 border-b border-border-primary/20 pb-6 font-bold">
        <div className="p-3 rounded-2xl bg-accent-indigo/10 text-accent-indigo border border-accent-indigo/20">
          <Shield size={24} strokeWidth={2.5} className={localSettings.opencti.status === 'connected' ? 'indicator-indigo-max' : 'indicator-alert-max'} />
        </div>
        <div>
          <h2 className="text-xl font-black text-foreground-primary uppercase tracking-[0.2em] flex items-center gap-2">
            {(t('settings.groupOpencti') as string) || 'OPENCTI HUB'}
            <InfoTooltip text={(t('settings.tooltips.ttOpenCTISetup') as string)} />
          </h2>
          <p className="text-[10px] font-black text-foreground-tertiary uppercase tracking-widest opacity-60 mt-1">{(t('settings.integrations.threatIntelDesc') as string)}</p>
        </div>
      </div>

      <div className="space-y-6 relative z-10 font-bold">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
             <label className="text-[10px] font-black text-foreground-tertiary uppercase tracking-[0.3em] pl-4">{(t('settings.openctiFields.url') as string)}</label>
             <InfoTooltip text={(t('settings.tooltips.openctiUrl') as string)} />
          </div>
          <input 
            type={isDemoUser ? "password" : "text"} 
            value={localSettings.opencti.url}
            onChange={(e) => updateField('url', e.target.value)}
            disabled={isReadOnly}
            className="premium-input w-full bg-bg-panel/20 font-black tracking-widest"
            placeholder="https://intel.cloud.local"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
             <label className="text-[10px] font-black text-foreground-tertiary uppercase tracking-[0.3em] pl-4">{(t('settings.openctiFields.token') as string)}</label>
             <InfoTooltip text={(t('settings.tooltips.openctiToken') as string)} />
          </div>
          <input 
            type="password" 
            value={isDemoUser ? '********' : localSettings.opencti.token}
            onChange={(e) => updateField('token', e.target.value)}
            disabled={isReadOnly}
            className="premium-input w-full bg-bg-panel/20 font-black"
            placeholder="TOKEN AUTHENTICATION"
          />
        </div>

         <div className="space-y-4 p-5 rounded-2xl bg-bg-panel/20 border border-border-primary/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sliders size={14} className="text-accent-indigo" strokeWidth={3} />
              <span className="text-[10px] font-black text-foreground-primary uppercase tracking-widest">{(t('settings.openctiFields.confidence') as string)}</span>
              <InfoTooltip text={(t('settings.tooltips.openctiConfidence') as string)} />
            </div>
            <span className="text-xs font-black text-accent-indigo">{localSettings.opencti.confidenceThreshold}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            step="5"
            value={localSettings.opencti.confidenceThreshold}
            onChange={(e) => updateField('confidenceThreshold', parseInt(e.target.value))}
            disabled={isReadOnly}
            className="premium-slider"
          />
          <p className="text-[9px] text-foreground-tertiary font-black uppercase tracking-tighter opacity-60">
            {(t('settings.integrations.confidenceDesc') as string)}
          </p>
        </div>

         <div className="flex flex-col gap-4 pt-4">
          <div className="flex items-center gap-3 px-4 py-2 bg-bg-panel/40 rounded-xl border border-border-primary/10">
            <div className={`w-3 h-3 rounded-full ${localSettings.opencti.status === 'connected' ? 'indicator-active indicator-glow' : 'bg-status-danger-text indicator-alert-max'}`} />
            <span className="text-[9px] text-foreground-primary font-black uppercase tracking-widest">{(t('settings.openctiFields.status') as string)}: {localSettings.opencti.status.toUpperCase()}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowIntegratorGuide(!showIntegratorGuide)}
              className="premium-button !py-2.5 !px-4 !text-[9px] flex-1 !border-border-primary/40 !text-foreground-tertiary hover:!text-accent-indigo font-black uppercase tracking-widest"
            >
              <Info size={14} strokeWidth={2.5} className="mr-2 inline" />
              {showIntegratorGuide ? (t('settings.integrations.btnHideInfo') as string) : (t('settings.integrations.btnSetupOps') as string)}
            </button>
            <button 
              onClick={() => testConnection('opencti')}
              className="premium-button !py-2.5 !px-4 !text-[9px] flex-1 !bg-accent-indigo/10 !text-accent-indigo !border-accent-indigo/30 hover:!bg-accent-indigo/20 font-black uppercase tracking-widest"
            >
              {testing.opencti ? <Activity size={14} className="animate-spin mr-2 inline" /> : <Shield size={14} strokeWidth={2.5} className="mr-2 inline" />}
              {(t('settings.integrations.btnProbeHub') as string)}
            </button>
          </div>
        </div>

        {showIntegratorGuide && (
          <div className="mt-4 animate-in slide-in-from-top-4">
            <IntegratorGuide />
          </div>
        )}
      </div>
    </div>
  );
}
