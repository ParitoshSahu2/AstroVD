'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { getAuthToken } from '../../../lib/auth';
import { useScrollLock } from '../../../lib/scrollLock';
import {
  Image as ImageIcon,
  Search,
  Plus,
  RefreshCw,
  Edit3,
  Trash2,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Eye,
  EyeOff,
  Filter,
  Maximize2,
} from 'lucide-react';
import GalleryManageModal, { GalleryItemData } from '../../gallery/components/GalleryManageModal';
import { INITIAL_GALLERY_ITEMS, GalleryItem } from '../../gallery/data/gallery-items';

const CATEGORIES: { key: string; labelEn: string; labelHi: string }[] = [
  { key: 'ALL', labelEn: 'All Photos', labelHi: 'सभी तस्वीरें' },
  { key: 'pooja', labelEn: 'Sacred Poojas & Havan', labelHi: 'वैदिक पूजा व महाहवन' },
  { key: 'consultation', labelEn: 'Vedic Consultations', labelHi: 'वैदिक ज्योतिष परामर्श' },
  { key: 'awards', labelEn: 'Honors & Certifications', labelHi: 'राष्ट्रीय सम्मान एवं पुरस्कार' },
  { key: 'kashi', labelEn: 'Temple Anushthan & Kashi', labelHi: 'काशी अनुष्ठान व देवालय' },
  { key: 'yantra', labelEn: 'Yantras & Sacred Items', labelHi: 'सिद्ध यंत्र एवं सामग्री' },
];

