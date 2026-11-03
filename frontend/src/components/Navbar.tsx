'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  Bell,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Wallet,
  Sparkles,
  Compass,
  BookOpen,
  Image as ImageIcon,
  Phone,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import dynamic from 'next/dynamic';
const AuthModal = dynamic(() => import('./AuthModal').then((mod) => mod.AuthModal), { ssr: false });
const CompleteProfileModal = dynamic(
  () => import('./CompleteProfileModal').then((mod) => mod.CompleteProfileModal),
  { ssr: false }
);
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { performLogout } from '../lib/auth';
import { PRODUCTS_CATALOG } from '../data/products';
import { SERVICES_CATALOGUE } from '../data/servicesData';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { language, toggleLanguage, t } = useLanguage();
  
  // Cart state - accurately reflects 0 items when empty or logged out
  let liveCartCount = 0;
  try {
    const cart = useCart();
    liveCartCount = cart?.totalCount || 0;
  } catch {
    liveCartCount = 0;
  }

  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [userWalletBalance, setUserWalletBalance] = useState<number | null>(null);
  const [adminPendingBookings, setAdminPendingBookings] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  // Profile completion reminders and ribbons are strictly reserved for normal seekers (USER) - never ADMIN or SUPERADMIN
  const isNormalSeeker = user && user.role !== 'ADMIN' && user.role !== 'SUPERADMIN';
  const isProfileIncomplete = isNormalSeeker && (!user.dateOfBirth || !user.placeOfBirth || !user.timeOfBirth);

  useEffect(() => {
    setMounted(true);
  }, []);

  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const aboutDropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const aboutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll glassmorphic state - navbar stays permanently visible at the top during scroll
  useEffect(() => {
    let ticking = false;
    let prevScrolled = typeof window !== 'undefined' ? window.scrollY > 20 : false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const nextScrolled = currentScrollY > 20;

          if (nextScrolled !== prevScrolled) {
            prevScrolled = nextScrolled;
            setScrolled(nextScrolled);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Warm up primary navigation routes immediately for instantaneous millisecond transitions
  useEffect(() => {
    const warmRoutes = ['/services', '/products', '/appointment', '/blog', '/gallery', '/about', '/contact', '/cart'];
    const timer = setTimeout(() => {
      warmRoutes.forEach((route) => {
        try {
          router.prefetch(route);
        } catch {
          // ignore
        }
      });
    }, 50);
    return () => clearTimeout(timer);
  }, [router]);

  // Sync logged in user profile
  useEffect(() => {
    const syncUser = () => {
      const saved = localStorage.getItem('astro_user');
      const token = localStorage.getItem('astro_token');

      let parsedUser: any = null;
      if (saved) {
        try {
          parsedUser = JSON.parse(saved);
          setUser(parsedUser);
          if (typeof parsedUser?.walletBalance === 'number') {
            setUserWalletBalance(parsedUser.walletBalance);
          }
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }

      // Local fallback collections for orders & bookings
      let localOrders: any[] = [];
      try {
        const rawOrders = localStorage.getItem('astro_placed_orders');
        if (rawOrders) localOrders = JSON.parse(rawOrders);
      } catch {}

      let localBookings: any[] = [];
      try {
        const rawBookings =
          localStorage.getItem('astro_confirmed_appointments') ||
          localStorage.getItem('astro_consultations_saved');
        if (rawBookings) localBookings = JSON.parse(rawBookings);
      } catch {}

      if (token) {
        const backendBase = (
          process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api'
        ).replace(/\/api\/?$/, '');

        // 1. Fresh user profile
        fetch(`${backendBase}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => {
            if (res.ok) return res.json();
            if (res.status === 401) {
              performLogout({ notifyServer: false });
            }
            return null;
          })
          .then((freshUser) => {
            if (freshUser) {
              setUser(freshUser);
              localStorage.setItem('astro_user', JSON.stringify(freshUser));
              if (typeof freshUser.walletBalance === 'number') {
                setUserWalletBalance(freshUser.walletBalance);
              }
            }
          })
          .catch(() => {});

        // 2. Live wallet balance
        fetch(`${backendBase}/api/users/me/wallet`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((wData) => {
            if (wData && typeof wData.balance === 'number') {
              setUserWalletBalance(wData.balance);
            }
          })
          .catch(() => {});

        // 3. User consultation bookings
        fetch(`${backendBase}/api/appointments/my-bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((bData) => {
            const list = Array.isArray(bData) ? bData : (bData?.bookings || []);
            if (list.length > 0) {
              setUserBookings(list);
            } else {
              setUserBookings(localBookings);
            }
          })
          .catch(() => {
            setUserBookings(localBookings);
          });

        // 4. User orders
        fetch(`${backendBase}/api/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((oData) => {
            const list = Array.isArray(oData) ? oData : (oData?.orders || []);
            if (list.length > 0) {
              setUserOrders(list);
            } else {
              setUserOrders(localOrders);
            }
          })
          .catch(() => {
            setUserOrders(localOrders);
          });

        // 5. Admin: fetch pending consultation reservations awaiting approval
        const isAdmin = parsedUser?.role === 'ADMIN' || parsedUser?.role === 'SUPERADMIN';
        if (isAdmin) {
          fetch(`${backendBase}/api/admin/bookings?status=PENDING&limit=10`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => (res.ok ? res.json() : null))
            .then((admData) => {
              const list = Array.isArray(admData) ? admData : (admData?.bookings || []);
              setAdminPendingBookings(list);
            })
            .catch(() => {});
        }
      } else {
        setUserWalletBalance(null);
        setUserBookings(localBookings);
        setUserOrders(localOrders);
      }
    };

    const handleAuthEvent = (e: any) => {
      syncUser();
      const eventUser = e?.detail?.user || JSON.parse(localStorage.getItem('astro_user') || 'null');
      const isSeeker = eventUser && eventUser.role !== 'ADMIN' && eventUser.role !== 'SUPERADMIN';
      if (
        isSeeker &&
        (!eventUser.dateOfBirth || !eventUser.placeOfBirth || !eventUser.timeOfBirth)
      ) {
        setTimeout(() => setProfileModalOpen(true), 400);
      }
    };

    syncUser();

    // Check on mount if normal seeker is logged in with incomplete profile (never for admin)
    const savedUser = localStorage.getItem('astro_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        const isSeeker = u && u.role !== 'ADMIN' && u.role !== 'SUPERADMIN';
        if (isSeeker && (!u.dateOfBirth || !u.placeOfBirth || !u.timeOfBirth)) {
          // Open reminder popup on session start only for normal seekers
          setTimeout(() => setProfileModalOpen(true), 1200);
        }
      } catch (err) {}
    }
    window.addEventListener('astro-auth-change', handleAuthEvent);
    window.addEventListener('astro-booking-created', syncUser);
    window.addEventListener('storage', syncUser);

    return () => {
      window.removeEventListener('astro-auth-change', handleAuthEvent);
      window.removeEventListener('astro-booking-created', syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, []);

  // Close dropdowns on outside click or route change
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
      if (
        aboutDropdownRef.current &&
        !aboutDropdownRef.current.contains(event.target as Node)
      ) {
        setAboutDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationOpen(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setAboutDropdownOpen(false);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setSearchOpen(false);
    setNotificationOpen(false);
  }, [pathname]);

  const handleAboutMouseEnter = () => {
    if (aboutTimeoutRef.current) clearTimeout(aboutTimeoutRef.current);
    setAboutDropdownOpen(true);
  };

  const handleAboutMouseLeave = () => {
    aboutTimeoutRef.current = setTimeout(() => {
      setAboutDropdownOpen(false);
    }, 180);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('astro-search-change', { detail: query }));
      }
      router.push(`/products?search=${encodeURIComponent(query)}`);
      setSearchOpen(false);
    }
  };

  // Instant live search matches
  const trimmedSearch = searchQuery.trim().toLowerCase();
  const liveMatchingProducts = trimmedSearch
    ? PRODUCTS_CATALOG.filter((p) => {
        return (
          p.name.toLowerCase().includes(trimmedSearch) ||
          (p.nameHi && p.nameHi.toLowerCase().includes(trimmedSearch)) ||
          p.tag.toLowerCase().includes(trimmedSearch) ||
          p.categoryLabel.toLowerCase().includes(trimmedSearch) ||
          p.planet.toLowerCase().includes(trimmedSearch)
        );
      }).slice(0, 4)
    : [];

  const liveMatchingServices = trimmedSearch
    ? SERVICES_CATALOGUE.filter((s) => {
        return (
          s.title.toLowerCase().includes(trimmedSearch) ||
          s.desc.toLowerCase().includes(trimmedSearch) ||
          s.categoryTag.toLowerCase().includes(trimmedSearch)
        );
      }).slice(0, 2)
    : [];

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

  const getInitials = (name?: string) => getUserInitials(user, name);

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

  const handleLogout = async () => {
    setUser(null);
    setProfileDropdownOpen(false);
    await performLogout();
  };

  // Top level navigation links matching reference design
  const topNavLinks = [
    { name: t('Home', 'होम'), href: '/' },
    { name: t('Services', 'सेवाएं'), href: '/services' },
    { name: t('Products', 'उत्पाद'), href: '/products' },
    { name: t('Consultation', 'परामर्श'), href: '/appointment' },
  ];

  // About Us dropdown items with icons matching reference image
  const aboutDropdownItems = [
    {
      name: t('Who We Are', 'हमारे बारे में'),
      href: '/about',
      icon: Compass,
    },
    {
      name: t('Blogs', 'ब्लॉग्स'),
      href: '/blog',
      icon: BookOpen,
    },
    {
      name: t('Gallery', 'गैलरी'),
      href: '/gallery',
      icon: ImageIcon,
    },
    {
      name: t('Contact Us', 'संपर्क करें'),
      href: '/contact',
      icon: Phone,
    },
  ];

  const isAboutActive =
    pathname === '/about' ||
    pathname === '/blog' ||
    pathname?.startsWith('/blog/') ||
    pathname === '/gallery' ||
    pathname === '/contact';

  // Dynamic, user-specific notifications
  const notifications = React.useMemo(() => {
    const items: Array<{
      id: string;
      icon: string;
      title: string;
      badge?: string;
      badgeColor?: string;
      desc: string;
      time?: string;
      onClick: () => void;
    }> = [];

    if (user) {
      if (isNormalSeeker) {
        // 1. Profile Completion (Action Needed - only when incomplete)
        if (isProfileIncomplete) {
          items.push({
            id: 'profile-incomplete',
            icon: '🪷',
            title: t('Complete Your Vedic Profile', 'वैदिक प्रोफ़ाइल पूर्ण करें'),
            badge: t('Action Needed', 'अनिवार्य'),
            badgeColor: 'text-rose-700 bg-rose-100 border-rose-200',
            desc: t(
              'Add your Date, Time, and Place of birth for personalized astrological consultations and remedies.',
              'सटीक फलादेश व उपायों हेतु जन्म समय, तिथि व स्थान दर्ज करें।'
            ),
            time: t('Important', 'महत्वपूर्ण'),
            onClick: () => {
              setNotificationOpen(false);
              setProfileModalOpen(true);
            },
          });
        }

        // 2. Real Consultation Bookings (Active / Upcoming)
        if (userBookings && userBookings.length > 0) {
          userBookings.slice(0, 3).forEach((b: any, idx: number) => {
            const serviceName = b.serviceTitle || b.serviceName || t('Vedic Consultation', 'वैदिक परामर्श');
            const dateStr = b.date || b.scheduledDate || b.appointmentDate || t('Upcoming', 'आगामी');
            const timeSlot = b.timeSlot || b.scheduledTime || b.slot || '';
            const isBookingConfirmed = b.status === 'CONFIRMED';

            if (isBookingConfirmed) {
              items.push({
                id: `booking-${b.id || idx}`,
                icon: '🗓️',
                title: `${serviceName} - ${t('Consultation Confirmed', 'परामर्श पुष्ट')}`,
                badge: t('Confirmed', 'पुष्ट'),
                badgeColor: 'text-emerald-700 bg-emerald-100 border-emerald-200',
                desc: `${dateStr}${timeSlot ? ` • ${timeSlot}` : ''} ${t('with Dr. Pandit Vishal Dubey. Meeting room unlocks 5m before session.', 'डॉ. पंडित विशाल दुबे के साथ। सत्र से 5 मिनट पूर्व लिंक सक्रिय होगा।')}`,
                time: t('Confirmed', 'पुष्ट'),
                onClick: () => {
                  setNotificationOpen(false);
                  router.push('/dashboard');
                },
              });
            } else if (b.status === 'APPROVED' || b.status === 'PENDING_PAYMENT') {
              items.push({
                id: `booking-${b.id || idx}`,
                icon: '🎉',
                title: `${serviceName} - ${t('Approved! Pay Dakshina to Confirm', 'स्वीकृत! दक्षिणा भुगतान करें')}`,
                badge: t('Pay Now', 'भुगतान करें'),
                badgeColor: 'text-amber-900 bg-amber-100 border-amber-300 animate-pulse',
                desc: `${dateStr}${timeSlot ? ` • ${timeSlot}` : ''} • ${t('Approved by Dr. Pandit Vishal Dubey. Please proceed to payment to confirm booking and access meeting room.', 'पूज्य गुरुजी द्वारा स्वीकृत। कृपया दक्षिणा का भुगतान कर परामर्श पुष्ट करें।')}`,
                time: t('Action Needed', 'अनिवार्य'),
                onClick: () => {
                  setNotificationOpen(false);
                  router.push('/dashboard');
                },
              });
            } else if (b.status === 'CANCELLED' || b.status === 'REJECTED') {
              items.push({
                id: `booking-${b.id || idx}`,
                icon: '⚠️',
                title: `${serviceName} - ${t('Guruji Unavailable (Please Reschedule)', 'गुरुजी अनुपलब्ध (पुनर्निर्धारित करें)')}`,
                badge: t('Reschedule', 'पुनर्निर्धारित'),
                badgeColor: 'text-rose-700 bg-rose-100 border-rose-300',
                desc: `${t('Dr. Pandit Vishal Dubey is unavailable for this slot due to sacred rituals. Please reschedule for another suitable slot.', 'पूज्य गुरुजी धार्मिक अनुष्ठान के कारण अनुपलब्ध हैं। कृपया नया समय चुनें।')}`,
                time: t('Action Needed', 'अनिवार्य'),
                onClick: () => {
                  setNotificationOpen(false);
                  router.push('/dashboard');
                },
              });
            } else {
              items.push({
                id: `booking-${b.id || idx}`,
                icon: '⏳',
                title: `${serviceName} - ${t('Waiting for Admin Approval', 'स्वीकृति प्रतीक्षारत')}`,
                badge: t('Waiting', 'प्रतीक्षारत'),
                badgeColor: 'text-amber-800 bg-amber-100 border-amber-300',
                desc: `${dateStr}${timeSlot ? ` • ${timeSlot}` : ''} • ${t('Consultation request awaiting Admin confirmation. You will be notified upon approval.', 'परामर्श अनुरोध व्यवस्थापक स्वीकृति हेतु प्रतीक्षारत है।')}`,
                time: t('Awaiting Approval', 'प्रतीक्षारत'),
                onClick: () => {
                  setNotificationOpen(false);
                  router.push('/dashboard');
                },
              });
            }
          });
        }

        // 3. Real Orders (Recent order updates)
        if (userOrders && userOrders.length > 0) {
          userOrders.slice(0, 2).forEach((o: any, idx: number) => {
            const orderIdShort = o.orderNumber || (o.id ? o.id.slice(-6).toUpperCase() : `${idx + 1}`);
            const firstItem =
              o.items?.[0]?.product?.name ||
              o.items?.[0]?.name ||
              o.items?.[0]?.title ||
              t('Vedic item', 'वैदिक उत्पाद');
            const moreCount = (o.items?.length || 1) - 1;
            const status = (o.status || 'PROCESSING').toUpperCase();
            items.push({
              id: `order-${o.id || idx}`,
              icon: '📦',
              title: `${t('Order', 'ऑर्डर')} #${orderIdShort}`,
              badge: status,
              badgeColor: 'text-amber-800 bg-amber-100 border-amber-200',
              desc: `${firstItem}${moreCount > 0 ? ` +${moreCount} more` : ''} • ${status === 'DELIVERED' ? t('Delivered', 'डिलीवर') : t('In Progress', 'प्रगति पर')}`,
              time: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : t('Recent', 'हाल ही में'),
              onClick: () => {
                setNotificationOpen(false);
                router.push('/dashboard');
              },
            });
          });
        }

        // 4. Real Wallet Balance Notification
        if (userWalletBalance !== null && userWalletBalance > 0) {
          items.push({
            id: 'wallet-balance',
            icon: '🪙',
            title: t('Astro Wallet Active', 'एस्ट्रो वॉलेट सक्रिय'),
            badge: `₹${userWalletBalance}`,
            badgeColor: 'text-amber-800 bg-amber-100 border-amber-200',
            desc: t(
              `₹${userWalletBalance} balance available for 1-on-1 consultations & energized remedies.`,
              `परामर्श व सिद्ध उपायों हेतु ₹${userWalletBalance} बैलेंस उपलब्ध है।`
            ),
            time: t('Available', 'उपलब्ध'),
            onClick: () => {
              setNotificationOpen(false);
              router.push('/dashboard');
            },
          });
        }

        // 5. If user has no active bookings & orders, provide personalized user actions
        if (items.length === (isProfileIncomplete ? 1 : 0)) {
          items.push({
            id: 'user-welcome-consult',
            icon: '🗓️',
            title: t('Book a Consultation', 'परामर्श बुक करें'),
            badge: t('1-on-1', 'व्यक्तिगत'),
            badgeColor: 'text-indigo-700 bg-indigo-100 border-indigo-200',
            desc: t(
              'Connect directly with Dr. Pandit Vishal Dubey for guidance on career, marriage & life path.',
              'करियर, विवाह और जीवन मार्गदर्शन हेतु डॉ. पंडित विशाल दुबे से सीधा परामर्श लें।'
            ),
            time: t('Recommended', 'अनुशंसित'),
            onClick: () => {
              setNotificationOpen(false);
              router.push('/appointment');
            },
          });
          items.push({
            id: 'user-welcome-store',
            icon: '📿',
            title: t('Explore Consecrated Store', 'सिद्ध वैदिक स्टोर'),
            badge: t('Certified', 'प्रमाणित'),
            badgeColor: 'text-amber-800 bg-amber-100 border-amber-200',
            desc: t(
              'Explore authentic energized Gemstones, Rudraksha malas, and Yantras consecrated in Varanasi.',
              'वाराणसी में विधि-विधान से सिद्ध किए गए प्रामाणिक रत्न, रुद्राक्ष एवं यंत्र देखें।'
            ),
            time: t('Guide', 'मार्गदर्शन'),
            onClick: () => {
              setNotificationOpen(false);
              router.push('/products');
            },
          });
        }
      } else {
        // ADMIN or SUPERADMIN Role: Show pending consultation requests requiring approval
        if (adminPendingBookings && adminPendingBookings.length > 0) {
          adminPendingBookings.forEach((b: any, idx: number) => {
            const customer = b.customerName || b.user?.name || t('Seeker', 'साधक');
            const serviceName = b.serviceTitle || t('Vedic Consultation', 'वैदिक परामर्श');
            const dateStr = b.scheduledDate || t('Scheduled Date', 'निर्धारित तिथि');
            const timeSlot = b.scheduledTime ? ` (${b.scheduledTime})` : '';
            items.push({
              id: `admin-pending-${b.id || idx}`,
              icon: '🗓️',
              title: `${t('New Consultation Request', 'नया परामर्श अनुरोध')}: ${customer}`,
              badge: t('Needs Approval', 'स्वीकृति आवश्यक'),
              badgeColor: 'text-amber-800 bg-amber-100 border-amber-300',
              desc: `${serviceName} • ${dateStr}${timeSlot}. ${t('Customer is waiting for your approval.', 'ग्राहक आपकी स्वीकृति की प्रतीक्षा कर रहा है।')}`,
              time: t('Pending Approval', 'प्रतीक्षारत'),
              onClick: () => {
                setNotificationOpen(false);
                router.push('/admin');
              },
            });
          });
        }

        items.push({
          id: 'admin-portal',
          icon: '🛡️',
          title: t('Admin Control Panel', 'व्यवस्थापक नियंत्रण'),
          badge: user.role,
          badgeColor: 'text-purple-700 bg-purple-100 border-purple-200',
          desc: t(
            'Manage all seeker consultations, order fulfillments, and content updates.',
            'परामर्श, ऑर्डर और वेबसाइट सामग्री का प्रबंधन करें।'
          ),
          time: t('Active', 'सक्रिय'),
          onClick: () => {
            setNotificationOpen(false);
            router.push('/admin');
          },
        });
      }
    } else {
      // Guest (Not Logged In) - Relevant, actionable guidance
      items.push({
        id: 'guest-login',
        icon: '🔐',
        title: t('Sign In to Your Account', 'अपने खाते में साइन इन करें'),
        badge: t('Quick Access', 'त्वरित पहुंच'),
        badgeColor: 'text-amber-800 bg-amber-100 border-amber-200',
        desc: t(
          'Access your personalized consultations, order shipments, and Astro Wallet.',
          'अपने परामर्श, ऑर्डर शिपमेंट और एस्ट्रो वॉलेट देखने के लिए साइन इन करें।'
        ),
        time: t('Account', 'खाता'),
        onClick: () => {
          setNotificationOpen(false);
          setAuthMode('login');
          setAuthModalOpen(true);
        },
      });
      items.push({
        id: 'guest-consultation',
        icon: '🗓️',
        title: t('1-on-1 Astrological Consultation', '1-ऑन-1 ज्योतिषीय परामर्श'),
        badge: t('Book Now', 'बुक करें'),
        badgeColor: 'text-indigo-700 bg-indigo-100 border-indigo-200',
        desc: t(
          'Direct confidential video or phone session with Dr. Pandit Vishal Dubey.',
          'डॉ. पंडित विशाल दुबे के साथ व्यक्तिगत और गोपनीय परामर्श सत्र।'
        ),
        time: t('Available', 'उपलब्ध'),
        onClick: () => {
          setNotificationOpen(false);
          router.push('/appointment');
        },
      });
      items.push({
        id: 'guest-store',
        icon: '📿',
        title: t('Vedic Consecrated Store', 'सिद्ध वैदिक स्टोर'),
        badge: t('100% Authentic', 'प्रामाणिक'),
        badgeColor: 'text-emerald-700 bg-emerald-100 border-emerald-200',
        desc: t(
          'Lab-certified gemstones, original Nepal Rudraksha & energised Yantras.',
          'प्रमाणित रत्न, सिद्ध नेपाल रुद्राक्ष एवं वैदिक यंत्र।'
        ),
        time: t('Store', 'स्टोर'),
        onClick: () => {
          setNotificationOpen(false);
          router.push('/products');
        },
      });
    }

    return items;
  }, [user, isNormalSeeker, isProfileIncomplete, userBookings, userOrders, userWalletBalance, adminPendingBookings, t, router]);

  return (
    <>
      <header
        className={`fixed ${mounted && isProfileIncomplete ? 'top-11 sm:top-12' : 'top-3 sm:top-5'} left-0 right-0 z-50 flex justify-center px-3 sm:px-6 md:px-8 pointer-events-none transition-all duration-300 transform translate-y-0 opacity-100`}
      >
        <div className="w-full max-w-6xl pointer-events-auto">
          {/* Glassmorphic Capsule Nav Bar */}
          <nav
            className={`relative w-full rounded-full nav-glassmorphism ${
              scrolled ? 'nav-glassmorphism-scrolled py-2 sm:py-2.5' : 'py-2.5 sm:py-3'
            } px-4 sm:px-6 md:px-8 flex items-center justify-between transition-all duration-300`}
          >
            {/* Glass Specular Gloss Sheen Reflection */}
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none z-0">
              <div className="absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/70 via-white/20 to-transparent" />
              <div className="absolute -top-10 -left-10 w-48 h-28 bg-gradient-to-r from-transparent via-white/40 to-transparent rotate-45 blur-sm" />
            </div>

            {/* Left: Maroon AstroVD Logo */}
            <div className="relative z-10 flex items-center gap-2 shrink-0">
              <Link href="/" prefetch={true} className="flex items-center">
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

            {/* Center: Clean Navigation Links Matching Reference Design */}
            <div className="relative z-10 hidden lg:flex items-center gap-7 xl:gap-9 text-[#3B1E22] font-medium text-sm">
              {topNavLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== '/' && pathname?.startsWith(link.href));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    prefetch={true}
                    onMouseEnter={() => {
                      try {
                        router.prefetch(link.href);
                      } catch {}
                    }}
                    className={`relative py-1 transition-colors duration-200 hover:text-[#5B0D15] ${
                      isActive
                        ? 'text-[#5B0D15] font-semibold'
                        : 'text-[#3B1E22]'
                    }`}
                  >
                    <span>{link.name}</span>
                    {/* Active Underline matching reference */}
                    {isActive && (
                      <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#5B0D15] rounded-full" />
                    )}
                  </Link>
                );
              })}

              {/* About Us with Interactive Dropdown (Screenshot 2) */}
              <div
                ref={aboutDropdownRef}
                className="relative"
                onMouseEnter={handleAboutMouseEnter}
                onMouseLeave={handleAboutMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => setAboutDropdownOpen((prev) => !prev)}
                  className={`relative py-1 flex items-center gap-1 transition-colors duration-200 hover:text-[#5B0D15] cursor-pointer ${
                    isAboutActive || aboutDropdownOpen
                      ? 'text-[#5B0D15] font-semibold'
                      : 'text-[#3B1E22]'
                  }`}
                  aria-expanded={aboutDropdownOpen}
                >
                  <span>{t('About Us', 'हमारे बारे में')}</span>
                  {aboutDropdownOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 text-[#5B0D15] transition-transform duration-200" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-stone-500 transition-transform duration-200" />
                  )}
                  {isAboutActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#5B0D15] rounded-full" />
                  )}
                </button>

                {/* About Us Dropdown Menu - Seamlessly Attached Extension Below Nav */}
                {aboutDropdownOpen && (
                  <div
                    className="absolute top-full -left-2 pt-3 sm:pt-3.5 z-50 animate-fadeIn"
                  >
                    <div
                      className="w-52 rounded-2xl bg-white/98 backdrop-blur-2xl border border-amber-300/80 shadow-2xl p-2"
                      style={{
                        boxShadow: '0 16px 36px -4px rgba(91, 13, 21, 0.14), 0 4px 14px -2px rgba(0, 0, 0, 0.06)',
                      }}
                    >
                      <div className="space-y-0.5">
                        {aboutDropdownItems.map((item) => {
                          const Icon = item.icon;
                          const isSubActive =
                            pathname === item.href ||
                            (item.href !== '/' && pathname?.startsWith(item.href));
                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              prefetch={true}
                              onMouseEnter={() => {
                                try {
                                  router.prefetch(item.href);
                                } catch {}
                              }}
                              onClick={() => setAboutDropdownOpen(false)}
                              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                                isSubActive
                                  ? 'bg-amber-100/70 text-[#5B0D15] font-semibold'
                                  : 'text-stone-700 hover:text-[#5B0D15] hover:bg-amber-50/80'
                              }`}
                            >
                              <Icon className="w-4 h-4 text-amber-700 shrink-0" />
                              <span>{item.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Search, Language Pill, Cart Badge & Sign Up Pill */}
            <div className="relative z-10 flex items-center gap-3 sm:gap-3.5 md:gap-4">
              {/* Search Icon with Expandable Input & Live Suggestions Dropdown */}
              <div className="relative" ref={searchRef}>
                {searchOpen ? (
                  <form
                    onSubmit={handleSearchSubmit}
                    className="flex items-center bg-white/95 backdrop-blur-md border border-amber-300/90 rounded-full px-3 py-1.5 shadow-md animate-fadeIn"
                  >
                    <button
                      type="submit"
                      title={t('Search', 'खोजें')}
                      className="text-[#4A262B] hover:text-[#5B0D15] mr-1.5 cursor-pointer focus:outline-none"
                    >
                      <Search className="w-4 h-4 shrink-0" />
                    </button>
                    <input
                      type="text"
                      autoFocus
                      placeholder={t('Search crystals, services...', 'क्रिस्टल या सेवाएं खोजें...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent text-xs text-[#3B1E22] placeholder-stone-400 focus:outline-none w-32 sm:w-44"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="text-stone-400 hover:text-stone-700 ml-1.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(true);
                      setNotificationOpen(false);
                      setProfileDropdownOpen(false);
                      setAboutDropdownOpen(false);
                    }}
                    className="p-1.5 text-stone-700 hover:text-[#5B0D15] transition-colors cursor-pointer"
                    aria-label="Search"
                    title={t('Search', 'खोजें')}
                  >
                    <Search className="w-5 h-5 stroke-[1.8]" />
                  </button>
                )}

                {/* Instant Live Search Results Popover */}
                {searchOpen && trimmedSearch.length > 0 && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-full right-0 mt-5 w-80 sm:w-96 rounded-2xl bg-white/98 backdrop-blur-2xl border border-amber-300/80 shadow-2xl p-3 z-50 animate-fadeIn text-[#3B1E22]"
                    style={{
                      boxShadow: '0 16px 40px -4px rgba(91, 13, 21, 0.16), 0 4px 16px -2px rgba(0, 0, 0, 0.08)',
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-amber-200/70 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                      <span>{t('Instant Suggestions', 'त्वरित सुझाव')}</span>
                      <span className="text-[#5B0D15] font-semibold lowercase">
                        "{searchQuery}"
                      </span>
                    </div>

                    {/* Products Suggestions */}
                    {liveMatchingProducts.length > 0 && (
                      <div className="py-2 space-y-1">
                        <div className="text-[10px] uppercase font-bold text-amber-800 tracking-wider px-1">
                          {t('Products & Talismans', 'उत्पाद एवं ताबीज')}
                        </div>
                        {liveMatchingProducts.map((prod) => (
                          <Link
                            key={prod.id}
                            href={`/products/${prod.id}`}
                            onClick={() => {
                              setSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-amber-50/80 transition-colors group"
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-amber-200/80 shrink-0 bg-stone-100 relative">
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-[#3B1E22] group-hover:text-[#5B0D15] truncate">
                                {prod.name}
                              </div>
                              <div className="text-[10px] text-stone-500 truncate">
                                {prod.categoryLabel}
                              </div>
                            </div>
                            <div className="text-xs font-extrabold text-[#5B0D15] shrink-0">
                              {prod.price}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Services Suggestions */}
                    {liveMatchingServices.length > 0 && (
                      <div className="py-2 border-t border-amber-200/70 space-y-1">
                        <div className="text-[10px] uppercase font-bold text-amber-800 tracking-wider px-1">
                          {t('Vedic Consultations & Services', 'परामर्श एवं सेवाएं')}
                        </div>
                        {liveMatchingServices.map((srv) => (
                          <Link
                            key={srv.id}
                            href="/services"
                            onClick={() => {
                              setSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-amber-50/80 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-amber-100/80 text-amber-900 flex items-center justify-center shrink-0">
                              
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-[#3B1E22] group-hover:text-[#5B0D15] truncate">
                                {srv.title}
                              </div>
                              <div className="text-[10px] text-stone-500 truncate">
                                {srv.categoryTag}
                              </div>
                            </div>
                            <div className="text-xs font-bold text-[#5B0D15] shrink-0">
                              {srv.price}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* No matches state */}
                    {liveMatchingProducts.length === 0 && liveMatchingServices.length === 0 && (
                      <div className="py-4 text-center text-xs text-stone-500">
                        {t('No instant matches found.', 'कोई त्वरित परिणाम नहीं मिला।')}
                      </div>
                    )}

                    {/* View all search results button */}
                    <div className="pt-2 border-t border-amber-200/70">
                      <button
                        type="button"
                        onClick={() => handleSearchSubmit()}
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-50 to-rose-50 hover:from-amber-100 hover:to-rose-100 text-center text-xs font-bold text-[#5B0D15] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <span>{t('Search all store results for', 'सभी उत्पादों में खोजें')} "{searchQuery}"</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Hindi / English Language Pill */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 hover:bg-white text-xs border border-stone-200/90 hover:border-amber-300/80 text-stone-600 hover:text-[#5B0D15] shadow-2xs transition-all duration-200 cursor-pointer active:scale-95"
                title={language === 'en' ? 'हिन्दी में पढ़ें' : 'Read in English'}
                aria-label="Toggle Language"
              >
                <Globe className="w-3.5 h-3.5 text-stone-400 shrink-0 stroke-[1.5]" />
                <span className={language === 'en' ? 'text-[#800000] font-semibold' : 'text-stone-400 font-normal'}>
                  EN
                </span>
                <span className="text-stone-300 text-[10px] font-light select-none">/</span>
                <span className={language === 'hi' ? 'text-[#800000] font-semibold' : 'text-stone-400 font-normal'}>
                  हिन्दी
                </span>
              </button>

              {/* Notification Bell in Top Right Corner */}
              <div className="relative" ref={notificationRef}>
                <button
                  type="button"
                  onClick={() => {
                    setNotificationOpen((prev) => !prev);
                    setProfileDropdownOpen(false);
                    setSearchOpen(false);
                  }}
                  className="p-1.5 text-stone-700 hover:text-[#5B0D15] transition-colors relative cursor-pointer"
                  aria-label="Notifications"
                  title={t('Notifications', 'सूचनाएं')}
                >
                  <Bell className="w-5 h-5 stroke-[1.8]" />
                  {/* Subtle Unread Indicator Dot */}
                  {mounted && notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#800000] ring-2 ring-white animate-pulse" />
                  )}
                </button>

                {/* Notifications Popover Dropdown */}
                {notificationOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-full right-0 mt-5 w-80 sm:w-88 rounded-2xl bg-white/98 backdrop-blur-2xl border border-amber-200/90 shadow-2xl p-4 z-50 animate-fadeIn text-[#3B1E22]"
                    style={{
                      boxShadow: '0 16px 40px -4px rgba(91, 13, 21, 0.15), 0 4px 16px -2px rgba(0, 0, 0, 0.06)',
                    }}
                  >
                    <div className="flex items-center justify-between pb-2.5 border-b border-stone-200/80">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#3B1E22] uppercase tracking-wider">
                          {t('Notifications', 'सूचनाएं')}
                        </span>
                        <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          {notifications.length} {t('new', 'नई')}
                        </span>
                      </div>
                      <button
                        onClick={() => setNotificationOpen(false)}
                        className="text-stone-400 hover:text-stone-600 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
                      {notifications.map((item) => (
                        <div
                          key={item.id}
                          onClick={item.onClick}
                          className={`p-2.5 rounded-xl transition-all text-xs cursor-pointer group ${
                            item.id === 'profile-incomplete'
                              ? 'bg-gradient-to-r from-amber-100/90 via-rose-50 to-amber-50 border border-amber-300 hover:shadow-md'
                              : 'hover:bg-stone-50 border border-transparent hover:border-amber-200/70'
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold text-stone-800 mb-1">
                            <span className="flex items-center gap-1.5 text-[#5B0D15] group-hover:text-[#800000] transition-colors font-bold">
                              <span>{item.icon}</span>
                              <span className="line-clamp-1">{item.title}</span>
                            </span>
                            {item.badge && (
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider shrink-0 ml-1 border ${
                                  item.badgeColor || 'text-amber-800 bg-amber-100 border-amber-200'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-600 leading-snug line-clamp-2">
                            {item.desc}
                          </p>
                          <div className="mt-1.5 flex items-center justify-between text-[10px] text-stone-400">
                            <span>{item.time}</span>
                            <span className="text-[#800000] font-bold group-hover:underline">
                              {t('View details →', 'विवरण देखें →')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-stone-200/80 text-center">
                      <Link
                        href={user ? (user.role === 'ADMIN' || user.role === 'SUPERADMIN' ? '/admin' : '/dashboard') : '/appointment'}
                        prefetch={true}
                        onClick={() => setNotificationOpen(false)}
                        className="text-[11px] font-bold text-[#5B0D15] hover:text-[#3B1E22] hover:underline"
                      >
                        {user
                          ? t('View All in Dashboard →', 'डैशबोर्ड में सभी देखें →')
                          : t('Explore Consultations & Store →', 'परामर्श एवं स्टोर देखें →')}
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Shopping Cart with Maroon Counter Badge */}
              <Link
                href="/cart"
                prefetch={true}
                onMouseEnter={() => {
                  try {
                    router.prefetch('/cart');
                  } catch {}
                }}
                className="p-1.5 text-stone-700 hover:text-[#5B0D15] transition-colors relative cursor-pointer"
                aria-label="Shopping Cart"
                title={t('Cart', 'कार्ट')}
              >
                <ShoppingCart className="w-5 h-5 stroke-[1.8]" />
                {mounted && liveCartCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#5B0D15] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {liveCartCount}
                  </span>
                )}
              </Link>

              {/* User Avatar Menu OR Dedicated "Sign Up" Pill Button */}
              {mounted && user ? (
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setProfileDropdownOpen((prev) => !prev);
                      setSearchOpen(false);
                    }}
                    className="flex items-center justify-center p-0.5 rounded-full border border-amber-300/80 bg-white/85 hover:bg-white text-[#3B1E22] shadow-xs hover:shadow-md transition-all cursor-pointer group active:scale-95"
                    aria-label="User account menu"
                    aria-expanded={profileDropdownOpen}
                    title={user.name || user.email || 'Account'}
                  >
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${getAvatarBackground(
                        user.role
                      )} font-bold flex items-center justify-center shadow-inner border ring-2 ring-amber-100/60 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                        getInitials(user.name).length > 1
                          ? 'text-[11px] sm:text-xs tracking-tight'
                          : 'text-xs sm:text-sm font-extrabold'
                      }`}
                    >
                      {getInitials(user.name)}
                    </div>
                  </button>

                  {/* Profile Menu Dropdown */}
                  {profileDropdownOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-full right-0 mt-5 w-72 rounded-2xl bg-white/98 backdrop-blur-2xl border border-amber-200/90 shadow-2xl p-3 z-50 animate-fadeIn text-[#3B1E22]"
                      style={{
                        boxShadow: '0 20px 45px -4px rgba(91, 13, 21, 0.16), 0 8px 24px -2px rgba(0, 0, 0, 0.08)',
                      }}
                    >
                      {/* Identity Card */}
                      <div className="flex items-center gap-3 p-3 bg-stone-50/80 rounded-xl border border-stone-200/80 mb-2">
                        <div
                          className={`w-10 h-10 rounded-full ${getAvatarBackground(
                            user.role
                          )} font-semibold flex items-center justify-center shadow-2xs border border-white/80 ring-1 ring-stone-200 shrink-0 ${
                            getInitials(user.name).length > 1
                              ? 'text-xs tracking-tight'
                              : 'text-sm font-bold'
                          }`}
                        >
                          {getInitials(user.name)}
                        </div>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-xs font-semibold text-stone-900 truncate tracking-tight">{user.name}</span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-50 text-amber-900 border border-amber-200/80 uppercase tracking-wider shrink-0">
                              {user.role === 'ADMIN' ? 'Admin' : user.role === 'SUPERADMIN' ? 'Superadmin' : (user.role || 'Member')}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 font-normal truncate">{user.email}</p>
                        </div>
                      </div>


                      {/* Quick Navigation Items */}
                      <div className="space-y-0.5 text-xs text-stone-700">
                        {(user.role === 'ADMIN' || user.role === 'SUPERADMIN') && (
                          <Link
                            href="/admin"
                            prefetch={true}
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#5B0D15]/5 hover:bg-[#5B0D15]/10 text-[#5B0D15] border border-[#5B0D15]/15 font-semibold text-xs transition-colors mb-1.5"
                          >
                            <ShieldCheck className="w-4 h-4 text-[#5B0D15] shrink-0" />
                            <span>Admin Control Panel</span>
                          </Link>
                        )}
                        {user.role !== 'ADMIN' && user.role !== 'SUPERADMIN' && (
                          <Link
                            href="/dashboard"
                            prefetch={true}
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              if (typeof window !== 'undefined') {
                                window.dispatchEvent(new CustomEvent('astro-auth-change'));
                              }
                            }}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-amber-500/10 text-[#5B0D15] font-bold hover:bg-amber-500/20 transition-colors"
                          >
                            <UserIcon className="w-4 h-4 text-[#5B0D15]" />
                            <span>Customer Dashboard</span>
                          </Link>
                        )}
                        <Link
                          href="/dashboard?tab=consultations"
                          prefetch={true}
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            if (typeof window !== 'undefined') {
                              window.dispatchEvent(new CustomEvent('astro-tab-change', { detail: 'consultations' }));
                            }
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-stone-100/80 transition-colors"
                        >
                          <Compass className="w-4 h-4 text-[#5B0D15]" />
                          <span>{t('My Consultations', 'मेरे परामर्श')}</span>
                        </Link>
                        <Link
                          href="/dashboard?tab=orders"
                          prefetch={true}
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-stone-100/80 transition-colors"
                        >
                          <ShoppingCart className="w-4 h-4 text-stone-600" />
                          <span>{t('My Orders', 'मेरे ऑर्डर्स')}</span>
                        </Link>
                      </div>

                        

                      {/* Divider */}
                      <div className="border-t border-stone-200/80 my-2" />

                      {/* Logout Action */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center">
                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setAuthModalOpen(true);
                    }}
                    className="px-5 py-2 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-md shadow-rose-950/20 transition-all transform hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
                  >
                    {t('Sign Up', 'साइन अप')}
                  </button>
                </div>
              )}

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-full text-[#3B1E22] hover:text-[#5B0D15] focus:outline-none cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </nav>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div
              className="lg:hidden mt-2 rounded-3xl nav-glassmorphism p-4 animate-fadeIn space-y-3"
              style={{
                backdropFilter: 'blur(24px) saturate(190%) contrast(105%)',
                WebkitBackdropFilter: 'blur(24px) saturate(190%) contrast(105%)',
              }}
            >
              {/* Mobile Search Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (mobileSearchQuery.trim()) {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(
                        new CustomEvent('astro-search-change', { detail: mobileSearchQuery.trim() })
                      );
                    }
                    router.push(`/products?search=${encodeURIComponent(mobileSearchQuery.trim())}`);
                    setMobileMenuOpen(false);
                    setMobileSearchQuery('');
                  }
                }}
                className="flex items-center bg-white/95 rounded-full border border-amber-300/90 px-3.5 py-2 shadow-sm"
              >
                <Search className="w-4 h-4 text-[#4A262B] mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder={t('Search crystals, bracelets, pooja...', 'क्रिस्टल, ब्रेसलेट, पूजा खोजें...')}
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-[#3B1E22] placeholder-stone-400 focus:outline-none w-full"
                />
                {mobileSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setMobileSearchQuery('')}
                    className="text-stone-400 hover:text-stone-700 ml-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {/* Primary Links */}
              <div className="grid grid-cols-2 gap-2">
                {topNavLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    prefetch={true}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`p-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      pathname === link.href
                        ? 'bg-rose-100/60 text-[#5B0D15]'
                        : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              {/* About Us Sub-sections in Mobile */}
              <div className="pt-2 border-t border-amber-200/60 space-y-1">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block px-2">
                  {t('About Us', 'हमारे बारे में')}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {aboutDropdownItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        prefetch={true}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium transition-colors ${
                          pathname === item.href
                            ? 'bg-amber-100/70 text-[#5B0D15]'
                            : 'text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 text-amber-700" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Language Toggle */}
              <div className="pt-2 flex items-center justify-between border-t border-amber-200/60">
                <span className="text-xs font-bold text-stone-600">{t('Select Language', 'भाषा चुनें')}:</span>
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-amber-300 text-xs font-bold text-[#5B0D15] shadow-xs cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-amber-700" />
                  <span>{language === 'en' ? 'हिन्दी में बदलें' : 'Switch to English'}</span>
                </button>
              </div>

              {mounted && user ? (
                <div className="pt-2 border-t border-stone-200 space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-stone-50/80 rounded-xl border border-stone-200/80">
                    <div
                      className={`w-9 h-9 rounded-full ${getAvatarBackground(
                        user.role
                      )} font-semibold flex items-center justify-center shrink-0 border border-white/80 ring-1 ring-stone-200 ${
                        getInitials(user.name).length > 1
                          ? 'text-[10px] tracking-tight'
                          : 'text-xs font-bold'
                      }`}
                    >
                      {getInitials(user.name)}
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-xs font-semibold text-stone-900 truncate tracking-tight">{user.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-50 text-amber-900 border border-amber-200/80 uppercase tracking-wider shrink-0">
                          {user.role === 'ADMIN' ? 'Admin' : user.role === 'SUPERADMIN' ? 'Superadmin' : (user.role || 'Member')}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 font-normal truncate">{user.email || 'Verified Seeker'}</div>
                    </div>
                  </div>
                  {(user.role === 'ADMIN' || user.role === 'SUPERADMIN') && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#5B0D15]/5 text-[#5B0D15] border border-[#5B0D15]/15 font-semibold text-xs flex items-center justify-center gap-2 shadow-2xs"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#5B0D15]" />
                      <span>Admin Control Panel</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full py-2.5 rounded-full border border-rose-200 bg-rose-50 text-rose-700 font-semibold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-stone-200">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthMode('register');
                      setAuthModalOpen(true);
                    }}
                    className="w-full py-2.5 rounded-full bg-[#5B0D15] text-white font-semibold text-xs shadow-md hover:bg-[#480a11] cursor-pointer"
                  >
                    {t('Sign Up', 'साइन अप')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Top Persistent Reminder Ribbon when profile is incomplete (Normal Seekers only - never ADMIN) */}
      {mounted && isProfileIncomplete && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-[#5B0D15] via-[#851622] to-[#5B0D15] text-white text-xs py-2 px-4 shadow-md border-b border-amber-400/40">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
              <span className="font-semibold text-amber-300">
                {t('Action Required:', 'आवश्यक सूचना:')}
              </span>
              <span className="hidden sm:inline text-amber-100">
                {t(
                  'Your Vedic profile is incomplete! Add your Date, Time & Place of birth for personalized astrological consultations and remedies.',
                  'आपकी वैदिक प्रोफाइल अधूरी है! सटीक फलादेश व उपायों हेतु जन्म समय, तिथि व स्थान दर्ज करें।'
                )}
              </span>
              <span className="sm:hidden text-amber-100 truncate">
                {t('Complete your birth details', 'जन्म विवरण पूर्ण करें')}
              </span>
            </div>

            <button
              onClick={() => setProfileModalOpen(true)}
              className="px-3.5 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-[#5B0D15] font-extrabold text-[11px] shadow-sm hover:scale-105 transition-all cursor-pointer shrink-0"
            >
              {t('Complete Profile Now', 'अभी पूर्ण करें')} →
            </button>
          </div>
        </div>
      )}

      {/* Auth Modal for Sign Up / Login */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(userData) => {
          setUser(userData);
          const isSeeker = userData && userData.role !== 'ADMIN' && userData.role !== 'SUPERADMIN';
          if (isSeeker && (!userData?.dateOfBirth || !userData?.placeOfBirth || !userData?.timeOfBirth)) {
            setTimeout(() => setProfileModalOpen(true), 400);
          }
        }}
      />

      {/* Complete Profile Modal */}
      <CompleteProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={user}
        onSuccess={(updatedUser) => {
          setUser(updatedUser);
        }}
      />
    </>
  );
};
