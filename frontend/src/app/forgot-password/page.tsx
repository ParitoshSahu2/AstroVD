'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import {
  Phone,
  Mail,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCw,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  forgotPasswordEmail,
  forgotPasswordMobile,
  resetPasswordMobile,
} from '../../lib/api';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [channel, setChannel] = useState<'PHONE' | 'EMAIL'>('PHONE');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'REQUEST' | 'RESET_PHONE'>('REQUEST');

  // Reset phone states
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resetCompleted, setResetCompleted] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (channel === 'EMAIL') {
        const trimmed = email.trim().toLowerCase();
        if (!trimmed) {
          setError(t('Please enter your email address.', 'कृपया अपना ईमेल पता दर्ज करें।'));
          setLoading(false);
          return;
        }
        const res = await forgotPasswordEmail(trimmed);
        setSuccessMsg(res.message);
        setCooldown(60);
      } else {
        const trimmed = phone.trim();
        if (!trimmed) {
          setError(t('Please enter your mobile number.', 'कृपया अपना मोबाइल नंबर दर्ज करें।'));
          setLoading(false);
          return;
        }
        const res = await forgotPasswordMobile(trimmed);
        setSuccessMsg(res.message);
        setStep('RESET_PHONE');
        setCooldown(60);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit recovery request.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (otp.trim().length !== 6) {
      setError(t('Please enter a valid 6-digit verification code.', 'कृपया 6-अंकीय सत्यापन कोड दर्ज करें।'));
      return;
    }

    if (newPassword.length < 12) {
      setError(t('New password must be at least 12 characters long.', 'नया पासवर्ड कम से कम 12 अक्षरों का होना चाहिए।'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('Passwords do not match.', 'पासवर्ड मेल नहीं खाते।'));
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordMobile(phone.trim(), otp.trim(), newPassword);
      setSuccessMsg(res.message);
      setResetCompleted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please check the verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setError('');
    try {
      const res = await forgotPasswordMobile(phone.trim());
      setSuccessMsg(res.message);
      setCooldown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to resend recovery code.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#FAF7F2] m-0 p-0 flex flex-col justify-between selection:bg-amber-400">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 pt-28 sm:pt-36 my-8">
        <div className="bg-[#FFFDF9] border border-amber-300 rounded-3xl p-6 sm:p-10 max-w-lg w-full shadow-2xl relative space-y-6">
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{t('Account Security', 'खाता सुरक्षा')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#3B1E22] font-serif">
              {resetCompleted
                ? t('Password Updated', 'पासवर्ड अपडेट हो गया')
                : step === 'RESET_PHONE'
                ? t('Set New Password', 'नया पासवर्ड बनाएं')
                : t('Recover Account Password', 'पासवर्ड पुनर्प्राप्त करें')}
            </h1>
            <p className="text-xs text-stone-600">
              {resetCompleted
                ? t('Your account has been secured with your new password.', 'आपका खाता नए पासवर्ड से सुरक्षित हो गया है।')
                : step === 'RESET_PHONE'
                ? t('Enter the 6-digit code sent via SMS to set your new password.', 'नया पासवर्ड सेट करने के लिए SMS द्वारा भेजा गया 6-अंकीय कोड दर्ज करें।')
                : t('Choose your preferred method to recover your account access.', 'अपने खाते की पहुंच पुनर्प्राप्त करने के लिए अपनी पसंदीदा विधि चुनें।')}
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {resetCompleted ? (
            <div className="text-center space-y-4 pt-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="text-xs text-stone-600">
                {t(
                  'All previous sessions across all devices have been invalidated. Please sign in with your new credentials.',
                  'सभी डिवाइसों पर पिछले सत्र अमान्य कर दिए गए हैं। कृपया अपने नए पासवर्ड के साथ लॉगिन करें।',
                )}
              </p>
              <Link
                href="/login"
                className="inline-block w-full py-3 rounded-xl bg-gradient-to-r from-[#7A1824] via-[#5B0D15] to-[#40090F] hover:from-[#8B2635] hover:via-[#6B101A] text-white font-bold text-xs sm:text-sm text-center shadow-md transition-all"
              >
                {t('Proceed to Sign In →', 'लॉग इन पर आगे बढ़ें →')}
              </Link>
            </div>
          ) : step === 'RESET_PHONE' ? (
            /* RESET PHONE OTP FORM */
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-stone-500 block text-[10px]">
                    {t('Verifying Mobile Number:', 'मोबाइल नंबर सत्यापित किया जा रहा है:')}
                  </span>
                  <span className="font-mono font-bold text-stone-800">{phone}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('REQUEST');
                    setError('');
                  }}
                  className="text-xs font-semibold text-[#8B2635] hover:text-[#5B0D15] cursor-pointer"
                >
                  {t('Change', 'बदलें')}
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t('6-Digit Verification Code', '6-अंकीय सत्यापन कोड')}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    disabled={loading}
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(val);
                      if (error) setError('');
                    }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-center font-mono font-bold text-base tracking-widest focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] shadow-sm disabled:opacity-60"
                    placeholder="••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t('New Password (min 12 characters)', 'नया पासवर्ड (कम से कम 12 अक्षर)')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    disabled={loading}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (error) setError('');
                    }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] shadow-sm disabled:opacity-60"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t('Confirm New Password', 'नए पासवर्ड की पुष्टि करें')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    disabled={loading}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError('');
                    }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] shadow-sm disabled:opacity-60"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6 || newPassword.length < 12}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7A1824] via-[#5B0D15] to-[#40090F] hover:from-[#8B2635] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('Resetting Password...', 'पासवर्ड रीसेट हो रहा है...')}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                    <span>{t('Reset Password & Sign In', 'पासवर्ड रीसेट करें और साइन इन करें')}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setStep('REQUEST')}
                  className="text-stone-500 hover:text-stone-800 inline-flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t('Back', 'वापस')}</span>
                </button>

                <button
                  type="button"
                  disabled={cooldown > 0 || resendLoading}
                  onClick={handleResendOtp}
                  className="text-[#8B2635] hover:text-[#5B0D15] font-semibold inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${resendLoading ? 'animate-spin' : ''}`} />
                  <span>
                    {cooldown > 0
                      ? t(`Resend in ${cooldown}s`, `${cooldown}s में पुनः भेजें`)
                      : t('Resend Code', 'कोड पुनः भेजें')}
                  </span>
                </button>
              </div>
            </form>
          ) : (
            /* REQUEST RECOVERY FORM */
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  {t('Recovery Method', 'पुनर्प्राप्ति का माध्यम')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setChannel('PHONE');
                      setError('');
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      channel === 'PHONE'
                        ? 'bg-[#5B0D15] text-white border-[#5B0D15] shadow-xs'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{t('Via Mobile (SMS)', 'मोबाइल (SMS) द्वारा')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setChannel('EMAIL');
                      setError('');
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      channel === 'EMAIL'
                        ? 'bg-[#5B0D15] text-white border-[#5B0D15] shadow-xs'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{t('Via Email', 'ईमेल द्वारा')}</span>
                  </button>
                </div>
              </div>

              {channel === 'PHONE' ? (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('Registered Mobile Number', 'पंजीकृत मोबाइल नंबर')}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      disabled={loading}
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (error) setError('');
                      }}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] shadow-sm disabled:opacity-60"
                      placeholder="9876543210 or +919876543210"
                    />
                  </div>
                  <span className="text-[10px] text-stone-500 mt-0.5 block">
                    {t('10-digit Indian numbers auto-prefix +91.', '10-अंकीय भारतीय नंबरों में +91 स्वतः जुड़ जाएगा।')}
                  </span>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('Registered Email Address', 'पंजीकृत ईमेल पता')}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      disabled={loading}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] shadow-sm disabled:opacity-60"
                      placeholder="seeker@celestial.com"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7A1824] via-[#5B0D15] to-[#40090F] hover:from-[#8B2635] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('Dispatching Request...', 'अनुरोध भेजा जा रहा है...')}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                    <span>
                      {channel === 'PHONE'
                        ? t('Send SMS Verification Code', 'SMS सत्यापन कोड भेजें')
                        : t('Send Password Reset Link', 'पासवर्ड रीसेट लिंक भेजें')}
                    </span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/"
                  className="text-xs text-stone-500 hover:text-stone-800 inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t('Return to AstroVD Home', 'मुख्य पृष्ठ पर वापस जाएं')}</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
