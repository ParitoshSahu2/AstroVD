import React, { useState, useEffect } from 'react';
import {
  Search,
  Package,
  Phone,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Copy,
  Check,
  CreditCard,
  Truck,
  Trash2,
} from 'lucide-react';

interface AdminOrdersTabProps {
  orderSearch: string;
  setOrderSearch: (s: string) => void;
  handleOrderSearchSubmit: (e: React.FormEvent) => void;
  orderStatusFilter: string;
  setOrderStatusFilter: (s: string) => void;
  orderDateFilter: string;
  setOrderDateFilter: (s: string) => void;
  ordersList: any[];
  ordersLoading: boolean;
  orderTotalCount: number;
  orderPage: number;
  orderTotalPages: number;
  fetchOrdersList: (p: number) => void;
  onSelectOrder: (o: any) => void;
  onDeleteOrder?: (o: any) => void;
}

export interface StatusDetail {
  label: string;
  dotClass: string;
  textClass: string;
  badgeClass?: string;
}

export const getPaymentStatusDetail = (
  rawPaymentStatus: string | undefined,
  orderStatus: string | undefined
): StatusDetail => {
  const p = (rawPaymentStatus || '').toUpperCase().trim();
  const o = (orderStatus || '').toUpperCase().trim();

  if (p === 'PAID') {
    return {
      label: 'Paid',
      dotClass: 'bg-emerald-600',
      textClass: 'text-emerald-700',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    };
  }

  if (p === 'FAILED' || p === 'PAYMENT_FAILED') {
    return {
      label: 'Failed',
      dotClass: 'bg-rose-500',
      textClass: 'text-rose-700',
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-200/80',
    };
  }

  if (p === 'REFUNDED') {
    return {
      label: 'Refunded',
      dotClass: 'bg-stone-500',
      textClass: 'text-stone-600',
      badgeClass: 'bg-stone-100 text-stone-700 border-stone-200',
    };
  }

  if (
    p === 'PENDING' ||
    p === 'PENDING_PAYMENT' ||
    p.includes('PENDING') ||
    o === 'PENDING_PAYMENT' ||
    (!p && o === 'PENDING')
  ) {
    return {
      label: 'Unpaid',
      dotClass: 'bg-amber-500',
      textClass: 'text-amber-800',
      badgeClass: 'bg-amber-50 text-amber-900 border-amber-200/80',
    };
  }

  if (o === 'CANCELLED' && (p === 'CANCELLED' || !p)) {
    return {
      label: 'Cancelled',
      dotClass: 'bg-stone-400',
      textClass: 'text-stone-500',
      badgeClass: 'bg-stone-100 text-stone-600 border-stone-200',
    };
  }

  if (o === 'PROCESSING' || o === 'SHIPPED' || o === 'DELIVERED') {
    return {
      label: 'Paid',
      dotClass: 'bg-emerald-600',
      textClass: 'text-emerald-700',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    };
  }

  if (p) {
    const clean = p.replace(/_/g, ' ').toLowerCase();
    const label = clean.charAt(0).toUpperCase() + clean.slice(1);
    return {
      label,
      dotClass: 'bg-stone-400',
      textClass: 'text-stone-700',
      badgeClass: 'bg-stone-50 text-stone-700 border-stone-200',
    };
  }

  return {
    label: 'Unpaid',
    dotClass: 'bg-amber-500',
    textClass: 'text-amber-800',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-200/80',
  };
};

export const getFulfillmentStatusDetail = (
  rawStatus: string | undefined,
  deliveryStatus?: string | undefined
): StatusDetail => {
  const s = (deliveryStatus || rawStatus || '').toUpperCase().trim();

  switch (s) {
    case 'DELIVERED':
      return {
        label: 'Delivered',
        dotClass: 'bg-teal-600',
        textClass: 'text-teal-800',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      };
    case 'SHIPPED':
      return {
        label: 'Shipped',
        dotClass: 'bg-purple-600',
        textClass: 'text-purple-800',
        badgeClass: 'bg-purple-50 text-purple-800 border-purple-200/80',
      };
    case 'PROCESSING':
      return {
        label: 'Processing',
        dotClass: 'bg-sky-600',
        textClass: 'text-sky-800',
        badgeClass: 'bg-sky-50 text-sky-800 border-sky-200/80',
      };
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        dotClass: 'bg-rose-500',
        textClass: 'text-rose-700',
        badgeClass: 'bg-rose-50 text-rose-800 border-rose-200/80',
      };
    case 'PENDING':
    case 'PENDING_PAYMENT':
      return {
        label: 'Pending',
        dotClass: 'bg-amber-500',
        textClass: 'text-amber-800',
        badgeClass: 'bg-amber-50 text-amber-900 border-amber-200/80',
      };
    default:
      if (s) {
        const clean = s.replace(/_/g, ' ').toLowerCase();
        const label = clean.charAt(0).toUpperCase() + clean.slice(1);
        return {
          label,
          dotClass: 'bg-stone-400',
          textClass: 'text-stone-700',
          badgeClass: 'bg-stone-50 text-stone-700 border-stone-200',
        };
      }
      return {
        label: 'Pending',
        dotClass: 'bg-amber-500',
        textClass: 'text-amber-800',
        badgeClass: 'bg-amber-50 text-amber-900 border-amber-200/80',
      };
  }
};

