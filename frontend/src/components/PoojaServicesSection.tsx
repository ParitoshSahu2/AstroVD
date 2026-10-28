'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SERVICES_CATALOGUE, ServiceItem } from '../data/servicesData';
import { SERVICES_TRANSLATIONS } from '../data/servicesTranslations';
import { MotionServiceCard } from './MotionServiceCard';
import { SpatialServiceModal } from './SpatialServiceModal';

export const PoojaServicesSection: React.FC = () => {
  const { t, language } = useLanguage();
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const openWhatsAppClaim = () => {
    window.open(
      'https://wa.me/919876543210?text=Hello%20Dr.%20Vishal%20Dubey,%20I%20would%20like%20to%20claim%20the%20Free%20Birth%20Chart%20for%20Baby%20Girl%20below%209%20years%20old.',
      '_blank'
    );
  };

  const openWhatsApp = (title: string) => {
    const text = encodeURIComponent(
      `Pranam Guruji, I am interested in knowing more about ${title} service.`
    );
    window.open(`https://wa.me/919876543210?text=${text}`, '_blank');
  };

  // 6 Authentic high-relevance services
  const FEATURED_SERVICE_IDS = [
    'astrological_consultation',
    'marriage_match_making',
    'grah_pravesh_vaastu',
    'navgrah_shanti_poojan',
    'mangal_dosh_shanti',
    'birth_chart_kundli',
  ];

  const featuredServices = FEATURED_SERVICE_IDS
    .map((id) => SERVICES_CATALOGUE.find((s) => s.id === id))
    .filter((s): s is ServiceItem => Boolean(s));

  return (
    <section id="pooja-services" className="relative w-full bg-[#FAF7F2] py-20 lg:py-24 px-4 sm:px-6 lg:px-12 overflow-hidden selection:bg-amber-400">
      {/* Background Subtle Mandala */}
      <img
        src="/ornaments/clean_mandala.png"
        alt="Mandala watermark"
        className="absolute top-1/2 -right-32 -translate-y-1/2 w-80 sm:w-[420px] h-auto object-contain pointer-events-none opacity-20 select-none"
      />

      <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12 relative z-10">
        {/* ================= 1. SECTION HEADER ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/60 pb-6">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#4A151B] tracking-[0.03em] flex items-center gap-2">
            <span>{t('OUR ASTROLOGY & POOJA SERVICES', 'हमारी ज्योतिष एवं पूजा सेवाएं')}</span>
            <span className="text-amber-600 text-lg sm:text-xl">✦</span>
          </h2>

          <Link
            href="/services"
            className="px-5 py-2.5 rounded-full bg-white/90 hover:bg-amber-50 border border-stone-300 hover:border-amber-400 text-stone-800 hover:text-[#5B0D15] text-xs sm:text-sm font-semibold shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>{t('View All 28+ Services', 'सभी 28+ सेवाएं देखें')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* ================= 2. SPECIAL BLESSING BANNER ================= */}
        <div className="rounded-3xl border border-dashed border-rose-300 bg-gradient-to-r from-rose-50/80 via-[#FFF9F6] to-amber-50/60 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          {/* Left Content */}
          <div className="flex items-start gap-4 sm:gap-5">
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

        {/* ================= 3. FEATURED AUTHENTIC SERVICES CARDS GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-6 lg:gap-7 items-stretch pt-2">
          {featuredServices.map((item) => {
            const tr = language === 'hi' ? SERVICES_TRANSLATIONS[item.id] : null;
            const displayTitle = tr ? tr.titleHi : item.title;
            const displayCatTag = tr ? tr.categoryTagHi : item.categoryTag;
            const displayPandit = tr ? tr.panditHi : item.pandit;
            const displayDesc = tr ? tr.descHi : item.desc;
            const displayBadge = tr && tr.badgeHi ? tr.badgeHi : item.badge;


            return (
              <MotionServiceCard
                key={item.id}
                item={item}
                displayTitle={displayTitle}
                displayCatTag={displayCatTag}
                displayPandit={displayPandit}
                displayDesc={displayDesc}
                displayBadge={displayBadge}
                onSelectService={(srv) => setSelectedService(srv)}
                t={t}
                language={language}
              />
            );
          })}

        </div>

        {/* ================= 4. EXPLORE MORE SERVICES BUTTON ================= */}
        <div className="pt-6 sm:pt-8 flex justify-center">
          <Link
            href="/services"
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#5B0D15] via-[#7B121C] to-[#5B0D15] hover:from-[#7B121C] hover:to-[#5B0D15] text-white font-bold text-sm sm:text-base shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2.5 group cursor-pointer active:scale-95"
          >
            <span>{t('Explore More Services', 'और भी सेवाएं देखें')}</span>
            <ArrowRight className="w-4 h-4 text-amber-300 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* VisionOS Spatial Modal Preview */}
      {selectedService && (() => {
        const tr = language === 'hi' ? SERVICES_TRANSLATIONS[selectedService.id] : null;
        const displayTitle = tr ? tr.titleHi : selectedService.title;
        const displayCatTag = tr ? tr.categoryTagHi : selectedService.categoryTag;
        const displayPandit = tr ? tr.panditHi : selectedService.pandit;
        const displayDesc = tr ? tr.descHi : selectedService.desc;
        const displayBadge = tr && tr.badgeHi ? tr.badgeHi : selectedService.badge;

        return (
          <SpatialServiceModal
            service={selectedService}
            displayTitle={displayTitle}
            displayCatTag={displayCatTag}
            displayPandit={displayPandit}
            displayDesc={displayDesc}
            displayBadge={displayBadge}
            isOpen={!!selectedService}
            onClose={() => setSelectedService(null)}
            onWhatsApp={openWhatsApp}
            t={t}
            language={language}
          />
        );
      })()}
    </section>
  );
};
