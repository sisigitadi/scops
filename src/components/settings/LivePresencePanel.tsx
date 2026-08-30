import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Shield, LogOut, Globe, Clock } from 'lucide-react';
import { useSocket, Analyst } from '../../context/SocketContext';
import { useOperations } from '../../context/OperationsContext';
import { useAuth, ROLES } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useMemo } from 'react';
import InfoTooltip from '../common/InfoTooltip';

/**
 * LivePresencePanel — Premium Active Session Monitoring
 * Visualizes real-time connectivity status, operational duty assertions, 
 * and provides administrative capability for session termination.
 */

export default function LivePresencePanel() {
  const { analysts, kickUser, connected, debouncedConnected } = useSocket();
  const { activeTeam, trackActivity } = useOperations();
  const { user: currentUser } = useAuth();
  const { t } = useLanguage();

  const handleKick = (userId: string) => {
    if (window.confirm((t('settings.livePresence.confirmLogout') as string))) {
      const target = analysts.find(a => (a.userId || a.id || a.username) === userId);
      
      kickUser(userId);
      
      if (target) {
        trackActivity(
          'FORCE_DISCONNECT',
          `Administrative session termination for ${target.username} (${target.role || 'ANALYST'}) from ${target.ip || 'INTERNAL'}`,
          'SUCCESS',
          { 
            category: 'SECURITY',
            metadata: { targetId: userId, targetIp: target.ip, page: target.page }
          }
        );
      }
    }
  };

  const isOnDuty = (username: string) => {
    return activeTeam.some(p => p.id === username || p.name === username);
  };

  const analystsSorted = useMemo(() => {
    return [...analysts].sort((a, b) => {
      const isMeA = a.isMe || a.username === currentUser?.email || (currentUser?.name && a.username === currentUser.name);
      const isMeB = b.isMe || b.username === currentUser?.email || (currentUser?.name && b.username === currentUser.name);
      return (isMeA ? -1 : isMeB ? 1 : 0);
    });
  }, [analysts, currentUser]);

  return (
    <div className="premium-capsule p-6 sm:p-8 mb-8 border-t-4 border-accent-indigo/40 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent-indigo/5 blur-[100px] -z-10 rounded-full" />
      
      <div className="flex items-center justify-between mb-8 relative z-10 border-b border-border-primary/20 pb-6 font-bold">
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-xl ${connected ? 'bg-status-success-bg/10 text-status-success-text' : 'bg-status-danger-bg/10 text-status-danger-text'} transition-colors`}>
            <Activity size={20} className={connected ? 'animate-pulse' : ''} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-sm font-black text-foreground-primary uppercase tracking-[0.2em] flex items-center gap-2">
              {(t('settings.livePresence.title') as string)}
              <InfoTooltip text={(t('settings.tooltips.ttActiveSessions') as string)} />
            </h3>
            <div className="h-4 flex items-center">
              <p className="text-[10px] font-black text-foreground-tertiary uppercase tracking-widest opacity-60">
                {(t('settings.livePresence.subtitle') as string)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 relative">
            <div className="flex items-center gap-3">
                <div className="w-[60px] flex justify-end">
                    {!debouncedConnected && (
                      <span className="text-[8px] font-black text-status-danger-text uppercase tracking-tighter">
                        DISCONNECTED
                      </span>
                    )}
                </div>
                <div className="flex items-center gap-2 border-l border-border-primary/10 pl-3">
                  <span className="text-[10px] font-black text-foreground-tertiary uppercase tracking-widest whitespace-nowrap">
                      {analysts.length} {(t('settings.dashboard.active') as string)}
                  </span>
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${debouncedConnected ? 'bg-status-success-text shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-status-danger-text shadow-[0_0_8px_rgba(244,63,94,0.6)]'}`} />
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10 font-bold">
        <AnimatePresence>
          {analysts.length === 0 && (
            <div className="col-span-full py-10 flex flex-col items-center justify-center text-foreground-tertiary opacity-40">
              <Globe size={32} className="mb-4" />
              <span className="text-xs font-black uppercase tracking-widest">{(t('settings.livePresence.empty') as string)}</span>
            </div>
          )}
          
          {analystsSorted.map((analyst, idx) => {
            const isMe = analyst.isMe || analyst.username === currentUser?.email || (currentUser?.name && analyst.username === currentUser.name);
            const onDuty = isOnDuty(analyst.username);
            
            return (
              <motion.div
                key={analyst.userId || analyst.id || analyst.username}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`premium-card !p-5 border-border-primary/10 hover:border-accent-indigo/40 group transition-all font-black ${isMe ? 'bg-accent-indigo/5 ring-1 ring-accent-indigo/20' : 'bg-bg-panel/10'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                    <div className={`w-10 h-10 rounded-xl bg-bg-panel/60 border border-border-primary/40 flex items-center justify-center font-black ${isMe ? 'text-accent-cyan' : 'text-accent-indigo'} overflow-hidden`}>
                      {analyst.avatar ? (
                        <img src={analyst.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        (analyst.username || 'A').charAt(0).toUpperCase()
                      )}
                    </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full indicator-active indicator-glow border-2 border-bg-main shadow-lg" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-black text-foreground-primary uppercase truncate max-w-[100px]">
                          {analyst.username}
                        </div>
                        {isMe && (
                          <span className="px-1.5 py-0.5 rounded bg-accent-indigo/20 text-accent-indigo text-[6px] font-black tracking-tighter uppercase whitespace-nowrap">ME</span>
                        )}
                      </div>
                      <div className="text-[9px] font-black text-foreground-tertiary uppercase tracking-tighter opacity-60">
                        {analyst.page || 'OPERATIONAL GATE'}
                      </div>
                    </div>
                  </div>
                  {currentUser && (currentUser.role === ROLES.ADMIN || currentUser.role === ROLES.MANAGER || currentUser.role === ROLES.DEMO) && !isMe && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleKick(analyst.userId || analyst.id || analyst.username)}
                        className="p-1.5 rounded-lg bg-status-danger-bg/10 text-status-danger-text opacity-0 group-hover:opacity-100 hover:bg-status-danger-bg/30 transition-all cursor-pointer"
                      >
                        <LogOut size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-status-success-bg/10 border border-status-success-border/20 text-status-success-text text-[8px] font-black tracking-widest uppercase">
                    <Activity size={8} /> {(t('settings.livePresence.statusOnline') as string)}
                  </div>
                  {onDuty && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent-indigo/10 border border-accent-indigo/20 text-accent-indigo text-[8px] font-black tracking-widest uppercase group/duty relative">
                      <Shield size={8} /> {(t('settings.livePresence.statusOnDuty') as string)}
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-border-primary/10 flex items-center justify-between text-[8px] font-black text-foreground-tertiary opacity-40 uppercase tracking-widest">
                    <div className="flex items-center gap-1">
                        <Globe size={10} /> {analyst.ip || 'INTERNAL'}
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock size={10} /> ACTIVE
                    </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
