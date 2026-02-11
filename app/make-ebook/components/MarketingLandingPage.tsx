"use client"

import React, { useState, useEffect, useRef } from 'react';
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
  X
} from 'lucide-react';

interface MarketingLandingPageProps {
  onStartWritingAction: () => void;
  libraryCount: number;
}

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Professional EPUB Export',
    description: 'Export publication-ready ePub files that work on Kindle, Apple Books, Kobo, and all major e-readers.'
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
    cta: 'Start Free',
    highlighted: false
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
    cta: 'Get Started',
    highlighted: true
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
    cta: 'Buy Now',
    highlighted: false
  }
];

export default function MarketingLandingPage({ onStartWritingAction, libraryCount }: MarketingLandingPageProps) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const featuresRef = useRef<HTMLElement>(null);
  const pricingRef = useRef<HTMLElement>(null);

  const handleOpenAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Image
                src="/make-ebook-logo.svg"
                alt="MakeEbook"
                width={32}
                height={32}
                className="w-8 h-8 invert"
              />
              <span className="font-semibold text-lg text-white">makeEbook</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection(featuresRef)}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection(pricingRef)}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Pricing
              </button>
              {user ? (
                <div className="flex items-center gap-4">
                  <button
                    onClick={onStartWritingAction}
                    className="text-sm font-medium text-white hover:text-gray-300 transition-colors"
                  >
                    My Books {libraryCount > 0 && `(${libraryCount})`}
                  </button>
                  <button
                    onClick={() => signOut()}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleOpenAuth('signin')}
                    className="text-sm font-medium text-white hover:text-gray-300 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleOpenAuth('signup')}
                    className="px-4 py-2 text-sm font-medium bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 bg-[#0a0a0a]">
            <div className="px-4 py-4 space-y-4">
              <button
                onClick={() => scrollToSection(featuresRef)}
                className="block w-full text-left text-gray-400"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection(pricingRef)}
                className="block w-full text-left text-gray-400"
              >
                Pricing
              </button>
              <div className="pt-4 border-t border-gray-800">
                {user ? (
                  <>
                    <button
                      onClick={() => { onStartWritingAction(); setMobileMenuOpen(false); }}
                      className="block w-full text-left font-medium mb-2 text-white"
                    >
                      My Books {libraryCount > 0 && `(${libraryCount})`}
                    </button>
                    <button
                      onClick={() => { signOut(); setMobileMenuOpen(false); }}
                      className="block w-full text-left text-gray-400"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { handleOpenAuth('signin'); setMobileMenuOpen(false); }}
                      className="block w-full text-left font-medium mb-2 text-white"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => { handleOpenAuth('signup'); setMobileMenuOpen(false); }}
                      className="block w-full text-left text-white"
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
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-[#0a0a0a] to-gray-900" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-40">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-800/50 text-stone-300 text-sm font-medium mb-8 border border-stone-700">
              <Sparkles className="w-4 h-4" />
              AI-Powered Writing Tools
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 text-white text-balance">
              Write your book.
              <br />
              <span className="text-white">
                Publish it beautifully.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto">
              The complete ebook creation tool for authors. Write, edit, and export professional EPUB files in minutes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <button
                onClick={user ? onStartWritingAction : () => handleOpenAuth('signup')}
                className="group w-full sm:w-auto px-8 py-4 text-lg font-semibold bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
              >
                {user ? 'Open Editor' : 'Start Writing Free'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => scrollToSection(pricingRef)}
                className="w-full sm:w-auto px-8 py-4 text-lg font-semibold border-2 border-gray-700 text-white rounded-full hover:border-gray-600 transition-colors"
              >
                View Pricing
              </button>
            </div>

            {/* Trust indicators */}
            <p className="text-sm text-gray-500">
              No credit card required • Free to start • Export unlimited EPUBs
            </p>
          </div>

          {/* Hero Image / Product Preview */}
          <div className="mt-16 lg:mt-24 relative">
            <div className="relative mx-auto max-w-5xl">
              {/* Subtle shadow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-gray-700/20 via-gray-600/20 to-gray-700/20 blur-3xl rounded-3xl" />
              
              {/* Screenshot container */}
              <div className="relative bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 border-b border-gray-700">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                </div>
                
                {/* App preview - Desktop */}
                <div className="relative w-full hidden sm:block">
                  <Image
                    src="/make-ebook-editor-preview.png"
                    alt="MakeEbook Editor Interface"
                    width={1920}
                    height={1200}
                    className="w-full h-auto"
                    priority
                  />
                </div>
                
                {/* App preview - Mobile */}
                <div className="relative w-full block sm:hidden">
                  <Image
                    src="/make-ebook-editor-preview-mobile.png"
                    alt="MakeEbook Editor Interface"
                    width={390}
                    height={844}
                    className="w-full h-auto"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-24 lg:py-32 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-white text-balance">
              Everything you need to write your book
            </h2>
            <p className="text-xl text-gray-400">
              Powerful features, simple interface. Focus on your story, not the tools.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <div
                key={index}
                className="relative rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-700/50 overflow-hidden"
              >
                {/* Gradient background - always dark */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#1e2836] via-[#253040] to-[#1a2230] rounded-2xl" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(55,65,81,0.3)_0%,_transparent_70%)]" />

                {/* Content */}
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-gray-800/80 flex items-center justify-center mb-6 border border-gray-600/50">
                    <feature.icon className="w-6 h-6 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-800/50 text-stone-300 text-sm font-medium mb-6 border border-stone-700">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI-Powered
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-white">
                Meet Book Mind, your AI writing companion
              </h2>
              <p className="text-xl text-gray-400 mb-8">
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
                    <svg className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={user ? onStartWritingAction : () => handleOpenAuth('signup')}
                className="inline-flex items-center gap-2 px-6 py-3 font-semibold bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
              >
                Try Book Mind
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-gray-700/20 via-gray-600/20 to-gray-700/20 blur-3xl rounded-3xl" />
              <div className="relative bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <div className="flex-1 bg-gray-800 rounded-2xl rounded-tl-none p-4">
                      <p className="text-gray-300 text-sm">I&apos;ve analyzed your manuscript. Chapter 7 mentions Sarah having blue eyes, but in Chapter 3 they were described as green. Would you like me to show you the exact passages?</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 justify-end">
                    <div className="bg-gray-600 rounded-2xl rounded-tr-none p-4 max-w-[80%]">
                      <p className="text-white text-sm">Yes, show me the inconsistencies</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <div className="flex-1 bg-gray-800 rounded-2xl rounded-tl-none p-4">
                      <p className="text-gray-300 text-sm mb-2"><strong>Chapter 3, paragraph 12:</strong></p>
                      <p className="text-gray-400 text-sm italic">"Her green eyes sparkled in the morning light..."</p>
                      <p className="text-gray-300 text-sm mt-3 mb-2"><strong>Chapter 7, paragraph 5:</strong></p>
                      <p className="text-gray-400 text-sm italic">"Sarah's blue eyes narrowed..."</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-white">
              Loved by authors
            </h2>
            <p className="text-xl text-gray-400">
              Hear from writers who use MakeEbook.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="relative max-w-lg w-full rounded-2xl overflow-hidden p-10">
              {/* Navy gradient background matching 404 style */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1e2836] via-[#253040] to-[#1a2230]" />
              <div className="relative">
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-200 mb-8 text-xl italic leading-relaxed">
                  &ldquo;{TESTIMONIALS[0].quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <svg className="w-10 h-10 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-white">{TESTIMONIALS[0].author}</p>
                    <p className="text-sm text-gray-400">{TESTIMONIALS[0].role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section ref={pricingRef} className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-white">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-400">
              Choose the plan that works for you. Upgrade or downgrade anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PRICING.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl p-8 ${
                  plan.highlighted
                    ? 'bg-white text-gray-900 shadow-xl scale-105'
                    : 'bg-gray-800 border border-gray-700 text-white'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-green-600 text-white text-sm font-semibold rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className={plan.highlighted ? 'text-gray-600' : 'text-gray-500'}>{plan.period}</span>
                </div>
                <p className={`mb-6 ${plan.highlighted ? 'text-gray-600' : 'text-gray-400'}`}>
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg className={`w-5 h-5 flex-shrink-0 ${plan.highlighted ? 'text-gray-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={plan.highlighted ? 'text-gray-700' : 'text-gray-300'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={user ? onStartWritingAction : () => handleOpenAuth('signup')}
                  className={`w-full py-3 rounded-full font-semibold transition-colors ${
                    plan.highlighted
                      ? 'bg-gray-900 text-white hover:bg-gray-800'
                      : 'bg-white text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 text-balance">
            Ready to write your book?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Start creating in seconds. No credit card required.
          </p>
          <button
            onClick={user ? onStartWritingAction : () => handleOpenAuth('signup')}
            className="group px-8 py-4 text-lg font-semibold bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-all inline-flex items-center gap-2"
          >
            Start Writing Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-800 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/make-ebook-logo.svg"
                  alt="MakeEbook"
                  width={32}
                  height={32}
                  className="w-8 h-8 invert"
                />
                <span className="font-semibold text-lg text-white">makeEbook</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-sm">
                The complete ebook creation tool for authors. Write, edit, and export professional EPUB files.
              </p>
              <p className="text-sm text-gray-500">
                make-ebook is a <a href="https://neilmcardle.com" className="underline hover:text-gray-300">neilmcardle.com</a> company.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => scrollToSection(featuresRef)} className="hover:text-white">Features</button></li>
                <li><button onClick={() => scrollToSection(pricingRef)} className="hover:text-white">Pricing</button></li>
                <li><Link href="/make-ebook/book-mind" className="hover:text-white">Book Mind</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/terms" className="hover:text-white">Terms & Conditions</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Neil McArdle. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onCloseAction={() => setAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </div>
  );
}
