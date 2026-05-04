'use client';

import '@/lib/types/gtag';

// Consent Mode v2 helper. The cookie banner calls setAdsConsent('granted')
// when the visitor accepts ads/analytics cookies, and 'denied' when they
// reject (or revoke a prior acceptance). The default — set in app/layout.tsx
// before gtag.js loads — is 'denied' for UK GDPR / PECR compliance, so this
// function only needs to be called when the user actively makes a choice.
//
// Persistence: we mirror the choice in localStorage under CONSENT_KEY so the
// banner can re-apply the user's prior decision on subsequent visits without
// re-prompting. The cookie banner is responsible for reading this key on
// mount and calling setAdsConsent with the stored value.

const CONSENT_KEY = 'mb-ads-consent';

export type AdsConsent = 'granted' | 'denied';

export function setAdsConsent(state: AdsConsent): void {
  if (typeof window === 'undefined') return;

  window.gtag?.('consent', 'update', {
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
    analytics_storage: state,
  });

  try {
    localStorage.setItem(CONSENT_KEY, state);
  } catch {
    // Private mode / storage disabled — non-fatal.
  }
}

export function getStoredAdsConsent(): AdsConsent | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

export function clearStoredAdsConsent(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CONSENT_KEY);
  } catch {
    // Non-fatal.
  }
}
