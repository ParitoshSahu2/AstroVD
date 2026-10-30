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
  Phone,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Compass,
  KeyRound,
  RotateCw,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getAuthToken, getStoredUser, setAuthSession } from '../../lib/auth';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const redirectParam = searchParams.get('redirect') || '';

  const [channel, setChannel] = useState<'EMAIL' | 'PHONE'>('EMAIL');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // OTP Verification Stage
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [activeIdentifier, setActiveIdentifier] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  // Auto redirect if already authenticated
  useEffect(() => {
    const token = getAuthToken();
    const user = getStoredUser();
    if (token && user) {
      if (redirectParam && redirectParam.startsWith('/')) {
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

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('Please enter your full name.', 'कृपया अपना पूरा नाम दर्ज करें।'));
      return;
    }
    if (channel === 'EMAIL' && !email.trim()) {
      setError(t('Please enter your email address.', 'कृपया अपना ईमेल पता दर्ज करें।'));
      return;
    }
    if (channel === 'PHONE' && !phone.trim()) {
      setError(t('Please enter your mobile phone number.', 'कृपया अपना मोबाइल नंबर दर्ज करें।'));
      return;
    }
    if (!password || password.length < 6) {
      setError(t('Password must be at least 6 characters.', 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।'));
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const backendBase = (
        process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api'
      ).replace(/\/api\/?$/, '');

      const payload: any = {
        name: name.trim(),
        password,
        channel,
      };

      if (channel === 'EMAIL') {
        payload.email = email.trim().toLowerCase();
      } else {
        let cleanPhone = phone.trim().replace(/[\s-]/g, '');
        if (!cleanPhone.startsWith('+') && /^\d{10}$/.test(cleanPhone)) {
          cleanPhone = `+91${cleanPhone}`;
        }
        payload.phone = cleanPhone;
      }

      const res = await fetch(`${backendBase}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = Array.isArray(data.message)
          ? data.message.join(' • ')
          : data.message || 'Registration failed. Please try again.';
        setError(msg);
        setLoading(false);
        return;
      }

      // If OTP verification required
      if (data.requiresVerification) {
        setIsVerifyingOtp(true);
        setActiveIdentifier(channel === 'EMAIL' ? email.trim() : phone.trim());
        setResendCooldown(30);
        setSuccessMsg(
          data.message ||
            t(
              'Verification code dispatched! Enter the 6-digit code below.',
              'सत्यापन कोड भेज दिया गया है! नीचे 6-अंकीय कोड दर्ज करें।'
            )
        );
        setLoading(false);
        return;
      }

      // If instant session returned
      if (data.accessToken && data.user) {
        setAuthSession(data.accessToken, data.user);
        setSuccessMsg(t('Welcome to AstroVD! Redirecting...', 'AstroVD में आपका स्वागत है! आगे बढ़ रहे हैं...'));
        setTimeout(() => {
          if (redirectParam && redirectParam.startsWith('/')) {
            router.replace(redirectParam);
          } else {
            router.replace('/dashboard');
          }
        }, 300);
      } else {
        setIsVerifyingOtp(true);
        setActiveIdentifier(channel === 'EMAIL' ? email.trim() : phone.trim());
        setResendCooldown(30);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to connect to server. Please try again.');
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError(t('Please enter a valid 6-digit code.', 'कृपया 6-अंकीय मान्य कोड दर्ज करें।'));
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const backendBase = (
        process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api'
      ).replace(/\/api\/?$/, '');

      const payload: any = {
        code: otp,
        channel,
      };
      if (channel === 'EMAIL') {
        payload.email = email.trim().toLowerCase();
      } else {
        payload.phone = phone.trim();
      }

      const res = await fetch(`${backendBase}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Invalid verification code. Please check and try again.');
        setLoading(false);
        return;
      }

      setSuccessMsg(t('Account verified successfully! Welcome to AstroVD.', 'खाता सत्यापित हुआ! AstroVD में आपका स्वागत है।'));

      if (data.accessToken && data.user) {
        setAuthSession(data.accessToken, data.user);
      }

      setTimeout(() => {
        if (redirectParam && redirectParam.startsWith('/')) {
          router.replace(redirectParam);
        } else {
          router.replace('/dashboard');
        }
      }, 400);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setError('');

    try {
      const backendBase = (
        process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api'
      ).replace(/\/api\/?$/, '');

      const payload: any = { channel };
      if (channel === 'EMAIL') {
        payload.email = email.trim().toLowerCase();
      } else {
        payload.phone = phone.trim();
      }

      const res = await fetch(`${backendBase}/api/auth/resend-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to resend code.');
      } else {
        setSuccessMsg(t('New code sent!', 'नया कोड भेजा गया!'));
        setResendCooldown(45);
      }
    } catch (err: any) {
      setError(err.message || 'Error resending code.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto my-8 p-6 sm:p-10 rounded-3xl bg-white/95 backdrop-blur-xl border border-stone-200/90 shadow-2xl space-y-6">
      {/* Sacred Icon Top */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7A1824] via-[#5B0D15] to-[#3B1E22] text-amber-200 flex items-center justify-center mx-auto shadow-lg border border-amber-300/40">
          <Compass className="w-7 h-7 text-amber-300" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A151B]">
          {isVerifyingOtp ? t('Verify Account', 'खाता सत्यापित करें') : t('Create an Account', 'नया खाता बनाएं')}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          {isVerifyingOtp
            ? t('Enter the 6-digit verification code sent to your email / phone.', 'अपने ईमेल / फोन पर भेजा गया 6-अंकीय सत्यापन कोड दर्ज करें।')
            : t('Join our consecrated Vedic astrology and spiritual guidance community.', 'हमारे वैदिक ज्योतिष एवं आध्यात्मिक मार्गदर्शन समुदाय से जुड़ें।')}
        </p>
      </div>

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

      {/* VIEW 1: OTP VERIFICATION */}
      {isVerifyingOtp ? (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-center">
            <span className="text-xs text-stone-500 block mb-0.5">
              {channel === 'PHONE'
                ? t('Verification code sent via SMS to:', 'SMS सत्यापन कोड भेजा गया:')
                : t('Verification code sent to:', 'सत्यापन कोड भेजा गया:')}
            </span>
            <span className="text-xs font-bold text-stone-800 break-all font-mono">
              {activeIdentifier}
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 block text-center">
              {t('Enter 6-Digit Verification Code', '6-अंकीय सत्यापन कोड दर्ज करें')}
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                autoFocus
                disabled={loading}
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(val);
                  if (error) setError('');
                }}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-stone-300 text-stone-900 text-center font-mono text-lg tracking-[0.4em] font-bold focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-amber-500/20 shadow-sm"
                placeholder="••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#5B0D15] via-[#7B121C] to-[#480A10] hover:from-[#7B121C] hover:to-[#5B0D15] text-amber-100 font-serif font-bold text-sm shadow-xl shadow-rose-950/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                <span>{t('Verifying...', 'सत्यापित हो रहा है...')}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                <span>{t('Verify & Claim ₹150 Bonus', 'सत्यापित करें व ₹150 पाएं')}</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-between pt-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setIsVerifyingOtp(false);
                setError('');
                setSuccessMsg('');
              }}
              className="text-stone-500 hover:text-stone-800 underline cursor-pointer"
            >
              ← {t('Change details', 'विवरण बदलें')}
            </button>

            <button
              type="button"
              disabled={resendCooldown > 0 || resendLoading}
              onClick={handleResendCode}
              className="text-[#8B2635] hover:text-[#5B0D15] font-semibold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCw className={`w-3.5 h-3.5 ${resendLoading ? 'animate-spin' : ''}`} />
              <span>
                {resendCooldown > 0
                  ? t(`Resend in ${resendCooldown}s`, `${resendCooldown}s में पुनः भेजें`)
                  : t('Resend Code', 'कोड पुनः भेजें')}
              </span>
            </button>
          </div>
        </form>
      ) : (
        /* VIEW 2: REGISTRATION FORM */
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Channel Selector: Email vs Mobile (SMS) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 block">
              {t('Registration Method', 'पंजीकरण का माध्यम')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setChannel('EMAIL');
                  setError('');
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  channel === 'EMAIL'
                    ? 'bg-[#5B0D15] text-white border-[#5B0D15] shadow-xs'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{t('Via Email', 'ईमेल द्वारा')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setChannel('PHONE');
                  setError('');
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  channel === 'PHONE'
                    ? 'bg-[#5B0D15] text-white border-[#5B0D15] shadow-xs'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{t('Via Mobile (SMS)', 'मोबाइल (SMS) द्वारा')}</span>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 block">
              {t('Full Name', 'पूरा नाम')}
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aarav Sharma"
                required
                className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 rounded-xl border border-stone-300 focus:border-[#5B0D15] focus:ring-2 focus:ring-amber-500/20 bg-stone-50/50 hover:bg-white transition-all outline-none"
              />
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Email or Phone depending on channel */}
          {channel === 'EMAIL' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">
                {t('Email Address', 'ईमेल पता')}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                  className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 rounded-xl border border-stone-300 focus:border-[#5B0D15] focus:ring-2 focus:ring-amber-500/20 bg-stone-50/50 hover:bg-white transition-all outline-none"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">
                {t('Mobile Number', 'मोबाइल नंबर')}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                  className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 rounded-xl border border-stone-300 focus:border-[#5B0D15] focus:ring-2 focus:ring-amber-500/20 bg-stone-50/50 hover:bg-white transition-all outline-none"
                />
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <span className="text-[10px] text-stone-500 mt-0.5 block">
                {t('10-digit Indian numbers auto-prefix +91.', '10-अंकीय भारतीय नंबरों में +91 स्वतः जुड़ जाएगा।')}
              </span>
            </div>
          )}

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 block">
              {t('Password', 'पासवर्ड')}
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
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
                <span>{t('Registering Account...', 'पंजीकरण हो रहा है...')}</span>
              </>
            ) : (
              <>
                <span>{t('Register & Claim ₹150 Credits', 'पंजीकरण करें और ₹150 पाएं')}</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Back to Login link */}
      <div className="pt-4 border-t border-stone-100 text-center space-y-3">
        <p className="text-xs text-stone-600">
          {t('Already have an account?', 'क्या आपके पास पहले से खाता है?')}{' '}
          <Link
            href={redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : '/login'}
            className="text-[#8B2635] hover:text-[#5B0D15] font-bold underline decoration-amber-400 hover:decoration-[#5B0D15] underline-offset-2 transition-colors cursor-pointer"
          >
            {t('Sign in here →', 'यहाँ साइन इन करें →')}
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

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col text-[#3B1E22]">
      <Navbar />
      <PageHeader
        breadcrumb="Authentication"
        title="Account Portal & Sign Up"
        subtitle="Join AstroVD Sanctuary to access birth charts, personal consultations, and exclusive sacred blessings."
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center justify-center">
        <Suspense fallback={<div className="text-stone-500 text-sm">Loading security portal...</div>}>
          <SignupForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
