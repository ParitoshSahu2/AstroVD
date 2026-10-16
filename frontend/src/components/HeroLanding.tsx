'use client';

import React from 'react';
import {
  Sparkles,
  PhoneCall,
  Compass,
  Star,
  ShieldCheck,
  Award,
  Users,
  CheckCircle2,
} from 'lucide-react';

interface HeroLandingProps {
  openConsultModal: () => void;
  openAuthModal: () => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({ openConsultModal, openAuthModal }) => {
  return (
    <section className="relative w-full min-h-[92vh] lg:min-h-screen flex items-center overflow-hidden">
      {/* Background Image: homepage.png from public folder */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-no-repeat bg-[center_top] lg:bg-[right_center] z-0"
        style={{
          backgroundImage: "url('/homepage.png')",
        }}
      >
        {/* Soft Left Side Gradient Overlay for text readability on light theme */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#faf6ee]/95 via-[#faf6ee]/80 to-transparent sm:via-[#faf6ee]/50 lg:via-transparent pointer-events-none"></div>

        {/* Bottom subtle blend into light background */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FAF7F2] via-[#FAF7F2]/60 to-transparent pointer-events-none"></div>
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-28 sm:pt-36 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Content (Parchment area) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Vedic Shloka Sacred Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/90 border border-amber-300/80 backdrop-blur-md text-amber-900 text-xs font-semibold shadow-sm">
              <span className="text-sm">ॐ</span>
              <span className="tracking-wide">॥ यत् पिण्डे तत् ब्रह्माण्डे ॥ Authentic Vedic Jyotish</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 font-serif leading-[1.15] tracking-tight drop-shadow-sm">
              Unlock Divine Clarity with{' '}
              <span className="gold-gradient-text block mt-1">
                Sacred Vedic Wisdom
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-stone-700 text-sm sm:text-base lg:text-lg max-w-xl font-medium leading-relaxed drop-shadow-sm">
              Direct 1-on-1 consultations with verified Jyotish Acharyas, accurate Janam Kundli charts, marriage compatibility, and daily cosmic insights consecrated by ancient Vedic traditions.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={openConsultModal}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-sm shadow-xl shadow-amber-500/25 flex items-center gap-2 cursor-pointer transition-all duration-300 transform hover:scale-105"
              >
                <PhoneCall className="w-4 h-4 fill-current" />
                <span>Talk to Astrologer (Instant Call)</span>
              </button>

              <button
                onClick={openAuthModal}
                className="px-6 py-3.5 rounded-2xl bg-white/85 hover:bg-white text-stone-800 border border-amber-300/80 backdrop-blur-md font-bold text-sm flex items-center gap-2 cursor-pointer transition-all duration-200 hover:border-amber-400 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Join AstroVeda (Free Credits)</span>
              </button>
            </div>

            {/* Trust Badges Bar */}
            <div className="pt-6 border-t border-amber-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/70 backdrop-blur-sm p-3.5 rounded-2xl border border-amber-200/60 shadow-sm">
                <div className="text-2xl font-extrabold text-amber-700 font-mono">50,000+</div>
                <div className="text-xs text-stone-600 font-medium mt-0.5">Seekers Guided</div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm p-3.5 rounded-2xl border border-amber-200/60 shadow-sm">
                <div className="text-2xl font-extrabold text-amber-700 font-mono flex items-center gap-1">
                  4.9 <Star className="w-4 h-4 text-amber-500 fill-current inline" />
                </div>
                <div className="text-xs text-stone-600 font-medium mt-0.5">15,000+ Reviews</div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm p-3.5 rounded-2xl border border-amber-200/60 shadow-sm">
                <div className="text-2xl font-extrabold text-amber-700 font-mono">100%</div>
                <div className="text-xs text-stone-600 font-medium mt-0.5">Confidential</div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm p-3.5 rounded-2xl border border-amber-200/60 shadow-sm">
                <div className="text-2xl font-extrabold text-amber-700 font-mono">120+</div>
                <div className="text-xs text-stone-600 font-medium mt-0.5">Vedic Acharyas</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
