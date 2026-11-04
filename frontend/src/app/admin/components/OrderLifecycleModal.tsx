import React, { useState, useEffect } from 'react';
import { useScrollLock } from '../../../lib/scrollLock';
import {
  Package,
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Copy,
  Check,
  CreditCard,
  Truck,
  ChevronDown,
  ChevronUp,
  Wallet,
  Settings,
  Calendar,
  Trash2,
  Eye,
} from 'lucide-react';
import { getFulfillmentStatusInfo, getPaymentStatusInfo } from './AdminOrdersTab';
import { resolveProductImage } from '../../dashboard/utils';

interface OrderLifecycleModalProps {
  activeOrder: any | null;
  orderStatusNotes: string;
  setOrderStatusNotes: (s: string) => void;
  orderStatusError: string | null;
  orderStatusUpdating: boolean;
  onTransitionOrderStatus: (status: string, extraData?: { courierName?: string; trackingNumber?: string }) => void;
  onClose: () => void;
  onDeleteOrder?: (order: any) => void;
}

export default function OrderLifecycleModal({
  activeOrder,
  orderStatusNotes,
  setOrderStatusNotes,
  orderStatusError,
  orderStatusUpdating,
  onTransitionOrderStatus,
  onClose,
  onDeleteOrder,
}: OrderLifecycleModalProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [courierNameInput, setCourierNameInput] = useState<string>('');
  const [trackingNumberInput, setTrackingNumberInput] = useState<string>('');
  const [shippingInputError, setShippingInputError] = useState<string | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<{
    id: string | number;
    title: string;
    category: string;
    image: string;
    isCertified: boolean;
    qty: number;
    unitPrice: number;
    totalPrice: number;
    description?: string;
    energizedBy?: string;
    sku?: string | null;
  } | null>(null);

  // Reset hovered product when activeOrder changes
  useEffect(() => {
    setHoveredProduct(null);
  }, [activeOrder?.id]);

  // Synchronize courier fields whenever activeOrder changes
  useEffect(() => {
    if (activeOrder) {
      setCourierNameInput(
        activeOrder.courierName ||
          activeOrder.shippingAddress?.courierName ||
          activeOrder.shippingAddress?.courier ||
          '',
      );
      setTrackingNumberInput(
        activeOrder.trackingNumber ||
          activeOrder.shippingAddress?.trackingNumber ||
          activeOrder.shippingAddress?.awbNumber ||
          '',
      );
      setShippingInputError(null);
    }
  }, [activeOrder]);

  // Lock body scroll and prevent background scroll chaining
  useScrollLock(Boolean(activeOrder));

  useEffect(() => {
    if (!activeOrder) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeOrder, onClose]);

  if (!activeOrder) return null;

  const fulfillment = getFulfillmentStatusInfo(activeOrder.status);
  const payment = getPaymentStatusInfo(activeOrder.paymentStatus, activeOrder.status, activeOrder.isDemoOrder);

  const handleCopy = (text: string) => {
    if (!text) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (err) {}
    }
    setCopiedText(text);
    setTimeout(() => setCopiedText((prev) => (prev === text ? null : prev)), 2000);
  };

  const orderRef = activeOrder.orderReference || (activeOrder.id ? `#ORD-${activeOrder.id.slice(0, 8).toUpperCase()}` : '#ORD-N/A');
  const itemsCount = activeOrder.itemCount || activeOrder.items?.reduce((s: number, i: any) => s + (i.quantity || 1), 0) || 1;
  const subtotal = activeOrder.items?.reduce((sum: number, it: any) => sum + ((it.purchasePrice || it.price || 0) * (it.quantity || 1)), 0) || activeOrder.totalAmount;

  const recipientName = activeOrder.shippingAddress?.recipient || activeOrder.customer?.name || 'Customer';
  const recipientEmail = activeOrder.customer?.email || 'N/A';
  const recipientPhone = activeOrder.shippingAddress?.phone || activeOrder.customer?.phone || 'No phone recorded';

  const placedDate = activeOrder.createdAt
    ? new Date(activeOrder.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Oct 31, 2026';

  const paymentMethodText =
    activeOrder.paymentMethod === 'COD' || activeOrder.paymentMethod === 'cash_on_delivery'
      ? 'Cash on Delivery'
      : activeOrder.paymentMethod === 'WALLET'
      ? 'Spiritual Wallet'
      : 'Demo Online Payment';

  const itemsToRender =
    activeOrder.items && activeOrder.items.length > 0
      ? activeOrder.items
      : [
          {
            productName: activeOrder.productName || 'BLACK TOURMALINE BRACELET',
            productCategory: 'Gemstone',
            labCertified: true,
            quantity: activeOrder.itemCount || 1,
            lineTotal: activeOrder.totalAmount,
            image: '/products/prod-black-tourmaline.png',
          },
        ];

  const isTerminalState = activeOrder.status === 'DELIVERED' || activeOrder.status === 'CANCELLED';

  return (
    <div
      data-lenis-prevent="true"
      onWheel={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-3 overflow-y-auto overscroll-contain modal-backdrop-contain animate-fadeIn"
    >
      {/* Modal Dialog Container */}
      <div className="relative w-full max-w-4xl max-h-[calc(100dvh-20px)] flex flex-col rounded-3xl bg-[#FAF8F5] border border-amber-200/90 shadow-2xl overflow-hidden text-[#3B1E22]">
        
        {/* Header - Spacious Burgundy Bar matching reference */}
        <div className="px-6 py-3.5 bg-[#550E17] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#6B1B24] border border-amber-300/30 text-amber-200 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-amber-50 tracking-wide leading-tight">
                Order Fulfillment &amp; Lifecycle
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-amber-200/90 font-mono">Ref: {orderRef}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(orderRef)}
                  className="text-amber-200/80 hover:text-white transition-colors cursor-pointer"
                  title="Copy Order Reference"
                >
                  {copiedText === orderRef ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-amber-200/85">
              <Calendar className="w-3.5 h-3.5" />
              <span>Placed {placedDate}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close modal (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body - Sensibly spaced and calibrated to fit desktop viewport without scrollbar */}
        <div
          data-lenis-prevent="true"
          className="p-3 sm:p-3.5 overflow-y-auto overscroll-contain modal-scroll-container space-y-2 flex-1 text-xs"
        >
          {orderStatusError && (
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{orderStatusError}</span>
            </div>
          )}

          {/* Row 1: Three Summary Cards matching visual reference */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {/* Card 1: Final Total */}
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white border border-amber-200/70 shadow-xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FDF4E7] text-[#C27827] flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4 text-[#C27827]" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-medium text-stone-500 block leading-tight">Final Total</span>
                <span className="font-serif font-black text-sm sm:text-base text-[#550E17] block truncate leading-tight mt-0.5">
                  ₹{Number(activeOrder.totalAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Card 2: Payment Status */}
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white border border-amber-200/70 shadow-xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FDF4E7] text-[#C27827] flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4 text-[#C27827]" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-medium text-stone-500 block leading-tight">Payment Status</span>
                <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5 truncate leading-tight mt-0.5">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    payment.label.toLowerCase().includes('paid') ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />
                  {payment.label}
                </span>
              </div>
            </div>

            {/* Card 3: Items */}
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white border border-amber-200/70 shadow-xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FDF4E7] text-[#C27827] flex items-center justify-center shrink-0">
                <Package className="w-4 h-4 text-[#C27827]" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-medium text-stone-500 block leading-tight">Items</span>
                <span className="text-xs font-bold text-stone-900 block truncate leading-tight mt-0.5">
                  {itemsCount} {itemsCount === 1 ? 'unit' : 'units'}
                </span>
              </div>
            </div>
          </div>

          {/* Row 2: Well-spaced Financial Summary Row */}
          <div className="py-2 px-4 sm:px-6 rounded-2xl bg-white border border-amber-200/70 shadow-xs grid grid-cols-3 divide-x divide-stone-200/70 text-xs">
            {/* Subtotal */}
            <div className="text-center sm:text-left pr-2 sm:pr-4">
              <span className="text-[10px] font-medium text-stone-500 block">Subtotal</span>
              <span className="font-serif font-black text-xs sm:text-sm text-[#550E17] block mt-0.5">
                ₹{Number(subtotal).toLocaleString('en-IN')}
              </span>
            </div>

            {/* Shipping & Consecration */}
            <div className="px-2 sm:px-4 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1 text-[10px] font-medium text-stone-600">
                <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Shipping &amp; Consecration</span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-emerald-600 block mt-0.5">
                Free Delivery
              </span>
            </div>

            {/* Payment Method */}
            <div className="pl-2 sm:pl-4 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1 text-[10px] font-medium text-stone-600">
                <CreditCard className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                <span>Payment Method</span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-stone-900 block mt-0.5">
                {paymentMethodText}
              </span>
            </div>
          </div>

          {/* Row 3: Customer & Delivery Address Card */}
          <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
            <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-stone-100">
              <UserIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-sans font-semibold text-stone-500 uppercase tracking-wider">
                Customer &amp; Attendee Information
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Left Column: Customer Details */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#5B0D15]/10 border border-[#5B0D15]/20 text-[#5B0D15] font-bold text-xs flex items-center justify-center shrink-0">
                    {(recipientName || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-serif font-bold text-stone-900 text-sm sm:text-[15px] leading-tight tracking-tight capitalize truncate" title={recipientName}>
                      {recipientName}
                    </p>
                    <span className="text-[10px] font-sans text-stone-400 block leading-none mt-0.5">
                      Verified Customer
                    </span>
                  </div>
                </div>

                <div className="space-y-1 pl-9">
                  <p className="text-stone-600 flex items-center gap-1.5 text-xs font-sans">
                    <Mail className="w-3 h-3 text-stone-400 shrink-0" />
                    <span className="truncate">{recipientEmail}</span>
                  </p>
                  <p className="text-stone-700 flex items-center gap-1.5 text-xs font-mono font-medium">
                    <Phone className="w-3 h-3 text-stone-400 shrink-0" />
                    <span>{recipientPhone}</span>
                  </p>
                </div>
              </div>

              {/* Right Column: Delivery Address */}
              <div className="sm:border-l sm:border-stone-200/70 sm:pl-3.5">
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-sans font-semibold text-stone-500 uppercase tracking-wider mb-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C27827] shrink-0" />
                  <span>Delivery Address</span>
                </div>
                <p className="text-stone-700 leading-snug text-xs font-sans">
                  {activeOrder.shippingAddress?.addressLine || activeOrder.shippingAddress?.street || 'Address on file'}
                  <br />
                  {activeOrder.shippingAddress?.city ? `${activeOrder.shippingAddress.city}, ` : ''}
                  {activeOrder.shippingAddress?.state ? `${activeOrder.shippingAddress.state} - ` : ''}
                  <span className="font-mono font-medium text-stone-900">{activeOrder.shippingAddress?.pincode || activeOrder.shippingAddress?.postalCode || ''}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Row 4: Ordered Products Card */}
          <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-amber-200/70 shadow-xs">
            <div className="flex items-center justify-between gap-1.5 mb-1.5">
              <div className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#A85A28]" />
                <span className="text-xs font-bold text-stone-900">
                  Ordered Products ({itemsCount})
                </span>
              </div>
              <span className="text-[10px] text-stone-400 font-normal flex items-center gap-1">
                <Eye className="w-3 h-3 text-stone-400" />
                <span>Hover to inspect details</span>
              </span>
            </div>

            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {itemsToRender.map((item: any, idx: number) => {
                const itemImg = resolveProductImage(item);
                const itemTitle = item.productName || item.product?.name || 'BLACK TOURMALINE BRACELET';
                const itemCategory = item.productCategory || item.product?.categoryLabel || item.product?.category || 'Gemstone';
                const isCertified = item.labCertified || item.product?.labCertified !== false;
                const itemQty = item.quantity || 1;
                const itemPrice =
                  item.lineTotal ||
                  (item.purchasePrice || item.price || 0) * itemQty ||
                  activeOrder.totalAmount;
                const unitPrice =
                  item.purchasePrice ||
                  item.price ||
                  (itemQty > 0 ? itemPrice / itemQty : itemPrice);
                const isHovered = hoveredProduct?.id === (item.id || idx);

                return (
                  <div
                    key={idx}
                    onMouseEnter={() =>
                      setHoveredProduct({
                        id: item.id || idx,
                        title: itemTitle,
                        category: itemCategory,
                        image: itemImg,
                        isCertified,
                        qty: itemQty,
                        unitPrice,
                        totalPrice: itemPrice,
                        description: item.product?.description || item.description || '',
                        energizedBy:
                          item.product?.energizedBy ||
                          (item.consecrationDetails ? 'Sanctified & Vedic Energized' : 'Consecrated by Vedic Priests'),
                        sku:
                          item.product?.sku ||
                          item.sku ||
                          (item.productId ? `PRD-${item.productId.slice(0, 8).toUpperCase()}` : null),
                      })
                    }
                    onMouseLeave={() => setHoveredProduct(null)}
                    className={`flex items-center justify-between gap-3 text-xs py-1.5 px-2 rounded-xl cursor-pointer border transition-all ${
                      isHovered
                        ? 'bg-stone-100/90 border-stone-300 shadow-2xs'
                        : 'hover:bg-stone-50/70 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-stone-100 border border-stone-200/80 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                        {itemImg ? (
                          <img
                            src={itemImg}
                            alt={itemTitle}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/products/prod-tiger-eye-macro.jpg';
                            }}
                          />
                        ) : (
                          <Package className="w-5 h-5 text-stone-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-stone-900 text-xs uppercase tracking-wide truncate" title={itemTitle}>
                          {itemTitle}
                        </p>
                        <p className="text-[10px] text-stone-500 truncate">
                          {itemCategory}
                          {isCertified && ' • Certified'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-xs text-stone-700 font-medium">Qty: {itemQty}</span>
                      <span className="font-serif font-black text-xs sm:text-sm text-[#550E17]">
                        ₹{Number(itemPrice).toLocaleString('en-IN')}
                      </span>
                      <Eye className={`w-3.5 h-3.5 transition-colors ${isHovered ? 'text-amber-800' : 'text-stone-300'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>


          {/* Row 5b: Consignment & Courier Tracking Pill if already dispatched */}
          {(activeOrder.courierName ||
            activeOrder.trackingNumber ||
            activeOrder.shippingAddress?.courierName ||
            activeOrder.shippingAddress?.trackingNumber) && (
            <div className="p-2 sm:p-2.5 rounded-2xl bg-purple-50/80 border border-purple-200/90 flex items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4 text-purple-700" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block leading-tight">
                    Courier Consignment / AWB
                  </span>
                  <span className="text-xs font-bold text-purple-950 block truncate mt-0.5">
                    {activeOrder.courierName || activeOrder.shippingAddress?.courierName || 'Sacred Express'}
                    {' • '}
                    <span className="font-mono text-purple-900">
                      {activeOrder.trackingNumber || activeOrder.shippingAddress?.trackingNumber}
                    </span>
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    activeOrder.trackingNumber || activeOrder.shippingAddress?.trackingNumber || '',
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-purple-800 text-[11px] font-semibold hover:bg-purple-100/60 flex items-center gap-1 cursor-pointer transition-colors shrink-0 shadow-2xs"
              >
                {copiedText ===
                (activeOrder.trackingNumber || activeOrder.shippingAddress?.trackingNumber) ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>Copy AWB</span>
              </button>
            </div>
          )}

          {/* Row 6: Static-Height Fulfillment Section OR Product Details Hover Preview */}
          <div
            className={`p-2.5 sm:p-3 rounded-2xl shadow-xs relative overflow-hidden flex flex-col justify-between transition-colors duration-150 ${
              hoveredProduct
                ? 'bg-gradient-to-br from-[#FAF9F7] via-[#F5F4F1] to-[#EFECE6] border border-stone-300/90'
                : 'bg-[#FFF9EE] border border-amber-300/80'
            } ${
              activeOrder.status === 'PACKED'
                ? 'h-[215px] min-h-[215px] max-h-[215px]'
                : 'h-[148px] min-h-[148px] max-h-[148px]'
            }`}
          >
            {hoveredProduct ? (
              <div className="h-full flex flex-col justify-between select-none animate-in fade-in duration-75">
                {/* Header: Logical categorization & status */}
                <div className="flex items-center justify-between gap-2 border-b border-stone-200/90 pb-1 shrink-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider bg-stone-200/80 text-stone-700">
                      {hoveredProduct.category}
                    </span>
                    {hoveredProduct.isCertified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        100% Lab Certified
                      </span>
                    )}
                    {hoveredProduct.sku && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-stone-500 bg-white/80 border border-stone-200/60">
                        {hoveredProduct.sku}
                      </span>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-sans font-bold bg-rose-50 text-rose-800 border border-rose-200/80 shrink-0">
                    <Eye className="w-2.5 h-2.5 text-rose-600" />
                    <span>Product Preview</span>
                  </span>
                </div>

                {/* Main Product Info (Image + Title + Sanctification + Price) */}
                <div className="flex items-center gap-3 py-0.5 min-w-0">
                  <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-xl bg-white border border-stone-200/90 shadow-2xs shrink-0 overflow-hidden flex items-center justify-center p-0.5">
                    {hoveredProduct.image ? (
                      <img
                        src={hoveredProduct.image}
                        alt={hoveredProduct.title}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/products/prod-tiger-eye-macro.jpg';
                        }}
                      />
                    ) : (
                      <Package className="w-6 h-6 text-stone-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-1">
                    <h4
                      className="font-serif font-bold text-stone-900 text-xs sm:text-[14px] leading-snug tracking-tight truncate uppercase"
                      title={hoveredProduct.title}
                    >
                      {hoveredProduct.title}
                    </h4>

                    {hoveredProduct.energizedBy && (
                      <div className="flex items-center gap-1.5 text-[11px] font-sans font-semibold text-[#6E141D] mt-0.5 truncate">
                        <Sparkles className="w-3 h-3 text-[#99202D] shrink-0" />
                        <span className="truncate">{hoveredProduct.energizedBy}</span>
                      </div>
                    )}

                    <p className="text-[11px] font-sans text-stone-500 line-clamp-1 italic font-normal mt-0.5 leading-normal truncate">
                      {hoveredProduct.description || 'Authentic consecrated artifact prepared in sacred sanctum.'}
                    </p>
                  </div>

                  {/* Price & Quantity Block */}
                  <div className="text-right shrink-0 border-l border-stone-200/90 pl-3 min-w-[85px] sm:min-w-[105px]">
                    <span className="text-[10px] font-sans text-stone-500 font-medium block leading-tight">
                      Total ({hoveredProduct.qty}x)
                    </span>
                    <span className="font-serif font-extrabold text-sm sm:text-base text-[#5B0D15] block tabular-nums leading-tight">
                      ₹{Number(hoveredProduct.totalPrice).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] font-mono text-stone-400 block tabular-nums leading-tight mt-0.5">
                      ₹{Number(hoveredProduct.unitPrice).toLocaleString('en-IN')}/ea
                    </span>
                  </div>
                </div>

                {/* Footer Bar: Subtle Hint & Close Action */}
                <div className="flex items-center justify-between pt-1 border-t border-stone-200/80 text-[10px] text-stone-400 shrink-0">
                  <span className="italic flex items-center gap-1">
                    <Eye className="w-3 h-3 text-stone-400 shrink-0" />
                    <span>Move cursor away to restore fulfillment controls</span>
                  </span>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-0.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-[11px] font-semibold cursor-pointer shadow-2xs transition-colors shrink-0"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-between space-y-2 select-none">
                <div className="flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <Settings className="w-3.5 h-3.5 text-[#A85A28]" />
                    <span className="text-xs font-bold text-stone-800">
                      Fulfillment Lifecycle Stage
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FDECC8] text-[#9A520E] border border-[#FCD98B]">
                      ● {fulfillment.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-stone-500">
                    Stage {activeOrder.status === 'PENDING' || activeOrder.status === 'PENDING_PAYMENT' || activeOrder.status === 'ORDER_PLACED' ? '1/5: Order Placed' : activeOrder.status === 'CONFIRMED' ? '2/5: Order Confirmed' : activeOrder.status === 'PROCESSING' || activeOrder.status === 'PACKED' ? '3/5: Preparation & Sanctification' : activeOrder.status === 'SHIPPED' || activeOrder.status === 'OUT_FOR_DELIVERY' ? '4/5: Shipped & On the Way' : activeOrder.status === 'DELIVERED' ? '5/5: Delivered' : 'Cancelled'}
                  </span>
                </div>

                {/* Courier & Tracking Input (Required when status is PACKED to move to SHIPPED) */}
                {activeOrder.status === 'PACKED' && (
                  <div className="p-2 rounded-xl bg-purple-50/90 border border-purple-200/90 space-y-1.5 shrink-0">
                    <div className="flex items-center gap-1.5 text-purple-950 font-bold text-xs">
                      <Truck className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                      <span>Courier &amp; Tracking / AWB Information (Required for Dispatch)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-stone-600 block mb-0.5">
                          Courier Service Name *
                        </label>
                        <input
                          type="text"
                          value={courierNameInput}
                          onChange={(e) => {
                            setCourierNameInput(e.target.value);
                            setShippingInputError(null);
                          }}
                          placeholder="e.g. BlueDart Express, Delhivery, DTDC"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs text-stone-800 focus:outline-none focus:ring-1.5 focus:ring-purple-500 shadow-2xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-stone-600 block mb-0.5">
                          Tracking / AWB Number *
                        </label>
                        <input
                          type="text"
                          value={trackingNumberInput}
                          onChange={(e) => {
                            setTrackingNumberInput(e.target.value);
                            setShippingInputError(null);
                          }}
                          placeholder="e.g. BD-99482019"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-mono text-stone-800 focus:outline-none focus:ring-1.5 focus:ring-purple-500 shadow-2xs"
                        />
                      </div>
                    </div>
                    {shippingInputError && (
                      <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                        <span>{shippingInputError}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Optional Remarks Input with placeholder matching reference */}
                {!isTerminalState && (
                  <input
                    type="text"
                    value={orderStatusNotes}
                    onChange={(e) => setOrderStatusNotes(e.target.value)}
                    placeholder="Add optional fulfillment remarks..."
                    className="w-full px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs placeholder:text-stone-400 focus:outline-none focus:ring-1.5 focus:ring-amber-500 shadow-2xs shrink-0"
                  />
                )}

                {/* Action Buttons styled matching visual reference */}
                <div className="flex items-center justify-between gap-3 pt-0.5 shrink-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* 1. Order Placed -> Confirm Order */}
                    {(activeOrder.status === 'PENDING' ||
                      activeOrder.status === 'PENDING_PAYMENT' ||
                      activeOrder.status === 'ORDER_PLACED') && (
                      <>
                        <button
                          type="button"
                          disabled={orderStatusUpdating}
                          onClick={() => onTransitionOrderStatus('CONFIRMED')}
                          className="px-4 py-1.5 rounded-xl bg-[#0066FF] hover:bg-[#0055D4] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                        >
                          {orderStatusUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          <span>Accept &amp; Confirm Order</span>
                        </button>
                        <button
                          type="button"
                          disabled={orderStatusUpdating}
                          onClick={() => onTransitionOrderStatus('CANCELLED')}
                          className="px-4 py-1.5 rounded-xl bg-[#E60039] hover:bg-[#CC0033] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Cancel Order</span>
                        </button>
                      </>
                    )}

                    {/* 2. Confirmed -> Start Processing */}
                    {activeOrder.status === 'CONFIRMED' && (
                      <>
                        <button
                          type="button"
                          disabled={orderStatusUpdating}
                          onClick={() => onTransitionOrderStatus('PROCESSING')}
                          className="px-4 py-1.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                        >
                          {orderStatusUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Settings className="w-3.5 h-3.5" />}
                          <span>Start Product Preparing &amp; Packaging</span>
                        </button>
                        <button
                          type="button"
                          disabled={orderStatusUpdating}
                          onClick={() => onTransitionOrderStatus('CANCELLED')}
                          className="px-4 py-1.5 rounded-xl bg-[#E60039] hover:bg-[#CC0033] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Cancel Order</span>
                        </button>
                      </>
                    )}

                    {/* 3. Processing -> Mark Packing Complete */}
                    {activeOrder.status === 'PROCESSING' && (
                      <>
                        <button
                          type="button"
                          disabled={orderStatusUpdating}
                          onClick={() => onTransitionOrderStatus('PACKED')}
                          className="px-4 py-1.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                        >
                          {orderStatusUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Package className="w-3.5 h-3.5" />}
                          <span>Mark Packing Complete</span>
                        </button>
                        <button
                          type="button"
                          disabled={orderStatusUpdating}
                          onClick={() => onTransitionOrderStatus('CANCELLED')}
                          className="px-4 py-1.5 rounded-xl bg-[#E60039] hover:bg-[#CC0033] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Cancel Order</span>
                        </button>
                      </>
                    )}

                    {/* 4. Packed -> Ship Order (Courier & Tracking required) */}
                    {activeOrder.status === 'PACKED' && (
                      <>
                        <button
                          type="button"
                          disabled={orderStatusUpdating}
                          onClick={() => {
                            if (!courierNameInput.trim() || !trackingNumberInput.trim()) {
                              setShippingInputError('Courier service partner and tracking/AWB number are required before dispatching.');
                              return;
                            }
                            setShippingInputError(null);
                            onTransitionOrderStatus('SHIPPED', {
                              courierName: courierNameInput.trim(),
                              trackingNumber: trackingNumberInput.trim(),
                            });
                          }}
                          className="px-4 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                        >
                          {orderStatusUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Truck className="w-3.5 h-3.5" />}
                          <span>Dispatch &amp; Ship Order</span>
                        </button>
                        <button
                          type="button"
                          disabled={orderStatusUpdating}
                          onClick={() => onTransitionOrderStatus('CANCELLED')}
                          className="px-4 py-1.5 rounded-xl bg-[#E60039] hover:bg-[#CC0033] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Cancel Order</span>
                        </button>
                      </>
                    )}

                    {/* 5. Shipped -> Out for Delivery */}
                    {activeOrder.status === 'SHIPPED' && (
                      <button
                        type="button"
                        disabled={orderStatusUpdating}
                        onClick={() => onTransitionOrderStatus('OUT_FOR_DELIVERY')}
                        className="px-4 py-1.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                      >
                        {orderStatusUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Truck className="w-3.5 h-3.5" />}
                        <span>Mark Out for Delivery</span>
                      </button>
                    )}

                    {/* 6. Out for Delivery -> Mark Delivered */}
                    {activeOrder.status === 'OUT_FOR_DELIVERY' && (
                      <button
                        type="button"
                        disabled={orderStatusUpdating}
                        onClick={() => onTransitionOrderStatus('DELIVERED')}
                        className="px-4 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                      >
                        {orderStatusUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>Mark as Delivered to Customer</span>
                      </button>
                    )}

                    {/* 7. Delivered (Terminal State) */}
                    {activeOrder.status === 'DELIVERED' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100/80 text-emerald-800 text-xs font-bold border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Order Completed &amp; Delivered</span>
                      </span>
                    )}

                    {/* Cancelled State */}
                    {activeOrder.status === 'CANCELLED' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-100 text-stone-600 text-xs font-bold border border-stone-200">
                        <X className="w-3.5 h-3.5 text-stone-500" />
                        <span>Order Cancelled &amp; Stock Restored</span>
                      </span>
                    )}
                  </div>

                  {/* Action buttons on right side */}
                  <div className="flex items-center gap-2 shrink-0 ml-auto">
                    {onDeleteOrder && (
                      <button
                        type="button"
                        onClick={() => onDeleteOrder(activeOrder)}
                        className="px-3.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold cursor-pointer shadow-2xs transition-colors flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Delete Order</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold cursor-pointer shadow-2xs transition-colors shrink-0"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


