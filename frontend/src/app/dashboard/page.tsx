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
  Video,
  Phone,
  Star,
  Download,
  FileText,
  Check,
  Award,
  X,
  BookOpen,
  Quote,
  Loader2,
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

function formatGoogleMeetLink(bookingId: string): string {
  if (bookingId && bookingId.startsWith('https://meet.google.com/')) {
    return bookingId;
  }
  const sanitized = (bookingId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const numToLetter: Record<string, string> = {
    '0': 'a', '1': 'b', '2': 'c', '3': 'd', '4': 'e',
    '5': 'f', '6': 'g', '7': 'h', '8': 'i', '9': 'j',
  };
  let letters = sanitized
    .split('')
    .map((ch) => numToLetter[ch] || ch)
    .join('');
  while (letters.length < 10) {
    letters += 'avd';
  }
  const p1 = letters.slice(0, 3);
  const p2 = letters.slice(3, 7);
  const p3 = letters.slice(7, 10);
  return `https://meet.google.com/${p1}-${p2}-${p3}`;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'consultations' | 'orders'>('profile');
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

  // Consultations View State
  const [consultationFilter, setConsultationFilter] = useState<'all' | 'upcoming' | 'completed' | 'pending'>('all');
  const [selectedRemedyBooking, setSelectedRemedyBooking] = useState<any | null>(null);

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

    const handleTabChange = (e?: any) => {
      const tab = e?.detail || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') : null);
      if (
        tab === 'consultations' ||
        tab === 'orders' ||
        tab === 'profile'
      ) {
        setActiveTab(tab as any);
      }
    };

    window.addEventListener('astro-auth-change', handleAuthChange);
    window.addEventListener('astro-tab-change', handleTabChange);
    window.addEventListener('popstate', handleTabChange);
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      window.removeEventListener('astro-auth-change', handleAuthChange);
      window.removeEventListener('astro-tab-change', handleTabChange);
      window.removeEventListener('popstate', handleTabChange);
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
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 items-stretch">
                {/* 1. Zodiac Sign Card */}
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

            {/* TAB CONTENT: CONSULTATIONS & APPOINTMENTS (COMPLETELY REDESIGNED) */}
            {activeTab === 'consultations' && (
              <div className="space-y-6 animate-fadeIn">
                {/* 1. Sacred Consultations Header Card */}
                <div
                  className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#4A0A12] via-[#5B0D15] to-[#2B050B] text-white relative overflow-hidden shadow-xl border border-amber-500/30"
                  style={{
                    boxShadow: '0 20px 45px -10px rgba(91, 13, 21, 0.35)',
                  }}
                >
                  <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold uppercase tracking-widest">
                          ✨ 1-on-1 Vedic Consultations
                        </span>
                        <span className="text-[11px] text-amber-200/80">Kashi Jyotish Parampara</span>
                      </div>
                      <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-amber-100">
                        My Sacred Consultations &amp; Guidance
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-200/90 leading-relaxed">
                        Manage your live video sessions with Dr. Pandit Vishal Dubey and Varanasi certified scholars. Access meeting rooms, review horoscopic recordings, and follow personalized Vedic prescriptions.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                      <button
                        onClick={loadData}
                        className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-amber-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        title="Refresh consultation status"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Refresh</span>
                      </button>

                      <Link
                        href="/appointment"
                        className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#4A0A12] font-black text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <span>+ Book New Consultation</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* 2. Key Metrics Summary Strip */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="p-4 rounded-2xl bg-white/95 border border-stone-200/80 shadow-xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center justify-center shrink-0">
                      <Compass className="w-5 h-5 text-[#5B0D15]" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Total Bookings</div>
                      <div className="text-xl font-serif font-black text-[#3B1E22]">{bookings.length}</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/95 border border-stone-200/80 shadow-xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/60 flex items-center justify-center shrink-0">
                      <Video className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Upcoming / Confirmed</div>
                      <div className="text-xl font-serif font-black text-emerald-700">
                        {bookings.filter((b) => b.status === 'CONFIRMED').length}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/95 border border-stone-200/80 shadow-xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 border border-blue-200/60 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-blue-700" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Completed Sessions</div>
                      <div className="text-xl font-serif font-black text-blue-700">
                        {bookings.filter((b) => b.status === 'COMPLETED').length}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/95 border border-stone-200/80 shadow-xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-800 border border-rose-200/60 flex items-center justify-center shrink-0">
                      <Wallet className="w-5 h-5 text-[#5B0D15]" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Astro Credits</div>
                      <div className="text-xl font-serif font-black text-[#5B0D15]">
                        ₹{profile?.walletBalance ?? 150}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Filter Navigation Tabs */}
                <div className="flex items-center justify-between border-b border-stone-200/80 pb-3 flex-wrap gap-3">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={() => setConsultationFilter('all')}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        consultationFilter === 'all'
                          ? 'bg-[#5B0D15] text-white shadow-xs'
                          : 'bg-stone-100 hover:bg-stone-200/70 text-stone-600'
                      }`}
                    >
                      All ({bookings.length})
                    </button>
                    <button
                      onClick={() => setConsultationFilter('upcoming')}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        consultationFilter === 'upcoming'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      Upcoming ({bookings.filter((b) => b.status === 'CONFIRMED').length})
                    </button>
                    <button
                      onClick={() => setConsultationFilter('completed')}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        consultationFilter === 'completed'
                          ? 'bg-blue-700 text-white shadow-xs'
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-800'
                      }`}
                    >
                      Completed ({bookings.filter((b) => b.status === 'COMPLETED').length})
                    </button>
                    <button
                      onClick={() => setConsultationFilter('pending')}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        consultationFilter === 'pending'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-800'
                      }`}
                    >
                      Reviewing ({bookings.filter((b) => b.status === 'PENDING').length})
                    </button>
                  </div>

                  <span className="text-[11px] font-medium text-stone-500">
                    Live video meeting links activate 15 minutes before scheduled slot.
                  </span>
                </div>

                {/* 4. Bookings List / Filtered Grid */}
                {bookingsLoading ? (
                  <div className="p-16 text-center rounded-3xl bg-white/80 border border-stone-200/80 shadow-xs space-y-3">
                    <Loader2 className="w-8 h-8 text-amber-700 animate-spin mx-auto" />
                    <p className="text-xs text-stone-600 font-medium">Loading your sacred consultations...</p>
                  </div>
                ) : bookings.length === 0 ? (
                  /* 5. Inspiring Empty State */
                  <div className="p-8 sm:p-12 text-center rounded-3xl bg-white/95 border-2 border-amber-200/80 shadow-md space-y-6 max-w-3xl mx-auto">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-rose-100 border-2 border-amber-300 text-[#5B0D15] flex items-center justify-center mx-auto shadow-inner">
                      <Compass className="w-8 h-8 text-[#5B0D15]" />
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-serif text-xl sm:text-2xl font-bold text-[#3B1E22]">
                        No Vedic Consultations Scheduled Yet
                      </h4>
                      <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
                        Connect 1-on-1 with Dr. Pandit Vishal Dubey (Jyotishacharya, Varanasi) to unlock profound insights regarding your career trajectory, marital harmony, Shani Sade Sati, and planetary remedies.
                      </p>
                    </div>

                    {/* 3 Core Benefits Showcase */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                      <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                        <div className="w-7 h-7 rounded-lg bg-amber-200/60 text-amber-900 flex items-center justify-center mb-2 font-bold text-xs">
                          1
                        </div>
                        <h5 className="font-serif font-bold text-xs text-[#3B1E22]">100% Confidential</h5>
                        <p className="text-[11px] text-stone-600 mt-1 leading-snug">
                          Private, encrypted video session with dedicated birth chart audit.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                        <div className="w-7 h-7 rounded-lg bg-amber-200/60 text-amber-900 flex items-center justify-center mb-2 font-bold text-xs">
                          2
                        </div>
                        <h5 className="font-serif font-bold text-xs text-[#3B1E22]">Tailored Remedies</h5>
                        <p className="text-[11px] text-stone-600 mt-1 leading-snug">
                          Specific Beej Mantras, fasting dates, and energized gemstone guidance.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                        <div className="w-7 h-7 rounded-lg bg-amber-200/60 text-amber-900 flex items-center justify-center mb-2 font-bold text-xs">
                          3
                        </div>
                        <h5 className="font-serif font-bold text-xs text-[#3B1E22]">Lifetime PDF &amp; Video</h5>
                        <p className="text-[11px] text-stone-600 mt-1 leading-snug">
                          Receive recorded session download and certified remedial prescription.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link
                        href="/appointment"
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Book Your First Consultation (₹500 Welcome Bonus)</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* 6. Active Bookings Grid */
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                    {bookings
                      .filter((b) => {
                        if (consultationFilter === 'upcoming') return b.status === 'CONFIRMED';
                        if (consultationFilter === 'completed') return b.status === 'COMPLETED';
                        if (consultationFilter === 'pending') return b.status === 'PENDING';
                        return true;
                      })
                      .map((booking) => {
                        const isConfirmed = booking.status === 'CONFIRMED';
                        const isCompleted = booking.status === 'COMPLETED';
                        const isPending = booking.status === 'PENDING';

                        return (
                          <div
                            key={booking.id}
                            className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border-2 border-amber-200/80 shadow-md hover:shadow-xl hover:border-amber-400 transition-all duration-300 flex flex-col justify-between space-y-5"
                          >
                            {/* Card Top: Category, Status & ID */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100/80 text-amber-900 border border-amber-300/70">
                                    ✨ {booking.category || 'Vedic Astrology'}
                                  </span>
                                  <span className="text-[11px] font-mono font-bold text-stone-400">
                                    #{booking.id}
                                  </span>
                                </div>

                                {/* Status Badge with pulse dot */}
                                <div className="flex items-center">
                                  {isConfirmed && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                                      Confirmed &amp; Scheduled
                                    </span>
                                  )}
                                  {isCompleted && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300 shadow-2xs">
                                      <Check className="w-3.5 h-3.5 text-blue-700" />
                                      Completed &amp; Prescribed
                                    </span>
                                  )}
                                  {isPending && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                                      Reviewing Janam Kundli
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Service Title */}
                              <h4 className="font-serif text-lg sm:text-xl font-bold text-[#3B1E22] leading-snug">
                                {booking.serviceTitle || 'Comprehensive Horoscope Consultation'}
                              </h4>

                              {/* Astrologer Profile Strip */}
                              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-amber-50/60 border border-amber-200/60">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#5B0D15] to-[#3B1E22] text-amber-200 font-bold flex items-center justify-center text-xs shrink-0 ring-2 ring-amber-300/50">
                                  VD
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-bold text-[#3B1E22] truncate">
                                    {booking.astrologerName || 'Dr. Pandit Vishal Dubey (Jyotishacharya)'}
                                  </div>
                                  <div className="text-[10px] text-stone-500 truncate">
                                    Banaras Hindu University • 25+ Years Experience
                                  </div>
                                </div>
                                <span className="px-2 py-0.5 rounded-md bg-white border border-amber-200 text-[10px] font-bold text-[#5B0D15] shrink-0">
                                  Verified
                                </span>
                              </div>

                              {/* Timing & Schedule Box */}
                              <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50/90 p-3 rounded-2xl border border-stone-200/80">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
                                  <div>
                                    <div className="text-[9px] uppercase font-bold text-stone-400">Date</div>
                                    <div className="font-semibold text-stone-800">
                                      {new Date(booking.scheduledDate).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                      })}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                                  <div>
                                    <div className="text-[9px] uppercase font-bold text-stone-400">Time &amp; Zone</div>
                                    <div className="font-semibold text-stone-800">
                                      {booking.scheduledTime} IST (30 Mins)
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Seeker's Questions / Notes Box */}
                              {booking.notes && (
                                <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50/70 via-rose-50/40 to-amber-50/60 border border-amber-200/70 space-y-1">
                                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-900">
                                    <Quote className="w-3 h-3 text-amber-700" />
                                    <span>Seeker's Consultation Topic:</span>
                                  </div>
                                  <p className="text-xs text-stone-700 italic leading-relaxed pl-4">
                                    &ldquo;{booking.notes}&rdquo;
                                  </p>
                                </div>
                              )}

                              {/* If completed: Prescribed Remedies Preview Box */}
                              {isCompleted && booking.remedyNotes && (
                                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-900">
                                      <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                                      <span>Vedic Remedies Prescribed:</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                                      Active Protocol
                                    </span>
                                  </div>
                                  <p className="text-xs text-stone-700 line-clamp-2 leading-relaxed">
                                    {booking.remedyNotes}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Card Footer: Fee & Interactive CTAs */}
                            <div className="pt-4 border-t border-stone-200/80 flex items-center justify-between gap-3 flex-wrap">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-stone-400 block">Consultation Fee</span>
                                <span className="text-sm font-black text-[#5B0D15]">
                                  ₹{booking.fee || 2100}{' '}
                                  <span className="text-[10px] font-normal text-stone-500">Paid in full</span>
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                {isConfirmed && (
                                  <>
                                    <a
                                      href={booking.meetLink && booking.meetLink.includes('meet.google.com') ? booking.meetLink : formatGoogleMeetLink(booking.id)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-900/20 hover:shadow-lg transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                                    >
                                      <Video className="w-4 h-4" />
                                      <span>Join Google Meet</span>
                                    </a>

                                    <a
                                      href={`https://wa.me/919826012345?text=${encodeURIComponent(
                                        `Hello AstroVD, regarding my consultation #${booking.id} on ${booking.scheduledDate} with ${booking.astrologerName || 'Panditji'}.`
                                      )}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-2.5 rounded-full bg-stone-100 hover:bg-emerald-50 text-stone-600 hover:text-emerald-700 border border-stone-200 transition-colors"
                                      title="WhatsApp AstroVD Support"
                                    >
                                      <MessageCircle className="w-4 h-4" />
                                    </a>
                                  </>
                                )}

                                {isCompleted && (
                                  <>
                                    <button
                                      onClick={() => setSelectedRemedyBooking(booking)}
                                      className="px-4 py-2 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-white font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <FileText className="w-3.5 h-3.5 text-amber-300" />
                                      <span>View Prescription</span>
                                    </button>

                                    <Link
                                      href="/appointment"
                                      className="px-3.5 py-2 rounded-full border border-stone-300 hover:border-amber-400 bg-white hover:bg-amber-50 text-xs font-semibold text-stone-700 hover:text-[#5B0D15] transition-colors"
                                    >
                                      Follow-up →
                                    </Link>
                                  </>
                                )}

                                {isPending && (
                                  <button
                                    onClick={() => setEditModalOpen(true)}
                                    className="px-4 py-2 rounded-full border border-amber-300 bg-amber-50 hover:bg-amber-100 text-xs font-semibold text-amber-900 transition-colors"
                                  >
                                    Verify Birth Details
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* 7. Vedic Remedy Prescription Modal */}
                {selectedRemedyBooking && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
                    onClick={() => setSelectedRemedyBooking(null)}
                  >
                    <div
                      className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border-2 border-amber-300/80 space-y-6 max-h-[90vh] overflow-y-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Modal Header with Varanasi Seal */}
                      <div className="flex items-start justify-between border-b border-amber-200/80 pb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider border border-amber-300/60">
                              🔱 Kashi Jyotish Prescription
                            </span>
                            <span className="text-xs font-mono text-stone-400">
                              #{selectedRemedyBooking.id}
                            </span>
                          </div>
                          <h4 className="font-serif text-xl font-bold text-[#3B1E22]">
                            {selectedRemedyBooking.serviceTitle}
                          </h4>
                          <p className="text-xs text-stone-500">
                            Prescribed by {selectedRemedyBooking.astrologerName} on{' '}
                            {selectedRemedyBooking.scheduledDate}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedRemedyBooking(null)}
                          className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Seeker Info Strip */}
                      <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-stone-400 block">Seeker Name</span>
                          <span className="font-semibold text-stone-800">{selectedRemedyBooking.customerName || profile?.name}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-stone-400 block">Contact Phone</span>
                          <span className="font-semibold text-stone-800">{selectedRemedyBooking.contactPhone}</span>
                        </div>
                      </div>

                      {/* Prescribed Remedies Content */}
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                          <h5 className="font-serif font-bold text-sm text-emerald-950 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-700" />
                            <span>Vedic Astrological Recommendations</span>
                          </h5>
                          <p className="text-xs text-stone-700 whitespace-pre-line leading-relaxed">
                            {selectedRemedyBooking.remedyNotes ||
                              '1. Recite Om Namo Bhagavate Vasudevaya 108 times daily during sunrise.\n2. Wear 8mm Natural Yellow Sapphire (Pukhraj) on index finger or wrist for Jupiter alignment.\n3. Observe fasting on Shukla Paksha Ekadashi.'}
                          </p>
                        </div>

                        {/* Direct Astro Store Gemstone CTA */}
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300 flex items-center justify-between gap-4">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-[#5B0D15]">Energized Gemstones Available</span>
                            <p className="text-[11px] text-stone-600">
                              Order 100% natural, consecrated bracelets &amp; yantras directly from our Astro Store.
                            </p>
                          </div>
                          <Link
                            href="/products"
                            onClick={() => setSelectedRemedyBooking(null)}
                            className="px-4 py-2 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-white font-bold text-xs shrink-0 shadow-sm"
                          >
                            Browse Store →
                          </Link>
                        </div>
                      </div>

                      {/* Modal Footer */}
                      <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                        <span className="text-[11px] text-stone-400 italic">
                          Blessed by Dr. Pandit Vishal Dubey, Varanasi
                        </span>
                        <button
                          onClick={() => window.print()}
                          className="px-4 py-2 rounded-full border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-stone-700 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Print Prescription</span>
                        </button>
                      </div>
                    </div>
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
