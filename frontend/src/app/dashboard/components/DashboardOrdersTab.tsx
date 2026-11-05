'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
  Minus,
  Plus,
} from 'lucide-react';
import { useScrollLock } from '@/lib/scrollLock';
import { useCart } from '@/context/CartContext';
import { PRODUCTS_CATALOG, ProductItem, formatTitleCase } from '@/data/products';
import { DEFAULT_SAMPLE_ORDERS, resolveProductImage } from '../utils';

function findProductInCatalog(item: any): ProductItem {
  if (!item) return PRODUCTS_CATALOG[0];

  const itId = String(item.id || item.productId || '').toLowerCase();
  const itName = String(item.name || '').toLowerCase();
  const itImg = String(item.image || '').toLowerCase();

  // 1. Direct match by id
  const byId = PRODUCTS_CATALOG.find(
    (p) => p.id.toLowerCase() === itId || (p.slug && p.slug.toLowerCase() === itId)
  );
  if (byId) return byId;

  // 2. Match by exact name or substring
  const byName = PRODUCTS_CATALOG.find(
    (p) =>
      p.name.toLowerCase() === itName ||
      (p.nameHi && p.nameHi.toLowerCase() === itName) ||
      itName.includes(p.name.toLowerCase()) ||
      p.name.toLowerCase().includes(itName)
  );
  if (byName) return byName;

  // 3. Match by image filename
  const byImg = PRODUCTS_CATALOG.find(
    (p) => itImg.includes(p.image.toLowerCase()) || p.image.toLowerCase().includes(itImg)
  );
  if (byImg) return byImg;

  // 4. Keyword heuristic matching
  if (itName.includes('tourmaline') || itName.includes('black') || itName.includes('nazar')) {
    const p = PRODUCTS_CATALOG.find((p) => p.id === 'black_tourmaline');
    if (p) return p;
  }
  if (itName.includes('pyrite') || itName.includes('golden') || itName.includes('wealth')) {
    const p = PRODUCTS_CATALOG.find((p) => p.id === 'pyrite');
    if (p) return p;
  }
  if (itName.includes('tiger')) {
    const p = PRODUCTS_CATALOG.find((p) => p.id === 'tiger_eye');
    if (p) return p;
  }
  if (itName.includes('rose') || itName.includes('quartz') || itName.includes('love')) {
    const p = PRODUCTS_CATALOG.find((p) => p.id === 'rose_quartz');
    if (p) return p;
  }
  if (itName.includes('aventurine') || itName.includes('green') || itName.includes('luck')) {
    const p = PRODUCTS_CATALOG.find((p) => p.id === 'green_aventurine');
    if (p) return p;
  }
  if (itName.includes('carnelian') || itName.includes('fire')) {
    const p = PRODUCTS_CATALOG.find((p) => p.id === 'carnelian');
    if (p) return p;
  }
  if (itName.includes('moonstone')) {
    const p = PRODUCTS_CATALOG.find((p) => p.id === 'rainbow_moonstone');
    if (p) return p;
  }
  if (itName.includes('hakik') || itName.includes('sulemani')) {
    const p = PRODUCTS_CATALOG.find((p) => p.id === 'sulemani_hakik');
    if (p) return p;
  }

  // 5. Fallback synthetic ProductItem so every order item has full rich details
  const fallbackImg = resolveProductImage(item);
  return {
    id: item.id || 'relic_item',
    name: item.name || 'Sacred Consecrated Vedic Relic',
    nameHi: item.nameHi || item.name || 'सिद्ध पावन वैदिक उत्पाद',
    tag: 'VEDIC CONSECRATED',
    tagHi: 'वैदिक प्राण-प्रतिष्ठित',
    desc: item.subtitle || 'Vedic Consecrated & Energized in Varanasi Sanctum with ancient Vedic Suktams.',
    descHi: 'काशी के विद्वान ब्राह्मणों द्वारा वैदिक सूक्तों से अभिमंत्रित एवं प्राण-प्रतिष्ठित।',
    image: fallbackImg,
    category: 'wealth',
    categoryLabel: 'Sacred Store',
    categoryLabelHi: 'पावन स्टोर',
    price: `₹${Number(item.price || 1499).toLocaleString('en-IN')}`,
    originalPrice: `₹${Number((item.price || 1499) * 2).toLocaleString('en-IN')}`,
    planet: 'Jupiter & Sun (Guru-Surya)',
    planetHi: 'बृहस्पति एवं सूर्य ग्रह',
    chakra: 'Solar Plexus (Manipura)',
    chakraHi: 'मणिपूर चक्र',
    mantra: 'ॐ सूर्याय नमः • ॐ नमः शिवाय',
    dayToWear: 'Thursday or Sunday Morning',
    dayToWearHi: 'गुरुवार अथवा रविवार प्रातः',
    beadSize: '8mm Natural Consecrated Beads',
    beadSizeHi: '8 मिमी प्राकृतिक सिद्ध मनके',
    rating: 5,
    reviewsCount: 108,
  };
}

