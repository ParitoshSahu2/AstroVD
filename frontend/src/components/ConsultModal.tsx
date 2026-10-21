'use client';

import React, { useState, useEffect } from 'react';
import { fetchAstrologers, bookConsultation } from '../lib/api';
import {
  PhoneCall,
  MessageSquare,
  Video,
  Star,
  Award,
  CheckCircle2,
  Clock,
  Globe,
  Shield,
  Sparkles,
  X,
  AlertCircle,
} from 'lucide-react';

interface ConsultModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  openAuthModal: () => void;
}

export const ConsultModal: React.FC<ConsultModalProps> = ({
  isOpen,
  onClose,
  user,
  openAuthModal,
}) => {
  const [astrologers, setAstrologers] = useState<any[]>([]);
  const [selectedAstrologer, setSelectedAstrologer] = useState<any>(null);
  const [consultType, setConsultType] = useState<'chat' | 'call' | 'video'>('call');
  const [duration, setDuration] = useState(15);
  const [loading, setLoading] = useState(true);
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [phoneError, setPhoneError] = useState('');
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setContactPhone(user?.phone || '');
      setPhoneError('');
      setBookingError('');
      fetchAstrologers('all').then((data) => {
        setAstrologers(data);
        if (data.length > 0 && !selectedAstrologer) {
          setSelectedAstrologer(data[0]);
        }
        setLoading(false);
      });
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const normalizeInputPhone = (raw: string): string => {
    let cleaned = raw.replace(/[\s\-\(\)\.]/g, '');
    if (cleaned.startsWith('00')) cleaned = '+' + cleaned.slice(2);
    if (/^[6-9]\d{9}$/.test(cleaned)) return `+91${cleaned}`;
    if (/^0[6-9]\d{9}$/.test(cleaned)) return `+91${cleaned.slice(1)}`;
    if (!cleaned.startsWith('+') && /^[1-9]\d{8,14}$/.test(cleaned)) return `+${cleaned}`;
    return cleaned;
  };

  const handleConfirmBooking = async () => {
    if (bookingLoading) return;

    if (!user) {
      onClose();
      openAuthModal();
      return;
    }

    setPhoneError('');
    setBookingError('');

    const trimmed = contactPhone.trim();
    if (!trimmed) {
      setPhoneError('Contact phone number is required for consultation connection.');
      return;
    }

    const normalized = normalizeInputPhone(trimmed);

    // Reject the obsolete dummy fallback
    if (normalized === '+919876543210' || normalized === '9876543210') {
      setPhoneError('Please enter your actual contact phone number, not the placeholder dummy number.');
      return;
    }

    if (!/^\+[1-9]\d{7,14}$/.test(normalized)) {
      setPhoneError('Please enter a valid 10-digit mobile number or standard international number starting with +.');
      return;
    }

    setBookingLoading(true);
    try {
      const res = await bookConsultation({
        astrologerId: selectedAstrologer?.id,
        userName: user.name || 'Seeker',
        userPhone: normalized,
        consultationType: consultType,
        durationMinutes: duration,
      });
      setBookingSuccess(res);
    } catch (err: any) {
      setBookingError(err.message || 'Failed to book consultation session.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FFFDF9] border border-amber-300 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-800 p-1.5 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Live Astrologer Consultation</span>
          </div>
          <h3 className="text-2xl font-bold text-stone-900 font-serif">
            Talk to India's Top Jyotish Gurus
          </h3>
          <p className="text-xs text-stone-600">
            Instant private call & chat with certified Vedic astrologers
          </p>
        </div>

        {bookingSuccess ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-stone-900 font-serif">
                Session Connected Successfully!
              </h4>
              <p className="text-xs text-stone-600 mt-1">
                Booking ID: <span className="font-mono font-bold text-amber-800">{bookingSuccess.bookingId}</span>
              </p>
              <p className="text-xs text-stone-600 mt-2">
                Connecting with <strong className="text-stone-900">{bookingSuccess.astrologerName}</strong> via{' '}
                <strong className="text-amber-700 capitalize">{bookingSuccess.type}</strong> for{' '}
                <strong>{bookingSuccess.duration} minutes</strong>.
              </p>
            </div>
            <div className="inline-block px-4 py-2 rounded-xl bg-amber-200/60 text-amber-900 text-xs font-semibold">
              Dialing astrologer's private line...
            </div>
            <div>
              <button
                onClick={() => {
                  setBookingSuccess(null);
                  onClose();
                }}
                className="px-6 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Astrologers Select Cards */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-2">
                1. Select Astrologer
              </label>
              {loading ? (
                <div className="py-8 text-center text-xs text-stone-500">
                  Loading verified astrologers...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {astrologers.slice(0, 3).map((astro) => {
                    const isSelected = selectedAstrologer?.id === astro.id;
                    return (
                      <div
                        key={astro.id}
                        onClick={() => setSelectedAstrologer(astro)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400/40 shadow-sm'
                            : 'bg-white border-stone-200 hover:border-amber-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={astro.avatar}
                            alt={astro.name}
                            className="w-10 h-10 rounded-full object-cover border border-amber-300"
                          />
                          <div>
                            <div className="text-xs font-bold text-stone-900">{astro.name}</div>
                            <div className="text-[10px] text-amber-700 flex items-center gap-1 font-semibold">
                              <Star className="w-3 h-3 fill-current text-amber-500" />
                              <span>{astro.rating}</span>
                              <span className="text-stone-400">• {astro.experienceYears}y</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-[11px] font-bold text-stone-800">
                          ₹{astro.pricePerMinute}/min
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Consultation Mode */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-2">
                2. Choose Consultation Mode
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'call', label: 'Audio Call', icon: PhoneCall },
                  { id: 'chat', label: 'Live Chat', icon: MessageSquare },
                  { id: 'video', label: 'Video Call', icon: Video },
                ].map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = consultType === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setConsultType(mode.id as any)}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-100/70 border-amber-500 text-amber-950 font-bold'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-amber-600" />
                      <span className="text-xs">{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-2">
                3. Consultation Duration
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { mins: 10, label: '10 Mins (Quick Query)' },
                  { mins: 15, label: '15 Mins (Recommended)' },
                  { mins: 30, label: '30 Mins (Deep Analysis)' },
                ].map((dur) => (
                  <button
                    key={dur.mins}
                    onClick={() => setDuration(dur.mins)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      duration === dur.mins
                        ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 text-xs'
                    }`}
                  >
                    <div className="text-xs font-bold">{dur.mins} Mins</div>
                    <div className="text-[10px] text-stone-500">
                      ₹{(selectedAstrologer?.pricePerMinute || 25) * dur.mins}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Phone Section */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-stone-700">
                  4. Contact Phone Number (for Consultation Call/SMS)
                </label>
                {user?.phone ? (
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    From Account
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Required for connection
                  </span>
                )}
              </div>
              <div className="relative">
                <PhoneCall className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  disabled={bookingLoading}
                  value={contactPhone}
                  onChange={(e) => {
                    setContactPhone(e.target.value);
                    if (phoneError) setPhoneError('');
                    if (bookingError) setBookingError('');
                  }}
                  placeholder="e.g. 9876543210 or +919876543210"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border text-stone-900 text-xs focus:outline-none focus:ring-1 shadow-sm disabled:opacity-60 ${
                    phoneError
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-400'
                      : 'border-stone-300 focus:border-amber-500 focus:ring-amber-400'
                  }`}
                />
              </div>
              {phoneError ? (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{phoneError}</span>
                </p>
              ) : (
                <p className="text-[10px] text-stone-500 mt-1">
                  We'll connect the sacred session to this number. Indian 10-digit numbers automatically normalize to +91.
                </p>
              )}
            </div>

            {/* Booking Error Display */}
            {bookingError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleConfirmBooking}
              disabled={bookingLoading || !selectedAstrologer}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-sm shadow-md shadow-amber-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {bookingLoading ? (
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <PhoneCall className="w-4 h-4" />
                  <span>
                    Start {consultType === 'call' ? 'Call' : consultType === 'chat' ? 'Chat' : 'Video'} Now (₹
                    {(selectedAstrologer?.pricePerMinute || 25) * duration})
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
