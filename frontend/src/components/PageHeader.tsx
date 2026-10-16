'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface PageHeaderProps {
  breadcrumb: string;
  title: string;
  subtitle: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  breadcrumb,
  title,
  subtitle,
}) => {
  return (
    <div className="relative w-full bg-gradient-to-b from-[#1C090C] via-[#2A0E13] to-[#1C090C] text-white pt-28 sm:pt-36 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-12 overflow-hidden border-b border-amber-900/30">
      
      {/* Subtle Warm Background Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-72 h-72 bg-rose-700/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Content */}
      <div className="max-w-7xl mx-auto relative z-10 space-y-3.5">
        
        {/* Breadcrumb: Home > Current Page */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm font-medium">
          <Link
            href="/"
            className="text-amber-400 hover:text-amber-300 transition-colors font-semibold"
          >
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-500 shrink-0" />
          <span className="text-stone-300">{breadcrumb}</span>
        </nav>

        {/* Page Title */}
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-bold text-white tracking-tight leading-[1.2]">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="text-stone-300 text-xs sm:text-sm lg:text-[15px] max-w-3xl leading-relaxed">
          {subtitle}
        </p>

      </div>
    </div>
  );
};
