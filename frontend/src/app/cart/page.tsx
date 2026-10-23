'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PageHeader } from '../../components/PageHeader';
import { AuthModal } from '../../components/AuthModal';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  PackageCheck,
  Truck,
  RotateCcw,
  Lock,
  ShoppingBag,
  MapPin,
  Check,
  User,
  Phone,
  Home,
  Building2,
  CreditCard,
  Shield,
} from 'lucide-react';

interface ShippingAddressForm {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  sankalpName: string;
  sankalpGotra: string;
  notes: string;
}

export default function CartPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { items, totalCount, subtotal, updateQuantity, removeItem, clearCart } = useCart();

  const [step, setStep] = useState<'cart' | 'checkout' | 'confirmation'>('cart');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ name?: string; email?: string } | null>(null);

  const [shippingForm, setShippingForm] = useState<ShippingAddressForm>({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    sankalpName: '',
    sankalpGotra: '',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');

  // Check auth state on load
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('astro_token');
        setAuthToken(token);
        const storedUser = localStorage.getItem('astro_user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            setUserProfile(parsed);
            if (parsed.name && !shippingForm.fullName) {
              setShippingForm((prev) => ({
                ...prev,
                fullName: parsed.name,
                sankalpName: prev.sankalpName || parsed.name,
              }));
            }
          } catch (e) {
            // ignore
          }
        }
      }
    };

    checkAuth();
    const handleAuthChange = () => checkAuth();
    window.addEventListener('astro-auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('astro-auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShippingForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!shippingForm.fullName.trim()) {
      errors.fullName = t('Full name is required', 'पूरा नाम आवश्यक है');
    }
    const cleanPhone = shippingForm.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errors.phone = t('Valid 10-digit mobile number is required', 'वैध 10 अंकों का मोबाइल नंबर आवश्यक है');
    }
    if (!shippingForm.street.trim()) {
      errors.street = t('Delivery street address is required', 'सड़क का पता आवश्यक है');
    }
    if (!shippingForm.city.trim()) {
      errors.city = t('City is required', 'शहर आवश्यक है');
    }
    if (!shippingForm.state.trim()) {
      errors.state = t('State is required', 'राज्य आवश्यक है');
    }
    const cleanPin = shippingForm.postalCode.replace(/\D/g, '');
    if (!cleanPin || cleanPin.length !== 6) {
      errors.postalCode = t('Valid 6-digit PIN code is required', 'वैध 6 अंकों का पिन कोड आवश्यक है');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToCheckout = () => {
    if (!authToken) {
      router.push('/login?redirect=/cart');
      return;
    }
    setStep('checkout');
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    if (!authToken) {
      router.push('/login?redirect=/cart');
      return;
    }

    if (items.length === 0) {
      setSubmitError(t('Your cart is empty', 'आपकी कार्ट खाली है'));
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Build notes string including sankalp information if provided
      let orderNotes = shippingForm.notes.trim();
      if (shippingForm.sankalpName) {
        const sankalpNote = `Sankalp Name: ${shippingForm.sankalpName}${
          shippingForm.sankalpGotra ? `, Gotra: ${shippingForm.sankalpGotra}` : ''
        }`;
        orderNotes = orderNotes ? `${orderNotes} | ${sankalpNote}` : sankalpNote;
      }

      const payload = {
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          recipient: shippingForm.fullName.trim(),
          addressLine: shippingForm.street.trim(),
          city: shippingForm.city.trim(),
          state: shippingForm.state.trim(),
          pincode: shippingForm.postalCode.trim(),
          phone: shippingForm.phone.trim(),
          sankalpName: shippingForm.sankalpName.trim() || undefined,
          sankalpGotra: shippingForm.sankalpGotra.trim() || undefined,
          notes: orderNotes || undefined,
        },
      };

      const res = await fetch(`${backendUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || t('Failed to create order. Please try again.', 'ऑर्डर बनाने में विफल। कृपया पुनः प्रयास करें।'));
      }

      // Order created successfully!
      setCompletedOrder(data);
      clearCart();
      setStep('confirmation');
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Order creation error:', err);
      setSubmitError(err.message || t('An unexpected error occurred.', 'एक अनपेक्षित त्रुटि हुई।'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#3B1E22] flex flex-col font-sans selection:bg-amber-400 overflow-x-clip">
      <Navbar />

      <PageHeader
        title={t('Sacred Shopping Cart & Checkout', 'पवित्र शॉपिंग कार्ट एवं ऑर्डर')}
        subtitle={t(
          'Authentic Lab-Certified Gemstones & Sacred Rudrakshas Consecrated with Vedic Sankalp',
          'वैदिक संकल्प द्वारा प्राण-प्रतिष्ठित शुद्ध लैब-प्रमाणित रत्न एवं रुद्राक्ष'
        )}
        breadcrumb={t('Cart', 'कार्ट')}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* ================= STEP 1: CONFIRMATION VIEW ================= */}
        {step === 'confirmation' && completedOrder && (
          <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
            <div className="rounded-3xl bg-white border-2 border-amber-300 shadow-2xl p-6 sm:p-10 text-center space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-[#800000] to-amber-400" />

              <div className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-400 text-emerald-700 flex items-center justify-center mx-auto shadow-lg">
                <PackageCheck className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  {t('Order Placed Successfully', 'ऑर्डर सफलतापूर्वक दर्ज हुआ')}
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A151B]">
                  {t('Jai Shri Ram! Your Order has been Placed', 'जय श्री राम! आपका ऑर्डर स्वीकार कर लिया गया है')}
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
                  {t(
                    'Our Vedic Acharyas in Kashi will conduct the consecrated Prana Pratishtha rituals for your items before sacred packaging and dispatch.',
                    'काशी के वैदिक आचार्यों द्वारा आपकी सामग्री की विशेष प्राण-प्रतिष्ठा पूजा संपन्न कर पवित्र सुरक्षा कवच के साथ प्रेषित किया जाएगा।'
                  )}
                </p>
              </div>

              {/* Order Meta Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 rounded-2xl p-4 border border-stone-200 text-xs text-left">
                <div>
                  <span className="text-stone-500 font-semibold block uppercase text-[10px]">{t('Order Number', 'ऑर्डर क्रमांक')}</span>
                  <span className="font-bold text-[#800000] font-mono break-all">{completedOrder.orderNumber || completedOrder.id.slice(0, 8)}</span>
                </div>
                <div>
                  <span className="text-stone-500 font-semibold block uppercase text-[10px]">{t('Status', 'स्थिति')}</span>
                  <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px] mt-0.5">
                    {completedOrder.status || 'PROCESSING'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 font-semibold block uppercase text-[10px]">{t('Payment Status', 'भुगतान स्थिति')}</span>
                  <span className="inline-block px-2 py-0.5 rounded-full bg-stone-200 text-stone-800 font-bold text-[11px] mt-0.5">
                    {completedOrder.paymentStatus || 'PENDING'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 font-semibold block uppercase text-[10px]">{t('Total Amount', 'कुल राशि')}</span>
                  <span className="font-bold text-stone-900 text-sm">₹{Number(completedOrder.totalAmount).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Ordered Items Summary */}
              {completedOrder.items && completedOrder.items.length > 0 && (
                <div className="text-left space-y-3 pt-2">
                  <h3 className="font-serif font-bold text-sm text-[#4A151B]">
                    {t('Ordered Items:', 'ऑर्डर की गई सामग्री:')}
                  </h3>
                  <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden bg-white">
                    {completedOrder.items.map((it: any, idx: number) => (
                      <div key={idx} className="p-3 sm:p-4 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-stone-900">{it.product?.name || `Product #${it.productId}`}</p>
                          <p className="text-stone-500 text-[11px]">
                            {t('Qty', 'मात्रा')}: {it.quantity} × ₹{Number(it.price).toLocaleString('en-IN')}
                          </p>
                        </div>
                        <span className="font-bold text-stone-900">
                          ₹{(Number(it.price) * it.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery Address Details */}
              {completedOrder.shippingAddress && (
                <div className="text-left bg-amber-50/60 rounded-2xl p-4 border border-amber-200 text-xs space-y-1">
                  <span className="font-bold text-[#800000] block text-[11px] uppercase tracking-wider">
                    {t('Delivery Destination', 'वितरण का पता')}
                  </span>
                  <p className="font-semibold text-stone-900">
                    {completedOrder.shippingAddress.recipient || completedOrder.shippingAddress.fullName}
                  </p>
                  <p className="text-stone-600">
                    {completedOrder.shippingAddress.addressLine || completedOrder.shippingAddress.street}, {completedOrder.shippingAddress.city}, {completedOrder.shippingAddress.state} - {completedOrder.shippingAddress.pincode || completedOrder.shippingAddress.postalCode}
                  </p>
                  <p className="text-stone-600">{t('Contact Phone', 'संपर्क फोन')}: {completedOrder.shippingAddress.phone}</p>
                  {completedOrder.shippingAddress.notes && (
                    <p className="text-stone-700 italic pt-1 border-t border-amber-200/60">
                      {t('Personal Sankalp / Notes', 'संकल्प एवं निर्देश')}: {completedOrder.shippingAddress.notes}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <Link
                  href="/dashboard?tab=orders"
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#5B0D15] hover:bg-[#72111c] text-amber-100 font-serif font-bold text-xs sm:text-sm shadow-xl hover:scale-105 transition-all text-center cursor-pointer"
                >
                  {t('Track Order in Dashboard', 'डैशबोर्ड में ऑर्डर ट्रैक करें')}
                </Link>
                <Link
                  href="/products"
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-semibold text-xs sm:text-sm shadow-sm transition-all text-center"
                >
                  {t('Continue Shopping', 'और खरीदारी करें')}
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: EMPTY CART ================= */}
        {step !== 'confirmation' && items.length === 0 && (
          <div className="max-w-2xl mx-auto text-center py-16 px-4 space-y-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-100 via-rose-50 to-stone-100 border-2 border-amber-200 text-[#5B0D15] flex items-center justify-center mx-auto shadow-md">
              <ShoppingCart className="w-10 h-10 opacity-70" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A151B]">
                {t('Your Sacred Cart is Empty', 'आपकी पूजा कार्ट खाली है')}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                {t(
                  'Explore our collection of authentic 100% natural energized bracelets and gemstone talismans blessed in Kashi.',
                  'काशी में अभिमंत्रित 100% शुद्ध प्रमाणित आध्यात्मिक ब्रेसलेट और सिद्ध रत्नों का संग्रह देखें।'
                )}
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#5B0D15] via-[#73121D] to-[#480A10] hover:from-[#73121D] hover:to-[#5B0D15] text-amber-100 font-serif font-bold text-sm shadow-xl shadow-rose-950/20 hover:scale-105 transition-all cursor-pointer"
              >
                <span>{t('Explore Spiritual Products', 'सिद्ध आध्यात्मिक उत्पाद देखें')}</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </Link>
            </div>
          </div>
        )}

        {/* ================= STEP 3: CART ITEMS & CHECKOUT ================= */}
        {step !== 'confirmation' && items.length > 0 && (
          <div className="space-y-8">
            {/* Clean, Simple Progress Stepper */}
            <div className="max-w-md mx-auto w-full py-2">
              <div className="flex items-center justify-center">
                {/* Step 1: Cart */}
                <button
                  type="button"
                  onClick={() => {
                    setStep('cart');
                    window.scrollTo({ top: 220, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2.5 cursor-pointer group focus:outline-none"
                >
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      step === 'cart'
                        ? 'bg-[#5B0D15] text-amber-100 ring-4 ring-amber-100 shadow-sm'
                        : step === 'checkout'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {step === 'checkout' ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '1'}
                  </span>
                  <span
                    className={`text-xs sm:text-sm transition-colors ${
                      step === 'cart'
                        ? 'text-[#5B0D15] font-bold'
                        : 'text-stone-500 font-medium group-hover:text-stone-800'
                    }`}
                  >
                    {t('Cart', 'कार्ट')} {totalCount > 0 ? `(${totalCount})` : ''}
                  </span>
                </button>

                {/* Connecting Divider Line */}
                <div className="flex-1 mx-4 sm:mx-6 h-[2px] max-w-[80px] bg-stone-200 relative overflow-hidden rounded-full">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      step === 'checkout' ? 'w-full bg-[#5B0D15]' : 'w-0 bg-[#5B0D15]'
                    }`}
                  />
                </div>

                {/* Step 2: Checkout */}
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="flex items-center gap-2.5 cursor-pointer group focus:outline-none"
                >
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      step === 'checkout'
                        ? 'bg-[#5B0D15] text-amber-100 ring-4 ring-amber-100 shadow-sm'
                        : 'bg-stone-200 text-stone-500'
                    }`}
                  >
                    2
                  </span>
                  <span
                    className={`text-xs sm:text-sm transition-colors ${
                      step === 'checkout'
                        ? 'text-[#5B0D15] font-bold'
                        : 'text-stone-500 font-medium group-hover:text-stone-800'
                    }`}
                  >
                    {t('Checkout', 'चेकआउट')}
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: Items Table or Checkout Form */}
              <div className="lg:col-span-8 space-y-6">
                {step === 'cart' ? (
                  <div className="rounded-3xl bg-white border border-stone-200/90 shadow-xl overflow-hidden">
                    <div className="p-4 sm:p-6 bg-gradient-to-r from-stone-50 to-amber-50/50 border-b border-stone-200 flex items-center justify-between">
                      <h2 className="font-serif font-bold text-lg sm:text-xl text-[#4A151B] flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-amber-700" />
                        <span>{t('Cart Items', 'कार्ट सामग्री')} ({totalCount})</span>
                      </h2>
                      <button
                        onClick={clearCart}
                        className="text-xs text-rose-700 hover:text-rose-900 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t('Clear Cart', 'कार्ट खाली करें')}</span>
                      </button>
                    </div>

                    {/* Sign-in prompt for guest cart users */}
                    {!authToken && (
                      <div className="p-3.5 sm:p-4 bg-amber-50/90 border-b border-amber-200 text-amber-950 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-[#5B0D15] shrink-0" />
                          <span>
                            {t(
                              'Please sign in to your sacred account to checkout and complete your consecrated order.',
                              'अपने पावन ऑर्डर की पुष्टि व चेकआउट के लिए कृपया साइन इन करें।'
                            )}
                          </span>
                        </div>
                        <Link
                          href="/login?redirect=/cart"
                          className="px-3.5 py-1.5 rounded-full bg-[#5B0D15] hover:bg-[#72111c] text-white font-bold text-xs shrink-0 transition-transform hover:scale-105 active:scale-95"
                        >
                          {t('Sign In to Checkout', 'साइन इन करें')} →
                        </Link>
                      </div>
                    )}

                    <div className="divide-y divide-stone-100">
                      {items.map((item) => {
                        const prodName = language === 'hi' && item.nameHi ? item.nameHi : item.name;
                        const lineTotal = item.price * item.quantity;

                        return (
                          <div
                            key={item.id}
                            className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-amber-50/20 transition-colors"
                          >
                            {/* Product Info & Thumb */}
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-stone-900 overflow-hidden shrink-0 border border-amber-300/70 shadow-sm">
                                <img
                                  src={item.image}
                                  alt={prodName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="space-y-1 min-w-0">
                                <span className="text-[10px] font-bold tracking-wider uppercase text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full inline-block">
                                  {language === 'hi' && item.tagHi ? item.tagHi : item.tag}
                                </span>
                                <h3 className="font-serif font-bold text-stone-900 text-sm sm:text-base truncate">
                                  {prodName}
                                </h3>
                                <p className="text-xs font-serif font-bold text-[#800000]">
                                  {item.priceFormatted}
                                  {item.originalPriceFormatted && (
                                    <span className="text-stone-400 line-through text-[11px] ml-2 font-sans font-normal">
                                      {item.originalPriceFormatted}
                                    </span>
                                  )}
                                </p>
                                <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>{t('Govt Lab Certified & Vedic Energized', 'सरकारी लैब प्रमाणित व अभिमंत्रित')}</span>
                                </p>
                              </div>
                            </div>

                            {/* Quantity Controls & Line Total */}
                            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                              <div className="flex items-center gap-2 bg-stone-100 rounded-full p-1 border border-stone-300">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-7 h-7 rounded-full bg-white text-stone-700 flex items-center justify-center hover:bg-amber-100 transition-colors cursor-pointer shadow-xs disabled:opacity-40"
                                  disabled={item.quantity <= 1}
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="w-7 text-center font-bold text-sm text-stone-900">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-7 h-7 rounded-full bg-white text-stone-700 flex items-center justify-center hover:bg-amber-100 transition-colors cursor-pointer shadow-xs"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="text-right min-w-[90px]">
                                <span className="font-serif font-bold text-base text-[#800000]">
                                  ₹{lineTotal.toLocaleString('en-IN')}
                                </span>
                                <p className="text-[10px] text-stone-400">
                                  (₹{item.price.toLocaleString('en-IN')} × {item.quantity})
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="p-2 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Remove item"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-4 sm:p-6 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <Link
                        href="/products"
                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-700 hover:text-[#800000] transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>{t('Continue Shopping More Artifacts', 'और भी आध्यात्मिक सामग्री देखें')}</span>
                      </Link>

                      <button
                        type="button"
                        onClick={handleProceedToCheckout}
                        className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#5B0D15] hover:bg-[#72111c] text-amber-100 font-serif font-bold text-xs sm:text-sm shadow-xl shadow-rose-950/20 hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>{t('Proceed to Checkout', 'चेकआउट एवं संकल्प विवरण')}</span>
                        <ArrowRight className="w-4 h-4 text-amber-300" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ================= CHECKOUT ADDRESS FORM ================= */
                  <form
                    onSubmit={handleCreateOrder}
                    className="rounded-3xl bg-white border border-stone-200/90 shadow-2xl overflow-hidden p-6 sm:p-9 md:p-10 space-y-8 animate-fadeIn"
                  >
                    {/* Checkout Box Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-5">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300/80 text-amber-900 text-[11px] font-bold tracking-wider uppercase mb-1">
                          <PackageCheck className="w-3.5 h-3.5 text-amber-700" />
                          <span>{t('Secure Checkout • Step 2 of 2', 'सुरक्षित चेकआउट • चरण 2')}</span>
                        </div>
                        <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#4A151B]">
                          {t('Shipping & Delivery Address', 'सुरक्षित वितरण पता एवं संपर्क')}
                        </h2>
                        <p className="text-xs sm:text-sm text-stone-500">
                          {t('Enter your recipient details and verified delivery address for consecrated dispatch from Varanasi.', 'काशी से अभिमंत्रित आध्यात्मिक सामग्री की सुरक्षित डिलीवरी हेतु अपना पता दर्ज करें।')}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setStep('cart');
                          window.scrollTo({ top: 200, behavior: 'smooth' });
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 text-xs font-semibold cursor-pointer transition-all shrink-0 self-start sm:self-auto border border-stone-200"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>{t('Back to Cart Items', 'कार्ट पर वापस')}</span>
                      </button>
                    </div>

                    {/* Unauthenticated notice */}
                    {!authToken && (
                      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 text-xs shadow-xs">
                        <div className="flex items-center gap-2.5 text-amber-900">
                          <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                          <span className="font-medium">
                            {t(
                              'Please login to link this order with your Customer Dashboard and track shipment status.',
                              'कृपया अपने डैशबोर्ड में ऑर्डर ट्रैक करने के लिए लॉगिन करें।'
                            )}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAuthModalOpen(true)}
                          className="shrink-0 px-5 py-2 rounded-full bg-[#5B0D15] text-amber-100 font-semibold cursor-pointer text-xs hover:bg-[#72111c] transition-all shadow-md"
                        >
                          {t('Log In / Register', 'लॉग इन / पंजीकरण')}
                        </button>
                      </div>
                    )}

                    {submitError && (
                      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2.5 shadow-xs">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span className="font-medium">{submitError}</span>
                      </div>
                    )}

                    {/* SECTION 1: Recipient Information */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-stone-800 font-serif font-bold text-sm sm:text-base border-b border-stone-100 pb-2">
                        <User className="w-4 h-4 text-[#800000]" />
                        <span>{t('1. Recipient Contact Details', '1. प्राप्तकर्ता का विवरण')}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                        {/* Full Name */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-stone-700 block">
                            {t('Recipient Full Name *', 'प्राप्तकर्ता का पूरा नाम *')}
                          </label>
                          <input
                            type="text"
                            name="fullName"
                            value={shippingForm.fullName}
                            onChange={handleInputChange}
                            placeholder="e.g. Rahul Sharma"
                            className={`w-full text-xs sm:text-sm px-4 py-3 rounded-xl border focus:outline-none transition-all ${
                              formErrors.fullName
                                ? 'border-rose-400 bg-rose-50/50'
                                : 'border-stone-300 focus:border-[#5B0D15] focus:ring-2 focus:ring-amber-500/20 bg-stone-50/50 hover:bg-white'
                            }`}
                          />
                          {formErrors.fullName && <p className="text-[11px] text-rose-600 font-medium">{formErrors.fullName}</p>}
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-stone-700 block">
                            {t('WhatsApp / Mobile Number *', 'व्हाट्सएप / मोबाइल नंबर *')}
                          </label>
                          <div className="relative">
                            <input
                              type="tel"
                              name="phone"
                              value={shippingForm.phone}
                              onChange={handleInputChange}
                              placeholder="e.g. 9876543210"
                              maxLength={10}
                              className={`w-full text-xs sm:text-sm px-4 py-3 rounded-xl border focus:outline-none transition-all ${
                                formErrors.phone
                                  ? 'border-rose-400 bg-rose-50/50'
                                  : 'border-stone-300 focus:border-[#5B0D15] focus:ring-2 focus:ring-amber-500/20 bg-stone-50/50 hover:bg-white'
                              }`}
                            />
                          </div>
                          {formErrors.phone && <p className="text-[11px] text-rose-600 font-medium">{formErrors.phone}</p>}
                          <span className="text-[10px] text-stone-400 block">{t('Used for delivery SMS updates and courier OTP', 'कूरियर ट्रैकिंग व डिलीवरी अपडेट हेतु')}</span>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: Complete Delivery Address */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-stone-800 font-serif font-bold text-sm sm:text-base border-b border-stone-100 pb-2">
                        <MapPin className="w-4 h-4 text-[#800000]" />
                        <span>{t('2. Delivery Destination', '2. डिलीवरी का पता')}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                        {/* Street Address */}
                        <div className="sm:col-span-3 space-y-1.5">
                          <label className="text-xs font-semibold text-stone-700 block">
                            {t('Street Address & House / Flat No. *', 'घर का पता एवं गली / फ्लैट क्रमांक *')}
                          </label>
                          <input
                            type="text"
                            name="street"
                            value={shippingForm.street}
                            onChange={handleInputChange}
                            placeholder="e.g. Flat 302, Shanti Kunj Apartments, Kabir Nagar"
                            className={`w-full text-xs sm:text-sm px-4 py-3 rounded-xl border focus:outline-none transition-all ${
                              formErrors.street
                                ? 'border-rose-400 bg-rose-50/50'
                                : 'border-stone-300 focus:border-[#5B0D15] focus:ring-2 focus:ring-amber-500/20 bg-stone-50/50 hover:bg-white'
                            }`}
                          />
                          {formErrors.street && <p className="text-[11px] text-rose-600 font-medium">{formErrors.street}</p>}
                        </div>

                        {/* City */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-stone-700 block">
                            {t('City *', 'शहर *')}
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={shippingForm.city}
                            onChange={handleInputChange}
                            placeholder="e.g. Varanasi"
                            className={`w-full text-xs sm:text-sm px-4 py-3 rounded-xl border focus:outline-none transition-all ${
                              formErrors.city
                                ? 'border-rose-400 bg-rose-50/50'
                                : 'border-stone-300 focus:border-[#5B0D15] focus:ring-2 focus:ring-amber-500/20 bg-stone-50/50 hover:bg-white'
                            }`}
                          />
                          {formErrors.city && <p className="text-[11px] text-rose-600 font-medium">{formErrors.city}</p>}
                        </div>

                        {/* State */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-stone-700 block">
                            {t('State *', 'राज्य *')}
                          </label>
                          <input
                            type="text"
                            name="state"
                            value={shippingForm.state}
                            onChange={handleInputChange}
                            placeholder="e.g. Uttar Pradesh"
                            className={`w-full text-xs sm:text-sm px-4 py-3 rounded-xl border focus:outline-none transition-all ${
                              formErrors.state
                                ? 'border-rose-400 bg-rose-50/50'
                                : 'border-stone-300 focus:border-[#5B0D15] focus:ring-2 focus:ring-amber-500/20 bg-stone-50/50 hover:bg-white'
                            }`}
                          />
                          {formErrors.state && <p className="text-[11px] text-rose-600 font-medium">{formErrors.state}</p>}
                        </div>

                        {/* Postal Code */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-stone-700 block">
                            {t('PIN Code (6 digits) *', 'पिन कोड (6 अंक) *')}
                          </label>
                          <input
                            type="text"
                            name="postalCode"
                            value={shippingForm.postalCode}
                            onChange={handleInputChange}
                            placeholder="e.g. 221001"
                            maxLength={6}
                            className={`w-full text-xs sm:text-sm px-4 py-3 rounded-xl border focus:outline-none transition-all ${
                              formErrors.postalCode
                                ? 'border-rose-400 bg-rose-50/50'
                                : 'border-stone-300 focus:border-[#5B0D15] focus:ring-2 focus:ring-amber-500/20 bg-stone-50/50 hover:bg-white'
                            }`}
                          />
                          {formErrors.postalCode && <p className="text-[11px] text-rose-600 font-medium">{formErrors.postalCode}</p>}
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: Order Notes & Landmark */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-stone-700 flex items-center justify-between">
                        <span>{t('Delivery Instructions / Landmark (Optional)', 'वितरण निर्देश / निकटतम लैंडमार्क (ऐच्छिक)')}</span>
                        <span className="text-[10px] text-stone-400 font-normal">{t('Helps courier reach faster', 'कूरियर सहायता हेतु')}</span>
                      </label>
                      <textarea
                        name="notes"
                        rows={2}
                        value={shippingForm.notes}
                        onChange={handleInputChange}
                        placeholder={t('e.g. Near Vishwanath Temple gate, deliver after 2 PM', 'उदा. मुख्य मंदिर के निकट, दोपहर 2 बजे के बाद')}
                        className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border border-stone-300 focus:border-[#5B0D15] focus:ring-2 focus:ring-amber-500/20 bg-stone-50/50 hover:bg-white focus:outline-none transition-all"
                      />
                    </div>

                    {/* Security & Payment Assurance Banner */}
                    <div className="rounded-2xl bg-gradient-to-r from-amber-50 via-stone-50 to-amber-50/60 border border-amber-200/90 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-5 h-5 text-[#800000]" />
                        </div>
                        <div>
                          <p className="font-bold text-stone-900 text-xs sm:text-sm">
                            {t('100% Insured Consecrated Shipping', '100% सुरक्षित अभिमंत्रित पार्सल')}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            {t('Cash on Delivery (COD) & Online UPI options available upon arrival.', 'कैश ऑन डिलीवरी (COD) एवं ऑनलाइन UPI भुगतान उपलब्ध।')}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-300 shrink-0 self-start sm:self-auto">
                        ✓ {t('Free Delivery Across India', 'पूरे भारत में निःशुल्क डिलीवरी')}
                      </span>
                    </div>

                    {/* Submit Order Button */}
                    <div className="pt-2 space-y-2.5">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 sm:py-4.5 rounded-full bg-gradient-to-r from-[#5B0D15] via-[#73121D] to-[#480A10] hover:from-[#73121D] hover:to-[#5B0D15] text-amber-100 font-serif font-bold text-sm sm:text-base shadow-xl shadow-rose-950/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 border border-amber-400/40"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
                            <span>{t('Confirming Order with Kashi Acharyas...', 'ऑर्डर दर्ज किया जा रहा है...')}</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                            <span>
                              {t(
                                `Confirm Order • ₹${subtotal.toLocaleString('en-IN')}`,
                                `ऑर्डर पक्का करें • ₹${subtotal.toLocaleString('en-IN')}`
                              )}
                            </span>
                            <ArrowRight className="w-4 h-4 text-amber-300" />
                          </>
                        )}
                      </button>

                      <p className="text-[11px] text-center text-stone-500">
                        {t('Instant WhatsApp & Email booking acknowledgment will be dispatched upon confirmation.', 'ऑर्डर सबमिट होते ही व्हाट्सएप व ईमेल द्वारा तत्काल पावती प्रेषित की जाएगी।')}
                      </p>
                    </div>
                  </form>
                )}
              </div>

              {/* RIGHT COLUMN: Order Summary & Trust Badges */}
              <div className="lg:col-span-4 space-y-5">
                <div className="rounded-3xl bg-white border border-stone-200/90 shadow-xl p-5 sm:p-6 space-y-5 sticky top-24">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <h3 className="font-serif font-bold text-base sm:text-lg text-[#4A151B]">
                      {t('Order Summary', 'ऑर्डर सारांश')}
                    </h3>
                    <span className="text-[11px] font-semibold text-stone-500">
                      {totalCount} {totalCount === 1 ? t('item', 'वस्तु') : t('items', 'वस्तुएं')}
                    </span>
                  </div>

                  {/* Compact items list in Checkout step */}
                  {step === 'checkout' && items.length > 0 && (
                    <div className="space-y-3 pb-3 border-b border-stone-100 max-h-56 overflow-y-auto pr-1">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-11 h-11 rounded-xl object-cover border border-amber-200/90 shrink-0 bg-stone-100"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-serif font-bold text-stone-900 truncate">
                              {language === 'hi' && item.nameHi ? item.nameHi : item.name}
                            </p>
                            <p className="text-[11px] text-stone-500">
                              Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                            </p>
                          </div>
                          <span className="text-xs font-serif font-bold text-[#800000] shrink-0">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between text-stone-600">
                      <span>{t('Cart Subtotal', 'सामग्री उप-योग')}</span>
                      <span className="font-semibold text-stone-900 font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex items-center justify-between text-stone-600">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-amber-600" />
                        <span>{t('Express Consecrated Shipping', 'विशेष सुरक्षित कूरियर')}</span>
                      </span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                        {t('FREE', 'निःशुल्क')}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                      <span className="font-serif font-bold text-stone-900 text-sm">
                        {t('Total Payable', 'कुल देय राशि')}
                      </span>
                      <span className="font-serif font-bold text-xl text-[#800000]">
                        ₹{subtotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Trust guarantees */}
                  <div className="space-y-2.5 pt-2 border-t border-stone-100 text-[11px] text-stone-600">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{t('100% Genuine Gemstone Lab Certification', '100% शुद्ध प्रमाणित प्राकृतिक रत्न')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{t('Consecrated in Kashi with Vedic Mantras', 'काशी में वैदिक आचार्यों द्वारा सिद्ध')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{t('7-Day Replacement Guarantee', '7-दिवसीय सरल प्रतिस्थापन गारंटी')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Auth Modal for Unauthenticated Users */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setAuthToken(localStorage.getItem('astro_token'));
          setUserProfile(user);
          if (user?.name && !shippingForm.fullName) {
            setShippingForm((prev) => ({
              ...prev,
              fullName: user.name,
              sankalpName: prev.sankalpName || user.name,
            }));
          }
          setAuthModalOpen(false);
        }}
        initialMode="login"
      />

      <Footer />
    </div>
  );
}
