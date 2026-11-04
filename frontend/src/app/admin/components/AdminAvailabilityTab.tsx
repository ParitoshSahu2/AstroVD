import React, { useState } from 'react';
import {
  Calendar,
  Ban,
  CheckCircle2,
  Lock,
  Unlock,
  Plus,
  Sparkles,
  Phone,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  RefreshCw,
  Clock,
  X,
} from 'lucide-react';
import { useScrollLock } from '../../../lib/scrollLock';

interface AdminAvailabilityTabProps {
  availabilityDate: string;
  setAvailabilityDate: (d: string) => void;
  availabilityData: any;
  availabilityLoading: boolean;
  fetchAvailability: (d: string) => void;
  handleUnblockDate: () => void;
  handleTogglePublishSlot: (slot: any) => void;
  handleOpenEditSlot: (slot: any) => void;
  handleDeleteSlot: (slot: any) => void;
  setBlockDateModalOpen: (b: boolean) => void;
  setCreateSlotModalOpen: (b: boolean) => void;
  setInitScheduleModalOpen: (b: boolean) => void;
  setInitScheduleDays: (days: number) => void;
}

export default function AdminAvailabilityTab({
  availabilityDate,
  setAvailabilityDate,
  availabilityData,
  availabilityLoading,
  fetchAvailability,
  handleUnblockDate,
  handleTogglePublishSlot,
  handleOpenEditSlot,
  handleDeleteSlot,
  setBlockDateModalOpen,
  setCreateSlotModalOpen,
  setInitScheduleModalOpen,
  setInitScheduleDays,
}: AdminAvailabilityTabProps) {
  const [unblockConfirmOpen, setUnblockConfirmOpen] = useState(false);
  const [unblockLoading, setUnblockLoading] = useState(false);

  useScrollLock(unblockConfirmOpen);

  return (
    <div className="space-y-6">
      {/* Control Bar: Date Selector, Quick Jumps & Sanctuary Status */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/90 shadow-sm space-y-4">
        {/* Top Row: Date Selector & Quick Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-[#5B0D15]">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-stone-800">Date:</span>
            </div>

            <input
              type="date"
              value={availabilityDate}
              onChange={(e) => {
                setAvailabilityDate(e.target.value);
                fetchAvailability(e.target.value);
              }}
              className="px-3.5 py-1.5 rounded-xl border border-stone-300 bg-white text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#5B0D15] shadow-2xs"
            />

            {/* Quick Jump Buttons */}
            <div className="flex items-center gap-1.5 bg-stone-100/80 p-0.5 rounded-xl border border-stone-200/60">
              <button
                type="button"
                onClick={() => {
                  const d = new Date().toISOString().split('T')[0];
                  setAvailabilityDate(d);
                  fetchAvailability(d);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  availabilityDate === new Date().toISOString().split('T')[0]
                    ? 'bg-white text-[#5B0D15] shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date(Date.now() + 86400000).toISOString().split('T')[0];
                  setAvailabilityDate(d);
                  fetchAvailability(d);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  availabilityDate === new Date(Date.now() + 86400000).toISOString().split('T')[0]
                    ? 'bg-white text-[#5B0D15] shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
                  setAvailabilityDate(d);
                  fetchAvailability(d);
                }}
                className="px-3 py-1 rounded-lg text-xs font-semibold text-stone-600 hover:text-stone-900 transition-all cursor-pointer"
              >
                +7 Days
              </button>
            </div>
          </div>

          {/* Sanctuary Status Pill */}
          <div className="flex items-center gap-2">
            {availabilityData?.isBlocked ? (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold shadow-2xs">
                <Ban className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Sanctuary Blocked ({availabilityData.blockedReason || 'Holiday'})</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>Sanctuary Open &amp; Accepting Bookings</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row: Harmonized Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2.5">
            {availabilityData?.isBlocked ? (
              <button
                type="button"
                onClick={() => setUnblockConfirmOpen(true)}
                className="px-4 py-2 rounded-xl border border-rose-600 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Unlock className="w-4 h-4 text-white" />
                <span>Unblock This Date</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setBlockDateModalOpen(true)}
                className="px-4 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-medium text-xs shadow-2xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                title="Mark this date as holiday / sanctuary closed"
              >
                <Lock className="w-3.5 h-3.5 text-stone-500" />
                <span>Block Date</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setCreateSlotModalOpen(true)}
              className="px-4 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs shadow-2xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-amber-700" />
              <span>Create Custom Slot</span>
            </button>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => {
                setInitScheduleDays(7);
                setInitScheduleModalOpen(true);
              }}
              className="px-4.5 py-2 rounded-xl bg-[#5B0D15] hover:bg-[#480a11] text-amber-100 font-semibold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Initialize Week Schedule</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => fetchAvailability(availabilityDate)}
            className="p-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-900 transition-all cursor-pointer shadow-2xs"
            title="Refresh slot schedule"
          >
            <RefreshCw className={`w-4 h-4 ${availabilityLoading ? 'animate-spin text-[#5B0D15]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Slots Section */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/90 shadow-sm space-y-5">
        {/* Section Header with Stats Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#3B1E22] flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-amber-700" />
              <span>Sanctuary Consultation Slots</span>
              <span className="text-xs font-mono font-medium text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-md border border-stone-200/60">
                {availabilityDate}
              </span>
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Live appointment inventory and booking schedule for Dr. Pandit Vishal Dubey.
            </p>
          </div>

          {/* Clean Metric Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200/70">
              Total: <strong>{availabilityData?.totalSlots || 0}</strong>
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200/70">
              Booked: <strong>{availabilityData?.bookedCount || 0}</strong>
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/70">
              Available: <strong>{Math.max(0, (availabilityData?.totalSlots || 0) - (availabilityData?.bookedCount || 0))}</strong>
            </span>
          </div>
        </div>

        {availabilityLoading ? (
          <div className="py-20 text-center text-xs text-stone-500 space-y-3">
            <RefreshCw className="w-7 h-7 animate-spin mx-auto text-[#5B0D15]" />
            <p className="font-medium">Loading slots for {availabilityDate}...</p>
          </div>
        ) : !availabilityData?.slots || availabilityData.slots.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-500 space-y-3 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto border border-amber-200/80 shadow-2xs">
              <Calendar className="w-7 h-7 text-[#5B0D15]" />
            </div>
            <h4 className="font-serif font-bold text-base text-stone-800">No Slots Scheduled for this Date</h4>
            <p className="text-stone-400 leading-relaxed">
              Panditji has no custom or standard consultation slots for {availabilityDate}. Click below to automatically initialize the standard Vedic consultation slots.
            </p>
            <button
              type="button"
              onClick={() => {
                setInitScheduleDays(1);
                setInitScheduleModalOpen(true);
              }}
              className="mt-2 px-5 py-2.5 rounded-xl bg-[#5B0D15] hover:bg-[#480a11] text-amber-100 font-bold text-xs shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Initialize Standard Slots for Today</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
            {availabilityData.slots.map((slot: any) => {
              const isDateBlocked = Boolean(availabilityData?.isBlocked);
              const isBooked = slot.isBooked;
              // If the entire date is blocked, the slot cannot be published
              const isPublished = isDateBlocked ? false : Boolean(slot.isPublished);
              const isUnavailable = !isBooked && !isPublished;

              // Parse time into large digits and smaller AM/PM so "10" is prominent and "AM" doesn't overpower it
              const timeParts = (slot.startTime || '').trim().split(' ');
              const timeDigits = timeParts[0] || slot.startTime;
              const timePeriod = timeParts[1] || '';

              return (
                <div
                  key={slot.id}
                  className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-2xs relative group ${
                    isBooked
                      ? 'bg-rose-50/30 border-rose-200/90 hover:border-rose-300'
                      : isUnavailable
                      ? 'bg-stone-100/90 border-stone-300/90'
                      : 'bg-white border-stone-200/90 hover:border-amber-400 hover:shadow-md'
                  }`}
                >
                  {/* Card Header: Slot Time with prominent digits + small AM/PM & Clean Status */}
                  <div className="p-4 pb-3 bg-stone-50/50 border-b border-stone-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Clock className={`w-4 h-4 shrink-0 ${isUnavailable ? 'text-stone-400' : 'text-amber-700'}`} />
                      <div className={`flex items-baseline gap-1 ${isUnavailable ? 'opacity-60' : ''}`}>
                        <span className="font-sans font-semibold text-lg text-stone-900 group-hover:text-[#5B0D15] transition-colors tabular-nums">
                          {timeDigits}
                        </span>
                        {timePeriod && (
                          <span className="font-sans font-medium text-xs text-stone-500 uppercase tracking-wide">
                            {timePeriod}
                          </span>
                        )}
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-100 text-stone-600 border border-stone-200/60">
                        {slot.durationMinutes}m
                      </span>
                    </div>

                    <div>
                      {isBooked ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 uppercase tracking-wide flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                          Booked
                        </span>
                      ) : isPublished ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wide flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          Available
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 uppercase tracking-wide flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                          Unpublished
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Unavailable Central Indicator */}
                  {isUnavailable && (
                    <div className="absolute inset-x-0 top-[38%] flex items-center justify-center pointer-events-none z-10">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-stone-900/80 text-white shadow-md backdrop-blur-xs flex items-center gap-1.5 border border-white/20">
                        <EyeOff className="w-3.5 h-3.5 text-amber-300" />
                        <span>Unpublished</span>
                      </span>
                    </div>
                  )}

                  {/* Card Body: Meaningful Slot Context (Blurred when unavailable) */}
                  <div className={`p-4 space-y-2 flex-1 transition-all duration-200 ${isUnavailable ? 'filter blur-[1.5px] opacity-60 select-none' : ''}`}>
                    {isBooked && slot.booking ? (
                      <div className="p-3 rounded-xl bg-white border border-rose-200/80 space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-stone-900 text-xs truncate">
                            {slot.booking.customerName || 'Devotee Seeker'}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-900 border border-amber-200/80 uppercase">
                            {slot.booking.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 truncate flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{slot.booking.customerPhone || 'Contact verified'}</span>
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-stone-500 leading-relaxed">
                        {slot.notes ? (
                          <span className="italic text-stone-700">📝 {slot.notes}</span>
                        ) : isPublished ? (
                          <span>Standard 1-on-1 consultation slot open for devotee bookings.</span>
                        ) : (
                          <span className="text-amber-800/90 italic font-medium">Unpublished — Hidden from devotee booking catalogue.</span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Card Footer: Structured & Harmonized Action Controls */}
                  <div className="px-4 py-3 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between gap-2 z-20 relative">
                    {/* Toggle Visibility Button */}
                    <button
                      type="button"
                      disabled={isDateBlocked}
                      onClick={() => handleTogglePublishSlot(slot)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                        isDateBlocked
                          ? 'opacity-50 cursor-not-allowed border-stone-200 bg-stone-100 text-stone-500'
                          : isPublished
                          ? 'border-emerald-300/80 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 shadow-2xs'
                          : 'border-stone-300 bg-stone-100 hover:bg-stone-200 text-stone-700 shadow-2xs'
                      }`}
                      title={
                        isDateBlocked
                          ? 'Date is blocked. Unblock the date first to manage individual slots.'
                          : isPublished
                          ? 'Currently Available. Click to unpublish.'
                          : 'Currently Unpublished. Click to publish.'
                      }
                    >
                      {isPublished ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Publish</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-stone-500" />
                          <span>Unpublish</span>
                        </>
                      )}
                    </button>

                    {/* Edit & Delete Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditSlot(slot)}
                        className="p-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-all cursor-pointer shadow-2xs"
                        title="Edit slot timing or notes"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={!slot.canDelete}
                        onClick={() => handleDeleteSlot(slot)}
                        className={`p-1.5 rounded-xl border transition-all ${
                          slot.canDelete
                            ? 'border-stone-200 bg-white hover:border-rose-200 hover:bg-rose-50 text-stone-500 hover:text-rose-600 cursor-pointer shadow-2xs'
                            : 'border-stone-200 bg-stone-100 text-stone-300 cursor-not-allowed opacity-50'
                        }`}
                        title={
                          slot.canDelete
                            ? 'Delete slot permanently'
                            : 'Cannot delete: active booking confirmed on this slot'
                        }
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* UNBLOCK DATE CONFIRMATION MODAL */}
      {unblockConfirmOpen && (
        <div
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overscroll-contain modal-backdrop-contain animate-fadeIn"
          onClick={() => !unblockLoading && setUnblockConfirmOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-3xl border border-rose-200 shadow-2xl overflow-hidden flex flex-col modal-scroll-container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-rose-900 via-rose-800 to-[#5B0D15] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-200 border border-rose-300/40 flex items-center justify-center shrink-0">
                  <Unlock className="w-5 h-5 text-rose-300" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-rose-100">
                    Unblock Date
                  </h3>
                  <p className="text-[11px] text-rose-200">
                    Are you sure to unblock the date?
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUnblockConfirmOpen(false)}
                disabled={unblockLoading}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-amber-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 font-medium">Selected Date:</span>
                  <span className="font-mono font-bold text-base text-[#5B0D15]">{availabilityDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 font-medium">Current Status:</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    <Ban className="w-3 h-3 text-rose-600" />
                    <span>Blocked ({availabilityData?.blockedReason || 'Holiday / Closed'})</span>
                  </span>
                </div>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                Are you sure to unblock the date? Unblocking this date will reopen the sanctuary for bookings. You can then publish specific consultation slots for seekers.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUnblockConfirmOpen(false)}
                  disabled={unblockLoading}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setUnblockLoading(true);
                    try {
                      await handleUnblockDate();
                      setUnblockConfirmOpen(false);
                    } catch (err) {
                      // Handled by notification
                    } finally {
                      setUnblockLoading(false);
                    }
                  }}
                  disabled={unblockLoading}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  {unblockLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Unblocking...</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4" />
                      <span>Yes, Unblock Date</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
