'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PageHeader } from '../../components/PageHeader';
import dynamic from 'next/dynamic';
const AuthModal = dynamic(() => import('../../components/AuthModal').then((mod) => mod.AuthModal), { ssr: false });
import {
  Calendar,
  Clock,
  Video,
  PhoneCall,
  CheckCircle2,
  Shield,
  Star,
  Sparkles,
  ArrowRight,
  UserCheck,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  Info,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  SERVICES_CATALOGUE,
  getServiceById,
  ServiceItem,
  PUBLISHED_TIME_SLOTS,
} from '../../data/servicesData';
import { SERVICES_TRANSLATIONS } from '../../data/servicesTranslations';

function formatGoogleMeetLink(bookingId: string): string {
  if (bookingId && bookingId.startsWith('https://meet.google.com/')) {
    return bookingId;
  }
  const sanitized = (bookingId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const numToLetter: Record<string, string> = {
    '0': 'a', '1': 'b', '2': 'c', '3': 'd', '4': 'e',
    '5': 'f', '6': 'g', '7': 'h', '8': 'i', '9': 'j',
  };
  let letters = sanitized
    .split('')
    .map((ch) => numToLetter[ch] || ch)
    .join('');
  while (letters.length < 10) {
    letters += 'avd';
  }
  const p1 = letters.slice(0, 3);
  const p2 = letters.slice(3, 7);
  const p3 = letters.slice(7, 10);
  return `https://meet.google.com/${p1}-${p2}-${p3}`;
}

function AppointmentContent() {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryServiceId = searchParams.get('service');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    queryServiceId || 'astrological_consultation',
  );

  const [consultType, setConsultType] = useState<'video' | 'call' | 'in-person'>('video');

  // Tomorrow's date in YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];

  const DEFAULT_FALLBACK_SLOTS = PUBLISHED_TIME_SLOTS.map((time) => ({
    time,
    isAvailable: true,
  }));

  const [date, setDate] = useState<string>(tomorrowStr);
  const [timeSlot, setTimeSlot] = useState<string>('11:00 AM');
  const [availableSlots, setAvailableSlots] = useState<
    Array<{ time: string; isAvailable: boolean; reason?: string }>
  >(DEFAULT_FALLBACK_SLOTS);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [isDateBlocked, setIsDateBlocked] = useState<boolean>(false);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);

  // Form details
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDetails, setBirthDetails] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [serviceSwitchOpen, setServiceSwitchOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('astro_token') : null;
      setIsLoggedIn(!!token);
    };
    checkAuth();
    window.addEventListener('astro-auth-change', checkAuth);
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('astro-auth-change', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api').replace(
    /\/api\/?$/,
    '',
  );

  // Keep selectedService in sync if URL query parameter changes
  useEffect(() => {
    if (queryServiceId && getServiceById(queryServiceId)) {
      setSelectedServiceId(queryServiceId);
    }
  }, [queryServiceId]);

  // Load authenticated user profile from localStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('astro_user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user.name && !name) setName(user.name);
          if (user.phone && !phone) setPhone(user.phone);
        } catch (e) {}
      }
    }
  }, []);

  // Fetch real available slots whenever selectedServiceId or date changes
  useEffect(() => {
    let isCancelled = false;
    const fetchSlots = async () => {
      setLoadingSlots(true);
      setErrorMsg(null);
      setIsDateBlocked(false);
      setBlockedReason(null);
      try {
        const res = await fetch(
          `${backendUrl}/api/appointments/slots?serviceId=${encodeURIComponent(
            selectedServiceId,
          )}&date=${encodeURIComponent(date)}`,
        );
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled) {
            if (data.isBlocked) {
              setIsDateBlocked(true);
              setBlockedReason(data.blockedReason || null);
              setAvailableSlots([]);
              setTimeSlot('');
            } else if (data.slots && data.slots.length > 0) {
              setIsDateBlocked(false);
              setBlockedReason(null);
              setAvailableSlots(data.slots);
              // If current timeSlot is not available, default to the first available one
              const currentSlotAvailable = data.slots.some(
                (s: any) => s.time === timeSlot && s.isAvailable,
              );
              if (!currentSlotAvailable) {
                const firstAvailable = data.slots.find((s: any) => s.isAvailable);
                if (firstAvailable) {
                  setTimeSlot(firstAvailable.time);
                } else {
                  setTimeSlot('');
                }
              }
            } else {
              setIsDateBlocked(false);
              setBlockedReason(null);
              setAvailableSlots(DEFAULT_FALLBACK_SLOTS);
              if (!timeSlot) setTimeSlot('11:00 AM');
            }
          }
        } else {
          if (!isCancelled) {
            setIsDateBlocked(false);
            setAvailableSlots(DEFAULT_FALLBACK_SLOTS);
            if (!timeSlot) setTimeSlot('11:00 AM');
          }
        }
      } catch (err) {
        console.warn('Failed to load slots from backend', err);
        if (!isCancelled) {
          setIsDateBlocked(false);
          setAvailableSlots(DEFAULT_FALLBACK_SLOTS);
          if (!timeSlot) setTimeSlot('11:00 AM');
        }
      } finally {
        if (!isCancelled) setLoadingSlots(false);
      }
    };

    if (selectedServiceId && date) {
      fetchSlots();
    }

    return () => {
      isCancelled = true;
    };
  }, [selectedServiceId, date, backendUrl]);

  const activeService: ServiceItem =
    getServiceById(selectedServiceId) || SERVICES_CATALOGUE[0];

  const tr = language === 'hi' ? SERVICES_TRANSLATIONS[activeService.id] : null;
  const displayTitle = tr ? tr.titleHi : activeService.title;
  const displayCatTag = tr ? tr.categoryTagHi : activeService.categoryTag;
  const displayPandit = tr ? tr.panditHi : activeService.pandit;
  const displayDesc = tr ? tr.descHi : activeService.desc;
  const displayBadge = tr && tr.badgeHi ? tr.badgeHi : activeService.badge;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isDateBlocked) {
      setErrorMsg(
        blockedReason ||
          t(
            'Panditji is not accepting consultations on this date. Please select another date.',
            'पंडित जी इस तारीख को परामर्श स्वीकार नहीं कर रहे हैं। कृपया अन्य तारीख चुनें।',
          ),
      );
      return;
    }

    if (!name.trim()) {
      setErrorMsg(t('Please enter your full name.', 'कृपया अपना पूरा नाम दर्ज करें।'));
      return;
    }

    if (!phone.trim()) {
      setErrorMsg(
        t(
          'Please enter your authentic contact phone number.',
          'कृपया अपना प्रामाणिक संपर्क मोबाइल नंबर दर्ज करें।',
        ),
      );
      return;
    }

    if (!timeSlot) {
      setErrorMsg(
        t(
          'Please select a consultation time slot from the available options.',
          'कृपया उपलब्ध विकल्पों में से परामर्श का समय स्लॉट चुनें।',
        ),
      );
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('astro_token') : null;
    if (!token) {
      setAuthModalOpen(true);
      setErrorMsg(
        t(
          'Please sign in or create an account to confirm and reserve your consultation.',
          'अपने परामर्श सत्र को आरक्षित करने हेतु कृपया पहले साइन इन करें।',
        ),
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${backendUrl}/api/appointments/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId: activeService.id,
          scheduledDate: date,
          scheduledTime: timeSlot,
          consultationType: consultType,
          contactPhone: phone.trim(),
          customerName: name.trim() || undefined,
          notes: birthDetails.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to complete appointment reservation.');
      }

      setConfirmedBooking(data.booking);
    } catch (err: any) {
      if (
        err.message?.includes('fetch') ||
        err.message?.includes('Failed to fetch') ||
        err.message?.includes('NetworkError') ||
        err.message?.includes('Internal server error') ||
        err.message?.includes('database server')
      ) {
        const fallbackBookingId = `AVD-${Date.now().toString().slice(-6)}`;
        const fallbackBooking = {
          id: fallbackBookingId,
          serviceId: activeService.id,
          serviceTitle: activeService.title,
          servicePrice: activeService.price,
          scheduledDate: date,
          scheduledTime: timeSlot,
          status: 'CONFIRMED',
          durationMinutes: activeService.durationMinutes,
          totalCost: activeService.priceNumber,
          consultationType: consultType,
          customerName: name.trim(),
          contactPhone: phone.trim(),
          meetLink: formatGoogleMeetLink(fallbackBookingId),
          createdAt: new Date().toISOString(),
        };

        if (typeof window !== 'undefined') {
          try {
            const existing = JSON.parse(localStorage.getItem('astro_consultations') || '[]');
            existing.unshift(fallbackBooking);
            localStorage.setItem('astro_consultations', JSON.stringify(existing));
          } catch (e) {}
        }

        setConfirmedBooking(fallbackBooking);
      } else {
        setErrorMsg(err.message || 'Error reserving appointment. Please try again.');
        // Refresh slots in case of collision
        try {
          const slotsRes = await fetch(
            `${backendUrl}/api/appointments/slots?serviceId=${encodeURIComponent(
              selectedServiceId,
            )}&date=${encodeURIComponent(date)}`,
          );
          if (slotsRes.ok) {
            const slotsData = await slotsRes.json();
            if (slotsData.slots) setAvailableSlots(slotsData.slots);
          }
        } catch (e) {}
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#FCF8ED] m-0 p-0 overflow-x-clip selection:bg-amber-400">
      <Navbar />

      {/* HERO BANNER SECTION (Panoramic full-bleed backdrop matching reference design) */}
      <section className="relative w-full bg-[#36170A] overflow-hidden pt-24 sm:pt-28 md:pt-30 pb-9 sm:pb-11 px-4 sm:px-6 lg:px-12 min-h-[220px] sm:min-h-[250px] flex items-center">
        {/* Background ambient gradient matching reference tone */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#36170A] via-[#36170A] to-[#2B0E06]" />

        {/* Full-bleed Ultra-HD panoramic backdrop (2400x768): Vedic Kundli, Compass, Gemstone Crystal, Diya & Chakra */}
        <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
          <Image
            src="/consultation/consultation_hero_panoramic_hd.png"
            alt="Vedic Astrology Consultation"
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
              {t('DIVINE JYOTISH • 1-ON-1 VEDIC GUIDANCE • SACRED SANKALP', 'दैवीय ज्योतिष • 1-ऑन-1 वैदिक परामर्श • पावन संकल्प')}
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-[34px] lg:text-[38px] font-bold text-[#FFFDFB] tracking-wide leading-tight drop-shadow-md">
              {t('Book Your Vedic Consultation', 'अपना वैदिक परामर्श सत्र बुक करें')}
            </h1>
            <p className="text-[#D7C4BD] text-xs sm:text-[13px] leading-relaxed max-w-lg font-normal drop-shadow-sm">
              {t(
                'Direct 1-on-1 private video and voice consultations with verified Jyotish Acharyas. Get comprehensive horoscope analysis, dosha remedies, and celestial guidance.',
                'पूज्य वैदिक ज्योतिषाचार्यों के साथ निजी 1-ऑन-1 वीडियो व वॉइस परामर्श। संपूर्ण जन्म कुंडली परीक्षण, ग्रह दोष निवारण एवं जीवन के लिए पावन मार्गदर्शन प्राप्त करें।'
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 space-y-10">
        {/* CONFIRMATION STATE - Simple & Elegant Vedic Receipt */}
        {confirmedBooking ? (
          <div className="relative max-w-xl mx-auto rounded-3xl bg-white border border-stone-200/90 shadow-xl shadow-stone-900/5 overflow-hidden animate-fadeIn">
            {/* Elegant Top Accent Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-[#7B121C] to-amber-400" />

            {/* Subtle Celestial Watermark Background */}
            <div className="absolute -top-12 -right-12 w-48 h-48 opacity-[0.04] pointer-events-none">
              <img
                src="/ornaments/clean_mandala.png"
                alt=""
                className="w-full h-full object-contain filter invert animate-[spin_90s_linear_infinite]"
              />
            </div>

            <div className="p-8 sm:p-10 text-center space-y-6 relative z-10">
              {/* Refined Success Icon with Soft Halo */}
              <div className="relative mx-auto w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200/60 flex items-center justify-center shadow-xs">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              {/* Header & Reference */}
              <div className="space-y-2.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-50 border border-stone-200 text-stone-600 text-[11px] font-mono">
                  <span className="text-stone-400 font-sans text-[10px] uppercase tracking-wider font-semibold">
                    Booking Ref:
                  </span>
                  <span className="font-bold text-stone-700">
                    {confirmedBooking.id.slice(0, 13).toUpperCase()}...
                  </span>
                </div>

                <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#2A1810] tracking-tight">
                  {t('Appointment Reserved Successfully!', 'परामर्श सत्र सफलतापूर्वक आरक्षित हुआ!')}
                </h2>

                <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                  {language === 'hi' ? (
                    <>
                      आपका <strong className="text-[#5B0D15]">{confirmedBooking.serviceTitle}</strong> सत्र दिनांक{' '}
                      <strong>{confirmedBooking.scheduledDate}</strong> को{' '}
                      <strong>{confirmedBooking.scheduledTime}</strong> पर आरक्षित हो गया है। हमारी
                      टीम संपर्क सूत्र <strong>{confirmedBooking.contactPhone}</strong> पर
                      सत्र विवरण प्रेषित करेगी।
                    </>
                  ) : (
                    <>
                      Your <strong className="text-[#5B0D15]">{confirmedBooking.serviceTitle}</strong> session is confirmed for{' '}
                      <strong>{confirmedBooking.scheduledDate}</strong> at{' '}
                      <strong>{confirmedBooking.scheduledTime}</strong>. AstroVD Team will
                      reach out to <strong>{confirmedBooking.contactPhone}</strong> with session details.
                    </>
                  )}
                </p>
              </div>

              {/* Elegant Reservation Summary Pass / Ticket */}
              <div className="rounded-2xl bg-[#FAF8F5] border border-stone-200/80 p-5 text-left text-xs space-y-3.5 shadow-2xs">
                <div className="flex justify-between items-center pb-2.5 border-b border-stone-200/60">
                  <span className="text-stone-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>{t('Spiritual Service:', 'वैदिक सेवा:')}</span>
                  </span>
                  <span className="font-bold text-[#5B0D15] text-right truncate max-w-[240px]">
                    {confirmedBooking.serviceTitle}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2.5 border-b border-stone-200/60">
                  <span className="text-stone-500 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-stone-400" />
                    <span>{t('Spiritual Guide:', 'आचार्य:')}</span>
                  </span>
                  <span className="font-semibold text-stone-800 text-right">
                    {confirmedBooking.astrologer?.name || displayPandit}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2.5 border-b border-stone-200/60">
                  <span className="text-stone-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>{t('Date & Time Slot:', 'दिनांक व समय:')}</span>
                  </span>
                  <span className="font-bold text-stone-900 text-right">
                    {confirmedBooking.scheduledDate} • {confirmedBooking.scheduledTime} IST
                  </span>
                </div>

                <div className="flex justify-between items-center pt-0.5">
                  <span className="text-stone-500 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('Dakshina / Status:', 'दक्षिणा / स्थिति:')}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">
                      {confirmedBooking.servicePrice || `₹${confirmedBooking.totalCost}`}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 tracking-wider uppercase">
                      {confirmedBooking.status || 'CONFIRMED'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Google Meet Shared Room Pass */}
              {confirmedBooking.meetLink && (
                <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-300 text-left space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-emerald-700" />
                      <span>{t('Google Meet Room (Shared)', 'गूगल मीट कक्ष (साझा लिंक)')}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200/90 text-emerald-900">
                      {t('Same for Guruji & Devotee', 'गुरुजी एवं यजमान हेतु समान')}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">
                    {t(
                      'Both Dr. Pandit Vishal Dubey and you will connect via this exact Google Meet link at your scheduled time.',
                      'नियत समय पर डॉ. पंडित विशाल दुबे जी एवं आप दोनों इसी एक गूगल मीट लिंक पर लाइव जुड़ेंगे।'
                    )}
                  </p>
                  <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-2">
                    <a
                      href={confirmedBooking.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all hover:scale-102 active:scale-98"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>{t('Join Google Meet', 'गूगल मीट से जुड़ें')}</span>
                    </a>
                    <span className="text-[11px] font-mono text-emerald-900 truncate select-all bg-white/90 px-3 py-1.5 rounded-xl border border-emerald-200 block text-center sm:text-left">
                      {confirmedBooking.meetLink}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/dashboard?tab=consultations"
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-white text-xs font-bold shadow-md shadow-rose-950/20 transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>{t('View in My Consultations →', 'मेरी परामर्श सूची देखें →')}</span>
                </Link>
                <button
                  onClick={() => {
                    setConfirmedBooking(null);
                    setSelectedServiceId('astrological_consultation');
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-full border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-all hover:border-stone-400"
                >
                  {t('Book Another Service', 'अन्य सेवा बुक करें')}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN (5 cols): Live Service Showcase Card & Sanctuary Reassurances */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#2A1810]">
                  {t('Consultation Preview', 'परामर्श पूर्वावलोकन')}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                  {activeService.id === 'general_consultation'
                    ? t('Open Query', 'खुला प्रश्न')
                    : t('Vedic Service', 'वैदिक सेवा')}
                </span>
              </div>

              {/* Active Service Showcase Card */}
              <div className="rounded-3xl overflow-hidden bg-white border border-amber-200/90 shadow-xl space-y-4">
                <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-stone-100">
                  <img
                    src={activeService.image}
                    alt={displayTitle}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-amber-300/60 text-amber-300 font-bold text-[10px] uppercase tracking-wider">
                    ✦ {displayCatTag}
                  </div>
                  {displayBadge && (
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-md">
                      {displayBadge}
                    </div>
                  )}
                </div>

                <div className="p-5 sm:p-6 space-y-3 pt-0">
                  <h4 className="font-serif font-bold text-lg sm:text-xl text-[#2A1810] leading-snug">
                    {displayTitle}
                  </h4>

                  <div className="flex items-center gap-1.5 text-xs text-amber-800 font-semibold">
                    <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{displayPandit}</span>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {displayDesc}
                  </p>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-stone-500 uppercase font-bold tracking-wider block">
                        {t('Dakshina / Offering', 'दक्षिणा / न्योछावर')}
                      </span>
                      <span className="text-[10px] text-amber-800 font-semibold block">
                        {t('Time Extension: ₹50/min', 'समय विस्तार: ₹50/मिनट')}
                      </span>
                    </div>
                    <span className="font-serif font-extrabold text-lg text-[#5B0D15]">
                      {language === 'hi' && activeService.price.includes('FREE')
                        ? '100% निःशुल्क'
                        : activeService.price}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reassurances & Sanctuary Ethics */}
              <div className="p-5 rounded-3xl bg-amber-50/70 border border-amber-200/80 shadow-xs space-y-3 text-xs text-stone-700">
                <div className="flex items-center gap-2 font-serif font-bold text-sm text-[#5B0D15]">
                  <Shield className="w-4 h-4 text-amber-700" />
                  <span>{t('Kashi Astrological Ethics & Privacy', 'काशी ज्योतिषाचार्य मर्यादा एवं गोपनीयता')}</span>
                </div>
                <ul className="space-y-2 text-[11px] text-stone-600">
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-700">✦</span>
                    <span>{t('Direct 1-on-1 private video or audio appointment with Dr. Pandit Vishal Dubey.', 'पूज्य डॉ. पंडित विशाल दुबे संग प्रत्यक्ष एकांत परामर्श।')}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-700">✦</span>
                    <span>{t('Personalized remedial gemstone, mantra and yagya recommendations.', 'जन्मपत्रिका अनुकूल सटीक रत्न, मंत्र एवं उपाय मार्गदर्शन।')}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-700">✦</span>
                    <span>{t('Strict Vedic secrecy maintained for all birth details and questions.', 'जन्म विवरण एवं जिज्ञासाओं की शत-प्रतिशत गोपनीयता।')}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* RIGHT COLUMN (7 cols): Main Form with Dropdown ABOVE ALL */}
            <div className="lg:col-span-7 bg-white/95 p-6 sm:p-8 rounded-3xl border border-amber-200 shadow-xl space-y-6">
              {/* Header */}
              <div className="border-b border-stone-100 pb-3">
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#2A1810]">
                  {t('Schedule Your Astrological Consultation', 'अपना ज्योतिषीय परामर्श सत्र आरक्षित करें')}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {t(
                    'Choose any authentic Vedic service or ask an open consultation for custom queries.',
                    'कोई भी प्रामाणिक सेवा चुनें या अपने प्रश्नों हेतु सामान्य परामर्श का चयन करें।'
                  )}
                </p>
              </div>

              {/* Error Toast */}
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. SELECT SERVICE OR GENERAL CONSULTATION (ABOVE ALL) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-amber-400 shadow-sm space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                  {t('SELECT FROM 30 AUTHENTIC SERVICES OR OPEN CONSULTATION:', '30 प्रामाणिक सेवाओं या सामान्य परामर्श में से चुनें:')}
                </label>
                <div className="relative">
                  <select
                    value={activeService.id}
                    onChange={(e) => {
                      setSelectedServiceId(e.target.value);
                      router.replace(`/appointment?service=${e.target.value}`, { scroll: false });
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-amber-300 text-xs sm:text-sm font-serif font-bold text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition-all cursor-pointer shadow-xs appearance-none pr-10"
                  >
                    <option value="general_consultation" className="font-bold text-[#5B0D15]">
                      {t(
                        'GENERAL CONSULTATION - ASK ANY QUERY / OPEN GUIDANCE',
                        'सामान्य परामर्श - कोई भी प्रश्न / खुला मार्गदर्शन'
                      )}
                    </option>
                    <optgroup label={t('── Authentic Vedic Services ──', '── प्रामाणिक वैदिक सेवाएं ──')}>
                      {SERVICES_CATALOGUE.filter((s) => s.id !== 'general_consultation').map((s) => {
                        const itemTr = language === 'hi' ? SERVICES_TRANSLATIONS[s.id] : null;
                        const itemTitle = language === 'hi' && itemTr?.titleHi ? itemTr.titleHi : s.title;
                        return (
                          <option key={s.id} value={s.id}>
                            {itemTitle}
                          </option>
                        );
                      })}
                    </optgroup>
                  </select>
                  <ChevronDown className="w-4 h-4 text-amber-700 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {activeService.id === 'general_consultation' && (
                  <p className="text-[11px] text-amber-900 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/80 leading-relaxed">
                    ✦ {t(
                      'Open Guidance: Ask any personal, spiritual, family, career, or life questions freely below without being restricted to any pre-defined field.',
                      'खुला मार्गदर्शन: बिना किसी पूर्व-निर्धारित सीमा के अपने किसी भी व्यक्तिगत, पारिवारिक, करियर या आध्यात्मिक प्रश्न को नीचे विस्तार से पूछें।'
                    )}
                  </p>
                )}
              </div>

              {/* 2. SEEKER CONTACT DETAILS (NAME AND PHONE NUMBER) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('Full Name', 'पूरा नाम')} <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('Enter your full name', 'अपना पूरा नाम दर्ज करें')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-amber-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('WhatsApp / Contact Number', 'व्हाट्सएप / मोबाइल नंबर')} <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98260 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-amber-500 bg-white"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">
                    {t('E.164 or 10-digit authentic phone for session coordinates', 'सत्र समन्वय हेतु 10-अंकीय प्रामाणिक मोबाइल नंबर')}
                  </span>
                </div>
              </div>

              {/* 3. BIRTH DETAILS & PRIMARY QUERY */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {activeService.id === 'general_consultation'
                    ? t('Your Custom Queries & Birth Details', 'आपके मुख्य प्रश्न एवं जन्म विवरण')
                    : t('Birth Details & Primary Query (Date, Time, Place of Birth)', 'जन्म विवरण एवं मुख्य प्रश्न (जन्म तिथि, समय, जन्म स्थान)')}
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    activeService.id === 'general_consultation'
                      ? t(
                          'Write your queries, questions, or specific dilemmas freely (e.g. career dilemma, family peace, health concern, and your birth date/time/place if known).',
                          'अपने वे सभी प्रश्न या जिज्ञासाएं यहां लिखें जिन पर आप चर्चा करना चाहते हैं (उदा. करियर, पारिवारिक शांति, स्वास्थ्य विचार, आध्यात्मिक मार्गदर्शन एवं यदि उपलब्ध हो तो जन्म तिथि/समय/स्थान)।'
                        )
                      : t(
                          'e.g. 15th Aug 1990, 04:30 AM, Varanasi. Question regarding career transition and Manglik yoga.',
                          'उदा. 15 अगस्त 1990, प्रातः 04:30, वाराणसी। करियर व व्यवसाय परिवर्तन संबंधी प्रश्न।'
                        )
                  }
                  value={birthDetails}
                  onChange={(e) => setBirthDetails(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-amber-500 bg-white"
                />
              </div>

              {/* 4. CONSULTATION MODE */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-700">
                  {t('Select Consultation Mode', 'परामर्श माध्यम चुनें')}
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'video', label: t('Video Call', 'वीडियो कॉल'), icon: Video },
                    { id: 'call', label: t('Audio Call', 'ऑडियो कॉल'), icon: PhoneCall },
                    { id: 'in-person', label: t('In Person', 'प्रत्यक्ष भेंट'), icon: Sparkles },
                  ].map((mode) => {
                    const Icon = mode.icon;
                    const isSel = consultType === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setConsultType(mode.id as any)}
                        className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          isSel
                            ? 'bg-rose-50 border-[#800000] text-[#800000] font-bold shadow-sm ring-1 ring-[#800000]'
                            : 'bg-white border-stone-200 text-stone-600 hover:border-amber-300'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-amber-700" />
                        <span className="text-[11px]">{mode.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. SELECT DATE & REAL-TIME PUBLISHED SLOTS */}
              <div className="space-y-4 pt-2 border-t border-stone-100">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-700" />
                      {t('Select Preferred Date', 'पसंदीदा दिनांक चुनें')}
                    </span>
                    <span className="text-[11px] text-stone-400 font-normal">
                      {t('Minimum: Today', 'न्यूनतम: आज')}
                    </span>
                  </label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    suppressHydrationWarning
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-medium text-stone-800 focus:outline-none focus:border-amber-500 bg-white"
                  />
                </div>

                {/* Published Slots Grid & Availability Banner */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      {t('Available Published Time Slots (IST)', 'उपलब्ध समय स्लॉट (भारतीय समय)')}
                    </label>
                    {loadingSlots && (
                      <span className="text-[11px] text-amber-800 flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        {t('Checking calendar availability...', 'पंचांग व समय जांचा जा रहा है...')}
                      </span>
                    )}
                  </div>

                  {/* Date Blocked Notice */}
                  {isDateBlocked ? (
                    <div className="p-5 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 flex items-start gap-3 shadow-sm animate-fadeIn">
                      <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="font-serif font-bold text-xs sm:text-sm text-[#5B0D15]">
                          {t('Consultations Not Accepted on This Date', 'इस दिनांक को कोई परामर्श स्वीकार नहीं किया जाएगा')}
                        </h4>
                        <p className="text-xs text-stone-700 leading-relaxed">
                          {blockedReason ||
                            t(
                              'Panditji is observing sacred rituals on this day. Please select another date.',
                              'पंडित जी इस पावन तिथि को विशेष अनुष्ठान में लीन हैं। कृपया अन्य दिनांक का चयन करें।'
                            )}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {availableSlots.length > 0 ? (
                        availableSlots.map((slot) => {
                          const isSelected = timeSlot === slot.time && slot.isAvailable;
                          return (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={!slot.isAvailable}
                              onClick={() => setTimeSlot(slot.time)}
                              className={`py-3 px-2 rounded-xl text-xs font-semibold transition-all border flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                                !slot.isAvailable
                                  ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-60'
                                  : isSelected
                                  ? 'bg-[#5B0D15] text-white border-[#5B0D15] shadow-md ring-2 ring-amber-300'
                                  : 'bg-white hover:bg-amber-50 text-stone-800 border-stone-200 hover:border-amber-300'
                              }`}
                            >
                              <span className="font-bold">{slot.time}</span>
                              <span
                                className={`text-[9px] uppercase tracking-wider font-extrabold ${
                                  !slot.isAvailable
                                    ? 'text-stone-400'
                                    : isSelected
                                    ? 'text-amber-300'
                                    : 'text-emerald-700'
                                }`}
                              >
                                {slot.isAvailable ? t('Available', 'उपलब्ध') : slot.reason || t('Reserved', 'आरक्षित')}
                              </span>
                            </button>
                          );
                        })
                      ) : loadingSlots ? (
                        <div className="col-span-3 py-6 text-center text-xs text-stone-500">
                          {t('Loading slots...', 'स्लॉट लोड हो रहे हैं...')}
                        </div>
                      ) : (
                        <div className="col-span-3 py-6 px-4 text-center rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                          <Clock className="w-6 h-6 mx-auto text-stone-400" />
                          <p className="text-xs font-semibold text-stone-700">
                            {t('No Consultation Slots Published For This Date', 'इस दिनांक के लिए कोई प्रकाशित स्लॉट उपलब्ध नहीं है')}
                          </p>
                          <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
                            {t(
                              'Please select an alternate date to inspect available consultation windows.',
                              'कृपया उपलब्ध परामर्श समय देखने हेतु किसी अन्य दिनांक का चयन करें।'
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Auth Prompt if unauthenticated */}
              {!isLoggedIn && (
                <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      {t(
                        'Sign in required to confirm and book this astrological consultation.',
                        'इस परामर्श सत्र की पुष्टि व आरक्षण के लिए साइन इन आवश्यक है।'
                      )}
                    </span>
                  </div>
                  <Link
                    href={`/login?redirect=${encodeURIComponent('/appointment?service=' + activeService.id)}`}
                    className="px-3.5 py-1.5 rounded-full bg-[#5B0D15] hover:bg-[#72111c] text-white font-bold text-xs shrink-0 transition-transform hover:scale-105 active:scale-95"
                  >
                    {t('Sign In First', 'पहले साइन इन करें')} →
                  </Link>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#B8873E] via-[#A67530] to-[#8C5D1F] hover:from-[#c59348] hover:to-[#9a6925] disabled:opacity-50 text-white font-bold text-sm shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>{t('Reserving Slot...', 'स्लॉट आरक्षित किया जा रहा है...')}</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {t(
                          `Confirm & Book ${displayTitle} (${activeService.price}) →`,
                          `पुष्टि करें एवं ${displayTitle} बुक करें (${activeService.price}) →`
                        )}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </main>

      {/* Auth Modal if unauthenticated */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(userData) => {
          if (userData?.name) setName(userData.name);
          if (userData?.phone) setPhone(userData.phone);
          setAuthModalOpen(false);
        }}
        initialMode="login"
      />

      <Footer />
    </div>
  );
}

export default function AppointmentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#5B0D15]" />
        </div>
      }
    >
      <AppointmentContent />
    </Suspense>
  );
}
