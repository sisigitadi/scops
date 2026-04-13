import React from 'react';
import { Send, Activity, Bot } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import InfoTooltip from '../../common/InfoTooltip';
import { SOCSettings } from '../../../context/SettingsContext';

/**
 * SettingsIntegrationsTelegram — Command Channel Governance
 * High-fidelity control plane for Telegram Bot orchestration, 
 * real-time notification dispatch, and command-and-control handshake validation.
 */

interface SettingsIntegrationsTelegramProps {
  localSettings: SOCSettings;
  setLocalSettings: React.Dispatch<React.SetStateAction<SOCSettings>>;
  isReadOnly: boolean;
  isDemoUser: boolean;
  testing: Record<string, boolean>;
  testConnection: (id: string) => Promise<void>;
}

export default function SettingsIntegrationsTelegram({ 
  localSettings, 
  setLocalSettings, 
  isReadOnly, 
  isDemoUser, 
  testing, 
  testConnection 
}: SettingsIntegrationsTelegramProps) {
  const { t } = useLanguage();

  const updateField = (field: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        telegram: { ...prev.channels.telegram, [field]: value }
      }
    }));
  };

  return (
    <div className="premium-capsule p-8 shadow-inner-lg">
      <div className="flex items-center justify-between mb-8 relative z-10 border-b border-border-primary/20 pb-6 font-bold">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
            <Send size={24} strokeWidth={2.5} className={localSettings.channels.telegram.status === 'connected' ? 'indicator-glow-max' : 'indicator-alert-max'} />
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground-primary uppercase tracking-[0.2em] flex items-center gap-2">
              {(t('settings.integrations.telegramHeader') as string)}
              <InfoTooltip text={(t('settings.tooltips.ttTelegram') as string)} />
            </h2>
            <p className="text-[10px] font-black text-foreground-tertiary uppercase tracking-widest opacity-60 mt-1">{(t('settings.integrations.telegramDesc') as string)}</p>
          </div>
        </div>
        <input 
          type="checkbox"
          checked={localSettings.channels.telegram.enabled}
          onChange={(e) => updateField('enabled', e.target.checked)}
          className="premium-checkbox"
          disabled={isReadOnly}
        />
      </div>
      
      <div className="space-y-6 relative z-10 font-bold">
        {localSettings.channels.telegram.enabled ? (
          <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
             <div className="space-y-2">
                <div className="flex items-center gap-2">
                   <label className="text-[10px] font-black text-foreground-tertiary uppercase tracking-[0.3em] pl-4">BOT AUTH TOKEN</label>
                   <InfoTooltip text={(t('settings.tooltips.telegramBot') as string)} />
                </div>
                <input type="password" value={isDemoUser ? '********' : localSettings.channels.telegram.token} onChange={e => updateField('token', e.target.value)} disabled={isReadOnly} className="premium-input w-full bg-bg-panel/20 font-black h-12" placeholder="712XXXX..." />
             </div>
             <div className="space-y-2">
                <div className="flex items-center gap-2">
                   <label className="text-[10px] font-black text-foreground-tertiary uppercase tracking-[0.3em] pl-4">TARGET CHAT ID</label>
                   <InfoTooltip text={(t('settings.tooltips.telegramChat') as string)} />
                </div>
                <input type={isDemoUser ? "password" : "text"} value={isDemoUser ? '********' : localSettings.channels.telegram.chatId} onChange={e => updateField('chatId', e.target.value)} disabled={isReadOnly} className="premium-input w-full bg-bg-panel/20 font-black h-12 tracking-widest" placeholder="-100..." />
             </div>
             
             <button onClick={() => testConnection('telegram')} className="premium-button w-full !py-4 !bg-accent-cyan/10 !text-accent-cyan !border-accent-cyan/30 hover:!bg-accent-cyan/20 font-black tracking-widest uppercase">
                {testing.telegram ? <Activity size={16} className="animate-spin mr-2 inline" /> : <Bot size={16} strokeWidth={2.5} className="mr-2 inline" />}
                {(t('settings.integrations.btnHandshake') as string)}
             </button>
          </div>
        ) : (
          <div className="py-10 text-center border border-dashed border-border-primary/20 rounded-3xl opacity-40">
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground-tertiary">{(t('settings.integrations.engineDisabled') as string)}</p>
          </div>
        )}
        
        <div className="flex items-center justify-center gap-3 px-4 py-2.5 bg-bg-panel/20 rounded-2xl border border-border-primary/10">
           <div className={`w-3 h-3 rounded-full ${localSettings.channels.telegram.status === 'connected' ? 'bg-status-success-text indicator-glow-max' : 'bg-status-danger-text indicator-alert-max'}`} />
           <span className="text-[10px] text-foreground-primary font-black uppercase tracking-widest opacity-80">
              {(t('settings.integrations.handshakeLabel') as string)} {localSettings.channels.telegram.status.toUpperCase()}
           </span>
        </div>
      </div>
    </div>
  );
}
