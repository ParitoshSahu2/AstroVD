'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Calendar } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const HeroSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="relative w-full min-h-[105vh] lg:min-h-[112vh] flex items-center overflow-hidden m-0 p-0">
      
      {/* Background Image: homepage_orig.png expanded to generously cover bottom and sides */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-no-repeat bg-[72%_bottom] sm:bg-[68%_bottom] lg:bg-[right_bottom] z-0 scale-105 origin-bottom"
        style={{
          backgroundImage: "url('/homepage_orig.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'right bottom',
          backgroundRepeat: 'no-repeat',
          filter: 'contrast(1.08) saturate(1.14) brightness(1.02)',
          transform: 'translateZ(0)',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
        }}
      />

      {/* Left-side subtle parchment gradient for text contrast on mobile/small screens without washing out portrait */}
      <div className="absolute inset-y-0 left-0 w-full lg:w-3/5 bg-gradient-to-r from-[#FAF7F2]/95 via-[#FAF7F2]/60 to-transparent lg:from-[#FAF7F2]/40 lg:via-transparent pointer-events-none z-0" />

      {/* Hero Content shifted gracefully to the left side */}
      <div className="relative z-10 w-full pl-6 sm:pl-10 md:pl-14 lg:pl-16 xl:pl-24 pr-6 pt-28 sm:pt-32 lg:pt-24 pb-16 flex items-center justify-start">
        
        <div className="w-full max-w-lg lg:max-w-xl space-y-6 text-left">
          
          {/* Main Headline - Exact 3-line breakdown matching reference screenshot */}
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[48px] xl:text-[54px] font-bold text-[#3B1E22] leading-[1.15] tracking-tight">
              {t('Guidance from the', 'ग्रहों का मार्गदर्शन,')}<br />
              <span className="text-[#800000] italic font-normal">{t('Stars, Grounded in', 'सत्य पर आधारित')}</span><br />
              {t('Truth.', 'विश्वसनीय ज्ञान।')}
            </h1>
          </div>

          {/* Concise, Poetic Subtitle - Exact 3 clean lines matching reference */}
          <p className="text-stone-700 text-xs sm:text-sm lg:text-[15.5px] font-normal leading-[1.65] max-w-[460px] lg:max-w-[480px]">
            {t(
              'Discover clarity for career, love, and life’s turning points through authentic Vedic horoscope reading, planetary alignment, and time-tested spiritual remedies.',
              'करियर, प्रेम, विवाह एवं जीवन के महत्वपूर्ण मोड़ों पर प्रामाणिक वैदिक कुंडली, ग्रह शांति एवं सिद्ध उपायों द्वारा स्पष्ट मार्गदर्शन प्राप्त करें।'
            )}
          </p>

          {/* Clean Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <Link
              href="/appointment"
              className="px-6 sm:px-7 py-3 rounded-full bg-[#520F16] hover:bg-[#68141d] text-amber-100 font-serif font-bold text-xs sm:text-sm shadow-xl shadow-rose-950/20 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-amber-300 stroke-[2]" />
              <span>{t('Book Consultation', 'परामर्श बुक करें')}</span>
              <span className="text-amber-300 ml-0.5 font-bold">→</span>
            </Link>

            <Link
              href="/services"
              className="px-5 sm:px-6 py-3 rounded-full bg-white hover:bg-stone-50 text-[#3B1E22] border border-amber-300/80 backdrop-blur-md font-serif font-semibold text-xs sm:text-sm shadow-sm hover:border-amber-400 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              <span>{t('Explore Services', 'सेवाएं देखें')}</span>
            </Link>
          </div>

        </div>

      </div>

    </section>
  );
};
