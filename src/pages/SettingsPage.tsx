import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { CAPABILITIES, useAuth, ROLES } from '../context/AuthContext';
import { 
  Save, Settings as SettingsIcon, 
  Check, Activity, Sliders,
  UserCog, BarChart3, Database, Shield
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useOperations } from '../context/OperationsContext';
import { useToast } from '../context/ToastContext';
import { useAlertData } from '../context/AlertDataContext';
import { StaggerGroup, StaggerItem } from '../components/common/StaggerFadeIn';
import InfoTooltip from '../components/common/InfoTooltip';
import api from '../services/api';
import { diffObjects } from '../utils/forensicUtils';

// Sub-components
import SettingsBranding from '../components/settings/SettingsBranding';
import SettingsUsers from '../components/settings/SettingsUsers';
import SettingsIntegrations from '../components/settings/SettingsIntegrations';
import ControlCenterDashboard from '../components/settings/ControlCenterDashboard';
import SettingsInfra from '../components/settings/SettingsInfra';

/**
 * SettingsPage — Platform Governance Hub (ADMIN ONLY)
 * Integrated tactical command center for infrastructure, identity, and branding control.
 */

type SettingsTab = 'OVERVIEW' | 'BRANDING' | 'IDENTITY' | 'SERVICES' | 'INFRA';

