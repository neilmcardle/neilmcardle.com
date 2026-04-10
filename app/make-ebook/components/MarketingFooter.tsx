'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/lib/hooks/useAuth';

type MarketingFooterProps = {
  /**
   * If provided, intercepts the Features link click. Used by the marketing
   * page to perform an in-page smooth scroll. On other pages (blog, signin)
   * the footer falls back to navigating to /make-ebook#features.
   */
  onFeaturesClick?: () => void;
  /** Same as onFeaturesClick but for Pricing. */
  onPricingClick?: () => void;
  /**
   * Optional override for the "Start writing" link. Used by the marketing
   * page to call the inline editor opener. Defaults to navigating to
   * /make-ebook/signin?mode=signup (or /make-ebook for logged-in users).
   */
  onStartWritingClick?: () => void;
  /**
   * If false, hide the wordmark statement at the top of the footer. Use this
   * on smaller pages (blog post articles, signin) where the wordmark feels
   * oversized. Defaults to true.
   */
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
    <footer className="pt-20 pb-12 sm:pt-24 sm:pb-16 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">

        {/* Wordmark moment — quiet typographic anchor */}
        {showWordmark && (
          <div className="mb-16 sm:mb-20 max-w-3xl">
            <p
              className="font-serif font-bold text-gray-900 text-balance"
              style={{
                fontSize: 'clamp(1.75rem, 2.5vw + 0.75rem, 2.75rem)',
                letterSpacing: '-0.035em',
                lineHeight: 1.1,
              }}
            >
              Built for the writers who finish.
            </p>
            <p
              className="mt-4 text-gray-600 max-w-md text-pretty"
              style={{ fontFamily: 'Georgia, serif', lineHeight: 1.55 }}
            >
              makeEbook is made in the open by a single person who wanted Scrivener without the friction.
            </p>
          </div>
        )}

        {/* Link grid */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 sm:gap-10">
          <div className="col-span-2 md:col-span-4">
            <div className="flex items-center mb-4">
              <Image
                src="/make-ebook-logomark.svg"
                alt="makeEbook"
                width={120}
                height={24}
                className="h-6 w-auto"
              />
            </div>
            <p className="text-sm text-gray-600 max-w-xs text-pretty">
              A <a href="https://neilmcardle.com" className="underline decoration-gray-300 hover:decoration-gray-700 hover:text-gray-900">neilmcardle.com</a> project. Made with care, in the open.
            </p>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs font-semibold mb-4 text-gray-900 uppercase tracking-widest">Product</h4>
            <ul className="space-y-3 text-gray-600">
              <li><button onClick={handleFeatures} className="hover:text-gray-900 transition-colors">Features</button></li>
              <li><button onClick={handlePricing} className="hover:text-gray-900 transition-colors">Pricing</button></li>
              <li><Link href="/make-ebook/book-mind" className="hover:text-gray-900 transition-colors">Book Mind</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs font-semibold mb-4 text-gray-900 uppercase tracking-widest">Resources</h4>
            <ul className="space-y-3 text-gray-600">
              <li><Link href="/make-ebook/blog" className="hover:text-gray-900 transition-colors">Blog</Link></li>
              <li><Link href="/make-ebook/signin" className="hover:text-gray-900 transition-colors">Sign in</Link></li>
              <li>
                <button onClick={handleStartWriting} className="hover:text-gray-900 transition-colors">
                  Start writing
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold mb-4 text-gray-900 uppercase tracking-widest">Legal</h4>
            <ul className="space-y-3 text-gray-600">
              <li><a href="https://neilmcardle.com/terms" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">Terms</a></li>
              <li><a href="https://neilmcardle.com/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">Privacy</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Neil McArdle. All rights reserved.</p>
          <p className="font-serif italic">Write the book you&rsquo;ve been putting off.</p>
        </div>

      </div>
    </footer>
  );
}
