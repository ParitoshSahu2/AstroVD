'use client';

import { useEffect, useRef } from 'react';

/**
 * AstroVD Central Scroll Lock & Active Modal Scroll Coordinator
 *
 * Coordinates modal dialogs, drawers, popups, and full-page overlays.
 * Features:
 * - Reference-counted locks for nested overlays (e.g. login modal over another modal)
 * - Automatically directs mouse cursor wheel and arrow keys (Up / Down / PageUp / PageDown)
 *   to scroll the ACTIVE FOREGROUND modal instead of the background page
 * - Completely freezes background page scrolling without jumping to top
 * - Compensates for scrollbar width to prevent layout shift
 * - Pauses and resumes Lenis smooth momentum scrolling safely
 * - Enforces overscroll-behavior: contain to eliminate scroll chaining
 * - Fully supports desktop mouse wheel, trackpad, arrow keys, and mobile touch gestures
 */

let lockCount = 0;
let savedScrollY = 0;
let originalHtmlOverflow = '';
let originalBodyOverflow = '';
let originalBodyPaddingRight = '';
let touchStartY = 0;

export function getScrollLockCount(): number {
  return lockCount;
}

export function isScrollLocked(): boolean {
  return lockCount > 0;
}

/**
 * Checks if a given DOM element can genuinely scroll vertically
 */
function isElementScrollable(el: HTMLElement): boolean {
  if (!el || el.scrollHeight <= el.clientHeight) return false;
  const style = window.getComputedStyle(el);
  const overflowY = style.overflowY;
  return overflowY === 'auto' || overflowY === 'scroll';
}

/**
 * Finds the topmost visible modal's primary scrollable element
 */
function getTopmostScrollableElement(target?: EventTarget | null): HTMLElement | null {
  if (typeof document === 'undefined') return null;

  // 1. Walk up from target to find the nearest ancestor that actually has overflow-y: auto/scroll AND scrollHeight > clientHeight
  if (target instanceof HTMLElement) {
    let curr: HTMLElement | null = target;
    while (curr && curr !== document.body && curr !== document.documentElement) {
      if (isElementScrollable(curr)) {
        return curr;
      }
      curr = curr.parentElement;
    }
  }

  // 2. Scan active visible modals from top to bottom and find the actual scrollable container inside
  const modals = document.querySelectorAll(
    '[role="dialog"], .fixed.z-50, .fixed.inset-0, .fixed.z-\\[100\\], .fixed.z-40'
  );
  for (let i = modals.length - 1; i >= 0; i--) {
    const modal = modals[i] as HTMLElement;
    const style = window.getComputedStyle(modal);
    if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
      const allDescendants = modal.querySelectorAll<HTMLElement>(
        'form, .overflow-y-auto, .overflow-y-scroll, .modal-scroll-container, [data-lenis-prevent], div'
      );
      for (let j = 0; j < allDescendants.length; j++) {
        const desc = allDescendants[j];
        if (isElementScrollable(desc)) {
          return desc;
        }
      }
      if (isElementScrollable(modal)) {
        return modal;
      }
    }
  }
  return null;
}

/**
 * Global wheel interceptor while an overlay/modal is active:
 * - When hovering inside a scrollable modal container, native trackpad/mousewheel works naturally
 * - When reaching top or bottom boundary, prevents scroll chaining to background
 * - When hovering on backdrop or header outside the scrollable body, routes scroll to the modal
 */
function handleLockedWheel(e: WheelEvent) {
  if (lockCount <= 0) return;

  const scrollEl = getTopmostScrollableElement(e.target);
  if (!scrollEl) {
    // No scrollable modal found; freeze background window scroll completely
    e.preventDefault();
    return;
  }

  // If hovering outside the scrollable body (e.g. on backdrop, header, or padding),
  // scroll the modal container directly:
  if (!(e.target instanceof HTMLElement) || !scrollEl.contains(e.target)) {
    e.preventDefault();
    e.stopPropagation();
    scrollEl.scrollTop += e.deltaY;
    return;
  }

  // If hovering directly inside the scrollable container, check top/bottom boundary
  // to eliminate scroll chaining into the background window:
  const atTop = scrollEl.scrollTop <= 0 && e.deltaY < 0;
  const atBottom =
    scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 1 && e.deltaY > 0;
  if (atTop || atBottom) {
    e.preventDefault();
  }
}

