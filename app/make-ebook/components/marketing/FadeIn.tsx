'use client';

import React, { useState, useRef, useEffect } from 'react';

// Shared IntersectionObserver for all FadeIn instances. One observer instance
// across the page is significantly cheaper than creating one per FadeIn,
// especially on the marketing landing where ~15 fade-ins coexist.
const fadeObserverCallbacks = new WeakMap<Element, () => void>();
let sharedFadeObserver: IntersectionObserver | null = null;

function getSharedFadeObserver() {
  if (!sharedFadeObserver) {
    sharedFadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            fadeObserverCallbacks.get(entry.target)?.();
            sharedFadeObserver?.unobserve(entry.target);
            fadeObserverCallbacks.delete(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
  }
  return sharedFadeObserver;
}

type FadeInProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
};

/**
 * Fades and translates its children up by 48px when scrolled into view.
 * Honors prefers-reduced-motion automatically.
 */
export default function FadeIn({ children, delay = 0, className = '' }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    if (mq.matches) { setVisible(true); return; }

    const el = ref.current;
    if (!el) return;
    const observer = getSharedFadeObserver();
    fadeObserverCallbacks.set(el, () => setVisible(true));
    observer.observe(el);
    return () => { observer.unobserve(el); fadeObserverCallbacks.delete(el); };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={prefersReducedMotion ? {} : {
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(48px)',
        transition: `opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
