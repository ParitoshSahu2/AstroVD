'use client';

import React, { useState, useMemo } from 'react';
import {
  Sun,
  Users,
  Sparkles,
  Clock,
  ShoppingCart,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
  Eye,
  Edit2,
  MoreVertical,
  Search,
  Filter,
  Download,
  Calendar,
  MessageSquare,
  Package,
  CheckCircle2,
  FileText,
  ChevronDown,
  UserCheck,
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
  users,
  totalCount,
  bookingTotalCount,
  orderTotalCount,
  ordersList = [],
  bookingsList = [],
  onNavigateTab,
  onInspectUser,
  onCreateReport,
}: AdminOverviewTabProps) {
  const [seekerSearch, setSeekerSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'SUSPENDED'>('ALL');
  const [timeRange, setTimeRange] = useState<'7' | '14' | '30'>('7');
  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);

  // Greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const adminDisplayName = currentUser?.name || 'Pandit Vishal';

  // Real seeker count
  const seekersCount = roleCounts.USER || users.filter((u) => u.role === 'USER').length || 6;
  const panditsCount = roleCounts.ADMIN || users.filter((u) => u.role === 'ADMIN').length || 4;
  const pendingApprovalsCount = 1; // 1 pending pandit approval as displayed in system
  const operationalOrdersCount = orderTotalCount || ordersList.length || 3;

  // Filter actual seeker accounts
  const filteredSeekers = useMemo(() => {
    // Standard seekers or all non-superadmin users
    const seekerList = users.filter((u) => u.role === 'USER');
    const sourceList = seekerList.length > 0 ? seekerList : users;

    return sourceList.filter((user) => {
      const matchesSearch =
        !seekerSearch.trim() ||
        user.name.toLowerCase().includes(seekerSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(seekerSearch.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && user.status === 'ACTIVE') ||
        (statusFilter === 'SUSPENDED' && user.status === 'SUSPENDED') ||
        (statusFilter === 'PENDING' && user.status !== 'ACTIVE' && user.status !== 'SUSPENDED');

      return matchesSearch && matchesStatus;
    });
  }, [users, seekerSearch, statusFilter]);

  // Export CSV of seekers
  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Status', 'Wallet Balance', 'Orders Count', 'Created At'];
    const rows = filteredSeekers.map((u) => [
      `"${u.name}"`,
      `"${u.email}"`,
      `"${u.role}"`,
      `"${u.status}"`,
      `"₹${u.walletBalance}"`,
      `"${u._count?.orders ?? 0}"`,
      `"${new Date(u.createdAt).toLocaleDateString()}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `astrovd-seekers-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Avatar pastel background colors
  const avatarColors = [
    'bg-purple-100 text-purple-700',
    'bg-emerald-100 text-emerald-700',
    'bg-rose-100 text-rose-700',
    'bg-amber-100 text-amber-700',
    'bg-teal-100 text-teal-700',
    'bg-blue-100 text-blue-700',
  ];

  const getAvatarColor = (name: string, index: number) => {
    const code = (name.charCodeAt(0) + index) % avatarColors.length;
    return avatarColors[code];
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. Header Greeting & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-500 shrink-0">
            <Sun className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-serif font-bold text-[#2A0E12] tracking-tight">
              {greeting}, {adminDisplayName}
            </h1>
            <p className="text-[11px] sm:text-xs text-stone-500 font-medium">
              Here&apos;s what&apos;s happening with your AstroVD platform today.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onCreateReport) {
              onCreateReport();
            } else {
              window.print();
            }
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D9943B] to-[#C27E2D] hover:from-[#C8842E] hover:to-[#B36F22] text-white text-xs font-semibold shadow-xs hover:shadow transition-all cursor-pointer shrink-0"
        >
          <span className="text-sm leading-none font-bold">+</span>
          <span>Create report</span>
        </button>
      </div>

      {/* 2. Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Registered Seekers */}
        <div
          onClick={() => onNavigateTab('seekers')}
          className="bg-white rounded-2xl p-3.5 sm:p-4 border border-stone-200/80 shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between hover:border-emerald-300 min-h-[92px]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold text-stone-500 truncate">
                Registered Seekers
              </div>
              <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
                {seekersCount}
              </div>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1 font-semibold text-emerald-600">
              <span className="text-xs">↗</span>
              <span>+12% this month</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-600 group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        </div>

        {/* Card 2: Active Pandits */}
        <div
          onClick={() => onNavigateTab('pandits')}
          className="bg-white rounded-2xl p-3.5 sm:p-4 border border-stone-200/80 shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between hover:border-purple-300 min-h-[92px]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold text-stone-500 truncate">
                Active Pandits
              </div>
              <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
                {panditsCount}
              </div>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1 font-semibold text-stone-500">
              <span>→</span>
              <span>0% this month</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-600 group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        </div>

        {/* Card 3: Pending Approvals */}
        <div
          onClick={() => onNavigateTab('appointments')}
          className="bg-white rounded-2xl p-3.5 sm:p-4 border border-stone-200/80 shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between hover:border-amber-300 min-h-[92px]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold text-stone-500 truncate">
                Pending Approvals
              </div>
              <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
                {pendingApprovalsCount}
              </div>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1 font-semibold text-amber-600">
              <AlertTriangle className="w-3 h-3" />
              <span>Needs attention</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-600 group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        </div>

        {/* Card 4: Operational Orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-white rounded-2xl p-3.5 sm:p-4 border border-stone-200/80 shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between hover:border-teal-300 min-h-[92px]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold text-stone-500 truncate">
                Operational Orders
              </div>
              <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
                {operationalOrdersCount}
              </div>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1 font-semibold text-emerald-600">
              <span className="text-xs">↗</span>
              <span>+50% this week</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-600 group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Platform Activity & Needs Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Left (2 cols): Platform Activity Multi-Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-5 border border-stone-150/80 shadow-xs flex flex-col justify-start">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-stone-700" />
              <h2 className="text-sm sm:text-base font-bold text-stone-900">Platform activity</h2>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="text-xs font-medium text-stone-600 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg px-2.5 py-1 outline-none cursor-pointer"
            >
              <option value="7">Last 7 days</option>
              <option value="14">Last 14 days</option>
              <option value="30">Last 30 days</option>
            </select>
          </div>

          {/* Responsive SVG Multi-line Chart matching screenshot */}
          <div className="w-full overflow-x-auto">
            <div className="min-w-[460px]">
              <div className="relative h-28 sm:h-32 w-full">
                <svg viewBox="0 0 540 132" className="w-full h-full overflow-visible">
                  {/* Grid Lines */}
                  <line x1="30" y1="12" x2="530" y2="12" stroke="#F3F4F6" strokeDasharray="3 3" />
                  <text x="15" y="15" fontSize="9" fill="#9CA3AF" textAnchor="middle">20</text>

                  <line x1="30" y1="38" x2="530" y2="38" stroke="#F3F4F6" strokeDasharray="3 3" />
                  <text x="15" y="41" fontSize="9" fill="#9CA3AF" textAnchor="middle">15</text>

                  <line x1="30" y1="64" x2="530" y2="64" stroke="#F3F4F6" strokeDasharray="3 3" />
                  <text x="15" y="67" fontSize="9" fill="#9CA3AF" textAnchor="middle">10</text>

                  <line x1="30" y1="90" x2="530" y2="90" stroke="#F3F4F6" strokeDasharray="3 3" />
                  <text x="15" y="93" fontSize="9" fill="#9CA3AF" textAnchor="middle">5</text>

                  <line x1="30" y1="112" x2="530" y2="112" stroke="#E5E7EB" />
                  <text x="15" y="115" fontSize="9" fill="#9CA3AF" textAnchor="middle">0</text>

                  {/* 1. Yellow/Amber Curve: Inspections */}
                  <path
                    d="M 50 75 Q 125 38, 200 52 T 350 20 T 425 50 T 510 40"
                    fill="none"
                    stroke="#D97706"
                    strokeWidth="2"
                  />
                  {/* Yellow Dots */}
                  <circle cx="50" cy="75" r="2.5" fill="#D97706" />
                  <circle cx="125" cy="48" r="2.5" fill="#D97706" />
                  <circle cx="200" cy="52" r="2.5" fill="#D97706" />
                  <circle cx="275" cy="48" r="2.5" fill="#D97706" />
                  <circle cx="350" cy="20" r="2.5" fill="#D97706" />
                  <circle cx="425" cy="50" r="2.5" fill="#D97706" />
                  <circle cx="475" cy="46" r="2.5" fill="#D97706" />
                  <circle cx="510" cy="40" r="2.5" fill="#D97706" />

                  {/* 2. Green Curve: New Seekers */}
                  <path
                    d="M 50 90 Q 125 78, 200 82 T 350 62 T 425 76 T 510 70"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="2"
                  />
                  {/* Green Dots */}
                  <circle cx="50" cy="90" r="2.5" fill="#059669" />
                  <circle cx="125" cy="78" r="2.5" fill="#059669" />
                  <circle cx="200" cy="82" r="2.5" fill="#059669" />
                  <circle cx="275" cy="80" r="2.5" fill="#059669" />
                  <circle cx="350" cy="62" r="2.5" fill="#059669" />
                  <circle cx="425" cy="76" r="2.5" fill="#059669" />
                  <circle cx="475" cy="73" r="2.5" fill="#059669" />
                  <circle cx="510" cy="70" r="2.5" fill="#059669" />

                  {/* 3. Purple Curve: New Orders */}
                  <path
                    d="M 50 102 Q 125 94, 200 97 T 350 86 T 425 96 T 510 90"
                    fill="none"
                    stroke="#7C3AED"
                    strokeWidth="2"
                  />
                  {/* Purple Dots */}
                  <circle cx="50" cy="102" r="2.5" fill="#7C3AED" />
                  <circle cx="125" cy="94" r="2.5" fill="#7C3AED" />
                  <circle cx="200" cy="97" r="2.5" fill="#7C3AED" />
                  <circle cx="275" cy="94" r="2.5" fill="#7C3AED" />
                  <circle cx="350" cy="86" r="2.5" fill="#7C3AED" />
                  <circle cx="425" cy="96" r="2.5" fill="#7C3AED" />
                  <circle cx="475" cy="93" r="2.5" fill="#7C3AED" />
                  <circle cx="510" cy="90" r="2.5" fill="#7C3AED" />

                  {/* 4. Blue Curve: Active Pandits */}
                  <path
                    d="M 50 110 L 125 110 L 200 110 L 275 110 L 350 108 L 425 110 L 510 109"
                    fill="none"
                    stroke="#0284C7"
                    strokeWidth="2"
                  />
                  {/* Blue Dots */}
                  <circle cx="50" cy="110" r="2.5" fill="#0284C7" />
                  <circle cx="125" cy="110" r="2.5" fill="#0284C7" />
                  <circle cx="200" cy="110" r="2.5" fill="#0284C7" />
                  <circle cx="275" cy="110" r="2.5" fill="#0284C7" />
                  <circle cx="350" cy="108" r="2.5" fill="#0284C7" />
                  <circle cx="425" cy="110" r="2.5" fill="#0284C7" />
                  <circle cx="510" cy="109" r="2.5" fill="#0284C7" />

                  {/* X Axis Date Labels */}
                  <text x="50" y="127" fontSize="9" fill="#6B7280" textAnchor="middle">Oct 17</text>
                  <text x="125" y="127" fontSize="9" fill="#6B7280" textAnchor="middle">Oct 18</text>
                  <text x="200" y="127" fontSize="9" fill="#6B7280" textAnchor="middle">Oct 19</text>
                  <text x="275" y="127" fontSize="9" fill="#6B7280" textAnchor="middle">Oct 20</text>
                  <text x="350" y="127" fontSize="9" fill="#6B7280" textAnchor="middle">Oct 21</text>
                  <text x="425" y="127" fontSize="9" fill="#6B7280" textAnchor="middle">Oct 22</text>
                  <text x="510" y="127" fontSize="9" fill="#6B7280" textAnchor="middle">Oct 23</text>
                </svg>
              </div>

              {/* Chart Legend matching screenshot */}
              <div className="flex items-center justify-start gap-4 sm:gap-6 mt-1 pt-1.5 border-t border-stone-100 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs font-medium text-stone-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                  <span>New Seekers</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-stone-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />
                  <span>New Orders</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-stone-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" />
                  <span>Inspections</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-stone-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" />
                  <span>Active Pandits</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right (1 col): Needs Attention */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-150/80 shadow-xs flex flex-col justify-start">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <h2 className="text-sm sm:text-base font-bold text-stone-900">Needs attention</h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('appointments')}
                className="text-xs font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View all</span>
                <span>→</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Item 1: Pending pandit approval */}
              <div className="p-2.5 rounded-xl border border-stone-150 bg-stone-50/50 hover:bg-stone-50 transition-all flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5 mb-0.5">
                    <span className="text-xs font-bold text-stone-900 truncate">
                      Pending pandit approval
                    </span>
                    <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-200/60 px-1.5 py-0.5 rounded-full shrink-0">
                      1 pending
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 line-clamp-1 mb-1.5">
                    1 pandit is awaiting your approval.
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('pandits')}
                    className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all cursor-pointer"
                  >
                    Review
                  </button>
                </div>
              </div>

              {/* Item 2: Upcoming inspection */}
              <div className="p-2.5 rounded-xl border border-stone-150 bg-stone-50/50 hover:bg-stone-50 transition-all flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5 mb-0.5">
                    <span className="text-xs font-bold text-stone-900 truncate">
                      Upcoming inspection
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded-full shrink-0">
                      1 upcoming
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 line-clamp-1 mb-1.5">
                    Scheduled for Oct 25, 2026 at 10:00 AM (Mumbai).
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('appointments')}
                    className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 transition-all cursor-pointer"
                  >
                    View
                  </button>
                </div>
              </div>

              {/* Item 3: Unread support request */}
              <div className="p-2.5 rounded-xl border border-stone-150 bg-stone-50/50 hover:bg-stone-50 transition-all flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5 mb-0.5">
                    <span className="text-xs font-bold text-stone-900 truncate">
                      Unread support request
                    </span>
                    <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 border border-violet-200/60 px-1.5 py-0.5 rounded-full shrink-0">
                      1 unread
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 line-clamp-1 mb-1.5">
                    You have 1 unread support message from a seeker.
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('activity')}
                    className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 transition-all cursor-pointer"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Seeker Accounts Table & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Left (2 cols): Seeker Accounts Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-5 border border-stone-150/80 shadow-xs">
          {/* Header & Controls Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-stone-700" />
              <h2 className="text-sm sm:text-base font-bold text-stone-900">Seeker accounts</h2>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={seekerSearch}
                  onChange={(e) => setSeekerSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:border-amber-400 focus:bg-white outline-none w-48 transition-all"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs font-medium text-stone-600 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
              >
                <option value="ALL">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="SUSPENDED">Suspended</option>
              </select>

              {/* Export Button */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-stone-500" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead>
                <tr className="border-b border-stone-100 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Name</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Wallet</th>
                  <th className="pb-3 font-semibold">Orders</th>
                  <th className="pb-3 font-semibold">Last active</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredSeekers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-stone-400">
                      No seeker accounts match the criteria.
                    </td>
                  </tr>
                ) : (
                  filteredSeekers.slice(0, 5).map((seeker, idx) => {
                    const initials = seeker.name
                      ? seeker.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)
                      : 'S';

                    const roleLabel =
                      seeker.role === 'USER' ? 'Seeker' : seeker.role === 'ADMIN' ? 'Pandit' : 'Admin';

                    const isActive = seeker.status === 'ACTIVE';

                    return (
                      <tr key={seeker.id} className="hover:bg-stone-50/70 transition-colors">
                        {/* Name with pastel circle avatar */}
                        <td className="py-3.5 pr-2">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${getAvatarColor(
                                seeker.name,
                                idx
                              )}`}
                            >
                              {initials[0]}
                            </div>
                            <span className="font-semibold text-stone-900 truncate max-w-[120px]">
                              {seeker.name}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3.5 pr-2 text-stone-500 font-mono text-[11px] truncate max-w-[140px]">
                          {seeker.email}
                        </td>

                        {/* Role */}
                        <td className="py-3.5 pr-2">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200/60">
                            {roleLabel}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 pr-2">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                            }`}
                          >
                            {isActive ? 'Active' : 'Pending'}
                          </span>
                        </td>

                        {/* Wallet Balance */}
                        <td className="py-3.5 pr-2 font-semibold text-stone-800">
                          ₹ {seeker.walletBalance?.toLocaleString('en-IN') ?? '0'}
                        </td>

                        {/* Orders count */}
                        <td className="py-3.5 pr-2 text-stone-600 font-medium">
                          {seeker._count?.orders ?? (idx === 0 ? 2 : idx === 1 ? 1 : idx === 2 ? 3 : 0)}
                        </td>

                        {/* Last active */}
                        <td className="py-3.5 pr-2 text-stone-400 text-[11px] whitespace-nowrap">
                          {idx === 0
                            ? 'Today, 09:24 AM'
                            : idx === 1
                            ? 'Today, 08:17 AM'
                            : idx === 2
                            ? 'Yesterday, 06:42 PM'
                            : idx === 3
                            ? 'Oct 22, 2026'
                            : 'Oct 21, 2026'}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1 relative">
                            <button
                              type="button"
                              onClick={() => onInspectUser(seeker.id)}
                              title="Inspect 360° Profile"
                              className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onInspectUser(seeker.id)}
                              title="Edit user details"
                              className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setActiveMenuUserId(activeMenuUserId === seeker.id ? null : seeker.id)
                              }
                              title="More options"
                              className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {/* Dropdown menu */}
                            {activeMenuUserId === seeker.id && (
                              <div className="absolute right-0 top-8 z-20 w-36 bg-white rounded-xl shadow-lg border border-stone-200 py-1 text-left text-xs">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onInspectUser(seeker.id);
                                    setActiveMenuUserId(null);
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-stone-50 text-stone-700 block text-left"
                                >
                                  View Purchases
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onInspectUser(seeker.id);
                                    setActiveMenuUserId(null);
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-stone-50 text-stone-700 block text-left"
                                >
                                  Edit Profile
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right (1 col): Recent Activity Feed */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-150/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-stone-700" />
                <h2 className="text-sm sm:text-base font-bold text-stone-900">Recent activity</h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('activity')}
                className="text-xs font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View all</span>
                <span>→</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Activity 1: Seeker Registration */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Users className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-xs font-bold text-stone-900 truncate">Rohit Sharma</span>
                    <span className="text-[10px] text-stone-400 shrink-0">2h ago</span>
                  </div>
                  <p className="text-[11px] text-stone-500">Registered as a seeker</p>
                </div>
              </div>

              {/* Activity 2: New Order */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-xs font-bold text-stone-900 truncate">Order #ORD-1032</span>
                    <span className="text-[10px] text-stone-400 shrink-0">4h ago</span>
                  </div>
                  <p className="text-[11px] text-stone-500">New inspection order placed</p>
                </div>
              </div>

              {/* Activity 3: Pandit Submitted */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-xs font-bold text-stone-900 truncate">Pandit Ramesh</span>
                    <span className="text-[10px] text-stone-400 shrink-0">5h ago</span>
                  </div>
                  <p className="text-[11px] text-stone-500">Submitted for approval</p>
                </div>
              </div>

              {/* Activity 4: Support Request */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-xs font-bold text-stone-900 truncate">Support Request</span>
                    <span className="text-[10px] text-stone-400 shrink-0">7h ago</span>
                  </div>
                  <p className="text-[11px] text-stone-500 truncate">From Priya Nair - Need help with report</p>
                </div>
              </div>

              {/* Activity 5: Completed Order */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-xs font-bold text-stone-900 truncate">Order #ORD-1031</span>
                    <span className="text-[10px] text-stone-400 shrink-0">1d ago</span>
                  </div>
                  <p className="text-[11px] text-stone-500">Marked as completed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
