import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  UserCheck,
  UserX,
  UserMinus,
  Shield,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Check,
} from 'lucide-react';
import { UserSummary, DeletableUser } from '../types';

interface AdminUsersTabProps {
  search: string;
  setSearch: (s: string) => void;
  handleSearchSubmit: (e: React.FormEvent) => void;
  roleFilter: string;
  setRoleFilter: (r: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  users: UserSummary[];
  loading: boolean;
  totalCount: number;
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  currentUser: any;
  isSuperadmin: boolean;
  actionLoading: boolean;
  deleteLoading: boolean;
  onInspectUser: (userId: string) => void;
  onToggleStatus: (userId: string, currentStatus: string) => void;
  onUpdateRole: (userId: string, targetRole: 'USER' | 'ADMIN') => void;
  onInitiateDelete: (user: DeletableUser) => void;
  canBlockUser: (user: any) => boolean;
  canDeleteUser: (user: any) => boolean;
  getInitials: (name?: string) => string;
}

export default function AdminUsersTab({
  search,
  setSearch,
  handleSearchSubmit,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  users,
  loading,
  totalCount,
  page,
  totalPages,
  onPageChange,
  currentUser,
  isSuperadmin,
  actionLoading,
  deleteLoading,
  onInspectUser,
  onToggleStatus,
  onUpdateRole,
  onInitiateDelete,
  canBlockUser,
  canDeleteUser,
  getInitials,
}: AdminUsersTabProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveMenuId(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Filter & Search Bar */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-stone-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user by name or email (e.g. Priya, Priya@astrovd.com)..."
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

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <span className="font-semibold hidden sm:inline">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            >
              <option value="">All Roles</option>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
              <option value="SUPERADMIN">SUPERADMIN</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <span className="font-semibold hidden sm:inline">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Directory Container */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-stone-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#3B1E22]">
              {roleFilter === 'ADMIN'
                ? 'Astrologers & Pandits Directory'
                : roleFilter === 'SUPERADMIN'
                ? 'Superadmin Accounts Directory'
                : roleFilter === 'USER'
                ? 'Seekers & Users Directory'
                : 'User & Astrologer Accounts Directory'}
            </h3>
            <p className="text-xs text-stone-500">
              Click any row to inspect user 360°, purchase history, and booked consultations.
            </p>
          </div>
          <span className="text-xs font-semibold text-stone-500 shrink-0">
            Showing {users.length} of {totalCount} {roleFilter === 'ADMIN' ? 'astrologers' : 'accounts'}
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-stone-500 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#5B0D15]" />
            <p>Loading account records...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-500">
            No accounts found matching your filters.
          </div>
        ) : (
          <div className="w-full min-w-0">
            {/* Desktop & Tablet View: Clean 7-Column Table (Fits in first viewport, No Horizontal Scroll) */}
            <div className="hidden md:block w-full">
              <table className="w-full table-fixed text-left text-xs divide-y divide-stone-100">
                <thead>
                  <tr className="border-b border-stone-200/80 text-stone-400 uppercase tracking-wider font-semibold text-[10.5px]">
                    <th className="py-3 px-3 w-[28%] font-medium truncate">User / Astrologer</th>
                    <th className="py-3 px-3 w-[11%] font-medium truncate">Role</th>
                    <th className="py-3 px-3 w-[11%] font-medium truncate">Status</th>
                    <th className="py-3 px-3 w-[13%] font-medium truncate">Wallet</th>
                    <th className="py-3 px-3 text-center w-[11%] font-medium truncate">Orders</th>
                    <th className="py-3 px-3 text-center w-[11%] font-medium truncate">Bookings</th>
                    <th className="py-3 px-3 text-right w-[15%] font-medium truncate">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {users.map((u, index) => {
                    const isNearBottom = index >= users.length - 2 && users.length > 2;

                    return (
                      <tr
                        key={u.id}
                        onClick={() => onInspectUser(u.id)}
                        className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
                        title="Click to inspect user details 360°"
                      >
                        {/* 1. User Info (Avatar + Name + Email) */}
                        <td className="py-3 px-3 align-middle overflow-hidden">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#5B0D15] to-[#7B121C] text-amber-200 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-300/50">
                              {getInitials(u.name)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div
                                className="font-bold text-[#3B1E22] truncate group-hover:text-[#5B0D15] transition-colors"
                                title={u.name}
                              >
                                {u.name}
                              </div>
                              <div className="text-[11px] text-stone-500 truncate" title={u.email}>
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Role Badge */}
                        <td className="py-3 px-3 align-middle overflow-hidden">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider truncate max-w-full ${
                              u.role === 'SUPERADMIN'
                                ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                : u.role === 'ADMIN'
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : 'bg-stone-100 text-stone-700 border border-stone-200'
                            }`}
                            title={u.role}
                          >
                            {u.role}
                          </span>
                        </td>

                        {/* 3. Status Pill */}
                        <td className="py-3 px-3 align-middle overflow-hidden">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider truncate max-w-full ${
                              u.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                            title={u.status}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            />
                            <span className="truncate">{u.status}</span>
                          </span>
                        </td>

                        {/* 4. Wallet Balance */}
                        <td className="py-3 px-3 align-middle overflow-hidden font-semibold text-[#5B0D15] truncate" title={`Wallet: ₹${u.walletBalance.toFixed(2)}`}>
                          ₹{u.walletBalance.toFixed(2)}
                        </td>

                        {/* 5. Orders Count */}
                        <td className="py-3 px-3 text-center align-middle overflow-hidden">
                          <span
                            className="inline-block px-2 py-0.5 rounded-lg bg-blue-50 text-blue-900 font-bold text-[11px] border border-blue-200 truncate max-w-full"
                            title={`Orders: ${u._count?.orders ?? 0}`}
                          >
                            🛒 {u._count?.orders ?? 0}
                          </span>
                        </td>

                        {/* 6. Bookings Count */}
                        <td className="py-3 px-3 text-center align-middle overflow-hidden">
                          <span
                            className="inline-block px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 font-bold text-[11px] border border-amber-200 truncate max-w-full"
                            title={`Bookings: ${u._count?.bookings ?? 0}`}
                          >
                            🕉️ {u._count?.bookings ?? 0}
                          </span>
                        </td>

                        {/* 7. Actions (Quick Inspect + Compact Three-Dot Menu '⋮') */}
                        <td className="py-3 px-3 text-right align-middle overflow-hidden">
                          <div className="flex items-center justify-end gap-1.5 flex-nowrap">
                            {/* Quick Inspect Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onInspectUser(u.id);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-[#5B0D15] font-bold text-xs border border-amber-300/80 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                              title="Inspect User 360°: Purchases, Clicks, Platform Activity"
                            >
                              <Eye className="w-3.5 h-3.5 shrink-0" />
                              <span className="hidden xl:inline">Inspect</span>
                            </button>

                            {/* Three-Dot Menu */}
                            <div className="relative inline-block text-left">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId((prev) => (prev === u.id ? null : u.id));
                                }}
                                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                  activeMenuId === u.id
                                    ? 'bg-stone-100 text-stone-900 border-stone-300'
                                    : 'border-transparent text-stone-400 hover:text-stone-700 hover:bg-stone-100 hover:border-stone-200'
                                }`}
                                title="Account actions"
                                aria-label={`Actions for ${u.name}`}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {activeMenuId === u.id && (
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
                                    className={`absolute right-0 z-40 w-48 rounded-2xl bg-white/95 backdrop-blur-xl border border-stone-200 shadow-xl py-1 text-xs text-stone-700 animate-fadeIn ${
                                      isNearBottom ? 'bottom-full mb-1' : 'top-full mt-1'
                                    }`}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        onInspectUser(u.id);
                                      }}
                                      className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-stone-100/80 hover:text-stone-900 transition-colors cursor-pointer"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-amber-700" />
                                      <span>Inspect User 360°</span>
                                    </button>

                                    {/* BLOCK / UNBLOCK TOGGLE */}
                                    {canBlockUser(u) && (
                                      <button
                                        type="button"
                                        disabled={actionLoading}
                                        onClick={() => {
                                          setActiveMenuId(null);
                                          onToggleStatus(u.id, u.status);
                                        }}
                                        className={`w-full px-3 py-2 text-left flex items-center gap-2 transition-colors cursor-pointer ${
                                          u.status === 'ACTIVE'
                                            ? 'hover:bg-rose-50 text-rose-700'
                                            : 'hover:bg-emerald-50 text-emerald-700'
                                        }`}
                                      >
                                        {u.status === 'ACTIVE' ? (
                                          <>
                                            <UserX className="w-3.5 h-3.5 text-rose-600" />
                                            <span>Suspend / Block</span>
                                          </>
                                        ) : (
                                          <>
                                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                            <span>Unblock Account</span>
                                          </>
                                        )}
                                      </button>
                                    )}

                                    {/* SUPERADMIN ROLE MANAGEMENT */}
                                    {isSuperadmin && u.id !== currentUser?.id && (
                                      <>
                                        {u.role === 'ADMIN' ? (
                                          <button
                                            type="button"
                                            disabled={actionLoading}
                                            onClick={() => {
                                              setActiveMenuId(null);
                                              onUpdateRole(u.id, 'USER');
                                            }}
                                            className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-amber-50 text-amber-900 transition-colors cursor-pointer"
                                          >
                                            <UserMinus className="w-3.5 h-3.5 text-amber-700" />
                                            <span>Demote to User</span>
                                          </button>
                                        ) : u.role === 'USER' ? (
                                          <button
                                            type="button"
                                            disabled={actionLoading}
                                            onClick={() => {
                                              setActiveMenuId(null);
                                              onUpdateRole(u.id, 'ADMIN');
                                            }}
                                            className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-purple-50 text-purple-900 transition-colors cursor-pointer"
                                          >
                                            <Shield className="w-3.5 h-3.5 text-purple-700" />
                                            <span>Promote to Admin</span>
                                          </button>
                                        ) : null}
                                      </>
                                    )}

                                    {/* DELETE USER */}
                                    {canDeleteUser(u) && (
                                      <button
                                        type="button"
                                        disabled={actionLoading || deleteLoading}
                                        onClick={() => {
                                          setActiveMenuId(null);
                                          onInitiateDelete(u);
                                        }}
                                        className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-rose-50 text-rose-700 border-t border-stone-100 transition-colors cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                        <span>Permanently Delete</span>
                                      </button>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Clean Card Layout (Zero Horizontal Scroll on small viewports) */}
            <div className="md:hidden space-y-3">
              {users.map((u, index) => {
                const isNearBottom = index >= users.length - 2 && users.length > 2;

                return (
                  <div
                    key={u.id}
                    onClick={() => onInspectUser(u.id)}
                    className="p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:border-amber-400 transition-all cursor-pointer space-y-2.5"
                  >
                    {/* Top Row: User Avatar, Name, Email, Role & Menu */}
                    <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5B0D15] to-[#7B121C] text-amber-200 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-300/50">
                          {getInitials(u.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-[#3B1E22] truncate">{u.name}</div>
                          <div className="text-[11px] text-stone-500 truncate">{u.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'SUPERADMIN'
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : u.role === 'ADMIN'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-stone-100 text-stone-700 border border-stone-200'
                          }`}
                        >
                          {u.role}
                        </span>

                        {/* Mobile Three-Dot Menu */}
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId((prev) => (prev === u.id ? null : u.id));
                            }}
                            className="p-1 rounded text-stone-400 hover:text-stone-700 cursor-pointer"
                            aria-label="Actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === u.id && (
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
                                    onInspectUser(u.id);
                                  }}
                                  className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-stone-100 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-amber-700" />
                                  <span>Inspect 360°</span>
                                </button>
                                {canBlockUser(u) && (
                                  <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onToggleStatus(u.id, u.status);
                                    }}
                                    className={`w-full px-3 py-2 text-left flex items-center gap-2 cursor-pointer ${
                                      u.status === 'ACTIVE' ? 'text-rose-700 hover:bg-rose-50' : 'text-emerald-700 hover:bg-emerald-50'
                                    }`}
                                  >
                                    {u.status === 'ACTIVE' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                                    <span>{u.status === 'ACTIVE' ? 'Block User' : 'Unblock User'}</span>
                                  </button>
                                )}
                                {isSuperadmin && u.id !== currentUser?.id && (
                                  <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onUpdateRole(u.id, u.role === 'ADMIN' ? 'USER' : 'ADMIN');
                                    }}
                                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-stone-100 cursor-pointer"
                                  >
                                    <Shield className="w-3.5 h-3.5 text-purple-700" />
                                    <span>{u.role === 'ADMIN' ? 'Demote to User' : 'Make Admin'}</span>
                                  </button>
                                )}
                                {canDeleteUser(u) && (
                                  <button
                                    type="button"
                                    disabled={actionLoading || deleteLoading}
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onInitiateDelete(u);
                                    }}
                                    className="w-full px-3 py-2 text-left flex items-center gap-2 text-rose-700 hover:bg-rose-50 border-t border-stone-100 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                    <span>Delete Account</span>
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Second Row: Status, Wallet & Activity Counts */}
                    <div className="flex items-center justify-between text-xs pt-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span>{u.status}</span>
                        </span>

                        <span className="font-semibold text-[#5B0D15] text-xs">
                          ₹{u.walletBalance.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-900 font-bold text-[10.5px] border border-blue-200">
                          🛒 {u._count?.orders ?? 0}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 font-bold text-[10.5px] border border-amber-200">
                          🕉️ {u._count?.bookings ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-stone-100 text-xs">
            <span className="text-stone-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
