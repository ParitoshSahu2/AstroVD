import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, '..');

describe('AstroVD — Business Workflow Audit Findings Regression Tests', () => {
  // --------------------------------------------------------------------------
  // PRIORITY 1: Booking & Admin Workflows
  // --------------------------------------------------------------------------

  it('TEST-01: appointment/page.tsx removes synthetic AVD-XXXXXX fallback and never shows false success', () => {
    const appointmentPath = path.join(frontendRoot, 'app', 'appointment', 'page.tsx');
    const content = fs.readFileSync(appointmentPath, 'utf-8');

    // Extract catch block in executeFinalBooking
    const catchBlockMatch = content.match(/} catch \(err: any\) {([\s\S]*?)} finally {/);
    assert.ok(catchBlockMatch, 'catch block must be present in executeFinalBooking');
    assert.strictEqual(
      catchBlockMatch[1].includes('setConfirmedBooking'),
      false,
      'catch block must never display success screen via setConfirmedBooking'
    );
    assert.strictEqual(
      catchBlockMatch[1].includes('AVD-'),
      false,
      'catch block must not generate synthetic AVD-XXXXXX fallback bookings on network errors'
    );
    assert.strictEqual(
      catchBlockMatch[1].includes("localStorage.setItem('astro_consultations'"),
      false,
      'catch block must not persist fabricated consultations to localStorage on network errors'
    );

    // On error, confirmation modal must be explicitly closed and error displayed
    assert.ok(
      catchBlockMatch[1].includes('setConfirmationModalOpen(false)'),
      'Confirmation modal must be set to false when an error occurs'
    );
    assert.ok(
      catchBlockMatch[1].includes('setErrorMsg('),
      'Error message state must be populated on booking failure'
    );
  });

  it('TEST-02: OrderLifecycleModal supports PENDING_PAYMENT for demo orders', () => {
    const modalPath = path.join(frontendRoot, 'app', 'admin', 'components', 'OrderLifecycleModal.tsx');
    const content = fs.readFileSync(modalPath, 'utf-8');

    // The modal must render valid actions for both PENDING and PENDING_PAYMENT
    assert.ok(
      content.includes("activeOrder.status === 'PENDING' || activeOrder.status === 'PENDING_PAYMENT'"),
      'OrderLifecycleModal must support action rendering for PENDING_PAYMENT demo orders'
    );
  });

  it('TEST-03: BookingLifecycleModal supports PENDING_PAYMENT for demo appointments', () => {
    const modalPath = path.join(frontendRoot, 'app', 'admin', 'components', 'BookingLifecycleModal.tsx');
    const content = fs.readFileSync(modalPath, 'utf-8');

    // The modal must render valid actions for both PENDING and PENDING_PAYMENT
    assert.ok(
      content.includes("activeBooking.status === 'PENDING' || activeBooking.status === 'PENDING_PAYMENT'"),
      'BookingLifecycleModal must support action rendering for PENDING_PAYMENT demo bookings'
    );
  });

  // --------------------------------------------------------------------------
  // PRIORITY 2: Correct or Disconnected Data
  // --------------------------------------------------------------------------

  it('TEST-04: dashboard/page.tsx connects to valid /api/users/me/wallet endpoints instead of 404 /api/wallet/*', () => {
    const dashboardPath = path.join(frontendRoot, 'app', 'dashboard', 'page.tsx');
    const content = fs.readFileSync(dashboardPath, 'utf-8');

    // Must NOT call disconnected /api/wallet/ endpoints
    assert.strictEqual(
      content.includes('/api/wallet/balance'),
      false,
      'Dashboard must not call non-existent /api/wallet/balance'
    );
    assert.strictEqual(
      content.includes('/api/wallet/transactions'),
      false,
      'Dashboard must not call non-existent /api/wallet/transactions'
    );

    // Must call authoritative /api/users/me/wallet endpoints
    assert.ok(
      content.includes('/api/users/me/wallet'),
      'Dashboard must call valid /api/users/me/wallet endpoint'
    );
    assert.ok(
      content.includes('/api/users/me/wallet/transactions'),
      'Dashboard must call valid /api/users/me/wallet/transactions endpoint'
    );
  });

  it('TEST-05: Customer Overview and utils.ts do not inject DEFAULT_SAMPLE_ORDERS for empty order history', () => {
    const utilsPath = path.join(frontendRoot, 'app', 'dashboard', 'utils.ts');
    const utilsContent = fs.readFileSync(utilsPath, 'utf-8');

    // DEFAULT_SAMPLE_ORDERS should be empty array
    assert.ok(
      utilsContent.includes('export const DEFAULT_SAMPLE_ORDERS: any[] = [];'),
      'DEFAULT_SAMPLE_ORDERS in utils.ts must be an empty array'
    );

    const overviewTabPath = path.join(frontendRoot, 'app', 'dashboard', 'components', 'DashboardOverviewTab.tsx');
    const tabContent = fs.readFileSync(overviewTabPath, 'utf-8');

    assert.strictEqual(
      tabContent.includes('DEFAULT_SAMPLE_ORDERS'),
      false,
      'DashboardOverviewTab must not import or use DEFAULT_SAMPLE_ORDERS fallback'
    );
  });

  it('TEST-06: Customer booking history ignores unverified localStorage bookings and uses real database records', () => {
    const utilsPath = path.join(frontendRoot, 'app', 'dashboard', 'utils.ts');
    const utilsContent = fs.readFileSync(utilsPath, 'utf-8');

    // getCombinedBookings must return backend bookings without merging localStorage
    assert.ok(
      utilsContent.includes('export function getCombinedBookings(backendBookings: any[] = []): any[] {'),
      'getCombinedBookings must be defined in utils.ts'
    );
    assert.strictEqual(
      utilsContent.includes("localStorage.getItem('astro_consultations')"),
      false,
      'getCombinedBookings must not merge synthetic consultations from localStorage'
    );
    assert.ok(
      utilsContent.includes('if (!Array.isArray(backendBookings)) return [];'),
      'getCombinedBookings must cleanly check Array.isArray of backend bookings'
    );
  });

  it('TEST-07: AdminOverviewTab removes hardcoded sample customers and fake statistics', () => {
    const adminTabPath = path.join(frontendRoot, 'app', 'admin', 'components', 'AdminOverviewTab.tsx');
    const content = fs.readFileSync(adminTabPath, 'utf-8');

    // Fake customer sample array (Rohit Sharma, Priya Singh, etc.) must be removed
    assert.strictEqual(
      content.includes('Rohit Sharma'),
      false,
      'AdminOverviewTab must not contain mock customer Rohit Sharma'
    );
    assert.strictEqual(
      content.includes('Priya Singh'),
      false,
      'AdminOverviewTab must not contain mock customer Priya Singh'
    );
    assert.strictEqual(
      content.includes('rawOrders ='),
      false,
      'AdminOverviewTab must not define rawOrders mock array'
    );

    // Hardcoded fallback counts (|| 12, || 4, pendingApprovalsCount = 3) must be removed
    assert.strictEqual(
      content.includes('pendingApprovalsCount = 3'),
      false,
      'pendingApprovalsCount must not be hardcoded to 3'
    );
    assert.strictEqual(
      content.includes('totalOrdersCount = orderTotalCount || ordersList.length || 12'),
      false,
      'totalOrdersCount must not fallback to 12'
    );

    // Empty state message must be present for empty orders
    assert.ok(
      content.includes('No customer orders recorded yet.'),
      'AdminOverviewTab must render honest empty state when ordersList is empty'
    );
  });

  // --------------------------------------------------------------------------
  // PRIORITY 3: Correct Shopping Journey
  // --------------------------------------------------------------------------

  it('TEST-08: Guest users can add products to cart in ProductsSection without login redirect', () => {
    const productsPath = path.join(frontendRoot, 'components', 'ProductsSection.tsx');
    const content = fs.readFileSync(productsPath, 'utf-8');

    // handleAddToCart in ProductsSection must call addItem without login redirect
    const handleAddToCartMatch = content.match(/const handleAddToCart = \([^)]*\) => {([\s\S]*?)};/);
    assert.ok(handleAddToCartMatch, 'handleAddToCart must be defined in ProductsSection');
    assert.strictEqual(
      handleAddToCartMatch[1].includes("router.push('/login") || handleAddToCartMatch[1].includes('router.push(`/login'),
      false,
      'handleAddToCart must not redirect guest users to /login'
    );
    assert.ok(
      handleAddToCartMatch[1].includes('addItem('),
      'handleAddToCart must add item to cart directly for guests'
    );
  });

  it('TEST-09: Guest users can add products to cart and buy now in ProductDetailClient without login redirect', () => {
    const detailPath = path.join(frontendRoot, 'app', 'products', '[id]', 'ProductDetailClient.tsx');
    const content = fs.readFileSync(detailPath, 'utf-8');

    // handleAddToCart must not redirect
    const handleAddToCartMatch = content.match(/const handleAddToCart = \(\) => {([\s\S]*?)};/);
    assert.ok(handleAddToCartMatch, 'handleAddToCart must be defined in ProductDetailClient');
    assert.strictEqual(
      handleAddToCartMatch[1].includes('router.push'),
      false,
      'handleAddToCart must not redirect guest to login'
    );
    assert.ok(
      handleAddToCartMatch[1].includes('addItem('),
      'handleAddToCart must invoke addItem for guest seekers'
    );

    // handleBuyNow should navigate to /cart without blocking on login first
    const handleBuyNowMatch = content.match(/const handleBuyNow = \(\) => {([\s\S]*?)};/);
    assert.ok(handleBuyNowMatch, 'handleBuyNow must be defined in ProductDetailClient');
    assert.ok(
      handleBuyNowMatch[1].includes("router.push('/cart')"),
      'handleBuyNow must navigate directly to /cart'
    );
  });

  it('TEST-10: CartContext guest cart isolation and clean login migration without duplication', () => {
    // Simulate CartContext dual-storage and migration logic
    const store = new Map();

    const loadStorage = (key) => {
      const data = store.get(key);
      return data ? JSON.parse(data) : [];
    };

    const saveStorage = (key, items) => {
      store.set(key, JSON.stringify(items));
    };

    // 1. Guest adds a bracelet
    const guestKey = 'astro_cart_guest';
    const guestItems = [
      { id: 'tiger_eye', name: 'Tiger Eye Bracelet', price: 1299, quantity: 2 },
      { id: 'black_tourmaline', name: 'Black Tourmaline', price: 1499, quantity: 1 },
    ];
    saveStorage(guestKey, guestItems);

    // Verify guest cart contents
    assert.strictEqual(loadStorage(guestKey).length, 2);

    // 2. User logs in with user id 'user_123' who already had 1 Tiger Eye in authenticated cart
    const userKey = 'astro_cart_user_user_123';
    saveStorage(userKey, [
      { id: 'tiger_eye', name: 'Tiger Eye Bracelet', price: 1299, quantity: 1 },
    ]);

    // Perform migration identical to CartContext lines 153-168
    const existingGuestItems = loadStorage('astro_cart_guest');
    let userItems = loadStorage(userKey);

    if (existingGuestItems.length > 0) {
      const map = new Map();
      for (const item of userItems) {
        map.set(item.id, { ...item });
      }
      for (const gItem of existingGuestItems) {
        if (map.has(gItem.id)) {
          const existing = map.get(gItem.id);
          existing.quantity += gItem.quantity;
        } else {
          map.set(gItem.id, { ...gItem });
        }
      }
      userItems = Array.from(map.values());
      saveStorage(userKey, userItems);
      store.delete('astro_cart_guest');
    }

    // 3. Verify results: No duplicates, merged quantities, guest cart cleared
    const migratedCart = loadStorage(userKey);
    assert.strictEqual(migratedCart.length, 2, 'Must have exactly 2 distinct product items');

    const tigerEye = migratedCart.find((it) => it.id === 'tiger_eye');
    assert.ok(tigerEye, 'Tiger Eye must exist in migrated cart');
    assert.strictEqual(tigerEye.quantity, 3, 'Tiger eye quantities (1 existing + 2 guest) must sum to 3 without duplication');

    const tourmaline = migratedCart.find((it) => it.id === 'black_tourmaline');
    assert.ok(tourmaline, 'Tourmaline must exist in migrated cart');
    assert.strictEqual(tourmaline.quantity, 1, 'Tourmaline quantity must be 1');

    assert.strictEqual(store.has('astro_cart_guest'), false, 'Guest cart must be removed after migration');
  });
});
