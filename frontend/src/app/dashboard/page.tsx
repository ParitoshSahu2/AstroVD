'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';

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

  const pathname = usePathname();
  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('astro_token');
    }
    return null;
  };

  const loadData = async () => {
    const token = getAuthToken();
    if (!token) {
      setProfile(null);
      setWallet(null);
      setTransactions([]);
      setLoading(false);
      return;
    }

    // Always clear previous user's data before loading fresh user's data
    setProfile(null);
    setWallet(null);
    setTransactions([]);
    setLoading(true);

    try {
      // 1. Fetch Profile
      const profRes = await fetch(`${backendUrl}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (profRes.ok) {
        const profData = await profRes.json();
        setProfile(profData);
        setEditName(profData.name || '');
        setEditDob(profData.dateOfBirth || '');
        setEditTob(profData.timeOfBirth || '');
        setEditPob(profData.placeOfBirth || '');
        setEditZodiac(profData.zodiacSign || 'Aries');
      } else if (profRes.status === 401) {
        localStorage.removeItem('astro_token');
        localStorage.removeItem('astro_user');
        setProfile(null);
        setWallet(null);
        setTransactions([]);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('astro-auth-change', { detail: null }));
        }
      }

      // 2. Fetch Wallet
      const walRes = await fetch(`${backendUrl}/api/users/me/wallet`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (walRes.ok) {
        const walData = await walRes.json();
        setWallet(walData);
      }

      // 3. Fetch Transactions
      await fetchTransactions(1, token);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (page = 1, tokenOverride?: string | null) => {
    const token = tokenOverride || getAuthToken();
    if (!token) return;

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
    if (!token) return;

    setBookingsLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/appointments/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data || []);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    fetchBookings();

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
      loadData();
      fetchBookings();
    };

    window.addEventListener('astro-auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('astro-auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [pathname]);

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

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
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
        title="Seeker Sanctuary & Account"
        subtitle="Manage your Vedic birth chart information, review spiritual wallet credits, and inspect ledger transactions."
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {loading ? (
          // Loading Skeleton
          <div className="space-y-6 animate-pulse">
            <div className="h-28 bg-white/60 rounded-3xl border border-amber-200/50" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-64 bg-white/60 rounded-3xl border border-amber-200/50" />
              <div className="h-64 bg-white/60 rounded-3xl border border-amber-200/50 md:col-span-2" />
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
          <div className="space-y-8">
            {/* Top Identity & Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-white/90 via-[#FAF7F2] to-amber-50/70 backdrop-blur-xl border border-amber-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4 sm:gap-6">
                {/* Avatar Initial Pill */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#5B0D15] via-[#7B121C] to-[#3B1E22] text-amber-200 font-serif font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-lg border border-amber-300/60 ring-4 ring-amber-100/50 shrink-0">
                  {getInitials(profile.name)}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-[#3B1E22] truncate">
                      {profile.name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300/70 uppercase tracking-wider">
                      {profile.role}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300/70 uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                      {profile.status}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-500 truncate">{profile.email}</p>
                  <p className="text-[11px] text-amber-800 font-medium">
                    Seeker since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="px-4 py-2.5 rounded-full border border-amber-300/90 bg-white/90 hover:bg-white text-[#5B0D15] font-semibold text-xs shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Profile
                </button>
                <button
                  onClick={loadData}
                  title="Refresh Dashboard"
                  className="p-2.5 rounded-full border border-stone-200 bg-white/80 hover:bg-white text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Wallet Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-50 to-orange-50/50 border border-amber-300/60 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-amber-900 text-xs font-semibold">
                  <span>Astro Wallet</span>
                  <Wallet className="w-4 h-4 text-amber-700" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-[#5B0D15]">
                  ₹{wallet?.walletBalance ?? profile.walletBalance}
                </div>
                <div className="text-[10px] text-stone-500 font-medium">Active spiritual credits</div>
              </div>

              {/* Zodiac Sign Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/80 border border-stone-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-stone-700 text-xs font-semibold">
                  <span>Sun / Rashi</span>
                  <Sparkles className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-[#3B1E22]">
                  {profile.zodiacSign || 'Aries'}
                </div>
                <div className="text-[10px] text-stone-500 font-medium">Vedic astrological sign</div>
              </div>

              {/* Consultations Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/80 border border-stone-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-stone-700 text-xs font-semibold">
                  <span>Consultations</span>
                  <Compass className="w-4 h-4 text-[#5B0D15]" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-[#3B1E22]">
                  0
                </div>
                <div className="text-[10px] text-stone-500 font-medium">Completed readings</div>
              </div>

              {/* Orders Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/80 border border-stone-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-stone-700 text-xs font-semibold">
                  <span>Store Orders</span>
                  <ShoppingCart className="w-4 h-4 text-stone-700" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-[#3B1E22]">
                  0
                </div>
                <div className="text-[10px] text-stone-500 font-medium">Energized artifacts</div>
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
                    <Link
                      href="/appointment"
                      className="px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs shadow-md transition-all text-center"
                    >
                      Use Credits For Consultation
                    </Link>
                    <Link
                      href="/products"
                      className="px-6 py-3 rounded-full bg-white/20 hover:bg-white/30 text-white font-semibold text-xs border border-white/30 transition-all text-center"
                    >
                      Visit Astro Store
                    </Link>
                  </div>
                </div>

                {/* Ledger Transaction History Table */}
                <div className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-stone-200/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#3B1E22]">
                        Immutable Transaction Ledger
                      </h3>
                      <p className="text-xs text-stone-500">
                        Detailed audit records for welcome bonuses and wallet credit movements.
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-stone-500">
                      Total Records: {txTotal}
                    </span>
                  </div>

                  {txLoading ? (
                    <div className="py-12 text-center text-xs text-stone-500 space-y-2">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#5B0D15]" />
                      <p>Loading ledger transactions...</p>
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="py-12 text-center text-xs text-stone-500">
                      No wallet transactions recorded yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider font-semibold">
                            <th className="py-3 px-3">Date</th>
                            <th className="py-3 px-3">Description</th>
                            <th className="py-3 px-3">Type</th>
                            <th className="py-3 px-3 text-right">Amount</th>
                            <th className="py-3 px-3 text-right">Balance After</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-stone-50/60 transition-colors">
                              <td className="py-3 px-3 text-stone-600 whitespace-nowrap">
                                {new Date(tx.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </td>
                              <td className="py-3 px-3 font-semibold text-[#3B1E22]">
                                {tx.description}
                              </td>
                              <td className="py-3 px-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    tx.type === 'CREDIT'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                                  }`}
                                >
                                  {tx.type}
                                </span>
                              </td>
                              <td
                                className={`py-3 px-3 text-right font-bold ${
                                  tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'
                                }`}
                              >
                                {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                              </td>
                              <td className="py-3 px-3 text-right font-medium text-stone-600">
                                ₹{tx.balanceAfter.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination Controls */}
                  {txTotalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-stone-100 text-xs">
                      <span className="text-stone-500">
                        Page {txPage} of {txTotalPages}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          disabled={txPage <= 1}
                          onClick={() => fetchTransactions(txPage - 1)}
                          className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          Previous
                        </button>
                        <button
                          disabled={txPage >= txTotalPages}
                          onClick={() => fetchTransactions(txPage + 1)}
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
            )}

            {/* TAB CONTENT 3: CONSULTATIONS & SERVICE APPOINTMENTS */}
            {activeTab === 'consultations' && (
              <div className="space-y-6">
                {/* Header card with quick actions */}
                <div className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-stone-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-[#3B1E22] flex items-center gap-2">
                      <Compass className="w-5 h-5 text-amber-700" />
                      <span>My Vedic Consultations &amp; Rituals</span>
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      View your booked service sessions, scheduled date &amp; time slots, and status.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => fetchBookings()}
                      className="px-3.5 py-2 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${bookingsLoading ? 'animate-spin text-[#5B0D15]' : ''}`} />
                      <span>Refresh</span>
                    </button>
                    <Link
                      href="/appointment"
                      className="px-5 py-2.5 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-white text-xs font-bold shadow-md shadow-rose-950/20 transition-all flex items-center gap-1.5"
                    >
                      <span>Book New Service →</span>
                    </Link>
                  </div>
                </div>

                {bookingsLoading ? (
                  <div className="py-16 text-center text-xs text-stone-500 space-y-2 bg-white/60 rounded-3xl border border-stone-200">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#5B0D15]" />
                    <p>Loading your sacred appointments...</p>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="p-10 rounded-3xl bg-white/90 backdrop-blur-xl border border-stone-200/80 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-[#5B0D15] flex items-center justify-center mx-auto shadow-sm border border-amber-200">
                      <Compass className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-serif text-xl font-bold text-[#3B1E22]">
                        No Consultations Scheduled Yet
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
                        You have not reserved any consultations yet. Explore our 29 consecrated Vedic services and book an available slot with Dr. Pandit Vishal Dubey.
                      </p>
                    </div>
                    <div className="pt-2">
                      <Link
                        href="/appointment"
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-white font-semibold text-xs shadow-md transition-all"
                      >
                        Explore Certified Services &rarr;
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking: any) => {
                      const isConfirmed = booking.status === 'CONFIRMED';
                      const isCompleted = booking.status === 'COMPLETED';
                      const isCancelled = booking.status === 'CANCELLED';

                      return (
                        <div
                          key={booking.id}
                          className="p-5 sm:p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-stone-200/90 shadow-sm hover:shadow-md transition-all space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-serif font-bold text-base text-[#3B1E22]">
                                  {booking.serviceTitle}
                                </h4>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                                    isConfirmed
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                      : isCompleted
                                      ? 'bg-purple-50 text-purple-800 border-purple-300'
                                      : isCancelled
                                      ? 'bg-rose-50 text-rose-800 border-rose-300'
                                      : 'bg-amber-50 text-amber-800 border-amber-300'
                                  }`}
                                >
                                  ● {booking.status}
                                </span>
                              </div>
                              <span className="text-[10px] text-stone-400 font-mono">
                                Ref: {booking.id}
                              </span>
                            </div>

                            <div className="text-right sm:text-right">
                              <span className="text-xs font-serif font-bold text-[#5B0D15] text-base block">
                                {booking.totalCost === 0 ? '100% FREE' : `₹${booking.totalCost}`}
                              </span>
                              <span className="text-[10px] text-stone-400">
                                {booking.durationMinutes || 30} mins session
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100/80 space-y-0.5">
                              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                                Scheduled Slot
                              </span>
                              <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                                <span>{booking.scheduledDate}</span>
                              </div>
                              <div className="font-bold text-[#5B0D15] flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-amber-700" />
                                <span>{booking.scheduledTime} IST</span>
                              </div>
                            </div>

                            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60 space-y-0.5">
                              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                                Assigned Acharya
                              </span>
                              <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                                <UserIcon className="w-3.5 h-3.5 text-amber-600" />
                                <span>{booking.pandit || booking.astrologer?.name}</span>
                              </div>
                              <span className="text-[10px] text-stone-500 truncate block">
                                {booking.astrologer?.title || 'Vedic Astrology Sanctum'}
                              </span>
                            </div>

                            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60 space-y-0.5">
                              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                                Booked On
                              </span>
                              <span className="text-stone-700 font-medium block">
                                {new Date(booking.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                              <span className="text-[10px] text-stone-500 block truncate">
                                {booking.notes ? booking.notes.split('|')[0] : 'Standard Vedic Session'}
                              </span>
                            </div>
                          </div>

                          {booking.notes && (
                            <div className="p-3 rounded-xl bg-stone-50/60 text-[11px] text-stone-600 border border-stone-100 flex items-start gap-1.5">
                              <span className="font-bold text-stone-700 shrink-0">Notes:</span>
                              <span className="truncate">{booking.notes}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 4: ORDERS ROADMAP PLACEHOLDER */}
            {activeTab === 'orders' && (
              <div className="p-10 rounded-3xl bg-white/90 backdrop-blur-xl border border-stone-200/80 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-100 to-amber-100 text-[#5B0D15] flex items-center justify-center mx-auto shadow-sm border border-amber-200">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-xl font-bold text-[#3B1E22]">
                    No Astro Store Orders
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
                    Browse authentic energized gemstones, Kashi consecrated Rudraksha malas, and certified Yantras.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-white font-semibold text-xs shadow-md transition-all"
                  >
                    Visit Spiritual Artifacts Store →
                  </Link>
                </div>
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
