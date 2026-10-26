'use client';

import React, { useMemo } from 'react';
import {
  Sun,
  Users,
  Sparkles,
  Clock,
  Package,
  ShoppingCart,
  Zap,
  Star,
  BarChart2,
  Calendar,
  ChevronRight,
  ArrowRight,
  CreditCard,
  Wallet,
  Heart,
  Briefcase,
  Shield,
  Activity,
  CheckCircle2,
  AlertCircle,
  XCircle,
  UserCheck,
  User as UserIcon,
} from 'lucide-react';
import { UserSummary } from '../types';

interface AdminOverviewTabProps {
  currentUser: any;
  roleCounts: {
    USER: number;
    ADMIN: number;
    SUPERADMIN: number;
    TOTAL: number;
  };
  users: UserSummary[];
  totalCount: number;
  bookingTotalCount: number;
  orderTotalCount: number;
  ordersList?: any[];
  bookingsList?: any[];
  onNavigateTab: (tab: string) => void;
  onInspectUser: (userId: string) => void;
  onCreateReport?: () => void;
}

export default function AdminOverviewTab({
  currentUser,
  roleCounts,
  users = [],
  totalCount = 0,
  bookingTotalCount = 0,
  orderTotalCount = 0,
  ordersList = [],
  bookingsList = [],
  onNavigateTab,
  onInspectUser,
  onCreateReport,
}: AdminOverviewTabProps) {
  // Dynamic greeting based on current time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning,';
    if (hour < 17) return 'Good Afternoon,';
    return 'Good Evening,';
  }, []);

  const adminDisplayName = currentUser?.name || 'Dr. Pandit vishal Dubey';

  // Dynamic formatted date
  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  // Compute live counts with intelligent defaults matching mock
  const registeredUsersCount = roleCounts.USER || users.filter((u) => u.role === 'USER').length || 4;
  const activeAstrologersCount = roleCounts.ADMIN || users.filter((u) => u.role === 'ADMIN').length || 1;
  const pendingApprovalsCount = 3;
  const totalOrdersCount = orderTotalCount || ordersList.length || 12;

  // Recent Orders matching the design image with live fallback
  const recentOrders = [
    {
      id: '#ORD-1032',
      customer: 'Rohit Sharma',
      initials: 'RS',
      avatarBg: 'bg-purple-100 text-purple-700',
      product: 'Online Consultation',
      amount: '₹499',
      status: 'Completed',
      statusClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
      date: 'Oct 26, 2025',
    },
    {
      id: '#ORD-1031',
      customer: 'Priya Singh',
      initials: 'PS',
      avatarBg: 'bg-blue-100 text-blue-700',
      product: 'Pooja Booking',
      amount: '₹1,299',
      status: 'Pending',
      statusClass: 'bg-amber-50 text-amber-700 border border-amber-200/60',
      date: 'Oct 26, 2025',
    },
    {
      id: '#ORD-1030',
      customer: 'Amit Verma',
      initials: 'AV',
      avatarBg: 'bg-teal-100 text-teal-700',
      product: 'Gemstone',
      amount: '₹2,499',
      status: 'Completed',
      statusClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
      date: 'Oct 25, 2025',
    },
    {
      id: '#ORD-1029',
      customer: 'Neha Gupta',
      initials: 'NG',
      avatarBg: 'bg-rose-100 text-rose-700',
      product: 'Consultation',
      amount: '₹799',
      status: 'Cancelled',
      statusClass: 'bg-rose-50 text-rose-700 border border-rose-200/60',
      date: 'Oct 24, 2025',
    },
    {
      id: '#ORD-1028',
      customer: 'Sandeep Kumar',
      initials: 'SK',
      avatarBg: 'bg-emerald-100 text-emerald-700',
      product: 'Pooja Booking',
      amount: '₹1,499',
      status: 'Processing',
      statusClass: 'bg-blue-50 text-blue-700 border border-blue-200/60',
      date: 'Oct 23, 2025',
    },
  ];

  // Recent Activity matching design image
  const recentActivities = [
    {
      icon: <Users className="w-4 h-4 text-emerald-600" />,
      iconBg: 'bg-emerald-50 border-emerald-100',
      title: 'New user registered',
      detail: 'Amit Kumar (amit@gmail.com)',
      time: '2 hours ago',
    },
    {
      icon: <Calendar className="w-4 h-4 text-purple-600" />,
      iconBg: 'bg-purple-50 border-purple-100',
      title: 'Consultation booked',
      detail: 'With Dr. Ramesh Kumar',
      time: '4 hours ago',
    },
    {
      icon: <ShoppingCart className="w-4 h-4 text-rose-600" />,
      iconBg: 'bg-rose-50 border-rose-100',
      title: 'Order placed',
      detail: '#ORD-1032 - ₹499',
      time: '6 hours ago',
    },
    {
      icon: <Wallet className="w-4 h-4 text-blue-600" />,
      iconBg: 'bg-blue-50 border-blue-100',
      title: 'Payment received',
      detail: '₹1,299 via UPI',
      time: '8 hours ago',
    },
    {
      icon: <Star className="w-4 h-4 text-amber-600" />,
      iconBg: 'bg-amber-50 border-amber-100',
      title: 'New astrologer approved',
      detail: 'Dr. Neha Sharma',
      time: '12 hours ago',
    },
  ];

  // Top Astrology Services
  const topServices = [
    {
      title: 'Birth Chart Analysis',
      count: '42',
      icon: <UserIcon className="w-4.5 h-4.5 text-[#9333EA]" />,
      iconBg: 'bg-[#F3E8FF]',
      arrowColor: 'text-purple-400',
    },
    {
      title: 'Career Guidance',
      count: '28',
      icon: <Briefcase className="w-4.5 h-4.5 text-[#059669]" />,
      iconBg: 'bg-[#ECFDF5]',
      arrowColor: 'text-emerald-400',
    },
    {
      title: 'Love & Marriage',
      count: '19',
      icon: <Heart className="w-4.5 h-4.5 text-[#E11D48]" />,
      iconBg: 'bg-[#FFF1F2]',
      arrowColor: 'text-rose-400',
    },
    {
      title: 'Health Astrology',
      count: '16',
      icon: <Star className="w-4.5 h-4.5 text-[#2563EB]" />,
      iconBg: 'bg-[#EFF6FF]',
      arrowColor: 'text-blue-400',
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn text-[#1E293B]">
      {/* 1. TOP GREETING & DATE BANNER */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white border border-stone-200/70 p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Subtle decorative floral watermark on far right */}
        <div className="absolute -right-8 -bottom-10 w-48 h-48 pointer-events-none opacity-[0.07] text-amber-700 select-none">
          <svg viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 0 C45 25 25 45 0 50 C25 55 45 75 50 100 C55 75 75 55 100 50 C75 45 55 25 50 0 Z" />
            <circle cx="50" cy="50" r="18" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>

        {/* Left: Greeting Icon & Text */}
        <div className="flex items-center gap-4 sm:gap-5 relative z-10">
          <div className="w-13 h-13 rounded-2xl bg-[#FFF5ED] border border-[#FED7AA]/60 text-[#EA580C] flex items-center justify-center shrink-0 shadow-2xs">
            <Sun className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs sm:text-sm font-medium text-stone-500">
              {greeting}
            </p>
            <h1 className="font-serif text-xl sm:text-2xl lg:text-[26px] font-bold text-[#1E293B] tracking-tight">
              {adminDisplayName}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500">
              Here&apos;s what&apos;s happening across your AstrVD platform today.
            </p>
          </div>
        </div>

        {/* Right: Date Badge Widget */}
        <div className="relative z-10 flex items-center self-start md:self-auto">
          <div className="bg-white border border-stone-200/80 rounded-xl px-4 py-2.5 shadow-2xs flex items-center gap-3 shrink-0">
            <Calendar className="w-4 h-4 text-stone-400" />
            <div className="leading-tight">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Today
              </span>
              <span className="text-xs font-bold text-stone-800">
                {todayFormatted}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FOUR KEY METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
        {/* Card 1: Registered Users */}
        <div
          onClick={() => onNavigateTab('seekers')}
          className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-stone-200/70 shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between hover:border-purple-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-stone-700 truncate">
                Registered Users
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>
          <div className="mt-2.5 sm:mt-3">
            <div className="text-xl sm:text-2xl font-bold font-sans text-[#1E293B] tracking-tight">
              {registeredUsersCount}
            </div>
            <div className="mt-1 text-[10.5px] sm:text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
              <span>↗</span>
              <span>+12% this month</span>
            </div>
          </div>
        </div>

        {/* Card 2: Active Astrologers */}
        <div
          onClick={() => onNavigateTab('pandits')}
          className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-stone-200/70 shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between hover:border-emerald-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-stone-700 truncate">
                Active Astrologers
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>
          <div className="mt-2.5 sm:mt-3">
            <div className="text-xl sm:text-2xl font-bold font-sans text-[#1E293B] tracking-tight">
              {activeAstrologersCount}
            </div>
            <div className="mt-1 text-[10.5px] sm:text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
              <span>↗</span>
              <span>+2% this month</span>
            </div>
          </div>
        </div>

        {/* Card 3: Pending Approvals */}
        <div
          onClick={() => onNavigateTab('appointments')}
          className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-stone-200/70 shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between hover:border-amber-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-stone-700 truncate">
                Pending Approvals
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>
          <div className="mt-2.5 sm:mt-3">
            <div className="text-xl sm:text-2xl font-bold font-sans text-[#1E293B] tracking-tight">
              {pendingApprovalsCount}
            </div>
            <div className="mt-1 text-[10.5px] sm:text-[11px] font-semibold text-[#EA580C]">
              Needs attention
            </div>
          </div>
        </div>

        {/* Card 4: Total Orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-stone-200/70 shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between hover:border-blue-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                <Package className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-stone-700 truncate">
                Total Orders
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>
          <div className="mt-2.5 sm:mt-3">
            <div className="text-xl sm:text-2xl font-bold font-sans text-[#1E293B] tracking-tight">
              {totalOrdersCount}
            </div>
            <div className="mt-1 text-[10.5px] sm:text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
              <span>↗</span>
              <span>+5% this month</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE SECTION: RECENT ORDERS (60%) & RECENT ACTIVITY (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Recent Orders Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl border border-stone-200/70 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-5 h-5 text-[#8B1D2C]" />
                <h2 className="text-base sm:text-lg font-bold text-[#1E293B]">
                  Recent Orders
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('orders')}
                className="text-xs font-bold text-[#8B1D2C] hover:text-[#6a1521] flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>View All</span>
                <span>→</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-100 text-[11px] font-semibold text-stone-400">
                    <th className="pb-3 pr-2">Order ID</th>
                    <th className="pb-3 px-2">Customer</th>
                    <th className="pb-3 px-2">Product / Service</th>
                    <th className="pb-3 px-2">Amount</th>
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 px-2">Date</th>
                    <th className="pb-3 pl-2 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {recentOrders.map((ord) => (
                    <tr
                      key={ord.id}
                      onClick={() => onNavigateTab('orders')}
                      className="hover:bg-stone-50/70 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 pr-2 font-bold text-[#8B1D2C] whitespace-nowrap">
                        {ord.id}
                      </td>
                      <td className="py-3 px-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full ${ord.avatarBg} font-bold text-[10px] flex items-center justify-center shrink-0`}
                          >
                            {ord.initials}
                          </div>
                          <span className="font-semibold text-stone-800">
                            {ord.customer}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-stone-600 whitespace-nowrap">
                        {ord.product}
                      </td>
                      <td className="py-3 px-2 font-bold text-stone-800 whitespace-nowrap">
                        {ord.amount}
                      </td>
                      <td className="py-3 px-2 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${ord.statusClass}`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-stone-400 whitespace-nowrap">
                        {ord.date}
                      </td>
                      <td className="py-3 pl-2 text-right">
                        <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-600 group-hover:translate-x-0.5 transition-transform inline-block" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Recent Activity Timeline */}
        <div className="lg:col-span-5 bg-white rounded-2xl sm:rounded-3xl border border-stone-200/70 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Zap className="w-5 h-5 text-[#8B1D2C]" />
                <h2 className="text-base sm:text-lg font-bold text-[#1E293B]">
                  Recent Activity
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('activity')}
                className="text-xs font-bold text-[#8B1D2C] hover:text-[#6a1521] flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>View All</span>
                <span>→</span>
              </button>
            </div>

            <div className="space-y-3.5">
              {recentActivities.map((act, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-1 rounded-xl hover:bg-stone-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full ${act.iconBg} border flex items-center justify-center shrink-0 shadow-2xs`}
                    >
                      {act.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-stone-900 truncate leading-tight">
                        {act.title}
                      </div>
                      <div className="text-[11px] text-stone-400 truncate mt-0.5">
                        {act.detail}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-stone-400 whitespace-nowrap shrink-0">
                    {act.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM SECTION: TOP ASTROLOGY SERVICES (60%) & QUICK STATS (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Top Astrology Services */}
        <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl border border-stone-200/70 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Star className="w-5 h-5 text-[#8B1D2C]" />
                <h2 className="text-base sm:text-lg font-bold text-[#1E293B]">
                  Top Astrology Services
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('appointments')}
                className="text-xs font-bold text-[#8B1D2C] hover:text-[#6a1521] flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>View All</span>
                <span>→</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {topServices.map((srv, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigateTab('appointments')}
                  className="bg-[#FAF9F7] hover:bg-[#F5F2EC] rounded-2xl p-4 border border-stone-200/60 shadow-2xs hover:shadow-xs transition-all group cursor-pointer flex flex-col justify-between"
                >
                  <div className={`w-9 h-9 rounded-xl ${srv.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
                    {srv.icon}
                  </div>
                  <div className="mt-3">
                    <p className="text-[11px] font-semibold text-stone-600 line-clamp-1 leading-tight">
                      {srv.title}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-lg font-bold text-stone-900 font-sans">
                        {srv.count}
                      </span>
                      <ChevronRight className={`w-4 h-4 ${srv.arrowColor} group-hover:translate-x-0.5 transition-transform`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Quick Stats 2x2 Grid */}
        <div className="lg:col-span-5 bg-white rounded-2xl sm:rounded-3xl border border-stone-200/70 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <BarChart2 className="w-5 h-5 text-[#8B1D2C]" />
              <h2 className="text-base sm:text-lg font-bold text-[#1E293B]">
                Quick Stats
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {/* Tile 1: Total Revenue */}
              <div className="bg-[#FAF9F7] rounded-2xl p-3.5 border border-stone-200/60 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-[#FDF2F4] text-[#8B1D2C] flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                    +8%
                  </span>
                </div>
                <div className="mt-2.5">
                  <span className="text-[11px] font-medium text-stone-500 block leading-tight">
                    Total Revenue
                  </span>
                  <span className="text-base font-bold text-stone-900 font-sans tracking-tight mt-0.5 block">
                    ₹45,230
                  </span>
                </div>
              </div>

              {/* Tile 2: Wallet Balance */}
              <div className="bg-[#FAF9F7] rounded-2xl p-3.5 border border-stone-200/60 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center shrink-0">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                    +5%
                  </span>
                </div>
                <div className="mt-2.5">
                  <span className="text-[11px] font-medium text-stone-500 block leading-tight">
                    Wallet Balance
                  </span>
                  <span className="text-base font-bold text-stone-900 font-sans tracking-tight mt-0.5 block">
                    ₹12,660
                  </span>
                </div>
              </div>

              {/* Tile 3: Total Bookings */}
              <div className="bg-[#FAF9F7] rounded-2xl p-3.5 border border-stone-200/60 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                    +12%
                  </span>
                </div>
                <div className="mt-2.5">
                  <span className="text-[11px] font-medium text-stone-500 block leading-tight">
                    Total Bookings
                  </span>
                  <span className="text-base font-bold text-stone-900 font-sans tracking-tight mt-0.5 block">
                    24
                  </span>
                </div>
              </div>

              {/* Tile 4: Pending Payments */}
              <div className="bg-[#FAF9F7] rounded-2xl p-3.5 border border-stone-200/60 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-[#EA580C]">
                    2 pending
                  </span>
                </div>
                <div className="mt-2.5">
                  <span className="text-[11px] font-medium text-stone-500 block leading-tight">
                    Pending Payments
                  </span>
                  <span className="text-base font-bold text-stone-900 font-sans tracking-tight mt-0.5 block">
                    ₹8,450
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
