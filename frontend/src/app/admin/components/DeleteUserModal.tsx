import React from 'react';
import {
  Trash2,
  X,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { DeletableUser } from '../types';

interface DeleteUserModalProps {
  isOpen: boolean;
  userToDelete: DeletableUser | null;
  deleteLoading: boolean;
  deleteError: string | null;
  onClose: () => void;
  onConfirmDelete: () => void;
}

export default function DeleteUserModal({
  isOpen,
  userToDelete,
  deleteLoading,
  deleteError,
  onClose,
  onConfirmDelete,
}: DeleteUserModalProps) {
  if (!isOpen || !userToDelete) return null;

  return (
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
                {userToDelete.role === 'ADMIN' ? 'Remove & Delete Admin' : 'Delete User Account'}
              </h3>
              <p className="text-[11px] text-rose-200">
                This action is permanent and cannot be undone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={deleteLoading}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {deleteError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{deleteError}</span>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-amber-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Name:</span>
              <span className="font-bold text-[#3B1E22]">{userToDelete.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Email:</span>
              <span className="font-semibold text-stone-800">{userToDelete.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Role:</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  userToDelete.role === 'ADMIN'
                    ? 'bg-amber-100 text-amber-900 border border-amber-200'
                    : 'bg-stone-100 text-stone-700 border border-stone-200'
                }`}
              >
                {userToDelete.role}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Wallet Balance:</span>
              <span className="font-semibold text-[#5B0D15]">₹{userToDelete.walletBalance.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-amber-950">
              <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
              <span>What happens next:</span>
            </p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              The account credentials, orders, consultations, and wallet records will be permanently deleted.
              An immutable, append-only record is preserved in the administrative audit logs.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={deleteLoading}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirmDelete}
              disabled={deleteLoading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-rose-900 hover:opacity-95 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              {deleteLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Deleting Account...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Permanently Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
