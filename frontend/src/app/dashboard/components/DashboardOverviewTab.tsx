'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  Calendar,
  Compass,
  ShoppingCart,
  ArrowRight,
  Video,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Package,
  Star,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Truck,
} from 'lucide-react';
import { UserProfile, DashboardTab, formatZodiacName, getUserInitials } from '../types';
import { DEFAULT_SAMPLE_ORDERS, resolveProductImage } from '../utils';

interface DashboardOverviewTabProps {
  profile: UserProfile;
  bookings: any[];
  orders: any[];
  onTabChange: (tab: DashboardTab) => void;
  onEditKundli: () => void;
  formatGoogleMeetLink: (bookingId: string) => string;
  t: (en: string, hi: string) => string;
}

export const DashboardOverviewTab: React.FC<DashboardOverviewTabProps> = ({
  profile,
  bookings,
  orders,
  onTabChange,
  onEditKundli,
  formatGoogleMeetLink,
  t,
}) => {
  // Dynamic greeting based on current time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('Good Morning,', 'शुभ प्रभात,');
    if (hour < 17) return t('Good Afternoon,', 'शुभ दोपहर,');
    return t('Good Evening,', 'शुभ संध्या,');
  }, [t]);

  // Dynamic formatted date
  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  // Find next upcoming consultation
  const upcomingBookings = bookings.filter(
    (b) => b.status === 'CONFIRMED' || b.status === 'PENDING_PAYMENT' || b.status === 'PAID'
  );
  const nextBooking = upcomingBookings[0] || bookings[0] || null;

  // Flatten orders so each product has its own dedicated container
  const recentProductItems = useMemo(() => {
    return (orders && orders.length > 0 ? orders : DEFAULT_SAMPLE_ORDERS)
      .flatMap((ord: any, ordIdx: number) => {
        const rawId = String(ord.id || ord._id || ord.orderNumber || `AVD-ORD-${ordIdx + 1}`);
        const status = (ord.status || 'DELIVERED').toUpperCase();

        const dateStr =
          ord.deliveryDate ||
          (ord.createdAt
            ? new Date(ord.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric',
              })
            : 'Nov 24, 2025');

        const placedDate = ord.createdAt
          ? new Date(ord.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : 'Nov 20, 2025';

        const deliveryHeading =
          ord.deliveryStatusText ||
          (status === 'DELIVERED'
            ? `Delivered on ${dateStr}`
            : status === 'SHIPPED' || status === 'IN_TRANSIT'
            ? `Expected by ${dateStr}`
            : `Consecration in Progress`);

        const rawSubtext =
          ord.deliverySubtext ||
          (status === 'DELIVERED'
            ? 'Your item has been delivered'
            : status === 'SHIPPED' || status === 'IN_TRANSIT'
            ? 'Your item is in transit'
            : 'Pran-Pratishtha underway');

        const deliverySubtext =
          rawSubtext.toLowerCase().includes('pran-pratishtha') && rawSubtext.length > 25
            ? 'Pran-Pratishtha underway'
            : rawSubtext;

        const items =
          ord.items && ord.items.length > 0
            ? ord.items
            : [
                {
                  id: `item-${rawId}`,
                  name: ord.productName || 'Sacred Consecrated Relic',
                  price: ord.totalAmount || ord.total || 1499,
                  quantity: ord.quantity || 1,
                  image: ord.image,
                  subtitle: ord.subtitle || 'Vedic Consecrated & Energized',
                  variant: ord.variant,
                },
              ];

        return items.map((it: any, itIdx: number) => {
          const itName =
            it?.product?.name ||
            it?.name ||
            it?.product?.title ||
            it?.title ||
            ord.productName ||
            'Sacred Consecrated Relic';
          const itPrice = it?.price || it?.product?.price || ord.totalAmount || ord.total || 1499;
          const itQty = it?.quantity || 1;
          const itImg = resolveProductImage(it);
          const itVariant = it?.variant || it?.product?.variant;
          const itSubtitle =
            it?.subtitle ||
            it?.product?.subtitle ||
            it?.product?.energizedBy ||
            (itVariant ? `${itVariant}` : 'Vedic Consecrated & Energized');

          return {
            uniqueKey: `${rawId}-${it.id || itIdx}`,
            status,
            deliveryHeading,
            deliverySubtext,
            item: {
              ...it,
              name: itName,
              price: itPrice,
              quantity: itQty,
              image: itImg,
              subtitle: itSubtitle,
              variant: itVariant,
            },
            order: ord,
          };
        });
      })
      .slice(0, 3);
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* 1. Welcome Greeting Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2A0E13] via-[#3B1219] to-[#1C090C] text-white p-6 sm:p-8 shadow-lg border border-amber-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-300/30 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{t('Shubh Muhurat & Celestial Sanctuary', 'शुभ मुहूर्त एवं पावन साधना कक्ष')}</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#FFFDFB]">
              {t(`Namaste, ${profile.name}`, `नमस्ते, ${profile.name}`)} 🙏
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              {t(
                'Welcome to your personal astrological portal. Access verified birth Kundli coordinates, consecrated live consultations, and energized Vedic store artifacts.',
                'आपके पावन वैदिक कक्ष में आपका स्वागत है। अपनी जन्म कुंडली, पूज्य गुरुजी के साथ लाइव परामर्श एवं सिद्ध उत्पादों का विवरण यहां देखें।'
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => onTabChange('consultations')}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#2A0E13] text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>{t('My Bookings', 'मेरे परामर्श')}</span>
            </button>
            <Link
              href="/services"
              className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-all flex items-center gap-2"
            >
              <span>{t('Book Consultation', 'परामर्श बुक करें')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Top 3 Metric KPI Cards (Admin Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Metric 1: Zodiac Sign / Kundli */}
        <div
          onClick={() => onTabChange('kundli')}
          className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {t('Sun Sign / Rashi', 'राशि / लग्न')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-serif font-bold text-lg sm:text-xl text-[#3B1E22] truncate">
              {formatZodiacName(profile.zodiacSign)}
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {profile.dateOfBirth ? `${profile.dateOfBirth}` : t('Coordinates verified', 'सत्यापित विवरण')}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-amber-800 font-semibold">
            <span>{t('View Birth Chart', 'कुंडली देखें')}</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Metric 2: Consultations */}
        <div
          onClick={() => onTabChange('consultations')}
          className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-rose-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {t('Consultations', 'परामर्श सत्र')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-[#5B0D15] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="product-price-style text-2xl font-bold" style={{ color: '#212121' }}>
              {bookings.length}
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {upcomingBookings.length > 0
                ? `${upcomingBookings.length} ${t('Active Sessions', 'सक्रिय सत्र')}`
                : t('No upcoming sessions', 'कोई आगामी सत्र नहीं')}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-[#5B0D15] font-semibold">
            <span>{t('View Schedule', 'अनुसूची देखें')}</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Metric 3: Store Orders */}
        <div
          onClick={() => onTabChange('orders')}
          className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {t('Sacred Orders', 'पावन ऑर्डर्स')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="product-price-style text-2xl font-bold" style={{ color: '#212121' }}>
              {orders.length}
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {orders.length > 0 ? t('Artifacts dispatched', 'पार्सल प्रेषित') : t('0 parcels active', 'कोई पार्सल नहीं')}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-blue-700 font-semibold">
            <span>{t('Track Deliveries', 'डिलीवरी ट्रैक करें')}</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* 3. Upcoming Consultation Spotlight (If present) */}
      {nextBooking && (
        <div className="rounded-2xl bg-white border border-stone-200/90 shadow-md p-5 sm:p-6 overflow-hidden relative font-['Assistant',system-ui,-apple-system,sans-serif]">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-[#800000] to-amber-400" />
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-[#5B0D15]" />
                  <span>{t('Next Scheduled Session', 'अगला निर्धारित परामर्श')}</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                  {nextBooking.status || 'CONFIRMED'}
                </span>
                <span className="text-xs font-bold text-[#5B0D15] bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Dakshina: ₹{Number(nextBooking.totalCost || nextBooking.fee || 2100).toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-lg sm:text-xl text-stone-900 leading-snug">
                  {nextBooking.serviceTitle || nextBooking.service?.title || 'Vedic Astrological Consultation'}
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  {t('With', 'मार्गदर्शक')}: <strong className="text-stone-900">{nextBooking.panditName || 'Dr. Pandit Vishal Dubey'}</strong>
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs text-stone-600 flex-wrap">
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-4 h-4 text-amber-700" />
                  <span>{nextBooking.bookingDate || nextBooking.date || 'Scheduled Soon'}</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4 text-amber-700" />
                  <span>{nextBooking.slot || nextBooking.time || 'Confirmed Time Slot'}</span>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <a
                href={formatGoogleMeetLink(nextBooking.id || nextBooking._id)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Video className="w-4 h-4" />
                <span>{t('Join Google Meet Room', 'गूगल मीट कक्ष में जुड़ें')}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
              <button
                onClick={() => onTabChange('consultations')}
                className="px-5 py-3 rounded-full border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 font-semibold text-xs transition-all text-center"
              >
                {t('View All Bookings', 'सभी परामर्श देखें')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Split Grid: Recent Orders & Kundli Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recent Orders Tracker */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-700" />
              <h3 className="font-serif text-lg font-bold text-[#3B1E22]">
                {t('Recent Sacred Orders', 'हाल के सिद्ध ऑर्डर्स')}
              </h3>
            </div>
            <button
              onClick={() => onTabChange('orders')}
              className="text-xs font-semibold text-[#5B0D15] hover:underline flex items-center gap-1"
            >
              <span>{t('View All Orders', 'सभी ऑर्डर्स')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentProductItems.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <p className="text-xs text-stone-500">
                {t('You have not placed any sacred store orders yet.', 'अभी तक आपने कोई ऑर्डर नहीं दिया है।')}
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#5B0D15] text-white text-xs font-semibold hover:bg-[#78121d] transition-all"
              >
                <span>{t('Browse Sacred Artifacts', 'सिद्ध उत्पाद देखें')}</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentProductItems.map((entry: any) => {
                const it = entry.item;
                const status = entry.status;
                const deliveryHeading = entry.deliveryHeading;
                const deliverySubtext = entry.deliverySubtext;
                const itImg = it.image || resolveProductImage(it);
                const itPrice = it.price || 1499;
                const itQty = it.quantity || 1;

                return (
                  <div
                    key={entry.uniqueKey}
                    className="bg-white border border-stone-200/90 hover:border-amber-400 rounded-2xl p-4 sm:p-5 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4.5 group font-['Assistant',system-ui,-apple-system,sans-serif]"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Full-bleed Product Image */}
                      <div className="relative shrink-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-stone-200/90 group-hover:border-amber-400 overflow-hidden shadow-xs transition-all duration-300">
                          <img
                            src={itImg}
                            alt={it.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/products/rudraksha-mala.jpg';
                            }}
                          />
                        </div>
                      </div>

                      {/* Product Details (Name -> Subtitle & Qty -> Price) */}
                      <div className="min-w-0 flex-1 space-y-1">
                        {/* 1. Product Name */}
                        <h4
                          className="font-serif font-bold text-base sm:text-[17px] text-stone-900 group-hover:text-[#5B0D15] transition-colors line-clamp-1 leading-snug tracking-tight"
                          title={it.name}
                        >
                          {it.name}
                        </h4>

                        {/* 2. Subtitle / Energization Description */}
                        {it.subtitle && (
                          <p className="text-xs text-stone-500 font-medium line-clamp-1">
                            {it.subtitle}
                          </p>
                        )}

                        {/* 3. Price & Quantity (Paired logically together) */}
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-base sm:text-lg font-bold text-[#5B0D15]">
                            ₹{Number(itPrice).toLocaleString('en-IN')}
                          </span>
                          <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 border border-stone-200/60 px-2 py-0.5 rounded-md">
                            Qty: {itQty}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Status & Quick Actions */}
                    <div className="sm:w-60 shrink-0 sm:pl-4 sm:border-l sm:border-stone-100 space-y-1.5 sm:text-right flex flex-col justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center sm:justify-end gap-1.5 font-bold text-xs sm:text-[13px] text-stone-900">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              status === 'DELIVERED'
                                ? 'bg-emerald-600'
                                : 'bg-blue-600 animate-pulse'
                            }`}
                          />
                          <span>{deliveryHeading}</span>
                        </div>
                        <p className="text-xs text-stone-500 line-clamp-1 sm:text-right">
                          {deliverySubtext}
                        </p>
                      </div>

                      <div className="pt-0.5 flex sm:justify-end">
                        {status === 'DELIVERED' ? (
                          <button
                            type="button"
                            onClick={() => onTabChange('orders')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold text-xs shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                          >
                            <Star className="w-3.5 h-3.5 fill-white text-white" />
                            <span>{t('Rate & Review', 'समीक्षा लिखें')}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onTabChange('orders')}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200/80 text-stone-700 font-semibold text-xs transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                          >
                            <Truck className="w-3.5 h-3.5 text-stone-500" />
                            <span>{t('Track Order', 'ट्रैक करें')}</span>
                            <ChevronRight className="w-3 h-3 text-stone-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Janam Kundli Quick Snapshot */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-700" />
              <h3 className="font-serif text-lg font-bold text-[#3B1E22]">
                {t('Janam Kundli Coordinates', 'जन्म कुंडली विवरण')}
              </h3>
            </div>
            <button
              onClick={onEditKundli}
              className="text-xs font-semibold text-[#5B0D15] hover:underline"
            >
              {t('Edit', 'संशोधन')}
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-stone-100">
              <span className="text-stone-500">{t('Full Name', 'नाम')}</span>
              <span className="font-semibold text-stone-900">{profile.name}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-stone-100">
              <span className="text-stone-500">{t('Date of Birth', 'जन्म तिथि')}</span>
              <span className="font-semibold text-stone-900">{profile.dateOfBirth || t('Not added', 'अप्राप्त')}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-stone-100">
              <span className="text-stone-500">{t('Time of Birth', 'जन्म समय')}</span>
              <span className="font-semibold text-stone-900">{profile.timeOfBirth || t('Not added', 'अप्राप्त')}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-stone-100">
              <span className="text-stone-500">{t('Place of Birth', 'जन्म स्थान')}</span>
              <span className="font-semibold text-stone-900">{profile.placeOfBirth || t('Not added', 'अप्राप्त')}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-stone-500">{t('Zodiac / Rashi', 'राशि')}</span>
              <span className="font-semibold text-amber-900">{formatZodiacName(profile.zodiacSign)}</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onTabChange('kundli')}
              className="w-full py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200/80 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-amber-800" />
              <span>{t('View Detailed Horoscope Parameters', 'संपूर्ण कुंडली चक्र देखें')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverviewTab;
