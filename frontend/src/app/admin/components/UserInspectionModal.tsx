import React, { useEffect } from 'react';
import { useScrollLock } from '../../../lib/scrollLock';
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
  UserCheck,
  UserX,
  UserMinus,
  Shield,
  Trash2,
  Search,
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
  // Lock body scroll and prevent background scroll chaining
  useScrollLock(Boolean(selectedUserId));

  // Quick filter & search for consultations list
  const [bookingFilter, setBookingFilter] = React.useState<'ALL' | 'CONFIRMED' | 'PROCESSING' | 'COMPLETED'>('ALL');
  const [bookingSearchQuery, setBookingSearchQuery] = React.useState('');

  const formatBookingDate = (dateVal: string | undefined) => {
    if (!dateVal) return 'Date TBD';
    try {
      const match = String(dateVal).match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        const year = match[1];
        const monthIdx = parseInt(match[2], 10) - 1;
        const day = match[3];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${day} ${monthNames[monthIdx] || 'Nov'} ${year}`;
      }
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return String(dateVal);
    }
  };

  useEffect(() => {
    if (!selectedUserId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedUserId, onClose]);

  if (!selectedUserId) return null;

  return (
    <div
      data-lenis-prevent="true"
      onWheel={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto overscroll-contain modal-backdrop-contain animate-fadeIn"
    >
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
                  {inspectUser?.name || 'Loading User Profile...'}
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
            <RefreshCw className="w-7 h-7 animate-spin mx-auto text-[#5B0D15]" />
            <p className="font-semibold text-sm text-stone-700">Loading user details...</p>
          </div>
        ) : (
          <>
            {/* Quick User Action Summary Bar */}
            <div className="bg-[#FAF8F5] border-b border-stone-200/80 px-6 py-3 flex flex-wrap items-center justify-between text-xs gap-3 shrink-0">
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-stone-200/90 shadow-2xs">
                  <ShoppingCart className="w-3.5 h-3.5 text-[#5B0D15] shrink-0" />
                  <span className="text-stone-600 font-medium">Orders:</span>
                  <strong className="text-stone-900 font-bold">{inspectUser.orders?.length || 0}</strong>
                  {Boolean(inspectUser.orders?.filter((o) => (o.status || '').toUpperCase() === 'PROCESSING').length) && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-semibold">
                      {inspectUser.orders?.filter((o) => (o.status || '').toUpperCase() === 'PROCESSING').length} processing
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-stone-200/90 shadow-2xs">
                  <Compass className="w-3.5 h-3.5 text-[#5B0D15] shrink-0" />
                  <span className="text-stone-600 font-medium">Consultations:</span>
                  <strong className="text-stone-900 font-bold">{inspectUser.bookings?.length || 0}</strong>
                  {Boolean(inspectUser.bookings?.filter((b) => (b.status || '').toUpperCase() === 'CONFIRMED').length) && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                      {inspectUser.bookings?.filter((b) => (b.status || '').toUpperCase() === 'CONFIRMED').length} confirmed
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 4 Inspection Navigation Tabs */}
            <div className="flex border-b border-stone-200 bg-white px-6 pt-2.5 gap-4 overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => setInspectTab('purchases')}
                className={`pb-2.5 px-2 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                  inspectTab === 'purchases' ? 'text-[#5B0D15]' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Store Orders ({inspectUser.orders?.length || 0})</span>
                {inspectTab === 'purchases' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#5B0D15] rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setInspectTab('services')}
                className={`pb-2.5 px-2 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                  inspectTab === 'services' ? 'text-[#5B0D15]' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Consultations ({inspectUser.bookings?.length || 0})</span>
                {inspectTab === 'services' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#5B0D15] rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setInspectTab('activity')}
                className={`pb-2.5 px-2 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                  inspectTab === 'activity' ? 'text-[#5B0D15]' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Activity Timeline</span>
                {inspectTab === 'activity' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#5B0D15] rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setInspectTab('profile')}
                className={`pb-2.5 px-2 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                  inspectTab === 'profile' ? 'text-[#5B0D15]' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>Kundli &amp; Profile</span>
                {inspectTab === 'profile' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#5B0D15] rounded-full" />
                )}
              </button>
            </div>

            {/* Tab Body */}
            <div data-lenis-prevent="true" className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 max-h-[60vh] modal-scroll-container overscroll-contain">
              {/* TAB 1: WHAT THEY BOUGHT (STORE ORDERS) */}
              {inspectTab === 'purchases' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-stone-200/80">
                    <div>
                      <h4 className="font-serif text-base sm:text-lg font-bold text-[#3B1E22]">
                        Store Orders ({inspectUser.orders?.length || 0})
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-stone-400 block font-medium">Total Store Spend</span>
                      <div className="text-base sm:text-lg font-bold text-[#5B0D15]">
                        ₹{inspectUser.orders?.reduce((acc, o) => acc + (o.totalAmount || 0), 0).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {inspectUser.orders?.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 text-center text-xs text-stone-500 space-y-2">
                      <ShoppingCart className="w-8 h-8 mx-auto text-stone-400" />
                      <p className="font-semibold text-stone-800">No store orders recorded yet.</p>
                      <p className="text-stone-400">This user has not purchased products from the Astro store.</p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {inspectUser.orders?.map((order) => {
                        const isDelivered = (order.status || '').toUpperCase() === 'DELIVERED';

                        return (
                          <div
                            key={order.id}
                            className="rounded-2xl bg-white border border-stone-200/90 shadow-2xs overflow-hidden transition-all hover:border-amber-300/60"
                          >
                            {/* 1. Order Header Bar */}
                            <div className="px-4 py-3 bg-[#FAF8F5] border-b border-stone-200/80 flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                {/* Order ID Badge */}
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-800 text-xs font-mono font-bold shadow-2xs">
                                  <span className="text-stone-400 font-sans text-[10px] uppercase tracking-wider font-semibold">
                                    Order
                                  </span>
                                  <span>#{order.id.slice(0, 8).toUpperCase()}</span>
                                </span>

                                {/* Date Placed */}
                                <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                                  <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                  <span>
                                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                {/* Clean Status Pill */}
                                {isDelivered ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                                    <span>Delivered</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300">
                                    <Clock className="w-3 h-3 text-amber-700 shrink-0" />
                                    <span>Processing</span>
                                  </span>
                                )}

                                {/* Total Amount */}
                                <div className="text-right pl-3 border-l border-stone-200">
                                  <span className="text-[10px] text-stone-400 block leading-tight font-medium">Total</span>
                                  <span className="font-bold text-sm sm:text-base text-[#5B0D15]">
                                    ₹{order.totalAmount.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* 2. Itemized Products Section */}
                            <div className="p-4 sm:p-5 divide-y divide-stone-100">
                              {order.items?.map((item) => (
                                <div
                                  key={item.id}
                                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-12 h-12 rounded-xl bg-stone-50 border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center">
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
                                    <div className="min-w-0">
                                      <h5 className="font-semibold text-xs sm:text-sm text-stone-900 truncate">
                                        {item.product?.name || 'Spiritual Item'}
                                      </h5>
                                      <div className="text-[11px] text-stone-500 font-medium flex items-center flex-wrap gap-2 mt-0.5">
                                        {item.product?.category && (
                                          <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-semibold uppercase">
                                            {item.product.category}
                                          </span>
                                        )}
                                        <span>•</span>
                                        <span className="text-stone-700 font-semibold">Qty: {item.quantity}</span>
                                        {item.product?.labCertified && (
                                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-bold">
                                            Lab Certified
                                          </span>
                                        )}
                                      </div>
                                      {item.product?.energizedBy && (
                                        <div className="text-[10px] text-amber-800/90 font-medium mt-0.5 flex items-center gap-1">
                                          <Sparkles className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                                          <span>Consecrated by: {item.product.energizedBy}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <div className="font-bold text-xs sm:text-sm text-[#5B0D15]">
                                      ₹{(item.price * item.quantity).toFixed(2)}
                                    </div>
                                    {item.quantity > 1 && (
                                      <div className="text-[10px] text-stone-400 font-medium">₹{item.price.toFixed(2)} each</div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* 3. Shipping / Delivery Address Block */}
                            {order.shippingAddress && (
                              <div className="px-4 py-2.5 bg-[#FAF8F5] border-t border-stone-200/70 text-xs text-stone-600 flex items-start gap-2.5">
                                <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                                <div className="min-w-0 flex-1 leading-relaxed">
                                  <span className="font-semibold text-stone-800">
                                    Delivery: {order.shippingAddress.recipient}
                                  </span>
                                  <span className="text-stone-400"> • </span>
                                  <span>
                                    {order.shippingAddress.addressLine}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                  </span>
                                  {order.shippingAddress.phone && (
                                    <span className="text-stone-500 font-medium block sm:inline sm:ml-2">
                                      (Phone: {order.shippingAddress.phone})
                                    </span>
                                  )}
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

              {/* TAB 2: CONSULTATIONS & BOOKINGS */}
              {inspectTab === 'services' && (() => {
                const allBookings = inspectUser.bookings || [];
                const confirmedCount = allBookings.filter((b) => (b.status || '').toUpperCase() === 'CONFIRMED').length;
                const processingCount = allBookings.filter((b) => {
                  const s = (b.status || '').toUpperCase();
                  return s === 'PROCESSING' || s === 'PENDING' || s === 'CUSTOMER_REVIEW';
                }).length;
                const completedCount = allBookings.filter((b) => (b.status || '').toUpperCase() === 'COMPLETED').length;

                const filteredBookings = allBookings.filter((b) => {
                  const s = (b.status || '').toUpperCase();
                  if (bookingFilter === 'CONFIRMED' && s !== 'CONFIRMED') return false;
                  if (bookingFilter === 'PROCESSING' && (s !== 'PROCESSING' && s !== 'PENDING' && s !== 'CUSTOMER_REVIEW')) return false;
                  if (bookingFilter === 'COMPLETED' && s !== 'COMPLETED') return false;

                  if (bookingSearchQuery.trim()) {
                    const q = bookingSearchQuery.toLowerCase();
                    const idMatch = (b.id || '').toLowerCase().includes(q);
                    const serviceMatch = (b.serviceType || '').toLowerCase().includes(q);
                    const astroMatch = (b.astrologer?.name || '').toLowerCase().includes(q);
                    const notesMatch = (b.notes || '').toLowerCase().includes(q);
                    const dateMatch = (b.scheduledDate || '').toLowerCase().includes(q);
                    return idMatch || serviceMatch || astroMatch || notesMatch || dateMatch;
                  }
                  return true;
                });

                const totalDakshina = allBookings.reduce((sum, b) => sum + (b.totalCost || 0), 0);

                return (
                  <div className="space-y-3.5">
                    {/* Header + Filter Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200/80">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="font-serif text-base sm:text-lg font-bold text-[#3B1E22]">
                          Consultations ({allBookings.length})
                        </h4>

                        {allBookings.length > 0 && (
                          <div className="inline-flex items-center p-0.5 rounded-xl bg-stone-100 border border-stone-200 text-xs">
                            <button
                              type="button"
                              onClick={() => setBookingFilter('ALL')}
                              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                                bookingFilter === 'ALL'
                                  ? 'bg-white text-[#5B0D15] shadow-2xs font-bold'
                                  : 'text-stone-500 hover:text-stone-800'
                              }`}
                            >
                              All ({allBookings.length})
                            </button>
                            {confirmedCount > 0 && (
                              <button
                                type="button"
                                onClick={() => setBookingFilter('CONFIRMED')}
                                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                                  bookingFilter === 'CONFIRMED'
                                    ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                                    : 'text-stone-500 hover:text-stone-800'
                                }`}
                              >
                                Confirmed ({confirmedCount})
                              </button>
                            )}
                            {processingCount > 0 && (
                              <button
                                type="button"
                                onClick={() => setBookingFilter('PROCESSING')}
                                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                                  bookingFilter === 'PROCESSING'
                                    ? 'bg-white text-amber-900 shadow-2xs font-bold'
                                    : 'text-stone-500 hover:text-stone-800'
                                }`}
                              >
                                Processing ({processingCount})
                              </button>
                            )}
                            {completedCount > 0 && (
                              <button
                                type="button"
                                onClick={() => setBookingFilter('COMPLETED')}
                                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                                  bookingFilter === 'COMPLETED'
                                    ? 'bg-white text-stone-900 shadow-2xs font-bold'
                                    : 'text-stone-500 hover:text-stone-800'
                                }`}
                              >
                                Completed ({completedCount})
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {allBookings.length > 3 && (
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={bookingSearchQuery}
                              onChange={(e) => setBookingSearchQuery(e.target.value)}
                              placeholder="Search bookings..."
                              className="pl-8 pr-2.5 py-1 rounded-lg text-xs bg-white border border-stone-200 focus:outline-none focus:border-[#5B0D15] w-36 sm:w-44 text-stone-800"
                            />
                          </div>
                        )}
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-stone-400 block font-medium leading-none">Total Dakshina</span>
                          <div className="text-sm sm:text-base font-bold text-[#5B0D15]">
                            ₹{totalDakshina.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {allBookings.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 text-center text-xs text-stone-500 space-y-1.5">
                        <Compass className="w-7 h-7 mx-auto text-stone-400" />
                        <p className="font-semibold text-stone-800">No consultations recorded.</p>
                      </div>
                    ) : filteredBookings.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 text-center text-xs text-stone-500 space-y-2">
                        <p className="font-semibold text-stone-800">No matching bookings found.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setBookingFilter('ALL');
                            setBookingSearchQuery('');
                          }}
                          className="text-xs font-semibold text-[#5B0D15] hover:underline cursor-pointer"
                        >
                          Reset filters
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-stone-200/90 bg-white overflow-hidden shadow-2xs">
                        {/* Desktop Table View: Clean, Structured, Highly Scannable */}
                        <div className="hidden sm:block overflow-x-auto">
                          <table className="w-full text-left text-xs divide-y divide-stone-150">
                            <thead>
                              <tr className="bg-[#FAF8F5] text-stone-500 font-semibold text-[10px] uppercase tracking-wider">
                                <th className="py-2.5 px-3.5 w-[28%] font-semibold">Service / ID</th>
                                <th className="py-2.5 px-3.5 w-[26%] font-semibold">Astrologer</th>
                                <th className="py-2.5 px-3.5 w-[24%] font-semibold">Scheduled Slot</th>
                                <th className="py-2.5 px-3.5 w-[11%] font-semibold text-right">Fee</th>
                                <th className="py-2.5 px-3.5 w-[11%] font-semibold text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                              {filteredBookings.map((booking) => {
                                const bStatus = (booking.status || '').toUpperCase();
                                const isConfirmed = bStatus === 'CONFIRMED';
                                const isCompleted = bStatus === 'COMPLETED';
                                const shortId = booking.id ? booking.id.slice(0, 8).toUpperCase() : 'N/A';
                                const astroName = booking.astrologer?.name || 'Astrologer';
                                const mode = (booking.serviceType || 'CONSULTATION').toUpperCase();

                                return (
                                  <tr
                                    key={booking.id}
                                    className="hover:bg-amber-50/25 transition-colors"
                                  >
                                    {/* 1. Service / ID */}
                                    <td className="py-2.5 px-3.5 align-middle">
                                      <div className="flex items-center gap-2.5">
                                        <div
                                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                                            mode === 'VIDEO'
                                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                                              : mode === 'AUDIO'
                                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                          }`}
                                        >
                                          {mode === 'VIDEO' && <Video className="w-3.5 h-3.5" />}
                                          {mode === 'AUDIO' && <Phone className="w-3.5 h-3.5" />}
                                          {mode !== 'VIDEO' && mode !== 'AUDIO' && <MessageSquare className="w-3.5 h-3.5" />}
                                        </div>
                                        <div className="min-w-0">
                                          <div className="font-semibold text-stone-900 truncate text-xs">
                                            {booking.serviceType || 'Consultation'}
                                          </div>
                                          <div className="font-mono text-[10px] text-stone-400">
                                            #{shortId}
                                          </div>
                                        </div>
                                      </div>
                                    </td>

                                    {/* 2. Astrologer */}
                                    <td className="py-2.5 px-3.5 align-middle">
                                      <div className="font-medium text-stone-800 text-xs truncate">
                                        {astroName}
                                      </div>
                                      {booking.notes ? (
                                        <div className="text-[10px] text-stone-400 truncate max-w-[200px]" title={booking.notes}>
                                          {booking.notes}
                                        </div>
                                      ) : (
                                        <div className="text-[10px] text-stone-300">Vedic Consultation</div>
                                      )}
                                    </td>

                                    {/* 3. Scheduled Slot */}
                                    <td className="py-2.5 px-3.5 align-middle whitespace-nowrap">
                                      <div className="font-medium text-stone-800 flex items-center gap-1.5 text-xs">
                                        <Calendar className="w-3 h-3 text-stone-400 shrink-0" />
                                        <span>{formatBookingDate(booking.scheduledDate)}</span>
                                      </div>
                                      <div className="text-[10px] text-stone-500 font-mono flex items-center gap-1 mt-0.5">
                                        <Clock className="w-2.5 h-2.5 text-stone-400 shrink-0" />
                                        <span>{booking.scheduledTime || 'TBD'} ({booking.durationMinutes || 30}m)</span>
                                      </div>
                                    </td>

                                    {/* 4. Dakshina Fee */}
                                    <td className="py-2.5 px-3.5 align-middle text-right whitespace-nowrap">
                                      <span className="font-bold text-xs sm:text-sm text-[#5B0D15]">
                                        ₹{(booking.totalCost || 0).toFixed(2)}
                                      </span>
                                    </td>

                                    {/* 5. Status Pill */}
                                    <td className="py-2.5 px-3.5 align-middle text-right whitespace-nowrap">
                                      {isConfirmed ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                                          <span>Confirmed</span>
                                        </span>
                                      ) : isCompleted ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                                          <Sparkles className="w-2.5 h-2.5 text-stone-500 shrink-0" />
                                          <span>Completed</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-300">
                                          <Clock className="w-2.5 h-2.5 text-amber-700 shrink-0" />
                                          <span>Processing</span>
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Compact Cards View */}
                        <div className="sm:hidden divide-y divide-stone-150">
                          {filteredBookings.map((booking) => {
                            const bStatus = (booking.status || '').toUpperCase();
                            const isConfirmed = bStatus === 'CONFIRMED';
                            const isCompleted = bStatus === 'COMPLETED';
                            const shortId = booking.id ? booking.id.slice(0, 8).toUpperCase() : 'N/A';
                            const astroName = booking.astrologer?.name || 'Astrologer';
                            const mode = (booking.serviceType || 'CONSULTATION').toUpperCase();

                            return (
                              <div key={booking.id} className="p-3 space-y-1.5 text-xs">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div
                                      className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border ${
                                        mode === 'VIDEO'
                                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                                          : mode === 'AUDIO'
                                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      }`}
                                    >
                                      {mode === 'VIDEO' && <Video className="w-3 h-3" />}
                                      {mode === 'AUDIO' && <Phone className="w-3 h-3" />}
                                      {mode !== 'VIDEO' && mode !== 'AUDIO' && <MessageSquare className="w-3 h-3" />}
                                    </div>
                                    <span className="font-semibold text-stone-900 truncate">
                                      {booking.serviceType || 'Consultation'}
                                    </span>
                                    <span className="font-mono text-[10px] text-stone-400">
                                      #{shortId}
                                    </span>
                                  </div>

                                  {isConfirmed ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                                      Confirmed
                                    </span>
                                  ) : isCompleted ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200 shrink-0">
                                      Completed
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-300 shrink-0">
                                      Processing
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-0.5">
                                  <span className="truncate max-w-[150px] font-medium text-stone-700">
                                    {astroName}
                                  </span>
                                  <span>
                                    {formatBookingDate(booking.scheduledDate)} • {booking.scheduledTime || 'TBD'}
                                  </span>
                                  <span className="font-bold text-[#5B0D15]">
                                    ₹{(booking.totalCost || 0).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Saved Readings */}
                    {inspectUser.savedReadings && inspectUser.savedReadings.length > 0 && (
                      <div className="space-y-2.5 pt-3 border-t border-stone-200">
                        <div className="flex items-center justify-between">
                          <h5 className="font-serif text-sm font-bold text-[#3B1E22] flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-600" />
                            <span>Horoscope Reports ({inspectUser.savedReadings.length})</span>
                          </h5>
                        </div>
                        <div className="rounded-2xl border border-stone-200/90 bg-white overflow-hidden divide-y divide-stone-150 shadow-2xs">
                          {inspectUser.savedReadings.map((reading: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-3 sm:p-3.5 hover:bg-amber-50/20 transition-colors flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="min-w-0">
                                <span className="font-semibold text-stone-900 block truncate">
                                  {reading.serviceName || 'Astrology Reading'}
                                </span>
                                <p className="text-stone-500 text-[11px] truncate max-w-md">{reading.summary}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 block">
                                  {reading.status || 'Processing'}
                                </span>
                                <span className="text-stone-400 text-[10px] block mt-0.5">{reading.date}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* TAB 3: PLATFORM ACTION TIMELINE & KUNDLI */}
              {inspectTab === 'activity' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-sm font-bold text-[#3B1E22] flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#5B0D15]" />
                        <span>Activity Timeline</span>
                      </h4>
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
                                  Order #{o.id.slice(0, 8).toUpperCase()}: {o.items?.map((i) => i.product?.name).filter(Boolean).join(', ') || 'Spiritual Item'}
                                </div>
                                <div className="text-[11px] text-stone-500">
                                  ₹{o.totalAmount.toFixed(2)} • Destination: {o.shippingAddress?.city || 'India'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {isDelivered ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                  Delivered
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                  Processing
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
                                  {b.serviceType} Consultation • {b.astrologer?.name || 'Astrologer'}
                                </div>
                                <div className="text-[11px] text-stone-500">
                                  ₹{b.totalCost.toFixed(2)} • {formatBookingDate(b.scheduledDate)} at {b.scheduledTime} ({b.durationMinutes}m)
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {isConfirmed ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                  Confirmed
                                </span>
                              ) : isCompleted ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
                                  Completed
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                  Processing
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
                                Janam Kundli: {k.title || 'Birth Chart'}
                              </div>
                              <div className="text-[11px] text-stone-500">
                                Ascendant: {k.ascendant || 'Lagna'} • Moon Sign: {k.moonSign || 'Rashi'} • Star: {k.nakshatra || 'Nakshatra'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              Calculated
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
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-[#3B1E22]">
                                {tx.description.replace(/wallet:?\s*/i, '')}
                              </div>
                              <div className="text-[11px] text-stone-500">
                                Transferred: ₹{tx.amount.toFixed(2)}
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
                        <span>Saved Kundli Charts ({inspectUser.savedKundlis?.length || 0})</span>
                      </h4>
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
                      Birth &amp; Account Details
                    </h4>
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
                      Account Governance
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
                              <span>Block Account</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Reactivate Account</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {isSuperadmin && inspectUser.id !== currentUser?.id && (
                      <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <div className="text-xs font-semibold text-stone-700">Role Designation</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {inspectUser.role === 'ADMIN' && (
                            <button
                              disabled={actionLoading}
                              onClick={() => handleUpdateRole(inspectUser.id, 'USER')}
                              className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              <UserMinus className="w-3.5 h-3.5 text-amber-700" />
                              <span>Demote to User</span>
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
                            Permanently delete this account.
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
              <div className="text-[11px] text-stone-500 font-mono">
                ID: <code className="text-[#5B0D15]">{inspectUser.id}</code>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
