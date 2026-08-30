import React, { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * StaggerFadeIn — Tactical UI Choreography
 * Orchestrates premium entrance animations for forensic dashboard components,
 * with graceful degradation for users with motion sensitivity.
 */

interface StaggerGroupProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
}

export function StaggerGroup({ children, className = '', delay = 0, stagger = 0.04 }: StaggerGroupProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 1 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren: delay,
            staggerChildren: stagger
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className = '' }: StaggerItemProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 5 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { 
            type: 'tween',
            duration: 0.3,
            ease: 'easeOut'
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
}
