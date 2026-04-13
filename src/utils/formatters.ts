/**
 * Formats date/time in WIB (Asia/Jakarta, UTC+7).
 * @param date The Date object to format. Defaults to current time.
 */
export function formatDateTime(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    dateStyle: 'medium',
    timeStyle: 'short',
    hour12: false
  }).format(date);
}

/**
 * obfuscateValue — Forensic Telemetry Masking
 * Obfuscates sensitive identifiers for non-privileged or demo personas, 
 * preserving investigative context while protecting individual asset data.
 */
export function obfuscateValue(value: string | undefined): string {
  if (!value) return '-';
  if (value.length <= 4) return '****';
  return value.substring(0, 2) + '*'.repeat(value.length - 4) + value.substring(value.length - 2);
}
