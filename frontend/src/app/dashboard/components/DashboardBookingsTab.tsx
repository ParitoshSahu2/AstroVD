'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Video,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Search,
  MessageCircle,
  Quote,
  Compass,
  ArrowRight,
  X,
  CreditCard,
  AlertCircle,
  RefreshCw,
  Lock,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { formatGoogleMeetLink } from '../utils';
import { getMeetingTimeStatus } from '../../../data/servicesData';

interface DashboardBookingsTabProps {
  bookings: any[];
  bookingsLoading: boolean;
  profile?: any;
  onOpenEditProfile?: () => void;
  t: (en: string, hi: string) => string;
}

export const DashboardBookingsTab: React.FC<DashboardBookingsTabProps> = ({
  bookings,
  bookingsLoading,
  profile,
  onOpenEditProfile,
  t,
}) => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedReviewBooking, setSelectedReviewBooking] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [consultationReviews, setConsultationReviews] = useState<Record<string, { rating: number; comment: string; date?: string }>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('astro_consultation_reviews');
        return raw ? JSON.parse(raw) : {};
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewBooking) return;
    const bId = String(selectedReviewBooking.id || selectedReviewBooking._id || '');
    const newReviews = {
      ...consultationReviews,
      [bId]: {
        rating: reviewRating,
        comment: reviewComment,
        date: new Date().toISOString(),
      },
    };
    setConsultationReviews(newReviews);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('astro_consultation_reviews', JSON.stringify(newReviews));
      } catch (e) {}
    }
    setReviewSubmitted(true);
    setTimeout(() => {
      setSelectedReviewBooking(null);
      setReviewSubmitted(false);
      setReviewComment('');
    }, 1500);
  };

  const [payingBooking, setPayingBooking] = useState<any | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [paySuccessMsg, setPaySuccessMsg] = useState<string | null>(null);

  const handleExecutePayment = async (bookingId: string) => {
    setPayLoading(true);
    setPaySuccessMsg(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('astro_token') : null;
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');
      const res = await fetch(`${backendUrl}/api/appointments/${bookingId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ paymentMethod: 'WALLET' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Payment failed.');
      }

      setPaySuccessMsg(t('Payment successful! Your consultation is now confirmed.', 'दक्षिणा भुगतान संपन्न! आपका परामर्श अब पुष्ट हो गया है।'));
      
      // Update local storage and dispatch event to refresh dashboard & navbar
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('astro_consultations');
          if (raw) {
            const list = JSON.parse(raw);
            const updatedList = list.map((b: any) => (b.id === bookingId ? { ...b, status: 'CONFIRMED' } : b));
            localStorage.setItem('astro_consultations', JSON.stringify(updatedList));
          }
          window.dispatchEvent(new CustomEvent('astro-auth-change'));
        } catch (e) {}
      }

      setTimeout(() => {
        setPayingBooking(null);
        setPaySuccessMsg(null);
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to complete payment.');
    } finally {
      setPayLoading(false);
    }
  };

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredBookings = bookings.filter((b) => {
    const st = (b.status || 'CONFIRMED').toUpperCase();
    if (filter === 'upcoming' && (st === 'COMPLETED' || st === 'CANCELLED')) return false;
    if (filter === 'completed' && st !== 'COMPLETED') return false;
    if (filter === 'pending' && st !== 'PENDING' && st !== 'PENDING_PAYMENT') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const title = (b.serviceTitle || b.service?.title || '').toLowerCase();
      const id = String(b.id || b._id || '').toLowerCase();
      const pandit = (b.pandit || b.panditName || b.astrologerName || b.astrologer?.name || '').toLowerCase();
      const notes = (b.notes || '').toLowerCase();
      return title.includes(q) || id.includes(q) || pandit.includes(q) || notes.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
              ✨ {t('Vedic Consultations', 'वैदिक परामर्श')}
            </span>
            <span className="text-xs text-stone-400 font-mono">
              {bookings.length} {t('Total Records', 'कुल सत्र')}
            </span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#3B1E22] mt-1">
            {t('Consultation Bookings & Sessions', 'परामर्श सत्र एवं अनुसूची')}
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            {t(
              'Live video consultations, meeting room access, notes, and astrologer remedies.',
              'लाइव वीडियो परामर्श, गूगल मीट लिंक, शंका समाधान एवं ज्योतिषी परामर्श।'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Link
            href="/appointment"
            className="px-5 py-2.5 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 whitespace-nowrap active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{t('Book New Consultation', 'नया परामर्श बुक करें')}</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100/90 rounded-2xl border border-stone-200/70 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-[#5B0D15] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t('All Sessions', 'सभी सत्र')} ({bookings.length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filter === 'upcoming'
                ? 'bg-white text-[#5B0D15] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t('Upcoming', 'आगामी')} (
            {
              bookings.filter(
                (b) =>
                  (b.status || '').toUpperCase() !== 'COMPLETED' &&
                  (b.status || '').toUpperCase() !== 'CANCELLED'
              ).length
            }
            )
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filter === 'completed'
                ? 'bg-white text-[#5B0D15] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t('Completed Consultations', 'परामर्श संपन्न')} (
            {bookings.filter((b) => (b.status || '').toUpperCase() === 'COMPLETED').length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filter === 'pending'
                ? 'bg-white text-[#5B0D15] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t('Pending Approval & Payment', 'स्वीकृति व दक्षिणा प्रतीक्षारत')} (
            {
              bookings.filter(
                (b) =>
                  (b.status || '').toUpperCase() === 'PENDING' ||
                  (b.status || '').toUpperCase() === 'PENDING_PAYMENT'
              ).length
            }
            )
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={t('Search topic, ID, astrologer...', 'विषय, आईडी, ज्योतिषी खोजें...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-stone-200 focus:border-amber-400 outline-none transition-all placeholder:text-stone-400"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {bookingsLoading ? (
        <div className="p-16 text-center rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-3">
          <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-stone-600 font-medium">
            {t('Loading your sacred consultations...', 'परामर्श सत्र लोड हो रहे हैं...')}
          </p>
        </div>
      ) : bookings.length === 0 ? (
        /* Inspiring Empty State */
        <div className="p-8 sm:p-12 text-center rounded-3xl bg-white/95 border-2 border-amber-200/80 shadow-md space-y-6 max-w-3xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-rose-100 border-2 border-amber-300 text-[#5B0D15] flex items-center justify-center mx-auto shadow-inner">
            <Compass className="w-8 h-8 text-[#5B0D15]" />
          </div>

          <div className="space-y-2">
            <h4 className="font-serif text-xl sm:text-2xl font-bold text-[#3B1E22]">
              {t('No Vedic Consultations Scheduled Yet', 'कोई वैदिक परामर्श अभी निर्धारित नहीं है')}
            </h4>
            <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
              {t(
                'Connect 1-on-1 with Dr. Pandit Vishal Dubey (Jyotishacharya, Varanasi) to unlock profound insights regarding your career trajectory, marital harmony, Shani Sade Sati, and planetary remedies.',
                'डॉ. पंडित विशाल दुबे (ज्योतिषाचार्य, वाराणसी) के साथ 1-on-1 परामर्श लें और करियर, वैवाहिक जीवन एवं ग्रह शांति के उपाय प्राप्त करें।'
              )}
            </p>
          </div>

          {/* 3 Core Benefits Showcase */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
              <div className="w-7 h-7 rounded-lg bg-amber-200/60 text-amber-900 flex items-center justify-center mb-2 font-bold text-xs">
                1
              </div>
              <h5 className="font-serif font-bold text-xs text-[#3B1E22]">
                {t('100% Confidential', '100% गोपनीय')}
              </h5>
              <p className="text-[11px] text-stone-600 mt-1 leading-snug">
                {t(
                  'Private, encrypted video session with dedicated birth chart audit.',
                  'पूर्ण सुरक्षित वीडियो सत्र एवं व्यक्तिगत जन्म कुंडली विश्लेषण।'
                )}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
              <div className="w-7 h-7 rounded-lg bg-amber-200/60 text-amber-900 flex items-center justify-center mb-2 font-bold text-xs">
                2
              </div>
              <h5 className="font-serif font-bold text-xs text-[#3B1E22]">
                {t('Tailored Remedies', 'सटीक वैदिक उपाय')}
              </h5>
              <p className="text-[11px] text-stone-600 mt-1 leading-snug">
                {t(
                  'Specific Beej Mantras, fasting dates, and energized gemstone guidance.',
                  'विशिष्ट बीज मंत्र, व्रत विधान एवं सिद्ध रुद्राक्ष/रत्न परामर्श।'
                )}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
              <div className="w-7 h-7 rounded-lg bg-amber-200/60 text-amber-900 flex items-center justify-center mb-2 font-bold text-xs">
                3
              </div>
              <h5 className="font-serif font-bold text-xs text-[#3B1E22]">
                {t('Lifetime PDF & Video', 'आजीवन नुस्खा व रिकॉर्ड')}
              </h5>
              <p className="text-[11px] text-stone-600 mt-1 leading-snug">
                {t(
                  'Receive recorded session download and certified remedial prescription.',
                  'सत्र का डिजिटल रिकॉर्ड एवं प्रमाणित वैदिक उपचार पत्र।'
                )}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/appointment"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{t('Book Your First Consultation', 'अपना पहला परामर्श बुक करें')}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-stone-200 space-y-4">
          <Calendar className="w-12 h-12 text-stone-400 mx-auto" />
          <h3 className="font-serif font-bold text-base text-[#3B1E22]">
            {t('No Consultations In This Category', 'इस श्रेणी में कोई परामर्श नहीं मिला')}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {searchQuery
              ? t('No bookings match your search query.', 'आपकी खोज के अनुसार कोई रिकॉर्ड नहीं मिला।')
              : t('Try selecting a different filter above.', 'कृपया ऊपर से अन्य फ़िल्टर चुनें।')}
          </p>
        </div>
      ) : (
        /* ================= COMPACT CARDS VIEW (MAIN BOOKING DATA, PRICE & GOOGLE MEET) ================= */
        <div className="space-y-3.5">
          {filteredBookings.map((booking) => {
            const bId = String(booking.id || booking._id || '');
            const shortId = bId.length > 16 ? `${bId.slice(0, 16)}…` : bId;
            const isCopied = copiedId === bId;

            const st = (booking.status || 'PENDING').toUpperCase();
            const isConfirmed = st === 'CONFIRMED' || st === 'SCHEDULED' || st === 'BOOKED';
            const isCompleted = st === 'COMPLETED';
            const isApproved = st === 'APPROVED' || st === 'PENDING_PAYMENT';
            const isCancelled = st === 'CANCELLED' || st === 'REJECTED';
            const isPending = st === 'PENDING' || st === 'REVIEWING';

            const rawDate = booking.scheduledDate || booking.date || booking.bookingDate || booking.createdAt;
            let formattedDate = 'Scheduled Soon';
            if (rawDate) {
              try {
                formattedDate = new Date(rawDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
              } catch (e) {
                formattedDate = String(rawDate);
              }
            }

            const slotTime =
              booking.scheduledTime || booking.slot || booking.time || '10:00 AM - 10:30 AM';

            const panditName =
              booking.pandit ||
              booking.panditName ||
              booking.astrologerName ||
              booking.astrologer?.name ||
              'Dr. Pandit Vishal Dubey';

            const serviceTitle =
              booking.serviceTitle ||
              booking.service?.title ||
              booking.serviceId ||
              'Comprehensive Vedic Kundli Consultation';

            const meetLink =
              booking.meetLink && booking.meetLink.startsWith('http')
                ? booking.meetLink
                : formatGoogleMeetLink(bId);

            const fee = booking.totalCost || booking.fee || booking.servicePrice || 2100;

            return (
              <div
                key={bId}
                className="bg-white rounded-2xl border border-stone-200/90 hover:border-amber-400 hover:shadow-md transition-all overflow-hidden group font-['Assistant',system-ui,-apple-system,sans-serif]"
              >
                {/* 1. Header: Booking ID, Category, Status, Price */}
                <div className="bg-stone-50/70 border-b border-stone-100 px-4 py-2.5 sm:px-5 sm:py-3 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-900 bg-amber-100/60 px-2 py-0.5 rounded border border-amber-200/60 inline-flex items-center gap-1">
                      ✨ {booking.category || 'Vedic Consultation'}
                    </span>

                    {/* Booking ID badge */}
                    <div className="flex items-center gap-1 font-mono text-[11px] font-semibold text-stone-700 bg-white px-2.5 py-0.5 rounded-md border border-stone-200 shadow-2xs">
                      <span>#{shortId}</span>
                      <button
                        type="button"
                        onClick={(e) => handleCopyId(bId, e)}
                        className="text-stone-400 hover:text-stone-700 ml-0.5 cursor-pointer"
                        title="Copy Booking ID"
                      >
                        {isCopied ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Pill with Dot (Full Lifecycle) */}
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                        <Check className="w-3 h-3 text-blue-600" />
                        <span>{t('Completed', 'संपन्न')}</span>
                      </span>
                    ) : isConfirmed ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        <span>{t('Confirmed / Paid', 'पुष्टीकृत / प्रदत्त')}</span>
                      </span>
                    ) : booking.status === 'APPROVED' || booking.status === 'PENDING_PAYMENT' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-900 border border-emerald-300">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>{t('Approved - Pay Dakshina', 'स्वीकृत - दक्षिणा शेष')}</span>
                      </span>
                    ) : booking.status === 'CANCELLED' || booking.status === 'REJECTED' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                        <X className="w-3 h-3 text-rose-600" />
                        <span>{t('Unavailable / Cancelled', 'रद्द / अनुपलब्ध')}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-300">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>{t('Awaiting Admin Approval', 'स्वीकृति प्रतीक्षारत')}</span>
                      </span>
                    )}

                    {/* Dakshina Price */}
                    <div className="text-right pl-3 border-l border-stone-200">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block leading-tight tracking-wider">
                        Dakshina
                      </span>
                      <span className="text-sm font-bold text-[#5B0D15]">
                        ₹{Number(fee).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Main Content & Google Meet Action Button */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="min-w-0 space-y-1 flex-1">
                    <h4 className="font-bold text-[15px] sm:text-base text-stone-900 group-hover:text-[#5B0D15] transition-colors line-clamp-1 leading-snug">
                      {serviceTitle}
                    </h4>

                    <div className="flex items-center gap-2.5 text-xs text-stone-500 flex-wrap pt-0.5">
                      <span className="font-medium text-stone-800">
                        {panditName}
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="inline-flex items-center gap-1 text-stone-600">
                        <Calendar className="w-3.5 h-3.5 text-amber-700/80 shrink-0" />
                        <span>{formattedDate}</span>
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="inline-flex items-center gap-1 text-stone-600">
                        <Clock className="w-3.5 h-3.5 text-amber-700/80 shrink-0" />
                        <span>{slotTime} IST</span>
                      </span>
                    </div>

                    {(booking.status === 'CANCELLED' || booking.status === 'REJECTED') && (
                      <div className="p-2.5 rounded-xl bg-rose-50/90 border border-rose-200 text-xs text-rose-900 space-y-1 my-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-rose-800">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>{t('Panditji / Guruji Unavailable for this Slot', 'पूज्य गुरुजी / पंडित जी इस समय अनुपलब्ध हैं')}</span>
                        </div>
                        <p className="text-[11px] text-rose-700 leading-snug">
                          {t(
                            'Dr. Pandit Vishal Dubey is unavailable for this meeting slot due to emergency temple rituals or prior sacred commitments. Please reschedule your consultation for another suitable slot.',
                            'पूज्य गुरुजी / पंडित जी अपरिहार्य धार्मिक अनुष्ठान के कारण इस समय उपलब्ध नहीं हैं। कृपया अन्य समय हेतु परामर्श पुनर्निर्धारित (Reschedule) करें।'
                          )}
                        </p>
                      </div>
                    )}

                    {(booking.status === 'APPROVED' || booking.status === 'PENDING_PAYMENT') && (
                      <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 my-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          {t(
                            'Dr. Pandit Vishal Dubey has approved your consultation! Please complete the Dakshina payment to confirm your booking and unlock your video consultation.',
                            'पूज्य गुरुजी द्वारा परामर्श अनुरोध स्वीकृत हो गया है! कृपया दक्षिणा का भुगतान कर परामर्श पुष्ट करें।'
                          )}
                        </span>
                      </div>
                    )}

                    {(booking.status === 'PENDING' || (!isConfirmed && !isCompleted && booking.status !== 'CANCELLED' && booking.status !== 'REJECTED' && booking.status !== 'APPROVED' && booking.status !== 'PENDING_PAYMENT')) && (
                      <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2 my-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>
                          {t(
                            'Your consultation request is pending review by Dr. Pandit Vishal Dubey. You will be notified once approved to proceed with payment.',
                            'आपका परामर्श अनुरोध पूज्य गुरुजी के अवलोकन हेतु प्रतीक्षारत है। व्यवस्थापक द्वारा स्वीकृति के उपरांत भुगतान सक्रिय होगा।'
                          )}
                        </span>
                      </div>
                    )}

                    {(booking.customerName || booking.customerPhone) && (
                      <div className="flex items-center gap-2 text-xs text-stone-600 pt-1 flex-wrap">
                        <span className="font-semibold text-stone-700">
                          {t('Attendee', 'परामर्शार्थी')}:
                        </span>
                        <span className="font-bold text-[#5B0D15]">
                          {booking.customerName || profile?.name || 'Devotee'}
                        </span>
                        {booking.customerPhone && (
                          <span className="text-stone-500 font-mono text-[11px]">
                            ({booking.customerPhone})
                          </span>
                        )}
                        {booking.isBookingForSomeoneElse && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                            {t('Booked for family / friend', 'अन्य व्यक्ति हेतु बुक किया')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 3. Action Buttons - Join Meeting, Dakshina Payment, Review */}
                  <div className="shrink-0 flex items-center gap-2.5">
                    {isCompleted ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReviewBooking(booking);
                          const existing = consultationReviews[bId];
                          if (existing) {
                            setReviewRating(existing.rating || 5);
                            setReviewComment(existing.comment || '');
                          } else {
                            setReviewRating(5);
                            setReviewComment('');
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                      >
                        <Star className="w-3.5 h-3.5 fill-white text-white" />
                        <span>
                          {consultationReviews[bId]
                            ? t(`Reviewed (⭐ ${consultationReviews[bId].rating}/5)`, `समीक्षा (⭐ ${consultationReviews[bId].rating}/5)`)
                            : t('Rate & Review', 'रेटिंग व समीक्षा')}
                        </span>
                      </button>
                    ) : isConfirmed ? (() => {
                      const meetStatus = getMeetingTimeStatus(
                        booking.scheduledDate || booking.date,
                        slotTime,
                        booking.durationMinutes || 30
                      );

                      if (meetStatus.isJoinable) {
                        return (
                          <a
                            href={meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                          >
                            <Video className="w-4 h-4 text-white" />
                            <span>{t('Join Meeting', 'मीटिंग में जुड़ें')}</span>
                          </a>
                        );
                      }

                      if (meetStatus.hasEnded) {
                        return (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 text-stone-500 font-medium text-xs border border-stone-200">
                            {t('Session Concluded', 'सत्र समाप्त')}
                          </span>
                        );
                      }

                      return (
                        <button
                          type="button"
                          disabled
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-100 text-stone-400 font-semibold text-xs border border-stone-200 cursor-not-allowed whitespace-nowrap"
                          title={t('Unlocks 5 minutes prior to appointment', 'परामर्श समय से 5 मिनट पहले सक्रिय होगा')}
                        >
                          <Lock className="w-3.5 h-3.5 text-stone-400" />
                          <span>{t('Join Meeting (Opens 5 Min Before)', 'मीटिंग से जुड़ें (5 मिनट पूर्व खुलेगा)')}</span>
                        </button>
                      );
                    })() : isApproved ? (
                      <button
                        type="button"
                        onClick={() => setPayingBooking(booking)}
                        className="inline-flex items-center gap-2 px-4.5 py-2 rounded-full bg-gradient-to-r from-[#5B0D15] via-[#851622] to-[#5B0D15] hover:opacity-95 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95 whitespace-nowrap animate-pulse"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-amber-300" />
                        <span>{t('Pay Dakshina & Confirm', 'दक्षिणा भुगतान कर पुष्ट करें')}</span>
                      </button>
                    ) : isCancelled ? (
                      <Link
                        href="/appointment"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{t('Reschedule Consultation', 'परामर्श पुनर्निर्धारित करें')}</span>
                      </Link>
                    ) : isPending ? (
                      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-300">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{t('Waiting for Admin Approval', 'व्यवस्थापक स्वीकृति की प्रतीक्षा')}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= CONSULTATION RATING & REVIEW MODAL ================= */}
      {selectedReviewBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fadeIn"
          onClick={() => setSelectedReviewBooking(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-amber-300/80 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h3 className="font-serif font-bold text-base text-[#3B1E22]">
                  {t('Rate & Review Consultation', 'परामर्श समीक्षा एवं रेटिंग')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReviewBooking(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reviewSubmitted ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-serif font-bold text-base text-[#3B1E22]">
                  {t('Thank you for your blessed review!', 'आपकी पावन समीक्षा के लिए धन्यवाद!')}
                </h4>
                <p className="text-xs text-stone-600 max-w-xs mx-auto">
                  {t(
                    'Your sacred feedback helps other seekers connect with authentic astrological wisdom.',
                    'आपका अनुभव अन्य साधकों का मार्गदर्शन करेगा।'
                  )}
                </p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {/* Consultation Details Snippet */}
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-1">
                  <div className="font-bold text-[#3B1E22] text-sm">
                    {selectedReviewBooking.serviceTitle ||
                      selectedReviewBooking.service?.title ||
                      'Vedic Consultation'}
                  </div>
                  <div className="text-stone-600 flex items-center justify-between">
                    <span>
                      {selectedReviewBooking.pandit ||
                        selectedReviewBooking.panditName ||
                        selectedReviewBooking.astrologerName ||
                        selectedReviewBooking.astrologer?.name ||
                        'Dr. Pandit Vishal Dubey'}
                    </span>
                    <span className="font-mono text-[11px] text-stone-400">
                      #{selectedReviewBooking.id || selectedReviewBooking._id}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    {t('Select Sacred Rating', 'रेटिंग चुनें')}
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 focus:outline-none cursor-pointer transform hover:scale-115 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            star <= reviewRating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-800 ml-2">
                      {reviewRating === 5
                        ? t('Divinely Blessed (5/5)', 'अत्यंत शुभ (5/5)')
                        : `${reviewRating} / 5 Stars`}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    {t('Your Consultation Experience', 'आपका परामर्श अनुभव')}
                  </label>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder={t(
                      'Share your experience with the panditji and astrological guidance received...',
                      'पंडित जी से परामर्श व मार्गदर्शन का अपना अनुभव साझा करें...'
                    )}
                    required
                    className="w-full p-3 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:border-amber-400 focus:bg-white outline-none resize-none transition-all placeholder:text-stone-400 leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedReviewBooking(null)}
                    className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-semibold cursor-pointer"
                  >
                    {t('Cancel', 'रद्द करें')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-xs active:scale-95 cursor-pointer"
                  >
                    {t('Submit Review', 'समीक्षा भेजें')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Payment Modal for Approved Consultations */}
      {payingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-[#FCFBF8] border border-amber-300 shadow-2xl p-5 text-[#3B1E22]">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#5B0D15]" />
                <h3 className="font-serif font-bold text-base text-[#5B0D15]">
                  {t('Complete Consultation Dakshina', 'परामर्श दक्षिणा भुगतान')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPayingBooking(null)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {paySuccessMsg ? (
              <div className="py-6 text-center space-y-2">
                <Check className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold text-emerald-800">{paySuccessMsg}</p>
                <p className="text-xs text-stone-500">{t('Reloading consultation details...', 'विवरण अपडेट हो रहा है...')}</p>
              </div>
            ) : (
              <div className="py-3 space-y-3.5">
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-stone-600">{t('Service:', 'सेवा:')}</span>
                    <span className="font-bold text-[#5B0D15]">{payingBooking.serviceTitle || 'Vedic Consultation'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">{t('Scheduled Time:', 'समय:')}</span>
                    <span className="font-semibold text-stone-800">{payingBooking.scheduledDate} • {payingBooking.scheduledTime || payingBooking.slot}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-amber-200/60 font-bold">
                    <span className="text-stone-800">{t('Dakshina Amount:', 'दक्षिणा राशि:')}</span>
                    <span className="text-sm text-[#5B0D15]">₹{payingBooking.totalCost || payingBooking.fee || 2100}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-stone-200 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-stone-800">
                    <span>🪙 {t('Astro Wallet Balance', 'एस्ट्रो वॉलेट बैलेंस')}</span>
                    <span className="text-[#5B0D15]">₹{profile?.walletBalance || 0}</span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    {Number(profile?.walletBalance || 0) >= Number(payingBooking.totalCost || 2100)
                      ? t('Available balance will be used for instant payment.', 'उपलब्ध बैलेंस से तत्काल भुगतान होगा।')
                      : t('Instant secure payment with Astro Wallet or UPI/Cards.', 'वॉलेट या यूपीआई से सुरक्षित भुगतान।')}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setPayingBooking(null)}
                    className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                  >
                    {t('Cancel', 'रद्द करें')}
                  </button>
                  <button
                    type="button"
                    disabled={payLoading}
                    onClick={() => handleExecutePayment(payingBooking.id)}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#5B0D15] via-[#851622] to-[#5B0D15] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {payLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5 text-amber-300" />}
                    <span>{t('Pay ₹' + (payingBooking.totalCost || payingBooking.fee || 2100) + ' & Confirm', '₹' + (payingBooking.totalCost || payingBooking.fee || 2100) + ' भुगतान करें व पुष्ट करें')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardBookingsTab;
