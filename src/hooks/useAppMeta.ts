import { useMemo } from 'react';
import { useSettings } from '../context/SettingsContext';

/**
 * useAppMeta — Application Metadata Assertion
 * High-fidelity hook for retrieving application identity parameters, 
 * ensuring consistent branding and versioning across the operational interface.
 */

interface AppMeta {
  appName: string;
  version: string;
}

export function useAppMeta(): AppMeta {
  const { settings } = useSettings();
  
  return useMemo(
    () => ({
      appName: `${settings.appName || 'SOC OPS'} - ${settings.orgName || 'Security Control Center'}`,
      version: 'V2.0'
    }),
    [settings.appName, settings.orgName]
  );
}
