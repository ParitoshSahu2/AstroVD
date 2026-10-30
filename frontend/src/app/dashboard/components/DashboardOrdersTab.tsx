'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Search,
  ShoppingCart,
  Truck,
  CheckCircle2,
  Clock,
  Star,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  X,
  FileText,
  Copy,
  Check,
  Printer,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { DEFAULT_SAMPLE_ORDERS, resolveProductImage } from '../utils';

interface DashboardOrdersTabProps {
  orders: any[];
  ordersLoading: boolean;
  t: (en: string, hi: string) => string;
}

export const DashboardOrdersTab: React.FC<DashboardOrdersTabProps> = ({
  orders,
  ordersLoading,
  t,
}) => {
  const [filter, setFilter] = useState<'all' | 'processing' | 'shipped' | 'delivered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [selectedReviewOrder, setSelectedReviewOrder] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const [selectedTrackOrder, setSelectedTrackOrder] = useState<any | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);

  const displayOrders = orders && orders.length > 0 ? orders : DEFAULT_SAMPLE_ORDERS;

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Flatten every order so each product gets its OWN distinct container card
  const allProductItems = displayOrders.flatMap((ord: any, ordIdx: number) => {
    const rawId = String(ord.id || ord._id || ord.orderNumber || `AVD-ORD-${ordIdx + 1}`);
    const displayOrderNum = ord.orderNumber || (rawId.startsWith('#') ? rawId : `#${rawId}`);

    const status = (ord.status || 'DELIVERED').toUpperCase();
    const isDelivered = status === 'DELIVERED';
    const isShipped = status === 'SHIPPED' || status === 'IN_TRANSIT';
    const isProcessing = !isDelivered && !isShipped;

    const dateStr =
      ord.deliveryDate ||
      (ord.createdAt
        ? new Date(ord.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
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
      (isDelivered
        ? `Delivered on ${dateStr}`
        : isShipped
        ? `Expected Delivery by ${dateStr}`
        : `Consecration in Progress`);

    const rawSubtext =
      ord.deliverySubtext ||
      (isDelivered
        ? 'Your item has been delivered'
        : isShipped
        ? 'Your item is in transit'
        : 'Pran-Pratishtha underway');

    const deliverySubtext =
      rawSubtext.toLowerCase().includes('pran-pratishtha') && rawSubtext.length > 25
        ? 'Pran-Pratishtha underway'
        : rawSubtext;

    const shippingCity =
      ord.shippingAddress?.city
        ? `${ord.shippingAddress.city}, ${ord.shippingAddress.state || ''} ${ord.shippingAddress.postalCode || ''}`
        : 'Indore, MP 452001';

    const items =
      ord.items && ord.items.length > 0
        ? ord.items
        : [
            {
              id: `item-${rawId}`,
              name: ord.productName || 'Sacred Consecrated Vedic Relic',
              price: ord.totalAmount || ord.total || 1499,
              quantity: ord.quantity || 1,
              image: ord.image,
              subtitle: ord.subtitle || 'Blessed in Varanasi Sanctum',
              variant: ord.variant,
            },
          ];

    return items.map((it: any, itIdx: number) => ({
      uniqueKey: `${rawId}-${it.id || itIdx}`,
      rawOrderId: rawId,
      displayOrderNum,
      placedDate,
      status,
      isDelivered,
      isShipped,
      isProcessing,
      deliveryHeading,
      deliverySubtext,
      shippingCity,
      item: {
        id: it.id || `it-${itIdx}`,
        name: it.product?.name || it.name || it.product?.title || it.title || ord.productName || 'Sacred Consecrated Relic',
        price: it.price || it.product?.price || ord.totalAmount || 1499,
        quantity: it.quantity || 1,
        image: it.image || it.product?.image || ord.image,
        variant: it.variant || it.product?.variant || ord.variant,
        subtitle: it.subtitle || it.product?.subtitle || it.product?.energizedBy || ord.subtitle || 'Vedic Consecrated & Energized',
      },
      fullOrder: ord,
    }));
  });

  // Filter individual product items by status and search
  const filteredProductItems = allProductItems.filter((entry) => {
    const st = entry.status;
    if (filter === 'processing' && st !== 'PROCESSING' && st !== 'PENDING' && st !== 'PLACED') return false;
    if (filter === 'shipped' && st !== 'SHIPPED' && st !== 'IN_TRANSIT') return false;
    if (filter === 'delivered' && st !== 'DELIVERED') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const id = entry.rawOrderId.toLowerCase();
      const pName = entry.item.name.toLowerCase();
      return id.includes(q) || pName.includes(q);
    }
    return true;
  });

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitted(true);
    setTimeout(() => {
      setSelectedReviewOrder(null);
      setReviewSubmitted(false);
      setReviewComment('');
    }, 1500);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* 1. Orders Header Card */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
              ✨ {t('Sacred Store Products', 'पावन स्टोर उत्पाद')}
            </span>
            <span className="text-xs text-stone-500 font-mono">
              {allProductItems.length} {t('Consecrated Items', 'कुल उत्पाद')}
            </span>
          </div>
          <h2 className="font-serif text-lg sm:text-xl font-bold text-[#3B1E22] mt-1">
            {t('My Sacred Orders & Deliveries', 'मेरे ऑर्डर्स एवं पार्सल ट्रैकिंग')}
          </h2>
          <p className="text-xs text-stone-500">
            {t(
              'Every product has its dedicated tracking, consecrated photo, invoice, and reviews.',
              'प्रत्येक उत्पाद का अपना अलग बॉक्स, वास्तविक तस्वीर, ट्रैकिंग एवं समीक्षा।'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/products"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#5B0D15] to-[#78121d] hover:from-[#480a11] hover:to-[#5B0D15] text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{t('Browse Sacred Store', 'स्टोर देखें')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-1 bg-stone-100/90 rounded-xl border border-stone-200/70 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-[#5B0D15] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t('All Items', 'सभी वस्तुएं')} ({allProductItems.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('delivered')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
              filter === 'delivered'
                ? 'bg-white text-[#5B0D15] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t('Delivered', 'डिलीवर हुए')} (
            {allProductItems.filter((p) => p.status === 'DELIVERED').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('shipped')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
              filter === 'shipped'
                ? 'bg-white text-[#5B0D15] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t('In Transit', 'मार्ग में')} (
            {allProductItems.filter((p) => p.status === 'SHIPPED' || p.status === 'IN_TRANSIT').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('processing')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
              filter === 'processing'
                ? 'bg-white text-[#5B0D15] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t('Consecration', 'सिद्धिकरण')} (
            {allProductItems.filter((p) => p.status === 'PROCESSING' || p.status === 'PENDING').length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={t('Search by order ID or item...', 'ऑर्डर आईडी या वस्तु खोजें...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded-xl bg-white border border-stone-200 focus:border-amber-400 outline-none transition-all placeholder:text-stone-400"
          />
        </div>
      </div>

      {/* 3. Products Containers List (EACH PRODUCT IN ITS OWN CONTAINER) */}
      {ordersLoading ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
          <div className="w-7 h-7 border-2 border-[#5B0D15] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-stone-600 font-medium">
            {t('Loading your sacred products...', 'उत्पाद लोड हो रहे हैं...')}
          </p>
        </div>
      ) : filteredProductItems.length === 0 ? (
        /* Empty State */
        <div className="p-10 text-center rounded-2xl bg-white border border-amber-200/90 shadow-xs space-y-3 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto">
            <ShoppingCart className="w-6 h-6 text-[#5B0D15]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-base text-[#3B1E22]">
              {t('No Products Found in this Category', 'कोई उत्पाद नहीं मिला')}
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {searchQuery
                ? t('No items matched your search query.', 'आपकी खोज के अनुसार कोई रिकॉर्ड नहीं मिला।')
                : t(
                    'Explore our collection of authentic Nepali Rudrakshas and energized bracelets.',
                    'हमारे सिद्ध नेपाली रुद्राक्ष व ब्रेसलेट संग्रह का अवलोकन करें।'
                  )}
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#5B0D15] hover:bg-[#480a11] text-white text-xs font-bold transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{t('Visit Sacred Store', 'स्टोर देखें')}</span>
          </Link>
        </div>
      ) : (
        /* EACH PRODUCT HAS ITS OWN CONTAINER BOX */
        <div className="space-y-3.5">
          {filteredProductItems.map((entry) => {
            const isCopied = copiedId === entry.rawOrderId;
            const itImg = resolveProductImage(entry.item);
            const itPrice = entry.item.price;
            const itQty = entry.item.quantity || 1;

            return (
              <div
                key={entry.uniqueKey}
                className="bg-white rounded-2xl border border-stone-200/90 hover:border-amber-400 hover:shadow-md transition-all overflow-hidden group font-['Assistant',system-ui,-apple-system,sans-serif]"
              >
                {/* 1. Header of this Product: Order ID, Date, Status pill, Price */}
                <div className="bg-stone-50/70 border-b border-stone-100 px-4 py-2.5 sm:px-5 sm:py-3 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Order ID badge */}
                    <div className="flex items-center gap-1 font-mono text-[11px] font-semibold text-stone-700 bg-white px-2.5 py-0.5 rounded-md border border-stone-200 shadow-2xs">
                      <span>{entry.displayOrderNum}</span>
                      <button
                        type="button"
                        onClick={(e) => handleCopyId(entry.rawOrderId, e)}
                        className="text-stone-400 hover:text-stone-700 ml-0.5 cursor-pointer"
                        title="Copy Order ID"
                      >
                        {isCopied ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    <span className="text-xs text-stone-500">
                      Ordered on <strong className="font-semibold text-stone-700">{entry.placedDate}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Pill with Dot */}
                    {entry.isDelivered && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        <span>Delivered</span>
                      </span>
                    )}
                    {entry.isShipped && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                        <span>In Transit</span>
                      </span>
                    )}
                    {entry.isProcessing && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                        <span>Consecration</span>
                      </span>
                    )}

                    <div className="text-right pl-3 border-l border-stone-200">
                      <span className="text-base sm:text-lg font-bold text-[#5B0D15]">
                        ₹{Number(itPrice).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Main Product Details Content */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Full-bleed Product Image */}
                    <div className="relative shrink-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-stone-200/90 group-hover:border-amber-400 overflow-hidden shadow-xs transition-all duration-300">
                        <img
                          src={itImg}
                          alt={entry.item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/products/rudraksha-mala.jpg';
                          }}
                        />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      {/* 1. Product Name */}
                      <h4
                        className="font-serif font-bold text-base sm:text-[17px] text-stone-900 group-hover:text-[#5B0D15] transition-colors line-clamp-1 leading-snug tracking-tight"
                        title={entry.item.name}
                      >
                        {entry.item.name}
                      </h4>

                      {/* 2. Subtitle / Details */}
                      <p className="text-xs text-stone-500 font-medium line-clamp-1">
                        {entry.item.subtitle || entry.item.variant || 'Vedic Consecrated & Energized'}
                      </p>

                      {/* 3. Price & Quantity */}
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

                  {/* Delivery milestone (Clean Flipkart / Amazon style) */}
                  <div className="md:w-64 shrink-0 md:pl-5 md:border-l md:border-stone-100 flex flex-col justify-center space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          entry.isDelivered
                            ? 'bg-emerald-600'
                            : entry.isShipped
                            ? 'bg-blue-600 animate-pulse'
                            : 'bg-amber-600 animate-pulse'
                        }`}
                      />
                      <span className="font-bold text-xs sm:text-[13px] text-stone-900 tracking-tight leading-snug">
                        {entry.deliveryHeading}
                      </span>
                    </div>

                    <p className="text-xs text-stone-500 pl-4.5 leading-normal">
                      {entry.deliverySubtext}
                    </p>
                  </div>
                </div>

                {/* 3. Action Buttons Footer (Curved Rounded-Full & Styled) */}
                <div className="bg-stone-50/60 border-t border-stone-100 px-4 py-3 sm:px-5 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Rate & Review Button */}
                    {entry.isDelivered && (
                      <button
                        type="button"
                        onClick={() => setSelectedReviewOrder(entry.fullOrder)}
                        className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                      >
                        <Star className="w-3.5 h-3.5 fill-white text-white" />
                        <span>{t('Rate & Review', 'समीक्षा लिखें')}</span>
                      </button>
                    )}

                    {/* Track Shipment Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedTrackOrder(entry.fullOrder)}
                      className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full bg-gradient-to-r from-[#5B0D15] to-[#78121d] hover:from-[#480a11] hover:to-[#5B0D15] text-white font-bold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                    >
                      <Truck className="w-3.5 h-3.5 text-amber-300" />
                      <span>{t('Track Shipment', 'ट्रैक करें')}</span>
                    </button>

                    {/* View Invoice Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedInvoiceOrder(entry.fullOrder)}
                      className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full bg-amber-50/90 hover:bg-amber-100 text-[#5B0D15] border border-amber-300/80 font-bold text-xs shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-700" />
                      <span>{t('Invoice', 'रसीद')}</span>
                    </button>
                  </div>

                  {/* Reorder / Store Link */}
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full bg-stone-900 hover:bg-black text-white font-bold text-xs shadow-2xs hover:shadow-xs transition-all active:scale-95 whitespace-nowrap"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
                    <span>{t('Buy Again', 'पुनः ऑर्डर')}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL 1: RATE & REVIEW PRODUCT ================= */}
      {selectedReviewOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fadeIn"
          onClick={() => setSelectedReviewOrder(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border-2 border-amber-300/80 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h3 className="font-serif font-bold text-base text-[#3B1E22]">
                  {t('Sacred Artifact Review', 'पवित्र उत्पाद समीक्षा')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReviewOrder(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
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
                    'Your experience helps other seekers connect with authentic consecrated relics.',
                    'आपका अनुभव अन्य साधकों का मार्गदर्शन करेगा।'
                  )}
                </p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3.5">
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
                      {reviewRating === 5 ? 'Divinely Blessed (5/5)' : `${reviewRating} / 5 Stars`}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    {t('Your Spiritual Experience & Energy', 'आपका आध्यात्मिक अनुभव')}
                  </label>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder={t(
                      'Describe the peace and energy experienced after wearing this consecrated relic...',
                      'इस सिद्ध उत्पाद को धारण करने के उपरांत अनुभव की गई ऊर्जा व शांति का वर्णन करें...'
                    )}
                    required
                    className="w-full p-3 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:border-amber-400 focus:bg-white outline-none resize-none transition-all placeholder:text-stone-400 leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedReviewOrder(null)}
                    className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-semibold"
                  >
                    {t('Cancel', 'रद्द करें')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-xs active:scale-95"
                  >
                    {t('Submit Review', 'समीक्षा भेजें')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL 2: SHIPMENT TRACKING ================= */}
      {selectedTrackOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fadeIn"
          onClick={() => setSelectedTrackOrder(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border-2 border-amber-300/80 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">
                  Consignment Tracking
                </span>
                <h3 className="font-serif font-bold text-base text-[#3B1E22]">
                  {selectedTrackOrder.orderNumber || selectedTrackOrder.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTrackOrder(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4-Step Visual Tracker */}
            <div className="relative pl-6 space-y-5 border-l-2 border-amber-300 ml-3 py-1">
              {/* Step 1 */}
              <div className="relative">
                <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-600 ring-4 ring-emerald-100" />
                <h5 className="font-bold text-xs text-stone-900">1. Order Confirmed</h5>
                <p className="text-[11px] text-stone-500">
                  Dakshina verified. Artifact queued for Vedic energization.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-600 ring-4 ring-emerald-100" />
                <h5 className="font-bold text-xs text-stone-900">
                  2. Pran-Pratishtha Consecration Completed
                </h5>
                <p className="text-[11px] text-stone-500">
                  Energized with Beej Mantras at Varanasi Sanctum by Dr. Vishal Dubey.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <span
                  className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full ${
                    selectedTrackOrder.status === 'PROCESSING'
                      ? 'bg-amber-400 ring-4 ring-amber-100'
                      : 'bg-emerald-600 ring-4 ring-emerald-100'
                  }`}
                />
                <h5 className="font-bold text-xs text-stone-900">
                  3. Dispatched via Express Sacred Courier
                </h5>
                <p className="text-[11px] text-stone-500">
                  Sealed with Ganga Jal & packed in protective sanctum pouch.
                </p>
              </div>

              {/* Step 4 */}
              <div className="relative">
                <span
                  className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full ${
                    selectedTrackOrder.status === 'DELIVERED'
                      ? 'bg-emerald-600 ring-4 ring-emerald-100'
                      : 'bg-stone-300 ring-4 ring-stone-100'
                  }`}
                />
                <h5 className="font-bold text-xs text-stone-900">
                  4. Delivered to Destination
                </h5>
                <p className="text-[11px] text-stone-500">
                  {selectedTrackOrder.status === 'DELIVERED'
                    ? 'Delivered safely to resident with blessed guidance card.'
                    : 'Scheduled for doorstep delivery shortly.'}
                </p>
              </div>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTrackOrder(null)}
                className="px-5 py-2 rounded-xl bg-[#5B0D15] hover:bg-[#480a11] text-white text-xs font-bold transition-all shadow-xs"
              >
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: INVOICE & RECEIPT ================= */}
      {selectedInvoiceOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fadeIn"
          onClick={() => setSelectedInvoiceOrder(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border-2 border-amber-300/80 space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Invoice Top */}
            <div className="flex items-start justify-between border-b border-amber-200/80 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                  🔱 AstroVD Sacred Tax Invoice
                </span>
                <h4 className="font-serif text-lg font-bold text-[#3B1E22] mt-1">
                  Tax Invoice / Receipt
                </h4>
                <p className="text-xs text-stone-500 font-mono">
                  {selectedInvoiceOrder.orderNumber || selectedInvoiceOrder.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recipient & Billing Info */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">
                  Billed To
                </span>
                <span className="font-bold text-stone-800 block">
                  {selectedInvoiceOrder.shippingAddress?.recipient || 'Valued Seeker'}
                </span>
                <span className="text-stone-500 text-[11px] block mt-0.5">
                  {selectedInvoiceOrder.shippingAddress?.city || 'Indore, MP'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">
                  Invoice Date
                </span>
                <span className="font-semibold text-stone-800 block">
                  {selectedInvoiceOrder.createdAt
                    ? new Date(selectedInvoiceOrder.createdAt).toLocaleDateString()
                    : 'Nov 24, 2025'}
                </span>
                <span className="text-emerald-700 font-bold text-[11px] block mt-0.5">
                  ✓ Paid via Online Gateway
                </span>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
              <div className="bg-stone-50 px-3.5 py-2 font-bold text-stone-600 flex justify-between border-b border-stone-200">
                <span>Item & Consecration</span>
                <span>Amount</span>
              </div>
              <div className="p-3.5 space-y-2">
                {(selectedInvoiceOrder.items || [selectedInvoiceOrder]).map(
                  (it: any, iIdx: number) => (
                    <div key={iIdx} className="flex justify-between items-center text-xs">
                      <span className="text-stone-800 font-medium">
                        {it.name || selectedInvoiceOrder.productName || 'Consecrated Vedic Relic'} ×{' '}
                        {it.quantity || 1}
                      </span>
                      <span className="font-bold text-stone-900">
                        ₹{Number(it.price || selectedInvoiceOrder.totalAmount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )
                )}
                <div className="pt-2 border-t border-stone-100 flex justify-between text-stone-500 text-[11px]">
                  <span>Vedic Energization & Pran-Pratishtha Dakshina</span>
                  <span className="text-emerald-700 font-semibold">Included</span>
                </div>
                <div className="flex justify-between text-stone-500 text-[11px]">
                  <span>Express Safe Delivery</span>
                  <span className="text-emerald-700 font-semibold">FREE</span>
                </div>
              </div>
              <div className="bg-amber-50/60 px-3.5 py-2.5 flex justify-between items-center border-t border-amber-200/80 font-bold text-sm">
                <span className="text-stone-800">Total Paid:</span>
                <span className="text-base text-[#5B0D15]">
                  ₹{Number(selectedInvoiceOrder.totalAmount || 2499).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-1 flex items-center justify-between">
              <span className="text-[11px] text-stone-400 italic">
                AstroVD Pvt. Ltd. • Varanasi Sanctum
              </span>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-[#5B0D15] hover:bg-[#480a11] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <Printer className="w-3.5 h-3.5 text-amber-300" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOrdersTab;
