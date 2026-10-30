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
} from 'lucide-react';
import { SERVICES_CATALOGUE, formatGoogleMeetLink } from '../../../data/servicesData';



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
          <div className="w-full min-w-0 overflow-x-auto">
            <table className="w-full min-w-[960px] table-fixed text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider font-semibold text-[11px]">
                  <th className="py-2.5 sm:py-3 px-2 sm:px-3 w-[14%] font-medium whitespace-nowrap">Booking ID / Date</th>
                  <th className="py-2.5 sm:py-3 px-2 sm:px-3 w-[17%] font-medium whitespace-nowrap">Customer Details</th>
                  <th className="py-2.5 sm:py-3 px-2 sm:px-3 w-[17%] font-medium whitespace-nowrap">Service &amp; Pandit</th>
                  <th className="py-2.5 sm:py-3 px-2 sm:px-3 w-[14%] font-medium whitespace-nowrap">Scheduled Slot</th>
                  <th className="py-2.5 sm:py-3 px-2 sm:px-3 text-center w-[11%] font-medium whitespace-nowrap">Dakshina</th>
                  <th className="py-2.5 sm:py-3 px-2 sm:px-3 text-center w-[12%] font-medium whitespace-nowrap">Status</th>
                  <th className="py-2.5 sm:py-3 px-2 sm:px-3 text-right w-[15%] font-medium whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {bookingsList.map((b) => {
                  const isConfirmed = b.status === 'CONFIRMED';
                  const isCompleted = b.status === 'COMPLETED';
                  const isCancelled = b.status === 'CANCELLED';
                  const isPendingPayment = b.status === 'PENDING_PAYMENT' || b.status === 'PENDING';

                  const custName = b.customer?.name || 'Customer';
                  const custEmail = b.customer?.email || 'No email';
                  const custPhone = b.customer?.phone || 'No phone';
                  const bookingDate = `Booked ${new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                  const compactId = b.id && b.id.length > 15 ? `${b.id.slice(0, 14)}…` : b.id;

                  return (
                    <tr key={b.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-2.5 sm:py-3 px-2 sm:px-3 align-middle overflow-hidden">
                        <div className="flex items-center gap-1 min-w-0">
                          <span
                            className="font-mono text-stone-800 font-bold block truncate text-xs cursor-default"
                            title={`Full Booking ID: ${b.id}`}
                          >
                            {compactId}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyId(e, b.id)}
                            className={`p-0.5 rounded transition-colors shrink-0 cursor-pointer ${
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
                        <span className="text-[10px] text-stone-400 block truncate mt-0.5" title={bookingDate}>
                          {bookingDate}
                        </span>
                      </td>

                      <td className="py-2.5 sm:py-3 px-2 sm:px-3 align-middle overflow-hidden">
                        <div className="min-w-0">
                          <span className="font-bold text-[#3B1E22] block truncate text-xs cursor-default" title={custName}>
                            {custName}
                          </span>
                          <span className="text-stone-500 text-[11px] block truncate font-mono cursor-default" title={custEmail}>
                            {custEmail}
                          </span>
                          {custPhone && custPhone !== 'No phone' && (
                            <span className="text-amber-800 font-medium text-[11px] flex items-center gap-1 truncate cursor-default" title={custPhone}>
                              <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="truncate">{custPhone}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-2.5 sm:py-3 px-2 sm:px-3 align-middle overflow-hidden">
                        <div className="min-w-0">
                          <span className="font-semibold text-stone-900 block truncate text-xs cursor-default" title={b.serviceTitle}>
                            {b.serviceTitle}
                          </span>
                          <span className="text-[10px] text-stone-500 block truncate cursor-default" title={b.astrologer?.name || 'Dr. Pandit Vishal Dubey'}>
                            {b.astrologer?.name || 'Dr. Pandit Vishal Dubey'}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 sm:py-3 px-2 sm:px-3 align-middle overflow-hidden">
                        <div className="min-w-0">
                          <span className="font-bold text-[#5B0D15] block truncate text-xs cursor-default" title={b.scheduledDate}>
                            {b.scheduledDate}
                          </span>
                          <span className="text-stone-700 font-semibold text-[11px] block truncate cursor-default" title={`${b.scheduledTime} IST`}>
                            {b.scheduledTime} IST
                          </span>
                        </div>
                      </td>

                      <td
                        className="py-2.5 sm:py-3 px-2 sm:px-3 text-center font-semibold text-[#5B0D15] text-sm sm:text-[14.5px] font-sans tabular-nums tracking-tight truncate align-middle whitespace-nowrap"
                        title={b.totalCost === 0 ? 'FREE' : `₹${b.totalCost}`}
                      >
                        {b.totalCost === 0 ? 'FREE' : `₹${Number(b.totalCost).toLocaleString('en-IN')}`}
                      </td>

                      <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center align-middle whitespace-nowrap">
                        <span
                          className={`inline-flex items-center justify-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border shadow-2xs whitespace-nowrap ${
                            isCancelled
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : isCompleted
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : isConfirmed
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : isPendingPayment
                              ? 'bg-amber-50/90 text-amber-900 border-amber-300/80'
                              : 'bg-stone-50 text-stone-700 border-stone-200'
                          }`}
                          title={`Booking Status: ${b.status || 'PENDING'}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              isCancelled
                                ? 'bg-rose-500'
                                : isCompleted
                                ? 'bg-blue-500'
                                : isConfirmed
                                ? 'bg-emerald-600 animate-pulse'
                                : isPendingPayment
                                ? 'bg-amber-500 animate-pulse'
                                : 'bg-stone-400'
                            }`}
                          />
                          <span>
                            {isPendingPayment
                              ? 'Pending Payment'
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

                      <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-right align-middle whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-2 whitespace-nowrap">
                          <a
                            href={b.meetLink && b.meetLink.includes('meet.google.com') ? b.meetLink : formatGoogleMeetLink(b.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-colors inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                            title="Start Google Meet with Devotee"
                          >
                            <Video className="w-3.5 h-3.5 shrink-0" />
                            <span>Meet</span>
                          </a>

                          <button
                            onClick={() => onSelectBooking(b)}
                            className="px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50/90 hover:bg-amber-100 text-[#5B0D15] font-semibold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
                            title="Inspect & Manage"
                          >
                            Manage
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
