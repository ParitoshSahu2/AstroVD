'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Compass,
  Heart,
  ShieldCheck,
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
  const [isTobApprox, setIsTobApprox] = useState(false);
  const [pob, setPob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [zodiacSign, setZodiacSign] = useState('Aries');
  const [gotra, setGotra] = useState('');
  const [primaryQuery, setPrimaryQuery] = useState('Career & Wealth');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Populate existing data when modal opens or user updates
  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setDob(user.dateOfBirth || '');
      setTob(user.timeOfBirth || '');
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
        timeOfBirth: isTobApprox ? '12:00 (Approx)' : tob,
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
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-amber-300/80 flex flex-col"
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
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
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
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5 flex-1 overflow-y-auto">
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

          {/* Section 1: Basic Identity */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 border-b border-amber-100 pb-1 flex items-center gap-1.5">
              <span>✦</span> {t('Personal Details', 'व्यक्तिगत विवरण')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t('Full Name', 'पूरा नाम')} <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Paritosh Sahu"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-hidden bg-stone-50/50"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t('Gender', 'लिंग')} <span className="text-rose-600">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Male', 'Female', 'Other'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        gender === g
                          ? 'bg-[#5B0D15] text-white border-[#5B0D15] shadow-xs'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {g === 'Male' ? t('Male', 'पुरुष') : g === 'Female' ? t('Female', 'महिला') : t('Other', 'अन्य')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Row: WhatsApp + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* WhatsApp Phone */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t('WhatsApp / Mobile Number', 'व्हाट्सएप / मोबाइल नंबर')} <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-hidden bg-stone-50/50 font-mono"
                  />
                </div>
                <p className="text-[10px] text-stone-500 mt-0.5">
                  {t('Consultation call links & Kundli PDFs are shared here', 'परामर्श लिंक व कुंडली इसी नंबर पर भेजी जाती है')}
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t('Email Address', 'ईमेल पता')} <span className="text-stone-400 font-normal">({t('Optional', 'वैकल्पिक')})</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-hidden bg-stone-50/50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Vedic Astrological Birth Coordinates */}
          <div className="space-y-3.5 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 border-b border-amber-100 pb-1 flex items-center gap-1.5">
              <span>✦</span> {t('Birth Coordinates (Kundli Essentials)', 'जन्म विवरण (कुंडली निर्माण हेतु अनिवार्य)')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* DOB */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t('Date of Birth', 'जन्म तिथि')} <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-600" />
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-hidden bg-stone-50/50 font-mono"
                  />
                </div>
              </div>

              {/* TOB */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-stone-700">
                    {t('Time of Birth', 'जन्म समय')} <span className="text-rose-600">*</span>
                  </label>
                  <label className="text-[11px] text-stone-500 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isTobApprox}
                      onChange={(e) => setIsTobApprox(e.target.checked)}
                      className="rounded-sm border-stone-300 text-amber-600 focus:ring-amber-400"
                    />
                    <span>{t('Approximate time', 'अनुमानित समय')}</span>
                  </label>
                </div>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-600" />
                  <input
                    type="time"
                    disabled={isTobApprox}
                    value={tob}
                    onChange={(e) => setTob(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-hidden bg-stone-50/50 font-mono disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Place of Birth */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {t('Place of Birth (City, State, Country)', 'जन्म स्थान (शहर, राज्य, देश)')} <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-600" />
                <input
                  type="text"
                  required
                  value={pob}
                  onChange={(e) => setPob(e.target.value)}
                  placeholder="e.g. Varanasi, Uttar Pradesh, India"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-hidden bg-stone-50/50"
                />
              </div>
              <p className="text-[10px] text-stone-500 mt-0.5">
                {t('Required for precise latitude/longitude planetary calculations', 'अक्षांश एवं देशांतर द्वारा सटीक लग्न निर्धारण हेतु आवश्यक')}
              </p>
            </div>

            {/* Zodiac Sign & Gotra */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Zodiac / Moon Sign */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t('Zodiac / Moon Sign (Rashi)', 'राशि / चंद्र राशि')}
                </label>
                <select
                  value={zodiacSign}
                  onChange={(e) => setZodiacSign(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-hidden bg-stone-50/50"
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
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t('Gotra (Lineage)', 'गोत्र')} <span className="text-stone-400 font-normal">({t('Optional', 'वैकल्पिक')})</span>
                </label>
                <input
                  type="text"
                  value={gotra}
                  onChange={(e) => setGotra(e.target.value)}
                  placeholder="e.g. Kashyap, Bhardwaj"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-hidden bg-stone-50/50"
                />
              </div>
            </div>

            {/* Primary Guidance Area */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {t('Primary Guidance Focus', 'परामर्श का मुख्य विषय')}
              </label>
              <select
                value={primaryQuery}
                onChange={(e) => setPrimaryQuery(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-hidden bg-stone-50/50"
              >
                <option value="Career & Wealth">{t('Career, Business & Wealth (करियर व धन लाभ)', 'Career, Business & Wealth (करियर व धन लाभ)')}</option>
                <option value="Marriage & Love">{t('Marriage, Match Making & Love (विवाह व प्रेम संबंध)', 'Marriage, Match Making & Love (विवाह व प्रेम संबंध)')}</option>
                <option value="Health & Longevity">{t('Health, Healing & Protection (स्वास्थ्य व दीर्घायु)', 'Health, Healing & Protection (स्वास्थ्य व दीर्घायु)')}</option>
                <option value="Family & Children">{t('Family Peace & Children (संतान व गृह शांति)', 'Family Peace & Children (संतान व गृह शांति)')}</option>
                <option value="Spiritual & Moksha">{t('Spiritual Growth & Kundli Dosh (आध्यात्मिक व दोष निवारण)', 'Spiritual Growth & Kundli Dosh (आध्यात्मिक व दोष निवारण)')}</option>
              </select>
            </div>
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
                  <Sparkles className="w-4 h-4 text-amber-300" />
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

