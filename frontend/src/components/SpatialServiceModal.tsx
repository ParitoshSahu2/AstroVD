'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, Sparkles, Clock, UserCheck, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ServiceItem } from '../data/servicesData';

interface SpatialServiceModalProps {
  service: ServiceItem | null;
  displayTitle: string;
  displayCatTag: string;
  displayPandit: string;
  displayDesc: string;
  displayBadge?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onWhatsApp?: (title: string) => void;
  t: (en: string, hi: string) => string;
  language: 'en' | 'hi';
}

export const SpatialServiceModal: React.FC<SpatialServiceModalProps> = ({
  service,
  displayTitle,
  displayCatTag,
  displayPandit,
  displayDesc,
  displayBadge,
  isOpen,
  onClose,
  t,
  language,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      if (typeof window !== 'undefined' && (window as any).__lenis) {
        (window as any).__lenis.stop();
      }
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
      if (typeof window !== 'undefined' && (window as any).__lenis) {
        (window as any).__lenis.start();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen || !service) return null;

  const handleContainerWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    // If user scrolls over header or footer or outer frame, smoothly forward delta to the scrollable content
    if (contentRef.current && e.target !== contentRef.current && !contentRef.current.contains(e.target as Node)) {
      contentRef.current.scrollTop += e.deltaY;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-md animate-fadeIn">
      {/* Background click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Light Theme Modal Container - Strictly rounded with overflow-hidden to prevent scrollbar from breaking corners */}
      <div
        data-lenis-prevent="true"
        onWheel={handleContainerWheel}
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl bg-gradient-to-b from-[#FDFBF7] to-white text-[#2A1810] border-2 border-amber-300/90 shadow-2xl transition-all duration-300 flex flex-col"
        style={{
          boxShadow: '0 25px 60px -15px rgba(42, 24, 16, 0.3), 0 0 35px rgba(245, 158, 11, 0.25)',
        }}
      >
        {/* Top Header - Fixed & Contained */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4 bg-white/95 backdrop-blur-md border-b border-amber-200/80 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider">
              ✦ {displayCatTag}
            </span>
            {displayBadge && (
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-rose-600 to-amber-600 text-white text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-200" />
                {displayBadge}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-600 hover:text-stone-900 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body - Scrollbar is fully contained inside and styled in sacred crimson maroon */}
        <div
          ref={contentRef}
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
          className="p-5 sm:p-7 space-y-6 flex-1 overflow-y-auto overscroll-contain modal-scrollbar pr-3 sm:pr-5"
        >
          {/* Media Banner with Gradient text legibility */}
          <div className="relative h-56 sm:h-72 w-full rounded-2xl overflow-hidden border border-amber-300/80 shadow-md group">
            <img
              src={service.image}
              alt={displayTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
            
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white drop-shadow-md">
                {displayTitle}
              </h2>
              <div className="flex items-center gap-2 text-xs text-amber-300 mt-1.5 font-semibold">
                <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{displayPandit}</span>
              </div>
            </div>
          </div>

          {/* Details & Inclusions Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-2.5 shadow-2xs">
              <Clock className="w-4 h-4 text-amber-700 shrink-0" />
              <div>
                <div className="text-[10px] text-stone-500 uppercase font-bold">{t('Duration', 'अवधि')}</div>
                <div className="text-xs font-bold text-stone-900">{service.durationMinutes} {t('Minutes', 'मिनट')}</div>
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-2.5 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <div className="text-[10px] text-stone-500 uppercase font-bold">{t('Authenticity', 'प्रामाणिकता')}</div>
                <div className="text-xs font-bold text-emerald-900">{t('Kashi Parampara', 'काशी परंपरा')}</div>
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-2.5 col-span-2 sm:col-span-1 shadow-2xs">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
              <div>
                <div className="text-[10px] text-stone-500 uppercase font-bold">{t('Ritual Offering', 'न्योछावर')}</div>
                <div className={`text-xs font-bold ${service.price.includes('FREE') ? 'text-emerald-700' : 'text-[#5B0D15]'}`}>
                  {language === 'hi' && service.price.includes('FREE') ? '100% निःशुल्क' : service.price}
                </div>
              </div>
            </div>
          </div>

          {/* Description & Vidhi Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-2 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
              {t('Ritual Overview & Sacred Vidhi', 'विधान एवं अनुष्ठान परिचय')}
            </h3>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
              {displayDesc}
            </p>
          </div>

          {/* Time Extension Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-100/60 border border-amber-300/80 flex items-center gap-2.5 text-xs text-amber-950 shadow-2xs">
            <Clock className="w-4 h-4 text-amber-800 shrink-0" />
            <div>
              <span className="font-bold">{t('Time Extension Available:', 'समय विस्तार सुविधा:')}</span>{' '}
              <span>{t('Need more time with Guruji? Live consultation extensions are available at', 'गुरुजी से अधिक समय की आवश्यकता है? लाइव परामर्श विस्तार उपलब्ध है')}</span>{' '}
              <strong className="text-[#5B0D15]">₹50 / {t('minute', 'मिनट')}</strong>.
            </div>
          </div>
        </div>

        {/* Bottom Action Footer - Fixed & Contained */}
        <div className="shrink-0 px-5 sm:px-7 py-3.5 bg-white/95 backdrop-blur-md border-t border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 z-10">
          <div>
            <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider block">
              {t('Dakshina / Offering', 'दक्षिणा / न्योछावर')}
            </span>
            <div className="flex items-baseline gap-2">
              <span className={`font-serif text-xl sm:text-2xl font-bold ${
                service.price.includes('FREE') ? 'text-emerald-700' : 'text-[#5B0D15]'
              }`}>
                {language === 'hi' && service.price.includes('FREE') ? '100% निःशुल्क' : service.price}
              </span>
              <span className="text-xs text-amber-800 font-semibold">
                (+ ₹50/{t('min extension', 'मिनट विस्तार')})
              </span>
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <Link
              href={`/appointment?service=${service.id}`}
              onClick={onClose}
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-gradient-to-r from-[#5B0D15] via-[#7B121C] to-[#5B0D15] hover:from-[#7B121C] hover:to-[#5B0D15] text-amber-100 text-xs sm:text-sm font-bold shadow-lg shadow-rose-950/20 hover:scale-105 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>{t('Book Consultation', 'परामर्श बुक करें')}</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
