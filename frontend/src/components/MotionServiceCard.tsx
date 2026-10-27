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

function formatTitleCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace(/\(janam Kundali\)/i, '(Janam Kundali)')
    .replace(/\(varshaphal\)/i, '(Varshaphal)');
}

export const MotionServiceCard: React.FC<MotionServiceCardProps> = ({
  item,
  displayTitle,
  displayCatTag,
  displayPandit,
  displayDesc,
  displayBadge,
  onWhatsApp,
  onSelectService,
  t,
  language,
}) => {
  // Title & description priority: item.displayTitle -> formatted title
  const finalTitle = item.displayTitle || (displayTitle ? formatTitleCase(displayTitle) : formatTitleCase(item.title));
  const finalDesc = item.displayDesc || displayDesc || item.desc;

  // Duration display (e.g. "60 mins", "45 mins", "2-3 hrs")
  const durationText = item.durationDisplay || (item.durationMinutes >= 120 ? '2-3 hrs' : `${item.durationMinutes || 45} mins`);

  // Specialist display (e.g. "Expert Astrologers", "Puja Specialist", "Relationship Expert")
  const specialistText = item.specialistDisplay || (item.categoryKey === 'pooja' ? 'Puja Specialist' : displayPandit?.split('(')[0]?.trim() || 'Expert Astrologers');

  // Price & unit display
  const priceText = item.displayPrice || (item.price.includes('FREE') ? (language === 'hi' ? 'निःशुल्क' : 'FREE') : item.price);
  const unitText = item.unitDisplay || (item.categoryKey === 'pooja' ? '/ pooja' : '/ session');

  // Exact Badge rendering matching mockup colors
  const renderBadge = () => {
    const badgeText = item.badge || displayBadge;
    if (!badgeText) return null;

    if (item.badgeType === 'popular' || badgeText.toLowerCase().includes('popular')) {
      return (
        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-[#DCA258]/35 text-[#F5C77E] font-semibold text-[11px] flex items-center gap-1.5 shadow-sm z-10">
          <Star className="w-3 h-3 fill-[#F5C77E] text-[#F5C77E]" />
          <span>{badgeText}</span>
        </div>
      );
    }
    if (item.badgeType === 'booked' || badgeText.toLowerCase().includes('booked')) {
      return (
        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-[#B84328]/90 backdrop-blur-md border border-[#E0795D]/40 text-white font-semibold text-[11px] flex items-center gap-1.5 shadow-sm z-10">
          <span>🔥</span>
          <span>{badgeText}</span>
        </div>
      );
    }
    if (item.badgeType === 'relationship' || badgeText.toLowerCase().includes('relationship')) {
      return (
        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-[#945A2B]/85 backdrop-blur-md border border-[#D99A62]/35 text-[#FCEBD9] font-semibold text-[11px] flex items-center gap-1.5 shadow-sm z-10">
          <Heart className="w-3 h-3 text-[#F5C77E]" />
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
    <div className="relative group transition-transform duration-300 hover:-translate-y-1 select-none">
      <div
        className={`relative rounded-2xl overflow-hidden bg-white border flex flex-col justify-between transition-all duration-300 ${
          item.isSpecial
            ? 'border-[#DCA258] ring-1 ring-[#DCA258]/40 shadow-md hover:shadow-xl'
            : 'border-[#EAE0D0] shadow-xs hover:border-[#D6C4AD] hover:shadow-md'
        }`}
      >
        <div>
          {/* Card Media with Image and Badges */}
          <div
            onClick={() => onSelectService && onSelectService(item)}
            className="relative h-44 sm:h-48 w-full overflow-hidden bg-stone-100 cursor-pointer group/media"
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
          <div className="p-4 sm:p-5">
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
        <div className="px-4 sm:px-5 py-3 border-t border-[#F2ECE1] flex items-center justify-between bg-white">
          <div className="flex items-baseline gap-1">
            <span className="font-serif font-bold text-base sm:text-lg text-[#2D1408]">
              {priceText}
            </span>
            <span className="text-xs text-[#9E9082] font-normal">
              {unitText}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/appointment?service=${item.id}`}
              className="px-4 py-1.5 rounded-lg bg-[#522311] hover:bg-[#662C16] text-white text-xs font-semibold shadow-xs hover:shadow transition-all"
            >
              {t('Book Now', 'परामर्श लें')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
