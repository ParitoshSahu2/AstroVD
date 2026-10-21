'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Flame } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ServiceItem {
  id: string;
  title: string;
  titleHi: string;
  desc: string;
  descHi: string;
  image: string;
}

const servicesData: ServiceItem[] = [
  {
    id: 'gemstones',
    title: 'Gemstones Guidance',
    titleHi: 'रत्न परामर्श व धारण विधि',
    desc: 'Astrological gemstones energized for planetary empowerment.',
    descHi: 'ग्रह शांति व सकारात्मक ऊर्जा के लिए प्राण-प्रतिष्ठित शुद्ध रत्न।',
    image: '/services/gemstones.jpg',
  },
  {
    id: 'puja',
    title: 'Puja & Remedies',
    titleHi: 'वैदिक पूजा व अनुष्ठान',
    desc: 'Sacred Vedic yagya & havan rituals for divine blessings.',
    descHi: 'काशी के विद्वान ब्राह्मणों द्वारा वैदिक यज्ञ एवं महामृत्युंजय हवन।',
    image: '/services/puja.jpg',
  },
  {
    id: 'kundli',
    title: 'Kundli & Horoscope',
    titleHi: 'जन्म कुंडली व भविष्यफल',
    desc: 'Detailed birth chart analysis and life predictions.',
    descHi: 'सटीक जन्म पत्रिका विश्लेषण, ग्रह गोचर एवं महादशा फल।',
    image: '/services/kundli.jpg',
  },
  {
    id: 'marriage',
    title: 'Marriage Matching',
    titleHi: 'कुंडली मिलान व विवाह',
    desc: '36 Gunas Vedic Ashtakoot compatibility matching.',
    descHi: '36 गुण अष्टकूट वैदिक मिलान, मांगलिक विचार व सुखद वैवाहिक जीवन।',
    image: '/services/marriage.jpg',
  },
  {
    id: 'career',
    title: 'Career & Finance Guidance',
    titleHi: 'करियर, व्यापार व धन लाभ',
    desc: 'Planetary periods (Dasha) for wealth and profession timing.',
    descHi: 'दशम भाव विश्लेषण, व्यवसाय में स्थिरता व आर्थिक उन्नति के उपाय।',
    image: '/services/career.jpg',
  },
];

