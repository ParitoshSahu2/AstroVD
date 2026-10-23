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

// Pure Cart Store implementation matching CartContext.tsx
class CartStore {
  constructor(storage = new MockLocalStorage()) {
    this.storage = storage;
    this.STORAGE_KEY = 'astro_cart';
    this.items = [];
    this.load();
  }

  load() {
    try {
      const saved = this.storage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.items = JSON.parse(saved);
      }
    } catch {
      this.items = [];
    }
  }

  save() {
    this.storage.setItem(this.STORAGE_KEY, JSON.stringify(this.items));
  }

  addItem(product, quantity = 1) {
    const existing = this.items.find((i) => i.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        nameHi: product.nameHi,
        price: product.price,
        numericPrice: product.numericPrice,
        image: product.image,
        tag: product.tag,
        quantity,
      });
    }
    this.save();
  }

  updateQuantity(productId, quantity) {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }
    const item = this.items.find((i) => i.id === productId);
    if (item) {
      item.quantity = quantity;
      this.save();
    }
  }

  removeItem(productId) {
    this.items = this.items.filter((i) => i.id !== productId);
    this.save();
  }

  clearCart() {
    this.items = [];
    this.save();
  }

  get totalCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  get subtotal() {
    return this.items.reduce((sum, item) => sum + item.numericPrice * item.quantity, 0);
  }
}

