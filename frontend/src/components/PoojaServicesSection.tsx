'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Flame, Sparkles, Shield, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const PoojaServicesSection: React.FC = () => {
  const { t } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);

  const openWhatsAppClaim = () => {
    window.open(
      'https://wa.me/919876543210?text=Hello%20Dr.%20Vishal%20Dubey,%20I%20would%20like%20to%20claim%20the%20Free%20Birth%20Chart%20for%20Baby%20Girl%20below%209%20years%20old.',
      '_blank'
    );
  };

  const poojaList = [
    {
      title: t('Maha Mrityunjaya Jaap', 'महामृत्युंजय जाप अनुष्ठान'),
      benefit: t('Bestows health, vitality & protection from malefic afflictions.', 'दीर्घायु, आरोग्य एवं अकाल मृत्यु व गंभीर रोगों से दिव्य रक्षा।'),
      priests: t('5 Vedic Priests', '5 वैदिक ब्राह्मण'),
      icon: '🕉️',
    },
    {
      title: t('Navgrah Shanti Havan', 'नवग्रह शांति महाहवन'),
      benefit: t('Harmonizes all 9 planetary energies and dissolves Graha doshas.', 'समस्त 9 ग्रहों की अनुकूलता, ग्रह दोष शांति व सुख-समृद्धि।'),
      priests: t('7 Vedic Priests', '7 वैदिक ब्राह्मण'),
      icon: '☀️',
    },
    {
      title: t('Kaal Sarp Dosh Nivaran', 'कालसर्प दोष निवारण पूजा'),
      benefit: t('Dissolves karmic blocks, delays in career and mental stress.', 'करियर में आ रही बाधाएं, मानसिक तनाव व कर्म बंधनों का नाश।'),
      priests: t('Specialized Acharya', 'विशेषज्ञ आचार्य'),
      icon: '🐍',
    },
    {
      title: t('Mangal Dosh & Vivah Shanti', 'मंगल दोष एवं विवाह शांति'),
      benefit: t('Eliminates marital obstacles, relationship misunderstandings.', 'विवाह में विलंब, वैवाहिक कलह एवं मांगलिक बाधा निवारण।'),
      priests: t('Vedic Acharyas', 'वैदिक आचार्य मंडल'),
      icon: '🔴',
    },
    {
      title: t('Shree Suktam & Mahalakshmi Yagya', 'श्री सूक्तम एवं महालक्ष्मी यज्ञ'),
      benefit: t('Attracts perpetual financial prosperity, abundance & auspiciousness.', 'निरंतर धन-समृद्धि, व्यापार में अकूत लाभ एवं आर्थिक संपन्नता।'),
      priests: t('Kashi Scholars', 'काशी के विद्वान पंडित'),
      icon: '🪷',
    },
    {
      title: t('Vastu Dosh Shanti Puja', 'वास्तु दोष शांति पूजा'),
      benefit: t('Purifies home/office energy, dispels negative planetary vibes.', 'गृह व व्यापार स्थल की ऊर्जा शुद्धिकरण एवं नकारात्मकता का नाश।'),
      priests: t('Vastu Specialist', 'वास्तु शास्त्री'),
      icon: '🏛️',
    },
  ];

  return (
    <section id="pooja-services" className="relative w-full bg-[#FAF7F2] py-20 lg:py-24 px-4 sm:px-6 lg:px-12 overflow-hidden selection:bg-amber-400">
      
      {/* Background Subtle Mandala */}
      <img
        src="/ornaments/clean_mandala.png"
        alt="Mandala watermark"
        className="absolute top-1/2 -right-32 -translate-y-1/2 w-80 sm:w-[420px] h-auto object-contain pointer-events-none opacity-20 select-none"
      />

      <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12 relative z-10">
        
        {/* ================= 1. SECTION HEADER (FROM IMAGE 1) ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/60 pb-6">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#4A151B] tracking-[0.03em] flex items-center gap-2">
            <span>{t('OUR ASTROLOGY & POOJA SERVICES', 'हमारी ज्योतिष एवं पूजा सेवाएं')}</span>
            <span className="text-amber-600 text-lg sm:text-xl">✦</span>
          </h2>

          <button
            onClick={() => {
              const el = document.getElementById('services');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-5 py-2.5 rounded-full bg-white/90 hover:bg-amber-50 border border-stone-300 hover:border-amber-400 text-stone-800 hover:text-[#5B0D15] text-xs sm:text-sm font-semibold shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>{t('View All 28+ Services', 'सभी 28+ सेवाएं देखें')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ================= 2. SPECIAL BLESSING BANNER (FROM IMAGE 1) ================= */}
        <div className="rounded-3xl border border-dashed border-rose-300 bg-gradient-to-r from-rose-50/80 via-[#FFF9F6] to-amber-50/60 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          
          {/* Left Content */}
          <div className="flex items-start gap-4 sm:gap-5">
            {/* Red Gift Bow Icon */}
            <div className="text-3xl sm:text-4xl shrink-0 pt-0.5">
              🎀
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-0.5 rounded-full bg-pink-100 text-pink-700 font-bold text-[10px] sm:text-[11px] uppercase tracking-wider">
                {t('SPECIAL DIVINE BLESSING', 'विशेष ईश्वरीय आशीर्वाद व सेवा')}
              </span>

              <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-[#2A1810] tracking-wide leading-snug">
                {t('FREE BIRTH CHART FOR BABY GIRL BELOW 9 YEARS OLD', '9 वर्ष से कम उम्र की बालिकाओं के लिए निःशुल्क जन्म कुंडली')}
              </h3>

              <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
                {t(
                  'In honor of Devi Swaroop Kanya Poojan, Dr. Pandit Vishal Dubey provides completely complimentary Janampatri creation and planetary analysis for young daughters.',
                  'देवी स्वरूपा कन्या पूजन परंपरा के अंतर्गत पूज्य डॉ. पंडित विशाल दुबे द्वारा 9 वर्ष तक की बालिकाओं की जन्म कुंडली एवं ग्रह विचार पूर्णतः निःशुल्क प्रदान किया जाता है।'
                )}
              </p>
            </div>
          </div>

          {/* Right Action Button */}
          <div className="shrink-0 w-full sm:w-auto">
            <Link
              href="/appointment?service=free_kundli"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#A2671A] hover:bg-[#8B5612] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t('Claim Free Kundli', 'निःशुल्क कुंडली प्राप्त करें')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

        {/* ================= 3. FEATURED POOJA & YAGYA RITUALS GRID ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 pt-2">
          {poojaList.map((pooja, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-3xl bg-white/80 border border-amber-200/80 hover:border-amber-400 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-2.5 rounded-2xl bg-amber-50 border border-amber-200/60">
                    {pooja.icon}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100/70 text-amber-900 border border-amber-200">
                    {pooja.priests}
                  </span>
                </div>

                <h4 className="font-serif font-bold text-base sm:text-lg text-[#2A1810] group-hover:text-[#800000] transition-colors">
                  {pooja.title}
                </h4>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {pooja.benefit}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-amber-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-amber-800">
                  {t('Vedic Vidhi & Samagri Included', 'शास्त्रोक्त विधि व पूजन सामग्री सहित')}
                </span>
                <Link
                  href="/appointment?service=general_puja"
                  className="text-xs font-bold text-[#800000] hover:text-[#500000] flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer"
                >
                  <span>{t('Book Sankalp', 'संकल्प लें')}</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>

    </section>
  );
};
