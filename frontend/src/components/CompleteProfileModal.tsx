'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Compass,
  Heart,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getAuthToken } from '../lib/auth';

interface CompleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSuccess?: (updatedUser: any) => void;
}

const ZODIAC_SIGNS = [
  { value: 'Aries', labelEn: 'Aries (मेष)', rashi: 'Mesha' },
  { value: 'Taurus', labelEn: 'Taurus (वृषभ)', rashi: 'Vrishabha' },
  { value: 'Gemini', labelEn: 'Gemini (मिथुन)', rashi: 'Mithuna' },
  { value: 'Cancer', labelEn: 'Cancer (कर्क)', rashi: 'Karka' },
  { value: 'Leo', labelEn: 'Leo (सिंह)', rashi: 'Simha' },
  { value: 'Virgo', labelEn: 'Virgo (कन्या)', rashi: 'Kanya' },
  { value: 'Libra', labelEn: 'Libra (तुला)', rashi: 'Tula' },
  { value: 'Scorpio', labelEn: 'Scorpio (वृश्चिक)', rashi: 'Vrischika' },
  { value: 'Sagittarius', labelEn: 'Sagittarius (धनु)', rashi: 'Dhanu' },
  { value: 'Capricorn', labelEn: 'Capricorn (मकर)', rashi: 'Makara' },
  { value: 'Aquarius', labelEn: 'Aquarius (कुम्भ)', rashi: 'Kumbha' },
  { value: 'Pisces', labelEn: 'Pisces (मीन)', rashi: 'Meena' },
];

