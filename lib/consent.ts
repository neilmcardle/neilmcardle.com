"use client";

import "@/lib/types/gtag";

const CONSENT_KEY = "mb-ads-consent";

export type AdsConsent = "granted" | "denied";

export const CONSENT_EVENT = "mb-ads-consent-change";

export function setAdsConsent(state: AdsConsent): void {
  if (typeof window === "undefined") return;

  window.gtag?.("consent", "update", {
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
    analytics_storage: state,
  });

  try {
    localStorage.setItem(CONSENT_KEY, state);
  } catch {}

  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }));
}

export function getStoredAdsConsent(): AdsConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function clearStoredAdsConsent(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CONSENT_KEY);
  } catch {}
}
