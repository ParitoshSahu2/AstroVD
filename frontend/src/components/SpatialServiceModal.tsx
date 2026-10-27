'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { X, Sparkles, Clock, UserCheck, MessageCircle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
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
  onWhatsApp,
  t,
  language,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xl animate-fadeIn">
      {/* Background click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Spatial Glass Container with Glowing Neon/Gold Rim (VisionOS Style) */}
      <div
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#1C090C]/90 backdrop-blur-2xl text-white border-2 border-amber-400/80 shadow-[0_0_50px_rgba(245,158,11,0.35)] transition-all duration-300"
        style={{
          boxShadow: '0 0 0 1px rgba(251, 191, 36, 0.6), 0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 45px rgba(245, 158, 11, 0.4)',
        }}
      >
        {/* Top Header Floating Close Pill */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-4 bg-[#1C090C]/85 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
              ✦ {displayCatTag}
            </span>
            {displayBadge && (
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 text-white text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-200" />
                {displayBadge}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-6">
          {/* Spatial Media Banner */}
          <div className="relative h-56 sm:h-72 w-full rounded-2xl overflow-hidden border border-amber-300/30 shadow-inner group">
            <img
              src={service.image}
              alt={displayTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C090C] via-transparent to-transparent opacity-80" />
            
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white drop-shadow-md">
                {displayTitle}
              </h2>
              <div className="flex items-center gap-2 text-xs text-amber-300 mt-1 font-semibold">
                <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{displayPandit}</span>
              </div>
            </div>
          </div>

          {/* Details & Inclusions */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="text-[10px] text-stone-400 uppercase font-semibold">{t('Duration', 'अवधि')}</div>
                <div className="text-xs font-bold text-white">{service.durationMinutes} {t('Minutes', 'मिनट')}</div>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[10px] text-stone-400 uppercase font-semibold">{t('Authenticity', 'प्रामाणिकता')}</div>
                <div className="text-xs font-bold text-white">{t('Kashi Parampara', 'काशी परंपरा')}</div>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5 col-span-2 sm:col-span-1">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="text-[10px] text-stone-400 uppercase font-semibold">{t('Ritual Offering', 'न्योछावर')}</div>
                <div className={`text-xs font-bold ${service.price.includes('FREE') ? 'text-emerald-400' : 'text-amber-300'}`}>
                  {language === 'hi' && service.price.includes('FREE') ? '100% निःशुल्क' : service.price}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              {t('Ritual Overview & Sacred Vidhi', 'विधान एवं अनुष्ठान परिचय')}
            </h3>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
              {displayDesc}
            </p>
          </div>

          {/* Floating Action Pill Bar */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
                {t('Dakshina / Offering', 'दक्षिणा / न्योछावर')}
              </span>
              <span className={`font-serif text-xl sm:text-2xl font-bold ${
                service.price.includes('FREE') ? 'text-emerald-400' : 'text-amber-300'
              }`}>
                {language === 'hi' && service.price.includes('FREE') ? '100% निःशुल्क' : service.price}
              </span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Link
                href={`/appointment?service=${service.id}`}
                onClick={onClose}
                className="w-full sm:w-auto px-7 py-3 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white text-xs font-extrabold shadow-lg shadow-rose-950/40 hover:scale-105 transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>{t('Book Consultation', 'परामर्श बुक करें')}</span>
                <ArrowRight className="w-4 h-4 text-amber-200" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
