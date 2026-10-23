'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import {
  UserSummary,
  DetailedUser,
  DeletableUser,
  getUserInitials,
  getAvatarBackground,
} from './types';
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

  // Admin Top-level Navigation: Users Directory vs Customer Appointments vs Shopping Orders vs Panditji Availability vs Content Activity
  const [adminTab, setAdminTab] = useState<'users' | 'bookings' | 'orders' | 'availability' | 'activity'>('users');

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
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full ${getAvatarBackground(
                    currentUser.role
                  )} font-bold flex items-center justify-center shadow-lg border ring-4 shrink-0 ${
                    getInitials(currentUser.name).length > 1
                      ? 'text-xl sm:text-2xl tracking-tight'
                      : 'text-2xl sm:text-3xl font-extrabold'
                  }`}
                >
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

            {/* Elegant Quick Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {/* Card 1: Registered Accounts / Total */}
              <button
                type="button"
                onClick={() => {
                  setRoleFilter('');
                  setPage(1);
                }}
                className={`relative text-left w-full overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-4.5 md:p-5 transition-all duration-300 group cursor-pointer border ${
                  roleFilter === ''
                    ? 'bg-gradient-to-br from-rose-50/90 via-white to-amber-50/60 border-[#5B0D15] shadow-md ring-2 ring-[#5B0D15]/20'
                    : 'bg-white/95 hover:bg-stone-50/90 border-stone-200/80 hover:border-amber-300 shadow-xs hover:shadow-sm'
                }`}
                title="Click to view all registered platform accounts"
              >
                <div className="flex items-center justify-between gap-2 mb-2 sm:mb-2.5">
                  <span className="text-[11px] sm:text-xs font-bold text-stone-600 tracking-wide truncate">
                    Registered Users
                  </span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-rose-50 border border-rose-200/70 text-[#5B0D15] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xl sm:text-2xl md:text-3xl font-serif font-black text-[#3B1E22] tracking-tight">
                    {roleCounts.TOTAL || totalCount}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-rose-800 bg-rose-100/70 px-2 py-0.5 rounded-full shrink-0">
                    Directory
                  </span>
                </div>
                <div className="text-[10px] sm:text-[11px] text-stone-500 font-medium truncate">
                  Total seeker accounts
                </div>
              </button>

              {/* Card 2: Seeker Accounts (USER) */}
              <button
                type="button"
                onClick={() => {
                  setRoleFilter(roleFilter === 'USER' ? '' : 'USER');
                  setPage(1);
                }}
                className={`relative text-left w-full overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-4.5 md:p-5 transition-all duration-300 group cursor-pointer border ${
                  roleFilter === 'USER'
                    ? 'bg-gradient-to-br from-emerald-50/90 via-white to-amber-50/60 border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-white/95 hover:bg-stone-50/90 border-stone-200/80 hover:border-emerald-300 shadow-xs hover:shadow-sm'
                }`}
                title="Click to filter by standard Seekers (USER)"
              >
                <div className="flex items-center justify-between gap-2 mb-2 sm:mb-2.5">
                  <span className="text-[11px] sm:text-xs font-bold text-stone-600 tracking-wide truncate">
                    Seeker Accounts
                  </span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xl sm:text-2xl md:text-3xl font-serif font-black text-emerald-800 tracking-tight">
                    {roleCounts.USER || users.filter((u) => u.role === 'USER').length || 0}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full shrink-0">
                    Role: USER
                  </span>
                </div>
                <div className="text-[10px] sm:text-[11px] text-stone-500 font-medium truncate">
                  Orders, bookings, clicks
                </div>
              </button>

              {/* Card 3: Platform Admins (ADMIN) */}
              <button
                type="button"
                onClick={() => {
                  setRoleFilter(roleFilter === 'ADMIN' ? '' : 'ADMIN');
                  setPage(1);
                }}
                className={`relative text-left w-full overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-4.5 md:p-5 transition-all duration-300 group cursor-pointer border ${
                  roleFilter === 'ADMIN'
                    ? 'bg-gradient-to-br from-amber-50/90 via-white to-amber-100/60 border-amber-600 shadow-md ring-2 ring-amber-500/20'
                    : 'bg-white/95 hover:bg-stone-50/90 border-stone-200/80 hover:border-amber-300 shadow-xs hover:shadow-sm'
                }`}
                title="Click to filter by Platform Administrators (ADMIN)"
              >
                <div className="flex items-center justify-between gap-2 mb-2 sm:mb-2.5">
                  <span className="text-[11px] sm:text-xs font-bold text-stone-600 tracking-wide truncate">
                    Platform Admins
                  </span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-700 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xl sm:text-2xl md:text-3xl font-serif font-black text-amber-800 tracking-tight">
                    {roleCounts.ADMIN || users.filter((u) => u.role === 'ADMIN').length || 0}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full shrink-0">
                    Role: ADMIN
                  </span>
                </div>
                <div className="text-[10px] sm:text-[11px] text-stone-500 font-medium truncate">
                  Video, Audio, Chat Services
                </div>
              </button>

              {/* Card 4: Platform Owner (SUPERADMIN) */}
              <button
                type="button"
                onClick={() => {
                  setRoleFilter(roleFilter === 'SUPERADMIN' ? '' : 'SUPERADMIN');
                  setPage(1);
                }}
                className={`relative text-left w-full overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-4.5 md:p-5 transition-all duration-300 group cursor-pointer border ${
                  roleFilter === 'SUPERADMIN'
                    ? 'bg-gradient-to-br from-purple-50/90 via-white to-amber-50/60 border-purple-600 shadow-md ring-2 ring-purple-500/20'
                    : 'bg-white/95 hover:bg-stone-50/90 border-stone-200/80 hover:border-purple-300 shadow-xs hover:shadow-sm'
                }`}
                title="Click to filter by Platform Owner (SUPERADMIN)"
              >
                <div className="flex items-center justify-between gap-2 mb-2 sm:mb-2.5">
                  <span className="text-[11px] sm:text-xs font-bold text-stone-600 tracking-wide truncate">
                    Superadmin Owner
                  </span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-50 border border-purple-200/70 text-purple-700 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xl sm:text-2xl md:text-3xl font-serif font-black text-purple-900 tracking-tight">
                    {roleCounts.SUPERADMIN || users.filter((u) => u.role === 'SUPERADMIN').length || 0}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-purple-900 bg-purple-100/70 px-2 py-0.5 rounded-full shrink-0">
                    SUPERADMIN
                  </span>
                </div>
                <div className="text-[10px] sm:text-[11px] text-stone-500 font-medium truncate">
                  Master Store &amp; Platform Root
                </div>
              </button>
            </div>

            {/* Top Level Section Switcher */}
            <div className="flex items-center gap-3 border-b border-stone-200/80 pb-3 overflow-x-auto">
              <button
                type="button"
                onClick={() => setAdminTab('users')}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
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
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  adminTab === 'bookings'
                    ? 'bg-[#5B0D15] text-white shadow-md'
                    : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
                }`}
              >
                <Compass className="w-4 h-4 text-amber-500" />
                <span>Customer Appointments &amp; Service Bookings ({bookingTotalCount})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdminTab('orders');
                  fetchOrdersList(1);
                }}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  adminTab === 'orders'
                    ? 'bg-[#5B0D15] text-white shadow-md'
                    : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
                }`}
              >
                <Package className="w-4 h-4 text-amber-500" />
                <span>Customer Shopping Orders ({orderTotalCount})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdminTab('availability');
                  fetchAvailability(availabilityDate);
                }}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  adminTab === 'availability'
                    ? 'bg-[#5B0D15] text-white shadow-md'
                    : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
                }`}
              >
                <Calendar className="w-4 h-4 text-amber-500" />
                <span>Panditji Availability &amp; Slots</span>
              </button>

              <button
                type="button"
                onClick={() => setAdminTab('activity')}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  adminTab === 'activity'
                    ? 'bg-[#5B0D15] text-white shadow-md'
                    : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
                }`}
              >
                <History className="w-4 h-4 text-amber-500" />
                <span>Content &amp; Activity History</span>
              </button>
            </div>

            {/* TAB PANELS */}
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

      <Footer />
    </div>
  );
}
