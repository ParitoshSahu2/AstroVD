'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Eye, X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { PRODUCTS_CATALOG, ProductItem } from '../data/products';
import { useLanguage } from '../context/LanguageContext';

interface ProductsSectionProps {
  limit?: number;
  showExploreMore?: boolean;
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({
  limit,
  showExploreMore = false,
}) => {
  const { t, language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [sankalpName, setSankalpName] = useState('');
  const [sankalpGotra, setSankalpGotra] = useState('');

  const filterCategories = [
    { id: 'all', label: t('All Bracelets (14)', 'सभी ब्रेसलेट (14)') },
    { id: 'wealth', label: t('Wealth & Prosperity', 'धन एवं समृद्धि') },
    { id: 'protection', label: t('Protection & Nazar', 'सुरक्षा एवं नज़र दोष') },
    { id: 'love', label: t('Love & Peace', 'प्रेम एवं शांति') },
    { id: 'healing', label: t('Healing & Balance', 'आरोग्य एवं संतुलन') },
  ];

  const filteredProducts = activeCategory === 'all'
    ? PRODUCTS_CATALOG
    : PRODUCTS_CATALOG.filter(p => p.category === activeCategory);

  const displayProducts = limit ? filteredProducts.slice(0, limit) : filteredProducts;

  const openWhatsAppInquiry = (product: ProductItem) => {
    const prodName = language === 'hi' && product.nameHi ? product.nameHi : product.name;
    let text = `Hello AstroVD, I would like to order the consecrated ${prodName} (${product.price}).`;
    if (sankalpName) {
      text += ` Please consecrate it in the name of ${sankalpName}${sankalpGotra ? ` (Gotra: ${sankalpGotra})` : ''}.`;
    }
    window.open(`https://wa.me/919876543210?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section id="shop" className="relative w-full bg-[#FAF7F2] py-20 lg:py-24 px-4 sm:px-6 lg:px-12 overflow-hidden selection:bg-amber-400">
      
      {/* Background Watermarks */}
      <img
        src="/ornaments/clean_yantra.png"
        alt="Yantra watermark"
        className="absolute top-1/3 -left-32 -translate-y-1/2 w-80 sm:w-[480px] h-auto object-contain pointer-events-none opacity-20 select-none"
      />
      <img
        src="/ornaments/clean_yantra.png"
        alt="Yantra watermark"
        className="absolute bottom-1/4 -right-32 w-80 sm:w-[480px] h-auto object-contain pointer-events-none opacity-20 select-none"
      />

      <div className="max-w-7xl mx-auto space-y-12 sm:space-y-14 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#4A151B] leading-tight">
            {t('Energized Spiritual Gemstones & Sacred Bracelets', 'प्राण-प्रतिष्ठित आध्यात्मिक रत्न एवं सिद्ध ब्रेसलेट')}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {t(
              'Every bracelet is hand-selected, lab-certified, and energized through authentic Vedic Prana-Pratishtha rituals in Varanasi with your personal Gotra & Nakshatra sankalp.',
              'प्रत्येक ब्रेसलेट 100% शुद्ध, लैब प्रमाणित और वाराणसी में आपके नाम, गोत्र व नक्षत्र संकल्प द्वारा वैदिक प्राण-प्रतिष्ठा से अभिमंत्रित है।'
            )}
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-4xl mx-auto">
          {filterCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#5B0D15] text-amber-100 shadow-md shadow-rose-950/20 border border-amber-400/80 scale-105'
                    : 'bg-white/80 hover:bg-amber-50 text-stone-700 border border-amber-200/80 shadow-sm'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Product Cards Grid: Featuring the exact Tiger Eye card design with Default & Hover states */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7 items-stretch justify-center">
          
          {displayProducts.map((item) => {
            const prodName = language === 'hi' && item.nameHi ? item.nameHi : item.name;
            const prodTag = language === 'hi' && item.tagHi ? item.tagHi : item.tag;
            const prodDesc = language === 'hi' && item.descHi ? item.descHi : item.desc;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedProduct(item)}
                className="relative rounded-3xl overflow-hidden shadow-xl border-2 border-amber-300/80 bg-stone-900 group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-amber-900/25 hover:-translate-y-1.5 flex flex-col"
              >
                {/* Outer Golden Corner Ornaments */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-amber-400/90 z-20 pointer-events-none" />
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-amber-400/90 z-20 pointer-events-none" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-amber-400/90 z-20 pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-amber-400/90 z-20 pointer-events-none" />

                {/* Price Tag Badge Top-Right */}
                <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-400/60 text-amber-200 font-serif font-bold text-xs shadow-md">
                  {item.price}
                </div>

                {/* Base Product Image */}
                <div className="relative h-[380px] sm:h-[420px] w-full overflow-hidden bg-stone-950">
                  <img
                    src={item.image}
                    alt={prodName}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* Subtle dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/20 pointer-events-none" />
                </div>

                {/* ================= 1. DEFAULT STATE: Floating Bottom Pill ================= */}
                <div className="absolute inset-x-0 bottom-5 flex justify-center z-20 transition-all duration-300 group-hover:opacity-0 group-hover:pointer-events-none group-hover:translate-y-4 px-3">
                  <div className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#1F1916]/90 backdrop-blur-md border border-amber-400/70 shadow-xl text-center max-w-[90%]">
                    <span className="text-amber-400 text-xs">✦</span>
                    <span className="font-serif font-bold text-xs sm:text-sm text-amber-100 tracking-wider truncate">
                      {prodName}
                    </span>
                    <span className="text-amber-400 text-xs">✦</span>
                  </div>
                </div>

                {/* ================= 2. HOVER STATE: Expanding Details Overlay ================= */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1412]/98 via-[#1A1412]/90 to-transparent flex flex-col justify-end p-5 sm:p-6 text-center opacity-0 group-hover:opacity-100 transition-all duration-400 ease-out translate-y-3 group-hover:translate-y-0 z-30">
                  
                  {/* Decorative Sparkle at Bottom Right */}
                  <span className="absolute bottom-5 right-5 text-amber-300/80 text-xl pointer-events-none">
                    ✦
                  </span>

                  <div className="space-y-2.5">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-amber-300 uppercase block">
                      {prodTag}
                    </span>

                    <h3 className="font-serif font-bold text-lg sm:text-xl text-white tracking-wide">
                      {prodName}
                    </h3>

                    <div className="flex items-center justify-center gap-2 text-xs">
                      <span className="text-amber-200 font-bold">{item.price}</span>
                      <span className="text-stone-400 line-through text-[11px]">{item.originalPrice}</span>
                      <span className="text-emerald-400 text-[10px] font-semibold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/40">
                        {t('Lab Certified', 'लैब प्रमाणित')}
                      </span>
                    </div>

                    <p className="text-[11px] sm:text-xs text-stone-300 leading-relaxed line-clamp-3">
                      {prodDesc}
                    </p>

                  <div className="pt-2 flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openWhatsAppInquiry(item);
                      }}
                      className="px-4 py-2 rounded-full bg-[#5B0D15] hover:bg-[#72111c] border border-amber-400/80 text-amber-100 font-bold text-xs shadow-lg hover:scale-105 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>{t('Inquire / Order', 'ऑर्डर करें / पूछताछ')}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProduct(item);
                      }}
                      className="p-2 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-200 border border-stone-600 transition-colors cursor-pointer"
                      title="Quick View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>

            </div>
            );
          })}
        </div>

        {/* Explore More Products Button after 6 cards */}
        {showExploreMore && (
          <div className="text-center pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#5B0D15] via-[#73121D] to-[#480A10] hover:from-[#73121D] hover:to-[#5B0D15] text-amber-100 font-bold text-xs sm:text-sm shadow-xl shadow-rose-950/25 hover:scale-105 transition-all cursor-pointer"
            >
              <span>{t('Explore More Products', 'और भी सिद्ध उत्पाद देखें')}</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </Link>
          </div>
        )}

        {/* Bottom Banner directing to Shop Page */}
        <div className="rounded-3xl bg-gradient-to-r from-[#3B1E22] via-[#5B0D15] to-[#3B1E22] border-2 border-amber-400/60 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-1.5 text-center sm:text-left z-10">
            <div className="inline-flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>{t('Free Personalized Prana Pratishtha Puja Included', 'निःशुल्क व्यक्तिगत प्राण-प्रतिष्ठा पूजा शामिल')}</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-amber-100">
              {t('Need Personal Astrological Gemstone Recommendation?', 'क्या आपको व्यक्तिगत रत्न परामर्श की आवश्यकता है?')}
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl">
              {t(
                'Consult with Dr. Pandit Vishal Dubey to identify the exact gemstone aligned with your Janam Kundli and currently running Dasha.',
                'अपनी जन्म कुंडली एवं वर्तमान ग्रह दशा के अनुसार सर्वोत्तम रत्न जानने के लिए डॉ. पंडित विशाल दुबे से परामर्श लें।'
              )}
            </p>
          </div>
          <Link
            href="/shop"
            className="shrink-0 px-6 sm:px-8 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#3B1E22] font-serif font-bold text-xs sm:text-sm shadow-xl shadow-amber-950/40 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer z-10"
          >
            <span>{t('Explore All 14+ Bracelets in Shop', 'स्टोर में सभी 14+ ब्रेसलेट देखें')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

      {/* ================= QUICK VIEW & SANKALP MODAL ================= */}
      {selectedProduct && (
        <div
          onClick={() => setSelectedProduct(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl rounded-3xl bg-[#FAF7F2] border-2 border-amber-300/90 shadow-2xl overflow-hidden my-8"
          >
            {/* Modal Close Button */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-stone-900/60 hover:bg-stone-900 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Product Image Side */}
              <div className="relative h-72 sm:h-96 md:h-full bg-stone-950">
                <img
                  src={selectedProduct.image}
                  alt={language === 'hi' && selectedProduct.nameHi ? selectedProduct.nameHi : selectedProduct.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-black/70 backdrop-blur-md border border-amber-400/60 text-white text-xs space-y-1">
                  <div className="text-amber-300 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t('Consecration Mantra:', 'प्राण-प्रतिष्ठा मंत्र:')}</span>
                  </div>
                  <div className="font-serif italic text-stone-200">{selectedProduct.mantra}</div>
                </div>
              </div>

              {/* Details & Sankalp Side */}
              <div className="p-6 sm:p-8 space-y-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-[#800000] uppercase block">
                    {language === 'hi' && selectedProduct.tagHi ? selectedProduct.tagHi : selectedProduct.tag}
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#4A151B]">
                    {language === 'hi' && selectedProduct.nameHi ? selectedProduct.nameHi : selectedProduct.name}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-2xl font-bold text-[#800000]">{selectedProduct.price}</span>
                    <span className="text-stone-400 line-through text-sm">{selectedProduct.originalPrice}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {t('Govt Lab Certified', 'सरकारी लैब द्वारा प्रमाणित')}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {language === 'hi' && selectedProduct.descHi ? selectedProduct.descHi : selectedProduct.desc}
                  </p>

                  {/* Sacred Astro Attributes */}
                  <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                      <span className="text-stone-500 text-[10px] uppercase font-bold block">{t('Ruling Planet', 'स्वामी ग्रह')}</span>
                      <span className="font-semibold text-stone-900">
                        {language === 'hi' && selectedProduct.planetHi ? selectedProduct.planetHi : selectedProduct.planet}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                      <span className="text-stone-500 text-[10px] uppercase font-bold block">{t('Active Chakra', 'सक्रिय चक्र')}</span>
                      <span className="font-semibold text-stone-900">
                        {language === 'hi' && selectedProduct.chakraHi ? selectedProduct.chakraHi : selectedProduct.chakra}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                      <span className="text-stone-500 text-[10px] uppercase font-bold block">{t('Auspicious Day', 'शुभ धारण वार')}</span>
                      <span className="font-semibold text-stone-900">
                        {language === 'hi' && selectedProduct.dayToWearHi ? selectedProduct.dayToWearHi : selectedProduct.dayToWear}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                      <span className="text-stone-500 text-[10px] uppercase font-bold block">{t('Bead Spec', 'मनका विवरण')}</span>
                      <span className="font-semibold text-stone-900">
                        {language === 'hi' && selectedProduct.beadSizeHi ? selectedProduct.beadSizeHi : selectedProduct.beadSize}
                      </span>
                    </div>
                  </div>

                  {/* Free Sankalp Personalization Input */}
                  <div className="p-3 rounded-2xl bg-white border border-amber-300/80 space-y-2">
                    <span className="text-[11px] font-bold text-[#800000] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {t('Free Personal Vedic Sankalp:', 'निःशुल्क व्यक्तिगत वैदिक संकल्प:')}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder={t('Your Name', 'आपका नाम')}
                        value={sankalpName}
                        onChange={(e) => setSankalpName(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 focus:outline-none focus:border-amber-400 bg-stone-50"
                      />
                      <input
                        type="text"
                        placeholder={t('Gotra (Optional)', 'गोत्र (ऐच्छिक)')}
                        value={sankalpGotra}
                        onChange={(e) => setSankalpGotra(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 focus:outline-none focus:border-amber-400 bg-stone-50"
                      />
                    </div>
                  </div>
                </div>

                {/* WhatsApp Order Action */}
                <button
                  onClick={() => openWhatsAppInquiry(selectedProduct)}
                  className="w-full py-3 rounded-full bg-[#5B0D15] hover:bg-[#72111c] text-white font-serif font-bold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <span>{t('Order with Prana Pratishtha on WhatsApp', 'प्राण प्रतिष्ठा सहित WhatsApp पर ऑर्डर करें')}</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
