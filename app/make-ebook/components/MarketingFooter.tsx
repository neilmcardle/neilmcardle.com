'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/lib/hooks/useAuth';
import { openCookieConsent } from '@/components/CookieConsent';

type MarketingFooterProps = {
  onFeaturesClick?: () => void;
  onPricingClick?: () => void;
  onStartWritingClick?: () => void;
  showWordmark?: boolean;
};

export default function MarketingFooter({
  onFeaturesClick,
  onPricingClick,
  onStartWritingClick,
  showWordmark = true,
}: MarketingFooterProps) {
  const router = useRouter();
  const { user } = useAuth();

  const handleFeatures = () => {
    if (onFeaturesClick) {
      onFeaturesClick();
    } else {
      router.push('/make-ebook#features');
    }
  };

  const handlePricing = () => {
    if (onPricingClick) {
      onPricingClick();
    } else {
      router.push('/make-ebook#pricing');
    }
  };

  const handleStartWriting = () => {
    if (onStartWritingClick) {
      onStartWritingClick();
    } else if (user) {
      router.push('/make-ebook');
    } else {
      router.push('/make-ebook/signin?mode=signup');
    }
  };

  return (
    <footer className="pt-20 pb-12 sm:pt-24 sm:pb-16 border-t border-[#2f2f2f]">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">

        {showWordmark && (
          <div className="mb-16 sm:mb-20 max-w-3xl">
            <p
              className="font-serif font-bold text-white text-balance"
              style={{
                fontSize: 'clamp(1.75rem, 2.5vw + 0.75rem, 2.75rem)',
                letterSpacing: '-0.035em',
                lineHeight: 1.1,
              }}
            >
              Built for the writers who finish.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 sm:gap-10">
          <div className="col-span-2 md:col-span-4">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/make-ebook-logo.svg" alt="" width={20} height={20} className="invert opacity-60" aria-hidden="true" />
              <span className="font-serif font-bold text-white/80" style={{ fontSize: '1rem', letterSpacing: '-0.02em' }}>
                makeEbook
              </span>
            </div>
            <p className="text-sm text-white/40 max-w-xs text-pretty">
              A <a href="https://neilmcardle.com" className="underline decoration-white/20 hover:decoration-white/60 hover:text-white/70 transition-colors">neilmcardle.com</a> project. Made with care, in the open.
            </p>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs font-semibold mb-4 text-white/50 uppercase tracking-widest">Product</h4>
            <ul className="space-y-3 text-white/40">
              <li><button onClick={handleFeatures} className="hover:text-white transition-colors">Features</button></li>
              <li><button onClick={handlePricing} className="hover:text-white transition-colors">Pricing</button></li>
              <li><Link href="/make-ebook#book-mind" className="hover:text-white transition-colors">Book Mind</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs font-semibold mb-4 text-white/50 uppercase tracking-widest">Resources</h4>
            <ul className="space-y-3 text-white/40">
              <li><Link href="/make-ebook/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/make-ebook/signin" className="hover:text-white transition-colors">Sign in</Link></li>
              <li>
                <button onClick={handleStartWriting} className="hover:text-white transition-colors">
                  Start writing
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold mb-4 text-white/50 uppercase tracking-widest">Legal</h4>
            <ul className="space-y-3 text-white/40">
              <li><a href="https://neilmcardle.com/terms" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Terms</a></li>
              <li><a href="https://neilmcardle.com/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Privacy</a></li>
              <li><button onClick={openCookieConsent} className="hover:text-white transition-colors">Cookie preferences</button></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-[#2f2f2f] flex flex-wrap items-center justify-between gap-4 text-sm text-white/25">
          <p>&copy; {new Date().getFullYear()} Neil McArdle. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
}
