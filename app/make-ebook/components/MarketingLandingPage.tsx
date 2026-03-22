"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import Image from 'next/image';
import Link from 'next/link';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  BookOpen,
  Sparkles,
  Cloud,
  FileText,
  Palette,
  Languages,
  ChevronRight,
  Star,
  ArrowRight,
  Menu,
  X,
  Eye,
} from 'lucide-react';

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
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
    description: 'Book Mind reads your entire manuscript — catching inconsistencies, summarising chapters, and surfacing insights.',
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
    description: 'Write in any language with full RTL support, smart quotes, and language-specific typography.'
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
  '<p>Outside, the city was already alive — horns, laughter, the distant rumble of a delivery truck. But inside her apartment, time moved differently. Thick. Slow. Like honey poured on a cold morning.</p>',
  '<p>She typed a single word: <em>Once.</em></p>',
  '<p>Then deleted it.</p>',
  '<p>Her editor had been patient. Unusually patient. Which, Eleanor knew from experience, was its own kind of warning.</p>',
  '<p>She stood, stretched, and walked to the window. Three floors below, a woman was walking a small dog — a determined creature yanking at the lead, nose glued to the pavement. Eleanor watched them until they disappeared around the corner.</p>',
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
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<'pro' | 'lifetime' | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false);
const [isPenActive, setIsPenActive] = useState(true);
  const isPenActiveRef = useRef(true);
  const isDrawingRef = useRef(false);
  const inkCanvasRef = useRef<HTMLCanvasElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const pageWrapperRef = useRef<HTMLDivElement>(null);
  const inkPenPos = useRef<{ x: number; y: number } | null>(null);
  const inkRafRef = useRef<number>(0);

  const clearInkCanvas = useCallback(() => {
    const canvas = inkCanvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    const canvas = inkCanvasRef.current;
    const wrapper = pageWrapperRef.current;
    if (!canvas || !wrapper) return;
    const resize = () => { canvas.width = wrapper.offsetWidth; canvas.height = wrapper.offsetHeight; };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrapper);
    const ctx = canvas.getContext('2d')!;
    let frame = 0;
    const fade = () => {
      frame++;
      if (frame % 4 === 0) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0,0,0,0.012)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
      }
      inkRafRef.current = requestAnimationFrame(fade);
    };
    inkRafRef.current = requestAnimationFrame(fade);
    return () => { cancelAnimationFrame(inkRafRef.current); ro.disconnect(); };
  }, []);

  const handleHeroMouseDown = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!isPenActiveRef.current) return;
    e.preventDefault();
    isDrawingRef.current = true;
    const canvas = inkCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    inkPenPos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const handleHeroMouseUp = useCallback(() => {
    isDrawingRef.current = false;
    inkPenPos.current = null;
  }, []);

  const handleHeroMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!isPenActiveRef.current || !isDrawingRef.current) return;
    const canvas = inkCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const last = inkPenPos.current;
    if (last) {
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(20,18,15,0.32)';
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
    inkPenPos.current = { x, y };
  }, []);

  const handleHeroMouseLeave = useCallback(() => {
    isDrawingRef.current = false;
    inkPenPos.current = null;
  }, []);

  const drawLine = useCallback((x: number, y: number) => {
    const canvas = inkCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const last = inkPenPos.current;
    if (last) {
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(20,18,15,0.32)';
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
    inkPenPos.current = { x, y };
  }, []);

  const handleHeroTouchStart = useCallback((e: React.TouchEvent<HTMLElement>) => {
    if (!isPenActiveRef.current || window.innerWidth < 1024) return;
    e.preventDefault();
    isDrawingRef.current = true;
    const canvas = inkCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const t = e.touches[0];
    inkPenPos.current = { x: t.clientX - rect.left, y: t.clientY - rect.top };
  }, []);

  const handleHeroTouchMove = useCallback((e: React.TouchEvent<HTMLElement>) => {
    if (!isPenActiveRef.current || !isDrawingRef.current || window.innerWidth < 1024) return;
    e.preventDefault();
    const canvas = inkCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const t = e.touches[0];
    drawLine(t.clientX - rect.left, t.clientY - rect.top);
  }, [drawLine]);

  const handleHeroTouchEnd = useCallback(() => {
    isDrawingRef.current = false;
    inkPenPos.current = null;
  }, []);

  const { user, signOut } = useAuth();
  const [typed, setTyped] = useState('');
  const [typingDone, setTypingDone] = useState(false);
  const TYPEWRITER_PHRASE = 'and finish it like a pro.';
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
    setAuthMode(mode);
    setAuthModalOpen(true);
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
    <div ref={pageWrapperRef} className="relative min-h-screen bg-white text-[#333] overflow-x-hidden" onMouseDown={handleHeroMouseDown} onMouseUp={handleHeroMouseUp} onMouseMove={handleHeroMouseMove} onMouseLeave={handleHeroMouseLeave} onTouchStart={handleHeroTouchStart} onTouchMove={handleHeroTouchMove} onTouchEnd={handleHeroTouchEnd}>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Image
                src="/make-ebook-logo.svg"
                alt="MakeEbook"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="font-semibold text-lg text-[#111]">makeEbook</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection(featuresRef)}
                className="text-sm text-[#444] hover:text-[#111] transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection(pricingRef)}
                className="text-sm text-[#444] hover:text-[#111] transition-colors"
              >
                Pricing
              </button>
              {user ? (
                <div className="flex items-center gap-4">
                  <button
                    onClick={onStartWritingAction}
                    className="text-sm font-medium text-[#111] hover:text-[#444] transition-colors"
                  >
                    My Books {libraryCount > 0 && `(${libraryCount})`}
                  </button>
                  <button
                    onClick={() => signOut()}
                    className="text-sm text-[#444] hover:text-[#111] transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleOpenAuth('signin')}
                    className="text-sm font-medium text-[#111] hover:text-[#444] transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleOpenAuth('signup')}
                    className="px-4 py-2 text-sm font-medium bg-[#111] text-white rounded-full hover:bg-[#333] transition-colors"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-[#111]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-4">
              <button
                onClick={() => scrollToSection(featuresRef)}
                className="block w-full text-left text-[#444]"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection(pricingRef)}
                className="block w-full text-left text-[#444]"
              >
                Pricing
              </button>
              <div className="pt-4 border-t border-gray-200">
                {user ? (
                  <>
                    <button
                      onClick={() => { onStartWritingAction(); setMobileMenuOpen(false); }}
                      className="block w-full text-left font-medium mb-2 text-[#111]"
                    >
                      My Books {libraryCount > 0 && `(${libraryCount})`}
                    </button>
                    <button
                      onClick={() => { signOut(); setMobileMenuOpen(false); }}
                      className="block w-full text-left text-[#444]"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { handleOpenAuth('signin'); setMobileMenuOpen(false); }}
                      className="block w-full text-left font-medium mb-2 text-[#111]"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => { handleOpenAuth('signup'); setMobileMenuOpen(false); }}
                      className="block w-full text-left text-[#111]"
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

      {/* Full-page ink canvas */}
      <canvas ref={inkCanvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none z-[9]" aria-hidden="true" />

      {/* Ink controls — fixed top-right below nav */}
      <div className="hidden md:flex fixed top-[72px] right-6 z-[100] flex-col items-end gap-1.5">
          <span className="text-2xs text-gray-600 font-medium tracking-wide select-none">Take some notes</span>
          <div className="flex items-center gap-1 bg-white/70 backdrop-blur-sm rounded-full px-2 py-1.5 border border-gray-200/60">
            <button
              onClick={() => { const next = !isPenActiveRef.current; isPenActiveRef.current = next; setIsPenActive(next); inkPenPos.current = null; }}
              title={isPenActive ? 'Pen on — click to disable' : 'Pen off — click to enable'}
              className={`flex items-center justify-center w-6 h-6 rounded-full transition-colors ${isPenActive ? 'text-[#111]' : 'text-gray-500'}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <div className="w-px h-3 bg-gray-300" />
            <button
              onClick={clearInkCanvas}
              title="Reset drawing"
              className="flex items-center justify-center w-6 h-6 rounded-full text-gray-600 hover:text-[#111] transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

      {/* Hero Section — Fullscreen Video */}
      <section ref={heroSectionRef} className="relative min-h-screen flex flex-col justify-start overflow-hidden">

        {/* Hero background image */}
        <img
          src="/woman-hero-bg.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover grayscale"
        />

        {/* Light overlay — preserves the editorial off-white aesthetic */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 80% at 50% 45%, rgba(242,242,240,0.97) 30%, rgba(242,242,240,0.88) 60%, rgba(242,242,240,0.70) 100%)' }} />

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 text-[#333] text-sm font-medium mb-8 border border-gray-200/80">
              <Sparkles className="w-4 h-4" />
              AI-Powered Writing Tools
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 text-[#111] text-balance" style={{ letterSpacing: '-0.05em' }}>
              Write your first eBook,
              <br />
              <span className="text-[#111]">
                {typed}
                {!typingDone && <span className="animate-pulse font-thin text-[#999]">|</span>}
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-[#333] mb-10 max-w-2xl mx-auto">
              Free, browser-based eBook editor. Write, format and export a professional EPUB ready for{' '}
              <span className="font-playfair italic text-[#333]">Kindle, Kobo, Apple Books</span>
              {' '}and more. No install needed.
            </p>

            {/* CTA */}
            <div className="flex items-center justify-center mb-8">
              <div className="me-cta-shine">
                <button
                  onClick={user ? onStartWritingAction : () => handleOpenAuth('signup')}
                  className="group px-8 py-4 text-lg font-semibold bg-white text-[#111] rounded-full hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  Try for free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Trust indicators */}
            <p className="text-sm text-[#666]">
              No credit card required • Free to start • Export unlimited EPUBs
            </p>
          </div>

        </div>
      </section>

      {/* Product Preview Section */}
      <section className="bg-white py-16 lg:py-24">
        <div className="text-center mb-10 lg:mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111]" style={{ letterSpacing: '-0.04em' }}>
            Write your untold story
          </h2>
        </div>
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="absolute -inset-4 bg-gradient-to-r from-gray-200/40 via-gray-100/40 to-gray-200/40 blur-3xl rounded-3xl" />
          <div className="relative cursor-pointer group" onClick={openVideo}>
            <Image
              src="/makeebook-laptop.png"
              alt="makeEbook app on laptop — click to watch demo"
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
          </div>
        </div>
      </section>

      {/* Ink wave divider */}
      <div className="w-full overflow-hidden" style={{ background: '#fafaf9', lineHeight: 0 }} aria-hidden="true">
        <svg viewBox="0 0 1440 56" className="w-full block" preserveAspectRatio="none" style={{ height: 56, display: 'block' }}>
          <path d="M0,28 C200,56 400,0 720,28 C1040,56 1240,0 1440,28 L1440,56 L0,56 Z" fill="#ffffff" />
        </svg>
      </div>

      {/* How It Works Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-[#111]" style={{ letterSpacing: '-0.04em' }}>
                Three steps to published
              </h2>
              <p className="text-xl text-[#666]">
                No formatting headaches. No technical setup. Just write.
              </p>
            </div>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {HOW_IT_WORKS.map((item, index) => (
              <FadeIn key={index} delay={index * 120}>
                <div className="relative pt-20">
                  <div className="font-playfair select-none pointer-events-none absolute top-0 -left-2 text-[#ececec] font-bold leading-none" style={{ fontSize: '9rem', letterSpacing: '-0.06em', zIndex: 0 }}>{item.step}</div>
                  <h3 className="relative text-xl font-semibold text-[#111] mb-3" style={{ letterSpacing: '-0.02em', zIndex: 1, position: 'relative' }}>{item.title}</h3>
                  <p className="text-[#666] leading-relaxed" style={{ position: 'relative', zIndex: 1 }}>{item.description}</p>
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

      {/* Live Previewer Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Interactive Live Preview */}
            <FadeIn>
              <div className="relative flex justify-center lg:justify-start">
                <div className="absolute -inset-8 bg-gradient-to-r from-gray-200/30 via-gray-100/20 to-gray-200/30 blur-3xl rounded-3xl pointer-events-none" />
                <InteractiveLivePreview />
              </div>
            </FadeIn>

            {/* Text side */}
            <FadeIn delay={150}>
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100/50 text-[#333] text-sm font-medium mb-6 border border-gray-200">
                  <Eye className="w-4 h-4" />
                  Live Preview
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-[#111]" style={{ letterSpacing: '-0.04em' }}>
                  See exactly how your book will look
                </h2>
                <p className="text-xl text-[#666] mb-8">
                  Preview your ebook on Kindle, iPad, and phone — live, as you write. No guessing, no surprises when you publish.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    'Switch between Kindle, iPad, and Phone instantly',
                    'Typography and layout rendered in real time',
                    'Catch formatting issues before you export',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#333] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-[#333]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-24 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-[#111] text-balance" style={{ letterSpacing: '-0.04em' }}>
                Everything you need to write your book
              </h2>
              <p className="text-xl text-[#666]">
                Powerful features, simple interface. Focus on your story, not the tools.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <FadeIn key={index} delay={index * 80}>
              <div className="group relative rounded-2xl">
                {/* Animated border — fades in on hover */}
                <div className="me-card-border absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div
                  className="spotlight-card relative rounded-2xl p-8 shadow-lg hover:shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 group-hover:-translate-y-1"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    e.currentTarget.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
                    e.currentTarget.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`);
                  }}
                >
                  {/* Gradient background - always light */}
                  <div className="absolute inset-0 bg-gray-100 rounded-2xl" />

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-6 border border-gray-200">
                      <feature.icon className="w-6 h-6 text-[#333]" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-[#111]">{feature.title}</h3>
                    <p className="text-[#666]">{feature.description}</p>
                  </div>
                </div>
              </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100/50 text-[#333] text-sm font-medium mb-6 border border-gray-200">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  AI-Powered
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-[#111]" style={{ letterSpacing: '-0.04em' }}>
                  Meet Book Mind, your AI writing companion
                </h2>
                <p className="text-xl text-[#666] mb-8">
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
                      <svg className="w-5 h-5 text-[#333] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-[#333]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
            <FadeIn delay={150}>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-gray-200/40 via-gray-100/40 to-gray-200/40 blur-3xl rounded-3xl" />
                <div ref={chatRef} className="relative bg-gray-50 rounded-2xl p-8 shadow-xl border border-gray-200 min-h-[260px]">
                  <div className="space-y-4">
                    {/* Message 1 */}
                    <div
                      className="flex items-start gap-3"
                      style={{ opacity: chatStep >= 1 ? 1 : 0, transform: chatStep >= 1 ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
                    >
                      <svg className="w-6 h-6 text-[#666] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <div className="flex-1 bg-gray-100 rounded-2xl rounded-tl-none p-4">
                        <p className="text-[#333] text-sm">I&apos;ve analyzed your manuscript. Chapter 7 mentions Sarah having blue eyes, but in Chapter 3 they were described as green. Would you like me to show you the exact passages?</p>
                      </div>
                    </div>
                    {/* Message 2 */}
                    <div
                      className="flex items-start gap-3 justify-end"
                      style={{ opacity: chatStep >= 2 ? 1 : 0, transform: chatStep >= 2 ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
                    >
                      <div className="bg-[#111] rounded-2xl rounded-tr-none p-4 max-w-[80%]">
                        <p className="text-white text-sm">Yes, show me the inconsistencies</p>
                      </div>
                    </div>
                    {/* Message 3 */}
                    <div
                      className="flex items-start gap-3"
                      style={{ opacity: chatStep >= 3 ? 1 : 0, transform: chatStep >= 3 ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
                    >
                      <svg className="w-6 h-6 text-[#666] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <div className="flex-1 bg-gray-100 rounded-2xl rounded-tl-none p-4">
                        <p className="text-[#333] text-sm mb-2"><strong>Chapter 3, paragraph 12:</strong></p>
                        <p className="text-[#666] text-sm italic">&ldquo;Her green eyes sparkled in the morning light...&rdquo;</p>
                        <p className="text-[#333] text-sm mt-3 mb-2"><strong>Chapter 7, paragraph 5:</strong></p>
                        <p className="text-[#666] text-sm italic">&ldquo;Sarah&apos;s blue eyes narrowed...&rdquo;</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Testimonials Section — hidden until more reviews collected */}
      {false && <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-[#111]">
              Loved by authors
            </h2>
            <p className="text-xl text-[#666]">
              Hear from writers who use MakeEbook.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="relative max-w-lg w-full rounded-2xl overflow-hidden p-10">
              {/* Neutral gradient background */}
              <div className="absolute inset-0 bg-gray-100" />
              <div className="relative">
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-[#333] mb-8 text-xl italic leading-relaxed">
                  &ldquo;{TESTIMONIALS[0].quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <svg className="w-10 h-10 text-[#666] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-[#111]">{TESTIMONIALS[0].author}</p>
                    <p className="text-sm text-[#666]">{TESTIMONIALS[0].role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>}

      {/* Pricing Section */}
      <section ref={pricingRef} className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-[#111]" style={{ letterSpacing: '-0.04em' }}>
                Simple, transparent pricing
              </h2>
              <p className="text-xl text-[#666]">
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
                {/* Animated border — always on for Pro, hover for others */}
                <div className={`me-card-border absolute -inset-[1px] rounded-2xl pointer-events-none transition-opacity duration-500 ${
                  plan.highlighted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`} />

                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-[#333] border border-gray-200 whitespace-nowrap">
                      Most Popular
                    </span>
                  </div>
                )}
                <div
                  className={`spotlight-card relative rounded-2xl p-8 h-full flex flex-col transition-all duration-300 group-hover:-translate-y-1 ${
                    plan.highlighted
                      ? 'bg-[#111] border border-[#111] shadow-xl'
                      : 'bg-white border border-gray-200 shadow-lg hover:shadow-xl'
                  }`}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    e.currentTarget.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
                    e.currentTarget.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`);
                  }}
                >
                  <h3 className={`text-xl font-semibold mb-2 ${plan.highlighted ? 'text-white' : 'text-[#111]'}`}>{plan.name}</h3>
                  <div className="mb-4">
                    <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-[#111]'}`}>{plan.price}</span>
                    <span className={plan.highlighted ? 'text-gray-400' : 'text-[#555]'}>{plan.period}</span>
                  </div>
                  <p className={`mb-6 ${plan.highlighted ? 'text-gray-300' : 'text-[#666]'}`}>{plan.description}</p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <svg className={`w-5 h-5 flex-shrink-0 ${plan.highlighted ? 'text-gray-400' : 'text-[#666]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className={plan.highlighted ? 'text-gray-200' : 'text-[#333]'}>{feature}</span>
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
                    className={`w-full py-3 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${plan.highlighted ? 'bg-white text-[#111] hover:bg-gray-100' : 'bg-[#111] text-white hover:bg-[#333]'}`}
                  >
                    {plan.checkoutType && checkoutLoading === plan.checkoutType ? 'Redirecting…' : plan.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {/* Background image */}
        <img
          src="/man-mars-hero-bg.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover grayscale"
        />
        {/* Light overlay — matches hero */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 80% at 50% 45%, rgba(242,242,240,0.97) 30%, rgba(242,242,240,0.88) 60%, rgba(242,242,240,0.70) 100%)' }} />
        <FadeIn>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111] mb-6 text-balance" style={{ letterSpacing: '-0.04em' }}>
              Ready to write your book?
            </h2>
            <p className="text-xl text-[#333] mb-10">
              Start creating in seconds. No credit card required.
            </p>
            <div className="me-cta-shine">
              <button
                onClick={user ? onStartWritingAction : () => handleOpenAuth('signup')}
                className="group px-8 py-4 text-lg font-semibold bg-white text-[#111] rounded-full hover:bg-gray-50 transition-colors inline-flex items-center gap-2 shadow-sm"
              >
                Try for free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/make-ebook-logo.svg"
                  alt="MakeEbook"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <span className="font-semibold text-lg text-[#111]">makeEbook</span>
              </div>
              <p className="text-[#666] mb-4 max-w-sm">
                The complete ebook creation tool for authors. Write, edit, and export professional EPUB files.
              </p>
              <p className="text-sm text-[#555]">
                make-ebook is a <a href="https://neilmcardle.com" className="underline hover:text-[#333]">neilmcardle.com</a> company.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[#111]">Product</h4>
              <ul className="space-y-2 text-[#666]">
                <li><button onClick={() => scrollToSection(featuresRef)} className="hover:text-[#111]">Features</button></li>
                <li><button onClick={() => scrollToSection(pricingRef)} className="hover:text-[#111]">Pricing</button></li>
                <li><Link href="/make-ebook/book-mind" className="hover:text-[#111]">Book Mind</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[#111]">Legal</h4>
              <ul className="space-y-2 text-[#666]">
                <li><a href="https://neilmcardle.com/terms" target="_blank" rel="noopener noreferrer" className="hover:text-[#111]">Terms & Conditions</a></li>
                <li><a href="https://neilmcardle.com/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-[#111]">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-[#555]">
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

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onCloseAction={() => setAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </div>
  );
}
