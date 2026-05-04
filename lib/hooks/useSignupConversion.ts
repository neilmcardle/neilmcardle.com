'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import '@/lib/types/gtag';

const CONVERSION_SEND_TO = 'AW-943391250/Y10bCIK-vqccEJKE7MED';
const CONVERSION_VALUE = 1.0;
const CONVERSION_CURRENCY = 'GBP';

// Fires the Google Ads signup conversion exactly once when the page loads
// with ?signup=success in the URL — set by the auth callback for brand-new
// users only. The param is stripped immediately after so a refresh doesn't
// double-count and the URL stays clean.
//
// Why a param instead of firing on /make-ebook page load: that URL is also
// the marketing homepage and the editor for returning users, so a naive
// page-load fire would count every visit as a conversion.
export function useSignupConversion() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    if (searchParams?.get('signup') !== 'success') return;
    if (typeof window === 'undefined') return;

    firedRef.current = true;

    // gtag's stub pushes onto window.dataLayer synchronously, so the
    // conversion is enqueued before the navigation below. If the loader
    // script hasn't executed yet (slow network, blocked by an extension),
    // fall back to pushing the same event onto dataLayer directly — the
    // queue is drained in order once the script lands.
    const eventParams = {
      send_to: CONVERSION_SEND_TO,
      value: CONVERSION_VALUE,
      currency: CONVERSION_CURRENCY,
    };

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', eventParams);
    } else {
      window.dataLayer = window.dataLayer ?? [];
      window.dataLayer.push(['event', 'conversion', eventParams]);
    }

    // Strip ?signup=success without adding a history entry so back/refresh
    // can't replay the conversion.
    const next = new URLSearchParams(searchParams.toString());
    next.delete('signup');
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);
}
