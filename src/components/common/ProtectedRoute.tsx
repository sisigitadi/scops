import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getHomePathByRole, ROLES, useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

/**
 * ProtectedRoute — Identity & Access Firewall
 * Enforces strict role-based access control (RBAC) and capability-aware routing 
 * while managing automated demo session provisioning.
 */

interface ProtectedRouteProps {
  requiredRoles?: string[] | null;
  requiredCapability?: string | null;
}

export default function ProtectedRoute({ requiredRoles = null, requiredCapability = null }: ProtectedRouteProps) {
  const { user, login, hasCapability } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const isDemoRoute = location.pathname.includes('/demo');

  // Auto-provision demo session for deep-linked demo routes or demo environment
  useEffect(() => {
    const isEnvDemo = import.meta.env.VITE_APP_ENV === 'demo';
    if (!user && (isDemoRoute || isEnvDemo)) {
      login({
        id: 'demo-portal-access',
        name: (t('auth.personas.demo.name') as string) || 'Demo User',
        role: ROLES.DEMO
      });
    }
  }, [user, isDemoRoute, login, t]);

  // Redirection protocol: Unauthorized users must be purged to the login gateway
  if (!user) {
    if (isDemoRoute) {
      // Transition state: Awaiting auto-login convergence
      return null;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const homePath = getHomePathByRole(user.role);

  // Cross-compartment contamination prevention
  if (isDemoRoute && user.role !== ROLES.DEMO) {
    return <Navigate to={homePath} replace />;
  }

  if (!isDemoRoute && location.pathname.includes('/app') && user.role === ROLES.DEMO) {
    return <Navigate to={homePath} replace />;
  }

  // Capability-based authorization check
  if (requiredCapability && !hasCapability(requiredCapability)) {
    return <Navigate to={homePath} replace />;
  }

  // RBAC Convergence: Admin override exists for forensic continuity
  if (requiredRoles && Array.isArray(requiredRoles) && requiredRoles.length > 0) {
    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole && user.role !== ROLES.ADMIN) {
      return <Navigate to={homePath} replace />;
    }
  }

  return <Outlet />;
}
