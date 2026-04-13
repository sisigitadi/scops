import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import { useLanguage } from './context/LanguageContext';

/**
 * App — Primary Orchestration Layer
 * Entry point for the SOCOps application, managing the top-level transition logic 
 * and structural integrity of the root viewport.
 */

function App() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const { isLanguageTransitioning } = useLanguage();
  
  // Extracting root key to handle page-level transitions effectively
  const rootRouteKey = (location.pathname.split('/').filter(Boolean)[0] || 'root');

  return (
    <div className="flex min-h-screen flex-col bg-background-main text-foreground-primary antialiased">
      <div className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={rootRouteKey}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? {} : { opacity: 0, y: -8 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
            className={isLanguageTransitioning ? 'ui-lang-transition' : undefined}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
