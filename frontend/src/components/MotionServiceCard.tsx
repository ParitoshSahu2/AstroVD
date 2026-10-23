'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, UserCheck, MessageCircle, Sparkles, Eye } from 'lucide-react';
import { ServiceItem } from '../data/servicesData';

interface MotionServiceCardProps {
  item: ServiceItem;
  displayTitle: string;
  displayCatTag: string;
  displayPandit: string;
  displayDesc: string;
  displayBadge?: string | null;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onWhatsApp: (title: string) => void;
  onSelectService?: (service: ServiceItem) => void;
  t: (en: string, hi: string) => string;
  language: 'en' | 'hi';
}

export const MotionServiceCard: React.FC<MotionServiceCardProps> = ({
  item,
  displayTitle,
  displayCatTag,
  displayPandit,
  displayDesc,
  displayBadge,
  isExpanded,
  onToggleExpand,
  onWhatsApp,
  onSelectService,
  t,
  language,
}) => {
  return (
    <div className="relative group transition-transform duration-300 hover:-translate-y-1.5 will-change-transform select-none">
      {/* High-Performance Hardware-Accelerated Card */}
      <div
        className={`relative rounded-2xl overflow-hidden bg-white border flex flex-col justify-between transition-all duration-300 ${
          item.isSpecial
            ? 'border-amber-400 ring-1 ring-amber-300/60 shadow-md hover:shadow-xl hover:border-amber-500'
            : 'border-stone-200/90 shadow-xs hover:border-amber-400 hover:shadow-lg'
        }`}
      >
        {/* Ambient Cosmic Prana Shimmer Border for Special Consecrated Rituals */}
        {item.isSpecial && (
          <div className="pointer-events-none absolute inset-0 rounded-2xl border border-amber-400/80 z-20 animate-pulse opacity-80" />
        )}

        <div>
          {/* Card Media with Quick VisionOS Modal Trigger */}
          <div
            onClick={() => onSelectService && onSelectService(item)}
            className="relative h-44 sm:h-48 w-full overflow-hidden bg-stone-100 cursor-pointer group/media"
          >
            <Image
              src={item.image}
              alt={displayTitle}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover/media:scale-105 transition-transform duration-500 ease-out"
            />
            
            {/* Dark gradient for text legibility & depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Holographic Category Tag */}
            <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-amber-300/70 text-amber-300 font-bold text-[10px] uppercase tracking-wider shadow-sm z-10">
              ✦ {displayCatTag}
            </div>

            {/* Special Ritual Badge */}
            {displayBadge && (
              <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 via-rose-600 to-amber-600 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-md flex items-center gap-1 z-10">
                <Sparkles className="w-3 h-3 text-amber-200 animate-spin" style={{ animationDuration: '6s' }} />
                <span>{displayBadge}</span>
              </div>
            )}

            {/* Hover VisionOS "Explore" Pill */}
            <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/30 text-white font-bold text-[10px] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 shadow-lg z-10">
              <Eye className="w-3 h-3 text-amber-300" />
              <span>{t('View in 3D', '3D में देखें')}</span>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-3.5 sm:p-4 space-y-1.5">
            <h3
              onClick={() => onSelectService && onSelectService(item)}
              className="font-serif font-bold text-sm sm:text-base text-[#2A1810] group-hover:text-[#5B0D15] transition-colors leading-snug cursor-pointer"
            >
              {displayTitle}
            </h3>

            <div className="flex items-center gap-1 text-[11px] text-amber-800 font-semibold">
              <UserCheck className="w-3 h-3 text-amber-600 shrink-0" />
              <span className="truncate">{displayPandit}</span>
            </div>

            {/* Description with "(more)" / "(less)" toggle */}
            <div className="text-xs text-stone-600 leading-relaxed">
              <span className={isExpanded ? '' : 'line-clamp-2'}>
                {displayDesc}
              </span>
              {displayDesc.length > 70 && (
                <button
                  type="button"
                  onClick={() => onToggleExpand(item.id)}
                  className="ml-1 text-[11px] font-bold text-[#5B0D15] hover:text-amber-800 hover:underline cursor-pointer inline-flex items-center"
                >
                  {isExpanded ? t('(less)', '(कम)') : t('(more)', '(और पढ़ें)')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Card Bar: Dakshina & Action Buttons */}
        <div className="px-3.5 sm:px-4 py-2.5 border-t border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div>
            <span className="text-[9px] text-stone-500 uppercase font-bold tracking-wider block leading-none">
              {t('Dakshina', 'न्योछावर')}
            </span>
            <span className={`font-serif font-bold text-sm sm:text-base ${
              item.price.includes('FREE') ? 'text-emerald-700 font-extrabold' : 'text-[#5B0D15]'
            }`}>
              {language === 'hi' && item.price.includes('FREE') ? '100% निःशुल्क' : item.price}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onWhatsApp(displayTitle)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-full border border-emerald-400 text-emerald-800 hover:bg-emerald-50 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer active:scale-95"
              title="Inquire on WhatsApp"
              aria-label="Inquire on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline text-[11px]">WhatsApp</span>
            </button>

            <Link
              href={`/appointment?service=${item.id}`}
              className="px-3 py-1.5 rounded-full bg-[#5B0D15] hover:bg-[#72111c] text-white text-xs font-bold shadow-xs hover:scale-105 transition-all flex items-center gap-1 active:scale-95"
            >
              <span>{t('Book', 'परामर्श')}</span>
              <ArrowRight className="w-3 h-3 text-amber-300" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
