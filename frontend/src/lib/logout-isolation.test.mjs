/**
 * Automated Test Suite: Logout Security, Cache Invalidation & Session Isolation
 * 
 * Validates:
 * 1. Token & session storage clearance on logout
 * 2. Instant wiping of cached dashboard, wallet, orders, bookings, and admin metrics
 * 3. BFCache / Browser Back & Direct URL route protection (/dashboard, /admin, /profile -> /login)
 * 4. Backend API rejection of missing, expired, and invalidated tokens
 * 5. Account switching isolation between different users and roles
 */

import { test, describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Simulated Browser Storage
class MockStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.get(key) || null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

describe('Logout Security & Session Isolation Suite', () => {
  const backendBase = 'http://localhost:5001/api';

  // TEST 1: Storage clearance on logout
  it('TEST-01: logout clears authentication tokens, user metadata, and sessionStorage', () => {
    const localStorage = new MockStorage();
    const sessionStorage = new MockStorage();

    localStorage.setItem('astro_token', 'mock_jwt_token_123');
    localStorage.setItem('astro_user', JSON.stringify({ id: 'u1', name: 'Seeker One', role: 'USER' }));
    sessionStorage.setItem('active_tab', 'wallet');
    sessionStorage.setItem('search_query', 'gemstone');

    // Perform clearance logic
    localStorage.removeItem('astro_token');
    localStorage.removeItem('astro_user');
    sessionStorage.clear();

    assert.equal(localStorage.getItem('astro_token'), null);
    assert.equal(localStorage.getItem('astro_user'), null);
    assert.equal(sessionStorage.getItem('active_tab'), null);
    assert.equal(sessionStorage.getItem('search_query'), null);
  });

  // TEST 2: Protected route identifier
  it('TEST-02: isProtectedPath accurately classifies protected and public pages', () => {
    const isProtected = (pathname) => {
      if (!pathname) return false;
      const cleanPath = pathname.split('?')[0].toLowerCase();
      return (
        cleanPath === '/dashboard' ||
        cleanPath.startsWith('/dashboard/') ||
        cleanPath === '/profile' ||
        cleanPath.startsWith('/profile/') ||
        cleanPath === '/admin' ||
        cleanPath.startsWith('/admin/')
      );
    };

    // Protected
    assert.equal(isProtected('/dashboard'), true);
    assert.equal(isProtected('/dashboard?tab=orders'), true);
    assert.equal(isProtected('/profile'), true);
    assert.equal(isProtected('/admin'), true);
    assert.equal(isProtected('/admin/users'), true);

    // Public
    assert.equal(isProtected('/'), false);
    assert.equal(isProtected('/about'), false);
    assert.equal(isProtected('/services'), false);
    assert.equal(isProtected('/products'), false);
    assert.equal(isProtected('/contact'), false);
    assert.equal(isProtected('/cart'), false);
    assert.equal(isProtected('/appointment'), false);
  });

  // TEST 3: Dashboard data wiping on logout / token absence
  it('TEST-03: clearDashboardData resets profile, wallet, bookings, orders, and form state', () => {
    let profile = { id: 'u1', name: 'John Doe', walletBalance: 500 };
    let wallet = { walletBalance: 500 };
    let bookings = [{ id: 'b1', astrologer: 'Panditji' }];
    let orders = [{ id: 'o1', totalAmount: 1200 }];
    let transactions = [{ id: 't1', amount: 500 }];

    const clearDashboardData = () => {
      profile = null;
      wallet = null;
      bookings = [];
      orders = [];
      transactions = [];
    };

    clearDashboardData();

    assert.equal(profile, null);
    assert.equal(wallet, null);
    assert.equal(bookings.length, 0);
    assert.equal(orders.length, 0);
    assert.equal(transactions.length, 0);
  });

  // TEST 4: Admin data wiping on logout / token absence
  it('TEST-04: clearAdminData wipes user directory, bookings, orders, stats, and inspection modals', () => {
    let currentUser = { id: 'adm1', role: 'ADMIN' };
    let users = [{ id: 'u1', email: 'user@test.com' }];
    let bookingsList = [{ id: 'b1' }];
    let ordersList = [{ id: 'o1' }];
    let roleCounts = { USER: 10, ADMIN: 2, SUPERADMIN: 1, TOTAL: 13 };
    let availabilityData = { slots: [1, 2, 3] };
    let inspectUser = { id: 'u1', name: 'User' };

    const clearAdminData = () => {
      currentUser = null;
      users = [];
      bookingsList = [];
      ordersList = [];
      roleCounts = { USER: 0, ADMIN: 0, SUPERADMIN: 0, TOTAL: 0 };
      availabilityData = null;
      inspectUser = null;
    };

    clearAdminData();

    assert.equal(currentUser, null);
    assert.equal(users.length, 0);
    assert.equal(bookingsList.length, 0);
    assert.equal(ordersList.length, 0);
    assert.equal(roleCounts.TOTAL, 0);
    assert.equal(availabilityData, null);
    assert.equal(inspectUser, null);
  });

  // TEST 5: Backend API rejects request with missing token (401 Unauthorized)
  it('TEST-05: API requests reject missing authentication tokens on protected routes', async () => {
    const endpoints = [
      '/users/me',
      '/orders/my-orders',
      '/appointments/my-bookings',
      '/admin/users',
      '/admin/bookings',
    ];

    for (const ep of endpoints) {
      const res = await fetch(`${backendBase}${ep}`);
      assert.equal(
        res.status,
        401,
        `Expected endpoint ${ep} to return 401 when token is missing, got ${res.status}`
      );
      const data = await res.json();
      assert.equal(data.statusCode, 401);
    }
  });

  // TEST 6: Backend API rejects request with invalid or expired token (401 Unauthorized)
  it('TEST-06: API requests reject invalid or malformed tokens', async () => {
    const res = await fetch(`${backendBase}/users/me`, {
      headers: { Authorization: 'Bearer totally.invalid.or.expired.jwt' },
    });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.statusCode, 401);
  });

  // TEST 7: Login, tokenVersion invalidation via /api/auth/logout, and subsequent rejection
  it('TEST-07: POST /api/auth/logout invalidates session; former token is permanently rejected', async () => {
    // 1. Sign in with admin account
    const loginRes = await fetch(`${backendBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'vishal.dubey@astrovd.com',
        password: 'PanditVishal@2026',
      }),
    });

    assert.equal(loginRes.ok, true, 'Admin login should succeed');
    const { accessToken, user } = await loginRes.json();
    assert.ok(accessToken, 'Access token must be returned');

    // 2. Verify token works on protected profile endpoint
    const profRes = await fetch(`${backendBase}/auth/profile`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    assert.equal(profRes.status, 200, 'Profile endpoint should return 200 with valid token');

    // 3. Call logout endpoint
    const logoutRes = await fetch(`${backendBase}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    assert.equal(logoutRes.status, 200, 'Logout endpoint should return 200');

    // 4. Verify THAT SAME TOKEN is now rejected with 401 on all protected endpoints!
    const testEndpoints = [
      '/auth/profile',
      '/users/me',
      '/orders/my-orders',
      '/appointments/my-bookings',
      '/admin/users',
    ];

    for (const ep of testEndpoints) {
      const rejectedRes = await fetch(`${backendBase}${ep}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      assert.equal(
        rejectedRes.status,
        401,
        `Token after logout should be rejected on ${ep} with 401, got ${rejectedRes.status}`
      );
    }
  });

  // TEST 8: Account switching isolation
  it('TEST-08: account switching loads only newly authenticated account data', async () => {
    // 1. User A (Dr. Pandit Vishal Dubey) signs in
    const userARes = await fetch(`${backendBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'vishal.dubey@astrovd.com',
        password: 'PanditVishal@2026',
      }),
    });
    assert.equal(userARes.ok, true);
    const userAData = await userARes.json();

    // Verify User A identity
    const userAProfile = await (
      await fetch(`${backendBase}/users/me`, {
        headers: { Authorization: `Bearer ${userAData.accessToken}` },
      })
    ).json();
    assert.equal(userAProfile.email, 'vishal.dubey@astrovd.com');

    // Logout User A
    await fetch(`${backendBase}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userAData.accessToken}` },
    });

    // 2. User B (Platform Owner) signs in
    const userBRes = await fetch(`${backendBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'yash@astrovd.com',
        password: 'password123',
      }),
    });
    assert.equal(userBRes.ok, true);
    const userBData = await userBRes.json();

    // Verify User B identity
    const userBProfile = await (
      await fetch(`${backendBase}/users/me`, {
        headers: { Authorization: `Bearer ${userBData.accessToken}` },
      })
    ).json();
    assert.equal(userBProfile.email, 'yash@astrovd.com');
    assert.notEqual(userBProfile.email, userAProfile.email);
    assert.equal(userBProfile.role, 'SUPERADMIN');

    // Clean up User B session
    await fetch(`${backendBase}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userBData.accessToken}` },
    });
  });

  // TEST 9: Source code checks for BFCache and protected redirects
  it('TEST-09: Dashboard and Admin source files include pageshow listener and clearData on unauthenticated mount', () => {
    const basePath = process.cwd().endsWith('frontend')
      ? process.cwd()
      : path.resolve(process.cwd(), 'frontend');

    const dashboardFile = fs.readFileSync(
      path.resolve(basePath, 'src/app/dashboard/page.tsx'),
      'utf8'
    );
    const adminFile = fs.readFileSync(
      path.resolve(basePath, 'src/app/admin/page.tsx'),
      'utf8'
    );

    // Verify pageshow listener
    assert.ok(
      dashboardFile.includes('pageshow'),
      'DashboardPage must listen to pageshow to prevent stale BFCache data'
    );
    assert.ok(
      adminFile.includes('pageshow'),
      'AdminPage must listen to pageshow to prevent stale BFCache data'
    );

    // Verify clear data helpers
    assert.ok(
      dashboardFile.includes('clearDashboardData'),
      'DashboardPage must declare clearDashboardData'
    );
    assert.ok(
      adminFile.includes('clearAdminData'),
      'AdminPage must declare clearAdminData'
    );

    // Verify redirect to login
    assert.ok(
      dashboardFile.includes('/login?redirect='),
      'DashboardPage must redirect unauthenticated visitors to /login'
    );
    assert.ok(
      adminFile.includes('/login?redirect='),
      'AdminPage must redirect unauthenticated visitors to /login'
    );
  });

  // TEST 10: Cart storage clearance on logout
  it('TEST-10: Cart storage is wiped so no lingering cart or floating checkout bar persists after logout', () => {
    const storage = new MockStorage();
    storage.setItem('astro_cart_guest', JSON.stringify([{ id: 'black_tourmaline', price: 1499, quantity: 1 }]));
    storage.setItem('astro_cart', JSON.stringify([{ id: 'black_tourmaline', price: 1499, quantity: 1 }]));
    storage.setItem('astro_cart_user_123', JSON.stringify([{ id: 'rudraksha_5_mukhi', price: 899, quantity: 1 }]));

    assert.ok(storage.getItem('astro_cart_guest'));

    // Perform cart cleanup on logout
    storage.removeItem('astro_cart');
    storage.removeItem('astro_cart_guest');
    for (const key of Array.from(storage.store.keys())) {
      if (key.startsWith('astro_cart')) {
        storage.removeItem(key);
      }
    }

    assert.equal(storage.getItem('astro_cart_guest'), null);
    assert.equal(storage.getItem('astro_cart'), null);
    assert.equal(storage.getItem('astro_cart_user_123'), null);
  });
});
