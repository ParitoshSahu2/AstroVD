'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';
import { getAuthToken, getStoredUser, performLogout } from '../../lib/auth';
import { AuthModal } from '../../components/AuthModal';
import { useScrollLock } from '../../lib/scrollLock';
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
  Lock,
  RefreshCw,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';

import { UserProfile, WalletData, Transaction, DashboardTab, getUserInitials } from './types';
import { formatGoogleMeetLink, getCombinedOrders, getCombinedBookings } from './utils';

import DashboardOverviewTab from './components/DashboardOverviewTab';
import DashboardBookingsTab from './components/DashboardBookingsTab';
import DashboardOrdersTab from './components/DashboardOrdersTab';
import DashboardSettingsTab from './components/DashboardSettingsTab';

export default function DashboardPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  // Tab State
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  // Core Data States
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

  // Lock body scroll and prevent background scroll chaining for dashboard overlays
  useScrollLock(mobileSidebarOpen);

  useEffect(() => {
    if (!mobileSidebarOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (mobileSidebarOpen) setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileSidebarOpen]);


  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearDashboardData = () => {
    setProfile(null);
    setWallet(null);
    setTransactions([]);
    setBookings([]);
    setOrders([]);
  };

  const loadDashboardData = useCallback(async (isSilent = false) => {
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

    if (!isSilent) {
      setLoading(true);
      setBookingsLoading(true);
      setOrdersLoading(true);
      setTxLoading(true);
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Parallel data fetching for instant response across all widgets
      const [userSettled, walletSettled, txSettled, bookingsSettled, ordersSettled] = await Promise.allSettled([
        fetch(`${backendUrl}/api/users/me`, { headers }),
        fetch(`${backendUrl}/api/users/me/wallet`, { headers }),
        fetch(`${backendUrl}/api/users/me/wallet/transactions?page=1&limit=20`, { headers }),
        fetch(`${backendUrl}/api/appointments/my-bookings`, { headers }),
        fetch(`${backendUrl}/api/orders/my-orders`, { headers }),
      ]);

      // 1. User Profile
      if (userSettled.status === 'fulfilled' && userSettled.value.ok) {
        try {
          const uData = await userSettled.value.json();
          const u = uData.user || uData;
          setProfile(u);
        } catch (e) {
          if (stored) setProfile(stored);
        }
      } else if (stored) {
        setProfile(stored);
      }

      // 2. Wallet Balance
      if (walletSettled.status === 'fulfilled' && walletSettled.value.ok) {
        try {
          const wData = await walletSettled.value.json();
          setWallet(wData);
        } catch (e) {}
      }

      // 3. Transactions
      if (txSettled.status === 'fulfilled' && txSettled.value.ok) {
        try {
          const txData = await txSettled.value.json();
          setTransactions(txData.transactions || []);
        } catch (e) {}
      }
      setTxLoading(false);

      // 4. Consultation Bookings
      if (bookingsSettled.status === 'fulfilled' && bookingsSettled.value.ok) {
        try {
          const bData = await bookingsSettled.value.json();
          const list = Array.isArray(bData) ? bData : (bData.bookings || []);
          setBookings(getCombinedBookings(list));
        } catch (e) {
          setBookings(getCombinedBookings([]));
        }
      } else {
        try {
          const altRes = await fetch(`${backendUrl}/api/bookings/my`, { headers });
          if (altRes.ok) {
            const bData = await altRes.json();
            const list = Array.isArray(bData) ? bData : (bData.bookings || []);
            setBookings(getCombinedBookings(list));
          } else {
            setBookings(getCombinedBookings([]));
          }
        } catch (e) {
          setBookings(getCombinedBookings([]));
        }
      }
      setBookingsLoading(false);

      // 5. Orders
      if (ordersSettled.status === 'fulfilled' && ordersSettled.value.ok) {
        try {
          const oData = await ordersSettled.value.json();
          const backendOrders = Array.isArray(oData) ? oData : (oData.orders || []);
          setOrders(getCombinedOrders(backendOrders));
        } catch (e) {
          setOrders(getCombinedOrders([]));
        }
      } else {
        try {
          const altRes = await fetch(`${backendUrl}/api/orders/my`, { headers });
          if (altRes.ok) {
            const oData = await altRes.json();
            const backendOrders = Array.isArray(oData) ? oData : (oData.orders || []);
            setOrders(getCombinedOrders(backendOrders));
          } else {
            setOrders(getCombinedOrders([]));
          }
        } catch (e) {
          setOrders(getCombinedOrders([]));
        }
      }
      setOrdersLoading(false);
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
      if (tabParam && ['overview', 'consultations', 'orders', 'settings'].includes(tabParam)) {
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

    // Live polling: auto-refresh dashboard data every 10 seconds so customer sees admin stage changes live
    const pollInterval = setInterval(() => {
      const token = getAuthToken();
      if (token) {
        loadDashboardData(true);
      }
    }, 10000);

    return () => {
      window.removeEventListener('astro-auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
      clearInterval(pollInterval);
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
                'Please sign in to manage your consultation bookings, access video consultation passes, and track orders.',
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

      {/* Authenticated Dashboard: Sacred Seeker Portal */}
      {profile && (
        <div className="flex-1 flex min-h-screen relative bg-[#F8F5EE]">
          {/* ===================== 1. DESKTOP SIDEBAR (Admin-Styled Aesthetic) ===================== */}
          {/* ===================== 1. DESKTOP SIDEBAR (Admin-Styled Aesthetic) ===================== */}
          <aside
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            className="hidden md:flex flex-col w-64 bg-white border-r border-stone-200/90 h-screen fixed left-0 top-0 z-30 shadow-2xs select-none"
          >
            {/* Top Logo & Title */}
            <div className="p-4 sm:p-5 border-b border-stone-150 flex items-center justify-between shrink-0">
              <Link
                href="/"
                title="Return to AstroVD Homepage"
                className="flex items-center group transition-all"
              >
                <Image
                  src="/astro-vd-logo.png"
                  alt="AstroVD"
                  width={150}
                  height={38}
                  priority
                  className="h-8 sm:h-9 w-auto object-contain hover:opacity-95 transition-opacity"
                />
              </Link>
            </div>

            {/* Nav Groups Container - fully scrollable with mouse wheel */}
            <div
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              className="flex-1 overflow-y-auto p-3.5 space-y-4 overscroll-contain select-none"
            >
              {/* Active Top Navigation: Dashboard */}
              <div>
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-[#FDF2F4] text-[#8B1D2C]'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <Home className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'overview' ? 'text-[#8B1D2C]' : 'text-stone-400'}`} />
                  <span>{t('Dashboard', 'डैशबोर्ड')}</span>
                </button>
              </div>

              {/* Group 1: BOOKINGS & ORDERS */}
              <div>
                <div className="px-3 mb-1.5 text-[10px] font-bold tracking-wider text-stone-400 uppercase">
                  {t('Bookings', 'बुकिंग्स')}
                </div>
                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('consultations')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      activeTab === 'consultations'
                        ? 'bg-[#FDF2F4] text-[#8B1D2C] font-semibold'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'consultations' ? 'text-[#8B1D2C]' : 'text-stone-400'}`} />
                      <span>{t('My Consultations', 'मेरे परामर्श')}</span>
                    </div>
                    {bookings.length > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        activeTab === 'consultations'
                          ? 'bg-[#8B1D2C] text-white shadow-2xs'
                          : 'bg-stone-100 text-stone-600'
                      }`}>
                        {bookings.length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      activeTab === 'orders'
                        ? 'bg-[#FDF2F4] text-[#8B1D2C] font-semibold'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Package className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'orders' ? 'text-[#8B1D2C]' : 'text-stone-400'}`} />
                      <span>{t('My Orders', 'मेरे ऑर्डर्स')}</span>
                    </div>
                    {orders.length > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        activeTab === 'orders'
                          ? 'bg-[#8B1D2C] text-white shadow-2xs'
                          : 'bg-stone-100 text-stone-600'
                      }`}>
                        {orders.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>




              {/* Group 5: SETTINGS */}
              <div>
                <div className="px-3 mb-1.5 text-[10px] font-bold tracking-wider text-stone-400 uppercase">
                  {t('Settings', 'सेटिंग्स')}
                </div>
                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      activeTab === 'settings'
                        ? 'bg-[#FDF2F4] text-[#8B1D2C] font-semibold'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                    }`}
                  >
                    <Settings className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'settings' ? 'text-[#8B1D2C]' : 'text-stone-400'}`} />
                    <span>{t('Account Settings', 'खाता सेटिंग्स')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar Footer with Subtle Lotus and Quote (Matching Admin) */}
            <div className="p-4 border-t border-stone-150 flex flex-col items-center justify-center text-center bg-stone-50/40">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-amber-500/70 mb-1">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M12 3c-1.2 2.5-3 5-3 7 0 1.66 1.34 3 3 3s3-1.34 3-3c0-2-1.8-4.5-3-7zm-4.5 5.5c-.8 1.8-1.5 3.8-1.5 5.5 0 2.21 1.79 4 4 4 .7 0 1.35-.18 1.93-.5-1.42-.8-2.43-2.28-2.43-4 0-1.85.9-3.45 2.1-4.4-.7-.4-2.5-.9-4.1-.6zm9 0c-1.6-.3-3.4.2-4.1.6 1.2.95 2.1 2.55 2.1 4.4 0 1.72-1.01 3.2-2.43 4 .58.32 1.23.5 1.93.5 2.21 0 4-1.79 4-4 0-1.7-.7-3.7-1.5-5.5zM6.5 16.5c-1.5 0-2.5 1-2.5 2 0 1.1 1.4 2 3 2 1.5 0 2.5-.5 3-1-.5-.5-1.5-1-2.5-1-.4 0-.8.05-1 .1.2-.5.5-.9 1-1.2-.4-.6-.8-.9-1-.9zm11 0c-.2 0-.6.3-1 .9.5.3.8.7 1 1.2-.2-.05-.6-.1-1-.1-1 0-2 .5-2.5 1 .5.5 1.5 1 3 1 1.6 0 3-.9 3-2 0-1-1-2-2.5-2z"/>
                </svg>
              </div>
              <p className="text-[11px] text-stone-400 font-serif leading-tight">
                Spiritual Solutions<br />for a Better Tomorrow
              </p>
            </div>
          </aside>

          {/* ===================== 2. MOBILE SIDEBAR DRAWER ===================== */}
          {mobileSidebarOpen && (
            <div
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              className="fixed inset-0 z-50 md:hidden flex modal-backdrop-contain overscroll-contain"
            >
              <div
                onClick={() => setMobileSidebarOpen(false)}
                className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs modal-backdrop-contain"
              />
              <div className="relative w-64 max-w-[80vw] bg-white text-stone-700 flex flex-col h-full shadow-2xl z-10 modal-scroll-container">
                <div className="p-4 flex items-center justify-between border-b border-stone-200">
                  <Link
                    href="/"
                    onClick={() => setMobileSidebarOpen(false)}
                    title="Return to AstroVD Homepage"
                    className="flex items-center group transition-all"
                  >
                    <Image
                      src="/astro-vd-logo.png"
                      alt="AstroVD"
                      width={140}
                      height={36}
                      priority
                      className="h-8 w-auto object-contain hover:opacity-95 transition-opacity"
                    />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1 text-stone-400 hover:text-stone-800 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div data-lenis-prevent="true" className="flex-1 overflow-y-auto p-3.5 space-y-4 modal-scroll-container overscroll-contain">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('overview');
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'overview'
                        ? 'bg-[#FDF2F4] text-[#8B1D2C]'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                    }`}
                  >
                    <Home className="w-4 h-4 text-[#8B1D2C] shrink-0" />
                    <span>{t('Dashboard', 'डैशबोर्ड')}</span>
                  </button>

                  <div>
                    <div className="px-3 mb-1.5 text-[10px] font-bold tracking-wider text-stone-400 uppercase">
                      {t('Bookings', 'बुकिंग्स')}
                    </div>
                    <div className="space-y-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('consultations');
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          activeTab === 'consultations'
                            ? 'bg-[#FDF2F4] text-[#8B1D2C] font-semibold'
                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'consultations' ? 'text-[#8B1D2C]' : 'text-stone-400'}`} />
                          <span>{t('My Consultations', 'मेरे परामर्श')}</span>
                        </div>
                        {bookings.length > 0 && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                            activeTab === 'consultations'
                              ? 'bg-[#8B1D2C] text-white'
                              : 'bg-stone-100 text-stone-600'
                          }`}>
                            {bookings.length}
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('orders');
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          activeTab === 'orders'
                            ? 'bg-[#FDF2F4] text-[#8B1D2C] font-semibold'
                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Package className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'orders' ? 'text-[#8B1D2C]' : 'text-stone-400'}`} />
                          <span>{t('My Orders', 'मेरे ऑर्डर्स')}</span>
                        </div>
                        {orders.length > 0 && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                            activeTab === 'orders'
                              ? 'bg-[#8B1D2C] text-white'
                              : 'bg-stone-100 text-stone-600'
                          }`}>
                            {orders.length}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>




                  <div>
                    <div className="px-3 mb-1.5 text-[10px] font-bold tracking-wider text-stone-400 uppercase">
                      {t('Settings', 'सेटिंग्स')}
                    </div>
                    <div className="space-y-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('settings');
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          activeTab === 'settings'
                            ? 'bg-[#FDF2F4] text-[#8B1D2C] font-semibold'
                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                        }`}
                      >
                        <Settings className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'settings' ? 'text-[#8B1D2C]' : 'text-stone-400'}`} />
                        <span>{t('Account Settings', 'खाता सेटिंग्स')}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 border-t border-stone-150 bg-stone-50/40">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#FDF2F4] text-[#8B1D2C] hover:bg-rose-100 font-semibold text-xs transition-colors cursor-pointer"
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
                <div className="hidden sm:flex items-center gap-1.5 text-xs font-sans">
                  <span className="text-stone-400 font-normal">{t('Portal', 'साधक कक्ष')}</span>
                  <ChevronRight className="w-3 h-3 text-stone-300 shrink-0" />
                  <span className="font-medium text-stone-700 text-xs sm:text-sm tracking-normal flex items-center gap-1.5">
                    {activeTab === 'overview' && t('Dashboard Overview', 'डैशबोर्ड अवलोकन')}
                    {activeTab === 'consultations' && t('My Consultations', 'परामर्श सत्र')}
                    {activeTab === 'orders' && t('Sacred Orders', 'पावन ऑर्डर्स')}
                    {activeTab === 'settings' && t('Account Settings', 'खाता सेटिंग्स')}
                  </span>
                </div>
              </div>

              {/* Global Search Bar (Pill style matching admin) */}
              <div className="flex-1 max-w-xl mx-2 sm:mx-6 relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder={t('Search consultations, orders...', 'परामर्श, ऑर्डर्स खोजें...')}
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
                  formatGoogleMeetLink={formatGoogleMeetLink}
                  t={t}
                />
              )}

              {activeTab === 'consultations' && (
                <DashboardBookingsTab
                  bookings={bookings}
                  bookingsLoading={bookingsLoading}
                  profile={profile}
                  onOpenEditProfile={() => setActiveTab('settings')}
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
