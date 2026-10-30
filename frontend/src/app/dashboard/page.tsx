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

import { UserProfile, WalletData, Transaction, DashboardTab, getUserInitials } from './types';
import { formatGoogleMeetLink, getCombinedOrders, getCombinedBookings } from './utils';

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
