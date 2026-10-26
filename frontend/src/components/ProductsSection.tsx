'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  Eye,
  X,
  ShieldCheck,
  CheckCircle2,
  ShoppingCart,
  Check,
  Plus,
  Minus,
  Search,
  ArrowUpDown,
  Loader2,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { PRODUCTS_CATALOG, ProductItem } from '../data/products';
import { useLanguage } from '../context/LanguageContext';
import { useCart, parsePriceNumber } from '../context/CartContext';

export const PRODUCTS_BATCH_SIZE = 8;

interface ProductsSectionProps {
  limit?: number;
  showExploreMore?: boolean;
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({
  limit,
  showExploreMore = false,
}) => {
  const { t, language } = useLanguage();
  const { addItem, totalCount, subtotal } = useCart();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [sankalpName, setSankalpName] = useState('');
  const [sankalpGotra, setSankalpGotra] = useState('');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [modalQty, setModalQty] = useState<number>(1);
  const router = useRouter();

  const handleAddToCart = (item: ProductItem, qty: number = 1) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('astro_token') : null;
    if (!token) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/products';
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    addItem(item, qty);
    setAddedProductId(item.id);
    setTimeout(() => {
      setAddedProductId((current) => (current === item.id ? null : current));
    }, 1600);
  };

  // Infinite Scrolling State (batches of 8)
  const isInfiniteScrollEnabled = !limit;
  const [visibleCount, setVisibleCount] = useState<number>(limit || PRODUCTS_BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Sync search query from URL (?search=... or ?q=...) & custom search events
  useEffect(() => {
    const syncFromUrl = () => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const urlQuery = params.get('search') || params.get('q');
      if (urlQuery !== null && urlQuery !== undefined) {
        setSearchQuery(urlQuery);
        setVisibleCount(limit || PRODUCTS_BATCH_SIZE);
      }
    };

    syncFromUrl();

    const handleSearchEvent = (e: any) => {
      const q = e?.detail ?? '';
      setSearchQuery(q);
      setVisibleCount(limit || PRODUCTS_BATCH_SIZE);
    };

    window.addEventListener('popstate', syncFromUrl);
    window.addEventListener('astro-search-change', handleSearchEvent);

    return () => {
      window.removeEventListener('popstate', syncFromUrl);
      window.removeEventListener('astro-search-change', handleSearchEvent);
    };
  }, [limit]);

  const filterCategories = [
    {
      id: 'all',
      labelEn: 'All Bracelets',
      labelHi: 'सभी ब्रेसलेट',
      count: PRODUCTS_CATALOG.length,
    },
    {
      id: 'wealth',
      labelEn: 'Wealth & Prosperity',
      labelHi: 'धन एवं समृद्धि',
      count: PRODUCTS_CATALOG.filter((p) => p.category === 'wealth').length,
    },
    {
      id: 'protection',
      labelEn: 'Protection & Nazar',
      labelHi: 'सुरक्षा एवं नज़र दोष',
      count: PRODUCTS_CATALOG.filter((p) => p.category === 'protection').length,
    },
    {
      id: 'love',
      labelEn: 'Love & Peace',
      labelHi: 'प्रेम एवं शांति',
      count: PRODUCTS_CATALOG.filter((p) => p.category === 'love').length,
    },
    {
      id: 'healing',
      labelEn: 'Healing & Balance',
      labelHi: 'आरोग्य एवं संतुलन',
      count: PRODUCTS_CATALOG.filter((p) => p.category === 'healing').length,
    },
  ];

  // 1. Filter by category
  let list = activeCategory === 'all'
    ? PRODUCTS_CATALOG
    : PRODUCTS_CATALOG.filter((p) => p.category === activeCategory);

