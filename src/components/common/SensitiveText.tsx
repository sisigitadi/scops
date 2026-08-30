import React from 'react';

/**
 * SensitiveText — PII Protection Wrapper
 * Ensures consistent rendering and potential masking of sensitive forensic data.
 */

interface SensitiveTextProps {
  value: string | number | null | undefined;
  className?: string;
  mono?: boolean;
}

export default function SensitiveText({ value, className = '', mono = false }: SensitiveTextProps) {
  const safeValue = value === null || value === undefined || value === '' ? '-' : value;

  return (
    <span
      className={[
        className,
        mono ? 'font-mono text-[11px] tracking-tight' : ''
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {safeValue}
    </span>
  );
}
