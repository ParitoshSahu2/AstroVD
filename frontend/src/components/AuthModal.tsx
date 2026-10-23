'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Phone,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  RotateCw,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  verifyEmailOtp,
  resendEmailOtp,
  verifyMobileOtp,
  resendMobileOtp,
  forgotPasswordEmail,
  forgotPasswordMobile,
  resetPasswordMobile,
} from '../lib/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
  initialMode?: 'login' | 'register';
}

type AuthMode =
  | 'login'
  | 'register'
  | 'verify_otp'
  | 'forgot_password'
  | 'reset_password_mobile';
type VerificationChannel = 'EMAIL' | 'PHONE';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'register',
}) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [regChannel, setRegChannel] = useState<VerificationChannel>('EMAIL');

  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [zodiacSign, setZodiacSign] = useState('Scorpio');

  // OTP Verification State
  const [verificationChannel, setVerificationChannel] =
    useState<VerificationChannel>('EMAIL');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationPhone, setVerificationPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [deliveryWarning, setDeliveryWarning] = useState('');
  const [unverifiedLoginTarget, setUnverifiedLoginTarget] = useState<{
    channel: VerificationChannel;
    target: string;
  } | null>(null);

  // Password Recovery States
  const [recoveryChannel, setRecoveryChannel] =
    useState<VerificationChannel>('PHONE');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryPhone, setRecoveryPhone] = useState('');
  const [recoveryOtp, setRecoveryOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryCooldown, setRecoveryCooldown] = useState(0);
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError('');
      setSuccessMsg('');
      setDeliveryWarning('');
      setOtp('');
      setUnverifiedLoginTarget(null);
    }
  }, [isOpen, initialMode]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Recovery resend countdown timer
  useEffect(() => {
    if (recoveryCooldown <= 0) return;
    const interval = setInterval(() => {
      setRecoveryCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [recoveryCooldown]);

  if (!isOpen) return null;

  const handleReset = () => {
    setError('');
    setSuccessMsg('');
    setDeliveryWarning('');
    setOtp('');
    setUnverifiedLoginTarget(null);
    setRecoveryOtp('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (recoveryChannel === 'EMAIL') {
        const trimmed = recoveryEmail.trim().toLowerCase();
        if (!trimmed) {
          setError('Please provide your registered email address.');
          setLoading(false);
          return;
        }
        const res = await forgotPasswordEmail(trimmed);
        setSuccessMsg(res.message);
        setRecoveryCooldown(60);
      } else {
        const trimmed = recoveryPhone.trim();
        if (!trimmed) {
          setError('Please provide your registered mobile number.');
          setLoading(false);
          return;
        }
        const res = await forgotPasswordMobile(trimmed);
        setSuccessMsg(res.message);
        setMode('reset_password_mobile');
        setRecoveryCooldown(60);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit password recovery request.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (recoveryOtp.trim().length !== 6) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    if (newPassword.length < 12) {
      setError('New password must be at least 12 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordMobile(
        recoveryPhone.trim(),
        recoveryOtp.trim(),
        newPassword,
      );
      setSuccessMsg(res.message);
      setLoginIdentifier(recoveryPhone.trim());
      setMode('login');
      setRecoveryOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendRecoveryOtp = async () => {
    if (recoveryCooldown > 0 || recoveryLoading) return;
    setRecoveryLoading(true);
    setError('');
    try {
      const res = await forgotPasswordMobile(recoveryPhone.trim());
      setSuccessMsg(res.message);
      setRecoveryCooldown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to resend recovery code.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    setDeliveryWarning('');
    setUnverifiedLoginTarget(null);

    // Common password check
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    const isRegister = mode === 'register';

    // Registration specific validations
    if (isRegister) {
      if (!name || name.trim().length < 2) {
        setError('Please provide your full name (at least 2 characters).');
        setLoading(false);
        return;
      }

      if (regChannel === 'EMAIL' && (!email || !email.includes('@'))) {
        setError('Please provide a valid email address.');
        setLoading(false);
        return;
      }

      if (regChannel === 'PHONE') {
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        if (!cleanPhone || cleanPhone.length < 10) {
          setError(
            'Please provide a valid 10-digit mobile number or full international number.',
          );
          setLoading(false);
          return;
        }
      }
    } else {
      // Login validation
      if (!loginIdentifier || loginIdentifier.trim().length < 3) {
        setError('Please provide your email address or registered mobile number.');
        setLoading(false);
        return;
      }
    }

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      let body: any;

      if (isRegister) {
        body = {
          name: name.trim(),
          password,
          zodiacSign,
          channel: regChannel,
        };
        if (regChannel === 'EMAIL') {
          body.email = email.trim().toLowerCase();
        } else {
          body.phone = phone.trim();
        }
      } else {
        body = {
          identifier: loginIdentifier.trim(),
          password,
        };
      }

      const backendBase = (
        process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api'
      ).replace(/\/api\/?$/, '');

      const res = await fetch(`${backendBase}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle unverified user login response (EMAIL_NOT_VERIFIED or PHONE_NOT_VERIFIED)
        if (
          data.error === 'EMAIL_NOT_VERIFIED' ||
          data.error === 'PHONE_NOT_VERIFIED'
        ) {
          const isPhone = data.error === 'PHONE_NOT_VERIFIED';
          const target = (isPhone ? data.phone : data.email) || loginIdentifier.trim();
          setUnverifiedLoginTarget({
            channel: isPhone ? 'PHONE' : 'EMAIL',
            target,
          });
          setError(
            data.message ||
              (isPhone
                ? 'Your mobile number is not verified yet. Please verify to sign in.'
                : 'Your email address is not verified yet. Please verify to sign in.'),
          );
          setLoading(false);
          return;
        }

        const message = Array.isArray(data.message)
          ? data.message.join(' • ')
          : data.message || 'Authentication failed. Please check your details.';
        setError(message);
        setLoading(false);
        return;
      }

      // Handling Registration Success (Deferred login until OTP verification)
      if (isRegister) {
        const activeChannel: VerificationChannel =
          data.channel === 'PHONE' ? 'PHONE' : 'EMAIL';
        setVerificationChannel(activeChannel);

        if (activeChannel === 'PHONE') {
          setVerificationPhone(data.phone || phone.trim());
        } else {
          setVerificationEmail(data.email || email.trim().toLowerCase());
        }

        setMode('verify_otp');
        setOtp('');

        if (data.deliveryStatus === 'FAILED') {
          setDeliveryWarning(
            activeChannel === 'PHONE'
              ? 'Account created! We encountered an issue dispatching your SMS verification code. Please click Resend Code to retry.'
              : 'Account created! We encountered an issue dispatching your verification email. Please click Resend Code to retry.',
          );
          setResendCooldown(0);
        } else {
          setSuccessMsg(
            data.message ||
              (activeChannel === 'PHONE'
                ? 'Registration successful! Please check your mobile phone for the 6-digit verification code.'
                : 'Registration successful! Please check your email for the 6-digit verification code.'),
          );
          setResendCooldown(60);
        }
        // Do NOT store token in localStorage; do NOT call onLoginSuccess yet.
        setLoading(false);
        return;
      }

      // Handling Login Success
      setSuccessMsg(data.message || 'Signed in successfully!');

      if (data.accessToken) {
        localStorage.setItem('astro_token', data.accessToken);
      }
      if (data.user) {
        localStorage.setItem('astro_user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('astro-auth-change', {
            detail: { user: data.user, token: data.accessToken },
          }),
        );
      }

      setTimeout(() => {
        onClose();
        handleReset();
      }, 700);
    } catch (err: any) {
      setError(
        err.message ||
          'Network error: could not connect to authentication server.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setDeliveryWarning('');

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      setError('Please enter a valid 6-digit numeric verification code.');
      return;
    }

    setLoading(true);

    try {
      let data: any;
      if (verificationChannel === 'PHONE') {
        data = await verifyMobileOtp(verificationPhone, cleanOtp);
      } else {
        data = await verifyEmailOtp(verificationEmail, cleanOtp);
      }

      setSuccessMsg(
        data.message ||
          'Verification successful! Welcome bonus of ₹150 credits added to your wallet.',
      );

      // Save token and user state strictly after successful verification
      if (data.accessToken) {
        localStorage.setItem('astro_token', data.accessToken);
      }
      if (data.user) {
        localStorage.setItem('astro_user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('astro-auth-change', {
            detail: { user: data.user, token: data.accessToken },
          }),
        );
      }

      setTimeout(() => {
        onClose();
        handleReset();
      }, 900);
    } catch (err: any) {
      setError(
        err.message || 'Verification failed. Please check your code and retry.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendClick = async () => {
    if (resendCooldown > 0 || resendLoading) return;

    setError('');
    setSuccessMsg('');
    setDeliveryWarning('');
    setResendLoading(true);

    try {
      let data: any;
      if (verificationChannel === 'PHONE') {
        data = await resendMobileOtp(verificationPhone);
      } else {
        data = await resendEmailOtp(verificationEmail);
      }

      if (data.deliveryStatus === 'FAILED') {
        setDeliveryWarning(
          verificationChannel === 'PHONE'
            ? 'SMS delivery issue encountered. Please verify your phone number or try resending shortly.'
            : 'Email delivery issue encountered. Please verify your address or try resending shortly.',
        );
        setResendCooldown(0);
      } else {
        setSuccessMsg(
          data.message || 'A new verification code has been dispatched!',
        );
        setResendCooldown(60);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification code.');
      if (err.statusCode === 429) {
        setResendCooldown(60);
      }
    } finally {
      setResendLoading(false);
    }
  };

  const activeVerificationIdentifier =
    verificationChannel === 'PHONE' ? verificationPhone : verificationEmail;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-[#FFFDF9] border border-[#D4AF37]/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => {
            onClose();
            handleReset();
          }}
          className="absolute top-5 right-5 text-stone-400 hover:text-[#5B0D15] p-1.5 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 pt-1">
          {mode === 'verify_otp' ? (
            <>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>₹150 Welcome Credits Pending</span>
              </div>
              <h3 className="text-2xl font-bold text-[#3B1E22] font-serif">
                {verificationChannel === 'PHONE'
                  ? t('Verify Mobile Number', 'मोबाइल नंबर सत्यापित करें')
                  : t('Verify Your Email', 'ईमेल सत्यापित करें')}
              </h3>
              <p className="text-xs text-stone-600">
                {verificationChannel === 'PHONE'
                  ? t(
                      'Enter the 6-digit code sent via SMS to activate your account and claim ₹150 spiritual welcome credits.',
                      'अपना खाता सक्रिय करने और ₹150 स्वागत बोनस प्राप्त करने के लिए SMS कोड दर्ज करें।',
                    )
                  : t(
                      'Enter the 6-digit code sent to your email to activate your account and claim ₹150 spiritual welcome credits.',
                      'अपना खाता सक्रिय करने और ₹150 स्वागत बोनस प्राप्त करने के लिए ईमेल कोड दर्ज करें।',
                    )}
              </p>
            </>
          ) : mode === 'forgot_password' ? (
            <>
              <h3 className="text-2xl font-bold text-[#3B1E22] font-serif">
                {t('Password Recovery', 'पासवर्ड पुनर्प्राप्ति')}
              </h3>
              <p className="text-xs text-stone-600">
                {t(
                  'Enter your registered mobile or email to recover your account access.',
                  'अपने खाते की पहुंच पुनर्प्राप्त करने के लिए मोबाइल या ईमेल दर्ज करें।',
                )}
              </p>
            </>
          ) : mode === 'reset_password_mobile' ? (
            <>
              <h3 className="text-2xl font-bold text-[#3B1E22] font-serif">
                {t('Reset Password via SMS', 'SMS द्वारा पासवर्ड रीसेट')}
              </h3>
              <p className="text-xs text-stone-600">
                {t(
                  'Enter the 6-digit SMS verification code and create your new secure password.',
                  '6-अंकीय SMS सत्यापन कोड दर्ज करें और नया पासवर्ड बनाएं।',
                )}
              </p>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-[#3B1E22] font-serif">
                {mode === 'register'
                  ? t('Join AstroVD Sanctuary', 'AstroVD परिवार से जुड़ें')
                  : t('Welcome Back', 'वापसी पर स्वागत है')}
              </h3>
              <p className="text-xs text-stone-600">
                {mode === 'register'
                  ? t(
                      'Receive ₹150 welcome credits upon verification!',
                      'सत्यापन पर ₹150 का स्वागत बोनस प्राप्त करें!',
                    )
                  : t(
                      'Sign in to access your saved charts and live astrologer rooms.',
                      'अपनी सहेजी गई कुंडलियों और परामर्श तक पहुंचें।',
                    )}
              </p>
            </>
          )}
        </div>

        {/* Mode Selector Tabs (only shown on login/register) */}
        {(mode === 'login' || mode === 'register') && (
          <div className="flex p-1 bg-stone-100 rounded-2xl border border-stone-200">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccessMsg('');
                setUnverifiedLoginTarget(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-[#5B0D15] shadow-sm border border-amber-300/40'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {t('Sign In', 'लॉग इन')}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
                setSuccessMsg('');
                setUnverifiedLoginTarget(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-[#7A1824] to-[#5B0D15] text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {t('Sign Up', 'साइन अप')}
            </button>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>

            {/* Direct Route to OTP Verification if unverified login */}
            {unverifiedLoginTarget && mode === 'login' && (
              <button
                type="button"
                onClick={() => {
                  setVerificationChannel(unverifiedLoginTarget.channel);
                  if (unverifiedLoginTarget.channel === 'PHONE') {
                    setVerificationPhone(unverifiedLoginTarget.target);
                  } else {
                    setVerificationEmail(unverifiedLoginTarget.target);
                  }
                  setMode('verify_otp');
                  setError('');
                  setSuccessMsg('Enter your 6-digit verification code or click Resend Code.');
                }}
                className="self-start text-xs font-bold text-[#8B2635] hover:text-[#5B0D15] underline cursor-pointer mt-1"
              >
                {t(
                  `Verify ${unverifiedLoginTarget.channel === 'PHONE' ? 'Phone' : 'Email'} Now →`,
                  `अभी ${unverifiedLoginTarget.channel === 'PHONE' ? 'मोबाइल' : 'ईमेल'} सत्यापित करें →`,
                )}
              </button>
            )}
          </div>
        )}

        {/* Delivery Warning */}
        {deliveryWarning && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{deliveryWarning}</span>
          </div>
        )}

        {/* Success Notification */}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* FORM 1: OTP VERIFICATION VIEW */}
        {mode === 'verify_otp' ? (
          <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-center">
              <span className="text-xs text-stone-500 block mb-0.5">
                {verificationChannel === 'PHONE'
                  ? t('Verification code sent via SMS to:', 'SMS सत्यापन कोड भेजा गया:')
                  : t('Verification code sent to:', 'सत्यापन कोड भेजा गया:')}
              </span>
              <span className="text-xs font-bold text-stone-800 break-all font-mono">
                {activeVerificationIdentifier}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 text-center">
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
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-stone-300 text-stone-900 text-center font-mono text-lg tracking-[0.4em] font-bold focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] shadow-sm disabled:opacity-60"
                  placeholder="••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="relative group overflow-hidden w-full py-3 rounded-xl bg-gradient-to-r from-[#7A1824] via-[#5B0D15] to-[#40090F] hover:from-[#8B2635] hover:via-[#6B101A] hover:to-[#500C13] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#5B0D15]/25 border border-[#D4AF37]/50 hover:border-[#D4AF37] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('Verifying Code...', 'सत्यापित किया जा रहा है...')}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                  <span className="relative z-10">
                    {t('Verify & Claim ₹150 Credits', 'सत्यापित करें और ₹150 बोनस पाएं')}
                  </span>
                </>
              )}
            </button>

            {/* Resend Actions & Cooldown */}
            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccessMsg('');
                }}
                className="text-stone-500 hover:text-stone-800 inline-flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('Back to Sign In', 'लॉग इन पर वापस जाएं')}</span>
              </button>

              <button
                type="button"
                disabled={resendCooldown > 0 || resendLoading}
                onClick={handleResendClick}
                className="text-[#8B2635] hover:text-[#5B0D15] font-semibold inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <RotateCw
                  className={`w-3.5 h-3.5 ${resendLoading ? 'animate-spin' : ''}`}
                />
                <span>
                  {resendCooldown > 0
                    ? t(
                        `Resend in ${resendCooldown}s`,
                        `${resendCooldown}s में पुनः भेजें`,
                      )
                    : t('Resend Code', 'कोड पुनः भेजें')}
                </span>
              </button>
            </div>
          </form>
        ) : mode === 'forgot_password' ? (
          /* FORM: FORGOT PASSWORD REQUEST */
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            {/* Channel Selector: Via Mobile (SMS) vs Via Email */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t('Recovery Method', 'पुनर्प्राप्ति का माध्यम')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRecoveryChannel('PHONE');
                    setError('');
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    recoveryChannel === 'PHONE'
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
                    setRecoveryChannel('EMAIL');
                    setError('');
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    recoveryChannel === 'EMAIL'
                      ? 'bg-[#5B0D15] text-white border-[#5B0D15] shadow-xs'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{t('Via Email', 'ईमेल द्वारा')}</span>
                </button>
              </div>
            </div>

            {recoveryChannel === 'PHONE' ? (
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
                    value={recoveryPhone}
                    onChange={(e) => {
                      setRecoveryPhone(e.target.value);
                      if (error) setError('');
                    }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] shadow-sm disabled:opacity-60"
                    placeholder="9876543210 or +919876543210"
                  />
                </div>
                <span className="text-[10px] text-stone-500 mt-0.5 block">
                  {t(
                    '10-digit Indian numbers auto-prefix +91.',
                    '10-अंकीय भारतीय नंबरों में +91 स्वतः जुड़ जाएगा।',
                  )}
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
                    value={recoveryEmail}
                    onChange={(e) => {
                      setRecoveryEmail(e.target.value);
                      if (error) setError('');
                    }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] shadow-sm disabled:opacity-60"
                    placeholder="user@example.com"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="relative group overflow-hidden w-full py-3 rounded-xl bg-gradient-to-r from-[#7A1824] via-[#5B0D15] to-[#40090F] hover:from-[#8B2635] hover:via-[#6B101A] hover:to-[#500C13] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#5B0D15]/25 border border-[#D4AF37]/50 hover:border-[#D4AF37] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {t('Dispatching Request...', 'अनुरोध भेजा जा रहा है...')}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                  <span className="relative z-10">
                    {recoveryChannel === 'PHONE'
                      ? t(
                          'Send SMS Verification Code',
                          'SMS सत्यापन कोड भेजें',
                        )
                      : t(
                          'Send Password Reset Link',
                          'पासवर्ड रीसेट लिंक भेजें',
                        )}
                  </span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccessMsg('');
                }}
                className="text-xs text-stone-500 hover:text-stone-800 inline-flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('Back to Sign In', 'लॉग इन पर वापस जाएं')}</span>
              </button>
            </div>
          </form>
        ) : mode === 'reset_password_mobile' ? (
          /* FORM: RESET PASSWORD VIA MOBILE OTP */
          <form
            onSubmit={handleResetPasswordMobileSubmit}
            className="space-y-4"
          >
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-stone-500 block text-[10px]">
                  {t(
                    'Resetting password for mobile:',
                    'मोबाइल के लिए पासवर्ड रीसेट:',
                  )}
                </span>
                <span className="font-mono font-bold text-stone-800">
                  {recoveryPhone}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMode('forgot_password');
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
                  value={recoveryOtp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setRecoveryOtp(val);
                    if (error) setError('');
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-mono tracking-widest focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] shadow-sm disabled:opacity-60 text-center font-bold text-base"
                  placeholder="••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {t(
                  'New Password (min 12 characters)',
                  'नया पासवर्ड (कम से कम 12 अक्षर)',
                )}
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
              disabled={
                loading ||
                recoveryOtp.length !== 6 ||
                newPassword.length < 12
              }
              className="relative group overflow-hidden w-full py-3 rounded-xl bg-gradient-to-r from-[#7A1824] via-[#5B0D15] to-[#40090F] hover:from-[#8B2635] hover:via-[#6B101A] hover:to-[#500C13] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#5B0D15]/25 border border-[#D4AF37]/50 hover:border-[#D4AF37] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {t(
                      'Resetting Password...',
                      'पासवर्ड रीसेट हो रहा है...',
                    )}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                  <span className="relative z-10">
                    {t(
                      'Reset Password & Sign In',
                      'पासवर्ड रीसेट करें और लॉग इन करें',
                    )}
                  </span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccessMsg('');
                }}
                className="text-stone-500 hover:text-stone-800 inline-flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('Cancel', 'रद्द करें')}</span>
              </button>

              <button
                type="button"
                disabled={recoveryCooldown > 0 || recoveryLoading}
                onClick={handleResendRecoveryOtp}
                className="text-[#8B2635] hover:text-[#5B0D15] font-semibold inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <RotateCw
                  className={`w-3.5 h-3.5 ${recoveryLoading ? 'animate-spin' : ''}`}
                />
                <span>
                  {recoveryCooldown > 0
                    ? t(
                        `Resend in ${recoveryCooldown}s`,
                        `${recoveryCooldown}s में पुनः भेजें`,
                      )
                    : t('Resend Code', 'कोड पुनः भेजें')}
                </span>
              </button>
            </div>
          </form>
        ) : (
          /* FORM 2: LOGIN / REGISTRATION VIEW */
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {mode === 'register' ? (
              <>
                {/* Channel Selector: Email vs Mobile Phone */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    {t('Registration Method', 'पंजीकरण का तरीका')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRegChannel('EMAIL');
                        setError('');
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        regChannel === 'EMAIL'
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
                        setRegChannel('PHONE');
                        setError('');
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        regChannel === 'PHONE'
                          ? 'bg-[#5B0D15] text-white border-[#5B0D15] shadow-xs'
                          : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{t('Via Mobile (SMS)', 'मोबाइल (SMS) द्वारा')}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('Full Name', 'पूरा नाम')}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      disabled={loading}
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (error) setError('');
                      }}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] shadow-sm disabled:opacity-60"
                      placeholder="Aarav Sharma"
                    />
                  </div>
                </div>

                {regChannel === 'EMAIL' ? (
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {t('Email Address', 'ईमेल पता')}
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
                        placeholder="user@example.com"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {t('Mobile Number', 'मोबाइल नंबर')}
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
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <span className="text-[10px] text-stone-500 mt-0.5 block">
                      {t(
                        '10-digit Indian numbers auto-prefix +91.',
                        '10-अंकीय भारतीय नंबरों में +91 स्वतः जुड़ जाएगा।',
                      )}
                    </span>
                  </div>
                )}

              </>
            ) : (
              /* LOGIN IDENTIFIER INPUT (Supports Email or Phone) */
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t('Email Address or Mobile Phone', 'ईमेल पता या मोबाइल नंबर')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    disabled={loading}
                    value={loginIdentifier}
                    onChange={(e) => {
                      setLoginIdentifier(e.target.value);
                      if (error) setError('');
                    }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] shadow-sm disabled:opacity-60"
                    placeholder="user@example.com or +919876543210"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-stone-700">
                  {t('Password', 'पासवर्ड')}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setError('');
                      setSuccessMsg('');
                      setDeliveryWarning('');
                      if (loginIdentifier.trim()) {
                        setRecoveryPhone(loginIdentifier.trim());
                        setRecoveryEmail(loginIdentifier.trim());
                      }
                    }}
                    className="text-[11px] text-[#8B2635] hover:text-[#5B0D15] font-semibold cursor-pointer"
                  >
                    {t('Forgot password?', 'पासवर्ड भूल गए?')}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] shadow-sm disabled:opacity-60"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative group overflow-hidden w-full py-3 rounded-xl bg-gradient-to-r from-[#7A1824] via-[#5B0D15] to-[#40090F] hover:from-[#8B2635] hover:via-[#6B101A] hover:to-[#500C13] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#5B0D15]/25 border border-[#D4AF37]/50 hover:border-[#D4AF37] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {mode === 'register'
                      ? 'Creating Sacred Account...'
                      : 'Authenticating...'}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                  <span className="relative z-10">
                    {mode === 'register'
                      ? t(
                          'Register & Get Verification Code',
                          'पंजीकरण करें और कोड प्राप्त करें',
                        )
                      : t('Sign In to Account', 'खाते में प्रवेश करें')}
                  </span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Bottom Switcher */}
        {mode !== 'verify_otp' &&
          mode !== 'forgot_password' &&
          mode !== 'reset_password_mobile' && (
          <div className="text-center pt-3 border-t border-stone-200">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs">
              <span className="text-stone-600 font-medium">
                {mode === 'register'
                  ? t('Already have an account?', 'पहले से खाता है?')
                  : t("Don't have an account?", 'खाता नहीं है?')}
              </span>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'register' ? 'login' : 'register');
                  setError('');
                  setSuccessMsg('');
                  setUnverifiedLoginTarget(null);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAF0E6] hover:bg-[#8B2635] text-[#8B2635] hover:text-white font-bold text-xs border border-[#D4AF37]/70 hover:border-[#8B2635] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <span>
                  {mode === 'register'
                    ? t('Sign in here →', 'यहाँ लॉग इन करें →')
                    : t('Join free today ✨', 'यहाँ निःशुल्क जुड़ें ✨')}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
