"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { track } from "@vercel/analytics";

import { useAuth } from "@/lib/hooks/useAuth";
import Image from "next/image";

import MarketingNav from "./MarketingNav";
import MarketingFooter from "./MarketingFooter";
import VideoLightbox from "./marketing/VideoLightbox";

import HeroSection from "./marketing/sections/HeroSection";
import HowItWorksSection from "./marketing/sections/HowItWorksSection";
import EditorShowcaseSection from "./marketing/sections/EditorShowcaseSection";
import LivePreviewerSection from "./marketing/sections/LivePreviewerSection";
import BookMindPitchSection from "./marketing/sections/BookMindPitchSection";
import BookMindFeaturesSection from "./marketing/sections/BookMindFeaturesSection";
import TestimonialSection from "./marketing/sections/TestimonialSection";
import PricingSection from "./marketing/sections/PricingSection";
import FinalCtaSection from "./marketing/sections/FinalCtaSection";

import HeroSectionV2 from "./marketing/sections-v2/HeroSection";
import EditorShowcaseSectionV2 from "./marketing/sections-v2/EditorShowcaseSection";
import BookMindPitchSectionV2 from "./marketing/sections-v2/BookMindPitchSection";
import BookGallerySection from "./marketing/sections-v2/BookGallerySection";
import AboutNeilSection from "./marketing/sections-v2/AboutNeilSection";
import ComparisonSection from "./marketing/sections-v2/ComparisonSection";
import FaqSection from "./marketing/sections-v2/FaqSection";
import FinalCtaSectionV2 from "./marketing/sections-v2/FinalCtaSection";

const USE_V2 = true;

interface MarketingLandingPageProps {
  onStartWritingAction: () => void;
  libraryCount: number;
  hideNav?: boolean;
}

export default function MarketingLandingPage({
  onStartWritingAction,
  libraryCount,
  hideNav = false,
}: MarketingLandingPageProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [checkoutLoading, setCheckoutLoading] = useState<
    "pro" | "lifetime" | null
  >(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);

  const featuresRef = useRef<HTMLElement>(null);
  const pricingRef = useRef<HTMLElement>(null);

  useEffect(() => {
    track("landing_viewed");
  }, []);

  const handleOpenAuth = (mode: "signin" | "signup") => {
    router.push(`/make-ebook/signin?mode=${mode}`);
  };

  const handleCheckout = async (
    type: "pro" | "lifetime",
    period: "monthly" | "yearly" = "monthly",
  ) => {
    track("upgrade_clicked", { source: "pricing_card", tier: type, period });
    track("checkout_started", { tier: type, period });
    setCheckoutLoading(type);
    setCheckoutError(null);
    try {
      const endpoint =
        type === "lifetime" ? "/api/checkout-lifetime" : "/api/checkout";
      const body = type === "pro" ? JSON.stringify({ period }) : undefined;
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body,
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to start checkout");
      if (data.url) window.location.href = data.url;
    } catch (err: any) {
      console.error("Checkout error:", err);
      setCheckoutError(
        err.message || "Something went wrong. Please try again.",
      );
    } finally {
      setCheckoutLoading(null);
    }
  };

  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ref.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };

  const startWriting = user
    ? onStartWritingAction
    : () => handleOpenAuth("signup");

  return (
    <div className="relative min-h-screen bg-[#1e1e1e] text-[#f5f5f5] overflow-x-hidden">
      {hideNav ? (
        <header className="sticky top-0 z-50 bg-transparent">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <div
              className="flex items-center gap-2"
              style={{ height: "4.5rem" }}
            >
              <Image
                src="/make-ebook-logo.svg"
                alt=""
                width={22}
                height={22}
                className="invert"
                aria-hidden="true"
              />
              <span
                className="font-serif font-bold text-white"
                style={{ fontSize: "1.0625rem", letterSpacing: "-0.02em" }}
              >
                makeEbook
              </span>
            </div>
          </div>
        </header>
      ) : (
        <MarketingNav
          onFeaturesClick={() => scrollToSection(featuresRef)}
          onPricingClick={() => scrollToSection(pricingRef)}
          onMyBooksClick={onStartWritingAction}
          libraryCount={libraryCount}
        />
      )}

      <main id="main-content">
        {USE_V2 ? (
          <>
            <HeroSectionV2 onPrimaryClick={startWriting} />

            <EditorShowcaseSectionV2 ref={featuresRef} />

            <BookMindPitchSectionV2 />

            <BookGallerySection />

            <PricingSection
              ref={pricingRef}
              onCheckout={handleCheckout}
              onFreeCtaClick={startWriting}
              checkoutLoading={checkoutLoading}
              checkoutError={checkoutError}
            />

            <AboutNeilSection />

            <ComparisonSection />

            <FaqSection />

            <FinalCtaSectionV2 onPrimaryClick={startWriting} />
          </>
        ) : (
          <>
            <HeroSection
              onPrimaryClick={startWriting}
              onWatchTourClick={() => setVideoOpen(true)}
            />

            <HowItWorksSection />

            <EditorShowcaseSection ref={featuresRef} />

            <LivePreviewerSection />

            <BookMindPitchSection />

            <BookMindFeaturesSection />

            <TestimonialSection />

            <PricingSection
              ref={pricingRef}
              onCheckout={handleCheckout}
              onFreeCtaClick={startWriting}
              checkoutLoading={checkoutLoading}
              checkoutError={checkoutError}
            />

            <FinalCtaSection onCtaClick={startWriting} />
          </>
        )}
      </main>

      <MarketingFooter
        onFeaturesClick={() => scrollToSection(featuresRef)}
        onPricingClick={() => scrollToSection(pricingRef)}
        onStartWritingClick={startWriting}
      />

      <VideoLightbox open={videoOpen} onClose={() => setVideoOpen(false)} />
    </div>
  );
}
