"use client"

import React, { useState, useRef, useEffect } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/lib/hooks/useAuth';
import {
  BookOpen,
  Sparkles,
  Cloud,
  FileText,
  Palette,
  Languages,
  ChevronRight,
  ArrowRight,
  Menu,
  X,
  Eye,
} from 'lucide-react';

// Shared IntersectionObserver for all FadeIn instances
const fadeObserverCallbacks = new WeakMap<Element, () => void>();
let sharedFadeObserver: IntersectionObserver | null = null;

function getSharedFadeObserver() {
  if (!sharedFadeObserver) {
    sharedFadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            fadeObserverCallbacks.get(entry.target)?.();
            sharedFadeObserver?.unobserve(entry.target);
            fadeObserverCallbacks.delete(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
  }
  return sharedFadeObserver;
}

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    if (mq.matches) { setVisible(true); return; }

    const el = ref.current;
    if (!el) return;
    const observer = getSharedFadeObserver();
    fadeObserverCallbacks.set(el, () => setVisible(true));
    observer.observe(el);
    return () => { observer.unobserve(el); fadeObserverCallbacks.delete(el); };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={prefersReducedMotion ? {} : {
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(48px)',
        transition: `opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Write your book',
    description: 'Use the distraction-free editor to write chapter by chapter. Drag and drop to reorganise anytime.',
  },
  {
    step: '02',
    title: 'Polish with AI',
    description: 'Book Mind reads your entire manuscript, catching inconsistencies, summarising chapters, and surfacing insights.',
  },
  {
    step: '03',
    title: 'Export everywhere',
    description: 'Download a publication-ready EPUB in one click. Ready for Amazon KDP, Apple Books, Kobo, and more.',
  },
];

interface MarketingLandingPageProps {
  onStartWritingAction: () => void;
  libraryCount: number;
}

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Professional EPUB Export',
    description: 'Export publication-ready EPUB files for Amazon KDP, Apple Books, Kobo, and all major publishing platforms.'
  },
  {
    icon: Sparkles,
    title: 'AI Writing Assistant',
    description: 'Get intelligent suggestions, overcome writer\'s block, and polish your prose with our AI-powered Book Mind.'
  },
  {
    icon: FileText,
    title: 'Chapter Management',
    description: 'Organize your book with drag-and-drop chapters, including front matter, back matter, and content sections.'
  },
  {
    icon: Palette,
    title: 'Beautiful Typography',
    description: 'Choose from professionally designed typography presets or customize fonts, spacing, and styling.'
  },
  {
    icon: Languages,
    title: 'Multi-Language Support',
    description: 'Write in any language with smart quotes and language-specific typography settings.'
  },
  {
    icon: Cloud,
    title: 'Cloud Sync',
    description: 'Your books are automatically saved and synced across devices. Write on any computer, pick up where you left off.'
  }
];

const TESTIMONIALS = [
  {
    quote: "I found the app really impressive, very easy to use and a beautiful design.",
    author: "Jon",
    role: "Early Access User",
    avatar: "/neil-avatar.png"
  }
];

const PRICING = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    description: 'Perfect for getting started',
    features: [
      'Unlimited local books',
      'EPUB & PDF export',
      'Professional typography',
      'Chapter management',
      'Works offline'
    ],
    cta: 'Sign Up',
    highlighted: false,
    checkoutType: null as null | 'pro' | 'lifetime',
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    description: 'For serious writers',
    features: [
      'Everything in Free',
      'Cloud sync across devices',
      'Book Mind AI assistant',
      'Analyze manuscripts for inconsistencies',
      'Summarize chapters & get insights',
      'Priority support'
    ],
    cta: 'Get Pro',
    highlighted: true,
    checkoutType: 'pro' as null | 'pro' | 'lifetime',
  },
  {
    name: 'Lifetime',
    price: '$149',
    period: ' once',
    description: 'Pay once, write forever',
    features: [
      'Everything in Pro',
      'Unlimited Book Mind access',
      'All future features included',
      'Early access to new tools'
    ],
    cta: 'Get Lifetime',
    highlighted: false,
    checkoutType: 'lifetime' as null | 'pro' | 'lifetime',
  }
];

// ── Interactive Live Preview (marketing page only) ────────────────────────────
const SAMPLE_CONTENT = [
  '<p>The morning light filtered through the curtains as Eleanor sat at her desk, fingers hovering over the keyboard. She had been staring at the blank page for three days now.</p>',
  '<p>Outside, the city was already alive: horns, laughter, the distant rumble of a delivery truck. But inside her apartment, time moved differently. Thick. Slow. Like honey poured on a cold morning.</p>',
  '<p>She typed a single word: <em>Once.</em></p>',
  '<p>Then deleted it.</p>',
  '<p>Her editor had been patient. Unusually patient. Which, Eleanor knew from experience, was its own kind of warning.</p>',
  '<p>She stood, stretched, and walked to the window. Three floors below, a woman was walking a small dog, a determined creature yanking at the lead, nose glued to the pavement. Eleanor watched them until they disappeared around the corner.</p>',
  '<p>When she sat back down, the cursor was still blinking.</p>',
  '<p><em>Once,</em> she typed again. This time, she didn\'t delete it.</p>',
].join('');

const PREVIEW_DEVICES = {
  kindle: { width: 236, height: 332, name: 'Kindle' },
  ipad:   { width: 268, height: 356, name: 'iPad'   },
  phone:  { width: 188, height: 336, name: 'Phone'  },
} as const;

type PreviewDevice = keyof typeof PREVIEW_DEVICES;
type PreviewTheme  = 'light' | 'sepia' | 'dark';

function InteractiveLivePreview() {
  const [device, setDevice] = useState<PreviewDevice>('kindle');
  const [theme, setTheme]   = useState<PreviewTheme>('light');

  const d         = PREVIEW_DEVICES[device];
  const bgColor   = theme === 'light' ? '#ffffff' : theme === 'sepia' ? '#f4ecd8' : '#1a1a1a';
  const textColor = theme === 'dark' ? '#e5e5e5' : '#141413';

  return (
    <div className="relative w-full max-w-[360px] h-[580px] flex flex-col bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">

      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-3 pb-3 border-b border-gray-200">
        <p className="text-2xs font-semibold text-gray-600 uppercase tracking-widest mb-2.5">Live Preview</p>
        <div className="flex gap-1.5">
          {(Object.entries(PREVIEW_DEVICES) as [PreviewDevice, typeof PREVIEW_DEVICES.kindle][]).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setDevice(key)}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                device === key
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
              }`}
            >
              {val.name}
            </button>
          ))}
        </div>
      </div>

      {/* E-reader area */}
      <div className="flex-1 flex items-center justify-center bg-gray-100 px-4 py-2">
        <div
          className="bg-[#2a2a2a] shadow-2xl transition-all duration-300"
          style={{ borderRadius: 20, padding: 8 }}
        >
          <div
            className="rounded-lg overflow-hidden transition-colors duration-300"
            style={{ width: d.width, height: d.height, backgroundColor: bgColor }}
          >
            <div
              className="h-full overflow-y-auto px-5 py-5 [&_p]:mb-2.5 [&_em]:italic"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                color: textColor,
                lineHeight: 1.8,
                fontSize: '12.5px',
                textAlign: 'justify',
              }}
            >
              <h1 className="text-sm font-bold mb-4 text-center" style={{ color: textColor }}>
                Chapter 1
              </h1>
              <div dangerouslySetInnerHTML={{ __html: SAMPLE_CONTENT }} />
            </div>
          </div>
        </div>
      </div>

      {/* Theme controls */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 flex items-center justify-center gap-3">
        {(['light', 'sepia', 'dark'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={`w-6 h-6 rounded-full border-2 transition-all ${
              theme === t
                ? 'scale-125 border-gray-900 shadow-md'
                : 'border-gray-300 hover:border-gray-500'
            }`}
            style={{ backgroundColor: t === 'light' ? '#ffffff' : t === 'sepia' ? '#f4ecd8' : '#1a1a1a' }}
            aria-label={`${t} theme`}
            title={t.charAt(0).toUpperCase() + t.slice(1)}
          />
        ))}
      </div>
    </div>
  );
}
// ── Ink splodge helpers ───────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────

