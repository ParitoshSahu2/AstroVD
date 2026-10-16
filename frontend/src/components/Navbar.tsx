'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ShoppingCart, Menu, X } from 'lucide-react';
import { AuthModal } from './AuthModal';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

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
    const saved = localStorage.getItem('astro_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Blog', href: '/blog' },
    { name: 'Appointment', href: '/appointment' },
    { name: 'Shop', href: '/products' },
    { name: 'Contact', href: '/contact' },
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
            className={`relative overflow-hidden w-full rounded-full nav-glassmorphism ${
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
            <div className="absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/70 via-white/20 to-transparent pointer-events-none z-0" />
            <div className="absolute -top-10 -left-10 w-48 h-28 bg-gradient-to-r from-transparent via-white/40 to-transparent rotate-45 pointer-events-none blur-sm z-0" />

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

            {/* Right: Search, Cart Badge & Sign Up Pill */}
            <div className="relative z-10 flex items-center gap-3 sm:gap-4 md:gap-5">
              {/* Search Icon / Expandable Input */}
              <div className="relative">
                {searchOpen ? (
                  <div className="flex items-center bg-white/80 backdrop-blur-md border border-amber-300/80 rounded-full px-3 py-1.5 shadow-sm animate-fadeIn">
                    <Search className="w-4 h-4 text-[#4A262B] mr-2 shrink-0" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Search..."
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
                    title="Search"
                  >
                    <Search className="w-5 h-5 stroke-[1.8]" />
                  </button>
                )}
              </div>

              {/* Shopping Cart Icon with Badge */}
              <div className="relative">
                <button
                  onClick={() => setCartOpen(!cartOpen)}
                  className="p-1.5 text-[#3B1E22] hover:text-[#5B0D15] transition-colors relative cursor-pointer"
                  aria-label="Shopping Cart"
                  title="Cart"
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
                      <span className="text-xs font-bold text-[#3B1E22]">Your Cart ({cartCount})</span>
                      <button onClick={() => setCartOpen(false)} className="text-stone-400 hover:text-stone-700">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="py-3 text-xs text-stone-600 flex items-center gap-2.5">
                      <span className="text-xl">📿</span>
                      <div>
                        <div className="font-semibold text-stone-900">Tiger Eye Bracelet</div>
                        <div className="text-[11px] text-[#5B0D15] font-bold">1 × ₹1,299</div>
                      </div>
                    </div>
                    <Link
                      href="/shop"
                      onClick={() => setCartOpen(false)}
                      className="block text-center w-full py-2 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      View Cart &amp; Shop
                    </Link>
                  </div>
                )}
              </div>

              {/* Sign Up Button (Maroon capsule from image) */}
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#5B0D15] hidden sm:inline">
                    {user.name?.split(' ')[0]}
                  </span>
                  <button
                    onClick={() => {
                      localStorage.removeItem('astro_token');
                      localStorage.removeItem('astro_user');
                      setUser(null);
                    }}
                    className="px-4 py-2 rounded-full border border-amber-300/80 bg-white/70 hover:bg-white text-[#5B0D15] text-xs font-semibold shadow-sm transition-all cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-md shadow-rose-950/25 transition-all transform hover:scale-[1.03] cursor-pointer"
                >
                  Sign Up
                </button>
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

              <div className="pt-2 border-t border-stone-200">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="w-full py-2.5 rounded-full bg-[#5B0D15] text-white font-semibold text-xs shadow-md"
                >
                  Sign Up / Login
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Auth Modal for Sign Up / Login */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(userData) => setUser(userData)}
      />
    </>
  );
};
