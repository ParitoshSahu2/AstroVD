'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PageHeader } from '../../components/PageHeader';
import {
  Sparkles,
  X,
  Eye,
  Calendar,
  MapPin,
  Award,
  Filter,
  Flame,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Plus,
  Edit3,
  Trash2,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getStoredUser, getAuthToken, AUTH_CHANGE_EVENT } from '../../lib/auth';
import dynamic from 'next/dynamic';
import type { GalleryItemData } from './components/GalleryManageModal';
const GalleryManageModal = dynamic(() => import('./components/GalleryManageModal'), { ssr: false });
import { GalleryItem, INITIAL_GALLERY_ITEMS } from './data/gallery-items';


const BATCH_SIZE = 9;

export default function GalleryPage() {
  const { t, language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  // Infinite Scrolling State
  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const initialGalleryItems: GalleryItem[] = INITIAL_GALLERY_ITEMS;

  // Dynamic Content & Admin Management State
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(initialGalleryItems);
  const [isAdmin, setIsAdmin] = useState(false);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionToast, setActionToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const backendUrl = (
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api'
  ).replace(/\/api\/?$/, '');

  const resolveImageUrl = useCallback(
    (imgUrl?: string) => {
      if (!imgUrl) return '/gallery/IMG_2542.jpg';
      if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://') || imgUrl.startsWith('data:')) {
        return imgUrl;
      }
      if (imgUrl.startsWith('/api')) {
        return `${backendUrl}${imgUrl}`;
      }
      return imgUrl;
    },
    [backendUrl]
  );

  const fetchGalleryItems = useCallback(async () => {
    try {
      const queryParam = isAdmin ? '?includeUnpublished=true' : '';
      const res = await fetch(`${backendUrl}/api/content/gallery${queryParam}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          if (data.length < initialGalleryItems.length) {
            const idMap = new Map<string, GalleryItem>();
            initialGalleryItems.forEach((item) => idMap.set(item.id, item));
            data.forEach((item: GalleryItem) => idMap.set(item.id, item));
            setGalleryItems(Array.from(idMap.values()));
          } else {
            setGalleryItems(data);
          }
        }
      }
    } catch (err) {
      console.error('Error loading gallery items from API, using fallback:', err);
    }
  }, [backendUrl, isAdmin]);

  useEffect(() => {
    const checkAuth = () => {
      const user = getStoredUser();
      const admin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';
      setIsAdmin(admin);
    };
    checkAuth();
    window.addEventListener(AUTH_CHANGE_EVENT, checkAuth);
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  useEffect(() => {
    fetchGalleryItems();
  }, [fetchGalleryItems]);

  // Auto-dismiss action feedback toast after 4 seconds
  useEffect(() => {
    if (!actionToast) return;
    const timer = setTimeout(() => {
      setActionToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [actionToast]);

  const handleDeleteItem = async (item: GalleryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to permanently delete "${item.title}"?`)) {
      return;
    }

    const token = getAuthToken();
    if (!token) return;

    // Optimistically remove from state immediately
    setGalleryItems((prev) => prev.filter((i) => i.id !== item.id));

    setActionLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/content/gallery/${item.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete gallery item');
      }

      setActionToast({
        type: 'success',
        message: `"${item.title}" was deleted successfully.`,
      });
      fetchGalleryItems();
    } catch (err: any) {
      setActionToast({ type: 'error', message: err.message || 'Error deleting photo.' });
      fetchGalleryItems();
    } finally {
      setActionLoading(false);
    }
  };

  const handleItemSaved = (savedItem?: any) => {
    setActionToast({
      type: 'success',
      message: 'Photo published successfully! Visible immediately in gallery.',
    });

    if (savedItem && savedItem.id) {
      setGalleryItems((prev) => {
        const existingIdx = prev.findIndex((i) => i.id === savedItem.id);
        if (existingIdx !== -1) {
          const updated = [...prev];
          updated[existingIdx] = { ...updated[existingIdx], ...savedItem };
          return updated;
        }
        // Insert new photo right at index 0 so it's immediately visible at the top
        return [savedItem, ...prev];
      });
      // Switch active category to 'all' so new item is not hidden
      setActiveCategory('all');
      setVisibleCount(BATCH_SIZE);
    }

    fetchGalleryItems();
  };

  const categories = [
    {
      id: 'all',
      labelEn: 'All Moments',
      labelHi: 'सभी छायाचित्र',
      count: galleryItems.length,
    },
    {
      id: 'pooja',
      labelEn: 'Sacred Poojas & Havan',
      labelHi: 'वैदिक पूजा व महाहवन',
      count: galleryItems.filter((i) => i.category === 'pooja').length,
    },
    {
      id: 'consultation',
      labelEn: 'Vedic Consultations',
      labelHi: 'वैदिक ज्योतिष परामर्श',
      count: galleryItems.filter((i) => i.category === 'consultation').length,
    },
    {
      id: 'yantra',
      labelEn: 'Yantras & Gemstones',
      labelHi: 'सिद्ध यंत्र एवं रत्न',
      count: galleryItems.filter((i) => i.category === 'yantra').length,
    },
    {
      id: 'awards',
      labelEn: 'Honors & Certifications',
      labelHi: 'राष्ट्रीय सम्मान व उपाधियां',
      count: galleryItems.filter((i) => i.category === 'awards').length,
    },
    {
      id: 'kashi',
      labelEn: 'Temple Anushthan',
      labelHi: 'काशी विश्वनाथ अनुष्ठान',
      count: galleryItems.filter((i) => i.category === 'kashi').length,
    },
  ];

  // Filtered collection based on active category
  const filtered = galleryItems.filter((item) => {
    if (!isAdmin && item.isPublished === false) return false;
    return activeCategory === 'all' || item.category === activeCategory;
  });

  // Paginated visible items (initial 9, then +9 per scroll batch)
  const visibleItems = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Reset pagination when category changes
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setVisibleCount(BATCH_SIZE);
    setLoadError(null);
    setIsLoadingMore(false);
  };

  // Safe batch loader: loads the next 9 items, preventing concurrent / duplicate requests
  const loadNextBatch = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    setLoadError(null);

    // Subtle 380ms delay provides smooth visual feedback and prevents UI stutter
    const timer = setTimeout(() => {
      try {
        setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filtered.length));
        setIsLoadingMore(false);
      } catch (err) {
        setLoadError(
          language === 'hi'
            ? 'छायाचित्र लोड करने में समस्या आई। कृपया पुनः प्रयास करें।'
            : 'Failed to load additional moments. Please try again.'
        );
        setIsLoadingMore(false);
      }
    }, 120);

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
        rootMargin: '400px',
        threshold: 0,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
      observer.disconnect();
    };
  }, [hasMore, isLoadingMore, loadNextBatch]);

  // Lightbox Modal Navigation helpers
  const currentModalIndex = selectedImage
    ? visibleItems.findIndex((item) => item.id === selectedImage.id)
    : -1;

  const handlePrevImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentModalIndex > 0) {
      setSelectedImage(visibleItems[currentModalIndex - 1]);
    }
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentModalIndex >= 0 && currentModalIndex < visibleItems.length - 1) {
      setSelectedImage(visibleItems[currentModalIndex + 1]);
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImage(null);
      if (e.key === 'ArrowLeft' && currentModalIndex > 0) {
        setSelectedImage(visibleItems[currentModalIndex - 1]);
      }
      if (e.key === 'ArrowRight' && currentModalIndex < visibleItems.length - 1) {
        setSelectedImage(visibleItems[currentModalIndex + 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, currentModalIndex, visibleItems]);

  return (
    <div className="relative min-h-screen w-full bg-[#FCF8ED] m-0 p-0 overflow-x-clip selection:bg-amber-400">
      <Navbar />

      {/* HERO BANNER SECTION (Panoramic full-bleed backdrop matching reference design) */}
      <section className="relative w-full bg-[#36170A] overflow-hidden pt-24 sm:pt-28 md:pt-30 pb-9 sm:pb-11 px-4 sm:px-6 lg:px-12 min-h-[220px] sm:min-h-[250px] flex items-center">
        {/* Background ambient gradient matching reference tone */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#36170A] via-[#36170A] to-[#2B0E06]" />

        {/* Full-bleed Ultra-HD panoramic backdrop (2400x768): Varanasi Ganga Aarti, Hawan, Diya & Chakra */}
        <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
          <Image
            src="/gallery/gallery_hero_panoramic_hd.png"
            alt="Sacred Vedic Ceremonies and Ganga Aarti"
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
              {t('DIVINE DARSHAN • SACRED CEREMONIES • CELESTIAL BLESSINGS', 'दिव्य दर्शन • पावन अनुष्ठान • दैवीय कृपा')}
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-[34px] lg:text-[38px] font-bold text-[#FFFDFB] tracking-wide leading-tight drop-shadow-md">
              {t('Celestial Gallery & Sacred Memories', 'पावन वैदिक अनुष्ठान एवं छायाचित्र दीर्घा')}
            </h1>
            <p className="text-[#D7C4BD] text-xs sm:text-[13px] leading-relaxed max-w-lg font-normal drop-shadow-sm">
              {t(
                'Visual glimpses of holy yagyas, temple consecrations, Vedic awards, and divine ceremonies presided over by Dr. Pandit Vishal Dubey (AstroVD).',
                'पूज्य डॉ. पंडित विशाल दुबे (AstroVD) के सानिध्य में संपन्न हुए पावन यज्ञों, प्राण-प्रतिष्ठा, राष्ट्रीय पुरस्कारों एवं दिव्य अनुष्ठानों की पावन झलकियां।'
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Action Feedback Floating Toast */}
        {actionToast && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-6 right-6 z-50 max-w-sm sm:max-w-md w-auto animate-fadeIn transition-all duration-300"
          >
            <div
              className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium flex items-center gap-3 shadow-2xl backdrop-blur-md border ${
                actionToast.type === 'success'
                  ? 'bg-[#1C2820]/95 text-emerald-100 border-emerald-500/50 shadow-emerald-950/30'
                  : 'bg-[#2D1217]/95 text-rose-100 border-rose-500/50 shadow-rose-950/30'
              }`}
            >
              {actionToast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span className="leading-snug flex-1">{actionToast.message}</span>
              <button
                type="button"
                onClick={() => setActionToast(null)}
                className="text-stone-400 hover:text-white font-bold p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer shrink-0"
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Category Filter Pills (Matching Mockup Design System) */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth justify-start sm:justify-center" role="tablist" aria-label="Gallery Categories">
          {categories.map((cat) => {
            const label = language === 'hi' ? `${cat.labelHi} (${cat.count})` : `${cat.labelEn} (${cat.count})`;
            const isSelected = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                role="tab"
                aria-selected={isSelected}
                className={`rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#522311] text-white shadow-xs border border-[#522311]'
                    : 'bg-white hover:bg-[#FAF6ED] text-[#4A3B32] border border-[#EAE0D0] shadow-2xs hover:border-[#D6C4AD]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Gallery Items Count Header & Admin Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-[#706256] border-b border-[#EAE0D0] pb-3">
          <div className="flex items-center gap-2 font-serif font-medium text-[#2D1408]">
            <Sparkles className="w-4 h-4 text-[#DCA258] shrink-0" />
            <span>
              {t('Showing', 'प्रदर्शित')}:{' '}
              <strong className="text-[#522311] font-bold">{visibleItems.length}</strong> {t('of', 'कुल')}{' '}
              <strong className="text-[#2D1408]">{filtered.length}</strong> {t('sacred moments', 'पावन छायाचित्र')}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {isAdmin && (
              <div aria-label="Admin Gallery Controls" className="inline-flex items-center">
                <button
                  type="button"
                  title="Admin Gallery Controls - Add New Photo"
                  onClick={() => {
                    setItemToEdit(null);
                    setManageModalOpen(true);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-[#522311] hover:bg-[#3D1A0D] text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#F5C77E]" />
                  <span>{t('Add New Photo', 'नई फोटो जोड़ें')}</span>
                </button>
              </div>
            )}

            {hasMore && (
              <span className="text-xs text-[#522311] bg-[#FAF6ED] border border-[#EAE0D0] px-3 py-1 rounded-full font-medium hidden sm:inline-block">
                {t('Scroll down to load more', 'और देखने के लिए नीचे स्क्रॉल करें')} ↓
              </span>
            )}
          </div>
        </div>

        {/* Gallery Grid (Initial 9, then +9 per scroll batch) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" id="gallery-grid">
          {visibleItems.map((item, index) => {
            const title = language === 'hi' ? item.titleHi : item.title;
            const catLabel = language === 'hi' ? item.categoryLabelHi : item.categoryLabel;
            const desc = language === 'hi' ? item.descriptionHi : item.description;
            const location = language === 'hi' ? item.locationHi : item.location;
            const date = language === 'hi' ? item.dateHi : item.date;

            return (
              <article
                key={item.id}
                onClick={() => setSelectedImage(item)}
                className="group relative rounded-2xl overflow-hidden bg-white border border-[#EAE0D0] shadow-xs hover:border-[#D6C4AD] hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between"
                tabIndex={0}
                role="button"
                aria-label={`View photo: ${title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedImage(item);
                  }
                }}
              >
                {/* Image Container with fixed aspect ratio to prevent Layout Shift */}
                <div className="relative h-60 sm:h-64 w-full overflow-hidden bg-stone-100">
                  <Image
                    src={resolveImageUrl(item.image)}
                    alt={title}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={index < 3}
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    onError={(e: any) => {
                      if (e?.target) {
                        e.target.src = '/gallery/IMG_2542.jpg';
                      }
                    }}
                  />

                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md border border-white/60 text-white flex items-center justify-center scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 shadow-xl">
                      <Eye className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Top Category Tag */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-[#DCA258]/35 text-[#F5C77E] text-[10px] font-semibold uppercase tracking-wider">
                    ✦ {catLabel}
                  </div>

                  {/* Admin Actions Overlay - ONLY VISIBLE TO AUTHENTICATED ADMINS */}
                  {isAdmin && (
                    <div
                      className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2 py-1 rounded-full border border-amber-400/80 shadow-lg"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setItemToEdit(item);
                          setManageModalOpen(true);
                        }}
                        title="Edit Photo Details"
                        className="w-6 h-6 rounded-full bg-white/20 hover:bg-amber-400 hover:text-stone-950 text-white flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteItem(item, e)}
                        title="Delete Entry"
                        disabled={actionLoading}
                        className="w-6 h-6 rounded-full bg-white/20 hover:bg-rose-600 hover:text-white text-white flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Bottom Card Information */}
                <div className="p-5 space-y-2 bg-white">
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#2D1408] group-hover:text-[#522311] transition-colors leading-snug">
                    {title}
                  </h3>

                  <p className="text-xs text-[#706256] line-clamp-2 leading-relaxed">
                    {desc}
                  </p>

                  <div className="pt-2.5 border-t border-[#F2ECE1] flex items-center justify-between text-[11px] text-[#8C7E72]">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#DCA258] shrink-0" />
                      <span className="truncate max-w-[140px]">{location}</span>
                    </div>
                    <div className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#A39588] shrink-0" />
                      <span>{date}</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Empty State if filter yields zero items */}
        {filtered.length === 0 && (
          <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-[#EAE0D0] p-8 max-w-lg mx-auto shadow-xs">
            <Filter className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="font-serif font-bold text-base text-[#2D1408]">
              {t('No moments found in this category', 'इस श्रेणी में कोई छायाचित्र नहीं मिला')}
            </h3>
            <button
              onClick={() => handleCategoryChange('all')}
              className="px-5 py-2 rounded-full bg-[#522311] hover:bg-[#3D1A0D] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {t('View All Moments', 'सभी छायाचित्र देखें')}
            </button>
          </div>
        )}

        {/* Infinite Scroll Sentinel & Controls */}
        <div
          ref={sentinelRef}
          className="w-full min-h-[50px] py-6 flex flex-col items-center justify-center space-y-4"
          aria-live="polite"
        >
          {/* Loading Indicator */}
          {isLoadingMore && (
            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-amber-50/90 border border-amber-300/80 text-[#5B0D15] shadow-md animate-pulse">
              <Loader2 className="w-5 h-5 animate-spin text-amber-700" />
              <span className="text-xs sm:text-sm font-semibold">
                {t('Loading next sacred moments...', 'अगले पावन छायाचित्र लोड हो रहे हैं...')}
              </span>
            </div>
          )}

          {/* Error & Retry Alert */}
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
                aria-label={t('Load next 9 gallery images', 'अगले 9 छायाचित्र लोड करें')}
              >
                <span>{t('Load More Sacred Moments', 'और पावन छायाचित्र देखें')}</span>
                <span className="text-[11px] text-amber-700 font-semibold bg-amber-100/80 px-2.5 py-0.5 rounded-full">
                  +9 ({visibleItems.length}/{filtered.length})
                </span>
              </button>
            </div>
          )}

          {/* End of Gallery Completion Banner */}
          {!hasMore && filtered.length > 0 && (
            <div className="w-full max-w-xl mx-auto my-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-amber-50/80 to-stone-100/70 border border-amber-200/80 text-center shadow-sm space-y-2">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-200/60 text-amber-900 mb-1">
                <CheckCircle2 className="w-5 h-5 text-amber-800" />
              </div>
              <h4 className="font-serif font-bold text-base sm:text-lg text-[#2A1810]">
                ✦ {t('You Have Explored All Sacred Moments', 'आपने सभी पावन छायाचित्र देख लिए हैं')} ✦
              </h4>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                {t(
                  `All ${filtered.length} consecrated photographs have been loaded. May the divine grace of Kashi Vishwanath illuminate your path.`,
                  `इस श्रेणी के सभी ${filtered.length} पावन छायाचित्र प्रदर्शित हैं। बाबा काशी विश्वनाथ जी की कृपा आप पर सदैव बनी रहे।`
                )}
              </p>
            </div>
          )}
        </div>

      </main>

      {/* Lightbox Modal with Next/Previous Navigation */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label={selectedImage.title}
        >
          {/* Lightbox Container */}
          <div
            className="relative max-w-3xl w-full bg-[#FAF7F2] rounded-3xl overflow-hidden border-2 border-amber-400 shadow-2xl space-y-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/40 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Navigation Previous Button */}
            {currentModalIndex > 0 && (
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/3 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/40 text-white flex items-center justify-center hover:bg-amber-600 transition-colors cursor-pointer shadow-lg"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Navigation Next Button */}
            {currentModalIndex >= 0 && currentModalIndex < visibleItems.length - 1 && (
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/3 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/40 text-white flex items-center justify-center hover:bg-amber-600 transition-colors cursor-pointer shadow-lg"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Modal Image */}
            <div className="relative w-full h-80 sm:h-96 bg-stone-900 overflow-hidden">
              <img
                src={resolveImageUrl(selectedImage.image)}
                alt={language === 'hi' ? selectedImage.titleHi : selectedImage.title}
                className="w-full h-full object-cover object-center"
                onError={(e: any) => {
                  e.target.src = '/gallery/IMG_2542.jpg';
                }}
              />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#5B0D15] text-amber-200 text-xs font-bold tracking-wide">
                ✦ {language === 'hi' ? selectedImage.categoryLabelHi : selectedImage.categoryLabel}
              </div>
              <div className="absolute bottom-3 right-4 px-2.5 py-0.5 rounded-full bg-black/60 text-white/90 text-[10px] font-mono">
                {currentModalIndex + 1} / {visibleItems.length}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-3">
              <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#2A1810]">
                {language === 'hi' ? selectedImage.titleHi : selectedImage.title}
              </h3>

              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 pb-2 border-b border-amber-200">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-700" />
                  {language === 'hi' ? selectedImage.locationHi : selectedImage.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-700" />
                  {language === 'hi' ? selectedImage.dateHi : selectedImage.date}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                {language === 'hi' ? selectedImage.descriptionHi : selectedImage.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Gallery Management Modal */}
      {isAdmin && (
        <GalleryManageModal
          isOpen={manageModalOpen}
          onClose={() => setManageModalOpen(false)}
          itemToEdit={itemToEdit}
          onSaved={handleItemSaved}
        />
      )}

      <Footer />
    </div>
  );
}