export default function SettingsPage() {
  const { settings, updateSettings, updateServiceStatus } = useSettings();
  const { user, hasCapability } = useAuth();
  const { addSystemLog } = useAlertData();
  const { trackActivity } = useOperations();
  const { t } = useLanguage();
  const { showToast } = useToast();
  
  const isDemoUser = user?.role === ROLES.DEMO;
  const isReadOnly = !hasCapability(CAPABILITIES.MANAGE_SETTINGS);
  
  const [activeTab, setActiveTab] = useState<SettingsTab>('OVERVIEW');
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaved, setIsSaved] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'l1_analyst', skills: '', experience: 0 });
  const [editingUser, setEditingUser] = useState<any>(null);

  const [testing, setTesting] = useState({
    wazuh_manager: false,
    wazuh_indexer: false,
    opencti: false,
    telegram: false
  });

  const [showIntegratorGuide, setShowIntegratorGuide] = useState(false);


  const handleRestricted = useCallback(() => {
    if (isReadOnly) showToast(t('common.restrictedNotice'));
  }, [isReadOnly, showToast, t]);

  const handleSave = () => {
    if (isReadOnly) {
      handleRestricted();
      return;
    }
    
    const changes = diffObjects(settings, localSettings);
    updateSettings(localSettings);
    trackActivity('CONFIG_GLOBAL_UPDATE', `Global platform configuration updated. Section: Governance Hub`, 'SUCCESS', { 
      category: 'CONFIGURATION',
      changes
    });
    
    addSystemLog({
      action: 'Platform Configuration Update',
      details: `Critical settings updated by ${user?.name || 'Administrator'}. Section: Governance Hub`
    });
    setIsSaved(true);
    showToast(t('settings.messages.saved'));
    setTimeout(() => setIsSaved(false), 3000);
  };

  const setServiceStatus = (id: string, status: string) => {
    if (id === 'wazuh_manager') {
      setLocalSettings(prev => ({ ...prev, wazuh: { ...prev.wazuh, manager: { ...prev.wazuh.manager, status } } }));
    } else if (id === 'wazuh_indexer') {
      setLocalSettings(prev => ({ ...prev, wazuh: { ...prev.wazuh, indexer: { ...prev.wazuh.indexer, status } } }));
    } else if (id === 'opencti') {
      setLocalSettings(prev => ({ ...prev, opencti: { ...prev.opencti, status } }));
    } else if (id === 'telegram') {
      setLocalSettings(prev => ({ ...prev, channels: { ...prev.channels, telegram: { ...prev.channels.telegram, status } } }));
    }
    updateServiceStatus(id as any, status as any);
  };

  const testConnection = useCallback(async (id: string, options: any = {}) => {
    const { silent = false } = options;
    if (isReadOnly) {
      if (!silent) handleRestricted();
      return;
    }

    let config = (localSettings as any)[id];
    if (id === 'telegram') config = localSettings.channels.telegram;
    if (id === 'wazuh_manager') config = localSettings.wazuh.manager;
    if (id === 'wazuh_indexer') config = localSettings.wazuh.indexer;

    if (!silent) setTesting(prev => ({ ...prev, [id]: true }));
    const label = id.replace('_', ' ').toUpperCase();

    try {
      if (id === 'wazuh_manager') {
        const response = await api.post('/api/test/wazuh-manager', { config });
        if (!response?.ok) throw new Error('Wazuh manager authentication failed');
        setServiceStatus('wazuh_manager', 'connected');
        if (!silent) showToast(t('settings.messages.wazuhManagerSuccess'), 'success');
      } else if (id === 'wazuh_indexer') {
        const response = await api.post('/api/test/wazuh-indexer', { config });
        if (!response?.ok) throw new Error('Wazuh indexer authentication failed');
        setServiceStatus('wazuh_indexer', 'connected');
        if (!silent) showToast(t('settings.messages.wazuhIndexerSuccess'), 'success');
      } else if (id === 'opencti') {
        const response = await api.post('/api/test/opencti', { config });
        if (!response?.ok) throw new Error('OpenCTI connectivity check failed');
        setServiceStatus('opencti', 'connected');
        if (!silent) showToast(t('settings.messages.openctiSuccess'), 'success');
      } else if (id === 'telegram') {
        const response = await api.post('/api/test/telegram', { config });
        if (!response?.ok) throw new Error(t('settings.messages.invalidBotToken'));
        setServiceStatus('telegram', 'connected');
        if (!silent) showToast(`${t('settings.messages.botConnected')}${response.username || ''}`, 'success');
      } else if (id === 'database') {
        const response = await api.post('/api/test/database', { config });
        if (!response?.ok) throw new Error('Database cluster handshake failed');
        setServiceStatus('database', 'connected');
        if (!silent) showToast('Database: ✅ Connected — Cluster Nominals Verified', 'success');
      }
    } catch (error: any) {
      setServiceStatus(id, 'error');
      if (silent) return;
      showToast(`${label}: ${error.message || 'Unknown error'}`, 'error', 5000);
    } finally {
      if (!silent) setTesting(prev => ({ ...prev, [id]: false }));
    }
  }, [handleRestricted, isReadOnly, localSettings, showToast, t, updateServiceStatus]);

  const handleDeleteUser = async (id: string) => {
    if (isReadOnly) {
      handleRestricted();
      return;
    }
    const target = localSettings.users.find(u => u.id === id);
    if (target?.isDefault) {
      showToast(t('settings.messages.errorDefaultUser'));
      return;
    }

    try {
      await api.delete(`/api/users/${id}`);
      const updatedUsers = localSettings.users.filter(u => u.id !== id);
      setLocalSettings({ ...localSettings, users: updatedUsers });
      trackActivity('CONFIG_USER_DELETE', `User removed: ${target?.name} (${target?.email})`, 'SUCCESS', { 
        category: 'USER_MANAGEMENT',
        changes: { before: target, after: null }
      });
      showToast(t('settings.messages.userRemoved'));
    } catch (error: any) {
      showToast(error?.message || t('common.deleteUserFailed'), 'error');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) {
      handleRestricted();
      return;
    }

    const username = newUser.email.trim().toLowerCase();
    const isDuplicate = localSettings.users.some(u => 
      (u.email || '').toLowerCase() === username && (!editingUser || u.id !== editingUser.id)
    );

    if (isDuplicate) {
      showToast(t('settings.messages.userExists'), 'error');
      return;
    }

    const skills = typeof newUser.skills === 'string' ? newUser.skills.split(',').map(s => s.trim().toUpperCase()).filter(Boolean) : newUser.skills;
    const experience = parseInt(newUser.experience as any) || 0;

    try {
      if (editingUser) {
        const payload: any = {
          name: newUser.name,
          email: username,
          role: newUser.role,
          skills,
          experience
        };
        if (newUser.password) payload.password = newUser.password;

        const updatedFromDb: any = await api.patch(`/api/users/${editingUser.id}`, payload);
        const updatedUsers = localSettings.users.map(u => 
          u.id === editingUser.id
            ? { ...u, ...updatedFromDb, skills, experience }
            : u
        );
        setLocalSettings({ ...localSettings, users: updatedUsers });

        const changes = diffObjects(editingUser, { ...editingUser, ...updatedFromDb, skills, experience });
        trackActivity('CONFIG_USER_UPDATE', `User identity updated: ${newUser.name} (${username})`, 'SUCCESS', {
          category: 'USER_MANAGEMENT',
          changes
        });

        showToast(`${t('settings.messages.userUpdated')} (${newUser.name})`);
      } else {
        if (!newUser.password) {
          showToast(t('common.passwordRequired'), 'error');
          return;
        }

        const createdFromDb: any = await api.post('/api/users', {
          name: newUser.name,
          email: username,
          role: newUser.role,
          password: newUser.password,
          skills,
          experience
        });

        const createdUser: any = {
          ...createdFromDb,
          status: 'Active',
          skills,
          experience
        };
        const updatedUsers = [...localSettings.users, createdUser];
        setLocalSettings({ ...localSettings, users: updatedUsers });

        trackActivity('CONFIG_USER_ADD', `New user provisioned: ${newUser.name} (${username}) as ${newUser.role}`, 'SUCCESS', {
          category: 'USER_MANAGEMENT',
          changes: { before: null, after: createdUser }
        });

        showToast(`${t('settings.messages.userProvisioned')} (${newUser.name})`);
      }

      setNewUser({ name: '', email: '', password: '', role: 'l1_analyst', skills: '', experience: 0 });
      setEditingUser(null);
      setShowAddUser(false);
    } catch (error: any) {
      showToast(error?.message || t('common.saveUserFailed'), 'error');
    }
  };

  const handleEditUser = (u: any) => {
    if (isReadOnly) {
      handleRestricted();
      return;
    }
    setEditingUser(u);
    setNewUser({ 
      name: u.name, 
      email: u.email, 
      password: '', 
      role: u.role,
      skills: Array.isArray(u.skills) ? u.skills.join(', ') : (u.skills || ''),
      experience: u.experience || 0
    });
    setShowAddUser(true);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) {
      handleRestricted();
      return;
    }
    const file = e.target.files?.[0];
    if (file && file.size <= 2 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalSettings({ ...localSettings, appLogo: reader.result as string });
      };
      reader.readAsDataURL(file);
    } else {
      showToast(t('settings.messages.logoSizeError'), 'error');
    }
  };

  const resetLogo = () => {
    if (isReadOnly) {
      handleRestricted();
      return;
    }
    setLocalSettings({ ...localSettings, appLogo: null });
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(localSettings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `socops_config_backup_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    trackActivity('CONFIG_BACKUP_EXPORT', `Platform configuration exported to JSON`, 'SUCCESS', { category: 'SYSTEM_MAINTENANCE' });
    showToast(t('settings.dashboard.exportSuccess'));
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event: any) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (!imported.users || !imported.wazuh) throw new Error('Invalid schema');
        
        setLocalSettings(imported);
        trackActivity('CONFIG_BACKUP_IMPORT', `Platform configuration restored from backup`, 'SUCCESS', { category: 'SYSTEM_MAINTENANCE' });
        showToast(t('settings.dashboard.importSuccess'), 'success');
      } catch (err) {
        showToast(t('settings.dashboard.importError'), 'error');
      }
    };
    reader.readAsText(file);
  };

  const mainTabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'OVERVIEW', label: t('settings.anchors.overview'), icon: <BarChart3 size={14} /> },
    { id: 'BRANDING', label: t('settings.anchors.branding'), icon: <Sliders size={14} /> },
    { id: 'IDENTITY', label: t('settings.anchors.identity'), icon: <UserCog size={14} /> },
    { id: 'SERVICES', label: t('settings.anchors.integrations'), icon: <Activity size={14} /> },
    { id: 'INFRA', label: t('settings.anchors.infrastructure'), icon: <Database size={14} /> }
  ];

  return (
    <div className="relative flex flex-col min-h-screen pb-10">
      <StaggerGroup delay={0.1} stagger={0.08}>
        {/* Header Section — Operational Management Style */}
        <StaggerItem>
          <header className="premium-capsule p-8 sm:p-10 mb-8 relative animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
              <div className="flex items-center gap-6">
                <div className="p-4 rounded-3xl bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan floating">
                  <SettingsIcon size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-4xl font-bold text-foreground-primary capitalize tracking-tight leading-none leading-none">
                      {t('settings.title')}
                    </h1>
                    <InfoTooltip text={t('settings.subtitle')} />
                  </div>
                  <p className="mt-3 text-xs sm:text-sm font-bold text-foreground-tertiary uppercase tracking-widest opacity-70">
                    {t('settings.readOnlyNotice') && isReadOnly ? `[${t('settings.readOnlyNotice')}]` : user?.name.toUpperCase()} • {user?.role.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Save button removed from header - using floating action hub */}
              </div>
            </div>
          </header>
        </StaggerItem>

         <StaggerItem>
            <div className="flex flex-nowrap overflow-visible p-1 bg-bg-panel/40 border border-border-primary/20 rounded-[2rem] gap-1 mb-10 relative z-20 w-full">
              {mainTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-1 items-center justify-center gap-0.5 px-1 py-3 rounded-[1.5rem] text-[11px] font-black tracking-tighter transition-all whitespace-nowrap min-w-0 overflow-visible ${activeTab === tab.id ? 'bg-accent-cyan text-foreground-inverse shadow-xl shadow-accent-cyan/20' : 'text-foreground-tertiary hover:text-foreground-primary hover:bg-white/5'}`}
                >
                   <span className="shrink-0 scale-75 lg:scale-100">{tab.icon}</span>
                   <span className="truncate">{tab.label}</span>
                   <div className="scale-90 opacity-70 hover:opacity-100 transition-opacity ml-1 shrink-0">
                     <InfoTooltip 
                       vAlign="top" 
                       align={tab.id === 'INFRA' || tab.id === 'SERVICES' ? 'right' : 'center'}
                       text={
                        tab.id === 'OVERVIEW' ? t('settings.tooltips.tabOverview') :
                        tab.id === 'BRANDING' ? t('settings.tooltips.tabBranding') :
                        tab.id === 'IDENTITY' ? t('settings.tooltips.tabIdentity') :
                        tab.id === 'SERVICES' ? t('settings.tooltips.tabIntegrations') :
                        tab.id === 'INFRA' ? t('settings.tooltips.tabInfra') : ''
                      } />
                   </div>
                </button>
              ))}
           </div>
        </StaggerItem>

        <AnimatePresence mode="wait">
           <motion.div
             key={activeTab}
             initial={{ opacity: 0, y: 15 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -15 }}
             transition={{ duration: 0.3 }}
           >
              {activeTab === 'OVERVIEW' && (
                <ControlCenterDashboard 
                  localSettings={localSettings}
                  handleExport={handleExport}
                  handleImport={handleImport}
                  isReadOnly={isReadOnly}
                />
              )}

              {activeTab === 'BRANDING' && (
                <SettingsBranding 
                  localSettings={localSettings}
                  setLocalSettings={setLocalSettings}
                  isReadOnly={isReadOnly}
                  handleLogoUpload={handleLogoUpload}
                  resetLogo={resetLogo}
                  handleRestricted={handleRestricted}
                />
              )}

              {activeTab === 'IDENTITY' && (
                <SettingsUsers 
                  localSettings={localSettings}
                  setLocalSettings={setLocalSettings}
                  isReadOnly={isReadOnly}
                  showAddUser={showAddUser}
                  setShowAddUser={setShowAddUser}
                  newUser={newUser}
                  setNewUser={setNewUser}
                  editingUser={editingUser}
                  setEditingUser={setEditingUser}
                  handleAddUser={handleAddUser}
                  handleDeleteUser={handleDeleteUser}
                  handleEditUser={handleEditUser}
                  handleRestricted={handleRestricted}
                />
              )}

              {activeTab === 'SERVICES' && (
                <SettingsIntegrations 
                  localSettings={localSettings}
                  setLocalSettings={setLocalSettings}
                  isReadOnly={isReadOnly}
                  isDemoUser={isDemoUser}
                  testing={testing}
                  testConnection={testConnection}
                  showIntegratorGuide={showIntegratorGuide}
                  setShowIntegratorGuide={setShowIntegratorGuide}
                />
              )}

              {activeTab === 'INFRA' && (
                <SettingsInfra 
                  localSettings={localSettings}
                  setLocalSettings={setLocalSettings}
                  isReadOnly={isReadOnly}
                  handleSave={handleSave}
                />
              )}
           </motion.div>
        </AnimatePresence>
      </StaggerGroup>
      {/* STRATEGIC COMMAND HUD (Floating Governance Strip) */}
      <div className="sticky bottom-8 self-center z-[100] w-fit mt-10">
        <div className="premium-capsule !p-2 flex items-center gap-3 bg-background-main/80 backdrop-blur-2xl border-2 border-accent-cyan/30 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-10 duration-1000">
          <div className="flex items-center gap-2 px-4 border-r border-border-primary/20">
            <Shield size={16} className="text-accent-cyan animate-pulse" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isReadOnly}
              className={`flex items-center gap-2.5 px-8 py-3 bg-accent-cyan text-foreground-inverse rounded-xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-accent-cyan/20 ${isReadOnly ? 'opacity-30 grayscale cursor-not-allowed' : ''} ${isSaved ? '!bg-status-success-bg !text-status-success-text' : ''}`}
            >
              {isSaved ? <Check size={16} strokeWidth={3} /> : <Save size={16} strokeWidth={3} />}
              {isSaved ? t('settings.buttons.saved') : t('settings.buttons.saveConfig')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
