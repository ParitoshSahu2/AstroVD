'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Search, ChevronLeft, ChevronRight, Sparkles, RefreshCw } from 'lucide-react';
import { fetchProducts, CategorySummary, fetchCategories } from '../lib/productsApi';
import { ProductItem } from '../data/products';
import { useLanguage } from '../context/LanguageContext';

interface ProductsSectionProps {
  limit?: number;
  showExploreMore?: boolean;
  enableSearchAndPagination?: boolean;
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({
  limit,
  showExploreMore = false,
  enableSearchAndPagination = true,
}) => {
  const { t, language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [isBackend, setIsBackend] = useState<boolean>(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // reset to page 1 on new search
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Load categories on mount or language switch
  useEffect(() => {
    let mounted = true;
    fetchCategories(language === 'hi' ? 'hi' : 'en').then((cats) => {
      if (mounted) setCategories(cats);
    });
    return () => {
      mounted = false;
    };
  }, [language]);

  // Fetch products from GET /api/products
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetchProducts({
      category: activeCategory,
      search: debouncedSearch,
      page,
      limit: limit || (enableSearchAndPagination ? 12 : 8),
      lang: language === 'hi' ? 'hi' : 'en',
    })
      .then((res) => {
        if (!mounted) return;
        setProducts(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
        setIsBackend(Boolean(res.isBackendSource));
      })
      .catch((err) => {
        console.error('Failed to load products:', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [activeCategory, debouncedSearch, page, limit, language, enableSearchAndPagination]);

  const defaultCategories = [
    { id: 'all', label: t('All Bracelets', 'सभी ब्रेसलेट'), count: 19 },
    { id: 'wealth', label: t('Wealth & Prosperity', 'धन एवं समृद्धि'), count: 7 },
    { id: 'protection', label: t('Protection & Nazar', 'सुरक्षा एवं नज़र दोष'), count: 3 },
    { id: 'love', label: t('Love & Peace', 'प्रेम एवं शांति'), count: 2 },
    { id: 'healing', label: t('Healing & Balance', 'आरोग्य एवं संतुलन'), count: 7 },
  ];

  const currentCategories = categories.length > 0 ? categories : defaultCategories;

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

      <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100/90 border border-amber-300 text-amber-900 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>{t('Authentic Vedic Gemstones & Talismans', 'प्रामाणिक वैदिक रत्न एवं सिद्ध ताबीज')}</span>
            {isBackend && (
              <span className="ml-1 px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 text-[10px] font-mono">
                API Live
              </span>
            )}
          </div>
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

        {/* Live Search and Category Filter Toolbar */}
        <div className="space-y-4 max-w-4xl mx-auto">
          {enableSearchAndPagination && (
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('Search by gemstone, benefit, or planet (e.g. Tiger Eye, Rahu, Wealth)...', 'रत्न, लाभ अथवा ग्रह अनुसार खोजें (उदा: टाइगर आई, राहु, धन)...')}
                className="w-full pl-10 pr-4 py-3 rounded-full bg-white/95 border-2 border-amber-200/90 text-stone-900 placeholder-stone-400 text-xs sm:text-sm shadow-sm focus:outline-none focus:border-[#5B0D15] transition-all"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-stone-700"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {currentCategories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setPage(1);
                  }}
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
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#5B0D15] animate-spin" />
            <p className="text-xs sm:text-sm text-stone-600 font-medium">
              {t('Loading energized spiritual catalog from AstroVD API...', 'AstroVD API से सिद्ध उत्पाद लोड हो रहे हैं...')}
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-white/60 rounded-3xl border border-amber-200 p-8 max-w-md mx-auto">
            <p className="font-serif font-bold text-stone-800 text-base">
              {t('No bracelets match your search criteria', 'आपकी खोज के अनुसार कोई ब्रेसलेट नहीं मिला')}
            </p>
            <p className="text-xs text-stone-500">
              {t('Try searching with different keywords or reset category filters.', 'कृपया अन्य शब्द से खोजें या सभी श्रेणी चुनें।')}
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveCategory('all');
                setPage(1);
              }}
              className="px-5 py-2 rounded-full bg-[#5B0D15] text-white text-xs font-semibold hover:bg-[#480a11] transition-colors"
            >
              {t('Reset Filters', 'फ़िल्टर रीसेट करें')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7 items-stretch justify-center">
            {products.map((item) => {
              const prodName = item.name;
              const prodTag = item.tag;

              return (
                <Link
                  key={item.id}
                  href={`/products/${item.id}`}
                  className="group rounded-3xl overflow-hidden bg-white border-2 border-amber-200/90 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between cursor-pointer"
                >
                  {/* Product Image Container */}
                  <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-stone-100">
                    <img
                      src={item.image}
                      alt={prodName}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />

                    {/* Dark Floating Pill Price Badge Top-Right */}
                    <div className="absolute top-3.5 right-3.5 px-3.5 py-1.5 rounded-full bg-[#2A231D]/85 backdrop-blur-md border border-amber-400/60 text-amber-300 font-serif font-bold text-xs sm:text-sm shadow-md">
                      {item.priceFormatted || `₹${item.price}`}
                    </div>

                    {item.discountPercent && (
                      <div className="absolute top-3.5 left-3.5 px-2.5 py-1 rounded-full bg-emerald-700/90 text-white font-bold text-[10px] tracking-wider uppercase shadow-sm">
                        {item.discountPercent}% OFF
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Content Area */}
                  <div className="p-5 sm:p-6 space-y-2.5 bg-white flex flex-col justify-between flex-1">
                    <div className="space-y-1.5">
                      {/* Category Tag */}
                      <span className="text-[11px] sm:text-xs font-bold tracking-wider text-[#800000] uppercase block truncate">
                        {prodTag}
                      </span>

                      {/* Product Title */}
                      <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900 group-hover:text-[#5B0D15] transition-colors truncate">
                        {prodName}
                      </h3>
                    </div>

                    {/* Bottom Meta Row */}
                    <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs sm:text-sm">
                      <span className="text-stone-500 text-xs">
                        ★ {item.rating} ({item.reviewsCount})
                      </span>
                      <span className="font-bold text-[#800000] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>{t('Details', 'विवरण')}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#800000]" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {enableSearchAndPagination && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-full border border-amber-300 bg-white text-stone-700 hover:bg-amber-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 py-1.5 rounded-full bg-amber-100/80 text-amber-950 font-semibold text-xs border border-amber-300">
              {t('Page', 'पृष्ठ')} {page} / {totalPages} ({total} {t('Items', 'उत्पाद')})
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-full border border-amber-300 bg-white text-stone-700 hover:bg-amber-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Explore More Products Button */}
        {showExploreMore && (
          <div className="text-center pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#5B0D15] via-[#73121D] to-[#480A10] hover:from-[#73121D] hover:to-[#5B0D15] text-amber-100 font-bold text-xs sm:text-sm shadow-xl shadow-rose-950/25 hover:scale-105 transition-all cursor-pointer"
            >
              <span>{t('Explore All 19 Authentic Bracelets', 'सभी 19 सिद्ध ब्रेसलेट देखें')}</span>
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
            href="/products"
            className="shrink-0 px-6 sm:px-8 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#3B1E22] font-serif font-bold text-xs sm:text-sm shadow-xl shadow-amber-950/40 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer z-10"
          >
            <span>{t('Explore All 19 Bracelets', 'सभी 19 ब्रेसलेट देखें')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
};
