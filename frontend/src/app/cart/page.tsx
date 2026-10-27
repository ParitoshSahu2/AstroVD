'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
  ShieldCheck,
  Sparkles,
  Clock,
  User,
  Tag,
  Heart,
  ArrowRight,
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

export default function CartPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { items, totalCount, subtotal, updateQuantity, removeItem, clearCart, addItem } = useCart();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrderNumber, setCompletedOrderNumber] = useState<string>('');

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
    setIsCheckoutModalOpen(true);
  };

  const handleCompleteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const generatedOrder = `AVD-${Math.floor(100000 + Math.random() * 900000)}`;
      setCompletedOrderNumber(generatedOrder);
      setIsSubmitting(false);
      setIsCheckoutModalOpen(false);
      setCurrentStep(3);
      clearCart();
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col font-sans selection:bg-[#3E1F18] selection:text-white">
      <Navbar />

      {/* Main Content Area - Expanded to max-w-7xl / 1440px to position the Cart & Recommendation component prominently to the left */}
      <main className="flex-1 max-w-7xl xl:max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16">
        {/* Step 3: Confirmation View */}
        {currentStep === 3 ? (
          <div className="bg-white rounded-2xl border border-[#ECE5DC] p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm my-8">
            <div className="w-16 h-16 bg-[#F4EFE6] text-[#3E1F18] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A1810]">
              Order Confirmed Successfully!
            </h2>
            <p className="text-sm sm:text-base text-[#736B63] mt-2">
              Thank you for choosing AstroVD. Your sacred booking reference is{' '}
              <span className="font-bold text-[#3E1F18]">{completedOrderNumber}</span>.
            </p>
            <p className="text-xs sm:text-sm text-[#8C827A] mt-2">
              A confirmation email and SMS with consultation details and tracking links have been sent.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setCurrentStep(1);
                  handleRestoreSampleItems();
                }}
                className="px-6 py-3 rounded-xl bg-[#3E1F18] text-white font-medium text-sm hover:bg-[#2A1810] transition-colors"
              >
                Reset Demo Cart
              </button>
              <Link
                href="/services"
                className="px-6 py-3 rounded-xl border border-[#ECE5DC] text-[#2A1810] font-medium text-sm hover:bg-[#FAF7F2] transition-colors"
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
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#FAF5EE] border border-[#EBE3D7] flex items-center justify-center text-[#3E1F18] shadow-2xs">
                        <ShoppingCart className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#2A1810] tracking-tight">
                          Your Cart
                        </h2>
                        <p className="text-xs text-[#8C8075] font-sans">
                          {items.length} {items.length === 1 ? 'consecrated item' : 'consecrated items'} in sacred bag
                        </p>
                      </div>
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
                                <h3 className="font-serif font-bold text-base sm:text-lg lg:text-xl text-[#2A1810] line-clamp-1 group-hover:text-[#800000] transition-colors">
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

                            {/* Right: Price on top, Stepper directly below in a straight line, Trash to the right */}
                            <div className="flex items-end gap-3 shrink-0 pt-2 sm:pt-0">
                              <div className="flex flex-col items-end gap-2">
                                {/* Price */}
                                <div className="font-serif font-bold text-lg sm:text-xl text-[#2A1810] tracking-tight">
                                  {formatRupee(item.price)}
                                </div>

                                {/* Quantity Stepper Pill directly under price in straight line */}
                                <div className="inline-flex items-center border border-[#ECE5DC] rounded-full bg-[#FAF7F2] px-1.5 py-1 shadow-2xs">
                                  <button
                                    onClick={() =>
                                      item.quantity > 1
                                        ? updateQuantity(item.id, item.quantity - 1)
                                        : removeItem(item.id)
                                    }
                                    className="w-7 h-7 flex items-center justify-center text-[#736B63] hover:text-[#2A1810] hover:bg-white rounded-full transition-colors cursor-pointer"
                                    title="Decrease quantity"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="w-7 text-center text-xs sm:text-sm font-serif font-bold text-[#2A1810]">
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

                              {/* Trash Remove Button */}
                              <button
                                onClick={() => removeItem(item.id)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-[#8C827A] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer mb-0.5"
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

                {/* 2. Meaningful Sacred Divider Bar */}
                <div className="border-t border-[#ECE5DC] bg-gradient-to-r from-[#FAF6EE] via-[#F5ECE0] to-[#FAF6EE] px-6 sm:px-8 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4.5 h-4.5 text-[#8C6239]" />
                    <span className="font-serif font-bold text-sm sm:text-base text-[#2A1810] tracking-tight">
                      Sacred Additions For Your Booking
                    </span>
                    <span className="text-xs text-[#8C8075] hidden sm:inline">• Consecrated & Handcrafted</span>
                  </div>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-1 text-xs font-serif font-bold text-[#3E1F18] hover:underline"
                  >
                    <span>Explore All Products</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* 3. Lower Section: Recommended Products Tray */}
                <div className="p-6 sm:p-8 bg-[#FCFAF7] border-t border-[#F0EBE3]">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
                    {RECOMMENDED_PRODUCTS.map((prod) => {
                      const isWishlisted = wishlist.includes(prod.id);
                      return (
                        <div
                          key={prod.id}
                          className="rounded-2xl border border-[#F0EBE3] p-3 sm:p-3.5 bg-white hover:border-[#DECBB7] hover:shadow-md transition-all flex flex-col justify-between group shadow-xs"
                        >
                          {/* Image with Heart Wishlist Icon */}
                          <div className="relative w-full h-32 sm:h-36 rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#F0EBE3]">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <button
                              onClick={() => toggleWishlist(prod.id)}
                              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#736B63] hover:text-red-500 shadow-2xs transition-colors cursor-pointer"
                              title="Add to Wishlist"
                            >
                              <Heart
                                className={`w-4 h-4 ${
                                  isWishlisted ? 'fill-red-500 text-red-500' : ''
                                }`}
                              />
                            </button>
                          </div>

                          {/* Title */}
                          <h4 className="font-serif font-bold text-xs sm:text-sm text-[#2A1810] mt-2.5 line-clamp-1 group-hover:text-[#800000] transition-colors">
                            {formatTitleCase(prod.name)}
                          </h4>

                          {/* Price & Add Button */}
                          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#F0EAE1]">
                            <span className="font-serif font-bold text-xs sm:text-sm text-[#2A1810]">
                              {prod.priceFormatted}
                            </span>
                            <button
                              onClick={() => handleAddRecommended(prod)}
                              className="px-3.5 py-1.5 bg-[#3E1F18] hover:bg-[#2A1810] text-white text-xs font-semibold rounded-full active:scale-95 transition-all cursor-pointer shadow-2xs"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (4 cols): Luxury Order Summary Card */}
            <div className="lg:col-span-4 sticky top-28 lg:top-32 transition-all">
              <div className="bg-white rounded-3xl border border-[#ECE5DC] p-6 sm:p-7 shadow-[0_4px_24px_rgba(42,24,16,0.06)] flex flex-col gap-5">
                {/* Header: Order Summary */}
                <div className="flex items-center justify-between pb-4 border-b border-[#F0EBE3]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#FAF5EE] border border-[#EBE3D7] flex items-center justify-center text-[#3E1F18]">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#2A1810] tracking-tight">
                        Order Summary
                      </h3>
                      <p className="text-[11px] text-[#8C8075] font-sans">
                        Temple consecrated booking summary
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-[#6E4B37] bg-[#F5ECE0] border border-[#EADDCB] px-2.5 py-1 rounded-full font-serif">
                    {totalCount} {totalCount === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Compact Refined Line Items */}
                {items.length > 0 ? (
                  <div className="flex flex-col gap-3 max-h-[310px] overflow-y-auto pr-1">
                    {items.map((item) => {
                      const details = getItemDetails(item);
                      return (
                        <div
                          key={`summary-${item.id}`}
                          className="bg-[#FCFAF7] border border-[#F0EAE1] hover:border-[#DECBB7] transition-all rounded-xl p-3 flex items-center gap-3.5 group shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
                        >
                          {/* Mini Thumbnail */}
                          <div className="w-13 h-13 rounded-xl overflow-hidden bg-white border border-[#E5DACB] shrink-0 relative">
                            <img
                              src={item.image || '/services/consultation.jpg'}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-serif font-bold text-xs sm:text-sm text-[#2A1810] truncate group-hover:text-[#3E1F18] transition-colors">
                              {item.name}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8C6239] bg-[#EFE6D8] px-2 py-0.5 rounded-full truncate">
                                {details.badge1} • {details.badge2}
                              </span>
                            </div>

                            {/* Tactile Micro Stepper Pill */}
                            <div className="inline-flex items-center border border-[#E3D9CC] rounded-full bg-white px-2 py-0.5 gap-2 shadow-2xs mt-2">
                              <button
                                onClick={() =>
                                  item.quantity > 1
                                    ? updateQuantity(item.id, item.quantity - 1)
                                    : removeItem(item.id)
                                }
                                className="w-4 h-4 flex items-center justify-center text-[#736B63] hover:text-[#2A1810] transition-colors"
                                title="Decrease"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className="text-[11px] font-serif font-bold text-[#2A1810] min-w-3 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-4 h-4 flex items-center justify-center text-[#736B63] hover:text-[#2A1810] transition-colors"
                                title="Increase"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>

                          {/* Price & Delete */}
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <span className="font-serif font-bold text-sm sm:text-base text-[#2A1810]">
                              {formatRupee(item.price * item.quantity)}
                            </span>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="w-6 h-6 rounded-full flex items-center justify-center text-[#A3988E] hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Remove line item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[#736B63] py-2">No items selected yet.</p>
                )}

                {/* Subtotal & Breakdown Calculations */}
                <div className="border-t border-[#F0EBE3] pt-3 flex flex-col gap-2.5 text-xs sm:text-sm">
                  <div className="flex justify-between items-center text-[#736B63]">
                    <span className="font-sans">
                      Subtotal ({totalCount} {totalCount === 1 ? 'item' : 'items'})
                    </span>
                    <span className="font-serif font-bold text-[#2A1810]">{formatRupee(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#736B63]">
                    <span className="font-sans">Consecration & Sacred Dispatch</span>
                    <span className="font-semibold text-emerald-700 font-serif">FREE</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between items-center text-[#736B63]">
                      <span className="font-sans">Vedic Voucher Discount</span>
                      <span className="font-serif font-bold text-emerald-700">
                        - {formatRupee(discountAmount)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Highlighted Total Amount Block */}
                <div className="bg-gradient-to-br from-[#FAF5EC] to-[#F5ECE0] border border-[#E5DAC8] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="font-serif font-bold text-sm sm:text-base text-[#2A1810] block">
                      Total Payable
                    </span>
                    <span className="text-[11px] text-[#7A6E65] font-sans">
                      Inclusive of all sanctified rituals & taxes
                    </span>
                  </div>
                  <span className="font-serif font-extrabold text-2xl sm:text-3xl text-[#2A1810] tracking-tight">
                    {formatRupee(orderTotal)}
                  </span>
                </div>

                {/* Security Reassurance Box */}
                <div className="bg-[#FAF7F2] border border-[#ECE5DC] rounded-xl p-3.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#E5DAC8] flex items-center justify-center text-[#8C6239] shrink-0">
                    <ShieldCheck className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-serif font-bold text-xs text-[#2A1810]">
                      100% Encrypted & Authenticated
                    </h5>
                    <p className="text-[11px] text-[#736B63] truncate">
                      Varanasi Acharya consecrated spiritual guarantee.
                    </p>
                  </div>
                </div>

                {/* Big Proceed to Payment Button */}
                <button
                  onClick={handleProceedToPayment}
                  disabled={items.length === 0}
                  className={`w-full py-4 px-6 rounded-2xl font-serif font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-[0_4px_16px_rgba(62,31,24,0.2)] transition-all duration-300 group cursor-pointer ${
                    items.length > 0
                      ? 'bg-gradient-to-r from-[#3E1F18] via-[#4D241B] to-[#3E1F18] hover:from-[#2B140F] hover:to-[#2B140F] text-white active:scale-[0.99]'
                      : 'bg-[#D8CEBF] text-white cursor-not-allowed opacity-75'
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-[#ECE5DC] max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            {/* Close Button */}
            <button
              onClick={() => {
                setIsCheckoutModalOpen(false);
                setCurrentStep(1);
              }}
              className="absolute top-5 right-5 text-[#736B63] hover:text-[#2A1810] p-1.5 rounded-lg hover:bg-[#FAF7F2] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-[#F0EBE3]">
              <Lock className="w-5 h-5 text-[#3E1F18]" />
              <div>
                <h3 className="font-serif font-bold text-xl text-[#2A1810]">
                  Payment & Shipping Details
                </h3>
                <p className="text-xs text-[#736B63]">
                  Complete your billing and sacred consultation details below.
                </p>
              </div>
            </div>

            <form onSubmit={handleCompleteOrder} className="flex flex-col gap-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2A1810] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={shippingForm.fullName}
                    onChange={(e) =>
                      setShippingForm((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-[#ECE5DC] rounded-lg focus:outline-none focus:border-[#3E1F18] bg-[#FAF7F2]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2A1810] mb-1">
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={shippingForm.phone}
                    onChange={(e) =>
                      setShippingForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-[#ECE5DC] rounded-lg focus:outline-none focus:border-[#3E1F18] bg-[#FAF7F2]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2A1810] mb-1">
                  Delivery / Residential Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="House / Street / Landmark"
                  value={shippingForm.address}
                  onChange={(e) =>
                    setShippingForm((prev) => ({ ...prev, address: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-[#ECE5DC] rounded-lg focus:outline-none focus:border-[#3E1F18] bg-[#FAF7F2]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div>
                  <label className="block font-semibold text-[#2A1810] mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={shippingForm.city}
                    onChange={(e) =>
                      setShippingForm((prev) => ({ ...prev, city: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-[#ECE5DC] rounded-lg focus:outline-none focus:border-[#3E1F18] bg-[#FAF7F2]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2A1810] mb-1">State *</label>
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={shippingForm.state}
                    onChange={(e) =>
                      setShippingForm((prev) => ({ ...prev, state: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-[#ECE5DC] rounded-lg focus:outline-none focus:border-[#3E1F18] bg-[#FAF7F2]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2A1810] mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="PIN Code"
                    value={shippingForm.pincode}
                    onChange={(e) =>
                      setShippingForm((prev) => ({ ...prev, pincode: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-[#ECE5DC] rounded-lg focus:outline-none focus:border-[#3E1F18] bg-[#FAF7F2]"
                  />
                </div>
              </div>

              {/* Sankalp Details (Optional for Pooja/Consultations) */}
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#ECE5DC] flex flex-col gap-2">
                <span className="font-semibold text-xs text-[#2A1810]">
                  Vedic Sankalp Information (Optional)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Yajman / Native Name"
                    value={shippingForm.sankalpName}
                    onChange={(e) =>
                      setShippingForm((prev) => ({ ...prev, sankalpName: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 border border-[#ECE5DC] rounded-lg focus:outline-none focus:border-[#3E1F18] bg-white text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Gotra (e.g. Kashyap, Shandilya)"
                    value={shippingForm.sankalpGotra}
                    onChange={(e) =>
                      setShippingForm((prev) => ({ ...prev, sankalpGotra: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 border border-[#ECE5DC] rounded-lg focus:outline-none focus:border-[#3E1F18] bg-white text-xs"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block font-semibold text-[#2A1810] mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <label
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${
                      shippingForm.paymentMethod === 'upi'
                        ? 'border-[#3E1F18] bg-[#F4EFE6] text-[#2A1810]'
                        : 'border-[#ECE5DC] bg-white text-[#736B63]'
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
                    <Sparkles className="w-5 h-5 mb-1" />
                    <span className="font-semibold text-xs">UPI / QR</span>
                  </label>

                  <label
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${
                      shippingForm.paymentMethod === 'card'
                        ? 'border-[#3E1F18] bg-[#F4EFE6] text-[#2A1810]'
                        : 'border-[#ECE5DC] bg-white text-[#736B63]'
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
                    <CreditCard className="w-5 h-5 mb-1" />
                    <span className="font-semibold text-xs">Credit/Debit Card</span>
                  </label>

                  <label
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${
                      shippingForm.paymentMethod === 'netbanking'
                        ? 'border-[#3E1F18] bg-[#F4EFE6] text-[#2A1810]'
                        : 'border-[#ECE5DC] bg-white text-[#736B63]'
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
                    <Building className="w-5 h-5 mb-1" />
                    <span className="font-semibold text-xs">Net Banking</span>
                  </label>
                </div>
              </div>

              {/* Total Summary Row in Modal */}
              <div className="flex justify-between items-center py-3 border-t border-[#F0EBE3] mt-2">
                <span className="font-semibold text-[#2A1810]">Total Payable:</span>
                <span className="font-serif font-bold text-lg text-[#2A1810]">
                  {formatRupee(orderTotal)}
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#3E1F18] hover:bg-[#2A1810] text-white font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {isSubmitting ? (
                  <span>Processing Sacred Payment...</span>
                ) : (
                  <>
                    <span>Pay {formatRupee(orderTotal)} & Confirm</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
