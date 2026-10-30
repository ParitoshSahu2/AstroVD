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
          <div className="w-full min-w-0 overflow-x-auto">
            <table className="w-full min-w-[1150px] table-fixed text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3.5 w-[14%] font-medium whitespace-nowrap">Order Ref / Date</th>
                  <th className="py-3 px-3.5 w-[17%] font-medium whitespace-nowrap">Customer Details</th>
                  <th className="py-3 px-3.5 w-[16%] font-medium whitespace-nowrap">Items &amp; Relics</th>
                  <th className="py-3 px-3.5 w-[13%] font-medium whitespace-nowrap">Destination</th>
                  <th className="py-3 px-3.5 text-center w-[10%] font-medium whitespace-nowrap">Order Total</th>
                  <th className="py-3 px-3.5 text-center w-[8%] font-medium whitespace-nowrap">Payment</th>
                  <th className="py-3 px-4 text-center w-[11%] font-medium whitespace-nowrap">Fulfillment</th>
                  <th className="py-3 px-4 text-center w-[11%] font-medium whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {ordersList.map((o) => {
                  const isPending = o.status === 'PENDING';
                  const isProcessing = o.status === 'PROCESSING';
                  const isShipped = o.status === 'SHIPPED';
                  const isDelivered = o.status === 'DELIVERED';
                  const isCancelled = o.status === 'CANCELLED';

                  const orderRef = o.orderReference || `#ORD-${o.id.slice(0, 8).toUpperCase()}`;
                  const orderDate = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  const custName = o.customer?.name || o.shippingAddress?.recipient || 'Customer';
                  const custEmail = o.customer?.email || 'Guest Checkout';
                  const custPhone = o.customer?.phone || o.shippingAddress?.phone || 'No phone';
                  const destCityState = `${o.shippingAddress?.city || 'Varanasi'}, ${o.shippingAddress?.state || 'UP'}`;
                  const destPin = `PIN: ${o.shippingAddress?.pincode || o.shippingAddress?.postalCode || 'N/A'}`;

                  return (
                    <tr key={o.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-3.5 px-3">
                        <span className="font-mono text-[#5B0D15] font-bold block truncate" title={orderRef}>
                          {orderRef}
                        </span>
                        <span className="text-[10px] text-stone-400 block truncate" title={orderDate}>
                          {orderDate}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="min-w-0">
                          <span className="font-bold text-[#3B1E22] block truncate" title={custName}>
                            {custName}
                          </span>
                          <span className="text-stone-500 text-[11px] block truncate" title={custEmail}>
                            {custEmail}
                          </span>
                          <span className="text-amber-800 font-medium text-[11px] flex items-center gap-1 truncate" title={custPhone}>
                            <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate">{custPhone}</span>
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1 min-w-0">
                          {o.items?.slice(0, 1).map((it: any, idx: number) => {
                            const itemName = `${it.productName || it.product?.name || 'Vedic Relic'} × ${it.quantity}`;
                            return (
                              <span key={idx} className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-medium border border-stone-200 truncate inline-block min-w-0" title={itemName}>
                                {itemName}
                              </span>
                            );
                          })}
                          {o.items?.length > 1 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold shrink-0" title={`${o.items.length - 1} more items`}>
                              +{o.items.length - 1}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-stone-400 block mt-0.5 truncate" title={`${o.itemCount || o.items?.reduce((s: number, i: any) => s + (i.quantity || 1), 0)} units total`}>
                          {o.itemCount || o.items?.reduce((s: number, i: any) => s + (i.quantity || 1), 0)} units total
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-stone-600">
                        <span className="font-medium text-stone-800 block text-[11px] truncate" title={destCityState}>
                          {destCityState}
                        </span>
                        <span className="text-[10px] text-stone-400 block truncate" title={destPin}>
                          {destPin}
                        </span>
                      </td>

                      <td
                        className="py-3.5 px-3 text-center font-semibold text-[#5B0D15] text-sm sm:text-[14.5px] font-sans tabular-nums tracking-tight truncate align-middle whitespace-nowrap"
                        title={`₹${o.totalAmount}`}
                      >
                        ₹{Number(o.totalAmount).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10.5px] font-semibold truncate max-w-full text-center ${
                            isPending || (!o.paymentStatus && o.status === 'PENDING')
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          }`}
                          title={isPending || (!o.paymentStatus && o.status === 'PENDING') ? 'Pending' : 'Paid'}
                        >
                          {isPending || (!o.paymentStatus && o.status === 'PENDING') ? 'Pending' : 'Paid'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold truncate max-w-full text-center ${
                            isDelivered
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : isShipped
                              ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                              : isProcessing
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                              : isCancelled
                              ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                              : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          }`}
                          title={o.status || 'Pending'}
                        >
                          {o.status ? o.status.charAt(0) + o.status.slice(1).toLowerCase() : 'Pending'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onSelectOrder(o)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-white hover:bg-amber-50 text-[#5B0D15] font-semibold text-[11px] shadow-xs transition-all cursor-pointer mx-auto shrink-0"
                          title="Manage Order"
                        >
                          <Eye className="w-3.5 h-3.5 shrink-0" />
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
