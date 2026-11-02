import React, { useEffect } from 'react';
import { useScrollLock } from '../../../lib/scrollLock';
import {
  Trash2,
  X,
  AlertCircle,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  type: 'booking' | 'order';
  item: {
    id: string;
    title?: string;
    customerName?: string;
    date?: string;
    amount?: number | string;
    status?: string;
  } | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  type,
  item,
  loading,
  error,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  useScrollLock(isOpen && Boolean(item));

  useEffect(() => {
    if (!isOpen || !item) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, item, loading, onClose]);

  if (!isOpen || !item) return null;

  const shortId = item.id.length > 8 ? item.id.slice(0, 8).toUpperCase() : item.id.toUpperCase();
  const isBooking = type === 'booking';

  return (
    <div
      data-lenis-prevent="true"
      onWheel={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overscroll-contain modal-backdrop-contain animate-fadeIn"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-rose-200 shadow-2xl overflow-hidden flex flex-col modal-scroll-container">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-rose-900 via-rose-800 to-[#5B0D15] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-200 border border-rose-300/40 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5 text-rose-300" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-rose-100">
                {isBooking ? 'Delete Booking Record' : 'Delete Order Record'}
              </h3>
              <p className="text-[11px] text-rose-200">
                Permanent deletion from database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Warning Message Box */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[13px]">
                Are you sure you want to delete this {isBooking ? 'booking' : 'order'}?
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                This will permanently delete #{shortId} from the database so the data remains clean and manageable. This action cannot be reversed.
              </p>
            </div>
          </div>

          {/* Item Summary Card */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-stone-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Reference ID:</span>
              <span className="font-mono font-bold text-stone-900">#{shortId}</span>
            </div>
            {item.title && (
              <div className="flex items-center justify-between">
                <span className="text-stone-500">{isBooking ? 'Service:' : 'Order Summary:'}</span>
                <span className="font-semibold text-stone-800 truncate max-w-[200px]" title={item.title}>
                  {item.title}
                </span>
              </div>
            )}
            {item.customerName && (
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Customer:</span>
                <span className="font-semibold text-stone-800">{item.customerName}</span>
              </div>
            )}
            {item.date && (
              <div className="flex items-center justify-between">
                <span className="text-stone-500">{isBooking ? 'Scheduled:' : 'Order Date:'}</span>
                <span className="font-semibold text-stone-800">{item.date}</span>
              </div>
            )}
            {item.amount !== undefined && item.amount !== null && (
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Amount:</span>
                <span className="font-bold text-[#5B0D15]">
                  {typeof item.amount === 'number' ? `₹${item.amount.toLocaleString('en-IN')}` : item.amount}
                </span>
              </div>
            )}
            {item.status && (
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Status:</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-800 border border-stone-200">
                  {item.status}
                </span>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-rose-900 hover:opacity-95 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5 text-rose-200" />
                  <span>Yes, Delete {isBooking ? 'Booking' : 'Order'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
