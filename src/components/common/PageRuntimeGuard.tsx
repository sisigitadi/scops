import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlertData } from '../../context/AlertDataContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSettings } from '../../context/SettingsContext';
import { useAuth, ROLES } from '../../context/AuthContext';
import ServiceFallbackPanel from './ServiceFallbackPanel';

/**
 * PageRuntimeGuard — Operational Integrity Intercept
 * Validates the environmental availability of mission-critical data streams (Wazuh Indexer) 
 * before allowing the execution of dependent tactical page modules.
 */

interface PageRuntimeGuardProps {
  children: ReactNode;
  requiresAlertService?: boolean;
}

export default function PageRuntimeGuard({ children, requiresAlertService = false }: PageRuntimeGuardProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { settings } = useSettings();
  const { user, appBasePath } = useAuth();
  const { alerts, isSyncing, syncError, retrySync } = useAlertData();

  if (!requiresAlertService) {
    return <>{children}</>;
  }

  const isDemoUser = user?.role === ROLES.DEMO;
  const indexerConfigured = Boolean(settings.wazuh?.indexer?.host) || isDemoUser;
  const hasCachedAlerts = Array.isArray(alerts) && alerts.length > 0;
  const technicalError = (syncError as any)?.technicalMessage || (syncError as any)?.message || '';
  const hint = (syncError as any)?.hint || '';
  const errorDetail = [technicalError, hint].filter(Boolean).join(' | ');

  if (!indexerConfigured) {
    return (
      <ServiceFallbackPanel
        title={(t('common.runtime.waitingIndexerTitle') as string)}
        message={(t('common.runtime.waitingIndexerMessage') as string)}
        detail={(t('common.runtime.waitingIndexerDetail') as string)}
        onOpenSettings={() => navigate(`${appBasePath}/settings`)}
        settingsLabel={(t('common.runtime.openIntegrationSettings') as string)}
      />
    );
  }

  if (syncError && !isSyncing && !hasCachedAlerts) {
    return (
      <ServiceFallbackPanel
        title={(t('common.runtime.cannotLoadTitle') as string)}
        message={(t('common.runtime.cannotLoadMessage') as string)}
        detail={errorDetail}
        onRetry={retrySync}
        retryLabel={(t('common.runtime.retryConnection') as string)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {syncError ? (
        <ServiceFallbackPanel
          title={(t('common.runtime.degradedTitle') as string)}
          message={(t('common.runtime.degradedMessage') as string)}
          detail={errorDetail}
          onRetry={retrySync}
          retryLabel={(t('common.runtime.retryLiveSync') as string)}
        />
      ) : null}
      {children}
    </div>
  );
}
