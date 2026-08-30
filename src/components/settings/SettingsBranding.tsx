import React from 'react';
import { Settings as SettingsIcon, Upload, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import InfoTooltip from '../common/InfoTooltip';
import { SOCSettings } from '../../context/SettingsContext';

/**
 * SettingsBranding — Corporate Identity Governance
 * High-fidelity interface for configuring platform branding agents, 
 * including neural application identifiers and visual asset management.
 */

interface SettingsBrandingProps {
  localSettings: SOCSettings;
  setLocalSettings: (settings: SOCSettings) => void;
  isReadOnly: boolean;
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetLogo: () => void;
}

export default function SettingsBranding({ 
  localSettings, 
  setLocalSettings, 
  isReadOnly, 
  handleLogoUpload, 
  resetLogo 
}: SettingsBrandingProps) {
  const { t } = useLanguage();

  return (
    <div className="premium-capsule p-4 sm:p-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-4 mb-6 sm:mb-10 relative z-10 border-b border-border-primary/20 pb-6 font-bold">
        <div className="p-3 rounded-2xl bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
          <SettingsIcon size={24} strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-xl font-black text-foreground-primary uppercase tracking-[0.2em] flex items-center gap-2">
            {(t('settings.groupBranding') as string) || 'BRANDING CORE'}
            <InfoTooltip text={(t('settings.tooltips.ttLogo') as string)} />
          </h2>
          <p className="text-[10px] font-black text-foreground-tertiary uppercase tracking-widest opacity-60 mt-1">{(t('settings.groupBrandingSubtitle') as string) || 'Configure platform identity'}</p>
        </div>
      </div>

      <div className="space-y-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold">
              <label className="text-[10px] font-black text-foreground-tertiary uppercase tracking-[0.3em] pl-4">{(t('settings.fields.appName') as string)}</label>
              <InfoTooltip text={(t('settings.tooltips.appName') as string)} />
            </div>
            <input 
              type="text" 
              value={localSettings.appName}
              onChange={(e) => setLocalSettings({...localSettings, appName: e.target.value.toUpperCase()})}
              disabled={isReadOnly}
              className="premium-input w-full bg-bg-panel/20 font-black uppercase tracking-widest"
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold">
              <label className="text-[10px] font-black text-foreground-tertiary uppercase tracking-[0.3em] pl-4">{(t('settings.fields.orgName') as string)}</label>
              <InfoTooltip text={(t('settings.tooltips.orgName') as string)} />
            </div>
            <input 
              type="text" 
              value={localSettings.orgName}
              onChange={(e) => setLocalSettings({...localSettings, orgName: e.target.value.toUpperCase()})}
              disabled={isReadOnly}
              className="premium-input w-full bg-bg-panel/20 font-black uppercase tracking-widest"
            />
          </div>
        </div>

        <div className="premium-card p-6 flex flex-col md:flex-row items-center gap-10 bg-bg-panel/10 border-border-primary/10">
          <div className="relative group shrink-0">
            <div className="absolute inset-0 bg-accent-cyan/20 blur-2xl group-hover:bg-accent-cyan/40 transition-all opacity-0 group-hover:opacity-100" />
            <div className="relative z-10 w-32 h-32 rounded-3xl border border-border-primary/40 bg-bg-panel/40 p-4 transition-all group-hover:border-accent-cyan/40 group-hover:scale-105 overflow-hidden flex items-center justify-center">
              <img 
                src={localSettings.appLogo || `${import.meta.env.BASE_URL}logo.png`} 
                alt="Logo" 
                className="w-full h-full object-contain" 
              />
              {!isReadOnly && (
                <label className="absolute inset-0 bg-bg-panel/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-accent-cyan backdrop-blur-sm">
                   <Upload size={24} strokeWidth={2.5} />
                   <span className="text-[10px] font-black mt-2 uppercase tracking-widest">{(t('settings.buttons.replace') as string) || 'UPDATE'}</span>
                   <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                </label>
              )}
            </div>
          </div>
          
          <div className="space-y-4 text-center md:text-left flex-1 min-w-0">
             <div className="flex items-center gap-3">
                <h4 className="text-sm font-black text-foreground-primary uppercase tracking-[0.2em]">{(t('settings.corporateBrandingAsset') as string) || 'IDENTITY ASSET'}</h4>
                <InfoTooltip text={(t('settings.tooltips.logo') as string)} />
             </div>
             <p className="text-xs text-foreground-tertiary leading-relaxed font-black opacity-80 uppercase tracking-tighter">
               {(t('settings.groupBrandingDesc') as string) || 'Recommended dimensions: 512x512 PNG with transparency.'}
             </p>
             {localSettings.appLogo && !isReadOnly && (
               <button 
                onClick={resetLogo} 
                className="premium-button !py-2 !px-4 !text-[9px] !border-status-danger-border/30 !text-status-danger-text hover:!bg-status-danger-bg/20 font-black uppercase tracking-widest"
               >
                  <RotateCcw size={12} strokeWidth={3} className="mr-2" /> {(t('settings.resetBranding') as string) || 'RESET TO DEFAULT'}
               </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