export default function MarketingLandingPage({ onStartWritingAction, libraryCount }: MarketingLandingPageProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<'pro' | 'lifetime' | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false);
  const heroSectionRef = useRef<HTMLElement>(null);

  const { user, signOut } = useAuth();
  const [typed, setTyped] = useState('');
  const [typingDone, setTypingDone] = useState(false);
  const TYPEWRITER_PHRASE = 'and finish it like a\u00A0pro.';
  useEffect(() => {
    const delay = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setTyped(TYPEWRITER_PHRASE.slice(0, i));
        if (i === TYPEWRITER_PHRASE.length) {
          clearInterval(interval);
          setTimeout(() => setTypingDone(true), 600);
        }
      }, 52);
      return () => clearInterval(interval);
    }, 500);
    return () => clearTimeout(delay);
  }, []);
  const featuresRef = useRef<HTMLElement>(null);
  const pricingRef = useRef<HTMLElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const [chatStep, setChatStep] = useState(0);

  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setChatStep(1), 400);
          setTimeout(() => setChatStep(2), 1400);
          setTimeout(() => setChatStep(3), 2600);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

  const openVideo = () => {
    setVideoOpen(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setVideoVisible(true)));
  };

  const closeVideo = () => {
    setVideoVisible(false);
    setTimeout(() => setVideoOpen(false), 300);
  };

  useEffect(() => {
    if (!videoOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeVideo(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [videoOpen]);

  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-[#faf9f5] text-gray-700 overflow-x-hidden">

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#faf9f5]/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Image
                src="/make-ebook-logomark.svg"
                alt="makeEbook"
                width={120}
                height={24}
                className="h-6 w-auto"
              />
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection(featuresRef)}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection(pricingRef)}
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
                <div className="flex items-center gap-4">
                  <button
                    onClick={onStartWritingAction}
                    className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
                  >
                    My Books {libraryCount > 0 && `(${libraryCount})`}
                  </button>
                  <button
                    onClick={() => signOut()}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleOpenAuth('signin')}
                    className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleOpenAuth('signup')}
                    className="px-4 py-2 text-sm font-medium bg-me-accent text-white rounded-full hover:bg-blue-700 transition-colors"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-3 -mr-1 text-gray-900"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-[#faf9f5]">
            <div className="px-4 py-4 space-y-4">
              <button
                onClick={() => scrollToSection(featuresRef)}
                className="block w-full text-left text-gray-600"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection(pricingRef)}
                className="block w-full text-left text-gray-600"
              >
                Pricing
              </button>
              <Link
                href="/make-ebook/blog"
                className="block w-full text-left text-gray-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <div className="pt-4 border-t border-gray-200">
                {user ? (
                  <>
                    <button
                      onClick={() => { onStartWritingAction(); setMobileMenuOpen(false); }}
                      className="block w-full text-left font-medium mb-2 text-gray-900"
                    >
                      My Books {libraryCount > 0 && `(${libraryCount})`}
                    </button>
                    <button
                      onClick={() => { signOut(); setMobileMenuOpen(false); }}
                      className="block w-full text-left text-gray-600"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { handleOpenAuth('signin'); setMobileMenuOpen(false); }}
                      className="block w-full text-left font-medium mb-2 text-gray-900"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => { handleOpenAuth('signup'); setMobileMenuOpen(false); }}
                      className="block w-full text-left text-gray-900"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section ref={heroSectionRef} className="pt-24 pb-20 sm:pt-32 sm:pb-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-gray-600 text-sm font-medium mb-10 border border-gray-200">
            <BookOpen className="w-4 h-4" />
            Your complete eBook editor
          </div>

          {/* Headline */}
          <h1 className="font-serif font-bold mb-6 text-gray-900 overflow-hidden" style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            <span className="block sm:whitespace-nowrap">Write your first eBook,</span>
            <span className="block sm:whitespace-nowrap">
              {typed}
              <span className={`font-thin text-gray-600 ${typingDone ? 'invisible' : 'animate-pulse'}`}>|</span>
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-600 mb-10 max-w-xl mx-auto" style={{ fontFamily: 'Georgia, serif', lineHeight: 1.7 }}>
            Write, format, and export a professional EPUB, ready for{' '}
            <em>Kindle, Kobo, Apple Books</em>
            {' '}and more. Free. No install needed.
          </p>

          {/* CTA */}
          <div className="flex items-center justify-center mb-6">
            <button
              onClick={user ? onStartWritingAction : () => handleOpenAuth('signup')}
              className="group px-8 py-4 text-lg font-semibold bg-gray-900 text-white rounded-full flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
            >
              Start writing, it&apos;s free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Trust indicators */}
          <p className="text-sm text-gray-600">
            No credit card required · Export unlimited EPUBs
          </p>

        </div>
      </section>

      {/* Product Preview Section */}
      <section className="py-32">
        <div className="text-center mb-16">
          <h2 className="font-serif font-bold text-gray-900" style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 3rem)', letterSpacing: '-0.03em' }}>
            Write your untold story
          </h2>
        </div>
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <button className="relative cursor-pointer group w-full text-left" onClick={openVideo} aria-label="Watch product demo video">
            <Image
              src="/makeebook-laptop.png"
              alt="makeEbook app on laptop, click to watch demo"
              width={1920}
              height={1200}
              className="w-full h-auto"
              style={{
                maskImage: 'radial-gradient(ellipse 88% 88% at 50% 50%, black 55%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(ellipse 88% 88% at 50% 50%, black 55%, transparent 100%)',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </section>


      {/* How It Works Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-serif font-bold mb-6 text-gray-900" style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 3rem)', letterSpacing: '-0.03em' }}>
                Three steps to published
              </h2>
              <p className="text-xl text-gray-600" style={{ fontFamily: 'Georgia, serif' }}>
                No formatting headaches. No technical setup. Just write.
              </p>
            </div>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {HOW_IT_WORKS.map((item, index) => (
              <FadeIn key={index} delay={index * 120}>
                <div className="relative pt-20">
                  <div className="font-playfair select-none pointer-events-none absolute top-0 -left-2 text-gray-200 font-bold leading-none" style={{ fontSize: '9rem', letterSpacing: '-0.06em', zIndex: 0 }}>{item.step}</div>
                  <h3 className="relative text-xl font-semibold text-gray-900 mb-3" style={{ letterSpacing: '-0.02em', zIndex: 1, position: 'relative' }}>{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed" style={{ position: 'relative', zIndex: 1 }}>{item.description}</p>
                  {index < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden md:block absolute top-8 -right-4 text-gray-300">
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Editor Showcase Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-gray-600 text-sm font-medium mb-6 border border-gray-200">
                Inside the editor
              </div>
              <h2 className="font-serif font-bold mb-6 text-gray-900" style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 3rem)', letterSpacing: '-0.03em' }}>
                Everything a writer needs
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: 'Georgia, serif' }}>
                A focused, professional writing environment built from the ground up for ebook authors.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* Card 1: Formatting Toolbar */}
            <FadeIn delay={0}>
              <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                <div className="p-8 pb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Write without friction</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Rich formatting tools built for authors. Headings, quotes, lists and more, all without leaving the keyboard.</p>
                </div>
                <div className="mx-4 mb-4 rounded-xl overflow-hidden border border-[#2f2f2f]">
                  {/* Toolbar */}
                  <div className="bg-[#262626] flex items-center gap-0.5 px-2.5 py-2 border-b border-[#2f2f2f]">
                    {[['B','font-bold'],['I','italic'],['U','underline']].map(([l,c],i) => (
                      <button key={i} className={`w-7 h-7 flex items-center justify-center rounded text-white/70 text-xs ${c}`}>{l}</button>
                    ))}
                    <div className="w-px h-4 bg-white/10 mx-1" />
                    {['H1','H2','H3'].map((l,i) => (
                      <button key={i} className={`w-8 h-7 flex items-center justify-center rounded text-[10px] font-medium ${i===1 ? 'bg-[#4070ff]/20 text-[#4070ff]' : 'text-white/70'}`}>{l}</button>
                    ))}
                    <div className="w-px h-4 bg-white/10 mx-1" />
                    <button className="w-7 h-7 flex items-center justify-center rounded text-white/70 text-sm font-serif">&ldquo;</button>
                    <button className="w-7 h-7 flex items-center justify-center rounded text-white/70">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                    </button>
                  </div>
                  {/* Editor body */}
                  <div className="bg-[#1e1e1e] px-6 py-5">
                    <div className="text-white/30 text-[10px] font-semibold uppercase tracking-widest mb-3">Chapter Two</div>
                    <div className="text-white/90 text-base font-semibold mb-3" style={{ fontFamily: 'Georgia, serif', lineHeight: '1.3' }}>The Midnight Garden</div>
                    <div className="text-white/55 text-[13px] leading-relaxed space-y-3" style={{ fontFamily: 'Georgia, serif' }}>
                      <p>The morning light fell across the old manuscript pages, illuminating years of careful revision. She had written this story a hundred times in her mind before committing a single word to paper.</p>
                      <div className="border-l-2 border-[#4070ff] pl-3 text-white/40 italic">&ldquo;This time,&rdquo; she thought, &ldquo;it would be different.&rdquo;</div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Card 2: Chapter Sidebar */}
            <FadeIn delay={100}>
              <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                <div className="p-8 pb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Every chapter in its place</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Build and reorder your book structure at a glance. Drag chapters into place, track word counts, and never lose your thread.</p>
                </div>
                <div className="mx-4 mb-4 rounded-xl overflow-hidden border border-[#2f2f2f] bg-[#1e1e1e]">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#2f2f2f]">
                    <span className="text-white/40 text-[10px] font-semibold uppercase tracking-widest">Your Library</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="text-white/30"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </div>
                  {[
                    { title: 'Prologue', words: '420', active: false },
                    { title: 'Chapter One', words: '1,842', active: true },
                    { title: 'Chapter Two', words: '2,103', active: false },
                    { title: 'Chapter Three', words: '1,567', active: false },
                    { title: 'Chapter Four', words: '891', active: false },
                    { title: 'Epilogue', words: '345', active: false },
                  ].map((ch, i) => (
                    <div key={i} className={`flex items-center gap-2.5 px-3 py-2.5 ${ch.active ? 'bg-[#4070ff]/10' : ''}`}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="text-white/20 flex-shrink-0"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
                      <span className={`flex-1 text-[13px] ${ch.active ? 'text-white' : 'text-white/45'}`}>{ch.title}</span>
                      <span className="text-white/25 text-[10px]">{ch.words}w</span>
                    </div>
                  ))}
                  <div className="px-3 py-2.5 border-t border-[#2f2f2f] flex items-center gap-1.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="text-white/25"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    <span className="text-white/25 text-[12px]">Add chapter</span>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Card 3: EPUB Export */}
            <FadeIn delay={200}>
              <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                <div className="p-8 pb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Export in one click</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Pick a typography preset and get a publish-ready EPUB instantly. No formatting knowledge or extra tools required.</p>
                </div>
                <div className="mx-4 mb-4 rounded-xl overflow-hidden border border-[#2f2f2f] bg-[#1e1e1e]">
                  <div className="px-5 pt-5 pb-5">
                    <div className="text-white/80 text-sm font-semibold mb-5">Export EPUB</div>
                    <div className="text-white/35 text-[10px] uppercase tracking-widest mb-2.5">Typography preset</div>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {['Novel', 'Non-fiction', 'Technical', 'Poetry'].map((p, i) => (
                        <button key={i} className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${i === 0 ? 'bg-[#4070ff] text-white' : 'bg-[#262626] text-white/45 border border-[#2f2f2f]'}`}>{p}</button>
                      ))}
                    </div>
                    <div className="bg-[#262626] rounded-lg p-3.5 mb-5 border border-[#2f2f2f]">
                      <div className="flex items-baseline gap-2.5 mb-1.5">
                        <span className="text-white/80 text-xl" style={{ fontFamily: 'Georgia, serif' }}>Aa</span>
                        <div>
                          <div className="text-white/60 text-[11px]">Libre Baskerville · 11pt</div>
                          <div className="text-white/30 text-[10px]">Line height 1.5 · Margin 20mm</div>
                        </div>
                      </div>
                      <div className="text-white/35 text-[11px] leading-relaxed mt-2" style={{ fontFamily: 'Georgia, serif' }}>The quick brown fox jumps over the lazy dog.</div>
                    </div>
                    <button className="w-full py-2.5 rounded-full bg-white text-gray-900 text-[13px] font-semibold flex items-center justify-center gap-2">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Export EPUB
                    </button>
                  </div>
                </div>
              </div>
            </FadeIn>

          </div>
        </div>
      </section>

      {/* Live Previewer Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Interactive Live Preview */}
            <FadeIn>
              <div className="relative flex justify-center lg:justify-start">
                <InteractiveLivePreview />
              </div>
            </FadeIn>

            {/* Text side */}
            <FadeIn delay={150}>
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-gray-600 text-sm font-medium mb-6 border border-gray-200">
                  <Eye className="w-4 h-4" />
                  Live Preview
                </div>
                <h2 className="font-serif font-bold mb-6 text-gray-900" style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 3rem)', letterSpacing: '-0.03em' }}>
                  See exactly how your book will look
                </h2>
                <p className="text-xl text-gray-600 mb-8" style={{ fontFamily: 'Georgia, serif' }}>
                  Preview your ebook on Kindle, iPad, and phone, live as you write. No guessing, no surprises when you publish.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    'Switch between Kindle, iPad, and Phone instantly',
                    'Typography and layout rendered in real time',
                    'Catch formatting issues before you export',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-32 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-serif font-bold mb-6 text-gray-900 text-balance" style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 3rem)', letterSpacing: '-0.03em' }}>
                Everything you need to write your book
              </h2>
              <p className="text-xl text-gray-600" style={{ fontFamily: 'Georgia, serif' }}>
                Powerful features, simple interface. Focus on your story, not the tools.
              </p>
            </div>
          </FadeIn>

          <div className="max-w-3xl mx-auto">
            {FEATURES.map((feature, index) => (
              <FadeIn key={index} delay={index * 60}>
                <div className={`flex items-start gap-6 py-8 ${index < FEATURES.length - 1 ? 'border-b border-gray-200' : ''}`}>
                  <feature.icon className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-gray-600" style={{ fontFamily: 'Georgia, serif', lineHeight: 1.7 }}>{feature.description}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-gray-600 text-sm font-medium mb-6 border border-gray-200">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  AI-Powered
                </div>
                <h2 className="font-serif font-bold mb-6 text-gray-900" style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 3rem)', letterSpacing: '-0.03em' }}>
                  Meet Book Mind, your AI writing companion
                </h2>
                <p className="text-xl text-gray-600 mb-8" style={{ fontFamily: 'Georgia, serif' }}>
                  Analyze your entire book, find inconsistencies, summarize chapters, and get intelligent suggestions. Like having a thoughtful editor always by your side.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    'Summarize your entire book or individual chapters',
                    'Find plot holes and character inconsistencies',
                    'Analyze themes and writing patterns',
                    'Get word usage insights and suggestions'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
            <FadeIn delay={150}>
              <div className="relative">
                <div ref={chatRef} className="bg-gray-50 rounded-2xl p-8 shadow-xl border border-gray-200 min-h-[260px]">
                  <div className="space-y-4">
                    {/* Message 1 */}
                    <div
                      className="flex items-start gap-3"
                      style={{ opacity: chatStep >= 1 ? 1 : 0, transform: chatStep >= 1 ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
                    >
                      <svg className="w-6 h-6 text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <div className="flex-1 bg-gray-100 rounded-2xl rounded-tl-none p-4">
                        <p className="text-gray-700 text-sm">I&apos;ve analyzed your manuscript. Chapter 7 mentions Sarah having blue eyes, but in Chapter 3 they were described as green. Would you like me to show you the exact passages?</p>
                      </div>
                    </div>
                    {/* Message 2 */}
                    <div
                      className="flex items-start gap-3 justify-end"
                      style={{ opacity: chatStep >= 2 ? 1 : 0, transform: chatStep >= 2 ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
                    >
                      <div className="bg-gray-900 rounded-2xl rounded-tr-none p-4 max-w-[80%]">
                        <p className="text-white text-sm">Yes, show me the inconsistencies</p>
                      </div>
                    </div>
                    {/* Message 3 */}
                    <div
                      className="flex items-start gap-3"
                      style={{ opacity: chatStep >= 3 ? 1 : 0, transform: chatStep >= 3 ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
                    >
                      <svg className="w-6 h-6 text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <div className="flex-1 bg-gray-100 rounded-2xl rounded-tl-none p-4">
                        <p className="text-gray-700 text-sm mb-2"><strong>Chapter 3, paragraph 12:</strong></p>
                        <p className="text-gray-600 text-sm italic">&ldquo;Her green eyes sparkled in the morning light...&rdquo;</p>
                        <p className="text-gray-700 text-sm mt-3 mb-2"><strong>Chapter 7, paragraph 5:</strong></p>
                        <p className="text-gray-600 text-sm italic">&ldquo;Sarah&apos;s blue eyes narrowed...&rdquo;</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 border-t border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <blockquote className="font-serif italic text-gray-700 text-2xl leading-relaxed mb-4">
            &ldquo;{TESTIMONIALS[0].quote}&rdquo;
          </blockquote>
          <p className="text-sm text-gray-600">
           .{TESTIMONIALS[0].author}, {TESTIMONIALS[0].role}
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section ref={pricingRef} className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-serif font-bold mb-6 text-gray-900" style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 3rem)', letterSpacing: '-0.03em' }}>
                Simple, transparent pricing
              </h2>
              <p className="text-xl text-gray-600" style={{ fontFamily: 'Georgia, serif' }}>
                Choose the plan that works for you. Upgrade or downgrade anytime.
              </p>
              {checkoutError && (
                <p className="mt-4 text-sm text-red-400">{checkoutError}</p>
              )}
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PRICING.map((plan, index) => (
              <div key={index} className="group relative rounded-2xl">
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-900 text-white whitespace-nowrap">
                      Most Popular
                    </span>
                  </div>
                )}
                <div
                  className={`relative rounded-2xl p-8 h-full flex flex-col transition-all duration-300 group-hover:-translate-y-1 ${
                    plan.highlighted
                      ? 'bg-gray-900 border border-gray-900 shadow-xl'
                      : 'bg-white border border-gray-200 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <h3 className={`text-xl font-semibold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                  <div className="mb-4">
                    <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                    <span className={plan.highlighted ? 'text-gray-600' : 'text-gray-600'}>{plan.period}</span>
                  </div>
                  <p className={`mb-6 ${plan.highlighted ? 'text-gray-300' : 'text-gray-600'}`}>{plan.description}</p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <svg className={`w-5 h-5 flex-shrink-0 ${plan.highlighted ? 'text-blue-400' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className={plan.highlighted ? 'text-gray-200' : 'text-gray-700'}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => {
                      if (plan.checkoutType) {
                        handleCheckout(plan.checkoutType);
                      } else {
                        user ? onStartWritingAction() : handleOpenAuth('signup');
                      }
                    }}
                    disabled={!!plan.checkoutType && checkoutLoading === plan.checkoutType}
                    className={`w-full py-3 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${plan.highlighted ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-700'}`}
                  >
                    {plan.checkoutType && checkoutLoading === plan.checkoutType ? 'Redirecting…' : plan.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto mt-20">
            <h3 className="font-serif font-semibold text-gray-900 text-center mb-8" style={{ fontSize: '1.25rem' }}>Common questions</h3>
            {[
              { q: 'Can I try it before paying?', a: 'Yes. The Free plan gives you unlimited local books, EPUB & PDF export, and professional typography. No credit card needed.' },
              { q: 'Can I upgrade or cancel anytime?', a: 'Absolutely. Upgrade to Pro whenever you\'re ready, and cancel with one click. Your books are always yours.' },
              { q: 'What formats can I export?', a: 'EPUB (for Kindle, Kobo, Apple Books, and all major platforms), PDF, and Word. All publication-ready.' },
              { q: 'Do I need to install anything?', a: 'No. makeEbook runs entirely in your browser and works offline too.' },
            ].map((item, i) => (
              <div key={i} className={`py-5 ${i > 0 ? 'border-t border-gray-200' : ''}`}>
                <h4 className="font-semibold text-gray-900 mb-1">{item.q}</h4>
                <p className="text-gray-600 text-sm" style={{ fontFamily: 'Georgia, serif', lineHeight: 1.7 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 border-t border-gray-200">
        <FadeIn>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-serif font-bold text-gray-900 mb-6 text-balance" style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 3rem)', letterSpacing: '-0.03em' }}>
              Ready to write your book?
            </h2>
            <p className="text-xl text-gray-600 mb-8" style={{ fontFamily: 'Georgia, serif' }}>
              Start creating in seconds. No credit card required.
            </p>
            <button
              onClick={user ? onStartWritingAction : () => handleOpenAuth('signup')}
              className="group px-8 py-4 text-lg font-semibold bg-gray-900 text-white rounded-full inline-flex items-center gap-2 hover:bg-gray-800 transition-colors"
            >
              Start writing, it&apos;s free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <Image
                  src="/make-ebook-logomark.svg"
                  alt="makeEbook"
                  width={120}
                  height={24}
                  className="h-6 w-auto"
                />
              </div>
              <p className="text-gray-600 mb-4 max-w-sm">
                The complete ebook creation tool for authors. Write, edit, and export professional EPUB files.
              </p>
              <p className="text-sm text-gray-600">
                MakeEbook is a <a href="https://neilmcardle.com" className="underline hover:text-gray-700">neilmcardle.com</a> company.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Product</h4>
              <ul className="space-y-2 text-gray-600">
                <li><button onClick={() => scrollToSection(featuresRef)} className="hover:text-gray-900">Features</button></li>
                <li><button onClick={() => scrollToSection(pricingRef)} className="hover:text-gray-900">Pricing</button></li>
                <li><Link href="/make-ebook/book-mind" className="hover:text-gray-900">Book Mind</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Legal</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="https://neilmcardle.com/terms" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900">Terms & Conditions</a></li>
                <li><a href="https://neilmcardle.com/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
            © {new Date().getFullYear()} Neil McArdle. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Video lightbox */}
      {videoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          style={{
            backgroundColor: `rgba(0,0,0,${videoVisible ? 0.85 : 0})`,
            backdropFilter: videoVisible ? 'blur(8px)' : 'none',
            transition: 'background-color 0.3s ease, backdrop-filter 0.3s ease',
          }}
          onClick={closeVideo}
        >
          <button
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors p-2"
            onClick={closeVideo}
            aria-label="Close video"
          >
            <X size={28} />
          </button>
          <div
            className="relative w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl border border-gray-200"
            style={{
              transform: videoVisible ? 'scale(1)' : 'scale(0.92)',
              opacity: videoVisible ? 1 : 0,
              transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
            }}
            onClick={e => e.stopPropagation()}
          >
            <MuxPlayer
              playbackId="MsFzJTzHanW3aB7bGesbMq21aB13vj9I9nVV4Lrp4Bg"
              metadata={{ video_title: 'makeEbook Product Demo' }}
              style={{ aspectRatio: '16/9', width: '100%' }}
              accentColor="#ffffff"
              autoPlay
            />
          </div>
        </div>
      )}

    </div>
  );
}
