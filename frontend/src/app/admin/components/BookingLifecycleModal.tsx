import React from 'react';
import { formatGoogleMeetLink } from '../../../data/servicesData';
import {
  Calendar,
  Clock,
  User as UserIcon,
  Phone,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Video,
} from 'lucide-react';

interface BookingLifecycleModalProps {
  activeBooking: any | null;
  statusNotes: string;
  setStatusNotes: (s: string) => void;
  statusError: string | null;
  updatingStatus: boolean;
  onTransitionStatus: (status: string) => void;
  onClose: () => void;
}



export default function BookingLifecycleModal({
  activeBooking,
  statusNotes,
  setStatusNotes,
  statusError,
  updatingStatus,
  onTransitionStatus,
  onClose,
}: BookingLifecycleModalProps) {
  if (!activeBooking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl flex flex-col rounded-3xl bg-white/95 backdrop-blur-2xl border border-amber-300 shadow-2xl overflow-hidden text-[#3B1E22]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#5B0D15] via-[#7B121C] to-[#3B1E22] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-amber-200 flex items-center justify-center border border-white/30 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-amber-100">
                Appointment Details &amp; Lifecycle
              </h3>
              <p className="text-xs text-amber-200/80 font-mono">
                Ref: {activeBooking.id}
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
          {statusError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{statusError}</span>
            </div>
          )}

          {/* Service & Schedule Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                Booked Service
              </span>
              <p className="font-serif font-bold text-stone-900 text-base">
                {activeBooking.serviceTitle || activeBooking.serviceType}
              </p>
              <p className="text-xs text-stone-600 mt-1">
                Duration: {activeBooking.durationMinutes || 45} mins • Canonical ID: <span className="font-mono text-[11px] text-amber-900">{activeBooking.serviceType}</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                Scheduled Date &amp; Time
              </span>
              <p className="font-bold text-stone-900 text-base flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-700" />
                {new Date(activeBooking.scheduledDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              <p className="text-xs text-stone-700 font-semibold mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                {activeBooking.scheduledTime}
              </p>
            </div>
          </div>

          {/* Seeker / Customer Contact Details */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block mb-2">
              Customer Contact Information
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-stone-400 block text-[10px]">Customer Name</span>
                <span className="font-semibold text-stone-900 flex items-center gap-1 mt-0.5">
                  <UserIcon className="w-3.5 h-3.5 text-stone-500" />
                  {activeBooking.user?.name || activeBooking.customer?.name || 'Guest'}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Email Address</span>
                <span className="font-mono text-stone-800 break-all block mt-0.5">
                  {activeBooking.user?.email || activeBooking.customer?.email || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Contact Phone</span>
                <span className="font-mono font-medium text-stone-900 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-stone-500" />
                  {activeBooking.user?.phone || activeBooking.customer?.phone || 'No phone recorded'}
                </span>
              </div>
            </div>
          </div>

          {/* Booking Metadata & User Notes */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Booking Created:</span>
              <span className="font-medium text-stone-700">
                {new Date(activeBooking.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Assigned Astrologer:</span>
              <span className="font-medium text-stone-800">
                {activeBooking.astrologer?.name || 'Dr. Pandit Vishal Dubey'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Service Fee:</span>
              <span className="font-bold text-[#5B0D15]">
                {activeBooking.totalCost === 0 ? 'Complimentary / Included' : `₹${activeBooking.totalCost}`}
              </span>
            </div>
            {activeBooking.notes && (
              <div className="pt-2 border-t border-stone-200">
                <span className="text-stone-500 block text-[11px] mb-1">Customer Remarks / Notes:</span>
                <p className="p-2.5 rounded-lg bg-white border border-stone-200 text-stone-800 font-mono text-[11px]">
                  {activeBooking.notes}
                </p>
              </div>
            )}
          </div>

          {/* Live Video Consultation Room Box */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <Video className="w-4 h-4 text-emerald-700" />
                Live Google Meet Room
              </span>
              <p className="text-xs text-emerald-950 font-mono break-all font-semibold">
                {activeBooking.meetLink && activeBooking.meetLink.includes('meet.google.com') ? activeBooking.meetLink : formatGoogleMeetLink(activeBooking.id)}
              </p>
              <p className="text-[11px] text-emerald-800">
                Extension Rate: ₹50/minute after scheduled 30 mins.
              </p>
            </div>
            <a
              href={activeBooking.meetLink && activeBooking.meetLink.includes('meet.google.com') ? activeBooking.meetLink : formatGoogleMeetLink(activeBooking.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-900/20 flex items-center justify-center gap-1.5 shrink-0 transition-all hover:scale-105 active:scale-95"
            >
              <Video className="w-4 h-4" />
              <span>Start Google Meet</span>
            </a>
          </div>

          {/* Current Status & Transitions */}
          <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Current Lifecycle Status
                </span>
                <span
                  className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${
                    activeBooking.status === 'CONFIRMED'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : activeBooking.status === 'COMPLETED'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : activeBooking.status === 'CANCELLED'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  ● {activeBooking.status}
                </span>
              </div>

              {activeBooking.status === 'COMPLETED' || activeBooking.status === 'CANCELLED' ? (
                <span className="text-xs text-stone-500 italic bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
                  Terminal state (Concluded)
                </span>
              ) : null}
            </div>

            {/* Status Update Note Input */}
            {activeBooking.status !== 'COMPLETED' && activeBooking.status !== 'CANCELLED' && (
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Update Notes (Optional remarks for this status transition):
                </label>
                <input
                  type="text"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="e.g. Consultation conducted via phone call, or client requested reschedule"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#5B0D15]"
                />
              </div>
            )}

            {/* Valid Transition Action Buttons */}
            {activeBooking.status === 'PENDING' && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  disabled={updatingStatus}
                  onClick={() => onTransitionStatus('CONFIRMED')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {updatingStatus ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Confirm Appointment
                </button>
                <button
                  disabled={updatingStatus}
                  onClick={() => onTransitionStatus('CANCELLED')}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel Booking
                </button>
              </div>
            )}

            {activeBooking.status === 'CONFIRMED' && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  disabled={updatingStatus}
                  onClick={() => onTransitionStatus('COMPLETED')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {updatingStatus ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Mark as Completed
                </button>
                <button
                  disabled={updatingStatus}
                  onClick={() => onTransitionStatus('CANCELLED')}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel Appointment
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
