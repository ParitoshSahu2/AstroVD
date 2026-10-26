'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getAuthToken, getStoredUser, performLogout } from '../../lib/auth';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PageHeader } from '../../components/PageHeader';
import { AuthModal } from '../../components/AuthModal';
import {
  User as UserIcon,
  Wallet,
  Sparkles,
  Calendar,
  Compass,
  ShoppingCart,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Lock,
  PackageCheck,
  MessageCircle,
  Truck,
  ArrowRight,
  UserCheck,
  ExternalLink,
} from 'lucide-react';
import { SERVICES_CATALOGUE } from '../../data/servicesData';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  dateOfBirth?: string | null;
  timeOfBirth?: string | null;
  placeOfBirth?: string | null;
  zodiacSign?: string | null;
  walletBalance: number;
  createdAt: string;
}

interface WalletData {
  walletBalance: number;
  currency: string;
  currencySymbol: string;
}

interface Transaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'wallet' | 'consultations' | 'orders'>('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txPage, setTxPage] = useState(1);
  const [txTotalPages, setTxTotalPages] = useState(1);
  const [txTotal, setTxTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Edit Profile Form State
  const [editName, setEditName] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editTob, setEditTob] = useState('');
  const [editPob, setEditPob] = useState('');
  const [editZodiac, setEditZodiac] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');

  const abortControllerRef = useRef<AbortController | null>(null);
  const isFetchingRef = useRef(false);
  const profileRef = useRef<UserProfile | null>(null);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const clearDashboardData = () => {
    setProfile(null);
    setWallet(null);
    setTransactions([]);
    setTxTotal(0);
    setTxPage(1);
    setTxTotalPages(1);
    setBookings([]);
    setOrders([]);
    setEditName('');
    setEditDob('');
    setEditTob('');
    setEditPob('');
    setEditZodiac('');
  };

  const loadDashboardData = useCallback(async (isRefresh = false) => {
    const token = getAuthToken();
    if (!token) {
      clearDashboardData();
      setLoading(false);
      router.replace('/login?redirect=/dashboard');
      return;
    }

    // Immediately populate dashboard with stored seeker identity if available
    const stored = getStoredUser();
    if (stored && !profileRef.current) {
      setProfile(stored as any);
      setWallet({
        walletBalance: stored.walletBalance ?? 0,
        currency: 'INR',
        currencySymbol: '₹',
      });
      setEditName(stored.name || '');
    }

    // Cancel any previous in-flight request to avoid race conditions
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    isFetchingRef.current = true;

    // Display skeleton only on initial load when profile does not yet exist
    if (!isRefresh && !profileRef.current && !stored) {
      setLoading(true);
    }
    setTxLoading(true);
    setBookingsLoading(true);
    setOrdersLoading(true);

    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Parallel execution: fetch independent endpoints concurrently via Promise.all
      // Note: Replaced redundant /api/users/me/wallet call by deriving walletBalance directly from /api/users/me
      const [profRes, txRes, bookingsRes, ordersRes] = await Promise.all([
        fetch(`${backendUrl}/api/users/me`, { headers, signal: controller.signal }),
        fetch(`${backendUrl}/api/users/me/wallet/transactions?page=1&limit=5`, { headers, signal: controller.signal }),
        fetch(`${backendUrl}/api/appointments/my-bookings`, { headers, signal: controller.signal }),
        fetch(`${backendUrl}/api/orders/my-orders`, { headers, signal: controller.signal }),
      ]);

      // Check authentication and role redirect
      if (
        profRes.status === 401 ||
        txRes.status === 401 ||
        bookingsRes.status === 401 ||
        ordersRes.status === 401
      ) {
        clearDashboardData();
        await performLogout({ notifyServer: false, redirectUrl: '/login?redirect=/dashboard' });
        return;
      }

      // Process 1: Profile & Wallet Balance
      if (profRes.ok) {
        const profData = await profRes.json();
        setProfile(profData);
        setWallet({
          walletBalance: profData.walletBalance ?? 0,
          currency: 'INR',
          currencySymbol: '₹',
        });
        setEditName(profData.name || '');
        setEditDob(profData.dateOfBirth || '');
        setEditTob(profData.timeOfBirth || '');
        setEditPob(profData.placeOfBirth || '');
        setEditZodiac(profData.zodiacSign || 'Aries');
      }

      // Process 2: Transactions & Ledger
      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData.transactions || []);
        setTxPage(txData.page || 1);
        setTxTotalPages(txData.totalPages || 1);
        setTxTotal(txData.total || 0);
      }

      // Process 3: Bookings
      if (bookingsRes.ok) {
        const bData = await bookingsRes.json();
        setBookings(Array.isArray(bData) ? bData : []);
      }

      // Process 4: Orders
      if (ordersRes.ok) {
        const oData = await ordersRes.json();
        setOrders(Array.isArray(oData) ? oData : oData.orders || []);
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.error('Error fetching dashboard data:', err);
      }
    } finally {
      if (abortControllerRef.current === controller) {
        isFetchingRef.current = false;
        setLoading(false);
        setTxLoading(false);
        setBookingsLoading(false);
        setOrdersLoading(false);
      }
    }
  }, [backendUrl, router]);

  // Backward-compatible alias for refresh triggers
  const loadData = useCallback(() => {
    return loadDashboardData(true);
  }, [loadDashboardData]);

  const fetchTransactions = async (page = 1, tokenOverride?: string | null) => {
    const token = tokenOverride || getAuthToken();
    if (!token) {
      setTransactions([]);
      return;
    }

    setTxLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/users/me/wallet/transactions?page=${page}&limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        setTxPage(data.page || 1);
        setTxTotalPages(data.totalPages || 1);
        setTxTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setTxLoading(false);
    }
  };

  const fetchBookings = async (tokenOverride?: string | null) => {
    const token = tokenOverride || getAuthToken();
    if (!token) {
      setBookings([]);
      return;
    }

    setBookingsLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/appointments/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchOrders = async (tokenOverride?: string | null) => {
    const token = tokenOverride || getAuthToken();
    if (!token) {
      setOrders([]);
      return;
    }

    setOrdersLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      clearDashboardData();
      setLoading(false);
      router.replace('/login?redirect=/dashboard');
      return;
    }

    // Unified parallel fetch on mount
    loadDashboardData();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (
        tabParam === 'consultations' ||
        tabParam === 'wallet' ||
        tabParam === 'orders' ||
        tabParam === 'profile'
      ) {
        setActiveTab(tabParam as any);
      }
    }

    const handleAuthChange = () => {
      const currentToken = getAuthToken();
      if (!currentToken) {
        clearDashboardData();
        router.replace('/login?redirect=/dashboard');
      } else {
        loadDashboardData(true);
      }
    };

    const handlePageShow = (e: PageTransitionEvent) => {
      const currentToken = getAuthToken();
      if (!currentToken) {
        clearDashboardData();
        router.replace('/login?redirect=/dashboard');
      }
    };

    window.addEventListener('astro-auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      window.removeEventListener('astro-auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [pathname, router, loadDashboardData]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) return;

    setSavingProfile(true);
    setProfileMsg(null);

    try {
      const res = await fetch(`${backendUrl}/api/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          dateOfBirth: editDob,
          timeOfBirth: editTob,
          placeOfBirth: editPob,
          zodiacSign: editZodiac,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
        // Sync local storage for navbar display
        localStorage.setItem('astro_user', JSON.stringify(data.user));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('astro-auth-change', { detail: { user: data.user } }));
        }
        setProfileMsg({ type: 'success', text: 'Birth profile details updated successfully!' });
        setTimeout(() => setEditModalOpen(false), 1200);
      } else {
        const errorText = Array.isArray(data.message) ? data.message.join(', ') : data.message || 'Failed to update profile';
        setProfileMsg({ type: 'error', text: errorText });
      }
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Network error updating profile' });
    } finally {
      setSavingProfile(false);
    }
  };

  const getUserInitials = (u?: any, nameOverride?: string) => {
    const raw = (nameOverride || u?.name || '').trim();
    if (raw) {
      const parts = raw.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return parts[0][0].toUpperCase();
    }

    if (u?.email) {
      const clean = u.email.split('@')[0].replace(/[0-9]+/g, '');
      const parts = clean.split(/[._-]+/).filter(Boolean);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      if (parts.length === 1 && parts[0].length > 0) {
        return parts[0][0].toUpperCase();
      }
    }

    if (u?.role === 'ADMIN' || u?.role === 'SUPERADMIN') return 'A';
    return 'Y';
  };

  const getInitials = (name?: string) => {
    return getUserInitials(profile, name);
  };

  const getAvatarBackground = (role?: string) => {
    const r = (role || '').toUpperCase();
    if (r === 'ADMIN' || r === 'SUPERADMIN') {
      return 'bg-gradient-to-br from-[#4A044E] via-[#5B0D15] to-[#701A75] border-amber-300 text-amber-200 ring-amber-300/40';
    }
    if (r === 'ASTROLOGER') {
      return 'bg-gradient-to-br from-[#064E3B] via-[#0F766E] to-[#78350F] border-emerald-300 text-emerald-100 ring-emerald-300/40';
    }
    return 'bg-gradient-to-br from-[#5B0D15] via-[#7B121C] to-[#3B1E22] border-amber-300/80 text-amber-200 ring-amber-200/50';
  };

  const ZODIAC_HINDI_MAP: Record<string, string> = {
    Aries: 'मेष',
    Taurus: 'वृषभ',
    Gemini: 'मिथुन',
    Cancer: 'कर्क',
    Leo: 'सिंह',
    Virgo: 'कन्या',
    Libra: 'तुला',
    Scorpio: 'वृश्चिक',
    Sagittarius: 'धनु',
    Capricorn: 'मकर',
    Aquarius: 'कुंभ',
    Pisces: 'मीन',
  };

  const formatZodiacName = (sign?: string | null) => {
    if (!sign) return 'Aries (मेष)';
    if (sign.includes('(')) return sign;
    const match = Object.entries(ZODIAC_HINDI_MAP).find(
      ([k]) => k.toLowerCase() === sign.trim().toLowerCase()
    );
    if (match) return `${match[0]} (${match[1]})`;
    return sign;
  };

  const zodiacSigns = [
    'Aries', 'Taurus', 'Gemini', 'Cancer',
    'Leo', 'Virgo', 'Libra', 'Scorpio',
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col text-[#3B1E22]">
      <Navbar />

      <PageHeader
        breadcrumb="Customer Dashboard"
        title="User Account & Sanctuary"
        subtitle="Manage your Vedic birth chart information, review spiritual wallet credits, and inspect ledger transactions."
        compact={true}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {loading ? (
          // Loading Skeleton
          <div className="space-y-4 animate-pulse">
            <div className="h-24 bg-white/60 rounded-2xl border border-amber-200/50" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-60 bg-white/60 rounded-2xl border border-amber-200/50" />
              <div className="h-60 bg-white/60 rounded-2xl border border-amber-200/50 md:col-span-2" />
            </div>
          </div>
        ) : !profile ? (
          // Unauthenticated State
          <div className="max-w-xl mx-auto my-12 p-8 sm:p-12 text-center rounded-3xl bg-white/80 backdrop-blur-xl border border-amber-200/80 shadow-xl space-y-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#5B0D15] to-[#7B121C] text-amber-200 flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#3B1E22]">
                Authentication Required
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
                Please log in or register to access your personal spiritual dashboard, review birth Kundli details, and monitor wallet credits.
              </p>
            </div>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-8 py-3 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-white font-semibold text-sm shadow-lg shadow-rose-950/20 transition-all transform hover:scale-105 cursor-pointer"
            >
              Sign In / Register
            </button>
          </div>
        ) : (
          // Authenticated Dashboard
          <div className="space-y-4 sm:space-y-5">
            {/* Top Identity & Welcome Banner */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
              {/* User Identity Card */}
              <div className="lg:col-span-5 relative overflow-hidden rounded-2xl bg-gradient-to-r from-white/95 via-[#FAF7F2] to-amber-50/60 backdrop-blur-xl border border-amber-200/80 p-3.5 sm:p-4 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar Initial Circle */}
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${getAvatarBackground(
                      profile.role
                    )} font-bold flex items-center justify-center shadow-md border ring-2 ring-amber-200/60 shrink-0 ${
                      getInitials(profile.name).length > 1
                        ? 'text-base sm:text-lg tracking-tight'
                        : 'text-lg sm:text-xl font-extrabold'
                    }`}
                  >
                    {getInitials(profile.name)}
                  </div>

                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h2 className="font-serif text-base sm:text-lg font-bold text-[#3B1E22] truncate">
                        {profile.name}
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300/70 uppercase tracking-wider">
                        {profile.role}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300/70 uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                        {profile.status}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 truncate">{profile.email}</p>
                    <p className="text-[10.5px] text-amber-800 font-medium">
                      Member since {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Vedic Member'}
                    </p>
                  </div>
                </div>

                {/* Inline Compact Action Row */}
                <div className="mt-3 pt-2.5 border-t border-amber-100/70 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setEditModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg border border-amber-300/90 bg-white hover:bg-amber-50 text-[#5B0D15] font-semibold text-[11px] shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3 text-[#5B0D15]" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={loadData}
                    title="Refresh Dashboard"
                    className="p-1.5 rounded-lg border border-stone-200 bg-white/80 hover:bg-white text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Metrics Bar */}
              <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 items-stretch">
                {/* 1. Astro Wallet Card */}
                <div
                  onClick={() => setActiveTab('wallet')}
                  className={`p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-50 to-orange-50/50 border border-amber-300/70 shadow-xs hover:shadow-sm hover:border-amber-400 transition-all flex flex-col justify-between cursor-pointer group ${
                    activeTab === 'wallet' ? 'ring-2 ring-amber-500/30 border-amber-400' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold text-amber-900 tracking-wide uppercase truncate">
                      Astro Wallet
                    </span>
                    <div className="w-6 h-6 rounded-lg bg-amber-100/80 border border-amber-300/70 text-amber-800 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                      <Wallet className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl font-serif font-black text-[#5B0D15] tracking-tight truncate">
                    ₹{wallet?.walletBalance ?? profile.walletBalance}
                  </div>
                  <div className="text-[9.5px] text-stone-500 font-medium truncate mt-0.5">
                    Active spiritual credits
                  </div>
                </div>

                {/* 2. Zodiac Sign Card */}
                <div className="p-3 rounded-2xl bg-white/95 border border-stone-200/80 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold text-stone-600 tracking-wide uppercase truncate">
                      Sun / Rashi
                    </span>
                    <div className="w-6 h-6 rounded-lg bg-amber-50 border border-amber-200/70 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
                      <Sparkles className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm font-serif font-bold text-[#3B1E22] tracking-tight truncate">
                    {formatZodiacName(profile.zodiacSign)}
                  </div>
                  <div className="text-[9.5px] text-stone-500 font-medium truncate mt-0.5">
                    Vedic astrological sign
                  </div>
                </div>

                {/* 3. Consultations Card */}
                <div
                  onClick={() => setActiveTab('consultations')}
                  className={`p-3 rounded-2xl bg-white/95 border border-stone-200/80 shadow-xs hover:shadow-sm hover:border-amber-300 transition-all flex flex-col justify-between cursor-pointer group ${
                    activeTab === 'consultations' ? 'ring-2 ring-rose-500/20 border-rose-300' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold text-stone-600 tracking-wide uppercase truncate">
                      Consultations
                    </span>
                    <div className="w-6 h-6 rounded-lg bg-rose-50 border border-rose-200/70 text-[#5B0D15] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                      <Compass className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl font-serif font-black text-[#3B1E22] tracking-tight truncate">
                    {bookings.length}
                  </div>
                  <div className="text-[9.5px] text-stone-500 font-medium truncate mt-0.5">
                    Sacred bookings
                  </div>
                </div>

                {/* 4. Orders Card */}
                <div
                  onClick={() => setActiveTab('orders')}
                  className={`p-3 rounded-2xl bg-white/95 border border-stone-200/80 shadow-xs hover:shadow-sm hover:border-amber-300 transition-all flex flex-col justify-between cursor-pointer group ${
                    activeTab === 'orders' ? 'ring-2 ring-blue-500/20 border-blue-300' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold text-stone-600 tracking-wide uppercase truncate">
                      Store Orders
                    </span>
                    <div className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-200/70 text-blue-700 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                      <ShoppingCart className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl font-serif font-black text-[#3B1E22] tracking-tight truncate">
                    {orders.length}
                  </div>
                  <div className="text-[9.5px] text-stone-500 font-medium truncate mt-0.5">
                    Energized artifacts
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-stone-200 gap-2 sm:gap-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('profile')}
                className={`pb-3 px-2 text-xs sm:text-sm font-semibold transition-all relative whitespace-nowrap cursor-pointer ${
                  activeTab === 'profile'
                    ? 'text-[#5B0D15]'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Birth Details &amp; Profile
                {activeTab === 'profile' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#5B0D15] rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('wallet')}
                className={`pb-3 px-2 text-xs sm:text-sm font-semibold transition-all relative whitespace-nowrap cursor-pointer ${
                  activeTab === 'wallet'
                    ? 'text-[#5B0D15]'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Spiritual Wallet &amp; Ledger ({txTotal})
                {activeTab === 'wallet' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#5B0D15] rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('consultations')}
                className={`pb-3 px-2 text-xs sm:text-sm font-semibold transition-all relative whitespace-nowrap cursor-pointer ${
                  activeTab === 'consultations'
                    ? 'text-[#5B0D15]'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Consultations &amp; Bookings
                {activeTab === 'consultations' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#5B0D15] rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`pb-3 px-2 text-xs sm:text-sm font-semibold transition-all relative whitespace-nowrap cursor-pointer ${
                  activeTab === 'orders'
                    ? 'text-[#5B0D15]'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Astro Store Orders
                {activeTab === 'orders' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#5B0D15] rounded-full" />
                )}
              </button>
            </div>

            {/* TAB CONTENT 1: PROFILE DETAILS */}
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Personal Information Card */}
                <div className="md:col-span-2 p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-stone-200/80 shadow-sm space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                    <div>
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-[#3B1E22]">
                        Vedic Birth Chart Parameters
                      </h3>
                      <p className="text-xs text-stone-500">
                        Essential celestial coordinates used to generate Janam Kundli and horoscope predictions.
                      </p>
                    </div>
                    <button
                      onClick={() => setEditModalOpen(true)}
                      className="text-xs font-bold text-[#5B0D15] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Full Name</span>
                      <p className="text-sm font-semibold text-[#3B1E22]">{profile.name}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Email Address</span>
                      <p className="text-sm font-semibold text-[#3B1E22] flex items-center gap-1.5">
                        {profile.email}
                        <span title="Verified & Protected" className="text-emerald-600">
                          <ShieldCheck className="w-4 h-4" />
                        </span>
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Date of Birth</span>
                      <p className="text-sm font-semibold text-[#3B1E22] flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-amber-700" />
                        {profile.dateOfBirth || 'Not specified'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Time of Birth</span>
                      <p className="text-sm font-semibold text-[#3B1E22] flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-700" />
                        {profile.timeOfBirth || 'Not specified'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Place of Birth</span>
                      <p className="text-sm font-semibold text-[#3B1E22] flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-amber-700" />
                        {profile.placeOfBirth || 'Not specified'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Rashi / Zodiac Sign</span>
                      <p className="text-sm font-semibold text-[#5B0D15] font-bold flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        {profile.zodiacSign || 'Aries'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account Security & Spiritual Status Card */}
                <div className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-stone-200/80 shadow-sm space-y-5">
                  <h3 className="font-serif text-lg font-bold text-[#3B1E22] pb-3 border-b border-stone-100">
                    Account Security
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="text-stone-500 mb-0.5">Assigned Security Role</div>
                      <div className="font-bold text-[#3B1E22]">{profile.role}</div>
                    </div>

                    <div>
                      <div className="text-stone-500 mb-0.5">Account Status</div>
                      <div className="font-bold text-emerald-700 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        {profile.status}
                      </div>
                    </div>

                    <div>
                      <div className="text-stone-500 mb-0.5">Password Security</div>
                      <div className="text-stone-600">Encrypted with bcrypt (10 rounds)</div>
                    </div>

                    <div className="pt-2">
                      <Link
                        href="/appointment"
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 text-[#5B0D15] font-bold text-xs border border-amber-300/70 hover:bg-amber-100/60 transition-colors block text-center"
                      >
                        Book Vedic Consultation →
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Recent Sacred Activity Showcase */}
                <div className="md:col-span-3 p-5 sm:p-6 rounded-2xl bg-white/90 backdrop-blur-xl border border-stone-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
                    <div>
                      <h3 className="font-serif text-base sm:text-lg font-bold text-[#3B1E22] flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>Recent Consecrated Services &amp; Sacred Orders</span>
                      </h3>
                      <p className="text-xs text-stone-500">
                        Quick glimpse of your active consultations and sacred artifacts.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Latest Consultation Preview */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/60 via-white to-orange-50/30 border border-amber-200/70 space-y-2.5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5 text-amber-700" />
                            <span>Recent Consultation</span>
                          </span>
                          {bookings.length > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              {bookings[0].status}
                            </span>
                          )}
                        </div>

                        {bookings.length > 0 ? (
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                bookings[0].serviceImage ||
                                SERVICES_CATALOGUE.find(
                                  (s) =>
                                    s.id === bookings[0].serviceId ||
                                    s.title.toLowerCase() === (bookings[0].serviceTitle || '').toLowerCase()
                                )?.image ||
                                '/services/consultation.jpg'
                              }
                              alt="Recent service"
                              className="w-12 h-12 rounded-lg object-cover border border-amber-300 shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="font-bold text-[#3B1E22] text-xs sm:text-sm truncate">
                                {bookings[0].serviceTitle}
                              </h4>
                              <p className="text-xs text-stone-600 flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3 text-amber-700" />
                                <span>{bookings[0].scheduledDate} at {bookings[0].scheduledTime} IST</span>
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="py-2 text-stone-500 text-xs">
                            No consultation bookings yet. Book a session with our Kashi astrologers.
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-amber-100/80 flex items-center justify-between">
                        {bookings.length > 0 ? (
                          <button
                            onClick={() => setActiveTab('consultations')}
                            className="text-xs font-bold text-[#5B0D15] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>View All Bookings ({bookings.length})</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <Link
                            href="/appointment"
                            className="text-xs font-bold text-[#5B0D15] hover:underline flex items-center gap-1"
                          >
                            <span>Book Consultation →</span>
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Latest Order Preview */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50/40 via-white to-amber-50/30 border border-amber-200/70 space-y-2.5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#800000] flex items-center gap-1.5">
                            <ShoppingCart className="w-3.5 h-3.5 text-[#800000]" />
                            <span>Recent Store Order</span>
                          </span>
                          {orders.length > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                              {orders[0].status}
                            </span>
                          )}
                        </div>

                        {orders.length > 0 ? (
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                orders[0].items?.[0]?.product?.image ||
                                (orders[0].items?.[0]?.product?.name?.toLowerCase().includes('pyrite')
                                  ? '/products/prod-pyrite.png'
                                  : orders[0].items?.[0]?.product?.name?.toLowerCase().includes('tourmaline')
                                  ? '/products/prod-black-tourmaline.png'
                                  : '/products/tiger_eye_bracelet.jpg')
                              }
                              alt="Recent order"
                              className="w-12 h-12 rounded-lg object-cover border border-amber-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="font-bold text-[#3B1E22] text-xs sm:text-sm truncate">
                                {orders[0].items?.[0]?.product?.name || `Order #${orders[0].orderNumber || orders[0].id.slice(0, 8)}`}
                              </h4>
                              <p className="text-xs text-stone-600 flex items-center gap-1 mt-0.5 font-semibold text-[#5B0D15]">
                                Total: ₹{Number(orders[0].totalAmount).toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="py-2 text-stone-500 text-xs">
                            No store orders yet. Browse authentic consecrated Rudrakshas and Yantras.
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-rose-100/80 flex items-center justify-between">
                        {orders.length > 0 ? (
                          <button
                            onClick={() => setActiveTab('orders')}
                            className="text-xs font-bold text-[#5B0D15] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>View All Orders ({orders.length})</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <Link
                            href="/products"
                            className="text-xs font-bold text-[#5B0D15] hover:underline flex items-center gap-1"
                          >
                            <span>Visit Astro Store →</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: WALLET & TRANSACTIONS */}
            {activeTab === 'wallet' && (
              <div className="space-y-6">
                {/* Spiritual Wallet Highlight Box */}
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#5B0D15] via-[#6F101A] to-[#3B1E22] text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 relative z-10">
                    <div className="flex items-center gap-2 text-amber-300 text-xs uppercase font-bold tracking-widest">
                      <Wallet className="w-4 h-4" />
                      <span>Sacred Celestial Wallet</span>
                    </div>
                    <div className="text-3xl sm:text-5xl font-black text-amber-200 tracking-tight">
                      ₹{wallet?.walletBalance ?? profile.walletBalance}.00
                    </div>
                    <p className="text-xs text-stone-300 max-w-md leading-relaxed">
                      Use spiritual wallet credits toward Janam Kundli charts, matchmaking, tarot analysis, and consecrated temple poojas.
                    </p>
                  </div>

                  <div className="relative z-10 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={loadData}
                      className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refresh Balance</span>
                    </button>
                  </div>
                </div>

                {/* Ledger Table */}
                <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-stone-200/80 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#3B1E22]">
                        Spiritual Credit Ledger &amp; Audit Trail
                      </h3>
                      <p className="text-xs text-stone-500">
                        Transparent transaction records including credit recharges, booking payments, and refunds.
                      </p>
                    </div>
                    <div className="text-xs font-semibold text-stone-500">
                      Total: {txTotal} entries
                    </div>
                  </div>

                  {txLoading ? (
                    <div className="p-12 text-center text-stone-500 text-xs animate-pulse">
                      Loading ledger records...
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="p-12 text-center text-stone-500 text-xs">
                      No ledger transactions found for this spiritual account.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                            <th className="py-3 px-6">Date &amp; Time</th>
                            <th className="py-3 px-6">Type</th>
                            <th className="py-3 px-6">Description</th>
                            <th className="py-3 px-6 text-right">Amount</th>
                            <th className="py-3 px-6 text-right">Balance After</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-amber-50/30 transition-colors">
                              <td className="py-3.5 px-6 font-medium text-stone-600">
                                {new Date(tx.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </td>
                              <td className="py-3.5 px-6">
                                <span
                                  className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                                    tx.type === 'CREDIT'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                                  }`}
                                >
                                  {tx.type}
                                </span>
                              </td>
                              <td className="py-3.5 px-6 font-medium text-[#3B1E22]">{tx.description}</td>
                              <td
                                className={`py-3.5 px-6 font-bold text-right ${
                                  tx.type === 'CREDIT' ? 'text-emerald-700' : 'text-rose-700'
                                }`}
                              >
                                {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount}
                              </td>
                              <td className="py-3.5 px-6 font-semibold text-right text-stone-700">
                                ₹{tx.balanceAfter}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination */}
                  {txTotalPages > 1 && (
                    <div className="p-4 border-t border-stone-100 flex items-center justify-between">
                      <button
                        disabled={txPage <= 1}
                        onClick={() => fetchTransactions(txPage - 1)}
                        className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-600 disabled:opacity-40 hover:bg-stone-50 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4 inline" /> Previous
                      </button>
                      <span className="text-xs text-stone-500 font-medium">
                        Page {txPage} of {txTotalPages}
                      </span>
                      <button
                        disabled={txPage >= txTotalPages}
                        onClick={() => fetchTransactions(txPage + 1)}
                        className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-600 disabled:opacity-40 hover:bg-stone-50 cursor-pointer"
                      >
                        Next <ChevronRight className="w-4 h-4 inline" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: CONSULTATIONS & APPOINTMENTS */}
            {activeTab === 'consultations' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-[#3B1E22]">
                      Sacred Vedic Consultations &amp; Video Sessions
                    </h3>
                    <p className="text-xs text-stone-500">
                      Manage your upcoming 1-on-1 consultations with verified Kashi astrologers, join video meetings, and review past sessions.
                    </p>
                  </div>
                  <Link
                    href="/appointment"
                    className="px-5 py-2.5 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    <span>Book New Session</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {bookingsLoading ? (
                  <div className="p-12 text-center text-stone-500 text-xs animate-pulse">
                    Loading booked consultations...
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl bg-white/80 border border-amber-200/80 shadow-sm space-y-4">
                    <Compass className="w-12 h-12 text-amber-700/60 mx-auto" />
                    <div className="space-y-1">
                      <h4 className="font-serif text-base font-bold text-[#3B1E22]">
                        No Scheduled Consultations Found
                      </h4>
                      <p className="text-xs text-stone-500 max-w-sm mx-auto">
                        You have not scheduled any Vedic consultations yet. Connect with our expert pandits for Kundli analysis, career, and marriage guidance.
                      </p>
                    </div>
                    <Link
                      href="/appointment"
                      className="inline-block px-6 py-2.5 rounded-full bg-[#5B0D15] text-white font-semibold text-xs shadow-sm hover:bg-[#480a11] transition-all"
                    >
                      Browse Astrologers &amp; Book
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="p-5 sm:p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                                {booking.category || 'Vedic Astrology'}
                              </span>
                              <h4 className="font-serif text-base font-bold text-[#3B1E22] mt-1.5">
                                {booking.serviceTitle}
                              </h4>
                            </div>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                                booking.status === 'CONFIRMED'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : booking.status === 'PENDING'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-stone-100 text-stone-700 border border-stone-300'
                              }`}
                            >
                              {booking.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 bg-stone-50/70 p-3 rounded-2xl border border-stone-100">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-amber-700" />
                              <span>{booking.scheduledDate}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-amber-700" />
                              <span>{booking.scheduledTime} IST</span>
                            </div>
                          </div>

                          {booking.notes && (
                            <p className="text-xs text-stone-500 italic bg-amber-50/40 p-2.5 rounded-xl border border-amber-100">
                              &ldquo;{booking.notes}&rdquo;
                            </p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3 flex-wrap">
                          <span className="text-xs font-bold text-[#5B0D15]">
                            Fee: ₹{booking.fee || 1500}
                          </span>

                          {booking.meetingLink ? (
                            <a
                              href={booking.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                            >
                              <span>Join Video Meeting</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <span className="text-[11px] text-stone-400 font-medium">
                              Meeting link will appear 15m prior
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 4: ASTRO STORE ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-[#3B1E22]">
                      Astro Store Orders &amp; Consecrated Artifacts
                    </h3>
                    <p className="text-xs text-stone-500">
                      Track the energization, consecration, and doorstep dispatch of your sacred gemstones, bracelets, and yantras.
                    </p>
                  </div>
                  <Link
                    href="/products"
                    className="px-5 py-2.5 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    <span>Browse Astro Store</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {ordersLoading ? (
                  <div className="p-12 text-center text-stone-500 text-xs animate-pulse">
                    Loading your store orders...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl bg-white/80 border border-amber-200/80 shadow-sm space-y-4">
                    <ShoppingCart className="w-12 h-12 text-amber-700/60 mx-auto" />
                    <div className="space-y-1">
                      <h4 className="font-serif text-base font-bold text-[#3B1E22]">
                        No Store Orders Placed Yet
                      </h4>
                      <p className="text-xs text-stone-500 max-w-sm mx-auto">
                        Explore our collection of authentic Mukhi Rudrakshas, consecrated Pyrite &amp; Tourmaline bracelets, and energized Sampoorna Yantras.
                      </p>
                    </div>
                    <Link
                      href="/products"
                      className="inline-block px-6 py-2.5 rounded-full bg-[#5B0D15] text-white font-semibold text-xs shadow-sm hover:bg-[#480a11] transition-all"
                    >
                      Visit Sacred Store
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {orders.map((order) => {
                      const firstItem = order.items?.[0];
                      const totalItems = order.items?.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0) || 1;
                      const orderNum = order.orderNumber || order.id?.slice(0, 8) || 'AVD-ORD';
                      const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      });

                      const statusColors: Record<string, string> = {
                        PENDING: 'bg-amber-100 text-amber-900 border-amber-300',
                        PROCESSING: 'bg-blue-100 text-blue-900 border-blue-300',
                        SHIPPED: 'bg-indigo-100 text-indigo-900 border-indigo-300',
                        DELIVERED: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                        CANCELLED: 'bg-rose-100 text-rose-900 border-rose-300',
                      };

                      return (
                        <div
                          key={order.id}
                          className="p-5 sm:p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                                  #{orderNum}
                                </span>
                                <h4 className="font-serif text-base font-bold text-[#3B1E22] mt-1.5 flex items-center gap-1.5">
                                  <span>{firstItem?.product?.name || 'Vedic Artifact'}</span>
                                  {totalItems > 1 && (
                                    <span className="text-xs font-normal text-stone-500">
                                      +{totalItems - 1} more
                                    </span>
                                  )}
                                </h4>
                              </div>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 border ${
                                  statusColors[order.status] || 'bg-stone-100 text-stone-700 border-stone-300'
                                }`}
                              >
                                {order.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 bg-stone-50/70 p-3 rounded-2xl border border-stone-100">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                <span className="truncate">{formattedDate}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Truck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                <span className="truncate">{order.deliveryStatus || 'In Dispatch'}</span>
                              </div>
                            </div>

                            <div className="text-xs text-stone-600 space-y-1 bg-amber-50/30 p-3 rounded-2xl border border-amber-100/70">
                              <div className="flex justify-between">
                                <span className="text-stone-500">Destination:</span>
                                <span className="font-semibold text-stone-800 text-right truncate max-w-[180px]">
                                  {order.shippingAddress?.city
                                    ? `${order.shippingAddress.city}, ${order.shippingAddress.postalCode || ''}`
                                    : 'Registered Address'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-stone-500">Payment:</span>
                                <span className="font-semibold text-emerald-800 uppercase text-[11px]">
                                  {order.paymentMethod || 'Online'} • {order.paymentStatus || 'Paid'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                            <span className="text-sm font-black text-[#5B0D15]">
                              Total: ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                            </span>

                            <button
                              onClick={() => {
                                const phone = '919999999999';
                                const msg = encodeURIComponent(
                                  `Namaste AstroVD Support, I would like to inquire about my order #${orderNum}.`
                                );
                                window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
                              }}
                              className="px-3.5 py-1.5 rounded-full border border-stone-300 hover:border-emerald-500 text-stone-700 hover:text-emerald-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Track on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">Track</span>
                            </button>
                            <Link
                              href="/products"
                              className="flex-1 py-2 px-2.5 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1"
                            >
                              <span>Shop Store</span>
                              <ArrowRight className="w-3 h-3 text-amber-300" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* EDIT PROFILE MODAL */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-white/95 backdrop-blur-2xl border border-amber-200/90 shadow-2xl p-6 sm:p-8 space-y-5 text-[#3B1E22]">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-serif text-xl font-bold text-[#3B1E22]">
                Update Birth Profile
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {profileMsg && (
              <div
                className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                  profileMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {profileMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white/80 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  placeholder="Your full name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editDob}
                    onChange={(e) => setEditDob(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white/80 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Time of Birth</label>
                  <input
                    type="time"
                    value={editTob}
                    onChange={(e) => setEditTob(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white/80 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Place of Birth</label>
                <input
                  type="text"
                  value={editPob}
                  onChange={(e) => setEditPob(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white/80 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  placeholder="City, State, Country"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Zodiac Sun Sign (Rashi)</label>
                <select
                  value={editZodiac}
                  onChange={(e) => setEditZodiac(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white/80 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer"
                >
                  {zodiacSigns.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-stone-300 text-stone-600 text-xs font-semibold hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Auth Modal for Login */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={() => loadData()}
      />

      <Footer />
    </div>
  );
}
