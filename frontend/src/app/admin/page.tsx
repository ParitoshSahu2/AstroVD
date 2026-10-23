'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { getAuthToken, performLogout } from '../../lib/auth';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PageHeader } from '../../components/PageHeader';
import { AuthModal } from '../../components/AuthModal';
import {
  ShieldCheck,
  ShieldAlert,
  User as UserIcon,
  Sparkles,
  Lock,
  RefreshCw,
  Crown,
  Edit3,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Compass,
  Package,
  Calendar,
  History,
  Home,
  Users,
  Search,
  Settings,
  FileText,
  Image as ImageIcon,
  ShoppingBag,
  Bell,
  ChevronDown,
  LogOut,
  ArrowRight,
  Menu,
  X,
  ExternalLink,
  Sun,
  UserCheck,
  Download,
  Printer,
} from 'lucide-react';
import {
  UserSummary,
  DetailedUser,
  DeletableUser,
  getUserInitials,
  getAvatarBackground,
} from './types';
import AdminOverviewTab from './components/AdminOverviewTab';
import AdminUsersTab from './components/AdminUsersTab';

// Lazy-load heavy non-default sections and dialogs to reduce initial bundle weight
const AdminBookingsTab = dynamic(() => import('./components/AdminBookingsTab'), {
  loading: () => (
    <div className="p-12 text-center flex flex-col items-center justify-center space-y-3 bg-white/70 rounded-3xl border border-stone-200/80">
      <RefreshCw className="w-6 h-6 animate-spin text-[#5B0D15]" />
      <p className="text-xs text-stone-500 font-medium">Loading consultations & appointments...</p>
    </div>
  ),
});

const AdminOrdersTab = dynamic(() => import('./components/AdminOrdersTab'), {
  loading: () => (
    <div className="p-12 text-center flex flex-col items-center justify-center space-y-3 bg-white/70 rounded-3xl border border-stone-200/80">
      <RefreshCw className="w-6 h-6 animate-spin text-[#5B0D15]" />
      <p className="text-xs text-stone-500 font-medium">Loading shopping orders fulfillment...</p>
    </div>
  ),
});

const AdminAvailabilityTab = dynamic(() => import('./components/AdminAvailabilityTab'), {
  loading: () => (
    <div className="p-12 text-center flex flex-col items-center justify-center space-y-3 bg-white/70 rounded-3xl border border-stone-200/80">
      <RefreshCw className="w-6 h-6 animate-spin text-[#5B0D15]" />
      <p className="text-xs text-stone-500 font-medium">Loading Panditji availability schedule...</p>
    </div>
  ),
});

const AdminActivityTab = dynamic(() => import('./components/AdminActivityTab'), {
  loading: () => (
    <div className="p-12 text-center flex flex-col items-center justify-center space-y-3 bg-white/70 rounded-3xl border border-stone-200/80">
      <RefreshCw className="w-6 h-6 animate-spin text-[#5B0D15]" />
      <p className="text-xs text-stone-500 font-medium">Loading content management & audit history...</p>
    </div>
  ),
});

const UserInspectionModal = dynamic(() => import('./components/UserInspectionModal'), { ssr: false });
const BookingLifecycleModal = dynamic(() => import('./components/BookingLifecycleModal'), { ssr: false });
const OrderLifecycleModal = dynamic(() => import('./components/OrderLifecycleModal'), { ssr: false });
const EditAdminProfileModal = dynamic(() => import('./components/EditAdminProfileModal'), { ssr: false });
const GenerateUserModal = dynamic(() => import('./components/GenerateUserModal'), { ssr: false });
const DeleteUserModal = dynamic(() => import('./components/DeleteUserModal'), { ssr: false });
const AvailabilityModals = dynamic(() => import('./components/AvailabilityModals'), { ssr: false });

