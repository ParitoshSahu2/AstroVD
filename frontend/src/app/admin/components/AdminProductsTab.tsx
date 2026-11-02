'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getAuthToken } from '../../../lib/auth';
import {
  Package,
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
  Layers,
  Sparkles,
  Tag,
  ShieldAlert,
  SlidersHorizontal,
  Archive,
} from 'lucide-react';
import ProductFormModal, { ProductFormData } from './ProductFormModal';

interface ProductItem {
  id: string;
  slug: string;
  name: string;
  nameHi?: string;
  tag?: string;
  tagHi?: string;
  desc: string;
  descHi?: string;
  image: string;
  category: string;
  categoryLabel?: string;
  price: number;
  priceFormatted?: string;
  originalPrice?: number;
  originalPriceFormatted?: string;
  discountPercent?: number;
  planet?: string;
  chakra?: string;
  mantra?: string;
  beadSize?: string;
  inStock: boolean;
  stock: number;
  isFeatured?: boolean;
}

export default function AdminProductsTab() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal State
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Notifications
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
      });

      if (categoryFilter !== 'ALL') {
        params.append('category', categoryFilter);
      }
      if (stockFilter !== 'ALL') {
        params.append('inStock', stockFilter === 'IN_STOCK' ? 'true' : 'false');
      }
      if (search.trim()) {
        params.append('search', search.trim());
      }

      const res = await fetch(`${backendUrl}/api/admin/products?${params.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error('You do not have administrative authorization to view products.');
        }
        throw new Error(`Failed to load products catalogue (HTTP ${res.status}).`);
      }

      const data = await res.json();
      setProducts(data.products || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred while fetching products.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, categoryFilter, stockFilter, search, backendUrl]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Debounce search input resets page to 1
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleCategoryChange = (val: string) => {
    setCategoryFilter(val);
    setPage(1);
  };

  const handleStockFilterChange = (val: string) => {
    setStockFilter(val);
    setPage(1);
  };

  // Toggle Product In-Stock Availability
  const handleToggleStock = async (prod: ProductItem) => {
    const nextStatus = !prod.inStock;
    try {
      const token = getAuthToken();
      const res = await fetch(`${backendUrl}/api/admin/products/${prod.id}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ inStock: nextStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to toggle product stock status.');
      }

      setNotification({
        type: 'success',
        message: `Product "${prod.name}" marked ${nextStatus ? 'IN STOCK' : 'OUT OF STOCK'}.`,
      });
      setTimeout(() => setNotification(null), 4000);

      // Optimistic update
      setProducts((prev) =>
        prev.map((p) => (p.id === prod.id ? { ...p, inStock: nextStatus } : p)),
      );
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.message || 'Failed to update stock status.',
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Create or Update Product
  const handleSaveProduct = async (formData: ProductFormData) => {
    const token = getAuthToken();
    const isEdit = Boolean(selectedProduct);
    const url = isEdit
      ? `${backendUrl}/api/admin/products/${selectedProduct!.id}`
      : `${backendUrl}/api/admin/products`;
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
      throw new Error(errorData.message || 'Failed to save product details.');
    }

    setNotification({
      type: 'success',
      message: `Product "${formData.name}" ${isEdit ? 'updated' : 'created'} successfully!`,
    });
    setTimeout(() => setNotification(null), 4000);
    fetchProducts();
  };

  // Delete Product with Historical Order Guard
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      const token = getAuthToken();
      const res = await fetch(`${backendUrl}/api/admin/products/${productToDelete.id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            'Could not delete product. It may be referenced by historical customer orders.',
        );
      }

      setNotification({
        type: 'success',
        message: `Product "${productToDelete.name}" permanently deleted.`,
      });
      setTimeout(() => setNotification(null), 4000);
      setDeleteModalOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete product.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs font-medium animate-fadeIn ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="p-1 hover:bg-black/5 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Control Header */}
      <div className="p-4 rounded-2xl bg-white/80 border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg font-bold text-[#5B0D15] flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-600" />
            <span>Sacred Store Products &amp; Inventory</span>
          </h2>
          <p className="text-xs text-stone-500 font-medium">
            Manage energized gemstone bracelets, pricing, stock levels, and spiritual specifications. Total: {totalCount}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchProducts()}
            disabled={loading}
            className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Products Catalogue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#5B0D15]' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedProduct(null);
              setFormModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-[#5B0D15] hover:bg-[#4A0A10] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-3 rounded-2xl bg-white/70 border border-stone-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by title, specs, or product ID..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-white text-xs placeholder:text-stone-400 focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
          />
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-800 focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
          >
            <option value="ALL">All Categories</option>
            <option value="wealth">Wealth &amp; Prosperity</option>
            <option value="protection">Protection &amp; Nazar</option>
            <option value="love">Love &amp; Harmony</option>
            <option value="healing">Healing &amp; Peace</option>
          </select>
        </div>

        <div>
          <select
            value={stockFilter}
            onChange={(e) => handleStockFilterChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-800 focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
          >
            <option value="ALL">All Stock Statuses</option>
            <option value="IN_STOCK">In Stock (Available)</option>
            <option value="OUT_OF_STOCK">Out of Stock (Depleted)</option>
          </select>
        </div>
      </div>

      {/* Products List Cards */}
      {loading ? (
        <div className="p-12 text-center flex flex-col items-center justify-center space-y-3 bg-white/70 rounded-3xl border border-stone-200/80">
          <RefreshCw className="w-6 h-6 animate-spin text-[#5B0D15]" />
          <p className="text-xs text-stone-500 font-medium">Loading sacred store products &amp; inventory...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-rose-50 rounded-3xl border border-rose-200 text-rose-800 space-y-2">
          <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
          <p className="text-sm font-semibold">{error}</p>
          <button
            type="button"
            onClick={() => fetchProducts()}
            className="mt-2 px-4 py-1.5 bg-rose-700 text-white rounded-lg text-xs font-bold hover:bg-rose-800 cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 text-center bg-white/70 rounded-3xl border border-stone-200/80 space-y-3">
          <Package className="w-8 h-8 text-stone-400 mx-auto" />
          <h3 className="font-serif font-bold text-stone-800">No Products Found</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            {search || categoryFilter !== 'ALL' || stockFilter !== 'ALL'
              ? 'No products match your active search filters. Try clearing filters or searching for something else.'
              : 'No products are currently configured in the database catalogue.'}
          </p>
          {(search || categoryFilter !== 'ALL' || stockFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setCategoryFilter('ALL');
                setStockFilter('ALL');
              }}
              className="px-3.5 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {products.map((item) => (
            <div
              key={item.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                item.inStock
                  ? 'bg-white/95 border-stone-200/90 hover:border-amber-400/60 hover:shadow-xs'
                  : 'bg-stone-50/90 border-stone-200/80 opacity-80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2 sm:space-y-2.5">
                  {/* 1. Top row — status, category, featured badge, and technical ID */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          item.inStock
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.inStock ? 'bg-emerald-600' : 'bg-rose-500'
                          }`}
                        />
                        <span>{item.inStock ? 'In Stock' : 'Out of Stock'}</span>
                      </span>

                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200 uppercase tracking-wide">
                        {item.categoryLabel || item.category}
                      </span>

                      {item.isFeatured && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 text-purple-900 border border-purple-200">
                          ★ Featured
                        </span>
                      )}
                    </div>

                    <span className="font-mono text-[11px] text-stone-400 select-all shrink-0">
                      ID: {item.id}
                    </span>
                  </div>

                  {/* 2. Product title */}
                  <h3 className="text-[17px] sm:text-[18px] font-semibold text-stone-900 leading-snug tracking-tight break-words">
                    {item.name}
                  </h3>

                  {/* 3. Description preview */}
                  <p className="text-[13px] sm:text-[14px] text-stone-600 line-clamp-2 leading-relaxed break-words">
                    {item.desc}
                  </p>

                  {/* 4. Product information row: stock, specs/planet, price & discount */}
                  <div className="flex items-center flex-wrap gap-x-6 gap-y-1.5 pt-0.5 text-[13px] text-stone-600">
                    <div className="flex items-center gap-1.5">
                      <Archive className="w-3.5 h-3.5 text-amber-700/80 shrink-0" />
                      <span className="text-stone-500 font-normal">Inventory:</span>
                      <span className="font-medium text-stone-800">{item.stock} units</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-700/80 shrink-0" />
                      <span className="text-stone-500 font-normal">Specs:</span>
                      <span className="font-medium text-stone-800">
                        {item.beadSize || item.planet || 'Energized Gemstone'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <IndianRupee className="w-3.5 h-3.5 text-[#5B0D15] shrink-0" />
                      <span className="text-stone-500 font-normal">Price:</span>
                      <span className="font-semibold text-[#5B0D15]">
                        {item.priceFormatted || `₹${item.price.toLocaleString('en-IN')}`}
                      </span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="text-stone-400 line-through text-[11px]">
                          {item.originalPriceFormatted || `₹${item.originalPrice.toLocaleString('en-IN')}`}
                        </span>
                      )}
                      {item.discountPercent && item.discountPercent > 0 && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {item.discountPercent}% OFF
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 5. Right Action Controls */}
                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center pt-2 sm:pt-0">
                  {/* Stock Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleStock(item)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                      item.inStock
                        ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300/80'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300/80'
                    }`}
                    title={item.inStock ? 'Mark out of stock' : 'Mark in stock'}
                  >
                    <span>{item.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}</span>
                  </button>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProduct(item);
                      setFormModalOpen(true);
                    }}
                    className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors cursor-pointer"
                    title="Edit Product Details"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setProductToDelete(item);
                      setDeleteError(null);
                      setDeleteModalOpen(true);
                    }}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                    title="Delete Product (Order-guarded)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-3 rounded-2xl bg-white/80 border border-stone-200/80 shadow-xs flex items-center justify-between text-xs">
          <span className="text-stone-500 font-medium">
            Page <strong className="text-stone-800">{page}</strong> of{' '}
            <strong className="text-stone-800">{totalPages}</strong> ({totalCount} total products)
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

      {/* Add / Edit Product Modal */}
      <ProductFormModal
        isOpen={formModalOpen}
        product={selectedProduct}
        onClose={() => {
          setFormModalOpen(false);
          setSelectedProduct(null);
        }}
        onSave={handleSaveProduct}
      />

      {/* Delete Confirmation Modal with Order Reference Guard */}
      {deleteModalOpen && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Delete &ldquo;{productToDelete.name}&rdquo;?
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                This will permanently remove the product from the sacred store catalogue. If this product is referenced by historical customer orders, deletion will be blocked to preserve customer receipts.
              </p>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setProductToDelete(null);
                  setDeleteError(null);
                }}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
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
    </div>
  );
}
