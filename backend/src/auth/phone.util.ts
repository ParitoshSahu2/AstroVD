/**
 * Normalizes phone numbers to standard E.164 international format.
 * Defaults 10-digit Indian mobile numbers to +91 country prefix.
 * Strips whitespace, hyphens, periods, and parentheses.
 */
export function normalizePhoneNumber(rawPhone: unknown): string {
  if (typeof rawPhone !== 'string') {
    return '';
  }

  // Remove whitespace, dashes, parentheses, periods
  let cleaned = rawPhone.replace(/[\s\-\(\)\.]/g, '');

  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.slice(2);
  }

  // If 10 digits without prefix (e.g. 9876543210), default to Indian country code +91
  if (/^[6-9]\d{9}$/.test(cleaned)) {
    return `+91${cleaned}`;
  }

  // If 11 digits starting with 0 (e.g. 09876543210)
  if (/^0[6-9]\d{9}$/.test(cleaned)) {
    return `+91${cleaned.slice(1)}`;
  }

  // If already starts with '+', ensure valid E.164
  if (!cleaned.startsWith('+') && /^[1-9]\d{8,14}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  return cleaned;
}

/**
 * Validates whether a normalized phone number satisfies E.164 standard (+[1-9][0-9]{7,14}).
 */
export function isValidE164(phone: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}
