'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PageHeader } from '../../components/PageHeader';
import { AuthModal } from '../../components/AuthModal';
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
import { SERVICES_CATALOGUE, getServiceById, ServiceItem } from '../../data/servicesData';
import { SERVICES_TRANSLATIONS } from '../../data/servicesTranslations';

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

  const [date, setDate] = useState<string>(tomorrowStr);
  const [timeSlot, setTimeSlot] = useState<string>('11:00 AM');
  const [availableSlots, setAvailableSlots] = useState<
    Array<{ time: string; isAvailable: boolean; reason?: string }>
  >([]);
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
            } else if (data.slots) {
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
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load slots from backend', err);
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

    const token = typeof window !== 'undefined' ? localStorage.getItem('astro_token') : null;
    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent('/appointment?service=' + activeService.id)}`);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#FAF7F2] m-0 p-0 overflow-x-clip selection:bg-amber-400">
      <Navbar />

      <PageHeader
        breadcrumb={t('Online Consultation', 'ऑनलाइन वैदिक परामर्श')}
        title={t('Book Your Vedic Consultation', 'अपना वैदिक परामर्श सत्र बुक करें')}
        subtitle={t(
          'Select your consecrated service, choose an available published time slot, and receive 1-on-1 divine astrological guidance.',
          'अपनी पावन वैदिक सेवा चुनें, उपलब्ध समय स्लॉट आरक्षित करें एवं पूज्य आचार्यों से प्रत्यक्ष मार्गदर्शन प्राप्त करें।'
        )}
      />

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
                      <strong>{confirmedBooking.scheduledTime}</strong> पर आरक्षित हो गया है। हमारे
                      समन्वयक संपर्क सूत्र <strong>{confirmedBooking.contactPhone}</strong> पर
                      गोपनीय लिंक प्रेषित करेंगे।
                    </>
                  ) : (
                    <>
                      Your <strong className="text-[#5B0D15]">{confirmedBooking.serviceTitle}</strong> session is confirmed for{' '}
                      <strong>{confirmedBooking.scheduledDate}</strong> at{' '}
                      <strong>{confirmedBooking.scheduledTime}</strong>. Celestial coordinators will
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

              {/* Quiet Reassurance Banner */}
              <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 bg-emerald-50/60 py-2.5 px-3.5 rounded-xl border border-emerald-100/70">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span>
                  {t(
                    'Private video meeting link will be shared prior to your session.',
                    'परामर्श का गोपनीय लिंक सत्र से पूर्व प्रेषित किया जाएगा।'
                  )}
                </span>
              </div>

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
            {/* LEFT COLUMN (5 cols): Selected Service Details & Change Service Dropdown */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#2A1810]">
                  {t('1. Selected Spiritual Service', '1. चयनित वैदिक सेवा')}
                </h3>

                <button
                  type="button"
                  onClick={() => setServiceSwitchOpen(!serviceSwitchOpen)}
                  className="text-xs text-[#5B0D15] font-semibold hover:underline flex items-center gap-1"
                >
                  <span>{t('Change Service', 'सेवा बदलें')}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Service Switcher Dropdown */}
              {serviceSwitchOpen && (
                <div className="p-4 rounded-2xl bg-white border border-amber-300 shadow-xl space-y-2 animate-fadeIn max-h-72 overflow-y-auto">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                    {t('Select from 29 Authentic Services:', '29 प्रामाणिक सेवाओं में से चुनें:')}
                  </label>
                  <select
                    value={activeService.id}
                    onChange={(e) => {
                      setSelectedServiceId(e.target.value);
                      setServiceSwitchOpen(false);
                      router.replace(`/appointment?service=${e.target.value}`, { scroll: false });
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-amber-300 text-xs font-semibold text-stone-800 bg-stone-50 focus:outline-none focus:border-amber-500"
                  >
                    {SERVICES_CATALOGUE.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({s.price})
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                    <span className="text-[11px] text-stone-500 uppercase font-bold tracking-wider">
                      {t('Dakshina / Offering', 'दक्षिणा / न्योछावर')}
                    </span>
                    <span className="font-serif font-extrabold text-lg text-[#5B0D15]">
                      {language === 'hi' && activeService.price.includes('FREE')
                        ? '100% निःशुल्क'
                        : activeService.price}
                    </span>
                  </div>
                </div>
              </div>

              {/* Consultation Format Options */}
              <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-3">
                <h4 className="font-serif font-bold text-sm text-[#2A1810]">
                  {t('Consultation Mode', 'परामर्श माध्यम')}
                </h4>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'video', label: t('Video Call', 'वीडियो कॉल'), icon: Video },
                    { id: 'call', label: t('Audio Call', 'ऑडियो कॉल'), icon: PhoneCall },
                    { id: 'in-person', label: t('In Person', 'आश्रम दर्शन'), icon: Sparkles },
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
            </div>

            {/* RIGHT COLUMN (7 cols): Date, Slots, and Seeker Information */}
            <div className="lg:col-span-7 bg-white/95 p-6 sm:p-8 rounded-3xl border border-amber-200 shadow-xl space-y-6">
              <div className="border-b border-stone-100 pb-3">
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#2A1810]">
                  {t('2. Select Date & Real-Time Published Slot', '2. दिनांक एवं उपलब्ध स्लॉट चुनें')}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {t(
                    'Slots are queried in real time from the sanctuary scheduling registry.',
                    'सभी स्लॉट वास्तविक समय में पंचांग एवं आश्रम रोस्टर से सत्यापित किए जाते हैं।'
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

              {/* Date Picker */}
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
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-medium text-stone-800 focus:outline-none focus:border-amber-500 bg-stone-50/50"
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
                      {t('Checking sanctuary registry...', 'आश्रम पंचांग जांचा जा रहा है...')}
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
                            'Panditji is observing sacred sanctuary rituals or sanctified observances on this day. Please select another date.',
                            'पंडित जी इस पावन तिथि को विशेष अनुष्ठान या आश्रम पर्व में लीन हैं। कृपया अन्य दिनांक का चयन करें।'
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

              {/* Seeker Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('Seeker Full Name', 'पूरा नाम')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('Enter your full name', 'अपना पूरा नाम दर्ज करें')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('WhatsApp / Contact Number', 'व्हाट्सएप / मोबाइल नंबर')}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98260 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">
                    {t('E.164 or 10-digit authentic phone', '10-अंकीय प्रामाणिक मोबाइल नंबर')}
                  </span>
                </div>
              </div>

              {/* Birth Details and Questions */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t(
                    'Birth Details & Primary Query (Date, Time, Place of Birth)',
                    'जन्म विवरण एवं मुख्य प्रश्न (जन्म तिथि, समय, जन्म स्थान)'
                  )}
                </label>
                <textarea
                  rows={3}
                  placeholder={t(
                    'e.g. 15th Aug 1990, 04:30 AM, Varanasi. Question regarding career transition and Manglik yoga.',
                    'उदा. 15 अगस्त 1990, प्रातः 04:30, वाराणसी। करियर व व्यवसाय परिवर्तन संबंधी प्रश्न।'
                  )}
                  value={birthDetails}
                  onChange={(e) => setBirthDetails(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-amber-500"
                />
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
                  disabled={loading || !timeSlot || isDateBlocked}
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

              <div className="flex items-center justify-center gap-4 text-[11px] text-stone-500 pt-1">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  {t('100% Confidential', '100% पूर्णतः गोपनीय')}
                </span>
                <span>•</span>
                <span>{t('Strict Sanctuary Privacy', 'प्रामाणिक काशी पीठ गोपनीयता')}</span>
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
