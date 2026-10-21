'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PageHeader } from '../../components/PageHeader';
import { AuthModal } from '../../components/AuthModal';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  Eye,
  ShoppingCart,
  Compass,
  Sparkles,
  Wallet,
  Calendar,
  Clock,
  MapPin,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Phone,
  Video,
  MessageSquare,
  Package,
  FileText,
  Activity,
  Layers,
  ArrowUpRight,
  UserCheck,
  UserX,
  Award,
  Crown,
  KeyRound,
  AlertTriangle,
  UserPlus,
  Edit3,
  Trash2,
  UserMinus,
  Shield,
} from 'lucide-react';
import { SERVICES_CATALOGUE } from '../../data/servicesData';

export type DeletableUser = {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPERADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  walletBalance: number;
  createdAt?: string;
};

interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPERADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  walletBalance: number;
  zodiacSign?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  createdAt: string;
  _count: {
    bookings: number;
    orders: number;
    transactions: number;
  };
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    category: string;
    price: number;
    image: string;
    energizedBy: string;
    labCertified: boolean;
  };
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  shippingAddress: any;
  createdAt: string;
  items: OrderItem[];
}

interface Booking {
  id: string;
  serviceType: string;
  scheduledDate: string;
  scheduledTime: string;
  durationMinutes: number;
  totalCost: number;
  status: string;
  notes?: string;
  createdAt: string;
  astrologer: {
    id: string;
    name: string;
    title: string;
    imageUrl?: string;
  };
}

interface WalletTx {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

interface AuditLog {
  id: string;
  action: string;
  actorEmail?: string;
  targetEmail?: string;
  details?: any;
  createdAt: string;
}

interface DetailedUser extends UserSummary {
  timeOfBirth?: string;
  savedKundlis?: any[];
  savedReadings?: any[];
  orders: Order[];
  bookings: Booking[];
  transactions: WalletTx[];
  auditLogsTriggered: AuditLog[];
  auditLogsReceived: AuditLog[];
}

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const isSuperadmin = currentUser?.role === 'SUPERADMIN';
  const isAdmin = currentUser?.role === 'ADMIN' || isSuperadmin;
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // User 360 Inspection Modal State
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [inspectUser, setInspectUser] = useState<DetailedUser | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [inspectTab, setInspectTab] = useState<'purchases' | 'services' | 'activity' | 'profile'>('purchases');

