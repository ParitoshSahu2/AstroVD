import React from 'react';
import {
  Plus,
  Edit3,
  Ban,
  Sparkles,
  X,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Clock,
  Trash2,
} from 'lucide-react';

function splitTimeAndPeriod(timeStr: string) {
  const clean = (timeStr || '').trim();
  const match = clean.match(/^(\d{1,2}(?::\d{0,2})?)(?:\s*(AM|PM))?$/i);
  if (match) {
    const time = match[1] || '';
    const period = (match[2] || (clean.toUpperCase().includes('PM') ? 'PM' : 'AM')).toUpperCase() as 'AM' | 'PM';
    return { time, period };
  }
  const isPM = clean.toUpperCase().includes('PM');
  const time = clean.replace(/AM|PM/gi, '').trim();
  return { time, period: (isPM ? 'PM' : 'AM') as 'AM' | 'PM' };
}

interface AvailabilityModalsProps {
  availabilityDate: string;
  createSlotModalOpen: boolean;
  setCreateSlotModalOpen: (b: boolean) => void;
  newSlotTime: string;
  setNewSlotTime: (s: string) => void;
  newSlotDuration: number;
  setNewSlotDuration: (n: number) => void;
  newSlotPublished: boolean;
  setNewSlotPublished: (b: boolean) => void;
  newSlotNotes: string;
  setNewSlotNotes: (s: string) => void;
  createSlotLoading: boolean;
  createSlotError: string | null;
  handleCreateSlot: (e: React.FormEvent) => void;
  editSlotModalOpen: boolean;
  setEditSlotModalOpen: (b: boolean) => void;
  slotToEdit: any | null;
  setSlotToEdit: (s: any | null) => void;
  editSlotTime: string;
  setEditSlotTime: (s: string) => void;
  editSlotDuration: number;
  setEditSlotDuration: (n: number) => void;
  editSlotPublished: boolean;
  setEditSlotPublished: (b: boolean) => void;
  editSlotNotes: string;
  setEditSlotNotes: (s: string) => void;
  editSlotLoading: boolean;
  editSlotError: string | null;
  handleUpdateSlot: (e: React.FormEvent) => void;
  blockDateModalOpen: boolean;
  setBlockDateModalOpen: (b: boolean) => void;
  blockDateReason: string;
  setBlockDateReason: (s: string) => void;
  blockDateLoading: boolean;
  handleBlockDate: (e: React.FormEvent) => void;
  initScheduleModalOpen: boolean;
  setInitScheduleModalOpen: (b: boolean) => void;
  initScheduleDays: number;
  setInitScheduleDays: (n: number) => void;
  initScheduleLoading: boolean;
  handleInitStandardSchedule: (e: React.FormEvent) => void;
  slotToDelete: any | null;
  setSlotToDelete: (s: any | null) => void;
  deleteSlotLoading: boolean;
  handleConfirmDeleteSlot: () => void;
}