// Aliases for backwards compatibility with any other imports
export const getFulfillmentStatusInfo = getFulfillmentStatusDetail;
export const getPaymentStatusInfo = getPaymentStatusDetail;

export default function AdminOrdersTab({
  orderSearch,
  setOrderSearch,
  handleOrderSearchSubmit,
  orderStatusFilter,
  setOrderStatusFilter,
  orderDateFilter,
  setOrderDateFilter,
  ordersList,
  ordersLoading,
  orderTotalCount,
  orderPage,
  orderTotalPages,
  fetchOrdersList,
  onSelectOrder,
  onDeleteOrder,
}: AdminOrdersTabProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveMenuId(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCopyId = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
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
    setCopiedId(text);
    setTimeout(() => setCopiedId((prev) => (prev === text ? null : prev)), 2000);
  };

  const formatOrderDate = (dateVal: string | Date | undefined) => {
    if (!dateVal) return 'Date TBD';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      const day = String(d.getDate()).padStart(2, '0');
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      const year = d.getFullYear();
      return `${day} ${month} ${year}`;
    } catch {
      return String(dateVal);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter & Search Bar for Orders */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-stone-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Order Search Form */}
        <form onSubmit={handleOrderSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              placeholder="Search by Order ID, customer name, email, phone, city, or pincode..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white/80 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#5B0D15] hover:bg-[#480a11] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Filters for Orders */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <span className="font-semibold hidden sm:inline">Status:</span>
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <span className="font-semibold hidden sm:inline">Date:</span>
            <input
              type="date"
              value={orderDateFilter}
              onChange={(e) => setOrderDateFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          {(orderSearch || orderStatusFilter !== 'ALL' || orderDateFilter) && (
            <button
              onClick={() => {
                setOrderSearch('');
                setOrderStatusFilter('ALL');
                setOrderDateFilter('');
              }}
              className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-stone-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="space-y-0.5">
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#3B1E22] flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-700" />
              <span>Customer Shopping Orders &amp; Sacred Artifact Fulfillment</span>
            </h3>
            <p className="text-xs text-stone-500">
              Showing {ordersList.length} of {orderTotalCount} total customer shopping orders across platform
            </p>
          </div>

          <button
            onClick={() => fetchOrdersList(orderPage)}
            className="px-3 py-1.5 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${ordersLoading ? 'animate-spin text-[#5B0D15]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {ordersLoading ? (
          <div className="py-20 text-center text-xs text-stone-500 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#5B0D15]" />
            <p>Loading customer shopping order records...</p>
          </div>
        ) : ordersList.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-500 space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-800 flex items-center justify-center mx-auto border border-blue-200">
              <Package className="w-6 h-6" />
            </div>
            <p className="font-bold text-sm text-stone-700">No Orders Found</p>
            <p className="text-stone-400 max-w-sm mx-auto">
              No customer shopping orders match the selected filter criteria or search query.
            </p>
          </div>
        ) : (
          <div className="w-full min-w-0">
            {/* Desktop & Tablet View: Clean 6-Column Table (No Horizontal Scrolling) */}
            <div className="hidden md:block w-full">
              <table className="w-full table-fixed text-left text-xs divide-y divide-stone-100">
                <thead>
                  <tr className="border-b border-stone-200/80 text-stone-400 uppercase tracking-wider font-semibold text-[10px]">
                    <th className="py-2.5 px-3.5 w-[14%] font-medium truncate">Order ID / Date</th>
                    <th className="py-2.5 px-3.5 w-[20%] font-medium truncate">Customer</th>
                    <th className="py-2.5 px-3.5 w-[21%] font-medium truncate">Items</th>
                    <th className="py-2.5 px-3.5 w-[12%] font-medium truncate">Order Total</th>
                    <th className="py-2.5 px-3.5 w-[24%] font-medium truncate" title="Payment & Fulfillment Status">Status</th>
                    <th className="py-2.5 px-3.5 w-[9%] font-medium text-right uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {ordersList.map((o, index) => {
                    const fulfillment = getFulfillmentStatusDetail(o.status, o.deliveryStatus);
                    const payment = getPaymentStatusDetail(o.paymentStatus, o.status);

                    const orderRef = o.orderReference || (o.id ? `#ORD-${o.id.slice(0, 8).toUpperCase()}` : '#ORD-N/A');
                    const shortId = o.orderReference ? o.orderReference : `#${o.id ? o.id.slice(0, 8).toUpperCase() : 'N/A'}`;
                    const orderDate = formatOrderDate(o.createdAt);
                    const custName = o.customer?.name || o.shippingAddress?.recipient || 'Customer';
                    const custEmail = o.customer?.email || 'Guest Checkout';
                    const custPhone = o.customer?.phone || o.shippingAddress?.phone || 'No phone';

                    const primaryItem = o.items?.[0];
                    const primaryItemName = primaryItem ? (primaryItem.productName || primaryItem.product?.name || 'Vedic Relic') : 'Sacred Product';
                    const primaryQty = primaryItem?.quantity || 1;
                    const additionalItems = (o.items?.length || 0) > 1 ? o.items.length - 1 : 0;
                    const totalUnits = o.itemCount || o.items?.reduce((s: number, i: any) => s + (i.quantity || 1), 0) || primaryQty;

                    const isNearBottom = index >= ordersList.length - 2 && ordersList.length > 2;

                    return (
                      <tr
                        key={o.id}
                        onClick={() => onSelectOrder(o)}
                        className="hover:bg-stone-50/70 transition-colors cursor-pointer group"
                        title="Click to view full order details"
                      >
                        {/* 1. Order ID / Date */}
                        <td className="py-2.5 px-3.5 align-middle overflow-hidden">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span
                              className="font-mono text-stone-800 font-semibold text-xs block truncate group-hover:text-[#5B0D15] transition-colors"
                              title={`Full Reference: ${orderRef}`}
                            >
                              {shortId}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyId(e, orderRef)}
                              className={`p-1 rounded transition-colors shrink-0 cursor-pointer ${
                                copiedId === orderRef
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
                              }`}
                              title={copiedId === orderRef ? 'Copied ID!' : 'Copy order ID'}
                              aria-label="Copy order ID"
                            >
                              {copiedId === orderRef ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <span className="text-[11px] text-stone-400 block truncate mt-0.5" title={`Placed: ${orderDate}`}>
                            {orderDate}
                          </span>
                        </td>

                        {/* 2. Customer */}
                        <td className="py-2.5 px-3.5 align-middle overflow-hidden">
                          <div className="min-w-0 pr-1">
                            <span
                              className="font-semibold text-stone-900 block truncate text-xs leading-snug"
                              title={custName}
                            >
                              {custName}
                            </span>
                            <div className="flex items-center gap-1 text-stone-500 text-[11px] mt-0.5 truncate">
                              {custPhone && custPhone !== 'No phone' ? (
                                <>
                                  <Phone className="w-3 h-3 text-stone-400 shrink-0" />
                                  <span className="font-mono truncate" title={custPhone}>{custPhone}</span>
                                </>
                              ) : (
                                <span className="text-stone-400 truncate text-[11px]" title={custEmail}>{custEmail}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 3. Items */}
                        <td className="py-2.5 px-3.5 align-middle overflow-hidden">
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className="font-medium text-stone-900 block truncate text-xs leading-snug"
                                title={`${primaryItemName} (Qty: ${primaryQty})`}
                              >
                                {primaryItemName}
                              </span>
                              {additionalItems > 0 && (
                                <span
                                  className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-stone-100 text-stone-600 border border-stone-200/80 shrink-0"
                                  title={`${additionalItems} more item${additionalItems > 1 ? 's' : ''}`}
                                >
                                  +{additionalItems} more
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-stone-400 block truncate mt-0.5" title={`${totalUnits} unit(s) total`}>
                              {totalUnits} {totalUnits === 1 ? 'unit' : 'units'} total
                            </span>
                          </div>
                        </td>

                        {/* 4. Order Total */}
                        <td className="py-2.5 px-3.5 align-middle overflow-hidden">
                          <div className="min-w-0">
                            <span
                              className="font-semibold text-stone-900 block truncate text-xs tabular-nums tracking-tight"
                              title={`₹${Number(o.totalAmount).toLocaleString('en-IN')}`}
                            >
                              ₹{Number(o.totalAmount).toLocaleString('en-IN')}
                            </span>
                            <span className="text-[11px] text-stone-400 block truncate mt-0.5" title={o.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Prepaid Online'}>
                              {o.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Prepaid Online'}
                            </span>
                          </div>
                        </td>

                        {/* 5. Status: Side-by-side Payment and Fulfillment Badges on a single horizontal line */}
                        <td className="py-2.5 px-3.5 align-middle overflow-hidden">
                          <div className="flex items-center gap-1.5 flex-nowrap whitespace-nowrap">
                            {/* Payment Badge */}
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium border shrink-0 ${payment.badgeClass}`}
                              title={`Payment Status: ${payment.label}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${payment.dotClass}`} />
                              <span>{payment.label}</span>
                            </span>

                            {/* Fulfillment Badge */}
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium border shrink-0 ${fulfillment.badgeClass}`}
                              title={`Fulfillment Status: ${fulfillment.label}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${fulfillment.dotClass}`} />
                              <span>{fulfillment.label}</span>
                            </span>
                          </div>
                        </td>

                        {/* 6. Actions (Single Compact Three-Dot Menu '⋮') */}
                        <td className="py-2.5 px-3.5 text-right align-middle">
                          <div className="relative inline-block text-left">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId((prev) => (prev === o.id ? null : o.id));
                              }}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                activeMenuId === o.id
                                  ? 'bg-stone-100 text-stone-900 border-stone-300'
                                  : 'border-transparent text-stone-400 hover:text-stone-700 hover:bg-stone-100 hover:border-stone-200'
                              }`}
                              title="Order actions"
                              aria-label={`Actions for order ${shortId}`}
                              aria-haspopup="true"
                              aria-expanded={activeMenuId === o.id}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {activeMenuId === o.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-30"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(null);
                                  }}
                                />
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className={`absolute right-0 z-40 w-48 rounded-2xl bg-white/95 backdrop-blur-xl border border-stone-200 shadow-xl py-1 text-xs text-stone-700 animate-fadeIn ${
                                    isNearBottom ? 'bottom-full mb-1' : 'top-full mt-1'
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onSelectOrder(o);
                                    }}
                                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-stone-100/80 hover:text-stone-900 transition-colors cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-stone-400" />
                                    <span>View Order Details</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onSelectOrder(o);
                                    }}
                                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-amber-50 hover:text-amber-900 text-stone-700 transition-colors cursor-pointer"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Update Fulfillment Status</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onSelectOrder(o);
                                    }}
                                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-stone-50 text-stone-700 transition-colors cursor-pointer"
                                  >
                                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                                    <span>View Shipping Details</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onSelectOrder(o);
                                    }}
                                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-stone-50 text-stone-700 transition-colors cursor-pointer"
                                  >
                                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>View Payment Details</span>
                                  </button>

                                  {onDeleteOrder && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        onDeleteOrder(o);
                                      }}
                                      className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-rose-50 text-rose-700 transition-colors cursor-pointer border-t border-stone-100 font-medium"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                      <span>Delete Order</span>
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Compact Responsive Order Cards (No Horizontal Scrolling) */}
            <div className="md:hidden space-y-3">
              {ordersList.map((o, index) => {
                const fulfillment = getFulfillmentStatusInfo(o.status);
                const payment = getPaymentStatusInfo(o.paymentStatus, o.status);

                const orderRef = o.orderReference || (o.id ? `#ORD-${o.id.slice(0, 8).toUpperCase()}` : '#ORD-N/A');
                const shortId = o.orderReference ? o.orderReference : `#${o.id ? o.id.slice(0, 8).toUpperCase() : 'N/A'}`;
                const orderDate = formatOrderDate(o.createdAt);
                const custName = o.customer?.name || o.shippingAddress?.recipient || 'Customer';
                const custPhone = o.customer?.phone || o.shippingAddress?.phone || 'No phone';

                const primaryItem = o.items?.[0];
                const primaryItemName = primaryItem ? (primaryItem.productName || primaryItem.product?.name || 'Vedic Relic') : 'Sacred Product';
                const primaryQty = primaryItem?.quantity || 1;
                const additionalItems = (o.items?.length || 0) > 1 ? o.items.length - 1 : 0;
                const totalUnits = o.itemCount || o.items?.reduce((s: number, i: any) => s + (i.quantity || 1), 0) || primaryQty;

                const isNearBottom = index >= ordersList.length - 2 && ordersList.length > 2;

                return (
                  <div
                    key={o.id}
                    onClick={() => onSelectOrder(o)}
                    className="p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:border-amber-400 transition-all cursor-pointer space-y-2.5"
                    title="Click to view details"
                  >
                    {/* Header: Short ID, Date, Status Badges & Menu */}
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-mono text-stone-800 font-semibold text-xs">
                          {shortId}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyId(e, orderRef)}
                          className="p-1 rounded text-stone-400 hover:text-stone-700"
                          title="Copy Full Reference"
                        >
                          {copiedId === orderRef ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                        <span className="text-[11px] text-stone-400">
                          • {orderDate}
                        </span>
                      </div>

                      {/* Three-Dot Menu Button */}
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId((prev) => (prev === o.id ? null : o.id));
                          }}
                          className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                          title="Actions"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                          {activeMenuId === o.id && (
                            <>
                              <div
                                className="fixed inset-0 z-30"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(null);
                                }}
                              />
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className={`absolute right-0 z-40 w-44 rounded-xl bg-white border border-stone-200 shadow-xl py-1 text-xs text-stone-700 animate-fadeIn ${
                                  isNearBottom ? 'bottom-full mb-1' : 'top-full mt-1'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onSelectOrder(o);
                                  }}
                                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-stone-50"
                                >
                                  <Eye className="w-3.5 h-3.5 text-stone-400" />
                                  <span>View Details</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onSelectOrder(o);
                                  }}
                                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-stone-50"
                                >
                                  <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Update Status</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onSelectOrder(o);
                                  }}
                                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-stone-50"
                                >
                                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Shipping Details</span>
                                </button>
                                {onDeleteOrder && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onDeleteOrder(o);
                                    }}
                                    className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-rose-50 text-rose-700 border-t border-stone-100 font-medium"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                    <span>Delete Order</span>
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                    {/* Customer & Items Details */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-stone-400 block">Customer</span>
                        <span className="font-semibold text-stone-900 truncate block">{custName}</span>
                        <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5 truncate">
                          <Phone className="w-3 h-3 text-stone-400 shrink-0" />
                          <span className="font-mono truncate">{custPhone}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-stone-400 block">Ordered Items</span>
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="font-medium text-stone-900 truncate">{primaryItemName}</span>
                          {additionalItems > 0 && (
                            <span className="text-[9px] font-semibold text-stone-600 bg-stone-100 border border-stone-200/80 px-1 rounded">
                              +{additionalItems} more
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-stone-400 truncate block">
                          {totalUnits} {totalUnits === 1 ? 'unit' : 'units'} total
                        </span>
                      </div>
                    </div>

                    {/* Status & Total Details */}
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-100">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Payment Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border shrink-0 ${payment.badgeClass}`}
                          title={`Payment Status: ${payment.label}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${payment.dotClass}`} />
                          <span>{payment.label}</span>
                        </span>

                        {/* Fulfillment Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border shrink-0 ${fulfillment.badgeClass}`}
                          title={`Fulfillment Status: ${fulfillment.label}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${fulfillment.dotClass}`} />
                          <span>{fulfillment.label}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-900 text-xs block tabular-nums">
                          ₹{Number(o.totalAmount).toLocaleString('en-IN')}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectOrder(o);
                          }}
                          className="h-6 px-2.5 rounded-md border border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-medium text-[11px] transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Orders Pagination */}
        {orderTotalPages > 1 && (
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>
              Showing page {orderPage} of {orderTotalPages} ({orderTotalCount} total orders)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={orderPage <= 1}
                onClick={() => fetchOrdersList(orderPage - 1)}
                className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>
              <button
                disabled={orderPage >= orderTotalPages}
                onClick={() => fetchOrdersList(orderPage + 1)}
                className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