export default function AdminGalleryTab() {
  const [items, setItems] = useState<GalleryItem[]>(INITIAL_GALLERY_ITEMS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);

  // Modal State
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GalleryItemData | null>(null);

  // Lightbox Preview Modal State
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useScrollLock(Boolean(manageModalOpen || deleteModalOpen || previewItem));

  // Action Loading
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

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

  const fetchGalleryItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const res = await fetch(`${backendUrl}/api/content/gallery?includeUnpublished=true`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to load gallery items (HTTP ${res.status}).`);
      }

      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setItems(data);
      } else {
        setItems(INITIAL_GALLERY_ITEMS);
      }
    } catch (err: any) {
      console.warn('Using initial gallery items fallback:', err);
      setItems(INITIAL_GALLERY_ITEMS);
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchGalleryItems();
  }, [fetchGalleryItems]);

  const handleCreateNew = () => {
    setSelectedItem(null);
    setManageModalOpen(true);
  };

  const handleEdit = (item: GalleryItem) => {
    setSelectedItem({
      id: item.id,
      title: item.title,
      titleHi: item.titleHi,
      category: item.category,
      categoryLabel: item.categoryLabel,
      categoryLabelHi: item.categoryLabelHi,
      image: item.image,
      location: item.location,
      locationHi: item.locationHi,
      date: item.date,
      dateHi: item.dateHi,
      description: item.description,
      descriptionHi: item.descriptionHi,
      isPublished: item.isPublished !== false,
    });
    setManageModalOpen(true);
  };

  const handleSavedItem = (savedItem: GalleryItemData) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === savedItem.id);
      const converted: GalleryItem = {
        id: savedItem.id,
        title: savedItem.title,
        titleHi: savedItem.titleHi,
        category: savedItem.category,
        categoryLabel: savedItem.categoryLabel || '',
        categoryLabelHi: savedItem.categoryLabelHi || '',
        image: savedItem.image,
        location: savedItem.location,
        locationHi: savedItem.locationHi,
        date: savedItem.date,
        dateHi: savedItem.dateHi,
        description: savedItem.description,
        descriptionHi: savedItem.descriptionHi,
        isPublished: savedItem.isPublished !== false,
      };

      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...prev[idx], ...converted };
        return next;
      }
      return [converted, ...prev];
    });

    setManageModalOpen(false);
    setNotification({
      type: 'success',
      message: `Gallery item "${savedItem.title}" saved successfully.`,
    });
    setTimeout(() => setNotification(null), 4000);
  };

  const confirmDelete = (item: GalleryItem) => {
    setItemToDelete(item);
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const token = getAuthToken();
      const res = await fetch(`${backendUrl}/api/content/gallery/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to delete gallery item from server.');
      }

      setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
      setDeleteModalOpen(false);
      setItemToDelete(null);
      setNotification({
        type: 'success',
        message: `Gallery item removed successfully.`,
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      // In case server fails (e.g. mock fallback item), remove locally as well with notice
      setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
      setDeleteModalOpen(false);
      setItemToDelete(null);
      setNotification({
        type: 'success',
        message: `Photo removed from local list.`,
      });
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setDeleting(false);
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    if (categoryFilter !== 'ALL' && item.category !== categoryFilter) {
      return false;
    }
    if (statusFilter === 'PUBLISHED' && item.isPublished === false) {
      return false;
    }
    if (statusFilter === 'DRAFT' && item.isPublished !== false) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchEn =
        item.title?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q);
      const matchHi =
        item.titleHi?.toLowerCase().includes(q) ||
        item.locationHi?.toLowerCase().includes(q) ||
        item.descriptionHi?.toLowerCase().includes(q);
      return matchEn || matchHi;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const currentPageItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

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

      {/* Control Header - Simple, Clean & Easy to Understand */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/90 border border-stone-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center flex-wrap gap-2.5">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#5B0D15] flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-amber-600" />
              <span>Gallery &amp; Media Management</span>
            </h2>
            <span className="px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs shadow-2xs">
              Total: {items.length}
            </span>
          </div>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Curate consecrated temple ceremony photos, divine darshan &amp; Vedic anushthan moments.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          <button
            type="button"
            onClick={fetchGalleryItems}
            disabled={loading}
            className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
            title="Refresh Gallery List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#5B0D15]' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-[#5B0D15] hover:bg-[#78121d] text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Sacred Photo</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by title, location, description in English or Hindi..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm bg-stone-50/50"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Status:
            </span>
            {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === st
                    ? 'bg-[#550E17] text-amber-200 shadow-sm'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                }`}
              >
                {st === 'ALL' ? 'All' : st === 'PUBLISHED' ? 'Active Only' : 'Hidden Only'}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-stone-100 scrollbar-none">
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider shrink-0">
            Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => {
                setCategoryFilter(cat.key);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                categoryFilter === cat.key
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200'
              }`}
            >
              {cat.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Items Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
          <p className="text-stone-600 font-medium">Loading sacred gallery media...</p>
        </div>
      ) : currentPageItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <ImageIcon className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-serif font-bold text-stone-800">No media items found</h3>
            <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">
              {search || categoryFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'Try adjusting your search criteria or category filter.'
                : 'Get started by uploading your first consecrated ceremony photo.'}
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#550E17] hover:bg-[#430f14] text-white text-sm font-semibold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add First Photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {currentPageItems.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Media Thumbnail Container */}
              <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback to placeholder if broken
                    (e.target as HTMLImageElement).src = '/gallery/IMG_2542.jpg';
                  }}
                />

                {/* Status Badge (Only shown if Hidden) */}
                {item.isPublished === false && (
                  <div className="absolute top-2.5 left-2.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold backdrop-blur-md shadow-sm bg-stone-900/80 text-stone-200">
                      <EyeOff className="w-3 h-3" /> Hidden
                    </span>
                  </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-2.5 right-2.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/60 text-amber-200 backdrop-blur-md border border-white/10 uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>

                {/* Hover overlay with quick preview */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPreviewItem(item)}
                    className="p-2.5 rounded-full bg-white/90 hover:bg-white text-stone-900 shadow-lg transform hover:scale-110 transition-all"
                    title="Inspect Photo"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-lg transform hover:scale-110 transition-all font-semibold"
                    title="Edit Details"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Item Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h4 className="font-serif font-bold text-stone-900 text-sm line-clamp-2 group-hover:text-amber-800 transition-colors">
                    {item.title}
                  </h4>
                  {item.titleHi && (
                    <p className="text-xs text-stone-600 font-serif line-clamp-1">
                      {item.titleHi}
                    </p>
                  )}
                </div>

                <div className="space-y-1 pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                    <span className="truncate">{item.location || 'Varanasi Sanctum'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Calendar className="w-3 h-3 text-amber-600 shrink-0" />
                    <span className="truncate">{item.date || 'Auspicious Muhurta'}</span>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => confirmDelete(item)}
                    className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-all"
                    title="Delete Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-xs text-stone-500">
            Showing <span className="font-semibold text-stone-800">{(page - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-stone-800">
              {Math.min(page * pageSize, filteredItems.length)}
            </span>{' '}
            of <span className="font-semibold text-stone-800">{filteredItems.length}</span> photos
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none text-stone-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium text-stone-600 px-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none text-stone-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Full Lightbox Preview Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-stone-900 rounded-2xl overflow-hidden shadow-2xl border border-stone-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative aspect-[16/10] bg-black">
              <img
                src={previewItem.image}
                alt={previewItem.title}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-6 bg-stone-900 text-white space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400 text-stone-950 uppercase">
                  {previewItem.category}
                </span>
                <span className="text-xs text-stone-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" /> {previewItem.location}
                </span>
              </div>
              <h3 className="text-lg font-serif font-bold text-amber-100">{previewItem.title}</h3>
              {previewItem.titleHi && (
                <p className="text-sm text-stone-300 font-serif">{previewItem.titleHi}</p>
              )}
              {previewItem.description && (
                <p className="text-xs text-stone-400 pt-2 border-t border-stone-800 leading-relaxed">
                  {previewItem.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-stone-900">Delete Photo?</h3>
              <p className="text-xs text-stone-600">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-stone-900">"{itemToDelete.title}"</span>?
                This photo will be permanently removed from the sacred gallery.
              </p>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setItemToDelete(null);
                }}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold text-sm hover:bg-stone-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all shadow-md shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Manage Modal (Add/Edit) */}
      <GalleryManageModal
        isOpen={manageModalOpen}
        onClose={() => {
          setManageModalOpen(false);
          setSelectedItem(null);
        }}
        itemToEdit={selectedItem}
        onSaved={handleSavedItem}
      />
    </div>
  );
}
