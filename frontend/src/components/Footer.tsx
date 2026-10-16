'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, ShieldCheck, Award, Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative w-full bg-[#F5EFE6] border-t border-amber-200/80 pt-16 pb-12 px-4 sm:px-6 lg:px-12 text-stone-700 selection:bg-amber-400">
      
      {/* Background Watermark */}
      <img
        src="/ornaments/clean_yantra.png"
        alt="Watermark"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-auto object-contain pointer-events-none opacity-5 select-none"
      />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* Main Grid: 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Col 1: Brand & Sanskrit Shloka */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-block">
              <img
                src="/astro-vd-logo.png"
                alt="AstroVD"
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </Link>

            <p className="text-xs sm:text-[13px] text-stone-600 leading-relaxed max-w-sm">
              Empowering seekers globally with authentic Vedic Jyotish calculations, consecrated rituals by certified Varanasi Acharyas, and intuitive spiritual counseling led by Dr. Pandit Vishal Dubey.
            </p>

            <div className="p-3.5 rounded-2xl bg-white/70 border border-amber-300/70 space-y-1">
              <span className="text-[11px] font-serif font-bold text-amber-900 block">
                ॥ उपनिषद् महामंत्र ॥
              </span>
              <p className="text-xs font-serif text-[#800000] font-semibold">
                ॐ असतो मा सद्गमय । तमसो मा ज्योतिर्गमय । मृत्योर्माऽमृतं गमय ॥
              </p>
            </div>
          </div>

          {/* Col 2: Quick Navigation */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-serif font-bold text-sm text-[#2A1810] uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link href="/" className="hover:text-[#800000] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#800000] transition-colors">
                  About Us &amp; Guides
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#800000] transition-colors">
                  Services (29 Rituals)
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-[#800000] transition-colors">
                  Products &amp; Talismans
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-[#800000] transition-colors">
                  Sacred Gallery
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-[#800000] transition-colors">
                  Blogs &amp; Wisdom
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#800000] transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Spiritual Services */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif font-bold text-sm text-[#2A1810] uppercase tracking-wider">
              Astrology &amp; Pooja
            </h4>
            <ul className="space-y-2 text-xs text-stone-600">
              <li>Vedic Janam Kundli Analysis</li>
              <li>Free Kundli For Baby Girls Below 9 Years</li>
              <li>36 Gunas Marriage Match Making</li>
              <li>Mangal &amp; Kaal Sarp Dosh Shanti</li>
              <li>Navgrah Shanti &amp; Shat Chandi Path</li>
              <li>Intuitive Tarot Reading with Madhuri Ji</li>
              <li>Astrology Education &amp; Certification Course</li>
            </ul>
          </div>

          {/* Col 4: Trust & Contact */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif font-bold text-sm text-[#2A1810] uppercase tracking-wider">
              Global Support
            </h4>
            
            <div className="space-y-2 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-700" />
                <span>+91 98260 12345 / +91 88899 77665</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-700" />
                <span>contact@astrovd.com</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-700 mt-0.5 shrink-0" />
                <span>Kashi Vishwanath Corridor, Varanasi • Indore • New Delhi • Dubai</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-1.5 text-[11px] text-stone-600">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Confidential &amp; Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-800 font-semibold">
                <Award className="w-3.5 h-3.5" />
                <span>Certified Vedic Sanskrit Scholars</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Rights */}
        <div className="pt-8 border-t border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 text-center sm:text-left">
          <p>© 2026 AstroVD Celestial Systems. All Sacred Rights Reserved.</p>
          <p className="flex items-center gap-1 justify-center">
            <span>Devoted with</span>
            <Heart className="w-3 h-3 text-rose-500 fill-current inline" />
            <span>to Vedic Jyotish &amp; Dharma</span>
          </p>
        </div>

      </div>

    </footer>
  );
};
