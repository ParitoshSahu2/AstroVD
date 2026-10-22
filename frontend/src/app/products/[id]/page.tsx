'use client';

import React, { useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Award,
  Star,
  CheckCircle2,
  Share2,
  Heart,
  Truck,
  RotateCcw,
  Compass,
  Sun,
  Info,
  Check,
  ShoppingCart,
  Plus,
  Minus,
  Zap,
  MapPin,
  Tag,
  CreditCard,
  Banknote,
  PackageCheck,
} from 'lucide-react';
import { Navbar } from '../../../components/Navbar';
import { Footer } from '../../../components/Footer';
import { PRODUCTS_CATALOG, getProductById, getRelatedProducts, ProductItem } from '../../../data/products';
import { fetchProductBySlug } from '../../../lib/productsApi';
import { useLanguage } from '../../../context/LanguageContext';

function ProductDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();

  const productId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';
  const [product, setProduct] = useState<any>(() => getProductById(productId));
  const [backendRelated, setBackendRelated] = useState<any[]>([]);

  React.useEffect(() => {
    if (!productId) return;
    fetchProductBySlug(productId, language === 'hi' ? 'hi' : 'en').then((res) => {
      if (res) {
        setProduct(res);
        if (res.relatedProducts) {
          setBackendRelated(res.relatedProducts);
        }
      }
    });
  }, [productId, language]);

  // E-Commerce States
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [pincode, setPincode] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState<{ checked: boolean; valid: boolean; text?: string } | null>(null);

  // Tabs & Checkout Modal States
  const [activeTab, setActiveTab] = useState<'ritual' | 'vidhi' | 'astrology' | 'certificate'>('ritual');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'success'>('form');
  const [customerName, setCustomerName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [userCity, setUserCity] = useState('');
  const [userPincode, setUserPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [placedOrderId, setPlacedOrderId] = useState('');

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-2xl mx-auto text-center px-4 py-24 space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-amber-900 border border-amber-300">
            <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#4A151B]">
            {t('Sacred Product Not Found', 'सिद्ध उत्पाद प्राप्त नहीं हुआ')}
          </h1>
          <p className="text-stone-600 text-sm">
            {t(
              'The sacred energized talisman or gemstone bracelet you are looking for might have been moved or consecrated under a different title.',
              'जिस सिद्ध उत्पाद को आप खोज रहे हैं वह उपलब्ध नहीं है अथवा किसी अन्य श्रेणी में स्थानांतरित कर दिया गया है।'
            )}
          </p>
          <div className="pt-4 flex items-center justify-center gap-4">
            <Link
              href="/products"
              className="px-6 py-3 rounded-full bg-[#5B0D15] text-amber-100 font-bold text-sm shadow-lg hover:bg-[#73121D] transition-all"
            >
              {t('Browse All Sacred Products', 'सभी सिद्ध उत्पाद देखें')}
            </Link>
            <Link
              href="/"
              className="px-6 py-3 rounded-full bg-white border border-stone-300 text-stone-700 font-bold text-sm hover:bg-stone-50"
            >
              {t('Return Home', 'मुख्य पृष्ठ पर लौटें')}
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedProducts = backendRelated.length > 0 ? backendRelated : getRelatedProducts(product.id, 4);

  const prodName = language === 'hi' && product.nameHi ? product.nameHi : product.name;
  const prodTag = language === 'hi' && product.tagHi ? product.tagHi : product.tag;
  const prodDesc = language === 'hi' && product.descHi ? product.descHi : product.desc;
  const planetVal = language === 'hi' && product.planetHi ? product.planetHi : product.planet;
  const chakraVal = language === 'hi' && product.chakraHi ? product.chakraHi : product.chakra;
  const dayVal = language === 'hi' && product.dayToWearHi ? product.dayToWearHi : product.dayToWear;
  const beadVal = language === 'hi' && product.beadSizeHi ? product.beadSizeHi : product.beadSize;

  // Numeric Calculations
  const numericPrice = typeof product.price === 'number'
    ? product.price
    : parseInt(String(product.price || '').replace(/[^0-9]/g, ''), 10) || 1299;
  const totalPrice = numericPrice * quantity;
  const formattedTotalPrice = `₹${totalPrice.toLocaleString('en-IN')}`;
  const displayPrice = product.priceFormatted || (typeof product.price === 'number' ? `₹${product.price.toLocaleString('en-IN')}` : product.price);
  const displayOriginalPrice = product.originalPriceFormatted || (typeof product.originalPrice === 'number' ? `₹${product.originalPrice.toLocaleString('en-IN')}` : product.originalPrice);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(10, prev + delta)));
  };

  const handleAddToCart = () => {
    setAddedToCart(true);
    try {
      const existing = localStorage.getItem('astro_cart_items');
      let items = existing ? JSON.parse(existing) : [];
      const itemIndex = items.findIndex((i: any) => i.id === product.id);
      if (itemIndex > -1) {
        items[itemIndex].quantity += quantity;
      } else {
        items.push({
          id: product.id,
          name: prodName,
          price: displayPrice,
          unitPrice: numericPrice,
          image: product.image,
          quantity: quantity,
        });
      }
      localStorage.setItem('astro_cart_items', JSON.stringify(items));
      window.dispatchEvent(new CustomEvent('astro-cart-update', { detail: items }));
    } catch (e) {
      // ignore storage error
    }
    setTimeout(() => setAddedToCart(false), 2200);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: prodName,
          text: `Check out ${prodName} on AstroVD`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Product link copied to clipboard!');
    }
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pincode.trim();
    if (!cleanPin || cleanPin.length !== 6 || isNaN(Number(cleanPin))) {
      setDeliveryInfo({
        checked: true,
        valid: false,
        text: t('Please enter a valid 6-digit Indian PIN code.', 'कृपया 6 अंकों का मान्य पिन कोड दर्ज करें।'),
      });
      return;
    }
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    const dateStr = deliveryDate.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', options);

    setDeliveryInfo({
      checked: true,
      valid: true,
      text:
        language === 'hi'
          ? `अनुमानित डिलीवरी: ${dateStr} तक | निःशुल्क एक्सप्रेस डिलीवरी | कैश ऑन डिलीवरी (COD) उपलब्ध`
          : `FREE Delivery by ${dateStr} | Cash on Delivery (COD) Available`,
    });
  };

  const handleDirectCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !userPhone.trim() || !userAddress.trim() || !userPincode.trim()) {
      alert(t('Please fill all required shipping details.', 'कृपया सभी आवश्यक वितरण विवरण भरें।'));
      return;
    }
    const newOrderId = `ASTRO-${Math.floor(100000 + Math.random() * 900000)}`;
    setPlacedOrderId(newOrderId);
    setCheckoutStep('success');
  };

  return (
    <div className="relative min-h-screen w-full bg-[#FAF7F2] m-0 p-0 overflow-x-hidden selection:bg-amber-400">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-28 sm:pt-32 pb-16 space-y-16">
        
        {/* Main Product Showcase: 2-Column High-End Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: Clean Product Image Frame & 4 Trust Micro-Badges */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Main Product Image Frame */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-300/90 bg-white group">
              {/* Lab Certified Badge Top-Left */}
              <div className="absolute top-5 left-5 z-20 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/85 backdrop-blur-md border border-emerald-400/80 text-emerald-300 text-[11px] font-bold shadow-md">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('Govt Lab Certified 100% Genuine', '100% प्रामाणिक लैब प्रमाणित')}</span>
              </div>

              {/* Floating Action Icons Top-Right */}
              <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`w-9 h-9 rounded-full backdrop-blur-md border flex items-center justify-center transition-all cursor-pointer ${
                    isLiked
                      ? 'bg-rose-500 text-white border-rose-400 shadow-md'
                      : 'bg-black/50 text-stone-200 border-white/20 hover:text-white'
                  }`}
                  title="Save to Favorites"
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-stone-200 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                  title="Share Product"
                  aria-label="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Product Image */}
              <div className="relative h-[420px] sm:h-[480px] w-full overflow-hidden bg-stone-50 flex items-center justify-center">
                <img
                  src={product.image}
                  alt={prodName}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
            </div>

            {/* 4 Trust Micro-Badges */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-amber-200/80 shadow-sm flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-[#5B0D15] flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-stone-900">{t('100% Untreated Stone', '100% प्राकृतिक रत्न')}</h4>
                  <p className="text-[10px] text-stone-500">{t('Zero synthetic glass', 'शून्य मिलावट')}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-amber-200/80 shadow-sm flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-[#5B0D15] flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-stone-900">{t('Free Insured Shipping', 'निःशुल्क सुरक्षित वितरण')}</h4>
                  <p className="text-[10px] text-stone-500">{t('Pan India & Fast Dispatch', 'पूरे भारत में तीव्र डिलीवरी')}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-amber-200/80 shadow-sm flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-[#5B0D15] flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-stone-900">{t('7 Days Replacement', '7 दिन में वापसी / प्रतिस्थापन')}</h4>
                  <p className="text-[10px] text-stone-500">{t('Hassle-free guarantee', 'सरल व सुरक्षित नीति')}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-amber-200/80 shadow-sm flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-[#5B0D15] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-stone-900">{t('Govt Lab Certificate', 'सरकारी लैब प्रमाण-पत्र')}</h4>
                  <p className="text-[10px] text-stone-500">{t('Included in the box', 'पार्सल के साथ सम्मिलित')}</p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Product Attributes, Quantity Selector & E-Commerce Action Buttons */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header Details */}
            <div className="space-y-3 pb-4 border-b border-stone-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold tracking-[0.2em] text-[#800000] uppercase bg-amber-100/80 px-3 py-1 rounded-full border border-amber-300">
                  {prodTag}
                </span>

                <div className="flex items-center gap-1.5 text-xs text-stone-600">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="font-bold text-stone-900">{product.rating}</span>
                  <span className="text-stone-400">({product.reviewsCount} {t('reviews', 'समीक्षाएं')})</span>
                </div>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A151B] leading-tight">
                {prodName}
              </h1>

              {/* Price Row */}
              <div className="flex flex-wrap items-baseline gap-3 pt-1">
                <span className="font-serif text-3xl sm:text-4xl font-bold text-[#800000]">
                  {displayPrice}
                </span>
                <span className="text-stone-400 line-through text-base sm:text-lg">
                  {displayOriginalPrice}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {t('Save 48% Today', '48% छूट')}
                </span>
                <span className="text-[11px] text-stone-500 sm:ml-auto">
                  {t('Inclusive of All Taxes', 'सभी कर सम्मिलित')}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pt-2">
                {prodDesc}
              </p>
            </div>

            {/* Astrological Alignments 4-Card Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 shadow-sm text-center space-y-1">
                <div className="w-8 h-8 mx-auto rounded-full bg-amber-200/60 text-[#800000] flex items-center justify-center">
                  <Sun className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase font-bold text-stone-500 block">
                  {t('Ruling Planet', 'स्वामी ग्रह')}
                </span>
                <span className="font-serif font-bold text-xs text-stone-900 block truncate">
                  {planetVal}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 shadow-sm text-center space-y-1">
                <div className="w-8 h-8 mx-auto rounded-full bg-amber-200/60 text-[#800000] flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase font-bold text-stone-500 block">
                  {t('Active Chakra', 'सक्रिय चक्र')}
                </span>
                <span className="font-serif font-bold text-xs text-stone-900 block truncate">
                  {chakraVal}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 shadow-sm text-center space-y-1">
                <div className="w-8 h-8 mx-auto rounded-full bg-amber-200/60 text-[#800000] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase font-bold text-stone-500 block">
                  {t('Auspicious Day', 'शुभ धारण वार')}
                </span>
                <span className="font-serif font-bold text-xs text-stone-900 block truncate">
                  {dayVal}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 shadow-sm text-center space-y-1">
                <div className="w-8 h-8 mx-auto rounded-full bg-amber-200/60 text-[#800000] flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase font-bold text-stone-500 block">
                  {t('Bead Size', 'मनका विवरण')}
                </span>
                <span className="font-serif font-bold text-xs text-stone-900 block truncate">
                  {beadVal}
                </span>
              </div>
            </div>

            {/* Quantity Selector Section */}
            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-stone-800 block">
                    {t('Quantity:', 'मात्रा:')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-semibold text-emerald-700">
                      {t('In Stock • Ready to Dispatch', 'उपलब्ध है • प्रेषण हेतु तैयार')}
                    </span>
                  </div>
                </div>

                {/* - 1 + Quantity Buttons */}
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center rounded-xl border-2 border-stone-300 bg-stone-50 overflow-hidden shadow-inner">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center text-stone-700 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold text-base cursor-pointer"
                      title="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-bold text-stone-900 text-sm select-none">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= 10}
                      className="w-10 h-10 flex items-center justify-center text-stone-700 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold text-base cursor-pointer"
                      title="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-stone-500 block uppercase tracking-wider">{t('Subtotal', 'कुल योग')}</span>
                    <span className="font-serif font-bold text-lg text-[#800000]">{formattedTotalPrice}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Primary E-Commerce Action Buttons: Add to Cart, Buy Now, Wishlist */}
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* 1. Add to Cart Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`sm:col-span-6 py-4 px-5 rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer border-2 ${
                    addedToCart
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'bg-white border-[#5B0D15] text-[#5B0D15] hover:bg-[#5B0D15]/5 hover:shadow-lg'
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <Check className="w-5 h-5 stroke-[2.5]" />
                      <span>{t('Added to Cart ✓', 'कार्ट में जोड़ा गया ✓')}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>{t('Add to Cart', 'कार्ट में जोड़ें')}</span>
                    </>
                  )}
                </button>

                {/* 2. Buy Now Button */}
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(true)}
                  className="sm:col-span-6 py-4 px-5 rounded-2xl bg-gradient-to-r from-[#5B0D15] via-[#73121D] to-[#480A10] hover:from-[#73121D] hover:to-[#5B0D15] text-amber-100 font-bold text-sm shadow-xl shadow-rose-950/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer border border-amber-400/60"
                >
                  <Zap className="w-5 h-5 fill-amber-300 text-amber-300" />
                  <span>{t('Buy Now', 'अभी खरीदें')}</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </button>
              </div>

              {/* Wishlist and Share Secondary Bar */}
              <div className="flex items-center justify-between text-xs pt-1 px-1 text-stone-600">
                <button
                  type="button"
                  onClick={() => setIsLiked(!isLiked)}
                  className="inline-flex items-center gap-1.5 hover:text-[#5B0D15] font-semibold transition-colors cursor-pointer"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}`} />
                  <span>{isLiked ? t('Saved in Wishlist', 'विशलिस्ट में सुरक्षित') : t('Add to Wishlist', 'विशलिस्ट में जोड़ें')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 hover:text-[#5B0D15] font-semibold transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-stone-400" />
                  <span>{t('Share with Friends', 'मित्रों से साझा करें')}</span>
                </button>
              </div>
            </div>

            {/* Pincode Delivery Estimator */}
            <div className="rounded-2xl bg-white border border-stone-200 p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-stone-800 text-xs font-bold">
                <MapPin className="w-4 h-4 text-[#800000]" />
                <span>{t('Check Delivery & Cash on Delivery Availability:', 'डिलीवरी एवं कैश ऑन डिलीवरी जांचें:')}</span>
              </div>

              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder={t('Enter 6-digit Pincode (e.g. 110001)', '6 अंकों का पिनकोड दर्ज करें')}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-[#5B0D15] bg-stone-50"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#5B0D15] hover:bg-[#73121D] text-amber-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  {t('Check', 'जांचें')}
                </button>
              </form>

              {deliveryInfo && deliveryInfo.checked && (
                <div
                  className={`p-2.5 rounded-xl text-xs flex items-start gap-2 animate-fadeIn ${
                    deliveryInfo.valid ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {deliveryInfo.valid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{deliveryInfo.text}</span>
                </div>
              )}
            </div>

            {/* E-Commerce Offers Strip */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-stone-800">
                <Tag className="w-4 h-4 text-[#800000] shrink-0" />
                <span>
                  <strong>{t('Special Offer:', 'विशेष ऑफर:')}</strong>{' '}
                  {t('Use code ASTRO10 for extra 10% instant discount at checkout.', 'चेकआउट पर ASTRO10 कूपन से 10% अतिरिक्त छूट पाएं।')}
                </span>
              </div>
              <div className="text-[11px] text-[#5B0D15] font-bold shrink-0">
                {t('Verified Authentic', '100% प्रामाणिक')}
              </div>
            </div>

            {/* Pandit Ji Guidance consultation helper */}
            <div className="p-3.5 rounded-2xl bg-white border border-stone-200 flex items-center justify-between gap-3 text-xs shadow-sm">
              <div className="flex items-center gap-2 text-stone-700">
                <Info className="w-4 h-4 text-[#800000] shrink-0" />
                <span>
                  {t(
                    'Need help choosing based on your Janam Kundli? Talk to our astrologer.',
                    'कुंडली अनुसार सही रत्न चुनने में सहायता चाहिए? ज्योतिषाचार्य से परामर्श लें।'
                  )}
                </span>
              </div>
              <Link
                href="/appointment"
                className="shrink-0 px-3.5 py-1.5 rounded-full bg-[#5B0D15] text-amber-100 font-bold text-[11px] hover:bg-[#73121D] transition-colors"
              >
                {t('Consult Pandit Ji', 'परामर्श लें')}
              </Link>
            </div>

          </div>
        </div>

        {/* Detailed Vedic Knowledge Center: 4 Comprehensive Tabs */}
        <div className="rounded-3xl bg-white border border-stone-200 shadow-xl overflow-hidden">
          
          {/* Tab Navigation */}
          <div className="flex border-b border-stone-200 overflow-x-auto bg-stone-50/80 scrollbar-none">
            <button
              onClick={() => setActiveTab('ritual')}
              className={`px-6 py-4 font-serif font-bold text-xs sm:text-sm whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                activeTab === 'ritual'
                  ? 'border-[#5B0D15] text-[#5B0D15] bg-white'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              {t('1. Prana Pratishtha Ritual (काशी संकल्प)', '1. काशी प्राण-प्रतिष्ठा विधि')}
            </button>
            <button
              onClick={() => setActiveTab('vidhi')}
              className={`px-6 py-4 font-serif font-bold text-xs sm:text-sm whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                activeTab === 'vidhi'
                  ? 'border-[#5B0D15] text-[#5B0D15] bg-white'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              {t('2. How to Wear & Sacred Vidhi', '2. धारण विधि एवं नियम')}
            </button>
            <button
              onClick={() => setActiveTab('astrology')}
              className={`px-6 py-4 font-serif font-bold text-xs sm:text-sm whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                activeTab === 'astrology'
                  ? 'border-[#5B0D15] text-[#5B0D15] bg-white'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              {t('3. Astrological & Kundli Remedies', '3. ज्योतिषीय महत्व व लाभ')}
            </button>
            <button
              onClick={() => setActiveTab('certificate')}
              className={`px-6 py-4 font-serif font-bold text-xs sm:text-sm whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                activeTab === 'certificate'
                  ? 'border-[#5B0D15] text-[#5B0D15] bg-white'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              {t('4. Lab Certification & Authenticity', '4. सरकारी लैब प्रमाण-पत्र')}
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="p-6 sm:p-10 text-stone-700 leading-relaxed text-xs sm:text-sm">
            
            {/* TAB 1: RITUAL */}
            {activeTab === 'ritual' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="max-w-3xl space-y-2">
                  <h3 className="font-serif text-2xl font-bold text-[#4A151B]">
                    {t('How Your Talisman is Consecrated in Varanasi', 'काशी में आपके सिद्ध ब्रेसलेट की प्राण-प्रतिष्ठा कैसे होती है?')}
                  </h3>
                  <p className="text-stone-600 text-xs sm:text-sm">
                    {t(
                      'In Vedic metaphysics, an untreated crystal is a dormant receiver of cosmic energy. It only begins vibrating with your bio-field after undergoing systematic Prana-Pratishtha.',
                      'वैदिक शास्त्रानुसार कोई भी रत्न तब तक सुप्त रहता है जब तक उसमें वैदिक मंत्रों द्वारा प्राण-प्रतिष्ठा न की जाए। AstroVD में प्रत्येक उत्पाद का व्यक्तिगत अनुष्ठान किया जाता है।'
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-amber-200/90 space-y-2">
                    <span className="w-7 h-7 rounded-full bg-[#5B0D15] text-amber-100 font-serif font-bold text-xs flex items-center justify-center">
                      1
                    </span>
                    <h4 className="font-serif font-bold text-stone-900 text-sm">
                      {t('Ganga Jal & Shuddhi', 'गंगा जल एवं शुद्धि')}
                    </h4>
                    <p className="text-xs text-stone-600">
                      {t(
                        'Purified with holy Ganges water, raw milk, honey, and sacred basil leaves to clear terrestrial transit residues.',
                        'काशी के पवित्र गंगाजल व पंचामृत द्वारा पाषाण के सभी भौतिक संदूषणों का निवारण।'
                      )}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-amber-200/90 space-y-2">
                    <span className="w-7 h-7 rounded-full bg-[#5B0D15] text-amber-100 font-serif font-bold text-xs flex items-center justify-center">
                      2
                    </span>
                    <h4 className="font-serif font-bold text-stone-900 text-sm">
                      {t('Planetary Beej Mantra', 'ग्रह बीज मंत्र जप')}
                    </h4>
                    <p className="text-xs text-stone-600">
                      {t(
                        `Infused with 1008 repetitions of ${product.mantra} under the supervision of Vedic scholars.`,
                        `संबंधित ग्रह के अभीष्ट 1008 मंत्रों से रत्न के आंतरिक चक्रों का जाग्रतिकरण।`
                      )}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-amber-200/90 space-y-2">
                    <span className="w-7 h-7 rounded-full bg-[#5B0D15] text-amber-100 font-serif font-bold text-xs flex items-center justify-center">
                      3
                    </span>
                    <h4 className="font-serif font-bold text-stone-900 text-sm">
                      {t('Gotra & Name Sankalp', 'नाम व गोत्र संकल्प')}
                    </h4>
                    <p className="text-xs text-stone-600">
                      {t(
                        'Personalized with your specific Gotra, Janam Rashi, and life intention before the sacred fire (Havan).',
                        'यज्ञ की पावन अग्नि के समक्ष आपके नाम, गोत्र व नक्षत्र का शास्त्रोक्त संकल्प।'
                      )}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-amber-200/90 space-y-2">
                    <span className="w-7 h-7 rounded-full bg-[#5B0D15] text-amber-100 font-serif font-bold text-xs flex items-center justify-center">
                      4
                    </span>
                    <h4 className="font-serif font-bold text-stone-900 text-sm">
                      {t('Aura Shield Packaging', 'ऊर्जा सुरक्षित पैकेजिंग')}
                    </h4>
                    <p className="text-xs text-stone-600">
                      {t(
                        'Hermetically sealed in a consecrated pouch with energized Akshat (sacred rice) & Chandan for transit.',
                        'अभिमंत्रित अक्षत व कुमकुम सहित विशेष नकारात्मकता रोधी आवरण में सुरक्षित सील।'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: VIDHI */}
            {activeTab === 'vidhi' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="max-w-3xl space-y-2">
                  <h3 className="font-serif text-2xl font-bold text-[#4A151B]">
                    {t('Step-by-Step Wearing Vidhi & Guidelines', 'धारण विधि, शुभ मुहूर्त एवं शास्त्रीय नियम')}
                  </h3>
                  <p className="text-stone-600 text-xs sm:text-sm">
                    {t(
                      'Follow these sacred rules when unboxing and first wearing your bracelet to lock in its spiritual efficacy.',
                      'पार्सल प्राप्त होने के उपरांत प्रथम बार धारण करते समय इन नियमों का पालन करें।'
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-stone-200 space-y-3">
                    <h4 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-600" />
                      <span>{t('Right Hand vs Left Hand Rule', 'दायां हाथ बनाम बायां हाथ सिद्धांत')}</span>
                    </h4>
                    <ul className="space-y-2 text-xs text-stone-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>{t('Wear on Right Hand:', 'दाहिने हाथ में धारण करें:')}</strong> {t('If your goal is outward manifestation — wealth accumulation, sales closing, leadership, confidence, and career victory.', 'यदि आपका उद्देश्य धन आकर्षण, व्यापार वृद्धि, आत्मविश्वास व कार्यक्षेत्र में सफलता पाना है।')}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>{t('Wear on Left Hand:', 'बाएं हाथ में धारण करें:')}</strong> {t('If your goal is receptive healing — anxiety reduction, Nazar dosha shield, restful sleep, emotional soothing, and marital love.', 'यदि आपका उद्देश्य मानसिक शांति, बुरी नज़र से रक्षा, भावनात्मक संतुलन एवं आंतरिक आरोग्य पाना है।')}
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-stone-200 space-y-3">
                    <h4 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>{t('Initial Unboxing & Wearing Ritual', 'प्रथम धारण की संक्षिप्त पूजा विधि')}</span>
                    </h4>
                    <ol className="space-y-2 text-xs text-stone-600 list-decimal pl-4">
                      <li>{t('Take bath on the prescribed auspicious day (e.g. Sunday or Tuesday morning) and wear clean clothes.', 'शुभ वार को प्रातः स्नान उपरांत स्वच्छ वस्त्र धारण करें।')}</li>
                      <li>{t('Sit facing East towards the rising Sun in a calm meditative posture.', 'पूर्व दिशा की ओर मुख कर शांतिपूर्वक बैठें।')}</li>
                      <li>{t('Light an incense stick or Diya; wash bracelet gently with a few drops of clean water or Ganga Jal.', 'धूप-दीप प्रज्वलित कर ब्रेसलेट पर गंगाजल छिड़कें।')}</li>
                      <li>{t(`Hold in hands and chant: "${product.mantra}" 11 or 21 times with your Sankalp.`, `हाथ में रखकर अपने संकल्प सहित 11 या 21 बार मंत्र का स्मरण करें।`)}</li>
                      <li>{t('Wear on your chosen wrist with reverence.', 'श्रद्धापूर्वक कलाई में धारण करें।')}</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ASTROLOGY */}
            {activeTab === 'astrology' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="max-w-3xl space-y-2">
                  <h3 className="font-serif text-2xl font-bold text-[#4A151B]">
                    {t('Astrological Kundli Resonance & Planetary Balance', 'कुंडली के ग्रह दोषों का शमन एवं ग्रहीय प्रभाव')}
                  </h3>
                  <p className="text-stone-600 text-xs sm:text-sm">
                    {t(
                      'Gemstones and sacred crystals interact directly with planetary transits, Antardashas, and auric frequencies.',
                      'रत्न व क्रिस्टल सीधे तौर पर आपकी महादशा, अंतर्दशा एवं ग्रहीय गोचर के नकारात्मक प्रभावों को संतुलित करते हैं।'
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                    <span className="text-[11px] font-bold text-[#800000] uppercase tracking-wider block">
                      {t('Afflicted Planets Pacified', 'शांत होने वाले ग्रह')}
                    </span>
                    <p className="font-serif font-bold text-stone-900 text-base">{planetVal}</p>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {t(
                        'Strengthens benefics and neutralizes malefic transit obstacles in horoscope houses.',
                        'कुंडली के पीड़ित भावों को ऊर्जावान बनाकर कार्यों की रुकावटें दूर करता है।'
                      )}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                    <span className="text-[11px] font-bold text-[#800000] uppercase tracking-wider block">
                      {t('Resonating Chakra', 'सक्रिय चक्र')}
                    </span>
                    <p className="font-serif font-bold text-stone-900 text-base">{chakraVal}</p>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {t(
                        'Clears stagnant blockages in the energy meridians, elevating focus, vitality, and willpower.',
                        'ऊर्जा केंद्रों की रुकावटें खोलकर संकल्पशक्ति और मानसिक दृढ़ता में वृद्धि करता है।'
                      )}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                    <span className="text-[11px] font-bold text-[#800000] uppercase tracking-wider block">
                      {t('Recommended For', 'किसके लिए सर्वोत्तम')}
                    </span>
                    <p className="font-serif font-bold text-stone-900 text-base">{product.categoryLabel}</p>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {t(
                        'Ideal for professionals, entrepreneurs, and seekers experiencing blockages in career, money, or peace.',
                        'व्यापारी वर्ग, नौकरीपेशा एवं विद्यार्थी जो मानसिक या आर्थिक बाधा का सामना कर रहे हैं।'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: CERTIFICATE */}
            {activeTab === 'certificate' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="max-w-3xl space-y-2">
                  <h3 className="font-serif text-2xl font-bold text-[#4A151B]">
                    {t('Government Recognized Laboratory Certification', 'सरकारी मान्यता प्राप्त लैब प्रमाण-पत्र की प्रामाणिकता')}
                  </h3>
                  <p className="text-stone-600 text-xs sm:text-sm">
                    {t(
                      'Every single piece in the AstroVD sacred store is subjected to multi-point gemological spectroscopic verification before consecration.',
                      'AstroVD का प्रत्येक मनका और रत्न प्रयोगशाला द्वारा भौतिक व रासायनिक दृष्टि से परीक्षित है।'
                    )}
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-amber-50/90 border-2 border-amber-300 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>{t('Physical Certificate Included', 'मूल प्रमाण-पत्र संलग्न')}</span>
                    </div>
                    <h4 className="font-serif font-bold text-stone-900 text-lg">
                      {t('Certificate of Authenticity', 'प्रामाणिकता प्रमाण-पत्र')}
                    </h4>
                    <p className="text-xs text-stone-600">
                      {t(
                        'Contains unique Certificate Number, Microscopic magnification photos, Specific Gravity, and Refractive Index.',
                        'विशिष्ट प्रमाण-पत्र संख्या, सूक्ष्मदर्शी चित्र, आपेक्षिक घनत्व एवं अपवर्तनांक रिपोर्ट सहित।'
                      )}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-amber-200 text-xs space-y-2 shadow-sm">
                    <div className="flex justify-between border-b border-stone-100 pb-1">
                      <span className="text-stone-500">{t('Mineral Family:', 'खनिज वर्ग:')}</span>
                      <span className="font-bold text-stone-900">{t('Natural Earth Mineral', 'प्राकृतिक खनिज')}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-100 pb-1">
                      <span className="text-stone-500">{t('Treatment:', 'शोधन/उपचार:')}</span>
                      <span className="font-bold text-emerald-700">{t('Unheated & Untreated (Natural)', 'अकृत्रिम व शुद्ध')}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-100 pb-1">
                      <span className="text-stone-500">{t('Consecration Place:', 'प्राण प्रतिष्ठा स्थल:')}</span>
                      <span className="font-bold text-stone-900">Varanasi (Kashi), India</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">{t('Verification:', 'सत्यापन:')}</span>
                      <span className="font-bold text-stone-900">{t('QR Verifiable Online', 'ऑनलाइन सत्यापन योग्य')}</span>
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 mx-auto rounded-full bg-[#5B0D15] text-amber-200 flex items-center justify-center shadow-lg">
                      <Award className="w-8 h-8" />
                    </div>
                    <p className="text-[11px] font-bold text-stone-900 uppercase tracking-wider">
                      {t('100% Money Back Authenticity Guarantee', '100% प्रामाणिकता गारंटी')}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Customer Reviews & Real Testimonials */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold tracking-widest text-[#800000] uppercase">
                {t('REAL WEARER EXPERIENCES', 'सत्यापित अनुभव')}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A151B]">
                {t('Vedic Experiences & Customer Blessings', 'भक्तों एवं साधकों के अनुभव')}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-serif text-2xl font-bold text-[#4A151B]">4.9 / 5.0</div>
                <div className="text-[11px] text-stone-500">{t('Based on 340+ Consecrated Orders', '340+ संकल्पित ऑर्डर्स पर आधारित')}</div>
              </div>
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-[11px] text-stone-400">12 days ago</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                "{t(
                  'The vibrational difference between a market stone and this consecrated bracelet is night and day. The custom Gotra sankalp letter included in the parcel gave me chills. Tremendous peace in my business dealings since wearing.',
                  'बाजार के सामान्य ब्रेसलेट और इस काशी सिद्ध ब्रेसलेट में जमीन-आसमान का अंतर है। पार्सल में मेरे गोत्र का संकल्प पत्र भी था। व्यापार में रुकावटें दूर हुई हैं।'
                )}"
              </p>
              <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
                <div className="w-7 h-7 rounded-full bg-amber-100 text-[#5B0D15] font-bold text-xs flex items-center justify-center">
                  R
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Rajesh Sharma</h4>
                  <p className="text-[10px] text-emerald-700 font-medium">✓ Verified Wearer • Mumbai</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-[11px] text-stone-400">3 weeks ago</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                "{t(
                  'Dr. Pandit Vishal Dubey recommended this for my Rahu transit. Within 2 weeks of wearing on my right wrist, the constant heavy mental clouding lifted. Lab certificate was 100% genuine.',
                  'पंडित जी ने राहु दशा के लिए यह धारण करने की सलाह दी थी। 2 सप्ताह में ही मानसिक तनाव बहुत कम हो गया। लैब सर्टिफिकेट भी साथ मिला।'
                )}"
              </p>
              <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
                <div className="w-7 h-7 rounded-full bg-amber-100 text-[#5B0D15] font-bold text-xs flex items-center justify-center">
                  P
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Pooja Nair</h4>
                  <p className="text-[10px] text-emerald-700 font-medium">✓ Verified Wearer • Bengaluru</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-[11px] text-stone-400">1 month ago</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                "{t(
                  'Packaging with Ganga Jal and Akshat was divine. The beads have a deep natural luster with genuine inclusions. Highly recommend to everyone looking for true Vedic energization.',
                  'पैकेजिंग में गंगाजल व सिद्ध अक्षत देखकर हृदय प्रसन्न हो गया। मनकों की चमक और ऊर्जा अद्भुत है।'
                )}"
              </p>
              <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
                <div className="w-7 h-7 rounded-full bg-amber-100 text-[#5B0D15] font-bold text-xs flex items-center justify-center">
                  A
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Amitabh Verma</h4>
                  <p className="text-[10px] text-emerald-700 font-medium">✓ Verified Wearer • New Delhi</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related & Complimentary Sacred Talismans */}
        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold tracking-widest text-[#800000] uppercase">
                {t('COMPLETE YOUR PLANETARY SHIELD', 'पूरक सिद्ध उत्पाद')}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A151B]">
                {t('Complementary Consecrated Bracelets', 'संबंधित आध्यात्मिक रत्न व ब्रेसलेट')}
              </h3>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#5B0D15] hover:text-[#73121D] transition-colors"
            >
              <span>{t('View All in Store', 'स्टोर में सभी देखें')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => {
              const relName = language === 'hi' && rel.nameHi ? rel.nameHi : rel.name;
              const relTag = language === 'hi' && rel.tagHi ? rel.tagHi : rel.tag;

              return (
                <Link
                  key={rel.id}
                  href={`/products/${rel.id}`}
                  className="group rounded-3xl overflow-hidden bg-white border border-amber-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between"
                >
                  <div className="relative h-64 w-full bg-stone-950 overflow-hidden">
                    <img
                      src={rel.image}
                      alt={relName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-400/60 text-amber-200 font-serif font-bold text-xs">
                      {rel.price}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <span className="text-[10px] font-bold text-[#800000] uppercase tracking-wider block truncate">
                      {relTag}
                    </span>
                    <h4 className="font-serif font-bold text-stone-900 text-sm group-hover:text-[#5B0D15] transition-colors truncate">
                      {relName}
                    </h4>
                    <div className="flex items-center justify-end text-xs pt-1 border-t border-stone-100">
                      <span className="text-[#5B0D15] font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                        <span>{t('Details', 'विवरण')}</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      </main>

      {/* Complete E-Commerce Direct Checkout Modal */}
      {showCheckoutModal && (
        <div
          onClick={() => setShowCheckoutModal(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-3xl bg-[#FAF7F2] border-2 border-amber-400 shadow-2xl p-6 sm:p-8 space-y-5 my-8"
          >
            {checkoutStep === 'form' ? (
              <form onSubmit={handleDirectCheckout} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-amber-200">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-[#800000] uppercase">
                      {t('SECURE CHECKOUT', 'सुरक्षित चेकआउट')}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-[#4A151B]">
                      {t('Express Order Booking', 'त्वरित ऑर्डर बुकिंग')}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCheckoutModal(false)}
                    className="w-8 h-8 rounded-full bg-stone-200 text-stone-700 hover:bg-stone-300 flex items-center justify-center cursor-pointer font-bold text-sm"
                  >
                    ✕
                  </button>
                </div>

                {/* Order Summary Box */}
                <div className="p-3.5 rounded-2xl bg-white border border-amber-200 flex items-center gap-3">
                  <img
                    src={product.image}
                    alt={prodName}
                    className="w-14 h-14 rounded-xl object-cover border border-amber-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-bold text-xs text-stone-900 truncate">{prodName}</h4>
                    <p className="text-[10px] text-stone-500">{t('Qty:', 'मात्रा:')} {quantity}</p>
                    <p className="text-[10px] text-emerald-700 font-semibold">{t('Delivery: FREE Insured Express', 'डिलीवरी: निःशुल्क सुरक्षित')}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-stone-400 block">{t('Total', 'कुल राशि')}</span>
                    <span className="font-serif font-bold text-base text-[#800000]">{formattedTotalPrice}</span>
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      {t('Full Name *', 'पूरा नाम *')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t('Enter your full name', 'अपना पूरा नाम दर्ज करें')}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      {t('Mobile Number (For Courier Tracking & Updates) *', 'मोबाइल नंबर (कूरियर ट्रैकिंग हेतु) *')}
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder={t('10-digit mobile number', '10 अंकों का मोबाइल नंबर')}
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      {t('Complete Street Address *', 'पूरा डाक / डिलीवरी पता *')}
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder={t('House / Flat No., Apartment / Street, Landmark', 'मकान नं, फ्लैट, गली / मार्ग, लैंडमार्क')}
                      value={userAddress}
                      onChange={(e) => setUserAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        {t('City / Town *', 'शहर *')}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={t('City', 'शहर')}
                        value={userCity}
                        onChange={(e) => setUserCity(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        {t('PIN Code *', 'पिन कोड *')}
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="PIN Code"
                        value={userPincode}
                        onChange={(e) => setUserPincode(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="block font-bold text-stone-700 mb-1.5">
                      {t('Select Payment Method *', 'भुगतान विधि चुनें *')}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label
                        className={`p-3 rounded-xl border-2 flex items-center gap-2 cursor-pointer transition-all ${
                          paymentMethod === 'cod'
                            ? 'border-[#5B0D15] bg-[#5B0D15]/5 text-[#5B0D15] font-bold'
                            : 'border-stone-200 bg-white text-stone-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="accent-[#5B0D15]"
                        />
                        <Banknote className="w-4 h-4 shrink-0" />
                        <span className="text-[11px]">{t('Cash on Delivery', 'कैश ऑन डिलीवरी')}</span>
                      </label>

                      <label
                        className={`p-3 rounded-xl border-2 flex items-center gap-2 cursor-pointer transition-all ${
                          paymentMethod === 'online'
                            ? 'border-[#5B0D15] bg-[#5B0D15]/5 text-[#5B0D15] font-bold'
                            : 'border-stone-200 bg-white text-stone-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="online"
                          checked={paymentMethod === 'online'}
                          onChange={() => setPaymentMethod('online')}
                          className="accent-[#5B0D15]"
                        />
                        <CreditCard className="w-4 h-4 shrink-0" />
                        <span className="text-[11px]">{t('Online UPI / Cards', 'ऑनलाइन UPI / कार्ड')}</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 rounded-full bg-[#5B0D15] hover:bg-[#73121D] text-amber-100 font-bold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <span>{t('Place Order Now', 'अभी ऑर्डर करें')} • {formattedTotalPrice}</span>
                    <ArrowRight className="w-4 h-4 text-amber-300" />
                  </button>
                  <p className="text-[10px] text-center text-stone-500 mt-2">
                    {t('Free Express Delivery • 7-Day Easy Replacement Guarantee', 'निःशुल्क एक्सप्रेस डिलीवरी • 7 दिन की सरल वापसी गारंटी')}
                  </p>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#4A151B]">
                  {t('Order Placed Successfully!', 'ऑर्डर सफलतापूर्वक प्राप्त हुआ!')}
                </h3>
                <div className="p-3 rounded-2xl bg-white border border-amber-200 text-xs text-stone-700 space-y-1">
                  <p><strong>{t('Order ID:', 'ऑर्डर सं.:')}</strong> {placedOrderId}</p>
                  <p><strong>{t('Product:', 'उत्पाद:')}</strong> {prodName} (Qty: {quantity})</p>
                  <p><strong>{t('Total Amount:', 'कुल राशि:')}</strong> {formattedTotalPrice}</p>
                  <p><strong>{t('Payment:', 'भुगतान:')}</strong> {paymentMethod === 'cod' ? t('Cash on Delivery', 'कैश ऑन डिलीवरी') : t('Prepaid Online', 'ऑनलाइन भुगतान')}</p>
                </div>
                <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                  {t(
                    `Thank you, ${customerName}! Your order has been placed successfully and is being packed. Courier tracking updates will be sent via SMS / WhatsApp to ${userPhone}.`,
                    `धन्यवाद, ${customerName}! आपका ऑर्डर सफलतापूर्वक दर्ज हो गया है। ट्रैकिंग अपडेट ${userPhone} पर प्रेषित किए जाएंगे।`
                  )}
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setShowCheckoutModal(false);
                      setCheckoutStep('form');
                    }}
                    className="w-full py-3 rounded-full bg-[#5B0D15] hover:bg-[#73121D] text-amber-100 font-bold text-xs cursor-pointer"
                  >
                    {t('Continue Shopping', 'खरीदारी जारी रखें')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sticky Bottom Mobile Bar for Instant Action */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-amber-200 p-3 lg:hidden flex items-center justify-between gap-3 shadow-2xl">
        <div className="min-w-0">
          <span className="text-[10px] text-stone-500 block truncate">{prodName}</span>
          <span className="font-serif font-bold text-base text-[#800000]">{product.price}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleAddToCart}
            className="px-3.5 py-2.5 rounded-full border-2 border-[#5B0D15] text-[#5B0D15] font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{addedToCart ? '✓' : t('Cart', 'कार्ट')}</span>
          </button>
          <button
            onClick={() => setShowCheckoutModal(true)}
            className="px-5 py-2.5 rounded-full bg-[#5B0D15] text-amber-100 font-bold text-xs flex items-center gap-1 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>{t('Buy Now', 'खरीदें')}</span>
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#5B0D15] border-t-amber-400 rounded-full animate-spin" />
        </div>
      }
    >
      <ProductDetailContent />
    </Suspense>
  );
}
