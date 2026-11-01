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
} from 'lucide-react';
import { getFulfillmentStatusInfo, getPaymentStatusInfo } from './AdminOrdersTab';

interface OrderLifecycleModalProps {
  activeOrder: any | null;
  orderStatusNotes: string;
  setOrderStatusNotes: (s: string) => void;
  orderStatusError: string | null;
  orderStatusUpdating: boolean;
  onTransitionOrderStatus: (status: string) => void;
  onClose: () => void;
}

export default function OrderLifecycleModal({
  activeOrder,
  orderStatusNotes,
  setOrderStatusNotes,
  orderStatusError,
  orderStatusUpdating,
  onTransitionOrderStatus,
  onClose,
}: OrderLifecycleModalProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);

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
  const payment = getPaymentStatusInfo(activeOrder.paymentStatus, activeOrder.status);

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
      : 'Prepaid Online';

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
                <span className="text-sm sm:text-base font-bold text-stone-900 block truncate leading-tight mt-0.5">
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
              <span className="text-xs sm:text-sm font-bold text-stone-900 block mt-0.5">
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
          <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-amber-200/70 shadow-xs">
            <div className="flex items-center gap-1.5 mb-1.5">
              <UserIcon className="w-3.5 h-3.5 text-[#A85A28]" />
              <span className="text-xs font-bold text-stone-900">
                Customer &amp; Attendee Information
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Left Column: Customer Details */}
              <div className="space-y-0.5">
                <p className="font-bold text-stone-900 flex items-center gap-2 text-xs">
                  <UserIcon className="w-3 h-3 text-stone-400 shrink-0" />
                  <span className="truncate">{recipientName}</span>
                </p>
                <p className="text-stone-600 flex items-center gap-2 text-xs">
                  <Mail className="w-3 h-3 text-stone-400 shrink-0" />
                  <span className="truncate">{recipientEmail}</span>
                </p>
                <p className="text-stone-800 flex items-center gap-2 text-xs font-mono">
                  <Phone className="w-3 h-3 text-stone-400 shrink-0" />
                  <span>{recipientPhone}</span>
                </p>
              </div>

              {/* Right Column: Delivery Address */}
              <div className="sm:border-l sm:border-stone-200/70 sm:pl-3.5">
                <div className="flex items-center gap-1.5 text-stone-700 font-semibold mb-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#C27827] shrink-0" />
                  <span>Delivery Address</span>
                </div>
                <p className="text-stone-600 leading-snug text-xs">
                  {activeOrder.shippingAddress?.addressLine || activeOrder.shippingAddress?.street || 'Address on file'}
                  <br />
                  {activeOrder.shippingAddress?.city ? `${activeOrder.shippingAddress.city}, ` : ''}
                  {activeOrder.shippingAddress?.state ? `${activeOrder.shippingAddress.state} - ` : ''}
                  <span className="font-mono">{activeOrder.shippingAddress?.pincode || activeOrder.shippingAddress?.postalCode || ''}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Row 4: Ordered Products Card */}
          <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-amber-200/70 shadow-xs">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Package className="w-3.5 h-3.5 text-[#A85A28]" />
              <span className="text-xs font-bold text-stone-900">
                Ordered Products ({itemsCount})
              </span>
            </div>

            <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
              {itemsToRender.map((item: any, idx: number) => {
                const itemImg =
                  item.product?.image ||
                  item.image ||
                  (item.productName?.toLowerCase().includes('tourmaline')
                    ? '/products/prod-black-tourmaline.png'
                    : null);
                const itemTitle = item.productName || item.product?.name || 'BLACK TOURMALINE BRACELET';
                const itemCategory = item.productCategory || item.product?.categoryLabel || item.product?.category || 'Gemstone';
                const isCertified = item.labCertified || item.product?.labCertified !== false;
                const itemQty = item.quantity || 1;
                const itemPrice =
                  item.lineTotal ||
                  (item.purchasePrice || item.price || 0) * itemQty ||
                  activeOrder.totalAmount;

                return (
                  <div key={idx} className="flex items-center justify-between gap-3 text-xs py-0.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-stone-100 border border-stone-200/80 flex items-center justify-center shrink-0 overflow-hidden">
                        {itemImg ? (
                          <img src={itemImg} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-4 h-4 text-stone-500" />
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

                    <div className="flex items-center gap-5 shrink-0">
                      <span className="text-xs text-stone-700 font-medium">Qty: {itemQty}</span>
                      <span className="font-serif font-black text-xs sm:text-sm text-[#550E17]">
                        ₹{Number(itemPrice).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>


          {/* Row 6: Fulfillment Section & Actions */}
          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#FFF9EE] border border-amber-300/80 shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <Settings className="w-3.5 h-3.5 text-[#A85A28]" />
              <span className="text-xs font-bold text-stone-800">
                Fulfillment Status
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FDECC8] text-[#9A520E] border border-[#FCD98B]">
                ● {fulfillment.label}
              </span>
            </div>

            {/* Optional Remarks Input with placeholder matching reference */}
            {!isTerminalState && (
              <input
                type="text"
                value={orderStatusNotes}
                onChange={(e) => setOrderStatusNotes(e.target.value)}
                placeholder="Add optional remarks..."
                className="w-full px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs placeholder:text-stone-400 focus:outline-none focus:ring-1.5 focus:ring-amber-500 shadow-2xs"
              />
            )}

            {/* Action Buttons styled matching visual reference */}
            <div className="flex items-center justify-between gap-3 pt-0.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                {(activeOrder.status === 'PENDING' || activeOrder.status === 'PENDING_PAYMENT') && (
                  <>
                    <button
                      type="button"
                      disabled={orderStatusUpdating}
                      onClick={() => onTransitionOrderStatus('PROCESSING')}
                      className="px-4 py-1.5 rounded-xl bg-[#0066FF] hover:bg-[#0055D4] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                    >
                      {orderStatusUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Settings className="w-3.5 h-3.5" />}
                      <span>Start Processing &amp; Packing</span>
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

                {activeOrder.status === 'PROCESSING' && (
                  <>
                    <button
                      type="button"
                      disabled={orderStatusUpdating}
                      onClick={() => onTransitionOrderStatus('SHIPPED')}
                      className="px-4 py-1.5 rounded-xl bg-[#6B21A8] hover:bg-[#581C87] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                    >
                      {orderStatusUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Truck className="w-3.5 h-3.5" />}
                      <span>Mark as Shipped &amp; Dispatched</span>
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

                {activeOrder.status === 'SHIPPED' && (
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
              </div>

              {/* Close Button on right side */}
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold cursor-pointer shadow-2xs transition-colors shrink-0 ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


