'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Calendar } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative w-full min-h-[640px] lg:min-h-screen flex items-center overflow-hidden m-0 p-0">
      
      {/* Background Image: High-res homepage.png with Dr. Vishal Dubey on the right and open parchment canvas on the left */}
      <img
        src="/homepage.png"
        alt="Dr. Pandit Vishal Dubey - Vedic Astrology"
        className="absolute inset-0 w-full h-full object-cover object-[72%_center] sm:object-[68%_center] lg:object-right-center select-none pointer-events-none"
      />

      {/* Subtle Mobile/Tablet Gradient to guarantee 100% text readability without cluttering Guruji's portrait */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#FAF7F2]/95 via-[#FAF7F2]/80 to-transparent lg:from-transparent lg:via-transparent pointer-events-none z-0" />

      {/* Seamless Bottom Blend: Gracefully feather the wooden desk into the #FAF7F2 background */}
      <div className="absolute bottom-0 left-0 right-0 h-14 sm:h-20 bg-gradient-to-t from-[#FAF7F2] via-[#FAF7F2]/45 to-transparent pointer-events-none z-10" />

      {/* Hero Content shifted gracefully to the left side */}
      <div className="relative z-10 w-full pl-6 sm:pl-10 md:pl-14 lg:pl-16 xl:pl-24 pr-6 pt-28 sm:pt-32 lg:pt-24 pb-16 flex items-center justify-start">
        
        <div className="w-full max-w-lg lg:max-w-xl space-y-6 text-left">
          
          {/* Main Headline - Exact 3-line breakdown matching reference screenshot */}
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[48px] xl:text-[54px] font-bold text-[#3B1E22] leading-[1.15] tracking-tight">
              Guidance from the<br />
              Stars, <span className="text-[#800000] italic font-normal">Grounded in</span><br />
              Truth.
            </h1>
          </div>

          {/* Concise, Poetic Subtitle - Exact 3 clean lines matching reference */}
          <p className="text-stone-700 text-xs sm:text-sm lg:text-[15.5px] font-normal leading-[1.65] max-w-[460px] lg:max-w-[480px]">
            Discover clarity for career, love, and life’s turning points through authentic Vedic horoscope reading, planetary alignment, and time-tested spiritual remedies.
          </p>

          {/* Clean Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <Link
              href="/appointment"
              className="px-6 sm:px-7 py-3 rounded-full bg-[#520F16] hover:bg-[#68141d] text-amber-100 font-serif font-bold text-xs sm:text-sm shadow-xl shadow-rose-950/20 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-amber-300 stroke-[2]" />
              <span>Book Consultation</span>
              <span className="text-amber-300 ml-0.5 font-bold">→</span>
            </Link>

            <Link
              href="/services"
              className="px-5 sm:px-6 py-3 rounded-full bg-white hover:bg-stone-50 text-[#3B1E22] border border-amber-300/80 backdrop-blur-md font-serif font-semibold text-xs sm:text-sm shadow-sm hover:border-amber-400 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              <span>Explore Services</span>
            </Link>
          </div>

        </div>

      </div>

    </section>
  );
};
