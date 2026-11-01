'use client';

import { useEffect, useRef } from 'react';

/**
 * AstroVD Central Scroll Lock Manager
 *
 * Coordinates modal dialogs, drawers, popups, and full-page overlays.
 * Features:
 * - Reference-counted locks for nested overlays (e.g. login modal over another modal)
 * - Restores exact background scroll position without jumping to top
 * - Compensates for scrollbar width to prevent layout shift
 * - Pauses and resumes Lenis smooth momentum scrolling safely
 * - Enforces overscroll-behavior: contain to eliminate scroll chaining
 * - Fully supports desktop mouse wheel, trackpad, and mobile touch gestures
 */

let lockCount = 0;
let savedScrollY = 0;
let originalHtmlOverflow = '';
let originalBodyOverflow = '';
let originalBodyPaddingRight = '';

export function getScrollLockCount(): number {
  return lockCount;
}

export function isScrollLocked(): boolean {
  return lockCount > 0;
}

export function lockScroll(): void {
  if (typeof window === 'undefined') return;

  lockCount++;

  if (lockCount === 1) {
    // 1. Capture exact current scroll position before modifying styles
    savedScrollY =
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    // 2. Prevent layout shift caused by disappearing vertical scrollbar
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    originalBodyPaddingRight = document.body.style.paddingRight || '';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // 3. Save original overflow values
    originalHtmlOverflow = document.documentElement.style.overflow || '';
    originalBodyOverflow = document.body.style.overflow || '';

    // 4. Lock both html and body elements
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    // 5. Add custom CSS classes for styling hooks and overscroll containment
    document.documentElement.classList.add('scroll-locked');
    document.body.classList.add('scroll-locked');

    // 6. Stop Lenis smooth scroll momentum engine safely
    if (
      (window as any).__lenis &&
      typeof (window as any).__lenis.stop === 'function'
    ) {
      try {
        (window as any).__lenis.stop();
      } catch (err) {
        console.error('Error stopping Lenis on scroll lock:', err);
      }
    }
  }
}

export function unlockScroll(): void {
  if (typeof window === 'undefined') return;

  if (lockCount <= 0) {
    lockCount = 0;
    return;
  }

  lockCount--;

  if (lockCount === 0) {
    // 1. Restore styles
    document.documentElement.style.overflow = originalHtmlOverflow;
    document.body.style.overflow = originalBodyOverflow;
    document.body.style.paddingRight = originalBodyPaddingRight;

    // 2. Remove CSS classes
    document.documentElement.classList.remove('scroll-locked');
    document.body.classList.remove('scroll-locked');

    // 3. Restart Lenis smooth momentum engine safely
    if (
      (window as any).__lenis &&
      typeof (window as any).__lenis.start === 'function'
    ) {
      try {
        (window as any).__lenis.start();
      } catch (err) {
        console.error('Error resuming Lenis on scroll unlock:', err);
      }
    }

    // 4. Restore original scroll position precisely without jumping to top
    const targetScrollY = savedScrollY;
    window.scrollTo({
      top: targetScrollY,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    });

    // Reset saved state
    savedScrollY = 0;
    originalHtmlOverflow = '';
    originalBodyOverflow = '';
    originalBodyPaddingRight = '';
  }
}

/**
 * React Hook for automatic scroll locking while an overlay is open.
 * Safely handles mounting, unmounting, nested modals, and cleanup.
 *
 * @param isOpen Boolean indicating whether the overlay/modal is open
 */
export function useScrollLock(isOpen: boolean): void {
  const isLockedRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      if (!isLockedRef.current) {
        lockScroll();
        isLockedRef.current = true;
      }
    } else {
      if (isLockedRef.current) {
        unlockScroll();
        isLockedRef.current = false;
      }
    }

    return () => {
      if (isLockedRef.current) {
        unlockScroll();
        isLockedRef.current = false;
      }
    };
  }, [isOpen]);
}
