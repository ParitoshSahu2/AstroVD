import React from 'react';
import {
  Package,
  User as UserIcon,
  Phone,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  ArrowUpRight,
} from 'lucide-react';

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
  if (!activeOrder) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl flex flex-col rounded-3xl bg-white/95 backdrop-blur-2xl border border-amber-300 shadow-2xl overflow-hidden text-[#3B1E22]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#5B0D15] via-[#7B121C] to-[#3B1E22] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-amber-200 flex items-center justify-center border border-white/30 shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-amber-100">
                Order Fulfillment &amp; Lifecycle
              </h3>
              <p className="text-xs text-amber-200/80 font-mono">
                {activeOrder.orderReference || `#ORD-${activeOrder.id.slice(0, 8).toUpperCase()}`} • Placed {new Date(activeOrder.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {orderStatusError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{orderStatusError}</span>
            </div>
          )}

          {/* Top Financials & Payment Status Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
              <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">Total Amount</span>
              <span className="font-serif text-lg font-black text-[#5B0D15] block mt-0.5">₹{activeOrder.totalAmount}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
              <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">Payment Status</span>
              <span className="font-bold text-emerald-800 block mt-0.5">● {activeOrder.paymentStatus || 'PAID'}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Total Items</span>
              <span className="font-bold text-stone-900 block mt-0.5">{activeOrder.itemCount || activeOrder.items?.reduce((s: number, i: any) => s + (i.quantity || 1), 0)} units</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Order UUID</span>
              <span className="font-mono text-[10px] text-stone-600 block mt-0.5 truncate" title={activeOrder.id}>{activeOrder.id.slice(0, 12)}...</span>
            </div>
          </div>

          {/* Seeker Contact & Delivery Address */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
            <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">
              Delivery Destination &amp; Customer Contact
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-stone-400 block text-[10px]">Customer / Recipient</span>
                <span className="font-bold text-stone-900 flex items-center gap-1 mt-0.5 text-sm">
                  <UserIcon className="w-3.5 h-3.5 text-stone-500" />
                  {activeOrder.customer?.name || activeOrder.shippingAddress?.recipient || 'Customer'}
                </span>
                <span className="text-stone-500 text-[11px] block mt-0.5">{activeOrder.customer?.email || 'N/A'}</span>
                <span className="text-emerald-700 font-mono font-medium text-[11px] flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  {activeOrder.customer?.phone || activeOrder.shippingAddress?.phone || 'No phone'}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Shipping Address</span>
                <p className="font-medium text-stone-800 mt-0.5 leading-relaxed">
                  {activeOrder.shippingAddress?.addressLine}
                  <br />
                  {activeOrder.shippingAddress?.city}, {activeOrder.shippingAddress?.state} - <strong className="font-mono">{activeOrder.shippingAddress?.pincode || activeOrder.shippingAddress?.postalCode}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Spiritual Sankalp Information */}
          {(activeOrder.shippingAddress?.sankalpName || activeOrder.shippingAddress?.sankalpGotra || activeOrder.shippingAddress?.notes || activeOrder.shippingAddress?.adminFulfillmentNotes) && (
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Spiritual Sankalp &amp; Consecration Information</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {activeOrder.shippingAddress?.sankalpName && (
                  <div>
                    <span className="text-amber-800 text-[10px] block">Sankalp Devotee Name:</span>
                    <span className="font-semibold text-stone-900">{activeOrder.shippingAddress.sankalpName}</span>
                  </div>
                )}
                {activeOrder.shippingAddress?.sankalpGotra && (
                  <div>
                    <span className="text-amber-800 text-[10px] block">Gotra / Ancestral Lineage:</span>
                    <span className="font-semibold text-stone-900">{activeOrder.shippingAddress.sankalpGotra}</span>
                  </div>
                )}
              </div>
              {activeOrder.shippingAddress?.notes && (
                <div className="pt-2 border-t border-amber-200/60">
                  <span className="text-amber-800 text-[10px] block mb-0.5">Customer Specific Instructions / Intentions:</span>
                  <p className="p-2.5 rounded-lg bg-white/80 border border-amber-200 text-stone-800 text-[11px] font-sans">
                    {activeOrder.shippingAddress.notes}
                  </p>
                </div>
              )}
              {activeOrder.shippingAddress?.adminFulfillmentNotes && (
                <div className="pt-2 border-t border-amber-200/60">
                  <span className="text-stone-500 text-[10px] block mb-0.5">Admin Dispatch / Tracking Remarks:</span>
                  <p className="p-2.5 rounded-lg bg-stone-100 border border-stone-200 text-stone-800 text-[11px] font-mono">
                    {activeOrder.shippingAddress.adminFulfillmentNotes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Ordered Items List */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">
              Sacred Relics &amp; Store Items ({activeOrder.items?.length || 0})
            </span>
            <div className="rounded-2xl border border-stone-200 overflow-hidden divide-y divide-stone-100">
              {activeOrder.items?.map((item: any, idx: number) => (
                <div key={idx} className="p-3.5 bg-white flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 overflow-hidden flex items-center justify-center shrink-0">
                      <Package className="w-6 h-6 text-amber-700" />
                    </div>
                    <div>
                      <p className="font-bold text-stone-900 text-xs">{item.productName || item.product?.name || 'Vedic Artifact'}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium">
                          {item.productCategory || item.product?.category || 'Spiritual Gemstone'}
                        </span>
                        {(item.labCertified || item.product?.labCertified) && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                            ✓ Certified
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400 block mt-0.5">
                        Blessed by: {item.energizedBy || item.product?.energizedBy || 'Kashi Vishwanath Varanasi'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs text-stone-500 block">₹{item.purchasePrice || item.price} × {item.quantity}</span>
                    <span className="font-serif font-black text-sm text-[#5B0D15] block">₹{item.lineTotal || ((item.purchasePrice || item.price) * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Lifecycle & Permitted Transitions */}
          <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Current Fulfillment Status
                </span>
                <span
                  className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${
                    activeOrder.status === 'DELIVERED'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : activeOrder.status === 'SHIPPED'
                      ? 'bg-purple-100 text-purple-800 border border-purple-300'
                      : activeOrder.status === 'PROCESSING'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : activeOrder.status === 'CANCELLED'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  ● {activeOrder.status}
                </span>
              </div>

              {activeOrder.status === 'DELIVERED' || activeOrder.status === 'CANCELLED' ? (
                <span className="text-xs text-stone-500 italic bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
                  Terminal state (Concluded)
                </span>
              ) : null}
            </div>

            {/* Status Update Note Input */}
            {activeOrder.status !== 'DELIVERED' && activeOrder.status !== 'CANCELLED' && (
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Fulfillment Remarks (e.g. Courier tracking ID, consignment note, cancellation reason):
                </label>
                <input
                  type="text"
                  value={orderStatusNotes}
                  onChange={(e) => setOrderStatusNotes(e.target.value)}
                  placeholder="e.g. Dispatched via BlueDart AWB #BD-98765432 or Sacred Puja consecrated"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#5B0D15]"
                />
              </div>
            )}

            {/* Permitted Transitions */}
            {activeOrder.status === 'PENDING' && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  disabled={orderStatusUpdating}
                  onClick={() => onTransitionOrderStatus('PROCESSING')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {orderStatusUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Package className="w-3.5 h-3.5" />}
                  Start Processing &amp; Packing
                </button>
                <button
                  disabled={orderStatusUpdating}
                  onClick={() => onTransitionOrderStatus('CANCELLED')}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel Order
                </button>
              </div>
            )}

            {activeOrder.status === 'PROCESSING' && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  disabled={orderStatusUpdating}
                  onClick={() => onTransitionOrderStatus('SHIPPED')}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {orderStatusUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                  Mark as Shipped &amp; Dispatched
                </button>
                <button
                  disabled={orderStatusUpdating}
                  onClick={() => onTransitionOrderStatus('CANCELLED')}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel Order
                </button>
              </div>
            )}

            {activeOrder.status === 'SHIPPED' && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  disabled={orderStatusUpdating}
                  onClick={() => onTransitionOrderStatus('DELIVERED')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {orderStatusUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Mark as Delivered to Customer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
