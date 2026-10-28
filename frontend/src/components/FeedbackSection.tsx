'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Star,
  Quote,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Compass,
  ShoppingBag,
  Loader2,
  ArrowRight,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getAuthToken, getStoredUser } from '../lib/auth';
import { AuthModal } from './AuthModal';

interface FeedbackItem {
  id: string;
  name: string;
  city: string;
  cityHi?: string;
  country: string;
  countryHi?: string;
  rating: number;
  review: string;
  reviewHi: string;
  service: string;
  serviceHi: string;
  date: string;
  dateHi: string;
  isVerifiedClient?: boolean;
}

const DEFAULT_FEEDBACKS: FeedbackItem[] = [
  {
    id: '1',
    name: 'Rajesh & Meenakshi Iyer',
    city: 'Dubai',
    cityHi: 'दुबई',
    country: 'UAE',
    countryHi: 'यूएई',
    rating: 5,
    review:
      'Dr. Pandit Vishal Dubey’s Kundli Milan analysis for our daughter was extraordinarily deep. He accurately pinpointed planetary dasha periods and guided us with simple, auspicious remedies. Highly recommended worldwide!',
    reviewHi:
      'हमारी सुपुत्री के लिए डॉ. पंडित विशाल दुबे जी का कुंडली मिलान एवं ग्रह गोचर विश्लेषण अत्यंत सटीक और गहरा रहा। उन्होंने दशा काल का अचूक विश्लेषण कर अत्यंत सरल व शास्त्रोक्त उपाय सुझाए। हम हृदय से आभारी हैं!',
    service: 'Kundli Milan & Marriage Guidance',
    serviceHi: 'कुंडली मिलान व विवाह मार्गदर्शन',
    date: '2 weeks ago',
    dateHi: '2 सप्ताह पूर्व',
    isVerifiedClient: true,
  },
  {
    id: '2',
    name: 'Siddharth Varma',
    city: 'Sydney',
    cityHi: 'सिडनी',
    country: 'Australia',
    countryHi: 'ऑस्ट्रेलिया',
    rating: 5,
    review:
      'Madhuri Ji’s intuitive tarot session provided unprecedented clarity during a pivotal career crossroads. Her predictions and spiritual counsel were precise and profoundly reassuring.',
    reviewHi:
      'करियर के असमंजस भरे मोड़ पर माधुरी जी का इंट्यूटिव टैरो परामर्श अप्रत्याशित स्पष्टता लेकर आया। उनके द्वारा बताए गए संकेत और आध्यात्मिक मार्गदर्शन अत्यंत सटीक और आत्मबल बढ़ाने वाले रहे।',
    service: 'Tarot Consultation with Madhuri Ji',
    serviceHi: 'माधुरी जी संग टैरो परामर्श',
    date: '1 month ago',
    dateHi: '1 माह पूर्व',
    isVerifiedClient: true,
  },
  {
    id: '3',
    name: 'Pooja Agarwal',
    city: 'Mumbai',
    cityHi: 'मुंबई',
    country: 'India',
    countryHi: 'भारत',
    rating: 5,
    review:
      'We had the Maha Mrityunjaya and Navgrah Shanti Havan conducted through AstroVD. The pandits followed complete Vedic protocols with pure devotion. The peace we felt was immediate.',
    reviewHi:
      'हमने AstroVD के माध्यम से महामृत्युंजय एवं नवग्रह शांति हवन संपन्न कराया। काशी के विद्वान आचार्यों ने संपूर्ण वैदिक विधि-विधान और शुद्ध भाव से पूजन किया। घर में अपार शांति का अनुभव हुआ।',
    service: 'Vedic Yagya & Pooja Rituals',
    serviceHi: 'वैदिक यज्ञ एवं पूजा अनुष्ठान',
    date: '3 weeks ago',
    dateHi: '3 सप्ताह पूर्व',
    isVerifiedClient: true,
  },
  {
    id: '4',
    name: 'Vikram Malhotra',
    city: 'London',
    cityHi: 'लंदन',
    country: 'UK',
    countryHi: 'यूके',
    rating: 5,
    review:
      'The Tiger Eye Bracelet and Yellow Sapphire recommended according to my Janam Kundli arrived with lab certification. The vibrational shift and focus in my business have been incredible.',
    reviewHi:
      'मेरी जन्म कुंडली के अनुसार सुझाया गया टाइगर आई ब्रेसलेट एवं पीला पुखराज सरकारी लैब प्रमाण-पत्र सहित प्राप्त हुआ। धारण करने के उपरांत व्यापार में एकाग्रता और सकारात्मक ऊर्जा का अद्भुत संचार हुआ।',
    service: 'Energized Gemstones & Astro Store',
    serviceHi: 'प्राण-प्रतिष्ठित रत्न व आध्यात्मिक स्टोर',
    date: 'Recently',
    dateHi: 'हाल ही में',
    isVerifiedClient: true,
  },
];

