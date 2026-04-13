import React, { Suspense, lazy } from 'react';
import { createHashRouter, RouteObject, Navigate } from 'react-router-dom';
import NotFoundPage from '../pages/NotFoundPage';
import PageErrorBoundary from '../components/common/PageErrorBoundary';
import PageRuntimeGuard from '../components/common/PageRuntimeGuard';
import RouteLoadingFallback from '../components/common/RouteLoadingFallback';
import { CAPABILITIES } from '../context/AuthContext';
import App from '../App';

/**
 * Tactical Router Architecture — Integrated Mission Control
 * Handles secure pathing, lazy-module mounting, and forensic boundary protection.
 */

const ProtectedRoute = lazy(() => import('../components/common/ProtectedRoute'));
const DashboardLayout = lazy(() => import('../components/layout/DashboardLayout'));
const LandingPage = lazy(() => import('../pages/LandingPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const AlertsPage = lazy(() => import('../pages/AlertsPage'));
const TriagePage = lazy(() => import('../pages/TriagePage'));
const ReportsPage = lazy(() => import('../pages/ReportsPage'));
const FalsePositivePage = lazy(() => import('../pages/FalsePositivePage'));
const DataIngestionPage = lazy(() => import('../pages/DataIngestionPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const ManagementPage = lazy(() => import('../pages/ManagementPage'));
const AuditPage = lazy(() => import('../pages/AuditPage'));
const OperationsPage = lazy(() => import('../pages/OperationsPage'));

function withSuspense(element: React.ReactNode) {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      {element}
    </Suspense>
  );
}

function withPageShell(element: React.ReactNode, pageName: string, requiresAlertService = false) {
  return (
    <PageErrorBoundary pageName={pageName}>
      <PageRuntimeGuard pageName={pageName} requiresAlertService={requiresAlertService}>
        {withSuspense(element)}
      </PageRuntimeGuard>
    </PageErrorBoundary>
  );
}

function createSecuredChildren(): RouteObject[] {
  return [
    {
      index: true,
      element: withPageShell(<DashboardPage />, 'Dashboard', true)
    },
    {
      path: 'alerts',
      element: withPageShell(<AlertsPage />, 'Alerts', true)
    },
    {
      path: 'triage',
      element: withPageShell(<TriagePage />, 'Triage', true)
    },
    {
      path: 'reports',
      element: withPageShell(<ReportsPage />, 'Reports', true)
    },
    {
      path: 'operations',
      element: withSuspense(<ProtectedRoute requiredCapability={CAPABILITIES.ACCESS_OPERATIONS} />),
      children: [
        {
          index: true,
          element: withPageShell(<OperationsPage />, 'Tactical Operations', true)
        }
      ]
    },
    {
      path: 'management',
      element: withSuspense(<ProtectedRoute requiredCapability={CAPABILITIES.ACCESS_OPERATIONS} />),
      children: [
        {
          index: true,
          element: withPageShell(<ManagementPage />, 'Operational Management', true)
        },
        {
          path: 'audit',
          element: withPageShell(<AuditPage />, 'System Audit', true)
        }
      ]
    },
    {
      path: 'false-positive',
      element: withPageShell(<FalsePositivePage />, 'False Positive', true)
    },
    {
      path: 'ingestion',
      element: withSuspense(<ProtectedRoute requiredCapability={CAPABILITIES.ACCESS_INGESTION} />),
      children: [
        {
          index: true,
          element: withPageShell(<DataIngestionPage />, 'Ingestion', true)
        }
      ]
    },
    {
      path: 'settings',
      element: withSuspense(<ProtectedRoute requiredCapability={CAPABILITIES.MANAGE_SETTINGS} />),
      children: [
        {
          index: true,
          element: withPageShell(<SettingsPage />, 'Settings')
        }
      ]
    }
  ];
}

const isDemoEnv = import.meta.env.VITE_APP_ENV === 'demo';

export const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: isDemoEnv ? <Navigate to="/demo" replace /> : withPageShell(<LandingPage />, 'Landing')
      },
      {
        path: '/login',
        element: isDemoEnv ? <Navigate to="/demo" replace /> : withPageShell(<LoginPage />, 'Login')
      },
      {
        path: '/app',
        element: withSuspense(<ProtectedRoute />),
        children: [
          {
            path: '*',
            element: withSuspense(<DashboardLayout />),
            children: createSecuredChildren()
          }
        ]
      },
      {
        path: '/demo',
        element: withSuspense(<ProtectedRoute />),
        children: [
          {
            path: '*',
            element: withSuspense(<DashboardLayout />),
            children: createSecuredChildren()
          }
        ]
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
]);