  // 2. Filter by search query (name, tag, desc, planet, categoryLabel)
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter((p) => {
      const nameEn = p.name.toLowerCase();
      const nameHi = (p.nameHi || '').toLowerCase();
      const descEn = p.desc.toLowerCase();
      const descHi = (p.descHi || '').toLowerCase();
      const tagEn = p.tag.toLowerCase();
      const tagHi = (p.tagHi || '').toLowerCase();
      const planetEn = (p.planet || '').toLowerCase();
      const catLabel = p.categoryLabel.toLowerCase();
      return (
        nameEn.includes(q) ||
        nameHi.includes(q) ||
        descEn.includes(q) ||
        descHi.includes(q) ||
        tagEn.includes(q) ||
        tagHi.includes(q) ||
        planetEn.includes(q) ||
        catLabel.includes(q)
      );
    });
  }

  // 3. Sort
  if (sortBy === 'price-low') {
    list = [...list].sort((a, b) => parsePriceNumber(a.price) - parsePriceNumber(b.price));
  } else if (sortBy === 'price-high') {
    list = [...list].sort((a, b) => parsePriceNumber(b.price) - parsePriceNumber(a.price));
  } else if (sortBy === 'rating') {
    list = [...list].sort((a, b) => b.rating - a.rating);
  }

  const filteredProducts = list;

  // Display items based on pagination or limit
  const displayProducts = isInfiniteScrollEnabled
    ? filteredProducts.slice(0, visibleCount)
    : filteredProducts.slice(0, limit);

  const hasMore = isInfiniteScrollEnabled && visibleCount < filteredProducts.length;

  // Reset pagination whenever filters, search, or sort change
  const resetPagination = () => {
    setVisibleCount(PRODUCTS_BATCH_SIZE);
    setLoadError(null);
    setIsLoadingMore(false);
  };

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    resetPagination();
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    resetPagination();
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (query.trim()) {
        url.searchParams.set('search', query.trim());
      } else {
        url.searchParams.delete('search');
        url.searchParams.delete('q');
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleSortChange = (newSort: 'featured' | 'price-low' | 'price-high' | 'rating') => {
    setSortBy(newSort);
    resetPagination();
  };

  // Safe batch loader: loads the next 8 items, preventing concurrent / duplicate requests
  const loadNextBatch = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    setLoadError(null);

    const timer = setTimeout(() => {
      try {
        setVisibleCount((prev) => Math.min(prev + PRODUCTS_BATCH_SIZE, filteredProducts.length));
        setIsLoadingMore(false);
      } catch (err) {
        setLoadError(
          language === 'hi'
            ? 'उत्पाद लोड करने में समस्या आई। कृपया पुनः प्रयास करें।'
            : 'Failed to load additional products. Please try again.'
        );
        setIsLoadingMore(false);
      }
    }, 380);

    return () => clearTimeout(timer);
  }, [isLoadingMore, hasMore, filteredProducts.length, language]);

  // IntersectionObserver for automated infinite scroll
  useEffect(() => {
    if (!isInfiniteScrollEnabled) return;
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          loadNextBatch();
        }
      },
      {
        root: null,
        rootMargin: '200px', // trigger before reaching bottom
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
      observer.disconnect();
    };
  }, [isInfiniteScrollEnabled, hasMore, isLoadingMore, loadNextBatch]);

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
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-4xl mx-auto" role="tablist" aria-label="Product Categories">
          {filterCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const label = language === 'hi' ? `${cat.labelHi} (${cat.count})` : `${cat.labelEn} (${cat.count})`;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                role="tab"
                aria-selected={isActive}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm ${
                  isActive
                    ? 'bg-[#5B0D15] text-amber-100 shadow-md shadow-rose-950/20 border border-amber-400/80 scale-105 ring-2 ring-amber-400/40'
                    : 'bg-white/80 hover:bg-amber-50 text-stone-700 border border-amber-200/80'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls (Shown on full store / shop view) */}
        {isInfiniteScrollEnabled && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl mx-auto px-2">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t('Search energized bracelets...', 'सिद्ध ब्रेसलेट खोजें...')}
                className="w-full pl-9 pr-9 py-2 rounded-full bg-white border border-stone-200 focus:border-amber-400 focus:outline-none text-xs sm:text-sm text-stone-800 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Dropdown & Product Counter */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-1.5 text-xs text-stone-600">
                <ArrowUpDown className="w-3.5 h-3.5 text-amber-700" />
                <span className="font-medium hidden sm:inline">{t('Sort:', 'क्रम:')}</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as any)}
                  className="bg-white border border-stone-200 rounded-full px-3 py-1.5 text-xs text-stone-700 focus:outline-none focus:border-amber-400 cursor-pointer shadow-sm"
                >
                  <option value="featured">{t('Featured (Default)', 'विशेष (डिफ़ॉल्ट)')}</option>
                  <option value="price-low">{t('Price: Low to High', 'मूल्य: कम से ज्यादा')}</option>
                  <option value="price-high">{t('Price: High to Low', 'मूल्य: ज्यादा से कम')}</option>
                  <option value="rating">{t('Highest Rated', 'उच्चतम रेटिंग')}</option>
                </select>
              </div>

              <div className="text-xs text-stone-500 font-medium">
                <span>{displayProducts.length}</span> / <span>{filteredProducts.length}</span> {t('items', 'सामग्री')}
              </div>
            </div>
          </div>
        )}

        {/* Search Results Banner */}
        {searchQuery.trim() && (
          <div className="flex items-center justify-between bg-amber-50/90 border border-amber-300/80 rounded-2xl p-3 sm:px-4 max-w-5xl mx-auto shadow-2xs">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[#3B1E22]">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                {t('Results for', 'इसके लिए परिणाम:')}{' '}
                <strong className="text-[#5B0D15]">"{searchQuery}"</strong>
                <span className="text-stone-500 ml-1.5 font-normal">
                  ({filteredProducts.length} {t('products found', 'उत्पाद मिले')})
                </span>
              </span>
            </div>
            <button
              onClick={() => handleSearchChange('')}
              className="text-xs font-bold text-[#800000] hover:text-[#5B0D15] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{t('Clear search', 'हटाएं')}</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Empty State when no products match */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 px-4 max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-100/70 border border-amber-300 text-amber-800 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#3B1E22]">
              {t('No Products Found', 'कोई उत्पाद नहीं मिला')}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {t(
                `We couldn't find any products matching "${searchQuery}". Try searching for bracelets like "Tiger Eye", "Rudraksha", "Pyrite", or "Seven Chakra".`,
                `"${searchQuery}" से मेल खाने वाला कोई उत्पाद नहीं मिला। कृपया "Tiger Eye", "Rudraksha", या "Pyrite" खोजें।`
              )}
            </p>
            <button
              onClick={() => {
                handleSearchChange('');
                setActiveCategory('all');
              }}
              className="px-4 py-2 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              {t('View All Products', 'सभी उत्पाद देखें')}
            </button>
          </div>
        )}

        {/* Product Cards Grid: Featuring the exact Tiger Eye card design with Default & Hover states */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7 items-stretch justify-center" id="products-grid">
          
          {displayProducts.map((item) => {
            const prodName = language === 'hi' && item.nameHi ? item.nameHi : item.name;
            const prodTag = language === 'hi' && item.tagHi ? item.tagHi : item.tag;
            const prodDesc = language === 'hi' && item.descHi ? item.descHi : item.desc;

            return (
              <div
                key={item.id}
                onClick={() => {
                  setModalQty(1);
                  setSelectedProduct(item);
                }}
                className="group relative rounded-3xl overflow-hidden bg-white border-2 border-amber-300 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* 1. Base Product Image Area */}
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-stone-100">
                  <Image
                    src={item.image}
                    alt={prodName}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* Floating Price Pill at Top Right */}
                  <div className="absolute top-3.5 right-3.5 z-10 px-3.5 py-1.5 rounded-full bg-[#2C231C]/90 backdrop-blur-md border border-amber-400/50 shadow-md">
                    <span className="font-serif font-bold text-xs sm:text-sm text-amber-300 tracking-wide">
                      {item.price}
                    </span>
                  </div>
                </div>

                {/* 2. White Card Content Area */}
                <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 bg-white">
                  <div className="space-y-1.5">
                    {/* Category / Energy Subtitle Tag in Deep Maroon */}
                    <span className="text-[11px] sm:text-xs font-bold text-[#800000] uppercase tracking-wider block">
                      {prodTag}
                    </span>

                    {/* Product Name in Bold Navy/Midnight Serif */}
                    <h3 className="font-serif font-bold text-base sm:text-lg text-[#0F1E36] tracking-wide uppercase line-clamp-1 group-hover:text-[#800000] transition-colors">
                      {prodName}
                    </h3>
                  </div>

                  {/* Subtle Divider Line */}
                  <hr className="my-3.5 border-stone-200/80" />

                  {/* Bottom Row: Rating & Details Link */}
                  <div className="flex items-center justify-between">
                    {/* Rating & Review Count */}
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                      <span className="text-stone-400 text-sm">★</span>
                      <span>
                        {item.rating || 4.9} ({item.reviewsCount || 342})
                      </span>
                    </div>

                    {/* Details Link with Right Arrow */}
                    <span className="text-xs sm:text-sm font-serif font-bold text-[#800000] group-hover:text-[#5B0D15] flex items-center gap-1 group-hover:gap-1.5 transition-all">
                      <span>{t('Details', 'विवरण')}</span>
                      <span className="text-base font-sans">→</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State when search/filter returns zero products */}
        {filteredProducts.length === 0 && (
          <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-stone-200 p-8 max-w-lg mx-auto">
            <Filter className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="font-serif font-semibold text-lg text-stone-700">
              {t('No products found matching your search', 'आपकी खोज के अनुसार कोई उत्पाद नहीं मिला')}
            </h3>
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
                resetPagination();
              }}
              className="px-5 py-2 rounded-full bg-[#5B0D15] text-white text-xs font-semibold hover:bg-rose-950 transition-colors"
            >
              {t('Reset Filters & View All', 'फ़िल्टर हटाएं एवं सभी देखें')}
            </button>
          </div>
        )}

        {/* Infinite Scroll Sentinel & Controls (Batches of 8) */}
        {isInfiniteScrollEnabled && (
          <div
            ref={sentinelRef}
            className="w-full py-6 flex flex-col items-center justify-center space-y-4"
            aria-live="polite"
          >
            {/* Loading Indicator */}
            {isLoadingMore && (
              <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-amber-50/90 border border-amber-300/80 text-[#5B0D15] shadow-md animate-pulse">
                <Loader2 className="w-5 h-5 animate-spin text-amber-700" />
                <span className="text-xs sm:text-sm font-semibold">
                  {t('Loading next sacred products...', 'अगले सिद्ध उत्पाद लोड हो रहे हैं...')}
                </span>
              </div>
            )}

            {/* Error Alert with Retry */}
            {loadError && (
              <div className="flex flex-col items-center gap-2 p-5 bg-rose-50 border border-rose-200 rounded-3xl text-rose-800 text-sm max-w-md text-center shadow-sm">
                <div className="flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>{loadError}</span>
                </div>
                <button
                  onClick={() => {
                    setLoadError(null);
                    loadNextBatch();
                  }}
                  className="mt-2 px-5 py-2 bg-[#5B0D15] text-white rounded-full text-xs font-bold hover:bg-rose-900 transition-colors cursor-pointer shadow-sm"
                >
                  {t('Retry Loading', 'पुनः प्रयास करें')}
                </button>
              </div>
            )}

            {/* Accessible Fallback "Load More" Button */}
            {hasMore && !isLoadingMore && (
              <div className="text-center pt-2">
                <button
                  onClick={loadNextBatch}
                  className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full bg-white hover:bg-amber-50 border border-stone-300 hover:border-amber-400 text-stone-800 hover:text-[#5B0D15] text-xs sm:text-sm font-bold shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
                  aria-label={t('Load next 8 products', 'अगले 8 उत्पाद लोड करें')}
                >
                  <span>{t('Load More Sacred Products', 'और भी सिद्ध उत्पाद देखें')}</span>
                  <span className="text-[11px] text-amber-700 font-semibold bg-amber-100/80 px-2.5 py-0.5 rounded-full">
                    +8 ({displayProducts.length}/{filteredProducts.length})
                  </span>
                </button>
              </div>
            )}

            {/* End of Products Completion Banner */}
            {!hasMore && filteredProducts.length > 0 && (
              <div className="w-full max-w-xl mx-auto my-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-amber-50/80 to-stone-100/70 border border-amber-200/80 text-center shadow-sm space-y-2">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-200/60 text-amber-900 mb-1">
                  <CheckCircle2 className="w-5 h-5 text-amber-800" />
                </div>
                <h4 className="font-serif font-bold text-base sm:text-lg text-[#2A1810]">
                  ✦ {t('You Have Explored All Sacred Products', 'आपने सभी सिद्ध उत्पाद देख लिए हैं')} ✦
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                  {t(
                    `All ${filteredProducts.length} energized talismans and bracelets have been loaded. 100% lab certified and energized in Varanasi.`,
                    `इस श्रेणी के सभी ${filteredProducts.length} सिद्ध उत्पाद प्रदर्शित हैं। 100% लैब प्रमाणित एवं काशी में प्राण-प्रतिष्ठित।`
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Explore More Products Button after limited cards (e.g. on homepage) */}
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
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl rounded-3xl bg-[#FAF7F2] border-2 border-amber-300/90 shadow-2xl overflow-hidden my-8"
          >
            {/* Modal Close Button */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-stone-900/60 hover:bg-stone-900 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Product Image Side */}
              <div className="relative h-72 sm:h-96 md:h-full bg-stone-950 min-h-[300px]">
                <Image
                  src={selectedProduct.image}
                  alt={language === 'hi' && selectedProduct.nameHi ? selectedProduct.nameHi : selectedProduct.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
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

                {/* Quantity selector & Add to Cart button */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between bg-stone-100 rounded-2xl p-2 px-3 border border-stone-200">
                    <span className="text-xs font-semibold text-stone-700">
                      {t('Quantity:', 'मात्रा:')}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                        className="w-7 h-7 rounded-full bg-white border border-stone-300 flex items-center justify-center text-stone-700 hover:bg-amber-100 cursor-pointer transition-colors"
                        disabled={modalQty <= 1}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-sm text-stone-900 w-6 text-center">{modalQty}</span>
                      <button
                        type="button"
                        onClick={() => setModalQty((q) => Math.min(10, q + 1))}
                        className="w-7 h-7 rounded-full bg-white border border-stone-300 flex items-center justify-center text-stone-700 hover:bg-amber-100 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      onClick={() => {
                        handleAddToCart(selectedProduct, modalQty);
                      }}
                      className={`flex-1 py-3 px-4 rounded-full font-serif font-bold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        addedProductId === selectedProduct.id
                          ? 'bg-emerald-700 text-white shadow-emerald-900/30'
                          : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#3B1E22] shadow-amber-950/30 hover:scale-[1.02]'
                      }`}
                    >
                      {addedProductId === selectedProduct.id ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-200" />
                          <span>{t('Added to Cart ✓', 'कार्ट में जोड़ा गया ✓')}</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          <span>
                            {t(
                              `Add to Cart • ₹${(parsePriceNumber(selectedProduct.price) * modalQty).toLocaleString('en-IN')}`,
                              `कार्ट में जोड़ें • ₹${(parsePriceNumber(selectedProduct.price) * modalQty).toLocaleString('en-IN')}`
                            )}
                          </span>
                        </>
                      )}
                    </button>

                    <Link
                      href="/cart"
                      className="py-3 px-5 rounded-full bg-[#5B0D15] hover:bg-[#72111c] text-amber-100 font-serif font-bold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] text-center"
                    >
                      <span>{t('Go to Cart', 'कार्ट देखें')}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                    </Link>
                  </div>

                  {/* Secondary WhatsApp option */}
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => openWhatsAppInquiry(selectedProduct)}
                      className="text-[11px] text-stone-500 hover:text-emerald-700 underline font-medium cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>{t('Prefer WhatsApp? Order via WhatsApp inquiry', 'WhatsApp पसंद है? WhatsApp पर ऑर्डर करें')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Cart Bar for quick access */}
      {totalCount > 0 && (
        <aside aria-label="Shopping Cart Bar" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-lg bg-[#2A0E13]/95 backdrop-blur-md border border-amber-400/80 rounded-full px-5 py-3 shadow-2xl flex items-center justify-between text-amber-100 animate-slideUp">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-amber-400" />
              <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {totalCount}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold">
                {totalCount} {totalCount === 1 ? t('item in cart', 'सामग्री कार्ट में') : t('items in cart', 'सामग्रियां कार्ट में')}
              </p>
              <p className="text-xs font-bold text-amber-300">
                ₹{subtotal.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          <Link
            href="/cart"
            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#2A0E13] font-serif font-bold text-xs shadow-md hover:scale-105 transition-all flex items-center gap-1"
          >
            <span>{t('Checkout Now', 'ऑर्डर पूरा करें')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </aside>
      )}

    </section>
  );
};
