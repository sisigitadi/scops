import React, { createContext, useCallback, useContext, useEffect, useState, useRef, useMemo, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth, ROLES } from './AuthContext';
import { useSettings } from './SettingsContext';
import { useToast } from './ToastContext';
import { useLanguage } from './LanguageContext';

export interface Analyst {
  id: string;
  userId: string;
  username: string;
  page: string;
  ip?: string;
  role?: string;
  isMe?: boolean;
  avatar?: string;
}

interface SocketContextType {
  connected: boolean;
  debouncedConnected: boolean;
  analysts: Analyst[];
  updatePresence: (page: string) => void;
  joinAlertRoom: (alertId: string) => void;
  leaveAlertRoom: (alertId: string) => void;
  disconnectSocket: () => void;
  kickUser: (userId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

/**
 * SocketProvider — Real-time Orchestration & Governance
 * Manages analyst presence, administrative kick signals, and room-based collaboration.
 */
export function SocketProvider({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const { showToast } = useToast();
  const { t } = useLanguage();
  
  const [connected, setConnected] = useState(false);
  const [debouncedConnected, setDebouncedConnected] = useState(false);
  const [analysts, setAnalysts] = useState<Analyst[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const bffUrl = settings.bffUrl || 'http://localhost:8787';

  // Hysteresis for connection status to prevent 'flicker' during rapid flapping
  useEffect(() => {
    if (connected) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      setDebouncedConnected(true);
    } else {
      debounceTimerRef.current = setTimeout(() => {
        setDebouncedConnected(false);
      }, 2000); // 2s Grace period
    }
    return () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); };
  }, [connected]);

  const updatePresence = useCallback((page: string) => {
    if (socketRef.current && user) {
      socketRef.current.emit('presence', { 
        userId: user.id || user.email, 
        username: (user.name || user.email).toUpperCase(),
        page: page,
        avatar: user.avatar
      });
    }
  }, [user]);

  const joinAlertRoom = useCallback((alertId: string) => {
    if (socketRef.current && user) {
      socketRef.current.emit('join_alert', { alertId, username: (user.name || user.email).toUpperCase() });
    }
  }, [user]);

  const leaveAlertRoom = useCallback((alertId: string) => {
    if (socketRef.current && user) {
      socketRef.current.emit('leave_alert', { alertId, username: (user.name || user.email).toUpperCase() });
    }
  }, [user]);

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
    }
  }, []);

  const kickUser = useCallback((userId: string) => {
    const currentId = user?.id || user?.email;
    if (userId === currentId) {
      showToast(t('system.actionDenied') || 'Tindakan Ditolak: Tidak dapat memutuskan sesi Anda sendiri.', 'error');
      return;
    }
    const isPowerful = [ROLES.ADMIN, ROLES.MANAGER, 'l2_analyst'].includes(user?.role as any);
    if (socketRef.current && user && isPowerful) {
      socketRef.current.emit('kick_user', { userId });
    } else {
      showToast(t('system.actionDeniedUnauthorized') || 'Tindakan Ditolak: Tingkat Hak Akses Tidak Mencukupi.', 'error');
    }
  }, [user, showToast]);

  useEffect(() => {
    // Role-based logic for demo data visualization
    const isModeDemo = sessionStorage.getItem('socops_demo_mode') === '1' || user?.role === 'demo';

    const mockAnalysts: Analyst[] = [
      { id: '101', userId: '101', username: 'SIGIT ADI', page: 'PEMANTAUAN AKTIF', ip: '192.168.10.45', role: 'admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sigit' },
      { id: '102', userId: '102', username: 'SUYADI', page: 'PEMANTAUAN AKTIF', ip: '192.168.10.88', role: 'l2_analyst', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Suyadi' },
      { id: '103', userId: '102', username: 'ERWIN', page: 'PEMANTAUAN AKTIF', ip: '10.0.5.12', role: 'manager', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Erwin' },
      { id: '104', userId: '103', username: 'BANI', page: 'PEMANTAUAN AKTIF', ip: '172.16.0.4', role: 'l1_analyst', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bani' },
      { id: '105', userId: '104', username: 'BUDI HARTONO', page: 'PEMANTAUAN AKTIF', ip: '10.0.8.21', role: 'auditor', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi' }
    ];

    if (user) {
      console.log('[Socket] Initiating zero-trust connection for:', user.email);
      
      const socket = io(bffUrl, {
        reconnectionAttempts: 10,
        timeout: 10000,
        transports: ['websocket', 'polling'],
        auth: {
          userId: user.id || user.email,
          username: (user.name || user.email).toUpperCase(),
          role: user.role
        }
      });
      
      socketRef.current = socket;
      
      const checkDemo = () => sessionStorage.getItem('socops_demo_mode') === '1' || user?.role === 'demo';

      socket.on('connect', () => { 
        setConnected(true);
        console.log('[Socket] Handshake successful. ID:', socket.id);

        socket.emit('presence', {
          userId: user.id || user.email,
          username: (user.name || user.email).toUpperCase(),
          page: window.location.hash || 'OPERATIONAL GATE',
          avatar: user.avatar
        });

        const isCurrentlyDemo = checkDemo();

        setAnalysts(prev => {
          const hasSelf = prev.some(a => a.isMe);
          const selfEntry: Analyst = {
            id: socket.id,
            userId: user.id || user.email,
            username: (user.name || user.email).toUpperCase(),
            page: 'OPERATIONAL GATE',
            isMe: true,
            ip: 'LOCAL',
            avatar: user.avatar
          };
          
          let list = hasSelf ? prev : [selfEntry, ...prev.filter(p => !p.isMe)];
          
          if (isCurrentlyDemo) {
            const realIds = new Set([
              String(user.id || user.email).toUpperCase(),
              (user.name || user.email).toUpperCase()
            ]);
            const filteredMocks = mockAnalysts.filter(m => !realIds.has(String(m.id).toUpperCase()) && !realIds.has(String(m.username).toUpperCase()));
            const currentMockIds = new Set(list.map(a => String(a.id).toUpperCase()));
            const newMocks = filteredMocks.filter(m => !currentMockIds.has(String(m.id).toUpperCase()));
            return [...list, ...newMocks];
          }
          
          return list;
        });
      });

      socket.on('connect_error', (err) => {
        console.error('[Socket] Connection Error:', err.message);
      });

      socket.on('disconnect', (reason) => { 
        setConnected(false);
        console.warn('[Socket] Terminated. Reason:', reason);
      }); 

      socket.on('presence_update', (data: { analysts?: any[] }) => {
        const realUsers = data.analysts || [];
        const currentUserId = String(user.id || user.email);
        const currentUsername = (user.name || user.email).toUpperCase();
        
        const processedUsers: Analyst[] = realUsers.map(u => ({
          ...u,
          id: u.socketId || u.userId || u.id,
          isMe: String(u.userId).toUpperCase() === String(currentUserId).toUpperCase() || 
                String(u.username).toUpperCase() === String(currentUsername).toUpperCase() ||
                String(u.username).toUpperCase() === String(user.email).toUpperCase()
        }));

        const hasMe = processedUsers.some(u => u.isMe);
        const finalListBase: Analyst[] = hasMe ? processedUsers : [
          {
            id: currentUserId,
            userId: currentUserId,
            username: currentUsername,
            page: t('system.syncingPage') || 'MENYINKRONKAN...',
            isMe: true,
            ip: 'LOCAL',
            avatar: user?.avatar
          },
          ...processedUsers
        ];

        const isCurrentlyDemo = sessionStorage.getItem('socops_demo_mode') === '1' || user?.role === 'demo';

        if (isCurrentlyDemo) {
          const realIdentities = new Set([
            currentUserId.toUpperCase(),
            currentUsername.toUpperCase(),
            user.email.toUpperCase(),
            (user.name || '').toUpperCase()
          ]);
          
          const filteredMocks = mockAnalysts.filter(m => !realIdentities.has(String(m.id).toUpperCase()) && !realIdentities.has(String(m.userId).toUpperCase()) && !realIdentities.has(String(m.username).toUpperCase()));
          setAnalysts([...finalListBase, ...filteredMocks]);
        } else {
          const isManagerial = [ROLES.ADMIN, ROLES.MANAGER, 'l2_analyst'].includes(user?.role as any);
          if (isManagerial) {
            const cleanList = finalListBase.filter(u => {
              const isMockId = ['101', '102', '103', '104', '105'].includes(String(u.id)) || ['101', '102', '103', '104', '105'].includes(String(u.userId));
              return u.isMe || !isMockId;
            });
            setAnalysts(cleanList);
          } else {
            setAnalysts(finalListBase);
          }
        }
      });

      socket.on('force_logout', (data: { userId?: string, username?: string }) => {
        const currentId = user.id || user.email;
        if (data.userId === currentId || data.username === (user.name || user.email)) { 
          logout();
          window.location.href = '#/login';
          showToast(t('settings.livePresence.loggedOutByAdmin'), 'error');
        }
      });

      socket.on('new_alert', (alert: any) => {
        showToast(`${t('common.newAlert') || 'New Alert'}: ${alert.ruleDescription || alert.id}`, 'info');
      });

      socket.on('node_status_sync', (data: { serviceId: string, status: string, latency?: number }) => {
        window.dispatchEvent(new CustomEvent('socops:remote-service-update', { detail: data }));
      });

      const handleLocalStatusChange = (e: any) => {
        const { serviceId, status, latency } = e.detail;
        if (socket.connected) {
          socket.emit('node_status_change', { serviceId, status, latency });
        }
      };

      window.addEventListener('socops:service-status-change', handleLocalStatusChange);

      return () => {
        socket.disconnect();
        window.removeEventListener('socops:service-status-change', handleLocalStatusChange);
      };
    } else {
      setAnalysts(mockAnalysts);
    }
  }, [user, bffUrl, logout, showToast, t]);

  const value = useMemo(() => ({
    socket: socketRef.current,
    connected,
    debouncedConnected,
    analysts,
    updatePresence,
    joinAlertRoom,
    leaveAlertRoom,
    disconnectSocket,
    kickUser
  }), [connected, debouncedConnected, analysts, updatePresence, joinAlertRoom, leaveAlertRoom, disconnectSocket, kickUser]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};
