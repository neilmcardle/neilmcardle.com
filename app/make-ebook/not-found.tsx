import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import MarketingNav from './components/MarketingNav';
import MarketingFooter from './components/MarketingFooter';
import { SECTION_TIERS } from './components/marketing/sectionTiers';

export const metadata = {
  title: 'Page not found \u2014 makeEbook',
  description:
    'The page you were looking for has wandered off. Head back to the editor or browse the blog.',
};

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex flex-col bg-me-cream text-gray-700">
      <MarketingNav />

      <main id="main-content" className="flex-1 flex items-center px-6 sm:px-10 lg:px-16 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto w-full">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              404 &middot; Page not found
            </p>

            {/* Headline */}
            <h1
              className="mt-4 font-serif font-bold text-gray-900 text-balance"
              style={SECTION_TIERS.cinematic.title}
            >
              This page didn&rsquo;t make it into the book.
            </h1>

            {/* Sub */}
            <p
              className="mt-6 text-xl sm:text-2xl text-gray-600 max-w-xl text-pretty"
              style={{ fontFamily: 'Georgia, serif', lineHeight: 1.5 }}
            >
              The link you followed may be broken, or the page may have moved. Either way, the editor is still waiting.
            </p>

            {/* CTAs */}
            <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-5">
              <Link
                href="/make-ebook"
                className="group px-8 py-4 text-base sm:text-lg font-semibold bg-gray-900 text-white rounded-full inline-flex items-center gap-2 hover:bg-gray-800 transition-colors"
              >
                Back to the homepage
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/make-ebook/blog"
                className="group inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium underline-offset-4 decoration-gray-300 hover:underline"
              >
                Read the blog
                <span aria-hidden className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter showWordmark={false} />
    </div>
  );
}
