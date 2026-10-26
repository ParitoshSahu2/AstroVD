'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SERVICES_TRANSLATIONS } from '../../data/servicesTranslations';
import { SERVICES_CATALOGUE, ServiceItem } from '../../data/servicesData';

export const SERVICES_BATCH_SIZE = 9;

export default function ServicesPage() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  // Sync search query from URL (?search=... or ?q=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get('search') || params.get('q');
    if (q) {
      setSearchQuery(q);
      setVisibleCount(SERVICES_BATCH_SIZE);
    }
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
    },
    {
      id: 'astrology',
      labelEn: 'Vedic Astrology',
      labelHi: 'वैदिक ज्योतिष',
      count: services.filter((s) => s.categoryKey === 'astrology').length,
    },
    {
      id: 'pooja',
      labelEn: 'Pooja & Shanti',
      labelHi: 'पूजा व शांति',
      count: services.filter((s) => s.categoryKey === 'pooja').length,
    },
    {
      id: 'occult',
      labelEn: 'Occult & Energy',
      labelHi: 'ऊर्जा व गुप्त विद्याएं',
      count: services.filter((s) => s.categoryKey === 'occult').length,
    },
    {
      id: 'education',
      labelEn: 'Vedic Courses',
      labelHi: 'वैदिक पाठ्यक्रम',
      count: services.filter((s) => s.categoryKey === 'education').length,
    },
  ];

  // 1. Filter by category and search query
  const filtered = services.filter((s) => {
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

  // 2. Paginated visible items (initial 9, then +9 per scroll batch)
  const visibleServices = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Reset pagination on filter or search changes
  const resetPagination = () => {
    setVisibleCount(SERVICES_BATCH_SIZE);
    setLoadError(null);
    setIsLoadingMore(false);
  };

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    resetPagination();
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
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
    <div className="relative min-h-screen w-full bg-[#FAF7F2] m-0 p-0 overflow-x-clip selection:bg-amber-400">
      <Navbar />

      {/* Page Header */}
      <PageHeader
        breadcrumb={t('Services & Rituals', 'सेवाएं एवं अनुष्ठान')}
        title={t('Vedic Astrology & Pooja Services', 'वैदिक ज्योतिष एवं पूजा सेवाएं')}
        subtitle={t(
          '29 Consecrated Astrological Consultations, Sacred Yagya Rituals, Energy Sciences, and Vedic Education Courses by Dr. Pandit Vishal Dubey (AstroVD).',
          'पूज्य डॉ. पंडित विशाल दुबे (AstroVD) द्वारा 29 सिद्ध ज्योतिष परामर्श, पावन यज्ञ अनुष्ठान, ऊर्जा विज्ञान एवं वैदिक शिक्षण पाठ्यक्रम।'
        )}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-9 space-y-6 sm:space-y-7">
        
        {/* Search & Category Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/85 backdrop-blur-md px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl sm:rounded-3xl border border-amber-200/90 shadow-sm">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={t('Search services (e.g. Mangal Dosh, Kundli, Tarot)...', 'सेवाएं खोजें (उदा. मंगल दोष, कुंडली, टैरो)...')}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-9 py-2 sm:py-2.5 rounded-full bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-800 placeholder-stone-400 shadow-xs focus:bg-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-300 transition-colors"
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

          {/* Category Dropdown */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1.5 text-stone-700 text-xs sm:text-sm font-semibold">
              <Filter className="w-4 h-4 text-amber-700" />
              <span>{t('Category:', 'श्रेणी:')}</span>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-3.5 sm:px-4 py-2 rounded-full bg-white border border-amber-300 text-xs sm:text-sm font-semibold text-stone-800 shadow-xs focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {categories.map((c) => (
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
            <Sparkles className="w-4 h-4 text-amber-700" />
            <span>
              {language === 'hi' ? (
                <>प्रदर्शित <span className="text-[#5B0D15] font-extrabold">{visibleServices.length}</span> कुल <span className="text-stone-900 font-extrabold">{filtered.length}</span> प्रामाणिक वैदिक सेवाएं</>
              ) : (
                <>Showing <span className="text-[#5B0D15] font-extrabold">{visibleServices.length}</span> of <span className="text-stone-900 font-extrabold">{filtered.length}</span> authentic services</>
              )}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Service Categories">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
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

        {/* Empty State when search/filter returns zero services */}
        {filtered.length === 0 && (
          <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-stone-200 p-8 max-w-lg mx-auto">
            <Filter className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="font-serif font-semibold text-lg text-stone-700">
              {t('No services found matching your search', 'आपकी खोज के अनुसार कोई सेवा नहीं मिली')}
            </h3>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                resetPagination();
              }}
              className="px-5 py-2 rounded-full bg-[#5B0D15] text-white text-xs font-semibold hover:bg-rose-950 transition-colors"
            >
              {t('Reset Filters & View All', 'फ़िल्टर हटाएं एवं सभी देखें')}
            </button>
          </div>
        )}

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
