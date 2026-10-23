import React from 'react';
import {
  UserPlus,
  X,
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Wallet,
  RefreshCw,
} from 'lucide-react';

interface GenerateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSuperadmin: boolean;
  genName: string;
  setGenName: (s: string) => void;
  genEmail: string;
  setGenEmail: (s: string) => void;
  genPassword: string;
  setGenPassword: (s: string) => void;
  genRole: 'USER' | 'ADMIN';
  setGenRole: (r: 'USER' | 'ADMIN') => void;
  genDateOfBirth: string;
  setGenDateOfBirth: (s: string) => void;
  genTimeOfBirth: string;
  setGenTimeOfBirth: (s: string) => void;
  genPlaceOfBirth: string;
  setGenPlaceOfBirth: (s: string) => void;
  genZodiacSign: string;
  setGenZodiacSign: (s: string) => void;
  genWalletBalance: number;
  setGenWalletBalance: (n: number) => void;
  genError: string | null;
  genLoading: boolean;
  onGenerateProfile: (e: React.FormEvent) => void;
}

export default function GenerateUserModal({
  isOpen,
  onClose,
  isSuperadmin,
  genName,
  setGenName,
  genEmail,
  setGenEmail,
  genPassword,
  setGenPassword,
  genRole,
  setGenRole,
  genDateOfBirth,
  setGenDateOfBirth,
  genTimeOfBirth,
  setGenTimeOfBirth,
  genPlaceOfBirth,
  setGenPlaceOfBirth,
  genZodiacSign,
  setGenZodiacSign,
  genWalletBalance,
  setGenWalletBalance,
  genError,
  genLoading,
  onGenerateProfile,
}: GenerateUserModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-amber-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-5 bg-gradient-to-r from-[#5B0D15] via-[#4A0A21] to-[#3B1E22] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-200 border border-amber-300/40 flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-amber-100">
                Generate New Profile
              </h3>
              <p className="text-[11px] text-stone-300">
                Create and seed a new seeker or user account
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onGenerateProfile} className="p-6 overflow-y-auto space-y-4">
          {genError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{genError}</span>
            </div>
          )}

          {/* Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#3B1E22]">Full Name *</label>
              <input
                type="text"
                value={genName}
                onChange={(e) => setGenName(e.target.value)}
                placeholder="e.g. Ramesh Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#3B1E22]">Email Address *</label>
              <input
                type="email"
                value={genEmail}
                onChange={(e) => setGenEmail(e.target.value)}
                placeholder="ramesh@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                required
              />
            </div>
          </div>

          {/* Password & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#3B1E22]">Initial Password</label>
              <input
                type="text"
                value={genPassword}
                onChange={(e) => setGenPassword(e.target.value)}
                placeholder="Defaults to Seeker@2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#3B1E22]">Platform Role</label>
              {isSuperadmin ? (
                <select
                  value={genRole}
                  onChange={(e) => setGenRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                >
                  <option value="USER">USER (Seeker)</option>
                  <option value="ADMIN">ADMIN (Platform Administrator)</option>
                </select>
              ) : (
                <input
                  type="text"
                  value="USER (Seeker)"
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-100 text-xs text-stone-500 cursor-not-allowed"
                />
              )}
            </div>
          </div>

          {/* Date & Time of Birth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#3B1E22] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                <span>Date of Birth</span>
              </label>
              <input
                type="date"
                value={genDateOfBirth}
                onChange={(e) => setGenDateOfBirth(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#3B1E22] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>Time of Birth</span>
              </label>
              <input
                type="time"
                value={genTimeOfBirth}
                onChange={(e) => setGenTimeOfBirth(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
          </div>

          {/* Place of Birth & Zodiac */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#3B1E22] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-700" />
                <span>Place of Birth</span>
              </label>
              <input
                type="text"
                value={genPlaceOfBirth}
                onChange={(e) => setGenPlaceOfBirth(e.target.value)}
                placeholder="e.g. New Delhi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#3B1E22] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Zodiac Sign</span>
              </label>
              <select
                value={genZodiacSign}
                onChange={(e) => setGenZodiacSign(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              >
                {['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'].map((sign) => (
                  <option key={sign} value={sign}>{sign}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Initial Spiritual Wallet */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#3B1E22] flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-amber-700" />
              <span>Initial Spiritual Wallet Balance (₹)</span>
            </label>
            <input
              type="number"
              min="0"
              step="10"
              value={genWalletBalance}
              onChange={(e) => setGenWalletBalance(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={genLoading}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={genLoading || !genName || !genEmail}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#5B0D15] to-[#7B121C] hover:opacity-95 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              {genLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating Profile...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Generate Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
