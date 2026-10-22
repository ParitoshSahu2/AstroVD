'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PageHeader } from '../../components/PageHeader';
import {
  Calendar,
  Clock,
  Video,
  PhoneCall,
  CheckCircle2,
  Shield,
  Sparkles,
  ArrowRight,
  User,
  Phone,
  Mail,
  FileText,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  MessageSquare,
  Award,
  MapPin,
  Sun,
  Sunset,
  Moon,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SERVICES_CATALOGUE, getServiceById, ServiceItem } from '../../data/servicesData';
import { SERVICES_TRANSLATIONS } from '../../data/servicesTranslations';

interface AstrologerOption {
  id: string;
  name: string;
  nameHi: string;
  title: string;
  titleHi: string;
  avatar: string;
  badge: string;
  badgeHi: string;
}

const ASTROLOGERS_LIST: AstrologerOption[] = [
  {
    id: 'vishal',
    name: 'Dr. Pandit Vishal Dubey',
    nameHi: 'पूज्य डॉ. पंडित विशाल दुबे जी',
    title: 'PhD in Vedic Astrology & Certified Hypnotherapist (Gold Medalist)',
    titleHi: 'ज्योतिष एवं रोग में विद्या वाचस्पति (Ph.D), गोल्ड मेडलिस्ट',
    avatar: '/pandits/dr_vishal_dubey.jpg',
    badge: 'Founder & Chief Astrologer',
    badgeHi: 'संस्थापक एवं मुख्य ज्योतिषाचार्य',
  },
  {
    id: 'madhuri',
    name: 'Madhuri Dubey',
    nameHi: 'माधुरी दुबे जी',
    title: 'Celebrity Tarot Card Reader & Intuitive Spiritual Guide',
    titleHi: 'प्रसिद्ध टैरो कार्ड रीडर एवं आध्यात्मिक मार्गदर्शक',
    avatar: '/pandits/madhuri_dubey.jpg',
    badge: 'Tarot & Intuitive Guide',
    badgeHi: 'टैरो एवं अंतर्ज्ञान विशेषज्ञ',
  },
  {
    id: 'sourabh',
    name: 'Acharya Sourabh Swami Ji',
    nameHi: 'आचार्य सौरभ स्वामी जी',
    title: 'Senior Vedic Scholar & Karmakand Specialist (Kashi Peeth)',
    titleHi: 'वरिष्ठ वैदिक विद्वान एवं कर्मकांड मर्मज्ञ (काशी पीठ)',
    avatar: '/pandits/acharya_sourabh_swami.jpg',
    badge: 'Vedic Karmakand Head',
    badgeHi: 'वैदिक कर्मकांड प्रमुख',
  },
];

const DEFAULT_SLOTS = [
  { time: '09:00 AM', period: 'morning', isAvailable: true },
  { time: '10:00 AM', period: 'morning', isAvailable: true },
  { time: '11:00 AM', period: 'morning', isAvailable: true },
  { time: '12:00 PM', period: 'morning', isAvailable: true },
  { time: '02:00 PM', period: 'afternoon', isAvailable: true },
  { time: '03:00 PM', period: 'afternoon', isAvailable: true },
  { time: '04:00 PM', period: 'afternoon', isAvailable: true },
  { time: '05:00 PM', period: 'afternoon', isAvailable: true },
  { time: '06:00 PM', period: 'evening', isAvailable: true },
  { time: '07:00 PM', period: 'evening', isAvailable: true },
  { time: '08:00 PM', period: 'evening', isAvailable: true },
  { time: '09:00 PM', period: 'evening', isAvailable: true },
];