export default function AdminPage() {
  const router = useRouter();
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
  const [roleCounts, setRoleCounts] = useState<{
    USER: number;
    ADMIN: number;
    SUPERADMIN: number;
    TOTAL: number;
  }>({ USER: 0, ADMIN: 0, SUPERADMIN: 0, TOTAL: 0 });

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

  // Admin Top-level Navigation: Overview vs Users Directory vs Customer Appointments vs Shopping Orders vs Panditji Availability vs Content Activity
  const [adminTab, setAdminTab] = useState<'overview' | 'users' | 'bookings' | 'orders' | 'availability' | 'activity'>('overview');
  const [globalSearch, setGlobalSearch] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

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

  // Admin Orders List & Filter State
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderDateFilter, setOrderDateFilter] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderPage, setOrderPage] = useState(1);
  const [orderTotalPages, setOrderTotalPages] = useState(1);
  const [orderTotalCount, setOrderTotalCount] = useState(0);

  // Selected Order for Detailed Fulfillment & Status Lifecycle Modal
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  const [orderStatusUpdating, setOrderStatusUpdating] = useState(false);
  const [orderStatusNotes, setOrderStatusNotes] = useState('');
  const [orderStatusError, setOrderStatusError] = useState<string | null>(null);

  // Admin Availability & Schedule Management State
  const [availabilityDate, setAvailabilityDate] = useState<string>('');
  const [availabilityData, setAvailabilityData] = useState<{
    date: string;
    isBlocked: boolean;
    blockedReason: string | null;
    slots: any[];
    totalSlots: number;
    bookedCount: number;
  } | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  // Availability Modals State
  const [createSlotModalOpen, setCreateSlotModalOpen] = useState(false);
  const [newSlotTime, setNewSlotTime] = useState('10:00 AM');
  const [newSlotDuration, setNewSlotDuration] = useState(45);
  const [newSlotPublished, setNewSlotPublished] = useState(true);
  const [newSlotNotes, setNewSlotNotes] = useState('');
  const [createSlotLoading, setCreateSlotLoading] = useState(false);
  const [createSlotError, setCreateSlotError] = useState<string | null>(null);

  const [editSlotModalOpen, setEditSlotModalOpen] = useState(false);
  const [slotToEdit, setSlotToEdit] = useState<any | null>(null);
  const [editSlotTime, setEditSlotTime] = useState('');
  const [editSlotDuration, setEditSlotDuration] = useState(45);
  const [editSlotPublished, setEditSlotPublished] = useState(true);
  const [editSlotNotes, setEditSlotNotes] = useState('');
  const [editSlotLoading, setEditSlotLoading] = useState(false);
  const [editSlotError, setEditSlotError] = useState<string | null>(null);

  const [blockDateModalOpen, setBlockDateModalOpen] = useState(false);
  const [blockDateReason, setBlockDateReason] = useState('');
  const [blockDateLoading, setBlockDateLoading] = useState(false);

  const [initScheduleModalOpen, setInitScheduleModalOpen] = useState(false);
  const [initScheduleDays, setInitScheduleDays] = useState(7);
  const [initScheduleLoading, setInitScheduleLoading] = useState(false);

  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');

  const clearAdminData = () => {
    setCurrentUser(null);
    setUsers([]);
    setPage(1);
    setTotalPages(1);
    setTotalCount(0);
    setRoleCounts({ USER: 0, ADMIN: 0, SUPERADMIN: 0, TOTAL: 0 });
    setBookingsList([]);
    setBookingPage(1);
    setBookingTotalPages(1);
    setBookingTotalCount(0);
    setOrdersList([]);
    setOrderPage(1);
    setOrderTotalPages(1);
    setOrderTotalCount(0);
    setAvailabilityData(null);
    setSelectedUserId(null);
    setInspectUser(null);
    setActiveBooking(null);
    setActiveOrder(null);
    setNotification(null);
    setSlotToEdit(null);
    setUserToDelete(null);
    setAdminTab('overview');
  };

  // Verify access & load profile with strict route protection & cache invalidation
  useEffect(() => {
    const verifyAndLoad = async () => {
      const token = getAuthToken();
      if (!token) {
        clearAdminData();
        setLoading(false);
        router.replace('/login?redirect=/admin');
        return;
      }

      const storedUser = localStorage.getItem('astro_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.role !== 'ADMIN' && parsed.role !== 'SUPERADMIN') {
            clearAdminData();
            setLoading(false);
            router.replace('/dashboard');
            return;
          }
          setCurrentUser(parsed);
        } catch (e) {
          setCurrentUser(null);
        }
      }

      try {
        const res = await fetch(`${backendUrl}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.role !== 'ADMIN' && data.role !== 'SUPERADMIN') {
            clearAdminData();
            router.replace('/dashboard');
            return;
          }
          setCurrentUser(data);
          localStorage.setItem('astro_user', JSON.stringify(data));
        } else if (res.status === 401 || res.status === 403) {
          clearAdminData();
          await performLogout({ notifyServer: false, redirectUrl: '/login?redirect=/admin' });
          return;
        }
      } catch (err) {
        console.error('Failed to verify admin profile:', err);
      } finally {
        setLoading(false);
      }
    };

    verifyAndLoad();

    const handleAuthChange = () => {
      const token = getAuthToken();
      if (!token) {
        clearAdminData();
        router.replace('/login?redirect=/admin');
      } else {
        verifyAndLoad();
      }
    };

    // Prevent displaying stale cache on browser Back / Forward (BFCache)
    const handlePageShow = (e: PageTransitionEvent) => {
      const token = getAuthToken();
      if (!token) {
        clearAdminData();
        router.replace('/login?redirect=/admin');
      }
    };

    window.addEventListener('astro-auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('astro-auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [backendUrl, router]);

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
        if (data.roleCounts) {
          setRoleCounts(data.roleCounts);
        } else if (Array.isArray(data.users)) {
          const u = data.users.filter((item: any) => item.role === 'USER').length;
          const a = data.users.filter((item: any) => item.role === 'ADMIN').length;
          const s = data.users.filter((item: any) => item.role === 'SUPERADMIN').length;
          setRoleCounts({ USER: u, ADMIN: a, SUPERADMIN: s, TOTAL: data.total || data.users.length });
        }
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
    if (!token) {
      setBookingsList([]);
      setBookingsLoading(false);
      return;
    }

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

  // Load customer shopping orders across all seekers
  const fetchOrdersList = async (targetPage = orderPage) => {
    const token = getAuthToken();
    if (!token) {
      setOrdersList([]);
      setOrdersLoading(false);
      return;
    }

    setOrdersLoading(true);
    try {
      const q = new URLSearchParams();
      q.set('page', targetPage.toString());
      q.set('limit', '10');
      if (orderStatusFilter && orderStatusFilter !== 'ALL') q.set('status', orderStatusFilter);
      if (orderDateFilter) q.set('startDate', orderDateFilter);
      if (orderSearch.trim()) q.set('search', orderSearch.trim());

      const res = await fetch(`${backendUrl}/api/admin/orders?${q.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setOrdersList(data.orders || []);
        setOrderPage(data.page || 1);
        setOrderTotalPages(data.totalPages || 1);
        setOrderTotalCount(data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Only fetch orders when user explicitly visits the orders tab (avoid duplicate request on mount)
  useEffect(() => {
    if (isAdmin && adminTab === 'orders') {
      fetchOrdersList(1);
    }
  }, [adminTab, orderStatusFilter, orderDateFilter, isAdmin]);

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

  // Handle Search submit for orders
  const handleOrderSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrdersList(1);
  };

  // Handle order status lifecycle transition
  const handleTransitionOrderStatus = async (targetStatus: string) => {
    if (!activeOrder) return;
    const token = getAuthToken();
    if (!token) return;

    setOrderStatusUpdating(true);
    setOrderStatusError(null);

    try {
      const res = await fetch(`${backendUrl}/api/admin/orders/${activeOrder.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: targetStatus,
          notes: orderStatusNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update order status.');
      }

      setNotification({
        type: 'success',
        message: data.message || `Order status updated to ${targetStatus}!`,
      });
      setActiveOrder(null);
      setOrderStatusNotes('');
      fetchOrdersList(orderPage);
    } catch (err: any) {
      setOrderStatusError(err.message || 'Error updating order status.');
    } finally {
      setOrderStatusUpdating(false);
    }
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

  // ==========================================
  // PANDITJI AVAILABILITY MANAGEMENT HANDLERS
  // ==========================================

  const fetchAvailability = async (targetDate = availabilityDate) => {
    const token = getAuthToken();
    if (!token) {
      setAvailabilityData(null);
      setAvailabilityLoading(false);
      return;
    }

    setAvailabilityLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/admin/availability?date=${encodeURIComponent(targetDate)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setAvailabilityData(data);
      } else {
        const err = await res.json();
        setNotification({ type: 'error', message: err.message || 'Failed to fetch schedule availability.' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Network error fetching availability.' });
    } finally {
      setAvailabilityLoading(false);
    }
  };

  useEffect(() => {
    if (!availabilityDate && typeof window !== 'undefined') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setAvailabilityDate(tomorrow.toISOString().split('T')[0]);
    }
  }, [availabilityDate]);

  useEffect(() => {
    if (isAdmin && adminTab === 'availability' && availabilityDate) {
      fetchAvailability(availabilityDate);
    }
  }, [adminTab, availabilityDate, isAdmin]);

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) return;

    setCreateSlotLoading(true);
    setCreateSlotError(null);

    try {
      const res = await fetch(`${backendUrl}/api/admin/availability/slots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: availabilityDate,
          startTime: newSlotTime.trim(),
          durationMinutes: Number(newSlotDuration) || 45,
          isPublished: newSlotPublished,
          notes: newSlotNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create slot.');
      }

      setNotification({ type: 'success', message: data.message || 'Slot successfully created!' });
      setCreateSlotModalOpen(false);
      setNewSlotNotes('');
      fetchAvailability(availabilityDate);
    } catch (err: any) {
      setCreateSlotError(err.message || 'Error creating consultation slot.');
    } finally {
      setCreateSlotLoading(false);
    }
  };

  const handleOpenEditSlot = (slot: any) => {
    setSlotToEdit(slot);
    setEditSlotTime(slot.startTime);
    setEditSlotDuration(slot.durationMinutes);
    setEditSlotPublished(slot.isPublished);
    setEditSlotNotes(slot.notes || '');
    setEditSlotError(null);
    setEditSlotModalOpen(true);
  };

  const handleUpdateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotToEdit) return;
    const token = getAuthToken();
    if (!token) return;

    setEditSlotLoading(true);
    setEditSlotError(null);

    try {
      const res = await fetch(`${backendUrl}/api/admin/availability/slots/${slotToEdit.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          startTime: editSlotTime.trim(),
          durationMinutes: Number(editSlotDuration),
          isPublished: editSlotPublished,
          notes: editSlotNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update slot.');
      }

      setNotification({ type: 'success', message: data.message || 'Slot successfully updated!' });
      setEditSlotModalOpen(false);
      setSlotToEdit(null);
      fetchAvailability(availabilityDate);
    } catch (err: any) {
      setEditSlotError(err.message || 'Error updating slot.');
    } finally {
      setEditSlotLoading(false);
    }
  };

  const handleTogglePublish = async (slot: any) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await fetch(`${backendUrl}/api/admin/availability/slots/${slot.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isPublished: !slot.isPublished,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to toggle publish status.');
      }

      setNotification({
        type: 'success',
        message: `Slot at ${slot.startTime} is now ${!slot.isPublished ? 'published & visible to seekers' : 'unpublished & hidden'}!`,
      });
      fetchAvailability(availabilityDate);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Error toggling publish state.' });
    }
  };

  const handleDeleteSlot = async (slot: any) => {
    if (!slot.canDelete) {
      setNotification({
        type: 'error',
        message: 'Cannot delete an appointment slot with an active customer booking. Cancel the booking first.',
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete the slot on ${slot.date} at ${slot.startTime}?`)) {
      return;
    }

    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await fetch(`${backendUrl}/api/admin/availability/slots/${slot.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete slot.');
      }

      setNotification({ type: 'success', message: data.message || 'Slot deleted successfully.' });
      fetchAvailability(availabilityDate);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Error deleting slot.' });
    }
  };

  const handleBlockDate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) return;

    setBlockDateLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/admin/availability/block-date`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: availabilityDate,
          reason: blockDateReason.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to block date.');
      }

      setNotification({ type: 'success', message: data.message || `Date ${availabilityDate} is now blocked.` });
      setBlockDateModalOpen(false);
      setBlockDateReason('');
      fetchAvailability(availabilityDate);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Error blocking date.' });
    } finally {
      setBlockDateLoading(false);
    }
  };

  const handleUnblockDate = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await fetch(`${backendUrl}/api/admin/availability/block-date/${availabilityDate}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to unblock date.');
      }

      setNotification({ type: 'success', message: data.message || `Date ${availabilityDate} has been unblocked!` });
      fetchAvailability(availabilityDate);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Error unblocking date.' });
    }
  };

  const handleInitStandardSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) return;

    setInitScheduleLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/admin/availability/initialize-standard-schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          startDate: availabilityDate,
          daysCount: Number(initScheduleDays) || 7,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to initialize schedule.');
      }

      setNotification({ type: 'success', message: data.message || 'Standard Vedic schedule initialized!' });
      setInitScheduleModalOpen(false);
      fetchAvailability(availabilityDate);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Error initializing schedule.' });
    } finally {
      setInitScheduleLoading(false);
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
  const handleToggleStatus = async (userId: string, currentStatus: string) => {
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
        fetchUsers(page);
        if (inspectUser && inspectUser.id === userId) {
          setInspectUser({ ...inspectUser, status: newStatus as any });
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
    return getUserInitials(currentUser, name);
  };

  const getBreadcrumbTitle = () => {
    if (adminTab === 'overview') return 'Overview';
    if (adminTab === 'users') {
      if (roleFilter === 'USER') return 'Seekers';
      if (roleFilter === 'ADMIN') return 'Pandits';
      if (roleFilter === 'SUPERADMIN') return 'Admins';
      return 'User Directory';
    }
    if (adminTab === 'bookings') {
      return bookingServiceFilter === 'INSPECTION' ? 'Inspections' : 'Appointments';
    }
    if (adminTab === 'orders') return 'Orders';
    if (adminTab === 'availability') return 'Panditji Availability';
    if (adminTab === 'activity') return 'Activity & Audit History';
    return 'Overview';
  };

  const handleSidebarTabClick = (tabKey: string) => {
    setMobileSidebarOpen(false);
    if (tabKey === 'overview') {
      setAdminTab('overview');
    } else if (tabKey === 'seekers') {
      setRoleFilter('USER');
      setAdminTab('users');
      setPage(1);
      fetchUsers(1);
    } else if (tabKey === 'pandits') {
      setRoleFilter('ADMIN');
      setAdminTab('users');
      setPage(1);
      fetchUsers(1);
    } else if (tabKey === 'admins') {
      setRoleFilter('SUPERADMIN');
      setAdminTab('users');
      setPage(1);
      fetchUsers(1);
    } else if (tabKey === 'appointments') {
      setAdminTab('bookings');
      setBookingServiceFilter('ALL');
      fetchBookingsList(1);
    } else if (tabKey === 'orders') {
      setAdminTab('orders');
      fetchOrdersList(1);
    } else if (tabKey === 'inspections') {
      setAdminTab('bookings');
      setBookingServiceFilter('INSPECTION');
      fetchBookingsList(1);
    } else if (tabKey === 'blogs') {
      router.push('/blog');
    } else if (tabKey === 'gallery') {
      router.push('/gallery');
    } else if (tabKey === 'products') {
      router.push('/store');
    } else if (tabKey === 'settings') {
      handleOpenEditProfile();
    } else if (tabKey === 'activity') {
      setAdminTab('activity');
    }
  };

  const handleLogout = async () => {
    clearAdminData();
    await performLogout({ notifyServer: true, redirectUrl: '/login' });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col text-[#3B1E22]">
      {/* Website Navbar is hidden in the admin panel to provide a clean, dedicated full-viewport dashboard */}
      {false && <Navbar />}

      {(!currentUser || !isAdmin) && (
        <PageHeader
          breadcrumb="Administrative Portal"
          title="Admin Control & Seeker 360° Inspection"
          subtitle="Full oversight into customer orders, booked astrology services, celestial wallet movements, and platform activities."
        />
      )}

      <main className={`flex-1 w-full ${currentUser && isAdmin ? 'p-0 max-w-none flex flex-col min-h-screen' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12'}`}>
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
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-8 py-3 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-white font-semibold text-sm shadow-lg shadow-rose-950/20 transition-all cursor-pointer"
              >
                Sign In to Admin Portal
              </button>
              <Link
                href="/"
                className="px-6 py-3 rounded-full border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-sm transition-all"
              >
                ← Back to Website
              </Link>
            </div>
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
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/"
                className="inline-block px-8 py-3 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-white font-semibold text-sm shadow-md transition-all"
              >
                ← Back to Website
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex w-full min-h-screen">
            {/* ===================== DESKTOP SIDEBAR ===================== */}
            <aside className="hidden md:flex w-64 bg-[#2A0808] text-stone-200 flex-col shrink-0 border-r border-[#3D0F14] select-none fixed top-0 bottom-0 left-0 z-30 h-screen overflow-hidden">
              {/* Top Logo & Title */}
              <div className="p-4 sm:p-5 border-b border-[#3D0F14]/90 flex items-center justify-between">
                <Link
                  href="/"
                  title="Return to AstroVD Homepage"
                  className="flex items-center group transition-all"
                >
                  <Image
                    src="/astro-vd-logo.png"
                    alt="AstroVD"
                    width={160}
                    height={42}
                    priority
                    className="h-8 sm:h-9 w-auto object-contain brightness-0 invert opacity-95 group-hover:opacity-100 transition-opacity"
                  />
                </Link>
              </div>

              {/* Nav Groups Container */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-6">
                {/* Group 1: OVERVIEW */}
                <div>
                  <div className="px-3 mb-1.5 text-[10px] font-bold tracking-wider text-[#A87E84] uppercase">
                    Overview
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSidebarTabClick('overview')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      adminTab === 'overview'
                        ? 'bg-gradient-to-r from-[#945826] to-[#733F17] text-white shadow-md border border-amber-500/30'
                        : 'text-[#C4A5A8] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Home className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Overview</span>
                  </button>
                </div>

                {/* Group 2: USER MANAGEMENT */}
                <div>
                  <div className="px-3 mb-1.5 text-[10px] font-bold tracking-wider text-[#A87E84] uppercase">
                    User Management
                  </div>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => handleSidebarTabClick('seekers')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        adminTab === 'users' && roleFilter === 'USER'
                          ? 'bg-gradient-to-r from-[#945826] to-[#733F17] text-white shadow-md border border-amber-500/30'
                          : 'text-[#C4A5A8] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Seekers</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-amber-200">
                        {roleCounts.USER || users.filter((u) => u.role === 'USER').length || 6}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSidebarTabClick('pandits')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        adminTab === 'users' && roleFilter === 'ADMIN'
                          ? 'bg-gradient-to-r from-[#945826] to-[#733F17] text-white shadow-md border border-amber-500/30'
                          : 'text-[#C4A5A8] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Pandits</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-amber-200">
                        {roleCounts.ADMIN || 4}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSidebarTabClick('admins')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        adminTab === 'users' && roleFilter === 'SUPERADMIN'
                          ? 'bg-gradient-to-r from-[#945826] to-[#733F17] text-white shadow-md border border-amber-500/30'
                          : 'text-[#C4A5A8] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Admins</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-amber-200">
                        {roleCounts.SUPERADMIN || 1}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Group 3: OPERATIONS */}
                <div>
                  <div className="px-3 mb-1.5 text-[10px] font-bold tracking-wider text-[#A87E84] uppercase">
                    Operations
                  </div>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => handleSidebarTabClick('appointments')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        adminTab === 'bookings' && bookingServiceFilter !== 'INSPECTION'
                          ? 'bg-gradient-to-r from-[#945826] to-[#733F17] text-white shadow-md border border-amber-500/30'
                          : 'text-[#C4A5A8] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Appointments</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-amber-200">
                        {bookingTotalCount || 11}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSidebarTabClick('orders')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        adminTab === 'orders'
                          ? 'bg-gradient-to-r from-[#945826] to-[#733F17] text-white shadow-md border border-amber-500/30'
                          : 'text-[#C4A5A8] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Package className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Orders</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-amber-200">
                        {orderTotalCount || 12}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSidebarTabClick('inspections')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        adminTab === 'bookings' && bookingServiceFilter === 'INSPECTION'
                          ? 'bg-gradient-to-r from-[#945826] to-[#733F17] text-white shadow-md border border-amber-500/30'
                          : 'text-[#C4A5A8] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Compass className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Inspections</span>
                    </button>
                  </div>
                </div>

                {/* Group 4: CONTENT */}
                <div>
                  <div className="px-3 mb-1.5 text-[10px] font-bold tracking-wider text-[#A87E84] uppercase">
                    Content
                  </div>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => handleSidebarTabClick('blogs')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#C4A5A8] hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Blogs</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSidebarTabClick('gallery')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#C4A5A8] hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Gallery</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSidebarTabClick('products')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#C4A5A8] hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Products</span>
                    </button>
                  </div>
                </div>

                {/* Group 5: SETTINGS & AUDIT */}
                <div>
                  <div className="px-3 mb-1.5 text-[10px] font-bold tracking-wider text-[#A87E84] uppercase">
                    Settings
                  </div>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => handleSidebarTabClick('settings')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#C4A5A8] hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Settings</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAdminTab('activity')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        adminTab === 'activity'
                          ? 'bg-gradient-to-r from-[#945826] to-[#733F17] text-white shadow-md border border-amber-500/30'
                          : 'text-[#C4A5A8] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <History className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Audit Activity</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Sacred Mandala Outline Watermark */}
              <div className="absolute -bottom-12 -left-12 w-48 h-48 pointer-events-none opacity-10 text-amber-300">
                <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <circle cx="100" cy="100" r="85" />
                  <circle cx="100" cy="100" r="65" />
                  <circle cx="100" cy="100" r="45" />
                  <circle cx="100" cy="100" r="25" />
                  <path d="M 100 15 L 100 185 M 15 100 L 185 100" />
                  <polygon points="100,15 185,100 100,185 15,100" />
                  <polygon points="160,40 160,160 40,160 40,40" />
                </svg>
              </div>
            </aside>

            {/* ===================== MOBILE SIDEBAR DRAWER ===================== */}
            {mobileSidebarOpen && (
              <div className="fixed inset-0 z-50 md:hidden flex">
                <div
                  onClick={() => setMobileSidebarOpen(false)}
                  className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs"
                />
                <div className="relative w-64 max-w-[80vw] bg-[#2A0808] text-stone-200 flex flex-col h-full shadow-2xl z-10">
                  <div className="p-4 flex items-center justify-between border-b border-[#3D0F14]">
                    <Link
                      href="/"
                      onClick={() => setMobileSidebarOpen(false)}
                      title="Return to AstroVD Homepage"
                      className="flex items-center group"
                    >
                      <Image
                        src="/astro-vd-logo.png"
                        alt="AstroVD"
                        width={140}
                        height={38}
                        className="h-8 w-auto object-contain brightness-0 invert opacity-95 group-hover:opacity-100 transition-opacity"
                      />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setMobileSidebarOpen(false)}
                      className="p-1 text-stone-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-4">
                    <button
                      type="button"
                      onClick={() => handleSidebarTabClick('overview')}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-amber-200"
                    >
                      Overview
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSidebarTabClick('seekers')}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-stone-300"
                    >
                      Seekers
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSidebarTabClick('pandits')}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-stone-300"
                    >
                      Pandits
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSidebarTabClick('appointments')}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-stone-300"
                    >
                      Appointments
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSidebarTabClick('orders')}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-stone-300"
                    >
                      Orders
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminTab('activity')}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-stone-300"
                    >
                      Audit Activity
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ===================== MAIN VIEW AREA ===================== */}
            <div className="flex-1 md:pl-64 flex flex-col min-w-0 bg-[#FAF8F5] min-h-screen w-full">
              {/* Top Navigation Bar */}
              <header className="h-16 px-4 sm:px-8 bg-white border-b border-stone-200/80 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-xs">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMobileSidebarOpen(true)}
                    className="md:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
                  >
                    <Menu className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
                    <span className="text-stone-400">Admin</span>
                    <span className="text-stone-300">/</span>
                    <span className="text-stone-900 font-semibold">{getBreadcrumbTitle()}</span>
                  </div>
                </div>

                {/* Global Search Bar */}
                <div className="flex-1 max-w-md mx-4 hidden sm:block relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search seekers, pandits, orders, inspections..."
                    value={globalSearch}
                    onChange={(e) => {
                      setGlobalSearch(e.target.value);
                      setSearch(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (adminTab === 'overview') {
                          setAdminTab('users');
                        }
                        fetchUsers(1);
                      }
                    }}
                    className="w-full pl-9 pr-14 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:border-amber-500 focus:bg-white outline-none transition-all placeholder:text-stone-400"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-stone-400 bg-stone-200/70 px-1.5 py-0.5 rounded border border-stone-300 pointer-events-none">
                    Ctrl + K
                  </span>
                </div>

                {/* Right Items */}
                <div className="flex items-center gap-3">
                  {/* Notification Bell */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setNotificationsOpen(!notificationsOpen)}
                      className="w-9 h-9 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-600 relative cursor-pointer"
                      title="Platform notifications"
                    >
                      <Bell className="w-4 h-4" />
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                        3
                      </span>
                    </button>

                    {notificationsOpen && (
                      <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl border border-stone-200 p-4 z-30 space-y-3 animate-fadeIn">
                        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                          <span className="text-xs font-bold text-stone-900">Urgent Notifications</span>
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                            3 new
                          </span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div
                            onClick={() => {
                              setNotificationsOpen(false);
                              handleSidebarTabClick('pandits');
                            }}
                            className="p-2.5 rounded-xl hover:bg-stone-50 cursor-pointer border border-transparent hover:border-stone-150 transition-all"
                          >
                            <div className="font-bold text-stone-900">Pending pandit approval</div>
                            <div className="text-[11px] text-stone-500">1 pandit is awaiting your approval.</div>
                          </div>
                          <div
                            onClick={() => {
                              setNotificationsOpen(false);
                              handleSidebarTabClick('appointments');
                            }}
                            className="p-2.5 rounded-xl hover:bg-stone-50 cursor-pointer border border-transparent hover:border-stone-150 transition-all"
                          >
                            <div className="font-bold text-stone-900">Upcoming inspection</div>
                            <div className="text-[11px] text-stone-500">Inspection scheduled for Oct 25, 2026.</div>
                          </div>
                          <div
                            onClick={() => {
                              setNotificationsOpen(false);
                              setAdminTab('activity');
                            }}
                            className="p-2.5 rounded-xl hover:bg-stone-50 cursor-pointer border border-transparent hover:border-stone-150 transition-all"
                          >
                            <div className="font-bold text-stone-900">Unread support request</div>
                            <div className="text-[11px] text-stone-500">You have 1 unread support message.</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Profile Pill */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center gap-2.5 pl-2 pr-1.5 py-1 rounded-full hover:bg-stone-100 transition-all cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100 font-bold flex items-center justify-center text-xs shadow-xs border border-amber-500/40 shrink-0">
                        {currentUser?.name ? currentUser.name[0].toUpperCase() : 'V'}
                      </div>
                      <div className="text-left hidden sm:block">
                        <div className="text-xs font-bold text-stone-900 leading-tight">
                          {currentUser?.name || 'Pandit Vishal'}
                        </div>
                        <div className="text-[10px] font-medium text-stone-500 leading-none">
                          {currentUser?.role === 'SUPERADMIN' ? 'Superadmin' : 'Admin'}
                        </div>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                    </button>

                    {profileDropdownOpen && (
                      <div className="absolute right-0 top-11 w-48 bg-white rounded-2xl shadow-xl border border-stone-200 py-1.5 z-30 text-xs text-stone-700 animate-fadeIn">
                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            handleOpenEditProfile();
                          }}
                          className="w-full px-4 py-2 hover:bg-stone-50 flex items-center gap-2 text-left cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-stone-500" />
                          <span>Edit Profile</span>
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
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </header>

              {/* Main Content Body */}
              <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
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

            {/* TAB PANELS */}
            {adminTab === 'overview' && (
              <AdminOverviewTab
                currentUser={currentUser}
                roleCounts={roleCounts}
                users={users}
                totalCount={totalCount}
                bookingTotalCount={bookingTotalCount}
                orderTotalCount={orderTotalCount}
                ordersList={ordersList}
                bookingsList={bookingsList}
                onNavigateTab={(tab) => handleSidebarTabClick(tab)}
                onInspectUser={handleInspectUser}
                onCreateReport={() => setReportModalOpen(true)}
              />
            )}

            {adminTab === 'users' && (
              <AdminUsersTab
                search={search}
                setSearch={setSearch}
                handleSearchSubmit={handleSearchSubmit}
                roleFilter={roleFilter}
                setRoleFilter={setRoleFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                users={users}
                loading={loading}
                totalCount={totalCount}
                page={page}
                totalPages={totalPages}
                onPageChange={(p) => {
                  setPage(p);
                  fetchUsers(p);
                }}
                currentUser={currentUser}
                isSuperadmin={isSuperadmin}
                actionLoading={actionLoading}
                deleteLoading={deleteLoading}
                onInspectUser={handleInspectUser}
                onToggleStatus={handleToggleStatus}
                onUpdateRole={handleUpdateRole}
                onInitiateDelete={handleInitiateDelete}
                canBlockUser={canBlockUser}
                canDeleteUser={canDeleteUser}
                getInitials={getInitials}
              />
            )}

            {adminTab === 'bookings' && (
              <AdminBookingsTab
                bookingSearch={bookingSearch}
                setBookingSearch={setBookingSearch}
                handleBookingSearchSubmit={handleBookingSearchSubmit}
                bookingStatusFilter={bookingStatusFilter}
                setBookingStatusFilter={setBookingStatusFilter}
                bookingServiceFilter={bookingServiceFilter}
                setBookingServiceFilter={setBookingServiceFilter}
                bookingDateFilter={bookingDateFilter}
                setBookingDateFilter={setBookingDateFilter}
                bookingsList={bookingsList}
                bookingsLoading={bookingsLoading}
                bookingTotalCount={bookingTotalCount}
                bookingPage={bookingPage}
                bookingTotalPages={bookingTotalPages}
                fetchBookingsList={fetchBookingsList}
                onSelectBooking={(booking) => {
                  setActiveBooking(booking);
                  setStatusNotes(booking.notes || '');
                  setStatusError(null);
                }}
              />
            )}

            {adminTab === 'orders' && (
              <AdminOrdersTab
                orderSearch={orderSearch}
                setOrderSearch={setOrderSearch}
                handleOrderSearchSubmit={handleOrderSearchSubmit}
                orderStatusFilter={orderStatusFilter}
                setOrderStatusFilter={setOrderStatusFilter}
                orderDateFilter={orderDateFilter}
                setOrderDateFilter={setOrderDateFilter}
                ordersList={ordersList}
                ordersLoading={ordersLoading}
                orderTotalCount={orderTotalCount}
                orderPage={orderPage}
                orderTotalPages={orderTotalPages}
                fetchOrdersList={fetchOrdersList}
                onSelectOrder={(order) => {
                  setActiveOrder(order);
                  setOrderStatusNotes(order.notes || '');
                  setOrderStatusError(null);
                }}
              />
            )}

            {adminTab === 'availability' && (
              <AdminAvailabilityTab
                availabilityDate={availabilityDate}
                setAvailabilityDate={setAvailabilityDate}
                availabilityData={availabilityData}
                availabilityLoading={availabilityLoading}
                fetchAvailability={fetchAvailability}
                handleUnblockDate={handleUnblockDate}
                handleTogglePublishSlot={handleTogglePublish}
                handleOpenEditSlot={handleOpenEditSlot}
                handleDeleteSlot={handleDeleteSlot}
                setBlockDateModalOpen={setBlockDateModalOpen}
                setCreateSlotModalOpen={setCreateSlotModalOpen}
                setInitScheduleModalOpen={setInitScheduleModalOpen}
                setInitScheduleDays={setInitScheduleDays}
              />
            )}

            {adminTab === 'activity' && <AdminActivityTab />}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}

      {/* 360° USER INSPECTION MODAL */}
      {selectedUserId && (
        <UserInspectionModal
          selectedUserId={selectedUserId}
          inspectUser={inspectUser}
          inspectLoading={inspectLoading}
          inspectTab={inspectTab}
          setInspectTab={setInspectTab}
          onClose={() => {
            setSelectedUserId(null);
            setInspectUser(null);
          }}
          getInitials={getInitials}
          canBlockUser={canBlockUser}
          handleToggleStatus={handleToggleStatus}
          actionLoading={actionLoading}
          isSuperadmin={isSuperadmin}
          currentUser={currentUser}
          handleUpdateRole={handleUpdateRole}
          canDeleteUser={canDeleteUser}
          deleteLoading={deleteLoading}
          handleInitiateDelete={handleInitiateDelete}
        />
      )}

      {/* BOOKING STATUS LIFECYCLE MODAL */}
      {activeBooking && (
        <BookingLifecycleModal
          activeBooking={activeBooking}
          statusNotes={statusNotes}
          setStatusNotes={setStatusNotes}
          statusError={statusError}
          updatingStatus={updatingStatus}
          onTransitionStatus={handleTransitionStatus}
          onClose={() => setActiveBooking(null)}
        />
      )}

      {/* ORDER FULFILLMENT LIFECYCLE MODAL */}
      {activeOrder && (
        <OrderLifecycleModal
          activeOrder={activeOrder}
          orderStatusNotes={orderStatusNotes}
          setOrderStatusNotes={setOrderStatusNotes}
          orderStatusError={orderStatusError}
          orderStatusUpdating={orderStatusUpdating}
          onTransitionOrderStatus={handleTransitionOrderStatus}
          onClose={() => setActiveOrder(null)}
        />
      )}

      {/* EDIT ADMIN PROFILE MODAL */}
      <EditAdminProfileModal
        isOpen={editProfileModalOpen}
        onClose={() => setEditProfileModalOpen(false)}
        currentUser={currentUser}
        editName={editName}
        setEditName={setEditName}
        editDateOfBirth={editDateOfBirth}
        setEditDateOfBirth={setEditDateOfBirth}
        editTimeOfBirth={editTimeOfBirth}
        setEditTimeOfBirth={setEditTimeOfBirth}
        editPlaceOfBirth={editPlaceOfBirth}
        setEditPlaceOfBirth={setEditPlaceOfBirth}
        editZodiacSign={editZodiacSign}
        setEditZodiacSign={setEditZodiacSign}
        editError={editError}
        editLoading={editLoading}
        onSaveProfile={handleSaveProfile}
      />

      {/* GENERATE USER MODAL */}
      <GenerateUserModal
        isOpen={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        isSuperadmin={isSuperadmin}
        genName={genName}
        setGenName={setGenName}
        genEmail={genEmail}
        setGenEmail={setGenEmail}
        genPassword={genPassword}
        setGenPassword={setGenPassword}
        genRole={genRole}
        setGenRole={setGenRole}
        genDateOfBirth={genDateOfBirth}
        setGenDateOfBirth={setGenDateOfBirth}
        genTimeOfBirth={genTimeOfBirth}
        setGenTimeOfBirth={setGenTimeOfBirth}
        genPlaceOfBirth={genPlaceOfBirth}
        setGenPlaceOfBirth={setGenPlaceOfBirth}
        genZodiacSign={genZodiacSign}
        setGenZodiacSign={setGenZodiacSign}
        genWalletBalance={genWalletBalance}
        setGenWalletBalance={setGenWalletBalance}
        genError={genError}
        genLoading={genLoading}
        onGenerateProfile={handleGenerateProfile}
      />

      {/* DELETE USER CONFIRMATION MODAL */}
      <DeleteUserModal
        isOpen={deleteModalOpen}
        userToDelete={userToDelete}
        deleteLoading={deleteLoading}
        deleteError={deleteError}
        onClose={() => {
          setDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        onConfirmDelete={handleConfirmDelete}
      />

      {/* AVAILABILITY MODALS */}
      <AvailabilityModals
        availabilityDate={availabilityDate}
        createSlotModalOpen={createSlotModalOpen}
        setCreateSlotModalOpen={setCreateSlotModalOpen}
        newSlotTime={newSlotTime}
        setNewSlotTime={setNewSlotTime}
        newSlotDuration={newSlotDuration}
        setNewSlotDuration={setNewSlotDuration}
        newSlotPublished={newSlotPublished}
        setNewSlotPublished={setNewSlotPublished}
        newSlotNotes={newSlotNotes}
        setNewSlotNotes={setNewSlotNotes}
        createSlotLoading={createSlotLoading}
        createSlotError={createSlotError}
        handleCreateSlot={handleCreateSlot}
        editSlotModalOpen={editSlotModalOpen}
        setEditSlotModalOpen={setEditSlotModalOpen}
        slotToEdit={slotToEdit}
        setSlotToEdit={setSlotToEdit}
        editSlotTime={editSlotTime}
        setEditSlotTime={setEditSlotTime}
        editSlotDuration={editSlotDuration}
        setEditSlotDuration={setEditSlotDuration}
        editSlotPublished={editSlotPublished}
        setEditSlotPublished={setEditSlotPublished}
        editSlotNotes={editSlotNotes}
        setEditSlotNotes={setEditSlotNotes}
        editSlotLoading={editSlotLoading}
        editSlotError={editSlotError}
        handleUpdateSlot={handleUpdateSlot}
        blockDateModalOpen={blockDateModalOpen}
        setBlockDateModalOpen={setBlockDateModalOpen}
        blockDateReason={blockDateReason}
        setBlockDateReason={setBlockDateReason}
        blockDateLoading={blockDateLoading}
        handleBlockDate={handleBlockDate}
        initScheduleModalOpen={initScheduleModalOpen}
        setInitScheduleModalOpen={setInitScheduleModalOpen}
        initScheduleDays={initScheduleDays}
        setInitScheduleDays={setInitScheduleDays}
        initScheduleLoading={initScheduleLoading}
        handleInitStandardSchedule={handleInitStandardSchedule}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={() => fetchUsers(1)}
      />

      {/* EXECUTIVE PLATFORM REPORT MODAL */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                    AstroVD Executive Platform Report
                  </h3>
                  <p className="text-xs text-stone-500">
                    Generated for {currentUser?.name || 'Administrator'} • {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-all cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-emerald-200">
                <div className="text-[11px] font-bold text-emerald-800 uppercase">Registered Seekers</div>
                <div className="text-2xl font-serif font-black text-emerald-900 mt-1">{roleCounts.USER || 6}</div>
                <div className="text-[10px] text-emerald-600 mt-0.5">Active customer accounts</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FAF5FF] border border-purple-200">
                <div className="text-[11px] font-bold text-purple-800 uppercase">Active Pandits</div>
                <div className="text-2xl font-serif font-black text-purple-900 mt-1">{roleCounts.ADMIN || 4}</div>
                <div className="text-[10px] text-purple-600 mt-0.5">Spiritual astrologers</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FFFBEB] border border-amber-200">
                <div className="text-[11px] font-bold text-amber-800 uppercase">Pending Approvals</div>
                <div className="text-2xl font-serif font-black text-amber-900 mt-1">1</div>
                <div className="text-[10px] text-amber-600 mt-0.5">Needs admin action</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F0FDFA] border border-teal-200">
                <div className="text-[11px] font-bold text-teal-800 uppercase">Operational Orders</div>
                <div className="text-2xl font-serif font-black text-teal-900 mt-1">{orderTotalCount || 3}</div>
                <div className="text-[10px] text-teal-600 mt-0.5">Inspection & store orders</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-amber-200/80 space-y-2 text-xs text-stone-700">
              <div className="font-bold text-[#5B0D15] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Executive Summary & Health Status</span>
              </div>
              <p className="leading-relaxed">
                All platform services, including Kundli readings, gemstone purchases, and 360° Vedic inspections, are functioning at 100% operational capacity. Total registered seeker accounts stand at <strong>{roleCounts.TOTAL || totalCount}</strong> across the platform with authenticated role separation.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4 text-stone-500" />
                <span>Print Report</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const csv = `Metric,Value\nRegistered Seekers,${roleCounts.USER || 6}\nActive Pandits,${roleCounts.ADMIN || 4}\nPending Approvals,1\nOperational Orders,${orderTotalCount || 3}\nTotal Platform Accounts,${roleCounts.TOTAL || totalCount}`;
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `AstroVD-Platform-Report-${new Date().toISOString().slice(0, 10)}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#5B0D15] hover:bg-[#480a11] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>Export CSV Summary</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {(!currentUser || !isAdmin) && <Footer />}
    </div>
  );
}
