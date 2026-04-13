import React from 'react';
import { motion } from 'framer-motion';
import { 
  Database, RefreshCw, 
  Clock, HardDrive, History, Lock,
  FileText, Activity, AlertCircle, Save
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import InfoTooltip from '../common/InfoTooltip';
import { SOCSettings } from '../../context/SettingsContext';

/**
 * SettingsInfra — Infrastructure Governance Matrix
 * Critical configuration plane for high-frequency synchronization, 
 * database persistence protocols, and operational security thresholds.
 */

interface SettingsInfraProps {
  localSettings: SOCSettings;
  setLocalSettings: React.Dispatch<React.SetStateAction<SOCSettings>>;
  isReadOnly: boolean;
  handleSave: () => void;
}

export default function SettingsInfra({ 
  localSettings, 
  setLocalSettings, 
  isReadOnly, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleSave 
}: SettingsInfraProps) {
  const { t } = useLanguage();

  const updateInfra = (section: keyof SOCSettings['infra'], field: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      infra: {
        ...prev.infra,
        [section]: {
          ...prev.infra[section],
          [field]: value
        }
      }
    }));
  };

  const sections = [
    {
      id: 'sync' as const,
      title: (t('settings.infra.sync.title') as string),
      icon: <RefreshCw size={20} className="text-accent-cyan" />,
      tooltip: (t('settings.tooltips.ttSyncConnect') as string),
      fields: [
        { key: 'pollingInterval', label: (t('settings.infra.sync.pollingInterval') as string), type: 'number', tooltip: (t('settings.infra.sync.pollingIntervalTooltip') as string) },
        { key: 'timeoutMs', label: (t('settings.infra.sync.timeoutMs') as string), type: 'number', tooltip: (t('settings.infra.sync.timeoutMsTooltip') as string) },
        { key: 'maxRetries', label: (t('settings.infra.sync.maxRetries') as string), type: 'number', tooltip: (t('settings.infra.sync.maxRetriesTooltip') as string) },
        { key: 'alertBatchSize', label: (t('settings.infra.sync.alertBatchSize') as string), type: 'number', tooltip: (t('settings.infra.sync.alertBatchSizeTooltip') as string) }
      ]
    },
    {
      id: 'database' as const,
      title: (t('settings.infra.database.title') as string),
      icon: <Database size={20} className="text-accent-cyan" />,
      tooltip: (t('settings.tooltips.ttDbTTL') as string),
      fields: [
        { key: 'presenceTtlMinutes', label: (t('settings.infra.database.presenceTtlMinutes') as string), type: 'number', tooltip: (t('settings.infra.database.presenceTtlMinutesTooltip') as string) },
        { key: 'cleanupThresholdDays', label: (t('settings.infra.database.cleanupThresholdDays') as string), type: 'number', tooltip: (t('settings.infra.database.cleanupThresholdDaysTooltip') as string) },
        { key: 'autoVacuum', label: (t('settings.infra.database.autoVacuum') as string), type: 'toggle', tooltip: (t('settings.infra.database.autoVacuumTooltip') as string) }
      ]
    },
    {
      id: 'logging' as const,
      title: (t('settings.infra.logging.title') as string),
      icon: <History size={20} className="text-accent-cyan" />,
      fields: [
        { key: 'auditRetentionDays', label: (t('settings.infra.logging.auditRetentionDays') as string), type: 'number', tooltip: (t('settings.infra.logging.auditRetentionDaysTooltip') as string) },
        { key: 'minLevel', label: (t('settings.infra.logging.minLevel') as string), type: 'select', options: ['DEBUG', 'INFO', 'WARN', 'ERROR'], tooltip: (t('settings.infra.logging.minLevelTooltip') as string) },
        { key: 'systemVisibility', label: (t('settings.infra.logging.systemVisibility') as string), type: 'select', options: ['STRICT', 'BALANCED', 'RELAXED'], tooltip: (t('settings.infra.logging.systemVisibilityTooltip') as string) }
      ]
    },
    {
      id: 'security' as const,
      title: (t('settings.infra.security.title') as string),
      icon: <Lock size={20} className="text-accent-cyan" />,
      fields: [
        { key: 'sessionTimeoutMinutes', label: (t('settings.infra.security.sessionTimeoutMinutes') as string), type: 'number', tooltip: (t('settings.infra.security.sessionTimeoutMinutesTooltip') as string) },
        { key: 'autoLockIdle', label: (t('settings.infra.security.autoLockIdle') as string), type: 'number', tooltip: (t('settings.infra.security.autoLockIdleTooltip') as string) },
        { key: 'passwordComplexity', label: (t('settings.infra.security.passwordComplexity') as string), type: 'select', options: ['LOW', 'MEDIUM', 'HIGH', 'ELITE'], tooltip: (t('settings.infra.security.passwordComplexityTooltip') as string) }
      ]
    }
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {sections.map((section, idx) => (
          <motion.div 
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="premium-capsule p-8 bg-bg-card/40 border border-border-primary/10 relative overflow-hidden group/section"
          >
            {/* Context BG decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-cyan/5 rounded-full blur-[60px] -mr-10 -mt-10 group-hover/section:bg-accent-cyan/10 transition-all duration-700" />
            
            <div className="relative z-10 font-bold">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-bg-panel border border-border-primary/20 shadow-inner">
                  {section.icon}
                </div>
                <h3 className="text-xl font-black text-foreground-primary tracking-tight uppercase leading-none flex items-center gap-2">
                  {section.title}
                  {section.tooltip && <InfoTooltip text={section.tooltip} align={idx % 2 === 1 ? 'right' : 'center'} />}
                </h3>
              </div>

              <div className="space-y-6">
                {section.fields.map(field => (
                   <div key={field.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-foreground-secondary uppercase tracking-widest">{field.label}</span>
                      <InfoTooltip text={field.tooltip} align={idx % 2 === 1 ? 'right' : 'center'} />
                    </div>

                    <div className="sm:w-48">
                      {field.type === 'number' && (
                        <input 
                          type="number"
                          disabled={isReadOnly}
                          value={(localSettings.infra[section.id] as any)[field.key]}
                          onChange={(e) => updateInfra(section.id, field.key, parseInt(e.target.value) || 0)}
                          className="premium-input !py-2 text-right !bg-bg-panel/40 focus:!border-accent-cyan/50 h-10 w-full font-black"
                        />
                      )}

                      {field.type === 'select' && (
                        <select
                          disabled={isReadOnly}
                          value={(localSettings.infra[section.id] as any)[field.key]}
                          onChange={(e) => updateInfra(section.id, field.key, e.target.value)}
                          className="premium-input !py-2 text-right !bg-bg-panel/40 focus:!border-accent-cyan/50 h-10 w-full appearance-none cursor-pointer uppercase font-black text-[10px]"
                        >
                          {field.options!.map(opt => (
                            <option key={opt} value={opt} className="bg-bg-card">{opt}</option>
                          ))}
                        </select>
                      )}

                      {field.type === 'toggle' && (
                        <div 
                          className={`w-14 h-8 rounded-full border-2 transition-all p-1 cursor-pointer flex items-center ${
                            (localSettings.infra[section.id] as any)[field.key] ? 'border-accent-cyan bg-accent-cyan/10 justify-end' : 'border-border-primary/30 bg-white/5 justify-start'
                          } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => !isReadOnly && updateInfra(section.id, field.key, !(localSettings.infra[section.id] as any)[field.key])}
                        >
                          <motion.div 
                            layout
                            className={`w-5 h-5 rounded-full ${(localSettings.infra[section.id] as any)[field.key] ? 'bg-accent-cyan' : 'bg-foreground-tertiary'}`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Critical Action Alert Enforcement */}
      <div className="p-6 rounded-[2rem] bg-status-danger/5 border border-status-danger/10 flex items-start gap-5">
        <AlertCircle className="text-status-danger-text shrink-0 mt-1" size={24} />
        <div>
          <h4 className="text-status-danger-text text-sm font-black uppercase tracking-widest mb-2">
            {(t('settings.infra.warning.title') as string)}
          </h4>
          <p className="text-xs text-foreground-tertiary leading-relaxed uppercase font-bold opacity-70">
            {(t('settings.infra.warning.desc') as string)}
          </p>
        </div>
      </div>
    </div>
  );
}
