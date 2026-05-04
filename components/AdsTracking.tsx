'use client';

import Script from 'next/script';

import CookieConsent from './CookieConsent';

// Bundles everything needed for Google Ads conversion tracking:
//  • Consent Mode v2 default-denied (must run before the gtag loader)
//  • The gtag.js loader for AW-943391250
//  • gtag config + js init
//  • The cookie consent banner the user uses to grant/withdraw consent
//
// Mount this only on routes where ad attribution matters — the makeEbook
// surface (where the conversion fires) and the /start landing page (where
// gtag captures the ?gclid from a Google Ads click). Mounting it in the
// root layout would load gtag on the personal-portfolio routes too, which
// would force a cookie banner there for no commercial benefit.
//
// next/script dedupes by `id`, so mounting this on two routes that the user
// navigates between (e.g. /start → /make-ebook) does not re-execute the
// scripts. Consent state lives in window/localStorage and survives the
// client-side navigation.
export default function AdsTracking() {
  return (
    <>
      <Script id="gtag-consent" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            wait_for_update: 500
          });
        `}
      </Script>
      <Script
        id="gtag-loader"
        src="https://www.googletagmanager.com/gtag/js?id=AW-943391250"
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          gtag('js', new Date());
          gtag('config', 'AW-943391250');
        `}
      </Script>
      <CookieConsent />
    </>
  );
}
