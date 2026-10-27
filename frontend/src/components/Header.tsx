'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  PhoneCall,
  UserCheck,
  ShieldCheck,
  Menu,
  X,
  Compass,
  Star,
} from 'lucide-react';
import { performLogout } from '../lib/auth';

interface HeaderProps {
  openConsultModal: () => void;
  openAuthModal: () => void;
  user: any;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  openConsultModal,
  openAuthModal,
  user,
  onLogout,
}) => {
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      performLogout();
    }
  };
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl border-b border-amber-200 shadow-md shadow-amber-900/5 py-3'
          : 'bg-[#FDFBF7]/80 backdrop-blur-md border-b border-amber-200/60 py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-600 to-orange-600 p-0.5 shadow-md shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all duration-300">
              <div className="w-full h-full bg-[#FAF6EE] rounded-[14px] flex items-center justify-center">
                <span className="text-xl">☀️</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold tracking-tight gold-gradient-text font-serif">
                  AstroVeda
                </span>
                <span className="px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  Vedic
                </span>
              </div>
              <p className="text-[11px] text-stone-600 font-medium tracking-wide">
                Sacred Astrology & Jyotish
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 bg-amber-50/70 backdrop-blur-sm px-4 py-1.5 rounded-2xl border border-amber-200/60">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-amber-950 hover:text-amber-700 transition-colors"
            >
              Home
            </button>
            <button
              onClick={openConsultModal}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-700 hover:text-amber-800 transition-colors flex items-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
              <span>Consult Astrologers</span>
              <span className="flex h-2 w-2 relative ml-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </button>
            <button
              onClick={openAuthModal}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-700 hover:text-amber-800 transition-colors"
            >
              Kundli & Horoscope
            </button>
          </nav>

          {/* Right Action: Call Astrologer & User Auth */}
          <div className="flex items-center gap-2.5">
            {/* Quick Consultation CTA */}
            <button
              onClick={openConsultModal}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-xs shadow-md shadow-amber-500/25 transition-all duration-200 cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 fill-current" />
              <span>Call Astrologer</span>
            </button>

            {/* Auth / Wallet */}
            {user ? (
              <div className="flex items-center gap-2.5 bg-white border border-amber-300 px-3 py-1.5 rounded-xl shadow-sm">
                <div className="text-right">
                  <div className="text-xs font-bold text-stone-900">{user.name}</div>
                  <div className="text-[10px] text-amber-700 font-semibold font-mono">
                    ✦ Seeker
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-[11px] text-stone-500 hover:text-rose-600 px-1.5 py-0.5 rounded hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-1.5 bg-white hover:bg-amber-50/50 text-stone-800 border border-stone-300/80 px-3.5 py-2 rounded-xl font-semibold text-xs shadow-sm transition-all cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-white text-stone-800 border border-amber-200 shadow-sm"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-3 pb-2 mt-2 border-t border-amber-200 grid grid-cols-1 gap-2 animate-fadeIn bg-white/95 backdrop-blur-lg p-3 rounded-2xl shadow-lg border">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-stone-800 hover:bg-amber-50"
            >
              <span>☀️ Home</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openConsultModal();
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-amber-900 bg-amber-100/70"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-700" />
              <span>Talk to Live Astrologers</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openAuthModal();
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-stone-800 hover:bg-amber-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Kundli & Free Horoscope</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
