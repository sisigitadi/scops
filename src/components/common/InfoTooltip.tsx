import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * InfoTooltip — Strategic Guidance Popover (v2.0 Portal Edition)
 * Uses high-fidelity portal rendering to escape container boundaries and stacking contexts.
 */

interface InfoTooltipProps {
  text: string;
  vAlign?: 'top' | 'bottom';
  align?: 'left' | 'right' | 'center';
}

export default function InfoTooltip({ text, vAlign = 'bottom', align = 'center' }: InfoTooltipProps) {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const anchorRef = useRef<HTMLSpanElement>(null);

  const updateCoords = () => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  useEffect(() => {
    if (isVisible) {
      updateCoords();
      window.addEventListener('scroll', updateCoords);
      window.addEventListener('resize', updateCoords);
    }
    return () => {
      window.removeEventListener('scroll', updateCoords);
      window.removeEventListener('resize', updateCoords);
    };
  }, [isVisible]);

  if (!text) return null;

  // vAlign logic: bottom means ABOVE the icon, top means BELOW the icon
  // In portal mode, we use fixed/absolute positioning with calculated top.
  const tooltipStyle: React.CSSProperties = {
    position: 'absolute',
    left: coords.left + (coords.width / 2),
    zIndex: 1000000,
    width: '18rem',
    maxWidth: '85vw',
    pointerEvents: 'none',
    transition: 'opacity 0.2s, transform 0.2s',
    opacity: isVisible ? 1 : 0,
    transform: `translate(-50%, ${vAlign === 'bottom' ? '-100%' : '0'}) scale(${isVisible ? 1 : 0.95})`,
    marginTop: vAlign === 'bottom' ? '-12px' : '36px',
    top: coords.top
  };

  const arrowStyle: React.CSSProperties = {
    position: 'absolute',
    width: '0.75rem',
    height: '0.75rem',
    backgroundColor: '#020617',
    border: '1px solid rgba(34, 211, 238, 0.6)',
    transform: 'rotate(45deg) translateX(-50%)',
    left: '50%',
    zIndex: -1,
    ...(vAlign === 'bottom' 
      ? { bottom: '-6px', borderTop: 'none', borderLeft: 'none' } 
      : { top: '-6px', borderBottom: 'none', borderRight: 'none' })
  };

  return (
    <span 
      ref={anchorRef}
      className="relative inline-flex items-center justify-center h-6 w-6 shrink-0 z-50 cursor-help"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <HelpCircle 
        size={14} 
        strokeWidth={3}
        className={`text-accent-cyan transition-all duration-300 ${isVisible ? 'opacity-100 scale-125' : 'opacity-60'}`} 
      />
      
      {isVisible && createPortal(
        <div style={tooltipStyle}>
          <div className="relative p-5 rounded-2xl bg-[#020617] border border-accent-cyan/60 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_30px_rgba(6,182,212,0.2)] text-left backdrop-blur-xl">
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
              <div className="p-1 rounded-md bg-accent-cyan/10 text-accent-cyan">
                <HelpCircle size={10} strokeWidth={3} />
              </div>
              <span className="text-[9px] font-black text-accent-cyan tracking-[0.2em] uppercase">
                {language === 'id' ? 'PANDUAN PROTOKOL' : 'SYSTEM GUIDANCE'}
              </span>
            </div>

            {/* Tooltip Content */}
            <p className="text-[11px] font-bold text-white leading-relaxed uppercase tracking-tight break-words whitespace-normal font-sans">
              {text}
            </p>

            {/* Strategic Pointer (Arrow) */}
            <div style={arrowStyle} />
          </div>
        </div>,
        document.body
      )}
    </span>
  );
}
