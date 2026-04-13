import React from 'react';
import SettingsIntegrationsPulse from './integrations/SettingsIntegrationsPulse';
import SettingsIntegrationsWazuh from './integrations/SettingsIntegrationsWazuh';
import SettingsIntegrationsOpenCTI from './integrations/SettingsIntegrationsOpenCTI';
import SettingsIntegrationsTelegram from './integrations/SettingsIntegrationsTelegram';
import SettingsIntegrationsDatabase from './integrations/SettingsIntegrationsDatabase';
import { SOCSettings } from '../../context/SettingsContext';

/**
 * SettingsIntegrations — Ecosystem Connectivity Governance
 * High-fidelity orchestration plane for configuring and validating 
 * connectivity across the integrated SOC toolchain.
 */

interface SettingsIntegrationsProps {
  localSettings: SOCSettings;
  setLocalSettings: React.Dispatch<React.SetStateAction<SOCSettings>>;
  isReadOnly: boolean;
  isDemoUser: boolean;
  testing: Record<string, boolean>;
  testConnection: (id: string) => Promise<void>;
  showIntegratorGuide: boolean;
  setShowIntegratorGuide: (show: boolean) => void;
}

export default function SettingsIntegrations({ 
  localSettings, 
  setLocalSettings, 
  isReadOnly, 
  isDemoUser,
  testing,
  testConnection,
  showIntegratorGuide,
  setShowIntegratorGuide
}: SettingsIntegrationsProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
      <SettingsIntegrationsPulse 
        localSettings={localSettings} 
        isDemoUser={isDemoUser}
      />

      <SettingsIntegrationsWazuh 
        localSettings={localSettings}
        setLocalSettings={setLocalSettings}
        isReadOnly={isReadOnly}
        isDemoUser={isDemoUser}
        testing={testing}
        testConnection={testConnection}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SettingsIntegrationsOpenCTI 
          localSettings={localSettings}
          setLocalSettings={setLocalSettings}
          isReadOnly={isReadOnly}
          isDemoUser={isDemoUser}
          testing={testing}
          testConnection={testConnection}
          showIntegratorGuide={showIntegratorGuide}
          setShowIntegratorGuide={setShowIntegratorGuide}
        />

        <SettingsIntegrationsTelegram 
          localSettings={localSettings}
          setLocalSettings={setLocalSettings}
          isReadOnly={isReadOnly}
          isDemoUser={isDemoUser}
          testing={testing}
          testConnection={testConnection}
        />

        <SettingsIntegrationsDatabase 
          localSettings={localSettings}
          setLocalSettings={setLocalSettings}
          isReadOnly={isReadOnly}
          isDemoUser={isDemoUser}
          testing={testing}
          testConnection={testConnection}
        />
      </div>
    </div>
  );
}