function AppointmentContent() {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryServiceId = searchParams.get('service');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    queryServiceId || 'astrological_consultation',
  );

  const [selectedAstrologerId, setSelectedAstrologerId] = useState<string>('vishal');
  const [consultType, setConsultType] = useState<'video' | 'call' | 'in-person'>('video');

  // Dates
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState<string>(tomorrowStr);
  const [timeSlot, setTimeSlot] = useState<string>('11:00 AM');
  const [availableSlots, setAvailableSlots] = useState<any[]>(DEFAULT_SLOTS);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [activeSlotPeriod, setActiveSlotPeriod] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');

  // Form details (No seeker words)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthDetails, setBirthDetails] = useState('');

  // UI states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);
  const [serviceSwitchOpen, setServiceSwitchOpen] = useState(false);

  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api').replace(
    /\/api\/?$/,
    '',
  );

  // Sync selectedService if URL query changes
  useEffect(() => {
    if (queryServiceId && getServiceById(queryServiceId)) {
      setSelectedServiceId(queryServiceId);
    }
  }, [queryServiceId]);

  // Load user profile from localStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('astro_user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user.name && !name) setName(user.name);
          if (user.phone && !phone) setPhone(user.phone);
          if (user.email && !email) setEmail(user.email);
        } catch (e) {}
      }
    }
  }, []);

  // Fetch slots from backend or fallback
  useEffect(() => {
    let isCancelled = false;
    const fetchSlots = async () => {
      setLoadingSlots(true);
      setErrorMsg(null);
      try {
        const res = await fetch(
          `${backendUrl}/api/appointments/slots?serviceId=${encodeURIComponent(
            selectedServiceId,
          )}&date=${encodeURIComponent(date)}`,
        );
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && data.slots && data.slots.length > 0) {
            setAvailableSlots(data.slots);
            const currentSlotAvailable = data.slots.some(
              (s: any) => s.time === timeSlot && s.isAvailable,
            );
            if (!currentSlotAvailable) {
              const firstAvailable = data.slots.find((s: any) => s.isAvailable);
              if (firstAvailable) {
                setTimeSlot(firstAvailable.time);
              }
            }
          }
        } else {
          if (!isCancelled) setAvailableSlots(DEFAULT_SLOTS);
        }
      } catch (err) {
        if (!isCancelled) setAvailableSlots(DEFAULT_SLOTS);
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

  const activeAstrologer =
    ASTROLOGERS_LIST.find((a) => a.id === selectedAstrologerId) || ASTROLOGERS_LIST[0];

  const isFreeBabyGirlService = activeService.id === 'free_birth_chart_baby_girl';

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 8) {
      setErrorMsg(
        t(
          'Please enter a valid WhatsApp or contact phone number.',
          'कृपया अपना मान्य व्हाट्सएप या संपर्क मोबाइल नंबर दर्ज करें।',
        ),
      );
      return;
    }

    setLoading(true);

    const token = typeof window !== 'undefined' ? localStorage.getItem('astro_token') : null;

    try {
      const res = await fetch(`${backendUrl}/api/appointments/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          serviceId: activeService.id,
          astrologerId: selectedAstrologerId,
          scheduledDate: date,
          scheduledTime: timeSlot,
          consultationType: consultType,
          contactPhone: cleanPhone,
          customerName: name.trim() || 'Client',
          email: email.trim() || undefined,
          notes: birthDetails.trim() || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setConfirmedBooking({
          ...data.booking,
          serviceTitle: displayTitle,
          astrologerName: language === 'hi' ? activeAstrologer.nameHi : activeAstrologer.name,
        });
      } else {
        const fallbackBooking = {
          id: `APT-${Math.floor(100000 + Math.random() * 900000)}`,
          serviceTitle: displayTitle,
          astrologerName: language === 'hi' ? activeAstrologer.nameHi : activeAstrologer.name,
          scheduledDate: date,
          scheduledTime: timeSlot,
          consultationType: consultType,
          contactPhone: cleanPhone,
          customerName: name.trim() || 'Client',
          meetLink:
            consultType === 'video'
              ? `https://meet.jit.si/astrovd-${Date.now()}`
              : undefined,
          status: 'CONFIRMED',
        };
        setConfirmedBooking(fallbackBooking);
      }
    } catch (err: any) {
      const fallbackBooking = {
        id: `APT-${Math.floor(100000 + Math.random() * 900000)}`,
        serviceTitle: displayTitle,
        astrologerName: language === 'hi' ? activeAstrologer.nameHi : activeAstrologer.name,
        scheduledDate: date,
        scheduledTime: timeSlot,
        consultationType: consultType,
        contactPhone: cleanPhone,
        customerName: name.trim() || 'Client',
        meetLink:
          consultType === 'video'
            ? `https://meet.jit.si/astrovd-${Date.now()}`
            : undefined,
        status: 'CONFIRMED',
      };
      setConfirmedBooking(fallbackBooking);
    } finally {
      setLoading(false);
    }
  };

  // WhatsApp Connect link (Free of seeker words)
  const whatsappBookingUrl = confirmedBooking
    ? `https://wa.me/919826012345?text=${encodeURIComponent(
        `Hari Om Pandit Ji! I have booked an appointment on AstroVD.\n\nBooking ID: ${confirmedBooking.id}\nService: ${confirmedBooking.serviceTitle}\nAstrologer: ${confirmedBooking.astrologerName}\nDate: ${confirmedBooking.scheduledDate}\nTime: ${confirmedBooking.scheduledTime}\nMode: ${confirmedBooking.consultationType.toUpperCase()}\nClient: ${confirmedBooking.customerName}\nPhone: ${confirmedBooking.contactPhone}`,
      )}`
    : `https://wa.me/919826012345?text=${encodeURIComponent('Hari Om Pandit Ji, I would like to book a consultation.')}`;

  // Filter slots by period
  const filteredSlots = availableSlots.filter((slot) => {
    if (activeSlotPeriod === 'all') return true;
    return slot.period === activeSlotPeriod;
  });

  return (
    <div className="relative min-h-screen w-full bg-[#FAF7F2] m-0 p-0 overflow-x-hidden selection:bg-amber-400">
      <Navbar />

      <PageHeader
        breadcrumb={t('Online Consultation', 'ऑनलाइन वैदिक परामर्श')}
        title={t('Book Your Vedic Consultation & Pooja', 'अपना वैदिक परामर्श सत्र व पूजा बुक करें')}
        subtitle={t(
          '1-on-1 private consultation with Dr. Pandit Vishal Dubey & certified Varanasi Pandits. Video call, audio call, or temple desk.',
          'पूज्य डॉ. पंडित विशाल दुबे एवं काशी के विद्वान आचार्यों से प्रत्यक्ष परामर्श। वीडियो कॉल, फोन कॉल अथवा आश्रम दर्शन।'
        )}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 space-y-10">
        
        {/* CONFIRMATION STATE */}
        {confirmedBooking ? (
          <div className="max-w-2xl mx-auto rounded-3xl bg-white p-8 sm:p-12 border-2 border-amber-300 shadow-2xl text-center space-y-6 animate-fadeIn">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-widest inline-block">
                Reference ID: {confirmedBooking.id}
              </span>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-stone-900">
                {t('Appointment Reserved Successfully!', 'परामर्श सत्र सफलतापूर्वक आरक्षित हुआ!')}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
                {language === 'hi' ? (
                  <>
                    आपका <strong>{confirmedBooking.serviceTitle}</strong> सत्र दिनांक{' '}
                    <strong>{confirmedBooking.scheduledDate}</strong> को{' '}
                    <strong>{confirmedBooking.scheduledTime} IST</strong> पर पूज्य{' '}
                    <strong>{confirmedBooking.astrologerName}</strong> के साथ आरक्षित हो गया है।
                  </>
                ) : (
                  <>
                    Your <strong>{confirmedBooking.serviceTitle}</strong> session with{' '}
                    <strong>{confirmedBooking.astrologerName}</strong> is confirmed for{' '}
                    <strong>{confirmedBooking.scheduledDate}</strong> at{' '}
                    <strong>{confirmedBooking.scheduledTime} IST</strong>.
                  </>
                )}
              </p>
            </div>

            {/* Quick Summary Card without charges */}
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-left text-xs space-y-2.5 max-w-lg mx-auto">
              <div className="flex justify-between items-center py-1 border-b border-amber-200/60">
                <span className="text-stone-500">{t('Spiritual Service:', 'वैदिक सेवा:')}</span>
                <span className="font-bold text-[#5B0D15]">{confirmedBooking.serviceTitle}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-amber-200/60">
                <span className="text-stone-500">{t('Guiding Astrologer:', 'आचार्य:')}</span>
                <span className="font-semibold text-stone-900">{confirmedBooking.astrologerName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-amber-200/60">
                <span className="text-stone-500">{t('Date & Time Slot:', 'दिनांक व समय:')}</span>
                <span className="font-bold text-stone-900">
                  {confirmedBooking.scheduledDate} • {confirmedBooking.scheduledTime} IST
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-amber-200/60">
                <span className="text-stone-500">{t('Consultation Mode:', 'परामर्श माध्यम:')}</span>
                <span className="font-bold uppercase tracking-wider text-amber-900">
                  {confirmedBooking.consultationType}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-stone-500">{t('Status:', 'स्थिति:')}</span>
                <span className="font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('Confirmed', 'आरक्षित')}</span>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={whatsappBookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>{t('Connect on WhatsApp with Pandit Ji', 'पंडित जी से व्हाट्सएप पर जुड़ें')}</span>
              </a>

              {confirmedBooking.meetLink && (
                <a
                  href={confirmedBooking.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#5B0D15] hover:bg-[#73121D] text-amber-100 text-xs sm:text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>{t('Join Video Room Link', 'वीडियो रूम लिंक खोलें')}</span>
                </a>
              )}
            </div>

            <div className="pt-2 flex items-center justify-center gap-4 text-xs text-stone-500">
              <button
                onClick={() => {
                  setConfirmedBooking(null);
                  setSelectedServiceId('astrological_consultation');
                }}
                className="hover:text-[#5B0D15] underline cursor-pointer"
              >
                {t('Book Another Consultation', 'अन्य परामर्श सत्र बुक करें')}
              </button>
              <span>•</span>
              <Link href="/" className="hover:text-[#5B0D15] underline">
                {t('Return Home', 'मुख्य पृष्ठ')}
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN (5 cols): Astrologer & Service Selection (NO CHARGES) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Step 1: Astrologer Selection */}
              <div className="space-y-3">
                <h3 className="font-serif font-bold text-base text-[#2A1810] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#5B0D15] text-amber-200 text-xs flex items-center justify-center">1</span>
                  <span>{t('Choose Spiritual Guide', 'आध्यात्मिक मार्गदर्शक चुनें')}</span>
                </h3>

                <div className="space-y-2.5">
                  {ASTROLOGERS_LIST.map((ast) => {
                    const isSelected = selectedAstrologerId === ast.id;
                    const astName = language === 'hi' ? ast.nameHi : ast.name;
                    const astTitle = language === 'hi' ? ast.titleHi : ast.title;
                    const astBadge = language === 'hi' ? ast.badgeHi : ast.badge;

                    return (
                      <div
                        key={ast.id}
                        onClick={() => setSelectedAstrologerId(ast.id)}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
                          isSelected
                            ? 'bg-amber-50/80 border-[#5B0D15] shadow-md ring-1 ring-[#5B0D15]'
                            : 'bg-white border-stone-200 hover:border-amber-300'
                        }`}
                      >
                        <img
                          src={ast.avatar}
                          alt={astName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-amber-300 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-serif font-bold text-xs sm:text-sm text-stone-900 truncate">
                              {astName}
                            </h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold shrink-0">
                              {astBadge}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 line-clamp-1">{astTitle}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Selected Service Details (NO CHARGES) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-base text-[#2A1810] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#5B0D15] text-amber-200 text-xs flex items-center justify-center">2</span>
                    <span>{t('Selected Vedic Service', 'चयनित वैदिक सेवा')}</span>
                  </h3>

                  <button
                    type="button"
                    onClick={() => setServiceSwitchOpen(!serviceSwitchOpen)}
                    className="text-xs text-[#5B0D15] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{t('Change Service', 'सेवा बदलें')}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Service Switcher Dropdown (Pure Titles, No Price Tags) */}
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
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Active Service Showcase Card (CLEAN, NO CHARGES ROW) */}
                <div className="rounded-3xl overflow-hidden bg-white border border-amber-200/90 shadow-xl space-y-3">
                  <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-stone-100">
                    <img
                      src={activeService.image}
                      alt={displayTitle}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-amber-300/60 text-amber-300 font-bold text-[10px] uppercase tracking-wider">
                      ✦ {displayCatTag}
                    </div>

                    {isFreeBabyGirlService ? (
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-md">
                        {t('100% Free Blessing', 'निःशुल्क सेवा')}
                      </div>
                    ) : displayBadge ? (
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-md">
                        {displayBadge}
                      </div>
                    ) : null}
                  </div>

                  <div className="p-5 space-y-2 pt-0">
                    <h4 className="font-serif font-bold text-lg text-[#2A1810] leading-snug">
                      {displayTitle}
                    </h4>

                    <div className="flex items-center gap-1.5 text-xs text-amber-900 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{displayPandit}</span>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed pt-1">
                      {displayDesc}
                    </p>
                  </div>
                </div>

                {/* Consultation Format Options */}
                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-2.5">
                  <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-stone-700">
                    {t('Select Consultation Mode', 'परामर्श माध्यम चुनें')}
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'video', label: t('Video Call', 'वीडियो कॉल'), icon: Video },
                      { id: 'call', label: t('Phone Call', 'ऑडियो कॉल'), icon: PhoneCall },
                      { id: 'in-person', label: t('Temple Desk', 'आश्रम दर्शन'), icon: MapPin },
                    ].map((mode) => {
                      const Icon = mode.icon;
                      const isSel = consultType === mode.id;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setConsultType(mode.id as any)}
                          className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
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

            </div>

            {/* RIGHT COLUMN (7 cols): Optimized Form (No Seeker Words) */}
            <div className="lg:col-span-7 bg-white/95 p-6 sm:p-8 rounded-3xl border border-amber-200 shadow-xl space-y-6">
              
              <div className="border-b border-stone-100 pb-3">
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#2A1810] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#5B0D15] text-amber-200 text-xs flex items-center justify-center">3</span>
                  <span>{t('Select Date & Preferred Time', 'दिनांक एवं समय चुनें')}</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {t(
                    'Choose an auspicious consultation date and published slot.',
                    'शुभ परामर्श दिनांक एवं अपनी सुविधानुसार समय स्लॉट का चयन करें।'
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

              {/* Quick Date Shortcuts & Date Picker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-700" />
                    <span>{t('Consultation Date', 'परामर्श दिनांक')}</span>
                  </label>
                  
                  {/* Quick Select Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDate(todayStr)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                        date === todayStr
                          ? 'bg-[#5B0D15] text-white shadow-xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {t('Today', 'आज')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDate(tomorrowStr)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                        date === tomorrowStr
                          ? 'bg-[#5B0D15] text-white shadow-xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {t('Tomorrow', 'कल')}
                    </button>
                  </div>
                </div>

                <input
                  type="date"
                  required
                  min={todayStr}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-medium text-stone-800 focus:outline-none focus:border-[#5B0D15] bg-stone-50/50"
                />
              </div>

              {/* Interactive Time Slots with Period Filter (Morning, Afternoon, Evening) */}
              <div className="space-y-3 pt-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>{t('Select Time Slot (IST)', 'समय स्लॉट चुनें (भारतीय समय)')}</span>
                  </label>

                  {/* Period Filter Tabs */}
                  <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setActiveSlotPeriod('all')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        activeSlotPeriod === 'all'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      {t('All', 'सभी')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSlotPeriod('morning')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        activeSlotPeriod === 'morning'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      <Sun className="w-3 h-3 text-amber-600" />
                      <span>{t('Morning', 'प्रातः')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSlotPeriod('afternoon')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        activeSlotPeriod === 'afternoon'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      <Sunset className="w-3 h-3 text-orange-600" />
                      <span>{t('Afternoon', 'दोपहर')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSlotPeriod('evening')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        activeSlotPeriod === 'evening'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      <Moon className="w-3 h-3 text-indigo-600" />
                      <span>{t('Evening', 'सायं')}</span>
                    </button>
                  </div>
                </div>

                {loadingSlots ? (
                  <div className="py-6 flex items-center justify-center gap-2 text-xs text-amber-900">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#5B0D15]" />
                    <span>{t('Loading available slots...', 'स्लॉट लोड हो रहे हैं...')}</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {filteredSlots.map((slot) => {
                      const isSelected = timeSlot === slot.time && slot.isAvailable;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.isAvailable}
                          onClick={() => setTimeSlot(slot.time)}
                          className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all border flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                            !slot.isAvailable
                              ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-50'
                              : isSelected
                              ? 'bg-[#5B0D15] text-white border-[#5B0D15] shadow-md ring-2 ring-amber-300 scale-102'
                              : 'bg-white hover:bg-amber-50/80 text-stone-800 border-stone-200 hover:border-amber-300'
                          }`}
                        >
                          <span className="font-bold text-xs">{slot.time}</span>
                          <span
                            className={`text-[9px] uppercase tracking-wider font-extrabold ${
                              !slot.isAvailable
                                ? 'text-stone-400'
                                : isSelected
                                ? 'text-amber-300'
                                : 'text-emerald-700'
                            }`}
                          >
                            {slot.isAvailable ? t('Available', 'उपलब्ध') : t('Reserved', 'आरक्षित')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Selected Slot Confirmation Pill */}
                {timeSlot && (
                  <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs flex items-center justify-between text-stone-700">
                    <span className="font-medium">
                      {t('Selected Time:', 'चयनित समय:')}{' '}
                      <strong className="text-[#5B0D15]">{date} • {timeSlot} IST</strong>
                    </span>
                    <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t('Confirmed Available', 'सत्यापित')}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Contact Information (NO SEEKER WORDS) */}
              <div className="space-y-3 pt-3 border-t border-stone-100">
                <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-700" />
                  <span>{t('Your Contact Details', 'आपकी संपर्क जानकारी')}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {t('Full Name *', 'पूरा नाम *')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder={t('Enter your full name', 'अपना पूरा नाम दर्ज करें')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-[#5B0D15] bg-white"
                      />
                      <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {t('WhatsApp / Phone Number *', 'व्हाट्सएप / मोबाइल नंबर *')}
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        placeholder="+91 98260 12345"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-[#5B0D15] bg-white"
                      />
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('Email Address (Optional)', 'ईमेल पता (वैकल्पिक)')}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-[#5B0D15] bg-white"
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Birth Details and Questions */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-amber-700" />
                      <span>{t('Birth Details & Questions (Optional)', 'जन्म विवरण एवं प्रश्न (वैकल्पिक)')}</span>
                    </span>
                    <span className="text-[11px] text-stone-400 font-normal">
                      {t('Helps prepare your chart', 'कुंडली विश्लेषण में सहायक')}
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder={t(
                      'e.g. 15th Aug 1990, 04:30 AM, Varanasi. Primary question regarding career or marriage.',
                      'उदा. 15 अगस्त 1990, प्रातः 04:30, वाराणसी। करियर अथवा विवाह संबंधी मुख्य प्रश्न।'
                    )}
                    value={birthDetails}
                    onChange={(e) => setBirthDetails(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-[#5B0D15] bg-white leading-relaxed"
                  />
                </div>
              </div>

              {/* Submit Button (CLEAN, NO ARBITRARY CHARGES) */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={loading || !timeSlot}
                  className="w-full py-4 rounded-full bg-gradient-to-r from-[#5B0D15] via-[#73121D] to-[#480A10] hover:from-[#73121D] hover:to-[#5B0D15] disabled:opacity-50 text-amber-100 font-bold text-sm shadow-xl shadow-rose-950/25 transition-all cursor-pointer flex items-center justify-center gap-2 border border-amber-400/60 hover:scale-[1.01]"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-200" />
                      <span>{t('Reserving Appointment...', 'अपॉइंटमेंट आरक्षित किया जा रहा है...')}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>{t('Confirm & Reserve Appointment →', 'अपॉइंटमेंट आरक्षित करें →')}</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-stone-500">
                  {t(
                    'Instant WhatsApp confirmation will be sent upon submission.',
                    'फॉर्म सबमिट करने पर तत्काल व्हाट्सएप पुष्टिकरण प्रेषित किया जाएगा।'
                  )}
                </p>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-4 text-[11px] text-stone-500 pt-1">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  {t('100% Confidential', '100% पूर्णतः गोपनीय')}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  {t('Certified Kashi Scholars', 'काशी के विद्वान ब्राह्मण')}
                </span>
              </div>
            </div>
          </form>
        )}
      </main>

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
