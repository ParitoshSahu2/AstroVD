'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
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
  LayoutGrid,
  Heart,
  Award,
  MessageCircle,
  Star,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { PRODUCTS_CATALOG, ProductItem, formatTitleCase } from '../data/products';
import { useLanguage } from '../context/LanguageContext';
import { useCart, parsePriceNumber } from '../context/CartContext';

export const PRODUCTS_BATCH_SIZE = 8;

interface ProductsSectionProps {
  limit?: number;
  showExploreMore?: boolean;
  showHeader?: boolean;
  showCheckoutBar?: boolean;
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({
  limit,
  showExploreMore = false,
  showHeader = limit !== undefined,
  showCheckoutBar,
}) => {
  const { t, language } = useLanguage();
  const { addItem, updateQuantity, removeItem, items, totalCount, subtotal } = useCart();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [modalQty, setModalQty] = useState<number>(1);
  const [isCheckoutBarHovered, setIsCheckoutBarHovered] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  // The checkout bar should only ever be visible on dedicated product pages, never on the homepage
  const isProductPage = Boolean(pathname?.startsWith('/products') || pathname?.startsWith('/shop'));
  const isHomePage = pathname === '/' || pathname === '' || limit !== undefined;
  const allowCheckoutBar = showCheckoutBar !== undefined ? showCheckoutBar : (isProductPage && !isHomePage);

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
    }, 2000);
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

  // Lock body scroll and listen for Escape key when product view is active
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setSelectedProduct(null);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedProduct]);

  const filterCategories = [
    {
      id: 'all',
      labelEn: 'All Bracelets',
      labelHi: 'सभी ब्रेसलेट',
      count: PRODUCTS_CATALOG.length,
      icon: LayoutGrid,
    },
    {
      id: 'wealth',
      labelEn: 'Wealth & Prosperity',
      labelHi: 'धन एवं समृद्धि',
      count: PRODUCTS_CATALOG.filter((p) => p.category === 'wealth').length,
      icon: Sparkles,
    },
    {
      id: 'protection',
      labelEn: 'Protection & Nazar',
      labelHi: 'सुरक्षा एवं नज़र दोष',
      count: PRODUCTS_CATALOG.filter((p) => p.category === 'protection').length,
      icon: ShieldCheck,
    },
    {
      id: 'love',
      labelEn: 'Love & Peace',
      labelHi: 'प्रेम एवं शांति',
      count: PRODUCTS_CATALOG.filter((p) => p.category === 'love').length,
      icon: Heart,
    },
    {
      id: 'healing',
      labelEn: 'Healing & Balance',
      labelHi: 'आरोग्य एवं संतुलन',
      count: PRODUCTS_CATALOG.filter((p) => p.category === 'healing').length,
      icon: Award,
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
    const text = `Hello AstroVD, I would like to order the consecrated ${prodName} (${product.price}).`;
    window.open(`https://wa.me/919876543210?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section
      id="shop"
      className={`relative w-full bg-[#FCF8ED] ${
        showHeader ? 'py-16 lg:py-20' : 'pt-3 sm:pt-4 pb-14 sm:pb-16 lg:pb-20'
      } px-4 sm:px-6 lg:px-12 overflow-hidden selection:bg-amber-400`}
    >
      
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

      <div
        className={`max-w-7xl mx-auto ${
          showHeader ? 'space-y-10 sm:space-y-12' : 'space-y-4 sm:space-y-5'
        } relative z-10`}
      >
        
        {/* Section Header */}
        {showHeader && (
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#4A151B] leading-tight">
              {t('Energized Spiritual Gemstones & Sacred Bracelets', 'प्राण-प्रतिष्ठित आध्यात्मिक रत्न एवं सिद्ध ब्रेसलेट')}
            </h2>
            <p className="text-xs sm:text-sm text-[#706256] leading-relaxed">
              {t(
                'Every bracelet is hand-selected, lab-certified, and energized through authentic Vedic Prana-Pratishtha rituals in Varanasi with your personal Gotra & Nakshatra sankalp.',
                'प्रत्येक ब्रेसलेट 100% शुद्ध, लैब प्रमाणित और वाराणसी में आपके नाम, गोत्र व नक्षत्र संकल्प द्वारा वैदिक प्राण-प्रतिष्ठा से अभिमंत्रित है।'
              )}
            </p>
          </div>
        )}

        {/* Search & Category Filter Bar */}
        {isInfiniteScrollEnabled && (
          <>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/85 backdrop-blur-md px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl sm:rounded-3xl border border-amber-200/90 shadow-sm">
              {/* Search Input */}
              <div className="relative w-full sm:max-w-md">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder={t('Search energized bracelets (e.g. Tiger Eye, Rudraksha, Pyrite)...', 'सिद्ध ब्रेसलेट खोजें (उदा. टाइगर आई, रुद्राक्ष, पाइराइट)...')}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-9 py-2 sm:py-2.5 rounded-full bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-800 placeholder-stone-400 shadow-xs focus:bg-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-300 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Dropdown */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <div className="flex items-center gap-1.5 text-stone-700 text-xs sm:text-sm font-semibold">
                  <Filter className="w-4 h-4 text-amber-700" />
                  <span>{t('Category:', 'श्रेणी:')}</span>
                </div>
                <select
                  value={activeCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="px-3.5 sm:px-4 py-2 rounded-full bg-white border border-amber-300 text-xs sm:text-sm font-semibold text-stone-800 shadow-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {filterCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {language === 'hi' ? `${c.labelHi} (${c.count})` : `${c.labelEn} (${c.count})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Count & Category Pills Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
              <div className="font-bold text-stone-800 text-xs sm:text-sm flex items-center gap-2">
                
                <span>
                  {language === 'hi' ? (
                    <>प्रदर्शित <span className="text-[#5B0D15] font-extrabold">{displayProducts.length}</span> कुल <span className="text-stone-900 font-extrabold">{filteredProducts.length}</span> प्राण-प्रतिष्ठित उत्पाद</>
                  ) : (
                    <>Showing <span className="text-[#5B0D15] font-extrabold">{displayProducts.length}</span> of <span className="text-stone-900 font-extrabold">{filteredProducts.length}</span> energized products</>
                  )}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Product Categories">
                {filterCategories.map((cat) => {
                  const isSelected = activeCategory === cat.id;
                  const label = language === 'hi' ? `${cat.labelHi} (${cat.count})` : `${cat.labelEn} (${cat.count})`;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
                      role="tab"
                      aria-selected={isSelected}
                      className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shadow-xs ${
                        isSelected
                          ? 'bg-[#5B0D15] text-white shadow-sm shadow-rose-950/20 scale-[1.02] ring-2 ring-amber-400/40'
                          : 'bg-white hover:bg-amber-50 text-stone-700 border border-stone-200 hover:border-amber-300'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Search Results Banner */}
        {searchQuery.trim() && (
          <div className="flex items-center justify-between bg-white border border-[#EAE0D0] rounded-xl p-3 sm:px-4 max-w-5xl mx-auto shadow-2xs">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[#2D1408]">
              
              <span>
                {t('Results for', 'इसके लिए परिणाम:')}{' '}
                <strong className="text-[#522311]">"{searchQuery}"</strong>
                <span className="text-[#8C7E72] ml-1.5 font-normal">
                  ({filteredProducts.length} {t('products found', 'उत्पाद मिले')})
                </span>
              </span>
            </div>
            <button
              onClick={() => handleSearchChange('')}
              className="text-xs font-bold text-[#522311] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{t('Clear search', 'हटाएं')}</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Empty State when no products match */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 px-4 max-w-md mx-auto space-y-4 bg-white rounded-2xl border border-[#EAE0D0] p-6 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-[#FAF6ED] border border-[#EAE0D0] text-[#522311] flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#2D1408]">
              {t('No Products Found', 'कोई उत्पाद नहीं मिला')}
            </h3>
            <p className="text-xs text-[#706256] leading-relaxed">
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
              className="px-4 py-2 rounded-full bg-[#522311] hover:bg-[#3D1A0D] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              {t('View All Products', 'सभी उत्पाद देखें')}
            </button>
          </div>
        )}

        {/* Product Cards Grid: Sleek Card Design matching the Services Page */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-6 items-stretch justify-center" id="products-grid">
          {displayProducts.map((item) => {
            const rawName = language === 'hi' && item.nameHi ? item.nameHi : item.name;
            const prodName = formatTitleCase(rawName);
            const prodTag = language === 'hi' && item.tagHi ? item.tagHi : item.tag;
            const prodDesc = language === 'hi' && item.descHi ? item.descHi : item.desc;
            const cartItem = items.find((i) => i.id === item.id);
            const quantityInCart = cartItem ? cartItem.quantity : 0;

            return (
              <div
                key={item.id}
                className="group relative rounded-2xl overflow-hidden bg-white border border-[#EAE0D0] shadow-xs hover:border-[#D6C4AD] hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full"
              >
                {/* 1. Base Product Image Area */}
                <div
                  onClick={() => {
                    setModalQty(1);
                    setSelectedProduct(item);
                  }}
                  className="relative w-full aspect-[4/3] overflow-hidden bg-stone-100 cursor-pointer"
                >
                  <Image
                    src={item.image}
                    alt={prodName}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                </div>

                {/* 2. White Card Content Area - Snug spacing directly leading into price and button */}
                <div className="p-4 pt-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* 1. Category / Energy Subtitle Tag - Clean single line */}
                    <span
                      className="text-[9.5px] sm:text-[10px] xl:text-[10.5px] font-bold uppercase tracking-[0.05em] text-[#C05621] block truncate mb-1"
                      title={prodTag}
                    >
                      {prodTag}
                    </span>

                    {/* 2. Product Name in Elegant Title Case Serif */}
                    <h3
                      onClick={() => {
                        setModalQty(1);
                        setSelectedProduct(item);
                      }}
                      className="font-serif font-bold text-[16.5px] sm:text-[17.5px] text-[#2A1810] group-hover:text-[#800000] transition-colors leading-snug cursor-pointer line-clamp-1 tracking-tight"
                      title={prodName}
                    >
                      {prodName}
                    </h3>

                    {/* 3. Product Description in Warm Slate Stone */}
                    <p className="text-[12px] text-[#5C554E] leading-relaxed mt-1 line-clamp-2 font-normal">
                      {prodDesc}
                    </p>
                  </div>

                  {/* 3. Bottom Card Bar: Price & Action Buttons - Closely connected with snug gap */}
                  <div className="mt-3 pt-2.5 border-t border-[#F2ECE1] flex items-center justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-serif font-bold text-base sm:text-lg text-[#800000]">
                        {item.price}
                      </span>
                      {item.originalPrice && (
                        <span className="text-[11px] text-stone-400 line-through">
                          {item.originalPrice}
                        </span>
                      )}
                    </div>

                    <div className="relative flex items-center gap-2">
                      {/* Added to Cart Popup Tooltip for 2 seconds */}
                      {addedProductId === item.id && (
                        <div className="absolute -top-10 right-0 z-30 pointer-events-none flex flex-col items-center animate-fadeIn">
                          <div className="px-2.5 py-1 bg-[#1C090C] text-emerald-300 text-[11px] font-bold rounded-lg shadow-xl flex items-center gap-1.5 whitespace-nowrap border border-amber-400/60 ring-1 ring-black/40">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{t('Added to Cart', 'कार्ट में जोड़ा गया')}</span>
                          </div>
                          {/* Triangle indicator pointing down to button */}
                          <div className="w-2 h-2 bg-[#1C090C] rotate-45 -mt-1 border-r border-b border-amber-400/60" />
                        </div>
                      )}

                      {quantityInCart === 0 ? (

                        /* Clean Add to Cart button (rounded with clean, subtle hover effect) */

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(item, 1);
                          }}

                          className="px-4 py-1.5 rounded-full bg-[#800000] hover:bg-[#5B0D15] text-white text-xs font-semibold shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 cursor-pointer text-center"

                          aria-label={t(`Add ${item.name} to cart`, `${item.name} कार्ट में जोड़ें`)}
                        >
                          {t('Add to Cart', 'कार्ट में जोड़ें')}
                        </button>
                      ) : (
                        /* Jumps to + 1 and -1 quantity selector */
                        <div
                          onClick={(e) => e.stopPropagation()}

                          className="flex items-center bg-[#5B0D15] text-white rounded-full px-1.5 py-1 shadow-xs border border-amber-400/30"

                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (quantityInCart <= 1) {
                                removeItem(item.id);
                              } else {
                                updateQuantity(item.id, quantityInCart - 1);
                              }
                            }}

                            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 text-white font-bold cursor-pointer transition-colors active:scale-90"

                            aria-label={t('Decrease quantity', 'मात्रा घटाएं')}
                          >
                            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>

                          <span className="w-7 text-center font-bold text-xs text-amber-100 select-none">
                            {quantityInCart}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(item.id, quantityInCart + 1);
                            }}

                            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 text-white font-bold cursor-pointer transition-colors active:scale-90"

                            aria-label={t('Increase quantity', 'मात्रा बढ़ाएं')}
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>
                      )}
                    </div>
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

      {/* ================= REDUCED WIDTH PRODUCT DETAILS MODAL ================= */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto animate-fadeIn"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedProduct(null)}
        >
          {/* Modal Container with Contained Width */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[90vh] bg-[#FAF7F2] rounded-3xl border border-amber-300/80 shadow-2xl flex flex-col md:flex-row overflow-hidden my-auto"
          >
            {/* Modal Close Button */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-3.5 right-3.5 z-40 w-10 h-10 rounded-full bg-stone-900/80 hover:bg-stone-900 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xl border border-white/20"
              aria-label="Close product view"
              title={t('Close (Esc)', 'बंद करें (Esc)')}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Product Image Side - Contained & balanced */}
            <div className="relative w-full md:w-5/12 min-h-[260px] sm:min-h-[320px] md:min-h-full shrink-0 overflow-hidden bg-stone-100">
              <Image
                src={selectedProduct.image}
                alt={language === 'hi' && selectedProduct.nameHi ? selectedProduct.nameHi : selectedProduct.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 42vw"
                className="object-cover object-center w-full h-full select-none"
              />
            </div>

            {/* Details & Actions Side */}
            <div className="w-full md:w-7/12 p-5 sm:p-6 md:p-7 flex flex-col justify-between overflow-y-auto bg-[#FAF7F2] border-t md:border-t-0 md:border-l border-amber-200/80 space-y-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-[0.2em] text-[#800000] uppercase block">
                  {language === 'hi' && selectedProduct.tagHi ? selectedProduct.tagHi : selectedProduct.tag}
                </span>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {t('Govt Lab Certified', 'सरकारी लैब द्वारा प्रमाणित')}
                </span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A1810] tracking-tight leading-snug">
                {formatTitleCase(language === 'hi' && selectedProduct.nameHi ? selectedProduct.nameHi : selectedProduct.name)}
              </h3>
              <div className="flex items-center gap-3">
                <span className="font-serif text-2xl sm:text-3xl font-bold text-[#800000]">{selectedProduct.price}</span>
                <span className="text-stone-400 line-through text-sm sm:text-base">{selectedProduct.originalPrice}</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed line-clamp-3">
                {language === 'hi' && selectedProduct.descHi ? selectedProduct.descHi : selectedProduct.desc}
              </p>

              {/* Sacred Astro Attributes */}
              <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80">
                  <span className="text-stone-500 text-[10px] uppercase font-bold block">{t('Ruling Planet', 'स्वामी ग्रह')}</span>
                  <span className="font-semibold text-stone-900 text-xs truncate block">
                    {language === 'hi' && selectedProduct.planetHi ? selectedProduct.planetHi : selectedProduct.planet}
                  </span>


                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80">
                  <span className="text-stone-500 text-[10px] uppercase font-bold block">{t('Active Chakra', 'सक्रिय चक्र')}</span>
                  <span className="font-semibold text-stone-900 text-xs truncate block">
                    {language === 'hi' && selectedProduct.chakraHi ? selectedProduct.chakraHi : selectedProduct.chakra}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80">
                  <span className="text-stone-500 text-[10px] uppercase font-bold block">{t('Auspicious Day', 'शुभ धारण वार')}</span>
                  <span className="font-semibold text-stone-900 text-xs truncate block">
                    {language === 'hi' && selectedProduct.dayToWearHi ? selectedProduct.dayToWearHi : selectedProduct.dayToWear}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80">
                  <span className="text-stone-500 text-[10px] uppercase font-bold block">{t('Bead Spec', 'मनका विवरण')}</span>
                  <span className="font-semibold text-stone-900 text-xs truncate block">
                    {language === 'hi' && selectedProduct.beadSizeHi ? selectedProduct.beadSizeHi : selectedProduct.beadSize}
                  </span>
                </div>
              </div>

              {/* Product-Specific Sacred Energizing Mantra Container */}
              <div className="p-3 sm:p-4 rounded-2xl bg-amber-50/90 border border-amber-300/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#800000] uppercase tracking-wider flex items-center gap-1.5 font-serif">
                    
                    {t('Energizing Beej Mantra', 'धारण एवं सिद्ध बीज मंत्र')}
                  </span>
                  <span className="text-[10px] font-semibold text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded-full border border-amber-300/60">
                    {t('108 Chants', '108 जाप')}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-amber-200/90 text-center shadow-2xs">
                  <p className="font-serif font-bold text-xs sm:text-[14px] text-[#5B0D15] tracking-wide select-all">
                    {selectedProduct.mantra}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10.5px] sm:text-xs text-stone-600 px-1">
                  <span className="truncate">
                    <span className="text-amber-700 font-bold">• {t('Muhurta:', 'शुभ मुहूर्त:')} </span>
                    <span>{language === 'hi' && selectedProduct.dayToWearHi ? selectedProduct.dayToWearHi : selectedProduct.dayToWear}</span>
                  </span>
                  <span className="shrink-0 text-[10px] font-medium text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/70">
                    {t('Chant while wearing', 'धारण करते समय जपें')}
                  </span>
                </div>
              </div>
            </div>

            {/* Single Checkout button directly visible in viewport */}
            <div className="pt-2">

              <button
                type="button"
                onClick={() => {
                  const token = typeof window !== 'undefined' ? localStorage.getItem('astro_token') : null;
                  if (!token) {
                    router.push(`/login?redirect=${encodeURIComponent('/cart')}`);
                    return;
                  }
                  addItem(selectedProduct, modalQty);
                  setSelectedProduct(null);
                  router.push('/cart');
                }}
                className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:via-amber-400 hover:to-amber-500 text-[#2A0E13] font-serif font-bold text-sm sm:text-base shadow-[0_8px_25px_rgba(245,199,126,0.38)] hover:shadow-[0_12px_32px_rgba(245,199,126,0.55)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer group border border-amber-300/60"
              >
                
                <span>
                  {t('Check out', 'चेकआउट करें')} • ₹{(parsePriceNumber(selectedProduct.price) * modalQty).toLocaleString('en-IN')}
                </span>
                <ArrowRight className="w-4 h-4 text-[#2A0E13] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Floating Bottom Cart Bar for quick access - only on product page, never on homepage */}
      {allowCheckoutBar && totalCount > 0 && (

        <aside
          aria-label="Shopping Cart Bar"
          onMouseEnter={() => setIsCheckoutBarHovered(true)}
          onMouseLeave={() => setIsCheckoutBarHovered(false)}
          className="fixed bottom-5 right-5 sm:right-8 z-40 group bg-gradient-to-r from-[#240A0F]/95 via-[#350F16]/95 to-[#240A0F]/95 backdrop-blur-xl border border-amber-400/50 shadow-[0_12px_36px_rgba(0,0,0,0.5),0_0_20px_rgba(245,199,126,0.15)] rounded-full p-1 sm:p-1.5 flex items-center transition-all duration-300 hover:border-amber-400/80 hover:shadow-[0_16px_40px_rgba(0,0,0,0.6),0_0_25px_rgba(245,199,126,0.25)] animate-slideUp cursor-pointer"
        >
          {/* Expanded Info on Hover: Cart icon, items count & Total price */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-out flex items-center select-none whitespace-nowrap ${
              isCheckoutBarHovered
                ? 'max-w-[260px] opacity-100 pl-3 pr-2 gap-2.5'
                : 'max-w-0 opacity-0 p-0 gap-0 pointer-events-none'
            }`}
          >
            <div className="relative w-8 h-8 rounded-full bg-amber-400/15 border border-amber-400/30 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-4 h-4 text-amber-300" />
              <span className="absolute -top-1 -right-1 bg-[#800000] text-amber-100 text-[10px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center border border-amber-300/80 shadow-xs">

                {totalCount}
              </span>
            </div>
            <div className="flex flex-col leading-none min-w-0">
              <span className="text-[10px] font-semibold text-amber-200/80 uppercase tracking-wider truncate">
                {totalCount} {totalCount === 1 ? t('item', 'सामग्री') : t('items', 'सामग्रियां')}
              </span>
              <span className="text-sm font-bold text-white tracking-tight pt-0.5">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Subtle Vertical Divider */}
            <div className="h-6 w-px bg-gradient-to-b from-transparent via-amber-400/40 to-transparent shrink-0 ml-1" />
          </div>

          {/* Black Pill CTA Button: Exactly matching reference design */}
          <Link
            href="/cart"
            className="px-5 py-2.5 rounded-full bg-black hover:bg-stone-900 text-white font-sans font-bold text-xs sm:text-sm shadow-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer whitespace-nowrap group-hover:scale-[1.02] active:scale-95"
          >
            {!isCheckoutBarHovered && (
              <ShoppingCart className="w-3.5 h-3.5 text-white animate-fadeIn shrink-0" />
            )}
            <span>Proceed To Checkout</span>
            <ChevronRight className="w-4 h-4 text-white stroke-[2.5] group-hover:translate-x-1 transition-transform" />
          </Link>
        </aside>
      )}

    </section>
  );
};