export const ServicesCarousel: React.FC = () => {
  const { t, language } = useLanguage();
  // Default to Kundli (index 2) as in the reference image
  const [currentIndex, setCurrentIndex] = useState(2);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? servicesData.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === servicesData.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="relative w-full bg-[#FAF7F2] pt-6 sm:pt-8 pb-10 sm:pb-14 px-4 sm:px-6 lg:px-12 overflow-hidden selection:bg-amber-400">
      
      {/* 1. Background Watermarks: Golden Mandala (Left) and Sri Yantra Wheel (Right) */}
      <img
        src="/ornaments/clean_mandala.png"
        alt="Mandala watermark"
        className="absolute top-1/2 -left-20 sm:-left-28 -translate-y-1/2 w-80 sm:w-[420px] h-auto object-contain pointer-events-none opacity-20 select-none"
      />
      <img
        src="/ornaments/clean_yantra.png"
        alt="Yantra wheel watermark"
        className="absolute top-1/2 -right-20 sm:-right-28 -translate-y-1/2 w-80 sm:w-[420px] h-auto object-contain pointer-events-none opacity-20 select-none"
      />

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* Left Column: Heading, Subtitle, Divider & Explore Button */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-5 text-left z-10 pl-2 sm:pl-0">
          <div>
            <span className="text-xs sm:text-sm font-bold tracking-[0.22em] text-[#800000] uppercase block">
              {t('OUR SERVICES', 'हमारी वैदिक सेवाएं')}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-bold text-[#4A151B] leading-[1.18] tracking-tight">
            {language === 'hi' ? (
              <>
                जीवन के हर पड़ाव के लिए<br />
                दैवीय व सटीक<br />
                मार्गदर्शन
              </>
            ) : (
              <>
                Guidance for<br />
                Every Chapter of<br />
                Your Life
              </>
            )}
          </h2>

          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed max-w-[340px] sm:max-w-sm">
            {t(
              'From understanding your Kundli to finding the right career path — explore our wide range of personalised Vedic astrology services.',
              'अपनी जन्म पत्रिका को गहराई से समझने से लेकर सही करियर मार्ग तक — हमारी व्यक्तिगत वैदिक ज्योतिष सेवाओं का अन्वेषण करें।'
            )}
          </p>

          <div className="pt-2">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#FEE58F] via-[#FDC754] to-[#F59E0B] hover:from-[#fce080] hover:to-[#eb9405] text-[#3B1E22] font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <span>{t('Explore All Services', 'सभी सेवाएं देखें')}</span>
              <span className="text-sm font-serif">→</span>
            </Link>
          </div>
        </div>

        {/* Right Column: 3D Curved Interactive Service Carousel */}
        <div className="lg:col-span-8 relative flex flex-col items-center justify-center min-h-[460px]">
          
          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-0 sm:-left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-md border border-stone-200/90 shadow-lg text-stone-700 hover:text-[#5B0D15] hover:scale-110 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Previous service"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-0 sm:-right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-md border border-stone-200/90 shadow-lg text-stone-700 hover:text-[#5B0D15] hover:scale-110 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Next service"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Cards Track Container with Perspective */}
          <div className="relative w-full h-[400px] sm:h-[430px] flex items-center justify-center overflow-visible">
            {servicesData.map((item, index) => {
              // Calculate relative position (-2, -1, 0, 1, 2)
              const count = servicesData.length;
              let diff = (index - currentIndex + count) % count;
              if (diff > count / 2) diff -= count;

              // Only render items within a 2-step radius
              const isVisible = Math.abs(diff) <= 2;
              if (!isVisible) return null;

              const isCenter = diff === 0;

              // Positioning and transformation calculations for the 3D curve
              const translateX = diff * 175;
              const scale = isCenter ? 1.08 : Math.abs(diff) === 1 ? 0.90 : 0.78;
              const rotateY = diff * -12;
              const zIndex = 20 - Math.abs(diff) * 5;
              const opacity = isCenter ? 1 : Math.abs(diff) === 1 ? 0.88 : 0.65;

              return (
                <div
                  key={item.id}
                  onClick={() => setCurrentIndex(index)}
                  className="absolute cursor-pointer transition-all duration-500 ease-out origin-center"
                  style={{
                    transform: `translateX(${translateX}px) scale(${scale}) perspective(1000px) rotateY(${rotateY}deg)`,
                    zIndex,
                    opacity,
                  }}
                >
                  {isCenter ? (
                    /* Center Highlighted Card (Kundli & Horoscope format in image) */
                    <div className="w-[240px] sm:w-[260px] rounded-3xl overflow-hidden bg-white shadow-2xl border border-amber-200/80 transition-all">
                      {/* Top Image */}
                      <div className="relative h-44 sm:h-48 w-full overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                      </div>

                      {/* Overlapping Round Floating Diya Badge */}
                      <div className="relative flex justify-center -mt-6 z-10">
                        <div className="w-12 h-12 rounded-full bg-white p-1 shadow-md border border-amber-300 flex items-center justify-center">
                          <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-500 to-amber-200 flex items-center justify-center text-[#5B0D15]">
                            <Flame className="w-5 h-5 fill-amber-600 text-amber-700" />
                          </div>
                        </div>
                      </div>

                      {/* Bottom Content Area */}
                      <div className="p-4 sm:p-5 pt-2 text-center bg-gradient-to-b from-white to-[#FDFBF7] space-y-2">
                        <h3 className="font-serif font-bold text-base sm:text-lg text-[#3B1E22]">
                          {language === 'hi' ? item.titleHi : item.title}
                        </h3>
                        <p className="text-[11px] text-stone-500 leading-snug">
                          {language === 'hi' ? item.descHi : item.desc}
                        </p>

                        <div className="pt-2 flex justify-center">
                          <button className="w-8 h-8 rounded-full bg-[#5B0D15] hover:bg-[#43080e] text-white flex items-center justify-center shadow-md transition-transform hover:scale-110">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Flanking Surrounding Cards */
                    <div className="w-[200px] sm:w-[220px] h-[330px] sm:h-[350px] rounded-3xl overflow-hidden relative shadow-xl border border-stone-200/60 group hover:border-amber-400 transition-all">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Dark overlay gradient at bottom */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-4 text-center">
                        <h4 className="font-serif font-bold text-xs sm:text-sm text-white drop-shadow">
                          {language === 'hi' ? item.titleHi : item.title}
                        </h4>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Pagination Track & Progress Indicators */}
          <div className="flex items-center gap-2 pt-6">
            {servicesData.map((_, dotIdx) => {
              const isActive = dotIdx === currentIndex;
              return (
                <button
                  key={dotIdx}
                  onClick={() => setCurrentIndex(dotIdx)}
                  className={`transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'w-10 h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-[#F59E0B]'
                      : 'w-2 h-2 rounded-full bg-stone-300 hover:bg-stone-400'
                  }`}
                  aria-label={`Go to slide ${dotIdx + 1}`}
                />
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};
