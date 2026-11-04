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
  Truck,
  Eye,
  User,
  Phone,
  Mail,
  MapPin,
  Copy,
  Check,
  CreditCard,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import ProductFormModal, { ProductFormData } from './ProductFormModal';
import { resolveProductImage } from '../../dashboard/utils';
import { getPaymentStatusDetail, getFulfillmentStatusDetail } from './AdminOrdersTab';

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

export interface AdminProductsTabProps {
  ordersList?: any[];
  ordersLoading?: boolean;
  orderTotalCount?: number;
  fetchOrdersList?: (p: number) => void;
  onSelectOrder?: (order: any) => void;
}

export default function AdminProductsTab({
  ordersList = [],
  ordersLoading = false,
  orderTotalCount = 0,
  fetchOrdersList,
  onSelectOrder,
}: AdminProductsTabProps = {}) {
  // Navigation Sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'catalogue' | 'fulfillment'>('catalogue');

  // Catalogue State
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search for Catalogue
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');

  // Pagination for Catalogue
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

  // Notifications (2-second auto-dismiss)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      setNotification(null);
    }, 2000);
    return () => clearTimeout(timer);
  }, [notification]);

  // Fulfilment & Lifecycle State
  const [localOrders, setLocalOrders] = useState<any[]>([]);
  const [localOrdersLoading, setLocalOrdersLoading] = useState(false);
  const [fulfillmentSearch, setFulfillmentSearch] = useState('');
  const [fulfillmentStatusFilter, setFulfillmentStatusFilter] = useState('ALL');
  const [inspectedOrder, setInspectedOrder] = useState<any | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');

  const handleCopyText = (field: string, text: string) => {
    if (!text) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

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
      setError(err.message || 'Failed to connect to backend server.');
    } finally {
      setLoading(false);
    }
  }, [backendUrl, categoryFilter, page, pageSize, search, stockFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Fetch fulfillment orders if not supplied or on refresh
  const fetchFulfillmentOrders = useCallback(async () => {
    if (fetchOrdersList) {
      fetchOrdersList(1);
    }
    const token = getAuthToken();
    if (!token) return;
    setLocalOrdersLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/admin/orders?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLocalOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching fulfillment orders:', err);
    } finally {
      setLocalOrdersLoading(false);
    }
  }, [backendUrl, fetchOrdersList]);

  useEffect(() => {
    if (activeSubTab === 'fulfillment' && ordersList.length === 0) {
      fetchFulfillmentOrders();
    }
  }, [activeSubTab, ordersList.length, fetchFulfillmentOrders]);

  const effectiveOrders = ordersList.length > 0 ? ordersList : localOrders;
  const isFulfillmentLoading = ordersLoading || localOrdersLoading;

  // Auto-select first order for inspection if none selected yet
  useEffect(() => {
    if (activeSubTab === 'fulfillment' && !inspectedOrder && effectiveOrders.length > 0) {
      setInspectedOrder(effectiveOrders[0]);
    }
  }, [activeSubTab, inspectedOrder, effectiveOrders]);

  // Keep inspectedOrder updated if the orders list updates
  useEffect(() => {
    if (inspectedOrder && effectiveOrders.length > 0) {
      const found = effectiveOrders.find((o: any) => o.id === inspectedOrder.id);
      if (found) {
        setInspectedOrder(found);
      }
    }
  }, [effectiveOrders, inspectedOrder]);

  const filteredFulfillmentOrders = effectiveOrders.filter((ord: any) => {
    if (fulfillmentStatusFilter !== 'ALL') {
      const st = (ord.status || '').toUpperCase();
      if (fulfillmentStatusFilter === 'ORDER_PLACED' && !['ORDER_PLACED', 'PENDING', 'PENDING_PAYMENT'].includes(st)) return false;
      if (fulfillmentStatusFilter === 'CONSECRATING' && !['CONSECRATING', 'CONFIRMED', 'PROCESSING'].includes(st)) return false;
      if (fulfillmentStatusFilter === 'DISPATCHED' && !['DISPATCHED', 'SHIPPED', 'IN_TRANSIT'].includes(st)) return false;
      if (fulfillmentStatusFilter === 'DELIVERED' && st !== 'DELIVERED') return false;
      if (fulfillmentStatusFilter === 'CANCELLED' && st !== 'CANCELLED') return false;
    }
    if (fulfillmentSearch.trim()) {
      const q = fulfillmentSearch.toLowerCase();
      const id = (ord.id || ord._id || '').toLowerCase();
      const name = (ord.customer?.name || ord.user?.name || ord.shippingAddress?.fullName || '').toLowerCase();
      const phone = (ord.customer?.phone || ord.user?.phone || ord.shippingAddress?.phone || '').toLowerCase();
      const itemsStr = (ord.items || []).map((i: any) => i.productName || i.product?.name || '').join(' ').toLowerCase();
      return id.includes(q) || name.includes(q) || phone.includes(q) || itemsStr.includes(q);
    }
    return true;
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setPage(1);
  };

  const handleStockFilterChange = (value: string) => {
    setStockFilter(value);
    setPage(1);
  };

  const handleToggleStock = async (product: ProductItem) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${backendUrl}/api/admin/products/${product.id}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ inStock: !product.inStock }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to toggle product stock status.');
      }

      setNotification({
        type: 'success',
        message: `Product "${product.name}" marked as ${!product.inStock ? 'In Stock' : 'Out of Stock'}.`,
      });
      fetchProducts();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to update stock.' });
    }
  };

  const handleSaveProduct = async (formData: ProductFormData, productId?: string) => {
    const token = getAuthToken();
    const isEdit = Boolean(productId);
    const url = isEdit ? `${backendUrl}/api/admin/products/${productId}` : `${backendUrl}/api/admin/products`;
    const method = isEdit ? 'PUT' : 'POST';

    const payload = {
      ...formData,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      stock: Number(formData.stock),
    };

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || `Failed to ${isEdit ? 'update' : 'create'} product.`);
    }

    setNotification({
      type: 'success',
      message: `Product "${formData.name}" successfully ${isEdit ? 'updated' : 'added to catalogue'}!`,
    });
    fetchProducts();
  };

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
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete product.');
      }

      setNotification({
        type: 'success',
        message: `Product "${productToDelete.name}" permanently deleted from catalogue.`,
      });
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

      {/* Sub-navigation Switcher Pills */}
      <div className="flex items-center gap-2 p-1.5 bg-stone-100/90 rounded-2xl border border-stone-200/80 w-fit">
        <button
          type="button"
          onClick={() => setActiveSubTab('catalogue')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'catalogue'
              ? 'bg-white text-[#5B0D15] shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Package className="w-4 h-4 text-amber-600" />
          <span>Products Catalogue &amp; Inventory</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-50 text-amber-900 font-bold border border-amber-200">
            {totalCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSubTab('fulfillment');
            fetchFulfillmentOrders();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'fulfillment'
              ? 'bg-white text-[#5B0D15] shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Truck className="w-4 h-4 text-amber-600" />
          <span>Order Fulfilment &amp; Lifecycle</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-stone-100 text-stone-700 font-bold border border-stone-200">
            {orderTotalCount || effectiveOrders.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. ORDER FULFILMENT & LIFECYCLE SUB-TAB                                  */}
      {/* ========================================================================= */}
      {activeSubTab === 'fulfillment' && (
        <div className="space-y-4">
          {/* Fulfilment Header */}
          <div className="p-4 rounded-2xl bg-white/80 border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#5B0D15] flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-600" />
                <span>Order Fulfilment &amp; Lifecycle Management</span>
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                Inspect live customer orders, verify dispatch tracking, review consecrated gemstone items, and monitor lifecycle stages. Total: {effectiveOrders.length}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchFulfillmentOrders}
                disabled={isFulfillmentLoading}
                className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer disabled:opacity-50"
                title="Refresh Orders List"
              >
                <RefreshCw className={`w-4 h-4 ${isFulfillmentLoading ? 'animate-spin text-[#5B0D15]' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filters Bar for Orders */}
          <div className="p-3 rounded-2xl bg-white/70 border border-stone-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fulfillmentSearch}
                onChange={(e) => setFulfillmentSearch(e.target.value)}
                placeholder="Search orders by ID, seeker name, phone, or relic..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-white text-xs placeholder:text-stone-400 focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
              />
            </div>

            <div>
              <select
                value={fulfillmentStatusFilter}
                onChange={(e) => setFulfillmentStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-800 focus:outline-none focus:ring-1.5 focus:ring-[#5B0D15]"
              >
                <option value="ALL">All Fulfilment Stages</option>
                <option value="ORDER_PLACED">Order Placed / Pending</option>
                <option value="CONSECRATING">Consecration In Progress</option>
                <option value="DISPATCHED">Dispatched / In Transit</option>
                <option value="DELIVERED">Delivered to Seeker</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Orders & Direct Inspection Section */}
          {isFulfillmentLoading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-3 bg-white/70 rounded-3xl border border-stone-200/80">
              <RefreshCw className="w-6 h-6 animate-spin text-[#5B0D15]" />
              <p className="text-xs text-stone-500 font-medium">Loading operational store orders &amp; fulfilment data...</p>
            </div>
          ) : filteredFulfillmentOrders.length === 0 ? (
            <div className="p-12 text-center bg-white/70 rounded-3xl border border-stone-200/80 space-y-3">
              <Truck className="w-8 h-8 text-stone-400 mx-auto" />
              <h3 className="font-serif font-bold text-stone-800">No Orders Found</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                {fulfillmentSearch || fulfillmentStatusFilter !== 'ALL'
                  ? 'No orders match your active search filters. Try clearing search or status filters.'
                  : 'There are currently no active product orders to fulfill.'}
              </p>
              {(fulfillmentSearch || fulfillmentStatusFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setFulfillmentSearch('');
                    setFulfillmentStatusFilter('ALL');
                  }}
                  className="px-3.5 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Left Column: Orders List (5 cols on lg) */}
              <div className="lg:col-span-5 space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
                <div className="text-xs font-bold text-stone-500 px-1 uppercase tracking-wider flex items-center justify-between">
                  <span>Customer Orders ({filteredFulfillmentOrders.length})</span>
                  <span className="text-[11px] font-normal text-stone-400">Click to inspect</span>
                </div>

                {filteredFulfillmentOrders.map((ord: any) => {
                  const isSelected = inspectedOrder?.id === ord.id;
                  const orderRef = ord.id ? `#${ord.id.slice(-8).toUpperCase()}` : '#ORDER';
                  const custName = ord.customer?.name || ord.user?.name || ord.shippingAddress?.fullName || 'Seeker';
                  const primaryItem = ord.items?.[0];
                  const primaryItemName = primaryItem ? (primaryItem.productName || primaryItem.product?.name || 'Vedic Relic') : 'Sacred Product';
                  const additionalCount = (ord.items?.length || 0) > 1 ? ord.items.length - 1 : 0;
                  const fulfillmentInfo = getFulfillmentStatusDetail(ord.status, ord.deliveryStatus);
                  const paymentInfo = getPaymentStatusDetail(ord.paymentStatus, ord.status, ord.isDemoOrder);
                  const itemImg = resolveProductImage(primaryItem);

                  return (
                    <div
                      key={ord.id}
                      onClick={() => setInspectedOrder(ord)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-amber-50/70 border-amber-400 shadow-sm ring-1 ring-amber-400/60'
                          : 'bg-white/90 border-stone-200/90 hover:border-amber-300 hover:bg-stone-50/70'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Product Photo Thumbnail */}
                        <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200/80 shrink-0 overflow-hidden flex items-center justify-center shadow-2xs">
                          <img
                            src={itemImg}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/products/prod-tiger-eye-macro.jpg';
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono text-xs font-bold text-stone-900 truncate">
                              {orderRef}
                            </span>
                            <span className="text-[11px] font-bold text-[#5B0D15]">
                              ₹{Number(ord.totalAmount || 0).toLocaleString('en-IN')}
                            </span>
                          </div>

                          <div className="text-xs font-semibold text-stone-800 truncate">
                            {custName}
                          </div>

                          <div className="text-[11px] text-stone-500 truncate flex items-center gap-1">
                            <span className="truncate">{primaryItemName}</span>
                            {additionalCount > 0 && (
                              <span className="text-[10px] font-bold text-amber-900 bg-amber-100/80 px-1 rounded shrink-0">
                                +{additionalCount} more
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-semibold border ${fulfillmentInfo.badgeClass}`}
                            >
                              <span className={`w-1 h-1 rounded-full ${fulfillmentInfo.dotClass}`} />
                              <span>{fulfillmentInfo.label}</span>
                            </span>

                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-semibold border ${paymentInfo.badgeClass}`}
                            >
                              <span className={`w-1 h-1 rounded-full ${paymentInfo.dotClass}`} />
                              <span>{paymentInfo.label}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Direct Comprehensive Order Inspection Dossier (7 cols on lg) */}
              <div className="lg:col-span-7">
                {inspectedOrder ? (
                  <div className="p-5 sm:p-6 rounded-3xl bg-white border border-amber-200/90 shadow-sm space-y-4 text-left">
                    {/* Header: Order ID, Date, and Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-lg font-bold text-[#5B0D15]">
                            Order #{inspectedOrder.id.slice(-8).toUpperCase()}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyText('orderId', inspectedOrder.id)}
                            className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
                            title="Copy full Order ID"
                          >
                            {copiedField === 'orderId' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-stone-500 font-medium mt-0.5">
                          Placed on{' '}
                          {new Date(inspectedOrder.createdAt || Date.now()).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {onSelectOrder && (
                          <button
                            type="button"
                            onClick={() => onSelectOrder(inspectedOrder)}
                            className="px-3 py-1.5 rounded-xl bg-[#5B0D15] hover:bg-[#480a11] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                            title="Open Full Status Lifecycle Modal"
                          >
                            <Truck className="w-3.5 h-3.5 text-amber-300" />
                            <span>Manage Fulfilment</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setInspectedOrder(null)}
                          className="p-1.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-500 cursor-pointer"
                          title="Close inspection"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Status Badges Row */}
                    <div className="flex items-center gap-2 flex-wrap p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 text-xs">
                      <span className="text-stone-500 font-medium">Lifecycle Status:</span>
                      {(() => {
                        const f = getFulfillmentStatusDetail(inspectedOrder.status, inspectedOrder.deliveryStatus);
                        return (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold border ${f.badgeClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${f.dotClass}`} />
                            <span>{f.label}</span>
                          </span>
                        );
                      })()}

                      <span className="text-stone-300">|</span>

                      <span className="text-stone-500 font-medium">Payment:</span>
                      {(() => {
                        const p = getPaymentStatusDetail(inspectedOrder.paymentStatus, inspectedOrder.status, inspectedOrder.isDemoOrder);
                        return (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold border ${p.badgeClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${p.dotClass}`} />
                            <span>{p.label}</span>
                          </span>
                        );
                      })()}
                    </div>

                    {/* Customer & Shipping Address Dossier */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Customer Details */}
                      <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-amber-200/70 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#5B0D15]">
                          <User className="w-3.5 h-3.5 text-amber-700" />
                          <span>Seeker Profile</span>
                        </div>
                        <div className="text-xs space-y-1">
                          <div className="font-semibold text-stone-900">
                            {inspectedOrder.customer?.name || inspectedOrder.user?.name || inspectedOrder.shippingAddress?.fullName || 'Seeker'}
                          </div>
                          {(inspectedOrder.customer?.phone || inspectedOrder.shippingAddress?.phone) && (
                            <div className="flex items-center gap-1.5 text-stone-600 font-mono text-[11px]">
                              <Phone className="w-3 h-3 text-stone-400 shrink-0" />
                              <span>{inspectedOrder.customer?.phone || inspectedOrder.shippingAddress?.phone}</span>
                            </div>
                          )}
                          {(inspectedOrder.customer?.email || inspectedOrder.user?.email) && (
                            <div className="flex items-center gap-1.5 text-stone-600 text-[11px] truncate">
                              <Mail className="w-3 h-3 text-stone-400 shrink-0" />
                              <span className="truncate">{inspectedOrder.customer?.email || inspectedOrder.user?.email}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Delivery Address */}
                      <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-amber-200/70 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-[#5B0D15]">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-amber-700" />
                            <span>Delivery Address</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const a = inspectedOrder.shippingAddress || {};
                              const addrStr = `${a.street || ''}, ${a.city || ''}, ${a.state || ''} ${a.postalCode || ''}`.trim();
                              handleCopyText('address', addrStr);
                            }}
                            className="text-[11px] font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
                            title="Copy Delivery Address"
                          >
                            {copiedField === 'address' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedField === 'address' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <div className="text-xs text-stone-700 leading-relaxed">
                          {inspectedOrder.shippingAddress ? (
                            <>
                              <p className="font-medium text-stone-900">{inspectedOrder.shippingAddress.street || 'Address on file'}</p>
                              <p className="text-stone-600 text-[11px]">
                                {[inspectedOrder.shippingAddress.city, inspectedOrder.shippingAddress.state, inspectedOrder.shippingAddress.postalCode]
                                  .filter(Boolean)
                                  .join(', ') || 'India'}
                              </p>
                            </>
                          ) : (
                            <p className="text-stone-400 italic">No postal address recorded for this order.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ordered Relics with Photo Thumbnails */}
                    <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-stone-900">
                        <div className="flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-amber-600" />
                          <span>Consecrated Products ({inspectedOrder.items?.length || 1})</span>
                        </div>
                        <span className="text-[11px] text-stone-500 font-normal">
                          Total: <span className="font-black text-[#550E17]">₹{Number(inspectedOrder.totalAmount || 0).toLocaleString('en-IN')}</span>
                        </span>
                      </div>

                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {(inspectedOrder.items || []).map((item: any, idx: number) => {
                          const itemImg = resolveProductImage(item);
                          const itemTitle = item.productName || item.product?.name || 'Vedic Relic';
                          const itemCategory = item.productCategory || item.product?.categoryLabel || item.product?.category || 'Energized Relic';
                          const isCertified = item.labCertified || item.product?.labCertified !== false;
                          const qty = item.quantity || 1;
                          const price = item.lineTotal || (item.purchasePrice || item.price || 0) * qty || inspectedOrder.totalAmount;

                          return (
                            <div key={idx} className="flex items-center justify-between gap-3 p-2 rounded-xl bg-stone-50/70 border border-stone-200/60">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-12 h-12 rounded-xl bg-white border border-stone-200/80 shrink-0 overflow-hidden flex items-center justify-center shadow-2xs">
                                  <img
                                    src={itemImg}
                                    alt={itemTitle}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/products/prod-tiger-eye-macro.jpg';
                                    }}
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-stone-900 text-xs truncate" title={itemTitle}>
                                    {itemTitle}
                                  </p>
                                  <p className="text-[10px] text-stone-500 truncate">
                                    {itemCategory}
                                    {isCertified && ' • Certified'}
                                  </p>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <p className="font-black text-[#550E17] text-xs">₹{Number(price).toLocaleString('en-IN')}</p>
                                <p className="text-[10px] text-stone-500">Qty: {qty}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Consignment & Tracking AWB */}
                    <div className="p-3.5 rounded-2xl bg-[#F0FDFA] border border-teal-200 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-teal-900">
                        <div className="flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-teal-700" />
                          <span>Dispatch &amp; Consignment Tracking</span>
                        </div>
                        {inspectedOrder.trackingNumber && (
                          <button
                            type="button"
                            onClick={() => handleCopyText('tracking', inspectedOrder.trackingNumber)}
                            className="text-[11px] font-semibold text-teal-800 hover:text-teal-950 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedField === 'tracking' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedField === 'tracking' ? 'Copied AWB' : 'Copy AWB'}</span>
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-teal-700 block uppercase font-bold">Courier Partner</span>
                          <span className="font-semibold text-teal-950">{inspectedOrder.courierName || 'BlueDart Express / SpeedPost'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-teal-700 block uppercase font-bold">Consignment AWB</span>
                          <span className="font-mono font-bold text-teal-950">{inspectedOrder.trackingNumber || 'Pending Dispatch AWB'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Vedic Lifecycle Progress Steps */}
                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
                      <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Sacred Fulfilment Lifecycle Timeline</span>
                      </span>

                      <div className="grid grid-cols-4 gap-1.5 text-center pt-1">
                        {[
                          { title: 'Placed', status: 'ORDER_PLACED', active: true },
                          {
                            title: 'Consecration',
                            status: 'CONSECRATING',
                            active: ['CONSECRATING', 'CONFIRMED', 'DISPATCHED', 'DELIVERED'].includes(inspectedOrder.status),
                          },
                          {
                            title: 'Dispatched',
                            status: 'DISPATCHED',
                            active: ['DISPATCHED', 'DELIVERED'].includes(inspectedOrder.status),
                          },
                          {
                            title: 'Delivered',
                            status: 'DELIVERED',
                            active: inspectedOrder.status === 'DELIVERED',
                          },
                        ].map((step, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded-xl border text-[11px] font-semibold transition-colors ${
                              step.active
                                ? 'bg-amber-100/80 border-amber-300 text-amber-950 font-bold'
                                : 'bg-white border-stone-200/60 text-stone-400'
                            }`}
                          >
                            <span className="block text-[9px] uppercase tracking-wider text-stone-500">Stage {idx + 1}</span>
                            <span>{step.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center bg-white/70 rounded-3xl border border-stone-200/80 space-y-3">
                    <Eye className="w-8 h-8 text-stone-400 mx-auto" />
                    <h3 className="font-serif font-bold text-stone-800">Select an Order to Inspect</h3>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      Click any customer order from the left list to directly inspect its complete seeker details, delivery address, ordered items with photos, and consignment lifecycle status.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SACRED STORE PRODUCTS CATALOGUE & INVENTORY                            */}
      {/* ========================================================================= */}
      {activeSubTab === 'catalogue' && (
        <div className="space-y-4">
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
              {products.map((item) => {
                const productImg = resolveProductImage(item);

                return (
                  <div
                    key={item.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      item.inStock
                        ? 'bg-white/95 border-stone-200/90 hover:border-amber-400/60 hover:shadow-xs'
                        : 'bg-stone-50/90 border-stone-200/80 opacity-80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      {/* Product Image & Info Container */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Consecrated Product Photo Thumbnail */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-stone-100 border border-stone-200/80 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                          <img
                            src={productImg}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/products/prod-tiger-eye-macro.jpg';
                            }}
                          />
                        </div>

                        {/* Product Meta */}
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
                );
              })}
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
