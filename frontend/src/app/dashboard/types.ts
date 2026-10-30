export interface UserProfile {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  gender?: string | null;
  gotra?: string | null;
  role: string;
  status: string;
  dateOfBirth?: string | null;
  timeOfBirth?: string | null;
  placeOfBirth?: string | null;
  zodiacSign?: string | null;
  walletBalance?: number;
  createdAt?: string;
  [key: string]: any;
}

export interface WalletData {
  walletBalance: number;
  currency: string;
  currencySymbol: string;
}

export interface Transaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

export type DashboardTab = 'overview' | 'consultations' | 'orders' | 'kundli' | 'settings';

export const ZODIAC_HINDI_MAP: Record<string, string> = {
  Aries: 'मेष',
  Taurus: 'वृषभ',
  Gemini: 'मिथुन',
  Cancer: 'कर्क',
  Leo: 'सिंह',
  Virgo: 'कन्या',
  Libra: 'तुला',
  Scorpio: 'वृश्चिक',
  Sagittarius: 'धनु',
  Capricorn: 'मकर',
  Aquarius: 'कुंभ',
  Pisces: 'मीन',
};

export function formatZodiacName(sign?: string | null): string {
  if (!sign) return 'Aries (मेष)';
  if (sign.includes('(')) return sign;
  const match = Object.entries(ZODIAC_HINDI_MAP).find(
    ([k]) => k.toLowerCase() === sign.trim().toLowerCase()
  );
  if (match) return `${match[0]} (${match[1]})`;
  return sign;
}

export function getUserInitials(name?: string): string {
  if (!name || !name.trim()) return 'Y';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}
