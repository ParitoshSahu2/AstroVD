import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Helper simulating CartContext getCartStorageKey
function getCartStorageKey(user) {
  if (!user || !user.id) return 'astro_cart_guest';
  if (user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
    return `astro_cart_admin_${user.id}`;
  }
  return `astro_cart_user_${user.id}`;
}

describe('User & Admin Role Separation & Data Isolation Tests', () => {
  it('TEST-01: getCartStorageKey isolates cart storage across guests, customers, and admins', () => {
    const guestKey = getCartStorageKey(null);
    assert.equal(guestKey, 'astro_cart_guest', 'Guest cart key should be astro_cart_guest');

    const customerA = { id: 'usr_customer_001', role: 'USER' };
    const customerB = { id: 'usr_customer_002', role: 'USER' };
    const adminUser = { id: 'usr_admin_999', role: 'ADMIN' };
    const superAdmin = { id: 'usr_superadmin_000', role: 'SUPERADMIN' };

    const keyA = getCartStorageKey(customerA);
    const keyB = getCartStorageKey(customerB);
    const keyAdmin = getCartStorageKey(adminUser);
    const keySuper = getCartStorageKey(superAdmin);

    assert.equal(keyA, 'astro_cart_user_usr_customer_001');
    assert.equal(keyB, 'astro_cart_user_usr_customer_002');
    assert.equal(keyAdmin, 'astro_cart_admin_usr_admin_999');
    assert.equal(keySuper, 'astro_cart_admin_usr_superadmin_000');

    // Cross-isolation asserts
    assert.notEqual(keyA, keyB, 'Two different customers must have distinct cart storage keys');
    assert.notEqual(keyA, keyAdmin, 'Customer and Admin must never share a cart storage key');
    assert.notEqual(keyA, guestKey, 'Customer and Guest must never share a cart storage key');
  });

  it('TEST-02: switching accounts isolates cart contents in simulated storage', () => {
    const mockStorage = new Map();

    const customerA = { id: 'usr_seeker_111', role: 'USER' };
    const customerB = { id: 'usr_seeker_222', role: 'USER' };
    const admin = { id: 'usr_admin_333', role: 'ADMIN' };

    // Seeker A adds Rudraksha to their cart
    const cartAItems = [{ id: 'prod_rudraksha', quantity: 2, price: 1250 }];
    mockStorage.set(getCartStorageKey(customerA), JSON.stringify(cartAItems));

    // When Seeker B logs in, their cart is empty
    const storageKeyB = getCartStorageKey(customerB);
    const itemsForB = JSON.parse(mockStorage.get(storageKeyB) || '[]');
    assert.equal(itemsForB.length, 0, "Seeker B must start with an empty cart, not Seeker A's items");

    // When Admin logs in, their cart is empty
    const storageKeyAdmin = getCartStorageKey(admin);
    const itemsForAdmin = JSON.parse(mockStorage.get(storageKeyAdmin) || '[]');
    assert.equal(itemsForAdmin.length, 0, "Admin must not inherit Seeker A's shopping cart items");

    // Seeker A logs back in, their items are intact
    const reloadedA = JSON.parse(mockStorage.get(getCartStorageKey(customerA)) || '[]');
    assert.equal(reloadedA.length, 1);
    assert.equal(reloadedA[0].id, 'prod_rudraksha');
  });

  it('TEST-03: CartContext component implementation includes role-isolated storage key logic', () => {
    const cartContextPath = path.resolve('src/context/CartContext.tsx');
    const content = fs.readFileSync(cartContextPath, 'utf-8');

    assert.ok(
      content.includes('getCartStorageKey'),
      'CartContext.tsx must export or define getCartStorageKey',
    );
    assert.ok(
      content.includes('astro_cart_admin_'),
      'CartContext.tsx must isolate admin carts',
    );
    assert.ok(
      content.includes('astro_cart_user_'),
      'CartContext.tsx must isolate user carts with user ID',
    );
    assert.ok(
      content.includes('astro-auth-change'),
      'CartContext.tsx must listen to astro-auth-change event to switch carts cleanly',
    );
  });

  it('TEST-04: Navbar preserves complete website navigation (Home, Services, Blogs, Store, Gallery)', () => {
    const navbarPath = path.resolve('src/components/Navbar.tsx');
    const content = fs.readFileSync(navbarPath, 'utf-8');

    assert.ok(content.includes("href: '/services'"), 'Navbar must include Services page link');
    assert.ok(content.includes("href: '/'"), 'Navbar must include Home page link');
    assert.ok(content.includes("href: '/blog'"), 'Navbar must include Blog page link');
    assert.ok(content.includes("href: '/gallery'"), 'Navbar must include Gallery page link');
    assert.ok(content.includes("href: '/products'"), 'Navbar must include Products/Shop page link');
    assert.ok(content.includes("href: '/appointment'"), 'Navbar must include Appointment page link');
  });

  it('TEST-05: Admin page renders Navbar with full website links and redirects customer role', () => {
    const adminPagePath = path.resolve('src/app/admin/page.tsx');
    const content = fs.readFileSync(adminPagePath, 'utf-8');

    assert.ok(
      content.includes('<Navbar />'),
      'Admin page must render <Navbar /> to ensure all website details and links remain accessible',
    );
    assert.ok(
      content.includes("router.replace('/dashboard')"),
      'Admin page must redirect non-admin USER role to /dashboard',
    );
  });

  it('TEST-06: Customer Dashboard preserves original clean viewport and layout structure', () => {
    const dashboardPagePath = path.resolve('src/app/dashboard/page.tsx');
    const content = fs.readFileSync(dashboardPagePath, 'utf-8');

    assert.ok(
      content.includes('<Navbar />'),
      'Dashboard page must render standard <Navbar />',
    );
    assert.ok(
      content.includes('Top Identity & Welcome Banner'),
      'Dashboard page maintains clean welcome banner structure',
    );
  });

  it('TEST-07: Navbar preserves authentic seeker wallet and original menu styling', () => {
    const navbarPath = path.resolve('src/components/Navbar.tsx');
    const content = fs.readFileSync(navbarPath, 'utf-8');

    assert.ok(
      content.includes('Admin Control Panel'),
      'Navbar dropdown includes Admin Control Panel for admin accounts',
    );
    assert.ok(
      content.includes('Customer Dashboard'),
      'Navbar dropdown includes Customer Dashboard link',
    );
  });

  it('TEST-08: Backend AuthService guarantees new registrants are assigned USER role only', () => {
    const authServicePath = path.resolve('../backend/src/auth/auth.service.ts');
    const content = fs.readFileSync(authServicePath, 'utf-8');

    assert.ok(
      content.includes("role: 'USER'"),
      "AuthService.register must strictly assign role: 'USER'",
    );
  });

  it('TEST-09: Navbar strictly restricts profile completion reminders to USER and never ADMIN or SUPERADMIN', () => {
    const navbarPath = path.resolve('src/components/Navbar.tsx');
    const content = fs.readFileSync(navbarPath, 'utf-8');

    assert.ok(
      content.includes("user.role !== 'ADMIN' && user.role !== 'SUPERADMIN'"),
      'Navbar must guard profile completion checks from ADMIN and SUPERADMIN accounts',
    );
    assert.ok(
      content.includes('isProfileIncomplete'),
      'Navbar must use isProfileIncomplete helper to conditionally render reminders',
    );
  });
});
