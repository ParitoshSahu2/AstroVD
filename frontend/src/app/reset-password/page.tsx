'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import {
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { resetPasswordEmail } from '../../lib/api';

function ResetPasswordForm() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError(
        t(
          'Missing password reset token in link. Please request a new recovery link or use mobile SMS recovery.',
          'रीसेट टोकन लिंक में नहीं मिला। कृपया नया लिंक अनुरोध करें या मोबाइल SMS पुनर्प्राप्ति का उपयोग करें।',
        ),
      );
    }
  }, [token, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError(t('Invalid or missing reset token.', 'अमान्य या गायब रीसेट टोकन।'));
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
      await resetPasswordEmail(token, newPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The link may have expired or already been used.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FFFDF9] border border-amber-300 rounded-3xl p-6 sm:p-10 max-w-lg w-full shadow-2xl relative space-y-6">
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>{t('Sacred Account Security', 'खाता सुरक्षा')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#3B1E22] font-serif">
          {success
            ? t('Password Successfully Reset', 'पासवर्ड सफलतापूर्वक रीसेट हो गया')
            : t('Create New Password', 'नया पासवर्ड बनाएं')}
        </h1>
        <p className="text-xs text-stone-600">
          {success
            ? t('Your credentials have been securely updated.', 'आपका पासवर्ड सुरक्षित रूप से अपडेट हो गया है।')
            : t('Choose a strong password of at least 12 characters.', 'कम से कम 12 अक्षरों का एक मजबूत पासवर्ड चुनें।')}
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="text-center space-y-4 pt-2">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <p className="text-xs text-stone-600">
            {t(
              'All prior sessions across all devices have been revoked. You can now sign in with your new password.',
              'सभी डिवाइसों पर पिछले सत्र अमान्य कर दिए गए हैं। अब आप अपने नए पासवर्ड से साइन इन कर सकते हैं।',
            )}
          </p>
          <Link
            href="/"
            className="inline-block w-full py-3 rounded-xl bg-gradient-to-r from-[#7A1824] via-[#5B0D15] to-[#40090F] hover:from-[#8B2635] text-white font-bold text-xs sm:text-sm text-center shadow-md transition-all"
          >
            {t('Proceed to Home & Sign In →', 'होम पर जाएं और साइन इन करें →')}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {t('New Password (min 12 characters)', 'नया पासवर्ड (कम से कम 12 अक्षर)')}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                disabled={loading || !token}
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
                disabled={loading || !token}
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
            disabled={loading || !token || newPassword.length < 12}
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
                <span>{t('Reset Password & Secure Account', 'पासवर्ड रीसेट करें')}</span>
              </>
            )}
          </button>

          {!token && (
            <div className="text-center pt-2">
              <Link
                href="/forgot-password"
                className="text-xs text-[#8B2635] hover:underline font-semibold"
              >
                {t('Need a new recovery link? Click here', 'नया रिकवरी लिंक चाहिए? यहाँ क्लिक करें')}
              </Link>
            </div>
          )}
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative min-h-screen w-full bg-[#FAF7F2] m-0 p-0 flex flex-col justify-between selection:bg-amber-400">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 pt-28 sm:pt-36 my-8">
        <Suspense fallback={<div className="text-stone-500 text-sm">Loading security token...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
