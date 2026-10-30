'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';
import { getAuthToken, getStoredUser, performLogout } from '../../lib/auth';
import { AuthModal } from '../../components/AuthModal';
import {
  Home,
  Calendar,
  Package,
  Compass,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Sparkles,
  Lock,
  RefreshCw,
  ShoppingBag,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
<<<<<<< HEAD
=======
import { SERVICES_CATALOGUE, formatGoogleMeetLink, getMeetingTimeStatus } from '../../data/servicesData';
>>>>>>> e9f558bf120eca6a6a8c150bcdc56dad70fea398

import { UserProfile, WalletData, Transaction, DashboardTab, getUserInitials } from './types';
import { formatGoogleMeetLink, getCombinedOrders, getCombinedBookings } from './utils';

<<<<<<< HEAD
import DashboardOverviewTab from './components/DashboardOverviewTab';
import DashboardBookingsTab from './components/DashboardBookingsTab';
import DashboardOrdersTab from './components/DashboardOrdersTab';
import DashboardKundliTab from './components/DashboardKundliTab';
import DashboardSettingsTab from './components/DashboardSettingsTab';

export default function DashboardPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  // Tab State
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  // Core Data States
=======
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



function getCombinedOrders(backendOrders: any[] = []): any[] {
  let localOrders: any[] = [];
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('astro_placed_orders');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          localOrders = parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse astro_placed_orders:', e);
    }
  }

  const seenIds = new Set<string>();
  const combined: any[] = [];

  // Local/recent orders first so newest orders show at top
  for (const o of localOrders) {
    const key = o.orderNumber || o.id;
    if (key && !seenIds.has(key)) {
      seenIds.add(key);
      combined.push(o);
    }
  }

  // Then backend orders
  for (const o of backendOrders) {
    const key = o.orderNumber || o.id;
    if (key && !seenIds.has(key)) {
      seenIds.add(key);
      combined.push(o);
    }
  }

  return combined;
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((v) => v + 1), 30000);
    return () => clearInterval(timer);
  }, []);
  const [activeTab, setActiveTab] = useState<'profile' | 'consultations' | 'orders'>('profile');
>>>>>>> e9f558bf120eca6a6a8c150bcdc56dad70fea398
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Modals & UI States
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [editKundliModalOpen, setEditKundliModalOpen] = useState(false);

  // Edit Kundli Form Fields
  const [editName, setEditName] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editTob, setEditTob] = useState('');
  const [editPob, setEditPob] = useState('');
  const [editZodiac, setEditZodiac] = useState('');
  const [savingKundli, setSavingKundli] = useState(false);
  const [kundliMsg, setKundliMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearDashboardData = () => {
    setProfile(null);
    setWallet(null);
    setTransactions([]);
    setBookings([]);
    setOrders([]);
  };

  const loadDashboardData = useCallback(async () => {
    const token = getAuthToken();
    const stored = getStoredUser();

    if (!token) {
      // Local fallback for guest order review & saved consultations
      let localOrders: any[] = [];
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('astro_placed_orders');
          if (raw) localOrders = JSON.parse(raw);
        } catch (e) {}
      }

      setBookings(getCombinedBookings([]));
      setOrders(getCombinedOrders(localOrders));

      if (stored) {
        setProfile(stored);
      } else if (localOrders && localOrders.length > 0) {
        setProfile({
          id: 'guest-seeker',
          name: localOrders[0]?.shippingAddress?.recipient || 'Valued Seeker',
          email: 'seeker@astrovd.com',
          role: 'USER',
          status: 'ACTIVE',
          walletBalance: 0,
          createdAt: new Date().toISOString(),
        });
      }
      setLoading(false);
      setBookingsLoading(false);
      setOrdersLoading(false);
      return;
    }

    setLoading(true);
    setBookingsLoading(true);
    setOrdersLoading(true);
<<<<<<< HEAD
=======

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

        // Safeguard: Ensure we never overwrite the authenticated user's real identity with dummy fallback data
        const isDummyFallback = profData.name === 'Aarav Sharma' || profData.email === 'celestial@universe.com';
        const finalProfile = isDummyFallback && stored
          ? {
              ...profData,
              name: stored.name || profData.name,
              email: stored.email || profData.email,
            }
          : profData;

        setProfile(finalProfile);
        setWallet({
          walletBalance: finalProfile.walletBalance ?? stored?.walletBalance ?? 0,
          currency: 'INR',
          currencySymbol: '₹',
        });
        setEditName(finalProfile.name || '');
        setEditDob(finalProfile.dateOfBirth || '');
        setEditTob(finalProfile.timeOfBirth || '');
        setEditPob(finalProfile.placeOfBirth || '');
        setEditZodiac(finalProfile.zodiacSign || 'Aries');
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
      let backendList: any[] = [];
      if (ordersRes.ok) {
        const oData = await ordersRes.json();
        backendList = Array.isArray(oData) ? oData : oData.orders || [];
      }
      setOrders(getCombinedOrders(backendList));
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.error('Error fetching dashboard data:', err);
      }
      setOrders((prev) => getCombinedOrders(prev));
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

