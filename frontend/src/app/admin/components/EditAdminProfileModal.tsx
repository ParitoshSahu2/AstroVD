import React from 'react';
import {
  Edit3,
  X,
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

interface EditAdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  editName: string;
  setEditName: (s: string) => void;
  editDateOfBirth: string;
  setEditDateOfBirth: (s: string) => void;
  editTimeOfBirth: string;
  setEditTimeOfBirth: (s: string) => void;
  editPlaceOfBirth: string;
  setEditPlaceOfBirth: (s: string) => void;
  editZodiacSign: string;
  setEditZodiacSign: (s: string) => void;
  editError: string | null;
  editLoading: boolean;
  onSaveProfile: (e: React.FormEvent) => void;
}

export default function EditAdminProfileModal({
  isOpen,
  onClose,
  currentUser,
  editName,
  setEditName,
  editDateOfBirth,
  setEditDateOfBirth,
  editTimeOfBirth,
  setEditTimeOfBirth,
  editPlaceOfBirth,
  setEditPlaceOfBirth,
  editZodiacSign,
  setEditZodiacSign,
  editError,
  editLoading,
  onSaveProfile,
}: EditAdminProfileModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-amber-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-5 bg-gradient-to-r from-[#5B0D15] via-[#4A0A21] to-[#3B1E22] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-200 border border-amber-300/40 flex items-center justify-center shrink-0">
              <Edit3 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-amber-100">
                Edit Your Profile
              </h3>
              <p className="text-[11px] text-stone-300">
                Update your astrological birth details and display name
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

        <form onSubmit={onSaveProfile} className="p-6 overflow-y-auto space-y-4">
          {/* Account Overview Tag */}
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-amber-200/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-stone-500">Email:</span>{' '}
              <span className="font-semibold text-stone-800">{currentUser?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] uppercase">
                {currentUser?.role}
              </span>
            </div>
          </div>

          {editError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{editError}</span>
            </div>
          )}

          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#3B1E22]">Full Name *</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Your Full Name"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              required
            />
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
                value={editDateOfBirth}
                onChange={(e) => setEditDateOfBirth(e.target.value)}
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
                value={editTimeOfBirth}
                onChange={(e) => setEditTimeOfBirth(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
          </div>

          {/* Place of Birth */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#3B1E22] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-700" />
              <span>Place of Birth (City, State)</span>
            </label>
            <input
              type="text"
              value={editPlaceOfBirth}
              onChange={(e) => setEditPlaceOfBirth(e.target.value)}
              placeholder="e.g. Varanasi, Uttar Pradesh"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          {/* Zodiac Sign */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#3B1E22] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Vedic Zodiac Sign (Rashi)</span>
            </label>
            <select
              value={editZodiacSign}
              onChange={(e) => setEditZodiacSign(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            >
              {['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'].map((sign) => (
                <option key={sign} value={sign}>{sign}</option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={editLoading}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editLoading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#5B0D15] to-[#7B121C] hover:opacity-95 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              {editLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
