import React from 'react';
import { 
  UserCircle, UserPlus, Shield, Trash2, Lock, 
  User, Briefcase, Edit2, Target, Cpu, Award
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import SensitiveText from '../common/SensitiveText';
import LivePresencePanel from './LivePresencePanel';
import InfoTooltip from '../common/InfoTooltip';
import { SOCSettings, User as SOCUser } from '../../context/SettingsContext';

/**
 * SettingsUsers — Identity Governance Interface
 * Upgraded orchestration module for persona provisioning, 
 * capability matrix enforcement, and real-time session monitoring.
 */

interface SettingsUsersProps {
  localSettings: SOCSettings;
  isReadOnly: boolean;
  showAddUser: boolean;
  setShowAddUser: (show: boolean) => void;
  newUser: Partial<SOCUser>;
  setNewUser: (user: any) => void;
  editingUser: SOCUser | null;
  setEditingUser: (user: SOCUser | null) => void;
  handleAddUser: (e: React.FormEvent) => void;
  handleDeleteUser: (id: string) => void;
  handleEditUser: (user: SOCUser) => void;
  handleRestricted: () => void;
}

export default function SettingsUsers({ 
  localSettings, 
  isReadOnly, 
  showAddUser, 
  setShowAddUser, 
  newUser, 
  setNewUser, 
  editingUser,
  setEditingUser,
  handleAddUser, 
  handleDeleteUser, 
  handleEditUser,
  handleRestricted 
}: SettingsUsersProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Real-time session monitoring layer */}
      <LivePresencePanel />

      <div className="premium-capsule p-8">
        <div className="flex items-center justify-between mb-10 relative z-10 border-b border-border-primary/20 pb-6 font-bold">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
            <UserCircle size={24} strokeWidth={2.5} />
          </div>
          <div>
          <h2 className="text-xl font-black text-foreground-primary uppercase tracking-[0.2em] flex items-center gap-2">
            {(t('settings.groupUserMain') as string) || 'USER MANAGEMENT'}
            <InfoTooltip text={(t('settings.tooltips.ttUserMgmt') as string)} />
          </h2>
          <p className="text-[10px] font-black text-foreground-tertiary uppercase tracking-widest opacity-60 mt-1">{(t('settings.groupUserDesc') as string) || 'Control system access and assign personas'}</p>
          </div>
        </div>
        <button 
          onClick={() => {
            if (isReadOnly) {
              handleRestricted();
            } else {
              setEditingUser(null);
              setNewUser({ name: '', email: '', password: '', role: 'l1_analyst', skills: [], experience: 0 });
              setShowAddUser(true);
            }
          }}
          className="premium-button !py-3 !px-6 !text-[10px] !bg-accent-cyan/10 !text-accent-cyan !border-accent-cyan/30 hover:!bg-accent-cyan/20 font-black tracking-widest"
        >
          <UserPlus size={16} strokeWidth={2.5} className="mr-2" /> {(t('settings.btnProvision') as string) || 'NEW PERSONA'}
        </button>
      </div>

      <div className="space-y-8 relative z-10 font-bold">
        {showAddUser && (
          <form 
            onSubmit={handleAddUser} 
            className="premium-card p-10 bg-bg-panel/20 border-accent-cyan/20 shadow-xl space-y-8 animate-in slide-in-from-top-4"
          >
            <div className="flex items-center gap-4 mb-2">
              <div className="p-2 rounded-xl bg-accent-cyan/10 text-accent-cyan">
                {editingUser ? <Edit2 size={16} /> : <UserPlus size={16} />}
              </div>
              <h3 className="text-sm font-black text-foreground-primary uppercase tracking-[0.2em]">
                {editingUser ? ((t('settings.editUserTitle') as string) || 'MODIFY IDENTITY') : ((t('settings.addUserTitle') as string) || 'PROVISION NEW PERSONA')}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="command-label pl-4">
                    <User size={12} className="inline-block mr-1" /> {(t('settings.provisionForm.name') as string)}
                  </label>
                  <InfoTooltip text={(t('settings.tooltips.provisionName') as string)} />
                </div>
                <input 
                  value={newUser.name} 
                  onChange={e => setNewUser({...newUser, name: e.target.value.toUpperCase()})} 
                  className="glass-input w-full font-black uppercase tracking-widest" 
                  required 
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="command-label pl-4">
                    <User size={12} className="text-accent-cyan inline-block mr-1" /> {(t('settings.provisionForm.email') as string)}
                  </label>
                  <InfoTooltip text={(t('settings.tooltips.provisionEmail') as string)} />
                </div>
                <input 
                  type="text" 
                  value={newUser.email} 
                  onChange={e => setNewUser({...newUser, email: e.target.value.toLowerCase()})} 
                  className="glass-input w-full font-bold lowercase tracking-widest" 
                  required 
                  placeholder="USERNAME"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="command-label pl-4">
                    <Lock size={12} className="inline-block mr-1" /> {(t('settings.provisionForm.password') as string)}
                  </label>
                  <InfoTooltip text={(t('settings.tooltips.provisionPass') as string)} />
                </div>
                <input 
                  type="password" 
                  value={newUser.password || ''} 
                  onChange={e => setNewUser({...newUser, password: e.target.value})} 
                  className="glass-input w-full font-black" 
                  required={!editingUser}
                  placeholder={editingUser ? ((t('settings.provisionForm.passwordPlaceholder') as string) || 'LEAVE EMPTY TO PERSIST') : '••••••••'}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="command-label pl-4">
                    <Briefcase size={12} className="inline-block mr-1" /> {(t('settings.provisionForm.role') as string)}
                  </label>
                  <InfoTooltip text={(t('settings.tooltips.provisionRole') as string)} />
                </div>
                <select 
                  value={newUser.role} 
                  onChange={e => setNewUser({...newUser, role: e.target.value})} 
                  className="glass-input w-full !appearance-none cursor-pointer font-black tracking-widest uppercase"
                >
                   <option value="admin" className="bg-bg-card text-foreground-primary">{(t('settings.roles.admin') as string) || 'ADMINISTRATOR'}</option>
                   <option value="manager" className="bg-bg-card text-foreground-primary">{(t('settings.roles.manager') as string) || 'SECURITY MANAGER'}</option>
                   <option value="l1_analyst" className="bg-bg-card text-foreground-primary">{(t('settings.roles.l1_analyst') as string) || 'L1 ANALYST'}</option>
                   <option value="l2_analyst" className="bg-bg-card text-foreground-primary">{(t('settings.roles.l2_analyst') as string) || 'L2 ANALYST'}</option>
                   <option value="auditor" className="bg-bg-card text-foreground-primary">{(t('settings.roles.auditor') as string) || 'AUDITOR'}</option>
                   <option value="demo" className="bg-bg-card text-foreground-primary">{(t('settings.roles.demo') as string) || 'DEMO'}</option>
                </select>
              </div>

              {/* NEW FIELDS v6.0.0 (Localized) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="command-label pl-4">
                    <Target size={12} className="text-accent-purple inline-block mr-1" /> {(t('settings.provisionForm.skills') as string)}
                  </label>
                  <InfoTooltip text={(t('settings.tooltips.provisionSkills') as string)} />
                </div>
                <input 
                  value={Array.isArray(newUser.skills) ? newUser.skills.join(', ') : newUser.skills} 
                  onChange={e => setNewUser({...newUser, skills: e.target.value.split(',').map(s => s.trim())})} 
                  className="glass-input w-full font-black uppercase tracking-widest" 
                  placeholder="e.g. IR, FORENSICS, NETWORK"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="command-label pl-4">
                    <Cpu size={12} className="text-accent-amber inline-block mr-1" /> {(t('settings.provisionForm.experience') as string)}
                  </label>
                  <InfoTooltip text={(t('settings.tooltips.provisionExp') as string)} />
                </div>
                <input 
                  type="number"
                  min="0"
                  max="50"
                  value={newUser.experience || 0} 
                  onChange={e => setNewUser({...newUser, experience: parseInt(e.target.value) || 0})} 
                  className="glass-input w-full font-black" 
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-4 pt-6 border-t border-border-primary/20">
              <button 
                type="button" 
                onClick={() => setShowAddUser(false)} 
                className="text-[10px] font-black text-foreground-tertiary hover:text-foreground-primary uppercase tracking-[0.2em] transition-colors"
              >
                {(t('settings.provisionForm.cancel') as string) || 'ABORT'}
              </button>
              <button 
                type="submit" 
                className="premium-button !px-10 !py-3 !bg-accent-cyan !text-foreground-inverse !border-none font-black tracking-widest uppercase"
              >
                {editingUser ? ((t('settings.provisionForm.update') as string) || 'UPDATE PERSONA') : ((t('settings.provisionForm.finalize') as string) || 'FINALIZE PROVISIONING')}
              </button>
            </div>
          </form>
        )}

        <div className="table-scroll overflow-x-auto custom-scrollbar rounded-2xl border border-border-primary/20 bg-bg-panel/40 relative">
          <div className="min-w-[800px] relative">
            {/* Header */}
            <div 
              className="grid sticky top-0 z-50 bg-bg-panel border-y-2 border-border-primary text-foreground-tertiary font-black uppercase text-[10px] tracking-widest text-left"
              style={{ gridTemplateColumns: 'minmax(240px, 1fr) 200px 1fr 150px' }}
            >
              <div className="px-6 py-5 border-r border-border-primary/20">{(t('settings.userTable.identity') as string)}</div>
              <div className="px-6 py-5 border-r border-border-primary/20">{(t('settings.userTable.persona') as string)}</div>
              <div className="px-6 py-5 border-r border-border-primary/20">{(t('settings.userTable.capabilityMatrix') as string)}</div>
              <div className="px-6 py-5 text-right">{(t('common.action') as string)}</div>
            </div>

            {/* Body */}
            <div className="relative min-h-[400px]">
               {/* Continuous Column Borders Overlay */}
               <div className="absolute inset-0 pointer-events-none z-0">
                 <div className="grid h-full" style={{ gridTemplateColumns: 'minmax(240px, 1fr) 200px 1fr 150px' }}>
                   <div className="border-r border-border-primary/20 h-full" />
                   <div className="border-r border-border-primary/20 h-full" />
                   <div className="border-r border-border-primary/20 h-full" />
                   <div className="h-full" />
                 </div>
               </div>

               <div className="relative z-10 divide-y divide-border-primary/5">
                {localSettings.users.map(u => (
                  <div 
                    key={u.id} 
                    className="grid group transition-all items-center bg-bg-card/90 backdrop-blur-[2px] hover:bg-bg-hover/40 border-b border-border-secondary"
                    style={{ gridTemplateColumns: 'minmax(240px, 1fr) 200px 1fr 150px' }}
                  >
                    <div className="px-6 py-5">
                       <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl ${u.role === 'admin' ? 'bg-gradient-to-br from-accent-cyan via-accent-indigo to-accent-purple shadow-lg shadow-accent-cyan/20' : 'bg-bg-panel/40 border border-border-primary/20'} flex items-center justify-center text-sm font-black text-foreground-primary transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                             {u.name.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                               <span className="text-foreground-primary group-hover:text-accent-cyan transition-colors text-sm"><SensitiveText value={u.name} /></span>
                               {u.isDefault && <Shield size={12} className="text-accent-cyan animate-pulse" />}
                            </div>
                            <span className="text-[9px] text-foreground-tertiary opacity-60 tracking-widest lowercase font-mono mt-0.5"><SensitiveText value={u.email} /></span>
                          </div>
                       </div>
                    </div>
                    <div className="px-6 py-5 flex flex-col items-center justify-center gap-1 text-center font-black uppercase tracking-tighter">
                        <span className={`px-3 py-1.5 rounded-xl border border-border-primary/20 font-black tracking-widest text-[8px] w-fit 
                          ${u.role === 'admin' ? 'bg-accent-cyan/10 text-accent-cyan' : 
                            u.role === 'manager' ? 'bg-accent-amber/10 text-accent-amber' :
                            u.role === 'auditor' ? 'bg-status-success-bg/10 text-status-success-text' :
                            u.role === 'demo' ? 'bg-accent-rose/10 text-accent-rose' :
                            'bg-accent-purple/10 text-accent-purple'}`}
                        >
                          {(t(`settings.roles.${u.role}`) as string) || u.role.toUpperCase()}
                        </span>
                        {u.experience > 0 && (
                          <span className="text-[8px] font-bold text-foreground-tertiary opacity-60 uppercase">
                            {t('settings.userTable.experienceYears', { count: u.experience })}
                          </span>
                        )}
                    </div>
                    <div className="px-6 py-5 font-black uppercase tracking-tighter">
                        <div className="flex flex-wrap gap-2 group-hover:gap-3 transition-all">
                          {Array.isArray(u.skills) && u.skills.length > 0 ? (
                            u.skills.map((skill, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded-md bg-accent-purple/5 border border-accent-purple/10 text-accent-purple text-[8px] font-black tracking-widest hover:bg-accent-purple/20 transition-colors">
                                {skill}
                              </span>
                            ))
                          ) : (
                            <div className="flex items-center gap-2 text-foreground-tertiary opacity-40">
                               <Award size={12} />
                               <span>{(t('settings.userTable.noSkills') as string) || 'NO CAPABILITY TAGS'}</span>
                            </div>
                          )}
                        </div>
                    </div>
                    <div className="px-6 py-5 text-right font-black uppercase tracking-tighter">
                       <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => handleEditUser(u)} 
                            className="p-2.5 rounded-xl bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30 hover:bg-accent-cyan/20 hover:scale-110 active:scale-95 transition-all shadow-sm"
                            title={(t('settings.users.tooltipEdit') as string)}
                          >
                             <Edit2 size={16} strokeWidth={2.5} />
                          </button>
                          {!u.isDefault ? (
                            <button 
                             onClick={() => handleDeleteUser(u.id)} 
                             className="p-2.5 rounded-xl bg-status-danger-bg/20 text-status-danger-text border border-status-danger-border/30 hover:bg-status-danger-bg/40 hover:scale-110 active:scale-95 transition-all shadow-sm"
                             title={(t('settings.users.tooltipDelete') as string)}
                            >
                               <Trash2 size={16} strokeWidth={2.5} />
                            </button>
                          ) : (
                            <div className="p-2.5 text-foreground-tertiary opacity-40 hover:opacity transition-opacity duration-300" title={(t('settings.users.tooltipProtected') as string)}>
                               <Shield size={16} strokeWidth={2.5} className="text-accent-cyan/40" />
                            </div>
                          )}
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
