"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

import CookieConsent from "./CookieConsent";
import {
  CONSENT_EVENT,
  getStoredAdsConsent,
  type AdsConsent,
} from "@/lib/consent";

export default function AdsTracking() {
  const [consent, setConsent] = useState<AdsConsent | null>(null);

  useEffect(() => {
    setConsent(getStoredAdsConsent());
    const onChange = (event: Event) => {
      const next = (event as CustomEvent<AdsConsent>).detail;
      setConsent(next === "granted" || next === "denied" ? next : null);
    };
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  return (
    <>
      {consent === "granted" && (
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
                analytics_storage: 'denied'
              });
              gtag('consent', 'update', {
                ad_storage: 'granted',
                ad_user_data: 'granted',
                ad_personalization: 'granted',
                analytics_storage: 'granted'
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
        </>
      )}
      <CookieConsent />
    </>
  );
}