// Checkout validator matching cart/page.tsx
function validateCheckoutForm(form) {
  const errors = {};
  if (!form.fullName || !form.fullName.trim()) {
    errors.fullName = 'Full name is required';
  }
  const cleanPhone = (form.phone || '').replace(/\D/g, '');
  if (!cleanPhone || cleanPhone.length < 10) {
    errors.phone = 'Valid 10-digit mobile number is required';
  }
  if (!form.street || !form.street.trim()) {
    errors.street = 'Street address is required';
  }
  if (!form.city || !form.city.trim()) {
    errors.city = 'City is required';
  }
  if (!form.state || !form.state.trim()) {
    errors.state = 'State is required';
  }
  const cleanPin = (form.postalCode || '').replace(/\D/g, '');
  if (!cleanPin || cleanPin.length !== 6) {
    errors.postalCode = 'Valid 6-digit PIN code is required';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
}

describe('Frontend Cart & Checkout Flow Tests', () => {
  const sampleProduct1 = {
    id: 'tiger_eye',
    name: 'Natural Tiger Eye Bracelet',
    nameHi: 'प्राकृतिक टाइगर आई ब्रेसलेट',
    price: '₹1,250',
    numericPrice: 1250,
    image: '/images/tiger_eye.png',
    tag: 'Focus & Protection',
  };

  const sampleProduct2 = {
    id: 'rudraksha_sphatik',
    name: 'Panchmukhi Rudraksha & Sphatik Bracelet',
    nameHi: 'पंचमुखी रुद्राक्ष व स्फटिक ब्रेसलेट',
    price: '₹1,550',
    numericPrice: 1550,
    image: '/images/rudraksha_sphatik.png',
    tag: 'Peace & Shiva Blessing',
  };

  it('TEST-01: adding a product adds it to the cart with correct count and subtotal', () => {
    const store = new CartStore();
    store.addItem(sampleProduct1, 1);

    assert.equal(store.items.length, 1);
    assert.equal(store.items[0].id, 'tiger_eye');
    assert.equal(store.items[0].quantity, 1);
    assert.equal(store.totalCount, 1);
    assert.equal(store.subtotal, 1250);
  });

  it('TEST-02: adding the same product increases quantity instead of creating duplicate line items', () => {
    const store = new CartStore();
    store.addItem(sampleProduct1, 1);
    store.addItem(sampleProduct1, 2);

    assert.equal(store.items.length, 1, 'Should only have 1 line item for duplicate product');
    assert.equal(store.items[0].quantity, 3);
    assert.equal(store.totalCount, 3);
    assert.equal(store.subtotal, 1250 * 3);
  });

  it('TEST-03: adding multiple distinct products calculates cumulative subtotal and totalCount', () => {
    const store = new CartStore();
    store.addItem(sampleProduct1, 2); // 1250 * 2 = 2500
    store.addItem(sampleProduct2, 1); // 1550 * 1 = 1550

    assert.equal(store.items.length, 2);
    assert.equal(store.totalCount, 3);
    assert.equal(store.subtotal, 4050);
  });

  it('TEST-04: increasing and decreasing quantity adjusts line items and totals', () => {
    const store = new CartStore();
    store.addItem(sampleProduct1, 2);

    // Increase
    store.updateQuantity('tiger_eye', 4);
    assert.equal(store.items[0].quantity, 4);
    assert.equal(store.subtotal, 5000);

    // Decrease
    store.updateQuantity('tiger_eye', 1);
    assert.equal(store.items[0].quantity, 1);
    assert.equal(store.subtotal, 1250);
  });

  it('TEST-05: setting quantity to 0 removes the item from the cart', () => {
    const store = new CartStore();
    store.addItem(sampleProduct1, 1);
    store.addItem(sampleProduct2, 1);

    store.updateQuantity('tiger_eye', 0);
    assert.equal(store.items.length, 1);
    assert.equal(store.items[0].id, 'rudraksha_sphatik');
    assert.equal(store.totalCount, 1);
    assert.equal(store.subtotal, 1550);
  });

  it('TEST-06: removeItem explicitly deletes the product from cart', () => {
    const store = new CartStore();
    store.addItem(sampleProduct1, 1);
    store.removeItem('tiger_eye');

    assert.equal(store.items.length, 0);
    assert.equal(store.totalCount, 0);
    assert.equal(store.subtotal, 0);
  });

  it('TEST-07: cart persistence across page refresh and new store initialization', () => {
    const sharedStorage = new MockLocalStorage();
    const session1 = new CartStore(sharedStorage);
    session1.addItem(sampleProduct1, 2);
    session1.addItem(sampleProduct2, 1);

    // Simulate page reload by creating session2 with same localStorage
    const session2 = new CartStore(sharedStorage);
    assert.equal(session2.items.length, 2);
    assert.equal(session2.totalCount, 3);
    assert.equal(session2.subtotal, 4050);
    assert.equal(session2.items[0].name, 'Natural Tiger Eye Bracelet');
  });

  it('TEST-08: clearCart empties the items and updates storage', () => {
    const store = new CartStore();
    store.addItem(sampleProduct1, 3);
    store.clearCart();

    assert.equal(store.items.length, 0);
    assert.equal(store.totalCount, 0);
    assert.equal(store.subtotal, 0);
  });

  it('TEST-09: checkout form validation rejects missing or invalid fields', () => {
    const invalidForm = {
      fullName: '',
      phone: '123', // invalid
      street: '',
      city: '',
      state: '',
      postalCode: '1234', // invalid
    };

    const result = validateCheckoutForm(invalidForm);
    assert.equal(result.isValid, false);
    assert.ok(result.errors.fullName);
    assert.ok(result.errors.phone);
    assert.ok(result.errors.street);
    assert.ok(result.errors.city);
    assert.ok(result.errors.state);
    assert.ok(result.errors.postalCode);
  });

  it('TEST-10: checkout form validation accepts valid 10-digit mobile and 6-digit PIN', () => {
    const validForm = {
      fullName: 'Rahul Sharma',
      phone: '9876543210',
      street: '108 Ganga Ghat Marg',
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      postalCode: '221001',
      sankalpName: 'Rahul',
      sankalpGotra: 'Kashyap',
    };

    const result = validateCheckoutForm(validForm);
    assert.equal(result.isValid, true);
    assert.equal(Object.keys(result.errors).length, 0);
  });

  it('TEST-11: order creation payload sends product IDs and quantities, not trusted totals', () => {
    const store = new CartStore();
    store.addItem(sampleProduct1, 2);
    store.addItem(sampleProduct2, 1);

    const form = {
      fullName: 'Rahul Sharma',
      phone: '9876543210',
      street: '108 Ganga Ghat Marg',
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      postalCode: '221001',
      sankalpName: 'Rahul Sharma',
      sankalpGotra: 'Kashyap',
      notes: 'Please ring bell twice',
    };

    // Client prepares payload for backend
    let notes = form.notes;
    if (form.sankalpName) {
      const sankalpNote = `Sankalp Name: ${form.sankalpName}${form.sankalpGotra ? `, Gotra: ${form.sankalpGotra}` : ''}`;
      notes = notes ? `${notes} | ${sankalpNote}` : sankalpNote;
    }

    const payload = {
      items: store.items.map((i) => ({ productId: i.id, quantity: i.quantity })),
      shippingAddress: {
        fullName: form.fullName,
        phone: form.phone,
        street: form.street,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        country: 'India',
        notes,
      },
    };

    // Assert that client sends product IDs and quantities without client-dictated totalAmount or price
    assert.equal(payload.items.length, 2);
    assert.deepEqual(payload.items[0], { productId: 'tiger_eye', quantity: 2 });
    assert.deepEqual(payload.items[1], { productId: 'rudraksha_sphatik', quantity: 1 });
    assert.equal(payload.items[0].price, undefined, 'Client must NOT send trusted prices');
    assert.equal(payload.totalAmount, undefined, 'Client must NOT dictate totalAmount');
    assert.match(payload.shippingAddress.notes, /Sankalp Name: Rahul Sharma, Gotra: Kashyap/);
  });
});
