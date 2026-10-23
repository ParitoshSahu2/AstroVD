'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProductItem } from '../data/products';

export interface CartItem {
  id: string;
  name: string;
  nameHi?: string;
  tag?: string;
  tagHi?: string;
  price: number;
  priceFormatted: string;
  originalPriceFormatted?: string;
  image: string;
  category: string;
  quantity: number;
  stockCount?: number;
}

interface CartContextType {
  items: CartItem[];
  totalCount: number;
  subtotal: number;
  addItem: (product: ProductItem | CartItem, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function getCartStorageKey(user?: { id?: string; role?: string } | null): string {
  if (!user || !user.id) {
    return 'astro_cart_guest';
  }
  if (user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
    return `astro_cart_admin_${user.id}`;
  }
  return `astro_cart_user_${user.id}`;
}

export function parsePriceNumber(priceStr: string | number | undefined): number {
  if (typeof priceStr === 'number') return priceStr;
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeStorageKey, setActiveStorageKey] = useState<string>('astro_cart_guest');

  // Helper to load items for a specific storage key
  const loadCartFromStorage = (key: string): CartItem[] => {
    if (typeof window === 'undefined') return [];
    try {
      let stored = localStorage.getItem(key);
      // Backward-compatibility: if user key is empty, check legacy 'astro_cart'
      if (!stored && key !== 'astro_cart_guest' && !key.startsWith('astro_cart_admin')) {
        const legacy = localStorage.getItem('astro_cart');
        if (legacy) {
          stored = legacy;
          localStorage.setItem(key, legacy);
          localStorage.removeItem('astro_cart');
        }
      } else if (!stored && key === 'astro_cart_guest') {
        const legacy = localStorage.getItem('astro_cart');
        if (legacy) {
          stored = legacy;
          localStorage.setItem(key, legacy);
          localStorage.removeItem('astro_cart');
        }
      }

      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Failed to load cart from localStorage:', err);
    }
    return [];
  };

  // Helper to get current user from localStorage
  const getCurrentUser = (): { id?: string; role?: string } | null => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('astro_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  // Load cart on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUser = getCurrentUser();
      const key = getCartStorageKey(currentUser);
      setActiveStorageKey(key);
      const loaded = loadCartFromStorage(key);
      setItems(loaded);
      setIsInitialized(true);
    }
  }, []);

  // Save cart whenever items change (scoped to activeStorageKey)
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      try {
        localStorage.setItem(activeStorageKey, JSON.stringify(items));
        window.dispatchEvent(new CustomEvent('astro-cart-change', { detail: items }));
      } catch (err) {
        console.error('Failed to save cart to localStorage:', err);
      }
    }
  }, [items, isInitialized, activeStorageKey]);

  // Listen to auth changes (login, logout, account switch) to cleanly switch active cart
  useEffect(() => {
    const handleAuthChange = (e: any) => {
      if (typeof window === 'undefined') return;
      const detail = e?.detail;
      const currentUser = getCurrentUser();

      // If logging out (detail is null or user is missing), cleanly reset cart so no stale items linger
      if (!currentUser || detail === null) {
        setActiveStorageKey('astro_cart_guest');
        setItems([]);
        localStorage.removeItem('astro_cart_guest');
        localStorage.removeItem('astro_cart');
        return;
      }

      const newKey = getCartStorageKey(currentUser);
      setActiveStorageKey(newKey);
      const newItems = loadCartFromStorage(newKey);
      setItems(newItems);
    };

    window.addEventListener('astro-auth-change', handleAuthChange);
    return () => window.removeEventListener('astro-auth-change', handleAuthChange);
  }, []);

  // Listen to cross-tab storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === activeStorageKey && e.newValue) {
        try {
          setItems(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [activeStorageKey]);

  const addItem = (product: ProductItem | CartItem, quantity = 1) => {
    if (quantity <= 0) return;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((i) => i.id === product.id);
      const numericPrice = 'priceFormatted' in product
        ? product.price
        : parsePriceNumber(product.price);
      const formattedPrice = 'priceFormatted' in product
        ? product.priceFormatted
        : product.price;

      if (existingIndex > -1) {
        // Increase quantity of existing item
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      } else {
        // Add new line item
        const newItem: CartItem = {
          id: product.id,
          name: product.name,
          nameHi: product.nameHi,
          tag: 'tag' in product ? product.tag : undefined,
          tagHi: 'tagHi' in product ? product.tagHi : undefined,
          price: numericPrice,
          priceFormatted: formattedPrice,
          originalPriceFormatted: 'originalPrice' in product ? product.originalPrice : undefined,
          image: product.image,
          category: product.category,
          quantity,
          stockCount: 50,
        };
        return [...prevItems, newItem];
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const removeItem = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalCount,
        subtotal,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