>>>>>>> e9f558bf120eca6a6a8c150bcdc56dad70fea398
    setTxLoading(true);

    try {
      // 1. Fetch User Profile
      const userRes = await fetch(`${backendUrl}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userRes.ok) {
        const uData = await userRes.json();
        const u = uData.user || uData;
        setProfile(u);
        setEditName(u.name || '');
        setEditDob(u.dateOfBirth || '');
        setEditTob(u.timeOfBirth || '');
        setEditPob(u.placeOfBirth || '');
        setEditZodiac(u.zodiacSign || '');
      } else if (stored) {
        setProfile(stored);
      }

      // 2. Fetch Wallet Balance
      try {
        const wRes = await fetch(`${backendUrl}/api/wallet/balance`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (wRes.ok) {
          const wData = await wRes.json();
          setWallet(wData);
        }
      } catch (e) {}

      // 3. Fetch Transactions
      try {
        const txRes = await fetch(`${backendUrl}/api/wallet/transactions?page=1&limit=20`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (txRes.ok) {
          const txData = await txRes.json();
          setTransactions(txData.transactions || []);
        }
      } catch (e) {}

      // 4. Fetch Consultation Bookings (Primary: /api/appointments/my-bookings)
      try {
        let bRes = await fetch(`${backendUrl}/api/appointments/my-bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!bRes.ok) {
          bRes = await fetch(`${backendUrl}/api/bookings/my`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
        if (bRes.ok) {
          const bData = await bRes.json();
          const list = Array.isArray(bData) ? bData : (bData.bookings || []);
          setBookings(getCombinedBookings(list));
        } else {
          setBookings(getCombinedBookings([]));
        }
      } catch (e) {
        setBookings(getCombinedBookings([]));
      }

      // 5. Fetch Orders (Primary: /api/orders/my-orders)
      try {
        let oRes = await fetch(`${backendUrl}/api/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!oRes.ok) {
          oRes = await fetch(`${backendUrl}/api/orders/my`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
        if (oRes.ok) {
          const oData = await oRes.json();
          const backendOrders = Array.isArray(oData) ? oData : (oData.orders || []);
          setOrders(getCombinedOrders(backendOrders));
        } else {
          setOrders(getCombinedOrders([]));
        }
      } catch (e) {
        setOrders(getCombinedOrders([]));
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
      setBookingsLoading(false);
      setOrdersLoading(false);
      setTxLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    loadDashboardData();

    // Query string tab sync
    if (typeof window !== 'undefined') {
      const search = new URLSearchParams(window.location.search);
      const tabParam = search.get('tab') as DashboardTab | null;
      if (tabParam && ['overview', 'consultations', 'orders', 'kundli', 'settings'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }

    const handleAuthChange = () => {
      const token = getAuthToken();
      if (!token) {
        clearDashboardData();
        router.replace('/login?redirect=/dashboard');
      } else {
        loadDashboardData();
      }
    };

    window.addEventListener('astro-auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('astro-auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [loadDashboardData, router]);

  const handleLogout = async () => {
    clearDashboardData();
    await performLogout({ notifyServer: true, redirectUrl: '/login' });
  };

  const handleUpdateProfile = async (updated: Partial<UserProfile>): Promise<boolean> => {
    const token = getAuthToken();
    if (!token) return false;

    try {
      const res = await fetch(`${backendUrl}/api/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        localStorage.setItem('astro_user', JSON.stringify(data.user));
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const handleSaveKundli = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingKundli(true);
    setKundliMsg(null);

    const success = await handleUpdateProfile({
      name: editName,
      dateOfBirth: editDob,
      timeOfBirth: editTob,
      placeOfBirth: editPob,
      zodiacSign: editZodiac,
    });

    setSavingKundli(false);
    if (success) {
      setKundliMsg({ type: 'success', text: t('Birth coordinates updated successfully!', 'जन्म विवरण सफलतापूर्वक सहेजा गया!') });
      setTimeout(() => {
        setEditKundliModalOpen(false);
        setKundliMsg(null);
      }, 1200);
    } else {
      setKundliMsg({ type: 'error', text: t('Failed to update coordinates.', 'विवरण सहेजने में त्रुटि हुई।') });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col text-[#3B1E22] selection:bg-amber-400">
      {/* Unauthenticated State */}
      {!loading && !profile && (
        <main className="max-w-xl mx-auto my-auto p-8 sm:p-12 text-center rounded-3xl bg-white border border-stone-200/80 shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#5B0D15] to-[#7B121C] text-amber-200 flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#3B1E22]">
              {t('Sign In to Your Sanctuary Desk', 'साधक कक्ष में प्रवेश करें')}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
              {t(
                'Please sign in to view your verified Janam Kundli, access video consultation passes, and track orders.',
                'अपनी जन्म कुंडली देखने एवं परामर्श सत्रों में सम्मिलित होने हेतु लॉगिन करें।'
              )}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-8 py-3 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-white font-bold text-xs shadow-lg shadow-rose-950/20 transition-all cursor-pointer"
            >
              {t('Sign In / Register', 'लॉगिन / पंजीकरण')}
            </button>
            <Link
              href="/"
              className="px-6 py-3 rounded-full border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs transition-all"
            >
              {t('Return Home', 'मुख्य पृष्ठ')}
            </Link>
          </div>
        </main>
      )}

      {/* Authenticated Dashboard: Cohesive Vedic Seeker Portal */}
      {profile && (
        <div className="flex-1 flex min-h-screen relative bg-[#F8F5EE] font-['Assistant',system-ui,-apple-system,sans-serif]">
          {/* ===================== 1. FIXED LEFT SIDEBAR (DESKTOP) ===================== */}
          <aside className="hidden md:flex w-64 bg-white text-stone-700 flex-col shrink-0 border-r border-stone-200/80 select-none fixed top-0 bottom-0 left-0 z-30 h-screen overflow-hidden shadow-2xs">
            {/* Logo & Portal Badge */}
            <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-col gap-1.5">
              <Link href="/" title="Return to AstroVD Homepage" className="flex items-center group">
                <Image
                  src="/astro-vd-logo.png"
                  alt="AstroVD"
                  width={150}
                  height={38}
                  priority
                  className="h-8 sm:h-9 w-auto object-contain hover:opacity-95 transition-opacity"
                />
              </Link>
              <div className="pt-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 inline-flex items-center gap-1">
                  🔱 {t('Sacred Seeker Portal', 'साधक डैशबोर्ड')}
                </span>
              </div>
            </div>

            {/* Navigation Groups Container */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
              {/* Main: Dashboard Overview */}
              <div>
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-gradient-to-r from-amber-500/12 via-rose-500/6 to-transparent text-[#5B0D15] border-l-[3px] border-[#5B0D15] font-bold shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50/80 font-medium'
                  }`}
                >
                  <Home className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'overview' ? 'text-[#5B0D15]' : 'text-stone-400'}`} />
                  <span>{t('Dashboard Overview', 'डैशबोर्ड अवलोकन')}</span>
                </button>
              </div>

              {/* Group 1: SERVICES & CONSULTATIONS */}
              <div>
                <div className="px-3 mb-1 text-[10px] font-bold tracking-wider text-amber-900/60 uppercase">
                  {t('Consultations', 'परामर्श सेवा')}
                </div>
                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('consultations')}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                      activeTab === 'consultations'
                        ? 'bg-gradient-to-r from-amber-500/12 via-rose-500/6 to-transparent text-[#5B0D15] border-l-[3px] border-[#5B0D15] font-bold shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50/80 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'consultations' ? 'text-[#5B0D15]' : 'text-stone-400'}`} />
                      <span>{t('My Consultations', 'मेरे परामर्श')}</span>
                    </div>
                    {bookings.length > 0 && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        activeTab === 'consultations'
                          ? 'bg-[#5B0D15] text-white shadow-2xs'
                          : 'bg-stone-100 text-stone-600'
                      }`}>
                        {bookings.length}
                      </span>
                    )}
                  </button>

<<<<<<< HEAD
=======
              {/* Quick Metrics Bar */}
              <div className="flex gap-2.5 sm:gap-3 items-stretch shrink-0">
                {/* Consultations Card */}
                <div
                  onClick={() => setActiveTab('consultations')}
                  className={`w-36 sm:w-44 p-3 rounded-2xl bg-white/95 border border-stone-200/80 shadow-xs hover:shadow-sm hover:border-amber-300 transition-all flex flex-col justify-between cursor-pointer group ${
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
                  className={`w-36 sm:w-44 p-3 rounded-2xl bg-white/95 border border-stone-200/80 shadow-xs hover:shadow-sm hover:border-amber-300 transition-all flex flex-col justify-between cursor-pointer group ${
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
                <div className="md:col-span-3 p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-stone-200/80 shadow-sm space-y-6">
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
                      className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50/70 hover:bg-amber-100/80 text-[#5B0D15] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Edit Kundli Profile</span>
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
                  </div>
                </div>

                {/* Recent Sacred Activity Showcase */}
                <div className="md:col-span-3 p-5 sm:p-6 rounded-2xl bg-white/90 backdrop-blur-xl border border-stone-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
                    <div>
                      <h3 className="font-serif text-base sm:text-lg font-bold text-[#3B1E22] flex items-center gap-2">
                        <Compass className="w-4 h-4 text-amber-600" />
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
                          1-on-1 Vedic Consultations
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
                        <span>Book Your Sacred Consultation</span>
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
                                    {booking.category || 'Vedic Astrology'}
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
                                {isConfirmed && (() => {
                                  const meetStatus = getMeetingTimeStatus(
                                    booking.scheduledDate,
                                    booking.scheduledTime,
                                    booking.durationMinutes || 30
                                  );
                                  const canonicalMeetLink = formatGoogleMeetLink(booking.meetLink || booking.id);

                                  return (
                                    <>
                                      {meetStatus.isJoinable ? (
                                        <a
                                          href={canonicalMeetLink}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-900/20 hover:shadow-lg transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer animate-pulse"
                                        >
                                          <Video className="w-4 h-4" />
                                          <span>Join Google Meet Now</span>
                                        </a>
                                      ) : (
                                        <button
                                          type="button"
                                          disabled
                                          className="px-4 py-2.5 rounded-full bg-stone-200 text-stone-500 font-bold text-xs flex items-center gap-1.5 cursor-not-allowed border border-stone-300"
                                          title={
                                            meetStatus.hasEnded
                                              ? 'Consultation session has ended'
                                              : 'Google Meet link unlocks 5 minutes before scheduled session'
                                          }
                                        >
                                          <Lock className="w-3.5 h-3.5 text-stone-400" />
                                          <span>
                                            {meetStatus.hasEnded ? 'Session Concluded' : 'Opens 5m Before Session'}
                                          </span>
                                        </button>
                                      )}

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
                                  );
                                })()}

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
>>>>>>> e9f558bf120eca6a6a8c150bcdc56dad70fea398
                  <Link
                    href="/appointment"
                    className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50/80 transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-stone-400 shrink-0" />
                    <span>{t('Book Astrologer', 'परामर्श बुक करें')}</span>
                  </Link>
                </div>
              </div>

              {/* Group 2: SACRED STORE */}
              <div>
                <div className="px-3 mb-1 text-[10px] font-bold tracking-wider text-amber-900/60 uppercase">
                  {t('Sacred Store', 'वैदिक स्टोर')}
                </div>
                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                      activeTab === 'orders'
                        ? 'bg-gradient-to-r from-amber-500/12 via-rose-500/6 to-transparent text-[#5B0D15] border-l-[3px] border-[#5B0D15] font-bold shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50/80 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Package className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'orders' ? 'text-[#5B0D15]' : 'text-stone-400'}`} />
                      <span>{t('My Orders', 'मेरे ऑर्डर्स')}</span>
                    </div>
                    {orders.length > 0 && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        activeTab === 'orders'
                          ? 'bg-[#5B0D15] text-white shadow-2xs'
                          : 'bg-stone-100 text-stone-600'
                      }`}>
                        {orders.length}
                      </span>
                    )}
                  </button>

                  <Link
                    href="/products"
                    className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50/80 transition-all"
                  >
                    <ShoppingBag className="w-4 h-4 text-stone-400 shrink-0" />
                    <span>{t('Consecrated Store', 'सिद्ध उत्पाद स्टोर')}</span>
                  </Link>
                </div>
              </div>

              {/* Group 3: VEDIC ASTROLOGY */}
              <div>
                <div className="px-3 mb-1 text-[10px] font-bold tracking-wider text-amber-900/60 uppercase">
                  {t('Kundli & Charts', 'कुंडली एवं पंचांग')}
                </div>
                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('kundli')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                      activeTab === 'kundli'
                        ? 'bg-gradient-to-r from-amber-500/12 via-rose-500/6 to-transparent text-[#5B0D15] border-l-[3px] border-[#5B0D15] font-bold shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50/80 font-medium'
                    }`}
                  >
                    <Compass className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'kundli' ? 'text-[#5B0D15]' : 'text-stone-400'}`} />
                    <span>{t('Janam Kundli', 'जन्म कुंडली')}</span>
                  </button>
                </div>
              </div>

              {/* Group 4: PREFERENCES */}
              <div>
                <div className="px-3 mb-1 text-[10px] font-bold tracking-wider text-amber-900/60 uppercase">
                  {t('Preferences', 'सेटिंग्स')}
                </div>
                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                      activeTab === 'settings'
                        ? 'bg-gradient-to-r from-amber-500/12 via-rose-500/6 to-transparent text-[#5B0D15] border-l-[3px] border-[#5B0D15] font-bold shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50/80 font-medium'
                    }`}
                  >
                    <Settings className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'settings' ? 'text-[#5B0D15]' : 'text-stone-400'}`} />
                    <span>{t('Account Settings', 'खाता सेटिंग्स')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar Footer: User Identity & Sign Out */}
            <div className="p-3.5 border-t border-stone-100 bg-stone-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5B0D15] to-[#7B121C] text-amber-200 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-300/60 shadow-2xs">
                  {getUserInitials(profile.name)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-stone-800 truncate">{profile.name}</div>
                  <div className="text-[10px] text-stone-500 truncate">{profile.email}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title={t('Sign Out', 'लॉगआउट')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </aside>

          {/* ===================== 2. MOBILE SIDEBAR DRAWER ===================== */}
          {mobileSidebarOpen && (
            <div className="fixed inset-0 z-50 md:hidden flex">
              <div
                onClick={() => setMobileSidebarOpen(false)}
                className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs"
              />
              <div className="relative w-64 max-w-[80vw] bg-white text-stone-700 flex flex-col h-full shadow-2xl z-10 font-['Assistant',system-ui,-apple-system,sans-serif]">
                <div className="p-4 flex items-center justify-between border-b border-stone-200">
                  <Image
                    src="/astro-vd-logo.png"
                    alt="AstroVD"
                    width={130}
                    height={32}
                    className="h-7 w-auto object-contain"
                  />
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                  <button
                    onClick={() => {
                      setActiveTab('overview');
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
                      activeTab === 'overview'
                        ? 'bg-gradient-to-r from-amber-500/12 via-rose-500/6 to-transparent text-[#5B0D15] border-l-[3px] border-[#5B0D15] font-bold'
                        : 'text-stone-600 hover:bg-stone-50 font-medium'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    <span>{t('Dashboard Overview', 'डैशबोर्ड अवलोकन')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('consultations');
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
                      activeTab === 'consultations'
                        ? 'bg-gradient-to-r from-amber-500/12 via-rose-500/6 to-transparent text-[#5B0D15] border-l-[3px] border-[#5B0D15] font-bold'
                        : 'text-stone-600 hover:bg-stone-50 font-medium'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>{t('My Consultations', 'मेरे परामर्श')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('orders');
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
                      activeTab === 'orders'
                        ? 'bg-gradient-to-r from-amber-500/12 via-rose-500/6 to-transparent text-[#5B0D15] border-l-[3px] border-[#5B0D15] font-bold'
                        : 'text-stone-600 hover:bg-stone-50 font-medium'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    <span>{t('My Orders', 'मेरे ऑर्डर्स')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('kundli');
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
                      activeTab === 'kundli'
                        ? 'bg-gradient-to-r from-amber-500/12 via-rose-500/6 to-transparent text-[#5B0D15] border-l-[3px] border-[#5B0D15] font-bold'
                        : 'text-stone-600 hover:bg-stone-50 font-medium'
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                    <span>{t('Janam Kundli', 'जन्म कुंडली')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
                      activeTab === 'settings'
                        ? 'bg-gradient-to-r from-amber-500/12 via-rose-500/6 to-transparent text-[#5B0D15] border-l-[3px] border-[#5B0D15] font-bold'
                        : 'text-stone-600 hover:bg-stone-50 font-medium'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    <span>{t('Account Settings', 'खाता सेटिंग्स')}</span>
                  </button>
                </div>

                <div className="p-3 border-t border-stone-200">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('Sign Out', 'लॉगआउट')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================== 3. MAIN DASHBOARD CONTENT AREA ===================== */}
          <div className="flex-1 md:pl-64 flex flex-col min-h-screen w-full bg-[#F8F5EE]">
            {/* Top Navigation Bar with Connected Breadcrumb & Pill Search */}
            <header className="h-16 sm:h-20 px-4 sm:px-8 bg-white/95 backdrop-blur-md border-b border-stone-200/80 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(true)}
                  className="md:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 cursor-pointer"
                  aria-label="Open sidebar menu"
                >
                  <Menu className="w-5 h-5" />
                </button>

                {/* Section Breadcrumb connecting Left Sidebar to Right Canvas */}
                <div className="hidden sm:flex items-center gap-2 text-xs">
                  <span className="text-stone-400 font-medium">{t('Portal', 'साधक कक्ष')}</span>
                  <span className="text-stone-300 font-normal">/</span>
                  <span className="font-bold text-stone-900 text-sm sm:text-base tracking-tight flex items-center gap-1.5">
                    {activeTab === 'overview' && t('Dashboard Overview', 'डैशबोर्ड अवलोकन')}
                    {activeTab === 'consultations' && t('My Consultations', 'परामर्श सत्र')}
                    {activeTab === 'orders' && t('Sacred Orders', 'पावन ऑर्डर्स')}
                    {activeTab === 'kundli' && t('Janam Kundli', 'जन्म कुंडली')}
                    {activeTab === 'settings' && t('Account Settings', 'खाता सेटिंग्स')}
                  </span>
                </div>
              </div>

              {/* Global Search Bar (Pill style matching admin) */}
              <div className="flex-1 max-w-xl mx-2 sm:mx-6 relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder={t('Search consultations, orders, services...', 'परामर्श, ऑर्डर्स खोजें...')}
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#F4F5F7] border border-stone-200/60 focus:border-amber-400 focus:bg-white outline-none transition-all placeholder:text-stone-400"
                />
              </div>

              {/* Right Header Items: Notifications & User Profile */}
              <div className="flex items-center gap-4">
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="w-10 h-10 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-600 relative cursor-pointer transition-colors"
                    title={t('Notifications', 'सूचनाएं')}
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'UPCOMING').length > 0 && (
                      <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-[#E11D48] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                        {bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'UPCOMING').length}
                      </span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-stone-200 p-4 z-30 space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                        <span className="text-xs font-bold text-stone-900">{t('Notifications', 'सूचनाएं')}</span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {t('Live Updates', 'सक्रिय')}
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs max-h-72 overflow-y-auto">
                        {bookings.slice(0, 3).map((b, idx) => (
                          <div
                            key={b.id || idx}
                            onClick={() => {
                              setActiveTab('consultations');
                              setNotificationsOpen(false);
                            }}
                            className="p-2.5 rounded-xl cursor-pointer border border-transparent hover:bg-stone-50 transition-all flex items-start gap-2.5"
                          >
                            <span className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-[#E11D48]" />
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-stone-900 truncate">
                                {b.serviceType || t('Consultation Scheduled', 'परामर्श सत्र')}
                              </div>
                              <div className="text-[11px] text-stone-500 truncate">
                                {b.bookingDate} {b.bookingTime ? `• ${b.bookingTime}` : ''}
                              </div>
                            </div>
                          </div>
                        ))}
                        {bookings.length === 0 && (
                          <p className="text-stone-400 text-center py-4 text-xs">
                            {t('No new notifications', 'कोई नई सूचना नहीं है')}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Badge (Initials in dark maroon circle, Name, Role 'Seeker / Devotee', ChevronDown) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-stone-50 transition-all cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#5B0D15] text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                      {getUserInitials(profile.name)}
                    </div>
                    <div className="text-left hidden sm:block leading-tight">
                      <div className="text-sm font-bold text-stone-900">
                        {(profile.name || 'User').trim().split(' ')[0]}
                      </div>
                      <div className="text-[11px] text-stone-400 font-normal">
                        User
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-xl border border-stone-200 py-1.5 z-30 text-xs text-stone-700 animate-fadeIn">
                      <div className="px-4 py-2 border-b border-stone-100">
                        <div className="font-bold text-stone-900 truncate">{profile.name}</div>
                        <div className="text-[10px] text-stone-400 truncate">{profile.email || 'seeker@astrovd.com'}</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('kundli');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 hover:bg-stone-50 flex items-center gap-2 text-left cursor-pointer"
                      >
                        <Compass className="w-3.5 h-3.5 text-amber-700" />
                        <span>{t('Janam Kundli', 'जन्म कुंडली')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('settings');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 hover:bg-stone-50 flex items-center gap-2 text-left cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5 text-stone-500" />
                        <span>{t('Account Settings', 'खाता सेटिंग्स')}</span>
                      </button>

                      <div className="my-1 border-t border-stone-100" />

                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 text-left font-medium cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t('Sign Out', 'लॉगआउट')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Dashboard Inner Canvas Container */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {activeTab === 'overview' && (
                <DashboardOverviewTab
                  profile={profile}
                  bookings={bookings}
                  orders={orders}
                  onTabChange={(tab) => setActiveTab(tab)}
                  onEditKundli={() => setEditKundliModalOpen(true)}
                  formatGoogleMeetLink={formatGoogleMeetLink}
                  t={t}
                />
              )}

              {activeTab === 'consultations' && (
                <DashboardBookingsTab
                  bookings={bookings}
                  bookingsLoading={bookingsLoading}
                  profile={profile}
                  onOpenEditProfile={() => setEditKundliModalOpen(true)}
                  t={t}
                />
              )}

              {activeTab === 'orders' && (
                <DashboardOrdersTab
                  orders={orders}
                  ordersLoading={ordersLoading}
                  t={t}
                />
              )}

              {activeTab === 'kundli' && (
                <DashboardKundliTab
                  profile={profile}
                  onEditKundli={() => setEditKundliModalOpen(true)}
                  t={t}
                />
              )}

              {activeTab === 'settings' && (
                <DashboardSettingsTab
                  profile={profile}
                  onUpdateProfile={handleUpdateProfile}
                  t={t}
                />
              )}
            </main>
          </div>
        </div>
      )}

      {/* Edit Kundli Coordinates Modal */}
      {editKundliModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-stone-200 shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-700" />
                <h3 className="font-serif text-lg font-bold text-[#3B1E22]">
                  {t('Edit Janam Kundli Coordinates', 'जन्म कुंडली विवरण संशोधित करें')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditKundliModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {kundliMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  kundliMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {kundliMsg.text}
              </div>
            )}

            <form onSubmit={handleSaveKundli} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-600 block mb-1">
                  {t('Full Name (as per Janam Kundli)', 'पूरा नाम')}
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:border-amber-400 focus:bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-stone-600 block mb-1">
                    {t('Date of Birth', 'जन्म तिथि')}
                  </label>
                  <input
                    type="date"
                    value={editDob}
                    onChange={(e) => setEditDob(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:border-amber-400 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-600 block mb-1">
                    {t('Time of Birth (IST)', 'जन्म समय')}
                  </label>
                  <input
                    type="time"
                    value={editTob}
                    onChange={(e) => setEditTob(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:border-amber-400 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-stone-600 block mb-1">
                    {t('Place of Birth (City / Town)', 'जन्म स्थान (शहर)')}
                  </label>
                  <input
                    type="text"
                    value={editPob}
                    onChange={(e) => setEditPob(e.target.value)}
                    placeholder="e.g. Varanasi, UP"
                    required
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:border-amber-400 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-600 block mb-1">
                    {t('Zodiac Sign / Rashi', 'राशि')}
                  </label>
                  <select
                    value={editZodiac}
                    onChange={(e) => setEditZodiac(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:border-amber-400 focus:bg-white outline-none cursor-pointer"
                  >
                    <option value="">{t('Select Rashi...', 'राशि चुनें...')}</option>
                    <option value="Aries">Aries (मेष)</option>
                    <option value="Taurus">Taurus (वृषभ)</option>
                    <option value="Gemini">Gemini (मिथुन)</option>
                    <option value="Cancer">Cancer (कर्क)</option>
                    <option value="Leo">Leo (सिंह)</option>
                    <option value="Virgo">Virgo (कन्या)</option>
                    <option value="Libra">Libra (तुला)</option>
                    <option value="Scorpio">Scorpio (वृश्चिक)</option>
                    <option value="Sagittarius">Sagittarius (धनु)</option>
                    <option value="Capricorn">Capricorn (मकर)</option>
                    <option value="Aquarius">Aquarius (कुंभ)</option>
                    <option value="Pisces">Pisces (मीन)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditKundliModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-stone-100 text-stone-600 text-xs font-semibold"
                >
                  {t('Cancel', 'रद्द करें')}
                </button>
                <button
                  type="submit"
                  disabled={savingKundli}
                  className="px-6 py-2 rounded-full bg-[#5B0D15] hover:bg-[#72111c] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                >
                  {savingKundli ? t('Updating...', 'अपडेट हो रहा है...') : t('Save Coordinates', 'सहेजें')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auth Modal if unauthenticated user clicks to login */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={() => {
          setAuthModalOpen(false);
          loadDashboardData();
        }}
      />
    </div>
  );
}
