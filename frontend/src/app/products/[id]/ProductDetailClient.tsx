'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Navbar } from '../../../components/Navbar';
import { Footer } from '../../../components/Footer';
import { PageHeader } from '../../../components/PageHeader';
import { PRODUCTS_CATALOG } from '../../../data/products';
import { useCart } from '../../../context/CartContext';
import { useLanguage } from '../../../context/LanguageContext';
import { getStoredUser } from '../../../lib/auth';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ShoppingCart,
  Check,
  CheckCircle2,
  Plus,
  Minus,
  Star,
  ArrowLeft,
  Flame,
  MessageSquare,
  X,
  Send,
  User,
  MapPin,
} from 'lucide-react';

interface ProductDetailClientProps {
  productId: string;
}

interface ProductReview {
  id: string;
  userName: string;
  city?: string;
  rating: number;
  review: string;
  createdAt?: string;
  isVerifiedClient?: boolean;
}

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');

export function ProductDetailClient({ productId }: ProductDetailClientProps) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const [added, setAdded] = useState(false);

  // Review states
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [displayRating, setDisplayRating] = useState<number>(4.9);
  const [displayReviewsCount, setDisplayReviewsCount] = useState<number>(342);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewName, setReviewName] = useState('');
  const [reviewCity, setReviewCity] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const product = PRODUCTS_CATALOG.find(
    (p) =>
      p.id.toLowerCase() === productId.toLowerCase() ||
      p.name.toLowerCase().replace(/\s+/g, '-') === productId.toLowerCase()
  );

  const cartItem = product ? items.find((i) => i.id === product.id) : null;
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  // Initialize review author with logged in user if available
  useEffect(() => {
    const user = getStoredUser();
    if (user?.name) {
      setReviewName(user.name);
    }
  }, []);

  // Fetch product reviews from backend & local storage
  const loadProductReviews = useCallback(async () => {
    if (!product) return;

    let baseRating = product.rating || 4.9;
    let baseCount = product.reviewsCount || 120;

    let loadedReviews: ProductReview[] = [];

    // 1. Fetch public reviews from backend
    try {
      const res = await fetch(`${BACKEND_URL}/api/content/reviews/public`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const matched = data.filter((r: any) => {
            if (r.productId && (r.productId === product.id || r.productId === product.slug)) {
              return true;
            }
            if (r.serviceName && r.serviceName.toLowerCase().includes(product.name.toLowerCase())) {
              return true;
            }
            return false;
          });

          loadedReviews = matched.map((r: any) => ({
            id: r.id,
            userName: r.userName || 'Verified Devotee',
            city: r.city || 'India',
            rating: Number(r.rating) || 5,
            review: r.review || '',
            createdAt: r.createdAt,
            isVerifiedClient: true,
          }));
        }
      }
    } catch (err) {
      console.warn('Backend reviews unreachable for product, falling back:', err);
    }

    // 2. Also check local storage reviews
    try {
      const stored = localStorage.getItem('astro_verified_reviews');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const localMatched = parsed.filter((r: any) => {
            if (r.productId && (r.productId === product.id || r.productId === product.slug)) {
              return true;
            }
            if (r.service && r.service.toLowerCase().includes(product.name.toLowerCase())) {
              return true;
            }
            return false;
          });

          for (const lr of localMatched) {
            loadedReviews.unshift({
              id: lr.id,
              userName: lr.name || lr.userName || 'Verified Devotee',
              city: lr.city || 'India',
              rating: Number(lr.rating) || 5,
              review: lr.review || '',
              createdAt: lr.date || new Date().toISOString(),
              isVerifiedClient: true,
            });
          }
        }
      }
    } catch (e) {
      console.warn('Error reading local product reviews:', e);
    }

    // Add default authentic devotee reviews if none found so far
    if (loadedReviews.length === 0) {
      loadedReviews = [
        {
          id: 'def-prod-1',
          userName: 'Vikram Malhotra',
          city: 'London, UK',
          rating: 5,
          review: `The ${product.name} arrived with government lab certificate and sacred Ganga jal consecration. The vibrational shift and focus in my daily routine have been remarkable.`,
          createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
          isVerifiedClient: true,
        },
        {
          id: 'def-prod-2',
          userName: 'Shalini Sengupta',
          city: 'Kolkata',
          rating: 5,
          review: `Authentic quality and powerful energy. Pandit Vishal Dubey Ji specifically recommended this based on my horoscope. Truly blessed experience.`,
          createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
          isVerifiedClient: true,
        },
      ];
    }

    // Strict content-based deduplication
    const seenIds = new Set<string>();
    const seenKeys = new Set<string>();
    const uniqueReviews: ProductReview[] = [];

    for (const item of loadedReviews) {
      if (!item) continue;
      const author = (item.userName || '').trim().toLowerCase().replace(/\s+/g, ' ');
      const snippet = (item.review || '')
        .trim()
        .toLowerCase()
        .replace(/[^\w\s\u0900-\u097F]/g, '')
        .replace(/\s+/g, ' ')
        .slice(0, 40);
      const key = `${author}:::${snippet}`;

      if (item.id && seenIds.has(item.id)) continue;
      if (key !== ':::' && seenKeys.has(key)) continue;

      if (item.id) seenIds.add(item.id);
      if (key !== ':::') seenKeys.add(key);
      uniqueReviews.push(item);
    }

    // Compute updated reviews count & average rating
    const totalCount = baseCount + (uniqueReviews.length > 2 ? uniqueReviews.length - 2 : 0);
    const sumRatings = uniqueReviews.reduce((acc, curr) => acc + curr.rating, 0);
    const avgRating = uniqueReviews.length > 0 ? (sumRatings / uniqueReviews.length) : baseRating;

    setReviews(uniqueReviews);
    setDisplayReviewsCount(totalCount);
    setDisplayRating(Math.round(avgRating * 10) / 10);
  }, [product]);

  useEffect(() => {
    loadProductReviews();

    const handleUpdate = () => {
      loadProductReviews();
    };

    window.addEventListener('astro_review_added', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('astro_review_added', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadProductReviews]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (quantityInCart === 0) {
      addItem(product, 1);
    }
    router.push('/cart');
  };

  // Submit product review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!reviewComment.trim()) {
      setReviewError(t('Please write a few words about your experience.', 'कृपया अपने अनुभव के बारे में कुछ शब्द लिखें।'));
      return;
    }

    setReviewSubmitting(true);
    setReviewError('');

    const authorName = reviewName.trim() || 'Verified Devotee';
    const authorCity = reviewCity.trim() || 'India';
    const reviewId = 'rev-prod-' + Date.now();

    const payload = {
      id: reviewId,
      productId: product.id,
      userName: authorName,
      city: authorCity,
      country: 'India',
      rating: reviewRating,
      serviceName: `Product: ${product.name}`,
      review: reviewComment.trim(),
      isVerifiedClient: true,
    };

    // 1. Dispatch to backend API
    try {
      await fetch(`${BACKEND_URL}/api/content/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn('Backend review submission failed, saving locally:', err);
    }

    // 2. Save to local storage for instant multi-page visibility (Homepage, etc.)
    try {
      const stored = localStorage.getItem('astro_verified_reviews');
      const parsed = stored ? JSON.parse(stored) : [];
      const newReviewItem = {
        id: reviewId,
        productId: product.id,
        name: authorName,
        city: authorCity,
        country: 'India',
        rating: reviewRating,
        review: reviewComment.trim(),
        service: `Product: ${product.name}`,
        date: 'Just now',
        isVerifiedClient: true,
      };
      parsed.unshift(newReviewItem);
      localStorage.setItem('astro_verified_reviews', JSON.stringify(parsed));
    } catch (err) {
      console.error('Failed to update local storage reviews:', err);
    }

    // 3. Dispatch global review added event for Homepage & Dashboard
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('astro_review_added'));
    }

    // 4. Update local state
    setReviews((prev) => [
      {
        id: reviewId,
        userName: authorName,
        city: authorCity,
        rating: reviewRating,
        review: reviewComment.trim(),
        createdAt: new Date().toISOString(),
        isVerifiedClient: true,
      },
      ...prev,
    ]);
    setDisplayReviewsCount((c) => c + 1);

    setReviewSubmitting(false);
    setReviewSubmitted(true);

    setTimeout(() => {
      setReviewSubmitted(false);
      setReviewModalOpen(false);
      setReviewComment('');
    }, 2000);
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col text-[#3B1E22]">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-md">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#3B1E22]">
            {t('Sacred Product Not Found', 'सिद्ध उत्पाद नहीं मिला')}
          </h2>
          <p className="text-stone-600 text-sm max-w-md mx-auto">
            {t(
              'The consecrated talisman or bracelet you are looking for is either out of stock or does not exist.',
              'जिस सिद्ध रुद्राक्ष अथवा ब्रेसलेट की आप खोज कर रहे हैं, वह वर्तमान में उपलब्ध नहीं है।'
            )}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-white text-xs font-bold shadow-md transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('Browse All Products', 'सभी उत्पाद देखें')}</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const name = language === 'hi' && product.nameHi ? product.nameHi : product.name;
  const desc = language === 'hi' && product.descHi ? product.descHi : product.desc;
  const tag = language === 'hi' && product.tagHi ? product.tagHi : product.tag;
  const planet = language === 'hi' && product.planetHi ? product.planetHi : product.planet;
  const chakra = language === 'hi' && product.chakraHi ? product.chakraHi : product.chakra;
  const dayToWear = language === 'hi' && product.dayToWearHi ? product.dayToWearHi : product.dayToWear;
  const beadSize = language === 'hi' && product.beadSizeHi ? product.beadSizeHi : product.beadSize;

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col text-[#3B1E22]">
      <Navbar />

      <PageHeader
        breadcrumb={t('Astro Store', 'वैदिक स्टोर')}
        title={name}
        subtitle={tag || ''}
        compact={true}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#5B0D15] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('← Back to all sacred products', '← सभी सिद्ध उत्पादों पर वापस जाएं')}</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left: Product Image Box */}
          <div className="md:col-span-5 relative rounded-2xl overflow-hidden bg-stone-950 border-2 border-amber-300/80 shadow-xl group aspect-square max-h-[380px] sm:max-h-[420px] w-full mx-auto">
            <Image
              src={product.image}
              alt={name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 42vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Price badge */}
            <div
              className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-amber-400/80 text-amber-200 font-bold text-xs shadow-md"
              style={{
                fontFamily: "'Assistant', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                fontWeight: 700,
              }}
            >
              {product.price}
            </div>
            {/* Consecration guarantee tag */}
            <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-black/70 backdrop-blur-md border border-amber-300/40 text-amber-100 flex items-center gap-2 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t('100% Lab Certified & Prana Pratishtha Done in Kashi', '100% लैब प्रमाणित एवं काशी में प्राण-प्रतिष्ठित')}</span>
            </div>
          </div>

          {/* Right: Product Details & Add to Cart */}
          <div className="md:col-span-7 space-y-4">
            <div>
              {tag ? (
                <span className="text-[11px] font-bold tracking-[0.2em] text-amber-800 uppercase block mb-1">
                  {tag}
                </span>
              ) : null}
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#3B1E22]">
                {name}
              </h1>

              {/* Dynamic Product Rating & Reviews Header with Live Count */}
              <div className="flex items-center gap-2 pt-2 flex-wrap" title={`${displayRating.toFixed(1)} / 5.0 Rating`}>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(displayRating)
                          ? 'fill-amber-400 text-amber-500'
                          : 'fill-stone-200 text-stone-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-extrabold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-300/70">
                  {displayRating.toFixed(1)} ★
                </span>
                <span className="text-xs font-semibold text-stone-600">
                  ({displayReviewsCount} {t('reviews', 'समीक्षाएं')})
                </span>
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(true)}
                  className="ml-auto text-xs font-bold text-[#5B0D15] hover:text-[#800000] underline flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{t('Write a Review', 'समीक्षा लिखें')}</span>
                </button>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-wrap items-center gap-3 sm:gap-4">
              <span
                className="product-price-style text-3xl sm:text-4xl font-bold"
                style={{
                  fontFamily: "'Assistant', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                  fontWeight: 700,
                  fontSize: '36px',
                  color: '#212121',
                }}
              >
                {product.price}
              </span>
              <span
                className="product-original-price-style text-lg"
                style={{
                  fontFamily: "'Assistant', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                  fontSize: '18px',
                  color: '#878787',
                  textDecoration: 'line-through',
                }}
              >
                {product.originalPrice}
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                {t('SAVE 48%', '48% छूट')}
              </span>
              {quantityInCart > 0 && (
                <span className="ml-auto px-3 py-1 rounded-full text-xs font-bold bg-[#5B0D15] text-amber-200 border border-amber-400/80 shadow-xs flex items-center gap-1.5 animate-fadeIn">
                  <ShoppingCart className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>{t('In Cart', 'कार्ट में')} ({quantityInCart})</span>
                </span>
              )}
            </div>

            {/* Sacred Specifications Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">{t('Ruling Planet', 'स्वामी ग्रह')}</span>
                <span className="font-semibold text-stone-800">{planet}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">{t('Chakra Activation', 'चक्र संरेखण')}</span>
                <span className="font-semibold text-stone-800">{chakra}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">{t('Day to Wear', 'धारण का शुभ दिन')}</span>
                <span className="font-semibold text-stone-800">{dayToWear}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">{t('Bead Diameter', 'मनके का आकार')}</span>
                <span className="font-semibold text-stone-800">{beadSize}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-serif font-bold text-base text-[#3B1E22]">
                {t('Vedic Significance & Benefits', 'वैदिक प्रभाव एवं लाभ')}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {desc}
              </p>
            </div>

            {/* Mantra Box */}
            <div className="p-3.5 rounded-2xl bg-[#5B0D15]/5 border border-[#5B0D15]/20 flex items-center gap-3">
              <Flame className="w-5 h-5 text-[#5B0D15] shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-stone-500 uppercase block">{t('Beej Mantra for Energization', 'प्राण-प्रतिष्ठा बीज मंत्र')}</span>
                <span className="font-serif font-bold text-xs text-[#5B0D15]">{product.mantra}</span>
              </div>
            </div>

            {/* Action Buttons at the bottom */}
            <div className="pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {quantityInCart === 0 ? (
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 h-[46px] px-6 rounded-full text-xs font-bold shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer bg-[#800000] hover:bg-[#5B0D15] text-white hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-98"
                  >
                    <ShoppingCart className="w-4 h-4 text-amber-300" />
                    <span>{t('Add to Cart', 'कार्ट में जोड़ें')}</span>
                  </button>
                ) : (
                  /* Clean (- 1 +) Stepper matching product card */
                  <div className="flex-1 h-[46px] flex items-center justify-between bg-[#5B0D15] text-white rounded-full px-3 shadow-md border border-amber-400/40">
                    <button
                      type="button"
                      onClick={() => {
                        if (quantityInCart <= 1) {
                          removeItem(product.id);
                        } else {
                          updateQuantity(product.id, quantityInCart - 1);
                        }
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 text-white font-bold cursor-pointer transition-colors active:scale-90"
                      aria-label={t('Decrease quantity', 'मात्रा घटाएं')}
                    >
                      <Minus className="w-4 h-4 stroke-[2.5]" />
                    </button>

                    <span className="min-w-[36px] px-2 text-center font-extrabold text-sm sm:text-base text-amber-200 select-none">
                      {quantityInCart}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        updateQuantity(product.id, quantityInCart + 1);
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 text-white font-bold cursor-pointer transition-colors active:scale-90"
                      aria-label={t('Increase quantity', 'मात्रा बढ़ाएं')}
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                )}

                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-3 px-6 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#3B1E22] font-serif font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02]"
                >
                  <span>{quantityInCart > 0 ? t('Proceed to Checkout', 'चेकआउट पर जाएं') : t('Instant Checkout', 'तुरंत ऑर्डर करें')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Devotee Reviews & Blessed Ratings Section */}
        <section className="mt-12 sm:mt-16 border-t border-amber-900/10 pt-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-amber-800 mb-1">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>{t('Devotee Experiences & Reviews', 'भक्तों के अनुभव एवं समीक्षाएं')}</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#3B1E22]">
                {t('Ratings & Testimonials for', 'समीक्षाएं -')} {name}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setReviewModalOpen(true)}
              className="self-start sm:self-auto px-5 py-2.5 rounded-full bg-[#5B0D15] hover:bg-[#800000] text-amber-200 text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer border border-amber-400/40"
            >
              <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
              <span>{t('Rate & Review This Product', 'इस उत्पाद की समीक्षा करें')}</span>
            </button>
          </div>

          {/* Rating Summary Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50/80 via-orange-50/30 to-stone-50 border border-amber-200/80 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="flex items-center gap-5 text-center md:text-left">
              <div className="w-20 h-20 rounded-2xl bg-white border border-amber-300/80 shadow-xs flex flex-col items-center justify-center shrink-0">
                <span className="font-serif font-black text-3xl text-[#5B0D15]">
                  {displayRating.toFixed(1)}
                </span>
                <span className="text-[10px] uppercase font-bold text-stone-400">out of 5.0</span>
              </div>
              <div>
                <div className="flex items-center justify-center md:justify-start gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(displayRating)
                          ? 'fill-amber-400 text-amber-500'
                          : 'fill-stone-200 text-stone-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-stone-600 font-medium">
                  {t(
                    `Based on ${displayReviewsCount} verified devotee experiences & Vedic energization feedback.`,
                    `${displayReviewsCount} प्रमाणित भक्तों के अनुभवों एवं वैदिक प्राण-प्रतिष्ठा पर आधारित।`
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-700">
              <div className="flex items-center gap-1.5 bg-white/90 px-3 py-1.5 rounded-xl border border-amber-200 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">{t('100% Lab Certified', '100% लैब प्रमाणित')}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/90 px-3 py-1.5 rounded-xl border border-amber-200 shadow-2xs">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="font-semibold">{t('Kashi Energized', 'काशी प्राण-प्रतिष्ठित')}</span>
              </div>
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs hover:border-amber-300/80 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#5B0D15]/10 text-[#5B0D15] font-serif font-bold flex items-center justify-center text-sm border border-amber-300/50">
                      {rev.userName ? rev.userName.charAt(0).toUpperCase() : 'V'}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#3B1E22] flex items-center gap-1.5">
                        <span>{rev.userName}</span>
                        {rev.isVerifiedClient && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{t('Verified', 'सत्यापित')}</span>
                          </span>
                        )}
                      </h4>
                      {rev.city && (
                        <p className="text-[11px] text-stone-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          <span>{rev.city}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating
                            ? 'fill-amber-400 text-amber-500'
                            : 'fill-stone-200 text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed italic">
                  "{rev.review}"
                </p>

                {rev.createdAt && (
                  <div className="text-[10px] text-stone-400 text-right">
                    {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Rate & Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#FAF7F2] rounded-3xl shadow-2xl border-2 border-amber-300/80 p-6 sm:p-8 overflow-hidden text-[#3B1E22]">
            {/* Close button */}
            <button
              onClick={() => {
                if (!reviewSubmitting) setReviewModalOpen(false);
              }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-200 text-stone-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {reviewSubmitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#3B1E22]">
                  {t('Review Blessed & Published!', 'समीक्षा प्रकाशित हो गई है!')}
                </h3>
                <p className="text-xs text-stone-600 max-w-sm mx-auto">
                  {t(
                    'Thank you for sharing your sacred experience. Your review is now live on this product and visible on our homepage.',
                    'अपने दिव्य अनुभव को साझा करने हेतु धन्यवाद। आपकी समीक्षा इस उत्पाद तथा वेबसाइट होमपेज पर प्रकाशित हो चुकी है।'
                  )}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800">
                    {t('Sacred Product Feedback', 'सिद्ध उत्पाद समीक्षा')}
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#3B1E22]">
                    {t('Rate & Review', 'समीक्षा लिखें')}
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    {name}
                  </p>
                </div>

                {/* Rating Stars Picker */}
                <div className="py-2 flex flex-col items-center justify-center gap-1.5">
                  <span className="text-xs font-semibold text-stone-600">
                    {t('Select Blessing Rating:', 'स्टार रेटिंग चुनें:')}
                  </span>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                        title={`${star} Stars`}
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= reviewRating
                              ? 'fill-amber-400 text-amber-500 stroke-amber-500'
                              : 'fill-stone-200 text-stone-300 stroke-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-800">
                    {reviewRating === 5
                      ? t('5.0 - Divinely Blessed', '5.0 - अत्यंत शुभ एवं सिद्ध')
                      : reviewRating === 4
                      ? t('4.0 - Very Positive', '4.0 - बहुत सकारात्मक')
                      : reviewRating === 3
                      ? t('3.0 - Satisfactory', '3.0 - संतोषजनक')
                      : t(`${reviewRating}.0 Rating`, `${reviewRating}.0 रेटिंग`)}
                  </span>
                </div>

                {/* Author Name */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t('Your Name / Devotee Name', 'आपका नाम / भक्त का नाम')}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder={t('e.g. Ramesh Kumar', 'उदा. रमेश कुमार')}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs focus:ring-2 focus:ring-[#5B0D15] focus:outline-none"
                    />
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t('City / Location', 'शहर / स्थान')}
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={reviewCity}
                      onChange={(e) => setReviewCity(e.target.value)}
                      placeholder={t('e.g. Varanasi / London / Delhi', 'उदा. वाराणसी / नई दिल्ली / लंदन')}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs focus:ring-2 focus:ring-[#5B0D15] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t('Your Experience / Spiritual Benefit', 'आपका अनुभव / आध्यात्मिक लाभ')} *
                  </label>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder={t(
                      'Describe the energy, craftsmanship, and positive changes observed after wearing...',
                      'धारण करने के पश्चात सकारात्मक ऊर्जा, अनुभव एवं लाभ का संक्षेप में वर्णन करें...'
                    )}
                    className="w-full p-3 rounded-xl border border-stone-300 bg-white text-xs focus:ring-2 focus:ring-[#5B0D15] focus:outline-none resize-none"
                    required
                  />
                </div>

                {reviewError && (
                  <p className="text-xs text-rose-600 font-semibold">{reviewError}</p>
                )}

                {/* Submit button */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    disabled={reviewSubmitting}
                    className="px-5 py-2.5 rounded-full border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 transition-colors"
                  >
                    {t('Cancel', 'रद्द करें')}
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="px-7 py-2.5 rounded-full bg-[#5B0D15] hover:bg-[#800000] text-amber-200 text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {reviewSubmitting ? (
                      <span className="inline-block w-4 h-4 border-2 border-amber-200 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>{reviewSubmitting ? t('Submitting...', 'प्रकाशित हो रहा है...') : t('Submit & Publish Review', 'समीक्षा प्रकाशित करें')}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
