"use client"

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/lib/hooks/useAuth';

import MarketingNav from './MarketingNav';
import MarketingFooter from './MarketingFooter';
import VideoLightbox from './marketing/VideoLightbox';
import HeroSection from './marketing/sections/HeroSection';
import HowItWorksSection from './marketing/sections/HowItWorksSection';
import EditorShowcaseSection from './marketing/sections/EditorShowcaseSection';
import LivePreviewerSection from './marketing/sections/LivePreviewerSection';
import BookMindPitchSection from './marketing/sections/BookMindPitchSection';
import BookMindFeaturesSection from './marketing/sections/BookMindFeaturesSection';
import TestimonialSection from './marketing/sections/TestimonialSection';
import PricingSection from './marketing/sections/PricingSection';
import FinalCtaSection from './marketing/sections/FinalCtaSection';

interface MarketingLandingPageProps {
  onStartWritingAction: () => void;
  libraryCount: number;
}

export default function MarketingLandingPage({ onStartWritingAction, libraryCount }: MarketingLandingPageProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [checkoutLoading, setCheckoutLoading] = useState<'pro' | 'lifetime' | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);

  const featuresRef = useRef<HTMLElement>(null);
  const pricingRef = useRef<HTMLElement>(null);

  const handleOpenAuth = (mode: 'signin' | 'signup') => {
    router.push(`/make-ebook/signin?mode=${mode}`);
  };

  const handleCheckout = async (type: 'pro' | 'lifetime') => {
    setCheckoutLoading(type);
    setCheckoutError(null);
    try {
      const endpoint = type === 'lifetime' ? '/api/checkout-lifetime' : '/api/checkout';
      const response = await fetch(endpoint, { method: 'POST', credentials: 'include' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to start checkout');
      if (data.url) window.location.href = data.url;
    } catch (err: any) {
      console.error('Checkout error:', err);
      setCheckoutError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    const reduce = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    ref.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };

  const startWriting = user ? onStartWritingAction : () => handleOpenAuth('signup');

  return (
    <div className="relative min-h-screen bg-me-cream text-gray-700 overflow-x-hidden">

      <MarketingNav
        onFeaturesClick={() => scrollToSection(featuresRef)}
        onPricingClick={() => scrollToSection(pricingRef)}
        onMyBooksClick={onStartWritingAction}
        libraryCount={libraryCount}
      />

      <main id="main-content">
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
      </main>

      <MarketingFooter
        onFeaturesClick={() => scrollToSection(featuresRef)}
        onPricingClick={() => scrollToSection(pricingRef)}
        onStartWritingClick={startWriting}
      />

      <VideoLightbox
        open={videoOpen}
        onClose={() => setVideoOpen(false)}
      />

    </div>
  );
}
