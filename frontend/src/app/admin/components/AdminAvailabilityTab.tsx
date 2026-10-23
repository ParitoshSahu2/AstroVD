import React from 'react';
import {
  Calendar,
  Ban,
  CheckCircle2,
  Lock,
  Plus,
  Sparkles,
  Phone,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  RefreshCw,
} from 'lucide-react';

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
  return (
    <div className="space-y-6">
      {/* Control Bar: Date Selector, Quick Jumps & Sanctuary Status */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-stone-200/80 shadow-sm flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="space-y-2 w-full lg:w-auto">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#5B0D15]" />
              <span>Inspection Date:</span>
            </span>
            <input
              type="date"
              value={availabilityDate}
              onChange={(e) => {
                setAvailabilityDate(e.target.value);
                fetchAvailability(e.target.value);
              }}
              className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#5B0D15]"
            />

            {/* Quick Jump Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const d = new Date().toISOString().split('T')[0];
                  setAvailabilityDate(d);
                  fetchAvailability(d);
                }}
                className="px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-[11px] font-medium text-stone-700 cursor-pointer"
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
                className="px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-[11px] font-medium text-stone-700 cursor-pointer"
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
                className="px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-[11px] font-medium text-stone-700 cursor-pointer"
              >
                +7 Days
              </button>
            </div>
          </div>

          {/* Sanctuary Status Tag */}
          <div className="flex items-center gap-2">
            {availabilityData?.isBlocked ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                <Ban className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Sanctuary Blocked / Closed ({availabilityData.blockedReason || 'Holiday'})</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Sanctuary Open &amp; Accepting Consultations</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
          {availabilityData?.isBlocked ? (
            <button
              type="button"
              onClick={handleUnblockDate}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Unblock This Date</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setBlockDateModalOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              title="Block entire date for Panditji travels or temple rituals"
            >
              <Lock className="w-3.5 h-3.5 text-rose-600" />
              <span>Block Date (Holiday)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setCreateSlotModalOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-[#5B0D15] font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-700" />
            <span>Create Custom Slot</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setInitScheduleDays(7);
              setInitScheduleModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-[#5B0D15] hover:bg-[#480a11] text-amber-100 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Initialize Week Schedule</span>
          </button>

          <button
            type="button"
            onClick={() => fetchAvailability(availabilityDate)}
            className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
            title="Refresh availability for this date"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${availabilityLoading ? 'animate-spin text-[#5B0D15]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Slots Grid */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-stone-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#3B1E22] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-700" />
              <span>Sanctuary Consultation Slots for {availabilityDate}</span>
            </h3>
            <p className="text-xs text-stone-500">
              Total Slots: <strong>{availabilityData?.totalSlots || 0}</strong> • Booked: <strong>{availabilityData?.bookedCount || 0}</strong> • Free:{' '}
              <strong>{(availabilityData?.totalSlots || 0) - (availabilityData?.bookedCount || 0)}</strong>
            </p>
          </div>
        </div>

        {availabilityLoading ? (
          <div className="py-20 text-center text-xs text-stone-500 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#5B0D15]" />
            <p>Loading Panditji availability slots for {availabilityDate}...</p>
          </div>
        ) : !availabilityData?.slots || availabilityData.slots.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-500 space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mx-auto border border-amber-200">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="font-bold text-sm text-stone-700">No Slots Scheduled</p>
            <p className="text-stone-400 max-w-sm mx-auto">
              Panditji has no custom or standard slots saved for {availabilityDate}. Initialize standard schedule or create custom slots above.
            </p>
            <button
              type="button"
              onClick={() => {
                setInitScheduleDays(1);
                setInitScheduleModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#5B0D15] hover:bg-[#480a11] text-amber-100 font-bold text-xs shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Initialize Standard Vedic Slots</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availabilityData.slots.map((slot: any) => {
              const isBooked = slot.isBooked;
              const isPublished = slot.isPublished;

              return (
                <div
                  key={slot.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                    isBooked
                      ? 'bg-rose-50/40 border-rose-200 shadow-sm'
                      : isPublished
                      ? 'bg-white hover:border-amber-400 border-stone-200 shadow-sm'
                      : 'bg-stone-50/60 border-stone-200 opacity-80'
                  }`}
                >
                  {/* Top: Start Time & Badges */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-black text-lg text-[#3B1E22]">
                          {slot.startTime}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
                          {slot.durationMinutes} mins
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-400 block mt-0.5">
                        ID: {slot.id.slice(0, 8)}...
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {isBooked ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300 uppercase tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                          Booked
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          Free
                        </span>
                      )}

                      <span
                        className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                          isPublished
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {isPublished ? 'Published' : 'Draft (Hidden)'}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Booking Details or Slot Note */}
                  {isBooked && slot.booking ? (
                    <div className="p-2.5 rounded-xl bg-white border border-rose-200 text-xs space-y-1 shadow-inner">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#3B1E22] truncate">
                          {slot.booking.customerName}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          {slot.booking.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 truncate flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                        {slot.booking.customerPhone || 'No phone'}
                      </p>
                      <p className="text-[10px] text-stone-400 font-mono truncate">
                        Ref: {slot.booking.id.slice(0, 12)}...
                      </p>
                    </div>
                  ) : (
                    <div className="text-xs text-stone-500 min-h-[40px] flex items-center">
                      {slot.notes ? (
                        <p className="italic text-[11px] text-stone-600 line-clamp-2">
                          📝 {slot.notes}
                        </p>
                      ) : (
                        <p className="text-[11px] text-stone-400">
                          Standard consultation window open for appointment.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Bottom: Action Buttons */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleTogglePublishSlot(slot)}
                      className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-[11px] font-semibold text-stone-700 flex items-center gap-1 cursor-pointer"
                    >
                      {isPublished ? (
                        <>
                          <EyeOff className="w-3 h-3 text-stone-400" />
                          <span>Unpublish</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3 text-amber-700" />
                          <span>Publish</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditSlot(slot)}
                        className="p-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 hover:text-[#5B0D15] transition-colors cursor-pointer"
                        title="Edit slot details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={!slot.canDelete}
                        onClick={() => handleDeleteSlot(slot)}
                        className={`p-1.5 rounded-xl border transition-all ${
                          slot.canDelete
                            ? 'border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer'
                            : 'border-stone-200 bg-stone-100 text-stone-300 cursor-not-allowed opacity-50'
                        }`}
                        title={
                          slot.canDelete
                            ? 'Delete slot permanently'
                            : 'Cannot delete: active customer booking confirmed on this slot'
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
    </div>
  );
}