  // Action states
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Edit Profile State (Current User)
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDateOfBirth, setEditDateOfBirth] = useState('');
  const [editTimeOfBirth, setEditTimeOfBirth] = useState('');
  const [editPlaceOfBirth, setEditPlaceOfBirth] = useState('');
  const [editZodiacSign, setEditZodiacSign] = useState('Aries');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Generate New Profile State
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [genName, setGenName] = useState('');
  const [genEmail, setGenEmail] = useState('');
  const [genPassword, setGenPassword] = useState('');
  const [genRole, setGenRole] = useState<'USER' | 'ADMIN'>('USER');
  const [genDateOfBirth, setGenDateOfBirth] = useState('');
  const [genTimeOfBirth, setGenTimeOfBirth] = useState('');
  const [genPlaceOfBirth, setGenPlaceOfBirth] = useState('');
  const [genZodiacSign, setGenZodiacSign] = useState('Aries');
  const [genWalletBalance, setGenWalletBalance] = useState(150);
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Delete User Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<DeletableUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Admin Top-level Navigation: Users Directory vs Customer Appointments
  const [adminTab, setAdminTab] = useState<'users' | 'bookings'>('users');

  // Admin Bookings List & Filter State
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL');
  const [bookingServiceFilter, setBookingServiceFilter] = useState('ALL');
  const [bookingDateFilter, setBookingDateFilter] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingPage, setBookingPage] = useState(1);
  const [bookingTotalPages, setBookingTotalPages] = useState(1);
  const [bookingTotalCount, setBookingTotalCount] = useState(0);

  // Selected Booking for Detailed Inspection & Status Lifecycle Transition Modal
  const [activeBooking, setActiveBooking] = useState<any | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusNotes, setStatusNotes] = useState('');
  const [statusError, setStatusError] = useState<string | null>(null);

  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('astro_token');
    }
    return null;
  };

  // Verify access & load profile
  useEffect(() => {
    const verifyAndLoad = () => {
      const token = getAuthToken();
      const storedUser = localStorage.getItem('astro_user');

      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (e) {}
      } else {
        setCurrentUser(null);
      }

      if (token) {
        fetch(`${backendUrl}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data) {
              setCurrentUser(data);
              localStorage.setItem('astro_user', JSON.stringify(data));
            }
          })
          .catch(() => {});
      }
    };

    verifyAndLoad();

    window.addEventListener('astro-auth-change', verifyAndLoad);
    window.addEventListener('storage', verifyAndLoad);

    return () => {
      window.removeEventListener('astro-auth-change', verifyAndLoad);
      window.removeEventListener('storage', verifyAndLoad);
    };
  }, [backendUrl]);

  // Load user directory
  const fetchUsers = async (targetPage = page) => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('page', targetPage.toString());
      queryParams.set('limit', '10');
      if (search.trim()) queryParams.set('search', search.trim());
      if (roleFilter) queryParams.set('role', roleFilter);
      if (statusFilter) queryParams.set('status', statusFilter);

      const res = await fetch(`${backendUrl}/api/admin/users?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setPage(data.page || 1);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
      } else if (res.status === 403) {
        setNotification({
          type: 'error',
          message: 'Access Denied: You must be an ADMIN or SUPERADMIN to view user activity.',
        });
      }
    } catch (err: any) {
      console.error('Failed to fetch admin users:', err);
      setNotification({ type: 'error', message: 'Failed to connect to backend server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPERADMIN') {
      fetchUsers(1);
    } else {
      setLoading(false);
    }
  }, [currentUser, roleFilter, statusFilter]);

  // Load customer bookings
  const fetchBookingsList = async (targetPage = bookingPage) => {
    const token = getAuthToken();
    if (!token) return;

    setBookingsLoading(true);
    try {
      const q = new URLSearchParams();
      q.set('page', targetPage.toString());
      q.set('limit', '10');
      if (bookingStatusFilter && bookingStatusFilter !== 'ALL') q.set('status', bookingStatusFilter);
      if (bookingServiceFilter && bookingServiceFilter !== 'ALL') q.set('serviceId', bookingServiceFilter);
      if (bookingDateFilter) q.set('date', bookingDateFilter);
      if (bookingSearch.trim()) q.set('search', bookingSearch.trim());

      const res = await fetch(`${backendUrl}/api/admin/bookings?${q.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setBookingsList(data.bookings || []);
        setBookingPage(data.page || 1);
        setBookingTotalPages(data.totalPages || 1);
        setBookingTotalCount(data.totalCount || 0);
      }
    } catch (err) {
      console.error('Error fetching admin bookings:', err);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin && adminTab === 'bookings') {
      fetchBookingsList(1);
    }
  }, [adminTab, bookingStatusFilter, bookingServiceFilter, bookingDateFilter, isAdmin]);

  // Handle Search submit for users
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1);
  };

  // Handle Search submit for bookings
  const handleBookingSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookingsList(1);
  };

  // Handle booking status update
  const handleTransitionStatus = async (targetStatus: string) => {
    if (!activeBooking) return;
    const token = getAuthToken();
    if (!token) return;

    setUpdatingStatus(true);
    setStatusError(null);

    try {
      const res = await fetch(`${backendUrl}/api/admin/bookings/${activeBooking.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: targetStatus,
          notes: statusNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update booking status.');
      }

      setNotification({
        type: 'success',
        message: data.message || `Booking status updated to ${targetStatus}!`,
      });
      setActiveBooking(null);
      setStatusNotes('');
      fetchBookingsList(bookingPage);
    } catch (err: any) {
      setStatusError(err.message || 'Error updating status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Open 360 Inspection Modal
  const handleInspectUser = async (userId: string) => {
    setSelectedUserId(userId);
    setInspectLoading(true);
    setInspectTab('purchases');
    const token = getAuthToken();

    try {
      const res = await fetch(`${backendUrl}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setInspectUser(data);
      } else {
        const err = await res.json();
        setNotification({ type: 'error', message: err.message || 'Failed to retrieve detailed user history.' });
        setSelectedUserId(null);
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Error retrieving user details.' });
      setSelectedUserId(null);
    } finally {
      setInspectLoading(false);
    }
  };

  // Toggle user status (suspend / reactivate)
  const handleToggleStatus = async (userId: string, currentStatus: 'ACTIVE' | 'SUSPENDED') => {
    const token = getAuthToken();
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setActionLoading(true);

    try {
      const res = await fetch(`${backendUrl}/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (res.ok) {
        setNotification({ type: 'success', message: data.message });
        // Refresh table & inspector if open
        fetchUsers(page);
        if (inspectUser && inspectUser.id === userId) {
          setInspectUser({ ...inspectUser, status: newStatus });
        }
      } else {
        setNotification({ type: 'error', message: data.message || 'Status update failed.' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Network error updating user status.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Update Role (SUPERADMIN only)
  const handleUpdateRole = async (userId: string, newRole: string) => {
    const token = getAuthToken();
    setActionLoading(true);

    try {
      const res = await fetch(`${backendUrl}/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();
      if (res.ok) {
        setNotification({ type: 'success', message: data.message });
        fetchUsers(page);
        if (inspectUser && inspectUser.id === userId) {
          setInspectUser({ ...inspectUser, role: newRole as any });
        }
      } else {
        setNotification({ type: 'error', message: data.message || 'Role modification failed.' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Network error updating role.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit Profile modal with current user's profile data
  const handleOpenEditProfile = () => {
    setEditName(currentUser?.name || '');
    setEditDateOfBirth(currentUser?.dateOfBirth || '');
    setEditTimeOfBirth(currentUser?.timeOfBirth || '');
    setEditPlaceOfBirth(currentUser?.placeOfBirth || '');
    setEditZodiacSign(currentUser?.zodiacSign || 'Aries');
    setEditError(null);
    setEditProfileModalOpen(true);
  };

  // Save current user's profile updates
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setEditError('Full name is required.');
      return;
    }

    const token = getAuthToken();
    if (!token) return;

    setEditLoading(true);
    setEditError(null);

    try {
      const res = await fetch(`${backendUrl}/api/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName.trim(),
          dateOfBirth: editDateOfBirth || undefined,
          timeOfBirth: editTimeOfBirth || undefined,
          placeOfBirth: editPlaceOfBirth.trim() || undefined,
          zodiacSign: editZodiacSign || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setNotification({
          type: 'success',
          message: 'Your profile has been updated successfully.',
        });
        const updatedUser = {
          ...currentUser,
          name: editName.trim(),
          dateOfBirth: editDateOfBirth || currentUser.dateOfBirth,
          timeOfBirth: editTimeOfBirth || currentUser.timeOfBirth,
          placeOfBirth: editPlaceOfBirth.trim() || currentUser.placeOfBirth,
          zodiacSign: editZodiacSign || currentUser.zodiacSign,
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('astro_user', JSON.stringify(updatedUser));
        setEditProfileModalOpen(false);

        // Also update local list if current user is present
        setUsers((prev) =>
          prev.map((u) =>
            u.id === currentUser.id
              ? {
                  ...u,
                  name: editName.trim(),
                  dateOfBirth: editDateOfBirth || u.dateOfBirth,
                  placeOfBirth: editPlaceOfBirth.trim() || u.placeOfBirth,
                  zodiacSign: editZodiacSign || u.zodiacSign,
                }
              : u,
          ),
        );
      } else {
        setEditError(data.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      setEditError(err.message || 'Network error updating profile.');
    } finally {
      setEditLoading(false);
    }
  };

  // Open Generate New Profile modal
  const handleOpenGenerateProfile = () => {
    setGenName('');
    setGenEmail('');
    setGenPassword('');
    setGenRole('USER');
    setGenDateOfBirth('');
    setGenTimeOfBirth('');
    setGenPlaceOfBirth('');
    setGenZodiacSign('Aries');
    setGenWalletBalance(150);
    setGenError(null);
    setGenerateModalOpen(true);
  };

  // Submit Generate New Profile
  const handleGenerateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genName.trim()) {
      setGenError('Full name is required.');
      return;
    }
    if (!genEmail.trim()) {
      setGenError('Email address is required.');
      return;
    }

    const token = getAuthToken();
    if (!token) return;

    setGenLoading(true);
    setGenError(null);

    try {
      const res = await fetch(`${backendUrl}/api/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: genName.trim(),
          email: genEmail.trim().toLowerCase(),
          password: genPassword.trim() || undefined,
          role: genRole,
          dateOfBirth: genDateOfBirth || undefined,
          timeOfBirth: genTimeOfBirth || undefined,
          placeOfBirth: genPlaceOfBirth.trim() || undefined,
          zodiacSign: genZodiacSign || undefined,
          walletBalance: Number(genWalletBalance) || 150,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setNotification({
          type: 'success',
          message: data.message || `Profile for ${genName} generated successfully!`,
        });
        setGenerateModalOpen(false);
        fetchUsers(1);
        setPage(1);
      } else {
        setGenError(data.message || 'Failed to generate profile.');
      }
    } catch (err: any) {
      setGenError(err.message || 'Network error generating profile.');
    } finally {
      setGenLoading(false);
    }
  };

  // Open Add Admin modal (Superadmin only)
  const handleOpenAddAdmin = () => {
    setGenName('');
    setGenEmail('');
    setGenPassword('');
    setGenRole('ADMIN');
    setGenDateOfBirth('');
    setGenTimeOfBirth('');
    setGenPlaceOfBirth('');
    setGenZodiacSign('Aries');
    setGenWalletBalance(250);
    setGenError(null);
    setGenerateModalOpen(true);
  };

  // Delete user handlers
  const handleInitiateDelete = (user: DeletableUser) => {
    setUserToDelete(user);
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    const token = getAuthToken();
    if (!token) return;

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const res = await fetch(`${backendUrl}/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setNotification({
          type: 'success',
          message: data.message || `Account for ${userToDelete.name} has been permanently deleted.`,
        });
        setDeleteModalOpen(false);
        const deletedId = userToDelete.id;
        setUserToDelete(null);

        // Close inspector if open for this user
        if (selectedUserId === deletedId || (inspectUser && inspectUser.id === deletedId)) {
          setSelectedUserId(null);
          setInspectUser(null);
        }

        fetchUsers(page);
      } else {
        setDeleteError(data.message || 'Failed to delete account.');
      }
    } catch (err: any) {
      setDeleteError(err.message || 'Network error deleting user account.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const canDeleteUser = (target: { id: string; role: string }) => {
    if (!currentUser || target.id === currentUser.id) return false;
    if (target.role === 'SUPERADMIN') return false;
    if (isSuperadmin) return true; // Superadmin can delete USER or ADMIN
    if (isAdmin && target.role === 'USER') return true; // ADMIN can delete USER
    return false;
  };

  const canBlockUser = (target: { id: string; role: string }) => {
    if (!currentUser || target.id === currentUser.id) return false;
    if (target.role === 'SUPERADMIN') return false;
    if (isSuperadmin) return true;
    if (isAdmin && target.role === 'USER') return true;
    return false;
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col text-[#3B1E22]">
      <Navbar />

      <PageHeader
        breadcrumb="Administrative Portal"
        title="Admin Control & Seeker 360° Inspection"
        subtitle="Full oversight into customer orders, booked astrology services, celestial wallet movements, and platform activities."
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* ACCESS CONTROL CHECK */}
        {!currentUser ? (
          <div className="max-w-xl mx-auto my-12 p-8 sm:p-12 text-center rounded-3xl bg-white/80 backdrop-blur-xl border border-amber-200/80 shadow-xl space-y-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#5B0D15] to-[#7B121C] text-amber-200 flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#3B1E22]">
                Administrative Authentication Required
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
                Please sign in with your designated Admin or Superadmin account to inspect customer details and manage platform users.
              </p>
            </div>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-8 py-3 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-white font-semibold text-sm shadow-lg shadow-rose-950/20 transition-all cursor-pointer"
            >
              Sign In to Admin Portal
            </button>
          </div>
        ) : !isAdmin ? (
          <div className="max-w-xl mx-auto my-12 p-8 sm:p-12 text-center rounded-3xl bg-white/80 backdrop-blur-xl border border-rose-200 shadow-xl space-y-6">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto shadow-sm">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold text-[#3B1E22]">
                Restricted Access
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
                Your current account ({currentUser.email}) has role <strong className="text-rose-700">{currentUser.role}</strong>. Only <strong>ADMIN</strong> (Dr. Pandit Vishal Dubey) and <strong>SUPERADMIN</strong> (Platform Owner) can view customer details.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-block px-8 py-3 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-white font-semibold text-sm shadow-md transition-all"
            >
              Go to Seeker Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Global Notification Toast */}
            {notification && (
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between shadow-sm animate-fadeIn ${
                  notification.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-rose-50 text-rose-900 border border-rose-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {notification.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <span>{notification.message}</span>
                </div>
                <button
                  onClick={() => setNotification(null)}
                  className="text-stone-400 hover:text-stone-700 font-bold ml-4"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Admin Header Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-white/95 via-[#FAF7F2] to-amber-50/80 backdrop-blur-xl border border-amber-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#5B0D15] via-[#7B121C] to-[#3B1E22] text-amber-200 font-serif font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-lg border border-amber-300/60 ring-4 ring-amber-100/50 shrink-0">
                  {getInitials(currentUser.name)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#3B1E22]">
                      {currentUser.name}
                    </h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                        isSuperadmin
                          ? 'bg-purple-100 text-purple-900 border-purple-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}
                    >
                      👑 {currentUser.role}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wider">
                      ● Active Admin Session
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-500">{currentUser.email}</p>
                  <p className="text-[11px] text-amber-800 font-medium">
                    {isSuperadmin
                      ? 'Platform Owner: Full authority over user inspection, status, and role administration.'
                      : 'Platform Administrator: Authorized for user 360° inspection and account status control.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={handleOpenEditProfile}
                  className="px-4 py-2.5 rounded-full border border-amber-300/90 bg-white hover:bg-amber-50 text-[#5B0D15] font-semibold text-xs shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
                  title="Edit your profile details"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                  <span>Edit Profile</span>
                </button>

                <button
                  onClick={handleOpenGenerateProfile}
                  className="px-4 py-2.5 rounded-full border border-[#5B0D15] bg-[#5B0D15] hover:bg-[#480a11] text-amber-100 font-semibold text-xs shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
                  title="Generate a new seeker or user profile"
                >
                  <UserPlus className="w-3.5 h-3.5 text-amber-300" />
                  <span>Generate New Profile</span>
                </button>

                {isSuperadmin && (
                  <button
                    onClick={handleOpenAddAdmin}
                    className="px-4 py-2.5 rounded-full border border-purple-400 bg-purple-800 hover:bg-purple-900 text-white font-semibold text-xs shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
                    title="Add a new platform administrator"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-300" />
                    <span>Add New Admin</span>
                  </button>
                )}

                <button
                  onClick={() => fetchUsers(page)}
                  title="Reload Directory"
                  className="px-3.5 py-2.5 rounded-full border border-stone-200 bg-white/90 hover:bg-stone-50 text-stone-600 font-medium text-xs shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-white/90 border border-stone-200/80 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                  <span>Registered Users</span>
                  <UserIcon className="w-4 h-4 text-[#5B0D15]" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#3B1E22]">{totalCount}</div>
                <div className="text-[10px] text-stone-400 font-medium">Total seeker accounts</div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white/90 border border-stone-200/80 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                  <span>Inspection Ready</span>
                  <Eye className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#5B0D15]">360°</div>
                <div className="text-[10px] text-stone-400 font-medium">Orders, bookings, clicks</div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white/90 border border-stone-200/80 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                  <span>Astrology Services</span>
                  <Compass className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-800">Live</div>
                <div className="text-[10px] text-stone-400 font-medium">Video, Audio, Chat</div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white/90 border border-stone-200/80 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                  <span>Astro Store</span>
                  <ShoppingCart className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-blue-900">Active</div>
                <div className="text-[10px] text-stone-400 font-medium">Energized Sacred Artifacts</div>
              </div>
            </div>

            {/* Top Level Section Switcher */}
            <div className="flex items-center gap-3 border-b border-stone-200/80 pb-3">
              <button
                type="button"
                onClick={() => setAdminTab('users')}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  adminTab === 'users'
                    ? 'bg-[#5B0D15] text-white shadow-md'
                    : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>Seekers &amp; User Directory ({totalCount})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdminTab('bookings');
                  fetchBookingsList(1);
                }}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  adminTab === 'bookings'
                    ? 'bg-[#5B0D15] text-white shadow-md'
                    : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
                }`}
              >
                <Compass className="w-4 h-4 text-amber-500" />
                <span>Customer Appointments &amp; Service Bookings ({bookingTotalCount})</span>
              </button>
            </div>

            {adminTab === 'users' ? (
              <>
                {/* Filter & Search Bar */}
                <div className="p-4 sm:p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-stone-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search user by name or email (e.g. Priya, Priya@astrovd.com)..."
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

              {/* Filters */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-1.5 text-xs text-stone-600">
                  <Filter className="w-3.5 h-3.5 text-stone-400" />
                  <span className="font-semibold hidden sm:inline">Role:</span>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  >
                    <option value="">All Roles</option>
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPERADMIN">SUPERADMIN</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-stone-600">
                  <span className="font-semibold hidden sm:inline">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  >
                    <option value="">All Statuses</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users Directory Table */}
            <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-stone-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#3B1E22]">
                    Seeker Accounts Directory
                  </h3>
                  <p className="text-xs text-stone-500">
                    Click "Inspect User 360°" to see what they bought, services clicked, and platform activities.
                  </p>
                </div>
                <span className="text-xs font-semibold text-stone-500">
                  Showing {users.length} of {totalCount} users
                </span>
              </div>

              {loading ? (
                <div className="py-16 text-center text-xs text-stone-500 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#5B0D15]" />
                  <p>Loading user records...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="py-16 text-center text-xs text-stone-500">
                  No users found matching your filters.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider font-semibold">
                        <th className="py-3 px-3">Seeker</th>
                        <th className="py-3 px-3">Role</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Wallet</th>
                        <th className="py-3 px-3 text-center">Orders</th>
                        <th className="py-3 px-3 text-center">Bookings</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-amber-50/40 transition-colors">
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5B0D15] to-[#7B121C] text-amber-200 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-300/50">
                                {getInitials(u.name)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-[#3B1E22] truncate">{u.name}</div>
                                <div className="text-[11px] text-stone-500 truncate">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                u.role === 'SUPERADMIN'
                                  ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                  : u.role === 'ADMIN'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                  : 'bg-stone-100 text-stone-700 border border-stone-200'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>

                          <td className="py-3.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit ${
                                u.status === 'ACTIVE'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
                                }`}
                              />
                              {u.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 font-semibold text-[#5B0D15]">
                            ₹{u.walletBalance.toFixed(2)}
                          </td>

                          <td className="py-3.5 px-3 text-center">
                            <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-900 font-bold text-[11px] border border-blue-200">
                              🛒 {u._count?.orders ?? 0}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 text-center">
                            <span className="px-2 py-1 rounded-lg bg-amber-50 text-amber-900 font-bold text-[11px] border border-amber-200">
                              🕉️ {u._count?.bookings ?? 0}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* INSPECT 360 BUTTON */}
                              <button
                                onClick={() => handleInspectUser(u.id)}
                                className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-[#5B0D15] font-bold text-xs border border-amber-300/80 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                                title="Inspect User 360: Purchases, Clicks, Platform Activity"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Inspect</span>
                              </button>

                              {/* BLOCK / UNBLOCK TOGGLE (Admin & Superadmin) */}
                              {canBlockUser(u) && (
                                <button
                                  disabled={actionLoading}
                                  onClick={() => handleToggleStatus(u.id, u.status)}
                                  className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm ${
                                    u.status === 'ACTIVE'
                                      ? 'border-rose-200 bg-rose-50/80 hover:bg-rose-100 text-rose-700'
                                      : 'border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-700'
                                  }`}
                                  title={u.status === 'ACTIVE' ? 'Block / Suspend User' : 'Unblock / Reactivate User'}
                                >
                                  {u.status === 'ACTIVE' ? (
                                    <>
                                      <UserX className="w-3.5 h-3.5" />
                                      <span>Block</span>
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="w-3.5 h-3.5" />
                                      <span>Unblock</span>
                                    </>
                                  )}
                                </button>
                              )}

                              {/* SUPERADMIN ROLE MANAGEMENT: PROMOTE / DEMOTE */}
                              {isSuperadmin && u.id !== currentUser.id && (
                                <>
                                  {u.role === 'ADMIN' ? (
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handleUpdateRole(u.id, 'USER')}
                                      className="px-2.5 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                                      title="Demote Admin to standard User role"
                                    >
                                      <UserMinus className="w-3.5 h-3.5 text-amber-700" />
                                      <span>Remove Admin</span>
                                    </button>
                                  ) : u.role === 'USER' ? (
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handleUpdateRole(u.id, 'ADMIN')}
                                      className="px-2.5 py-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                                      title="Promote User to Admin"
                                    >
                                      <Shield className="w-3.5 h-3.5 text-purple-700" />
                                      <span>Make Admin</span>
                                    </button>
                                  ) : null}
                                </>
                              )}

                              {/* DELETE USER (Admin can delete USER; Superadmin can delete USER or ADMIN) */}
                              {canDeleteUser(u) && (
                                <button
                                  disabled={actionLoading || deleteLoading}
                                  onClick={() => handleInitiateDelete(u)}
                                  className="p-1.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-all flex items-center justify-center cursor-pointer shadow-sm"
                                  title={u.role === 'ADMIN' ? 'Delete Admin Account' : 'Permanently Delete User'}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-stone-100 text-xs">
                  <span className="text-stone-500">
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={page <= 1}
                      onClick={() => fetchUsers(page - 1)}
                      className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Previous
                    </button>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => fetchUsers(page + 1)}
                      className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                    >
                      Next
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* SECTION 2: CUSTOMER APPOINTMENTS & SERVICE BOOKINGS */
          <div className="space-y-6">
            {/* Filter & Search Bar for Bookings */}
            <div className="p-4 sm:p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-stone-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Booking Search Form */}
              <form onSubmit={handleBookingSearchSubmit} className="flex-1 w-full flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    placeholder="Search by Booking ID, customer name, email, or phone..."
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

              {/* Filters for Bookings */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
                {/* Status Filter */}
                <div className="flex items-center gap-1.5 text-xs text-stone-600">
                  <span className="font-semibold hidden sm:inline">Status:</span>
                  <select
                    value={bookingStatusFilter}
                    onChange={(e) => setBookingStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                {/* Service Filter */}
                <div className="flex items-center gap-1.5 text-xs text-stone-600">
                  <span className="font-semibold hidden sm:inline">Service:</span>
                  <select
                    value={bookingServiceFilter}
                    onChange={(e) => setBookingServiceFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 max-w-[150px] truncate"
                  >
                    <option value="ALL">All 29 Services</option>
                    {SERVICES_CATALOGUE.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Filter */}
                <div className="flex items-center gap-1.5 text-xs text-stone-600">
                  <span className="font-semibold hidden sm:inline">Date:</span>
                  <input
                    type="date"
                    value={bookingDateFilter}
                    onChange={(e) => setBookingDateFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>

                {(bookingSearch || bookingStatusFilter !== 'ALL' || bookingServiceFilter !== 'ALL' || bookingDateFilter) && (
                  <button
                    onClick={() => {
                      setBookingSearch('');
                      setBookingStatusFilter('ALL');
                      setBookingServiceFilter('ALL');
                      setBookingDateFilter('');
                    }}
                    className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Bookings Table Card */}
            <div className="p-4 sm:p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-stone-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="space-y-0.5">
                  <h3 className="font-serif text-base sm:text-lg font-bold text-[#3B1E22] flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-700" />
                    <span>Customer Consultation &amp; Ritual Bookings</span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    Showing {bookingsList.length} of {bookingTotalCount} customer appointment records
                  </p>
                </div>

                <button
                  onClick={() => fetchBookingsList(bookingPage)}
                  className="px-3 py-1.5 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${bookingsLoading ? 'animate-spin text-[#5B0D15]' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {bookingsLoading ? (
                <div className="py-20 text-center text-xs text-stone-500 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#5B0D15]" />
                  <p>Loading customer appointment records...</p>
                </div>
              ) : bookingsList.length === 0 ? (
                <div className="py-16 text-center text-xs text-stone-500 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mx-auto border border-amber-200">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-sm text-stone-700">No Bookings Found</p>
                  <p className="text-stone-400 max-w-sm mx-auto">
                    No customer appointments match the selected filter criteria or search query.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider font-semibold">
                        <th className="py-3 px-3">Booking ID / Date</th>
                        <th className="py-3 px-3">Customer Details</th>
                        <th className="py-3 px-3">Service &amp; Pandit</th>
                        <th className="py-3 px-3">Scheduled Slot</th>
                        <th className="py-3 px-3 text-right">Dakshina</th>
                        <th className="py-3 px-3 text-center">Status</th>
                        <th className="py-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {bookingsList.map((b) => {
                        const isConfirmed = b.status === 'CONFIRMED';
                        const isCompleted = b.status === 'COMPLETED';
                        const isCancelled = b.status === 'CANCELLED';

                        return (
                          <tr key={b.id} className="hover:bg-amber-50/40 transition-colors">
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <span className="font-mono text-stone-800 font-bold block">
                                {b.id.slice(0, 13)}...
                              </span>
                              <span className="text-[10px] text-stone-400">
                                Booked {new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </td>

                            <td className="py-3.5 px-3">
                              <span className="font-bold text-[#3B1E22] block">
                                {b.customer?.name || 'Vedic Seeker'}
                              </span>
                              <span className="text-stone-500 text-[11px] block">{b.customer?.email}</span>
                              <span className="text-amber-800 font-medium text-[11px] flex items-center gap-1">
                                <Phone className="w-3 h-3 text-emerald-600" />
                                {b.customer?.phone || 'No phone'}
                              </span>
                            </td>

                            <td className="py-3.5 px-3">
                              <span className="font-semibold text-stone-900 block max-w-xs truncate">
                                {b.serviceTitle}
                              </span>
                              <span className="text-[10px] text-stone-500 block truncate">
                                {b.astrologer?.name}
                              </span>
                            </td>

                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <span className="font-bold text-[#5B0D15] block">
                                {b.scheduledDate}
                              </span>
                              <span className="text-stone-700 font-semibold text-[11px]">
                                {b.scheduledTime} IST
                              </span>
                            </td>

                            <td className="py-3.5 px-3 text-right font-bold font-serif text-[#5B0D15]">
                              {b.totalCost === 0 ? 'FREE' : `₹${b.totalCost}`}
                            </td>

                            <td className="py-3.5 px-3 text-center whitespace-nowrap">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                  isConfirmed
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : isCompleted
                                    ? 'bg-purple-50 text-purple-800 border-purple-300'
                                    : isCancelled
                                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                                    : 'bg-amber-50 text-amber-800 border-amber-300'
                                }`}
                              >
                                ● {b.status}
                              </span>
                            </td>

                            <td className="py-3.5 px-3 text-right whitespace-nowrap">
                              <button
                                onClick={() => {
                                  setActiveBooking(b);
                                  setStatusNotes('');
                                  setStatusError(null);
                                }}
                                className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-[#5B0D15] font-semibold text-xs shadow-sm transition-colors cursor-pointer"
                              >
                                Inspect &amp; Manage
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination for Bookings */}
              {bookingTotalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-stone-100 text-xs">
                  <span className="text-stone-500">
                    Page {bookingPage} of {bookingTotalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={bookingPage <= 1}
                      onClick={() => fetchBookingsList(bookingPage - 1)}
                      className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Previous
                    </button>
                    <button
                      disabled={bookingPage >= bookingTotalPages}
                      onClick={() => fetchBookingsList(bookingPage + 1)}
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
          </div>
        )}
      </main>

      {/* USER 360° ACTIVITY INSPECTION MODAL */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-white/95 backdrop-blur-2xl border border-amber-300 shadow-2xl overflow-hidden text-[#3B1E22]">
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-[#5B0D15] via-[#7B121C] to-[#3B1E22] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 text-amber-200 font-bold text-lg flex items-center justify-center border border-white/30 shrink-0">
                  {inspectUser ? getInitials(inspectUser.name) : '...'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-xl font-bold text-amber-100">
                      {inspectUser?.name || 'Loading Seeker Profile...'}
                    </h3>
                    {inspectUser && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950 uppercase">
                        {inspectUser.role}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-300">{inspectUser?.email}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedUserId(null);
                  setInspectUser(null);
                }}
                className="p-2 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inspectLoading || !inspectUser ? (
              <div className="py-24 text-center text-xs text-stone-500 space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#5B0D15]" />
                <p className="font-semibold text-sm">Aggregating Seeker 360° Activity Trail...</p>
                <p className="text-stone-400">Loading store purchases, booked services, and platform activity.</p>
              </div>
            ) : (
              <>
                {/* Quick Seeker Action Summary Bar */}
                <div className="bg-amber-50/90 border-b border-amber-200/80 px-6 py-3 flex flex-wrap items-center justify-between text-xs gap-3 shrink-0">
                  <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                    <div className="flex items-center gap-1.5 font-semibold text-[#3B1E22]">
                      <ShoppingCart className="w-3.5 h-3.5 text-blue-700" />
                      <span>Store Orders:</span>
                      <strong className="text-[#5B0D15]">{inspectUser.orders?.length || 0}</strong>
                      <span className="text-[10px] text-stone-500">
                        ({inspectUser.orders?.filter((o) => (o.status || '').toUpperCase() === 'PROCESSING').length || 0} Processing)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-semibold text-[#3B1E22]">
                      <Compass className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Services Clicked:</span>
                      <strong className="text-[#5B0D15]">{inspectUser.bookings?.length || 0}</strong>
                      <span className="text-[10px] text-stone-500">
                        ({inspectUser.bookings?.filter((b) => (b.status || '').toUpperCase() === 'CONFIRMED').length || 0} Confirmed,{' '}
                        {inspectUser.bookings?.filter((b) => (b.status || '').toUpperCase() !== 'CONFIRMED').length || 0} Customer Review / Processing)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-semibold text-[#3B1E22]">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Kundli Charts:</span>
                      <strong className="text-[#5B0D15]">{inspectUser.savedKundlis?.length || 0}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-stone-500 font-medium">Astro Wallet:</span>
                    <strong className="text-[#5B0D15] font-black text-sm">₹{inspectUser.walletBalance.toFixed(2)}</strong>
                  </div>
                </div>

                {/* 4 Inspection Navigation Tabs */}
                <div className="flex border-b border-stone-200 bg-white px-6 pt-3 gap-3 overflow-x-auto shrink-0">
                  <button
                    onClick={() => setInspectTab('purchases')}
                    className={`pb-3 px-3 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                      inspectTab === 'purchases' ? 'text-[#5B0D15]' : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>What They Bought ({inspectUser.orders?.length || 0})</span>
                    {inspectTab === 'purchases' && (
                      <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#5B0D15] rounded-full" />
                    )}
                  </button>

                  <button
                    onClick={() => setInspectTab('services')}
                    className={`pb-3 px-3 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                      inspectTab === 'services' ? 'text-[#5B0D15]' : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                    <span>Services Clicked &amp; Booked ({inspectUser.bookings?.length || 0})</span>
                    {inspectTab === 'services' && (
                      <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#5B0D15] rounded-full" />
                    )}
                  </button>

                  <button
                    onClick={() => setInspectTab('activity')}
                    className={`pb-3 px-3 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                      inspectTab === 'activity' ? 'text-[#5B0D15]' : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <Activity className="w-4 h-4" />
                    <span>Action Timeline &amp; Kundli</span>
                    {inspectTab === 'activity' && (
                      <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#5B0D15] rounded-full" />
                    )}
                  </button>

                  <button
                    onClick={() => setInspectTab('profile')}
                    className={`pb-3 px-3 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                      inspectTab === 'profile' ? 'text-[#5B0D15]' : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Birth Details &amp; Access</span>
                    {inspectTab === 'profile' && (
                      <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#5B0D15] rounded-full" />
                    )}
                  </button>
                </div>

                {/* Tab Body */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 max-h-[60vh]">
                  {/* TAB 1: WHAT THEY BOUGHT */}
                  {inspectTab === 'purchases' && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h4 className="font-serif text-lg font-bold text-[#3B1E22]">
                            Astro Store Purchases &amp; Consecrated Artifacts
                          </h4>
                          <p className="text-xs text-stone-500">
                            Clear itemized record of spiritual items bought by {inspectUser.name}. Orders remain categorized under <strong>PROCESSING</strong> until payment is verified &amp; delivery occurs.
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-stone-400">Total Store Spend</span>
                          <div className="text-lg font-black text-[#5B0D15]">
                            ₹{inspectUser.orders?.reduce((acc, o) => acc + (o.totalAmount || 0), 0).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {inspectUser.orders?.length === 0 ? (
                        <div className="p-8 rounded-2xl bg-stone-50 text-center text-xs text-stone-500 space-y-2">
                          <ShoppingCart className="w-8 h-8 mx-auto text-stone-400" />
                          <p className="font-semibold">No store orders recorded yet.</p>
                          <p className="text-stone-400">This seeker has not purchased products from the Astro store.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {inspectUser.orders?.map((order) => {
                            const isDelivered = (order.status || '').toUpperCase() === 'DELIVERED';
                            const isProcessing = (order.status || '').toUpperCase() === 'PROCESSING' || !isDelivered;

                            return (
                              <div
                                key={order.id}
                                className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm space-y-4"
                              >
                                {/* Order Banner */}
                                <div className="p-3 bg-gradient-to-r from-amber-50/90 via-orange-50/40 to-amber-50/70 rounded-xl border border-amber-200/80 flex flex-wrap items-center justify-between gap-3">
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="px-2 py-0.5 rounded-md bg-[#5B0D15] text-amber-200 font-bold text-[10px] uppercase">
                                      Order Placed
                                    </span>
                                    <span className="font-bold text-[#3B1E22]">
                                      Seeker placed order for{' '}
                                      <span className="text-[#5B0D15]">
                                        {order.items?.map((i) => i.product?.name).filter(Boolean).join(' + ') || 'Spiritual Item'}
                                      </span>
                                    </span>
                                  </div>

                                  {/* Order Status Badge */}
                                  <div>
                                    {isDelivered ? (
                                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5 shadow-sm">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                        <span>DELIVERED</span>
                                      </span>
                                    ) : (
                                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 shadow-sm">
                                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                                        <span>⏳ PROCESSING (Order Placed • Fulfillment Pending)</span>
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Order Meta Row */}
                                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-100 text-xs">
                                  <div className="flex items-center gap-2 text-stone-500">
                                    <span className="font-semibold text-stone-700">Order ID: #{order.id.slice(0, 8)}</span>
                                    <span>•</span>
                                    <span>
                                      Placed on{' '}
                                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  </div>
                                  <div className="font-black text-sm text-[#3B1E22]">
                                    Total Amount: <span className="text-[#5B0D15]">₹{order.totalAmount.toFixed(2)}</span>
                                  </div>
                                </div>

                                {/* Items list */}
                                <div className="space-y-3">
                                  {order.items?.map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex items-center justify-between gap-4 p-3 rounded-xl bg-amber-50/30 border border-amber-200/50"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-white border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center">
                                          {item.product?.image ? (
                                            <img
                                              src={item.product.image}
                                              alt={item.product.name}
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <Package className="w-6 h-6 text-stone-400" />
                                          )}
                                        </div>
                                        <div>
                                          <div className="font-bold text-xs text-[#3B1E22]">
                                            {item.product?.name || 'Spiritual Item'}
                                          </div>
                                          <div className="text-[11px] text-amber-900 font-medium flex items-center gap-2 mt-0.5">
                                            <span>Quantity: {item.quantity}</span>
                                            <span>•</span>
                                            <span>Category: {item.product?.category}</span>
                                            {item.product?.labCertified && (
                                              <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                                                Lab Certified
                                              </span>
                                            )}
                                          </div>
                                          {item.product?.energizedBy && (
                                            <div className="text-[10px] text-stone-500 mt-0.5">
                                              ✨ Consecrated by: {item.product.energizedBy}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="text-right shrink-0">
                                        <div className="font-bold text-xs text-[#5B0D15]">
                                          ₹{(item.price * item.quantity).toFixed(2)}
                                        </div>
                                        <div className="text-[10px] text-stone-400">₹{item.price.toFixed(2)} each</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Shipping address */}
                                {order.shippingAddress && (
                                  <div className="text-[11px] text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-200/70 flex items-start gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                                    <div>
                                      <strong className="text-stone-800">Delivery Destination: </strong>
                                      {order.shippingAddress.recipient}, {order.shippingAddress.addressLine},{' '}
                                      {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                                      {order.shippingAddress.pincode} ({order.shippingAddress.phone})
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: SERVICES CLICKED & BOOKED */}
                  {inspectTab === 'services' && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-serif text-lg font-bold text-[#3B1E22]">
                          Astrology Consultations &amp; Vedic Services Clicked
                        </h4>
                        <p className="text-xs text-stone-500">
                          Personalized sessions booked by {inspectUser.name}. Consultations that have not been performed are categorized under <strong>PROCESSING (CUSTOMER REVIEW)</strong> or <strong>CONFIRMED (SCHEDULED)</strong>.
                        </p>
                      </div>

                      {inspectUser.bookings?.length === 0 ? (
                        <div className="p-8 rounded-2xl bg-stone-50 text-center text-xs text-stone-500 space-y-2">
                          <Compass className="w-8 h-8 mx-auto text-stone-400" />
                          <p className="font-semibold">No astrology consultations booked yet.</p>
                          <p className="text-stone-400">This seeker has not scheduled personalized consultations.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {inspectUser.bookings?.map((booking) => {
                            const bStatus = (booking.status || '').toUpperCase();
                            const isConfirmed = bStatus === 'CONFIRMED';
                            const isCompleted = bStatus === 'COMPLETED';

                            return (
                              <div
                                key={booking.id}
                                className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm space-y-4"
                              >
                                {/* Service Action Banner */}
                                <div className="p-3 bg-gradient-to-r from-purple-50/90 via-amber-50/40 to-purple-50/60 rounded-xl border border-purple-200/80 flex flex-wrap items-center justify-between gap-3">
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="px-2 py-0.5 rounded-md bg-[#5B0D15] text-amber-200 font-bold text-[10px] uppercase">
                                      Service Requested
                                    </span>
                                    <span className="font-bold text-[#3B1E22]">
                                      Seeker selected{' '}
                                      <span className="text-[#5B0D15]">
                                        {booking.serviceType} Consultation with {booking.astrologer?.name || 'Dr. Pandit Vishal Dubey'}
                                      </span>
                                    </span>
                                  </div>

                                  {/* Service Status Badge */}
                                  <div>
                                    {isConfirmed ? (
                                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5 shadow-sm">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                        <span>📅 CONFIRMED (Session Scheduled • Awaiting Date)</span>
                                      </span>
                                    ) : isCompleted ? (
                                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1.5 shadow-sm">
                                        <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                                        <span>✅ COMPLETED</span>
                                      </span>
                                    ) : (
                                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 shadow-sm">
                                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                                        <span>⏳ PROCESSING (Customer Review • Slot Requested)</span>
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-100 text-xs">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 ${
                                        booking.serviceType === 'VIDEO'
                                          ? 'bg-purple-100 text-purple-900'
                                          : booking.serviceType === 'AUDIO'
                                          ? 'bg-blue-100 text-blue-900'
                                          : 'bg-emerald-100 text-emerald-900'
                                      }`}
                                    >
                                      {booking.serviceType === 'VIDEO' && <Video className="w-3 h-3" />}
                                      {booking.serviceType === 'AUDIO' && <Phone className="w-3 h-3" />}
                                      {booking.serviceType === 'CHAT' && <MessageSquare className="w-3 h-3" />}
                                      {booking.serviceType} Consultation
                                    </span>
                                    <span className="text-stone-400">•</span>
                                    <span className="text-stone-600 font-semibold">{booking.durationMinutes} Minutes</span>
                                  </div>
                                  <div className="font-black text-sm text-[#5B0D15]">
                                    Consultation Fee: ₹{booking.totalCost.toFixed(2)}
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                  <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-stone-400 uppercase">Astrologer</span>
                                    <div className="font-bold text-[#3B1E22] flex items-center gap-2">
                                      <span>🕉️</span>
                                      <span>{booking.astrologer?.name || 'Dr. Pandit Vishal Dubey'}</span>
                                    </div>
                                    <div className="text-[11px] text-stone-500">
                                      {booking.astrologer?.title || 'Senior Vedic Astrologer'}
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-stone-400 uppercase">Scheduled Time</span>
                                    <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                                      <Calendar className="w-3.5 h-3.5 text-amber-700" />
                                      <span>{booking.scheduledDate}</span>
                                      <Clock className="w-3.5 h-3.5 text-amber-700 ml-2" />
                                      <span>{booking.scheduledTime}</span>
                                    </div>
                                  </div>
                                </div>

                                {booking.notes && (
                                  <div className="text-[11px] bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60 text-[#3B1E22]">
                                    <strong className="text-amber-900">Consultation Focus: </strong>
                                    {booking.notes}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Saved Astrology Readings Clicked & Generated */}
                      {inspectUser.savedReadings && inspectUser.savedReadings.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <h5 className="font-serif text-sm font-bold text-[#3B1E22] flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-600" />
                            <span>Vedic Horoscope Reports &amp; Readings Generated</span>
                          </h5>
                          <div className="space-y-2">
                            {inspectUser.savedReadings.map((reading: any, idx: number) => (
                              <div
                                key={idx}
                                className="p-3.5 rounded-xl bg-white border border-stone-200 text-xs space-y-1.5"
                              >
                                <div className="flex items-center justify-between font-bold text-[#5B0D15]">
                                  <span>{reading.serviceName || 'Astrology Reading'}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                      ⏳ {reading.status || 'Processing (Customer Review)'}
                                    </span>
                                    <span className="text-stone-400 text-[10px] font-normal">{reading.date}</span>
                                  </div>
                                </div>
                                <p className="text-stone-600 text-[11px]">{reading.summary}</p>
                                {reading.pandit && (
                                  <div className="text-[10px] text-amber-800 font-semibold">
                                    Prepared by: {reading.pandit}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: PLATFORM ACTION TIMELINE & KUNDLI */}
                  {inspectTab === 'activity' && (
                    <div className="space-y-6">
                      {/* Integrated Action Timeline */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif text-sm font-bold text-[#3B1E22] flex items-center gap-2">
                            <Activity className="w-4 h-4 text-[#5B0D15]" />
                            <span>Unified Seeker Action Timeline (What They Did on Platform)</span>
                          </h4>
                          <span className="text-xs text-stone-500 font-semibold">
                            Full Chronological Trail
                          </span>
                        </div>

                        {/* Combined Action Feed */}
                        <div className="space-y-2.5">
                          {/* 1. Purchases Action Feed */}
                          {inspectUser.orders?.map((o) => {
                            const isDelivered = (o.status || '').toUpperCase() === 'DELIVERED';
                            return (
                              <div
                                key={`action-order-${o.id}`}
                                className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center shrink-0">
                                    <ShoppingCart className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-[#3B1E22]">
                                      Seeker Placed Order: {o.items?.map((i) => i.product?.name).filter(Boolean).join(', ') || 'Spiritual Item'}
                                    </div>
                                    <div className="text-[11px] text-stone-500">
                                      Total Amount: ₹{o.totalAmount.toFixed(2)} • Destination: {o.shippingAddress?.city || 'India'}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {isDelivered ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                      ✅ DELIVERED
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                      ⏳ PROCESSING (Order In Progress)
                                    </span>
                                  )}
                                  <span className="text-[10px] text-stone-400 whitespace-nowrap">
                                    {new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                </div>
                              </div>
                            );
                          })}

                          {/* 2. Services Action Feed */}
                          {inspectUser.bookings?.map((b) => {
                            const bStatus = (b.status || '').toUpperCase();
                            const isConfirmed = bStatus === 'CONFIRMED';
                            const isCompleted = bStatus === 'COMPLETED';

                            return (
                              <div
                                key={`action-booking-${b.id}`}
                                className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center shrink-0">
                                    <Compass className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-[#3B1E22]">
                                      Seeker Clicked &amp; Booked: {b.serviceType} Consultation with {b.astrologer?.name}
                                    </div>
                                    <div className="text-[11px] text-stone-500">
                                      Fee: ₹{b.totalCost.toFixed(2)} • Scheduled: {b.scheduledDate} at {b.scheduledTime} ({b.durationMinutes} mins)
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {isConfirmed ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                      📅 CONFIRMED (Scheduled)
                                    </span>
                                  ) : isCompleted ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
                                      ✅ COMPLETED
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                      ⏳ PROCESSING (Customer Review)
                                    </span>
                                  )}
                                  <span className="text-[10px] text-stone-400 whitespace-nowrap">
                                    {new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                </div>
                              </div>
                            );
                          })}

                          {/* 3. Kundli Charts Feed */}
                          {inspectUser.savedKundlis?.map((k, idx) => (
                            <div
                              key={`action-kundli-${idx}`}
                              className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                                  <Sparkles className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-bold text-[#3B1E22]">
                                    Calculated Janam Kundli: {k.title || 'Birth Chart'}
                                  </div>
                                  <div className="text-[11px] text-stone-500">
                                    Ascendant: {k.ascendant || 'Lagna'} • Moon Sign: {k.moonSign || 'Rashi'} • Star: {k.nakshatra || 'Nakshatra'}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                  🔮 KUNDLI CALCULATED
                                </span>
                              </div>
                            </div>
                          ))}

                          {/* 4. Wallet Transactions Feed */}
                          {inspectUser.transactions?.slice(0, 4).map((tx) => (
                            <div
                              key={`action-tx-${tx.id}`}
                              className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0">
                                  <Wallet className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-bold text-[#3B1E22]">
                                    Wallet Transaction: {tx.description}
                                  </div>
                                  <div className="text-[11px] text-stone-500">
                                    Balance After: ₹{tx.balanceAfter.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    tx.type === 'CREDIT'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                                  }`}
                                >
                                  {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                                </span>
                                <span className="text-[10px] text-stone-400 whitespace-nowrap">
                                  {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Saved Kundli Charts Cards */}
                      <div className="space-y-3 pt-3 border-t border-stone-200">
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif text-sm font-bold text-[#3B1E22] flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-600" />
                            <span>Saved Vedic Kundli Charts Details</span>
                          </h4>
                          <span className="text-xs text-stone-500 font-semibold">
                            {inspectUser.savedKundlis?.length || 0} charts
                          </span>
                        </div>

                        {inspectUser.savedKundlis?.length === 0 ? (
                          <div className="p-4 rounded-xl bg-stone-50 text-center text-xs text-stone-500">
                            No Janam Kundli charts generated yet.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {inspectUser.savedKundlis?.map((k: any, idx: number) => (
                              <div
                                key={idx}
                                className="p-4 rounded-2xl bg-white border border-amber-200/80 shadow-sm space-y-2 text-xs"
                              >
                                <div className="font-bold text-[#5B0D15] flex items-center justify-between">
                                  <span>{k.title || 'Birth Kundli'}</span>
                                  {k.matchScore && (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                                      {k.matchScore}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-stone-600 space-y-0.5">
                                  {k.ascendant && <div>Ascendant (Lagna): <strong>{k.ascendant}</strong></div>}
                                  {k.moonSign && <div>Moon Sign (Rashi): <strong>{k.moonSign}</strong></div>}
                                  {k.nakshatra && <div>Birth Star: <strong>{k.nakshatra}</strong></div>}
                                  {k.dasha && <div>Current Maha Dasha: <strong>{k.dasha}</strong></div>}
                                </div>
                                <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-100">
                                  Coordinates: {k.dob} {k.tob} ({k.pob})
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: BIRTH DETAILS & ACCESS CONTROL */}
                  {inspectTab === 'profile' && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-serif text-lg font-bold text-[#3B1E22]">
                          Seeker Celestial Coordinates &amp; Account Parameters
                        </h4>
                        <p className="text-xs text-stone-500">
                          Primary birth parameters used for astrological predictions and account security governance.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-stone-400 uppercase">Full Name</span>
                          <p className="font-bold text-sm text-[#3B1E22]">{inspectUser.name}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-stone-400 uppercase">Email Address</span>
                          <p className="font-semibold text-stone-800">{inspectUser.email}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-stone-400 uppercase">Date of Birth</span>
                          <p className="font-semibold text-stone-800">{inspectUser.dateOfBirth || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-stone-400 uppercase">Time of Birth</span>
                          <p className="font-semibold text-stone-800">{inspectUser.timeOfBirth || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-stone-400 uppercase">Place of Birth</span>
                          <p className="font-semibold text-stone-800">{inspectUser.placeOfBirth || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-stone-400 uppercase">Rashi / Zodiac Sign</span>
                          <p className="font-bold text-[#5B0D15]">{inspectUser.zodiacSign || 'Aries'}</p>
                        </div>
                      </div>

                      {/* Admin controls */}
                      <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm space-y-4">
                        <h5 className="font-serif text-sm font-bold text-[#3B1E22]">
                          Account Governance Controls
                        </h5>

                        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                          <div>
                            <div className="text-xs font-semibold text-stone-700">Account Status</div>
                            <div className="text-[11px] text-stone-500">
                              Currently <strong className={inspectUser.status === 'ACTIVE' ? 'text-emerald-700' : 'text-rose-700'}>{inspectUser.status}</strong>
                            </div>
                          </div>

                          {canBlockUser(inspectUser as any) && (
                            <button
                              disabled={actionLoading}
                              onClick={() => handleToggleStatus(inspectUser.id, inspectUser.status)}
                              className={`px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                                inspectUser.status === 'ACTIVE'
                                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                            >
                              {inspectUser.status === 'ACTIVE' ? (
                                <>
                                  <UserX className="w-3.5 h-3.5" />
                                  <span>Block / Suspend Account</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Unblock / Reactivate Account</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {isSuperadmin && inspectUser.id !== currentUser.id && (
                          <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4">
                            <div>
                              <div className="text-xs font-semibold text-stone-700">Role Designation</div>
                              <div className="text-[11px] text-stone-500">
                                Only Superadmin has authority to add new admins or remove existing admins.
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {inspectUser.role === 'ADMIN' && (
                                <button
                                  disabled={actionLoading}
                                  onClick={() => handleUpdateRole(inspectUser.id, 'USER')}
                                  className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                                >
                                  <UserMinus className="w-3.5 h-3.5 text-amber-700" />
                                  <span>Remove Admin (Demote to User)</span>
                                </button>
                              )}
                              {inspectUser.role === 'USER' && (
                                <button
                                  disabled={actionLoading}
                                  onClick={() => handleUpdateRole(inspectUser.id, 'ADMIN')}
                                  className="px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                                >
                                  <Shield className="w-3.5 h-3.5 text-purple-700" />
                                  <span>Promote to Admin</span>
                                </button>
                              )}
                              <select
                                value={inspectUser.role}
                                onChange={(e) => handleUpdateRole(inspectUser.id, e.target.value)}
                                className="px-3 py-1.5 rounded-xl border border-purple-300 bg-purple-50 text-purple-900 font-bold text-xs"
                              >
                                <option value="USER">USER</option>
                                <option value="ADMIN">ADMIN</option>
                                <option value="SUPERADMIN">SUPERADMIN</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {canDeleteUser(inspectUser as any) && (
                          <div className="pt-4 border-t border-rose-100 flex flex-wrap items-center justify-between gap-4">
                            <div>
                              <div className="text-xs font-semibold text-rose-800">Permanent Account Deletion</div>
                              <div className="text-[11px] text-rose-600">
                                Irreversibly delete this account. All actions are logged to the immutable audit trail.
                              </div>
                            </div>
                            <button
                              disabled={deleteLoading}
                              onClick={() =>
                                handleInitiateDelete({
                                  id: inspectUser.id,
                                  name: inspectUser.name,
                                  email: inspectUser.email,
                                  role: inspectUser.role as any,
                                  status: inspectUser.status,
                                  walletBalance: inspectUser.walletBalance,
                                  createdAt: inspectUser.createdAt,
                                })
                              }
                              className="px-4 py-2 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{inspectUser.role === 'ADMIN' ? 'Delete Admin Account' : 'Permanently Delete User'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Modal Controls */}
                <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between shrink-0">
                  <div className="text-[11px] text-stone-500">
                    Seeker UUID: <code className="text-[#5B0D15]">{inspectUser.id}</code>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedUserId(null);
                      setInspectUser(null);
                    }}
                    className="px-6 py-2 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    Close Inspection
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL (Current User) */}
      {editProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-amber-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 bg-gradient-to-r from-[#5B0D15] via-[#4A0A21] to-[#3B1E22] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-200 border border-amber-300/40 flex items-center justify-center shrink-0">
                  <Edit3 className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-amber-100">
                    Edit Your Profile
                  </h3>
                  <p className="text-[11px] text-stone-300">
                    Update your astrological birth details and display name
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditProfileModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 overflow-y-auto space-y-4">
              {/* Account Overview Tag */}
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-amber-200/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-stone-500">Email:</span>{' '}
                  <span className="font-semibold text-stone-800">{currentUser?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] uppercase">
                    {currentUser?.role}
                  </span>
                </div>
              </div>

              {editError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#3B1E22]">Full Name *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  required
                />
              </div>

              {/* Date & Time of Birth */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#3B1E22] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-700" />
                    <span>Date of Birth</span>
                  </label>
                  <input
                    type="date"
                    value={editDateOfBirth}
                    onChange={(e) => setEditDateOfBirth(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#3B1E22] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Time of Birth</span>
                  </label>
                  <input
                    type="time"
                    value={editTimeOfBirth}
                    onChange={(e) => setEditTimeOfBirth(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
              </div>

              {/* Place of Birth */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#3B1E22] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-700" />
                  <span>Place of Birth (City, State)</span>
                </label>
                <input
                  type="text"
                  value={editPlaceOfBirth}
                  onChange={(e) => setEditPlaceOfBirth(e.target.value)}
                  placeholder="e.g. Varanasi, Uttar Pradesh"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              {/* Zodiac Sign */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#3B1E22] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>Vedic Zodiac Sign (Rashi)</span>
                </label>
                <select
                  value={editZodiacSign}
                  onChange={(e) => setEditZodiacSign(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                >
                  {['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'].map((sign) => (
                    <option key={sign} value={sign}>{sign}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditProfileModalOpen(false)}
                  disabled={editLoading}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#5B0D15] to-[#7B121C] hover:opacity-95 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  {editLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Save Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GENERATE NEW PROFILE MODAL */}
      {generateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-amber-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 bg-gradient-to-r from-[#5B0D15] via-[#4A0A21] to-[#3B1E22] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-200 border border-amber-300/40 flex items-center justify-center shrink-0">
                  <UserPlus className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-amber-100">
                    Generate New Profile
                  </h3>
                  <p className="text-[11px] text-stone-300">
                    Create and seed a new seeker or user account
                  </p>
                </div>
              </div>
              <button
                onClick={() => setGenerateModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateProfile} className="p-6 overflow-y-auto space-y-4">
              {genError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{genError}</span>
                </div>
              )}

              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#3B1E22]">Full Name *</label>
                  <input
                    type="text"
                    value={genName}
                    onChange={(e) => setGenName(e.target.value)}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#3B1E22]">Email Address *</label>
                  <input
                    type="email"
                    value={genEmail}
                    onChange={(e) => setGenEmail(e.target.value)}
                    placeholder="ramesh@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    required
                  />
                </div>
              </div>

              {/* Password & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#3B1E22]">Initial Password</label>
                  <input
                    type="text"
                    value={genPassword}
                    onChange={(e) => setGenPassword(e.target.value)}
                    placeholder="Defaults to Seeker@2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#3B1E22]">Platform Role</label>
                  {isSuperadmin ? (
                    <select
                      value={genRole}
                      onChange={(e) => setGenRole(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    >
                      <option value="USER">USER (Seeker)</option>
                      <option value="ADMIN">ADMIN (Platform Administrator)</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value="USER (Seeker)"
                      disabled
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-100 text-xs text-stone-500 cursor-not-allowed"
                    />
                  )}
                </div>
              </div>

              {/* Date & Time of Birth */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#3B1E22] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-700" />
                    <span>Date of Birth</span>
                  </label>
                  <input
                    type="date"
                    value={genDateOfBirth}
                    onChange={(e) => setGenDateOfBirth(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#3B1E22] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Time of Birth</span>
                  </label>
                  <input
                    type="time"
                    value={genTimeOfBirth}
                    onChange={(e) => setGenTimeOfBirth(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
              </div>

              {/* Place of Birth & Zodiac */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#3B1E22] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-700" />
                    <span>Place of Birth</span>
                  </label>
                  <input
                    type="text"
                    value={genPlaceOfBirth}
                    onChange={(e) => setGenPlaceOfBirth(e.target.value)}
                    placeholder="e.g. New Delhi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#3B1E22] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>Zodiac Sign</span>
                  </label>
                  <select
                    value={genZodiacSign}
                    onChange={(e) => setGenZodiacSign(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  >
                    {['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'].map((sign) => (
                      <option key={sign} value={sign}>{sign}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Initial Spiritual Wallet */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#3B1E22] flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-amber-700" />
                  <span>Initial Spiritual Wallet Balance (₹)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={genWalletBalance}
                  onChange={(e) => setGenWalletBalance(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setGenerateModalOpen(false)}
                  disabled={genLoading}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={genLoading || !genName || !genEmail}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#5B0D15] to-[#7B121C] hover:opacity-95 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  {genLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating Profile...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Generate Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-rose-200 shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-rose-900 via-rose-800 to-[#5B0D15] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-200 border border-rose-300/40 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-rose-300" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-rose-100">
                    {userToDelete.role === 'ADMIN' ? 'Remove & Delete Admin' : 'Delete User Account'}
                  </h3>
                  <p className="text-[11px] text-rose-200">
                    This action is permanent and cannot be undone
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!deleteLoading) {
                    setDeleteModalOpen(false);
                    setUserToDelete(null);
                  }
                }}
                disabled={deleteLoading}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {deleteError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-amber-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Name:</span>
                  <span className="font-bold text-[#3B1E22]">{userToDelete.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Email:</span>
                  <span className="font-semibold text-stone-800">{userToDelete.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Role:</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      userToDelete.role === 'ADMIN'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-stone-100 text-stone-700 border border-stone-200'
                    }`}
                  >
                    {userToDelete.role}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Wallet Balance:</span>
                  <span className="font-semibold text-[#5B0D15]">₹{userToDelete.walletBalance.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-950">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                  <span>What happens next:</span>
                </p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  The account credentials, orders, consultations, and wallet records will be permanently deleted.
                  An immutable, append-only record is preserved in the administrative audit logs.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setUserToDelete(null);
                  }}
                  disabled={deleteLoading}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleteLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-rose-900 hover:opacity-95 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  {deleteLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting Account...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Permanently Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING DETAILS & STATUS MANAGEMENT MODAL */}
      {activeBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-2xl flex flex-col rounded-3xl bg-white/95 backdrop-blur-2xl border border-amber-300 shadow-2xl overflow-hidden text-[#3B1E22]">
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-[#5B0D15] via-[#7B121C] to-[#3B1E22] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 text-amber-200 flex items-center justify-center border border-white/30 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-amber-100">
                    Appointment Details &amp; Lifecycle
                  </h3>
                  <p className="text-xs text-amber-200/80 font-mono">
                    Ref: {activeBooking.id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveBooking(null);
                  setStatusError(null);
                  setStatusNotes('');
                }}
                className="p-2 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
              {statusError && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{statusError}</span>
                </div>
              )}

              {/* Service & Schedule Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                    Booked Service
                  </span>
                  <p className="font-serif font-bold text-stone-900 text-base">
                    {activeBooking.serviceTitle || activeBooking.serviceType}
                  </p>
                  <p className="text-xs text-stone-600 mt-1">
                    Duration: {activeBooking.durationMinutes || 45} mins • Canonical ID: <span className="font-mono text-[11px] text-amber-900">{activeBooking.serviceType}</span>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                    Scheduled Date &amp; Time
                  </span>
                  <p className="font-bold text-stone-900 text-base flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-700" />
                    {new Date(activeBooking.scheduledDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-stone-700 font-semibold mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    {activeBooking.scheduledTime}
                  </p>
                </div>
              </div>

              {/* Seeker / Customer Contact Details */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block mb-2">
                  Seeker Contact Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Customer Name</span>
                    <span className="font-semibold text-stone-900 flex items-center gap-1 mt-0.5">
                      <UserIcon className="w-3.5 h-3.5 text-stone-500" />
                      {activeBooking.user?.name || 'Guest Seeker'}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Email Address</span>
                    <span className="font-mono text-stone-800 break-all block mt-0.5">
                      {activeBooking.user?.email || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Contact Phone</span>
                    <span className="font-mono font-medium text-stone-900 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-stone-500" />
                      {activeBooking.user?.phone || 'No phone recorded'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Booking Metadata & User Notes */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Booking Created:</span>
                  <span className="font-medium text-stone-700">
                    {new Date(activeBooking.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Assigned Astrologer:</span>
                  <span className="font-medium text-stone-800">
                    {activeBooking.astrologer?.name || 'Dr. Pandit Vishal Dubey'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Service Fee:</span>
                  <span className="font-bold text-[#5B0D15]">
                    {activeBooking.totalCost === 0 ? 'Complimentary / Included' : `₹${activeBooking.totalCost}`}
                  </span>
                </div>
                {activeBooking.notes && (
                  <div className="pt-2 border-t border-stone-200">
                    <span className="text-stone-500 block text-[11px] mb-1">Seeker Remarks / Notes:</span>
                    <p className="p-2.5 rounded-lg bg-white border border-stone-200 text-stone-800 font-mono text-[11px]">
                      {activeBooking.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Current Status & Transitions */}
              <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                      Current Lifecycle Status
                    </span>
                    <span
                      className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${
                        activeBooking.status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : activeBooking.status === 'COMPLETED'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : activeBooking.status === 'CANCELLED'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      ● {activeBooking.status}
                    </span>
                  </div>

                  {activeBooking.status === 'COMPLETED' || activeBooking.status === 'CANCELLED' ? (
                    <span className="text-xs text-stone-500 italic bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
                      Terminal state (Concluded)
                    </span>
                  ) : null}
                </div>

                {/* Status Update Note Input */}
                {activeBooking.status !== 'COMPLETED' && activeBooking.status !== 'CANCELLED' && (
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Update Notes (Optional remarks for this status transition):
                    </label>
                    <input
                      type="text"
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                      placeholder="e.g. Consultation conducted via phone call, or client requested reschedule"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#5B0D15]"
                    />
                  </div>
                )}

                {/* Valid Transition Action Buttons */}
                {activeBooking.status === 'PENDING' && (
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      disabled={updatingStatus}
                      onClick={() => handleTransitionStatus('CONFIRMED')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {updatingStatus ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      Confirm Appointment
                    </button>
                    <button
                      disabled={updatingStatus}
                      onClick={() => handleTransitionStatus('CANCELLED')}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancel Booking
                    </button>
                  </div>
                )}

                {activeBooking.status === 'CONFIRMED' && (
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      disabled={updatingStatus}
                      onClick={() => handleTransitionStatus('COMPLETED')}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {updatingStatus ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      Mark as Completed
                    </button>
                    <button
                      disabled={updatingStatus}
                      onClick={() => handleTransitionStatus('CANCELLED')}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancel Appointment
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => {
                  setActiveBooking(null);
                  setStatusError(null);
                  setStatusNotes('');
                }}
                className="px-5 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal for signing in as Admin */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(userData) => {
          setCurrentUser(userData);
          setAuthModalOpen(false);
          fetchUsers(1);
        }}
      />

      <Footer />
    </div>
  );
}
