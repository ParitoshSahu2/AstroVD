'use client';

import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PageHeader } from '../../components/PageHeader';
import { ProductsSection } from '../../components/ProductsSection';
import { Award, ShieldCheck, Sparkles, HelpCircle, ArrowRight, MessageCircle } from 'lucide-react';

export default function ProductsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How do I know which gemstone bracelet or talisman is right for me?',
      a: 'Each crystal possesses distinct planetary vibrations. For specific life hurdles (such as Nazar/evil-eye protection, wealth accumulation, or marital discord), our team can analyze your Janam Kundli. You can also select intuitively or choose based on your Zodiac / Moon sign.',
    },
    {
      q: 'Are all products 100% natural, consecrated, and certified?',
      a: 'Yes, absolutely. All bracelets, gemstones, and Shree Yantras in the AstroVD collection are crafted from unheated, untreated natural minerals and accompanied by a verifiable Gemological Laboratory Certificate of Authenticity.',
    },
    {
      q: 'What is Vedic Prana Pratishtha and why is it essential?',
      a: 'A gemstone remains dormant until infused with cosmic prana. Before shipping, our Varanasi Vedic Acharyas perform a formal Sankalp with your Name, Gotra, and Nakshatra chanting the prescribed Beej Mantra so the product arrives spiritually activated.',
    },
    {
      q: 'Which hand should I wear the bracelet on?',
      a: 'As a Vedic principle: Wear on the Right Hand to project and radiate energy (confidence, action, career, leadership) or on the Left Hand to receive and internalize energy (healing, calm, emotional peace, intuition).',
    },
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#FAF7F2] m-0 p-0 overflow-x-hidden selection:bg-amber-400">
      <Navbar />

      <PageHeader
        breadcrumb="Sacred Products &amp; Store"
        title="Sacred Vedic Products &amp; Dhan Yog Talismans"
        subtitle="100% Lab-certified, energized with Vedic Suktams by Dr. Pandit Vishal Dubey for wealth, protection, and planetary alignment."
      />

      <main className="w-full space-y-10">
        {/* Sacred Astro Store Products Showcase */}
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
                Varanasi Pran Pratishtha
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Consecrated by senior Acharyas with Vedic Beej Mantras tailored to your Name, Gotra, and Nakshatra.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-200/60 text-amber-900 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-[#800000]" />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#2A1810]">
                100% Satisfaction &amp; Insured Shipping
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Secure sacred tamper-proof packaging delivered across India and worldwide with full tracking.
              </p>
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 pb-16">
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Crystal &amp; Gemstone FAQs</span>
            </div>
            <h3 className="font-serif font-bold text-2xl text-[#2A1810]">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between font-serif font-semibold text-xs sm:text-sm text-[#2A1810] hover:text-[#5B0D15] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="text-amber-700 text-lg font-mono">
                    {openFaq === idx ? '−' : '+'}
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-4 sm:px-5 pb-5 text-xs text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
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
