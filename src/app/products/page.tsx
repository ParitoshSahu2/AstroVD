'use client';

import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PageHeader } from '../../components/PageHeader';
import { ProductsSection } from '../../components/ProductsSection';
import { Award, ShieldCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function ProductsPage() {
  const { t, language } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: t('How do I know which gemstone bracelet or talisman is right for me?', 'मुझे कैसे पता चलेगा कि कौन सा सिद्ध ब्रेसलेट या ताबीज मेरे लिए सही है?'),
      a: t(
        'Each crystal possesses distinct planetary vibrations. For specific life hurdles (such as Nazar/evil-eye protection, wealth accumulation, or marital discord), our team can analyze your Janam Kundli. You can also select intuitively or choose based on your Zodiac / Moon sign.',
        'प्रत्येक रत्न व क्रिस्टल की एक विशिष्ट ग्रहीय ऊर्जा होती है। जीवन की विशिष्ट समस्याओं (जैसे नज़र दोष, धन अभाव, अथवा दांपत्य बाधा) हेतु हमारी वैदिक टीम आपकी जन्म कुंडली का विश्लेषण कर सकती है।'
      ),
    },
    {
      q: t('Are all products 100% natural, consecrated, and certified?', 'क्या सभी उत्पाद 100% प्राकृतिक, प्राण-प्रतिष्ठित एवं प्रमाणित हैं?'),
      a: t(
        'Yes, absolutely. All bracelets, gemstones, and Shree Yantras in the AstroVD collection are crafted from unheated, untreated natural minerals and accompanied by a verifiable Gemological Laboratory Certificate of Authenticity.',
        'हां, पूर्णतः। AstroVD के सभी ब्रेसलेट, रत्न एवं श्री यंत्र 100% प्राकृतिक, अकृत्रिम और शुद्ध खनिजों से बने हैं, जिनके साथ सरकारी मान्यता प्राप्त जेमोलॉजिकल लैब का प्रामाणिकता प्रमाण-पत्र संलग्न होता है।'
      ),
    },
    {
      q: t('What is Vedic Prana Pratishtha and why is it essential?', 'वैदिक प्राण-प्रतिष्ठा क्या है और यह क्यों आवश्यक है?'),
      a: t(
        'A gemstone remains dormant until infused with cosmic prana. Before shipping, our Varanasi Vedic Acharyas perform a formal Sankalp with your Name, Gotra, and Nakshatra chanting the prescribed Beej Mantra so the product arrives spiritually activated.',
        'बिना प्राण-प्रतिष्ठा के कोई भी रत्न सुप्त अवस्था में रहता है। प्रेषण से पूर्व, काशी के वैदिक आचार्य आपके नाम, गोत्र व नक्षत्र का शास्त्रोक्त संकल्प लेकर संबंधित ग्रह के बीज मंत्रों द्वारा इसे जाग्रत करते हैं।'
      ),
    },
    {
      q: t('Which hand should I wear the bracelet on?', 'ब्रेसलेट को किस हाथ में धारण करना चाहिए?'),
      a: t(
        'As a Vedic principle: Wear on the Right Hand to project and radiate energy (confidence, action, career, leadership) or on the Left Hand to receive and internalize energy (healing, calm, emotional peace, intuition).',
        'वैदिक सिद्धांत के अनुसार: ऊर्जा को प्रक्षेपित करने (आत्मविश्वास, कर्म, करियर, धन आकर्षण) हेतु दाहिने हाथ में धारण करें, एवं आंतरिक शांति, स्वास्थ्य व अंतर्ज्ञान हेतु बाएं हाथ में धारण करें।'
      ),
    },
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#FAF7F2] m-0 p-0 overflow-x-hidden selection:bg-amber-400">
      <Navbar />

      <PageHeader
        breadcrumb={t('Sacred Products & Store', 'सिद्ध उत्पाद व आध्यात्मिक स्टोर')}
        title={t('Sacred Vedic Products & Dhan Yog Talismans', 'सिद्ध वैदिक उत्पाद एवं धन योग ताबीज')}
        subtitle={t(
          '100% Lab-certified, energized with Vedic Suktams by Dr. Pandit Vishal Dubey for wealth, protection, and planetary alignment.',
          'पूज्य डॉ. पंडित विशाल दुबे द्वारा वैदिक सूक्तों से अभिमंत्रित, 100% लैब प्रमाणित आध्यात्मिक उत्पाद एवं रत्न।'
        )}
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
                {t('Govt & Lab Certified', 'सरकारी एवं लैब द्वारा प्रमाणित')}
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t(
                  'Every gemstone bracelet comes with verifiable laboratory certification confirming natural mineral purity.',
                  'प्रत्येक रत्न ब्रेसलेट के साथ प्रामाणिक लैब प्रमाण-पत्र संलग्न होता है, जो 100% शुद्धता की पुष्टि करता है।'
                )}
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-200/60 text-amber-900 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#800000]" />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#2A1810]">
                {t('Vedic Prana Pratishtha', 'वैदिक प्राण-प्रतिष्ठा व संकल्प')}
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t(
                  'Consecrated by certified Varanasi priests on auspicious Tithi & Nakshatras in your personal name.',
                  'काशी के विद्वान ब्राह्मणों द्वारा शुभ तिथि व नक्षत्र में आपके व्यक्तिगत नाम-गोत्र से शास्त्रोक्त सिद्ध।'
                )}
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-200/60 text-amber-900 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-[#800000]" />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#2A1810]">
                {t('Worldwide Insured Delivery', 'विश्वव्यापी सुरक्षित वितरण')}
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t(
                  'Safe, tamper-proof courier shipping with real-time tracking across India, UAE, UK, USA, and Australia.',
                  'भारत, यूएई, यूके, यूएसए और ऑस्ट्रेलिया सहित विश्व भर में सुरक्षित एवं ट्रैकिंग युक्त कूरियर सेवा।'
                )}
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 pb-16 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold tracking-widest text-[#800000] uppercase">
              {t('FREQUENTLY ASKED QUESTIONS', 'बारंबार पूछे जाने वाले प्रश्न')}
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A151B]">
              {t('Sacred Talisman & Gemstone Guidance', 'सिद्ध ताबीज एवं रत्न धारण मार्गदर्शन')}
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
