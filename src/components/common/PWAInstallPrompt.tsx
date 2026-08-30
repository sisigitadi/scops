import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

export default function PWAInstallPrompt() {
  const [prompt, setPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setPrompt(e);
      
      // Check if already dismissed in this session
      const dismissed = sessionStorage.getItem('pwa_prompt_dismissed');
      if (!dismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    
    // Show the install prompt
    prompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await prompt.userChoice;
    console.log(`User choice outcome: ${outcome}`);
    
    // Reset the deferred prompt variable, since it can only be used once.
    setPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('pwa_prompt_dismissed', '1');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[9999] p-4 lg:hidden"
        >
          <div className="bg-bg-panel/90 backdrop-blur-xl border border-accent-cyan/30 rounded-3xl p-5 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan shrink-0 border border-accent-cyan/20">
                <Download size={24} />
              </div>
              <div>
                <h4 className="text-sm font-black text-foreground-primary uppercase tracking-wider leading-tight">SOC Ops Tactical</h4>
                <p className="text-[10px] font-bold text-foreground-tertiary uppercase opacity-70 mt-1">Install App Untuk Akses Offline</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleInstall}
                className="bg-accent-cyan text-foreground-inverse px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-accent-cyan/20 active:scale-95 transition-all"
              >
                INSTALL
              </button>
              <button 
                onClick={handleDismiss}
                className="p-2.5 text-foreground-tertiary hover:text-foreground-primary transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
