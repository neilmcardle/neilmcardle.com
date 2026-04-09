'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Menu, X } from 'lucide-react';

import { useAuth } from '@/lib/hooks/useAuth';

type MarketingNavProps = {
  /**
   * If provided, intercepts the Features link click. Used by the marketing
   * page to perform an in-page smooth scroll. On other pages (blog, etc.) the
   * nav falls back to navigating to /make-ebook#features.
   */
  onFeaturesClick?: () => void;
  /** Same as onFeaturesClick but for Pricing. */
  onPricingClick?: () => void;
  /**
   * Optional override for the logged-in primary CTA ("My books"). Used by the
   * marketing page to call the inline editor opener. Defaults to navigating to
   * /make-ebook.
   */
  onMyBooksClick?: () => void;
  /** Library size badge appended to "My books" when > 0. */
  libraryCount?: number;
};

export default function MarketingNav({
  onFeaturesClick,
  onPricingClick,
  onMyBooksClick,
  libraryCount = 0,
}: MarketingNavProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);

  // Borderless at top, blurred + bordered after scroll
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleFeatures = () => {
    if (onFeaturesClick) {
      onFeaturesClick();
    } else {
      router.push('/make-ebook#features');
    }
    setMobileMenuOpen(false);
  };

  const handlePricing = () => {
    if (onPricingClick) {
      onPricingClick();
    } else {
      router.push('/make-ebook#pricing');
    }
    setMobileMenuOpen(false);
  };

  const handleMyBooks = () => {
    if (onMyBooksClick) {
      onMyBooksClick();
    } else {
      router.push('/make-ebook');
    }
    setMobileMenuOpen(false);
  };

  const handleSignUp = () => {
    router.push('/make-ebook/signin?mode=signup');
    setMobileMenuOpen(false);
  };

  const handleSignIn = () => {
    router.push('/make-ebook/signin?mode=signin');
    setMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    if (typeof window !== 'undefined' && window.location.pathname === '/make-ebook') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push('/make-ebook');
    }
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        navScrolled || mobileMenuOpen
          ? 'bg-[#faf9f5]/85 backdrop-blur-lg border-b border-gray-200/80'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between" style={{ height: '4.5rem' }}>
          {/* Logo */}
          <button
            onClick={handleLogoClick}
            className="flex items-center hover:opacity-70 transition-opacity"
            aria-label="makeEbook home"
          >
            <Image
              src="/make-ebook-logomark.svg"
              alt="makeEbook"
              width={120}
              height={24}
              className="h-6 w-auto"
              priority
            />
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            <button
              onClick={handleFeatures}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Features
            </button>
            <button
              onClick={handlePricing}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Pricing
            </button>
            <Link
              href="/make-ebook/blog"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Blog
            </Link>
            {user ? (
              <div className="flex items-center gap-6 pl-4 ml-2 border-l border-gray-200/60">
                <button
                  onClick={() => signOut()}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign out
                </button>
                <button
                  onClick={handleMyBooks}
                  className="px-5 py-2 text-sm font-semibold bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
                >
                  My books{libraryCount > 0 && ` (${libraryCount})`}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-6 pl-4 ml-2 border-l border-gray-200/60">
                <button
                  onClick={handleSignIn}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign in
                </button>
                <button
                  onClick={handleSignUp}
                  className="px-5 py-2 text-sm font-semibold bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
                >
                  Start writing
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden -mr-2 p-2 text-gray-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={26} strokeWidth={1.75} /> : <Menu size={26} strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      {/* Mobile menu — editorial drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200/80 bg-[#faf9f5]">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 py-8 sm:py-10">
            <ul className="space-y-1 font-serif">
              <li>
                <button
                  onClick={handleFeatures}
                  className="block w-full text-left py-3 text-3xl font-bold text-gray-900 hover:opacity-70 transition-opacity"
                  style={{ letterSpacing: '-0.025em' }}
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={handlePricing}
                  className="block w-full text-left py-3 text-3xl font-bold text-gray-900 hover:opacity-70 transition-opacity"
                  style={{ letterSpacing: '-0.025em' }}
                >
                  Pricing
                </button>
              </li>
              <li>
                <Link
                  href="/make-ebook/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left py-3 text-3xl font-bold text-gray-900 hover:opacity-70 transition-opacity"
                  style={{ letterSpacing: '-0.025em' }}
                >
                  Blog
                </Link>
              </li>
            </ul>

            <div className="mt-8 pt-8 border-t border-gray-200">
              {user ? (
                <div className="space-y-4">
                  <button
                    onClick={handleMyBooks}
                    className="group w-full px-6 py-4 text-base font-semibold bg-gray-900 text-white rounded-full inline-flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                  >
                    My books{libraryCount > 0 && ` (${libraryCount})`}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => { signOut(); setMobileMenuOpen(false); }}
                    className="block w-full text-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={handleSignUp}
                    className="group w-full px-6 py-4 text-base font-semibold bg-gray-900 text-white rounded-full inline-flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                  >
                    Start writing
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={handleSignIn}
                    className="block w-full text-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Already have an account? Sign in
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
