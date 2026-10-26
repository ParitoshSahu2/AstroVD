import React from 'react';
import {
  Search,
  Package,
  Phone,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface AdminOrdersTabProps {
  orderSearch: string;
  setOrderSearch: (s: string) => void;
  handleOrderSearchSubmit: (e: React.FormEvent) => void;
  orderStatusFilter: string;
  setOrderStatusFilter: (s: string) => void;
  orderDateFilter: string;
  setOrderDateFilter: (s: string) => void;
  ordersList: any[];
  ordersLoading: boolean;
  orderTotalCount: number;
  orderPage: number;
  orderTotalPages: number;
  fetchOrdersList: (p: number) => void;
  onSelectOrder: (o: any) => void;
}

export default function AdminOrdersTab({
  orderSearch,
  setOrderSearch,
  handleOrderSearchSubmit,
  orderStatusFilter,
  setOrderStatusFilter,
  orderDateFilter,
  setOrderDateFilter,
  ordersList,
  ordersLoading,
  orderTotalCount,
  orderPage,
  orderTotalPages,
  fetchOrdersList,
  onSelectOrder,
}: AdminOrdersTabProps) {
  return (
    <div className="space-y-6">
      {/* Filter & Search Bar for Orders */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-stone-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Order Search Form */}
        <form onSubmit={handleOrderSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              placeholder="Search by Order ID, customer name, email, phone, city, or pincode..."
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

        {/* Filters for Orders */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <span className="font-semibold hidden sm:inline">Status:</span>
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <span className="font-semibold hidden sm:inline">Date:</span>
            <input
              type="date"
              value={orderDateFilter}
              onChange={(e) => setOrderDateFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          {(orderSearch || orderStatusFilter !== 'ALL' || orderDateFilter) && (
            <button
              onClick={() => {
                setOrderSearch('');
                setOrderStatusFilter('ALL');
                setOrderDateFilter('');
              }}
              className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-stone-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="space-y-0.5">
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#3B1E22] flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-700" />
              <span>Customer Shopping Orders &amp; Sacred Artifact Fulfillment</span>
            </h3>
            <p className="text-xs text-stone-500">
              Showing {ordersList.length} of {orderTotalCount} total customer shopping orders across platform
            </p>
          </div>

          <button
            onClick={() => fetchOrdersList(orderPage)}
            className="px-3 py-1.5 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${ordersLoading ? 'animate-spin text-[#5B0D15]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {ordersLoading ? (
          <div className="py-20 text-center text-xs text-stone-500 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#5B0D15]" />
            <p>Loading customer shopping order records...</p>
          </div>
        ) : ordersList.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-500 space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-800 flex items-center justify-center mx-auto border border-blue-200">
              <Package className="w-6 h-6" />
            </div>
            <p className="font-bold text-sm text-stone-700">No Orders Found</p>
            <p className="text-stone-400 max-w-sm mx-auto">
              No customer shopping orders match the selected filter criteria or search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Order Ref / Date</th>
                  <th className="py-3 px-3">Customer Details</th>
                  <th className="py-3 px-3">Items &amp; Relics</th>
                  <th className="py-3 px-3">Destination</th>
                  <th className="py-3 px-3 text-right">Order Total</th>
                  <th className="py-3 px-3 text-center">Payment</th>
                  <th className="py-3 px-3 text-center">Fulfillment</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {ordersList.map((o) => {
                  const isPending = o.status === 'PENDING';
                  const isProcessing = o.status === 'PROCESSING';
                  const isShipped = o.status === 'SHIPPED';
                  const isDelivered = o.status === 'DELIVERED';
                  const isCancelled = o.status === 'CANCELLED';

                  return (
                    <tr key={o.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="font-mono text-[#5B0D15] font-bold block">
                          {o.orderReference || `#ORD-${o.id.slice(0, 8).toUpperCase()}`}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-bold text-[#3B1E22] block">
                          {o.customer?.name || o.shippingAddress?.recipient || 'Customer'}
                        </span>
                        <span className="text-stone-500 text-[11px] block">{o.customer?.email || 'Guest Checkout'}</span>
                        <span className="text-amber-800 font-medium text-[11px] flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          {o.customer?.phone || o.shippingAddress?.phone || 'No phone'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                          {o.items?.slice(0, 2).map((it: any, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-medium border border-stone-200 truncate">
                              {it.productName || it.product?.name || 'Vedic Relic'} × {it.quantity}
                            </span>
                          ))}
                          {o.items?.length > 2 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                              +{o.items.length - 2} more
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-stone-400 block mt-0.5">
                          {o.itemCount || o.items?.reduce((s: number, i: any) => s + (i.quantity || 1), 0)} units total
                        </span>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap text-stone-600">
                        <span className="font-medium text-stone-800 block text-[11px]">
                          {o.shippingAddress?.city || 'Varanasi'}, {o.shippingAddress?.state || 'UP'}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          PIN: {o.shippingAddress?.pincode || o.shippingAddress?.postalCode || 'N/A'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right font-bold font-serif text-[#5B0D15] whitespace-nowrap text-sm">
                        ₹{o.totalAmount}
                      </td>

                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-emerald-50 text-emerald-800 border-emerald-300">
                          ● {o.paymentStatus || 'PAID'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            isDelivered
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : isShipped
                              ? 'bg-purple-50 text-purple-800 border-purple-300'
                              : isProcessing
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : isCancelled
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : isPending
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          ● {o.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => onSelectOrder(o)}
                          className="px-3 py-1.5 rounded-lg border border-amber-300 bg-white hover:bg-amber-50 text-[#5B0D15] font-semibold text-[11px] shadow-sm transition-all flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Manage</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Orders Pagination */}
        {orderTotalPages > 1 && (
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>
              Showing page {orderPage} of {orderTotalPages} ({orderTotalCount} total orders)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={orderPage <= 1}
                onClick={() => fetchOrdersList(orderPage - 1)}
                className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>
              <button
                disabled={orderPage >= orderTotalPages}
                onClick={() => fetchOrdersList(orderPage + 1)}
                className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
