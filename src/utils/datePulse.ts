/**
 * datePulse — Forensic Chronology & Temporal Alignment
 * Centralized utility for standardized time representation across the SOC platform.
 * Ensures consistent Asia/Jakarta (WIB) output regardless of analyst geo-location.
 */

export const ASIA_JAKARTA = 'Asia/Jakarta';

export interface DateFormatOptions {
  includeTime?: boolean;
  style?: 'short' | 'medium' | 'long' | 'full' | 'iso' | 'dmy'; 
  timeStyle?: 'short' | 'medium';
  locale?: string;
}

/**
 * Standard Forensic Date-Time Formatter
 * Now supports 'iso' style for YYYY-MM-DD requirement.
 */
export function pulse(
  dateVal: string | Date | number | undefined,
  options: DateFormatOptions = {}
): string {
  if (!dateVal) return '-';

  try {
    const date = dateVal instanceof Date ? dateVal : new Date(dateVal);
    
    if (isNaN(date.getTime())) {
      return String(dateVal);
    }

    const { 
      includeTime = false, 
      style = 'iso', 
      timeStyle = 'short', 
      locale = 'id-ID' 
    } = options;

    if (style === 'iso') {
      const year = date.toLocaleString('en-GB', { timeZone: ASIA_JAKARTA, year: 'numeric' });
      const month = date.toLocaleString('en-GB', { timeZone: ASIA_JAKARTA, month: '2-digit' });
      const day = date.toLocaleString('en-GB', { timeZone: ASIA_JAKARTA, day: '2-digit' });
      
      const datePart = `${year}-${month}-${day}`;
      
      if (includeTime) {
        const timePart = date.toLocaleString('en-GB', { 
          timeZone: ASIA_JAKARTA, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit',
          hour12: false 
        });
        return `${datePart} ${timePart}`;
      }
      return datePart;
    }

    if (style === 'dmy') {
      const year = date.toLocaleString('en-GB', { timeZone: ASIA_JAKARTA, year: 'numeric' });
      const month = date.toLocaleString('en-GB', { timeZone: ASIA_JAKARTA, month: '2-digit' });
      const day = date.toLocaleString('en-GB', { timeZone: ASIA_JAKARTA, day: '2-digit' });
      
      const datePart = `${day}-${month}-${year}`;
      
      if (includeTime) {
        const timePart = date.toLocaleString('en-GB', { 
          timeZone: ASIA_JAKARTA, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit',
          hour12: false 
        });
        return `${datePart} ${timePart}`;
      }
      return datePart;
    }

    return new Intl.DateTimeFormat(locale, {
      timeZone: ASIA_JAKARTA,
      dateStyle: (style === 'iso' || style === 'dmy') ? undefined : style,
      timeStyle: includeTime ? timeStyle : undefined,
      hour12: false
    }).format(date);
  } catch (error) {
    console.warn('datePulse Error:', error);
    return String(dateVal);
  }
}

/**
 * Enhanced Forensic Formatter
 * Returns separate parts for granular UI placement in forensic grids.
 */
export function pulseParts(
  dateVal: string | Date | number | undefined,
  options: DateFormatOptions = { style: 'dmy' }
): { date: string; time: string } {
  if (!dateVal) return { date: '-', time: '-' };

  const full = pulse(dateVal, { ...options, includeTime: true });
  // Typical outputs: "12-04-2026 12:34:56" or "2026-04-12 12:34:56"
  const parts = full.split(' ');
  
  return {
    date: parts[0] || '-',
    time: parts[1] || '-'
  };
}

/**
 * Returns date in DD-MM-YYYY format specifically for SOC Ops requirements.
 */
export function formatDDMMYYYY(dateVal: string | Date | undefined | number): string {
  return pulse(dateVal, { style: 'dmy', includeTime: false });
}

/**
 * Returns date in YYYY-MM-DD format (ISO).
 */
export function formatYYYYMMDD(dateVal: string | Date | undefined | number): string {
  return pulse(dateVal, { style: 'iso', includeTime: false });
}
