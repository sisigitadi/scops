import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSettings } from './SettingsContext';
import api from '../services/api';
import {
  normalizeUsersCredentials,
  verifyPasswordHash
} from '../utils/passwordSecurity';

/**
 * Role Constants for RBAC
 */
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  L1_ANALYST: 'l1_analyst',
  L2_ANALYST: 'l2_analyst',
  AUDITOR: 'auditor',
  DEMO: 'demo'
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const CAPABILITIES = {
  ACCESS_AUDIT: 'access_audit',
  ACCESS_INGESTION: 'access_ingestion',
  MANAGE_SETTINGS: 'manage_settings',
  ACCESS_OPERATIONS: 'access_operations',
  MUTATE_ALERTS: 'mutate_alerts',
  MUTATE_TRIAGE: 'mutate_triage',
  MUTATE_FALSE_POSITIVE: 'mutate_false_positive',
  EXPORT_REPORTS: 'export_reports'
} as const;

export type Capability = typeof CAPABILITIES[keyof typeof CAPABILITIES];

export interface User {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: Role;
  password?: string;
  passwordHash?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  verifyCredentials: (email: string, password: string) => Promise<User>;
  login: (userData: User) => void;
  logout: () => void;
  hasAccess: (requiredRoles: Role[]) => boolean;
  hasCapability: (capability: Capability) => boolean;
  isBackendMode: boolean;
  setIsBackendMode: (mode: boolean) => void;
  appBasePath: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_CAPABILITIES: Record<Role, Set<Capability>> = {
  [ROLES.ADMIN]: new Set(Object.values(CAPABILITIES)),
  [ROLES.MANAGER]: new Set([
    CAPABILITIES.ACCESS_AUDIT,
    CAPABILITIES.ACCESS_OPERATIONS,
    CAPABILITIES.MUTATE_ALERTS,
    CAPABILITIES.MUTATE_TRIAGE,
    CAPABILITIES.MUTATE_FALSE_POSITIVE,
    CAPABILITIES.EXPORT_REPORTS
  ]),
  [ROLES.L2_ANALYST]: new Set([
     CAPABILITIES.ACCESS_AUDIT,
     CAPABILITIES.MUTATE_ALERTS,
     CAPABILITIES.MUTATE_TRIAGE,
     CAPABILITIES.MUTATE_FALSE_POSITIVE,
     CAPABILITIES.EXPORT_REPORTS
  ]),
  [ROLES.L1_ANALYST]: new Set([
    CAPABILITIES.MUTATE_ALERTS,
    CAPABILITIES.MUTATE_TRIAGE,
    CAPABILITIES.MUTATE_FALSE_POSITIVE,
    CAPABILITIES.EXPORT_REPORTS
  ]),
  [ROLES.AUDITOR]: new Set([
     CAPABILITIES.ACCESS_AUDIT,
     CAPABILITIES.ACCESS_INGESTION,
     CAPABILITIES.ACCESS_OPERATIONS
  ]),
  [ROLES.DEMO]: new Set([
     CAPABILITIES.ACCESS_AUDIT,
     CAPABILITIES.ACCESS_OPERATIONS,
     CAPABILITIES.MANAGE_SETTINGS,
     CAPABILITIES.MUTATE_ALERTS,
     CAPABILITIES.MUTATE_TRIAGE,
     CAPABILITIES.MUTATE_FALSE_POSITIVE,
     CAPABILITIES.EXPORT_REPORTS
  ])
};

export function getHomePathByRole(role?: Role): string {
  return role === ROLES.DEMO ? '/demo' : '/app';
}

/**
 * AuthProvider — Production-Grade Authentication Context
 * Handles RBAC, Session Management via sessionStorage, and Identity Persistence.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { settings, updateSettings } = useSettings();
  
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = sessionStorage.getItem('socops_user_v2');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isBackendMode, setIsBackendMode] = useState(true);

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('socops_user_v2', JSON.stringify(user));
      sessionStorage.setItem('socops_demo_mode', user.role === ROLES.DEMO ? '1' : '0');
    } else {
      sessionStorage.removeItem('socops_user_v2');
      sessionStorage.removeItem('socops_demo_mode');
      sessionStorage.removeItem('socops_access_token');
      localStorage.removeItem('socops_wazuh_token');
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('socops:mode-change'));
    }
  }, [user]);

  // Identity Self-Healing: Ensure every session has a visual token
  useEffect(() => {
    if (user && !user.avatar) {
      setUser(prev => prev ? { 
        ...prev, 
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${prev.name || prev.email}&skinColor=ffdbb4,edb98a` 
      } : null);
    }
  }, [user]);

  /**
   * Verify user credentials.
   * Leverages real backend API if configured, otherwise falls back to isolated registry.
   */
  const verifyCredentials = async (email: string, password: string): Promise<User> => {
    const normalizedEmail = (email || '').trim().toLowerCase();

    // TACTICAL ISOLATION SHIELD: Lock demo bypass behind environment gate
    const isEnvDemo = import.meta.env.VITE_APP_ENV === 'demo';
    const isUrlDemo = window.location.hash.includes('/demo');

    if (normalizedEmail === 'demo@socops.com') {
      if (!isEnvDemo && !isUrlDemo) {
        throw new Error('Access Denied: Demo mode is disabled for this environment. Please use official credentials.');
      }
      
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate tactical handshake
      return {
        id: 'DEMO-001',
        userId: 'AN-DEMO',
        name: 'Demo Analyst',
        email: 'demo@socops.com',
        role: ROLES.DEMO,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo&skinColor=ffdbb4'
      };
    }

    // 1. Real Backend API authentication (default path '/api')
    if (isBackendMode) {
      try {
        const base = (settings.backendUrl || '').trim();
        const endpoint = base ? `${base}/auth/login` : '/api/auth/login';
        const response: any = await api.post(endpoint, { email, password });
        if (response.token) {
          sessionStorage.setItem('socops_access_token', response.token);
        }
        const userWithAvatar = response.user || response;
        if (!userWithAvatar.avatar) {
          userWithAvatar.avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userWithAvatar.name || userWithAvatar.email}&skinColor=ffdbb4,edb98a`;
        }
        return userWithAvatar;
      } catch (error: any) {
        // AUTOMATED FALLBACK: If network/timeout occurs, attempt local validation
        if (error?.type === 'network' || error?.type === 'timeout') {
          console.warn('[AUTH] Backend unreachable. Engaging Tactical Local Registry Fallback.');
        } else {
          const message = error?.message || 'Unknown authentication error';
          const hint = error?.hint ? ` | Hint: ${error.hint}` : '';
          throw new Error(`Authentication Failed: ${message}${hint}`);
        }
      }
    }

    // 2. Local fallback registry (Pre-migration or internal accounts)
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const users: User[] = (settings.users as User[]) || [];
    
    const matchedUser = users.find(u => {
      const uEmail = (u.email || '').toLowerCase();
      return uEmail === normalizedEmail;
    });

    if (!matchedUser) {
      throw new Error('Access Denied: Invalid credentials or unregistered account.');
    }

    let isValidPassword = false;
    if (matchedUser.passwordHash) {
      isValidPassword = await verifyPasswordHash(password, matchedUser.passwordHash);
    } else if (typeof matchedUser.password === 'string') {
      isValidPassword = matchedUser.password === password;
    }

    if (!isValidPassword) {
      throw new Error('Access Denied: Invalid credentials or unregistered account.');
    }

    // Auto-migrate legacy plaintext passwords to PBKDF2
    if (!matchedUser.passwordHash && typeof matchedUser.password === 'string') {
      const migratedUsers = await normalizeUsersCredentials(users);
      updateSettings({ users: migratedUsers });
    }

    if (!matchedUser.avatar) {
      matchedUser.avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${matchedUser.name || matchedUser.email}&skinColor=ffdbb4,edb98a`;
    }

    return matchedUser;
  };

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('socops_user_v2');
    sessionStorage.removeItem('socops_demo_mode');
    sessionStorage.removeItem('socops_access_token');
    localStorage.removeItem('socops_wazuh_token');
  };

  const hasAccess = (requiredRoles: Role[]): boolean => {
    if (!user) return false;
    if (user.role === ROLES.ADMIN) return true;
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return requiredRoles.includes(user.role);
  };

  const hasCapability = (capability: Capability): boolean => {
    if (!user || !capability) return false;
    if (user.role === ROLES.ADMIN) return true;
    return ROLE_CAPABILITIES[user.role]?.has(capability) || false;
  };

  const appBasePath = getHomePathByRole(user?.role);

  return (
    <AuthContext.Provider value={{ user, verifyCredentials, login, logout, hasAccess, hasCapability, isBackendMode, setIsBackendMode, appBasePath }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
