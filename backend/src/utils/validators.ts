import { VALIDATION_PATTERNS, US_STATES, CA_PROVINCES } from './constants.js';
import { Country } from '../types/index.js';

export function validateEIN(ein: string): boolean {
  if (!ein || typeof ein !== 'string') return false;
  return VALIDATION_PATTERNS.EIN.test(ein.trim());
}

export function validateMCNumber(mc: string): boolean {
  if (!mc || typeof mc !== 'string') return false;
  return VALIDATION_PATTERNS.MC_NUMBER.test(mc.trim());
}

export function validateUSDOTNumber(usdot: string): boolean {
  if (!usdot || typeof usdot !== 'string') return false;
  return VALIDATION_PATTERNS.USDOT_NUMBER.test(usdot.trim());
}

export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  return VALIDATION_PATTERNS.PHONE.test(phone.trim());
}

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return VALIDATION_PATTERNS.EMAIL.test(email.trim());
}

export function validatePostalCode(zip: string, country: Country = 'US'): boolean {
  if (!zip || typeof zip !== 'string') return false;
  const trimmed = zip.trim();
  if (country === 'CA') {
    return VALIDATION_PATTERNS.CA_POSTAL.test(trimmed);
  }
  return VALIDATION_PATTERNS.US_ZIP.test(trimmed);
}

export function validateState(state: string, country: Country = 'US'): boolean {
  if (!state || typeof state !== 'string') return false;
  const trimmed = state.trim().toUpperCase();
  if (country === 'CA') {
    return CA_PROVINCES.includes(trimmed);
  }
  return US_STATES.includes(trimmed);
}

export function normalizeMCNumber(mc: string): string {
  if (!mc) return '';
  const cleaned = mc.replace(/[^0-9]/g, '');
  return cleaned ? `MC-${cleaned}` : '';
}

export function normalizePhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  return phone;
}

export function normalizeEIN(ein: string): { canon: string; display: string } {
  if (!ein) return { canon: '', display: '' };
  const cleaned = ein.replace(/[^0-9]/g, '');
  if (cleaned.length === 9) {
    return {
      canon: cleaned,
      display: `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`,
    };
  }
  return { canon: '', display: '' };
}




