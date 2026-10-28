'use client';

import React from 'react';
import Image from 'next/image';
import { Navbar } from '../../components/Navbar';
import { AboutSection } from '../../components/AboutSection';
import { Footer } from '../../components/Footer';
import { useLanguage } from '../../context/LanguageContext';

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="relative min-h-screen flex flex-col justify-between w-full bg-[#FCF8ED] m-0 p-0 overflow-x-clip selection:bg-amber-400">
      <Navbar />

      {/* HERO BANNER SECTION (Panoramic full-bleed backdrop matching reference design) */}
      <section className="relative w-full bg-[#36170A] overflow-hidden pt-24 sm:pt-28 md:pt-30 pb-9 sm:pb-11 px-4 sm:px-6 lg:px-12 min-h-[220px] sm:min-h-[250px] flex items-center">
        {/* Background ambient gradient matching reference tone */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#36170A] via-[#36170A] to-[#2B0E06]" />

        {/* Full-bleed Ultra-HD panoramic backdrop: Sacred Vedic Diya, Puja, Hawan & Lineage */}
        <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
          <Image
            src="/consultation/consultation_hero_panoramic_hd.png"
            alt="Who We Are - Sacred Vedic Heritage & Lineage"
            fill
            priority
            quality={100}
            className="object-cover object-[right_center] md:object-[right_55%]"
          />
          {/* Confined left gradient vignette: protects text readability on left while leaving items 100% luminous with zero haze */}
          <div className="absolute inset-y-0 left-0 w-full sm:w-[65%] md:w-[54%] lg:w-[48%] bg-gradient-to-r from-[#36170A] via-[#36170A]/92 to-transparent" />
        </div>

        {/* Content container - Left Text Information (Clear, readable, with zero obstruction) */}
        <div className="relative max-w-7xl mx-auto w-full z-10">
          <div className="max-w-xl text-left space-y-2">
            <div className="tracking-[0.2em] text-[10px] sm:text-[11px] font-bold text-[#D8B28A] uppercase drop-shadow-sm">
              {t('SACRED VARANASI LINEAGE • VEDIC WISDOM • DR. VISHAL DUBEY', 'पावन काशी परंपरा • वैदिक ज्ञान • पूज्य डॉ. विशाल दुबे')}
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-[34px] lg:text-[38px] font-bold text-[#FFFDFB] tracking-wide leading-tight drop-shadow-md">
              {t('Who We Are • Ancient Vedic Heritage & Lineage', 'परिचय • पावन वैदिक परंपरा एवं सनातन धरोहर')}
            </h1>
            <p className="text-[#D7C4BD] text-xs sm:text-[13px] leading-relaxed max-w-lg font-normal drop-shadow-sm">
              {t(
                'Preserving ancient Varanasi astrological traditions under the revered guidance of Gold Medalist Dr. Pandit Vishal Dubey (AstroVD) — bridging ancient Jyotish Shastras with medical insight and profound spiritual wisdom.',
                'स्वर्ण पदक विजेता डॉ. पंडित विशाल दुबे (AstroVD) के सानिध्य में प्राचीन काशी ज्योतिष परंपरा — वैदिक शास्त्रों, वैज्ञानिक दृष्टिकोण एवं गहन आध्यात्मिक ज्ञान का अद्भुत संगम।'
              )}
            </p>
          </div>
        </div>

        {/* Subtle curved bottom wave divider matching reference design */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none z-10">
          <svg
            className="relative block w-full h-4 sm:h-5 md:h-6"
            viewBox="0 0 1200 40"
            preserveAspectRatio="none"
          >
            <path
              d="M0,14 C350,26 700,32 950,22 C1080,16 1160,8 1200,6"
              fill="none"
              stroke="#D8A868"
              strokeWidth="1.2"
              strokeOpacity="0.45"
            />
            <path
              d="M0,14 C350,26 700,32 950,22 C1080,16 1160,8 1200,6 L1200,40 L0,40 Z"
              fill="#FCF8ED"
            />
          </svg>
        </div>
      </section>

      <main className="w-full">
        <AboutSection isHomePage={false} />
      </main>

      <Footer />
    </div>
  );
}
