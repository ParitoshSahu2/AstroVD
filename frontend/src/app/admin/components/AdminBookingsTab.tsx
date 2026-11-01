import React from 'react';
import {
  Search,
  Compass,
  Calendar,
  Phone,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Video,
  Copy,
  Check,
  Clock,
  User as UserIcon,
  HeartHandshake,
  Eye,
  MoreVertical,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { SERVICES_CATALOGUE, formatGoogleMeetLink } from '../../../data/servicesData';
import { getAuthToken } from '../../../lib/auth';



interface AdminBookingsTabProps {
  bookingSearch: string;
  setBookingSearch: (s: string) => void;
  handleBookingSearchSubmit: (e: React.FormEvent) => void;
  bookingStatusFilter: string;
  setBookingStatusFilter: (s: string) => void;
  bookingServiceFilter: string;
  setBookingServiceFilter: (s: string) => void;
  bookingDateFilter: string;
  setBookingDateFilter: (s: string) => void;
  bookingsList: any[];
  bookingsLoading: boolean;
  bookingTotalCount: number;
  bookingPage: number;
  bookingTotalPages: number;
  fetchBookingsList: (p: number) => void;
  onSelectBooking: (b: any) => void;
}

export default function AdminBookingsTab({
  bookingSearch,
  setBookingSearch,
  handleBookingSearchSubmit,
  bookingStatusFilter,
  setBookingStatusFilter,
  bookingServiceFilter,
  setBookingServiceFilter,
  bookingDateFilter,
  setBookingDateFilter,
  bookingsList,
  bookingsLoading,
  bookingTotalCount,
  bookingPage,
  bookingTotalPages,
  fetchBookingsList,
  onSelectBooking,
}: AdminBookingsTabProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveMenuId(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleQuickStatus = async (b: any, targetStatus: string) => {
    setActiveMenuId(null);
    if (targetStatus === 'CANCELLED') {
      const ok = window.confirm(`Are you sure you want to cancel booking ${b.id}?`);
      if (!ok) return;
    }

    const token = getAuthToken();
    if (!token) {
      onSelectBooking(b);
      return;
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
    try {
      const res = await fetch(`${backendUrl}/api/admin/bookings/${b.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: targetStatus }),
      });
      if (res.ok) {
        fetchBookingsList(bookingPage);
      } else {
        onSelectBooking(b);
      }
    } catch {
      onSelectBooking(b);
    }
  };

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!id) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(id);
    } else {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = id;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (err) {
        console.error('Fallback copy failed', err);
      }
    }
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev));
    }, 2000);
  };

  const formatAppointmentDate = (dateVal: string | Date | undefined) => {
    if (!dateVal) return 'Date TBD';
    try {
      const str = typeof dateVal === 'string' ? dateVal : dateVal.toISOString();
      const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        const year = match[1];
        const monthIdx = parseInt(match[2], 10) - 1;
        const day = match[3];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${day} ${monthNames[monthIdx] || 'Nov'} ${year}`;
      }
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

  const formatCreatedDate = (dateVal: string | Date | undefined) => {
    if (!dateVal) return '';
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
      {/* Filter & Search Bar for Bookings */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-stone-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Booking Search Form */}
        <form onSubmit={handleBookingSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={bookingSearch}
              onChange={(e) => setBookingSearch(e.target.value)}
              placeholder="Search by Booking ID, customer name, email, or phone..."
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

        {/* Filters for Bookings */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <span className="font-semibold hidden sm:inline">Status:</span>
            <select
              value={bookingStatusFilter}
              onChange={(e) => setBookingStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PENDING">PENDING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {/* Service Filter */}
          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <span className="font-semibold hidden sm:inline">Service:</span>
            <select
              value={bookingServiceFilter}
              onChange={(e) => setBookingServiceFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 max-w-[150px] truncate"
            >
              <option value="ALL">All 29 Services</option>
              {SERVICES_CATALOGUE.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <span className="font-semibold hidden sm:inline">Date:</span>
            <input
              type="date"
              value={bookingDateFilter}
              onChange={(e) => setBookingDateFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          {(bookingSearch || bookingStatusFilter !== 'ALL' || bookingServiceFilter !== 'ALL' || bookingDateFilter) && (
            <button
              onClick={() => {
                setBookingSearch('');
                setBookingStatusFilter('ALL');
                setBookingServiceFilter('ALL');
                setBookingDateFilter('');
              }}
              className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Bookings Table Card */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-stone-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="space-y-0.5">
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#3B1E22] flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-700" />
              <span>Customer Consultation &amp; Ritual Bookings</span>
            </h3>
            <p className="text-xs text-stone-500">
              Showing {bookingsList.length} of {bookingTotalCount} customer appointment records
            </p>
          </div>

          <button
            onClick={() => fetchBookingsList(bookingPage)}
            className="px-3 py-1.5 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${bookingsLoading ? 'animate-spin text-[#5B0D15]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {bookingsLoading ? (
          <div className="py-20 text-center text-xs text-stone-500 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#5B0D15]" />
            <p>Loading customer appointment records...</p>
          </div>
        ) : bookingsList.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-500 space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mx-auto border border-amber-200">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="font-bold text-sm text-stone-700">No Bookings Found</p>
            <p className="text-stone-400 max-w-sm mx-auto">
              No customer appointments match the selected filter criteria or search query.
            </p>
          </div>
        ) : (
          <div className="w-full min-w-0">
            {/* Desktop & Tablet View: Clean 6-Column Table with Separate Status & Actions Menu */}
            <div className="hidden md:block w-full">
              <table className="w-full table-fixed text-left text-xs divide-y divide-stone-100">
                <thead>
                  <tr className="border-b border-stone-200/80 text-stone-400 uppercase tracking-wider font-semibold text-[10px]">
                    <th className="py-3 px-3.5 w-[15%] font-medium truncate">Booking ID / Date</th>
                    <th className="py-3 px-3.5 w-[22%] font-medium truncate">Customer</th>
                    <th className="py-3 px-3.5 w-[27%] font-medium truncate">Service</th>
                    <th className="py-3 px-3.5 w-[16%] font-medium truncate">Appointment</th>
                    <th className="py-3 px-3.5 w-[13%] font-medium truncate">Status</th>
                    <th className="py-3 px-3.5 w-[7%] font-medium text-right truncate">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {bookingsList.map((b, index) => {
                    const isConfirmed = b.status === 'CONFIRMED';
                    const isCompleted = b.status === 'COMPLETED';
                    const isCancelled = b.status === 'CANCELLED';
                    const isPendingPayment = b.status === 'PENDING_PAYMENT' || b.status === 'PENDING';

                    const custName = b.customerName || b.customer?.name || 'Customer';
                    const custEmail = b.customer?.email || b.user?.email || 'No email';
                    const custPhone = b.customerPhone || b.contactPhone || b.customer?.phone || 'No phone';
                    const isForSomeoneElse = b.isBookingForSomeoneElse || b.customer?.isBookingForSomeoneElse;
                    const accountOwner = b.customer?.accountOwnerName || b.user?.name;
                    const shortId = b.id ? (b.id.length > 8 ? b.id.slice(0, 8).toUpperCase() : b.id.toUpperCase()) : 'AVD-N/A';
                    const createdDate = formatCreatedDate(b.createdAt);
                    const appointmentDate = formatAppointmentDate(b.scheduledDate);
                    const appointmentTime = b.scheduledTime ? `${b.scheduledTime} IST` : 'Time TBD';
                    const serviceTitle = b.serviceTitle || b.serviceType || 'Consultation Service';
                    const astrologerName = b.astrologer?.name || 'Dr. Pandit Vishal Dubey';

                    const isNearBottom = index >= bookingsList.length - 2 && bookingsList.length > 2;
                    const canMeet = !isCancelled;
                    const canConfirm = isPendingPayment;
                    const canCancel = !isCancelled && !isCompleted;

                    return (
                      <tr
                        key={b.id}
                        onClick={() => onSelectBooking(b)}
                        className="hover:bg-stone-50/70 transition-colors cursor-pointer group"
                        title="Click to view full booking details"
                      >
                        {/* 1. Booking ID / Date */}
                        <td className="py-3 px-3.5 align-middle overflow-hidden">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span
                              className="font-mono text-stone-800 font-semibold text-xs block truncate group-hover:text-[#5B0D15] transition-colors"
                              title={`Full Booking ID: ${b.id}`}
                            >
                              {shortId}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyId(e, b.id)}
                              className={`p-1 rounded transition-colors shrink-0 cursor-pointer ${
                                copiedId === b.id
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
                              }`}
                              title={copiedId === b.id ? 'Copied full ID!' : 'Copy full ID'}
                              aria-label="Copy full ID"
                            >
                              {copiedId === b.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <span className="text-[11px] text-stone-400 block truncate mt-0.5" title={`Booked: ${createdDate}`}>
                            {createdDate ? `Booked ${createdDate}` : ''}
                          </span>
                        </td>

                        {/* 2. Customer */}
                        <td className="py-3 px-3.5 align-middle overflow-hidden">
                          <div className="min-w-0 pr-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className="font-semibold text-stone-900 block truncate text-xs leading-snug"
                                title={custName}
                              >
                                {custName}
                              </span>
                              {isForSomeoneElse && (
                                <span
                                  className="text-[9px] font-semibold text-purple-700 bg-purple-50 border border-purple-200/80 px-1 py-0.2 rounded shrink-0"
                                  title={`Proxy Booking: Booked for someone else by ${accountOwner || 'User'}`}
                                >
                                  Proxy
                                </span>
                              )}
                            </div>
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

                        {/* 3. Service */}
                        <td className="py-3 px-3.5 align-middle overflow-hidden">
                          <div className="min-w-0 pr-2">
                            <span
                              className="font-medium text-stone-900 block truncate text-xs leading-snug"
                              title={serviceTitle}
                            >
                              {serviceTitle}
                            </span>
                            <span
                              className="text-[11px] text-stone-400 block truncate mt-0.5"
                              title={astrologerName}
                            >
                              {astrologerName}
                            </span>
                          </div>
                        </td>

                        {/* 4. Appointment */}
                        <td className="py-3 px-3.5 align-middle overflow-hidden">
                          <div className="min-w-0">
                            <span
                              className="font-semibold text-stone-800 block truncate text-xs leading-snug tracking-tight"
                              title={appointmentDate}
                            >
                              {appointmentDate}
                            </span>
                            <span
                              className="text-[11px] text-stone-500 font-normal block truncate mt-0.5"
                              title={appointmentTime}
                            >
                              {appointmentTime}
                            </span>
                          </div>
                        </td>

                        {/* 5. Status (Separate, Dedicated Column) */}
                        <td className="py-3 px-3.5 align-middle overflow-hidden">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border whitespace-nowrap ${
                              isCancelled
                                ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                                : isCompleted
                                ? 'bg-sky-50 text-sky-700 border-sky-200/80'
                                : isConfirmed
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                                : isPendingPayment
                                ? 'bg-amber-50 text-amber-900 border-amber-200/80'
                                : 'bg-stone-50 text-stone-700 border-stone-200/80'
                            }`}
                            title={`Booking Status: ${b.status || 'PENDING'}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                isCancelled
                                  ? 'bg-rose-500'
                                  : isCompleted
                                  ? 'bg-sky-500'
                                  : isConfirmed
                                  ? 'bg-emerald-600'
                                  : isPendingPayment
                                  ? 'bg-amber-500'
                                  : 'bg-stone-400'
                              }`}
                            />
                            <span>
                              {isPendingPayment
                                ? 'Pending'
                                : isConfirmed
                                ? 'Confirmed'
                                : isCompleted
                                ? 'Completed'
                                : isCancelled
                                ? 'Cancelled'
                                : b.status || 'Pending'}
                            </span>
                          </span>
                        </td>

                        {/* 6. Actions (Single Compact Three-Dot Menu '⋮') */}
                        <td className="py-3 px-3.5 text-right align-middle">
                          <div className="relative inline-block text-left">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId((prev) => (prev === b.id ? null : b.id));
                              }}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                activeMenuId === b.id
                                  ? 'bg-stone-100 text-stone-900 border-stone-300'
                                  : 'border-transparent text-stone-400 hover:text-stone-700 hover:bg-stone-100 hover:border-stone-200'
                              }`}
                              title="Booking actions"
                              aria-label={`Actions for booking ${shortId}`}
                              aria-haspopup="true"
                              aria-expanded={activeMenuId === b.id}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {activeMenuId === b.id && (
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
                                  className={`absolute right-0 z-40 w-44 rounded-2xl bg-white/95 backdrop-blur-xl border border-stone-200 shadow-xl py-1 text-xs text-stone-700 animate-fadeIn ${
                                    isNearBottom ? 'bottom-full mb-1' : 'top-full mt-1'
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onSelectBooking(b);
                                    }}
                                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-stone-100/80 hover:text-stone-900 transition-colors cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-stone-400" />
                                    <span>View Details</span>
                                  </button>

                                  {canMeet && (
                                    <a
                                      href={b.meetLink && b.meetLink.includes('meet.google.com') ? b.meetLink : formatGoogleMeetLink(b.id)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={() => setActiveMenuId(null)}
                                      className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-emerald-50 hover:text-emerald-900 text-emerald-800 transition-colors cursor-pointer"
                                    >
                                      <Video className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Join Meeting</span>
                                    </a>
                                  )}

                                  {canConfirm && (
                                    <button
                                      type="button"
                                      onClick={() => handleQuickStatus(b, 'CONFIRMED')}
                                      className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-emerald-50 hover:text-emerald-900 text-emerald-800 transition-colors cursor-pointer"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Confirm Booking</span>
                                    </button>
                                  )}

                                  {canCancel && (
                                    <button
                                      type="button"
                                      onClick={() => handleQuickStatus(b, 'CANCELLED')}
                                      className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-rose-50 text-rose-700 transition-colors cursor-pointer border-t border-stone-100"
                                    >
                                      <XCircle className="w-3.5 h-3.5 text-rose-500" />
                                      <span>Cancel Booking</span>
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

            {/* Mobile View: Compact Responsive Booking Cards (No Horizontal Scrolling) */}
            <div className="md:hidden space-y-3">
              {bookingsList.map((b, index) => {
                const isConfirmed = b.status === 'CONFIRMED';
                const isCompleted = b.status === 'COMPLETED';
                const isCancelled = b.status === 'CANCELLED';
                const isPendingPayment = b.status === 'PENDING_PAYMENT' || b.status === 'PENDING';

                const custName = b.customerName || b.customer?.name || 'Customer';
                const custEmail = b.customer?.email || b.user?.email || 'No email';
                const custPhone = b.customerPhone || b.contactPhone || b.customer?.phone || 'No phone';
                const isForSomeoneElse = b.isBookingForSomeoneElse || b.customer?.isBookingForSomeoneElse;
                const accountOwner = b.customer?.accountOwnerName || b.user?.name;
                const shortId = b.id ? (b.id.length > 8 ? b.id.slice(0, 8).toUpperCase() : b.id.toUpperCase()) : 'AVD-N/A';
                const createdDate = formatCreatedDate(b.createdAt);
                const appointmentDate = formatAppointmentDate(b.scheduledDate);
                const appointmentTime = b.scheduledTime ? `${b.scheduledTime} IST` : 'Time TBD';
                const serviceTitle = b.serviceTitle || b.serviceType || 'Consultation Service';
                const astrologerName = b.astrologer?.name || 'Dr. Pandit Vishal Dubey';

                const isNearBottom = index >= bookingsList.length - 2 && bookingsList.length > 2;
                const canMeet = !isCancelled;
                const canConfirm = isPendingPayment;
                const canCancel = !isCancelled && !isCompleted;

                return (
                  <div
                    key={b.id}
                    onClick={() => onSelectBooking(b)}
                    className="p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:border-amber-400 transition-all cursor-pointer space-y-2.5"
                    title="Click to view details"
                  >
                    {/* Header: Short ID, Date, Status & Actions Menu */}
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-mono text-stone-800 font-semibold text-xs">
                          {shortId}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyId(e, b.id)}
                          className="p-1 rounded text-stone-400 hover:text-stone-700"
                          title="Copy Full ID"
                        >
                          {copiedId === b.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                        {createdDate && (
                          <span className="text-[11px] text-stone-400">
                            • {createdDate}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                            isCancelled
                              ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                              : isCompleted
                              ? 'bg-sky-50 text-sky-700 border-sky-200/80'
                              : isConfirmed
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                              : isPendingPayment
                              ? 'bg-amber-50 text-amber-900 border-amber-200/80'
                              : 'bg-stone-50 text-stone-700 border-stone-200/80'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCancelled
                                ? 'bg-rose-500'
                                : isCompleted
                                ? 'bg-sky-500'
                                : isConfirmed
                                ? 'bg-emerald-600'
                                : isPendingPayment
                                ? 'bg-amber-500'
                                : 'bg-stone-400'
                            }`}
                          />
                          <span>
                            {isPendingPayment
                              ? 'Pending'
                              : isConfirmed
                              ? 'Confirmed'
                              : isCompleted
                              ? 'Completed'
                              : isCancelled
                              ? 'Cancelled'
                              : b.status || 'Pending'}
                          </span>
                        </span>

                        {/* Three-Dot Menu Button */}
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId((prev) => (prev === b.id ? null : b.id));
                            }}
                            className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                            title="Actions"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {activeMenuId === b.id && (
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
                                className={`absolute right-0 z-40 w-40 rounded-xl bg-white border border-stone-200 shadow-xl py-1 text-xs text-stone-700 animate-fadeIn ${
                                  isNearBottom ? 'bottom-full mb-1' : 'top-full mt-1'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onSelectBooking(b);
                                  }}
                                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-stone-50"
                                >
                                  <Eye className="w-3.5 h-3.5 text-stone-400" />
                                  <span>View Details</span>
                                </button>

                                {canMeet && (
                                  <a
                                    href={b.meetLink && b.meetLink.includes('meet.google.com') ? b.meetLink : formatGoogleMeetLink(b.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setActiveMenuId(null)}
                                    className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-emerald-50 text-emerald-800"
                                  >
                                    <Video className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Join Meeting</span>
                                  </a>
                                )}

                                {canConfirm && (
                                  <button
                                    type="button"
                                    onClick={() => handleQuickStatus(b, 'CONFIRMED')}
                                    className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-emerald-50 text-emerald-800"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Confirm</span>
                                  </button>
                                )}

                                {canCancel && (
                                  <button
                                    type="button"
                                    onClick={() => handleQuickStatus(b, 'CANCELLED')}
                                    className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-rose-50 text-rose-700 border-t border-stone-100"
                                  >
                                    <XCircle className="w-3.5 h-3.5 text-rose-500" />
                                    <span>Cancel</span>
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Customer & Service Details */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-stone-400 block">Customer</span>
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="font-semibold text-stone-900 truncate">{custName}</span>
                          {isForSomeoneElse && (
                            <span className="text-[9px] font-semibold text-purple-700 bg-purple-50 border border-purple-200/80 px-1 rounded">
                              Proxy
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5 truncate">
                          <Phone className="w-3 h-3 text-stone-400 shrink-0" />
                          <span className="font-mono truncate">{custPhone}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-stone-400 block">Service</span>
                        <span className="font-medium text-stone-900 truncate block">
                          {serviceTitle}
                        </span>
                        <span className="text-[11px] text-stone-400 truncate block">
                          {astrologerName}
                        </span>
                      </div>
                    </div>

                    {/* Footer: Appointment Slot & View Details */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                      <div>
                        <span className="text-[10px] text-stone-400 block">Appointment</span>
                        <span className="font-semibold text-stone-800 text-xs block">
                          {appointmentDate} • {appointmentTime}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectBooking(b);
                        }}
                        className="h-6 px-2.5 rounded-md border border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-medium text-[11px] transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pagination for Bookings */}
        {bookingTotalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-stone-100 text-xs">
            <span className="text-stone-500">
              Page {bookingPage} of {bookingTotalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={bookingPage <= 1}
                onClick={() => fetchBookingsList(bookingPage - 1)}
                className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>
              <button
                disabled={bookingPage >= bookingTotalPages}
                onClick={() => fetchBookingsList(bookingPage + 1)}
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
