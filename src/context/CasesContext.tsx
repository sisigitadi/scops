import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useOperations } from './OperationsContext';
import { goldCases } from '../data/goldDataset';
import { generateCases } from '../utils/proceduralGenerator';

/**
 * CasesContext — Forensic Case Management Hub
 * Synchronizes investigative cases with the persistent BFF database.
 */

export interface Case {
  id: string;
  title: string;
  timestamp: string;
  updatedAt: string;
  ruleId?: string;
  ruleDescription: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'open' | 'investigating' | 'closed' | 'escalated' | 'false_positive';
  category?: string;
  initialAssessment?: string;
  evidence?: string;
  actionTaken?: string;
  recommendation?: string;
  notes?: string;
  analystId?: string;
  analyst?: {
    name: string;
    role: string;
  };
  history?: string; // JSON string from DB
  metadata?: string; // JSON string from DB
}

interface CasesContextType {
  cases: Case[];
  loading: boolean;
  fetchCases: () => Promise<void>;
  createCase: (caseData: Partial<Case>) => Promise<Case | null>;
  updateCase: (id: string, updates: Partial<Case>) => Promise<Case | null>;
  deleteCase: (id: string) => Promise<void>;
}

const CasesContext = createContext<CasesContextType | undefined>(undefined);

export function CasesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);
  const { trackActivity } = useOperations();

  const isDemo = user?.role === 'demo';



  const fetchCases = useCallback(async () => {
    if (isDemo) {
      const saved = sessionStorage.getItem('socops_demo_cases');
      if (saved) {
        setCases(JSON.parse(saved));
      } else {
        // High-Density Seed: Gold Records + 48 Procedural Cases
        const seed = [...goldCases, ...generateCases(48)];
        setCases(seed); 
        sessionStorage.setItem('socops_demo_cases', JSON.stringify(seed));
      }
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/cases');
      if (res.ok) {
        const data = await res.json();
        setCases(data);
      }
    } catch (err) {
      console.error('Fetch Cases Error:', err);
    } finally {
      setLoading(false);
    }
  }, [isDemo]);

  useEffect(() => {
    if (user) {
      fetchCases();
    }
  }, [user, fetchCases]);

  const createCase = async (caseData: Partial<Case>): Promise<Case | null> => {
    if (isDemo) {
      const newCase = {
        ...caseData,
        id: caseData.id || `CS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        timestamp: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        analystId: user?.id,
        analyst: { name: user?.name || 'Demo Analyst', role: 'demo' }
      } as Case;
      
      setCases(prev => {
        const next = [newCase, ...prev];
        sessionStorage.setItem('socops_demo_cases', JSON.stringify(next));
        return next;
      });

      trackActivity('CASE_CREATE', `Incident case created: ${newCase.id}. Severity: ${newCase.severity}`, 'SUCCESS', { 
        category: 'SECURITY',
        metadata: { caseId: newCase.id }
      });

      showToast('New case initialized in session-local store.');
      return newCase;
    }

    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...caseData, analystId: user?.id })
      });

      if (res.ok) {
        const newCase = await res.json();
        setCases(prev => [newCase, ...prev]);
        showToast('New case initialized in persistent database.');
        
        trackActivity('CASE_CREATE', `Incident case created: ${caseData.id}. Severity: ${caseData.severity}`, 'SUCCESS', { 
          category: 'SECURITY',
          metadata: { caseId: caseData.id }
        });
        
        return newCase;
      }
    } catch (err) {
      showToast('Failed to create case.', 'error');
    }
    return null;
  };

  const updateCase = async (id: string, updates: Partial<Case>): Promise<Case | null> => {
    if (isDemo) {
      let updated: Case | null = null;
      setCases(prev => {
        const next = prev.map(c => {
          if (c.id === id) {
            updated = { ...c, ...updates, updatedAt: new Date().toISOString() };
            return updated;
          }
          return c;
        });
        sessionStorage.setItem('socops_demo_cases', JSON.stringify(next));
        return next;
      });

      if (updated) {
        trackActivity('CASE_UPDATE', `Incident case updated: ${id}. Status: ${updates.status || 'NO_CHANGE'}`, 'SUCCESS', { 
          category: 'SECURITY',
          metadata: { caseId: id, updates }
        });
      }
      return updated;
    }

    try {
      const res = await fetch(`/api/cases/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updated = await res.json();
        setCases(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
        
        trackActivity('CASE_UPDATE', `Incident case updated: ${id}. Status: ${updates.status || 'NO_CHANGE'}`, 'SUCCESS', { 
          category: 'SECURITY',
          metadata: { caseId: id, updates }
        });
        
        return updated;
      }
    } catch (err) {
      showToast('Failed to update case.', 'error');
    }
    return null;
  };

  const deleteCase = async (id: string): Promise<void> => {
    if (isDemo) {
      setCases(prev => {
        const next = prev.filter(c => c.id !== id);
        sessionStorage.setItem('socops_demo_cases', JSON.stringify(next));
        return next;
      });
      showToast('Case purged from session-local store.');
      trackActivity('CASE_DELETE', `Incident case deleted: ${id}`, 'SUCCESS', { 
        category: 'SECURITY',
        metadata: { caseId: id }
      });
      return;
    }

    try {
      const res = await fetch(`/api/cases/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCases(prev => prev.filter(c => c.id !== id));
        showToast('Case purged from records.');
        
        trackActivity('CASE_DELETE', `Incident case deleted: ${id}`, 'SUCCESS', { 
          category: 'SECURITY',
          metadata: { caseId: id }
        });
      }
    } catch (err) {
      showToast('Failed to delete case.', 'error');
    }
  };

  const value = {
    cases,
    loading,
    fetchCases,
    createCase,
    updateCase,
    deleteCase
  };

  return <CasesContext.Provider value={value}>{children}</CasesContext.Provider>;
}

export function useCases() {
  const context = useContext(CasesContext);
  if (!context) throw new Error('useCases must be used within CasesProvider');
  return context;
}
