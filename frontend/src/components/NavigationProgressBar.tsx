'use client';

import React, { useEffect, useState, useRef, useTransition } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stepIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // When pathname or searchParams change, navigation has landed
  useEffect(() => {
    if (visible) {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
      setProgress(100);

      timerRef.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 250);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    };
  }, [pathname, searchParams]);

  // Intercept internal link clicks to give instantaneous tactile feedback
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      // Ignore right clicks or modified clicks (Ctrl, Cmd, Shift, Alt)
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
        return;
      }

      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const targetAttr = target.getAttribute('target');

      // Ignore external, download, or new-tab links
      if (!href || targetAttr === '_blank' || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      // Ignore in-page hash anchor jumps (e.g. #services on current page)
      if (href.startsWith('#')) return;

      // Extract path without hash or origin
      try {
        const url = new URL(href, window.location.href);
        const currentUrl = new URL(window.location.href);

        // If it's a completely different origin, ignore
        if (url.origin !== currentUrl.origin) return;

        // If clicking link to the exact same page without search params change, ignore
        if (url.pathname === currentUrl.pathname && url.search === currentUrl.search) {
          return;
        }

        // Start instant visual feedback
        if (timerRef.current) clearTimeout(timerRef.current);
        if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);

        setVisible(true);
        setProgress(28);

        // Simulate realistic progress steps while next.js prepares the page
        stepIntervalRef.current = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 88) {
              if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
              return 88;
            }
            return prev + Math.floor(Math.random() * 12 + 6);
          });
        }, 120);
      } catch {
        // Fallback for relative or malformed URLs
      }
    };

    document.addEventListener('click', handleLinkClick, { capture: true });

    return () => {
      document.removeEventListener('click', handleLinkClick, { capture: true });
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      role="progressbar"
      aria-label="Page loading"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[3px] bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-200 transition-all duration-200 ease-out shadow-[0_0_12px_rgba(245,158,11,0.85)]"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
        }}
      />
    </div>
  );
}
