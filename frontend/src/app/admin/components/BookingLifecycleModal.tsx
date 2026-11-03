import React, { useState, useEffect } from 'react';
import { formatGoogleMeetLink } from '../../../data/servicesData';
import { useScrollLock } from '../../../lib/scrollLock';
import {
  Calendar,
  Clock,
  User as UserIcon,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Video,
  Copy,
  Check,
  HeartHandshake,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  MessageSquare,
  CreditCard,
  Edit2,
  CalendarCheck,
  Ban,
  Lock,
} from 'lucide-react';

interface BookingLifecycleModalProps {
  activeBooking: any | null;
  statusNotes: string;
  setStatusNotes: (s: string) => void;
  statusError: string | null;
  updatingStatus: boolean;
  onTransitionStatus: (status: string) => void;
  onClose: () => void;
  onDeleteBooking?: (booking: any) => void;
  onRescheduleBooking?: (bookingId: string, date: string, time: string, reason?: string) => Promise<void>;
  onUpdateMeetLink?: (bookingId: string, meetLink: string) => Promise<void>;
  onVerifyPayment?: (bookingId: string, transactionReference: string, paymentMethod: string, notes?: string) => Promise<void>;
}

export default function BookingLifecycleModal({
  activeBooking,
  statusNotes,
  setStatusNotes,
  statusError,
  updatingStatus,
  onTransitionStatus,
  onClose,
  onDeleteBooking,
  onRescheduleBooking,
  onUpdateMeetLink,
  onVerifyPayment,
}: BookingLifecycleModalProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [expandNotes, setExpandNotes] = useState(false);

  // Reschedule Sub-form State
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('10:00 AM');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  // Meeting Link Sub-form State
  const [showMeetLinkEdit, setShowMeetLinkEdit] = useState(false);
  const [customMeetLink, setCustomMeetLink] = useState('');
  const [meetLinkLoading, setMeetLinkLoading] = useState(false);
  const [meetLinkError, setMeetLinkError] = useState<string | null>(null);

  // Payment Verification Sub-form State
  const [showVerifyPayment, setShowVerifyPayment] = useState(false);
  const [txnRef, setTxnRef] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'NET_BANKING' | 'GATEWAY' | 'OFFLINE_VERIFIED'>('UPI');
  const [verifyNotes, setVerifyNotes] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Lock body scroll and prevent background scroll chaining
  useScrollLock(Boolean(activeBooking));

  useEffect(() => {
    if (!activeBooking) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeBooking, onClose]);

  useEffect(() => {
    if (activeBooking) {
      const validLink =
        activeBooking.meetLink && activeBooking.meetLink.includes('hui-smdn-gtp')
          ? activeBooking.meetLink
          : formatGoogleMeetLink(activeBooking.id);
      setCustomMeetLink(validLink);
      setRescheduleDate(activeBooking.scheduledDate || '');
      setRescheduleTime(activeBooking.scheduledTime || '10:00 AM');
      setShowReschedule(false);
      setShowMeetLinkEdit(false);
      setShowVerifyPayment(false);
      setRescheduleError(null);
      setMeetLinkError(null);
      setVerifyError(null);
    }
  }, [activeBooking]);

  if (!activeBooking) return null;

  const handleCopyId = (id: string) => {
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
      } catch (err) {}
    }
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const bookingId = String(activeBooking.id || '');
  const shortBookingId = bookingId.length > 12 ? `${bookingId.slice(0, 8)}...${bookingId.slice(-4)}` : bookingId;

  const custName = activeBooking.customerName || activeBooking.customer?.name || activeBooking.user?.name || 'Customer';
  const custPhone = activeBooking.customerPhone || activeBooking.contactPhone || activeBooking.customer?.phone || activeBooking.user?.phone || 'No phone recorded';
  const custEmail = activeBooking.customer?.email || activeBooking.user?.email || 'N/A';
  const isForSomeoneElse = Boolean(activeBooking.isBookingForSomeoneElse || activeBooking.customer?.isBookingForSomeoneElse);
  const accountOwner = activeBooking.customer?.accountOwnerName || activeBooking.user?.name;
  const guideName = activeBooking.astrologer?.name || 'Dr. Pandit Vishal Dubey';

  const rawMeet = activeBooking.meetLink || customMeetLink || '';
  const meetUrl = rawMeet && rawMeet.includes('hui-smdn-gtp') ? rawMeet : formatGoogleMeetLink(activeBooking.id);
  const isTerminalState = activeBooking.status === 'COMPLETED' || activeBooking.status === 'CANCELLED' || activeBooking.status === 'REJECTED';

  const statusBadgeConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
    CONFIRMED: { bg: 'bg-emerald-500/20', text: 'text-emerald-200', border: 'border-emerald-400/40', label: 'Confirmed' },
    COMPLETED: { bg: 'bg-blue-500/20', text: 'text-blue-200', border: 'border-blue-400/40', label: 'Completed' },
    CANCELLED: { bg: 'bg-rose-500/20', text: 'text-rose-200', border: 'border-rose-400/40', label: 'Cancelled' },
    REJECTED: { bg: 'bg-red-500/20', text: 'text-red-200', border: 'border-red-400/40', label: 'Rejected' },
    PENDING_PAYMENT: { bg: 'bg-amber-500/20', text: 'text-amber-200', border: 'border-amber-400/40', label: 'Pending Payment' },
    PENDING: { bg: 'bg-amber-500/20', text: 'text-amber-200', border: 'border-amber-400/40', label: 'Pending' },
  };

  const currentBadge = statusBadgeConfig[activeBooking.status] || {
    bg: 'bg-amber-500/20',
    text: 'text-amber-200',
    border: 'border-amber-400/40',
    label: activeBooking.status,
  };

  // Payment details extraction
  const rawNotes = String(activeBooking.notes || '').trim();
  const isWalletPayment = rawNotes.includes('Payment: WALLET_PAID') || activeBooking.payment?.isWalletPayment;
  const isVerifiedManual = rawNotes.includes('Payment Verified:') || activeBooking.payment?.isVerifiedManual;
  const hasRefund = rawNotes.includes('REFUND_BOOKING_') || activeBooking.payment?.hasRefund;

  const seekerRemarkMatch = rawNotes.match(/Seeker Notes:\s*([^|]+)/i);
  const isAutoMetadataOnly = /^(Service:|Mode:|Customer:|Contact:|Extension Rate:)/i.test(rawNotes) && !seekerRemarkMatch;
  const genuineRemark = seekerRemarkMatch ? seekerRemarkMatch[1].trim() : isAutoMetadataOnly ? '' : rawNotes;

  // Handler: Reschedule Booking
  const handleSaveReschedule = async () => {
    if (!onRescheduleBooking) return;
    setRescheduleError(null);
    if (!rescheduleDate) {
      setRescheduleError('Please select a valid target date (YYYY-MM-DD).');
      return;
    }
    setRescheduleLoading(true);
    try {
      await onRescheduleBooking(activeBooking.id, rescheduleDate, rescheduleTime, rescheduleReason.trim());
      setShowReschedule(false);
    } catch (err: any) {
      setRescheduleError(err?.message || 'Failed to reschedule booking.');
    } finally {
      setRescheduleLoading(false);
    }
  };

  // Handler: Update Meeting Link
  const handleSaveMeetLink = async () => {
    if (!onUpdateMeetLink) return;
    setMeetLinkError(null);
    if (!customMeetLink.trim()) {
      setMeetLinkError('Meeting link URL cannot be empty.');
      return;
    }
    setMeetLinkLoading(true);
    try {
      await onUpdateMeetLink(activeBooking.id, customMeetLink.trim());
      setShowMeetLinkEdit(false);
    } catch (err: any) {
      setMeetLinkError(err?.message || 'Invalid meeting URL. Must start with https:// and be from Google Meet, Zoom, or Teams.');
    } finally {
      setMeetLinkLoading(false);
    }
  };

  // Handler: Verify Payment
  const handleSavePaymentVerification = async () => {
    if (!onVerifyPayment) return;
    setVerifyError(null);
    if (!txnRef.trim()) {
      setVerifyError('Transaction reference / bank proof ID is required.');
      return;
    }
    setVerifyLoading(true);
    try {
      await onVerifyPayment(activeBooking.id, txnRef.trim(), paymentMethod, verifyNotes.trim());
      setShowVerifyPayment(false);
    } catch (err: any) {
      setVerifyError(err?.message || 'Failed to verify payment proof.');
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div
      data-lenis-prevent="true"
      onWheel={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-3 overflow-y-auto overscroll-contain modal-backdrop-contain animate-fadeIn"
    >
      <div className="relative w-full max-w-4xl max-h-[calc(100dvh-20px)] flex flex-col rounded-2xl bg-[#FCFBF8] border border-amber-300/80 shadow-2xl overflow-hidden text-[#3B1E22]">
        
        {/* Header */}
        <div className="px-4 py-2.5 bg-gradient-to-r from-[#50080F] via-[#6B0D16] to-[#40080D] text-white flex items-center justify-between shrink-0 border-b border-amber-400/30">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-white/10 text-amber-200 flex items-center justify-center border border-amber-300/25 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <div className="min-w-0 flex items-center flex-wrap gap-x-2.5 gap-y-0.5">
              <h3 className="font-serif text-sm sm:text-base font-bold text-amber-100 tracking-wide">
                Consultation Appointment &amp; Payment Details
              </h3>
              <div className="flex items-center gap-1.5 bg-black/25 border border-amber-400/20 px-2 py-0.5 rounded text-[11px]">
                <span className="text-amber-200/90 font-mono">Ref: {shortBookingId}</span>
                <button
                  type="button"
                  onClick={() => handleCopyId(activeBooking.id)}
                  className={`p-0.5 rounded transition-colors ${
                    copiedId
                      ? 'bg-emerald-500/40 text-emerald-200'
                      : 'hover:bg-white/20 text-amber-300'
                  }`}
                  title={copiedId ? 'Copied Full ID!' : `Copy Full ID: ${bookingId}`}
                >
                  {copiedId ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border tracking-wide uppercase ${currentBadge.bg} ${currentBadge.text} ${currentBadge.border}`}
              >
                ● {currentBadge.label}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
            title="Close modal (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div
          data-lenis-prevent="true"
          className="p-3 sm:p-4 overflow-y-auto overscroll-contain modal-scroll-container space-y-3 flex-1 text-xs"
        >
          {statusError && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{statusError}</span>
            </div>
          )}

          {/* Row 1: Booked Service & Scheduled Date/Time Side-by-Side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Booked Service */}
            <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-200/80 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-amber-900/80 uppercase tracking-wider block">
                  Booked Service
                </span>
                <p className="font-serif font-bold text-stone-900 text-sm truncate mt-0.5" title={activeBooking.serviceTitle || activeBooking.serviceType}>
                  {activeBooking.serviceTitle || activeBooking.serviceType}
                </p>
                <p className="text-[11px] text-stone-600 mt-0.5">
                  Duration: <strong className="text-stone-800">{activeBooking.durationMinutes || 45} mins</strong> • Reserved: {new Date(activeBooking.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Scheduled Date & Time with Reschedule Toggle */}
            <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-200/80 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-amber-900/80 uppercase tracking-wider block">
                  Scheduled Date &amp; Time
                </span>
                <p className="font-bold text-stone-900 text-sm flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>
                    {new Date(activeBooking.scheduledDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </p>
                <p className="text-[11px] text-stone-700 font-semibold mt-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-700 shrink-0" />
                  <span>{activeBooking.scheduledTime} IST</span>
                </p>
              </div>

              {!isTerminalState && onRescheduleBooking && (
                <button
                  type="button"
                  onClick={() => setShowReschedule(!showReschedule)}
                  className="px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white hover:bg-amber-100 text-amber-950 font-bold text-xs flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                  title="Reschedule Appointment Date/Time"
                >
                  <CalendarCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>{showReschedule ? 'Cancel' : 'Reschedule'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Reschedule Interactive Sub-panel */}
          {showReschedule && (
            <div className="p-3 rounded-xl bg-amber-100/60 border border-amber-300 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <CalendarCheck className="w-4 h-4 text-amber-800" />
                  <span>Reschedule Appointment Slot (Collision Protected)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowReschedule(false)}
                  className="text-stone-500 hover:text-stone-800 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {rescheduleError && (
                <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                  <span>{rescheduleError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-stone-700 uppercase block mb-1">
                    New Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-semibold focus:ring-1.5 focus:ring-[#5B0D15]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-700 uppercase block mb-1">
                    New Time Slot *
                  </label>
                  <select
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-semibold focus:ring-1.5 focus:ring-[#5B0D15]"
                  >
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-700 uppercase block mb-1">
                    Reschedule Reason
                  </label>
                  <input
                    type="text"
                    value={rescheduleReason}
                    onChange={(e) => setRescheduleReason(e.target.value)}
                    placeholder="e.g. Seeker request / travel schedule"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-xs focus:ring-1.5 focus:ring-[#5B0D15]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  disabled={rescheduleLoading}
                  onClick={handleSaveReschedule}
                  className="px-4 py-1.5 rounded-lg bg-[#5B0D15] hover:bg-[#70101B] text-amber-100 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {rescheduleLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />}
                  <span>Confirm Slot Move</span>
                </button>
              </div>
            </div>
          )}

          {/* Row 2: Customer & Attendee Information */}
          <div className="p-2.5 rounded-xl bg-amber-50/30 border border-amber-200/70">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-amber-900/80 uppercase tracking-wider">
                Customer &amp; Attendee Information
              </span>
              {isForSomeoneElse && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                  <HeartHandshake className="w-3 h-3 text-purple-600" />
                  <span>Proxy Booking</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <div className="p-1.5 px-2 rounded-lg bg-white/90 border border-amber-200/50 shadow-2xs">
                <span className="text-stone-400 block text-[9px] uppercase font-semibold">Attendee</span>
                <span className="font-semibold text-stone-900 flex items-center gap-1.5 mt-0.5 truncate" title={custName}>
                  <UserIcon className="w-3 h-3 text-stone-500 shrink-0" />
                  <span className="truncate">{custName}</span>
                </span>
              </div>

              <div className="p-1.5 px-2 rounded-lg bg-white/90 border border-amber-200/50 shadow-2xs">
                <span className="text-stone-400 block text-[9px] uppercase font-semibold">Contact Mobile</span>
                <span className="font-mono font-medium text-stone-900 flex items-center gap-1.5 mt-0.5 truncate" title={custPhone}>
                  <Phone className="w-3 h-3 text-stone-500 shrink-0" />
                  <span className="truncate">{custPhone}</span>
                </span>
              </div>

              <div className="p-1.5 px-2 rounded-lg bg-white/90 border border-amber-200/50 shadow-2xs">
                <span className="text-stone-400 block text-[9px] uppercase font-semibold">
                  {isForSomeoneElse ? 'Account Owner' : 'Account Email'}
                </span>
                <span className="font-medium text-stone-800 flex items-center gap-1.5 mt-0.5 truncate" title={isForSomeoneElse ? `${accountOwner} (${custEmail})` : custEmail}>
                  <Mail className="w-3 h-3 text-stone-500 shrink-0" />
                  <span className="truncate font-mono text-[11px]">
                    {isForSomeoneElse ? `${accountOwner || custEmail}` : custEmail}
                  </span>
                </span>
              </div>

              <div className="p-1.5 px-2 rounded-lg bg-white/90 border border-amber-200/50 shadow-2xs">
                <span className="text-stone-400 block text-[9px] uppercase font-semibold">Spiritual Guide</span>
                <span className="font-semibold text-amber-900 flex items-center gap-1.5 mt-0.5 truncate" title={guideName}>
                  <ShieldCheck className="w-3 h-3 text-amber-700 shrink-0" />
                  <span className="truncate">{guideName}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Row 3: Dakshina / Payment Status & Consultation Room Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Dakshina & Payment Details */}
            <div className="p-2.5 rounded-xl bg-amber-50/40 border border-amber-200/70 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-900/80 uppercase tracking-wider block">
                    Dakshina &amp; Payment Status
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-bold text-base text-[#5B0D15]">
                      {activeBooking.totalCost === 0 ? 'Complimentary' : `₹${Number(activeBooking.totalCost).toLocaleString('en-IN')}`}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      Method: {isVerifiedManual ? 'Verified Offline' : 'Online Gateway'}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeBooking.status === 'PENDING_PAYMENT' || activeBooking.status === 'PENDING'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : activeBooking.status === 'CANCELLED' || activeBooking.status === 'REJECTED'
                      ? hasRefund
                        ? 'bg-purple-100 text-purple-900 border border-purple-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  }`}
                >
                  {activeBooking.status === 'PENDING_PAYMENT' || activeBooking.status === 'PENDING'
                    ? 'Pending Payment'
                    : activeBooking.status === 'CANCELLED' || activeBooking.status === 'REJECTED'
                    ? hasRefund
                      ? 'Refunded to Source'
                      : 'Unpaid / Concluded'
                    : 'Paid / Confirmed'}
                </span>
              </div>

              {/* Payment Verification Trigger */}
              {activeBooking.status === 'PENDING_PAYMENT' && onVerifyPayment && (
                <div className="mt-2 pt-2 border-t border-amber-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-amber-900 font-semibold">
                    Awaiting proof verification
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowVerifyPayment(!showVerifyPayment)}
                    className="px-2 py-1 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    <CreditCard className="w-3 h-3" />
                    <span>Verify Payment</span>
                  </button>
                </div>
              )}
            </div>

            {/* Google Meet Consultation Access & Custom Link Editor */}
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-300/80 flex flex-col justify-between gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Consultation Room</span>
                </span>

                <div className="flex items-center gap-1.5">
                  {!isTerminalState && onUpdateMeetLink && (
                    <button
                      type="button"
                      onClick={() => setShowMeetLinkEdit(!showMeetLinkEdit)}
                      className="text-[10px] font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-0.5 cursor-pointer"
                      title="Update room URL (Google Meet, Zoom, or Teams)"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{showMeetLinkEdit ? 'Close' : 'Edit Link'}</span>
                    </button>
                  )}

                  <a
                    href={meetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] shadow-xs flex items-center gap-1 shrink-0 transition-transform active:scale-95 cursor-pointer"
                    title={`Open Room (${meetUrl})`}
                  >
                    <Video className="w-3 h-3" />
                    <span>Join Room</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                  </a>
                </div>
              </div>

              <p className="text-[10px] text-emerald-800/90 truncate font-mono" title={meetUrl}>
                {meetUrl}
              </p>
            </div>
          </div>

          {/* Payment Verification Sub-panel */}
          {showVerifyPayment && (
            <div className="p-3 rounded-xl bg-emerald-100/70 border border-emerald-300 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-800" />
                  <span>Verify Payment with Authentic Proof Reference</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowVerifyPayment(false)}
                  className="text-stone-500 hover:text-stone-800 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {verifyError && (
                <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                  <span>{verifyError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-stone-700 uppercase block mb-1">
                    Bank Reference / UTR Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={txnRef}
                    onChange={(e) => setTxnRef(e.target.value)}
                    placeholder="e.g. UPI_TXN_987216450123"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-mono font-semibold focus:ring-1.5 focus:ring-[#5B0D15]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-700 uppercase block mb-1">
                    Verified Method *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-semibold focus:ring-1.5 focus:ring-[#5B0D15]"
                  >
                    <option value="UPI">UPI Transfer</option>
                    <option value="NET_BANKING">Net Banking / IMPS</option>
                    <option value="GATEWAY">Payment Gateway</option>
                    <option value="OFFLINE_VERIFIED">Offline Bank Deposit</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-700 uppercase block mb-1">
                    Remarks / Evidence Source
                  </label>
                  <input
                    type="text"
                    value={verifyNotes}
                    onChange={(e) => setVerifyNotes(e.target.value)}
                    placeholder="WhatsApp receipt verified with accounts"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-xs focus:ring-1.5 focus:ring-[#5B0D15]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  disabled={verifyLoading}
                  onClick={handleSavePaymentVerification}
                  className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {verifyLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />}
                  <span>Confirm Payment &amp; Verify Consultation</span>
                </button>
              </div>
            </div>
          )}

          {/* Meeting Link Sub-panel */}
          {showMeetLinkEdit && (
            <div className="p-3 rounded-xl bg-emerald-100/70 border border-emerald-300 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Update Consultation Room Link</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowMeetLinkEdit(false)}
                  className="text-stone-500 hover:text-stone-800 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {meetLinkError && (
                <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                  <span>{meetLinkError}</span>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="url"
                  value={customMeetLink}
                  onChange={(e) => setCustomMeetLink(e.target.value)}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx or https://zoom.us/j/..."
                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-mono focus:ring-1.5 focus:ring-[#5B0D15]"
                />
                <button
                  type="button"
                  disabled={meetLinkLoading}
                  onClick={handleSaveMeetLink}
                  className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {meetLinkLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save URL</span>
                </button>
              </div>
              <p className="text-[10px] text-emerald-900/80">
                Supports secure HTTPS URLs on Google Meet, Zoom, or Microsoft Teams.
              </p>
            </div>
          )}

          {/* Genuine Customer Remarks */}
          {genuineRemark && (
            <div className="p-2 rounded-xl bg-amber-50/40 border border-amber-200/60">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-900/80 uppercase tracking-wider flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-amber-700" />
                  <span>Customer Remarks</span>
                </span>
                <button
                  type="button"
                  onClick={() => setExpandNotes(!expandNotes)}
                  className="text-[10px] font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-0.5 cursor-pointer"
                >
                  {expandNotes ? (
                    <>
                      <span>Hide</span>
                      <ChevronUp className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      <span>View ({genuineRemark.length > 50 ? `${genuineRemark.slice(0, 45)}...` : 'details'})</span>
                      <ChevronDown className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>
              {expandNotes && (
                <p className="mt-1 font-mono text-[11px] text-stone-800 bg-white/90 p-2 rounded-lg border border-amber-200/50">
                  {genuineRemark}
                </p>
              )}
            </div>
          )}

          {/* Row 4: Lifecycle Status & Transition Actions */}
          <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider">
                Lifecycle Actions
              </span>
              {isTerminalState && (
                <span className="text-[10px] text-stone-500 italic bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                  Terminal State (Concluded)
                </span>
              )}
            </div>

            {/* Status Transition Notes Input */}
            {!isTerminalState && (
              <input
                type="text"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Optional notes for this update (e.g. Conducted via phone call, reschedule requested)..."
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-xs focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
              />
            )}

            {/* Valid Transition Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {(activeBooking.status === 'PENDING' || activeBooking.status === 'PENDING_PAYMENT' || activeBooking.status === 'APPROVED') && (
                <>
                  {activeBooking.status === 'PENDING' && (
                    <button
                      type="button"
                      disabled={updatingStatus}
                      onClick={() => onTransitionStatus('APPROVED')}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 hover:scale-105 active:scale-95"
                    >
                      {updatingStatus ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />}
                      <span>Approve Consultation (Awaiting User Payment)</span>
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => onTransitionStatus('CONFIRMED')}
                    className="px-3.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {updatingStatus ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>Confirm &amp; Mark as Paid</span>
                  </button>
                  <button
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => onTransitionStatus('REJECTED')}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Reject Booking</span>
                  </button>
                  <button
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => onTransitionStatus('CANCELLED')}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel Booking</span>
                  </button>
                </>
              )}

              {activeBooking.status === 'CONFIRMED' && (
                <>
                  <button
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => onTransitionStatus('COMPLETED')}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {updatingStatus ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>Mark as Completed</span>
                  </button>
                  <button
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => onTransitionStatus('CANCELLED')}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel Appointment</span>
                  </button>
                  <button
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => onTransitionStatus('REJECTED')}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Reject Booking</span>
                  </button>
                </>
              )}

              {(activeBooking.status === 'CANCELLED' || activeBooking.status === 'REJECTED') && (
                <>
                  <button
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => onTransitionStatus('PENDING')}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-open as Pending</span>
                  </button>
                  {activeBooking.status === 'CANCELLED' ? (
                    <button
                      type="button"
                      disabled={updatingStatus}
                      onClick={() => onTransitionStatus('REJECTED')}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Switch to Rejected</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={updatingStatus}
                      onClick={() => onTransitionStatus('CANCELLED')}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Switch to Cancelled</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Modal Sticky Compact Footer */}
        <div className="px-4 py-2 bg-stone-50 border-t border-stone-200 flex items-center justify-between shrink-0">
          <div>
            {onDeleteBooking && (
              <button
                type="button"
                onClick={() => onDeleteBooking(activeBooking)}
                className="px-3 py-1.5 rounded-lg text-rose-700 hover:bg-rose-100 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Permanently Delete Booking from Database"
              >
                <X className="w-3.5 h-3.5" />
                <span>Delete Record</span>
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
