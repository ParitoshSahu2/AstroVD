'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Navbar } from '../../../components/Navbar';
import { Footer } from '../../../components/Footer';
import { PageHeader } from '../../../components/PageHeader';
import { PRODUCTS_CATALOG } from '../../../data/products';
import { useCart } from '../../../context/CartContext';
import { useLanguage } from '../../../context/LanguageContext';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ShoppingCart,
  Check,
  CheckCircle2,
  Plus,
  Minus,
  Star,
  ArrowLeft,
  Flame,
} from 'lucide-react';

interface ProductDetailClientProps {
  productId: string;
}

export function ProductDetailClient({ productId }: ProductDetailClientProps) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const [added, setAdded] = useState(false);

  const product = PRODUCTS_CATALOG.find(
    (p) =>
      p.id.toLowerCase() === productId.toLowerCase() ||
      p.name.toLowerCase().replace(/\s+/g, '-') === productId.toLowerCase()
  );

  const cartItem = product ? items.find((i) => i.id === product.id) : null;
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
    if (!product) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('astro_token') : null;
    if (!token) {
      router.push(`/login?redirect=/products/${encodeURIComponent(product.id)}`);
      return;
    }

    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('astro_token') : null;
    if (!token) {
      router.push(`/login?redirect=/cart`);
      return;
    }

    if (quantityInCart === 0) {
      addItem(product, 1);
    }
    router.push('/cart');
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col text-[#3B1E22]">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-md">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#3B1E22]">
            {t('Sacred Product Not Found', 'सिद्ध उत्पाद नहीं मिला')}
          </h2>
          <p className="text-stone-600 text-sm max-w-md mx-auto">
            {t(
              'The consecrated talisman or bracelet you are looking for is either out of stock or does not exist.',
              'जिस सिद्ध रुद्राक्ष अथवा ब्रेसलेट की आप खोज कर रहे हैं, वह वर्तमान में उपलब्ध नहीं है।'
            )}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-white text-xs font-bold shadow-md transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('Browse All Products', 'सभी उत्पाद देखें')}</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const name = language === 'hi' && product.nameHi ? product.nameHi : product.name;
  const desc = language === 'hi' && product.descHi ? product.descHi : product.desc;
  const tag = language === 'hi' && product.tagHi ? product.tagHi : product.tag;
  const planet = language === 'hi' && product.planetHi ? product.planetHi : product.planet;
  const chakra = language === 'hi' && product.chakraHi ? product.chakraHi : product.chakra;
  const dayToWear = language === 'hi' && product.dayToWearHi ? product.dayToWearHi : product.dayToWear;
  const beadSize = language === 'hi' && product.beadSizeHi ? product.beadSizeHi : product.beadSize;

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col text-[#3B1E22]">
      <Navbar />

      <PageHeader
        breadcrumb={t('Astro Store', 'वैदिक स्टोर')}
        title={name}
        subtitle={tag || ''}
        compact={true}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#5B0D15] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('← Back to all sacred products', '← सभी सिद्ध उत्पादों पर वापस जाएं')}</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left: Product Image Box */}
          <div className="md:col-span-5 relative rounded-2xl overflow-hidden bg-stone-950 border-2 border-amber-300/80 shadow-xl group aspect-square max-h-[380px] sm:max-h-[420px] w-full mx-auto">
            <Image
              src={product.image}
              alt={name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 42vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Persistent In-Cart Quantity Indicator (+1, +2, etc.) */}
            {quantityInCart > 0 && (
              <div className="absolute top-3 left-3 z-20 px-3.5 py-1.5 rounded-full bg-[#5B0D15] text-amber-200 border-2 border-amber-400/90 font-bold text-xs shadow-xl flex items-center gap-1.5 animate-fadeIn backdrop-blur-md">
                <ShoppingCart className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="text-white font-extrabold text-sm">+{quantityInCart}</span>
                <span>{t('in Sacred Cart', 'पवित्र कार्ट में')}</span>
              </div>
            )}
            {/* Price badge */}
            <div
              className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-amber-400/80 text-amber-200 font-bold text-xs shadow-md"
              style={{
                fontFamily: "'Assistant', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                fontWeight: 700,
              }}
            >
              {product.price}
            </div>
            {/* Consecration guarantee tag */}
            <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-black/70 backdrop-blur-md border border-amber-300/40 text-amber-100 flex items-center gap-2 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t('100% Lab Certified & Prana Pratishtha Done in Kashi', '100% लैब प्रमाणित एवं काशी में प्राण-प्रतिष्ठित')}</span>
            </div>
          </div>

          {/* Right: Product Details & Add to Cart */}
          <div className="md:col-span-7 space-y-4">
            <div>
              {tag ? (
                <span className="text-[11px] font-bold tracking-[0.2em] text-amber-800 uppercase block mb-1">
                  {tag}
                </span>
              ) : null}
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#3B1E22]">
                {name}
              </h1>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-wrap items-center gap-3 sm:gap-4">
              <span
                className="product-price-style text-3xl sm:text-4xl font-bold"
                style={{
                  fontFamily: "'Assistant', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                  fontWeight: 700,
                  fontSize: '36px',
                  color: '#212121',
                }}
              >
                {product.price}
              </span>
              <span
                className="product-original-price-style text-lg"
                style={{
                  fontFamily: "'Assistant', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                  fontSize: '18px',
                  color: '#878787',
                  textDecoration: 'line-through',
                }}
              >
                {product.originalPrice}
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                {t('SAVE 48%', '48% छूट')}
              </span>
              {quantityInCart > 0 && (
                <span className="ml-auto px-3 py-1 rounded-full text-xs font-bold bg-[#5B0D15] text-amber-200 border border-amber-400/80 shadow-xs flex items-center gap-1.5 animate-fadeIn">
                  <ShoppingCart className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span className="font-extrabold text-white">+{quantityInCart}</span>
                  <span>{t('in Sacred Cart', 'पवित्र कार्ट में')}</span>
                </span>
              )}
            </div>

            {/* Sacred Specifications Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">{t('Ruling Planet', 'स्वामी ग्रह')}</span>
                <span className="font-semibold text-stone-800">{planet}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">{t('Chakra Activation', 'चक्र संरेखण')}</span>
                <span className="font-semibold text-stone-800">{chakra}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">{t('Day to Wear', 'धारण का शुभ दिन')}</span>
                <span className="font-semibold text-stone-800">{dayToWear}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">{t('Bead Diameter', 'मनके का आकार')}</span>
                <span className="font-semibold text-stone-800">{beadSize}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-serif font-bold text-base text-[#3B1E22]">
                {t('Vedic Significance & Benefits', 'वैदिक प्रभाव एवं लाभ')}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {desc}
              </p>
            </div>

            {/* Mantra Box */}
            <div className="p-3.5 rounded-2xl bg-[#5B0D15]/5 border border-[#5B0D15]/20 flex items-center gap-3">
              <Flame className="w-5 h-5 text-[#5B0D15] shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-stone-500 uppercase block">{t('Beej Mantra for Energization', 'प्राण-प्रतिष्ठा बीज मंत्र')}</span>
                <span className="font-serif font-bold text-xs text-[#5B0D15]">{product.mantra}</span>
              </div>
            </div>

            {/* Action Buttons directly visible in viewport */}
            <div className="pt-2">
              <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Added to Cart Tooltip when clicked */}
                {added && (
                  <div className="absolute -top-11 left-1/4 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center animate-fadeIn">
                    <div className="px-3 py-1 bg-[#1C090C] text-emerald-300 text-xs font-bold rounded-lg shadow-xl flex items-center gap-1.5 whitespace-nowrap border border-amber-400/60 ring-1 ring-black/40">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{t('Added to Cart', 'कार्ट में जोड़ा गया')} (+{quantityInCart})</span>
                    </div>
                    {/* Triangle indicator pointing down */}
                    <div className="w-2 h-2 bg-[#1C090C] rotate-45 -mt-1 border-r border-b border-amber-400/60" />
                  </div>
                )}

                {quantityInCart === 0 ? (
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 py-3 px-6 rounded-full text-xs font-bold shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer bg-[#5B0D15] hover:bg-[#78121d] text-white hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-98"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>{t('Add to Sacred Cart', 'पवित्र कार्ट में जोड़ें')}</span>
                  </button>
                ) : (
                  /* Persistent Quantity Stepper when item is in cart */
                  <div className="flex-1 flex items-center justify-between bg-[#5B0D15] text-white rounded-full px-2 py-1.5 shadow-md border border-amber-400/40">
                    <button
                      type="button"
                      onClick={() => {
                        if (quantityInCart <= 1) {
                          removeItem(product.id);
                        } else {
                          updateQuantity(product.id, quantityInCart - 1);
                        }
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 text-white font-bold cursor-pointer transition-colors active:scale-90"
                      aria-label={t('Decrease quantity', 'मात्रा घटाएं')}
                    >
                      <Minus className="w-4 h-4 stroke-[2.5]" />
                    </button>

                    <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-amber-100 select-none px-2">
                      <ShoppingCart className="w-4 h-4 text-amber-300" />
                      <span className="text-white font-extrabold text-sm sm:text-base">+{quantityInCart}</span>
                      <span>{t('in Sacred Cart', 'कार्ट में')}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        updateQuantity(product.id, quantityInCart + 1);
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 text-white font-bold cursor-pointer transition-colors active:scale-90"
                      aria-label={t('Increase quantity', 'मात्रा बढ़ाएं')}
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                )}

                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-3 px-6 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#3B1E22] font-serif font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02]"
                >
                  <span>{quantityInCart > 0 ? t('Proceed to Checkout', 'चेकआउट पर जाएं') : t('Instant Checkout', 'तुरंत ऑर्डर करें')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
