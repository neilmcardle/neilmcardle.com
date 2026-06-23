'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, Menu, X } from 'lucide-react';

import { useAuth } from '@/lib/hooks/useAuth';

type MarketingNavProps = {
  onFeaturesClick?: () => void;
  onPricingClick?: () => void;
  onMyBooksClick?: () => void;
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
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const drawer = mobileMenuRef.current;
    if (!drawer) return;

    const focusable = drawer.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    focusable[0]?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (e.key !== 'Tab') return;

      const items = drawer.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

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
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    } else {
      router.push('/make-ebook');
    }
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        navScrolled || mobileMenuOpen
          ? 'bg-[#1e1e1e]/90 backdrop-blur-lg border-b border-[#2f2f2f]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between" style={{ height: '4.5rem' }}>
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
            aria-label="makeEbook home"
          >
            <Image src="/make-ebook-logo.svg" alt="" width={22} height={22} className="invert" aria-hidden="true" />
            <span className="font-serif font-bold text-white" style={{ fontSize: '1.0625rem', letterSpacing: '-0.02em' }}>
              makeEbook
            </span>
          </button>

          <div className="hidden md:flex items-center gap-10">
            <button
              onClick={handleFeatures}
              className="text-sm text-white/55 hover:text-white transition-colors"
            >
              Features
            </button>
            <button
              onClick={handlePricing}
              className="text-sm text-white/55 hover:text-white transition-colors"
            >
              Pricing
            </button>
            <Link
              href="/make-ebook/blog"
              className="text-sm text-white/55 hover:text-white transition-colors"
            >
              Blog
            </Link>
            {user ? (
              <div className="flex items-center gap-6 pl-4 ml-2 border-l border-white/10">
                <button
                  onClick={() => signOut()}
                  className="text-sm text-white/55 hover:text-white transition-colors"
                >
                  Sign out
                </button>
                <button
                  onClick={handleMyBooks}
                  className="px-5 py-2 text-sm font-semibold bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                >
                  My books{libraryCount > 0 && ` (${libraryCount})`}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-6 pl-4 ml-2 border-l border-white/10">
                <button
                  onClick={handleSignIn}
                  className="text-sm text-white/55 hover:text-white transition-colors"
                >
                  Sign in
                </button>
                <button
                  onClick={handleSignUp}
                  className="px-5 py-2 text-sm font-semibold bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                >
                  Start writing
                </button>
              </div>
            )}
          </div>

          <button
            ref={menuButtonRef}
            className="md:hidden -mr-2 p-2 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="marketing-mobile-menu"
          >
            {mobileMenuOpen ? <X size={26} strokeWidth={1.75} /> : <Menu size={26} strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          id="marketing-mobile-menu"
          className="md:hidden border-t border-[#2f2f2f] bg-[#1e1e1e]"
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-10 py-8 sm:py-10">
            <ul className="space-y-1 font-serif">
              <li>
                <button
                  onClick={handleFeatures}
                  className="block w-full text-left py-3 text-3xl font-bold text-white hover:opacity-70 transition-opacity"
                  style={{ letterSpacing: '-0.025em' }}
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={handlePricing}
                  className="block w-full text-left py-3 text-3xl font-bold text-white hover:opacity-70 transition-opacity"
                  style={{ letterSpacing: '-0.025em' }}
                >
                  Pricing
                </button>
              </li>
              <li>
                <Link
                  href="/make-ebook/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left py-3 text-3xl font-bold text-white hover:opacity-70 transition-opacity"
                  style={{ letterSpacing: '-0.025em' }}
                >
                  Blog
                </Link>
              </li>
            </ul>

            <div className="mt-8 pt-8 border-t border-[#2f2f2f]">
              {user ? (
                <div className="space-y-4">
                  <button
                    onClick={handleMyBooks}
                    className="group w-full px-6 py-4 text-base font-semibold bg-white text-gray-900 rounded-full inline-flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                  >
                    My books{libraryCount > 0 && ` (${libraryCount})`}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => { signOut(); setMobileMenuOpen(false); }}
                    className="block w-full text-center text-sm text-white/50 hover:text-white transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={handleSignUp}
                    className="group w-full px-6 py-4 text-base font-semibold bg-white text-gray-900 rounded-full inline-flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                  >
                    Start writing
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={handleSignIn}
                    className="block w-full text-center text-sm text-white/50 hover:text-white transition-colors"
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
