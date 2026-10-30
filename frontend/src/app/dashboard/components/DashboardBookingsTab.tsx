'use client';

import React, { useState } from 'react';
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
  FileText,
  MessageCircle,
  Quote,
  Compass,
  ArrowRight,
  X,
  Printer,
} from 'lucide-react';
import { formatGoogleMeetLink } from '../utils';

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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedRemedyBooking, setSelectedRemedyBooking] = useState<any | null>(null);

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
            {t('Completed & Prescribed', 'संपन्न एवं उपाय')} (
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
            {t('Reviewing Kundli', 'समीक्षाधीन')} (
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

            const st = (booking.status || 'CONFIRMED').toUpperCase();
            const isConfirmed = st === 'CONFIRMED' || st === 'SCHEDULED' || st === 'BOOKED';
            const isCompleted = st === 'COMPLETED';
            const isPending = st === 'PENDING' || st === 'PENDING_PAYMENT' || st === 'REVIEWING';

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
              booking.meetLink && booking.meetLink.includes('meet.google.com')
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
                    {/* Status Pill with Dot */}
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                        <Check className="w-3 h-3 text-blue-600" />
                        <span>{t('Completed', 'संपन्न')}</span>
                      </span>
                    ) : isConfirmed ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        <span>{t('Confirmed', 'पुष्टीकृत')}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>{t('Active Session', 'सक्रिय सत्र')}</span>
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
                  </div>

                  {/* 3. Join Google Meet Button */}
                  <div className="shrink-0 flex items-center gap-2.5">
                    {/* Always visible Join Google Meet button for instant access to session */}
                    <a
                      href={meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                    >
                      <Video className="w-4 h-4 text-white" />
                      <span>{t('Join Google Meet', 'गूगल मीट में जुड़ें')}</span>
                      <ExternalLink className="w-3 h-3 text-emerald-200" />
                    </a>

                    {isCompleted && (
                      <button
                        type="button"
                        onClick={() => setSelectedRemedyBooking(booking)}
                        className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-white font-semibold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-300" />
                        <span>{t('View Prescription', 'उपचार पत्र देखें')}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= KASHI JYOTISH PRESCRIPTION & REMEDIES MODAL ================= */}
      {selectedRemedyBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fadeIn"
          onClick={() => setSelectedRemedyBooking(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border-2 border-amber-300/80 space-y-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Varanasi Seal */}
            <div className="flex items-start justify-between border-b border-amber-200/80 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider border border-amber-300/60">
                    🔱 Kashi Jyotish Prescription
                  </span>
                  <span className="text-xs font-mono text-stone-400">
                    #{selectedRemedyBooking.id || selectedRemedyBooking._id}
                  </span>
                </div>
                <h4 className="font-serif text-xl font-bold text-[#3B1E22]">
                  {selectedRemedyBooking.serviceTitle ||
                    selectedRemedyBooking.service?.title ||
                    'Comprehensive Horoscope Consultation'}
                </h4>
                <p className="text-xs text-stone-500">
                  Prescribed by{' '}
                  <strong className="text-stone-800">
                    {selectedRemedyBooking.pandit ||
                      selectedRemedyBooking.astrologerName ||
                      selectedRemedyBooking.astrologer?.name ||
                      'Dr. Pandit Vishal Dubey'}
                  </strong>{' '}
                  on {selectedRemedyBooking.scheduledDate || 'Certified Session'}
                </p>
              </div>
              <button
                onClick={() => setSelectedRemedyBooking(null)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Seeker Info Strip */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Seeker Name</span>
                <span className="font-semibold text-stone-800">
                  {selectedRemedyBooking.customerName || profile?.name || 'Valued Seeker'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Contact Phone</span>
                <span className="font-semibold text-stone-800">
                  {selectedRemedyBooking.contactPhone || profile?.phone || 'Verified on File'}
                </span>
              </div>
            </div>

            {/* Prescribed Remedies Content */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <h5 className="font-serif font-bold text-sm text-emerald-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>Vedic Astrological Recommendations</span>
                </h5>
                <p className="text-xs text-stone-700 whitespace-pre-line leading-relaxed">
                  {selectedRemedyBooking.remedyNotes ||
                    '1. Recite Om Namo Bhagavate Vasudevaya 108 times daily during sunrise.\n2. Wear 8mm Natural Yellow Sapphire (Pukhraj) or 7-Mukhi Rudraksha for Jupiter & Saturn alignment.\n3. Observe fasting on Shukla Paksha Ekadashi.\n4. Perform daily Surya Arghya with copper vessel and red chandan.'}
                </p>
              </div>

              {/* Direct Astro Store Gemstone CTA */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#5B0D15]">Energized Gemstones Available</span>
                  <p className="text-[11px] text-stone-600">
                    Order 100% natural, consecrated bracelets &amp; yantras directly from our Astro Store.
                  </p>
                </div>
                <Link
                  href="/products"
                  onClick={() => setSelectedRemedyBooking(null)}
                  className="px-4 py-2 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-white font-bold text-xs shrink-0 shadow-sm transition-all"
                >
                  Browse Store →
                </Link>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-stone-200 flex items-center justify-between flex-wrap gap-2">
              <span className="text-[11px] text-stone-400 italic">
                Blessed by Dr. Pandit Vishal Dubey, Varanasi
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-full border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <a
                  href={
                    selectedRemedyBooking.meetLink &&
                    selectedRemedyBooking.meetLink.includes('meet.google.com')
                      ? selectedRemedyBooking.meetLink
                      : formatGoogleMeetLink(String(selectedRemedyBooking.id || ''))
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Join Room</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardBookingsTab;
