import React from 'react';
import {
  X,
  RefreshCw,
  ShoppingCart,
  Compass,
  Sparkles,
  User as UserIcon,
  Activity,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  Calendar,
  Video,
  Phone,
  MessageSquare,
  Wallet,
  UserCheck,
  UserX,
  UserMinus,
  Shield,
  Trash2,
} from 'lucide-react';
import { DetailedUser, DeletableUser } from '../types';

interface UserInspectionModalProps {
  selectedUserId: string | null;
  inspectUser: DetailedUser | null;
  inspectLoading: boolean;
  inspectTab: 'purchases' | 'services' | 'activity' | 'profile';
  setInspectTab: (t: 'purchases' | 'services' | 'activity' | 'profile') => void;
  onClose: () => void;
  getInitials: (name?: string) => string;
  canBlockUser: (u: any) => boolean;
  handleToggleStatus: (id: string, status: string) => void;
  actionLoading: boolean;
  isSuperadmin: boolean;
  currentUser: any;
  handleUpdateRole: (id: string, role: any) => void;
  canDeleteUser: (u: any) => boolean;
  deleteLoading: boolean;
  handleInitiateDelete: (u: DeletableUser) => void;
}

export default function UserInspectionModal({
  selectedUserId,
  inspectUser,
  inspectLoading,
  inspectTab,
  setInspectTab,
  onClose,
  getInitials,
  canBlockUser,
  handleToggleStatus,
  actionLoading,
  isSuperadmin,
  currentUser,
  handleUpdateRole,
  canDeleteUser,
  deleteLoading,
  handleInitiateDelete,
}: UserInspectionModalProps) {
  if (!selectedUserId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-white/95 backdrop-blur-2xl border border-amber-300 shadow-2xl overflow-hidden text-[#3B1E22]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#5B0D15] via-[#7B121C] to-[#3B1E22] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 text-amber-200 font-bold text-lg flex items-center justify-center border border-white/30 shrink-0">
              {inspectUser ? getInitials(inspectUser.name) : '...'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-xl font-bold text-amber-100">
                  {inspectUser?.name || 'Loading Seeker Profile...'}
                </h3>
                {inspectUser && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950 uppercase">
                    {inspectUser.role}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-300">{inspectUser?.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {inspectLoading || !inspectUser ? (
          <div className="py-24 text-center text-xs text-stone-500 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#5B0D15]" />
            <p className="font-semibold text-sm">Aggregating Seeker 360° Activity Trail...</p>
            <p className="text-stone-400">Loading store purchases, booked services, and platform activity.</p>
          </div>
        ) : (
          <>
            {/* Quick Seeker Action Summary Bar */}
            <div className="bg-amber-50/90 border-b border-amber-200/80 px-6 py-3 flex flex-wrap items-center justify-between text-xs gap-3 shrink-0">
              <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                <div className="flex items-center gap-1.5 font-semibold text-[#3B1E22]">
                  <ShoppingCart className="w-3.5 h-3.5 text-blue-700" />
                  <span>Store Orders:</span>
                  <strong className="text-[#5B0D15]">{inspectUser.orders?.length || 0}</strong>
                  <span className="text-[10px] text-stone-500">
                    ({inspectUser.orders?.filter((o) => (o.status || '').toUpperCase() === 'PROCESSING').length || 0} Processing)
                  </span>
                </div>

                <div className="flex items-center gap-1.5 font-semibold text-[#3B1E22]">
                  <Compass className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Services Clicked:</span>
                  <strong className="text-[#5B0D15]">{inspectUser.bookings?.length || 0}</strong>
                  <span className="text-[10px] text-stone-500">
                    ({inspectUser.bookings?.filter((b) => (b.status || '').toUpperCase() === 'CONFIRMED').length || 0} Confirmed,{' '}
                    {inspectUser.bookings?.filter((b) => (b.status || '').toUpperCase() !== 'CONFIRMED').length || 0} Customer Review / Processing)
                  </span>
                </div>

                <div className="flex items-center gap-1.5 font-semibold text-[#3B1E22]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Kundli Charts:</span>
                  <strong className="text-[#5B0D15]">{inspectUser.savedKundlis?.length || 0}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-stone-500 font-medium">Astro Wallet:</span>
                <strong className="text-[#5B0D15] font-black text-sm">₹{inspectUser.walletBalance.toFixed(2)}</strong>
              </div>
            </div>

            {/* 4 Inspection Navigation Tabs */}
            <div className="flex border-b border-stone-200 bg-white px-6 pt-3 gap-3 overflow-x-auto shrink-0">
              <button
                onClick={() => setInspectTab('purchases')}
                className={`pb-3 px-3 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                  inspectTab === 'purchases' ? 'text-[#5B0D15]' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>What They Bought ({inspectUser.orders?.length || 0})</span>
                {inspectTab === 'purchases' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#5B0D15] rounded-full" />
                )}
              </button>

              <button
                onClick={() => setInspectTab('services')}
                className={`pb-3 px-3 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                  inspectTab === 'services' ? 'text-[#5B0D15]' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Services Clicked &amp; Booked ({inspectUser.bookings?.length || 0})</span>
                {inspectTab === 'services' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#5B0D15] rounded-full" />
                )}
              </button>

              <button
                onClick={() => setInspectTab('activity')}
                className={`pb-3 px-3 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                  inspectTab === 'activity' ? 'text-[#5B0D15]' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Action Timeline &amp; Kundli</span>
                {inspectTab === 'activity' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#5B0D15] rounded-full" />
                )}
              </button>

              <button
                onClick={() => setInspectTab('profile')}
                className={`pb-3 px-3 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                  inspectTab === 'profile' ? 'text-[#5B0D15]' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>Birth Details &amp; Access</span>
                {inspectTab === 'profile' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#5B0D15] rounded-full" />
                )}
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 max-h-[60vh]">
              {/* TAB 1: WHAT THEY BOUGHT */}
              {inspectTab === 'purchases' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="font-serif text-lg font-bold text-[#3B1E22]">
                        Astro Store Purchases &amp; Consecrated Artifacts
                      </h4>
                      <p className="text-xs text-stone-500">
                        Clear itemized record of spiritual items bought by {inspectUser.name}. Orders remain categorized under <strong>PROCESSING</strong> until payment is verified &amp; delivery occurs.
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-stone-400">Total Store Spend</span>
                      <div className="text-lg font-black text-[#5B0D15]">
                        ₹{inspectUser.orders?.reduce((acc, o) => acc + (o.totalAmount || 0), 0).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {inspectUser.orders?.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-stone-50 text-center text-xs text-stone-500 space-y-2">
                      <ShoppingCart className="w-8 h-8 mx-auto text-stone-400" />
                      <p className="font-semibold">No store orders recorded yet.</p>
                      <p className="text-stone-400">This seeker has not purchased products from the Astro store.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {inspectUser.orders?.map((order) => {
                        const isDelivered = (order.status || '').toUpperCase() === 'DELIVERED';

                        return (
                          <div
                            key={order.id}
                            className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm space-y-4"
                          >
                            {/* Order Banner */}
                            <div className="p-3 bg-gradient-to-r from-amber-50/90 via-orange-50/40 to-amber-50/70 rounded-xl border border-amber-200/80 flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-2 text-xs">
                                <span className="px-2 py-0.5 rounded-md bg-[#5B0D15] text-amber-200 font-bold text-[10px] uppercase">
                                  Order Placed
                                </span>
                                <span className="font-bold text-[#3B1E22]">
                                  Seeker placed order for{' '}
                                  <span className="text-[#5B0D15]">
                                    {order.items?.map((i) => i.product?.name).filter(Boolean).join(' + ') || 'Spiritual Item'}
                                  </span>
                                </span>
                              </div>

                              {/* Order Status Badge */}
                              <div>
                                {isDelivered ? (
                                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5 shadow-sm">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>DELIVERED</span>
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 shadow-sm">
                                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                                    <span>⏳ PROCESSING (Order Placed • Fulfillment Pending)</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Order Meta Row */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-100 text-xs">
                              <div className="flex items-center gap-2 text-stone-500">
                                <span className="font-semibold text-stone-700">Order ID: #{order.id.slice(0, 8)}</span>
                                <span>•</span>
                                <span>
                                  Placed on{' '}
                                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <div className="font-black text-sm text-[#3B1E22]">
                                Total Amount: <span className="text-[#5B0D15]">₹{order.totalAmount.toFixed(2)}</span>
                              </div>
                            </div>

                            {/* Items list */}
                            <div className="space-y-3">
                              {order.items?.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between gap-4 p-3 rounded-xl bg-amber-50/30 border border-amber-200/50"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-white border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center">
                                      {item.product?.image ? (
                                        <img
                                          src={item.product.image}
                                          alt={item.product.name}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <Package className="w-6 h-6 text-stone-400" />
                                      )}
                                    </div>
                                    <div>
                                      <div className="font-bold text-xs text-[#3B1E22]">
                                        {item.product?.name || 'Spiritual Item'}
                                      </div>
                                      <div className="text-[11px] text-amber-900 font-medium flex items-center gap-2 mt-0.5">
                                        <span>Quantity: {item.quantity}</span>
                                        <span>•</span>
                                        <span>Category: {item.product?.category}</span>
                                        {item.product?.labCertified && (
                                          <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                                            Lab Certified
                                          </span>
                                        )}
                                      </div>
                                      {item.product?.energizedBy && (
                                        <div className="text-[10px] text-stone-500 mt-0.5">
                                          ✨ Consecrated by: {item.product.energizedBy}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <div className="font-bold text-xs text-[#5B0D15]">
                                      ₹{(item.price * item.quantity).toFixed(2)}
                                    </div>
                                    <div className="text-[10px] text-stone-400">₹{item.price.toFixed(2)} each</div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Shipping address */}
                            {order.shippingAddress && (
                              <div className="text-[11px] text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-200/70 flex items-start gap-2">
                                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                                <div>
                                  <strong className="text-stone-800">Delivery Destination: </strong>
                                  {order.shippingAddress.recipient}, {order.shippingAddress.addressLine},{' '}
                                  {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                                  {order.shippingAddress.pincode} ({order.shippingAddress.phone})
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SERVICES CLICKED & BOOKED */}
              {inspectTab === 'services' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-[#3B1E22]">
                      Astrology Consultations &amp; Vedic Services Clicked
                    </h4>
                    <p className="text-xs text-stone-500">
                      Personalized sessions booked by {inspectUser.name}. Consultations that have not been performed are categorized under <strong>PROCESSING (CUSTOMER REVIEW)</strong> or <strong>CONFIRMED (SCHEDULED)</strong>.
                    </p>
                  </div>

                  {inspectUser.bookings?.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-stone-50 text-center text-xs text-stone-500 space-y-2">
                      <Compass className="w-8 h-8 mx-auto text-stone-400" />
                      <p className="font-semibold">No astrology consultations booked yet.</p>
                      <p className="text-stone-400">This seeker has not scheduled personalized consultations.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {inspectUser.bookings?.map((booking) => {
                        const bStatus = (booking.status || '').toUpperCase();
                        const isConfirmed = bStatus === 'CONFIRMED';
                        const isCompleted = bStatus === 'COMPLETED';

                        return (
                          <div
                            key={booking.id}
                            className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm space-y-4"
                          >
                            {/* Service Action Banner */}
                            <div className="p-3 bg-gradient-to-r from-purple-50/90 via-amber-50/40 to-purple-50/60 rounded-xl border border-purple-200/80 flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-2 text-xs">
                                <span className="px-2 py-0.5 rounded-md bg-[#5B0D15] text-amber-200 font-bold text-[10px] uppercase">
                                  Service Requested
                                </span>
                                <span className="font-bold text-[#3B1E22]">
                                  Seeker selected{' '}
                                  <span className="text-[#5B0D15]">
                                    {booking.serviceType} Consultation with {booking.astrologer?.name || 'Dr. Pandit Vishal Dubey'}
                                  </span>
                                </span>
                              </div>

                              {/* Service Status Badge */}
                              <div>
                                {isConfirmed ? (
                                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5 shadow-sm">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>📅 CONFIRMED (Session Scheduled • Awaiting Date)</span>
                                  </span>
                                ) : isCompleted ? (
                                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1.5 shadow-sm">
                                    <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                                    <span>✅ COMPLETED</span>
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 shadow-sm">
                                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                                    <span>⏳ PROCESSING (Customer Review • Slot Requested)</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-100 text-xs">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 ${
                                    booking.serviceType === 'VIDEO'
                                      ? 'bg-purple-100 text-purple-900'
                                      : booking.serviceType === 'AUDIO'
                                      ? 'bg-blue-100 text-blue-900'
                                      : 'bg-emerald-100 text-emerald-900'
                                  }`}
                                >
                                  {booking.serviceType === 'VIDEO' && <Video className="w-3 h-3" />}
                                  {booking.serviceType === 'AUDIO' && <Phone className="w-3 h-3" />}
                                  {booking.serviceType === 'CHAT' && <MessageSquare className="w-3 h-3" />}
                                  {booking.serviceType} Consultation
                                </span>
                                <span className="text-stone-400">•</span>
                                <span className="text-stone-600 font-semibold">{booking.durationMinutes} Minutes</span>
                              </div>
                              <div className="font-black text-sm text-[#5B0D15]">
                                Consultation Fee: ₹{booking.totalCost.toFixed(2)}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-stone-400 uppercase">Astrologer</span>
                                <div className="font-bold text-[#3B1E22] flex items-center gap-2">
                                  <span>🕉️</span>
                                  <span>{booking.astrologer?.name || 'Dr. Pandit Vishal Dubey'}</span>
                                </div>
                                <div className="text-[11px] text-stone-500">
                                  {booking.astrologer?.title || 'Senior Vedic Astrologer'}
                                </div>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-stone-400 uppercase">Scheduled Time</span>
                                <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-amber-700" />
                                  <span>{booking.scheduledDate}</span>
                                  <Clock className="w-3.5 h-3.5 text-amber-700 ml-2" />
                                  <span>{booking.scheduledTime}</span>
                                </div>
                              </div>
                            </div>

                            {booking.notes && (
                              <div className="text-[11px] bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60 text-[#3B1E22]">
                                <strong className="text-amber-900">Consultation Focus: </strong>
                                {booking.notes}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Saved Readings */}
                  {inspectUser.savedReadings && inspectUser.savedReadings.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h5 className="font-serif text-sm font-bold text-[#3B1E22] flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>Vedic Horoscope Reports &amp; Readings Generated</span>
                      </h5>
                      <div className="space-y-2">
                        {inspectUser.savedReadings.map((reading: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-white border border-stone-200 text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between font-bold text-[#5B0D15]">
                              <span>{reading.serviceName || 'Astrology Reading'}</span>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                  ⏳ {reading.status || 'Processing (Customer Review)'}
                                </span>
                                <span className="text-stone-400 text-[10px] font-normal">{reading.date}</span>
                              </div>
                            </div>
                            <p className="text-stone-600 text-[11px]">{reading.summary}</p>
                            {reading.pandit && (
                              <div className="text-[10px] text-amber-800 font-semibold">
                                Prepared by: {reading.pandit}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PLATFORM ACTION TIMELINE & KUNDLI */}
              {inspectTab === 'activity' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-sm font-bold text-[#3B1E22] flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#5B0D15]" />
                        <span>Unified Seeker Action Timeline (What They Did on Platform)</span>
                      </h4>
                      <span className="text-xs text-stone-500 font-semibold">
                        Full Chronological Trail
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {inspectUser.orders?.map((o) => {
                        const isDelivered = (o.status || '').toUpperCase() === 'DELIVERED';
                        return (
                          <div
                            key={`action-order-${o.id}`}
                            className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center shrink-0">
                                <ShoppingCart className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-bold text-[#3B1E22]">
                                  Seeker Placed Order: {o.items?.map((i) => i.product?.name).filter(Boolean).join(', ') || 'Spiritual Item'}
                                </div>
                                <div className="text-[11px] text-stone-500">
                                  Total Amount: ₹{o.totalAmount.toFixed(2)} • Destination: {o.shippingAddress?.city || 'India'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {isDelivered ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                  ✅ DELIVERED
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                  ⏳ PROCESSING (Order In Progress)
                                </span>
                              )}
                              <span className="text-[10px] text-stone-400 whitespace-nowrap">
                                {new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {inspectUser.bookings?.map((b) => {
                        const bStatus = (b.status || '').toUpperCase();
                        const isConfirmed = bStatus === 'CONFIRMED';
                        const isCompleted = bStatus === 'COMPLETED';

                        return (
                          <div
                            key={`action-booking-${b.id}`}
                            className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center shrink-0">
                                <Compass className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-bold text-[#3B1E22]">
                                  Seeker Clicked &amp; Booked: {b.serviceType} Consultation with {b.astrologer?.name}
                                </div>
                                <div className="text-[11px] text-stone-500">
                                  Fee: ₹{b.totalCost.toFixed(2)} • Scheduled: {b.scheduledDate} at {b.scheduledTime} ({b.durationMinutes} mins)
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {isConfirmed ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                  📅 CONFIRMED (Scheduled)
                                </span>
                              ) : isCompleted ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
                                  ✅ COMPLETED
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                  ⏳ PROCESSING (Customer Review)
                                </span>
                              )}
                              <span className="text-[10px] text-stone-400 whitespace-nowrap">
                                {new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {inspectUser.savedKundlis?.map((k, idx) => (
                        <div
                          key={`action-kundli-${idx}`}
                          className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-[#3B1E22]">
                                Calculated Janam Kundli: {k.title || 'Birth Chart'}
                              </div>
                              <div className="text-[11px] text-stone-500">
                                Ascendant: {k.ascendant || 'Lagna'} • Moon Sign: {k.moonSign || 'Rashi'} • Star: {k.nakshatra || 'Nakshatra'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              🔮 KUNDLI CALCULATED
                            </span>
                          </div>
                        </div>
                      ))}

                      {inspectUser.transactions?.slice(0, 4).map((tx) => (
                        <div
                          key={`action-tx-${tx.id}`}
                          className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0">
                              <Wallet className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-[#3B1E22]">
                                Wallet Transaction: {tx.description}
                              </div>
                              <div className="text-[11px] text-stone-500">
                                Balance After: ₹{tx.balanceAfter.toFixed(2)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                tx.type === 'CREDIT'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}
                            >
                              {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-stone-400 whitespace-nowrap">
                              {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Saved Kundli Charts Cards */}
                  <div className="space-y-3 pt-3 border-t border-stone-200">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-sm font-bold text-[#3B1E22] flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>Saved Vedic Kundli Charts Details</span>
                      </h4>
                      <span className="text-xs text-stone-500 font-semibold">
                        {inspectUser.savedKundlis?.length || 0} charts
                      </span>
                    </div>

                    {inspectUser.savedKundlis?.length === 0 ? (
                      <div className="p-4 rounded-xl bg-stone-50 text-center text-xs text-stone-500">
                        No Janam Kundli charts generated yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {inspectUser.savedKundlis?.map((k: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-white border border-amber-200/80 shadow-sm space-y-2 text-xs"
                          >
                            <div className="font-bold text-[#5B0D15] flex items-center justify-between">
                              <span>{k.title || 'Birth Kundli'}</span>
                              {k.matchScore && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                                  {k.matchScore}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-stone-600 space-y-0.5">
                              {k.ascendant && <div>Ascendant (Lagna): <strong>{k.ascendant}</strong></div>}
                              {k.moonSign && <div>Moon Sign (Rashi): <strong>{k.moonSign}</strong></div>}
                              {k.nakshatra && <div>Birth Star: <strong>{k.nakshatra}</strong></div>}
                              {k.dasha && <div>Current Maha Dasha: <strong>{k.dasha}</strong></div>}
                            </div>
                            <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-100">
                              Coordinates: {k.dob} {k.tob} ({k.pob})
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: BIRTH DETAILS & ACCESS CONTROL */}
              {inspectTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-[#3B1E22]">
                      Seeker Celestial Coordinates &amp; Account Parameters
                    </h4>
                    <p className="text-xs text-stone-500">
                      Primary birth parameters used for astrological predictions and account security governance.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase">Full Name</span>
                      <p className="font-bold text-sm text-[#3B1E22]">{inspectUser.name}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase">Email Address</span>
                      <p className="font-semibold text-stone-800">{inspectUser.email}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase">Date of Birth</span>
                      <p className="font-semibold text-stone-800">{inspectUser.dateOfBirth || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase">Time of Birth</span>
                      <p className="font-semibold text-stone-800">{inspectUser.timeOfBirth || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase">Place of Birth</span>
                      <p className="font-semibold text-stone-800">{inspectUser.placeOfBirth || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase">Rashi / Zodiac Sign</span>
                      <p className="font-bold text-[#5B0D15]">{inspectUser.zodiacSign || 'Aries'}</p>
                    </div>
                  </div>

                  {/* Admin controls */}
                  <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm space-y-4">
                    <h5 className="font-serif text-sm font-bold text-[#3B1E22]">
                      Account Governance Controls
                    </h5>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                      <div>
                        <div className="text-xs font-semibold text-stone-700">Account Status</div>
                        <div className="text-[11px] text-stone-500">
                          Currently <strong className={inspectUser.status === 'ACTIVE' ? 'text-emerald-700' : 'text-rose-700'}>{inspectUser.status}</strong>
                        </div>
                      </div>

                      {canBlockUser(inspectUser as any) && (
                        <button
                          disabled={actionLoading}
                          onClick={() => handleToggleStatus(inspectUser.id, inspectUser.status)}
                          className={`px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                            inspectUser.status === 'ACTIVE'
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {inspectUser.status === 'ACTIVE' ? (
                            <>
                              <UserX className="w-3.5 h-3.5" />
                              <span>Block / Suspend Account</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Unblock / Reactivate Account</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {isSuperadmin && inspectUser.id !== currentUser?.id && (
                      <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <div className="text-xs font-semibold text-stone-700">Role Designation</div>
                          <div className="text-[11px] text-stone-500">
                            Only Superadmin has authority to add new admins or remove existing admins.
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {inspectUser.role === 'ADMIN' && (
                            <button
                              disabled={actionLoading}
                              onClick={() => handleUpdateRole(inspectUser.id, 'USER')}
                              className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              <UserMinus className="w-3.5 h-3.5 text-amber-700" />
                              <span>Remove Admin (Demote to User)</span>
                            </button>
                          )}
                          {inspectUser.role === 'USER' && (
                            <button
                              disabled={actionLoading}
                              onClick={() => handleUpdateRole(inspectUser.id, 'ADMIN')}
                              className="px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              <Shield className="w-3.5 h-3.5 text-purple-700" />
                              <span>Promote to Admin</span>
                            </button>
                          )}
                          <select
                            value={inspectUser.role}
                            onChange={(e) => handleUpdateRole(inspectUser.id, e.target.value)}
                            className="px-3 py-1.5 rounded-xl border border-purple-300 bg-purple-50 text-purple-900 font-bold text-xs"
                          >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="SUPERADMIN">SUPERADMIN</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {canDeleteUser(inspectUser as any) && (
                      <div className="pt-4 border-t border-rose-100 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <div className="text-xs font-semibold text-rose-800">Permanent Account Deletion</div>
                          <div className="text-[11px] text-rose-600">
                            Irreversibly delete this account. All actions are logged to the immutable audit trail.
                          </div>
                        </div>
                        <button
                          disabled={deleteLoading}
                          onClick={() =>
                            handleInitiateDelete({
                              id: inspectUser.id,
                              name: inspectUser.name,
                              email: inspectUser.email,
                              role: inspectUser.role as any,
                              status: inspectUser.status,
                              walletBalance: inspectUser.walletBalance,
                              createdAt: inspectUser.createdAt,
                            })
                          }
                          className="px-4 py-2 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{inspectUser.role === 'ADMIN' ? 'Delete Admin Account' : 'Permanently Delete User'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Modal Controls */}
            <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between shrink-0">
              <div className="text-[11px] text-stone-500">
                Seeker UUID: <code className="text-[#5B0D15]">{inspectUser.id}</code>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Close Inspection
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
