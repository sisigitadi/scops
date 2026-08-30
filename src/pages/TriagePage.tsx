import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SearchX, ChevronLeft, ChevronRight, Activity } from 'lucide-react';

import { useAlertData } from '../context/AlertDataContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth, ROLES } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useSocket } from '../context/SocketContext';
import { useOperations } from '../context/OperationsContext';

import TriageHeader from '../components/triage/TriageHeader';
import TriageDetails from '../components/triage/TriageDetails';
import TriageInvestigation from '../components/triage/TriageInvestigation';
import TriageSOP from '../components/triage/TriageSOP';
import TriageCaseTrail from '../components/triage/TriageCaseTrail';
import TriageEscalateModal from '../components/triage/TriageEscalateModal';

/**
 * TriagePage — Tactical Case Investigation Hub
 * Primary workflow engine for analyzing, validating, and escalating forensic alerts.
 * Optimized for Stasis: Isolated from global telemetry noise to prevent flickering/jumping.
 */

const TriagePage = () => {
  const { alerts, updateAlertById, enrichAlert, togglePlaybookStep } = useAlertData();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { settings } = useSettings();
  const { analysts, connected } = useSocket();
  const { trackActivity } = useOperations();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const alertId = searchParams.get('id');

  const [enriching, setEnriching] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [justification, setJustification] = useState('');
  const [escalateError, setEscalateError] = useState('');
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    initialAssessment: '',
    status: 'open',
    notes: ''
  });

  // 1. DATA STASIS SHIELD: Only re-render UI if THE TARGET alert state changes
  // We filter out background alert ingestion noise to stop page-level flicker.
  const uiAlert = useMemo(() => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return null;
    // Deep reference check for stability
    return { ...alert };
  }, [alertId, alerts.find(a => a.id === alertId)?.timestamp, alerts.find(a => a.id === alertId)?.status]);

  const activeQueue = useMemo(() => alerts.filter(a => a.status !== 'closed'), [alerts.length]);
  const currentIndex = useMemo(() => activeQueue.findIndex(a => a.id === alertId), [activeQueue, alertId]);
  
  const nextAlert = activeQueue[currentIndex + 1];
  const prevAlert = activeQueue[currentIndex - 1];

  const goToNext = useCallback(() => {
    if (nextAlert) navigate(`?id=${nextAlert.id}`);
  }, [nextAlert?.id]);

  const goToPrev = useCallback(() => {
    if (prevAlert) navigate(`?id=${prevAlert.id}`);
  }, [prevAlert?.id]);

  useEffect(() => {
    if (uiAlert) {
      setForm({
        initialAssessment: uiAlert.initialAssessment || '',
        status: uiAlert.status || 'open',
        notes: uiAlert.notes || ''
      });
      setMessage('');
    }
  }, [uiAlert?.id]);

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const onSave = async (e: any) => {
    e.preventDefault();
    if (!uiAlert || !user) return;
    
    await updateAlertById(uiAlert.id, {
      ...form,
      lastModifiedBy: user.name
    } as any, user.name);
    
    trackActivity('TRIAGE_UPDATE', `Updated operational metadata for alert: ${uiAlert.id}`);
    setMessage(t('system.saved') || 'Operational Data Committed.');
    
    setTimeout(() => setMessage(''), 3000);
  };

  const onFalsePositive = () => {
    if (!uiAlert || !user) return;
    updateAlertById(uiAlert.id, { status: 'closed', resolution: 'FALSE_POSITIVE' } as any, user.name);
    trackActivity('TRIAGE_FP', `Marked alert ${uiAlert.id} as False Positive.`);
    navigate('/app/alerts');
  };

  const isReadOnly = user?.role === 'viewer';

  const handleRestricted = () => {
    setMessage(t('system.accessDenied') || 'Akses Ditolak: Tingkat Hak Akses Read-Only Aktif.');
    setTimeout(() => setMessage(''), 3000);
  };

  const triggerEnrichment = async () => {
    if (!uiAlert || !user) return;
    setEnriching(true);
    await enrichAlert(uiAlert.id, user.name);
    trackActivity('TRIAGE_INTEL_ENRICH', `Executed Intel Enrichment engine for alert: ${uiAlert.id}`);
    setEnriching(false);
  };

  const handleEscalateConfirm = () => {
    if (!uiAlert || !user) return;
    if (justification.length < 10) {
      setEscalateError(t('system.justificationTooShort') || 'Justifikasi harus minimal 10 karakter.');
      return;
    }
    
    const isPowerful = [ROLES.ADMIN, ROLES.MANAGER, 'l2_analyst'].includes(user.role as any);
    if (!isPowerful) {
      setMessage(t('triage.messages.pendingReview'));
    } else {
      setMessage(t('triage.messages.escalated') || 'Escalation confirmed.');
    }
    
    updateAlertById(uiAlert.id, { 
      status: 'investigating', 
      escalated: true,
      escalateJustification: justification
    } as any, user.name);
    
    trackActivity('TRIAGE_ESCALATE', `Escalated alert ${uiAlert.id} to Management. Justification: ${justification.substring(0, 50)}...`);

    setShowEscalateModal(false);
    setJustification('');
    setEscalateError('');
  };

  const statusOptions = useMemo(() => [
    { value: 'open', label: t('triage.statusOptions.open') || 'OPEN' },
    { value: 'investigating', label: t('triage.statusOptions.investigating') || 'INVESTIGATING' },
    { value: 'closed', label: t('triage.statusOptions.closed') || 'CLOSED' }
  ], [t]);

  const playbookSteps = useMemo(() => {
    const category = uiAlert?.category;
    if (!category) return [];
    
    const getPlaybook = (key: string) => {
      const val = t(key);
      return Array.isArray(val) ? val : [];
    };

    const playbooks: Record<string, string[]> = {
      'Authentication': getPlaybook('triage.playbook.auth'),
      'Malware': getPlaybook('triage.playbook.malware'),
      'Privilege Escalation': getPlaybook('triage.playbook.privilege'),
      'Network Anomaly': getPlaybook('triage.playbook.network')
    };
    return playbooks[category] || getPlaybook('triage.playbook.default');
  }, [uiAlert?.category, t]);

  const handleToggleStep = useCallback((stepLabel: string) => {
    if (uiAlert && user) {
      togglePlaybookStep(uiAlert.id, stepLabel, user.name);
    }
  }, [uiAlert?.id, user?.name, togglePlaybookStep]);

  // Sync Heartbeat Data
  const [lastSyncAt, setLastSyncAt] = useState<string>(new Date().toISOString());
  useEffect(() => {
    if (connected) setLastSyncAt(new Date().toISOString());
  }, [connected, analysts.length]);

  if (!uiAlert) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="w-24 h-24 rounded-[2rem] bg-bg-panel/40 border-2 border-border-primary/20 flex items-center justify-center shadow-2xl">
        <SearchX className="w-10 h-10 text-foreground-tertiary" />
      </div>
      <h2 className="text-2xl font-black text-foreground-primary uppercase tracking-[0.2em]">{t('alerts.noAlertSelected') || 'AWAITING TARGET'}</h2>
      <p className="text-xs text-foreground-tertiary font-black uppercase tracking-widest opacity-60 max-w-md">{t('alerts.noAlertDesc') || 'Navigate to the Alert Register and select an alert to begin triage investigation.'}</p>
    </div>
  );

  return (
    <div className="space-y-8 relative pb-10">
      {showEscalateModal && (
        <TriageEscalateModal 
          justification={justification}
          setJustification={setJustification}
          onConfirm={handleEscalateConfirm}
          onCancel={() => {
            setShowEscalateModal(false);
            setJustification('');
            setEscalateError('');
          }}
          error={escalateError}
        />
      )}

      <TriageHeader 
        settings={settings}
      />

      {/* Strategic Triage HUD (Relocated Navigator) */}
      <div className="flex items-center gap-6 overflow-hidden">
        <div className="premium-capsule !p-2 flex items-center gap-4 bg-bg-panel/40 border border-border-primary/20 backdrop-blur-xl w-full xl:w-fit animate-in slide-in-from-left-4 duration-500">
          <div className="flex flex-col items-start px-6 border-r border-border-primary/20">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground-tertiary mb-1">{t('triage.navigator') || 'NAVIGATOR ANTRIAN'}</p>
            <p className="text-sm font-black text-accent-cyan tracking-[0.2em] leading-none shrink-0">{currentIndex + 1} <span className="opacity-30 mx-1">/</span> {activeQueue.length}</p>
          </div>

          <div className="flex items-center gap-2 pr-2">

            <button
               onClick={goToPrev}
               disabled={!prevAlert}
               className={`premium-button !p-2.5 ${!prevAlert ? 'opacity-20 cursor-not-allowed' : 'hover:!bg-accent-cyan hover:!text-background-main active:scale-95'}`}
               title={t('triage.prevAlert')}
            >
              <ChevronLeft size={20} strokeWidth={3} />
            </button>
            <button
               onClick={goToNext}
               disabled={!nextAlert}
               className={`premium-button !p-2.5 ${!nextAlert ? 'opacity-20 cursor-not-allowed' : 'hover:!bg-accent-cyan hover:!text-background-main active:scale-95'}`}
               title={t('triage.nextAlert')}
            >
              <ChevronRight size={20} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Tactical Pipeline Status */}
        <div className="hidden xl:flex items-center gap-4 px-6 py-4 bg-accent-cyan/[0.03] border border-accent-cyan/10 rounded-2xl animate-in slide-in-from-right-4 duration-700">
          <div className="h-2 w-2 rounded-full bg-accent-cyan animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground-tertiary">
            {(t('common.reliabilityTracking'))}
          </p>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-8">
          <TriageDetails 
            alert={uiAlert}
            baseAlert={uiAlert}
            enriching={enriching}
            triggerEnrichment={triggerEnrichment}
            isReadOnly={isReadOnly}
          />

          <TriageInvestigation 

            analysts={analysts}
            connected={connected}
            isReadOnly={isReadOnly}
            onSave={onSave}
            onFalsePositive={onFalsePositive}
            setShowEscalateModal={setShowEscalateModal}
            handleRestricted={handleRestricted}
            form={form}
            updateField={updateField}
            user={user}
            statusOptions={statusOptions}
            message={message}
            baseAlert={uiAlert}
            alerts={alerts}
            lastSyncAt={lastSyncAt}
          />
        </div>

        <div className="space-y-8">
          <TriageSOP 
            playbookSteps={playbookSteps}
            baseAlert={uiAlert}
            isReadOnly={isReadOnly}
            handleRestricted={handleRestricted}
            togglePlaybookStep={handleToggleStep}
            user={user}
          />

          <TriageCaseTrail baseAlert={uiAlert} />
        </div>
      </div>
    </div>
  );
};

export default TriagePage;
