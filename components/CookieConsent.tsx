'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { setAdsConsent, getStoredAdsConsent } from '@/lib/consent';

const REOPEN_EVENT = 'mb-cookie-consent-reopen';

// Dispatched from the footer "Cookie preferences" link to re-open the banner
// after a prior choice. Imported by MarketingFooter (and any other surface
// that needs a "manage cookies" affordance).
export function openCookieConsent(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(REOPEN_EVENT));
}

export default function CookieConsent() {
  // `null` means we haven't checked storage yet — render nothing during that
  // brief window to avoid an SSR/CSR flash. Once we've checked, `true` means
  // show the banner, `false` means hide.
  const [visible, setVisible] = useState<boolean | null>(null);

  useEffect(() => {
    setVisible(getStoredAdsConsent() === null);

    const reopen = () => setVisible(true);
    window.addEventListener(REOPEN_EVENT, reopen);
    return () => window.removeEventListener(REOPEN_EVENT, reopen);
  }, []);

  if (visible !== true) return null;

  const handleAccept = () => {
    setAdsConsent('granted');
    setVisible(false);
  };

  const handleReject = () => {
    setAdsConsent('denied');
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie preferences"
      className="fixed bottom-2 left-2 right-2 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-md z-[200] bg-white border border-gray-200 rounded-lg shadow-2xl p-3 sm:p-5"
    >
      <h2 className="hidden sm:block text-sm font-semibold text-gray-900 mb-2">Cookie preferences</h2>
      <p className="text-[12px] sm:text-sm text-gray-700 leading-snug sm:leading-relaxed">
        This site uses cookies to make the app work and to collect analytics.{' '}
        <Link href="/privacy" className="underline text-gray-900 hover:text-gray-700">
          Read more
        </Link>
        .
      </p>
      <div className="mt-2.5 sm:mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleReject}
          className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Reject
        </button>
        <button
          type="button"
          onClick={handleAccept}
          aria-label="Accept"
          className="relative overflow-hidden px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-gray-900 border border-gray-900 rounded-md hover:bg-gray-800 transition-colors"
        >
          {/* Spacer keeps the natural button width and is the only label
              shown when prefers-reduced-motion is set. */}
          <span aria-hidden className="motion-safe:invisible">Accept</span>
          {/* Ticker-tape layer — slides "Accept" right-to-left through the
              button. Hidden when reduced motion is preferred. Pauses on
              hover so users can read it before clicking. */}
          <span
            aria-hidden
            className="motion-reduce:hidden absolute inset-y-0 left-0 w-full flex items-center animate-[ticker-accept_8s_linear_infinite] hover:[animation-play-state:paused]"
          >
            Accept
          </span>
          <style>{`@keyframes ticker-accept { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }`}</style>
        </button>
      </div>
    </div>
  );
}
