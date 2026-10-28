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
} from 'lucide-react';
import { SERVICES_CATALOGUE } from '../../../data/servicesData';

function formatGoogleMeetLink(bookingId: string): string {
  if (bookingId && bookingId.startsWith('https://meet.google.com/')) {
    return bookingId;
  }
  const sanitized = (bookingId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const numToLetter: Record<string, string> = {
    '0': 'a', '1': 'b', '2': 'c', '3': 'd', '4': 'e',
    '5': 'f', '6': 'g', '7': 'h', '8': 'i', '9': 'j',
  };
  let letters = sanitized
    .split('')
    .map((ch) => numToLetter[ch] || ch)
    .join('');
  while (letters.length < 10) {
    letters += 'avd';
  }
  const p1 = letters.slice(0, 3);
  const p2 = letters.slice(3, 7);
  const p3 = letters.slice(7, 10);
  return `https://meet.google.com/${p1}-${p2}-${p3}`;
}

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
            <table className="w-full min-w-[1050px] table-fixed text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3 w-[15%] font-medium">Booking ID / Date</th>
                  <th className="py-3 px-3 w-[21%] font-medium">Customer Details</th>
                  <th className="py-3 px-3 w-[21%] font-medium">Service &amp; Pandit</th>
                  <th className="py-3 px-3 w-[15%] font-medium">Scheduled Slot</th>
                  <th className="py-3 px-3 text-right w-[8%] font-medium">Dakshina</th>
                  <th className="py-3 px-3 text-center w-[8%] font-medium">Status</th>
                  <th className="py-3 px-3 text-right w-[12%] font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {bookingsList.map((b) => {
                  const isConfirmed = b.status === 'CONFIRMED';
                  const isCompleted = b.status === 'COMPLETED';
                  const isCancelled = b.status === 'CANCELLED';

                  const custName = b.customer?.name || 'Customer';
                  const custEmail = b.customer?.email || 'No email';
                  const custPhone = b.customer?.phone || 'No phone';
                  const bookingDate = `Booked ${new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

                  return (
                    <tr key={b.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-3.5 px-3">
                        <span className="font-mono text-stone-800 font-bold block truncate" title={b.id}>
                          {b.id.slice(0, 13)}...
                        </span>
                        <span className="text-[10px] text-stone-400 block truncate" title={bookingDate}>
                          {bookingDate}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="min-w-0">
                          <span className="font-bold text-[#3B1E22] block truncate" title={custName}>
                            {custName}
                          </span>
                          <span className="text-stone-500 text-[11px] block truncate" title={custEmail}>
                            {custEmail}
                          </span>
                          <span className="text-amber-800 font-medium text-[11px] flex items-center gap-1 truncate" title={custPhone}>
                            <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate">{custPhone}</span>
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="min-w-0">
                          <span className="font-semibold text-stone-900 block truncate" title={b.serviceTitle}>
                            {b.serviceTitle}
                          </span>
                          <span className="text-[10px] text-stone-500 block truncate" title={b.astrologer?.name || 'Pandit'}>
                            {b.astrologer?.name}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-bold text-[#5B0D15] block truncate" title={b.scheduledDate}>
                          {b.scheduledDate}
                        </span>
                        <span className="text-stone-700 font-semibold text-[11px] block truncate" title={`${b.scheduledTime} IST`}>
                          {b.scheduledTime} IST
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right font-bold font-serif text-[#5B0D15] truncate" title={b.totalCost === 0 ? 'FREE' : `₹${b.totalCost}`}>
                        {b.totalCost === 0 ? 'FREE' : `₹${b.totalCost}`}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10.5px] font-semibold truncate max-w-full text-center ${
                            isCancelled
                              ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                              : isConfirmed || isCompleted
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          }`}
                          title={
                            isCancelled
                              ? 'Cancelled'
                              : isConfirmed || isCompleted
                              ? 'Paid'
                              : 'Pending'
                          }
                        >
                          {isCancelled
                            ? 'Cancelled'
                            : isConfirmed || isCompleted
                            ? 'Paid'
                            : 'Pending'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={b.meetLink && b.meetLink.includes('meet.google.com') ? b.meetLink : formatGoogleMeetLink(b.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1 shrink-0"
                            title="Start Google Meet with Devotee"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Start Meet</span>
                          </a>

                          <button
                            onClick={() => onSelectBooking(b)}
                            className="px-2.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-[#5B0D15] font-semibold text-xs shadow-sm transition-colors cursor-pointer shrink-0 truncate max-w-full"
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
