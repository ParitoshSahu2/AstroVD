'use client';

import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PageHeader } from '../../components/PageHeader';
import { ProductsSection } from '../../components/ProductsSection';
import { ShoppingCart, ShieldCheck, Award, Sparkles, ArrowRight, HelpCircle, CheckCircle, Search, Filter } from 'lucide-react';

export default function ShopPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How do I know which gemstone bracelet is right for me?',
      a: 'Each crystal possesses distinct planetary vibration. For specific life hurdles (e.g. Nazar protection, wealth accumulation, or marital discord), our team can analyze your Janam Kundli. You can also select intuitively or choose based on your Zodiac/Moon sign.',
    },
    {
      q: 'Are these gemstones 100% natural and certified?',
      a: 'Yes, absolutely. All bracelets in the AstroVD collection are crafted from unheated, untreated natural minerals and accompanied by a verifiable Gemological Laboratory Certificate of Authenticity.',
    },
    {
      q: 'What is Vedic Prana Pratishtha and why is it essential?',
      a: 'A gemstone remains dormant until infused with cosmic prana. Before shipping, our Varanasi Vedic Acharyas perform a formal Sankalp with your Name, Gotra, and Nakshatra chanting the prescribed Beej Mantra so the bracelet arrives spiritually activated.',
    },
    {
      q: 'Which hand should I wear the bracelet on?',
      a: 'As a Vedic principle: Wear on the Right Hand to project and radiate energy (confidence, action, career, leadership) or on the Left Hand to receive and internalize energy (healing, calm, emotional peace, intuition).',
    },
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#FAF7F2] m-0 p-0 overflow-x-hidden selection:bg-amber-400">
      <Navbar />

      {/* Header exactly matching user screenshot */}
      <PageHeader
        breadcrumb="Sacred Products"
        title="Sacred Vedic Products & Dhan Yog Talismans"
        subtitle="100% Lab-certified, energized with Vedic Suktams by Dr. Pandit Vishal Dubey for wealth, protection, and planetary alignment."
      />

      <main className="w-full space-y-6">
        {/* Sacred Astro Store Products Showcase (featuring all 14 newly added images) */}
        <ProductsSection />

        {/* Certification & Guarantee Banner */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 py-4">
          <div className="rounded-3xl bg-amber-50/80 border-2 border-amber-300/80 p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center shadow-lg">
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-200/60 text-amber-900 flex items-center justify-center">
                <Award className="w-6 h-6 text-[#800000]" />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#2A1810]">
                Govt &amp; Lab Certified
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Every gemstone bracelet comes with verifiable laboratory certification confirming natural mineral purity.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-200/60 text-amber-900 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#800000]" />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#2A1810]">
                Vedic Prana Pratishtha
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Consecrated by certified Varanasi priests on auspicious Tithi &amp; Nakshatras in your personal name.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-200/60 text-amber-900 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-[#800000]" />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#2A1810]">
                Worldwide Insured Delivery
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Safe, tamper-proof courier shipping with real-time tracking across India, UAE, UK, USA, and Australia.
              </p>
            </div>
          </div>
        </section>

        {/* Gemstone Wearing & Consecration FAQ */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 pb-16 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold tracking-widest text-[#800000] uppercase">FREQUENTLY ASKED QUESTIONS</span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A151B]">
              Gemstone Activation &amp; Wearing Guidance
            </h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-amber-200/90 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between font-serif font-bold text-sm sm:text-base text-[#3B1E22] hover:text-[#5B0D15] cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="text-amber-600 text-lg ml-2">{openFaq === idx ? '−' : '+'}</span>
                </button>
                {openFaq === idx && (
                  <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-amber-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
