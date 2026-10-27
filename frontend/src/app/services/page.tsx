'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PageHeader } from '../../components/PageHeader';
import { MotionServiceCard } from '../../components/MotionServiceCard';
import { SpatialServiceModal } from '../../components/SpatialServiceModal';
import {
  Search,
  Filter,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  X,
  ChevronDown,
  LayoutGrid,
  Compass,
  Flame,
  Eye,
  BookOpen,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SERVICES_TRANSLATIONS } from '../../data/servicesTranslations';
import { SERVICES_CATALOGUE, ServiceItem } from '../../data/servicesData';

export const SERVICES_BATCH_SIZE = 9;

export default function ServicesPage() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'duration'>('featured');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  // Reset pagination on filter, search, or sort changes
  const resetPagination = () => {
    setVisibleCount(SERVICES_BATCH_SIZE);
    setLoadError(null);
    setIsLoadingMore(false);
  };

  // Sync search query from URL (?search=... or ?q=...) and listen to events
  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const urlSearch = params.get('search') || params.get('q') || '';
      if (urlSearch) {
        setSearchQuery(urlSearch);
        resetPagination();
      }
    };

    syncFromUrl();

    const handleSearchEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ query: string }>;
      if (customEvent.detail?.query !== undefined) {
        setSearchQuery(customEvent.detail.query);
        resetPagination();
      }
    };

    window.addEventListener('popstate', syncFromUrl);
    window.addEventListener('astro-search-change', handleSearchEvent);

    return () => {
      window.removeEventListener('popstate', syncFromUrl);
      window.removeEventListener('astro-search-change', handleSearchEvent);
    };
  }, []);

  // Infinite Scrolling State (Batches of 9)
  const [visibleCount, setVisibleCount] = useState<number>(SERVICES_BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openWhatsApp = (title: string) => {
    window.open(
      `https://wa.me/919826012345?text=Hello%20AstroVD,%20I%20would%20like%20to%20inquire%20about%20booking:%20${encodeURIComponent(title)}`,
      '_blank'
    );
  };

  const services = SERVICES_CATALOGUE;

  const categories = [
    {
      id: 'all',
      labelEn: 'All Services',
      labelHi: 'सभी सेवाएं',
      count: services.length,
      icon: LayoutGrid,
    },
    {
      id: 'astrology',
      labelEn: 'Vedic Astrology',
      labelHi: 'वैदिक ज्योतिष',
      count: services.filter((s) => s.categoryKey === 'astrology').length,
      icon: Compass,
    },
    {
      id: 'pooja',
      labelEn: 'Pooja & Shanti',
      labelHi: 'पूजा व शांति',
      count: services.filter((s) => s.categoryKey === 'pooja').length,
      icon: Flame,
    },
    {
      id: 'occult',
      labelEn: 'Occult & Energy',
      labelHi: 'ऊर्जा व गुप्त विद्याएं',
      count: services.filter((s) => s.categoryKey === 'occult').length,
      icon: Eye,
    },
    {
      id: 'education',
      labelEn: 'Vedic Courses',
      labelHi: 'वैदिक पाठ्यक्रम',
      count: services.filter((s) => s.categoryKey === 'education').length,
      icon: BookOpen,
    },
  ];

  // 1. Filter by category and search query
  let list = services.filter((s) => {
    const matchesCat = selectedCategory === 'all' || s.categoryKey === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCat;

    const matchesQuery =
      s.title.toLowerCase().includes(q) ||
      s.desc.toLowerCase().includes(q) ||
      s.categoryTag.toLowerCase().includes(q) ||
      s.pandit.toLowerCase().includes(q);

    return matchesCat && matchesQuery;
  });

  // 2. Sort
  if (sortBy === 'price-low') {
    list = [...list].sort((a, b) => a.priceNumber - b.priceNumber);
  } else if (sortBy === 'price-high') {
    list = [...list].sort((a, b) => b.priceNumber - a.priceNumber);
  } else if (sortBy === 'duration') {
    list = [...list].sort((a, b) => a.durationMinutes - b.durationMinutes);
  }

  const filtered = list;

  // 3. Paginated visible items (initial 9, then +9 per scroll batch)
  const visibleServices = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
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

  const handleSortChange = (newSort: 'featured' | 'price-low' | 'price-high' | 'duration') => {
    setSortBy(newSort);
    resetPagination();
  };

  // Safe batch loader: loads the next 9 services
  const loadNextBatch = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    setLoadError(null);

    const timer = setTimeout(() => {
      try {
        setVisibleCount((prev) => Math.min(prev + SERVICES_BATCH_SIZE, filtered.length));
        setIsLoadingMore(false);
      } catch (err) {
        setLoadError(
          language === 'hi'
            ? 'सेवाएं लोड करने में समस्या आई। कृपया पुनः प्रयास करें।'
            : 'Failed to load additional services. Please try again.'
        );
        setIsLoadingMore(false);
      }
    }, 380);

    return () => clearTimeout(timer);
  }, [isLoadingMore, hasMore, filtered.length, language]);

  // IntersectionObserver for automated infinite scroll
  useEffect(() => {
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
  }, [hasMore, isLoadingMore, loadNextBatch]);

  return (
    <div className="relative min-h-screen w-full bg-[#FCF8ED] m-0 p-0 overflow-x-clip selection:bg-amber-400">
      <Navbar />

      {/* HERO BANNER SECTION (Panoramic full-bleed backdrop matching reference design) */}
      <section className="relative w-full bg-[#36170A] overflow-hidden pt-24 sm:pt-28 md:pt-30 pb-9 sm:pb-11 px-4 sm:px-6 lg:px-12 min-h-[220px] sm:min-h-[250px] flex items-center">
        {/* Background ambient gradient matching reference tone */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#36170A] via-[#36170A] to-[#2B0E06]" />

        {/* Full-bleed Ultra-HD panoramic backdrop (2400x768): Sacred Vedic Diya, Puja, Hawan & Mandir */}
        <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
          <Image
            src="/services/services_panoramic_ultra_hd.png"
            alt="Sacred Vedic Pooja and Astrological Rituals"
            fill
            priority
            quality={100}
            className="object-cover object-[right_center] md:object-[right_55%]"
          />
          {/* Confined left gradient vignette: protects text readability on left while leaving items 100% luminous with zero haze */}
          <div className="absolute inset-y-0 left-0 w-full sm:w-[65%] md:w-[54%] lg:w-[48%] bg-gradient-to-r from-[#36170A] via-[#36170A]/92 to-transparent" />
        </div>

        {/* Content container - Left Text Information (Clear, readable, with zero obstruction) */}
        <div className="relative max-w-7xl mx-auto w-full z-10">
          <div className="max-w-xl text-left space-y-2">
            <div className="tracking-[0.2em] text-[10px] sm:text-[11px] font-bold text-[#D8B28A] uppercase drop-shadow-sm">
              {t('SACRED VEDIC RITUALS • POOJA & HAVAN • DIVINE BLESSINGS', 'पावन वैदिक अनुष्ठान • पूजा व महाहवन • ईश्वरीय कृपा')}
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-[34px] lg:text-[38px] font-bold text-[#FFFDFB] tracking-wide leading-tight drop-shadow-md">
              {t('Vedic Astrology & Pooja Services', 'वैदिक ज्योतिष एवं पूजा सेवाएं')}
            </h1>
            <p className="text-[#D7C4BD] text-xs sm:text-[13px] leading-relaxed max-w-lg font-normal drop-shadow-sm">
              {t(
                '29 Consecrated Astrological Consultations, Sacred Yagya Rituals, Energy Sciences, and Vedic Education Courses by Dr. Pandit Vishal Dubey (AstroVD).',
                'पूज्य डॉ. पंडित विशाल दुबे (AstroVD) द्वारा 29 सिद्ध ज्योतिष परामर्श, पावन यज्ञ अनुष्ठान, ऊर्जा विज्ञान एवं वैदिक शिक्षण पाठ्यक्रम।'
              )}
            </p>
          </div>
        </div>

        {/* Subtle curved bottom wave divider matching reference design */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none z-10">
          <svg
            className="relative block w-full h-4 sm:h-5 md:h-6"
            viewBox="0 0 1200 40"
            preserveAspectRatio="none"
          >
            <path
              d="M0,14 C350,26 700,32 950,22 C1080,16 1160,8 1200,6"
              fill="none"
              stroke="#D8A868"
              strokeWidth="1.2"
              strokeOpacity="0.45"
            />
            <path
              d="M0,14 C350,26 700,32 950,22 C1080,16 1160,8 1200,6 L1200,40 L0,40 Z"
              fill="#FCF8ED"
            />
          </svg>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-9 space-y-6 sm:space-y-7">
        
        {/* Unified Search & Sort Bar (Matching Products Page) */}
        <div className="bg-white rounded-full border border-[#EAE0D0] shadow-xs px-4 py-2 sm:py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex items-center w-full sm:flex-1">
            <Search className="w-4 h-4 text-[#9E9082] shrink-0 ml-1" />
            <input
              type="text"
              placeholder={t('Search services (e.g. Mangal Dosh, Kundli, Tarot)...', 'सेवाएं खोजें (उदा. मंगल दोष, कुंडली, टैरो)...')}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-2.5 pr-8 py-1 bg-transparent text-xs sm:text-sm text-[#2D1408] placeholder-[#9E9082] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="text-[#9E9082] hover:text-[#522311] p-1 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0 sm:border-l sm:border-[#EAE0D0] sm:pl-4 w-full sm:w-auto justify-end">
            <span className="text-xs text-[#8C7E72] font-medium">
              {t('Sort by', 'क्रम')}
            </span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as any)}
                className="appearance-none pl-3 pr-8 py-1.5 rounded-lg bg-[#FAF6ED] hover:bg-[#F5EFE3] border border-[#EAE0D0] text-xs font-semibold text-[#2D1408] shadow-2xs focus:outline-none cursor-pointer"
              >
                <option value="featured">{t('Featured', 'विशेष (डिफ़ॉल्ट)')}</option>
                <option value="price-low">{t('Price: Low to High', 'मूल्य: कम से ज्यादा')}</option>
                <option value="price-high">{t('Price: High to Low', 'मूल्य: ज्यादा से कम')}</option>
                <option value="duration">{t('Duration: Short to Long', 'अवधि: कम से ज्यादा')}</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#8C7E72] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Category Pill Buttons (Exact Match to Products Design System) */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth" role="tablist" aria-label="Service Categories">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const IconComponent = cat.icon || LayoutGrid;
            const label = language === 'hi' ? `${cat.labelHi} (${cat.count})` : `${cat.labelEn} (${cat.count})`;

            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                role="tab"
                aria-selected={isSelected}
                className={`rounded-full px-3.5 py-2 text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#522311] text-white shadow-xs border border-[#522311]'
                    : 'bg-white hover:bg-[#FAF6ED] text-[#4A3B32] border border-[#EAE0D0] shadow-2xs hover:border-[#D6C4AD]'
                }`}
              >
                <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-[#F5D8A0]' : 'text-[#7C6C60]'}`} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Results Banner */}
        {searchQuery.trim() && (
          <div className="flex items-center justify-between bg-white border border-[#EAE0D0] rounded-xl p-3 sm:px-4 max-w-5xl mx-auto shadow-2xs">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[#2D1408]">
              <Sparkles className="w-4 h-4 text-[#DCA258] shrink-0" />
              <span>
                {t('Results for', 'इसके लिए परिणाम:')}{' '}
                <strong className="text-[#522311]">"{searchQuery}"</strong>
                <span className="text-[#8C7E72] ml-1.5 font-normal">
                  ({filtered.length} {t('services found', 'सेवाएं मिलीं')})
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

        {/* Empty State when search/filter returns zero services */}
        {filtered.length === 0 && (
          <div className="text-center py-12 px-4 max-w-md mx-auto space-y-4 bg-white rounded-2xl border border-[#EAE0D0] p-6 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-[#FAF6ED] border border-[#EAE0D0] text-[#522311] flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#2D1408]">
              {t('No Services Found', 'कोई सेवा नहीं मिली')}
            </h3>
            <p className="text-xs text-[#706256] leading-relaxed">
              {t(
                `We couldn't find any services matching "${searchQuery}". Try searching for keywords like "Kundli", "Mangal Dosh", "Tarot", or "Pooja".`,
                `"${searchQuery}" से मेल खाने वाली कोई सेवा नहीं मिली। कृपया "कुंडली", "मंगल दोष", या "पूजा" खोजें।`
              )}
            </p>
            <button
              onClick={() => {
                handleSearchChange('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-full bg-[#522311] hover:bg-[#3D1A0D] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              {t('View All Services', 'सभी सेवाएं देखें')}
            </button>
          </div>
        )}

        {/* Services Cards Grid (Initial 9, then +9 per scroll batch) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-6 lg:gap-7" id="services-grid">
          {visibleServices.map((item) => {
            const tr = language === 'hi' ? SERVICES_TRANSLATIONS[item.id] : null;
            const displayTitle = tr ? tr.titleHi : item.title;
            const displayCatTag = tr ? tr.categoryTagHi : item.categoryTag;
            const displayPandit = tr ? tr.panditHi : item.pandit;
            const displayDesc = tr ? tr.descHi : item.desc;
            const displayBadge = tr && tr.badgeHi ? tr.badgeHi : item.badge;
            const isExpanded = !!expandedCards[item.id];

            return (
              <MotionServiceCard
                key={item.id}
                item={item}
                displayTitle={displayTitle}
                displayCatTag={displayCatTag}
                displayPandit={displayPandit}
                displayDesc={displayDesc}
                displayBadge={displayBadge}
                isExpanded={isExpanded}
                onToggleExpand={toggleExpand}
                onWhatsApp={openWhatsApp}
                onSelectService={(srv) => setSelectedService(srv)}
                t={t}
                language={language}
              />
            );
          })}
        </div>

        {/* Infinite Scroll Sentinel & Controls (Batches of 9) */}
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
                {t('Loading next sacred services...', 'अगली पावन सेवाएं लोड हो रही हैं...')}
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
                aria-label={t('Load next 9 services', 'अगली 9 सेवाएं लोड करें')}
              >
                <span>{t('Load More Sacred Services', 'और भी सेवाएं देखें')}</span>
                <span className="text-[11px] text-amber-700 font-semibold bg-amber-100/80 px-2.5 py-0.5 rounded-full">
                  +9 ({visibleServices.length}/{filtered.length})
                </span>
              </button>
            </div>
          )}

          {/* End of Services Completion Banner */}
          {!hasMore && filtered.length > 0 && (
            <div className="w-full max-w-xl mx-auto my-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-amber-50/80 to-stone-100/70 border border-amber-200/80 text-center shadow-sm space-y-2">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-200/60 text-amber-900 mb-1">
                <CheckCircle2 className="w-5 h-5 text-amber-800" />
              </div>
              <h4 className="font-serif font-bold text-base sm:text-lg text-[#2A1810]">
                ✦ {t('You Have Explored All Sacred Services', 'आपने सभी पावन सेवाएं देख ली हैं')} ✦
              </h4>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                {t(
                  `All ${filtered.length} consecrated services and rituals are displayed. Guided by the wisdom and blessings of Dr. Pandit Vishal Dubey.`,
                  `इस श्रेणी की सभी ${filtered.length} प्रामाणिक सेवाएं प्रदर्शित हैं। डॉ. पंडित विशाल दुबे के मार्गदर्शन में आपका कल्याण हो।`
                )}
              </p>
            </div>
          )}
        </div>

      </main>

      {/* VisionOS Spatial Modal Preview */}
      {selectedService && (() => {
        const tr = language === 'hi' ? SERVICES_TRANSLATIONS[selectedService.id] : null;
        const displayTitle = tr ? tr.titleHi : selectedService.title;
        const displayCatTag = tr ? tr.categoryTagHi : selectedService.categoryTag;
        const displayPandit = tr ? tr.panditHi : selectedService.pandit;
        const displayDesc = tr ? tr.descHi : selectedService.desc;
        const displayBadge = tr && tr.badgeHi ? tr.badgeHi : selectedService.badge;

        return (
          <SpatialServiceModal
            service={selectedService}
            displayTitle={displayTitle}
            displayCatTag={displayCatTag}
            displayPandit={displayPandit}
            displayDesc={displayDesc}
            displayBadge={displayBadge}
            isOpen={!!selectedService}
            onClose={() => setSelectedService(null)}
            onWhatsApp={openWhatsApp}
            t={t}
            language={language}
          />
        );
      })()}

      <Footer />
    </div>
  );
}
