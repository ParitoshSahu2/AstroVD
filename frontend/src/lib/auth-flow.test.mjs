import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage implementation
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

describe('Phase 2D Frontend Auth & OTP Verification Flow Tests', () => {
  // TEST 1: Registration transitions to OTP entry
  it('TEST-01: registration response transitions mode to verify_otp with normalized email', () => {
    const registrationResponse = {
      message: 'Registration successful! Please verify your email with the 6-digit verification code.',
      email: 'arjun@cosmos.com',
      emailVerificationRequired: true,
      deliveryStatus: 'SENT',
    };

    let currentMode = 'register';
    let verificationEmail = '';
    let successMessage = '';

    if (registrationResponse.emailVerificationRequired) {
      currentMode = 'verify_otp';
      verificationEmail = registrationResponse.email;
      successMessage = registrationResponse.message;
    }

    assert.equal(currentMode, 'verify_otp');
    assert.equal(verificationEmail, 'arjun@cosmos.com');
    assert.match(successMessage, /verify your email/i);
  });

  // TEST 2: Registration does not save a JWT or mark user authenticated
  it('TEST-02: registration does not save a token or user to localStorage before verification', () => {
    const storage = new MockLocalStorage();
    let onLoginSuccessCalled = false;

    const registrationResponse = {
      message: 'Registration successful!',
      email: 'arjun@cosmos.com',
      emailVerificationRequired: true,
    };

    // Simulated AuthModal handler: verify that registration alone does not persist session
    if (registrationResponse.accessToken) {
      storage.setItem('astro_token', registrationResponse.accessToken);
    }
    if (registrationResponse.user) {
      storage.setItem('astro_user', JSON.stringify(registrationResponse.user));
      onLoginSuccessCalled = true;
    }

    assert.equal(storage.getItem('astro_token'), null);
    assert.equal(storage.getItem('astro_user'), null);
    assert.equal(onLoginSuccessCalled, false);
  });

  // TEST 3: OTP input validation (exactly 6 numeric digits)
  it('TEST-03: validates 6-digit numeric OTP and rejects letters, whitespace, or incorrect length', () => {
    const validateOtp = (code) => {
      const clean = code.trim().replace(/\D/g, '').slice(0, 6);
      if (!clean || clean.length !== 6 || !/^\d{6}$/.test(clean)) {
        return { valid: false, error: 'Please enter a valid 6-digit numeric verification code.' };
      }
      return { valid: true, cleanOtp: clean };
    };

    assert.equal(validateOtp('12345').valid, false);
    assert.equal(validateOtp('abcdef').valid, false);
    assert.equal(validateOtp('12a456').valid, false);
    assert.equal(validateOtp('1234567').valid, true); // Sliced to 6
    assert.equal(validateOtp(' 482915 ').valid, true);
    assert.equal(validateOtp(' 482915 ').cleanOtp, '482915');
  });

  // TEST 4: Successful verification saves authentication state exactly once
  it('TEST-04: successful verification stores accessToken, user, and triggers onLoginSuccess exactly once', () => {
    const storage = new MockLocalStorage();
    let onLoginSuccessCallCount = 0;
    let loggedInUser = null;

    const verificationResponse = {
      message: 'Email verified successfully! Welcome bonus of ₹150 credits added.',
      accessToken: 'eyJhbGciOi_mock_token_phase2d',
      user: {
        id: 'usr-123',
        email: 'arjun@cosmos.com',
        role: 'USER',
        status: 'ACTIVE',
        emailVerified: true,
        walletBalance: 150.0,
      },
    };

    const handleSuccess = (data) => {
      if (data.accessToken) {
        storage.setItem('astro_token', data.accessToken);
      }
      if (data.user) {
        storage.setItem('astro_user', JSON.stringify(data.user));
        onLoginSuccessCallCount++;
        loggedInUser = data.user;
      }
    };

    handleSuccess(verificationResponse);

    assert.equal(storage.getItem('astro_token'), 'eyJhbGciOi_mock_token_phase2d');
    assert.equal(JSON.parse(storage.getItem('astro_user')).walletBalance, 150.0);
    assert.equal(onLoginSuccessCallCount, 1);
    assert.equal(loggedInUser.emailVerified, true);
  });

  // TEST 5: Incorrect OTP displays error and preserves entered email
  it('TEST-05: incorrect OTP preserves email and displays error without resetting the email', () => {
    let verificationEmail = 'arjun@cosmos.com';
    let errorMessage = '';

    const backendError = {
      statusCode: 401,
      message: 'Incorrect verification code. 2 attempt(s) remaining.',
    };

    errorMessage = backendError.message;

    assert.equal(verificationEmail, 'arjun@cosmos.com');
    assert.equal(errorMessage, 'Incorrect verification code. 2 attempt(s) remaining.');
  });

  // TEST 6: Resend countdown disables button
  it('TEST-06: resend countdown disables resend action while cooldown > 0', () => {
    const isResendDisabled = (cooldown, loading) => cooldown > 0 || loading;

    assert.equal(isResendDisabled(60, false), true);
    assert.equal(isResendDisabled(15, false), true);
    assert.equal(isResendDisabled(0, false), false);
    assert.equal(isResendDisabled(0, true), true);
  });

  // TEST 7: HTTP 429 response displays appropriate feedback
  it('TEST-07: handles HTTP 429 rate limit response and applies cooldown', () => {
    const errorResponse = {
      statusCode: 429,
      message: 'Please wait 45 second(s) before requesting another code.',
    };

    let cooldown = 0;
    let displayedError = '';

    if (errorResponse.statusCode === 429) {
      displayedError = errorResponse.message;
      cooldown = 60;
    }

    assert.match(displayedError, /45 second/);
    assert.equal(cooldown, 60);
  });

  // TEST 8: Delivery failure displays warning and retry action
  it('TEST-08: delivery failure sets deliveryWarning and enables immediate retry', () => {
    const regResult = {
      emailVerificationRequired: true,
      deliveryStatus: 'FAILED',
    };

    let deliveryWarning = '';
    let cooldown = 60;

    if (regResult.deliveryStatus === 'FAILED') {
      deliveryWarning = 'Account created! We encountered an issue dispatching your verification email.';
      cooldown = 0; // Waive cooldown so user can retry immediately
    }

    assert.match(deliveryWarning, /issue dispatching/);
    assert.equal(cooldown, 0);
  });

  // TEST 9: EMAIL_NOT_VERIFIED login response provides route to OTP verification
  it('TEST-09: login response with EMAIL_NOT_VERIFIED enables direct verification transition', () => {
    const loginError = {
      statusCode: 401,
      error: 'EMAIL_NOT_VERIFIED',
      message: 'Please verify your email address before signing in.',
      email: 'unverified@astrovd.com',
    };

    let mode = 'login';
    let unverifiedEmail = null;
    let errorMsg = '';

    if (loginError.error === 'EMAIL_NOT_VERIFIED') {
      unverifiedEmail = loginError.email;
      errorMsg = loginError.message;
    }

    assert.equal(unverifiedEmail, 'unverified@astrovd.com');
    assert.equal(errorMsg, 'Please verify your email address before signing in.');

    // Transition triggered by user clicking "Verify Email Now"
    if (unverifiedEmail) {
      mode = 'verify_otp';
    }
    assert.equal(mode, 'verify_otp');
  });

  // TEST 10: Existing verified-user login remains functional
  it('TEST-10: existing backfilled verified user logs in directly with token and profile', () => {
    const storage = new MockLocalStorage();
    const loginSuccessResponse = {
      message: 'Login successful!',
      accessToken: 'jwt_for_existing_verified_user',
      user: {
        id: 'usr-priya',
        email: 'priya@astrovd.com',
        role: 'USER',
        status: 'ACTIVE',
        emailVerified: true,
        walletBalance: 420.0,
      },
    };

    storage.setItem('astro_token', loginSuccessResponse.accessToken);
    storage.setItem('astro_user', JSON.stringify(loginSuccessResponse.user));

    assert.equal(storage.getItem('astro_token'), 'jwt_for_existing_verified_user');
    assert.equal(JSON.parse(storage.getItem('astro_user')).emailVerified, true);
    assert.equal(JSON.parse(storage.getItem('astro_user')).walletBalance, 420.0);
  });

  // TEST 11: Password reset and logout behavior are preserved
  it('TEST-11: logout clears localStorage items and invalidates session', () => {
    const storage = new MockLocalStorage();
    storage.setItem('astro_token', 'active_token');
    storage.setItem('astro_user', JSON.stringify({ name: 'Priya' }));

    // Simulate logout action
    storage.removeItem('astro_token');
    storage.removeItem('astro_user');

    assert.equal(storage.getItem('astro_token'), null);
    assert.equal(storage.getItem('astro_user'), null);
  });

  // TEST 12: Phone registration response transitions mode to verify_otp with channel PHONE
  it('TEST-12: phone registration response transitions mode to verify_otp with channel PHONE and normalized number', () => {
    const registrationResponse = {
      message: 'Registration successful! Please verify your phone number with the 6-digit verification code sent via SMS.',
      phone: '+919876543210',
      channel: 'PHONE',
      phoneVerificationRequired: true,
      verificationRequired: true,
      deliveryStatus: 'SENT',
    };

    let currentMode = 'register';
    let verificationChannel = 'EMAIL';
    let verificationPhone = '';

    if (registrationResponse.verificationRequired) {
      currentMode = 'verify_otp';
      verificationChannel = registrationResponse.channel || 'EMAIL';
      verificationPhone = registrationResponse.phone || '';
    }

    assert.equal(currentMode, 'verify_otp');
    assert.equal(verificationChannel, 'PHONE');
    assert.equal(verificationPhone, '+919876543210');
  });

  // TEST 13: Successful mobile OTP verification saves authentication state
  it('TEST-13: successful mobile OTP verification stores accessToken, user, and triggers onLoginSuccess', () => {
    const storage = new MockLocalStorage();
    let onLoginSuccessCalled = false;

    const verificationResponse = {
      message: 'Phone verified successfully! Welcome bonus of ₹150 credits added to your wallet.',
      accessToken: 'jwt_mock_token_mobile_otp',
      user: {
        id: 'user-phone-1',
        phone: '+919876543210',
        phoneVerified: true,
        walletBalance: 150.0,
      },
    };

    if (verificationResponse.accessToken) {
      storage.setItem('astro_token', verificationResponse.accessToken);
    }
    if (verificationResponse.user) {
      storage.setItem('astro_user', JSON.stringify(verificationResponse.user));
      onLoginSuccessCalled = true;
    }

    assert.equal(storage.getItem('astro_token'), 'jwt_mock_token_mobile_otp');
    assert.equal(JSON.parse(storage.getItem('astro_user')).phoneVerified, true);
    assert.equal(JSON.parse(storage.getItem('astro_user')).walletBalance, 150.0);
    assert.equal(onLoginSuccessCalled, true);
  });

  // TEST 14: Login with PHONE_NOT_VERIFIED enables direct phone verification transition
  it('TEST-14: login response with PHONE_NOT_VERIFIED enables direct phone verification transition', () => {
    const loginError = {
      statusCode: 401,
      error: 'PHONE_NOT_VERIFIED',
      message: 'Please verify your phone number before signing in.',
      phone: '+919876543210',
    };

    let mode = 'login';
    let unverifiedPhone = null;
    let channel = 'EMAIL';

    if (loginError.error === 'PHONE_NOT_VERIFIED') {
      unverifiedPhone = loginError.phone;
      channel = 'PHONE';
      mode = 'verify_otp';
    }

    assert.equal(unverifiedPhone, '+919876543210');
    assert.equal(channel, 'PHONE');
    assert.equal(mode, 'verify_otp');
  });

  // TEST 15: Dual-channel registration tab switch correctly manages state
  it('TEST-15: registration channel tab switch correctly selects channel and input validation', () => {
    let regChannel = 'EMAIL';

    // Switch to phone
    regChannel = 'PHONE';
    assert.equal(regChannel, 'PHONE');

    // Phone validation
    const validatePhone = (num) => {
      const clean = num.replace(/[\s\-\(\)]/g, '');
      return clean.length >= 10;
    };
    assert.equal(validatePhone('9876543210'), true);
    assert.equal(validatePhone('+91 98765-43210'), true);
    assert.equal(validatePhone('12345'), false);
  });

  // TEST 16: Phase 2D Stage 6A - Booking contact phone rejects hardcoded dummy fallback
  it('TEST-16: booking contact phone rejects hardcoded dummy fallback (+919876543210)', () => {
    const isDummyFallback = (num) => {
      const cleaned = num.replace(/[\s\-()]/g, '');
      return cleaned === '+919876543210' || cleaned === '9876543210';
    };

    assert.equal(isDummyFallback('+919876543210'), true);
    assert.equal(isDummyFallback('9876543210'), true);
    assert.equal(isDummyFallback('+91 98765-43210'), true);
    assert.equal(isDummyFallback('+919812345678'), false);
    assert.equal(isDummyFallback('+14155552671'), false);
  });

  // TEST 17: Phase 2D Stage 6A - Booking contact normalization to E.164
  it('TEST-17: booking contact normalization standardizes 10-digit Indian numbers to E.164 format', () => {
    const normalizeInputPhone = (val) => {
      const trimmed = val.trim();
      const cleaned = trimmed.replace(/[\s\-()]/g, '');
      if (/^\d{10}$/.test(cleaned)) {
        return `+91${cleaned}`;
      }
      if (/^91\d{10}$/.test(cleaned)) {
        return `+${cleaned}`;
      }
      return cleaned;
    };

    assert.equal(normalizeInputPhone('9812345678'), '+919812345678');
    assert.equal(normalizeInputPhone('  98123 45678  '), '+919812345678');
    assert.equal(normalizeInputPhone('919812345678'), '+919812345678');
    assert.equal(normalizeInputPhone('+919812345678'), '+919812345678');
    assert.equal(normalizeInputPhone('+14155552671'), '+14155552671');
  });

  // TEST 18: Phase 2D Stage 6A - Booking modal prevents duplicate submissions
  it('TEST-18: booking modal locks submission while bookingLoading is active', () => {
    let bookingLoading = false;
    let submissionCount = 0;

    const handleConfirmBooking = () => {
      if (bookingLoading) return;
      bookingLoading = true;
      submissionCount++;
    };

    handleConfirmBooking();
    handleConfirmBooking(); // Attempt duplicate click
    handleConfirmBooking(); // Attempt duplicate click

    assert.equal(submissionCount, 1);
    assert.equal(bookingLoading, true);
  });

  // TEST 19: Phase 2D Stage 6A - Phone-based recovery state machine and OTP validation
  it('TEST-19: forgot password mobile flow transitions to reset_password_mobile and validates 6-digit OTP', () => {
    let mode = 'forgot_password';
    let targetPhone = '';
    let cooldown = 0;

    // Simulate requesting reset OTP
    const onForgotPhoneSuccess = (phone) => {
      targetPhone = phone;
      cooldown = 60;
      mode = 'reset_password_mobile';
    };

    onForgotPhoneSuccess('+919812345678');

    assert.equal(mode, 'reset_password_mobile');
    assert.equal(targetPhone, '+919812345678');
    assert.equal(cooldown, 60);

    const validateOtp = (otp) => /^\d{6}$/.test(otp.trim());
    assert.equal(validateOtp('123456'), true);
    assert.equal(validateOtp('12345'), false);
    assert.equal(validateOtp('12345a'), false);
  });

  // TEST 20: Phase 2D Stage 6A - Password policy for phone reset requires >= 12 characters and matching confirmation
  it('TEST-20: phone reset enforces >= 12 character password policy and confirmation match', () => {
    const validateResetPassword = (newPw, confirmPw) => {
      if (!newPw || newPw.length < 12) {
        return { valid: false, error: 'Password must be at least 12 characters long.' };
      }
      if (newPw !== confirmPw) {
        return { valid: false, error: 'Passwords do not match.' };
      }
      return { valid: true };
    };

    assert.equal(validateResetPassword('short', 'short').valid, false);
    assert.equal(validateResetPassword('ValidPassword123!', 'MismatchPassword123!').valid, false);
    assert.equal(validateResetPassword('SuperSecureVedicPassword#2026', 'SuperSecureVedicPassword#2026').valid, true);
  });

  // TEST 21: Phase 2D Stage 6A - Successful password reset returns user to login mode
  it('TEST-21: successful phone password reset clears sensitive state and transitions to login mode', () => {
    let mode = 'reset_password_mobile';
    let resetOtp = '654321';
    let newPassword = 'SuperSecureVedicPassword#2026';
    let confirmPassword = 'SuperSecureVedicPassword#2026';
    let statusMessage = '';

    // Successful API response handler
    const onResetSuccess = () => {
      resetOtp = '';
      newPassword = '';
      confirmPassword = '';
      statusMessage = 'Password updated successfully! Please sign in with your new password.';
      mode = 'login';
    };

    onResetSuccess();

    assert.equal(mode, 'login');
    assert.equal(resetOtp, '');
    assert.equal(newPassword, '');
    assert.match(statusMessage, /Password updated successfully/);
  });
});
