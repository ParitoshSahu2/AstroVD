'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '../../lib/auth';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { useCart, CartItem } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatTitleCase } from '../../data/products';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  Clock,
  User,
  Tag,
  Heart,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Check,
  Lock,
  Package,
  X,
  FileText,
  CreditCard,
  Building,
  CheckCircle2,
  Sparkle,
  MapPin,
  Edit3,
  QrCode,
  ShieldCheck,
  Banknote,
} from 'lucide-react';

interface RecommendedProduct {
  id: string;
  name: string;
  price: number;
  priceFormatted: string;
  image: string;
  category: string;
  tag: string;
}

const RECOMMENDED_PRODUCTS: RecommendedProduct[] = [
  {
    id: 'rec-rudraksha-mala',
    name: 'Rudraksha Mala',
    price: 1499,
    priceFormatted: '₹ 1,499',
    image: '/products/rudraksha-mala.jpg',
    category: 'products',
    tag: 'Spiritual Beads',
  },
  {
    id: 'rec-rose-quartz',
    name: 'Rose Quartz Crystal',
    price: 999,
    priceFormatted: '₹ 999',
    image: '/products/prod-rose-quartz.png',
    category: 'products',
    tag: 'Wellness Products',
  },
  {
    id: 'rec-shree-yantra',
    name: 'Shree Yantra',
    price: 2499,
    priceFormatted: '₹ 2,499',
    image: '/products/shree-yantra.jpg',
    category: 'products',
    tag: 'Sacred Geometry',
  },
  {
    id: 'rec-herbal-wellness',
    name: 'Herbal Wellness Kit',
    price: 1299,
    priceFormatted: '₹ 1,299',
    image: '/products/herbal-wellness.jpg',
    category: 'products',
    tag: 'Ayurvedic Care',
  },
  {
    id: 'rec-tiger-eye',
    name: 'Tiger Eye Bracelet',
    price: 1299,
    priceFormatted: '₹ 1,299',
    image: '/products/prod-tiger-eye-macro.jpg',
    category: 'products',
    tag: 'Solar Energy & Wealth',
  },
  {
    id: 'rec-black-tourmaline',
    name: 'Black Tourmaline Bracelet',
    price: 1199,
    priceFormatted: '₹ 1,199',
    image: '/products/prod-black-tourmaline.png',
    category: 'products',
    tag: 'Aura Protection',
  },
];

const DEFAULT_SAMPLE_ITEMS: CartItem[] = [
  {
    id: 'astrological-consultation',
    name: 'Astrological Consultation',
    price: 999,
    priceFormatted: '₹ 999',
    image: '/services/consultation.jpg',
    category: 'services',
    quantity: 1,
    tag: '60 mins • Expert Astrologers',
  },
  {
    id: 'marriage-match-making',
    name: 'Marriage Match Making',
    price: 1499,
    priceFormatted: '₹ 1,499',
    image: '/services/marriage.jpg',
    category: 'services',
    quantity: 1,
    tag: '45 mins • Expert Astrologers',
  },
  {
    id: 'rose-quartz-crystal',
    name: 'Rose Quartz Crystal',
    price: 999,
    priceFormatted: '₹ 999',
    image: '/products/prod-rose-quartz.png',
    category: 'products',
    quantity: 1,
    tag: 'Product • Wellness Products',
  },
];

export interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  label: 'Home' | 'Work' | 'Other';
  isDefault?: boolean;
}

const DEFAULT_RECOMMENDED_ADDRESSES: SavedAddress[] = [
  {
    id: 'addr-rec-1',
    fullName: 'Rahul Sharma',
    phone: '+91 98765 43210',
    address: 'B-14, Shivalik Enclave, Lanka',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    pincode: '221005',
    label: 'Home',
    isDefault: true,
  },
  {
    id: 'addr-rec-2',
    fullName: 'Rahul Sharma',
    phone: '+91 98765 43210',
    address: 'Office 302, Vedic Heritage Tower, Sigra',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    pincode: '221010',
    label: 'Work',
    isDefault: false,
  },
];

