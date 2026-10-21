'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  Wallet,
  Sparkles,
  Compass,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { useLanguage } from '../context/LanguageContext';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { language, toggleLanguage, t } = useLanguage();
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);

      // Always show when near top of the page
      if (currentScrollY < 40) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY + 6) {
        // Scrolling DOWN -> hide smoothly
        setVisible(false);
      } else if (currentScrollY < lastScrollY - 4) {
        // Scrolling UP -> reveal immediately
        setVisible(true);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const syncUser = () => {
      const saved = localStorage.getItem('astro_user');
      const token = localStorage.getItem('astro_token');

      if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }

      if (token) {
        const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');
        fetch(`${backendBase}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => {
            if (res.ok) return res.json();
            if (res.status === 401) {
              localStorage.removeItem('astro_token');
              localStorage.removeItem('astro_user');
              setUser(null);
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('astro-auth-change', { detail: null }));
              }
            }
            return null;
          })
          .then((freshUser) => {
            if (freshUser) {
              setUser(freshUser);
              localStorage.setItem('astro_user', JSON.stringify(freshUser));
            }
          })
          .catch(() => {});
      }
    };

    syncUser();

    window.addEventListener('astro-auth-change', syncUser);
    window.addEventListener('storage', syncUser);

    return () => {
      window.removeEventListener('astro-auth-change', syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem('astro_token');
    localStorage.removeItem('astro_user');
    setUser(null);
    setProfileDropdownOpen(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('astro-auth-change', { detail: null }));
    }
  };

  const navLinks = [
    { name: t('Home', 'होम'), href: '/' },
    { name: t('About', 'परिचय'), href: '/about' },
    { name: t('Services', 'सेवाएं'), href: '/services' },
    { name: t('Gallery', 'गैलरी'), href: '/gallery' },
    { name: t('Blog', 'ब्लॉग'), href: '/blog' },
    { name: t('Appointment', 'परामर्श'), href: '/appointment' },
    { name: t('Shop', 'स्टोर'), href: '/products' },
    { name: t('Contact', 'संपर्क'), href: '/contact' },
  ];

  return (
    <>
      <header
        className={`fixed top-3 sm:top-5 left-0 right-0 z-50 flex justify-center px-3 sm:px-6 md:px-8 pointer-events-none transition-all duration-300 transform ${
          visible ? 'translate-y-0 opacity-100' : '-translate-y-28 opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-full max-w-6xl pointer-events-auto">
          {/* Glassmorphic Capsule Nav Bar */}
          <nav
            className={`relative w-full rounded-full nav-glassmorphism ${
              scrolled ? 'nav-glassmorphism-scrolled py-2 sm:py-2.5' : 'py-2.5 sm:py-3.5'
            } px-4 sm:px-6 md:px-8 flex items-center justify-between transition-all duration-300`}
            style={{
              backdropFilter: scrolled
                ? 'blur(24px) saturate(190%) contrast(105%)'
                : 'blur(20px) saturate(180%) contrast(105%)',
              WebkitBackdropFilter: scrolled
                ? 'blur(24px) saturate(190%) contrast(105%)'
                : 'blur(20px) saturate(180%) contrast(105%)',
            }}
          >
            {/* Glass Specular Gloss Sheen Reflection */}
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none z-0">
              <div className="absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/70 via-white/20 to-transparent" />
              <div className="absolute -top-10 -left-10 w-48 h-28 bg-gradient-to-r from-transparent via-white/40 to-transparent rotate-45 blur-sm" />
            </div>

            {/* Left: Maroon AstroVD Logo */}
            <div className="relative z-10 flex items-center gap-2 shrink-0">
              <Link href="/" className="flex items-center">
                <img
                  src="/astro-vd-logo.png"
                  alt="AstroVD"
                  className="h-8 sm:h-9 md:h-10 w-auto object-contain hover:opacity-95 transition-opacity"
                />
              </Link>
            </div>

            {/* Center: Navigation Links to Dedicated Pages */}
            <div className="relative z-10 hidden lg:flex items-center gap-6 xl:gap-8 text-[#3B1E22] font-medium text-sm">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== '/' && pathname?.startsWith(link.href));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative py-1 transition-colors duration-200 hover:text-[#5B0D15] ${
                      isActive
                        ? 'text-[#5B0D15] font-semibold'
                        : 'text-[#4A262B]'
                    }`}
                  >
                    {link.name}
                    {/* Active Underline */}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#5B0D15] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right: Language Toggle, Search, Cart Badge & Sign Up Pill */}
            <div className="relative z-10 flex items-center gap-2.5 sm:gap-3 md:gap-4">
              {/* Hindi / English Toggle Button */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/75 hover:bg-white text-xs font-bold border border-amber-300/80 text-[#3B1E22] hover:text-[#5B0D15] shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer active:scale-95"
                title={language === 'en' ? 'हिन्दी में पढ़ें' : 'Read in English'}
                aria-label="Toggle Language"
              >
                <Globe className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className={language === 'en' ? 'text-[#800000] font-black' : 'text-stone-400 font-medium'}>
                  EN
                </span>
                <span className="text-amber-400 text-[10px]">/</span>
                <span className={language === 'hi' ? 'text-[#800000] font-black' : 'text-stone-400 font-medium'}>
                  हिन्दी
                </span>
              </button>

              {/* Search Icon / Expandable Input */}
              <div className="relative">
                {searchOpen ? (
                  <div className="flex items-center bg-white/80 backdrop-blur-md border border-amber-300/80 rounded-full px-3 py-1.5 shadow-sm animate-fadeIn">
                    <Search className="w-4 h-4 text-[#4A262B] mr-2 shrink-0" />
                    <input
                      type="text"
                      autoFocus
                      placeholder={t('Search...', 'खोजें...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent text-xs text-[#3B1E22] placeholder-stone-400 focus:outline-none w-28 sm:w-36"
                    />
                    <button
                      onClick={() => setSearchOpen(false)}
                      className="text-stone-400 hover:text-stone-700 ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="p-1.5 text-[#3B1E22] hover:text-[#5B0D15] transition-colors cursor-pointer"
                    aria-label="Search"
                    title={t('Search', 'खोजें')}
                  >
                    <Search className="w-5 h-5 stroke-[1.8]" />
                  </button>
                )}
              </div>

              {/* Shopping Cart Icon with Badge */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCartOpen(!cartOpen);
                    setProfileDropdownOpen(false);
                    setSearchOpen(false);
                  }}
                  className="p-1.5 text-[#3B1E22] hover:text-[#5B0D15] transition-colors relative cursor-pointer"
                  aria-label="Shopping Cart"
                  title={t('Cart', 'कार्ट')}
                >
                  <ShoppingCart className="w-5 h-5 stroke-[1.8]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#5B0D15] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                      {cartCount}
                    </span>
                  )}
                </button>

                {/* Cart Preview Tooltip Dropdown */}
                {cartOpen && (
                  <div className="absolute top-full right-0 mt-3 w-64 rounded-2xl bg-white/95 backdrop-blur-2xl border border-amber-200/80 shadow-2xl p-4 animate-fadeIn">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                      <span className="text-xs font-bold text-[#3B1E22]">{t('Your Cart', 'आपकी कार्ट')} ({cartCount})</span>
                      <button onClick={() => setCartOpen(false)} className="text-stone-400 hover:text-stone-700">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="py-3 text-xs text-stone-600 flex items-center gap-2.5">
                      <span className="text-xl">📿</span>
                      <div>
                        <div className="font-semibold text-stone-900">{t('Tiger Eye Bracelet', 'टाइगर आई ब्रेसलेट')}</div>
                        <div className="text-[11px] text-[#5B0D15] font-bold">1 × ₹1,299</div>
                      </div>
                    </div>
                    <Link
                      href="/products"
                      onClick={() => setCartOpen(false)}
                      className="block text-center w-full py-2 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      {t('View Cart & Shop', 'कार्ट देखें और खरीदें')}
                    </Link>
                  </div>
                )}
              </div>

              {/* User Profile Pill & Dropdown or Sign Up Button */}
              {user ? (
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setProfileDropdownOpen((prev) => !prev);
                      setCartOpen(false);
                      setSearchOpen(false);
                    }}
                    className="flex items-center gap-2 pl-1 pr-2.5 sm:pr-3 py-1 rounded-full border border-amber-300/80 bg-white/80 hover:bg-white text-[#3B1E22] shadow-sm hover:shadow transition-all cursor-pointer group"
                    aria-label="User account menu"
                    aria-expanded={profileDropdownOpen}
                  >
                    {/* Royal Maroon & Gold Gradient Initials Avatar */}
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#5B0D15] via-[#7B121C] to-[#3B1E22] text-amber-200 font-bold text-xs flex items-center justify-center shadow-inner border border-amber-300/60 ring-2 ring-amber-100/50">
                      {getInitials(user.name)}
                    </div>

                    {/* Name & Balance Subtitle */}
                    <div className="text-left hidden sm:block leading-tight">
                      <div className="text-xs font-bold text-[#3B1E22] group-hover:text-[#5B0D15] transition-colors truncate max-w-[110px]">
                        {user.name?.split(' ')[0]}
                      </div>
                      <div className="text-[10px] text-amber-800 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                        ₹{user.walletBalance ?? 150}
                      </div>
                    </div>

                    <ChevronDown
                      className={`w-3.5 h-3.5 text-stone-500 transition-transform duration-200 ${
                        profileDropdownOpen ? 'rotate-180 text-[#5B0D15]' : ''
                      }`}
                    />
                  </button>

                  {/* Luxury Frosted Glass Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-full right-0 mt-2.5 w-72 rounded-2xl bg-white/95 backdrop-blur-2xl border border-amber-200/90 shadow-2xl p-3 z-50 animate-fadeIn text-[#3B1E22]"
                    >
                      {/* Identity Card */}
                      <div className="flex items-center gap-3 p-2.5 bg-gradient-to-r from-amber-50/80 via-rose-50/40 to-amber-50/50 rounded-xl border border-amber-200/60 mb-2.5">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5B0D15] to-[#7B121C] text-amber-200 font-bold text-sm flex items-center justify-center shadow-sm border border-amber-300/80 ring-2 ring-amber-200/50 shrink-0">
                          {getInitials(user.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#3B1E22] truncate">{user.name}</span>
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300/70 uppercase tracking-wider">
                              {user.role || 'Member'}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                        </div>
                      </div>

                      {/* Astro Wallet Highlight Card */}
                      <div className="px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-300/60 flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-900 flex items-center justify-center">
                            <Wallet className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">Astro Balance</div>
                            <div className="text-xs font-black text-[#5B0D15]">
                              ₹{user.walletBalance ?? 150} <span className="text-[10px] font-normal text-stone-500">Credits</span>
                            </div>
                          </div>
                        </div>
                        <Link
                          href="/appointment"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="text-[10px] font-bold text-[#5B0D15] hover:text-[#3B1E22] hover:underline"
                        >
                          Book Now →
                        </Link>
                      </div>

                      {/* Quick Navigation Items */}
                      <div className="space-y-0.5 text-xs text-stone-700">
                        {(user.role === 'ADMIN' || user.role === 'SUPERADMIN') && (
                          <Link
                            href="/admin"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 font-bold hover:bg-purple-100 transition-colors mb-1"
                          >
                            <ShieldCheck className="w-4 h-4 text-purple-700" />
                            <span>👑 Admin Control Panel</span>
                          </Link>
                        )}
                        <Link
                          href="/dashboard"
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
                        <Link
                          href="/services"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-stone-100/80 transition-colors"
                        >
                          <Sparkles className="w-4 h-4 text-amber-600" />
                          <span>My Kundli &amp; Vedic Reports</span>
                        </Link>
                        <Link
                          href="/appointment"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-stone-100/80 transition-colors"
                        >
                          <Compass className="w-4 h-4 text-[#5B0D15]" />
                          <span>Astrology Consultations</span>
                        </Link>
                        <Link
                          href="/products"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-stone-100/80 transition-colors"
                        >
                          <ShoppingCart className="w-4 h-4 text-stone-600" />
                          <span>Astro Store Orders</span>
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
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setAuthModalOpen(true);
                    }}
                    className="hidden sm:inline-block px-3 py-1.5 text-xs font-semibold text-[#5B0D15] hover:text-[#3B1E22] transition-colors cursor-pointer"
                  >
                    {t('Sign In', 'लॉग इन')}
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setAuthModalOpen(true);
                    }}
                    className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-md shadow-rose-950/25 transition-all transform hover:scale-[1.03] cursor-pointer"
                  >
                    {t('Sign Up', 'साइन अप')}
                  </button>
                </div>
              )}

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-full text-[#3B1E22] hover:text-[#5B0D15] focus:outline-none"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </nav>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div
              className="lg:hidden mt-2 rounded-3xl nav-glassmorphism p-4 animate-fadeIn space-y-2"
              style={{
                backdropFilter: 'blur(24px) saturate(190%) contrast(105%)',
                WebkitBackdropFilter: 'blur(24px) saturate(190%) contrast(105%)',
              }}
            >
              <div className="grid grid-cols-2 gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
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

              {/* Mobile Language Toggle */}
              <div className="pt-2 pb-1 flex items-center justify-between border-t border-amber-200/60">
                <span className="text-xs font-bold text-stone-600">{t('Select Language', 'भाषा चुनें')}:</span>
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-amber-300 text-xs font-bold text-[#5B0D15] shadow-xs"
                >
                  <Globe className="w-3.5 h-3.5 text-amber-700" />
                  <span>{language === 'en' ? 'हिन्दी में बदलें' : 'Switch to English'}</span>
                </button>
              </div>

              {user ? (
                <div className="pt-2 border-t border-stone-200 space-y-2">
                  <div className="flex items-center gap-3 p-2.5 bg-white/70 rounded-2xl border border-amber-200/60">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#5B0D15] to-[#7B121C] text-amber-200 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-300/60">
                      {getInitials(user.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[#3B1E22] truncate">{user.name}</div>
                      <div className="text-[11px] text-[#5B0D15] font-semibold">🪙 ₹{user.walletBalance ?? 150} Balance</div>
                    </div>
                  </div>
                  {(user.role === 'ADMIN' || user.role === 'SUPERADMIN') && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2.5 px-4 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                      <span>👑 Admin Control Panel</span>
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
                <div className="pt-2 border-t border-stone-200 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthMode('login');
                      setAuthModalOpen(true);
                    }}
                    className="py-2.5 rounded-full border border-amber-300/80 bg-white text-[#5B0D15] font-semibold text-xs shadow-xs hover:bg-stone-50"
                  >
                    {t('Sign In', 'लॉग इन')}
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthMode('register');
                      setAuthModalOpen(true);
                    }}
                    className="py-2.5 rounded-full bg-[#5B0D15] text-white font-semibold text-xs shadow-md hover:bg-[#480a11]"
                  >
                    {t('Sign Up', 'साइन अप')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Auth Modal for Sign Up / Login */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(userData) => setUser(userData)}
      />
    </>
  );
};