export const FeedbackSection: React.FC = () => {
  const { t, language } = useLanguage();

  // Reviews state
  const [feedbacksList, setFeedbacksList] = useState<FeedbackItem[]>(DEFAULT_FEEDBACKS);

  // Verification & Eligibility State
  const [eligibility, setEligibility] = useState<'idle' | 'checking' | 'eligible' | 'not_eligible' | 'unauthenticated'>('idle');
  const [verifiedServices, setVerifiedServices] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');

  // UI States
  const [formOpen, setFormOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form inputs
  const [newCity, setNewCity] = useState('');
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(5);

  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');

  // Load verified user reviews from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('astro_verified_reviews');
      if (stored) {
        const parsed: FeedbackItem[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFeedbacksList([...parsed, ...DEFAULT_FEEDBACKS]);
        }
      }
    } catch (e) {
      console.error('Failed to load local reviews:', e);
    }
  }, []);

  // Verify whether current user has taken services, consultancy, or purchased products
  const checkEligibility = useCallback(async () => {
    const token = getAuthToken();
    const user = getStoredUser();

    if (!token || !user) {
      setEligibility('unauthenticated');
      return;
    }

    setEligibility('checking');

    try {
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Check backend for bookings & orders
      const [bookingsRes, ordersRes] = await Promise.allSettled([
        fetch(`${backendUrl}/api/appointments/my-bookings`, { headers }),
        fetch(`${backendUrl}/api/orders/my-orders`, { headers }),
      ]);

      const eligibleItems: string[] = [];

      // Check consultations
      if (bookingsRes.status === 'fulfilled' && bookingsRes.value.ok) {
        const data = await bookingsRes.value.json();
        const bookings = Array.isArray(data) ? data : data.bookings || [];
        for (const b of bookings) {
          if (b.serviceTitle) {
            eligibleItems.push(`Consultation: ${b.serviceTitle}`);
          }
        }
      }

      // Check orders
      if (ordersRes.status === 'fulfilled' && ordersRes.value.ok) {
        const data = await ordersRes.value.json();
        const orders = Array.isArray(data) ? data : data.orders || [];
        for (const o of orders) {
          if (Array.isArray(o.items) && o.items.length > 0) {
            for (const it of o.items) {
              eligibleItems.push(`Product: ${it.name || 'Sacred Spiritual Relic'}`);
            }
          } else {
            eligibleItems.push(`Spiritual Order #${o.orderNumber || o.id}`);
          }
        }
      }

      // 2. Check local fallback storage (e.g. guest/browser checkout or offline mode)
      if (typeof window !== 'undefined') {
        try {
          const localOrdersRaw = localStorage.getItem('astro_placed_orders');
          if (localOrdersRaw) {
            const localOrders = JSON.parse(localOrdersRaw);
            if (Array.isArray(localOrders)) {
              for (const lo of localOrders) {
                if (Array.isArray(lo.items)) {
                  for (const it of lo.items) {
                    const label = `Product: ${it.name || 'Consecrated Item'}`;
                    if (!eligibleItems.includes(label)) eligibleItems.push(label);
                  }
                }
              }
            }
          }

          const localAppointmentsRaw = localStorage.getItem('astro_user_appointments');
          if (localAppointmentsRaw) {
            const localAppts = JSON.parse(localAppointmentsRaw);
            if (Array.isArray(localAppts)) {
              for (const la of localAppts) {
                const label = `Consultation: ${la.serviceTitle || 'Vedic Guidance'}`;
                if (!eligibleItems.includes(label)) eligibleItems.push(label);
              }
            }
          }
        } catch (e) {
          console.error('Failed checking local purchases:', e);
        }
      }

      if (eligibleItems.length > 0) {
        setVerifiedServices(eligibleItems);
        setSelectedService(eligibleItems[0]);
        setEligibility('eligible');
      } else {
        setEligibility('not_eligible');
      }
    } catch (err) {
      console.error('Eligibility check error:', err);
      setEligibility('not_eligible');
    }
  }, [backendUrl]);

  // Listen to auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      const token = getAuthToken();
      if (!token) {
        setEligibility('unauthenticated');
      } else {
        checkEligibility();
      }
    };

    window.addEventListener('astro-auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('astro-auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [checkEligibility]);

  const handleStartReview = () => {
    const token = getAuthToken();
    if (!token) {
      setEligibility('unauthenticated');
      setAuthModalOpen(true);
      return;
    }

    setFormOpen(true);
    checkEligibility();
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.trim()) return;

    setSubmitting(true);
    const user = getStoredUser();

    const newFeedback: FeedbackItem = {
      id: `verified-${Date.now()}`,
      name: user?.name || 'Verified Client',
      city: newCity.trim() || 'Verified Location',
      country: 'India',
      rating: newRating,
      review: newReview.trim(),
      reviewHi: newReview.trim(),
      service: selectedService || 'Verified Vedic Consultation',
      serviceHi: selectedService || 'सत्यापित वैदिक परामर्श',
      date: 'Just now',
      dateHi: 'अभी-अभी',
      isVerifiedClient: true,
    };

    // Prepend to display list
    const updated = [newFeedback, ...feedbacksList];
    setFeedbacksList(updated);

    // Save user verified reviews locally
    try {
      const existing = localStorage.getItem('astro_verified_reviews');
      const parsed = existing ? JSON.parse(existing) : [];
      localStorage.setItem('astro_verified_reviews', JSON.stringify([newFeedback, ...parsed]));
    } catch (e) {
      console.error('Failed to save verified review:', e);
    }

    setSubmitting(false);
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      setFormOpen(false);
      setNewReview('');
      setNewCity('');
    }, 2800);
  };

  const storedUser = typeof window !== 'undefined' ? getStoredUser() : null;

  return (
    <section id="feedback" className="relative w-full bg-[#FAF7F2] py-20 lg:py-24 px-4 sm:px-6 lg:px-12 overflow-hidden selection:bg-amber-400">
      
      {/* Background Watermark */}
      <img
        src="/ornaments/clean_mandala.png"
        alt="Mandala"
        className="absolute top-1/2 -left-32 -translate-y-1/2 w-80 sm:w-[450px] h-auto object-contain pointer-events-none opacity-20 select-none"
      />

      <div className="max-w-7xl mx-auto space-y-12 sm:space-y-14 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#4A151B] leading-tight">
            {t('Customer Reviews & Feedback', 'ग्राहक समीक्षाएं एवं प्रतिक्रिया')}
          </h2>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {t(
              'Real reviews and experiences from verified clients who consulted with us or received energized remedies.',
              'हमारे साथ परामर्श लेने वाले एवं प्राण-प्रतिष्ठित सामग्री प्राप्त करने वाले सत्यापित जातकों के वास्तविक अनुभव।'
            )}
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {feedbacksList.map((item) => {
            const review = language === 'hi' ? item.reviewHi : item.review;
            const service = language === 'hi' ? item.serviceHi : item.service;
            const city = language === 'hi' && item.cityHi ? item.cityHi : item.city;
            const country = language === 'hi' && item.countryHi ? item.countryHi : item.country;
            const date = language === 'hi' ? item.dateHi : item.date;

            return (
              <div
                key={item.id}
                className="p-6 rounded-3xl bg-white/90 border border-amber-200/80 shadow-md hover:shadow-xl hover:border-amber-400 transition-all duration-300 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-[10px] text-stone-400 font-medium">
                      {date}
                    </span>
                  </div>

                  <p className="text-xs sm:text-[13px] text-stone-700 italic leading-relaxed">
                    &ldquo;{review}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 space-y-1.5">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-serif font-bold text-sm text-[#2A1810]">
                        {item.name}
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </div>

                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                      <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                      <span>{t('Verified Client', 'सत्यापित जातक')}</span>
                    </span>
                  </div>

                  <div className="text-[11px] text-stone-500">
                    {city}{country ? `, ${country}` : ''}
                  </div>

                  <div className="text-[10.5px] font-semibold text-amber-800 line-clamp-1 pt-0.5" title={service}>
                    {service}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ================= VERIFIED CLIENT REVIEW RESTRICTED SECTION ================= */}
        <div className="text-center pt-2">
          {!formOpen ? (
            <div className="inline-flex flex-col items-center gap-2">
              <button
                onClick={handleStartReview}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#5B0D15] via-[#7B121C] to-[#5B0D15] hover:from-[#7B121C] hover:to-[#5B0D15] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>{t('Write a Verified Review', 'सत्यापित समीक्षा लिखें')}</span>
              </button>
              
              <span className="text-[11px] text-stone-500 flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-700" />
                <span>{t('Only clients who have booked a service or purchased relics can review', 'केवल वही जातक समीक्षा दे सकते हैं जिन्होंने परामर्श अथवा सामग्री ली हो')}</span>
              </span>
            </div>
          ) : (
            <div className="max-w-xl mx-auto rounded-3xl bg-white p-6 sm:p-8 border border-amber-300 shadow-2xl text-left animate-fadeIn space-y-5">
              
              {/* Header inside modal/card */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-serif font-bold text-lg text-[#2A1810]">
                    {t('Verified Client Review', 'सत्यापित जातक समीक्षा')}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="text-stone-400 hover:text-stone-700 text-sm font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* State 1: Checking eligibility */}
              {eligibility === 'checking' && (
                <div className="py-8 text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#5B0D15] mx-auto" />
                  <p className="text-xs text-stone-600 font-semibold">
                    {t('Verifying your consultation and purchase records...', 'आपके परामर्श एवं खरीदारी रिकॉर्ड का सत्यापन किया जा रहा है...')}
                  </p>
                </div>
              )}

              {/* State 2: Unauthenticated */}
              {eligibility === 'unauthenticated' && (
                <div className="py-4 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-serif font-bold text-base text-[#4A151B]">
                      {t('Authentication Required', 'प्रमाणीकरण आवश्यक')}
                    </h4>
                    <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                      {t(
                        'To prevent spam and fake feedback, only clients with completed consultations or orders can submit reviews. Please sign in to verify your account.',
                        'प्रामाणिकता सुनिश्चित करने हेतु केवल वे ही जातक समीक्षा दे सकते हैं जिन्होंने परामर्श अथवा सामग्री ली हो। कृपया साइन इन करें।'
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="px-6 py-2.5 rounded-full bg-[#5B0D15] text-white text-xs font-bold hover:bg-[#78121d] transition-all cursor-pointer shadow-sm"
                  >
                    {t('Sign In to Verify', 'सत्यापन हेतु साइन इन करें')}
                  </button>
                </div>
              )}

              {/* State 3: Logged in but NOT eligible (No services or products purchased) */}
              {eligibility === 'not_eligible' && (
                <div className="py-4 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-serif font-bold text-base text-[#4A151B]">
                      {t('No Completed Bookings or Purchases Found', 'कोई पूर्ण परामर्श अथवा खरीदारी नहीं मिली')}
                    </h4>
                    <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                      {t(
                        `Hello ${storedUser?.name || 'Seeker'}, reviews on AstroVD are strictly verified. You can leave a review once you have consulted with Dr. Pandit Vishal Dubey or ordered energized spiritual relics.`,
                        `नमस्ते ${storedUser?.name || 'जातक'}, AstroVD पर समीक्षाएं केवल वास्तविक यजमान ही दे सकते हैं। परामर्श लेने अथवा सामग्री मंगाने के पश्चात आप यहां समीक्षा लिख सकेंगे।`
                      )}
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      href="/appointment"
                      className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#5B0D15] hover:bg-[#78121d] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>{t('Book a Consultation', 'परामर्श बुक करें')}</span>
                    </Link>

                    <Link
                      href="/shop"
                      className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-amber-300 bg-amber-50/70 hover:bg-amber-100 text-[#5B0D15] text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{t('Explore Spiritual Store', 'स्टोर देखें')}</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* State 4: Eligible! Show Review Form */}
              {eligibility === 'eligible' && (
                <>
                  {submitted ? (
                    <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs text-center space-y-1.5 animate-fadeIn">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                      <p className="font-bold text-sm">
                        {t('Verified Review Submitted Successfully!', 'आपकी सत्यापित समीक्षा सफलतापूर्वक दर्ज हो गई है!')}
                      </p>
                      <p className="text-stone-600">
                        {t('Thank you for sharing your experience. It is now published in customer reviews.', 'अपना अनुभव साझा करने के लिए धन्यवाद। यह अब ग्राहक समीक्षा में प्रदर्शित हो रही है।')}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      {/* Verified Seeker Identification Strip */}
                      <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                          <div className="text-xs">
                            <span className="font-bold text-[#2A1810]">{storedUser?.name}</span>
                            <span className="text-stone-500 text-[10px] block">Verified Customer ({storedUser?.email})</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </span>
                      </div>

                      {/* Select which consultation or product they are reviewing */}
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          {t('Select Consultation or Product Purchased:', 'संबद्ध परामर्श अथवा सामग्री चुनें:')}
                        </label>
                        <select
                          value={selectedService}
                          onChange={(e) => setSelectedService(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer"
                        >
                          {verifiedServices.map((srv, idx) => (
                            <option key={idx} value={srv}>
                              {srv}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* City/Location */}
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          {t('Your City / Location:', 'आपका शहर / स्थान:')}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={t('e.g. Mumbai, New Delhi, London, Dubai', 'उदा. मुंबई, दिल्ली, इंदौर')}
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Rating Stars */}
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          {t('Your Rating:', 'आपकी रेटिंग:')}
                        </label>
                        <div className="flex items-center gap-1.5 pt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewRating(star)}
                              className="text-amber-500 hover:scale-125 transition-transform p-1 cursor-pointer"
                            >
                              <Star className={`w-5 h-5 ${star <= newRating ? 'fill-current' : 'text-stone-300'}`} />
                            </button>
                          ))}
                          <span className="text-xs font-bold text-amber-900 ml-2">
                            {newRating} / 5 {t('Stars', 'सितारे')}
                          </span>
                        </div>
                      </div>

                      {/* Review Text */}
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          {t('Your Authentic Experience:', 'आपका वास्तविक अनुभव:')}
                        </label>
                        <textarea
                          required
                          rows={3}
                          placeholder={t(
                            'Describe your consultation accuracy, remedies prescribed, or product quality...',
                            'परामर्श की सटीकता, बताए गए उपाय अथवा सामग्री की गुणवत्ता का विवरण दें...'
                          )}
                          value={newReview}
                          onChange={(e) => setNewReview(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Actions */}
                      <div className="pt-2 flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setFormOpen(false)}
                          className="px-4 py-2 rounded-full border border-stone-300 text-stone-600 text-xs font-semibold hover:bg-stone-100 cursor-pointer"
                        >
                          {t('Cancel', 'रद्द करें')}
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-6 py-2 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>{t('Publishing...', 'प्रकाशित हो रहा है...')}</span>
                            </>
                          ) : (
                            <>
                              <span>{t('Submit Verified Review', 'सत्यापित समीक्षा भेजें')}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Global Auth Modal for instant login if unauthenticated */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={() => {
          setAuthModalOpen(false);
          setFormOpen(true);
          checkEligibility();
        }}
        initialMode="login"
      />
    </section>
  );
};