export default function AvailabilityModals({
  availabilityDate,
  createSlotModalOpen,
  setCreateSlotModalOpen,
  newSlotTime,
  setNewSlotTime,
  newSlotDuration,
  setNewSlotDuration,
  newSlotPublished,
  setNewSlotPublished,
  newSlotNotes,
  setNewSlotNotes,
  createSlotLoading,
  createSlotError,
  handleCreateSlot,
  editSlotModalOpen,
  setEditSlotModalOpen,
  slotToEdit,
  setSlotToEdit,
  editSlotTime,
  setEditSlotTime,
  editSlotDuration,
  setEditSlotDuration,
  editSlotPublished,
  setEditSlotPublished,
  editSlotNotes,
  setEditSlotNotes,
  editSlotLoading,
  editSlotError,
  handleUpdateSlot,
  blockDateModalOpen,
  setBlockDateModalOpen,
  blockDateReason,
  setBlockDateReason,
  blockDateLoading,
  handleBlockDate,
  initScheduleModalOpen,
  setInitScheduleModalOpen,
  initScheduleDays,
  setInitScheduleDays,
  initScheduleLoading,
  handleInitStandardSchedule,
  slotToDelete,
  setSlotToDelete,
  deleteSlotLoading,
  handleConfirmDeleteSlot,
}: AvailabilityModalsProps) {
  return (
    <>
      {/* CREATE SLOT MODAL */}
      {createSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-amber-300 shadow-2xl overflow-hidden text-[#3B1E22]">
            <div className="px-6 py-4 bg-gradient-to-r from-[#5B0D15] via-[#7B121C] to-[#3B1E22] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-300" />
                <h3 className="font-serif font-bold text-lg text-amber-100">Create Consultation Slot</h3>
              </div>
              <button
                onClick={() => setCreateSlotModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSlot} className="p-6 space-y-4">
              {createSlotError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{createSlotError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Selected Date:
                </label>
                <input
                  type="date"
                  disabled
                  value={availabilityDate}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-100 text-stone-600 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Start Time:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={splitTimeAndPeriod(newSlotTime).time}
                    onChange={(e) => {
                      const curPeriod = splitTimeAndPeriod(newSlotTime).period;
                      const val = e.target.value.replace(/AM|PM/gi, '').trim();
                      setNewSlotTime(`${val} ${curPeriod}`.trim());
                    }}
                    placeholder="10:00"
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#5B0D15]"
                  />
                  <div className="flex rounded-xl bg-stone-100 p-1 border border-stone-200 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const curTime = splitTimeAndPeriod(newSlotTime).time || '10:00';
                        setNewSlotTime(`${curTime} AM`);
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        splitTimeAndPeriod(newSlotTime).period === 'AM'
                          ? 'bg-[#5B0D15] text-amber-100 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const curTime = splitTimeAndPeriod(newSlotTime).time || '10:00';
                        setNewSlotTime(`${curTime} PM`);
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        splitTimeAndPeriod(newSlotTime).period === 'PM'
                          ? 'bg-[#5B0D15] text-amber-100 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      PM
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Duration (Minutes):
                </label>
                <input
                  type="number"
                  min={10}
                  max={240}
                  required
                  value={newSlotDuration}
                  onChange={(e) => setNewSlotDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#5B0D15]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="newSlotPublished"
                  checked={newSlotPublished}
                  onChange={(e) => setNewSlotPublished(e.target.checked)}
                  className="rounded text-[#5B0D15] focus:ring-[#5B0D15]"
                />
                <label htmlFor="newSlotPublished" className="text-xs font-semibold text-stone-700 cursor-pointer">
                  Publish immediately (visible on /appointment)
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Admin Notes (Optional remarks for this slot):
                </label>
                <input
                  type="text"
                  value={newSlotNotes}
                  onChange={(e) => setNewSlotNotes(e.target.value)}
                  placeholder="e.g. Morning Brahma Muhurta sacred consultation"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#5B0D15]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setCreateSlotModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSlotLoading}
                  className="px-5 py-2 rounded-xl bg-[#5B0D15] hover:bg-[#480a11] text-amber-100 text-xs font-bold shadow transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {createSlotLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Create Slot</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SLOT MODAL */}
      {editSlotModalOpen && slotToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-amber-300 shadow-2xl overflow-hidden text-[#3B1E22]">
            <div className="px-6 py-4 bg-gradient-to-r from-[#5B0D15] via-[#7B121C] to-[#3B1E22] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-300" />
                <h3 className="font-serif font-bold text-lg text-amber-100">Edit Consultation Slot</h3>
              </div>
              <button
                onClick={() => {
                  setEditSlotModalOpen(false);
                  setSlotToEdit(null);
                }}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateSlot} className="p-6 space-y-4">
              {editSlotError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{editSlotError}</span>
                </div>
              )}

              {slotToEdit.isBooked && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-[11px] leading-relaxed">
                  ⚠️ <strong>Active booking confirmed:</strong> Start time is locked to preserve the confirmed customer appointment. You may still adjust duration, notes, or toggle visibility.
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Start Time:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    disabled={slotToEdit.isBooked}
                    value={splitTimeAndPeriod(editSlotTime).time}
                    onChange={(e) => {
                      const curPeriod = splitTimeAndPeriod(editSlotTime).period;
                      const val = e.target.value.replace(/AM|PM/gi, '').trim();
                      setEditSlotTime(`${val} ${curPeriod}`.trim());
                    }}
                    placeholder="10:00"
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-300 bg-white disabled:bg-stone-100 disabled:text-stone-500 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#5B0D15]"
                  />
                  <div className="flex rounded-xl bg-stone-100 p-1 border border-stone-200 shrink-0">
                    <button
                      type="button"
                      disabled={slotToEdit.isBooked}
                      onClick={() => {
                        const curTime = splitTimeAndPeriod(editSlotTime).time || '10:00';
                        setEditSlotTime(`${curTime} AM`);
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        splitTimeAndPeriod(editSlotTime).period === 'AM'
                          ? 'bg-[#5B0D15] text-amber-100 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      disabled={slotToEdit.isBooked}
                      onClick={() => {
                        const curTime = splitTimeAndPeriod(editSlotTime).time || '10:00';
                        setEditSlotTime(`${curTime} PM`);
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        splitTimeAndPeriod(editSlotTime).period === 'PM'
                          ? 'bg-[#5B0D15] text-amber-100 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      PM
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Duration (Minutes):
                </label>
                <input
                  type="number"
                  min={10}
                  max={240}
                  required
                  value={editSlotDuration}
                  onChange={(e) => setEditSlotDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#5B0D15]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editSlotPublished"
                  checked={editSlotPublished}
                  onChange={(e) => setEditSlotPublished(e.target.checked)}
                  className="rounded text-[#5B0D15] focus:ring-[#5B0D15]"
                />
                <label htmlFor="editSlotPublished" className="text-xs font-semibold text-stone-700 cursor-pointer">
                  Published (visible on /appointment)
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Admin Notes:
                </label>
                <input
                  type="text"
                  value={editSlotNotes}
                  onChange={(e) => setEditSlotNotes(e.target.value)}
                  placeholder="Remarks or instructions"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#5B0D15]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setEditSlotModalOpen(false);
                    setSlotToEdit(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSlotLoading}
                  className="px-5 py-2 rounded-xl bg-[#5B0D15] hover:bg-[#480a11] text-amber-100 text-xs font-bold shadow transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {editSlotLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BLOCK DATE MODAL */}
      {blockDateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-rose-300 shadow-2xl overflow-hidden text-[#3B1E22]">
            <div className="px-6 py-4 bg-gradient-to-r from-rose-800 via-rose-900 to-[#3B1E22] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ban className="w-5 h-5 text-rose-300" />
                <h3 className="font-serif font-bold text-lg text-white">Block Sanctuary Date</h3>
              </div>
              <button
                onClick={() => setBlockDateModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBlockDate} className="p-6 space-y-4">
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs leading-relaxed">
                Blocking <strong>{availabilityDate}</strong> will prevent customers from reserving appointments on this date. Existing bookings remain recorded in the system.
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Reason for Blocking (e.g. Festival, Sanctuary Leave, Private Ritual):
                </label>
                <input
                  type="text"
                  required
                  value={blockDateReason}
                  onChange={(e) => setBlockDateReason(e.target.value)}
                  placeholder="e.g. Diwali Sanctuary Observance & Maha Homa"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setBlockDateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={blockDateLoading}
                  className="px-5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {blockDateLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                  <span>Block Date</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INITIALIZE STANDARD SCHEDULE MODAL */}
      {initScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-amber-300 shadow-2xl overflow-hidden text-[#3B1E22]">
            <div className="px-6 py-4 bg-gradient-to-r from-[#5B0D15] via-[#7B121C] to-[#3B1E22] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="font-serif font-bold text-lg text-amber-100">Initialize Vedic Schedule</h3>
              </div>
              <button
                onClick={() => setInitScheduleModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInitStandardSchedule} className="p-6 space-y-4">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs leading-relaxed">
                This will automatically create standard consultation slots (<strong>10:00 AM, 11:30 AM, 02:00 PM, 03:30 PM, 05:00 PM, 06:30 PM</strong>) for consecutive days starting from <strong>{availabilityDate}</strong> without overwriting existing bookings.
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Start Date:
                </label>
                <input
                  type="date"
                  disabled
                  value={availabilityDate}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-100 text-stone-600 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Number of Consecutive Days to Initialize (1 - 14):
                </label>
                <input
                  type="number"
                  min={1}
                  max={14}
                  required
                  value={initScheduleDays}
                  onChange={(e) => setInitScheduleDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#5B0D15]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setInitScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={initScheduleLoading}
                  className="px-5 py-2 rounded-xl bg-[#5B0D15] hover:bg-[#480a11] text-amber-100 text-xs font-bold shadow transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {initScheduleLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                  <span>Initialize {initScheduleDays} Day(s)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* DELETE SLOT CONFIRMATION MODAL */}
      {slotToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-rose-200 shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-rose-900 via-rose-800 to-[#5B0D15] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-200 border border-rose-300/40 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-rose-300" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-rose-100">
                    Delete Consultation Slot
                  </h3>
                  <p className="text-[11px] text-rose-200">
                    Are you sure you want to delete this slot?
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSlotToDelete(null)}
                disabled={deleteSlotLoading}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-amber-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 font-medium">Date:</span>
                  <span className="font-bold text-[#3B1E22]">{slotToDelete.date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 font-medium">Time Window:</span>
                  <span className="font-mono font-bold text-base text-[#5B0D15]">{slotToDelete.startTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 font-medium">Duration:</span>
                  <span className="font-semibold text-stone-800">{slotToDelete.durationMinutes} minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 font-medium">Visibility:</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      slotToDelete.isPublished
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-stone-100 text-stone-600 border border-stone-200'
                    }`}
                  >
                    {slotToDelete.isPublished ? 'Published to Seekers' : 'Unpublished (Draft)'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-rose-950">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                  <span>Important Confirmation</span>
                </p>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  This consultation window will be permanently removed from the schedule. Seekers will no longer be able to view or reserve this slot.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSlotToDelete(null)}
                  disabled={deleteSlotLoading}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteSlot}
                  disabled={deleteSlotLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-rose-900 hover:opacity-95 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  {deleteSlotLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting Slot...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Yes, Delete Slot</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
