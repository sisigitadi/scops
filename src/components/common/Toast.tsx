import React, { useEffect } from 'react';
import { X, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Toast — Tactical Notification Pulse
 * Real-time system feedback delivered via a high-density glassmorphic notification layer.
 */

interface ToastProps {
  message: string;
  onClose: () => void;
}

export default function Toast({ message, onClose }: ToastProps) {
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-in slide-in-from-right-full duration-300">
      <div className="flex items-center gap-3 rounded-[1.25rem] border border-border-secondary bg-bg-panel/95 p-4 shadow-2xl backdrop-blur-md">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-cyan/10 text-accent-cyan shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <ShieldAlert size={18} />
        </div>
        <div className="flex flex-col pr-6">
          <p className="text-[10px] text-foreground-tertiary uppercase font-black tracking-[0.2em] mb-0.5">
            {(t('common.systemNotification') as string) || 'SYSTEM NOTIFICATION'}
          </p>
          <p className="text-sm font-bold text-foreground-primary leading-tight tracking-tight">
            {message}
          </p>
        </div>
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 p-1 text-foreground-muted hover:text-foreground-primary transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