/**
 * Global keyboard interceptor while an overlay/modal is active:
 * - Directs Up / Down / PageUp / PageDown / Home / End keys to scroll the active modal
 * - Lets user type normally if focused on input/textarea/select
 */
function handleLockedKeyDown(e: KeyboardEvent) {
  if (lockCount <= 0) return;

  const scrollKeys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '];
  if (!scrollKeys.includes(e.key)) return;

  const active = document.activeElement;
  if (
    active &&
    (active.tagName === 'INPUT' ||
      active.tagName === 'TEXTAREA' ||
      active.tagName === 'SELECT' ||
      (active as HTMLElement).isContentEditable)
  ) {
    return;
  }

  const scrollEl = getTopmostScrollableElement(active);
  if (scrollEl) {
    e.preventDefault();
    let delta = 0;
    if (e.key === 'ArrowDown') delta = 70;
    else if (e.key === 'ArrowUp') delta = -70;
    else if (e.key === 'PageDown' || e.key === ' ') delta = 320;
    else if (e.key === 'PageUp') delta = -320;
    else if (e.key === 'Home') delta = -scrollEl.scrollHeight;
    else if (e.key === 'End') delta = scrollEl.scrollHeight;

    scrollEl.scrollBy({ top: delta, behavior: 'smooth' });
  } else {
    e.preventDefault();
  }
}

function handleLockedTouchStart(e: TouchEvent) {
  if (e.touches.length === 1) {
    touchStartY = e.touches[0].clientY;
  }
}

function handleLockedTouchMove(e: TouchEvent) {
  if (lockCount <= 0) return;
  if (e.touches.length !== 1) return;

  const scrollEl = getTopmostScrollableElement(e.target);
  if (!scrollEl) {
    e.preventDefault();
    return;
  }

  const currentY = e.touches[0].clientY;
  const deltaY = touchStartY - currentY;

  if (!(e.target instanceof HTMLElement) || !scrollEl.contains(e.target)) {
    e.preventDefault();
    scrollEl.scrollTop += deltaY;
    touchStartY = currentY;
    return;
  }

  const atTop = scrollEl.scrollTop <= 0 && deltaY < 0;
  const atBottom =
    scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 1 && deltaY > 0;
  if (atTop || atBottom) {
    e.preventDefault();
  }
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

    // 7. Attach capturing event listeners so cursor scroll and arrow keys route to active modal
    window.addEventListener('wheel', handleLockedWheel, { passive: false, capture: true });
    window.addEventListener('keydown', handleLockedKeyDown, { capture: true });
    window.addEventListener('touchstart', handleLockedTouchStart, { passive: true, capture: true });
    window.addEventListener('touchmove', handleLockedTouchMove, { passive: false, capture: true });
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
    // 1. Detach event listeners
    window.removeEventListener('wheel', handleLockedWheel, { capture: true });
    window.removeEventListener('keydown', handleLockedKeyDown, { capture: true });
    window.removeEventListener('touchstart', handleLockedTouchStart, { capture: true });
    window.removeEventListener('touchmove', handleLockedTouchMove, { capture: true });

    // 2. Restore styles
    document.documentElement.style.overflow = originalHtmlOverflow;
    document.body.style.overflow = originalBodyOverflow;
    document.body.style.paddingRight = originalBodyPaddingRight;

    // 3. Remove CSS classes
    document.documentElement.classList.remove('scroll-locked');
    document.body.classList.remove('scroll-locked');

    // 4. Restart Lenis smooth momentum engine safely
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

    // 5. Restore original scroll position precisely without jumping to top
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