export const CompleteProfileModal: React.FC<CompleteProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const { t, language } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [tob, setTob] = useState('');
  const [timePeriod, setTimePeriod] = useState<'AM' | 'PM'>('AM');
  const [isTobApprox, setIsTobApprox] = useState(false);
  const [pob, setPob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [zodiacSign, setZodiacSign] = useState('Aries');
  const [gotra, setGotra] = useState('');
  const [primaryQuery, setPrimaryQuery] = useState('Career & Wealth');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  // Stop Lenis smooth scroll and disable background scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (typeof window !== 'undefined' && (window as any).__lenis) {
        (window as any).__lenis.stop();
      }
    }
    return () => {
      document.body.style.overflow = '';
      if (typeof window !== 'undefined' && (window as any).__lenis) {
        (window as any).__lenis.start();
      }
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleDismiss();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleContainerWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    if (formRef.current && e.target !== formRef.current && !formRef.current.contains(e.target as Node)) {
      formRef.current.scrollTop += e.deltaY;
    }
  };

  const isDummyBirthData = (val?: string | null) => {
    if (!val) return true;
    const lower = val.toLowerCase().trim();
    return (
      lower === 'india' ||
      lower === 'new delhi, india' ||
      lower === 'indore, madhya pradesh, india' ||
      lower === '1998-05-10' ||
      lower === '1996-11-14' ||
      lower === '06:00' ||
      lower === '07:30' ||
      lower === '+91 98765 43210' ||
      lower === '+919876543210' ||
      lower === '+917089390239'
    );
  };

  const parseTimeOfBirth = (val: string) => {
    if (!val) return { time: '', period: 'AM' as const };
    const upper = val.toUpperCase().trim();
    if (upper.includes('PM')) {
      return { time: upper.replace('PM', '').trim(), period: 'PM' as const };
    }
    if (upper.includes('AM')) {
      return { time: upper.replace('AM', '').trim(), period: 'AM' as const };
    }
    const parts = upper.split(':');
    if (parts.length >= 2) {
      const h = parseInt(parts[0], 10);
      const m = parts[1].slice(0, 2);
      if (!isNaN(h)) {
        if (h >= 12) {
          const h12 = h > 12 ? h - 12 : 12;
          return {
            time: `${h12.toString().padStart(2, '0')}:${m}`,
            period: 'PM' as const,
          };
        } else {
          const h12 = h === 0 ? 12 : h;
          return {
            time: `${h12.toString().padStart(2, '0')}:${m}`,
            period: 'AM' as const,
          };
        }
      }
    }
    return { time: val.trim(), period: 'AM' as const };
  };

  const handleTobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9:]/g, '');
    if (val.length === 2 && !val.includes(':') && !tob.includes(':')) {
      val = val + ':';
    }
    if (val.length > 5) val = val.slice(0, 5);
    setTob(val);
  };

  // Populate existing data when modal opens or user updates
  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setDob(user.dateOfBirth || '');
      const parsedTob = parseTimeOfBirth(user.timeOfBirth || '');
      setTob(parsedTob.time);
      setTimePeriod(parsedTob.period);
      setPob(user.placeOfBirth || '');
      setGender((user.gender as any) || 'Male');
      setZodiacSign(user.zodiacSign || 'Aries');
      setGotra(user.gotra || '');
      setError('');
      setSuccessMsg('');
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Validation
    if (!name.trim()) {
      setError(t('Please enter your full name.', 'कृपया अपना पूरा नाम दर्ज करें।'));
      return;
    }
    if (!dob) {
      setError(t('Please select your Date of Birth.', 'कृपया अपनी जन्म तिथि चुनें।'));
      return;
    }
    if (!tob && !isTobApprox) {
      setError(t('Please enter your Time of Birth.', 'कृपया अपना जन्म समय दर्ज करें।'));
      return;
    }
    if (!pob.trim()) {
      setError(t('Please enter your Place of Birth (City, State/Country).', 'कृपया अपना जन्म स्थान (शहर, राज्य/देश) दर्ज करें।'));
      return;
    }
    if (!phone.trim() && !email.trim()) {
      setError(t('Please provide at least a WhatsApp phone number or email.', 'कृपया कम से कम व्हाट्सएप नंबर या ईमेल प्रदान करें।'));
      return;
    }

    setLoading(true);

    try {
      const token = getAuthToken();
      const backendBase = (
        process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api'
      ).replace(/\/api\/?$/, '');

      const payload = {
        name: name.trim(),
        dateOfBirth: dob,
        timeOfBirth: isTobApprox ? '12:00 (Approx)' : (tob.trim() ? (tob.includes('AM') || tob.includes('PM') ? tob.trim() : `${tob.trim()} ${timePeriod}`) : ''),
        placeOfBirth: pob.trim(),
        zodiacSign,
        gender,
        gotra: gotra.trim(),
        phone: phone.trim() || undefined,
        email: email.trim().toLowerCase() || undefined,
        primaryQuery,
      };

      let updatedUserData: any = null;

      if (token) {
        const res = await fetch(`${backendBase}/api/users/me`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (res.ok && data.user) {
          updatedUserData = data.user;
        } else if (!res.ok) {
          const errText = Array.isArray(data.message) ? data.message.join(', ') : data.message || 'Failed to update profile';
          throw new Error(errText);
        }
      }

      // If backend was offline or payload succeeded, merge with local user object
      const mergedUser = {
        ...(user || {}),
        ...payload,
        ...(updatedUserData || {}),
        isProfileComplete: true,
      };

      // Save to localStorage & broadcast
      localStorage.setItem('astro_user', JSON.stringify(mergedUser));
      sessionStorage.setItem('profile_prompt_dismissed', 'true');

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('astro-auth-change', {
            detail: { user: mergedUser, token },
          })
        );
      }

      setSuccessMsg(
        t(
          'Vedic Kundli profile completed successfully! Your planetary chart is consecrated.',
          'वैदिक कुंडली प्रोफाइल सफलतापूर्वक पूर्ण हुई! आपकी जन्म पत्रिका तैयार है।'
        )
      );

      if (onSuccess) {
        onSuccess(mergedUser);
      }

      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err: any) {
      setError(err.message || 'Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('profile_prompt_dismissed', 'true');
    onClose();
  };

  return (
    <div
      data-lenis-prevent="true"
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={handleDismiss}
    >
      <div
        data-lenis-prevent="true"
        onWheel={handleContainerWheel}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl border border-amber-300/80 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Sacred Header */}
        <div className="relative p-6 sm:p-7 bg-gradient-to-r from-[#4A151B] via-[#6B1E26] to-[#4A151B] text-white rounded-t-3xl overflow-hidden shrink-0">
          {/* Subtle Golden Mandala Watermark */}
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-6 w-40 h-40 opacity-15 pointer-events-none select-none">
            <Compass className="w-full h-full text-amber-200 animate-spin" style={{ animationDuration: '60s' }} />
          </div>

          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-[11px] font-bold tracking-wider uppercase mb-2">
                <Compass className="w-3.5 h-3.5 text-amber-300" />
                <span>{t('Vedic Janam Kundli Setup', 'वैदिक जन्म कुंडली सेटअप')}</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-wide">
                {t('Complete Your Sacred Profile', 'अपनी जन्म प्रोफाइल पूर्ण करें')}
              </h2>
              <p className="text-xs sm:text-sm text-amber-100/90 mt-1 max-w-lg leading-relaxed">
                {t(
                  'Accurate birth date, time, and city are essential for Dr. Pandit Vishal Dubey to calculate your exact Lagna, planetary Dasha, and provide authentic guidance.',
                  'सटीक जन्म तिथि, समय एवं जन्म स्थान से ही पूज्य गुरुजी आपकी लग्न पत्रिका, ग्रह गोचर एवं सटीक उपाय निर्धारित कर पाते हैं।'
                )}
              </p>
            </div>

            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
              title={t('Remind me later', 'बाद में करें')}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form
          ref={formRef}
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
          onSubmit={handleSubmit}
          className="p-5 sm:p-7 space-y-4 flex-1 min-h-0 overflow-y-auto overscroll-contain modal-scrollbar pr-3 sm:pr-5"
        >
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {/* Row 1: Full Name & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t('Full Name', 'पूरा नाम')} <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('Full Name', 'पूरा नाम')}
                className="w-full h-[46px] px-3.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-hidden bg-white text-stone-800 placeholder-stone-400 transition-all"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t('Gender', 'लिंग')} <span className="text-rose-600">*</span>
              </label>
              <div className="w-full h-[46px] px-4 flex items-center gap-6 rounded-xl border border-stone-200 bg-white">
                {(['Male', 'Female'] as const).map((g) => (
                  <label
                    key={g}
                    className="inline-flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-medium text-stone-700 hover:text-stone-900 select-none"
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={gender === g}
                      onChange={() => setGender(g)}
                      className="w-4 h-4 border-stone-300 text-[#5B0D15] focus:ring-[#5B0D15] accent-[#5B0D15] cursor-pointer"
                    />
                    <span>{g === 'Male' ? t('Male', 'पुरुष') : t('Female', 'महिला')}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Place of Birth & WhatsApp Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Place of Birth */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t('Place of Birth', 'जन्म स्थान')} <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={pob}
                onChange={(e) => setPob(e.target.value)}
                placeholder={t('Search and select place of birth', 'जन्म स्थान खोजें व चुनें')}
                className="w-full h-[46px] px-3.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-hidden bg-white text-stone-800 placeholder-stone-400 transition-all"
              />
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t('WhatsApp Number', 'व्हाट्सएप नंबर')} <span className="text-rose-600">*</span>
              </label>
              <div className="relative flex items-center h-[46px] rounded-xl border border-stone-200 bg-white overflow-hidden focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-200 transition-all">
                <div className="flex items-center gap-1 px-3 text-xs sm:text-sm text-stone-700 font-medium border-r border-stone-200 shrink-0 bg-stone-50/60 h-full select-none">
                  <span>🇮🇳</span>
                  <span>+91</span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 ml-0.5" />
                </div>
                <input
                  type="tel"
                  value={phone.replace(/^\+91\s*/, '')}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setPhone(raw ? `+91 ${raw}` : '');
                  }}
                  placeholder={t('WhatsApp Number', 'व्हाट्सएप नंबर')}
                  className="w-full h-full px-3 text-xs sm:text-sm outline-hidden text-stone-800 placeholder-stone-400 bg-transparent"
                />
              </div>
              <p className="text-[11px] text-amber-900/80 italic mt-1 font-serif">
                {t('Your Report will be sent on this number', 'आपकी रिपोर्ट इसी नंबर पर भेजी जाएगी')}
              </p>
            </div>
          </div>

          {/* Row 3: Date of Birth & Time of Birth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t('Date of Birth', 'जन्म तिथि')} <span className="text-rose-600">*</span>
              </label>
              <div className="relative flex items-center h-[46px] rounded-xl border border-stone-200 bg-white focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-200 transition-all">
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full h-full px-3.5 text-xs sm:text-sm text-stone-800 outline-hidden bg-transparent rounded-xl"
                />
              </div>
            </div>

            {/* Time of Birth */}
            <div>
              <div className="flex items-center gap-1 mb-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  {t('Time of Birth', 'जन्म समय')}
                </label>
                <span
                  className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-stone-300 text-[10px] text-stone-600 font-bold cursor-help"
                  title={t('Accurate time is essential for Lagna chart calculation', 'सटीक लग्न निर्धारण हेतु आवश्यक')}
                >
                  i
                </span>
                <span className="text-rose-600 text-xs">*</span>
              </div>
              <div className="relative flex items-center justify-between h-[46px] px-3.5 rounded-xl border border-stone-200 bg-white focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-200 transition-all">
                <input
                  type="text"
                  disabled={isTobApprox}
                  value={tob}
                  onChange={handleTobChange}
                  placeholder="HH : MM"
                  className="w-full h-full text-xs sm:text-sm text-stone-800 outline-hidden bg-transparent placeholder-stone-400 disabled:opacity-50 font-mono tracking-wider"
                />
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    type="button"
                    disabled={isTobApprox}
                    onClick={() => setTimePeriod('AM')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      timePeriod === 'AM'
                        ? 'bg-[#FFF6E9] border-amber-400 text-amber-900 shadow-2xs'
                        : 'bg-stone-50 border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    disabled={isTobApprox}
                    onClick={() => setTimePeriod('PM')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      timePeriod === 'PM'
                        ? 'bg-[#FFF6E9] border-amber-400 text-amber-900 shadow-2xs'
                        : 'bg-stone-50 border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5">
                <input
                  type="checkbox"
                  id="approxTimeCheckbox"
                  checked={isTobApprox}
                  onChange={(e) => setIsTobApprox(e.target.checked)}
                  className="w-4 h-4 rounded-sm border-stone-300 text-[#5B0D15] focus:ring-[#5B0D15] accent-[#5B0D15] cursor-pointer"
                />
                <label
                  htmlFor="approxTimeCheckbox"
                  className="text-xs text-stone-600 cursor-pointer select-none"
                >
                  {t("I don’t know accurate time", "मुझे सटीक समय ज्ञात नहीं है")}
                </label>
              </div>
            </div>
          </div>

          {/* Row 4: Email Address (Full Width) */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              {t('Email Address', 'ईमेल पता')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full h-[46px] px-3.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-hidden bg-white text-stone-800 placeholder-stone-400 transition-all"
            />
          </div>

          {/* Row 5: Vedic Rashi & Gotra */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Zodiac / Moon Sign */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t('Zodiac / Moon Sign (Rashi)', 'राशि / चंद्र राशि')}
              </label>
              <select
                value={zodiacSign}
                onChange={(e) => setZodiacSign(e.target.value)}
                className="w-full h-[46px] px-3.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-hidden bg-white text-stone-800 transition-all"
              >
                {ZODIAC_SIGNS.map((z) => (
                  <option key={z.value} value={z.value}>
                    {z.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Gotra */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t('Gotra (Lineage)', 'गोत्र')}{' '}
                <span className="text-stone-400 font-normal">
                  ({t('Optional', 'वैकल्पिक')})
                </span>
              </label>
              <input
                type="text"
                value={gotra}
                onChange={(e) => setGotra(e.target.value)}
                placeholder="e.g. Kashyap, Bhardwaj"
                className="w-full h-[46px] px-3.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-hidden bg-white text-stone-800 placeholder-stone-400 transition-all"
              />
            </div>
          </div>

          {/* Row 6: Primary Guidance Focus */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              {t('Primary Guidance Focus', 'परामर्श का मुख्य विषय')}
            </label>
            <select
              value={primaryQuery}
              onChange={(e) => setPrimaryQuery(e.target.value)}
              className="w-full h-[46px] px-3.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-hidden bg-white text-stone-800 transition-all"
            >
              <option value="Career & Wealth">
                {t('Career, Business & Wealth (करियर व धन लाभ)', 'Career, Business & Wealth (करियर व धन लाभ)')}
              </option>
              <option value="Marriage & Love">
                {t('Marriage, Match Making & Love (विवाह व प्रेम संबंध)', 'Marriage, Match Making & Love (विवाह व प्रेम संबंध)')}
              </option>
              <option value="Health & Longevity">
                {t('Health, Healing & Protection (स्वास्थ्य व दीर्घायु)', 'Health, Healing & Protection (स्वास्थ्य व दीर्घायु)')}
              </option>
              <option value="Family & Children">
                {t('Family Peace & Children (संतान व गृह शांति)', 'Family Peace & Children (संतान व गृह शांति)')}
              </option>
              <option value="Spiritual & Moksha">
                {t('Spiritual Growth & Kundli Dosh (आध्यात्मिक व दोष निवारण)', 'Spiritual Growth & Kundli Dosh (आध्यात्मिक व दोष निवारण)')}
              </option>
            </select>
          </div>

          {/* Privacy Note */}
          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-start gap-2 text-[11px] text-amber-900 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              {t(
                '100% Confidential & Sacred. Your birth details are strictly protected and only accessed by verified Vedic Acharyas for consultation purposes.',
                '100% गोपनीय व सुरक्षित। आपकी जन्म कुंडली का विवरण केवल अधिकृत वैदिक आचार्यों द्वारा परामर्श के लिए ही उपयोग किया जाता है।'
              )}
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 border-t border-stone-100">
            <button
              type="button"
              onClick={handleDismiss}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              {t('Remind Me Later', 'बाद में करें')}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-gradient-to-r from-[#5B0D15] via-[#7B121C] to-[#5B0D15] hover:from-[#7B121C] hover:to-[#5B0D15] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>{t('Saving Profile...', 'सहेज रहे हैं...')}</span>
                </>
              ) : (
                <>
                  
                  <span>{t('Save & Unlock Janam Kundli', 'सहेजें व कुंडली अनलॉक करें')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