export default function CartPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { items, totalCount, subtotal, updateQuantity, removeItem, clearCart, addItem } = useCart();

  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrderNumber, setCompletedOrderNumber] = useState<string>('');

  // Floating order confirmation notification state
  const [orderNotification, setOrderNotification] = useState<{
    show: boolean;
    orderNumber: string;
    itemsCount: number;
    amount: number;
  } | null>(null);

  // Auto-dismiss floating toast after 8 seconds
  useEffect(() => {
    if (!orderNotification?.show) return;
    const timer = setTimeout(() => {
      setOrderNotification(null);
    }, 8000);
    return () => clearTimeout(timer);
  }, [orderNotification]);

  // Recommended products carousel state (show 3 at a time)
  const [recStartIndex, setRecStartIndex] = useState(0);
  const visibleRecCount = 3;

  const handlePrevRec = () => {
    setRecStartIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextRec = () => {
    setRecStartIndex((prev) => Math.min(RECOMMENDED_PRODUCTS.length - visibleRecCount, prev + 1));
  };

  // Saved addresses for address recommendation
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(DEFAULT_RECOMMENDED_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('addr-rec-1');
  const [checkoutStep, setCheckoutStep] = useState<'address' | 'payment'>('address');
  const [isChangingAddress, setIsChangingAddress] = useState(false);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  // New Address form
  const [newAddressForm, setNewAddressForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    label: 'Home' as 'Home' | 'Work' | 'Other',
  });

  // Selected payment sub-details
  const [upiId, setUpiId] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });

  // Expand/collapse states for price breakdown
  const [isItemPriceOpen, setIsItemPriceOpen] = useState(true);
  const [isDiscountOpen, setIsDiscountOpen] = useState(true);

  // Load saved addresses from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('astro_saved_addresses');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSavedAddresses(parsed);
            setSelectedAddressId(parsed[0].id);
            return;
          }
        }
        const userStored = localStorage.getItem('astro_user');
        if (userStored) {
          const userData = JSON.parse(userStored);
          if (userData?.name) {
            const userAddr: SavedAddress[] = [
              {
                id: 'addr-user-default',
                fullName: userData.name,
                phone: userData.phone || '+91 98765 43210',
                address: 'B-14, Shivalik Enclave, Lanka',
                city: 'Varanasi',
                state: 'Uttar Pradesh',
                pincode: '221005',
                label: 'Home',
                isDefault: true,
              },
            ];
            setSavedAddresses(userAddr);
            setSelectedAddressId(userAddr[0].id);
            localStorage.setItem('astro_saved_addresses', JSON.stringify(userAddr));
            return;
          }
        }
        localStorage.setItem('astro_saved_addresses', JSON.stringify(DEFAULT_RECOMMENDED_ADDRESSES));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const activeAddress = savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0] || DEFAULT_RECOMMENDED_ADDRESSES[0];

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressForm.fullName || !newAddressForm.phone || !newAddressForm.address || !newAddressForm.pincode) {
      return;
    }
    const newId = `addr-${Date.now()}`;
    const newEntry: SavedAddress = {
      id: newId,
      ...newAddressForm,
    };
    const updated = [newEntry, ...savedAddresses];
    setSavedAddresses(updated);
    setSelectedAddressId(newId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('astro_saved_addresses', JSON.stringify(updated));
    }
    setIsAddingNewAddress(false);
    setIsChangingAddress(false);
    setCheckoutStep('payment');
    setNewAddressForm({
      fullName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      label: 'Home',
    });
  };

  // Shipping form state for checkout step
  const [shippingForm, setShippingForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    sankalpName: '',
    sankalpGotra: '',
    paymentMethod: 'upi',
  });

  // Listen to logout & auth changes to immediately wipe all checkout details, modals, and shopping state
  useEffect(() => {
    const handleAuthChange = (e: any) => {
      const user =
        e?.detail?.user ||
        (typeof window !== 'undefined' && localStorage.getItem('astro_user')
          ? JSON.parse(localStorage.getItem('astro_user') || '{}')
          : null);

      if (!user || !user.id) {
        setIsCheckoutModalOpen(false);
        setCurrentStep(1);
        setCompletedOrderNumber('');
        setAppliedCoupon(null);
        setCouponInput('');
        setCouponError(null);
        setShippingForm({
          fullName: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          sankalpName: '',
          sankalpGotra: '',
          paymentMethod: 'upi',
        });
        clearCart();
        if (typeof window !== 'undefined' && (window.location.pathname === '/cart' || window.location.pathname.startsWith('/cart'))) {
          router.replace('/');
        }
      }
    };

    window.addEventListener('astro-auth-change', handleAuthChange);
    return () => window.removeEventListener('astro-auth-change', handleAuthChange);
  }, [clearCart, router]);

  // Prevent background scrolling when checkout & payment modal is open
  useEffect(() => {
    if (isCheckoutModalOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      
      return () => {
        document.body.style.overflow = originalOverflow || '';
        document.body.style.paddingRight = originalPaddingRight || '';
      };
    }
  }, [isCheckoutModalOpen]);

  // Wishlist toggle
  const toggleWishlist = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Helper to get formatted currency string
  const formatRupee = (val: number) => {
    return `₹ ${val.toLocaleString('en-IN')}`;
  };

  // Promo / Voucher state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a voucher code');
      return;
    }
    if (code === 'VEDIC10' || code === 'EMOX10' || code === 'SAVE10') {
      const discount = Math.round(subtotal * 0.1);
      setAppliedCoupon({ code, discount });
      setCouponInput('');
      setCouponError(null);
    } else {
      setCouponError('Invalid code. Try VEDIC10 for 10% OFF');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  // Calculate totals
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const orderTotal = Math.max(0, subtotal - discountAmount);

  // Helper to get realistic MRP for item (displayed in price breakdown)
  const getItemMrp = (item: CartItem): number => {
    if (item.originalPriceFormatted) {
      const num = parseInt(item.originalPriceFormatted.replace(/[^\d]/g, ''), 10);
      if (!isNaN(num) && num > item.price) return num;
    }
    if (item.price === 999) return 1499;
    if (item.price === 1499) return 2199;
    if (item.price === 1199) return 1799;
    if (item.price === 1299) return 1999;
    if (item.price === 799) return 1199;
    if (item.price === 899) return 1299;
    return Math.round((item.price * 1.4) / 100) * 100 - 1;
  };

  const totalItemPrice = items.reduce(
    (sum, item) => sum + getItemMrp(item) * item.quantity,
    0
  );
  const mrpDiscount = Math.max(0, totalItemPrice - subtotal);
  const totalDiscount = mrpDiscount + discountAmount;

  // Metadata helper for item cards
  const getItemDetails = (item: CartItem) => {
    if (item.id === 'astrological-consultation' || item.name.toLowerCase().includes('consultation')) {
      return {
        desc: 'Personalized guidance from experienced astrologers for your life, career, health, and relationships.',
        badge1: '60 mins',
        badge1Icon: 'clock',
        badge2: 'Expert Astrologers',
        badge2Icon: 'user',
      };
    }
    if (item.id === 'marriage-match-making' || item.name.toLowerCase().includes('marriage')) {
      return {
        desc: 'Ensure a harmonious married life with accurate kundali matching and compatibility analysis.',
        badge1: '45 mins',
        badge1Icon: 'clock',
        badge2: 'Expert Astrologers',
        badge2Icon: 'user',
      };
    }
    if (item.id === 'rose-quartz-crystal' || item.name.toLowerCase().includes('quartz')) {
      return {
        desc: 'Enhance love, harmony and emotional well-being.',
        badge1: 'Product',
        badge1Icon: 'tag',
        badge2: 'Wellness Products',
        badge2Icon: 'user',
      };
    }
    return {
      desc: item.tag || 'Authentic Vedic consecrated spiritual item handcrafted with sacred mantras.',
      badge1: item.category === 'services' ? 'Session' : 'Product',
      badge1Icon: item.category === 'services' ? 'clock' : 'tag',
      badge2: 'AstroVD Certified',
      badge2Icon: 'user',
    };
  };

  // Handle adding recommended product
  const handleAddRecommended = (prod: RecommendedProduct) => {
    addItem({
      id: prod.id,
      name: prod.name,
      price: prod.price,
      priceFormatted: prod.priceFormatted,
      image: prod.image,
      category: prod.category,
      quantity: 1,
      tag: prod.tag,
    });
  };

  // Reset sample items if user cleared and wants to see screenshot view again
  const handleRestoreSampleItems = () => {
    clearCart();
    DEFAULT_SAMPLE_ITEMS.forEach((item) => addItem(item, item.quantity));
  };

  // Handle checkout form submit
  const handleProceedToPayment = () => {
    if (items.length === 0) return;
    setCurrentStep(2);
    setCheckoutStep('address'); // Always show address recommendation first!
    setIsAddingNewAddress(false);
    setIsCheckoutModalOpen(true);
  };

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const generatedOrder = `AVD-${Math.floor(100000 + Math.random() * 900000)}`;
    const paymentMethodLabel =
      shippingForm.paymentMethod === 'cod'
        ? 'Cash on Delivery'
        : shippingForm.paymentMethod === 'card'
        ? 'Credit / Debit Card'
        : shippingForm.paymentMethod === 'netbanking'
        ? `Net Banking (${selectedBank})`
        : 'UPI / QR Code';

    const newOrder = {
      id: generatedOrder,
      orderNumber: generatedOrder,
      createdAt: new Date().toISOString(),
      status: 'PROCESSING',
      deliveryStatus: 'In Consecration & Dispatch',
      totalAmount: orderTotal,
      paymentMethod: paymentMethodLabel,
      paymentStatus: shippingForm.paymentMethod === 'cod' ? 'Pending upon Delivery' : 'Paid',
      shippingAddress: {
        recipient: activeAddress?.fullName || shippingForm.fullName || 'Valued Seeker',
        addressLine: activeAddress?.address || shippingForm.address || 'Sacred Varanasi Sanctum',
        city: activeAddress?.city || shippingForm.city || 'Varanasi',
        state: activeAddress?.state || shippingForm.state || 'Uttar Pradesh',
        postalCode: activeAddress?.pincode || shippingForm.pincode || '221001',
        phone: activeAddress?.phone || shippingForm.phone || '+91 98765 43210',
      },
      items: items.map((it) => ({
        id: it.id,
        quantity: it.quantity,
        price: it.price,
        product: {
          id: it.id,
          name: it.name,
          price: it.price,
          image: it.image,
        },
      })),
    };

    // Save to localStorage so orders persist and display immediately on User Dashboard
    try {
      const storedOrders = localStorage.getItem('astro_placed_orders');
      const existing = storedOrders ? JSON.parse(storedOrders) : [];
      const updated = [newOrder, ...existing.filter((o: any) => o.orderNumber !== generatedOrder)];
      localStorage.setItem('astro_placed_orders', JSON.stringify(updated));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('astro-order-placed', { detail: newOrder }));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (err) {
      console.error('Failed to save order to localStorage:', err);
    }

    // Synchronize to backend if seeker is authenticated
    const token = getAuthToken();
    if (token) {
      try {
        fetch(`${backendUrl}/api/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: items.map((it) => ({
              productId: it.id,
              quantity: it.quantity,
            })),
            shippingAddress: {
              recipient: activeAddress?.fullName || 'Seeker',
              addressLine: activeAddress?.address || 'Main Road',
              city: activeAddress?.city || 'Varanasi',
              state: activeAddress?.state || 'Uttar Pradesh',
              pincode: activeAddress?.pincode || '221001',
              phone: activeAddress?.phone || '+91 98765 43210',
            },
            paymentMethod: shippingForm.paymentMethod,
          }),
        }).catch((err) => {
          console.warn('Backend order synchronization skipped:', err);
        });
      } catch (err) {
        console.warn('Network error syncing order:', err);
      }
    }

    setTimeout(() => {
      setCompletedOrderNumber(generatedOrder);
      setIsSubmitting(false);
      setIsCheckoutModalOpen(false);
      setCurrentStep(3);
      setOrderNotification({
        show: true,
        orderNumber: generatedOrder,
        itemsCount: items.length,
        amount: orderTotal,
      });
      clearCart();
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col font-sans selection:bg-[#3E1F18] selection:text-white">
      <Navbar />

      {/* Main Content Area - Expanded to max-w-7xl / 1440px to position the Cart & Recommendation component prominently to the left */}
      <main className="flex-1 max-w-7xl xl:max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16">
        {/* Step 3: Confirmation View */}
        {currentStep === 3 ? (
          <div className="bg-white rounded-3xl border border-[#ECE5DC] p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm my-8 space-y-6">
            <div className="w-16 h-16 bg-[#FAF5EE] border border-amber-200 text-[#3E1F18] rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>

            <div>
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 mb-2">
                Consecration Initiated
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A1810]">
                Order Confirmed Successfully!
              </h2>
              <p className="text-sm sm:text-base text-[#736B63] mt-2">
                Thank you for choosing AstroVD. Your sacred booking reference is{' '}
                <span className="font-bold text-[#3E1F18]">#{completedOrderNumber}</span>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#ECE5DC] text-left text-xs sm:text-sm text-[#5C5248] space-y-2">
              <div className="flex items-center gap-2 font-semibold text-[#2A1810]">
                <Package className="w-4 h-4 text-amber-700" />
                <span>Saved to Your Seeker Dashboard</span>
              </div>
              <p className="text-xs text-[#736B63] leading-relaxed">
                Your order is safely recorded in your Seeker Dashboard under the <strong>Astro Store Orders</strong> tab. Our Vedic pandits in Varanasi have initiated the sankalp and sacred energization rites prior to dispatch.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard?tab=orders"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#3E1F18] via-[#4D241B] to-[#3E1F18] hover:from-[#2B140F] hover:to-[#2B140F] text-white font-serif font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Package className="w-4 h-4 text-amber-300" />
                <span>View Order on Dashboard</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </Link>
              <button
                onClick={() => {
                  setCurrentStep(1);
                  handleRestoreSampleItems();
                }}
                className="px-5 py-3 rounded-xl border border-[#ECE5DC] text-[#2A1810] font-medium text-xs sm:text-sm hover:bg-[#FAF7F2] transition-colors"
              >
                Reset Demo Cart
              </button>
              <Link
                href="/services"
                className="px-5 py-3 rounded-xl border border-[#ECE5DC] text-[#736B63] hover:text-[#2A1810] font-medium text-xs sm:text-sm hover:bg-[#FAF7F2] transition-colors"
              >
                Explore More Services
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left Column (8 cols): Wider, Professional Container for Cart + Recommended */}
            <div className="lg:col-span-8 flex flex-col">
              {/* Unified Single Container Card */}
              <div className="bg-white rounded-3xl border border-[#ECE5DC] shadow-[0_4px_24px_rgba(42,24,16,0.04)] overflow-hidden">
                {/* 1. Upper Section: Your Cart Items */}
                <div className="p-6 sm:p-8 sm:pb-9">
                  {/* Header: Your Cart (X Items) + Clear All */}
                  <div className="flex items-center justify-between pb-5 border-b border-[#F0EBE3]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#FAF5EE] border border-[#EBE3D7] flex items-center justify-center text-[#3E1F18]">
                        <ShoppingCart className="w-4 h-4" />
                      </div>
                      <h2 className="font-sans font-semibold text-lg sm:text-xl text-[#2A1810] tracking-tight">
                        Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
                      </h2>
                    </div>
                    {items.length > 0 && (
                      <button
                        onClick={clearCart}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#8C8075] hover:text-red-600 transition-colors cursor-pointer"
                        title="Remove all items from cart"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Clear All</span>
                      </button>
                    )}
                  </div>

                  {/* Items List */}
                  {items.length === 0 ? (
                    <div className="py-14 text-center flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-[#FAF7F2] flex items-center justify-center text-[#736B63] mb-4">
                        <ShoppingCart className="w-8 h-8 opacity-60" />
                      </div>
                      <p className="font-serif font-bold text-lg text-[#2A1810]">Your cart is currently empty</p>
                      <p className="text-xs sm:text-sm text-[#736B63] mt-1.5 max-w-sm">
                        Explore our consecrated Vedic consultations and sacred energised products.
                      </p>
                      <div className="mt-6 flex flex-wrap gap-3 justify-center">
                        <Link
                          href="/services"
                          className="px-5 py-2.5 bg-[#3E1F18] text-white text-xs sm:text-sm font-serif font-bold rounded-xl hover:bg-[#2A1810] transition-colors"
                        >
                          Explore Services
                        </Link>
                        <Link
                          href="/products"
                          className="px-5 py-2.5 border border-[#ECE5DC] text-[#2A1810] text-xs sm:text-sm font-serif font-bold rounded-xl hover:bg-[#FAF7F2] transition-colors"
                        >
                          Browse Products
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#F0EBE3]">
                      {items.map((item) => {
                        const details = getItemDetails(item);
                        return (
                          <div
                            key={item.id}
                            className="py-6 first:pt-5 last:pb-2 flex flex-col sm:flex-row gap-5 sm:gap-6 items-start sm:items-center justify-between group"
                          >
                            {/* Left: Thumbnail & Details */}
                            <div className="flex gap-4 sm:gap-5 items-start sm:items-center flex-1 min-w-0">
                              {/* Generous High-Definition Thumbnail */}
                              <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#ECE5DC] shrink-0 relative shadow-xs">
                                <img
                                  src={item.image || '/services/consultation.jpg'}
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>

                              {/* Middle Info */}
                              <div className="flex flex-col flex-1 min-w-0 pr-2">
                                <h3 className="font-sans font-semibold text-base sm:text-lg lg:text-xl text-[#2A1810] line-clamp-1 group-hover:text-[#800000] transition-colors">
                                  {formatTitleCase(item.name)}
                                </h3>
                                <p className="text-xs sm:text-sm text-[#736B63] mt-1 sm:mt-1.5 leading-relaxed line-clamp-2 max-w-xl">
                                  {details.desc}
                                </p>

                                {/* Badges / Meta tags */}
                                <div className="flex flex-wrap items-center gap-2.5 mt-3 text-xs text-[#736B63]">
                                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#73503D] bg-[#FAF5EE] border border-[#EFE5D8] px-2.5 py-1 rounded-lg">
                                    {details.badge1Icon === 'clock' ? (
                                      <Clock className="w-3.5 h-3.5 text-[#8C827A]" />
                                    ) : (
                                      <Tag className="w-3.5 h-3.5 text-[#8C827A]" />
                                    )}
                                    {details.badge1}
                                  </span>
                                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#73503D] bg-[#FAF5EE] border border-[#EFE5D8] px-2.5 py-1 rounded-lg">
                                    <User className="w-3.5 h-3.5 text-[#8C827A]" />
                                    {details.badge2}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right: Price on top & Quantity Stepper directly below, perfectly centered with balanced spacing */}
                            <div className="flex flex-col items-center justify-center gap-2 shrink-0 min-w-[105px] pt-2 sm:pt-0">
                              {/* Price - Styled like Total Item Price (font-sans font-semibold text-[#111827]) */}
                              <div className="font-sans font-semibold text-base sm:text-lg text-[#111827] tracking-tight text-center">
                                ₹ {item.price.toLocaleString('en-IN')}
                              </div>

                              {/* Stepper Pill - Perfectly Centered Directly Below Price */}
                              <div className="inline-flex items-center justify-center border border-[#ECE5DC] rounded-full bg-[#FAF7F2] px-1.5 py-1 shadow-2xs">
                                <button
                                  onClick={() =>
                                    item.quantity > 1
                                      ? updateQuantity(item.id, item.quantity - 1)
                                      : removeItem(item.id)
                                  }
                                  className="w-7 h-7 flex items-center justify-center text-[#736B63] hover:text-[#111827] hover:bg-white rounded-full transition-colors cursor-pointer"
                                  title="Decrease quantity"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="w-7 text-center text-xs sm:text-sm font-sans font-semibold text-[#111827]">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-7 h-7 flex items-center justify-center text-[#736B63] hover:text-[#2A1810] hover:bg-white rounded-full transition-colors cursor-pointer"
                                  title="Increase quantity"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Recommended Products Divider Bar */}
                <div className="border-t border-[#ECE5DC] bg-gradient-to-r from-[#FAF6EE] via-[#F5ECE0] to-[#FAF6EE] px-6 sm:px-8 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/90 border border-[#E5DAC8] flex items-center justify-center text-[#8C6239] shrink-0 shadow-2xs">
                      <Sparkles className="w-4 h-4 text-[#8C6239]" />
                    </div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-sans font-semibold text-lg sm:text-xl text-[#2A1810] tracking-tight">
                        Recommended Products
                      </span>
                      <span className="text-xs sm:text-sm text-[#786C60] font-sans hidden md:inline">
                        • Curated for your sacred journey
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/products"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#3E1F18] hover:text-[#800000] transition-colors group/link px-3 py-1.5 rounded-lg hover:bg-white/60"
                  >
                    <span>Explore All Products</span>
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform text-[#8C6239]" />
                  </Link>
                </div>

                {/* 3. Lower Section: 3 Recommended Products Cards with Carousel Arrow after 3rd Product */}
                <div className="relative p-6 sm:p-8 bg-[#FCFAF7] border-t border-[#F0EBE3]">
                  {/* Previous Arrow (before 1st product when scrolled) */}
                  {recStartIndex > 0 && (
                    <button
                      onClick={handlePrevRec}
                      className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white border border-[#E2D6C5] shadow-[0_4px_16px_rgba(42,24,16,0.12)] flex items-center justify-center text-[#3E1F18] hover:bg-[#FAF5EE] hover:scale-105 active:scale-95 transition-all cursor-pointer group"
                      title="View previous products"
                      aria-label="Previous product"
                    >
                      <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                  )}

                  {/* 3 Products Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                    {RECOMMENDED_PRODUCTS.slice(recStartIndex, recStartIndex + visibleRecCount).map((prod) => {
                      const isWishlisted = wishlist.includes(prod.id);
                      return (
                        <div
                          key={prod.id}
                          className="rounded-2xl border border-[#F0EBE3] p-4 bg-white hover:border-[#DECBB7] hover:shadow-md transition-all flex flex-col justify-between group shadow-xs animate-in fade-in duration-300"
                        >
                          {/* Image with Heart Wishlist Icon */}
                          <div className="relative w-full h-44 sm:h-48 rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#F0EBE3]">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <button
                              onClick={() => toggleWishlist(prod.id)}
                              className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-[#736B63] hover:text-red-500 shadow-2xs transition-colors cursor-pointer"
                              title="Add to Wishlist"
                            >
                              <Heart
                                className={`w-4 h-4 ${
                                  isWishlisted ? 'fill-red-500 text-red-500' : ''
                                }`}
                              />
                            </button>
                          </div>

                          {/* Category Tag */}
                          <span className="text-[11px] font-medium text-[#73503D] bg-[#FAF5EE] border border-[#EFE5D8] px-2.5 py-0.5 rounded-md inline-block w-fit mt-3">
                            {prod.tag}
                          </span>

                          {/* Title */}
                          <h4 className="font-sans font-semibold text-sm sm:text-base text-[#2A1810] mt-1.5 line-clamp-1 group-hover:text-[#800000] transition-colors">
                            {formatTitleCase(prod.name)}
                          </h4>

                          {/* Price & Add Button */}
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F0EAE1]">
                            <span className="font-sans font-semibold text-base sm:text-lg text-[#111827] tracking-tight">
                              ₹ {prod.price.toLocaleString('en-IN')}
                            </span>
                            <button
                              onClick={() => handleAddRecommended(prod)}
                              className="px-4 py-2 bg-[#3E1F18] hover:bg-[#2A1810] text-white text-xs sm:text-sm font-semibold rounded-full active:scale-95 transition-all cursor-pointer shadow-2xs"
                            >
                              Add +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Next Arrow (after 3rd product) */}
                  {recStartIndex < RECOMMENDED_PRODUCTS.length - visibleRecCount && (
                    <button
                      onClick={handleNextRec}
                      className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white border border-[#E2D6C5] shadow-[0_4px_16px_rgba(42,24,16,0.12)] flex items-center justify-center text-[#3E1F18] hover:bg-[#FAF5EE] hover:scale-105 active:scale-95 transition-all cursor-pointer group"
                      title="View next products"
                      aria-label="Next product"
                    >
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column (4 cols): Luxury Order Summary Card */}
            <div className="lg:col-span-4 transition-all">
              <div className="bg-white rounded-3xl border border-[#ECE5DC] p-6 sm:p-7 shadow-[0_4px_24px_rgba(42,24,16,0.06)] flex flex-col gap-5">
                {/* Header: Order Summary */}
                <div className="flex items-center justify-between pb-4 border-b border-[#F0EBE3]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#FAF5EE] border border-[#EBE3D7] flex items-center justify-center text-[#3E1F18]">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-sans font-semibold text-lg sm:text-xl text-[#2A1810] tracking-tight">
                        Order Summary
                      </h3>
                      <p className="text-xs text-[#786C60] font-sans mt-0.5">
                        Temple consecrated booking summary
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-[#6E4B37] bg-[#F5ECE0] border border-[#EADDCB] px-2.5 py-0.5 rounded-full font-sans">
                    {totalCount} {totalCount === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Clean Price Breakdown as shown in image */}
                <div className="flex flex-col text-[#1F2937] font-sans pt-1">
                  {/* Total item price */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setIsItemPriceOpen(!isItemPriceOpen)}
                      className="w-full flex items-center justify-between text-left cursor-pointer group py-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm sm:text-[15px] text-[#111827]">
                          Total item price
                        </span>
                        <span className="text-[10px] text-[#4B5563] group-hover:text-black transition-transform">
                          {isItemPriceOpen ? '▲' : '▼'}
                        </span>
                      </div>
                      <span className="font-semibold text-sm sm:text-[15px] text-[#111827]">
                        ₹ {totalItemPrice.toLocaleString('en-IN')}
                      </span>
                    </button>

                    {isItemPriceOpen && (
                      <div className="pl-6 sm:pl-7 pt-2.5 pb-1 space-y-2.5 text-xs sm:text-[14px] text-[#374151]">
                        {items.length > 0 ? (
                          items.map((item, idx) => {
                            const itemTotal = getItemMrp(item) * item.quantity;
                            return (
                              <div key={item.id} className="flex items-center justify-between">
                                <span className="truncate pr-3">
                                  {items.length > 1 ? `Item ${idx + 1}: ` : ''}{item.name} {item.quantity > 1 ? `(x${item.quantity})` : ''}
                                </span>
                                <span className="shrink-0 font-medium text-[#111827]">
                                  ₹{itemTotal.toLocaleString('en-IN')}
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <div className="flex items-center justify-between text-[#9CA3AF]">
                            <span>No items in cart</span>
                            <span>₹0</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Dashed Separator 1 */}
                  <div className="border-t border-dashed border-[#D1D5DB] my-3.5 sm:my-4" />

                  {/* Total discount */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setIsDiscountOpen(!isDiscountOpen)}
                      className="w-full flex items-center justify-between text-left cursor-pointer group py-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm sm:text-[15px] text-[#111827]">
                          Total discount
                        </span>
                        <span className="text-[10px] text-[#4B5563] group-hover:text-black transition-transform">
                          {isDiscountOpen ? '▲' : '▼'}
                        </span>
                      </div>
                      <span className="font-semibold text-sm sm:text-[15px] text-[#00A884]">
                        -₹{totalDiscount.toLocaleString('en-IN')}
                      </span>
                    </button>

                    {isDiscountOpen && (
                      <div className="pl-6 sm:pl-7 pt-2.5 pb-1 space-y-2.5 text-xs sm:text-[14px] text-[#00A884]">
                        <div className="flex items-center justify-between">
                          <span>Discount on MRP</span>
                          <span className="font-medium">-₹{mrpDiscount.toLocaleString('en-IN')}</span>
                        </div>
                        {appliedCoupon && appliedCoupon.discount > 0 && (
                          <div className="flex items-center justify-between">
                            <span>Vedic Voucher ({appliedCoupon.code})</span>
                            <span className="font-medium">-₹{appliedCoupon.discount.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Dashed Separator 2 */}
                  <div className="border-t border-dashed border-[#D1D5DB] my-3.5 sm:my-4" />

                  {/* Total payable */}
                  <div className="flex items-center justify-between py-1">
                    <span className="font-bold text-base sm:text-lg text-[#111827]">
                      Total payable
                    </span>
                    <span className="font-bold text-base sm:text-lg text-[#111827]">
                      ₹{orderTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>


                {/* Delivery Address Recommendation Preview Card in Cart */}
                <div className="bg-[#FAF7F2] border border-[#ECE5DC] rounded-2xl p-3.5 flex items-start justify-between gap-3 text-xs shadow-2xs">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-white border border-[#E5DAC8] flex items-center justify-center text-[#8C6239] shrink-0 mt-0.5 shadow-2xs">
                      <MapPin className="w-4 h-4 text-[#8C6239]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-[#2A1810] text-xs">Deliver to: {activeAddress.fullName}</span>
                        <span className="text-[10px] font-bold text-[#8C6239] bg-white border border-[#EFE5D8] px-1.5 py-0.5 rounded-full uppercase">
                          {activeAddress.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#736B63] truncate mt-0.5">
                        {activeAddress.address}, {activeAddress.city} - {activeAddress.pincode}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutStep('address');
                      setIsAddingNewAddress(false);
                      setIsCheckoutModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8C6239] hover:text-[#3E1F18] border border-[#E5DAC8] bg-white hover:bg-[#FAF5EE] px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer shadow-2xs"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                </div>

                {/* Big Proceed to Payment Button */}
                <button
                  onClick={handleProceedToPayment}
                  disabled={items.length === 0}
                  title={items.length === 0 ? 'Add items to your cart to proceed' : 'Proceed to Payment'}
                  className={`w-full py-4 px-6 rounded-2xl font-serif font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-[0_4px_16px_rgba(62,31,24,0.2)] transition-all duration-300 ${
                    items.length > 0
                      ? 'bg-gradient-to-r from-[#3E1F18] via-[#4D241B] to-[#3E1F18] hover:from-[#2B140F] hover:to-[#2B140F] text-white active:scale-[0.99] cursor-pointer group'
                      : 'bg-gradient-to-r from-[#3E1F18] via-[#4D241B] to-[#3E1F18] text-white cursor-not-allowed'
                  }`}
                >
                  <Lock className="w-4 h-4 text-amber-200 group-hover:scale-110 transition-transform" />
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Checkout & Payment Modal (Step 2) */}
      {isCheckoutModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain animate-in fade-in duration-200"
          onClick={() => {
            setIsCheckoutModalOpen(false);
            setCurrentStep(1);
          }}
        >
          <div
            className="bg-white rounded-2xl sm:rounded-3xl border border-[#ECE5DC] max-w-2xl w-full shadow-2xl relative my-auto max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pinned Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-[#F0EBE3] shrink-0 bg-white">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#FAF5EE] border border-[#EBE3D7] flex items-center justify-center text-[#3E1F18] shrink-0">
                  {checkoutStep === 'address' ? <MapPin className="w-4 h-4 text-[#8C6239]" /> : <Lock className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <h3 className="font-sans font-semibold text-lg sm:text-xl text-[#2A1810] tracking-tight truncate">
                    {checkoutStep === 'address' ? 'Select Delivery Address' : 'Payment & Order Details'}
                  </h3>
                  <p className="text-xs text-[#786C60] font-sans mt-0.5 truncate">
                    {checkoutStep === 'address'
                      ? 'Choose saved address or add a new delivery location.'
                      : 'Review delivery address and select payment method.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* Step progress pills */}
                <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutStep('address');
                      setIsAddingNewAddress(false);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all cursor-pointer ${
                      checkoutStep === 'address'
                        ? 'border-[#3E1F18] bg-[#3E1F18] text-white shadow-2xs'
                        : 'border-[#E5DAC8] bg-[#FAF5EE] text-[#8C6239] hover:bg-white'
                    }`}
                  >
                    {checkoutStep === 'payment' ? <Check className="w-3.5 h-3.5" /> : <span>1</span>}
                    <span>Address</span>
                  </button>
                  <span className="text-[#C5BBAE]">─</span>
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${
                      checkoutStep === 'payment'
                        ? 'border-[#3E1F18] bg-[#3E1F18] text-white shadow-2xs'
                        : 'border-[#ECE5DC] bg-[#FAF7F2] text-[#A69B8F]'
                    }`}
                  >
                    <span>2</span>
                    <span>Payment</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCheckoutModalOpen(false);
                    setCurrentStep(1);
                  }}
                  className="text-[#736B63] hover:text-[#2A1810] p-1.5 rounded-lg hover:bg-[#FAF7F2] transition-colors shrink-0 cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Either Address Selection OR Payment & Confirmed Address */}
            {checkoutStep === 'address' ? (
              <div className="flex flex-col flex-1 min-h-0 overflow-hidden text-xs sm:text-sm">
                <div className="overflow-y-auto p-5 sm:p-7 space-y-4 flex-1 overscroll-contain">
                  {!isAddingNewAddress ? (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <span className="font-semibold text-xs sm:text-sm text-[#2A1810]">
                            Recommended / Saved Addresses
                          </span>
                          <p className="text-[11px] text-[#786C60] mt-0.5">
                            Select an address to proceed directly to payment without re-filling details.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsAddingNewAddress(true)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C6239] hover:text-[#3E1F18] transition-colors cursor-pointer bg-[#FAF5EE] border border-[#E5DAC8] px-3 py-1.5 rounded-lg shrink-0 shadow-2xs"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add New Address</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {savedAddresses.map((addr) => {
                          const isSelected = addr.id === selectedAddressId;
                          return (
                            <div
                              key={addr.id}
                              onClick={() => setSelectedAddressId(addr.id)}
                              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-[#3E1F18] bg-[#FAF5EE] shadow-xs ring-1 ring-[#3E1F18]'
                                  : 'border-[#ECE5DC] bg-white hover:border-[#D8CEBF] hover:bg-[#FAF7F2]'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                      isSelected
                                        ? 'border-[#3E1F18] bg-[#3E1F18] text-white'
                                        : 'border-[#C5BBAE] bg-white'
                                    }`}
                                  >
                                    {isSelected && <Check className="w-3 h-3" />}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-semibold text-sm text-[#2A1810]">
                                        {addr.fullName}
                                      </span>
                                      <span className="text-[10px] font-bold text-[#8C6239] bg-white border border-[#EFE5D8] px-2 py-0.5 rounded-full uppercase">
                                        {addr.label}
                                      </span>
                                      {addr.isDefault && (
                                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                          Default
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-[#736B63] mt-1 leading-relaxed">
                                      {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                                    </p>
                                    <p className="text-xs text-[#8C8075] mt-1 font-medium">
                                      Phone: {addr.phone}
                                    </p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAddressId(addr.id);
                                    setCheckoutStep('payment');
                                  }}
                                  className="px-3.5 py-1.5 bg-[#3E1F18] hover:bg-[#2A1810] text-white text-xs font-semibold rounded-xl shrink-0 transition-all cursor-pointer shadow-2xs"
                                >
                                  Deliver Here
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    /* New Address Entry Form */
                    <form onSubmit={handleSaveNewAddress} className="space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-[#F0EBE3]">
                        <h4 className="font-semibold text-sm text-[#2A1810]">Add Delivery Address</h4>
                        <button
                          type="button"
                          onClick={() => setIsAddingNewAddress(false)}
                          className="text-xs font-semibold text-[#8C6239] hover:underline cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-[#2A1810] mb-1 text-xs">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Enter recipient name"
                            value={newAddressForm.fullName}
                            onChange={(e) =>
                              setNewAddressForm((prev) => ({ ...prev, fullName: e.target.value }))
                            }
                            className="w-full px-3 py-2 border border-[#ECE5DC] rounded-lg focus:outline-none focus:border-[#3E1F18] bg-[#FAF7F2] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-[#2A1810] mb-1 text-xs">
                            Mobile Phone *
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="+91 98765 43210"
                            value={newAddressForm.phone}
                            onChange={(e) =>
                              setNewAddressForm((prev) => ({ ...prev, phone: e.target.value }))
                            }
                            className="w-full px-3 py-2 border border-[#ECE5DC] rounded-lg focus:outline-none focus:border-[#3E1F18] bg-[#FAF7F2] text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-[#2A1810] mb-1 text-xs">
                          Street Address / Landmark *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="House, Flat, Street, Landmark"
                          value={newAddressForm.address}
                          onChange={(e) =>
                            setNewAddressForm((prev) => ({ ...prev, address: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-[#ECE5DC] rounded-lg focus:outline-none focus:border-[#3E1F18] bg-[#FAF7F2] text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        <div>
                          <label className="block font-semibold text-[#2A1810] mb-1 text-xs">
                            City *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="City"
                            value={newAddressForm.city}
                            onChange={(e) =>
                              setNewAddressForm((prev) => ({ ...prev, city: e.target.value }))
                            }
                            className="w-full px-3 py-2 border border-[#ECE5DC] rounded-lg focus:outline-none focus:border-[#3E1F18] bg-[#FAF7F2] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-[#2A1810] mb-1 text-xs">
                            State *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="State"
                            value={newAddressForm.state}
                            onChange={(e) =>
                              setNewAddressForm((prev) => ({ ...prev, state: e.target.value }))
                            }
                            className="w-full px-3 py-2 border border-[#ECE5DC] rounded-lg focus:outline-none focus:border-[#3E1F18] bg-[#FAF7F2] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-[#2A1810] mb-1 text-xs">
                            PIN Code *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="PIN Code"
                            value={newAddressForm.pincode}
                            onChange={(e) =>
                              setNewAddressForm((prev) => ({ ...prev, pincode: e.target.value }))
                            }
                            className="w-full px-3 py-2 border border-[#ECE5DC] rounded-lg focus:outline-none focus:border-[#3E1F18] bg-[#FAF7F2] text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-[#2A1810] mb-1.5 text-xs">
                          Address Type
                        </label>
                        <div className="flex gap-2">
                          {(['Home', 'Work', 'Other'] as const).map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => setNewAddressForm((prev) => ({ ...prev, label: tag }))}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                                newAddressForm.label === tag
                                  ? 'border-[#3E1F18] bg-[#3E1F18] text-white'
                                  : 'border-[#ECE5DC] bg-white text-[#736B63] hover:border-[#D8CEBF]'
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-[#3E1F18] hover:bg-[#2A1810] text-white font-semibold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-md"
                      >
                        Save & Deliver to this Address
                      </button>
                    </form>
                  )}
                </div>

                {/* Pinned Bottom Bar for Address Step */}
                {!isAddingNewAddress && (
                  <div className="px-5 sm:px-7 py-3.5 border-t border-[#F0EBE3] bg-[#FAF7F2]/80 shrink-0 flex items-center justify-between gap-3">
                    <div className="min-w-0 hidden sm:block">
                      <span className="text-[11px] text-[#736B63] block">Selected Address:</span>
                      <span className="font-semibold text-xs text-[#2A1810] truncate block">
                        {activeAddress.fullName} ({activeAddress.pincode})
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCheckoutStep('payment')}
                      className="w-full sm:w-auto sm:ml-auto py-3 px-6 bg-gradient-to-r from-[#3E1F18] via-[#4D241B] to-[#3E1F18] hover:from-[#2B140F] hover:to-[#2B140F] text-white font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <span>Proceed with this Address</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Payment & Confirmed Address Flow (Step 2) */
              <form
                onSubmit={handleCompleteOrder}
                className="flex flex-col flex-1 min-h-0 overflow-hidden text-xs sm:text-sm"
              >
                {/* Scrollable Content Body */}
                <div className="overflow-y-auto p-5 sm:p-7 space-y-4 flex-1 overscroll-contain">
                  {/* 1. Confirmed Delivery Address Recommendation Card */}
                  <div className="bg-[#FAF7F2] border border-[#ECE5DC] rounded-2xl p-4 flex items-start justify-between gap-3 shadow-2xs">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white border border-[#E5DAC8] flex items-center justify-center text-[#8C6239] shrink-0 mt-0.5 shadow-2xs">
                        <MapPin className="w-5 h-5 text-[#8C6239]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-xs sm:text-sm text-[#2A1810]">
                            {activeAddress.fullName}
                          </span>
                          <span className="text-[10px] font-bold text-[#8C6239] bg-[#FAF5EE] border border-[#EFE5D8] px-2 py-0.5 rounded-full uppercase">
                            {activeAddress.label}
                          </span>
                          <span className="text-xs text-[#736B63]">{activeAddress.phone}</span>
                        </div>
                        <p className="text-xs text-[#736B63] mt-1 leading-relaxed line-clamp-2">
                          {activeAddress.address}, {activeAddress.city}, {activeAddress.state} -{' '}
                          {activeAddress.pincode}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setCheckoutStep('address');
                        setIsAddingNewAddress(false);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C6239] hover:text-[#3E1F18] border border-[#E5DAC8] bg-white hover:bg-[#FAF5EE] px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer shadow-2xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Change</span>
                    </button>
                  </div>

                  {/* 2. Select Payment Method Section */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block font-semibold text-[#2A1810] text-xs sm:text-sm">
                        Select Payment Method
                      </label>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        100% Encrypted
                      </span>
                    </div>

                    {/* 4 Professional Payment Tabs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <label
                        className={`flex flex-col items-center justify-center text-center py-2 sm:py-2.5 px-2 rounded-xl border cursor-pointer transition-all ${
                          shippingForm.paymentMethod === 'upi'
                            ? 'border-[#3E1F18] bg-[#F4EFE6] text-[#2A1810] shadow-xs ring-1 ring-[#3E1F18]'
                            : 'border-[#ECE5DC] bg-white text-[#736B63] hover:border-[#D8CEBF] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="upi"
                          checked={shippingForm.paymentMethod === 'upi'}
                          onChange={() =>
                            setShippingForm((prev) => ({ ...prev, paymentMethod: 'upi' }))
                          }
                          className="sr-only"
                        />
                        <Sparkles className="w-4 h-4 mb-1 text-[#8C6239]" />
                        <span className="font-semibold text-xs text-center leading-tight">
                          UPI / QR
                        </span>
                      </label>

                      <label
                        className={`flex flex-col items-center justify-center text-center py-2 sm:py-2.5 px-2 rounded-xl border cursor-pointer transition-all ${
                          shippingForm.paymentMethod === 'card'
                            ? 'border-[#3E1F18] bg-[#F4EFE6] text-[#2A1810] shadow-xs ring-1 ring-[#3E1F18]'
                            : 'border-[#ECE5DC] bg-white text-[#736B63] hover:border-[#D8CEBF] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={shippingForm.paymentMethod === 'card'}
                          onChange={() =>
                            setShippingForm((prev) => ({ ...prev, paymentMethod: 'card' }))
                          }
                          className="sr-only"
                        />
                        <CreditCard className="w-4 h-4 mb-1 text-[#8C6239]" />
                        <span className="font-semibold text-xs text-center leading-tight">
                          Cards
                        </span>
                      </label>

                      <label
                        className={`flex flex-col items-center justify-center text-center py-2 sm:py-2.5 px-2 rounded-xl border cursor-pointer transition-all ${
                          shippingForm.paymentMethod === 'netbanking'
                            ? 'border-[#3E1F18] bg-[#F4EFE6] text-[#2A1810] shadow-xs ring-1 ring-[#3E1F18]'
                            : 'border-[#ECE5DC] bg-white text-[#736B63] hover:border-[#D8CEBF] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="netbanking"
                          checked={shippingForm.paymentMethod === 'netbanking'}
                          onChange={() =>
                            setShippingForm((prev) => ({ ...prev, paymentMethod: 'netbanking' }))
                          }
                          className="sr-only"
                        />
                        <Building className="w-4 h-4 mb-1 text-[#8C6239]" />
                        <span className="font-semibold text-xs text-center leading-tight">
                          Net Banking
                        </span>
                      </label>

                      <label
                        className={`flex flex-col items-center justify-center text-center py-2 sm:py-2.5 px-2 rounded-xl border cursor-pointer transition-all ${
                          shippingForm.paymentMethod === 'cod'
                            ? 'border-[#3E1F18] bg-[#F4EFE6] text-[#2A1810] shadow-xs ring-1 ring-[#3E1F18]'
                            : 'border-[#ECE5DC] bg-white text-[#736B63] hover:border-[#D8CEBF] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={shippingForm.paymentMethod === 'cod'}
                          onChange={() =>
                            setShippingForm((prev) => ({ ...prev, paymentMethod: 'cod' }))
                          }
                          className="sr-only"
                        />
                        <Banknote className="w-4 h-4 mb-1 text-[#8C6239]" />
                        <span className="font-semibold text-xs text-center leading-tight">
                          Pay on Delivery
                        </span>
                      </label>
                    </div>

                    {/* Dynamic Interactive Payment Options Body */}
                    <div className="mt-3.5 p-4 rounded-2xl border border-[#ECE5DC] bg-[#FAF7F2] animate-in fade-in duration-200">
                      {shippingForm.paymentMethod === 'upi' && (
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          <div className="p-3 bg-white rounded-2xl border border-[#E5DAC8] shadow-2xs flex flex-col items-center justify-center shrink-0">
                            <QrCode className="w-20 h-20 text-[#2A1810]" />
                            <span className="text-[10px] font-bold text-[#8C6239] mt-1.5 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-[#8C6239]" />
                              Scan & Pay
                            </span>
                          </div>
                          <div className="flex-1 w-full space-y-2.5">
                            <div>
                              <span className="block font-semibold text-xs text-[#2A1810]">
                                Instant UPI Payment via Any App
                              </span>
                              <p className="text-[11px] text-[#736B63] mt-0.5">
                                Scan the QR code with your camera or favorite UPI application.
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-1.5 text-[10px]">
                              {['Google Pay', 'PhonePe', 'Paytm', 'BHIM', 'Cred'].map((app) => (
                                <span
                                  key={app}
                                  className="px-2 py-0.5 bg-white border border-[#E5DAC8] rounded-md font-medium text-[#736B63] shadow-2xs"
                                >
                                  {app}
                                </span>
                              ))}
                            </div>
                            <div>
                              <label className="block text-[11px] text-[#736B63] mb-1 font-medium">
                                Or enter your Virtual Payment Address (UPI ID)
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="e.g. yourname@okhdfcbank"
                                  value={upiId}
                                  onChange={(e) => {
                                    setUpiId(e.target.value);
                                    setUpiVerified(false);
                                  }}
                                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#ECE5DC] rounded-lg focus:outline-none focus:border-[#3E1F18]"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (upiId.trim().length > 3) {
                                      setUpiVerified(true);
                                    }
                                  }}
                                  className={`px-3 py-1.5 border font-semibold text-xs rounded-lg transition-colors cursor-pointer ${
                                    upiVerified
                                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                      : 'bg-[#FAF5EE] border-[#E2D6C5] text-[#3E1F18] hover:bg-white'
                                  }`}
                                >
                                  {upiVerified ? 'Verified ✓' : 'Verify'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {shippingForm.paymentMethod === 'card' && (
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-xs font-semibold text-[#2A1810]">
                                Card Number
                              </label>
                              <div className="flex gap-1.5 text-[10px] text-[#8C6239] font-medium">
                                <span>Visa</span>
                                <span>•</span>
                                <span>Mastercard</span>
                                <span>•</span>
                                <span>RuPay</span>
                              </div>
                            </div>
                            <div className="relative">
                              <input
                                type="text"
                                maxLength={19}
                                placeholder="4532 •••• •••• 8892"
                                value={cardDetails.number}
                                onChange={(e) =>
                                  setCardDetails((prev) => ({ ...prev, number: e.target.value }))
                                }
                                className="w-full px-3 py-2 text-xs bg-white border border-[#ECE5DC] rounded-lg focus:outline-none focus:border-[#3E1F18]"
                              />
                              <CreditCard className="w-4 h-4 text-[#8C6239] absolute right-3 top-2.5" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                                Valid Thru (MM/YY)
                              </label>
                              <input
                                type="text"
                                maxLength={5}
                                placeholder="12/28"
                                value={cardDetails.expiry}
                                onChange={(e) =>
                                  setCardDetails((prev) => ({ ...prev, expiry: e.target.value }))
                                }
                                className="w-full px-3 py-2 text-xs bg-white border border-[#ECE5DC] rounded-lg focus:outline-none focus:border-[#3E1F18]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                                CVV / CVC
                              </label>
                              <input
                                type="password"
                                maxLength={4}
                                placeholder="•••"
                                value={cardDetails.cvv}
                                onChange={(e) =>
                                  setCardDetails((prev) => ({ ...prev, cvv: e.target.value }))
                                }
                                className="w-full px-3 py-2 text-xs bg-white border border-[#ECE5DC] rounded-lg focus:outline-none focus:border-[#3E1F18]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                              Cardholder Name
                            </label>
                            <input
                              type="text"
                              placeholder="Name as printed on card"
                              value={cardDetails.name}
                              onChange={(e) =>
                                setCardDetails((prev) => ({ ...prev, name: e.target.value }))
                              }
                              className="w-full px-3 py-2 text-xs bg-white border border-[#ECE5DC] rounded-lg focus:outline-none focus:border-[#3E1F18]"
                            />
                          </div>
                        </div>
                      )}

                      {shippingForm.paymentMethod === 'netbanking' && (
                        <div className="space-y-2.5">
                          <span className="block font-semibold text-xs text-[#2A1810]">
                            Popular Indian Banks
                          </span>
                          <div className="grid grid-cols-3 gap-2">
                            {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak', 'PNB'].map(
                              (bank) => (
                                <button
                                  key={bank}
                                  type="button"
                                  onClick={() => setSelectedBank(bank)}
                                  className={`py-2 px-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer text-center ${
                                    selectedBank === bank
                                      ? 'border-[#3E1F18] bg-[#FAF5EE] text-[#2A1810] shadow-2xs ring-1 ring-[#3E1F18]'
                                      : 'border-[#ECE5DC] bg-white text-[#736B63] hover:border-[#D8CEBF]'
                                  }`}
                                >
                                  {bank}
                                </button>
                              )
                            )}
                          </div>
                          <div>
                            <label className="block text-[11px] text-[#736B63] mb-1 font-medium">
                              Or select from other Indian banks
                            </label>
                            <select
                              value={selectedBank}
                              onChange={(e) => setSelectedBank(e.target.value)}
                              className="w-full px-3 py-2 text-xs bg-white border border-[#ECE5DC] rounded-lg focus:outline-none focus:border-[#3E1F18]"
                            >
                              <option value="HDFC Bank">HDFC Bank</option>
                              <option value="ICICI Bank">ICICI Bank</option>
                              <option value="State Bank of India">State Bank of India</option>
                              <option value="Axis Bank">Axis Bank</option>
                              <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                              <option value="Punjab National Bank">Punjab National Bank</option>
                              <option value="Bank of Baroda">Bank of Baroda</option>
                              <option value="IndusInd Bank">IndusInd Bank</option>
                              <option value="Canara Bank">Canara Bank</option>
                              <option value="Union Bank of India">Union Bank of India</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {shippingForm.paymentMethod === 'cod' && (
                        <div className="space-y-2 p-1">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white border border-[#E5DAC8] flex items-center justify-center text-[#8C6239] shrink-0 mt-0.5">
                              <Package className="w-4 h-4 text-[#8C6239]" />
                            </div>
                            <div>
                              <span className="block font-semibold text-xs text-[#2A1810]">
                                Cash or UPI upon Consecrated Delivery
                              </span>
                              <p className="text-xs text-[#736B63] mt-0.5 leading-relaxed">
                                Pay via Cash or scan the delivery executive&apos;s UPI QR code when your consecrated sacred items arrive at your doorstep in authentic Varanasi temple seal packaging.
                              </p>
                              <span className="inline-block mt-2 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                ✓ Zero Extra Handling Fees
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pinned Modal Footer */}
                <div className="px-5 sm:px-7 py-3.5 border-t border-[#F0EBE3] bg-[#FAF7F2]/80 shrink-0">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="font-medium text-[#736B63] text-xs">Total Payable:</span>
                    <span className="font-serif font-extrabold text-lg sm:text-xl text-[#2A1810]">
                      {formatRupee(orderTotal)}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-[#3E1F18] via-[#4D241B] to-[#3E1F18] hover:from-[#2B140F] hover:to-[#2B140F] text-white font-serif font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span>Processing Sacred Order...</span>
                    ) : (
                      <>
                        <span>
                          {shippingForm.paymentMethod === 'cod'
                            ? `Confirm Order with Pay on Delivery (${formatRupee(orderTotal)})`
                            : `Pay ${formatRupee(orderTotal)} & Confirm`}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Floating Order Confirmation Notification */}
      {orderNotification?.show && (
        <aside
          aria-label="Order Confirmation Notification"
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[100] max-w-md w-[calc(100vw-3rem)] animate-in fade-in slide-in-from-bottom-5 duration-300 shadow-2xl rounded-2xl overflow-hidden border border-amber-500/40 bg-[#2A1810] text-[#FAF7F2]"
        >
          <div className="relative p-4 sm:p-5 flex items-start gap-3.5">
            <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-700" />
            
            <div className="w-10 h-10 rounded-full bg-emerald-950/90 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>

            <div className="flex-1 pr-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/80">
                  Order Confirmed
                </span>
                <span className="text-xs font-mono text-amber-200 font-bold">
                  #{orderNotification.orderNumber}
                </span>
              </div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-white mt-1">
                Order Saved to Dashboard!
              </h4>
              <p className="text-xs text-[#D8CEBF] mt-0.5 leading-relaxed">
                Consecration rites initiated for {orderNotification.itemsCount} sacred {orderNotification.itemsCount === 1 ? 'item' : 'items'} (₹ {orderNotification.amount.toLocaleString('en-IN')}).
              </p>

              <div className="mt-3 flex items-center gap-3">
                <Link
                  href="/dashboard?tab=orders"
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#2A1810] font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                >
                  <span>Open Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => setOrderNotification(null)}
                  className="text-xs text-stone-300 hover:text-white transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOrderNotification(null)}
              className="text-stone-400 hover:text-white transition-colors p-1 -mr-1 -mt-1 cursor-pointer"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      <Footer />
    </div>
  );
}
