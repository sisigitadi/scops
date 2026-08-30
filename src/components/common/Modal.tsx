import React, { useEffect, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Modal — Centralized Dialogue Container
 * Forensic-grade overlay component utilizing React Portals and high-fidelity 
 * motion choreography for critical user interactions.
 */

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-4xl" }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <AnimatePresence mode="wait">
       <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className={`relative w-full ${maxWidth} rounded-[1.8rem] md:rounded-[2.5rem] bg-bg-card border-2 border-border-primary shadow-[0_30px_70px_rgba(0,0,0,0.3)] overflow-hidden`}
          >
             <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent-cyan via-accent-indigo to-accent-purple opacity-40" />
             
             <div className="flex items-center justify-between px-6 py-5 md:px-8 md:py-6 border-b-2 border-border-primary bg-bg-panel/10">
                <h3 className="text-lg md:text-xl font-black uppercase tracking-widest text-foreground-primary truncate pr-4">{title}</h3>
                <motion.button 
                  whileHover={{ rotate: 90 }}
                  onClick={onClose} 
                  className="flex h-10 w-10 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl md:rounded-2xl bg-bg-panel border-2 border-border-primary text-foreground-muted hover:text-foreground-primary transition-colors"
                >
                  <X size={20} className="md:hidden" />
                  <X size={24} className="hidden md:block" />
                </motion.button>
             </div>

             <div className="p-6 md:p-8 max-h-[85vh] overflow-y-auto no-scrollbar scroll-smooth">
                {children}
             </div>
          </motion.div>
       </div>
    </AnimatePresence>,
    document.body
  );
}

/**
 * Drawer — Lateral Navigation Container
 */

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export function Drawer({ isOpen, onClose, title, children, maxWidth = "max-w-xl" }: DrawerProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <AnimatePresence mode="wait">
       <div className="fixed inset-0 z-[10000] flex justify-end overflow-hidden">
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm"
          />

          {/* Drawer Card */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`relative h-full w-full ${maxWidth} bg-bg-card border-l-2 border-border-primary shadow-2xl overflow-hidden`}
          >
             <div className="flex items-center justify-between p-6 md:p-7 border-b-2 border-border-primary bg-bg-panel/5">
                <h3 className="text-base md:text-lg font-black uppercase tracking-widest text-foreground-primary truncate pr-4">{title}</h3>
                <motion.button 
                  onClick={onClose} 
                  className="flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-lg md:rounded-xl bg-bg-panel border-2 border-border-primary text-foreground-muted hover:text-foreground-primary transition-colors"
                >
                   <X size={18} className="md:hidden" />
                   <X size={20} className="hidden md:block" />
                </motion.button>
             </div>

             <div className="h-[calc(100%-80px)] overflow-y-auto p-6 md:p-8 no-scrollbar">
                {children}
             </div>
          </motion.div>
       </div>
    </AnimatePresence>,
    document.body
  );
}
