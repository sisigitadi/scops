// IPv4 regex pattern
const IPV4_REGEX = /^(?:\d{1,3}\.){3}\d{1,3}$/;

/**
 * Simple IPv4 validation.
 * @param str The string to validate.
 */
function isValidIPv4(str: string): boolean {
  return IPV4_REGEX.test(str);
}

/**
 * Obfuscates sensitive values like IPs, Emails, and IDs.
 * @param value The raw value to obfuscate.
 */
export function obfuscateValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  const str = String(value);
  
  // Full mask for IP addresses (security enhancement)
  if (isValidIPv4(str)) {
    return '***.***.***.***';
  }
  
  // Full mask for email addresses
  if (str.includes('@') && str.includes('.')) {
    return '***@***.***';
  }
  
  if (str.length <= 4) return '*'.repeat(str.length);
  return str.slice(0, 2) + '*'.repeat(str.length - 2);
}
