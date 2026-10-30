'use client';

import React from 'react';
import {
  Compass,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck,
  User,
  Download,
  Edit3,
  Sun,
  Moon,
} from 'lucide-react';
import { UserProfile, formatZodiacName } from '../types';

interface DashboardKundliTabProps {
  profile: UserProfile;
  onEditKundli: () => void;
  t: (en: string, hi: string) => string;
}

export const DashboardKundliTab: React.FC<DashboardKundliTabProps> = ({
  profile,
  onEditKundli,
  t,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#3B1E22]">
            {t('Janam Kundli & Vedic Astrology Chart', 'जन्म कुंडली एवं वैदिक जन्म विवरण')}
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            {t(
              'Verified celestial coordinates used by Varanasi Acharyas to forecast Dasha, Gochar, and planetary yogas.',
              'काशी के वैदिक आचार्यों द्वारा जन्म लग्न, दशा, गोचर एवं राजयोग विश्लेषण हेतु सत्यापित विवरण।'
            )}
          </p>
        </div>

        <button
          onClick={onEditKundli}
          className="px-5 py-2.5 rounded-full bg-[#5B0D15] hover:bg-[#72111c] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 whitespace-nowrap self-start sm:self-auto cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5 text-amber-300" />
          <span>{t('Edit Birth Coordinates', 'जन्म विवरण संशोधित करें')}</span>
        </button>
      </div>

      {/* Main Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Birth Coordinates Card */}
        <div className="md:col-span-7 bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-700" />
              <h3 className="font-serif text-lg font-bold text-[#3B1E22]">
                {t('Natal Coordinates', 'मूल जन्म विवरण')}
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('Verified', 'सत्यापित')}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200/60 space-y-1">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                {t('Full Name', 'पूरा नाम')}
              </span>
              <p className="font-semibold text-sm text-[#3B1E22]">{profile.name}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200/60 space-y-1">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                {t('Sun Sign / Rashi', 'राशि / लग्न')}
              </span>
              <p className="font-serif font-bold text-sm text-amber-900">
                {formatZodiacName(profile.zodiacSign)}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200/60 space-y-1">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                <span>{t('Date of Birth', 'जन्म तिथि')}</span>
              </span>
              <p className="font-semibold text-sm text-[#3B1E22]">
                {profile.dateOfBirth || t('Not added', 'अप्राप्त')}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200/60 space-y-1">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>{t('Time of Birth', 'जन्म समय')}</span>
              </span>
              <p className="font-semibold text-sm text-[#3B1E22]">
                {profile.timeOfBirth || t('Not added', 'अप्राप्त')}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200/60 space-y-1 sm:col-span-2">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-700" />
                <span>{t('Place of Birth (Latitude & Longitude)', 'जन्म स्थान (अक्षांश व देशांतर)')}</span>
              </span>
              <p className="font-semibold text-sm text-[#3B1E22]">
                {profile.placeOfBirth || t('Not added', 'अप्राप्त')}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 leading-relaxed">
              <strong>{t('Accurate Coordinates Importance:', 'सटीक समय का महत्व:')}</strong>{' '}
              {t(
                'Even a 4-minute variance in birth time shifts your Navamsha (D9) ascendant degree. Keep this verified to ensure 100% accurate predictions with Guruji.',
                'जन्म समय में 4 मिनट का अंतर भी नवांश लग्न को बदल देता है। सटीक परामर्श हेतु अपने जन्म समय की पुष्टि अवश्य रखें।'
              )}
            </div>
          </div>
        </div>

        {/* Right: Astrological Insights & Report Downloader */}
        <div className="md:col-span-5 bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="pb-3 border-b border-stone-100 flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-600" />
            <h3 className="font-serif text-lg font-bold text-[#3B1E22]">
              {t('Planetary Alignment', 'ग्रह गोचर एवं दशा')}
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
              <span className="font-bold text-stone-800 block">
                {t('Ruling Planetary Deity (Swami Graha)', 'स्वामी ग्रह')}
              </span>
              <p className="text-stone-600">
                {t(
                  'Sun (Surya Dev) & Jupiter (Brihaspati) bestow leadership, clarity, and prosperity on your lagna chart.',
                  'सूर्य देव एवं बृहस्पति ग्रह आपकी कुंडली में यश, बुद्धि एवं समृद्धि कारक हैं।'
                )}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
              <span className="font-bold text-stone-800 block">
                {t('Benefic Yogas in Horoscope', 'कुंडली में प्रमुख योग')}
              </span>
              <p className="text-stone-600">
                {t(
                  'Budhaditya Yoga & Gajakesari Yoga present auspicious opportunities in education, profession, and trade.',
                  'बुधादित्य योग एवं गजकेसरी योग व्यापार एवं कार्यक्षेत्र में प्रगति के शुभ अवसर प्रदान करते हैं।'
                )}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => window.print()}
              className="w-full py-3 rounded-full border border-amber-300 bg-amber-50 hover:bg-amber-100 text-[#5B0D15] font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{t('Download Kundli Summary (PDF)', 'कुंडली विवरण डाउनलोड करें')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardKundliTab;
