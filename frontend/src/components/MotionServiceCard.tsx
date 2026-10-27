'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star,
  Heart,
  Flame,
  Sparkles,
  Clock,
  User,
  MessageCircle,
  Eye,
  ArrowRight,
  Info,
} from 'lucide-react';
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
  isExpanded,
  onToggleExpand,
  onWhatsApp,
  onSelectService,
  t,
  language,
}) => {
  const finalTitle = displayTitle || item.displayTitle || item.title;
  const finalDesc = displayDesc || item.displayDesc || item.desc;
  const priceText = item.displayPrice || item.price;
  const unitText = item.unitDisplay || (item.categoryKey === 'education' ? '/ course' : '/ session');
  const durationText = item.durationDisplay || `${item.durationMinutes} mins`;
  const specialistText = item.specialistDisplay || 'Varanasi Acharyas';

  const renderBadge = () => {
    const badgeText = displayBadge || item.badge;
    if (!badgeText) return null;

    if (item.badgeType === 'popular' || badgeText.toLowerCase().includes('popular')) {
      return (
        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-[#63220B]/85 backdrop-blur-md border border-[#DCA258]/35 text-[#F5C77E] font-semibold text-[11px] flex items-center gap-1.5 shadow-sm z-10">
          <Star className="w-3 h-3 text-[#F5C77E] fill-[#F5C77E]" />
          <span>{badgeText}</span>
        </div>
      );
    }
    if (item.badgeType === 'booked' || badgeText.toLowerCase().includes('booked')) {
      return (
        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-[#5A2510]/85 backdrop-blur-md border border-[#C2824C]/35 text-[#F5D8A0] font-semibold text-[11px] flex items-center gap-1.5 shadow-sm z-10">
          <Sparkles className="w-3 h-3 text-[#F5D8A0]" />
          <span>{badgeText}</span>
        </div>
      );
    }
    if (item.badgeType === 'relationship' || badgeText.toLowerCase().includes('match')) {
      return (
        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-[#6E2A1C]/85 backdrop-blur-md border border-[#DCA258]/35 text-[#FCEBD9] font-semibold text-[11px] flex items-center gap-1.5 shadow-sm z-10">
          <Heart className="w-3 h-3 text-[#F5C77E] fill-[#F5C77E]" />
          <span>{badgeText}</span>
        </div>
      );
    }
    if (item.badgeType === 'pooja' || badgeText.toLowerCase().includes('pooja')) {
      return (
        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-[#7A451C]/85 backdrop-blur-md border border-[#C2824C]/35 text-[#FCEBD9] font-semibold text-[11px] flex items-center gap-1.5 shadow-sm z-10">
          <Flame className="w-3 h-3 text-[#F5C77E]" />
          <span>{badgeText}</span>
        </div>
      );
    }
    if (item.badgeType === 'kundali' || badgeText.toLowerCase().includes('kundali')) {
      return (
        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-[#754823]/85 backdrop-blur-md border border-[#C2824C]/35 text-[#FCEBD9] font-semibold text-[11px] flex items-center gap-1.5 shadow-sm z-10">
          <Sparkles className="w-3 h-3 text-[#F5C77E]" />
          <span>{badgeText}</span>
        </div>
      );
    }
    return (
      <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-[#522311]/85 backdrop-blur-md border border-[#DCA258]/35 text-[#F5C77E] font-semibold text-[11px] flex items-center gap-1.5 shadow-sm z-10">
        <Sparkles className="w-3 h-3 text-[#F5C77E]" />
        <span>{badgeText}</span>
      </div>
    );
  };

  return (
    <div className="relative group transition-transform duration-300 hover:-translate-y-1.5 will-change-transform select-none h-full flex flex-col">
      <div
        className={`relative rounded-2xl overflow-hidden bg-white border flex flex-col justify-between h-full transition-all duration-300 ${
          item.isSpecial
            ? 'border-[#DCA258] ring-1 ring-[#DCA258]/40 shadow-md hover:shadow-xl'
            : 'border-[#EAE0D0] shadow-xs hover:border-[#D6C4AD] hover:shadow-md'
        }`}
      >
        {/* Ambient Cosmic Prana Shimmer Border for Special Consecrated Rituals */}
        {item.isSpecial && (
          <div className="pointer-events-none absolute inset-0 rounded-2xl border border-amber-400/80 z-20 animate-pulse opacity-80" />
        )}

        <div className="flex flex-col flex-1">
          {/* Card Media with Image and Badges */}
          <div
            onClick={() => onSelectService && onSelectService(item)}
            className="relative h-44 sm:h-48 w-full overflow-hidden bg-stone-100 cursor-pointer group/media shrink-0"
          >
            <Image
              src={item.image}
              alt={finalTitle}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover/media:scale-105 transition-transform duration-500 ease-out"
            />

            {/* Dark gradient for text & badge legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

            {/* Badges on top-left of the image */}
            {renderBadge()}

            {/* Hover VisionOS "View in 3D" pill */}
            <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/30 text-white font-bold text-[10px] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 shadow-lg z-10">
              <Eye className="w-3 h-3 text-[#F5C77E]" />
              <span>{t('View in 3D', '3D में देखें')}</span>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-4 sm:p-5 flex flex-col flex-1">
            <h3
              onClick={() => onSelectService && onSelectService(item)}
              className="font-serif font-bold text-base sm:text-[17px] text-[#2D1408] group-hover:text-[#522311] transition-colors leading-snug cursor-pointer line-clamp-1"
              title={finalTitle}
            >
              {finalTitle}
            </h3>

            <p className="text-xs text-[#706256] leading-relaxed mt-1.5 line-clamp-2">
              {finalDesc}
            </p>

            {/* Meta row: Duration & Specialist */}
            <div className="mt-3 flex items-center gap-4 text-xs text-[#8C7E72] font-medium">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#A39588] shrink-0" />
                <span>{durationText}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <User className="w-3.5 h-3.5 text-[#A39588] shrink-0" />
                <span className="truncate">{specialistText}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Card Bar: Price & Action Buttons */}
        <div className="px-4 sm:px-5 py-3 border-t border-[#F2ECE1] flex items-center justify-between bg-white shrink-0 mt-auto">
          <div className="flex items-baseline gap-1">
            <span className="font-serif font-bold text-base sm:text-lg text-[#2D1408]">
              {priceText}
            </span>
            <span className="text-xs text-[#9E9082] font-normal">
              {unitText}
            </span>
            <span className="text-[9.5px] text-amber-800 font-semibold ml-1" title={t('Time extension: ₹50 per minute', 'समय विस्तार: ₹50 प्रति मिनट')}>
              (+₹50/{t('m', 'मि')})
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => onSelectService && onSelectService(item)}
              className="px-2.5 sm:px-3 py-1.5 rounded-full border border-amber-300 text-[#5B0D15] bg-white hover:bg-amber-50 hover:border-amber-400 text-xs font-semibold flex items-center gap-1 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
              title={t('Read ritual details', 'अनुष्ठान का पूरा विवरण पढ़ें')}
            >
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{t('Details', 'विवरण')}</span>
            </button>
            <Link
              href={`/appointment?service=${item.id}`}
              className="px-3.5 sm:px-4 py-1.5 rounded-lg bg-[#522311] hover:bg-[#662C16] text-white text-xs font-semibold shadow-xs hover:shadow transition-all flex items-center gap-1"
            >
              <span>{t('Book Now', 'परामर्श लें')}</span>
              <ArrowRight className="w-3 h-3 text-amber-300 shrink-0" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