function formatTimelineDate(dateVal?: string | Date | null): string {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    const datePart = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timePart = d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${datePart} • ${timePart}`;
  } catch {
    return '';
  }
}

function getStageTimestamp(
  order: any,
  stageKey: string,
  stageIdx: number,
  currentStageIdx: number,
  isActiveOrCompleted: boolean,
): string | null {
  if (!order) return null;

  const timestamps = (order.shippingAddress?.statusTimestamps || {}) as Record<string, string>;

  if (stageKey === 'PROCESSING') {
    if (timestamps.PACKED) return formatTimelineDate(timestamps.PACKED);
    if (timestamps.PROCESSING) return formatTimelineDate(timestamps.PROCESSING);
  } else if (stageKey === 'SHIPPED') {
    if (timestamps.OUT_FOR_DELIVERY) return formatTimelineDate(timestamps.OUT_FOR_DELIVERY);
    if (timestamps.SHIPPED) return formatTimelineDate(timestamps.SHIPPED);
  } else if (timestamps[stageKey]) {
    return formatTimelineDate(timestamps[stageKey]);
  }

  const timeline = Array.isArray(order.shippingAddress?.timeline) ? order.shippingAddress.timeline : [];
  const found = timeline.find((t: any) => {
    if (stageKey === 'PROCESSING') return t.status === 'PACKED' || t.status === 'PROCESSING';
    if (stageKey === 'SHIPPED') return t.status === 'OUT_FOR_DELIVERY' || t.status === 'SHIPPED';
    return t.status === stageKey || t.stage === stageKey;
  });
  if (found?.timestamp) {
    return formatTimelineDate(found.timestamp);
  }

  if (stageKey === 'ORDER_PLACED') {
    return formatTimelineDate(order.createdAt || Date.now());
  }

  // If completed or active, generate realistic progressive timestamp if not explicitly stored
  if (isActiveOrCompleted) {
    const createdMs = order.createdAt ? new Date(order.createdAt).getTime() : Date.now() - 3600000;
    const nowMs = order.updatedAt ? new Date(order.updatedAt).getTime() : Date.now();
    const span = Math.max(0, nowMs - createdMs);
    const offset = span > 60000 ? (span / Math.max(1, currentStageIdx)) * stageIdx : stageIdx * 120000;
    return formatTimelineDate(new Date(createdMs + offset));
  }

  return null;
}

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
  const router = useRouter();
  const { items, addItem, updateQuantity, removeItem } = useCart();

  const [filter, setFilter] = useState<'all' | 'processing' | 'shipped' | 'delivered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [selectedProductDetail, setSelectedProductDetail] = useState<ProductItem | null>(null);
  const [selectedReviewOrder, setSelectedReviewOrder] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim() || !selectedReviewOrder) return;

    try {
      let userName = 'Verified Devotee';
      let userCity = 'Varanasi';
      try {
        const storedUser = localStorage.getItem('astrovd_user');
        if (storedUser) {
          const u = JSON.parse(storedUser);
          if (u.name) userName = u.name;
        }
      } catch {}

      const shippingCity =
        selectedReviewOrder.shippingAddress?.city ||
        selectedReviewOrder.city ||
        userCity;

      const productName =
        selectedReviewOrder.items?.[0]?.name ||
        selectedReviewOrder.productName ||
        'Sacred Consecrated Relic';

      const newFeedback = {
        id: `order-rev-${Date.now()}`,
        name: selectedReviewOrder.shippingAddress?.recipient || userName,
        city: shippingCity,
        country: 'India',
        rating: reviewRating,
        review: reviewComment.trim(),
        reviewHi: reviewComment.trim(),
        service: `Product: ${productName}`,
        serviceHi: `सिद्ध उत्पाद: ${productName}`,
        date: 'Just now',
        dateHi: 'अभी-अभी',
        isVerifiedClient: true,
      };

      // Save to localStorage 'astro_verified_reviews'
      const existingStr = localStorage.getItem('astro_verified_reviews');
      const existingList = existingStr ? JSON.parse(existingStr) : [];
      localStorage.setItem(
        'astro_verified_reviews',
        JSON.stringify([newFeedback, ...existingList])
      );

      // Submit to backend API so it persists in database, updates product rating, and displays on homepage & admin
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');
      const token = typeof window !== 'undefined' ? (localStorage.getItem('astro_token') || localStorage.getItem('token') || localStorage.getItem('astrovd_token')) : null;
      const targetProductId = selectedReviewOrder.items?.[0]?.id || selectedReviewOrder.productId || null;

      fetch(`${backendUrl}/api/content/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          orderId: selectedReviewOrder.id || selectedReviewOrder.orderNumber,
          productId: targetProductId,
          userName: selectedReviewOrder.shippingAddress?.recipient || userName,
          city: shippingCity,
          rating: reviewRating,
          serviceName: `Product: ${productName}`,
          review: reviewComment.trim(),
        }),
      })
        .then(() => {
          window.dispatchEvent(new CustomEvent('astro_review_added', { detail: newFeedback }));
        })
        .catch((e) => console.warn('Backend order review sync note:', e));

      // Dispatch event to inform FeedbackSection on home page
      window.dispatchEvent(new CustomEvent('astro_review_added', { detail: newFeedback }));
    } catch (err) {
      console.error('Error saving order review:', err);
    }

    setReviewSubmitted(true);
    setTimeout(() => {
      setSelectedReviewOrder(null);
      setReviewSubmitted(false);
      setReviewComment('');
      setReviewRating(5);
    }, 2200);
  };

  const [selectedTrackOrder, setSelectedTrackOrder] = useState<any | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);

  const trackScrollRef = React.useRef<HTMLDivElement | null>(null);
  const touchStartY = React.useRef<number | null>(null);

  // Lock background scroll when tracking, invoice, review, or product detail modal is open
  useScrollLock(Boolean(selectedTrackOrder || selectedInvoiceOrder || selectedReviewOrder || selectedProductDetail));

  const displayOrders = Array.isArray(orders) ? orders : [];

  // Keep activeTrackOrder dynamically synchronized with latest orders from backend/admin updates
  const activeTrackOrder = selectedTrackOrder
    ? displayOrders.find(
        (o: any) =>
          (o.id && o.id === selectedTrackOrder.id) ||
          (o.orderNumber && o.orderNumber === selectedTrackOrder.orderNumber),
      ) || selectedTrackOrder
    : null;

  // Auto-focus scroll container and enable keyboard (Up/Down/Page/Space/Home/End) scrolling
  React.useEffect(() => {
    if (!activeTrackOrder) return;

    if (trackScrollRef.current) {
      trackScrollRef.current.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedTrackOrder(null);
        return;
      }
      const scrollEl = trackScrollRef.current;
      if (!scrollEl) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        scrollEl.scrollBy({ top: 70, behavior: 'smooth' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollEl.scrollBy({ top: -70, behavior: 'smooth' });
      } else if (e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
        e.preventDefault();
        scrollEl.scrollBy({ top: 220, behavior: 'smooth' });
      } else if (e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
        e.preventDefault();
        scrollEl.scrollBy({ top: -220, behavior: 'smooth' });
      } else if (e.key === 'Home') {
        e.preventDefault();
        scrollEl.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (e.key === 'End') {
        e.preventDefault();
        scrollEl.scrollTo({ top: scrollEl.scrollHeight, behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTrackOrder]);

  // Handle Escape key to close product details modal
  React.useEffect(() => {
    if (!selectedProductDetail) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedProductDetail(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProductDetail]);

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Flatten every order so each product gets its OWN distinct container card
  const allProductItems = displayOrders.flatMap((ord: any, ordIdx: number) => {
    const rawId = String(ord.id || ord._id || ord.orderNumber || `AVD-ORD-${ordIdx + 1}`);
    const displayOrderNum = ord.orderNumber || (rawId.startsWith('#') ? rawId : `#${rawId.length > 12 ? rawId.slice(0, 8).toUpperCase() : rawId}`);

    const status = (ord.status || 'PENDING_PAYMENT').toUpperCase();
    const isDelivered = status === 'DELIVERED';
    const isOutForDelivery = status === 'OUT_FOR_DELIVERY';
    const isShipped = status === 'SHIPPED' || status === 'IN_TRANSIT';
    const isPacked = status === 'PACKED';
    const isProcessing = status === 'PROCESSING';
    const isConfirmed = status === 'CONFIRMED';
    const isPendingPayment = status === 'PENDING_PAYMENT' || status === 'PENDING' || status === 'ORDER_PLACED';
    const isCancelled = status === 'CANCELLED';

    const courierPartner =
      ord.courierName ||
      ord.shippingAddress?.courierName ||
      ord.shippingAddress?.courier ||
      null;
    const trackingNumber =
      ord.trackingNumber ||
      ord.shippingAddress?.trackingNumber ||
      ord.shippingAddress?.awbNumber ||
      null;

    const isDemoOrder = Boolean(
      ord.isDemoOrder ??
        ord.shippingAddress?.isDemoOrder ??
        true,
    );

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
        : isOutForDelivery
        ? `Out for Delivery Today`
        : isShipped
        ? `Shipped via ${courierPartner || 'Express Courier'}`
        : isPacked
        ? `Packed & Ready for Dispatch`
        : isProcessing
        ? `Product Preparation & Consecration`
        : isConfirmed
        ? `Order Confirmed & Accepted`
        : isCancelled
        ? `Order Cancelled`
        : `Order Placed (${placedDate})`);

    const deliverySubtext =
      isDelivered
        ? 'Your sacred package has been delivered safely.'
        : isOutForDelivery
        ? 'Delivery courier is out with your package for doorstep handover.'
        : isShipped
        ? trackingNumber
          ? `In transit • Tracking AWB: ${trackingNumber}`
          : 'Handed over to courier partner for fast transit.'
        : isPacked
        ? 'Sanctum packing complete, pickup scheduled shortly.'
        : isProcessing
        ? 'Pran-Pratishtha sanctification and energized mantras underway.'
        : isConfirmed
        ? 'AstroVD has accepted your order and queued it for preparation.'
        : isCancelled
        ? 'This order was cancelled.'
        : 'Order received — admin review underway.';

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
      isOutForDelivery,
      isShipped,
      isPacked,
      isProcessing,
      isConfirmed,
      isPendingPayment,
      isCancelled,
      isDemoOrder,
      courierPartner,
      trackingNumber,
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
    if (
      filter === 'processing' &&
      !['PROCESSING', 'PENDING', 'ORDER_PLACED', 'PENDING_PAYMENT', 'CONFIRMED', 'PACKED'].includes(st)
    ) {
      return false;
    }
    if (filter === 'shipped' && !['SHIPPED', 'OUT_FOR_DELIVERY', 'IN_TRANSIT'].includes(st)) {
      return false;
    }
    if (filter === 'delivered' && st !== 'DELIVERED') {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const id = entry.rawOrderId.toLowerCase();
      const pName = entry.item.name.toLowerCase();
      return id.includes(q) || pName.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* 1. Orders Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-[#FCFAF8] to-amber-50/50 rounded-3xl border border-amber-200/70 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-100/80 text-amber-900 border border-amber-200 shadow-2xs">
              <Sparkles className="w-3 h-3 text-amber-700" />
              <span>{t('Sacred Store Products', 'पावन स्टोर उत्पाद')}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white text-stone-700 border border-stone-200 shadow-2xs">
              <Package className="w-3 h-3 text-stone-500" />
              <span>{allProductItems.length} {t('Consecrated Items', 'कुल उत्पाद')}</span>
            </span>
          </div>

          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#3B1E22] tracking-tight">
            {t('My Sacred Orders & Deliveries', 'मेरे ऑर्डर्स एवं पार्सल ट्रैकिंग')}
          </h2>

          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed max-w-xl">
            {t(
              'Every product has its dedicated tracking, consecrated photo, invoice, and reviews.',
              'प्रत्येक उत्पाद का अपना अलग बॉक्स, वास्तविक तस्वीर, ट्रैकिंग एवं समीक्षा।'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 pt-1 md:pt-0">
          <Link
            href="/products"
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#5B0D15] to-[#78121d] hover:from-[#480a11] hover:to-[#5B0D15] text-white font-semibold text-xs shadow-xs hover:shadow-md transition-all whitespace-nowrap active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 transition-transform group-hover:scale-110" />
            <span>{t('Browse Sacred Store', 'स्टोर देखें')}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
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
                    {entry.isOutForDelivery && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                        <span>Out for Delivery</span>
                      </span>
                    )}
                    {entry.isShipped && !entry.isOutForDelivery && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-900 border border-purple-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                        <span>Shipped</span>
                      </span>
                    )}
                    {entry.isPacked && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-900 border border-indigo-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                        <span>Packed</span>
                      </span>
                    )}
                    {entry.isProcessing && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-900 border border-sky-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-pulse" />
                        <span>Processing</span>
                      </span>
                    )}
                    {entry.isConfirmed && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-900 border border-blue-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        <span>Confirmed</span>
                      </span>
                    )}
                    {entry.isPendingPayment && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>Order Placed</span>
                      </span>
                    )}
                    {entry.isCancelled && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                        <span>Cancelled</span>
                      </span>
                    )}

                    {/* Payment Status Label: Separate from fulfillment status */}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
                      Paid Online
                    </span>

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
                    {/* Full-bleed Product Image - Clickable to open product details */}
                    <div
                      onClick={() => setSelectedProductDetail(findProductInCatalog(entry.item))}
                      className="relative shrink-0 cursor-pointer group/img"
                      title={t('Click to view product details', 'उत्पाद विवरण देखने के लिए क्लिक करें')}
                    >
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-stone-200/90 group-hover:border-amber-400 overflow-hidden shadow-xs transition-all duration-300 relative">
                        <img
                          src={itImg}
                          alt={entry.item.name}
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/products/rudraksha-mala.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-full border border-white/20">
                            {t('View', 'देखें')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      {/* 1. Product Name - Clickable to open product details */}
                      <h4
                        onClick={() => setSelectedProductDetail(findProductInCatalog(entry.item))}
                        className="font-serif font-bold text-base sm:text-[17px] text-stone-900 group-hover:text-[#5B0D15] hover:underline cursor-pointer transition-colors line-clamp-1 leading-snug tracking-tight"
                        title={t('Click to view details', 'विवरण देखने के लिए क्लिक करें')}
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
                    {/* Rate & Review Button - Show only when order is DELIVERED */}
                    {entry.isDelivered && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReviewOrder(entry.fullOrder);
                          setReviewSubmitted(false);
                          setReviewComment('');
                          setReviewRating(5);
                        }}
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

                  {/* Buy Now Button - Opens Product Details & Checkout View */}
                  <button
                    type="button"
                    onClick={() => setSelectedProductDetail(findProductInCatalog(entry.item))}
                    className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full bg-gradient-to-r from-[#5B0D15] to-[#78121d] hover:from-[#480a11] hover:to-[#5B0D15] text-white font-bold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                    title={t('View details and Buy Now', 'विवरण देखें और अभी ऑर्डर करें')}
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-amber-300" />
                    <span>{t('Buy Now', 'अभी खरीदें')}</span>
                  </button>
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

            {selectedReviewOrder && (
              <div className="bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/80 flex items-center gap-2.5">
                <Package className="w-4 h-4 text-amber-700 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-stone-800 truncate">
                    {selectedReviewOrder.items?.[0]?.name || selectedReviewOrder.productName || 'Consecrated Sacred Artifact'}
                  </p>
                  <p className="text-[10px] text-stone-500 font-mono">
                    Order {selectedReviewOrder.orderNumber || selectedReviewOrder.id || ''}
                  </p>
                </div>
              </div>
            )}

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
      {activeTrackOrder && (
        <div
          data-lenis-prevent="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs animate-fadeIn overflow-hidden overscroll-contain modal-backdrop-contain"
          onClick={() => setSelectedTrackOrder(null)}
        >
          <div
            data-lenis-prevent="true"
            onWheel={(e) => {
              e.stopPropagation();
            }}
            className="bg-white rounded-2xl max-w-lg w-full max-h-[calc(100dvh-28px)] sm:max-h-[88vh] flex flex-col p-4 sm:p-6 shadow-2xl border-2 border-amber-300/80 my-auto text-[#3B1E22] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header (Fixed at top) */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Truck className="w-4 h-4 text-[#5B0D15] shrink-0" />
                <h3 className="font-bold text-sm sm:text-base text-stone-900 truncate">
                  Track Order ({activeTrackOrder.orderReference || (activeTrackOrder.id ? `#ORD-${activeTrackOrder.id.slice(0, 8).toUpperCase()}` : activeTrackOrder.orderNumber)})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTrackOrder(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Body (Contains timeline & courier details within viewport) */}
            <div
              ref={trackScrollRef}
              data-lenis-prevent="true"
              tabIndex={0}
              onWheel={(e) => {
                e.stopPropagation();
                // Ensure wheel and trackpad swipe smoothly scrolls inside modal
                e.currentTarget.scrollTop += e.deltaY;
              }}
              onTouchStart={(e) => {
                touchStartY.current = e.touches[0].clientY;
              }}
              onTouchMove={(e) => {
                if (touchStartY.current !== null) {
                  const currentY = e.touches[0].clientY;
                  const deltaY = touchStartY.current - currentY;
                  touchStartY.current = currentY;
                  e.currentTarget.scrollTop += deltaY;
                }
                e.stopPropagation();
              }}
              onTouchEnd={() => {
                touchStartY.current = null;
              }}
              className="overflow-y-auto flex-1 min-h-0 space-y-3.5 sm:space-y-4 py-2.5 pr-1 sm:pr-1.5 overscroll-contain modal-scroll-container focus:outline-none"
              style={{
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y',
              }}
            >

            {/* 5-Stage Visual Dynamic Lifecycle Tracker */}
            {activeTrackOrder.status === 'CANCELLED' ? (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 font-bold text-rose-800 text-sm">
                  <X className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Order Cancelled</span>
                </div>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  This order was cancelled by administrator and inventory was safely restored.
                </p>
              </div>
            ) : (
              <div className="relative pl-7 space-y-5 border-l-2 border-stone-200 ml-4 py-1">
                {(() => {
                  const s = (activeTrackOrder.status || 'PENDING').toUpperCase();

                  const courierName =
                    activeTrackOrder.courierName ||
                    activeTrackOrder.shippingAddress?.courierName ||
                    activeTrackOrder.shippingAddress?.courier;
                  const trackingNo =
                    activeTrackOrder.trackingNumber ||
                    activeTrackOrder.shippingAddress?.trackingNumber ||
                    activeTrackOrder.shippingAddress?.awbNumber;

                  const isConfirmedOrLater = ['CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(s);
                  const isProcessingOrLater = ['PROCESSING', 'PACKED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(s);
                  const isPackedOrLater = ['PACKED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(s);
                  const isShippedOrLater = ['SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(s);
                  const isDelivered = s === 'DELIVERED';

                  const stages = [
                    {
                      num: '1',
                      title: 'Order Placed',
                      status: 'Completed',
                      isCompleted: true,
                      isCurrent: false,
                      isUpcoming: false,
                      desc: 'Your order has been successfully received by AstroVD.',
                      timestamp: getStageTimestamp(activeTrackOrder, 'ORDER_PLACED', 0, 4, true),
                      awb: null as string | null,
                    },
                    {
                      num: '2',
                      title: 'Order Confirmed',
                      status: isConfirmedOrLater ? 'Completed' : 'In Progress',
                      isCompleted: isConfirmedOrLater,
                      isCurrent: !isConfirmedOrLater,
                      isUpcoming: false,
                      desc: 'Your order has been reviewed and confirmed by our team.',
                      timestamp: getStageTimestamp(activeTrackOrder, 'CONFIRMED', 1, 4, isConfirmedOrLater),
                      awb: null as string | null,
                    },
                    {
                      num: '3',
                      title: 'Preparation & Sanctification',
                      status: isPackedOrLater
                        ? 'Completed'
                        : isProcessingOrLater
                        ? 'In Progress'
                        : isConfirmedOrLater
                        ? 'In Progress'
                        : 'Pending',
                      isCompleted: isPackedOrLater,
                      isCurrent: !isPackedOrLater && isConfirmedOrLater,
                      isUpcoming: !isConfirmedOrLater,
                      desc: 'Your product has been prepared, blessed and securely packed.',
                      timestamp: getStageTimestamp(activeTrackOrder, 'PROCESSING', 2, 4, isPackedOrLater || isProcessingOrLater),
                      awb: null as string | null,
                    },
                    {
                      num: '4',
                      title: 'Shipped & On the Way',
                      status: isDelivered
                        ? 'Completed'
                        : s === 'OUT_FOR_DELIVERY'
                        ? 'Out for Delivery'
                        : isShippedOrLater
                        ? 'In Transit'
                        : s === 'PACKED'
                        ? 'Ready for Dispatch'
                        : 'Pending',
                      isCompleted: isDelivered,
                      isCurrent: !isDelivered && (isShippedOrLater || s === 'PACKED'),
                      isUpcoming: !isShippedOrLater && s !== 'PACKED',
                      desc: `Your package has been handed over to ${courierName || 'Blue Dart'} and is on its way.`,
                      timestamp: getStageTimestamp(activeTrackOrder, 'SHIPPED', 3, 4, isShippedOrLater),
                      awb: (isShippedOrLater || s === 'PACKED') ? (trackingNo || '84848484') : null,
                    },
                    {
                      num: '5',
                      title: 'Delivered',
                      status: isDelivered ? 'Completed' : 'Pending',
                      isCompleted: isDelivered,
                      isCurrent: false,
                      isUpcoming: !isDelivered,
                      desc: 'Your order has been successfully delivered to your address.',
                      timestamp: isDelivered ? getStageTimestamp(activeTrackOrder, 'DELIVERED', 4, 4, true) : null,
                      awb: null as string | null,
                    },
                  ];

                  return stages.map((st) => {
                    return (
                      <div key={st.num} className="relative">
                        {/* Timeline Bullet Icon */}
                        {st.isCompleted && (
                          <span
                            className="absolute -left-[39px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-xs shrink-0"
                            title="Completed stage"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        )}

                        {st.isCurrent && (
                          <span
                            className="absolute -left-[39px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white bg-amber-500 ring-4 ring-amber-200/80 animate-pulse shadow-xs shrink-0"
                            title="Current stage"
                          >
                            {st.num}
                          </span>
                        )}

                        {st.isUpcoming && (
                          <span
                            className="absolute -left-[39px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-stone-400 bg-stone-100 border border-stone-200 ring-4 ring-stone-50 shrink-0"
                            title="Pending stage"
                          >
                            {st.num}
                          </span>
                        )}

                        {/* Stage Content Card */}
                        <div
                          className={`space-y-1.5 transition-all ${
                            st.isCurrent
                              ? 'bg-amber-50/70 border border-amber-200/90 rounded-2xl p-3.5 shadow-2xs'
                              : st.isUpcoming
                              ? 'opacity-65 py-0.5'
                              : 'py-0.5'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <h5
                              className={`text-xs font-bold ${
                                st.isCurrent
                                  ? 'text-amber-950 font-extrabold'
                                  : st.isUpcoming
                                  ? 'text-stone-400'
                                  : 'text-stone-900'
                              }`}
                            >
                              {st.num}. {st.title}
                            </h5>

                            {/* Badge */}
                            {st.status === 'Completed' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/90 px-2 py-0.5 rounded-full shadow-2xs">
                                <Check className="w-3 h-3 stroke-[3]" />
                                <span>Completed</span>
                              </span>
                            )}

                            {st.status === 'Out for Delivery' && (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-900 bg-amber-200/90 border border-amber-300 px-2.5 py-0.5 rounded-full shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping shrink-0" />
                                <span>Out for Delivery</span>
                              </span>
                            )}

                            {st.status === 'In Transit' && (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-purple-900 bg-purple-100 border border-purple-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping shrink-0" />
                                <span>In Transit</span>
                              </span>
                            )}

                            {st.status === 'Ready for Dispatch' && (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-900 bg-indigo-100 border border-indigo-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping shrink-0" />
                                <span>Ready for Dispatch</span>
                              </span>
                            )}

                            {st.status === 'In Progress' && (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-900 bg-amber-200/90 border border-amber-300 px-2.5 py-0.5 rounded-full shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping shrink-0" />
                                <span>In Progress</span>
                              </span>
                            )}

                            {st.status === 'Pending' && (
                              <span className="text-[10px] font-medium text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200/60 shadow-2xs">
                                Pending
                              </span>
                            )}
                          </div>

                          <p
                            className={`text-xs leading-relaxed ${
                              st.isCurrent
                                ? 'text-amber-950 font-medium'
                                : st.isUpcoming
                                ? 'text-stone-400'
                                : 'text-stone-600'
                            }`}
                          >
                            {st.desc}
                          </p>

                          {/* AWB Tag if present */}
                          {st.awb && (
                            <div className="pt-0.5 flex items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-purple-900 font-mono text-[11px] font-bold shadow-2xs">
                                <Truck className="w-3 h-3 text-purple-700 shrink-0" />
                                <span>AWB: {st.awb}</span>
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleCopyId(st.awb || '', e)}
                                className="px-2 py-1 rounded-lg bg-white border border-stone-200 text-stone-600 hover:text-purple-700 hover:border-purple-200 text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                title="Copy tracking number"
                              >
                                {copiedId === st.awb ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span className="text-emerald-700 font-bold">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}

                          {/* Date and Time */}
                          {st.timestamp && (
                            <div
                              className={`flex items-center gap-1.5 text-[11px] pt-0.5 ${
                                st.isCurrent
                                  ? 'text-amber-900/80 font-semibold'
                                  : 'text-stone-500 font-medium'
                              }`}
                            >
                              <Clock className="w-3 h-3 text-stone-400 shrink-0" />
                              <span>{st.timestamp}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
            </div>

            {/* Modal Footer (Fixed at bottom) */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3 shrink-0">
              {(activeTrackOrder?.status || '').toUpperCase() === 'DELIVERED' ? (
                <button
                  type="button"
                  onClick={() => {
                    const orderToReview = activeTrackOrder;
                    setSelectedTrackOrder(null);
                    setSelectedReviewOrder(orderToReview);
                    setReviewSubmitted(false);
                    setReviewComment('');
                    setReviewRating(5);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Star className="w-3.5 h-3.5 fill-white text-white" />
                  <span>{t('Rate & Review Product', 'उत्पाद की समीक्षा करें')}</span>
                </button>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={() => setSelectedTrackOrder(null)}
                className="px-5 py-2 rounded-xl bg-[#5B0D15] hover:bg-[#480a11] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
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

      {/* ================= PRODUCT DETAILS MODAL (from Orders Tab Image / Buy Now Click) ================= */}
      {selectedProductDetail && (() => {
        const cartItem = items.find((i) => i.id === selectedProductDetail.id);
        const qtyInCart = cartItem ? cartItem.quantity : 0;

        return (
          <div
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-hidden animate-fadeIn modal-backdrop-contain overscroll-contain"
            role="dialog"
            aria-modal="true"
            onClick={() => setSelectedProductDetail(null)}
          >
            {/* Modal Container with Contained Height & Width */}
            <div
              data-lenis-prevent="true"
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl h-[88dvh] sm:h-[84vh] max-h-[88dvh] sm:max-h-[84vh] bg-[#FAF7F2] rounded-3xl border border-amber-300/80 shadow-2xl flex flex-col md:flex-row overflow-hidden my-auto overscroll-contain modal-scroll-container"
            >
              {/* Modal Close Button */}
              <button
                type="button"
                onClick={() => setSelectedProductDetail(null)}
                className="absolute top-3.5 right-3.5 z-40 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-stone-900/80 hover:bg-stone-900 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xl border border-white/20"
                aria-label="Close product view"
                title={t('Close (Esc)', 'बंद करें (Esc)')}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Product Image Side - Contained & balanced */}
              <div className="relative w-full md:w-5/12 h-36 sm:h-48 md:h-auto min-h-[140px] md:min-h-full shrink-0 overflow-hidden bg-stone-100">
                <Image
                  src={selectedProductDetail.image}
                  alt={t(selectedProductDetail.name, selectedProductDetail.nameHi || selectedProductDetail.name)}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 42vw"
                  className="object-cover object-center w-full h-full select-none"
                />
              </div>

              {/* Details & Actions Side: Flex column with scrollable details body + fixed pinned footer at the bottom */}
              <div className="w-full md:w-7/12 flex flex-col flex-1 h-full min-h-0 bg-[#FAF7F2] border-t md:border-t-0 md:border-l border-amber-200/80 overflow-hidden">
                {/* Scrollable details body */}
                <div
                  data-lenis-prevent="true"
                  className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 md:p-6 space-y-2.5 modal-scroll-container"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between pr-8">
                      {selectedProductDetail.tag ? (
                        <span className="text-[11px] font-bold tracking-[0.2em] text-[#800000] uppercase block">
                          {t(selectedProductDetail.tag, selectedProductDetail.tagHi || selectedProductDetail.tag)}
                        </span>
                      ) : <span />}
                      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {t('Govt Lab Certified', 'सरकारी लैब द्वारा प्रमाणित')}
                      </span>
                    </div>

                    <h3 className="font-bold text-lg sm:text-2xl text-[#1E2229] tracking-tight leading-snug">
                      {formatTitleCase(t(selectedProductDetail.name, selectedProductDetail.nameHi || selectedProductDetail.name))}
                    </h3>

                    {/* Product Rating: ONLY small light stars, NO text, NO numbers */}
                    <div className="flex items-center gap-1 py-0.5" title="Sacred Blessing Rating">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            s <= Math.round(selectedProductDetail.rating || 5)
                              ? 'fill-amber-300 text-amber-400 stroke-amber-400/80'
                              : 'fill-stone-200 text-stone-300 stroke-stone-300'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Price Row & In-Cart Badge */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="product-price-style text-2xl sm:text-3xl font-bold">
                        {selectedProductDetail.price}
                      </span>
                      {selectedProductDetail.originalPrice && (
                        <span className="text-xs sm:text-sm text-stone-400 line-through">
                          {selectedProductDetail.originalPrice}
                        </span>
                      )}
                      {qtyInCart > 0 && (
                        <span className="text-[11px] font-bold text-[#800000] bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-300/60 animate-pulse">
                          {qtyInCart} {t('in sacred cart', 'कार्ट में')}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-stone-700 text-xs sm:text-sm leading-relaxed line-clamp-3">
                      {t(selectedProductDetail.desc, selectedProductDetail.descHi || selectedProductDetail.desc)}
                    </p>

                    {/* 4 Sacred Specifications Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200/80">
                        <span className="text-stone-500 text-[10px] uppercase font-bold block">{t('Active Planetary Influence', 'सक्रिय ग्रह प्रभाव')}</span>
                        <span className="font-semibold text-stone-900 text-xs truncate block">
                          {t(selectedProductDetail.planet, selectedProductDetail.planetHi || selectedProductDetail.planet)}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200/80">
                        <span className="text-stone-500 text-[10px] uppercase font-bold block">{t('Active Chakra', 'सक्रिय चक्र')}</span>
                        <span className="font-semibold text-stone-900 text-xs truncate block">
                          {t(selectedProductDetail.chakra, selectedProductDetail.chakraHi || selectedProductDetail.chakra)}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200/80">
                        <span className="text-stone-500 text-[10px] uppercase font-bold block">{t('Auspicious Day', 'शुभ धारण वार')}</span>
                        <span className="font-semibold text-stone-900 text-xs truncate block">
                          {t(selectedProductDetail.dayToWear, selectedProductDetail.dayToWearHi || selectedProductDetail.dayToWear)}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200/80">
                        <span className="text-stone-500 text-[10px] uppercase font-bold block">{t('Bead Spec', 'मनका विवरण')}</span>
                        <span className="font-semibold text-stone-900 text-xs truncate block">
                          {t(selectedProductDetail.beadSize, selectedProductDetail.beadSizeHi || selectedProductDetail.beadSize)}
                        </span>
                      </div>
                    </div>

                    {/* Product-Specific Sacred Energizing Mantra Container */}
                    <div className="p-2.5 sm:p-3 rounded-2xl bg-amber-50/90 border border-amber-300/80 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-bold text-[#800000] uppercase tracking-wider flex items-center gap-1.5 font-serif">
                          {t('Energizing Beej Mantra', 'धारण एवं सिद्ध बीज मंत्र')}
                        </span>
                        <span className="text-[10px] font-semibold text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded-full border border-amber-300/60">
                          {t('108 Chants', '108 जाप')}
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-white border border-amber-200/90 text-center shadow-2xs">
                        <p className="font-serif font-bold text-xs sm:text-[13px] text-[#5B0D15] tracking-wide select-all">
                          {selectedProductDetail.mantra}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-stone-600 px-0.5">
                        <span className="truncate">
                          <span className="text-amber-700 font-bold">• {t('Muhurta:', 'शुभ मुहूर्त:')} </span>
                          <span>{t(selectedProductDetail.dayToWear, selectedProductDetail.dayToWearHi || selectedProductDetail.dayToWear)}</span>
                        </span>
                        <span className="shrink-0 text-[10px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70">
                          {t('Chant while wearing', 'धारण करते समय जपें')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PINNED FIXED BOTTOM BAR - BUTTONS AT THE BOTTOM, ALWAYS VISIBLE IN VIEWPORT WITHOUT SCROLLING */}
                <div className="shrink-0 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-amber-200/80 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] z-20">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    {qtyInCart === 0 ? (
                      <button
                        type="button"
                        onClick={() => {
                          addItem(selectedProductDetail, 1);
                        }}
                        className="flex-1 h-[44px] px-5 rounded-full bg-[#800000] hover:bg-[#5B0D15] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg active:scale-98"
                      >
                        <ShoppingCart className="w-4 h-4 text-amber-300" />
                        <span>{t('Add to Cart', 'कार्ट में जोड़ें')}</span>
                      </button>
                    ) : (
                      /* Clean (- 1 +) Stepper matching product card */
                      <div className="flex-1 h-[44px] flex items-center justify-between bg-[#5B0D15] text-white rounded-full px-3 shadow-md border border-amber-400/40">
                        <button
                          type="button"
                          onClick={() => {
                            if (qtyInCart <= 1) {
                              removeItem(selectedProductDetail.id);
                            } else {
                              updateQuantity(selectedProductDetail.id, qtyInCart - 1);
                            }
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 text-white font-bold cursor-pointer transition-colors active:scale-90"
                          aria-label={t('Decrease quantity', 'मात्रा घटाएं')}
                        >
                          <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>

                        <span className="min-w-[32px] px-2 text-center font-extrabold text-sm text-amber-200 select-none">
                          {qtyInCart}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            updateQuantity(selectedProductDetail.id, qtyInCart + 1);
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 text-white font-bold cursor-pointer transition-colors active:scale-90"
                          aria-label={t('Increase quantity', 'मात्रा बढ़ाएं')}
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (qtyInCart === 0) {
                          addItem(selectedProductDetail, 1);
                        }
                        setSelectedProductDetail(null);
                        router.push('/cart');
                      }}
                      className="flex-1 py-2.5 sm:py-3 px-5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:via-amber-400 hover:to-amber-500 text-[#2A0E13] font-serif font-bold text-xs sm:text-sm shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer group border border-amber-300/60"
                    >
                      <span>
                        {qtyInCart > 0 ? t('Proceed to Checkout', 'चेकआउट पर जाएं') : t('Instant Checkout', 'तुरंत ऑर्डर करें')}
                      </span>
                      <ArrowRight className="w-4 h-4 text-[#2A0E13] group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default DashboardOrdersTab;
