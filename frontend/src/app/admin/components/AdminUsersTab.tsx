import React from 'react';
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

      {/* Users Directory Table */}
      <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-stone-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#3B1E22]">
              User Accounts Directory
            </h3>
            <p className="text-xs text-stone-500">
              Click &quot;Inspect User 360°&quot; to see what they bought, services clicked, and platform activities.
            </p>
          </div>
          <span className="text-xs font-semibold text-stone-500">
            Showing {users.length} of {totalCount} users
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-stone-500 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#5B0D15]" />
            <p>Loading user records...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-500">
            No users found matching your filters.
          </div>
        ) : (
          <div className="w-full min-w-0 overflow-x-auto">
            <table className="w-full table-fixed text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3 w-[28%] font-medium">User</th>
                  <th className="py-3 px-3 w-[10%] font-medium">Role</th>
                  <th className="py-3 px-3 w-[12%] font-medium">Status</th>
                  <th className="py-3 px-3 w-[12%] font-medium">Wallet</th>
                  <th className="py-3 px-3 text-center w-[8%] font-medium">Orders</th>
                  <th className="py-3 px-3 text-center w-[8%] font-medium">Bookings</th>
                  <th className="py-3 px-3 text-right w-[22%] font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#5B0D15] to-[#7B121C] text-amber-200 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-300/50">
                          {getInitials(u.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-[#3B1E22] truncate" title={u.name}>{u.name}</div>
                          <div className="text-[11px] text-stone-500 truncate" title={u.email}>{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
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

                    <td className="py-3.5 px-3">
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

                    <td className="py-3.5 px-3 font-semibold text-[#5B0D15] truncate" title={`₹${u.walletBalance.toFixed(2)}`}>
                      ₹{u.walletBalance.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-block px-2 py-1 rounded-lg bg-blue-50 text-blue-900 font-bold text-[11px] border border-blue-200 truncate max-w-full" title={`Orders: ${u._count?.orders ?? 0}`}>
                        🛒 {u._count?.orders ?? 0}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-block px-2 py-1 rounded-lg bg-amber-50 text-amber-900 font-bold text-[11px] border border-amber-200 truncate max-w-full" title={`Bookings: ${u._count?.bookings ?? 0}`}>
                        🕉️ {u._count?.bookings ?? 0}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-nowrap">
                        {/* INSPECT 360 BUTTON */}
                        <button
                          onClick={() => onInspectUser(u.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-[#5B0D15] font-bold text-xs border border-amber-300/80 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                          title="Inspect User 360: Purchases, Clicks, Platform Activity"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>

                        {/* BLOCK / UNBLOCK TOGGLE */}
                        {canBlockUser(u) && (
                          <button
                            disabled={actionLoading}
                            onClick={() => onToggleStatus(u.id, u.status)}
                            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm ${
                              u.status === 'ACTIVE'
                                ? 'border-rose-200 bg-rose-50/80 hover:bg-rose-100 text-rose-700'
                                : 'border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-700'
                            }`}
                            title={u.status === 'ACTIVE' ? 'Block / Suspend User' : 'Unblock / Reactivate User'}
                          >
                            {u.status === 'ACTIVE' ? (
                              <>
                                <UserX className="w-3.5 h-3.5" />
                                <span>Block</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Unblock</span>
                              </>
                            )}
                          </button>
                        )}

                        {/* SUPERADMIN ROLE MANAGEMENT */}
                        {isSuperadmin && u.id !== currentUser?.id && (
                          <>
                            {u.role === 'ADMIN' ? (
                              <button
                                disabled={actionLoading}
                                onClick={() => onUpdateRole(u.id, 'USER')}
                                className="px-2.5 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                                title="Demote Admin to standard User role"
                              >
                                <UserMinus className="w-3.5 h-3.5 text-amber-700" />
                                <span>Remove Admin</span>
                              </button>
                            ) : u.role === 'USER' ? (
                              <button
                                disabled={actionLoading}
                                onClick={() => onUpdateRole(u.id, 'ADMIN')}
                                className="px-2.5 py-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                                title="Promote User to Admin"
                              >
                                <Shield className="w-3.5 h-3.5 text-purple-700" />
                                <span>Make Admin</span>
                              </button>
                            ) : null}
                          </>
                        )}

                        {/* DELETE USER */}
                        {canDeleteUser(u) && (
                          <button
                            disabled={actionLoading || deleteLoading}
                            onClick={() => onInitiateDelete(u)}
                            className="p-1.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-all flex items-center justify-center cursor-pointer shadow-sm"
                            title={u.role === 'ADMIN' ? 'Delete Admin Account' : 'Permanently Delete User'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
