"use client";

import React from "react";
import { useRouter } from "next/navigation";

import AdsTracking from "@/components/AdsTracking";
import MarketingLandingPage from "../make-ebook/components/MarketingLandingPage";

// Dedicated landing page for paid-search (Google Ads) traffic. Renders the
// standard marketing surface with the top nav stripped — visitors get a
// single conversion target (the hero "Start writing" button) instead of
// competing nav links (Features, Pricing, Blog, Sign in).
export default function StartPage() {
  const router = useRouter();
  return (
    <>
      <MarketingLandingPage
        hideNav
        onStartWritingAction={() => router.push("/make-ebook")}
        libraryCount={0}
      />
      <AdsTracking />
    </>
  );
}
