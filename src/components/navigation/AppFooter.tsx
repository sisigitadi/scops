import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { useSettings } from '../../context/SettingsContext';
import AboutModal from '../about/AboutModal';

/**
 * AppFooter — Peripheral Audit Signature
 * Final operational signature anchoring the platform ecosystem with localized 
 * metadata and secondary tactical vectors.
 */

export default function AppFooter() {
  const { t } = useLanguage();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { settings } = useSettings();
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { 
      id: 'gh', 
      url: 'https://github.com/sisigitadi', 
      label: 'GITHUB',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
        </svg>
      )
    },
    { 
      id: 'li', 
      url: 'https://www.linkedin.com/in/sigitadi/', 
      label: 'LINKEDIN',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-1.337-.025-3.041-1.854-3.041-1.854 0-2.139 1.448-2.139 2.943v5.702h-3v-11h2.882v1.503h.04c.401-.759 1.381-1.56 2.839-1.56 3.039 0 3.593 2.001 3.593 4.603v6.454z"/>
        </svg>
      )
    },
    { 
      id: 'mail', 
      url: 'mailto:si.sigitadi@gmail.com', 
      label: 'EMAIL',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      )
    }
  ];

  return (
    <footer className="w-full mt-auto py-12 px-8 flex flex-col items-center justify-center gap-10 bg-transparent relative z-10">
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-border-primary/20 to-transparent" />
      
      {/* Row 1: Primary Brand Interaction */}
      <div className="flex flex-col items-center gap-4">
        <motion.button 
          onClick={() => setIsAboutOpen(true)}
          className="group flex items-center gap-4 px-10 py-4 rounded-[2rem] bg-bg-panel/40 border border-border-primary hover:border-accent-cyan/40 text-accent-cyan hover:bg-bg-panel/60 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] transition-all duration-500"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="p-2 rounded-xl bg-accent-cyan/10 group-hover:bg-accent-cyan/20 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-[11px] font-black uppercase tracking-[0.3em]">{(t('nav.about') as string) || 'ABOUT'}</span>
            <span className="text-[8px] font-bold text-foreground-tertiary uppercase tracking-widest opacity-60">{(t('footer.securePlatform') as string) || 'SECURITY OPERATIONS PLATFORM'}</span>
          </div>
        </motion.button>
      </div>

      {/* Row 2: Secondary Tactical Vectors (Social) */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {socialLinks.map((social) => (
          <motion.a 
            key={social.id} 
            href={social.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-bg-panel/20 border border-border-primary/10 text-foreground-tertiary hover:text-accent-cyan hover:border-accent-cyan/40 hover:bg-bg-panel/40 transition-all duration-300"
            whileHover={{ y: -2 }}
          >
            {social.icon}
            <span className="text-[9px] font-black uppercase tracking-widest">{social.label}</span>
          </motion.a>
        ))}
      </div>

      {/* Row 3: Operational Signature & Community Sentiment */}
      <div className="flex flex-col items-center gap-5">
        <div className="flex items-center gap-3 text-[9px] font-black text-foreground-tertiary uppercase tracking-[0.4em] opacity-40">
          <span>{(t('footer.builtWith') as string) || 'BUILT WITH'}</span>
          <Heart size={14} className="text-status-danger-text animate-pulse" fill="currentColor" />
          <span>{(t('footer.forCommunity') as string) || 'FOR THE COMMUNITY'}</span>
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <div className="text-[10px] font-black text-foreground-secondary uppercase tracking-[0.5em] opacity-80">
            &copy; {currentYear} SIGIT ADI
          </div>
          <div className="h-1 w-12 rounded-full bg-gradient-to-r from-transparent via-accent-cyan/30 to-transparent" />
        </div>
      </div>

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </footer>
  );
}
