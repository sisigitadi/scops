import React from 'react';
import { Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import InfoTooltip from '../common/InfoTooltip';
import { useLanguage } from '../../context/LanguageContext';
import { SOCSettings } from '../../context/SettingsContext';

interface TriageHeaderProps {
  settings: SOCSettings;
}

/**
 * TriageHeader — Workspace Control Panel
 * Handles alert navigation, population, and metadata visualization for the triage pipeline.
 */
export default function TriageHeader({ 
  settings
}: TriageHeaderProps) {
  const { t } = useLanguage();

  return (
    <section className="premium-capsule p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center gap-6 relative z-10 min-w-0">
        <div className="hidden sm:block floating shrink-0">
          <img 
            src={settings.appLogo || `${import.meta.env.BASE_URL}logo.png`} 
            alt="Logo" 
            className="h-20 w-20 object-contain drop-shadow-2xl border-2 border-accent-cyan/20 rounded-2xl bg-bg-panel/40 p-2" 
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="truncate text-3xl font-black text-foreground-primary tracking-[0.2em] uppercase leading-none">
              {t('nav.triage')}
            </h1>
            <InfoTooltip text={t('tooltips.triageTitle')} />
          </div>
          <p className="mt-3 text-sm text-foreground-secondary font-black tracking-tight uppercase opacity-70 max-w-xl">{t('triage.subtitle')}</p>
        </div>
      </div>

    </section>
  );
}
