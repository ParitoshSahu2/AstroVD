'use client';

import React from 'react';

interface SectionDividerProps {
  className?: string;
}

export const SectionDivider: React.FC<SectionDividerProps> = ({ className = '' }) => {
  return (
    <div className={`w-full flex items-center justify-center py-3 sm:py-5 px-4 overflow-hidden pointer-events-none select-none relative z-20 ${className}`}>
      <img
        src="/ornaments/section_divider.png"
        alt="Sacred Vedic Section Divider"
        className="w-full max-w-[280px] sm:max-w-[380px] md:max-w-[460px] h-auto object-contain opacity-85 hover:opacity-100 transition-opacity"
      />
    </div>
  );
};
