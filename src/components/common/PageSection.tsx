import React, { ReactNode } from 'react';

/**
 * PageSection — Core Structural Module
 * High-density container for platform components, facilitating semantic hierarchy 
 * and consistent visual compartmentalization.
 */

interface PageSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export default function PageSection({ title, description, children, className = '' }: PageSectionProps) {
  return (
    <section className={`premium-capsule p-6 animate-in fade-in duration-500 ${className}`}>
      {(title || description) && (
        <div className="mb-6 relative z-10 border-b-2 border-border-primary/20 pb-4">
          {title && (
            <h2 className="text-xl font-black text-foreground-primary uppercase tracking-[0.2em] leading-none">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-2 text-[11px] font-black text-foreground-secondary uppercase tracking-widest opacity-60">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
}
