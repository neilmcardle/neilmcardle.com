"use client";

import React from "react";
import { useRouter } from "next/navigation";

import AdsTracking from "@/components/AdsTracking";
import MarketingLandingPage from "../make-ebook/components/MarketingLandingPage";

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
