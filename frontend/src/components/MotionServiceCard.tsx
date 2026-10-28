'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, UserCheck, Sparkles, Info } from 'lucide-react';
import { ServiceItem } from '../data/servicesData';

interface MotionServiceCardProps {
  item: ServiceItem;
  displayTitle: string;
  displayCatTag: string;
  displayPandit: string;
  displayDesc: string;
  displayBadge?: string | null;
  isExpanded?: boolean;
  onToggleExpand?: (id: string) => void;
  onWhatsApp?: (title: string) => void;
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
  onSelectService,
  t,
  language,
}) => {
  return (
    <div className="relative group transition-transform duration-300 hover:-translate-y-1.5 will-change-transform select-none h-full flex flex-col">
      {/* High-Performance Hardware-Accelerated Card */}
      <div
        className={`relative rounded-2xl overflow-hidden bg-white border flex flex-col justify-between h-full transition-all duration-300 ${item.isSpecial
          ? 'border-amber-400 ring-1 ring-amber-300/60 shadow-md hover:shadow-xl hover:border-amber-500'
          : 'border-stone-200/90 shadow-xs hover:border-amber-400 hover:shadow-lg'
          }`}
      >
        {/* Ambient Cosmic Prana Shimmer Border for Special Consecrated Rituals */}
        {item.isSpecial && (
          <div className="pointer-events-none absolute inset-0 rounded-2xl border border-amber-400/80 z-20 animate-pulse opacity-80" />
        )}

        <div className="flex flex-col flex-1">
          {/* Card Media with Quick VisionOS Modal Trigger */}
          <div
            onClick={() => onSelectService && onSelectService(item)}
            className="relative h-44 sm:h-48 w-full overflow-hidden bg-stone-100 cursor-pointer group/media shrink-0"
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
              {displayCatTag}
            </div>

            {/* Special Ritual Badge */}
            {displayBadge && (
              <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 via-rose-600 to-amber-600 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-md flex items-center gap-1 z-10">
                
                <span>{displayBadge}</span>
              </div>
            )}
          </div>

          {/* Card Content with Uniform Proportions */}
          <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between space-y-2">
            <div className="space-y-1.5">
              <h3
                onClick={() => onSelectService && onSelectService(item)}
                className="font-serif font-bold text-sm sm:text-base text-[#2A1810] group-hover:text-[#5B0D15] transition-colors leading-snug cursor-pointer line-clamp-1"
                title={displayTitle}
              >
                {displayTitle}
              </h3>

              <div className="flex items-center gap-1 text-[11px] text-amber-800 font-semibold h-4">
                <UserCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">{displayPandit}</span>
              </div>
            </div>

            {/* Description clamped to 2 lines ending with ellipsis */}
            <div className="text-xs text-stone-600 leading-relaxed min-h-[2.5rem] flex flex-col justify-start">
              <p className="line-clamp-2">
                {displayDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Card Bar: Dakshina & Action Buttons */}
        <div className="px-3.5 sm:px-4 py-2.5 border-t border-stone-100 flex items-center justify-between bg-stone-50/70 shrink-0 mt-auto">
          <div>
            <span className="text-[9px] text-stone-500 uppercase font-bold tracking-wider block leading-none">
              {t('Dakshina', 'न्योछावर')}
            </span>
            <span className={`font-serif font-bold text-sm sm:text-base ${item.price.includes('FREE') ? 'text-emerald-700 font-extrabold' : 'text-[#5B0D15]'
              }`}>
              {language === 'hi' && item.price.includes('FREE') ? '100% निःशुल्क' : item.price}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Details Button */}
            <button
              type="button"
              onClick={() => onSelectService && onSelectService(item)}
              className="px-2.5 sm:px-3 py-1.5 rounded-full border border-amber-300 text-[#5B0D15] bg-white hover:bg-amber-50 hover:border-amber-400 text-xs font-semibold flex items-center gap-1 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
              title={t('Read ritual details', 'अनुष्ठान का पूरा विवरण पढ़ें')}
            >
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{t('Details', 'विवरण')}</span>
            </button>

            {/* Direct Booking Button */}
            <Link
              href={`/appointment?service=${item.id}`}
              className="px-3 sm:px-3.5 py-1.5 rounded-full bg-[#5B0D15] hover:bg-[#72111c] text-white text-xs font-bold shadow-xs hover:scale-105 transition-all flex items-center gap-1 active:scale-95"
              title={t('Book appointment directly', 'सीधे परामर्श बुक करें')}
            >
              <span>{t('Book', 'परामर्श')}</span>
              <ArrowRight className="w-3 h-3 text-amber-300 shrink-0" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
