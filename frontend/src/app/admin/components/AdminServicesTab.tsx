'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getAuthToken } from '../../../lib/auth';
import {
  Sparkles,
  Search,
  Plus,
  RefreshCw,
  Edit3,
  Trash2,
  Clock,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Tag,
  ShieldAlert,
  SlidersHorizontal,
  Eye,
  EyeOff,
} from 'lucide-react';
import ServiceFormModal, { ServiceFormData } from './ServiceFormModal';

interface ServiceItem {
  id: string;
  title: string;
  categoryKey: 'astrology' | 'pooja' | 'occult' | 'education';
  categoryTag?: string;
  pandit: string;
  desc: string;
  price?: string;
  priceNumber: number;
  durationMinutes: number;
  image?: string;
  badge?: string;
  isSpecial?: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminServicesTab() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal State
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Notifications (2-second auto-dismiss)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      setNotification(null);
    }, 2000);
    return () => clearTimeout(timer);
  }, [notification]);

  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
      });

      if (categoryFilter !== 'ALL') {
        params.append('categoryKey', categoryFilter);
      }
      if (statusFilter !== 'ALL') {
        params.append('isActive', statusFilter === 'ACTIVE' ? 'true' : 'false');
      }
      if (search.trim()) {
        params.append('search', search.trim());
      }

      const res = await fetch(`${backendUrl}/api/admin/services?${params.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error('You do not have administrative authorization to view services.');
        }
        throw new Error(`Failed to load services catalogue (HTTP ${res.status}).`);
      }

      const data = await res.json();
      setServices(data.services || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred while fetching services.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, categoryFilter, statusFilter, search, backendUrl]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Debounce search input resets page to 1
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleCategoryChange = (val: string) => {
    setCategoryFilter(val);
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  // Toggle Service Active Status
  const handleToggleStatus = async (service: ServiceItem) => {
    const nextStatus = !service.isActive;
    try {
      const token = getAuthToken();
      const res = await fetch(`${backendUrl}/api/admin/services/${service.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ isActive: nextStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to toggle service status.');
      }

      setNotification({
        type: 'success',
        message: `Service "${service.title}" is now ${nextStatus ? 'Available (Published)' : 'Unavailable (Unpublished)'}.`,
      });
      setTimeout(() => setNotification(null), 3000);

      // Local state optimistic update
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, isActive: nextStatus } : s)),
      );
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.message || 'Failed to update status.',
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Create or Update Service
  const handleSaveService = async (formData: ServiceFormData) => {
    const token = getAuthToken();
    const isEdit = Boolean(selectedService);
    const url = isEdit
      ? `${backendUrl}/api/admin/services/${selectedService!.id}`
      : `${backendUrl}/api/admin/services`;
    const method = isEdit ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to save service.');
    }

    setNotification({
      type: 'success',
      message: `Service "${formData.title}" ${isEdit ? 'updated' : 'created'} successfully!`,
    });
    setTimeout(() => setNotification(null), 4000);
    fetchServices();
  };

  // Delete Service with Booking Reference Guard
  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      const token = getAuthToken();
      const res = await fetch(`${backendUrl}/api/admin/services/${serviceToDelete.id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            'Could not delete service. It may be referenced by historical bookings.',
        );
      }

      setNotification({
        type: 'success',
        message: `Service "${serviceToDelete.title}" permanently deleted.`,
      });
      setTimeout(() => setNotification(null), 4000);
      setDeleteModalOpen(false);
      setServiceToDelete(null);
      fetchServices();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete service.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Compact 2-Second Toast Notification */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 animate-fadeIn pointer-events-auto"
        >
          <div
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-lg border text-xs font-semibold backdrop-blur-md ${
              notification.type === 'success'
                ? 'bg-emerald-950/95 text-emerald-100 border-emerald-500/50 shadow-emerald-950/40'
                : 'bg-rose-950/95 text-rose-100 border-rose-500/50 shadow-rose-950/40'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="max-w-[280px] truncate">{notification.message}</span>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="ml-1 p-0.5 hover:bg-white/20 rounded-full cursor-pointer text-white/70 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Control Header */}
      <div className="p-4 rounded-2xl bg-white/80 border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg font-bold text-[#5B0D15] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span>Divine Services &amp; Consultation Offerings</span>
          </h2>
          <p className="text-xs text-stone-500 font-medium">
            Manage Vedic consultations, ritual poojas, durations, pricing, and availability. Total: {totalCount}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchServices()}
            disabled={loading}
            className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Services Catalogue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#5B0D15]' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedService(null);
              setFormModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#5B0D15] to-[#7A121D] hover:from-[#6B0D16] hover:to-[#8C1421] text-amber-100 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Add New Service</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-3 rounded-2xl bg-white/70 border border-stone-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-2.5">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by title, spiritual guide, or description..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-white text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
          />
          {search && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-800 focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
          >
            <option value="ALL">All Categories</option>
            <option value="astrology">Astrology</option>
            <option value="pooja">Pooja &amp; Rituals</option>
            <option value="occult">Occult &amp; Vastu</option>
            <option value="education">Vedic Education</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-800 focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Available (Published)</option>
            <option value="INACTIVE">Unavailable (Unpublished)</option>
          </select>
        </div>
      </div>

      {/* Services List / Table */}
      {loading ? (
        <div className="p-12 text-center flex flex-col items-center justify-center space-y-3 bg-white/70 rounded-3xl border border-stone-200/80">
          <RefreshCw className="w-6 h-6 animate-spin text-[#5B0D15]" />
          <p className="text-xs text-stone-500 font-medium">Loading divine services catalogue...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-rose-50 rounded-3xl border border-rose-200 text-rose-800 space-y-2">
          <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
          <p className="text-sm font-semibold">{error}</p>
          <button
            type="button"
            onClick={() => fetchServices()}
            className="mt-2 px-4 py-1.5 bg-rose-700 text-white rounded-lg text-xs font-bold hover:bg-rose-800 cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      ) : services.length === 0 ? (
        <div className="p-12 text-center bg-white/70 rounded-3xl border border-stone-200/80 space-y-3">
          <Sparkles className="w-8 h-8 text-stone-400 mx-auto" />
          <h3 className="font-serif font-bold text-stone-800">No Services Found</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            {search || categoryFilter !== 'ALL' || statusFilter !== 'ALL'
              ? 'No services match your active search filters. Try clearing filters or searching for something else.'
              : 'No services are currently configured in the database catalogue.'}
          </p>
          {(search || categoryFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setCategoryFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="px-3.5 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {services.map((item) => {
            const isUnavailable = !item.isActive;
            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden ${
                  item.isActive
                    ? 'bg-white/95 border-stone-200/90 hover:border-amber-400/60 hover:shadow-xs'
                    : 'bg-stone-100/90 border-stone-300/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className={`min-w-0 flex-1 space-y-2 sm:space-y-2.5 transition-all duration-200 ${isUnavailable ? 'filter blur-[1.5px] opacity-60 select-none' : ''}`}>
                    {/* 1. Top row — status and identification */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            item.isActive
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border-rose-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                          <span>{item.isActive ? 'Available' : 'Unavailable'}</span>
                        </span>

                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200 uppercase tracking-wide">
                          {item.categoryTag || item.categoryKey}
                        </span>

                        {item.badge && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 text-purple-900 border border-purple-200">
                            ★ {item.badge}
                          </span>
                        )}
                      </div>

                      <span className="font-mono text-[11px] text-stone-400 select-all shrink-0">
                        ID: {item.id}
                      </span>
                    </div>

                    {/* 2. Service title */}
                    <h3 className="text-[17px] sm:text-[18px] font-semibold text-stone-900 leading-snug tracking-tight break-words">
                      {item.title}
                    </h3>

                    {/* 3. Description */}
                    <p className="text-[13px] sm:text-[14px] text-stone-600 line-clamp-2 leading-relaxed break-words">
                      {item.desc}
                    </p>

                    {/* 4. Service information */}
                    <div className="flex items-center flex-wrap gap-x-6 gap-y-1.5 pt-0.5 text-[13px] text-stone-600">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-amber-700/80 shrink-0" />
                        <span className="text-stone-500 font-normal">Astrologer:</span>
                        <span className="font-medium text-stone-800">{item.pandit}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-700/80 shrink-0" />
                        <span className="text-stone-500 font-normal">Duration:</span>
                        <span className="font-medium text-stone-800">{item.durationMinutes} mins</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <IndianRupee className="w-3.5 h-3.5 text-[#5B0D15] shrink-0" />
                        <span className="text-stone-500 font-normal">Price:</span>
                        <span className="font-semibold text-[#5B0D15]">
                          {item.price || (item.priceNumber === 0 ? '100% Free' : `₹${item.priceNumber.toLocaleString('en-IN')}`)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 5. Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center pt-2 sm:pt-0 z-20 relative">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                        item.isActive
                          ? 'border-emerald-300/80 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 shadow-2xs'
                          : 'border-stone-300 bg-stone-100 hover:bg-stone-200 text-stone-700 shadow-2xs'
                      }`}
                      title={item.isActive ? 'Currently Available. Click to unpublish.' : 'Currently Unavailable. Click to publish.'}
                    >
                      {item.isActive ? (
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

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedService(item);
                      setFormModalOpen(true);
                    }}
                    className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors cursor-pointer"
                    title="Edit Service Details"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setServiceToDelete(item);
                      setDeleteError(null);
                      setDeleteModalOpen(true);
                    }}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                    title="Delete Service (Safely guarded)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-3 rounded-2xl bg-white/80 border border-stone-200/80 shadow-xs flex items-center justify-between text-xs">
          <span className="text-stone-500 font-medium">
            Page <strong className="text-stone-800">{page}</strong> of <strong className="text-stone-800">{totalPages}</strong> ({totalCount} total services)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Service Create / Edit Form Modal */}
      <ServiceFormModal
        isOpen={formModalOpen}
        service={selectedService}
        onClose={() => {
          setFormModalOpen(false);
          setSelectedService(null);
        }}
        onSave={handleSaveService}
      />

      {/* Delete Confirmation Modal with Booking Guard Warning */}
      {deleteModalOpen && serviceToDelete && (
        <div
          data-lenis-prevent="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
        >
          <div className="w-full max-w-md rounded-2xl bg-white border border-rose-200 shadow-2xl p-5 space-y-4 text-[#3B1E22]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Delete Divine Service?
                </h3>
                <p className="text-xs text-stone-500">
                  ID: <span className="font-mono text-stone-700">{serviceToDelete.id}</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-stone-900">&quot;{serviceToDelete.title}&quot;</strong>?
            </p>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
              <strong>Safety Guard:</strong> If historical or active consultations reference this service in the database, deletion will be rejected to protect customer booking history. In that case, please <strong>Deactivate</strong> the service instead.
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setDeleteModalOpen(false);
                  setServiceToDelete(null);
                  setDeleteError(null);
                }}
                className="px-4 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying &amp; Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification at Top-Right */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-6 right-6 z-[100] animate-fadeIn pointer-events-auto"
        >
          <div
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-xl border text-xs font-semibold backdrop-blur-md ${
              notification.type === 'success'
                ? 'bg-emerald-950/95 text-emerald-100 border-emerald-500/50 shadow-emerald-950/40'
                : 'bg-rose-950/95 text-rose-100 border-rose-500/50 shadow-rose-950/40'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="max-w-[280px] sm:max-w-md truncate">{notification.message}</span>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="ml-1 p-0.5 hover:bg-white/20 rounded-full cursor-pointer text-white/70 hover:text-white shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
