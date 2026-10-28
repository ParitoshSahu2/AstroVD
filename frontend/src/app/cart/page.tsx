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
  Percent,
  ChevronDown,
  ChevronUp,
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
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'qr'>('gpay');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });
  const [isCouponOpen, setIsCouponOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);

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
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      
      return () => {
        document.documentElement.style.overflow = originalHtmlOverflow || '';
        document.body.style.overflow = originalBodyOverflow || '';
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
    setCheckoutStep('payment');
    setIsChangingAddress(false);
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
                  {/* Header: Cart (X items) + Clear All */}
                  <div className="flex items-center justify-between pb-4 sm:pb-5 border-b border-[#F0EBE3]">
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#ECE5DC] text-xs font-semibold text-[#8C8075] hover:text-rose-700 hover:border-rose-200 hover:bg-rose-50/60 transition-all cursor-pointer"
                        title="Remove all items from cart"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
                    <div className="space-y-3.5 pt-4">
                      {items.map((item) => {
                        const details = getItemDetails(item);
                        const isDuplicateTag =
                          item.tag &&
                          item.tag.toLowerCase().trim() === item.name.toLowerCase().trim();
                        const displayTag =
                          !isDuplicateTag && item.tag
                            ? item.tag
                            : item.category === 'services'
                            ? 'Vedic Consultation'
                            : 'Sacred Consecrated Item';

                        return (
                          <div
                            key={item.id}
                            className="p-4 sm:p-5 rounded-2xl bg-white border border-[#ECE5DC] hover:border-amber-300/80 transition-all duration-200 flex flex-col sm:flex-row gap-4 sm:gap-5 items-start sm:items-center justify-between group shadow-2xs"
                          >
                            {/* Left: Thumbnail & Details */}
                            <div className="flex gap-3.5 sm:gap-4 items-center flex-1 min-w-0 w-full sm:w-auto">
                              {/* Compact Thumbnail */}
                              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-white border border-[#ECE5DC] shrink-0 relative shadow-2xs">
                                <img
                                  src={item.image || '/services/consultation.jpg'}
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>

                              {/* Middle Info */}
                              <div className="flex-1 min-w-0 space-y-1">
                                <h3 className="font-sans font-semibold text-lg sm:text-xl text-[#2A1810] tracking-tight truncate group-hover:text-[#800000] transition-colors">
                                  {formatTitleCase(item.name)}
                                </h3>

                                {/* Clean Tag / Benefaction - Never Duplicate Name */}
                                <p className="text-xs text-[#736B63] truncate">
                                  ✦ {displayTag}
                                </p>

                              </div>
                            </div>

                            {/* Right: Quantity Stepper, Price & Remove Button */}
                            <div className="flex items-center justify-between sm:justify-end gap-3.5 sm:gap-5 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#ECE5DC]/70 shrink-0">
                              {/* Stepper Pill */}
                              <div className="inline-flex items-center border border-[#ECE5DC] rounded-full bg-white px-1.5 py-0.5 shadow-2xs">
                                <button
                                  onClick={() =>
                                    item.quantity > 1
                                      ? updateQuantity(item.id, item.quantity - 1)
                                      : removeItem(item.id)
                                  }
                                  className="w-7 h-7 flex items-center justify-center text-[#736B63] hover:text-[#111827] hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
                                  title="Decrease quantity"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="w-6 text-center text-xs sm:text-sm font-sans font-semibold text-[#111827]">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-7 h-7 flex items-center justify-center text-[#736B63] hover:text-[#2A1810] hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
                                  title="Increase quantity"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Price */}
                              <div className="text-right min-w-[85px]">
                                <div className="font-sans font-semibold text-base sm:text-lg text-[#111827] tracking-tight">
                                  ₹ {(item.price * item.quantity).toLocaleString('en-IN')}
                                </div>
                              </div>

                              {/* Individual Remove Button */}
                              <button
                                onClick={() => removeItem(item.id)}
                                className="w-8 h-8 rounded-full border border-transparent hover:border-[#ECE5DC] hover:bg-white text-stone-400 hover:text-rose-600 flex items-center justify-center transition-all cursor-pointer"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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

                {/* Big Proceed To Checkout Button matching exact reference design */}
                <button
                  onClick={handleProceedToPayment}
                  disabled={items.length === 0}
                  title={items.length === 0 ? 'Add items to your cart to proceed' : 'Proceed To Checkout'}
                  className={`w-full py-4 px-8 rounded-full font-sans font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl transition-all duration-300 ${
                    items.length > 0
                      ? 'bg-black hover:bg-stone-900 text-white active:scale-[0.99] cursor-pointer group hover:shadow-2xl'
                      : 'bg-black/60 text-white/60 cursor-not-allowed'
                  }`}
                >
                  <span>Proceed To Checkout</span>
                  <ChevronRight className="w-4 h-4 text-white stroke-[2.5] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Checkout & Payment Modal (Step 2) */}
      {isCheckoutModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-hidden overscroll-none animate-in fade-in duration-200"
          onClick={() => {
            setIsCheckoutModalOpen(false);
            setCurrentStep(1);
          }}
          onWheel={(e) => e.stopPropagation()}
        >
          <div
            className={`bg-white rounded-2xl sm:rounded-3xl border border-gray-200 w-full shadow-2xl relative my-auto max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden min-h-0 overscroll-contain transition-all duration-300 ${
              checkoutStep === 'address'
                ? 'max-w-xl sm:max-w-2xl'
                : 'max-w-5xl xl:max-w-6xl'
            }`}
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-[#F0EBE3] shrink-0 bg-white">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#FAF5EE] border border-[#E5DAC8] flex items-center justify-center text-[#800000] shrink-0 shadow-2xs">
                  {checkoutStep === 'address' ? <MapPin className="w-4 h-4 text-[#800000]" /> : <ShieldCheck className="w-4 h-4 text-[#800000]" />}
                </div>
                <div className="min-w-0">
                  <h3 className="font-sans font-semibold text-base sm:text-lg text-[#2A1810] tracking-tight truncate">
                    {checkoutStep === 'address' ? 'Select Delivery Address' : 'Payment & Checkout'}
                  </h3>
                  <p className="text-xs text-[#736B63] font-sans mt-0.5 truncate">
                    {checkoutStep === 'address'
                      ? 'Choose saved address or add a new delivery location.'
                      : 'All transactions are secure and encrypted'}
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
                        ? 'border-[#800000] bg-[#800000] text-amber-100 shadow-2xs'
                        : 'border-[#E5DAC8] bg-[#FAF5EE] text-[#8C6239] hover:bg-white'
                    }`}
                  >
                    {checkoutStep === 'payment' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span>1</span>}
                    <span>Address</span>
                  </button>
                  <span className="text-[#C5BBAE]">─</span>
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${
                      checkoutStep === 'payment'
                        ? 'border-[#800000] bg-[#800000] text-amber-100 shadow-2xs'
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
                <div 
                  className="overflow-y-auto p-5 sm:p-7 space-y-4 flex-1 min-h-0 overscroll-contain"
                  onWheel={(e) => e.stopPropagation()}
                >
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
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#800000] hover:text-[#5C0612] transition-colors cursor-pointer bg-[#FAF5EE] hover:bg-[#F2E8DC] border border-[#E5DAC8] px-3.5 py-1.5 rounded-xl shrink-0 shadow-2xs"
                        >
                          <Plus className="w-4 h-4 text-[#800000]" />
                          <span>Add New Address</span>
                        </button>
                      </div>

                      <div className="space-y-3 pt-1">
                        {savedAddresses.map((addr) => {
                          const isSelected = addr.id === selectedAddressId;
                          return (
                            <div
                              key={addr.id}
                              onClick={() => setSelectedAddressId(addr.id)}
                              className={`p-4 sm:p-4.5 rounded-2xl border transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-[#800000] bg-[#FAF5EE] shadow-sm ring-1 ring-[#800000]'
                                  : 'border-[#ECE5DC] bg-white hover:border-[#D8CEBF] hover:bg-[#FAF7F2]'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                      isSelected
                                        ? 'border-[#800000] bg-[#800000] text-amber-200'
                                        : 'border-[#C5BBAE] bg-white'
                                    }`}
                                  >
                                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-semibold text-sm sm:text-base text-[#2A1810]">
                                        {addr.fullName}
                                      </span>
                                      <span className="text-[10px] font-bold text-[#800000] bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                        {addr.label}
                                      </span>
                                      {addr.isDefault && (
                                        <span className="text-[10px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                          Default
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-[#5C5248] mt-1.5 leading-relaxed">
                                      {addr.address}, {addr.city}, {addr.state} -{' '}
                                      <span className="font-semibold text-[#2A1810]">{addr.pincode}</span>
                                    </p>
                                    <p className="text-xs text-[#736B63] mt-1 font-medium">
                                      Mobile: <span className="text-[#2A1810]">{addr.phone}</span>
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
                                  className={`px-4 py-2 text-xs font-semibold rounded-xl shrink-0 transition-all cursor-pointer shadow-2xs ${
                                    isSelected
                                      ? 'bg-gradient-to-r from-[#800000] via-[#5C0612] to-[#3E1F18] hover:from-[#660000] hover:to-[#2B140F] text-amber-100 hover:text-white shadow-sm'
                                      : 'bg-[#FAF5EE] hover:bg-[#800000] text-[#800000] hover:text-white border border-[#E5DAC8]'
                                  }`}
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
                          className="text-xs font-semibold text-[#800000] hover:text-[#5C0612] hover:underline cursor-pointer"
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
                            className="w-full px-3.5 py-2.5 border border-[#E5DAC8] rounded-xl focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]/25 bg-[#FAF7F2] text-xs text-[#2A1810] transition-colors placeholder:text-[#A09383]"
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
                            className="w-full px-3.5 py-2.5 border border-[#E5DAC8] rounded-xl focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]/25 bg-[#FAF7F2] text-xs text-[#2A1810] transition-colors placeholder:text-[#A09383]"
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
                          className="w-full px-3.5 py-2.5 border border-[#E5DAC8] rounded-xl focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]/25 bg-[#FAF7F2] text-xs text-[#2A1810] transition-colors placeholder:text-[#A09383]"
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
                            className="w-full px-3.5 py-2.5 border border-[#E5DAC8] rounded-xl focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]/25 bg-[#FAF7F2] text-xs text-[#2A1810] transition-colors placeholder:text-[#A09383]"
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
                            className="w-full px-3.5 py-2.5 border border-[#E5DAC8] rounded-xl focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]/25 bg-[#FAF7F2] text-xs text-[#2A1810] transition-colors placeholder:text-[#A09383]"
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
                            className="w-full px-3.5 py-2.5 border border-[#E5DAC8] rounded-xl focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]/25 bg-[#FAF7F2] text-xs text-[#2A1810] transition-colors placeholder:text-[#A09383]"
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
                              className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                newAddressForm.label === tag
                                  ? 'border-[#800000] bg-gradient-to-r from-[#800000] via-[#5C0612] to-[#3E1F18] text-amber-100 shadow-sm'
                                  : 'border-[#E5DAC8] bg-[#FAF5EE] text-[#5C5248] hover:border-[#800000]/50 hover:bg-[#F2E8DC]'
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-gradient-to-r from-[#800000] via-[#5C0612] to-[#3E1F18] hover:from-[#660000] hover:to-[#2B140F] text-amber-100 hover:text-white font-semibold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                      >
                        <span>Save & Deliver to this Address</span>
                        <ArrowRight className="w-4 h-4 text-amber-300" />
                      </button>
                    </form>
                  )}
                </div>

                {/* Pinned Bottom Bar for Address Step */}
                {!isAddingNewAddress && (
                  <div className="px-5 sm:px-7 py-3.5 border-t border-[#E5DAC8] bg-[#FAF5EE] shrink-0 flex items-center justify-between gap-3">
                    <div className="min-w-0 hidden sm:block">
                      <span className="text-[11px] text-[#786C60] block">Selected Address:</span>
                      <span className="font-semibold text-xs text-[#2A1810] truncate block">
                        {activeAddress.fullName} ({activeAddress.pincode})
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCheckoutStep('payment')}
                      className="w-full sm:w-auto sm:ml-auto py-3 px-6 bg-gradient-to-r from-[#800000] via-[#5C0612] to-[#3E1F18] hover:from-[#660000] hover:to-[#2B140F] text-amber-100 hover:text-white font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <span>Proceed with this Address</span>
                      <ArrowRight className="w-4 h-4 text-amber-300" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* 2-COLUMN VIEW MATCHING USER REFERENCE IMAGE */
              <div 
                className="overflow-y-auto p-4 sm:p-6 lg:p-7 overscroll-contain flex-1 min-h-0"
                onWheel={(e) => e.stopPropagation()}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                  {/* Left Column (7 cols): Select Payment Option */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* Header */}
                    <div>
                      <h2 className="font-sans font-semibold text-lg sm:text-xl text-[#2A1810] tracking-tight">
                        Select Payment Option
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                        All transactions are secure and encrypted
                      </p>
                    </div>

                    {/* Compact Delivery Address bar */}
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF5EE] border border-[#E5DAC8] text-xs shadow-2xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#800000] to-[#5C0612] flex items-center justify-center text-amber-200 shadow-2xs shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-[#2A1810] truncate">{activeAddress.fullName}</span>
                            <span className="text-[10px] font-bold text-[#800000] bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider">{activeAddress.label}</span>
                            <span className="text-[#736B63] text-[11px]">{activeAddress.phone}</span>
                          </div>
                          <p className="text-[#5C5248] text-[11px] truncate mt-0.5">
                            {activeAddress.address}, {activeAddress.city} - <span className="font-semibold text-[#2A1810]">{activeAddress.pincode}</span>
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCheckoutStep('address')}
                        className="text-xs font-semibold text-[#800000] hover:text-[#5C0612] px-3 py-1.5 rounded-xl bg-white hover:bg-[#F2E8DC] border border-[#E5DAC8] hover:border-[#800000]/40 transition-all shrink-0 cursor-pointer shadow-2xs"
                      >
                        Change
                      </button>
                    </div>

                    {/* Payment Form with 4 Options */}
                    <form onSubmit={handleCompleteOrder} className="space-y-3">
                      {/* 1. UPI (replaces PayPal from image) */}
                      <div
                        onClick={() => setShippingForm((prev) => ({ ...prev, paymentMethod: 'upi' }))}
                        className={`rounded-2xl border transition-all cursor-pointer p-4 sm:p-4.5 ${
                          shippingForm.paymentMethod === 'upi'
                            ? 'border-[#800000] ring-1 ring-[#800000] bg-[#FAF5EE]/30 shadow-xs'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                              shippingForm.paymentMethod === 'upi'
                                ? 'border-[#800000]'
                                : 'border-gray-300'
                            }`}>
                              {shippingForm.paymentMethod === 'upi' && (
                                <div className="w-2.5 h-2.5 rounded-full bg-[#800000]" />
                              )}
                            </div>
                            <span className="font-semibold text-sm sm:text-base text-gray-900">
                              UPI
                            </span>
                          </div>
                          {/* Badges for Indian UPI Apps */}
                          <div className="flex items-center gap-1.5">
                            {/* GPay 4-color G icon */}
                            <div className="w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center p-0.5 shadow-2xs" title="Google Pay">
                              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                              </svg>
                            </div>
                            {/* PhonePe official purple icon */}
                            <div className="w-5 h-5 rounded-full bg-[#5f259f] flex items-center justify-center text-white font-bold text-[10px] shadow-2xs font-sans" title="PhonePe">
                              पे
                            </div>
                            {/* Paytm logo */}
                            <div className="px-1 py-0.5 rounded bg-white border border-[#00BAF2]/40 flex items-center shadow-2xs" title="Paytm">
                              <span className="font-extrabold text-[9px] text-[#002970] leading-none">pay</span>
                              <span className="font-extrabold text-[9px] text-[#00BAF2] leading-none">tm</span>
                            </div>
                            {/* BHIM logo */}
                            <div className="px-1 py-0.5 rounded bg-white border border-gray-200 flex items-center gap-0.5 shadow-2xs" title="BHIM">
                              <span className="font-black text-[9px] text-gray-900 leading-none">BHIM</span>
                            </div>
                          </div>
                        </div>

                        {shippingForm.paymentMethod === 'upi' && (
                          <div className="mt-3.5 pt-3.5 border-t border-gray-100 space-y-3.5" onClick={(e) => e.stopPropagation()}>
                            <div>
                              <span className="block text-xs font-semibold text-gray-700 mb-2">
                                Select UPI Payment Method:
                              </span>

                              {/* Interactive App Selection Grid */}
                              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                {/* Google Pay */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedUpiApp('gpay');
                                    setUpiVerified(false);
                                    if (!upiId || upiId.includes('@')) {
                                      const prefix = upiId.split('@')[0] || '';
                                      setUpiId(prefix ? `${prefix}@okhdfcbank` : '');
                                    }
                                  }}
                                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                                    selectedUpiApp === 'gpay'
                                      ? 'border-[#800000] bg-[#FAF5EE] shadow-xs ring-1 ring-[#800000]'
                                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/60'
                                  }`}
                                >
                                  <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-2xs">
                                    <svg viewBox="0 0 24 24" className="w-4 h-4">
                                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                                    </svg>
                                  </div>
                                  <span className="font-semibold text-xs text-gray-900 leading-tight">Google Pay</span>
                                </button>

                                {/* PhonePe */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedUpiApp('phonepe');
                                    setUpiVerified(false);
                                    if (!upiId || upiId.includes('@')) {
                                      const prefix = upiId.split('@')[0] || '';
                                      setUpiId(prefix ? `${prefix}@ybl` : '');
                                    }
                                  }}
                                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                                    selectedUpiApp === 'phonepe'
                                      ? 'border-[#800000] bg-[#FAF5EE] shadow-xs ring-1 ring-[#800000]'
                                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/60'
                                  }`}
                                >
                                  <div className="w-7 h-7 rounded-full bg-[#5f259f] flex items-center justify-center text-white font-bold text-xs shadow-2xs font-sans">
                                    पे
                                  </div>
                                  <span className="font-semibold text-xs text-gray-900 leading-tight">PhonePe</span>
                                </button>

                                {/* Paytm */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedUpiApp('paytm');
                                    setUpiVerified(false);
                                    if (!upiId || upiId.includes('@')) {
                                      const prefix = upiId.split('@')[0] || '';
                                      setUpiId(prefix ? `${prefix}@paytm` : '');
                                    }
                                  }}
                                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                                    selectedUpiApp === 'paytm'
                                      ? 'border-[#800000] bg-[#FAF5EE] shadow-xs ring-1 ring-[#800000]'
                                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/60'
                                  }`}
                                >
                                  <div className="w-7 h-7 rounded-full bg-white border border-[#00BAF2]/40 flex items-center justify-center shadow-2xs">
                                    <span className="font-extrabold text-[10px] text-[#002970] leading-none">pay</span>
                                    <span className="font-extrabold text-[10px] text-[#00BAF2] leading-none">tm</span>
                                  </div>
                                  <span className="font-semibold text-xs text-gray-900 leading-tight">Paytm</span>
                                </button>

                                {/* BHIM */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedUpiApp('bhim');
                                    setUpiVerified(false);
                                    if (!upiId || upiId.includes('@')) {
                                      const prefix = upiId.split('@')[0] || '';
                                      setUpiId(prefix ? `${prefix}@upi` : '');
                                    }
                                  }}
                                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                                    selectedUpiApp === 'bhim'
                                      ? 'border-[#800000] bg-[#FAF5EE] shadow-xs ring-1 ring-[#800000]'
                                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/60'
                                  }`}
                                >
                                  <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-2xs">
                                    <div className="flex flex-col gap-0.5">
                                      <div className="w-3 h-0.5 bg-[#F47920] rounded-xs" />
                                      <div className="w-3 h-0.5 bg-[#0B8B43] rounded-xs" />
                                    </div>
                                  </div>
                                  <span className="font-semibold text-xs text-gray-900 leading-tight">BHIM UPI</span>
                                </button>

                                {/* QR Code */}
                                <button
                                  type="button"
                                  onClick={() => setSelectedUpiApp('qr')}
                                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center col-span-2 sm:col-span-1 ${
                                    selectedUpiApp === 'qr'
                                      ? 'border-[#800000] bg-[#FAF5EE] shadow-xs ring-1 ring-[#800000]'
                                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/60'
                                  }`}
                                >
                                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-800 shadow-2xs">
                                    <QrCode className="w-4 h-4" />
                                  </div>
                                  <span className="font-semibold text-xs text-gray-900 leading-tight">Scan QR</span>
                                </button>
                              </div>
                            </div>

                            {/* Particular App Input Box */}
                            {selectedUpiApp === 'qr' ? (
                              <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <div className="p-2.5 bg-white rounded-xl border border-gray-200 shadow-xs flex flex-col items-center shrink-0">
                                  <QrCode className="w-24 h-24 text-gray-900" />
                                  <span className="text-[10px] font-bold text-[#800000] mt-1.5">Scan with Any App</span>
                                </div>
                                <div className="space-y-2 text-center sm:text-left">
                                  <h4 className="font-bold text-xs sm:text-sm text-gray-900">
                                    Instant QR Code Payment
                                  </h4>
                                  <p className="text-xs text-gray-500 leading-relaxed">
                                    Open Google Pay, PhonePe, Paytm, BHIM, or any banking UPI app on your phone and scan the QR code to complete payment of <span className="font-bold text-gray-900">{formatRupee(orderTotal)}</span>.
                                  </p>
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                                    ✓ Zero Convenience Fee
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gray-50/70 p-3.5 sm:p-4 rounded-xl border border-gray-200 space-y-3">
                                <div>
                                  <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                                    {selectedUpiApp === 'gpay'
                                      ? 'Enter Google Pay UPI ID'
                                      : selectedUpiApp === 'phonepe'
                                      ? 'Enter PhonePe UPI ID / Mobile Number'
                                      : selectedUpiApp === 'paytm'
                                      ? 'Enter Paytm UPI ID / Registered Mobile'
                                      : 'Enter BHIM UPI ID (VPA)'}
                                  </label>

                                  <div className="flex gap-2">
                                    <div className="relative flex-1">
                                      <input
                                        type="text"
                                        placeholder={
                                          selectedUpiApp === 'gpay'
                                            ? 'e.g. mobile@okhdfcbank or yourname@oksbi'
                                            : selectedUpiApp === 'phonepe'
                                            ? 'e.g. 9876543210@ybl or username@ibl'
                                            : selectedUpiApp === 'paytm'
                                            ? 'e.g. 9876543210@paytm'
                                            : 'e.g. 9876543210@upi'
                                        }
                                        value={upiId}
                                        onChange={(e) => {
                                          setUpiId(e.target.value);
                                          setUpiVerified(false);
                                        }}
                                        className="w-full px-3.5 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]/25 font-mono"
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (upiId.trim().length > 3) setUpiVerified(true);
                                      }}
                                      className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer border shrink-0 ${
                                        upiVerified
                                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                          : 'bg-[#FAF5EE] border-[#E5DAC8] text-[#800000] hover:bg-[#F2E8DC]'
                                      }`}
                                    >
                                      {upiVerified ? 'Verified ✓' : 'Verify'}
                                    </button>
                                  </div>
                                </div>

                                {/* Handle / Suffix suggestions */}
                                <div className="space-y-1.5">
                                  <span className="text-[11px] text-gray-500 font-medium block">
                                    Popular {selectedUpiApp === 'gpay' ? 'Google Pay' : selectedUpiApp === 'phonepe' ? 'PhonePe' : selectedUpiApp === 'paytm' ? 'Paytm' : 'BHIM'} handles (tap to append):
                                  </span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {(selectedUpiApp === 'gpay'
                                      ? ['@okhdfcbank', '@oksbi', '@okaxis', '@okicici']
                                      : selectedUpiApp === 'phonepe'
                                      ? ['@ybl', '@ibl', '@axl']
                                      : selectedUpiApp === 'paytm'
                                      ? ['@paytm', '@ptaxis', '@pthdfc']
                                      : ['@upi', '@sbi', '@pnb']
                                    ).map((suffix) => (
                                      <button
                                        key={suffix}
                                        type="button"
                                        onClick={() => {
                                          const prefix = upiId.includes('@') ? upiId.split('@')[0] : upiId;
                                          setUpiId(prefix ? `${prefix}${suffix}` : suffix);
                                          setUpiVerified(false);
                                        }}
                                        className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-white border border-gray-200 text-gray-700 hover:border-[#800000] hover:text-[#800000] hover:bg-[#FAF5EE] transition-colors cursor-pointer"
                                      >
                                        {suffix}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <p className="text-[11px] text-gray-500 pt-1 border-t border-gray-200/60">
                                  ✓ A secure payment approval request will be sent to your {selectedUpiApp === 'gpay' ? 'Google Pay' : selectedUpiApp === 'phonepe' ? 'PhonePe' : selectedUpiApp === 'paytm' ? 'Paytm' : 'BHIM'} app.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 2. Credit Card (matches image fields exactly) */}
                      <div
                        onClick={() => setShippingForm((prev) => ({ ...prev, paymentMethod: 'card' }))}
                        className={`rounded-2xl border transition-all cursor-pointer p-4 sm:p-4.5 ${
                          shippingForm.paymentMethod === 'card'
                            ? 'border-[#800000] ring-1 ring-[#800000] bg-[#FAF5EE]/30 shadow-xs'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                              shippingForm.paymentMethod === 'card'
                                ? 'border-[#800000]'
                                : 'border-gray-300'
                            }`}>
                              {shippingForm.paymentMethod === 'card' && (
                                <div className="w-2.5 h-2.5 rounded-full bg-[#800000]" />
                              )}
                            </div>
                            <span className="font-semibold text-sm sm:text-base text-gray-900">
                              Credit card
                            </span>
                          </div>
                          {/* Card brand badges from image */}
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded text-[11px] font-extrabold italic bg-blue-50 text-blue-700 border border-blue-200">
                              VISA
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-0.5">
                              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block -ml-1" />
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                              RuPay
                            </span>
                            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                              Maestro
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-500 mt-1 pl-8">
                          Pay securely using your Visa, Maestro, Discover, RuPay, or Mastercard card.
                        </p>

                        {shippingForm.paymentMethod === 'card' && (
                          <div className="mt-4 pt-3.5 border-t border-gray-100 space-y-3.5" onClick={(e) => e.stopPropagation()}>
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Card Number
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  maxLength={19}
                                  placeholder="1234 1234 1234 1234"
                                  value={cardDetails.number}
                                  onChange={(e) => setCardDetails((prev) => ({ ...prev, number: e.target.value }))}
                                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]/25 pr-10 font-mono"
                                />
                                <CreditCard className="w-4 h-4 text-gray-400 absolute right-3.5 top-3" />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                              <div className="sm:col-span-6">
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                  Name on card
                                </label>
                                <input
                                  type="text"
                                  placeholder="Card name"
                                  value={cardDetails.name}
                                  onChange={(e) => setCardDetails((prev) => ({ ...prev, name: e.target.value }))}
                                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]/25"
                                />
                              </div>
                              <div className="sm:col-span-3">
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                  Expire date
                                </label>
                                <input
                                  type="text"
                                  maxLength={5}
                                  placeholder="MM / YY"
                                  value={cardDetails.expiry}
                                  onChange={(e) => setCardDetails((prev) => ({ ...prev, expiry: e.target.value }))}
                                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]/25 font-mono text-center"
                                />
                              </div>
                              <div className="sm:col-span-3">
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                  CVV
                                </label>
                                <input
                                  type="password"
                                  maxLength={4}
                                  placeholder="CVV"
                                  value={cardDetails.cvv}
                                  onChange={(e) => setCardDetails((prev) => ({ ...prev, cvv: e.target.value }))}
                                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]/25 font-mono text-center"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 3. Net Banking */}
                      <div
                        onClick={() => setShippingForm((prev) => ({ ...prev, paymentMethod: 'netbanking' }))}
                        className={`rounded-2xl border transition-all cursor-pointer p-4 sm:p-4.5 ${
                          shippingForm.paymentMethod === 'netbanking'
                            ? 'border-[#800000] ring-1 ring-[#800000] bg-[#FAF5EE]/30 shadow-xs'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                              shippingForm.paymentMethod === 'netbanking'
                                ? 'border-[#800000]'
                                : 'border-gray-300'
                            }`}>
                              {shippingForm.paymentMethod === 'netbanking' && (
                                <div className="w-2.5 h-2.5 rounded-full bg-[#800000]" />
                              )}
                            </div>
                            <span className="font-semibold text-sm sm:text-base text-gray-900">
                              Net banking
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Building className="w-4 h-4 text-gray-400" />
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                              All Indian Banks
                            </span>
                          </div>
                        </div>

                        {shippingForm.paymentMethod === 'netbanking' && (
                          <div className="mt-3.5 pt-3.5 border-t border-gray-100 space-y-3" onClick={(e) => e.stopPropagation()}>
                            <p className="text-xs text-gray-500">
                              Choose from popular Indian banks or select from dropdown:
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                              {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak', 'PNB'].map((b) => (
                                <button
                                  key={b}
                                  type="button"
                                  onClick={() => setSelectedBank(b)}
                                  className={`py-2 px-1 text-xs font-semibold rounded-lg border text-center transition-all ${
                                    selectedBank === b
                                      ? 'border-[#800000] bg-[#FAF5EE] text-[#800000]'
                                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                  }`}
                                >
                                  {b}
                                </button>
                              ))}
                            </div>
                            <select
                              value={selectedBank}
                              onChange={(e) => setSelectedBank(e.target.value)}
                              className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]/25"
                            >
                              <option value="HDFC Bank">HDFC Bank</option>
                              <option value="ICICI Bank">ICICI Bank</option>
                              <option value="State Bank of India">State Bank of India</option>
                              <option value="Axis Bank">Axis Bank</option>
                              <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                              <option value="Punjab National Bank">Punjab National Bank</option>
                              <option value="Bank of Baroda">Bank of Baroda</option>
                              <option value="IndusInd Bank">IndusInd Bank</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {/* 4. Cash on delivery */}
                      <div
                        onClick={() => setShippingForm((prev) => ({ ...prev, paymentMethod: 'cod' }))}
                        className={`rounded-2xl border transition-all cursor-pointer p-4 sm:p-4.5 ${
                          shippingForm.paymentMethod === 'cod'
                            ? 'border-[#800000] ring-1 ring-[#800000] bg-[#FAF5EE]/30 shadow-xs'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                              shippingForm.paymentMethod === 'cod'
                                ? 'border-[#800000]'
                                : 'border-gray-300'
                            }`}>
                              {shippingForm.paymentMethod === 'cod' && (
                                <div className="w-2.5 h-2.5 rounded-full bg-[#800000]" />
                              )}
                            </div>
                            <span className="font-semibold text-sm sm:text-base text-gray-900">
                              Cash on delivery
                            </span>
                          </div>
                          {/* Green cash icon matching image */}
                          <div className="w-8 h-6 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                            <Banknote className="w-4 h-4" />
                          </div>
                        </div>

                        {shippingForm.paymentMethod === 'cod' && (
                          <div className="mt-3 pt-3 border-t border-gray-100 pl-8">
                            <p className="text-xs text-gray-500 leading-relaxed">
                              Pay with Cash or scan UPI QR code upon doorstep delivery of your authentic consecrated items.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Primary Pay Button matching image */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#800000] via-[#5C0612] to-[#3E1F18] hover:from-[#660000] hover:to-[#2B140F] active:scale-[0.99] text-amber-100 hover:text-white font-semibold text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-5 disabled:opacity-75"
                      >
                        {isSubmitting ? (
                          <span>Processing Payment...</span>
                        ) : (
                          <span>
                            {shippingForm.paymentMethod === 'cod'
                              ? `Confirm Order | ${formatRupee(orderTotal)}`
                              : `Pay | ${formatRupee(orderTotal)}`}
                          </span>
                        )}
                      </button>

                      {/* Terms & Conditions Checkbox matching image */}
                      <div className="flex items-center justify-center gap-2 pt-2 text-xs text-gray-600">
                        <input
                          type="checkbox"
                          id="termsCheck"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="w-4 h-4 rounded text-[#800000] focus:ring-[#800000] border-gray-300 cursor-pointer"
                        />
                        <label htmlFor="termsCheck" className="cursor-pointer">
                          By clicking this, I agree to AstroVD{' '}
                          <span className="font-semibold text-[#800000] hover:underline">Terms & Conditions</span> and{' '}
                          <span className="font-semibold text-[#800000] hover:underline">Privacy Policy</span>
                        </label>
                      </div>
                    </form>
                  </div>

                  {/* Right Column (5 cols): Your cart + Order summary matching image */}
                  <div className="lg:col-span-5 bg-gradient-to-br from-[#F5F7FF] via-[#F8FAFF] to-[#FAF8FF] border border-[#E0E7FF]/70 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col gap-4 shadow-sm">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="font-sans font-semibold text-lg sm:text-xl text-[#2A1810] tracking-tight">
                        Your cart <span className="text-[#800000]">({items.length})</span>
                      </h3>
                    </div>

                    {/* Cart item cards */}
                    <div className="space-y-3 max-h-64 sm:max-h-72 overflow-y-auto pr-1">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl border border-gray-150 p-3 sm:p-3.5 flex gap-3.5 items-center shadow-xs"
                        >
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                            <img
                              src={item.image || '/services/consultation.jpg'}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-xs sm:text-sm text-gray-900 truncate">
                              {formatTitleCase(item.name)}
                            </h4>
                            <span className="text-xs text-gray-500 block mt-0.5">
                              Qty : {item.quantity}
                            </span>
                            <div className="font-sans font-semibold text-sm sm:text-base text-[#2A1810] tracking-tight mt-1">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Apply coupon code card matching image */}
                    <div className="bg-white rounded-2xl border border-gray-150 p-3.5 sm:p-4 shadow-xs">
                      <button
                        type="button"
                        onClick={() => setIsCouponOpen(!isCouponOpen)}
                        className="w-full flex items-center justify-between text-left cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#FAF5EE] border border-[#E5DAC8] flex items-center justify-center text-[#800000]">
                            <Percent className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                          <span className="font-semibold text-xs sm:text-sm text-gray-800">
                            Apply coupon code
                          </span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-gray-400 transition-transform ${
                            isCouponOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isCouponOpen && (
                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Enter code (e.g. VEDIC10)"
                              value={couponInput}
                              onChange={(e) => setCouponInput(e.target.value)}
                              className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg uppercase font-mono focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]/25"
                            />
                            <button
                              type="button"
                              onClick={() => handleApplyCoupon()}
                              className="px-3 py-1.5 bg-gradient-to-r from-[#800000] to-[#5C0612] hover:from-[#660000] hover:to-[#3E1F18] text-amber-100 hover:text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
                            >
                              Apply
                            </button>
                          </div>
                          {couponError && <p className="text-[11px] text-red-500">{couponError}</p>}
                          {appliedCoupon && (
                            <p className="text-[11px] text-emerald-600 font-medium">
                              ✓ Code {appliedCoupon.code} applied! Saved ₹{appliedCoupon.discount}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Order summary card matching image */}
                    <div className="bg-white rounded-2xl border border-gray-150 p-4 sm:p-5 shadow-xs space-y-3 font-sans">
                      <h4 className="font-sans font-semibold text-lg sm:text-xl text-[#2A1810] tracking-tight">Order Summary</h4>
                      <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span className="font-semibold text-gray-900">
                            ₹{subtotal.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping</span>
                          <span className="font-semibold text-emerald-600">Free</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax</span>
                          <span className="font-semibold text-gray-900">₹0.00</span>
                        </div>
                        {appliedCoupon && (
                          <div className="flex justify-between text-emerald-600">
                            <span>Discount</span>
                            <span className="font-semibold">-₹{appliedCoupon.discount.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                      </div>
                      <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                        <span className="font-sans font-semibold text-base sm:text-lg text-[#2A1810] tracking-tight">Total</span>
                        <span className="font-sans font-semibold text-lg sm:text-xl text-[#2A1810] tracking-tight">
                          ₹{orderTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
