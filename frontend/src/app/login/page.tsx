'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PageHeader } from '../../components/PageHeader';
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getAuthToken, getStoredUser, setAuthSession } from '../../lib/auth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const redirectParam = searchParams.get('redirect') || '';
  const loggedOutParam = searchParams.get('loggedOut') === 'true';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto redirect if already authenticated
  useEffect(() => {
    const token = getAuthToken();
    const user = getStoredUser();
    if (token && user) {
      if (redirectParam && redirectParam.startsWith('/')) {
        // Enforce role separation on redirect
        if (redirectParam.startsWith('/admin') && user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
          router.replace('/dashboard');
        } else {
          router.replace(redirectParam);
        }
      } else if (user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [redirectParam, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError(t('Please enter both your email/phone and password.', 'कृपया अपना ईमेल/फ़ोन और पासवर्ड दोनों दर्ज करें।'));
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const backendBase = (
        process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api'
      ).replace(/\/api\/?$/, '');

      const rawId = identifier.trim();
      const payload: any = {
        password,
        identifier: rawId,
      };
      if (rawId.includes('@')) {
        payload.email = rawId.toLowerCase();
      }

      const res = await fetch(`${backendBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = Array.isArray(data.message)
          ? data.message.join(' • ')
          : data.message || 'Authentication failed. Please check your credentials.';
        setError(msg);
        setLoading(false);
        return;
      }

      setSuccessMsg(t('Signed in successfully! Redirecting...', 'सफलतापूर्वक साइन इन हुआ! आगे बढ़ रहे हैं...'));

      if (data.accessToken && data.user) {
        setAuthSession(data.accessToken, data.user);
      }

      // Role-aware destination
      setTimeout(() => {
        if (redirectParam && redirectParam.startsWith('/')) {
          if (redirectParam.startsWith('/admin') && data.user.role !== 'ADMIN' && data.user.role !== 'SUPERADMIN') {
            router.replace('/dashboard');
          } else {
            router.replace(redirectParam);
          }
        } else if (data.user.role === 'ADMIN' || data.user.role === 'SUPERADMIN') {
          router.replace('/admin');
        } else {
          router.replace('/dashboard');
        }
      }, 300);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to server. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto my-8 p-6 sm:p-10 rounded-3xl bg-white/95 backdrop-blur-xl border border-stone-200/90 shadow-2xl space-y-6">
      {/* Sacred Icon Top */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5B0D15] via-[#7B121C] to-[#3B1E22] text-amber-200 flex items-center justify-center mx-auto shadow-lg border border-amber-300/40">
          <Lock className="w-7 h-7" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A151B]">
          {t('Sign In to AstroVD', 'एस्ट्रोवीडी में साइन इन करें')}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          {t(
            'Access your sacred birth chart, consultation bookings, and spiritual sanctuary.',
            'अपनी जन्म कुंडली, परामर्श बुकिंग और आध्यात्मिक डैशबोर्ड तक पहुंचें।'
          )}
        </p>
      </div>

      {/* Logged Out Notice */}
      {loggedOutParam && !error && !successMsg && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
          <span>{t('You have safely signed out. Please sign in to continue.', 'आप सुरक्षित रूप से साइन आउट हो गए हैं।')}</span>
        </div>
      )}

      {/* Error / Success Notices */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-shake">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        {/* Identifier (Email or Phone) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700 block">
            {t('Email Address or Mobile Number', 'ईमेल पता या मोबाइल नंबर')}
          </label>
          <div className="relative">
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. rahul@example.com or 9876543210"
              required
              autoFocus
              className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 rounded-xl border border-stone-300 focus:border-[#5B0D15] focus:ring-2 focus:ring-amber-500/20 bg-stone-50/50 hover:bg-white transition-all outline-none"
            />
            <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-stone-700">
              {t('Password', 'पासवर्ड')}
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] text-[#800000] hover:text-[#5B0D15] font-semibold hover:underline"
            >
              {t('Forgot Password?', 'पासवर्ड भूल गए?')}
            </Link>
          </div>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 rounded-xl border border-stone-300 focus:border-[#5B0D15] focus:ring-2 focus:ring-amber-500/20 bg-stone-50/50 hover:bg-white transition-all outline-none"
            />
            <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#5B0D15] via-[#7B121C] to-[#480A10] hover:from-[#7B121C] hover:to-[#5B0D15] text-amber-100 font-serif font-bold text-sm shadow-xl shadow-rose-950/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
              <span>{t('Authenticating...', 'प्रमाणीकरण हो रहा है...')}</span>
            </>
          ) : (
            <>
              <span>{t('Sign In', 'साइन इन करें')}</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </>
          )}
        </button>
      </form>

      {/* Trust & Registration helper */}
      <div className="pt-4 border-t border-stone-100 text-center space-y-3">
        <p className="text-xs text-stone-600">
          {t("Don't have an account yet?", 'क्या आपका खाता नहीं है?')}{' '}
          <Link
            href={redirectParam ? `/signup?redirect=${encodeURIComponent(redirectParam)}` : '/signup'}
            className="text-[#8B2635] hover:text-[#5B0D15] font-bold underline decoration-amber-400 hover:decoration-[#5B0D15] underline-offset-2 transition-colors cursor-pointer"
          >
            {t('Sign up here →', 'यहाँ साइन अप करें →')}
          </Link>
        </p>

        <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t('Protected by Vedic Security & 256-Bit SSL', '256-बिट एसएसएल द्वारा सुरक्षित')}</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col text-[#3B1E22]">
      <Navbar />
      <PageHeader
        breadcrumb="Authentication"
        title="Account Portal & Sign In"
        subtitle="Sign in to your sacred account to manage birth charts, consultations, and platform details."
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center justify-center">
        <Suspense fallback={<div className="text-stone-500 text-sm">Loading security portal...</div>}>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
